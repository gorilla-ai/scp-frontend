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
  toggleTheme = () => {
    const theme = this.state.theme === 'dark' ? 'light' : 'dark';

    this.setState({
      theme
    });

    document.documentElement.setAttribute('data-theme', theme);
  }
  /**
   * Open and display account context menu
   * @method
   * @param {object} evt - mouseClick events
   */
  showAccountMenu = (evt) => {
    const lngs = _.map(['en', 'zh'], i => ({
      id: i,
      text: t('lng.' + i),
      action: this.changeLng.bind(this, i)
    }));

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
    const {sessionRights} = this.context;
    const {productName} = this.props;

    return (
      <div className='header-wrapper'>
        <div className='main-header'>
          <header id='g-header'>
            <div className='title'>
              <Link to='/SCP'>{productName}</Link>
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
                  <Link to='/SCP/configuration/edge/edge' className={cx('item', {'active': this.getActiveTab('configuration')})}>{t('txt-configuration')}</Link>
                }
              </div>
            </div>

            <div className='account' onClick={this.showAccountMenu}>
              <i className='fg fg-globe'></i>
              <i className='fg fg-arrow-bottom'></i>
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

const HocHeader = withRouter(Header);
export { Header, HocHeader };