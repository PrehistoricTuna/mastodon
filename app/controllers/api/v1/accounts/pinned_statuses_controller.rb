# frozen_string_literal: true

class Api::V1::Accounts::PinnedStatusesController < Api::BaseController
  before_action -> { doorkeeper_authorize! :read }
  before_action :set_account

  respond_to :json

  def index
    limit = limit_param(DEFAULT_STATUSES_LIMIT)

    statuses = Status.permitted_for(@account, current_account)
      .where(account: @account)
      .joins(:pinned_status)
      .reorder(nil)
      .merge(PinnedStatus.recent.paginate_by_max_id(limit, params[:max_id], params[:since_id]))
      .preload(:pinned_status)

    @statuses = cache_collection(statuses, Status)
    set_maps(@statuses)

    next_path = api_v1_account_pinned_statuses_url(pagination_params(max_id: @statuses.last.pinned_status.id))  if @statuses.size == limit
    prev_path = api_v1_account_pinned_statuses_url(pagination_params(since_id: @statuses.first.pinned_status.id)) unless @statuses.empty?

    set_pagination_headers(next_path, prev_path)

    render 'api/v1/accounts/statuses/index'
  end

  private

  def pagination_params(core_params)
    params.permit(:limit).merge(core_params)
  end

  def set_account
    @account = Account.find(params[:account_id])
  end
end
