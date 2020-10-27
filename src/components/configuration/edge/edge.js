import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { NavLink, Link, Route } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';

import Combobox from 'react-ui/build/src/components/combobox'
import DateRange from 'react-ui/build/src/components/date-range'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Gis from 'react-gis/build/src/components'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Tabs from 'react-ui/build/src/components/tabs'

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

const StyledTextField = withStyles({
  root: {
    backgroundColor: '#fff',
    '& .Mui-disabled': {
      backgroundColor: '#f2f2f2'
    }
  }
})(TextField);

function TextFieldComp(props) {
  return (
    <StyledTextField
      id={props.id}
      className={props.className}
      name={props.name}
      type={props.type}
      label={props.label}
      multiline={props.multiline}
      rows={props.rows}
      maxLength={props.maxLength}
      variant={props.variant}
      fullWidth={props.fullWidth}
      size={props.size}
      InputProps={props.InputProps}
      required={props.required}
      value={props.value}
      onChange={props.onChange}
      disabled={props.disabled} />
  )
}

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
      connectionStatus: [
        {value: 'all', text: t('txt-all')},
        {value: 'Normal', text: t('txt-normal')},
        {value: 'Error', text: t('txt-error')},
      ],
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
      syncEnable: true,
      geoJson: {
        mapDataArr: [],
        edgeDataArr: []
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
        let serviceType = [{
          value: 'all',
          text: t('txt-all')
        }];

        _.forEach(data, val => {
          serviceType.push({
            value: val,
            text: val
          });
        })

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
              <button onClick={this.agentAnalysis.bind(this, allValue)}>{t('txt-analyze')}</button>
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
   * Get and set Edge table data
   * @method
   * @param {string} fromSearch - option for the 'search'
   */
  getEdgeData = (fromSearch) => {
    const {baseUrl, contextRoot} = this.context;
    const {edgeSearch, edge} = this.state;
    const url = `${baseUrl}/api/edge/_search?page=${edge.currentPage}&pageSize=${edge.pageSize}`;
    let requestData = {};

    if (edgeSearch.keyword) {
      requestData.keyword = edgeSearch.keyword;
    }

    if (edgeSearch.groups.length > 0) {
      requestData.groups = edgeSearch.groups;
    }

    if (edgeSearch.serviceType && edgeSearch.serviceType !== 'all') {
      requestData.serviceType = edgeSearch.serviceType;
    }

    if (edgeSearch.connectionStatus && edgeSearch.connectionStatus !== 'all') {
      requestData.connectionStatus = edgeSearch.connectionStatus;
    }

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
        tempEdge.currentPage = fromSearch === 'search' ? 1 : edge.currentPage;

        let dataFields = {};
        edge.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: tempData === '_menu' ? '' : f(`edgeFields.${tempData}`),
            sortable: this.checkSortable(tempData),
            formatter: (value, allValue, i) => {
              if (tempData === 'ipPort') {
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
   * @param {string} type - input type
   * @param {string | object} value - input value
   */
  handleEdgeSearch = (type, value) => {
    let tempEdgeSearch = {...this.state.edgeSearch};

    if (type === 'keyword') { //value is an object type
      tempEdgeSearch[type] = value.target.value.trim();
    } else if (type === 'groups') {
      tempEdgeSearch[type] = value;
    } else {
      tempEdgeSearch[type] = value.trim();
    }

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
   * @param {string} type - content type ('edge' or 'geography')
   */
  handleSubTabChange = (type) => {
    this.setState({
      activeTab: type
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
        edgeGroupList: allValue.groupList,
        edgeModeType: 'anyTime',
        edgeModeDatetime: {
          from: '',
          to: ''
        },
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

      if (allValue.agentStartDT &&  allValue.agentEndDT) {
        tempEdge.info.edgeModeType = 'customTime';
        tempEdge.info.edgeModeDatetime.from = allValue.agentStartDT;
        tempEdge.info.edgeModeDatetime.to = allValue.agentEndDT;
      }

      this.setState({
        originalEdgeData: _.cloneDeep(tempEdge)
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
   * @param {string} value - input value
   */
  handleDateChange = (value) => {
    let tempEdge = {...this.state.edge};
    tempEdge.info.edgeModeDatetime = value;

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
    const {edge} = this.state;
    let requestData = {
      id: edge.info.id,
      agentName: edge.info.name,
      memo: edge.info.memo
    };

    if (edge.info.longitude) {
      if (edge.info.longitude >= -180 && edge.info.longitude <= 180) {
        requestData.longitude = edge.info.longitude;
      } else {
        helper.showPopupMsg(t('edge-management.txt-coordinateError'), t('txt-error'));
        return;
      }
    }

    if (edge.info.latitude) {
      if (edge.info.latitude >= -90 && edge.info.latitude <= 90) {
        requestData.latitude = edge.info.latitude;
      } else {
        helper.showPopupMsg(t('edge-management.txt-coordinateError'), t('txt-error'));
        return;
      }
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
            requestData.agentStartDt = Moment(edge.info.edgeModeDatetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
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
            requestData.agentEndDt = Moment(edge.info.edgeModeDatetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
          } else { //Start date is empty
            helper.showPopupMsg(t('edge-management.txt-edgeEditNoStartDate'), t('txt-error'));
            return;
          }

          if (Moment(edge.info.edgeModeDatetime.to).isBefore()) { //End date is a past date (compare with current date time)
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
      groupName: edge.info.edgeGroupList
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
        if (data[0]) {
          switch(data[0].ret) {
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
   * Display edit Edge content
   * @method
   * @returns HTML DOM
   */
  displayEditEdgeContent = () => {
    const {contextRoot, locale} = this.context;
    const {activeContent, allGroupList, edge} = this.state;
    const allGroup = _.map(allGroupList, val => {
      return {
        value: val,
        text: val
      }
    });
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

    return (
      <div className='main-content basic-form'>
        <header className='main-header'>Edge</header>

        <div className='content-header-btns'>
          {activeContent === 'viewEdge' &&
            <div>
              <button className='standard btn list' onClick={this.toggleContent.bind(this, 'tableList')}>{t('network-inventory.txt-backToList')}</button>
              <button className='standard btn edit' onClick={this.toggleContent.bind(this, 'editEdge')}>{t('txt-edit')}</button>
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
              <button className='btn nettrap-upgrade' onClick={this.handleNetTrapUpgrade} disabled={activeContent === 'viewEdge' || !edge.info.isNetTrapUpgrade}>{t('txt-upgrade')}</button>
            </div>
            <div className='group'>
              <TextFieldComp
                id='edgeName'
                name='name'
                label={t('edge-management.txt-edgeName')}
                variant='outlined'
                fullWidth={true}
                size='small'
                value={edge.info.name}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge'} />
            </div>
            <div className='group'>
              <TextFieldComp
                id='edgeID'
                name='id'
                label={t('edge-management.txt-edgeID')}
                variant='outlined'
                fullWidth={true}
                size='small'
                value={edge.info.id}
                disabled={true} />
            </div>
            <div className='group'>
              <TextFieldComp
                id='edgeIP'
                name='ip'
                label={t('edge-management.txt-ip')}
                variant='outlined'
                fullWidth={true}
                size='small'
                value={edge.info.ip}
                onChange={this.handleDataChange}
                disabled={true} />
            </div>
            <div className='group'>
              <TextFieldComp
                id='edgeIPlist'
                name='edgeIPlist'
                label={edgeIpText}
                variant='outlined'
                fullWidth={true}
                size='small'
                value={edge.info.edgeIPlist}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge' || !edge.info.isConfigurable} />
            </div>
            <div className='group'>
              <TextFieldComp
                id='edgeVPNip'
                name='vpnIP'
                label={t('edge-management.txt-vpnIP')}
                variant='outlined'
                fullWidth={true}
                size='small'
                value={edge.info.edgeIPlist}
                disabled={true} />
            </div>
            <div className='group'>
              <TextFieldComp
                id='edgeLicenseName'
                name='licenseName'
                label={t('edge-management.txt-vpnLicenseName')}
                variant='outlined'
                fullWidth={true}
                size='small'
                value={edge.info.licenseName}
                disabled={true} />
            </div>
            <div className='group'>
              <TextFieldComp
                id='edgeServiceType'
                name='serviceType'
                label={t('edge-management.txt-serviceType')}
                variant='outlined'
                fullWidth={true}
                size='small'
                value={edge.info.serviceType}
                disabled={true} />
            </div>
            <div className='group'>
              <StyledTextField
                id='edgeServiceMode'
                name='serviceMode'
                select
                label={t('edge-management.txt-serviceMode')}
                variant='outlined'
                fullWidth={true}
                size='small'
                value={edge.info.serviceMode}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge' || !edge.info.isConfigurable}>
                <MenuItem value={'REALTIME'}>{t('txt-realtime')}</MenuItem>
                <MenuItem value={'TCPDUMP'}>{t('txt-tcpdump')}</MenuItem>
              </StyledTextField>
            </div>
            <div className='group'>
              <TextFieldComp
                id='edgeLongitude'
                name='longitude'
                label={t('edge-management.txt-longitude')}
                variant='outlined'
                fullWidth={true}
                size='small'
                value={edge.info.longitude}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge'} />
            </div>
            <div className='group'>
              <TextFieldComp
                id='edgeLatitude'
                name='latitude'
                label={t('edge-management.txt-latitude')}
                variant='outlined'
                fullWidth={true}
                size='small'
                value={edge.info.latitude}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge'} />
            </div>
            <div className='group full'>
              {activeContent === 'editEdge' &&
                <button className='btn add-group' onClick={this.toggleManageGroup}>{t('txt-manage')}</button>
              }
              <label>{t('txt-group')}</label>
              {activeContent === 'viewEdge' &&
                <div className='flex-item'>{edge.info.edgeGroupList.map(this.displayGroup)}</div>
              }
              {activeContent === 'editEdge' &&
                <Combobox
                  list={allGroup}
                  multiSelect={{
                    enabled: true,
                    toggleAll: true
                  }}
                  value={edge.info.edgeGroupList}
                  onChange={this.handleDataChange.bind(this, 'edgeGroupList')} />
              }
            </div>
            <div className='group'>
              <FormLabel>{t('edge-management.txt-activatTime')}</FormLabel>
              <RadioGroup
                name='edgeModeType'
                value={edge.info.edgeModeType}
                onChange={this.handleDataChange}>
                <FormControlLabel
                  value='anyTime'
                  control={
                    <Radio color='primary' />
                  }
                  label={t('edge-management.txt-anyTime')}
                  disabled={activeContent === 'viewEdge' || !edge.info.isConfigurable} />
                <FormControlLabel
                  value='customTime'
                  control={
                    <Radio color='primary' />
                  }
                  label={t('edge-management.txt-customTime')}
                  disabled={activeContent === 'viewEdge' || !edge.info.isConfigurable} />
              </RadioGroup>

              {edge.info.edgeModeType === 'customTime' &&
                <DateRange
                  id='edgeModeDatetime'
                  className='daterange'
                  enableTime={true}
                  value={edge.info.edgeModeDatetime}
                  onChange={this.handleDateChange}
                  locale={locale}
                  t={et} />
              }
            </div>
            <div className='group full'>
              <TextFieldComp
                id='edgeMemo'
                name='memo'
                label={memoText}
                multiline={true}
                rows={4}
                maxLength={250}
                variant='outlined'
                fullWidth={true}
                size='small'
                value={edge.info.memo}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewEdge'} />
            </div>
          </div>
        </div>

        {activeContent === 'editEdge' &&
          <footer>
            <button className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</button>
            <button onClick={this.handleEdgeSubmit}>{t('txt-save')}</button>
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
    const {showFilter, allGroupList, serviceType, connectionStatus, edgeSearch} = this.state;
    const allGroup = _.map(allGroupList, val => {
      return {
        value: val,
        text: val
      }
    });

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='edgeSearchKeyword'>{f('edgeFields.keywords')}</label>
            <input
              id='edgeSearchKeyword'
              type='text'
              value={edgeSearch.keyword}
              onChange={this.handleEdgeSearch.bind(this, 'keyword')} />
          </div>
          <div className='group'>
            <label htmlFor='edgeSearchGroups'>{f('edgeFields.groups')}</label>
            <Combobox
              id='edgeSearchGroups'
              list={allGroup}
              multiSelect={{
                enabled: true,
                toggleAll: true
              }}
              value={edgeSearch.groups}
              onChange={this.handleEdgeSearch.bind(this, 'groups')} />
          </div>
          <div className='group'>
            <label htmlFor='edgeSearchServiceType'>{f('edgeFields.serviceType')}</label>
            <DropDownList
              id='edgeSearchServiceType'
              list={serviceType}
              required={true}
              value={edgeSearch.serviceType}
              onChange={this.handleEdgeSearch.bind(this, 'serviceType')} />
          </div>
          <div className='group'>
            <label htmlFor='edgeSearchConnectionStatus'>{f('edgeFields.connectionStatus')}</label>
            <DropDownList
              id='edgeSearchConnectionStatus'
              list={connectionStatus}
              required={true}
              value={edgeSearch.connectionStatus}
              onChange={this.handleEdgeSearch.bind(this, 'connectionStatus')} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getEdgeData.bind(this, 'search')}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
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
              <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
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
                  className='subtab-menu'
                  menu={{
                    edge: t('txt-edge'),
                    geography: t('edge-management.txt-geography')
                  }}
                  current={activeTab}
                  onChange={this.handleSubTabChange}>
                </Tabs>

                <div className='content-header-btns'>
                  <button className='standard btn' onClick={this.triggerSyncBtn} disabled={!syncEnable}>{t('notifications.txt-sync')}</button>
                  <Link to='/SCP/configuration/notifications'><button className='standard btn'>{t('notifications.txt-settings')}</button></Link>
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