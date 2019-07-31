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
  openHoneynet: false,
  openTopology: false,
  openAccount: false
}

class Config extends Component {
  constructor(props) {
    super(props)

    t = global.chewbaccaI18n.getFixedT(null, 'connections')
    this.state = _.cloneDeep(INIT)
  }
  componentWillMount = () => {
    const openHoneynet = this.getActiveFrame('pot') || this.getActiveFrame('mail')
    const openTopology = this.getActiveFrame('owner') || this.getActiveFrame('ip') || this.getActiveFrame('map')
    const openAccount = this.getActiveFrame('account') || this.getActiveFrame('privileges')

    this.setState({
      openHoneynet,
      openTopology,
      openAccount
    })
  }
  handleOpen = (name, val) => {
    this.setState({
      [name]: !val
    })
  }
  getActiveFrame = (frame) => {
    const path = window.location.pathname

    const pattern = {
      agent: '/ChewbaccaWeb/configuration/agent',
      threat: '/ChewbaccaWeb/configuration/threats',
      pot: '/ChewbaccaWeb/configuration/honeynet/host',
      mail: '/ChewbaccaWeb/configuration/honeynet/email-report',
      owner: '/ChewbaccaWeb/configuration/topology/owner',
      ip: '/ChewbaccaWeb/configuration/topology/ip',
      map: '/ChewbaccaWeb/configuration/topology/map',
      syslog: '/ChewbaccaWeb/configuration/syslog',
      account: '/ChewbaccaWeb/configuration/user/account',
      privileges: '/ChewbaccaWeb/configuration/user/privileges',
      serviceStatus: '/ChewbaccaWeb/configuration/service-status'
    }

    return path === pattern[frame]
  }
  render() {
    const {session} = this.props;
    const {openHoneynet, openTopology, openAccount, selected} = this.state
    let sessionRights = {};

    _.forEach(session.rights, val => {
      sessionRights[val] = true;
    })

    return (
      <div className='left-nav search config'>
        {sessionRights.Module_FlowAnalysis_Agent_Manage &&
          <div className='frame agent-manage'>
            <span className={`${this.getActiveFrame('agent')}`}><Link to='/ChewbaccaWeb/configuration/agent'>{t('txt-agentManage')}</Link></span>
          </div>
        }
        {sessionRights.Module_FlowAnalysis_Agent_Manage &&
          <div className='frame threat-manage'>
            <span className={`${this.getActiveFrame('threat')}`}><Link to='/ChewbaccaWeb/configuration/threats'>{t('txt-threatManage')}</Link></span>
          </div>
        }
        
        {sessionRights.Module_Honeynet_Manage &&
          <div className='frame honeynet-manage'>
            <span className={`${this.getActiveFrame('pot') || this.getActiveFrame('mail')}`}>{t('txt-honeyManage')}</span>
            <i className={`c-link fg fg-arrow-${openHoneynet?'top':'bottom'}`} onClick={this.handleOpen.bind(this, 'openHoneynet', openHoneynet)}></i>
          </div>
        }
        {openHoneynet &&
          <div className='open-honeynet'>
            <div className='subframe'><span className={`${this.getActiveFrame('pot')}`}><Link to='/ChewbaccaWeb/configuration/honeynet/host'>{t('txt-honeypot')}</Link></span></div>
            <div className='subframe'><span className={`${this.getActiveFrame('mail')}`}><Link to='/ChewbaccaWeb/configuration/honeynet/email-report'>{t('txt-email-report')}</Link></span></div>
          </div>
        }
        {sessionRights.Module_NetworkTopology_Manage &&
          <div className='frame network-topology'>
            <span className={`${this.getActiveFrame('owner') || this.getActiveFrame('ip') || this.getActiveFrame('map')}`}>{t('txt-topology')}</span>
            <i className={`c-link fg fg-arrow-${openTopology?'top':'bottom'}`} onClick={this.handleOpen.bind(this, 'openTopology', openTopology)}></i>
          </div>
        }
        {openTopology &&
          <div className='open-topology'>
            <div className='subframe'><span className={`${this.getActiveFrame('owner')}`}><Link to='/ChewbaccaWeb/configuration/topology/owner'>{t('txt-network-owner')}</Link></span></div>
            <div className='subframe'><span className={`${this.getActiveFrame('ip')}`}><Link to='/ChewbaccaWeb/configuration/topology/ip'>{t('txt-network-ip')}</Link></span></div>
            <div className='subframe'><span className={`${this.getActiveFrame('map')}`}><Link to='/ChewbaccaWeb/configuration/topology/map'>{t('txt-network-map')}</Link></span></div>  
          </div>
        }
        {sessionRights.Module_Syslog_Manage &&
          <div className='frame syslog-manage'>
            <span className={`${this.getActiveFrame('syslog')}`}><Link to='/ChewbaccaWeb/configuration/syslog'>{t('txt-syslogManage')}</Link></span>
          </div>
        }
        {sessionRights.Module_Account_Manage &&
          <div className='frame account-manage'>
            <span className={`${this.getActiveFrame('account') || this.getActiveFrame('privileges')}`}>{t('txt-accountManage')}</span>
            <i className={`c-link fg fg-arrow-${openAccount?'top':'bottom'}`} onClick={this.handleOpen.bind(this, 'openAccount', openAccount)}></i>
          </div>
        }
        {openAccount &&
          <div className='open-account'>
            <div className='subframe'><span className={`${this.getActiveFrame('account')}`}><Link to='/ChewbaccaWeb/configuration/user/account'>{t('txt-account')}</Link></span></div>
            <div className='subframe'><span className={`${this.getActiveFrame('privileges')}`}><Link to='/ChewbaccaWeb/configuration/user/privileges'>{t('txt-privileges')}</Link></span></div>
          </div>
        }
        {sessionRights.Module_Account_Manage &&
          <div className='frame service-status last'>
            <span className={`${this.getActiveFrame('serviceStatus')}`}><Link to='/ChewbaccaWeb/configuration/service-status'>{t('txt-serviceStatus')}</Link></span>
          </div>
        }
      </div>
    )
  }
}


Config.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

const HocConfig = withLocale(Config);
export { Config, HocConfig };