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

import {BaseDataContext} from '../../common/context';
import {HocConfig as Config} from '../../common/configuration'
import {HocFloorMap as FloorMap} from '../../common/floor-map'
import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';

let t = null;
let et = null;

/**
 * Config Topology Map
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the floor map and table list
 */
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
      showFilter: false,
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
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.getSearchOption();
    this.getFloorPlan();  //For floor plan on the left nav
  }
  /**
   * Get and set the IP device list
   * @method
   */
  getSearchOption = () => {
    const {baseUrl} = this.context
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
  /**
   * Get and set tree and floor map data
   * @method
   */
  getFloorPlan = () => {
    const {baseUrl} = this.context;
    const {floorPlan} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/area/_tree`,
      type: 'GET'
    })
    .then(data => {
      let tempFloorPlan = {...floorPlan};

      if (data && data.length === 0) {
        this.setState({
          mapAreaUUID: '',
          currentMap: '',
          currentBaseLayers: {},
          floorPlan: {
            treeData: {},
            type: '',
            rootAreaUUID: '',
            currentAreaUUID: '',
            currentAreaName: '',
            name: '',
            map: ''
          }      
        }, () => {
          this.closeDialog();
        });
      } else {
        const floorPlanData = data[0];
        const areaUUID = floorPlanData.areaUUID;
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
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set floor plan area data
   * @method
   * @param {string} areaUUID - area UUID
   * @param {string} option - option for 'setAreaUUID'
   */
  getAreaData = (areaUUID, option) => {
    const {baseUrl, contextRoot} = this.context;
    const floorPlan = areaUUID || this.state.floorPlan.currentAreaUUID;

    if (!floorPlan) {
      return;
    }

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
  /**
   * Get and set floor plan seat data
   * @method
   * @param {string} areaUUID - area UUID
   */
  getSeatData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.context;
    const area = areaUUID || this.state.floorPlan.currentAreaUUID;
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
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable or null
   */
  checkSortable = (field) => {
    const unSortableFields = ['seat', 'owner'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  /**
   * Get and set IP data
   * @method
   * @param {string} areaUUID - area UUID
   * @returns IP data for the data table
   */
  getIPData = (areaUUID) => {
    const {baseUrl} = this.context;
    const {IP, floorPlan, search} = this.state;
    let dataObj = {};
    let area = areaUUID || floorPlan.currentAreaUUID;

    if (!area) {
      return;
    }

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
  /**
   * Handle tree filter button selection
   * @method
   * @param {number} i - index of the floorPlan tree data
   * @param {string} areaUUID - selected area UUID
   * @param {object} eventData - selected node data (before and path)
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
      this.getIPData(areaUUID);
    });
  }
  /**
   * Get tree data
   * @method
   * @param {object} tree - tree data
   * @param {string} selectedID - selected area UUID
   * @param {number} i - index of the floorPlan tree data
   * @returns TreeView component
   */
  getTreeView = (tree, selectedID, i) => {
    return (
      <TreeView
        id={tree.areaUUID}
        key={tree.areaUUID}
        data={tree}
        selected={selectedID}
        defaultOpened={[tree.areaUUID]}
        onSelect={this.selectTree.bind(this, i)} />
    )
  }
  /**
   * Display tree data for lefe nav
   * @method
   * @param {object} val - tree data
   * @param {number} i - index of the tree array
   * @returns content of the TreeView component
   */
  displayTreeView = (val, i) => {
    return this.getTreeView(val, this.state.floorPlan.currentAreaUUID, i);
  }
  /**
   * Handle filter input value change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleSearchChange = (type, value) => {
    let tempSearch = {...this.state.search};
    tempSearch[type] = value.trim();

    this.setState({
      search: tempSearch
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
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
  /**
   * Handle add seat value change
   * @method
   * @param {string} type - add seat type ('addSeat')
   * @param {string} field - field value
   * @param {string} value - seat name
   */
  handleDataChange = (type, field, value) => {
    let tempAddSeat = {...this.state.addSeat};
    tempAddSeat[field] = value;

    this.setState({
      addSeat: tempAddSeat
    });
  }
  /**
   * Display floor map management modal dialog
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
   * Reset floor plan data and open management dialog
   * @method
   */
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
  /**
   * Display delete seat content
   * @method
   * @returns HTML DOM
   */
  displayDeleteSeat = () => {
    return (
      <div className='content delete'>
        <span>{t('network-topology.txt-deleteSeatMsg')}: {this.state.currentDeviceData.seatObj.seatName}?</span>
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
   * @param {string} seatUUID - seat UUID
   */
  deleteSeatConfirm = (seatUUID) => {
    const {baseUrl} = this.context;
    const seat = seatUUID || this.state.currentDeviceData.seatUUID;

    ah.one({
      url: `${baseUrl}/api/seat?uuid=${seat}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.setState({
          showSeatData: false
        }, () => {
          this.getIPData();
          this.getSeatData();
        })
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set selected seat
   * @method
   * @param {string} seatUUID - seat UUID
   * @param {object} eventInfo - selected seat data
   */
  handleSelectionChange = (seatUUID, eventInfo) => {
    this.setState({
      selectedSeat: seatUUID ? [seatUUID] : []
    });
  }
  /**
   * Display add seat content
   * @method
   * @returns HTML DOM
   */
  displayAddNewSeat = () => {
    return (
      <div className='add-seat'>
        <label htmlFor='addSeat'>{t('txt-name')}</label>
        <Input
          id='addSeat'
          onChange={this.handleDataChange.bind(this, 'addSeat', 'name')}
          value={this.state.addSeat.name} />
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
        {this.displayAddNewSeat()}
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
          this.getIPData();
          this.getSeatData();
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'));
    });
  }
  /**
   * Get and set seat name based on seat UUID
   * @method
   * @param {string} seatUUID - selected seat UUID
   */
  getSeatName = (seatUUID) => {
    const {baseUrl} = this.context;
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
  /**
   * Get and set IP device data based on seat selection, or add new seat
   * @method
   * @param {string} seatUUID - selected seat UUID
   * @param {object} info - MouseClick events
   */
  handleFloorMapClick = (seatUUID, info) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/u1/ipdevice/_search?seatUUID=${seatUUID}`;

    if (!seatUUID) { //Add new seat
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
      if (data.rows.length > 0) {
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
  /**
   * Display seat info content
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
          <i className='fg fg-trashcan' onClick={this.openDeleteSeatModal} title={t('network-topology.txt-deleteSeat')}></i>
        </div>
        <div className='main header'>{t('alert.txt-systemInfo')}</div>
        <div>{t('ipFields.hostName')}: {deviceInfo.hostName}</div>
        <div>{t('ipFields.system')}: {deviceInfo.system}</div>
      </div>
    )
  }
  /**
   * Display seat info modal dialog
   * @method
   * @returns ModalDialog component
   */
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
  /**
   * Close seat dialog and reset seat data
   * @method
   */
  closeSeatDialog = () => {
    this.setState({
      showSeatData: false,
      currentDeviceData: {}
    });
  }
  /**
   * Close dialog and reset floor plan data
   * @method
   */
  closeDialog = () => {
    let tempFloorPlan = {...this.state.floorPlan};
    tempFloorPlan.type = '';
    tempFloorPlan.name = tempFloorPlan.currentAreaName;
    tempFloorPlan.map = '';

    this.setState({
      floorPlan: tempFloorPlan,
      modalFloorOpen: false,
      showSeatData: false,
      addSeatOpen: false,
      addSeat: {
        selectedSeatUUID: '',
        name: '',
        coordX: '',
        coordY: ''
      },
      currentDeviceData: {}
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
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      search: {
        keyword: '',
        system: 'all',
        deviceType: 'all'
      }
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, IP, floorPlan, list, search} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter && IP.dataContent.length > 0})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
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
    const {
      showFilter,
      modalFloorOpen,
      showSeatData,
      addSeatOpen,
      IP,
      floorPlan,
      currentMap,
      currentBaseLayers,
      mapAreaUUID,
      seatData,
      selectedSeat,
      addSeat
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
            <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')} disabled={IP.dataContent.length === 0}><i className='fg fg-filter'></i></button>
          </div>
        </div>

        <div className='data-content'>
          <Config />

          <div className='parent-content'>
            { this.renderFilter() }

            <div className='main-content'>
              <header className='main-header'>{t('txt-floorMap')}</header>

              <div className='content-header-btns'>
                <button className='standard btn' onClick={this.openEditFloorMap} >{t('network-topology.txt-editFloorMap')}</button>
              </div>

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
                        selected={[addSeat.selectedSeatUUID]}
                        onClick={this.handleFloorMapClick} />
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

NetworkMap.contextType = BaseDataContext;

NetworkMap.propTypes = {
};

const HocNetworkMap = withLocale(NetworkMap);
export { NetworkMap, HocNetworkMap };