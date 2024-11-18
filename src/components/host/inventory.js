import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {downloadWithForm} from 'react-ui/build/src/utils/download'

import {BaseDataContext} from '../common/context'
import FilterQuery from './common/filter-query'
import GeneralDialog from './common/general-dialog'
import helper from '../common/helper'
import HostMenu from './common/host-menu'
import ImportFile from './import-file'
import ReportRecord from './common/report-record'
import TableList from './common/table-list'
import UploadFile from './common/upload-file'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

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
    name: 'vendor',
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
    name: 'vulnerabilityNum',
    displayType: 'text_field',
    filterType: 'multi_input',
    searchType: 'condition_input'
  },
  {
    name: 'cpe23uri',
    displayType: 'text_field',
    filterType: 'upload',
    searchType: 'input'
  }
];
const CPE_SEARCH = {
  keyword: '',
  count: 0
};
const CPE_FILTER = {
  departmentSelected: [],
  system: [],
  vendor: [],
  version: [{
    condition: '=',
    input: ''
  }],
  vulnerabilityNum: [{
    condition: '=',
    input: ''
  }],
  cpe23uri: [{
    input: ''
  }]
};
const CPE_FILTER_LIST = {
  departmentSelected: [],
  system: [],
  version: [],
  vulnerabilityNum: [],
  cpe23uri: []
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
const DISCOVERED_VULNERABILITY_SEARCH = {
  keyword: '',
  count: 0
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
 * Host Inventory
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Host Inventory page
 */
class HostInventory extends Component {
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
      vendorType: [],
      cpe23uriOperator: '',
      importDialogOpen: false,
      cpeSearch: _.cloneDeep(CPE_SEARCH),
      cpeFilter: _.cloneDeep(CPE_FILTER),
      cpeFilterList: _.cloneDeep(CPE_FILTER_LIST),
      exportContextAnchor: null,
      tableContextAnchor: null,
      showCpeInfo: false,
      showFilterQuery: false,
      reportOpen: false,
      uploadCpeFileOpen: false,
      uploadedCPE: false,
      activeCpeInfo: 'vulnerabilityDetails', //'vulnerabilityDetails', 'exposedDevices' or 'discoveredVulnerability'
      cpeData: {
        dataFieldsArr: ['_menu', 'product', 'vendor', 'version', 'system', 'riskValue', 'vulnerabilityNum', 'exposedDevices'],
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
      discoveredVulnerabilitySearch: _.cloneDeep(DISCOVERED_VULNERABILITY_SEARCH),
      discoveredVulnerabilityData: _.cloneDeep(DISCOVERED_VULNERABILITY_DATA),
      currentCpeKey: '',
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
      });
    }

    this.setLocaleLabel();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get and set locale label for charts
   * @method
   */
  setLocaleLabel = () => {
    const {locale} = this.context;

    if (locale === 'en') {
      ALERT_LEVEL_COLORS = {
        Critical: '#000',
        High: '#CC2943',
        Medium: '#CC7B29',
        Low: '#7ACC29'
      };
    } else if (locale === 'zh') {
      ALERT_LEVEL_COLORS = {
        嚴重: '#000',
        高: '#CC2943',
        中: '#CC7B29',
        低: '#7ACC29'
      };
    }
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
            this.getSystemVendorList();
            this.getCpeData();
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
    const {account, departmentNameMapping, cpeFilter, cpeFilterList} = this.state;
    let tempCpeFilter = {...cpeFilter};
    let temCpeFilterList = {...cpeFilterList};

    this.ah.one({
      url: `${baseUrl}/api/department/child/_set?id=${account.departmentId}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        tempCpeFilter.departmentSelected = data;
        temCpeFilterList.departmentSelected = _.map(data, val => {
          return departmentNameMapping[val];
        });

        this.setState({
          limitedDepartment: data,
          cpeFilter: tempCpeFilter,
          cpeFilterList: temCpeFilterList
        }, () => {
          this.getSystemVendorList();
          this.getCpeData();
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
   * Get and set system and vendor list
   * @method
   */
  getSystemVendorList = () => {
    const {baseUrl} = this.context;
    const {cpeFilter} = this.state;
    let requestData = {};

    if (cpeFilter.departmentSelected.length > 0) {
      requestData.departmentArray = cpeFilter.departmentSelected;
    }

    this.ah.one({
      url: `${baseUrl}/api/hmd/cpeUpdateToDate/group/filter`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        const vendorType = _.map(data.vendorGroup, val => {
          return {
            value: val,
            text: val
          };
        });

        this.setState({
          vendorType
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set CPE data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getCpeData = (fromPage) => {
    const {baseUrl} = this.context;
    const {cpeSearch, cpeData} = this.state;
    const sort = cpeData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? cpeData.currentPage : 0;
    const requestData = {
      ...this.getCpeFilterRequestData()
    };
    let url = `${baseUrl}/api/hmd/cpeUpdateToDate/_search?page=${page + 1}&pageSize=${cpeData.pageSize}`;

    if (cpeData.sort.field) {
      url += `&orders=${cpeData.sort.field} ${sort}`;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempCpeSearch = {...cpeSearch};
        let tempCpeData = {...cpeData};

        if (!data.rows || data.rows.length === 0) {
          tempCpeSearch.count = 0;
          tempCpeData.dataContent = [];
          tempCpeData.totalCount = 0;

          this.setState({
            cpeSearch: tempCpeSearch,
            cpeData: tempCpeData
          });
          return null;
        }       

        tempCpeData.dataContent = data.rows;
        tempCpeData.totalCount = data.count;
        tempCpeData.currentPage = page;
        tempCpeData.dataFields = _.map(cpeData.dataFieldsArr, val => {
          return {
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : f('hostCpeFields.' + val),
            options: {
              filter: true,
              sort: this.checkSortable(val),
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempCpeData.dataContent[dataIndex];
                const value = tempCpeData.dataContent[dataIndex][val];

                if (val === '_menu') {
                  return (
                    <div className='table-menu active'>
                      <Button className='host-open-table-menu' variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue.cpeKey)} data-cy='hostOpenTableMenuBtn'><i className='fg fg-more'></i></Button>
                    </div>
                  )
                } else if (val === 'system') {
                  return (
                    <div>
                      <span>{value[0]}</span>
                      {value.length > 1 &&
                        <span>, {value[1]}</span>
                      }
                      {value.length > 2 &&
                        <span title={this.getFullList(value)}>, {t('txt-more')}...</span>
                      }
                    </div>
                  )
                } else if (val === 'vulnerabilityNum') {
                  return helper.numberWithCommas(value);
                } else {
                  return value;
                }
              }
            }
          };
        });
        tempCpeSearch.count = helper.numberWithCommas(data.count);

        this.setState({
          cpeSearch: tempCpeSearch,
          cpeData: tempCpeData
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
    const unSortableFields = ['_menu', 'system', 'exposedDevices'];

    if (_.includes(unSortableFields, field)) {
      return false;
    } else {
      return true;
    }
  }
  /**
   * Get CPE filter request data
   * @method
   * @returns requestData object
   */
  getCpeFilterRequestData = () => {
    const {cpe23uriOperator, cpeSearch, cpeFilter, cpeFilterList} = this.state;
    let requestData = {};

    if (cpeSearch.keyword) {
      requestData.product = cpeSearch.keyword;
    }

    if (cpeFilter.departmentSelected.length > 0) {
      requestData.departmentArray = cpeFilter.departmentSelected;
    }

    if (cpeFilterList.system.length > 0) {
      const index = cpeFilterList.system.indexOf(t('host.txt-noSystemDetected'));
      let systemArray = _.cloneDeep(cpeFilterList.system);

      if (index > -1) {
        systemArray[index] = 'noExist';
      }

      requestData.systemArray = systemArray;
    }

    if (cpeFilter.vendor.length > 0) {
      const vendorArray = _.map(cpeFilter.vendor, val => {
        return val.value;
      });

      requestData.vendorArray = vendorArray;
    }

    if (cpeFilterList.version.length > 0) {
      requestData.versionArray = _.map(cpeFilterList.version, val => {
        return {
          mode: CONDITION_MODE[val.substr(0, 1)],
          version: val.substr(2)
        }
      });
    }

    if (cpeFilterList.vulnerabilityNum.length > 0) {
      requestData.vulnerabilityNumArray = _.map(cpeFilterList.vulnerabilityNum, val => {
        return {
          mode: CONDITION_MODE[val.substr(0, 1)],
          vulnerabilityNum: Number(val.substr(2))
        }
      });
    }

    if (cpeFilterList.cpe23uri && cpeFilterList.cpe23uri.length > 0) {
      requestData.cpe23uriArray = cpeFilterList.cpe23uri;
      requestData.cpe23uriOperator = cpe23uriOperator;
    }

    return requestData;
  }
  /**
   * Handle open menu
   * @method
   * @param {string} key - active CPE key
   * @param {object} event - event object
   */
  handleOpenMenu = (key, event) => {
    this.setState({
      tableContextAnchor: event.currentTarget,
      currentCpeKey: key
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
   * Get full list in CPE table
   * @method
   * @param {array.<string>} list - data list
   * @returns full list
   */
  getFullList = (list) => {
    list.shift();
    list.shift();
    return list.join(', ');
  }
  /**
   * Get exposed devices data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getExposedDevices = (fromPage) => {
    const {baseUrl} = this.context;
    const {cpeFilter, exposedDevicesSearch, exposedDevicesData, currentCpeKey} = this.state;
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

    if (cpeFilter.departmentSelected.length > 0) {
      requestData.departmentArray = cpeFilter.departmentSelected;
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
    const {discoveredVulnerabilitySearch, discoveredVulnerabilityData, currentCpeKey} = this.state;
    const sort = discoveredVulnerabilityData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? discoveredVulnerabilityData.currentPage : 0;
    const requestData = {
      cpeKey: currentCpeKey
    };
    let url = `${baseUrl}/api/hmd/cpe/cves?page=${page + 1}&pageSize=${discoveredVulnerabilityData.pageSize}`;

    if (discoveredVulnerabilityData.sort.field) {
      url += `&orders=${discoveredVulnerabilityData.sort.field} ${sort}`;
    }

    if (discoveredVulnerabilitySearch.keyword) {
      requestData.cveId = discoveredVulnerabilitySearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempCveNameSearch = {...discoveredVulnerabilitySearch};
        let tempDiscoveredVulnerabilityData = {...discoveredVulnerabilityData};

        if (!data.rows || data.rows.length === 0) {
          tempCveNameSearch.count = 0;
          tempDiscoveredVulnerabilityData.dataContent = [];
          tempDiscoveredVulnerabilityData.totalCount = 0;

          this.setState({
            discoveredVulnerabilitySearch: tempCveNameSearch,
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
          discoveredVulnerabilitySearch: tempCveNameSearch,
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
   * Toggle show CPE info
   * @method
   */
  toggleShowCPE = () => {
    this.setState({
      showCpeInfo: !this.state.showCpeInfo,
      activeCpeInfo: 'vulnerabilityDetails'
    }, () => {
      if (!this.state.showCpeInfo) {
        this.setState({
          exposedDevicesSearch: _.cloneDeep(EXPOSED_DEVICES_SEARCH),
          exposedDevicesData: _.cloneDeep(EXPOSED_DEVICES_DATA),
          discoveredVulnerabilitySearch: _.cloneDeep(DISCOVERED_VULNERABILITY_SEARCH),
          discoveredVulnerabilityData: _.cloneDeep(DISCOVERED_VULNERABILITY_DATA)
        });
      }
    });
  }
  /**
   * Toggle show CPE button
   * @method
   * @param {object} event - event object
   * @param {string} type - CPE button type ('vulnerabilityDetails', 'exposedDevices' or 'discoveredVulnerability')
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
   * Handle discovered vulnerability search change
   * @method
   * @param {object} event - event object
   */
  handleDiscoveredVulnerabilitySearchChange = (event) => {
    let tempDiscoveredVulnerabilitySearch = {...this.state.discoveredVulnerabilitySearch};
    tempDiscoveredVulnerabilitySearch[event.target.name] = event.target.value;

    this.setState({
      discoveredVulnerabilitySearch: tempDiscoveredVulnerabilitySearch
    });
  }
  /**
   * Handle reset button
   * @method
   * @param {string} type - reset button type ('cpeSearch', 'exposedDevices' or 'discoveredVulnerability')
   */
  handleResetBtn = (type) => {
    const {cpeSearch, exposedDevicesSearch, discoveredVulnerabilitySearch} = this.state;

    if (type === 'cpeSearch') {
      let tempCpeSearch = {...cpeSearch};
      tempCpeSearch.keyword = '';

      this.setState({
        cpeSearch: tempCpeSearch
      });
    } else if (type === 'exposedDevices') {
      let tempExposedDevicesSearch = {...exposedDevicesSearch};
      tempExposedDevicesSearch.hostName = '';
      tempExposedDevicesSearch.ip = '';
      tempExposedDevicesSearch.system = '';

      this.setState({
        exposedDevicesSearch: tempExposedDevicesSearch
      });
    } else if (type === 'discoveredVulnerability') {
      let tempDiscoveredVulnerabilitySearch = {...discoveredVulnerabilitySearch};
      tempDiscoveredVulnerabilitySearch.keyword = '';

      this.setState({
        discoveredVulnerabilitySearch: tempDiscoveredVulnerabilitySearch
      });
    }
  }
  /**
   * Display CPE info content
   * @method
   * @returns HTML DOM
   */
  displayCpeInfo = () => {
    const {
      activeCpeInfo,
      exposedDevicesSearch,
      exposedDevicesData,
      discoveredVulnerabilitySearch,
      discoveredVulnerabilityData,
      currentCpeData
    } = this.state;
    const tableOptionsExposedDevices = {
      tableBodyHeight: 'calc(75vh - 240px)',
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
      tableBodyHeight: 'calc(75vh - 240px)',
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
              searchType={activeCpeInfo}
              search={discoveredVulnerabilitySearch}
              data={discoveredVulnerabilityData}
              tableOptions={tableOptionsDiscoveredVulnerability}
              handleSearchChange={this.handleDiscoveredVulnerabilitySearchChange}
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
      cancel: {text: t('txt-close'), handler: this.toggleShowCPE}
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
   * @param {string} tableType - table type ('cpe', 'exposedDevices' or 'discoveredVulnerability')
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (tableType, field, sort) => {
    const {cpeData, exposedDevicesData, discoveredVulnerabilityData} = this.state;
    let tempCpeData = {...cpeData};
    let tempExposedDevicesData = {...exposedDevicesData};
    let tempDiscoveredVulnerabilityData = {...discoveredVulnerabilityData};
    let tableField = field;

    if (tableType === 'cpe') {
      tempCpeData.sort.field = tableField;
      tempCpeData.sort.desc = sort;

      this.setState({
        cpeData: tempCpeData
      }, () => {
        this.getCpeData();
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
   * @param {string} tableType - table type ('cpe', 'exposedDevices' or 'discoveredVulnerability')
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (tableType, type, value) => {
    const {cpeData, exposedDevicesData, discoveredVulnerabilityData} = this.state;
    let tempCpeData = {...cpeData};
    let tempExposedDevicesData = {...exposedDevicesData};
    let tempDiscoveredVulnerabilityData = {...discoveredVulnerabilityData};

    if (tableType === 'cpe') {
      tempCpeData[type] = value;

      this.setState({
        cpeData: tempCpeData
      }, () => {
        this.getCpeData(type);
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
    let tempCpeSearch = {...this.state.cpeSearch};
    tempCpeSearch[event.target.name] = event.target.value;

    this.setState({
      cpeSearch: tempCpeSearch
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
        cpe23uriOperator: filterData.cpe23uriOperator,
        cpeFilter: filterData.filter,
        cpeFilterList: filterData.itemFilterList
      }, () => {
        if (type === 'confirm') {
          this.getCpeData();
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
    const {cpeFilter, cpeFilterList} = this.state;
    let tempCpeFilter = {...cpeFilter};
    let tempCpeFilterList = {...cpeFilterList};
    let dataList = [];
    tempCpeFilter[type] = data;

    _.forEach(data, val => {
      let value = val.input;

      if (value) {
        dataList.push(value);
      }
    })

    tempCpeFilterList[type] = dataList;

    this.setState({
      cpeFilter: tempCpeFilter,
      cpeFilterList: tempCpeFilterList
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
   * Export CPE list
   * @method
   * @param {string} type - export type ('cpe' or 'nccst')
   */
  exportCpeList = (type) => {
    const {baseUrl, contextRoot} = this.context;
    const {cpeData} = this.state;
    const sort = cpeData.sort.desc ? 'desc' : 'asc';
    let url = '';
    let requestData = {
      ...this.getCpeFilterRequestData()
    };

    if (type === 'cpe') {
      let exportFields = {};
      let fieldsList = _.cloneDeep(cpeData.dataFieldsArr);
      fieldsList.shift();

      _.forEach(fieldsList, val => {
        exportFields[val] = f('hostCpeFields.' + val);
      })

      url = `${baseUrl}${contextRoot}/api/hmd/cpeUpdateToDate/_export`;

      if (cpeData.sort.field) {
        url += `?orders=${cpeData.sort.field} ${sort}`;
      }

      requestData.exportFields = exportFields;
    } else if (type === 'nccst') {
      url = `${baseUrl}${contextRoot}/api/hmd/cpeUpdateToDate/nccst/_export`;
    }

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
      ...this.getCpeFilterRequestData(),
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
      vendorType,
      importDialogOpen,
      cpeSearch,
      cpeFilter,
      cpeFilterList,
      showCpeInfo,
      exportContextAnchor,
      tableContextAnchor,
      showFilterQuery,
      reportOpen,
      uploadCpeFileOpen,
      uploadedCPE,
      cpeData
    } = this.state;
    const tableOptions = {
      onChangePage: (currentPage) => {
        this.handlePaginationChange('cpe', 'currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('cpe', 'pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort('cpe', changedColumn, direction === 'desc');
      }
    };

    return (
      <div>
        {showCpeInfo &&
          this.showCpeDialog()
        }

        {showFilterQuery &&
          <FilterQuery
            page='inventory'
            account={account}
            departmentList={departmentList}
            limitedDepartment={limitedDepartment}
            departmentNameMapping={departmentNameMapping}
            originalSystemList={originalSystemList}
            systemList={systemList}
            vendorType={vendorType}
            filterList={FILTER_LIST}
            originalFilter={CPE_FILTER}
            filter={cpeFilter}
            originalItemFilterList={CPE_FILTER_LIST}
            itemFilterList={cpeFilterList}
            toggleCsvImport={this.toggleCsvImport}
            toggleFilterQuery={this.toggleFilterQuery} />
        }

        {reportOpen &&
          <ReportRecord
            page='inventory'
            filter={cpeFilter}
            uploadedFile={uploadedCPE}
            toggleReport={this.toggleReport}
            toggleUploadFile={this.toggleCpeUploadFile}
            confirmReportList={this.confirmReportList} />
        }

        {uploadCpeFileOpen &&
          <UploadFile
            page='inventory'
            toggleUploadFile={this.toggleCpeUploadFile}
            getFilterRequestData={this.getCpeFilterRequestData} />
        }

        {importDialogOpen &&
          <ImportFile
            importFilterType='safetyScanInfo'
            toggleCsvImport={this.toggleCsvImport}
            confirmCsvImport={this.confirmCsvImport} />
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <HostMenu />
          </div>
        </div>

        <div className='data-content'>
          <div className='parent-content'>
            <TableList
              page='inventory'
              searchType='cpeSearch'
              search={cpeSearch}
              data={cpeData}
              options={tableOptions}
              exportAnchor={exportContextAnchor}
              tableAnchor={tableContextAnchor}
              getData={this.getCpeData}
              getActiveData={this.getActiveCpeInfo}
              exportList={this.exportCpeList}
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

HostInventory.contextType = BaseDataContext;

HostInventory.propTypes = {
};

export default HostInventory;