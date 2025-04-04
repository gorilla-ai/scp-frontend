import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import InfiniteScroll from 'react-infinite-scroll-component'

import Button from '@material-ui/core/Button'

import {downloadLink} from 'react-ui/build/src/utils/download'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import HMDmoreInfo from '../common/hmd-more-info'
import HMDscanInfo from '../common/hmd-scan-info'
import IrSelections from '../common/ir-selections'
import NetworkBehavior from '../common/network-behavior'
import PrivateDetails from '../common/private-details'
import VansNotes from './vans-notes'
import YaraRule from '../common/yara-rule'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SAFETY_SCAN_LIST = [
  {
    type: 'yara',
    path: 'ScanResult'
  },
  {
    type: 'scanFile',
    path: 'scanFileResult'
  },
  {
    type: 'importGcbAndGcbDetection',
    path: 'GCBResult'
  },
  {
    type: 'ir',
    path: '_ZipPath'
  },
  {
    type: 'fileIntegrity',
    path: 'fileIntegrityResult'
  },
  {
    type: 'eventTracing',
    path: ''
  },
  {
    type: 'procMonitor',
    path: 'getProcessMonitorResult'
  },
  {
    type: '_Vans',
    path: '_VansResult'
  },
  {
    type: 'snapshot',
    path: 'snapshotResult'
  },
  {
    type: 'procWhiteList',
    path: 'procWhiteListResult'
  },
  {
    type: '_ExecutePatch',
    path: '_ExecutePatchResult'
  }
];
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
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the host analysis information
 */
