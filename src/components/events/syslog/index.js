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
        refreshTime: '600000', //10 minutes
        inputManual: '',
        inputAuto: '',
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
    const {session} = this.props;
    const dataObj = queryString.parse(location.search);
    let tempAccount = {...this.state.account};

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

      if (dataObj.eventDttm) {
        let eventDttm = helper.getFormattedDate(Number(dataObj.eventDttm), 'local');

        if (!eventDttm) {
          eventDttm = helper.getFormattedDate(dataObj.eventDttm, 'local');
        }

        const datetime = {
          from: Moment(eventDttm).local().subtract(7, 'days').format('YYYY-MM-DDTHH:mm') + ':00',
          to: eventDttm
        };
        const filterData = [
          {
            fields: 'srcIp',
            condition: '=',
            query: dataObj.srcIp
          },
          {
            fields: 'destIp',
            condition: '=',
            query: dataObj.destIp
          }
        ];
        const markData = [
          {
            data: '',
            color: 'red'
          }
        ];

        this.setState({
          datetime,
          filterData,
          markData,
          showFilter: true
        });
      }
    }
  }
  getLAconfig = () => {
    const {baseUrl} = this.props;

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
  getSavedQuery = () => {
    const {baseUrl} = this.props;
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
  getSyslogTree = () => {
    const {baseUrl} = this.props;
    const url = `${baseUrl}/api/u1/log/event/_event_source_tree`;

    this.ah.one({
      url,
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
  initialLoad = () => {
    const syslogParams = queryString.parse(location.search);

    if (syslogParams.configId) {
      this.setState({
        filterData: [{
          condition: 'must',
          query: 'configId: ' + syslogParams.configId
        }]
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
        }]
      });
    }

    this.loadFields(this.state.activeTab);
  }
  loadFields = (activeTab, options, fromSearch) => {
    const {baseUrl} = this.props;
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
          this.loadLogsFields(fromSearch);
        });
      } else {
        this.loadFields(activeTab, 'showDefault', fromSearch);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  loadLogsFields = (fromSearch) => {
    const {baseUrl} = this.props;
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
        this.loadLogsLocaleFields(fromSearch);
      });
    });
  }
  loadLogsLocaleFields = (fromSearch) => {
    const {baseUrl} = this.props;
    const {account} = this.state;
    const url = `${baseUrl}/api/account/log/locales?accountId=${account.id}`;

    this.ah.one({
      url,
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
        this.loadLogs(fromSearch);
      });
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  checkDisplayFields = (field) => {
    if (_.includes(this.state.account.fields, field) || field === '_tableMenu_') {
      return true;
    }
    return false;
  }
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
  loadLinkAnalysis = (options) => {
    const {baseUrl, contextRoot} = this.props;
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
  loadLogs = (options) => {
    const {baseUrl, contextRoot} = this.props;
    const {currentPage, oldPage, pageSize, subSectionsData, markData} = this.state;
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
                baseUrl={baseUrl}
                contextRoot={contextRoot}
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
  loadActiveSubTab = (options) => {
    const {activeSubTab} = this.state;

    if (activeSubTab === 'table') {
      this.loadLogs(options);
    } else if (activeSubTab === 'linkAnalysis') {
      this.loadLinkAnalysis(options);
    }
  }
  showFilterBtn = (value) => {
    this.setState({
      currentTreeName: value,
      treeData: this.getTreeData(this.state.treeRawData, value)
    });
  }
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
        allServiceCount++;
      }
    })

    treeObj.label = t('txt-all') + ' (' + allServiceCount + ')';

    return treeObj;
  }
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
  handleLargePageChange = (type, currentPage) => {
    this.setState({
      currentPage
    }, () => {
      if (type === 'la') {
        this.resetLinkAnalysis();
      }
    });
  }
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
  handlePageChange = (currentPage) => {
    this.setState({
      currentPage
    }, () => {
      this.loadLogs();
    });
  }
  handlePageDropdown = (pageSize) => {
    this.setState({
      currentPage: 1,
      pageSize: Number(pageSize)
    }, () => {
      this.loadLogs();
    });
  }
  handleTableSort = (value) => {
    const {sort} = this.state;
    let tempSort = {...sort};
    tempSort.field = value.field;
    tempSort.desc = !sort.desc;

    this.setState({
      sort: tempSort
    }, () => {
      this.loadLogs();
    });
  }
  selectTree = (value, field) => {
    this.setState({
      loadLogsData: false
    }, () => {
      this.addSearch(field, value, 'must');
    });
  }
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
  setCustomFields = (fields) => {
    const {baseUrl} = this.props;
    const {account} = this.state;
    let tempAccount = {...account};
    let fieldString = '';
    let url = '';
    tempAccount.fields = fields;

    _.forEach(fields, value => {
      fieldString += '&field=' + value;
    })

    url = `${baseUrl}/api/account/log/fields?accountId=${account.id}${fieldString}`;

    ah.one({
      url,
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
  handleRowDoubleClick = (index, allValue, evt) => {
    this.showTableData(allValue, index);
    evt.stopPropagation();
    return null;
  }
  handleDialogNavigation = (allValue, index) => {
    const {activeTab, subSectionsData, currentTableIndex} = this.state;
    let tableIndex = '';
    let tableRowIndex = '';

    if (allValue === 'next' || allValue === 'previous') {
      tableIndex = currentTableIndex;

      if (allValue === 'next') {
        tableIndex++;
      } else if (allValue === 'previous') {
        tableIndex--;
      }

      allValue = subSectionsData.mainData[activeTab][tableIndex];
    }

    if (Number(index) >= 0) {
      tableRowIndex = Number(index); //Find index for table row click
    } else {
      if (tableIndex) {
        tableRowIndex = tableIndex; //Find index when click on 'next' and 'previous' button
      } else {
        tableRowIndex = _.findIndex(subSectionsData.mainData[activeTab], {'id': allValue.id}); //Find table index for ContextMenu
      }
    }

    return {
      allValue,
      tableRowIndex
    };
  }
  showTableData = (allValue, index) => {
    const {activeTab, subSectionsData, account} = this.state;
    const newData = this.handleDialogNavigation(allValue, index);
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
  toggleLocaleEdit = (key, localeField) => {
    const logCustomLocal = localeField ? localeField : key;

    this.setState({
      logLocaleChangeOpen: true,
      logActiveField: key,
      logCustomLocal
    });
  }
  closeLocaleChange = (reload) => {
    this.setState({
      logLocaleChangeOpen: false,
      logActiveField: '',
      logCustomLocal: ''
    }, () => {
      if (reload === 'reload') {
        this.loadLogsLocaleFields();
      }
    });
  }
  handleLocaleChange = (value) => {
    this.setState({
      logCustomLocal: value
    });
  }
  localeChangeDialog = () => {
    const {logCustomLocal} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeLocaleChange},
      confirm: {text: t('txt-confirm'), handler: this.setCustomLocale}
    };
    const titleText = t('syslogFields.txt-customFieldName');

    return (
      <ModalDialog
        id='flowModalDialog'
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
  setCustomLocale = () => {
    const {baseUrl} = this.props;
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
  onSortEnd = (listObj) => {
    this.setState({
      sortedDataList: arrayMove(this.state.sortedDataList, listObj.oldIndex, listObj.newIndex)
    });
  }
  closeDialog = () => {
    this.setState({
      modalOpen: false,
      openQueryOpen: false,
      saveQueryOpen: false
    }, () => {
      this.clearQueryData();
    });
  }
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
  modalDialog = () => {
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
  handleDateChange = (datetime, refresh) => {
    this.setState({
      datetime
    }, () => {
      if (refresh === 'refresh') {
        this.loadLogs();
      }
    });
  }
  getTabChartData = () => {
    return {
      chartData: this.state.eventHistogram
    };
  }
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
  renderTabContent = () => {
    const {baseUrl, contextRoot, language, searchFields} = this.props;
    const {activeTab, markData, tableMouseOver} = this.state;
    const mainContentData = {
      searchFields,
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
      showFilterBtn: this.showFilterBtn,
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
      paginationPageChange: this.handlePageChange,
      paginationDropDownChange: this.handlePageDropdown,
      paginationAlertPageChange: this.handleLargePageChange,
      paginationAlertDropDownChange: this.handleLargePageDropdown
    };

    return (
      <Syslog
        baseUrl={baseUrl}
        contextRoot={contextRoot}
        language={language}
        mainContentData={mainContentData}
        tabChartData={this.getTabChartData()}
        markData={markData}
        tableMouseOver={tableMouseOver} />
    )
  }
  getCSVfile = () => {
    const {baseUrl, contextRoot} = this.props;
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
  toggleMark = () => {
    this.setState({
      showFilter: !this.state.showFilter,
      showMark: !this.state.showMark
    });
  }
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
  setFilterData = (filterData) => {
    this.setState({
      filterData
    });
  }
  setMarkData = (markData) => {
    this.setState({
      markData
    });
  }
  setQueryData = (queryData) => {
    this.setState({
      queryData
    });
  }
  queryDialog = (type) => {
    const {baseUrl, contextRoot} = this.props;
    const {activeTab, account, filterData, markData, queryData} = this.state;

    return (
      <QueryOpenSave
        baseUrl={baseUrl}
        contextRoot={contextRoot}
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
  toggleChart = () => {
    this.setState({
      showChart: !this.state.showChart
    });
  }
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
  clearQueryData = () => {
    const {queryData} = this.state;
    let tempQueryData = {...queryData};
    tempQueryData.inputName = '';
    tempQueryData.openFlag = false;

    this.setState({
      queryData: tempQueryData
    });
  }
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
    const {session} = this.props;
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
    let sessionRights = {};
    let filterDataCount = 0;
    let markDataCount = 0;

    _.forEach(session.rights, val => {
      sessionRights[val] = true;
    })

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

    if (!sessionRights.Module_Syslog_Manage) {
      return;
    }

    return (
      <div>
        {modalOpen &&
          this.modalDialog()
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
          {helper.getEventsMenu('syslog', sessionRights)}

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

SyslogController.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  searchFields: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};

const HocSyslogController = withRouter(withLocale(SyslogController));
export { SyslogController, HocSyslogController };