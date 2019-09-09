import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Gis from 'react-gis/build/src/components'

import DataTable from 'react-ui/build/src/components/table'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Tabs from 'react-ui/build/src/components/tabs'
import TreeView from 'react-ui/build/src/components/tree'

import {HocConfig as Config} from '../../common/configuration'
import {HocFilterContent as FilterContent} from '../../common/filter-content'
import helper from '../../common/helper'
import {HocPagination as Pagination} from '../../common/pagination'
import {HocPrivateDetails as PrivateDetails} from '../../common/private-details'
import TableContent from '../../common/table-content'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

const NOT_AVAILABLE = 'N/A';
const RULES = [
  {
    id: 1,
    path: 'c:/desktop/readme.doc',
    rule: 'rule MatchGoogleUpdateExe'
  },
  {
    id: 2,
    path: 'c:/desktop/test/hello.doc',
    rule: 'rule MatchFacebookUpdate'
  },
  {
    id: 3,
    path: 'c:/desktop/andrew/world.html',
    rule: 'rule MatchNetflix'
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
  mapAreaUUID: '',
  currentMap: '',
  currentBaseLayers: {},
  seatData: {}
};
class NetworkInventory extends Component {
	constructor(props) {
		super(props);

		this.state = {
      activeTab: 'deviceList', //deviceList, deviceMap
      activeContent: 'tableList', //tableList, dataInfo
      showFilter: false,
      showScanInfo: false,
      showSeatData: false,
      activeScanType: 'yara', //yara, ir
      activeRule: null,
      deviceSearch: {
        ip: '',
        mac: '',
        hostName: '',
        owner: '',
        areaName: '',
        seatName: ''
      },
      deviceData: {
        dataFieldsArr: ['ip', 'mac', 'hostName', 'owner', 'areaName', 'seatName', '_menu_'],
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
      floorPlan: {
        treeData: {},
        type: '',
        rootAreaUUID: '',
        currentAreaUUID: '',
        currentAreaName: '',
        name: '',
        map: ''
      },
      alertInfo: {
        ownerPic: '',
        ownerMap: '',
        ownerBaseLayers: {},
        ownerSeat: {}
      },
      activeIP: '',
      ..._.cloneDeep(MAPS_PRIVATE_DATA)
		};

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
	}
	componentWillMount() {
    this.getDeviceData();
    this.getFloorPlan();
	}
  getDeviceData = (fromSearch, options, seatUUID) => {
    const {baseUrl} = this.props;
    const {deviceSearch, deviceData} = this.state;
    let dataParams = '';

    if (options === 'oneSeat') {
      dataParams += `&seatUUID=${seatUUID}`;
    } else {
      const page = fromSearch === 'search' ? 1 : deviceData.currentPage;
      const pageSize = deviceData.pageSize;
      const sort = deviceData.sort.desc ? 'desc' : 'asc';
      const orders = deviceData.sort.field + ' ' + sort;
      dataParams = `page=${page}&pageSize=${pageSize}&orders=${orders}`
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
      url: `${baseUrl}/api/networkInventory/_search?${dataParams}`,
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
      tempDeviceData.dataContent = data.rows;
      tempDeviceData.totalCount = data.counts;
      tempDeviceData.currentPage = fromSearch === 'search' ? 1 : deviceData.currentPage;
      tempDeviceData.currentIndex = 0;
      tempDeviceData.currentLength = data.rows.length;

      let dataFields = {};
      deviceData.dataFieldsArr.forEach(tempData => {
        dataFields[tempData] = {
          label: tempData === '_menu_' ? '' : t(`ipFields.${tempData}`),
          sortable: this.checkSortable(tempData),
          formatter: (value, allValue, index) => {
            if (tempData === 'owner') {
              if (allValue.ownerObj) {
                return <span>{allValue.ownerObj.ownerName}</span>;
              } else {
                return <span>{value}</span>;
              }
            } else if (tempData === 'areaName') {
              if (allValue.areaObj) {
                return <span>{allValue.areaObj.areaName}</span>;
              }
            } else if (tempData === 'seatName') {
              if (allValue.seatObj) {
                return <span>{allValue.seatObj.seatName}</span>;
              }
            } else if (tempData === '_menu_') {
              return (
                <div className={cx('table-menu inventory', {'active': value})}>
                  <i className='fg fg-eye' onClick={this.openMenu.bind(this, 'view', allValue, index)} title={t('alert.txt-ipBasicInfo')}></i>
                  <i className='fg fg-chart-kpi' onClick={this.openMenu.bind(this, 'info', allValue, index)} title={t('alert.txt-safetyScanInfo')}></i>
                  <i className='fg fg-trashcan' onClick={this.openMenu.bind(this, 'delete', allValue)} title={t('network-inventory.txt-deleteDevice')}></i>
                </div>
              )
            } else {
              return <span>{value}</span>;
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
        deviceData: tempDeviceData
      });
    })
  }
  displaySeatInfo = () => {
    const {currentDeviceData} = this.state;
    const deviceInfo = {
      ip: currentDeviceData.ip ? currentDeviceData.ip : NOT_AVAILABLE,
      mac: currentDeviceData.mac ? currentDeviceData.mac : NOT_AVAILABLE,
      hostName: currentDeviceData.hostName ? currentDeviceData.hostName : NOT_AVAILABLE,
      system: currentDeviceData.system ? currentDeviceData.system : NOT_AVAILABLE
    };

    return (
      <div>
        <div className='main'>{t('ipFields.ip')}: {deviceInfo.ip}</div>
        <div className='main'>{t('ipFields.mac')}: {deviceInfo.mac}</div>
        <div className='table-menu inventory active'>
          <i className='fg fg-eye' onClick={this.openMenu.bind(this, 'view', currentDeviceData)} title={t('alert.txt-ipBasicInfo')}></i>
          <i className='fg fg-chart-kpi' onClick={this.openMenu.bind(this, 'info', currentDeviceData)} title={t('alert.txt-safetyScanInfo')}></i>
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
      confirm: {text: t('txt-close'), handler: this.closeDialog}
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
    const unSortableFields = ['options', 'owner', '_menu_'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  getFloorPlan = () => {
    const {baseUrl} = this.props;

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
    const floorPlan = areaUUID;

    this.ah.one({
      url: `${baseUrl}/api/area?uuid=${floorPlan}`,
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
      currentBaseLayers[floorPlan] = currentMap;

      this.setState({
        mapAreaUUID: floorPlan,
        currentMap,
        currentBaseLayers,
        currentFloor: areaUUID
      });
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
  renderFilter = () => {
    const {showFilter, deviceSearch} = this.state;

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
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getDeviceData.bind(this, 'search')}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter.bind(this)}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  openMenu = (type, allValue, index) => {
    if (type === 'view') {
      this.getOwnerPic(allValue);
    } else if (type === 'info') {
      this.openDetailInfo(index, allValue);
    } else if (type === 'delete') {
      this.openDeleteDeviceModal(allValue);
    }
  }
  getOwnerPic = (allValue) => {
    const {baseUrl} = this.props;
    const {alertInfo} = this.state;
    let ownerUUID = '';
    let tempAlertInfo = {...alertInfo};

    if (!allValue.ownerObj) {
      this.getOwnerSeat(allValue);
      return;
    }

    ownerUUID = allValue.ownerObj.ownerUUID;

    if (ownerUUID) {
      this.ah.one({
        url: `${baseUrl}/api/owner?uuid=${ownerUUID}`,
        type: 'GET'
      })
      .then(data => {
        if (data) {
          tempAlertInfo.ownerPic = data.base64;

          this.setState({
            alertInfo: tempAlertInfo
          }, () => {
            this.getOwnerSeat(allValue);
          });
        }
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
  }
  getOwnerSeat = (allValue) => {
    const {baseUrl, contextRoot} = this.props;
    const topoInfo = allValue;
    let tempAlertInfo = {...this.state.alertInfo};
    let ownerMap = {};

    if (topoInfo.areaObj && topoInfo.areaObj.picPath) {
      ownerMap = {
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

    this.setState({
      activeContent: 'dataInfo',
      showSeatData: false,
      currentDeviceData: topoInfo,
      alertInfo: tempAlertInfo,
      activeIP: allValue.ip
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
      showScanInfo: true,
      showSeatData: false,
      deviceData: tempDeviceData,
      currentDeviceData: allValue,
      activeIP: allValue.ip
    });
  }
  getDeleteDeviceContent = (allValue) => {
    this.setState({
      currentDeviceData: allValue,
      activeIP: allValue.ip
    });

    return (
      <div className='content delete'>
        <span>{t('network-inventory.txt-deleteDeviceMsg')}: {allValue.ip}?</span>
      </div>
    )    
  }
  openDeleteDeviceModal = (allValue) => {
    PopupDialog.prompt({
      title: t('network-inventory.txt-deleteDevice'),
      id: 'modalWindow',
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
    const {baseUrl} = this.props;
    const {currentDeviceData} = this.state;

    ah.one({
      url: `${baseUrl}/api/u1/ipdevice?uuid=${currentDeviceData.ipDeviceUUID}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getDeviceData();
        this.closeDialog();
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
  handleRowMouseOver = (id, allValue, evt) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData.dataContent = _.map(tempDeviceData.dataContent, item => {
      return {
        ...item,
        _menu_: allValue.ip === item.ip ? true : false
      }
    });

    this.setState({
      deviceData: tempDeviceData
    });
  }
  toggleScanType = (activeScanType) => {
    this.setState({
      activeScanType
    });
  }
  toggleRule = (i) => {
    const {activeRule} = this.state;
    const rule = activeRule === i ? null : i;

    this.setState({
      activeRule: rule
    });
  }
  toggleAccordion = (type, i) => {
    const {activeRule} = this.state;

    if (type === 'arrow') {
      return activeRule === i ? 'fg fg-arrow-top' : 'fg fg-arrow-bottom';
    } else if (type === 'rule') {
      return activeRule === i ? false : true;
    }
  }
  displayRules = (val, i) => {
    return (
      <div className='group' key={val.id}>
        <div className='path' onClick={this.toggleRule.bind(this, i)}>
          <i className={this.toggleAccordion('arrow', i)}></i>
          <span>{val.path}</span>
        </div>
        <div className={cx('rule', {hide: this.toggleAccordion('rule', i)})}>
          <div className='header'><i className='fg fg-play'></i>規則</div>
          <code>{val.rule}</code>
        </div>
      </div>
    )    
  }
  displayScanInfo = () => {
    const {activeTab, activeScanType, deviceData, currentDeviceData} = this.state;
    const ip = currentDeviceData.ip ? currentDeviceData.ip : NOT_AVAILABLE;
    const mac = currentDeviceData.mac ? currentDeviceData.mac : NOT_AVAILABLE;
    const hostName = currentDeviceData.hostName ? currentDeviceData.hostName : NOT_AVAILABLE;
    const ownerName = currentDeviceData.ownerObj ? currentDeviceData.ownerObj.ownerName : NOT_AVAILABLE;

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
          <div className='c-button-group left'>
            <button className={cx('thumb', {'selected': activeScanType === 'yara'})} onClick={this.toggleScanType.bind(this, 'yara')}>Yara</button>
            <button className={cx('thumb', {'selected': activeScanType === 'ir'})} onClick={this.toggleScanType.bind(this, 'ir')}>IR</button>
          </div>

          <div className='info-content'>
            {activeScanType === 'yara' &&
              <div>
                <div className='info'>
                  <div className='last-update'>{t('network-inventory.txt-lastUpdate')}: 2019/09/05 11:43</div>
                  <div className='count'>{t('network-inventory.txt-suspiciousFileCount')}: 6</div>
                  <button className='btn'>{t('network-inventory.txt-reCheck')}</button>
                </div>
                <div className='file-path'>
                  <div className='header'>{t('network-inventory.txt-suspiciousFilePath')}</div>
                  <div className='list'>
                    {RULES.map(this.displayRules)}
                  </div>
                </div>
              </div>
            }
            {activeScanType === 'ir' &&
              <div>
                <div className='info'>
                  <div className='last-update'>{t('network-inventory.txt-lastUpdate')}: 2019/10/17 05:26</div>
                  <button className='btn'>{t('network-inventory.txt-reCompress')}</button>
                </div>
                <div className='msg'>
                  <div className=''>IR data has been uploaded to xxx.xx.xx.xx</div>
                </div>
              </div>
            }
          </div>
        </div>

        {activeTab === 'deviceList' &&
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
      confirm: {text: t('txt-close'), handler: this.closeDialog}
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
  closeDialog = () => {
    this.setState({
      showScanInfo: false,
      showSeatData: false,
      currentDeviceData: {}
    });
  }
  clearFilter = () => {
    this.setState({
      deviceSearch: {
        ip: '',
        mac: '',
        hostName: '',
        owner: '',
        areaName: '',
        seatName: ''
      }
    });
  }
  handleDeviceSearch = (type, value) => {
    const tempDeviceSearch = {...this.state.deviceSearch};
    tempDeviceSearch[type] = value;

    this.setState({
      deviceSearch: tempDeviceSearch
    });
  }
  toggleContent = () => {
    const {activeTab} = this.state;

    this.setState({
      activeContent: 'tableList'
    });
  }
  selectTree = (i, areaUUID, eventData) => {
    const {baseUrl} = this.props;
    let tempFloorPlan = {...this.state.floorPlan};
    let tempArr = [];
    let pathStr = '';
    let pathNameStr = '';
    let pathParentStr = '';

    if (eventData.path.length > 0) {
      _.forEach(eventData.path, val => {
        if (val.index) {
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
  getTreeView = (value, selectedID, i) => {
    return (
      <TreeView
        id={value.areaUUID}
        key={value.areaUUID}
        data={value}
        selected={selectedID}
        defaultOpened={[value.areaUUID]}
        onSelect={this.selectTree.bind(this, i)} />
    )
  }
  getBtnPos = (type) => {
    const {locale} = this.props;
    let length = '';

    if (type === 'auto') {
      if (locale === 'zh') {
        length = '120px';
      } else if (locale === 'en') {
        length = '200px';
      }
    } else if (type === 'manual') {
      if (locale === 'zh') {
        length = '257px';
      } else if (locale === 'en') {
        length = '336px';
      }
    }

    return length;
  }
	render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {
      activeTab,
      activeContent,
      showFilter,
      showScanInfo,
      showSeatData,
      deviceData,
      currentDeviceData,
      floorPlan,
      alertInfo,
      activeIP,
      mapAreaUUID,
      currentMap,
      seatData,
      currentBaseLayers
    } = this.state;
    const picPath = alertInfo.ownerPic ? alertInfo.ownerPic : contextRoot + '/images/empty_profile.png';
    const backText = activeTab === 'deviceList' ? t('network-inventory.txt-backToList') : t('network-inventory.txt-backToMap')

		return (
      <div>
        {showScanInfo &&
          this.showScanInfo()
        }

        {showSeatData &&
          this.showSeatData()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            {activeTab === 'deviceList' && activeContent === 'tableList' &&
              <button onClick={this.toggleFilter} className={cx('last', {'active': showFilter})} title={t('network.connections.txt-toggleFilter')}><i className='fg fg-filter'></i></button>
            }
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          {activeContent === 'tableList' &&
            <div className='data-table'>
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

                <button className='standard btn notification'>{t('network-inventory.txt-notificationSettings')}</button>
                <button className='standard btn' style={{right: this.getBtnPos('auto')}}>{t('network-inventory.txt-autoSettings')}</button>
                <button className='standard btn' style={{right: this.getBtnPos('manual')}}>{t('network-inventory.txt-AddIP')}</button>

                {activeTab === 'deviceList' &&
                  <TableContent
                    activeTab='config'
                    dataTableData={deviceData.dataContent}
                    dataTableFields={deviceData.dataFields}
                    dataTableSort={deviceData.sort}
                    paginationTotalCount={deviceData.totalCount}
                    paginationPageSize={deviceData.pageSize}
                    paginationCurrentPage={deviceData.currentPage}
                    currentTableID={activeIP}
                    tableUniqueID='ip'
                    handleTableSort={this.handleTableSort}
                    handleRowMouseOver={this.handleRowMouseOver}
                    paginationPageChange={this.handlePageChange}
                    paginationDropDownChange={this.handlePageDropdown} />
                }

                {activeTab === 'deviceMap' &&
                  <div className='inventory-map'>
                    <div className='tree'>
                      {floorPlan.treeData && floorPlan.treeData.length > 0 &&
                        floorPlan.treeData.map((value, i) => {
                          return this.getTreeView(value, floorPlan.currentAreaUUID, i);
                        })
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
            <div className='data-table'>
              <div className='main-content'>
                <div className='privateIp-info'>
                  <header>{t('alert.txt-ipBasicInfo')}</header>
                  <button className='standard btn edit'>{t('txt-edit')}</button>
                  <button className='standard btn list' onClick={this.toggleContent}>{backText}</button>
                  <PrivateDetails
                    alertInfo={alertInfo}
                    topoInfo={currentDeviceData}
                    picPath={picPath} />
                </div>
              </div>
            </div>
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