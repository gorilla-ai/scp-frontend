import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context';
import helper from '../common/helper'
import HMDscanInfo from '../common/hmd-scan-info'
import IrSelections from '../common/ir-selections'
import NetworkBehavior from '../common/network-behavior'
import PrivateDetails from '../common/private-details'
import YaraRule from '../common/yara-rule'

import {downloadLink} from 'react-ui/build/src/utils/download'
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
        info: false,
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
  componentDidMount() {
    this.hmdTypeChecking();
  }
  /**
   * Set active left navigation
   * @method
   */
  hmdTypeChecking = () => {
    const {openHmdType} = this.props;
    let tempShowshowContent = {...this.state.showContent};

    if (openHmdType) {
      tempShowshowContent.safety = true;
    } else {
      tempShowshowContent.info = true;
    }

    this.setState({
      showContent: tempShowshowContent
    });
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

      switch (type) {
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
    const picPath = (hostData.ownerObj && hostData.ownerObj.base64) ? hostData.ownerObj.base64 : contextRoot + '/images/empty_profile.png';
    let alertInfo = {
      ownerMap: {},
      ownerBaseLayers: {},
      ownerSeat: {}
    };

    if (hostData.areaObj && hostData.areaObj.picPath) {
      const ownerMap = {
        label: hostData.areaObj.areaName,
        images: [
          {
            id: hostData.areaUUID,
            url: `${baseUrl}${contextRoot}/api/area/_image?path=${hostData.areaObj.picPath}`,
            size: {width: hostData.areaObj.picWidth, height: hostData.areaObj.picHeight}
          }
        ]
      };

      alertInfo.ownerMap = ownerMap;
      alertInfo.ownerBaseLayers[hostData.areaUUID] = ownerMap;

      if (hostData.seatUUID && hostData.seatObj) {
        alertInfo.ownerSeat[hostData.areaUUID] = {
          data: [{
            id: hostData.seatUUID,
            type: 'spot',
            xy: [hostData.seatObj.coordX, hostData.seatObj.coordY],
            label: hostData.seatObj.seatName,
            data: {
              name: hostData.seatObj.seatName,
              tag: 'red'
            }
          }]
        };
      }
    }

    return (
      <div className='privateIp-info srcIp-content'>
        <PrivateDetails
          alertInfo={alertInfo}
          topoInfo={hostData}
          picPath={picPath}
          triggerTask={this.triggerTask} />
      </div>
    )
  }
  /**
   * Display safety scan info
   * @method
   * @returns HMDscanInfo component
   */
  displaySafetyScanContent = () => {
    const {datetime, assessmentDatetime, hostData, eventInfo, openHmdType} = this.props;

    if (_.isEmpty(hostData.safetyScanInfo)) {
      return <span>N/A</span>
    } else {
      return (
        <HMDscanInfo
          page='host'
          assessmentDatetime={assessmentDatetime}
          currentDeviceData={hostData}
          eventInfo={eventInfo}
          openHmdType={openHmdType}
          toggleYaraRule={this.toggleYaraRule}
          toggleSelectionIR={this.toggleSelectionIR}
          triggerTask={this.triggerTask}
          triggerFilesTask={this.triggerFilesTask}
          addToWhiteList={this.addToWhiteList}
          getHMDinfo={this.props.getIPdeviceInfo}
          loadEventTracing={this.props.loadEventTracing} />
      )
    }
  }
  /**
   * Display Host Analysis content
   * @method
   * @returns HTML DOM
   */
  displayHostAnalysisData = () => {
    const {hostData, assessmentDatetime} = this.props;
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
                hostDatetime={assessmentDatetime} />
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

        this.setState({
          modalIRopen: false
        });

        this.props.getIPdeviceInfo(hostData);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle trigger button for HMD Malware
   * @method
   * @param {array.<string>} filePath - Malware file path
   * @param {string} taskId - Task ID
   */
  triggerFilesTask = (filePath, taskId) => {
    const {baseUrl} = this.context;
    const {hostData} = this.props;
    const requestData = {
      hostId: hostData.ipDeviceUUID,
      cmds: ['getHmdFiles'],
      paras: {
        _FilepathVec: filePath,
        _FileName: taskId
      }
    };

    this.ah.one({
      url: `${baseUrl}/api/hmd/retrigger`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-requestSent'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle malware add to white list
   * @method
   * @param {string} fileMD5 - File MD5
   */
  addToWhiteList = (fileMD5) => {
    const {baseUrl} = this.context;
    const {hostData} = this.props;
    const requestData = [{
      fileMD5,
      hasHandled: true
    }];

    ah.one({
      url: `${baseUrl}/api/hmd/malwareList`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        helper.showPopupMsg(t('txt-requestSent'));
        this.props.getIPdeviceInfo(hostData);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  exportPdf() {
    const {baseUrl, contextRoot} = this.context
    const {hostData, assessmentDatetime} = this.props
    const url = `${baseUrl}${contextRoot}/api/ipdevice/assessment/_pdf`

    downloadLink(url, {uuid: hostData.ipDeviceUUID, startDttm: assessmentDatetime.from, endDttm: assessmentDatetime.to, page: 1, pageSize: 5})
  
  }
  render() {
    const {hostData} = this.props;
    const {modalYaraRuleOpen, modalIRopen} = this.state;
    const actions = {
      export: {text: t('txt-export'), handler: this.exportPdf.bind(this)},
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
            currentDeviceData={hostData}
            toggleSelectionIR={this.toggleSelectionIR}
            triggerTask={this.triggerTask} />
        }
      </div>
    )
  }
}

HostAnalysis.contextType = BaseDataContext;

HostAnalysis.propTypes = {
  assessmentDatetime:  PropTypes.object.isRequired,
  hostData: PropTypes.object.isRequired,
  getIPdeviceInfo: PropTypes.func.isRequired,
  loadEventTracing: PropTypes.func.isRequired,
  toggleHostAnalysis: PropTypes.func.isRequired,
  openHmdType: PropTypes.string
};

export default HostAnalysis;