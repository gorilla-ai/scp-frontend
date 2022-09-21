import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'
import i18n from 'i18next'

import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import helper from './components/common/helper'
import License from './license'
import ResetPwd from './components/configuration/user/accounts/resetPwd'

import {default as ah, getInstance, createInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let c = null;
let et = null;

createInstance(
  'login',
  {
    parseSuccess: resp => resp,
    parseFail: resp => {
      return {
        code: _.get(resp, 'ret', -100),
        message: _.get(resp, 'message')
      }
    },
    et: i18n.getFixedT(null, 'errors')
  }
)

/**
 * Login
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Login page
 */
class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dropDownList: [],
      openFindAccountDialog: false,
      openEnterTokenDialog: false,
      openEnterPasswordDialog: false,
      capsLockWarning: false,
      login: {
        username: '',
        password: ''
      },
      forgotPassword: {
        account: '',
        token: '',
        password: ''
      },
      userEmail: '',
      forgotModalError: '',
      info: null,
      error: false,
      license: null,
      formValidation: {
        username: {
          valid: true
        },
        password: {
          valid: true
        },
        forgotAccount: {
          valid: true
        },
        forgotToken: {
          valid: true
        },
        forgotPassword: {
          valid: true
        }
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'app');
    c = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('login');
  }
  componentDidMount() {
    this.getLanguageList();
    this.checkLicense();

    window.addEventListener('keydown', this.wasCapsLockActivated);
  }
  componentWillUnmount() {
    window.removeEventListener('keydown', this.wasCapsLockActivated);
  }
  wasCapsLockActivated = (event) => {
    this.setState({
      capsLockWarning: event.getModifierState('CapsLock')
    });
  }
  /**
   * Get language list
   * @method
   */
  getLanguageList = () => {
    const dropDownList = _.map(this.props.locale, (val, i) => {
      return <MenuItem key={i} value={val}>{t('lng.' + val)}</MenuItem>
    });

    this.setState({
      dropDownList
    });
  }
  /**
   * Check license before login
   * @method
   */
  checkLicense = () => {
    const {baseUrl} = this.props;

    this.ah.one({
      url: `${baseUrl}/api/lms/verify`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let licenseCheck = false;

        if (data.rt.returnCode === '0') {
          licenseCheck = data.rt.isValid === '1';
        }

        this.setState({
          license: licenseCheck
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', c('txt-error'), err.message);
    })
  }
  /**
   * Handle login confirm
   * @method
   */
  logon = () =>  {
    const {login, formValidation} = this.state;
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (login.username) {
      tempFormValidation.username.valid = true;
    } else {
      tempFormValidation.username.valid = false;
      validate = false;
    }

    if (login.password) {
      tempFormValidation.password.valid = true;
    } else {
      tempFormValidation.password.valid = false;
      validate = false;
    }

    this.setState({
      info: null,
      error: false,
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    this.getLogin();
  }
  /**
   * Call login api and show login success/fail
   * @method
   */
  getLogin = () => {
    const {baseUrl, contextRoot} = this.props;
    const {login} = this.state;
    const requestData = {
      account: login.username,
      password: login.password
    };

    this.ah.one({
      url: `${baseUrl}/api/login`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === -2) {
        this.setState({
          info: null,
          error: false
        }, () => {
          this.startResetPwd('newSet');
        });
      } else {
        const redirectURL = window.location.pathname;
        window.location.href = redirectURL;
      }
      return null;
    })
    .catch(err => {
      if (err.message === et('-1005')) {
        this.setState({
          info: null,
          error: false
        }, () => {
          this.startResetPwd('reset');
        });
      } else {
        this.setState({
          info: err.message,
          error: true
        });
      }
    })
  }
  /**
   * Open reset password page
   * @param {string} options - options for password type ('reset' or 'newSet')
   * @method
   */
  startResetPwd = (options) => {
    this.pageResetPwd.openResetPwd(options);
  }
  /**
   * Open forgot password dialog
   * @method
   */
  handleForgotPassword = () => {
    this.setState({
      openFindAccountDialog: true
    });
  }
  /**
   * Display forgot password content
   * @method
   * @param {string} type - dialog type ('account', 'token' or 'password')
   * @returns TextField component
   */
  displayForgotPasswordContent = (type) => {
    const {forgotPassword, formValidation} = this.state;

    if (type === 'account') {
      return (
        <TextField
          name='account'
          label={t('login.txt-account')}
          autoFocus={true}
          variant='outlined'
          fullWidth={true}
          size='small'
          required={true}
          error={!formValidation.forgotAccount.valid}
          helperText={formValidation.forgotAccount.valid ? '' : c('txt-required')}
          value={forgotPassword.account}
          onChange={this.handleDataChange.bind(this, 'forgotPassword')} />
      )
    } else if (type === 'token') {
      return (
        <TextField
          name='token'
          label={t('login.txt-token')}
          autoFocus={true}
          variant='outlined'
          fullWidth={true}
          size='small'
          required={true}
          error={!formValidation.forgotToken.valid}
          helperText={formValidation.forgotToken.valid ? '' : c('txt-required')}
          value={forgotPassword.token}
          onChange={this.handleDataChange.bind(this, 'forgotPassword')} />
      )
    } else if (type === 'password') {
      return (
        <TextField
          name='password'
          type='password'
          label={t('login.txt-userPassword')}
          autoFocus={true}
          variant='outlined'
          fullWidth={true}
          size='small'
          required={true}
          error={!formValidation.forgotPassword.valid}
          helperText={formValidation.forgotPassword.valid ? '' : c('txt-required')}
          value={forgotPassword.password}
          onChange={this.handleDataChange.bind(this, 'forgotPassword')} />
      )
    }
  }
  /**
   * Display forgot password dialog content
   * @method
   * @param {string} type - dialog type ('account', 'token' or 'password')
   * @returns ModalDialog component
   */
  forgotPasswordDialog = (type) => {
    const {userEmail, forgotModalError} = this.state;
    let descriptionText = '';
    let confirm = '';

    if (type === 'account') {
      descriptionText = t('txt-enterAccount');
      confirm = this.handleAccountConfirm;
    } else if (type === 'token') {
      descriptionText = t('txt-enterToken') + ':';
      confirm = this.handleTokenConfirm;
    } else if (type === 'password') {
      descriptionText = t('txt-enterNewPassword');
      confirm = this.handlePasswordConfirm;
    }

    const actions = {
      cancel: {text: c('txt-cancel'), className: 'standard', handler: this.closeDialog},
      confirm: {text: c('txt-confirm'), handler: confirm}
    };

    return (
      <ModalDialog
        id='forgotPasswordDialog'
        className='modal-dialog'
        title={t('txt-forgotPassword')}
        draggable={true}
        global={true}
        actions={actions}
        info={forgotModalError}
        closeAction='cancel'>
        <React.Fragment>
          <div className='desc-text'>{descriptionText}</div>
          {type === 'token' &&
            <div>{userEmail}</div>
          }
          <div className='login-group'>
            {this.displayForgotPasswordContent(type)}
          </div>
        </React.Fragment>
      </ModalDialog>
    )
  }
  /**
   * Handle enter account confirm
   * @method
   */
  handleAccountConfirm = () => {
    const {baseUrl, contextRoot} = this.props;
    const {forgotPassword, formValidation} = this.state;
    const requestData = {
      account: forgotPassword.account
    };
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (forgotPassword.account) {
      tempFormValidation.forgotAccount.valid = true;
    } else {
      tempFormValidation.forgotAccount.valid = false;
      validate = false;
    }

    this.setState({
      forgotModalError: '',
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/account/email`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        this.setState({
          openFindAccountDialog: false,
          openEnterTokenDialog: true,
          userEmail: data.rt.email,
          forgotModalError: ''
        });
      }
      return null;
    })
    .catch(err => {
      this.setState({
        forgotModalError: err.message
      });
    })
  }
  /**
   * Handle enter token confirm
   * @method
   */
  handleTokenConfirm = () => {
    const {baseUrl, contextRoot} = this.props;
    const {forgotPassword, formValidation} = this.state;
    const requestData = {
      account: forgotPassword.account,
      token: forgotPassword.token
    };
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (forgotPassword.token) {
      tempFormValidation.forgotToken.valid = true;
    } else {
      tempFormValidation.forgotToken.valid = false;
      validate = false;
    }

    this.setState({
      forgotModalError: '',
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/account/verifyToken`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        this.setState({
          openEnterTokenDialog: false,
          openEnterPasswordDialog: true,
          forgotModalError: ''
        });
      }
      return null;
    })
    .catch(err => {
      this.setState({
        forgotModalError: err.message
      });
    })
  }
  /**
   * Handle enter password confirm
   * @method
   */
  handlePasswordConfirm = () => {
    const {baseUrl, contextRoot} = this.props;
    const {forgotPassword, formValidation} = this.state;
    const requestData = {
      account: forgotPassword.account,
      token: forgotPassword.token,
      newPassword: forgotPassword.password
    };
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (forgotPassword.password) {
      tempFormValidation.forgotPassword.valid = true;
    } else {
      tempFormValidation.forgotPassword.valid = false;
      validate = false;
    }

    this.setState({
      forgotModalError: '',
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/account/password/_reset/verify`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        helper.showPopupMsg(t('txt-passwordSuccess'));
        this.closeDialog();
      }
      return null;
    })
    .catch(err => {
      this.setState({
        forgotModalError: err.message
      });
    })
  }
  /**
   * Close forgot password dialog
   * @method
   */
  closeDialog = () => {
    this.setState({
      openFindAccountDialog: false,
      openEnterTokenDialog: false,
      openEnterPasswordDialog: false,
      forgotPassword: {
        account: '',
        token: '',
        password: ''
      },
      userEmail: '',
      forgotModalError: '',
      formValidation: {
        username: {
          valid: true
        },
        password: {
          valid: true
        },
        forgotAccount: {
          valid: true
        },
        forgotToken: {
          valid: true
        },
        forgotPassword: {
          valid: true
        }
      }
    });
  }
  /**
   * Handle enter key for login
   * @method
   * @param {object} event - event object
   */
  handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      this.logon();
    }
  }
  /**
   * Handle language change
   * @method
   * @param {object} event - event object
   */
  changeLanguage = (event) => {
    const {contextRoot} = this.props;
    const redirectURL = contextRoot || '/SCP';

    window.location.href = redirectURL + '/?lng=' + event.target.value;
  }
  /**
   * Set license to true and display login form
   * @method
   */
  onPass = () => {
    this.setState({
      license: true
    });
  }
  /**
   * Set input data change
   * @method
   * @param {string} type - input type ('login' or 'forgotPassword')
   * @param {object} event - event object
   */
  handleDataChange = (type, event) => {
    const {login, forgotPassword} = this.state;

    if (type === 'login') {
      let tempLogin = {...login};
      tempLogin[event.target.name] = event.target.value;  

      this.setState({
        login: tempLogin
      });
    } else if (type === 'forgotPassword') {
      let tempForgotPassword = {...forgotPassword};
      tempForgotPassword[event.target.name] = event.target.value;  

      this.setState({
        forgotPassword: tempForgotPassword
      });
    }
  }
  /**
   * Display login form
   * @method
   * @returns HTML DOM
   */
  renderLogin = () => {
    const {baseUrl, contextRoot, productName, locale} = this.props;
    const {
      dropDownList,
      openFindAccountDialog,
      openEnterTokenDialog,
      openEnterPasswordDialog,
      capsLockWarning,
      login,
      info,
      error,
      formValidation
    } = this.state;

    return (
      <div id='g-login' className='c-center global c-flex fdc'>
        {openFindAccountDialog &&
          this.forgotPasswordDialog('account')
        }

        {openEnterTokenDialog &&
          this.forgotPasswordDialog('token')
        }

        {openEnterPasswordDialog &&
          this.forgotPasswordDialog('password')
        }

        <div id='loingTitle'>
          <img src='/SCP/images/nsguard-logo.png' />
          <span className='title'>{productName}</span>
        </div>

        <div id='loingForm' className='c-flex fdc'>
          <div className='login-group top'>
            <TextField
              id='login-username'
              name='username'
              label={t('login.txt-userAccount')}
              autoFocus={true}
              variant='outlined'
              fullWidth={true}
              size='small'
              required={true}
              error={!formValidation.username.valid}
              helperText={formValidation.username.valid ? '' : t('login.txt-username')}
              value={login.username}
              onChange={this.handleDataChange.bind(this, 'login')} />
          </div>
          <div className='login-group bottom'>
            <TextField
              id='login-password'
              name='password'
              type='password'
              label={t('login.txt-userPassword')}
              variant='outlined'
              fullWidth={true}
              size='small'
              required={true}
              error={!formValidation.password.valid}
              helperText={formValidation.password.valid ? '' : t('login.txt-password')}
              value={login.password}
              onChange={this.handleDataChange.bind(this, 'login')}
              onKeyDown={this.handleKeyDown} />
          </div>
          {capsLockWarning &&
            <div className='caps-lock'>{t('txt-capsLockOn')}!</div>
          }
          <button id='login-btn-login' onClick={this.logon}>{t('login.btn-login')}</button>

          <div className='login-options'>
            <div id='login-startResetPwd' className='c-link first-time' onClick={this.startResetPwd.bind(this, 'newSet')}>{t('txt-fist-login')}?</div>
            <div className='c-link forgot-pass' onClick={this.handleForgotPassword}>{t('txt-forgotPassword')}?</div>
          </div>

          <div className={cx('c-info error-msg', {'c-error': error})}>{info}</div>

          <div className='end'>
            {!_.isEmpty(locale) && locale.length > 1 &&
              <TextField
                id='login-language'
                name='language'
                select
                variant='outlined'
                fullWidth={true}
                size='small'
                value={i18n.language}
                onChange={this.changeLanguage}>
                {dropDownList}
              </TextField>
            }
          </div>
        </div>

        <ResetPwd
          ref={connect => { this.pageResetPwd = connect }}
          baseUrl={baseUrl}
          contextRoot={contextRoot} />
      </div>
    )
  }
  render() {
    const {license} = this.state;

    if (license === null) { //Show loading icon
      return <div id='g-login' className='c-center'></div>
    } else if (license) { //Show login page
      return this.renderLogin();
    } else { //Show license info
      return (
        <License
          from='login'
          onPass={this.onPass} />
      )
    }
  }
}

Login.propTypes = {
  productName: PropTypes.string.isRequired
};

export default Login;