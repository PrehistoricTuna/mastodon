import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import classNames from 'classnames';
import { connectUserStream } from '../../actions/streaming';
import { changeTargetColumn } from '../../actions/column';
import { refreshHomeTimeline } from '../../../mastodon/actions/timelines';
import { refreshNotifications } from '../../../mastodon/actions/notifications';
import HomeTimelineContainer from '../home_timeline';
import NotificationTimelineContainer from '../notification_timeline';
import CommunityTimelineContainer from '../community_timeline';
import PublicTimelineContainer from '../public_timeline';
import HashtagTimelineContainer from '../hashtag_timeline';
import AccountGalleryContainer from '../account_gallery';
import FavouritedStatusesContainer from '../favourited_statuses';
import Intent from '../../components/intent';
import LoadingBarContainer from '../../../mastodon/features/ui/containers/loading_bar_container';
import NotificationsContainer from '../../../mastodon/features/ui/containers/notifications_container';
import ModalContainer from '../modal_container';
import AccountFollowersContainer from '../account_followers';
import AccountFollowingContainer from '../account_following';
import StatusThreadContainer from '../status_thread';
import { isMobile } from '../../util/is_mobile';
import StatusPostButtonContainer from '../status_post_button';
import PlayControlContainer from '../../../mastodon/features/ui/containers/play_control_container';
import { openModalFormCompose } from '../../../mastodon/actions/compose';
import Link from '../../components/link_wrapper';
import IconButton from '../../components/icon_button';

import logo from '../../../images/pawoo_music/pawoo_music.svg';

const mapStateToProps = state => ({
  isLogin: !!state.getIn(['meta', 'me']),
  target: state.getIn(['pawoo_music', 'column', 'target']),
  title: state.getIn(['pawoo_music', 'timeline', 'title']),
  footerType: state.getIn(['pawoo_music', 'footer', 'footerType']),
  backTo: state.getIn(['pawoo_music', 'footer', 'backTo']),
});

@connect(mapStateToProps)
export default class App extends PureComponent {

  static propTypes = {
    title: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    footerType: PropTypes.string.isRequired,
    backTo: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    isLogin: PropTypes.bool,
  }

  static contextTypes = {
    router: PropTypes.object,
  };

  componentDidMount () {
    const { dispatch, isLogin } = this.props;

    if (isLogin) {
      this.disconnect = dispatch(connectUserStream());
      dispatch(refreshHomeTimeline());
      dispatch(refreshHomeTimeline({ onlyMusics: true }));
      dispatch(refreshNotifications());

      // Desktop notifications
      if (typeof window.Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }

  componentWillUnmount () {
    if (this.disconnect) {
      this.disconnect();
      this.disconnect = null;
    }
  }

  handleClickGlobalNaviButton = () => {
    const { dispatch, target } = this.props;
    if(target === 'lobby') {
      dispatch(changeTargetColumn('global_navi'));

    } else {
      dispatch(changeTargetColumn('lobby'));
    }
  }

  handleClickLobbyButton = () => {
    const { dispatch } = this.props;
    dispatch(changeTargetColumn('lobby'));
  }

  handleClickGalleryButton = () => {
    const { dispatch } = this.props;
    dispatch(changeTargetColumn('gallery'));
  }

  handleClickHistoryBackButton = () => {
    const { dispatch } = this.props;
    if (window.history && window.history.length === 1) this.context.router.history.push('/');
    else this.context.router.history.goBack();
    dispatch(changeTargetColumn('lobby'));
  }

  handleClickStatusPostButton = () => {
    const { dispatch } = this.props;
    dispatch(openModalFormCompose());
  }

  handleRedirectLoginPage = (e) => {
    const { isLogin } = this.props;
    if (!isLogin) {
      location.href = '/auth/sign_in';
      e.preventDefault();
    }
  }

  render () {
    const mobile = isMobile();
    const { title, target, footerType, isLogin, backTo } = this.props;

    const routes = (
      <Switch>
        <Route path='/' exact component={HomeTimelineContainer} />
        <Route path='/intent/statuses/new' exact component={Intent} />
        <Route path='/notifications' component={NotificationTimelineContainer} />
        <Route path='/timelines/public/local' component={CommunityTimelineContainer} />
        <Route path='/timelines/public' exact component={PublicTimelineContainer} />
        <Route path='/tags/:id' exact component={HashtagTimelineContainer} />
        <Route path='/favourites' component={FavouritedStatusesContainer} />
        <Route path='/@:acct' exact component={AccountGalleryContainer} />
        <Route path='/@:acct/:id' exact component={StatusThreadContainer} />
        <Route path='/users/:acct/followers' exact component={AccountFollowersContainer} />
        <Route path='/users/:acct/following' exact component={AccountFollowingContainer} />
      </Switch>
    );

    let buttons = null;

    if(mobile) {
      if(footerType === 'lobby_gallery') {
        buttons = (
          <div className='buttons'>
            <div role='button' tabIndex='0' className={classNames('app-bottom_button', { 'selected': target === 'lobby'   })} onClick={this.handleClickLobbyButton}  >チャット</div>
            <div role='button' tabIndex='0' className={classNames('app-bottom_button', { 'selected': target === 'gallery' })} onClick={this.handleClickGalleryButton}>作品</div>
          </div>
        );

      } else if(footerType === 'back_to_user') {
        buttons = (
          <div className='buttons'>
            <Link className='app-bottom_button selected' to={backTo} >戻る</Link>
          </div>
        );

      } else { // Do same action as (footerType === 'history_back')
        buttons = (
          <div className='buttons'>
            <div className='app-bottom_button selected' role='button' tabIndex='0' onClick={this.handleClickHistoryBackButton}>戻る</div>
          </div>
        );
      }
    }

    return (
      mobile ? (
        <div className={classNames('app', 'sp')}>

          <div className='app-center'>{routes}</div>

          <div className='app-top'>
            <IconButton src='menu' className={classNames('to_global_navi', { 'selected': target === 'global_navi' })} strokeWidth={2} onClick={this.handleClickGlobalNaviButton} />
            <div className='blank' />
            <div className='logo'>
              <img alt='logo' src={logo} />
              <div className='timeline_title'>{title}</div>
            </div>
            <IconButton src='edit-2' className='post_status' strokeWidth={2} onClick={isLogin ? this.handleClickStatusPostButton : this.handleRedirectLoginPage} />
            <a className='post_track' href='/tracks/new' onClick={this.handleRedirectLoginPage}><IconButton src='music' className='clickable' strokeWidth={2} /></a>
          </div>

          <div className='app-bottom'>{buttons}</div>

          <NotificationsContainer />
          <LoadingBarContainer className='loading-bar' />
          <ModalContainer />
        </div>
      ) : (
        <div className='app'>
          <div className='app-center'>
            {routes}
          </div>
          <div className='app-bottom'>
            <PlayControlContainer />
          </div>
          <NotificationsContainer />
          <LoadingBarContainer className='loading-bar' />
          <StatusPostButtonContainer fixed />
          <ModalContainer />
        </div>
      )
    );
  }

}
