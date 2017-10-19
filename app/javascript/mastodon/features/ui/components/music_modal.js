import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/button';

const storageKey = 'music_modal_clicked_warning';
const warningClass = 'warning';

class MusicModal extends React.PureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    music: PropTypes.object.isRequired,
    onUpload: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onResetFileKey: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    let isClickedWaring = false;

    try {
      // すでにチェックしたことがあれば、その値を利用する
      isClickedWaring = localStorage.getItem(storageKey) === '1';
    } catch (e) {
      // Do nothing for private safari
    }

    this.state = {
      isClickedWaring,
      title: '',
      artist: '',
      imageURL: null,
      onMouseInUploadButton: false,
    };
  }

  componentDidMount() {
    this.uploadButtonElement.addEventListener('mouseenter', this.onMouseEnterUploadButton, true);
    this.uploadButtonElement.addEventListener('mouseleave', this.onMouseLeaveUploadButton, true);
  }

  componentWillUnmount() {
    this.props.onResetFileKey();
    this.uploadButtonElement.removeEventListener('mouseenter', this.onMouseEnterUploadButton, true);
    this.uploadButtonElement.removeEventListener('mouseleave', this.onMouseLeaveUploadButton, true);
  }

  handleUpload = () => {
    this.props.onUpload({
      title: this.state.title,
      artist: this.state.artist,
      image: this.imageFileElement.files[0],
      music: this.props.music,
    });
    this.props.onClose();
  }

  handleChooseImage = () => {
    this.imageFileElement.click();
  }

  handleOnSelectImage = () => {
    Promise.resolve()
    .then(() => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(this.imageFileElement.files[0]);
    }))
    .then((url)=>{
      this.setState({
        imageURL: `url(${url})`,
      });
    });
  }

  handleChangeCheckbox = () => {
    const newValue = !this.state.isClickedWaring;

    try {
      localStorage.setItem(storageKey, newValue ? '1' : '0');
    } catch (e) {
      // Do nothing for private safari
    }

    this.setState({ isClickedWaring: newValue });
  }

  onChangeTitle = (event) => {
    const title = event.currentTarget.value;
    this.setState({ title });
  }

  onChangeArtist = (event) => {
    const artist = event.currentTarget.value;
    this.setState({ artist });
  }

  setImageRef = (element) => {
    this.imageFileElement = element;
  }

  setUploadButtonRef = (element) => {
    this.uploadButtonElement = element;
  }

  onMouseEnterUploadButton = () => {
    this.setState({ onMouseInUploadButton: true });
  }

  onMouseLeaveUploadButton = () => {
    this.setState({ onMouseInUploadButton: false });
  }

  isValidString(value) {
    // validates ..., presence: true の条件に合わせる
    return value.replace(/\s/, '').length > 0;
  }

  render () {
    const { title, artist, onMouseInUploadButton, isClickedWaring } = this.state;

    const validTitle = this.isValidString(title);
    const validArtist = this.isValidString(artist);
    const enableUploadButton = isClickedWaring && this.state.imageURL && validTitle && validArtist;

    return (
      <div className='modal-root__modal music-modal'>
        <div className='music-modal__container'>
          <div className='music-modal__artwork'>
            {(() => {
              if(this.state.imageURL) {
                return (
                  <div className='music-modal__artwork-exist' style={{ backgroundImage: this.state.imageURL }} onClick={this.handleChooseImage} />
                );
              } else {
                const klass = onMouseInUploadButton ? warningClass : '';

                return (
                  <div className={`music-modal__artwork-none icon-button ${klass}`} onClick={this.handleChooseImage} >
                    <i style={{ fontSize: '30px' }} className='fa fa-fw fa-camera' aria-hidden='true' />
                    <span className='music-modal__artwork-info'>画像を<br />アップロード<br />（必須）</span>
                  </div>
                );
              }
            })()}
          </div>

          <div className='music-modal__metabox'>
            <div>
              <input className={`music-modal__title ${(onMouseInUploadButton && !validTitle) ? warningClass : ''}`} placeholder='楽曲名を入力' onChange={this.onChangeTitle} value={title} />
            </div>
            <div>
              <input className={`music-modal__artist ${(onMouseInUploadButton && !validArtist) ? warningClass : ''}`} placeholder='作者名を入力' onChange={this.onChangeArtist} value={artist} />
            </div>
            <div className='music-modal__info'>
              <div>※128文字を超える部分は自動的にカットされます</div>
              <div>※アップロードできる音楽と画像のサイズはそれぞれ7MBまでです</div>
            </div>

            <input type='file' name='image' accept='image/*' ref={this.setImageRef} onChange={this.handleOnSelectImage} />
          </div>
        </div>

        <div className='music-modal__action-bar'>
          <div className='music-modal__upload'>
            <input className='music-modal__checkbox-confirm' id='checkbox-confirm' type='checkbox' checked={isClickedWaring} onChange={this.handleChangeCheckbox} />
            <div className='music-modal__checkbox-content'>
              <label htmlFor='checkbox-confirm' className={`${(onMouseInUploadButton && !isClickedWaring) ? warningClass : ''}`}>
                作品（画像、音源、楽曲、テキスト等を含む）のアップロードにおいて、下記の注意事項を守ることを誓います。
              </label>
            </div>
            <div ref={this.setUploadButtonRef} className='music-modal__submit-button'>
              <Button disabled={!enableUploadButton} text='upload' onClick={this.handleUpload} />
            </div>
          </div>
          <div className='music-modal__terms-of-use'>
            １．この作品をインターネットで配信することが、第三者のいかなる権利も侵害しないこと。<br />
            <br />
            ２．マストドンというソフトウェアの仕様上、この作品が自動で他の様々なマストドンインスタンスにも複製され、配信されることに同意すること。<br />
            （前提として、マストドンのソフトウェアの規約上、複製された作品を第三者が商用利用する行為は禁止されています。権利を侵害する行為は関連法令により罰せられることがあります。）<br />
            <br />
            ３．この楽曲のインターネットでの配信（インタラクティブ配信）に係る権利について、著作権等管理団体に管理委託または信託していないこと。<br />
            <br />
            ４．楽曲のアップロード後に、当該楽曲のインターネットでの配信（インタラクティブ配信）に係る権利の管理を第三者に委託した場合は、管理委託・信託契約の効力発生日前に、当サービスからアップロードした作品を削除すること。<br />
            <br />
            ５．他人の作品を許可なくアップロードしたことにより、当サービスまたは第三者に損害を与えたときは、当該アップロード者が一切の責任を負うものとし、当社はその一切の責任を負いません。
          </div>
        </div>
      </div>
    );
  }

}

export default MusicModal;
