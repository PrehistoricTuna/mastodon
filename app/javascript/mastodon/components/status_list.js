import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import StatusContainer from '../containers/status_container';
import ImmutablePureComponent from 'react-immutable-pure-component';
import ScrollableList from './scrollable_list';

export default class StatusList extends ImmutablePureComponent {

  static propTypes = {
    scrollKey: PropTypes.string.isRequired,
    statusIds: ImmutablePropTypes.list.isRequired,
    onScrollToBottom: PropTypes.func,
    onScrollToTop: PropTypes.func,
    onScroll: PropTypes.func,
    trackScroll: PropTypes.bool,
    shouldUpdateScroll: PropTypes.func,
    isLoading: PropTypes.bool,
    hasMore: PropTypes.bool,
    prepend: PropTypes.node,
    emptyMessage: PropTypes.node,
    expandMedia: PropTypes.bool,
    squareMedia: PropTypes.bool,
    standalone: PropTypes.bool,
    schedule: PropTypes.bool,
    displayPinned: PropTypes.bool,
  };

  static defaultProps = {
    trackScroll: true,
    expandMedia: false,
    squareMedia: false,
    standalone: false,
    displayPinned: false,
  };

  render () {
    const { statusIds, squareMedia, expandMedia, standalone, schedule, displayPinned, ...other } = this.props;
    const { isLoading } = other;

    const scrollableContent = (isLoading || statusIds.size > 0) ? (
      statusIds.map((statusId) => (
        <StatusContainer key={statusId} id={statusId} squareMedia={squareMedia} expandMedia={expandMedia} standalone={standalone} schedule={schedule} displayPinned={displayPinned} />
      ))
    ) : null;

    return (
      <ScrollableList {...other}>
        {scrollableContent}
      </ScrollableList>
    );
  }

}
