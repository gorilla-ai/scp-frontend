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

const FILTER_LIST = ['departmentArray'];
const KBID_SEARCH = {
  keyword: '',
  count: 0
};
const KBID_FILTER = {
  departmentArray: []
};
const KBID_FILTER_LIST = {
  departmentArray: []
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
      departmentList: null,
      limitedDepartment: [],
      systemType: [],
      vendorType: [],
      kbidSearch: _.cloneDeep(KBID_SEARCH),
      kbidFilter: _.cloneDeep(KBID_FILTER),
      kbidFilterList: _.cloneDeep(KBID_FILTER_LIST),
      hostNameSearch: {
        keyword: '',
        count: 0
      },
      cveNameSearch: {
        keyword: '',
        count: 0
      },
      popOverAnchor: null,
      activeFilter: '', //same as FILTER_LIST
      showCpeInfo: false,
      showFilterQuery: false,
      activeCpeInfo: 'exposedDevices',
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

    this.getKbidData();
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
        this.setState({
          departmentList: data
        }, () => {
          if (account.limitedRole && account.departmentId) {
            this.setSelectedDepartment();
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
    const {account, kbidFilter} = this.state;
    let tempKbidFilter = {...kbidFilter};

    this.ah.one({
      url: `${baseUrl}/api/department/child/_set?id=${account.departmentId}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        tempKbidFilter.departmentArray = data;

        this.setState({
          kbidFilter: tempKbidFilter,
          limitedDepartment: data
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
    let tempKbidSearch = {...kbidSearch};

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
        let tempKbidData = {...kbidData};

        if (!data.rows || data.rows.length === 0) {
          tempKbidData.dataContent = [];
          tempKbidData.totalCount = 0;

          this.setState({
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
    const {kbidSearch} = this.state;
    let requestData = {};

    if (kbidSearch.keyword) {
      requestData.kbid = kbidSearch.keyword;
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
   * @param {string} type - reset button type ('kbidSearch', 'hostNameSearch' or 'cveNameSearch')
   */
  handleResetBtn = (type, event) => {
    const {kbidSearch, hostNameSearch, cveNameSearch} = this.state;

    if (type === 'kbidSearch') {
      let tempKbidSearch = {...kbidSearch};
      tempKbidSearch.keyword = '';

      this.setState({
        kbidSearch: tempKbidSearch
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
   * @param {string} type - 'kbidSearch', 'hostNameSearch' or 'cveNameSearch'
   * @param {object} event - event object
   */
  handleKeyDown = (type, event) => {
    if (event.key === 'Enter') {
      if (type === 'kbidSearch') {
        this.getKbidData();
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
    const {kbidData, exposedDevicesData, discoveredVulnerabilityData} = this.state;
    let tempKbidData = {...kbidData};
    let tempExposedDevicesData = {...exposedDevicesData};
    let tempDiscoveredVulnerabilityData = {...discoveredVulnerabilityData};
    let tableField = field;

    if (tableType === 'cpe') {
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
    const {kbidData, exposedDevicesData, discoveredVulnerabilityData} = this.state;
    let tempKbidData = {...kbidData};
    let tempExposedDevicesData = {...exposedDevicesData};
    let tempDiscoveredVulnerabilityData = {...discoveredVulnerabilityData};

    if (tableType === 'cpe') {
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
   * @param {string} options - option for 'confirm'
   */
  toggleFilterQuery = (options) => {
    if (options === 'confirm') {
      this.getKbidData();
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
    let tempCpeFilter = {...this.state.kbidFilter};
    tempCpeFilter[type] = value;

    this.setState({
      kbidFilter: tempCpeFilter
    });
  }
  /**
   * Set search filter data
   * @method
   * @param {string} type - filter type
   * @param {array.<string>} data - filter data
   */
  setSerchFilter = (type, data) => {
    const {kbidFilter, kbidFilterList} = this.state;
    let tempCpeFilter = {...kbidFilter};
    let tempCpeFilterList = {...kbidFilterList};
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
      kbidFilter: tempCpeFilter,
      kbidFilterList: tempCpeFilterList
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
   * Determine checkbox disabled status
   * @method
   * @param {string} id - department tree ID
   * @returns boolean true/false
   */
  checkboxDisabled = (id) => {
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
    let tempKbidFilter = {...this.state.kbidFilter};
    let departmentChildList = [];

    _.forEach(tree.children, val => {
      helper.floorPlanRecursive(val, obj => {
        departmentChildList.push(obj.id);
      });
    })

    tempKbidFilter.departmentArray = this.getSelectedItems(event.target.checked, 'departmentSelected', departmentChildList, tree.id);

    this.setState({
      kbidFilter: tempKbidFilter
    });
  }
  /**
   * Display department tree content
   * @method
   * @param {object} tree - department tree data
   * @returns HTML DOM
   */
  getDepartmentTreeLabel = (tree) => {
    return <span><Checkbox checked={_.includes(this.state.kbidFilter.departmentArray, tree.id)} onChange={this.toggleDepartmentCheckbox.bind(this, tree)} color='primary' disabled={this.checkboxDisabled(tree.id)} />{tree.name}</span>
  }
  /**
   * Display department tree item
   * @method
   * @param {object} val - department tree data
   * @param {number} i - index of the department tree data
   * @returns TreeItem component
   */
  getDepartmentTreeItem = (val, i) => {
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
    const {departmentList, popOverAnchor, activeFilter} = this.state;

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
            {!departmentList &&
              <div className='left-nav-group'><span className='loading no-padding'><i className='fg fg-loading-2'></i></span></div>
            }
            {departmentList && departmentList.length === 0 &&
              <div className='left-nav-group'><span>{t('txt-notFound')}</span></div>
            }
            {departmentList && departmentList.length > 0 &&
              <TreeView
                className='tree-view'
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}>
                {departmentList.map(this.getDepartmentTreeItem)}
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
    const {kbidData} = this.state;
    let url = '';
    let requestData = {
      ...this.getKbidFilterRequestData()
    };

    if (type === 'cpe') {
      let exportFields = {};
      let fieldsList = _.cloneDeep(kbidData.dataFieldsArr);
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
    const {kbidSearch, showCpeInfo, showFilterQuery, kbidData, tableContextAnchor, exportContextAnchor} = this.state;
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
              <header className='main-header'>{t('host.txt-kbid')}</header>

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
                    name='kbidSearch'
                    className='search-text'
                    label={t('host.txt-kbidName')}
                    variant='outlined'
                    size='small'
                    value={kbidSearch.keyword}
                    onChange={this.handleCpeChange}
                    onKeyDown={this.handleKeyDown.bind(this, 'kbidSearch')} />
                  <Button variant='contained' color='primary' className='search-btn' onClick={this.getKbidData}>{t('txt-search')}</Button>
                  {kbidSearch.keyword &&
                    <i class='c-link inline fg fg-close' onClick={this.handleResetBtn.bind(this, 'kbidSearch')}></i>
                  }
                  <div className='search-count'>{t('host.inventory.txt-softwareCount') + ': ' + helper.numberWithCommas(kbidSearch.count)}</div>
                </div>
              </div>

              <MuiTableContent
                data={kbidData}
                tableOptions={tableOptions} />
            </div>
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