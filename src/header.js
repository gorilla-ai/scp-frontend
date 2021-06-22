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

import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Progress from 'react-ui/build/src/components/progress'

import AccountEdit from './components/configuration/user/accounts/account-edit'
import {BaseDataContext} from './components/common/context'
import helper from './components/common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const a = i18n.getFixedT(null, 'accounts');
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
      showChangePassword: false,
      formData: {
        oldPwd: '',
        newPwd1: '',
        newPwd2: ''
      },
      info: '',
      formValidation: {
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
  componentDidMount() {
    this.setTheme();
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
   * Determine the active page
   * @method
   * @param {string} tab - page sections ('dashboard', 'host', 'threats', 'events', 'soar', soc' and 'configuration')
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
  showChangePassword = () => {
    this.setState({
      showChangePassword: true
    });

    this.handleCloseMenu();
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
   * Display new password content
   * @method
   * @returns HTML DOM
   */
  displayNewPassword = () => {
    const {formData, formValidation} = this.state;

    return (
      <div>
        <div className='form-input'>
          <TextField
            name='oldPwd'
            type='password'
            label={a('oldPwd')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!formValidation.oldPwd.valid}
            helperText={formValidation.oldPwd.valid ? '' : l('login.lbl-password')}
            inputProps={{ maxLength: 64 }}
            value={formData.oldPwd}
            onChange={this.handleDataChange} />
        </div>
        <div className='form-input'>
          <TextField
            name='newPwd1'
            type='password'
            label={a('pwd')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!formValidation.newPwd1.valid}
            helperText={formValidation.newPwd1.valid ? '' : l('login.lbl-password')}
            inputProps={{ maxLength: 64 }}
            value={formData.newPwd1}
            onChange={this.handleDataChange} />
        </div>
        <div className='form-input'>
          <TextField
            name='newPwd2'
            type='password'
            label={a('reenterPwd')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!formValidation.newPwd2.valid}
            helperText={formValidation.newPwd2.valid ? '' : l('login.lbl-password')}
            inputProps={{ maxLength: 64 }}
            value={formData.newPwd2}
            onChange={this.handleDataChange} />
        </div>
      </div>
    )
  }
  /**
   * Show password reset dialog
   * @method
   * @returns ModalDialog
   */
  showChangePasswordDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeChangePasswordDialog},
      confirm: {text: t('txt-confirm'), handler: this.handleChangePasswordConfirm}
    };
    const titleText = l('login.txt-changePassword');

    return (
      <ModalDialog
        id='changePasswordDialog'
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
  handleChangePasswordConfirm = () => {
    const {baseUrl, session} = this.context;
    const {formData, formValidation} = this.state;
    const url = `${baseUrl}/api/account/password`;
    const PASSWORD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@.$%^&*-]).{12,}$/;
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (formData.oldPwd) {
      tempFormValidation.oldPwd.valid = true;
    } else {
      tempFormValidation.oldPwd.valid = false;
      validate = false;
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
      info: '',
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    if (formData.oldPwd === formData.newPwd1) {
      this.showError(a('pwd-samePass'));
      return;
    }

    if (!formData.newPwd1.match(PASSWORD)) {
      this.showError(l('txt-password-pattern'));
      return;
    }

    if (formData.newPwd1 !== formData.newPwd2) {
      this.showError(a('pwd-inconsistent'));
      return;
    }    

    const requestData = {
      account: session.account,
      currentPassword: formData.oldPwd,
      newPassword: formData.newPwd1
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'PATCH',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-changePasswordSuccess'));
        this.closeChangePasswordDialog();
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
   * Set dialog error message
   * @method
   * @param {string} msg - error message
   */
  showError = (msg) => {
    this.setState({
      info: msg
    });
  }
  /**
   * Handle reset password cancel
   * @method
   */
  closeChangePasswordDialog = () => {
    this.setState({
      showChangePassword: false,
      formData: {
        oldPwd: '',
        newPwd1: '',
        newPwd2: ''
      },
      info: '',
      formValidation: {
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
    });
  }
  render() {
    const {contextRoot, sessionRights, session, language} = this.context;
    const {productName} = this.props;
    const {contextAnchor, showChangePassword} = this.state;
    let showLanguage = '';

    if (language === 'zh') {
      showLanguage = 'en';
    } else if (language === 'en') {
      showLanguage = 'zh';
    }

    return (
      <div className='header-wrapper'>
        {showChangePassword &&
          this.showChangePasswordDialog()
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
                <Link id='header-link-dashboard' to='/SCP/dashboard/overview' className={cx('item', {'active': this.getActiveTab('dashboard')})}>{t('txt-dashboard')}</Link>

                {sessionRights.Module_Common &&
                  <Link id='header-link-host' to='/SCP/host' className={cx('item', {'active': this.getActiveTab('host')})}>{t('txt-host-eng')}</Link>
                }

                {/*<Link to='/SCP/dashboard/statisticsUIF' className={cx('item', {'active': this.getActiveTab('dashboard')})}>{t('txt-dashboard')}</Link>*/}

                {sessionRights.Module_Common &&
                  <Link id='header-link-threats' to='/SCP/threats' className={cx('item', {'active': this.getActiveTab('threats')})}>{t('txt-threats')}</Link>
                }
                {sessionRights.Module_Common &&
                  <Link id='header-link-events' to='/SCP/events/syslog' className={cx('item', {'active': this.getActiveTab('events')})}>{t('txt-events')}</Link>
                }
                
                <Link id='header-link-soar' to='/SCP/soar' className={cx('item', {'active': this.getActiveTab('soar')})}>SOAR</Link>                
                {sessionRights.Module_Soc &&
                  <Link id='header-link-soc' to='/SCP/soc/incident' className={cx('item', {'active': this.getActiveTab('soc')})}>{it('txt-soc')}</Link>
                }
                {sessionRights.Module_Config &&
                  <Link id='header-link-config' to='/SCP/configuration/notifications' className={cx('item', {'active': this.getActiveTab('configuration')})}>{t('txt-configuration')}</Link>
                }
              </div>
            </div>

            <div id='header-globe' className='account' onClick={this.handleOpenMenu}>
              <i className='fg fg-globe'/>
              <i className='fg fg-arrow-bottom'/>
            </div>

            <Menu
              anchorEl={contextAnchor}
              keepMounted
              open={Boolean(contextAnchor)}
              onClose={this.handleCloseMenu}>
              <MenuItem id='header-btn-lanuage' onClick={this.changeLng.bind(this, showLanguage)}>{t('lng.' + showLanguage)}</MenuItem>
              <MenuItem id='header-btn-theme' onClick={this.toggleTheme}>{l('toggle-theme')}</MenuItem>
              <MenuItem id='header-btn-account' onClick={this.editAccount}>{l('login.txt-account')}</MenuItem>
              <MenuItem id='header-btn-password' onClick={this.showChangePassword}>{l('login.txt-changePassword')}</MenuItem>
              <MenuItem id='header-btn-logout' onClick={this.logout}>{l('login.btn-logout')}</MenuItem>
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