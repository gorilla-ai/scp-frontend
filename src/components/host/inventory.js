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
  dataFieldsArr: ['hostName', 'group', 'system', 'ip', 'relatedSoftware', 'daysOpen'],
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
      severityType: [],
      cpeSearch: _.cloneDeep(CPE_SEARCH),
      cpeFilter: _.cloneDeep(CPE_FILTER),
      cpeFilterList: _.cloneDeep(CPE_FILTER_LIST),
      hostNameSearch: {
        keyword: '',
        count: 0
      },
      popOverAnchor: null,
      activeFilter: '',
      showCveInfo: false,
      showFilterQuery: false,
      activeCveInfo: 'vulnerabilityDetails', //'vulnerabilityDetails', 'exposedDevices', or 'relatedSoftware'
      cpeData: {
        dataFieldsArr: ['_menu', 'product', 'system', 'vendor', 'version', 'vulnerabilityNum', 'exposedDevicesTotal'],
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
              sort: true,
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
      requestData.cveId = cpeSearch.keyword;
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
    const url = `${baseUrl}/api/hmd/cveUpdateToDate/cveInfo?cveId=${currentCpeKey}`;

    this.ah.one({
      url,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.setState({
          currentCpeData: data.cveInfo
        }, () => {
          this.toggleShowCVE();
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
      cveId: currentCpeKey
    };
    let url = `${baseUrl}/api/hmd/cve/devices?page=${page + 1}&pageSize=${exposedDevicesData.pageSize}`;
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

                if (val === 'relatedSoftware') {
                  return (
                    <div>
                      <span>{value[0]}</span>
                      {value.length > 1 &&
                        <span>, {value[1]}</span>
                      }
                      {value.length > 2 &&
                        <span title={this.getSoftwareList(value)}>, {t('txt-more')}...</span>
                      }
                    </div>
                  )
                } else {
                  return value;
                }
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
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null
    });
  }
  /**
   * Toggle show CVE info
   * @method
   */
  toggleShowCVE = () => {
    this.setState({
      showCveInfo: !this.state.showCveInfo,
      activeCveInfo: 'vulnerabilityDetails',
      hostNameSearch: {
        keyword: '',
        count: 0
      },
      exposedDevicesData: _.cloneDeep(EXPOSED_DEVICES_DATA)
    });
  }
  /**
   * Toggle show CVE button
   * @method
   * @param {object} event - event object
   * @param {string} type - CVE button type ('vulnerabilityDetails', 'exposedDevices', or 'relatedSoftware')
   */
  toggleCveButtons = (event, type) => {
    if (!type) {
      return;
    }
    
    this.setState({
      activeCveInfo: type
    }, () => {
      if (this.state.activeCveInfo === 'exposedDevices') {
        this.getExposedDevices();
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
   * Handle reset button for host name search
   * @method
   * @param {string} type - reset button type ('cpeSearch' or 'hostNameSearch')
   */
  handleResetBtn = (type, event) => {
    const {cpeSearch, hostNameSearch} = this.state;

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
    }
  }
  /**
   * Handle keyw down for search field
   * @method
   * @param {string} type - 'cpeSearch' or 'hostNameSearch'
   * @param {object} event - event object
   */
  handleKeyDown = (type, event) => {
    if (event.key === 'Enter') {
      if (type === 'cpeSearch') {
        this.getCpeData();
      } else if (type === 'hostNameSearch') {
        this.getExposedDevices();
      }
    }
  }
  /**
   * Display CVE info content
   * @method
   * @returns HTML DOM
   */
  displayCveInfo = () => {
    const {hostNameSearch, activeCveInfo, exposedDevicesData, currentCpeData} = this.state;
    const tableOptions = {
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

    return (
      <div>
        <ToggleButtonGroup
          id='activeCveInfoButtons'
          value={activeCveInfo}
          exclusive
          onChange={this.toggleCveButtons}>
          <ToggleButton id='vulnerabilityDetails' value='vulnerabilityDetails'>{t('host.dashboard.txt-vulnerabilityDetails')}</ToggleButton>
          <ToggleButton id='exposedDevices' value='exposedDevices'>{t('host.dashboard.txt-exposedDevices')}</ToggleButton>
          <ToggleButton id='relatedSoftware' value='relatedSoftware'>{t('host.dashboard.txt-relatedSoftware')}</ToggleButton>
        </ToggleButtonGroup>

        <div className='main-content'>
          {activeCveInfo === 'vulnerabilityDetails' &&
            <ul className='vulnerability'>
              <li><span>{t('host.dashboard.txt-vulnerabilityDesc')}</span>: {currentCpeData.description}</li>
              <li><span>{t('host.dashboard.txt-name')}</span>: {currentCpeData.cveId}</li>
              <li><span>{t('host.dashboard.txt-severity')}</span>: {t('txt-' + currentCpeData.severity.toLowerCase())}</li> 
              <li><span>CVSS</span>: {currentCpeData.cvss}</li>
              <li><span>{t('host.dashboard.txt-cvssVersion')}</span>: {currentCpeData.cvssVersion}</li>
              <li><span>{t('host.dashboard.txt-publishedDate')}</span>: {helper.getFormattedDate(currentCpeData.publishedDate, 'local')}</li>
              <li><span>{t('host.dashboard.txt-updatedDate')}</span>: {helper.getFormattedDate(currentCpeData.lastModifiedDate, 'local')}</li>
              <li><span>{t('host.dashboard.txt-daysOpen')}</span>: {currentCpeData.daysOpen}</li>
            </ul>
          }

          {activeCveInfo === 'exposedDevices' &&
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

                <div className='search-count'>{t('host.dashboard.txt-exposedDevicesCount') + ': ' + hostNameSearch.count}</div>
              </div>

              <MuiTableContent
                tableHeight='auto'
                data={exposedDevicesData}
                tableOptions={tableOptions} />
            </React.Fragment>
          }

          {activeCveInfo === 'relatedSoftware' &&
            <div>{t('host.dashboard.txt-relatedSoftware')}</div>
          }
        </div>
      </div>
    )
  }
  /**
   * Show CVE info dialog
   * @method
   * @returns ModalDialog component
   */
  showCveDialog = () => {
    const actions = {
      cancel: {text: t('txt-close'), handler: this.toggleShowCVE}
    };

    return (
      <ModalDialog
        id='showCveDialog'
        className='modal-dialog'
        title={this.state.currentCpeKey}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayCveInfo()}
      </ModalDialog>
    )
  }
  /**
   * Handle table sort
   * @method
   * @param {string} tableType - table type ('cve' or 'exposedDevices')
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (tableType, field, sort) => {
    const {cpeData, exposedDevicesData} = this.state;
    let tempCpeData = {...cpeData};
    let tempExposedDevicesData = {...exposedDevicesData};
    let tableField = field;

    if (tableType === 'cve') {
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
    }
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} tableType - table type ('cve' or 'exposedDevices')
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (tableType, type, value) => {
    const {cpeData, exposedDevicesData} = this.state;
    let tempCpeData = {...cpeData};
    let tempExposedDevicesData = {...exposedDevicesData};

    if (tableType === 'cve') {
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
    }
  }
  /**
   * Handle CVE search search
   * @method
   * @param {object} event - event object
   */
  handleCveChange = (event) => {
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
   * Export CVE list
   * @method
   */
  exportCveList = () => {
    const {baseUrl, contextRoot} = this.context;
    const {cpeData} = this.state;
    const url = `${baseUrl}${contextRoot}/api/hmd/cveUpdateToDate/_export`;
    let exportFields = {};
    let fieldsList = _.cloneDeep(this.state.cpeData.dataFieldsArr);
    fieldsList.shift();

    _.forEach(fieldsList, val => {
      exportFields[val] = f('hostDashboardFields.' + val);
    })

    const requestData = {
      ...this.getCpeFilterRequestData(),
      exportFields
    };

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {cpeSearch, showCveInfo, showFilterQuery, cpeData, contextAnchor} = this.state;
    const tableOptions = {
      onChangePage: (currentPage) => {
        this.handlePaginationChange('cve', 'currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('cve', 'pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort('cve', changedColumn, direction === 'desc');
      }
    };

    return (
      <div>
        {showCveInfo &&
          this.showCveDialog()
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
              <header className='main-header'>{t('host.dashboard.txt-vulnerabilityList')}</header>

              <div className='content-header-btns with-menu'>
                <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleFilterQuery}>{t('txt-filterQuery')}</Button>
                <Button variant='outlined' color='primary' className='standard btn' onClick={this.exportCveList}>{t('txt-export')}</Button>
              </div>

              <div className='actions-bar'>
                <div className='search-field'>
                  <TextField
                    name='cpeSearch'
                    className='search-text'
                    label={t('host.dashboard.txt-cveName')}
                    variant='outlined'
                    size='small'
                    value={cpeSearch.keyword}
                    onChange={this.handleCveChange}
                    onKeyDown={this.handleKeyDown.bind(this, 'cpeSearch')} />
                  <Button variant='contained' color='primary' className='search-btn' onClick={this.getCpeData}>{t('txt-search')}</Button>
                  {cpeSearch.keyword &&
                    <i class='c-link inline fg fg-close' onClick={this.handleResetBtn.bind(this, 'cpeSearch')}></i>
                  }
                  <div className='search-count'>{t('host.dashboard.txt-vulnerabilityCount') + ': ' + cpeSearch.count}</div>
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