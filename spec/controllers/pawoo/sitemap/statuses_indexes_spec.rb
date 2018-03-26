# frozen_string_literal: true

require 'rails_helper'

describe Pawoo::Sitemap::StatusIndexesController, type: :controller do
  before do
    stub_const 'Pawoo::Sitemap::SITEMAPINDEX_SIZE', 1
  end

  let!(:status) { Fabricate(:status, reblogs_count: 5) }

  describe 'GET #index' do
    it 'renders sitemap' do
      get :index, format: 'xml'

      expect(response).to have_http_status(:success)
    end
  end

  describe 'GET #show' do
    let(:page) { status.stream_entry.id }

    it 'renders sitemap' do
      get :show, params: { page: page }, format: 'xml'

      expect(response).to have_http_status(:success)
    end

    it 'assigns @status_pages' do
      get :show, params: { page: page }, format: 'xml'

      expect(assigns(:status_pages).first.id).to eq status.id
    end
  end
end
