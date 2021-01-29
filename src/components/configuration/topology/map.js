import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'

import Button from '@material-ui/core/Button';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';

import DataTable from 'react-ui/build/src/components/table'
import Gis from 'react-gis/build/src/components'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import FloorMap from '../../common/floor-map'
import helper from '../../common/helper'

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
      device: {
        dataFieldsArr: ['seat', 'ip', 'mac', 'owner', 'hostName', 'system', 'deviceType'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'seat',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 10000,
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
      formValidation: {
        name: {
          valid: true
        }
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
   * Get and set the device list
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
      if (data) {
        const system = _.map(data[0], (val, i) => {
          return <MenuItem key={i} value={val}>{val}</MenuItem>
        });

        const deviceType = _.map(data[1], (val, i) => {
          return <MenuItem key={i} value={val}>{val}</MenuItem>
        });        

        let tempList = {...this.state.list};
        tempList.system = system;
        tempList.deviceType = deviceType;

        this.setState({
          list: tempList
        });
      }
      return null;
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
          this.getDeviceData(areaUUID);
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
            this.getDeviceData(areaUUID);
          });
        } else {
          this.setState({
            mapAreaUUID: floorPlan,
            currentMap,
            currentBaseLayers
          }, () => {
            if (areaUUID) {
              this.getSeatData(areaUUID);
              this.getDeviceData(areaUUID);
            }
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
   * Get and set floor plan seat data
   * @method
   * @param {string} areaUUID - area UUID
   */
  getSeatData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.context;
    const area = areaUUID || this.state.floorPlan.currentAreaUUID;
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
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable field
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
   * Get and set device data
   * @method
   * @param {string} areaUUID - area UUID
   * @returns device data for the data table
   */
  getDeviceData = (areaUUID) => {
    const {baseUrl} = this.context;
    const {device, floorPlan, search} = this.state;
    let requestData = {};
    let area = areaUUID || floorPlan.currentAreaUUID;

    if (!area) {
      return;
    }

    requestData = {
      page: device.currentPage,
      pageSize: device.pageSize
    };

    if (area) {
      requestData = {
        ...requestData,
        areaUUID: area
      }
    }
    
    requestData.keyword = search.keyword;

    if (search.system != 'all') {
      requestData.system = search.system;
    }

    if (search.deviceType != 'all') {
      requestData.deviceType = search.deviceType;
    }

    this.ah.one({
      url: `${baseUrl}/api/ipdevice/_search`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempDevice = {...this.state.device};
        tempDevice.dataContent = data.rows;
        tempDevice.totalCount = data.counts;

        let dataFields = {};
        device.dataFieldsArr.forEach(tempData => {
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

        tempDevice.dataFields = dataFields;

        this.setState({
          device: tempDevice
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle tree selection
   * @param {object} val - tree data
   * @method
   */
  handleSelectTree = (val) => {
    const areaUUID = val.areaUUID;
    let tempFloorPlan = {...this.state.floorPlan};
    tempFloorPlan.currentAreaName = val.areaName;
    tempFloorPlan.currentAreaUUID = areaUUID;
    tempFloorPlan.currentParentAreaUUID = val.parentAreaUUID;
    tempFloorPlan.name = val.areaName;
    tempFloorPlan.type = 'edit';

    this.setState({
      modalFloorOpen: false,
      floorPlan: tempFloorPlan
    }, () => {
      this.getAreaData(areaUUID);
      this.getSeatData(areaUUID);
      this.getDeviceData(areaUUID);
    });
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
        label={val.label}
        onLabelClick={this.handleSelectTree.bind(this, val)}>
        {val.children && val.children.length > 0 &&
          val.children.map(this.getTreeItem)
        }
      </TreeItem>
    )
  }
  /**
   * Get tree data
   * @method
   * @param {object} tree - tree data
   * @param {number} i - index of the floorPlan tree data
   * @returns TreeView component
   */
  displayTreeView = (tree, i) => {
    return (
      <TreeView
        key={i}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultSelected={tree.areaUUID}
        defaultExpanded={[tree.areaUUID]}>
        {tree.areaUUID &&
          <TreeItem
            nodeId={tree.areaUUID}
            label={tree.areaName}
            onLabelClick={this.handleSelectTree.bind(this, tree)}>
            {tree.children.length > 0 &&
              tree.children.map(this.getTreeItem)
            }
          </TreeItem>
        }
      </TreeView>
    )
  }
  /**
   * Handle filter input value change
   * @method
   * @param {string} event - event object
   */
  handleSearchChange = (event) => {
    let tempSearch = {...this.state.search};
    tempSearch[event.target.name] = event.target.value;

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
    let tempDevice = {...this.state.device};
    tempDevice[type] = value;

    if (type === 'pageSize') {
      tempDevice.currentPage = 1;
    }

    this.setState({
      device: tempDevice
    }, () => {
      this.getDeviceData();
    });
  }
  /**
   * Handle add seat value change
   * @method
   * @param {string} event - event object
   */
  handleDataChange = (event) => {
    let tempAddSeat = {...this.state.addSeat};
    tempAddSeat[event.target.name] = event.target.value;

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
    const {currentDeviceData} = this.state;

    return (
      <div className='content delete'>
        <span>{t('network-topology.txt-deleteSeatMsg')}: {currentDeviceData.seatObj.seatName}?</span>
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

    if (!seat) {
      return;
    }

    ah.one({
      url: `${baseUrl}/api/seat?uuid=${seat}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.setState({
          showSeatData: false
        }, () => {
          this.getDeviceData();
          this.getSeatData();
        })
      }
      return null;
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
    const {addSeat, formValidation} = this.state;

    return (
      <TextField
        id='addSeat'
        name='name'
        label={t('txt-name')}
        variant='outlined'
        fullWidth
        size='small'
        required
        error={!formValidation.name.valid}
        helperText={formValidation.name.valid ? '' : t('txt-required')}
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
    const {floorPlan, addSeat, formValidation} = this.state;
    const url = `${baseUrl}/api/seat`;
    const requestData = {
      areaUUID: floorPlan.currentAreaUUID,
      seatName: addSeat.name,
      coordX: addSeat.coordX,
      coordY: addSeat.coordY
    };
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (addSeat.name) {
      tempFormValidation.name.valid = true;
    } else {
      tempFormValidation.name.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
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
        this.setState({
          addSeatOpen: false,
          addSeat: {
            selectedSeatUUID: data,
            name: '',
            coordX: '',
            coordY: ''
          }
        }, () => {
          this.getDeviceData();
          this.getSeatData();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set seat name based on seat UUID
   * @method
   * @param {string} seatUUID - selected seat UUID
   */
  getSeatName = (seatUUID) => {
    const {baseUrl} = this.context;
    const {currentDeviceData} = this.state;

    if (!seatUUID) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/seat?uuid=${seatUUID}`,
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
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set device data based on seat selection, or add new seat
   * @method
   * @param {string} seatUUID - selected seat UUID
   * @param {object} info - MouseClick events
   */
  handleFloorMapClick = (seatUUID, info) => {
    const {baseUrl} = this.context;

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
      url: `${baseUrl}/api/v2/ipdevice/_search?seatUUID=${seatUUID}`,
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
    const {currentDeviceData} = this.state;
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeSeatDialog}
    };

    return (
      <ModalDialog
        id='configSeatDialog'
        className='modal-dialog'
        title={currentDeviceData.seatObj.seatName}
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
  closeDialog = (options) => {
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
      currentDeviceData: {},
      formValidation: {
        name: {
          valid: true
        }
      }
    }, () => {
      if (options === 'reload') {
        this.getFloorPlan();
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
    const {showFilter, device, floorPlan, list, search} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <TextField
              id='MAPkeyword'
              name='keyword'
              label={t('ipFields.keyword')}
              variant='outlined'
              fullWidth
              size='small'
              value={search.keyword}
              onChange={this.handleSearchChange} />
          </div>
          <div className='group'>
            <TextField
              id='MAPsystem'
              name='system'
              select
              label={t('ipFields.system')}
              variant='outlined'
              fullWidth
              size='small'
              required
              value={search.system}
              onChange={this.handleSearchChange}>
              <MenuItem value={'all'}>{t('txt-all')}</MenuItem>
              {list.system}
            </TextField>
          </div>
          <div className='group'>
            <TextField
              id='MAPdevice'
              name='deviceType'
              select
              label={t('txt-device')}
              variant='outlined'
              fullWidth
              size='small'
              required
              value={search.deviceType}
              onChange={this.handleSearchChange}>
              <MenuItem value={'all'}>{t('txt-all')}</MenuItem>
              {list.deviceType}
            </TextField>
          </div>
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.getDeviceData.bind(this, floorPlan.currentAreaUUID)}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {
      showFilter,
      modalFloorOpen,
      showSeatData,
      addSeatOpen,
      device,
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
            <Button variant='outlined' color='primary' className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></Button>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            {this.renderFilter()}

            <div className='main-content'>
              <header className='main-header'>{t('txt-floorMap')}</header>

              <div className='content-header-btns'>
                <Button variant='outlined' color='primary' className='standard btn' onClick={this.openEditFloorMap} >{t('network-topology.txt-editFloorMap')}</Button>
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
                        mapOptions={{
                          maxZoom: 2
                        }}
                        selected={[addSeat.selectedSeatUUID]}
                        onClick={this.handleFloorMapClick} />
                    }
                  </div>
                  <div className='table-content'>
                    <div className='table'>
                      <DataTable
                        className='main-table'
                        fields={device.dataFields}
                        data={device.dataContent} />
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

export default NetworkMap;