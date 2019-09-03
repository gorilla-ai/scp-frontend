import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'
import queryString from 'query-string'

import WORLDMAP from '../../mock/world-map-low.json'

import {config as configLoader} from 'vbda-ui/build/src/loader'
import {analyze} from 'vbda-ui/build/src/analyzer'

import ContextMenu from 'react-ui/build/src/components/contextmenu'

import JSONTree from 'react-json-tree'

import {HocAlertDetails as AlertDetails} from '../common/alert-details'
import helper from '../common/helper'
import {HocQueryOpenSave as QueryOpenSave} from '../common/query-open-save'
import {HocSearchOptions as SearchOptions} from '../common/search-options'
import {HocTableCell as TableCell} from '../common/table-cell'
import withLocale from '../../hoc/locale-provider'

import Alert from './alert'

import {downloadWithForm} from 'react-ui/build/src/utils/download'
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
  name: 'Top10ExternalPotSrcCountry',
  path: 'agg'
};

//Charts ID must be unique
const CHARTS_ID = [
  {
    title: 'Top10ExternalPotSrcIp',
    key: 'srcIp'
  },
  {
    title: 'Top10ExternalPotSrcCountry',
    key: 'srcCountry'
  },
  {
    title: 'Top10ExternalPotDestPort',
    key: 'destPort'
  },
  {
    title: 'Top10ExternalPotProtocol',
    key: 'protocol'
  },
  {
    title: 'Top10InternalAlertIpSrc',
    key: 'srcIp'
  },
  {
    title: 'Top10ExternalAlertIpDst',
    key: 'destIp'
  }
];
const CHARTS_ID2 = [
  'topAttackLogin',
  'topAttackPassword'
]
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
    laData: {
      alert: []
    },
    mapData: {
      alert: []
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
  alertStatisticData: {},
  currentPage: 1,
  oldPage: 1,
  pageSize: 20,
  pageSizeMap: 500,
  sort: {
    field: '_eventDttm_',
    desc: true
  },
  //Left nav
  treeRawData: {},
  treeData: {},
  additionalTreeData: {},
  currentTreeName: '',
  activeSubTab: 'statistics',
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
    condition: 'Must',
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
  geoJson: {
    mapDataArr: [],
    attacksDataArr: []
  },
  showFilter: false,
  showChart: false,
  openQueryOpen: false,
  saveQueryOpen: false,
  tableMouseOver: false,
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
  alertRequest: {}
};

