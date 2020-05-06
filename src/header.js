import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Promise from 'bluebird'
import $ from 'jquery'
import cx from 'classnames'
import queryString from 'query-string'
import i18n from 'i18next'

import ContextMenu from 'react-ui/build/src/components/contextmenu'
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
      theme: 'light'
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    // this.getUserConfig();
  }
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
   * @param {string} tab - page sections ('dashboard', 'alert', 'events' and 'configuration')
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

    helper.getAjaxData('POST', url, {})
    .then(data => {
      this.setState({
        theme
      });
      return null;
    })

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

    urlString += queryString.stringify({lng});
    window.location.href = window.location.pathname + '?' + urlString;
  }
  /**
   * Open and display account context menu
   * @method
   * @param {object} evt - mouseClick events
   */
  showAccountMenu = (evt) => {
    const {language} = this.context;
    let showLanguage = '';

    if (language === 'zh') {
      showLanguage = 'en';
    } else if (language === 'en') {
      showLanguage = 'zh';
    }

    const lngs = [{
      id: showLanguage,
      text: t('lng.' + showLanguage),
      action: this.changeLng.bind(this, showLanguage)
    }];

    const themes = [{
      id: 'themes',
      text: l('toggle-theme'),
      action: this.toggleTheme
    }];

    const menuItems = [
      ...lngs,
      ...themes,
      {
        id: 'account',
        text: l('login.txt-account'),
        action: this.editAccount
      },
      {
        id: 'logout',
        text: l('login.btn-logout'),
        action: this.logout
      }
    ];

    ContextMenu.open(evt, menuItems, 'language-menu')
  }
  /**
   * Handle account edit action
   * @method
   */
  editAccount = () => {
    const {session} = this.context;

    this.editor._component.openAccount(session.accountId, 'fromHeader');
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
  render() {
    const {contextRoot, sessionRights} = this.context;
    const {productName} = this.props;

    return (
      <div className='header-wrapper'>
        <div className='main-header'>
          <header id='g-header'>
            <div className='title'>
              <Link to='/SCP'>
                <img src={contextRoot + '/images/nsguard-logo.png'} />{productName}
              </Link>
            </div>

            <div>
              <div className='main-nav'>
                {sessionRights.Module_Common &&
                  <Link to='/SCP/dashboard/statistics' className={cx('item', {'active': this.getActiveTab('dashboard')})}>{t('txt-dashboard')}</Link>
                }
                {sessionRights.Module_Common &&
                  <Link to='/SCP/threats' className={cx('item', {'active': this.getActiveTab('threats')})}>{t('txt-threats')}</Link>
                }
                {sessionRights.Module_Common &&
                  <Link to='/SCP/events/syslog' className={cx('item', {'active': this.getActiveTab('events')})}>{t('txt-events')}</Link>
                }
                {sessionRights.Module_Config &&
                  <Link to='/SCP/soc/incident' className={cx('item', {'active': this.getActiveTab('soc')})}>{it('txt-soc')}</Link>
                }
                {sessionRights.Module_Config &&
                  <Link to='/SCP/configuration/edge/edge' className={cx('item', {'active': this.getActiveTab('configuration')})}>{t('txt-configuration')}</Link>
                }



              </div>
            </div>

            <div className='account' onClick={this.showAccountMenu}>
              <i className='fg fg-globe'/>
              <i className='fg fg-arrow-bottom'/>
            </div>
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