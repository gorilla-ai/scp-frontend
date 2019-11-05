import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import ButtonGroup from 'react-ui/build/src/components/button-group'
import Checkbox from 'react-ui/build/src/components/checkbox'
import CheckboxGroup from 'react-ui/build/src/components/checkbox-group'
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
import {HocConfig as Config} from '../../common/configuration'
import {HocFilterContent as FilterContent} from '../../common/filter-content'
import {HocFloorMap as FloorMap} from '../../common/floor-map'
import helper from '../../common/helper'
import Manage from '../topology/owner-mixname'
import {HocPagination as Pagination} from '../../common/pagination'
import {HocPrivateDetails as PrivateDetails} from '../../common/private-details'
import TableContent from '../../common/table-content'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';
const MAPS_PRIVATE_DATA = {
  floorList: [],
  currentFloor: '',
  mapAreaUUID: '',
  currentMap: '',
  currentBaseLayers: {},
  seatData: {}
};
const DEFAULT_IR_SELECTED = [2, 4, 5, 6, 9, 10];

let t = null;
let f = null;
let et = null;

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
      activeScanType: 'process', //process, ir
      activePath: null,
      activeRuleHeader: false,
      activeRule: [],
      activeDLL: false,
      activeConnections: false,
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
        dataFieldsArr: ['ip', 'mac', 'hostName', 'system', 'owner', 'areaName', 'seatName', 'yaraScan', '_menu'],
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
      ownerType: 'existing', //existing, new,
      ownerIDduplicated: false,
      previewOwnerPic: '',
      irComboSelected: 'quick', //quick, standard, full
      irItemSelected: DEFAULT_IR_SELECTED,
      ..._.cloneDeep(MAPS_PRIVATE_DATA)
    };

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    et = chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getDeviceData();
    this.getOwnerData();
    this.getOtherData();
    this.getFloorPlan();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state === 'tableList') {
      this.toggleContent('showList');
    }
  }
  getDeviceData = (fromSearch, options, seatUUID) => {
    const {baseUrl, contextRoot} = this.props;
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
        if (data.counts > 0) {
          this.setState({
            showSeatData: true,
            currentDeviceData: data.rows[0]
          });
          return null;
        }
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

      let dataFields = {};
      deviceData.dataFieldsArr.forEach(tempData => {
        dataFields[tempData] = {
          label: tempData === '_menu' ? '' : t(`ipFields.${tempData}`),
          sortable: this.checkSortable(tempData),
          formatter: (value, allValue, index) => {
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
            } else if (tempData === 'yaraScan') {
              if (allValue.yaraResult && allValue.yaraResult.ScanResult) {
                const yaraCount = allValue.yaraResult.ScanResult.length;
                let styleStatus = '#22ac38';

                if (yaraCount > 0) {
                  styleStatus = '#d0021b';
                }
                return <span style={{color: styleStatus}}>{yaraCount}</span>
              } else {
                return <span>N/A</span>
              }
            } else if (tempData === '_menu') {
              return (
                <div className='table-menu menu active'>
                  <i className='fg fg-eye' onClick={this.openMenu.bind(this, 'view', allValue, index)} title={t('network-inventory.txt-viewDevice')}></i>
                  {allValue.isHmd &&
                    <i className='fg fg-chart-kpi' onClick={this.openMenu.bind(this, 'hmd', allValue, index)} title={t('network-inventory.txt-viewHMD')}></i>
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

      tempDeviceData.dataFields = dataFields;

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
  getOwnerData = () => {
    const {baseUrl, contextRoot} = this.props;
    const url = `${baseUrl}/api/owner/_search`;
    const data = {
      sort: 'ownerID',
      order: 'asc'
    };

    helper.getAjaxData('POST', url, data)
    .then(data => {
      if (data && data.rows.length > 0) {
        const ownerList = _.map(data.rows, val => {
          return {
            value: val.ownerUUID,
            text: val.ownerName
          };
        });

        this.setState({
          ownerList
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'));
    });
  }
  getOtherData = () => {
    const {baseUrl, contextRoot} = this.props;
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

      _.forEach(data[0], val => {
        departmentList.push({
          value: val.nameUUID,
          text: val.name
        });
      })

      _.forEach(data[1], val => {
        titleList.push({
          value: val.nameUUID,
          text: val.name
        });
      })

      const tempAddIP = {...addIP};
      tempAddIP.newDepartment = departmentList[0].value;
      tempAddIP.newTitle = titleList[0].value;

      this.setState({
        departmentList,
        titleList,
        addIP: tempAddIP
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
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
          <i className='fg fg-eye' onClick={this.openMenu.bind(this, 'view', currentDeviceData)} title={t('network-inventory.txt-viewDevice')}></i>
          <i className='fg fg-chart-kpi' onClick={this.openMenu.bind(this, 'hmd', currentDeviceData)} title={t('network-inventory.txt-viewHMD')}></i>
          <i className='fg fg-trashcan' onClick={this.openMenu.bind(this, 'delete', currentDeviceData)} title={t('network-inventory.txt-deleteDevice')}></i>
        </div>
        <div className='main header'>{t('alert.txt-systemInfo')}</div>
        <div>{t('ipFields.hostName')}: {deviceInfo.hostName}</div>
        <div>{t('ipFields.system')}: {deviceInfo.system}</div>
      </div>
    )
  }
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
  checkSortable = (field) => {
    const unSortableFields = ['options', 'owner', '_menu'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  getFloorPlan = () => {
    const {baseUrl, contextRoot} = this.props;

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
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
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

    currentFloor = floorList[0].value;

    this.setState({
      floorList,
      currentFloor
    }, () => {
      this.getAreaData(currentFloor);
      this.getSeatData(currentFloor);
    });
  }
  getAreaData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.props;
    const mapAreaUUID = areaUUID;

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
  getSeatData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.props;
    const area = areaUUID || this.state.floorPlan.currentAreaUUID;
    const dataObj = {
      areaUUID: area
    };

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
  toggleHMDonly = (value) => {
    this.setState({
      showHMDonly: value
    });
  }
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
  openMenu = (type, allValue, index) => {
    if (type === 'view') {
      this.getOwnerSeat(allValue);
    } else if (type === 'hmd') {
      this.getIPdeviceInfo(index, allValue.ipDeviceUUID);
    } else if (type === 'delete') {
      this.openDeleteDeviceModal(allValue);
    }
  }
  getOwnerSeat = (allValue) => {
    const {baseUrl, contextRoot} = this.props;
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
      activeScanType: 'process',
      activePath: null,
      activeRuleHeader: false,
      activeDLL: false,
      activeConnections: false,
      deviceData: tempDeviceData
    }, () => {
      const {deviceData} = this.state;
      const index = deviceData.currentIndex;
      const allValue = deviceData.dataContent[index];

      this.openDetailInfo(index, allValue);
    });
  }
  openDetailInfo = (index, allValue, evt) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData.currentIndex = Number(index);

    this.setState({
      showSeatData: false,
      deviceData: tempDeviceData,
      currentDeviceData: allValue,
      activeIPdeviceUUID: allValue.ipDeviceUUID
    });
  }
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
  deleteDevice = () => {
    const {baseUrl, contextRoot} = this.props;
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
  handleTableSort = (value) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData.sort.field = value.field;
    tempDeviceData.sort.desc = !tempDeviceData.sort.desc;

    this.setState({
      deviceData: tempDeviceData
    }, () => {
      this.getDeviceData();
    });
  }
  handlePageChange = (currentPage) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData.currentPage = currentPage;

    this.setState({
      deviceData: tempDeviceData
    }, () => {
      this.getDeviceData();
    });
  }  
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
  handleSubTabChange = (type) => {
    this.setState({
      activeTab: type,
      showFilter: false
    });
  }
  toggleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter
    });
  }
  toggleScanType = (activeScanType) => {
    this.setState({
      activeScanType,
      activePath: null,
      activeRuleHeader: false,
      activeRule: [],
      activeDLL: false,
      activeConnections: false
    });
  }
  togglePathRule = (type, i, parentIndex) => {
    const {activePath, activeRule} = this.state;
    const tempActivePath = activePath === i ? null : i;

    if (type === 'path') {
      this.setState({
        activePath: tempActivePath,
        activeRuleHeader: false,
        activeRule: [],
        activeDLL: false,
        activeConnections: false
      });
    } else if (type === 'rule') {
      let tempActiveRule = activeRule;

      if (_.includes(activeRule, i)) {
        tempActiveRule.splice(tempActiveRule.indexOf(i), 1);
      } else {
        tempActiveRule.push(i);
      }

      this.setState({
        activeRule: tempActiveRule
      });
    }
  }
  displayRule = (nameList, parentIndex, val, i) => {
    const {activeRule} = this.state;
    const uniqueKey = val + i;

    return (
      <div className='rule-content' key={uniqueKey}>
        <div className='header' onClick={this.togglePathRule.bind(this, 'rule', i, parentIndex)}>
          <i className={cx('fg fg-play', {'rotate': _.includes(activeRule, i)})}></i>
          <span>{nameList[i]}</span>
        </div>
        {val &&
          <code className={cx({'hide': !_.includes(activeRule, i)})}>{val}</code>
        }
        {!val &&
          <span>{NOT_AVAILABLE}</span>
        }
      </div>
    )
  }
  displayIndividualFile = (val, i) => {
    const uniqueKey = val + i;

    return (
      <div key={uniqueKey}>{val}</div>
    )
  }
  displayFilePath = (val) => {
    const {activeDLL} = this.state;
    let filePathList = [];
    let displayInfo = '';

    _.forEach(val._ProcessInfo._ModulesInfo, val2 => {
      if (val2._FileInfo && val2._FileInfo._Filepath) {
        filePathList.push(val2._FileInfo._Filepath);
      }
    })

    if (filePathList.length > 0) {
      displayInfo = filePathList.map(this.displayIndividualFile);
    } else {
      displayInfo = NOT_AVAILABLE;
    }

    return (
      <div className={cx('sub-content', {'hide': !activeDLL})}>
        {displayInfo}
      </div>
    )
  }
  displayIndividualConnection = (val, i) => {
    const uniqueKey = val + i;

    return (
      <ul key={uniqueKey}>
        <li><span>{t('attacksFields.protocolType')}:</span> {val.protocol || NOT_AVAILABLE}</li>
        <li><span>{t('attacksFields.srcIp')}:</span> {val.srcIp || NOT_AVAILABLE}</li>
        <li><span>{t('attacksFields.srcPort')}:</span> {val.srcPort || NOT_AVAILABLE}</li>
        <li><span>{t('attacksFields.destIp')}:</span> {val.destIP || NOT_AVAILABLE}</li>
        <li><span>{t('attacksFields.destPort')}:</span> {val.destPort || NOT_AVAILABLE}</li>
      </ul>
    )
  }
  displayConnections = (val) => {
    const {activeConnections} = this.state;
    let connectionsList = [];
    let displayInfo = '';

    _.forEach(val._ProcessInfo._ConnectionList, val2 => {
      connectionsList.push({
        destIp: val2._DstIP,
        destPort: val2._DstPort,
        protocol: val2._ProtocolType,
        srcIp: val2._SrcIP,
        srcPort: val2._SrcPort
      });
    })

    if (connectionsList.length > 0) {
      displayInfo = connectionsList.map(this.displayIndividualConnection);
    } else {
      displayInfo = NOT_AVAILABLE;
    }

    return (
      <div className={cx('sub-content flex', {'hide': !activeConnections})}>
        {displayInfo}
      </div>
    )
  }
  toggleInfoHeader = (type) => {
    if (type === 'rule') {
      this.setState({
        activeRuleHeader: !this.state.activeRuleHeader
      });
    } else if (type === 'ddl') {
      this.setState({
        activeDLL: !this.state.activeDLL
      });
    } else if (type === 'connections') {
      this.setState({
        activeConnections: !this.state.activeConnections
      });
    }
  }
  displayScanProcessPath = (val, i) => {
    const {activePath, activeRuleHeader, activeDLL, activeConnections} = this.state;
    const uniqueKey = val._ScanType + i;
    let displayInfo = '';

    if (val._MatchedRuleList && val._MatchedRuleList.length > 0 && val._MatchedRuleNameList) {
      displayInfo = val._MatchedRuleList.map(this.displayRule.bind(this, val._MatchedRuleNameList, i));
    } else {
      displayInfo = NOT_AVAILABLE;
    }

    if (val._MatchedFile || val._MatchedPid) {
      return (
        <div className='group' key={uniqueKey}>
          <div className='path' onClick={this.togglePathRule.bind(this, 'path', i)}>
            <i className={cx('fg fg-arrow-bottom', {'rotate': activePath === i})}></i>
            {val._MatchedFile &&
              <span>{t('txt-path')}: {val._MatchedFile}</span>
            }
            {val._MatchedFile && val._MatchedPid &&
              <span>, </span>
            }
            {val._MatchedPid &&
              <span>PID: {val._MatchedPid}</span>
            }
          </div>
          <div className={cx('rule', {'hide': activePath !== i})}>
            <div className='rule-content'>
              <div className='header' onClick={this.toggleInfoHeader.bind(this, 'rule')}>
                <i className={cx('fg fg-play', {'rotate': activeRuleHeader})}></i>
                <span>{t('txt-rule')}</span>
              </div>
              <div className={cx('sub-content', {'hide': !activeRuleHeader})}>
                {displayInfo}
              </div>
            </div>

            <div className='rule-content'>
              <div className='header' onClick={this.toggleInfoHeader.bind(this, 'ddl')}>
                <i className={cx('fg fg-play', {'rotate': activeDLL})}></i>
                <span>DLLs</span>
              </div>
              {this.displayFilePath(val)}
            </div>

            <div className='rule-content'>
              <div className='header' onClick={this.toggleInfoHeader.bind(this, 'connections')}>
                <i className={cx('fg fg-play', {'rotate': activeConnections})}></i>
                <span>{t('txt-networkBehavior')}</span>
              </div>
              {this.displayConnections(val)}
            </div>
          </div>
        </div>
      )
    }
  }
  displayScanFilePath = (val, i) => {
    const {activePath, activeRuleHeader} = this.state;
    const uniqueKey = val._ScanType + i;
    let displayInfo = '';

    if (val._MatchedRuleList && val._MatchedRuleList.length > 0 && val._MatchedRuleNameList) {
      displayInfo = val._MatchedRuleList.map(this.displayRule.bind(this, val._MatchedRuleNameList, i));
    } else {
      displayInfo = NOT_AVAILABLE;
    }

    if (val._MatchedFile || val._MatchedPid) {
      return (
        <div className='group' key={uniqueKey}>
          <div className='path' onClick={this.togglePathRule.bind(this, 'path', i)}>
            <i className={cx('fg fg-arrow-bottom', {'rotate': activePath === i})}></i>
            {val._MatchedFile &&
              <span>{t('txt-path')}: {val._MatchedFile}</span>
            }
            {val._MatchedFile && val._MatchedPid &&
              <span>, </span>
            }
            {val._MatchedPid &&
              <span>PID: {val._MatchedPid}</span>
            }
          </div>
          <div className={cx('rule', {'hide': activePath !== i})}>
            <div className='rule-content'>
              <div className='header' onClick={this.toggleInfoHeader.bind(this, 'rule')}>
                <i className={cx('fg fg-play', {'rotate': activeRuleHeader})}></i>
                <span>{t('txt-rule')}</span>
              </div>
              <div className={cx('sub-content', {'hide': !activeRuleHeader})}>
                {displayInfo}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
  getIPdeviceInfo = (index, ipDeviceUUID, options) => {
    const {baseUrl, contextRoot} = this.props;
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
  checkTriggerTime = (type) => {
    const {currentDeviceData} = this.state;
    const resultType = type + 'Result';
    let createTime = '';
    let responseTime = '';

    if (currentDeviceData[resultType].taskCreateDttm && currentDeviceData[resultType].taskResponseDttm) {
      createTime = helper.getFormattedDate(currentDeviceData[resultType].taskCreateDttm, 'local');
      responseTime = helper.getFormattedDate(currentDeviceData[resultType].taskResponseDttm, 'local');

      if (Moment(createTime).isAfter(responseTime)) {
        return true;
      }
    }
  }
  triggerTask = (type, taskId) => {
    const {baseUrl, contextRoot} = this.props;
    const {currentDeviceData} = this.state;
    const url = `${baseUrl}/api/hmd/retrigger`;
    let requestData = {
      hostId: currentDeviceData.ipDeviceUUID,
      cmd: type
    };

    if (taskId) {
      requestData.taskId = taskId;
    }

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      if (data) {
        PopupDialog.alert({
          id: 'tiggerTaskModal',
          confirmText: t('txt-close'),
          display: <div>{t('txt-requestSent')}</div>
        });

        if (type === 'compareIOC' || type === 'yaraScanFile' || type === 'getFile') {
          this.getIPdeviceInfo('', currentDeviceData.ipDeviceUUID);
        }
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'));
    });
  }
  handleIrComboChange = (value) => {
    let irItemSelected = [];

    if (value === 'quick') {
      irItemSelected = DEFAULT_IR_SELECTED;
    } else if (value === 'standard') {
      irItemSelected = _.concat(_.range(1, 7), [9, 10, 12]);
    } else if (value === 'full') {
      irItemSelected = _.range(1, 17);
    }

    this.setState({
      irComboSelected: value,
      irItemSelected
    });
  }
  handleIrSelectionChange = (selected) => {
    const irItemSelected = selected.sort((a, b) => {
      return a - b;
    });

    this.setState({
      irItemSelected
    });
  }
  displayIRselection = () => {
    const {irComboSelected, irItemSelected} = this.state;
    const dropDownList = _.map(['quick', 'standard', 'full'], val => {
      return {
        value: val,
        text: t('network-inventory.ir-type.txt-' + val)
      };
    });
    const checkBoxList = _.map(_.range(1, 17), val => {
      return {
        value: val,
        text: val + ' - ' + t('network-inventory.ir-list.txt-list' + val)
      };
    });

    return (
      <div>
        <DropDownList
          id='irComboList'
          list={dropDownList}
          required={true}
          onChange={this.handleIrComboChange}
          value={irComboSelected} />
        <CheckboxGroup
          list={checkBoxList}
          onChange={this.handleIrSelectionChange}
          value={irItemSelected} />
      </div>
    )
  }
  irSelectionDialog = () => {
    const titleText = t('network-inventory.txt-itemSelection');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleSelectionIR},
      confirm: {text: t('txt-confirm'), handler: this.confirmIRselection}
    };

    return (
      <ModalDialog
        id='irSelectionDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayIRselection()}
      </ModalDialog>
    )
  }
  confirmIRselection = () => {
    const {irItemSelected} = this.state;

    alert('You selected: ' + irItemSelected);

    this.toggleSelectionIR();
    return;
  }
  toggleSelectionIR = () => {
    const {modalIRopen} = this.state;

    if (!modalIRopen) {
      this.setState({
        irComboSelected: 'quick',
        irItemSelected: DEFAULT_IR_SELECTED
      });
    }

    this.setState({
      modalIRopen: !modalIRopen
    });
  }
  sortedRuleList = (scanResult) => {
    let ruleWithFile = [];
    let ruleWithNoFile = [];
    let mergedRule = [];

    _.forEach(scanResult, val => {
      if (val._MatchedFile) {
        ruleWithFile.push(val);
      } else {
        ruleWithNoFile.push(val);
      }
    })

    mergedRule = _.concat(ruleWithFile, ruleWithNoFile);
    return mergedRule;
  }
  getIrBtnPos = (type) => {
    const {locale} = this.props;

    if (locale === 'zh') {
      return '80px';
    } else if (locale === 'en') {
      return '100px';
    }
  }
  displayScanInfo = () => {
    const {activeTab, activeScanType, deviceData, currentDeviceData} = this.state;
    const ip = currentDeviceData.ip || NOT_AVAILABLE;
    const mac = currentDeviceData.mac || NOT_AVAILABLE;
    const hostName = currentDeviceData.hostName || NOT_AVAILABLE;
    const ownerName = currentDeviceData.ownerObj ? currentDeviceData.ownerObj.ownerName : NOT_AVAILABLE;
    const safetyScanObj = [
      {
        name: 'yaraResult', //Scan Process
        type: 'yara'
      },
      {
        name: 'yaraScanFileResult', //Scan File
        type: 'file'
      },
      {
        name: 'irResult', //IR
        type: 'ir'
      }
    ];
    let hmdInfo = {
      yara: {},
      file: {},
      ir: {}
    };
    let yaraCount = 0;
    let fileCount = 0;

    _.forEach(safetyScanObj, val => { //Construct the HMD info object
      if (!_.isEmpty(currentDeviceData[val.name])) {
        if (val.type === 'ir') {
          hmdInfo[val.type] = {
            createTime: helper.getFormattedDate(currentDeviceData[val.name].taskCreateDttm, 'local'),
            responseTime: helper.getFormattedDate(currentDeviceData[val.name].taskResponseDttm, 'local'),
            result: currentDeviceData[val.name]._ZipPath,
            taskID: currentDeviceData[val.name].taskId
          };
        } else { //For Scan Process and Scan File
          let mergedRule = [];

          if (currentDeviceData[val.name].ScanResult && currentDeviceData[val.name].ScanResult.length > 0) {
            mergedRule = this.sortedRuleList(currentDeviceData[val.name].ScanResult);
          }

          hmdInfo[val.type] = {
            createTime: helper.getFormattedDate(currentDeviceData[val.name].taskCreateDttm, 'local'),
            responseTime: helper.getFormattedDate(currentDeviceData[val.name].taskResponseDttm, 'local'),
            result: mergedRule,
            taskID: currentDeviceData[val.name].taskId
          };
        }
      }
    })

    if (hmdInfo.yara.result) {
      yaraCount = Number(hmdInfo.yara.result.length);
    }

    if (hmdInfo.file.result) {
      fileCount = Number(hmdInfo.file.result.length);
    }

    return (
      <div>
        <table className='c-table main-table'>
          <thead>
            <tr>
              <th>{t('ipFields.ip')}</th>
              <th>{t('ipFields.mac')}</th>
              <th>{t('ipFields.hostName')}</th>
              <th>{t('ipFields.owner')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='align-center ip'>{ip}</td>
              <td className='align-center mac'>{mac}</td>
              <td className='align-center hostName'>{hostName}</td>
              <td className='align-center ownerName'>{ownerName}</td>
            </tr>
          </tbody>
        </table>

        <div className='scan-info'>
          <ButtonGroup
            className='left'
            list={[
              {value: 'process', text: 'Scan Process'},
              {value: 'file', text: 'Scan File'},
              {value: 'ir', text: 'IR'}
            ]}
            onChange={this.toggleScanType}
            value={activeScanType} />

          <div className='info-content'>
            {activeScanType === 'process' &&
              <div>
                <div className='info'>
                  <div className='last-update'>
                    <span>{t('network-inventory.txt-createTime')}: {hmdInfo.yara.createTime || NOT_AVAILABLE}</span>
                    <span>{t('network-inventory.txt-responseTime')}: {hmdInfo.yara.responseTime || NOT_AVAILABLE}</span>
                  </div>
                  {yaraCount > 0 &&
                    <div className='count'>{t('network-inventory.txt-suspiciousFileCount')}: {yaraCount}</div>
                  }
                  <button className='btn' onClick={this.triggerTask.bind(this, 'compareIOC', hmdInfo.yara.taskID)} disabled={this.checkTriggerTime('yara')}>{t('network-inventory.txt-reCheck')}</button>
                </div>
                <div className='scan-content'>
                  <div className='header'>{t('network-inventory.txt-suspiciousFilePath')}</div>
                  {hmdInfo.yara.result && hmdInfo.yara.result.length > 0 &&
                    <div className='list'>
                      {hmdInfo.yara.result.map(this.displayScanProcessPath)}
                    </div>
                  }
                  {(!hmdInfo.yara.result || hmdInfo.yara.result.length === 0) &&
                    <div className='empty-msg'>{NOT_AVAILABLE}</div>
                  }
                </div>
              </div>
            }
            {activeScanType === 'file' &&
              <div>
                <div className='info'>
                  <div className='last-update'>
                    <span>{t('network-inventory.txt-createTime')}: {hmdInfo.file.createTime || NOT_AVAILABLE}</span>
                    <span>{t('network-inventory.txt-responseTime')}: {hmdInfo.file.responseTime || NOT_AVAILABLE}</span>
                  </div>
                  {fileCount > 0 &&
                    <div className='count'>{t('network-inventory.txt-suspiciousFileCount')}: {fileCount}</div>
                  }
                  <button className='btn' onClick={this.triggerTask.bind(this, 'yaraScanFile', hmdInfo.file.taskID)} disabled={this.checkTriggerTime('yaraScanFile')}>{t('network-inventory.txt-reCheck')}</button>
                </div>
                <div className='scan-content'>
                  <div className='header'>{t('network-inventory.txt-suspiciousFilePath')}</div>
                  {hmdInfo.file.result && hmdInfo.file.result.length > 0 &&
                    <div className='list'>
                      {hmdInfo.file.result.map(this.displayScanFilePath)}
                    </div>
                  }
                  {(!hmdInfo.file.result || hmdInfo.file.result.length === 0) &&
                    <div className='empty-msg'>{NOT_AVAILABLE}</div>
                  }
                </div>
              </div>
            }
            {activeScanType === 'ir' &&
              <div>
                <div className='info'>
                  <div className='last-update'>
                    <span>{t('network-inventory.txt-createTime')}: {hmdInfo.ir.createTime || NOT_AVAILABLE}</span>
                    <span>{t('network-inventory.txt-responseTime')}: {hmdInfo.ir.responseTime || NOT_AVAILABLE}</span>
                  </div>
                  <button className='btn' style={{right: this.getIrBtnPos()}} onClick={this.triggerTask.bind(this, 'getFile', hmdInfo.ir.taskID)} disabled={this.checkTriggerTime('ir')}>{t('network-inventory.txt-reCompress')}</button>
                  <button className='btn' onClick={this.toggleSelectionIR}>{t('network-inventory.txt-itemSelection')}</button>
                </div>
                <div className='scan-content'>
                  <div className='header'>{t('network-inventory.txt-irMsg')}:</div>
                  <div className='empty-msg'>{hmdInfo.ir.result || NOT_AVAILABLE}</div>
                </div>
              </div>
            }
          </div>
        </div>

        {activeTab === 'deviceList' && deviceData.currentLength > 1 &&
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
  showScanInfo = () => {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeDialog.bind(this, 'reload')}
    };
    const titleText = t('alert.txt-safetyScanInfo');

    return (
      <ModalDialog
        id='configScanModalDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displayScanInfo()}
      </ModalDialog>
    )
  }
  closeDialog = (option, all) => {
    this.setState({
      showScanInfo: false,
      showSeatData: false,
      modalFloorOpen: false,
      addSeatOpen: false,
      activeScanType: 'process',
      activePath: null,
      activeRuleHeader: false,
      activeRule: [],
      activeDLL: false,
      activeConnections: false,
      currentDeviceData: {},
      addSeat: {
        selectedSeatUUID: '',
        name: '',
        coordX: '',
        coordY: ''
      }
    }, () => {
      if (option === 'reload') {
        if (all === 'all') { //reload everything (from edit floor map)
          this.getFloorPlan();
        } else { //reload area and seat only (no tree)
          const {floorPlan} = this.state;
          this.getAreaData(floorPlan.currentAreaUUID);
          this.getSeatData(floorPlan.currentAreaUUID);
        }
      }
    });
  }
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
  handleDeviceSearch = (type, value) => {
    let tempDeviceSearch = {...this.state.deviceSearch};
    tempDeviceSearch[type] = value;

    this.setState({
      deviceSearch: tempDeviceSearch
    });
  }
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
          newDepartment: departmentList[0].value,
          newTitle: titleList[0].value
        };

        if (currentDeviceData.areaUUID) {
          this.getAreaData(currentDeviceData.areaUUID);
          this.getSeatData(currentDeviceData.areaUUID);
        }
      } else if (formType === 'new') {
        formTypeEdit = false;
        this.getAreaData(floorList[0].value);
        this.getSeatData(floorList[0].value);
        this.getFloorPlan();
        this.setState({
          currentDeviceData: {}
        });
      }

      if (!currentDeviceData.ownerUUID) {
        this.handleOwnerChange(ownerList[0].value);
      }

      this.setState({
        activeContent,
        activeSteps: 1,
        formTypeEdit,
        addIP,
        ownerType: 'existing',
        ownerIDduplicated: false
      });
      return;
    }

    this.setState({
      activeContent
    });
  }
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
  handleAddIpConfirm = () => {
    const {baseUrl, contextRoot} = this.props;
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
  handleIPdeviceConfirm = (ownerUUID) => {
    const {baseUrl, contextRoot} = this.props;
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

    helper.getAjaxData(requestType, url, requestData)
    .then(data => {
      this.getDeviceData('search');
      this.getOwnerData();
      this.getOtherData();
      this.getFloorPlan();

      if (formTypeEdit) {
        this.getIPdeviceInfo('', currentDeviceData.ipDeviceUUID, 'oneDevice');
      } else {
        this.toggleContent('showList');
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'));
    });
  }
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
  handleOwnerTypeChange = (ownerType) => {
    const {departmentList, titleList, addIP} = this.state;
    const tempAddIP = {...addIP};
    tempAddIP.newDepartment = departmentList[0].value;
    tempAddIP.newTitle = titleList[0].value;

    this.setState({
      ownerType,
      addIP: tempAddIP
    });
  }
  handleOwnerChange = (value) => {
    const {baseUrl, contextRoot} = this.props;

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

        this.setState({
          addIP: tempAddIP
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleDepartmentChange = (value) => {
    const tempAddIP = {...this.state.addIP};
    tempAddIP.newDepartment = value;

    this.setState({
      addIP: tempAddIP
    });
  }
  handleTitleChange = (value) => {
    const tempAddIP = {...this.state.addIP};
    tempAddIP.newTitle = value;

    this.setState({
      addIP: tempAddIP
    });
  }
  openManage = () => {
    this.manage._component.open();
  }
  openFloorMap = () => {
    this.setState({
      modalFloorOpen: true
    });
  }
  modalFloorDialog = () => {
    const {baseUrl, contextRoot} = this.props;

    return (
      <FloorMap
        baseUrl={baseUrl}
        contextRoot={contextRoot}
        closeDialog={this.closeDialog} />
    )
  }
  getBtnText = () => {
    return this.state.activeSteps === 4 ? t('txt-confirm') : t('txt-nextStep');
  }
  displayAddIpSteps = () => {
    const {contextRoot} = this.props;
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
                list={[
                  {
                    value: 'existing',
                    text: t('txt-existingOwner')
                  },
                  {
                    value: 'new',
                    text: t('txt-addNewOwner')
                  }
                ]}
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
                  {ownerType === 'existing' && addIP.ownerPic &&
                    <img src={addIP.ownerPic} className='existing' title={t('network-topology.txt-profileImage')} />
                  }
                  {ownerType === 'new' && previewOwnerPic &&
                    <img src={previewOwnerPic} title={t('network-topology.txt-profileImage')} />
                  }
                  {ownerType === 'existing' && !addIP.ownerPic &&
                    <img src={contextRoot + '/images/empty_profile.png'} className={cx({'existing': ownerType === 'existing'})} title={t('network-topology.txt-profileImage')} />
                  }
                  {ownerType === 'new' && !previewOwnerPic &&
                    <img src={contextRoot + '/images/empty_profile.png'} className={cx({'existing': ownerType === 'existing'})} title={t('network-topology.txt-profileImage')} />
                  }
                </div>
              </div>
              <div className='user-info'>
                {ownerType === 'existing' &&
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
                {ownerType === 'existing' &&
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
                {ownerType === 'existing' &&
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
                {ownerType === 'existing' &&
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
  handleDataChange = (type, value) => {
    let tempAddSeat = {...this.state.addSeat};
    tempAddSeat[type] = value;

    this.setState({
      addSeat: tempAddSeat
    });
  }
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
  handleAddSeatConfirm = () => {
    const {baseUrl, contextRoot} = this.props;
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
  selectTree = (i, areaUUID, eventData) => {
    const {baseUrl, contextRoot} = this.props;
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
  handleAddIpChange = (type, value, info) => {
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
  getBtnPos = (type) => {
    const {locale} = this.props;

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
    const {baseUrl, contextRoot, language, locale, session} = this.props;
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
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            locale={locale}
            session={session} />

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

                <button className='standard btn last'><Link to='/ChewbaccaWeb/configuration/notifications'>{t('notifications.txt-settings')}</Link></button>
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
                    paginationPageChange={this.handlePageChange}
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
              baseUrl={baseUrl}
              contextRoot={contextRoot}
              locale={locale}
              toggleContent={this.toggleContent} />
          }
        </div>
      </div>
    )
  }
}

NetworkInventory.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  locale: PropTypes.string.isRequired
};

const HocNetworkInventory = withRouter(withLocale(NetworkInventory));
export { NetworkInventory, HocNetworkInventory };