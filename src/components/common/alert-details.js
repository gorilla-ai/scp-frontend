import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Checkbox from 'react-ui/build/src/components/checkbox'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PageNav from 'react-ui/build/src/components/page-nav'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Textarea from 'react-ui/build/src/components/textarea'

import JSONTree from 'react-json-tree'

import {BaseDataContext} from './context';
import {HocPrivateDetails as PrivateDetails} from './private-details'
import helper from './helper'
import {HocHMDscanInfo as HMDscanInfo} from './hmd-scan-info'
import {HocIrSelections as IrSelections} from './ir-selections'
import withLocale from '../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const PUBLIC_KEY = ['City', 'CountryCode', 'Latitude', 'Longitude'];
const NOT_AVAILABLE = 'N/A';

let t = null;
let f = null;

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
      alertType: '',
      showContent: {
        rule: false,
        pcap: false,
        attack: false,
        srcIp: false,
        destIp: false,
        srcSafety: false,
        destSafety: false,
        json: false
      },
      alertRule: '',
      alertPCAP: {
        origData: [],
        data: [],
        page: 1,
        pageSize: 10,
        totalCount: 0,
        activeIndex: null,
        hex: '',
        filterEmpty: false
      },
      alertPayload: '',
      alertInfo: {
        srcIp: {
          locationType: '',
          location: {},
          topology: {},
          ownerPic: '',
          ownerMap: {},
          ownerBaseLayers: {},
          ownerSeat: {}
        },
        destIp: {
          locationType: '',
          location: {},
          topology: {},
          ownerPic: '',
          ownerMap: {},
          ownerBaseLayers: {},
          ownerSeat: {}
        }
      },
      ipDeviceInfo: {
        srcIp: {},
        destIp: {}
      },
      showRedirectMenu: false,
      modalIRopen: false,
      ipType: ''
    };

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.loadAlertContent();
    this.getIPcontent('srcIp');
    this.getIPcontent('destIp');
    this.getHMDinfo('srcIp');
    this.getHMDinfo('destIp');
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
      pcap: false,
      attack: false,
      srcIp: false,
      destIp: false,
      srcSafety: false,
      destSafety: false,
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
   * @param {string} type - 'srcIp' or 'destIp'
   */
  setTopologyInfo = (alertInfo, type) => {
    this.setState({
      alertInfo
    }, () => {
      const {alertInfo} = this.state;

      if (!_.isEmpty(alertInfo[type].topology)) {
        this.getOwnerPic(type);
        this.getOwnerSeat(type);
      }
    });
  }
  /**
   * Get source or destination topology data
   * @method
   * @param {string} type - 'srcIp' or 'destIp'
   */
  getIPcontent = (type) => {
    const {baseUrl} = this.context;
    const {alertData, fromPage, locationType} = this.props;
    const {alertInfo} = this.state;
    const ip = this.getIpPortData(type);
    let tempAlertInfo = {...alertInfo};

    if (fromPage === 'dashboard') { //Get topo info for Dashboard page
      const srcDestType = type.replace('Ip', '');

      if (locationType === 'public') {
        tempAlertInfo[type].locationType = alertData[srcDestType + 'LocType'];
        tempAlertInfo[type].topology = alertData[srcDestType + 'TopoInfo'];

        if (type === 'srcIp' && alertData.srcLocType) {
          tempAlertInfo[type].locationType = alertData.srcLocType;
        }

        if (type === 'destIp' && alertData.destLocType) {
          tempAlertInfo[type].locationType = alertData.destLocType;
        }

        _.forEach(PUBLIC_KEY, val => {
          tempAlertInfo[type].location[val] = alertData[srcDestType + val];
        })
      } else if (locationType === 'private') {
        tempAlertInfo[type].locationType = alertData[srcDestType + 'LocType'];
        tempAlertInfo[type].topology = alertData[srcDestType + 'TopoInfo'];
      }
      this.setTopologyInfo(tempAlertInfo, type);
    } else if (fromPage === 'threats') { //Get topo info for Threats page
      if (ip) {
        ah.one({
          url: `${baseUrl}/api/alert/ip2loc?ip=${ip}`,
          type: 'GET'
        })
        .then(data => {
          if (data) {
            data = data.rt;
  
            if (!_.isEmpty(data.Topology)) { //Private
              tempAlertInfo[type].locationType = 2;
              tempAlertInfo[type].topology = data.Topology;
            } else { //Public
              tempAlertInfo[type].locationType = 1;
              tempAlertInfo[type].location = data.Location;
            }
            this.setTopologyInfo(tempAlertInfo, type);
          }
        })
      }
    }
  }
  /**
   * Get IP device info for HMD section
   * @method
   * @param {string} type - 'srcIp' or 'destIp'
   */
  getHMDinfo = (type) => {
    const {baseUrl, contextRoot} = this.context;
    const {ipDeviceInfo} = this.state;
    const IP = this.getIpPortData(type);

    this.ah.one({
      url: `${baseUrl}/api/u1/ipdevice/_search?ip=${IP}`,
      type: 'GET'
    })
    .then(data => {
      if (data && data.rows.length > 0) {
        let tempIPdeviceInfo = {...ipDeviceInfo};
        tempIPdeviceInfo[type] = data.rows[0];

        this.setState({
          ipDeviceInfo: tempIPdeviceInfo
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get owner picture based on location type
   * @method
   * @param {string} type - 'srcIp' or 'destIp'
   */
  getOwnerPic = (type) => {
    const {baseUrl} = this.context;
    const {alertInfo} = this.state;
    const ownerUUID = alertInfo[type].topology.ownerUUID;
    let tempAlertInfo = {...alertInfo};

    if (ownerUUID) {
      this.ah.one({
        url: `${baseUrl}/api/owner?uuid=${ownerUUID}`,
        type: 'GET'
      })
      .then(data => {
        if (data) {
          tempAlertInfo[type].ownerPic = data.base64;

          this.setState({
            alertInfo: tempAlertInfo
          });
        }
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
  }
  /**
   * Set owner map and seat data for alertInfo
   * @method
   * @param {string} type - 'srcIp' or 'destIp'
   */
  getOwnerSeat = (type) => {
    const {baseUrl, contextRoot} = this.context;
    const {alertInfo} = this.state;
    const topoInfo = alertInfo[type].topology;
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
    
    tempAlertInfo[type].ownerMap = ownerMap;
    tempAlertInfo[type].ownerBaseLayers[topoInfo.areaUUID] = ownerMap;
    tempAlertInfo[type].ownerSeat[topoInfo.areaUUID] = {
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
    const {alertType} = this.state;
    const index = alertData.index;
    const projectId = alertData.projectName;

    if (alertType === 'alert') {
      const url = `${baseUrl}/api/network/alert/rule?projectId=${projectId}`;
      let alertInfo = {
        alert: {}
      };

      if (alertData.alert && alertData.alert.signature_id) {
        alertInfo.alert.signature_id = alertData.alert.signature_id;
      } else if (alertData.trailName) {
        alertInfo.alert.trailName = alertData.trailName;
      }

      helper.getAjaxData('POST', url, alertInfo)
      .then(data => {
        if (data) {
          this.setState({
            alertRule: data
          });
        }
      });
    } else {
      this.setState({
        alertRule: alertData.Rule
      });
    }
  }
  /**
   * Get IP and Port data
   * @method
   * @param {string} type - 'srcIp', 'destIp', 'srcPort', 'destPort'
   * @returns IP or port
   */
  getIpPortData = (type) => {
    const {alertData} = this.props;

    if (type === 'srcIp') {
      return alertData.srcIp || alertData.ipSrc || NOT_AVAILABLE;
    } else if (type === 'destIp') {
      return alertData.destIp || alertData.ipDst || NOT_AVAILABLE;
    } else if (type === 'srcPort') {
      return alertData.srcPort || alertData.portSrc || NOT_AVAILABLE;
    } else if (type === 'destPort') {
      return alertData.destPort || alertData.portDst || NOT_AVAILABLE;
    }
  }
  /**
   * Reset PCAP data
   * @method
   */
  resetPCAPcontent = () => {
    this.setState({
      alertPCAP: {
        origData: [],
        data: [],
        page: 1,
        pageSize: 10,
        totalCount: 0,
        activeIndex: null,
        hex: '',
        filterEmpty: false
      }
    }, () => {
      this.getPCAPcontent();
    });
  }
  /**
   * Get and set PCAP data
   * @method
   */
  getPCAPcontent = () => {
    const {baseUrl} = this.context;
    const {alertData} = this.props;
    const {alertPCAP} = this.state;
    const projectId = alertData.projectName;
    const url = `${baseUrl}/api/alert/pcapContent?projectId=${projectId}&page=${alertPCAP.page}&pageSize=${alertPCAP.pageSize}`;
    const data = {
      ipSrc: this.getIpPortData('srcIp'),
      portSrc: this.getIpPortData('srcPort'),
      ipDst: this.getIpPortData('destIp'),
      portDst: this.getIpPortData('destPort'),
      lastPacket: alertData.lastPacket
    };

    helper.getAjaxData('POST', url, data)
    .then(data => {
      if (data) {
        let tempAlertPCAP = {...alertPCAP};
        tempAlertPCAP.totalCount = data.counts;
        tempAlertPCAP.origData = data.rows;
        tempAlertPCAP.data = data.rows;

        this.setState({
          alertPCAP: tempAlertPCAP
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
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
   * @param {string} the content type
   */
  getContent = (type) => {
    this.setState({
      showContent: {
        rule: false,
        pcap: false,
        attack: false,
        srcIp: false,
        destIp: false,
        srcSafety: false,
        destSafety: false,
        json: false
      }
    }, () => {
      let tempShowContent = {...this.state.showContent};

      switch(type) {
        case 'rule':
          this.getAlertRule();
          tempShowContent.rule = true;
          break;
        case 'pcap':
          this.resetPCAPcontent();
          tempShowContent.pcap = true;
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
          tempShowContent.srcSafety = true;
          break;
        case 'destSafety':
          tempShowContent.destSafety = true;
          break;
        case 'json':
          tempShowContent.json = true;
          break;
      }

      this.setState({
        showContent: tempShowContent
      });
    });
  }
  /**
   * Get alert severity
   * @method
   * @param {value} - 'Emergency', 'Alert', 'Critical', 'Warning', 'Notice'
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
   * Display redirect IP menu for source IP and dest. IP
   * @method
   * @param {string} url - url to be redirected
   */
  redirectIp = (url) => {
    window.open(url, '_blank');
  }
  /**
   * Display redirect IP menu for source IP and dest. IP
   * @method
   * @returns HTML DOM
   */
  getRedirectIp = () => {
    const {baseUrl, contextRoot} = this.context;
    const {showContent, alertInfo} = this.state;
    let text = t('txt-add');
    let type = 'new';
    let ip = '';
    let showRedirect = false;

    if (showContent.srcIp && alertInfo.srcIp.locationType === 2 && alertInfo.srcIp.topology) {
      ip = alertInfo.srcIp.topology.ip;

      if (alertInfo.srcIp.topology.mac) {
        text = t('txt-edit');
        type = 'edit';
      }
      showRedirect = true;
    } else if (showContent.destIp && alertInfo.destIp.locationType === 2 && alertInfo.destIp.topology) {
      ip = alertInfo.destIp.topology.ip;

      if (alertInfo.destIp.topology.mac) {
        text = t('txt-edit');
        type = 'edit';
      }
      showRedirect = true;
    }

    if (showRedirect) {
      const url = `${baseUrl}${contextRoot}/configuration/topology/inventory?ip=${ip}&type=${type}`;
      return <div className='redirect-ip' onClick={this.redirectIp.bind(this, url)}>{text}</div>
    }
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
   * Display Alert information in dialog box
   * @method
   * @returns HTML DOM
   */
  displayAlertData = () => {
    const {alertDetails, alertData} = this.props;
    const {alertType, showContent, alertRule, alertPCAP, alertPayload, showRedirectMenu} = this.state;
    const severity = alertData._severity_ ? this.getSeverity(alertData._severity_) : NOT_AVAILABLE;
    const eventDatetime = alertData._eventDttm_ ? helper.getFormattedDate(alertData._eventDttm_, 'local') : NOT_AVAILABLE;

    return (
      <div>
        <table className='c-table main-table top-info'>
          <thead>
            <tr>
              <th>{f('alertFields._severity_')}</th>
              <th>{f('alertFields.Collector')}</th>
              <th>{f('alertFields.Trigger')}</th>
              <th>{f('alertFields._eventDttm_')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='align-center severity-level'>{severity}</td>
              <td className='align-center collector'>{alertData.Collector || NOT_AVAILABLE}</td>
              <td className='align-center trigger'>{alertData.Trigger || NOT_AVAILABLE}</td>
              <td className='align-center datetime'>{eventDatetime}</td>
            </tr>
          </tbody>
        </table>

        <div className='alert-info'>{alertData.Info || NOT_AVAILABLE}</div>

        <table className='c-table main-table top-info'>
          <thead>
            <tr>
              <th>{f('alertFields.srcIp')}</th>
              <th>{f('alertFields.srcPort')}</th>
              <th>{f('alertFields.destIp')}</th>
              <th>{f('alertFields.destPort')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='align-center src-ip'>{this.getIpPortData('srcIp')}</td>
              <td className='align-center src-port'>{this.getIpPortData('srcPort')}</td>
              <td className='align-center dest-ip'>{this.getIpPortData('destIp')}</td>
              <td className='align-center dest-port'>{this.getIpPortData('destPort')}</td>
            </tr>
          </tbody>
        </table>

        <div className='main-content'>
          <div className='nav'>
            <ul>
              <li onClick={this.getContent.bind(this, 'rule')}><span className={cx({'active': showContent.rule})}>{t('alert.txt-rule')}</span></li>
              {alertType === 'alert' && alertData.Collector !== 'NetProbe' &&
                <li onClick={this.getContent.bind(this, 'pcap')}><span className={cx({'active': showContent.pcap})}>PCAP</span></li>
              }
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
              <li className='header'>
                <span className='name'>{t('alert.txt-ipDst')}</span>
                <span className='ip'>{this.getIpPortData('destIp')}</span>
              </li>
              <li className='child' onClick={this.getContent.bind(this, 'destIp')}><span className={cx({'active': showContent.destIp})}>{t('alert.txt-ipBasicInfo')}</span></li>
              <li className='child' onClick={this.getContent.bind(this, 'destSafety')}><span className={cx({'active': showContent.destSafety})}>{t('alert.txt-safetyScanInfo')}</span></li>
            </ul>
          </div>
          <div className='content'>
            <div className='options-buttons'>
              {(showContent.srcIp || showContent.destIp) &&
                <section>
                  {this.getRedirectIp()}
                  {this.getQueryMore()}
                </section>
              }

              {showContent.pcap && alertPCAP.data.length > 0 &&
                <div onClick={this.getPcapFile}>{t('alert.txt-downloadPCAP')}</div>
              }

              {showContent.attack && alertData.fileMD5 &&
                <div onClick={this.downloadFile}>{t('alert.txt-downloadFile')}</div>
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

            {showContent.pcap &&
              this.displayPCAPcontent()
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

            {showContent.json &&
              this.displayJsonData()
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
    const {language} = this.context;
    const {alertData} = this.props;
    const eventDatetime = helper.getFormattedDate(alertData._eventDttm_, 'local');
    const srcIp = this.getIpPortData('srcIp');
    const destIp = this.getIpPortData('destIp');
    let ipParam = '';
    let linkUrl ='';
 
    if (type === 'events') {
      if (value === 'srcIp') {
        ipParam = `&srcIp=${srcIp}`;
      } else if (value === 'destIp') {
        ipParam = `&destIp=${destIp}`;
      }
      linkUrl = `/SCP/events/netflow?eventDttm=${eventDatetime}${ipParam}&lng=${language}`;
    } else if (type === 'virustotal') {
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
   * @param {string} type - 'srcIp' or 'destIp'
   * @returns HTML DOM
   */
  displayRedirectMenu = (type) => {
    return (
      <ul className='redirect-menu' ref={this.setWrapperRef}>
        <li onClick={this.redirectLink.bind(this, 'events', type)}>{t('alert.txt-queryEvents')}</li>
        <li onClick={this.redirectLink.bind(this, 'virustotal', type)}>{t('alert.txt-searthVirustotal')}</li>
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
   * Display rule content
   * @method
   * @returns HTML DOM
   */
  displayRuleContent = () => {
    const {alertType, alertRule} = this.state;

    if (alertRule.length === 0) {
      return <span>{NOT_AVAILABLE}</span>
    }

    if (alertType === 'alert') {
      return (
        <ul className='alert-rule'>
          {alertRule.map(this.showRuleContent)}
          {this.showRuleRefsData()}
        </ul>
      )
    } else {
      return (
        <section className='alert-rule'>
          <span>{alertRule}</span>
          {this.showRuleRefsData()}
        </section>
      )
    }
  }
  /**
   * Set PCAP hex value
   * @method
   * @param {string} [hex] - original string value
   * @param {number} index - active index of the Alert PCAP array
   */
  setPCAPhex = (hex, index) => {
    let tempAlertPCAP = {...this.state.alertPCAP};

    if (hex) {
      tempAlertPCAP.hex = hex.replace(/\s/g, '');
    } else {
      return false;
    }
    tempAlertPCAP.activeIndex = index;

    this.setState({
      alertPCAP: tempAlertPCAP
    });
  }
  /**
   * Set PCAP page
   * @method
   * @param {string} currentPage - current page of the PCAP info
   */
  setPCAPpage = (currentPage) => {
    let tempAlertPCAP = {...this.state.alertPCAP};
    tempAlertPCAP.page = currentPage;
    tempAlertPCAP.activeIndex = null;
    tempAlertPCAP.hex = '';
    tempAlertPCAP.filterEmpty = false;

    this.setState({
      alertPCAP: tempAlertPCAP
    }, () => {
      this.getPCAPcontent();
    });
  }
  /**
   * Toggle (check/uncheck) to show/hide the PCAP data
   * @method
   */
  toggleFilterEmpty = () => {
    const {alertPCAP} = this.state;
    let tempAlertPCAP = {...alertPCAP};
    tempAlertPCAP.activeIndex = null;
    tempAlertPCAP.hex = '';
    tempAlertPCAP.filterEmpty = !tempAlertPCAP.filterEmpty;

    if (tempAlertPCAP.filterEmpty) {
      let alertPCAPdata = [];

      _.forEach(alertPCAP.data, val => {
        if (val.hex) {
          alertPCAPdata.push(val);
        }
      })
      tempAlertPCAP.data = alertPCAPdata;
    } else {
      tempAlertPCAP.data = _.cloneDeep(alertPCAP.origData);
    }

    this.setState({
      alertPCAP: tempAlertPCAP
    });
  }
  /**
   * Display individual PCAP data
   * @method
   * @param {object} val - PCAP data
   * @param {number} i - index
   * @returns HTML DOM
   */
  showPCAPcontent = (val, i) => {
    return <li key={i} className={cx({'active': val.hex})} onClick={this.setPCAPhex.bind(this, val.hex, i)}>{val.protocol}<i className={cx('fg', {'fg-arrow-left': this.state.alertPCAP.activeIndex === i})}></i></li> 
  }
  /**
   * Display PCAP content
   * @method
   * @returns HTML DOM
   */
  displayPCAPcontent = () => {
    const {alertPCAP} = this.state;
    const hex = alertPCAP.hex;
    let str = '';

    if (hex) {
      for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
    }

    if (alertPCAP.data.length === 0) {
      return <span>{NOT_AVAILABLE}</span>
    }

    return (
      <div className='pcap-content'>
        <div className='c-flex aic filter-empty'>
          <label htmlFor='filterEmpty'>{t('alert.txt-filterEmpty')}</label>
          <Checkbox
            id='filterEmpty'
            onChange={this.toggleFilterEmpty}
            checked={alertPCAP.filterEmpty} />
        </div>
        <div className='pcap'>
          <div className='list'>
            <ul>
              {alertPCAP.data.map(this.showPCAPcontent)}
            </ul>
          </div>
          <div className='data'>
            {str &&
              <Textarea
                value={str} 
                readOnly={true} />
            }
          </div>
        </div>
        {alertPCAP.totalCount > alertPCAP.pageSize &&
          <footer>
            <PageNav
              pages={Math.ceil(alertPCAP.totalCount / alertPCAP.pageSize)}
              current={alertPCAP.page}
              onChange={this.setPCAPpage} />
          </footer>
        }
      </div>
    )
  }
  /**
   * Display PCAP payload content
   * @method
   * @returns HTML DOM
   */
  displayPayloadcontent = () => {
    const {alertPayload} = this.state;

    return (
      <div className='payload'>
        <ul>
          <li><JSONTree data={alertPayload} theme={helper.getJsonViewTheme()} /></li>
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
   * @param {string} item - key of the public info
   * @param {number} i - index 
   * @returns HTML DOM
   */
  showPuclicInfo = (type, item, i) => {
    const {baseUrl, contextRoot} = this.context;
    const {alertInfo} = this.state;
    const countryCodeType = 'CountryCode';
    const countryType = 'CountryName';
    let validDataCount = 0;

    if (alertInfo[type]['location'][item]) {
      if (item === countryCodeType) { //Display country flag
        const countryCode = alertInfo[type]['location'][item].toLowerCase();
        const picPath = `${contextRoot}/images/flag/${countryCode}.png`;

        if (countryCode && countryCode != '-') {
          validDataCount++;

          return (
            <li key={item + i}>
              <span className='key' style={{width: this.getListWidth()}}>{t('payloadsFields.' + item)}</span>
              <span className='value'><img src={picPath} title={alertInfo[type]['location'][countryType]} /></span>
            </li>
          )
        }
      } else { //Display location info
        const data = alertInfo[type]['location'][item];
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
      <li>{t('txt-notFound')} {this.getIpPortData(type)}</li>
    }
  }
  /**
   * Display Alert public info
   * @method
   * @param {string} type - 'srcIp' or 'destIp'
   * @returns HTML DOM
   */
  getPublicInfo = (type) => {
    return (
      <ul className='public'>
        {PUBLIC_KEY.map(this.showPuclicInfo.bind(this, type))}
      </ul>
    )
  }
  /**
   * Display Alert private info
   * @method
   * @param {string} type - 'srcIp' or 'destIp'
   * @returns PrivateDetails component
   */
  getPrivateInfo = (type) => {
    const {baseUrl, contextRoot, language} = this.context;
    const {alertData} = this.props;
    const {alertInfo} = this.state;
    const topoInfo = alertInfo[type].topology;
    const picPath = alertInfo[type].ownerPic ? alertInfo[type].ownerPic : contextRoot + '/images/empty_profile.png';
    const url_login = {
      pathname: '/SCP/honeynet/employee-record',
      search: `?lng=${language}`
    };
    const url_access = {
      pathname: '/SCP/honeynet/employee-record',
      search: `?eventDttm=${alertData._eventDttm_}&lng=${language}`,
      state: {
        alertData
      }
    };
    const srcDestType = type.replace('Ip', '');

    return (
      <PrivateDetails
        type={type}
        alertInfo={alertInfo}
        topoInfo={topoInfo}
        picPath={picPath}
        srcDestType={srcDestType} />
    )
  }
  /**
   * Get content for the public IP
   * @method
   * @param {string} type - 'srcIp' or 'destIp'
   * @returns HTML DOM
   */
  getPublicIPcontent = (type) => {
    const {alertInfo} = this.state;

    if (alertInfo[type].location.City !== '-' && alertInfo[type].location.CountryCode !== '-') {
      return this.getPublicInfo(type);
    } else {
      return <span>{NOT_AVAILABLE}</span>
    }
  }
  /**
   * Display IP content
   * @method
   * @param {string} type - 'srcIp' or 'destIp'
   * @returns HTML DOM
   */
  displayIPcontent = (type) => {
    const {alertInfo} = this.state;

    return (
      <div>
        {(_.isEmpty(alertInfo[type].topology) && _.isEmpty(alertInfo[type].location)) && 
          <span>{NOT_AVAILABLE}</span>
        }

        {type === 'srcIp' && (!_.isEmpty(alertInfo[type].location) || alertInfo[type].locationType === 1) && //Public
          <div className='srcIp-content'>
            {this.getPublicIPcontent(type)}
          </div>
        }

        {type === 'srcIp' && (!_.isEmpty(alertInfo[type].topology) || alertInfo[type].locationType === 2) && //Private
          <div className='srcIp-content'>
            {this.getPrivateInfo(type)}
          </div>
        }

        {type === 'destIp' && (!_.isEmpty(alertInfo[type].location) || alertInfo[type].locationType === 1) && //Public
          <div className='destIp-content'>
            {this.getPublicIPcontent(type)}
          </div>
        }

        {type === 'destIp' && (!_.isEmpty(alertInfo[type].topology) || alertInfo[type].locationType === 2) && //Private
          <div className='destIp-content'>
            {this.getPrivateInfo(type)}
          </div>
        }
      </div>
    )
  }
  /**
   * Handle trigger button for HMD
   * @method
   * @param {array.<string>} type - HMD scan type
   * @param {string} [activeIP] - IP type ('srcIp' or 'destIp')
   */
  triggerTask = (type, activeIP) => {
    const {baseUrl, contextRoot} = this.context;
    const {ipDeviceInfo, ipType} = this.state;
    const url = `${baseUrl}/api/hmd/retrigger`;
    const activeIPtype = activeIP || ipType;
    const requestData = {
      hostId: ipDeviceInfo[activeIPtype].ipDeviceUUID,
      cmds: type
    };

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      if (data) {
        PopupDialog.alert({
          id: 'tiggerTaskModal',
          confirmText: t('txt-close'),
          display: <div>{t('txt-requestSent')}</div>
        });
        this.getHMDinfo(type);
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'));
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
   * Display safety scan content
   * @method
   * @param {string} type - 'srcIp' or 'destIp'
   * @returns HMDscanInfo component
   */
  displaySafetyScanContent = (type) => {
    const {ipDeviceInfo} = this.state;

    if (ipDeviceInfo[type].isHmd) {
      return (
        <HMDscanInfo
          ipType={type}
          currentDeviceData={ipDeviceInfo[type]}
          toggleSelectionIR={this.toggleSelectionIR}
          showAlertData={this.showAlertData}
          triggerTask={this.triggerTask} />
      )
    } else {
      return <span>{NOT_AVAILABLE}</span>
    }
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
   * Get Alert PCAP file
   * @method
   */
  getPcapFile = () => {
    const {baseUrl} = this.context;
    const {alertData} = this.props;
    const projectId = alertData.projectName;
    const url = `${baseUrl}/api/network/alert/pcap?projectId=${projectId}`;
    const data = {
      projectId : projectId,
      ipSrc: this.getIpPortData('srcIp'),
      portSrc: this.getIpPortData('srcPort'),
      ipDst: this.getIpPortData('destIp'),
      portDst: this.getIpPortData('destPort'),
      lastPacket: alertData.lastPacket
    };

    helper.getAjaxData('POST', url, data)
    .then(data => {
      if (data.ResultMessage === 'fail') {
        helper.showPopupMsg(t('txt-pcapDownloadFail'), t('txt-error'), data.ErrorMessage);
      } else {
        window.location.assign(data.PcapFilelink);
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  /**
   * Download paylaod file
   * @method
   * @returns false if origFileId and fileMD5 are not available
   */
  downloadFile = () => {
    const {baseUrl, contextRoot} = this.context;
    const {alertData} = this.props;
    const dataObj = {
      origFileId: alertData.origFileId,
      md5: alertData.fileMD5
    };

    if (!alertData.origFileId && !alertData.fileMD5) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/honeynet/attack/payload/file`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.id) {
        window.location.href = `${baseUrl}${contextRoot}/api/honeynet/attack/payload/file/${data.id}`;
      }
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
        pcap: false,
        attack: false,
        srcIp: false,
        destIp: false
      },
      alertRule: '',
      alertPCAP: {
        data: [],
        page: 1,
        pageSize: 10,
        totalCount: 0,
        activeIndex: null,
        hex: '',
        filterEmpty: false
      },
      alertPayload: ''
    });
  }
  /**
   * Display IR selection modal dialog
   * @method
   * @returns IrSelections component
   */
  irSelectionDialog = () => {
    return (
      <IrSelections
        triggerTask={this.triggerTask}
        toggleSelectionIR={this.toggleSelectionIR}
      />
    )
  }
  render() {
    const {titleText, actions} = this.props;
    const {modalIRopen} = this.state;

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

        {modalIRopen &&
          this.irSelectionDialog()
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

const HocAlertDetails = withLocale(AlertDetails);
export { AlertDetails, HocAlertDetails };