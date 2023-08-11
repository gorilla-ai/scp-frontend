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
import FilterQuery from './common/filter-query'
import GeneralDialog from './common/general-dialog'
import helper from '../common/helper'
import HostMenu from './common/host-menu'
import MuiTableContent from '../common/mui-table-content'
import ReportRecord from './common/report-record'
import TableList from './common/table-list'
import UploadFile from './common/upload-file'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const FILTER_LIST = [
  {
    name: 'departmentSelected',
    displayType: 'text_field',
    filterType: 'tree'
  },
  {
    name: 'system',
    displayType: 'text_field',
    filterType: 'tree'
  }
];
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
      systemList: [],
      kbidSearch: _.cloneDeep(KBID_SEARCH),
      kbidFilter: _.cloneDeep(KBID_FILTER),
      kbidFilterList: _.cloneDeep(KBID_FILTER_LIST),
      tableContextAnchor: null,
      exportContextAnchor: null,
      showFilterQuery: false,
      reportOpen: false,
      uploadKbidFileOpen: false,
      uploadedKBID: false,
      showKbidInfo: false,
      activeKbidInfo: 'exposedDevices', //'exposedDevices'
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
      currentKbid: ''
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
                      <Button className='host-open-table-menu' variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue.kbid)} data-cy='hostOpenTableMenuBtn'><i className='fg fg-more'></i></Button>
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
   * @param {string} kbid - active KBID
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
            label: t('host.vulnerabilities.txt-' + val),
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
      tableContextAnchor: null,
      exportContextAnchor: null
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
          <ToggleButton id='hostDialogExposedDevices' value='exposedDevices' data-cy='hostInfoDialogDeviceBtn'>{t('host.vulnerabilities.txt-exposedDevices')}</ToggleButton>
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
   * Toggle show filter query
   * @method
   * @param {string} type - dialog type ('open', 'confirm' or 'cancel')
   * @param {object} [filterData] - filter data
   */
  toggleFilterQuery = (type, filterData) => {
    if (type !== 'open') {
      this.setState({
        systemList: filterData.systemList,
        kbidFilter: filterData.filter,
        kbidFilterList: filterData.itemFilterList
      }, () => {
        if (type === 'confirm') {
          this.getKbidData();
        }
      });
    }

    this.setState({
      showFilterQuery: !this.state.showFilterQuery
    });
  }
  /**
   * Handle export open menu
   * @method
   * @param {object} event - event object
   */
  handleExportOpenMenu = (event) => {
    this.setState({
      exportContextAnchor: event.currentTarget
    });
  }
  /**
   * Export KBID list
   * @method
   * @param {string} type - export type ('kbid' or 'nccst')
   */
  exportKbidList = (type) => {
    const {baseUrl, contextRoot} = this.context;
    let url = '';
    let fieldsList = [];
    let exportFields = {};

    if (type === 'kbid') {
      url = `${baseUrl}${contextRoot}/api/hmd/kbid/_export`;
      fieldsList = ['kbid', 'exposedDevices'];
    } else if (type === 'nccst') {
      url = `${baseUrl}${contextRoot}/api/hmd/kbid/devices/_export`;
      fieldsList = ['departmentName', 'ip', 'system', 'kbid'];
    }

    _.forEach(fieldsList, val => {
      exportFields[val] = t('host.txt-' + val);
    })

    const requestData = {
      ...this.getKbidFilterRequestData(),
      exportFields
    };

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
    this.handleCloseMenu();
  }
  /**
   * Toggle report modal dialog on/off
   * @method
   */
  toggleReport = () => {
    this.setState({
      reportOpen: !this.state.reportOpen,
      uploadedKBID: false
    });
  }
  /**
   * Handle report list confirm
   * @method
   * @param {object} hmdVansConfigurations - HMD vans config data
   */
  confirmReportList = (hmdVansConfigurations) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/hmd/kbid/_report`;
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
  /**
   * Toggle KBID file upload dialog on/off
   * @method
   */
  toggleKbidUploadFile = (data) => {
    this.setState({
      uploadKbidFileOpen: !this.state.uploadKbidFileOpen,
      uploadedKBID: data === true
    });
  }
  render() {
    const {
      account,
      departmentList,
      departmentNameMapping,
      limitedDepartment,
      originalSystemList,
      systemList,
      kbidSearch,
      kbidFilter,
      kbidFilterList,
      tableContextAnchor,
      exportContextAnchor,
      showFilterQuery,
      reportOpen,
      uploadKbidFileOpen,
      uploadedKBID,
      showKbidInfo,
      kbidData
    } = this.state;
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
          <FilterQuery
            page='kbid'
            account={account}
            departmentList={departmentList}
            limitedDepartment={limitedDepartment}
            departmentNameMapping={departmentNameMapping}
            originalSystemList={originalSystemList}
            systemList={systemList}
            filterList={FILTER_LIST}
            originalFilter={KBID_FILTER}
            filter={kbidFilter}
            originalItemFilterList={KBID_FILTER_LIST}
            itemFilterList={kbidFilterList}
            toggleFilterQuery={this.toggleFilterQuery} />
        }

        {reportOpen &&
          <ReportRecord
            page='kbid'
            filter={kbidFilter}
            uploadedFile={uploadedKBID}
            toggleReport={this.toggleReport}
            toggleUploadFile={this.toggleKbidUploadFile}
            confirmReportList={this.confirmReportList} />
        }

        {uploadKbidFileOpen &&
          <UploadFile
            page='kbid'
            toggleUploadFile={this.toggleKbidUploadFile}
            getFilterRequestData={this.getKbidFilterRequestData} />
        }

        {showKbidInfo &&
          this.showKbidDialog()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <HostMenu />
          </div>
        </div>

        <div className='data-content'>
          <div className='parent-content'>
            <TableList
              page='kbid'
              searchType='kbidSearch'
              search={kbidSearch}
              data={kbidData}
              options={tableOptions}
              tableAnchor={tableContextAnchor}
              exportAnchor={exportContextAnchor}
              getData={this.getKbidData}
              getActiveData={this.getExposedDevices}
              exportList={this.exportKbidList}
              toggleReport={this.toggleReport}
              toggleFilterQuery={this.toggleFilterQuery}
              handleSearch={this.handleKbidChange}
              handleReset={this.handleResetBtn}
              handleExportMenu={this.handleExportOpenMenu}
              handleCloseMenu={this.handleCloseMenu} />
          </div>
        </div>
      </div>
    )
  }
}

HostKbid.contextType = BaseDataContext;

HostKbid.propTypes = {
};

export default HostKbid;