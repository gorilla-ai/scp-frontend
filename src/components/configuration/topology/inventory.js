import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'
import queryString from 'query-string'

import Checkbox from 'react-ui/build/src/components/checkbox'
import DropDownList from 'react-ui/build/src/components/dropdown'
import FileInput from 'react-ui/build/src/components/file-input'
import Gis from 'react-gis/build/src/components'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import RadioGroup from 'react-ui/build/src/components/radio-group'
import Tabs from 'react-ui/build/src/components/tabs'
import Textarea from 'react-ui/build/src/components/textarea'
import TreeView from 'react-ui/build/src/components/tree'

import {HocAutoSettings as AutoSettings} from './auto-settings'
import {BaseDataContext} from '../../common/context';
import helper from '../../common/helper'
import {HocConfig as Config} from '../../common/configuration'
import {HocFilterContent as FilterContent} from '../../common/filter-content'
import {HocFloorMap as FloorMap} from '../../common/floor-map'
import {HocHMDscanInfo as HMDscanInfo} from '../../common/hmd-scan-info'
import {HocIrSelections as IrSelections} from '../../common/ir-selections'
import {HocPagination as Pagination} from '../../common/pagination'
import {HocPrivateDetails as PrivateDetails} from '../../common/private-details'
import Manage from './manage'
import TableContent from '../../common/table-content'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';
const SAFETY_SCAN_LIST = [
  {
    type: 'yara',
    path: 'ScanResult'
  },
  {
    type: 'yaraScanFile',
    path: 'ScanResult'
  },
  {
    type: 'malware',
    path: 'DetectionResult'
  },
  {
    type: 'gcb',
    path: 'GCBResult'
  }
];
const MAPS_PRIVATE_DATA = {
  floorList: [],
  currentFloor: '',
  mapAreaUUID: '',
  currentMap: '',
  currentBaseLayers: {},
  seatData: {}
};

let t = null;
let f = null;
let et = null;

/**
 * Network Topology Inventory
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Network Topology Inventory page
 */
