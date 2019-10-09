import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'
import queryString from 'query-string'

import WORLDMAP from '../../../mock/world-map-low.json'

import {config as configLoader} from 'vbda-ui/build/src/loader'
import {analyze} from 'vbda-ui/build/src/analyzer'

import Checkbox from 'react-ui/build/src/components/checkbox'
import ContextMenu from 'react-ui/build/src/components/contextmenu'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PageNav from 'react-ui/build/src/components/page-nav'
import Popover from 'react-ui/build/src/components/popover'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Textarea from 'react-ui/build/src/components/textarea'

import JSONTree from 'react-json-tree'
import {GithubPicker} from 'react-color';
import {arrayMove} from 'react-sortable-hoc'

import helper from '../../common/helper'
import {HocQueryOpenSave as QueryOpenSave} from '../../common/query-open-save'
import {HocSearchOptions as SearchOptions} from '../../common/search-options'
import {HocSortableList as SortableList} from '../../common/sortable-list'
import {HocTableCell as TableCell} from '../../common/table-cell'
import withLocale from '../../../hoc/locale-provider'

import Certification from './tabs/certification'
import Connections from './tabs/connections'
import Dns from './tabs/dns'
import Email from './tabs/email'
import File from './tabs/file'
import Ftp from './tabs/ftp'
import Html from './tabs/html'
import Http from './tabs/http'

import {downloadWithForm} from 'react-ui/build/src/utils/download'
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

