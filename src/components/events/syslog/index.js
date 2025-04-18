import React, { Component } from 'react'
import { withRouter } from 'react-router'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import _ from 'lodash'
import cx from 'classnames'
import queryString from 'query-string'

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import {analyze} from 'vbda-ui/build/src/analyzer'
import {config as configLoader} from 'vbda-ui/build/src/loader'
import {downloadWithForm} from 'react-ui/build/src/utils/download'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {arrayMove} from 'react-sortable-hoc'
import ReactJson from 'react-json-view'

import {BaseDataContext} from '../../common/context'
import ExportCSV from '../../common/export-csv'
import helper from '../../common/helper'
import QueryOpenSave from '../../common/query-open-save'
import SearchOptions from '../../common/search-options'
import SortableList from '../../common/sortable-list'
import Syslog from './syslog'
import TableCell from '../../common/table-cell'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const UTC_TIME_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$/;

const PATTERN_INIT_DATA = {
  name: '',
  ruleCatgory: 'Pattern', // 'Pattern' or 'ML'
  severity: 'Emergency',
  aggColumn: '',
  periodMin: 10,
  threshold: 1,
  ruleType: 'abnormal',
  observeColumn: '',
  trainingDataTime: 1,
  trainingTimeScale: 1,
  trainingTimeScaleUnit: 'hour',
  thresholdWeight: 'low'
}

let t = null;
let f = null;
let et = null;

/**
 * Syslog
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to handle the business logic for the syslog page
 */
