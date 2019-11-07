import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import DataTable from 'react-ui/build/src/components/table'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Gis from 'react-gis/build/src/components'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import TreeView from 'react-ui/build/src/components/tree'

import {HocConfig as Config} from '../../common/configuration'
import {HocFloorMap as FloorMap} from '../../common/floor-map'
import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';

let t = null;
let et = null;

class NetworkMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list: {
        system: [],
        deviceType: []
      },
      search: {
        keyword: '',
        system: 'all',
        deviceType: 'all'
      },
      IP: {
        dataFieldsArr: ['seat', 'ip', 'mac', 'owner', 'hostName', 'system', 'deviceType'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'seat',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        add: {}
      },
      mapAreaUUID: '',
      currentMap: '',
      currentBaseLayers: {},
      modalFloorOpen: false,
      showSeatData: false,
      addSeatOpen: false,
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
      seatData: {},
      selectedSeat: [],
      addSeat: {
        selectedSeatUUID: '',
        name: '',
        coordX: '',
        coordY: ''
      },
      openFilter: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getSearchOption();
    this.getFloorPlan('firstLoad');  //For floor plan on the left nav
  }
  getSearchOption = () => {
    const {baseUrl} = this.props
    const apiNameList = ['system', 'devicetype'];
    let apiArr = [];

    _.forEach(apiNameList, val => {
      apiArr.push({
        url: `${baseUrl}/api/ipdevice/_${val}`,
        type: 'GET'
      });
    })

    this.ah.all(apiArr)
    .then(data => {
      let tempList = {...this.state.list};
      let system = [{value: 'all', text: t('txt-all')}];
      let deviceType = [{value: 'all', text: t('txt-all')}];

      _.forEach(data[0], val => {
        system.push({
          value: val,
          text: val
        });
      })

      _.forEach(data[1], val => {
        deviceType.push({
          value: val,
          text: val
        });
      })

      tempList.system = system;
      tempList.deviceType = deviceType;

      this.setState({
        list: tempList
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getFloorPlan = (option) => {
    const {baseUrl, contextRoot} = this.props;
    const {floorPlan} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/area/_tree`,
      type: 'GET'
    })
    .then(data => {
      if (option === 'firstLoad') {
        if (data && data.length > 0) {
          const floorPlanData = data[0];
          const areaUUID = floorPlanData.areaUUID;
          let tempFloorPlan = {...floorPlan};
          tempFloorPlan.treeData = data;
          tempFloorPlan.rootAreaUUID = floorPlanData.rootAreaUUID;
          tempFloorPlan.currentAreaUUID = areaUUID;
          tempFloorPlan.currentAreaName = floorPlanData.areaName;
          tempFloorPlan.name = floorPlanData.areaName;

          this.setState({
            floorPlan: tempFloorPlan
          }, () => {
            this.getAreaData(areaUUID);
            this.getSeatData(areaUUID);
            this.getIPData(areaUUID);
          });
        }
      } else {
        let tempFloorPlan = {...floorPlan};
        tempFloorPlan.treeData = data;

        this.setState({
          floorPlan: tempFloorPlan
        }, () => {
          if (_.isEmpty(this.state.floorPlan.treeData)) {
            this.closeDialog();
          }
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getAreaData = (areaUUID, option) => {
    const {baseUrl, contextRoot} = this.props;
    const floorPlan = areaUUID || this.state.floorPlan.currentAreaUUID;

    this.ah.one({
      url: `${baseUrl}/api/area?uuid=${floorPlan}`,
      type: 'GET'
    })
    .then(data => {
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

      const currentBaseLayers = {};
      currentBaseLayers[floorPlan] = currentMap;

      if (option === 'setAreaUUID') {
        const tempFloorPlan = this.state.floorPlan;
        tempFloorPlan.currentAreaUUID = areaUUID;
        tempFloorPlan.currentAreaName = areaName;

        this.setState({
          floorPlan: tempFloorPlan,
          mapAreaUUID: floorPlan,
          currentMap,
          currentBaseLayers
        }, () => {
          this.getIPData(areaUUID);
        });
      } else {
        this.setState({
          mapAreaUUID: floorPlan,
          currentMap,
          currentBaseLayers
        }, () => {
          if (areaUUID) {
            this.getSeatData(areaUUID);
            this.getIPData(areaUUID);
          }
        });
      }
      return null;
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
  checkSortable = (field) => {
    const unSortableFields = ['seat', 'owner'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  /* This function returns the IP data for the data table */
  getIPData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.props;
    const {IP, floorPlan, search} = this.state;
    let dataObj = {};
    let area = areaUUID || floorPlan.currentAreaUUID;

    dataObj = {
      page: IP.currentPage,
      pageSize: IP.pageSize
    };

    if (area) {
      dataObj = {
        ...dataObj,
        areaUUID: area
      }
    }
    
    dataObj.keyword = search.keyword;

    if (search.system != 'all') {
      dataObj.system = search.system;
    }

    if (search.deviceType != 'all') {
      dataObj.deviceType = search.deviceType;
    }

    this.ah.one({
      url: `${baseUrl}/api/ipdevice/_search`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      let tempIP = {...this.state.IP};
      tempIP.dataContent = data.rows;
      tempIP.totalCount = data.counts;

      let dataFields = {};
      IP.dataFieldsArr.forEach(tempData => {
        dataFields[tempData] = {
          label: t(`ipFields.${tempData}`),
          sortable: this.checkSortable(tempData),
          formatter: (value, allValue) => {
            if (tempData === 'seat') {
              if (allValue.seatObj) {
                return <span>{allValue.seatObj.seatName}</span>
              }
            }
            if (tempData === 'owner') {
              if (allValue.ownerObj) {
                return <span>{allValue.ownerObj.ownerName}</span>
              }
            }
            return <span>{value}</span>
          }
        };
      })

      tempIP.dataFields = dataFields;

      this.setState({
        IP: tempIP
      });
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
      this.getIPData(areaUUID);
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
  displayTreeView = (val, i) => {
    const {floorPlan} = this.state;

    return this.getTreeView(val, floorPlan.currentAreaUUID, i);
  }
  handleSearchChange = (type, value) => {
    let tempSearch = {...this.state.search};
    tempSearch[type] = value.trim();

    this.setState({
      search: tempSearch
    });
  }
  handlePaginationChange = (type, value) => {
    let tempIP = {...this.state.IP};
    tempIP[type] = value;

    if (type === 'pageSize') {
      tempIP.currentPage = 1;
    }

    this.setState({
      IP: tempIP
    }, () => {
      this.getIPData();
    });
  }
  handleDataChange = (type, field, value) => {
    let tempAddSeat = {...this.state.addSeat};
    tempAddSeat[field] = value;

    this.setState({
      addSeat: tempAddSeat
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
  openEditFloorMap = () => {
    const {floorPlan} = this.state;
    let tempFloorPlan = {...floorPlan};
    tempFloorPlan.type = 'edit';
    tempFloorPlan.name = tempFloorPlan.currentAreaName;

    this.setState({
      modalFloorOpen: true,
      floorPlan: tempFloorPlan
    });
  }
  displayDeleteSeat = (allValue) => {
    const {currentDeviceData} = this.state;

    return (
      <div className='content delete'>
        <span>{t('network-topology.txt-deleteSeatMsg')}: {currentDeviceData.seatObj.seatName}?</span>
      </div>
    )
  }
  openDeleteSeatModal = (allValue) => {
    PopupDialog.prompt({
      title: t('network-topology.txt-deleteSeat'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.displayDeleteSeat(allValue),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteSeatConfirm();
        }
      }
    });
  }
  deleteSeatConfirm = (seatUUID) => {
    const {baseUrl, contextRoot} = this.props;
    const seat = seatUUID || this.state.currentDeviceData.seatUUID;

    ah.one({
      url: `${baseUrl}/api/seat?uuid=${seat}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getIPData();
        this.getSeatData();
        this.closeDialog();
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleTableRowClick = (tableIndex) => {
    const {IP} = this.state
    const seatUUID = _.get(IP.dataContent[tableIndex], 'seatUUID')

    this.setState({
      selectedSeat: seatUUID ? [seatUUID] : []
    });
  }
  handleSelectionChange = (id, eventInfo) => {
    const seatUUID = id;

    this.setState({
      selectedSeat: seatUUID ? [seatUUID] : []
    });
  }
  displayAddNewSeat = () => {
    const {addSeat} = this.state;

    return (
      <div className='add-seat'>
        <label htmlFor='addSeat'>{t('txt-name')}</label>
        <Input
          id='addSeat'
          onChange={this.handleDataChange.bind(this, 'addSeat', 'name')}
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
        {this.displayAddNewSeat()}
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
        this.getIPData();
        this.getSeatData();
        this.closeDialog();
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'));
    });
  }
  getSeatName = (seatUUID) => {
    const {baseUrl, contextRoot} = this.props;
    const {currentDeviceData} = this.state;
    const url = `${baseUrl}/api/seat?uuid=${seatUUID}`;

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempCurrentDeviceData = {...currentDeviceData};
        tempCurrentDeviceData.seatUUID = data.seatUUID;
        tempCurrentDeviceData.seatObj = {
          seatName: data.seatName
        };

        this.setState({
          showSeatData: true,
          currentDeviceData: tempCurrentDeviceData
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getDeviceData = (seatUUID, info) => {
    const {baseUrl, contextRoot} = this.props;
    const url = `${baseUrl}/api/u1/ipdevice/_search?seatUUID=${seatUUID}`;

    if (!seatUUID) {
      let tempAddSeat = {...this.state.addSeat};
      tempAddSeat.coordX = Math.round(info.xy.x);
      tempAddSeat.coordY = Math.round(info.xy.y);

      this.setState({
        addSeatOpen: true,
        addSeat: tempAddSeat
      });
      return;
    }

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      if (data.rows > 0) {
        this.setState({
          showSeatData: true,
          currentDeviceData: data.rows[0]
        });
      } else {
        this.getSeatName(seatUUID);
      }
      return null;
    })
    .catch(err => {
      this.getSeatName(seatUUID);
    });
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
          <i className='fg fg-trashcan' onClick={this.openDeleteSeatModal} title={t('network-topology.txt-deleteSeat')}></i>
        </div>
        <div className='main header'>{t('alert.txt-systemInfo')}</div>
        <div>{t('ipFields.hostName')}: {deviceInfo.hostName}</div>
        <div>{t('ipFields.system')}: {deviceInfo.system}</div>
      </div>
    )
  }
  showSeatData = () => {
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
  closeDialog = () => {
    let tempFloorPlan = {...this.state.floorPlan};
    tempFloorPlan.type = '';
    tempFloorPlan.name = tempFloorPlan.currentAreaName;
    tempFloorPlan.map = '';

    this.setState({
      floorPlan: tempFloorPlan,
      addSeat: {
        selectedSeatUUID: '',
        name: '',
        coordX: '',
        coordY: ''
      },
      modalFloorOpen: false,
      addSeatOpen: false,
      showSeatData: false,
      currentDeviceData: {}
    }, () => {
      this.getFloorPlan();
    });
  }
  closeSeatDialog = () => {
    this.setState({
      showSeatData: false,
      currentDeviceData: {}
    });
  }
  setFilter = (flag) => {
    this.setState({openFilter: flag})
  }
  clearFilter = () => {
    const clear = { keyword: '', system: 'all', deviceType: 'all' }
    this.setState({search: clear})
  }
  renderFilter = () => {
    const {floorPlan, list, search, openFilter} = this.state;

    return (
      <div className={cx('main-filter', {'active': openFilter})}>
        <i className='fg fg-close' onClick={this.setFilter.bind(this, false)} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='MAPkeyword' className='first-label'>{t('ipFields.keyword')}</label>
            <Input id='MAPkeyword' placeholder={t('txt-enterKeyword')} onChange={this.handleSearchChange.bind(this, 'keyword')} value={search.keyword} />
          </div>
          <div className='group'>
            <label htmlFor='MAPsystem'>{t('ipFields.system')}</label>
            <DropDownList id='MAPsystem' list={list.system} required={true} onChange={this.handleSearchChange.bind(this, 'system')} value={search.system}/>
          </div>
          <div className='group'>
            <label htmlFor='MAPdevice'>{t('txt-device')}</label>
            <DropDownList id='MAPdevice' list={list.deviceType} required={true} onChange={this.handleSearchChange.bind(this, 'deviceType')} value={search.deviceType}/>
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getIPData.bind(this, floorPlan.currentAreaUUID)}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot, language, locale, session} = this.props;
    const {
      modalFloorOpen,
      showSeatData,
      addSeatOpen,
      openFilter,
      IP,
      floorPlan,
      currentMap,
      currentBaseLayers,
      mapAreaUUID,
      seatData,
      selectedSeat
    } = this.state;

    return (
      <div>
        {modalFloorOpen &&
          this.modalFloorDialog()
        }

        {showSeatData &&
          this.showSeatData()
        }

        {addSeatOpen &&
          this.addSeatDialog()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button onClick={this.setFilter.bind(this, !openFilter)} title={t('txt-filter')} disabled={IP.dataContent.length === 0}><i className='fg fg-filter'></i></button>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            locale={locale}
            session={session} />

          <div className='parent-content'>
            { this.renderFilter() }

            <div className='main-content'>
              <header className='main-header'>{t('txt-floorMap')}</header>
              <button className='standard btn last' onClick={this.openEditFloorMap} >{t('network-topology.txt-editFloorMap')}</button>

              <div className='map-container'>
                <div className='left-nav'>
                  <div className='tree-data'>
                    {floorPlan.treeData && floorPlan.treeData.length > 0 &&
                      floorPlan.treeData.map(this.displayTreeView)
                    }
                  </div>
                </div>

                <div className='right-content map'>
                  <div className='content-area'>
                    {currentMap.label &&
                      <Gis
                        _ref={(ref) => {this.gisNode = ref}}
                        data={_.get(seatData, [mapAreaUUID, 'data'], [])}
                        selected={selectedSeat}
                        onSelectionChange={this.handleSelectionChange}
                        baseLayers={currentBaseLayers}
                        baseLayer={mapAreaUUID}
                        layouts={['standard']}
                        dragModes={['pan']}
                        scale={{enabled: false}}
                        onClick={this.getDeviceData} />
                    }
                  </div>
                  <div className='table-content'>
                    <div className='table'>
                      <DataTable
                        className='main-table'
                        fields={IP.dataFields}
                        data={IP.dataContent} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

NetworkMap.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

const HocNetworkMap = withLocale(NetworkMap);
export { NetworkMap, HocNetworkMap };