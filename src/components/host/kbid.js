import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import PopoverMaterial from '@material-ui/core/Popover'
import TextField from '@material-ui/core/TextField'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import TreeItem from '@material-ui/lab/TreeItem'
import TreeView from '@material-ui/lab/TreeView'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {downloadWithForm} from 'react-ui/build/src/utils/download'

import {BaseDataContext} from '../common/context'
import GeneralDialog from './common/general-dialog'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'
import SearchFilter from './search-filter'
import TableList from './common/table-list'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const FILTER_LIST = ['departmentSelected', 'system'];
const KBID_SEARCH = {
  keyword: '',
  count: 0
};
const KBID_FILTER = {
  departmentSelected: [],
  system: []
};
const KBID_FILTER_LIST = {
  departmentSelected: [],
  system: []
};
const VANS_FORM_VALIDATION = {
  oid: {
    valid: true
  },
  unitName: {
    valid: true
  },
  apiKey: {
    valid: true
  },
  apiUrl: {
    valid: true
  }
};
const EXPOSED_DEVICES_SEARCH = {
  hostName: '',
  ip: '',
  system: '',
  count: 0
};
const EXPOSED_DEVICES_DATA = {
  dataFieldsArr: ['hostName', 'ip', 'system', 'departmentName'],
  dataFields: [],
  dataContent: null,
  sort: {
    field: '',
    desc: true
  },
  totalCount: 0,
  currentPage: 0,
  pageSize: 20
};
const HMD_VANS_CONFIG = {
  oid: '',
  unitName: '',
  apiKey: '',
  apiUrl: ''
};

let t = null;
let f = null;

/**
 * Host KBID
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Host KBID page
 */
