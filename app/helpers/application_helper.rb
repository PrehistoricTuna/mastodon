# frozen_string_literal: true

module ApplicationHelper
  def active_nav_class(path)
    current_page?(path) ? 'active' : ''
  end

  def show_landing_strip?
    !user_signed_in? && !single_user_mode?
  end

  def open_registrations?
    Setting.open_registrations
  end

  def add_rtl_body_class(other_classes)
    other_classes = "#{other_classes} rtl" if [:ar, :fa, :he].include?(I18n.locale)
    other_classes
  end

  def favicon_path
    env_suffix = Rails.env.production? ? '' : '-dev'
    "/favicon#{env_suffix}.ico"
  end

  def title
    if is_staging?
      "#{site_title} (Staging)"
    elsif Rails.env.production?
      site_title
    else
      "#{site_title} (Dev)"
    end
  end

  private

  def is_staging?
    Rails.env.production? && Socket.gethostname == 'ap-staging'
  rescue
    # FIXME: Socket.gethostname あんまり使わないから。。rescueいらないと思うねんけどね。
    false
  end

  def fa_icon(icon)
    content_tag(:i, nil, class: 'fa ' + icon.split(' ').map { |cl| "fa-#{cl}" }.join(' '))
  end
end
