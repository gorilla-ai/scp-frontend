import React, { Component } from 'react'
import { NavLink, Link, Switch, Route } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'

import helper from './helper'
import withLocale from '../../hoc/locale-provider'

let t = null

const INIT = {
  openEdgeManagement: false,
  openTopology: false,
  openAccount: false
}

class Config extends Component {
  constructor(props) {
    super(props)

    t = global.chewbaccaI18n.getFixedT(null, 'connections')
    this.state = _.cloneDeep(INIT)
  }
  test = () => {

  }
  componentDidMount = () => {
    const openEdgeManagement = this.getActiveFrame('edge') || this.getActiveFrame('threat');
    const openTopology = this.getActiveFrame('inventory') || this.getActiveFrame('owner') || this.getActiveFrame('map');
    const openAccount = this.getActiveFrame('account') || this.getActiveFrame('privileges');

    this.setState({
      openEdgeManagement,
      openTopology,
      openAccount
    });
  }
  handleOpen = (name, val) => {
    this.setState({
      [name]: !val
    });
  }
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
  render() {
    const {session} = this.props;
    const {openEdgeManagement, openTopology, openAccount, selected} = this.state;
    let sessionRights = {};

    _.forEach(session.rights, val => {
      sessionRights[val] = true;
    })

    return (
      <div className='left-nav'>
        <div className='frame notifications'>
          <Link to={{pathname: '/ChewbaccaWeb/configuration/notifications', state: 'viewMode'}}>
            <span className={`${this.getActiveFrame('notifications')}`}>{t('notifications.txt-settings')}</span>
          </Link>
        </div>
        <div className='frame edge-manage' onClick={this.handleOpen.bind(this, 'openEdgeManagement', openEdgeManagement)}>
          <span className={`${this.getActiveFrame('edge') || this.getActiveFrame('threat')}`}>{t('txt-edgeManage')}</span>
          <i className={`c-link fg fg-arrow-${openEdgeManagement?'top':'bottom'}`}></i>
        </div>
        {openEdgeManagement &&
          <div className='open-edge'>
            <div className='subframe'>
              <Link to={{pathname: '/ChewbaccaWeb/configuration/edge/edge', state: 'tableList'}}>
                <span className={`${this.getActiveFrame('edge')}`}>{t('txt-edge')}</span>
              </Link>
            </div>
            {/*<div className='subframe'>
              <Link to='/ChewbaccaWeb/configuration/edge/threat'>
                <span className={`${this.getActiveFrame('threat')}`}>{t('txt-threatIntelligence')}</span>
              </Link>
            </div>*/}
          </div>
        }
        {sessionRights.Module_NetworkTopology_Manage &&
          <div className='frame network-topology' onClick={this.handleOpen.bind(this, 'openTopology', openTopology)}>
            <span className={`${this.getActiveFrame('inventory') || this.getActiveFrame('owner') || this.getActiveFrame('map')}`}>{t('txt-topology')}</span>
            <i className={`c-link fg fg-arrow-${openTopology?'top':'bottom'}`}></i>
          </div>
        }
        {openTopology &&
          <div className='open-topology'>
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
        {sessionRights.Module_Syslog_Manage &&
          <div className='frame syslog-manage'>
            <Link to='/ChewbaccaWeb/configuration/syslog'>
              <span className={`${this.getActiveFrame('syslog')}`}>{t('txt-syslogManage')}</span>
            </Link>
          </div>
        }
        {sessionRights.Module_Account_Manage &&
          <div className='frame account-manage' onClick={this.handleOpen.bind(this, 'openAccount', openAccount)}>
            <span className={`${this.getActiveFrame('account') || this.getActiveFrame('privileges')}`}>{t('txt-accountManage')}</span>
            <i className={`c-link fg fg-arrow-${openAccount?'top':'bottom'}`}></i>
          </div>
        }
        {openAccount &&
          <div className='open-account'>
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
        {sessionRights.Module_Account_Manage &&
          <div className='frame service-status last'>
            <Link to='/ChewbaccaWeb/configuration/service-status'>
              <span className={`${this.getActiveFrame('serviceStatus')}`}>{t('txt-serviceStatus')}</span>
            </Link>
          </div>
        }
      </div>
    )
  }
}


Config.propTypes = {
  session: PropTypes.object.isRequired
};

const HocConfig = withLocale(Config);
export { Config, HocConfig };