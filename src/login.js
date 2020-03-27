import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'
import i18n from 'i18next'
import qs from 'query-string'
import $ from 'jquery'

import DropDownList from 'react-ui/build/src/components/dropdown'

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
      info: null,
      error: false,
      license: null
    };

    this.ah = getInstance('login');
  }
  componentDidMount() {
    this.checkLicense();
  }
  /**
   * Check license before login
   * @method
   */
  checkLicense = () => {
    const {baseUrl, contextRoot} = this.props;
    const apiArr = [
      {
        url: `${baseUrl}/api/lms/verifyLocal`,
        data: JSON.stringify({}),
        type: 'POST',
        contentType: 'text/plain'
      },
      {
        url: `${baseUrl}/api/lms/verifyOnline`,
        data: JSON.stringify({}),
        type: 'POST',
        contentType: 'text/plain'
      }
    ];

    this.ah.all(apiArr)
    .then(data => {
      let licenseCheck = false;

      if (data) {
        if (data[0].rt.returnCode === '0' && data[1].rt.returnCode === '0') {
          licenseCheck = data[0].rt.isValid === '1' || data[1].rt.isValid === '1';
        }

        this.setState({
          license: licenseCheck
        }, () => {
          if (this.state.license && this.username) {
            this.username.focus();
          }
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
    const username = this.username.value;
    const password = this.password.value;
    let error = '';

    if (username === '') {
      error = t('login.txt-username');
    } else if (password === '') {
      error = t('login.txt-password');
    }

    if (error) {
      this.setState({
        info: error,
        error: true
      });
    } else {
      this.setState({
        info: t('txt-logging-in'),
        error: false
      }, () => {
        this.getLogin(username, password);
      });
    }
  }
  /**
   * Call login api and show login success/fail
   * @method
   * @param {string} username - entered username
   * @param {string} password - entered password
   */
  getLogin = (username, password) => {
    const {baseUrl, contextRoot} = this.props;
    const dataObj = {
      account: username,
      password: password
    };

    this.ah.one({
      url: `${baseUrl}/api/login`,
      data: JSON.stringify(dataObj),
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
   * @param {string} lng - language type ('en' or 'zh')
   */
  changeLng = (lng) => {
    const {contextRoot} = this.props;
    const redirectURL = contextRoot || '/SCP';

    window.location.href = redirectURL + '/?' + qs.stringify({lng});
  }
  /**
   * Set license to true and display login form
   * @method
   */
  onPass = () => {
    this.setState({
      license: true
    }, () => {
      if (this.username) {
        this.username.focus();
      }
    });
  }
  /**
   * Display login form
   * @method
   * @returns HTML DOM
   */
  renderLogin = () => {
    const {baseUrl, contextRoot, productName, locale} = this.props;
    const {info, error} = this.state;

    return (
      <div id='g-login' className='c-center global c-flex fdc'>
        <div id='title'>
          <span className='title'>{productName}</span>
          <span className='subtitle'></span>
        </div>

        <div id='form' className='c-flex fdc'>
          <label htmlFor='username'>{t('login.lbl-username')}</label>
          <input ref={ref => { this.username = ref }} id='username' type='text' />

          <label htmlFor='password'>{t('login.lbl-password')}</label>
          <input ref={ref => { this.password = ref }} id='password' type='password' onKeyDown={this.handleKeyDown.bind(this)} />

          <button className='end' onClick={this.logon}>{t('login.btn-login')}</button>

          <div className='first-time' onClick={this.startResetPwd.bind(this, 'newSet')}>{t('txt-fist-login')}?</div>

          <div className={cx('c-info error-msg', {'c-error': error})}>{info}</div>
          <div className='end actions c-flex aic'>
            {!_.isEmpty(locale) && locale.length > 1 &&
              <DropDownList
                required
                list={_.map(locale, l=>({value:l, text:t(`lng.${l}`)}))}
                value={i18n.language}
                onChange={this.changeLng} />
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