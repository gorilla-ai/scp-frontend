import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Gis from 'react-gis/build/src/components'
import JSONTree from 'react-json-tree'

import Checkbox from 'react-ui/build/src/components/checkbox'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PageNav from 'react-ui/build/src/components/page-nav'
import Textarea from 'react-ui/build/src/components/textarea'

import {HocPrivateDetails as PrivateDetails} from './private-details'
import {HocSafetyScan as SafetyScan} from './safety-scan'
import helper from './helper'
import withLocale from '../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const PUBLIC_KEY = ['City', 'CountryCode', 'Latitude', 'Longitude'];
const NOT_AVAILABLE = 'N/A';

let t = null;
let f = null;

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
        activeIndex: '',
        hex: '',
        filterEmpty: false
      },
      alertPayload: '',
      alertInfo: {
        srcIp: {
          location: {},
          topology: {},
          ownerPic: '',
          ownerMap: '',
          ownerBaseLayers: {},
          ownerSeat: {}
        },
        destIp: {
          location: {},
          topology: {},
          ownerPic: '',
          ownerMap: '',
          ownerBaseLayers: {},
          ownerSeat: {}
        }
      },
      showRedirectMenu: false
    };

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount = () => {
    this.loadAlertContent();
    this.getIPcontent('srcIp');
    this.getIPcontent('destIp');
    document.addEventListener('mousedown', this.handleClickOutside);
  }
  componentDidUpdate = (prevProps) => {
    this.loadAlertContent(prevProps);
  }
  componentWillUnmount = () => {
    this.closeDialog();
    document.addEventListener('mousedown', this.handleClickOutside);
  }
  handleClickOutside = (e) => {
    if (this.wrapperRef && !this.wrapperRef.contains(e.target)) {
      this.setState({
        showRedirectMenu: false
      });
    }
  }
  setWrapperRef = (node) => {
    this.wrapperRef = node;
  }
  toggleRedirectMenu = () => {
    this.setState({
      showRedirectMenu: !this.state.showRedirectMenu
    });
  }
  redirectLink = (type, value) => {
    const {language, alertData} = this.props;
    const eventDatetime = helper.getFormattedDate(alertData._eventDttm_, 'local');
    const srcIp = this.getIpPortData('srcIp');
    const destIp = this.getIpPortData('destIp');
    let ipParam = '';

    if (type === 'events') {
      if (value === 'srcIp') {
        ipParam = `&srcIp=${srcIp}`;
      } else if (value === 'destIp') {
        ipParam = `&destIp=${destIp}`;
      }
      const url = `/ChewbaccaWeb/events/netflow?eventDttm=${eventDatetime}${ipParam}&lng=${language}`;

      window.open(url, '_blank');
    }
  }
  /**
   * Call corresponding Alert data based on conditions
   * @param {object} prevProps - previous props when the props have been updated
   * @returns none
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
   * Get IP content
   * @param {string} type - 'srcIp' or 'destIp'
   * @returns none
   */
  getIPcontent = (type) => {
    const {baseUrl, alertData, fromPage, locationType} = this.props;
    const {alertInfo} = this.state;
    const ip = this.getIpPortData(type);
    let tempAlertInfo = {...alertInfo};

    if (fromPage === 'dashboard') { //Get topo info for Dashboard page
      const srcDestType = type.replace('Ip', '');

      if (locationType === 'public') {
        tempAlertInfo[type].topology = alertData[srcDestType + 'TopoInfo'];

        _.forEach(PUBLIC_KEY, val => {
          tempAlertInfo[type].location[val] = alertData[srcDestType + val];
        })
      } else if (locationType === 'private') {
        tempAlertInfo[type].topology = alertData[srcDestType + 'TopoInfo'];
      }
    } else if (fromPage === 'alert') { //Get topo info for Alert page
      ah.one({
        url: `${baseUrl}/api/alert/ip2loc?ip=${ip}`,
        type: 'GET'
      })
      .then(data => {
        if (data) {
          data = data.rt;

          if (!_.isEmpty(data.Topology)) {
            tempAlertInfo[type].topology = data.Topology;
          } else {
            tempAlertInfo[type].location = data.Location;
          }
        }
      })
    }

    this.setState({
      alertInfo: tempAlertInfo
    }, () => {
      if (!_.isEmpty(alertInfo[type].topology)) {
        this.getOwnerPic(type);
        this.getOwnerSeat(type);
      }
    });
  }
  /**
   * Get owner picture based on location type
   * @param {string} type - 'srcIp' or 'destIp'
   * @returns none
   */
  getOwnerPic = (type) => {
    const {baseUrl} = this.props;
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
   * Set AlertInfo data
   * @param {string} type - 'srcIp' or 'destIp'
   * @returns none
   */
  getOwnerSeat = (type) => {
    const {baseUrl, contextRoot} = this.props;
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
   * Get Alert data
   * @param none
   * @returns none
   */
  getAlertRule = () => {
    const {baseUrl, alertData} = this.props;
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
   * @param {string} type - 'srcIp', 'destIp', 'srcPort', 'destPort'
   * @returns ip or port data
   */
  getIpPortData = (type) => {
    const {alertData} = this.props;

    if (type === 'srcIp') {
      return alertData.srcIp || alertData.ipSrc;
    } else if (type === 'destIp') {
      return alertData.destIp || alertData.ipDst;
    } else if (type === 'srcPort') {
      return alertData.srcPort || alertData.portSrc;
    } else if (type === 'destPort') {
      return alertData.destPort || alertData.portDst;
    }
  }
  /**
   * Get PCAP data
   * @param none
   * @returns none
   */
  getPCAPcontent = () => {
    const {baseUrl, alertData} = this.props;
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
      let tempAlertPCAP = {...alertPCAP};
      tempAlertPCAP.totalCount = data.counts;
      tempAlertPCAP.origData = data.rows;
      tempAlertPCAP.data = data.rows;

      this.setState({
        alertPCAP: tempAlertPCAP
      });
    })
    .catch(err => {
      helper.showPopupMsg(t('txt-pcapNotAvailable'), t('txt-error'));
    });
  }
  /**
   * Set Alert payload data
   * @param none
   * @returns none
   */
  getAttackJson = () => {
    const {alertData} = this.props;

    this.setState({
      alertPayload: alertData.payload
    });
  }
  /**
   * Get corresponding content based on content type
   * @param {string} the content type
   * @returns none
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
          this.getPCAPcontent();
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
   * @param {value} - 'High', 'Medium', 'Low'
   * @returns HTML Dom with severity
   */
  getSeverity = (value) => {
    let styleStatus = '';

    if (value === 'High') {
      styleStatus = '#d9576c';
    } else if (value === 'Medium') {
      styleStatus = '#d99857';
    } else if (value === 'Low') {
      styleStatus = '#57c3d9';
    } else if (value === NOT_AVAILABLE) {
      return <span>{NOT_AVAILABLE}</span>;
    }

    return <span className='severity' style={{backgroundColor: styleStatus}}>{value}</span>;
  }
  /**
   * Display Alert information in dialog box
   * @param none
   * @returns none
   */
  displayAlertData = () => {
    const {alertDetails, alertData} = this.props;
    const {alertType, showContent, alertRule, alertPCAP, alertPayload, showRedirectMenu} = this.state;
    const severity = alertData.Severity ? alertData.Severity : NOT_AVAILABLE;
    const collector = alertData.Collector ? alertData.Collector : NOT_AVAILABLE;
    const trigger = alertData.Trigger ? alertData.Trigger : NOT_AVAILABLE;
    const eventDatetime = alertData._eventDttm_ ? helper.getFormattedDate(alertData._eventDttm_, 'local') : NOT_AVAILABLE;
    const info = alertData.Info ? alertData.Info : NOT_AVAILABLE;

    return (
      <div>
        <table className='c-table main-table'>
          <thead>
            <tr>
              <th>{f('alertFields.Severity')}</th>
              <th>{f('alertFields.Collector')}</th>
              <th>{f('alertFields.Trigger')}</th>
              <th>{f('alertFields._eventDttm_')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='align-center severity-level'>{this.getSeverity(severity)}</td>
              <td className='align-center collector'>{collector}</td>
              <td className='align-center trigger'>{trigger}</td>
              <td className='align-center datetime'>{helper.getFormattedDate(eventDatetime, 'local')}</td>
            </tr>
          </tbody>
        </table>

        <div className='alert-info'>{info}</div>

        <table className='c-table main-table'>
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
              <li><span className={cx({'active': showContent.rule})} onClick={this.getContent.bind(this, 'rule')}>{t('alert.txt-rule')}</span></li>
              {alertType === 'alert' &&
                <li><span className={cx({'active': showContent.pcap})} onClick={this.getContent.bind(this, 'pcap')}>PCAP</span></li>
              }
              {alertType === 'pot_attack' &&
                <li><span className={cx({'active': showContent.attack})} onClick={this.getContent.bind(this, 'attack')}>{t('alert.txt-attack')}</span></li>
              }
              <li><span className={cx({'active': showContent.json})} onClick={this.getContent.bind(this, 'json')}>{t('alert.txt-viewJSON')}</span></li>
              <li className='header'>
                <span className='name'>{t('alert.txt-ipSrc')}</span>
                <span className='ip'>{this.getIpPortData('srcIp')}</span>
              </li>
              <li><span className={cx({'active': showContent.srcIp})} onClick={this.getContent.bind(this, 'srcIp')}>{t('alert.txt-ipBasicInfo')}</span></li>
              <li><span className={cx({'active': showContent.srcSafety})} onClick={this.getContent.bind(this, 'srcSafety')}>{t('alert.txt-safetyScanInfo')}</span></li>
              <li className='header'>
                <span className='name'>{t('alert.txt-ipDst')}</span>
                <span className='ip'>{this.getIpPortData('destIp')}</span>
              </li>
              <li><span className={cx({'active': showContent.destIp})} onClick={this.getContent.bind(this, 'destIp')}>{t('alert.txt-ipBasicInfo')}</span></li>
              <li><span className={cx({'active': showContent.destSafety})} onClick={this.getContent.bind(this, 'destSafety')}>{t('alert.txt-safetyScanInfo')}</span></li>
            </ul>
          </div>
          <div className='content'>
            <div className='options-buttons'>
              {(showContent.srcIp || showContent.destIp) &&
                <div onClick={this.toggleRedirectMenu}>{t('alert.txt-queryMore')}</div>
              }

              {showContent.pcap &&
                <div onClick={this.getPcapFile}>{t('alert.txt-downloadPCAP')}</div>
              }

              {showContent.attack &&
                <div onClick={this.downloadFile}>{t('alert.txt-downloadFile')}</div>
              }
            </div>

            {showRedirectMenu && showContent.srcIp &&
              this.displayRedirectMenu('srcIp')
            }

            {showRedirectMenu && showContent.destIp &&
              this.displayRedirectMenu('destIp')
            }

            {showContent.rule && alertRule &&
              this.displayRuleContent()
            }

            {showContent.pcap && alertPCAP &&
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
              this.displaySafetyScanContent('srcSafety')
            }

            {showContent.destSafety &&
              this.displaySafetyScanContent('destSafety')
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
   * Display redirect menu
   * @param {string} type - 'srcIp' or 'destIp'
   * @returns none
   */
  displayRedirectMenu = (type) => {
    return (
      <ul className='redirect-menu' ref={this.setWrapperRef}>
        <li onClick={this.redirectLink.bind(this, 'events', type)}>{t('alert.txt-queryEvents')}</li>
      </ul>
    )
  }
  /**
   * Display rule content
   * @param none
   * @returns none
   */
  displayRuleContent = () => {
    const {alertType, alertRule} = this.state;

    if (alertType === 'alert') {
      return (
        <ul className='alert-rule'>
          {alertRule.length > 0 &&
            alertRule.map((val, i) => {
              return <li key={i}>{val.rule}</li>
            })
          }
          {alertRule.length === 0 &&
            <li>{NOT_AVAILABLE}</li>
          }
        </ul>
      )
    } else {
      return (
        <span>{alertRule}</span>
      )
    }
  }
  /**
   * Set PCAP hex value
   * @param {string} hex - original string value
   * @param {number} index - active index for the Alert PCAP array
   * @returns none
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
   * @param {string} currentPage - current page of the PCAP info
   * @returns none
   */
  setPCAPpage = (currentPage) => {
    let tempAlertPCAP = {...this.state.alertPCAP};
    tempAlertPCAP.page = currentPage;
    tempPcapData.filterEmpty = false;

    this.setState({
      alertPCAP: tempAlertPCAP
    }, () => {
      this.getPCAPcontent();
    });
  }
  /**
   * Toggle (check/uncheck) to show/hide the PCAP data
   * @param none
   * @returns none
   */
  toggleFilterEmpty = () => {
    const {alertPCAP} = this.state;
    let tempAlertPCAP = {...alertPCAP};
    tempAlertPCAP.activeIndex = '';
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
   * Display PCAP content
   * @param none
   * @returns none
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

    return (
      <div className='pcap-content'>
        {alertPCAP.data.length > 0 &&
          <div className='c-flex aic filter-empty alert'>
            <label htmlFor='filterEmpty'>{t('alert.txt-filterEmpty')}</label>
            <Checkbox
              id='filterEmpty'
              onChange={this.toggleFilterEmpty}
              checked={alertPCAP.filterEmpty} />
          </div>
        }
        <div className='pcap'>
          <div className='list'>
            <ul>
              {alertPCAP.data.length > 0 &&
                alertPCAP.data.map((key, i) => {
                  return <li id={key} key={i} className={cx({'active': key.hex})} onClick={this.setPCAPhex.bind(this, key.hex, i)}>{key.protocol}<i className={cx('fg', {'fg-arrow-left': alertPCAP.activeIndex === i})}></i></li>
                })
              }
              {alertPCAP.data.length === 0 &&
                <li><span>{NOT_AVAILABLE}</span></li>
              }
            </ul>
          </div>
          <div className='data'>
            {str &&
              <Textarea value={str} readOnly={true} />
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
   * @param none
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
   * @param none
   * @returns {string} - list width

   */
  getListWidth = () => {
    const {language} = this.props;

    if (language === 'en') {
      return '120px';
    } else if (language === 'zh') {
      return '50px';
    }
  }
  /**
   * Check location data
   * @param {string} item - key item
   * @param {string} data - data associated with the key
   * @returns {string} - return only the valid data

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
   * @param {string} type - 'srcIp' or 'destIp'
   * @returns none
   */
  getPublicInfo = (type) => {
    const {baseUrl, contextRoot} = this.props;
    const {alertInfo} = this.state;
    const countryCodeType = 'CountryCode';
    const countryType = 'CountryName';
    let validDataCount = 0;

    return (
      <ul className='public'>
      {
        PUBLIC_KEY.map((item, i) => {
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
        })
      }

      {validDataCount === 0 &&
        <li>{t('txt-notFound')} {this.getIpPortData(type)}</li>
      }
      </ul>
    )
  }
  /**
   * Display Alert private info
   * @param {string} type - 'srcIp' or 'destIp'
   * @returns none
   */
  getPrivateInfo = (type) => {
    const {baseUrl, contextRoot, language, alertData} = this.props;
    const {alertInfo} = this.state;
    const topoInfo = alertInfo[type].topology;
    const picPath = alertInfo[type].ownerPic ? alertInfo[type].ownerPic : contextRoot + '/images/empty_profile.png';
    const url_login = {
      pathname: '/ChewbaccaWeb/honeynet/employee-record',
      search: `?lng=${language}`
    };
    const url_access = {
      pathname: '/ChewbaccaWeb/honeynet/employee-record',
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
   * Display IP content
   * @param {string} type - 'srcIp' or 'destIp'
   * @returns none
   */
  displayIPcontent = (type) => {
    const {alertInfo} = this.state;

    return (
      <div>
        {(_.isEmpty(alertInfo[type].topology) && _.isEmpty(alertInfo[type].location)) && 
          <span>{t('txt-notFound')} {this.getIpPortData(type)}</span>
        }

        {type === 'srcIp' && !_.isEmpty(alertInfo[type].location) && //Public
          <div className='srcIp-content'>
            {this.getPublicInfo(type)}
          </div>
        }

        {type === 'srcIp' && !_.isEmpty(alertInfo[type].topology) && //Private
          <div className='srcIp-content'>
            {this.getPrivateInfo(type)}
          </div>
        }

        {type === 'destIp' && !_.isEmpty(alertInfo[type].location) && //Public
          <div className='destIp-content'>
            {this.getPublicInfo(type)}
          </div>
        }

        {type === 'destIp' && !_.isEmpty(alertInfo[type].topology) && //Private
          <div className='destIp-content'>
            {this.getPrivateInfo(type)}
          </div>
        }
      </div>
    )
  }
  /**
   * Display safety scan content
   * @param {string} type - 'srcIp' or 'destIp'
   * @returns none
   */
  displaySafetyScanContent = (type) => {
    return (
      <div>{NOT_AVAILABLE}</div>
      /*<SafetyScan
        type={type} />*/
    )
  }
  /**
   * Display Json Data content
   * @param none
   * @returns none
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
   * @param none
   * @returns none
   */
  getPcapFile = () => {
    const {baseUrl, alertData} = this.props;
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
      helper.showPopupMsg(t('txt-pcapNotAvailable'), t('txt-error'));
    });
  }
  /**
   * Download paylaod file
   * @param none
   * @returns none
   */
  downloadFile = () => {
    const {baseUrl, contextRoot, alertData} = this.props;
    const dataObj = {
      origFileId: alertData.origFileId,
      md5: alertData.fileMD5
    };

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
   * Reset state values
   * @param none
   * @returns none
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
        activeIndex: '',
        hex: '',
        filterEmpty: false
      },
      alertPayload: ''
    });
  }
  render() {
    const {titleText, actions} = this.props;

    return (
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
    )
  }
}

AlertDetails.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  titleText: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  alertDetails: PropTypes.object.isRequired,
  alertData: PropTypes.object.isRequired,
  showAlertData: PropTypes.func.isRequired,
  fromPage: PropTypes.string.isRequired
};

const HocAlertDetails = withLocale(AlertDetails);
export { AlertDetails, HocAlertDetails };