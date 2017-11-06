# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20171101000000) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "account_domain_blocks", id: :serial, force: :cascade do |t|
    t.integer "account_id"
    t.string "domain"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "domain"], name: "index_account_domain_blocks_on_account_id_and_domain", unique: true
  end

  create_table "accounts", id: :serial, force: :cascade do |t|
    t.string "username", default: "", null: false
    t.string "domain"
    t.string "secret", default: "", null: false
    t.text "private_key"
    t.text "public_key", default: "", null: false
    t.string "remote_url", default: "", null: false
    t.string "salmon_url", default: "", null: false
    t.string "hub_url", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "note", default: "", null: false
    t.string "display_name", default: "", null: false
    t.string "uri", default: "", null: false
    t.string "url"
    t.string "avatar_file_name"
    t.string "avatar_content_type"
    t.integer "avatar_file_size"
    t.datetime "avatar_updated_at"
    t.string "header_file_name"
    t.string "header_content_type"
    t.integer "header_file_size"
    t.datetime "header_updated_at"
    t.string "avatar_remote_url"
    t.datetime "subscription_expires_at"
    t.boolean "silenced", default: false, null: false
    t.boolean "suspended", default: false, null: false
    t.boolean "locked", default: false, null: false
    t.string "header_remote_url", default: "", null: false
    t.integer "statuses_count", default: 0, null: false
    t.integer "followers_count", default: 0, null: false
    t.integer "following_count", default: 0, null: false
    t.datetime "last_webfingered_at"
    t.bigint "tracks_count", default: 0, null: false
    t.bigint "albums_count", default: 0, null: false
    t.index "(((setweight(to_tsvector('simple'::regconfig, (display_name)::text), 'A'::\"char\") || setweight(to_tsvector('simple'::regconfig, (username)::text), 'B'::\"char\")) || setweight(to_tsvector('simple'::regconfig, (COALESCE(domain, ''::character varying))::text), 'C'::\"char\")))", name: "search_index", using: :gin
    t.index "lower((username)::text), lower((domain)::text)", name: "index_accounts_on_username_and_domain_lower"
    t.index ["uri"], name: "index_accounts_on_uri"
    t.index ["url"], name: "index_accounts_on_url"
    t.index ["username", "domain"], name: "index_accounts_on_username_and_domain", unique: true
  end

  create_table "album_tracks", id: false, force: :cascade do |t|
    t.bigint "album_id", null: false
    t.bigint "track_id", null: false
    t.decimal "position", null: false
    t.index ["album_id", "position"], name: "index_album_tracks_on_album_id_and_position", unique: true
    t.index ["album_id", "track_id"], name: "index_album_tracks_on_album_id_and_track_id", unique: true
    t.index ["album_id"], name: "index_album_tracks_on_album_id"
    t.index ["track_id"], name: "index_album_tracks_on_track_id"
  end

  create_table "albums", force: :cascade do |t|
    t.string "title", null: false
    t.text "text", default: "", null: false
    t.string "image_file_name"
    t.string "image_content_type"
    t.integer "image_file_size"
    t.datetime "image_updated_at"
  end

  create_table "blocks", id: :serial, force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "target_account_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "target_account_id"], name: "index_blocks_on_account_id_and_target_account_id", unique: true
  end

  create_table "conversation_mutes", id: :serial, force: :cascade do |t|
    t.integer "account_id", null: false
    t.bigint "conversation_id", null: false
    t.index ["account_id", "conversation_id"], name: "index_conversation_mutes_on_account_id_and_conversation_id", unique: true
  end

  create_table "conversations", force: :cascade do |t|
    t.string "uri"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["uri"], name: "index_conversations_on_uri", unique: true
  end

  create_table "domain_blocks", id: :serial, force: :cascade do |t|
    t.string "domain", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "severity", default: 0
    t.boolean "reject_media"
    t.index ["domain"], name: "index_domain_blocks_on_domain", unique: true
  end

  create_table "favourites", id: :serial, force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "status_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "status_id"], name: "index_favourites_on_account_id_and_status_id", unique: true
    t.index ["status_id"], name: "index_favourites_on_status_id"
  end

  create_table "firebase_cloud_messaging_tokens", id: :serial, force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "platform", null: false
    t.string "token", null: false
    t.index ["user_id", "token"], name: "index_firebase_cloud_messaging_tokens_on_user_id_and_token", unique: true
  end

  create_table "follow_requests", id: :serial, force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "target_account_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "target_account_id"], name: "index_follow_requests_on_account_id_and_target_account_id", unique: true
  end

  create_table "follows", id: :serial, force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "target_account_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "target_account_id"], name: "index_follows_on_account_id_and_target_account_id", unique: true
    t.index ["target_account_id"], name: "index_follows_on_target_account_id"
  end

  create_table "imports", id: :serial, force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "type", null: false
    t.boolean "approved"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "data_file_name"
    t.string "data_content_type"
    t.integer "data_file_size"
    t.datetime "data_updated_at"
  end

  create_table "initial_password_usages", id: :serial, force: :cascade do |t|
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_initial_password_usages_on_user_id", unique: true
  end

  create_table "media_attachments", id: :serial, force: :cascade do |t|
    t.bigint "status_id"
    t.string "file_file_name"
    t.string "file_content_type"
    t.integer "file_file_size"
    t.datetime "file_updated_at"
    t.string "remote_url", default: "", null: false
    t.integer "account_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "shortcode"
    t.integer "type", default: 0, null: false
    t.json "file_meta"
    t.json "music_info"
    t.index ["account_id"], name: "index_media_attachments_on_account_id"
    t.index ["shortcode"], name: "index_media_attachments_on_shortcode", unique: true
    t.index ["status_id"], name: "index_media_attachments_on_status_id"
  end

  create_table "mentions", id: :serial, force: :cascade do |t|
    t.integer "account_id"
    t.bigint "status_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "status_id"], name: "index_mentions_on_account_id_and_status_id", unique: true
    t.index ["status_id"], name: "index_mentions_on_status_id"
  end

  create_table "mutes", id: :serial, force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "target_account_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "target_account_id"], name: "index_mutes_on_account_id_and_target_account_id", unique: true
  end

  create_table "notifications", id: :serial, force: :cascade do |t|
    t.integer "account_id"
    t.bigint "activity_id"
    t.string "activity_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "from_account_id"
    t.index ["account_id", "activity_id", "activity_type"], name: "account_activity", unique: true
    t.index ["activity_id", "activity_type"], name: "index_notifications_on_activity_id_and_activity_type"
  end

  create_table "oauth_access_grants", id: :serial, force: :cascade do |t|
    t.integer "resource_owner_id", null: false
    t.integer "application_id", null: false
    t.string "token", null: false
    t.integer "expires_in", null: false
    t.text "redirect_uri", null: false
    t.datetime "created_at", null: false
    t.datetime "revoked_at"
    t.string "scopes"
    t.index ["token"], name: "index_oauth_access_grants_on_token", unique: true
  end

  create_table "oauth_access_tokens", id: :serial, force: :cascade do |t|
    t.integer "resource_owner_id"
    t.integer "application_id"
    t.string "token", null: false
    t.string "refresh_token"
    t.integer "expires_in"
    t.datetime "revoked_at"
    t.datetime "created_at", null: false
    t.string "scopes"
    t.index ["refresh_token"], name: "index_oauth_access_tokens_on_refresh_token", unique: true
    t.index ["resource_owner_id"], name: "index_oauth_access_tokens_on_resource_owner_id"
    t.index ["token"], name: "index_oauth_access_tokens_on_token", unique: true
  end

  create_table "oauth_applications", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.string "uid", null: false
    t.string "secret", null: false
    t.text "redirect_uri", null: false
    t.string "scopes", default: "", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean "superapp", default: false, null: false
    t.string "website"
    t.index ["uid"], name: "index_oauth_applications_on_uid", unique: true
  end

  create_table "oauth_authentications", id: :serial, force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "provider", null: false
    t.string "uid", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["provider", "uid"], name: "index_oauth_authentications_on_provider_and_uid", unique: true
    t.index ["user_id", "provider"], name: "index_oauth_authentications_on_user_id_and_provider", unique: true
  end

  create_table "pinned_statuses", id: :serial, force: :cascade do |t|
    t.integer "account_id", null: false
    t.bigint "status_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "status_id"], name: "index_pinned_statuses_on_account_id_and_status_id", unique: true
    t.index ["status_id"], name: "index_pinned_statuses_on_status_id"
  end

  create_table "pixiv_cards", id: :serial, force: :cascade do |t|
    t.integer "status_id", null: false
    t.string "url", null: false
    t.string "image_url"
    t.index ["status_id"], name: "index_pixiv_cards_on_status_id"
  end

  create_table "playlist_logs", id: :serial, force: :cascade do |t|
    t.string "uuid", null: false
    t.integer "deck", null: false
    t.string "info", default: "", null: false
    t.string "link", null: false
    t.integer "account_id", null: false
    t.datetime "started_at"
    t.integer "skipped_account_id"
    t.datetime "skipped_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["uuid"], name: "index_playlist_logs_on_uuid", unique: true
  end

  create_table "playlists", id: :serial, force: :cascade do |t|
    t.integer "deck", null: false
    t.string "name", default: "", null: false
    t.integer "deck_type", default: 0, null: false
    t.boolean "write_protect", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["deck"], name: "index_playlists_on_deck", unique: true
  end

  create_table "preview_cards", id: :serial, force: :cascade do |t|
    t.bigint "status_id"
    t.string "url", default: "", null: false
    t.string "title"
    t.string "description"
    t.string "image_file_name"
    t.string "image_content_type"
    t.integer "image_file_size"
    t.datetime "image_updated_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "type", default: 0, null: false
    t.text "html", default: "", null: false
    t.string "author_name", default: "", null: false
    t.string "author_url", default: "", null: false
    t.string "provider_name", default: "", null: false
    t.string "provider_url", default: "", null: false
    t.integer "width", default: 0, null: false
    t.integer "height", default: 0, null: false
    t.index ["status_id"], name: "index_preview_cards_on_status_id", unique: true
  end

  create_table "reports", id: :serial, force: :cascade do |t|
    t.integer "account_id", null: false
    t.integer "target_account_id", null: false
    t.bigint "status_ids", default: [], null: false, array: true
    t.text "comment", default: "", null: false
    t.boolean "action_taken", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "action_taken_by_account_id"
    t.index ["account_id"], name: "index_reports_on_account_id"
    t.index ["target_account_id"], name: "index_reports_on_target_account_id"
  end

  create_table "session_activations", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "session_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "user_agent", default: "", null: false
    t.inet "ip"
    t.integer "access_token_id"
    t.index ["session_id"], name: "index_session_activations_on_session_id", unique: true
    t.index ["user_id"], name: "index_session_activations_on_user_id"
  end

  create_table "settings", id: :serial, force: :cascade do |t|
    t.string "var", null: false
    t.text "value"
    t.string "thing_type"
    t.integer "thing_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["thing_type", "thing_id", "var"], name: "index_settings_on_thing_type_and_thing_id_and_var", unique: true
  end

  create_table "statuses", force: :cascade do |t|
    t.string "uri"
    t.integer "account_id", null: false
    t.text "text", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "in_reply_to_id"
    t.bigint "reblog_of_id"
    t.string "url"
    t.boolean "sensitive", default: false
    t.integer "visibility", default: 0, null: false
    t.integer "in_reply_to_account_id"
    t.integer "application_id"
    t.text "spoiler_text", default: "", null: false
    t.boolean "reply", default: false
    t.integer "favourites_count", default: 0, null: false
    t.integer "reblogs_count", default: 0, null: false
    t.string "language"
    t.bigint "conversation_id"
    t.string "music_type"
    t.bigint "music_id"
    t.index ["account_id", "id"], name: "index_statuses_on_account_id_id"
    t.index ["conversation_id"], name: "index_statuses_on_conversation_id"
    t.index ["in_reply_to_id"], name: "index_statuses_on_in_reply_to_id"
    t.index ["music_type", "account_id"], name: "index_statuses_on_music_type_and_account_id"
    t.index ["music_type", "id"], name: "index_statuses_on_music_type_and_id"
    t.index ["reblog_of_id", "music_type", "music_id"], name: "index_statuses_on_reblog_of_id_and_music_type_and_music_id"
    t.index ["uri"], name: "index_statuses_on_uri", unique: true
  end

  create_table "statuses_tags", id: false, force: :cascade do |t|
    t.bigint "status_id", null: false
    t.integer "tag_id", null: false
    t.index ["status_id"], name: "index_statuses_tags_on_status_id"
    t.index ["tag_id", "status_id"], name: "index_statuses_tags_on_tag_id_and_status_id", unique: true
  end

  create_table "stream_entries", id: :serial, force: :cascade do |t|
    t.integer "account_id"
    t.bigint "activity_id"
    t.string "activity_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "hidden", default: false, null: false
    t.index ["account_id"], name: "index_stream_entries_on_account_id"
    t.index ["activity_id", "activity_type"], name: "index_stream_entries_on_activity_id_and_activity_type"
  end

  create_table "subscriptions", id: :serial, force: :cascade do |t|
    t.string "callback_url", default: "", null: false
    t.string "secret"
    t.datetime "expires_at"
    t.boolean "confirmed", default: false, null: false
    t.integer "account_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "last_successful_delivery_at"
    t.string "domain"
    t.index ["account_id", "callback_url"], name: "index_subscriptions_on_account_id_and_callback_url", unique: true
  end

  create_table "suggestion_tags", id: :serial, force: :cascade do |t|
    t.integer "tag_id", null: false
    t.integer "order", default: 1, null: false
    t.string "description", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tag_id"], name: "index_suggestion_tags_on_tag_id", unique: true
  end

  create_table "tags", id: :serial, force: :cascade do |t|
    t.string "name", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "name text_pattern_ops", name: "hashtag_search_index"
    t.index ["name"], name: "index_tags_on_name", unique: true
  end

  create_table "tracks", force: :cascade do |t|
    t.integer "duration", null: false
    t.string "title", null: false
    t.string "artist", null: false
    t.string "text", default: "", null: false
    t.string "music_file_name"
    t.string "music_content_type"
    t.integer "music_file_size"
    t.datetime "music_updated_at"
    t.string "video_file_name"
    t.string "video_content_type"
    t.integer "video_file_size"
    t.datetime "video_updated_at"
    t.string "video_image_file_name"
    t.string "video_image_content_type"
    t.integer "video_image_file_size"
    t.datetime "video_image_updated_at"
    t.integer "video_blur_movement_band_bottom", default: 0, null: false
    t.integer "video_blur_movement_band_top", default: 0, null: false
    t.integer "video_blur_movement_threshold", default: 0, null: false
    t.integer "video_blur_blink_band_bottom", default: 0, null: false
    t.integer "video_blur_blink_band_top", default: 0, null: false
    t.integer "video_blur_blink_threshold", default: 0, null: false
    t.integer "video_particle_limit_band_bottom", default: 0, null: false
    t.integer "video_particle_limit_band_top", default: 0, null: false
    t.integer "video_particle_limit_threshold", default: 0, null: false
    t.float "video_particle_alpha", default: 0.0, null: false
    t.integer "video_particle_color", default: 0, null: false
    t.float "video_lightleaks_alpha", default: 0.0, null: false
    t.integer "video_lightleaks_interval", default: 0, null: false
    t.integer "video_spectrum_mode", default: 0, null: false
    t.float "video_spectrum_alpha", default: 0.0, null: false
    t.integer "video_spectrum_color", default: 0, null: false
    t.float "video_text_alpha", default: 0.0, null: false
    t.integer "video_text_color", default: 0, null: false
    t.integer "view_count", default: 0, null: false
    t.string "video_1920x1080_file_name"
    t.string "video_1920x1080_content_type"
    t.integer "video_1920x1080_file_size"
    t.datetime "video_1920x1080_updated_at"
    t.integer "video_backgroundcolor", default: 1513239, null: false
    t.float "video_banner_alpha", default: 1.0, null: false
  end

  create_table "trend_ng_words", id: :serial, force: :cascade do |t|
    t.string "word", default: "", null: false
    t.string "memo", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["word"], name: "index_trend_ng_words_on_word", unique: true
  end

  create_table "users", id: :serial, force: :cascade do |t|
    t.string "email", default: "", null: false
    t.integer "account_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.boolean "admin", default: false
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.string "locale"
    t.string "encrypted_otp_secret"
    t.string "encrypted_otp_secret_iv"
    t.string "encrypted_otp_secret_salt"
    t.integer "consumed_timestep"
    t.boolean "otp_required_for_login"
    t.datetime "last_emailed_at"
    t.string "otp_backup_codes", array: true
    t.string "filtered_languages", default: [], null: false, array: true
    t.index ["account_id"], name: "index_users_on_account_id"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["filtered_languages"], name: "index_users_on_filtered_languages", using: :gin
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "video_preparation_errors", force: :cascade do |t|
    t.bigint "track_id", null: false
    t.index ["track_id"], name: "index_video_preparation_errors_on_track_id"
  end

  create_table "web_settings", id: :serial, force: :cascade do |t|
    t.integer "user_id"
    t.json "data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_web_settings_on_user_id", unique: true
  end

  add_foreign_key "account_domain_blocks", "accounts", on_delete: :cascade
  add_foreign_key "album_tracks", "albums", on_update: :cascade, on_delete: :cascade
  add_foreign_key "album_tracks", "tracks", on_update: :cascade, on_delete: :cascade
  add_foreign_key "blocks", "accounts", column: "target_account_id", on_delete: :cascade
  add_foreign_key "blocks", "accounts", on_delete: :cascade
  add_foreign_key "conversation_mutes", "accounts", on_delete: :cascade
  add_foreign_key "conversation_mutes", "conversations", on_delete: :cascade
  add_foreign_key "favourites", "accounts", on_delete: :cascade
  add_foreign_key "favourites", "statuses", on_delete: :cascade
  add_foreign_key "follow_requests", "accounts", column: "target_account_id", on_delete: :cascade
  add_foreign_key "follow_requests", "accounts", on_delete: :cascade
  add_foreign_key "follows", "accounts", column: "target_account_id", on_delete: :cascade
  add_foreign_key "follows", "accounts", on_delete: :cascade
  add_foreign_key "imports", "accounts", on_delete: :cascade
  add_foreign_key "media_attachments", "accounts", on_delete: :nullify
  add_foreign_key "media_attachments", "statuses", on_delete: :nullify
  add_foreign_key "mentions", "accounts", on_delete: :cascade
  add_foreign_key "mentions", "statuses", on_delete: :cascade
  add_foreign_key "mutes", "accounts", column: "target_account_id", on_delete: :cascade
  add_foreign_key "mutes", "accounts", on_delete: :cascade
  add_foreign_key "notifications", "accounts", column: "from_account_id", on_delete: :cascade
  add_foreign_key "notifications", "accounts", on_delete: :cascade
  add_foreign_key "oauth_access_grants", "oauth_applications", column: "application_id", on_delete: :cascade
  add_foreign_key "oauth_access_grants", "users", column: "resource_owner_id", on_delete: :cascade
  add_foreign_key "oauth_access_tokens", "oauth_applications", column: "application_id", on_delete: :cascade
  add_foreign_key "oauth_access_tokens", "users", column: "resource_owner_id", on_delete: :cascade
  add_foreign_key "pinned_statuses", "accounts"
  add_foreign_key "pinned_statuses", "statuses"
  add_foreign_key "preview_cards", "statuses", on_delete: :cascade
  add_foreign_key "reports", "accounts", column: "action_taken_by_account_id", on_delete: :nullify
  add_foreign_key "reports", "accounts", column: "target_account_id", on_delete: :cascade
  add_foreign_key "reports", "accounts", on_delete: :cascade
  add_foreign_key "session_activations", "oauth_access_tokens", column: "access_token_id", on_delete: :cascade
  add_foreign_key "session_activations", "users", on_delete: :cascade
  add_foreign_key "statuses", "accounts", column: "in_reply_to_account_id", on_delete: :nullify
  add_foreign_key "statuses", "accounts", on_delete: :cascade
  add_foreign_key "statuses", "statuses", column: "in_reply_to_id", on_delete: :nullify
  add_foreign_key "statuses", "statuses", column: "reblog_of_id", on_delete: :cascade
  add_foreign_key "statuses_tags", "statuses", on_delete: :cascade
  add_foreign_key "statuses_tags", "tags", on_delete: :cascade
  add_foreign_key "stream_entries", "accounts", on_delete: :cascade
  add_foreign_key "subscriptions", "accounts", on_delete: :cascade
  add_foreign_key "users", "accounts", on_delete: :cascade
  add_foreign_key "video_preparation_errors", "tracks", on_update: :cascade, on_delete: :cascade
  add_foreign_key "web_settings", "users", on_delete: :cascade
end
