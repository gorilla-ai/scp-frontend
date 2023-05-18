import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import PopoverMaterial from '@material-ui/core/Popover'
import TextField from '@material-ui/core/TextField'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import TreeItem from '@material-ui/lab/TreeItem'
import TreeView from '@material-ui/lab/TreeView'

import BarChart from 'react-chart/build/src/components/bar'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PieChart from 'react-chart/build/src/components/pie'

import {downloadWithForm} from 'react-ui/build/src/utils/download'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'
import SearchFilter from './search-filter'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SEVERITY_TYPE = ['critical', 'high', 'medium', 'low'];
const FILTER_LIST = ['version', 'vulnerabilityNum'];
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
  }]
};
const CPE_FILTER_LIST = {
  departmentSelected: [],
  version: [],
  vulnerabilityNum: []
};
const EXPOSED_DEVICES_DATA = {
  dataFieldsArr: ['hostName', 'system', 'ip', 'daysOpen'],
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
const NOT_AVAILABLE = 'N/A';
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
      systemType: [],
      vendorType: [],
      departmentList: [],
      departmentNameMapping: {},
      limitedDepartment: [],
      cpeSearch: _.cloneDeep(CPE_SEARCH),
      cpeFilter: _.cloneDeep(CPE_FILTER),
      cpeFilterList: _.cloneDeep(CPE_FILTER_LIST),
      hostNameSearch: {
        keyword: '',
        count: 0
      },
      cveNameSearch: {
        keyword: '',
        count: 0
      },
      popOverAnchor: null,
      activeFilter: '',
      showCpeInfo: false,
      showFilterQuery: false,
      activeCpeInfo: 'vulnerabilityDetails', //'vulnerabilityDetails', 'exposedDevices', or 'discoveredVulnerability'
      cpeData: {
        dataFieldsArr: ['_menu', 'product', 'system', 'vendor', 'version', 'vulnerabilityNum', 'exposedDevices'],
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
      exposedDevicesData: _.cloneDeep(EXPOSED_DEVICES_DATA),
      discoveredVulnerabilityData: _.cloneDeep(DISCOVERED_VULNERABILITY_DATA),
      tableContextAnchor: null,
      exportContextAnchor: null,
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
        const systemType = _.map(data.systemGroup, val => {
          return {
            value: val,
            text: val
          };
        });

        const vendorType = _.map(data.vendorGroup, val => {
          return {
            value: val,
            text: val
          };
        });

        this.setState({
          systemType,
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
    let tempCpeSearch = {...cpeSearch};

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
                      <Button variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue.cpeKey)}><i className='fg fg-more'></i></Button>
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
   * Get condition text
   * @method
   * @returns text in string
   */
  getConditionMode = (val) => {
    if (val === '=') {
      return 'eq';
    } else if (val === '>') {
      return 'gt';
    } else if (val === '<') {
      return 'lt';
    }
  }
  /**
   * Get CPE filter request data
   * @method
   * @returns requestData object
   */
  getCpeFilterRequestData = () => {
    const {cpeSearch, cpeFilter, cpeFilterList} = this.state;
    let requestData = {};

    if (cpeSearch.keyword) {
      requestData.product = cpeSearch.keyword;
    }

    if (cpeFilter.system.length > 0) {
      const systemArray = _.map(cpeFilter.system, val => {
        return val.value;
      });

      requestData.systemArray = systemArray;
    }

    if (cpeFilter.vendor.length > 0) {
      const vendorArray = _.map(cpeFilter.vendor, val => {
        return val.value;
      });

      requestData.vendorArray = vendorArray;
    }

    if (cpeFilter.departmentSelected.length > 0) {
      requestData.departmentArray = cpeFilter.departmentSelected;
    }

    if (cpeFilterList.version.length > 0) {
      requestData.versionArray = _.map(cpeFilterList.version, val => {
        const condition = val.substr(0, 1);
        const version = val.substr(2);

        return {
          mode: this.getConditionMode(condition),
          version
        }
      });
    }

    if (cpeFilterList.vulnerabilityNum.length > 0) {
      requestData.vulnerabilityNumArray = _.map(cpeFilterList.vulnerabilityNum, val => {
        const condition = val.substr(0, 1);
        const vulnerabilityNum = Number(val.substr(2));

        return {
          mode: this.getConditionMode(condition),
          vulnerabilityNum
        }
      });
    }

    return requestData;
  }
  /**
   * Handle open menu
   * @method
   * @param {object} key - active CPE key
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
   * Get related software list
   * @method
   * @param {array.<string>} list - related software list
   * @returns list of software
   */
  getSoftwareList = (list) => {
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
    const {hostNameSearch, cpeFilter, exposedDevicesData, currentCpeKey} = this.state;
    const sort = exposedDevicesData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? exposedDevicesData.currentPage : 0;
    let url = `${baseUrl}/api/hmd/cpe/devices?page=${page + 1}&pageSize=${exposedDevicesData.pageSize}`;
    let requestData = {
      cpeKey: currentCpeKey
    };
    let tempHostNameSearch = {...hostNameSearch};
    let tempExposedDevicesData = {...exposedDevicesData};

    if (exposedDevicesData.sort.field) {
      url += `&orders=${exposedDevicesData.sort.field} ${sort}`;
    }

    if (hostNameSearch.keyword) {
      requestData.hostName = hostNameSearch.keyword;
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
        if (!data.rows || data.rows.length === 0) {
          tempHostNameSearch.count = 0;
          tempExposedDevicesData.dataContent = [];
          tempExposedDevicesData.totalCount = 0;

          this.setState({
            hostNameSearch: tempHostNameSearch,
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

        tempHostNameSearch.count = helper.numberWithCommas(data.count);

        this.setState({
          hostNameSearch: tempHostNameSearch,
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
    let tempCveNameSearch = {...cveNameSearch};
    let tempDiscoveredVulnerabilityData = {...discoveredVulnerabilityData};

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
      tableContextAnchor: null,
      exportContextAnchor: null
    });
  }
  /**
   * Toggle show CPE info
   * @method
   */
  toggleShowCPE = () => {
    this.setState({
      showCpeInfo: !this.state.showCpeInfo,
      activeCpeInfo: 'vulnerabilityDetails',
      hostNameSearch: {
        keyword: '',
        count: 0
      },
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
   * Handle host name search
   * @method
   * @param {object} event - event object
   */
  handleHostNameChange = (event) => {
    let tempHostNameSearch = {...this.state.hostNameSearch};
    tempHostNameSearch.keyword = event.target.value;

    this.setState({
      hostNameSearch: tempHostNameSearch
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
   * Handle reset button for host name search
   * @method
   * @param {string} type - reset button type ('cpeSearch', 'hostNameSearch' or 'cveNameSearch')
   */
  handleResetBtn = (type, event) => {
    const {cpeSearch, hostNameSearch, cveNameSearch} = this.state;

    if (type === 'cpeSearch') {
      let tempCpeSearch = {...cpeSearch};
      tempCpeSearch.keyword = '';

      this.setState({
        cpeSearch: tempCpeSearch
      });
    } else if (type === 'hostNameSearch') {
      let tempHostNameSearch = {...hostNameSearch};
      tempHostNameSearch.keyword = '';

      this.setState({
        hostNameSearch: tempHostNameSearch
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
   * Handle keyw down for search field
   * @method
   * @param {string} type - 'cpeSearch', 'hostNameSearch' or 'cveNameSearch'
   * @param {object} event - event object
   */
  handleKeyDown = (type, event) => {
    if (event.key === 'Enter') {
      if (type === 'cpeSearch') {
        this.getCpeData();
      } else if (type === 'hostNameSearch') {
        this.getExposedDevices();
      } else if (type === 'cveNameSearch') {
        this.getDiscoveredVulnerability();
      }
    }
  }
  /**
   * Display CPE info content
   * @method
   * @returns HTML DOM
   */
  displayCpeInfo = () => {
    const {hostNameSearch, cveNameSearch, activeCpeInfo, exposedDevicesData, discoveredVulnerabilityData, currentCpeData} = this.state;
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
          <ToggleButton id='vulnerabilityDetails' value='vulnerabilityDetails'>{t('host.dashboard.txt-vulnerabilityDetails')}</ToggleButton>
          <ToggleButton id='exposedDevices' value='exposedDevices'>{t('host.dashboard.txt-exposedDevices')}</ToggleButton>
          <ToggleButton id='discoveredVulnerability' value='discoveredVulnerability'>{t('host.inventory.txt-discoveredVulnerability')}</ToggleButton>
        </ToggleButtonGroup>

        <div className='main-content'>
          {activeCpeInfo === 'vulnerabilityDetails' &&
            <ul className='vulnerability'>
              <li className='header'><span>{t('host.inventory.txt-cpe23uri')}</span>: {currentCpeData.cpe23uri || NOT_AVAILABLE}</li>
              <li className='header'><span>{t('host.inventory.txt-cpeNameComponents')}</span></li>
              <li><span>{t('host.inventory.txt-edition')}</span>: {currentCpeData.edition || NOT_AVAILABLE}</li>
              <li><span>{t('host.inventory.txt-language')}</span>: {currentCpeData.language || NOT_AVAILABLE}</li>
              <li><span>{t('host.inventory.txt-other')}</span>: {currentCpeData.other || NOT_AVAILABLE}</li>
              <li><span>{t('host.inventory.txt-part')}</span>: {currentCpeData.part || NOT_AVAILABLE}</li>
              <li><span>{t('host.inventory.txt-product')}</span>: {currentCpeData.product || NOT_AVAILABLE}</li>
              <li><span>{t('host.inventory.txt-swEdition')}</span>: {currentCpeData.swEdition || NOT_AVAILABLE}</li>
              <li><span>{t('host.inventory.txt-targetHw')}</span>: {currentCpeData.targetHw || NOT_AVAILABLE}</li>
              <li><span>{t('host.inventory.txt-targetSw')}</span>: {currentCpeData.targetSw || NOT_AVAILABLE}</li>
              <li><span>{t('host.inventory.txt-update')}</span>: {currentCpeData.update || NOT_AVAILABLE}</li>
              <li><span>{t('host.inventory.txt-vendor')}</span>: {currentCpeData.vendor || NOT_AVAILABLE}</li>
              <li><span>{t('host.inventory.txt-version')}</span>: {currentCpeData.version || NOT_AVAILABLE}</li>
              <li className='header'><span>{t('host.inventory.txt-productCpename')}</span>: <span>{currentCpeData.productCpename}</span></li>
            </ul>
          }

          {activeCpeInfo === 'exposedDevices' &&
            <React.Fragment>
              <div className='search-field'>
                <TextField
                  name='hostNameSearch'
                  className='search-text'
                  label={t('host.dashboard.txt-hostName')}
                  variant='outlined'
                  size='small'
                  value={hostNameSearch.keyword}
                  onChange={this.handleHostNameChange}
                  onKeyDown={this.handleKeyDown.bind(this, 'hostNameSearch')} />
                <Button variant='contained' color='primary' className='search-btn' onClick={this.getExposedDevices}>{t('txt-search')}</Button>
                {hostNameSearch.keyword &&
                  <i class='c-link inline fg fg-close' onClick={this.handleResetBtn.bind(this, 'hostNameSearch')}></i>
                }

                <div className='search-count'>{t('host.dashboard.txt-exposedDevicesCount') + ': ' + helper.numberWithCommas(hostNameSearch.count)}</div>
              </div>

              <MuiTableContent
                tableHeight='auto'
                data={exposedDevicesData}
                tableOptions={tableOptionsExposedDevices} />
            </React.Fragment>
          }

          {activeCpeInfo === 'discoveredVulnerability' &&
            <React.Fragment>
              <div className='search-field'>
                <TextField
                  name='cveNameSearch'
                  className='search-text'
                  label={t('host.dashboard.txt-cveName')}
                  variant='outlined'
                  size='small'
                  value={cveNameSearch.keyword}
                  onChange={this.handleCveNameChange}
                  onKeyDown={this.handleKeyDown.bind(this, 'cveNameSearch')} />
                <Button variant='contained' color='primary' className='search-btn' onClick={this.getDiscoveredVulnerability}>{t('txt-search')}</Button>
                {cveNameSearch.keyword &&
                  <i class='c-link inline fg fg-close' onClick={this.handleResetBtn.bind(this, 'cveNameSearch')}></i>
                }

                <div className='search-count'>{t('host.inventory.txt-discoveredVulnerabilityCount') + ': ' + helper.numberWithCommas(cveNameSearch.count)}</div>
              </div>

              <MuiTableContent
                tableHeight='auto'
                data={discoveredVulnerabilityData}
                tableOptions={tableOptionsDiscoveredVulnerability} />
            </React.Fragment>
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
    tempCpeSearch.keyword = event.target.value;

    this.setState({
      cpeSearch: tempCpeSearch
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
   * @param {string} options - option for 'confirm'
   */
  toggleFilterQuery = (options) => {
    if (options === 'confirm') {
      this.getCpeData();
    }

    this.setState({
      showFilterQuery: !this.state.showFilterQuery,
    });
  }
  /**
   * Handle combo box change
   * @method
   * @param {string} type - combo box type ('system' or 'vendor')
   * @param {object} event - event object
   * @param {array.<object>} value - selected input value
   */
  handleComboBoxChange = (type, event, value) => {
    let tempCpeFilter = {...this.state.cpeFilter};
    tempCpeFilter[type] = value;

    this.setState({
      cpeFilter: tempCpeFilter
    });
  }
  /**
   * Set search filter data
   * @method
   * @param {string} type - filter type
   * @param {array.<string>} data - filter data
   */
  setSerchFilter = (type, data) => {
    const {cpeFilter, cpeFilterList} = this.state;
    let tempCpeFilter = {...cpeFilter};
    let tempCpeFilterList = {...cpeFilterList};
    let dataList = [];
    tempCpeFilter[type] = data;

    _.forEach(data, val => {
      let value = val.input;

      if (value) {
        value = val.condition + ' ' + value;
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
   * Display filter form
   * @method
   * @param {string} val - filter data
   * @param {number} i - index of the filter data
   * @returns HTML DOM
   */
  showFilterForm = (val, i) => {
    const value = this.state.cpeFilterList[val].join(', ');

    return (
      <div key={i} className='group'>
        <TextField
          name={val}
          label={f('hostCpeFields.' + val)}
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
    const {cpeFilter} = this.state;

    if (checked) {
      return _.concat(cpeFilter[type], ...list, id);
    } else {
      return _.without(cpeFilter[type], ...list, id);
    }
  }
  /**
   * Handle department checkbox check/uncheck
   * @method
   * @param {object} tree - department tree data
   * @param {object} event - event object
   */
  toggleDepartmentCheckbox = (tree, event) => {
    const {departmentNameMapping, cpeFilter, cpeFilterList} = this.state;
    let tempCpeFilter = {...cpeFilter};
    let tempCpeFilterList = {...cpeFilterList};
    let departmentChildList = [];

    _.forEach(tree.children, val => {
      helper.floorPlanRecursive(val, obj => {
        departmentChildList.push(obj.id);
      });
    })

    tempCpeFilter.departmentSelected = this.getSelectedItems(event.target.checked, 'departmentSelected', departmentChildList, tree.id);

    tempCpeFilterList.departmentSelected = _.map(tempCpeFilter.departmentSelected, val => {
      return departmentNameMapping[val];
    })

    this.setState({
      cpeFilter: tempCpeFilter,
      cpeFilterList: tempCpeFilterList
    });
  }
  /**
   * Display department tree content
   * @method
   * @param {object} tree - department tree data
   * @returns HTML DOM
   */
  getDepartmentTreeLabel = (tree) => {
    return <span><Checkbox checked={_.includes(this.state.cpeFilter.departmentSelected, tree.id)} onChange={this.toggleDepartmentCheckbox.bind(this, tree)} color='primary' />{tree.name}</span>
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
   * Display filter query content
   * @method
   * @returns HTML DOM
   */
  displayFilterQuery = () => {
    const {departmentList, systemType, vendorType, cpeFilter, cpeFilterList, popOverAnchor, activeFilter} = this.state;
    const defaultItemValue = {
      condition: '=',
      input: ''
    };
    const data = {
      pageType: 'inventory',
      activeFilter
    };

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
            {activeFilter !== 'departmentSelected' &&
              <MultiInput
                base={SearchFilter}
                defaultItemValue={defaultItemValue}
                value={cpeFilter[activeFilter]}
                props={data}
                onChange={this.setSerchFilter.bind(this, activeFilter)} />
            }
          </div>
        </PopoverMaterial>

        <div className='group'>
          <TextField
            name='departmentSelected'
            label={f('hostCpeFields.departmentSelected')}
            variant='outlined'
            fullWidth
            size='small'
            value={cpeFilterList.departmentSelected.join(', ')}
            onClick={this.handleFilterclick.bind(this, 'departmentSelected')}
            InputProps={{
              readOnly: true
            }} />
        </div>
        <div className='group'>
          <Autocomplete
            className='combo-box'
            multiple
            value={cpeFilter.system}
            options={systemType}
            getOptionLabel={(option) => option.text}
            disableCloseOnSelect
            noOptionsText={t('txt-notFound')}
            openText={t('txt-on')}
            closeText={t('txt-off')}
            clearText={t('txt-clear')}
            renderOption={(option, { selected }) => (
              <React.Fragment>
                <Checkbox
                  color='primary'
                  icon={<CheckBoxOutlineBlankIcon />}
                  checkedIcon={<CheckBoxIcon />}
                  checked={selected} />
                {option.text}
              </React.Fragment>
            )}
            renderInput={(params) => (
              <TextField {...params} label={f('hostCpeFields.system')} variant='outlined' size='small' />
            )}
            getOptionSelected={(option, value) => (
              option.value === value.value
            )}
            onChange={this.handleComboBoxChange.bind(this, 'system')} />
        </div>

        <div className='group'>
          <Autocomplete
            className='combo-box'
            multiple
            value={cpeFilter.vendor}
            options={vendorType}
            getOptionLabel={(option) => option.text}
            disableCloseOnSelect
            noOptionsText={t('txt-notFound')}
            openText={t('txt-on')}
            closeText={t('txt-off')}
            clearText={t('txt-clear')}
            renderOption={(option, { selected }) => (
              <React.Fragment>
                <Checkbox
                  color='primary'
                  icon={<CheckBoxOutlineBlankIcon />}
                  checkedIcon={<CheckBoxIcon />}
                  checked={selected} />
                {option.text}
              </React.Fragment>
            )}
            renderInput={(params) => (
              <TextField {...params} label={f('hostCpeFields.vendor')} variant='outlined' size='small' />
            )}
            getOptionSelected={(option, value) => (
              option.value === value.value
            )}
            onChange={this.handleComboBoxChange.bind(this, 'vendor')} />
        </div>
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
      cpeFilter: _.cloneDeep(CPE_FILTER),
      cpeFilterList: _.cloneDeep(CPE_FILTER_LIST)
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
      requestData.exportFields = exportFields
    } else if (type === 'nccst') {
      url = `${baseUrl}${contextRoot}/api/hmd/cpeUpdateToDate/nccst/_export`;
    }

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
    this.handleCloseMenu();
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {cpeSearch, showCpeInfo, showFilterQuery, cpeData, tableContextAnchor, exportContextAnchor} = this.state;
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
          this.showFilterQueryDialog()
        }

        <Menu
          anchorEl={tableContextAnchor}
          keepMounted
          open={Boolean(tableContextAnchor)}
          onClose={this.handleCloseMenu}>
          <MenuItem id='activeCveView' onClick={this.getActiveCpeInfo}>{t('txt-view')}</MenuItem>
        </Menu>

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button variant='outlined' color='primary'><Link to='/SCP/host'>{t('host.txt-hostList')}</Link></Button>
          </div>
        </div>

        <div className='data-content'>
          <div className='parent-content'>
            <div className='main-statistics host'>

            </div>

            <div className='main-content'>
              <header className='main-header'>{t('host.inventory.txt-orgSoftwareList')}</header>

              <div className='content-header-btns with-menu'>
                <Menu
                  anchorEl={exportContextAnchor}
                  keepMounted
                  open={Boolean(exportContextAnchor)}
                  onClose={this.handleCloseMenu}>
                  <MenuItem onClick={this.exportCpeList.bind(this, 'cpe')}>{t('host.inventory.txt-inventoryList')}</MenuItem>
                  <MenuItem onClick={this.exportCpeList.bind(this, 'nccst')}>NCCST</MenuItem>
                </Menu>

                <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleFilterQuery}>{t('txt-filterQuery')}</Button>
                <Button variant='outlined' color='primary' className='standard btn' onClick={this.handleExportOpenMenu}>{t('txt-export')}</Button>
              </div>

              <div className='actions-bar'>
                <div className='search-field'>
                  <TextField
                    name='cpeSearch'
                    className='search-text'
                    label={t('host.inventory.txt-applicationName')}
                    variant='outlined'
                    size='small'
                    value={cpeSearch.keyword}
                    onChange={this.handleCpeChange}
                    onKeyDown={this.handleKeyDown.bind(this, 'cpeSearch')} />
                  <Button variant='contained' color='primary' className='search-btn' onClick={this.getCpeData}>{t('txt-search')}</Button>
                  {cpeSearch.keyword &&
                    <i class='c-link inline fg fg-close' onClick={this.handleResetBtn.bind(this, 'cpeSearch')}></i>
                  }
                  <div className='search-count'>{t('host.inventory.txt-softwareCount') + ': ' + helper.numberWithCommas(cpeSearch.count)}</div>
                </div>
              </div>

              <MuiTableContent
                data={cpeData}
                tableOptions={tableOptions} />
            </div>
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