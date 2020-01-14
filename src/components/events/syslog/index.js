import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'
import queryString from 'query-string'

import {analyze} from 'vbda-ui/build/src/analyzer'
import {config as configLoader} from 'vbda-ui/build/src/loader'
import ContextMenu from 'react-ui/build/src/components/contextmenu'
import {downloadWithForm} from 'react-ui/build/src/utils/download'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {arrayMove} from 'react-sortable-hoc'
import JSONTree from 'react-json-tree'

import {BaseDataContext} from '../../common/context';
import helper from '../../common/helper'
import {HocQueryOpenSave as QueryOpenSave} from '../../common/query-open-save'
import {HocSearchOptions as SearchOptions} from '../../common/search-options'
import {HocSortableList as SortableList} from '../../common/sortable-list'
import Syslog from './syslog'
import {HocTableCell as TableCell} from '../../common/table-cell'
import withLocale from '../../../hoc/locale-provider'
import WORLDMAP from '../../../mock/world-map-low.json'

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

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    et = chewbaccaI18n.getFixedT(null, 'errors');

    this.state = {
      activeTab: 'logs',
      previousTab: '',
      //General
      datetime: {
        from: helper.getSubstractDate(1, 'hour'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
        //from: '2019-07-25T03:10:00Z',
        //to: '2019-08-01T04:10:00Z'
      },
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
      treeData: {},
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
        refreshTime: '600000' //10 minutes
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
          logs: []
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
        inputName: '',
        displayId: '',
        displayName: '',
        list: [],
        query: '',
        formattedQuery: '',
        openFlag: false
      },
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
      url: `${baseUrl}/api/u1/log/event/_event_source_tree`,
      type: 'GET'
    })
    .then(data => {
      const treeObj = this.getTreeData(data);

      this.setState({
        treeRawData: data,
        treeData: treeObj
      });
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set initial data for page load
   * @method
   */
  initialLoad = () => {
    const syslogParams = queryString.parse(location.search);

    if (syslogParams.configId) {
      this.setState({
        filterData: [{
          condition: 'must',
          query: syslogParams.configId
        }],
        showFilter: true,
        showMark: true
      });
    }

    if (syslogParams.configSource) {
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
    }

    if (syslogParams.srcIp || syslogParams.ipSrc) {
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
    })
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
    const dateTime = {
      startDttm: Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm') + ':00Z',
      endDttm: Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm') + ':00Z'
    };

    helper.getAjaxData('POST', url, dateTime)
    .then(data => {
      let filedsArr = ['_tableMenu_'];

      _.forEach(data, val => {
        filedsArr.push(val);
      });

      this.setState({
        logFields: filedsArr
      }, () => {
        this.loadLogsLocaleFields();
      });
    });
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
    })
    .then(data => {
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
    if (_.includes(this.state.account.fields, field) || field === '_tableMenu_') {
      return true;
    }
    return false;
  }
  /**
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable or null
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

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      if (data.data.rows) {
        const logsData = data.data;

        _.forEach(logsData.rows, val => {
          logEventsData[val.id] = val.content;
        })

        tempSubSectionsData.laData[activeTab] = analyze(logEventsData, LAconfig, {analyzeGis: false});
        tempSubSectionsData.totalCount[activeTab] = logsData.counts;

        _.forEach(data.search, val => {
          eventHistogram[val.searchName] = val.eventHistogram
        })
      } else {
        helper.showPopupMsg(t('txt-notFound', ''));
        return;
      }

      this.setState({
        logEventsData,
        eventHistogram,
        subSectionsData: tempSubSectionsData
      });
    });
  }
  /**
   * Construct the netflow events api request body
   * @method
   * @returns requst data object
   */
  toQueryLanguage = () => {
    const {datetime, sort, filterData, markData} = this.state;
    const timeAttribute = '@timestamp';
    let dateFrom = datetime.from;
    let dateTo = datetime.to;
    let dateTime = {};
    let dataObj = {};
    let filterDataArr = [];
    let markDataArr = [];
    let sortObj = {};

    dateTime = {
      from: Moment(dateFrom).utc().format('YYYY-MM-DDTHH:mm') + ':00Z',
      to: Moment(dateTo).utc().format('YYYY-MM-DDTHH:mm') + ':00Z'
    };

    dataObj[timeAttribute] = [dateTime.from, dateTime.to];
    sortObj[sort.field] = sort.desc ? 'desc' : 'asc';

    if (filterData.length > 0) {
      filterDataArr = helper.buildFilterDataArray(filterData);

      if (filterDataArr.length > 0) {
        dataObj['filters'] = filterDataArr;
      }
    }

    _.forEach(markData, val => {
      if (val.data) {
        markDataArr.push(val.data);
      }
    })

    if (markDataArr.length > 0) {
      dataObj['search'] = markDataArr;
    }

    const dataOptions = {
      ...dataObj,
      sort: [sortObj]
    };

    return dataOptions;
  }
  /**
   * Get custom field name
   * @method
   * @param {string} field - field name
   * @param {string} page - option for 'logs'
   */
  getCustomFieldName = (field, page) => {
    const {account} = this.state;

    if (_.has(account.logsLocale, field)) {
      return account.logsLocale[field];
    } else {
      if (page === 'logs') {
        return f(`logsFields.${field}`);
      }
    }
  }
  /**
   * Load Syslog data
   * @method
   * @param {string} options - option for 'search'
   */
  loadLogs = (options) => {
    const {baseUrl} = this.context;
    const {activeTab, currentPage, oldPage, pageSize, subSectionsData, markData} = this.state;
    const setPage = options === 'search' ? 1 : currentPage;

    this.ah.all([{
      url: `${baseUrl}/api/u1/log/event/_search?page=${setPage}&pageSize=${pageSize}`,
      data: JSON.stringify(this.toQueryLanguage()),
      type: 'POST',
      contentType: 'text/plain'
    },
    {
      url: `${baseUrl}/api/u1/log/event/_search?page=0&pageSize=0&timeline=true`,
      data: JSON.stringify(this.toQueryLanguage()),
      type: 'POST',
      contentType: 'text/plain'
    }])
    .then(data => {
      if (currentPage > 1 && !data[0].data) {
        helper.showPopupMsg('', t('txt-error'), t('events.connections.txt-maxDataMsg'));

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
          label: this.getCustomFieldName(tempData, 'logs'),
          sortable: this.checkSortable(tempData),
          formatter: (value, allValue) => {
            if (tempData === '_tableMenu_') {
              return (
                <div className={cx('table-menu', {'active': value})}>
                  <button onClick={this.handleRowContextMenu.bind(this, allValue)}><i className='fg fg-more'></i></button>
                </div>
              )
            }
            if (tempData === '@timestamp') {
              value = helper.getFormattedDate(value, 'local');
            }
            if (tempData === '_Raw' || tempData === 'message' || tempData === 'msg') {
              if (value) {
                value = value.substr(0, 50) + '...';
              } else {
                value = value;
              }
            }
            return (
              <TableCell
                activeTab={activeTab}
                fieldValue={value}
                fieldName={tempData}
                allValue={allValue}
                markData={markData}
                showQueryOptions={this.showQueryOptions} />
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
      });
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
   * @param {string} value - tree node name
   */
  showTreeFilterBtn = (value) => {
    this.setState({
      currentTreeName: value,
      treeData: this.getTreeData(this.state.treeRawData, value)
    });
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
        _.forEach(val, val2 => {
          label = <span title={val2}>{val2} <button className={cx('button', {'active': currentTreeName === val2})} onClick={this.selectTree.bind(this, val2, '_host')}>{t('events.connections.txt-addFilter')}</button></span>;

          tempChild.push({
            id: val2,
            label
          });
        })

        label = <span title={key}>{key} ({val.length}) <button className={cx('button', {'active': currentTreeName === key})} onClick={this.selectTree.bind(this, key, 'configSource')}>{t('events.connections.txt-addFilter')}</button></span>;

        let treeProperty = {
          id: key,
          label
        };

        if (tempChild.length > 0) {
          treeProperty.children = tempChild;
        }

        treeObj.children.push(treeProperty);
        allServiceCount += val.length;
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
    tempSubSectionsData.mainData[activeTab] = [];

    this.setState({
      subSectionsData: tempSubSectionsData
    });

    if (fromSearch) {
      this.setState({
        currentPage: 1,
        oldPage: 1,
        tableMouseOver: false
      }, () => {
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
   */
  handlePaginationChange = (currentPage) => {
    this.setState({
      currentPage
    }, () => {
      this.loadLogs();
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
  handleTableSort = (value) => {
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
   * Handle tree filter button selection
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
   * @param {object} evt - MouseoverEvents
   */
  handleRowMouseOver = (id, allValue, evt) => {
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
   * Construct and display table context menu
   * @method
   * @param {object} allValue - syslog data
   * @param {object} evt - mouseClick events
   */
  handleRowContextMenu = (allValue, evt) => {
    const menuItems = [
      {
        id: allValue.id + 'Table',
        text: t('events.connections.txt-fieldsSettings'),
        action: () => this.showTableData(allValue)
      },
      {
        id: allValue.id + 'Json',
        text: t('events.connections.txt-viewJSON'),
        action: () => this.viewJsonData(allValue)
      }
    ];

    ContextMenu.open(evt, menuItems, 'syslogViewMenu');
    evt.stopPropagation();
  }
  /**
   * Show query option when click on the table raw filter icon
   * @method
   * @param {string} field - field name of selected field
   * @param {string | number} value - value of selected field
   * @param {object} e - mouseClick events
   */
  showQueryOptions = (field, value) => (e) => {
    const menuItems = [
      {
        id: value + '_Must',
        text: 'Must',
        action: () => this.addSearch(field, value, 'must')
      },
      {
        id: value + '_MustNot',
        text: 'Must Not',
        action: () => this.addSearch(field, value, 'must_not')
      },
      {
        id: value + '_Either',
        text: 'Either',
        action: () => this.addSearch(field, value, 'either')
      }
    ];

    ContextMenu.open(e, menuItems, 'eventsQueryMenu');
    e.stopPropagation();
  }
  /**
   * Add tree node to search filter
   * @method
   * @param {string} field - corresponding field of selected node
   * @param {string} value - selected node name
   * @param {string} type - condition of selected node ('must')
   */
  addSearch = (field, value, type) => {
    const {filterData} = this.state;
    let currentFilterData = filterData;

    if (filterData.length === 0) {
      currentFilterData.push({});
    }

    if (field) {
      value = field + ': ' + value;
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
  }
  /**
   * Handle value change for the checkbox in the table dialog
   * @method
   * @param {string} field - field of selected checkbox
   * @param {boolean} data - checked/uncheck status
   */
  setFieldsChange = (field, data) => {
    let tempAccount = {...this.state.account};

    if (_.includes(tempAccount.fields, field)) {
      if (!data) {
        const index = tempAccount.fields.indexOf(field);
        tempAccount.fields.splice(index, 1);
      }
    } else {
      if (data) {
        tempAccount.fields.push(field);
      }
    }

    this.setCustomFields(tempAccount.fields);
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
    })
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
   * @param {object} evt - mouseClick events
   */
  handleRowDoubleClick = (index, allValue, evt) => {
    this.showTableData(allValue, index);
    evt.stopPropagation();
    return null;
  }
  /**
   * Set the table raw index and netflow data
   * @method
   * @param {string | object} data - button action type ('previous' or 'next'), or data object
   * @returns object of index and data
   */
  handleDialogNavigation = (data) => {
    const {activeTab, subSectionsData, currentTableIndex} = this.state;
    let tableRowIndex = '';
    let allValue = {};

    if (data === 'next' || data === 'previous') { //For click on navigation button
      tableRowIndex = currentTableIndex;

      if (data === 'next') {
        tableRowIndex++;
      } else if (data === 'previous') {
        tableRowIndex--;
      }
      allValue = subSectionsData.mainData[activeTab][tableRowIndex];
    } else { //For click on table raw
      tableRowIndex = _.findIndex(subSectionsData.mainData[activeTab], {'id': data.id});
      allValue = data;
    }

    return {
      tableRowIndex,
      allValue
    };
  }
  /**
   * Set the data to be displayed in table dialog
   * @method
   * @param {object} allValue - data of selected table raw
   */
  showTableData = (allValue) => {
    const {activeTab, subSectionsData, account} = this.state;
    const newData = this.handleDialogNavigation(allValue);
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
  }
  /**
   * Set default and custom locale name
   * @method
   * @param {string} key - default field name
   * @param {string} localeField - custom locale name
   */
  toggleLocaleEdit = (key, localeField) => {
    const logCustomLocal = localeField ? localeField : key;

    this.setState({
      logLocaleChangeOpen: true,
      logActiveField: key,
      logCustomLocal
    });
  }
  /**
   * Handle locale input value change
   * @method
   * @param {string} value - input value
   */
  handleLocaleChange = (value) => {
    this.setState({
      logCustomLocal: value
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
        <Input
          type='text'
          className='field-input'
          required={true}
          validate={{
            t: et
          }}
          onChange={this.handleLocaleChange}
          value={logCustomLocal} />
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
    const dataObj = {
      accountId: account.id,
      field: logActiveField,
      locale: logCustomLocal
    };

    helper.getAjaxData('POST', url, dataObj)
    .then(data => {
      this.closeLocaleChange('reload');
      return null;
    });
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
          showQueryOptions={this.showQueryOptions}
          toggleLocaleEdit={this.toggleLocaleEdit}
          useDragHandle={true}
          lockToContainerEdges={true} />

        {currentLength > 1 &&
          <div className='pagination'>
            <div className='buttons'>
              <button onClick={this.showTableData.bind(this, 'previous')} disabled={currentTableIndex === 0}>{t('txt-previous')}</button>
              <button onClick={this.showTableData.bind(this, 'next')} disabled={currentTableIndex + 1 == currentLength}>{t('txt-next')}</button>
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
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog},
      confirm: {text: t('txt-confirm'), handler: this.resetDataTable.bind(this, 'setFields')}
    };
    const titleText = 'Logs ' + t('txt-table');

    return (
      <ModalDialog
        id='flowModalDialog'
        className='modal-dialog'
        title={titleText}
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
            <button onClick={this.viewJsonData.bind(this, 'previous')} disabled={currentTableIndex === 0}>{t('txt-previous')}</button>
            <button onClick={this.viewJsonData.bind(this, 'next')} disabled={currentTableIndex + 1 == currentLength}>{t('txt-next')}</button>
          </div>
          <span className='count'>{currentTableIndex + 1} / {currentLength}</span>
        </div>
      </div>
    )
  }
  /**
   * Open Json data modal dialog
   * @method
   * @param {object} allValue - data of selected table raw
   */
  viewJsonData = (allValue) => {
    const newData = this.handleDialogNavigation(allValue);
    const currentTableIndex = newData.tableRowIndex;
    const title = 'Logs JSON';
    allValue = newData.allValue;

    this.setState({
      currentTableIndex,
      currentTableID: allValue.id
    }, () => {
      PopupDialog.alert({
        title,
        id: 'viewJsonDialog',
        confirmText: t('txt-close'),
        display: this.displayJsonData(allValue),
        act: (confirmed, data) => {
        }
      });
    });
  }
  /**
   * Set new datetime
   * @method
   * @param {object} datetime - new datetime object
   * @param {string} refresh - option for 'refresh'
   */
  handleDateChange = (datetime, refresh) => {
    this.setState({
      datetime
    }, () => {
      if (refresh === 'refresh') {
        this.loadLogs();
      }
    });
  }
  /**
   * Handle content tab change
   * @method
   * @param {string} newTab - content type ('table' or 'linkAnalysis')
   */
  handleSubTabChange = (newTab) => {
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
   * Handle CSV download
   * @method
   */
  getCSVfile = () => {
    const {baseUrl, contextRoot} = this.context;
    const {activeTab, account} = this.state;
    const url = `${baseUrl}${contextRoot}/api/u1/log/event/_export`;
    let tempColumns = [];
    let dataOptions = {};

    _.forEach(account.fields, val => {
      if (val !== 'alertRule' && val != '_tableMenu_') {
        tempColumns.push({
          [val]: f(`${activeTab}Fields.${val}`)
        });
      }
    })

    dataOptions = {
      ...this.toQueryLanguage(),
      columns: tempColumns
    };

    downloadWithForm(url, {payload: JSON.stringify(dataOptions)});
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
      this.setState({
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
   * Display query menu modal dialog
   * @method
   * @param {string} type - query type ('open' or 'save')
   * @returns QueryOpenSave component
   */
  queryDialog = (type) => {
    const {activeTab, account, filterData, markData, queryData} = this.state;

    return (
      <QueryOpenSave
        activeTab={activeTab}
        type={type}
        account={account}
        filterData={filterData}
        markData={markData}
        queryData={queryData}
        setFilterData={this.setFilterData}
        setQueryData={this.setQueryData}
        setMarkData={this.setMarkData}
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
   * @param {string} type - search type to be set ('all' and others)
   * @param {string} value - search value to be set
   */
  setSearchData = (type, value) => {
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
    const {queryData} = this.state;
    let tempQueryData = {...queryData};
    tempQueryData.inputName = '';
    tempQueryData.openFlag = false;

    this.setState({
      queryData: tempQueryData
    });
  }
  /**
   * Reset subSections data
   * @method
   */
  clearData = () => {
    const {activeTab} = this.state;
    const subSectionsData = {
      mainData: {
        logs: []
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
    };

    this.setState({
      subSectionsData
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

        <div className='sub-header'>
          {helper.getEventsMenu('syslog')}

          <SearchOptions
            position='226px'
            datetime={datetime}
            searchInput={searchInput}
            showFilter={showFilter}
            showInterval={true}
            setSearchData={this.setSearchData}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.handleSearchSubmit} />

          <div className='secondary-btn-group right'>
            <button className={cx({'active': showMark})} onClick={this.toggleMark}><i className='fg fg-filter'></i><span>({filterDataCount})</span> <i className='fg fg-edit'></i><span>({markDataCount})</span></button>
            <button className={cx({'active': showChart})} onClick={this.toggleChart} title={t('events.connections.txt-toggleChart')}><i className='fg fg-chart-columns'></i></button>
            <button className='last' onClick={this.getCSVfile} title={t('events.connections.txt-exportCSV')}><i className='fg fg-data-download'></i></button>
          </div>
        </div>

        {this.renderTabContent()}
      </div>
    )
  }
}

SyslogController.contextType = BaseDataContext;

SyslogController.propTypes = {
};

const HocSyslogController = withRouter(withLocale(SyslogController));
export { SyslogController, HocSyslogController };