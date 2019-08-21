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
            <Link to='/ChewbaccaWeb/configuration/agent'>
              <span className={`${this.getActiveFrame('agent')}`}>{t('txt-agentManage')}</span>
            </Link>
          </div>
        }
        {sessionRights.Module_FlowAnalysis_Agent_Manage &&
          <div className='frame threat-manage'>
            <Link to='/ChewbaccaWeb/configuration/threats'>
              <span className={`${this.getActiveFrame('threat')}`}>{t('txt-threatManage')}</span>
            </Link>
          </div>
        }
        
        {sessionRights.Module_Honeynet_Manage &&
          <div className='frame honeynet-manage' onClick={this.handleOpen.bind(this, 'openHoneynet', openHoneynet)}>
            <span className={`${this.getActiveFrame('pot') || this.getActiveFrame('mail')}`}>{t('txt-honeyManage')}</span>
            <i className={`c-link fg fg-arrow-${openHoneynet?'top':'bottom'}`}></i>
          </div>
        }
        {openHoneynet &&
          <div className='open-honeynet'>
            <div className='subframe'>
              <Link to='/ChewbaccaWeb/configuration/honeynet/host'>
                <span className={`${this.getActiveFrame('pot')}`}>{t('txt-honeypot')}</span>
              </Link>
            </div>
            <div className='subframe'>
              <Link to='/ChewbaccaWeb/configuration/honeynet/email-report'>
                <span className={`${this.getActiveFrame('mail')}`}>{t('txt-email-report')}</span>
              </Link>
            </div>
          </div>
        }
        {sessionRights.Module_NetworkTopology_Manage &&
          <div className='frame network-topology' onClick={this.handleOpen.bind(this, 'openTopology', openTopology)}>
            <span className={`${this.getActiveFrame('owner') || this.getActiveFrame('ip') || this.getActiveFrame('map')}`}>{t('txt-topology')}</span>
            <i className={`c-link fg fg-arrow-${openTopology?'top':'bottom'}`}></i>
          </div>
        }
        {openTopology &&
          <div className='open-topology'>
            <div className='subframe'>
              <Link to='/ChewbaccaWeb/configuration/topology/owner'>
                <span className={`${this.getActiveFrame('owner')}`}>{t('txt-network-owner')}</span>
              </Link>
            </div>
            <div className='subframe'>
              <Link to='/ChewbaccaWeb/configuration/topology/ip'>
                <span className={`${this.getActiveFrame('ip')}`}>{t('txt-network-ip')}</span>
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
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

const HocConfig = withLocale(Config);
export { Config, HocConfig };