import React from 'react';
import PropTypes from 'prop-types';
import MediaModal from '../media_modal/media_modal';
import OnboardingModal from '../../../mastodon/features/ui/components/onboarding_modal';
import VideoModal from '../../../mastodon/features/ui/components/video_modal';
import BoostModal from '../../../mastodon/features/ui/components/boost_modal';
import MusicModal from '../../../mastodon/features/ui/components/music_modal';
import ConfirmationModal from '../../../mastodon/features/ui/components/confirmation_modal';
import ReportModal from '../../../mastodon/features/ui/components/report_modal';
import spring from 'react-motion/lib/spring';
import StatusFromModalContainer from '../../containers/status_form_modal';

const MODAL_COMPONENTS = {
  'MEDIA': MediaModal,
  'ONBOARDING': OnboardingModal,
  'VIDEO': VideoModal,
  'BOOST': BoostModal,
  'MUSIC': MusicModal,
  'CONFIRM': ConfirmationModal,
  'REPORT': ReportModal,
  'STATUS_FORM': StatusFromModalContainer,
};

export default class ModalRoot extends React.PureComponent {

  static propTypes = {
    type: PropTypes.string,
    props: PropTypes.object,
    onClose: PropTypes.func.isRequired,
  };

  handleKeyUp = (e) => {
    if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)
         && !!this.props.type) {
      this.props.onClose();
    }
  }

  componentDidMount () {
    window.addEventListener('keyup', this.handleKeyUp, false);
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  willEnter () {
    return { opacity: 0, scale: 0.98 };
  }

  willLeave () {
    return { opacity: spring(0), scale: spring(0.98) };
  }

  handleClick = (event) => {
    event.stopPropagation();
  }

  render () {
    const { type, props, onClose } = this.props;

    if(type) {
      const ModalDom   = MODAL_COMPONENTS[type];
      const properties = props;
      return (
        <div className='modal_root' role='button' tabIndex='0' onClick={onClose}>
          <div className='modal' role='button' tabIndex='0' onClick={this.handleClick}>
            <ModalDom {...properties} onClose={onClose} />
          </div>
        </div>
      );
    }
    return (<div />);
  }

}
