import React, {Component} from 'react'
import { withRouter } from 'react-router'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import {downloadWithForm} from 'react-ui/build/src/utils/download'
import Gis from 'react-gis/build/src/components'

import MultiInput from 'react-ui/build/src/components/multi-input'

import {BaseDataContext} from '../common/context';
import helper from '../common/helper'
import HMDsettings from './hmd-settings'
import HostAnalysis from './host-analysis'
import HostFilter from './host-filter'
import Pagination from '../common/pagination'
import SafetyDetails from './safety-details'
import SearchOptions from '../common/search-options'
import YaraRule from '../common/yara-rule'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};
const SCAN_RESULT = [
  {
    name: 'Yara Scan',
    result: 'yaraResult'
  },
  {
    name: 'Malware',
    result: 'scanFileResult'
  },
  {
    name: 'GCB',
    result: 'gcbResult',
    pass: 'PassCnt'
  },
  {
    name: 'File Integrity',
    result: 'fileIntegrityResult'
  },
  {
    name: 'Event Tracing',
    result: 'eventTracingResult'
  },
  {
    name: 'Process Monitor',
    result: 'procMonitorResult'
  },
  {
    name: 'VANS',
    result: '_VansResult'
  },
];
const HMD_STATUS_LIST = ['isNotHmd', 'isLatestVersion', 'isOldVersion', 'isOwnerNull', 'isAreaNull', 'isSeatNull'];
const HMD_TRIGGER = [
  {
    name: 'Yara Scan',
    cmds: 'compareIOC'
  },
  {
    name: 'Malware',
    cmds: 'scanFile'
  },
  {
    name: 'GCB',
    cmds: 'gcbDetection'
  },
  {
    name: 'File Integrity',
    cmds: 'getFileIntegrity'
  },
  {
    name: 'Process Monitor',
    cmds: 'setProcessWhiteList'
  },
  {
    name: 'VANS',
    cmds: 'getVans'
  }
];
const HMD_LIST = [
  {
    name: 'Yara Scan',
    value: 'isScanProc'
  },
  {
    name: 'Malware',
    value: 'isScanFile'
  },
  {
    name: 'GCB',
    value: 'isGCB'
  },
  {
    name: 'IR',
    value: 'isIR'
  },
  {
    name: 'File Integrity',
    value: 'isFileIntegrity'
  },
  {
    name: 'Event Tracing',
    value: 'isEventTracing'
  },
  {
    name: 'Process Monitor',
    value: 'isProcessMonitor'
  },
  {
    name: 'VANS',
    value: 'isVans'
  }
];
const HOST_SORT_LIST = [
  {
    name: 'ip',
    sort: 'asc'
  },
  {
    name: 'ip',
    sort: 'desc'
  },
  {
    name: 'mac',
    sort: 'asc'
  },
  {
    name: 'mac',
    sort: 'desc'
  },
  {
    name: 'hostName',
    sort: 'asc'
  },
  {
    name: 'hostName',
    sort: 'desc'
  },
  {
    name: 'system',
    sort: 'asc'
  },
  {
    name: 'system',
    sort: 'desc'
  }
];
const SAFETY_SCAN_LIST = [
  {
    name: 'Malware',
    value: 'scanFile'
  },
  {
    name: 'GCB',
    value: 'gcbDetection'
  },
  {
    name: 'File Integrity',
    value: 'getFileIntegrity'
  },
  {
    name: 'Event Tracing',
    value: 'getEventTracing'
  },
  {
    name: 'Process Monitor',
    value: 'getProcessMonitorResult'
  },
  {
    name: 'VANS - CPE',
    value: 'getVansCpe'
  },
  {
    name: 'VANS - CVE',
    value: 'getVansCve'
  }
];
const MAPS_PRIVATE_DATA = {
  floorList: [],
  currentFloor: '',
  floorPlan: {
    treeData: {},
    currentAreaUUID: '',
    currentAreaName: ''
  },
  currentMap: '',
  currentBaseLayers: {},
  seatData: {}
};

let t = null;
let f = null;

/**
 * Host
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to handle the business logic for the threats page
 */
