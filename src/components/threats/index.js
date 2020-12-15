import React, {Component} from 'react'
import { withRouter } from 'react-router'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import _ from 'lodash'
import cx from 'classnames'
import queryString from 'query-string'

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import {downloadWithForm} from 'react-ui/build/src/utils/download'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import AlertDetails from '../common/alert-details'
import {BaseDataContext} from '../common/context';
import helper from '../common/helper'
import QueryOpenSave from '../common/query-open-save'
import SearchOptions from '../common/search-options'
import TableCell from '../common/table-cell'
import Threats from './threats'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';
const PRIVATE = 'private';
const PUBLIC = 'public';
const PRIVATE_API = {
  name: 'InternalMaskedIp',
  path: 'srcIp'
};
const PUBLIC_API = {
  name: 'ExternalSrcCountry',
  path: 'srcCountry'
};
const EDGES_API = {
  name: 'Edges',
  path: 'agg'
};
const INTERNAL_MASKED_SRC_IP_API = {
  name: 'InternalMaskedIpWithSeverity'
};
const EXTERNAL_SRC_COUNTRY_API = {
  name: 'ExternalSrcCountryWithSeverity'
};
const EXTERNAL_SRC_IP_API = {
  name: 'ExternalSrcIpWithSeverity'
};
const INTERNAL_MASKED_DEST_IP_API = {
  name: 'InternalMaskedDestIpWithSeverity'
};
const EXTERNAL_DEST_COUNTRY_API = {
  name: 'ExternalDestCountryWithSeverity'
};
const EXTERNAL_DEST_IP_API = {
  name: 'ExternalDestIpWithSeverity'
};
const NET_TRAP_QUERY = {
  name: 'NetTrapQueryBlacklist'
};
const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};
const SUBSECTIONS_DATA = { //Sub sections
  subSectionsData: {
    mainData: {
      alert: null
    },
    fieldsData: {
      alert: {}
    },
    tableColumns: {
      alert: ['_eventDttm_', '_severity_', 'srcIp', 'destIp', 'Info', 'Collector', 'Source']
    },
    totalCount: {
      alert: 0
    }
  }
};
//Charts ID must be unique
const CHARTS_LIST = [
  {
    id: 'alertThreatLevelSrc',
    key: 'severity'
  },
  {
    id: 'alertThreatCountSrc',
    key: 'srcIp'
  }
];
const TABLE_CHARTS_LIST = [
  {
    id: 'alertThreatSubnetSrc',
    key: 'Subnet'
  },
  {
    id: 'alertThreatPrivateSrc',
    key: 'IP'
  },
  {
    id: 'alertThreatCountrySrc',
    key: 'Country'
  },
  {
    id: 'alertThreatPublicSrc',
    key: 'IP'
  },
  {
    id: 'alertThreatSubnetDest',
    key: 'Subnet'
  },
  {
    id: 'alertThreatPrivateDest',
    key: 'IP'
  },
  {
    id: 'alertThreatCountryDest',
    key: 'Country'
  },
  {
    id: 'alertThreatPublicDest',
    key: 'IP'
  },
  {
    id: 'alertNetTrapBlackList',
    key: 'client'
  }
];

let t = null;
let f = null;
let et = null;
let it = null;

/**
 * Threats
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to handle the business logic for the threats page
 */
