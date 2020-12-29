import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { NavLink, Link, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import moment from 'moment'
import cx from 'classnames'

import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardDateTimePicker } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import 'moment/locale/zh-tw';

import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Switch from '@material-ui/core/Switch';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';

import {downloadWithForm} from 'react-ui/build/src/utils/download'
import Gis from 'react-gis/build/src/components'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import helper from '../../common/helper'
import ManageGroup from '../../common/manage-group'
import TableContent from '../../common/table-content'
import WORLDMAP from '../../../mock/world-map-low.json'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SERVICE_TYPE_LIST = {
  'NETTRAP': ['lastAlertDataUpdDT', 'lastStatusUpdDT', 'attackCnt'],
  'IPS-NETPROBE': ['lastAlertDataUpdDT', 'lastStatusUpdDT', 'threatIntellLastUpdDT', 'rx_pkts', 'tx_pkts', 'attackCnt'],
  'NETFLOW-IDS-SURICATA': ['lastAlertDataUpdDT', 'lastStatusUpdDT', 'threatIntellLastUpdDT', 'lastStatus', 'agentMode', 'TCPDUMP'],
  'IDS-SURICATA': ['lastAlertDataUpdDT', 'lastStatusUpdDT', 'threatIntellLastUpdDT'],
  'NETTRAP-DN': ['lastAlertDataUpdDT', 'lastStatusUpdDT', 'threatIntellLastUpdDT', 'attackCnt'],
  'IDS-NETPROBE': ['lastAlertDataUpdDT', 'lastStatusUpdDT', 'threatIntellLastUpdDT', 'rx_pkts', 'tx_pkts', 'attackCnt']
};

let t = null;
let f = null;
let et = null;

/**
 * Edge
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Config Edge page
 */
