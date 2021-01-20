import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
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
import Checkbox from 'react-ui/build/src/components/checkbox'
import {config as configLoader} from 'vbda-ui/build/src/loader'
import {downloadWithForm} from 'react-ui/build/src/utils/download'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PageNav from 'react-ui/build/src/components/page-nav'
import Popover from 'react-ui/build/src/components/popover'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {arrayMove} from 'react-sortable-hoc'
import {GithubPicker} from 'react-color';
import JSONTree from 'react-json-tree'

import helper from '../../common/helper'
import {BaseDataContext} from '../../common/context';
import QueryOpenSave from '../../common/query-open-save'
import SearchOptions from '../../common/search-options'
import SortableList from '../../common/sortable-list'
import TableCell from '../../common/table-cell'
import WORLDMAP from '../../../mock/world-map-low.json'

import Certification from './tabs/certification'
import Connections from './tabs/connections'
import Dns from './tabs/dns'
import Email from './tabs/email'
import File from './tabs/file'
import Ftp from './tabs/ftp'
import Html from './tabs/html'
import Http from './tabs/http'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

const ALL_TAB_DATA = {
  connections: 'Connections',
  dns: 'DNS',
  http: 'HTTP',
  html: 'HTML',
  email: 'Email',
  file: 'File',
  cert: 'Certification',
  ftp: 'FTP'
};

/**
 * Events Netflow
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to handle the business logic for the events page
 */