class ThreatsController extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');

    this.state = {
      activeTab: 'alert',
      account: {
        id: '',
        login: false,
        fields: [],
        logsLocale: ''
      },
      //General
      datetime: {
        from: helper.getSubstractDate(1, 'hour'),
        to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
        //from: '2019-06-28T05:28:00Z',
        //to: '2019-07-19T06:28:00Z'
      },
      chartIntervalList: [],
      chartIntervalValue: '',
      currentPage: 1,
      oldPage: 1,
      pageSize: 20,
      sort: {
        field: '_eventDttm_',
        desc: true
      },
      //Left nav
      treeData: {
        alert: {
          title: '',
          rawData: {},
          data: null,
          currentTreeName: ''
        },
        private: {
          title: '',
          rawData: {},
          data: {},
          currentTreeName: ''
        },
        public: {
          title: '',
          rawData: {},
          data: {},
          currentTreeName: ''
        },
        edge: {
          title: '',
          rawData: {},
          data: {}
        }
      },
      //Tab IncidentDevice
      subTabMenu: {
        table: t('alert.txt-alertList'),
        statistics: t('alert.txt-statistics')
      },
      activeSubTab: 'table',
      //Search bar
      searchInput: {
        searchType: 'manual',
        searchInterval: '1h',
        refreshTime: '600000' //10 minutes
      },
      alertHistogram: {},
      filterData: [{
        condition: 'must',
        query: ''
      }],
      edgeFilterData:[],
      ..._.cloneDeep(SUBSECTIONS_DATA),
      mainEventsData: {},
      queryData: {
        id: '',
        name: '',
        inputName: '',
        displayId: '',
        displayName: '',
        list: [],
        query: '',
        formattedQuery: '',
        emailList: [],
        openFlag: false
      },
      contextAnchor: null,
      currentQueryValue: '',
      notifyEmailData: [],
      newQueryName: true,
      showFilter: false,
      showChart: false,
      openQueryOpen: false,
      saveQueryOpen: false,
      currentTableIndex: '',
      currentTableID: '',
      alertDetailsOpen: false,
      alertDetails: {
        all: [],
        publicFormatted: {
          srcIp: {},
          destIp: {}
        },
        currentID: '',
        currentIndex: '',
        currentLength: ''
      },
      alertData: {},
      loadAlertData: true,
      alertPieData: {},
      alertTableData: {},
      alertChartsList: []
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, session, sessionRights} = this.context;
    const alertsParam = queryString.parse(location.search);
    let tempAccount = {...this.state.account};

    helper.getPrivilegesInfo(sessionRights, 'common', locale);

    if (session.accountId) {
      tempAccount.id = session.accountId;
      tempAccount.login = true;

      this.setState({
        account: tempAccount
      }, () => {
        this.getSavedQuery();
        this.loadTreeData();
        this.setChartIntervalBtn();
        this.setStatisticsTab();
      });
    }

    if (alertsParam.type) {
      const type = alertsParam.type;
      const data = alertsParam.data;
      let tempSearchInput = {...this.state.searchInput};
      let query = '';
      let filterData = [];

      if (type === 'maskedIP') {
        const severity = alertsParam.severity;
        query = 'sourceIP: ' + data.charAt(0).toUpperCase() + data.slice(1); //Make first letter uppercase

        filterData = [{
          condition: 'must',
          query: severity
        }, {
          condition: 'must',
          query
        }];
      } else {
        if (type === 'severity') {
          query = data.charAt(0).toUpperCase() + data.slice(1); //Make first letter uppercase
        } else if (type === 'ip') {
          query = 'sourceIP: ' + data;
        } else if (type === 'country') {
          query = 'srcCountry: "' + data + '"';
        }

        filterData = [{
          condition: 'must',
          query
        }];
      }

      if (alertsParam.interval) {
        tempSearchInput.searchInterval = alertsParam.interval;
      }

      this.setState({
        searchInput: tempSearchInput,
        filterData,
        showFilter: true
      });
    }

    if (alertsParam.from && alertsParam.to) {
      const page = alertsParam.page;
      let query = 'sourceIP: ' + alertsParam.sourceIP;

      if (page === 'host') {
        query = alertsParam.sourceIP;
      }

      this.setState({
        datetime: {
          from: alertsParam.from,
          to: alertsParam.to
        },
        filterData: [{
          condition: 'must',
          query
        }],
        showFilter: true
      });
    }

   if (alertsParam.iva) {
      const type = alertsParam.iva;
      let tempSearchInput = {...this.state.searchInput};
      let query = '';


      if (type === 'frmotp') {
        query = '"FRMOTP Fail"';
      } else if (type === 'intrusion') {
        query = '"IVAR Suspicious Face Recognition"';
      }

      if (alertsParam.interval) {
        tempSearchInput.searchInterval = alertsParam.interval;
      }

      this.setState({
        searchInput: tempSearchInput,
        filterData: [{
          condition: 'must',
          query: 'patternId: ' + query
        }],
        showFilter: true
      });
    }
  }
  /**
   * Get and set the account saved query
   * @method
   */
  getSavedQuery = () => {
    const {baseUrl} = this.context;
    const {account, queryData} = this.state;

    helper.getSavedQuery(baseUrl, account, queryData, 'alert')
    .then(data => {
      if (!_.isEmpty(data)) {
        this.setState({
          queryData: data
        });
      }
      return null;
    });
  }
  /**
   * Get and set the alert tree data
   * @method
   */
  loadTreeData = () => {
    const {baseUrl} = this.context;
    const {treeData} = this.state;
    const url = `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0&skipHistogram=true`;
    const requestData = this.toQueryLanguage('tree');

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        data = data.aggregations;
        let alertTreeData = {
          default: data.default
        };

        _.forEach(SEVERITY_TYPE, val => {
          alertTreeData[val] = data[val];
        })

        let tempTreeData = {...treeData};
        tempTreeData.alert.title = t('alert.txt-threatLevel');
        tempTreeData.alert.rawData = alertTreeData;
        tempTreeData.alert.data = this.getAlertTreeData(alertTreeData);
        tempTreeData.private.title = t('alert.txt-privateMaskedIp');
        tempTreeData.private.rawData = data[PRIVATE_API.name];
        tempTreeData.private.data = this.getPrivateTreeData(data[PRIVATE_API.name]);
        tempTreeData.public.title = t('alert.txt-sourceCountry');
        tempTreeData.public.rawData = data[PUBLIC_API.name];
        tempTreeData.public.data = this.getPublicTreeData(data[PUBLIC_API.name]);
        tempTreeData.edge.title = t('txt-edge');
        tempTreeData.edge.rawData = data[EDGES_API.name];
        tempTreeData.edge.data = this.getEdgesTreeData(data[EDGES_API.name]);

        this.setState({
          treeData: tempTreeData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set interval for chart buttons
   * @method
   */
  setChartIntervalBtn = () => {
    const chartData = helper.setChartInterval(this.state.datetime);

    this.setState({
      chartIntervalList: chartData.chartIntervalList,
      chartIntervalValue: chartData.chartIntervalValue
    });
  }
  /**
   * Set initial data for statistics tab
   * @method
   */
  setStatisticsTab = () => {
    let alertChartsList = [];

    _.forEach(CHARTS_LIST, val => {
      alertChartsList.push({
        chartID: val.id,
        chartTitle: t('alert.txt-' + val.id),
        chartKeyLabels: {
          key: t('attacksFields.' + val.key),
          doc_count: t('txt-count')
        },
        chartValueLabels: {
          'Pie Chart': {
            key: t('attacksFields.' + val.key),
            doc_count: t('txt-count')
          }
        },
        chartDataCfg: {
          splitSlice: ['key'],
          sliceSize: 'doc_count'
        },
        chartData: null,
        type: 'pie'
      });
    })

    let tempAlertTableData = {...this.state.alertTableData};

    _.forEach(TABLE_CHARTS_LIST, val => {
      alertChartsList.push({
        chartID: val.id,
        chartTitle: t('alert.txt-' + val.id),
        chartData: null,
        type: 'table'
      });

      tempAlertTableData[val.id] = {
        chartFieldsArr: ['key'],
        chartFields: {},
        chartData: null,
        sort: {
          field: val.id === 'alertNetTrapBlackList' ? 'ip' : 'key',
          desc: false
        }
      };
    })

    _.forEach(SEVERITY_TYPE, val => {
       _.forEach(TABLE_CHARTS_LIST, val2 => {
        tempAlertTableData[val2.id].chartFieldsArr.push(val);
      })
    })

    tempAlertTableData.alertNetTrapBlackList.chartFieldsArr = ['ip', 'domain', 'count'];

    this.setState({
      alertChartsList,
      alertTableData: tempAlertTableData
    }, () => {
      this.loadThreatsData('search');
      this.loadThreatsData('statistics');
      this.loadThreatsData(NET_TRAP_QUERY.name);
    });
  }
  /**
   * Show query menu when click on the table row filter icon
   * @method
   * @param {string} field - field name of selected field
   * @param {string | number} value - value of selected field
   * @param {string} activeTab - currect active tab
   * @param {object} event - event object
   */
  handleOpenQueryMenu = (field, value, activeTab, event) => {
    if (activeTab && activeTab === 'alert') {
      if (field === 'srcIp') {
        value = 'sourceIP: ' +  value;
      } else if (field === 'destIp') {
        value = 'destinationIP: ' +  value;
      }
    } else {
      if (field === 'Collector') {
        value = 'Collector: ' +  '"' + value + '"';
      }
    }

    this.setState({
      contextAnchor: event.currentTarget,
      currentQueryValue: value
    });
  }
  /**
   * Handle close query menu
   * @method
   */
  handleCloseQueryMenu = () => {
    this.setState({
      contextAnchor: null,
      currentQueryValue: ''
    });
  }
  /**
   * Construct table data for Threats
   * @method
   * @param {string} type - threats table name
   * @param {string} key - threats table field name for key
   * @returns chart fields object
   */
  getThreatsTableData = (type, key) => {
    const {alertTableData} = this.state;

    let chartFields = {};
    alertTableData[type].chartFieldsArr.forEach(tempData => {
      chartFields[tempData] = {
        label: tempData === 'key' ? key : tempData,
        sortable: true,
        formatter: (value, allValue, i) => {
          return <span>{value}</span>
        }
      };
    })
    return chartFields;
  }
  /**
   * Get and set alert data
   * @method
   * @param {string} [options] - option for 'search', 'statistics', or 'alertDetails'
   */
  loadThreatsData = (options) => {
    const {baseUrl} = this.context;
    const {
      activeTab,
      chartIntervalValue,
      currentPage,
      oldPage,
      pageSize,
      treeData,
      subSectionsData,
      account,
      alertDetails,
      alertPieData,
      alertTableData
    } = this.state;
    const setPage = options === 'search' ? 1 : currentPage;
    const requestData = this.toQueryLanguage(options);
    let url = `${baseUrl}/api/u2/alert/_search?histogramInterval=${chartIntervalValue}&page=${setPage}&pageSize=`;

    if (!options || options === 'search' || options === 'alertDetails') {
      url += pageSize;
    } else {
      url += '0&skipHistogram=true';
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        if (!options || options === 'search' || options === 'alertDetails') {
          if (currentPage > 1 && data.data.rows.length === 0) {
            helper.showPopupMsg('', t('txt-error'), t('txt-maxDataMsg'));

            this.setState({
              currentPage: oldPage
            });
          } else {
            let alertHistogram = {
              Emergency: {},
              Alert: {},
              Critical: {},
              Warning: {},
              Notice: {}
            };
            let tableData = data.data;
            let tempArray = [];
            let tempSubSectionsData = {...subSectionsData};

            if (_.isEmpty(tableData) || (tableData && tableData.counts === 0)) {
              helper.showPopupMsg(t('txt-notFound'));

              let tempSubSectionsData = {...this.state.subSectionsData};
              tempSubSectionsData.mainData[activeTab] = [];
              tempSubSectionsData.totalCount[activeTab] = 0;

              const resetObj = {
                subSectionsData: tempSubSectionsData,
                currentPage: 1,
                oldPage: 1,
                pageSize: 20
              };

              this.setState({
                ...resetObj,
                alertHistogram: {}
              });
            } else {
              tempSubSectionsData.totalCount[activeTab] = tableData.counts;
              tableData = tableData.rows;

              tempArray = _.map(tableData, val => { //Re-construct the Alert data
                val._source.id = val._id;
                val._source.index = val._index;
                return val._source;
              });

              let tempAlertDetails = {...alertDetails};
              tempAlertDetails.currentIndex = 0;
              tempAlertDetails.currentLength = tableData.length < pageSize ? tableData.length : pageSize;
              tempAlertDetails.all = tempArray;

              _.forEach(SEVERITY_TYPE, val => { //Create Alert histogram for Emergency, Alert, Critical, Warning, Notice
                if (data.event_histogram[val]) {
                  _.forEach(data.event_histogram[val].buckets, val2 => {
                    if (val2.doc_count > 0) {
                      alertHistogram[val][val2.key_as_string] = val2.doc_count;
                    }
                  })
                }
              })

              this.setState({
                alertHistogram,
                alertDetails: tempAlertDetails
              }, () => {
                if (options === 'alertDetails') {
                  this.openDetailInfo(0); //Pass index of 0
                }
              });

              let tempFields = {};
              subSectionsData.tableColumns[activeTab].forEach(tempData => {
                let tempFieldName = tempData;

                tempFields[tempData] = {
                  hide: false,
                  label: f(`${activeTab}Fields.${tempFieldName}`),
                  sortable: tempData === '_eventDttm_' ? true : false,
                  formatter: (value, allValue) => {
                    if (tempData === 'Info' || tempData === 'Source') {
                      return <span>{value}</span>
                    } else {
                      if (tempData === '_eventDttm_') {
                        value = helper.getFormattedDate(value, 'local');
                      }
                      return (
                        <TableCell
                          activeTab={activeTab}
                          fieldValue={value}
                          fieldName={tempData}
                          allValue={allValue}
                          alertLevelColors={ALERT_LEVEL_COLORS}
                          handleOpenQueryMenu={this.handleOpenQueryMenu} />
                      )
                    }
                  }
                };
              })

              const tempCurrentPage = options === 'search' ? 1 : currentPage;
              tempSubSectionsData.mainData[activeTab] = tempArray;
              tempSubSectionsData.fieldsData[activeTab] = tempFields;

              this.setState({
                currentPage: tempCurrentPage,
                oldPage: tempCurrentPage,
                subSectionsData: tempSubSectionsData
              });
            }
          }
        }

        if (options === 'statistics') {
          let tempAlertPieData = {...alertPieData};
          let tempArr = [];

          if (data.aggregations) {
            _.forEach(SEVERITY_TYPE, val => { //Create Alert histogram for Emergency, Alert, Critical, Warning, Notice
              tempArr.push({
                key: val,
                doc_count: data.aggregations[val].doc_count
              });
            })
          }
          tempAlertPieData.alertThreatLevelSrc = tempArr;
          tempAlertPieData.alertThreatCountSrc = [
            {
              key: t('dashboard.txt-private'),
              doc_count: data.aggregations[PRIVATE_API.name].doc_count
            },
            {
              key: t('dashboard.txt-public'),
              doc_count: data.aggregations[PUBLIC_API.name].doc_count
            }
          ];

          let tempAlertTableData = {...alertTableData};
          tempAlertTableData.alertThreatSubnetSrc.chartData = data.aggregations[INTERNAL_MASKED_SRC_IP_API.name].chartMaskedIpArr;
          tempAlertTableData.alertThreatPrivateSrc.chartData = data.aggregations[INTERNAL_MASKED_SRC_IP_API.name].chartIpArr;
          tempAlertTableData.alertThreatCountrySrc.chartData = data.aggregations[EXTERNAL_SRC_COUNTRY_API.name];
          tempAlertTableData.alertThreatPublicSrc.chartData = data.aggregations[EXTERNAL_SRC_IP_API.name];

          tempAlertTableData.alertThreatSubnetDest.chartData = data.aggregations[INTERNAL_MASKED_DEST_IP_API.name].chartMaskedIpArr;
          tempAlertTableData.alertThreatPrivateDest.chartData = data.aggregations[INTERNAL_MASKED_DEST_IP_API.name].chartIpArr;
          tempAlertTableData.alertThreatCountryDest.chartData = data.aggregations[EXTERNAL_DEST_COUNTRY_API.name];
          tempAlertTableData.alertThreatPublicDest.chartData = data.aggregations[EXTERNAL_DEST_IP_API.name];

          _.forEach(TABLE_CHARTS_LIST, val => {
            tempAlertTableData[val.id].chartFields = this.getThreatsTableData(val.id, val.key);
          })

          this.setState({
            alertPieData: tempAlertPieData,
            alertTableData: tempAlertTableData
          }, () => {
            this.getChartsData();
          });
        }

        if (options === NET_TRAP_QUERY.name) { //For NetTrap black list table
          let chartFields = {};
          alertTableData.alertNetTrapBlackList.chartFieldsArr.forEach(tempData => {
            chartFields[tempData] = {
              label: t(`txt-${tempData}`),
              sortable: true,
              formatter: (value, allValue, i) => {
                return <span>{value}</span>
              }
            };
          })

          let queryBalackListObj = {};


          if (data.aggregations[NET_TRAP_QUERY.name]) {
            _.forEach(data.aggregations[NET_TRAP_QUERY.name].client.buckets, val => { //Create black list object
              queryBalackListObj[val.key] = [];

              _.forEach(val.dn.buckets, val2 => {
                queryBalackListObj[val.key].push({
                  domain: val2.key,
                  count: val2.doc_count
                })
              })
            })
          }

          let queryBlackListArr = [];

          if (!_.isEmpty(queryBalackListObj)) {
            _.forEach(queryBalackListObj, (val, key) => { //Create black list array for table data
              _.forEach(queryBalackListObj[key], val2 => {
                queryBlackListArr.push({
                  ip: key,
                  ...val2
                })
              })
            })
          }

          let tempAlertTableData = {...alertTableData};
          tempAlertTableData.alertNetTrapBlackList.chartFields = chartFields;
          tempAlertTableData.alertNetTrapBlackList.chartData = queryBlackListArr;

          this.setState({
            alertTableData: tempAlertTableData
          }, () => {
            this.getChartsData();
          });
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Construct data for pie charts
   * @method
   * @param {string} type - pie chart name
   * @returns chart data
   */
  getPieChartData = (type) => {
    const {alertPieData} = this.state;
    let chartData = null; //Data has not been loaded, show spinning icon
    let i = null;

    _.forEach(alertPieData[type], val => {
      i = 'loop';

      if (val.doc_count > 0) {
        i = 'data';
        return false;
      }
    })

    if (i) {
      if (i === 'data') {
        chartData = alertPieData[type]; //Data is found, show data
      } else if (i === 'loop') {
        chartData = []; //Data is not found, show not found message
      }
    }
    return chartData;
  }
  /**
   * Construct and set the charts
   * @method
   */
  getChartsData = () => {
    const {alertChartsList, alertPieData, alertTableData} = this.state;
    let tempAlertChartsList = [];

    _.forEach(alertChartsList, val => {
      if (val.type === 'pie') {
        tempAlertChartsList.push({
          ...val,
          chartData: this.getPieChartData(val.chartID)
        });
      } else if (val.type === 'table') {
        tempAlertChartsList.push({
          ...val,
          ...alertTableData[val.chartID]
        });
      }
    })

    this.setState({
      alertChartsList: tempAlertChartsList
    });
  }
  /**
   * Construct the alert api request body
   * @method
   * @param {string} options - option for 'tree', 'search', 'statistics' or 'csv'
   * @returns requst data object
   */
  toQueryLanguage = (options) => {
    const {datetime, sort, filterData, edgeFilterData} = this.state;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    let dataObj = {
      timestamp: [dateTime.from, dateTime.to]
    };

    if (options === 'tree') {
      dataObj.search = [PRIVATE_API.name, PUBLIC_API.name];
    } else {
      const filterDataArr = helper.buildFilterDataArray(filterData); //Remove empty filter array
      const combinedFilterDataArr = _.concat(filterDataArr, edgeFilterData);

      if (combinedFilterDataArr.length > 0) {
        dataObj.filters = combinedFilterDataArr;
      }

      if (options === 'statistics') {
        dataObj.search = [PRIVATE_API.name, PUBLIC_API.name, INTERNAL_MASKED_SRC_IP_API.name, EXTERNAL_SRC_COUNTRY_API.name, EXTERNAL_SRC_IP_API.name, INTERNAL_MASKED_DEST_IP_API.name, EXTERNAL_DEST_COUNTRY_API.name, EXTERNAL_DEST_IP_API.name];
      } else if (options === NET_TRAP_QUERY.name) {
        dataObj.search = [NET_TRAP_QUERY.name];
      } else {
        dataObj.sort = [{
          '_eventDttm_': sort.desc ? 'desc' : 'asc'
        }];
      }
    }

    if (options == 'csv') {
      const timezone = momentTimezone.tz(momentTimezone.tz.guess()); //Get local timezone obj
      const utc_offset = timezone._offset / 60; //Convert minute to hour
      dataObj.timeZone = utc_offset;
    }

    return dataObj;
  }
  /**
   * Set the alert tree data based on alert type
   * @method
   * @param {string} type - alert tree type ('alert', 'private' or 'public')
   * @param {string} value - tree node name
   * @param {object} event - event object
   */
  showTreeFilterBtn = (type, value, event) => {
    let tempTreeData = {...this.state.treeData};
    tempTreeData[type].currentTreeName = value;

    if (type === 'alert') {
      tempTreeData[type].data = this.getAlertTreeData(tempTreeData[type].rawData, value);
    } else if (type === 'private') {
      tempTreeData[type].data = this.getPrivateTreeData(tempTreeData[type].rawData, value);
    } else if (type === 'public') {
      tempTreeData[type].data = this.getPublicTreeData(tempTreeData[type].rawData, value);
    }

    this.setState({
      treeData: tempTreeData
    });

    event.stopPropagation();
  }
  /**
   * Display severity info content
   * @method
   * @param {object} alertData - alert data
   * @returns HTML DOM
   */
  getSeverityInfoContent = (alertData) => {
    return (
      <table className='c-table'>
        <tbody>
          <tr>
            <td valign='top' className='header'>
              <div>{t('alert.txt-severityType')}:</div>
              <div>{t('alert.txt-severityDesc')}:</div>
            </td>
            <td>
              <div>{alertData.severity_type}</div>
              <div>{alertData.severity_type_description || NOT_AVAILABLE}</div>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
  /**
   * Get tree label
   * @method
   * @param {string} name - tree node name
   * @param {string} currentTreeName - current tree node name
   * @param {number} count - tree node length
   * @param {string} [query] - search query
   */
  getTreeLabel = (name, currentTreeName, count, query) => {
    const serviceCount = count !== '' ? ' (' + helper.numberWithCommas(count) + ')' : '';

    return <span>{name}{serviceCount} <Button variant='outlined' color='primary' className={cx('button', {'active': currentTreeName === name})} onClick={this.selectTree.bind(this, name, query)}>{t('events.connections.txt-addFilter')}</Button></span>;
  }
  /**
   * Open dialog to show severity info
   * @method
   * @param {object} alertData - alert data
   */
  showSeverityInfo = (alertData) => {
    PopupDialog.alert({
      title: alertData.severity_type_name,
      id: 'modalWindowSmall',
      confirmText: t('txt-close'),
      display: this.getSeverityInfoContent(alertData)
    });
  }
  /**
   * Set the alert tree data
   * @method
   * @param {string} treeData - alert tree data
   * @param {string} [treeName] - tree node name
   * @returns tree data object
   */
  getAlertTreeData = (treeData, treeName) => {
    let treeObj = { //Handle service tree data
      id: 'All',
      children: []
    };
    let formattedTreeData = [];

    if (treeData === null) { //Handle the case for no data
      treeObj.label = t('txt-all') + ' (0)';

      _.forEach(SEVERITY_TYPE, val => { //Create ordered tree list for Emergency, Alert, Critical, Warning, Notice
        treeObj.children.push({
          id: val,
          label: <span>{val} (0)</span>
        });
      })

      return treeObj;
    }

    _.forEach(SEVERITY_TYPE, val => { //Create ordered tree list for Emergency, Alert, Critical, Warning, Notice
      formattedTreeData.push({
        [val]: treeData[val]
      });
    })

    _.forEach(formattedTreeData, val => {
      _.keys(val)
      .forEach(key => {
        let tempChild = [];
        let totalHostCount = 0;

        if (key && key !== 'default') {
          _.forEach(treeData[key], (val, key2) => {
            if (key2 === 'doc_count') {
              totalHostCount += val;
            } else {
              if (_.size(val) === 1) {
                tempChild.push({
                  id: key + key2,
                  key: key2,
                  label: this.getTreeLabel(key2, treeName, val.doc_count)
                });
              } else {
                let tempChild2 = [];

                _.forEach(val, (val2, key3) => {
                  if (key3 !== 'doc_count' && val2 && val2.doc_count) {
                    const serviceCount = val2.doc_count !== '' ? ' (' + val2.doc_count + ')' : '';

                    tempChild2.push({
                      id: key + key2 + key3,
                      key: key3,
                      label: <span>{key3} {serviceCount} <Button variant='outlined' color='primary' className={cx('button', {'active': treeName === key3})} onClick={this.selectTree.bind(this, key3, '')}>{t('events.connections.txt-addFilter')}</Button><i className={cx('fg fg-info', {'active': treeName === key3})} title={t('txt-info')} onClick={this.showSeverityInfo.bind(this, val2)}></i></span>
                    });
                  }
                })

                let childProperty = {
                  id: key + key2,
                  key: key2,
                  label: this.getTreeLabel(key2, treeName, val.doc_count)
                };

                if (tempChild2.length > 0) { //Push child only if child is not empty (ie. 'Pattern' doesn't have child)
                  childProperty.children = tempChild2;
                }

                tempChild.push(childProperty);
              }
            }
          })

          let treeProperty = {
            id: key,
            key,
            label: <span><i className={'fg fg-recode ' + key.toLowerCase()} />{key} ({helper.numberWithCommas(totalHostCount)}) <Button variant='outlined' color='primary' className={cx('button', {'active': treeName === key})} onClick={this.selectTree.bind(this, key, '')}>{t('events.connections.txt-addFilter')}</Button></span>
          };

          if (tempChild.length > 0) {
            treeProperty.children = tempChild;
          }

          treeObj.children.push(treeProperty);
        }
      })
    })

    treeObj.label = t('txt-all') + ' (' + helper.numberWithCommas(treeData.default.doc_count) + ')';

    return treeObj;
  }
  /**
   * Show severity level for private tree data
   * @method
   * @param {string} severity - severity info
   * @returns object display property
   */
  showSeverity = (severity) => {
    if (!severity) {
      return {
        display: 'none'
      };
    }
  }
  /**
   * Set the alert private tree data
   * @method
   * @param {string} treeData - alert tree data
   * @param {string} [treeName] - tree node name
   * @returns tree data object
   */
  getPrivateTreeData = (treeData, treeName) => {
    const path = PRIVATE_API.path;
    let treeObj = { //Handle service tree data
      id: 'All',
      children: []
    };

    _.keys(treeData)
    .forEach(key => {
      let tempChild = [];
      let treeProperty = {};

      if (key && key !== 'doc_count') {
        if (treeData[key][path].buckets.length > 0) {
          _.forEach(treeData[key][path].buckets, val => {
            if (val.key) {
              let nodeClass = 'fg fg-recode';

              if (val._severity_) {
                nodeClass += ' ' + val._severity_.toLowerCase();
              }

              tempChild.push({
                id: val.key,
                key: val.key,
                label: <span><i className={nodeClass} />{val.key} ({helper.numberWithCommas(val.doc_count)}) <Button variant='outlined' color='primary' className={cx('button', {'active': treeName === val.key})} onClick={this.selectTree.bind(this, val.key, 'sourceIP')}>{t('events.connections.txt-addFilter')}</Button></span>
              });
            }
          })
        }

        let nodeClass = 'fg fg-recode';

        if (treeData[key]._severity_) {
          nodeClass += ' ' + treeData[key]._severity_.toLowerCase();
        }

        treeProperty = {
          id: key,
          key,
          label: <span><i className={nodeClass} style={this.showSeverity(treeData[key]._severity_)} />{key} ({helper.numberWithCommas(treeData[key].doc_count)}) <Button variant='outlined' color='primary' className={cx('button', {'active': treeName === key})} onClick={this.selectTree.bind(this, key, 'sourceIP')}>{t('events.connections.txt-addFilter')}</Button></span>
        };

        if (tempChild.length > 0) {
          treeProperty.children = tempChild;
        }

        treeObj.children.push(treeProperty);
      }
    })

    treeObj.label = t('txt-all') + ' (' + helper.numberWithCommas(treeData.doc_count) + ')';

    return treeObj;
  }
  /**
   * Set the alert public tree data
   * @method
   * @param {string} treeData - alert tree data
   * @param {string} [treeName] - tree node name
   * @returns tree data object
   */
  getPublicTreeData = (treeData, treeName) => {
    const path = PUBLIC_API.path;
    let treeObj = { //Handle service tree data
      id: 'All',
      children: []
    };

    _.keys(treeData)
    .forEach(key => {
      if (key && key !== 'doc_count') {
        _.forEach(treeData[path].buckets, val => {
          if (val.key) {
            treeObj.children.push({
              id: val.key,
              key: val.key,
              label: this.getTreeLabel(val.key, treeName, val.doc_count, 'srcCountry')
            });
          }
        })
      }
    })

    treeObj.label = t('txt-all') + ' (' + helper.numberWithCommas(treeData.doc_count) + ')';

    return treeObj;
  }
  /**
   * Handle checkbox check/uncheck
   * @method
   * @param {string} agentId - selected IDs for edge
   * @param {object} event - event object
   */
  toggleCheckbox = (agentId, event) => {
    let edgeFilterData = _.cloneDeep(this.state.edgeFilterData);

    if (event.target.checked) {
      edgeFilterData.push({
        condition: 'either',
        query: '_edgeId: "' + agentId + '"'
      });
    } else {
      const index = edgeFilterData.indexOf(agentId);
      edgeFilterData.splice(index, 1);
    }

    this.setState({
      edgeFilterData
    });
  }
  /**
   * Set the edges tree data
   * @method
   * @param {string} treeData - edges tree data
   * @returns tree data object
   */
  getEdgesTreeData = (treeData) => {
    const path = EDGES_API.path;
    let treeObj = { //Handle service tree data
      id: 'All',
      children: []
    };

    _.keys(treeData)
    .forEach(key => {
      if (key && key !== 'doc_count') {
        _.forEach(treeData[path].buckets, val => {
          if (val.agentId) {
            treeObj.children.push({
              id: val.agentId,
              key,
              label: <div><Checkbox onChange={this.toggleCheckbox.bind(this, val.agentId)} color='primary' /><span>{val.agentName} ({val.serviceType}) ({helper.numberWithCommas(val.doc_count)}) </span></div>
            });
          }
        })
      }
    })

    treeObj.label = t('txt-all') + ' (' + helper.numberWithCommas(treeData.doc_count) + ')';

    return treeObj;
  }
  /**
   * Handle alert search submit
   * @method
   */
  handleSearchSubmit = () => {
    const {activeTab, subSectionsData, alertChartsList} = this.state;
    let tempSubSectionsData = {...subSectionsData};
    let tempAlertChartsList = alertChartsList;
    tempSubSectionsData.mainData[activeTab] = null;

    _.forEach(tempAlertChartsList, (val, i) => {
      tempAlertChartsList[i].chartData = null;
    })

    this.setState({
      currentPage: 1,
      oldPage: 1,
      pageSize: 20,
      treeData: {
        alert: {
          title: '',
          rawData: {},
          data: null,
          currentTreeName: ''
        },
        private: {
          title: '',
          rawData: {},
          data: {},
          currentTreeName: ''
        },
        public: {
          title: '',
          rawData: {},
          data: {},
          currentTreeName: ''
        },
        edge: {
          title: '',
          rawData: {},
          data: {}
        }
      },
      subSectionsData: tempSubSectionsData,
      alertChartsList: tempAlertChartsList,
      alertPieData: {},
      alertTableData: {}
    }, () => {
      this.loadTreeData();
      this.setChartIntervalBtn();
      this.setStatisticsTab();
    });
  }
  /**
   * Handle alert search reset
   * @method
   * @param {string} [type] - reset type ('filter' or 'mark')
   */
  handleResetBtn = (type) => {
    const filterData = [{
      condition: 'must',
      query: ''
    }];
    let tempQueryData = {...this.state.queryData};
    tempQueryData.displayId = '';
    tempQueryData.displayName = '';
    tempQueryData.openFlag = false;

    this.setState({
      filterData,
      queryData: tempQueryData
    });
  }
  /**
   * Handle pagination change
   * @method
   * @param {number} currentPage - current page
   * @param {string} options - options for 'alertDetails'
   */
  handlePaginationChange = (currentPage, options) => {
    this.setState({
      currentPage
    }, () => {
      this.loadThreatsData(options);
    });
  }
  /**
   * Handle page size dropdown
   * @method
   * @param {string} pageSize - current page size
   */
  handlePageDropdown = (pageSize) => {
    this.setState({
      currentPage: 1,
      pageSize: Number(pageSize)
    }, () => {
      this.loadThreatsData();
    });
  }
  /**
   * Handle table sort
   * @method
   * @param {object} sort - sort data object
   */
  handleTableSort = (sort) => {
    let tempSort = {...this.state.sort};
    tempSort.field = sort.field;
    tempSort.desc = sort.desc;

    this.setState({
      sort: tempSort
    }, () => {
      this.loadThreatsData();
    });
  }
  /**
   * Handle tree filter button selection
   * @method
   * @param {string} value - selected node name
   * @param {string} [field] - corresponding field of selected node
   */
  selectTree = (value, field) => {
    this.setState({
      loadAlertData: false
    }, () => {
      this.addSearch(field, value, 'must');
    });
  }
  /**
   * Add tree node to search filter
   * @method
   * @param {string} [field] - corresponding field of selected node
   * @param {string} value - selected node name
   * @param {string} type - condition of selected node ('must', 'must_not' or 'either')
   */
  addSearch = (field, value, type) => {
    const {filterData} = this.state;
    let currentFilterData = filterData;

    if (filterData.length === 0) {
      currentFilterData.push({});
    }

    if (field) {
      if (field === 'srcCountry') {
        value = field + ': "' + value + '"';
      } else {
        value = field + ': ' + value;
      }
    }

    _.forEach(filterData, (val, i) => {
      if (filterData[filterData.length - 1].query) {
        currentFilterData.push({
          condition: type,
          query: value
        });
        return false;
      }

      if (!currentFilterData[i].query) {
        currentFilterData[i].condition = type;
        currentFilterData[i].query = value;
        return false;
      }
    })

    this.setState({
      showFilter: true,
      filterData: currentFilterData
    });

    this.handleCloseQueryMenu();
  }
  /**
   * Add tree node to search filter
   * @method
   * @param {string} index - index of the alert data
   * @param {object} allValue - alert data
   * @param {object} event - event object
   */
  handleRowDoubleClick = (index, allValue, event) => {
    this.openDetailInfo(index, allValue);

    event.stopPropagation();
    return null;
  }
  /**
   * Display alert details modal dialog 
   * @method
   * @returns AlertDetails component
   */
  alertDialog = () => {
    const {sessionRights} = this.context;
    const {datetime, currentPage, pageSize, alertDetails, alertData, subSectionsData} = this.state;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    let actions = {
      confirm: {text: t('txt-close'), handler: this.closeDialog}
    };

    if (sessionRights.Module_Config) {
      actions = {
        makeIncident: {text: it('txt-createIncident'), handler: this.incidentRedirect},
        confirm: {text: t('txt-close'), handler: this.closeDialog}
      };
    }

    return (
      <AlertDetails
        titleText={t('alert.txt-alertInfo')}
        datetime={dateTime}
        actions={actions}
        alertDetails={alertDetails}
        alertData={alertData}
        showAlertData={this.showAlertData}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPageCount={subSectionsData.totalCount.alert}
        fromPage='threats' />
    )
  }
  /**
   * Set the alert index and get the alert data
   * @method
   * @param {string} type - button action type ('previous' or 'next')
   */
  showAlertData = (type) => {
    const {currentPage, alertDetails} = this.state;
    let tempAlertDetails = {...alertDetails};
    let tempCurrentPage = currentPage;

    if (type === 'previous') {
      if (alertDetails.currentIndex === 0) { //End of the data, load previous set
        this.handlePaginationChange(--tempCurrentPage, 'alertDetails');
        return;
      } else {
        tempAlertDetails.currentIndex--;
      }
    } else if (type === 'next') {
      if (alertDetails.currentLength - alertDetails.currentIndex === 1) { //End of the data, load next set
        this.handlePaginationChange(++tempCurrentPage, 'alertDetails');
        return;
      } else {
        tempAlertDetails.currentIndex++;
      }
    }

    this.setState({
      alertDetails: tempAlertDetails
    }, () => {
      const {alertDetails} = this.state;
      const index = alertDetails.currentIndex;
      let data = '';

      if (alertDetails.currentID) {
        data = alertDetails.publicFormatted.srcIp[alertDetails.currentID] || alertDetails.publicFormatted.destIp[alertDetails.currentID];
      } else {
        data = alertDetails.all[index];
      }
      this.openDetailInfo(index, data);
    });
  }
  /**
   * Set the individual alert data
   * @method
   * @param {string} type - button action type ('previous' or 'next')
   */
  openDetailInfo = (index, allValue, evt) => {
    const {alertDetails} = this.state;
    let tempAlertDetails = {...alertDetails};
    let alertData = '';

    if (_.isArray(allValue)) { //For click from World Map
      alertData = allValue[index];
    } else {
      tempAlertDetails.currentIndex = Number(index);

      if (allValue) {
        alertData = allValue;
      } else {
        alertData = alertDetails.all[Number(index)];
      }
    }

    this.setState({
      currentTableID: alertData.id,
      alertDetailsOpen: true,
      alertDetails: tempAlertDetails,
      alertData
    });
  }
  /**
   * Close modal dialog and reset data
   * @method
   */
  closeDialog = () => {
    const tempAlertDetails = {
      ...this.state.alertDetails,
      currentID: '',
      currentIndex: ''
    };

    this.setState({
      alertDetails: tempAlertDetails,
      openQueryOpen: false,
      saveQueryOpen: false,
      alertDetailsOpen: false
    }, () => {
      this.clearQueryData();
    });
  }
  /**
   * redirect to incident page
   * @method
   */
  incidentRedirect = () => {
    const {alertData} = this.state;
    let timeInMss = Date.now();
    sessionStorage.setItem(timeInMss, JSON.stringify(alertData));

    window.location.href = '/SCP/soc/incident?alertDataId=' + timeInMss;
  };
  /**
   * Set new datetime and reload page data
   * @method
   * @param {string} type - date type ('from', 'to', 'customTime' or 'refresh')
   * @param {object} newDatetime - new datetime object
   */
  handleDateChange = (type, newDatetime) => {
    let tempDatetime = {...this.state.datetime};

    if (type === 'customTime' || type === 'refresh') {
      tempDatetime.from = newDatetime.from;
      tempDatetime.to = newDatetime.to;
    } else {
      tempDatetime[type] = newDatetime;
    }

    this.setState({
      datetime: tempDatetime
    }, () => {
      if (type === 'refresh') {
        this.loadTreeData();
        this.loadThreatsData('search');
      }
    });
  }
  /**
   * Handle content tab change
   * @method
   * @param {object} event - event object
   * @param {string} newTab - content type ('table' or 'statistics')
   */
  handleSubTabChange = (event, newTab) => {
    this.setState({
      activeSubTab: newTab
    });
  }
  /**
   * Handle chart interval change for Connections events
   * @method
   * @param {object} event - event object
   * @param {string} type - interval type
   */
  handleIntervalChange = (event, type) => {
    if (!type) {
      return;
    }

    this.setState({
      chartIntervalValue: type
    }, () => {
      this.loadThreatsData();
    });
  }
  /**
   * Display alert table data
   * @method
   * @returns Alert component
   */
  renderTabContent = () => {
    const {activeTab} = this.state;
    const mainContentData = {
      activeTab,
      chartColors: ALERT_LEVEL_COLORS,
      tableUniqueID: 'id',
      chartIntervalList: this.state.chartIntervalList,
      chartIntervalValue: this.state.chartIntervalValue,
      chartIntervalChange: this.handleIntervalChange,
      getChartsCSVfile: this.getChartsCSVfile,
      getLeftNavCSVfile: this.getLeftNavCSVfile,
      subTabMenu: this.state.subTabMenu,
      activeSubTab: this.state.activeSubTab,
      handleSubTabChange: this.handleSubTabChange,
      currentTableID: this.state.currentTableID,
      queryData: this.state.queryData,
      filterData: this.state.filterData,
      account: this.state.account,
      showFilter: this.state.showFilter,
      showChart: this.state.showChart,
      alertChartsList: this.state.alertChartsList,
      alertTableData: this.state.alertTableData,
      toggleFilter: this.toggleFilter,
      toggleChart: this.toggleChart,
      openQuery: this.openQuery,
      setFilterData: this.setFilterData,
      handleResetBtn: this.handleResetBtn,
      handleSearchSubmit: this.handleSearchSubmit,
      treeData: this.state.treeData,
      showTreeFilterBtn: this.showTreeFilterBtn,
      dataTableData: this.state.subSectionsData.mainData[activeTab],
      dataTableFields: this.state.subSectionsData.fieldsData[activeTab],
      mainEventsData: this.state.mainEventsData,
      dataTableSort: this.state.sort,
      handleTableSort: this.handleTableSort,
      handleRowDoubleClick: this.handleRowDoubleClick,
      paginationTotalCount: this.state.subSectionsData.totalCount[activeTab],
      paginationPageSize: this.state.pageSize,
      paginationCurrentPage: this.state.currentPage,
      paginationPageChange: this.handlePaginationChange,
      paginationDropDownChange: this.handlePageDropdown
    };

    return (
      <Threats
        mainContentData={mainContentData}
        tabChartData={{
          chartData: this.state.alertHistogram
        }} />
    )
  }
  /**
   * Get request data for CSV file
   * @method
   * @param {string} url - request URL
   * @param {string} [columns] - columns for CSV file
   */
  getCSVrequestData = (url, columns) => {
    let dataOptions = {
      ...this.toQueryLanguage('csv')
    };

    if (columns === 'columns') {
      let tempColumns = [];

      _.forEach(SUBSECTIONS_DATA.subSectionsData.tableColumns.alert, val => {
        tempColumns.push({
          [val]: f(`alertFields.${val}`)
        });
      })

      dataOptions.columns = tempColumns;
    }

    downloadWithForm(url, {payload: JSON.stringify(dataOptions)});
  }
  /**
   * Handle CSV download
   * @method
   */
  getCSVfile = () => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/u2/alert/_export`;
    this.getCSVrequestData(url, 'columns');
  }
  /**
   * Handle Charts CSV download
   * @method
   */
  getChartsCSVfile = () => {
    const {baseUrl, contextRoot} = this.context;
    const {chartIntervalValue} = this.state;
    const url = `${baseUrl}${contextRoot}/api/u2/alert/histogram/_export?histogramInterval=${chartIntervalValue}`;
    this.getCSVrequestData(url);
  }
  /**
   * Handle Left Nav CSV download
   * @method
   */
  getLeftNavCSVfile = () => {
    const {baseUrl, contextRoot} = this.context;
    const {datetime} = this.state;
    const url = `${baseUrl}${contextRoot}/api/alert/severityRuleAgg/_export`;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    const dataOptions = {
      timestamp: [dateTime.from, dateTime.to]
    };
    downloadWithForm(url, {payload: JSON.stringify(dataOptions)});
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
   * Toggle query menu on/off
   * @method
   * @param {string} type - type of query menu ('open' or 'save')
   */
  openQuery = (type) => {
    if (type === 'open') {
      const {queryData} = this.state;
      let tempQueryData = {...queryData};
      tempQueryData.id = queryData.list[0].id;
      tempQueryData.name = queryData.list[0].name;
      tempQueryData.query = queryData.list[0].queryText;
      tempQueryData.emailList = queryData.list[0].emailList;

      this.setState({
        queryData: tempQueryData,
        openQueryOpen: true
      });
    } else if (type === 'save') {
      this.setState({
        saveQueryOpen: true
      });
    }
  }
  /**
   * Set filter data
   * @method
   * @param {array.<object>} filterData - filter data to be set
   */
  setFilterData = (filterData) => {
    this.setState({
      filterData
    });
  }
  /**
   * Set query data
   * @method
   * @param {object} queryData - query data to be set
   */
  setQueryData = (queryData) => {
    this.setState({
      queryData
    });
  }
  /**
   * Set notify email data
   * @method
   * @param {object} queryData - query data to be set
   */
  setNotifyEmailData = (notifyEmailData) => {
    this.setState({
      notifyEmailData
    });
  }
  /**
   * Display query menu modal dialog
   * @method
   * @param {string} type - query type ('open' or 'save')
   * @returns QueryOpenSave component
   */
  queryDialog = (type) => {
    const {activeTab, account, filterData, queryData, notifyEmailData} = this.state;

    return (
      <QueryOpenSave
        activeTab={activeTab}
        type={type}
        account={account}
        filterData={filterData}
        queryData={queryData}
        notifyEmailData={notifyEmailData}
        setFilterData={this.setFilterData}
        setQueryData={this.setQueryData}
        setNotifyEmailData={this.setNotifyEmailData}
        getSavedQuery={this.getSavedQuery}
        closeDialog={this.closeDialog} />
    )
  }
  /**
   * Toggle chart content on/off
   * @method
   */
  toggleChart = () => {
    this.setState({
      showChart: !this.state.showChart
    });
  }
  /**
   * Set search options data
   * @method
   * @param {string} type - search type to be set ('all' and everything else)
   * @param {string | object} event - event object
   */
  setSearchData = (type, event) => {
    const value = event.target ? event.target.value : event;

    if (type === 'all') {
      this.setState({
        searchInput: value
      });
    } else {
      let tempSearchInput = {...this.state.searchInput};

      if (value) {
        tempSearchInput[type] = value;

        this.setState({
          searchInput: tempSearchInput
        });
      }
    }
  }
  /**
   * Reset query data
   * @method
   */
  clearQueryData = () => {
    let tempQueryData = {...this.state.queryData};
    tempQueryData.inputName = '';
    tempQueryData.openFlag = false;

    this.setState({
      queryData: tempQueryData,
      notifyEmailData: []
    });
  }
  render() {
    const {
      activeTab,
      datetime,
      searchInput,
      subSectionsData,
      openQueryOpen,
      saveQueryOpen,
      contextAnchor,
      currentQueryValue,
      filterData,
      showChart,
      showFilter,
      alertDetailsOpen
    } = this.state;
    let filterDataCount = 0;

    _.forEach(filterData, val => {
      if (val.query) {
        filterDataCount++;
      }
    })

    return (
      <div>
        {openQueryOpen &&
          this.queryDialog('open')
        }

        {saveQueryOpen &&
          this.queryDialog('save')
        }

        {alertDetailsOpen &&
          this.alertDialog()
        }

        <Menu
          anchorEl={contextAnchor}
          keepMounted
          open={Boolean(contextAnchor)}
          onClose={this.handleCloseQueryMenu}>
          <MenuItem onClick={this.addSearch.bind(this, '', currentQueryValue, 'must')}>Must</MenuItem>
          <MenuItem onClick={this.addSearch.bind(this, '', currentQueryValue, 'must_not')}>Must Not</MenuItem>
          <MenuItem onClick={this.addSearch.bind(this, '', currentQueryValue, 'either')}>Either</MenuItem>
        </Menu>

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button variant='outlined' color='primary' className={cx({'active': showFilter})} onClick={this.toggleFilter} title={t('events.connections.txt-toggleFilter')}><i className='fg fg-filter'></i><span>({filterDataCount})</span></Button>
            <Button variant='outlined' color='primary' className={cx({'active': showChart})} onClick={this.toggleChart} title={t('events.connections.txt-toggleChart')}><i className='fg fg-chart-columns'></i></Button>
            <Button variant='outlined' color='primary' className='last' onClick={this.getCSVfile} title={t('txt-exportCSV')}><i className='fg fg-data-download'></i></Button>
          </div>

          <SearchOptions
            datetime={datetime}
            searchInput={searchInput}
            showFilter={showFilter}
            showInterval={true}
            setSearchData={this.setSearchData}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.handleSearchSubmit} />
        </div>

        {this.renderTabContent()}
      </div>
    )
  }
}

ThreatsController.contextType = BaseDataContext;

ThreatsController.propTypes = {
};

export default withRouter(ThreatsController);