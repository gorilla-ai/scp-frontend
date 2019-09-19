import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import Gis from 'react-gis/build/src/components'

import ComboBox from 'react-ui/build/src/components/combobox'
import DataTable from 'react-ui/build/src/components/table'
import DropDownList from 'react-ui/build/src/components/dropdown'
import FileInput from 'react-ui/build/src/components/file-input'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import TreeView from 'react-ui/build/src/components/tree'

import AddOwner from './owner-add'
import {HocPagination as Pagination} from '../../common/pagination'
import {HocFloorMap as FloorMap} from '../../common/floor-map'
import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'
import {HocConfig as Config} from '../../common/configuration'
import RowMenu from '../../common/row-menu'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

class NetworkMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addOwners: [],
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
        dataFieldsArr: ['_menu', 'seat', 'ip', 'mac', 'owner', 'hostName', 'system', 'deviceType'],
        dataFields: {},
        dataContent: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        add: {}
      },
      showTabs: {
        ip: true,
        owner: false,
        map: false,
      },
      mapAreaUUID: '',
      currentMap: '',
      currentBaseLayers: {},
      crosshair: false,
      modalFloorOpen: false,
      modalSeatOpen: false,
      modalTitle: '',
      ipDeviceUUID: '',
      mapDialog: {
        showTabs: {
          ip: true,
          owner: false
        }
      },
      floorPlan: {
        treeData: {},
        type: '',
        rootAreaUUID: '',
        currentAreaUUID: '',
        currentAreaName: '',
        name: '',
        map: ''
      },
      addSeat: {
        name: '',
        seats: [],
        type: '',
        coordX: '',
        coordY: '',
        newDevice: false,
        deviceListArr: [],
        deviceListData: {},
        currentSeatUUID: '',
        currentSeatName: '',
        assignedDevice: false,
        showEditDevice: false
      },
      seatData: {},
      selectedSeat: [],
      ipData: {
        ipListArr: [],
        selectedIP: ''
      },
      ownerData: {
        ownerListArr: [],
        selectedOwner: ''
      },
      allIPdata: {},
      openFilter: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getSearchOption();
    this.getFloorPlan('firstLoad');  //For floor plan on the left nav
    this.getDeviceNoSeatData(); //For device list (no seat) in the modal
    this.getOwnerData();  //For owner list in the modal
  }
  getSearchOption() {
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

    this.ah.one({
      url: `${baseUrl}/api/area/_tree`,
      type: 'GET'
    })
    .then(data => {
      if (option === 'firstLoad') {
        if (data && data.length > 0) {
          const floorPlanData = data[0];
          const areaUUID = floorPlanData.areaUUID;
          let tempFloorPlan = {...this.state.floorPlan};

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
        let tempFloorPlan = {...this.state.floorPlan};
        tempFloorPlan.treeData = data;

        this.setState({
          floorPlan: tempFloorPlan
        }, () => {
          const {floorPlan} = this.state;

          if (_.isEmpty(floorPlan.treeData)) {
            this.closeDialog();
          }
        });
      }
      return null;
    })
  }
  getDeviceNoSeatData = () => {
    const {baseUrl, contextRoot} = this.props;

    this.ah.one({
      url: `${baseUrl}/api/ipdevice/_noseat`,
      type: 'GET'
    })
    .then(data => {
      let tempIPdata = {...this.state.ipData};
      let deviceListArr = [];

      _.forEach(data.rows, val => {
        deviceListArr.push({
          value: val.ipDeviceUUID,
          text: val.ip + ' (' + val.mac + ')'
        });
      })

      tempIPdata.ipListArr = deviceListArr;

      this.setState({
        ipData: tempIPdata
      });
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getOwnerData = () => {
    const {baseUrl, contextRoot} = this.props;

    this.ah.one({
      url: `${baseUrl}/api/owner/_search`,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      let ownerListArr = [];

      _.forEach(data.rows, val => {
        ownerListArr.push({
          value: val.ownerUUID,
          text: val.ownerName
        });
      })

      let tempOwnerData = {...this.state.ownerData};
      tempOwnerData.ownerListArr = ownerListArr;

      this.setState({
        ownerData: tempOwnerData
      });
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
  /* This function checks if there are any devices been assigned to a certain seat */
  checkIPdata = () => {
    const {baseUrl, contextRoot} = this.props;
    const {addSeat, allIPdata} = this.state;
    const seatUUID = allIPdata.seatUUID || addSeat.currentSeatUUID;
    const dataObj = {
      seatUUID
    };

    this.ah.one({
      url: `${baseUrl}/api/ipdevice/_search`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.counts === 0) {
        this.deleteSeat(seatUUID);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /* This function returns the IP data for the data table */
  getIPData = (areaUUID, seatUUID, option) => {
    const {baseUrl, contextRoot} = this.props;
    const {IP, floorPlan, addSeat, search} = this.state;
    let dataObj = {};
    let area = areaUUID || floorPlan.currentAreaUUID;
    let tempAddSeat = {...addSeat};

    if (option === 'getAssignedDevice') { //Get assigned device for area
      dataObj = {
        seatUUID: seatUUID
      };
    } else {
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
      if (option === 'getAssignedDevice') { //Get assigned device for area
        let tempIPdata = {...this.state.ipData};
        let deviceListArr = [];

        if (data.counts > 0) {
          _.forEach(data.rows, val => {
            deviceListArr.push({
              value: val.ipDeviceUUID,
              text: val.ip + ' (' + val.mac + ')'
            });
          })

          tempAddSeat.deviceListArr = deviceListArr;
          tempAddSeat.deviceListData = data.rows;

          let firstElement = data.rows[0];
          tempIPdata.selectedIP = deviceListArr[0].value;
          tempIPdata.ip = firstElement.ip;
          tempIPdata.mac = firstElement.mac;
          tempIPdata.hostName = firstElement.hostName;
          tempIPdata.system = firstElement.system;
          tempIPdata.deviceType = firstElement.deviceType;
          tempAddSeat.currentSeatUUID = seatUUID;

          this.setState({
            addSeat: tempAddSeat,
            ipData: tempIPdata
          }, () => {
            if (firstElement.ownerUUID && firstElement.ownerObj) {
              this.handleOwnerChange(firstElement.ownerUUID);
            }
          });
        } else {
          tempAddSeat.deviceListArr = [];
          tempAddSeat.deviceListData = {};

          this.setState({
            addSeat: tempAddSeat
          });
        }
      } else {
        let tempIP = {...this.state.IP};
        tempIP.dataContent = data.rows;
        tempIP.totalCount = data.counts;

        let dataFields = {};
        IP.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: tempData === '_menu' ? '' : t(`ipFields.${tempData}`),
            sortable: tempData !== '_menu' ? true : null,
            formatter: (value, allValue) => {
              if (tempData === 'seat') {
                if (allValue.seatObj) {
                  return <span>{allValue.seatObj.seatName}</span>;
                }
              }
              if (tempData === 'owner') {
                if (allValue.ownerObj) {
                  return <span>{allValue.ownerObj.ownerName}</span>;
                }
              }
              if (tempData === '_menu') {
                return <RowMenu 
                        page='map'
                        active={value}
                        targetEdit={allValue}
                        targetDelete={allValue}
                        text={{
                          edit: t('txt-edit'),
                          delete: t('txt-delete')
                        }}
                        onEdit={this.getAddSeatContent}
                        onDelete={this.openDeleteDeviceModal} />
              } else {
                return <span>{value}</span>;
              }
            }
          };
        })

        tempIP.dataFields = dataFields;

        this.setState({
          IP: tempIP
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleRowMouseOver(id, allValue, evt) {
    let tmp = {...this.state.IP}

    tmp['dataContent'] = _.map(tmp['dataContent'], el => {
      return {
        ...el,
        _menu: el.ipDeviceUUID === allValue.ipDeviceUUID ? true : false
      }
    })

    this.setState({IP: tmp})
  }
  /* Update owner data when the user selects different owner from the dropdown list */
  handleOwnerChange = (ownerUUID) => {
    const {baseUrl, contextRoot} = this.props;
    let tempOwnerData = {...this.state.ownerData};

    if (ownerUUID) {
      this.ah.one({
        url: `${baseUrl}/api/owner?uuid=${ownerUUID}`,
        type: 'GET'
      })
      .then(data => {
        tempOwnerData.selectedOwner = ownerUUID;
        tempOwnerData.ownerID = data.ownerID;
        tempOwnerData.department = data.department;
        tempOwnerData.title = data.title;
        tempOwnerData.departmentName = data.departmentName;
        tempOwnerData.titleName = data.titleName;
        tempOwnerData.base64 = data.base64;

        this.setState({
          ownerData: tempOwnerData
        });
        return null;
      })
    } else {
      this.setState({
        ownerData: this.clearData('ownerData')
      });
    }
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
    if (type === 'IP') {
      let tempIP = {...this.state.IP};
      tempIP.add[field] = value;

      this.setState({
        IP: tempIP
      });
    } else if (type === 'addSeat') {
      let tempAddSeat = {...this.state.addSeat};
      tempAddSeat[field] = value;

      this.setState({
        addSeat: tempAddSeat
      });
    } else if (type === 'floorPlan') {
      let tempFloorPlan = {...this.state.floorPlan};
      tempFloorPlan[field] = value;

      this.setState({
        floorPlan: tempFloorPlan
      });
    }
  }
  switchTab = (tab) => {
    const tempShowTabs = {
      ip: false,
      owner: false
    };

    const tempMapDialog = {
      showTabs: tempShowTabs
    };

    tempShowTabs[tab] = true;
    tempMapDialog.showTabs[tab] = true;

    this.setState({
      showTabs: tempShowTabs,
      mapDialog: tempMapDialog
    });
  }
  closeDialog = () => {
    let tempShowTabs = {...this.state.showTabs};
    let tempMapDialog = {...this.state.mapDialog};
    let tempFloorPlan = {...this.state.floorPlan};
    let tempAddSeat = {...this.state.addSeat};

    tempShowTabs = {
      ip: true,
      owner: false,
      map: false
    };

    tempMapDialog.showTabs = {
      ip: true,
      owner: false
    };

    tempFloorPlan.type = '';
    tempFloorPlan.name = tempFloorPlan.currentAreaName;
    tempFloorPlan.map = '';

    tempAddSeat.name = '';
    tempAddSeat.assignedDevice = false;
    tempAddSeat.showEditDevice = false;

    this.setState({
      showTabs: tempShowTabs,
      mapDialog: tempMapDialog,
      floorPlan: tempFloorPlan,
      addSeat: tempAddSeat,
      ipData: this.clearData('ipData'),
      ownerData: this.clearData('ownerData'),
      allIPdata: {},
      crosshair: false,
      modalFloorOpen: false,
      modalSeatOpen: false
    }, () => {
      this.getFloorPlan();
    });
  }
  updateIPdevice = (seatUUID, option) => {
    const {baseUrl, contextRoot} = this.props;
    const {IP, ipDeviceUUID, floorPlan, addSeat, ipData, ownerData, allIPdata} = this.state;
    let dataObj = {};

    if (seatUUID || option === 'removeDevice') {
      if (allIPdata.ip) {
        dataObj = {
          ip: allIPdata.ip,
          mac: allIPdata.mac,
          hostName: allIPdata.hostName,
          system: allIPdata.system,
          deviceType: allIPdata.deviceType ,
          ipDeviceUUID: allIPdata.ipDeviceUUID,
          ownerUUID: allIPdata.ownerUUID,
          areaUUID: allIPdata.areaUUID,
          seatUUID: allIPdata.seatUUID
        };
      } else {
        dataObj = {
          ip: ipData.ip,
          mac: ipData.mac,
          hostName: ipData.hostName,
          system: ipData.system,
          deviceType: ipData.deviceType ,
          ipDeviceUUID: ipData.selectedIP,
          ownerUUID: ownerData.selectedOwner,
          areaUUID: floorPlan.currentAreaUUID
        };

        if (seatUUID === 'editSeat') {
          dataObj = {
            ...dataObj,
            seatUUID: addSeat.currentSeatUUID
          }
        } else {
          dataObj = {
            ...dataObj,
            seatUUID
          }
        }
      }
    } else {
      dataObj = {
        ip: IP.add.ip,
        mac: IP.add.mac,
        hostName: IP.add.hostName,
        system: IP.add.system,
        deviceType: IP.add.deviceType,
        ipDeviceUUID: ipDeviceUUID,
        ownerUUID: ownerData.selectedOwner,
        areaUUID: IP.add.areaUUID,
        seatUUID: IP.add.seatUUID
      };
    }

    if (option === 'removeDevice') {
      dataObj = {
        ...dataObj,
        areaUUID: '',
        seatUUID: ''
      };
    }

    this.ah.one({
      url: `${baseUrl}/api/ipdevice`,
      data: JSON.stringify(dataObj),
      type: 'PATCH',
      contentType: 'text/plain'
    })
    .then(data => {
      if (option === 'removeDevice') {
        this.checkIPdata();
      }

      this.getDeviceNoSeatData();
      this.getIPData();

      if (!seatUUID) {
        this.getSeatData();
        this.closeDialog();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  // getDeleteAreaContent = () => {
  //   const {floorPlan} = this.state;

  //   return (
  //     <div className='content delete'>
  //       <span>{t('network-topology.txt-deleteFloorMsg')}: {floorPlan.currentAreaName}?</span>
  //     </div>
  //   )
  // }
  // openDeleteAreaModal = () => {
  //   PopupDialog.prompt({
  //     title: t('network-topology.txt-deleteFloor'),
  //     id: 'modalWindow',
  //     confirmText: t('txt-delete'),
  //     cancelText: t('txt-cancel'),
  //     display: this.getDeleteAreaContent(),
  //     act: (confirmed) => {
  //       if (confirmed) {
  //         this.deleteAreaMap();
  //       }
  //     }
  //   });
  // }
  // deleteAreaMap = () => {
  //   const {baseUrl, contextRoot} = this.props;
  //   const {floorPlan} = this.state;

  //   ah.one({
  //     url: `${baseUrl}/api/area?uuid=${floorPlan.currentAreaUUID}`,
  //     type: 'DELETE'
  //   })
  //   .then(data => {
  //     if (data.ret === 0) {
  //       this.setState({
  //         IP: this.clearData('ipTableData'),
  //         currentMap: this.clearData('mapData'),
  //         floorPlan: this.clearData('floorPlanData')
  //       }, () => {
  //         this.getFloorPlan();
  //       });
  //     }
  //   })
  //   .catch(err => {
  //     helper.showPopupMsg('', t('txt-error'), t('network-topology.txt-deleteChild'));
  //   })
  // }
  // displayAddFloor = () => {
  //   const {currentMap, floorPlan} = this.state;
  //   const addTree = t('network-topology.txt-addTree');
  //   const selectTree = t('network-topology.txt-selectTree');
  //   const deselectTree = t('network-topology.txt-deselectTree');
  //   const editTree = t('network-topology.txt-editTree');
  //   const removeTree = t('network-topology.txt-removeTree');
  //   const removeMap = t('network-topology.txt-deleteFloorMap');
  //   let showMap = true;

  //   if (floorPlan.type === 'add') {
  //     showMap = false;
  //   }

  //   return (
  //     <div className='wide-dialog add-floor'>
  //       <div className='content'>
  //         <div className='text'>
  //           {floorPlan.currentAreaUUID &&
  //             <div>{t('network-topology.txt-selected-node')}: <span>{floorPlan.currentAreaName}</span></div>
  //           }
  //         </div>
  //         <div className='left border'>
  //           <header>
  //             {floorPlan.currentAreaUUID &&
  //               <i className='c-link fg fg-cancel' onClick={this.getAddMapContent.bind(this, 'clear')} title={deselectTree}></i>
  //             }
  //             <i className={cx('c-link', 'fg', 'fg-add', {'active': floorPlan.type === 'add' || !floorPlan.currentAreaUUID})} onClick={this.getAddMapContent.bind(this, 'add')} title={addTree}></i>
  //             {floorPlan.currentAreaUUID &&
  //               <span>
  //                 <i className={cx('c-link', 'fg', 'fg-edit', {'active': floorPlan.type === 'edit'})} onClick={this.getAddMapContent.bind(this, 'edit')} title={editTree}></i>
  //                 <i className='c-link fg fg-trashcan' onClick={this.openDeleteAreaModal} title={removeTree}></i>
  //               </span>
  //             }
  //           </header>

  //           <div className='display-tree'>
  //             {floorPlan.treeData && !_.isEmpty(floorPlan.treeData) &&
  //               floorPlan.treeData.map((value, i) => {
  //                 return this.getTreeView(value, floorPlan.currentAreaUUID, i);
  //               })
  //             }
  //           </div>
  //         </div>

  //         <div className='right no-padding'>
  //           <header className='text-left add-floor'>
  //             <div className='field'>
  //               <label htmlFor='areaMapName'>{t('txt-name')}</label>
  //               <Input
  //                 id='areaMapName'
  //                 className='add'
  //                 value={floorPlan.name}
  //                 onChange={this.handleDataChange.bind(this, 'floorPlan', 'name')} />
  //             </div>

  //             <div className='field'>
  //               <label htmlFor='areaMapUpload'>{t('txt-network-map')}</label>
  //               <FileInput
  //                 id='areaMapUpload'
  //                 name='file'
  //                 btnText={t('txt-upload')}
  //                 validate={{
  //                   max: 10,
  //                   extension: ['.jpg', '.jpeg', '.png'],
  //                   t: (code, params) => {
  //                     if (code[0] === 'file-wrong-format') {
  //                       return t('txt-file-format-error') + ` ${params.extension}`
  //                     }
  //                   }
  //                 }}
  //                 onChange={this.handleDataChange.bind(this, 'floorPlan', 'map')} />
  //             </div>

  //             {showMap && currentMap && floorPlan.currentAreaUUID &&
  //               <i className='c-link fg fg-trashcan' onClick={this.openDeleteSingleAreaModal} title={removeMap}></i>
  //             }
  //           </header>
  //           <div className='map'>
  //             {showMap && currentMap.images &&
  //               <img src={currentMap.images[0].url} title={floorPlan.currentAreaName + ' ' + t('txt-floorMap')} />
  //             }
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }
  handleDeleteArea = () => {
    const {baseUrl, contextRoot} = this.props;
    const {floorPlan} = this.state;
    let formData = new FormData();
    formData.append('rootAreaUUID', floorPlan.rootAreaUUID);
    formData.append('areaName', floorPlan.currentAreaName);
    formData.append('areaUUID', floorPlan.currentAreaUUID);
    formData.append('areaRoute', '');
    formData.append('scale', 0);
    formData.append('updatePic', true);

    if (floorPlan.currentParentAreaUUID) {
      formData.append('parentAreaUUID', floorPlan.currentParentAreaUUID);
    } else {
      formData.append('parentAreaUUID', '');
    }

    if (floorPlan.map) {
      formData.append('file', floorPlan.map);
    } else {
      formData.append('file', '');
    }

    this.ah.one({
      url: `${baseUrl}/api/area`,
      data: formData,
      type: 'PATCH',
      processData: false,
      contentType: false
    })
    .then(data => {
      this.getFloorPlan();

      if (data) {
        this.getAreaData(data, 'setAreaUUID');
      } else {
        this.getAreaData();
      }

      this.closeDialog();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  modalFloorDialog = () => {
    const {baseUrl, contextRoot} = this.props;

    return (
      <FloorMap
        baseUrl={baseUrl}
        contextRoot={contextRoot}
        closeDialog={this.closeDialog} />
    )
    // const {floorPlan} = this.state;
    // const actions = {
    //   cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog.bind(this)},
    //   confirm: {text: t('txt-confirm'), handler: this.handleFloorConfirm.bind(this, 'addFloor')}
    // };
    // let titleText = '';

    // if (floorPlan.type === 'edit' || floorPlan.type === 'map') {
    //   titleText = t('network-topology.txt-editFloorMap');
    // } else {
    //   titleText = t('network-topology.txt-addFloorMap');
    // }

    // return (
    //   <ModalDialog
    //     id='floorModalDialog'
    //     className='modal-dialog'
    //     title={titleText}
    //     draggable={true}
    //     global={true}
    //     actions={actions}
    //     closeAction='cancel'>
    //     {this.displayAddFloor()}
    //   </ModalDialog>
    // )
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
  }
  handleIPChange = (ipDeviceUUID) => {
    const {baseUrl, contextRoot} = this.props;
    let tempIPdata = {...this.state.ipData};
    let tempOwnerData = {...this.state.ownerData};
    tempIPdata.selectedIP = ipDeviceUUID;

    if (ipDeviceUUID) {
      this.ah.one({
        url: `${baseUrl}/api/ipdevice?uuid=${ipDeviceUUID}`,
        type: 'GET'
      })
      .then(data => {
        tempIPdata.ip = data.ip;
        tempIPdata.mac = data.mac;
        tempIPdata.hostName = data.hostName;
        tempIPdata.system = data.system;
        tempIPdata.deviceType = data.deviceType;

        if (data.ownerUUID && data.ownerObj) {
          tempOwnerData.selectedOwner = data.ownerUUID;
          tempOwnerData.ownerID = data.ownerObj.ownerID;
          tempOwnerData.ownerName = data.ownerObj.ownerName;
          tempOwnerData.department = data.ownerObj.department;
          tempOwnerData.title = data.ownerObj.title;
          tempOwnerData.departmentName = data.ownerObj.departmentName;
          tempOwnerData.titleName = data.ownerObj.titleName;
          tempOwnerData.base64 = data.ownerObj.base64;
        } else {
          tempOwnerData = this.clearData('ownerData');
        }

        this.setState({
          ipData: tempIPdata,
          ownerData: tempOwnerData
        });
        return null;
      })
    } else {
      this.setState({
        ipData: this.clearData('ipData'),
        ownerData: this.clearData('ownerData')
      });
    }
  }
  addNewDevice = () => {
    const {ipData} = this.state;
    let tempMapDialog = {...this.state.mapDialog};
    let tempAddSeat = {...this.state.addSeat};

    if (ipData.ipListArr.length === 0) {
      helper.showPopupMsg(t('network-topology.txt-noAvailableDevice'), t('txt-error'));
      this.toggleImageClick();
      return;
    }

    tempMapDialog.showTabs = {
      ip: true,
      owner: false
    };    

    tempAddSeat.assignedDevice = false;
    tempAddSeat.showEditDevice = false;
    tempAddSeat.type = 'device';
    tempAddSeat.newDevice = true;

    this.setState({
      mapDialog: tempMapDialog,
      addSeat: tempAddSeat,
      ipData: this.clearData('ipData'),
      ownerData: this.clearData('ownerData')
    });
  }
  handleAddOwner() {
    const {baseUrl, contextRoot} = this.props;
    this.adder._component.openDialog(baseUrl, contextRoot);
  }
  afterAddOwner(ownerUUID, ownerName) {
    let {addOwners} = this.state

    addOwners.push({
      value: ownerUUID,
      text: ownerName
    })

    this.setState({addOwners})
  }
  displayAddSeat = () => {
    const {contextRoot} = this.props;
    const {mapDialog, addSeat, ipData, ownerData, addOwners} = this.state;
    let list = ownerData.ownerListArr

    _.map(addOwners, el => {
      if (!_.includes(list, el)) {
        list.push(el)
      }
    })

    return (
      <div>
      <AddOwner ref={ref => { this.adder=ref }} onDone={this.afterAddOwner.bind(this)} /> 

      <div className='wide-dialog add-seat'>
        <div className='content'>
          <div className='seat-name'>
            <label htmlFor='seatName'>{t('ipFields.seat')}</label>
            <Input
              id='seatName'
              value={addSeat.name}
              onChange={this.handleDataChange.bind(this, 'addSeat', 'name')} />
          </div>

          {addSeat.assignedDevice &&
            <div>
              <i className='c-link fg fg-trashcan remove-seat' title={t('network-topology.txt-removeSeat')} onClick={this.openDeleteSeatModal}></i>

              <button className='new-device' onClick={this.addNewDevice}>{t('network-topology.txt-addNewDevice')}</button>

              <div className='device-selection'>
                {addSeat.showEditDevice &&
                  <div>
                    <label htmlFor='deviceToEdit'>{t('network-topology.txt-assignedDevice')}</label>
                    <Input
                      id='deviceToEdit'
                      className='add'
                      readOnly={true}
                      value={ipData.showIP} />
                  </div>
                }

                {!addSeat.showEditDevice &&
                  <div>
                    <label htmlFor='deviceSelection'>{t('network-topology.txt-assignedDevice')}</label>
                    <ComboBox
                      id='deviceSelection'
                      list={addSeat.deviceListArr}
                      search={{
                        enabled: true
                      }}
                      onChange={this.handleIPChange}
                      value={ipData.selectedIP} />
                  </div>
                }
              </div>
            </div>
          }

          <div className='right-content'>
            <div className='button-group'>
              <button className={cx({'standard': !mapDialog.showTabs.ip})} onClick={this.switchTab.bind(this, 'ip')}>IP {t('txt-info')}</button>
              <button className={cx({'standard': !mapDialog.showTabs.owner})} onClick={this.switchTab.bind(this, 'owner')}>{t('ipFields.owner')}</button>
              {
                mapDialog.showTabs.owner && 
                <i className='c-link fg fg-poople-invite' onClick={this.handleAddOwner.bind(this)} title={t('network-topology.txt-addOwner')}></i>
              }
              { 
                addSeat.assignedDevice &&
                <i className='c-link fg fg-trashcan' title={t('network-topology.txt-removeDevice')} onClick={this.openDeleteDeviceModal}></i>
              }
            </div>

            <div className='right no-padding map'>
              <div className='left'>
                {mapDialog.showTabs.ip &&
                  <div>
                    <label htmlFor='ipIP'>{t('ipFields.ip')}</label>
                    {!addSeat.assignedDevice &&
                      <ComboBox
                        id='ipIP'
                        className='add'
                        list={ipData.ipListArr}
                        search={true}
                        onChange={this.handleIPChange}
                        value={ipData.selectedIP} />
                    }
                    {addSeat.assignedDevice &&
                      <Input
                        id='ipIP'
                        className='add'
                        readOnly={true}
                        value={ipData.ip} />
                    }

                    <label htmlFor='ipMac'>{t('ipFields.mac')}</label>
                    <Input
                      id='ipMac'
                      className='add'
                      readOnly={true}
                      value={ipData.mac}
                      onChange={this.handleDataChange.bind(this, 'IP', 'mac')} />
                  </div>
                }

                {mapDialog.showTabs.owner &&
                  <div className='owner'>
                    <div className='photo'>
                      {ownerData.base64 &&
                        <img src={ownerData.base64} title={t('network-topology.txt-profileImage')} />
                      }
                      {!ownerData.base64 &&
                        <img src={contextRoot + '/images/empty_profile.png'} title={t('network-topology.txt-profileImage')} />
                      }
                    </div>
                  </div>
                }
              </div>

              <div className='right'>
                {mapDialog.showTabs.ip &&
                  <div>
                    <label htmlFor='ipHost'>{t('ipFields.hostName')}</label>
                    <Input
                      id='ipHost'
                      className='add'
                      readOnly={true}
                      value={ipData.hostName}
                      onChange={this.handleDataChange.bind(this, 'IP', 'hostName')} />

                    <label htmlFor='ipSystem'>{t('ipFields.system')} </label>
                    <Input
                      id='ipSystem'
                      className='add'
                      readOnly={true}
                      value={ipData.system}
                      onChange={this.handleDataChange.bind(this, 'IP', 'system')} />

                    <label htmlFor='ipType'>{t('ipFields.deviceType')} </label>
                    <Input
                      id='ipType'
                      className='add'
                      readOnly={true}
                      value={ipData.deviceType}
                      onChange={this.handleDataChange.bind(this, 'IP', 'deviceType')} />
                  </div>
                }

                {mapDialog.showTabs.owner &&
                  <div>
                    <label htmlFor='ownerName'>{t('ownerFields.ownerName')} </label>
                    <ComboBox
                      id='ownerName'
                      className='add'
                      list={ownerData.ownerListArr}
                      search={true}
                      onChange={this.handleOwnerChange}
                      value={ownerData.selectedOwner} />

                    <label htmlFor='ownerID'>{t('ownerFields.ownerID')}</label>
                    <Input
                      id='ownerID'
                      className='add'
                      readOnly={true}
                      value={ownerData.ownerID} />

                    <label htmlFor='ownerDept'>{t('ownerFields.department')}</label>
                    <Input
                      id='ownerDept'
                      className='add'
                      readOnly={true}
                      value={ownerData.departmentName} />

                    <label htmlFor='ownerTitle'>{t('ownerFields.title')}</label>
                    <Input
                      id='ownerTitle'
                      className='add'
                      readOnly={true}
                      value={ownerData.titleName} />
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    )
  }
  handleSeatConfirm = () => {
    const {baseUrl, contextRoot} = this.props;
    const {floorPlan, addSeat, ipData, ownerData} = this.state;
    let requestType = 'POST';

    if (addSeat.name === '') {
      helper.showPopupMsg(t('network-topology.txt-enterSeat'), t('txt-error'));
      return;
    }

    if (!ipData.selectedIP) {
      helper.showPopupMsg(t('network-topology.txt-selectDevice'), t('txt-error'));
      return;
    }

    let dataObj = {
      areaUUID: floorPlan.currentAreaUUID,
      seatName: addSeat.name,
      coordX: addSeat.coordX,
      coordY: addSeat.coordY
    };

    if (addSeat.type === 'edit' || addSeat.type === 'device') {
      requestType = 'PATCH';
      dataObj = {
        ...dataObj,
        seatUUID: addSeat.currentSeatUUID
      };
    }

    this.ah.one({
      url: `${baseUrl}/api/seat`,
      data: JSON.stringify(dataObj),
      type: requestType,
      contentType: 'text/plain'
    })
    .then(data => {
      if (data && (ipData.selectedIP || ownerData.selectedOwner)) {
        this.updateIPdevice(data); //Pass Seat UUID to update IP device
      } else {
        this.updateIPdevice('editSeat');  //For editing the current seat
      }
      this.getSeatData();
      this.closeDialog();
      this.toggleImageClick();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  modalSeatDialog = () => {
    const {addSeat} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog.bind(this)},
      confirm: {text: t('txt-confirm'), handler: this.handleSeatConfirm.bind(this)}
    };
    let titleText = '';

    if (addSeat.type === 'device') {
      titleText = t('network-topology.txt-addDevice');
    } else {
      if (addSeat.type === 'edit') {
        titleText = t('network-topology.txt-editSeat');
      } else {
        titleText = t('network-topology.txt-addSeat');
      }
    }

    return (
      <ModalDialog
        id='seatModalDialog'
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
  getAddSeatContent = (id, info, option, allValue) => {
    const {addSeat, ipData, ownerData} = this.state;
    let tempAddSeat = {...addSeat};
    let tempIPdata = {...ipData};
    let tempOwnerData = {...ownerData};
    tempAddSeat.type = 'add';

    if (id || option === 'update') {
      tempAddSeat.type = 'edit';
      tempAddSeat.assignedDevice = true;
      allValue = allValue ? allValue : '';

      if (id) {
        const gisNode = this.gisNode.gis.getSymbol(id);
        tempAddSeat.name = gisNode.data.name;
        tempAddSeat.coordX = info.xy.x;
        tempAddSeat.coordY = info.xy.y;
        tempAddSeat.currentSeatName = tempAddSeat.name;
      } else {
        tempAddSeat.name = allValue.seatObj.seatName;
      }

      if (allValue.ipDeviceUUID) {
        tempAddSeat.showEditDevice = true;
        tempIPdata.selectedIP = allValue.ipDeviceUUID;
        tempIPdata.showIP = allValue.ip + ' (' + allValue.mac + ')';
        tempIPdata.ip = allValue.ip;
        tempIPdata.mac = allValue.mac;
        tempIPdata.hostName = allValue.hostName;
        tempIPdata.system = allValue.system;
        tempIPdata.deviceType = allValue.deviceType;
      }

      if (allValue.ownerUUID && allValue.ownerObj) {
        tempOwnerData.selectedOwner = allValue.ownerUUID;
        tempOwnerData.ownerID = allValue.ownerObj.ownerID;
        tempOwnerData.department = allValue.ownerObj.department;
        tempOwnerData.title = allValue.ownerObj.title;
        tempOwnerData.departmentName = allValue.ownerObj.departmentName;
        tempOwnerData.titleName = allValue.ownerObj.titleName;
        tempOwnerData.base64 = allValue.ownerObj.base64;
      }

      this.setState({
        addSeat: tempAddSeat,
        ipData: tempIPdata,
        ownerData: tempOwnerData,
        modalSeatOpen: true
      }, () => {
        if (id || !allValue.ipDeviceUUID) {
          this.getIPData('', id, 'getAssignedDevice');
        }
      });
      return;
    }

    if (ipData.ipListArr.length === 0) {
      helper.showPopupMsg(t('network-topology.txt-noAvailableDevice'), t('txt-error'));
      this.toggleImageClick();
      return;
    }

    if (addSeat.deviceListData.length > 0) {
      tempIPdata.ip = addSeat.deviceListData[0].ip;
      tempIPdata.mac = addSeat.deviceListData[0].mac;
      tempIPdata.hostName = addSeat.deviceListData[0].hostName;
      tempIPdata.system = addSeat.deviceListData[0].system;
      tempIPdata.deviceType = addSeat.deviceListData[0].deviceType;
    }

    tempAddSeat.coordX = Math.round(info.xy.x);
    tempAddSeat.coordY = Math.round(info.xy.y);

    this.setState({
      addSeat: tempAddSeat,
      ipData: tempIPdata,
      modalSeatOpen: true
    }, () => {
      this.handleIPChange();
    });
  }
  getDeleteSingleAreaMapContent = () => {
    const {floorPlan} = this.state;

    return (
      <div className='content delete'>
        <span>{t('network-topology.txt-deleteFloorMapMsg')}: {floorPlan.currentAreaName}?</span>
      </div>
    )
  }
  openDeleteSingleAreaModal = () => {
    PopupDialog.prompt({
      title: t('network-topology.txt-deleteFloorMap'),
      id: 'modalWindow',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteSingleAreaMapContent(),
      act: (confirmed) => {
        if (confirmed) {
          this.handleDeleteArea();
          this.deleteSeatWithArea();
        }
      }
    });
  }
  getDeleteDeviceContent = (allValue) => {
    const {addSeat, ipData} = this.state;
    let ip = ipData.ip;
    let mac = ipData.mac;
    let seatName = addSeat.name;

    if (allValue.ip) {
      ip = allValue.ip;
      mac = allValue.mac;

      if (allValue.seatObj) {
        seatName = allValue.seatObj.seatName;
      }

      this.setState({
        allIPdata: allValue
      });
    }

    return (
      <div className='content delete'>
        <span>{t('network-topology.txt-deleteIPMsg')}: {ip + ' (' + mac + ')'}{t('network-topology.txt-fromSeat')}{seatName}?</span>
      </div>
    )
  }
  openDeleteDeviceModal = (allValue) => {
    PopupDialog.prompt({
      title: t('network-topology.txt-deleteIP'),
      id: 'modalWindow',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteDeviceContent(allValue),
      act: (confirmed, data) => {
        if (confirmed) {
          this.updateIPdevice('', 'removeDevice');
        }
      }
    });
  }
  getDeleteSeatContent = (allValue) => {
    const {addSeat} = this.state;
    let seatName = addSeat.name;

    if (allValue.ip) {
      seatName = allValue.seatObj.seatName;
    }

    return (
      <div className='content delete'>
        <span>{t('network-topology.txt-deleteSeatMsg')}: {seatName}?</span>
      </div>
    )
  }
  openDeleteSeatModal = (allValue) => {
    PopupDialog.prompt({
      title: t('network-topology.txt-deleteSeat'),
      id: 'modalWindow',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteSeatContent(allValue),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteSeat();
        }
      }
    });
  }
  deleteSeatWithArea = () => {
    const {baseUrl, contextRoot} = this.props;
    const areaUUID = this.state.floorPlan.currentAreaUUID;

    ah.one({
      url: `${baseUrl}/api/seat/_area?uuid=${areaUUID}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.setState({
          IP: this.clearData('ipTableData')
        }, () => {
          this.getIPData(areaUUID);
          this.closeDialog();
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  deleteSeat = (seatUUID) => {
    const {baseUrl, contextRoot} = this.props;
    const seat = seatUUID || this.state.addSeat.currentSeatUUID;

    ah.one({
      url: `${baseUrl}/api/seat?uuid=${seat}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getDeviceNoSeatData();
        this.getIPData();
        this.getSeatData();
        this.closeDialog();
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  toggleImageClick = () => {
    const {crosshair} = this.state;

    this.setState({
      crosshair: !crosshair
    });
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
  clearData = (type) => {
    const {IP, floorPlan, ipData, ownerData} = this.state;
    let tempData = {};

    if (type === 'ipTableData') {
      tempData = {
        dataFieldsArr: IP.dataFieldsArr,
        dataFields: {},
        dataContent: [],
        totalCount: IP.totalCount,
        currentPage: IP.currentPage,
        pageSize: IP.pageSize,
        add: {}
      };
    } else if (type === 'mapData') {
      tempData = {
        currentMap: ''
      };
    } else if (type === 'floorPlanData') {
      tempData = {
        treeData: floorPlan.treeData,
        type: '',
        rootAreaUUID: '',
        currentAreaUUID: '',
        currentAreaName: '',
        name: '',
        map: ''
      };
    } else if (type === 'ipData') {
      tempData = {
        ipListArr: ipData.ipListArr,
        selectedIP: '',
        ip: '',
        mac: '',
        hostName: '',
        system: '',
        deviceType: ''
      };
    } else if (type === 'ownerData') {
      tempData = {
        ownerListArr: ownerData.ownerListArr,
        selectedOwner: '',
        ownerID: '',
        ownerName: '',
        department: '',
        title: '',
        departmentName: '',
        titleName: '',
        base64: ''
      };
    }
    return tempData;
  }
  setFilter(flag) {
    this.setState({openFilter: flag})
  }
  clearFilter() {
    const clear = { keyword: '', system: 'all', deviceType: 'all' }
    this.setState({search: clear})
  }
  renderFilter() {
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
          <button className='clear' onClick={this.clearFilter.bind(this)}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {
      currentMap,
      currentBaseLayers,
      mapAreaUUID,
      floorPlan,
      IP,
      seatData,
      selectedSeat,
      modalFloorOpen,
      modalSeatOpen,
      openFilter
    } = this.state;

    const editFloorPlan = t('network-topology.txt-editFloorPlan');
    const removeFloorPlan = t('network-topology.txt-deleteFloorPlan');

    return (
      <div>
        {modalFloorOpen &&
          this.modalFloorDialog()
        }

        {modalSeatOpen &&
          this.modalSeatDialog()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            {_.size(IP.dataContent) > 0 && false &&
              <button onClick={this.setFilter.bind(this, !openFilter)} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
            }
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          <div className='left-nav floor-plan'>
            <header className='main-header'>
              {t('txt-floorMap')}
              <i className='c-link fg fg-edit' onClick={this.openEditFloorMap} title={editFloorPlan}></i>
            </header>
            <div className='content-area'>
              {floorPlan.treeData && floorPlan.treeData.length > 0 &&
                floorPlan.treeData.map((value, i) => {
                  return this.getTreeView(value, floorPlan.currentAreaUUID, i);
                })
              }
            </div>
          </div>

          <div className='right-content'>
            {/* this.renderFilter() */}
            
            <div className='floor-map'>
              <header className='main-header'>
                {t('txt-plan-map')}
                {currentMap.label &&
                  <i className='c-link fg fg-trashcan' onClick={this.openDeleteSingleAreaModal.bind(this)} title={removeFloorPlan}></i>
                }
              </header>
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
                    onClick={this.getAddSeatContent} />
                }
              </div>
            </div>

            <div className='data-table'>
              <div className='main-content'>
                <div className='table-content'>
                  <div className='table normal'>
                    {IP.dataFields &&
                      <DataTable
                        className='main-table'
                        fields={IP.dataFields}
                        data={IP.dataContent}
                        onRowMouseOver={this.handleRowMouseOver.bind(this)}
                        onRowClick={this.handleTableRowClick} />
                    }
                  </div>
                  <footer>
                    <Pagination
                      totalCount={IP.totalCount}
                      pageSize={IP.pageSize}
                      currentPage={IP.currentPage}
                      onPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                      onDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
                  </footer>
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