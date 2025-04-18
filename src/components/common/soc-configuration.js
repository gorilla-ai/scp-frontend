import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import cx from 'classnames'
import _ from 'lodash'

import {downloadWithForm} from 'react-ui/build/src/utils/download'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

import constants from '../constant/constant-incidnet'
import helper from './helper'

let t = null;
let it = null;

const INIT = {
  openIncidentManagement: false,
  openConfigManagement: false
};

/**
 * SOC-Configuration
 * @class
 * @author Kenneth Chiao <kennethchiao@ns-guard.com>
 * @summary A react component to show the left menu in SOC-Configuration section
 */
class SocConfig extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showContent: true,
      accountRoleType:[constants.soc.SOC_Analyzer],
      ..._.cloneDeep(INIT)
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const openIncidentManagement = this.getActiveFrame('incident') || this.getActiveFrame('incidentLog') || this.getActiveFrame('incidentSOCRule') || this.getActiveFrame('incidentSOCFlow') || this.getActiveFrame('incidentSOCReport') || this.getActiveFrame('incidentManagement');
    const openConfigManagement = this.getActiveFrame('incidentSettingSOC') || this.getActiveFrame('incidentSettingISAC');

    this.setState({
      accountRoleType: this.props.session.roles,
      openIncidentManagement,
      openConfigManagement
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
      incident: '/SCP/soc/incident',
      incidentLog:'/SCP/soc/incident-log',
      incidentSOCRule:'/SCP/soc/incident-rule-template',
      incidentSOCFlow:'/SCP/soc/incident-flow',
      incidentSOCReport:'/SCP/soc/incident-report',
      incidentSettingISAC:'/SCP/soc/incident-ISAC',
      incidentSettingSOC:'/SCP/soc/incident-SOC',
      incidentManagement:'/SCP/soc/incident-management'
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
    const {hidden, accountType} = this.props;
    const {showContent, openIncidentManagement, openConfigManagement} = this.state;

    if (hidden) { //For Cypress testing purpose
      return null;
    }

    return (
      <div className={cx('left-nav', {'collapse': !showContent})}>
        <div id='config-link-edge' className='item frame edge-manage' onClick={this.handleOpen.bind(this, 'openIncidentManagement', openIncidentManagement)}>
          <span className={`${this.getActiveFrame('incident') || this.getActiveFrame('incidentLog') || this.getActiveFrame('incidentSOCRule') || this.getActiveFrame('incidentSOCFlow') || this.getActiveFrame('incidentSOCReport') || this.getActiveFrame('incidentManagement')
            }`}>{it('txt-incident-management')}</span>
          <i className={`c-link fg fg-arrow-${openIncidentManagement ? 'top' : 'bottom'}`} />
        </div>

        {openIncidentManagement &&
          <div className='item open-edge'>
            <div className='subframe'>
              <Link to='/SCP/soc/incident'>
                <span className={`${this.getActiveFrame('incident')}`}>{it('txt-incident-sign')}</span>
              </Link>
            </div>
            <div className='subframe'>
              <Link to='/SCP/soc/incident-management'>
                <span className={`${this.getActiveFrame('incidentManagement')}`}>{it('txt-incident-modify')}</span>
              </Link>
            </div>

            <div className='subframe'>
              <Link to='/SCP/soc/incident-log'>
                <span className={`${this.getActiveFrame('incidentLog')}`}>{it('txt-incident-log-management')}</span>
              </Link>
            </div>

            {accountType === constants.soc.NONE_LIMIT_ACCOUNT && (_.includes(this.state.accountRoleType, constants.soc.SOC_Analyzer) || _.includes(this.state.accountRoleType, constants.soc.SOC_Executor)) &&
              <div className='subframe'>
                <Link to='/SCP/soc/incident-rule-template'>
                  <span className={`${this.getActiveFrame('incidentSOCRule')}`}>{it('txt-incident-soc-rule')}</span>
                </Link>
              </div>
            }

            {accountType === constants.soc.NONE_LIMIT_ACCOUNT && (_.includes(this.state.accountRoleType, constants.soc.SOC_Analyzer) || _.includes(this.state.accountRoleType, constants.soc.SOC_Executor)) &&
              <div className='subframe'>
                <Link to='/SCP/soc/incident-flow'>
                  <span className={`${this.getActiveFrame('incidentSOCFlow')}`}>{it('txt-incident-soc-flow')}</span>
                </Link>
              </div>
            }

            {accountType === constants.soc.NONE_LIMIT_ACCOUNT && (_.includes(this.state.accountRoleType, constants.soc.SOC_Analyzer) || _.includes(this.state.accountRoleType, constants.soc.SOC_Executor)) &&
              <div className='subframe'>
                <Link to='/SCP/soc/incident-report'>
                  <span className={`${this.getActiveFrame('incidentSOCReport')}`}>{it('txt-incident-soc-report')}</span>
                </Link>
              </div>
            }
          </div>
        }

        <div className='item frame incident-device'>
          <Link to='/SCP/soc/incident-device'>
            <span className={`${this.getActiveFrame('incidentDevice')}`}>{it('txt-incident-device-management')}</span>
          </Link>
        </div>

        {accountType === constants.soc.NONE_LIMIT_ACCOUNT && (_.includes(this.state.accountRoleType, constants.soc.SOC_Analyzer) || _.includes(this.state.accountRoleType, constants.soc.SOC_Executor)) &&
          <div className='item frame incident-unit'>
            <Link to='/SCP/soc/incident-unit'>
              <span className={`${this.getActiveFrame('incidentUnit')}`}>{it('txt-incident-unit-management')}</span>
            </Link>
          </div>
        }

        {accountType === constants.soc.NONE_LIMIT_ACCOUNT && (_.includes(this.state.accountRoleType, constants.soc.SOC_Analyzer) || _.includes(this.state.accountRoleType, constants.soc.SOC_Executor)) &&
          <div id='config-link-edge' className='item frame edge-manage' onClick={this.handleOpen.bind(this, 'openConfigManagement', openConfigManagement)}>
              <span className={`${this.getActiveFrame('incidentSettingISAC') || this.getActiveFrame('incidentSettingSOC')}`}>{it('txt-incident-config')}</span>
              <i className={`c-link fg fg-arrow-${openConfigManagement ? 'top' : 'bottom'}`} />
          </div>
        }

        {openConfigManagement && accountType === constants.soc.NONE_LIMIT_ACCOUNT && (_.includes(this.state.accountRoleType, constants.soc.SOC_Analyzer) || _.includes(this.state.accountRoleType, constants.soc.SOC_Executor)) &&
          <div className='item open-edge'>
            <div className='subframe'>
              <Link to='/SCP/soc/incident-ISAC'>
                <span className={`${this.getActiveFrame('incidentSettingISAC')}`}>{it('txt-incident-isac-management')}</span>
              </Link>
            </div>
            <div className='subframe'>
              <Link to='/SCP/soc/incident-SOC'>
                <span className={`${this.getActiveFrame('incidentSettingSOC')}`}>{it('txt-incident-soc-management')}</span>
              </Link>
            </div>
          </div>
        }

        <div className={cx('expand-collapse', {'not-allowed': this.getActiveFrame('threat')})} onClick={this.toggleLeftNav}>
          <i className={this.getClassName()} />
        </div>
      </div>
    )
  }
}

SocConfig.propTypes = {};

export default SocConfig;