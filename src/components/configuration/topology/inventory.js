import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'
import jschardet from 'jschardet'
import queryString from 'query-string'
import XLSX from 'xlsx';

import Checkbox from 'react-ui/build/src/components/checkbox'
import ContextMenu from 'react-ui/build/src/components/contextmenu'
import DataTable from 'react-ui/build/src/components/table'
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

import AutoSettings from './auto-settings'
import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import FileUpload from '../../common/file-upload'
import FilterContent from '../../common/filter-content'
import FloorMap from '../../common/floor-map'
import helper from '../../common/helper'
import HMDsettings from './hmd-settings'
import HMDscanInfo from '../../common/hmd-scan-info'
import IrSelections from '../../common/ir-selections'
import Manage from './manage'
import Pagination from '../../common/pagination'
import PrivateDetails from '../../common/private-details'
import TableContent from '../../common/table-content'
import YaraRule from '../../common/yara-rule'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';
const SAFETY_SCAN_LIST = ['yara', 'scanFile', 'gcb', 'fileIntegrity'];
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
      activeContent: 'tableList', //tableList, dataInfo, addIPsteps, hmdSettings, autoSettings
      showFilter: true,
      showScanInfo: false,
      yaraRuleOpen: false,
      showSeatData: false,
      modalFloorOpen: false,
      modalIRopen: false,
      addSeatOpen: false,
      uplaodOpen: false,
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
      hmdCheckbox: false,
      hmdSelectAll: false,
      hmdSearchOptions: {
        scanProcess: false,
        scanFile: false,
        gcb: false
      },
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
        hmdOnly: {
          dataContent: [],
          currentIndex: '',
          currentLength: ''
        }
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
      csvHeader: true,
      ipUploadFields: ['ip', 'mac', 'hostName', 'errCode'],
      ..._.cloneDeep(MAPS_PRIVATE_DATA)
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

    if (_.isEmpty(inventoryParam) || (!_.isEmpty(inventoryParam) && !inventoryParam.ip)) {
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
    if (!val.result) {
      return;
    }

    if (val.type === 'gcb' && val.result.GCBResultTotalCnt >= 0 && val.result.GCBResultPassCnt >= 0) {
      let colorStyle = '#d10d25'; //Default red color

      if (val.result.GCBResultTotalCnt === val.result.GCBResultPassCnt) { //Show green color for all pass
        colorStyle = '#22ac38';
      }

      return <li key={i} style={{'color': colorStyle}}><span>{val.name} {t('network-inventory.txt-passCount')}/{t('network-inventory.txt-totalItem')}:</span> {val.result.GCBResultPassCnt}/{val.result.GCBResultTotalCnt}</li>
    } else {
      if (val.result.ScanResultTotalCnt >= 0 || val.result.DetectionResultTotalCnt >= 0 || val.result.getFileIntegrityTotalCnt >= 0) {
        let totalCount = 0;
        let colorStyle = '#22ac38'; //Default green color
        let text = t('network-inventory.txt-suspiciousFileCount');

        if (val.type === 'yara') {
          totalCount = val.result.ScanResultTotalCnt;
        } else if (val.type === 'scanFile') {
          totalCount = val.result.DetectionResultTotalCnt;
        } else if (val.type === 'fileIntegrity') {
          totalCount = val.result.getFileIntegrityTotalCnt;
          text = t('network-inventory.txt-modifiedFileCount');
        }

        if (totalCount > 0) { //Show red color
          colorStyle = '#d10d25';
        }

        return <li key={i} style={{'color': colorStyle}}>{val.name} {text}: {totalCount}</li>
      }
    }
  }
  /**
   * Get and set device data / Handle delete IP device confirm
   * @method
   * @param {string} fromSearch - option for 'search'
   * @param {string} options - options for 'oneSeat' and 'delete'
   * @param {string} seatUUID - seat UUID
   */
  getDeviceData = (fromSearch, options, seatUUID) => {
    const {baseUrl} = this.context;
    const {deviceSearch, hmdCheckbox, hmdSearchOptions, deviceData, currentDeviceData} = this.state;
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

      if (hmdCheckbox) {
        dataParams = 'isHmd=true';

        if (hmdSearchOptions.scanProcess) {
          dataParams += '&isScanProc=true';
        }

        if (hmdSearchOptions.scanFile) {
          dataParams += '&isScanFile=true';
        }

        if (hmdSearchOptions.gcb) {
          dataParams += '&isGCB=true';
        }
      }

      dataParams += `&page=${page}&pageSize=${pageSize}&orders=${orders}`;

      if (fromSearch === 'search' || !_.isEmpty(deviceSearch)) {
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

      if (options === 'delete') {
        if (!currentDeviceData.ipDeviceUUID) {
          return;
        }
      }
    }

    let apiArr = [
      {
        url: `${baseUrl}/api/u1/ipdevice/_search?${dataParams}`,
        type: 'GET'
      }
    ];

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
          this.closeDialog('reload');
        }
      } else {
        ipRt = data[0].ret;
        ipData = data[0].rt;
      }

      if (ipRt === 0) {
        let tempDeviceData = {...deviceData};

        if (options === 'oneSeat') {
          let currentDeviceData = {};

          if (ipData.counts > 0) {
            currentDeviceData = ipData.rows[0];
          }

          this.setState({
            showSeatData: true,
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
        tempDeviceData.currentPage = fromSearch === 'search' ? 1 : deviceData.currentPage;

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
                let syncStatus = '';
                let hmdInfo = [];

                if (allValue.syncYaraResult && allValue.syncYaraResult.length > 0) {
                  if (allValue.syncYaraResult[0].status === 'failed') {
                    syncStatus = 'show';
                  }
                }

                _.forEach(SAFETY_SCAN_LIST, val => { //Construct the HMD info array
                  const dataType = val + 'Result';
                  const currentDataObj = allValue[dataType];

                  if (currentDataObj) {
                    hmdInfo.push({
                      type: val,
                      name: t('network-inventory.scan-list.txt-' + val),
                      result: allValue[dataType][0]
                    });
                  }
                })

                return (
                  <ul>
                    {syncStatus &&
                      <li style={{'color': '#d10d25'}}><span>{t('network-inventory.txt-syncYaraFail')}</span></li>
                    }
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
        });
      }
      return null;
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

          this.setState({
            ownerList
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
   * Get single device data from URL parameter
   * @method
   */
  getSingleDeviceData = () => {
    const {baseUrl} = this.context;
    const inventoryParam = queryString.parse(location.search);

    if (!inventoryParam.ip) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/u1/ipdevice/_search?ip=${inventoryParam.ip}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        if (data.counts > 0) {
          this.setState({
            currentDeviceData: data.rows[0]
          }, () => {
            this.toggleContent('showForm', 'edit');
          });
        } else {
          this.getDeviceData(); //No device data is found
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
      if (data) {
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
      }
      return null;
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
  showSeatDialog = () => {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeSeatDialog}
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
   * Close seat dialog
   * @method
   */
  closeSeatDialog = () => {
    this.setState({
      showSeatData: false
    });
  }
  /**
   * Check table sortable fields
   * @method
   * @param {string} field - field name
   * @returns true for sortable or null
   */
  checkSortable = (field) => {
    const unSortableFields = ['owner', 'areaName', 'seatName', 'yaraScan', '_menu', 'scanInfo'];

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
      return null;
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

      if (!options && inventoryParam.type) {
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
   * Get and set floor seat data
   * @method
   * @param {string} areaUUID - area UUID
   */
  getSeatData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.context;
    const area = areaUUID.trim() || this.state.floorPlan.currentAreaUUID;
    const requestData = {
      areaUUID: area
    };

    if (!area) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/seat/_search`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
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
      }
      return null;
    })
  }
  /**
   * Toggle HMD select all checkbox
   * @method
   */
  toggleHMDcheckBox = () => {
    this.setState({
      hmdCheckbox: !this.state.hmdCheckbox
    });
  }  
  /**
   * Toggle HMD options
   * @method
   * @param {string} field - HMD option name
   * @param {boolean} value - true/false
   */
  toggleHMDoptions = (field, value) => {
    let tempHMDsearchOptions = {...this.state.hmdSearchOptions};
    tempHMDsearchOptions[field] = value;

    if (!value) {
      this.setState({
        hmdSelectAll: false
      });
    }

    if (field === 'selectAll') {
      if (value) {
        this.setState({
          hmdSelectAll: true,
          hmdSearchOptions: {
            scanProcess: true,
            scanFile: true,
            gcb: true
          }
        });
      } else {
        this.setState({
          hmdSelectAll: false,
          hmdSearchOptions: {
            scanProcess: false,
            scanFile: false,
            gcb: false
          }
        });
      }
    } else {
      this.setState({
        hmdSearchOptions: tempHMDsearchOptions
      }, () => {
        const {hmdSearchOptions} = this.state;
        const hmdOptions = ['scanProcess', 'scanFile', 'gcb'];
        let count = 0;

        _.forEach(hmdSearchOptions, (val, key) => {
          if (hmdSearchOptions[key]) {
            count++;
          }
        })

        if (count === hmdOptions.length) {
          this.setState({
            hmdSelectAll: true
          });
        }
      });
    }
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
    const {showFilter, hmdCheckbox, hmdSelectAll, hmdSearchOptions, deviceSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})} style={{'minHeight' : '220px'}}>
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
            <label htmlFor='deviceSearchSystem'>{t('ipFields.system')}</label>
            <input
              id='deviceSearchSystem'
              type='text'
              value={deviceSearch.system}
              onChange={this.handleDeviceSearch.bind(this, 'system')} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchOwner'>{t('ipFields.owner')}</label>
            <input
              id='deviceSearchOwner'
              type='text'
              value={deviceSearch.owner}
              onChange={this.handleDeviceSearch.bind(this, 'owner')} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchAreaName'>{t('ipFields.areaName')}</label>
            <input
              id='deviceSearchAreaName'
              type='text'
              value={deviceSearch.areaName}
              onChange={this.handleDeviceSearch.bind(this, 'areaName')} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchSeatName'>{t('ipFields.seatName')}</label>
            <input
              id='deviceSearchSeatName'
              type='text'
              value={deviceSearch.seatName}
              onChange={this.handleDeviceSearch.bind(this, 'seatName')} />
          </div>
          <div className='group last'>
            <label htmlFor='hmdCheckbox'>HMD</label>
            <Checkbox
              id='hmdCheckbox'
              checked={hmdCheckbox}
              onChange={this.toggleHMDcheckBox} />
          </div>
          <div className='group group-checkbox'>
            <div className='group-options'>
              <div className='option'>
                <label htmlFor='hmdSelectAll' className={cx({'active': hmdCheckbox})}>{t('txt-selectAll')}</label>
                <Checkbox
                  id='hmdSelectAll'
                  checked={hmdSelectAll}
                  onChange={this.toggleHMDoptions.bind(this, 'selectAll')}
                  disabled={!hmdCheckbox} />
              </div>
              <div className='option'>
                <label htmlFor='hmdScanProcess' className={cx({'active': hmdCheckbox})}>Scan Process</label>
                <Checkbox
                  id='hmdScanProcess'
                  checked={hmdSearchOptions.scanProcess}
                  onChange={this.toggleHMDoptions.bind(this, 'scanProcess')}
                  disabled={!hmdCheckbox} />
              </div>
              <div className='option'>
                <label htmlFor='hmdScanFile' className={cx({'active': hmdCheckbox})}>Scan File</label>
                <Checkbox
                  id='hmdScanFile'
                  checked={hmdSearchOptions.scanFile}
                  onChange={this.toggleHMDoptions.bind(this, 'scanFile')}
                  disabled={!hmdCheckbox} />
              </div>
              <div className='option'>
                <label htmlFor='hmdGCB' className={cx({'active': hmdCheckbox})}>GCB</label>
                <Checkbox
                  id='hmdGCB'
                  checked={hmdSearchOptions.gcb}
                  onChange={this.toggleHMDoptions.bind(this, 'gcb')}
                  disabled={!hmdCheckbox} />
              </div>
            </div>
          </div>
        </div>
        <div className='button-group group-aligned'>
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
      const {hmdCheckbox, deviceData} = this.state;

      if (!hmdCheckbox) {
        _.forEach(deviceData.hmdOnly.dataContent, (val, i) => {
          if (val.ipDeviceUUID === allValue.ipDeviceUUID) {
            index = i;
            return false;
          }
        })
      }

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
      if (deviceData.hmdOnly.currentIndex !== 0) {
        tempDeviceData.hmdOnly.currentIndex--;
      }
    } else if (type === 'next') {
      if (deviceData.hmdOnly.currentLength - deviceData.hmdOnly.currentIndex > 1) {
        tempDeviceData.hmdOnly.currentIndex++;
      }
    }

    this.setState({
      deviceData: tempDeviceData,
      showSeatData: false
    }, () => {
      const {deviceData} = this.state;
      const index = deviceData.hmdOnly.currentIndex;
      const allValue = deviceData.hmdOnly.dataContent[index];

      this.getIPdeviceInfo(index, allValue.ipDeviceUUID);
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
          this.getDeviceData('', 'delete');
        }
      }
    });

    this.setState({
      showSeatData: false
    });
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
   * @param {string | number} ipDeviceUUID - IP device UUID
   * @param {string} options - option for 'oneDevice'
   */
  getIPdeviceInfo = (index, ipDeviceUUID, options) => {
    const {baseUrl} = this.context;
    let tempDeviceData = {...this.state.deviceData};

    if (!ipDeviceUUID) {
      return;
    }

    if (index || index.toString()) {
      tempDeviceData.hmdOnly.currentIndex = Number(index);
    }

    this.ah.one({
      url: `${baseUrl}/api/u1/ipdevice?uuid=${ipDeviceUUID}&page=1&pageSize=5`,
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
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle yara rule modal dialog on/off
   * @method
   */
  toggleYaraRule = () => {
    this.setState({
      yaraRuleOpen: !this.state.yaraRuleOpen
    });
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
   * @param {string | object} options - option for 'fromInventory' or yara rule object
   */
  triggerTask = (type, options) => {
    const {baseUrl} = this.context;
    const {currentDeviceData} = this.state;
    const url = `${baseUrl}/api/hmd/retrigger`;
    let requestData = {
      hostId: currentDeviceData.ipDeviceUUID,
      cmds: type
    };

    if (type[0] === 'compareIOC') {
      const yaraRule = _.cloneDeep(options);

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

        if (type.length > 0 && options !== 'fromInventory') {
          this.getIPdeviceInfo('', currentDeviceData.ipDeviceUUID);
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
        <table className='c-table main-table align-center with-border'>
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
          page='inventory'
          currentDeviceData={currentDeviceData}
          showAlertData={this.showAlertData}
          toggleYaraRule={this.toggleYaraRule}
          toggleSelectionIR={this.toggleSelectionIR}
          triggerTask={this.triggerTask} />

        {deviceData.hmdOnly.currentLength > 1 &&
          <div className='pagination'>
            <div className='buttons'>
              <button onClick={this.showAlertData.bind(this, 'previous')} disabled={deviceData.hmdOnly.currentIndex === 0}>{t('txt-previous')}</button>
              <button onClick={this.showAlertData.bind(this, 'next')} disabled={deviceData.hmdOnly.currentIndex + 1 === deviceData.hmdOnly.currentLength}>{t('txt-next')}</button>
            </div>
            <span className='count'>{deviceData.hmdOnly.currentIndex + 1} / {deviceData.hmdOnly.currentLength}</span>
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
  showScanInfoDialog = () => {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeScanInfoDialog}
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
   * Close scan info dialog
   * @method
   */
  closeScanInfoDialog = () => {
    this.setState({
      showScanInfo: false
    });
  }
  /**
   * Close HMD scan info dialog
   * @method
   * @param {string} options - option for 'reload'
   * @param {string} page - page type
   */
  closeDialog = (options, page) => {
    const {currentDeviceData, floorPlan} = this.state;

    if (page === 'fromFloorMap' && floorPlan.treeData[0]) {
      let tempCurrentDeviceData = {...currentDeviceData};
      tempCurrentDeviceData.areaUUID = floorPlan.treeData[0].areaUUID; //Reset selected tree to parent areaUUID
      
      this.setState({
        currentDeviceData: tempCurrentDeviceData
      });
    }

    this.setState({
      modalFloorOpen: false
    }, () => {
      if (options === 'reload') {
        if (page === 'fromFloorMap') { //reload everything
          this.getFloorPlan('fromFloorMap');
        } else { //reload area and seat (no tree)
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
      hmdCheckbox: false,
      hmdSelectAll: false,
      hmdSearchOptions: {
        scanProcess: false,
        scanFile: false,
        gcb: false,
        ir: false
      }
    });
  }
  /**
   * Toggle Inventory content
   * @method
   * @param {string} type - content type
   * @param {string} formType - show form content type ('new' or 'edit')
   */
  toggleContent = (type, formType) => {
    const {formTypeEdit, ownerList, departmentList, titleList, currentDeviceData, alertInfo, floorList, addSeat} = this.state;
    let tempAddSeat = {...addSeat};
    let activeContent = '';

    if (type === 'cancel') {
      if (formTypeEdit) {
        activeContent = 'dataInfo';
      } else {
        activeContent = 'tableList';
      }
    } else if (type === 'showList') {
      activeContent = 'tableList';
    } else if (type === 'hmdSettings' || type === 'autoSettings') {
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

        tempAddSeat.selectedSeatUUID = currentDeviceData.seatUUID;
      } else if (formType === 'new') {
        const inventoryParam = queryString.parse(location.search);
        formTypeEdit = false;

        if (!_.isEmpty(floorList)) {
          this.getAreaData(floorList[0].value);
          this.getSeatData(floorList[0].value);
        }

        this.setState({
          currentDeviceData: {},
          selectedTreeID: ''
        });

        if (_.isEmpty(inventoryParam) || (!_.isEmpty(inventoryParam) && !inventoryParam.ip)) {
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
        ownerIDduplicated: false,
        addSeat: tempAddSeat,
        changeAreaMap: false
      });
      return;
    } else if (type === 'showUpload') {
      this.toggleFileUpload();
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
   * Handle HMD download button
   * @method
   * @param {string} type - download type ('windows' or 'linux')
   */
  hmdDownload = (type) => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/hmd/download?ver=${type}`;
    window.open(url, '_blank');
  }
  /**
   * Construct and display add IP context menu
   * @method
   * @param {string} type - context menu type ('addIP' or 'download')
   * @param {object} evt - mouseClick events
   */
  handleRowContextMenu = (type, evt) => {
    let menuItems = [];
    let menuType = '';

    if (type === 'addIP') {
      menuItems = [
        {
          id: 'showForm',
          text: t('network-inventory.txt-manuallyEnter'),
          action: () => this.toggleContent('showForm', 'new')
        },
        {
          id: 'showUpload',
          text: t('network-inventory.txt-batchUpload'),
          action: () => this.toggleContent('showUpload')
        }
      ];
      menuType = 'addIpMenu';
    } else if (type === 'download') {
      menuItems = [
        {
          id: 'windows',
          text: 'Windows',
          action: () => this.hmdDownload('windows')
        },
        {
          id: 'linux',
          text: 'Linux',
          action: () => this.hmdDownload('linux')
        }
      ];
      menuType = 'downloadMenu';
    }

    ContextMenu.open(evt, menuItems, menuType);
    evt.stopPropagation();
  }
  /**
   * Handle CSV batch upload
   * @method
   * @param {object} file - file uploaded by the user
   */
  parseFile = async (file) => {
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
            handleFileChange={this.parseFile} />
          <div className='csv-options'>
            <label htmlFor='csvHeaderOption'>{t('network-inventory.txt-withHeader')}</label>
            <Checkbox
              id='csvHeaderOption'
              checked={csvHeader}
              onChange={this.toggleCsvHeader} />
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
   * @param {string} type - dropdown selection type ('ip', 'mac' or 'hostName')
   * @param {string} value - selected value from dropdown
   */
  handleColumnChange = (type, value) => {
    let tempCsvColumns = {...this.state.csvColumns};
    tempCsvColumns[type] = value;

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
    const {csvData, csvColumns, csvHeader, ipUploadFields} = this.state;
    const ipPattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    const macPattern = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i;

    if (type === 'upload') {
      if (!csvColumns.ip) {
        helper.showPopupMsg(t('network-inventory.txt-selectIP'), t('txt-error'));
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
              if (csvColumns[val2]) {
                let data = val[Number(csvColumns[val2])];

                if (typeof data === 'string') {
                  data = data.trim();
                }

                dataObj[val2] = data;
              }
            })
          }

          if (dataObj.ip) {
            if (!ipPattern.test(dataObj.ip)) { //Check IP format
              validate = false;
              helper.showPopupMsg(t('network-inventory.txt-uploadFailedIP'));
              return false;
            }

            if (dataObj.mac && !macPattern.test(dataObj.mac)) { //Check MAC format
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
        }
      }, () => {
        this.getDeviceData();
      });
    }
  }
  /**
   * Check add/edit step form validation
   * @method
   * @param {number} step - form step
   * @returns true if form is invalid
   */
  checkFormValidation = (step) => {
    const inventoryParam = queryString.parse(location.search);
    const {addIP, ownerType} = this.state;

    if (step === 1) {
      if (!addIP.ip || (!_.has(inventoryParam, 'hostName') && !addIP.mac)) {
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
   * Check if IP aready exists in inventory
   * @method
   */
  checkDuplicatedIP = () => {
    const {baseUrl} = this.context;
    const {addIP} = this.state;

    if (!addIP.ip) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/u1/ipdevice/_search?exactIp=${addIP.ip}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        if (data.counts > 0) {
          helper.showPopupMsg(t('network-inventory.txt-duplicatedIP'), t('txt-error'));
        } else {
          this.setState({
            activeSteps: 2
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
    const {activeSteps, formTypeEdit} = this.state;
    let tempActiveSteps = activeSteps;

    if (type === 'previous') {
      tempActiveSteps--;

      this.setState({
        activeSteps: tempActiveSteps
      });
    } else if (type === 'next') {
      if (activeSteps === 1) {
        if (this.checkFormValidation(1)) {
          helper.showPopupMsg(et('fill-required-fields'), t('txt-error'));
          return;
        } else {
          if (formTypeEdit) {
            this.setState({
              activeSteps: 2
            });
          } else { //Check duplicated IP for adding new device
            this.checkDuplicatedIP();
          }
        }
      } else {
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
        if (data) {
          const ownerUUID = data;
          this.handleIPdeviceConfirm(ownerUUID);
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

    if (!value) {
      return;
    }

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
    this.manage.openManage();
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
   * Check if MAC is required field or not
   * @method
   * @returns boolean true/false
   */
  checkMacRequired = () => {
    const inventoryParam = queryString.parse(location.search);

    return !_.has(inventoryParam, 'hostName');
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
                <label htmlFor='addIPstepsIP'>{t('ipFields.ip')}</label>
                <Input
                  id='addIPstepsIP'
                  required={true}
                  validate={{
                    pattern: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
                    patternReadable: 'xxx.xxx.xxx.xxx',
                    t: et
                  }}
                  value={addIP.ip}
                  onChange={this.handleAddIpChange.bind(this, 'ip')}
                  readOnly={formTypeEdit} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsMac'>{t('ipFields.mac')}</label>
                <Input
                  id='addIPstepsMac'
                  required={this.checkMacRequired()}
                  validate={{
                    pattern: /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i,
                    patternReadable: '1)MM:MM:MM:SS:SS:SS 2)MM-MM-MM-SS-SS-SS',
                    t: et
                  }}
                  value={addIP.mac}
                  onChange={this.handleAddIpChange.bind(this, 'mac')} />
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
                  value={hostNameField}
                  onChange={this.handleAddIpChange.bind(this, 'hostName')}
                  readOnly={hostNameReadyOnly} />
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
                  value={addIP.system}
                  onChange={this.handleAddIpChange.bind(this, 'system')}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsDeviceType'>{t('ipFields.deviceType')}</label>
                <Input
                  id='addIPstepsDeviceType'
                  value={addIP.deviceType}
                  onChange={this.handleAddIpChange.bind(this, 'deviceType')}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsUser'>{t('ipFields.userAccount')}</label>
                <Input
                  id='addIPstepsUser'
                  value={addIP.userName}
                  onChange={this.handleAddIpChange.bind(this, 'userName')}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsCPU'>{t('txt-cpu')}</label>
                <Input
                  id='addIPstepsCPU'
                  value={addIP.cpu}
                  onChange={this.handleAddIpChange.bind(this, 'cpu')}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsRam'>{t('txt-ram')}</label>
                <Input
                  id='addIPstepsRam'
                  value={addIP.ram}
                  onChange={this.handleAddIpChange.bind(this, 'ram')}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsDisks'>{t('txt-disks')}</label>
                <Textarea
                  id='addIPstepsDisks'
                  rows={3}
                  value={addIP.disks}
                  onChange={this.handleAddIpChange.bind(this, 'disks')}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsFolders'>{t('txt-shareFolders')}</label>
                <Textarea
                  id='addIPstepsFolders'
                  rows={3}
                  value={addIP.shareFolders}
                  onChange={this.handleAddIpChange.bind(this, 'shareFolders')}
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
                value={ownerType}
                onChange={this.handleOwnerTypeChange} />
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
                      value={addIP.ownerUUID}
                      onChange={this.handleOwnerChange} />
                  </div>
                }
                {ownerType === 'new' &&
                  <div className='group'>
                    <label htmlFor='addIPstepsOwnerName'>{t('ownerFields.ownerName')}</label>
                    <Input
                      id='addIPstepsOwnerName'
                      required={true}
                      validate={{
                        t: et
                      }}
                      value={addIP.newOwnerName}
                      onChange={this.handleAddIpChange.bind(this, 'newOwnerName')} />
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
                      required={true}
                      validate={{
                        t: et
                      }}
                      value={addIP.newOwnerID}
                      onChange={this.handleAddIpChange.bind(this, 'newOwnerID')} />
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
                      value={addIP.newDepartment}
                      onChange={this.handleDepartmentChange} />
                  </div>
                }
                {ownerType === 'existing' && !_.isEmpty(ownerList) &&
                  <div className='group'>
                    <label htmlFor='addIPstepsTitle'>{t('ownerFields.title')}</label>
                    <Input
                      id='addIPstepsTitle'
                      value={addIP.title}
                      readOnly={true} />
                  </div>
                }
                {ownerType === 'new' &&
                  <div className='group'>
                    <label htmlFor='addIPstepsTitle'>{t('ownerFields.title')}</label>
                    <DropDownList
                      id='addIPstepsTitle'
                      list={titleList}
                      required={true}
                      value={addIP.newTitle}
                      onChange={this.handleTitleChange} />
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
                    floorPlan.treeData.map(this.displayTree.bind(this, 'stepsFloor'))
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
                      mapOptions={{
                        maxZoom: 2
                      }}
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
      floorPlan: tempFloorPlan,
      changeAreaMap: true,
      selectedTreeID: areaUUID
    }, () => {
      this.getAreaData(areaUUID);
      this.getSeatData(areaUUID);
    });
  }
  /**
   * Display floor tree data
   * @method
   * @param {object} tree - tree data
   * @param {string} selectedID - selected area UUID
   * @param {number} i - index of the floor plan data
   * @returns TreeView component
   */
  getTreeView = (tree, selectedID, i) => {
    const {currentDeviceData, changeAreaMap, selectedTreeID} = this.state;
    let defaultSelectedID = selectedTreeID || tree.areaUUID;

    if (changeAreaMap) {
      if (selectedID) {
        defaultSelectedID = selectedID;
      }
    } else {
      if (currentDeviceData && currentDeviceData.areaUUID) {
        defaultSelectedID = currentDeviceData.areaUUID;
      }
    }

    return (
      <TreeView
        id={tree.areaUUID}
        key={tree.areaUUID}
        data={tree}
        selected={defaultSelectedID}
        defaultOpened={this.getDefaultFloor(defaultSelectedID)}
        onSelect={this.selectTree.bind(this, i)} />
    )
  }
  /**
   * Handle floor tree data
   * @method
   * @param {string} type - map type ('deviceMap' or 'stepsFloor')
   * @param {object} val - floor plan data
   * @param {number} i - index of the floor plan data
   * @returns content of TreeView component
   */
  displayTree = (type, val, i) => {
    const {floorPlan, currentDeviceData, changeAreaMap} = this.state;
    let currentAreaUUID = floorPlan.currentAreaUUID;

    if (type === 'stepsFloor') {
      if (!changeAreaMap && currentDeviceData.areaUUID) {
        currentAreaUUID = currentDeviceData.areaUUID;
      }
    }

    return this.getTreeView(val, currentAreaUUID, i);
  }
  /**
   * Handle floor map mouse click
   * @method
   * @param {string} seatUUID - selected seat UUID
   * @param {object} info - mouseClick events
   */
  handleFloorMapClick = (seatUUID, info) => {
    const {addSeat} = this.state;
    let tempAddSeat = {...addSeat};

    if (seatUUID) {
      tempAddSeat.selectedSeatUUID = seatUUID;

      this.setState({
        addSeat: tempAddSeat
      });
    } else { //Add new seat
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
    this.setState({
      addSeatOpen: false,
      addSeat: {
        selectedSeatUUID: '',
        name: '',
        coordX: '',
        coordY: ''
      }
    });
  }
  /**
   * Handle add seat confirm
   * @method
   */
  handleAddSeatConfirm = () => {
    const {baseUrl} = this.context;
    const {floorPlan, currentDeviceData, addSeat, changeAreaMap} = this.state;
    const url = `${baseUrl}/api/seat`;
    let currentAreaUUID = floorPlan.currentAreaUUID;

    if (!changeAreaMap && currentDeviceData.areaUUID) {
      currentAreaUUID = currentDeviceData.areaUUID;
    }

    if (!addSeat.name) {
      helper.showPopupMsg(t('network-topology.txt-seatNameEmpty'), t('txt-error'));
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
          this.getAreaData(currentAreaUUID);
          this.getSeatData(currentAreaUUID);
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {
      activeTab,
      activeContent,
      showFilter,
      showScanInfo,
      yaraRuleOpen,
      showSeatData,
      modalFloorOpen,
      modalIRopen,
      addSeatOpen,
      uploadOpen,
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
      addIP,
      csvData,
      showCsvData,
      csvColumns
    } = this.state;
    const backText = activeTab === 'deviceList' ? t('network-inventory.txt-backToList') : t('network-inventory.txt-backToMap')
    let picPath = '';
    let csvHeaderList = [];

    if (!_.isEmpty(currentDeviceData)) {
      picPath = (currentDeviceData.ownerObj && currentDeviceData.ownerObj.base64) ? currentDeviceData.ownerObj.base64 : contextRoot + '/images/empty_profile.png'
    }

    if (!_.isEmpty(csvData)) {
      _.forEach(csvData[0], (val, i) => {
        csvHeaderList.push({
          value: i,
          text: val
        })
      })
    }

    return (
      <div>
        {showSeatData &&
          this.showSeatDialog()
        }

        {showScanInfo &&
          this.showScanInfoDialog()
        }

        {yaraRuleOpen &&
          <YaraRule
            toggleYaraRule={this.toggleYaraRule}
            triggerTask={this.triggerTask} />
        }

        {addSeatOpen &&
          this.addSeatDialog()
        }

        {uploadOpen &&
          this.uploadDialog()
        }

        {modalFloorOpen &&
          <FloorMap
            closeDialog={this.closeDialog} />
        }

        {modalIRopen &&
          <IrSelections
            toggleSelectionIR={this.toggleSelectionIR}
            triggerTask={this.triggerTask} />
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
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

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

                <div className='content-header-btns'>
                  <button className='standard btn' onClick={this.handleRowContextMenu.bind(this, 'addIP')}>{t('network-inventory.txt-addIP')}</button>
                  <button className='standard btn' onClick={this.toggleContent.bind(this, 'hmdSettings')}>{t('network-inventory.txt-hmdSettings')}</button>
                  <button className='standard btn' onClick={this.handleRowContextMenu.bind(this, 'download')}>{t('network-inventory.txt-hmdDownload')}</button>
                  <button className='standard btn' onClick={this.toggleContent.bind(this, 'autoSettings')}>{t('network-inventory.txt-autoSettings')}</button>
                  <Link to='/SCP/configuration/notifications'><button className='standard btn'>{t('notifications.txt-settings')}</button></Link>
                </div>

                {showCsvData &&
                  <div className='csv-section'>
                    <div className='csv-table'>
                      {this.displayCSVtable()}
                    </div>
                    <section className='csv-dropdown'>
                      <div className='group'>
                        <label htmlFor='csvColumnIP'>{t('ipFields.ip')}*</label>
                        <DropDownList
                          id='csvColumnIP'
                          list={csvHeaderList}
                          required={true}
                          value={csvColumns.ip}
                          onChange={this.handleColumnChange.bind(this, 'ip')} />
                      </div>
                      <div className='group'>
                        <label htmlFor='csvColumnMac'>{t('ipFields.mac')}</label>
                        <DropDownList
                          id='csvColumnMac'
                          list={csvHeaderList}
                          value={csvColumns.mac}
                          onChange={this.handleColumnChange.bind(this, 'mac')} />
                      </div>
                      <div className='group'>
                        <label htmlFor='csvColumnHost'>{t('ipFields.hostName')}</label>
                        <DropDownList
                          id='csvColumnHost'
                          list={csvHeaderList}
                          value={csvColumns.hostName}
                          onChange={this.handleColumnChange.bind(this, 'hostName')} />
                      </div>
                    </section>

                    <footer>
                      <button className='standard' onClick={this.uploadActions.bind(this, 'cancel')}>{t('txt-cancel')}</button>
                      <button className='upload' onClick={this.uploadActions.bind(this, 'upload')}>{t('txt-upload')}</button>
                    </footer>
                  </div>
                }

                {activeTab === 'deviceList' && !showCsvData &&
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

                {activeTab === 'deviceMap' && !showCsvData &&
                  <div className='inventory-map'>
                    <div className='tree'>
                      {floorPlan.treeData && floorPlan.treeData.length > 0 &&
                        floorPlan.treeData.map(this.displayTree.bind(this, 'deviceMap'))
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
                          mapOptions={{
                            maxZoom: 2
                          }}
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

                  <div className='content-header-btns'>
                    <button className='standard btn list' onClick={this.toggleContent.bind(this, 'showList')}>{backText}</button>
                    <button className='standard btn edit' onClick={this.toggleContent.bind(this, 'showForm', 'edit')}>{t('txt-edit')}</button>
                  </div>

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

          {activeContent === 'hmdSettings' &&
            <HMDsettings />
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