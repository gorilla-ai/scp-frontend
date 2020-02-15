import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import moment from 'moment-timezone'
import _ from 'lodash'
import cx from 'classnames'
import queryString from 'query-string'

import {downloadWithForm} from 'react-ui/build/src/utils/download'

import {HocAlertDetails as AlertDetails} from '../common/alert-details'
import {BaseDataContext} from '../common/context';
import ContextMenu from 'react-ui/build/src/components/contextmenu'
import helper from '../common/helper'
import {HocQueryOpenSave as QueryOpenSave} from '../common/query-open-save'
import {HocSearchOptions as SearchOptions} from '../common/search-options'
import {HocTableCell as TableCell} from '../common/table-cell'
import Threats from './threats'
import withLocale from '../../hoc/locale-provider'
import WORLDMAP from '../../mock/world-map-low.json'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

const PRIVATE = 'private';
const PUBLIC = 'public';
const PRIVATE_API = {
  name: 'InternalMaskedIp',
  path: 'srcIp'
};
const PUBLIC_API = {
  name: 'Top10ExternalSrcCountry',
  path: 'srcCountry'
};
const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
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

/**
 * Threats
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to handle the business logic for the threats page
 */
class ThreatsController extends Component {
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
        alert: {
          title: '',
          rawData: {},
          data: {},
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
        }
      },
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
        this.loadAllFields();
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
          query = 'srcCountry: ' + data;
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
      this.setState({
        datetime: {
          from: alertsParam.from,
          to: alertsParam.to
        },
        filterData: [{
          condition: 'must',
          query: 'sourceIP:' + alertsParam.sourceIP
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
    const url = `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0`;
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
  /**
   * Copy search fields into table columns
   * @method
   */
  loadAllFields = () => {
    const {activeTab} = this.state;
    let tempSubSectionsData = {...this.state.subSectionsData};
    tempSubSectionsData.tableColumns[activeTab] = ['_eventDttm_', '_severity_', 'srcIp', 'destIp', 'Info', 'Collector'];

    this.setState({
      subSectionsData: tempSubSectionsData
    }, () => {
      this.loadTable();
    });
  }
  /**
   * Show query option when click on the table raw filter icon
   * @method
   * @param {string} field - field name of selected field
   * @param {string | number} value - value of selected field
   * @param {string} activeTab - currect active tab
   * @param {object} e - mouseClick events
   */
  showQueryOptions = (field, value, activeTab) => (e) => {
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

    const menuItems = [
      {
        id: value + '_Must',
        text: 'Must',
        action: () => this.addSearch('', value, 'must')
      },
      {
        id: value + '_MustNot',
        text: 'Must Not',
        action: () => this.addSearch('', value, 'must_not')
      },
      {
        id: value + '_Either',
        text: 'Either',
        action: () => this.addSearch('', value, 'either')
      }
    ];

    ContextMenu.open(e, menuItems, 'eventsQueryMenu');
    e.stopPropagation();
  }
  /**
   * Get and set alert data
   * @method
   * @param {string} [options] - option for 'search'
   */
  loadTable = (options) => {
    const {baseUrl} = this.context;
    const {activeTab, currentPage, oldPage, pageSize, subSectionsData, account, alertDetails} = this.state;
    const setPage = options === 'search' ? 1 : currentPage;
    const url = `${baseUrl}/api/u2/alert/_search?page=${setPage}&pageSize=${pageSize}`;
    const requestData = this.toQueryLanguage(options);

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      if (data) {
        if (currentPage > 1 && data.data.rows.length === 0) {
          helper.showPopupMsg('', t('txt-error'), t('events.connections.txt-maxDataMsg'));

          this.setState({
            currentPage: oldPage
          });
          return;
        }

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
          return;
        }

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
            sortable: tempData === '_eventDttm_' ? true : false,
            formatter: (value, allValue) => {
              if (tempData === 'Info') {
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
                    showQueryOptions={this.showQueryOptions} />
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
      return null;
    });
  }
  /**
   * Construct the alert api request body
   * @method
   * @param {string} options - option for 'tree' or 'csv'
   * @returns requst data object
   */
  toQueryLanguage = (options) => {
    const {datetime, sort, filterData} = this.state;
    const dateTime = {
      from: Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    let dataObj = {
      timestamp: [dateTime.from, dateTime.to]
    };

    if (options === 'tree') {
      dataObj.search = [PRIVATE_API.name, PUBLIC_API.name];
    } else {
      const filterDataArr = helper.buildFilterDataArray(filterData);

      if (filterDataArr.length > 0) {
        dataObj.filters = filterDataArr;
      }

      dataObj.sort = [{
        '_eventDttm_': sort.desc ? 'desc' : 'asc'
      }];
    }

    if (options == 'csv') {
      const timezone = moment.tz(moment.tz.guess()); //Get local timezone obj
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
   */
  showTreeFilterBtn = (type, value) => {
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
        let label = '';
        let label2 = '';
        let totalHostCount = 0;

        if (key && key !== 'default') {
          _.forEach(treeData[key], (val, key) => {
            if (key === 'doc_count') {
              totalHostCount += val;
            } else {
              label = <span title={key}>{key} ({val.doc_count}) <button className={cx('button', {'active': treeName === key})} onClick={this.selectTree.bind(this, key, '')}>{t('events.connections.txt-addFilter')}</button></span>;

              if (_.size(val) === 1) {
                tempChild.push({
                  id: key,
                  label
                });
              } else {
                let tempChild2 = [];

                _.forEach(val, (val2, key2) => {
                  if (key2 !== 'doc_count') {
                    label2 = <span title={key2}>{key2} ({val2.doc_count}) <button className={cx('button', {'active': treeName === key2})} onClick={this.selectTree.bind(this, key2, '')}>{t('events.connections.txt-addFilter')}</button></span>;

                    tempChild2.push({
                      id: key2,
                      label: label2
                    });
                  }
                })

                tempChild.push({
                  id: key,
                  label,
                  children: tempChild2
                });
              }
            }
          })

          label = <span title={key}><i className={'fg fg-recode ' + key} /> {key} ({totalHostCount}) <button className={cx('button', {'active': treeName === key})} onClick={this.selectTree.bind(this, key, '')}>{t('events.connections.txt-addFilter')}</button></span>;

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
      let label = '';
      let treeProperty = {};

      if (key && key !== 'doc_count') {
        if (treeData[key][path].buckets.length > 0) {
          _.forEach(treeData[key][path].buckets, val => {
            if (val.key) {
              label = <span title={val.key}><i className={'fg fg-recode ' + val._severity_} />{val.key} ({val.doc_count}) <button className={cx('button', {'active': treeName === val.key})} onClick={this.selectTree.bind(this, val.key, 'sourceIP')}>{t('events.connections.txt-addFilter')}</button></span>;

              tempChild.push({
                id: val.key,
                label
              });
            }
          })
        }

        label = <span title={key}><i className={'fg fg-recode ' + treeData[key]._severity_} style={this.showSeverity(treeData[key]._severity_)}/> {key} ({treeData[key].doc_count}) <button className={cx('button', {'active': treeName === key})} onClick={this.selectTree.bind(this, key, 'sourceIP')}>{t('events.connections.txt-addFilter')}</button></span>;

        treeProperty = {
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
  /**
   * Handle alert search submit
   * @method
   * @param {string} [fromSearch] - option for 'search'
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
        oldPage: 1
      }, () => {
        this.loadTreeData();
        this.loadTable(fromSearch);
      });
    }
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
   */
  handlePaginationChange = (currentPage) => {
    this.setState({
      currentPage
    }, () => {
      this.loadTable();
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
      this.loadTable();
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
      this.loadTable();
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
      filterData: currentFilterData
    });
  }
  /**
   * Add tree node to search filter
   * @method
   * @param {string} index - index of the alert data
   * @param {object} allValue - alert data
   * @param {object} evt - MouseEvents
   */
  handleRowDoubleClick = (index, allValue, evt) => {
    this.openDetailInfo(index, allValue);

    evt.stopPropagation();
    return null;
  }
  /**
   * Display alert details modal dialog 
   * @method
   * @returns AlertDetails component
   */
  alertDialog = () => {
    const {alertDetails, alertData} = this.state;
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeDialog}
    };

    return (
      <AlertDetails
        titleText={t('alert.txt-alertInfo')}
        actions={actions}
        alertDetails={alertDetails}
        alertData={alertData}
        showAlertData={this.showAlertData}
        fromPage='threats' />
    )
  }
  /**
   * Set the alert index and get the alert data
   * @method
   * @param {string} type - button action type ('previous' or 'next')
   */
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
  /**
   * Set the individual alert data
   * @method
   * @param {string} type - button action type ('previous' or 'next')
   */
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
   * Set new datetime
   * @method
   * @param {object} datetime - new datetime object
   * @param {string} [refresh] - option for 'refresh'
   */
  handleDateChange = (datetime, refresh) => {
    this.setState({
      datetime
    }, () => {
      if (refresh === 'refresh') {
        this.loadTreeData();
        this.loadTable('search');
      }
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
   * Handle CSV download
   * @method
   */
  getCSVfile = () => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/u2/alert/_export`;
    const requestData = this.toQueryLanguage('csv');

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
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
   * Display query menu modal dialog
   * @method
   * @param {string} type - query type ('open' or 'save')
   * @returns QueryOpenSave component
   */
  queryDialog = (type) => {
    const {activeTab, account, filterData, queryData} = this.state;

    return (
      <QueryOpenSave
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
    let tempQueryData = {...this.state.queryData};
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

ThreatsController.contextType = BaseDataContext;

ThreatsController.propTypes = {
};

const HocThreatsController = withRouter(withLocale(ThreatsController));
export { ThreatsController, HocThreatsController };