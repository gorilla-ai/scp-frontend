import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment'
import cx from 'classnames'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import PopoverMaterial from '@material-ui/core/Popover'
import TextField from '@material-ui/core/TextField'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'

import BarChart from 'react-chart/build/src/components/bar'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PieChart from 'react-chart/build/src/components/pie'

import {downloadWithForm} from 'react-ui/build/src/utils/download'

import {BaseDataContext} from '../common/context'
import InventoryFilter from './inventory-filter'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SEVERITY_TYPE = ['critical', 'high', 'medium', 'low'];
const FILTER_LIST = ['cvss', 'daysOpen', 'exposedDevices'];
const CPE_SEARCH = {
  keyword: '',
  count: 0
};
const CPE_FILTER = {
  severity: [],
  cvss: [{
    condition: '=',
    input: ''
  }],
  daysOpen: [{
    condition: '=',
    input: ''
  }],
  exposedDevices: [{
    condition: '=',
    input: ''
  }]
};
const CPE_FILTER_LIST = {
  cvss: [],
  daysOpen: [],
  exposedDevices: []
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
      severityType: [],
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
      contextAnchor: null,
      currentCpeKey: '',
      currentCpeData: {}
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'common', locale);
    helper.inactivityTime(baseUrl, locale);

    this.setLocaleLabel();
    this.getSeverityType();
    this.getCpeData();
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
   * Get and set severity type
   * @method
   */
  getSeverityType = () => {
    const severityType = _.map(SEVERITY_TYPE, val => {
      return {
        value: val,
        text: t('txt-' + val)
      };
    });

    this.setState({
      severityType
    });
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
          tempCpeData.dataContent = [];
          tempCpeData.totalCount = 0;

          this.setState({
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
                } else if (val === 'exposedDevices') {
                  return value + ' / ' + allValue.exposedDevicesTotal;
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
    const unSortableFields = ['_menu'];

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

    if (cpeFilter.severity.length > 0) {
      const severityArray = _.map(cpeFilter.severity, val => {
        return val.value.toUpperCase();
      });

      requestData.severityArray = severityArray;
    }

    if (cpeFilterList.cvss.length > 0) {
      requestData.cvssArray = _.map(cpeFilterList.cvss, val => {
        const condition = val.substr(0, 1);
        const cvss = val.substr(2);

        return {
          mode: this.getConditionMode(condition),
          cvss
        }
      });
    }

    if (cpeFilterList.daysOpen.length > 0) {
      requestData.daysOpenArray = _.map(cpeFilterList.daysOpen, val => {
        const condition = val.substr(0, 1);
        const daysOpen = Number(val.substr(2));

        return {
          mode: this.getConditionMode(condition),
          daysOpen
        }
      });
    }

    if (cpeFilterList.exposedDevices.length > 0) {
      requestData.exposedDevicesArray = _.map(cpeFilterList.exposedDevices, val => {
        const condition = val.substr(0, 1);
        const exposedDevices = Number(val.substr(2));

        return {
          mode: this.getConditionMode(condition),
          exposedDevices
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
      contextAnchor: event.currentTarget,
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
    const {hostNameSearch, exposedDevicesData, currentCpeKey} = this.state;
    const sort = exposedDevicesData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? exposedDevicesData.currentPage : 0;
    const requestData = {
      cpeKey: currentCpeKey
    };
    let url = `${baseUrl}/api/hmd/cpe/devices?page=${page + 1}&pageSize=${exposedDevicesData.pageSize}`;
    let tempHostNameSearch = {...hostNameSearch};

    if (exposedDevicesData.sort.field) {
      url += `&orders=${exposedDevicesData.sort.field} ${sort}`;
    }

    if (hostNameSearch.keyword) {
      requestData.hostName = hostNameSearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempExposedDevicesData = {...exposedDevicesData};

        if (!data.rows || data.rows.length === 0) {
          tempExposedDevicesData.dataContent = [];
          tempExposedDevicesData.totalCount = 0;

          this.setState({
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
        let tempDiscoveredVulnerabilityData = {...discoveredVulnerabilityData};

        if (!data.rows || data.rows.length === 0) {
          tempDiscoveredVulnerabilityData.dataContent = [];
          tempDiscoveredVulnerabilityData.totalCount = 0;

          this.setState({
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
      contextAnchor: null
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
        title={currentCpeData.cpe23uri}
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
   * @param {object} event - event object
   * @param {array.<object>} value - selected input value
   */
  handleComboBoxChange = (event, value) => {
    let tempCveFilter = {...this.state.cpeFilter};
    tempCveFilter.severity = value;

    this.setState({
      cpeFilter: tempCveFilter
    });
  }
  /**
   * Set inventory filter data
   * @method
   * @param {string} type - filter type
   * @param {array.<string>} data - filter data
   */
  setInventoryFilter = (type, data) => {
    const {cpeFilter, cpeFilterList} = this.state;
    let tempCveFilter = {...cpeFilter};
    let tempCveFilterList = {...cpeFilterList};
    let dataList = [];
    tempCveFilter[type] = data;

    _.forEach(data, val => {
      let value = val.input;

      if (value) {
        value = val.condition + ' ' + value;
        dataList.push(value);
      }
    })

    tempCveFilterList[type] = dataList;

    this.setState({
      cpeFilter: tempCveFilter,
      cpeFilterList: tempCveFilterList
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
          label={f('hostDashboardFields.' + val)}
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
   * Display filter query content
   * @method
   * @returns HTML DOM
   */
  displayFilterQuery = () => {
    const {severityType, cpeFilter, popOverAnchor, activeFilter} = this.state;
    const defaultItemValue = {
      condition: '=',
      input: ''
    };
    const data = {
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
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}>
          <div className='content'>
            <React.Fragment>
              <MultiInput
                base={InventoryFilter}
                defaultItemValue={defaultItemValue}
                value={cpeFilter[activeFilter]}
                props={data}
                onChange={this.setInventoryFilter.bind(this, activeFilter)} />
            </React.Fragment>
          </div>
        </PopoverMaterial>

        <div className='group'>
          <Autocomplete
            className='combo-box'
            multiple
            value={cpeFilter.severity}
            options={severityType}
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
              <TextField {...params} label={f('hostDashboardFields.severity')} variant='outlined' size='small' />
            )}
            getOptionSelected={(option, value) => (
              option.value === value.value
            )}
            onChange={this.handleComboBoxChange} />
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
   * Export CPE list
   * @method
   */
  exportCpeList = () => {
    const {baseUrl, contextRoot} = this.context;
    const {cpeData} = this.state;
    const url = `${baseUrl}${contextRoot}/api/hmd/cpeUpdateToDate/_export`;
    let exportFields = {};
    let fieldsList = _.cloneDeep(this.state.cpeData.dataFieldsArr);
    fieldsList.shift();

    _.forEach(fieldsList, val => {
      exportFields[val] = f('hostCpeFields.' + val);
    })

    const requestData = {
      ...this.getCpeFilterRequestData(),
      exportFields
    };

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {cpeSearch, showCpeInfo, showFilterQuery, cpeData, contextAnchor} = this.state;
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
          anchorEl={contextAnchor}
          keepMounted
          open={Boolean(contextAnchor)}
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
                <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleFilterQuery}>{t('txt-filterQuery')}</Button>
                <Button variant='outlined' color='primary' className='standard btn' onClick={this.exportCpeList}>{t('txt-export')}</Button>
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