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
import TextField from '@material-ui/core/TextField'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'

import BarChart from 'react-chart/build/src/components/bar'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PieChart from 'react-chart/build/src/components/pie'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SEVERITY_TYPE = ['HIGH', 'MEDIUM', 'LOW'];
const ALERT_LEVEL_COLORS = {
  HIGH: '#CC2943',
  MEDIUM: '#CC7B29',
  LOW: '#7ACC29'
};
const CVE_SEARCH = {
  cveId: '',
  cvss: '',
  relatedSoftware: '',
  severity: []
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

let t = null;
let f = null;

/**
 * Host Dashboard
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Host Dashboard page
 */
class HostDashboard extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      showFilter: false,
      cveSearch: _.cloneDeep(CVE_SEARCH),
      cveSeverityLevel: {
        data: null,
        count: 0
      },
      monthlySeverityTrend: null,
      showCveInfo: false,
      activeCveInfo: 'vulnerabilityDetails', //'vulnerabilityDetails', 'exposedDevices', or 'relatedSoftware'
      cveData: {
        dataFieldsArr: ['_menu', 'cveId', 'severity', 'cvss', 'relatedSoftware', 'daysOpen', 'exposedDevices'],
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
      currentCveId: '',
      currentCveData: {}
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'common', locale);
    helper.inactivityTime(baseUrl, locale);

    this.getCveSeverityData();
    this.getCveData();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get and set CVE chart data
   * @method
   */
  getCveSeverityData = () => {
    const {baseUrl} = this.context;

    //Pie Chart
    this.ah.one({
      url: `${baseUrl}/api/hmd/cveUpdateToDate/severityAgg`,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        this.setState({
          cveSeverityLevel: {
            data: this.formatPieChartData(data.severityAgg),
            count: data.total
          }
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    //Bar Chart
    this.ah.one({
      url: `${baseUrl}/api/hmd/cveUpdateToDate/year/severityAgg`,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        let monthlySeverityTrend = [];

        _.keys(data.severityAgg)
        .forEach(key => {
          _.keys(data.severityAgg[key])
          .forEach(key2 => {
            if (data.severityAgg[key][key2] >= 0) {
              monthlySeverityTrend.push({
                day: helper.getFormattedDate(key2, 'local'),
                count: data.severityAgg[key][key2],
                indicator: key.toUpperCase()
              })
            }
          })
        });

        this.setState({
          monthlySeverityTrend
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Format the object data into array type
   * @method
   * @param {object} data - chart data
   */
  formatPieChartData = (data) => {
    let cveSeverityLevel = [];

    _.keys(data)
    .forEach(key => {
      if (data[key] > 0) {
        cveSeverityLevel.push({
          key: key.toUpperCase(),
          doc_count: data[key]
        });
      }
    });

    return cveSeverityLevel;
  }
  /**
   * Show pie chart
   * @method
   * @param {array.<object>} cveSeverityLevel - CVE severity data
   * @returns HTML DOM
   */
  showPieChart = (cveSeverityLevel) => {
    const centerText = t('txt-total') + ': ' + this.state.cveSeverityLevel.count;

    return (
      <div className='chart-group'>
        {!cveSeverityLevel &&
          <div className='empty-data'>
            <header>{t('host.dashboard.txt-severityLevelQuery')}</header>
            <span><i className='fg fg-loading-2'></i></span>
          </div>
        }
        {cveSeverityLevel && cveSeverityLevel.length === 0 &&
          <div className='empty-data'>
            <header>{t('host.dashboard.txt-severityLevelQuery')}</header>
            <span>{t('txt-notFound')}</span>
          </div>
        }
        {cveSeverityLevel && cveSeverityLevel.length > 0 &&
          <PieChart
            title={t('host.dashboard.txt-severityLevelQuery')}
            holeSize={45}
            centerText={centerText}
            data={cveSeverityLevel}
            colors={{
              key: ALERT_LEVEL_COLORS
            }}
            keyLabels={{
              key: t('txt-severity'),
              doc_count: t('txt-count')
            }}
            valueLabels={{
              'Pie Chart': {
                key: t('txt-severity'),
                doc_count: t('txt-count')
              }
            }}
            dataCfg={{
              splitSlice: ['key'],
              sliceSize: 'doc_count'
            }} />
        }
      </div>
    )
  }
  /**
   * Show bar chart
   * @method
   * @param {array.<object>} monthlySeverityTrend - chart data
   * @returns HTML DOM
   */
  showBarChart = (monthlySeverityTrend) => {
    return (
      <div className='chart-group'>
        {!monthlySeverityTrend &&
          <div className='empty-data'>
            <header>{t('host.dashboard.txt-monthlySeverityTrend')}</header>
            <span><i className='fg fg-loading-2'></i></span>
          </div>
        }
        {monthlySeverityTrend && monthlySeverityTrend.length === 0 &&
          <div className='empty-data'>
            <header>{t('host.dashboard.txt-monthlySeverityTrend')}</header>
            <span>{t('txt-notFound')}</span>
          </div>
        }
        {monthlySeverityTrend && monthlySeverityTrend.length > 0 &&
          <BarChart
            stacked
            vertical
            title={t('host.dashboard.txt-monthlySeverityTrend')}
            legend={{
              enabled: true
            }}
            data={monthlySeverityTrend}
            colors={ALERT_LEVEL_COLORS}
            dataCfg={{
              x: 'day',
              y: 'count',
              splitSeries: 'indicator'
            }}
            xAxis={{
              type: 'datetime',
              units: [
                ['month', [1]]
              ]
            }}
            plotOptions={{
              series: {
                maxPointWidth: 20
              }
            }}
            tooltip={{
              formatter: this.onTooltip
            }} />
        }
      </div>
    )
  }
  /**
   * Show tooltip info when mouseover the chart
   * @method
   * @param {object} eventInfo - MouseoverEvents
   * @param {array.<object>} data - chart data
   * @returns HTML DOM
   */
  onTooltip = (eventInfo, data) => {
    return (
      <section>
        <span>{t('txt-severity')}: {data[0].indicator}<br /></span>
        <span>{t('txt-time')}: {moment(data[0].day).format('YYYY/MM/DD')}<br /></span>
        <span>{t('txt-count')}: {helper.numberWithCommas(data[0].count)}</span>
      </section>
    )
  }
  /**
   * Get and set ES table data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getCveData = (fromPage) => {
    const {baseUrl} = this.context;
    const {cveSearch, cveData} = this.state;
    const sort = cveData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? cveData.currentPage : 0;
    let url = `${baseUrl}/api/hmd/cveUpdateToDate/_search?page=${page + 1}&pageSize=${cveData.pageSize}`;
    let requestData = {};

    if (cveData.sort.field) {
      url += `&orders=${cveData.sort.field} ${sort}`;
    }

    if (cveSearch.keyword) {
      requestData.keyword = cveSearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempCveData = {...cveData};

        if (!data.rows || data.rows.length === 0) {
          tempCveData.dataContent = [];
          tempCveData.totalCount = 0;

          this.setState({
            cveData: tempCveData
          });
          return null;
        }       

        tempCveData.dataContent = data.rows;
        tempCveData.totalCount = data.count;
        tempCveData.currentPage = page;
        tempCveData.dataFields = _.map(cveData.dataFieldsArr, val => {
          return {
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : f('hostDashboardFields.' + val),
            options: {
              filter: true,
              sort: true,
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempCveData.dataContent[dataIndex];
                const value = tempCveData.dataContent[dataIndex][val];

                if (val === '_menu') {
                  return (
                    <div className='table-menu active'>
                      <Button variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue.cveId)}><i className='fg fg-more'></i></Button>
                    </div>
                  )
                } else if (val === 'severity' && value) {
                  return <span className='severity-level' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>
                } else {
                  return value;
                }
              }
            }
          };
        });

        this.setState({
          cveData: tempCveData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle open menu
   * @method
   * @param {object} id - active CVE ID
   * @param {object} event - event object
   */
  handleOpenMenu = (id, event) => {
    this.setState({
      contextAnchor: event.currentTarget,
      currentCveId: id
    });
  }
  /**
   * Get individual CVE data
   * @method
   */
  getActiveCveInfo = () => {
    const {baseUrl} = this.context;
    const {currentCveId} = this.state;
    const url = `${baseUrl}/api/hmd/cveUpdateToDate/cveInfo?cveId=${currentCveId}`;

    this.ah.one({
      url,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.setState({
          currentCveData: data.cveInfo
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
    return list.join(', ');
  }
  /**
   * Get exposed devices data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getExposedDevices = (fromPage) => {
    const {baseUrl} = this.context;
    const {exposedDevicesData, currentCveId} = this.state;
    const sort = exposedDevicesData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? exposedDevicesData.currentPage : 0;
    const requestData = {
      cveId: currentCveId
    };
    let url = `${baseUrl}/api/hmd/cve/devices?page=${page + 1}&pageSize=${exposedDevicesData.pageSize}`;

    if (exposedDevicesData.sort.field) {
      url += `&orders=${exposedDevicesData.sort.field} ${sort}`;
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
                        <span title={this.getSoftwareList(value)}>, more...</span>
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

        this.setState({
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
      exposedDevicesData: _.cloneDeep(EXPOSED_DEVICES_DATA)
    });
  }
  /**
   * Toggle show CVE button
   * @method
   * @param {object} event - event object
   * @param {string} type - 'vulnerabilityDetails', 'exposedDevices', or 'relatedSoftware'
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
   * Display new password content
   * @method
   * @returns HTML DOM
   */
  displayCveInfo = () => {
    const {activeCveInfo, exposedDevicesData, currentCveData} = this.state;
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
              <li><span>Vulnerability description</span>: {currentCveData.description}</li>
              <li><span>Name</span>: {currentCveData.cveId}</li>
              <li><span>Severity</span>: {currentCveData.severity}</li>
              <li><span>CVSS</span>: {currentCveData.cvss}</li>
              <li><span>CVSS Version</span>: {currentCveData.cvssVersion}</li>
              <li><span>Published on</span>: {helper.getFormattedDate(currentCveData.publishedDate, 'local')}</li>
              <li><span>Updatd on</span>: {helper.getFormattedDate(currentCveData.lastModifiedDate, 'local')}</li>
              <li><span>Days open</span>: {currentCveData.daysOpen}</li>
            </ul>
          }

          {activeCveInfo === 'exposedDevices' &&
            <MuiTableContent
              tableHeight='auto'
              data={exposedDevicesData}
              tableOptions={tableOptions} />
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
    const {currentCveId} = this.state;
    const actions = {
      cancel: {text: t('txt-close'), handler: this.toggleShowCVE}
    };
    const titleText = t('txt-resetPassword');

    return (
      <ModalDialog
        id='showCveDialog'
        className='modal-dialog'
        title={currentCveId}
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
    const {cveData, exposedDevicesData} = this.state;
    let tempCveData = {...cveData};
    let tempExposedDevicesData = {...exposedDevicesData};
    let tableField = field;

    if (tableType === 'cve') {
      tempCveData.sort.field = tableField;
      tempCveData.sort.desc = sort;

      this.setState({
        cveData: tempCveData
      }, () => {
        this.getCveData();
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
    const {cveData, exposedDevicesData} = this.state;
    let tempCveData = {...cveData};
    let tempExposedDevicesData = {...exposedDevicesData};

    if (tableType === 'cve') {
      tempCveData[type] = value;

      this.setState({
        cveData: tempCveData
      }, () => {
        this.getCveData(type);
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
   * Toggle filter content on/off
   * @method
   */
  toggleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter
    });
  }
  /**
   * Handle filter input data change
   * @method
   * @param {object} event - event object
   */
  handleCveSearch = (event) => {
    let tempCveSearch = {...this.state.cveSearch};
    tempCveSearch[event.target.name] = event.target.value;

    this.setState({
      cveSearch: tempCveSearch
    });
  }
  /**
   * Handle search submit
   * @method
   */
  handleSearchSubmit = () => {
    let tempCveData = {...this.state.cveData};
    tempCveData.dataContent = [];
    tempCveData.totalCount = 0;
    tempCveData.currentPage = 1;

    this.setState({
      cveData: tempCveData
    }, () => {
      this.getCveData();
    });
  }
  /**
   * Handle combo box change
   * @method
   * @param {object} event - event object
   * @param {array.<object>} value - selected input value
   */
  handleComboBoxChange = (event, value) => {
    let tempCveSearch = {...this.state.cveSearch};
    tempCveSearch.severity = value;

    this.setState({
      cveSearch: tempCveSearch
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, cveSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <TextField
              id='cveSearchId'
              name='cveId'
              label={f('hostDashboardFields.cveId')}
              variant='outlined'
              fullWidth
              size='small'
              value={cveSearch.cveId}
              onChange={this.handleCveSearch} />
          </div>
          <div className='group'>
            <TextField
              id='cveSearchCVSS'
              name='cvss'
              label={f('hostDashboardFields.cvss')}
              variant='outlined'
              fullWidth
              size='small'
              value={cveSearch.cvss}
              onChange={this.handleCveSearch} />
          </div>
          <div className='group'>
            <TextField
              id='cveSearchSoftware'
              name='relatedSoftware'
              label={f('hostDashboardFields.relatedSoftware')}
              variant='outlined'
              fullWidth
              size='small'
              value={cveSearch.relatedSoftware}
              onChange={this.handleCveSearch} />
          </div>
          <div className='group' style={{width: '300px'}}>
            <Autocomplete
              className='combo-box checkboxes-tags'
              multiple
              value={cveSearch.severity}
              options={_.map(SEVERITY_TYPE, (val) => { return { value: val } })}
              getOptionLabel={(option) => option.value}
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
                  {option.value}
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
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.handleSearchSubmit}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      cveSearch: _.cloneDeep(CVE_SEARCH)
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {showFilter, cveSeverityLevel, monthlySeverityTrend, showCveInfo, cveData, contextAnchor} = this.state;
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

        <Menu
          anchorEl={contextAnchor}
          keepMounted
          open={Boolean(contextAnchor)}
          onClose={this.handleCloseMenu}>
          <MenuItem id='activeCveView' onClick={this.getActiveCveInfo}>{t('txt-view')}</MenuItem>
        </Menu>

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button variant='outlined' color='primary'><Link to='/SCP/host'>{t('host.txt-hostList')}</Link></Button>
            <Button variant='contained' color='primary' className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')} disabled><i className='fg fg-filter'></i></Button>
          </div>
        </div>       

        <div className='data-content'>
          <div className='parent-content'>
            {this.renderFilter()}

            <div className='main-statistics host'>
              <div className='statistics-content'>
                {this.showPieChart(cveSeverityLevel.data)}
                {this.showBarChart(monthlySeverityTrend)}
              </div>
            </div>

            <div className='main-content'>
              <header className='main-header'>{t('host.dashboard.txt-vulnerabilityList')}</header>

              <div className='content-header-btns'>
              </div>

              <MuiTableContent
                data={cveData}
                tableOptions={tableOptions} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

HostDashboard.contextType = BaseDataContext;

HostDashboard.propTypes = {
};

export default HostDashboard;