import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
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

import BarChart from 'react-chart/build/src/components/bar'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PieChart from 'react-chart/build/src/components/pie'

import {downloadWithForm} from 'react-ui/build/src/utils/download'

import {BaseDataContext} from '../common/context'
import GeneralDialog from './common/general-dialog'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'
import SearchFilter from './search-filter'
import TableList from './common/table-list'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SEVERITY_TYPE = ['critical', 'high', 'medium', 'low'];
const CONDITION_MODE = {
  '=': 'eq',
  '>': 'gt',
  '<': 'lt'
};
const FILTER_LIST = ['departmentSelected', 'severity', 'cvss'];
const CVE_SEARCH = {
  keyword: '',
  count: 0
};
const CVE_FILTER = {
  departmentSelected: [],
  severity: [],
  cvss: [{
    condition: '=',
    input: ''
  }]
};
const CVE_FILTER_LIST = {
  departmentSelected: [],
  cvss: []
};
const EXPOSED_DEVICES_SEARCH = {
  hostName: '',
  ip: '',
  system: '',
  count: 0
};
const EXPOSED_DEVICES_DATA = {
  dataFieldsArr: ['hostName', 'group', 'ip', 'system', 'relatedSoftware', 'daysOpen'],
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
  dataFieldsArr: ['product', 'version', 'system', 'exposedDevices'],
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
      account: {
        id: '',
        login: false,
        fields: [],
        logsLocale: '',
        departmentId: '',
        limitedRole: false
      },
      severityType: [],
      departmentList: [],
      departmentNameMapping: {},
      limitedDepartment: [],
      cveSearch: _.cloneDeep(CVE_SEARCH),
      cveFilter: _.cloneDeep(CVE_FILTER),
      cveFilterList: _.cloneDeep(CVE_FILTER_LIST),
      productNameSearch: {
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
      activeCveInfo: 'vulnerabilityDetails', //'vulnerabilityDetails', 'exposedDevices' or 'relatedSoftware'
      cveData: {
        dataFieldsArr: ['_menu', 'cveId', 'severity', 'cvss', 'relatedSoftware', 'exposedDevices'],
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
      relatedSoftwareData: _.cloneDeep(RELATED_SOFTWARE_DATA),
      contextAnchor: null,
      currentCveId: '',
      currentCveData: {}
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
    this.getSeverityType();
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
            this.getCveSeverityData();
            this.getCveData();
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
    const {account, departmentNameMapping, cveFilter, cveFilterList} = this.state;
    let tempCveFilter = {...cveFilter};
    let tempCveFilterList = {...cveFilterList};

    this.ah.one({
      url: `${baseUrl}/api/department/child/_set?id=${account.departmentId}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        tempCveFilter.departmentSelected = data;
        tempCveFilterList.departmentSelected = _.map(data, val => {
          return departmentNameMapping[val];
        });

        this.setState({
          limitedDepartment: data,
          cveFilter: tempCveFilter,
          cveFilterList: tempCveFilterList
        }, () => {
          this.getCveSeverityData();
          this.getCveData();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set CVE chart data
   * @method
   */
  getCveSeverityData = () => {
    const {baseUrl} = this.context;
    const {cveFilter} = this.state;
    let requestData = {};

    if (cveFilter.departmentSelected.length > 0) {
      requestData.departmentArray = cveFilter.departmentSelected;
    }

    //Pie Chart
    this.ah.one({
      url: `${baseUrl}/api/hmd/cveUpdateToDate/severityAgg`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
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
    const centerText = t('txt-total') + ': ' + helper.numberWithCommas(this.state.cveSeverityLevel.count);

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
        let tempCveSearch = {...cveSearch};
        let tempCveData = {...cveData};

        if (!data.rows || data.rows.length === 0) {
          tempCveSearch.count = 0;
          tempCveData.dataContent = [];
          tempCveData.totalCount = 0;

          this.setState({
            cveSearch: tempCveSearch,
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
    const unSortableFields = ['_menu', 'relatedSoftware', 'exposedDevices'];

    if (_.includes(unSortableFields, field)) {
      return false;
    } else {
      return true;
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

    if (cveFilter.departmentSelected.length > 0) {
      requestData.departmentArray = cveFilter.departmentSelected;
    }

    if (cveFilter.severity.length > 0) {
      const severityArray = _.map(cveFilter.severity, val => {
        return val.value.toUpperCase();
      });

      requestData.severityArray = severityArray;
    }

    if (cveFilterList.cvss.length > 0) {
      requestData.cvssArray = _.map(cveFilterList.cvss, val => {
        return {
          mode: CONDITION_MODE[val.substr(0, 1)],
          cvss: val.substr(2)
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
    const {cveFilter, exposedDevicesSearch, exposedDevicesData, currentCveId} = this.state;
    const sort = exposedDevicesData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? exposedDevicesData.currentPage : 0;
    let url = `${baseUrl}/api/hmd/cve/devices?page=${page + 1}&pageSize=${exposedDevicesData.pageSize}`;
    let requestData = {
      cveId: currentCveId
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

    if (cveFilter.departmentSelected.length > 0) {
      requestData.departmentArray = cveFilter.departmentSelected;
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
   * Get related software data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getRelatedSoftware = (fromPage) => {
    const {baseUrl} = this.context;
    const {productNameSearch, cveFilter, relatedSoftwareData, currentCveId} = this.state;
    const sort = relatedSoftwareData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? relatedSoftwareData.currentPage : 0;
    let url = `${baseUrl}/api/hmd/cve/relatedSoftware?page=${page + 1}&pageSize=${relatedSoftwareData.pageSize}`;
    let requestData = {
      cveId: currentCveId
    };

    if (relatedSoftwareData.sort.field) {
      url += `&orders=${relatedSoftwareData.sort.field} ${sort}`;
    }

    if (productNameSearch.keyword) {
      requestData.product = productNameSearch.keyword;
    }

    if (cveFilter.departmentSelected.length > 0) {
      requestData.departmentArray = cveFilter.departmentSelected;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempProductNameSearch = {...productNameSearch};
        let tempExposedDevicesData = {...relatedSoftwareData};

        if (!data.rows || data.rows.length === 0) {
          tempProductNameSearch.count = 0;
          tempExposedDevicesData.dataContent = [];
          tempExposedDevicesData.totalCount = 0;

          this.setState({
            productNameSearch: tempProductNameSearch,
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
                  return value + ' / ' + allValue.exposedDevicesTotal;
                } else {
                  return value;
                }
              }
            }
          };
        });

        tempProductNameSearch.count = helper.numberWithCommas(data.count);

        this.setState({
          productNameSearch: tempProductNameSearch,
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
      exposedDevicesSearch: _.cloneDeep(EXPOSED_DEVICES_SEARCH),
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
   * Handle product search
   * @method
   * @param {object} event - event object
   */
  handleProductChange = (event) => {
    let tempProductNameSearch = {...this.state.productNameSearch};
    tempProductNameSearch.keyword = event.target.value;

    this.setState({
      productNameSearch: tempProductNameSearch
    });
  }
  /**
   * Handle reset button for host name search
   * @method
   * @param {string} type - reset button type ('cveSearch', 'exposedDevices' or 'productNameSearch')
   */
  handleResetBtn = (type, event) => {
    const {cveSearch, productNameSearch} = this.state;

    if (type === 'cveSearch') {
      let tempCveSearch = {...cveSearch};
      tempCveSearch.keyword = '';

      this.setState({
        cveSearch: tempCveSearch
      });
    } else if (type === 'exposedDevices') {
      this.setState({
        exposedDevicesSearch: _.cloneDeep(EXPOSED_DEVICES_SEARCH)
      });
    } else if (type === 'productNameSearch') {
      let tempProductNameSearch = {...productNameSearch};
      tempProductNameSearch.keyword = '';

      this.setState({
        productNameSearch: tempProductNameSearch
      });
    }
  }
  /**
   * Display CVE info content
   * @method
   * @returns HTML DOM
   */
  displayCveInfo = () => {
    const {productNameSearch, activeCveInfo, exposedDevicesSearch, exposedDevicesData, relatedSoftwareData, currentCveData} = this.state;
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
            <GeneralDialog
              page='dashboard'
              type='general-info'
              data={currentCveData} />
          }

          {activeCveInfo === 'exposedDevices' &&
            <GeneralDialog
              page='dashboard'
              type='exposed-devices'
              search={exposedDevicesSearch}
              data={exposedDevicesData}
              tableOptions={tableOptionsExposedDevices}
              handleSearchChange={this.handleDevicesSearchChange}
              handleSearchSubmit={this.getExposedDevices}
              handleResetBtn={this.handleResetBtn} />
          }

          {activeCveInfo === 'relatedSoftware' &&
            <GeneralDialog
              page='dashboard'
              type='general-list'
              searchType='productNameSearch'
              search={productNameSearch}
              data={relatedSoftwareData}
              tableOptions={tableOptionsRelatedSoftware}
              handleSearchChange={this.handleProductChange}
              handleSearchSubmit={this.getRelatedSoftware}
              handleResetBtn={this.handleResetBtn} />
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
   * @param {string} [options] - option for 'confirm'
   */
  toggleFilterQuery = (options) => {
    if (options === 'confirm') {
      this.getCveData();
    }

    this.setState({
      showFilterQuery: !this.state.showFilterQuery
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
   * Set search filter data
   * @method
   * @param {string} type - filter type
   * @param {array.<string>} data - filter data
   */
  setSerchFilter = (type, data) => {
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
    const {severityType, cveFilter, cveFilterList} = this.state;

    if (val === 'severity') {
      return (
        <div key={i} className='group'>
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
      )
    } else {
      return (
        <div key={i} className='group'>
          <TextField
            name={val}
            label={f('hostDashboardFields.' + val)}
            variant='outlined'
            fullWidth
            size='small'
            value={cveFilterList[val].join(', ')}
            onClick={this.handleFilterclick.bind(this, val)}
            InputProps={{
              readOnly: true
            }} />
        </div>
      )
    }
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
    const {cveFilter} = this.state;

    if (checked) {
      return _.concat(cveFilter[type], ...list, id);
    } else {
      return _.without(cveFilter[type], ...list, id);
    }
  }
  /**
   * Handle department checkbox check/uncheck
   * @method
   * @param {object} tree - department tree data
   * @param {object} event - event object
   */
  toggleDepartmentCheckbox = (tree, event) => {
    const {departmentNameMapping, cveFilter, cveFilterList} = this.state;
    let tempCveFilter = {...cveFilter};
    let tempCveFilterList = {...cveFilterList};
    let departmentChildList = [];

    _.forEach(tree.children, val => {
      helper.floorPlanRecursive(val, obj => {
        departmentChildList.push(obj.id);
      });
    })

    tempCveFilter.departmentSelected = this.getSelectedItems(event.target.checked, 'departmentSelected', departmentChildList, tree.id);

    tempCveFilterList.departmentSelected = _.map(tempCveFilter.departmentSelected, val => {
      return departmentNameMapping[val];
    })

    this.setState({
      cveFilter: tempCveFilter,
      cveFilterList: tempCveFilterList
    });
  }
  /**
   * Display department tree content
   * @method
   * @param {object} tree - department tree data
   * @returns HTML DOM
   */
  getDepartmentTreeLabel = (tree) => {
    return <span><Checkbox checked={_.includes(this.state.cveFilter.departmentSelected, tree.id)} onChange={this.toggleDepartmentCheckbox.bind(this, tree)} color='primary' />{tree.name}</span>
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
    const {departmentList, cveFilter, popOverAnchor, activeFilter} = this.state;
    const defaultItemValue = {
      condition: '=',
      input: ''
    };
    const data = {
      pageType: 'dashboard',
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
                value={cveFilter[activeFilter]}
                props={data}
                onChange={this.setSerchFilter.bind(this, activeFilter)} />
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
    let fieldsList = _.cloneDeep(cveData.dataFieldsArr);
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

        <TableList
          page='dashboard'
          searchType='cveSearch'
          search={cveSearch}
          data={cveData}
          options={tableOptions}
          tableAnchor={contextAnchor}
          cveSeverityLevel={cveSeverityLevel}
          monthlySeverityTrend={monthlySeverityTrend}
          showPieChart={this.showPieChart}
          showBarChart={this.showBarChart}
          getData={this.getCveData}
          getActiveData={this.getActiveCveInfo}
          exportList={this.exportCveList}
          toggleFilterQuery={this.toggleFilterQuery}
          handleSearch={this.handleCveChange}
          handleReset={this.handleResetBtn}
          handleCloseMenu={this.handleCloseMenu} />
      </div>
    )
  }
}

HostDashboard.contextType = BaseDataContext;

HostDashboard.propTypes = {
};

export default HostDashboard;