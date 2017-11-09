# frozen_string_literal: true

namespace :pawoo do
  namespace :maintenance do
    desc 'Update counter caches'
    task migrate_from_pinned_status_to_status_pin: :environment do
      Rails.logger.debug 'Migrating from PinnedStatus to StatusPin...'

      PinnedStatus.order(:id).find_each do |pinned_status|
        StatusPin.create(
          account_id: pinned_status.account_id,
          status_id: pinned_status.status_id,
          created_at: pinned_status.created_at,
          updated_at: pinned_status.updated_at
        )
      end

      Rails.logger.debug 'Done!'
    end
  end
end
