import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import TextField from '@material-ui/core/TextField'

import {downloadLink} from 'react-ui/build/src/utils/download'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from './components/common/context'
import FileUpload from './components/common/file-upload'
import helper from './components/common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;
let lt = null;

class License extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      uplaodFileOpen: false,
      file: '',
      lms: {
        returnCode: null,
        expireDate: null,
        isValid: null
      },
      showKeyInput: false,
      originalKey: '',
      key: '',
      formValidation: {
        key: {
          valid: true
        }
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    lt = global.chewbaccaI18n.getFixedT(null, 'lms');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.loadData();
  }
  /**
   * Load LMS data
   * @method
   * @returns HTML DOM
   */
  loadData = () => {
    const {baseUrl, contextRoot} = this.context;
    const apiArr = [
      {
        url: `${baseUrl}/api/lms/_registerKey`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/lms/verify`,
        type: 'GET'
      }
    ];

    this.ah.all(apiArr)
    .then(data => {
      if (data) {
        this.setState({
          originalKey: data[0],
          lms: data[1]
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle license input change
   * @method
   * @param {object} event - event object
   */
  handleInputChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }
  /**
   * Download unregistry license file
   * @method
   */
  downloadLicense = () => {
    const {baseUrl, contextRoot} = this.context;
    const {key} = this.state;
    const url = `${baseUrl}${contextRoot}/api/lms/goc?key=${key}`;

    downloadLink(url);
  }
  /**
   * Handle license activate button
   * @method
   */
  activateLicense = () => {
    const {baseUrl, contextRoot} = this.context;
    const {originalKey, key, formValidation} = this.state;
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (key) {
      tempFormValidation.key.valid = true;
    } else {
      tempFormValidation.key.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    if (originalKey === key) {
      helper.showPopupMsg(lt('key-acivated'), t('txt-error'));
      return;
    }

    let formData = new FormData();
    formData.append('key', key);

    const apiArr = [
      {
        url: `${baseUrl}/api/lms/_registerKey`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/lms/activate`,
        data: formData,
        type: 'POST',
        processData: false,
        contentType: false
      }
    ];

    this.ah.all(apiArr)
    .then(data => {
      this.handleLmsAvtivate(data[1]);
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle LMS activate/verify response data
   * @method
   * @param {object} data - data object
   */
  handleLmsAvtivate = (data) => {
    const {from} = this.props;

    if (data.returnCode !== '0') {
      if (data.returnCode === '-3028') {
        PopupDialog.alert({
          id: 'modalWindowSmall',
          confirmText: t('txt-download'),
          display: (
            <div className='content download'><span>{lt('l-offline-upload-msg')}</span></div>
          ),
          act: (confirmed) => {
            if (confirmed) {
              this.downloadLicense();
            }
          }
        });
      } else {
        helper.showPopupMsg('', t('txt-error'), lt(`${data.returnCode}`));
      }
    } else {
      PopupDialog.alert({
        id: 'modalWindowSmall',
        confirmText: t('txt-ok'),
        display: (
          <div className='content'><span>{lt('l-activate-success')}</span></div>
        ),
        act: (confirmed) => {
          if (confirmed) {
            if (from === 'login') {
              this.props.onPass();
            } else if (from === 'config') {
              this.toggleKeyInput();
              this.loadData();
            }
          }
        }
      });
    }
  }
  /**
   * Toggle upload file dialog on/off
   * @method
   */
  toggleFileUpload = () => {
    this.setState({
      uplaodFileOpen: !this.state.uplaodFileOpen
    });
  }
  /**
   * Handle upload file change
   * @method
   * @param {object} file - file to be set
   */
  handleFileChange = (file) => {
    this.setState({
      file
    });
  }
  /**
   * Upload offline file
   * @method
   */
  uploadOfflineFile = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleFileUpload},
      confirm: {text: t('txt-confirm'), handler: this.handleFileUpload}
    };

    return (
      <ModalDialog
        id='uploadFileDialog'
        className='modal-dialog'
        title={lt('l-upload-offline-file')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        <FileUpload
          id='uploadFile'
          btnText={t('txt-upload')}
          handleFileChange={this.handleFileChange} />
      </ModalDialog>
    )
  }
  /**
   * Handle file upload
   * @method
   */
  handleFileUpload = () => {
    const {baseUrl} = this.context;
    let formData = new FormData();
    formData.append('file', this.state.file);

    this.ah.one({
      url: `${baseUrl}/api/lms/uploadCA`,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data) {
        if (data.returnCode === '0') {
          this.toggleFileUpload();
          this.props.onPass();
        } else {
          helper.showPopupMsg('', t('txt-error'), lt(`${data.returnCode}`));
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle license activate button
   * @method
   */
  toggleKeyInput = () => {
    this.setState({
      showKeyInput: !this.state.showKeyInput,
      key: '',
      formValidation: {
        key: {
          valid: true
        }
      }
    });
  }
  render() {
    const {from} = this.props;
    const {
      uplaodFileOpen,
      lms,
      showKeyInput,
      originalKey,
      key,
      formValidation
    } = this.state;
    let text = lt('l-license-none');
    let licenseDate = '';
    let error = true;

    if (lms) {
      if (lms.expireDate) {
        licenseDate = moment(lms.expireDate, 'YYYYMMDD').format('YYYY-MM-DD');
      }

      if (lms.returnCode === '0') {
        text = lt('l-license-already');
        error = false;
      } else {
        text = lt(`${lms.returnCode}`);
      }
    }

    return (
      <div id='g-login' className={cx('c-center global c-flex fdc', {'config': from === 'config'})}>

        {uplaodFileOpen &&
          this.uploadOfflineFile()
        }

        <div id='loingForm' className={cx('fdc lms', {'config': from === 'config'})}>
          <section>
            <span className='msg'>{lt('l-license-status')}:</span>
            <span className={cx({'error': error})}>{text}</span>
          </section>
          {from === 'login' &&
            <div>
              <TextField
                id='license-key'
                className='key-field'
                name='key'
                label={lt('l-license-key')}
                autoFocus={true}
                variant='outlined'
                fullWidth={true}
                size='small'
                required={true}
                error={!formValidation.key.valid}
                helperText={formValidation.key.valid ? '' : lt('key-empty')}
                value={key}
                onChange={this.handleInputChange} />
              <div className='license-group-btn'>
                <button id='license-activate' onClick={this.activateLicense}>{lt('l-activate')}</button>
                <button id='licenseUpload' onClick={this.toggleFileUpload}>{lt('l-upload-offline-file')}</button>
              </div>
            </div>
          }
          {from === 'config' && originalKey &&
            <section>
              <span className='msg'>{lt('l-license-key')}:</span>
              <span>{originalKey}</span>
            </section>
          }
          {from === 'config' && licenseDate &&
            <section>
              <span className='msg'>{lt('l-license-expiry')}:</span>
              <span>{licenseDate}</span>
            </section>
          }
          {from === 'config' && !showKeyInput &&
            <button id='license-renew' onClick={this.toggleKeyInput}>{lt('l-license-renew-key')}</button>
          }
          {from === 'config' && showKeyInput &&
            <div>
              <TextField
                id='license-new-key'
                className='key-field'
                name='key'
                label={lt('l-new-license-key')}
                variant='outlined'
                fullWidth={true}
                size='small'
                required={true}
                error={!formValidation.key.valid}
                helperText={formValidation.key.valid ? '' : lt('key-empty')}
                value={key}
                onChange={this.handleInputChange} />
              <button id='license-confirm' className='multiple-btn' onClick={this.activateLicense}>{lt('l-activate')}</button>
              <button id='license-cancel' className='standard btn' onClick={this.toggleKeyInput}>{t('txt-cancel')}</button>
            </div>
          }
        </div>
      </div>
    )
  }
}

License.contextType = BaseDataContext;

License.propTypes = {
};

export default License;