# frozen_string_literal: true
# == Schema Information
#
# Table name: album_music_attachments
#
#  id                  :integer          not null, primary key
#  album_id            :integer          not null
#  music_attachment_id :integer          not null
#  position            :decimal(, )      not null
#

class AlbumMusicAttachment < ApplicationRecord
  belongs_to :album, inverse_of: :album_music_attachments
  belongs_to :music_attachment, inverse_of: :album_music_attachments

  MIN_POSITION = BigDecimal(0)
  MAX_POSITION = BigDecimal(1)

  def self.position_between(previous_position, next_position)
    middle_distance = (next_position - previous_position) / 2
    middle = previous_position + middle_distance

    candidate = middle.round(-middle_distance.exponent)
    if candidate < next_position && candidate > previous_position
      candidate
    else
      middle.round(-middle_distance.exponent + 1)
    end
  end
end
