import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'
import i18n from 'i18next'

import Form from 'react-ui/build/src/components/form'
import Input from 'react-ui/build/src/components/input'
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
 * @author Ryan Chen <ryanchen@telmediatech.com>
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
      errInfo: null
    };

    this.ah = getInstance('chewbacca');
  }
  /**
   * Handle save account confirm
   * @method
   */
  saveAccount = () => {
    const {baseUrl} = this.context;
    const {formType, formData} = this.state;
    const PASSWORD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@.$%^&*-]).{12,}$/;

    if (formData.account == '') {
      this.error(at('login.lbl-username'));
      return;
    }

    if (formType === 'reset') {
      if (formData.oldPwd == '' || formData.newPwd1 == '' || formData.newPwd2 == '') {
        this.error(at('login.lbl-password'));
        return;
      }
    }

    if (formType === 'newSet') {
      if (formData.newPwd1 == '' || formData.newPwd2 == '') {
        this.error(at('login.lbl-password'));
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

    let dataObj = {};
    let requestType = '';

    if (formType === 'reset') {
      requestType = 'PATCH';
      dataObj = {
        account: formData.account,
        currentPassword: formData.oldPwd,
        newPassword: formData.newPwd1
      };
    } else if (formType === 'newSet') {
      requestType = 'POST';
      dataObj = {
        account: formData.account,
        newPassword: formData.newPwd1
      };
    }

    this.ah.one({
      url: `${baseUrl}/api/account/password`,
      type: requestType,
      data: JSON.stringify(dataObj),
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
   * Close dialog and reset data
   * @method
   */
  close = () => {
    this.setState(this.clearData());
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
   * Handle reset password form change
   * @method
   * @param {object} formData - form input key-value
   */
  handleDataChange = (formData) => {
    this.setState({
      formData
    });
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
      errInfo: null
    };
  }
  /**
   * Display reset password content
   * @method
   * @returns HTML DOM
   */
  displayResetPassword = () => {
    const {formType, formData} = this.state;
    let fields = {
      account: {label: `${t('l-account')}`, editor: Input, props: {
        className: cx('accounts-style-form', {invalid:_.isEmpty(formData.account)}),
        maxLength: 32,
        required: true,
        validate: {
          t: et
        }
      }}
    };

    if (formType === 'reset') {
      fields.oldPwd = {
        label: `${t('oldPwd')}`, editor: Input, props: {
          className: cx('accounts-style-form', {invalid:_.isEmpty(formData.oldPwd)}),
          maxLength: 64,
          required: true,
          type: 'password',
          validate: {
            t: et
          }
        }
      };
    }

    fields.newPwd1 = {
      label: `${t('pwd')}`, editor: Input, props: {
        className: cx('accounts-style-form', {invalid:_.isEmpty(formData.newPwd1)}),
        maxLength: 64,
        required: true,
        type: 'password',
        validate: {
          t: et
        }
      }
    };

    fields.newPwd2 = {
      label: `${t('reenterPwd')}`, editor: Input, props: {
        className: cx('accounts-style-form', {invalid:_.isEmpty(formData.newPwd2)}),
        maxLength: 64,
        required: true,
        type: 'password',
        validate: {
          t: et
        }
      }
    };    

    return (
      <div className='accounts-size-frame'>
        <Form
          className='content'
          fields={fields}
          onChange={this.handleDataChange}
          value={formData} />
      </div>
    )
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