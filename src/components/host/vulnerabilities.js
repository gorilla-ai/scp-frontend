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
import FilterQuery from './common/filter-query'
import GeneralDialog from './common/general-dialog'
import helper from '../common/helper'
import HostMenu from './common/host-menu'
import MuiTableContent from '../common/mui-table-content'
import TableList from './common/table-list'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SEVERITY_TYPE = ['critical', 'high', 'medium', 'low'];
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
    name: 'severity',
    displayType: 'auto_complete',
    filterType: 'auto_complete'
  },
  {
    name: 'cvss',
    displayType: 'text_field',
    filterType: 'multi_input',
    searchType: 'condition_input'
  }
];
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
  dataFieldsArr: ['hostName', 'group', 'ip', 'system', 'relatedSoftware', 'daysOpen', 'fix'],
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
const RELATED_SOFTWARE_SEARCH = {
  keyword: '',
  count: 0
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
 * Host Vulnerabilities
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Host Vulnerabilities page
 */
class HostVulnerabilities extends Component {
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
      exportContextAnchor: null,
      tableContextAnchor: null,
      cveSeverityLevel: {
        data: null,
        count: 0
      },
      monthlySeverityTrend: null,
      showCveInfo: false,
      showFilterQuery: false,
      activeCveInfo: 'vulnerabilityDetails', //'vulnerabilityDetails', 'exposedDevices' or 'relatedSoftware'
      cveData: {
        dataFieldsArr: ['_menu', 'cveId', 'severity', 'cvss', 'relatedSoftware', 'exposedDevices', 'fixedDevices'],
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
      relatedSoftwareSearch: _.cloneDeep(RELATED_SOFTWARE_SEARCH),
      relatedSoftwareData: _.cloneDeep(RELATED_SOFTWARE_DATA),
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
      url: `${baseUrl}/api/hmd/cveDevices/month/statistics`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
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
            <header>{t('host.vulnerabilities.txt-severityLevelQuery')}</header>
            <span><i className='fg fg-loading-2'></i></span>
          </div>
        }
        {cveSeverityLevel && cveSeverityLevel.length === 0 &&
          <div className='empty-data'>
            <header>{t('host.vulnerabilities.txt-severityLevelQuery')}</header>
            <span>{t('txt-notFound')}</span>
          </div>
        }
        {cveSeverityLevel && cveSeverityLevel.length > 0 &&
          <PieChart
            title={t('host.vulnerabilities.txt-severityLevelQuery')}
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
            <header>{t('host.vulnerabilities.txt-monthlySeverityTrend')}</header>
            <span><i className='fg fg-loading-2'></i></span>
          </div>
        }
        {monthlySeverityTrend && monthlySeverityTrend.length === 0 &&
          <div className='empty-data'>
            <header>{t('host.vulnerabilities.txt-monthlySeverityTrend')}</header>
            <span>{t('txt-notFound')}</span>
          </div>
        }
        {monthlySeverityTrend && monthlySeverityTrend.length > 0 &&
          <BarChart
            stacked
            vertical
            title={t('host.vulnerabilities.txt-monthlySeverityTrend')}
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
                ['day', [1]]
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
                      <Button className='host-open-table-menu' variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue.cveId)} data-cy='hostOpenTableMenuBtn'><i className='fg fg-more'></i></Button>
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
    const unSortableFields = ['_menu', 'relatedSoftware', 'exposedDevices', 'fixedDevices'];

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
   * @param {string} id - active CVE ID
   * @param {object} event - event object
   */
  handleOpenMenu = (id, event) => {
    this.setState({
      tableContextAnchor: event.currentTarget,
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

    if (exposedDevicesSearch.fix && exposedDevicesSearch.fix !== 'all') {
      requestData.fix = (exposedDevicesSearch.fix === 'true');
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
            label: t('host.vulnerabilities.txt-' + val),
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
                } else if (val === 'fix') {
                  return value ? t('txt-fixed') : t('txt-notFixed');
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
    const {cveFilter, relatedSoftwareSearch, relatedSoftwareData, currentCveId} = this.state;
    const sort = relatedSoftwareData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? relatedSoftwareData.currentPage : 0;
    let url = `${baseUrl}/api/hmd/cve/relatedSoftware?page=${page + 1}&pageSize=${relatedSoftwareData.pageSize}`;
    let requestData = {
      cveId: currentCveId
    };

    if (relatedSoftwareData.sort.field) {
      url += `&orders=${relatedSoftwareData.sort.field} ${sort}`;
    }

    if (relatedSoftwareSearch.keyword) {
      requestData.product = relatedSoftwareSearch.keyword;
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
        let tempRelatedSoftwareSearch = {...relatedSoftwareSearch};
        let tempRelatedSoftwareData = {...relatedSoftwareData};

        if (!data.rows || data.rows.length === 0) {
          tempRelatedSoftwareSearch.count = 0;
          tempRelatedSoftwareData.dataContent = [];
          tempRelatedSoftwareData.totalCount = 0;

          this.setState({
            relatedSoftwareSearch: tempRelatedSoftwareSearch,
            relatedSoftwareData: tempRelatedSoftwareData
          });
          return null;
        }       

        tempRelatedSoftwareData.dataContent = data.rows;
        tempRelatedSoftwareData.totalCount = data.count;
        tempRelatedSoftwareData.currentPage = page;
        tempRelatedSoftwareData.dataFields = _.map(relatedSoftwareData.dataFieldsArr, val => {
          return {
            name: val,
            label: f('hostDashboardFields.' + val),
            options: {
              filter: true,
              sort: true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempRelatedSoftwareData.dataContent[dataIndex];
                const value = tempRelatedSoftwareData.dataContent[dataIndex][val];

                if (val === 'exposedDevices') {
                  return value + ' / ' + allValue.exposedDevicesTotal;
                } else {
                  return value;
                }
              }
            }
          };
        });

        tempRelatedSoftwareSearch.count = helper.numberWithCommas(data.count);

        this.setState({
          relatedSoftwareSearch: tempRelatedSoftwareSearch,
          relatedSoftwareData: tempRelatedSoftwareData
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
   * Toggle show CVE info
   * @method
   */
  toggleShowCVE = () => {
    this.setState({
      showCveInfo: !this.state.showCveInfo,
      activeCveInfo: 'vulnerabilityDetails'
    });
  }
  /**
   * Toggle show CVE button
   * @method
   * @param {object} event - event object
   * @param {string} type - CVE button type ('vulnerabilityDetails', 'exposedDevices' or 'relatedSoftware')
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
   * Handle related software search
   * @method
   * @param {object} event - event object
   */
  handleRelatedSoftwareSearchChange = (event) => {
    let tempRelatedSoftwareSearch = {...this.state.relatedSoftwareSearch};
    tempRelatedSoftwareSearch.keyword = event.target.value;

    this.setState({
      relatedSoftwareSearch: tempRelatedSoftwareSearch
    });
  }
  /**
   * Handle reset button for host name search
   * @method
   * @param {string} type - reset button type ('cveSearch', 'exposedDevices' or 'relatedSoftware')
   */
  handleResetBtn = (type) => {
    const {cveSearch, exposedDevicesSearch, relatedSoftwareSearch} = this.state;

    if (type === 'cveSearch') {
      let tempCveSearch = {...cveSearch};
      tempCveSearch.keyword = '';

      this.setState({
        cveSearch: tempCveSearch
      });
    } else if (type === 'exposedDevices') {
      let tempExposedDevicesSearch = {...exposedDevicesSearch};
      tempExposedDevicesSearch.hostName = '';
      tempExposedDevicesSearch.ip = '';
      tempExposedDevicesSearch.system = '';

      this.setState({
        exposedDevicesSearch: tempExposedDevicesSearch
      });
    } else if (type === 'relatedSoftware') {
      let tempRelatedSoftwareSearch = {...relatedSoftwareSearch};
      tempRelatedSoftwareSearch.keyword = '';

      this.setState({
        relatedSoftwareSearch: tempRelatedSoftwareSearch
      });
    }
  }
  /**
   * Display CVE info content
   * @method
   * @returns HTML DOM
   */
  displayCveInfo = () => {
    const {activeCveInfo, exposedDevicesSearch, exposedDevicesData, relatedSoftwareSearch, relatedSoftwareData, currentCveData} = this.state;
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
          <ToggleButton id='hostDialogVulnerabilityDetails' value='vulnerabilityDetails' data-cy='hostInfoDialogDetailsBtn'>{t('host.vulnerabilities.txt-vulnerabilityDetails')}</ToggleButton>
          <ToggleButton id='hostDialogExposedDevices' value='exposedDevices' data-cy='hostInfoDialogDeviceBtn'>{t('host.vulnerabilities.txt-exposedDevices')}</ToggleButton>
          <ToggleButton id='hostDialogRelatedSoftware' value='relatedSoftware' data-cy='hostInfoDialogSoftwareBtn'>{t('host.vulnerabilities.txt-relatedSoftware')}</ToggleButton>
        </ToggleButtonGroup>

        <div className='main-content'>
          {activeCveInfo === 'vulnerabilityDetails' &&
            <GeneralDialog
              page='vulnerabilities'
              type='general-info'
              data={currentCveData} />
          }

          {activeCveInfo === 'exposedDevices' &&
            <GeneralDialog
              page='vulnerabilities'
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
              page='vulnerabilities'
              type='general-list'
              searchType={activeCveInfo}
              search={relatedSoftwareSearch}
              data={relatedSoftwareData}
              tableOptions={tableOptionsRelatedSoftware}
              handleSearchChange={this.handleRelatedSoftwareSearchChange}
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
        closeAction='cancel'
        data-cy='showCveDialog'>
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
   * Toggle show filter query
   * @method
   * @param {string} type - dialog type ('open', 'confirm' or 'cancel')
   * @param {object} [filterData] - filter data
   */
  toggleFilterQuery = (type, filterData) => {
    if (type !== 'open') {
      this.setState({
        cveFilter: filterData.filter,
        cveFilterList: filterData.itemFilterList
      }, () => {
        if (type === 'confirm') {
          this.getCveData();
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
   * Export CVE list
   * @method
   * @param {string} type - export type ('cve' or 'nccst')
   * @param {object} [datetime] - datetime object
   */
  exportCveList = (type, datetime) => {
    const {baseUrl, contextRoot} = this.context;
    const {cveData} = this.state;
    let url = '';
    let exportFields = {};
    let requestData = {
      ...this.getCveFilterRequestData()
    };

    if (type === 'cve') {
      let fieldsList = _.cloneDeep(cveData.dataFieldsArr);
      fieldsList.shift();

      _.forEach(fieldsList, val => {
        exportFields[val] = f('hostDashboardFields.' + val);
      })

      requestData.exportFields = exportFields;

      url = `${baseUrl}${contextRoot}/api/hmd/cveUpdateToDate/_export`;
    } else if (type === 'nccst') {
      const fieldsList = ['date', 'cveNum', 'critical', 'high', 'medium', 'low'];

      _.forEach(fieldsList, val => {
        exportFields[val] = f('hostVulnerabilityFields.' + val);
      })

      requestData.exportFields = exportFields;
      requestData.dateArray = [moment(datetime.from).format('YYYY-MM-DD'), moment(datetime.to).format('YYYY-MM-DD')];

      url = `${baseUrl}${contextRoot}/api/hmd/cveDevices/month/statistics/_export`;
    }

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
    this.handleCloseMenu();
  }
  render() {
    const {
      account,
      severityType,
      departmentList,
      departmentNameMapping,
      limitedDepartment,
      cveSearch,
      cveFilter,
      cveFilterList,
      cveSeverityLevel,
      monthlySeverityTrend,
      showCveInfo,
      showFilterQuery,
      cveData,
      exportContextAnchor,
      tableContextAnchor
    } = this.state;
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
          <FilterQuery
            page='vulnerabilities'
            account={account}
            departmentList={departmentList}
            limitedDepartment={limitedDepartment}
            departmentNameMapping={departmentNameMapping}
            severityType={severityType}
            filterList={FILTER_LIST}
            originalFilter={CVE_FILTER}
            filter={cveFilter}
            originalItemFilterList={CVE_FILTER_LIST}
            itemFilterList={cveFilterList}
            toggleFilterQuery={this.toggleFilterQuery} />
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <HostMenu />
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

            <TableList
              page='vulnerabilities'
              searchType='cveSearch'
              search={cveSearch}
              data={cveData}
              options={tableOptions}
              exportAnchor={exportContextAnchor}
              tableAnchor={tableContextAnchor}
              getData={this.getCveData}
              getActiveData={this.getActiveCveInfo}
              exportList={this.exportCveList}
              toggleFilterQuery={this.toggleFilterQuery}
              handleSearch={this.handleCveChange}
              handleReset={this.handleResetBtn}
              handleExportMenu={this.handleExportOpenMenu}
              handleCloseMenu={this.handleCloseMenu} />
          </div>
        </div>
      </div>
    )
  }
}

HostVulnerabilities.contextType = BaseDataContext;

HostVulnerabilities.propTypes = {
};

export default HostVulnerabilities;