# frozen_string_literal: true

require 'singleton'

class FeedManager
  include Singleton

  MAX_ITEMS = 400

  # An approximation of the number of statuses per 14 days
  MIN_ID_RANGE = 2_097_152

  def key(type, id)
    "feed:#{type}:#{id}"
  end

  def filter?(timeline_type, status, receiver_id)
    if timeline_type == :home
      filter_from_home?(status, receiver_id)
    elsif timeline_type == :mentions
      filter_from_mentions?(status, receiver_id)
    else
      false
    end
  end

  def push(timeline_type, accounts, status)
    accounts = Array.wrap(accounts)
    accounts = accounts.select do |account|
      insert_and_check(timeline_type, status, account)
    end

    PushUpdateWorker.perform_async(accounts.map(&:id), status.id) unless accounts.empty?
  end

  def insert_and_check(timeline_type, status, account)
    if status.reblog&.music.present? || status.music.present?
      insert_music timeline_type, status, account
    end

    timeline_key = key(timeline_type, account.id)

    if status.reblog?
      # If the original status is within 40 statuses from top, do not re-insert it into the feed
      rank = redis.zrevrank(timeline_key, status.reblog_of_id)
      return if !rank.nil? && rank < 40
      redis.zadd(timeline_key, status.id, status.reblog_of_id)
    else
      redis.zadd(timeline_key, status.id, status.id)
      trim(timeline_type, account.id)
    end

    push_update_required?(timeline_type, account.id)
  end

  def trim(type, account_id)
    redis.zremrangebyrank(key(type, account_id), '0', (-(FeedManager::MAX_ITEMS + 1)).to_s)
  end

  def push_update_required?(timeline_type, account_id)
    timeline_type != :home || redis.get("subscribed:timeline:#{account_id}").present?
  end

  def merge_into_timeline(from_account, into_account)
    merge_into_music_timeline from_account, into_account

    timeline_key = key(:home, into_account.id)
    query        = from_account.statuses.published.limit(FeedManager::MAX_ITEMS / 4)

    if redis.zcard(timeline_key) >= FeedManager::MAX_ITEMS / 4
      oldest_home_score = redis.zrange(timeline_key, 0, 0, with_scores: true)&.first&.last&.to_i || 0
      query = query.where('id > ?', oldest_home_score)
    end

    redis.pipelined do
      query.each do |status|
        next if status.direct_visibility? || filter?(:home, status, into_account)
        redis.zadd(timeline_key, status.id, status.id)
      end
    end

    trim(:home, into_account.id)
  end

  def unmerge_from_timeline(from_account, into_account)
    unmerge_from_music_timeline from_account, into_account

    timeline_key = key(:home, into_account.id)
    oldest_home_score = redis.zrange(timeline_key, 0, 0, with_scores: true)&.first&.last&.to_i || 0

    from_account.statuses.published.select('id').where('id > ?', oldest_home_score).reorder(nil).find_in_batches do |statuses|
      redis.pipelined do
        statuses.each do |status|
          redis.zrem(timeline_key, status.id)
          redis.zremrangebyscore(timeline_key, status.id, status.id)
        end
      end
    end
  end

  def clear_from_timeline(account, target_account)
    clear_from_music_timeline account, target_account

    timeline_key = key(:home, account.id)
    timeline_status_ids = redis.zrange(timeline_key, 0, -1)
    target_status_ids = Status.where(id: timeline_status_ids, account: target_account).ids

    redis.zrem(timeline_key, target_status_ids) if target_status_ids.present?
  end

  def music_key(type, id)
    "feed:music:#{type}:#{id}"
  end

  def trim_music(type, account_id)
    redis.zremrangebyrank(music_key(type, account_id), '0', (-(FeedManager::MAX_ITEMS + 1)).to_s)
  end

  private

  def redis
    Redis.current
  end

  def insert_music(timeline_type, status, account)
    timeline_key = music_key(timeline_type, account.id)

    if status.reblog?
      # If the original status is within 40 statuses from top, do not re-insert it into the feed
      rank = redis.zrevrank(timeline_key, status.reblog_of_id)
      return if !rank.nil? && rank < 40
      redis.zadd(timeline_key, status.id, status.reblog_of_id)
    else
      redis.zadd(timeline_key, status.id, status.id)
      trim_music(timeline_type, account.id)
    end
  end

  def merge_into_music_timeline(from_account, into_account)
    timeline_key = music_key(:home, into_account.id)
    query        = from_account.statuses.musics_only.limit(FeedManager::MAX_ITEMS / 4)

    if redis.zcard(timeline_key) >= FeedManager::MAX_ITEMS / 4
      oldest_home_score = redis.zrange(timeline_key, 0, 0, with_scores: true)&.first&.last&.to_i || 0
      query = query.where('id > ?', oldest_home_score)
    end

    redis.pipelined do
      query.each do |status|
        next if status.direct_visibility? || filter?(:home, status, into_account)
        redis.zadd(timeline_key, status.id, status.id)
      end
    end

    trim_music(:home, into_account.id)
  end

  def unmerge_from_music_timeline(from_account, into_account)
    timeline_key = music_key(:home, into_account.id)
    oldest_home_score = redis.zrange(timeline_key, 0, 0, with_scores: true)&.first&.last&.to_i || 0

    from_account.statuses.select('id').where('id > ?', oldest_home_score).musics_only.reorder(nil).find_in_batches do |statuses|
      redis.pipelined do
        statuses.each do |status|
          redis.zrem(timeline_key, status.id)
          redis.zremrangebyscore(timeline_key, status.id, status.id)
        end
      end
    end
  end

  def clear_from_music_timeline(account, target_account)
    timeline_key = music_key(:home, account.id)
    timeline_status_ids = redis.zrange(timeline_key, 0, -1)
    target_status_ids = Status.where(id: timeline_status_ids, account: target_account).ids

    redis.zrem(timeline_key, target_status_ids) if target_status_ids.present?
  end

  def filter_from_home?(status, receiver_id)
    return true if status.reply? && (status.in_reply_to_id.nil? || status.in_reply_to_account_id.nil?)

    check_for_mutes = [status.account_id]
    check_for_mutes.concat([status.reblog.account_id]) if status.reblog?

    return true if Mute.where(account_id: receiver_id, target_account_id: check_for_mutes).any?

    check_for_blocks = status.mentions.pluck(:account_id)
    check_for_blocks.concat([status.reblog.account_id]) if status.reblog?

    return true if Block.where(account_id: receiver_id, target_account_id: check_for_blocks).any?

    if status.reply? && !status.in_reply_to_account_id.nil?                                                              # Filter out if it's a reply
      should_filter   = !Follow.where(account_id: receiver_id, target_account_id: status.in_reply_to_account_id).exists? # and I'm not following the person it's a reply to
      should_filter &&= receiver_id != status.in_reply_to_account_id                                                     # and it's not a reply to me
      should_filter &&= status.account_id != status.in_reply_to_account_id                                               # and it's not a self-reply
      return should_filter
    elsif status.reblog?                                                                                                 # Filter out a reblog
      should_filter   = Block.where(account_id: status.reblog.account_id, target_account_id: receiver_id).exists?        # or if the author of the reblogged status is blocking me
      should_filter ||= AccountDomainBlock.where(account_id: receiver_id, domain: status.reblog.account.domain).exists?  # or the author's domain is blocked
      return should_filter
    end

    false
  end

  def filter_from_mentions?(status, receiver_id)
    return true if receiver_id == status.account_id

    check_for_blocks = [status.account_id]
    check_for_blocks.concat(status.mentions.pluck(:account_id))
    check_for_blocks.concat([status.in_reply_to_account]) if status.reply? && !status.in_reply_to_account_id.nil?

    should_filter   = Block.where(account_id: receiver_id, target_account_id: check_for_blocks).any?                                     # Filter if it's from someone I blocked, in reply to someone I blocked, or mentioning someone I blocked
    should_filter ||= (status.account.silenced? && !Follow.where(account_id: receiver_id, target_account_id: status.account_id).exists?) # of if the account is silenced and I'm not following them

    should_filter
  end
end
