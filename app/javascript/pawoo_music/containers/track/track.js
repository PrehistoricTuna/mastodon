import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import Musicvideo from '../../components/musicvideo';
import { playTrack, stopTrack } from '../../actions/tracks';

import playIcon from '../../../images/pawoo_music/play.png';
import defaultArtwork from '../../../images/pawoo_music/default_artwork.png';

const mapStateToProps = (state) => ({
  trackId: state.getIn(['pawoo_music', 'tracks', 'trackId']),
});

const mapDispatchToProps = (dispatch) => ({
  onPlayTrack (value) {
    dispatch(playTrack(value));
  },

  onStopTrack (value) {
    dispatch(stopTrack(value));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
class Track extends ImmutablePureComponent {

  static propTypes = {
    track:  ImmutablePropTypes.map,
    trackId: PropTypes.string,
    onPlayTrack: PropTypes.func.isRequired,
    onStopTrack: PropTypes.func.isRequired,
  };

  state = {
    thumbnailView: true,
  }

  componentWillReceiveProps = ({ trackId }) => {
    if (!this.state.thumbnailView && trackId !== this.props.track.get('music')) {
      this.setState({ thumbnailView: true });
    }
  };

  componentWillUnmount () {
    this.setState({ thumbnailView: true });
  }

  handlePlayClick = () => {
    const { thumbnailView } = this.state;
    this.setState({ thumbnailView: !thumbnailView });
    if (thumbnailView) {
      this.props.onPlayTrack(this.props.track.get('music'));
    } else {
      this.props.onStopTrack(this.props.track.get('music'));
    }
  }

  handleEndTrack = () => {
    this.props.onStopTrack(this.props.track.get('music'));
    this.setState({ thumbnailView: true });
  };

  render() {
    const { track } = this.props;
    const { thumbnailView } = this.state;
    if (!track) {
      return null;
    }

    const backgroundImage = (track.getIn(['video', 'image'])) ? track.getIn(['video', 'image']) : defaultArtwork;
    const thumbnailStyle = {
      backgroundImage: `url('${backgroundImage}')`,
    };

    return (
      <div className='track'>
        <div className='musicvideo-wrapper' style={thumbnailStyle}>
          {thumbnailView ? (
            <div className='thumbnail'>
              <img className='playbutton' src={playIcon} alt='playbutton' role='button' tabIndex='0' aria-pressed='false' onClick={this.handlePlayClick} />
            </div>
          ) : (
            <Musicvideo track={track} onEnded={this.handleEndTrack} />
          )}
        </div>
        <div className='credit'>
          {`${track.get('artist')} - ${track.get('title')}`}
        </div>
      </div>
    );
  }

}

export default Track;
