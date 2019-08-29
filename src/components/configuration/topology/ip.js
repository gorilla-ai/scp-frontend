import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import DateRange from 'react-ui/build/src/components/date-range'
import DataTable from 'react-ui/build/src/components/table'
import DropDownList from 'react-ui/build/src/components/dropdown'
import FileInput from 'react-ui/build/src/components/file-input'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PageNav from 'react-ui/build/src/components/page-nav'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {HocIpOwnerMapModal as IpModalMapModal} from '../../common/ip-owner-map-modal'
import {HocPagination as Pagination} from '../../common/pagination'
import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'
import {HocConfig as Config} from '../../common/configuration'
import RowMenu from '../../common/row-menu'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

class IP extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list: {
        list: [],
        deviceType: []
      },
      search: {
        ip: '',
        name: '',
        system: 'all',
        deviceType: 'all'
      },
      activeMode: {
        all: true,
        pending: false
      },
      showTabs: {
        ip: true,
        owner: false,
        map: false,
      },
      IP: {
        dataFieldsArr: ['_menu', 'ip', 'mac', 'owner', 'hostName', 'system', 'deviceType'],
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
        add: {}
      },
      owner: {
        ownerListArr: [],
        selectedOwner: ''
      },
      currentMap: '',
      treeData: {},
      modalOpen: false,
      modalTitle: '',
      openFilter: false,
      edges: [],
      openEdges: false,
      Edge: {
        target: '',
        ip: ''  ,
        mask: ''
      },
      openImport: false,
      ipImport: {
        ipList: [],
        ipSelected: null
      },
      openLog: false,
      logFile: null,
      openHelp: false,
      openNetflow: false,
      datetime: {
        from: helper.getSubstractDate(7, 'day'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
      },
      ipNetflow: {
        ipList: [],
        totalCount: 0,
        ipSelected: null
      },
      currentPage: 1,
      pageSize: 10,
      openNetFlowTable: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentWillMount() {
    this.getSearchData(); //For search on the left nav
    this.getOwnerData();  //For main table
    this.getIPData(); //For IP device list in the modal
    this.getFloorPlan();  //For floor plan in the modal
  }
  getSearchData = () => {
    const {baseUrl} = this.props;
    const {activeMode} = this.state;
    const apiNameList = ['system', 'devicetype'];
    let apiArr = [];
    let type = '';

    if (activeMode.all) {
      type = 'ipdevice';
    } else if (activeMode.pending) {
      type = 'pendings';
    }

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
  getOwnerData = () => {
    const {baseUrl} = this.props;
    const tempOwner = {...this.state.owner};

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

      tempOwner.ownerListArr = ownerListArr;

      this.setState({
        owner: tempOwner
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getIPData = (fromSearch) => {
    const {baseUrl} = this.props;
    const {search, activeMode, IP} = this.state;
    let dataObj = {
      sort: IP.sort.field,
      order: IP.sort.desc ? 'desc' : 'asc',
      page: fromSearch === 'search' ? 1 : IP.currentPage,
      pageSize: parseInt(IP.pageSize)
    };
    let type = '';

    if (activeMode.all) {
      type = 'ipdevice';
    } else if (activeMode.pending) {
      type = 'pending';
    }

    if (fromSearch === 'search') {
      dataObj.keyword = search.ip;

      if (search.system != 'all') {
        dataObj.system = search.system;
      }

      if (search.deviceType != 'all') {
        dataObj.deviceType = search.deviceType;
      }

      if (search.name) {
        dataObj.ownerUUID = search.name;
      }
    }

    this.ah.one({
      url: `${baseUrl}/api/${type}/_search`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      let tempIP = {...IP};
      tempIP.dataContent = data.rows;
      tempIP.totalCount = data.counts;
      tempIP.currentPage = fromSearch === 'search' ? 1 : IP.currentPage;

      let dataFields = {};
      IP.dataFieldsArr.forEach(tempData => {
        dataFields[tempData] = {
          label: tempData === '_menu' ? '' : t(`ipFields.${tempData}`),
          sortable: this.checkSortable(tempData),
          formatter: (value, allValue) => {
            if (tempData === 'owner') {
              if (allValue.ownerObj) {
                return <span>{allValue.ownerObj.ownerName}</span>;
              } else {
                return <span>{value}</span>;
              }
            }
            if (tempData === '_menu') {
              return <RowMenu
                  page='ip'
                  active={value}
                  targetEdit={allValue}
                  targetDelete={allValue}
                  text={{
                    edit: t('txt-edit'),
                    delete: t('txt-delete')
                  }}
                  onEdit={this.getAddIPContent}
                  onDelete={this.openDeleteIPModal} />
            } else {
              return <span>{value}</span>;
            }
          }
        };
      })

      tempIP.dataFields = dataFields;

      if (!fromSearch) {
        let ipListArr = [];

        _.forEach(data.rows, val => {
          ipListArr.push({
            value: val.ip,
            text: val.ip
          });
        })

        tempIP.ipListArr = ipListArr;
      }

      this.setState({
        IP: tempIP
      }, () => {
        this.closeDialog();
      });
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
  checkSortable = (field) => {
    const unSortableFields = ['options', 'owner', '_menu'];

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
      this.setState({
        treeData: data
      });
    })
  }
  handleTableSort = (value) => {
    let tempIP = {...this.state.IP};
    tempIP.sort.field = value.field;
    tempIP.sort.desc = !tempIP.sort.desc;

    this.setState({
      owner: tempIP
    }, () => {
      this.getIPData();
    });
  }
  handleSearchChange = (type, value) => {
    let tempSearch = {...this.state.search};
    tempSearch[type] = value.trim();

    this.setState({
      search: tempSearch
    });
  }
  handleOwnerChange = (ownerUUID) => {
    const {baseUrl} = this.props;
    let tempOwner = {...this.state.owner};

    if (ownerUUID) {
      this.ah.one({
        url: `${baseUrl}/api/owner?uuid=${ownerUUID}`,
        type: 'GET'
      })
      .then(data => {
        tempOwner.selectedOwner = ownerUUID;
        tempOwner.ownerID = data.ownerID;
        tempOwner.department = data.department;
        tempOwner.title = data.title;
        tempOwner.departmentName = data.departmentName;
        tempOwner.titleName = data.titleName;
        tempOwner.base64 = data.base64;

        this.setState({
          owner: tempOwner
        });
      })
    } else {
      tempOwner.selectedOwner = ownerUUID;
      tempOwner.ownerID = '';
      tempOwner.department = '';
      tempOwner.title = '';
      tempOwner.departmentName = '';
      tempOwner.titleName = '';
      tempOwner.base64 = '';

      this.setState({
        owner: tempOwner
      });
    }
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
  handleDataChange = (type, value) => {
    let tempIP = {...this.state.IP};
    tempIP.add[type] = value;

    this.setState({
      IP: tempIP
    });
  }
  switchTab = (tab) => {
    let tempShowTabs = {
      ip: false,
      owner: false,
      map: false
    };
    tempShowTabs[tab] = true;

    this.setState({
      showTabs: tempShowTabs
    });
  }
  getAddIPContent = (allValue) => {
    const titleText = allValue.ownerUUID ? t('network-topology.txt-editIP') : t('network-topology.txt-addIP');
    const selectedOwner = allValue.ownerObj ? allValue.ownerObj.ownerUUID : '';
    let tempIP = {...this.state.IP};

    tempIP.ipDeviceUUID = allValue.ipDeviceUUID;

    if (allValue.ip) {
      tempIP.add = {...allValue};
    } else {
      tempIP.add = {
        ip: '',
        mac: '',
        hostName: '',
        system: '',
        deviceType: ''
      };
    }

    this.setState({
      IP: tempIP,
      showTabs: {
        ip: true,
        owner: false,
        map: false,
      },
      modalOpen: true,
      modalTitle: titleText
    }, () => {
      if (selectedOwner) {
        this.handleOwnerChange(selectedOwner);
      }
    });
  }
  getDeleteIPContent = (value) => {
    if (value) {
      let tempIP = {...this.state.IP};
      tempIP.add = {...value};

      this.setState({
        IP: tempIP,
        modalOpen: false
      });
    }

    return (
      <div className='content delete'>
        <span>{t('network-topology.txt-deleteIPMsg')}: {value.ip}?</span>
      </div>
    )
  }
  openDeleteIPModal = (value) => {
    PopupDialog.prompt({
      title: t('network-topology.txt-deleteIP'),
      id: 'modalWindow',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteIPContent(value),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteIP();
        }
      }
    });
  }
  deleteIP = () => {
    const {baseUrl} = this.props;
    const {activeMode, IP} = this.state;
    let type = '';
    let uuid = '';

    if (activeMode.all) {
      type = 'ipdevice';
      uuid = IP.add.ipDeviceUUID;
    } else if (activeMode.pending) {
      type = 'pending';
      uuid = IP.add.pendingUUID;
    }

    ah.one({
      url: `${baseUrl}/api/${type}?uuid=${uuid}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getIPData();
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  displayAddIP = () => {
    const {baseUrl, contextRoot} = this.props;
    const {IP, showTabs, owner} = this.state;

    return (
      <IpModalMapModal
        baseUrl={baseUrl}
        contextRoot={contextRoot}
        showTabs={showTabs}
        switchTab={this.switchTab}
        IP={IP}
        owner={owner}
        handleDataChange={this.handleDataChange}
        handleOwnerChange={this.handleOwnerChange} />
    )
  }
  handleIPConfirm = () => {
    const {baseUrl} = this.props;
    const {activeMode, IP, owner} = this.state;
    let requestType = 'POST';
    let type = '';
    let formattedData = '';
    let formData = {
      ip: IP.add.ip,
      mac: IP.add.mac,
      hostName: IP.add.hostName,
      system: IP.add.system,
      deviceType: IP.add.deviceType
    };

    if (owner.selectedOwner) {
      formData = {
        ...formData,
        ownerUUID: owner.selectedOwner
      };
    } else if (owner.selectedOwner === '') {
      formData = {
        ...formData,
        ownerUUID: null
      };
    }

    if (IP.add.ipDeviceUUID) {
      if (owner.selectedOwner === '') {
        formData = {
          ...formData,
          ownerUUID: null
        };
      } else {
        formData = {
          ...formData,
          ownerUUID: owner.selectedOwner,
        };
      }      
      formData = {
        ...formData,
        ipDeviceUUID: IP.add.ipDeviceUUID,
        areaUUID: IP.add.areaUUID,
        seatUUID: IP.add.seatUUID
      };

      requestType = 'PATCH';
    }

    if (activeMode.all) {
      type = 'ipdevice';
      formattedData = JSON.stringify(formData);
    } else if (activeMode.pending) {
      let dataArr = [];

      type = 'pendings';
      dataArr.push(formData);
      formattedData = JSON.stringify(dataArr);
    }

    if (requestType === 'POST') {
      this.ah.one({
        url: `${baseUrl}/api/ipdevice/_search`,
        data: JSON.stringify({keyword: IP.add.ip}),
        type: 'POST',
        contentType: 'text/plain'
      })
      .then(data => {
        if (data.counts > 0) {
          PopupDialog.prompt({
            title: t('txt-warn'),
            confirmText: t('txt-confirm'),
            cancelText: t('txt-cancel'),
            display: t('txt-ipDuplicated'),
            act: (confirmed) => {
              if (confirmed) {
                this.addTopologyIP(requestType, type, formattedData);
              }
            }
          })
        } else {
          this.addTopologyIP(requestType, type, formattedData);
        }
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    } else {
      this.addTopologyIP(requestType, type, formattedData);
    }
  }
  addTopologyIP = (requestType, type, formattedData) => {
    const {baseUrl} = this.props;
    const url = `${baseUrl}/api/${type}`;

    this.ah.one({
      url,
      data: formattedData,
      type: requestType,
      contentType: 'text/plain'
    })
    .then(data => {
      this.getSearchData();
      this.getIPData();

      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), t('network-topology.txt-ipDuplicated'));
    })
  }
  closeDialog = () => {
    this.setState({
      modalOpen: false
    });
  }
  modalDialog = () => {
    const {modalTitle} = this.state;
    const titleText = modalTitle;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog.bind(this)},
      confirm: {text: t('txt-confirm'), handler: this.handleIPConfirm.bind(this)}
    };

    return (
      <ModalDialog
        id='ipModalDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayAddIP()}
      </ModalDialog>
    )
  }
  toggleMode = (mode) => {
    let tempActiveMode = {
      all: false,
      pending: false
    };
    tempActiveMode[mode] = true;

    this.setState({
      activeMode: tempActiveMode
    }, () => {
      this.getSearchData();
      this.getIPData();
    });
  }
  setFilter(flag) {
    this.setState({openFilter: flag})
  }
  clearFilter() {
    const clear = { ip: '', name: '', system: 'all', deviceType: 'all' }
    this.setState({search: clear})
  }
  renderFilter() {
    const {list, search, openFilter} = this.state

    return openFilter &&
      <div className='filter-header'>
        <i className='c-link fg fg-close' onClick={this.setFilter.bind(this, false)} ></i>
        <div className='conds'>
          <div className='cond'>
            <label htmlFor='IPip' className='first-label'>{t('txt-keywords')}</label>
            <Input id='IPip' placeholder={t('txt-enterKeyword')} onChange={this.handleSearchChange.bind(this, 'ip')} value={search.ip} />    
          </div>
          <div className='cond'>
            <label htmlFor='IPsystem'>{t('ipFields.system')}</label>
            <DropDownList id='IPsystem' list={list.system} required={true} onChange={this.handleSearchChange.bind(this, 'system')} value={search.system}/>
          </div>
          <div className='cond'>
            <label htmlFor='IPdevice'>{t('txt-device')}</label>
            <DropDownList id='IPdevice' list={list.deviceType} required={true} onChange={this.handleSearchChange.bind(this, 'deviceType')} value={search.deviceType}/>
          </div>
          <div className='action'>
            <button className='standard' onClick={this.clearFilter.bind(this)}>{t('txt-clear')}</button>
            <button onClick={this.getIPData.bind(this, 'search')}>{t('txt-search')}</button>
          </div>
        </div>
      </div>
  }
  getEdges() {
    const {baseUrl} = this.props

    this.ah.one({
      url: `${baseUrl}/api/ipdevice/edges`,
      type: 'GET'
    })
    .then(data => {
      this.setState({
        edges: data,
        openEdges: true,
        Edge: {target: '', ip: '', mask: ''}
      })
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  switchEdges() {
    const {openEdges} = this.state
    this.setState({openEdges: !openEdges})
  }
  handleEdgeSelect(name, value) {
    const tmp = {...this.state.Edge}
    tmp[name] = value

    this.setState({Edge: tmp})
  }
  modalEdges() {
    const {edges, Edge} = this.state
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.switchEdges.bind(this, 'openEdges')},
      confirm: {text: t('txt-confirm'), handler: this.handleScan.bind(this)}
    }

    let list = [{value: '', text: t('txt-select')}];

    _.forEach(edges, val => {
      list.push({
        value: val.target,
        text: val.target
      });
    })

    return(
      <ModalDialog className='modal-dialog' title={t('txt-network-scan')} draggable={true} global={true} actions={actions} closeAction='cancel'>
        <div className='content'>
          <label htmlFor='edges' className='first-label'>Edge</label>
          <DropDownList id='edges' list={list} required={true} value={Edge.target} onChange={this.handleEdgeSelect.bind(this, 'target')} />
          <label htmlFor='ip2'>IP</label>
          <Input id='ip2' onChange={this.handleEdgeSelect.bind(this, 'ip')} value={Edge.ip} />
          <label htmlFor='mask2'>Mask</label>
          <Input id='mask2' onChange={this.handleEdgeSelect.bind(this, 'mask')} value={Edge.mask} />
        </div>
      </ModalDialog>
    )
  }
  handleScan() {
    const {baseUrl} = this.props
    let {edges, Edge, ipImport} = this.state
    let edge = _.find(edges, {target: Edge.target})

    this.ah.one({
      url: `${baseUrl}/api/ipdevice/_scan?targetId=${edge.id}&targetType=${edge.type}&target=${Edge.ip}&mask=${Edge.mask}`,
      type: 'GET'
    })
    .then(data => {
      ipImport['ipList'] = data
      ipImport['ipSelected'] = null
      this.setState({ipImport, openImport: true, openEdges:false})
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  switchIpImport() {
    const {openImport} = this.state
    this.setState({openImport: !openImport})
  }
  handleIpSelected(ipSelected) {
    let tmp = {...this.state.ipImport}
    tmp['ipSelected'] = ipSelected
    this.setState({ipImport: tmp})
  }
  handleIpImport(type) {
    const {baseUrl} = this.props
    const {ipImport, ipNetflow} = this.state
    let dataObj = ''

    if (type === 'ip') {
      dataObj = _.map(ipImport.ipSelected, el => {
        return ipImport.ipList[el]
      })
    } else if (type === 'ipNetflow') {
      dataObj = _.map(ipNetflow.ipSelected, el => {
        return ipNetflow.ipList[el]
      })
    }

    this.ah.one({
      url: `${baseUrl}/api/ipdevices`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (type === 'ip') {
        this.setState({openImport:false}, () => {this.getIPData()})
      } else if (type === 'ipNetflow') {
        this.setState({openNetFlowTable:false}, () => {this.getIPData()})
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  modalIpImport() {
    const {ipImport} = this.state
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.switchIpImport.bind(this)},
      confirm: {text: t('txt-import'), handler: this.handleIpImport.bind(this, 'ip')}
    }

    return(
      <ModalDialog className='modal-dialog' title={t('txt-ipImport')} draggable={true} global={true} actions={actions} closeAction='cancel'>
        <div className='content'>
          <DataTable
            className='main-table'
            data={ipImport.ipList}
            selected={ipImport.ipSelected}
            onSelectionChange={this.handleIpSelected.bind(this)}
            selection={{enabled:true, toggleAll:true, multiSelect: true }} 
            fields={{
              ip: { label: t('ipFields.ip'), style: {width: '120px'} },
              hostName: { label: t('ipFields.hostName'), style: {width: '120px'} },
              mac: { label: t('ipFields.mac'), style: {width: '120px'} }
            }}  />
        </div>
      </ModalDialog>
    )
  }
  switchLog() {
    const {openLog} = this.state
    this.setState({openLog: !openLog})
  }
  handleChange(name, val) {
    this.setState({[name]: val})
  }
  uploadLog() {
    const {baseUrl} = this.props
    let {logFile, ipImport} = this.state
    let formData = new FormData()
    formData.append('file', logFile)

    this.ah.one({
      url: `${baseUrl}/api/ipdevice/_parse`,
      data: formData,
      type: 'POST',
      dataType: 'JSON',
      processData: false,
      contentType: false
    })
    .then(data => {
      ipImport['ipList'] = data
      ipImport['ipSelected'] = null
      this.setState({ipImport, openImport: true, openLog:false})
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  switchHelp() {
    const {openHelp} = this.state
    this.setState({openHelp: !openHelp})
  }
  modalHelp() {
    const actions = {
      confirm: {text: t('txt-confirm'), handler: this.switchHelp.bind(this)}
    }

    return(
      <ModalDialog title={t('txt-help')} draggable={true} global={true} actions={actions} closeAction='confirm'>
        <div>
          <span>Win DHCP Log Example</span>
          <br />
          <span>DhcpSrvLog-Fri.log:11,12/22/17,00:04:34,更新,192.168.10.24,build-sss-01.gda.cib,005056891BFC,,1282077838,0,,,,0x4D53465420352E30,MSFT 5.0,,,,0</span>
          <br /><br />
          <span>Ubuntu DHCP Log Example</span>
          <br />
          <span>syslog.1:Jan 30 14:04:59 unknown dhcpd[1363]: DHCPREQUEST for 192.168.87.141 (192.168.87.1) from 00:0c:29:64:6e:67 (kali) via ens33</span>
        </div>
      </ModalDialog>
    ) 
  }
  modalLog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.switchLog.bind(this)},
      confirm: {text: t('txt-confirm'), handler: this.uploadLog.bind(this)}
    }

    return(
      <ModalDialog title={t('txt-log-capture')} draggable={true} global={true} actions={actions} closeAction='cancel'>
        <i className='c-link fg fg-help' style={{float: 'right', marginLeft: '20px'}} onClick={this.switchHelp.bind(this)} ></i>
        <FileInput btnText={t('txt-selectFile')} onChange={this.handleChange.bind(this, 'logFile')} enableClear={true} />
      </ModalDialog>
    ) 
  }
  switchNetflow = () => {
    const {openNetflow} = this.state;
    this.setState({openNetflow: !openNetflow, openNetFlowTable: false});
  }

  getNetflow = () => {
    const {baseUrl} = this.props;
    const {datetime, currentPage, pageSize} = this.state;
    const startDttm = Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const endDttm = Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';

    this.ah.one({
      url: `${baseUrl}/api/network/session/unauthHosts?startDttm=${startDttm}&endDttm=${endDttm}&page=${currentPage}&pageSize=${pageSize}`,
      type: 'GET'
    })
    .then(data => {
      const ipNetflow = {
        ipList: data.rows,
        totalCount: data.counts
      };

      this.setState({
        ipNetflow,
        openNetflow: false,
        openNetFlowTable: true
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  modalNetflow = () => {
    const {datetime} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.switchNetflow.bind(this)},
      confirm: {text: t('txt-confirm'), handler: this.getNetflow.bind(this)}
    };

    return (
      <ModalDialog title={t('txt-netflowImport')} draggable={true} global={true} actions={actions} closeAction='cancel'>
        <DateRange
          id='datetime'
          className='daterange'
          onChange={this.handleDateChange}
          enableTime={true}
          value={datetime}
          t={et} />
      </ModalDialog>
    )
  }
  handleDateChange = (datetime) => {
    this.setState({
      datetime
    });
  }
  handlePageChange = (currentPage) => {
    this.setState({
      currentPage
    }, () => {
      this.getNetflow();
    });
  }
  handlePageDropdown = (pageSize) => {
    this.setState({
      pageSize: Number(pageSize)
    }, () => {
      this.getNetflow();
    });
  }
  handleNetflowIpSelected = (ipSelected) => {
    let tempIpNetflow = {...this.state.ipNetflow};
    tempIpNetflow['ipSelected'] = ipSelected;

    this.setState({
      ipNetflow: tempIpNetflow
    });
  }
  modalNetFlowTable = () => {
    const {ipNetflow, currentPage, pageSize} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.switchNetflow.bind(this)},
      confirm: {text: t('txt-import'), handler: this.handleIpImport.bind(this, 'ipNetflow')}
    };

    return (
      <ModalDialog id='netFlowDialog' className='modal-dialog' title={t('txt-ipNetflow')} draggable={true} global={true} actions={actions} closeAction='cancel'>
        <div className='content'>
          <DataTable
            className='main-table'
            data={ipNetflow.ipList}
            selected={ipNetflow.ipSelected}
            onSelectionChange={this.handleNetflowIpSelected.bind(this)}
            selection={{enabled:true, toggleAll:true, multiSelect:true}}
            rowIdField='ip'
            fields={{
              ip: { label: t('ipFields.ip') },
              mac: { label: t('ipFields.mac') },
              connSize: { label: t('ipFields.connSize') },
              unauthType: { label: t('ipFields.unauthType') }
            }} />
          <div className='c-flex jcc'>
            {ipNetflow.totalCount > 0 &&
              <PageNav
                pages={Math.ceil(ipNetflow.totalCount / pageSize)}
                current={currentPage}
                onChange={this.handlePageChange} />
            }

            {ipNetflow.totalCount > 0 && false &&
              <div className='pure-control-group dropdown-margin pagination'>
                <label htmlFor='pageSize'>{t('txt-pageSize')}</label>
                <DropDownList
                  id='pageSize'
                  list={[
                    {value: 10, text: '10'},
                    {value: 20, text: '20'},
                    {value: 50, text: '50'},
                    {value: 100, text: '100'},
                    {value: 500, text: '500'},
                    {value: 1000, text: '1000'}
                  ]}
                  required={true}
                  onChange={this.handlePageDropdown}
                  value={pageSize} />
              </div>
            }
          </div>
        </div>
      </ModalDialog>
    )
  }
  render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {
      activeMode,
      IP,
      modalOpen,
      openFilter,
      openEdges,
      openImport,
      openLog,
      openHelp,
      openNetflow,
      openNetFlowTable
    } = this.state

    return (
      <div>
        { modalOpen && this.modalDialog() }
        { openEdges && this.modalEdges() }
        { openImport && this.modalIpImport() }
        { openLog && this.modalLog() }
        { openHelp && this.modalHelp() }
        { openNetflow && this.modalNetflow() }
        { openNetFlowTable && this.modalNetFlowTable() }

        <div className='sub-nav-header' />

        <div className='config-header'>
          <div className='breadcrumb' />
          <i className='c-link fg fg-add' onClick={this.getAddIPContent} title={t('network-topology.txt-addIP')}></i>
          <i className='c-link fg fg-filter' onClick={this.setFilter.bind(this, !openFilter)} title={t('txt-filter')}></i>
          <i className='c-link fg fg-correlate' onClick={this.getEdges.bind(this)} title={t('txt-network-scan')}></i>
          <i className='c-link fg fg-data-box' onClick={this.switchLog.bind(this, 'openLog')} title={t('txt-log-capture')}></i>
          <i className='c-link fg fg-network' onClick={this.switchNetflow.bind(this, 'openNetflow')} title={t('txt-netflowImport')}></i>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          {activeMode.all &&
            <div className='data-table manage'>
              { this.renderFilter() }
              {IP.dataFields &&
                <DataTable
                  className='main-table'
                  fields={IP.dataFields}
                  data={IP.dataContent}
                  onRowMouseOver={this.handleRowMouseOver.bind(this)}
                  sort={IP.dataContent.length === 0 ? {} : IP.sort}
                  onSort={this.handleTableSort} />
              }
              <footer>
                <Pagination
                  totalCount={IP.totalCount}
                  pageSize={IP.pageSize}
                  currentPage={IP.currentPage}
                  onPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                  onDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
              </footer>
            </div>
          }

          {activeMode.pending &&
            <div className='data-table manage'>
              {IP.dataFields &&
                <DataTable
                  className='main-table'
                  fields={IP.dataFields}
                  data={IP.dataContent} />
              }
              <footer>
                <Pagination
                  totalCount={IP.totalCount}
                  pageSize={IP.pageSize}
                  currentPage={IP.currentPage}
                  onPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                  onDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
              </footer>
            </div>
          }
        </div>
      </div>
    )
  }
}

IP.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

const HocIP = withLocale(IP);
export { IP, HocIP };