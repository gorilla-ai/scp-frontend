import React, { Component, Fragment } from 'react'
import _ from 'lodash'
import moment from 'moment'

import Button from '@material-ui/core/Button'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'

import BarChart from 'react-chart/build/src/components/bar'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import {downloadWithForm} from 'react-ui/build/src/utils/download'

import {BaseDataContext} from '../common/context'
import FilterQuery from './common/filter-query'
import GeneralDialog from './common/general-dialog'
import helper from '../common/helper'
import HostMenu from './common/host-menu'
import TableList from './common/table-list'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const FILTER_LIST = [
  {
    name: 'departmentSelected',
    displayType: 'text_field',
    filterType: 'tree'
  },
  {
    name: 'type',
    displayType: 'text_field'
  },
  {
    name: 'policyName',
    displayType: 'text_field'
  }
];
const GCB_SEARCH = {
  keyword: '',
  count: 0
};
const GCB_FILTER = {
  departmentSelected: [],
  type: '',
  policyName: ''
};
const GCB_FILTER_LIST = {
  departmentSelected: []
};
const EXPOSED_DEVICES_SEARCH = {
  hostName: '',
  ip: '',
  system: '',
  compareResult: 'all',
  count: 0
};
const EXPOSED_DEVICES_DATA = {
  dataFieldsArr: ['hostName', 'departmentName', 'ip', 'system', 'compareResult', 'gcbValue', 'gpoValue'],
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
let GCB_STATUS_COLORS = {};

let t = null;
let f = null;

/**
 * Host Gcb
 * @class
 * @summary A react component to show the Host gcb page
 */
class HostGcb extends Component {
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
      gcbSearch: _.cloneDeep(GCB_SEARCH),
      gcbFilter: _.cloneDeep(GCB_FILTER),
      gcbFilterList: _.cloneDeep(GCB_FILTER_LIST),
      filterDataCount: 0,
      exportContextAnchor: null,
      tableContextAnchor: null,
      filterContextAnchor: null,
      top10GcbEndpointCounts: null,
      dailyFoundGcbs: null,
      showGcbInfo: false,
      showFilterQuery: false,
      showFilterType: 'open', // 'open', 'load', 'save'
      filterQueryList: [],
      activeGcbInfo: 'gcbDetails', //'gcbDetails' or 'exposedDevices'
      gcbData: {
        dataFieldsArr: ['_menu', 'originalKey', 'policyName', 'type', 'successExposedDevices'],
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
      currentOriginalKey: '',
      currentGcbData: {
        dataFieldsArr: ['cceId', 'twGcbId', 'type', 'policyName', 'securityCategory', 'srcFile', 'srcFilePath'],
        dataContent: null,
        gcbDevicesCount: null
      },
      exportGcbDataFieldsArr: ['originalKey', 'cceId', 'twGcbId', 'type', 'policyName', 'successExposedDevices', 'failExposedDevices'],
      exportHostDataFieldsArr: ['hostName', 'departmentName', 'ip', 'originalKey', 'cceId', 'twGcbId', 'type', 'policyName', 'successExposedDevices', 'failExposedDevices']
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
      GCB_STATUS_COLORS = {
        Success: '#7ACC29',
        Fail: '#CC2943'
      };
    } else if (locale === 'zh') {
      GCB_STATUS_COLORS = {
        成功: '#7ACC29',
        失敗: '#CC2943'
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
            this.getGcbStatisticData();
            this.getGcbData();
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
    const {account, departmentNameMapping, gcbFilter, gcbFilterList} = this.state;
    let tempGcbFilter = {...gcbFilter};
    let tempGcbFilterList = {...gcbFilterList};

    this.ah.one({
      url: `${baseUrl}/api/department/child/_set?id=${account.departmentId}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        tempGcbFilter.departmentSelected = data;
        tempGcbFilterList.departmentSelected = _.map(data, val => {
          return departmentNameMapping[val];
        });

        this.setState({
          limitedDepartment: data,
          gcbFilter: tempGcbFilter,
          gcbFilterList: tempGcbFilterList
        }, () => {
          this.getGcbStatisticData();
          this.getGcbData();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set gcb chart data
   * @method
   */
  getGcbStatisticData = () => {
    const {baseUrl} = this.context;
    const {gcbFilter} = this.state;
    let requestData = {};

    if (gcbFilter.departmentSelected.length > 0) {
      requestData.departmentArray = gcbFilter.departmentSelected;
    }

    //Horizontal Bar Chart
    this.ah.one({
      url: `${baseUrl}/api/hmd/gcb/endpoint/count`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.setState({
          top10GcbEndpointCounts: data.rows
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    //Bar Chart
    this.ah.one({
      url: `${baseUrl}/api/hmd/gcb/daily/statistics`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let dailyFoundGcbs = [];

        _.keys(data.gcbCountAgg)
        .forEach(key => {
          _.keys(data.gcbCountAgg[key])
          .forEach(key2 => {
            if (data.gcbCountAgg[key][key2] >= 0) {
              dailyFoundGcbs.push({
                date: key2,
                count: data.gcbCountAgg[key][key2],
                indicator: t('host.gcb.txt-' + key)
              })
            }
          })
        });

        this.setState({
          dailyFoundGcbs: _.reverse(dailyFoundGcbs)
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Show bar chart
   * @method
   * @param {array.<object>} dailyFoundGcbs - chart data
   * @returns HTML DOM
   */
  showBarChart = (dailyFoundGcbs) => {
    return (
      <div className='chart-group grow-2'>
        {!dailyFoundGcbs &&
          <div className='empty-data'>
            <header>{t('host.gcb.txt-dailyFoundGcbs')}</header>
            <span><i className='fg fg-loading-2'></i></span>
          </div>
        }
        {dailyFoundGcbs && dailyFoundGcbs.length === 0 &&
          <div className='empty-data'>
            <header>{t('host.gcb.txt-dailyFoundGcbs')}</header>
            <span>{t('txt-notFound')}</span>
          </div>
        }
        {dailyFoundGcbs && dailyFoundGcbs.length > 0 &&
          <BarChart
            stacked
            vertical
            title={t('host.gcb.txt-dailyFoundGcbs')}
            legend={{
              enabled: true,
              reversed: true
            }}
            data={dailyFoundGcbs}
            colors={GCB_STATUS_COLORS}
            dataCfg={{
              x: 'date',
              y: 'count',
              splitSeries: 'indicator'
            }}
            xAxis={{
              type: 'datetime',
              labels: {
                rotation: -45,
                format: '{value:%Y/%m/%d}'
              }
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
  showHorizontalBarChart = (top10GcbEndpointCounts) => {
    return (
      <div className='chart-group'>
        {!top10GcbEndpointCounts &&
          <div className='empty-data'>
            <header>{t('host.gcb.txt-top10GcbEndpointCounts')}</header>
            <span><i className='fg fg-loading-2'></i></span>
          </div>
        }
        {top10GcbEndpointCounts && top10GcbEndpointCounts.length === 0 &&
          <div className='empty-data'>
            <header>{t('host.gcb.txt-top10GcbEndpointCounts')}</header>
            <span>{t('txt-notFound')}</span>
          </div>
        }
        {top10GcbEndpointCounts && top10GcbEndpointCounts.length > 0 &&
          <div className='empty-data'>
            <header>{t('host.gcb.txt-top10GcbEndpointCounts')}</header>
            <table className='chart-data-table'>
              <thead>
                <tr>
                  <th>{t('host.gcb.txt-originalKey')}</th>
                  <th>{t('host.gcb.txt-endpoint')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
              {_.map(top10GcbEndpointCounts, row => {
                return <tr key={row.originalKey}>
                    <td title={row.originalKey}>{row.originalKey}</td>
                    <td><div className='bar' style={{width: (row.exposedDevices / top10GcbEndpointCounts[0].exposedDevices * 100) + '%'}}></div></td>
                    <td>{row.exposedDevices}</td>
                  </tr>
              })}
              </tbody>
            </table>
          </div>
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
        <span>{t('txt-status')}: {data[0].indicator}<br /></span>
        <span>{t('txt-time')}: {moment(data[0].date).format('YYYY/MM/DD')}<br /></span>
        <span>{t('txt-searchCount')}: {helper.numberWithCommas(data[0].count)}</span>
      </section>
    )
  }
  /**
   * Get and set gcb data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getGcbData = (fromPage) => {
    const {baseUrl} = this.context;
    const {gcbSearch, gcbData} = this.state;
    const sort = gcbData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? gcbData.currentPage : 0;
    const requestData = {
      ...this.getGcbFilterRequestData()
    };
    let url = `${baseUrl}/api/hmd/gcbUpdateToDate/_search?page=${page + 1}&pageSize=${gcbData.pageSize}`;

    if (gcbData.sort.field) {
      url += `&orders=${gcbData.sort.field} ${sort}`;
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
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : f('gcbFields.' + val),
            options: {
              filter: true,
              sort: this.checkSortable(val),
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempGcbData.dataContent[dataIndex];
                const value = tempGcbData.dataContent[dataIndex][val];

                if (val === '_menu') {
                  return (
                    <div className='table-menu active'>
                      <Button className='host-open-table-menu' variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue.originalKey)} data-cy='hostOpenTableMenuBtn'><i className='fg fg-more'></i></Button>
                    </div>
                  )
                } else if (val === 'successExposedDevices') {
                  return <Fragment><span className='status-success'>{value}</span> <span className='status-fail'>{allValue.failExposedDevices}</span></Fragment>
                } else if (val === 'failExposedDevices') {
                  return null
                } else {
                  return value;
                }
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
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable field
   */
  checkSortable = (field) => {
    const unSortableFields = ['_menu', 'policyName'];

    if (_.includes(unSortableFields, field)) {
      return false;
    } else {
      return true;
    }
  }
  /**
   * Get gcb filter request data
   * @method
   * @returns requestData object
   */
  getGcbFilterRequestData = () => {
    const {gcbSearch, gcbFilter} = this.state;
    let requestData = {};

    if (gcbSearch.keyword) {
      requestData.originalKey = gcbSearch.keyword;
    }

    if (gcbFilter.departmentSelected && gcbFilter.departmentSelected.length > 0) {
      requestData.departmentArray = gcbFilter.departmentSelected;
    }

    if (gcbFilter.type && gcbFilter.type.length > 0) {
      requestData.type = gcbFilter.type;
    }

    if (gcbFilter.policyName && gcbFilter.policyName.length > 0) {
      requestData.policyName = gcbFilter.policyName;
    }

    return requestData;
  }
  /**
   * Handle open menu
   * @method
   * @param {string} originalKey - active gcb originalKey
   * @param {object} event - event object
   */
  handleOpenMenu = (originalKey, event) => {
    this.setState({
      tableContextAnchor: event.currentTarget,
      currentOriginalKey: originalKey
    });
  }
  /**
   * Handle open exposed device menu
   * @method
   * @param {string} originalKey - active gcb originalKey
   * @param {object} event - event object
   */
  handleOpenExposedDeviceMenu = (originalKey, event) => {
    this.setState({
      tableContextAnchor: event.currentTarget,
      currentOriginalKey: originalKey
    });
  }
  /**
   * Get individual gcb data
   * @method
   */
  getActiveGcbInfo = () => {
    const {baseUrl} = this.context;
    const {gcbFilter, currentOriginalKey, currentGcbData} = this.state;
    let requestData = {};

    if (gcbFilter.departmentSelected.length > 0) {
      requestData.departmentArray = gcbFilter.departmentSelected;
    }
    requestData.originalKey = currentOriginalKey

    const apiArr = [
      {
        url: `${baseUrl}/api/hmd/gcbUpdateToDate/gcbInfo?originalKey=${encodeURIComponent(currentOriginalKey)}`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/hmd/gcb/devices/count?originalKey=${encodeURIComponent(currentOriginalKey)}`,
        data: JSON.stringify(requestData),
        type: 'POST',
        contentType: 'text/plain'
      }
    ];

    this.ah.all(apiArr)
    .then(data => {
      let tempCurrentGcbData = {...currentGcbData};
      if (data[0]) {
        if (!data[0].gcbInfo || data[0].gcbInfo.length === 0) {
          tempCurrentGcbData.dataContent = [];
        } else {
          tempCurrentGcbData.dataContent = data[0].gcbInfo;
        }
      }
      
      if (data[1]) {
        if (!data[1].gcbDevicesCount || data[1].gcbDevicesCount.length === 0) {
          tempCurrentGcbData.gcbDevicesCount = [];
        } else {
          let tempGcbDevicesCount = [];
          tempGcbDevicesCount.push({key: 'exposedDeviceCount', value: data[1].gcbDevicesCount.exposedDeviceCount});
          tempGcbDevicesCount.push({key: 'notExposedDeviceCount', value: data[1].gcbDevicesCount.endpointCount - data[1].gcbDevicesCount.exposedDeviceCount});
          tempCurrentGcbData.gcbDevicesCount = tempGcbDevicesCount;
        }
      }
      
      this.setState({
        currentGcbData: tempCurrentGcbData
      }, () => {
        this.toggleShowGcb();
      });

      this.handleCloseMenu();
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
    const {gcbFilter, exposedDevicesSearch, exposedDevicesData, currentOriginalKey} = this.state;
    const sort = exposedDevicesData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? exposedDevicesData.currentPage : 0;
    let url = `${baseUrl}/api/hmd/gcb/devices?page=${page + 1}&pageSize=${exposedDevicesData.pageSize}`;
    let requestData = {
      originalKey: currentOriginalKey
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

    if (exposedDevicesSearch.compareResult && exposedDevicesSearch.compareResult !== 'all') {
      requestData.compareResult = (exposedDevicesSearch.compareResult === 'true');
    }

    if (gcbFilter.departmentSelected.length > 0) {
      requestData.departmentArray = gcbFilter.departmentSelected;
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
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : f('hostDashboardFields.' + val),
            options: {
              filter: true,
              sort: this.checkSortable(val),
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempExposedDevicesData.dataContent[dataIndex];
                const value = tempExposedDevicesData.dataContent[dataIndex][val];

                if (val === 'compareResult') {
                  return <span className={'status-' + (value ? 'success' : 'fail')}>{t('txt-' + (value ? 'success' : 'fail'))}</span>
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
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      exportContextAnchor: null,
      tableContextAnchor: null,
      filterContextAnchor: null
    });
  }
  /**
   * Toggle show gcb info
   * @method
   */
  toggleShowGcb = () => {
    this.setState({
      showGcbInfo: !this.state.showGcbInfo,
      activeGcbInfo: 'gcbDetails'
    }, () => {
      if (!this.state.showGcbInfo) {
        this.setState({
          exposedDevicesSearch: _.cloneDeep(EXPOSED_DEVICES_SEARCH),
          exposedDevicesData: _.cloneDeep(EXPOSED_DEVICES_DATA)
        });
      }
    });
  }
  /**
   * Open confirm white list dialog
   * @method
   */
  confirmAddWhitelist = () => {
    this.handleCloseMenu()
    
    PopupDialog.prompt({
      title: t('txt-addWhiteList'),
      id: 'modalWindowSmall',
      confirmText: t('txt-ok'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content'>
          <span>{t('txt-confirmWhiteList')}?</span>
        </div>
      ),
      act: (confirmed) => {
        if (confirmed) {
          this.addToWhiteList();
        }
      }
    });
  }
  /**
   * Handle gcb add to white list
   * @method
   */
  addToWhiteList = () => {
    const {baseUrl} = this.context;
    const {currentOriginalKey} = this.state;
    const requestData = [{
      originalKey: currentcurrentOriginalKey,
      hasHandled: true
    }];

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/hmd/gcbList`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        helper.showPopupMsg(t('txt-requestSent'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle show gcb button
   * @method
   * @param {object} event - event object
   * @param {string} type - gcb button type ('gcbDetails' or 'exposedDevices')
   */
  toggleGcbButtons = (event, type) => {
    if (!type) {
      return;
    }
    
    this.setState({
      activeGcbInfo: type
    }, () => {
      const {activeGcbInfo} = this.state;

      if (activeGcbInfo === 'exposedDevices') {
        this.getExposedDevices();
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
   * Handle reset button for host name search
   * @method
   * @param {string} type - reset button type ('gcbSearch' or 'exposedDevices')
   */
  handleResetBtn = (type) => {
    const {gcbSearch, exposedDevicesSearch} = this.state;

    if (type === 'gcbSearch') {
      let tempGcbSearch = {...gcbSearch};
      tempGcbSearch.keyword = '';

      this.setState({
        gcbSearch: tempGcbSearch
      });
    } else if (type === 'exposedDevices') {
      let tempExposedDevicesSearch = {...exposedDevicesSearch};
      tempExposedDevicesSearch.hostName = '';
      tempExposedDevicesSearch.ip = '';
      tempExposedDevicesSearch.system = '';

      this.setState({
        exposedDevicesSearch: tempExposedDevicesSearch
      });
    }
  }
  /**
   * Display gcb info content
   * @method
   * @returns HTML DOM
   */
  displayGcbInfo = () => {
    const {activeGcbInfo, exposedDevicesSearch, exposedDevicesData, currentGcbData} = this.state;
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

    return (
      <div>
        <ToggleButtonGroup
          id='activeGcbInfoButtons'
          value={activeGcbInfo}
          exclusive
          onChange={this.toggleGcbButtons}>
          <ToggleButton id='hostDialogGcbDetails' value='gcbDetails' data-cy='hostInfoDialogDetailsBtn'>{t('host.gcb.txt-gcbDetails')}</ToggleButton>
          <ToggleButton id='hostDialogExposedDevices' value='exposedDevices' data-cy='hostInfoDialogDeviceBtn'>{t('host.gcb.txt-exposedDevices')}</ToggleButton>
        </ToggleButtonGroup>

        <div className='main-content'>
          {activeGcbInfo === 'gcbDetails' &&
            <GeneralDialog
              page='gcb'
              type='general-info'
              data={currentGcbData}
              handleAddWhitelist={this.confirmAddWhitelist} />
          }

          {activeGcbInfo === 'exposedDevices' &&
            <GeneralDialog
              page='gcb'
              type='exposed-devices'
              search={exposedDevicesSearch}
              data={exposedDevicesData}
              tableOptions={tableOptionsExposedDevices}
              handleSearchChange={this.handleDevicesSearchChange}
              handleSearchSubmit={this.getExposedDevices}
              handleResetBtn={this.handleResetBtn} />
          }
        </div>
      </div>
    )
  }
  /**
   * Show gcb info dialog
   * @method
   * @returns ModalDialog component
   */
  showGcbDialog = () => {
    const actions = {
      cancel: {text: t('txt-close'), handler: this.toggleShowGcb}
    };
    let title = t('host.txt-gcb');

    if (this.state.currentOriginalKey) {
      title +=  ' > ' + this.state.currentOriginalKey;
    }

    return (
      <ModalDialog
        id='showGcbDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'
        data-cy='showGcbDialog'>
        {this.displayGcbInfo()}
      </ModalDialog>
    )
  }
  /**
   * Handle table sort
   * @method
   * @param {string} tableType - table type ('gcb' or 'exposedDevices')
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (tableType, field, sort) => {
    const {gcbData, exposedDevicesData} = this.state;
    let tempGcbData = {...gcbData};
    let tempExposedDevicesData = {...exposedDevicesData};
    let tableField = field;

    if (tableType === 'gcb') {
      tempGcbData.sort.field = tableField;
      tempGcbData.sort.desc = sort;

      this.setState({
        gcbData: tempGcbData
      }, () => {
        this.getGcbData();
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
   * @param {string} tableType - table type ('gcb' or 'exposedDevices'')
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (tableType, type, value) => {
    const {gcbData, exposedDevicesData} = this.state;
    let tempGcbData = {...gcbData};
    let tempExposedDevicesData = {...exposedDevicesData};

    if (tableType === 'gcb') {
      tempGcbData[type] = value;

      this.setState({
        gcbData: tempGcbData
      }, () => {
        this.getGcbData(type);
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
   * Handle gcb search search
   * @method
   * @param {object} event - event object
   */
  handleGcbChange = (event) => {
    let tempGcbSearch = {...this.state.gcbSearch};
    tempGcbSearch[event.target.name] = event.target.value;

    this.setState({
      gcbSearch: tempGcbSearch
    });
  }
  /**
   * Show filter query
   * @method
  */
  showFilterQuery = (type) => {
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
        gcbFilter: filterData.filter,
        gcbFilterList: filterData.itemFilterList,
        filterDataCount
      }, () => {
        this.getGcbData();
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
      url: `${baseUrl}/api/account/queryText?accountId=${account.id}&module=GCB`,
      type: 'GET',
      pcontentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let filterQueryList = _.map(data, filter => {
          let newFilter = {
            id: filter.id,
            name: filter.name,
            content: _.cloneDeep(GCB_FILTER_LIST)
          };

          if (filter.queryText) {
            let content = {
              departmentSelected: filter.queryText.departmentArray ? filter.queryText.departmentArray : [],
              policyName: filter.queryText.policyName ? filter.queryText.policyName : '',
              type: filter.queryText.type ? filter.queryText.type : ''
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
      ...this.getGcbFilterRequestData()
    };

    this.ah.one({
      url: `${baseUrl}/api/account/queryText`,
      data: JSON.stringify({
        accountId: account.id,
        module: 'GCB',
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
  handleFilterOpenMenu = (event) => {
    this.setState({
      filterContextAnchor: event.currentTarget
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
   * Export gcb list
   * @method
   * @param {string} type - export type ('gcbUpdateToDate' or 'gcb/devices')
   */
  exportGcbList = (type) => {
    const {baseUrl, contextRoot} = this.context;
    const {exportGcbDataFieldsArr, exportHostDataFieldsArr} = this.state;
    let url = '';
    let exportFields = {};
    let requestData = {
      ...this.getGcbFilterRequestData()
    };

    let fieldsList = type === 'gcbUpdateToDate' ? _.cloneDeep(exportGcbDataFieldsArr) : _.cloneDeep(exportHostDataFieldsArr);

    _.forEach(fieldsList, val => {
      exportFields[val] = f('gcbFields.' + val);
    })

    requestData.exportFields = exportFields;

    url = `${baseUrl}${contextRoot}/api/hmd/${type}/_export`;

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
    this.handleCloseMenu();
  }
  render() {
    const {
      account,
      departmentList,
      departmentNameMapping,
      limitedDepartment,
      isPE,
      isPEExtension,
      isVerifyTrust,
      gcbSearch,
      gcbFilter,
      gcbFilterList,
      filterDataCount,
      filterQueryList,
      dailyFoundGcbs,
      top10GcbEndpointCounts,
      showGcbInfo,
      showFilterQuery,
      showFilterType,
      gcbData,
      exportContextAnchor,
      tableContextAnchor,
      filterContextAnchor,
    } = this.state;
    const tableOptions = {
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

    return (
      <div>
        {showGcbInfo &&
          this.showGcbDialog()
        }

        {showFilterQuery &&
          <FilterQuery
            page='gcb'
            showFilterType={showFilterType}
            account={account}
            departmentList={departmentList}
            limitedDepartment={limitedDepartment}
            departmentNameMapping={departmentNameMapping}
            isPE={isPE}
            isPEExtension={isPEExtension}
            isVerifyTrust={isVerifyTrust}
            filterList={FILTER_LIST}
            originalFilter={GCB_FILTER}
            filter={gcbFilter}
            originalItemFilterList={GCB_FILTER_LIST}
            itemFilterList={gcbFilterList}
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
                {this.showBarChart(dailyFoundGcbs)}
                {this.showHorizontalBarChart(top10GcbEndpointCounts)}
              </div>
            </div>

            <TableList
              page='gcb'
              searchType='gcbSearch'
              search={gcbSearch}
              data={gcbData}
              options={tableOptions}
              exportAnchor={exportContextAnchor}
              tableAnchor={tableContextAnchor}
              filterAnchor={filterContextAnchor}
              getData={this.getGcbData}
              getActiveData={this.getActiveGcbInfo}
              handleAddWhitelist={this.confirmAddWhitelist}
              exportList={this.exportGcbList}
              onFilterQueryClick={this.showFilterQuery}
              filterDataCount={filterDataCount}
              handleSearch={this.handleGcbChange}
              handleReset={this.handleResetBtn}
              handleExportMenu={this.handleExportOpenMenu}
              handleFilterMenu={this.handleFilterOpenMenu}
              handleCloseMenu={this.handleCloseMenu} />
          </div>
        </div>
      </div>
    )
  }
}

HostGcb.contextType = BaseDataContext;

HostGcb.propTypes = {
};

export default HostGcb;