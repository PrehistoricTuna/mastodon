const perf = require('./performance');

// import default stylesheet with variables
require('font-awesome/css/font-awesome.css');
require('mastodon-application-style');

function onDomContentLoaded(callback) {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
}

function main() {
  perf.start('main()');
  const PlayControl = require('mastodon/features/ui/components/play_control').default;
  const Mastodon = require('mastodon/containers/mastodon').default;
  const React = require('react');
  const ReactDOM = require('react-dom');

  require.context('../images/', true);

  if (window.history && history.replaceState) {
    const { pathname, search, hash } = window.location;
    const path = pathname + search + hash;
    if (!(/^\/(web|about|intent)(\/|$)/).test(path)) {
      history.replaceState(null, document.title, `/web${path}`);
    }
  }

  onDomContentLoaded(() => {
    const mountNode = document.getElementById('mastodon');
    const mountAboutPlayControl = document.getElementById('about-playcontrol');

    const playControlInitialState = JSON.parse(document.getElementById('initial-state').innerHTML).meta;

    const props = JSON.parse(mountNode.getAttribute('data-props'));

    ReactDOM.render(<Mastodon {...props} />, mountNode);
    if (mountAboutPlayControl) {
      ReactDOM.render(<PlayControl isTop={true} onError={function(){}} onSkip={function(){}} streamingAPIBaseURL={playControlInitialState.streaming_api_base_url} accessToken={playControlInitialState.access_token} />, mountAboutPlayControl);
    }
    perf.stop('main()');
  });
}

export default main;
