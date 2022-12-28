import React, { Component } from 'react'
import { withRouter } from 'react-router'
import queryString from 'query-string'
import _ from 'lodash'
import cx from 'classnames'
import moment from 'moment'
import momentTimezone from 'moment-timezone'

import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import AllInboxOutlinedIcon from '@material-ui/icons/AllInboxOutlined'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline'
import WorkIcon from '@material-ui/icons/Work'
import WorkOffIcon from '@material-ui/icons/WorkOff'

import {downloadWithForm} from 'react-ui/build/src/utils/download'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import AlertDetails from '../common/alert-details'
import {BaseDataContext} from '../common/context'
import constants from '../constant/constant-incidnet'
import ExportCSV from '../common/export-csv'
import helper from '../common/helper'
import IncidentEventMake from '../soc/common/incident-event-make'
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
    id: 'alertEdgeSeverityList',
    key: 'agentName'
  },
  {
    id: 'alertNetTrapBlackList',
    key: 'client'
  }
];

const INCIDENT_STATUS_ALL = 0;
const INCIDENT_STATUS_UNREVIEWED = 1;
const INCIDENT_STATUS_REVIEWED = 2;
const INCIDENT_STATUS_CLOSED = 3;
const INCIDENT_STATUS_SUBMITTED = 4;
const INCIDENT_STATUS_DELETED = 5;
const INCIDENT_STATUS_ANALYZED = 6;
const INCIDENT_STATUS_EXECUTOR_UNREVIEWED = 7;
const INCIDENT_STATUS_EXECUTOR_CLOSE = 8;

let t = null;
let f = null;
let et = null;
let it = null;

