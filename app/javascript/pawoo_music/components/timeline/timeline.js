import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import GlobalNaviContainer from '../../containers/global_navi';
import classNames from 'classnames';
import { isMobile } from '../../util/is_mobile';

const mapStateToProps = state => ({
  target: state.getIn(['pawoo_music', 'column', 'target']),
});

@connect(mapStateToProps)
export default class Timeline extends PureComponent {

  static propTypes = {
    target: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    gallery: PropTypes.node.isRequired,
  }

  render () {
    const { target, children, gallery } = this.props;
    const mobile = isMobile();

    return (
      <div className={classNames('timeline', { [target] : mobile })}>
        <div className='navigation-column'>
          <GlobalNaviContainer />
        </div>
        <div className='lobby-column'>
          {children}
        </div>
        <div className='gallery-column'>
          {gallery}
        </div>
      </div>
    );
  }

}
