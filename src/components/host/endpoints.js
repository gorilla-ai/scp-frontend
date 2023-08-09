import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import Popover from 'react-ui/build/src/components/popover'

import {downloadWithForm} from 'react-ui/build/src/utils/download'

import {BaseDataContext} from '../common/context'
import FilterQuery from './common/filter-query'
import GeneralDialog from './common/general-dialog'
import helper from '../common/helper'
import HostMenu from './common/host-menu'
import ImportFile from './import-file'
import MemoInput from './common/memo-input'
import ReportRecord from './common/report-record'
import TableList from './common/table-list'
import UploadFile from './common/upload-file'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SEVERITY_TYPE = ['critical', 'high', 'medium', 'low'];
const CONNECTION_STATUS = ['online', 'offline', 'inActivate'];
const CONDITION_MODE = {
  '=': 'eq',
  '>': 'gt',
  '<': 'lt'
};
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
  },
  {
    name: 'connectionStatus',
    displayType: 'auto_complete',
    filterType: 'auto_complete'
  },
  {
    name: 'version',
    displayType: 'text_field',
    filterType: 'multi_input',
    searchType: 'condition_input'
  },
  {
    name: 'riskValue',
    displayType: 'text_field',
    filterType: 'multi_input',
    searchType: 'condition_input'
  },
  {
    name: 'risk',
    displayType: 'auto_complete',
    filterType: 'auto_complete'
  },
  {
    name: 'memos',
    displayType: 'text_field',
    filterType: 'multi_input',
    searchType: 'input'
  }
];
const ENDPOINTS_SEARCH = {
  keyword: '',
  count: 0
};
const ENDPOINTS_FILTER = {
  departmentSelected: [],
  system: [],
  connectionStatus: [],
  version: [{
    condition: '=',
    input: ''
  }],
  riskValue: [{
    condition: '=',
    input: ''
  }],
  risk: [],
  memos: [{
    input: ''
  }]
};
const ENDPOINTS_FILTER_LIST = {
  departmentSelected: [],
  system: [],
  connectionStatus: [],
  version: [],
  riskValue: [],
  risk: [],
  memos: []
};
const EXPOSED_DEVICES_SEARCH = {
  hostName: '',
  ip: '',
  system: '',
  count: 0
};
const EXPOSED_DEVICES_DATA = {
  dataFieldsArr: ['hostName', 'ip', 'system', 'daysOpen'],
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
const DISCOVERED_VULNERABILITY_DATA = {
  dataFieldsArr: ['cveId', 'severity', 'cvss'],
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
let ALERT_LEVEL_COLORS = {};

let t = null;
let f = null;

/**
 * Host End Points
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Host End Points page
 */
class HostEndPoints extends Component {
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
      severityType: [],
      connectionStatus: [],
      importDialogOpen: false,
      endpointsSearch: _.cloneDeep(ENDPOINTS_SEARCH),
      endpointsFilter: _.cloneDeep(ENDPOINTS_FILTER),
      endpointsFilterList: _.cloneDeep(ENDPOINTS_FILTER_LIST),
      exportContextAnchor: null,
      tableContextAnchor: null,
      cveNameSearch: {
        keyword: '',
        count: 0
      },
      showMemoInfo: false,
      showCpeInfo: false,
      showFilterQuery: false,
      reportOpen: false,
      uploadCpeFileOpen: false,
      uploadedCPE: false,
      activeCpeInfo: 'vulnerabilityDetails', //'vulnerabilityDetails', 'exposedDevices', or 'discoveredVulnerability'
      endpointsData: {
        dataFieldsArr: ['_menu', 'hostName', 'ip', 'system', 'department', 'status', 'version', 'riskValue', 'risk', 'hbDttm', 'memos'],
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
      memoData: [{
        input: ''
      }],
      exposedDevicesSearch: _.cloneDeep(EXPOSED_DEVICES_SEARCH),
      exposedDevicesData: _.cloneDeep(EXPOSED_DEVICES_DATA),
      discoveredVulnerabilityData: _.cloneDeep(DISCOVERED_VULNERABILITY_DATA),
      currentHostId: '',
      currentCpeData: {}
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
        this.getSeverityType();
        this.getConnectionStatus();
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
            this.getEndpointsData();
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
    const {account, departmentNameMapping, endpointsFilter, endpointsFilterList} = this.state;
    let tempEndpointsFilter = {...endpointsFilter};
    let tempEndpointsFilterList = {...endpointsFilterList};

    this.ah.one({
      url: `${baseUrl}/api/department/child/_set?id=${account.departmentId}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        tempEndpointsFilter.departmentSelected = data;
        tempEndpointsFilterList.departmentSelected = _.map(data, val => {
          return departmentNameMapping[val];
        });

        this.setState({
          limitedDepartment: data,
          endpointsFilter: tempEndpointsFilter,
          endpointsFilterList: tempEndpointsFilterList
        }, () => {
          this.getSystemVendorList();
          this.getEndpointsData();
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
   * Get and set severity type
   * @method
   */
  getSeverityType = () => {
    const severityType = _.map(SEVERITY_TYPE, val => {
      let text = t('txt-' + val);

      if (val === 'critical') {
        text += ' (9.0 - 10)'; 
      } else if (val === 'high') {
        text += ' (7.0 - 8.9)'; 
      } else if (val === 'medium') {
        text += ' (4.0 - 6.9)'; 
      } else if (val === 'low') {
        text += ' (0.1 - 3.9)'; 
      }

      return {
        value: val,
        text
      };
    });

    this.setState({
      severityType
    });
  }
  /**
   * Get and set connection status
   * @method
   */
  getConnectionStatus = () => {
    const connectionStatus = _.map(CONNECTION_STATUS, val => {
      return {
        value: val,
        text: t('txt-' + val)
      };
    });

    this.setState({
      connectionStatus
    });
  }
  /**
   * Display individual memo
   * @method
   * @param {string} val - memo
   * @param {number} i - index of the memos
   * @returns HTML DOM
   */
  getMemo = (val, i) => {
    return <div key={i}>{val}</div>
  }
  /**
   * Handle popover open
   * @method
   * @param {array.<string>} memos - memos to be displayed
   * @param {object} event - event object
   */
  openPopover = (memos, event) => {
    Popover.openId('memosDisplay', event, memos.map(this.getMemo));
  }
  /**
   * Handle popover close
   * @method
   */
  closePopover = () => {
    Popover.closeId('memosDisplay');
  }
  /**
   * Get and set endpoints data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getEndpointsData = (fromPage) => {
    const {baseUrl} = this.context;
    const {endpointsSearch, endpointsData} = this.state;
    const sort = endpointsData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? endpointsData.currentPage : 0;
    const requestData = {
      ...this.getEndpointsFilterRequestData()
    };
    let url = `${baseUrl}/api/hmd/endPoint/_search?page=${page + 1}&pageSize=${endpointsData.pageSize}`;

    if (endpointsData.sort.field) {
      url += `&orders=${endpointsData.sort.field} ${sort}`;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempEndpointsSearch = {...endpointsSearch};
        let tempEndpointsData = {...endpointsData};

        if (!data.rows || data.rows.length === 0) {
          tempEndpointsSearch.count = 0;
          tempEndpointsData.dataContent = [];
          tempEndpointsData.totalCount = 0;

          this.setState({
            endpointsSearch: tempEndpointsSearch,
            endpointsData: tempEndpointsData
          });
          return null;
        }       

        tempEndpointsData.dataContent = data.rows;
        tempEndpointsData.totalCount = data.count;
        tempEndpointsData.currentPage = page;
        tempEndpointsData.dataFields = _.map(endpointsData.dataFieldsArr, val => {
          return {
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : f('hostEndpointsFields.' + val),
            options: {
              filter: true,
              sort: this.checkSortable(val),
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempEndpointsData.dataContent[dataIndex];
                const value = tempEndpointsData.dataContent[dataIndex][val];

                if (val === '_menu') {
                  return (
                    <div className='table-menu active'>
                      <Button className='host-open-table-menu' variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue)} data-cy='hostOpenTableMenuBtn'><i className='fg fg-more'></i></Button>
                    </div>
                  )
                } else if (val === 'status' && value) {
                  return <span>{t('txt-' + value)}</span>
                } else if (val === 'hbDttm' && value) {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                } else if (val === 'memos' && value.length > 0) {
                  const content = value.join(', ');

                  if (content.length > 30) {
                    const reducedContent = content.substr(0, 30) + '...';
                    return <span onMouseOver={this.openPopover.bind(this, value)} onMouseOut={this.closePopover}>{reducedContent}</span>
                  } else {
                    return <span>{content}</span>
                  }
                } else {
                  return value;
                }
              }
            }
          };
        });
        tempEndpointsSearch.count = helper.numberWithCommas(data.count);

        this.setState({
          endpointsSearch: tempEndpointsSearch,
          endpointsData: tempEndpointsData
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
    const unSortableFields = ['_menu', 'risk', 'memos'];

    if (_.includes(unSortableFields, field)) {
      return false;
    } else {
      return true;
    }
  }
  /**
   * Get endpoints filter request data
   * @method
   * @returns requestData object
   */
  getEndpointsFilterRequestData = () => {
    const {endpointsSearch, endpointsFilter, endpointsFilterList} = this.state;
    let requestData = {};

    if (endpointsSearch.keyword) {
      requestData.hostNameOrIp = endpointsSearch.keyword;
    }

    if (endpointsFilter.departmentSelected.length > 0) {
      requestData.departmentArray = endpointsFilter.departmentSelected;
    }

    if (endpointsFilterList.system.length > 0) {
      const index = endpointsFilterList.system.indexOf(t('host.txt-noSystemDetected'));
      let systemArray = _.cloneDeep(endpointsFilterList.system);

      if (index > -1) {
        systemArray[index] = 'noExist';
      }

      requestData.systemArray = systemArray;
    }

    if (endpointsFilter.connectionStatus.length > 0) {
      requestData.statusArray = _.map(endpointsFilter.connectionStatus, val => {
        return val.value;
      });
    }

    if (endpointsFilterList.version.length > 0) {
      requestData.versionArray = _.map(endpointsFilterList.version, val => {
        return {
          mode: CONDITION_MODE[val.substr(0, 1)],
          version: val.substr(2)
        }
      });
    }

    if (endpointsFilterList.riskValue.length > 0) {
      requestData.riskValueArray = _.map(endpointsFilterList.riskValue, val => {
        return {
          mode: CONDITION_MODE[val.substr(0, 1)],
          riskValue: val.substr(2)
        }
      });
    }

    if (endpointsFilter.risk.length > 0) {
      const riskArray = _.map(endpointsFilter.risk, val => {
        return val.value.toUpperCase();
      });

      requestData.riskArray = riskArray;
    }

    if (endpointsFilterList.memos.length > 0) {
      requestData.memos = endpointsFilterList.memos;
    }

    return requestData;
  }
  /**
   * Handle open menu
   * @method
   * @param {object} allValue - selected host data
   * @param {object} event - event object
   */
  handleOpenMenu = (allValue, event) => {
    const memoData = _.map(allValue.memos, val => {
      return {
        input: val
      };
    });

    this.setState({
      tableContextAnchor: event.currentTarget,
      memoData,
      currentHostId: allValue.hostId
    });
  }
  /**
   * Get individual CPE data
   * @method
   */
  getActiveCpeInfo = () => {
    const {baseUrl} = this.context;
    const {currentCpeKey} = this.state;
    const url = `${baseUrl}/api/hmd/cpeUpdateToDate/cpeInfo?cpeKey=${currentCpeKey}`;

    this.ah.one({
      url,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.setState({
          currentCpeData: data.cpeInfo
        }, () => {
          this.toggleShowCPE();
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
   * Get exposed devices data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getExposedDevices = (fromPage) => {
    const {baseUrl} = this.context;
    const {endpointsFilter, exposedDevicesSearch, exposedDevicesData, currentCpeKey} = this.state;
    const sort = exposedDevicesData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? exposedDevicesData.currentPage : 0;
    let url = `${baseUrl}/api/hmd/cpe/devices?page=${page + 1}&pageSize=${exposedDevicesData.pageSize}`;
    let requestData = {
      cpeKey: currentCpeKey
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

    if (endpointsFilter.departmentSelected.length > 0) {
      requestData.departmentArray = endpointsFilter.departmentSelected;
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
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get discovered vulnerability data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getDiscoveredVulnerability = (fromPage) => {
    const {baseUrl} = this.context;
    const {cveNameSearch, discoveredVulnerabilityData, currentCpeKey} = this.state;
    const sort = discoveredVulnerabilityData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? discoveredVulnerabilityData.currentPage : 0;
    const requestData = {
      cpeKey: currentCpeKey
    };
    let url = `${baseUrl}/api/hmd/cpe/cves?page=${page + 1}&pageSize=${discoveredVulnerabilityData.pageSize}`;

    if (discoveredVulnerabilityData.sort.field) {
      url += `&orders=${discoveredVulnerabilityData.sort.field} ${sort}`;
    }

    if (cveNameSearch.keyword) {
      requestData.cveId = cveNameSearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempCveNameSearch = {...cveNameSearch};
        let tempDiscoveredVulnerabilityData = {...discoveredVulnerabilityData};

        if (!data.rows || data.rows.length === 0) {
          tempCveNameSearch.count = 0;
          tempDiscoveredVulnerabilityData.dataContent = [];
          tempDiscoveredVulnerabilityData.totalCount = 0;

          this.setState({
            cveNameSearch: tempCveNameSearch,
            discoveredVulnerabilityData: tempDiscoveredVulnerabilityData
          });
          return null;
        }       

        tempDiscoveredVulnerabilityData.dataContent = data.rows;
        tempDiscoveredVulnerabilityData.totalCount = data.count;
        tempDiscoveredVulnerabilityData.currentPage = page;
        tempDiscoveredVulnerabilityData.dataFields = _.map(discoveredVulnerabilityData.dataFieldsArr, val => {
          return {
            name: val,
            label: f('hostDashboardFields.' + val),
            options: {
              filter: true,
              sort: true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempDiscoveredVulnerabilityData.dataContent[dataIndex];
                const value = tempDiscoveredVulnerabilityData.dataContent[dataIndex][val];

                if (val === 'severity' && value) {
                  const severityLevel = t('txt-' + value.toLowerCase());

                  return <span className='severity-level' style={{backgroundColor: ALERT_LEVEL_COLORS[severityLevel]}}>{severityLevel}</span>
                } else {
                  return value;
                }
              }
            }
          };
        });

        tempCveNameSearch.count = helper.numberWithCommas(data.count);

        this.setState({
          cveNameSearch: tempCveNameSearch,
          discoveredVulnerabilityData: tempDiscoveredVulnerabilityData
        });
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
      exportContextAnchor: null,
      tableContextAnchor: null
    });
  }
  /**
   * Get individual endpoint data
   * @method
   */
  getActiveEndpointInfo = () => {

  }
  /**
   * Toggle show memo
   * @method
   */
  toggleShowMemo = () => {
    this.setState({
      showMemoInfo: !this.state.showMemoInfo
    });

    this.handleCloseMenu();
  }
  /**
   * Toggle show CPE info
   * @method
   */
  toggleShowCPE = () => {
    this.setState({
      showCpeInfo: !this.state.showCpeInfo,
      activeCpeInfo: 'vulnerabilityDetails',
      exposedDevicesSearch: _.cloneDeep(EXPOSED_DEVICES_SEARCH),
      exposedDevicesData: _.cloneDeep(EXPOSED_DEVICES_DATA)
    });
  }
  /**
   * Toggle show CPE button
   * @method
   * @param {object} event - event object
   * @param {string} type - CPE button type ('vulnerabilityDetails', 'exposedDevices', or 'discoveredVulnerability')
   */
  toggleCpeButtons = (event, type) => {
    if (!type) {
      return;
    }
    
    this.setState({
      activeCpeInfo: type
    }, () => {
      const {activeCpeInfo} = this.state;

      if (activeCpeInfo === 'exposedDevices') {
        this.getExposedDevices();
      } else if (activeCpeInfo === 'discoveredVulnerability') {
        this.getDiscoveredVulnerability();
      }
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
   * Handle CVE name search
   * @method
   * @param {object} event - event object
   */
  handleCveNameChange = (event) => {
    let tempCveNameSearch = {...this.state.cveNameSearch};
    tempCveNameSearch.keyword = event.target.value;

    this.setState({
      cveNameSearch: tempCveNameSearch
    });
  }
  /**
   * Handle reset button
   * @method
   * @param {string} type - reset button type ('endpointsSearch', 'exposedDevices' or 'cveNameSearch')
   */
  handleResetBtn = (type, event) => {
    const {endpointsSearch, cveNameSearch} = this.state;

    if (type === 'endpointsSearch') {
      let tempEndpointsSearch = {...endpointsSearch};
      tempEndpointsSearch.keyword = '';

      this.setState({
        endpointsSearch: tempEndpointsSearch
      });
    } else if (type === 'exposedDevices') {
      this.setState({
        exposedDevicesSearch: _.cloneDeep(EXPOSED_DEVICES_SEARCH)
      });
    } else if (type === 'cveNameSearch') {
      let tempCveNameSearch = {...cveNameSearch};
      tempCveNameSearch.keyword = '';

      this.setState({
        cveNameSearch: tempCveNameSearch
      });
    }
  }
  /**
   * Set memo data
   * @method
   * @param {array.<string>} memoData - memo data to be set
   */
  setMemoInput = (memoData) => {
    this.setState({
      memoData
    });
  }
  /**
   * Display memo content
   * @method
   * @returns HTML DOM
   */
  displayMemoInfo = () => {
    const defaultItemValue = {
      input: ''
    };

    return (
      <MultiInput
        base={MemoInput}
        defaultItemValue={defaultItemValue}
        value={this.state.memoData}
        onChange={this.setMemoInput} />
    )
  }
  /**
   * Show memo dialog
   * @method
   * @returns ModalDialog component
   */
  showMemoDialog = () => {
    const {currentHostId} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleShowMemo},
      confirm: {text: t('txt-confirm'), handler: this.handleMemoConfirm}
    };

    return (
      <ModalDialog
        id='showMemoDialog'
        className='modal-dialog'
        title={t('txt-memo')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayMemoInfo()}
      </ModalDialog>
    )
  }
  /**
   * Handle memo confirm
   * @method
   */
  handleMemoConfirm = () => {
    const {baseUrl} = this.context;
    const {memoData, currentHostId} = this.state;
    const url = `${baseUrl}/api/hmd/endPoint/memos`;
    const requestData = {
      hostId: currentHostId,
      memos: _.map(memoData, val => {
        return val.input;
      })
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.getEndpointsData();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.toggleShowMemo();
  }
  /**
   * Display CPE info content
   * @method
   * @returns HTML DOM
   */
  displayCpeInfo = () => {
    const {cveNameSearch, activeCpeInfo, exposedDevicesSearch, exposedDevicesData, discoveredVulnerabilityData, currentCpeData} = this.state;
    const tableOptionsExposedDevices = {
      tableBodyHeight: '550px',
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
    const tableOptionsDiscoveredVulnerability = {
      tableBodyHeight: '550px',
      onChangePage: (currentPage) => {
        this.handlePaginationChange('discoveredVulnerability', 'currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('discoveredVulnerability', 'pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort('discoveredVulnerability', changedColumn, direction === 'desc');
      }
    };

    return (
      <div>
        <ToggleButtonGroup
          id='activeCpeInfoButtons'
          value={activeCpeInfo}
          exclusive
          onChange={this.toggleCpeButtons}>
          <ToggleButton id='hostDialogVulnerabilityDetails' value='vulnerabilityDetails' data-cy='hostInfoDialogDetailsBtn'>{t('host.vulnerabilities.txt-vulnerabilityDetails')}</ToggleButton>
          <ToggleButton id='hostDialogExposedDevices' value='exposedDevices' data-cy='hostInfoDialogDeviceBtn'>{t('host.vulnerabilities.txt-exposedDevices')}</ToggleButton>
          <ToggleButton id='hostDialogDiscoveredVulnerability' value='discoveredVulnerability' data-cy='hostInfoDialogVulnerabilityBtn'>{t('host.inventory.txt-discoveredVulnerability')}</ToggleButton>
        </ToggleButtonGroup>

        <div className='main-content'>
          {activeCpeInfo === 'vulnerabilityDetails' &&
            <GeneralDialog
              page='inventory'
              type='general-info'
              data={currentCpeData} />
          }

          {activeCpeInfo === 'exposedDevices' &&
            <GeneralDialog
              page='inventory'
              type='exposed-devices'
              search={exposedDevicesSearch}
              data={exposedDevicesData}
              tableOptions={tableOptionsExposedDevices}
              handleSearchChange={this.handleDevicesSearchChange}
              handleSearchSubmit={this.getExposedDevices}
              handleResetBtn={this.handleResetBtn} />
          }

          {activeCpeInfo === 'discoveredVulnerability' &&
            <GeneralDialog
              page='inventory'
              type='general-list'
              searchType='cveNameSearch'
              search={cveNameSearch}
              data={discoveredVulnerabilityData}
              tableOptions={tableOptionsDiscoveredVulnerability}
              handleSearchChange={this.handleCveNameChange}
              handleSearchSubmit={this.getDiscoveredVulnerability}
              handleResetBtn={this.handleResetBtn} />
          }
        </div>
      </div>
    )
  }
  /**
   * Show CPE info dialog
   * @method
   * @returns ModalDialog component
   */
  showCpeDialog = () => {
    const {currentCpeData} = this.state;
    const actions = {
      cancel: {text: t('txt-close'), className: 'standard', handler: this.toggleShowCPE}
    };

    return (
      <ModalDialog
        id='showCpeDialog'
        className='modal-dialog'
        title={currentCpeData.product}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayCpeInfo()}
      </ModalDialog>
    )
  }
  /**
   * Handle table sort
   * @method
   * @param {string} tableType - table type ('endpoints', 'exposedDevices' or 'discoveredVulnerability')
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (tableType, field, sort) => {
    const {endpointsData, exposedDevicesData, discoveredVulnerabilityData} = this.state;
    let tempEndpointsData = {...endpointsData};
    let tempExposedDevicesData = {...exposedDevicesData};
    let tempDiscoveredVulnerabilityData = {...discoveredVulnerabilityData};
    let tableField = field;

    if (tableType === 'endpoints') {
      tempEndpointsData.sort.field = tableField;
      tempEndpointsData.sort.desc = sort;

      this.setState({
        endpointsData: tempEndpointsData
      }, () => {
        this.getEndpointsData();
      });
    } else if (tableType === 'exposedDevices') {
      tempExposedDevicesData.sort.field = tableField;
      tempExposedDevicesData.sort.desc = sort;

      this.setState({
        exposedDevicesData: tempExposedDevicesData
      }, () => {
        this.getExposedDevices();
      });
    } else if (tableType === 'discoveredVulnerability') {
      tempDiscoveredVulnerabilityData.sort.field = tableField;
      tempDiscoveredVulnerabilityData.sort.desc = sort;

      this.setState({
        discoveredVulnerabilityData: tempDiscoveredVulnerabilityData
      }, () => {
        this.getDiscoveredVulnerability();
      });
    }
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} tableType - table type ('endpoints', 'exposedDevices' or 'discoveredVulnerability')
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (tableType, type, value) => {
    const {endpointsData, exposedDevicesData, discoveredVulnerabilityData} = this.state;
    let tempEndpointsData = {...endpointsData};
    let tempExposedDevicesData = {...exposedDevicesData};
    let tempDiscoveredVulnerabilityData = {...discoveredVulnerabilityData};

    if (tableType === 'endpoints') {
      tempEndpointsData[type] = value;

      this.setState({
        endpointsData: tempEndpointsData
      }, () => {
        this.getEndpointsData(type);
      });
    } else if (tableType === 'exposedDevices') {
      tempExposedDevicesData[type] = value;

      this.setState({
        exposedDevicesData: tempExposedDevicesData
      }, () => {
        this.getExposedDevices(type);
      });
    } else if (tableType === 'discoveredVulnerability') {
      tempDiscoveredVulnerabilityData[type] = value;

      this.setState({
        discoveredVulnerabilityData: tempDiscoveredVulnerabilityData
      }, () => {
        this.getDiscoveredVulnerability(type);
      });
    }
  }
  /**
   * Handle CPE search search
   * @method
   * @param {object} event - event object
   */
  handleCpeChange = (event) => {
    let tempEndpointsSearch = {...this.state.endpointsSearch};
    tempEndpointsSearch.keyword = event.target.value;

    this.setState({
      endpointsSearch: tempEndpointsSearch
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
        endpointsFilter: filterData.filter,
        endpointsFilterList: filterData.itemFilterList
      }, () => {
        if (type === 'confirm') {
          this.getEndpointsData();
        }
      });
    }

    this.setState({
      showFilterQuery: !this.state.showFilterQuery
    });
  }
  /**
   * Toggle CSV import dialog on/off
   * @method
   */
  toggleCsvImport = () => {
    this.setState({
      importDialogOpen : !this.state.importDialogOpen
    });
  }
  /**
   * Set filter data
   * @method
   * @param {string} type - filter type
   * @param {array.<string>} data - filter data
   */
  setFilterSearch = (type, data) => {
    const {endpointsFilter, endpointsFilterList} = this.state;
    let tempEndpointsFilter = {...endpointsFilter};
    let tempEndpointsFilterList = {...endpointsFilterList};
    let dataList = [];
    tempEndpointsFilter[type] = data;

    _.forEach(data, val => {
      let value = val.input;

      if (value) {
        dataList.push(value);
      }
    })

    tempEndpointsFilterList[type] = dataList;

    this.setState({
      endpointsFilter: tempEndpointsFilter,
      endpointsFilterList: tempEndpointsFilterList
    });
  }
  /**
   * Handle CSV import confirm
   * @method
   * @param {array.<array>} csvData - upload CSV data
   * @param {string} [scanScore] - safety scan score
   */
  confirmCsvImport = (csvData, scanScore) => {
    const {baseUrl} = this.context;

    if (!csvData) {
      this.toggleCsvImport();
      return;
    }

    let formData = new FormData();
    formData.append('file', csvData);
    formData.append('score', scanScore);

    this.ah.one({
      url: `${baseUrl}/api/hmd/uploadNistCpe`,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data) {
        const formattedData = _.map(data, val => ({ input: val }));

        this.setFilterSearch('cpe23uri', formattedData);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.toggleCsvImport();
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
   * Export endpoints list
   * @method
   */
  exportEndpointsList = () => {
    const {baseUrl, contextRoot} = this.context;
    const {endpointsData} = this.state;
    const sort = endpointsData.sort.desc ? 'desc' : 'asc';
    let url = `${baseUrl}${contextRoot}/api/hmd/endPoint/_export`;
    let requestData = {
      ...this.getEndpointsFilterRequestData()
    };
    let exportFields = {};
    let fieldsList = _.cloneDeep(endpointsData.dataFieldsArr);
    fieldsList.shift();

    _.forEach(fieldsList, val => {
      exportFields[val] = f('hostEndpointsFields.' + val);
    })

    if (endpointsData.sort.field) {
      url += `?orders=${endpointsData.sort.field} ${sort}`;
    }

    requestData.exportFields = exportFields;

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  /**
   * Toggle report modal dialog on/off
   * @method
   */
  toggleReport = () => {
    this.setState({
      reportOpen: !this.state.reportOpen,
      uploadedCPE: false
    });
  }
  /**
   * Handle report list confirm
   * @method
   * @param {object} hmdVansConfigurations - HMD vans config data
   */
  confirmReportList = (hmdVansConfigurations) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/hmd/cpeUpdateToDate/_report`;
    const requestData = {
      ...this.getEndpointsFilterRequestData(),
      hmdVansConfigurations: {
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
   * Toggle CPE file upload dialog on/off
   * @method
   * @param {boolean} data - true
   */
  toggleCpeUploadFile = (data) => {
    this.setState({
      uploadCpeFileOpen: !this.state.uploadCpeFileOpen,
      uploadedCPE: data === true
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
      severityType,
      connectionStatus,
      importDialogOpen,
      endpointsSearch,
      endpointsFilter,
      endpointsFilterList,
      showMemoInfo,
      showCpeInfo,
      exportContextAnchor,
      tableContextAnchor,
      showFilterQuery,
      reportOpen,
      uploadCpeFileOpen,
      uploadedCPE,
      endpointsData
    } = this.state;
    const tableOptions = {
      onChangePage: (currentPage) => {
        this.handlePaginationChange('endpoints', 'currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('endpoints', 'pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort('endpoints', changedColumn, direction === 'desc');
      }
    };

    return (
      <div>
        {showMemoInfo &&
          this.showMemoDialog()
        }

        {showCpeInfo &&
          this.showCpeDialog()
        }

        {showFilterQuery &&
          <FilterQuery
            page='endpoints'
            account={account}
            departmentList={departmentList}
            limitedDepartment={limitedDepartment}
            departmentNameMapping={departmentNameMapping}
            originalSystemList={originalSystemList}
            systemList={systemList}
            severityType={severityType}
            connectionStatus={connectionStatus}
            filterList={FILTER_LIST}
            originalFilter={ENDPOINTS_FILTER}
            filter={endpointsFilter}
            originalItemFilterList={ENDPOINTS_FILTER_LIST}
            itemFilterList={endpointsFilterList}
            toggleCsvImport={this.toggleCsvImport}
            toggleFilterQuery={this.toggleFilterQuery} />
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <HostMenu />
          </div>
        </div>

        <div className='data-content'>
          <div className='parent-content'>
            <div className='main-statistics main-content host'>
              <header className='main-header'>{t('host.txt-endpoints')}</header>
              <div className='sub-header'>Host running Gorilla HMD</div>
              <div className='statistics-content agent'>
                <div className='box'>
                  <header>Total Agent:</header>
                  <div>250</div>
                </div>
                <div className='box'>
                  <header>Online:</header>
                  <div>225</div>
                </div>
                <div className='box'>
                  <header>Offline:</header>
                  <div>220</div>
                </div>                
                <div className='box'>
                  <header>Inactivate Agent:</header>
                  <div>25</div>
                </div>
              </div>
            </div>

            <TableList
              page='endpoints'
              searchType='endpointsSearch'
              search={endpointsSearch}
              data={endpointsData}
              options={tableOptions}
              exportAnchor={exportContextAnchor}
              tableAnchor={tableContextAnchor}
              getData={this.getEndpointsData}
              getActiveData={this.getActiveEndpointInfo}
              toggleShowMemo={this.toggleShowMemo}
              exportList={this.exportEndpointsList}
              toggleReport={this.toggleReport}
              toggleFilterQuery={this.toggleFilterQuery}
              handleSearch={this.handleCpeChange}
              handleReset={this.handleResetBtn}
              handleExportMenu={this.handleExportOpenMenu}
              handleCloseMenu={this.handleCloseMenu} />
          </div>
        </div>
      </div>
    )
  }
}

HostEndPoints.contextType = BaseDataContext;

HostEndPoints.propTypes = {
};

export default HostEndPoints;