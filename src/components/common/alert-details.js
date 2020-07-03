import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import ButtonGroup from 'react-ui/build/src/components/button-group'
import DataTable from 'react-ui/build/src/components/table'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import JSONTree from 'react-json-tree'

import {BaseDataContext} from './context';

import helper from './helper'
import IrSelections from './ir-selections'
import HMDscanInfo from './hmd-scan-info'
import PrivateDetails from './private-details'
import YaraRule from './yara-rule'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};
const PUBLIC_KEY = ['City', 'CountryCode', 'Latitude', 'Longitude'];
const NOT_AVAILABLE = 'N/A';

/**
 * Alert Details
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the alert details information
 */
class AlertDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alertType: '', //'alert', 'pot_attack' or 'syslog'
      showContent: {
        rule: false,
        json: false,
        attack: false,
        srcIp: false,
        destIp: false,
        srcSafety: false,
        destSafety: false,
        srcNetwork: false,
        destNetwork: false
      },
      alertRule: '',
      alertPayload: '',
      alertInfo: {
        srcIp: {
          locationType: '',
          location: {},
          topology: {},
          ownerPic: '',
          ownerMap: {},
          ownerBaseLayers: {},
          ownerSeat: {},
          exist: null
        },
        destIp: {
          locationType: '',
          location: {},
          topology: {},
          ownerPic: '',
          ownerMap: {},
          ownerBaseLayers: {},
          ownerSeat: {},
          exist: null
        }
      },
      ipDeviceInfo: {
        srcIp: {},
        destIp: {}
      },
      ipType: '',
      showRedirectMenu: false,
      modalYaraRuleOpen: false,
      modalIRopen: false,
      activeNetworkBehavior: 'alert',
      networkBehavior: {
        alert: {
          fields: ['severity', 'count'],
          srcIp: {
            totalCount: 0,
            data: []
          },
          destIp: {
            totalCount: 0,
            data: []
          }
        },
        connections: {
          fields: ['destIp', 'destPort', 'count'],
          sort: {
            field: 'destIp',
            desc: true
          },
          srcIp: {
            totalCount: 0,
            data: []
          },
          destIp: {
            totalCount: 0,
            data: []
          }
        },
        dns: {
          fields: ['destIp', 'destPort', 'count'],
          sort: {
            field: 'destIp',
            desc: true
          },
          srcIp: {
            totalCount: 0,
            data: []
          },
          destIp: {
            totalCount: 0,
            data: []
          }
        },
        syslog: {
          fields: ['configSource', 'count'],
          sort: {
            field: 'configSource',
            desc: true
          },
          srcIp: {
            totalCount: 0,
            data: []
          },
          destIp: {
            totalCount: 0,
            data: []
          }
        }
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.loadAlertContent();
    this.getIPcontent('srcIp');
    this.getIPcontent('destIp');

    document.addEventListener('mousedown', this.handleClickOutside);
  }
  componentDidUpdate(prevProps) {
    this.loadAlertContent(prevProps);
  }
  componentWillUnmount() {
    this.closeDialog();

    document.addEventListener('mousedown', this.handleClickOutside);
  }
  /**
   * Call when mouse click outside the redirect menu
   * @method
   * @param {object} e - MouseClick events
   */
  handleClickOutside = (e) => {
    if (this.wrapperRef && !this.wrapperRef.contains(e.target)) {
      this.setState({
        showRedirectMenu: false
      });
    }
  }
  /**
   * Set wrapper reference
   * @method
   * @param {object} node - redirect menu node
   */
  setWrapperRef = (node) => {
    this.wrapperRef = node;
  }
  /**
   * Toggle redirect menu on/off
   * @method
   */
  toggleRedirectMenu = () => {
    this.setState({
      showRedirectMenu: !this.state.showRedirectMenu
    });
  }
  /**
   * Call corresponding Alert data based on conditions
   * @method
   * @param {object} prevProps - previous react props when the props have been updated
   */
  loadAlertContent = (prevProps) => {
    const {alertDetails, alertData} = this.props;
    const index = alertData.index ? alertData.index : 'alert';
    let alertType = '';
    let showContent = {
      rule: false,
      attack: false,
      srcIp: false,
      destIp: false,
      srcSafety: false,
      destSafety: false,
      srcNetwork: false,
      destNetwork: false,
      json: false
    };

    if (!prevProps || (prevProps && alertDetails.currentIndex != prevProps.alertDetails.currentIndex)) {
      if (index.indexOf('alert') > -1) {
        alertType = 'alert';
      } else if (index.indexOf('pot_attack') > -1) {
        alertType = 'pot_attack';
      } else if (index.indexOf('syslog') > -1) {
        alertType = 'syslog';
      }

      if (alertData) {
        showContent.rule = true;
      }

      this.setState({
        alertType,
        showContent
      }, () => {
        this.getIPcontent('srcIp');
        this.getIPcontent('destIp');
        this.getAlertRule();
      });
    }   
  }
  /**
   * Set source or destination topology data to alertInfo
   * @method
   * @param {object} alertInfo - Alert Info to be set
   * @param {string} ipType - 'srcIp' or 'destIp'
   */
  setTopologyInfo = (alertInfo, ipType) => {
    this.setState({
      alertInfo
    }, () => {
      const {alertInfo} = this.state;

      if (alertInfo[ipType].topology && alertInfo[ipType].topology.ownerUUID) {
        this.getOwnerPic(ipType, alertInfo[ipType].topology.ownerUUID);
        this.getOwnerSeat(ipType);
      } else { //Reset to default if no Topology or owner is not present
        let tempAlertInfo = {...alertInfo};
        tempAlertInfo[ipType].ownerPic = '';
        tempAlertInfo[ipType].ownerMap = {};
        tempAlertInfo[ipType].ownerBaseLayers = {};
        tempAlertInfo[ipType].ownerSeat = {};

        this.setState({
          alertInfo: tempAlertInfo
        });
      }
    });
  }
  /**
   * Get source or destination topology data
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   */
  getIPcontent = (ipType) => {
    const {baseUrl} = this.context;
    const {alertData, fromPage, locationType} = this.props;
    const srcDestType = ipType.replace('Ip', '');
    let tempAlertInfo = {...this.state.alertInfo};

    if (fromPage === 'dashboard') { //Get topo info for Dashboard page
      if (locationType === 'public') {
        tempAlertInfo[ipType].locationType = alertData[srcDestType + 'LocType'];
        tempAlertInfo[ipType].topology = alertData[srcDestType + 'TopoInfo'];

        if (ipType === 'srcIp' && alertData.srcLocType) {
          tempAlertInfo[ipType].locationType = alertData.srcLocType;
        }

        if (ipType === 'destIp' && alertData.destLocType) {
          tempAlertInfo[ipType].locationType = alertData.destLocType;
        }

        _.forEach(PUBLIC_KEY, val => {
          if (alertData[srcDestType + val]) {
            tempAlertInfo[ipType].location[val] = alertData[srcDestType + val];
          }
        })
      } else if (locationType === 'private') {
        tempAlertInfo[ipType].locationType = alertData[srcDestType + 'LocType'];
        tempAlertInfo[ipType].topology = alertData[srcDestType + 'TopoInfo'];
      }
      this.setTopologyInfo(tempAlertInfo, ipType);
    } else if (fromPage === 'threats') { //Get topo info for Threats page
      if (this.getIpPortData(ipType)) {
        tempAlertInfo[ipType].locationType = alertData[srcDestType + 'LocType'];
        tempAlertInfo[ipType].topology = alertData[srcDestType + 'TopoInfo'];

        _.forEach(PUBLIC_KEY, val => {
          if (alertData[srcDestType + val]) {
            tempAlertInfo[ipType].location[val] = alertData[srcDestType + val];
          }
        })

        this.setTopologyInfo(tempAlertInfo, ipType);
      }
    }
  }
  /**
   * Check IP device info for HMD
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   */
  getHMDinfo = (ipType) => {
    const {baseUrl} = this.context;
    const {alertInfo, ipDeviceInfo} = this.state;
    const ip = this.getIpPortData(ipType);
    const apiArr = [
      {
        url: `${baseUrl}/api/u1/ipdevice/_search?exactIp=${ip}`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/u1/ipdevice?exactIp=${ip}&page=1&pageSize=5`,
        type: 'GET'
      }
    ];

    if (ip === NOT_AVAILABLE) {
      return;
    }
    let tempAlertInfo = {...alertInfo};
    let tempIPdeviceInfo = {...ipDeviceInfo};

    this.ah.series(apiArr)
    .then(data => {
      if (data) {
        if (data[0] && data[0].counts === 0) {
          tempAlertInfo[ipType].exist = false;

          this.setState({
            alertInfo: tempAlertInfo
          });
        }

        if (data[1] && data[0].counts > 0) {
          tempAlertInfo[ipType].exist = true;
          tempIPdeviceInfo[ipType] = data[1];

          this.setState({
            alertInfo: tempAlertInfo,
            ipDeviceInfo: tempIPdeviceInfo
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
   * Get owner picture based on location type
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   * @param {string} ownerUUID - ownerUUID
   */
  getOwnerPic = (ipType, ownerUUID) => {
    const {baseUrl} = this.context;
    let tempAlertInfo = {...this.state.alertInfo};

    if (!ownerUUID) {
      return;
    }

    ah.one({
      url: `${baseUrl}/api/u1/owner?uuid=${ownerUUID}`,
      type: 'GET'
    })
    .then(data => {
      if (data.rt && data.rt.base64) {
        tempAlertInfo[ipType].ownerPic = data.rt.base64;

        this.setState({
          alertInfo: tempAlertInfo
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set owner map and seat data for alertInfo
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   */
  getOwnerSeat = (ipType) => {
    const {baseUrl, contextRoot} = this.context;
    const {alertInfo} = this.state;
    const topoInfo = alertInfo[ipType].topology;
    let tempAlertInfo = {...alertInfo};
    let ownerMap = {};

    if (topoInfo.areaPicPath) {
      ownerMap = {
        label: topoInfo.areaName,
        images: [
          {
            id: topoInfo.areaUUID,
            url: `${baseUrl}${contextRoot}/api/area/_image?path=${topoInfo.areaPicPath}`,
            size: {width: topoInfo.areaPicWidth, height: topoInfo.areaPicHeight}
          }
        ]
      };
    }
    
    tempAlertInfo[ipType].ownerMap = ownerMap;
    tempAlertInfo[ipType].ownerBaseLayers[topoInfo.areaUUID] = ownerMap;
    tempAlertInfo[ipType].ownerSeat[topoInfo.areaUUID] = {
      data: [{
        id: topoInfo.seatUUID,
        type: 'spot',
        xy: [topoInfo.seatCoordX, topoInfo.seatCoordY],
        label: topoInfo.seatName,
        data: {
          name: topoInfo.seatName,
          tag: 'red'
        }
      }]
    };

    this.setState({
      alertInfo: tempAlertInfo
    });
  }
  /**
   * Get Alert rule data
   * @method
   */
  getAlertRule = () => {
    const {baseUrl} = this.context;
    const {alertData} = this.props;
    const index = alertData.index;
    const projectId = alertData.projectName;

    if (_.isEmpty(alertData)) {
      return;
    }

    if (alertData.Rule) {
      this.setState({
        alertRule: alertData.Rule
      });
    } else {
      const url = `${baseUrl}/api/network/alert/rule?projectId=${projectId}`;
      let requestData = {
        alert: {}
      };

      if (alertData.alert && alertData.alert.signature_id) {
        requestData.alert.signature_id = alertData.alert.signature_id;
      } else if (alertData.trailName) {
        requestData.alert.trailName = alertData.trailName;
      }

      this.ah.one({
        url,
        data: JSON.stringify(requestData),
        type: 'POST',
        contentType: 'text/plain'
      })
      .then(data => {
        if (data) {
          this.setState({
            alertRule: data
          });
        }
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
  }
  /**
   * Get IP and Port data
   * @method
   * @param {string} ipType - 'srcIp', 'destIp', 'srcPort', 'destPort'
   * @returns IP or port
   */
  getIpPortData = (ipType) => {
    const {alertData} = this.props;

    if (ipType === 'srcIp') {
      return alertData.srcIp || alertData.ipSrc || NOT_AVAILABLE;
    } else if (ipType === 'destIp') {
      return alertData.destIp || alertData.ipDst || NOT_AVAILABLE;
    } else if (ipType === 'srcPort') {
      return alertData.srcPort || alertData.portSrc || NOT_AVAILABLE;
    } else if (ipType === 'destPort') {
      return alertData.destPort || alertData.portDst || NOT_AVAILABLE;
    }
  }
  /**
   * Set Alert payload data
   * @method
   */
  getAttackJson = () => {
    const {alertData} = this.props;

    this.setState({
      alertPayload: alertData.payload
    });
  }
  /**
   * Set corresponding content based on content type
   * @method
   * @param {string} type - the content type
   * @param {object} alertData - Alert data type
   */
  getContent = (type, alertData) => {
    this.setState({
      showContent: {
        rule: false,
        attack: false,
        srcIp: false,
        destIp: false,
        srcSafety: false,
        destSafety: false,
        srcNetwork: false,
        destNetwork: false, 
        json: false
      }
    }, () => {
      let tempShowContent = {...this.state.showContent};

      switch(type) {
        case 'rule':
          this.getAlertRule();
          tempShowContent.rule = true;
          break;
        case 'attack':
          this.getAttackJson();
          tempShowContent.attack = true;
          break;
        case 'srcIp':
          tempShowContent.srcIp = true;
          break;
        case 'destIp':
          tempShowContent.destIp = true;
          break;
        case 'srcSafety':
          this.getHMDinfo('srcIp');
          tempShowContent.srcSafety = true;
          break;
        case 'destSafety':
          this.getHMDinfo('destIp');
          tempShowContent.destSafety = true;
          break;
        case 'srcNetwork':
          this.loadNetworkBehavior('srcIp');
          tempShowContent.srcNetwork = true;
          break;
        case 'destNetwork':
          this.loadNetworkBehavior('destIp');
          tempShowContent.destNetwork = true;
          break;
        case 'json':
          tempShowContent.json = true;
          break;
      }

      this.setState({
        showContent: tempShowContent,
        activeNetworkBehavior: 'alert'
      });
    });
  }
  /**
   * Get alert severity
   * @method
   * @param {string} value - 'Emergency', 'Alert', 'Critical', 'Warning', 'Notice'
   * @returns HTML DOM
   */
  getSeverity = (value) => {
    let styleStatus = '';

    if (value === 'Emergency') {
      styleStatus = '#CC2943';
    } else if (value === 'Alert') {
      styleStatus = '#CC7B29';
    } else if (value === 'Critical') {
      styleStatus = '#29B0CC';
    } else if (value === 'Warning') {
      styleStatus = '#29CC7A';
    } else if (value === 'Notice') {
      styleStatus = '#7ACC29';
    } else if (value === NOT_AVAILABLE) {
      return {NOT_AVAILABLE}
    }

    return <span className='severity' style={{backgroundColor: styleStatus}}>{value}</span>
  }
  /**
   * Handle pcap download button
   * @method
   * @param {string} url - pcap download link
   */
  pcapDownload = (url) => {
    window.open(url, '_blank');
  }
  /**
   * Display PCAP download link
   * @method
   */
  displayPCAPdownload = () => {
    const {baseUrl, contextRoot} = this.context;
    const {alertData} = this.props;
    const startDttm = Moment(helper.getSubstractDate(10, 'minutes', alertData._eventDttm_)).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const endDttm = Moment(helper.getAdditionDate(10, 'minutes', alertData._eventDttm_)).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const downloadLink = `${baseUrl}${contextRoot}/api/alert/pcap?agentId=${alertData._edgeInfo.agentId}&startDttm=${startDttm}&endDttm=${endDttm}&targetIp=${alertData.srcIp || alertData.ipSrc}&infoType=${alertData['alertInformation.type']}`;

    return <span onClick={this.pcapDownload.bind(this, downloadLink)}>{t('alert.txt-downloadPCAP')}</span>
  }
  /**
   * Redirect URL
   * @method
   * @param {string} url - url to be redirected
   */
  redirectIp = (url) => {
    window.open(url, '_blank');
  }
  /**
   * Display redirect IP menu for source IP and destination IP
   * @method
   * @returns HTML DOM
   */
  getRedirectIp = () => {
    const {baseUrl, contextRoot, language} = this.context;
    const {showContent, alertInfo} = this.state;
    let ipType = '';
    let type = 'add';
    let text = t('txt-add');

    if (showContent.srcIp) {
      if (alertInfo.srcIp.locationType === 1) { //public
        return;
      }
      ipType = 'srcIp';

    } else if (showContent.destIp) {
      if (alertInfo.destIp.locationType === 1) { //public
        return;
      }
      ipType = 'destIp';
    }

    const ip = this.getIpPortData(ipType);

    if (ip === NOT_AVAILABLE) {
      return;
    }

    if (alertInfo[ipType].exist) {
      type = 'edit';
      text = t('txt-edit');
    }

    const url = `${baseUrl}${contextRoot}/configuration/topology/inventory?ip=${ip}&type=${type}&lng=${language}`;
    return <div className='redirect-ip' onClick={this.redirectIp.bind(this, url)}>{text}</div>
  }
  /**
   * Display Query More menu
   * @method
   * @returns HTML DOM
   */
  getQueryMore = () => {
    const {showContent} = this.state;
    let ip = '';

    if (showContent.srcIp) {
      ip = this.getIpPortData('srcIp');
    } else if (showContent.destIp) {
      ip = this.getIpPortData('destIp');
    }

    if (ip && ip !== NOT_AVAILABLE) {
      return <div className='qurey-more' onClick={this.toggleRedirectMenu}>{t('alert.txt-queryMore')}</div>
    }
  }
  /**
   * Redirect to ivar link
   * @method
   * @param {string} videoUrl - redirect URL
   */
  redirectVidoeURL = (videoUrl) => {
    window.open(videoUrl, '_blank');
  }
  /**
   * Display IVAR content
   * @method
   * @returns HTML DOM
   */
  showAlertContent = () => {
    const {alertData} = this.props;
    const picPath = alertData.photoBase64 ? 'data:image/png;base64,' + alertData.photoBase64 : '';
    const videoUrl = alertData.ivarVideoUrl ? alertData.ivarVideoUrl : '';

    return (
      <div className='ivar'>
        {picPath &&
          <img src={picPath} />
        }
        <span className='msg'>{alertData.Info || NOT_AVAILABLE}</span>
        {videoUrl &&
          <button onClick={this.redirectVidoeURL.bind(this, videoUrl)}>{t('alert.txt-openVideo')}</button>
        }
      </div>
    )
  }
  /**
   * Display Alert information in dialog box
   * @method
   * @returns HTML DOM
   */
  displayAlertData = () => {
    const {alertDetails, alertData} = this.props;
    const {alertType, showContent, alertRule, alertPayload, showRedirectMenu} = this.state;
    const severity = alertData._severity_ ? this.getSeverity(alertData._severity_) : NOT_AVAILABLE;
    const eventDatetime = alertData._eventDttm_ ? helper.getFormattedDate(alertData._eventDttm_, 'local') : NOT_AVAILABLE;

    return (
      <div>
        <table className='c-table main-table align-center with-border'>
          <thead>
            <tr>
              <th>{f('alertFields._severity_')}</th>
              <th>{f('alertFields.Collector')}</th>
              <th>{f('alertFields.Trigger')}</th>
              <th>{f('alertFields.Source')}</th>
              <th>{f('alertFields._eventDttm_')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='severity-level'>{severity}</td>
              <td className='collector'>{alertData.Collector || NOT_AVAILABLE}</td>
              <td className='trigger'>{alertData.Trigger || NOT_AVAILABLE}</td>
              <td className='source'>{alertData.Source || NOT_AVAILABLE}</td>
              <td className='datetime'>{eventDatetime}</td>
            </tr>
          </tbody>
        </table>

        <div className='alert-info'>{this.showAlertContent()}</div>

        <table className='c-table main-table align-center with-border'>
          <thead>
            <tr>
              <th>{f('alertFields.srcIp')}</th>
              <th>{f('alertFields.srcPort')}</th>
              <th>{f('alertFields.destIp')}</th>
              <th>{f('alertFields.destPort')}</th>
              <th>{f('alertFields.proto')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='src-ip'>{this.getIpPortData('srcIp')}</td>
              <td className='src-port'>{this.getIpPortData('srcPort')}</td>
              <td className='dest-ip'>{this.getIpPortData('destIp')}</td>
              <td className='dest-port'>{this.getIpPortData('destPort')}</td>
              <td className='protocol'>{alertData.proto || alertData.p || NOT_AVAILABLE}</td>
            </tr>
          </tbody>
        </table>

        <div className='main-content'>
          <div className='nav'>
            <ul>
              <li onClick={this.getContent.bind(this, 'rule')}><span className={cx({'active': showContent.rule})}>{t('alert.txt-rule')}</span></li>
              {alertType === 'pot_attack' &&
                <li onClick={this.getContent.bind(this, 'attack')}><span className={cx({'active': showContent.attack})}>{t('alert.txt-attack')}</span></li>
              }
              <li onClick={this.getContent.bind(this, 'json')}><span className={cx({'active': showContent.json})}>{t('alert.txt-viewJSON')}</span></li>
              <li className='header'>
                <span className='name'>{t('alert.txt-ipSrc')}</span>
                <span className='ip'>{this.getIpPortData('srcIp')}</span>
              </li>
              <li className='child' onClick={this.getContent.bind(this, 'srcIp')}><span className={cx({'active': showContent.srcIp})}>{t('alert.txt-ipBasicInfo')}</span></li>
              <li className='child' onClick={this.getContent.bind(this, 'srcSafety')}><span className={cx({'active': showContent.srcSafety})}>{t('alert.txt-safetyScanInfo')}</span></li>
              <li className='child' onClick={this.getContent.bind(this, 'srcNetwork')}><span className={cx({'active': showContent.srcNetwork})}>{t('txt-networkBehavior')}</span></li>
              <li className='header'>
                <span className='name'>{t('alert.txt-ipDst')}</span>
                <span className='ip'>{this.getIpPortData('destIp')}</span>
              </li>
              <li className='child' onClick={this.getContent.bind(this, 'destIp')}><span className={cx({'active': showContent.destIp})}>{t('alert.txt-ipBasicInfo')}</span></li>
              <li className='child' onClick={this.getContent.bind(this, 'destSafety')}><span className={cx({'active': showContent.destSafety})}>{t('alert.txt-safetyScanInfo')}</span></li>
              <li className='child' onClick={this.getContent.bind(this, 'destNetwork')}><span className={cx({'active': showContent.destNetwork})}>{t('txt-networkBehavior')}</span></li>
            </ul>
          </div>
          <div className='content'>
            <div className='options-buttons'>
              {showContent.rule && alertData.pcapFlag &&
                <section>
                  {this.displayPCAPdownload()}
                </section>
              }

              {showContent.attack && alertData.fileMD5 &&
                <div onClick={this.downloadFile}>{t('alert.txt-downloadFile')}</div>
              }

              {(showContent.srcIp || showContent.destIp) &&
                <section>
                  {this.getRedirectIp()}
                  {this.getQueryMore()}
                </section>
              }
            </div>

            {showRedirectMenu && showContent.srcIp &&
              this.displayRedirectMenu('srcIp')
            }

            {showRedirectMenu && showContent.destIp &&
              this.displayRedirectMenu('destIp')
            }

            {showContent.rule &&
              this.displayRuleContent()
            }

            {showContent.json &&
              this.displayJsonData()
            }

            {showContent.attack && alertPayload &&
              this.displayPayloadcontent()
            }

            {showContent.srcIp &&
              this.displayIPcontent('srcIp')
            }

            {showContent.destIp &&
              this.displayIPcontent('destIp')
            }

            {showContent.srcSafety &&
              this.displaySafetyScanContent('srcIp')
            }

            {showContent.destSafety &&
              this.displaySafetyScanContent('destIp')
            }

            {showContent.srcNetwork &&
              this.displayNetworkBehaviorContent('srcIp')
            }

            {showContent.destNetwork &&
              this.displayNetworkBehaviorContent('destIp')
            }
          </div>
        </div>
        {alertDetails.currentLength > 1 &&
          <div className='pagination'>
            <div className='buttons'>
              <button onClick={this.props.showAlertData.bind(this, 'previous')} disabled={alertDetails.currentIndex === 0}>{t('txt-previous')}</button>
              <button onClick={this.props.showAlertData.bind(this, 'next')} disabled={alertDetails.currentIndex + 1 === alertDetails.currentLength}>{t('txt-next')}</button>
            </div>
            <span className='count'>{alertDetails.currentIndex + 1} / {alertDetails.currentLength}</span>
          </div>
        }
      </div>
    )
  }
  /**
   * Generate a redirect link and process the browser redirect
   * @method
   * @param {string} type - 'events' or 'virustotal'
   * @param {string} value - 'srcIp' or 'destIp'
   */
  redirectLink = (type, value) => {
    const srcIp = this.getIpPortData('srcIp');
    const destIp = this.getIpPortData('destIp');
    let ipParam = '';
    let linkUrl ='';
 
    if (type === 'virustotal') {
      if (value === 'srcIp') {
        ipParam = srcIp;
      } else if (value === 'destIp') {
        ipParam = destIp;
      }
      linkUrl = 'https:\//www.virustotal.com/gui/ip-address/' + ipParam + '/relations';
    }

    window.open(linkUrl, '_blank');
  }
  /**
   * Display redirect menu
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   * @returns HTML DOM
   */
  displayRedirectMenu = (ipType) => {
    return (
      <ul className='redirect-menu' ref={this.setWrapperRef}>
        <li onClick={this.redirectLink.bind(this, 'virustotal', ipType)}>{t('alert.txt-searthVirustotal')}</li>
      </ul>
    )
  }
  /**
   * Display rule content
   * @method
   * @param {string} val - val for the rule content
   * @param {number} i - index
   * @returns HTML DOM
   */
  showRuleContent = (val, i) => {
    return <li key={i}>{val.rule}</li>
  }
  /**
   * Display pattern refs data
   * @method
   * @returns HTML DOM
   */
  showRuleRefsData = () => {
    const {alertData} = this.props;

    if (alertData.refs && alertData.refs.length > 0) {
      return <JSONTree data={alertData.refs} theme={helper.getJsonViewTheme()} />
    }
  }
  /**
   * Display severity info content
   * @method
   * @returns HTML DOM
   */
  getSeverityInfoContent = () => {
    const {alertData} = this.props;

    return (
      <table className='c-table'>
        <tbody>
          <tr>
            <td valign='top' className='header'>
              <div>{t('alert.txt-severityType')}:</div>
              <div>{t('alert.txt-severityDesc')}:</div>
            </td>
            <td>
              <div>{alertData.severity_type}</div>
              <div>{alertData.severity_type_description || NOT_AVAILABLE}</div>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
  /**
   * Open dialog to show severity info
   * @method
   */
  showSeverityInfo = () => {
    PopupDialog.alert({
      title: this.props.alertData.severity_type_name,
      id: 'modalWindowSmall',
      confirmText: t('txt-close'),
      display: this.getSeverityInfoContent()
    });
  }
  /**
   * Display rule content
   * @method
   * @returns HTML DOM
   */
  displayRuleContent = () => {
    const {alertRule} = this.state;

    if (alertRule) {
      if (_.isArray(alertRule)) { //alertRule is an array
        if (alertRule.length === 0) {
          return <span>{NOT_AVAILABLE}</span>
        } else {
          return (
            <ul className='alert-rule'>
              {alertRule.map(this.showRuleContent)}
              <span className='rule-text'>{alertRule}</span><i className='fg fg-info' title={t('txt-info')} onClick={this.showSeverityInfo}></i>
              {this.showRuleRefsData()}
            </ul>
          )
        }
      } else { //alertRule is a string
        return (
          <section className='alert-rule'>
            <span className='rule-text'>{alertRule}</span><i className='fg fg-info' title={t('txt-info')} onClick={this.showSeverityInfo}></i>
            {this.showRuleRefsData()}
          </section>
        )
      }
    } else {
      return <i className='fg fg-loading-2'></i>
    }
  }
  /**
   * Display PCAP payload content
   * @method
   * @returns HTML DOM
   */
  displayPayloadcontent = () => {
    return (
      <div className='payload'>
        <ul>
          <li><JSONTree data={this.state.alertPayload} theme={helper.getJsonViewTheme()} /></li>
        </ul>
      </div>
    )
  }
  /**
   * Get Alert details list width
   * @method
   * @returns {string} - list width

   */
  getListWidth = () => {
    const {locale} = this.context;

    if (locale === 'en') {
      return '120px';
    } else if (locale === 'zh') {
      return '50px';
    }
  }
  /**
   * Check location data
   * @method
   * @param {string} item - key item
   * @param {string} data - data associated with the key
   * @returns - valid data in string or false

   */
  checkLocationData = (item, data) => {
    if (item === 'City') {
      if (data !== '' && data !== '-') {
        return data;
      }
    } else if (item === 'Latitude' || item === 'Longitude') {
      if (data !== 0) {
        return data;
      }
    }
    return false;
  }
  /**
   * Display Alert public info
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   * @param {string} item - key of the public info
   * @param {number} i - index
   * @returns HTML DOM
   */
  showPublicInfo = (ipType, item, i) => {
    const {contextRoot} = this.context;
    const {alertInfo} = this.state;
    const countryCodeType = 'CountryCode';
    const countryType = 'CountryName';
    let validDataCount = 0;

    if (alertInfo[ipType]['location'][item]) {
      if (item === countryCodeType) { //Display country flag
        const countryCode = alertInfo[ipType]['location'][item].toLowerCase();
        const picPath = `${contextRoot}/images/flag/${countryCode}.png`;

        if (countryCode && countryCode != '-') {
          validDataCount++;

          return (
            <li key={item + i}>
              <span className='key' style={{width: this.getListWidth()}}>{t('payloadsFields.' + item)}</span>
              <span className='value'><img src={picPath} title={alertInfo[ipType]['location'][countryType]} /></span>
            </li>
          )
        }
      } else { //Display location info
        const data = alertInfo[ipType]['location'][item];
        const validData = this.checkLocationData(item, data);

        if (validData) {
          validDataCount++;

          return (
            <li key={item + i}>
              <span className='key' style={{width: this.getListWidth()}}>{t('payloadsFields.' + item)}</span>
              <span className='value'>{validData}</span>
            </li>
          )
        }
      }
    }

    if (validDataCount === 0) {
      <li>{t('txt-notFound')} {this.getIpPortData(ipType)}</li>
    }
  }
  /**
   * Display Alert public info
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   * @returns HTML DOM
   */
  getPublicInfo = (ipType) => {
    return (
      <ul className='public'>
        {PUBLIC_KEY.map(this.showPublicInfo.bind(this, ipType))}
      </ul>
    )
  }
  /**
   * Display Alert private info
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   * @returns PrivateDetails component
   */
  getPrivateInfo = (ipType) => {
    const {contextRoot} = this.context;
    const {alertInfo} = this.state;
    const topoInfo = alertInfo[ipType].topology;
    const picPath = alertInfo[ipType].ownerPic ? alertInfo[ipType].ownerPic : contextRoot + '/images/empty_profile.png';
    const srcDestType = ipType.replace('Ip', '');

    return (
      <PrivateDetails
        type={ipType}
        alertInfo={alertInfo}
        topoInfo={topoInfo}
        picPath={picPath}
        srcDestType={srcDestType} />
    )
  }
  /**
   * Get content for the public IP
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   * @returns HTML DOM
   */
  getPublicIPcontent = (ipType) => {
    const {alertInfo} = this.state;

    if (alertInfo[ipType].location.City !== '-' && alertInfo[ipType].location.CountryCode !== '-') {
      return this.getPublicInfo(ipType);
    } else {
      return <span>{NOT_AVAILABLE}</span>
    }
  }
  /**
   * Display IP content
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   * @returns HTML DOM
   */
  displayIPcontent = (ipType) => {
    const {alertInfo} = this.state;

    return (
      <div>
        {(_.isEmpty(alertInfo[ipType].topology) && _.isEmpty(alertInfo[ipType].location)) && 
          <span>{NOT_AVAILABLE}</span>
        }

        {ipType === 'srcIp' && alertInfo[ipType].locationType === 1 && //Public
          <div className='srcIp-content'>
            {this.getPublicIPcontent(ipType)}
          </div>
        }

        {ipType === 'srcIp' && alertInfo[ipType].locationType === 2 && //Private
          <div className='srcIp-content'>
            {this.getPrivateInfo(ipType)}
          </div>
        }

        {ipType === 'destIp' && alertInfo[ipType].locationType === 1 && //Public
          <div className='destIp-content'>
            {this.getPublicIPcontent(ipType)}
          </div>
        }

        {ipType === 'destIp' && alertInfo[ipType].locationType === 2 && //Private
          <div className='destIp-content'>
            {this.getPrivateInfo(ipType)}
          </div>
        }
      </div>
    )
  }
  /**
   * Toggle yara rule dialog
   * @method
   */
  toggleYaraRule = (ipType) => {
    this.setState({
      modalYaraRuleOpen: !this.state.modalYaraRuleOpen,
      ipType
    });
  }
  /**
   * Toggle IR combo selection dialog
   * @method
   */
  toggleSelectionIR = (ipType) => {
    this.setState({
      modalIRopen: !this.state.modalIRopen,
      ipType
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
    const {ipDeviceInfo, ipType} = this.state;
    const url = `${baseUrl}/api/hmd/retrigger`;
    let requestData = {
      hostId: this.state.ipDeviceInfo[ipTypeParam || ipType].ipDeviceUUID,
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

        this.getHMDinfo(ipType);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }  
  /**
   * Display safety scan content
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   * @returns HMDscanInfo component
   */
  displaySafetyScanContent = (ipType) => {
    const {ipDeviceInfo} = this.state;

    if (ipDeviceInfo[ipType].isHmd) {
      return (
        <HMDscanInfo
          page='threats'
          ipType={ipType}
          currentDeviceData={ipDeviceInfo[ipType]}
          showAlertData={this.showAlertData}
          toggleYaraRule={this.toggleYaraRule}
          toggleSelectionIR={this.toggleSelectionIR}
          triggerTask={this.triggerTask} />
      )
    } else {
      return <span>{NOT_AVAILABLE}</span>
    }
  }
  /**
   * Toggle network behavior button
   * @method
   * @param {string} type - 'threats' or 'syslog'
   */
  toggleNetworkBtn = (type) => {
    this.setState({
      activeNetworkBehavior: type
    });
  }
  /**
   * Redirect to netflow or syslog page
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   */
  redirectNewPage = (ipType) => {
    const {baseUrl, contextRoot, language} = this.context;
    const {alertData} = this.props;
    const {activeNetworkBehavior} = this.state;
    const datetime = {
      from: helper.getFormattedDate(helper.getSubstractDate(1, 'hours', alertData._eventDttm_)),
      to: helper.getFormattedDate(alertData._eventDttm_, 'local')
    };
    const srcIp = this.getIpPortData('srcIp');
    const destIp = this.getIpPortData('destIp');
    let ipParam = '';
    let linkUrl ='';

    if (ipType === 'srcIp') {
      ipParam = `&sourceIP=${srcIp}`;
    } else if (ipType === 'destIp') {
      ipParam = `&sourceIP=${destIp}`;
    }
 
    if (activeNetworkBehavior === 'alert') {
      linkUrl = `${baseUrl}${contextRoot}/threats?from=${datetime.from}&to=${datetime.to}${ipParam}&lng=${language}`;
    } else if (activeNetworkBehavior === 'connections') {
      linkUrl = `${baseUrl}${contextRoot}/events/netflow?from=${datetime.from}&to=${datetime.to}${ipParam}&type=connections&lng=${language}`;
    } else if (activeNetworkBehavior === 'dns') {
      linkUrl = `${baseUrl}${contextRoot}/events/netflow?from=${datetime.from}&to=${datetime.to}${ipParam}&type=dns&lng=${language}`;
    } else if (activeNetworkBehavior === 'syslog') {
      linkUrl = `${baseUrl}${contextRoot}/events/syslog?from=${datetime.from}&to=${datetime.to}${ipParam}&lng=${language}`;
    }

    window.open(linkUrl, '_blank');
  }
  /**
   * Handle table sort for network behavior
   * @method
   * @param {string} type - network behavior type ('alert', 'connections', 'dns' or 'syslog')
   * @param {object} sort - sort data object
   */
  handleNetworkBehaviorTableSort = (type, sort) => {
    let tempNetworkBehavior = {...this.state.networkBehavior};
    tempNetworkBehavior[type].sort.field = sort.field;
    tempNetworkBehavior[type].sort.desc = sort.desc;

    this.setState({
      networkBehavior: tempNetworkBehavior
    });
  }
  /**
   * Get aggregated network behavior data
   * @method
   * @param {string} type - network behavior type ('alert', 'connections', 'dns' or 'syslog')
   * @param {object | array.<object>} data - network behavior data
   */
  getNetworkBehaviorData = (type, data) => {
    let tempData = [];

    if (type === 'alert') {
      _.forEach(SEVERITY_TYPE, val => {
        _.forEach(data, (val2, key) => {
          if (key !== 'default' && val === key) {
            tempData.push({
              severity: key,
              count: val2.doc_count
            });
          }
        })
      })
    } else if (type === 'connections' || type === 'dns') {
      _.forEach(data, val => {
        _.forEach(val.portDst.buckets, val2 => {
          tempData.push({
            destIp: val.key,
            destPort: val2.key,
            count: val.doc_count
          });
        })
      })
    } else if (type === 'syslog') {
      _.forEach(data, val => {
        tempData.push({
          configSource: val.key,
          count: val.doc_count
        });
      })
    }

    return tempData;
  }
  /**
   * Load network behavior data
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   */
  loadNetworkBehavior = (ipType) => {
    const {baseUrl} = this.context;
    const {alertData} = this.props;
    const {networkBehavior} = this.state;
    const eventDateTime = helper.getFormattedDate(alertData._eventDttm_, 'local');
    const eventDateFrom = helper.getSubstractDate(1, 'hours', eventDateTime);
    const datetime = {
      from: Moment(eventDateFrom).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: Moment(eventDateTime).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    let apiArr = [];

    if (ipType === 'srcIp') {
      if (!alertData.srcIp) {
        return;
      }

      apiArr = [
        {
          url: `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0`, //Threats srcIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query: 'sourceIP:' + alertData.srcIp
              }
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        },
        {
          url: `${baseUrl}/api/u1/network/session?pageSize=0`, //Connections srcIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query: 'sourceIP:' + alertData.srcIp
              }
            ],
            search: [
              'TopDestIpPortAgg'
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        },
        {
          url: `${baseUrl}/api/u1/network/session?pageSize=0`, //DNS srcIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query: 'sourceIP:' + alertData.srcIp
              },
              {
                condition: 'must',
                query: 'DNS' 
              }
            ],
            search: [
              'TopDestIpPortAgg'
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        },
        {
          url: `${baseUrl}/api/u2/alert/_search?pageSize=0`, //Syslog srcIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query: 'Top10SyslogConfigSource'
              },
              {
                condition: 'must',
                query: alertData.srcIp
              }
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        }
      ];
    } else if (ipType === 'destIp') {
      if (!alertData.destIp) {
        return;
      }

      apiArr = [
        {
          url: `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0`, //Threats destIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query: 'sourceIP:' + alertData.destIp
              }
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        },
        {
          url: `${baseUrl}/api/u1/network/session?pageSize=0`, //Connections destIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query: 'sourceIP:' + alertData.destIp
              }
            ],
            search: [
              'TopDestIpPortAgg'
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        },
        {
          url: `${baseUrl}/api/u1/network/session?pageSize=0`, //DNS destIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query: 'sourceIP:' + alertData.destIp
              },
              {
                condition: 'must',
                query: 'DNS' 
              }
            ],
            search: [
              'TopDestIpPortAgg'
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        },
        {
          url: `${baseUrl}/api/u2/alert/_search?pageSize=0`, //Syslog destIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query: 'Top10SyslogConfigSource'
              },
              {
                condition: 'must',
                query: alertData.destIp
              }
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        }
      ];
    }

    this.ah.all(apiArr)
    .then(data => {
      if (data && data.length > 0) {
        let tempNetworkBehavior = {...networkBehavior};
        let tempFields = {};
        networkBehavior.alert.fields.forEach(tempData => {
          tempFields[tempData] = {
            label: t(`txt-${tempData}`),
            sortable: false,
            formatter: (value, allValue, i) => {
              if (tempData === 'severity') {
                return <span className='severity-level' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>
              } else {
                return <span>{value}</span>
              }
            }
          }
        })

        tempNetworkBehavior.alert.fieldsData = tempFields;

        if (ipType === 'srcIp') {
          tempNetworkBehavior.alert.srcIp.totalCount = data[0].data.counts;

          if (data[0].aggregations) {
            tempNetworkBehavior.alert.srcIp.data = this.getNetworkBehaviorData('alert', data[0].aggregations);
          }
        } else if (ipType === 'destIp') {
          tempNetworkBehavior.alert.destIp.totalCount = data[0].data.counts;

          if (data[0].aggregations) {
            tempNetworkBehavior.alert.destIp.data = this.getNetworkBehaviorData('alert', data[0].aggregations);
          }
        }

        tempFields = {};
        networkBehavior.connections.fields.forEach(tempData => {
          tempFields[tempData] = {
            label: t(`txt-${tempData}`),
            sortable: true,
            formatter: (value, allValue, i) => {
              return <span>{value}</span>
            }
          }
        })

        tempNetworkBehavior.connections.fieldsData = tempFields;
        tempNetworkBehavior.dns.fieldsData = tempFields;

        if (ipType === 'srcIp') {
          tempNetworkBehavior.connections.srcIp.totalCount = data[1].data.counts;

          if (data[1].aggregations && data[1].aggregations.TopDestIpPortAgg) {
            tempNetworkBehavior.connections.srcIp.data = this.getNetworkBehaviorData('connections', data[1].aggregations.TopDestIpPortAgg.buckets);
          }

          tempNetworkBehavior.dns.srcIp.totalCount = data[2].data.counts;

          if (data[2].aggregations && data[2].aggregations.TopDestIpPortAgg) {
            tempNetworkBehavior.dns.srcIp.data = this.getNetworkBehaviorData('dns', data[2].aggregations.TopDestIpPortAgg.buckets);
          }
        } else if (ipType === 'destIp') {
          tempNetworkBehavior.connections.destIp.totalCount = data[1].data.counts;

          if (data[1].aggregations && data[1].aggregations.TopDestIpPortAgg) {
            tempNetworkBehavior.connections.destIp.data = this.getNetworkBehaviorData('connections', data[1].aggregations.TopDestIpPortAgg.buckets);
          }

          tempNetworkBehavior.dns.destIp.totalCount = data[2].data.counts;

          if (data[2].aggregations && data[2].aggregations.TopDestIpPortAgg) {
            tempNetworkBehavior.dns.destIp.data = this.getNetworkBehaviorData('dns', data[2].aggregations.TopDestIpPortAgg.buckets);
          }
        }

        tempFields = {};
        networkBehavior.syslog.fields.forEach(tempData => {
          tempFields[tempData] = {
            label: t(`txt-${tempData}`),
            sortable: true,
            formatter: (value, allValue, i) => {
              return <span>{value}</span>
            }
          }
        })

        tempNetworkBehavior.syslog.fieldsData = tempFields;

        if (ipType === 'srcIp') {
          tempNetworkBehavior.syslog.srcIp.totalCount = data[3].data.counts;

          if (data[3].aggregations && data[3].aggregations.Top10SyslogConfigSource) {
            tempNetworkBehavior.syslog.srcIp.data = this.getNetworkBehaviorData('syslog', data[3].aggregations.Top10SyslogConfigSource.agg.buckets);
          }
        } else if (ipType === 'destIp') {
          tempNetworkBehavior.syslog.destIp.totalCount = data[3].data.counts;

          if (data[3].aggregations && data[3].aggregations.Top10SyslogConfigSource) {
            tempNetworkBehavior.syslog.destIp.data = this.getNetworkBehaviorData('syslog', data[3].aggregations.Top10SyslogConfigSource.agg.buckets);
          }
        }

        this.setState({
          networkBehavior: tempNetworkBehavior
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display network behavior content
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   * @returns HTML DOM
   */
  displayNetworkBehaviorContent = (ipType) => {
    const {alertData} = this.props;
    const {activeNetworkBehavior, networkBehavior} = this.state;
    let datetime = {};

    if (alertData._eventDttm_) {
      datetime = {
        from: helper.getFormattedDate(helper.getSubstractDate(1, 'hours', alertData._eventDttm_)),
        to: helper.getFormattedDate(alertData._eventDttm_, 'local')
      };
    }

    if (this.getIpPortData(ipType) === NOT_AVAILABLE) {
      return <span>{NOT_AVAILABLE}</span>
    }

    return (
      <div className='network-behavior'>
        <ButtonGroup
          id='networkType'
          list={[
            {value: 'alert', text: t('txt-threats') + ' (' + networkBehavior.alert[ipType].totalCount + ')'},
            {value: 'connections', text: t('txt-connections-eng') + ' (' + networkBehavior.connections[ipType].totalCount + ')'},
            {value: 'dns', text: t('txt-dns') + ' (' + networkBehavior.dns[ipType].totalCount + ')'},
            {value: 'syslog', text: t('txt-syslog') + ' (' + networkBehavior.syslog[ipType].totalCount + ')'}
          ]}
          onChange={this.toggleNetworkBtn}
          value={activeNetworkBehavior} />

        {datetime.from && datetime.to &&
          <div className='msg'>{t('txt-alertHourBefore')}: {datetime.from} ~ {datetime.to}</div>
        }
        <button className='query-events' onClick={this.redirectNewPage.bind(this, ipType)}>{t('alert.txt-queryEvents')}</button>

        <div className='table-data'>
          <DataTable
            className='main-table network-behavior'
            fields={networkBehavior[activeNetworkBehavior].fieldsData}
            data={networkBehavior[activeNetworkBehavior][ipType].data}
            sort={networkBehavior[activeNetworkBehavior][ipType].data.length === 0 ? {} : networkBehavior[activeNetworkBehavior].sort}
            onSort={this.handleNetworkBehaviorTableSort.bind(this, activeNetworkBehavior)} />
        </div>
      </div>
    )
  }
  /**
   * Display JSON Data content
   * @method
   * @returns HTML DOM
   */
  displayJsonData = () => {
    const {alertData} = this.props;
    const hiddenFields = ['id', '_tableMenu_'];
    const allData = _.omit(alertData, hiddenFields);

    return (
      <ul className='json-data alert'>
        <li><JSONTree data={allData} theme={helper.getJsonViewTheme()} /></li>
      </ul>
    )
  }
  /**
   * Download paylaod file
   * @method
   * @returns false if origFileId and fileMD5 are not available
   */
  downloadFile = () => {
    const {baseUrl, contextRoot} = this.context;
    const {alertData} = this.props;
    let requestData = {};

    if (alertData.origFileId && alertData.fileMD5) {
      requestData = {
        origFileId: alertData.origFileId,
        md5: alertData.fileMD5
      };
    } else {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/honeynet/attack/payload/file`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.id) {
        window.location.href = `${baseUrl}${contextRoot}/api/honeynet/attack/payload/file/${data.id}`;
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Close dialog and reset state values
   * @method
   */
  closeDialog = () => {
    this.setState({
      showContent: {
        rule: false,
        attack: false,
        srcIp: false,
        destIp: false
      },
      alertRule: '',
      alertPayload: ''
    });
  }
  render() {
    const {titleText, actions} = this.props;
    const {modalYaraRuleOpen, modalIRopen} = this.state;

    return (
      <div>
        <ModalDialog
          id='dashboardModalDialog'
          className='modal-dialog'
          title={titleText}
          draggable={true}
          global={true}
          actions={actions}
          closeAction='confirm'>
          {this.displayAlertData()}
        </ModalDialog>

        {modalYaraRuleOpen &&
          <YaraRule
            toggleYaraRule={this.toggleYaraRule}
            triggerTask={this.triggerTask} />
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

AlertDetails.contextType = BaseDataContext;

AlertDetails.propTypes = {
  titleText: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  alertDetails: PropTypes.object.isRequired,
  alertData: PropTypes.object.isRequired,
  showAlertData: PropTypes.func.isRequired,
  fromPage: PropTypes.string.isRequired
};

export default AlertDetails;