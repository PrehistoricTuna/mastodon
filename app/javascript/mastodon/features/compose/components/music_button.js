import React from 'react';
import IconButton from '../../../components/icon_button';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  music: { id: 'music_button.label', defaultMessage: 'Add Your Music' },
});


const iconStyle = {
  height: null,
  lineHeight: '27px',
};

class MusicButton extends React.PureComponent {

  static propTypes = {
    disabled: PropTypes.bool,
    onSelectMusicFile: PropTypes.func.isRequired,
    resetFileKey: PropTypes.number,
    style: PropTypes.object,
    intl: PropTypes.object.isRequired,
  };

  handleChange = (e) => {
    if (!e.target.files.length) return;
    const file = e.target.files[0];
    this.props.onSelectMusicFile(file);
  }

  handleClick = () => {
    this.fileElement.click();
  }

  setRef = (c) => {
    this.fileElement = c;
  }

  render () {
    const { intl, resetFileKey, disabled } = this.props;

    return (
      <div className='compose-form__music-button'>
        <IconButton icon='music' title={intl.formatMessage(messages.music)} disabled={disabled} onClick={this.handleClick} className='compose-form__music-button-icon' size={18} inverted style={iconStyle} />
        <input key={resetFileKey} accept='.mp3' ref={this.setRef} type='file' multiple={false} onChange={this.handleChange} disabled={disabled} style={{ display: 'none' }} />
      </div>
    );
  }

}

export default injectIntl(MusicButton);
