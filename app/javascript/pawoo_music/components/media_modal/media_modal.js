import React from 'react';
import ReactSwipeable from 'react-swipeable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import ExtendedVideoPlayer from '../../../mastodon/components/extended_video_player';
import { injectIntl } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import ImageLoader from '../../../mastodon/features/ui/components/image_loader';
import IconButton from '../icon_button';

@injectIntl
export default class MediaModal extends ImmutablePureComponent {

  static propTypes = {
    media: ImmutablePropTypes.list.isRequired,
    index: PropTypes.number.isRequired,
    intl: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  state = {
    index: null,
  };

  handleNextClick = (e) => {
    e.stopPropagation();
    this.setState({ index: (this.getIndex() + 1) % this.props.media.size });
  }

  handlePrevClick = (e) => {
    e.stopPropagation();
    this.setState({ index: (this.getIndex() - 1) % this.props.media.size });
  }

  handleKeyUp = (e) => {
    switch(e.key) {
    case 'ArrowLeft':
      this.handlePrevClick();
      break;
    case 'ArrowRight':
      this.handleNextClick();
      break;
    }
  }

  componentDidMount () {
    window.addEventListener('keyup', this.handleKeyUp, false);
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  getIndex () {
    return this.state.index !== null ? this.state.index : this.props.index;
  }

  render () {
    const { media, onClose } = this.props;

    const index = this.getIndex();
    const attachment = media.get(index);
    const url = attachment.get('url');

    let leftNav, rightNav, content;

    leftNav = rightNav = content = '';

    if (media.size > 1) {
      leftNav  = <div role='button' tabIndex='0' className='modal-container__nav modal-container__nav--left' onClick={this.handlePrevClick}><IconButton src='chevron-left' /></div>;
      rightNav = <div role='button' tabIndex='0' className='modal-container__nav modal-container__nav--right' onClick={this.handleNextClick}><IconButton src='chevron-right' /></div>;
    }

    if (attachment.get('type') === 'image') {
      content = <ImageLoader previewSrc={attachment.get('preview_url')} src={url} width={attachment.getIn(['meta', 'original', 'width'])} height={attachment.getIn(['meta', 'original', 'height'])} />;
    } else if (attachment.get('type') === 'gifv') {
      content = <ExtendedVideoPlayer src={url} muted controls={false} />;
    }

    return (
      <div role='button' tabIndex='0' className='media-modal' onClick={onClose}>
        <ReactSwipeable onSwipedRight={this.handlePrevClick} onSwipedLeft={this.handleNextClick}>
          {content}
        </ReactSwipeable>
        {leftNav}
        {rightNav}
      </div>
    );
  }

}