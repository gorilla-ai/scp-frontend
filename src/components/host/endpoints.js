import React, { Component } from 'react'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { TableCell, TableRow } from "@material-ui/core";

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'
import {downloadWithForm} from 'react-ui/build/src/utils/download'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PieChart from 'react-chart/build/src/components/pie'
import Popover from 'react-ui/build/src/components/popover'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import BarChart from 'react-chart/build/src/components/bar'

import {BaseDataContext} from '../common/context'
import FilterQuery from './common/filter-query'
import GeneralDialog from './common/general-dialog'
import helper from '../common/helper'
import HMDmoreInfo from '../common/hmd-more-info'
import HostMenu from './common/host-menu'
import MemoInput from './common/memo-input'
import TableList from './common/table-list'
import FileUpload from '../common/file-upload'
import HMDsettings from './hmd-settings'

const NOT_AVAILABLE = 'N/A';
const SEVERITY_TYPE = ['critical', 'high', 'medium', 'low'];
const CONNECTION_STATUS = ['online', 'offline', 'inActivate'];
const VERSION = ['isLatestVersion', 'notUpgraded', 'notInstalled'];
const ENABLED_DISABLED = ['isEnabled', 'isDisabled'];
const CONDITION_MODE = {
  '=': 'eq',
  '>': 'gt',
  '<': 'lt'
};
const SEVERITY_COLORS = {
  critical: '#000',
  high: '#CC2943',
  medium: '#CC7B29',
  low: '#7ACC29'
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
    displayType: 'auto_complete',
    filterType: 'auto_complete'
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
  },
  {
    name: 'fileIntegrity',
    displayType: 'select_list',
    filterType: 'select_list'
  },
  {
    name: 'procMonitor',
    displayType: 'select_list',
    filterType: 'select_list'
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
  version: [],
  fileIntegrity: '',
  procMonitor: '',
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
  fileIntegrity: [],
  procMonitor: [],
  riskValue: [],
  risk: [],
  memos: []
};
const SAFETY_SCAN_INFO_SEARCH = {
  keyword: '',
  count: 0
};
const SAFETY_SCAN_INFO_DATA = {
  dataFieldsArr: ['taskName', 'taskStatus', 'taskCreateDttm', 'taskResponseDttm'],
  dataFields: [],
  dataContent: null,
  sort: {
    field: '',
    desc: true
  },
  totalCount: 0,
  currentPage: 0,
  pageSize: 20,
  hostId: ''
};
const SOFTWARE_INVENTORY_SEARCH = {
  keyword: '',
  count: 0
};
const SOFTWARE_INVENTORY_INFO_DATA = {
  dataFieldsArr: ['product', 'vendor', 'version', 'cpe23uri', 'riskValue', 'vulnerabilityNum', 'detectedDttm'],
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
const GCB_SEARCH = {
  keyword: '',
  policyName: '',
  type: '',
  compareResult: 'all',
  count: 0
};
const GCB_INFO_DATA = {
  dataFieldsArr: ['originalKey', 'policyName', 'type', 'gpoValue', 'gcbValue', 'compareResult', 'exposedDevices'],
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
  fix: '',
  count: 0
};
const DISCOVERED_VULNERABILITY_DATA = {
  dataFieldsArr: ['cveId', 'severity', 'cvss', 'relatedSoftware', 'exposedDevices', 'fix'],
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
const KBID_SEARCH = {
  keyword: '',
  count: 0
};
const KBID_DATA = {
  dataFieldsArr: ['kbid', 'detectedDttm', 'exposedDevices'],
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
const MALWARE_SEARCH = {
  keyword: '',
  count: 0
};
const MALWARE_DATA = {
  dataFieldsArr: ['fileMD5', 'filePath', 'fileSize', 'virusTotal', 'detectedDttm', 'exposedDevices'],
  dataFields: [],
  dataContent: null,
  sort: {
    field: '',
    desc: true
  },
  totalCount: 0,
  currentPage: 0,
  pageSize: 20,
  isUploaded: false,
  hostId: ''
};
const FILE_INTEGRITY_SEARCH = {
  keyword: '',
  count: 0
};
const FILE_INTEGRITY_DATA = {
  dataFieldsArr: ['filePath', 'category', 'detectedDttm'],
  dataFields: [],
  dataContent: null,
  sort: {
    field: '',
    desc: true
  },
  totalCount: 0,
  currentPage: 0,
  pageSize: 20,
  hostId: ''
};
const PROC_MONITOR_SEARCH = {
  keyword: '',
  count: 0
};
const PROC_MONITOR_DATA = {
  dataFieldsArr: ['filePath', 'detectedDttm'],
  dataFields: [],
  dataContent: null,
  sort: {
    field: '',
    desc: true
  },
  totalCount: 0,
  currentPage: 0,
  pageSize: 20,
  hostId: ''
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
      version: [],
      fileIntegrity: [],
      procMonitor: [],
      importDialogOpen: false,
      modalViewMoreOpen: false,
      requestSentOpen: false,
      uploadHmdFileOpen: false,
      hmdSettingsOpen: false,
      endpointsSearch: _.cloneDeep(ENDPOINTS_SEARCH),
      endpointsFilter: _.cloneDeep(ENDPOINTS_FILTER),
      endpointsFilterList: _.cloneDeep(ENDPOINTS_FILTER_LIST),
      filterDataCount: 0,
      exportContextAnchor: null,
      tableContextAnchor: null,
      moreContextAnchor: null,
      filterContextAnchor: null,
      showMemoInfo: false,
      showEndpointInfo: false,
      showFilterQuery: false,
      showFilterType: 'open', // 'open', 'load', 'save'
      filterQueryList: [],
      activeEndpointInfo: 'overview', //'overview', 'safetyScanInfo', 'softwareInventory', 'discoveredVulnerability', 'kbid', 'malware' or 'gcb'
      departmentStatistics: [],
      departmentStatisticsAdmin: [],
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
      safetyScanInfoSearch: _.cloneDeep(SAFETY_SCAN_INFO_SEARCH),
      safetyScanInfoData: _.cloneDeep(SAFETY_SCAN_INFO_DATA),
      softwareInventorySearch: _.cloneDeep(SOFTWARE_INVENTORY_SEARCH),
      softwareInventoryData: _.cloneDeep(SOFTWARE_INVENTORY_INFO_DATA),
      gcbSearch: _.cloneDeep(GCB_SEARCH),
      gcbData: _.cloneDeep(GCB_INFO_DATA),
      discoveredVulnerabilitySearch: _.cloneDeep(DISCOVERED_VULNERABILITY_SEARCH),
      discoveredVulnerabilityData: _.cloneDeep(DISCOVERED_VULNERABILITY_DATA),
      kbidSearch: _.cloneDeep(KBID_SEARCH),
      kbidData: _.cloneDeep(KBID_DATA),
      malwareSearch: _.cloneDeep(MALWARE_SEARCH),
      malwareData: _.cloneDeep(MALWARE_DATA),
      fileIntegritySearch: _.cloneDeep(FILE_INTEGRITY_SEARCH),
      fileIntegrityData: _.cloneDeep(FILE_INTEGRITY_DATA),
      procMonitorSearch: _.cloneDeep(PROC_MONITOR_SEARCH),
      procMonitorData: _.cloneDeep(PROC_MONITOR_DATA),
      currentHostId: '',
      currentRiskLevel: '',
      currentEndpointData: {},
      severityStatistics: null,
      hmdFile: {}
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
        if (sessionRights.Module_Config) {
          this.getDepartmentStatisticsAdminData();
        }

        this.getDepartmentTree();
        this.getSystemList();
        this.getSeverityType();
        this.getVersion();
        this.getConnectionStatus();
        this.getFileIntegrityList();
        this.getProcMonitorList();
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
        Low: '#7ACC29',
        online: '#32CD32',
        offline: '#FF0000',
        inActivate: '#A9A9A9'
      };
    } else if (locale === 'zh') {
      ALERT_LEVEL_COLORS = {
        嚴重: '#000',
        高: '#CC2943',
        中: '#CC7B29',
        低: '#7ACC29',
        連線: '#32CD32',
        離線: '#CC2943',
        未安裝: '#A9A9A9'
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
          this.getDepartmentStatisticsData();
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
   * Get and set department statistics chart data for admin
   * @method
   */
  getDepartmentStatisticsAdminData = () => {
    const {baseUrl} = this.context;

    //Bar Chart
    this.ah.one({
      url: `${baseUrl}/api/endPoint/statistics`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const departmentStatisticsAdmin = [
          {
            id: 1,
            title: t('host.endpoints.txt-hmdStatus'),
            type: 'status',
            data: this.formatBarChartData('status', data.statusAgg)
          },
          {
            id: 2,
            title: t('host.endpoints.txt-hmdVersion'),
            type: 'version',
            data: this.formatBarChartData('version', data.versionAgg)
          },
          {
            id: 3,
            title: t('host.endpoints.txt-hostSeverityLevel'),
            type: 'severity',
            data: this.formatBarChartData('severity', data.severityAgg)
          }
        ];

        this.setState({
          departmentStatisticsAdmin
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Format the bar chart data
   * @method
   * @param {string} type - chart type ('status', 'version' or 'severity')
   * @param {object} data - chart data
   * @returns formatted chart data
   */
  formatBarChartData = (type, data) => {
    let formattedData = [];

    _.keys(data)
    .forEach(key => {
      _.keys(data[key])
      .forEach(key2 => {
        if (data[key][key2] >= 0) {
          formattedData.push({
            [type]: t('txt-' + key),
            count: data[key][key2],
            department: key2
          })
        }
      })
    });

    return formattedData;
  }
  /**
   * Get and set department statistics chart data
   * @method
   */
  getDepartmentStatisticsData = () => {
    const {baseUrl} = this.context;
    const {endpointsFilter} = this.state;
    const requestData = {
      departmentArray: endpointsFilter.departmentSelected
    };

    //Pie Chart
    this.ah.one({
      url: `${baseUrl}/api/endPoint/department/statistics`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        const departmentStatistics = [
          {
            id: 1,
            title: t('host.endpoints.txt-hmdStatus'),
            label: t('txt-status'),
            data: this.formatPieChartData(data.statusAgg),
            count: helper.numberWithCommas(data.statusTotal)
          },
          {
            id: 2,
            title: t('host.endpoints.txt-hmdVersion'),
            label: t('txt-version'),
            data: this.formatPieChartData(data.versionAgg),
            count: helper.numberWithCommas(data.versionTotal)
          },
          {
            id: 3,
            title: t('host.endpoints.txt-hostSeverityLevel'),
            label: t('txt-severity'),
            data: this.formatPieChartData(data.severityAgg),
            count: helper.numberWithCommas(data.severityTotal)
          }
        ];

        this.setState({
          departmentStatistics
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
   * @returns formatted chart data
   */
  formatPieChartData = (data) => {
    let chartData = [];

    _.keys(data)
    .forEach(key => {
      if (data[key] >= 0) {
        chartData.push({
          key: t('txt-' + key),
          doc_count: data[key]
        });
      }
    });

    return chartData;
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
   * Get and set version
   * @method
   */
  getVersion = () => {
    const version = _.map(VERSION, val => {
      return {
        value: val,
        text: t('txt-' + val)
      };
    });

    this.setState({
      version
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
   * Get and set file integrity
   * @method
   */
  getFileIntegrityList = () => {
    const fileIntegrity = _.map(ENABLED_DISABLED, val => {
      return {
        value: val,
        text: t('txt-' + val)
      };
    });

    this.setState({
      fileIntegrity
    });
  }
  /**
   * Get and set process monitor
   * @method
   */
  getProcMonitorList = () => {
    const procMonitor = _.map(ENABLED_DISABLED, val => {
      return {
        value: val,
        text: t('txt-' + val)
      };
    });

    this.setState({
      procMonitor
    });
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
    let url = `${baseUrl}/api/endPoint/_search?page=${page + 1}&pageSize=${endpointsData.pageSize}`;

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
                  return <span className={'online-status online-status-' + value}>{t('txt-' + value)}</span>
                } else if (val === 'risk' && value) {
                  return <span className={'risk-level risk-level-' + value}>{value}</span>
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
    const {endpointsSearch, endpointsFilter} = this.state;
    let requestData = {};

    if (endpointsSearch.keyword) {
      requestData.hostNameOrIp = endpointsSearch.keyword;
    }

    if (endpointsFilter.departmentSelected && endpointsFilter.departmentSelected.length > 0) {
      requestData.departmentArray = endpointsFilter.departmentSelected;
    }

    if (endpointsFilter.system && endpointsFilter.system.length > 0) {
      const index = endpointsFilter.system.indexOf('noSystem');
      let systemArray = _.cloneDeep(endpointsFilter.system);

      if (index > -1) {
        systemArray[index] = 'noExist';
      }

      requestData.systemArray = systemArray;
    }

    if (endpointsFilter.connectionStatus && endpointsFilter.connectionStatus.length > 0) {
      requestData.statusArray = _.map(endpointsFilter.connectionStatus, val => {
        return val.value;
      });
    }

    if (endpointsFilter.version && endpointsFilter.version.length > 0) {
      requestData.versionArray = _.map(endpointsFilter.version, val => {
        return val.value;
      });
    }

    if (endpointsFilter.riskValue && endpointsFilter.riskValue.length > 0 && endpointsFilter.riskValue[0].input.length > 0) {
      requestData.riskValueArray = _.map(endpointsFilter.riskValue, val => {
        return {
          mode: CONDITION_MODE[val.condition],
          riskValue: val.input
        }
      });
    }

    if (endpointsFilter.risk && endpointsFilter.risk.length > 0) {
      const riskArray = _.map(endpointsFilter.risk, val => {
        return val.value.toUpperCase();
      });

      requestData.riskArray = riskArray;
    }

    if (endpointsFilter.memos && endpointsFilter.memos.length > 0 && endpointsFilter.memos[0].input.length > 0) {
      requestData.memos = _.map(endpointsFilter.memos, val => val.input);
    }

    if (endpointsFilter.fileIntegrity === 'isEnabled' || endpointsFilter.fileIntegrity === 'isDisabled')
      requestData.fileIntegrityEnable = endpointsFilter.fileIntegrity === 'isEnabled'

    if (endpointsFilter.procMonitor === 'isEnabled' || endpointsFilter.procMonitor === 'isDisabled')
      requestData.processMonitorEnable = endpointsFilter.procMonitor === 'isEnabled'

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
      currentHostId: allValue.hostId,
      currentRiskLevel: allValue.risk
    });
  }
  /**
   * Get individual endpoint data
   * @method
   * @param {string} [type] - options for type ('open')
   */
  getActiveEndpointInfo = (type) => {
    const {baseUrl} = this.context;
    const {currentHostId, currentRiskLevel} = this.state;
    const apiArr = [
      {
        url: `${baseUrl}/api/endPoint/overview?hostId=${currentHostId}`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/endPoint/risk/radar?hostId=${currentHostId}`,
        type: 'GET'
      }
    ];

    this.ah.all(apiArr)
    .then(data => {
      if (data) {
        let currentEndpointData = data[0] ? data[0] : {};
        currentEndpointData.riskLevel = currentRiskLevel;
        currentEndpointData.radarResult = data[1] ? data[1] : {};

        this.setState({
          currentEndpointData
        }, () => {
          if (type === 'open') {
            this.toggleShowEndpoint();
          }
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
   * Toggle show endpoints button
   * @method
   * @param {object} event - event object
   * @param {string} type - endpoint button type ('overview', 'safetyScanInfo', 'softwareInventory', 'discoveredVulnerability', 'kbid', 'malware', 'gcb', 'fileIntegrity' or 'procMonitor')
   */
  toggleEndpointButtons = (event, type) => {
    if (!type) {
      return;
    }
    
    this.setState({
      activeEndpointInfo: type
    }, () => {
      const {activeEndpointInfo} = this.state;

      if (activeEndpointInfo === 'overview') {
        this.getActiveEndpointInfo();
      } else if (activeEndpointInfo === 'safetyScanInfo') {
        this.getSafetyScanInfo();
      } else if (activeEndpointInfo === 'softwareInventory') {
        this.getSoftwareInventory();
      } else if (activeEndpointInfo === 'gcb') {
        this.getGcb();
      } else if (activeEndpointInfo === 'discoveredVulnerability') {
        this.getSeverityStatistics();
        this.getDiscoveredVulnerability();
      } else if (activeEndpointInfo === 'kbid') {
        this.getKBID();
      } else if (activeEndpointInfo === 'malware') {
        this.getMalware();
      } else if (activeEndpointInfo === 'fileIntegrity') {
        this.getFileIntegrity();
      } else if (activeEndpointInfo === 'procMonitor') {
        this.getProcMonitor();
      }
    });
  }
  /**
   * Get safety scan info data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getSafetyScanInfo = (fromPage) => {
    const {baseUrl} = this.context;
    const {safetyScanInfoSearch, safetyScanInfoData, currentHostId, currentEndpointData} = this.state;
    const sort = safetyScanInfoData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? safetyScanInfoData.currentPage : 0;
    let url = `${baseUrl}/api/endPoint/safetyScanInfo/record?page=${page + 1}&pageSize=${safetyScanInfoData.pageSize}`;
    let requestData = {
      hostId: currentHostId
    };

    if (safetyScanInfoData.sort.field) {
      url += `&orders=${safetyScanInfoData.sort.field} ${sort}`;
    }

    if (safetyScanInfoSearch.keyword) {
      requestData.taskName = safetyScanInfoSearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempSafetyScanInfoSearch = {...safetyScanInfoSearch};
        let tempSafetyScanInfoData = {...safetyScanInfoData};

        if (!data.rows || data.rows.length === 0) {
          tempSafetyScanInfoSearch.count = 0;
          tempSafetyScanInfoData.dataContent = [];
          tempSafetyScanInfoData.totalCount = 0;

          this.setState({
            safetyScanInfoSearch: tempSafetyScanInfoSearch,
            safetyScanInfoData: tempSafetyScanInfoData
          });
          return null;
        }       

        tempSafetyScanInfoData.dataContent = data.rows;
        tempSafetyScanInfoData.totalCount = data.count;
        tempSafetyScanInfoData.currentPage = page;
        tempSafetyScanInfoData.dataFields = _.map(safetyScanInfoData.dataFieldsArr, val => {
          return {
            name: val,
            label: t('host.endpoints.txt-' + val),
            options: {
              filter: true,
              sort: false,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempSafetyScanInfoData.dataContent[dataIndex];
                const value = tempSafetyScanInfoData.dataContent[dataIndex][val];

                if ((val === 'taskCreateDttm' || val === 'taskResponseDttm') && value) {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                }

                return value;
              }
            }
          };
        });
        
        tempSafetyScanInfoData.hostId = currentHostId;
        tempSafetyScanInfoData.ip = currentEndpointData.ip;
        tempSafetyScanInfoSearch.count = helper.numberWithCommas(data.count);

        this.setState({
          safetyScanInfoSearch: tempSafetyScanInfoSearch,
          safetyScanInfoData: tempSafetyScanInfoData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get software inventory data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getSoftwareInventory = (fromPage) => {
    const {baseUrl} = this.context;
    const {softwareInventorySearch, softwareInventoryData, currentHostId} = this.state;
    const sort = softwareInventoryData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? softwareInventoryData.currentPage : 0;
    let url = `${baseUrl}/api/endPoint/inventory?page=${page + 1}&pageSize=${softwareInventoryData.pageSize}`;
    let requestData = {
      hostId: currentHostId
    };

    if (softwareInventoryData.sort.field) {
      url += `&orders=${softwareInventoryData.sort.field} ${sort}`;
    }

    if (softwareInventorySearch.keyword) {
      requestData.cpeInfo = softwareInventorySearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempSoftwareInventorySearch = {...softwareInventorySearch};
        let tempSoftwareInventoryData = {...softwareInventoryData};

        if (!data.rows || data.rows.length === 0) {
          tempSoftwareInventorySearch.count = 0;
          tempSoftwareInventoryData.dataContent = [];
          tempSoftwareInventoryData.totalCount = 0;

          this.setState({
            softwareInventorySearch: tempSoftwareInventorySearch,
            softwareInventoryData: tempSoftwareInventoryData
          });
          return null;
        }       

        tempSoftwareInventoryData.dataContent = data.rows;
        tempSoftwareInventoryData.totalCount = data.count;
        tempSoftwareInventoryData.currentPage = page;
        tempSoftwareInventoryData.dataFields = _.map(softwareInventoryData.dataFieldsArr, val => {
          return {
            name: val,
            label: t('host.inventory.txt-' + val),
            options: {
              filter: true,
              sort: true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempSoftwareInventoryData.dataContent[dataIndex];
                const value = tempSoftwareInventoryData.dataContent[dataIndex][val];

                if (val === 'detectedDttm' && value) {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                }

                return value;
              }
            }
          };
        });

        tempSoftwareInventorySearch.count = helper.numberWithCommas(data.count);

        this.setState({
          softwareInventorySearch: tempSoftwareInventorySearch,
          softwareInventoryData: tempSoftwareInventoryData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get GCB data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getGcb = (fromPage) => {
    const {baseUrl} = this.context;
    const {gcbSearch, gcbData, currentHostId} = this.state;
    const sort = gcbData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? gcbData.currentPage : 0;
    let url = `${baseUrl}/api/endPoint/gcb?page=${page + 1}&pageSize=${gcbData.pageSize}`;
    let requestData = {
      hostId: currentHostId
    };

    if (gcbData.sort.field) {
      url += `&orders=${gcbData.sort.field} ${sort}`;
    }

    if (gcbSearch.keyword) {
      requestData.originalKey = gcbSearch.keyword;
    }
    if (gcbSearch.policyName) {
      requestData.policyName = gcbSearch.policyName;
    }
    if (gcbSearch.type) {
      requestData.type = gcbSearch.type;
    }
    if (gcbSearch.compareResult && gcbSearch.compareResult !== 'all') {
      requestData.compareResult = (gcbSearch.compareResult === 'true');
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempGcbSearch = {...gcbSearch};
        let tempGcbData = {...gcbData};

        if (!data.rows || data.rows.length === 0) {
          tempGcbSearch.count = 0;
          tempGcbData.dataContent = [];
          tempGcbData.totalCount = 0;

          this.setState({
            gcbSearch: tempGcbSearch,
            gcbData: tempGcbData
          });
          return null;
        }       

        tempGcbData.dataContent = data.rows;
        tempGcbData.totalCount = data.count;
        tempGcbData.currentPage = page;
        tempGcbData.dataFields = _.map(gcbData.dataFieldsArr, val => {
          return {
            name: val,
            label: t('host.gcb.txt-' + val),
            options: {
              filter: true,
              sort: true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempGcbData.dataContent[dataIndex];
                const value = tempGcbData.dataContent[dataIndex][val];

                if (val === 'compareResult') {
                  return <span className={'status-' + (value ? 'success' : 'fail')}>{t('txt-' + (value ? 'success' : 'fail'))}</span>
                }

                return value;
              }
            }
          };
        });

        tempGcbSearch.count = helper.numberWithCommas(data.count);

        this.setState({
          gcbSearch: tempGcbSearch,
          gcbData: tempGcbData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get severity statistics
   * @method
   */
  getSeverityStatistics = () => {
    const {baseUrl} = this.context;
    const {currentHostId} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/endPoint/vulnerability/severityAgg?hostId=${currentHostId}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const severityStatistics = _.map(SEVERITY_TYPE, val => {
          return {
            severity: val,
            value: data.severityAgg[val]
          };
        });

        this.setState({
          severityStatistics
        });
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
   * Get discovered vulnerability data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getDiscoveredVulnerability = (fromPage) => {
    const {baseUrl} = this.context;
    const {discoveredVulnerabilitySearch, discoveredVulnerabilityData, currentHostId} = this.state;
    const sort = discoveredVulnerabilityData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? discoveredVulnerabilityData.currentPage : 0;
    let url = `${baseUrl}/api/endPoint/vulnerability?page=${page + 1}&pageSize=${discoveredVulnerabilityData.pageSize}`;
    let requestData = {
      hostId: currentHostId
    };

    if (discoveredVulnerabilityData.sort.field) {
      url += `&orders=${discoveredVulnerabilityData.sort.field} ${sort}`;
    }

    if (discoveredVulnerabilitySearch.keyword) {
      requestData.cveId = discoveredVulnerabilitySearch.keyword;
    }

    if (discoveredVulnerabilitySearch.fix && discoveredVulnerabilitySearch.fix !== 'all') {
      requestData.fix = (discoveredVulnerabilitySearch.fix === 'true');
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempDiscoveredVulnerabilitySearch = {...discoveredVulnerabilitySearch};
        let tempDiscoveredVulnerabilityData = {...discoveredVulnerabilityData};

        if (!data.rows || data.rows.length === 0) {
          tempDiscoveredVulnerabilitySearch.count = 0;
          tempDiscoveredVulnerabilityData.dataContent = [];
          tempDiscoveredVulnerabilityData.totalCount = 0;

          this.setState({
            discoveredVulnerabilitySearch: tempDiscoveredVulnerabilitySearch,
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
                } else if (val === 'fix') {
                  return value ? t('txt-fixed') : t('txt-notFixed');
                } else {
                  return value;
                }
              }
            }
          };
        });

        tempDiscoveredVulnerabilitySearch.count = helper.numberWithCommas(data.count);

        this.setState({
          discoveredVulnerabilitySearch: tempDiscoveredVulnerabilitySearch,
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
   * Get KBID data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getKBID = (fromPage) => {
    const {baseUrl} = this.context;
    const {kbidSearch, kbidData, currentHostId} = this.state;
    const sort = kbidData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? kbidData.currentPage : 0;
    let url = `${baseUrl}/api/endPoint/kbid?page=${page + 1}&pageSize=${kbidData.pageSize}`;
    let requestData = {
      hostId: currentHostId
    };

    if (kbidData.sort.field) {
      url += `&orders=${kbidData.sort.field} ${sort}`;
    }

    if (kbidSearch.keyword) {
      requestData.kbid = kbidSearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempKbidSearch = {...kbidSearch};
        let tempKbidData = {...kbidData};

        if (!data.rows || data.rows.length === 0) {
          tempKbidSearch.count = 0;
          tempKbidData.dataContent = [];
          tempKbidData.totalCount = 0;

          this.setState({
            kbidSearch: tempKbidSearch,
            kbidData: tempKbidData
          });
          return null;
        }       

        tempKbidData.dataContent = data.rows;
        tempKbidData.totalCount = data.count;
        tempKbidData.currentPage = page;
        tempKbidData.dataFields = _.map(kbidData.dataFieldsArr, val => {
          return {
            name: val,
            label: f('hostDashboardFields.' + val),
            options: {
              filter: true,
              sort: true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempKbidData.dataContent[dataIndex];
                const value = tempKbidData.dataContent[dataIndex][val];

                if (val === 'detectedDttm' && value) {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                }

                return value;
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
   * Get malware data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getMalware = (fromPage) => {
    const {baseUrl} = this.context;
    const {malwareSearch, malwareData, currentHostId} = this.state;
    const sort = malwareData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? malwareData.currentPage : 0;
    let url = `${baseUrl}/api/endPoint/malware?page=${page + 1}&pageSize=${malwareData.pageSize}`;
    let requestData = {
      hostId: currentHostId
    };

    if (malwareData.sort.field) {
      url += `&orders=${malwareData.sort.field} ${sort}`;
    }

    if (malwareSearch.keyword) {
      requestData.fileMD5 = malwareSearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempMalwareSearch = {...malwareSearch};
        let tempMalwareData = {...malwareData};

        if (!data.rows || data.rows.length === 0) {
          tempMalwareSearch.count = 0;
          tempMalwareData.dataContent = [];
          tempMalwareData.totalCount = 0;

          this.setState({
            malwareSearch: tempMalwareSearch,
            malwareData: tempMalwareData
          });
          return null;
        }       

        tempMalwareData.dataContent = data.rows;
        tempMalwareData.totalCount = data.count;
        tempMalwareData.currentPage = page;
        tempMalwareData.isUploaded = data.isUploaded;
        tempMalwareData.hostId = currentHostId;
        tempMalwareData.dataFields = _.map(malwareData.dataFieldsArr, val => {
          return {
            name: val,
            label: f('hostDashboardFields.' + val),
            options: {
              filter: true,
              sort: true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempMalwareData.dataContent[dataIndex];
                const value = tempMalwareData.dataContent[dataIndex][val];

                if (val === 'detectedDttm' && value) {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                }

                return value;
              }
            }
          };
        });

        tempMalwareSearch.count = helper.numberWithCommas(data.count);

        this.setState({
          malwareSearch: tempMalwareSearch,
          malwareData: tempMalwareData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get file integrity data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getFileIntegrity = (fromPage) => {
    const {baseUrl} = this.context;
    const {fileIntegritySearch, fileIntegrityData, currentHostId} = this.state;
    const sort = fileIntegrityData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? fileIntegrityData.currentPage : 0;
    let url = `${baseUrl}/api/endPoint/fileintegrity?page=${page + 1}&pageSize=${fileIntegrityData.pageSize}`;
    let requestData = {
      hostId: currentHostId
    };

    if (fileIntegrityData.sort.field) {
      url += `&orders=${fileIntegrityData.sort.field} ${sort}`;
    }

    if (fileIntegritySearch.keyword) {
      //requestData.filePath = fileIntegritySearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempFileIntegritySearch = {...fileIntegritySearch};
        let tempFileIntegrityData = {...fileIntegrityData};

        if (!data.rows || data.rows.length === 0) {
          tempFileIntegritySearch.count = 0;
          tempFileIntegrityData.dataContent = [];
          tempFileIntegrityData.totalCount = 0;

          this.setState({
            fileIntegritySearch: tempFileIntegritySearch,
            fileIntegrityData: tempFileIntegrityData
          });
          return null;
        }       

        tempFileIntegrityData.dataContent = data.rows;
        tempFileIntegrityData.totalCount = data.count;
        tempFileIntegrityData.currentPage = page;
        tempFileIntegrityData.isUploaded = data.isUploaded;
        tempFileIntegrityData.hostId = currentHostId;
        tempFileIntegrityData.dataFields = _.map(fileIntegrityData.dataFieldsArr, val => {
          return {
            name: val,
            label: t('host.fileIntegrity.txt-' + val),
            options: {
              filter: true,
              sort: true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempFileIntegrityData.dataContent[dataIndex];
                const value = tempFileIntegrityData.dataContent[dataIndex][val];

                if (val === 'detectedDttm' && value) {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                }

                return value;
              }
            }
          };
        });

        tempFileIntegritySearch.count = helper.numberWithCommas(data.count);

        this.setState({
          fileIntegritySearch: tempFileIntegritySearch,
          fileIntegrityData: tempFileIntegrityData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get process monitor data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getProcMonitor = (fromPage) => {
    const {baseUrl} = this.context;
    const {procMonitorSearch, procMonitorData, currentHostId} = this.state;
    const sort = procMonitorData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? procMonitorData.currentPage : 0;
    let url = `${baseUrl}/api/endPoint/processmonitor?page=${page + 1}&pageSize=${procMonitorData.pageSize}`;
    let requestData = {
      hostId: currentHostId
    };

    if (procMonitorData.sort.field) {
      url += `&orders=${procMonitorData.sort.field} ${sort}`;
    }

    if (procMonitorSearch.keyword) {
      //requestData.filePath = procMonitorSearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempProcMonitorSearch = {...procMonitorSearch};
        let tempProcMonitorData = {...procMonitorData};

        if (!data.rows || data.rows.length === 0) {
          tempProcMonitorSearch.count = 0;
          tempProcMonitorData.dataContent = [];
          tempProcMonitorData.totalCount = 0;

          this.setState({
            procMonitorSearch: tempProcMonitorSearch,
            procMonitorData: tempProcMonitorData
          });
          return null;
        }       

        tempProcMonitorData.dataContent = data.rows;
        tempProcMonitorData.totalCount = data.count;
        tempProcMonitorData.currentPage = page;
        tempProcMonitorData.isUploaded = data.isUploaded;
        tempProcMonitorData.hostId = currentHostId;
        tempProcMonitorData.dataFields = _.map(procMonitorData.dataFieldsArr, val => {
          return {
            name: val,
            label: t('host.procMonitor.txt-' + val),
            options: {
              filter: true,
              sort: true,
              setCellHeaderProps: (columnMeta) => {
                if (columnMeta.name === 'detectedDttm')
                  return {style: { width: "180px" }};
                return;
              },
              customBodyRenderLite: (dataIndex) => {
                const value = tempProcMonitorData.dataContent[dataIndex][val];

                if (val === 'detectedDttm' && value) {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                }

                return value;
              }
            }
          };
        });

        tempProcMonitorSearch.count = helper.numberWithCommas(data.count);

        this.setState({
          procMonitorSearch: tempProcMonitorSearch,
          procMonitorData: tempProcMonitorData
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
      tableContextAnchor: null,
      moreContextAnchor: null,
      filterContextAnchor: null
    });
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
   * Toggle show endpoint info
   * @method
   */
  toggleShowEndpoint = () => {
    this.setState({
      showEndpointInfo: !this.state.showEndpointInfo,
      activeEndpointInfo: 'overview'
    }, () => {
      if (!this.state.showEndpointInfo) {
        this.setState({
          safetyScanInfoSearch: _.cloneDeep(SAFETY_SCAN_INFO_SEARCH),
          safetyScanInfoData: _.cloneDeep(SAFETY_SCAN_INFO_DATA),
          softwareInventorySearch: _.cloneDeep(SOFTWARE_INVENTORY_SEARCH),
          softwareInventoryData: _.cloneDeep(SOFTWARE_INVENTORY_INFO_DATA),
          gcbSearch: _.cloneDeep(GCB_SEARCH),
          gcbData: _.cloneDeep(GCB_INFO_DATA),
          discoveredVulnerabilitySearch: _.cloneDeep(DISCOVERED_VULNERABILITY_SEARCH),
          discoveredVulnerabilityData: _.cloneDeep(DISCOVERED_VULNERABILITY_DATA),
          kbidSearch: _.cloneDeep(KBID_SEARCH),
          kbidData: _.cloneDeep(KBID_DATA),
          malwareSearch: _.cloneDeep(MALWARE_SEARCH),
          malwareData: _.cloneDeep(MALWARE_DATA),
          fileIntegritySearch: _.cloneDeep(FILE_INTEGRITY_SEARCH),
          fileIntegrityData: _.cloneDeep(FILE_INTEGRITY_DATA),
          procMonitorSearch: _.cloneDeep(PROC_MONITOR_SEARCH),
          procMonitorData: _.cloneDeep(PROC_MONITOR_DATA)
        });
      }
    });
  }
  /**
   * Handle safety scan info search change
   * @method
   * @param {object} event - event object
   */
  handleSafetyScanInfoSearchChange = (event) => {
    let tempSafetyScanInfoSearch = {...this.state.safetyScanInfoSearch};
    tempSafetyScanInfoSearch[event.target.name] = event.target.value;

    this.setState({
      safetyScanInfoSearch: tempSafetyScanInfoSearch
    });
  }
  /**
   * Handle software inventory search change
   * @method
   * @param {object} event - event object
   */
  handleSoftwareInventorySearchChange = (event) => {
    let tempSoftwareInventorySearch = {...this.state.softwareInventorySearch};
    tempSoftwareInventorySearch[event.target.name] = event.target.value;

    this.setState({
      softwareInventorySearch: tempSoftwareInventorySearch
    });
  }
  /**
   * Handle GCB search change
   * @method
   * @param {object} event - event object
   */
  handleGcbSearchChange = (event) => {
    let tempGcbSearch = {...this.state.gcbSearch};
    tempGcbSearch[event.target.name] = event.target.value;

    this.setState({
      gcbSearch: tempGcbSearch
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
   * Handle KBID search change
   * @method
   * @param {object} event - event object
   */
  handleKbidSearchChange = (event) => {
    let tempKbidSearch = {...this.state.kbidSearch};
    tempKbidSearch[event.target.name] = event.target.value;

    this.setState({
      kbidSearch: tempKbidSearch
    });
  }
  /**
   * Handle malware search change
   * @method
   * @param {object} event - event object
   */
  handleMalwareSearchChange = (event) => {
    let tempMalwareSearch = {...this.state.malwareSearch};
    tempMalwareSearch[event.target.name] = event.target.value;

    this.setState({
      malwareSearch: tempMalwareSearch
    });
  }
  /**
   * Handle file integrity search change
   * @method
   * @param {object} event - event object
   */
  handleFileIntegritySearchChange = (event) => {
    let tempFileIntegritySearch = {...this.state.fileIntegritySearch};
    tempFileIntegritySearch[event.target.name] = event.target.value;

    this.setState({
      fileIntegritySearch: tempFileIntegritySearch
    });
  }
  /**
   * Handle process monitor search change
   * @method
   * @param {object} event - event object
   */
  handleProcMonitorSearchChange = (event) => {
    let tempProcMonitorSearch = {...this.state.procMonitorSearch};
    tempProcMonitorSearch[event.target.name] = event.target.value;

    this.setState({
      procMonitorSearch: tempProcMonitorSearch
    });
  }
  /**
   * Handle reset button
   * @method
   * @param {string} type - reset button type ('endpointsSearch', 'safetyScanInfo', 'softwareInventory', 'discoveredVulnerability', 'kbid', 'malware', 'gcb', 'fileIntegrity' or 'procMonitor')
   */
  handleResetBtn = (type) => {
    const {endpointsSearch, safetyScanInfoSearch, softwareInventorySearch, gcbSearch, discoveredVulnerabilitySearch, kbidSearch, malwareSearch, fileIntegritySearch, procMonitorSearch} = this.state;

    if (type === 'endpointsSearch') {
      let tempEndpointsSearch = {...endpointsSearch};
      tempEndpointsSearch.keyword = '';

      this.setState({
        endpointsSearch: tempEndpointsSearch
      });
    } else if (type === 'safetyScanInfo') {
      let tempSafetyScanInfoSearch = {...safetyScanInfoSearch};
      tempSafetyScanInfoSearch.keyword = '';

      this.setState({
        safetyScanInfoSearch: tempSafetyScanInfoSearch
      });
    } else if (type === 'softwareInventory') {
      let tempSoftwareInventorySearch = {...softwareInventorySearch};
      tempSoftwareInventorySearch.keyword = '';

      this.setState({
        softwareInventorySearch: tempSoftwareInventorySearch
      });
    } else if (type === 'gcb') {
      let tempGcbSearch = {...gcbSearch};
      tempGcbSearch.keyword = '';
      tempGcbSearch.policyName = '';
      tempGcbSearch.type = '';
      tempGcbSearch.compareResult = '';
      
      this.setState({
        gcbSearch: tempGcbSearch
      });
    } else if (type === 'discoveredVulnerability') {
      let tempDiscoveredVulnerabilitySearch = {...discoveredVulnerabilitySearch};
      tempDiscoveredVulnerabilitySearch.keyword = '';
      tempDiscoveredVulnerabilitySearch.fix = '';

      this.setState({
        discoveredVulnerabilitySearch: tempDiscoveredVulnerabilitySearch
      });
    } else if (type === 'kbid') {
      let tempKbidSearch = {...kbidSearch};
      tempKbidSearch.keyword = '';

      this.setState({
        kbidSearch: tempKbidSearch
      });
    } else if (type === 'malware') {
      let tempMalwareSearch = {...malwareSearch};
      tempMalwareSearch.keyword = '';

      this.setState({
        malwareSearch: tempMalwareSearch
      });
    } else if (type === 'fileIntegrity') {
      let tempFileIntegritySearch = {...fileIntegritySearch};
      tempFileIntegritySearch.keyword = '';

      this.setState({
        fileIntegritySearch: tempFileIntegritySearch
      });
    } else if (type === 'procMonitorSearch') {
      let tempProcMonitorSearch = {...procMonitorSearch};
      tempProcMonitorSearch.keyword = '';

      this.setState({
        procMonitorSearch: tempProcMonitorSearch
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
    const url = `${baseUrl}/api/endPoint/memos`;
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
   * Toggle view more dialog
   * @method
   */
  toggleViewMore = () => {
    this.setState({
      modalViewMoreOpen: !this.state.modalViewMoreOpen
    });
  }
   /**
   * Handle trigger button for HMD
   * @method
   * @param {array.<string>} type - HMD scan type
   */
  triggerTask = (type) => {
    const {baseUrl} = this.context;
    const {currentEndpointData} = this.state;
    const url = `${baseUrl}/api/hmd/retrigger`;
    const requestData = {
      hostId: currentEndpointData.hostId,
      cmds: type
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-requestSent'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
   /**
   * Handle update button
   * @method
   */
  handleUpdateButton = () => {
    const {baseUrl} = this.context;
    const {currentHostId} = this.state;
    const url = `${baseUrl}/api/endPoint/upgrade?hostId=${currentHostId}`;

    this.ah.one({
      url,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-requestSent'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display endpoint info content
   * @method
   * @returns HTML DOM
   */
  displayEndpointInfo = () => {
    const {
      activeEndpointInfo,
      safetyScanInfoSearch,
      safetyScanInfoData,
      softwareInventorySearch,
      softwareInventoryData,
      gcbSearch,
      gcbData,
      discoveredVulnerabilitySearch,
      discoveredVulnerabilityData,
      kbidSearch,
      kbidData,
      malwareSearch,
      malwareData,
      fileIntegritySearch,
      fileIntegrityData,
      procMonitorSearch,
      procMonitorData,
      currentEndpointData,
      severityStatistics
    } = this.state;
    const tableOptionsSafetyScanInfo = {
      tableBodyHeight: 'calc(75vh - 240px)',
      onChangePage: (currentPage) => {
        this.handlePaginationChange('safetyScanInfo', 'currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('safetyScanInfo', 'pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort('safetyScanInfo', changedColumn, direction === 'desc');
      }
    };
    const tableOptionsSoftwareInventory = {
      tableBodyHeight: 'calc(75vh - 240px)',
      onChangePage: (currentPage) => {
        this.handlePaginationChange('softwareInventory', 'currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('softwareInventory', 'pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort('softwareInventory', changedColumn, direction === 'desc');
      }
    };
    const tableOptionsGcb = {
      tableBodyHeight: 'calc(75vh - 240px)',
      onChangePage: (currentPage) => {
        this.handlePaginationChange('gcb', 'currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('gcb', 'pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort('gcb', changedColumn, direction === 'desc');
      }
    };
    const tableOptionsDiscoveredVulnerability = {
      tableBodyHeight: 'calc(75vh - 400px)',
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
    const tableOptionsKBID = {
      tableBodyHeight: 'calc(75vh - 240px)',
      onChangePage: (currentPage) => {
        this.handlePaginationChange('kbid', 'currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('kbid', 'pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort('kbid', changedColumn, direction === 'desc');
      }
    };
    const tableOptionsMalware = {
      tableBodyHeight: 'calc(75vh - 240px)',
      onChangePage: (currentPage) => {
        this.handlePaginationChange('malware', 'currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('malware', 'pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort('malware', changedColumn, direction === 'desc');
      }
    };
    const tableOptionsFileIntegrity = {
      tableBodyHeight: 'calc(75vh - 185px)',
      onChangePage: (currentPage) => {
        this.handlePaginationChange('fileIntegrity', 'currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('fileIntegrity', 'pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort('fileIntegrity', changedColumn, direction === 'desc');
      }
    };
    const tableOptionsProcMonitor = {
      tableBodyHeight: 'calc(75vh - 185px)',
      renderExpandableRow: (rowData, rowMeta) => {
        let allValue = procMonitorData.dataContent[rowMeta.dataIndex];

        return (
          <TableRow>
            <TableCell />
            <TableCell colSpan={2} className="proc-monitor-accordion">
              <Accordion>
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                >
                  DLLs
                </AccordionSummary>
                <AccordionDetails>
                  {_.map(allValue.dlls, (dll, i) => {
                    return <span key={i}>{dll}</span>
                  })}
                  {(!allValue.dlls || allValue.dlls.length === 0) &&
                    <span>{NOT_AVAILABLE}</span>
                  }
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                >
                  {t('txt-executableInfo')}
                </AccordionSummary>
                <AccordionDetails>
                  {_.map(['autorunLocation', 'commandLine', 'companyName', 'filePath', 'fileSize', 'fileMD5', 'fileSHA1', 'fileSHA256', 'isPE', 'userSid', 'signatures'], data => {
                    let dataValue = NOT_AVAILABLE;
                    if (data === 'isPE') {
                      return <span key={data}><span className='proc-monitor-label'>{t('host.procMonitor.txt-' + data)}</span><span className={'true-false-status true-false-status-' + allValue[data]}>{t('txt-' + allValue[data])}</span></span>
                    } else if (data === 'signatures') {
                      // currently no value
                    } else if (allValue[data].length > 0) {
                      dataValue = allValue[data];
                    }
                    return <span key={data}><span className='proc-monitor-label'>{t('host.procMonitor.txt-' + data)}</span>{dataValue}</span>
                  })}
                </AccordionDetails>
              </Accordion>
            </TableCell>
          </TableRow>
        );
      },
      onChangePage: (currentPage) => {
        this.handlePaginationChange('procMonitor', 'currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('procMonitor', 'pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort('procMonitor', changedColumn, direction === 'desc');
      }
    };

    return (
      <div>
        <ToggleButtonGroup
          id='activeEndpointInfoButtons'
          value={activeEndpointInfo}
          exclusive
          onChange={this.toggleEndpointButtons}>
          <ToggleButton id='hostDialogOverview' value='overview' data-cy='hostInfoDialogOverviewBtn'>{t('host.endpoints.txt-overview')}</ToggleButton>
          <ToggleButton id='hostDialogdiscoveredVulnerability' value='discoveredVulnerability' data-cy='hostInfoDialogVulnerabilityBtn'>{t('host.endpoints.txt-discoveredVulnerability')}</ToggleButton>
          <ToggleButton id='hostDialogKbid' value='kbid' data-cy='hostInfoDialogKbidBtn'>{t('host.endpoints.txt-kbid')}</ToggleButton>
          <ToggleButton id='hostDialogInventory' value='softwareInventory' data-cy='hostInfoDialogInventoryBtn'>{t('host.endpoints.txt-softwareInventory')}</ToggleButton>
          <ToggleButton id='hostDialogGcb' value='gcb' data-cy='hostInfoDialogGcbBtn'>{t('host.endpoints.txt-gcb')}</ToggleButton>
          <ToggleButton id='hostDialogMalware' value='malware' data-cy='hostInfoDialogMalwareBtn'>{t('host.endpoints.txt-malware')}</ToggleButton>
          <ToggleButton id='hostDialogFileIntegrity' value='fileIntegrity' data-cy='hostInfoDialogFileIntegrityBtn'>{t('host.endpoints.txt-fileIntegrity')}</ToggleButton>
          <ToggleButton id='hostDialogProcMonitor' value='procMonitor' data-cy='hostInfoDialogProcMonitorBtn'>{t('host.endpoints.txt-procMonitor')}</ToggleButton>
          <ToggleButton id='hostDialogSafetyScanInfo' value='safetyScanInfo' data-cy='hostInfoDialogSafetyScanBtn'>{t('host.endpoints.txt-safetyScanInfo')}</ToggleButton>
        </ToggleButtonGroup>

        <div className='main-content'>
          {activeEndpointInfo === 'overview' &&
            <GeneralDialog
              page='endpoints'
              type='general-info'
              data={currentEndpointData}
              alertLevelColors={ALERT_LEVEL_COLORS}
              toggleViewMore={this.toggleViewMore}
              triggerTask={this.triggerTask}
              handleUpdateButton={this.handleUpdateButton} />
          }

          {activeEndpointInfo === 'safetyScanInfo' &&
            <GeneralDialog
              page='endpoints'
              type='general-list'
              searchType={activeEndpointInfo}
              search={safetyScanInfoSearch}
              data={safetyScanInfoData}
              tableOptions={tableOptionsSafetyScanInfo}
              handleSearchChange={this.handleSafetyScanInfoSearchChange}
              handleSearchSubmit={this.getSafetyScanInfo}
              handleResetBtn={this.handleResetBtn} />
          }

          {activeEndpointInfo === 'softwareInventory' &&
            <GeneralDialog
              page='endpoints'
              type='general-list'
              searchType={activeEndpointInfo}
              search={softwareInventorySearch}
              data={softwareInventoryData}
              tableOptions={tableOptionsSoftwareInventory}
              handleSearchChange={this.handleSoftwareInventorySearchChange }
              handleSearchSubmit={this.getSoftwareInventory}
              handleResetBtn={this.handleResetBtn} />
          }

          {activeEndpointInfo === 'gcb' &&
            <GeneralDialog
              page='endpoints'
              type='general-list'
              searchType={activeEndpointInfo}
              search={gcbSearch}
              data={gcbData}
              tableOptions={tableOptionsGcb}
              handleSearchChange={this.handleGcbSearchChange }
              handleSearchSubmit={this.getGcb}
              handleResetBtn={this.handleResetBtn} />
          }

          {activeEndpointInfo === 'discoveredVulnerability' &&
            <GeneralDialog
              page='endpoints'
              type='general-list'
              searchType={activeEndpointInfo}
              search={discoveredVulnerabilitySearch}
              data={discoveredVulnerabilityData}
              tableOptions={tableOptionsDiscoveredVulnerability}
              severityStatistics={severityStatistics}
              severityColors={SEVERITY_COLORS}
              handleSearchChange={this.handleDiscoveredVulnerabilitySearchChange}
              handleSearchSubmit={this.getDiscoveredVulnerability}
              handleResetBtn={this.handleResetBtn} />
          }

          {activeEndpointInfo === 'kbid' &&
            <GeneralDialog
              page='endpoints'
              type='general-list'
              searchType={activeEndpointInfo}
              search={kbidSearch}
              data={kbidData}
              tableOptions={tableOptionsKBID}
              handleSearchChange={this.handleKbidSearchChange}
              handleSearchSubmit={this.getKBID}
              handleResetBtn={this.handleResetBtn} />
          }

          {activeEndpointInfo === 'malware' &&
            <GeneralDialog
              page='endpoints'
              type='general-list'
              searchType={activeEndpointInfo}
              search={malwareSearch}
              data={malwareData}
              tableOptions={tableOptionsMalware}
              handleSearchChange={this.handleMalwareSearchChange}
              handleSearchSubmit={this.getMalware}
              handleResetBtn={this.handleResetBtn} />
          }

          {activeEndpointInfo === 'fileIntegrity' &&
            <GeneralDialog
              page='endpoints'
              type='general-list'
              searchType={activeEndpointInfo}
              search={fileIntegritySearch}
              data={fileIntegrityData}
              tableOptions={tableOptionsFileIntegrity}
              handleSearchChange={this.handleFileIntegritySearchChange}
              handleSearchSubmit={this.getFileIntegrity}
              handleResetBtn={this.handleResetBtn} />
          }

          {activeEndpointInfo === 'procMonitor' &&
            <GeneralDialog
              page='endpoints'
              type='general-list'
              searchType={activeEndpointInfo}
              search={procMonitorSearch}
              data={procMonitorData}
              tableOptions={tableOptionsProcMonitor}
              resizableColumns={false}
              expandableRows={true}
              handleSearchChange={this.handleProcMonitorSearchChange}
              handleSearchSubmit={this.getProcMonitor}
              handleResetBtn={this.handleResetBtn} />
          }
        </div>
      </div>
    )
  }
  /**
   * Show endpoint info dialog
   * @method
   * @returns ModalDialog component
   */
  showEndpointDialog = () => {
    const {currentEndpointData} = this.state;
    const actions = {
      cancel: {text: t('txt-close'), handler: this.toggleShowEndpoint}
    };
    let title = t('host.txt-endpoints');

    if (currentEndpointData.hostName) {
      title +=  ' > ' + currentEndpointData.hostName;
    }

    return (
      <ModalDialog
        id='showEndpointDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayEndpointInfo()}
      </ModalDialog>
    )
  }
  /**
   * Handle table sort
   * @method
   * @param {string} tableType - table type ('endpoints', 'safetyScanInfo', 'softwareInventory', 'discoveredVulnerability', 'kbid', 'malware', 'gcb', 'fileIntegrity' or 'procMonitor')
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (tableType, field, sort) => {
    const {endpointsData, safetyScanInfoData, softwareInventoryData, gcbData, discoveredVulnerabilityData, kbidData, malwareData, fileIntegrityData, procMonitorData} = this.state;
    let tempEndpointsData = {...endpointsData};
    let tempSafetyScanInfoData = {...safetyScanInfoData};
    let tempSoftwareInventoryData = {...softwareInventoryData};
    let tempGcbData = {...gcbData};
    let tempDiscoveredVulnerabilityData = {...discoveredVulnerabilityData};
    let tempKbidData = {...kbidData};
    let tempMalwareData = {...malwareData};
    let tempFileIntegrityData = {...fileIntegrityData};
    let tempProcMonitorData = {...procMonitorData};
    let tableField = field;

    if (tableType === 'endpoints') {
      tempEndpointsData.sort.field = tableField;
      tempEndpointsData.sort.desc = sort;

      this.setState({
        endpointsData: tempEndpointsData
      }, () => {
        this.getEndpointsData();
      });
    } else if (tableType === 'safetyScanInfo') {
      tempSafetyScanInfoData.sort.field = tableField;
      tempSafetyScanInfoData.sort.desc = sort;

      this.setState({
        safetyScanInfoData: tempSafetyScanInfoData
      }, () => {
        this.getSafetyScanInfo();
      });
    } else if (tableType === 'softwareInventory') {
      tempSoftwareInventoryData.sort.field = tableField;
      tempSoftwareInventoryData.sort.desc = sort;

      this.setState({
        softwareInventoryData: tempSoftwareInventoryData
      }, () => {
        this.getSoftwareInventory();
      });
    } else if (tableType === 'gcb') {
      tempGcbData.sort.field = tableField;
      tempGcbData.sort.desc = sort;

      this.setState({
        gcbData: tempGcbData
      }, () => {
        this.getGcb();
      });
    } else if (tableType === 'discoveredVulnerability') {
      tempDiscoveredVulnerabilityData.sort.field = tableField;
      tempDiscoveredVulnerabilityData.sort.desc = sort;

      this.setState({
        discoveredVulnerabilityData: tempDiscoveredVulnerabilityData
      }, () => {
        this.getDiscoveredVulnerability();
      });
    } else if (tableType === 'kbid') {
      tempKbidData.sort.field = tableField;
      tempKbidData.sort.desc = sort;

      this.setState({
        kbidData: tempKbidData
      }, () => {
        this.getKBID();
      });
    } else if (tableType === 'malware') {
      tempMalwareData.sort.field = tableField;
      tempMalwareData.sort.desc = sort;

      this.setState({
        malwareData: tempMalwareData
      }, () => {
        this.getMalware();
      });
    } else if (tableType === 'fileIntegrity') {
      tempFileIntegrityData.sort.field = tableField;
      tempFileIntegrityData.sort.desc = sort;

      this.setState({
        fileIntegrityData: tempFileIntegrityData
      }, () => {
        this.getFileIntegrity();
      });
    } else if (tableType === 'procMonitor') {
      tempProcMonitorData.sort.field = tableField;
      tempProcMonitorData.sort.desc = sort;

      this.setState({
        procMonitorData: tempProcMonitorData
      }, () => {
        this.getProcMonitor();
      });
    }
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} tableType - table type ('endpoints', 'safetyScanInfo', 'softwareInventory', 'discoveredVulnerability', 'kbid', 'malware', 'gcb', 'fileIntegrity' or 'procMonitor')
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (tableType, type, value) => {
    const {endpointsData, safetyScanInfoData, softwareInventoryData, gcbData, discoveredVulnerabilityData, kbidData, malwareData, fileIntegrityData, procMonitorData} = this.state;
    let tempEndpointsData = {...endpointsData};
    let tempSafetyScanInfoData = {...safetyScanInfoData};
    let tempSoftwareInventoryData = {...softwareInventoryData};
    let tempGcbData = {...gcbData};
    let tempDiscoveredVulnerabilityData = {...discoveredVulnerabilityData};
    let tempKbidData = {...kbidData};
    let tempMalwareData = {...malwareData};
    let tempFileIntegrityData = {...fileIntegrityData};
    let tempProcMonitorData = {...procMonitorData};

    if (tableType === 'endpoints') {
      tempEndpointsData[type] = value;

      this.setState({
        endpointsData: tempEndpointsData
      }, () => {
        this.getEndpointsData(type);
      });
    } else if (tableType === 'safetyScanInfo') {
      tempSafetyScanInfoData[type] = value;

      this.setState({
        safetyScanInfoData: tempSafetyScanInfoData
      }, () => {
        this.getSafetyScanInfo(type);
      });
    } else if (tableType === 'softwareInventory') {
      tempSoftwareInventoryData[type] = value;

      this.setState({
        softwareInventoryData: tempSoftwareInventoryData
      }, () => {
        this.getSoftwareInventory(type);
      });
    } else if (tableType === 'gcb') {
      tempGcbData[type] = value;

      this.setState({
        gcbData: tempGcbData
      }, () => {
        this.getGcb(type);
      });
    } else if (tableType === 'discoveredVulnerability') {
      tempDiscoveredVulnerabilityData[type] = value;

      this.setState({
        discoveredVulnerabilityData: tempDiscoveredVulnerabilityData
      }, () => {
        this.getDiscoveredVulnerability(type);
      });
    } else if (tableType === 'kbid') {
      tempKbidData[type] = value;

      this.setState({
        kbidData: tempKbidData
      }, () => {
        this.getKBID(type);
      });
    } else if (tableType === 'malware') {
      tempMalwareData[type] = value;

      this.setState({
        malwareData: tempMalwareData
      }, () => {
        this.getMalware(type);
      });
    } else if (tableType === 'fileIntegrity') {
      tempFileIntegrityData[type] = value;

      this.setState({
        fileIntegrityData: tempFileIntegrityData
      }, () => {
        this.getFileIntegrity(type);
      });
    } else if (tableType === 'procMonitor') {
      tempProcMonitorData[type] = value;

      this.setState({
        procMonitorData: tempProcMonitorData
      }, () => {
        this.getProcMonitor(type);
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
    tempEndpointsSearch[event.target.name] = event.target.value;

    this.setState({
      endpointsSearch: tempEndpointsSearch
    });
  }
  /**
   * Show filter query
   * @method
   */
  handleShowFilterQuery = (type) => {
    if (type === 'load') {
      this.fetchFilterQuery()
    }

    this.setState({
      showFilterQuery: true,
      showFilterType: type,
      filterContextAnchor: null
    });
  }
  handleFilterQuery = (type, filterData) => {
    if (type !== 'cancel') {
      let filterDataCount = 0;
      _.forEach(filterData.filter, (val, key) => {
        if (typeof val === 'string') {
          if (val !== '')
            filterDataCount++;

        } else if (Array.isArray(val)) {
          if (val.length > 0 && val[0].input !== '')
            filterDataCount++;

        } else {
          filterDataCount++;
        }
      })

      this.setState({
        systemList: filterData.systemList,
        endpointsFilter: filterData.filter,
        endpointsFilterList: filterData.itemFilterList,
        filterDataCount
      }, () => {
        this.getEndpointsData();
        if (type === 'save')
          this.saveFilterQuery(filterData.queryName);
      });
    }

    this.setState({
      showFilterQuery: false,
      filterContextAnchor: null
    });
  }
  handleDeleteFilterQuery = (id, queryName) => {
    PopupDialog.prompt({
      title: t('txt-deleteQuery'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: <div className='content delete'><span>{t('txt-delete-msg')}: {queryName}?</span></div>,
      act: (confirmed) => {
        if (confirmed) {
          this.deleteFilterQuery(id);
        }
      }
    });
  }
  fetchFilterQuery = () => {
    const {baseUrl} = this.context;
    const {account, severityType} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/account/queryText?accountId=${account.id}&module=ENDPOINTS`,
      type: 'GET',
      pcontentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let filterQueryList = _.map(data, filter => {
          let newFilter = {
            id: filter.id,
            name: filter.name,
            content: _.cloneDeep(ENDPOINTS_FILTER_LIST)
          };

          if (filter.queryText) {
            let conditionMode = _.invert(CONDITION_MODE);
            let content = {
              connectionStatus: filter.queryText.statusArray ? _.map(filter.queryText.statusArray, status => ({value: status, text: t('txt-' + status)})) : [],
              departmentSelected: filter.queryText.departmentArray ? filter.queryText.departmentArray : [],
              fileIntegrity: filter.queryText.fileIntegrityEnable === true ? 'isEnabled' : filter.queryText.fileIntegrityEnable === false ? 'isDisabled' : '',
              memos: filter.queryText.memos ? _.map(filter.queryText.memos, memo => ({input: memo})) : [],
              procMonitor: filter.queryText.processMonitorEnable ? 'isEnabled' : filter.queryText.processMonitorEnable === false ? 'isDisabled' : '',
              risk: filter.queryText.riskArray ? _.map(filter.queryText.riskArray, risk => (_.find(severityType, ['value', _.lowerCase(risk)]))) : [],
              riskValue: filter.queryText.riskValueArray ? _.map(filter.queryText.riskValueArray, riskValue => ({condition: conditionMode[riskValue.mode], input: riskValue.riskValue})) : [],
              version: filter.queryText.versionArray ? _.map(filter.queryText.versionArray, version => ({value: version, text: t('txt-' + version)})) : [],
              system: filter.queryText.systemArray ? _.map(filter.queryText.systemArray, system => (system === 'noExist' ? 'noSystem' : system)) : [],
            }
            newFilter.content = content;
          }
          return newFilter;
        });

        this.setState({filterQueryList});
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  saveFilterQuery = (queryName) => {
    const {baseUrl} = this.context;
    const {account} = this.state;

    const requestData = {
      ...this.getEndpointsFilterRequestData()
    };

    this.ah.one({
      url: `${baseUrl}/api/account/queryText`,
      data: JSON.stringify({
        accountId: account.id,
        module: 'ENDPOINTS',
        name: queryName,
        queryText: requestData
      }),
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-querySaved'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  deleteFilterQuery = (id) => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/account/queryText?id=${id}`,
      type: 'DELETE',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.fetchFilterQuery();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
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
   * Handle more open menu
   * @method
   * @param {object} event - event object
   */
  handleMoreOpenMenu = (event) => {
    this.setState({
      moreContextAnchor: event.currentTarget
    });
  }
  executeMoreAction = (type, hmdObj) => {
    this.openConfirmModal(type, hmdObj)
  }
  handleFilterOpenMenu = (event) => {
    this.setState({
      filterContextAnchor: event.currentTarget
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
    let url = `${baseUrl}${contextRoot}/api/endPoint/_export`;
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
   * Show bar chart
   * @method
   * @param {object} val - chart data
   * @param {number} i - index of the chart data
   * @returns HTML DOM
   */
  showBarChart = (val, i) => {
    return (
      <div key={val.id} className='chart-group'>
        {!val.data &&
          <div className='empty-data'>
            <header>{val.title}</header>
            <span><i className='fg fg-loading-2'></i></span>
          </div>
        }
        {val.data && val.data.length === 0 &&
          <div className='empty-data'>
            <header>{val.title}</header>
            <span>{t('txt-notFound')}</span>
          </div>
        }
        {val.data && val.data.length > 0 &&
          <BarChart
            stacked
            vertical
            title={val.title}
            legend={{
              enabled: true
            }}
            data={val.data}
            colors={ALERT_LEVEL_COLORS}
            dataCfg={{
              x: 'department',
              y: 'count',
              splitSeries: val.type
            }}
            xAxis={{
              type: 'category'
            }}
            yAxis={{
              allowDecimals: false
            }}
            plotOptions={{
              series: {
                maxPointWidth: 20
              }
            }}
            tooltip={{
              formatter: this.onTooltip.bind(this, val.type)
            }} />
        }
      </div>
    )
  }
  /**
   * Show tooltip info when mouseover the chart
   * @method
   * @param {string} type - chart type ('status', 'version' or 'severity')
   * @param {object} eventInfo - MouseoverEvents
   * @param {array.<object>} data - chart data
   * @returns HTML DOM
   */
  onTooltip = (type, eventInfo, data) => {
    return (
      <section>
        <span>{t('txt-department')}: {data[0].department}<br /></span>
        <span>{t('txt-' + type)}: {data[0][type]}<br /></span>
        <span>{t('txt-count')}: {helper.numberWithCommas(data[0].count)}</span>
      </section>
    )
  }
  /**
   * Show pie chart
   * @method
   * @param {object} val - chart data
   * @param {number} i - index of the chart data
   * @returns HTML DOM
   */
  showPieChart = (val, i) => {
    return (
      <div key={val.id} className='chart-group'>
        {!val.data &&
          <div className='empty-data'>
            <header>{val.title}</header>
            <span><i className='fg fg-loading-2'></i></span>
          </div>
        }
        {val.data && val.data.length === 0 &&
          <div className='empty-data'>
            <header>{val.title}</header>
            <span>{t('txt-notFound')}</span>
          </div>
        }
        {val.data && val.data.length > 0 &&
          <PieChart
            title={val.title}
            holeSize={45}
            centerText={t('txt-total') + ': ' + helper.numberWithCommas(val.count)}
            data={val.data}
            colors={{
              key: ALERT_LEVEL_COLORS
            }}
            keyLabels={{
              key: val.label,
              doc_count: t('txt-count')
            }}
            valueLabels={{
              'Pie Chart': {
                key: val.label,
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
   * Display confirm content
   * @method
   * @param {string} type - action type ('start' or 'stop')
   * @param {string} name - action name
   * @returns HTML DOM
   */
  getConfirmContent = (type, name) => {
    let text = '';

    if (type === 'start') {
      text = t('txt-confirmProceed') + ': ' + name;
    } else if (type === 'stop') {
      text = t('txt-confirmTerminate') + ': ' + name;
    }

    return (
      <div className='content'>
        <span>{text}?</span>
      </div>
    )
  }
  /**
   * Show the confirm modal dialog
   * @method
   * @param {string} type - action type ('start' or 'stop')
   * @param {object} hmdObj - HMD object
   */
  openConfirmModal = (type, hmdObj) => {
    PopupDialog.prompt({
      id: 'modalWindowSmall',
      confirmText: t('txt-confirm'),
      cancelText: t('txt-cancel'),
      display: this.getConfirmContent(type, hmdObj.name),
      act: (confirmed) => {
        if (confirmed) {
          if (type === 'start') {
            if (hmdObj.type === 'hmdUpgrade') {
              this.handleHmdUpgrade(hmdObj);
            } else {
              this.triggerHmdAll(hmdObj);
            }
          } else if (type === 'stop') {
            this.stopHmd(hmdObj);
          }
        }
      }
    });
    this.handleCloseMenu();
  }
  /**
   * Handle HMD upgrade action
   * @method
   * @param {object} hmdObj - HMD object
   */
  handleHmdUpgrade = (hmdObj) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/endPoint/_upgrade/batch`;
    const requestData = {
      ...this.getEndpointsFilterRequestData()
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.setState({
      requestSentOpen: true
    });
  }
  /**
   * Handle trigger button for HMD trigger all
   * @method
   * @param {object} hmdObj - HMD object
   */
  triggerHmdAll = (hmdObj) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/endPoint/_retrigger/batch`;
    let requestData = {
      ...this.getEndpointsFilterRequestData(),
      cmdJO: {
        cmds: [hmdObj.cmds]
      }
    };
    
    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.setState({
      requestSentOpen: true
    });

    this.handleCloseMenu();
  }
  /**
   * Stop HMD
   * @method
   * @param {object} hmdObj - HMD object
   */
  stopHmd = (hmdObj) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/endPoint/_retrigger/batch`;
    const requestData = {
      ...this.getEndpointsFilterRequestData(),
      cmdJO: {
        cmds: ['resetTaskConfig'],
        taskThreads: [
          {
            _Name: hmdObj.stop,
            _Enable: false
          }
        ]
      }
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.setState({
      requestSentOpen: true
    });

    this.handleCloseMenu();
  }
  /**
   * Display request sent dialog
   * @method
   * @returns ModalDialog component
   */
  requestSentDialog = () => {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.confirmRequestSent}
    };

    return (
      <ModalDialog
        id='requestSentDialog'
        className='modal-dialog'
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
          <div className='msg'>{t('txt-requestSent')}</div>
      </ModalDialog>
    )
  }
  /**
   * Handle HMD setup file upload
   * @method
   * @param {object} file - file uploaded by the user
   */
  getHmdSetupFile = (file) => {
    this.setState({
      hmdFile: file
    });
  }
  /**
   * Handle upload HMD setup file
   * @method
   * @returns ModalDialog component
   */
  uploadHmdFileDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleHmdUploadFile},
      confirm: {text: t('txt-confirm'), handler: this.confirmHmdFileUpload}
    };
    const title = t('hmd-scan.txt-uploadHMDfile');
    const fileTitle = t('hmd-scan.txt-hmdSetupFile') + '(.zip)';

    return (
      <ModalDialog
        id='hmdFileUploadDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        <FileUpload
          id='fileUpload'
          fileType='indicators'
          supportText={fileTitle}
          btnText={t('txt-upload')}
          handleFileChange={this.getHmdSetupFile} />
      </ModalDialog>
    )
  }
  /**
   * Handle HMD file upload confirm
   * @method
   */
  confirmHmdFileUpload = () => {
    const {baseUrl} = this.context;
    const {hmdFile} = this.state;
    let formData = new FormData();
    formData.append('file', hmdFile);

    if (!hmdFile.name) {
      return;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    this.ah.one({
      url: `${baseUrl}/api/hmd/setupFile/_upload`,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-uploadSuccess'));

        this.setState({
          hmdFile: {}
        });

        this.toggleHmdUploadFile();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Confirm request sent
   * @method
   */
  confirmRequestSent = () => {
    this.setState({
      requestSentOpen: false
    });
  }
  /**
   * Toggle HMD file upload dialog on/off
   * @method
   */
  toggleHmdUploadFile = () => {
    this.setState({
      uploadHmdFileOpen: !this.state.uploadHmdFileOpen
    });

    this.handleCloseMenu();
  }
  toggleHmdSettings = () => {
    this.setState({
      hmdSettingsOpen: !this.state.hmdSettingsOpen
    });

    this.handleCloseMenu();
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
      version,
      fileIntegrity,
      procMonitor,
      importDialogOpen,
      modalViewMoreOpen,
      requestSentOpen,
      uploadHmdFileOpen,
      hmdSettingsOpen,
      endpointsSearch,
      endpointsFilter,
      endpointsFilterList,
      filterDataCount,
      filterQueryList,
      departmentStatisticsAdmin,
      departmentStatistics,
      showMemoInfo,
      showEndpointInfo,
      exportContextAnchor,
      tableContextAnchor,
      moreContextAnchor,
      filterContextAnchor,
      showFilterQuery,
      showFilterType,
      endpointsData,
      currentEndpointData
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

        {showEndpointInfo &&
          this.showEndpointDialog()
        }

        {modalViewMoreOpen &&
          <HMDmoreInfo
            hostData={currentEndpointData}
            toggleViewMore={this.toggleViewMore} />
        }

        {requestSentOpen &&
          this.requestSentDialog()
        }

        {uploadHmdFileOpen &&
          this.uploadHmdFileDialog()
        }

        {hmdSettingsOpen &&
          <HMDsettings mode={'modal'} onClose={this.toggleHmdSettings} />
        }

        {showFilterQuery &&
          <FilterQuery
            page='endpoints'
            showFilterType={showFilterType}
            account={account}
            departmentList={departmentList}
            limitedDepartment={limitedDepartment}
            departmentNameMapping={departmentNameMapping}
            originalSystemList={originalSystemList}
            systemList={systemList}
            severityType={severityType}
            connectionStatus={connectionStatus}
            version={version}
            fileIntegrity={fileIntegrity}
            procMonitor={procMonitor}
            filterList={FILTER_LIST}
            originalFilter={ENDPOINTS_FILTER}
            filter={endpointsFilter}
            originalItemFilterList={ENDPOINTS_FILTER_LIST}
            itemFilterList={endpointsFilterList}
            toggleCsvImport={this.toggleCsvImport}
            onFilterQuery={this.handleFilterQuery}
            onDeleteFilterQuery={this.handleDeleteFilterQuery}
            filterQueryList={filterQueryList} />
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
                {departmentStatisticsAdmin.map(this.showBarChart)}
                {departmentStatistics.map(this.showPieChart)}
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
              moreAnchor={moreContextAnchor}
              filterAnchor={filterContextAnchor}
              getData={this.getEndpointsData}
              getActiveData={this.getActiveEndpointInfo}
              toggleShowMemo={this.toggleShowMemo}
              executeMoreAction={this.executeMoreAction}
              exportList={this.exportEndpointsList}
              onFilterQueryClick={this.handleShowFilterQuery}
              toggleHmdUploadFile={this.toggleHmdUploadFile}
              toggleHmdSettings={this.toggleHmdSettings}
              filterDataCount={filterDataCount}
              handleSearch={this.handleCpeChange}
              handleReset={this.handleResetBtn}
              handleExportMenu={this.handleExportOpenMenu}
              handleMoreMenu={this.handleMoreOpenMenu}
              handleFilterMenu={this.handleFilterOpenMenu}
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