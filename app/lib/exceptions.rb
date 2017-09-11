# frozen_string_literal: true

module Mastodon
  class Error < StandardError; end
  class NotPermittedError < Error; end
  class ValidationError < Error; end
  class RaceConditionError < Error; end
  class MusicSourceNotFoundError < Error; end
  class MusicSourceForbiddenError < Error; end
  class MusicSourceFetchFailedError < Error; end
  class PlayerControlLimitError < Error; end
  class PlayerControlSkipLimitTimeError < Error; end
  class PlaylistWriteProtectionError < Error; end
  class PlaylistSizeOverError < Error; end
  class PlaylistItemNotFoundError < Error; end
  class RedisMaxRetryError < Error; end
  class TrackNotFoundError < Error; end

  class UnexpectedResponseError < Error
    def initialize(response = nil)
      @response = response
    end

    def to_s
      "#{@response.uri} returned code #{@response.code}"
    end
  end
end
