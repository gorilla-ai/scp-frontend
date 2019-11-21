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

import ResetPwd from './components/configuration/user/accounts/resetPwd'
import withLocale from './hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const t = i18n.getFixedT(null, 'app');
const et = i18n.getFixedT(null, 'errors');

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
      error: false
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.username.focus();
  }
  /**
   * Handle login confirm
   * @method
   * @param none
   * @returns none
   */
  logon = () =>  {
    const {contextRoot} = this.context;
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
   * @returns none
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
      const redirectURL = contextRoot || '/ChewbaccaWeb';
      window.location.href = redirectURL;
    })
    .catch(err => {
      if (err.message === et('-1005')) {
        this.setState({
          info: null,
          error: false
        }, () => {
          this.startResetPwd();
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
   * @method
   * @param none
   * @returns none
   */
  startResetPwd = () => {
    this.pageResetPwd.openResetPwd();
  }
  /**
   * Handle enter key for login
   * @method
   * @param {object} e - mouseClick events
   * @returns none
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
   * @returns none
   */
  changeLng = (lng) => {
    const {contextRoot} = this.props;
    const redirectURL = contextRoot || '/ChewbaccaWeb';

    window.location.href = redirectURL + '/?' + qs.stringify({lng});
  }
  render() {
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

          <div className={cx('c-info', {'c-error': error})}>{info}</div>
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
}

Login.propTypes = {
};

export default withLocale(Login);