class AlertController extends Component {
  constructor(props) {
    super(props);

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    et = chewbaccaI18n.getFixedT(null, 'errors');

    this.state = {
      activeTab: 'alert',
      activeLocationTab: PRIVATE,
      //Tab Menu
      subTabMenu: {
        statistics: t('txt-statistics'),
        table: t('txt-table'),
        linkAnalysis: t('txt-linkAnalysis'),
        worldMap: t('txt-map')
      },
      LAconfig: {},
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
        this.getLAconfig();
        this.getSavedQuery();
        this.loadAlertTree();
        this.loadStatistics();
        this.loadAllFields();
      });
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
  loadAlertTree = (fromSearch) => {
    const {baseUrl} = this.props;
    const {currentPage, pageSize} = this.state;
    const url = `${baseUrl}/api/u1/alert/_search?page=${currentPage}&pageSize=${pageSize}`;
    const requestData = this.toQueryLanguage('tree');

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      if (data) {
        data = data.aggregations;

        this.setState({
          treeRawData: data,
          treeData: this.getTreeData(data),
          additionalTreeData: this.getAdditionalTreeData(data)
        });
      }
      return null;
    });
  }
  loadStatistics = () => {
    const {baseUrl} = this.props;
    const {datetime} = this.state;
    const timeAttribute = 'timestamp';
    const dateTime = {
      from: Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm') + ':00Z',
      to: Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm') + ':00Z'
    };
    let dataObj = {};
    let apiArr = [];

    _.forEach(CHARTS_ID, (val, i) => {
      dataObj.filters = [{
        condition: 'must',
        query: val.title
      }];
      dataObj[timeAttribute] = [dateTime.from, dateTime.to]

      apiArr.push({
        url: `${baseUrl}/api/u1/alert/_search?page=1&pageSize=1`,
        data: JSON.stringify(dataObj),
        type: 'POST',
        contentType: 'text/plain'
      });
    })

    dataObj = {
      maxTopSize: 10,
      startDttm: dateTime.from,
      endDttm: dateTime.to
    };

    _.forEach(CHARTS_ID2, val => {
      apiArr.push({
        url: `${baseUrl}/api/honeynet/dashboard/${val}`,
        data: JSON.stringify(dataObj),
        type: 'POST',
        contentType: 'text/plain'
      });
    })

    this.ah.all(apiArr)
    .then(data => {
      let statisticData = {};
      let tempArr1 = [];
      let tempArr2 = [];

      _.forEach(CHARTS_ID, (val, i) => {
        if (data[i].aggregations) {
          const dataBuckets = data[i].aggregations[val.title].agg.buckets;
          let tempArr = [];

          if (dataBuckets.length > 0) {
            _.forEach(dataBuckets, val2 => {
              if (val2.key) { //Remove empty data
                tempArr.push({
                  doc_count: val2.doc_count,
                  key: val2.key
                });
              }
            })
            statisticData[val.title] = tempArr;
          }
        }
      })

      _.forEach(data[6].rows, val => { //Remove empty data
        if (val.account) {
          tempArr1.push({
            account: val.account,
            totalCnt: val.totalCnt
          });
        }
      })

      _.forEach(data[7].rows, val => { //Remove empty data
        if (val.password) {
          tempArr2.push({
            password: val.password,
            totalCnt: val.totalCnt
          });
        }
      })

      statisticData[CHARTS_ID2[0]] = tempArr1;
      statisticData[CHARTS_ID2[1]] = tempArr2;

      this.setState({
        alertStatisticData: statisticData
      });

      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  loadAllFields = () => {
    let tempSubSectionsData = {...this.state.subSectionsData};
    tempSubSectionsData.tableColumns = _.cloneDeep(this.props.searchFields);

    this.setState({
      subSectionsData: tempSubSectionsData
    }, () => {
      this.loadActiveSubTab();
    });
  }
  loadActiveSubTab = (options) => {
    const {activeSubTab} = this.state;

    if (activeSubTab === 'statistics') {
      this.loadStatistics();
    } else if (activeSubTab === 'table') {
      this.loadTable(options);
    } else if (activeSubTab === 'linkAnalysis') {
      this.resetLinkAnalysis(options);
    } else if (activeSubTab === 'worldMap') {
      this.loadWorldMap(options);
    }
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
        helper.showPopupMsg('', t('txt-error'), t('network.connections.txt-maxDataMsg'));

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
        tempSubSectionsData.laData[activeTab] = [];
        tempSubSectionsData.mapData[activeTab] = [];

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
    const url = `${baseUrl}/api/u1/alert/_search?page=${setPage}&pageSize=${pageSizeMap}`;
    const requestData = this.toQueryLanguage(options);
    let tempSubSectionsData = {...subSectionsData};
    let mainEventsData = {};

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      let laData = [];

      if (data.data.rows.length > 0) {
        laData = data.data;

        _.forEach(laData.rows, val => {
          mainEventsData[val._id] = val._source;
        })

        tempSubSectionsData.laData[activeTab] = analyze(mainEventsData, LAconfig, {analyzeGis: false});
        tempSubSectionsData.totalCount[activeTab] = laData.counts;
      } else {
        helper.showPopupMsg(t('txt-notFound', ''));
        return;
      }

      this.setState({
        mainEventsData,
        subSectionsData: tempSubSectionsData
      });
    });
  }
  loadWorldMap = (options) => {
    const {baseUrl, contextRoot} = this.props;
    const {activeTab, subSectionsData, currentPage, pageSizeMap, alertDetails} = this.state;
    const setPage = options === 'search' ? 1 : currentPage;
    const url = `${baseUrl}/api/u1/alert/_search?page=${setPage}&pageSize=${pageSizeMap}`;
    const requestData = this.toQueryLanguage(options);
    let tempSubSectionsData = {...subSectionsData};
    let tempAlertDetails = {...alertDetails};

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      const tempArray = _.map(data.data.rows, val => {
        val._source.id = val._id;
        val._source.index = val._index;
        return val._source;
      });

      tempSubSectionsData.mapData[activeTab] = tempArray;
      tempSubSectionsData.totalCount[activeTab] = data.data.counts;

      let publicData = {
        srcIp: {},
        destIp: {}
      };

      _.forEach(tempArray, val => {
        if (!publicData.srcIp[val.srcIp]) {
          publicData.srcIp[val.srcIp] = [];
        }

        if (!publicData.destIp[val.destIp]) {
          publicData.destIp[val.destIp] = [];
        }

        publicData.srcIp[val.srcIp].push(val);
        publicData.destIp[val.destIp].push(val);        
      })

      tempAlertDetails.publicFormatted.srcIp = publicData.srcIp;
      tempAlertDetails.publicFormatted.destIp = publicData.destIp;

      this.setState({
        subSectionsData: tempSubSectionsData,
        alertDetails: tempAlertDetails
      }, () => {
        this.getWorldMap();
      });
    });
  }
  getWorldMap = () => {
    const {activeTab, geoJson, subSectionsData, alertDetails} = this.state;
    let tempGeoJson = {...geoJson};
    let attacksDataArr = [];

    _.forEach(WORLDMAP.features, val => {
      const countryObj = {
        type: 'geojson',
        id: val.properties.name,
        weight: 0.6,
        fillColor: 'white',
        color: '#182f48',
        fillOpacity: 1
      };

      countryObj.geojson = val.geometry;
      tempGeoJson.mapDataArr.push(countryObj);
    });

    _.forEach(subSectionsData.mapData[activeTab], val => {
      const timestamp = helper.getFormattedDate(val.timestamp, 'local');

      if (val.srcLatitude && val.srcLongitude) {
        const count = alertDetails.publicFormatted.srcIp[val.srcIp].length;

        attacksDataArr.push({
          type: 'spot',
          id: val.srcIp,
          latlng: [
            val.srcLatitude,
            val.srcLongitude
          ],
          data: {
            tag: 'red'
          },
          tooltip: () => {
            return `
              <div class='map-tooltip'>
                <div><span class='key'>${t('payloadsFields.attacksCount')}:</span> <span class='count'>${count}</span></div>
                <div><span class='key'>${t('payloadsFields.srcCountry')}:</span> <span class='value'>${val.srcCountry}</span></div>
                <div><span class='key'>${t('payloadsFields.srcCity')}:</span> <span class='value'>${val.srcCity}</span></div>
                <div><span class='key'>${t('payloadsFields.srcIp')}:</span> <span class='value'>${val.srcIp}</span></div>
                <div><span class='key'>${t('payloadsFields.timestamp')}:</span> <span class='value'>${timestamp}</span></div>
              </div>
              `
          }
        });
      }

      if (val.destLatitude && val.destLongitude) {
        const count = alertDetails.publicFormatted.destIp[val.destIp].length;

        attacksDataArr.push({
          type: 'spot',
          id: val.destIp,
          latlng: [
            val.destLatitude,
            val.destLongitude
          ],
          data: {
            tag: 'yellow'
          },
          tooltip: () => {
            return `
              <div class='map-tooltip'>
                <div><span class='key'>${t('payloadsFields.destCountry')}:</span> <span class='value'>${val.destCountry}</span></div>
                <div><span class='key'>${t('payloadsFields.destCity')}:</span> <span class='value'>${val.destCity}</span></div>
                <div><span class='key'>${t('payloadsFields.destIp')}:</span> <span class='value'>${val.destIp}</span></div>
                <div><span class='key'>${t('payloadsFields.timestamp')}:</span> <span class='value'>${timestamp}</span></div>
              </div>
              `
          }
        });
      }
    });

    tempGeoJson.attacksDataArr = attacksDataArr;

    this.setState({
      activeSubTab: 'worldMap',
      geoJson: tempGeoJson
    });
  }
  toQueryLanguage = (options) => {
    const {datetime, activeLocationTab, filterData, alertRequest} = this.state;
    const timeAttribute = 'timestamp';
    const treeQuery = activeLocationTab === PRIVATE ? PRIVATE_API.name : PUBLIC_API.name;
    const dataQuery = activeLocationTab === PRIVATE ? PRIVATE_API.name : PUBLIC_API.name;
    const defaultCondition = {
      condition: 'must',
      query: dataQuery
    };
    let dateFrom = datetime.from;
    let dateTo = datetime.to;
    let dateTime = {};
    let dataObj = {};

    dateTime = {
      from: Moment(dateFrom).utc().format('YYYY-MM-DDTHH:mm') + ':00Z',
      to: Moment(dateTo).utc().format('YYYY-MM-DDTHH:mm') + ':00Z'
    };
    dataObj[timeAttribute] = [dateTime.from, dateTime.to];

    if (!options || options === 'tree') {
      dataObj['filters'] = [{
        condition: 'must',
        query: treeQuery
      }];
    } else if (options === 'search') {
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
    } else if (options === 'subTab') {
      if (!_.isEmpty(alertRequest)) {
        return alertRequest;
      } else {
        dataObj['filters'] = [defaultCondition];
      }
    }

    const dataOptions = {
      ...dataObj
    };

    if (options !== 'tree') {
      this.setState({
        alertRequest: dataOptions
      });
    }

    return dataOptions;
  }
  showFilterBtn = (value) => {
    this.setState({
      currentTreeName: value,
      treeData: this.getTreeData(this.state.treeRawData, value),
      additionalTreeData: this.getAdditionalTreeData(this.state.treeRawData, value)
    });
  }
  getAdditionalTreeData = (treeData, treeName) => {
    const {activeSubTab, currentTreeName, activeLocationTab} = this.state;
    const activeTreeName = treeName ? treeName : currentTreeName;
    let formattedTreeData = [];
    let treeObj = { //Handle service tree data
      id: 'All',
      children: []
    };
    let path = '';

    if (activeLocationTab === PRIVATE) {
      treeData = treeData[PRIVATE_API.name];
      path = PRIVATE_API.path;
    } else if (activeLocationTab === PUBLIC) {
      treeData = treeData[PUBLIC_API.name];
      path = PUBLIC_API.path;
    }

    _.keys(treeData)
    .forEach(key => {
      let tempChild = [];
      let label = '';

      if (key && key !== 'doc_count') {
        if (activeLocationTab === PRIVATE) {
          if (treeData[key][path].buckets.length > 0) {
            _.forEach(treeData[key][path].buckets, val => {
              if (val.key) {
                label = <span title={val.key}>{val.key} ({val.doc_count}) <button className={cx('button', {'active': currentTreeName === val.key && activeSubTab !== 'statistics'})} onClick={this.selectTree.bind(this, val.key, '')}>{t('network.connections.txt-addFilter')}</button></span>;

                tempChild.push({
                  id: val.key,
                  label
                });
              }
            })
          }

          label = <span title={key}>{key} ({treeData[key].doc_count}) <button className={cx('button', {'active': currentTreeName === key && activeSubTab !== 'statistics'})} onClick={this.selectTree.bind(this, key, '')}>{t('network.connections.txt-addFilter')}</button></span>;

          let treeProperty = {
            id: key,
            label
          };

          if (tempChild.length > 0) {
            treeProperty.children = tempChild;
          }

          treeObj.children.push(treeProperty);
        } else if (activeLocationTab === PUBLIC) {
          _.forEach(treeData[path].buckets, val => {
            if (val.key) {
              label = <span title={val.key}>{val.key} ({val.doc_count}) <button className={cx('button', {'active': currentTreeName === val.key && activeSubTab !== 'statistics'})} onClick={this.selectTree.bind(this, val.key, '')}>{t('network.connections.txt-addFilter')}</button></span>;

              treeObj.children.push({
                id: val.key,
                label
              });
            }
          })
        }
      }
    })

    treeObj.label = t('txt-all') + ' (' + treeData.doc_count + ')';

    return treeObj;
  }
  getTreeData = (treeData, treeName) => {
    const {activeSubTab, currentTreeName} = this.state;
    const activeTreeName = treeName ? treeName : currentTreeName;
    let formattedTreeData = [];
    let treeObj = { //Handle service tree data
      id: 'All',
      children: []
    };

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
              label = <span title={key}>{key} ({val.doc_count}) <button className={cx('button', {'active': (activeTreeName === key && activeSubTab !== 'statistics')})} onClick={this.selectTree.bind(this, key, '')}>{t('network.connections.txt-addFilter')}</button></span>;

              tempChild.push({
                id: key,
                label
              });

              _.forEach(val, (val2, key2) => {
                if (key2 !== 'doc_count') {
                  label2 = <span title={key2}>{key2} ({val2.doc_count}) <button className={cx('button', {'active': (activeTreeName === key2 && activeSubTab !== 'statistics')})} onClick={this.selectTree.bind(this, key2, '')}>{t('network.connections.txt-addFilter')}</button></span>;

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
                  label = <span title={val.key}>{val.key} ({val.doc_count}) <button className={cx('button', {'active': (activeTreeName === val.key && activeSubTab !== 'statistics')})} onClick={this.selectTree.bind(this, val.key, key)}>{t('network.connections.txt-addFilter')}</button></span>;

                  if (val['destPort']) {
                    label2 = <span title={val['destPort'].buckets[0].key}>{val['destPort'].buckets[0].key} ({val['destPort'].buckets[0].doc_count}) <button className={cx('button', {'active': (activeTreeName === val['destPort'].buckets[0].key && activeSubTab !== 'statistics')})} onClick={this.selectTree.bind(this, val['destPort'].buckets[0].key, 'destPort')}>{t('network.connections.txt-addFilter')}</button></span>;
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
          label = <span title={key}>{key} ({totalHostCount}) <button className={cx('button', {'active': (activeTreeName === key && activeSubTab !== 'statistics')})} onClick={this.selectTree.bind(this, key, '')}>{t('network.connections.txt-addFilter')}</button></span>;

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
        oldPage: 1,
        tableMouseOver: false
      }, () => {
        this.loadAlertTree(fromSearch);
        this.loadActiveSubTab(fromSearch);
      });
    }
  }
  handleResetBtn = (type) => {
    const filterData = [{
      condition: 'Must',
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
  handleLargePageChange = (type, currentPage) => {
    this.setState({
      currentPage
    }, () => {
      if (type === 'la') {
        this.resetLinkAnalysis('subTab');
      } else if (type === 'map') {
        this.loadWorldMap('subTab');
      }
    });
  }
  handleLargePageDropdown = (type, pageSize) => {
    this.setState({
      currentPage: 1,
      pageSizeMap: Number(pageSize)
    }, () => {
      if (type === 'la') {
        this.resetLinkAnalysis('subTab');
      } else if (type === 'map') {
        this.loadWorldMap('subTab');
      }
    });
  }
  handlePageChange = (currentPage) => {
    this.setState({
      currentPage
    }, () => {
      this.loadTable('subTab');
    });
  }
  handlePageDropdown = (pageSize) => {
    this.setState({
      currentPage: 1,
      pageSize: Number(pageSize)
    }, () => {
      this.loadTable('subTab');
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
      this.loadTable('subTab');
    });
  }
  selectTree = (value, field) => {
    this.setState({
      loadAlertData: false
    }, () => {
      this.addSearch(field, value, 'Must');
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
      let data = '';

      if (alertDetails.currentID) {
        data = alertDetails.publicFormatted.srcIp[alertDetails.currentID] || alertDetails.publicFormatted.destIp[alertDetails.currentID];
      }

      this.openDetailInfo(data);
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
      this.openDetailInfo(data);
    });
  }
  openDetailInfo = (index, allValue, evt) => {
    const {alertDetails} = this.state;
    let tempAlertDetails = {...alertDetails};
    let data = '';
    let itemID = '';

    if (index) {
      if (_.isArray(index)) {
        data = index[alertDetails.currentIndex];
      } else {
        tempAlertDetails.currentIndex = Number(index);
        data = allValue;

        if (allValue.id) {
          itemID = allValue.id;
        }
      }
    } else {
      data = alertDetails.all[alertDetails.currentIndex];
      itemID = alertDetails.all[alertDetails.currentIndex].id;
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
        this.loadAlertTree();
        this.loadActiveSubTab(fromSearch);
      }
    });
  }
  getTabChartData = () => {
    return {
      chartData: this.state.alertHistogram
    };
  }
  handleSubTabChange = (newTab) => {
    if (newTab === 'statistics') {
      this.setState({
        activeSubTab: newTab,
        showFilter: false,
        showChart: false,
        tableMouseOver: false
      }, () => {
        this.loadStatistics();
      });
    }
    if (newTab === 'table') {
      this.setState({
        activeSubTab: newTab,
        currentPage: 1,
        pageSize: 20,
        tableMouseOver: false
      }, () => {
        this.loadTable('subTab');
      });
    } else if (newTab === 'linkAnalysis') {
      this.setState({
        activeSubTab: newTab,
        currentPage: 1,
        pageSizeMap: 500,
        tableMouseOver: false
      }, () => {
        this.resetLinkAnalysis('subTab');
      });
    } else if (newTab === 'worldMap') {
      this.loadWorldMap('subTab');

      this.setState({
        currentPage: 1,
        pageSizeMap: 500,
        tableMouseOver: false
      });
    }
  }
  forwardSyslog = (allValue, type) => {
    const {baseUrl, contextRoot} = this.props;
    window.location.href = `${baseUrl}${contextRoot}/syslog?srcIp=${allValue.srcIp}`;
  }
  renderTabContent = () => {
    const {baseUrl, contextRoot, language, searchFields} = this.props;
    const {activeTab, tableMouseOver} = this.state;
    const mainContentData = {
      searchFields,
      activeTab,
      tableMouseOver,
      chartColors: ALERT_LEVEL_COLORS,
      subTabMenu: this.state.subTabMenu,
      activeSubTab: this.state.activeSubTab,
      handleSubTabChange: this.handleSubTabChange,
      alertStatisticData: this.state.alertStatisticData,
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
      additionalTreeData: this.state.additionalTreeData,
      activeAlertTab: this.state.activeLocationTab,
      showFilterBtn: this.showFilterBtn,
      dataTableData: this.state.subSectionsData.mainData[activeTab],
      dataTableFields: this.state.subSectionsData.fieldsData[activeTab],
      LAdata: this.state.subSectionsData.laData[activeTab],
      mapData: this.state.subSectionsData.mapData[activeTab],
      LAconfig: this.state.LAconfig,
      mainEventsData: this.state.mainEventsData,
      geoJson: this.state.geoJson,
      showTopoDetail: this.showTopoDetail,
      dataTableSort: this.state.sort,
      handleTableSort: this.handleTableSort,
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
      <Alert
        baseUrl={baseUrl}
        contextRoot={contextRoot}
        language={language}
        chartsID={CHARTS_ID}
        mainContentData={mainContentData}
        tabChartData={this.getTabChartData()}
        tableMouseOver={tableMouseOver} />
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
  toggleActiveLocation = (type) => {
    this.setState({
      ..._.cloneDeep(ALERT_MAIN_DATA),
      activeLocationTab: type,
    }, () => {
      this.clearData();
      this.getSavedQuery();
      this.loadAlertTree();
      this.loadStatistics();
    });
  }
  render() {
    const {
      activeTab,
      datetime,
      activeLocationTab,
      activeSubTab,
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
          <div className='c-button-group left'>
            <button className={cx('thumb', {'selected': activeLocationTab === PRIVATE})} onClick={this.toggleActiveLocation.bind(this, PRIVATE)}>{t('alert.txt-privateAlert')}</button>
            <button className={cx('thumb', {'selected': activeLocationTab === PUBLIC})} onClick={this.toggleActiveLocation.bind(this, PUBLIC)}>{t('alert.txt-publicAlert')}</button>
          </div>

          <SearchOptions
            page='alert'
            datetime={datetime}
            searchInput={searchInput}
            showFilter={showFilter}
            setSearchData={this.setSearchData}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.handleSearchSubmit} />

          <div className='secondary-btn-group right'>
            <button onClick={this.toggleFilter} className={cx({'active': showFilter})} title={t('network.connections.txt-toggleFilter')} disabled={activeSubTab === 'statistics'}><i className='fg fg-filter'></i><span>({filterDataCount})</span></button>
            <button onClick={this.toggleChart} className={cx({'active': showChart})} title={t('network.connections.txt-toggleChart')} disabled={activeSubTab === 'statistics'}><i className='fg fg-chart-columns'></i></button>
            <button onClick={this.getCSVfile} className='last' title={t('network.connections.txt-exportCSV')}><i className='fg fg-data-download'></i></button>
          </div>
        </div>

        <div className='flow-analysis'>
          {this.renderTabContent()}
        </div>
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