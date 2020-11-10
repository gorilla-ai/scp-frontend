import React, { Component } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'
import i18n from 'i18next'
import qs from 'query-string'
import $ from 'jquery'

import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import helper from './components/common/helper'
import License from './license'
import ResetPwd from './components/configuration/user/accounts/resetPwd'

import {default as ah, getInstance, createInstance} from 'react-ui/build/src/utils/ajax-helper'

const t = i18n.getFixedT(null, 'app');
const et = i18n.getFixedT(null, 'errors');

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
      login: {
        username: '',
        password: ''
      },
      info: null,
      error: false,
      license: null,
      formValidation: {
        username: {
          valid: true
        },
        password: {
          valid: true
        }
      }
    };

    this.ah = getInstance('login');
  }
  componentDidMount() {
    this.getLanguageList();
    this.checkLicense();
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
    const {baseUrl, contextRoot} = this.props;
    const apiLocal = {
      url: `${baseUrl}/api/lms/verifyLocal`,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'text/plain'
    }

    const apiOnline = {
      url: `${baseUrl}/api/lms/verifyOnline`,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'text/plain'
    }

    let licenseCheck = false

    this.ah.one(apiLocal)
    .then(data => {
      if (data) {
        if (data.rt.returnCode === '0') {
          licenseCheck = data.rt.isValid === '1'
        }
      }

      if (licenseCheck) {
        this.setState({
          license: licenseCheck
        });
      } else {
        this.ah.one(apiOnline)
        .then(data => {
          if (data) {
            if (data.rt.returnCode === '0') {
              licenseCheck = data.rt.isValid === '1'
            }
          }

          this.setState({
            license: licenseCheck
          });
        })
        .catch(err => {
          helper.showPopupMsg('', t('txt-error'), err.message);
        })
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
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
        const redirectURL = contextRoot || '/SCP';
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
   * Handle enter key for login
   * @method
   * @param {object} e - mouseClick events
   */
  handleKeyDown = (e) => {
    if (e.keyCode === 13) {
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
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempLogin = {...this.state.login};
    tempLogin[event.target.name] = event.target.value;  

    this.setState({
      login: tempLogin
    });
  }
  /**
   * Display login form
   * @method
   * @returns HTML DOM
   */
  renderLogin = () => {
    const {baseUrl, contextRoot, productName, locale} = this.props;
    const {dropDownList, login, info, error, formValidation} = this.state;

    return (
      <div id='g-login' className='c-center global c-flex fdc'>
        <div id='title'>
          <img src='/SCP/images/nsguard-logo.png' />
          <span className='title'>{productName}</span>
          <span className='subtitle'></span>
        </div>

        <div id='form' className='c-flex fdc'>
          <div className='login-group'>
            <TextField
              id='username'
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
              onChange={this.handleDataChange} />
          </div>
          <div className='login-group'>
            <TextField
              id='password'
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
              onChange={this.handleDataChange}
              onKeyDown={this.handleKeyDown} />
          </div>
          <button className='end' onClick={this.logon}>{t('login.btn-login')}</button>

          <div className='first-time' onClick={this.startResetPwd.bind(this, 'newSet')}>{t('txt-fist-login')}?</div>

          <div className={cx('c-info error-msg', {'c-error': error})}>{info}</div>

          <div className='end actions c-flex aic'>
            {!_.isEmpty(locale) && locale.length > 1 &&
              <TextField
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
    const {baseUrl, contextRoot} = this.props;
    const {license} = this.state;

    if (license === null) {
      return <div id='g-login' className='c-center'></div>
    } else if (license) {
      return this.renderLogin();
    } else {
      return (
        <License
          baseUrl={baseUrl}
          contextRoot={contextRoot}
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