class Netflow extends Component {
  constructor(props) {
    super(props);

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    et = chewbaccaI18n.getFixedT(null, 'errors');

    this.state = {
      projectID: '',
      activeTab: 'connections',
      //General
      datetime: {
        from: helper.getSubstractDate(1, 'hour'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
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
      treeData: {},
      currentTreeName: '',
      //Tab Menu
      subTabMenu: {
        //statistics: t('txt-statistics'),
        table: t('txt-table'),
        linkAnalysis: t('txt-linkAnalysis'),
        worldMap: t('txt-map')
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
      //Events count
      eventsCount: {},
      //Connections
      connectionsChartType: 'connections',
      connectionsInterval: '1m',
      sessionHistogram: {},
      packageHistogram: {},
      byteHistogram: {},
      filterData: [{
        condition: 'Must',
        query: ''
      }],
      //Sub sections
      subSectionsData: {
        mainData: {
          connections: [],
          dns: [],
          http: [],
          html: [],
          email: [],
          file: [],
          cert: [],
          ftp: []
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
        activeIndex: '',
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
      urlParams: {}
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {session} = this.props;
    const {datetime, filterData, account} = this.state;
    let tempDatetime = {...datetime};
    let tempFilterData = {...filterData};
    let tempAccount = {...account};
    let urlParams = queryString.parse(location.search);

    if (session.accountId) {
      tempAccount.id = session.accountId;
      tempAccount.login = true;

      if (!_.isEmpty(urlParams)) {
        let ip = '';

        tempDatetime = {
          from: helper.getSubstractDate(30, 'minutes', urlParams.eventDttm),
          to: helper.getAdditionDate(30, 'minutes', urlParams.eventDttm)
        };

        if (urlParams.srcIp) {
          ip = 'ipSrc: ' + urlParams.srcIp;
        } else if (urlParams.destIp) {
          ip = 'ipDst: ' + urlParams.destIp;
        }

        tempFilterData = [{
          condition: 'Must',
          query: ip
        }];
        urlParams = _.omit(urlParams, ['lng']);

        this.setState({
          datetime: tempDatetime,
          filterData: tempFilterData,
          account: tempAccount,
          showFilter: true,
          urlParams
        }, () => {
          this.initialLoad();
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
  initialLoad = () => {
    this.getLAconfig();
    this.getSavedQuery();
    this.getProjectId();
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
  getProjectId = () => {
    const {baseUrl} = this.props;
    const url = `${baseUrl}/api/agent/_search`;
    const agentData = {
      pageSize: 10000
    };

    helper.getAjaxData('POST', url, agentData)
    .then(data => {
      if (data.counts === 0) {
        helper.showPopupMsg(t('events.connections.txt-addAgentMsg'), '', '', '', 'agent');
      } else {
        const projectID = data.rows.map(tempData => {
          return tempData.projectId;
        });

        this.setState({
          projectID
        }, () => {
          this.loadAllFields();
        });
      }
      return null;
    });
  }
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
  loadEventsCount = (options) => {
    const {baseUrl} = this.props;
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

    this.ah.all(apiArr)
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
        }, () => {
          if (options === 'loadFields') {
            this.loadFields(activeTab);
          } else {
            if (activeTab === 'connections') {
              this.loadActiveSubTab(options);
            } else {
              this.loadSubSections(options);
            }
          }
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  loadFields = (activeTab, options, fromSearch) => {
    const {baseUrl} = this.props;
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
        this.loadFields(activeTab, 'showDefault', fromSearch);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  loadActiveSubTab = (options) => {
    const {activeTab, activeSubTab} = this.state;

    if (activeSubTab === 'statistics') {
      //this.loadStatistics();
    } else if (activeSubTab === 'table') {
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
  checkDisplayFields = (field) => {
    if (_.includes(this.state.account.fields, field) || field === '_tableMenu_') {
      return true;
    }
    return false;
  }
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
  handleTabChange = (newTab, oldTab) => {
    const activeTab = newTab;
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

    if (this.state.activeTab === newTab) {
      return;
    }

    if (activeTab === 'connections') {
      subTabMenu = {
        //statistics: t('txt-statistics'),
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
        condition: 'Must',
        query: ''
      }];
    }

    tempSubSectionsData.mainData = {
      connections: [],
      dns: [],
      http: [],
      html: [],
      email: [],
      file: [],
      cert: [],
      ftp: [],
      logs: []
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
      treeData: {},
      showImgCheckbox: false,
      displayType: 'list',
      showChart: false,
      tableMouseOver: false
    }, () => {
      this.loadFields(activeTab, 'noCount');
    });
  }
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
  checkSortable = (field) => {
    const unSortableFields = ['_tableMenu_', 'base64', 'filePath', 'controlText', 'htmlRelinkPath', 'body', 'requestRawHeader', 'responseRawHeader', 'uploadData', 'dnsho'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  loadConnections = (options) => {
    const {baseUrl, contextRoot} = this.props;
    const {projectID, connectionsInterval, currentPage, oldPage, pageSize, subSectionsData, account} = this.state;
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
      if (currentPage > 1 && !data[0]) {
        helper.showPopupMsg('', t('txt-error'), t('events.connections.txt-maxDataMsg'));

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
                  <button onClick={this.handleRowContextMenu.bind(this, allValue)}><i className='fg fg-more'></i></button>
                </div>
              )
            }
            if (tempData === 'firstPacket' || tempData === 'lastPacket' || tempData === '_eventDttm_') {
              value = helper.getFormattedDate(value, 'local');
            }
            return (
              <TableCell
                baseUrl={baseUrl}
                contextRoot={contextRoot}
                fieldValue={value}
                fieldName={tempData}
                allValue={allValue}
                showQueryOptions={this.showQueryOptions} />
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
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  loadSubSections = (options) => {
    const {baseUrl, contextRoot} = this.props;
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
      if (currentPage > 1 && data[0].rows.length === 0) {
        helper.showPopupMsg('', t('txt-error'), t('events.connections.txt-maxDataMsg'));

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
                  <button onClick={this.handleRowContextMenu.bind(this, allValue)}><i className='fg fg-more'></i></button>
                </div>
              )
            }
            if (tempData === 'base64' && value) {
              if (value.indexOf('data:image/') >= 0) {
                return <img src={value} className='file-image' onClick={this.openImageModal(value)} />;
              }
            } else if (tempData === 'filePath') {
              return <a href={baseUrl + contextRoot + '/api/network/file?path=' + value} download>{value}</a>;
            } else if (tempData === 'controlText') {
              return <span title={value} onClick={this.showQueryOptions(tempData, value)}>{value.substr(0, 50) + '...'}</span>
            } else if (tempData === 'htmlRelinkPath') {
              return <span onClick={this.openHTMLModal.bind(this, value)}>{value}</span>;
            } else {
              if (tempData === 'firstPacket' || tempData === 'lastPacket' || tempData === '_eventDttm_') {
                value = helper.getFormattedDate(value, 'local');
              }
              return (
                <TableCell
                  baseUrl={baseUrl}
                  contextRoot={contextRoot}
                  activeTab={activeTab}
                  fieldValue={value}
                  fieldName={tempData}
                  allValue={allValue}
                  showQueryOptions={this.showQueryOptions} />
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
      });

      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
    const {activeTab, projectID, currentPage, pageSizeMap, subSectionsData, LAconfig} = this.state;
    const projectIDstring = this.getProjectURL(projectID); 
    const setPage = options === 'search' ? 1 : currentPage;
    const url = `${baseUrl}/api/network/session/la/_search?${projectIDstring}&page=${setPage}&pageSize=${pageSizeMap}`;
    const requestData = this.toQueryLanguage(options);
    let tempSubSectionsData = {...subSectionsData};
    let mainEventsData = {};

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
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
    });
  }
  loadWorldMap = (options) => {
    const {baseUrl, contextRoot} = this.props;
    const {activeTab, projectID, datetime, subSectionsData, currentPage, pageSizeMap} = this.state;
    const projectIDstring = this.getProjectURL(projectID);
    const setPage = options === 'search' ? 1 : currentPage;
    const url = `${baseUrl}/api/network/session/map/_search?${projectIDstring}&page=${setPage}&pageSize=${pageSizeMap}`;
    const requestData = this.toQueryLanguage();
    let tempSubSectionsData = {...subSectionsData};

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
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
    });
  }
  getWorldMap = () => {
    const {activeTab, geoJson, subSectionsData} = this.state;

    this.setState({
      activeSubTab: 'worldMap',
      geoJson: helper.getWorldMap(WORLDMAP, geoJson, subSectionsData.mapData[activeTab])
    });
  }
  toQueryLanguage = (options) => {
    const {datetime, sort, filterData} = this.state;
    const timeAttribute = 'lastPacket';
    let time = {};
    let dateFrom = datetime.from;
    let dateTo = datetime.to;
    let dateTime = {};
    let dataObj = {};
    let filterDataArr = [];
    let sortObj = {};

    dateTime = {
      from: Moment(dateFrom).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: Moment(dateTo).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };

    time[timeAttribute] = {
      op: 'BETWEEN',
      arg: [dateTime.from, dateTime.to]
    };

    if (options === 'time') {
      return time;
    }

    dataObj[timeAttribute] = time[timeAttribute];
    sortObj[sort.field] = sort.desc ? 'desc' : 'asc';

    if (options === 'images') {
      dataObj['detectedType'] = {
        op: 'LIKE',
        arg: 'image'
      };
    } else {
      if (filterData.length > 0) {
        filterDataArr = helper.buildFilterDataArray(filterData);
      }
    }

    if (filterDataArr.length > 0) {
      dataObj['filter'] = filterDataArr;
    }

    const dataOptions = {
      query: dataObj,
      sort: [sortObj]
    };

    return dataOptions;
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
            })

            totalHostCount += hostCount;

            label = <span title={key3}>{key3} ({hostCount}) <button className={cx('button', {'active': currentTreeName === key3})} onClick={this.selectTree.bind(this, key3, 'dstHostname')}>{t('events.connections.txt-addFilter')}</button></span>;

            tempChild.push({
              id: key3,
              label
            });
          })
        })

        if (key === 'unknown') { //Add an export button for Unknown service
          label = <span title={key}>{key} ({totalHostCount}) <button className='button active' onClick={this.handleTreeExport}>{t('txt-export')}</button> <button className={cx('button', {'active': currentTreeName === key})} onClick={this.selectTree.bind(this, key, 'dstSvcname')}>{t('events.connections.txt-addFilter')}</button></span>;
        } else {
          let formattedKey = key;

          if (key.length > 25) {
            formattedKey = key.substr(0, 28) + '...';
          }
          label = <span title={key}>{formattedKey} ({totalHostCount}) <button className={cx('button', {'active': currentTreeName === key})} onClick={this.selectTree.bind(this, key, 'dstSvcname')}>{t('events.connections.txt-addFilter')}</button></span>;
        }

        let treeProperty = {
          id: key,
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
  handleTreeExport = () => {
    const {baseUrl, contextRoot} = this.props;
    const {projectID, activeTab} = this.state;
    const type = activeTab === 'connections' ? 'session' : activeTab;
    const projectIDstring = this.getProjectURL(projectID);
    const url = `${baseUrl}${contextRoot}/api/network/${type}/service/unknown/_export?${projectIDstring}`;
    const dataOptions = {
      ...this.toQueryLanguage()
    };

    downloadWithForm(url, {payload: JSON.stringify(dataOptions)});
  }
  handleSearchSubmit = (fromSearch) => {
    const {activeTab, subSectionsData} = this.state;
    let tempSubSectionsData = {...subSectionsData};
    tempSubSectionsData.mainData[activeTab] = [];

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
        this.resetLinkAnalysis();
      } else if (type === 'map') {
        this.loadWorldMap();
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
      } else if (type === 'map') {
        this.loadWorldMap();
      }
    });
  }
  handlePageChange = (currentPage) => {
    const {activeTab, showImgCheckbox} = this.state;

    this.setState({
      currentPage
    }, () => {
      if (activeTab === 'connections') {
        this.loadConnections();
      } else {
        this.loadSubSections(showImgCheckbox ? 'images' : '');
      }
    });
  }
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
  handleTableSort = (value) => {
    const {sort} = this.state;
    let tempSort = {...sort};
    tempSort.field = value.field;
    tempSort.desc = !sort.desc;

    this.setState({
      sort: tempSort
    }, () => {
      this.loadSection();
    });
  }
  selectTree = (value, field) => {
    this.setState({
      loadNetflowData: false
    }, () => {
      this.addSearch(field, value, 'Must');
    });
  }
  pcapDownloadFile = (value) => {
    const {baseUrl} = this.props;
    const projectId = value.projectName;
    const url = `${baseUrl}/api/network/session/pcapFile`;
    const data = {
      ro : (value.id || value.sessionId),
      _id : '',
      projectId : projectId
    };

    this.getPcapFile(url, data);
  }
  getPcapFile = (url, data) => {
    helper.getAjaxData('POST', url, data)
    .then(data => {
      if (data.ResultMessage === 'fail') {
        helper.showPopupMsg(t('txt-pcapDownloadFail'), t('txt-error'), data.ErrorMessage);
      } else {
        window.location.assign(data.PcapFilelink);
      }
    });
  }
  forwardSyslog = (allValue) => {
    const {baseUrl, contextRoot} = this.props;
    window.location.href = `${baseUrl}${contextRoot}/syslog?ipSrc=${allValue.ipSrc}`;
  }
  handleRowMouseOver = (id, allValue, evt) => {
    const {activeTab, subSectionsData} = this.state;
    let tempSubSectionsData = {...subSectionsData};
    tempSubSectionsData.mainData[activeTab] = _.map(tempSubSectionsData.mainData[activeTab], item => {
      return {
        ...item,
        _tableMenu_: allValue.id === item.id ? true : false
      }
    });

    this.setState({
      subSectionsData: tempSubSectionsData,
      tableMouseOver: true
    });

    if (allValue.tag && allValue.tag.memo) {
      Popover.openId(
        'popup-id',
        evt,
        allValue.tag.memo
      )
    }
  }
  handleRowMouseOut = (id, allValue, evt) => {
    Popover.closeId('popup-id')
  }
  handleRowContextMenu = (allValue, evt) => {
    this.handleRowMouseOut();

    const {activeTab} = this.state;
    const id = allValue.id;
    let menuItems = [];

    menuItems = [
      {
        id: id + 'Table',
        text: t('events.connections.txt-fieldsSettings'),
        action: () => this.showTableData(allValue)
      },
      {
        id: id + 'Json',
        text: t('events.connections.txt-viewJSON'),
        action: () => this.viewJsonData(allValue)
      }
    ];

    if (activeTab === 'connections') {
      menuItems.unshift(
        {
          id: id + 'downloadPCAP',
          text: t('events.connections.txt-downloadPCAP'),
          action: () => this.pcapDownloadFile(allValue)
        },
        {
          id: id + 'viewPCAP',
          text: t('events.connections.txt-viewPCAP'),
          action: () => this.getPCAPcontent(allValue)
        }
      );

      menuItems.push(
        {
          id: id + 'viewADrecord',
          text: t('events.connections.txt-viewADrecord'),
          action: () => this.forwardSyslog(allValue)
        }
      );
    }

    if (allValue.tag) {
      menuItems.push(
        {
          id: id + 'EditTag',
          text: t('events.connections.txt-editTag'),
          action: () => this.addTagging(allValue)
        },
        {
          id: id + 'DeleteTag',
          text: t('events.connections.txt-deleteTag'),
          action: () => this.removeTagging(allValue.tag.id)
        }
      );
    } else {
      if (allValue.vpnName) { //Disable the Add Tagging for Honeypot
        menuItems.push(
          {
            className: 'disabled-tag-menu',
            text: t('events.connections.txt-addTag'),
            action: () => { return; }
          }
        );
      } else {
        menuItems.push(
          {
            id: id + 'AddTag',
            text: t('events.connections.txt-addTag'),
            action: () => this.addTagging(allValue)
          }
        );
      }
    }

    ContextMenu.open(evt, menuItems, 'networkViewMenu');
    evt.stopPropagation();
  }
  showQueryOptions = (field, value) => (e) => {
    const menuItems = [
      {
        id: value + '_Must',
        text: 'Must',
        action: () => this.addSearch(field, value, 'Must')
      },
      {
        id: value + '_MustNot',
        text: 'Must Not',
        action: () => this.addSearch(field, value, 'Must Not')
      },
      {
        id: value + '_Either',
        text: 'Either',
        action: () => this.addSearch(field, value, 'Either')
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
    const {account} = this.state;
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
          showQueryOptions={this.showQueryOptions}
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
      saveQueryOpen: false,
      taggingOpen: false,
      pcapOpen: false
    }, () => {
      this.clearTagData();
      this.clearPcapData();
      this.clearQueryData();
    });
  }
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
  modalDialog = () => {
    const {activeTab} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog},
      confirm: {text: t('txt-confirm'), handler: this.resetDataTable.bind(this, 'setFields')}
    };
    const titleText = ALL_TAB_DATA[activeTab] + ' ' + t('txt-table');

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

        {currentLength > 1 &&
          <div className='pagination json'>
            <div className='buttons'>
              <button onClick={this.viewJsonData.bind(this, 'previous')} disabled={currentTableIndex === 0}>{t('txt-previous')}</button>
              <button onClick={this.viewJsonData.bind(this, 'next')} disabled={currentTableIndex + 1 == currentLength}>{t('txt-next')}</button>
            </div>
            <span className='count'>{currentTableIndex + 1} / {currentLength}</span>
          </div>
        }
      </div>
    )
  }
  viewJsonData = (allValue) => {
    const {activeTab} = this.state;
    const newData = this.handleDialogNavigation(allValue);
    const currentTableIndex = newData.tableRowIndex;
    const title = ALL_TAB_DATA[activeTab] + ' JSON';
    allValue = newData.allValue;

    this.setState({
      currentTableIndex,
      currentTableID: allValue.id
    }, () => {
      PopupDialog.alert({
        title,
        id: 'modalWindow',
        confirmText: t('txt-close'),
        display: this.displayJsonData(allValue),
        act: (confirmed, data) => {
        }
      });
    });
  }
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
  setPCAPpage = (currentPage) => {
    let tempPcapData = {...this.state.pcapData};
    tempPcapData.page = currentPage;
    tempPcapData.filterEmpty = false;

    this.setState({
      pcapData: tempPcapData
    }, () => {
      this.getPCAPcontent();
    });
  }
  toggleFilterEmpty = () => {
    const {pcapData} = this.state;
    let tempPcapData = {...pcapData};
    tempPcapData.activeIndex = '';
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
              onChange={this.toggleFilterEmpty}
              checked={pcapData.filterEmpty} />
          </div>
        }
        <div className='pcap'>
          <div className='list'>
            <ul>
              {
                pcapData.data.map((key, i) => {
                  return <li id={key} key={i} className={cx({'active': key.hex})} onClick={this.setPCAPhex.bind(this, key.hex, i)}>{key.protocol}<i className={cx('fg', {'fg-arrow-left': pcapData.activeIndex === i})}></i></li>
                })
              }
            </ul>
          </div>
          <div className='data'>
            {str &&
              <Textarea value={str} readOnly={true} />
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
  pcapDialog = () => {
    const titleText = t('events.connections.txt-viewPCAP');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog},
      confirm: {text: t('txt-confirm'), handler: this.closeDialog}
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
  getPCAPcontent = (allValue) => {
    const {baseUrl} = this.props;
    const {pcapData} = this.state;
    const projectID = allValue ? allValue.projectName : pcapData.projectID;
    const sessionID = allValue ? allValue.id : pcapData.sessionID;
    const url = `${baseUrl}/api/network/session/pcapContent?projectId=${projectID}&sessionId=${sessionID}&page=${pcapData.page}&pageSize=${pcapData.pageSize}`;

    this.ah.one({
      url,
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
        tempPcapData.activeIndex = '';
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
  }
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
  removeTagging = (id) => {
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
  }
  deleteTag = () => {
    const {baseUrl} = this.props;
    const {tagData} = this.state;
    const url = `${baseUrl}/api/account/flow/session?id=${tagData.id}`;

    this.ah.one({
      url,
      type: 'DELETE'
    })
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
  }
  handleDataChange = (val) => {
    let tempTagData = {...this.state.tagData};

    if (val.hex) {
      tempTagData.color = val.hex.toUpperCase();
    } else if (val) {
      tempTagData.memo = val;
    }

    this.setState({
      tagData: tempTagData
    });
  }
  displayAddTagging = () => {
    const {tagData} = this.state;
    const colorList = ['#B80000', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#004DCF', '#5300EB'];

    return (
      <div>
        <label htmlFor='tagMemo'>{t('txt-memo')} ({t('txt-memoMaxLength')})</label>
        <Textarea
          id='tagMemo'
          className='add'
          rows={4}
          maxLength={250}
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
          <label>{t('txt-select')}</label>
          <div className='color-box' className={'color-box ' + helper.showColor(tagData.color)}></div>
        </div>
      </div>
    )
  }
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
  handleAddTagging = () => {
    const {baseUrl} = this.props;
    const {account, tagData} = this.state;
    const url = `${baseUrl}/api/account/flow/session`;
    let data = {};
    let requestType = 'POST';

    if (tagData.color.indexOf('#') < 0) {
      tagData.color = '#' + tagData.color;
    }

    if (tagData.id) {
      data = {
        id: tagData.id,
        color: tagData.color,
        memo: tagData.memo
      };
      requestType = 'PATCH';
    } else {
      data = {
        accountId: account.id,
        projectId: tagData.projectID,
        sessionId: tagData.sessionID,
        color: tagData.color,
        memo: tagData.memo
      };
    }

    helper.getAjaxData(requestType, url, data)
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
  openImageModal = (value) => (e) => {
    PopupDialog.alert({
      id: 'fileModal',
      confirmText: t('txt-close'),
      display: <img src={value} />
    });
  }
  openHTMLModal = (value) => {
    const {baseUrl} = this.props;
    const url = `${baseUrl}/api/network/html/reLinkFile?path=${value}`;

    ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      PopupDialog.alert({
        id: 'fileModal',
        confirmText: t('txt-close'),
        display: <div dangerouslySetInnerHTML={{__html: data}} />
      });

      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleDateChange = (datetime, refresh) => {
    this.setState({
      datetime
    }, () => {
      if (refresh === 'refresh') {
        this.loadAllFields();
      }
    });
  }
  handleChartChange = (connectionsChartType) => {
    this.setState({
      connectionsChartType,
      tableMouseOver: false
    });
  }
  handleIntervalChange = (connectionsInterval) => {
    this.setState({
      connectionsInterval,
      tableMouseOver: false
    }, () => {
      this.loadConnections();
    });
  }
  handleShowImgCheckbox = (showImgCheckbox) => {
    this.setState({
      showImgCheckbox
    }, () => {
      this.loadSubSections(this.state.showImgCheckbox ? 'images' : '');
    });
  }
  handleDisplayChange = (displayType) => {
    this.setState({
      displayType
    }, () => {
      this.loadSubSections(this.state.showImgCheckbox ? 'images' : '');
    });
  }
  fileImageGrid = () => {
    return (this.state.activeTab === 'file' && this.state.displayType === 'grid') ? true : false;
  }
  getPageSize = () => {
    const {pageSize, pageSizeGrid, pageSizeMap} = this.state;
    const isFileGrid =  this.fileImageGrid();

    if (isFileGrid) {
      return pageSizeGrid;
    } else {
      return pageSize;
    }
  }
  getTabChartData = () => {
    return {
      sessionHistogram: this.state.sessionHistogram,
      packageHistogram: this.state.packageHistogram,
      byteHistogram: this.state.byteHistogram,
      chartTypeChange: this.handleChartChange,
      chartTypeValue: this.state.connectionsChartType,
      chartIntervalChange: this.handleIntervalChange,
      chartIntervalValue: this.state.connectionsInterval
    };
  }
  handleSubTabChange = (newTab) => {
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
  renderTabContent = () => {
    const {baseUrl, contextRoot, language, searchFields} = this.props;
    const {activeTab, tableMouseOver} = this.state;
    const mainContentData = {
      allTabData: ALL_TAB_DATA,
      searchFields,
      activeTab,
      tableMouseOver,
      tableUniqueID: 'id',
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
      showFilterBtn: this.showFilterBtn,
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
      paginationPageChange: this.handlePageChange,
      paginationDropDownChange: this.handlePageDropdown,
      paginationAlertPageChange: this.handleLargePageChange,
      paginationAlertDropDownChange: this.handleLargePageDropdown
    };

    if (activeTab === 'connections') {
      return (
        <Connections
          contextRoot={contextRoot}
          baseUrl={baseUrl}
          mainContentData={mainContentData}
          tabChartData={this.getTabChartData()}
          tableMouseOver={tableMouseOver} />
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
  getCSVfile = () => {
    const {baseUrl, contextRoot} = this.props;
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
      ...this.toQueryLanguage(),
      columns: tempColumns
    };

    downloadWithForm(url, {payload: JSON.stringify(dataOptions)});
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
  clearPcapData = () => {
    const pcapData = {
      projectID: '',
      sessionID: '',
      data: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      activeIndex: '',
      hex: ''
    };

    this.setState({
      pcapData
    });
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
    const subSectionsData = {
      mainData: {
        connections: [],
        dns: [],
        http: [],
        html: [],
        email: [],
        file: [],
        cert: [],
        ftp: []
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
    const {session} = this.props;
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
      showFilter
    } = this.state;
    let sessionRights = {};
    let filterDataCount = 0;

    _.forEach(session.rights, val => {
      sessionRights[val] = true;
    })

    _.forEach(filterData, val => {
      if (val.query) {
        filterDataCount++;
      }
    })

    if (!sessionRights.Module_FlowAnalysis_Manage) {
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

        {taggingOpen &&
          this.taggingDialog()
        }

        {pcapOpen &&
          this.pcapDialog()
        }

        <div className='sub-header'>
          {helper.getEventsMenu('netflow', sessionRights)}

          <SearchOptions
            page='netflow'
            datetime={datetime}
            searchInput={searchInput}
            showFilter={showFilter}
            setSearchData={this.setSearchData}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.handleSearchSubmit} />

          <div className='secondary-btn-group right'>
            <button className={cx({'active': showFilter})} onClick={this.toggleFilter} title={t('events.connections.txt-toggleFilter')}><i className='fg fg-filter'></i><span>({filterDataCount})</span></button>
            <button className={cx({'active': showChart})} onClick={this.toggleChart} disabled={activeTab !== 'connections'} title={t('events.connections.txt-toggleChart')}><i className='fg fg-chart-columns'></i></button>
            <button className='last' onClick={this.getCSVfile} title={t('events.connections.txt-exportCSV')}><i className='fg fg-data-download'></i></button>
          </div>
        </div>

        {this.renderTabContent()}
      </div>
    )
  }
}

Netflow.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  searchFields: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};

const HocNetflowController = withRouter(withLocale(Netflow));
export { Netflow, HocNetflowController };