class NetworkInventory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'deviceList', //deviceList, deviceMap
      activeContent: 'tableList', //tableList, dataInfo, addIPsteps, autoSettings
      showFilter: false,
      showScanInfo: false,
      showSeatData: false,
      modalFloorOpen: false,
      modalIRopen: false,
      addSeatOpen: false,
      formTypeEdit: true,
      deviceSearch: {
        ip: '',
        mac: '',
        hostName: '',
        system: '',
        owner: '',
        areaName: '',
        seatName: ''
      },
      showHMDonly: false,
      deviceData: {
        dataFieldsArr: ['ip', 'mac', 'hostName', 'system', 'owner', 'areaName', 'seatName', 'scanInfo', '_menu'],
        dataFields: {},
        dataContent: [],
        ipListArr: [],
        ipDeviceUUID: '',
        sort: {
          field: 'ip',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        currentIndex: '',
        currentLength: ''
      },
      currentDeviceData: {},
      ownerList: [],
      departmentList: [],
      titleList: [],
      floorPlan: {
        treeData: {},
        type: 'edit',
        rootAreaUUID: '',
        currentAreaUUID: '',
        currentAreaName: '',
        name: '',
        map: ''
      },
      alertInfo: {
        ownerMap: {},
        ownerBaseLayers: {},
        ownerSeat: {}
      },
      activeIPdeviceUUID: '',
      activeSteps: 1,
      addIP: {},
      addSeat: {
        selectedSeatUUID: '',
        name: '',
        coordX: '',
        coordY: ''
      },
      ownerType: 'existing', //existing, new
      ownerIDduplicated: false,
      previewOwnerPic: '',
      ..._.cloneDeep(MAPS_PRIVATE_DATA)
    };

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    et = chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;
    const inventoryParam = queryString.parse(location.search);

    helper.getPrivilegesInfo(sessionRights, 'config', locale);
    
    if (_.isEmpty(inventoryParam)) {
      this.getDeviceData();
    }
    this.getOwnerData();
    this.getOtherData();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state === 'tableList') {
      this.toggleContent('showList');
    }
  }
  /**
   * Display individual scan info
   * @method
   * @param {object} val - scan info data
   * @param {number} i - index of the hmdInfo array
   * @returns HTML DOM
   */
  getHMDinfo = (val, i) => {
    const scanType = val.type;

    if (!val.result) {
      return;
    }

    if (scanType === 'gcb') {
      const filteredResult = _.filter(val.result, ['_CompareResult', true]);
      let style = '#d10d25'; //Default red color

      if (filteredResult.length === val.result.length) { //Show green color for all pass
        style = '#22ac38';
      }

      return <li key={scanType} style={{'color': style}}><span>{val.name} {t('network-inventory.txt-passCount')}/{t('network-inventory.txt-totalItem')}:</span> {filteredResult.length}/{val.result.length}</li>
    } else {
      if (val.result.length > 0) {
        return <li key={scanType}><span>{val.name} {t('network-inventory.txt-suspiciousFileCount')}:</span> {val.result.length}</li>
      }
    }
  }
  /**
   * Get and set device data
   * @method
   * @param {string} fromSearch - options for 'search'
   * @param {string} options - options for 'oneSeat'
   * @param {string} seatUUID - seat UUID
   */
  getDeviceData = (fromSearch, options, seatUUID) => {
    const {baseUrl} = this.context;
    const {showHMDonly, deviceSearch, deviceData} = this.state;
    let dataParams = '';

    if (options === 'oneSeat') {
      if (!seatUUID) {
        return;
      }
      dataParams += `&seatUUID=${seatUUID}`;
    } else {
      const page = fromSearch === 'search' ? 1 : deviceData.currentPage;
      const pageSize = deviceData.pageSize;
      const sort = deviceData.sort.desc ? 'desc' : 'asc';
      const orders = deviceData.sort.field + ' ' + sort;

      if (showHMDonly) {
        dataParams = 'isHmd=true&';
      }

      dataParams += `page=${page}&pageSize=${pageSize}&orders=${orders}`
    }

    if (fromSearch === 'search') {
      if (deviceSearch.ip) {
        dataParams += `&ip=${deviceSearch.ip}`;
      }

      if (deviceSearch.mac) {
        dataParams += `&mac=${deviceSearch.mac}`;
      }

      if (deviceSearch.hostName) {
        dataParams += `&hostName=${deviceSearch.hostName}`;
      }

      if (deviceSearch.system) {
        dataParams += `&system=${deviceSearch.system}`;
      }

      if (deviceSearch.owner) {
        dataParams += `&ownerName=${deviceSearch.owner}`;
      }

      if (deviceSearch.areaName) {
        dataParams += `&areaName=${deviceSearch.areaName}`;
      }

      if (deviceSearch.seatName) {
        dataParams += `&seatName=${deviceSearch.seatName}`;
      }
    }

    this.ah.one({
      url: `${baseUrl}/api/u1/ipdevice/_search?${dataParams}`,
      type: 'GET'
    })
    .then(data => {
      if (options === 'oneSeat') {
        let currentDeviceData = {};

        if (data.counts > 0) {
          currentDeviceData = data.rows[0];
        }

        this.setState({
          showSeatData: true,
          currentDeviceData
        });
        return null;
      }

      let tempDeviceData = {...deviceData};
      tempDeviceData.dataContent = _.map(data.rows, item => {
        return {
          ...item,
          _menu: true
        };
      });

      tempDeviceData.totalCount = data.counts;
      tempDeviceData.currentPage = fromSearch === 'search' ? 1 : deviceData.currentPage;
      tempDeviceData.currentIndex = 0;
      tempDeviceData.currentLength = data.rows.length;

      let tempFields = {};
      deviceData.dataFieldsArr.forEach(tempData => {
        tempFields[tempData] = {
          label: tempData === '_menu' ? '' : t(`ipFields.${tempData}`),
          sortable: this.checkSortable(tempData),
          formatter: (value, allValue, i) => {
            if (tempData === 'owner') {
              if (allValue.ownerObj) {
                return <span>{allValue.ownerObj.ownerName}</span>
              } else {
                return <span>{value}</span>
              }
            } else if (tempData === 'areaName') {
              if (allValue.areaObj) {
                return <span>{allValue.areaObj.areaName}</span>
              }
            } else if (tempData === 'seatName') {
              if (allValue.seatObj) {
                return <span>{allValue.seatObj.seatName}</span>
              }
            } else if (tempData === 'scanInfo') {
              let hmdInfo = [];

              _.forEach(SAFETY_SCAN_LIST, val => { //Construct the HMD info array
                const dataType = val.type + 'Result';
                const currentDataObj = allValue[dataType];

                if (!_.isEmpty(currentDataObj)) {
                  hmdInfo.push({
                    type: val.type,
                    name: t('network-inventory.scan-list.txt-' + val.type),
                    result: currentDataObj[val.path]
                  });
                }
              })

              return (
                <ul>
                  {hmdInfo.map(this.getHMDinfo)}
                </ul>
              )
            } else if (tempData === '_menu') {
              return (
                <div className='table-menu menu active'>
                  <i className='fg fg-eye' onClick={this.openMenu.bind(this, 'view', allValue, i)} title={t('network-inventory.txt-viewDevice')}></i>
                  {allValue.isHmd &&
                    <i className='fg fg-chart-kpi' onClick={this.openMenu.bind(this, 'hmd', allValue, i)} title={t('network-inventory.txt-viewHMD')}></i>
                  }
                  <i className='fg fg-trashcan' onClick={this.openMenu.bind(this, 'delete', allValue)} title={t('network-inventory.txt-deleteDevice')}></i>
                </div>
              )
            } else {
              return <span>{value}</span>
            }
          }
        };
      })

      tempDeviceData.dataFields = tempFields;

      if (!fromSearch) {
        let ipListArr = [];

        _.forEach(data.rows, val => {
          ipListArr.push({
            value: val.ip,
            text: val.ip
          });
        })

        tempDeviceData.ipListArr = ipListArr;
      }

      this.setState({
        deviceData: tempDeviceData,
        activeIPdeviceUUID: ''
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set owner data
   * @method
   */
  getOwnerData = () => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/owner/_search`;
    const data = {
      sort: 'ownerID',
      order: 'asc'
    };

    helper.getAjaxData('POST', url, data)
    .then(data => {
      if (data) {
        if (data.rows.length > 0) {
          const ownerList = _.map(data.rows, val => {
            return {
              value: val.ownerUUID,
              text: val.ownerName
            };
          });

          this.setState({
            ownerList
          });
        } else {
          this.setState({
            ownerType: 'new'
          });
        }
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'));
    });
  }
  /**
   * Get single device data from URL parameter
   * @method
   */
  getSingleDeviceData = () => {
    const {baseUrl} = this.context;
    const inventoryParam = queryString.parse(location.search);

    this.ah.one({
      url: `${baseUrl}/api/u1/ipdevice/_search?ip=${inventoryParam.ip}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        this.setState({
          currentDeviceData: data.rows[0]
        }, () => {
          this.toggleContent('showForm', 'edit');
        });
        return null;
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set Department and Title data
   * @param {string} options - option for calling type
   * @method
   */
  getOtherData = (options) => {
    const {baseUrl} = this.context;
    const {addIP} = this.state;
    const apiNameType = [1, 2]; //1: Department, 2: Title
    let apiArr = [];

    _.forEach(apiNameType, val => {
      const requestData = {
        nameType: val
      };

      apiArr.push({
        url: `${baseUrl}/api/name/_search`,
        data: JSON.stringify(requestData),
        type: 'POST',
        contentType: 'application/json'
      });
    })

    this.ah.all(apiArr)
    .then(data => {
      let departmentList = [];
      let titleList = [];
      let tempAddIP = {...addIP};

      if (!_.isEmpty(data[0])) {
        _.forEach(data[0], val => {
          departmentList.push({
            value: val.nameUUID,
            text: val.name
          });
        })

        if (departmentList[0]) {
          tempAddIP.newDepartment = departmentList[0].value;
        }

        this.setState({
          departmentList,
          addIP: tempAddIP
        });
      }

      if (!_.isEmpty(data[1])) {
        _.forEach(data[1], val => {
          titleList.push({
            value: val.nameUUID,
            text: val.name
          });
        })

        if (titleList[0]) {
          tempAddIP.newTitle = titleList[0].value;
        }

        this.setState({
          titleList,
          addIP: tempAddIP
        }, () => {
          this.getFloorPlan(options);
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display owner seat content
   * @method
   * @returns HTML DOM
   */
  displaySeatInfo = () => {
    const {currentDeviceData} = this.state;
    const deviceInfo = {
      ip: currentDeviceData.ip || NOT_AVAILABLE,
      mac: currentDeviceData.mac || NOT_AVAILABLE,
      hostName: currentDeviceData.hostName || NOT_AVAILABLE,
      system: currentDeviceData.system || NOT_AVAILABLE
    };

    return (
      <div>
        <div className='main'>{t('ipFields.ip')}: {deviceInfo.ip}</div>
        <div className='main'>{t('ipFields.mac')}: {deviceInfo.mac}</div>
        <div className='table-menu inventory active'>
          {currentDeviceData.ip &&
            <i className='fg fg-eye' onClick={this.openMenu.bind(this, 'view', currentDeviceData)} title={t('network-inventory.txt-viewDevice')}></i>
          }
          {currentDeviceData.isHmd &&
            <i className='fg fg-chart-kpi' onClick={this.openMenu.bind(this, 'hmd', currentDeviceData)} title={t('network-inventory.txt-viewHMD')}></i>
          }
          {currentDeviceData.ip &&
            <i className='fg fg-trashcan' onClick={this.openMenu.bind(this, 'delete', currentDeviceData)} title={t('network-inventory.txt-deleteDevice')}></i>
          }
        </div>
        <div className='main header'>{t('alert.txt-systemInfo')}</div>
        <div>{t('ipFields.hostName')}: {deviceInfo.hostName}</div>
        <div>{t('ipFields.system')}: {deviceInfo.system}</div>
      </div>
    )
  }
  /**
   * Display owner seat modal dialog
   * @method
   * @returns ModalDialog component
   */
  showSeatData = () => {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeDialog.bind(this, 'reload')}
    };

    return (
      <ModalDialog
        id='configSeatDialog'
        className='modal-dialog'
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displaySeatInfo()}
      </ModalDialog>
    )
  }
  /**
   * Check table sortable fields
   * @method
   * @param {string} field - field name
   * @returns true for sortable or null
   */
  checkSortable = (field) => {
    const unSortableFields = ['owner', 'areaName', 'seatName', 'yaraScan', '_menu'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  /**
   * Get and set floor plan data
   * @param {string} options - option for calling type
   * @method
   */
  getFloorPlan = (options) => {
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
          this.getFloorList(options);
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set floor list data
   * @param {string} options - option for calling type
   * @method
   */
  getFloorList = (options) => {
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

    currentFloor = floorList[0].value;

    this.setState({
      floorList,
      currentFloor
    }, () => {
      const inventoryParam = queryString.parse(location.search);

      this.getAreaData(currentFloor);
      this.getSeatData(currentFloor);

      if (!options && !_.isEmpty(inventoryParam)) {
        if (inventoryParam.type === 'add') {
          this.toggleContent('showForm', 'new');
        } else if (inventoryParam.type === 'edit') {
          this.getSingleDeviceData();
        }
      }
    });
  }
  /**
   * Get and set individual floor area data
   * @method
   * @param {string} areaUUID - area UUID
   */
  getAreaData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.context;
    const mapAreaUUID = areaUUID.trim();

    if (!mapAreaUUID) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/area?uuid=${mapAreaUUID}`,
      type: 'GET'
    })
    .then(data => {
      const areaName = data.areaName;
      const areaUUID = data.areaUUID;
      let currentMap = {};

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

      let currentBaseLayers = {};
      currentBaseLayers[mapAreaUUID] = currentMap;

      this.setState({
        mapAreaUUID,
        currentMap,
        currentBaseLayers,
        currentFloor: areaUUID
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set individual floor area data
   * @method
   * @param {string} areaUUID - area UUID
   */
  getSeatData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.context;
    const area = areaUUID.trim() || this.state.floorPlan.currentAreaUUID;
    const dataObj = {
      areaUUID: area
    };

    if (!area) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/seat/_search`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      const seatData = {};
      let seatListArr = [];

      _.forEach(data, val => {
        seatListArr.push({
          id: val.seatUUID,
          type: 'marker',
          xy: [val.coordX, val.coordY],
          icon: {
            iconUrl: `${contextRoot}/images/ic_person.png`,
            iconSize: [25, 25],
            iconAnchor: [12.5, 12.5]
          },
          label: val.seatName,
          data: {
            name: val.seatName
          }
        });
      })

      seatData[area] = {
        data: seatListArr
      };

      this.setState({
        seatData
      });
      return null;
    })
  }
  /**
   * Toggle to show only HMD result
   * @method
   * @param {boolean} value - true/false
   */
  toggleHMDonly = (value) => {
    this.setState({
      showHMDonly: value
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, showHMDonly, deviceSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='deviceSearchIP' className='first-label'>{t('ipFields.ip')}</label>
            <Input
              id='deviceSearchIP'
              className='search-textarea'
              onChange={this.handleDeviceSearch.bind(this, 'ip')}
              value={deviceSearch.ip} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchMac'>{t('ipFields.mac')}</label>
            <Input
              id='deviceSearchMac'
              className='search-textarea'
              onChange={this.handleDeviceSearch.bind(this, 'mac')}
              value={deviceSearch.mac} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchHostName'>{t('ipFields.hostName')}</label>
            <Input
              id='deviceSearchHostName'
              className='search-textarea'
              onChange={this.handleDeviceSearch.bind(this, 'hostName')}
              value={deviceSearch.hostName} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchSystem'>{t('ipFields.system')}</label>
            <Input
              id='deviceSearchSystem'
              className='search-textarea'
              onChange={this.handleDeviceSearch.bind(this, 'system')}
              value={deviceSearch.system} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchOwner'>{t('ipFields.owner')}</label>
            <Input
              id='deviceSearchOwner'
              className='search-textarea'
              onChange={this.handleDeviceSearch.bind(this, 'owner')}
              value={deviceSearch.owner} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchAreaName'>{t('ipFields.areaName')}</label>
            <Input
              id='deviceSearchAreaName'
              className='search-textarea'
              onChange={this.handleDeviceSearch.bind(this, 'areaName')}
              value={deviceSearch.areaName} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchSeatName'>{t('ipFields.seatName')}</label>
            <Input
              id='deviceSearchSeatName'
              className='search-textarea'
              onChange={this.handleDeviceSearch.bind(this, 'seatName')}
              value={deviceSearch.seatName} />
          </div>
          <div className='group hmd'>
            <label htmlFor='filterHMD'>HMD</label>
            <Checkbox
              id='filterHMD'
              onChange={this.toggleHMDonly}
              checked={showHMDonly} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getDeviceData.bind(this, 'search')}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  /**
   * Open table menu based on conditions
   * @method
   * @param {string} type - content type ('view', 'hmd' or 'delete')
   * @param {object} allValue - IP device data
   * @param {string} index - index of the IP device data
   */
  openMenu = (type, allValue, index) => {
    if (type === 'view') {
      this.getOwnerSeat(allValue);
    } else if (type === 'hmd') {
      this.getIPdeviceInfo(index, allValue.ipDeviceUUID);
    } else if (type === 'delete') {
      this.openDeleteDeviceModal(allValue);
    }
  }
  /**
   * Get and set owner seat data
   * @method
   * @param {object} allValue - IP device data
   */
  getOwnerSeat = (allValue) => {
    const {baseUrl, contextRoot} = this.context;
    const topoInfo = allValue;
    let tempAlertInfo = {...this.state.alertInfo};

    if (topoInfo.areaObj && topoInfo.areaObj.picPath) {
      const ownerMap = {
        label: topoInfo.areaObj.areaName,
        images: [
          {
            id: topoInfo.areaUUID,
            url: `${baseUrl}${contextRoot}/api/area/_image?path=${topoInfo.areaObj.picPath}`,
            size: {width: topoInfo.areaObj.picWidth, height: topoInfo.areaObj.picHeight}
          }
        ]
      };

      tempAlertInfo.ownerMap = ownerMap;
      tempAlertInfo.ownerBaseLayers[topoInfo.areaUUID] = ownerMap;

      if (topoInfo.seatUUID && topoInfo.seatObj) {
        tempAlertInfo.ownerSeat[topoInfo.areaUUID] = {
          data: [{
            id: topoInfo.seatUUID,
            type: 'spot',
            xy: [topoInfo.seatObj.coordX, topoInfo.seatObj.coordY],
            label: topoInfo.seatObj.seatName,
            data: {
              name: topoInfo.seatObj.seatName,
              tag: 'red'
            }
          }]
        };
      }
    } else {
      tempAlertInfo = {
        ownerMap: {},
        ownerBaseLayers: {},
        ownerSeat: {}
      };
    }

    this.setState({
      activeContent: 'dataInfo',
      showSeatData: false,
      currentDeviceData: topoInfo,
      alertInfo: tempAlertInfo,
      activeIPdeviceUUID: allValue.ipDeviceUUID
    });
  }
  /**
   * Handle 'previous' and 'next' buttons for HMD dialog
   * @method
   * @param {string} type - button type ('previous' or 'next')
   */
  showAlertData = (type) => {
    const {deviceData} = this.state;
    let tempDeviceData = {...deviceData};

    if (type === 'previous') {
      if (deviceData.currentIndex !== 0) {
        tempDeviceData.currentIndex--;
      }
    } else if (type === 'next') {
      if (deviceData.currentLength - deviceData.currentIndex > 1) {
        tempDeviceData.currentIndex++;
      }
    }

    this.setState({
      deviceData: tempDeviceData
    }, () => {
      const {deviceData} = this.state;
      const index = deviceData.currentIndex;
      const allValue = deviceData.dataContent[index];

      this.openDetailInfo(index, allValue);
    });
  }
  /**
   * Set new IP device data
   * @method
   * @param {string} index - index of the IP device data
   * @param {object} allValue - IP device data
   */
  openDetailInfo = (index, allValue) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData.currentIndex = Number(index);

    this.setState({
      showSeatData: false,
      deviceData: tempDeviceData,
      currentDeviceData: allValue,
      activeIPdeviceUUID: allValue.ipDeviceUUID
    });
  }
  /**
   * Display delete IP device content
   * @method
   * @param {object} allValue - IP device data
   * @returns HTML DOM
   */
  getDeleteDeviceContent = (allValue) => {
    this.setState({
      currentDeviceData: allValue,
      activeIPdeviceUUID: allValue.ipDeviceUUID
    });

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {allValue.ip}?</span>
      </div>
    )
  }
  /**
   * Display delete IP device modal dialog
   * @method
   * @param {object} allValue - IP device data
   */
  openDeleteDeviceModal = (allValue) => {
    PopupDialog.prompt({
      title: t('network-inventory.txt-deleteDevice'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteDeviceContent(allValue),
      act: (confirmed, data) => {
        if (confirmed) {
          this.deleteDevice();
        }
      }
    });

    this.setState({
      showSeatData: false
    });
  }
  /**
   * Handle delete IP device confirm
   * @method
   */
  deleteDevice = () => {
    const {baseUrl} = this.context;
    const {currentDeviceData} = this.state;

    ah.one({
      url: `${baseUrl}/api/u1/ipdevice?uuid=${currentDeviceData.ipDeviceUUID}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getDeviceData();
        this.closeDialog('reload');
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle table sort functionality
   * @method
   * @param {object} sort - sort data object
   */
  handleTableSort = (sort) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData.sort.field = sort.field;
    tempDeviceData.sort.desc = sort.desc;

    this.setState({
      deviceData: tempDeviceData
    }, () => {
      this.getDeviceData();
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {number} currentPage - new page number
   */
  handlePaginationChange = (currentPage) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData.currentPage = currentPage;

    this.setState({
      deviceData: tempDeviceData
    }, () => {
      this.getDeviceData();
    });
  }
  /**
   * Handle table pagesize change
   * @method
   * @param {string} pageSize - new page sizse
   */
  handlePageDropdown = (pageSize) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData.currentPage = 1;
    tempDeviceData.pageSize = Number(pageSize);

    this.setState({
      deviceData: tempDeviceData
    }, () => {
      this.getDeviceData();
    });
  }
  /**
   * Handle content tab change
   * @method
   * @param {string} type - content type ('deviceList' or 'deviceMap')
   */
  handleSubTabChange = (type) => {
    this.setState({
      activeTab: type,
      showFilter: false
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
   * Get and set IP device data (old api)
   * @method
   * @param {string} index - index of the IP devicde data
   * @param {string} ipDeviceUUID - IP device UUID
   * @param {string} options - option for 'oneDevice'
   */
  getIPdeviceInfo = (index, ipDeviceUUID, options) => {
    const {baseUrl} = this.context;
    const {deviceData, currentDeviceData} = this.state;
    let tempDeviceData = {...deviceData};

    if (!ipDeviceUUID) {
      return;
    }

    if (index) {
      tempDeviceData.currentIndex = Number(index);
    }

    this.ah.one({
      url: `${baseUrl}/api/ipdevice?uuid=${ipDeviceUUID}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        if (options === 'oneDevice') {
          this.getOwnerSeat(data);
          return;
        }

        this.setState({
          showScanInfo: true,
          deviceData: tempDeviceData,
          currentDeviceData: data,
          activeIPdeviceUUID: ipDeviceUUID
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle trigger button for HMD
   * @method
   * @param {array.<string>} type - HMD scan type
   */
  triggerTask = (type) => {
    const {baseUrl} = this.context;
    const {currentDeviceData} = this.state;
    const url = `${baseUrl}/api/hmd/retrigger`;
    const requestData = {
      hostId: currentDeviceData.ipDeviceUUID,
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

        if (type && type !== 'getSystemInfo') {
          this.getIPdeviceInfo('', currentDeviceData.ipDeviceUUID);
        }
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
  toggleSelectionIR = () => {
    this.setState({
      modalIRopen: !this.state.modalIRopen
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
  /**
   * Display device info and HMD scan results
   * @method
   * @returns HTML DOM
   */
  displayScanInfo = () => {
    const {deviceData, currentDeviceData} = this.state;
    const ip = currentDeviceData.ip || NOT_AVAILABLE;
    const mac = currentDeviceData.mac || NOT_AVAILABLE;
    const hostName = currentDeviceData.hostName || NOT_AVAILABLE;
    const system = currentDeviceData.system || NOT_AVAILABLE;
    const ownerName = currentDeviceData.ownerObj ? currentDeviceData.ownerObj.ownerName : NOT_AVAILABLE;

    return (
      <div>
        <table className='c-table main-table with-border'>
          <thead>
            <tr>
              <th>{t('ipFields.ip')}</th>
              <th>{t('ipFields.mac')}</th>
              <th>{t('ipFields.hostName')}</th>
              <th>{t('ipFields.system')}</th>
              <th>{t('ipFields.owner')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className='align-center'>
              <td>{ip}</td>
              <td>{mac}</td>
              <td>{hostName}</td>
              <td>{system}</td>
              <td>{ownerName}</td>
            </tr>
          </tbody>
        </table>

        <HMDscanInfo
          currentDeviceData={currentDeviceData}
          toggleSelectionIR={this.toggleSelectionIR}
          showAlertData={this.showAlertData}
          triggerTask={this.triggerTask} />

        {deviceData.currentLength > 1 &&
          <div className='pagination'>
            <div className='buttons'>
              <button onClick={this.showAlertData.bind(this, 'previous')} disabled={deviceData.currentIndex === 0}>{t('txt-previous')}</button>
              <button onClick={this.showAlertData.bind(this, 'next')} disabled={deviceData.currentIndex + 1 === deviceData.currentLength}>{t('txt-next')}</button>
            </div>
            <span className='count'>{deviceData.currentIndex + 1} / {deviceData.currentLength}</span>
          </div>
        }          
      </div>
    )
  }
  /**
   * Display HMD scan info content
   * @method
   * @returns HMDscanInfo component
   */
  showScanInfo = () => {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeDialog}
    };

    return (
      <ModalDialog
        id='configScanModalDialog'
        className='modal-dialog'
        title={t('alert.txt-safetyScanInfo')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displayScanInfo()}
      </ModalDialog>
    )
  }
  /**
   * Close HMD scan info dialog
   * @method
   * @param {string} options - option for 'reload'
   * @param {string} all - option for 'all'
   */
  closeDialog = (options, all) => {
    this.setState({
      showScanInfo: false,
      showSeatData: false,
      modalFloorOpen: false,
      addSeatOpen: false,
      currentDeviceData: {},
      addSeat: {
        selectedSeatUUID: '',
        name: '',
        coordX: '',
        coordY: ''
      }
    }, () => {
      if (options === 'reload') {
        if (all === 'fromFloorMap') { //reload everything
          this.getFloorPlan('fromFloorMap');
        } else { //reload area and seat only (no tree)
          const {floorPlan} = this.state;
          this.getAreaData(floorPlan.currentAreaUUID);
          this.getSeatData(floorPlan.currentAreaUUID);
        }
      }
    });
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
        system: '',
        owner: '',
        areaName: '',
        seatName: ''
      },
      showHMDonly: false
    });
  }
  /**
   * Handle filter input value change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleDeviceSearch = (type, value) => {
    let tempDeviceSearch = {...this.state.deviceSearch};
    tempDeviceSearch[type] = value;

    this.setState({
      deviceSearch: tempDeviceSearch
    });
  }
  /**
   * Toggle Inventory content
   * @method
   * @param {string} type - content type
   * @param {string} formType - show form content type ('new' or 'edit')
   */
  toggleContent = (type, formType) => {
    const {formTypeEdit, ownerList, departmentList, titleList, currentDeviceData, alertInfo, floorList} = this.state;
    let activeContent = '';

    if (type === 'cancel') {
      if (formTypeEdit) {
        activeContent = 'dataInfo';
      } else {
        activeContent = 'tableList';
      }
    } else if (type === 'showList') {
      activeContent = 'tableList';
    } else if (type === 'showAuto') {
      activeContent = 'autoSettings';
    } else if (type === 'showData') {
      activeContent = 'dataInfo';
    } else if (type === 'showForm') {
      activeContent = 'addIPsteps';
      let formTypeEdit = '';
      let addIP = {};
      let ownerType = 'existing';

      if (formType === 'edit') {
        formTypeEdit = true;
        addIP = {
          ip: currentDeviceData.ip,
          mac: currentDeviceData.mac,
          hostName: currentDeviceData.hostName,
          hostID: currentDeviceData.ipDeviceUUID,
          system: currentDeviceData.system,
          deviceType: currentDeviceData.deviceType,
          userName: currentDeviceData.userName,
          cpu: currentDeviceData.cpu,
          ram: currentDeviceData.ram,
          disks: currentDeviceData.disks,
          shareFolders: currentDeviceData.shareFolders,
          file: currentDeviceData.ownerObj ? currentDeviceData.ownerObj.picPath : '',
          ownerPic: currentDeviceData.ownerObj ? currentDeviceData.ownerObj.base64 : '',
          ownerUUID: currentDeviceData.ownerUUID,
          ownerID: currentDeviceData.ownerObj ? currentDeviceData.ownerObj.ownerID : '',
          ownerName: currentDeviceData.ownerObj ? currentDeviceData.ownerObj.ownerName : '',
          department: currentDeviceData.ownerObj ? currentDeviceData.ownerObj.departmentName : '',
          title: currentDeviceData.ownerObj ? currentDeviceData.ownerObj.titleName : '',
          newDepartment: departmentList[0] ? departmentList[0].value : '',
          newTitle: titleList[0] ? titleList[0].value : ''
        };

        if (currentDeviceData.areaUUID) {
          this.getAreaData(currentDeviceData.areaUUID);
          this.getSeatData(currentDeviceData.areaUUID);
        }
      } else if (formType === 'new') {
        const inventoryParam = queryString.parse(location.search);
        formTypeEdit = false;

        if (!_.isEmpty(floorList)) {
          this.getAreaData(floorList[0].value);
          this.getSeatData(floorList[0].value);
        }

        this.setState({
          currentDeviceData: {}
        });

        if (_.isEmpty(inventoryParam)) {
          this.getFloorPlan();
        }
      }

      if (!currentDeviceData.ownerUUID && ownerList[0]) {
        this.handleOwnerChange(ownerList[0].value);
      }

      if (_.isEmpty(ownerList)) {
        ownerType = 'new';
      }

      this.setState({
        activeContent,
        activeSteps: 1,
        formTypeEdit,
        addIP,
        ownerType,
        ownerIDduplicated: false
      });
      return;
    }

    this.setState({
      activeContent
    }, () => {
      const inventoryParam = queryString.parse(location.search);

      if (!_.isEmpty(inventoryParam)) {
        if (activeContent === 'dataInfo') {
          this.getOwnerSeat(currentDeviceData);
        }
        if (activeContent === 'tableList') {
          this.getDeviceData();
        }
      }
    });
  }
  /**
   * Check add/edit step form validation
   * @method
   * @param {number} step - form step
   * @returns true if form is invalid
   */
  checkFormValidation = (step) => {
    const {addIP, ownerType} = this.state;

    if (step === 1) {
      if (!addIP.ip || !addIP.mac) {
        return true;
      }
    }

    if (step === 3) {
      if (ownerType === 'new') {
        if (!addIP.newOwnerName || !addIP.newOwnerID) {
          return true;
        }
      }
    }
  }
  /**
   * Toggle add/edit form step content
   * @method
   * @param {string} type - form step type ('previous' or 'next')
   */
  toggleSteps = (type) => {
    const {activeSteps} = this.state;
    let tempActiveSteps = activeSteps;

    if (type === 'previous') {
      tempActiveSteps--;
    } else if (type === 'next') {
      if (activeSteps === 1) {
        if (this.checkFormValidation(1)) {
          helper.showPopupMsg(et('fill-required-fields'), t('txt-error'));
          return;
        }
      }

      if (activeSteps === 3) {
        if (this.checkFormValidation(3)) {
          helper.showPopupMsg(et('fill-required-fields'), t('txt-error'));
          return;
        }
      }

      if (activeSteps === 4) {
        this.handleAddIpConfirm();
        return;
      }
      tempActiveSteps++;
    }

    this.setState({
      activeSteps: tempActiveSteps
    });
  }
  /**
   * Add new owner if new owner is selected
   * @method
   */
  handleAddIpConfirm = () => {
    const {baseUrl} = this.context;
    const {addIP, ownerType} = this.state;

    if (ownerType === 'new') {
      let formData = new FormData();
      formData.append('ownerID', addIP.newOwnerID);
      formData.append('ownerName', addIP.newOwnerName);
      formData.append('department', addIP.newDepartment);
      formData.append('title', addIP.newTitle);

      if (addIP.file) {
        formData.append('updatePic', true);
        formData.append('file', addIP.file);
      }

      this.ah.one({
        url: `${baseUrl}/api/owner`,
        data: formData,
        type: 'POST',
        processData: false,
        contentType: false
      })
      .then(data => {
        if (data) {
          const ownerUUID = data;
          this.handleIPdeviceConfirm(ownerUUID);
        }
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);

        this.setState({
          activeSteps: 3,
          ownerIDduplicated: true
        });
      })
    } else if (ownerType === 'existing') {
      this.handleIPdeviceConfirm();
    }
  }
  /**
   * Handle add/edit form confirm
   * @method
   */
  handleIPdeviceConfirm = (ownerUUID) => {
    const {baseUrl} = this.context;
    const {formTypeEdit, currentDeviceData, floorPlan, addIP, addSeat, mapAreaUUID} = this.state;
    const url = `${baseUrl}/api/ipdevice`;
    const requestType = formTypeEdit ? 'PATCH' : 'POST';
    let requestData = {
      ip: addIP.ip,
      mac: addIP.mac,
      hostName: addIP.hostName,
      deviceType: addIP.deviceType,
      system: addIP.system,
      userName: addIP.userName,
      cpu: addIP.cpu,
      ram: addIP.ram,
      disks: addIP.disks,
      shareFolders: addIP.shareFolders,
      areaUUID: mapAreaUUID,
      seatUUID: addSeat.selectedSeatUUID
    };

    if (formTypeEdit) {
      requestData.ipDeviceUUID = currentDeviceData.ipDeviceUUID;
    }

    if (ownerUUID) {
      requestData.ownerUUID = ownerUUID;
    } else {
      requestData.ownerUUID = addIP.ownerUUID;
    }

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: requestType,
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getDeviceData('search');
        this.getOwnerData();
        this.getOtherData('stepComplete');
        this.getFloorPlan('stepComplete');

        if (formTypeEdit) {
          this.getIPdeviceInfo('', currentDeviceData.ipDeviceUUID, 'oneDevice');
        } else {
          this.toggleContent('showList');
        }
      }
    })
    .catch(err => {
      this.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display form steps indicator
   * @method
   * @param {string} val - step text
   * @param {number} i - index of the steps array
   * @returns HTML DOM
   */
  showAddIpSteps = (val, i) => {
    const {activeSteps} = this.state;
    const index = ++i;
    const groupClass = 'group group' + index;
    const lineClass = 'line line' + index;
    const stepClass = 'step step' + index;
    const textClass = 'text text' + index;

    return (
      <div className={groupClass} key={index}>
        <div className={cx(lineClass, {active: activeSteps >= index})}></div>
        <div className={cx(stepClass, {active: activeSteps >= index})}>
          <div className='wrapper'><span className='number'>{index}</span></div>
          <div className={textClass}>{val}</div>
        </div>
      </div>
    )
  }
  /**
   * Handle owner type change
   * @method
   * @param {string} ownerType - owner type ('existing' or 'new')
   */
  handleOwnerTypeChange = (ownerType) => {
    const {departmentList, titleList, addIP} = this.state;
    const tempAddIP = {...addIP};
    tempAddIP.newDepartment = departmentList[0] ? departmentList[0].value : '';
    tempAddIP.newTitle = titleList[0] ? titleList[0].value : '';

    this.setState({
      ownerType,
      addIP: tempAddIP
    });
  }
  /**
   * Handle existing owners dropdown change
   * @method
   * @param {string} value - ownerUUID
   */
  handleOwnerChange = (value) => {
    const inventoryParam = queryString.parse(location.search);
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/owner?uuid=${value}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempAddIP = {...this.state.addIP};
        tempAddIP.ownerUUID = data.ownerUUID;
        tempAddIP.ownerID = data.ownerID;
        tempAddIP.department = data.departmentName;
        tempAddIP.title = data.titleName;
        tempAddIP.ownerPic = data.base64;

        if (inventoryParam.ip && inventoryParam.type === 'add') {
          tempAddIP.ip = inventoryParam.ip;
        }

        this.setState({
          addIP: tempAddIP
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle Department dropdown change
   * @method
   * @param {string} value - department nameUUID
   */
  handleDepartmentChange = (value) => {
    const tempAddIP = {...this.state.addIP};
    tempAddIP.newDepartment = value;

    this.setState({
      addIP: tempAddIP
    });
  }
  /**
   * Handle Title dropdown change
   * @method
   * @param {string} value - title nameUUID
   */
  handleTitleChange = (value) => {
    const tempAddIP = {...this.state.addIP};
    tempAddIP.newTitle = value;

    this.setState({
      addIP: tempAddIP
    });
  }
  /**
   * Open department / title edit dialog
   * @method
   */
  openManage = () => {
    this.manage._component.openManage();
  }
  /**
   * Open floor map edit dialog
   * @method
   */
  openFloorMap = () => {
    this.setState({
      modalFloorOpen: true
    });
  }
  /**
   * Display floor map modal dialog
   * @method
   * @returns FloorMap component
   */
  modalFloorDialog = () => {
    return (
      <FloorMap
        closeDialog={this.closeDialog} />
    )
  }
  /**
   * Get show form button text
   * @method
   * @returns button text
   */
  getBtnText = () => {
    return this.state.activeSteps === 4 ? t('txt-confirm') : t('txt-nextStep');
  }
  getOwnerType = () => {
    const {ownerList} = this.state;

    let ownerType = [
      {
        value: 'new',
        text: t('txt-addNewOwner')
      }
    ];

    if (!_.isEmpty(ownerList)) {
      ownerType.unshift({
        value: 'existing',
        text: t('txt-existingOwner')
      });
    }

    return ownerType;
  }
  /**
   * Display add/edit IP device form content
   * @method
   * @returns HTML DOM
   */
  displayAddIpSteps = () => {
    const {contextRoot} = this.context;
    const {
      activeSteps,
      formTypeEdit,
      currentDeviceData,
      addIP,
      previewOwnerPic,
      ownerList,
      departmentList,
      titleList,
      ownerType,
      mapAreaUUID,
      currentMap,
      seatData,
      currentBaseLayers,
      floorPlan,
      addSeat,
      ownerIDduplicated
    } = this.state;
    const addIPtext = [t('txt-ipAddress'), t('alert.txt-systemInfo'), t('ipFields.owner'), t('alert.txt-floorInfo')];

    return (
      <div className='parent-content'>
        <div className='main-content basic-form'>
          <header className='main-header'>{t('alert.txt-ipBasicInfo')}</header>
          <div className='steps-indicator'>
            {addIPtext.map(this.showAddIpSteps)}
          </div>
          {activeSteps === 1 &&
            <div className='form-group steps-address'>
              <header>{t('txt-ipAddress')}</header>
              <div className='group'>
                <label htmlFor='addIPstepsIP'>{t('ipFields.ip')}</label>
                <Input
                  id='addIPstepsIP'
                  required={true}
                  validate={{
                    pattern: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
                    patternReadable: 'xxx.xxx.xxx.xxx',
                    t: et
                  }}
                  onChange={this.handleAddIpChange.bind(this, 'ip')}
                  value={addIP.ip} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsMac'>{t('ipFields.mac')}</label>
                <Input
                  id='addIPstepsMac'
                  required={true}
                  validate={{
                    pattern: /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i,
                    patternReadable: '1)MM:MM:MM:SS:SS:SS 2)MM-MM-MM-SS-SS-SS',
                    t: et
                  }}
                  onChange={this.handleAddIpChange.bind(this, 'mac')}
                  value={addIP.mac} />
              </div>
            </div>
          }
          {activeSteps === 2 &&
            <div className='form-group steps-host'>
              <header>{t('alert.txt-systemInfo')}</header>
              <div className='group'>
                <label htmlFor='addIPstepsHostname'>{t('ipFields.hostName')}</label>
                <Input
                  id='addIPstepsHostname'
                  onChange={this.handleAddIpChange.bind(this, 'hostName')}
                  value={addIP.hostName}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsHostID'>{t('ipFields.hostID')}</label>
                <Input
                  id='addIPstepsHostID'
                  value={addIP.hostID}
                  readOnly={true} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsSystem'>{t('ipFields.system')}</label>
                <Input
                  id='addIPstepsSystem'
                  onChange={this.handleAddIpChange.bind(this, 'system')}
                  value={addIP.system}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsDeviceType'>{t('ipFields.deviceType')}</label>
                <Input
                  id='addIPstepsDeviceType'
                  onChange={this.handleAddIpChange.bind(this, 'deviceType')}
                  value={addIP.deviceType}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsUser'>{t('ipFields.owner')}</label>
                <Input
                  id='addIPstepsUser'
                  onChange={this.handleAddIpChange.bind(this, 'userName')}
                  value={addIP.userName}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsCPU'>{t('txt-cpu')}</label>
                <Input
                  id='addIPstepsCPU'
                  onChange={this.handleAddIpChange.bind(this, 'cpu')}
                  value={addIP.cpu}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsRam'>{t('txt-ram')}</label>
                <Input
                  id='addIPstepsRam'
                  onChange={this.handleAddIpChange.bind(this, 'ram')}
                  value={addIP.ram}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsDisks'>{t('txt-disks')}</label>
                <Textarea
                  id='addIPstepsDisks'
                  rows={3}
                  onChange={this.handleAddIpChange.bind(this, 'disks')}
                  value={addIP.disks}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsFolders'>{t('txt-shareFolders')}</label>
                <Textarea
                  id='addIPstepsFolders'
                  rows={3}
                  onChange={this.handleAddIpChange.bind(this, 'shareFolders')}
                  value={addIP.shareFolders}
                  readOnly={currentDeviceData.isHmd} />
              </div>
            </div>
          }
          {activeSteps === 3 &&
            <div className='form-group steps-owner'>
              <header>{t('ipFields.owner')}</header>
              <RadioGroup
                className='owner-type'
                list={this.getOwnerType()}
                onChange={this.handleOwnerTypeChange}
                value={ownerType} />
              {ownerType === 'new' &&
                <button className='standard manage' onClick={this.openManage}>{t('txt-manageDepartmentTitle')}</button>
              }
              <div className='user-pic'>
                {ownerType === 'new' &&
                  <div className='group'>
                    <label htmlFor='ownerPhotoUpload'>{t('txt-uploadPhoto')}</label>
                    <FileInput
                      id='ownerPhotoUpload'
                      name='file'
                      btnText={t('txt-uploadPhoto')}
                      validate={{
                        max: 10,
                        extension: ['.jpg', '.jpeg', '.png'],
                        t: (code, params) => {
                          if (code[0] === 'file-wrong-format') {
                            return t('txt-file-format-error') + ` ${params.extension}`
                          }
                        }
                      }}
                      onChange={this.handleAddIpChange.bind(this, 'file')} />
                  </div>
                }
                <div className='group'>
                  {ownerType === 'existing' && addIP.ownerPic && !_.isEmpty(ownerList) &&
                    <img src={addIP.ownerPic} className='existing' title={t('network-topology.txt-profileImage')} />
                  }
                  {ownerType === 'new' && previewOwnerPic &&
                    <img src={previewOwnerPic} title={t('network-topology.txt-profileImage')} />
                  }
                  {ownerType === 'existing' && !addIP.ownerPic && !_.isEmpty(ownerList) &&
                    <img src={contextRoot + '/images/empty_profile.png'} className={cx({'existing': ownerType === 'existing'})} title={t('network-topology.txt-profileImage')} />
                  }
                  {ownerType === 'new' && !previewOwnerPic &&
                    <img src={contextRoot + '/images/empty_profile.png'} className={cx({'existing': ownerType === 'existing'})} title={t('network-topology.txt-profileImage')} />
                  }
                </div>
              </div>
              <div className='user-info'>
                {ownerType === 'existing' && !_.isEmpty(ownerList) &&
                  <div className='group'>
                    <label htmlFor='addIPstepsOwnerName'>{t('ownerFields.ownerName')}</label>
                    <DropDownList
                      id='addIPstepsOwnerName'
                      list={ownerList}
                      required={true}
                      onChange={this.handleOwnerChange}
                      value={addIP.ownerUUID} />
                  </div>
                }
                {ownerType === 'new' &&
                  <div className='group'>
                    <label htmlFor='addIPstepsOwnerName'>{t('ownerFields.ownerName')}</label>
                    <Input
                      id='addIPstepsOwnerName'
                      onChange={this.handleAddIpChange.bind(this, 'newOwnerName')}
                      required={true}
                      validate={{
                        t: et
                      }}
                      value={addIP.newOwnerName} />
                  </div>
                }
                {ownerType === 'existing' && !_.isEmpty(ownerList) &&
                <div className='group'>
                  <label htmlFor='addIPstepsOwnerID'>{t('ownerFields.ownerID')}</label>
                  <Input
                    id='addIPstepsOwnerID'
                    readOnly={true}
                    value={addIP.ownerID} />
                </div>
                }
                {ownerType === 'new' &&
                  <div className='group'>
                    <label htmlFor='addIPstepsOwnerID'>{t('ownerFields.ownerID')}</label>
                    <Input
                      id='addIPstepsOwnerID'
                      className={cx({'invalid': ownerIDduplicated})}
                      onChange={this.handleAddIpChange.bind(this, 'newOwnerID')}
                      required={true}
                      validate={{
                        t: et
                      }}
                      value={addIP.newOwnerID} />
                  </div>
                }
                {ownerType === 'existing' && !_.isEmpty(ownerList) &&
                  <div className='group'>
                    <label htmlFor='addIPstepsDepartment'>{t('ownerFields.department')}</label>
                    <Input
                      id='addIPstepsDepartment'
                      readOnly={true}
                      value={addIP.department} />
                  </div>
                }
                {ownerType === 'new' &&
                  <div className='group'>
                    <label htmlFor='addIPstepsDepartment'>{t('ownerFields.department')}</label>
                    <DropDownList
                      id='addIPstepsDepartment'
                      list={departmentList}
                      required={true}
                      validate={{t: et}}
                      onChange={this.handleDepartmentChange}
                      value={addIP.newDepartment} />
                  </div>
                }
                {ownerType === 'existing' && !_.isEmpty(ownerList) &&
                  <div className='group'>
                    <label htmlFor='addIPstepsTitle'>{t('ownerFields.title')}</label>
                    <Input
                      id='addIPstepsTitle'
                      readOnly={true}
                      value={addIP.title} />
                  </div>
                }
                {ownerType === 'new' &&
                  <div className='group'>
                    <label htmlFor='addIPstepsTitle'>{t('ownerFields.title')}</label>
                    <DropDownList
                      id='addIPstepsTitle'
                      list={titleList}
                      required={true}
                      onChange={this.handleTitleChange}
                      value={addIP.newTitle} />
                  </div>
                }
              </div>
            </div>
          }
          {activeSteps === 4 &&
            <div className='form-group steps-floor'>
              <header>{t('alert.txt-floorInfo')}</header>
              <button className='standard manage' onClick={this.openFloorMap}>{t('network-inventory.txt-editFloorMap')}</button>
              <div className='floor-info'>
                <div className='tree'>
                  {floorPlan.treeData && floorPlan.treeData.length > 0 &&
                    floorPlan.treeData.map(this.displayTree)
                  }
                </div>
                <div className='map'>
                  {currentMap.label &&
                    <Gis
                      _ref={(ref) => {this.gisNode = ref}}
                      data={_.get(seatData, [mapAreaUUID, 'data'], [])}
                      baseLayers={currentBaseLayers}
                      baseLayer={mapAreaUUID}
                      layouts={['standard']}
                      dragModes={['pan']}
                      scale={{enabled: false}}
                      selected={[addSeat.selectedSeatUUID]}
                      defaultSelected={[currentDeviceData.seatUUID]}
                      onClick={this.handleFloorMapClick} />
                  }
                </div>
              </div>
            </div>
          }
          <footer>
            <button className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</button>
            {activeSteps > 1 &&
              <button className='standard previous-step' onClick={this.toggleSteps.bind(this, 'previous')}>{t('txt-previousStep')}</button>
            }
            <button className='next-step' onClick={this.toggleSteps.bind(this, 'next')}>{this.getBtnText()}</button>
          </footer>
        </div>
      </div>
    )
  }
  /**
   * Get default opened floor plan map
   * @method
   * @param {string} selectedID - selected area UUID
   * @returns default opened areaRoute array IDs
   */
  getDefaultFloor = (selectedID) => {
    const {floorPlan} = this.state;
    let areaRoute = '';

    _.forEach(floorPlan.treeData, val => {
      helper.floorPlanRecursive(val, obj => {
        if (obj.areaUUID === selectedID) {
          areaRoute = obj.areaRoute
        }
      });
    })

    areaRoute = areaRoute.split(',');
    return areaRoute;
  }
  /**
   * Handle floor plan tree node select
   * @method
   * @param {number} i - index of the tree data
   * @param {string} areaUUID - selected area UUID
   * @param {object} eventData - tree click events data
   */
  selectTree = (i, areaUUID, eventData) => {
    let tempFloorPlan = {...this.state.floorPlan};
    let tempArr = [];
    let pathStr = '';
    let pathNameStr = '';
    let pathParentStr = '';

    if (eventData.path.length > 0) {
      _.forEach(eventData.path, val => {
        if (val.index >= 0) {
          tempArr.push(val.index);
        }
      })
    }

    _.forEach(tempArr, val => {
      pathStr += 'children[' + val + '].'
    })

    pathNameStr = pathStr + 'label';
    pathParentStr = pathStr + 'parentAreaUUID';

    if (eventData.path[0].id) {
      tempFloorPlan.rootAreaUUID = eventData.path[0].id;
    }
    tempFloorPlan.currentAreaUUID = areaUUID;
    tempFloorPlan.currentAreaName = _.get(tempFloorPlan.treeData[i], pathNameStr);
    tempFloorPlan.currentParentAreaUUID = _.get(tempFloorPlan.treeData[i], pathParentStr);
    tempFloorPlan.name = tempFloorPlan.currentAreaName;
    tempFloorPlan.type = 'edit';

    this.setState({
      floorPlan: tempFloorPlan
    }, () => {
      this.getAreaData(areaUUID);
      this.getSeatData(areaUUID);
    });
  }
  /**
   * Display floor tree data
   * @method
   * @param {object} value - floor plan data
   * @param {string} selectedID - selected area UUID
   * @param {number} i - index of the floor plan data
   * @returns TreeView component
   */
  getTreeView = (value, selectedID, i) => {
    return (
      <TreeView
        id={value.areaUUID}
        key={value.areaUUID}
        data={value}
        selected={selectedID}
        defaultSelected={selectedID}
        defaultOpened={this.getDefaultFloor(selectedID)}
        onSelect={this.selectTree.bind(this, i)} />
    )
  }
  /**
   * Handle floor tree data
   * @method
   * @param {object} val - floor plan data
   * @param {number} i - index of the floor plan data
   * @returns content of TreeView component
   */
  displayTree = (val, i) => {
    const {floorPlan, currentDeviceData} = this.state;
    let currentAreaUUID = '';

    if (currentDeviceData && currentDeviceData.seatUUID) {
      currentAreaUUID = currentDeviceData.areaUUID;
    } else {
      currentAreaUUID = floorPlan.currentAreaUUID;
    }

    return this.getTreeView(val, currentAreaUUID, i);
  }
  /**
   * Handle floor map mouse click
   * @method
   * @param {string} id - existing seat ID
   * @param {object} info - mouseClick events
   */
  handleFloorMapClick = (id, info) => {
    const {addSeat} = this.state;
    let tempAddSeat = {...addSeat};

    if (id) {
      tempAddSeat.selectedSeatUUID = id;

      this.setState({
        addSeat: tempAddSeat
      });
    } else {
      tempAddSeat.coordX = Math.round(info.xy.x);
      tempAddSeat.coordY = Math.round(info.xy.y);

      this.setState({
        addSeatOpen: true,
        addSeat: tempAddSeat
      });
    }
  }
  /**
   * Handle add seat input value change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleDataChange = (type, value) => {
    let tempAddSeat = {...this.state.addSeat};
    tempAddSeat[type] = value;

    this.setState({
      addSeat: tempAddSeat
    });
  }
  /**
   * Display add seat contnt
   * @method
   * @returns HTML DOM
   */
  displayAddSeat = () => {
    const {addSeat} = this.state;

    return (
      <div className='add-seat'>
        <label htmlFor='addAreaSeat'>{t('txt-name')}</label>
        <Input
          id='addAreaSeat'
          onChange={this.handleDataChange.bind(this, 'name')}
          value={addSeat.name} />
      </div>
    )
  }
  /**
   * Display add seat modal dialog
   * @method
   * @returns ModalDialog component
   */
  addSeatDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog},
      confirm: {text: t('txt-confirm'), handler: this.handleAddSeatConfirm}
    };
    const titleText = t('network-topology.txt-addSeat');

    return (
      <ModalDialog
        id='addSeatDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayAddSeat()}
      </ModalDialog>
    )
  }
  /**
   * Handle add seat confirm
   * @method
   */
  handleAddSeatConfirm = () => {
    const {baseUrl} = this.context;
    const {floorPlan, addSeat} = this.state;
    const url = `${baseUrl}/api/seat`;
    const requestData = {
      areaUUID: floorPlan.currentAreaUUID,
      seatName: addSeat.name,
      coordX: addSeat.coordX,
      coordY: addSeat.coordY
    };

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      if (data) {
        this.setState({
          addSeatOpen: false,
          addSeat: {
            selectedSeatUUID: data,
            name: '',
            coordX: '',
            coordY: ''
          }
        }, () => {
          this.getAreaData(floorPlan.currentAreaUUID);
          this.getSeatData(floorPlan.currentAreaUUID);
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'));
    });
  }
  /**
   * Handle Add IP form input value change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleAddIpChange = (type, value) => {
    let tempAddIP = {...this.state.addIP};
    tempAddIP[type] = value;

    if (type === 'file') {
      const file = value ? URL.createObjectURL(value) : '';

      this.setState({
        previewOwnerPic: file
      });
    }

    this.setState({
      addIP: tempAddIP
    });
  }
  /**
   * Get Auto and Manual buttons position
   * @method
   * @param {string} type - button type
   * @returns width
   */
  getBtnPos = (type) => {
    const {locale} = this.context;

    if (type === 'auto') {
      if (locale === 'zh') {
        return '120px';
      } else if (locale === 'en') {
        return '200px';
      }
    } else if (type === 'manual') {
      if (locale === 'zh') {
        return '257px';
      } else if (locale === 'en') {
        return '336px';
      }
    }
  }
  render() {
    const {contextRoot} = this.context;
    const {
      activeTab,
      activeContent,
      showFilter,
      showScanInfo,
      showSeatData,
      modalFloorOpen,
      modalIRopen,
      addSeatOpen,
      deviceData,
      currentDeviceData,
      floorPlan,
      alertInfo,
      activeIPdeviceUUID,
      mapAreaUUID,
      currentMap,
      seatData,
      currentBaseLayers,
      activeSteps,
      addIP
    } = this.state;
    const picPath = (currentDeviceData.ownerObj && currentDeviceData.ownerObj.base64) ? currentDeviceData.ownerObj.base64 : contextRoot + '/images/empty_profile.png';
    const backText = activeTab === 'deviceList' ? t('network-inventory.txt-backToList') : t('network-inventory.txt-backToMap')

    return (
      <div>
        {showScanInfo &&
          this.showScanInfo()
        }

        {showSeatData &&
          this.showSeatData()
        }

        {modalFloorOpen &&
          this.modalFloorDialog()
        }

        {modalIRopen &&
          this.irSelectionDialog()
        }

        {addSeatOpen &&
          this.addSeatDialog()
        }

        <Manage
          ref={ref => { this.manage = ref }}
          onDone={this.getOtherData} />

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            {activeTab === 'deviceList' &&
              <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('events.connections.txt-toggleFilter')} disabled={activeContent !== 'tableList'}><i className='fg fg-filter'></i></button>
            }
          </div>
        </div>

        <div className='data-content'>
          <Config />

          {activeContent === 'tableList' &&
            <div className='parent-content'>
              {activeTab === 'deviceList' &&
                this.renderFilter()
              }

              <div className='main-content'>
                <Tabs
                  className='subtab-menu'
                  menu={{
                    deviceList: t('network-inventory.txt-deviceList'),
                    deviceMap: t('network-inventory.txt-deviceMap')
                  }}
                  current={activeTab}
                  onChange={this.handleSubTabChange}>
                </Tabs>

                <button className='standard btn last'><Link to='/SCP/configuration/notifications'>{t('notifications.txt-settings')}</Link></button>
                <button className='standard btn' style={{right: this.getBtnPos('auto')}} onClick={this.toggleContent.bind(this, 'showAuto')}>{t('network-inventory.txt-autoSettings')}</button>
                <button className='standard btn' style={{right: this.getBtnPos('manual')}} onClick={this.toggleContent.bind(this, 'showForm', 'new')}>{t('network-inventory.txt-AddIP')}</button>

                {activeTab === 'deviceList' &&
                  <TableContent
                    dataTableData={deviceData.dataContent}
                    dataTableFields={deviceData.dataFields}
                    dataTableSort={deviceData.sort}
                    paginationTotalCount={deviceData.totalCount}
                    paginationPageSize={deviceData.pageSize}
                    paginationCurrentPage={deviceData.currentPage}
                    currentTableID={activeIPdeviceUUID}
                    tableUniqueID='ipDeviceUUID'
                    handleTableSort={this.handleTableSort}
                    paginationPageChange={this.handlePaginationChange}
                    paginationDropDownChange={this.handlePageDropdown} />
                }

                {activeTab === 'deviceMap' &&
                  <div className='inventory-map'>
                    <div className='tree'>
                      {floorPlan.treeData && floorPlan.treeData.length > 0 &&
                        floorPlan.treeData.map(this.displayTree)
                      }
                    </div>
                    <div className='map'>
                      {currentMap.label &&
                        <Gis
                          _ref={(ref) => {this.gisNode = ref}}
                          data={_.get(seatData, [mapAreaUUID, 'data'], [])}
                          baseLayers={currentBaseLayers}
                          baseLayer={mapAreaUUID}
                          layouts={['standard']}
                          dragModes={['pan']}
                          scale={{enabled: false}}
                          onClick={this.getDeviceData.bind(this, '', 'oneSeat')} />
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          {activeContent === 'dataInfo' &&
            <div className='parent-content'>
              <div className='main-content'>
                <div className='privateIp-info'>
                  <header className='main-header'>{t('alert.txt-ipBasicInfo')}</header>
                  <button className='standard btn edit' onClick={this.toggleContent.bind(this, 'showForm', 'edit')}>{t('txt-edit')}</button>
                  <button className='standard btn list' onClick={this.toggleContent.bind(this, 'showList')}>{backText}</button>
                  <PrivateDetails
                    alertInfo={alertInfo}
                    topoInfo={currentDeviceData}
                    picPath={picPath}
                    triggerTask={this.triggerTask} />
                </div>
              </div>
            </div>
          }

          {activeContent === 'addIPsteps' &&
            this.displayAddIpSteps()
          }

          {activeContent === 'autoSettings' &&
            <AutoSettings
              toggleContent={this.toggleContent} />
          }
        </div>
      </div>
    )
  }
}

NetworkInventory.contextType = BaseDataContext;

NetworkInventory.propTypes = {
};

const HocNetworkInventory = withRouter(withLocale(NetworkInventory));
export { NetworkInventory, HocNetworkInventory };