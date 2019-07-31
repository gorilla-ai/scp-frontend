import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Promise from 'bluebird'
import $ from 'jquery'
import cx from 'classnames'
import qs from 'query-string'
import i18n from 'i18next'

import ContextMenu from 'react-ui/build/src/components/contextmenu'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Progress from 'react-ui/build/src/components/progress'

import AccountEdit from './components/user/accounts/account-edit'
import helper from './components/common/helper'
import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const t = i18n.getFixedT(null, 'connections');
const l = i18n.getFixedT(null, 'app');

class Header extends Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
  }
  placeholder = () => {
  }
  getActiveTab = (tab) => {
    const activeRoute = this.props.location.pathname;
    const getPattern = {
      dashboard: /^(\/ChewbaccaWeb[\/]?(dashboard)?)[\/]?$/i,
      alert: /^(\/ChewbaccaWeb\/alert)[\/]?$/i,
      network: /^(\/ChewbaccaWeb\/network)[\/]?$/i,
      hmd: /^(\/ChewbaccaWeb\/hmd)[\/]?$/i,
      syslog: /^(\/ChewbaccaWeb\/syslog)[\/]?$/i,
      configuration: /^(\/ChewbaccaWeb\/configuration[\s\S]*)[\/]?$/i
    };

    if (activeRoute.match(getPattern[tab])) {
      return true;
    }
    return false;
  }
  changeLng = (lng) => {
    const {location} = this.props;
    const urlParams = qs.parse(location.search);
    let urlString = '';

    _.forEach(urlParams, (value, key) => {
      if (key !== 'lng') {
        urlString += key + '=' + value + '&';
      }
    });

    urlString += qs.stringify({lng});
    window.location.href = window.location.pathname + '?' + urlString;
  }
  logout() {
    const {baseUrl} = this.props;
    const url = `${baseUrl}/api/logout`;

    Progress.startSpin()
    Promise.resolve($.post(url))
      .finally(() => {
        Progress.done()
        document.location.reload()
      })
  }
  showAccountMenu = (evt) => {
    const lngs = _.map(['en', 'zh'], i => ({
      id: i,
      text: t('lng.' + i),
      action: this.changeLng.bind(this, i)
    }));

    const menuItems = [
      ...lngs,
      {
        id: 'account',
        text: l('login.txt-account'),
        action: this.editAccount.bind(this)
      },
      {
        id: 'logout',
        text: l('login.btn-logout'),
        action: this.logout.bind(this)
      }
    ];

    ContextMenu.open(evt, menuItems, 'language-menu')
  }
  editAccount = () => {
    const {session} = this.props;
    this.editor._component.open(session.accountId, 'fromHeader');
  }
  showPopup = () => {
    PopupDialog.alert({
      id: 'modalWindowSmall',
      confirmText: l('btn-ok'),
      display: <div className='content'>{l('txt-updateSuccess')}</div>
    });
  }
  render() {
    const {baseUrl, contextRoot, companyName, session} = this.props;
    let sessionRights = {};

    _.forEach(session.rights, val => {
      sessionRights[val] = true;
    })

    return (
      <div className='header-wrapper'>
        <div className='main-header'>
          <header id='g-header'>
            <div className='title'>
              <Link to='/ChewbaccaWeb'>{companyName}</Link>
            </div>

            <div>
              <div className='main-nav'>
                <Link to='/ChewbaccaWeb/dashboard' className={cx('item', {'active': this.getActiveTab('dashboard')})}>{t('txt-dashboard')}</Link>

                {sessionRights.Module_Syslog_Manage &&
                  <Link to='/ChewbaccaWeb/alert' className={cx('item', {'active': this.getActiveTab('alert')})}>{t('txt-alertMenu')}</Link>
                }
                {sessionRights.Module_FlowAnalysis_Manage &&
                  <Link to='/ChewbaccaWeb/network' className={cx('item', {'active': this.getActiveTab('network')})}>{t('txt-network')}</Link>
                }

                <Link to='/ChewbaccaWeb/hmd' className={cx('item', {'active': this.getActiveTab('hmd')})}>{t('txt-hmd')}</Link>

                {sessionRights.Module_Syslog_Manage &&
                  <Link to='/ChewbaccaWeb/syslog' className={cx('item', {'active': this.getActiveTab('syslog')})}>{t('txt-syslog')}</Link>
                }
                {(sessionRights.Module_FlowAnalysis_Agent_Manage || sessionRights.Module_NetworkTopology_Manage || sessionRights.Module_Honeynet_Manage || sessionRights.Module_Account_Manage || sessionRights.Module_Syslog_Manage) &&
                  <Link to='/ChewbaccaWeb/configuration' className={cx('item', {'active': this.getActiveTab('configuration')})}>{t('txt-configuration')}</Link>
                }
              </div>
            </div>

            <div className='c-link account' onClick={this.showAccountMenu}>
              <i className='fg fg-globe'></i>
              <i className='fg fg-arrow-bottom'></i>
            </div>
          </header>
        </div>

        <AccountEdit
          baseUrl={baseUrl}
          contextRoot={contextRoot}
          ref={ref => { this.editor = ref }}
          onDone={this.showPopup} />
      </div>
    )
  }
}

Header.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  productName: PropTypes.string.isRequired,
  companyName: PropTypes.string.isRequired,
  session: PropTypes.object.isRequired
};

const HocHeader = withRouter(Header);
export { Header, HocHeader };