class HostAnalysis extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'hostInfo', //'hostInfo' or 'networkBehavior'
      activeScanType: '', //'dashboard', 'yara', 'scanFile', 'importGcbAndGcbDetection', 'ir', 'fileIntegrity', 'eventTracing', procMonitor', '_Vans', 'edr', '_ExecutePatch' or 'settings'
      safetyScanList: [],
      modalViewMoreOpen: false,
      modalYaraRuleOpen: false,
      modalIRopen: false,
      showSafetyScan: false,
      showVansNotes: false,
      safetyScanRecord: [],
      scrollCount: 1,
      hasMore: true
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.setDefaultLeftMenu();
    this.setInitialSaftyRecordData();
  }
  componentWillUnmount() {
    if (this.props.activeTab === 'safetyScan') {
      this.props.toggleSafetyDetails('', 'showAvailableHost');
    }
  }
  /**
   * Set active left navigation
   * @method
   */
  setDefaultLeftMenu = () => {
    const {hostData, openHmdType} = this.props;

    if (openHmdType && typeof openHmdType === 'string') {
      this.setState({
        activeTab: '',
        activeScanType: openHmdType.replace('Result', ''),
        showSafetyScan: true
      });
    } else {
      if (hostData.annotationObj && (hostData.annotationObj.status || hostData.annotationObj.annotation)) {
        this.setState({
          showVansNotes: true
        });
      }
    }
  }
  /**
   * Set initial safety scan record data
   * @method
   */
  setInitialSaftyRecordData = () => {
    this.setState({
      safetyScanRecord: this.props.hostData.safetyScanInfoExecuteRecord
    });
  }
  /**
   * Set active tab
   * @method
   * @param {string} activeTab - active tab ('hostInfo', 'safetyScanRecord' or 'networkBehavior')
   */
  setActiveTab = (activeTab) => {
    this.setState({
      activeTab,
      activeScanType: '',
      showSafetyScan: false,
      showVansNotes: false
    });
  }
  /**
   * Set active tab based on scan type
   * @method
   * @param {string} activeScanType - active scan type
   */
  setActiveScanType = (activeScanType) => {
    this.setState({
      activeScanType
    });
  }
  /**
   * Toggle Safety scan content on/off
   * @method
   */
  toggleSafetyScan = () => {
    this.setState({
      activeTab: '',
      showSafetyScan: !this.state.showSafetyScan,
      showVansNotes: false
    }, () => {
      const {activeScanType, showSafetyScan} = this.state;

      if (activeScanType === '' && showSafetyScan) {
        this.setState({
          activeScanType: 'dashboard'
        });
      }
    });
  }
  /**
   * Toggle Vans note content on/off
   * @method
   */
  toggleVansNotes = () => {
    this.setState({
      showSafetyScan: false,
      showVansNotes: !this.state.showVansNotes
    });
  }
  /**
   * Display basic info
   * @method
   * @returns HTML DOM
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
          from='host'
          alertInfo={alertInfo}
          topoInfo={hostData}
          picPath={picPath}
          triggerTask={this.triggerTask}
          toggleViewMore={this.toggleViewMore} />
      </div>
    )
  }
  /**
   * Display safety scan info
   * @method
   * @returns HTML DOM or HMDscanInfo component
   */
  displaySafetyScanContent = () => {
    const {assessmentDatetime, hostCreateTime, hostData, eventInfo} = this.props;
    const {activeScanType} = this.state;

    if (_.isEmpty(hostData.safetyScanInfo)) {
      return <span>N/A</span>
    } else {
      return (
        <HMDscanInfo
          page='host'
          activeScanType={activeScanType}
          assessmentDatetime={assessmentDatetime}
          hostCreateTime={hostCreateTime}
          currentDeviceData={hostData}
          eventInfo={eventInfo}
          toggleYaraRule={this.toggleYaraRule}
          toggleSelectionIR={this.toggleSelectionIR}
          triggerTask={this.triggerTask}
          triggerFilesTask={this.triggerFilesTask}
          addToWhiteList={this.addToWhiteList}
          getHMDinfo={this.props.getIPdeviceInfo}
          loadEventTracing={this.props.loadEventTracing}
          getHostInfo={this.props.getHostInfo}
          setActiveScanType={this.setActiveScanType} />
      )
    }
  }
  /**
   * Set safety scan list
   * @method
   * @param {object} val - safety scan data
   * @param {number} i - index of the safety scan array
   * @returns HTML DOM
   */
  setSafetyScanList = (val, i) => {
    if (val.type !== 'snapshot' && val.type !== 'procWhiteList') {
      return (
        <li key={val.type} className='child' onClick={this.setActiveScanType.bind(this, val.type)}>
          <span className={cx({'active': this.state.activeScanType === val.type})}>{t('hmd-scan.scan-list.txt-' + val.type)}</span>
        </li>
      )
    }
  }
  reloadContent = () => {
    this.setState({scrollCount: 1, safetyScanRecord: []}, this.loadSafetyScanInfo);
  }
  loadMoreContent = () => {
    const {scrollCount} = this.state;

    this.setState({scrollCount: scrollCount + 1}, this.loadSafetyScanInfo);
  }
  /**
   * Load device data
   * @method
   */
  loadSafetyScanInfo = () => {
    const {baseUrl} = this.context;
    const {hostData, assessmentDatetime} = this.props;
    const {safetyScanRecord, scrollCount} = this.state;

    const url = `${baseUrl}/api/v3/ipdevice?uuid=${hostData.ipDeviceUUID}&page=${scrollCount}&startDttm=${assessmentDatetime.from}&endDttm=${assessmentDatetime.to}`;

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      if (data && data.safetyScanInfoExecuteRecord) {
        if (data.safetyScanInfoExecuteRecord.length > 0) {
          this.setState({
            safetyScanRecord: _.concat(safetyScanRecord, data.safetyScanInfoExecuteRecord),
            hasMore: true
          });
        } else {
          this.setState({
            hasMore: false
          });
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display HMD more table
   * @method
   * @param {object} val - host data
   * @param {number} i - index of the hostInfo array
   * @returns HTML DOM
   */
  displayScanRecordContent = (val, i) => {
    return (
      <tr key={i}>
        <td>{val.taskName}</td>
        <td>{t('host.txt-' + val.taskStatus)}</td>
        <td>{helper.getFormattedDate(val.taskCreateDttm, 'local')}</td>
        <td>{helper.getFormattedDate(val.taskResponseDttm, 'local')}</td>
      </tr>
    )
  }
  /**
   * Display safety scan record
   * @method
   * @returns HTML DOM
   */
  displaySafetyScanRecord = () => {
    const {safetyScanRecord, hasMore} = this.state;

    return (
      <div className='scan-info'>
        <div className='header-title'>{t('host.endpoints.txt-safetyScanInfo')}</div>
        <div className='info-content'>
          <div className='info'>
            <Button variant='contained' color='primary' className='btn refresh' onClick={this.reloadContent.bind(this)}>{t('hmd-scan.txt-refresh')}</Button>
          </div>
          <div className='scan-wrapper'>
          {safetyScanRecord.length > 0 &&
            <InfiniteScroll
              dataLength={safetyScanRecord.length}
              next={this.loadMoreContent}
              hasMore={hasMore}
              height={435}>
              <table className='c-table main-table'>
                <thead>
                  <tr>
                    <th>{t('host.txt-safetyScanType')}</th>
                    <th>{t('host.txt-executionStatus')}</th>
                    <th>{t('host.txt-createTime')}</th>
                    <th>{t('hmd-scan.txt-responseTime')}</th>
                  </tr>
                </thead>
                <tbody>
                  {safetyScanRecord.map(this.displayScanRecordContent)}
                </tbody>
              </table>
            </InfiniteScroll>
          }

          {safetyScanRecord.length === 0 &&
            <div className='empty-msg'>{NOT_AVAILABLE}</div>
          }
          </div>
        </div>
      </div>
    )
  }
  /**
   * Display Host Analysis content
   * @method
   * @returns HTML DOM
   */
  displayHostAnalysisData = () => {
    const {hostData, assessmentDatetime, vansDeviceStatusList, location} = this.props;
    const {activeTab, activeScanType, safetyScanList, showSafetyScan, showVansNotes} = this.state;
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
              <li className='header' onClick={this.setActiveTab.bind(this, 'hostInfo')}>
                <span className={cx('name', {'active': activeTab === 'hostInfo'})}>{t('host.txt-hostInfo')}</span>
              </li>

              <li className='header' onClick={this.toggleSafetyScan}>
                <span className={cx('name', {'active': showSafetyScan})}>{t('alert.txt-safetyScan')}</span>
                <i className={`fg fg-arrow-${showSafetyScan ? 'bottom' : 'top'}`}></i>
              </li>

              {showSafetyScan &&
                <React.Fragment>
                  <ul className='scan-list'>
                    <li className='child' onClick={this.setActiveScanType.bind(this, 'dashboard')}><span className={cx({'active': activeScanType === 'dashboard'})}>{t('txt-dashboard')}</span></li>
                    {SAFETY_SCAN_LIST.map(this.setSafetyScanList)}

                    {(location.pathname.indexOf('host') > 0 || location.pathname.indexOf('configuration') > 0) &&
                      <React.Fragment>
                        <li className='child' onClick={this.setActiveScanType.bind(this, 'edr')}><span className={cx({'active': activeScanType === 'edr'})}>EDR</span></li>
                        <li className='child' onClick={this.setActiveScanType.bind(this, 'settings')}><span className={cx({'active': activeScanType === 'settings'})}>{t('txt-settings')}</span></li>
                      </React.Fragment>
                    }
                  </ul>
                </React.Fragment>
              }

              <li className='header' onClick={this.setActiveTab.bind(this, 'safetyScanRecord')}>
                <span className={cx('name', {'active': activeTab === 'safetyScanRecord'})}>{t('host.txt-safetyScanRecord')}</span>
              </li>

              {/* <li className='header' onClick={this.setActiveTab.bind(this, 'networkBehavior')}>
                <span className={cx('name', {'active': activeTab === 'networkBehavior'})}>{t('txt-networkBehavior')}</span>
              </li> */}

              <li className='header' onClick={this.toggleVansNotes}>
                <span className={cx('name', {'active': showVansNotes})}>{t('host.txt-vansNotes')}</span>
                <i className={`fg fg-arrow-${showVansNotes ? 'bottom' : 'top'}`}></i>
              </li>
            </ul>
            {showVansNotes &&
              <VansNotes
                currentData={hostData}
                currentType='device'
                vansDeviceStatusList={vansDeviceStatusList}
                getIPdeviceInfo={this.props.getIPdeviceInfo}
                getVansStatus={this.props.getVansStatus} />
            }
          </div>
          <div className='content'>
            {activeTab === 'hostInfo' &&
              this.displayInfoContent()
            }

            {activeScanType &&
              this.displaySafetyScanContent()
            }

            {activeTab === 'safetyScanRecord' &&
              this.displaySafetyScanRecord()
            }

            {activeTab === 'networkBehavior' &&
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
   * Toggle view more dialog
   * @method
   */
  toggleViewMore = () => {
    this.setState({
      modalViewMoreOpen: !this.state.modalViewMoreOpen
    });
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

    if (type[0] === 'setProcessWhiteList') {
      requestData.buildProcess = false;
    }

    if (type[0] === 'compareIOC') {
      let pathData = [];

      _.forEach(yaraRule.pathData, val => {
        if (val.path) {
          pathData.push(val.path);
        }
      })

      requestData.paras = {
        _FilepathList: pathData,
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

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

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
  /**
   * Handle PDF download
   * @method
   */
  exportPdf = () => {
    const {baseUrl, contextRoot} = this.context;
    const {hostData, assessmentDatetime} = this.props;
    const url = `${baseUrl}${contextRoot}/api/ipdevice/assessment/_pdf`;

    downloadLink(url, {uuid: hostData.ipDeviceUUID, startDttm: assessmentDatetime.from, endDttm: assessmentDatetime.to, page: 1, pageSize: 5});
  }
  render() {
    const {hostData} = this.props;
    const {modalViewMoreOpen, modalYaraRuleOpen, modalIRopen} = this.state;
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

        {modalViewMoreOpen &&
          <HMDmoreInfo
            hostData={hostData}
            toggleViewMore={this.toggleViewMore} />
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
  activeTab: PropTypes.string.isRequired,
  assessmentDatetime:  PropTypes.object.isRequired,
  hostData: PropTypes.object.isRequired,
  eventInfo: PropTypes.object.isRequired,
  openHmdType: PropTypes.string.isRequired,
  vansDeviceStatusList: PropTypes.array.isRequired,
  getIPdeviceInfo: PropTypes.func.isRequired,
  loadEventTracing: PropTypes.func.isRequired,
  toggleHostAnalysis: PropTypes.func.isRequired,
  toggleSafetyDetails: PropTypes.func.isRequired,
  getHostInfo: PropTypes.func.isRequired,
  getVansStatus: PropTypes.func.isRequired
};

export default withRouter(HostAnalysis);