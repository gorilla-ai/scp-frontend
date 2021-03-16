import React, {Component} from 'react'
import {withRouter} from 'react-router'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import _ from 'lodash'
import cx from 'classnames'
import queryString from 'query-string'

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import {analyze} from 'vbda-ui/build/src/analyzer'
import {config as configLoader} from 'vbda-ui/build/src/loader'
import {downloadWithForm} from 'react-ui/build/src/utils/download'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {arrayMove} from 'react-sortable-hoc'
import JSONTree from 'react-json-tree'

import {BaseDataContext} from '../../common/context';
import helper from '../../common/helper'
import QueryOpenSave from '../../common/query-open-save'
import SearchOptions from '../../common/search-options'
import SortableList from '../../common/sortable-list'
import Syslog from './syslog'
import TableCell from '../../common/table-cell'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

/**
 * Syslog
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
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
      currentPage: 1,
      oldPage: 1,
      pageSize: 20,
      pageSizeMap: 500,
      sort: {
        field: '@timestamp',
        desc: true
      },
      //Left nav
      treeRawData: {},
      treeData: null,
      currentTreeName: '',
      //Tab Menu
      subTabMenu: {
        table: t('txt-table'),
        linkAnalysis: t('txt-linkAnalysis')
      },
      activeSubTab: 'table',
      //Search bar
      searchInput: {
        searchType: 'manual',
        searchInterval: '1h',
        refreshTime: '60000' //1 min.
      },
      eventHistogram: {},
      filterData: [{
        condition: 'must',
        query: ''
      }],
      markData: [{
        data: '',
        color: 'red'
      }],
      //Sub sections
      subSectionsData: {
        mainData: {
          logs: null
        },
        fieldsData: {
          logs: {}
        },
        laData: {
          logs: []
        },
        tableColumns: {},
        totalCount: {
          logs: 0
        }
      },
      syslogContextAnchor: null,
      currentSyslogData: {},
      logFields: [],
      LAconfig: {},
      logEventsData: {},
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
          periodMin: '',
          threshold: '',
          severity: ''
        },
        emailList: [],
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
      logLocaleChangeOpen: false,
      logActiveField: '',
      logCustomLocal: '',
      loadLogsData: true,
      syslogRequest: {}
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, session, sessionRights} = this.context;
    let tempAccount = {...this.state.account};

    helper.getPrivilegesInfo(sessionRights, 'common', locale);

    if (session.accountId) {
      tempAccount.id = session.accountId;
      tempAccount.login = true;

      this.setState({
        account: tempAccount
      }, () => {
        this.getLAconfig();
        this.getSavedQuery();
        this.getSyslogTree();
        this.setChartIntervalBtn();
        this.initialLoad();
      });
    }
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
        this.setState({
          LAconfig: configLoader.processAll(data)
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
    const syslogParams = queryString.parse(location.search);

    if (syslogParams.configSource && syslogParams.loghostIp) {
      this.setState({
        filterData: [
          {
            condition: 'must',
            query: 'configSource: ' + syslogParams.configSource
          }, {
            condition: 'must',
            query: 'LoghostIp: ' + syslogParams.loghostIp
          }
        ],
        showFilter: true,
        showMark: true
      });
    } else if (syslogParams.configSource) {
      let tempSearchInput = {...this.state.searchInput};

      if (syslogParams.interval) {
        tempSearchInput.searchInterval = syslogParams.interval;
      }

      this.setState({
        searchInput: tempSearchInput,
        filterData: [{
          condition: 'must',
          query: 'configSource: ' + syslogParams.configSource
        }],
        showFilter: true,
        showMark: true
      });
    } else if (syslogParams.srcIp || syslogParams.ipSrc) {
      let hostData = '';

      if (syslogParams.srcIp) {
        hostData = syslogParams.srcIp;
      } else if (syslogParams.ipSrc) {
        hostData = syslogParams.ipSrc;
      }

      this.setState({
        filterData: [{
          condition: 'must',
          query: 'type: eventlog'
        },
        {
          condition: 'must',
          query: '_host: ' + hostData
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
          query: syslogParams.sourceIP
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
    const {subSectionsData, account} = this.state;
    let url = `${baseUrl}/api/account/log/fields`;
    let tempSubSectionsData = {...subSectionsData};
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
        let filedsArr = [];

        data.unshift('_tableMenu_');

        _.forEach(data, val => {
          filedsArr.push(val);
        });

        //Filter out the columns that are not in the account fields
        const filterArr = _.remove(tempSubSectionsData.tableColumns[activeTab], item => {
          return _.indexOf(filedsArr, item) < 0;
        });

        //Merge the account fields and all other fields
        tempSubSectionsData.tableColumns[activeTab] = _.concat(filedsArr, filterArr);
        tempAccont.fields = filedsArr;

        this.setState({
          subSectionsData: tempSubSectionsData,
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
        let filedsArr = ['_tableMenu_'];

        _.forEach(data, val => {
          filedsArr.push(val);
        });

        this.setState({
          logFields: filedsArr
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
   * @returns true/false boolean
   */
  checkDisplayFields = (field) => {
    if (field === '_tableMenu_') {
      return true;
    } else {
      return _.includes(this.state.account.fields, field);
    }
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
      return null;
    }

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  /**
   * Reset link analysis data to avoid weird display in LA
   * @method
   * @param {string} options - option for 'search'
   */
  resetLinkAnalysis = (options) => {
    const {activeTab, subSectionsData} = this.state;
    let tempSubSectionsData = {...subSectionsData};
    tempSubSectionsData.laData[activeTab] = '';

    this.setState({
      subSectionsData: tempSubSectionsData
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
    const {activeTab, currentPage, pageSizeMap, subSectionsData, LAconfig} = this.state;
    const setPage = options === 'search' ? 1 : currentPage;
    const url = `${baseUrl}/api/u1/log/event/_search?page=${setPage}&pageSize=${pageSizeMap}`;
    const requestData = this.toQueryLanguage();
    let tempSubSectionsData = {...subSectionsData};
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

        tempSubSectionsData.laData[activeTab] = analyze(logEventsData, LAconfig, {analyzeGis: false});
        tempSubSectionsData.totalCount[activeTab] = logsData.counts;

        this.setState({
          logEventsData,
          subSectionsData: tempSubSectionsData
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
    const {datetime, sort, filterData, markData} = this.state;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    let dataObj = {
      '@timestamp': [dateTime.from, dateTime.to],
      sort: [{
        [sort.field]: sort.desc ? 'desc' : 'asc'
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
      const timezone = momentTimezone.tz(momentTimezone.tz.guess()); //Get local timezone obj
      const utc_offset = timezone._offset / 60; //Convert minute to hour
      dataObj.timeZone = utc_offset;
    }

    return dataObj;
  }
  /**
   * Get custom field name
   * @method
   * @param {string} field - field name
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
   * @param {string} type - button action type ('previous' or 'next')
   */
  loadLogs = (options, type) => {
    const {baseUrl} = this.context;
    const {activeTab, chartIntervalValue, currentPage, oldPage, pageSize, subSectionsData, markData} = this.state;
    const setPage = options === 'search' ? 1 : currentPage;

    this.ah.all([{
      url: `${baseUrl}/api/u1/log/event/_search?page=${setPage}&pageSize=${pageSize}`,
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
        if (currentPage > 1 && !data[0].data) {
          helper.showPopupMsg('', t('txt-error'), t('txt-maxDataMsg'));

          this.setState({
            currentPage: oldPage
          });
          return;
        }

        if (_.isEmpty(data[0]) || _.isEmpty(data[1])) {
          return;
        }

        const dataObj = data[0].data;
        const currentLength = dataObj.rows.length < pageSize ? dataObj.rows.length : pageSize;
        let eventHistogram = {};

        if (_.isEmpty(data[0]) || dataObj.counts === 0) {
          helper.showPopupMsg(t('txt-notFound', ''));

          let tempSubSectionsData = {...subSectionsData};
          tempSubSectionsData.mainData.logs = [];
          tempSubSectionsData.totalCount.logs = 0;

          this.setState({
            subSectionsData: tempSubSectionsData,
            eventHistogram: {}
          });
          return;
        }

        const tempArray = dataObj.rows.map(tempData => {
          tempData.content.id = tempData.id;
          return tempData.content;
        });

        let tempFields = {};
        subSectionsData.tableColumns.logs.forEach(tempData => {
          tempFields[tempData] = {
            hide: !this.checkDisplayFields(tempData),
            label: this.getCustomFieldName(tempData),
            sortable: this.checkSortable(tempData),
            formatter: (value, allValue) => {
              let displayValue = '';

              if (tempData === '_tableMenu_') {
                return (
                  <div className={cx('table-menu', {'active': value})}>
                    <Button variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue)}><i className='fg fg-more'></i></Button>
                  </div>
                )
              }
              if (tempData === '@timestamp') {
                value = helper.getFormattedDate(value, 'local');
              }
              if (tempData === '_Raw' || tempData === 'message' || tempData === 'msg') {
                displayValue = value;

                if (value && value.length > 50) {
                  displayValue = value.substr(0, 50) + '...';
                }
              }
              if (typeof value === 'boolean') {
                value = value.toString();
              }
              return (
                <TableCell
                  activeTab={activeTab}
                  fieldValue={value}
                  displayValue={displayValue}
                  fieldName={tempData}
                  allValue={allValue}
                  markData={markData}
                  handleOpenQueryMenu={this.handleOpenQueryMenu} />
              )
            }
          }
        })

        let tempSubSectionsData = {...subSectionsData};
        tempSubSectionsData.mainData.logs = tempArray;
        tempSubSectionsData.fieldsData.logs = tempFields;
        tempSubSectionsData.totalCount.logs = dataObj.counts;

        const tempCurrentPage = options === 'search' ? 1 : currentPage;
        const dataArray = tempSubSectionsData.mainData.logs;

        for (var i = 0; i < dataArray.length; i++) {
          for (var key in dataArray[i]) {
            if (Array.isArray(dataArray[i][key])) {
              tempSubSectionsData.mainData.logs[i][key] = helper.arrayDataJoin(dataArray[i][key], '', ', ');
            }
          }
        }

        if (data[1].search) {
          _.forEach(data[1].search, val => {
            eventHistogram[val.searchName] = val.eventHistogram
          })
        }

        this.setState({
          currentPage: tempCurrentPage,
          oldPage: tempCurrentPage,
          subSectionsData: tempSubSectionsData,
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
    const {activeTab, subSectionsData} = this.state;
    let tempSubSectionsData = {...subSectionsData};
    tempSubSectionsData.mainData[activeTab] = null;

    this.setState({
      subSectionsData: tempSubSectionsData
    });

    if (fromSearch) {
      this.setState({
        currentPage: 1,
        oldPage: 1,
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
      tempQueryData.displayId = '';
      tempQueryData.displayName = '';
      tempQueryData.openFlag = false;

      this.setState({
        filterData,
        queryData: tempQueryData
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
   * Handle pagination change for LA and World Map
   * @method
   * @param {number} type - content type ('la' or 'map')
   * @param {number} currentPage - current page
   */
  handleLargePageChange = (type, currentPage) => {
    this.setState({
      currentPage
    }, () => {
      if (type === 'la') {
        this.resetLinkAnalysis();
      }
    });
  }
  /**
   * Handle page size dropdown for LA and World Map
   * @method
   * @param {number} type - content type ('la' or 'map')
   * @param {string} pageSize - current page size
   */
  handleLargePageDropdown = (type, pageSize) => {
    this.setState({
      currentPage: 1,
      pageSizeMap: Number(pageSize)
    }, () => {
      if (type === 'la') {
        this.resetLinkAnalysis();
      }
    });
  }
  /**
   * Handle pagination change
   * @method
   * @param {number} currentPage - current page
   * @param {string} options - options for dialogType ('table' or 'json')
   * @param {string} [type] - button action type ('previous' or 'next')
   */
  handlePaginationChange = (currentPage, options, type) => {
    this.setState({
      currentPage
    }, () => {
      this.loadLogs(options, type);
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
      this.loadLogs();
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
   * @param {number} id - ID of the selected raw data
   * @param {object} allValue - table data
   * @param {object} event - event object
   */
  handleRowMouseOver = (id, allValue, event) => {
    const {activeTab, subSectionsData} = this.state;
    let tempSubSectionsData = {...subSectionsData};
    tempSubSectionsData.mainData[activeTab] = _.map(tempSubSectionsData.mainData[activeTab], item => {
      return {
        ...item,
        _tableMenu_: allValue.id === item.id ? true : false
      };
    });

    this.setState({
      subSectionsData: tempSubSectionsData,
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

    if (filterData.length === 0) {
      currentFilterData.push({});
    }

    if (field) {
      value = field + ': "' + value + '"';
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
   * Open table menu when double click the table
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
    const {activeTab, currentPage, subSectionsData, currentTableIndex, currentLength} = this.state;
    let tableRowIndex = '';
    let allValue = {};
    let tempCurrentPage = currentPage;

    if (data === 'previous' || data === 'next') { //For click on navigation button
      tableRowIndex = currentTableIndex;

      if (data === 'previous') {
        if (currentTableIndex === 0) { //End of the data, load previous set
          this.handlePaginationChange(--tempCurrentPage, dialogType, data);
          return;
        } else {
          tableRowIndex--;
        }
      } else if (data === 'next') {
        if (currentTableIndex + 1 == currentLength) { //End of the data, load next set
          this.handlePaginationChange(++tempCurrentPage, dialogType, data);
          return;
        } else {
          tableRowIndex++;
        }
      }
      allValue = subSectionsData.mainData[activeTab][tableRowIndex];
    } else if (!_.isEmpty(data)) {
      tableRowIndex = _.findIndex(subSectionsData.mainData[activeTab], {'id': data.id});
      allValue = data;
    } else if (type) {
      if (type === 'previous') {
        tableRowIndex = subSectionsData.mainData[activeTab].length - 1;
      } else if (type === 'next') {
        tableRowIndex = 0;
      }
      allValue = subSectionsData.mainData[activeTab][tableRowIndex];
    }

    return {
      tableRowIndex,
      allValue
    };
  }
  /**
   * Set the data to be displayed in table dialog
   * @method
   * @param {object | string} allValue - data of selected table row, or button action type ('previous' or 'next')
   * @param {string} [type] - button action type ('previous' or 'next')
   */
  showTableData = (allValue, type) => {
    const {activeTab, subSectionsData, account} = this.state;
    const newData = this.handleDialogNavigation(allValue, 'table', type);

    if (!newData) {
      return;
    }

    const currentTableIndex = newData.tableRowIndex;
    let filteredAllValue = {};
    allValue = newData.allValue;

    _.forEach(allValue, (value, key) => {
      if (typeof value === 'object') {
        if (key === 'dns') {
          if (value['opcode-term']) {
            filteredAllValue['dns.opcode-term'] = helper.arrayDataJoin(value['opcode-term'], '', ', ');
          }
          if (value['status-term']) {
            filteredAllValue['dns.status-term'] = helper.arrayDataJoin(value['status-term'], '', ', ');
          }
        }
        if (key === 'tcpflags') {
          filteredAllValue['tcpflags.fin'] = value.fin;
          filteredAllValue['tcpflags.rst'] = value.rst;
        }
      } else {
        filteredAllValue[key] = value;
      }
    })

    const hiddenFields = ['id', '_tableMenu_', 'root_id', 'sessionId', 'projectName', 'timestamp', 'dns', 'tcpflags', 'alert', 'http', 'tag'];
    let dataList = _.omit(filteredAllValue, hiddenFields);
    let dataToShow = {};
    let dataToHide = {};
    let sortedDataList = [];
    const logsFieldsArr = subSectionsData.tableColumns.logs;

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
   */
  displayNavigationBtn = (dialogType, navType) => {
    const {currentPage, pageSize, currentTableIndex, currentLength, subSectionsData} = this.state;
    const firstItemCheck = currentTableIndex === 0;
    const lastItemCheck = currentTableIndex + 1 == currentLength;
    const firstPageCheck = currentPage === 1;
    const lastPageCheck = currentPage === Math.ceil(subSectionsData.totalCount.logs / pageSize);
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
    const {activeTab, subSectionsData} = this.state;
    let tempSubSectionsData = {...subSectionsData};
    tempSubSectionsData.mainData[activeTab] = [];
    tempSubSectionsData.fieldsData[activeTab] = {};
    tempSubSectionsData.totalCount[activeTab] = 0;
    tempSubSectionsData.tableColumns[activeTab] = [];

    this.setState({
      subSectionsData: tempSubSectionsData
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
   */
  tableDialog = () => {
    const title = t('txt-syslog') + ' ' + t('events.connections.txt-fieldsSettings');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog},
      confirm: {text: t('txt-confirm'), handler: this.resetDataTable.bind(this, 'setFields')}
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
    const hiddenFields = ['id', '_tableMenu_'];
    allValue = _.omit(allValue, hiddenFields);

    return (
      <div className='json-reports'>
        <ul className='json-data'>
          <li><JSONTree data={allValue} theme={helper.getJsonViewTheme()} /></li>
        </ul>

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
    if (newTab === 'table') {
      this.setState({
        currentPage: 1,
        pageSize: 20
      }, () => {
        this.loadLogs();
      });
    } else if (newTab === 'linkAnalysis') {
      this.setState({
        currentPage: 1,
        pageSizeMap: 500
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
   * Display table data content Syslog
   * @method
   * @returns Syslog component
   */
  renderTabContent = () => {
    const {activeTab, markData, tableMouseOver} = this.state;
    const mainContentData = {
      activeTab,
      markData,
      tableMouseOver,
      tableUniqueID: 'id',
      chartIntervalList: this.state.chartIntervalList,
      chartIntervalValue: this.state.chartIntervalValue,
      chartIntervalChange: this.handleIntervalChange,
      getChartsCSVfile: this.getChartsCSVfile,
      subTabMenu: this.state.subTabMenu,
      activeSubTab: this.state.activeSubTab,
      handleSubTabChange: this.handleSubTabChange,
      currentTableID: this.state.currentTableID,
      queryData: this.state.queryData,
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
      dataTableData: this.state.subSectionsData.mainData[activeTab],
      dataTableFields: this.state.subSectionsData.fieldsData[activeTab],
      LAdata: this.state.subSectionsData.laData[activeTab],
      logFields: this.state.logFields,
      LAconfig: this.state.LAconfig,
      logEventsData: this.state.logEventsData,
      dataTableSort: this.state.sort,
      handleTableSort: this.handleTableSort,
      handleRowMouseOver: this.handleRowMouseOver,
      handleRowDoubleClick: this.handleRowDoubleClick,
      paginationTotalCount: this.state.subSectionsData.totalCount[activeTab],
      paginationPageSize: this.state.pageSize,
      paginationAlertPageSize: this.state.pageSizeMap,
      paginationCurrentPage: this.state.currentPage,
      paginationPageChange: this.handlePaginationChange,
      paginationDropDownChange: this.handlePageDropdown,
      paginationAlertPageChange: this.handleLargePageChange,
      paginationAlertDropDownChange: this.handleLargePageDropdown
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
   * @param {string} [columns] - columns for CSV file
   */
  getCSVrequestData = (url, columns) => {
    let dataOptions = {
      ...this.toQueryLanguage('csv')
    };

    if (columns === 'columns') {
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

    downloadWithForm(url, {payload: JSON.stringify(dataOptions)});
  }
  /**
   * Handle CSV download
   * @method
   */
  getCSVfile = () => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/u1/log/event/_export`;
    this.getCSVrequestData(url, 'columns');
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
   * @param {string} type - type of query menu ('open' or 'save')
   */
  openQuery = (type) => {
    if (type === 'open') {
      const {queryData} = this.state;
      let tempQueryData = {...queryData};

      if (queryData.list.length > 0) {
        tempQueryData.id = queryData.list[0].id;
        tempQueryData.name = queryData.list[0].name;
        tempQueryData.query = queryData.list[0].queryText;
        tempQueryData.emailList = queryData.list[0].emailList;
        tempQueryData.patternId = queryData.list[0].patternId;
        tempQueryData.pattern.name = queryData.list[0].patternName;
        tempQueryData.pattern.periodMin = queryData.list[0].periodMin;
        tempQueryData.pattern.severity = queryData.list[0].severity;
        tempQueryData.pattern.threshold = queryData.list[0].threshold;
        tempQueryData.isPublic = queryData.list[0].isPublic;
      }

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
   * @param {array} filterData - filter data to be set
   */
  setFilterData = (filterData) => {
    this.setState({
      filterData
    });
  }
  /**
   * Set mark data
   * @method
   * @param {array} markData - mark data to be set
   */
  setMarkData = (markData) => {
    this.setState({
      markData
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
   * @param {string} type - query type ('open' or 'save')
   * @returns QueryOpenSave component
   */
  queryDialog = (type) => {
    const {activeTab, account, filterData, markData, queryData, notifyEmailData} = this.state;

    return (
      <QueryOpenSave
        activeTab={activeTab}
        type={type}
        account={account}
        filterData={filterData}
        markData={markData}
        queryData={queryData}
        notifyEmailData={notifyEmailData}
        setFilterData={this.setFilterData}
        setMarkData={this.setMarkData}
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
    const {queryData} = this.state;
    let tempQueryData = {...queryData};
    tempQueryData.inputName = '';
    tempQueryData.openFlag = false;

    this.setState({
      queryData: tempQueryData,
      notifyEmailData: []
    });
  }
  /**
   * Reset subSections data
   * @method
   */
  clearData = () => {
    const {activeTab, subSectionsData} = this.state;
    let tempSubSectionsData = {...subSectionsData};
    tempSubSectionsData.mainData = {
      logs: null
    };
    tempSubSectionsData.fieldsData = {
      logs: {}
    };
    tempSubSectionsData.laData = {
      logs: []
    };
    tempSubSectionsData.totalCount = {
      logs: 0
    };

    this.setState({
      subSectionsData: tempSubSectionsData
    }, () => {
      this.loadFields(activeTab);
    });
  }
  render() {
    const {
      activeTab,
      datetime,
      subSectionsData,
      searchInput,
      modalOpen,
      openQueryOpen,
      saveQueryOpen,
      filterData,
      markData,
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
            <Button variant='outlined' color='primary' className={cx({'active': showMark})} onClick={this.toggleMark}><i className='fg fg-filter'></i><span>({filterDataCount})</span> <i className='fg fg-edit'></i><span>({markDataCount})</span></Button>
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

SyslogController.contextType = BaseDataContext;

SyslogController.propTypes = {
};

export default withRouter(SyslogController);