class HostController extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      activeTab: 'hostList', //'hostList', 'deviceMap' or 'safetyScan'
      activeContent: 'hostContent', //'hostContent' or 'hmdSettings'
      showFilter: true,
      showLeftNav: true,
      datetime: moment().local().format('YYYY-MM-DD') + 'T00:00:00',
      assessmentDatetime: {
        from: '',
        to: ''
      },
      yaraRuleOpen: false,
      hostAnalysisOpen: false,
      safetyDetailsOpen: false,
      contextAnchor: null,
      menuType: '', //hmdTriggerAll' or 'hmdDownload
      severityList: [],
      hmdStatusList: [],
      scanStatusList: [],
      privateMaskedIP: {},
      hostCreateTime: '',
      leftNavData: [],
      privateIpData: {},
      filterNav: {
        severitySelected: [],
        hmdStatusSelected: [],
        scanStatusSelected: [],
        maskedIPSelected: []
      },
      filterData: [{
        name: 'ip',
        query: ''
      }],
      deviceSearch: {
        ip: '',
        mac: '',
        hostName: '',
        deviceType: '',
        system: ''
      },
      subTabMenu: {
        table: t('host.txt-hostList'),
        statistics: t('host.txt-deviceMap')
      },
      hostInfo: {
        dataContent: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      hostData: {},
      hostSort: 'ip-asc',
      safetyScanData: {
        dataContent: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      currentSafetyData: {},
      safetyScanType: 'scanFile',
      eventInfo: {
        dataFieldsArr: ['@timestamp', '_EventCode', 'message'],
        dataFields: {},
        dataContent: [],
        scrollCount: 1,
        hasMore: false
      },
      openHmdType: '',
      ..._.cloneDeep(MAPS_PRIVATE_DATA)
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'common', locale);

    this.setLeftNavData();
    this.getFloorPlan();
    this.getHostData();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state === 'hostContent') {
      this.toggleContent('hostContent');
    }
  }
  /**
   * Set Left nav data
   * @method
   */
  setLeftNavData = () => {
    const leftNavData = [
      {
        list: 'severityList',
        text: t('alert.txt-threatLevel'),
        selected: 'severitySelected'
      },
      {
        list: 'hmdStatusList',
        text: 'HMD ' + t('txt-status'),
        selected: 'hmdStatusSelected'
      },
      {
        list: 'scanStatusList',
        text: 'Scan ' + t('txt-status'),
        selected: 'scanStatusSelected'
      }
    ];

    this.setState({
      leftNavData
    });
  }
  /**
   * Get and set host sort list
   * @method
   */
  getHostSortList = () => {
    const hostSortList = _.map(HOST_SORT_LIST, (val, i) => {
      return <MenuItem key={i} value={val.name + '-' + val.sort}>{t('ipFields.' + val.name) + ' - ' + t('txt-' + val.sort)}</MenuItem>
    });
    return hostSortList;
  }
  /**
   * Get and set floor plan data
   * @method
   */
  getFloorPlan = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/area/_tree`,
      type: 'GET'
    })
    .then(data => {
      if (data && data.length > 0) {
        const floorPlanData = data[0];
        const floorPlan = {
          treeData: data,
          currentAreaUUID: floorPlanData.areaUUID,
          currentAreaName: floorPlanData.areaName
        };

        this.setState({
          floorPlan
        }, () => {
          this.getFloorList();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set floor list data
   * @method
   */
  getFloorList = () => {
    const {floorPlan} = this.state;
    let floorList = [];
    let floorListArr = [];

    _.forEach(floorPlan.treeData, val => {
      helper.floorPlanRecursive(val, obj => {
        floorList.push(
          <MenuItem key={obj.areaUUID} value={obj.areaUUID}>{obj.areaName}</MenuItem>
        );

        floorListArr.push({
          value: obj.areaUUID
        });
      });
    })

    const currentFloor = floorListArr[0].value; //Default to the top parent floor

    this.setState({
      floorList,
      currentFloor
    }, () => {
      this.getAreaData(currentFloor);
    });
  }
  /**
   * Get and set area related data
   * @method
   * @param {string | object} event - event object
   */
  getAreaData = (event) => {
    const {baseUrl, contextRoot} = this.context;
    const {alertDetails} = this.state;
    const floorPlan = event.target ? event.target.value : event;

    if (!floorPlan) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/area?uuid=${floorPlan}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const areaName = data.areaName;
        const areaUUID = data.areaUUID;
        let currentMap = '';

        if (data.picPath) {
          const picPath = `${baseUrl}${contextRoot}/api/area/_image?path=${data.picPath}`;
          const picWidth = data.picWidth;
          const picHeight = data.picHeight;

          currentMap = {
            label: areaName,
            images: [
              {
                id: areaUUID,
                url: picPath,
                size: {width: picWidth, height: picHeight}
              }
            ]
          };
        }

        const currentBaseLayers = {
          [floorPlan]: currentMap
        };

        this.setState({
          currentMap,
          currentBaseLayers,
          currentFloor: areaUUID
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get formatted datetime
   * @method
   * @returns formatted datetime object
   */
  getHostDateTime = () => {
    return {
      from: moment(this.state.datetime).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(helper.getAdditionDate(1, 'day', this.state.datetime)).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
  }
  /**
   * Get and set host info data
   * @method
   * @param {string} options - options for CSV and PDF export
   */
  getHostData = (options) => {
    const {baseUrl} = this.context;
    const {activeTab, filterNav, deviceSearch, assessmentDatetime, hostInfo, hostSort, currentFloor} = this.state;
    const hostSortArr = hostSort.split('-');
    const datetime = this.getHostDateTime();
    let url = `${baseUrl}/api/ipdevice/assessment/_search`;

    if (activeTab === 'hostList') {
      url += `?page=${hostInfo.currentPage}&pageSize=${hostInfo.pageSize}&orders=${hostSortArr[0]} ${hostSortArr[1]}`;
    }

    let requestData = {
      timestamp: [datetime.from, datetime.to],
      ...this.getHostRequestData()
    };

    if (options === 'csv' || options === 'pdf') { //For CSV or PDF export
      requestData.timestamp = [assessmentDatetime.from, assessmentDatetime.to];
      return requestData;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let severityList = [];
        let hmdStatusList = [];
        let scanStatusList = [];
        let tempHostInfo = {...hostInfo};
        tempHostInfo.dataContent = data.rows;
        tempHostInfo.totalCount = data.count;

        if (!_.isEmpty(data.subnetAgg)) {
          this.setState({
            privateIpData: data.subnetAgg
          }, () => {
            this.getPrivateTreeData();
          });
        }

        if (!data.rows || data.rows.length === 0) {
          if (activeTab === 'hostList') {
            helper.showPopupMsg(t('txt-notFound'));
          }
          return;
        }

        _.forEach(SEVERITY_TYPE, val => { //Create formattedSeverityType object for input data based on severity
          _.forEach(data.severityAgg, (val2, key) => {
            if (val === key) {
              severityList.push({
                value: val,
                text: <span><i className={'fg fg-recode ' + val.toLowerCase()}></i>{val + ' (' + helper.numberWithCommas(val2) + ')'}</span>
              });
            }
          })
        })

        _.forEach(HMD_STATUS_LIST, val => {
          hmdStatusList.push({
            text: t('host.txt-' + val) + ' (' + helper.numberWithCommas(data.devInfoAgg[val]) + ')',
            value: val
          });
        })

        hmdStatusList.push({
          text: t('txt-connected'),
          value: 'isConnected'
        });

        _.forEach(HMD_LIST, val => {
          scanStatusList.push({
            text: val.name + ' (' + data.scanInfoAgg[val.value] + ')',
            value: val.value
          });
        });

        this.setState({
          assessmentDatetime: {
            from: data.assessmentStartDttm,
            to: data.assessmentEndDttm
          },
          severityList,
          hmdStatusList,
          scanStatusList,
          hostCreateTime: helper.getFormattedDate(data.assessmentCreateDttm, 'local'),
          hostInfo: tempHostInfo
        }, () => {
          if (activeTab === 'deviceMap' && data.rows.length > 0) {
            this.getSeatData();
          }
        });

        if (activeTab === 'hostList' && data.count === 0) {
          helper.showPopupMsg(t('txt-notFound'));
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get Host and Safety Scan request data
   * @method
   */
  getHostRequestData = () => {
    const {filterNav, deviceSearch} = this.state;
    let requestData = {};

    if (filterNav.severitySelected.length > 0) {
      requestData.severityLevel = filterNav.severitySelected;
    }

    if (filterNav.hmdStatusSelected.length > 0) {
      requestData.devInfo = filterNav.hmdStatusSelected;
    }

    if (filterNav.scanStatusSelected.length > 0) {
      requestData.scanInfo = filterNav.scanStatusSelected;
    }

    if (filterNav.maskedIPSelected.length > 0) {
      requestData.exactIps = filterNav.maskedIPSelected;
    }

    if (deviceSearch.ip) {
      requestData.ip = deviceSearch.ip;
    }

    if (deviceSearch.mac) {
      requestData.mac = deviceSearch.mac;
    }

    if (deviceSearch.hostName) {
      requestData.hostName = deviceSearch.hostName;
    }

    if (deviceSearch.deviceType) {
      requestData.deviceType = deviceSearch.deviceType;
    }

    if (deviceSearch.system) {
      requestData.system = deviceSearch.system;
    }

    return requestData;
  }
  /**
   * Get and set safety scan data
   * @method
   */
  getSafetyScanData = () => {
    const {baseUrl} = this.context;
    const {safetyScanData, safetyScanType} = this.state;
    const datetime = this.getHostDateTime();
    const url = `${baseUrl}/api/hmd/hmdScanDistribution/_search?page=${safetyScanData.currentPage}&pageSize=${safetyScanData.pageSize}`;
    let requestData = {
      timestamp: [datetime.from, datetime.to],
      ...this.getHostRequestData()
    };

    if (safetyScanType === 'getVansCpe') {
      requestData.hmdScanDistribution = {
        taskName: 'getVans',
        primaryKeyName: 'cpe23Uri'
      };
    } else if (safetyScanType === 'getVansCve') {
      requestData.hmdScanDistribution = {
        taskName: 'getVans',
        primaryKeyName: 'cveId'
      };
    } else {
      requestData.hmdScanDistribution = {
        taskName: safetyScanType
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
        let tempSafetyScanData = {...safetyScanData};
        tempSafetyScanData.dataContent = data.hmdScanDistribution;
        tempSafetyScanData.totalCount = data.count;

        this.setState({
          safetyScanData: tempSafetyScanData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Check if item is already in the selected list
   * @method
   * @param {string} type - checked item type ('severitySelected', 'hmdStatusSelected', 'scanStatusSelected')
   * @param {string} val - checked item name
   * @returns boolean true/false
   */
  checkSelectedItem = (type, val) => {
    return _.includes(this.state.filterNav[type], val);
  }
  /**
   * Handle checkbox check/uncheck
   * @method
   * @param {string} type - checked item type ('severitySelected', 'hmdStatusSelected', 'scanStatusSelected')
   * @param {object} event - event object
   */
  toggleCheckbox = (type, event) => {
    let tempFilterNav = {...this.state.filterNav};

    if (event.target.checked) {
      tempFilterNav[type].push(event.target.name);
    } else {
      const index = tempFilterNav[type].indexOf(event.target.name);
      tempFilterNav[type].splice(index, 1);
    }

    this.setState({
      activeContent: 'hostContent',
      filterNav: tempFilterNav
    }, () => {
      this.handleSearchSubmit();
    });
  }
  /**
   * Display checkbox for left nav
   * @method
   * @param {string} type - filter type ('severitySelected', 'hmdStatusSelected', 'scanStatusSelected')
   * @param {object} val - individual filter data
   * @param {number} i - index of the filter data
   * @returns HTML DOM
   */
  getCheckboxItem = (type, val, i) => {
    return (
      <FormControlLabel
        key={i}
        label={val.text}
        control={
          <Checkbox
            className='checkbox-ui nav-box'
            name={val.value}
            checked={this.checkSelectedItem(type, val.value)}
            onChange={this.toggleCheckbox.bind(this, type)}
            color='primary' />
        } />
    )
  }
  /**
   * Display Left nav data
   * @method
   * @param {object} val - individual left nav data
   * @param {number} i - index of the left nav data
   * @returns HTML DOM
   */
  showLeftNavItems = (val, i) => {
    return (
      <div key={i}>
        <label className={cx('header-text', {'hide': !this.state.showLeftNav})}>{val.text}</label>
        <div className='checkbox-group'>
          {this.state[val.list].map(this.getCheckboxItem.bind(this, val.selected))}
        </div>
      </div>
    )
  }
  /**
   * Get and set set data
   * @method
   */
  getSeatData = () => {
    const {contextRoot} = this.context;
    const {hostInfo, currentFloor} = this.state;
    const seatData = {};
    let seatListArr = [];

    _.forEach(hostInfo.dataContent, val => {
      if (val.seatObj) {
        seatListArr.push({
          id: val.seatObj.seatUUID,
          type: 'marker',
          xy: [val.seatObj.coordX, val.seatObj.coordY],
          icon: {
            iconUrl: `${contextRoot}/images/ic_person.png`,
            iconSize: [25, 25],
            iconAnchor: [12.5, 12.5]
          },
          label: val.seatObj.seatName,
          data: {
            name: val.seatObj.seatName
          }
        });
      }
    })

    seatData[currentFloor] = {
      data: seatListArr
    };

    this.setState({
      seatData
    });
  }
  /**
   * Handle seat selection for floor map
   * @method
   * @param {string} seatUUID - selected seat UUID
   */
  handleFloorMapClick = (seatUUID) => {
    const activeHostInfo = _.find(this.state.hostInfo.dataContent, {seatUUID});

    if (!_.isEmpty(activeHostInfo)) {
      this.getIPdeviceInfo(activeHostInfo, 'toggle');
    }
  }
  /**
   * Handle private IP checkbox check/uncheck
   * @method
   * @param {string} ip - selected IP
   * @param {string} type - IP type ('ip' or 'masked')
   * @param {object} event - event object
   */
  togglePrivateIpCheckbox = (ip, type, event) => {
    const {filterNav, privateIpData} = this.state;
    let tempFilterNav = {...filterNav};
    let selectedPrivateIP = [];

    if (type === 'masked') {
      const maskedChildList = _.map(privateIpData[ip].buckets, val => {
        return val.ip;
      });

      if (event.target.checked) {
        selectedPrivateIP = _.concat(filterNav.maskedIPSelected, ...maskedChildList);
      } else {
        selectedPrivateIP = _.without(filterNav.maskedIPSelected, ...maskedChildList);
      }
    } else if (type === 'ip') {
      if (event.target.checked) {
        selectedPrivateIP = _.concat(filterNav.maskedIPSelected, ip);
      } else {
        selectedPrivateIP = _.without(filterNav.maskedIPSelected, ip);
      }
    }

    tempFilterNav.maskedIPSelected = selectedPrivateIP;

    this.setState({
      activeContent: 'hostContent',
      filterNav: tempFilterNav
    }, () => {
      this.handleSearchSubmit();
    });
  }
  /**
   * Set the alert private tree data
   * @method
   * @returns tree data object
   */
  getPrivateTreeData = () => {
    const {privateIpData} = this.state;

    let treeObj = { //Handle service tree data
      id: 'All',
      children: []
    };

    _.keys(privateIpData)
    .forEach(key => {
      let tempChild = [];
      let treeProperty = {};

      if (key && key !== 'doc_count') {
        if (privateIpData[key].buckets.length > 0) {
          _.forEach(privateIpData[key].buckets, val => {
            if (val.ip) {
              let nodeClass = '';

              if (val._severity_) {
                nodeClass = 'fg fg-recode ' + val._severity_.toLowerCase();
              }

              tempChild.push({
                id: val.ip,
                label: <span><Checkbox checked={this.checkSelectedItem('maskedIPSelected', val.ip)} onChange={this.togglePrivateIpCheckbox.bind(this, val.ip, 'ip')} color='primary' /><i className={nodeClass} />{val.ip}</span>
              });
            }
          })
        }

        let nodeClass = '';

        if (privateIpData[key]._severity_) {
          nodeClass = 'fg fg-recode ' + privateIpData[key]._severity_.toLowerCase();
        }

        treeProperty = {
          id: key,
          label: <span><Checkbox onChange={this.togglePrivateIpCheckbox.bind(this, key, 'masked')} color='primary' /><i className={nodeClass} />{key} ({helper.numberWithCommas(privateIpData[key].doc_count)})</span>
        };

        if (tempChild.length > 0) {
          treeProperty.children = tempChild;
        }

        treeObj.children.push(treeProperty);
      }
    })

    treeObj.label = t('txt-all') + ' (' + helper.numberWithCommas(privateIpData.doc_count) + ')';

    this.setState({
      privateMaskedIPtree: treeObj
    });
  }
  /**
   * Toggle (show/hide) the left menu
   * @method
   */
  toggleLeftNav = () => {
    this.setState({
      showLeftNav: !this.state.showLeftNav
    });
  }
  /**
   * Toggle filter content on/off
   * @method
   */
  toggleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter
    });
  }
  /**
   * Set new datetime
   * @method
   * @param {object} newDatetime - new datetime object
   */
  handleDateChange = (newDatetime) => {
    this.setState({
      datetime: newDatetime
    });
  }
  /**
   * Handle Host sort change
   * @method
   * @param {object} event - event object
   */
  handleHostSortChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    }, () => {
      this.getHostData();
    });
  }
  /**
   * Handle filter search submit
   * @method
   */
  handleSearchSubmit = () => {
    let tempHostInfo = {...this.state.hostInfo};
    tempHostInfo.dataContent = [];
    tempHostInfo.totalCount = 0;
    tempHostInfo.currentPage = 1;

    this.setState({
      hostInfo: tempHostInfo
    }, () => {
      this.getHostData();
    });
  }
  /**
   * Handle content tab change
   * @method
   * @param {object} event - event object
   * @param {string} newTab - content type ('hostList', 'deviceMap' or 'safetyScan')
   */
  handleSubTabChange = (event, newTab) => {
    this.setState({
      activeTab: newTab
    }, () => {
      if (newTab === 'safetyScan') {
        this.getSafetyScanData();
      } else {
        this.getHostData();
      }
    });
  }
  /**
   * Handle filter input value change
   * @method
   * @param {object} event - event object
   */
  handleDeviceSearch = (event) => {
    let tempDeviceSearch = {...this.state.deviceSearch};
    tempDeviceSearch[event.target.name] = event.target.value.trim();

    this.setState({
      deviceSearch: tempDeviceSearch
    });
  }
  /**
   * Set filter data
   * @method
   * @param {array.<object>} filterData - filter data to be set
   */
  setFilterData = (filterData) => {
    this.setState({
      filterData
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, filterData, deviceSearch} = this.state;
    const defaultValue = {
      name: 'ip',
      query: ''
    };
    let data = {};

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section'>
          <MultiInput
            className='filter-warp'
            base={HostFilter}
            inline={true}
            props={data}
            defaultItemValue={defaultValue}
            value={filterData}
            onChange={this.setFilterData} />
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.handleSearchSubmit}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    const filterData = [{
      name: 'ip',
      query: ''
    }];

    this.setState({
      filterData,
      deviceSearch: {
        ip: '',
        mac: '',
        hostName: '',
        deviceType: '',
        system: ''
      }
    });
  }
  /**
   * Display Safety Scan list
   * @method
   * @param {object} safetyScanInfo - Safety Scan data
   * @param {object} host - all Safety Scan data
   * @param {object} val - individual Safety Scan data
   * @param {number} i - index of the Safety Scan data
   * @returns HTML DOM
   */
  getSafetyScanInfo = (safetyScanInfo, host, val, i) => {
    const safetyData = safetyScanInfo[val.result];
    let displayCount = '';
    let displayTooltip = val.name + ' ';
    let color = '';
    let border = '';
    let title = '';
    let displayContent = '';

    if (safetyData && safetyData.length > 0) {
      if (val.result !== 'eventTracingResult' && !safetyData[0].taskStatus) {
        return;
      }

      if (safetyData[0].taskStatus === 'Failure') {
        color = '#e15b6b';
        title = displayTooltip += t('hmd-scan.txt-taskFailure');
        displayContent = t('hmd-scan.txt-taskFailure');
      } else if (safetyData[0].taskStatus === 'NotSupport') {
        color = '#e15b6b';
        title = displayTooltip += t('hmd-scan.txt-notSupport');
        displayContent = t('hmd-scan.txt-notSupport');
      } else {
        if (val.result === 'eventTracingResult' && safetyData[0].TotalCnt >= 0) {
          displayCount = helper.numberWithCommas(safetyData[0].TotalCnt);
          displayTooltip += t('hmd-scan.txt-eventsLogCount');
          color = '#e15b6b';
        }
        if (safetyData[0].taskStatus === 'Complete') {
          if (val.name === 'GCB') {
            displayCount = helper.numberWithCommas(safetyData[0][val.pass]) + '/' + helper.numberWithCommas(safetyData[0].TotalCnt);
            displayTooltip += t('hmd-scan.txt-passCount') + '/' + t('hmd-scan.txt-totalItem');
            color = safetyData[0][val.pass] === safetyData[0].TotalCnt ? '#70c97e' : '#e15b6b';
          } else {
            let text = t('hmd-scan.txt-suspiciousFileCount');

            if (val.name === 'File Integrity') {
              text = t('hmd-scan.txt-modifiedFileCount');
            } else if (val.name === 'VANS') {
              text = t('hmd-scan.txt-VulnerabilityCount');
            }

            displayCount = helper.numberWithCommas(safetyData[0].TotalCnt);
            displayTooltip += text;
            color = safetyData[0].TotalCnt === 0 ? '#70c97e' : '#e15b6b';
          }
        }

        title = displayTooltip + ': ' + displayCount;
        displayContent = displayCount;
      }

      return <span key={i} className='c-link' style={{color, border: '1px solid ' + color, fontWeight: 'bold'}} title={title} onClick={this.getIPdeviceInfo.bind(this, host, 'toggle', val.result)}>{val.name} {displayContent}</span>
    }
  }
  /**
   * Display Host info list
   * @method
   * @param {object} dataInfo - Host data
   * @param {object} val - individual Host data
   * @param {number} i - index of the Host data
   * @returns HTML DOM
   */
  getInfoList = (dataInfo, val, i) => {
    if (dataInfo[val.path]) {
      let context = <i className={`fg fg-${val.icon}`}></i>;
      let content = dataInfo[val.path];

      if (val.name === 'mac') {
        context = <div className={`fg-bg ${val.path}`}></div>;
      } else if (val.name === 'system') {
        const system = dataInfo[val.path].toLowerCase();
        let os = 'windows';

        if (system.indexOf('linux') > -1) {
          os = 'linux';
        } else if (system.indexOf('windows') > -1) {
          os = 'windows';
        }

        context = <div className={`fg-bg ${os}`}></div>;
      } else if (val.name === 'version') {
        context = <div className='fg-bg hmd'></div>;
        content = 'HMD v.' + content;
      }

      return <li key={i} title={t('ipFields.' + val.name)}>{context}<span>{content}</span></li>
    }
  }
  /**
   * Get Event Tracing request data
   * @method
   * @param {string} ipDeviceUUID - IP Device UUID
   */
  getRequestData = (ipDeviceUUID) => {
    const {assessmentDatetime} = this.state;
    const requestData = {
      '@timestamp': [assessmentDatetime.from, assessmentDatetime.to],
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
   * Get IP device data info
   * @method
   * @param {object} host - active Host data
   * @param {string} options - options for 'toggle'
   * @param {string} [defaultOpen] - HMD type
   */
  getIPdeviceInfo = (host, options, defaultOpen) => {
    const {baseUrl} = this.context;
    const {assessmentDatetime, hostInfo, hostData} = this.state;
    const ipDeviceUUID = host ? host.ipDeviceUUID : hostData.ipDeviceUUID;

    this.ah.all([
      {
        url: `${baseUrl}/api/v2/ipdevice?uuid=${ipDeviceUUID}&page=1&pageSize=5&startDttm=${assessmentDatetime.from}&endDttm=${assessmentDatetime.to}`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/u1/log/event/_search?page=1&pageSize=20`,
        data: JSON.stringify(this.getRequestData(ipDeviceUUID)),
        type: 'POST',
        contentType: 'text/plain'
      }
    ])
    .then(data => {
      if (data) {
        if (data[0]) {
          const activeHostInfo = _.find(hostInfo.dataContent, {ipDeviceUUID});
          let hostData = {...data[0]};

          if (activeHostInfo.networkBehaviorInfo) {
            hostData.severityLevel = activeHostInfo.networkBehaviorInfo.severityLevel;
          }

          if (!hostData.safetyScanInfo) {
            hostData.safetyScanInfo = {};
          }

          this.setState({
            hostData
          }, () => {
            if (options === 'toggle') {
              if (defaultOpen && typeof defaultOpen === 'string') {
                this.setState({
                  openHmdType: defaultOpen
                }, () => {
                  this.toggleHostAnalysis();
                });
              } else {
                this.setState({
                  openHmdType: ''
                }, () => {
                  this.toggleHostAnalysis();
                });
              }
            } else {
              this.setState({
                openHmdType: ''
              });
            }
          });
        }

        if (data[1]) {
          this.setEventTracingData(data[1]);
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
   * @param {number} [page] - page number
   * @param {string} [ipDeviceUUID] - ipDeviceUUID
   */
  loadEventTracing = (page, ipDeviceUUID) => {
    const {baseUrl} = this.context;
    const {hostData, eventInfo} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/u1/log/event/_search?page=${page || eventInfo.scrollCount}&pageSize=20`,
      data: JSON.stringify(this.getRequestData(ipDeviceUUID || hostData.ipDeviceUUID)),
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
   * Toggle Host Analysis dialog on/off
   * @method
   */
  toggleHostAnalysis = () => {
    this.setState({
      hostAnalysisOpen: !this.state.hostAnalysisOpen,
      eventInfo: {
        dataFieldsArr: ['@timestamp', '_EventCode', 'message'],
        dataFields: {},
        dataContent: [],
        scrollCount: 1,
        hasMore: false
      }
    });
  }
  /**
   * Redirect to Threats page
   * @method
   * @param {string} ip - Source IP for the Host
   */
  redirectNewPage = (ip) => {
    const {baseUrl, contextRoot, language} = this.context;
    const {datetime, hostCreateTime} = this.state;
    const selectedDate = moment(datetime).format('YYYY-MM-DD');
    const currentDate = moment().local().format('YYYY-MM-DD');
    let dateTime = {
      from: '',
      to: ''
    };

    if (moment(selectedDate).isBefore(currentDate)) {
      dateTime.from = selectedDate + ' 00:00:00';
      dateTime.to = selectedDate + ' 23:59:59';
    } else {
      dateTime.from = currentDate + ' 00:00:00';
      dateTime.to = hostCreateTime;
    }

    const ipParam = `&sourceIP=${ip}&page=host`;
    const linkUrl = `${baseUrl}${contextRoot}/threats?from=${dateTime.from}&to=${dateTime.to}${ipParam}&lng=${language}`;

    window.open(linkUrl, '_blank');
  }
  /**
   * Display individual severity
   * @method
   * @param {object} host - all Safety Scan data
   * @param {object} val - Severity list
   * @param {number} i - index of the severity list
   * @returns HTML DOM
   */
  displaySeverityItem = (host, val, i) => {
    const color = val.doc_count === 0 ? '#333' : '#fff';
    const backgroundColor = val.doc_count === 0 ? '#d9d9d9' : ALERT_LEVEL_COLORS[val.key];

    return <span key={i} className='c-link' style={{color, backgroundColor}} onClick={this.redirectNewPage.bind(this, host.ip)}>{val.key}: {val.doc_count}</span>
  }
  /**
   * Display Host content
   * @method
   * @param {object} val - Host data
   * @param {number} i - index of the Host data
   * @returns HTML DOM
   */
  getHostList = (val, i) => {
    const {contextRoot} = this.context;
    const infoList = [
      {
        name: 'hostName',
        path: 'hostName',
        icon: 'box'
      },
      {
        name: 'mac',
        path: 'mac'
      },
      {
        name: 'system',
        path: 'system'
      },
      {
        name: 'owner',
        path: 'ownerObj.ownerName',
        icon: 'fg-user'
      },
      {
        name: 'floorName',
        path: 'areaObj.areaFullName',
        icon: 'map'
      },
      {
        name: 'version',
        path: 'version',
        icon: 'report'
      },
      {
        name: 'remarks',
        path: 'remarks',
        icon: 'edit'
      }
    ];
    let safetyScanInfo = '';
    let safetyData = false;
    let severityList = [];

    if (val.safetyScanInfo) {
      safetyScanInfo = val.safetyScanInfo;

      _.forEach(SCAN_RESULT, val => { //Check if safety scan data is available
        if (safetyScanInfo[val.result] && safetyScanInfo[val.result].length > 0) {
          if (safetyScanInfo[val.result][0].TotalCnt > 0) {
            safetyData = true;
            return false;
          }
        }
      })
    }

    if (val.networkBehaviorInfo) {
      _.forEach(SEVERITY_TYPE, val2 => { //Create formatted severity array based on severity
        _.forEach(val.networkBehaviorInfo.severityAgg.buckets, (val3, key) => {
          if (val3.key === val2) {
            severityList.push({
              doc_count: helper.numberWithCommas(val3.doc_count),
              key: val3.key
            });
          }
        })
      })
    }

    let iconType = '';
    let title = '';

    if (val.isConnected === true) {
      iconType = 'icon_connected_on';
      title = t('txt-online');
    } else if (val.isConnected === false) {
      iconType = 'icon_connected_off';
      title = t('txt-offline');
    }

    return (
      <li key={i}>
        <div className='device-alert' style={{backgroundColor: ALERT_LEVEL_COLORS[val.severityLevel] || '#999'}}>
          <i className='fg fg-host'></i>
        </div>
        <div className='info'>
          <ul className='c-link' onClick={this.getIPdeviceInfo.bind(this, val, 'toggle')}>
            <li className='first' title={t('ipFields.ip')}>
              {iconType === '' &&
                <div className='fg-bg ip'></div>
              }
              {iconType !== '' &&
                <img src={contextRoot + `/images/${iconType}.png`} className='connections-status' title={title} />
              }
              <span>{val.ip}</span>
            </li>
            {infoList.map(this.getInfoList.bind(this, val))}
          </ul>

          <div className='flex-item'>
            {severityList.length > 0 &&
              severityList.map(this.displaySeverityItem.bind(this, val))
            }
            {safetyData &&
              SCAN_RESULT.map(this.getSafetyScanInfo.bind(this, safetyScanInfo, val))
            }
          </div>
        </div>
        <div className='view-details' onClick={this.getIPdeviceInfo.bind(this, val, 'toggle')}>
          {t('host.txt-viewInfo')}
        </div>
      </li>
    )
  }
  /**
   * Handle Host data pagination change
   * @method
   * @param {string} contentType - content type ('hostInfo' or 'safetyScanData')
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (contentType, type, value) => {
    const {hostInfo, safetyScanData} = this.state;

    if (contentType === 'hostInfo') {
      let tempHostInfo = {...hostInfo};
      tempHostInfo[type] = Number(value);

      if (type === 'pageSize') {
        tempHostInfo.currentPage = 1;
      }

      this.setState({
        hostInfo: tempHostInfo
      }, () => {
        this.getHostData();
      });
    } else if (contentType === 'safetyScanData') {
      let tempSafetyScanData = {...safetyScanData};
      tempSafetyScanData[type] = Number(value);

      if (type === 'pageSize') {
        tempSafetyScanData.currentPage = 1;
      }

      this.setState({
        safetyScanData: tempSafetyScanData
      }, () => {
        this.getSafetyScanData();
      });
    }
  }
  /**
   * Toggle safety details dialog and set safety data
   * @method
   * @param {object} safetyData - active safety scan data
   */
  toggleSafetyDetails = (safetyData) => {
    if (!_.isEmpty(safetyData)) {
      this.setState({
        currentSafetyData: safetyData
      });
    }

    this.setState({
      safetyDetailsOpen: !this.state.safetyDetailsOpen
    });
  }
  /**
   * Display secondary info for safety scan table
   * @method
   * @param {object} safetyData - active safety scan data
   */
  getSecondaryContent = (safetyData) => {
    const {locale} = this.context;
    const {safetyScanType} = this.state;

    if (safetyScanType === 'scanFile') {
      return (
        <div className='flex-item'>
          {safetyData.rawJsonObject._FileInfo && safetyData.rawJsonObject._FileInfo._Filesize &&
            <span className='text'>{helper.numberWithCommas(safetyData.rawJsonObject._FileInfo._Filesize)}KB</span>
          }
          {safetyData.rawJsonObject && safetyData.rawJsonObject._IsPE &&
            <span className='success'>{t('host.txt-peFile')}</span>
          }
          {safetyData.rawJsonObject && safetyData.rawJsonObject._IsPEextension &&
            <span className='success'>{t('host.txt-peFileExtension')}</span>
          }
          {safetyData.rawJsonObject && safetyData.rawJsonObject._IsVerifyTrust &&
            <span className='success'>{t('host.txt-verifyTrust')}</span>
          }
        </div>
      )
    } else if (safetyScanType === 'gcbDetection') {
      let content = '';

      if (locale === 'zh' && safetyData.rawJsonObject['_PolicyName_zh-tw']) {
        content = safetyData.rawJsonObject['_PolicyName_zh-tw'];
      } else if (locale === 'en' && safetyData.rawJsonObject['_PolicyName_en']) {
        content = safetyData.rawJsonObject['_PolicyName_en'];
      }

      return (
        <div className='flex-item'>
          {!safetyData.rawJsonObject._CompareResult &&
            <span className='fail'>Fail</span>
          }
          {safetyData.rawJsonObject._CompareResult &&
            <span className='success'>Pass</span>
          }
          {content &&
            <span className='text'>{content}</span>
          }
        </div>
      )
    } else if (safetyScanType === 'getFileIntegrity') {
      return (
        <div className='flex-item'>
          <span className='text'>{safetyData.primaryKeyValue}</span>
        </div>
      )
    } else if (safetyScanType === 'getEventTracing') {
      console.log(safetyData);
    } else if (safetyScanType === 'getProcessMonitorResult') {
      return (
        <div className='flex-item'>
          {safetyData.rawJsonObject && safetyData.rawJsonObject._IsMd5Modified &&
            <span className='fail'>{t('txt-modified')}</span>
          }
          {safetyData.rawJsonObject && !safetyData.rawJsonObject._IsMd5Modified &&
            <span className='success'>{t('txt-notModified')}</span>
          }
        </div>
      )
    } else if (safetyScanType === 'getVansCpe') {
      return (
        <div className='flex-item'>
          {safetyData.rawJsonObject && safetyData.rawJsonObject.vendor &&
            <span className='text border'>{t('host.txt-vendor')}: {safetyData.rawJsonObject.vendor}</span>
          }
          {safetyData.rawJsonObject && safetyData.rawJsonObject.product &&
            <span className='text border'>{t('host.txt-product')}: {safetyData.rawJsonObject.product}</span>
          }
          {safetyData.rawJsonObject && safetyData.rawJsonObject.version &&
            <span className='text'>{t('host.txt-version')}: {safetyData.rawJsonObject.version}</span>
          }
        </div>
      )
    } else if (safetyScanType === 'getVansCve') {
      let severity = '';
      let className = '';
      let description = '';

      if (safetyData.rawJsonObject) {
        if (safetyData.rawJsonObject.severity) {
          severity = safetyData.rawJsonObject.severity.toLowerCase();

          if (severity === 'low') {
            className = 'success';
          } else if (severity === 'medium') {
            className = 'medium';
          } else if (severity === 'high') {
            className = 'fail';
          }
        }

        if (safetyData.rawJsonObject.description) {
          description = this.getFormattedLength(safetyData.rawJsonObject.description.description_data[0].value, 120);
        }
      }

      return (
        <div className='flex-item'>
          {severity &&
            <span className={className}>{helper.capitalizeFirstLetter(severity)}</span>
          }
          {description &&
            <span className='text'>{description}</span>
          }
        </div>
      )
    }
  }
  /**
   * Format primary content length
   * @method
   * @param {string} content - Safety Scan content
   * @param {number} length - length of content
   * @returns formatted content
   */
  getFormattedLength = (content, length) => {
    if (content.length > length) {
      const newValue = content.substr(0, length) + '...';
      content = <span className='primary-content' title={content}>{newValue}</span>;
    } else {
      content = <span className='primary-content'>{content}</span>;
    }
    return content;
  }
  /**
   * Display Safety Scan content
   * @method
   * @param {object} val - Safety Scan data
   * @param {number} i - index of the Safety Scan data
   * @returns HTML DOM
   */
  getSafetyList = (val, i) => {
    const {safetyScanType} = this.state;

    return (
      <li key={i}>
        <div className='device-alert'>
          <i className='fg fg-wifi-beacon-1'></i>
          {this.getFormattedLength(val.primaryKeyValue, 80)}
        </div>
        <div className='info'>
          {this.getSecondaryContent(val)}
        </div>
        <div className='view-details' onClick={this.toggleSafetyDetails.bind(this, val)}>
          {t('host.txt-viewInfo')}
        </div>
      </li>
    )
  }
  /**
   * Handle CSV download
   * @method
   */
  getCSVfile = () => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/ipdevice/assessment/_export`;
    const dataOptions = this.getHostData('csv');

    downloadWithForm(url, {payload: JSON.stringify(dataOptions)});
  }
  /**
   * Handle PDF export
   * @method
   */
  exportAllPdf = () => {
    const {baseUrl, contextRoot} = this.context
    const url = `${baseUrl}${contextRoot}/api/ipdevice/assessment/_pdfs`
    const dataOptions = this.getHostData('pdf')

    downloadWithForm(url, {payload: JSON.stringify(dataOptions)})
  }
  /**
   * Display tree item
   * @method
   * @param {object} val - tree data
   * @param {number} i - index of the tree data
   * @returns TreeItem component
   */
  getTreeItem = (val, i) => {
    return (
      <TreeItem
        key={val.id + i}
        nodeId={val.id}
        label={val.label}>
        {val.children && val.children.length > 0 &&
          val.children.map(this.getTreeItem)
        }
      </TreeItem>
    )
  }
  /**
   * Handle open menu
   * @method
   * @param {string} type - menu type ('hmdTriggerAll' or 'hmdDownload')
   * @param {object} event - event object
   */
  handleOpenMenu = (type, event) => {
    this.setState({
      contextAnchor: event.currentTarget,
      menuType: type
    });
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null,
      menuType: ''
    });
  }
  /**
   * Toggle yara rule modal dialog on/off
   * @method
   */
  toggleYaraRule = () => {
    this.setState({
      yaraRuleOpen: !this.state.yaraRuleOpen
    });

    this.handleCloseMenu();
  }
  /**
   * Get HMD test menu
   * @method
   * @param {string} val - individual HMD data
   * @param {number} i - index of the HMD data
   */
  getHMDmenu = (val, i) => {
    if (val.cmds === 'compareIOC') {
      return <MenuItem key={i} onClick={this.toggleYaraRule}>{val.name}</MenuItem>
    } else {
      return <MenuItem key={i} onClick={this.triggerHmdAll.bind(this, val)}>{val.name}</MenuItem>
    }
  }
  /**
   * Handle HMD download button
   * @method
   * @param {string} type - download type ('windows' or 'linux')
   */
  hmdDownload = (type) => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/hmd/download?ver=${type}`;
    window.open(url, '_blank');
    this.handleCloseMenu();
  }
  /**
   * Handle trigger button for HMD trigger all
   * @method
   * @param {object} hmdObj - HMD object
   * @param {object} [yaraRule] - yara rule data
   */
  triggerHmdAll = (hmdObj, yaraRule) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/hmd/retriggerAll`;
    let requestData = {
      cmds: [hmdObj.cmds]
    };

    if (hmdObj.cmds === 'compareIOC') {
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

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    helper.showPopupMsg(t('txt-requestSent'));
    this.handleCloseMenu();

    if (hmdObj.cmds === 'compareIOC') {
      this.toggleYaraRule();
    }
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
        this.triggerHmdAll(HMD_TRIGGER[0], yaraRule);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle page content
   * @method
   * @param {string} type - content type ('hostContent' or 'hmdSettings')
   */
  toggleContent = (type) => {
    this.setState({
      activeContent: type
    });
  }
  /**
   * Get and set safety scan list
   * @method
   */
  getSafetyScanList = () => {
    const safetyScanList = _.map(SAFETY_SCAN_LIST, (val, i) => {
      return <MenuItem key={i} value={val.value}>{val.name}</MenuItem>
    });
    return safetyScanList;
  }  
  /**
   * Handle Safety Scan list change
   * @method
   * @param {object} event - event object
   */
  safetyScanChange = (event) => {
    let tempSafetyScanData = {...this.state.safetyScanData};
    tempSafetyScanData.dataContent = [];
    tempSafetyScanData.currentPage = 1;

    this.setState({
      safetyScanData: tempSafetyScanData,
      safetyScanType: event.target.value
    }, () => {
      this.getSafetyScanData();
    });
  }
  render() {
    const {
      activeTab,
      activeContent,
      showLeftNav,
      showFilter,
      datetime,
      assessmentDatetime,
      hostAnalysisOpen,
      safetyDetailsOpen,
      contextAnchor,
      menuType,
      yaraRuleOpen,
      hostCreateTime,
      privateMaskedIPtree,
      leftNavData,
      filterNav,
      hostInfo,
      hostData,
      hostSort,
      safetyScanData,
      floorList,
      currentFloor,
      currentMap,
      currentBaseLayers,
      seatData,
      eventInfo,
      openHmdType,
      currentSafetyData,
      safetyScanType
    } = this.state;

    return (
      <div>
        {yaraRuleOpen &&
          <YaraRule
            toggleYaraRule={this.toggleYaraRule}
            checkYaraRule={this.checkYaraRule} />
        }

        {hostAnalysisOpen &&
          <HostAnalysis
            datetime={datetime}
            assessmentDatetime={assessmentDatetime}
            hostData={hostData}
            eventInfo={eventInfo}
            openHmdType={openHmdType}
            getIPdeviceInfo={this.getIPdeviceInfo}
            loadEventTracing={this.loadEventTracing}
            toggleHostAnalysis={this.toggleHostAnalysis} />
        }

        {safetyDetailsOpen &&
          <SafetyDetails
            currentSafetyData={currentSafetyData}
            safetyScanType={safetyScanType}
            toggleSafetyDetails={this.toggleSafetyDetails} />
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button variant='outlined' color='primary' className={cx({'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></Button>
            <Button variant='outlined' color='primary' onClick={this.exportAllPdf} title={t('txt-exportPDF')}><i className='fg fg-data-download'></i></Button>
            <Button variant='outlined' color='primary' className='last' onClick={this.getCSVfile} title={t('txt-exportCSV')}><i className='fg fg-data-download'></i></Button>
          </div>

          <SearchOptions
            dateType='datepicker'
            datetime={datetime}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.handleSearchSubmit} />
        </div>

        <div className='data-content'>
          <div className={cx('left-nav tree', {'collapse': !showLeftNav})}>
            <div className='content'>
              {leftNavData.map(this.showLeftNavItems)}
              <div>
                <label className={cx('header-text', {'hide': !showLeftNav})}>{t('alert.txt-privateMaskedIp')}</label>
                <TreeView
                  className='tree-view'
                  defaultCollapseIcon={<ExpandMoreIcon />}
                  defaultExpandIcon={<ChevronRightIcon />}
                  defaultExpanded={['All']}>
                  {privateMaskedIPtree &&
                    <TreeItem
                      nodeId={privateMaskedIPtree.id}
                      label={privateMaskedIPtree.label}>
                      {privateMaskedIPtree.children.length > 0 &&
                        privateMaskedIPtree.children.map(this.getTreeItem)
                      }
                    </TreeItem>
                  }
                </TreeView>
              </div>
            </div>
            <div className='expand-collapse' onClick={this.toggleLeftNav}>
              <i className={`fg fg-arrow-${showLeftNav ? 'left' : 'right'}`}></i>
            </div>
          </div>

          {activeContent === 'hostContent' &&
            <div className='parent-content'>
              {this.renderFilter()}

              <div className='host-list'>
                <header>{t('host.txt-hostList2')}</header>
                {hostInfo.totalCount > 0 &&
                  <div>
                    <span>{t('txt-total')}: {helper.numberWithCommas(hostInfo.totalCount)}</span>
                    <span>{t('host.txt-hostCreateTime')}: {hostCreateTime}</span>
                  </div>
                }
                {activeTab === 'hostList' &&
                  <div className='sort-section'>
                    <TextField
                      id='hostSortList'
                      name='hostSort'
                      label={t('txt-sort')}
                      select
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={hostSort}
                      onChange={this.handleHostSortChange}>
                      {this.getHostSortList()}
                    </TextField>
                  </div>
                }
              </div>
              <div className='main-content host'>
                <Tabs
                  indicatorColor='primary'
                  textColor='primary'
                  value={activeTab}
                  onChange={this.handleSubTabChange}>
                  <Tab id='hostListTab' label={t('host.txt-hostList')} value='hostList' />
                  <Tab id='hostMapTab' label={t('host.txt-deviceMap')} value='deviceMap' />
                  <Tab id='hostMapTab' label={t('host.txt-safetyScan')} value='safetyScan' />
                </Tabs>

                <div className={cx('content-header-btns', {'with-menu': activeTab === 'deviceList'})}>
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.handleOpenMenu.bind(this, 'hmdTriggerAll')}>{t('hmd-scan.txt-triggerAll')}</Button>
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'hmdSettings')}>{t('hmd-scan.txt-hmdSettings')}</Button>
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.handleOpenMenu.bind(this, 'hmdDownload')}>{t('hmd-scan.txt-hmdDownload')}</Button>
                </div>

                <Menu
                  anchorEl={contextAnchor}
                  keepMounted
                  open={menuType === 'hmdTriggerAll' && Boolean(contextAnchor)}
                  onClose={this.handleCloseMenu}>
                  {HMD_TRIGGER.map(this.getHMDmenu)}
                </Menu>

                <Menu
                  anchorEl={contextAnchor}
                  keepMounted
                  open={menuType === 'hmdDownload' && Boolean(contextAnchor)}
                  onClose={this.handleCloseMenu}>
                  <MenuItem onClick={this.hmdDownload.bind(this, 'windows')}>Windows</MenuItem>
                  <MenuItem onClick={this.hmdDownload.bind(this, 'linux')}>Linux</MenuItem>
                </Menu>

                {activeTab === 'hostList' &&
                  <div className='table-content'>
                    <div className='table' style={{height: '64vh'}}>
                      <ul className='host-list'>
                        {hostInfo.dataContent && hostInfo.dataContent.length > 0 &&
                          hostInfo.dataContent.map(this.getHostList)
                        }
                      </ul>
                    </div>
                    <footer>
                      <Pagination
                        totalCount={hostInfo.totalCount}
                        pageSize={hostInfo.pageSize}
                        currentPage={hostInfo.currentPage}
                        onPageChange={this.handlePaginationChange.bind(this, 'hostInfo', 'currentPage')}
                        onDropDownChange={this.handlePaginationChange.bind(this, 'hostInfo', 'pageSize')} />
                    </footer>
                  </div>
                }

                {activeTab === 'deviceMap' &&
                  <div className='map'>
                    {floorList.length > 0 &&
                      <TextField
                        className='drop-down'
                        select
                        variant='outlined'
                        size='small'
                        value={currentFloor}
                        onChange={this.getAreaData}>
                        {floorList}
                      </TextField>
                    }
                    {currentMap &&
                      <Gis
                        className='floor-map-area'
                        _ref={(ref) => {this.gisNode = ref}}
                        data={_.get(seatData, [currentFloor, 'data'])}
                        baseLayers={currentBaseLayers}
                        baseLayer={currentFloor}
                        layouts={['standard']}
                        dragModes={['pan']}
                        scale={{enabled: false}}
                        mapOptions={{
                          maxZoom: 2
                        }}
                        onClick={this.handleFloorMapClick}
                        symbolOptions={[{
                          match: {
                            data: {tag: 'red'}
                          },
                          props: {
                            backgroundColor: 'red'
                          }
                        }]} />
                    }
                  </div>
                }

                {activeTab === 'safetyScan' &&
                  <div>
                    <TextField
                      id='safetyScanType'
                      className='safety-scan-type'
                      name='safetyScanType'
                      label={t('host.txt-safetyScanType')}
                      select
                      variant='outlined'
                      size='small'
                      value={safetyScanType}
                      onChange={this.safetyScanChange}>
                      {this.getSafetyScanList()}
                    </TextField>

                    <div className='table-content'>
                      <div className='table' style={{height: '57vh'}}>
                        <ul className='safety-list'>
                          {safetyScanData.dataContent && safetyScanData.dataContent.length > 0 &&
                            safetyScanData.dataContent.map(this.getSafetyList)
                          }
                        </ul>
                      </div>
                      <footer>
                        <Pagination
                          totalCount={safetyScanData.totalCount}
                          pageSize={safetyScanData.pageSize}
                          currentPage={safetyScanData.currentPage}
                          onPageChange={this.handlePaginationChange.bind(this, 'safetyScanData', 'currentPage')}
                          onDropDownChange={this.handlePaginationChange.bind(this, 'safetyScanData', 'pageSize')} />
                      </footer>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          {activeContent === 'hmdSettings' &&
            <HMDsettings />
          }
        </div>
      </div>
    )
  }
}

HostController.contextType = BaseDataContext;

HostController.propTypes = {
};

export default withRouter(HostController);