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

import AccountEdit from './components/configuration/user/accounts/account-edit'
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
    const pattern = /^(\/ChewbaccaWeb[\/]?)$/i;
    const pathArr = activeRoute.split('/');

    if (activeRoute.match(pattern) && tab === 'dashboard') {
      return true;
    }
    return pathArr[2] === tab;
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
    let eventsLink = '/ChewbaccaWeb/events/endpoint';

    _.forEach(session.rights, val => {
      sessionRights[val] = true;
    })

    if (sessionRights.Module_FlowAnalysis_Manage) {
      eventsLink = '/ChewbaccaWeb/events/netflow';
    } else if (sessionRights.Module_Syslog_Manage) {
      eventsLink = '/ChewbaccaWeb/events/syslog';
    }

    return (
      <div className='header-wrapper'>
        <div className='main-header'>
          <header id='g-header'>
            <div className='title'>
              <Link to='/ChewbaccaWeb'>{companyName}</Link>
            </div>

            <div>
              <div className='main-nav'>
                <Link to='/ChewbaccaWeb/dashboard/statistics' className={cx('item', {'active': this.getActiveTab('dashboard')})}>{t('txt-dashboard')}</Link>

                <Link to='/ChewbaccaWeb/alert' className={cx('item', {'active': this.getActiveTab('alert')})}>{t('txt-alertMenu')}</Link>

                <Link to={eventsLink} className={cx('item', {'active': this.getActiveTab('events')})}>{t('txt-events')}</Link>

                {(sessionRights.Module_FlowAnalysis_Agent_Manage || sessionRights.Module_NetworkTopology_Manage || sessionRights.Module_Honeynet_Manage || sessionRights.Module_Account_Manage || sessionRights.Module_Syslog_Manage) &&
                  <Link to='/ChewbaccaWeb/configuration/agent' className={cx('item', {'active': this.getActiveTab('configuration')})}>{t('txt-configuration')}</Link>
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