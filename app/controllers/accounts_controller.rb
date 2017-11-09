# frozen_string_literal: true

class AccountsController < ApplicationController
  include AccountControllerConcern
  include SignatureVerification

  helper_method :next_url, :prev_url

  def show
    respond_to do |format|
      format.html do
        set_initial_state_json
      end

      format.atom do
        raise ActiveRecord::RecordNotFound unless @account.local?

        @entries = @account.stream_entries.where(hidden: false).with_includes.paginate_by_max_id(20, params[:max_id], params[:since_id])
        render xml: OStatus::AtomSerializer.render(OStatus::AtomSerializer.new.feed(@account, @entries.reject { |entry| entry.status.nil? }))
      end

      format.json do
        render json: @account, serializer: ActivityPub::ActorSerializer, adapter: ActivityPub::Adapter, content_type: 'application/activity+json'
      end
    end
  end

  private

  def show_pinned_statuses?
    [replies_requested?, media_requested?, params[:max_id].present?, params[:since_id].present?].none?
  end

  def filtered_statuses
    default_statuses.tap do |statuses|
      statuses.merge!(only_media_scope) if media_requested?
      statuses.merge!(no_replies_scope) unless replies_requested?
    end
  end

  def default_statuses
    @account.statuses.where(visibility: [:public, :unlisted]).published
  end

  def statuses_from_pinned_status
    @statuses_from_pinned_status ||= @account.pinned_statuses.published
  end

  def only_media_scope
    Status.where(id: account_media_status_ids)
  end

  def account_media_status_ids
    @account.media_attachments.attached.reorder(nil).select(:status_id).distinct
  end

  def no_replies_scope
    Status.without_replies
  end

  def set_account
    username, domain = (params[:username] || '').split('@')
    @account = Account.find_by!(username: username, domain: domain)
  end

  def next_url
    next_page = @statuses.current_page + 1

    if media_requested?
      short_account_media_url(@account, page: next_page)
    elsif replies_requested?
      short_account_with_replies_url(@account, page: next_page)
    else
      short_account_url(@account, page: next_page)
    end
  end

  def prev_url
    prev_page = @statuses.current_page - 1
    prev_page = nil if prev_page == 1

    if media_requested?
      short_account_media_url(@account, page: prev_page)
    elsif replies_requested?
      short_account_with_replies_url(@account, page: prev_page)
    else
      short_account_url(@account, page: prev_page)
    end
  end

  def media_requested?
    request.path.ends_with?('/media')
  end

  def replies_requested?
    request.path.ends_with?('/with_replies')
  end
end
