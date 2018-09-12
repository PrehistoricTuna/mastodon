# frozen_string_literal: true

SimpleNavigation::Configuration.run do |navigation|
  navigation.items do |primary|
    primary.item :web, safe_join([fa_icon('chevron-left fw'), t('settings.back')]), root_url

    primary.item :settings, safe_join([fa_icon('cog fw'), t('settings.settings')]), settings_profile_url do |settings|
      settings.item :profile, safe_join([fa_icon('user fw'), t('settings.edit_profile')]), settings_profile_url
      settings.item :custom_color, safe_join([fa_icon('eyedropper fw'), t('settings.custom_color')]), settings_custom_color_url
      settings.item :preferences, safe_join([fa_icon('sliders fw'), t('settings.preferences')]), settings_preferences_url
      settings.item :password, safe_join([fa_icon('lock fw'), t('auth.change_password')]), edit_user_registration_url, highlights_on: %r{/auth/edit|/settings/delete}
      settings.item :timeline, safe_join([fa_icon('globe fw'), t('settings.timeline')]), settings_timeline_url
      settings.item :follow_requests, safe_join([fa_icon('users fw'), t('settings.follow_requests')]), settings_follow_requests_url
      settings.item :mutes, safe_join([fa_icon('volume-off fw'), t('settings.muted_users')]), settings_mutes_url
      settings.item :blocks, safe_join([fa_icon('ban fw'), t('settings.blocked_users')]), settings_blocks_url
      settings.item :two_factor_authentication, safe_join([fa_icon('mobile fw'), t('settings.two_factor_authentication')]), settings_two_factor_authentication_url, highlights_on: %r{/settings/two_factor_authentication}
      settings.item :import, safe_join([fa_icon('cloud-upload fw'), t('settings.import')]), settings_import_url
      settings.item :export, safe_join([fa_icon('cloud-download fw'), t('settings.export')]), settings_export_url
      settings.item :authorized_apps, safe_join([fa_icon('list fw'), t('settings.authorized_apps')]), oauth_authorized_applications_url
      settings.item :follower_domains, safe_join([fa_icon('users fw'), t('settings.followers')]), settings_follower_domains_url
      settings.item :oauth_authentications, safe_join([fa_icon('list fw'), t('settings.oauth_authentications')]), settings_oauth_authentications_url
    end

    primary.item :development, safe_join([fa_icon('code fw'), t('settings.development')]), settings_applications_url do |development|
      development.item :your_apps, safe_join([fa_icon('list fw'), t('settings.your_apps')]), settings_applications_url, highlights_on: %r{/settings/applications}
    end

    primary.item :admin, safe_join([fa_icon('cogs fw'), t('admin.title')]), admin_reports_url, if: proc { current_user.admin? } do |admin|
      admin.item :suggestion_tags, safe_join([fa_icon('tags fw'), t('admin.suggestion.title')]), admin_suggestion_tags_url, highlights_on: %r{/admin/suggestion_tags}
      admin.item :scheduled_statuses, safe_join([fa_icon('clock-o fw'), t('admin.scheduled_statuses.title')]), admin_scheduled_statuses_url, highlights_on: %r{/admin/scheduled_statuses}
      admin.item :trend_ng_words, safe_join([fa_icon('ban fw'), t('admin.trend_ng_word.title')]), admin_trend_ng_words_url, highlights_on: %r{/admin/trend_ng_words}
      admin.item :reports, safe_join([fa_icon('flag fw'), t('admin.reports.title')]), admin_reports_url, highlights_on: %r{/admin/reports}
      admin.item :accounts, safe_join([fa_icon('users fw'), t('admin.accounts.title')]), admin_accounts_url, highlights_on: %r{/admin/accounts}
      admin.item :instances, safe_join([fa_icon('cloud fw'), t('admin.instances.title')]), admin_instances_url, highlights_on: %r{/admin/instances}
      admin.item :subscriptions, safe_join([fa_icon('paper-plane-o fw'), t('admin.subscriptions.title')]), admin_subscriptions_url
      admin.item :domain_blocks, safe_join([fa_icon('lock fw'), t('admin.domain_blocks.title')]), admin_domain_blocks_url, highlights_on: %r{/admin/domain_blocks}
      admin.item :sidekiq, safe_join([fa_icon('diamond fw'), 'Sidekiq']), sidekiq_url, link_html: { target: 'sidekiq' }
      admin.item :pghero, safe_join([fa_icon('database fw'), 'PgHero']), pghero_url, link_html: { target: 'pghero' }
      admin.item :settings, safe_join([fa_icon('cogs fw'), t('admin.settings.title')]), edit_admin_settings_url
    end

    primary.item :logout, safe_join([fa_icon('sign-out fw'), t('auth.logout')]), destroy_user_session_url, link_html: { 'data-method' => 'delete' }
  end
end
