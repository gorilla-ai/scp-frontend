import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from './context';

import helper from './helper'
import HMDscanInfo from './hmd-scan-info'
import IrSelections from './ir-selections'
import NetworkBehavior from './network-behavior'
import PrivateDetails from './private-details'
import YaraRule from './yara-rule'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};
const NOT_AVAILABLE = 'N/A';

let t = null;
let f = null;

/**
 * Host Analysis
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the host analysis information
 */
class HostAnalysis extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showContent: {
        info: true,
        safety: false,
        network: false
      },
      modalYaraRuleOpen: false,
      modalIRopen: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  /**
   * Set corresponding content based on content type
   * @method
   * @param {string} type - the content type
   */
  getContent = (type) => {
    this.setState({
      showContent: {
        info: false,
        safety: false,
        network: false
      }
    }, () => {
      let tempShowContent = {...this.state.showContent};

      switch(type) {
        case 'info':
          tempShowContent.info = true;
          break;
        case 'safety':
          tempShowContent.safety = true;
          break;
        case 'network':
          tempShowContent.network = true;
          break;
      }

      this.setState({
        showContent: tempShowContent
      });
    });
  }
  /**
   * Display basic info
   * @method
   * @returns PrivateDetails component
   */
  displayInfoContent = () => {
    const {baseUrl, contextRoot} = this.context;
    const {hostData} = this.props;
    const topoInfo = {
      ...hostData.areaObj,
      ...hostData.ownerObj,
      ...hostData.seatObj
    };
    const picPath = topoInfo.ownerPic ? topoInfo.ownerPic : contextRoot + '/images/empty_profile.png';
    let alertInfo = {...hostData};
    let ownerMap = {};
    alertInfo.ownerBaseLayers = {};
    alertInfo.ownerSeat = {};  

    if (topoInfo.picPath) {
      ownerMap = {
        label: topoInfo.areaName,
        images: [
          {
            id: topoInfo.areaUUID,
            url: `${baseUrl}${contextRoot}/api/area/_image?path=${topoInfo.picPath}`,
            size: {width: topoInfo.picWidth, height: topoInfo.picHeight}
          }
        ]
      };
    }

    alertInfo.ownerMap = ownerMap;
    alertInfo.ownerBaseLayers[topoInfo.areaUUID] = ownerMap;

    if (topoInfo.seatUUID) {
      alertInfo.ownerSeat[topoInfo.areaUUID] = {
        data: [{
          id: topoInfo.seatUUID,
          type: 'spot',
          xy: [topoInfo.coordX, topoInfo.coordY],
          label: topoInfo.seatName,
          data: {
            name: topoInfo.seatName,
            tag: 'red'
          }
        }]
      };
    }

    return (
      <div className='srcIp-content'>
        <PrivateDetails
          alertInfo={alertInfo}
          topoInfo={topoInfo}
          picPath={picPath} />
      </div>
    )
  }
  /**
   * Display safety scan info
   * @method
   * @returns HMDscanInfo component
   */
  displaySafetyScanContent = () => {
    const {hostData} = this.props;

    if (_.isEmpty(hostData.safetyScanInfo)) {
      return <span>N/A</span>
    } else {
      return (
        <HMDscanInfo
          page='host'
          currentDeviceData={hostData}
          toggleYaraRule={this.toggleYaraRule}
          toggleSelectionIR={this.toggleSelectionIR}
          triggerTask={this.triggerTask}
          getHMDinfo={this.props.getIPdeviceInfo} />
      )
    }
  }
  /**
   * Display Host Analysis content
   * @method
   * @returns HTML DOM
   */
  displayHostAnalysisData = () => {
    const {hostData, datetime} = this.props;
    const {showContent} = this.state;
    const ip = hostData.ip || NOT_AVAILABLE;
    const mac = hostData.mac || NOT_AVAILABLE;
    const hostName = hostData.hostName || NOT_AVAILABLE;
    const system = hostData.system || NOT_AVAILABLE;
    const ownerName = hostData.ownerObj ? hostData.ownerObj.ownerName : NOT_AVAILABLE;
    const version = hostData.version || NOT_AVAILABLE;
    
    return (
      <div>
        <table className='c-table main-table align-center with-border'>
          <thead>
            <tr>
              <th>{f('alertFields._severity_')}</th>
              <th>{t('ipFields.ip')}</th>
              <th>{t('ipFields.mac')}</th>
              <th>{t('ipFields.hostName')}</th>
              <th>{t('ipFields.system')}</th>
              <th>{t('ipFields.owner')}</th>
              <th>{t('ipFields.version')}</th>              
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='severity-level'>{helper.getSeverityColor(hostData.severityLevel)}</td>
              <td>{ip}</td>
              <td>{mac}</td>
              <td>{hostName}</td>
              <td>{system}</td>
              <td>{ownerName}</td>
              <td>{version}</td>
            </tr>
          </tbody>
        </table>

        <div className='main-content'>
          <div className='nav'>
            <ul>
              <li className='header'>
                <span className='name'>{t('host.txt-hostInfo')}</span>
              </li>
              <li className='child' onClick={this.getContent.bind(this, 'info')}><span className={cx({'active': showContent.info})}>{t('alert.txt-ipBasicInfo')}</span></li>
              <li className='child' onClick={this.getContent.bind(this, 'safety')}><span className={cx({'active': showContent.safety})}>{t('alert.txt-safetyScanInfo')}</span></li>
              <li className='child' onClick={this.getContent.bind(this, 'network')}><span className={cx({'active': showContent.network})}>{t('txt-networkBehavior')}</span></li>
            </ul>
          </div>
          <div className='content'>
            {showContent.info &&
              this.displayInfoContent()
            }

            {showContent.safety &&
              this.displaySafetyScanContent()
            }

            {showContent.network &&
              <NetworkBehavior
                page='host'
                ipType='srcIp'
                alertData={hostData}
                hostDatetime={datetime} />
            }
          </div>
        </div>
      </div>
    )
  }
  /**
   * Toggle yara rule dialog
   * @method
   */
  toggleYaraRule = () => {
    this.setState({
      modalYaraRuleOpen: !this.state.modalYaraRuleOpen
    });
  }
  /**
   * Check yara rule before submit for trigger
   * @method
   * @param {object} yaraRule - yara rule data
   */
  checkYaraRule = (yaraRule) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/hmd/compileYara`;
    const requestData = {
      _RuleString: yaraRule.rule
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.triggerTask(['compareIOC'], '', yaraRule);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle IR combo selection dialog
   * @method
   */
  toggleSelectionIR = () => {
    this.setState({
      modalIRopen: !this.state.modalIRopen
    });
  }
  /**
   * Handle trigger button for HMD
   * @method
   * @param {array.<string>} type - HMD scan type
   * @param {string} [ipTypeParam] - IP type ('srcIp' or 'destIp')
   * @param {object} [yaraRule] - yara rule data
   */
  triggerTask = (type, ipTypeParam, yaraRule) => {
    const {baseUrl} = this.context;
    const {hostData} = this.props;
    const url = `${baseUrl}/api/hmd/retrigger`;
    let requestData = {
      hostId: hostData.ipDeviceUUID,
      cmds: type
    };

    if (type[0] === 'compareIOC') {
      requestData.paras = {
        _FilepathList: yaraRule.path,
        _RuleString: yaraRule.rule
      };
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-requestSent'));

        if (type[0] === 'compareIOC') {
          this.toggleYaraRule();
        }

        if (type[0] === 'ir') {
          this.toggleSelectionIR();
        }

        this.getHMDinfo(hostData.ipDeviceUUID);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {modalYaraRuleOpen, modalIRopen} = this.state;
    const actions = {
      confirm: {text: t('txt-close'), handler: this.props.toggleHostAnalysis}
    };

    return (
      <div>
        <ModalDialog
          id='hostModalDialog'
          className='modal-dialog'
          title={t('host.txt-hostAnalysis')}
          draggable={true}
          global={true}
          actions={actions}
          closeAction='confirm'>
          {this.displayHostAnalysisData()}
        </ModalDialog>

        {modalYaraRuleOpen &&
          <YaraRule
            toggleYaraRule={this.toggleYaraRule}
            checkYaraRule={this.checkYaraRule} />
        }

        {modalIRopen &&
          <IrSelections
            toggleSelectionIR={this.toggleSelectionIR}
            triggerTask={this.triggerTask} />
        }
      </div>
    )
  }
}

HostAnalysis.contextType = BaseDataContext;

HostAnalysis.propTypes = {
  hostData: PropTypes.object.isRequired,
  getIPdeviceInfo: PropTypes.func.isRequired,
  toggleHostAnalysis: PropTypes.func.isRequired
};

export default HostAnalysis;