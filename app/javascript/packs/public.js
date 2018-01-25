import loadPolyfills from '../mastodon/load_polyfills';
import ready from '../mastodon/ready';
import { trackPage, startHeartbeat } from '../mastodon/actions/ga';
import { createCustomColorStyle } from '../pawoo_music/util/custom_color';

window.addEventListener('message', e => {
  const data = e.data || {};

  if (!window.parent || data.type !== 'setHeight') {
    return;
  }

  ready(() => {
    window.parent.postMessage({
      type: 'setHeight',
      id: data.id,
      height: document.getElementsByTagName('html')[0].scrollHeight,
    }, '*');
  });
});

function main() {
  const { length } = require('stringz');
  const IntlRelativeFormat = require('intl-relativeformat').default;
  const { delegate } = require('rails-ujs');
  const emojify = require('../mastodon/emoji').default;
  const { getLocale } = require('../mastodon/locales');
  const { localeData } = getLocale();
  const VideoContainer = require('../mastodon/containers/video_container').default;
  const MediaGalleryContainer = require('../mastodon/containers/media_gallery_container').default;
  const CardContainer = require('../mastodon/containers/card_container').default;
  const React = require('react');
  const ReactDOM = require('react-dom');

  localeData.forEach(IntlRelativeFormat.__addLocaleData);

  ready(() => {
    const locale = document.documentElement.lang;

    const dateTimeFormat = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });

    const relativeFormat = new IntlRelativeFormat(locale);

    (() => {
      // MSIE(IE11のみUAにMSIEを含まないのでTridentで検出)
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isMSIE = /MSIE/i.test(userAgent) || /Trident/i.test(userAgent);

      if (isMSIE) {
        alert('お使いのブラウザはサポートされていません。Microsoft Edge、Google Chromeなどをお試しください。');
      }
    })();

    // タイムラインが伸びすぎないようにする
    if (location.pathname === '/about') {
      // Reactのレンダリングを待つ必要がある？
      setTimeout(() => {
        const timeline = document.getElementsByClassName('about-col main')[0];
        if (!timeline) return;

        [].forEach.call(document.getElementsByClassName('about-timeline-container'), (content) => {
          [].forEach.call(content.getElementsByClassName('column'), (column) => {
            column.style.height = `${timeline.clientHeight}px`;
          });
        });
      }, 200);
    }

    [].forEach.call(document.querySelectorAll('.emojify'), (content) => {
      content.innerHTML = emojify(content.innerHTML);
    });

    [].forEach.call(document.querySelectorAll('time.formatted'), (content) => {
      const datetime = new Date(content.getAttribute('datetime'));
      const formattedDate = dateTimeFormat.format(datetime);

      content.title = formattedDate;
      content.textContent = formattedDate;
    });

    [].forEach.call(document.querySelectorAll('time.time-ago'), (content) => {
      const datetime = new Date(content.getAttribute('datetime'));

      content.title = dateTimeFormat.format(datetime);
      content.textContent = relativeFormat.format(datetime);
    });

    [].forEach.call(document.querySelectorAll('.logo-button'), (content) => {
      content.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(e.target.href, 'mastodon-intent', 'width=400,height=400,resizable=no,menubar=no,status=no,scrollbars=yes');
      });
    });

    [].forEach.call(document.querySelectorAll('[data-component="Video"]'), (content) => {
      const props = JSON.parse(content.getAttribute('data-props'));
      ReactDOM.render(<VideoContainer locale={locale} {...props} />, content);
    });

    [].forEach.call(document.querySelectorAll('[data-component="MediaGallery"]'), (content) => {
      const props = JSON.parse(content.getAttribute('data-props'));
      ReactDOM.render(<MediaGalleryContainer locale={locale} {...props} />, content);
    });

    [].forEach.call(document.querySelectorAll('[data-component="Card"]'), (content) => {
      const props = JSON.parse(content.getAttribute('data-props'));
      ReactDOM.render(<CardContainer locale={locale} {...props} />, content);
    });

    const customColorElement = document.getElementById('custom-color-props');
    if (customColorElement) {
      try {
        const customColor = JSON.parse(customColorElement.getAttribute('data-props'));

        if (customColor){
          const head = document.head || document.getElementsByTagName('head')[0];
          const style = createCustomColorStyle(customColor, 'user-style-setting');
          head.appendChild(style);
        }
      } catch (e) {}
    }
  });

  delegate(document, '.webapp-btn', 'click', ({ target, button }) => {
    if (button !== 0) {
      return true;
    }
    window.location.href = target.href;
    return false;
  });

  delegate(document, '.status__content__spoiler-link', 'click', ({ target }) => {
    const contentEl = target.parentNode.parentNode.querySelector('.e-content');

    if (contentEl.style.display === 'block') {
      contentEl.style.display = 'none';
      target.parentNode.style.marginBottom = 0;
    } else {
      contentEl.style.display = 'block';
      target.parentNode.style.marginBottom = null;
    }

    return false;
  });

  delegate(document, '.account_display_name', 'input', ({ target }) => {
    const nameCounter = document.querySelector('.name-counter');

    if (nameCounter) {
      nameCounter.textContent = 30 - length(target.value);
    }
  });

  delegate(document, '.account_note', 'input', ({ target }) => {
    const noteCounter = document.querySelector('.note-counter');

    if (noteCounter) {
      noteCounter.textContent = 160 - length(target.value);
    }
  });

  delegate(document, '.omniauth-pixiv', 'click', (event) => {
    event.preventDefault();

    window.pixivSignupSDK.start('index', 'pawoo-music', () => {
      location.href = '/auth/oauth/pixiv';
    });
  });

  delegate(document, '#account_avatar', 'change', ({ target }) => {
    const avatar = document.querySelector('.card.compact .avatar');
    const [file] = target.files || [];
    const url = file ? URL.createObjectURL(file) : avatar.dataset.originalSrc;

    avatar.style.backgroundImage = `url(${url})`;
  });

  delegate(document, '#account_header', 'change', ({ target }) => {
    const header = document.querySelector('.card.compact');
    const [file] = target.files || [];
    const url = file ? URL.createObjectURL(file) : header.dataset.originalSrc;

    header.style.backgroundImage = `url(${url})`;
  });

  delegate(document, '#account_display_name', 'keyup', ({ target }) => {
    const displayName = document.querySelector('.card.compact .display-name');
    displayName.innerText = target.value;
  });

  // GA
  trackPage(window.location.pathname);
  startHeartbeat();
}

loadPolyfills().then(main).catch(error => {
  console.error(error);
});
