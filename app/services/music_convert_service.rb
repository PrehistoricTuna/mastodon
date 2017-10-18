class MusicConvertService < BaseService
  def call(track)
    music_file = Tempfile.new
    begin
      track.music.copy_to_local_file :original, music_file.path

      image_file = nil
      begin
        if track.video_image.present?
          image_file = Tempfile.new
          track.video_image.copy_to_local_file :original, image_file.path
        end

        musicvideo = open_musicvideo(track, music_file, image_file)

        video_file = Tempfile.new(['music-', '.mp4'])
        begin
          create_mp4 track, music_file, musicvideo, video_file
          video_file
        rescue
          video_file.unlink
          raise
        end
      ensure
        image_file&.unlink
      end
    ensure
      music_file.unlink
    end
  end

  private

  def open_musicvideo(track, music_file, image_file)
    args = [
      Rails.root.join('node_modules', '.bin', 'electron'), 'genmv', '--',
      music_file.path, '--text-alpha', track.video_text_alpha,
      '--text-color', track.video_text_color,
      '--text-title', track.title, '--text-sub', track.artist,
    ]

    if image_file.present?
      args.push '--image', image_file.path
    end

    if track.video_blur_movement_band_top != 0 && track.video_blur_blink_band_top != 0
      args.push(
        '--blur-movement-band-top', track.video_blur_movement_band_top,
        '--blur-movement-band-bottom', track.video_blur_movement_band_bottom,
        '--blur-movement-threshold', track.video_blur_movement_threshold,
        '--blur-blink-band-top', track.video_blur_blink_band_top,
        '--blur-blink-band-bottom', track.video_blur_blink_band_bottom,
        '--blur-blink-threshold', track.video_blur_blink_threshold,
      )
    end

    if track.video_particle_alpha != 0
      args.push(
        '--particle-limit-band-top', track.video_particle_limit_band_top,
        '--particle-limit-band-bottom', track.video_particle_limit_band_bottom,
        '--particle-limit-threshold', track.video_particle_limit_threshold,
        '--particle-alpha', track.video_particle_alpha,
        '--particle-color', track.video_particle_color,
      )
    end

    if track.video_lightleaks_alpha != 0
      args.push '--lightleaks-alpha', track.video_lightleaks_alpha
      args.push '--lightleaks-interval', track.video_lightleaks_interval
    end

    if track.video_spectrum_alpha != 0
      args.push(
        '--spectrum-mode', track.video_spectrum_mode,
        '--spectrum-alpha', track.video_spectrum_alpha,
        '--spectrum-color', track.video_spectrum_color,
      )
    end

    IO.popen args.map(&:to_s)
  end

  def create_mp4(track, music_file, musicvideo, video_file)
    args = [
      '-y', '-i', music_file.path, '-f', 'rawvideo', '-framerate', '30',
      '-pixel_format', 'bgr32', '-video_size', '720x720', '-i', 'pipe:', '-vf',
      'format=yuv420p,vflip', '-ar', '44100', '-metadata',
      "title=#{track.title}", '-metadata', "artist=#{track.artist}",
      video_file.path,
    ]

    Process.waitpid spawn('ffmpeg', *Rails.configuration.x.ffmpeg_options, *args, in: musicvideo)
    raise Mastodon::FFmpegError, $?.inspect unless $?.success?
  end
end