class Netflow extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');

    this.state = {
      projectID: '',
      activeTab: 'connections',
      //General
      datetime: {
        from: helper.getSubstractDate(1, 'hour'),
        to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
        //from: '2019-08-27T05:28:00Z',
        //to: '2019-08-27T05:29:00Z'
      },
      currentPage: 1,
      oldPage: 1,
      pageSize: 20,
      pageSizeGrid: 50,
      pageSizeMap: 500,
      sort: {
        field: 'lastPacket',
        desc: true
      },
      //Left nav
      searchTreeObj: {},
      treeRawData: {},
      treeData: null,
      currentTreeName: '',
      //Tab Menu
      subTabMenu: {
        table: t('txt-table'),
        linkAnalysis: t('txt-linkAnalysis'),
        worldMap: t('txt-map')
      },
      activeSubTab: 'table',
      //Search bar
      searchInput: {
        searchType: 'manual',
        searchInterval: '1h',
        refreshTime: '60000' //1 min.
      },
      //Events count
      eventsCount: {},
      //Connections
      connectionsChartType: 'connections',
      connectionsInterval: '1m',
      sessionHistogram: {},
      packageHistogram: {},
      byteHistogram: {},
      filterData: [{
        condition: 'must',
        query: ''
      }],
      //Sub sections
      subSectionsData: {
        mainData: {
          connections: null,
          dns: null,
          http: null,
          html: null,
          email: null,
          file: null,
          cert: null,
          ftp: null
        },
        fieldsData: {
          connections: {},
          dns: {},
          http: {},
          html: {},
          email: {},
          file: {},
          cert: {},
          ftp: {}
        },
        laData: {
          connections: []
        },
        mapData: {
          connections: []
        },
        tableColumns: {},
        totalCount: {
          connections: 0,
          dns: 0,
          http: 0,
          html: 0,
          email: 0,
          file: 0,
          cert: 0,
          ftp: 0
        }
      },
      netflowContextAnchor: null,
      currentNetflowData: {},
      LAconfig: {},
      mainEventsData: {},
      showImgCheckbox: false,
      displayType: 'list', //list, grid
      account: {
        id: '',
        login: false,
        fields: [],
        logsLocale: ''
      },
      sortedDataList: [],
      tagData: {
        id: '',
        projectID: '',
        sessionID: '',
        modalTitle: '',
        color: '#FCCB00',
        memo: ''
      },
      pcapData: {
        projectID: '',
        sessionID: '',
        origData: [],
        data: [],
        page: 1,
        pageSize: 10,
        totalCount: 0,
        activeIndex: null,
        hex: '',
        filterEmpty: false
      },
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
      queryContextAnchor: null,
      currentQueryField: '',
      currentQueryValue: '',
      newQueryName: true,
      geoJson: {
        mapDataArr: [],
        attacksDataArr: []
      },
      showFilter: false,
      showChart: false,
      modalOpen: false,
      openQueryOpen: false,
      saveQueryOpen: false,
      taggingOpen: false,
      pcapOpen: false,
      tableMouseOver: false,
      currentTableIndex: '',
      currentLength: '',
      currentTableID: '',
      loadNetflowData: true,
      formValidation: {
        memo: {
          valid: true
        }
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, session, sessionRights} = this.context;
    const {datetime, filterData, account} = this.state;
    let urlParams = queryString.parse(location.search);
    let tempAccount = {...account};

    helper.getPrivilegesInfo(sessionRights, 'common', locale);

    if (session.accountId) {
      tempAccount.id = session.accountId;
      tempAccount.login = true;

      if (urlParams.eventDttm) {
        let ip = '';

        if (urlParams.srcIp) {
          ip = 'ipSrc: ' + urlParams.srcIp;
        } else if (urlParams.destIp) {
          ip = 'ipDst: ' + urlParams.destIp;
        }

        this.setState({
          datetime: {
            from: helper.getSubstractDate(30, 'minutes', urlParams.eventDttm),
            to: helper.getAdditionDate(30, 'minutes', urlParams.eventDttm)
          },
          filterData: [{
            condition: 'must',
            query: ip
          }],
          account: tempAccount,
          showFilter: true
        }, () => {
          this.initialLoad();
        });
      } else if (urlParams.from && urlParams.to) {
        const page = urlParams.page;
        let query = 'ipSrc: ' + urlParams.sourceIP;

        if (page === 'host') {
          query = urlParams.sourceIP;
        }

        this.setState({
          datetime: {
            from: urlParams.from,
            to: urlParams.to
          },
          filterData: [{
            condition: 'must',
            query
          }],
          account: tempAccount,
          showFilter: true
        }, () => {
          this.initialLoad();

          if (urlParams.type === 'dns') {
            this.handleTabChange('dns');
          }
        });
      } else {
        this.setState({
          account: tempAccount
        }, () => {
          this.initialLoad();
        });
      }
    }
  }
  /**
   * Initial load for the page
   * @method
   */
  initialLoad = () => {
    this.getLAconfig();
    this.getSavedQuery();
    this.getProjectId();
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

    helper.getSavedQuery(baseUrl, account, queryData, 'event')
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
   * Get and set the project ID
   * @method
   */
  getProjectId = () => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/agent/_search`;
    const requestData = {
      pageSize: 10000
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      if (data.rows.length > 0) {
        const projectID = data.rows.map(tempData => {
          return tempData.projectId;
        });

        this.setState({
          projectID
        }, () => {
          this.loadAllFields();
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
   * Copy search fields into table columns
   * @method
   */
  loadAllFields = () => {
    let tempSubSectionsData = {...this.state.subSectionsData};
    tempSubSectionsData.tableColumns = _.cloneDeep(this.props.searchFields);
    tempSubSectionsData.tableColumns.connections = tempSubSectionsData.tableColumns.session;
    tempSubSectionsData.tableColumns.file.push('base64');

    this.setState({
      subSectionsData: tempSubSectionsData
    }, () => {
      this.loadEventsCount('loadFields');
    });
  }
  /**
   * Get and set the events count
   * @method
   * @param {string} options - option for 'loadFields'
   */
  loadEventsCount = (options) => {
    const {baseUrl} = this.context;
    const {projectID, eventsCount, activeTab} = this.state;
    const projectIDstring = this.getProjectURL(projectID);
    let apiArr = [];
    let tempEventsCount = {...eventsCount};

    _.forEach(ALL_TAB_DATA, (val, key) => {
      key = key === 'connections' ? 'session' : key;

      apiArr.push({
        url: `${baseUrl}/api/network/${key}/_search?${projectIDstring}&page=1&pageSize=10`,
        data: JSON.stringify(this.toQueryLanguage()),
        type: 'POST',
        contentType: 'text/plain'
      });
    })

    this.ah.all(apiArr, {showProgress: false})
    .then(data => {
      if (data) {
        let i = 0;

        _.forEach(ALL_TAB_DATA, (val, key) => {
          if (data[i]) {
            if (data[i].data) { //For Connections
              tempEventsCount[key] = data[i].data.counts;
            } else { //For all others
              tempEventsCount[key] = data[i].counts;
            }
          }
          i++;
        })

        this.setState({
          eventsCount: tempEventsCount
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    if (options === 'loadFields') {
      this.loadFields(activeTab);
    } else {
      if (activeTab === 'connections') {
        this.loadActiveSubTab(options);
      } else {
        this.loadSubSections(options);
      }
    }
  }
  /**
   * Get and set event fields of the account
   * @method
   * @param {string} activeTab - current tab
   * @param {string} options - options for 'showDefault' and 'noCount'
   */
  loadFields = (activeTab, options) => {
    const {baseUrl} = this.context;
    const {subSectionsData, account} = this.state;
    let tempSubSectionsData = {...subSectionsData};
    let tempAccont = {...account};
    let url = '';
    let module = '';

    if (activeTab === 'connections') {
      module = 'FLOW_SESSION';
    } else {
      module = 'FLOW_' + activeTab.toUpperCase();
    }
    url = `${baseUrl}/api/account/flow/fields?module=${module}`;

    if (account.id && account.login && !options) {
      url += `&accountId=${account.id}`;
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

        if (activeTab === 'file') {
          if (!_.includes(tempAccont.fields, 'base64')) {
            tempAccont.fields.push('base64');
          }
        }

        this.setState({
          subSectionsData: tempSubSectionsData,
          account: tempAccont
        }, () => {
          this.loadSection(options);
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
   * Load subtab content ('table', 'link analysis' or 'world map')
   * @method
   * @param {string} options - option for 'search'
   */
  loadActiveSubTab = (options) => {
    const {activeTab, activeSubTab} = this.state;

    if (activeSubTab === 'table') {
      if (activeTab === 'connections') {
        this.loadConnections(options);
      } else {
        this.loadSubSections(options);
      }
    } else if (activeSubTab === 'linkAnalysis') {
      this.resetLinkAnalysis(options);
    } else if (activeSubTab === 'worldMap') {
      this.loadWorldMap(options);
    }
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
   * Load table data based on events type
   * @method
   * @param {string} options - option for 'noCount'
   */
  loadSection = (options) => {
    const {activeTab} = this.state;

    if (!options || options !== 'noCount') {
      this.loadEventsCount();
    }

    if (activeTab === 'connections') {
      this.loadConnections();
    } else {
      this.loadSubSections();
    }
  }
  /**
   * Handle tab dropdown change
   * @method
   * @param {string | object} event - new tab to be loaded
   */
  handleTabChange = (event) => {
    const activeTab = event.target ? event.target.value : event;
    const {subSectionsData, filterData, showFilter} = this.state;
    const fieldsData = this.props.searchFields;
    const fieldsDataObj = {
      connections: fieldsData.session,
      dns: fieldsData.dns,
      http: fieldsData.http,
      html: fieldsData.html,
      email: fieldsData.email,
      file: fieldsData.file,
      cert: fieldsData.cert,
      ftp: fieldsData.ftp
    };
    const defaultField = 'lastPacket';
    let tempSubSectionsData = {...subSectionsData};
    let tempFilterData = _.cloneDeep(filterData);
    let subTabMenu = {table: t('txt-table')};
    let activeSubTab = 'table';

    if (this.state.activeTab === activeTab) {
      return;
    }

    if (activeTab === 'connections') {
      subTabMenu = {
        table: t('txt-table'),
        linkAnalysis: t('txt-linkAnalysis'),
        worldMap: t('txt-map')
      };
      activeSubTab = 'table';
    }

    if (showFilter) {
      for (var i = 0; i < tempFilterData.length; i++) {
        tempFilterData[i].disabled = false;

        if (fieldsDataObj[activeTab].indexOf(tempFilterData[i].fields) < 0) { //Item is not found in an array
          tempFilterData[i].disabled = true;
        }
      }
    } else {
      tempFilterData = [{
        condition: 'must',
        query: ''
      }];
    }

    tempSubSectionsData.mainData = {
      connections: null,
      dns: null,
      http: null,
      html: null,
      email: null,
      file: null,
      cert: null,
      ftp: null
    };

    this.setState({
      activeTab,
      currentPage: 1,
      oldPage: 1,
      pageSize: 20,
      pageSizeGrid: 50,
      pageSizeMap: 500,
      subTabMenu,
      activeSubTab,
      sort: {
        field: defaultField,
        desc: true
      },
      filterData: tempFilterData,
      subSectionsData: tempSubSectionsData,
      treeRawData: {},
      treeData: null,
      showImgCheckbox: false,
      displayType: 'list',
      showChart: false,
      tableMouseOver: false
    }, () => {
      this.loadFields(activeTab, 'noCount');
    });
  }
  /**
   * Construct project URL
   * @method
   * @param {string} projectID - project ID
   * @returns project URL
   */
  getProjectURL = (projectID) => {
    let projectIDstring = '';

    if (_.isArray(projectID)) {
      _.forEach(projectID, id => {
        projectIDstring += 'projectId=' + id + '&';
      });
    } else {
      projectIDstring = 'projectId=' + projectID + '&';
    }

    return projectIDstring.slice(0, -1);
  }
  /**
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable or null
   */
  checkSortable = (field) => {
    const unSortableFields = ['_tableMenu_', 'base64', 'filePath', 'controlText', 'htmlRelinkPath', 'body', 'requestRawHeader', 'responseRawHeader', 'uploadData', 'dnsho'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  /**
   * Load Connections data
   * @method
   * @param {string} options - option for 'search'
   * @param {string} [type] - button action type ('previous' or 'next')
   */
  loadConnections = (options, type) => {
    const {baseUrl} = this.context;
    const {projectID, activeTab, connectionsInterval, currentPage, oldPage, pageSize, subSectionsData, account} = this.state;
    const projectIDstring = this.getProjectURL(projectID);
    const setPage = options === 'search' ? 1 : currentPage;

    this.ah.all([{
      url: `${baseUrl}/api/network/session/_search?${projectIDstring}&interval=${connectionsInterval}&page=${setPage}&pageSize=${pageSize}&accountId=${account.id}&showTag=Y&appendIpInfo=true`,
      data: JSON.stringify(this.toQueryLanguage(options)),
      type: 'POST',
      contentType: 'text/plain'
    },
    {
      url: `${baseUrl}/api/network/session/service/_aggregate?${projectIDstring}`,
      data: JSON.stringify(this.toQueryLanguage('time')),
      type: 'POST',
      contentType: 'text/plain'
    }])
    .then(data => {
      if (data) {
        if (currentPage > 1 && !data[0]) {
          helper.showPopupMsg('', t('txt-error'), t('txt-maxDataMsg'));

          this.setState({
            currentPage: oldPage
          });
          return;
        }

        if (_.isEmpty(data[0]) || data[0].data.counts === 0) {
          helper.showPopupMsg(t('txt-notFound', ''));

          let tempSubSectionsData = {...this.state.subSectionsData};
          tempSubSectionsData.mainData.connections = [];
          tempSubSectionsData.laData.connections = [];
          tempSubSectionsData.mapData.connections = [];
          tempSubSectionsData.totalCount.connections = 0;

          this.setState({
            subSectionsData: tempSubSectionsData,
            connectionsChartType: 'connections',
            connectionsInterval: '1m',
            sessionHistogram: {},
            packageHistogram: {},
            byteHistogram: {},
            currentPage: 1,
            oldPage: 1,
            pageSize: 20,
            treeRawData: {},
            treeData: {}
          });
          return;
        }

        const tempArray = data[0].data.rows.map(tempData => {
          tempData.content.id = tempData.id;

          if (tempData.tag) {
            tempData.content.tag = tempData.tag;
          }

          return tempData.content;
        });

        const currentLength = data[0].data.rows.length < pageSize ? data[0].data.rows.length : pageSize;

        let tempFields = {};
        subSectionsData.tableColumns.connections.forEach(tempData => {
          tempFields[tempData] = {
            hide: !this.checkDisplayFields(tempData),
            label: f(`connectionsFields.${tempData}`),
            sortable: this.checkSortable(tempData),
            formatter: (value, allValue, i) => {
              if (tempData === '_tableMenu_') {
                return (
                  <div className={cx('table-menu', {'active': value})}>
                    <Button variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue)}><i className='fg fg-more'></i></Button>
                  </div>
                )
              }
              if (tempData === 'firstPacket' || tempData === 'lastPacket' || tempData === '_eventDttm_') {
                value = helper.getFormattedDate(value, 'local');
              }
              if (typeof value === 'boolean') {
                value = value.toString();
              }
              return (
                <TableCell
                  activeTab={activeTab}
                  fieldValue={value}
                  fieldName={tempData}
                  allValue={allValue}
                  handleOpenQueryMenu={this.handleOpenQueryMenu} />
              )
            }
          }
        })

        const treeObj = this.getTreeData(data[1]);
        let tempSubSectionsData = {...subSectionsData};
        tempSubSectionsData.mainData.connections = tempArray;
        tempSubSectionsData.fieldsData.connections = tempFields;
        tempSubSectionsData.mapData.connections = data[0].data.rows;
        tempSubSectionsData.totalCount.connections = data[0].data.counts;

        const tempCurrentPage = options === 'search' ? 1 : currentPage;
        const dataArray = tempSubSectionsData.mainData.connections;

        for (var i = 0; i < dataArray.length; i++) {
          for (var key in dataArray[i]) {
            if (Array.isArray(dataArray[i][key])) {
              tempSubSectionsData.mainData.connections[i][key] = helper.arrayDataJoin(dataArray[i][key], '', ', ');
            }
          }
        }

        this.setState({
          currentPage: tempCurrentPage,
          oldPage: tempCurrentPage,
          subSectionsData: tempSubSectionsData,
          treeRawData: data[1],
          treeData: treeObj,
          searchTreeObj: treeObj,
          sessionHistogram: data[0].sessionHistogram,
          packageHistogram: data[0].packageHistogram,
          byteHistogram: data[0].byteHistogram,
          currentLength
        }, () => {
          if (type) {
            this.showTableData('', type);
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
   * Load events data other than Connections (DNS, File, Email, HTTP, etc.)
   * @method
   * @param {string} options - option for 'search'
   * @param {string} [type] - button action type ('previous' or 'next')
   */
  loadSubSections = (options, type) => {
    const {baseUrl, contextRoot} = this.context;
    const {projectID, activeTab, currentPage, oldPage, pageSize, pageSizeGrid, subSectionsData, account} = this.state;
    const projectIDstring = this.getProjectURL(projectID);
    const setPage = options === 'search' ? 1 : currentPage;
    const isFileGrid = this.fileImageGrid();
    const pageSizeSet = isFileGrid ? pageSizeGrid : pageSize;

    this.ah.all([{
      url: `${baseUrl}/api/network/${activeTab}/_search?${projectIDstring}&page=${setPage}&pageSize=${pageSizeSet}&accountId=${account.id}&showTag=Y`,
      data: JSON.stringify(this.toQueryLanguage(options)),
      type: 'POST',
      contentType: 'text/plain'
    },
    {
      url: `${baseUrl}/api/network/${activeTab}/service/_aggregate?${projectIDstring}`,
      data: JSON.stringify(this.toQueryLanguage('time')),
      type: 'POST',
      contentType: 'text/plain'
    }])
    .then(data => {
      if (data) {
        if (currentPage > 1 && data[0].rows.length === 0) {
          helper.showPopupMsg('', t('txt-error'), t('txt-maxDataMsg'));

          this.setState({
            currentPage: oldPage
          });
          return;
        }

        let tempSubSectionsData = {...subSectionsData};

        if (_.isEmpty(data[0]) || data[0].counts === 0) {
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
            treeRawData: {},
            treeData: {}
          });
          return;
        }

        const tempArray = data[0].rows.map(tempData => {
          if (activeTab === 'dns') {
            tempData.content.id = tempData.id;
          } else {
            tempData.content.id = tempData.content.sessionId;
          }

          if (tempData.tag) {
            tempData.content.tag = tempData.tag;
          }

          return tempData.content;
        });

        const currentLength = data[0].rows.length < pageSize ? data[0].rows.length : pageSize;

        let tempFields = {};
        subSectionsData.tableColumns[activeTab].forEach(tempData => {
          let tempFieldName = tempData;

          tempFields[tempData] = {
            hide: !this.checkDisplayFields(tempData),
            label: f(`${activeTab}Fields.${tempFieldName}`),
            sortable: this.checkSortable(tempData),
            formatter: (value, allValue) => {
              if (tempData === '_tableMenu_') {
                return (
                  <div className={cx('table-menu', {'active': value})}>
                    <Button variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue)}><i className='fg fg-more'></i></Button>
                  </div>
                )
              }
              if (tempData === 'base64' && value) {
                if (value.indexOf('data:image/') >= 0) {
                  return <img src={value} className='file-image' onClick={this.openImageModal(value)} />
                }
              } else if (tempData === 'filePath') {
                return <a href={baseUrl + contextRoot + '/api/network/file?path=' + value} target='_blank' download>{value}</a>
              } else if (tempData === 'controlText') {
                return <span title={value} onClick={this.handleOpenQueryMenu(tempData, value)}>{value.substr(0, 50) + '...'}</span>
              } else if (tempData === 'htmlRelinkPath') {
                return <span className='file-html' onClick={this.openHTMLModal.bind(this, value)}>{value}</span>
              } else {
                if (tempData === 'firstPacket' || tempData === 'lastPacket' || tempData === '_eventDttm_') {
                  value = helper.getFormattedDate(value, 'local');
                }
                if (typeof value === 'boolean') {
                  value = value.toString();
                }
                return (
                  <TableCell
                    activeTab={activeTab}
                    fieldValue={value}
                    fieldName={tempData}
                    allValue={allValue}
                    handleOpenQueryMenu={this.handleOpenQueryMenu} />
                )
              }
            }
          };
        })

        const treeObj = this.getTreeData(data[1]);
        tempSubSectionsData.totalCount[activeTab] = data[0].counts;
        tempSubSectionsData.mainData[activeTab] = tempArray;
        tempSubSectionsData.fieldsData[activeTab] = tempFields;

        const tempCurrentPage = options === 'search' ? 1 : currentPage;
        let dataArray = tempSubSectionsData.mainData[activeTab];
        let objectKey = '';

        if (activeTab === 'dns' || activeTab === 'email' || activeTab === 'ftp') {
          if (activeTab === 'email') {
            objectKey = 'emailAddress';
          } else if (activeTab === 'ftp') {
            objectKey = 'text';
          }

          for (var i = 0; i < dataArray.length; i++) {
            for (var key in dataArray[i]) {
              let arraySeparator = ', ';

              if (Array.isArray(dataArray[i][key])) {
                if (key === 'controlText') {
                  arraySeparator = ' ';
                }
                tempSubSectionsData.mainData[activeTab][i][key] = helper.arrayDataJoin(dataArray[i][key], objectKey, arraySeparator);
              }
            }
          }
        }

        this.setState({
          currentPage: tempCurrentPage,
          oldPage: tempCurrentPage,
          treeRawData: data[1],
          treeData: treeObj,
          subSectionsData: tempSubSectionsData,
          currentLength
        }, () => {
          if (type) {
            this.showTableData('', type);
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
    const {activeTab, projectID, currentPage, pageSizeMap, subSectionsData, LAconfig} = this.state;
    const projectIDstring = this.getProjectURL(projectID); 
    const setPage = options === 'search' ? 1 : currentPage;
    const url = `${baseUrl}/api/network/session/la/_search?${projectIDstring}&page=${setPage}&pageSize=${pageSizeMap}`;
    const requestData = this.toQueryLanguage(options);
    let tempSubSectionsData = {...subSectionsData};
    let mainEventsData = {};

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let laData = [];

        if (data.rows) {
          laData = data.rows;

          _.forEach(laData, val => {
            mainEventsData[val.id] = val.content;
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
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set data for the world map
   * @method
   * @param {string} options - option for 'search'
   */
  loadWorldMap = (options) => {
    const {baseUrl} = this.context;
    const {activeTab, projectID, datetime, subSectionsData, currentPage, pageSizeMap} = this.state;
    const projectIDstring = this.getProjectURL(projectID);
    const setPage = options === 'search' ? 1 : currentPage;
    const url = `${baseUrl}/api/network/session/map/_search?${projectIDstring}&page=${setPage}&pageSize=${pageSizeMap}`;
    const requestData = this.toQueryLanguage();
    let tempSubSectionsData = {...subSectionsData};

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        const tempArray = _.map(data.rows, val => {
          val.content.id = val.id;
          return val.content;
        });

        tempSubSectionsData.mapData[activeTab] = tempArray;
        tempSubSectionsData.totalCount[activeTab] = data.counts;

        this.setState({
          subSectionsData: tempSubSectionsData
        }, () => {
          this.getWorldMap();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set world map geoJson data
   * @method
   */
  getWorldMap = () => {
    const {activeTab, geoJson, subSectionsData} = this.state;

    this.setState({
      activeSubTab: 'worldMap',
      geoJson: helper.getWorldMap(WORLDMAP, geoJson, subSectionsData.mapData[activeTab])
    });
  }
  /**
   * Construct the netflow events api request body
   * @method
   * @param {string} options - option for time', 'images' or 'csv'
   * @returns requst data object
   */
  toQueryLanguage = (options) => {
    const {datetime, sort, filterData} = this.state;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    let dataObj = {
      query: {
        lastPacket: {
          op: 'BETWEEN',
          arg: [dateTime.from, dateTime.to]
        }
      },
      sort: [{
        [sort.field]: sort.desc ? 'desc' : 'asc'
      }]
    };
    let filterDataArr = [];

    if (options === 'time') {
      return dataObj.query;
    }

    if (options === 'images') {
      dataObj.query.detectedType = {
        op: 'LIKE',
        arg: 'image'
      };
    } else {
      if (filterData.length > 0) {
        filterDataArr = helper.buildFilterDataArray(filterData);
      }
    }

    if (filterDataArr.length > 0) {
      dataObj.query.filter = filterDataArr;
    }

    if (options == 'csv') {
      const timezone = momentTimezone.tz(momentTimezone.tz.guess()); //Get local timezone obj
      const utc_offset = timezone._offset / 60; //Convert minute to hour
      dataObj.timeZone = utc_offset;
    }

    return dataObj;
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

    _.keys(treeData)
    .sort()
    .forEach(key => {
      let tempChild = [];
      let label = '';
      let totalHostCount = 0;

      if (key) {
        treeData[key].forEach(key2 => {
          _.forEach(key2, (val, key3) => {
            let hostCount = 0;

            _.forEach(val, val2 => {
              hostCount += val2.counts;

              tempChild.push({
                id: val2,
                key: val2.ip,
                label: <span>{val2.ip} ({helper.numberWithCommas(val2.counts)}) <Button variant='outlined' color='primary' className={cx('button', {'active': currentTreeName === val2.ip})} onClick={this.selectTree.bind(this, val2.ip, 'dstHostname')}>{t('events.connections.txt-addFilter')}</Button></span>
              });
            })

            totalHostCount += hostCount;
          })
        })

        if (key === 'unknown') { //Add an export button for Unknown service
          label = <span>{key} ({helper.numberWithCommas(totalHostCount)}) <Button variant='outlined' color='primary' className='button active' onClick={this.handleTreeExport}>{t('txt-export')}</Button> <Button variant='outlined' color='primary' className={cx('button', {'active': currentTreeName === key})} onClick={this.selectTree.bind(this, key, 'dstSvcname')}>{t('events.connections.txt-addFilter')}</Button></span>;
        } else {
          let formattedKey = key;

          if (key.length > 25) {
            formattedKey = key.substr(0, 28) + '...';
          }

          label = <span>{formattedKey} ({helper.numberWithCommas(totalHostCount)}) <Button variant='outlined' color='primary' className={cx('button', {'active': currentTreeName === key})} onClick={this.selectTree.bind(this, key, 'dstSvcname')}>{t('events.connections.txt-addFilter')}</Button></span>;
        }

        let treeProperty = {
          id: key,
          key,
          label
        };

        if (tempChild.length > 0) {
          treeProperty.children = tempChild;
        }

        treeObj.children.push(treeProperty);
        allServiceCount += totalHostCount;
      }
    })

    treeObj.label = t('txt-all') + ' (' + allServiceCount + ')';

    return treeObj;
  }
  /**
   * Handle tree export button
   * @method
   */
  handleTreeExport = () => {
    const {baseUrl, contextRoot} = this.context;
    const {projectID, activeTab} = this.state;
    const type = activeTab === 'connections' ? 'session' : activeTab;
    const projectIDstring = this.getProjectURL(projectID);
    const url = `${baseUrl}${contextRoot}/api/network/${type}/service/unknown/_export?${projectIDstring}`;
    const dataOptions = {
      ...this.toQueryLanguage()
    };

    downloadWithForm(url, {payload: JSON.stringify(dataOptions)});
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
    }, () => {
      if (fromSearch) {
        this.setState({
          currentPage: 1,
          oldPage: 1,
          tableMouseOver: false
        }, () => {
          this.loadEventsCount(fromSearch);
        });
      }
    });
  }
  /**
   * Handle alert search reset
   * @method
   * @param {string} type - reset type ('filter' or 'mark')
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
      } else if (type === 'map') {
        this.loadWorldMap();
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
      } else if (type === 'map') {
        this.loadWorldMap();
      }
    });
  }
  /**
   * Handle pagination change
   * @method
   * @param {number} currentPage - current page
   * @param {string} [type] - button action type ('previous' or 'next')
   */
  handlePaginationChange = (currentPage, type) => {
    const {activeTab, showImgCheckbox} = this.state;

    this.setState({
      currentPage
    }, () => {
      if (activeTab === 'connections') {
        this.loadConnections('', type);
      } else {
        this.loadSubSections(showImgCheckbox ? 'images' : '', type);
      }
    });
  }
  /**
   * Handle page size dropdown
   * @method
   * @param {string} pageSize - current page size
   */
  handlePageDropdown = (pageSize) => {
    const {activeTab} = this.state;
    const isFileGrid = this.fileImageGrid();

    if (isFileGrid) {
      this.setState({
        currentPage: 1,
        pageSizeGrid: Number(pageSize)
      }, () => {
        this.loadSubSections('images');
      });
    } else {
      this.setState({
        currentPage: 1,
        pageSize: Number(pageSize)
      }, () => {
        if (activeTab === 'connections') {
          this.loadConnections();
        } else {
          this.loadSubSections();
        }
      });
    }
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
      this.loadSection();
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
      loadNetflowData: false
    }, () => {
      this.addSearch(field, value, 'must');
    });
  }
  /**
   * Handle table menu PCAP download
   * @method
   * @param {string} value - table selected row data
   */
  pcapDownloadFile = (value) => {
    const {baseUrl} = this.context;
    const projectId = value.projectName;
    const url = `${baseUrl}/api/network/session/pcapFile`;
    const requestData = {
      ro : (value.id || value.sessionId),
      _id : '',
      projectId : projectId
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ResultMessage === 'fail') {
        helper.showPopupMsg(t('txt-pcapDownloadFail'), t('txt-error'), data.ErrorMessage);
      } else {
        window.location.assign(data.PcapFilelink);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.handleCloseMenu();
  }
  /**
   * Handle table row mouse over to show menu button and tag memo
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

    if (allValue.tag && allValue.tag.memo) {
      Popover.openId(
        'popup-id',
        event,
        allValue.tag.memo
      )
    }
  }
  /**
   * Handle table row mouse out
   * @method
   * @param {number} id - ID of the selected raw data
   * @param {object} allValue - table data
   * @param {object} event - event object
   */
  handleRowMouseOut = (id, allValue, event) => {
    Popover.closeId('popup-id')
  }
  /**
   * Handle open menu
   * @method
   * @param {object} netflow - active netflow data
   * @param {object} event - event object
   */
  handleOpenMenu = (netflow, event) => {
    this.setState({
      netflowContextAnchor: event.currentTarget,
      currentNetflowData: netflow
    });
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      netflowContextAnchor: null,
      currentNetflowData: {}
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
    const {activeTab, account} = this.state;
    let tempAccount = {...account};
    let fieldString = '';
    let url = '';
    let module = '';
    tempAccount.fields = fields;

    _.forEach(fields, value => {
      fieldString += '&field=' + value;
    })

    if (activeTab === 'connections') {
      module = 'FLOW_SESSION';
    } else {
      module = 'FLOW_' + activeTab.toUpperCase();
    }
    url = `${baseUrl}/api/account/flow/fields?module=${module}&accountId=${account.id}${fieldString}`;

    ah.one({
      url,
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
   * Set the table row index and netflow data
   * @method
   * @param {string | object} data - button action type ('previous' or 'next'), or data object
   * @param {string} [type] - button action type ('previous' or 'next')
   * @returns object of index and data
   */
  handleDialogNavigation = (data, type) => {
    const {activeTab, currentPage, subSectionsData, currentTableIndex} = this.state;
    let tableRowIndex = '';
    let allValue = {};
    let tempCurrentPage = currentPage;

    if (data === 'previous' || data === 'next') { //For click on navigation button
      tableRowIndex = currentTableIndex;

      if (data === 'previous') {
        if (currentTableIndex === 0) { //End of the data, load previous set
          this.handlePaginationChange(--tempCurrentPage, data);
          return;
        } else {
          tableRowIndex--;
        }
      } else if (data === 'next') {
        if (currentTableIndex + 1 == currentLength) { //End of the data, load next set
          this.handlePaginationChange(++tempCurrentPage, data);
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
   * @param {object} allValue - data of selected table row
   * @param {string} [type] - button action type ('previous' or 'next')
   */
  showTableData = (allValue, type) => {
    const {account} = this.state;
    const newData = this.handleDialogNavigation(allValue, type);
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
    const {currentPage, currentTableIndex, currentLength} = this.state;
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
          setFieldsChange={this.setFieldsChange}
          checkDisplayFields={this.checkDisplayFields}
          handleOpenQueryMenu={this.handleOpenQueryMenu}
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
      saveQueryOpen: false,
      taggingOpen: false,
      pcapOpen: false,
      formValidation: {
        memo: {
          valid: true
        }
      }
    }, () => {
      this.clearTagData();
      this.clearPcapData();
      this.clearQueryData();
    });
  }
  /**
   * Reset table based on user's interaction with table dialog or memo tag
   * @method
   * @param {string} options - option for 'setFields'
   */
  resetDataTable = (options) => {
    const {activeTab, subSectionsData} = this.state;
    let tempSubSectionsData = {...subSectionsData};
    tempSubSectionsData.mainData[activeTab] = [];
    tempSubSectionsData.fieldsData[activeTab] = {};
    tempSubSectionsData.totalCount[activeTab] = 0;

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
    const {activeTab} = this.state;
    const title = ALL_TAB_DATA[activeTab] + ' ' + t('events.connections.txt-fieldsSettings');
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

        {currentLength > 0 &&
          <div className='pagination json'>
            <div className='buttons'>
              {this.displayNavigationBtn('json', 'previous')}
              {this.displayNavigationBtn('json', 'next')}
            </div>
            <span className='count'>{currentTableIndex + 1} / {currentLength}</span>
          </div>
        }
      </div>
    )
  }
  /**
   * Open Json data modal dialog
   * @method
   * @param {object} allValue - data of selected table row
   */
  showJsonData = (allValue) => {
    const {activeTab} = this.state;
    const newData = this.handleDialogNavigation(allValue);
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
   * Set PCAP hex value
   * @method
   * @param {string} hex - original string value
   * @param {number} index - active index of the Alert PCAP array
   */
  setPCAPhex = (hex, index) => {
    let tempPcapData = {...this.state.pcapData};

    if (hex) {
      tempPcapData.hex = hex.replace(/\s/g, '');
    } else {
      return false;
    }
    tempPcapData.activeIndex = index;

    this.setState({
      pcapData: tempPcapData
    });
  }
  /**
   * Set PCAP page
   * @method
   * @param {string} currentPage - current page of the PCAP info
   */
  setPCAPpage = (currentPage) => {
    let tempPcapData = {...this.state.pcapData};
    tempPcapData.page = currentPage;
    tempPcapData.activeIndex = null;
    tempPcapData.hex = '';
    tempPcapData.filterEmpty = false;

    this.setState({
      pcapData: tempPcapData
    }, () => {
      this.getPCAPcontent();
    });
  }
  /**
   * Toggle (check/uncheck) to show/hide the PCAP data
   * @method
   */
  toggleFilterEmpty = () => {
    const {pcapData} = this.state;
    let tempPcapData = {...pcapData};
    tempPcapData.activeIndex = null;
    tempPcapData.hex = '';
    tempPcapData.filterEmpty = !tempPcapData.filterEmpty;

    if (tempPcapData.filterEmpty) {
      let connectionsPCAPdata = [];

      _.forEach(pcapData.data, val => {
        if (val.hex) {
          connectionsPCAPdata.push(val);
        }
      })
      tempPcapData.data = connectionsPCAPdata;
    } else {
      tempPcapData.data = _.cloneDeep(pcapData.origData);
    }

    this.setState({
      pcapData: tempPcapData
    });
  }
  /**
   * Display individual PCAP data
   * @method
   * @param {object} val - PCAP data
   * @param {number} i - index
   * @returns HTML DOM
   */
  showPCAPcontent = (val, i) => {
    return <li key={i} className={cx({'active': val.hex})} onClick={this.setPCAPhex.bind(this, val.hex, i)}>{val.protocol}<i className={cx('fg', {'fg-arrow-left': this.state.pcapData.activeIndex === i})}></i></li>  
  }
  /**
   * Display PCAP content
   * @method
   * @returns HTML DOM
   */
  displayPCAPcontent = () => {
    const {pcapData} = this.state;
    const hex = pcapData.hex;
    let str = '';

    if (hex) {
      for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
    }

    return (
      <div className='pcap-content'>
        {pcapData.data.length > 0 &&
          <div className='c-flex aic filter-empty'>
            <label htmlFor='filterEmpty'>{t('alert.txt-filterEmpty')}</label>
            <Checkbox
              id='filterEmpty'
              checked={pcapData.filterEmpty}
              onChange={this.toggleFilterEmpty} />
          </div>
        }
        <div className='pcap'>
          <div className='list'>
            <ul>
              {pcapData.data && pcapData.data.length > 0 &&
                pcapData.data.map(this.showPCAPcontent)
              }
            </ul>
          </div>
          <div className='data'>
            {str &&
              <TextField
                multiline
                variant='outlined'
                fullWidth
                size='small'
                value={str}
                disabled />
            }
          </div>
        </div>
        {pcapData.totalCount > pcapData.pageSize &&
          <footer>
            <PageNav
              pages={Math.ceil(pcapData.totalCount / pcapData.pageSize)}
              current={pcapData.page}
              onChange={this.setPCAPpage} />
          </footer>
        }
      </div>
    )
  }
  /**
   * Display PCAP content in modal dialog
   * @method
   * @returns ModalDialog component
   */
  pcapDialog = () => {
    const titleText = t('events.connections.txt-viewPCAP');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog},
      confirm: {text: t('txt-close'), handler: this.closeDialog}
    };

    return (
      <ModalDialog
        id='pcapModalDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayPCAPcontent()}
      </ModalDialog>
    )
  }
  /**
   * Get and set PCAP data
   * @method
   * @param {object} allValue - data of selected table row
   */
  getPCAPcontent = (allValue) => {
    const {baseUrl} = this.context;
    const {pcapData} = this.state;
    const projectID = allValue ? allValue.projectName : pcapData.projectID;
    const sessionID = allValue ? allValue.id : pcapData.sessionID;

    this.ah.one({
      url: `${baseUrl}/api/network/session/pcapContent?projectId=${projectID}&sessionId=${sessionID}&page=${pcapData.page}&pageSize=${pcapData.pageSize}`,
      type: 'GET'
    })
    .then(data => {
      if (data && !_.isEmpty(data.rows)) {
        let tempPcapData = {...pcapData};
        tempPcapData.projectID = projectID;
        tempPcapData.sessionID = sessionID;
        tempPcapData.origData = data.rows;
        tempPcapData.data = data.rows;
        tempPcapData.totalCount = data.counts;
        tempPcapData.activeIndex = null;
        tempPcapData.hex = '';

        this.setState({
          pcapData: tempPcapData,
          pcapOpen: true
        });
      } else {
        helper.showPopupMsg('', t('txt-pcapNotAvailable'), err.message);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.handleCloseMenu();
  }
  /**
   * Display delete tag content
   * @method
   * @param {string} id - ID of selected table row data
   * @returns HTML DOM
   */
  getDeleteTagContent = (id) => {
    if (id) {
      let tempTagData = {...this.state.tagData};
      tempTagData.id = id;

      this.setState({
        tagData: tempTagData
      });
    }

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}?</span>
      </div>
    )
  }
  /**
   * Open delete tag modal dialog
   * @method
   * @param {string} id - ID of selected table row data
   */
  deleteTagging = (id) => {
    PopupDialog.prompt({
      title: t('events.connections.txt-deleteTag'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteTagContent(id),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteTag();
        }
      }
    });

    this.handleCloseMenu();
  }
  /**
   * Handle delete tag confirm
   * @method
   */
  deleteTag = () => {
    const {baseUrl} = this.context;
    const {tagData} = this.state;

    if (!tagData.id) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/account/flow/session?id=${tagData.id}`,
      type: 'DELETE'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        this.clearTagData();
        this.resetDataTable();
      } else {
        helper.showPopupMsg('', t('txt-error'), err.message);
      }
      return null;
    });
  }
  /**
   * Handle add tag table menu
   * @method
   * @param {object} allValue - data of selected table row
   */
  addTagging = (allValue) => {
    let titleText = t('events.connections.txt-addTag');
    let tempTagData = {...this.state.tagData};

    if (allValue.tag) {
      titleText = t('events.connections.txt-editTag');
      tempTagData.id = allValue.tag.id;
      tempTagData.color = allValue.tag.color;
      tempTagData.memo = allValue.tag.memo;
    } else {
      tempTagData.projectID = allValue.projectName;
      tempTagData.sessionID = allValue.id;
    }

    tempTagData.modalTitle = titleText;

    this.setState({
      tagData: tempTagData,
      taggingOpen: true
    });

    this.handleCloseMenu();
  }
  /**
   * Handle value change for the add tagging form
   * @method
   * @param {object | string} event - event object
   */
  handleDataChange = (event) => {
    const value = event.target ? event.target.value : event.hex;
    let tempTagData = {...this.state.tagData};

    if (event.hex) {
      tempTagData.color = value.toUpperCase();
    } else {
      tempTagData.memo = value;
    }

    this.setState({
      tagData: tempTagData
    });
  }
  /**
   * Display add tagging content
   * @method
   * @returns HTML DOM
   */
  displayAddTagging = () => {
    const {tagData, formValidation} = this.state;
    const colorList = ['#B80000', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#004DCF', '#5300EB'];
    const memoText = t('txt-memo') + ' (' + t('txt-memoMaxLength') + ')';

    return (
      <div>
        <TextField
          id='tagMemo'
          className='tag-memo'
          label={memoText}
          multiline
          rows={4}
          maxLength={250}
          variant='outlined'
          fullWidth
          size='small'
          required
          error={!formValidation.memo.valid}
          helperText={formValidation.memo.valid ? '' : t('txt-required')}
          value={tagData.memo}
          onChange={this.handleDataChange} />
        <div className='group'>
          <label>{t('txt-color')}</label>
          <GithubPicker
            width='213px'
            colors={colorList}
            triangle='hide'
            onChangeComplete={this.handleDataChange} />
        </div>
        <div className='group'>
          <label>{t('txt-selected')}</label>
          <div className='color-box' className={'color-box ' + helper.showColor(tagData.color)}></div>
        </div>
      </div>
    )
  }
  /**
   * Display add tagging content in modal dialog
   * @method
   * @returns ModalDialog component
   */
  taggingDialog = () => {
    const {tagData} = this.state;
    const titleText = tagData.modalTitle;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog},
      confirm: {text: t('txt-confirm'), handler: this.handleAddTagging}
    };

    return (
      <ModalDialog
        id='tagModalDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayAddTagging()}
      </ModalDialog>
    )
  }
  /**
   * Handle add tagging confirm
   * @method
   */
  handleAddTagging = () => {
    const {baseUrl} = this.context;
    const {account, tagData, formValidation} = this.state;
    const url = `${baseUrl}/api/account/flow/session`;
    let requestData = {};
    let requestType = '';
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (tagData.memo) {
      tempFormValidation.memo.valid = true;
    } else {
      tempFormValidation.memo.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation  
    });

    if (!validate) {
      return;
    }

    if (tagData.color.indexOf('#') < 0) {
      tagData.color = '#' + tagData.color;
    }

    if (tagData.id) {
      requestData = {
        id: tagData.id,
        color: tagData.color,
        memo: tagData.memo
      };
      requestType = 'PATCH';
    } else {
      requestData = {
        accountId: account.id,
        projectId: tagData.projectID,
        sessionId: tagData.sessionID,
        color: tagData.color,
        memo: tagData.memo
      };
      requestType = 'POST';
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: requestType,
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.clearTagData();
        this.resetDataTable();
      } else {
        helper.showPopupMsg('', t('txt-error'), err.message);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle open image modal dialog in File events
   * @method
   * @param {string} value - image file data
   * @param {object} e - mouseClick events
   */
  openImageModal = (value) => (e) => {
    PopupDialog.alert({
      id: 'fileModal',
      confirmText: t('txt-close'),
      display: <img src={value} />
    });
  }
  /**
   * Handle open HTML modal dialog
   * @method
   * @param {string} value - HTML path
   */
  openHTMLModal = (value) => {
    const {baseUrl} = this.context;

    if (!value) {
      return;
    }

    ah.one({
      url: `${baseUrl}/api/network/html/reLinkFile?path=${value}`,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        PopupDialog.alert({
          id: 'fileModal',
          confirmText: t('txt-close'),
          display: <div dangerouslySetInnerHTML={{__html: data}} />
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
        this.loadAllFields();
      }
    });
  }
  /**
   * Handle chart type change for Connections events
   * @method
   * @param {object} event - event object
   * @param {string} type - events type ('connections', 'packets', or 'databytes')
   */
  handleChartChange = (event, type) => {
    if (!type) {
      return;
    }

    this.setState({
      connectionsChartType: type,
      tableMouseOver: false
    });
  }
  /**
   * Handle chart interval change for Connections events
   * @method
   * @param {object} event - event object
   * @param {string} type - interval type ('1m', '15m', '30m' or '60m')
   */
  handleIntervalChange = (event, type) => {
    if (!type) {
      return;
    }

    this.setState({
      connectionsInterval: type,
      tableMouseOver: false
    }, () => {
      this.loadConnections();
    });
  }
  /**
   * Handle show image only checkbox for File events
   * @method
   * @param {object} event - event object
   */
  handleShowImgCheckbox = (event) => {
    this.setState({
      showImgCheckbox: event.target.checked
    }, () => {
      this.loadSubSections(this.state.showImgCheckbox ? 'images' : '');
    });
  }
  /**
   * Handle display change radio for File events
   * @method
   * @param {object} event - event object
   */
  handleDisplayChange = (event) => {
    this.setState({
      displayType: event.target.value
    }, () => {
      this.loadSubSections(this.state.showImgCheckbox ? 'images' : '');
    });
  }
  /**
   * Check for File type and grid view
   * @method
   * @returns true/false boolean
   */
  fileImageGrid = () => {
    return (this.state.activeTab === 'file' && this.state.displayType === 'grid') ? true : false;
  }
  /**
   * Get default page size based on events type
   * @method
   * @returns true/false boolean
   */
  getPageSize = () => {
    const {pageSize, pageSizeGrid} = this.state;

    if (this.fileImageGrid()) {
      return pageSizeGrid;
    } else {
      return pageSize;
    }
  }
  /**
   * Handle content tab change
   * @method
   * @param {object} event - event object
   * @param {string} newTab - content type ('table', 'linkAnalysis' or 'worldMap')
   */
  handleSubTabChange = (event, newTab) => {
    const {activeTab} = this.state;

    if (newTab === 'worldMap') {
      this.loadWorldMap();

      this.setState({
        currentPage: 1,
        pageSizeMap: 500,
        tableMouseOver: false
      });
    } else {
      if (newTab === 'table') {
        this.setState({
          currentPage: 1,
          pageSize: 20
        }, () => {
          if (activeTab === 'connections') {
            this.loadConnections();
          } else {
            this.loadSubSections();
          }
        });
      } else if (newTab === 'linkAnalysis') {
        this.setState({
          currentPage: 1,
          pageSizeMap: 500
        }, () => {
          this.resetLinkAnalysis();
        });
      }

      this.setState({
        activeSubTab: newTab,
        tableMouseOver: false
      });
    }
  }
  /**
   * Display table data content for events type
   * @method
   * @returns events component
   */
  renderTabContent = () => {
    const {activeTab} = this.state;
    const mainContentData = {
      allTabData: ALL_TAB_DATA,
      projectID: this.state.projectID,
      activeTab,
      tableUniqueID: 'id',
      checkProjectID: true,
      tableMouseOver: this.state.tableMouseOver,
      subTabMenu: this.state.subTabMenu,
      activeSubTab: this.state.activeSubTab,
      handleSubTabChange: this.handleSubTabChange,
      currentTableID: this.state.currentTableID,
      queryData: this.state.queryData,
      eventsCount: this.state.eventsCount,
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
      handleTabChange: this.handleTabChange,
      treeTitle: t('events.connections.txt-top10text'),
      treeShowDropDown: true,
      treeData: this.state.treeData,
      treeSelect: this.selectTree,
      showTreeFilterBtn: this.showTreeFilterBtn,
      showImageValue: this.state.showImgCheckbox,
      handleShowImgCheckbox: this.handleShowImgCheckbox,
      displayImgType: this.state.displayType,
      handleDisplayChange: this.handleDisplayChange,
      openImageModal: this.openImageModal,
      dataTableData: this.state.subSectionsData.mainData[activeTab],
      dataTableFields: this.state.subSectionsData.fieldsData[activeTab],
      LAdata: this.state.subSectionsData.laData[activeTab],
      mapData: this.state.subSectionsData.mapData[activeTab],
      LAconfig: this.state.LAconfig,
      mainEventsData: this.state.mainEventsData,
      geoJson: this.state.geoJson,
      dataTableSort: this.state.sort,
      handleTableSort: this.handleTableSort,
      handleRowMouseOver: this.handleRowMouseOver,
      handleRowMouseOut: this.handleRowMouseOut,
      paginationTotalCount: this.state.subSectionsData.totalCount[activeTab],
      paginationPageSize: this.getPageSize(),
      paginationAlertPageSize: this.state.pageSizeMap,
      paginationCurrentPage: this.state.currentPage,
      paginationPageChange: this.handlePaginationChange,
      paginationDropDownChange: this.handlePageDropdown,
      paginationAlertPageChange: this.handleLargePageChange,
      paginationAlertDropDownChange: this.handleLargePageDropdown
    };

    if (activeTab === 'connections') {
      return (
        <Connections
          mainContentData={mainContentData}
          tabChartData={{
            sessionHistogram: this.state.sessionHistogram,
            packageHistogram: this.state.packageHistogram,
            byteHistogram: this.state.byteHistogram,
            chartTypeChange: this.handleChartChange,
            chartTypeValue: this.state.connectionsChartType,
            chartIntervalChange: this.handleIntervalChange,
            chartIntervalValue: this.state.connectionsInterval
          }}
          tableMouseOver={this.state.tableMouseOver} />
      )
    } else if (activeTab === 'dns') {
      return (
        <Dns
          mainContentData={mainContentData} />
      )
    } else if (activeTab === 'http') {
      return (
        <Http
          mainContentData={mainContentData} />
      )
    } else if (activeTab === 'html') {
      return (
        <Html
          mainContentData={mainContentData} />
      )
    } else if (activeTab === 'email') {
      return (
        <Email
          mainContentData={mainContentData} />
      )
    } else if (activeTab === 'file') {
      return (
        <File
          mainContentData={mainContentData} />
      )
    } else if (activeTab === 'cert') {
      return (
        <Certification
          mainContentData={mainContentData} />
      )
    } else if (activeTab === 'ftp') {
      return (
        <Ftp
          mainContentData={mainContentData} />
      )
    }
  }
  /**
   * Handle CSV download
   * @method
   */
  getCSVfile = () => {
    const {baseUrl, contextRoot} = this.context;
    const {projectID, activeTab, account} = this.state;
    const projectIDstring = this.getProjectURL(projectID);
    const type = activeTab === 'connections' ? 'session' : activeTab;
    const url = `${baseUrl}${contextRoot}/api/network/${type}/_export?${projectIDstring}`;
    let tempColumns = [];

    _.forEach(account.fields, val => {
      if (val !== 'alertRule' && val != '_tableMenu_') {
        tempColumns.push({
          [val]: f(`${activeTab}Fields.${val}`)
        });
      }
    })

    const dataOptions = {
      ...this.toQueryLanguage('csv'),
      columns: tempColumns
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
   * Clear memo tag data
   * @method
   */
  clearTagData = () => {
    const tagData = {
      id: '',
      projectID: '',
      sessionID: '',
      modalTitle: '',
      color: '#FCCB00',
      memo: ''
    };

    this.setState({
      tagData
    });
  }
  /**
   * Clear PCAP data
   * @method
   */
  clearPcapData = () => {
    const pcapData = {
      projectID: '',
      sessionID: '',
      data: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      activeIndex: null,
      hex: ''
    };

    this.setState({
      pcapData
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
      queryData: tempQueryData
    });
  }
  /**
   * Reset subSections data
   * @method
   */
  clearData = () => {
    const subSectionsData = {
      mainData: {
        connections: null,
        dns: null,
        http: null,
        html: null,
        email: null,
        file: null,
        cert: null,
        ftp: null
      },
      fieldsData: {
        connections: {},
        dns: {},
        http: {},
        html: {},
        email: {},
        file: {},
        cert: {},
        ftp: {}
      },
      laData: {
        connections: []
      },
      mapData: {
        connections: []
      },
      tableColumns: {},
      totalCount: {
        connections: 0,
        dns: 0,
        http: 0,
        html: 0,
        email: 0,
        file: 0,
        cert: 0,
        ftp: 0
      }
    };

    this.setState({
      subSectionsData
    }, () => {
      this.loadAllFields();
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
      taggingOpen,
      filterData,
      pcapOpen,
      showChart,
      showFilter,
      netflowContextAnchor,
      currentNetflowData,
      queryContextAnchor,
      currentQueryField,
      currentQueryValue
    } = this.state;
    let filterDataCount = 0;

    _.forEach(filterData, val => {
      if (val.query) {
        filterDataCount++;
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

        {taggingOpen &&
          this.taggingDialog()
        }

        {pcapOpen &&
          this.pcapDialog()
        }

        <Menu
          anchorEl={netflowContextAnchor}
          keepMounted
          open={Boolean(netflowContextAnchor)}
          onClose={this.handleCloseMenu}>
          {activeTab === 'connections' &&
            <MenuItem onClick={this.pcapDownloadFile.bind(this, currentNetflowData)}>{t('events.connections.txt-downloadPCAP')}</MenuItem>
          }
          {activeTab === 'connections' &&
            <MenuItem onClick={this.getPCAPcontent.bind(this, currentNetflowData)}>{t('events.connections.txt-viewPCAP')}</MenuItem>
          }
          <MenuItem onClick={this.showTableData.bind(this, currentNetflowData)}>{t('events.connections.txt-fieldsSettings')}</MenuItem>
          <MenuItem onClick={this.showJsonData.bind(this, currentNetflowData)}>{t('txt-viewJSON')}</MenuItem>
          {currentNetflowData.tag &&
            <MenuItem onClick={this.addTagging.bind(this, currentNetflowData)}>{t('events.connections.txt-editTag')}</MenuItem>
          }
          {currentNetflowData.tag &&
            <MenuItem onClick={this.deleteTagging.bind(this, currentNetflowData.tag.id)}>{t('events.connections.txt-deleteTag')}</MenuItem>
          }
          {!currentNetflowData.tag && !currentNetflowData.vpnName &&
            <MenuItem onClick={this.addTagging.bind(this, currentNetflowData)}>{t('events.connections.txt-addTag')}</MenuItem>
          }
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
          {helper.getEventsMenu('netflow')}

          <div className='secondary-btn-group right'>
            <Button variant='outlined' color='primary' className={cx({'active': showFilter})} onClick={this.toggleFilter} title={t('events.connections.txt-toggleFilter')}><i className='fg fg-filter'></i><span>({filterDataCount})</span></Button>
            <Button variant='outlined' color='primary' className={cx({'active': showChart})} onClick={this.toggleChart} disabled={activeTab !== 'connections'} title={t('events.connections.txt-toggleChart')}><i className='fg fg-chart-columns'></i></Button>
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

Netflow.contextType = BaseDataContext;

Netflow.propTypes = {
  searchFields: PropTypes.object.isRequired
};

export default withRouter(Netflow);