class Edge extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');

    this.state = {
      activeTab: 'edge', //edge, geography
      activeContent: 'tableList', //tableList, viewEdge, editEdge
      showFilter: false,
      openManageGroupDialog: false,
      allGroupList: [],
      currentEdgeData: '',
      serviceType: [],
      edgeSearch: {
        keyword: '',
        groups: [],
        serviceType: 'all',
        connectionStatus: 'all'
      },
      originalEdgeData: {},
      edge: {
        dataFieldsArr: ['agentName', 'groupList', 'ipPort', 'serviceType', 'descriptionEdge', '_menu'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'agentName',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        info: {}
      },
      upgradeCheckbox: false,
      syncEnable: true,
      geoJson: {
        mapDataArr: [],
        edgeDataArr: []
      },
      formValidation: {
        edgeName: {
          valid: true
        },
        longitude: {
          valid: true
        },
        latitude: {
          valid: true
        }
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.getGroupList();
    this.getEdgeServiceType();
    this.getEdgeData();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state === 'tableList') {
      this.toggleContent('tableList');
    }
  }
  /**
   * Get and set group list
   * @method
   */
  getGroupList = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/edge/groups`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        this.setState({
          allGroupList: data.rows
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get Edge service type for filter dropdown
   * @method
   */
  getEdgeServiceType = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/edge/serviceType`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const serviceType = _.map(data, (val, i) => {
          return <MenuItem key={i} value={val}>{val}</MenuItem>
        });

        this.setState({
          serviceType
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get individual service description
   * @method
   * @param {object} allValue - Edge data
   * @param {string} val - service desc type
   * @param {number} i - index of the service desc
   * @returns HTML DOM
   */
  getIndividualDesc = (allValue, val, i) => {
    const descHeader = f('edgeFields.txt-' + val);

    if (val === 'attackCnt') {
      if (allValue.honeyPotHostDTO) {
        return <li key={val}><span className='header'>{descHeader}:</span> {allValue.honeyPotHostDTO[val]}</li>
      }
    } else if (val === 'lastAlertDataUpdDT' || val === 'lastStatusUpdDT' || val === 'threatIntellLastUpdDT') {
      return <li key={val}><span className='header'>{descHeader}:</span> {helper.getFormattedDate(allValue[val], 'local')}</li>
    } else if (val === 'TCPDUMP') {
      if (allValue.agentMode === 'TCPDUMP') {
        return (
          <section key={val}>
            {allValue.agentStartDT &&
              <li><span className='header'>{t('txt-start')}:</span> {helper.getFormattedDate(allValue.agentStartDT)}</li>
            }
            {allValue.agentEndDT &&
              <li><span className='header'>{t('txt-stop')}:</span> {helper.getFormattedDate(allValue.agentEndDT)}</li>
            }
            {allValue.lastAnalyzedStatus && allValue.lastAnalyzedStatus !== 'ANALYZED' &&
              <Button variant='contained' color='primary' onClick={this.agentAnalysis.bind(this, allValue)}>{t('txt-analyze')}</Button>
            }
            {allValue.lastAnalyzedStatus &&
              <li><span className='header'>lastAnalyzedStatus:</span> {allValue.lastAnalyzedStatus}</li>
            }
            {allValue.lastAnalyzedStatusUpdDT &&
              <li><span className='header'>lastAnalyzedStatusUpdDT:</span> {helper.getFormattedDate(allValue.lastAnalyzedStatusUpdDT, 'local')}</li>
            }
          </section>
        )
      }
    } else if (val === 'rx_pkts' || val === 'tx_pkts') {
      if (allValue.statistics && allValue.statistics[val]) {
        return <li key={val}><span className='header'>{descHeader}:</span> {allValue.statistics[val]}</li>
      }
    } else {
      return <li key={val}><span className='header'>{descHeader}:</span> {allValue[val]}</li>
    }
  }
  /**
   * Get service description list
   * @method
   * @param {object} allValue - Edge data
   * @param {array.<string>} desc - service desc type
   * @returns HTML DOM
   */
  getServiceDesc = (allValue, desc) => {
    return (
      <ul key={allValue.agentId}>
        {desc.map(this.getIndividualDesc.bind(this, allValue))}
      </ul>
    )
  }
  /**
   * Get service name and status
   * @method
   * @param {object} val - service module data
   * @param {number} i - index of the service module
   * @returns HTML DOM
   */
  getServiceStatus = (val, i) => {
    let color = ''; //Default no color

    if (val.isNoted) { //Show red color
      color = '#d10d25';
    }

    return (
      <ul key={i}>
        <li key={i + val.serviceName}><span className='header'>{val.serviceName}:</span> <span style={{color}}>{val.status}</span></li>
      </ul>
    )
  }
  /**
   * Display list for group name
   * @method
   * @param {object} val - group data
   * @param {number} i - index of group name array
   */
  displayGroupName = (val, i) => {
    return <span key={i} className='item'>{val}</span>
  }
  /**
   * Get Edge search request data
   * @method
   * @returns request object data
   */
  getEdgeSearchRequestData = () => {
    const {edgeSearch} = this.state;
    let requestData = {};

    if (edgeSearch.keyword) {
      requestData.keyword = edgeSearch.keyword;
    }

    if (edgeSearch.groups.length > 0) {
      requestData.groups = _.map(edgeSearch.groups, val => {
        return val.value;
      });
    }

    if (edgeSearch.serviceType && edgeSearch.serviceType !== 'all') {
      requestData.serviceType = edgeSearch.serviceType;
    }

    if (edgeSearch.connectionStatus && edgeSearch.connectionStatus !== 'all') {
      requestData.connectionStatus = edgeSearch.connectionStatus;
    }

    return requestData;
  }
  /**
   * Get and set Edge table data
   * @method
   * @param {string} fromSearch - option for the 'search'
   */
  getEdgeData = (fromSearch) => {
    const {baseUrl, contextRoot} = this.context;
    const {edge} = this.state;
    const page = fromSearch === 'search' ? 1 : edge.currentPage;
    const url = `${baseUrl}/api/edge/_search?page=${page}&pageSize=${edge.pageSize}`;
    const requestData = this.getEdgeSearchRequestData();

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempEdge = {...edge};
        tempEdge.dataContent = data.rows;
        tempEdge.totalCount = data.counts;
        tempEdge.currentPage = page;

        let dataFields = {};
        edge.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: tempData === '_menu' ? '' : f(`edgeFields.${tempData}`),
            sortable: this.checkSortable(tempData),
            formatter: (value, allValue, i) => {
              if (tempData === 'agentName') {
                return (
                  <div>
                    <span>{value}</span>
                    {allValue.upgradeDttm &&
                      <div style={{'marginTop': '5px'}}>{t('edge-management.txt-nextUpgrade')}: {helper.getFormattedDate(allValue.upgradeDttm, 'local')}</div>
                    }
                  </div>
                )
              } else if (tempData === 'ipPort') {
                let iconType = '';

                if (!allValue.agentApiStatus) {
                  return;
                }

                if (allValue.agentApiStatus === 'Normal') {
                  iconType = 'icon_connected_on';
                } else if (allValue.agentApiStatus === 'Error') {
                  iconType = 'icon_connected_off';
                }

                const icon = {
                  src: contextRoot + `/images/${iconType}.png`,
                  title: t('txt-' + allValue.agentApiStatus.toLowerCase())
                };

                return <span><img src={icon.src} title={icon.title} />{value}</span>
              } else if (tempData === 'groupList') {
                if (allValue.groupList.length > 0) {
                  return <div className='flex-item'>{allValue.groupList.map(this.displayGroupName)}</div>
                }
              } else if (tempData === 'descriptionEdge') {
                const serviceDescList = SERVICE_TYPE_LIST[allValue.serviceType];
                let serviceArr = [];
                let moduleArr = [];

                if (serviceDescList) {
                  serviceArr = this.getServiceDesc(allValue, serviceDescList);
                }

                if (allValue.modules) {
                  moduleArr = allValue.modules.map(this.getServiceStatus);
                  return _.concat(serviceArr, moduleArr);
                } else {
                  return serviceArr;
                }
              } else if (tempData === '_menu') {
                return (
                  <div className='table-menu menu active'>
                    <i className='fg fg-eye' onClick={this.toggleContent.bind(this, 'viewEdge', allValue)} title={t('txt-view')}></i>
                    <i className='fg fg-trashcan' onClick={this.openDeleteMenu.bind(this, allValue)} title={t('txt-delete')}></i>
                  </div>
                )
              } else {
                return <span>{value}</span>
              }
            }
          };
        })

        tempEdge.dataFields = dataFields;

        this.setState({
          edge: tempEdge,
          syncEnable: data.syncEnable
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
   * Handle CSV download
   * @method
   */
  getCSVfile = () => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/edge/_export`;
    const requestData = this.getEdgeSearchRequestData();

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  /**
   * Set map geoJson and attacks data
   * @method
   */
  getWorldMap = () => {
    const {edge} = this.state;
    let geoJson = {
      mapDataArr: [],
      edgeDataArr: []
    };

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
      geoJson.mapDataArr.push(countryObj);
    });

    _.forEach(edge.dataContent, val => {
      if (val.honeyPotHostDTO && val.honeyPotHostDTO.longitude && val.honeyPotHostDTO.latitude) {
        geoJson.edgeDataArr.push({
          type: 'spot',
          id: val.agentId,
          latlng: [
            val.honeyPotHostDTO.latitude,
            val.honeyPotHostDTO.longitude
          ],
          data: {
            tag: 'blue'
          },
          tooltip: () => {
            return `
              <div class='map-tooltip'>
                <div><span class='key'>${t('edge-management.txt-edgeName')}:</span> <span class='value'>${val.agentName}</span></div>
                <div><span class='key'>${t('edge-management.txt-serviceType')}:</span> <span class='value'>${val.serviceType}</span></div>
              </div>
              `
          }
        });
      }
    });

    this.setState({
      geoJson
    });
  }
  /**
   * Handle trigger sync button
   * @method
   */
  triggerSyncBtn = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/edge/pushThreatIntell`,
      type: 'GET'
    })
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    helper.showPopupMsg(t('txt-requestSent'));
    this.getEdgeData();
  }
  /**
   * Handle Analyze button and reload the table
   * @method
   * @param {object} allValue - Edge data
   */
  agentAnalysis = (allValue) => {
    const {baseUrl} = this.context;

    if (!allValue.projectId) {
      return;
    }

    ah.one({
      url: `${baseUrl}/api/agent/_analyze?projectId=${allValue.projectId}`,
      type: 'GET'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getEdgeData('search');
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable or null
   */
  checkSortable = (field) => {
    const unSortableFields = ['description', '_menu'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  /**
   * Handle table sort
   * @method
   * @param {object} sort - sort data object
   */
  handleTableSort = (sort) => {
    let tempEdge = {...this.state.edge};
    tempEdge.sort.field = sort.field;
    tempEdge.sort.desc = sort.desc;

    this.setState({
      edge: tempEdge
    }, () => {
      this.getEdgeData();
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempEdge = {...this.state.edge};
    tempEdge[type] = Number(value);

    if (type === 'pageSize') {
      tempEdge.currentPage = 1;
    }

    this.setState({
      edge: tempEdge
    }, () => {
      this.getEdgeData();
    });
  }
  /**
   * Handle filter input data change
   * @method
   * @param {object} event - event object
   */
  handleEdgeSearch = (event) => {
    let tempEdgeSearch = {...this.state.edgeSearch};
    tempEdgeSearch[event.target.name] = event.target.value;

    this.setState({
      edgeSearch: tempEdgeSearch
    });
  }
  /**
   * Handle combo data change
   * @method
   * @param {object} event - event object
   * @param {string} value - input value
   */
  handleComboSearch = (event, value) => {
    let tempEdgeSearch = {...this.state.edgeSearch};
    tempEdgeSearch.groups = value;

    this.setState({
      edgeSearch: tempEdgeSearch
    });
  }
  /**
   * Show filter if search keyword or selection is present
   * @method
   */
  checkFilterStatus = () => {
    const {edgeSearch} = this.state;

    if (edgeSearch.keyword || edgeSearch.serviceType !== 'all' || edgeSearch.connectionStatus !== 'all' ) {
      return true;
    }
  }
  /**
   * Handle content tab change
   * @method
   * @param {object} event - event object
   * @param {string} newTab - content type ('edge' or 'geography')
   */
  handleSubTabChange = (event, newTab) => {
    this.setState({
      activeTab: newTab
    });
  }
  /**
   * Toggle different content
   * @method
   * @param {string} type - page type ('tableList', 'viewEdge', 'editEdge' and 'cancel')
   * @param {object} allValue - Edge data
   */
  toggleContent = (type, allValue) => {
    const {originalEdgeData, edge} = this.state;
    let tempEdge = {...edge};
    let showPage = type;

    if (type === 'viewEdge') {
      tempEdge.info = {
        name: allValue.agentName ? allValue.agentName : '',
        id: allValue.agentId,
        projectId: allValue.projectId,
        ip: allValue.ipPort,
        vpnIP: allValue.vpnIp,
        licenseName: allValue.vpnName,
        serviceType: allValue.serviceType,
        serviceMode: allValue.agentMode,
        longitude: '',
        latitude: '',
        chassisAddress: allValue.chassisAddress,
        chassisLocation: allValue.chassisLocation,
        contact: allValue.contact,
        upgradeDatetime: allValue.upgradeDttm,
        edgeModeType: allValue.agentStartDT && allValue.agentEndDT ? 'customTime' : 'anyTime',
        edgeModeDatetime: {
          from: allValue.agentStartDT ? allValue.agentStartDT : '',
          to: allValue.agentEndDT ? allValue.agentEndDT : ''
        },
        edgeGroupList: allValue.groupList,
        memo: allValue.memo ? allValue.memo : '',
        isNetTrapUpgrade: allValue.isNetTrapUpgrade,
        agentApiStatus: allValue.agentApiStatus,
        lastUpdateTime: allValue.lastStatusUpdDT,
        lastStatus: allValue.lastStatus,
        isConfigurable: allValue.isConfigurable
      };

      if (allValue.honeyPotHostDTO) {
        if (allValue.honeyPotHostDTO.longitude >= -180 && allValue.honeyPotHostDTO.longitude <= 180) {
          tempEdge.info.longitude = allValue.honeyPotHostDTO.longitude;
        }

        if (allValue.honeyPotHostDTO.latitude >= -90 && allValue.honeyPotHostDTO.latitude <= 90) {
          tempEdge.info.latitude = allValue.honeyPotHostDTO.latitude;
        }
      }

      this.setState({
        upgradeCheckbox: Boolean(allValue.upgradeDttm),
        originalEdgeData: _.cloneDeep(tempEdge)
      });
    } else if (type === 'editEdge') {
      tempEdge.info.edgeGroupList = _.map(edge.info.edgeGroupList, val => {
        return {
          value: val
        }
      });

      this.setState({
        edge: tempEdge
      });
    } else if (type === 'tableList') {
      if (this.checkFilterStatus()) {
        this.setState({
          showFilter: true
        });
      }

      tempEdge.info = {};
    } else if (type === 'cancel') {
      showPage = 'viewEdge';
      tempEdge = _.cloneDeep(originalEdgeData);

      this.setState({
        formValidation: {
          edgeName: {
            valid: true
          },
          longitude: {
            valid: true
          },
          latitude: {
            valid: true
          }
        }
      });
    }

    this.setState({
      activeContent: showPage,
      edge: tempEdge
    }, () => {
      if (type === 'tableList') {
        this.getEdgeData();
      }
    });
  }
  /**
   * Handle Edge edit input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempEdge = {...this.state.edge};
    tempEdge.info[event.target.name] = event.target.value;

    this.setState({
      edge: tempEdge
    });
  }
  /**
   * Handle date change
   * @method
   * @param {object} newDatetime - new datetime object
   */
  handleUpgradeDateChange = (newDatetime) => {
    let tempEdge = {...this.state.edge};
    tempEdge.info.upgradeDatetime = newDatetime;

    this.setState({
      edge: tempEdge
    });
  }
  /**
   * Handle combo box change
   * @method
   * @param {object} event - event object
   * @param {array.<object>} value - selected input value
   */
  handleComboBoxChange = (event, value) => {
    let tempEdge = {...this.state.edge};
    tempEdge.info.edgeGroupList = value;

    this.setState({
      edge: tempEdge
    });
  }
  /**
   * Handle date change
   * @method
   * @param {string} type - date type ('from' or 'to')
   * @param {object} newDatetime - new datetime object
   */
  handleDateChange = (type, newDatetime) => {
    let tempEdge = {...this.state.edge};
    tempEdge.info.edgeModeDatetime[type] = newDatetime;

    this.setState({
      edge: tempEdge
    });
  }
  /**
   * Handle Edge edit status toggle
   * @method
   * @param {string} type - status action type ('start' or 'stop')
   */
  handleEdgeStatusChange = (type) => {
    const {baseUrl} = this.context;
    const {edge} = this.state;

    if (_.isEmpty(edge.info)) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/agent/_${type}?id=${edge.info.id}&projectId=${edge.info.projectId}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempEdge = {...this.state.edge};
        tempEdge.info.lastStatus = data;

        this.setState({
          edge: tempEdge
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display delete Edge content
   * @method
   * @param {object} allValue - Edge data
   * @returns HTML DOM
   */
  getDeleteEdgeContent = (allValue) => {
    this.setState({
      currentEdgeData: allValue
    });

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {allValue.agentName || allValue.ipPort}?</span>
      </div>
    )
  }
  /**
   * Show Delete Edge dialog
   * @method
   * @param {object} allValue - Edge data
   */
  openDeleteMenu = (allValue) => {
    PopupDialog.prompt({
      title: t('edge-management.txt-deleteEdge'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteEdgeContent(allValue),
      act: (confirmed, data) => {
        if (confirmed) {
          this.deleteEdge();
        }
      }
    });
  }
  /**
   * Handle delete Edge confirm
   * @method
   */
  deleteEdge = () => {
    const {baseUrl} = this.context;
    const {currentEdgeData} = this.state;

    if (!currentEdgeData.agentId) {
      return;
    }

    ah.one({
      url: `${baseUrl}/api/edge?id=${currentEdgeData.agentId}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getEdgeData();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle Edge group confirm
   * @method
   */
  handleGroupSubmit = () => {
    const {baseUrl} = this.context;
    const {edge} = this.state;
    const url = `${baseUrl}/api/edge/groups/_edge?edgeId=${edge.info.id}`;
    const requestData = {
      groupName: edge.info.edgeGroupList
    };

    this.ah.one({
        url,
        data: JSON.stringify(requestData),
        type: 'POST',
        contentType: 'text/plain'
    })
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle Edge edit confirm
   * @method
   */
  handleEdgeSubmit = () => {
    const {baseUrl} = this.context;
    const {edge, upgradeCheckbox, formValidation} = this.state;
    let requestData = {
      id: edge.info.id,
      agentName: edge.info.name,
      chassisAddress: edge.info.chassisAddress,
      chassisLocation: edge.info.chassisLocation,
      contact: edge.info.contact,
      memo: edge.info.memo
    };
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (edge.info.name) {
      tempFormValidation.edgeName.valid = true;
    } else {
      tempFormValidation.edgeName.valid = false;
      validate = false;
    }

    if (edge.info.longitude) {
      if (edge.info.longitude >= -180 && edge.info.longitude <= 180) {
        requestData.longitude = edge.info.longitude;
        tempFormValidation.longitude.valid = true;
      } else {
        tempFormValidation.longitude.valid = false;
        validate = false;
      }
    }

    if (edge.info.latitude) {
      if (edge.info.latitude >= -90 && edge.info.latitude <= 90) {
        requestData.latitude = edge.info.latitude;
        tempFormValidation.latitude.valid = true;
      } else {
        tempFormValidation.latitude.valid = false;
        validate = false;
      }
    }

    if (upgradeCheckbox) {
      requestData.upgradeDttm = moment(edge.info.upgradeDatetime).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    if (edge.info.isConfigurable) {
      if (edge.info.edgeIPlist) {
        requestData.ipList = edge.info.edgeIPlist;
      }

      if (edge.info.serviceMode) {
        requestData.agentMode = edge.info.serviceMode;
      }

      if (edge.info.edgeModeType === 'customTime') {
        if (edge.info.edgeModeDatetime.from) {
          if (edge.info.edgeModeDatetime.to) {
            requestData.agentStartDt = moment(edge.info.edgeModeDatetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
          } else { //End date is empty
            helper.showPopupMsg(t('edge-management.txt-edgeEditNoEndDate'), t('txt-error'));
            return;
          }
        } else {
          helper.showPopupMsg(t('edge-management.txt-edgeEditNoStartDate'), t('txt-error'));
          return;
        }

        if (edge.info.edgeModeDatetime.to) {
          if (edge.info.edgeModeDatetime.from) {
            requestData.agentEndDt = moment(edge.info.edgeModeDatetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
          } else { //Start date is empty
            helper.showPopupMsg(t('edge-management.txt-edgeEditNoStartDate'), t('txt-error'));
            return;
          }

          if (moment(edge.info.edgeModeDatetime.to).isBefore()) { //End date is a past date (compare with current date time)
            helper.showPopupMsg(t('edge-management.txt-edgeEditPastEndDate'), t('txt-error'));
            return;
          }
        } else {
          helper.showPopupMsg(t('edge-management.txt-edgeEditNoEndDate'), t('txt-error'));
          return;
        }
      }
    }

    const requestData2 = {
      groupName: _.map(edge.info.edgeGroupList, val => {
        return val.value;
      })
    };

    ah.series([
      {
        url: `${baseUrl}/api/agent`,
        data: JSON.stringify(requestData),
        type: 'PATCH',
        contentType: 'text/plain'
      },
      {
        url: `${baseUrl}/api/edge/groups/_edge?edgeId=${edge.info.id}`,
        data: JSON.stringify(requestData2),
        type: 'POST',
        contentType: 'text/plain'
      }
    ])
    .then(data => {
      if (data) {
        if (data[0] && data[0].ret === 0) {
          this.toggleContent('tableList');
        } else {
          switch (data[0].ret) {
            case -1:
              helper.showPopupMsg(t('edge-management.txt-edgeEditFail'), t('txt-error'), t('edge-management.txt-edgeEditError1'));
              break;
            case -11:
              helper.showPopupMsg(t('edge-management.txt-edgeEditFail'), t('txt-error'), t('edge-management.txt-edgeEditError2'));
              break;
            case -21:
              helper.showPopupMsg(t('edge-management.txt-edgeEditFail'), t('txt-error'), t('edge-management.txt-edgeEditError3'));
              break;
            case -22:
              helper.showPopupMsg(t('edge-management.txt-edgeEditFail'), t('txt-error'), t('edge-management.txt-edgeEditError4'));
              break;
            case -31:
              helper.showPopupMsg(t('edge-management.txt-edgeEditFail'), t('txt-error'), t('edge-management.txt-edgeEditError5'));
              break;
            case -32:
              helper.showPopupMsg(t('edge-management.txt-edgeEditFail'), t('txt-error'), t('edge-management.txt-edgeEditError6'));
            case -33:
              helper.showPopupMsg(t('edge-management.txt-edgeEditFail'), t('txt-error'), t('edge-management.txt-edgeEditError7'));
              break;
            default:
              break;
          }

          this.setState({
            originalEdgeData: _.cloneDeep(edge)
          }, () => {
            this.toggleContent('cancel');
          })
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
      this.close();
    })
  }
  /**
   * Handle Edit Group button
   * @method
   */
  toggleManageGroup = () => {
    this.setState({
      openManageGroupDialog: !this.state.openManageGroupDialog
    });
  }
  /**
   * Update group list
   * @param {string} group - group to be removed
   * @method
   */
  updateGroupList = (group) => {
    let tempEdge = {...this.state.edge};
    const index = tempEdge.info.edgeGroupList.indexOf(group);

    if (index > -1) { //Update selected group
      tempEdge.info.edgeGroupList.splice(index, 1);

      this.setState({
        originalEdgeData: _.cloneDeep(tempEdge),
        edge: tempEdge
      }, () => {
        this.handleGroupSubmit();
      });
    }

    this.getGroupList();
  }
  /**
   * Handle NetTrap upgrade button
   * @method
   */
  handleNetTrapUpgrade = () => {
    const {baseUrl} = this.context;
    const {edge} = this.state;

    if (!edge.info.id) {
      return;
    }

    ah.one({
      url: `${baseUrl}/api/edge/nettrap/_upgrade?id=${edge.info.id}`,
      type: 'GET'
    })
    .then(data => {
      if (data.ret === 0) {
        helper.showPopupMsg(t('txt-upgradeScheduleAdded'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display individual group
   * @method
   * @returns HTML DOM
   */
  displayGroup = (val, i) => {
    return <span key={i}>{val}</span>
  }
  /**
   * Toggle upgrade checkbox
   * @method
   */
  toggleUpgradeCheckbox = () => {
    this.setState({
      upgradeCheckbox: !this.state.upgradeCheckbox
    });
  }
  /**
   * Display edit Edge content
   * @method
   * @returns HTML DOM
   */
  displayEditEdgeContent = () => {
    const {contextRoot, locale} = this.context;
    const {activeContent, allGroupList, edge, upgradeCheckbox, formValidation} = this.state;
    const edgeIpText = t('edge-management.txt-ipList') + '(' + t('txt-commaSeparated') + ')';
    const memoText = t('txt-memo') + '(' + t('txt-memoMaxLength') + ')';
    let iconType = '';
    let btnStatusOn = false;
    let action = 'start';
    let icon = '';

    if (edge.info.agentApiStatus) {
      if (edge.info.agentApiStatus === 'Normal') {
        iconType = 'icon_connected_on';
      } else if (edge.info.agentApiStatus === 'Error') {
        iconType = 'icon_connected_off';
      }

      icon = {
        src: contextRoot + `/images/${iconType}.png`,
        title: t('txt-' + edge.info.agentApiStatus.toLowerCase())
      };
    }

    if (edge.info.lastStatus) {
      if (edge.info.lastStatus.indexOf('inactive') !== -1) {
        btnStatusOn = false;
        action = 'start';
      } else if (edge.info.lastStatus.indexOf('active') !== -1) {
        btnStatusOn = true;
        action = 'stop';
      }
    }

    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);  

    return (
      <div className='main-content basic-form'>
        <header className='main-header'>Edge</header>

        <div className='content-header-btns'>
          {activeContent === 'viewEdge' &&
            <div>
              <Button variant='outlined' color='primary' className='standard btn list' onClick={this.toggleContent.bind(this, 'tableList')}>{t('network-inventory.txt-backToList')}</Button>
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'editEdge')}>{t('txt-edit')}</Button>
            </div>
          }
        </div>

        <div className='edge-settings' style={{height: activeContent === 'viewEdge' ? '78vh' : '70vh'}}>
          <div className='form-group normal'>
            <header>
              <div className='text'>{t('edge-management.txt-basicInfo')}</div>
              {icon &&
                <img className='status' src={icon.src} title={icon.title} />
              }
              {edge.info.lastUpdateTime &&
                <span className='msg'>{t('edge-management.txt-lastUpdateTime')} {helper.getFormattedDate(edge.info.lastUpdateTime, 'local')}</span>
              }
            </header>
            <div className='form-options'>
              {edge.info.lastStatus &&
                <FormControlLabel
                  className='switch-control'
                  control={
                    <Switch
                      checked={btnStatusOn}
                      onChange={this.handleEdgeStatusChange.bind(this, action)}
                      color='primary' />
                  }
                  label={t('txt-switch')}
                  disabled={activeContent === 'viewEdge' || !edge.info.isConfigurable} />
              }
              <Button variant='contained' color='primary' className='btn nettrap-upgrade' onClick={this.handleNetTrapUpgrade} disabled={activeContent === 'viewEdge' || !edge.info.isNetTrapUpgrade}>{t('txt-upgrade')}</Button>
            </div>
            <div className='group'>
              <TextField
                id='edgeName'
                name='name'
                label={t('edge-management.txt-edgeName')}
                variant='outlined'
                fullWidth
                size='small'
                required
                error={!formValidation.edgeName.valid}
                helperText={formValidation.edgeName.valid ? '' : t('txt-required')}
                value={edge.info.name}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge'} />
            </div>
            <div className='group'>
              <TextField
                id='edgeID'
                name='id'
                label={t('edge-management.txt-edgeID')}
                variant='outlined'
                fullWidth
                size='small'
                value={edge.info.id}
                disabled />
            </div>
            <div className='group'>
              <TextField
                id='edgeIP'
                name='ip'
                label={t('edge-management.txt-ip')}
                variant='outlined'
                fullWidth
                size='small'
                value={edge.info.ip}
                onChange={this.handleDataChange}
                disabled />
            </div>
            <div className='group'>
              <TextField
                id='edgeIPlist'
                name='edgeIPlist'
                label={edgeIpText}
                variant='outlined'
                fullWidth
                size='small'
                value={edge.info.edgeIPlist}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge' || !edge.info.isConfigurable} />
            </div>
            <div className='group'>
              <TextField
                id='edgeVPNip'
                name='vpnIP'
                label={t('edge-management.txt-vpnIP')}
                variant='outlined'
                fullWidth
                size='small'
                value={edge.info.edgeIPlist}
                disabled />
            </div>
            <div className='group'>
              <TextField
                id='edgeLicenseName'
                name='licenseName'
                label={t('edge-management.txt-vpnLicenseName')}
                variant='outlined'
                fullWidth
                size='small'
                value={edge.info.licenseName}
                disabled />
            </div>
            <div className='group'>
              <TextField
                id='edgeServiceType'
                name='serviceType'
                label={t('edge-management.txt-serviceType')}
                variant='outlined'
                fullWidth
                size='small'
                value={edge.info.serviceType}
                disabled />
            </div>
            <div className='group'>
              <TextField
                id='edgeServiceMode'
                name='serviceMode'
                select
                label={t('edge-management.txt-serviceMode')}
                variant='outlined'
                fullWidth
                size='small'
                value={edge.info.serviceMode}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge' || !edge.info.isConfigurable}>
                <MenuItem value={'REALTIME'}>{t('txt-realtime')}</MenuItem>
                <MenuItem value={'TCPDUMP'}>{t('txt-tcpdump')}</MenuItem>
              </TextField>
            </div>
            <div className='group'>
              <TextField
                id='edgeLongitude'
                name='longitude'
                label={t('edge-management.txt-longitude')}
                variant='outlined'
                fullWidth
                size='small'
                error={!formValidation.longitude.valid}
                helperText={formValidation.longitude.valid ? '' : t('edge-management.txt-coordinateError')}
                value={edge.info.longitude}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge'} />
            </div>
            <div className='group'>
              <TextField
                id='edgeLatitude'
                name='latitude'
                label={t('edge-management.txt-latitude')}
                variant='outlined'
                fullWidth
                size='small'
                error={!formValidation.latitude.valid}
                helperText={formValidation.latitude.valid ? '' : t('edge-management.txt-coordinateError')}
                value={edge.info.latitude}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge'} />
            </div>
            <div className='group'>
              <TextField
                id='edgeChassisAddress'
                name='chassisAddress'
                label={t('edge-management.txt-chassisAddress')}
                variant='outlined'
                fullWidth
                size='small'
                value={edge.info.chassisAddress}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge'} />
            </div>
            <div className='group'>
              <TextField
                id='edgeChassisLocation'
                name='chassisLocation'
                label={t('edge-management.txt-chassisLocation')}
                variant='outlined'
                fullWidth
                size='small'
                value={edge.info.chassisLocation}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge'} />
            </div>
            <div className='group'>
              <TextField
                id='edgeContact'
                name='contact'
                label={t('edge-management.txt-contact')}
                variant='outlined'
                fullWidth
                size='small'
                value={edge.info.contact}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge'} />
            </div>
            <div className='edge-time'>
              <div className='group'>
                <FormLabel>{t('edge-management.txt-upgradeTime')}</FormLabel>
                <FormControlLabel
                  label={t('txt-activate')}
                  className='upgrade-checkbox'
                  control={
                    <Checkbox
                      className='checkbox-ui'
                      checked={upgradeCheckbox}
                      onChange={this.toggleUpgradeCheckbox}
                      color='primary' />
                  }
                  disabled={activeContent === 'viewEdge'} />
                {upgradeCheckbox &&
                  <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
                    <KeyboardDateTimePicker
                      className='date-time-picker upgrade'
                      inputVariant='outlined'
                      variant='inline'
                      format='YYYY-MM-DD HH:mm'
                      ampm={false}
                      disablePast={true}
                      value={edge.info.upgradeDatetime}
                      onChange={this.handleUpgradeDateChange}
                      disabled={activeContent === 'viewEdge'} />
                  </MuiPickersUtilsProvider>
                }
              </div>
              <div className='group'>
                <FormLabel>{t('edge-management.txt-activatTime')}</FormLabel>
                <RadioGroup
                  className='radio-group activate-time'
                  name='edgeModeType'
                  value={edge.info.edgeModeType}
                  onChange={this.handleDataChange}>
                  <FormControlLabel
                    value='anyTime'
                    control={
                      <Radio
                        className='radio-ui'
                        color='primary' />
                    }
                    label={t('edge-management.txt-anyTime')}
                    disabled={activeContent === 'viewEdge'} />
                  <FormControlLabel
                    value='customTime'
                    control={
                      <Radio
                        className='radio-ui'
                        color='primary' />
                    }
                    label={t('edge-management.txt-customTime')}
                    disabled={activeContent === 'viewEdge'} />
                </RadioGroup>

                {edge.info.edgeModeType === 'customTime' &&
                  <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
                    <KeyboardDateTimePicker
                      className='date-time-picker'
                      inputVariant='outlined'
                      variant='inline'
                      format='YYYY-MM-DD HH:mm'
                      ampm={false}
                      invalidDateMessage={t('txt-checkDateFormat')}
                      value={edge.info.edgeModeDatetime.from}
                      onChange={this.handleDateChange.bind(this, 'from')} />
                    <div className='between'>~</div>
                    <KeyboardDateTimePicker
                      className='date-time-picker'
                      inputVariant='outlined'
                      variant='inline'
                      format='YYYY-MM-DD HH:mm'
                      ampm={false}
                      invalidDateMessage={t('txt-checkDateFormat')}
                      value={edge.info.edgeModeDatetime.to}
                      onChange={this.handleDateChange.bind(this, 'to')} />
                  </MuiPickersUtilsProvider>
                }
              </div>
            </div>
            <div className='group full'>
              <label className='combobox-group'>{t('txt-group')}</label>
              {activeContent === 'editEdge' &&
                <Button variant='contained' color='primary' className='btn add-group' onClick={this.toggleManageGroup}>{t('txt-manage')}</Button>
              }
              {activeContent === 'viewEdge' &&
                <div className='flex-item'>{edge.info.edgeGroupList.map(this.displayGroup)}</div>
              }
              {activeContent === 'editEdge' &&
                <Autocomplete
                  className='checkboxes-tags groups'
                  multiple
                  value={edge.info.edgeGroupList}
                  options={_.map(allGroupList, (val) => { return { value: val }})}
                  getOptionLabel={(option) => option.value}
                  disableCloseOnSelect
                  noOptionsText={t('txt-notFound')}
                  openText={t('txt-on')}
                  closeText={t('txt-off')}
                  clearText={t('txt-clear')}
                  renderOption={(option, { selected }) => (
                    <React.Fragment>
                      <Checkbox
                        color='primary'
                        icon={<CheckBoxOutlineBlankIcon />}
                        checkedIcon={<CheckBoxIcon />}
                        checked={selected} />
                      {option.value}
                    </React.Fragment>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} variant='outlined' />
                  )}
                  getOptionSelected={(option, value) => (
                    option.value === value.value
                  )}
                  onChange={this.handleComboBoxChange} />
              }
            </div>
            <div className='group full'>
              <TextField
                id='edgeMemo'
                name='memo'
                label={memoText}
                multiline
                rows={4}
                maxLength={250}
                variant='outlined'
                fullWidth
                size='small'
                value={edge.info.memo}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge'} />
            </div>
          </div>
        </div>

        {activeContent === 'editEdge' &&
          <footer>
            <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</Button>
            <Button variant='contained' color='primary' onClick={this.handleEdgeSubmit}>{t('txt-save')}</Button>
          </footer>
        }
      </div>
    )
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, allGroupList, serviceType, edgeSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <TextField
              id='edgeSearchKeyword'
              name='keyword'
              label={f('edgeFields.keywords')}
              variant='outlined'
              fullWidth
              size='small'
              value={edgeSearch.keyword}
              onChange={this.handleEdgeSearch} />
          </div>
          <div className='group'>
            <TextField
              id='edgeSearchServiceType'
              name='serviceType'
              select
              label={f('edgeFields.serviceType')}
              variant='outlined'
              fullWidth
              size='small'
              value={edgeSearch.serviceType}
              onChange={this.handleEdgeSearch}>
              <MenuItem value={'all'}>{t('txt-all')}</MenuItem>
              {serviceType}
            </TextField>
          </div>
          <div className='group'>
            <TextField
              id='edgeSearchConnectionStatus'
              name='connectionStatus'
              select
              label={f('edgeFields.connectionStatus')}
              variant='outlined'
              fullWidth
              size='small'
              value={edgeSearch.connectionStatus}
              onChange={this.handleEdgeSearch}>
              <MenuItem value={'all'}>{t('txt-all')}</MenuItem>
              <MenuItem value={'Normal'}>{t('txt-normal')}</MenuItem>
              <MenuItem value={'Error'}>{t('txt-error')}</MenuItem>
            </TextField>
          </div>
          <div className='group' style={{width: '300px'}}>
            <Autocomplete
              className='checkboxes-tags'
              multiple
              value={edgeSearch.groups}
              options={_.map(allGroupList, (val) => { return { value: val }})}
              getOptionLabel={(option) => option.value}
              disableCloseOnSelect
              noOptionsText={t('txt-notFound')}
              openText={t('txt-on')}
              closeText={t('txt-off')}
              clearText={t('txt-clear')}
              renderOption={(option, { selected }) => (
                <React.Fragment>
                  <Checkbox
                    color='primary'
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckBoxIcon />}
                    checked={selected} />
                  {option.value}
                </React.Fragment>
              )}
              renderInput={(params) => (
                <TextField {...params} label={f('edgeFields.groups')} variant='outlined' />
              )}
              getOptionSelected={(option, value) => (
                option.value === value.value
              )}
              onChange={this.handleComboSearch} />
          </div>
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.getEdgeData.bind(this, 'search')}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
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
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      edgeSearch: {
        keyword: '',
        groups: [],
        serviceType: 'all',
        connectionStatus: 'all'
      }
    });
  }
  render() {
    const {baseUrl, contextRoot, mapUrl} = this.context;
    const {
      activeTab,
      activeContent,
      showFilter,
      allGroupList,
      openManageGroupDialog,
      edge,
      syncEnable,
      geoJson
    } = this.state;

    return (
      <div>
        {openManageGroupDialog &&
          <ManageGroup
            allGroupList={allGroupList}
            toggleManageGroup={this.toggleManageGroup}
            updateGroupList={this.updateGroupList}
            getGroupList={this.getGroupList} />
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            {activeContent === 'tableList' &&
              <div>
                <Button variant='contained' color='primary' className={cx({'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></Button>
                <Button variant='outlined' color='primary' className='last' onClick={this.getCSVfile} title={t('txt-exportCSV')}><i className='fg fg-data-download'></i></Button>
              </div>
            }
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            {activeContent === 'tableList' &&
              this.renderFilter()
            }

            {activeContent === 'tableList' &&
              <div className='main-content'>
                <Tabs
                  indicatorColor='primary'
                  textColor='primary'
                  value={activeTab}
                  onChange={this.handleSubTabChange}>
                  <Tab label={t('txt-edge')} value='edge' />
                  <Tab label={t('edge-management.txt-geography')} value='geography' />
                </Tabs>

                <div className='content-header-btns'>
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.triggerSyncBtn} disabled={!syncEnable}>{t('notifications.txt-sync')}</Button>
                  <Link to='/SCP/configuration/notifications'><Button variant='outlined' color='primary' className='standard btn'>{t('notifications.txt-settings')}</Button></Link>
                </div>

                {activeTab === 'edge' &&
                  <TableContent
                    dataTableData={edge.dataContent}
                    dataTableFields={edge.dataFields}
                    dataTableSort={edge.sort}
                    paginationTotalCount={edge.totalCount}
                    paginationPageSize={edge.pageSize}
                    paginationCurrentPage={edge.currentPage}
                    handleTableSort={this.handleTableSort}
                    paginationPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                    paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
                }

                {activeTab === 'geography' &&
                  <Gis
                    id='gisMap'
                    data={geoJson.edgeDataArr}
                    baseLayers={{
                      standard: {
                        label: 'worldMap',
                        layer: mapUrl
                      }
                    }}
                    mapOptions={{
                      zoom: 8,
                      center: [
                        23.6978,
                        120.9605
                      ]
                    }}
                    symbolOptions={[
                      {
                        match: {
                          type: 'spot'
                        },
                        props: {
                          'background-color': ({data}) => {
                            return data.tag;
                          },
                          'border-color': '#333',
                          'border-width': '1px'
                        }
                      }
                    ]}
                    layouts={['standard']}
                    dragModes={['pan']} />
                }
              </div>
            }

            {(activeContent === 'viewEdge' || activeContent === 'editEdge') &&
              this.displayEditEdgeContent()
            }
          </div>
        </div>
      </div>
    )
  }
}

Edge.contextType = BaseDataContext;

Edge.propTypes = {
};

export default withRouter(Edge);