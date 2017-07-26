import React from 'react';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import Avatar from './avatar';
import AvatarOverlay from './avatar_overlay';
import RelativeTimestamp from './relative_timestamp';
import DisplayName from './display_name';
import MediaGallery from './media_gallery';
import VideoPlayer from './video_player';
import BoothWidget from './booth_widget';
import SCWidget from './sc_widget';
import YTWidget from './yt_widget';
import StatusContent from './status_content';
import StatusActionBar from './status_action_bar';
import { FormattedMessage } from 'react-intl';
import emojify from '../emoji';
import escapeTextContentForBrowser from 'escape-html';
import ImmutablePureComponent from 'react-immutable-pure-component';
import scheduleIdleTask from '../features/ui/util/schedule_idle_task';

export default class Status extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    status: ImmutablePropTypes.map,
    account: ImmutablePropTypes.map,
    wrapped: PropTypes.bool,
    onReply: PropTypes.func,
    onFavourite: PropTypes.func,
    onReblog: PropTypes.func,
    onDelete: PropTypes.func,
    onOpenMedia: PropTypes.func,
    onOpenVideo: PropTypes.func,
    onBlock: PropTypes.func,
    me: PropTypes.number,
    boostModal: PropTypes.bool,
    autoPlayGif: PropTypes.bool,
    muted: PropTypes.bool,
    expandMedia: PropTypes.bool,
    squareMedia: PropTypes.bool,
    standalone: PropTypes.bool,
    onPin: PropTypes.func,
    displayPinned: PropTypes.bool,
    fetchBoothItem: PropTypes.func,
    boothItem: ImmutablePropTypes.map,
    intersectionObserverWrapper: PropTypes.object,
  };

  static defaultProps = {
    expandMedia: false,
  };

  state = {
    isExpanded: false,
    isIntersecting: true, // assume intersecting until told otherwise
    isHidden: false, // set to true in requestIdleCallback to trigger un-render
  }

  // Avoid checking props that are functions (and whose equality will always
  // evaluate to false. See react-immutable-pure-component for usage.
  updateOnProps = [
    'status',
    'account',
    'wrapped',
    'me',
    'boostModal',
    'autoPlayGif',
    'muted',
    'boothItem',
  ]

  updateOnStates = ['isExpanded']

  shouldComponentUpdate (nextProps, nextState) {
    if (!nextState.isIntersecting && nextState.isHidden) {
      // It's only if we're not intersecting (i.e. offscreen) and isHidden is true
      // that either "isIntersecting" or "isHidden" matter, and then they're
      // the only things that matter.
      return this.state.isIntersecting || !this.state.isHidden;
    } else if (nextState.isIntersecting && !this.state.isIntersecting) {
      // If we're going from a non-intersecting state to an intersecting state,
      // (i.e. offscreen to onscreen), then we definitely need to re-render
      return true;
    }

    // Otherwise, diff based on "updateOnProps" and "updateOnStates"
    return super.shouldComponentUpdate(nextProps, nextState);
  }

  componentDidMount () {
    const boothItemId = this.props.status.get('booth_item_id');

    if (!this.props.boothItem && boothItemId) {
      this.props.fetchBoothItem(boothItemId);
    }

    if (!this.props.intersectionObserverWrapper) {
      // TODO: enable IntersectionObserver optimization for notification statuses.
      // These are managed in notifications/index.js rather than status_list.js
      return;
    }
    this.props.intersectionObserverWrapper.observe(
      this.props.id,
      this.node,
      this.handleIntersection
    );

    this.componentMounted = true;
  }

  componentWillUnmount () {
    this.componentMounted = false;
  }

  handleIntersection = (entry) => {
    if (!this.componentMounted) {
      return;
    }

    // Edge 15 doesn't support isIntersecting, but we can infer it
    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12156111/
    // https://github.com/WICG/IntersectionObserver/issues/211
    const isIntersecting = (typeof entry.isIntersecting === 'boolean') ?
      entry.isIntersecting : entry.intersectionRect.height > 0;
    this.setState((prevState) => {
      if (prevState.isIntersecting && !isIntersecting) {
        scheduleIdleTask(this.hideIfNotIntersecting);
      }
      return {
        isIntersecting: isIntersecting,
        isHidden: false,
      };
    });
  }

  hideIfNotIntersecting = () => {
    if (!this.componentMounted) {
      return;
    }

    // When the browser gets a chance, test if we're still not intersecting,
    // and if so, set our isHidden to true to trigger an unrender. The point of
    // this is to save DOM nodes and avoid using up too much memory.
    // See: https://github.com/tootsuite/mastodon/issues/2900
    this.setState((prevState) => ({ isHidden: !prevState.isIntersecting }));
  }

  saveHeight = () => {
    if (this.node && this.node.children.length !== 0) {
      this.height = this.node.getBoundingClientRect().height;
    }
  }

  handleRef = (node) => {
    this.node = node;
    this.saveHeight();
  }

  handleClick = () => {
    const { status } = this.props;
    this.context.router.history.push(`/statuses/${status.getIn(['reblog', 'id'], status.get('id'))}`);
  }

  handleAccountClick = (e) => {
    if (this.props.standalone) {
      e.preventDefault();
    } else if (e.button === 0) {
      const id = Number(e.currentTarget.getAttribute('data-id'));
      e.preventDefault();
      this.context.router.history.push(`/accounts/${id}`);
    }
  }

  handleExpandedToggle = () => {
    this.setState({ isExpanded: !this.state.isExpanded });
  };

  render () {
    let media = null;
    let statusAvatar;

    // Exclude intersectionObserverWrapper from `other` variable
    // because intersection is managed in here.
    const { status, account, intersectionObserverWrapper, expandMedia, squareMedia, standalone, ...other } = this.props;
    const { isExpanded, isIntersecting, isHidden } = this.state;

    if (status === null) {
      return null;
    }

    if (!isIntersecting && isHidden) {
      return (
        <div ref={this.handleRef} data-id={status.get('id')} style={{ height: `${this.height}px`, opacity: 0, overflow: 'hidden' }}>
          {status.getIn(['account', 'display_name']) || status.getIn(['account', 'username'])}
          {status.get('content')}
        </div>
      );
    }

    if (this.props.displayPinned && status.get('pinned')) {
      const { displayPinned, intersectionObserverWrapper, ...otherProps } = this.props;

      return (
        <div className='status__wrapper pinned' ref={this.handleRef} data-id={status.get('id')} >
          <div className='status__prepend'>
            <div className='status__prepend-icon-wrapper'><i className='fa fa-fw fa-pin status__prepend-icon' /></div>
            <FormattedMessage id='status.pinned' defaultMessage='Pinned Toot' className='status__display-name muted' />
          </div>

          <Status {...otherProps} />
        </div>
      );
    }

    if (status.get('reblog', null) !== null && typeof status.get('reblog') === 'object') {
      let displayName = status.getIn(['account', 'display_name']);

      if (displayName.length === 0) {
        displayName = status.getIn(['account', 'username']);
      }

      const displayNameHTML = { __html: emojify(escapeTextContentForBrowser(displayName)) };

      return (
        <div className='status__wrapper' ref={this.handleRef} data-id={status.get('id')} >
          <div className='status__prepend'>
            <div className='status__prepend-icon-wrapper'><i className='fa fa-fw fa-retweet status__prepend-icon' /></div>
            <FormattedMessage id='status.reblogged_by' defaultMessage='{name} boosted' values={{ name: <a onClick={this.handleAccountClick} data-id={status.getIn(['account', 'id'])} href={status.getIn(['account', 'url'])} className='status__display-name muted'><strong dangerouslySetInnerHTML={displayNameHTML} /></a> }} />
          </div>

          <Status {...other} wrapped status={status.get('reblog')} account={status.get('account')} displayPinned={false} />
        </div>
      );
    }

    let attachments = status.get('media_attachments');
    if (status.getIn(['pixiv_cards'], Immutable.List()).size > 0) {
      attachments = status.get('pixiv_cards').map(card => {
        return Immutable.fromJS({
          id: Math.random().toString(),
          preview_url: card.get('image_url'),
          remote_url: '',
          text_url: card.get('url'),
          type: 'image',
          url: card.get('image_url'),
        });
      }).concat(attachments);
    }

    const youtube_pattern = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\/?\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/;
    const soundcloud_pattern = /soundcloud\.com\/([a-zA-Z0-9\-\_\.]+)\/([a-zA-Z0-9\-\_\.]+)(|\/)/;

    if (attachments.size > 0 && !this.props.muted) {
      if (attachments.some(item => item.get('type') === 'unknown')) {

      } else if (attachments.first().get('type') === 'video') {
        media = <VideoPlayer media={attachments.first()} sensitive={status.get('sensitive')} onOpenVideo={this.props.onOpenVideo} />;
      } else {
        media = <MediaGallery media={attachments} sensitive={status.get('sensitive')} height={squareMedia ? 229 : 132} onOpenMedia={this.props.onOpenMedia} autoPlayGif={this.props.autoPlayGif} expandMedia={expandMedia} />;
      }
    } else if (this.props.boothItem) {
      const boothItemUrl = status.get('booth_item_url');
      const boothItemId = status.get('booth_item_id');

      media = <BoothWidget url={boothItemUrl} itemId={boothItemId} boothItem={this.props.boothItem} />;
    } else if (status.get('content').match(youtube_pattern)) {
      const videoId = status.get('content').match(youtube_pattern)[1];
      media = <YTWidget videoId={videoId} />;
    } else if (status.get('content').match(soundcloud_pattern)) {
      const url = 'https://' + status.get('content').match(soundcloud_pattern)[0];
      media = <SCWidget url={url} />;
    }

    if (account === undefined || account === null) {
      statusAvatar = <Avatar src={status.getIn(['account', 'avatar'])} staticSrc={status.getIn(['account', 'avatar_static'])} size={48} />;
    } else {
      statusAvatar = <AvatarOverlay staticSrc={status.getIn(['account', 'avatar_static'])} overlaySrc={account.get('avatar_static')} />;
    }

    return (
      <div className={`status ${this.props.muted ? 'muted' : ''} status-${status.get('visibility')}`} data-id={status.get('id')} ref={this.handleRef}>
        <div className='status__info'>
          <a href={status.get('url')} className='status__relative-time' target='_blank' rel='noopener'><RelativeTimestamp timestamp={status.get('created_at')} /></a>

          <a onClick={this.handleAccountClick} data-id={status.getIn(['account', 'id'])} href={status.getIn(['account', 'url'])} className='status__display-name'>
            <div className='status__avatar'>
              {statusAvatar}
            </div>

            <DisplayName account={status.get('account')} />
          </a>
        </div>

        <StatusContent status={status} onClick={this.handleClick} expanded={isExpanded} onExpandedToggle={this.handleExpandedToggle} onHeightUpdate={this.saveHeight} standalone />

        {media}

        {!standalone && <StatusActionBar {...this.props} />}
      </div>
    );
  }

}
