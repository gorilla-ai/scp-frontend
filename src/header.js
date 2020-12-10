import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Promise from 'bluebird'
import $ from 'jquery'
import cx from 'classnames'
import queryString from 'query-string'
import i18n from 'i18next'
import _ from 'lodash'

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Progress from 'react-ui/build/src/components/progress'

import AccountEdit from './components/configuration/user/accounts/account-edit'
import {BaseDataContext} from './components/common/context';
import helper from './components/common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const t = i18n.getFixedT(null, 'connections');
const l = i18n.getFixedT(null, 'app');
const it = i18n.getFixedT(null, 'incident');

/**
 * Header
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the header section
 */
class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      theme: '',
      contextAnchor: null,
      showResetPassword: false,
      newPassword: '',
      info: '',
      formValidation: {
        password: {
          valid: true
        }
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.setTheme();
    //this.getUserConfig();
  }
  /**
   * Set site theme
   * @method
   */
  setTheme = () => {
    this.setState({
      theme: this.props.themeName
    });
  }
  /**
   * Get and set user config for site theme
   * @method
   */
  getUserConfig = () => {
    const {baseUrl, session} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/account/theme?accountId=${session.accountId}`,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        this.setState({
          theme: data
        });

        document.documentElement.setAttribute('data-theme', data);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Determine the active page
   * @method
   * @param {string} tab - page sections ('dashboard', 'host', 'threats', 'events', 'soc' and 'configuration')
   * @returns true/false boolean value
   */
  getActiveTab = (tab) => {
    const activeRoute = this.props.location.pathname;
    const pattern = /^(\/SCP[\/]?)$/i;
    const pathArr = activeRoute.split('/');

    if (activeRoute.match(pattern) && tab === 'dashboard') {
      return true;
    }
    return pathArr[2] === tab;
  }
  /**
   * Handle logout
   * @method
   */
  logout = () => {
    const {baseUrl, locale} = this.context;
    const url = `${baseUrl}/api/logout`;

    this.handleCloseMenu();
    Progress.startSpin();

    Promise.resolve($.post(url))
      .finally(() => {
        Progress.done();
        window.location.href = '/SCP?lng=' + locale;
      })
  }
  /**
   * Toggle theme for the site
   * @method
   */
  toggleTheme = () => {
    const {baseUrl, session} = this.context;
    const theme = this.state.theme === 'dark' ? 'light' : 'dark';
    const url = `${baseUrl}/api/account/theme?accountId=${session.accountId}&theme=${theme}`;
    const requestData = {};

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      this.setState({
        theme
      });
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.handleCloseMenu();
    this.props.setThemeName(theme);

    document.documentElement.setAttribute('data-theme', theme);
  }
  /**
   * Handle language change
   * @method
   * @param {string} lng - language type ('en' or 'zh')
   */
  changeLng = (lng) => {
    const urlParams = queryString.parse(location.search);
    let urlString = '';

    _.forEach(urlParams, (value, key) => {
      if (key !== 'lng') {
        urlString += key + '=' + value + '&';
      }
    });

    this.handleCloseMenu();

    urlString += queryString.stringify({lng});
    window.location.href = window.location.pathname + '?' + urlString;
  }
  /**
   * Handle open menu
   * @method
   * @param {object} event - event object
   */
  handleOpenMenu = (event) => {
    this.setState({
      contextAnchor: event.currentTarget
    });
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null
    });
  }
  /**
   * Handle account edit action
   * @method
   */
  editAccount = () => {
    const {session} = this.context;

    this.handleCloseMenu();
    this.editor.openAccount(session.accountId, 'fromHeader');
  }
  /**
   * Show account edit success message
   * @method
   */
  showPopup = () => {
    PopupDialog.alert({
      id: 'modalWindowSmall',
      confirmText: l('btn-ok'),
      display: <div className='content'>{l('txt-updateSuccess')}</div>
    });
  }
  /**
   * Show reset password dialog and set active account name
   * @method
   * @returns HTML DOM
   */
  showResetPassword = () => {
    this.setState({
      showResetPassword: true
    });

    this.handleCloseMenu();
  }
  /**
   * Handle password input box
   * @method
   * @param {object} event - event object
   */
  handlePasswordChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }
  /**
   * Display new password content
   * @method
   * @returns HTML DOM
   */
  displayNewPassword = () => {
    const {newPassword, formValidation} = this.state;

    return (
      <div className='group'>
        <TextField
          name='newPassword'
          type='password'
          label={t('txt-password')}
          variant='outlined'
          fullWidth
          size='small'
          required
          error={!formValidation.password.valid}
          helperText={formValidation.password.valid ? '' : t('txt-required')}
          value={newPassword}
          onChange={this.handlePasswordChange} />
      </div>
    )
  }
  /**
   * Show password reset dialog
   * @method
   * @returns ModalDialog
   */
  showResetPasswordDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeResetPasswordDialog},
      confirm: {text: t('txt-confirm'), handler: this.handleResetPasswordConfirm}
    };
    const titleText = t('txt-resetPassword');

    return (
      <ModalDialog
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        info={this.state.info}
        closeAction='cancel'>
        {this.displayNewPassword()}
      </ModalDialog>
    )
  }
  /**
   * Handle reset password confirm
   * @method
   */
  handleResetPasswordConfirm = () => {
    const {baseUrl, session} = this.context;
    const {newPassword, formValidation} = this.state;
    const url = `${baseUrl}/api/account/password/_reset`;
    const requestData = {
      account: session.account,
      newPassword
    };
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (newPassword) {
      formValidation.password.valid = true;
    } else {
      formValidation.password.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-resetPasswordSuccess'));
        this.closeResetPasswordDialog();
      }
      return null;
    })
    .catch(err => {
      this.setState({
        info: err.message
      });
    })
  }
  /**
   * Handle reset password cancel
   * @method
   */
  closeResetPasswordDialog = () => {
    this.setState({
      showResetPassword: false,
      newPassword: '',
      info: '',
      formValidation: {
        password: {
          valid: true
        }
      }
    });
  }
  render() {
    const {contextRoot, sessionRights, session, language} = this.context;
    const {productName} = this.props;
    const {contextAnchor, showResetPassword} = this.state;
    let isSOC = session.roles.includes('SOC Executor') ||
        session.roles.includes('SOC Analyzer')  ||
        session.roles.includes('SOC Supervior')  ||
        session.roles.includes('SOC Supervisor')
    let showLanguage = '';

    if (language === 'zh') {
      showLanguage = 'en';
    } else if (language === 'en') {
      showLanguage = 'zh';
    }

    return (
      <div className='header-wrapper'>
        {showResetPassword &&
          this.showResetPasswordDialog()
        }

        <div className='main-header'>
          <header id='g-header'>
            <div className='title'>
              <Link to='/SCP'>
                <img src={contextRoot + '/images/nsguard-logo.png'} />{productName}
              </Link>
            </div>

            <div>
              <div className='main-nav'>
                <Link to='/SCP/dashboard/overview' className={cx('item', {'active': this.getActiveTab('dashboard')})}>{t('txt-dashboard')}</Link>

                <Link to='/SCP/host' className={cx('item', {'active': this.getActiveTab('host')})}>{t('txt-host')}</Link>

                {/*<Link to='/SCP/dashboard/statisticsUIF' className={cx('item', {'active': this.getActiveTab('dashboard')})}>{t('txt-dashboard')}</Link>*/}

                {sessionRights.Module_Common &&
                  <Link to='/SCP/threats' className={cx('item', {'active': this.getActiveTab('threats')})}>{t('txt-threats')}</Link>
                }
                {sessionRights.Module_Common &&
                  <Link to='/SCP/events/syslog' className={cx('item', {'active': this.getActiveTab('events')})}>{t('txt-events')}</Link>
                }
                {isSOC &&
                  <Link to='/SCP/soc/incident' className={cx('item', {'active': this.getActiveTab('soc')})}>{it('txt-soc')}</Link>
                }
                {sessionRights.Module_Config &&
                  <Link to='/SCP/configuration/notifications' className={cx('item', {'active': this.getActiveTab('configuration')})}>{t('txt-configuration')}</Link>
                }
              </div>
            </div>

            <div className='account' onClick={this.handleOpenMenu}>
              <i className='fg fg-globe'/>
              <i className='fg fg-arrow-bottom'/>
            </div>

            <Menu
              anchorEl={contextAnchor}
              keepMounted
              open={Boolean(contextAnchor)}
              onClose={this.handleCloseMenu}>
              <MenuItem onClick={this.changeLng.bind(this, showLanguage)}>{t('lng.' + showLanguage)}</MenuItem>
              <MenuItem onClick={this.toggleTheme}>{l('toggle-theme')}</MenuItem>
              <MenuItem onClick={this.editAccount}>{l('login.txt-account')}</MenuItem>
              <MenuItem onClick={this.showResetPassword}>{l('login.txt-resetPassword')}</MenuItem>
              <MenuItem onClick={this.logout}>{l('login.btn-logout')}</MenuItem>
            </Menu>
          </header>
        </div>

        <AccountEdit
          ref={ref => { this.editor = ref }}
          onDone={this.showPopup} />
      </div>
    )
  }
}

Header.contextType = BaseDataContext;

Header.propTypes = {
  productName: PropTypes.string.isRequired
};

export default withRouter(Header);