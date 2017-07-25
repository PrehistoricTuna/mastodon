# frozen_string_literal: true

class Api::V1::BoothItemsController < Api::BaseController
  respond_to :json

  def show
    cached_code, cached_body = Rails.cache.fetch([self.class, params[:id]]) do
      code, body = BoothApiClient.new.item(params[:id])
      [code, body.to_json]
    end

    if cached_code == 200
      render json: JSON.parse(cached_body)
    else
      not_found
    end
  end
end