class SyslogController extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');

    this.state = {
      activeTab: 'logs',
      previousTab: '',
      //General
      datetime: {
        from: helper.getSubstractDate(1, 'hour'),
        to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
        //from: '2019-07-25T03:10:00Z',
        //to: '2019-08-01T04:10:00Z'
      },
      chartIntervalList: [],
      chartIntervalValue: '',
      //Left nav
      treeRawData: {},
      treeData: null,
      currentTreeName: '',
      //Tab Menu
      subTabMenu: {
        table: t('txt-table'),
        linkAnalysis: t('txt-linkAnalysis'),
        statistics: t('txt-statistics')
      },
      activeSubTab: 'table',
      //Search bar
      searchInput: {
        searchType: 'manual', //'manual' or 'auto'
        searchInterval: '1h',
        refreshTime: '60000' //1 min.
      },
      eventHistogram: {},
      popOverAnchor: null,
      taskServiceList: {
        data: null,
        scrollCount: 0,
        pageSize: 10,
        hasMore: true
      },
      filterData: [{
        condition: 'must',
        query: ''
      }],
      markData: [{
        data: '',
        color: 'red'
      }],
      syslogData: {
        dataFieldsArr: [],
        dataFields: [],
        dataContent: null,
        sort: {
          field: '@timestamp',
          desc: true
        },
        totalCount: 0,
        currentPage: 1,
        oldPage: 1,
        pageSize: 20
      },
      laData: {
        dataContent: [],
        LAconfig: {},
        logEventsData: {},
        totalCount: 0,
        currentPage: 1,
        pageSize: 500
      },
      syslogContextAnchor: null,
      currentSyslogData: {},
      logFields: [],
      account: {
        id: '',
        login: false,
        fields: [],
        logsLocale: ''
      },
      sortedDataList: [],
      queryData: {
        id: '',
        name: '',
        patternId: '',
        inputName: '',
        displayId: '',
        displayName: '',
        list: [],
        query: '',
        formattedQuery: '',
        pattern: {
          name: '',
          aggColumn: '',
          periodMin: '',
          threshold: '',
          severity: ''
        },
        emailList: [],
        openFlag: false
      },
      queryDataPublic: {
        id: '',
        name: '',
        inputName: '',
        displayId: '',
        displayName: '',
        list: [],
        query: '',
        formattedQuery: '',
        openFlag: false
      },
      queryContextAnchor: null,
      currentQueryField: '',
      currentQueryValue: '',
      notifyEmailData: [],
      newQueryName: true,
      showFilter: false,
      showMark: false,
      showChart: false,
      modalOpen: false,
      openQueryOpen: false,
      saveQueryOpen: false,
      tableMouseOver: false,
      currentTableIndex: '',
      currentLength: '',
      currentTableID: '',
      queryModalType: '',
      logLocaleChangeOpen: false,
      logActiveField: '',
      logCustomLocal: '',
      loadLogsData: true,
      syslogRequest: {},
      statisticsData: {
        data: null,
        column: '',
        pageSize: '10'
      },
      statisticsTableChart: {
        dataFieldsArr: ['key', 'doc_count'],
        dataFields: [],
        dataContent: null,
        sort: {
          field: 'doc_count',
          desc: true
        }
      }
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

      this.setState({
        account: tempAccount
      }, () => {
        this.getLAconfig();
        this.getSavedQuery();
        this.getPublicSavedQuery();
        this.getSyslogTree();
        this.setChartIntervalBtn();
        this.initialLoad();
      });
    }
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get and set the Link Analysis config
   * @method
   */
  getLAconfig = () => {
    const {baseUrl} = this.context;

    helper.getLAconfig(baseUrl)
    .then(data => {
      if (!_.isEmpty(data)) {
        let tempLaData = {...this.state.laData};
        tempLaData.LAconfig = configLoader.processAll(data);

        this.setState({
          laData: tempLaData
        });
      }
      return null;
    });
  }
  /**
   * Get and set the account saved query
   * @method
   */
  getSavedQuery = () => {
    const {baseUrl} = this.context;
    const {account, queryData} = this.state;

    helper.getSavedQuery(baseUrl, account, queryData, 'syslog')
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
   * Get and set the public saved query
   * @method
   */
  getPublicSavedQuery = () => {
    const {baseUrl} = this.context;
    const {queryDataPublic} = this.state;

    helper.getPublicSavedQuery(baseUrl, queryDataPublic, 'syslog')
    .then(data => {
      if (!_.isEmpty(data)) {
        this.setState({
          queryDataPublic: data
        });
      }
      return null;
    });
  }
  /**
   * Get and set syslog tree data
   * @method
   */
  getSyslogTree = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/u2/log/event/_event_source_tree`,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        this.setState({
          treeRawData: data,
          treeData: this.getTreeData(data)
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
   * Set initial data for page load
   * @method
   */
  initialLoad = () => {
    const {searchInput} = this.state;
    const syslogParams = queryString.parse(location.search);

    if (syslogParams.configSource && syslogParams.loghostIp) {
      this.setState({
        filterData: [
          {
            condition: 'must',
            query: '(configSource: "' + syslogParams.configSource + '" OR netproxy.config_source: "' + syslogParams.configSource + '")'
          }, {
            condition: 'must',
            query: '(LoghostIp: "' + syslogParams.loghostIp + '" OR netproxy.loghost_ip: "' + syslogParams.loghostIp + '")'
          }
        ],
        showFilter: true,
        showMark: true
      });
    } else if (syslogParams.configSource && syslogParams.ip) {
      let tempSearchInput = {...searchInput};
      tempSearchInput.searchInterval = 'today';

      this.setState({
        datetime: {
          from: helper.getSubstractDate(1, 'day'),
          to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
        },
        searchInput: tempSearchInput,
        filterData: [
          {
            condition: 'must',
            query: '(configSource: "' + syslogParams.configSource + '" OR netproxy.config_source: "' + syslogParams.configSource + '")'
          }, {
            condition: 'must',
            query: '_host: ' + syslogParams.ip
          }
        ],
        showFilter: true,
        showMark: true
      });
    } else if (syslogParams.configSource) {
      let tempSearchInput = {...searchInput};

      if (syslogParams.interval) {
        tempSearchInput.searchInterval = syslogParams.interval;
      }

      this.setState({
        searchInput: tempSearchInput,
        filterData: [{
          condition: 'must',
          query: '(configSource: "' + syslogParams.configSource + '" OR netproxy.config_source: "' + syslogParams.configSource + '")'
        }],
        showFilter: true,
        showMark: true
      });
    } else if (syslogParams.srcIp || syslogParams.ipSrc) {
      let srcIp = '';

      if (syslogParams.srcIp) {
        srcIp = syslogParams.srcIp;
      } else if (syslogParams.ipSrc) {
        srcIp = syslogParams.ipSrc;
      }

      this.setState({
        filterData: [{
          condition: 'must',
          query: 'type: eventlog'
        },
        {
          condition: 'must',
          query: '_host: "' + srcIp + '"'
        }],
        showFilter: true,
        showMark: true
      });
    } else if (syslogParams.from && syslogParams.to) {
      this.setState({
        datetime: {
          from: syslogParams.from,
          to: syslogParams.to
        },
        filterData: [{
          condition: 'must',
          query: '"' + syslogParams.sourceIP + '"'
        }],
        showFilter: true,
        showMark: true
      });
    }

    this.loadFields(this.state.activeTab);
  }
  /**
   * Get and set event fields of the account
   * @method
   * @param {string} activeTab - current tab
   * @param {string} options - options for 'showDefault'
   */
  loadFields = (activeTab, options) => {
    const {baseUrl} = this.context;
    const {syslogData, account} = this.state;
    let url = `${baseUrl}/api/account/log/fields`;
    let tempSyslogData = {...syslogData};
    let tempAccont = {...account};

    if (account.id && account.login && !options) {
      url += `?accountId=${account.id}`;
    }

    this.ah.one({
      url,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data.length > 0) {
        let fieldsArr = [];

        if (!_.includes(data, '_tableMenu_')) {
          fieldsArr.push('_tableMenu_');
        }

        _.forEach(data, val => {
          fieldsArr.push(val);
        });

        //Filter out the columns that are not in the account fields
        const filterArr = _.remove(syslogData.dataFieldsArr, item => {
          return _.indexOf(fieldsArr, item) < 0;
        });

        //Merge the account fields and all other fields
        tempSyslogData.dataFieldsArr = _.concat(fieldsArr, filterArr);
        tempAccont.fields = fieldsArr;

        this.setState({
          syslogData: tempSyslogData,
          account: tempAccont
        }, () => {
          this.loadLogsFields();
        });
      } else {
        this.loadFields(activeTab, 'showDefault');
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set the list of log event fields
   * @method
   */
  loadLogsFields = () => {
    const {baseUrl} = this.context;
    const {datetime} = this.state;
    const url = `${baseUrl}/api/log/event/fields`;
    const requestData = {
      startDttm: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      endDttm: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        let fieldsArr = ['_tableMenu_'];

        _.forEach(data, val => {
          fieldsArr.push(val);
        });

        this.setState({
          logFields: fieldsArr
        }, () => {
          this.loadLogsLocaleFields();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set the customized locales name for fields
   * @method
   */
  loadLogsLocaleFields = () => {
    const {baseUrl} = this.context;
    const {account} = this.state;

    if (!account.id) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/account/log/locales?accountId=${account.id}`,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        let tempAccount = {...account};
        let localObj = {};

        _.forEach(data, (val, key) => {
          localObj[val.field] = val.locale;
        })
        tempAccount.logsLocale = localObj;

        this.setState({
          account: tempAccount
        }, () => {
          this.loadLogs();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Hide certain columns for the table
   * @method
   * @param {string} field - field name
   * @returns boolean true/false
   */
  checkDisplayFields = (field) => {
    return _.includes(this.state.account.fields, field);
  }
  /**
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable field
   */
  checkSortable = (field) => {
    const unSortableFields = ['_tableMenu_', 'base64', 'filePath', 'controlText', 'htmlRelinkPath', 'body', 'requestRawHeader', 'responseRawHeader', 'uploadData', 'dnsho'];

    if (field === '@timestamp') {
      return true;
    } else {
      return false;
    }

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return false;
    }
  }
  /**
   * Reset link analysis data to avoid weird display in LA
   * @method
   * @param {string} options - option for 'search'
   */
  resetLinkAnalysis = (options) => {
    let tempLaData = {...this.state.laData};
    tempLaData.dataContent = [];

    this.setState({
      laData: tempLaData
    }, () => {
      this.loadLinkAnalysis(options);
    });
  }
  /**
   * Get and set link analysis data
   * @method
   * @param {string} options - option for 'search'
   */
  loadLinkAnalysis = (options) => {
    const {baseUrl} = this.context;
    const {laData} = this.state;
    const page = options === 'search' ? 1 : laData.currentPage;
    const url = `${baseUrl}/api/u1/log/event/_search?page=${page}&pageSize=${laData.pageSize}`;
    const requestData = this.toQueryLanguage();
    let tempLaData = {...laData};
    let logEventsData = {};
    let eventHistogram = {};

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      if (data.data.rows) {
        const logsData = data.data;

        _.forEach(logsData.rows, val => {
          logEventsData[val.id] = val.content;
        })

        tempLaData.currentPage = page;
        tempLaData.totalCount = logsData.counts;
        tempLaData.dataContent = analyze(logEventsData, laData.LAconfig, {analyzeGis: false});
        tempLaData.logEventsData = logEventsData;

        this.setState({
          laData: tempLaData
        });
      } else {
        helper.showPopupMsg(t('txt-notFound'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Construct the netflow events api request body
   * @method
   * @param {string} options - option for 'csv'
   * @returns requst data object
   */
  toQueryLanguage = (options) => {
    const {datetime, filterData, syslogData, markData} = this.state;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    let dataObj = {
      '@timestamp': [dateTime.from, dateTime.to],
      sort: [{
        [syslogData.sort.field]: syslogData.sort.desc ? 'desc' : 'asc'
      }]
    };
    let filterDataArr = [];
    let markDataArr = [];

    if (filterData.length > 0) {
      filterDataArr = helper.buildFilterDataArray(filterData);

      if (filterDataArr.length > 0) {
        dataObj.filters = filterDataArr;
      }
    }

    _.forEach(markData, val => {
      if (val.data) {
        markDataArr.push(val.data);
      }
    })

    if (markDataArr.length > 0) {
      dataObj.search = markDataArr;
    }

    if (options == 'csv') {
      const timezone = momentTimezone.tz(momentTimezone.tz.guess()); //Get local timezone object
      const utc_offset = timezone._offset / 60; //Convert minute to hour
      dataObj.timeZone = utc_offset;
    }

    return dataObj;
  }
  /**
   * Get custom field name
   * @method
   * @param {string} field - field name
   * @returns field name
   */
  getCustomFieldName = (field) => {
    const {account} = this.state;

    if (_.has(account.logsLocale, field)) {
      return account.logsLocale[field];
    } else {
      return f(`logsFields.${field}`);
    }
  }
  /**
   * Load Syslog data
   * @method
   * @param {string} options - option for 'search' or dialogType ('table' or 'json')
   * @param {string} [fromPage] - option for 'currentPage'
   * @param {string} type - button action type ('previous' or 'next')
   */
  loadLogs = (options, fromPage, type) => {
    const {baseUrl} = this.context;
    const {activeTab, chartIntervalValue, syslogData, markData} = this.state;
    const page = fromPage === 'currentPage' ? syslogData.currentPage : 0;

    this.ah.all([{
      url: `${baseUrl}/api/u1/log/event/_search?page=${page + 1}&pageSize=${syslogData.pageSize}`,
      data: JSON.stringify(this.toQueryLanguage()),
      type: 'POST',
      contentType: 'text/plain'
    },
    {
      url: `${baseUrl}/api/u1/log/event/_search?page=0&pageSize=0&timeline=true&interval=${chartIntervalValue}`,
      data: JSON.stringify(this.toQueryLanguage()),
      type: 'POST',
      contentType: 'text/plain'
    }])
    .then(data => {
      if (data) {
        let tempSyslogData = {...syslogData};

        if (syslogData.currentPage > 1 && data[0].data.counts === 0) { //Exceed 10,000 data count
          helper.showPopupMsg('', t('txt-error'), t('txt-maxDataMsg'));

          tempSyslogData.currentPage = syslogData.oldPage;

          this.setState({
            syslogData: tempSyslogData
          });
          return;
        }

        if (_.isEmpty(data[0]) || _.isEmpty(data[1])) {
          return;
        }

        const dataObj = data[0].data;
        const currentLength = dataObj.rows.length < syslogData.pageSize ? dataObj.rows.length : syslogData.pageSize;
        let eventHistogram = {};

        if (dataObj.counts === 0) { //No data found
          tempSyslogData.dataContent = [];
          tempSyslogData.totalCount = 0;

          this.setState({
            syslogData: tempSyslogData,
            eventHistogram
          });
          return null;
        }

        const tempArray = dataObj.rows.map(tempData => {
          tempData.content.id = tempData.id;
          return tempData.content;
        });

        let tempFieldsArr = [];
        tempSyslogData.dataContent = tempArray;
        tempSyslogData.totalCount = data[0].data.counts;
        tempSyslogData.currentPage = page;
        tempSyslogData.oldPage = page;

        _.forEach(syslogData.dataFieldsArr, val => {
          if (this.checkDisplayFields(val)) {
            tempFieldsArr.push({
              name: val === '_tableMenu_' ? '' : val,
              label: this.getCustomFieldName(val),
              options: {
                sort: this.checkSortable(val),
                viewColumns: val === '_tableMenu_' ? false : true,
                customBodyRenderLite: (dataIndex, options) => {
                  const allValue = tempSyslogData.dataContent[dataIndex];
                  let value = _.get(tempSyslogData.dataContent[dataIndex], val);
                  let displayValue = '';

                  if (options === 'getAllValue') {
                    return allValue;
                  }

                  if (val === '_tableMenu_') {
                    return (
                      <div className={cx('table-menu active')}>
                        <Button variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue)}><i className='fg fg-more'></i></Button>
                      </div>
                    )
                  }
                  if (val === '@timestamp') {
                    value = helper.getFormattedDate(value, 'local');
                  }
                  if (typeof value === 'boolean') {
                    value = value.toString();
                  }
                  return (
                    <TableCell
                      activeTab={activeTab}
                      fieldValue={value}
                      fieldName={val}
                      allValue={allValue}
                      markData={markData}
                      onResize={this.handleTableCellResize}
                      handleOpenQueryMenu={this.handleOpenQueryMenu}
                      handleRowDoubleClick={this.handleRowDoubleClick.bind(this, dataIndex, allValue)}
                      handleRowMouseOver={this.handleRowMouseOver.bind(this, allValue.id)} />
                  )
                }
              }
            });
          }
        });

        tempSyslogData.dataFields = tempFieldsArr;

        const dataArray = tempSyslogData.dataContent;

        for (var i = 0; i < dataArray.length; i++) {
          for (var key in dataArray[i]) {
            if (Array.isArray(dataArray[i][key])) {
              tempSyslogData.dataContent[i][key] = helper.arrayDataJoin(dataArray[i][key], '', ', ');
            }
          }
        }

        if (data[1].search) {
          _.forEach(data[1].search, val => {
            eventHistogram[val.searchName] = val.eventHistogram
          })
        }

        this.setState({
          syslogData: tempSyslogData,
          eventHistogram,
          currentLength
        }, () => {
          if (options === 'table') {
            this.showTableData('', type);
          } else if (options === 'json') {
            this.showJsonData('', type);
          }
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleTableCellResize = (options) => {
    const {syslogData} = this.state;

    let tempSyslogData = {...syslogData};

    tempSyslogData.reload = new Date().getTime();

    this.setState({
      syslogData: tempSyslogData
    }, () => {
      if (options === 'table') {
        this.showTableData('', type);
      } else if (options === 'json') {
        this.showJsonData('', type);
      }
    });
  }
  /**
   * Load subtab content ('table' or 'link analysis')
   * @method
   * @param {string} options - option for 'search'
   */
  loadActiveSubTab = (options) => {
    const {activeSubTab} = this.state;

    if (activeSubTab === 'table') {
      this.loadLogs(options);
    } else if (activeSubTab === 'linkAnalysis') {
      this.loadLinkAnalysis(options);
    }
  }
  /**
   * Set the netflow events tree data
   * @method
   * @param {string} type - active tab
   * @param {string} value - tree node name
   * @param {object} event - event object
   */
  showTreeFilterBtn = (type, value, event) => {
    this.setState({
      currentTreeName: value,
      treeData: this.getTreeData(this.state.treeRawData, value)
    });

    event.stopPropagation();
  }
  /**
   * Get tree label
   * @method
   * @param {string} name - tree node name
   * @param {string} currentTreeName - current tree node name
   * @param {number} count - tree node length
   * @param {string} [query] - search query
   * @returns HTML DOM
   */
  getTreeLabel = (name, currentTreeName, count, query) => {
    const serviceCount = count !== '' ? ' (' + helper.numberWithCommas(count) + ')' : '';

    return <span>{name}{serviceCount} <Button variant='outlined' color='primary' className={cx('button', {'active': currentTreeName === name})} onClick={this.selectTree.bind(this, name, query)}>{t('events.connections.txt-addFilter')}</Button></span>;
  }
  /**
   * Set the netflow tree data
   * @method
   * @param {string} treeData - alert tree data
   * @param {string} treeName - tree node name
   * @returns tree data object
   */
  getTreeData = (treeData, treeName) => {
    const currentTreeName = treeName ? treeName : this.state.currentTreeName;
    let treeObj = { //Handle service tree data
      id: 'all',
      children: []
    };
    let allServiceCount = 0;

    _.forEach(treeData, (val, key) => {
      let tempChild = [];
      let label = '';

      if (key) {
        let i = 0;

        _.forEach(val, (val2, key2) => {
          let tempChild2 = [];
          i++;

          _.forEach(val2, (val3, i) => {
            tempChild2.push({
              id: val3 + i + '_lvl3',
              key: val3,
              label: this.getTreeLabel(val3, currentTreeName, '', '_host')
            });
          })

          tempChild.push({
            id: key2 + '_lvl2',
            key: key2,
            label: this.getTreeLabel(key2, currentTreeName, val2.length, 'configSource')
          });

          if (tempChild2.length > 0) {
            tempChild[tempChild.length - 1].children = tempChild2;
          }
        })

        let treeProperty = {
          id: key + '_lvl1',
          key: key,
          label: this.getTreeLabel(key, currentTreeName, i, 'LoghostIp')
        };

        if (tempChild.length > 0) {
          treeProperty.children = tempChild;
        }

        treeObj.children.push(treeProperty);
        allServiceCount += i;
      }
    })

    treeObj.label = t('txt-all') + ' (' + allServiceCount + ')';

    return treeObj;
  }
  /**
   * Handle alert search submit
   * @method
   * @param {string} fromSearch - option for 'search'
   */
  handleSearchSubmit = (fromSearch) => {
    const {activeTab, activeSubTab, syslogData} = this.state;

    if (activeSubTab === 'statistics') {
      this.getChartsData();
      return;
    } else {
      let tempSyslogData = {...syslogData};
      tempSyslogData.dataFields = [];
      tempSyslogData.dataContent = null;
      tempSyslogData.totalCount = 0;
      tempSyslogData.currentPage = 1;
      tempSyslogData.oldPage = 1;
      tempSyslogData.pageSize = 20;

      this.setState({
        syslogData: tempSyslogData
      });
    }

    if (fromSearch) {
      this.setState({
        tableMouseOver: false
      }, () => {
        this.setChartIntervalBtn();
        this.loadActiveSubTab(fromSearch);
      });
    }
  }
  /**
   * Handle alert search reset
   * @method
   * @param {string} type - reset type ('filter' or 'mark')
   */
  handleResetBtn = (type) => {
    if (type === 'filter') {
      const filterData = [{
        condition: 'must',
        query: ''
      }];
      let tempQueryData = {...this.state.queryData};
      let tempQueryDataPublic = {...this.state.queryDataPublic};
      tempQueryData.displayId = '';
      tempQueryData.displayName = '';
      tempQueryData.openFlag = false;
      tempQueryDataPublic.displayId = '';
      tempQueryDataPublic.displayName = '';
      tempQueryDataPublic.openFlag = false;

      this.setState({
        filterData,
        queryData: tempQueryData,
        queryDataPublic: tempQueryDataPublic
      });
    } else if (type === 'mark') {
      this.setState({
        markData: [{
          data: '',
          color: 'red'
        }]
      });
    }
  }
  /**
   * Handle pagination change for LA
   * @method
   * @param {string} type - action type ('currentPage' or 'pageSize')
   * @param {number} value - current page or page size
   */
  handleLaPageChange = (type, value) => {
    let tempLaData = {...this.state.laData};
    tempLaData[type] = Number(value);

    this.setState({
      laData: tempLaData
    }, () => {
      const options = type === 'pageSize' ? 'search' : '';
      this.resetLinkAnalysis(options);
    });
  }
  /**
   * Handle pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   * @param {string} dialogType - 'table' or 'json'
   * @param {string} [btnType] - button action type ('previous' or 'next')
   */
  handlePaginationChange = (type, value, dialogType, btnType) => {
    let tempSyslogData = {...this.state.syslogData};
    tempSyslogData[type] = Number(value);

    this.setState({
      syslogData: tempSyslogData
    }, () => {
      this.loadLogs(dialogType, type, btnType);
    });
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempSyslogData = {...this.state.syslogData};
    tempSyslogData.sort.field = field;
    tempSyslogData.sort.desc = sort;

    this.setState({
      syslogData: tempSyslogData
    }, () => {
      this.loadLogs();
    });
  }
  /**
   * @method
   * @param {string} value - selected node name
   * @param {string} field - corresponding field of selected node
   */
  selectTree = (value, field) => {
    this.setState({
      loadLogsData: false
    }, () => {
      this.addSearch(field, value, 'must');
    });
  }
  /**
   * Handle table row mouse over
   * @method
   * @param {string} id - raw data ID
   */
  handleRowMouseOver = (id) => {
    let tempSyslogData = {...this.state.syslogData};
    tempSyslogData.dataContent = _.map(tempSyslogData.dataContent, item => {
      return {
        ...item,
        _tableMenu_: id === item.id ? true : false
      };
    });

    this.setState({
      syslogData: tempSyslogData,
      tableMouseOver: true
    });
  }
  /**
   * Handle open menu
   * @method
   * @param {object} syslog - active syslog data
   * @param {object} event - event object
   */
  handleOpenMenu = (syslog, event) => {
    this.setState({
      syslogContextAnchor: event.currentTarget,
      currentSyslogData: syslog
    });
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      syslogContextAnchor: null,
      currentSyslogData: {}
    });
  }
  /**
   * Show query option when click on the table row filter icon
   * @method
   * @param {string} field - field name of selected field
   * @param {string | number} value - value of selected field
   * @param {object} event - event object
   */
  handleOpenQueryMenu = (field, value, event) => {
    this.setState({
      queryContextAnchor: event.currentTarget,
      currentQueryField: field,
      currentQueryValue: value
    });
  }
  /**
   * Handle close query menu
   * @method
   */
  handleCloseQueryMenu = () => {
    this.setState({
      queryContextAnchor: null,
      currentQueryField: '',
      currentQueryValue: ''
    });
  }
  /**
   * Add tree node to search filter
   * @method
   * @param {string} field - corresponding field of selected node
   * @param {string} value - selected node name
   * @param {string} type - condition of selected node ('must', 'must_not' or 'either')
   */
  addSearch = (field, value, type) => {
    const {filterData} = this.state;
    let currentFilterData = filterData;
    let queryValue = value
    if (filterData.length === 0) {
      currentFilterData.push({});
    }

    if (field) {
      if (field === 'configSource')
        queryValue = '(configSource: "' + value + '" OR netproxy.config_source: "' + value + '")';
      else if (field === 'LoghostIp')
        queryValue = '(LoghostIp: "' + value + '" OR netproxy.loghost_ip: "' + value + '")';
      else
        queryValue = field + ': "' + value + '"';
    }

    _.forEach(filterData, (val, i) => {
      if (filterData[filterData.length - 1].query) {
        currentFilterData.push({
          condition: type,
          query: queryValue
        });
        return false;
      }

      if (!currentFilterData[i].query) {
        currentFilterData[i].condition = type;
        currentFilterData[i].query = queryValue;
        return false;
      }
    })

    this.setState({
      showFilter: true,
      showMark: true,
      filterData: currentFilterData
    });

    this.handleCloseQueryMenu();
  }
  /**
   * Handle value change for the checkbox in the table dialog
   * @method
   * @param {string} field - field of selected checkbox
   * @param {object} event - event object
   */
  setFieldsChange = (field, event) => {
    const {account} = this.state;
    const checkedStatus = event.target.checked;
    let uniqAccountFields = _.uniq(account.fields);

    if (_.includes(uniqAccountFields, field)) {
      if (!checkedStatus) { //Remove field from account field
        const index = uniqAccountFields.indexOf(field);
        uniqAccountFields.splice(index, 1);
      }
    } else {
      if (checkedStatus) { //Add field to the account field
        uniqAccountFields.push(field);
      }
    }

    this.setCustomFields(uniqAccountFields);
  }
  /**
   * Set and save events table fields of the account
   * @method
   * @param {array} fields - fields list to be set
   */
  setCustomFields = (fields) => {
    const {baseUrl} = this.context;
    const {account} = this.state;
    let tempAccount = {...account};
    let fieldString = '';
    tempAccount.fields = fields;

    _.forEach(fields, value => {
      fieldString += '&field=' + value;
    })

    if (!account.id) {
      return;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/account/log/fields?accountId=${account.id}${fieldString}`,
      type: 'POST'
    }, {showProgress: false})
    .then(data => {
      if (data.status === 'success') {
        this.setState({
          account: tempAccount
        });
      }
      return null;
    })
  }
  /**
   * Open table menu when double click the table row
   * @method
   * @param {string} index - index of the syslog data
   * @param {object} allValue - selected syslog data
   * @param {object} event - event object
   */
  handleRowDoubleClick = (index, allValue, event) => {
    this.showTableData(allValue);
    event.stopPropagation();
    return null;
  }
  /**
   * Set the table row index and netflow data
   * @method
   * @param {object | string} data - data object or button action type ('previous' or 'next')
   * @param {string} dialogType - 'table' or 'json'
   * @param {string} [type] - button action type ('previous' or 'next')
   * @returns object of index and data
   */
  handleDialogNavigation = (data, dialogType, type) => {
    const {activeTab, syslogData, currentTableIndex, currentLength} = this.state;
    let tableRowIndex = '';
    let allValue = {};
    let tempCurrentPage = syslogData.currentPage;

    if (data === 'previous' || data === 'next') { //For click on navigation button
      tableRowIndex = currentTableIndex;

      if (data === 'previous') {
        if (currentTableIndex === 0) { //End of the data, load previous set
          this.handlePaginationChange('currentPage', --tempCurrentPage, dialogType, data);
          return;
        } else {
          tableRowIndex--;
        }
      } else if (data === 'next') {
        if (currentTableIndex + 1 == currentLength) { //End of the data, load next set
          this.handlePaginationChange('currentPage', ++tempCurrentPage, dialogType, data);
          return;
        } else {
          tableRowIndex++;
        }
      }
      allValue = syslogData.dataContent[tableRowIndex];
    } else if (!_.isEmpty(data)) {
      tableRowIndex = _.findIndex(syslogData.dataContent, {'id': data.id});
      allValue = data;
    } else if (type) {
      if (type === 'previous') {
        tableRowIndex = syslogData.dataContent.length - 1;
      } else if (type === 'next') {
        tableRowIndex = 0;
      }
      allValue = syslogData.dataContent[tableRowIndex];
    }

    return {
      tableRowIndex,
      allValue
    };
  }
  /**
   * Set the data to be displayed in table dialog
   * @method
   * @param {object | string} allValue - data of selected table row or button action type ('previous' or 'next')
   * @param {string} [type] - button action type ('previous' or 'next')
   */
  showTableData = (allValue, type) => {
    const {activeTab, syslogData, account} = this.state;
    const newData = this.handleDialogNavigation(allValue, 'table', type);

    if (!newData) {
      return;
    }

    const currentTableIndex = newData.tableRowIndex;
    allValue = newData.allValue
    let filteredAllValue = this.flattenCollection(newData.allValue)
    const hiddenFields = ['id', '_tableMenu_', 'root_id', 'sessionId', 'projectName', 'timestamp', 'dns', 'tcpflags', 'alert', 'http', 'tag'];
    let dataList = _.omit(filteredAllValue, hiddenFields);
    let dataToShow = {};
    let dataToHide = {};
    let sortedDataList = [];
    const logsFieldsArr = syslogData.dataFieldsArr;

    _.forEach(logsFieldsArr, val => {
      if (!_.has(dataList, val)) {
        dataList[val] = '';
      }
    })

    dataList = _.omit(dataList, hiddenFields);

    _.forEach(account.fields, val => {
      dataToShow[val] = dataList[val];
    })

    dataToShow = _.pick(dataList, account.fields);
    dataToHide = _.omit(dataList, account.fields);
    _.assign(dataToShow, dataToHide);

    _.forEach(dataToShow, (val, key) => {
      let tempObj = {};
      tempObj[key] = val;
      sortedDataList.push(tempObj);
    })

    this.setState({
      sortedDataList,
      modalOpen: true,
      currentTableIndex,
      currentTableID: allValue.id
    });

    this.handleCloseMenu();
  }
  flattenCollection = (obj, path = []) => {
    return !_.isObject(obj)
        ? { [path.join('.')]: obj }
        : _.reduce(obj, (cum, next, key) => _.merge(cum, this.flattenCollection(next, [...path, key])), {})
  }
  /**
   * Set default and custom locale name
   * @method
   * @param {string} key - default field name
   * @param {string} localeField - custom locale name
   */
  toggleLocaleEdit = (key, localeField) => {
    this.setState({
      logLocaleChangeOpen: true,
      logActiveField: key,
      logCustomLocal: localeField ? localeField : key
    });
  }
  /**
   * Handle locale input value change
   * @method
   * @param {object} event - event object
   */
  handleLocaleChange = (event) => {
    this.setState({
      logCustomLocal: event.target.value
    });
  }
  /**
   * Display local edit content in modal dialog
   * @method
   * @returns ModalDialog component
   */
  localeChangeDialog = () => {
    const {logCustomLocal} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeLocaleChange},
      confirm: {text: t('txt-confirm'), handler: this.setCustomLocale}
    };
    const titleText = t('syslogFields.txt-customFieldName');

    return (
      <ModalDialog
        id='localeChangeDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        <TextField
          className='field-input'
          variant='outlined'
          fullWidth
          size='small'
          value={logCustomLocal}
          onChange={this.handleLocaleChange} />
      </ModalDialog>
    )
  }
  /**
   * Handle locale dialog cancel
   * @method
   * @param {string} options - option for 'reload'
   */
  closeLocaleChange = (options) => {
    this.setState({
      logLocaleChangeOpen: false,
      logActiveField: '',
      logCustomLocal: ''
    }, () => {
      if (options === 'reload') {
        this.loadLogsLocaleFields();
      }
    });
  }
  /**
   * Handle locale dialog confirm
   * @method
   */
  setCustomLocale = () => {
    const {baseUrl} = this.context;
    const {account, logActiveField, logCustomLocal} = this.state;
    const url = `${baseUrl}/api/account/log/locale`;
    const requestData = {
      accountId: account.id,
      field: logActiveField,
      locale: logCustomLocal
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      this.closeLocaleChange('reload');
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle table field sort action
   * @method
   * @param {object} listObj - sort data
   */
  onSortEnd = (listObj) => {
    this.setState({
      sortedDataList: arrayMove(this.state.sortedDataList, listObj.oldIndex, listObj.newIndex)
    });
  }
  /**
   * Display dialog navigation btn with text
   * @method
   * @param {string} dialogType - 'table' or 'json'
   * @param {string} navType - 'previous' or 'next'
   * @returns HTML DOM
   */
  displayNavigationBtn = (dialogType, navType) => {
    const {currentTableIndex, currentLength, syslogData} = this.state;
    const firstItemCheck = currentTableIndex === 0;
    const lastItemCheck = currentTableIndex + 1 == currentLength;
    const firstPageCheck = syslogData.currentPage + 1 === 1;
    const lastPageCheck = syslogData.currentPage + 1 === Math.ceil(syslogData.totalCount / syslogData.pageSize);
    const pageText = {
      previous: t('txt-previous'),
      next: t('txt-next')
    };
    const paginationDisabled = {
      previous: firstItemCheck && firstPageCheck,
      next: lastItemCheck && lastPageCheck
    };
    let clickAction = '';

    if (dialogType === 'table') {
      clickAction = this.showTableData.bind(this, navType);
    } else if (dialogType === 'json') {
      clickAction = this.showJsonData.bind(this, navType);
    }   

    return <Button variant='outlined' color='primary' onClick={clickAction} disabled={paginationDisabled[navType]}>{pageText[navType]}</Button>
  }
  /**
   * Display table data content
   * @method
   * @returns HTML DOM
   */
  displayTableData = () => {
    const {activeTab, sortedDataList, currentTableIndex, currentLength} = this.state;

    return (
      <div className='parent-content'>
        <SortableList
          activeTab={activeTab}
          items={sortedDataList}
          onSortEnd={this.onSortEnd}
          getCustomFieldName={this.getCustomFieldName}
          setFieldsChange={this.setFieldsChange}
          checkDisplayFields={this.checkDisplayFields}
          handleOpenQueryMenu={this.handleOpenQueryMenu}
          toggleLocaleEdit={this.toggleLocaleEdit}
          useDragHandle={true}
          lockToContainerEdges={true} />

        {currentLength > 0 &&
          <div className='pagination'>
            <div className='buttons'>
              {this.displayNavigationBtn('table', 'previous')}
              {this.displayNavigationBtn('table', 'next')}
            </div>
            <span className='count'>{currentTableIndex + 1} / {currentLength}</span>
          </div>
        }
      </div>
    )
  }
  /**
   * Close dialog and reset data
   * @method
   */
  closeDialog = () => {
    this.setState({
      modalOpen: false,
      openQueryOpen: false,
      saveQueryOpen: false
    }, () => {
      this.clearQueryData();
    });
  }
  /**
   * Reset table based on user's interaction with table dialog
   * @method
   * @param {string} options - option for 'setFields'
   */
  resetDataTable = (options) => {
    const {activeTab, syslogData} = this.state;
    let tempSyslogData = {...syslogData};
    tempSyslogData.dataFields = [];
    tempSyslogData.dataContent = null;
    tempSyslogData.totalCount = 0;
    tempSyslogData.currentPage = 1;
    tempSyslogData.oldPage = 1;
    tempSyslogData.pageSize = 20;

    this.setState({
      syslogData: tempSyslogData
    }, () => {
      const {account, sortedDataList} = this.state;
      let sortedCheckedList = [];

      _.forEach(sortedDataList, val => {
        const item = _.keys(val).toString();

        if (_.includes(account.fields, item)) {
          sortedCheckedList.push(item);
        }
      });

      if (options === 'setFields') {
        this.setCustomFields(sortedCheckedList);
      }
      this.closeDialog();
      this.clearData();
    });
  }
  /**
   * Display table data content in modal dialog
   * @method
   * @returns ModalDialog component
   */
  tableDialog = () => {
    const title = t('txt-syslog-en') + ' ' + t('events.connections.txt-fieldsSettings');
    const actions = {
      cancel: {text: t('txt-close'), className: 'standard', handler: this.closeDialog},
      confirm: {text: t('txt-closeRefresh'), handler: this.resetDataTable.bind(this, 'setFields')}
    };

    return (
      <ModalDialog
        id='flowModalDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayTableData()}
      </ModalDialog>
    )
  }
  /**
   * Display Json data content
   * @method
   * @returns HTML DOM
   */
  displayJsonData = (allValue) => {
    const {currentTableIndex, currentLength} = this.state;
    const theme = document.documentElement.getAttribute('data-theme');
    const hiddenFields = ['id', '_tableMenu_'];
    let reactJsonTheme = '';
    allValue = _.omit(allValue, hiddenFields);

    if (theme === 'light') {
      reactJsonTheme = 'rjv-default';
    } else if (theme === 'dark') {
      reactJsonTheme = 'tomorrow';
    }

    return (
      <div className='json-reports'>
        <div className='json-data'>
          <ReactJson
            src={allValue}
            theme={reactJsonTheme} />
        </div>

        <div className='pagination json'>
          <div className='buttons'>
            {this.displayNavigationBtn('json', 'previous')}
            {this.displayNavigationBtn('json', 'next')}
          </div>
          <span className='count'>{currentTableIndex + 1} / {currentLength}</span>
        </div>
      </div>
    )
  }
  /**
   * Open Json data modal dialog
   * @method
   * @param {object} allValue - data of selected table row
   * @param {string} [type] - button action type ('previous' or 'next')
   */
  showJsonData = (allValue, type) => {
    const newData = this.handleDialogNavigation(allValue, 'json', type);

    if (!newData) {
      return;
    }

    const currentTableIndex = newData.tableRowIndex;
    allValue = newData.allValue;

    this.setState({
      currentTableIndex,
      currentTableID: allValue.id
    }, () => {
      PopupDialog.alert({
        title: t('txt-viewJSON'),
        id: 'viewJsonDialog',
        confirmText: t('txt-close'),
        display: this.displayJsonData(allValue),
        act: (confirmed, data) => {
        }
      });
    });

    this.handleCloseMenu();
  }
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
        this.loadLogs();
      }
    });
  }
  /**
   * Handle content tab change
   * @method
   * @param {object} event - event object
   * @param {string} newTab - content type ('table' or 'linkAnalysis')
   */
  handleSubTabChange = (event, newTab) => {
    let tempSyslogData = {...this.state.syslogData};
    let tempLaData = {...this.state.laData};

    if (newTab === 'table') {
      tempSyslogData.currentPage = 1;
      tempSyslogData.pageSize = 20;

      this.setState({
        syslogData: tempSyslogData
      }, () => {
        this.loadLogs();
      });
    } else if (newTab === 'linkAnalysis') {
      tempLaData.currentPage = 1;
      tempLaData.pageSize = 500;

      this.setState({
        laData: tempLaData
      }, () => {
        this.loadLinkAnalysis();
      });
    }

    this.setState({
      activeSubTab: newTab,
      tableMouseOver: false
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
      this.loadLogs();
    });
  }
  /**
   * Redirect to SOAR page
   * @method
   * @param {string} patternId - pattern ID
   */
  soarRedirect = (patternId) => {
    const {baseUrl, contextRoot, language} = this.context;
    const {queryData} = this.state;
    const url = `${baseUrl}${contextRoot}/soar?flag=events&patternId=${queryData.patternId}&lng=${language}`;

    window.open(url, '_blank');
  }
  /**
   * Display table data content Syslog
   * @method
   * @returns Syslog component
   */
  renderTabContent = () => {
    const {activeTab, tableMouseOver, markData, currentTableID} = this.state;
    const tableOptions = {
      onChangePage: (currentPage) => {
        this.handlePaginationChange('currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort(changedColumn, direction === 'desc');
      },
      setRowProps: (row, dataIndex, rowIndex) => {
        if (!row[0]) {
          return;
        }

        const allValue = row[0](rowIndex, 'getAllValue');
        const tableUniqueID = allValue.id;

        if (tableUniqueID === currentTableID) {
          return {
            className: 'grey'
          };
        }
      }
    };
    const mainContentData = {
      activeTab,
      tableMouseOver,
      tableOptions,
      markData,
      statisticsData: this.state.statisticsData,
      statisticsTableChart: this.state.statisticsTableChart,
      handleStatisticsDataChange: this.handleStatisticsDataChange,
      getStatisticsExport: this.getStatisticsExport,
      getChartsData: this.getChartsData,
      chartIntervalList: this.state.chartIntervalList,
      chartIntervalValue: this.state.chartIntervalValue,
      chartIntervalChange: this.handleIntervalChange,
      getChartsCSVfile: this.getChartsCSVfile,
      subTabMenu: this.state.subTabMenu,
      activeSubTab: this.state.activeSubTab,
      handleSubTabChange: this.handleSubTabChange,
      currentTableID: this.state.currentTableID,
      queryModalType: this.state.queryModalType,
      queryData: this.state.queryData,
      queryDataPublic: this.state.queryDataPublic,
      filterData: this.state.filterData,
      account: this.state.account,
      showFilter: this.state.showFilter,
      showMark: this.state.showMark,
      showChart: this.state.showChart,
      toggleMark: this.toggleMark,
      toggleChart: this.toggleChart,
      openQuery: this.openQuery,
      setFilterData: this.setFilterData,
      setMarkData: this.setMarkData,
      handleResetBtn: this.handleResetBtn,
      handleSearchSubmit: this.handleSearchSubmit,
      treeTitle: t('txt-logSource'),
      treeData: this.state.treeData,
      treeSelect: this.selectTree,
      showTreeFilterBtn: this.showTreeFilterBtn,
      syslogData: this.state.syslogData,
      LAdata: this.state.laData,
      logFields: this.state.logFields,
      handleLaPageChange: this.handleLaPageChange,
      soarRedirect: this.soarRedirect
    };

    return (
      <Syslog
        mainContentData={mainContentData}
        tabChartData={{
          chartData: this.state.eventHistogram
        }}
        markData={markData}
        tableMouseOver={tableMouseOver} />
    )
  }
  /**
   * Get request data for CSV file
   * @method
   * @param {string} url - request URL
   * @param {string} [options] - option for 'columns' or 'statistics'
   */
  getCSVrequestData = (url, options) => {
    let dataOptions = {
      ...this.toQueryLanguage('csv')
    };

    if (options === 'columns') {
      let tempColumns = [];

      _.forEach(this.state.account.fields, val => {
        if (val !== 'alertRule' && val != '_tableMenu_') {
          tempColumns.push({
            [val]: this.getCustomFieldName(val)
          });
        }
      })

      dataOptions.columns = tempColumns;
    }

    if (options === 'statistics') {
      dataOptions.column = this.state.statisticsData.column;
      dataOptions = _.omit(dataOptions, ['timeZone']);
    }

    downloadWithForm(url, {payload: JSON.stringify(dataOptions)});
  }
  /**
   * Handle CSV download click
   * @method
   * @param {object} event - event object
   */
  handleCSVclick = (event) => {
    this.setState({
      popOverAnchor: event.currentTarget
    }, () => {
      this.getTaskService('firstLoad');
    });
  }
  /**
   * Get list of task service
   * @method
   * @param {string} options - option for 'firstLoad'
   */
  getTaskService = (options) => {
    const {taskServiceList} = this.state;
    const {baseUrl} = this.context;
    const datetime = {
      from: moment(helper.getSubstractDate(7, 'day', moment().utc())).format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    let fromItem = 0;

    if (options !== 'firstLoad') {
      fromItem = taskServiceList.pageSize - 1; //index starts from zero

      if (taskServiceList.scrollCount > 0) {
        fromItem = taskServiceList.scrollCount + taskServiceList.pageSize;
      }
    }

    this.ah.one({
      url: `${baseUrl}/api/taskService/list?source=SCP&type=exportSyslog&createStartDttm=${datetime.from}&from=${fromItem}&size=${taskServiceList.pageSize}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempTaskServiceList = {...taskServiceList};
        tempTaskServiceList.data = [];

        if (options === 'firstLoad') {
          if (data.list && data.list.length > 0) {
            tempTaskServiceList.data = data.list;
          }
        } else {
          tempTaskServiceList.scrollCount = fromItem;

          if (data.list && data.list.length > 0) {
            tempTaskServiceList.data = _.concat(taskServiceList.data, data.list);
            tempTaskServiceList.hasMore = true;
          } else {
            tempTaskServiceList.hasMore = false;
          }
        }

        this.setState({
          taskServiceList: tempTaskServiceList
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle popover close
   * @method
   */
  handlePopoverClose = () => {
    let tempTaskServiceList = {...this.state.taskServiceList};
    tempTaskServiceList.data = null;
    tempTaskServiceList.scrollCount = 0;

    this.setState({
      popOverAnchor: null,
      taskServiceList: tempTaskServiceList
    });
  }
  /**
   * Handle scheduled download click
   * @method
   */
  registerDownload = () => {
    const {baseUrl} = this.context;
    const {datetime, filterData, account} = this.state;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    const url = `${baseUrl}/api/taskService`;
    const filterDataArr = helper.buildFilterDataArray(filterData); //Remove empty filter array
    let requestData = {
      '@timestamp': [dateTime.from, dateTime.to],
      type: ['exportSyslog']
    };

    if (filterDataArr.length > 0) {
      requestData.filters = filterDataArr;
    }

    let tempColumns = [];

    _.forEach(account.fields, val => {
      if (val !== 'alertRule' && val != '_tableMenu_') {
        tempColumns.push({
          [val]: this.getCustomFieldName(val)
        });
      }
    })

    requestData.columns = tempColumns;

    const timezone = momentTimezone.tz(momentTimezone.tz.guess()); //Get local timezone object
    const utc_offset = timezone._offset / 60; //Convert minute to hour
    requestData.timeZone = utc_offset;

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-requestSent'));
        this.handlePopoverClose();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle Charts CSV download
   * @method
   */
  getChartsCSVfile = () => {
    const {baseUrl, contextRoot} = this.context;
    const {chartIntervalValue} = this.state;
    const url = `${baseUrl}${contextRoot}/api/u1/log/event/histogram/_export?interval=${chartIntervalValue}`;
    this.getCSVrequestData(url);
  }
  /**
   * Handle statistics export
   * @method
   */
  getStatisticsExport = () => {
    const {baseUrl, contextRoot} = this.context;
    const {statisticsData} = this.state;
    const url = `${baseUrl}${contextRoot}/api/log/event/columnDistribution/_export?pageSize=${statisticsData.pageSize}`;
    this.getCSVrequestData(url, 'statistics');
  }
  /**
   * Toggle filter and mark content on/off
   * @method
   */
  toggleMark = () => {
    this.setState({
      showFilter: !this.state.showFilter,
      showMark: !this.state.showMark
    });
  }
  /**
   * Toggle query menu on/off
   * @method
   * @param {string} type - type of query menu ('open', 'save', 'publicOpen' or 'publicSave')
   */
  openQuery = (type) => {
    const {queryData, queryDataPublic} = this.state;

    if (type === 'open' || type === 'publicOpen') {
      if (type === 'open') {
        let tempQueryData = {...queryData};

        if (queryData.list.length > 0) {
          tempQueryData.id = queryData.list[0].id;
          tempQueryData.name = queryData.list[0].name;
          tempQueryData.query = queryData.list[0].queryText;
          tempQueryData.emailList = queryData.list[0].emailList;
          tempQueryData.patternId = queryData.list[0].patternId;
          tempQueryData.pattern.name = queryData.list[0].patternName;
          tempQueryData.pattern.ruleCatgory = queryData.list[0].ruleCatgory;
          tempQueryData.pattern.severity = queryData.list[0].severity;
          tempQueryData.pattern.aggColumn = queryData.list[0].aggColumn;
          tempQueryData.pattern.periodMin = queryData.list[0].periodMin;
          tempQueryData.pattern.threshold = queryData.list[0].threshold;
          tempQueryData.pattern.ruleType = queryData.list[0].ruleType;
          tempQueryData.pattern.observeColumn = queryData.list[0].observeColumn;
          tempQueryData.pattern.trainingDataTime = queryData.list[0].trainingDataTime;
          tempQueryData.pattern.trainingTimeScale = queryData.list[0].trainingTimeScale;
          tempQueryData.pattern.trainingTimeScaleUnit = queryData.list[0].trainingTimeScaleUnit;
          tempQueryData.pattern.thresholdWeight = queryData.list[0].thresholdWeight;
          tempQueryData.isPublic = queryData.list[0].isPublic;
        }

        this.setState({
          queryData: tempQueryData,
          openQueryOpen: true
        });
      } else if (type === 'publicOpen') {
        let tempQueryDataPublic = {...queryDataPublic};

        if (tempQueryDataPublic.list.length > 0) {
          tempQueryDataPublic.id = queryDataPublic.list[0].id;
          tempQueryDataPublic.name = queryDataPublic.list[0].name;
          tempQueryDataPublic.query = queryDataPublic.list[0].queryText;
        }

        this.setState({
          queryDataPublic: tempQueryDataPublic,
          openQueryOpen: true
        });
      }
    } else if (type === 'save' || type === 'publicSave') {
      let tempQueryData = {...queryData};

      if (queryData.list.length > 0) {
        tempQueryData.pattern = PATTERN_INIT_DATA;
      }

      this.setState({
        queryData: tempQueryData,
        saveQueryOpen: true
      });
    }

    this.setState({
      queryModalType: type
    });
  }
  /**
   * Set filter data
   * @method
   * @param {array.<string>} filterData - filter data to be set
   */
  setFilterData = (filterData) => {
    this.setState({
      filterData
    });
  }
  /**
   * Set mark data
   * @method
   * @param {array.<string>} markData - mark data to be set
   */
  setMarkData = (markData) => {
    this.setState({
      markData
    });
  }
  /**
   * Set query data
   * @method
   * @param {object} query - query data to be set
   * @param {string} [options] - option for 'setQuery'
   */
  setQueryData = (query, options) => {
    const {queryData, queryDataPublic, queryModalType} = this.state;

    if (queryModalType === 'open' || queryModalType === 'save') {
      if (options === 'setQuery') {
        let tempQueryDataPublic = {...queryDataPublic};
        tempQueryDataPublic.displayId = '';
        tempQueryDataPublic.displayName = '';

        this.setState({
          queryDataPublic: tempQueryDataPublic
        });
      }

      this.setState({
        queryData: query
      });
    } else if (queryModalType === 'publicOpen' || queryModalType === 'publicSave') {
      if (options === 'setQuery') {
        let tempQueryData = {...queryData};
        tempQueryData.displayId = '';
        tempQueryData.displayName = '';

        this.setState({
          queryData: tempQueryData
        });
      }

      this.setState({
        queryDataPublic: query
      });
    }
  }
  /**
   * Set notify email data
   * @method
   * @param {array.<string>} notifyEmailData - email data to be set
   */
  setNotifyEmailData = (notifyEmailData) => {
    this.setState({
      notifyEmailData
    });
  }
  /**
   * Display query menu modal dialog
   * @method
   * @returns QueryOpenSave component
   */
  queryDialog = () => {
    const {sessionRights} = this.context;
    const {
      activeTab,
      account,
      filterData,
      markData,
      queryData,
      queryDataPublic,
      queryModalType,
      notifyEmailData
    } = this.state;
    const moduleWithSOC = sessionRights.Module_Soc ? true : false;

    return (
      <QueryOpenSave
        page={activeTab}
        type={queryModalType}
        moduleWithSOC={moduleWithSOC}
        account={account}
        filterData={filterData}
        markData={markData}
        queryData={queryData}
        queryDataPublic={queryDataPublic}
        notifyEmailData={notifyEmailData}
        setFilterData={this.setFilterData}
        setMarkData={this.setMarkData}
        setQueryData={this.setQueryData}
        setNotifyEmailData={this.setNotifyEmailData}
        getSavedQuery={this.getSavedQuery}
        getPublicSavedQuery={this.getPublicSavedQuery}
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
   * @param {string | object} event - event object
   * @param {string} [type] - for 'searchType' input
   */
  setSearchData = (event, inputType) => {
    let tempSearchInput = {...this.state.searchInput};

    if (event.target) {
      tempSearchInput[event.target.name] = event.target.value;
    } else {
      tempSearchInput[inputType] = event[inputType];
      tempSearchInput.searchInterval = '1h'; //set default value
      tempSearchInput.refreshTime = '60000'; //set default value for 1 min.
    }

    this.setState({
      searchInput: tempSearchInput
    });
  }
  /**
   * Reset query data
   * @method
   */
  clearQueryData = () => {
    const {queryData, queryDataPublic} = this.state;
    let tempQueryData = {...queryData};
    let tempQueryDataPublic = {...queryDataPublic};
    tempQueryData.inputName = '';
    tempQueryData.openFlag = false;
    tempQueryDataPublic.inputName = '';
    tempQueryDataPublic.openFlag = false;
    tempQueryData.soc = {
      id: '',
      severity: 'Emergency',
      limitQuery: 10,
      title: '',
      eventDescription: '',
      impact: 4,
      category: 1,
    };

    this.setState({
      queryData: tempQueryData,
      queryDataPublic: tempQueryDataPublic,
      notifyEmailData: []
    });
  }
  /**
   * Reset syslog data
   * @method
   */
  clearData = () => {
    const {activeTab, syslogData, laData} = this.state;
    let tempSyslogData = {...syslogData};
    let tempLaData = {...laData};
    tempSyslogData.dataFields = [];
    tempSyslogData.dataContent = null;
    tempSyslogData.totalCount = 0;
    tempLaData.dataContent = [];
    tempLaData.totalCount = 0;

    this.setState({
      syslogData: tempSyslogData,
      laData: tempLaData
    }, () => {
      this.loadFields(activeTab);
    });
  }
  /**
   * Handle input value change
   * @method
   * @param {object} event - event object
   */
  handleStatisticsDataChange = (event) => {
    let tempStatisticsData = {...this.state.statisticsData};
    tempStatisticsData[event.target.name] = event.target.value;

    this.setState({
      statisticsData: tempStatisticsData
    });
  }
  /**
   * Get table chart field
   * @method
   * @param {string} field - field name
   * @returns field name
   */
  getTableField = (field) => {
    if (field === 'key') {
      return this.state.statisticsData.column;
    } else if (field === 'doc_count') {
      return t('txt-count');
    }
  }
  /**
   * Generate charts content
   * @method
   */
  getChartsData = () => {
    const {baseUrl} = this.context;
    const {statisticsData, statisticsTableChart} = this.state;
    const url = `${baseUrl}/api/log/event/columnDistribution?pageSize=${statisticsData.pageSize}`;
    const requestData = {
      ...this.toQueryLanguage(),
      column: statisticsData.column
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempStatisticsData = {...statisticsData};
        let tempStatisticsTableChart = {...statisticsTableChart};

        if (data.aggregations.topColumns.length === 0) {
          tempStatisticsData.data = [];
        } else {
          const chartData = data.aggregations.topColumns;
          let formattedChartData = [];

          _.forEach(chartData, val => {
            let key = val.key;

            if (UTC_TIME_PATTERN.test(val.key)) { //Check UTC time format
              key = helper.getFormattedDate(key, 'local');
            }

            formattedChartData.push({
              ...val,
              key
            });
          })

          tempStatisticsData.data = formattedChartData;
          tempStatisticsTableChart.dataContent = formattedChartData;

          let chartFields = {};

          tempStatisticsTableChart.dataFieldsArr.forEach(tempData => {
            chartFields[tempData] = {
              label: this.getTableField(tempData),
              sortable: true,
              formatter: (value, allValue, i) => {
                return <span>{value}</span>
              }
            };
          })

          tempStatisticsTableChart.dataFields = chartFields;
        }

        this.setState({
          statisticsData: tempStatisticsData,
          statisticsTableChart: tempStatisticsTableChart
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {
      activeTab,
      datetime,
      searchInput,
      modalOpen,
      openQueryOpen,
      saveQueryOpen,
      filterData,
      markData,
      popOverAnchor,
      taskServiceList,
      syslogContextAnchor,
      currentSyslogData,
      queryContextAnchor,
      currentQueryField,
      currentQueryValue,
      showChart,
      showFilter,
      showMark,
      logLocaleChangeOpen
    } = this.state;
    let filterDataCount = 0;
    let markDataCount = 0;

    _.forEach(filterData, val => {
      if (val.query) {
        filterDataCount++;
      }
    })

    _.forEach(markData, val => {
      if (val.data) {
        markDataCount++;
      }
    })

    return (
      <div>
        {modalOpen &&
          this.tableDialog()
        }

        {openQueryOpen &&
          this.queryDialog('open')
        }

        {saveQueryOpen &&
          this.queryDialog('save')
        }

        {logLocaleChangeOpen &&
          this.localeChangeDialog()
        }

        <Menu
          anchorEl={syslogContextAnchor}
          keepMounted
          open={Boolean(syslogContextAnchor)}
          onClose={this.handleCloseMenu}>
          <MenuItem onClick={this.showTableData.bind(this, currentSyslogData)}>{t('events.connections.txt-fieldsSettings')}</MenuItem>
          <MenuItem onClick={this.showJsonData.bind(this, currentSyslogData)}>{t('txt-viewJSON')}</MenuItem>
        </Menu>

        <Menu
          anchorEl={queryContextAnchor}
          keepMounted
          open={Boolean(queryContextAnchor)}
          onClose={this.handleCloseQueryMenu}>
          <MenuItem onClick={this.addSearch.bind(this, currentQueryField, currentQueryValue, 'must')}>Must</MenuItem>
          <MenuItem onClick={this.addSearch.bind(this, currentQueryField, currentQueryValue, 'must_not')}>Must Not</MenuItem>
          <MenuItem onClick={this.addSearch.bind(this, currentQueryField, currentQueryValue, 'either')}>Either</MenuItem>
        </Menu>

        <div className='sub-header'>
          {helper.getEventsMenu('syslog')}

          <div className='secondary-btn-group right'>
            <Button id='syslogFilterBtn' variant='outlined' color='primary' className={cx({'active': showMark})} onClick={this.toggleMark}><i className='fg fg-filter'></i><span>({filterDataCount})</span> <i className='fg fg-edit'></i><span>({markDataCount})</span></Button>
            <Button id='syslogChartBtn' variant='outlined' color='primary' className={cx({'active': showChart})} onClick={this.toggleChart} title={t('events.connections.txt-toggleChart')}><i className='fg fg-chart-columns'></i></Button>
            <Button id='syslogDownloadBtn' variant='outlined' color='primary' className='last' onClick={this.handleCSVclick} title={t('txt-exportCSV')}><i className='fg fg-file-csv'></i></Button>
          </div>

          <ExportCSV
            popOverAnchor={popOverAnchor}
            taskServiceList={taskServiceList}
            handlePopoverClose={this.handlePopoverClose}
            registerDownload={this.registerDownload}
            getTaskService={this.getTaskService} />

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

SyslogController.contextType = BaseDataContext;

SyslogController.propTypes = {
};

export default withRouter(SyslogController);