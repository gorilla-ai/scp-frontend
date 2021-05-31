import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'
import jschardet from 'jschardet'
import queryString from 'query-string'
import XLSX from 'xlsx'

import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import TextField from '@material-ui/core/TextField'
import TreeItem from '@material-ui/lab/TreeItem'
import TreeView from '@material-ui/lab/TreeView'

import {analyze} from 'vbda-ui/build/src/analyzer'
import {config as configLoader} from 'vbda-ui/build/src/loader'
import DataTable from 'react-ui/build/src/components/table'
import {downloadWithForm} from 'react-ui/build/src/utils/download'
import FileInput from 'react-ui/build/src/components/file-input'
import Gis from 'react-gis/build/src/components'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import VbdaLA from 'vbda-ui/build/src/components/analysis/la'

import AutoSettings from './auto-settings'
import {BaseDataContext} from '../../common/context'
import Config from '../../common/configuration'
import FileUpload from '../../common/file-upload'
import FilterContent from '../../common/filter-content'
import FloorMap from '../../common/floor-map'
import helper from '../../common/helper'
import IrSelections from '../../common/ir-selections'
import Manage from './manage'
import MuiTableContent from '../../common/mui-table-content'
import Pagination from '../../common/pagination'
import PrivateDetails from '../../common/private-details'
import YaraRule from '../../common/yara-rule'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const IP_PATTERN = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
const MAC_PATTERN = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i;
const NOT_AVAILABLE = 'N/A';

let t = null;
let f = null;
let et = null;

/**
 * Network Topology Inventory
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Network Topology Inventory page
 */
