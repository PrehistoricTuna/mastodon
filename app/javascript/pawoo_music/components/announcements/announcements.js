import React from 'react';
import Immutable from 'immutable';
import Link from 'react-router-dom/Link';
import IconButton from '../icon_button';

const storageKey = 'announcements_dismissed';

class Announcements extends React.PureComponent {

  componentDidUpdate (prevProps, prevState) {
    if (prevState.dismissed !== this.state.dismissed) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(this.state.dismissed));
      } catch (e) {}
    }
  }

  componentWillMount () {
    try {
      const dismissed = JSON.parse(localStorage.getItem(storageKey));
      this.state = { dismissed: Array.isArray(dismissed) ? dismissed : [] };
    } catch (e) {
      this.state = { dismissed: [] };
    }

    const announcements = [];

    announcements.push(
      {
        id: 10,
        icon: '/announcements/icon_2x_360.png',
        body: 'Pawoo Musicをリニューアル！ MVの自動生成機能などをはじめ、新しいPawoo Musicお楽しみください！',
        link: [],
      },
      {
        id: 11,
        icon: '/announcements/icon_2x_360.png',
        body: 'Pawoo Musicをリニューアル！ MVの自動生成機能などをはじめ、新しいPawoo Musicお楽しみください！',
        link: [
          {
            reactRouter: false,
            inline: true,
            href: 'https://itunes.apple.com/us/app/%E3%83%9E%E3%82%B9%E3%83%88%E3%83%89%E3%83%B3%E3%82%A2%E3%83%97%E3%83%AA-pawoo/id1229070679?l=ja&ls=1&mt=8',
            body: 'Appストア',
          },
          {
            reactRouter: false,
            inline: true,
            href: 'https://itunes.apple.com/us/app/%E3%83%9E%E3%82%B9%E3%83%88%E3%83%89%E3%83%B3%E3%82%A2%E3%83%97%E3%83%AA-pawoo/id1229070679?l=ja&ls=1&mt=8',
            body: 'Apasdfpストア',
          }
        ],
      }
      /*
      link: [
        {
          reactRouter: false,
          inline: true,
          href: 'https://itunes.apple.com/us/app/%E3%83%9E%E3%82%B9%E3%83%88%E3%83%89%E3%83%B3%E3%82%A2%E3%83%97%E3%83%AA-pawoo/id1229070679?l=ja&ls=1&mt=8',
          body: 'Appストア',
        }, {
          reactRouter: false,
          inline: true,
          href: 'https://play.google.com/store/apps/details?id=jp.pxv.pawoo&hl=ja',
          body: 'Google Playストア',
        },
      */
      // NOTE: id: 10 まで使用した
    );

    this.announcements = Immutable.fromJS(announcements);
  }

  handleDismiss = (event) => {
    const id = +event.currentTarget.getAttribute('title');

    if (Number.isInteger(id)) {
      this.setState({ dismissed: [].concat(this.state.dismissed, id) });
    }
  }

  render () {
    return (
      <ul className='announcements'>
        {this.announcements.map(announcement => this.state.dismissed.indexOf(announcement.get('id')) === -1 && (
          <li key={announcement.get('id')}>
            <div className='announcements__body'>
              <p>{announcement.get('body')}</p>
              <p>
                {announcement.get('link').map((link) => {
                  const classNames = ['announcements__link'];
                  const action = link.get('action');

                  if (link.get('inline')) {
                    classNames.push('announcements__link-inline');
                  }

                  if (link.get('reactRouter')) {
                    return (
                      <Link key={link.get('href')} className={classNames.join(' ')} to={link.get('href')} onClick={action ? action : null}>
                        {link.get('body')}
                      </Link>
                    );
                  } else {
                    return (
                      <a className={classNames.join(' ')} key={link.get('href')} href={link.get('href')} target='_blank' onClick={action ? action : null}>
                        {link.get('body')}
                      </a>
                    );
                  }
                })}
              </p>
            </div>
            <div className='announcements__body__dismiss'>
              <IconButton title={`${announcement.get('id')}`} src='plus' role='button' tabIndex='0' aria-pressed='false' onClick={this.handleDismiss} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

};

export default Announcements;
