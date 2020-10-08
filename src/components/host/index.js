import React, {Component} from 'react'
import {withRouter} from 'react-router'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import CheckboxGroup from 'react-ui/build/src/components/checkbox-group'
import ContextMenu from 'react-ui/build/src/components/contextmenu'
import {downloadWithForm} from 'react-ui/build/src/utils/download'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Gis from 'react-gis/build/src/components'
import Hierarchy from 'react-ui/build/src/components/hierarchy'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Tabs from 'react-ui/build/src/components/tabs'

import {BaseDataContext} from '../common/context';
import helper from '../common/helper'
import HostAnalysis from '../common/host-analysis'
import Pagination from '../common/pagination'
import SearchOptions from '../common/search-options'

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
  result: 'yaraResult',
  count: 'TotalCnt',
},
{
  name: 'Malware',
  result: 'scanFileResult',
  count: 'TotalCnt'
},
{
  name: 'GCB',
  result: 'gcbResult',
  count: 'TotalCnt',
  pass: 'PassCnt'
},
{
  name: 'File Integrity',
  result: 'fileIntegrityResult',
  count: 'TotalCnt'
}];
const HMD_STATUS_LIST = ['isNotHmd', 'isLatestVersion', 'isOldVersion', 'isOwnerNull', 'isAreaNull', 'isSeatNull'];
const HMD_LIST = [
  {
    value: 'isScanProc',
    text: 'Yara Scan'
  },
  {
    value: 'isScanFile',
    text: 'Malware'
  },
  {
    value: 'isGCB',
    text: 'GCB'
  },
  {
    value: 'isFileIntegrity',
    text: 'File Integrity'
  },
  {
    value: 'isProcessMonitor',
    text: 'Process Monitor'
  },
  {
    value: 'isIR',
    text: 'IR'
  }
];
const HOST_SORT_LIST = [
  {
    name: 'ip',
    type: 'asc'
  },
  {
    name: 'ip',
    type: 'desc'
  },
  {
    name: 'mac',
    type: 'asc'
  },
  {
    name: 'mac',
    type: 'desc'
  },
  {
    name: 'hostName',
    type: 'asc'
  },
  {
    name: 'hostName',
    type: 'desc'
  },
  {
    name: 'system',
    type: 'asc'
  },
  {
    name: 'system',
    type: 'desc'
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
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to handle the business logic for the threats page
 */
class HostController extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      activeTab: 'hostList', //'hostList', 'deviceMap'
      showFilter: false,
      showLeftNav: true,
      datetime: Moment().local().format('YYYY-MM-DD') + 'T00:00:00',
      hostAnalysisOpen: false,
      severityList: [],
      privateMaskedIP: {},
      hmdStatusList: [],
      scanStatusList: [],
      hostCreateTime: '',
      filterNav: {
        severitySelected: [],
        hmdSelected: [],
        hmdStatusSelected: [],
        maskedIPSelected: []
      },
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
      hostSortList: [],
      hostSort: 'ip-asc',
      ..._.cloneDeep(MAPS_PRIVATE_DATA)
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getHostSortList();
    this.getFloorPlan();
  }
  /**
   * Get and set host sort list
   * @method
   */
  getHostSortList = () => {
    const hostSortList = _.map(HOST_SORT_LIST, val => {
      return {
        value: val.name + '-' + val.type,
        text: t('ipFields.' + val.name) + ' - ' + t('txt-' + val.type)
      }
    });

    this.setState({
      hostSortList
    });
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
    }, {showProgress: false})
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
    let currentFloor = '';

    _.forEach(floorPlan.treeData, val => {
      helper.floorPlanRecursive(val, obj => {
        floorList.push({
          value: obj.areaUUID,
          text: obj.areaName
        });
      });
    })

    currentFloor = floorList[0].value; //Default to the top parent floor

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
   * @param {string} areaUUID - area UUID
   */
  getAreaData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.context;
    const {alertDetails} = this.state;
    const floorPlan = areaUUID;

    if (!floorPlan) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/area?uuid=${floorPlan}`,
      type: 'GET'
    }, {showProgress: false})
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
        }, () => {
          this.getHostData();
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
    const {datetime} = this.state;

    return {
      from: Moment(datetime).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: Moment(helper.getAdditionDate(1, 'day', datetime)).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
      //from: '2020-09-25T16:00:00Z',
      //to: '2020-09-26T16:00:00Z'
    }
  }
  /**
   * Get and set host info data
   * @method
   * @param {string} options - options for CSV export
   */
  getHostData = (options) => {
    const {baseUrl} = this.context;
    const {activeTab, filterNav, deviceSearch, hostInfo, hostSort, currentFloor} = this.state;
    const hostSortArr = hostSort.split('-');
    const datetime = this.getHostDateTime();
    let url = `${baseUrl}/api/ipdevice/assessment/_search`;

    if (activeTab === 'hostList') {
      url += `?page=${hostInfo.currentPage}&pageSize=${hostInfo.pageSize}&orders=${hostSortArr[0]} ${hostSortArr[1]}`;
    }

    let requestData = {
      timestamp: [datetime.from, datetime.to]
    };

    if (activeTab === 'deviceMap') {
      requestData.areaUUID = currentFloor;
    }

    if (filterNav.severitySelected.length > 0) {
      requestData.severityLevel = filterNav.severitySelected;
    }

    if (filterNav.hmdSelected.length > 0) {
      requestData.scanInfo = filterNav.hmdSelected;
    }

    if (filterNav.hmdStatusSelected.length > 0) {
      requestData.devInfo = filterNav.hmdStatusSelected;
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

    if (options === 'csv') { //For CSV export
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
        let tempHostInfo = {...hostInfo};
        tempHostInfo.dataContent = data.rows;
        tempHostInfo.totalCount = data.count;

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

        const hmdStatusList = _.map(HMD_STATUS_LIST, val => {
          return {
            value: val,
            text: t('host.txt-' + val) + ' (' + helper.numberWithCommas(data.devInfoAgg[val]) + ')'
          }
        });

        const scanStatusList = _.map(HMD_LIST, val => {
          return {
            value: val.value,
            text: val.text + ' (' + data.scanInfoAgg[val.value] + ')'
          }
        });

        this.getPrivateTreeData(data.subnetAgg);

        this.setState({
          severityList,
          hmdStatusList,
          scanStatusList,
          hostCreateTime: data.create_dttm,
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
   * Set the alert private tree data
   * @method
   * @param {string} treeData - alert tree data
   * @returns tree data object
   */
  getPrivateTreeData = (treeData) => {
    let treeObj = { //Handle service tree data
      id: 'All',
      children: []
    };

    if (!treeData) {
      return;
    }

    _.keys(treeData)
    .forEach(key => {
      let tempChild = [];
      let label = '';
      let treeProperty = {};

      if (key && key !== 'doc_count') {
        if (treeData[key].buckets.length > 0) {
          _.forEach(treeData[key].buckets, val => {
            if (val.ip) {
              let nodeClass = '';

              if (val._severity_) {
                nodeClass = 'fg fg-recode ' + val._severity_.toLowerCase();
              }

              label = <span><i className={nodeClass} />{val.ip}</span>;

              tempChild.push({
                id: val.ip,
                label
              });
            }
          })
        }

        let nodeClass = '';

        if (treeData[key]._severity_) {
          nodeClass = 'fg fg-recode ' + treeData[key]._severity_.toLowerCase();
        }

        label = <span><i className={nodeClass} />{key} ({helper.numberWithCommas(treeData[key].doc_count)})</span>;

        treeProperty = {
          id: key,
          label
        };

        if (tempChild.length > 0) {
          treeProperty.children = tempChild;
        }

        treeObj.children.push(treeProperty);
      }
    })

    treeObj.label = t('txt-all') + ' (' + helper.numberWithCommas(treeData.doc_count) + ')';

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
   * @param {object} datetime - new datetime object
   */
  handleDateChange = (datetime) => {
    this.setState({
      datetime
    });
  }
  /**
   * Handle Host sort change
   * @method
   * @param {string} val - new sort value
   */
  handleHostSortChange = (val) => {
    this.setState({
      hostSort: val
    }, () => {
      this.getHostData();
    });
  }
  /**
   * Handle search submit
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
   * @param {string} type - content type ('hostList' or 'deviceMap')
   */
  handleSubTabChange = (type) => {
    this.setState({
      activeTab: type
    }, () => {
      this.getHostData();
    });
  }
  /**
   * Handle Host data filter change
   * @method
   * @param {string} type - filter type ('severitySelected', hmdSelected')
   * @param {array} value - selected hmd array
   */
  handleFilterNavChange = (type, value) => {
    let tempFilterNav = {...this.state.filterNav};
    tempFilterNav[type] = value;

    this.setState({
      filterNav: tempFilterNav
    }, () => {
      this.handleSearchSubmit();
    });
  }
  /**
   * Handle filter input value change
   * @method
   * @param {string} type - input type
   * @param {object} event - input value
   */
  handleDeviceSearch = (type, event) => {
    let tempDeviceSearch = {...this.state.deviceSearch};
    tempDeviceSearch[type] = event.target.value.trim();

    this.setState({
      deviceSearch: tempDeviceSearch
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, deviceSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='deviceSearchIP'>{t('ipFields.ip')}</label>
            <input
              id='deviceSearchIP'
              type='text'
              value={deviceSearch.ip}
              onChange={this.handleDeviceSearch.bind(this, 'ip')} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchMac'>{t('ipFields.mac')}</label>
            <input
              id='deviceSearchMac'
              type='text'
              value={deviceSearch.mac}
              onChange={this.handleDeviceSearch.bind(this, 'mac')} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchHostName'>{t('ipFields.hostName')}</label>
            <input
              id='deviceSearchHostName'
              type='text'
              value={deviceSearch.hostName}
              onChange={this.handleDeviceSearch.bind(this, 'hostName')} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchDeviceType'>{t('ipFields.deviceType')}</label>
            <input
              id='deviceSearchDeviceType'
              type='text'
              value={deviceSearch.deviceType}
              onChange={this.handleDeviceSearch.bind(this, 'deviceType')} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchSystem'>{t('ipFields.system')}</label>
            <input
              id='deviceSearchSystem'
              type='text'
              value={deviceSearch.system}
              onChange={this.handleDeviceSearch.bind(this, 'system')} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.handleSearchSubmit}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
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
   * @param {object} val - individual Safety Scan data
   * @param {number} i - index of the Safety Scan data
   * @returns HTML DOM
   */
  getSafetyScanInfo = (safetyScanInfo, val, i) => {
    let safetyData = safetyScanInfo[val.result];

    if (safetyData && safetyData.length > 0) {
      if (safetyData[0][val.count] > 0) {
        if (val.name === 'GCB') {
          return <span key={i}>{val.name} {t('network-inventory.txt-passCount')}/{t('network-inventory.txt-totalItem')}: {safetyData[0][val.pass]}/{safetyData[0][val.count]}</span>
        } else {
          const text = val.name === 'File Integrity' ? t('network-inventory.txt-modifiedFileCount') : t('network-inventory.txt-suspiciousFileCount');
          return <span key={i}>{val.name} {text}: {safetyData[0][val.count]}</span>
        }
      }
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
    const {contextRoot} = this.context;
    let context = '';

    if (dataInfo[val.path]) {
      if (val.path === 'mac') {
        context = <div className={`fg-bg ${val.path}`}></div>;
      } else if (val.path === 'system') {
        const system = dataInfo[val.path].toLowerCase();
        let os = 'windows';

        if (system.indexOf('linux') > -1) {
          os = 'linux';
        } else if (system.indexOf('windows') > -1) {
          os = 'windows';
        }

        context = <div className={`fg-bg ${os}`}></div>;
      } else {
        context = <i className={`fg fg-${val.icon}`}></i>;
      }

      return <li key={i} className={cx({'first': val.first})} title={t('ipFields.' + val.name)}>{context}{dataInfo[val.path]}</li>
    }
  }
  /**
   * Get IP device data info
   * @method
   * @param {object} host - active Host data
   * @param {string} options - options for 'toggle'
   */
  getIPdeviceInfo = (host, options) => {
    const {baseUrl} = this.context;
    const {hostInfo} = this.state;
    const datetime = this.getHostDateTime();
    const url = `${baseUrl}/api/v2/ipdevice?uuid=${host.ipDeviceUUID}&page=1&pageSize=1&startDttm=${datetime.from}&endDttm=${datetime.to}`;

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const activeHostInfo = _.find(hostInfo.dataContent, {ipDeviceUUID: host.ipDeviceUUID});
        let hostData = {
          ...data
        };

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
            this.toggleHostAnalysis();
          }
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle Host Analysis dialog on/off
   * @method
   */
  toggleHostAnalysis = () => {
    this.setState({
      hostAnalysisOpen: !this.state.hostAnalysisOpen
    });
  }
  /**
   * Display individual severity
   * @method
   * @param {object} val - Severity list
   * @param {number} i - index of the severity list
   * @returns HTML DOM
   */
  displaySeverityItem = (val, i) => {
    return (
      <span key={i} style={{backgroundColor: ALERT_LEVEL_COLORS[val.key]}}>{val.key}: {val.doc_count}</span>
    )
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
        icon: 'fg-ppl-face-2'
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
      }
    ];
    let newInfoList = [];
    let firstItem = false;
    let safetyScanInfo = '';
    let safetyData = false;
    let itemHeader = val.ip;
    let severityList = [];

    _.forEach(infoList, val2 => { //Determine the first item in the list
      if (!firstItem && val[val2.path]) {
        firstItem = true; //Update flag
        newInfoList.push({
          ...val2,
          first: true
        });
      } else {
        newInfoList.push({
          ...val2,
          first: false
        });
      }
    })

    if (val.safetyScanInfo) {
      safetyScanInfo = val.safetyScanInfo;

      _.forEach(SCAN_RESULT, val => { //Check if safety scan data is available
        if (safetyScanInfo[val.result] && safetyScanInfo[val.result].length > 0) {
          if (safetyScanInfo[val.result][0][val.count] > 0) {
            safetyData = true;
            return false;
          }
        }
      })
    }

    if (val.hostName) {
      itemHeader += ' / ' + val.hostName;
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

    return (
      <li key={i}>
        <div className='device-alert' style={{backgroundColor: ALERT_LEVEL_COLORS[val.severityLevel] || '#999'}}>
          <div className='device'>
            <img src={contextRoot + '/images/ic_host.svg'} />
          </div>
        </div>
        <div className='info'>
          <header>{itemHeader}</header>
          <ul>
            {newInfoList.map(this.getInfoList.bind(this, val))}
          </ul>

          {safetyData &&
            <div className='sub-item'>
              <header>Safety Scan</header>
              <div className='flex-item'>
                {SCAN_RESULT.map(this.getSafetyScanInfo.bind(this, safetyScanInfo))}
              </div>
            </div>
          }

          {severityList.length > 0 &&
            <div className='sub-item'>
              <div>
                <header>{t('txt-networkBehavior')}</header>
                <div className='flex-item'>
                  {severityList.map(this.displaySeverityItem)}
                </div>
              </div>
            </div>
          }
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
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempHostInfo = {...this.state.hostInfo};
    tempHostInfo[type] = Number(value);

    if (type === 'pageSize') {
      tempHostInfo.currentPage = 1;
    }

    this.setState({
      hostInfo: tempHostInfo
    }, () => {
      this.getHostData();
    });
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
  render() {
    const {
      activeTab,
      showLeftNav,
      showFilter,
      datetime,
      hostAnalysisOpen,
      severityList,
      hmdStatusList,
      scanStatusList,
      hostCreateTime,
      privateMaskedIPtree,
      filterNav,
      hostInfo,
      hostData,
      hostSortList,
      hostSort,
      floorList,
      currentFloor,
      currentMap,
      currentBaseLayers,
      seatData
    } = this.state;

    return (
      <div>
        {hostAnalysisOpen &&
          <HostAnalysis
            hostData={hostData}
            datetime={this.getHostDateTime()}
            getIPdeviceInfo={this.getIPdeviceInfo}
            toggleHostAnalysis={this.toggleHostAnalysis} />
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx({'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
            <button className='last' onClick={this.getCSVfile} title={t('events.connections.txt-exportCSV')}><i className='fg fg-data-download'></i></button>
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
              <div>
                <label className={cx('header-text', {'hide': !showLeftNav})}>{t('alert.txt-threatLevel')}</label>
                <CheckboxGroup
                  list={severityList}
                  value={filterNav.severitySelected}
                  onChange={this.handleFilterNavChange.bind(this, 'severitySelected')} />
              </div>
              <div>
                <label className={cx('header-text', {'hide': !showLeftNav})}>HMD Status</label>
                <CheckboxGroup
                  list={hmdStatusList}
                  value={filterNav.hmdStatusSelected}
                  onChange={this.handleFilterNavChange.bind(this, 'hmdStatusSelected')} />
              </div>
              <div>
                <label className={cx('header-text', {'hide': !showLeftNav})}>Scan Status</label>
                <CheckboxGroup
                  list={scanStatusList}
                  value={filterNav.hmdSelected}
                  onChange={this.handleFilterNavChange.bind(this, 'hmdSelected')} />
              </div>
              <div>
                <label className={cx('header-text', {'hide': !showLeftNav})}>{t('alert.txt-privateMaskedIp')}</label>
                <Hierarchy
                  layout='tree'
                  foldable={true}
                  data={privateMaskedIPtree}
                  selection={{
                    enabled: true
                  }}
                  onSelectionChange={this.handleFilterNavChange.bind(this, 'maskedIPSelected')}
                  selected={filterNav.maskedIPSelected}
                  defaultOpened={['all', 'All']} />
              </div>
            </div>
            <div className='expand-collapse' onClick={this.toggleLeftNav}>
              <i className={`fg fg-arrow-${showLeftNav ? 'left' : 'right'}`}></i>
            </div>
          </div>

          <div className='parent-content'>
            {this.renderFilter()}

            <div className='host-list'>
              <header>{t('host.txt-hostList2')}</header>
              {hostInfo.totalCount > 0 &&
                <div>
                  <span>{t('txt-total')}: {helper.numberWithCommas(hostInfo.totalCount)}</span>
                  <span>{t('host.txt-hostCreateTime')}: {helper.getFormattedDate(hostCreateTime, 'local')}</span>
                </div>
              }
              {activeTab === 'hostList' &&
                <div className='sort-section'>
                  <span>{t('txt-sort')}</span>
                  <DropDownList
                    id='hostSortList'
                    list={hostSortList}
                    required={true}
                    value={hostSort}
                    onChange={this.handleHostSortChange} />
                </div>
              }
            </div>
            <div className='main-content host'>
              <Tabs
                className='subtab-menu'
                menu={{
                  hostList: t('host.txt-hostList'),
                  deviceMap: t('host.txt-deviceMap')
                }}
                current={activeTab}
                onChange={this.handleSubTabChange}>
              </Tabs>

              {activeTab === 'hostList' &&
                <div className='table-content'>
                  <div className='table' style={{height: '65vh'}}>
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
                      onPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                      onDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
                  </footer>
                </div>
              }

              {activeTab === 'deviceMap' &&
                <div className='map'>
                  {floorList.length > 0 &&
                    <DropDownList
                      className='drop-down'
                      list={floorList}
                      required={true}
                      value={currentFloor}
                      onChange={this.getAreaData} />
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
            </div>
          </div>
        </div>
      </div>
    )
  }
}

HostController.contextType = BaseDataContext;

HostController.propTypes = {
};

export default HostController;