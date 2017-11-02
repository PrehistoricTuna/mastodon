require 'rails_helper'

RSpec.describe Scheduler::DeleteElasticsearchDocumentsWorker do
  xdescribe '#perform', refresh_elasticsearch: true do
    subject do
      -> { described_class.new.perform }
    end

    let!(:expired_status) { Fabricate(:status, id: 1, visibility: 'public', created_at: described_class::EXPIRE_BEFORE.ago) }
    let!(:latest_status) { Fabricate(:status, id: 2, visibility: 'public') }

    def status_ids
      Status.__elasticsearch__.refresh_index!
      Status.__elasticsearch__.search('*').to_a.map { |result| result.id.to_i }
    end

    it 'delete expired documents from elasticsearch' do
      is_expected.to change {
        status_ids.sort
      }.from([expired_status.id, latest_status.id]).to([latest_status.id])
    end
  end
end
