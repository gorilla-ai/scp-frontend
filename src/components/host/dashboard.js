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
import DashboardFilter from './dashboard-filter'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SEVERITY_TYPE = ['critical', 'high', 'medium', 'low'];
const FILTER_LIST = ['cvss', 'daysOpen', 'exposedDevices'];
const CVE_SEARCH = {
  keyword: '',
  count: 0
};
const CVE_FILTER = {
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
const CVE_FILTER_LIST = {
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
const RELATED_SOFTWARE_DATA = {
  dataFieldsArr: ['product', 'system', 'version', 'exposedDevices'],
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
      severityType: [],
      cveSearch: _.cloneDeep(CVE_SEARCH),
      cveFilter: _.cloneDeep(CVE_FILTER),
      cveFilterList: _.cloneDeep(CVE_FILTER_LIST),
      hostNameSearch: {
        keyword: '',
        count: 0
      },
      productSearch: {
        keyword: '',
        count: 0
      },
      cveSeverityLevel: {
        data: null,
        count: 0
      },
      popOverAnchor: null,
      activeFilter: '',
      monthlySeverityTrend: null,
      showCveInfo: false,
      showFilterQuery: false,
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
      relatedSoftwareData: _.cloneDeep(RELATED_SOFTWARE_DATA),
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

    this.setLocaleLabel();
    this.getSeverityType();
    this.getCveSeverityData();
    this.getCveData();
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
            count: helper.numberWithCommas(data.total)
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
                indicator: t('txt-' + key)
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
          key: t('txt-' + key),
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
        <span>{t('txt-time')}: {moment(data[0].day).format('YYYY/MM')}<br /></span>
        <span>{t('txt-count')}: {helper.numberWithCommas(data[0].count)}</span>
      </section>
    )
  }
  /**
   * Get and set CVE data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getCveData = (fromPage) => {
    const {baseUrl} = this.context;
    const {cveSearch, cveData} = this.state;
    const sort = cveData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? cveData.currentPage : 0;
    const requestData = {
      ...this.getCveFilterRequestData()
    };
    let url = `${baseUrl}/api/hmd/cveUpdateToDate/_search?page=${page + 1}&pageSize=${cveData.pageSize}`;
    let tempCveSearch = {...cveSearch};

    if (cveData.sort.field) {
      url += `&orders=${cveData.sort.field} ${sort}`;
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
              sort: this.checkSortable(val),
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
                  const severityLevel = t('txt-' + value.toLowerCase());

                  return <span className='severity-level' style={{backgroundColor: ALERT_LEVEL_COLORS[severityLevel]}}>{severityLevel}</span>
                } else if (val === 'relatedSoftware') {
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
        tempCveSearch.count = helper.numberWithCommas(data.count);

        this.setState({
          cveSearch: tempCveSearch,
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
   * Get CVE filter request data
   * @method
   * @returns requestData object
   */
  getCveFilterRequestData = () => {
    const {cveSearch, cveFilter, cveFilterList} = this.state;
    let requestData = {};

    if (cveSearch.keyword) {
      requestData.cveId = cveSearch.keyword;
    }

    if (cveFilter.severity.length > 0) {
      const severityArray = _.map(cveFilter.severity, val => {
        return val.value.toUpperCase();
      });

      requestData.severityArray = severityArray;
    }

    if (cveFilterList.cvss.length > 0) {
      requestData.cvssArray = _.map(cveFilterList.cvss, val => {
        const condition = val.substr(0, 1);
        const cvss = val.substr(2);

        return {
          mode: this.getConditionMode(condition),
          cvss
        }
      });
    }

    if (cveFilterList.daysOpen.length > 0) {
      requestData.daysOpenArray = _.map(cveFilterList.daysOpen, val => {
        const condition = val.substr(0, 1);
        const daysOpen = Number(val.substr(2));

        return {
          mode: this.getConditionMode(condition),
          daysOpen
        }
      });
    }

    if (cveFilterList.exposedDevices.length > 0) {
      requestData.exposedDevicesArray = _.map(cveFilterList.exposedDevices, val => {
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
    const {hostNameSearch, exposedDevicesData, currentCveId} = this.state;
    const sort = exposedDevicesData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? exposedDevicesData.currentPage : 0;
    const requestData = {
      cveId: currentCveId
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
   * Get related software data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getRelatedSoftware = (fromPage) => {
    const {baseUrl} = this.context;
    const {productSearch, relatedSoftwareData, currentCveId} = this.state;
    const sort = relatedSoftwareData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? relatedSoftwareData.currentPage : 0;
    const requestData = {
      cveId: currentCveId
    };
    let url = `${baseUrl}/api/hmd/cve/relatedSoftware?page=${page + 1}&pageSize=${relatedSoftwareData.pageSize}`;
    let tempProductSearch = {...productSearch};

    if (relatedSoftwareData.sort.field) {
      url += `&orders=${relatedSoftwareData.sort.field} ${sort}`;
    }

    if (productSearch.keyword) {
      requestData.product = productSearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempExposedDevicesData = {...relatedSoftwareData};

        if (!data.rows || data.rows.length === 0) {
          tempExposedDevicesData.dataContent = [];
          tempExposedDevicesData.totalCount = 0;

          this.setState({
            relatedSoftwareData: tempExposedDevicesData
          });
          return null;
        }       

        tempExposedDevicesData.dataContent = data.rows;
        tempExposedDevicesData.totalCount = data.count;
        tempExposedDevicesData.currentPage = page;
        tempExposedDevicesData.dataFields = _.map(relatedSoftwareData.dataFieldsArr, val => {
          return {
            name: val,
            label: f('hostDashboardFields.' + val),
            options: {
              filter: true,
              sort: true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempExposedDevicesData.dataContent[dataIndex];
                const value = tempExposedDevicesData.dataContent[dataIndex][val];

                if (val === 'exposedDevices') {
                  const exposedDevices = value + ' / ' + allValue.exposedDevicesTotal;

                  return exposedDevices;
                } else {
                  return value;
                }
              }
            }
          };
        });

        tempProductSearch.count = helper.numberWithCommas(data.count);

        this.setState({
          productSearch: tempProductSearch,
          relatedSoftwareData: tempExposedDevicesData
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
      const {activeCveInfo} = this.state;

      if (activeCveInfo === 'exposedDevices') {
        this.getExposedDevices();
      } else if (activeCveInfo === 'relatedSoftware') {
        this.getRelatedSoftware();
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
   * Handle product search
   * @method
   * @param {object} event - event object
   */
  handleProductChange = (event) => {
    let tempProductSearch = {...this.state.productSearch};
    tempProductSearch.keyword = event.target.value;

    this.setState({
      productSearch: tempProductSearch
    });
  }
  /**
   * Handle reset button for host name search
   * @method
   * @param {string} type - reset button type ('cveSearch', 'hostNameSearch' or 'productSearch')
   */
  handleResetBtn = (type, event) => {
    const {cveSearch, hostNameSearch, productSearch} = this.state;

    if (type === 'cveSearch') {
      let tempCveSearch = {...cveSearch};
      tempCveSearch.keyword = '';

      this.setState({
        cveSearch: tempCveSearch
      });
    } else if (type === 'hostNameSearch') {
      let tempHostNameSearch = {...hostNameSearch};
      tempHostNameSearch.keyword = '';

      this.setState({
        hostNameSearch: tempHostNameSearch
      });
    } else if (type === 'productSearch') {
      let tempProductSearch = {...productSearch};
      tempProductSearch.keyword = '';

      this.setState({
        productSearch: tempProductSearch
      });
    }
  }
  /**
   * Handle keyw down for search field
   * @method
   * @param {string} type - 'cveSearch', 'hostNameSearch' or 'productSearch'
   * @param {object} event - event object
   */
  handleKeyDown = (type, event) => {
    if (event.key === 'Enter') {
      if (type === 'cveSearch') {
        this.getCveData();
      } else if (type === 'hostNameSearch') {
        this.getExposedDevices();
      } else if (type === 'productSearch') {
        this.getRelatedSoftware();
      }
    }
  }
  /**
   * Display CVE info content
   * @method
   * @returns HTML DOM
   */
  displayCveInfo = () => {
    const {hostNameSearch, productSearch, activeCveInfo, exposedDevicesData, relatedSoftwareData, currentCveData} = this.state;
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
    const tableOptionsRelatedSoftware = {
      tableBodyHeight: '550px',
      onChangePage: (currentPage) => {
        this.handlePaginationChange('relatedSoftware', 'currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('relatedSoftware', 'pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort('relatedSoftware', changedColumn, direction === 'desc');
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
              <li><span>{t('host.dashboard.txt-vulnerabilityDesc')}</span>: {currentCveData.description || NOT_AVAILABLE}</li>
              <li><span>{t('host.dashboard.txt-name')}</span>: {currentCveData.cveId || NOT_AVAILABLE}</li>
              <li><span>{t('host.dashboard.txt-severity')}</span>: {t('txt-' + currentCveData.severity.toLowerCase())}</li> 
              <li><span>CVSS</span>: {currentCveData.cvss || NOT_AVAILABLE}</li>
              <li><span>{t('host.dashboard.txt-cvssVersion')}</span>: {currentCveData.cvssVersion || NOT_AVAILABLE}</li>
              <li><span>{t('host.dashboard.txt-publishedDate')}</span>: {helper.getFormattedDate(currentCveData.publishedDate, 'local')}</li>
              <li><span>{t('host.dashboard.txt-updatedDate')}</span>: {helper.getFormattedDate(currentCveData.lastModifiedDate, 'local')}</li>
              <li><span>{t('host.dashboard.txt-daysOpen')}</span>: {currentCveData.daysOpen}</li>
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
                tableOptions={tableOptionsExposedDevices} />
            </React.Fragment>
          }

          {activeCveInfo === 'relatedSoftware' &&
            <React.Fragment>
              <div className='search-field'>
                <TextField
                  name='productSearch'
                  className='search-text'
                  label={t('host.inventory.txt-productName')}
                  variant='outlined'
                  size='small'
                  value={productSearch.keyword}
                  onChange={this.handleProductChange}
                  onKeyDown={this.handleKeyDown.bind(this, 'productSearch')} />
                <Button variant='contained' color='primary' className='search-btn' onClick={this.getRelatedSoftware}>{t('txt-search')}</Button>
                {productSearch.keyword &&
                  <i class='c-link inline fg fg-close' onClick={this.handleResetBtn.bind(this, 'productSearch')}></i>
                }

                <div className='search-count'>{t('host.dashboard.txt-relatedSoftwareCount') + ': ' + productSearch.count}</div>
              </div>

              <MuiTableContent
                tableHeight='auto'
                data={relatedSoftwareData}
                tableOptions={tableOptionsRelatedSoftware} />
            </React.Fragment>
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
        title={this.state.currentCveId}
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
   * @param {string} tableType - table type ('cve', 'exposedDevices' or 'relatedSoftware')
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (tableType, field, sort) => {
    const {cveData, exposedDevicesData, relatedSoftwareData} = this.state;
    let tempCveData = {...cveData};
    let tempExposedDevicesData = {...exposedDevicesData};
    let tempRelatedSoftwareData = {...relatedSoftwareData};
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
    } else if (tableType === 'relatedSoftware') {
      tempRelatedSoftwareData.sort.field = tableField;
      tempRelatedSoftwareData.sort.desc = sort;

      this.setState({
        relatedSoftwareData: tempRelatedSoftwareData
      }, () => {
        this.getRelatedSoftware();
      });
    }
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} tableType - table type ('cve', 'exposedDevices' or 'relatedSoftware')
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (tableType, type, value) => {
    const {cveData, exposedDevicesData, relatedSoftwareData} = this.state;
    let tempCveData = {...cveData};
    let tempExposedDevicesData = {...exposedDevicesData};
    let tempRelatedSoftwareData = {...relatedSoftwareData};

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
    } else if (tableType === 'relatedSoftware') {
      tempRelatedSoftwareData[type] = value;

      this.setState({
        relatedSoftwareData: tempRelatedSoftwareData
      }, () => {
        this.getRelatedSoftware(type);
      });
    }
  }
  /**
   * Handle CVE search search
   * @method
   * @param {object} event - event object
   */
  handleCveChange = (event) => {
    let tempCveSearch = {...this.state.cveSearch};
    tempCveSearch.keyword = event.target.value;

    this.setState({
      cveSearch: tempCveSearch
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
      this.getCveData();
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
    let tempCveFilter = {...this.state.cveFilter};
    tempCveFilter.severity = value;

    this.setState({
      cveFilter: tempCveFilter
    });
  }
  /**
   * Set dashboard filter data
   * @method
   * @param {string} type - filter type
   * @param {array.<string>} data - filter data
   */
  setDashboardFilter = (type, data) => {
    const {cveFilter, cveFilterList} = this.state;
    let tempCveFilter = {...cveFilter};
    let tempCveFilterList = {...cveFilterList};
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
      cveFilter: tempCveFilter,
      cveFilterList: tempCveFilterList
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
    const value = this.state.cveFilterList[val].join(', ');

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
    const {severityType, cveFilter, popOverAnchor, activeFilter} = this.state;
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
                base={DashboardFilter}
                defaultItemValue={defaultItemValue}
                value={cveFilter[activeFilter]}
                props={data}
                onChange={this.setDashboardFilter.bind(this, activeFilter)} />
            </React.Fragment>
          </div>
        </PopoverMaterial>

        <div className='group'>
          <Autocomplete
            className='combo-box'
            multiple
            value={cveFilter.severity}
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
      cveFilter: _.cloneDeep(CVE_FILTER),
      cveFilterList: _.cloneDeep(CVE_FILTER_LIST)
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
    const {cveData} = this.state;
    const url = `${baseUrl}${contextRoot}/api/hmd/cveUpdateToDate/_export`;
    let exportFields = {};
    let fieldsList = _.cloneDeep(this.state.cveData.dataFieldsArr);
    fieldsList.shift();

    _.forEach(fieldsList, val => {
      exportFields[val] = f('hostDashboardFields.' + val);
    })

    const requestData = {
      ...this.getCveFilterRequestData(),
      exportFields
    };

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {cveSearch, cveSeverityLevel, monthlySeverityTrend, showCveInfo, showFilterQuery, cveData, contextAnchor} = this.state;
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
          <MenuItem id='activeCveView' onClick={this.getActiveCveInfo}>{t('txt-view')}</MenuItem>
        </Menu>

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button variant='outlined' color='primary'><Link to='/SCP/host'>{t('host.txt-hostList')}</Link></Button>
          </div>
        </div>

        <div className='data-content'>
          <div className='parent-content'>
            <div className='main-statistics host'>
              <div className='statistics-content'>
                {this.showPieChart(cveSeverityLevel.data)}
                {this.showBarChart(monthlySeverityTrend)}
              </div>
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
                    name='cveSearch'
                    className='search-text'
                    label={t('host.dashboard.txt-cveName')}
                    variant='outlined'
                    size='small'
                    value={cveSearch.keyword}
                    onChange={this.handleCveChange}
                    onKeyDown={this.handleKeyDown.bind(this, 'cveSearch')} />
                  <Button variant='contained' color='primary' className='search-btn' onClick={this.getCveData}>{t('txt-search')}</Button>
                  {cveSearch.keyword &&
                    <i class='c-link inline fg fg-close' onClick={this.handleResetBtn.bind(this, 'cveSearch')}></i>
                  }
                  <div className='search-count'>{t('host.dashboard.txt-vulnerabilityCount') + ': ' + cveSearch.count}</div>
                </div>
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