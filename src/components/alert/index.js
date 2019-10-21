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

import JSONTree from 'react-json-tree'

import Alert from './alert'
import {HocAlertDetails as AlertDetails} from '../common/alert-details'
import helper from '../common/helper'
import {HocQueryOpenSave as QueryOpenSave} from '../common/query-open-save'
import {HocSearchOptions as SearchOptions} from '../common/search-options'
import {HocTableCell as TableCell} from '../common/table-cell'
import withLocale from '../../hoc/locale-provider'
import WORLDMAP from '../../mock/world-map-low.json'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

const PRIVATE = 'private';
const PUBLIC = 'public';
const PRIVATE_API = {
  name: 'Top10InternalMaskedIp',
  path: 'srcIp'
};
const PUBLIC_API = {
  name: 'Top10ExternalSrcCountry',
  path: 'srcCountry'
};

const SEVERITY_TYPE = ['High', 'Medium', 'Low'];
const ALERT_LEVEL_COLORS = {
  High: '#d9576c',
  Medium: '#d99857',
  Low: '#57c3d9'
};
const SUBSECTIONS_DATA = {
  //Sub sections
  subSectionsData: {
    mainData: {
      alert: []
    },
    fieldsData: {
      alert: {}
    },
    tableColumns: {},
    totalCount: {
      alert: 0
    }
  }
};
const ALERT_MAIN_DATA = {
  //General
  datetime: {
    from: helper.getSubstractDate(1, 'hour'),
    to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
    //from: '2019-06-28T05:28:00Z',
    //to: '2019-07-19T06:28:00Z'
  },
  currentPage: 1,
  oldPage: 1,
  pageSize: 20,
  sort: {
    field: '_eventDttm_',
    desc: true
  },
  //Left nav
  treeData: {
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
    alert: {
      title: '',
      rawData: {},
      data: {},
      currentTreeName: ''
    }
  },
  //Search bar
  searchInput: {
    searchType: 'manual',
    searchInterval: '1h',
    refreshTime: '600000', //10 minutes
    inputManual: '',
    inputAuto: '',
  },
  alertHistogram: {},
  filterData: [{
    condition: 'must',
    query: ''
  }],
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
    openFlag: false
  },
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
  loadAlertData: true
};

