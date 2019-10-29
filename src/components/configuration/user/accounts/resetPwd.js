import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'
import i18n from 'i18next'

import Form from 'react-ui/build/src/components/form'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const log = require('loglevel').getLogger('system/audit');
const t = i18n.getFixedT(null, 'accounts');
const at = i18n.getFixedT(null, 'app');
const et = i18n.getFixedT(null, 'errors');

class ResetPwd extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
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
  saveAccount = () => {
    const {baseUrl, contextRoot} = this.props;
    const {formData} = this.state;
    const PASSWORD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@.$%^&*-]).{12,}$/;

    if (formData.account == '') {
      this.error(at('login.lbl-username'));
      return;
    }

    if (formData.oldPwd == '' || formData.newPwd1 == '' || formData.newPwd2 == '') {
      this.error(at('login.lbl-password'));
      return;
    }

    if (!formData.newPwd1.match(PASSWORD)) {
      this.error(at('txt-password-pattern'));
      return;
    }

    if (formData.newPwd1 !== formData.newPwd2) {
      this.error(t('pwd-inconsistent'));
      return;
    }

    const dataObj = {
      account: formData.account,
      currentPassword: formData.oldPwd,
      newPassword: formData.newPwd1
    };

    this.ah.one({
      url: `${baseUrl}/api/account/password`,
      type: 'PATCH',
      data: JSON.stringify(dataObj),
      contentType: 'application/json'
    })
    .then(data => {
      this.close();
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
  open = () => {
    this.setState({
      open: true
    });
  }
  close = () => {
    this.setState(this.clearData());
  }
  error = (msg) => {
    this.setState({
      error: true,
      errInfo: msg
    });
  }
  handleChange = (value) => {
    this.setState({
      formData: value
    });
  }
  clearData = () => {
    return {
      open: false,
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
  displayResetPassword = () => {
    const {formData} = this.state;

    return (
      <div className='accounts-size-frame'>
        <Form
          className='content'
          fields={{
            account: {label: `${t('l-account')}`, editor: Input, props: {
              className: cx('accounts-style-form', {invalid:_.isEmpty(formData.account)}),
              maxLength: 32,
              required: true,
              validate: {
                t: et
              }
            }},
            oldPwd: {label: `${t('oldPwd')}`, editor: Input, props: {
              className: cx('accounts-style-form', {invalid:_.isEmpty(formData.oldPwd)}),
              maxLength: 64,
              required: true,
              type: 'password',
              validate: {
                t: et
              }
            }},
            newPwd1: {label: `${t('newPwd')}`, editor: Input, props: {
              className: cx('accounts-style-form', {invalid:_.isEmpty(formData.newPwd1)}),
              maxLength: 64,
              required: true,
              type: 'password',
              validate: {
                t: et
              }
            }},
            newPwd2: {label: `${t('rewritePwd')}`, editor: Input, props: {
              className: cx('accounts-style-form', {invalid:_.isEmpty(formData.newPwd2)}),
              maxLength: 64,
              required: true,
              type: 'password',
              validate: {
                t: et
              }
            }}
          }}
          onChange={this.handleChange}
          value={formData} />
      </div>
    )
  }
  render() {
    const {open, error, errInfo} = this.state;
    const actions = {
      cancel: {text: at('btn-cancel'), className: 'standard', handler: this.close},
      confirm: {text: at('btn-ok'), handler: this.saveAccount}
    };

    if (!open) {
      return null;
    }

    return (
      <ModalDialog
        id='g-user-resetPwd'
        className='modal-dialog'
        title={t('change-expired-pwd')}
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

ResetPwd.propTypes = {
};

export default ResetPwd;