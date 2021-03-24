import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import BarChart from 'react-chart/build/src/components/bar'
import DataTable from 'react-ui/build/src/components/table'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PieChart from 'react-chart/build/src/components/pie'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import JSONTree from 'react-json-tree'

import {BaseDataContext} from './context';

import EncodeDecode from './encode-decode'
import helper from './helper'
import HMDscanInfo from './hmd-scan-info'
import IrSelections from './ir-selections'
import NetworkBehavior from './network-behavior'
import PrivateDetails from './private-details'
import YaraRule from './yara-rule'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};
const PUBLIC_KEY = ['City', 'Country', 'CountryCode', 'Latitude', 'Longitude'];
const NOT_AVAILABLE = 'N/A';

let t = null;
let f = null;

/**
 * Alert Details
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
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
      eventInfo: {
        dataFieldsArr: ['@timestamp', '_EventCode', 'message'],
        dataFields: {},
        dataContent: [],
        scrollCount: 1,
        hasMore: false
      },
      showRedirectMenu: false,
      modalYaraRuleOpen: false,
      modalIRopen: false,
      modalEncodeOpen: false,
      mouseX: null,
      mouseY: null,
      highlightedText: '',
      threatsCount: 'last10', //'last10', 'last20' or 'last50'
      threatsCountData10: null,
      threatsCountData20: null,
      threatsCountData50: null,
      internalNetworkData: null,
      threatStatAlert: null,
      threatStatFields: ['severity', 'count'],
      threatStatFieldsData: {},
      threatStatData: [],
      threatStat: null,
      eventStatConfig: null,
      eventStatFields: ['configSource', 'count'],
      eventStatFieldsData: {},
      eventStatData: [],
      eventStat: null
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
        this.clearChartsData();
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
          } else {
            tempAlertInfo[ipType].location[val] = '';
          }
        })

        this.setTopologyInfo(tempAlertInfo, ipType);
      }
    }
  }
  /**
   * Get Event Tracing request data
   * @method
   * @param {string} ipDeviceUUID - IP Device UUID
   */
  getRequestData = (ipDeviceUUID) => {
    const {datetime} = this.props;
    const requestData = {
      '@timestamp': [datetime.from, datetime.to],
      sort: [
        {
          '@timestamp': 'desc'
        }
      ],
      filters: [
        {
          condition: 'must',
          query: 'configSource: hmd'
        },
        {
          condition: 'must',
          query: 'hostId: ' + ipDeviceUUID
        }
      ]
    };

    return requestData;
  }
  /**
   * Check IP device info for HMD
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   */
  getHMDinfo = (ipType) => {
    const {baseUrl} = this.context;
    const {alertData} = this.props;
    const {alertInfo, ipDeviceInfo} = this.state;
    const ip = this.getIpPortData(ipType);
    const srcDestType = ipType.replace('Ip', '');

    if (ip === NOT_AVAILABLE) {
      return;
    }

    let apiArr = [
      {
        url: `${baseUrl}/api/v2/ipdevice/_search?exactIp=${ip}`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/v2/ipdevice?exactIp=${ip}&page=1&pageSize=5`,
        type: 'GET'
      }
    ];
    let tempAlertInfo = {...alertInfo};
    let tempIPdeviceInfo = {...ipDeviceInfo};

    if (alertData[srcDestType + 'TopoInfo']) {
      const ipDeviceUUID = alertData[srcDestType + 'TopoInfo'].ipDeviceUUID;

      apiArr.push({
        url: `${baseUrl}/api/u1/log/event/_search?page=1&pageSize=20`,
        data: JSON.stringify(this.getRequestData(ipDeviceUUID)),
        type: 'POST',
        contentType: 'text/plain'
      });
    }

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
            ipDeviceInfo: tempIPdeviceInfo,
            modalIRopen: false
          });
        }

        if (data[2]) {
          this.setEventTracingData(data[2]);
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Load Event Tracing data
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   * @param {number} [page] - page number
   */
  loadEventTracing = (ipType, page) => {
    const {baseUrl} = this.context;
    const srcDestType = ipType.replace('Ip', '');
    const ipDeviceUUID = this.props.alertData[srcDestType + 'TopoInfo'].ipDeviceUUID;

    this.ah.one({
      url: `${baseUrl}/api/u1/log/event/_search?page=${page || this.state.eventInfo.scrollCount}&pageSize=20`,
      data: JSON.stringify(this.getRequestData(ipDeviceUUID)),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.setEventTracingData(data);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set Event Tracing data
   * @method
   * @param {object} data - data from server response
   */
  setEventTracingData = (data) => {
    const {eventInfo} = this.state;
    let tempEventInfo = {...eventInfo};

    if (data.data.rows.length > 0) {
      const dataContent = data.data.rows.map(tempData => {
        tempData.content.id = tempData.id;
        return tempData.content;
      });

      eventInfo.dataFieldsArr.forEach(tempData => {
        tempEventInfo.dataFields[tempData] = {
          label: f(`logsFields.${tempData}`),
          sortable: false,
          formatter: (value, allValue) => {
            if (tempData === '@timestamp') {
              value = helper.getFormattedDate(value, 'local');
            }
            return <span>{value}</span>
          }
        };
      })

      tempEventInfo.dataContent = _.concat(eventInfo.dataContent, dataContent);
      tempEventInfo.scrollCount++;
      tempEventInfo.hasMore = true;

      this.setState({
        eventInfo: tempEventInfo
      });
    } else {
      tempEventInfo.hasMore = false;

      this.setState({
        eventInfo: tempEventInfo
      });
    }
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

    if (topoInfo.seatUUID) {
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
    }

    this.setState({
      alertInfo: tempAlertInfo
    });
  }
  /**
   * Set charts data to initial values
   * @method
   */
  clearChartsData = () => {
    this.setState({
      threatsCount: 'last10',
      threatsCountData10: null,
      threatsCountData20: null,
      threatsCountData50: null,
      internalNetworkData: null,
      threatStatAlert: null,
      threatStatFieldsData: {},
      threatStatData: [],
      threatStat: null,
      eventStatConfig: null,
      eventStatFieldsData: {},
      eventStatData: [],
      eventStat: null
    }, () => {
      this.getChartsData();
    });
  }
  /**
   * Get and set charts data for alert rule
   * @method
   */
  getChartsData = () => {
    const {baseUrl} = this.context;
    const {alertData} = this.props;
    const {threatStatFields, eventStatFields} = this.state;
    const timeTo = moment(alertData._eventDttm_).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    let url = '';
    let timeFrom = '';
    let requestData = {};

    url = `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0&histogramInterval=60m`;
    timeFrom = moment(helper.getSubstractDate(1, 'month', alertData._eventDttm_)).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    requestData = {
      timestamp: [timeFrom, timeTo],
      filters: [
        {
          condition: 'must',
          query: alertData.blackIP
        }
      ]
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        let threatsCountData10 = [];
        let threatsCountData20 = [];
        let threatsCountData50 = [];

        _.forEach(data.event_histogramRecent10, val => {
          threatsCountData10.push({
            time: helper.getFormattedDate(val.key_as_string, 'local'),
            count: val.doc_count
          });
        })

        _.forEach(data.event_histogramRecent20, val => {
          threatsCountData20.push({
            time: helper.getFormattedDate(val.key_as_string, 'local'),
            count: val.doc_count
          });
        })

        _.forEach(data.event_histogramRecent50, val => {
          threatsCountData50.push({
            time: helper.getFormattedDate(val.key_as_string, 'local'),
            count: val.doc_count
          });
        })

        this.setState({
          threatsCountData10,
          threatsCountData20,
          threatsCountData50
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    url = `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0`;
    timeFrom = moment(helper.getSubstractDate(1, 'hour', alertData._eventDttm_)).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    requestData = {
      timestamp: [timeFrom, timeTo],
      filters: [
        {
          condition: 'must',
          query: alertData.blackIP
        }
      ],
      search: [
        'InternalMaskedIp'
      ]
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        let internalNetworkData = [];
        let threatStatAlert = [];
        let threatStat = [];

        _.forEach(data.aggregations.InternalMaskedIp4UIF, val => {
          internalNetworkData.push({
            subnet: val.subnet,
            count: val.doc_count
          });
        })

        _.forEach(data.aggregations.alertThreatLevel4UIF, val => {
          threatStatAlert.push({
            severity: val.key,
            count: val.doc_count
          });
        })

        let tempFields = {};
        threatStatFields.forEach(tempData => {
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

        _.forEach(data.event_histogram4UIF, val => {
          threatStat.push({
            time: helper.getFormattedDate(val.key_as_string, 'local'),
            count: val.doc_count,
            rule: val.severity
          });
        })

        this.setState({
          internalNetworkData,
          threatStatAlert,
          threatStatFieldsData: tempFields,
          threatStatData: threatStatAlert,
          threatStat
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    url = `${baseUrl}/api/u2/log/event/_search`;
    requestData = {
      timestamp: [timeFrom, timeTo],
      filters: [
        {
          condition: 'must',
          query: alertData.blackIP
        },
        {
          condition: 'must',
          query: 'Top10SyslogConfigSource'
        }
      ]
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        let eventStatConfig = [];
        let eventStat = [];

        _.forEach(data.aggregations.Top10SyslogConfigSource.agg.buckets, val => {
          eventStatConfig.push({
            configSource: val.key,
            count: val.doc_count
          });
        })     

        let tempFields = {};
        eventStatFields.forEach(tempData => {
          tempFields[tempData] = {
            label: t(`txt-${tempData}`),
            sortable: false,
            formatter: (value, allValue, i) => {
              return <span>{value}</span>
            }
          }
        })

        _.forEach(data.aggregations.Top10SyslogConfigSource.event_histogram.buckets, val => {
          eventStat.push({
            time: helper.getFormattedDate(val.key_as_string, 'local'),
            count: val.doc_count
          });
        })

        this.setState({
          eventStatConfig,
          eventStatFieldsData: tempFields,
          eventStatData: eventStatConfig,
          eventStat
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
    this.setState({
      alertPayload: this.props.alertData.payload
    });
  }
  /**
   * Set corresponding content based on content type
   * @method
   * @param {string} type - the content type
   * @param {object} alertData - Alert data type
   */
  getContent = (type, alertData) => {
    if (type === 'attack' && this.state.alertType !== 'pot_attack') {
      return;
    }

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

      switch (type) {
        case 'rule':
          tempShowContent.rule = true;
          break;
        case 'attack':
          this.getAttackJson();
          tempShowContent.attack = true;
          break;
        case 'json':
          tempShowContent.json = true;
          break;
        case 'srcIp':
          this.getHMDinfo(type);
          tempShowContent.srcIp = true;
          break;
        case 'destIp':
          this.getHMDinfo(type);
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
          tempShowContent.srcNetwork = true;
          break;
        case 'destNetwork':
          tempShowContent.destNetwork = true;
          break;
      }

      this.setState({
        showContent: tempShowContent
      });
    });
  }
  /**
   * Display Download File link and encode option
   * @method
   */
  getDownloadFileContent = () => {
    const {alertData} = this.props;

    return (
      <div className='multi-items'>
        {alertData.fileMD5 &&
          <span onClick={this.downloadFile}>{t('alert.txt-downloadFile')}</span>
        }
        <span onClick={this.openEncodeDialog}>{t('alert.txt-encodeDecode')}</span>
      </div>
    )
  }
  /**
   * Display encode and encode option
   * @method
   */
  getEncodeContent = () => {
    return (
      <div className='multi-items'>
        <span onClick={this.openEncodeDialog}>{t('alert.txt-encodeDecode')}</span>
      </div>
    )
  }
  /**
   * Display Query More menu
   * @method
   * @param {string} options - options for 'rule'
   * @returns HTML DOM
   */
  getQueryMoreContent = (options) => {
    const {showContent} = this.state;
    let ip = '';

    if (showContent.srcIp) {
      ip = this.getIpPortData('srcIp');
    } else if (showContent.destIp) {
      ip = this.getIpPortData('destIp');
    }

    if ((ip && ip !== NOT_AVAILABLE) || options === 'rule') {
      return (
        <div className='multi-items'>
          <span id='queryMoreBtn' onClick={this.toggleRedirectMenu}>{t('alert.txt-queryMore')}</span>
        </div>
      )
    }
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
  getRedirectIpContent = () => {
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

    return (
      <div className='multi-items'>
        <span onClick={this.redirectIp.bind(this, url)}>{text}</span>
      </div>
    )
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
          <Button variant='contained' color='primary' onClick={this.redirectVidoeURL.bind(this, videoUrl)}>{t('alert.txt-openVideo')}</Button>
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
    const {alertDetails, alertData, currentPage, pageSize, totalPageCount, fromPage} = this.props;
    const {alertType, showContent, alertPayload, showRedirectMenu} = this.state;
    const eventDatetime = alertData._eventDttm_ ? helper.getFormattedDate(alertData._eventDttm_, 'local') : NOT_AVAILABLE;
    const firstItemCheck = alertDetails.currentIndex === 0;
    const lastItemCheck = alertDetails.currentIndex + 1 === alertDetails.currentLength;
    const firstPageCheck = currentPage === 1;
    const lastPageCheck = currentPage === Math.ceil(totalPageCount / pageSize);
    let paginationDisabled = {
      previous: '',
      next: ''
    };

    if (fromPage === 'dashboard') {
      paginationDisabled.previous = firstItemCheck;
      paginationDisabled.next = lastItemCheck;
    } else if (fromPage === 'threats') {
      paginationDisabled.previous = firstItemCheck && firstPageCheck;
      paginationDisabled.next = lastItemCheck && lastPageCheck;
    }

    return (
      <div>
        <table className='c-table main-table align-center with-border'>
          <thead>
            <tr>
              <th>{f('alertFields._eventDttm_')}</th>
              <th>{f('alertFields._severity_')}</th>
              <th>{f('alertFields.srcIp')}</th>
              <th>{f('alertFields.destIp')}</th>
              <th>{f('alertFields.Collector')}</th>
              <th>{f('alertFields.Source')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td id='alertDetailsCellTime' className='datetime'>{eventDatetime}</td>
              <td id='alertDetailsCellSeverity' className='severity-level'>{helper.getSeverityColor(alertData._severity_)}</td>
              <td id='alertDetailsCellSrcIp' className='src-ip'>{this.getIpPortData('srcIp')}</td>
              <td id='alertDetailsCellDestIp' className='dest-ip'>{this.getIpPortData('destIp')}</td>
              <td id='alertDetailsCellCollector' className='collector'>{alertData.Collector || NOT_AVAILABLE}</td>
              <td id='alertDetailsCellSource' className='source'>{alertData.Source || NOT_AVAILABLE}</td>
            </tr>
          </tbody>
        </table>

        <div className='alert-info'>{this.showAlertContent()}</div>
        <div className='main-content'>
          <div className='nav'>
            <ul>
              <li onClick={this.getContent.bind(this, 'rule')}><span className={cx({'active': showContent.rule})}>{t('alert.txt-ruleAnalysis')}</span></li>
              <li className={cx({'not-allowed': alertType !== 'pot_attack'})} onClick={this.getContent.bind(this, 'attack')}><span className={cx({'active': showContent.attack})}>{t('alert.txt-attack')}</span></li>
              <li onClick={this.getContent.bind(this, 'json')}><span className={cx({'active': showContent.json})}>{t('txt-viewJSON')}</span></li>
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
              <section>
                {showContent.rule &&
                  this.getQueryMoreContent('rule')
                }

                {showContent.attack &&
                  this.getDownloadFileContent()
                }

                {showContent.json &&
                  this.getEncodeContent()
                }

                {(showContent.srcIp || showContent.destIp) &&
                  this.getQueryMoreContent()
                }

                {(showContent.srcIp || showContent.destIp) &&
                  this.getRedirectIpContent()
                }
              </section>
            </div>

            {showRedirectMenu && showContent.rule &&
              this.displayRedirectMenu('rule')
            }

            {showRedirectMenu && showContent.srcIp &&
              this.displayRedirectMenu('srcIp')
            }

            {showRedirectMenu && showContent.destIp &&
              this.displayRedirectMenu('destIp')
            }

            {showContent.rule &&
              this.displayRuleContent()
            }

            {showContent.attack && alertPayload &&
              this.displayPayloadcontent()
            }

            {showContent.json &&
              this.displayJsonData()
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
        {alertDetails.currentLength > 0 &&
          <div className='pagination'>
            <div className='buttons'>
              <Button id='navigationPrevious' variant='outlined' color='primary' onClick={this.props.showAlertData.bind(this, 'previous')} disabled={paginationDisabled.previous}>{t('txt-previous')}</Button>
              <Button id='navigationNext' variant='outlined' color='primary' onClick={this.props.showAlertData.bind(this, 'next')} disabled={paginationDisabled.next}>{t('txt-next')}</Button>
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
   * @param {string} type - virustotal', 'threats' or 'syslog'
   * @param {string} [value] - IP address, 'srcIp' or 'destIp'
   */
  redirectLink = (type, value) => {
    const {baseUrl, contextRoot, language} = this.context;
    const {alertData} = this.props;
    const datetime = {
      from: helper.getFormattedDate(helper.getSubstractDate(1, 'hours', alertData._eventDttm_)),
      to: helper.getFormattedDate(alertData._eventDttm_, 'local')
    };
    let linkUrl = '';

    if (type === 'virustotal') {
      let ip = value;

      if (value === 'srcIp' || value === 'destIp') {
        ip = this.getIpPortData(value);
      }

      linkUrl = 'https:\//www.virustotal.com/gui/ip-address/' + ip + '/relations';
    } else if (type === 'threats') {
      linkUrl = `${baseUrl}${contextRoot}/threats?from=${datetime.from}&to=${datetime.to}&sourceIP=${alertData.blackIP}&lng=${language}`;
    } else if (type === 'syslog') {
      linkUrl = `${baseUrl}${contextRoot}/events/syslog?from=${datetime.from}&to=${datetime.to}&sourceIP=${alertData.blackIP}&lng=${language}`;
    }

    window.open(linkUrl, '_blank');
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
   * Display redirect menu
   * @method
   * @param {string} options - 'srcIp', 'destIp' or 'rule'
   * @returns HTML DOM
   */
  displayRedirectMenu = (options) => {
    const {baseUrl, contextRoot} = this.context;
    const {alertData} = this.props;

    if (options === 'srcIp' || options === 'destIp') {
      return (
        <ul className='redirect-menu' ref={this.setWrapperRef}>
          <li id='virusTotalBtn' onClick={this.redirectLink.bind(this, 'virustotal', options)}>{t('alert.txt-searthVirustotal')}</li>
        </ul>
      )
    } else if (options === 'rule') {
      const startDttm = moment(helper.getSubstractDate(10, 'minutes', alertData._eventDttm_)).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      const endDttm = moment(helper.getAdditionDate(10, 'minutes', alertData._eventDttm_)).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      const agentId = alertData._edgeInfo ? alertData._edgeInfo.agentId : '';
      const downloadLink = `${baseUrl}${contextRoot}/api/alert/pcap?agentId=${agentId}&startDttm=${startDttm}&endDttm=${endDttm}&targetIp=${alertData.srcIp || alertData.ipSrc}&infoType=${alertData['alertInformation.type']}`;

      return (
        <ul className='redirect-menu' ref={this.setWrapperRef}>
          {alertData.pcapFlag && agentId &&
            <li id='downloadPcapBtn' onClick={this.pcapDownload.bind(this, downloadLink)}>{t('alert.txt-downloadPCAP')}</li>
          }
          {alertData.blackIP &&
            <li id='virusTotalBtn' onClick={this.redirectLink.bind(this, 'virustotal', alertData.blackIP)}>{t('alert.txt-searthVirustotal')}</li>
          }
        </ul>
      )
    }
  }
  /**
   * Show tooltip info when mouseover the chart
   * @method
   * @param {string} type - 'threatsCountData', 'internalNetworkData', 'threatStat' or 'eventStat'
   * @param {object} eventInfo - MouseoverEvents
   * @param {array.<object>} data - chart data
   * @returns HTML DOM
   */
  onTooltip = (type, eventInfo, data) => {
    if (type === 'threatsCountData' || type === 'eventStat') {
      return (
        <section>
          <span>{t('txt-time')}: {data[0].time}<br /></span>
          <span>{t('txt-count')}: {helper.numberWithCommas(data[0].count)}</span>
        </section>
      )
    } else if (type === 'internalNetworkData') {
      return (
        <section>
          <span>{t('txt-count')}: {helper.numberWithCommas(data[0].count)}</span>
        </section>
      )
    } else if (type === 'threatStat') {
      return (
        <section>
          <span>{t('txt-severity')}: {data[0].rule}<br /></span>
          <span>{t('txt-time')}: {data[0].time}<br /></span>
          <span>{t('txt-count')}: {helper.numberWithCommas(data[0].count)}</span>
        </section>
      )
    }
  }
  /**
   * Display bar chart
   * @method
   * @param {string} dataType - 'threatsCountData', 'internalNetworkData', 'threatStat' or 'eventStat'
   * @returns BarChart component
   */
  displayBarChart = (dataType) => {
    const {
      threatsCount,
      threatsCountData10,
      threatsCountData20,
      threatsCountData50,
      internalNetworkData,
      threatStat,
      eventStat
    } = this.state;
    let data = [];
    let dataCfg = {};
    let type = '';
    let chartAttributes = {};

    if (dataType === 'threatsCountData') {
      if (threatsCount === 'last10') {
        data = threatsCountData10;
      } else if (threatsCount === 'last20') {
        data = threatsCountData20;
      } else if (threatsCount === 'last50') {
        data = threatsCountData50;
      }
      
      dataCfg = {
        x: 'time',
        y: 'count'
      };
      type = 'datetime';
    } else if (dataType === 'internalNetworkData') {
      data = internalNetworkData;
      dataCfg = {
        x: 'subnet',
        y: 'count'
      };
      type = 'category';
    } else if (dataType === 'threatStat') {
      data = threatStat;
      dataCfg = {
        x: 'time',
        y: 'count',
        splitSeries: 'rule'
      };
      type = 'datetime';
      chartAttributes = {
        colors: ALERT_LEVEL_COLORS,
      };
    } else if (dataType === 'eventStat') {
      data = eventStat;
      dataCfg = {
        x: 'time',
        y: 'count'
      };
      type = 'datetime';
    }

    return (
      <div className='chart-group'>
        <BarChart
          stacked
          vertical
          legend={{
            enabled: true
          }}
          data={data}
          dataCfg={dataCfg}
          chart={{
            height: 215
          }}
          xAxis={{
            type
          }}
          plotOptions={{
            series: {
              maxPointWidth: 20
            }
          }}
          tooltip={{
            formatter: this.onTooltip.bind(this, dataType)
          }}
          {...chartAttributes} />
      </div>
    )
  }
  /**
   * Handle Threats chart count change
   * @method
   * @param {object} event - event object
   * @param {string} type - chart count ('last10', 'last20' or 'last50')
   */
  toggleThreatCount = (event, type) => {
    if (!type) {
      return;
    }

    this.setState({
      threatsCount: type
    });
  }
  /**
   * Display rule content
   * @method
   * @returns HTML DOM
   */
  displayRuleContent = () => {
    const {alertData} = this.props;
    const {
      threatsCount,
      threatsCountData10,
      internalNetworkData,
      threatStatAlert,
      threatStatFieldsData,
      threatStatData,
      threatStat,
      eventStatConfig,
      eventStatFieldsData,
      eventStatData,
      eventStat
    } = this.state;
    const threatCreateDttm = alertData.threatTextCreateDttm === 'N/A' ? NOT_AVAILABLE : helper.getFormattedDate(alertData.threatTextCreateDttm, 'local');
    const threatUpdateDttm = alertData.threatTextUpdateDttm === 'N/A' ? NOT_AVAILABLE : helper.getFormattedDate(alertData.threatTextUpdateDttm, 'local');

    return (
      <div className='alert-rule'>
        <div className='section'>
          <header>{t('alert.txt-threatsContent')}</header>
          <ul>
            <li><span className='header'>{t('alert.txt-severityType')}</span>: <span id='threatsContentSeverity'>{alertData.severity_type || NOT_AVAILABLE}</span></li>
            <li><span className='header'>{t('alert.txt-severityDesc')}</span>: <span id='threatsContentDesc'>{alertData.severity_type_description || NOT_AVAILABLE}</span></li>
            <li><span className='header'>{t('alert.txt-collectorType')}</span>: <span id='threatsContentCollector'>{alertData.Collector || NOT_AVAILABLE}</span></li>
            <li><span className='header'>{t('alert.txt-threatsType')}</span>: <span id='threatsContentType'>{alertData.severity_type_name || NOT_AVAILABLE}</span></li>
            <li><span className='header'>{t('alert.txt-threatsCreateDttm')}</span>: <span id='threatsContentCreateDttm'>{threatCreateDttm || NOT_AVAILABLE}</span></li>
            <li><span className='header'>{t('alert.txt-threatsUpdateDttm')}</span>: <span id='threatsContentUpdateDttm'>{threatUpdateDttm || NOT_AVAILABLE}</span></li>
          </ul>
        </div>

        <div className='section' style={{marginTop: '-10px'}}>
          <header>{t('alert.txt-networkBehavior')}</header>
          <div className='title'>{t('alert.txt-activeThreatsCount')}</div>
          {!threatsCountData10 &&
            <span><i className='fg fg-loading-2'></i></span>
          }
          {threatsCountData10 && threatsCountData10.length === 0 &&
            <span>{t('txt-notFound')}</span>
          }
          {threatsCountData10 && threatsCountData10.length > 0 &&
            <div>
              <ToggleButtonGroup
                id='threatsCountBtn'
                className='chart-btn'
                value={threatsCount}
                exclusive
                onChange={this.toggleThreatCount}>
                <ToggleButton id='threatsCountLast10' value='last10'>{t('alert.txt-last10')}</ToggleButton>
                <ToggleButton id='threatsCountLast20' value='last20'>{t('alert.txt-last20')}</ToggleButton>
                <ToggleButton id='threatsCountLast50' value='last50'>{t('alert.txt-last50')}</ToggleButton>
              </ToggleButtonGroup>

              {this.displayBarChart('threatsCountData')}
            </div>
          }
        </div>

        <div className='section'>
          <header>{t('alert.txt-internalNetworkDist')}</header>
          <div className='title'>{t('alert.txt-lastHourData')}</div>
          {!internalNetworkData &&
            <span><i className='fg fg-loading-2'></i></span>
          }
          {internalNetworkData && internalNetworkData.length === 0 &&
            <span>{t('txt-notFound')}</span>
          }
          {internalNetworkData && internalNetworkData.length > 0 &&
            this.displayBarChart('internalNetworkData')
          }
        </div>

        <div className='section'>
          <header>{t('alert.txt-threatStat')}</header>
          <Button id='alertQueryMoreAlertBtn' variant='contained' color='primary' className='info-btn' onClick={this.redirectLink.bind(this, 'threats', alertData.blackIP)} disabled={!alertData.blackIP}>{t('alert.txt-queryMoreEvents')}</Button>
          <div className='title'>{t('alert.txt-lastHourData')}</div>
          <div className='chart-content'>
            {!threatStatAlert &&
              <span><i className='fg fg-loading-2'></i></span>
            }
            {threatStatAlert && threatStatAlert.length === 0 &&
              <span>{t('txt-notFound')}</span>
            }
            {threatStatAlert && threatStatAlert.length > 0 &&
              <div className='chart-group'>
                <PieChart
                  data={threatStatAlert}
                  chart={{
                    height: 215
                  }}
                  colors={{
                    severity: ALERT_LEVEL_COLORS
                  }}
                  keyLabels={{
                    severity: t('alert.txt-threatLevel'),
                    count: t('txt-count')
                  }}
                  valueLabels={{
                    'Pie Chart': {
                      severity: t('alert.txt-threatLevel'),
                      count: t('txt-count')
                    }
                  }}
                  dataCfg={{
                    splitSlice: ['severity'],
                    sliceSize: 'count'
                  }} />
              </div>
            }
            {threatStatData && threatStatData.length > 0 &&
              <div className='chart-group table'>
                <DataTable
                  className='main-table table-data'
                  fields={threatStatFieldsData}
                  data={threatStatData} />
              </div>
            }
          </div>

          {!threatStat &&
            <span><i className='fg fg-loading-2'></i></span>
          }
          {threatStat && threatStat.length === 0 &&
            <span>{t('txt-notFound')}</span>
          }
          {threatStat && threatStat.length > 0 &&
            this.displayBarChart('threatStat')
          }
        </div>

        <div className='section'>
          <header>{t('alert.txt-eventStat')}</header>
          <Button id='alertQueryMoreLogsBtn' variant='contained' color='primary' className='info-btn' onClick={this.redirectLink.bind(this, 'syslog', alertData.blackIP)} disabled={!alertData.blackIP}>{t('alert.txt-queryMoreLogs')}</Button>
          <div className='title'>{t('alert.txt-lastHourData')}</div>
          <div className='chart-content'>
            {!eventStatConfig &&
              <span><i className='fg fg-loading-2'></i></span>
            }
            {eventStatConfig && eventStatConfig.length === 0 &&
              <span>{t('txt-notFound')}</span>
            }
            {eventStatConfig && eventStatConfig.length > 0 &&
              <div className='chart-group'>
                <PieChart
                  data={eventStatConfig}
                  chart={{
                    height: 215
                  }}
                  keyLabels={{
                    configSource: t('txt-configSource'),
                    count: t('txt-count')
                  }}
                  valueLabels={{
                    'Pie Chart': {
                      configSource: t('txt-configSource'),
                      count: t('txt-count')
                    }
                  }}
                  dataCfg={{
                    splitSlice: ['configSource'],
                    sliceSize: 'count'
                  }} />
              </div>
            }
            {eventStatData && eventStatData.length > 0 &&
              <div className='chart-group table'>
                <DataTable
                  className='main-table table-data'
                  fields={eventStatFieldsData}
                  data={eventStatData} />
              </div>
            }
          </div>

          {!eventStat &&
            <span><i className='fg fg-loading-2'></i></span>
          }
          {eventStat && eventStat.length === 0 &&
            <span>{t('txt-notFound')}</span>
          }
          {eventStat && eventStat.length > 0 &&
            this.displayBarChart('eventStat')
          }
        </div>
      </div>
    )
  }
  /**
   * Toggle encode dialog on/off
   * @method
   * @returns HTML DOM
   */
  openEncodeDialog = () => {
    const {modalEncodeOpen} = this.state;

    if (modalEncodeOpen) {
      this.setState({
        highlightedText: ''
      });
    }

    this.setState({
      modalEncodeOpen: !modalEncodeOpen
    });

    this.handleCloseMenu();
  }
  /**
   * Get hightlighted text from user
   * @method
   */
  getHighlightedText = () => {
    let highlightedText = '';

    if (window.getSelection) {
      highlightedText = window.getSelection().toString();

      if (highlightedText) {
        this.setState({
          highlightedText
        });
      }
    }
  }
  /**
   * Handle open menu
   * @method
   * @param {object} event - event object
   */
  handleOpenMenu = (event) => {
    event.preventDefault();

    this.setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    });
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      mouseX: null,
      mouseY: null
    });
  }
  /**
   * Display PCAP payload content
   * @method
   * @returns HTML DOM
   */
  displayPayloadcontent = () => {
    const {mouseX, mouseY} = this.state;

    return (
      <div className='payload'>
        <ul>
          <li onMouseUp={this.getHighlightedText} onContextMenu={this.handleOpenMenu}><JSONTree data={this.state.alertPayload} theme={helper.getJsonViewTheme()} /></li>
        </ul>

        <Menu
          keepMounted
          open={Boolean(mouseY !== null)}
          onClose={this.handleCloseMenu}
          anchorReference='anchorPosition'
          anchorPosition={
            mouseY !== null && mouseX !== null
              ? { top: mouseY, left: mouseX }
              : undefined
          }>
          <MenuItem onClick={this.openEncodeDialog}>{t('alert.txt-encodeDecode')}</MenuItem>
        </Menu>
      </div>
    )
  }
  /**
   * Display JSON content
   * @method
   * @returns HTML DOM
   */
  displayJsonData = () => {
    const {alertData} = this.props;
    const {mouseX, mouseY} = this.state;
    const hiddenFields = ['id', '_tableMenu_'];
    const allData = _.omit(alertData, hiddenFields);

    return (
      <div>
        <ul className='json-data alert'>
          <li onMouseUp={this.getHighlightedText} onContextMenu={this.handleOpenMenu}><JSONTree data={allData} theme={helper.getJsonViewTheme()} /></li>
        </ul>

        <Menu
          keepMounted
          open={Boolean(mouseY !== null)}
          onClose={this.handleCloseMenu}
          anchorReference='anchorPosition'
          anchorPosition={
            mouseY !== null && mouseX !== null
              ? { top: mouseY, left: mouseX }
              : undefined
          }>
          <MenuItem onClick={this.openEncodeDialog}>{t('alert.txt-encodeDecode')}</MenuItem>
        </Menu>
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
    let validDataCount = 0;

    if (alertInfo[ipType]['location'][item]) {
      if (item === 'CountryCode') { //Display country flag
        const countryCode = alertInfo[ipType]['location'][item].toLowerCase();
        const picPath = `${contextRoot}/images/flag/${countryCode}.png`;

        if (countryCode && countryCode != '-') {
          validDataCount++;

          return (
            <li key={item + i}>
              <span className='key' style={{width: this.getListWidth()}}>{t('payloadsFields.' + item)}</span>
              <span className='value'><img src={picPath} title={alertInfo[ipType]['location']['Country']} /></span>
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
    const picPath = alertInfo[ipType].ownerPic ? alertInfo[ipType].ownerPic : contextRoot + '/images/empty_profile.png';

    return (
      <PrivateDetails
        alertInfo={alertInfo[ipType]}
        topoInfo={alertInfo[ipType].topology}
        picPath={picPath}
        triggerTask={this.triggerTask} />
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

    if (!alertInfo[ipType].locationType) {
      return <span>{NOT_AVAILABLE}</span>;
    }

    if (alertInfo[ipType].locationType === 1) { //Public
      let locationEmpty = true;

      _.forEach(alertInfo[ipType].location, val => { //Check if location data is available
        if (val) {
          locationEmpty = false;
          return false;
        }
      })

      if (locationEmpty) {
        return <span>{NOT_AVAILABLE}</span>;
      }

      return (
        <div>
          {ipType === 'srcIp' &&
            <div className='privateIp-info srcIp-content'>
              {this.getPublicIPcontent(ipType)}
            </div>
          }

          {ipType === 'destIp' &&
            <div className='privateIp-info destIp-content'>
              {this.getPublicIPcontent(ipType)}
            </div>
          }
        </div>
      )
    } else if (alertInfo[ipType].locationType === 2) { //Private
      if (_.isEmpty(alertInfo[ipType].topology)) {
        return <span>{NOT_AVAILABLE}</span>;
      }

      return (
        <div>
          {ipType === 'srcIp' &&
            <div className='privateIp-info srcIp-content'>
              {this.getPrivateInfo(ipType)}
            </div>
          }

          {ipType === 'destIp' &&
            <div className='privateIp-info destIp-content'>
              {this.getPrivateInfo(ipType)}
            </div>
          }
        </div>
      )
    }
  }
  /**
   * Toggle yara rule dialog
   * @method
   * @param {string} [ipType] - 'srcIp' or 'destIp'
   */
  toggleYaraRule = (ipType) => {
    if (ipType) {
      this.setState({
        ipType
      });
    }

    this.setState({
      modalYaraRuleOpen: !this.state.modalYaraRuleOpen
    });
  }
  /**
   * Toggle IR combo selection dialog
   * @method
   * @param {string} [ipType] - 'srcIp' or 'destIp'
   */
  toggleSelectionIR = (ipType) => {
    if (ipType) {
      this.setState({
        ipType
      });
    }

    this.setState({
      modalIRopen: !this.state.modalIRopen
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
   * Handle trigger button for HMD
   * @method
   * @param {array.<string>} type - HMD scan type
   * @param {string} [ipTypeParam] - IP type ('srcIp' or 'destIp')
   * @param {object} [yaraRule] - yara rule data
   */
  triggerTask = (type, ipTypeParam, yaraRule) => {
    const {baseUrl} = this.context;
    const {alertInfo, ipDeviceInfo, ipType} = this.state;
    const ip = this.getIpPortData(ipTypeParam || ipType);
    let requestData = {
      hostId: ipDeviceInfo[ipTypeParam || ipType].ipDeviceUUID,
      cmds: type
    };

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

    if (!ip) {
      return;
    }

    const apiArr = [
      {
        url: `${baseUrl}/api/hmd/retrigger`,
        data: JSON.stringify(requestData),
        type: 'POST',
        contentType: 'text/plain'
      },
      {
        url: `${baseUrl}/api/v2/ipdevice/_search?exactIp=${ip}`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/v2/ipdevice?exactIp=${ip}&page=1&pageSize=5`,
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
        if (data[0]) {
          helper.showPopupMsg(t('txt-requestSent'));

          if (type[0] === 'compareIOC') {
            this.toggleYaraRule();
          }

          if (type[0] === 'ir') {
            this.toggleSelectionIR();
          }
        }

        if (data[1] && data[1].counts === 0) {
          tempAlertInfo[ipTypeParam || ipType].exist = false;

          this.setState({
            alertInfo: tempAlertInfo
          });
        }

        if (data[2] && data[1].counts > 0) {
          tempAlertInfo[ipTypeParam || ipType].exist = true;
          tempIPdeviceInfo[ipTypeParam || ipType] = data[2];

          this.setState({
            alertInfo: tempAlertInfo,
            ipDeviceInfo: tempIPdeviceInfo,
            modalIRopen: false
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
   * Handle trigger button for HMD Malware
   * @method
   * @param {array.<string>} filePath - Malware file path
   * @param {string} taskId - Task ID
   */
  triggerFilesTask = (filePath, taskId) => {
    const {baseUrl} = this.context;
    const {ipDeviceInfo, ipType} = this.state;
    const requestData = {
      hostId: ipDeviceInfo[ipType].ipDeviceUUID,
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
   * @param {string} ipType - 'srcIp' or 'destIp'
   */
  addToWhiteList = (fileMD5, ipType) => {
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
    const {ipDeviceInfo, eventInfo} = this.state;

    if (ipDeviceInfo[ipType].isHmd) {
      return (
        <HMDscanInfo
          page='threats'
          ipType={ipType}
          currentDeviceData={ipDeviceInfo[ipType]}
          eventInfo={eventInfo}
          showAlertData={this.showAlertData}
          toggleYaraRule={this.toggleYaraRule}
          toggleSelectionIR={this.toggleSelectionIR}
          triggerTask={this.triggerTask}
          triggerFilesTask={this.triggerFilesTask}
          addToWhiteList={this.addToWhiteList}
          getHMDinfo={this.getHMDinfo}
          loadEventTracing={this.loadEventTracing} />
      )
    } else {
      return <span>{NOT_AVAILABLE}</span>
    }
  }
  /**
   * Display network behavior content
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   * @returns NetworkBehavior component
   */
  displayNetworkBehaviorContent = (ipType) => {
    return (
      <NetworkBehavior
        ipType={ipType}
        alertData={this.props.alertData}
        getIpPortData={this.getIpPortData} />
    )
  }
  /**
   * Download paylaod file
   * @method
   */
  downloadFile = () => {
    const {baseUrl, contextRoot} = this.context;
    const {alertData} = this.props;
    let requestData = {};

    if (alertData.fileMD5) {
      requestData = {
        md5: alertData.fileMD5
      };
    } else {
      helper.showPopupMsg(t('txt-error'));
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
      alertPayload: ''
    });
  }
  render() {
    const {titleText, actions} = this.props;
    const {showContent, ipDeviceInfo, modalYaraRuleOpen, modalIRopen, modalEncodeOpen, highlightedText} = this.state;
    let ipType = '';

    if (showContent.srcSafety) {
      ipType = 'srcIp';
    } else if (showContent.destSafety) {
      ipType = 'destIp';
    }

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
            checkYaraRule={this.checkYaraRule} />
        }

        {modalIRopen &&
          <IrSelections
            currentDeviceData={ipDeviceInfo[ipType]}
            toggleSelectionIR={this.toggleSelectionIR}
            triggerTask={this.triggerTask} />
        }

        {modalEncodeOpen &&
          <EncodeDecode
            highlightedText={highlightedText}
            openEncodeDialog={this.openEncodeDialog} />
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
  currentPage: PropTypes.number,
  pageSize: PropTypes.number,
  totalPageCount: PropTypes.number,
  fromPage: PropTypes.string.isRequired
};

export default AlertDetails;