class AlertController extends Component {
  constructor(props) {
    super(props);

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    et = chewbaccaI18n.getFixedT(null, 'errors');

    this.state = {
      activeTab: 'alert',
      account: {
        id: '',
        login: false,
        fields: [],
        logsLocale: ''
      },
      ..._.cloneDeep(ALERT_MAIN_DATA)
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {session} = this.props;
    let tempAccount = {...this.state.account};

    if (session.accountId) {
      tempAccount.id = session.accountId;
      tempAccount.login = true;

      this.setState({
        account: tempAccount
      }, () => {
        this.getSavedQuery();
        this.loadTreeData();
        this.loadAllFields();
      });
    }
  }
  getSavedQuery = () => {
    const {baseUrl} = this.props;
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
  loadTreeData = () => {
    const {baseUrl} = this.props;
    const {currentPage, pageSize, treeData} = this.state;
    const url = `${baseUrl}/api/u1/alert/_search?page=${currentPage}&pageSize=${pageSize}`;
    const requestData = this.toQueryLanguage('tree');

    helper.getAjaxData('POST', url, requestData)
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

        this.setState({
          treeData: tempTreeData
        });
      }
      return null;
    });
  }
  loadAllFields = () => {
    let tempSubSectionsData = {...this.state.subSectionsData};
    tempSubSectionsData.tableColumns = _.cloneDeep(this.props.searchFields);

    this.setState({
      subSectionsData: tempSubSectionsData
    }, () => {
      this.loadTable();
    });
  }
  loadTable = (options) => {
    const {baseUrl, contextRoot} = this.props;
    const {activeTab, currentPage, oldPage, pageSize, subSectionsData, account, alertDetails} = this.state;
    const setPage = options === 'search' ? 1 : currentPage;
    const url = `${baseUrl}/api/u1/alert/_search?page=${setPage}&pageSize=${pageSize}`;
    const requestData = this.toQueryLanguage(options);

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      if (currentPage > 1 && data.data.rows.length === 0) {
        helper.showPopupMsg('', t('txt-error'), t('events.connections.txt-maxDataMsg'));

        this.setState({
          currentPage: oldPage
        });
        return;
      }

      let alertHistogram = {
        High: {},
        Medium: {},
        Low: {}
      };
      let tableData = data.data;
      let tempArray = [];
      let tempSubSectionsData = {...subSectionsData};

      if (_.isEmpty(tableData) || (tableData && tableData.counts === 0)) {
        helper.showPopupMsg(t('txt-notFound', ''));

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
        return;
      }

      tempSubSectionsData.totalCount[activeTab] = tableData.counts;
      tableData = tableData.rows;

      tempArray = _.map(tableData, val => {
        val._source.id = val._id;
        val._source.index = val._index;
        return val._source;
      });

      let tempAlertDetails = {...alertDetails};
      tempAlertDetails.currentIndex = 0;
      tempAlertDetails.currentLength = tableData.length < pageSize ? tableData.length : pageSize;
      tempAlertDetails.all = tempArray;

      _.forEach(SEVERITY_TYPE, val => { //Create Alert histogram for High, Medium, Low
        _.forEach(data.event_histogram[val].buckets, val2 => {
          if (val2.doc_count > 0) {
            alertHistogram[val][val2.key_as_string] = val2.doc_count;
          }
        })
      })

      this.setState({
        alertHistogram,
        alertDetails: tempAlertDetails
      });

      let tempFields = {};
      subSectionsData.tableColumns[activeTab].forEach(tempData => {
        let tempFieldName = tempData;

        tempFields[tempData] = {
          hide: false,
          label: f(`${activeTab}Fields.${tempFieldName}`),
          sortable: true,
          formatter: (value, allValue) => {
            if (tempData === 'Severity') {
              return <span className='severity' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>;
            } else {
              if (tempData === '_eventDttm_') {
                value = helper.getFormattedDate(value, 'local');
              }
              return (
                <TableCell
                  baseUrl={baseUrl}
                  contextRoot={contextRoot}
                  activeTab={activeTab}
                  fieldValue={value}
                  fieldName={tempData}
                  allValue={allValue} />
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

      return null;
    });
  }
  toQueryLanguage = (options) => {
    const {datetime, activeLocationTab, filterData} = this.state;
    const timeAttribute = 'timestamp';
    const defaultCondition = {
      condition: 'must',
      query: 'All'
    };
    const defaultSearch = [PRIVATE_API.name, PUBLIC_API.name];
    let dateFrom = datetime.from;
    let dateTo = datetime.to;
    let dateTime = {};
    let dataObj = {};

    dateTime = {
      from: Moment(dateFrom).utc().format('YYYY-MM-DDTHH:mm') + ':00Z',
      to: Moment(dateTo).utc().format('YYYY-MM-DDTHH:mm') + ':00Z'
    };
    dataObj[timeAttribute] = [dateTime.from, dateTime.to];

    if (options === 'tree') {
      dataObj['filters'] = [{
        condition: 'must',
        query: 'All'
      }];
      dataObj['search'] = defaultSearch;
    } else {
      let filterDataArr = [];

      if (filterData.length === 1 && filterData[0].query === '') {
        dataObj['filters'] = [defaultCondition];
      } else {
        filterDataArr = helper.buildFilterDataArray(filterData);
        filterDataArr.unshift(defaultCondition);
      }

      if (filterDataArr.length > 0) {
        dataObj['filters'] = filterDataArr;
      }
    }

    const dataOptions = {
      ...dataObj
    };

    return dataOptions;
  }
  showFilterBtn = (type, value) => {
    const {treeData} = this.state;

    let tempTreeData = {...treeData};
    tempTreeData[type].currentTreeName = value;
    let individualTreeData = '';

    if (type === 'private') {
      individualTreeData = this.getPrivateTreeData(tempTreeData[type].rawData, value);
    } else if (type === 'public') {
      individualTreeData = this.getPublicTreeData(tempTreeData[type].rawData, value);
    } else if (type === 'alert') {
      individualTreeData = this.getAlertTreeData(tempTreeData[type].rawData, value);
    }

    tempTreeData[type].data = individualTreeData;

    this.setState({
      treeData: tempTreeData
    });
  }
  getPrivateTreeData = (treeData, treeName) => {
    const path = PRIVATE_API.path;
    let treeObj = { //Handle service tree data
      id: 'All',
      children: []
    };

    _.keys(treeData)
    .forEach(key => {
      let tempChild = [];
      let label = '';

      if (key && key !== 'doc_count') {
        if (treeData[key][path].buckets.length > 0) {
          _.forEach(treeData[key][path].buckets, val => {
            if (val.key) {
              label = <span title={val.key}>{val.key} ({val.doc_count}) <button className={cx('button', {'active': treeName === val.key})} onClick={this.selectTree.bind(this, val.key, 'sourceIP')}>{t('events.connections.txt-addFilter')}</button></span>;

              tempChild.push({
                id: val.key,
                label
              });
            }
          })
        }

        label = <span title={key}>{key} ({treeData[key].doc_count}) <button className={cx('button', {'active': treeName === key})} onClick={this.selectTree.bind(this, key, 'sourceIP')}>{t('events.connections.txt-addFilter')}</button></span>;

        let treeProperty = {
          id: key,
          label
        };

        if (tempChild.length > 0) {
          treeProperty.children = tempChild;
        }

        treeObj.children.push(treeProperty);
      }
    })

    treeObj.label = t('txt-all') + ' (' + treeData.doc_count + ')';

    return treeObj;
  }
  getPublicTreeData = (treeData, treeName) => {
    const path = PUBLIC_API.path;
    let treeObj = { //Handle service tree data
      id: 'All',
      children: []
    };

    _.keys(treeData)
    .forEach(key => {
      let tempChild = [];
      let label = '';

      if (key && key !== 'doc_count') {
        _.forEach(treeData[path].buckets, val => {
          if (val.key) {
            label = <span title={val.key}>{val.key} ({val.doc_count}) <button className={cx('button', {'active': treeName === val.key})} onClick={this.selectTree.bind(this, val.key, 'srcCountry')}>{t('events.connections.txt-addFilter')}</button></span>;

            treeObj.children.push({
              id: val.key,
              label
            });
          }
        })
      }
    })

    treeObj.label = t('txt-all') + ' (' + treeData.doc_count + ')';

    return treeObj;
  }
  getAlertTreeData = (treeData, treeName) => {
    let treeObj = { //Handle service tree data
      id: 'All',
      children: []
    };
    let formattedTreeData = [];

    if (treeData === null) { //Hanlde the case for no data
      treeObj.label = t('txt-all') + ' (0)';

      _.forEach(SEVERITY_TYPE, val => { //Create ordered tree list for High, Medium, Low
        treeObj.children.push({
          id: val,
          label: <span>{val} (0)</span>
        });
      })

      return treeObj;
    }

    _.forEach(SEVERITY_TYPE, val => { //Create ordered tree list for High, Medium, Low
      formattedTreeData.push({
        [val]: treeData[val]
      });
    })

    _.forEach(formattedTreeData, val => {
      _.keys(val)
      .forEach(key => {
        let tempChild = [];
        let label = '';
        let label2 = '';
        let totalHostCount = 0;

        if (key && key === 'High') {
          _.forEach(treeData[key], (val, key) => {
            if (key === 'doc_count') {
              totalHostCount += val;
            } else if (key !== 'event_histogram') {
              let tempChild2 = [];
              label = <span title={key}>{key} ({val.doc_count}) <button className={cx('button', {'active': treeName === key})} onClick={this.selectTree.bind(this, key, '')}>{t('events.connections.txt-addFilter')}</button></span>;

              tempChild.push({
                id: key,
                label
              });

              _.forEach(val, (val2, key2) => {
                if (key2 !== 'doc_count') {
                  label2 = <span title={key2}>{key2} ({val2.doc_count}) <button className={cx('button', {'active': treeName === key2})} onClick={this.selectTree.bind(this, key2, '')}>{t('events.connections.txt-addFilter')}</button></span>;

                  tempChild2.push({
                    id: key2,
                    label: label2
                  });
                }
              })

              if (!_.isEmpty(tempChild2)) {
                tempChild[tempChild.length - 1].children = tempChild2;
              }
            }
          })
        } else if (key && key !== 'default') {
          _.forEach(treeData[key], (val, key) => {
            if (key === 'doc_count') {
              totalHostCount += val;
            } else if (key === 'srcIp') {
              _.forEach(val.buckets, val => {
                if (val.key) {
                  label = <span title={val.key}>{val.key} ({val.doc_count}) <button className={cx('button', {'active': treeName === val.key})} onClick={this.selectTree.bind(this, val.key, key)}>{t('events.connections.txt-addFilter')}</button></span>;

                  if (val['destPort']) {
                    label2 = <span title={val['destPort'].buckets[0].key}>{val['destPort'].buckets[0].key} ({val['destPort'].buckets[0].doc_count}) <button className={cx('button', {'active': treeName === val['destPort'].buckets[0].key})} onClick={this.selectTree.bind(this, val['destPort'].buckets[0].key, 'destPort')}>{t('events.connections.txt-addFilter')}</button></span>;
                  }

                  if (label2) {
                    tempChild.push({
                      id: val.key,
                      label,
                      children: [{
                        id: val['destPort'].buckets[0].key,
                        label: label2
                      }]
                    });
                  } else {
                    tempChild.push({
                      id: val.key,
                      label
                    });
                  }
                }
              })
            }
          })
        }

        if (key && key !== 'default') {
          label = <span title={key}>{key} ({totalHostCount}) <button className={cx('button', {'active': treeName === key})} onClick={this.selectTree.bind(this, key, '')}>{t('events.connections.txt-addFilter')}</button></span>;

          let treeProperty = {
            id: key,
            label
          };

          if (tempChild.length > 0) {
            treeProperty.children = tempChild;
          }

          treeObj.children.push(treeProperty);
        }
      })
    })

    treeObj.label = t('txt-all') + ' (' + treeData.default.doc_count + ')';

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
        oldPage: 1
      }, () => {
        this.loadTreeData();
        this.loadTable(fromSearch);
      });
    }
  }
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
  handlePageChange = (currentPage) => {
    this.setState({
      currentPage
    }, () => {
      this.loadTable();
    });
  }
  handlePageDropdown = (pageSize) => {
    this.setState({
      currentPage: 1,
      pageSize: Number(pageSize)
    }, () => {
      this.loadTable();
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
      this.loadTable();
    });
  }
  selectTree = (value, field) => {
    this.setState({
      loadAlertData: false
    }, () => {
      this.addSearch(field, value, 'must');
    });
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
      filterData: currentFilterData
    });
  }
  handleRowDoubleClick = (index, allValue, evt) => {
    this.openDetailInfo(index, allValue);
    evt.stopPropagation();
    return null;
  }
  alertDialog = () => {
    const {baseUrl, contextRoot, language} = this.props;
    const {alertDetails, alertData} = this.state;
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeDialog}
    };

    return (
      <AlertDetails
        baseUrl={baseUrl}
        contextRoot={contextRoot}
        language={language}
        titleText={t('alert.txt-alertInfo')}
        actions={actions}
        alertDetails={alertDetails}
        alertData={alertData}
        showAlertData={this.showAlertData}
        fromPage='alert' />
    )
  }
  showAlertData = (type) => {
    const {alertDetails} = this.state;
    let tempAlertDetails = {...alertDetails};

    if (type === 'previous') {
      if (alertDetails.currentIndex !== 0) {
        tempAlertDetails.currentIndex--;
      }
    } else if (type === 'next') {
      if (alertDetails.currentLength - alertDetails.currentIndex > 1) {
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
  showTopoDetail = (id, eventInfo) => {
    const {alertDetails} = this.state;
    let tempAlertDetails = {...alertDetails};

    if (!id || id.indexOf('.') < 0) {
      return;
    }

    const uniqueIP = id;
    const data = alertDetails.publicFormatted.srcIp[uniqueIP] || alertDetails.publicFormatted.destIp[uniqueIP];
    tempAlertDetails.currentID = id;
    tempAlertDetails.currentIndex = 0;
    tempAlertDetails.currentLength = data.length;

    this.setState({
      alertDetails: tempAlertDetails
    }, () => {
      const {alertDetails} = this.state;
      this.openDetailInfo(alertDetails.currentIndex, data);
    });
  }
  openDetailInfo = (index, allValue, evt) => {
    const {alertDetails} = this.state;
    let tempAlertDetails = {...alertDetails};
    let data = '';
    let itemID = '';

    if (_.isArray(allValue)) { //For click from World Map
      data = allValue[index];
    } else {
      tempAlertDetails.currentIndex = Number(index);
      data = allValue;

      if (allValue.id) {
        itemID = allValue.id;
      }
    }

    this.setState({
      alertDetails: tempAlertDetails,
      currentTableID: itemID,
      alertData: data,
      alertDetailsOpen: true
    });
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
  handleDateChange = (datetime, refresh) => {
    this.setState({
      datetime
    }, () => {
      if (refresh === 'refresh') {
        this.loadTreeData();
        this.loadTable(fromSearch);
      }
    });
  }
  getTabChartData = () => {
    return {
      chartData: this.state.alertHistogram
    };
  }
  forwardSyslog = (allValue, type) => {
    const {baseUrl, contextRoot} = this.props;
    window.location.href = `${baseUrl}${contextRoot}/syslog?srcIp=${allValue.srcIp}`;
  }
  renderTabContent = () => {
    const {baseUrl, contextRoot, language, searchFields} = this.props;
    const {activeTab} = this.state;
    const mainContentData = {
      searchFields,
      activeTab,
      chartColors: ALERT_LEVEL_COLORS,
      tableUniqueID: 'id',
      currentTableID: this.state.currentTableID,
      queryData: this.state.queryData,
      filterData: this.state.filterData,
      account: this.state.account,
      showFilter: this.state.showFilter,
      showChart: this.state.showChart,
      toggleFilter: this.toggleFilter,
      toggleChart: this.toggleChart,
      openQuery: this.openQuery,
      setFilterData: this.setFilterData,
      handleResetBtn: this.handleResetBtn,
      handleSearchSubmit: this.handleSearchSubmit,
      treeData: this.state.treeData,
      showFilterBtn: this.showFilterBtn,
      dataTableData: this.state.subSectionsData.mainData[activeTab],
      dataTableFields: this.state.subSectionsData.fieldsData[activeTab],
      mainEventsData: this.state.mainEventsData,
      showTopoDetail: this.showTopoDetail,
      dataTableSort: this.state.sort,
      handleTableSort: this.handleTableSort,
      handleRowDoubleClick: this.handleRowDoubleClick,
      paginationTotalCount: this.state.subSectionsData.totalCount[activeTab],
      paginationPageSize: this.state.pageSize,
      paginationCurrentPage: this.state.currentPage,
      paginationPageChange: this.handlePageChange,
      paginationDropDownChange: this.handlePageDropdown
    };

    return (
      <Alert
        baseUrl={baseUrl}
        contextRoot={contextRoot}
        language={language}
        mainContentData={mainContentData}
        tabChartData={this.getTabChartData()} />
    )
  }
  getCSVfile = () => {
    const {baseUrl, contextRoot} = this.props;
    const url = `${baseUrl}${contextRoot}/api/u1/alert/_export`;
    const requestData = this.toQueryLanguage('search');

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  toggleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter
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
  setQueryData = (queryData) => {
    this.setState({
      queryData
    });
  }
  queryDialog = (type) => {
    const {baseUrl, contextRoot} = this.props;
    const {activeTab, account, filterData, queryData} = this.state;

    return (
      <QueryOpenSave
        baseUrl={baseUrl}
        contextRoot={contextRoot}
        activeTab={activeTab}
        type={type}
        account={account}
        filterData={filterData}
        queryData={queryData}
        setFilterData={this.setFilterData}
        setQueryData={this.setQueryData}
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
    let tempQueryData = {...this.state.queryData};
    tempQueryData.inputName = '';
    tempQueryData.openFlag = false;

    this.setState({
      queryData: tempQueryData
    });
  }
  clearData = () => {
    this.setState({
      ..._.cloneDeep(SUBSECTIONS_DATA)
    }, () => {
      this.loadAllFields();
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

        <div className='sub-header'>
          <SearchOptions
            position='180px'
            datetime={datetime}
            searchInput={searchInput}
            showFilter={showFilter}
            showInterval={true}
            setSearchData={this.setSearchData}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.handleSearchSubmit} />

          <div className='secondary-btn-group right'>
            <button className={cx({'active': showFilter})} onClick={this.toggleFilter} title={t('events.connections.txt-toggleFilter')}><i className='fg fg-filter'></i><span>({filterDataCount})</span></button>
            <button className={cx({'active': showChart})} onClick={this.toggleChart} title={t('events.connections.txt-toggleChart')}><i className='fg fg-chart-columns'></i></button>
            <button className='last' onClick={this.getCSVfile} title={t('events.connections.txt-exportCSV')}><i className='fg fg-data-download'></i></button>
          </div>
        </div>

        {this.renderTabContent()}
      </div>
    )
  }
}

AlertController.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  searchFields: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};

const HocAlertController = withRouter(withLocale(AlertController));
export { AlertController, HocAlertController };