class HostKbid extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      account: {
        id: '',
        login: false,
        fields: [],
        logsLocale: '',
        departmentId: '',
        limitedRole: false
      },
      departmentList: [],
      departmentNameMapping: {},
      limitedDepartment: [],
      originalSystemList: [],
      systemList: null,
      kbidSearch: _.cloneDeep(KBID_SEARCH),
      kbidFilter: _.cloneDeep(KBID_FILTER),
      kbidFilterList: _.cloneDeep(KBID_FILTER_LIST),
      popOverAnchor: null,
      tableContextAnchor: null,
      activeFilter: '', //same as FILTER_LIST
      showFilterQuery: false,
      reportOpen: false,
      showKbidInfo: false,
      activeKbidInfo: 'exposedDevices',
      kbidData: {
        dataFieldsArr: ['_menu', 'kbid', 'exposedDevices'],
        dataFields: [],
        dataContent: null,
        sort: {
          field: '',
          desc: true
        },
        totalCount: 0,
        currentPage: 0,
        pageSize: 20
      },
      exposedDevicesSearch: _.cloneDeep(EXPOSED_DEVICES_SEARCH),
      exposedDevicesData: _.cloneDeep(EXPOSED_DEVICES_DATA),
      currentKbid: '',
      hmdVansConfigurations: _.cloneDeep(HMD_VANS_CONFIG),
      vansFormValidation: _.cloneDeep(VANS_FORM_VALIDATION)
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, session, sessionRights} = this.context;
    let tempAccount = {...this.state.account};

    helper.getPrivilegesInfo(sessionRights, 'common', locale);
    helper.inactivityTime(baseUrl, locale);

    if (session.accountId) {
      tempAccount.id = session.accountId;
      tempAccount.login = true;
      tempAccount.departmentId = session.departmentId;

      if (!sessionRights.Module_Config) {
        tempAccount.limitedRole = true;
      }

      this.setState({
        account: tempAccount
      }, () => {
        this.getDepartmentTree();
        this.getSystemList();
      });
    }
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get department tree data
   * @method
   */
  getDepartmentTree = () => {
    const {baseUrl} = this.context;
    const {account} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/department/_tree`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let departmentNameMapping = {};

        _.forEach(data, val => {
          helper.floorPlanRecursive(val, obj => {
            departmentNameMapping[obj.id] = obj.name;
          });
        })

        this.setState({
          departmentList: data,
          departmentNameMapping
        }, () => {
          if (account.limitedRole && account.departmentId) {
            this.setSelectedDepartment();
          } else {
            this.getKbidData();
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
   * Set default selected department
   * @method
   */
  setSelectedDepartment = () => {
    const {baseUrl} = this.context;
    const {account, departmentNameMapping, kbidFilter, kbidFilterList} = this.state;
    let tempKbidFilter = {...kbidFilter};
    let tempKbidFilterList = {...kbidFilterList};

    this.ah.one({
      url: `${baseUrl}/api/department/child/_set?id=${account.departmentId}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        tempKbidFilter.departmentSelected = data;
        tempKbidFilterList.departmentSelected = _.map(data, val => {
          return departmentNameMapping[val];
        });

        this.setState({
          limitedDepartment: data,
          kbidFilter: tempKbidFilter,
          kbidFilterList: tempKbidFilterList
        }, () => {
          this.getKbidData();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get system list
   * @method
   */
  getSystemList = () => {
    const {baseUrl} = this.context;
    const apiArr = [
      {
        url: `${baseUrl}/api/common/config?configId=hmd.server.os`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/common/config?configId=hmd.pc.os`,
        type: 'GET'
      }
    ];

    this.ah.all(apiArr)
    .then(data => {
      if (data) {
        let systemList = [];

        if (data[0] && data[0].value) {
          systemList.push({
            name: 'Server',
            checked: false,
            type: 'server',
            children: _.map(data[0].value, val => {
              return {
                name: val,
                checked: false
              }
            })
          });
        }

        if (data[1] && data[1].value) {
          systemList.push({
            name: 'PC',
            checked: false,
            type: 'pc',
            children: _.map(data[1].value, val => {
              return {
                name: val,
                checked: false
              }
            })
          });
        }

        systemList.push({
          name: t('host.txt-noSystemDetected'),
          checked: false,
          type: 'noSystem'
        });

        this.setState({
          originalSystemList: _.cloneDeep(systemList),
          systemList
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set KBID data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getKbidData = (fromPage) => {
    const {baseUrl} = this.context;
    const {kbidSearch, kbidData} = this.state;
    const sort = kbidData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? kbidData.currentPage : 0;
    const requestData = {
      ...this.getKbidFilterRequestData()
    };
    let url = `${baseUrl}/api/hmd/kbid/_search?page=${page + 1}&pageSize=${kbidData.pageSize}`;

    if (kbidData.sort.field) {
      url += `&orders=${kbidData.sort.field} ${sort}`;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempKbidSearch = {...kbidSearch};
        let tempKbidData = {...kbidData};

        if (!data.rows || data.rows.length === 0) {
          tempKbidSearch.count = 0;
          tempKbidData.dataContent = [];
          tempKbidData.totalCount = 0;

          this.setState({
            kbidSearch: tempKbidSearch,
            kbidData: tempKbidData
          });
          return null;
        }       

        tempKbidData.dataContent = data.rows;
        tempKbidData.totalCount = data.count;
        tempKbidData.currentPage = page;
        tempKbidData.dataFields = _.map(kbidData.dataFieldsArr, val => {
          return {
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : f('hostKbidFields.' + val),
            options: {
              filter: true,
              sort: this.checkSortable(val),
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempKbidData.dataContent[dataIndex];
                const value = tempKbidData.dataContent[dataIndex][val];

                if (val === '_menu') {
                  return (
                    <div className='table-menu active'>
                      <Button variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue.kbid)}><i className='fg fg-more'></i></Button>
                    </div>
                  )
                } else {
                  return value;
                }
              }
            }
          };
        });
        tempKbidSearch.count = helper.numberWithCommas(data.count);

        this.setState({
          kbidSearch: tempKbidSearch,
          kbidData: tempKbidData
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
    const unSortableFields = ['_menu'];

    if (_.includes(unSortableFields, field)) {
      return false;
    } else {
      return true;
    }
  }
  /**
   * Get KBID filter request data
   * @method
   * @returns requestData object
   */
  getKbidFilterRequestData = () => {
    const {kbidSearch, kbidFilter, kbidFilterList} = this.state;
    let requestData = {};

    if (kbidSearch.keyword) {
      requestData.kbid = kbidSearch.keyword;
    }

    if (kbidFilter.departmentSelected.length > 0) {
      requestData.departmentArray = kbidFilter.departmentSelected;
    }

    if (kbidFilterList.system.length > 0) {
      const index = kbidFilterList.system.indexOf(t('host.txt-noSystemDetected'));
      let systemArray = _.cloneDeep(kbidFilterList.system);

      if (index > -1) {
        systemArray[index] = 'noExist';
      }

      requestData.systemArray = systemArray;
    }

    return requestData;
  }
  /**
   * Handle open menu
   * @method
   * @param {object} kbid - active KBID
   * @param {object} event - event object
   */
  handleOpenMenu = (kbid, event) => {
    this.setState({
      tableContextAnchor: event.currentTarget,
      currentKbid: kbid
    });
  }
  /**
   * Get exposed devices data
   * @method
   * @param {string} [fromPage] - option for 'open' or 'currentPage'
   */
  getExposedDevices = (fromPage) => {
    const {baseUrl} = this.context;
    const {exposedDevicesSearch, exposedDevicesData, currentKbid} = this.state;
    const sort = exposedDevicesData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? exposedDevicesData.currentPage : 0;
    let url = `${baseUrl}/api/hmd/kbid/devices?page=${page + 1}&pageSize=${exposedDevicesData.pageSize}`;
    let requestData = {
      kbid: currentKbid,
      ...this.getKbidFilterRequestData()
    };

    if (exposedDevicesData.sort.field) {
      url += `&orders=${exposedDevicesData.sort.field} ${sort}`;
    }

    if (exposedDevicesSearch.hostName) {
      requestData.hostName = exposedDevicesSearch.hostName;
    }

    if (exposedDevicesSearch.ip) {
      requestData.ip = exposedDevicesSearch.ip;
    }

    if (exposedDevicesSearch.system) {
      requestData.system = exposedDevicesSearch.system;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempExposedDevicesSearch = {...exposedDevicesSearch};
        let tempExposedDevicesData = {...exposedDevicesData};

        if (!data.rows || data.rows.length === 0) {
          tempExposedDevicesSearch.count = 0;
          tempExposedDevicesData.dataContent = [];
          tempExposedDevicesData.totalCount = 0;

          this.setState({
            exposedDevicesSearch: tempExposedDevicesSearch,
            exposedDevicesData: tempExposedDevicesData
          });
          return null;
        }       

        tempExposedDevicesData.dataContent = data.rows;
        tempExposedDevicesData.totalCount = data.count;
        tempExposedDevicesData.currentPage = page;
        tempExposedDevicesData.dataFields = _.map(exposedDevicesData.dataFieldsArr, val => {
          return {
            name: val,
            label: t('host.dashboard.txt-' + val),
            options: {
              filter: true,
              sort: true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempExposedDevicesData.dataContent[dataIndex];
                const value = tempExposedDevicesData.dataContent[dataIndex][val];
                return value;
              }
            }
          };
        });

        tempExposedDevicesSearch.count = helper.numberWithCommas(data.count);

        this.setState({
          exposedDevicesSearch: tempExposedDevicesSearch,
          exposedDevicesData: tempExposedDevicesData
        }, () => {
          if (fromPage === 'open') {
            this.toggleShowKBID();
          }
        });

        this.handleCloseMenu();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      tableContextAnchor: null
    });
  }
  /**
   * Toggle show KBID info
   * @method
   */
  toggleShowKBID = () => {
    this.setState({
      showKbidInfo: !this.state.showKbidInfo
    }, () => {
      if (!this.state.showKbidInfo) {
        this.setState({
          exposedDevicesSearch: _.cloneDeep(EXPOSED_DEVICES_SEARCH),
          exposedDevicesData: _.cloneDeep(EXPOSED_DEVICES_DATA)
        });
      }
    });
  }
  /**
   * Toggle show KBID button
   * @method
   * @param {object} event - event object
   * @param {string} type - KBID button type ('exposedDevices')
   */
  toggleKbidButtons = (event, type) => {
    if (!type) {
      return;
    }
    
    this.setState({
      activeKbidInfo: type
    });
  }
  /**
   * Handle exposed devices search change
   * @method
   * @param {object} event - event object
   */
  handleDevicesSearchChange = (event) => {
    let tempExposedDevicesSearch = {...this.state.exposedDevicesSearch};
    tempExposedDevicesSearch[event.target.name] = event.target.value;

    this.setState({
      exposedDevicesSearch: tempExposedDevicesSearch
    });
  }
  /**
   * Handle reset button for host name search
   * @method
   * @param {string} type - reset button type ('kbidSearch' or 'exposedDevices')
   */
  handleResetBtn = (type, event) => {
    const {kbidSearch} = this.state;

    if (type === 'kbidSearch') {
      let tempKbidSearch = {...kbidSearch};
      tempKbidSearch.keyword = '';

      this.setState({
        kbidSearch: tempKbidSearch
      });
    } else if (type === 'exposedDevices') {
      this.setState({
        exposedDevicesSearch: _.cloneDeep(EXPOSED_DEVICES_SEARCH)
      });
    }
  }
  /**
   * Display KBID info content
   * @method
   * @returns HTML DOM
   */
  displayKbidInfo = () => {
    const {activeKbidInfo, exposedDevicesSearch, exposedDevicesData} = this.state;
    const tableOptionsExposedDevices = {
      tableBodyHeight: '458px',
      onChangePage: (currentPage) => {
        this.handlePaginationChange('exposedDevices', 'currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('exposedDevices', 'pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort('exposedDevices', changedColumn, direction === 'desc');
      }
    };

    return (
      <div>
        <ToggleButtonGroup
          id='activeKbidInfoButtons'
          value={activeKbidInfo}
          exclusive
          onChange={this.toggleKbidButtons}>
          <ToggleButton id='exposedDevices' value='exposedDevices'>{t('host.dashboard.txt-exposedDevices')}</ToggleButton>
        </ToggleButtonGroup>

        <div className='main-content'>
          {activeKbidInfo === 'exposedDevices' &&
            <GeneralDialog
              page='kbid'
              type='exposed-devices'
              search={exposedDevicesSearch}
              data={exposedDevicesData}
              tableOptions={tableOptionsExposedDevices}
              handleSearchChange={this.handleDevicesSearchChange}
              handleSearchSubmit={this.getExposedDevices}
              handleResetBtn={this.handleResetBtn} />
          }
        </div>
      </div>
    )
  }
  /**
   * Show KBID info dialog
   * @method
   * @returns ModalDialog component
   */
  showKbidDialog = () => {
    const actions = {
      cancel: {text: t('txt-close'), handler: this.toggleShowKBID}
    };

    return (
      <ModalDialog
        id='showKbidDialog'
        className='modal-dialog'
        title={this.state.currentKbid}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayKbidInfo()}
      </ModalDialog>
    )
  }
  /**
   * Handle table sort
   * @method
   * @param {string} tableType - table type ('kbid' or 'exposedDevices')
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (tableType, field, sort) => {
    const {kbidData, exposedDevicesData} = this.state;
    let tempKbidData = {...kbidData};
    let tempExposedDevicesData = {...exposedDevicesData};
    let tableField = field;

    if (tableType === 'kbid') {
      tempKbidData.sort.field = tableField;
      tempKbidData.sort.desc = sort;

      this.setState({
        kbidData: tempKbidData
      }, () => {
        this.getKbidData();
      });
    } else if (tableType === 'exposedDevices') {
      tempExposedDevicesData.sort.field = tableField;
      tempExposedDevicesData.sort.desc = sort;

      this.setState({
        exposedDevicesData: tempExposedDevicesData
      }, () => {
        this.getExposedDevices();
      });
    }
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} tableType - table type ('kbid' or 'exposedDevices')
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (tableType, type, value) => {
    const {kbidData, exposedDevicesData} = this.state;
    let tempKbidData = {...kbidData};
    let tempExposedDevicesData = {...exposedDevicesData};

    if (tableType === 'kbid') {
      tempKbidData[type] = value;

      this.setState({
        kbidData: tempKbidData
      }, () => {
        this.getKbidData(type);
      });
    } else if (tableType === 'exposedDevices') {
      tempExposedDevicesData[type] = value;

      this.setState({
        exposedDevicesData: tempExposedDevicesData
      }, () => {
        this.getExposedDevices(type);
      });
    }
  }
  /**
   * Handle KBID search search
   * @method
   * @param {object} event - event object
   */
  handleKbidChange = (event) => {
    let tempKbidSearch = {...this.state.kbidSearch};
    tempKbidSearch.keyword = event.target.value;

    this.setState({
      kbidSearch: tempKbidSearch
    });
  }
  /**
   * Handle filter click
   * @method
   * @param {string} activeFilter - active filter type
   * @param {object} event - event object
   */
  handleFilterclick = (activeFilter, event) => {
    this.setState({
      popOverAnchor: event.currentTarget,
      activeFilter
    });
  }
  /**
   * Handle popover close
   * @method
   */
  handlePopoverClose = () => {
    this.setState({
      popOverAnchor: null
    });
  }
  /**
   * Toggle show filter query
   * @method
   * @param {string} [options] - option for 'confirm'
   */
  toggleFilterQuery = (options) => {
    if (options === 'confirm') {
      this.getKbidData();
    }

    this.setState({
      showFilterQuery: !this.state.showFilterQuery
    });
  }
  /**
   * Display filter form
   * @method
   * @param {string} val - filter data
   * @param {number} i - index of the filter data
   * @returns HTML DOM
   */
  showFilterForm = (val, i) => {
    const value = this.state.kbidFilterList[val].join(', ');

    return (
      <div key={i} className='group'>
        <TextField
          name={val}
          label={f('hostKbidFields.' + val)}
          variant='outlined'
          fullWidth
          size='small'
          value={value}
          onClick={this.handleFilterclick.bind(this, val)}
          InputProps={{
            readOnly: true
          }} />
      </div>
    )
  }
  /**
   * Determine whether to show department or not
   * @method
   * @param {string} id - department tree ID
   * @returns boolean true/false
   */
  checkDepartmentList = (id) => {
    const {account, limitedDepartment} = this.state;

    if (account.limitedRole) {
      if (limitedDepartment.length === 0) {
        return true;
      }

      if (limitedDepartment.length > 0) {
        if (!_.includes(limitedDepartment, id)) {
          return true;
        }
      }
      return false;
    }
    return false;
  }
  /**
   * Get list of selected checkbox
   * @method
   * @param {bool} checked - checkbox on/off
   * @param {string} type - filterNav type
   * @param {array.<string>} list - list of selected items
   * @param {string} [id] - selected checkbox id
   * @returns array of selected list
   */
  getSelectedItems = (checked, type, list, id) => {
    const {kbidFilter} = this.state;

    if (checked) {
      return _.concat(kbidFilter[type], ...list, id);
    } else {
      return _.without(kbidFilter[type], ...list, id);
    }
  }
  /**
   * Handle department checkbox check/uncheck
   * @method
   * @param {object} tree - department tree data
   * @param {object} event - event object
   */
  toggleDepartmentCheckbox = (tree, event) => {
    const {departmentNameMapping, kbidFilter, kbidFilterList} = this.state;
    let tempKbidFilter = {...kbidFilter};
    let tempKbidFilterList = {...kbidFilterList};
    let departmentChildList = [];

    _.forEach(tree.children, val => {
      helper.floorPlanRecursive(val, obj => {
        departmentChildList.push(obj.id);
      });
    })

    tempKbidFilter.departmentSelected = this.getSelectedItems(event.target.checked, 'departmentSelected', departmentChildList, tree.id);

    tempKbidFilterList.departmentSelected = _.map(tempKbidFilter.departmentSelected, val => {
      return departmentNameMapping[val];
    })

    this.setState({
      kbidFilter: tempKbidFilter,
      kbidFilterList: tempKbidFilterList
    });
  }
  /**
   * Display department tree content
   * @method
   * @param {object} tree - department tree data
   * @returns HTML DOM
   */
  getDepartmentTreeLabel = (tree) => {
    return <span><Checkbox checked={_.includes(this.state.kbidFilter.departmentSelected, tree.id)} onChange={this.toggleDepartmentCheckbox.bind(this, tree)} color='primary' />{tree.name}</span>
  }
  /**
   * Display department tree item
   * @method
   * @param {object} val - department tree data
   * @param {number} i - index of the department tree data
   * @returns TreeItem component
   */
  getDepartmentTreeItem = (val, i) => {
    if (this.checkDepartmentList(val.id)) return; // Hide the tree items that are not belong to the user's account

    return (
      <TreeItem
        key={val.id + i}
        nodeId={val.id}
        label={this.getDepartmentTreeLabel(val)}>
        {val.children && val.children.length > 0 &&
          val.children.map(this.getDepartmentTreeItem)
        }
      </TreeItem>
    )
  }
  /**
   * Handle system checkbox check/uncheck
   * @method
   * @param {object} tree - system tree data
   * @param {object} event - event object
   */
  toggleSystemCheckbox = (tree, event) => {
    const {systemList, kbidFilterList} = this.state;
    let tempSystemList = _.cloneDeep(systemList);
    let tempKbidFilterList = {...kbidFilterList};

    if (tree.type === 'server' || tree.type === 'pc' || !tree.type) {
      let systemSelected = [];

      if (tree.children) { //Handle tree header check/uncheck
        const targetIndex = _.findIndex(systemList, {'name':  tree.name});
        tempSystemList[targetIndex].checked = event.target.checked;
        tempSystemList[targetIndex].children = _.map(systemList[targetIndex].children, val => {
          return {
            ...val,
            checked: event.target.checked
          };
        })
      } else { //Handle tree children check/uncheck
        let parentIndex = '';
        let childrenIndex = '';
        let parentChecked = true;

        _.forEach(systemList, (val, i) => {
          _.forEach(val.children, (val2, j) => {
            if (tree.name === val2.name) {
              parentIndex = i;
              childrenIndex = j;
              return false;
            }
          })
        })
        tempSystemList[parentIndex].children[childrenIndex].checked = event.target.checked;

        _.forEach(tempSystemList[parentIndex].children, val => {
          if (!val.checked) {
            parentChecked = false;
            return false;
          }
        })
        tempSystemList[parentIndex].checked = parentChecked;
      }

      const index = tempKbidFilterList.system.indexOf(t('host.txt-noSystemDetected'));

      if (index > -1) {
        systemSelected.push(t('host.txt-noSystemDetected'));
      }

      _.forEach(tempSystemList, val => {
        _.forEach(val.children, val2 => {
          if (val2.checked) {
            systemSelected.push(val2.name);
          }
        })
      })

      tempKbidFilterList.system = systemSelected;
    }

    if (tree.type === 'noSystem') {
      tempSystemList[2].checked = event.target.checked;

      if (event.target.checked) {
        tempKbidFilterList.system.push(t('host.txt-noSystemDetected'));
      } else {
        const index = tempKbidFilterList.system.indexOf(t('host.txt-noSystemDetected'));
        tempKbidFilterList.system.splice(index, 1);
      }
    }

    this.setState({
      systemList: tempSystemList,
      kbidFilterList: tempKbidFilterList
    });
  }
  /**
   * Display system tree content
   * @method
   * @param {object} tree - system tree data
   * @returns HTML DOM
   */
  getSystemTreeLabel = (tree) => {
    return (
      <span>
        <Checkbox
          name={tree.name}
          checked={tree.checked}
          onChange={this.toggleSystemCheckbox.bind(this, tree)}
          color='primary' />
          {tree.name}
      </span>
    )
  }
  /**
   * Display system tree item
   * @method
   * @param {object} val - system tree data
   * @param {number} i - index of the system tree data
   * @returns TreeItem component
   */
  getSystemTreeItem = (val, i) => {
    return (
      <TreeItem
        key={val.name}
        nodeId={val.name}
        label={this.getSystemTreeLabel(val)}>
        {val.children && val.children.length > 0 &&
          val.children.map(this.getSystemTreeItem)
        }
      </TreeItem>
    )
  }
  /**
   * Display filter query content
   * @method
   * @returns HTML DOM
   */
  displayFilterQuery = () => {
    const {departmentList, systemList, popOverAnchor, activeFilter} = this.state;

    return (
      <div className='filter-section'>
        <PopoverMaterial
          id='dashboardFilterPopover'
          open={Boolean(popOverAnchor)}
          anchorEl={popOverAnchor}
          onClose={this.handlePopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}>
          <div className='content'>
            {activeFilter === 'departmentSelected' &&
              <React.Fragment>
                {departmentList.length === 0 &&
                  <div className='not-found'>{t('txt-notFound')}</div>
                }
                {departmentList.length > 0 &&
                  <TreeView
                    className='tree-view'
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}>
                    {departmentList.map(this.getDepartmentTreeItem)}
                  </TreeView>
                }
              </React.Fragment>
            }
            {activeFilter === 'system' &&
              <TreeView
                className='tree-view'
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}>
                {systemList.map(this.getSystemTreeItem)}
              </TreeView>
            }
          </div>
        </PopoverMaterial>
        {FILTER_LIST.map(this.showFilterForm)}
        <Button variant='outlined' color='primary' className='clear-filter' onClick={this.clearFilter}>{t('txt-clear')}</Button>
      </div>
    )
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      systemList: _.cloneDeep(this.state.originalSystemList),
      kbidFilter: _.cloneDeep(KBID_FILTER),
      kbidFilterList: _.cloneDeep(KBID_FILTER_LIST)
    });
  }
  /**
   * Show filter query dialog
   * @method
   * @returns ModalDialog component
   */
  showFilterQueryDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleFilterQuery},
      confirm: {text: t('txt-confirm'), handler: this.toggleFilterQuery.bind(this, 'confirm')}
    };

    return (
      <ModalDialog
        id='showFilterQueryDialog'
        className='modal-dialog'
        title={t('txt-filterQuery')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayFilterQuery()}
      </ModalDialog>
    )
  }
  /**
   * Export KBID list
   * @method
   */
  exportKbidList = () => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/hmd/kbid/_export`;
    const fieldsList = ['kbid', 'exposedDevices'];
    let exportFields = {};

    _.forEach(fieldsList, val => {
      exportFields[val] = t('host.txt-' + val);
    })

    const requestData = {
      ...this.getKbidFilterRequestData(),
      exportFields
    };

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  /**
   * Toggle report modal dialog on/off
   * @method
   */
  toggleReport = () => {
    this.setState({
      reportOpen: !this.state.reportOpen,
      hmdVansConfigurations: _.cloneDeep(HMD_VANS_CONFIG),
      vansFormValidation: _.cloneDeep(VANS_FORM_VALIDATION)
    });
  }
  /**
   * Set input data change
   * @method
   * @param {object} event - event object
   */
  handleVansConfigChange = (event) => {
    const {name, value} = event.target;
    let tempHmdVansConfigurations = {...this.state.hmdVansConfigurations};
    tempHmdVansConfigurations[name] = value;

    this.setState({
      hmdVansConfigurations: tempHmdVansConfigurations
    });
  }
  /**
   * Display report form content
   * @method
   * @returns HTML DOM
   */
  displayReportForm = () => {
    const {hmdVansConfigurations, vansFormValidation} = this.state;

    return (
      <div className='vans-config-form'>
        <div className='group'>
          <TextField
            id='vansConfigOID'
            name='oid'
            label={t('host.txt-vansConfigOID')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!vansFormValidation.oid.valid}
            helperText={vansFormValidation.oid.valid ? '' : t('txt-required')}
            value={hmdVansConfigurations.oid}
            onChange={this.handleVansConfigChange} />
        </div>
        <div className='group'>
          <TextField
            id='vansConfigUnitName'
            name='unitName'
            label={t('host.txt-vansConfigUnitName')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!vansFormValidation.unitName.valid}
            helperText={vansFormValidation.unitName.valid ? '' : t('txt-required')}
            value={hmdVansConfigurations.unitName}
            onChange={this.handleVansConfigChange} />
        </div>
        <div className='group'>
          <TextField
            id='vansConfigApiKey'
            name='apiKey'
            label={t('host.txt-vansConfigApiKey')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!vansFormValidation.apiKey.valid}
            helperText={vansFormValidation.apiKey.valid ? '' : t('txt-required')}
            value={hmdVansConfigurations.apiKey}
            onChange={this.handleVansConfigChange} />
        </div>
        <div className='group'>    
          <TextField
            id='vansConfigApiUrl'
            name='apiUrl'
            label={t('host.txt-vansConfigApiUrl')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!vansFormValidation.apiUrl.valid}
            helperText={vansFormValidation.apiUrl.valid ? '' : t('txt-required')}
            value={hmdVansConfigurations.apiUrl}
            onChange={this.handleVansConfigChange} />
        </div>
      </div>
    )
  }
  /**
   * Show report list modal dialog
   * @method
   * @returns ModalDialog component
   */
  showReportList = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleReport},
      confirm: {text: t('txt-confirm'), handler: this.confirmReportList}
    };

    return (
      <ModalDialog
        id='reportNCCSTdialog'
        className='modal-dialog'
        title={t('host.txt-report-kbid')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayReportForm()}
      </ModalDialog>
    )
  }
  /**
   * Handle report list confirm
   * @method
   */
  confirmReportList = () => {
    const {baseUrl} = this.context;
    const {hmdVansConfigurations, vansFormValidation} = this.state;
    const url = `${baseUrl}/api/hmd/kbid/_report`;
    let tempVansFormValidation = {...vansFormValidation};
    let validate = true;

    if (hmdVansConfigurations.oid) {
      tempVansFormValidation.oid.valid = true;
    } else {
      tempVansFormValidation.oid.valid = false;
      validate = false;
    }

    if (hmdVansConfigurations.unitName) {
      tempVansFormValidation.unitName.valid = true;
    } else {
      tempVansFormValidation.unitName.valid = false;
      validate = false;
    }

    if (hmdVansConfigurations.apiKey) {
      tempVansFormValidation.apiKey.valid = true;
    } else {
      tempVansFormValidation.apiKey.valid = false;
      validate = false;
    }

    if (hmdVansConfigurations.apiUrl) {
      tempVansFormValidation.apiUrl.valid = true;
    } else {
      tempVansFormValidation.apiUrl.valid = false;
      validate = false;
    }

    this.setState({
      vansFormValidation: tempVansFormValidation
    });

    if (!validate) {
      return;
    }

    const requestData = {
      ...this.getKbidFilterRequestData(),
      hmdKbidConfigurations: {
        oid: hmdVansConfigurations.oid,
        unit_name: hmdVansConfigurations.unitName,
        api_key: hmdVansConfigurations.apiKey,
        api_url: hmdVansConfigurations.apiUrl
      }
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t(`host.txt-nccstCode-${data.Code}`));
        this.toggleReport();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {reportOpen, kbidSearch, showKbidInfo, showFilterQuery, kbidData, tableContextAnchor} = this.state;
    const tableOptions = {
      onChangePage: (currentPage) => {
        this.handlePaginationChange('kbid', 'currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('kbid', 'pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort('kbid', changedColumn, direction === 'desc');
      }
    };

    return (
      <div>
        {showFilterQuery &&
          this.showFilterQueryDialog()
        }

        {reportOpen &&
          this.showReportList()
        }

        {showKbidInfo &&
          this.showKbidDialog()
        }

        <TableList
          page='kbid'
          searchType='kbidSearch'
          search={kbidSearch}
          data={kbidData}
          options={tableOptions}
          tableAnchor={tableContextAnchor}
          getData={this.getKbidData}
          getActiveData={this.getExposedDevices}
          exportList={this.exportKbidList}
          toggleReport={this.toggleReport}
          toggleFilterQuery={this.toggleFilterQuery}
          handleSearch={this.handleKbidChange}
          handleReset={this.handleResetBtn}
          handleCloseMenu={this.handleCloseMenu} />
      </div>
    )
  }
}

HostKbid.contextType = BaseDataContext;

HostKbid.propTypes = {
};

export default HostKbid;