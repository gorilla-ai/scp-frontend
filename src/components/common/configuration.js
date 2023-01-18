import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'

import {downloadWithForm} from 'react-ui/build/src/utils/download'

import helper from './helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

const INIT = {
  openEdgeManagement: false,
  openTopology: false,
  openSyslog: false,
  openAccount: false
};

/**
 * Configuration
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the left menu in Configuration section
 */
class Config extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showContent: true,
      ..._.cloneDeep(INIT)
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const openEdgeManagement = this.getActiveFrame('edge') || this.getActiveFrame('severity');
    const openTopology = this.getActiveFrame('inventory') || this.getActiveFrame('owner');
    const openSyslog = this.getActiveFrame('config') || this.getActiveFrame('pattern');
    const openAccount = this.getActiveFrame('account') || this.getActiveFrame('privileges');

    this.setState({
      openEdgeManagement,
      openTopology,
      openSyslog,
      openAccount
    });
  }
  /**
   * Toggle the submenu on/off
   * @method
   * @param {object} name - menu to be toggled
   * @param {boolean} val - true/false
   */
  handleOpen = (name, val) => {
    this.setState({
      [name]: !val
    });
  }
  /**
   * Determine the current active path
   * @method
   * @param {object} frame - menu to be toggled
   * @returns boolean true/false
   */
  getActiveFrame = (frame) => {
    const path = window.location.pathname;
    const pattern = {
      notifications: '/SCP/configuration/notifications',
      threat: '/SCP/configuration/threat',
      edge: '/SCP/configuration/edge/edge',
      severity: '/SCP/configuration/edge/severity',
      es: '/SCP/configuration/es',
      inventory: '/SCP/configuration/topology/inventory',
      owner: '/SCP/configuration/topology/owner',
      config: '/SCP/configuration/syslog/config',
      pattern: '/SCP/configuration/syslog/pattern',
      audit: '/SCP/configuration/audit',
      account: '/SCP/configuration/user/account',
      privileges: '/SCP/configuration/user/privileges',
      serviceStatus: '/SCP/configuration/service-status',
      productInfo: '/SCP/configuration/product-info'
    };

    return path === pattern[frame];
  }
  /**
   * Toggle (show/hide) the left menu
   * @method
   */
  toggleLeftNav = () => {
    if (this.getActiveFrame('threat')) { //Disable the functionality for Threat Intelligent page
      return;
    }

    this.setState({
      showContent: !this.state.showContent
    });
  }
  /**
   * Logs download
   * @method
   */
  downloadLogs = () => {
    const {baseUrl, contextRoot} = this.props;
    const url = `${baseUrl}${contextRoot}/api/common/logs/_export`;
    const requestData = {};

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  render() {
    const {hidden} = this.props;
    const {showContent, openEdgeManagement, openTopology, openSyslog, openAccount, selected} = this.state;

    if (hidden) { //For Cypress testing purpose
      return null;
    }

    return (
      <div className={cx('left-nav', {'collapse': !showContent})}>
        <div className='item frame notifications'>
          <Link id='config-link-notify' to={{pathname: '/SCP/configuration/notifications', state: 'viewMode'}}>
            <span className={`${this.getActiveFrame('notifications')}`}>{t('notifications.txt-settings')}</span>
          </Link>
        </div>

        <div className='item frame threat'>
          <Link id='config-link-threat' to={{pathname: '/SCP/configuration/threat', state: 'viewMode'}}>
            <span className={`${this.getActiveFrame('threat')}`}>{t('txt-threatIntelligence')}</span>
          </Link>
        </div>

        <div id='config-link-edge' className='item frame edge-manage' onClick={this.handleOpen.bind(this, 'openEdgeManagement', openEdgeManagement)}>
          <span className={`${this.getActiveFrame('edge')}`}>{t('txt-edgeManage')}</span>
          <i className={`c-link fg fg-arrow-${openEdgeManagement ? 'top' : 'bottom'}`}></i>
        </div>

        {openEdgeManagement &&
          <div className='item open-edge'>
            <div className='subframe'>
              <Link id='config-link-edges' to={{pathname: '/SCP/configuration/edge/edge', state: 'tableList'}}>
                <span className={`${this.getActiveFrame('edge')}`}>{t('txt-edge')}</span>
              </Link>
            </div>
            <div className='subframe'>
              <Link id='config-link-severity' to='/SCP/configuration/edge/severity'>
                <span className={`${this.getActiveFrame('severity')}`}>{t('threat-severity-mapping.txt-severityMapping')}</span>
              </Link>
            </div>
          </div>
        }

        <div className='item frame es-manage'>
          <Link id='config-link-es' to='/SCP/configuration/es'>
            <span className={`${this.getActiveFrame('es')}`}>{t('txt-esManage')}</span>
          </Link>
        </div>

        <div id='config-link-topology' className='item frame network-topology' onClick={this.handleOpen.bind(this, 'openTopology', openTopology)}>
          <span className={`${this.getActiveFrame('inventory') || this.getActiveFrame('owner')}`}>{t('txt-topology')}</span>
          <i className={`c-link fg fg-arrow-${openTopology ? 'top' : 'bottom'}`}></i>
        </div>

        {openTopology &&
          <div className='item open-topology'>
            <div className='subframe'>
              <Link id='config-link-inventory' to={{pathname: '/SCP/configuration/topology/inventory', state: 'tableList'}}>
                <span className={`${this.getActiveFrame('inventory')}`}>{t('txt-networkInventory')}</span>
              </Link>
            </div>
            <div className='subframe'>
              <Link id='config-link-owner' to={{pathname: '/SCP/configuration/topology/owner', state: 'tableList'}}>
                <span className={`${this.getActiveFrame('owner')}`}>{t('txt-network-owner')}</span>
              </Link>
            </div>
          </div>
        }

        <div id='config-link-syslog' className='item frame syslog' onClick={this.handleOpen.bind(this, 'openSyslog', openSyslog)}>
          <span className={`${this.getActiveFrame('config') || this.getActiveFrame('pattern')}`}>{t('txt-syslogManage')}</span>
          <i className={`c-link fg fg-arrow-${openSyslog ? 'top' : 'bottom'}`}></i>
        </div>

        {openSyslog &&
          <div className='item open-syslog'>
            <div className='subframe'>
              <Link id='config-link-syslogs' to='/SCP/configuration/syslog/config'>
                <span className={`${this.getActiveFrame('config')}`}>{t('txt-syslogConfig')}</span>
              </Link>
            </div>
            <div className='subframe'>
              <Link id='config-link-pattern' to='/SCP/configuration/syslog/pattern'>
                <span className={`${this.getActiveFrame('pattern')}`}>{t('txt-systemDefinedPattern')}</span>
              </Link>
            </div>
          </div>
        }

        <div className='item frame audit-log'>
          <Link id='config-link-audit' to='/SCP/configuration/audit'>
            <span className={`${this.getActiveFrame('audit')}`}>{t('txt-auditLog')}</span>
          </Link>
        </div>

        <div id='config-link-account' className='item frame account-manage' onClick={this.handleOpen.bind(this, 'openAccount', openAccount)}>
          <span className={`${this.getActiveFrame('account') || this.getActiveFrame('privileges')}`}>{t('txt-accountManage')}</span>
          <i className={`c-link fg fg-arrow-${openAccount ? 'top' : 'bottom'}`}></i>
        </div>

        {openAccount &&
          <div className='item open-account'>
            <div className='subframe'>
              <Link id='config-link-accounts' to='/SCP/configuration/user/account'>
                <span className={`${this.getActiveFrame('account')}`}>{t('txt-account')}</span>
              </Link>
            </div>
            <div className='subframe'>
              <Link id='config-link-privileges' to='/SCP/configuration/user/privileges'>
                <span className={`${this.getActiveFrame('privileges')}`}>{t('txt-privileges')}</span>
              </Link>
            </div>
          </div>
        }

        <div className='item frame service-status'>
          <Link id='config-link-service' to='/SCP/configuration/service-status'>
            <span className={`${this.getActiveFrame('serviceStatus')}`}>{t('txt-serviceStatus')}</span>
          </Link>
        </div>

        <div className='item frame product-info'>
          <Link id='config-link-product' to='/SCP/configuration/product-info'>
            <span className={`${this.getActiveFrame('productInfo')}`}>{t('txt-productInfo')}</span>
          </Link>
        </div>

        <div id='config-link-feedback' className='item frame issues-feedback last' onClick={this.downloadLogs}>
          <span>{t('txt-issuesFeedback')}</span>
        </div>

        <div className={cx('expand-collapse', {'not-allowed': this.getActiveFrame('threat')})} onClick={this.toggleLeftNav}>
          <i className={`fg fg-arrow-${showContent ? 'left' : 'right'}`}></i>
        </div>
      </div>
    )
  }
}

Config.propTypes = {
};

export default Config;