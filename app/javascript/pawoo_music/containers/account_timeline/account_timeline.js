import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import { fetchAccount } from '../../../mastodon/actions/accounts';
import { refreshAccountTimeline, expandAccountTimeline, refreshPinnedStatusTimeline } from '../../../mastodon/actions/timelines';
import ScrollableList from '../../components/status_list';
import Timeline from '../../components/timeline';
import { makeGetAccount } from '../../../mastodon/selectors';
import { createCustomColorStyle } from '../../util/custom_color';

const makeMapStateToProps = () => {
  const getAccount = makeGetAccount();

  const mapStateToProps = (state, props) => {
    const { accountId } = props;

    return {
      accountId,
      account: getAccount(state, accountId),
      statusIds: state.getIn(['timelines', `account:${accountId}`, 'items'], Immutable.List()),
      isLoading: state.getIn(['timelines', `account:${accountId}`, 'isLoading']),
      hasMore: !!state.getIn(['timelines', `account:${accountId}`, 'next']),
      pinnedStatusIds: state.getIn(['timelines', `account:${accountId}:pinned_status`, 'items'], Immutable.List()),
    };
  };

  return mapStateToProps;
};

@connect(makeMapStateToProps)
export default class AccountTimeline extends PureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    accountId: PropTypes.number.isRequired,
    account: ImmutablePropTypes.map,
    statusIds: ImmutablePropTypes.list.isRequired,
    isLoading: PropTypes.bool,
    hasMore: PropTypes.bool,
    gallery: PropTypes.node,
    pinnedStatusIds: ImmutablePropTypes.list,
  };

  static childContextTypes = {
    displayPinned: PropTypes.bool,
  };

  getChildContext() {
    return { displayPinned: true };
  }

  componentWillMount () {
    const { dispatch, accountId, account } = this.props;

    dispatch(fetchAccount(accountId));
    dispatch(refreshPinnedStatusTimeline(accountId));
    dispatch(refreshAccountTimeline(accountId));

    if (account) {
      this.appendStyle(account);
    }
  }

  componentWillReceiveProps (nextProps) {
    const { dispatch } = this.props;

    if (nextProps.accountId !== this.props.accountId && nextProps.accountId) {
      const accountId = nextProps.accountId;

      dispatch(fetchAccount(accountId));
      dispatch(refreshPinnedStatusTimeline(accountId));
      dispatch(refreshAccountTimeline(accountId));
      this.removeStyle(this.props.accountId);
    }

    if (!Immutable.is(nextProps.account, this.props.account)) {
      this.appendStyle(nextProps.account);
    }
  }

  componentWillUnmount () {
    const { accountId } = this.props;
    this.removeStyle(accountId);
  }

  handleScrollToBottom = debounce(() => {
    const { dispatch, isLoading, hasMore, accountId } = this.props;
    if (!isLoading && hasMore) {
      dispatch(expandAccountTimeline(accountId));
    }
  }, 300, { leading: true })

  appendStyle (account) {
    const customColor = account.get('custom_color');

    if (!customColor) {
      return;
    }

    this.removeStyle(account.get('id'));

    const head = document.head || document.getElementsByTagName('head')[0];
    const style = createCustomColorStyle(customColor, `user-style-${account.get('id')}`);
    head.appendChild(style);
  }

  removeStyle (accountId) {
    const style = document.getElementById(`user-style-${accountId}`);

    if (style) {
      const head = document.head || document.getElementsByTagName('head')[0];
      head.removeChild(style);
    }
  }

  render () {
    const { account, statusIds, pinnedStatusIds, isLoading, hasMore, gallery } = this.props;
    const header = null;
    const prepend = null;
    const uniqueStatusIds = pinnedStatusIds.concat(statusIds).toOrderedSet().toList();
    const galleryStyle = {};

    if (account && account.get('background_image')) {
      galleryStyle.backgroundImage = `url(${account.get('background_image')})`;
    }

    return (
      <Timeline gallery={gallery} galleryStyle={galleryStyle} header={header}>
        <ScrollableList
          scrollKey='account_timeline'
          statusIds={uniqueStatusIds}
          isLoading={isLoading}
          hasMore={hasMore}
          prepend={prepend}
          onScrollToBottom={this.handleScrollToBottom}
        />
      </Timeline>
    );
  }

};