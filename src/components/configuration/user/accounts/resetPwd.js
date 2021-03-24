import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'
import i18n from 'i18next'

import TextField from '@material-ui/core/TextField';

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../../common/context';

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const log = require('loglevel').getLogger('system/audit');
const t = i18n.getFixedT(null, 'accounts');
const at = i18n.getFixedT(null, 'app');
const et = i18n.getFixedT(null, 'errors');

/**
 * Reset Password
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the reset password form
 */
class ResetPwd extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      formType: '',
      formData: {
        account: '',
        oldPwd: '',
        newPwd1: '',
        newPwd2: ''
      },
      error: false,
      errInfo: null,
      formValidation: {
        account: {
          valid: true
        },
        oldPwd: {
          valid: true
        },
        newPwd1: {
          valid: true
        },
        newPwd2: {
          valid: true
        }
      }
    };

    this.ah = getInstance('chewbacca');
  }
  /**
   * Open reset password modal dialog
   * @param {string} options - options for password type ('reset' or 'newSet')
   * @method
   */
  openResetPwd = (options) => {
    this.setState({
      open: true,
      formType: options
    });
  }
  /**
   * Set input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempFormData = {...this.state.formData};
    tempFormData[event.target.name] = event.target.value;  

    this.setState({
      formData: tempFormData
    });
  }
  /**
   * Display reset password content
   * @method
   * @returns HTML DOM
   */
  displayResetPassword = () => {
    const {formType, formData, formValidation} = this.state;

    return (
      <div>
        <div className='form-input'>
          <TextField
            id='reset-account'
            name='account'
            label={t('l-account')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!formValidation.account.valid}
            helperText={formValidation.account.valid ? '' : at('login.lbl-username')}
            inputProps={{ maxLength: 32 }}
            value={formData.account}
            onChange={this.handleDataChange} />
        </div>
        {formType === 'reset' &&
          <div className='form-input'>
            <TextField
              id='reset-oldPwd'
              name='oldPwd'
              type='password'
              label={t('oldPwd')}
              variant='outlined'
              fullWidth
              size='small'
              required
              error={!formValidation.oldPwd.valid}
              helperText={formValidation.oldPwd.valid ? '' : at('login.lbl-password')}
              inputProps={{ maxLength: 64 }}
              value={formData.oldPwd}
              onChange={this.handleDataChange} />
          </div>
        }
        <div className='form-input'>
          <TextField
            id='reset-newPwd1'
            name='newPwd1'
            type='password'
            label={t('pwd')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!formValidation.newPwd1.valid}
            helperText={formValidation.newPwd1.valid ? '' : at('login.lbl-password')}
            inputProps={{ maxLength: 64 }}
            value={formData.newPwd1}
            onChange={this.handleDataChange} />
        </div>
        <div className='form-input'>
          <TextField
            id='reset-newPwd2'
            name='newPwd2'
            type='password'
            label={t('reenterPwd')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!formValidation.newPwd2.valid}
            helperText={formValidation.newPwd2.valid ? '' : at('login.lbl-password')}
            inputProps={{ maxLength: 64 }}
            value={formData.newPwd2}
            onChange={this.handleDataChange} />
        </div>
      </div>
    )
  }
  /**
   * Handle save account confirm
   * @method
   */
  saveAccount = () => {
    const {baseUrl} = this.context;
    const {formType, formData, formValidation} = this.state;
    const PASSWORD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@.$%^&*-]).{12,}$/;
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (formData.account) {
      tempFormValidation.account.valid = true;
    } else {
      tempFormValidation.account.valid = false;
      validate = false;
    }

    if (formType === 'reset') {
      if (formData.oldPwd) {
        tempFormValidation.oldPwd.valid = true;
      } else {
        tempFormValidation.oldPwd.valid = false;
        validate = false;
      }
    }

    if (formData.newPwd1) {
      tempFormValidation.newPwd1.valid = true;
    } else {
      tempFormValidation.newPwd1.valid = false;
      validate = false;
    }

    if (formData.newPwd2) {
      tempFormValidation.newPwd2.valid = true;
    } else {
      tempFormValidation.newPwd2.valid = false;
      validate = false;
    }

    this.setState({
      error: false,
      errInfo: null,
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    if (formType === 'reset') {
      if (formData.oldPwd === formData.newPwd1) {
        this.error(t('pwd-samePass'));
        return;
      }
    }

    if (!formData.newPwd1.match(PASSWORD)) {
      this.error(at('txt-password-pattern'));
      return;
    }

    if (formData.newPwd1 !== formData.newPwd2) {
      this.error(t('pwd-inconsistent'));
      return;
    }

    let requestData = {};
    let requestType = '';

    if (formType === 'reset') {
      requestType = 'PATCH';
      requestData = {
        account: formData.account,
        currentPassword: formData.oldPwd,
        newPassword: formData.newPwd1
      };
    } else if (formType === 'newSet') {
      requestType = 'POST';
      requestData = {
        account: formData.account,
        newPassword: formData.newPwd1
      };
    }

    this.ah.one({
      url: `${baseUrl}/api/account/password`,
      data: JSON.stringify(requestData),
      type: requestType,
      contentType: 'application/json'
    })
    .then(data => {
      PopupDialog.alert({
        id: 'modalWindowSmall',
        confirmText: at('btn-ok'),
        display: <div className='content'>{at('txt-passwordSuccess')}</div>
      });

      this.close();
      return null;
    })
    .catch(err => {
      PopupDialog.alert({
        id: 'modalWindowSmall',
        title: at('dlg-error'),
        confirmText: at('btn-ok'),
        display: <div className='content'>{err.message}</div>
      });

      this.error('');
    })
  }
  /**
   * Set form error message
   * @method
   * @param {string} msg - error message
   */
  error = (msg) => {
    this.setState({
      error: true,
      errInfo: msg
    });
  }
  /**
   * Close dialog and reset data
   * @method
   */
  close = () => {
    this.setState(this.clearData());
  }
  /**
   * Reset form data
   * @method
   */
  clearData = () => {
    return {
      open: false,
      formType: '',
      formData: {
        account: '',
        oldPwd: '',
        newPwd1: '',
        newPwd2: ''
      },
      error: false,
      errInfo: null,
      formValidation: {
        account: {
          valid: true
        },
        oldPwd: {
          valid: true
        },
        newPwd1: {
          valid: true
        },
        newPwd2: {
          valid: true
        }
      }
    };
  }
  render() {
    const {open, formType, error, errInfo} = this.state;
    const actions = {
      cancel: {text: at('btn-cancel'), className: 'standard', handler: this.close},
      confirm: {text: at('btn-ok'), handler: this.saveAccount}
    };
    let title = '';

    if (formType === 'reset') {
      title = t('change-expired-pwd');
    } else if (formType === 'newSet') {
      title = t('setNewPwd');
    }

    if (!open) {
      return null;
    }

    return (
      <ModalDialog
        id='resetPasswordDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        info={errInfo}
        infoClassName={cx({'c-error': error})}
        closeAction='cancel'
        actions={actions}>
        {this.displayResetPassword()}
      </ModalDialog>
    )
  }
}

ResetPwd.contextType = BaseDataContext;

ResetPwd.propTypes = {
};

export default ResetPwd;