/**
 * Threats
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
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
      edgeData: [],
      //Tab IncidentDevice
      subTabMenu: {
        table: t('alert.txt-alertList'),
        trackTreats: t('alert.txt-trackAlertList'),
        statistics: t('alert.txt-statistics')
      },
      activeSubTab: 'table', //'table', 'statistics' or 'trackTreats'
      //Search bar
      searchInput: {
        searchType: 'manual', //'manual' or 'auto'
        searchInterval: '1h',
        refreshTime: '60000' //1 min.
      },
      alertHistogram: {},
      filterData: [{
        condition: 'must',
        query: ''
      }],
      edgeFilterData: [],
      edgeCheckedList: [],
      popOverAnchor: null,
      taskServiceList: {
        data: null,
        scrollCount: 0,
        pageSize: 10,
        hasMore: true
      },
      threatsData: {
        dataFieldsArr: ['_eventDttm_', '_severity_', 'srcIp', 'srcPort', 'destIp', 'destPort', 'Source', 'Info', 'Collector', 'severity_type_name'],
        dataFields: [],
        dataContent: null,
        sort: {
          field: '_eventDttm_',
          desc: true
        },
        totalCount: 0,
        currentPage: 1,
        oldPage: 1,
        pageSize: 20
      },
      trackData: {
        dataFieldsArr: ['select', '_eventDttm_', '_severity_', 'srcIp', 'srcPort', 'destIp', 'destPort', 'Source', 'Info', 'Collector', 'severity_type_name'],
        dataFields: [],
        dataContent: null,
        sort: {
          field: '_eventDttm_',
          desc: true
        },
        trackObj: {},
        totalCount: 0,
        currentPage: 0,
        oldPage: 1,
        pageSize: 10000
      },
      //..._.cloneDeep(SUBSECTIONS_DATA),
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
      tableType: 'list', //'list' or 'select'
      threatsList: [],
      originalThreatsList: [],
      cancelThreatsList: [],
      incidentAnchor: null,
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
      queryModalType: '',
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
      socFlowSourceList: [],
      incident: {
        info: {
          status: 1,
          socType: 1,
          attach: null
        }
      },
      socFlowList: [],
      loadAlertData: true,
      alertPieData: {},
      alertTableData: {},
      alertChartsList: [],
      enableEstablishDttm: '',
      accountType: constants.soc.LIMIT_ACCOUNT
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, session, sessionRights} = this.context;
    const alertsParam = queryString.parse(location.search);
    let tempAccount = {...this.state.account};

    helper.getPrivilegesInfo(sessionRights, 'common', locale);
    helper.inactivityTime(baseUrl, locale);

    if (session.accountId) {
      tempAccount.id = session.accountId;
      tempAccount.login = true;

      this.setState({
        account: tempAccount
      }, () => {
        this.getSavedQuery();
        this.getPublicSavedQuery();
        this.loadTreeData();
        this.setChartIntervalBtn();
        this.setStatisticsTab();
        this.loadTrackData();
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
        query = 'srcIp ' + data.charAt(0).toUpperCase() + data.slice(1); //Make first letter uppercase

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
          query = 'srcIp ' + data;
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
      let filterData = [];
      let query = 'srcIp: "' + alertsParam.sourceIP + '"';

      if (page === 'host') {
        filterData.push({
          condition: 'must',
          query: alertsParam.sourceIP
        });

        if (alertsParam.severityName) {
          filterData.push({
            condition: 'must',
            query: alertsParam.severityName
          });
        }
      }

      this.setState({
        datetime: {
          from: alertsParam.from,
          to: alertsParam.to
        },
        filterData,
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

    if (_.includes(session.roles, constants.soc.SOC_Analyzer) || _.includes(session.roles, constants.soc.SOC_Executor)) {
      this.setState({
        accountType: constants.soc.NONE_LIMIT_ACCOUNT
      });
    } else {
      this.setState({
        accountType: constants.soc.LIMIT_ACCOUNT
      });
    }
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  checkAccountSocPrivType = () => {
    const {baseUrl, session} = this.context;
    const requestData = {
      account:session.accountId
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/unit/limit/_check`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        if (data.rt.isDefault) {
          this.setState({
            accountType: constants.soc.NONE_LIMIT_ACCOUNT
          });
        } else {
          if (data.rt.isLimitType === constants.soc.LIMIT_ACCOUNT) {
            this.setState({
              accountType: constants.soc.LIMIT_ACCOUNT
            });
          } else if (data.rt.isLimitType === constants.soc.NONE_LIMIT_ACCOUNT) {
            this.setState({
              accountType: constants.soc.LIMIT_ACCOUNT
            });
          } else {
            this.setState({
              accountType: constants.soc.LIMIT_ACCOUNT
            })
          }
        }
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
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
   * Get and set the public saved query
   * @method
   */
  getPublicSavedQuery = () => {
    const {baseUrl} = this.context;
    const {queryDataPublic} = this.state;

    helper.getPublicSavedQuery(baseUrl, queryDataPublic, 'alert')
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

        const edgeList = data[EDGES_API.name].agg.buckets;
        let edgeData = [];

        if (edgeList.length > 0) {
          edgeData = _.map(edgeList, val => {
            return {
              agentName: val.agentName,
              agentId: val.agentId
            };
          });
        }

        this.setState({
          treeData: tempTreeData,
          edgeData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
      url: `${baseUrl}/api/taskService/list?source=SCP&type=exportThreat&createStartDttm=${datetime.from}&from=${fromItem}&size=${taskServiceList.pageSize}`,
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
    const {datetime, filterData, edgeFilterData, threatsData} = this.state;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    const url = `${baseUrl}/api/taskService`;
    const filterDataArr = helper.buildFilterDataArray(filterData); //Remove empty filter array
    const combinedFilterDataArr = _.concat(filterDataArr, edgeFilterData);
    let requestData = {
      timestamp: [dateTime.from, dateTime.to],
      type: ['exportThreat']
    };

    if (combinedFilterDataArr.length > 0) {
      requestData.filters = combinedFilterDataArr;
    }

    let tempColumns = [];

    _.forEach(threatsData.dataFieldsArr, val => {
      tempColumns.push({
        [val]: f(`alertFields.${val}`)
      });
    })

    requestData.columns = tempColumns;

    const timezone = momentTimezone.tz(momentTimezone.tz.guess()); //Get local timezone obj
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
   * Set alert track data
   * @method
   */
  loadTrackData = () => {
    const {baseUrl} = this.context;
    const {activeTab, account, trackData} = this.state;
    const url = `${baseUrl}/api/track/alert/_search?accountId=${account.id}`;

    this.ah.one({
      url,
      type: 'GET',
    }, {showProgress: false})
    .then(data => {
      if (data) {
        const tableData = _.map(JSON.parse(data.alertTrackSource), val => {
          return {
            ...val,
            select: false
          };
        });

        let tempTrackData = {...trackData};
        tempTrackData.trackObj = data;
        tempTrackData.dataContent = tableData;
        tempTrackData.dataFields = _.map(trackData.dataFieldsArr, val => {
          return {
            name: val === 'select' ? '' : val,
            label: f(`alertFields.${val}`),
            options: {
              sort: val !== 'select',
              customBodyRenderLite: (dataIndex, options) => {
                const allValue = tableData[dataIndex];
                let value = tableData[dataIndex][val];

                if (options === 'getAllValue') {
                  return allValue;
                }

                if (val === 'select') {
                  return (
                    <Checkbox
                      id={allValue.id}
                      className='checkbox-ui'
                      name='select'
                      checked={allValue.select}
                      onChange={this.handleCancelSelectDataChangeMui.bind(this, allValue)}
                      color='primary' />
                  )
                }

                if (val === 'Info' || val === 'Source') {
                  return <span onDoubleClick={this.handleRowDoubleClick.bind(this, dataIndex, allValue)}>{value}</span>
                } else {
                  if (val === '_eventDttm_') {
                    value = helper.getFormattedDate(value, 'local');
                  }
                  return (
                    <TableCell
                      activeTab={activeTab}
                      fieldValue={value}
                      fieldName={val}
                      allValue={allValue}
                      alertLevelColors={ALERT_LEVEL_COLORS}
                      handleOpenQueryMenu={this.handleOpenQueryMenu}
                      handleRowDoubleClick={this.handleRowDoubleClick.bind(this, dataIndex, allValue)} />
                  )
                }
              }
            }
          };
        });

        this.setState({
          originalThreatsList: tableData,
          trackData: tempTrackData
        });
      }
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
   * Handle track list table checkbox
   * @method
   * @param {object} allValue - data for the checked item
   * @param {object} event - event object
   */
  handleCancelSelectDataChangeMui = (allValue, event) => {
    const {trackData, cancelThreatsList} = this.state;
    let tempTrackData = {...trackData};
    let tempCancelThreatsList = _.cloneDeep(cancelThreatsList);    

    _.forEach(trackData.dataContent, (val, i) => {
      if (allValue.id === val.id) {
        if (event.target.checked) {
          tempCancelThreatsList.push(allValue)
        } else {
          const index = cancelThreatsList.indexOf(allValue);

          if (index > -1) {
            tempCancelThreatsList.splice(index, 1);
          }
        }
        tempTrackData.dataContent[i].select = event.target.checked;
      }
    })

    this.setState({
      trackData: tempTrackData,
      cancelThreatsList: tempCancelThreatsList
    });
  }
  /**
   * Handle checkbox all selections
   * @method
   * @param {string} type - checkbox type ('checked' or 'unchecked')
   */
  handleTrackListCheckboxAll = (type) => {
    const {trackData} = this.state;
    let tempTrackData = {...trackData};
    let tempCancelThreatsList = [];

    _.forEach(trackData.dataContent, (val, i) => {
      if (type === 'checked') {
        tempCancelThreatsList.push(val);
      }

      tempTrackData.dataContent[i].select = type === 'checked';
    })

    this.setState({
      trackData: tempTrackData,
      cancelThreatsList: tempCancelThreatsList
    });
  }
  handleCancelSelectMapping = (rowSelectIndexList) => {
    const {trackData, cancelThreatsList} = this.state;
    let tempList  = [];

    _.forEach(rowSelectIndexList, rowIndex => {
      tempList.push(trackData.dataContent[rowIndex]);
    })

    this.setState({
      cancelThreatsList: tempList
    });
  }
  /**
   * Handle threats list table checkbox
   * @method
   * @param {object} allValue - data for the checked item
   * @param {object} event - event object
   */
  handleSelectDataChangeMui = (allValue, event) => {
    const {threatsData, threatsList} = this.state;
    let tempThreatsData = {...threatsData};
    let tempThreatsList = _.cloneDeep(threatsList);

    _.forEach(threatsData.dataContent, (val, i) => {
      if (allValue.id === val.id) {
        if (event.target.checked) {
          tempThreatsList.push(allValue);
        } else {
          const index = threatsList.indexOf(allValue);

          if (index > -1) {
            tempThreatsList.splice(index, 1);
          }
        }
        tempThreatsData.dataContent[i].select = event.target.checked;
      }
    })

    this.setState({
      threatsData: tempThreatsData,
      threatsList: tempThreatsList
    });
  }
  /**
   * Handle checkbox all selections
   * @method
   * @param {string} type - checkbox type ('checked' or 'unchecked')
   */
  handleThreatsListCheckboxAll = (type) => {
    const {threatsData} = this.state;
    let tempThreatsData = {...threatsData};
    let tempThreatsList = [];

    _.forEach(threatsData.dataContent, (val, i) => {
      if (type === 'checked') {
        tempThreatsList.push(val);
      }

      tempThreatsData.dataContent[i].select = type === 'checked';
    })

    this.setState({
      threatsData: tempThreatsData,
      threatsList: tempThreatsList
    });
  }
  overrideAlertTrack = (trackList, options) => {
    const {baseUrl} = this.context;
    const {account, trackData} = this.state;
    const url = `${baseUrl}/api/track/alert/_override?accountId=${account.id}`;
    let requestData = {
      account_id: account.id,
      id: trackData.trackObj.id
    };
    let newTrackList = [];

    _.forEach(trackList, val => {
      let list = {
        ...val
      };
      delete list.select;

      newTrackList.push(list);
    })

    requestData.alertTrackSourceArray = newTrackList;

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        if (!options || options !== 'delete') {
          helper.showPopupMsg('', t('txt-success'), t('alert.txt-alertTrackOverrideSuccess'));
        }

        this.loadTrackData();

        this.setState({
          cancelThreatsList: []
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  showAddTrackDialog = () => {
    PopupDialog.prompt({
      title: t('txt-help'),
      id: 'modalWindowSmall',
      confirmText: t('txt-ok'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content'>
          <span>{it('txt-trackedIncidents-msg')}?</span>
        </div>
      ),
      act: (confirmed) => {
        if (confirmed) {
          const {threatsList, originalThreatsList} = this.state;
          const uniqThreatsList = _.uniqBy(_.concat(threatsList, originalThreatsList), 'id'); //Remove duplicated list

          this.overrideAlertTrack(uniqThreatsList);
          this.handleThreatsListCheckboxAll('unchecked');
        }
      }
    });
  }
  showDeleteTrackDialog = () => {
    PopupDialog.prompt({
      title: t('txt-help'),
      id: 'modalWindowSmall',
      confirmText: t('txt-ok'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content'>
          <span>{it('txt-trackedDeleteIncidents-msg')}?</span>
        </div>
      ),
      act: (confirmed) => {
        if (confirmed) {
          const {trackData, cancelThreatsList} = this.state;
          const trackList = _.filter(trackData.dataContent, val => {
            return !_.some(cancelThreatsList, val2 => val.id === val2.id);
          });

          this.overrideAlertTrack(trackList, 'delete');
          this.handleTrackListCheckboxAll('unchecked');
        }
      }
    });
  }
  /**
   * Toggle table type
   * @method
   * @param {string} tableType - table type ('list' or 'select')
   */
  toggleTableType = (tableType) => {
    this.setState({
      showFilter: false,
      tableType
    }, () => {
      this.handleSearchSubmit();
    });
  };
  setupIncidentDialog = (makeType) => {
    const {baseUrl} = this.context;
    const {originalThreatsList, cancelThreatsList} = this.state;
    const timezone = momentTimezone.tz(momentTimezone.tz.guess()); //Get local timezone obj
    const utc_offset = timezone._offset / 60; //Convert minute to hour
    const requestData = {
      threats: makeType === 'select' ? cancelThreatsList : originalThreatsList,
      timeZone: utc_offset
    };

    this.ah.one({
      url: `${baseUrl}/api/soc/convertThreats/incident`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data) {
        let selectRows = [];

        if (makeType === 'select') {
          selectRows = cancelThreatsList;
        } else if (makeType === 'all') {
          selectRows = originalThreatsList;
        }       

        let incident = {
          info: {
            severity: selectRows[0]._severity_,
            title: data.title,
            reporter: data.reporter,
            rawData: selectRows,
            selectRowsType: makeType,
            threatGenerateFileNecessaryInfo: data.threatGenerateFileNecessaryInfo
          }
        };

        incident.info.eventList = _.map(data.eventList, val => {
          return {
            ...val,
            time: {
              from: helper.getFormattedDate(val.startDttm, 'local'),
              to: helper.getFormattedDate(val.endDttm, 'local')
            }
          };
        });

        this.setState({
          incident
        }, () => {
          this.getFlowSearch();
        });        
      }
    }).catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getFlowSearch = () => {
    const {baseUrl} = this.context;
    const {originalThreatsList, cancelThreatsList, incident} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/soc/flow/_search`,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data) {
        let tempIncident = {...incident};

        if (!tempIncident.info.socType) {
          tempIncident.info.socType = 1;
        }

        _.forEach(data.rows, val => {
          if (val.severity === tempIncident.info.severity) {
            tempIncident.info.flowTemplateId = val.id

            if (val.severity === 'Emergency') {
              tempIncident.info['impactAssessment'] = 4;
              tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
            } else if (val.severity === 'Alert') {
              tempIncident.info['impactAssessment'] = 3;
              tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
            } else if (val.severity === 'Notice') {
              tempIncident.info['impactAssessment'] = 1;
              tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
            } else if (val.severity === 'Warning') {
              tempIncident.info['impactAssessment'] = 2;
              tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
            } else if (val.severity === 'Critical') {
              tempIncident.info['impactAssessment'] = 3;
              tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
            }
          }
        })

        const socFlowList = _.map(data.rows, val => {
          return <MenuItem key={val.id} value={val.id}>{`${val.name}`}</MenuItem>
        });

        this.setState({
          makeIncidentOpen: true,
          socFlowSourceList: data.rows,
          incident: tempIncident,
          socFlowList
        });
      }
    }).catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.handleCloseIncidentMenu();
  }
  closeAddIncidentDialog = () => {
    this.setState({
      makeIncidentOpen: false,
      incident: {
        info: {
          status: 1,
          socType: 1,
          attach: null
        }
      }
    });
  }
  checkRequired = (incident) => {
    if (!incident.category || incident.category === 0 || incident.category === 9) {
      PopupDialog.alert({
        title: t('txt-tips'),
        display: it('txt-validCategory'),
        confirmText: t('txt-close')
      });
      return false;
    }

    if (!incident.title || !incident.incidentDescription || !incident.reporter || !incident.attackName || !incident.impactAssessment || !incident.socType) {
      PopupDialog.alert({
        title: t('txt-tips'),
        display: it('txt-validBasic'),
        confirmText: t('txt-close')
      });
      return false;
    }

    // always check event list
    if (!incident.eventList) {
      PopupDialog.alert({
        title: t('txt-tips'),
        display: it('txt-validEvents'),
        confirmText: t('txt-close')
      });
      return false;
    } else {
      let eventCheck = true;

      _.forEach(incident.eventList, event => {
        _.forEach(event.eventConnectionList, eventConnect => {
          if (!helper.ValidateIP_Address(eventConnect.srcIp)) {
            PopupDialog.alert({
              title: t('txt-tips'),
              display: t('network-topology.txt-ipValidationFail'),
              confirmText: t('txt-close')
            });
            eventCheck = false;
            return;
          }

          if (!helper.ValidateIP_Address(eventConnect.dstIp)) {
            PopupDialog.alert({
              title: t('txt-tips'),
              display: t('network-topology.txt-ipValidationFail'),
              confirmText: t('txt-close')
            });
            eventCheck = false;
            return;
          }

          if (eventConnect.dstPort) {
            if (!helper.ValidatePort(eventConnect.dstPort)) {
              PopupDialog.alert({
                title: t('txt-tips'),
                display: t('network-topology.txt-portValidationFail'),
                confirmText: t('txt-close')
              });
              eventCheck = false;
              return;
            }
          }

          if (eventConnect.srcPort) {
            if (!helper.ValidatePort(eventConnect.srcPort)) {
              PopupDialog.alert({
                title: t('txt-tips'),
                display: t('network-topology.txt-portValidationFail'),
                confirmText: t('txt-close')
              });
              eventCheck = false;
            }
          }
        })
      })

      if (!eventCheck) {
        return false;
      }

      const empty = _.filter(incident.eventList, function(o) {
        return !o.description || !o.deviceId || !o.eventConnectionList || !o.frequency;
      });

      if (_.size(empty) > 0) {
        PopupDialog.alert({
          title: t('txt-tips'),
          display: it('txt-validEvents'),
          confirmText: t('txt-close')
        });
        return false;
      }
    }
    return true;
  }
  /**
   * Toggle establish date checkbox
   * @method
   * @param {object} event - event object
   */
  toggleEstablishDateCheckbox = (event) => {
    this.setState({
      enableEstablishDttm: event.target.checked
    });
  }
  /**
   * Display add seat modal dialog
   * @method
   * @returns ModalDialog component
   */
  handleMakeIncidentDialog = () => {
    const {incident, socFlowList, enableEstablishDttm} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeAddIncidentDialog},
      confirm: {text: t('txt-confirm'), handler: this.handleMakeIncidentSubmit}
    };
    const titleText = it('txt-addIncident-events');

    return (
      <ModalDialog
        id='addSeatDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        <IncidentEventMake
          incident={incident}
          socFlowList={socFlowList}
          enableEstablishDttm={enableEstablishDttm}
          handleDataChange={this.handleDataChange}
          handleDataChangeMui = {this.handleDataChangeMui}
          handleEventsChange={this.handleEventsChange}
          handleConnectContactChange={this.handleConnectContactChange}
          handleAttachChange={this.handleAttachChange}
          handleAFChange={this.handleAFChange}
          toggleEstablishDateCheckbox={this.toggleEstablishDateCheckbox} />
      </ModalDialog>
    )
  }
  handleMakeIncidentSubmit = () => {
    const {session, baseUrl} = this.context;
    const {enableEstablishDttm} = this.state;
    let incident = {...this.state.incident};

    if (!this.checkRequired(incident.info)) {
      return;
    }

    if (incident.info.eventList) {
      incident.info.eventList = _.map(incident.info.eventList, val => {
        return {
          ...val,
          startDttm: moment(val.time.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
          endDttm: moment(val.time.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
        };
      });
    }

    if (incident.info.accidentCatogory) {
      if (incident.info.accidentCatogory === 5) {
        incident.info.accidentAbnormal = null;
      } else {
        incident.info.accidentAbnormalOther = null;
      }
    }

    if (incident.info.expireDttm) {
      incident.info.expireDttm = moment(incident.info.expireDttm).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    }

    if (enableEstablishDttm) {
      incident.info.establishDttm = moment(incident.info.establishDttm).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    } else {
      incident.info.establishDttm = '';
    }

    if (!incident.info.creator) {
      incident.info.creator = session.accountId;
    }

    // add for save who edit
    incident.info.editor = session.accountId;

    incident.info.status = INCIDENT_STATUS_UNREVIEWED;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc`,
      data: JSON.stringify(incident.info),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data.status) {
        if (incident.info.attach) {
          this.uploadAttachment(data.rt.id);
        } else {
          this.closeAddIncidentDialog();
        }

        PopupDialog.prompt({
          title: t('alert.txt-deleteSelectTrackList'),
          id: 'modalWindowSmall',
          confirmText: t('txt-delete'),
          cancelText: t('txt-cancel'),
          display: (
            <div className='content'>
              <span>{it('txt-addIncident-events') + '-' + t('txt-success') + ' ID:'+ data.rt.id + ' ' + t('alert.txt-deleteSelectTrackListMsg')}?</span>
            </div>
          ),
          act: (confirmed) => {
            if (confirmed) {
              const {trackData, cancelThreatsList} = this.state;
              const selectType = incident.info.selectRowsType;

              if (selectType === 'select') {
                this.overrideAlertTrack(_.xorBy(trackData.dataContent, cancelThreatsList));
              } else {
                let tempTrackData = {...trackData};
                tempTrackData.dataContent = [];

                this.overrideAlertTrack([]);

                this.setState({
                  trackData: tempTrackData
                });
              }
            }
          }
        });
      } else {
        helper.showPopupMsg('', t('txt-fail'), it('txt-addIncident-events') + '-' + t('txt-fail') + ' ID:' + data.rt.id);
      }
      return null;
    }).catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  uploadAttachment = (incidentId) => {
    const {baseUrl} = this.context;
    const {incident} = this.state;

    if (incident.info.attach) {
      let formData = new FormData();
      formData.append('id', incidentId);

      _.forEach(incident.info.attach, val => {
        formData.append('file', val);
      })

      formData.append('fileMemo', incident.info.fileMemo || '');

      helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

      ah.one({
        url: `${baseUrl}/api/soc/attachment/_upload`,
        data: formData,
        type: 'POST',
        processData: false,
        contentType: false
      })
      .then(data => {
        this.setState({
          cancelThreatsList: []
        },() => {
          this.closeAddIncidentDialog();
          this.loadTrackData();
        });
      }).catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
  }
  handleDataChange = (type, value) => {
    let tempIncident = {...this.state.incident};
    tempIncident.info[type] = value;

    if (type === 'impactAssessment') {
      tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * value), 'hours');
    }

    this.setState({
      incident: tempIncident
    });
  }
  handleDataChangeMui = (event) => {
    const {socFlowSourceList, incident} = this.state;
    const name = event.target.name;
    const value = event.target.value;
    let tempIncident = {...incident};
    tempIncident.info[name] = value;

    if (name === 'category' && (value === 0 || value === 9)) {
      return;
    }

    if (name === 'severity') {
      if (value === 'Emergency') {
        tempIncident.info['impactAssessment'] = 4;
        tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
      } else if (value === 'Alert') {
        tempIncident.info['impactAssessment'] = 3;
        tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
      } else if (value === 'Notice') {
        tempIncident.info['impactAssessment'] = 1;
        tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
      } else if (value === 'Warning') {
        tempIncident.info['impactAssessment'] = 2;
        tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
      } else if (value === 'Critical') {
        tempIncident.info['impactAssessment'] = 3;
        tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
      }
    }

    if (name === 'flowTemplateId') {
      _.forEach(socFlowSourceList , flowVal => {
        if (flowVal.id === value) {
          if (flowVal.severity === 'Emergency') {
            tempIncident.info['severity'] = 'Emergency';
            tempIncident.info['impactAssessment'] = 4;
            tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
          } else if (flowVal.severity === 'Alert') {
            tempIncident.info['severity'] = 'Alert';
            tempIncident.info['impactAssessment'] = 3;
            tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
          } else if (flowVal.severity === 'Notice') {
            tempIncident.info['severity'] = 'Notice';
            tempIncident.info['impactAssessment'] = 1;
            tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
          } else if (flowVal.severity === 'Warning') {
            tempIncident.info['severity'] = 'Warning';
            tempIncident.info['impactAssessment'] = 2;
            tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
          } else if (flowVal.severity === 'Critical') {
            tempIncident.info['severity'] = 'Critical';
            tempIncident.info['impactAssessment'] = 3;
            tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
          }
        }
      })
    }

    if (name === 'impactAssessment') {
      tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * value), 'hours');
    }

    this.setState({
      incident: tempIncident
    });
  }
  handleEventsChange = (val) => {
    let tempIncident = {...this.state.incident};
    tempIncident.info.eventList = val;

    this.setState({
      incident: tempIncident
    });
  }
  handleConnectContactChange = (val) => {
    let tempIncident = {...this.state.incident};
    tempIncident.info.notifyList = val;

    this.setState({
      incident: tempIncident
    });
  }
  handleAttachChange = (files) => {
    let tempIncident = {...this.state.incident};
    tempIncident.info.attach = files === 'clear' ? null : files;

    this.setState({
      incident: tempIncident
    });
  }
  handleAFChange = (file) => {
    const flag = new RegExp("[\`~!@#$^&*()=|{}':;',\\[\\]<>+《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
    let tempIncident = {...this.state.incident};

    if (flag.test(file.name)) {
      helper.showPopupMsg(it('txt-attachedFileNameError'), t('txt-error'));
      tempIncident.info.attach = null;

      this.setState({
        incident: tempIncident
      });
    } else {
      tempIncident.info.attach = file;

      this.setState({
        incident: tempIncident
      });
    }
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
      this.loadThreatsData();
      this.loadThreatsData('statistics');
      this.loadThreatsData(NET_TRAP_QUERY.name);
    });
  }
  /**
   * Show query menu when click on the table row filter icon
   * @method
   * @param {string} field - field name of selected field
   * @param {string | number} value - value of selected field
   * @param {object} event - event object
   */
  handleOpenQueryMenu = (field, value, event) => {
    const keyField = ['srcIp', 'srcPort', 'destIp', 'destPort', 'Source'];

    if (_.includes(keyField, field)) {
      value = field + ': ' +  value;
    }

    if (field === 'Collector') {
      value = field + ': ' +  '"' + value + '"';
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
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null,
      menuType: ''
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
        label: tempData === 'key' ? f('threatsField.' + key) : tempData,
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
   * @param {string} [options] - option for 'search', 'statistics' or 'alertDetails'
   * @param {string} [fromPage] - option for 'currentPage'
   * @param {string} type - button action type ('previous' or 'next')
   */
  loadThreatsData = (options, fromPage, type) => {
    const {baseUrl} = this.context;
    const {
      activeTab,
      chartIntervalValue,
      threatsData,
      tableType,
      threatsList,
      alertDetails,
      alertPieData,
      alertTableData
    } = this.state;
    const page = (fromPage === 'currentPage' || tableType === 'select') ? threatsData.currentPage : 0;
    const requestData = this.toQueryLanguage(options);
    let url = `${baseUrl}/api/u2/alert/_search?histogramInterval=${chartIntervalValue}&page=${page + 1}&pageSize=`;

    if (!options || options === 'alertDetails' || tableType === 'select') {
      url += threatsData.pageSize;
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
        if (!options || options === 'alertDetails') {
          let tempThreatsData = {...threatsData};

          if (threatsData.currentPage > 1 && data.data.counts === 0) { //Exceed 10,000 data count
            helper.showPopupMsg('', t('txt-error'), t('txt-maxDataMsg'));

            tempThreatsData.currentPage = threatsData.oldPage;

            this.setState({
              threatsData: tempThreatsData
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

          if (tableData.counts === 0) { //No data found
            tempThreatsData.dataContent = []; 
            tempThreatsData.totalCount = 0;

            this.setState({
              threatsData: tempThreatsData,
              alertHistogram: {}
            });
            return null;
          }

          tableData = tableData.rows;
          tempArray = _.map(tableData, val => { //Re-construct the Alert data
            val._source.id = val._id;
            val._source.index = val._index;
            val._source.select = false;

            // let selectCheck = false;

            // _.forEach(threatsList, data => {
            //   if (val.id === data.id) {
            //     selectCheck = true;
            //   }
            // })

            // val._source.select = selectCheck;
            return val._source;
          });

          let tempAlertDetails = {...alertDetails};
          tempAlertDetails.currentIndex = 0;
          tempAlertDetails.currentLength = tableData.length < threatsData.pageSize ? tableData.length : threatsData.pageSize;
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
              this.openDetailInfo('', '', type);
            }
          });

          tempThreatsData.dataContent = tempArray;
          tempThreatsData.totalCount = data.data.counts;
          tempThreatsData.currentPage = page;
          let dataFieldsArr = [];

          if (tableType === 'select') {
            dataFieldsArr =  ['select', '_eventDttm_', '_severity_', 'srcIp', 'srcPort', 'destIp', 'destPort', 'Source', 'Info', 'Collector', 'severity_type_name'];
          } else {
            dataFieldsArr =  [ '_eventDttm_', '_severity_', 'srcIp', 'srcPort', 'destIp', 'destPort', 'Source', 'Info', 'Collector', 'severity_type_name'];
          }

          tempThreatsData.dataFields = _.map(dataFieldsArr, val => {
            return {
              name: val === 'select' ? '' : val,
              label: f(`alertFields.${val}`),
              options: {
                sort: val === '_eventDttm_',
                customBodyRenderLite: (dataIndex, options) => {
                  const allValue = tempThreatsData.dataContent[dataIndex];
                  let value = tempThreatsData.dataContent[dataIndex][val];

                  if (options === 'getAllValue') {
                    return allValue;
                  }

                  if (val === 'select') {
                    return (
                      <Checkbox
                        id={allValue.id}
                        className='checkbox-ui'
                        name='select'
                        checked={allValue.select}
                        onChange={this.handleSelectDataChangeMui.bind(this, allValue)}
                        color='primary' />
                    )
                  }

                  if (val === 'Info') {
                    return <span onDoubleClick={this.handleRowDoubleClick.bind(this, dataIndex, allValue)}>{value}</span>
                  } else {
                    if (val === '_eventDttm_') {
                      value = helper.getFormattedDate(value, 'local');
                    }
                    return (
                      <TableCell
                        activeTab={activeTab}
                        fieldValue={value}
                        fieldName={val}
                        allValue={allValue}
                        alertLevelColors={ALERT_LEVEL_COLORS}
                        handleOpenQueryMenu={this.handleOpenQueryMenu}
                        handleRowDoubleClick={this.handleRowDoubleClick.bind(this, dataIndex, allValue)} />
                    )
                  }
                }
              }
            };
          });

          this.setState({
            threatsData: tempThreatsData
          });
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

          //For alert edge severity list table
          tempAlertTableData.alertEdgeSeverityList.chartData = _.map(data.aggregations.Edges.agg.buckets, val => {
            return {
              key: val.agentName,
              ...val.severityAgg
            }
          });

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
              label: f('threatsField.' + tempData),
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
    const {alertChartsList, alertTableData} = this.state;
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
    const {datetime, edgeData, threatsData, filterData, edgeFilterData} = this.state;
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
      let formattedFilterData = [];

      _.forEach(filterData, val => {
        let formattedQuery = val.query;

        if (val.query.includes('Source')) {
          formattedQuery = val.query.replace('Source: ', '');
          formattedQuery = formattedQuery.substring(0, formattedQuery.lastIndexOf('('));

          _.forEach(edgeData, val => {
            if (val.agentName === formattedQuery) {
              formattedQuery = '_edgeId: "' + val.agentId + '"'
            }
          })
        }

        formattedFilterData.push({
          condition: val.condition,
          query: formattedQuery
        });
      })

      const filterDataArr = helper.buildFilterDataArray(formattedFilterData); //Remove empty filter array
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
          '_eventDttm_': threatsData.sort.desc ? 'desc' : 'asc'
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
   * @returns HTML DOM
   */
  getTreeLabel = (name, currentTreeName, count, query) => {
    const serviceCount = count !== '' ? ' (' + helper.numberWithCommas(count) + ')' : '';

    return <span>{name}{serviceCount} <Button id='addFilterBtn' variant='outlined' color='primary' className={cx('button', {'active': currentTreeName === name})} onClick={this.selectTree.bind(this, name, query)}>{t('events.connections.txt-addFilter')}</Button></span>;
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
                      label: <span>{key3} {serviceCount} <Button id='addFilterBtn' variant='outlined' color='primary' className={cx('button', {'active': treeName === key3})} onClick={this.selectTree.bind(this, key3, '')}>{t('events.connections.txt-addFilter')}</Button><i className={cx('fg fg-info', {'active': treeName === key3})} title={t('txt-info')} onClick={this.showSeverityInfo.bind(this, val2)}></i></span>
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
            label: <span id={'alert' + helper.capitalizeFirstLetter(key)}><i className={'fg fg-recode ' + key.toLowerCase()} />{key} ({helper.numberWithCommas(totalHostCount)}) <Button id='addFilterBtn' variant='outlined' color='primary' className={cx('button', {'active': treeName === key})} onClick={this.selectTree.bind(this, key, '')}>{t('events.connections.txt-addFilter')}</Button></span>
          };

          if (tempChild.length > 0) {
            treeProperty.children = tempChild;
          }

          treeObj.children.push(treeProperty);
        }
      })
    })

    treeObj.label = <span id='alertTreeAll'>{t('txt-all') + ' (' + helper.numberWithCommas(treeData.default.doc_count) + ')'}</span>

    return treeObj;
  }
  /**
   * Show severity level for private tree data
   * @method
   * @param {string} severity - severity info
   * @returns display property object
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
                label: <span><i className={nodeClass} />{val.key} ({helper.numberWithCommas(val.doc_count)}) <Button id='addFilterBtn' variant='outlined' color='primary' className={cx('button', {'active': treeName === val.key})} onClick={this.selectTree.bind(this, val.key, 'srcIp')}>{t('events.connections.txt-addFilter')}</Button></span>
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
          label: <span><i className={nodeClass} style={this.showSeverity(treeData[key]._severity_)} />{key} ({helper.numberWithCommas(treeData[key].doc_count)}) <Button id='addFilterBtn' variant='outlined' color='primary' className={cx('button', {'active': treeName === key})} onClick={this.selectTree.bind(this, key, 'srcIp')}>{t('events.connections.txt-addFilter')}</Button></span>
        };

        if (tempChild.length > 0) {
          treeProperty.children = tempChild;
        }

        treeObj.children.push(treeProperty);
      }
    })

    treeObj.label = <span id='privateTreeAll'>{t('txt-all') + ' (' + helper.numberWithCommas(treeData.doc_count) + ')'}</span>

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

    treeObj.label = <span id='publicTreeAll'>{t('txt-all') + ' (' + helper.numberWithCommas(treeData.doc_count) + ')'}</span>

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
    let edgeCheckedList = _.cloneDeep(this.state.edgeCheckedList);

    if (event.target.checked) {
      edgeFilterData.push({
        condition: 'either',
        query: '_edgeId: "' + agentId + '"'
      });
      edgeCheckedList.push(agentId);
    } else {
      const index = edgeCheckedList.indexOf(agentId);
      edgeFilterData.splice(index, 1);
      edgeCheckedList.splice(index, 1);
    }

    this.setState({
      edgeFilterData,
      edgeCheckedList
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
              label: <div><Checkbox defaultChecked={_.includes(this.state.edgeCheckedList, val.agentId)} onChange={this.toggleCheckbox.bind(this, val.agentId)} color='primary' /><span>{val.agentName} ({val.serviceType}) ({helper.numberWithCommas(val.doc_count)}) </span></div>
            });
          }
        })
      }
    })

    treeObj.label = <span id='edgesTreeAll'>{t('txt-all') + ' (' + helper.numberWithCommas(treeData.doc_count) + ')'}</span>

    return treeObj;
  }
  /**
   * Handle alert search submit
   * @method
   */
  handleSearchSubmit = () => {
    const {threatsData, tableType, alertChartsList, trackData} = this.state;
    let tempAlertChartsList = alertChartsList;
    let tempTrackData = {...trackData};
    let tempThreatsData = {...threatsData};

    tempTrackData.dataFields = [];
    tempTrackData.dataContent = null;

    tempThreatsData.dataFields = [];
    tempThreatsData.dataContent = null;
    tempThreatsData.totalCount = 0;

    if (tableType === 'list') {
      tempThreatsData.currentPage = 1;
      tempThreatsData.oldPage = 1;
      tempThreatsData.pageSize = 20;
    }

    _.forEach(tempAlertChartsList, (val, i) => {
      tempAlertChartsList[i].chartData = null;
    })

    this.setState({
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
      trackData: tempTrackData,
      threatsData: tempThreatsData,
      alertChartsList: tempAlertChartsList,
      alertPieData: {},
      alertTableData: {}
    }, () => {
      this.loadTreeData();
      this.setChartIntervalBtn();
      this.setStatisticsTab();
      this.loadTrackData();
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
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   * @param {string} [options] - options for 'alertDetails'
   * @param {string} [btnType] - button action type ('previous' or 'next')
   */
  handlePaginationChange = (type, value, options, btnType) => {
    let tempThreatsData = {...this.state.threatsData};
    tempThreatsData[type] = Number(value);

    this.setState({
      threatsData: tempThreatsData
    }, () => {
      this.loadThreatsData(options, type, btnType);
    });
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempThreatsData = {...this.state.threatsData};
    tempThreatsData.sort.field = field;
    tempThreatsData.sort.desc = sort;

    this.setState({
      threatsData: tempThreatsData
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
   * Open details dialog when double click the table row
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
    const {datetime, activeSubTab, alertDetails, alertData, threatsData} = this.state;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    let actions = {
      confirm: {text: t('txt-close'), handler: this.closeDialog}
    };

    if (sessionRights.Module_Soc && activeSubTab !== 'trackTreats') {
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
        currentPage={threatsData.currentPage + 1}
        pageSize={threatsData.pageSize}
        totalPageCount={threatsData.totalCount}
        fromPage='threats' />
    )
  }
  /**
   * Set the alert index and get the alert data
   * @method
   * @param {string} type - button action type ('previous' or 'next')
   */
  showAlertData = (type) => {
    const {threatsData, alertDetails} = this.state;
    let tempAlertDetails = {...alertDetails};
    let tempCurrentPage = threatsData.currentPage;

    if (type === 'previous') {
      if (alertDetails.currentIndex === 0) { //End of the data, load previous set
        this.handlePaginationChange('currentPage', --tempCurrentPage, 'alertDetails', type);
        return;
      } else {
        tempAlertDetails.currentIndex--;
      }
    } else if (type === 'next') {
      if (alertDetails.currentLength - alertDetails.currentIndex === 1) { //End of the data, load next set
        this.handlePaginationChange('currentPage', ++tempCurrentPage, 'alertDetails', type);
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
   * @param {string} [index] - index of the alert data
   * @param {object} [allValue] - all alert data
   * @param {string} [type] - button action type ('previous' or 'next')
   */
  openDetailInfo = (index, allValue, type) => {
    const {alertDetails} = this.state;
    let tempAlertDetails = {...alertDetails};
    let alertData = '';

    if (_.isArray(allValue)) { //For click from World Map
      alertData = allValue[index];
    } else {
      if (allValue) {
        alertData = allValue;
      } else { //For next/previous set of data
        if (type === 'previous') {
          index = alertDetails.all.length - 1;
        } else if (type === 'next') {
          index = 0;
        }
        alertData = alertDetails.all[index];
      }
      tempAlertDetails.currentIndex = Number(index);
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

    window.location.href = '/SCP/soc/incident-management?alertDataId=' + timeInMss;
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
        this.loadThreatsData();
      }
    });
  }
  /**
   * Handle content tab change
   * @method
   * @param {object} event - event object
   * @param {string} newTab - content type ('table', 'statistics' or 'trackTreats')
   */
  handleSubTabChange = (event, newTab) => {
    if (newTab === 'trackTreats'){
      this.setState({
        showFilter: false,
        showChart: false
      });
    }

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
   * Redirect to SOAR page
   * @method
   */
  soarRedirect = () => {
    const {baseUrl, contextRoot, language} = this.context;
    const {queryData} = this.state;
    const url = `${baseUrl}${contextRoot}/soar?flag=threats&patternId=${queryData.id}&lng=${language}`;

    window.open(url, '_blank');
  }
  /**
   * Display alert table data
   * @method
   * @returns Threats component
   */
  renderTabContent = () => {
    const {sessionRights} = this.context;
    const {activeTab, activeSubTab, tableType, currentTableID, accountType} = this.state;
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
      },
      pagination: true
    };

    if (tableType === 'select' && activeSubTab !== 'trackTreats') {
      tableOptions.pagination = false;
    } else if (activeSubTab === 'trackTreats') {
      tableOptions.pagination = false;
      tableOptions.serverSide = false;
      tableOptions.sort = true;
    } else {
      tableOptions.pagination = true;
    }

    const mainContentData = {
      activeTab,
      activeSubTab,
      tableType,
      tableOptions,
      currentTableID,
      sessionRights,
      accountType,
      chartColors: ALERT_LEVEL_COLORS,
      chartIntervalList: this.state.chartIntervalList,
      chartIntervalValue: this.state.chartIntervalValue,
      chartIntervalChange: this.handleIntervalChange,
      getChartsCSVfile: this.getChartsCSVfile,
      getLeftNavCSVfile: this.getLeftNavCSVfile,
      subTabMenu: this.state.subTabMenu,
      handleSubTabChange: this.handleSubTabChange,
      queryModalType: this.state.queryModalType,
      queryData: this.state.queryData,
      queryDataPublic: this.state.queryDataPublic,
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
      threatsData: this.state.threatsData,
      trackData: this.state.trackData,
      handleResetBtn: this.handleResetBtn,
      handleSearchSubmit: this.handleSearchSubmit,
      treeData: this.state.treeData,
      showTreeFilterBtn: this.showTreeFilterBtn,
      mainEventsData: this.state.mainEventsData,
      soarRedirect: this.soarRedirect,
      handleThreatsListCheckboxAll: this.handleThreatsListCheckboxAll,
      handleTrackListCheckboxAll: this.handleTrackListCheckboxAll
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
   */
  getCSVrequestData = (url) => {
    const dataOptions = {
      ...this.toQueryLanguage('csv')
    };
    downloadWithForm(url, {payload: JSON.stringify(dataOptions)});
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
      this.setState({
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
   * @returns QueryOpenSave component
   */
  queryDialog = () => {
    const {activeTab, account, filterData, queryData, queryDataPublic, queryModalType, notifyEmailData} = this.state;
    const {sessionRights} = this.context;
    const moduleWithSOC = !!sessionRights.Module_Soc;

    return (
      <QueryOpenSave
        page={activeTab}
        type={queryModalType}
        moduleWithSOC={moduleWithSOC}
        account={account}
        filterData={filterData}
        queryData={queryData}
        queryDataPublic={queryDataPublic}
        notifyEmailData={notifyEmailData}
        setFilterData={this.setFilterData}
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
    tempQueryDataPublic.soc = {
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
  handleOpenIncidentMenu = (event) => {
    this.setState({
      incidentAnchor: event.currentTarget,
    });
  }
  handleCloseIncidentMenu = () => {
    this.setState({
      incidentAnchor: null,
    });
  }
  render() {
    const {sessionRights} = this.context;
    const {
      datetime,
      activeSubTab,
      searchInput,
      openQueryOpen,
      saveQueryOpen,
      contextAnchor,
      incidentAnchor,
      currentQueryValue,
      filterData,
      popOverAnchor,
      taskServiceList,
      hasMore,
      showChart,
      showFilter,
      makeIncidentOpen,
      alertDetailsOpen,
      tableType,
      cancelThreatsList,
      threatsList,
      originalThreatsList,
      accountType
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
          this.queryDialog()
        }

        {saveQueryOpen &&
          this.queryDialog()
        }

        {alertDetailsOpen &&
          this.alertDialog()
        }

        {makeIncidentOpen &&
          this.handleMakeIncidentDialog()
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

        <Menu
          id='threatsCreateIncidentsMenu'
          anchorEl={incidentAnchor}
          keepMounted
          open={Boolean(incidentAnchor)}
          onClose={this.handleCloseIncidentMenu}>
          {cancelThreatsList.length !== 0 &&
            <MenuItem id='threatsCreateIncidentsMenuItemSelected' onClick={this.setupIncidentDialog.bind(this, 'select')}>{it('txt-createIncidents-selected')}</MenuItem>
          }
            <MenuItem id='threatsCreateIncidentsMenuItemAll' onClick={this.setupIncidentDialog.bind(this, 'all')}>{it('txt-createIncident-tracked')}</MenuItem>
        </Menu>

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            {tableType === 'list' && activeSubTab !== 'trackTreats' &&
              <Button id='threatsFilterBtn' variant='outlined' color='primary' className={cx({'active': showFilter})} onClick={this.toggleFilter} title={t('events.connections.txt-toggleFilter')}><i className='fg fg-filter' /><span>({filterDataCount})</span></Button>
            }
            {tableType === 'list' && activeSubTab !== 'trackTreats' &&
              <Button id='threatsChartBtn' variant='outlined' color='primary' className={cx({'active': showChart})} onClick={this.toggleChart} title={t('events.connections.txt-toggleChart')}><i className='fg fg-chart-columns' /></Button>
            }
            {tableType === 'list' && activeSubTab !== 'trackTreats' &&
              <Button id='threatsDownloadBtn' variant='outlined' color='primary' onClick={this.handleCSVclick} title={t('txt-exportCSV')}><i className='fg fg-file-csv' /></Button>
            }
            {tableType === 'list' && activeSubTab !== 'trackTreats' &&
              <Button id='openTrackedIncidents' variant='outlined' color='primary' title={it('txt-openTrackedIncidents')} disabled={activeSubTab === 'trackTreats' || activeSubTab === 'statistics'} onClick={this.toggleTableType.bind(this, 'select')}><WorkIcon /></Button>
            }
            {tableType === 'select' && activeSubTab !== 'trackTreats' &&
              <Button id='closeTrackedIncidents' variant='outlined' color='primary' title={it('txt-closeTrackedIncidents')} disabled={activeSubTab === 'trackTreats' || activeSubTab === 'statistics'} onClick={this.toggleTableType.bind(this, 'list')}><WorkOffIcon /></Button>
            }
            {tableType === 'select' && activeSubTab !== 'trackTreats' &&
              <Button id='showAddTrackDialog' variant='outlined' color='primary' title={it('txt-trackedIncidents')} disabled={activeSubTab === 'trackTreats' || activeSubTab === 'statistics' || threatsList.length === 0} onClick={this.showAddTrackDialog}><AddCircleOutlineIcon /></Button>
            }
            {activeSubTab === 'trackTreats' &&
              <Button id='showDeleteTrackDialog' variant='outlined' color='primary' title={it('txt-remove-trackedIncidents')} disabled={activeSubTab !== 'trackTreats' || activeSubTab === 'statistics' || cancelThreatsList.length === 0} onClick={this.showDeleteTrackDialog}><RemoveCircleOutlineIcon /></Button>
            }

            {activeSubTab === 'trackTreats' && sessionRights.Module_Soc && accountType === constants.soc.NONE_LIMIT_ACCOUNT &&
              <Button id='handleOpenIncidentMenu' variant='outlined' color='primary' title={it('txt-createIncidentTools')} className='last' disabled={originalThreatsList.length === 0} onClick={this.handleOpenIncidentMenu}><AllInboxOutlinedIcon /></Button>
            }
          </div>

          <ExportCSV
            popOverAnchor={popOverAnchor}
            taskServiceList={taskServiceList}
            handlePopoverClose={this.handlePopoverClose}
            registerDownload={this.registerDownload}
            getTaskService={this.getTaskService} />

          {tableType === 'list' && activeSubTab !== 'trackTreats' &&
            <SearchOptions
              datetime={datetime}
              searchInput={searchInput}
              showFilter={showFilter}
              showInterval={true}
              setSearchData={this.setSearchData}
              handleDateChange={this.handleDateChange}
              handleSearchSubmit={this.handleSearchSubmit} />
          }
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