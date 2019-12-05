import React, { Component } from 'react'
import { NavLink, Link, Switch, Route } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'

import helper from './helper'
import withLocale from '../../hoc/locale-provider'

let t = null;

const INIT = {
  openEdgeManagement: false,
  openTopology: false,
  openAccount: false
};

/**
 * Configuration
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
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
  }
  componentDidMount() {
    const openEdgeManagement = this.getActiveFrame('edge') || this.getActiveFrame('threat');
    const openTopology = this.getActiveFrame('inventory') || this.getActiveFrame('owner') || this.getActiveFrame('map');
    const openAccount = this.getActiveFrame('account') || this.getActiveFrame('privileges');

    this.setState({
      openEdgeManagement,
      openTopology,
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
   * @returns boolean value
   */
  getActiveFrame = (frame) => {
    const path = window.location.pathname;
    const pattern = {
      notifications: '/ChewbaccaWeb/configuration/notifications',
      edge: '/ChewbaccaWeb/configuration/edge/edge',
      threat: '/ChewbaccaWeb/configuration/edge/threat',
      inventory: '/ChewbaccaWeb/configuration/topology/inventory',
      owner: '/ChewbaccaWeb/configuration/topology/owner',
      map: '/ChewbaccaWeb/configuration/topology/map',
      syslog: '/ChewbaccaWeb/configuration/syslog',
      account: '/ChewbaccaWeb/configuration/user/account',
      privileges: '/ChewbaccaWeb/configuration/user/privileges',
      serviceStatus: '/ChewbaccaWeb/configuration/service-status'
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
   * Set the menu class name
   * @method
   * @returns {string} - class name
   */
  getClassName = () => {
    return this.state.showContent ? 'fg fg-arrow-left' : 'fg fg-arrow-right';
  }
  render() {
    const {session} = this.props;
    const {showContent, openEdgeManagement, openTopology, openAccount, selected} = this.state;

    return (
      <div className={cx('left-nav', {'collapse': !showContent})}>
        <div className='item frame notifications'>
          <Link to={{pathname: '/ChewbaccaWeb/configuration/notifications', state: 'viewMode'}}>
            <span className={`${this.getActiveFrame('notifications')}`}>{t('notifications.txt-settings')}</span>
          </Link>
        </div>

        <div className='item frame edge-manage' onClick={this.handleOpen.bind(this, 'openEdgeManagement', openEdgeManagement)}>
          <span className={`${this.getActiveFrame('edge') || this.getActiveFrame('threat')}`}>{t('txt-edgeManage')}</span>
          <i className={`c-link fg fg-arrow-${openEdgeManagement?'top':'bottom'}`}></i>
        </div>

        {openEdgeManagement &&
          <div className='item open-edge'>
            <div className='subframe'>
              <Link to={{pathname: '/ChewbaccaWeb/configuration/edge/edge', state: 'tableList'}}>
                <span className={`${this.getActiveFrame('edge')}`}>{t('txt-edge')}</span>
              </Link>
            </div>
            <div className='subframe'>
              <Link to='/ChewbaccaWeb/configuration/edge/threat'>
                <span className={`${this.getActiveFrame('threat')}`}>{t('txt-threatIntelligence')}</span>
              </Link>
            </div>
          </div>
        }

        <div className='item frame network-topology' onClick={this.handleOpen.bind(this, 'openTopology', openTopology)}>
          <span className={`${this.getActiveFrame('inventory') || this.getActiveFrame('owner') || this.getActiveFrame('map')}`}>{t('txt-topology')}</span>
          <i className={`c-link fg fg-arrow-${openTopology?'top':'bottom'}`}></i>
        </div>

        {openTopology &&
          <div className='item open-topology'>
            <div className='subframe'>
              <Link to={{pathname: '/ChewbaccaWeb/configuration/topology/inventory', state: 'tableList'}}>
                <span className={`${this.getActiveFrame('inventory')}`}>{t('txt-networkInventory')}</span>
              </Link>
            </div>
            <div className='subframe'>
              <Link to={{pathname: '/ChewbaccaWeb/configuration/topology/owner', state: 'tableList'}}>
                <span className={`${this.getActiveFrame('owner')}`}>{t('txt-network-owner')}</span>
              </Link>
            </div>
            <div className='subframe'>
              <Link to='/ChewbaccaWeb/configuration/topology/map'>
                <span className={`${this.getActiveFrame('map')}`}>{t('txt-network-map')}</span>
              </Link>
            </div>
          </div>
        }

        <div className='item frame syslog-manage'>
          <Link to='/ChewbaccaWeb/configuration/syslog'>
            <span className={`${this.getActiveFrame('syslog')}`}>{t('txt-syslogManage')}</span>
          </Link>
        </div>

        <div className='item frame account-manage' onClick={this.handleOpen.bind(this, 'openAccount', openAccount)}>
          <span className={`${this.getActiveFrame('account') || this.getActiveFrame('privileges')}`}>{t('txt-accountManage')}</span>
          <i className={`c-link fg fg-arrow-${openAccount?'top':'bottom'}`}></i>
        </div>

        {openAccount &&
          <div className='item open-account'>
            <div className='subframe'>
              <Link to='/ChewbaccaWeb/configuration/user/account'>
                <span className={`${this.getActiveFrame('account')}`}>{t('txt-account')}</span>
              </Link>
            </div>
            <div className='subframe'>
              <Link to='/ChewbaccaWeb/configuration/user/privileges'>
                <span className={`${this.getActiveFrame('privileges')}`}>{t('txt-privileges')}</span>
              </Link>
            </div>
          </div>
        }

        <div className='item frame service-status last'>
          <Link to='/ChewbaccaWeb/configuration/service-status'>
            <span className={`${this.getActiveFrame('serviceStatus')}`}>{t('txt-serviceStatus')}</span>
          </Link>
        </div>

        <div className={cx('expand-collapse', {'not-allowed': this.getActiveFrame('threat')})} onClick={this.toggleLeftNav}>
          <i className={this.getClassName()}></i>
        </div>
      </div>
    )
  }
}


Config.propTypes = {
  session: PropTypes.object.isRequired
};

const HocConfig = withLocale(Config);
export { Config, HocConfig };