import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames';
import Icon from '../../../../pawoo_music/components/icon';

const messages = defineMessages({
  public_short: { id: 'privacy.public.short', defaultMessage: 'Public' },
  public_long: { id: 'privacy.public.long', defaultMessage: 'Post to public timelines' },
  unlisted_short: { id: 'privacy.unlisted.short', defaultMessage: 'Unlisted' },
  unlisted_long: { id: 'privacy.unlisted.long', defaultMessage: 'Do not show in public timelines' },
  private_short: { id: 'privacy.private.short', defaultMessage: 'Followers-only' },
  private_long: { id: 'privacy.private.long', defaultMessage: 'Post to followers only' },
  direct_short: { id: 'privacy.direct.short', defaultMessage: 'Direct' },
  direct_long: { id: 'privacy.direct.long', defaultMessage: 'Post to mentioned users only' },
  change_privacy: { id: 'privacy.change', defaultMessage: 'Adjust status privacy' },
});


@injectIntl
export default class PrivacyDropdown extends React.PureComponent {

  static propTypes = {
    isUserTouching: PropTypes.func,
    onModalOpen: PropTypes.func,
    onModalClose: PropTypes.func,
    value: PropTypes.string.isRequired,
    text: PropTypes.string,
    buttonClassName: PropTypes.string,
    allowedPrivacy: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  state = {
    open: false,
  };

  handleToggle = () => {
    if (this.props.isUserTouching()) {
      if (this.state.open) {
        this.props.onModalClose();
      } else {
        this.props.onModalOpen({
          actions: this.options.map(option => ({ ...option, active: option.value === this.props.value })),
          onClick: this.handleModalActionClick,
        });
      }
    } else {
      this.setState({ open: !this.state.open });
    }
  }

  handleModalActionClick = (e) => {
    e.preventDefault();
    const { value } = this.options[e.currentTarget.getAttribute('data-index')];
    this.props.onModalClose();
    this.props.onChange(value);
  }

  handleClick = (e) => {
    if (e.key === 'Escape') {
      this.setState({ open: false });
    } else if (!e.key || e.key === 'Enter') {
      const value = e.currentTarget.getAttribute('data-index');
      e.preventDefault();
      this.setState({ open: false });
      this.props.onChange(value);
    }
  }

  onGlobalClick = (e) => {
    if (e.target !== this.node && !this.node.contains(e.target) && this.state.open) {
      this.setState({ open: false });
    }
  }

  componentWillMount () {
    const { intl: { formatMessage } } = this.props;

    this.options = [
      { icon: 'users', value: 'public', text: formatMessage(messages.public_short), meta: formatMessage(messages.public_long) },
      { icon: 'home', value: 'unlisted', text: formatMessage(messages.unlisted_short), meta: formatMessage(messages.unlisted_long) },
      { icon: 'lock', value: 'private', text: formatMessage(messages.private_short), meta: formatMessage(messages.private_long) },
      { icon: 'mail', value: 'direct', text: formatMessage(messages.direct_short), meta: formatMessage(messages.direct_long) },
    ];
  }

  componentDidMount () {
    window.addEventListener('click', this.onGlobalClick);
    window.addEventListener('touchstart', this.onGlobalClick);
  }

  componentWillUnmount () {
    window.removeEventListener('click', this.onGlobalClick);
    window.removeEventListener('touchstart', this.onGlobalClick);
  }

  setRef = (c) => {
    this.node = c;
  }

  render () {
    const { value, text, buttonClassName, allowedPrivacy, intl } = this.props;
    const { open } = this.state;

    let options = this.options;

    if (allowedPrivacy) {
      options = options.filter(item => allowedPrivacy.includes(item.value));
    }

    const valueOption = this.options.find(item => item.value === value);

    return (
      <div ref={this.setRef} className={`privacy-dropdown ${open ? 'active' : ''}`}>
        <div className='privacy-dropdown__value'>
          {text ? (
            <button className={classNames('privacy-dropdown__value-button', buttonClassName)} onClick={this.handleToggle}>
              <Icon icon={valueOption.icon} />
              <span className='privacy-dropdown__value-button-text'>{text}</span>
            </button>
          ) : (
            <Icon className={classNames('privacy-dropdown__value-icon', buttonClassName)} icon={valueOption.icon} title={intl.formatMessage(messages.change_privacy)} active={open} onClick={this.handleToggle} strong scale />
          )}
        </div>
        <div className='privacy-dropdown__dropdown'>
          {open && options.map(item =>
            <div role='button' tabIndex='0' key={item.value} data-index={item.value} onKeyDown={this.handleClick} onClick={this.handleClick} className={`privacy-dropdown__option ${item.value === value ? 'active' : ''}`}>
              <div className='privacy-dropdown__option__icon'><Icon icon={item.icon} /></div>
              <div className='privacy-dropdown__option__content'>
                <strong>{item.text}</strong>
                {item.meta}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

}
