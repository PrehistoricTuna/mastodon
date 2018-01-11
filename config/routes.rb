# frozen_string_literal: true

require 'sidekiq/web'
require 'sidekiq-scheduler/web'

Sidekiq::Web.set :session_secret, Rails.application.secrets[:secret_key_base]

Rails.application.routes.draw do
  mount LetterOpenerWeb::Engine, at: 'letter_opener' if Rails.env.development?

  authenticate :user, lambda { |u| u.admin? } do
    mount Sidekiq::Web, at: 'sidekiq', as: :sidekiq
    mount PgHero::Engine, at: 'pghero', as: :pghero
  end

  use_doorkeeper do
    controllers authorizations: 'oauth/authorizations', authorized_applications: 'oauth/authorized_applications'
  end

  get '.well-known/host-meta', to: 'well_known/host_meta#show', as: :host_meta, defaults: { format: 'xml' }
  get '.well-known/webfinger', to: 'well_known/webfinger#show', as: :webfinger
  get 'manifest', to: 'manifests#show', defaults: { format: 'json' }
  get 'intent', to: 'intents#show'

  devise_for :users, path: 'auth', controllers: {
    sessions:           'auth/sessions',
    registrations:      'auth/registrations',
    passwords:          'auth/passwords',
    confirmations:      'auth/confirmations',
    omniauth_callbacks: 'auth/omniauth_callbacks',
  }

  devise_scope :user do
    with_devise_exclusive_scope('/auth', :user, {}) do
      resource :oauth_registration, only: [:new, :create],
        path: 'oauth/oauth_registrations'
    end
  end

  get '/users/:username', to: redirect('/@%{username}'), constraints: { username: /([^\/]+(?<!\.atom|\.json)$)/ }

  resources :accounts, path: 'users', only: [:show], param: :username, constraints: { username: /((?!(\.atom|\.json)$)[^\/])+/ } do
    resources :stream_entries, path: 'updates', only: [:show] do
      member do
        get :embed
      end
    end

    get :remote_follow,  to: 'remote_follow#new'
    post :remote_follow, to: 'remote_follow#create'

    resources :statuses, only: [:show] do
      member do
        get :activity
        get :embed
      end
    end

    # get :media, to: redirect(path: '/@%{account_username}/media')
    resources :followers, only: [:index], controller: :follower_accounts
    resources :following, only: [:index], controller: :following_accounts
    resource :follow, only: [:create], controller: :account_follow
    resource :unfollow, only: [:create], controller: :account_unfollow
    resource :outbox, only: [:show], module: :activitypub
    resource :inbox, only: [:create], module: :activitypub
  end

  resource :inbox, only: [:create], module: :activitypub

  get '/@:username', to: 'accounts#show', as: :short_account, constraints: { username: /((?!(\.atom|\.json)$)[^\/])+/ }
  # get '/@:username/with_replies', to: 'accounts#show', as: :short_account_with_replies
  # get '/@:username/media', to: 'accounts#show', as: :short_account_media
  get '/@:account_username/:id', to: 'statuses#show', as: :short_account_status, constraints: { account_username: /[^\/]+/ }
  get '/@:account_username/:id/embed', to: 'statuses#embed', as: :embed_short_account_status, constraints: { account_username: /[^\/]+/ }

  namespace :settings do
    resources :oauth_authentications, only: [:index, :destroy]
    resource :profile, only: [:show, :update]
    resource :preferences, only: [:show, :update]
    resource :import, only: [:show, :create]

    resource :export, only: [:show]
    namespace :exports, constraints: { format: :csv } do
      resources :follows, only: :index, controller: :following_accounts
      resources :blocks, only: :index, controller: :blocked_accounts
      resources :mutes, only: :index, controller: :muted_accounts
    end

    resource :two_factor_authentication, only: [:show, :create, :destroy]
    namespace :two_factor_authentication do
      resources :recovery_codes, only: [:create]
      resource :confirmation, only: [:new, :create]
    end

    resource :follower_domains, only: [:show, :update]

    resources :applications, except: [:edit] do
      member do
        post :regenerate
      end
    end

    resource :delete, only: [:show, :destroy]
    resources :sessions, only: [:destroy]

    resource :timeline, only: [:show]
    resource :follow_requests, only: [:show]
    resource :mutes, only: [:show]
    resource :blocks, only: [:show]

    resource :custom_color, only: [:show, :update, :destroy]
  end

  resources :media, only: [:show]
  resources :tags,  only: [:show]
  resources :oauth_authentications, only: [:show], param: :uid

  get '/intent/statuses/new', to: redirect(path: '/share')

  get '/media_proxy/:id/(*any)', to: 'media_proxy#show', as: :media_proxy

  # Remote follow
  resource :authorize_follow, only: [:show, :create]
  get '/share', to: 'timelines#index'

  namespace :admin do
    resources :subscriptions, only: [:index]
    resources :domain_blocks, only: [:index, :new, :create, :show, :destroy]
    resource :settings, only: [:edit, :update]
    resources :suggestion_tags, only: [:index, :new, :create, :edit, :update, :destroy]
    resources :scheduled_statuses, only: [:index]
    resources :trend_ng_words, only: [:index, :new, :create, :edit, :update, :destroy]
    resources :oauth_authentications, only: [:destroy]
    resources :playlists, only: [:index, :new, :create, :edit, :update, :destroy]
    resource :playlist_setting, only: [:update]

    resources :instances, only: [:index] do
      collection do
        post :resubscribe
      end
    end

    resources :reports, only: [:index, :show, :update] do
      resources :reported_statuses, only: [:create, :update, :destroy]
    end

    resources :accounts, only: [:index, :show] do
      member do
        post :subscribe
        post :unsubscribe
        post :redownload
      end

      resource :reset, only: [:create]
      resource :silence, only: [:create, :destroy]
      resource :suspension, only: [:create, :destroy]
      resource :confirmation, only: [:create]
      resources :statuses, only: [:index, :create, :update, :destroy]
    end

    resources :users, only: [] do
      resource :two_factor_authentication, only: [:destroy]
    end
  end

  get '/admin', to: redirect('/admin/settings/edit', status: 302)

  namespace :api do
    # PubSubHubbub outgoing subscriptions
    resources :subscriptions, only: [:show]
    post '/subscriptions/:id', to: 'subscriptions#update'

    # PubSubHubbub incoming subscriptions
    post '/push', to: 'push#update', as: :push

    # Salmon
    post '/salmon/:id', to: 'salmon#update', as: :salmon

    # OEmbed
    get '/oembed', to: 'oembed#show', as: :oembed

    # JSON / REST API
    namespace :v1 do
      resources :statuses, only: [:create, :show, :destroy] do
        scope module: :statuses do
          resources :reblogged_by, controller: :reblogged_by_accounts, only: :index
          resources :favourited_by, controller: :favourited_by_accounts, only: :index
          resource :reblog, only: :create
          post :unreblog, to: 'reblogs#destroy'

          resource :favourite, only: :create
          post :unfavourite, to: 'favourites#destroy'

          resource :mute, only: :create
          post :unmute, to: 'mutes#destroy'

          resource :pin, only: [:create, :destroy]
          post :unpin, to: 'pins#destroy'
        end

        member do
          get :context
          get :card
          get :music
        end
      end

      namespace :timelines do
        resource :home, only: :show, controller: :home
        resource :public, only: :show, controller: :public
        resources :tag, only: :show
      end

      resources :streaming, only: [:index]

      get '/search', to: 'search#index', as: :search
      get '/search/statuses/:query', to: 'search#statuses', as: :status_search_timeline

      resource :push_notification_preferences, only: [:show, :update]
      resources :trend_tags, only: [:index]
      resources :suggestion_tags, only: [:index]
      resources :follows,    only: [:create]
      resources :media,      only: [:create]
      resources :apps,       only: [:create]
      resources :blocks,     only: [:index]
      resources :mutes,      only: [:index]
      resources :favourites, only: [:index]
      resources :reports,    only: [:index, :create]
      resources :schedules,  only: [:index]
      resources :pixiv_twitter_images, only: [:create]
      resources :firebase_cloud_messaging_tokens, only: [:create, :destroy], param: :platform
      resources :oauth_authentications, only: [:show], param: :uid
      resources :booth_items, only: [:show]
      resources :playlists, only: [:index, :show], param: :deck do
        resources :deck_queues, only: [:create, :destroy]
      end

      resource :instance,      only: [:show]
      resource :domain_blocks, only: [:show, :create, :destroy]

      resources :follow_requests, only: [:index] do
        member do
          post :authorize
          post :reject
        end
      end

      resources :notifications, only: [:index, :show] do
        collection do
          post :clear
          post :dismiss
        end
      end

      namespace :accounts do
        get :verify_credentials, to: 'credentials#show'
        patch :update_credentials, to: 'credentials#update'
        resource :search, only: :show, controller: :search
        resources :relationships, only: :index
      end

      resources :accounts, only: [:show] do
        resources :statuses, only: :index, controller: 'accounts/statuses'
        resources :followers, only: :index, controller: 'accounts/follower_accounts'
        resources :following, only: :index, controller: 'accounts/following_accounts'
        resources :pinned_statuses, only: :index, controller: 'accounts/pinned_statuses'

        member do
          post :follow
          post :unfollow
          post :block
          post :unblock
          post :mute
          post :unmute
        end
      end

      # Pawoo Music
      resources :albums, only: [:create, :update] do
        resources :tracks, only: [:index, :update, :destroy], controller: 'albums/tracks'
      end

      resources :tracks, only: [:create, :update] do
        post :prepare_video, on: :member
      end
    end

    namespace :web do
      resource :settings, only: [:update]
      resource :embed, only: [:create]
      resources :push_subscriptions, only: [:create] do
        member do
          put :update
        end
      end
    end
  end

  get '/timelines/public', to: 'timelines#index', as: :public_timeline
  get '/timelines/public/local', to: 'timelines#index', as: :local_timeline

  get '/web/(*any)', to: 'home#web', as: :web

  get '/about',      to: 'about#show'
  get '/about/more', to: 'about#more'
  get '/terms',      to: 'about#terms'
  get '/app_terms',  to: 'about#app_terms'
  get '/app_eula',   to: 'about#app_eula'

  root 'home#index'
  get '/notifications', to: 'home#index'
  get '/favourites',    to: 'home#index'

  resources :albums, only: :new
  resources :tracks, only: [:new, :edit]

  match '*unmatched_route',
        via: :all,
        to: 'application#raise_not_found',
        format: false
end