class NetworkInventory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'deviceList', //'deviceList', 'deviceMap' or 'deviceLA'
      activeContent: 'tableList', //'tableList', 'dataInfo', 'addIPsteps' or 'autoSettings'
      showFilter: false,
      showSeatData: false,
      modalFloorOpen: false,
      modalIRopen: false,
      addSeatOpen: false,
      uploadOpen: false,
      openManage: false,
      formTypeEdit: true,
      contextAnchor: null,
      menuType: '',
      LAconfig: {},
      deviceEventsDataList: {},
      deviceEventsData: {},
      eventsDateList: [],
      eventsDate: '',
      deviceLAdata: {},
      deviceSearch: {
        ip: '',
        mac: '',
        hostName: '',
        system: '',
        owner: '',
        areaName: '',
        seatName: ''
      },
      showAllSeats: false,
      deviceSearchArea: '',
      deviceData: {
        dataFieldsArr: ['ip', 'mac', 'hostName', 'system', 'owner', 'areaName', 'seatName', '_menu'],
        dataFields: [],
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
        hmdOnly: {
          dataContent: [],
          currentIndex: '',
          currentLength: ''
        }
      },
      currentDeviceData: {},
      floorList: [],
      mapAreaUUID: '',
      currentMap: '',
      currentBaseLayers: {},
      currentSeatData: {},
      originalSeatData: [],
      deviceSeatData: {},
      allAssignedDeviceData: [],
      allAssignedDeviceList: [],
      assignedDevice: '',
      ownerList: [],
      ownerListDropDown: [],
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
      ownerInfo: {
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
      ownerType: 'existing', //'existing' or 'new'
      ownerIDduplicated: false,
      previewOwnerPic: '',
      changeAreaMap: false,
      csvData: [],
      tempCsvData: [],
      showCsvData: false,
      csvColumns: {
        ip: '',
        mac: '',
        hostName: ''
      },
      selectedTreeID: '',
      floorMapType: '', //'fromFloorMap' or 'selected'
      csvHeader: true,
      ipUploadFields: ['ip', 'mac', 'hostName', 'errCode'],
      showGlobalLoadingIcon: false,
      showLoadingIcon: false,
      formValidation: {
        ip: {
          valid: true,
          msg: ''
        },
        mac: {
          valid: true,
          msg: ''
        },
        newOwnerName: {
          valid: true,
          msg: ''
        },
        newOwnerID: {
          valid: true,
          msg: ''
        },
        csvColumnsIp: {
          valid: true
        },
        seatName: {
          valid: true
        },
        hostName: {
          valid: true
        },
        system: {
          valid: true
        },
        deviceType: {
          valid: true
        }
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;
    const inventoryParam = queryString.parse(location.search);

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.getLAconfig();
    this.getOwnerData();
    this.getOtherData();

    if (_.isEmpty(inventoryParam) || (!_.isEmpty(inventoryParam) && !inventoryParam.ip)) {
      this.getDeviceData();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state === 'tableList') {
      this.toggleContent('showList');
    }
  }
  /**
   * Get and set the Link Analysis config
   * @method
   */
  getLAconfig = () => {
    const {baseUrl} = this.context;

    helper.getLAconfig(baseUrl)
    .then(data => {
      if (!_.isEmpty(data)) {
        this.setState({
          LAconfig: configLoader.processAll(data)
        });
      }
      return null;
    });
  }
  /**
   * Get and set owner data
   * @method
   */
  getOwnerData = () => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/owner/_search`;
    const requestData = {
      sort: 'ownerID',
      order: 'asc'
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        if (data.rows.length > 0) {
          let ownerList = _.map(data.rows, val => {
            return {
              value: val.ownerUUID,
              text: val.ownerName
            };
          });
          ownerList = _.orderBy(ownerList, ['text'], ['asc']);

          let ownerListDropDown = _.orderBy(data.rows, ['ownerName'], ['asc']);
          ownerListDropDown = _.map(ownerListDropDown, (val, i) => {
            return <MenuItem key={i} value={val.ownerUUID}>{val.ownerName}</MenuItem>
          });

          this.setState({
            ownerList,
            ownerListDropDown
          });
        } else {
          this.setState({
            ownerType: 'new'
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
   * Get and set Department and Title data
   * @param {string} options - option for calling type
   * @method
   */
  getOtherData = (options) => {
    const {baseUrl} = this.context;
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
      if (data) {
        let departmentList = [];
        let titleList = [];
        let tempAddIP = {...this.state.addIP};

        if (data[0].length > 0) {
          departmentList = _.map(data[0], (val, i) => {
            return <MenuItem key={i} value={val.nameUUID}>{val.name}</MenuItem>
          });
          tempAddIP.newDepartment = departmentList[0].value;
        } else {
          tempAddIP.newDepartment = '';
        }

        if (data[1].length > 0) {
          titleList = _.map(data[1], (val, i) => {
            return <MenuItem key={i} value={val.nameUUID}>{val.name}</MenuItem>
          });
          tempAddIP.newTitle = titleList[0].value;
        } else {
          tempAddIP.newTitle = '';
        }

        this.setState({
          departmentList,
          titleList,
          addIP: tempAddIP
        });

        this.getFloorPlan(options);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
          this.getFloorList();
        });
      } else {
        this.getInventoryEdit(options);
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
   * @param {string} [options] - option for 'loadDefault'
   */
  getFloorList = (options) => {
    const {deviceSearch, floorPlan} = this.state;
    let floorList = [];

    _.forEach(floorPlan.treeData, val => {
      helper.floorPlanRecursive(val, obj => {
        floorList.push({
          value: obj.areaUUID,
          text: obj.areaName
        });
      });
    })

    this.setState({
      floorList
    }, () => {
      if (options === 'loadDefault' || !deviceSearch.areaName) {
        this.setState({
          deviceSearchArea: '',
          floorMapType: ''
        });
        this.getAreaData(floorList[0].value);
        this.getDeviceSeatData(floorList[0].value);
      } else {
        this.getDeviceSearchArea(deviceSearch.areaName);
      }

      this.getInventoryEdit();
    });
  }
  /**
   * Get and set device search area
   * @method
   * @param {string} areaName - area UUID
   */
  getDeviceSearchArea = (areaName) => {
    const {baseUrl, contextRoot} = this.context;
    const requestData = {
      areaName
    };

    this.ah.one({
      url: `${baseUrl}/api/area/_search`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        if (data.length > 0) {
          this.setState({
            deviceSearchArea: data[0].areaUUID
          });

          this.getAreaData(data[0].areaUUID);
          this.getDeviceSeatData(data[0].areaUUID);
        } else {
          this.getFloorList('loadDefault');
        }
      }
      return null;
    })
  }
  /**
   * Get and set individual floor area data
   * @method
   * @param {string} areaUUID - area UUID
   */
  getAreaData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.context;
    const {deviceSearch} = this.state;
    const mapAreaUUID = areaUUID.trim();

    this.ah.one({
      url: `${baseUrl}/api/area?uuid=${mapAreaUUID}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
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

        const currentBaseLayers = {
          [mapAreaUUID]: currentMap
        };

        this.setState({
          mapAreaUUID,
          currentMap,
          currentBaseLayers
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set seat data with or without device
   * @method
   * @param {string} areaUUID - area UUID
   */
  getDeviceSeatData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.context;
    const {activeTab, deviceSearch, showAllSeats} = this.state;
    const area = areaUUID || this.state.floorPlan.currentAreaUUID;
    let requestData = {
      areaUUID: area
    };

    if (!_.isEmpty(deviceSearch) && !showAllSeats) {
      if (deviceSearch.ip) {
        requestData.ip = deviceSearch.ip;
      }

      if (deviceSearch.mac) {
        requestData.mac = deviceSearch.mac;
      }

      if (deviceSearch.hostName) {
        requestData.hostName = deviceSearch.hostName;
      }

      if (deviceSearch.system) {
        requestData.system = deviceSearch.system;
      }

      if (deviceSearch.owner) {
        requestData.ownerName = deviceSearch.owner;
      }

      if (deviceSearch.areaName) {
        requestData.areaName = deviceSearch.areaName;
      }

      if (deviceSearch.seatName) {
        requestData.seatName = deviceSearch.seatName;
      }
    }

    this.ah.one({
      url: `${baseUrl}/api/v2/seat/_search`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let deviceSeatData = {};
        let seatListArr = [];

        _.forEach(data.rows, val => {
          let icon = 'ic_person';

          if (activeTab === 'deviceMap' && !_.isEmpty(val.devices)) {
            icon = 'ic_person_device';
          }

          seatListArr.push({
            id: val.seatUUID,
            type: 'marker',
            xy: [val.coordX, val.coordY],
            icon: {
              iconUrl: `${contextRoot}/images/${icon}.png`,
              iconSize: [25, 25],
              iconAnchor: [12.5, 12.5]
            },
            label: val.seatName,
            data: {
              name: val.seatName
            }
          });
        })

        deviceSeatData[area] = {
          data: seatListArr
        };

        this.setState({
          originalSeatData: data.rows,
          deviceSeatData,
          showLoadingIcon: false
        });
      }
      return null;
    })
  }
  /**
   * Toggle content to show edit page
   * @param {string} [options] - option for calling type
   * @method
   */
  getInventoryEdit = (options) => {
    const inventoryParam = queryString.parse(location.search);
    const type = inventoryParam.type;
    const ip = inventoryParam.ip;

    if (type) {
      if (type === 'add') {
        this.toggleContent('showForm', 'new');
      } else if (type === 'edit' && ip) {
        this.getSingleDeviceData(ip);
      }
    } else {
      if (options === 'deviceMap') {
        helper.showPopupMsg(t('txt-notFound')); //Show not found message
      }
    }
  }
  /**
   * Get single device data from URL parameter
   * @param {string} ip - IP from page redirect
   * @method
   */
  getSingleDeviceData = (ip) => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/v3/ipdevice/_search?ip=${ip}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let currentDeviceData = {
          ip
        };

        if (data.counts > 0) {
          currentDeviceData = data.rows[0];
        }

        this.setState({
          currentDeviceData
        }, () => {
          this.toggleContent('showForm', 'edit');
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable field
   */
  checkSortable = (field) => {
    const unSortableFields = ['owner', 'areaName', 'seatName', 'yaraScan', '_menu'];

    if (_.includes(unSortableFields, field)) {
      return false;
    } else {
      return true;
    }
  }
  /**
   * Get and set device data / Handle delete IP device confirm
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   * @param {string} [options] - options for 'oneSeat', 'delete', 'previous' or 'next'
   * @param {string} [seatUUID] - seat UUID
   */
  getDeviceData = (fromPage, options, seatUUID) => {
    const {baseUrl, contextRoot} = this.context;
    const {deviceSearch, deviceData, currentDeviceData, originalSeatData} = this.state;
    const page = fromPage === 'currentPage' ? deviceData.currentPage : 0;
    let dataParams = '';

    if (options === 'oneSeat') {
      dataParams += `&seatUUID=${seatUUID}`;
    } else if (options === 'delete' && !currentDeviceData.ipDeviceUUID) {
      return;
    } else {
      const pageSize = deviceData.pageSize;
      const sort = deviceData.sort.desc ? 'desc' : 'asc';
      const orders = deviceData.sort.field + ' ' + sort;

      dataParams += `&page=${page + 1}&pageSize=${pageSize}&orders=${orders}`;
    }

    if (!_.isEmpty(deviceSearch)) {
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

    let apiArr = [{
      url: `${baseUrl}/api/v3/ipdevice/_search?${dataParams}`,
      type: 'GET'
    }];

    //Combine the two APIs to show the loading icon
    if (options === 'delete') { //For deleting device
      apiArr.unshift({
        url: `${baseUrl}/api/u1/ipdevice?uuid=${currentDeviceData.ipDeviceUUID}`,
        type: 'DELETE'
      });
    }

    ah.series(apiArr)
    .then(data => {
      let ipRt = '';
      let ipData = '';

      if (options === 'delete') {
        ipRt = data[1].ret;
        ipData = data[1].rt;

        if (data[0] && data[0].ret === 0) {
          this.closeFloorDialog('reload');
        }
      } else {
        ipRt = data[0].ret;
        ipData = data[0].rt;
      }

      if (ipRt === 0) {
        let tempDeviceData = {...deviceData};

        if (options === 'oneSeat') {
          let currentSeatData = {};
          let currentDeviceData = {};

          if (ipData.counts > 0) {
            const allAssignedDeviceList = _.map(ipData.rows, (val, i) => {
              return <MenuItem key={i} value={val.ip}>{val.ip}</MenuItem>
            });
            currentDeviceData = ipData.rows[0];

            this.setState({
              allAssignedDeviceData: ipData.rows,
              allAssignedDeviceList,
              assignedDevice: ipData.rows[0].ip
            });
          } else {
            _.forEach(originalSeatData, val => {
              if (val.seatUUID === seatUUID) {
                currentSeatData = val;
              }
            })
          }

          this.setState({
            showSeatData: true,
            currentSeatData,
            currentDeviceData
          });
          return null;
        }

        if (ipData.counts === 0) {
          tempDeviceData.dataContent = [];
          helper.showPopupMsg(t('txt-notFound'));

          this.setState({
            deviceData: tempDeviceData
          });
          return null;
        }

        tempDeviceData.dataContent = _.map(ipData.rows, item => {
          return {
            ...item,
            _menu: true
          };
        });

        tempDeviceData.totalCount = ipData.counts;
        tempDeviceData.currentPage = page;

        //HMD only
        let hmdDataOnly = [];

        _.forEach(ipData.rows, val => {
          if (val.isHmd) {
            hmdDataOnly.push(val);
          }
        });

        tempDeviceData.hmdOnly.dataContent = hmdDataOnly;
        tempDeviceData.hmdOnly.currentIndex = 0;
        tempDeviceData.hmdOnly.currentLength = hmdDataOnly.length;
        tempDeviceData.dataFields = _.map(deviceData.dataFieldsArr, val => {
          return {
            name: val,
            label: val === '_menu' ? ' ' : t(`ipFields.${val}`),
            options: {
              sort: this.checkSortable(val),
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex, options) => {
                const allValue = tempDeviceData.dataContent[dataIndex];
                const value = tempDeviceData.dataContent[dataIndex][val];

                if (options === 'getAllValue') {
                  return allValue;
                }

                if (val === 'owner') {
                  if (allValue.ownerObj) {
                    return <span>{allValue.ownerObj.ownerName}</span>
                  } else {
                    return <span>{value}</span>
                  }
                } else if (val === 'areaName') {
                  if (allValue.areaObj) {
                    return <span>{allValue.areaObj.areaName}</span>
                  }
                } else if (val === 'seatName') {
                  if (allValue.seatObj) {
                    return <span>{allValue.seatObj.seatName}</span>
                  }
                } else if (val === '_menu') {
                  return (
                    <div className='table-menu menu active'>
                      <i className='fg fg-eye' onClick={this.getOwnerSeat.bind(this, allValue)} title={t('network-inventory.txt-viewDevice')}></i>
                      <i className='fg fg-trashcan' onClick={this.openDeleteDeviceModal.bind(this, allValue)} title={t('network-inventory.txt-deleteDevice')}></i>
                    </div>
                  )
                } else {
                  return value;
                }
              }
            }
          };
        });

        if (ipData.rows.length > 0) {
          let ipListArr = [];

          _.forEach(ipData.rows, val => {
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
        }, () => {
          if (options === 'previous' || options === 'next') {
            this.showAlertData('', options);
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
   * Handle CSV download
   * @method
   */
  getCSVfile = () => {
    const {baseUrl, contextRoot} = this.context;
    const {deviceSearch} = this.state;
    const url = `${baseUrl}${contextRoot}/api/ipdevice/_export`;
    const requestData = {
      ip: deviceSearch.ip,
      mac: deviceSearch.mac,
      hostName: deviceSearch.hostName,
      system: deviceSearch.system,
      owner: deviceSearch.owner,
      areaName: deviceSearch.areaName,
      seatName: deviceSearch.seatName
    };

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  /**
   * Handle device dropdown change
   * @method
   * @param {object} event - event object
   */
  handleDeviceChange = (event) => {
    let currentDeviceData = {};

    _.forEach(this.state.allAssignedDeviceData, val => {
      if (val.ip === event.target.value) {
        currentDeviceData = val;
        return false;
      }
    })

    this.setState({
      currentDeviceData,
      assignedDevice: event.target.value
    });
  }
  /**
   * Display owner seat content
   * @method
   * @returns HTML DOM
   */
  displaySeatInfo = () => {
    const {currentDeviceData, currentSeatData, allAssignedDeviceList, assignedDevice} = this.state;

    if (!_.isEmpty(currentSeatData)) {
      return (
        <div>
          <div>{t('network-inventory.txt-noDevice')}</div>
          <div className='table-menu inventory active'>
            <i className='fg fg-trashcan' onClick={this.openDeleteSeatModal} title={t('network-topology.txt-deleteSeat')}></i>
          </div>
        </div>
      )
    }

    if (!_.isEmpty(currentDeviceData)) {
      const deviceInfo = {
        ip: currentDeviceData.ip,
        mac: currentDeviceData.mac,
        hostName: currentDeviceData.hostName,
        system: currentDeviceData.system
      };

      return (
        <div>
          <TextField
            id='allAssignedDevice'
            className='assigned-device'
            name='assignedDevice'
            select
            variant='outlined'
            fullWidth
            size='small'
            value={assignedDevice}
            onChange={this.handleDeviceChange}>
            {allAssignedDeviceList}
          </TextField>
          <div className='main'>{t('ipFields.ip')}: {deviceInfo.ip}</div>
          <div className='main'>{t('ipFields.mac')}: {deviceInfo.mac}</div>
          <div className='table-menu inventory active'>
            <i className='fg fg-eye' onClick={this.getOwnerSeat.bind(this, currentDeviceData)} title={t('network-inventory.txt-viewDevice')}></i>
            <i className='fg fg-trashcan' onClick={this.openDeleteDeviceModal.bind(this, currentDeviceData)} title={t('network-inventory.txt-deleteDevice')}></i>
          </div>
          <div className='main header'>{t('alert.txt-systemInfo')}</div>
          <div className='info'><span>{t('ipFields.hostName')}:</span>{deviceInfo.hostName || NOT_AVAILABLE}</div>
          <div className='info'><span>{t('ipFields.system')}:</span>{deviceInfo.system || NOT_AVAILABLE}</div>
        </div>
      )
    }
  }
  /**
   * Display owner seat modal dialog
   * @method
   * @returns ModalDialog component
   */
  showSeatDialog = () => {
    const {currentDeviceData, currentSeatData} = this.state;
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeSeatDialog}
    };
    const title = currentSeatData.seatName ? currentSeatData.seatName : currentDeviceData.seatObj.seatName;

    return (
      <ModalDialog
        id='configSeatDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displaySeatInfo()}
      </ModalDialog>
    )
  }
  /**
   * Display delete seat content
   * @method
   * @returns HTML DOM
   */
  displayDeleteSeat = () => {
    return (
      <div className='content delete'>
        <span>{t('network-topology.txt-deleteSeatMsg')}: {this.state.currentSeatData.seatName}?</span>
      </div>
    )
  }
  /**
   * Display delete seat modal dialog
   * @method
   */
  openDeleteSeatModal = () => {
    PopupDialog.prompt({
      title: t('network-topology.txt-deleteSeat'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.displayDeleteSeat(),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteSeatConfirm();
        }
      }
    });
  }
  /**
   * Handle delete seat confirm
   * @method
   */
  deleteSeatConfirm = () => {
    const {baseUrl} = this.context;
    const {currentSeatData, floorPlan} = this.state;

    ah.one({
      url: `${baseUrl}/api/seat?uuid=${currentSeatData.seatUUID}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.setState({
          showSeatData: false
        }, () => {
          this.getDeviceSeatData(floorPlan.currentAreaUUID);
        })
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Close seat dialog and reset seat data
   * @method
   */
  closeSeatDialog = () => {
    this.setState({
      showSeatData: false,
      currentDeviceData: {},
      allAssignedDeviceData: [],
      allAssignedDeviceList: [],
      assignedDevice: ''
    });
  }
  /**
   * Handle filter input value change
   * @method
   * @param {object} event - event object
   */
  handleSearchChange = (event) => {
    let tempDeviceSearch = {...this.state.deviceSearch};
    tempDeviceSearch[event.target.name] = event.target.value;

    this.setState({
      deviceSearch: tempDeviceSearch
    });
  }
  /**
   * Handle filter submit
   * @method
   */
  handleFilterSubmit = () => {
    const {activeTab, deviceSearch} = this.state;

    if (activeTab === 'deviceList') {
      this.getDeviceData();
    } else if (activeTab === 'deviceMap') {
      if (deviceSearch.areaName) {
        this.getDeviceSearchArea(deviceSearch.areaName);
      } else {
        this.getFloorList();
      }
    } else if (activeTab === 'deviceLA') {
      this.setState({
        deviceEventsData: {},
        deviceLAdata: {},
        eventsDateList: [],
        eventsDate: ''
      }, () => {
        this.loadLinkAnalysis();
      });
    }
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {activeTab, showFilter, deviceSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <TextField
              id='deviceSearchIP'
              name='ip'
              label={t('ipFields.ip')}
              variant='outlined'
              fullWidth
              size='small'
              value={deviceSearch.ip}
              onChange={this.handleSearchChange} />
          </div>
          {activeTab !== 'deviceLA' &&
            <div className='group'>
              <TextField
                id='deviceSearchMac'
                name='mac'
                label={t('ipFields.mac')}
                variant='outlined'
                fullWidth
                size='small'
                value={deviceSearch.mac}
                onChange={this.handleSearchChange} />
            </div>
          }
          {activeTab !== 'deviceLA' &&
            <div className='group'>
              <TextField
                id='deviceSearchHostName'
                name='hostName'
                label={t('ipFields.hostName')}
                variant='outlined'
                fullWidth
                size='small'
                value={deviceSearch.hostName}
                onChange={this.handleSearchChange} />
            </div>
          }
          {activeTab !== 'deviceLA' &&
            <div className='group'>
              <TextField
                id='deviceSearchSystem'
                name='system'
                label={t('ipFields.system')}
                variant='outlined'
                fullWidth
                size='small'
                value={deviceSearch.system}
                onChange={this.handleSearchChange} />
            </div>
          }
          {activeTab !== 'deviceLA' &&
            <div className='group'>
              <TextField
                id='deviceSearchOwner'
                name='owner'
                label={t('ipFields.owner')}
                variant='outlined'
                fullWidth
                size='small'
                value={deviceSearch.owner}
                onChange={this.handleSearchChange} />
            </div>
          }
          {activeTab !== 'deviceLA' &&
            <div className='group'>
              <TextField
                id='deviceSearchAreaName'
                name='areaName'
                label={t('ipFields.areaName')}
                variant='outlined'
                fullWidth
                size='small'
                value={deviceSearch.areaName}
                onChange={this.handleSearchChange} />
            </div>
          }
          {activeTab !== 'deviceLA' &&
            <div className='group'>
              <TextField
                id='deviceSearchSeatName'
                name='seatName'
                label={t('ipFields.seatName')}
                variant='outlined'
                fullWidth
                size='small'
                value={deviceSearch.seatName}
                onChange={this.handleSearchChange} />
            </div>
          }
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.handleFilterSubmit}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /**
   * Get and set owner seat data
   * @method
   * @param {object} allValue - IP device data
   */
  getOwnerSeat = (allValue) => {
    const {baseUrl, contextRoot} = this.context;
    const topoInfo = allValue;
    let ownerInfo = {
      ownerMap: {},
      ownerBaseLayers: {},
      ownerSeat: {}
    };

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

      ownerInfo.ownerMap = ownerMap;
      ownerInfo.ownerBaseLayers[topoInfo.areaUUID] = ownerMap;

      if (topoInfo.seatUUID && topoInfo.seatObj) {
        ownerInfo.ownerSeat[topoInfo.areaUUID] = {
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
    }

    this.setState({
      activeContent: 'dataInfo',
      showSeatData: false,
      currentDeviceData: topoInfo,
      ownerInfo,
      activeIPdeviceUUID: allValue.ipDeviceUUID
    });
  }
  /**
   * Handle 'previous' and 'next' buttons for HMD dialog
   * @method
   * @param {string} type - button type ('previous' or 'next')
   * @param {string} [type] - button action type ('previous' or 'next')
   */
  showAlertData = (type, btnType) => {
    const {deviceData} = this.state;
    let tempDeviceData = {...deviceData};
    let tempCurrentPage = deviceData.currentPage;

    if (type === 'previous' || type === 'next') { //For click on navigation button
      if (type === 'previous') {
        if (deviceData.hmdOnly.currentIndex === 0) { //End of the data, load previous set
          this.handlePaginationChange('currentPage', --tempCurrentPage, type);
          return;
        } else {
          tempDeviceData.hmdOnly.currentIndex--;
        }
      } else if (type === 'next') {
        if (deviceData.hmdOnly.currentLength - deviceData.hmdOnly.currentIndex === 1) { //End of the data, load next set
          this.handlePaginationChange('currentPage', ++tempCurrentPage, type);
          return;
        } else {
          tempDeviceData.hmdOnly.currentIndex++;
        }
      }
    } else if (btnType) {
      if (btnType === 'previous') {
        tempDeviceData.hmdOnly.currentIndex = deviceData.hmdOnly.currentLength - 1;
      } else if (btnType === 'next') {
        tempDeviceData.hmdOnly.currentIndex = 0;
      }
    }

    this.setState({
      deviceData: tempDeviceData,
      showSeatData: false
    }, () => {
      const {deviceData} = this.state;
      const index = deviceData.hmdOnly.currentIndex;
      const allValue = deviceData.hmdOnly.dataContent[index];

      if (allValue) {
        this.getIPdeviceInfo(index, allValue.ipDeviceUUID);
      }
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
   * Handle delete device from device map tab
   * @method
   */
  deleteDevice = () => {
    const {baseUrl} = this.context;
    const {currentDeviceData, floorPlan} = this.state;

    ah.one({
      url: `${baseUrl}/api/u1/ipdevice?uuid=${currentDeviceData.ipDeviceUUID}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getDeviceSeatData(floorPlan.currentAreaUUID);
        this.getDeviceData('', 'oneSeat', currentDeviceData.seatUUID);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display delete IP device modal dialog
   * @method
   * @param {object} allValue - IP device data
   */
  openDeleteDeviceModal = (allValue) => {
    const {activeTab} = this.state;

    PopupDialog.prompt({
      title: t('network-inventory.txt-deleteDevice'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteDeviceContent(allValue),
      act: (confirmed, data) => {
        if (confirmed) {
          if (activeTab === 'deviceMap') {
            this.deleteDevice();
          } else if (activeTab === 'deviceList') {
            this.getDeviceData('', 'delete');
          } 
        }
      }
    });
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData.sort.field = field;
    tempDeviceData.sort.desc = sort;

    this.setState({
      deviceData: tempDeviceData
    }, () => {
      this.getDeviceData();
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   * @param {string} [btnType] - button action type ('previous' or 'next')
   */
  handlePaginationChange = (type, value, btnType) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData[type] = Number(value);

    this.setState({
      deviceData: tempDeviceData
    }, () => {
      this.getDeviceData(type, btnType);
    });
  }
  /**
   * Get and set link analysis data
   * @method
   */
  loadLinkAnalysis = () => {
    const {baseUrl} = this.context;
    const {LAconfig, deviceSearch} = this.state;
    let url = `${baseUrl}/api/ipdevice/topology`;

    if (deviceSearch.ip) {
      url += `?ip=${deviceSearch.ip}`;
    }

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      if (data && data.length > 0) {
        let deviceEventsDataList = {};
        let deviceEventsData = {};

        _.forEach(data, val => {
          deviceEventsDataList[helper.getFormattedDate(val.createDttm, 'local')] = val.topology;
        })

        _.forEach(data[0].topology, val => {
          deviceEventsData[val.id] = val.content;
        })

        const eventsDateList = _.map(data, (val, i) => {
          return <MenuItem key={i} value={helper.getFormattedDate(val.createDttm, 'local')}>{helper.getFormattedDate(val.createDttm, 'local')}</MenuItem>
        });

        this.setState({
          deviceEventsDataList,
          deviceEventsData,
          deviceLAdata: analyze(deviceEventsData, LAconfig, {analyzeGis: false}),
          eventsDateList,
          eventsDate: helper.getFormattedDate(data[0].createDttm, 'local')
        });
      } else {
        helper.showPopupMsg(t('txt-notFound'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle change of date list and reset LA data
   * @method
   * @param {object} event - event object
   */
  handleDeviceDateChange = (event) => {
    this.setState({
      deviceEventsData: {},
      deviceLAdata: {},
      eventsDate: event.target.value
    }, () => {
      const {LAconfig, deviceEventsDataList, eventsDate} = this.state;
      let deviceEventsData = {};

      _.forEach(deviceEventsDataList[eventsDate], val => {
        deviceEventsData[val.id] = val.content;
      })

      this.setState({
        deviceEventsData,
        deviceLAdata: analyze(deviceEventsData, LAconfig, {analyzeGis: false})
      });
    });
  }
  /**
   * Handle content tab change
   * @method
   * @param {object} event - event object
   * @param {string} newTab - content type ('deviceList', 'deviceMap' or 'deviceLA')
   */
  handleSubTabChange = (event, newTab) => {
    this.setState({
      activeTab: newTab,
      floorMapType: '',
      deviceEventsData: {},
      deviceLAdata: {},
      eventsDateList: [],
      eventsDate: ''
    }, () => {
      if (newTab === 'deviceList') {
        this.getDeviceData();
      } else if (newTab === 'deviceMap') {
        this.getFloorPlan(newTab);
      } else if (newTab === 'deviceLA') {
        this.loadLinkAnalysis();
      }
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
   * Get Event Tracing request data
   * @method
   * @param {string} ipDeviceUUID - IP Device UUID
   */
  getRequestData = (ipDeviceUUID) => {
    let datetime = {
      from: helper.getSubstractDate(7, 'day'),
      to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
    };

    datetime.from = moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    datetime.to = moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';

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
   * Get and set IP device data (old api)
   * @method
   * @param {string} [index] - index of the IP devicde data
   * @param {string | number} ipDeviceUUID - IP device UUID
   * @param {string} [options] - option for 'oneDevice'
   */
  getIPdeviceInfo = (index, ipDeviceUUID, options) => {
    const {baseUrl} = this.context;
    const {currentDeviceData} = this.state;
    let ipDeviceID = ipDeviceUUID;
    let tempDeviceData = {...this.state.deviceData};
    let setCurrentIndex = false;

    if (index) { //index is available
      setCurrentIndex = true;
    } else {
      if (index === 0) {
        setCurrentIndex = true;
      } else {
        ipDeviceID = currentDeviceData.ipDeviceUUID;
      }
    }

    if (setCurrentIndex) {
      tempDeviceData.hmdOnly.currentIndex = Number(index);
    }

    this.ah.all([
      {
        url: `${baseUrl}/api/v2/ipdevice?uuid=${ipDeviceID}&page=1&pageSize=5`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/u1/log/event/_search?page=1&pageSize=20`,
        data: JSON.stringify(this.getRequestData(ipDeviceID)),
        type: 'POST',
        contentType: 'text/plain'
      }
    ])
    .then(data => {
      if (data) {
        if (data[0]) {
          if (options === 'oneDevice') {
            this.getOwnerSeat(data[0]);

            this.setState({
              showGlobalLoadingIcon: false
            });
            return;
          }

          this.setState({
            modalIRopen: false,
            deviceData: tempDeviceData,
            currentDeviceData: data[0],
            activeIPdeviceUUID: ipDeviceID,
            showGlobalLoadingIcon: false
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
   * Toggle IR combo selection dialog on/off
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
   * @param {string || array.<string>} [options] - option for 'fromInventory' or Process Monitor settings
   * @param {object} [yaraRule] - yara rule data
   */
  triggerTask = (type, options, yaraRule) => {
    const {baseUrl} = this.context;
    const {deviceData, currentDeviceData} = this.state;
    let requestData = {
      hostId: currentDeviceData.ipDeviceUUID,
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

    if (type[0] === 'setProcessWhiteList') {
      if (options.length > 0) {
        requestData.paras = {
          _WhiteList: options
        };
      }
    }

    let apiArr = [{
      url: `${baseUrl}/api/hmd/retrigger`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }];

    if (type.length > 0 && options !== 'fromInventory') { //Get updated HMD data for scan info type
      apiArr.push({
        url: `${baseUrl}/api/v2/ipdevice?uuid=${currentDeviceData.ipDeviceUUID}&page=1&pageSize=5`,
        type: 'GET'
      });
    }

    this.ah.series(apiArr)
    .then(data => {
      if (data) {
        if (data[0]) {
          helper.showPopupMsg(t('txt-requestSent'));

          this.setState({
            modalIRopen: false
          });
        }

        if (data[1]) {
          this.setState({
            modalIRopen: false,
            currentDeviceData: data[1],
            activeIPdeviceUUID: currentDeviceData.ipDeviceUUID
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
   * Close floor map dialog
   * @method
   * @param {string} options - option for 'reload'
   * @param {string} page - page type for 'fromFloorMap'
   */
  closeFloorDialog = (options, page) => {
    const {currentDeviceData, floorPlan} = this.state;

    if (page === 'fromFloorMap' && floorPlan.treeData[0]) {
      let tempCurrentDeviceData = {...currentDeviceData};
      tempCurrentDeviceData.areaUUID = floorPlan.treeData[0].areaUUID; //Reset selected tree to parent areaUUID
      
      this.setState({
        currentDeviceData: tempCurrentDeviceData,
        floorMapType: page
      });
    }

    this.setState({
      modalFloorOpen: false
    }, () => {
      if (options === 'reload') {
        if (page === 'fromFloorMap') { //reload everything
          this.getFloorPlan('fromFloorMap');
        } else { //reload seat (no tree)
          this.getDeviceSeatData(floorPlan.currentAreaUUID);
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
      }
    });
  }
  /**
   * Toggle Inventory content
   * @method
   * @param {string} type - content type ('showList', 'showData', 'showForm', 'showUpload', 'autoSettings' or 'cancel')
   * @param {string} formType - show form content type ('new' or 'edit')
   */
  toggleContent = (type, formType) => {
    const {formTypeEdit, currentDeviceData, floorList, ownerList, departmentList, titleList, addSeat} = this.state;
    let tempAddSeat = {...addSeat};
    let activeContent = '';

    if (type === 'cancel') {
      if (formTypeEdit) {
        activeContent = 'dataInfo';
      } else {
        activeContent = 'tableList';

        this.getFloorPlan();
      }

      this.setState({
        showAllSeats: false,
        formValidation: {
          ip: {
            valid: true,
            msg: ''
          },
          mac: {
            valid: true,
            msg: ''
          },
          newOwnerName: {
            valid: true,
            msg: ''
          },
          newOwnerID: {
            valid: true,
            msg: ''
          },
          csvColumnsIp: {
            valid: true
          },
          seatName: {
            valid: true
          },
          hostName: {
            valid: true
          },
          system: {
            valid: true
          },
          deviceType: {
            valid: true
          }
        }
      });
    } else if (type === 'showList') {
      activeContent = 'tableList';
    } else if (type === 'autoSettings') {
      activeContent = type;
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
          remarks: currentDeviceData.remarks,
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
          this.setState({
            showAllSeats: true //show all seats for floor map
          }, () => {
            this.getAreaData(currentDeviceData.areaUUID);
            this.getDeviceSeatData(currentDeviceData.areaUUID);
          });
        }

        tempAddSeat.selectedSeatUUID = currentDeviceData.seatUUID;
      } else if (formType === 'new') {
        const inventoryParam = queryString.parse(location.search);
        formTypeEdit = false;

        if (!_.isEmpty(floorList)) {
          this.getAreaData(floorList[0].value);
          this.getDeviceSeatData(floorList[0].value);
        }

        this.setState({
          currentDeviceData: {},
          selectedTreeID: ''
        });

        if (_.isEmpty(inventoryParam) || (!_.isEmpty(inventoryParam) && !inventoryParam.ip)) {
          this.getFloorPlan();
        }

        this.handleCloseMenu();
      }

      if (!currentDeviceData.ownerUUID && ownerList[0]) {
        this.getOwnerInfo(ownerList[0].value);
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
        ownerIDduplicated: false,
        addSeat: tempAddSeat,
        changeAreaMap: false
      });
      return;
    } else if (type === 'showUpload') {
      this.toggleFileUpload();
      this.handleCloseMenu();
      return;
    }

    this.setState({
      activeContent
    }, () => {
      const inventoryParam = queryString.parse(location.search);

      if (!_.isEmpty(inventoryParam) && inventoryParam.ip) {
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
   * Handle open menu
   * @method
   * @param {string} type - menu type ('addIP')
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
   * Handle CSV batch upload
   * @method
   * @param {object} file - file uploaded by the user
   */
  parseCSVfile = async (file) => {
    if (file) {
      this.handleFileChange(file, await this.checkEncode(file));
    }
  }
  /**
   * Check file encoding
   * @method
   * @param {object} file - file uploaded by the user
   * @returns promise of the file reader
   */
  checkEncode = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const rABS = !!reader.readAsBinaryString;

      reader.onload = async (e) => {
        resolve(jschardet.detect(e.target.result));
      }
      reader.onerror = error => reject(error);

      if (rABS) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }
  /**
   * Handle file change and set the file
   * @method
   * @param {object} file - file uploaded by the user
   * @param {object} check - a returned promise for the encode info
   */
  handleFileChange = (file, check) => {
    let reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;

    reader.onload = (e) => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, {type:rABS ? 'binary' : 'array'});
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws, {header:1});

      this.setState({
        tempCsvData: data
      });
    }
    reader.onerror = error => reject(error);

    if (rABS) {
      if (check.encoding) {
        if (check.encoding === 'UTF-8') {
          reader.readAsText(file, 'UTF-8');
        } else { //If check.encoding is available, force to read as BIG5 encoding
          reader.readAsText(file, 'BIG5');
        }
      } else {
        reader.readAsBinaryString(file);
      }
    } else {
      reader.readAsArrayBuffer(file);
    }
  }
  /**
   * Toggle CSV file upload dialog on/off
   * @method
   */
  toggleFileUpload = () => {
    const {uploadOpen, tempCsvData, csvHeader} = this.state;

    if (uploadOpen) {
      if (tempCsvData.length > 0) {
        if (!csvHeader) { //Generate header for the user
          tempCsvData.unshift(_.map(tempCsvData[0], (val, i) => {
            i++;
            return t('txt-column') + ' ' + i.toString();
          }));
        }

        this.setState({
          uploadOpen: false,
          csvData: tempCsvData,
          showCsvData: true,
          csvColumns: {
            ip: '',
            mac: '',
            hostName: ''
          }
        });
      } else {
        helper.showPopupMsg(t('txt-selectFile'), t('txt-error'));
        return;
      }
    } else {
      this.setState({
        uploadOpen: true,
        csvHeader: true
      });
    }
  }
  /**
   * Turn file upload dialog off
   * @method
   */
  closeFileUpload = () => {
    this.setState({
      uploadOpen: false
    });
  }
  /**
   * Toggle CSV header checkbox
   * @method
   */
  toggleCsvHeader = () => {
    this.setState({
      csvHeader: !this.state.csvHeader
    });
  }
  /**
   * Display CSV file upload dialog
   * @method
   * @returns ModalDialog component
   */
  uploadDialog = () => {
    const {csvHeader} = this.state;
    const titleText = t('network-inventory.txt-batchUploadIp');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeFileUpload},
      confirm: {text: t('txt-confirm'), handler: this.toggleFileUpload}
    };

    return (
      <ModalDialog
        id='batchUploadDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
          <FileUpload
            supportText={t('network-inventory.txt-batchUploadIp')}
            id='csvFileInput'
            fileType='csv'
            btnText={t('txt-upload')}
            handleFileChange={this.parseCSVfile} />
          <div className='csv-options'>
            <FormControlLabel
              label={t('network-inventory.txt-withHeader')}
              control={
                <Checkbox
                  id='csvHeaderOption'
                  className='checkbox-ui'
                  checked={csvHeader}
                  onChange={this.toggleCsvHeader}
                  color='primary' />
              } />
          </div>
      </ModalDialog>
    )
  }
  /**
   * Display CSV table header and body cell
   * @method
   * @param {string} type - CSV body cell type ('header' or 'body')
   * @param {string} value - table cell content
   * @param {number} i - index of the CSV data
   * @returns HTML DOM
   */
  showCSVbodyCell = (type, value, i) => {
    if (type === 'header') {
      return <th key={type + i}>{value}</th>
    } else if (type === 'body') {
      return <td key={type + i}>{value}</td>
    }
  }
  /**
   * Display CSV table body row
   * @method
   * @param {string} value - table row content
   * @param {number} i - index of the CSV data
   * @returns HTML DOM
   */
  showCSVbody = (value, i) => {
    if (i > 0) {
      return (
        <tr key={i}>
          {value.map(this.showCSVbodyCell.bind(this, 'body'))}
        </tr>
      )
    }
  }
  /**
   * Display CSV table data
   * @method
   * @returns HTML DOM
   */
  displayCSVtable = () => {
    const {csvData} = this.state;

    if (!_.isEmpty(csvData)) {
      return (
        <table className='c-table main-table csv-data'>
          <thead>
            <tr>
              {csvData[0].map(this.showCSVbodyCell.bind(this, 'header'))}
            </tr>
          </thead>
          <tbody>
            {csvData.map(this.showCSVbody)}
          </tbody>
        </table>
      )
    }
  }
  /**
   * Handle column change for CSV table dropdown
   * @method
   * @param {object} event - event object
   */
  handleColumnChange = (event) => {
    let tempCsvColumns = {...this.state.csvColumns};
    tempCsvColumns[event.target.name] = event.target.value;

    this.setState({
      csvColumns: tempCsvColumns
    });
  }
  /**
   * Display upload failure list
   * @method
   * @param {object} data - uploaded data with success and fail list
   * @returns HTML DOM
   */
  displayUploadStatus = (data) => {
    const {ipUploadFields} = this.state;
    let tableFields = {};
    ipUploadFields.forEach(tempData => {
      tableFields[tempData] = {
        label: t(`ipFields.${tempData}`),
        sortable: false,
        formatter: (value, allValue, i) => {
          if (tempData === 'errCode') {
            value = et(value);
          }
          return <span>{value}</span>
        }
      };
    })

    return (
      <div>
        <div>{t('network-inventory.txt-total')}: {data.successList.length + data.failureList.length}</div>
        <div>{t('network-inventory.txt-success')}: {data.successList.length}</div>
        <div>{t('network-inventory.txt-fail')}: {data.failureList.length}</div>
        <div className='error-msg'>{t('network-inventory.txt-uploadFailed')}</div>
        <div className='table-data'>
          <DataTable
            className='main-table'
            fields={tableFields}
            data={data.failureList} />
        </div>
      </div>
    )
  }
  /**
   * Handle upload actions for CSV table
   * @method
   */
  uploadActions = (type) => {
    const {baseUrl} = this.context;
    const {csvData, csvColumns, csvHeader, ipUploadFields, formValidation} = this.state;
    let tempFormValidation = {...formValidation};

    if (type === 'upload') {
      if (csvColumns.ip === '') {
        tempFormValidation.csvColumnsIp.valid = false;

        this.setState({
          formValidation: tempFormValidation
        });
      } else {
        const url = `${baseUrl}/api/ipdevices`;
        let requestData = [];
        let validate = true;

        _.forEach(csvData, (val, i) => {
          let dataObj = {
            ip: '',
            mac: '',
            hostName: ''
          };

          if (i > 0) {
            _.forEach(ipUploadFields, val2 => {
              if (typeof csvColumns[val2] === 'number') {
                let data = val[Number(csvColumns[val2])];

                if (typeof data === 'string') {
                  data = data.trim();
                }

                dataObj[val2] = data;
              }
            })
          }

          if (dataObj.ip) {
            if (!IP_PATTERN.test(dataObj.ip)) { //Check IP format
              validate = false;
              helper.showPopupMsg(t('network-inventory.txt-uploadFailedIP'));
              return false;
            }

            if (dataObj.mac && !MAC_PATTERN.test(dataObj.mac)) { //Check MAC format
              validate = false;
              helper.showPopupMsg(t('network-inventory.txt-uploadFailedMAC'));
              return false;
            }

            requestData.push({
              ip: dataObj.ip,
              mac: dataObj.mac,
              hostName: dataObj.hostName
            });
          }
        })

        tempFormValidation.csvColumnsIp.valid = true;

        this.setState({
          formValidation: tempFormValidation
        });

        if (!validate) {
          return;
        }

        if (requestData.length === 0) {
          helper.showPopupMsg(t('txt-uploadEmpty'));
          return;
        }

        this.ah.one({
          url,
          data: JSON.stringify(requestData),
          type: 'POST',
          contentType: 'text/plain'
        })
        .then(data => {
          if (data) {
            if (data.successList.length > 0 && data.failureList.length === 0) {
              helper.showPopupMsg(t('txt-uploadSuccess'));

              this.setState({
                csvData: [],
                tempCsvData: [],
                showCsvData: false,
                csvColumns: {
                  ip: '',
                  mac: '',
                  hostName: ''
                }
              }, () => {
                this.getDeviceData();
              });
            } else if (data.failureList.length > 0) {
              PopupDialog.alert({
                title: t('txt-uploadStatus'),
                id: 'batchUploadStatusModal',
                confirmText: t('txt-close'),
                display: this.displayUploadStatus(data)
              });
            } if (data.successList.length === 0 && data.failureList.length === 0) {
              helper.showPopupMsg(t('txt-uploadEmpty'));
            }
          }
          return null;
        })
        .catch(err => {
          helper.showPopupMsg('', t('txt-error'), err.message);
        })
      }
    } else if (type === 'cancel') {
      this.setState({
        showCsvData: false,
        csvColumns: {
          ip: '',
          mac: '',
          hostName: ''
        },
        formValidation: {
          ip: {
            valid: true,
            msg: ''
          },
          mac: {
            valid: true,
            msg: ''
          },
          newOwnerName: {
            valid: true,
            msg: ''
          },
          newOwnerID: {
            valid: true,
            msg: ''
          },
          csvColumnsIp: {
            valid: true
          },
          seatName: {
            valid: true
          },
          hostName: {
            valid: true
          },
          system: {
            valid: true
          },
          deviceType: {
            valid: true
          }
        }
      }, () => {
        this.getDeviceData();
      });
    }
  }
  /**
   * Check if IP aready exists in inventory
   * @method
   */
  checkDuplicatedIP = () => {
    const {baseUrl} = this.context;
    const {addIP, formValidation} = this.state;
    let tempFormValidation = {...formValidation};

    if (!addIP.ip) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/v3/ipdevice/_search?exactIp=${addIP.ip}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        if (data.counts > 0) {
          tempFormValidation.ip.valid = false;
          tempFormValidation.ip.msg = t('network-inventory.txt-duplicatedIP');

          this.setState({
            formValidation: tempFormValidation
          });
        } else {
          tempFormValidation.ip.valid = true;
          tempFormValidation.ip.msg = '';

          this.setState({
            activeSteps: 2,
            formValidation: tempFormValidation
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
   * Toggle add/edit form step content
   * @method
   * @param {string} type - form step type ('previous' or 'next')
   */
  toggleSteps = (type) => {
    const {formTypeEdit, activeSteps, addIP, ownerType, formValidation} = this.state;
    const inventoryParam = queryString.parse(location.search);
    let tempActiveSteps = activeSteps;
    let tempFormValidation = {...formValidation};

    if (type === 'previous') {
      tempActiveSteps--;

      this.setState({
        activeSteps: tempActiveSteps
      });
    } else if (type === 'next') {
      if (activeSteps === 1) {
        let validate = true;

        if (addIP.ip) {
          if (IP_PATTERN.test(addIP.ip)) {
            tempFormValidation.ip.valid = true;
            tempFormValidation.ip.msg = '';
          } else {
            tempFormValidation.ip.valid = false;
            tempFormValidation.ip.msg = t('network-topology.txt-ipValidationFail');
            validate = false;
          }
        } else {
          tempFormValidation.ip.valid = false;
          tempFormValidation.ip.msg = t('txt-required');
          validate = false;
        }

        if (!_.has(inventoryParam, 'hostName') && !addIP.mac) {
          tempFormValidation.mac.valid = false;
          tempFormValidation.mac.msg = t('txt-required');
          validate = false;
        } else {
          if (MAC_PATTERN.test(addIP.mac)) {
            tempFormValidation.mac.valid = true;
            tempFormValidation.mac.msg = '';
          } else {
            tempFormValidation.mac.valid = false;
            tempFormValidation.mac.msg = t('network-topology.txt-macValidationFail');
            validate = false;
          }
        }

        this.setState({
          formValidation: tempFormValidation
        });

        if (!validate) {
          return;
        }

        if (formTypeEdit) { //Edit mode
          this.setState({
            activeSteps: 2
          });
        } else { //Check duplicated IP for adding new device
          this.checkDuplicatedIP();
        }
      } else {
        if (activeSteps === 2) {
          let validate = true;
          tempFormValidation.hostName.valid = true;
          tempFormValidation.system.valid = true;
          tempFormValidation.deviceType.valid = true;

          if (addIP.hostName && addIP.hostName.length > 64) {
            tempFormValidation.hostName.valid = false;
            validate = false;
          }

          if (addIP.system && addIP.system.length > 64) {
            tempFormValidation.system.valid = false;
            validate = false;
          }

          if (addIP.deviceType && addIP.deviceType.length > 64) {
            tempFormValidation.deviceType.valid = false;
            validate = false;
          }

          this.setState({
            formValidation: tempFormValidation
          });

          if (!validate) {
            return;
          }
        }

        if (activeSteps === 3 && ownerType === 'new') {
          let validate = true;

          if (addIP.newOwnerName) {
            tempFormValidation.newOwnerName.valid = true;
            tempFormValidation.newOwnerName.msg = '';
          } else {
            tempFormValidation.newOwnerName.valid = false;
            tempFormValidation.newOwnerName.msg = t('txt-required');
            validate = false;
          }

          if (addIP.newOwnerID) {
            tempFormValidation.newOwnerID.valid = true;
            tempFormValidation.newOwnerID.msg = '';
          } else {
            tempFormValidation.newOwnerID.valid = false;
            tempFormValidation.newOwnerID.msg = t('txt-required');
            validate = false;
          }

          this.setState({
            formValidation: tempFormValidation
          });

          if (!validate) {
            return;
          }
        }

        if (activeSteps === 4) {
          this.setState({
            showAllSeats: false,
            floorMapType: '',
            showGlobalLoadingIcon: true
          }, () => {
            this.handleAddIpConfirm();
          });
          return;
        }

        tempActiveSteps++;

        this.setState({
          activeSteps: tempActiveSteps
        });
      }
    }
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
        if (data) { //Return ownerUUID
          this.handleIPdeviceConfirm(data);
        }
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);

        this.setState({
          activeSteps: 3,
          ownerIDduplicated: true,
          changeAreaMap: false
        });
      })
    } else if (ownerType === 'existing') {
      this.handleIPdeviceConfirm();
    }
  }
  /**
   * Handle add/edit form confirm
   * @method
   * @param {string} [ownerUUID] - owner ID
   */
  handleIPdeviceConfirm = (ownerUUID) => {
    const {baseUrl} = this.context;
    const {formTypeEdit, currentDeviceData, mapAreaUUID, floorPlan, addIP, addSeat} = this.state;
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
      remarks: addIP.remarks,
      areaUUID: mapAreaUUID,
      seatUUID: addSeat.selectedSeatUUID
    };

    if (formTypeEdit) {
      requestData.ipDeviceUUID = currentDeviceData.ipDeviceUUID;
    }

    requestData.ownerUUID = ownerUUID || addIP.ownerUUID;

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: requestType,
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getDeviceData();

        if (formTypeEdit) {
          this.getIPdeviceInfo('', currentDeviceData.ipDeviceUUID, 'oneDevice');
        } else {
          this.toggleContent('showList');
        }
      }
      return null;
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
    const {locale} = this.context;
    const {activeSteps} = this.state;
    const index = ++i;
    const groupClass = 'group group' + index;
    const lineClass = 'line line' + index;
    const stepClass = 'step step' + index;
    const textClass = 'text';

    let textAttr = {
      className: textClass
    };

    if (index === 1) {
      let pos = '';

      if (locale === 'en') {
        pos = '-11px';
      } else if (locale === 'zh') {
        pos = '0';
      }
      textAttr.style = {left: pos};
    }

    if (index === 2) {
      let pos = '';

      if (locale === 'en') {
        pos = '-1px';
      } else if (locale === 'zh') {
        pos = '-22px';
      }
      textAttr.style = {left: pos};
    }

    if (index === 3) {
      let pos = '';

      if (locale === 'en') {
        pos = '-1px';
      } else if (locale === 'zh') {
        pos = '-6px';
      }
      textAttr.style = {left: pos};
    }

    if (index === 4) {
      let pos = '';

      if (locale === 'en') {
        pos = '5px';
      } else if (locale === 'zh') {
        pos = '-1px';
      }
      textAttr.style = {left: pos};
    }

    return (
      <div className={groupClass} key={index}>
        <div className={cx(lineClass, {active: activeSteps >= index})}></div>
        <div className={cx(stepClass, {active: activeSteps >= index})}>
          <div className='wrapper'><span className='number'>{index}</span></div>
          <div {...textAttr}>{val}</div>
        </div>
      </div>
    )
  }
  /**
   * Handle owner type change
   * @method
   * @param {object} event - event object
   */
  handleOwnerTypeChange = (event) => {
    const {departmentList, titleList, addIP} = this.state;
    const tempAddIP = {...addIP};
    tempAddIP.newDepartment = departmentList[0] ? departmentList[0].value : '';
    tempAddIP.newTitle = titleList[0] ? titleList[0].value : '';

    this.setState({
      ownerType: event.target.value,
      addIP: tempAddIP
    }, () => {
      this.getOwnerInfo(addIP.ownerUUID);
    });
  }
  /**
   * Handle existing owners dropdown change
   * @method
   * @param {string | object} event - owner ID or event object
   */
  getOwnerInfo = (event) => {
    const {baseUrl} = this.context;
    const value = event.target ? event.target.value : event;

    ah.one({
      url: `${baseUrl}/api/u1/owner?uuid=${value}`,
      type: 'GET'
    })
    .then(data => {
      if (data.rt) {
        data = data.rt;

        let tempAddIP = {...this.state.addIP};
        tempAddIP.ownerUUID = data.ownerUUID;
        tempAddIP.ownerID = data.ownerID;
        tempAddIP.department = data.departmentName;
        tempAddIP.title = data.titleName;
        tempAddIP.ownerPic = data.base64;

        const inventoryParam = queryString.parse(location.search);

        if (inventoryParam.ip && inventoryParam.type === 'add') {
          tempAddIP.ip = inventoryParam.ip;
        }

        this.setState({
          addIP: tempAddIP
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle Department/Title dropdown change
   * @method
   * @param {object} event - event object
   */
  handleSelectionChange = (event) => {
    const tempAddIP = {...this.state.addIP};
    tempAddIP[event.target.name] = event.target.value;

    this.setState({
      addIP: tempAddIP
    });
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
   * Get show form button text
   * @method
   * @returns button text
   */
  getBtnText = () => {
    return this.state.activeSteps === 4 ? t('txt-confirm') : t('txt-nextStep');
  }
  /**
   * Get owner type for radio group
   * @method
   * @returns owner type array
   */
  getOwnerType = () => {
    const {ownerList} = this.state;

    let ownerType = [{
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
   * Check if MAC is required field or not
   * @method
   * @returns boolean true/false
   */
  checkMacRequired = () => {
    const inventoryParam = queryString.parse(location.search);
    return !_.has(inventoryParam, 'hostName');
  }
  /**
   * Get owner name
   * @method
   * @param {ownerUUID} string - ownerUUID
   * @returns owner name
   */
  getOwnerName = (ownerUUID) => {
    const owner = _.find(this.state.ownerList, {'value': ownerUUID});
    return owner.text;
  }
  /**
   * Handle Add IP form input value change
   * @method
   * @param {object} event - event object
   */
  handleAddIpChange = (event) => {
    let tempAddIP = {...this.state.addIP};
    tempAddIP[event.target.name] = event.target.value;

    this.setState({
      addIP: tempAddIP
    });
  }
  /**
   * Handle photo upload input value change
   * @method
   * @param {string | object} value - input data to be set
   */
  handlePhotoChange = (value) => {
    let tempAddIP = {...this.state.addIP};
    tempAddIP.file = value;

    this.setState({
      previewOwnerPic: value ? URL.createObjectURL(value) : '',
      addIP: tempAddIP
    });
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
      ownerListDropDown,
      departmentList,
      titleList,
      ownerType,
      mapAreaUUID,
      currentMap,
      deviceSeatData,
      currentBaseLayers,
      floorPlan,
      ownerInfo,
      addSeat,
      ownerIDduplicated,
      showLoadingIcon,
      formValidation
    } = this.state;
    const addIPtext = [t('txt-ipAddress'), t('alert.txt-systemInfo'), t('ipFields.owner'), t('alert.txt-floorInfo')];
    const inventoryParam = queryString.parse(location.search);
    let hostNameField = addIP.hostName;
    let hostNameReadyOnly = currentDeviceData.isHmd;

    if (_.has(inventoryParam, 'hostName')) {
      hostNameField = inventoryParam.hostName;
      hostNameReadyOnly = true;
    }

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
                <TextField
                  id='addIPstepsIP'
                  name='ip'
                  label={t('ipFields.ip')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  required
                  error={!formValidation.ip.valid}
                  helperText={formValidation.ip.msg}
                  value={addIP.ip || ''}
                  onChange={this.handleAddIpChange}
                  disabled={formTypeEdit} />
              </div>
              <div className='group'>
                <TextField
                  id='addIPstepsIP'
                  name='mac'
                  label={t('ipFields.mac')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  required={this.checkMacRequired()}
                  error={!formValidation.mac.valid}
                  helperText={formValidation.mac.msg}
                  value={addIP.mac || ''}
                  onChange={this.handleAddIpChange} />
              </div>
            </div>
          }
          {activeSteps === 2 &&
            <div className='form-group steps-host'>
              <header>{t('alert.txt-systemInfo')}</header>
              <div className='group'>
                <TextField
                  id='addIPstepsHostname'
                  name='hostName'
                  label={t('ipFields.hostName')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  error={!formValidation.hostName.valid}
                  helperText={formValidation.hostName.valid ? '' : t('network-topology.txt-maxCharError')}
                  value={hostNameField}
                  onChange={this.handleAddIpChange}
                  disabled={hostNameReadyOnly} />
              </div>
              <div className='group'>
                <TextField
                  id='addIPstepsHostID'
                  name='hostID'
                  label={t('ipFields.hostID')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={addIP.hostID}
                  disabled />
              </div>
              <div className='group'>
                <TextField
                  id='addIPstepsSystem'
                  name='system'
                  label={t('ipFields.system')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  error={!formValidation.system.valid}
                  helperText={formValidation.system.valid ? '' : t('network-topology.txt-maxCharError')}
                  value={addIP.system}
                  onChange={this.handleAddIpChange}
                  disabled={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <TextField
                  id='addIPstepsDeviceType'
                  name='deviceType'
                  label={t('ipFields.deviceType')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  error={!formValidation.deviceType.valid}
                  helperText={formValidation.deviceType.valid ? '' : t('network-topology.txt-maxCharError')}
                  value={addIP.deviceType}
                  onChange={this.handleAddIpChange}
                  disabled={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <TextField
                  id='addIPstepsUser'
                  name='userName'
                  label={t('ipFields.userAccount')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={addIP.userName}
                  onChange={this.handleAddIpChange}
                  disabled={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <TextField
                  id='addIPstepsCPU'
                  name='cpu'
                  label={t('txt-cpu')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={addIP.cpu}
                  onChange={this.handleAddIpChange}
                  disabled={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <TextField
                  id='addIPstepsRam'
                  name='ram'
                  label={t('txt-ram')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={addIP.ram}
                  onChange={this.handleAddIpChange}
                  disabled={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <TextField
                  id='addIPstepsDisks'
                  name='disks'
                  label={t('txt-disks')}
                  multiline
                  rows={3}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={addIP.disks}
                  onChange={this.handleAddIpChange}
                  disabled={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <TextField
                  id='addIPstepsFolders'
                  name='shareFolders'
                  label={t('txt-shareFolders')}
                  multiline
                  rows={3}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={addIP.shareFolders}
                  onChange={this.handleAddIpChange}
                  disabled={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <TextField
                  id='addIPstepsRemarks'
                  name='remarks'
                  label={t('txt-remarks')}
                  multiline
                  rows={3}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={addIP.remarks}
                  onChange={this.handleAddIpChange}
                  disabled={currentDeviceData.isHmd} />
              </div>
            </div>
          }
          {activeSteps === 3 &&
            <div className='form-group steps-owner'>
              <header>{t('ipFields.owner')}</header>
              <RadioGroup
                className='radio-group owner-type'
                value={ownerType}
                onChange={this.handleOwnerTypeChange}>
                <FormControlLabel
                  value='new'
                  control={
                    <Radio
                      className='radio-ui'
                      color='primary' />
                  }
                  label={t('txt-addNewOwner')} />
                {!_.isEmpty(ownerList) &&
                  <FormControlLabel
                    value='existing'
                    control={
                      <Radio
                        className='radio-ui'
                        color='primary' />
                    }
                    label={t('txt-existingOwner')} />
                }
              </RadioGroup>
              {ownerType === 'new' &&
                <Button variant='outlined' color='primary' className='standard manage' onClick={this.toggleManageDialog}>{t('txt-manageDepartmentTitle')}</Button>
              }
              <div className='user-pic'>
                {ownerType === 'new' &&
                  <div className='group'>
                    <label htmlFor='ownerPhotoUpload'>{t('txt-uploadPhoto')}</label>
                    <FileInput
                      id='ownerPhotoUpload'
                      className='file-input'
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
                      onChange={this.handlePhotoChange} />
                  </div>
                }
                <div className='group'>
                  {ownerType === 'existing' && addIP.ownerPic && !_.isEmpty(ownerList) &&
                    <img src={addIP.ownerPic} className='existing' title={this.getOwnerName(addIP.ownerUUID)} />
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
                {ownerType === 'new' &&
                  <div>
                    <div className='group'>
                      <TextField
                        id='addIPstepsOwnerName'
                        name='newOwnerName'
                        label={t('ownerFields.ownerName')}
                        variant='outlined'
                        fullWidth
                        size='small'
                        required
                        error={!formValidation.newOwnerName.valid}
                        helperText={formValidation.newOwnerName.msg}
                        value={addIP.newOwnerName}
                        onChange={this.handleAddIpChange} />
                    </div>
                    <div className='group'>
                      <TextField
                        id='addIPstepsOwnerID'
                        name='newOwnerID'
                        label={t('ownerFields.ownerID')}
                        variant='outlined'
                        fullWidth
                        size='small'
                        required
                        error={!formValidation.newOwnerID.valid}
                        helperText={formValidation.newOwnerID.msg}
                        value={addIP.newOwnerID || ''}
                        onChange={this.handleAddIpChange} />
                    </div>
                    <div className='group'>
                      <TextField
                        id='addIPstepsDepartment'
                        name='newDepartment'
                        label={t('ownerFields.department')}
                        select
                        variant='outlined'
                        fullWidth
                        size='small'
                        value={addIP.newDepartment}
                        onChange={this.handleSelectionChange}
                        disabled={departmentList.length === 0}>
                        {departmentList}
                      </TextField>
                    </div>
                    <div className='group'>
                      <TextField
                        id='addIPstepsTitle'
                        name='newTitle'
                        label={t('ownerFields.title')}
                        select
                        variant='outlined'
                        fullWidth
                        size='small'
                        value={addIP.newTitle}
                        onChange={this.handleSelectionChange}
                        disabled={titleList.length === 0}>
                        {titleList}
                      </TextField>
                    </div>
                  </div>
                }
                {ownerType === 'existing' &&
                  <div>
                    <div className='group'>
                      <TextField
                        id='addIPstepsOwnerName'
                        label={t('ownerFields.ownerName')}
                        select
                        variant='outlined'
                        fullWidth
                        size='small'
                        value={addIP.ownerUUID}
                        onChange={this.getOwnerInfo}>
                        {ownerListDropDown}
                      </TextField>
                    </div>
                    <div className='group'>
                      <TextField
                        id='addIPstepsOwnerID'
                        name='ownerID'
                        label={t('ownerFields.ownerID')}
                        variant='outlined'
                        fullWidth
                        size='small'
                        value={addIP.ownerID}
                        disabled />
                    </div>
                    <div className='group'>
                      <TextField
                        key='departmentName'
                        id='addIPstepsDepartment'
                        name='department'
                        label={t('ownerFields.department')}
                        variant='outlined'
                        fullWidth
                        size='small'
                        value={addIP.department || ''}
                        disabled />
                    </div>
                    <div className='group'>
                      <TextField
                        key='titleName'
                        id='addIPstepsTitle'
                        name='title'
                        label={t('ownerFields.title')}
                        variant='outlined'
                        fullWidth
                        size='small'
                        value={addIP.title || ''}
                        disabled />
                    </div>
                  </div>
                }
              </div>
            </div>
          }
          {activeSteps === 4 &&
            <div className='form-group steps-floor'>
              <header>{t('alert.txt-floorInfo')}</header>
              <Button variant='outlined' color='primary' className='standard manage' onClick={this.openFloorMap}>{t('network-inventory.txt-editFloorMap')}</Button>
              <div className='floor-info'>
                <div className='tree'>
                  {floorPlan.treeData && floorPlan.treeData.length > 0 &&
                    floorPlan.treeData.map(this.displayTreeView.bind(this, 'stepsFloor'))
                  }
                </div>
                <div className='map'>
                  {showLoadingIcon &&
                    <span className='loading'><i className='fg fg-loading-2'></i></span>
                  }
                  {currentMap.label && !showLoadingIcon &&
                    <Gis
                      _ref={(ref) => {this.gisNode = ref}}
                      data={_.get(deviceSeatData, [mapAreaUUID, 'data'], [])}
                      baseLayers={currentBaseLayers}
                      baseLayer={mapAreaUUID}
                      layouts={['standard']}
                      dragModes={['pan']}
                      scale={{enabled: false}}
                      mapOptions={{
                        maxZoom: 2
                      }}
                      selected={[addSeat.selectedSeatUUID]}
                      defaultSelected={[currentDeviceData.seatUUID]}
                      onClick={this.handleFloorMapClick.bind(this, 'addDevice')} />
                  }
                </div>
              </div>
            </div>
          }
          <footer>
            <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</Button>
            {activeSteps > 1 &&
              <Button variant='outlined' color='primary' className='standard previous-step' onClick={this.toggleSteps.bind(this, 'previous')}>{t('txt-previousStep')}</Button>
            }
            <Button variant='contained' color='primary' className='next-step' onClick={this.toggleSteps.bind(this, 'next')}>{this.getBtnText()}</Button>
          </footer>
        </div>
      </div>
    )
  }
  /**
   * Get default opened tree node
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
   * Handle tree selection
   * @param {string} type - tree type ('deviceMap' or 'stepsFloor')
   * @param {object} tree - tree data
   * @method
   */
  handleSelectTree = (type, tree) => {
    const areaUUID = tree.areaUUID;
    let tempFloorPlan = {...this.state.floorPlan};
    tempFloorPlan.currentAreaName = tree.areaName;
    tempFloorPlan.currentAreaUUID = areaUUID;
    tempFloorPlan.currentParentAreaUUID = tree.parentAreaUUID;
    tempFloorPlan.name = tree.areaName;
    tempFloorPlan.type = 'edit';

    this.setState({
      floorPlan: tempFloorPlan,
      changeAreaMap: true,
      selectedTreeID: areaUUID,
      floorMapType: 'selected',
      showLoadingIcon: true
    }, () => {
      this.getAreaData(areaUUID);

      if (type === 'deviceMap') {
        this.getDeviceSeatData(areaUUID);
      } else if (type === 'stepsFloor') {
        this.getDeviceSeatData(areaUUID);
      }
    });
  }
  /**
   * Display tree item
   * @method
   * @param {string} type - tree type ('deviceMap' or 'stepsFloor')
   * @param {object} val - tree data
   * @param {number} i - index of the tree data
   * @returns TreeItem component
   */
  getTreeItem = (type, val, i) => {
    return (
      <TreeItem
        key={val.id + i}
        nodeId={val.id}
        label={val.label}
        onLabelClick={this.handleSelectTree.bind(this, type, val)}>
        {val.children && val.children.length > 0 &&
          val.children.map(this.getTreeItem.bind(this, type))
        }
      </TreeItem>
    )
  }
  /**
   * Get tree data
   * @method
   * @param {string} type - tree type ('deviceMap' or 'stepsFloor')
   * @param {object} tree - tree data
   * @param {number} i - index of the floorPlan tree data
   * @returns TreeView component
   */
  displayTreeView = (type, tree, i) => {
    const {floorPlan, deviceSearchArea, currentDeviceData, changeAreaMap, selectedTreeID, floorMapType} = this.state;
    let defaultSelectedID = '';
    let defaultExpanded = [];

    if (type === 'deviceMap') {
      if (i === 0) {
        defaultSelectedID = tree.areaUUID;
      }

      if (floorMapType === 'selected') {
        defaultSelectedID = selectedTreeID;
      }

      if (deviceSearchArea) {
        defaultSelectedID = deviceSearchArea;
      }

      defaultExpanded = [tree.areaUUID];
    } else if (type === 'stepsFloor') {
      let currentAreaUUID = floorPlan.currentAreaUUID;
      defaultSelectedID = currentAreaUUID;

      if (!changeAreaMap && currentDeviceData.areaUUID) {
        currentAreaUUID = currentDeviceData.areaUUID;
      }

      if (floorMapType === 'fromFloorMap') {
        defaultSelectedID = currentDeviceData.areaUUID;
      } else if (floorMapType === 'selected') {
        defaultSelectedID = selectedTreeID;
      }

      if (changeAreaMap) {
        if (currentAreaUUID) {
          defaultSelectedID = currentAreaUUID;
        }
      } else {
        if (currentDeviceData && currentDeviceData.areaUUID) {
          defaultSelectedID = currentDeviceData.areaUUID;
        }
      }

      defaultExpanded = this.getDefaultFloor(defaultSelectedID);
    }

    return (
      <TreeView
        key={i}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultSelected={defaultSelectedID}
        defaultExpanded={defaultExpanded}
        selected={defaultSelectedID}>
        {tree.areaUUID &&
          <TreeItem
            nodeId={tree.areaUUID}
            label={tree.areaName}
            onLabelClick={this.handleSelectTree.bind(this, type, tree)}>
            {tree.children.length > 0 &&
              tree.children.map(this.getTreeItem.bind(this, type))
            }
          </TreeItem>
        }
      </TreeView>
    )
  }
  /**
   * Handle floor map mouse click
   * @method
   * @param {string} type - trigger type ('addDevice' or 'deviceMap')
   * @param {string} seatUUID - selected seat UUID
   * @param {object} event - mouseClick events
   */
  handleFloorMapClick = (type, seatUUID, event) => {
    let tempAddSeat = {...this.state.addSeat};

    if (!seatUUID) {
      tempAddSeat.coordX = Math.round(event.xy.x);
      tempAddSeat.coordY = Math.round(event.xy.y);

      this.setState({ //Add new seat
        addSeatOpen: true,
        addSeat: tempAddSeat
      });
      return;
    }

    if (type === 'addDevice') {
      tempAddSeat.selectedSeatUUID = seatUUID;

      this.setState({
        addSeat: tempAddSeat
      });
    } else if (type === 'deviceMap') {
      this.getDeviceData('', 'oneSeat', seatUUID);
    }
  }
  /**
   * Handle add seat input value change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempAddSeat = {...this.state.addSeat};
    tempAddSeat[event.target.name] = event.target.value;

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
    const {addSeat, formValidation} = this.state;

    return (
      <TextField
        id='addSeat'
        name='name'
        label={t('txt-plsEnterName')}
        variant='outlined'
        fullWidth
        size='small'
        required
        error={!formValidation.seatName.valid}
        helperText={formValidation.seatName.valid ? '' : t('txt-required')}
        value={addSeat.name}
        onChange={this.handleDataChange} />
    )
  }
  /**
   * Display add seat modal dialog
   * @method
   * @returns ModalDialog component
   */
  addSeatDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeAddSeatDialog},
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
   * Close add seat dialog
   * @method
   */
  closeAddSeatDialog = () => {
    let tempFormValidation = {...this.state.formValidation};
    tempFormValidation.seatName.valid = true;

    this.setState({
      addSeatOpen: false,
      addSeat: {
        selectedSeatUUID: '',
        name: '',
        coordX: '',
        coordY: ''
      },
      formValidation: tempFormValidation    
    });
  }
  /**
   * Handle add seat confirm
   * @method
   */
  handleAddSeatConfirm = () => {
    const {baseUrl} = this.context;
    const {floorPlan, currentDeviceData, addSeat, changeAreaMap, formValidation} = this.state;
    const url = `${baseUrl}/api/seat`;
    let currentAreaUUID = floorPlan.currentAreaUUID;
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (!changeAreaMap && currentDeviceData.areaUUID) {
      currentAreaUUID = currentDeviceData.areaUUID;
    }

    if (addSeat.name) {
      tempFormValidation.seatName.valid = true;
    } else {
      tempFormValidation.seatName.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    const requestData = {
      areaUUID: currentAreaUUID,
      seatName: addSeat.name,
      coordX: addSeat.coordX,
      coordY: addSeat.coordY
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
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
          this.getDeviceSeatData(currentAreaUUID);
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle manage dialog
   * @method
   */
  toggleManageDialog = () => {
    this.setState({
      openManage: !this.state.openManage
    });
  }
  /**
   * Handle close on department/title management modal dialog
   * @method
   */
  handleCloseManage = () => {
    this.getOtherData();
    this.toggleManageDialog();
  }
  render() {
    const {baseUrl, contextRoot, language} = this.context;
    const {
      activeTab,
      activeContent,
      showFilter,
      showSeatData,
      modalFloorOpen,
      modalIRopen,
      addSeatOpen,
      uploadOpen,
      openManage,
      contextAnchor,
      menuType,
      LAconfig,
      deviceEventsData,
      eventsDateList,
      eventsDate,
      deviceLAdata,
      deviceData,
      currentDeviceData,
      mapAreaUUID,
      currentMap,
      currentBaseLayers,
      deviceSeatData,
      floorPlan,
      ownerInfo,
      activeIPdeviceUUID,
      activeSteps,
      addIP,
      csvData,
      showCsvData,
      csvColumns,
      showGlobalLoadingIcon,
      formValidation
    } = this.state;
    const backText = activeTab === 'deviceList' ? t('txt-backToList') : t('txt-backToMap')
    const assetsPath = `${contextRoot}/lib/keylines/assets/`;
    const tableOptions = {
      onChangePage: (currentPage) => {
        this.handlePaginationChange('currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort(changedColumn, direction === 'desc');
      },
      setRowProps: (row, dataIndex, rowIndex) => {
        if (!row[0]) {
          return;
        }

        const allValue = row[0](rowIndex, 'getAllValue');
        const tableUniqueID = allValue.ipDeviceUUID;

        if (tableUniqueID === activeIPdeviceUUID) {
          return {
            className: 'grey'
          };
        }
      }
    };
    let picPath = '';
    let csvHeaderList = [];

    if (!_.isEmpty(currentDeviceData)) {
      picPath = (currentDeviceData.ownerObj && currentDeviceData.ownerObj.base64) ? currentDeviceData.ownerObj.base64 : contextRoot + '/images/empty_profile.png'
    }

    if (!_.isEmpty(csvData)) {
      _.forEach(csvData[0], (val, i) => {
        if (val) {
          csvHeaderList.push(
            <MenuItem key={i} value={i}>{val}</MenuItem>
          );
        }
      })
    }

    return (
      <div>
        {showSeatData &&
          this.showSeatDialog()
        }

        {addSeatOpen &&
          this.addSeatDialog()
        }

        {uploadOpen &&
          this.uploadDialog()
        }

        {modalFloorOpen &&
          <FloorMap
            closeDialog={this.closeFloorDialog} />
        }

        {modalIRopen &&
          <IrSelections
            currentDeviceData={currentDeviceData}
            toggleSelectionIR={this.toggleSelectionIR}
            triggerTask={this.triggerTask} />
        }

        {openManage &&
          <Manage
            handleCloseManage={this.handleCloseManage} />
        }

        {showGlobalLoadingIcon &&
          <div id='g-progress-container'>
            <span>
              <section id='g-progress' className='c-modal show c-center global spin'>
                <div id='overlay'></div>
                <section id='g-progress-dialog' className='c-box dialog'>
                  <div id='g-progress-content' className='content'>
                    <i className='fg fg-loading-2 fg-spin'></i>
                  </div>
                </section>
              </section>
            </span>
          </div>
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            {((activeTab === 'deviceList' && activeContent === 'tableList') || activeTab === 'deviceMap' || activeTab === 'deviceLA') &&
              <div>
                <Button variant='outlined' color='primary' className={cx({'active': showFilter})} onClick={this.toggleFilter} title={t('events.connections.txt-toggleFilter')} disabled={activeContent !== 'tableList'}><i className='fg fg-filter'></i></Button>
                {activeTab === 'deviceList' &&
                  <Button variant='outlined' color='primary' className='last' onClick={this.getCSVfile} title={t('txt-exportCSV')}><i className='fg fg-data-download'></i></Button>
                }
              </div>
            }
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          {activeContent === 'tableList' &&
            <div className='parent-content'>
              {this.renderFilter()}

              <div className='main-content'>
                <Tabs
                  indicatorColor='primary'
                  textColor='primary'
                  value={activeTab}
                  onChange={this.handleSubTabChange}>
                  <Tab label={t('network-inventory.txt-deviceList')} value='deviceList' />
                  <Tab label={t('network-inventory.txt-deviceMap')} value='deviceMap' />
                  <Tab label={t('network-inventory.txt-deviceLA')} value='deviceLA' />
                </Tabs>

                <div className={cx('content-header-btns', {'with-menu': activeTab === 'deviceList'})}>
                  {activeTab !== 'deviceLA' &&
                    <Button variant='outlined' color='primary' className='standard btn' onClick={this.handleOpenMenu.bind(this, 'addIP')}>{t('network-inventory.txt-addIP')}</Button>
                  }
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'autoSettings')}>{t('network-inventory.txt-autoSettings')}</Button>
                  {activeTab === 'deviceMap' &&
                    <Button variant='outlined' color='primary' className='standard btn' onClick={this.openFloorMap} >{t('network-topology.txt-editFloorMap')}</Button>
                  }
                </div>

                <Menu
                  anchorEl={contextAnchor}
                  keepMounted
                  open={menuType && Boolean(contextAnchor)}
                  onClose={this.handleCloseMenu}>
                  <MenuItem onClick={this.toggleContent.bind(this, 'showForm', 'new')}>{t('network-inventory.txt-manuallyEnter')}</MenuItem>
                  <MenuItem onClick={this.toggleContent.bind(this, 'showUpload')}>{t('network-inventory.txt-batchUpload')}</MenuItem>
                </Menu>

                {activeTab === 'deviceList' && !showCsvData &&
                  <MuiTableContent
                    data={deviceData}
                    tableOptions={tableOptions} />
                }

                {activeTab === 'deviceMap' && !showCsvData &&
                  <div className='inventory-map'>
                    <div className='tree'>
                      {floorPlan.treeData && floorPlan.treeData.length > 0 &&
                        floorPlan.treeData.map(this.displayTreeView.bind(this, 'deviceMap'))
                      }
                    </div>
                    <div className='map'>
                      {currentMap.label &&
                        <Gis
                          _ref={(ref) => {this.gisNode = ref}}
                          data={_.get(deviceSeatData, [mapAreaUUID, 'data'], [])}
                          baseLayers={currentBaseLayers}
                          baseLayer={mapAreaUUID}
                          layouts={['standard']}
                          dragModes={['pan']}
                          scale={{enabled: false}}
                          mapOptions={{
                            maxZoom: 2
                          }}
                          onClick={this.handleFloorMapClick.bind(this, 'deviceMap')} />
                      }
                    </div>
                  </div>
                }

                {activeTab === 'deviceLA' && !showCsvData &&
                  <div className='la-content'>
                    <VbdaLA
                      assetsPath={assetsPath}
                      sourceCfg={LAconfig}
                      events={deviceEventsData}
                      source={deviceLAdata}
                      sourceItemOptions={LAconfig.la}
                      lng={language} />
                    {eventsDateList.length > 0 &&
                      <TextField
                        id='deviceLAdropdown'
                        className='dorp-down'
                        select
                        variant='outlined'
                        size='small'
                        value={eventsDate}
                        onChange={this.handleDeviceDateChange}>
                        {eventsDateList}
                      </TextField>
                    }
                  </div>
                }

                {showCsvData &&
                  <div className='csv-section'>
                    <div className='csv-table'>
                      {this.displayCSVtable()}
                    </div>
                    <section className='csv-dropdown'>
                      <div className='group'>
                        <TextField
                          id='csvColumnIP'
                          name='ip'
                          label={t('ipFields.ip')}
                          select
                          variant='outlined'
                          fullWidth
                          size='small'
                          required
                          error={!formValidation.csvColumnsIp.valid}
                          helperText={formValidation.csvColumnsIp.valid ? '' : t('network-inventory.txt-selectIP')}
                          value={csvColumns.ip}
                          onChange={this.handleColumnChange}>
                          {csvHeaderList}
                        </TextField>
                      </div>
                      <div className='group'>
                        <TextField
                          id='csvColumnMac'
                          name='mac'
                          label={t('ipFields.mac')}
                          select
                          variant='outlined'
                          fullWidth
                          size='small'
                          value={csvColumns.mac}
                          onChange={this.handleColumnChange}>
                          {csvHeaderList}
                        </TextField>
                      </div>
                      <div className='group'>
                        <TextField
                          id='csvColumnHost'
                          name='hostName'
                          label={t('ipFields.hostName')}
                          select
                          variant='outlined'
                          fullWidth
                          size='small'
                          value={csvColumns.hostName}
                          onChange={this.handleColumnChange}>
                          {csvHeaderList}
                        </TextField>
                      </div>
                    </section>

                    <footer>
                      <Button variant='outlined' color='primary' className='standard' onClick={this.uploadActions.bind(this, 'cancel')}>{t('txt-cancel')}</Button>
                      <Button variant='contained' color='primary'
 className='upload' onClick={this.uploadActions.bind(this, 'upload')}>{t('txt-upload')}</Button>
                    </footer>
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
                  <div className='content-header-btns'>
                    <Button variant='outlined' color='primary' className='standard btn list' onClick={this.toggleContent.bind(this, 'showList')}>{backText}</Button>
                    <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'showForm', 'edit')}>{t('txt-edit')}</Button>
                  </div>

                  <PrivateDetails
                    alertInfo={ownerInfo}
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
            <AutoSettings />
          }
        </div>
      </div>
    )
  }
}

NetworkInventory.contextType = BaseDataContext;

NetworkInventory.propTypes = {
};

export default withRouter(NetworkInventory);