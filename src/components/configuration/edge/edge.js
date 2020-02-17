import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { NavLink, Link, Switch, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import DateRange from 'react-ui/build/src/components/date-range'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import RadioGroup from 'react-ui/build/src/components/radio-group'
import Textarea from 'react-ui/build/src/components/textarea'
import ToggleBtn from 'react-ui/build/src/components/toggle-button'

import {BaseDataContext} from '../../common/context';
import {HocConfig as Config} from '../../common/configuration'
import helper from '../../common/helper'
import TableContent from '../../common/table-content'
import withLocale from '../../../hoc/locale-provider'

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
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');

    this.state = {
      activeContent: 'tableList', //tableList, editEdge
      showFilter: false,
      currentEdgeData: '',
      serviceType: [],
      connectionStatus: [
        {value: 'all', text: t('txt-all')},
        {value: 'Normal', text: 'Normal'},
        {value: 'Error', text: 'Error'}
      ],
      edgeSearch: {
        keyword: '',
        serviceType: 'all',
        connectionStatus: 'all'
      },
      edge: {
        dataFieldsArr: ['agentName', 'ipPort', 'serviceType', 'description', '_menu'],
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
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.getEdgeServiceType();
    this.getEdgeData();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state === 'tableList') {
      this.toggleContent('tableList');
    }
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
        return <li key={val}><span>{descHeader}:</span> {allValue.honeyPotHostDTO[val]}</li>
      }
    } else if (val === 'lastAlertDataUpdDT' || val === 'lastStatusUpdDT' || val === 'threatIntellLastUpdDT') {
      return <li key={val}><span>{descHeader}:</span> {helper.getFormattedDate(allValue[val], 'local')}</li>
    } else if (val === 'TCPDUMP') {
      if (allValue.agentMode === 'TCPDUMP') {
        return (
          <section key={val}>
            {allValue.agentStartDT &&
              <li><span>{t('txt-start')}:</span> {helper.getFormattedDate(allValue.agentStartDT)}</li>
            }
            {allValue.agentEndDT &&
              <li><span>{t('txt-stop')}:</span> {helper.getFormattedDate(allValue.agentEndDT)}</li>
            }
            {allValue.lastAnalyzedStatus && allValue.lastAnalyzedStatus !== 'ANALYZED' &&
              <button onClick={this.agentAnalysis.bind(this, allValue)}>{t('txt-analyze')}</button>
            }
            {allValue.lastAnalyzedStatus &&
              <li><span>lastAnalyzedStatus:</span> {allValue.lastAnalyzedStatus}</li>
            }
            {allValue.lastAnalyzedStatusUpdDT &&
              <li><span>lastAnalyzedStatusUpdDT:</span> {helper.getFormattedDate(allValue.lastAnalyzedStatusUpdDT, 'local')}</li>
            }
          </section>
        )
      }
    } else if (val === 'rx_pkts' || val === 'tx_pkts') {
      if (allValue.statistics && allValue.statistics[val]) {
        return <li key={val}><span>{descHeader}:</span> {allValue.statistics[val]}</li>
      }
    } else {
      return <li key={val}><span>{descHeader}:</span> {allValue[val]}</li>
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
      <ul>
        {desc.map(this.getIndividualDesc.bind(this, allValue))}
      </ul>
    )
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
    let data = {};

    if (edgeSearch.keyword) {
      data.keyword = edgeSearch.keyword;
    }

    if (edgeSearch.serviceType && edgeSearch.serviceType !== 'all') {
      data.serviceType = edgeSearch.serviceType;
    }

    if (edgeSearch.connectionStatus && edgeSearch.connectionStatus !== 'all') {
      data.connectionStatus = edgeSearch.connectionStatus;
    }

    helper.getAjaxData('POST', url, data)
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
              } else if (tempData === 'description') {
                const serviceDescList = SERVICE_TYPE_LIST[allValue.serviceType];

                if (serviceDescList) {
                  return this.getServiceDesc(allValue, serviceDescList);
                }
              } else if (tempData === '_menu') {
                return (
                  <div className='table-menu menu active'>
                    <i className='fg fg-edit' onClick={this.toggleContent.bind(this, 'editEdge', allValue)} title={t('txt-edit')}></i>
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
          edge: tempEdge
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg(t('txt-error'));
    });
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
   * @param {string} value - input value
   */
  handleEdgeSearch = (type, value) => {
    let tempEdgeSearch = {...this.state.edgeSearch};
    tempEdgeSearch[type] = value;

    this.setState({
      edgeSearch: tempEdgeSearch
    });
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - page type ('tableList', 'editEdge' and 'cancel')
   * @param {object} allValue - Edge data
   */
  toggleContent = (type, allValue) => {
    let tempEdge = {...this.state.edge};
    let showPage = type;

    if (type === 'editEdge') {
      tempEdge.info = {
        name: allValue.agentName ? allValue.agentName : '',
        id: allValue.agentId,
        projectId: allValue.projectId,
        ip: allValue.ipPort,
        vpnIP: allValue.vpnIp,
        licenseName: allValue.vpnName,
        serviceType: allValue.serviceType,
        serviceMode: allValue.agentMode,
        edgeModeType: 'anyTime',
        edgeModeDatetime: {
          from: '',
          to: ''
        },
        memo: allValue.memo,
        agentApiStatus: allValue.agentApiStatus,
        lastUpdateTime: allValue.lastStatusUpdDT,
        lastStatus: allValue.lastStatus,
        isConfigurable: allValue.isConfigurable
      };

      if (allValue.agentStartDT &&  allValue.agentEndDT) {
        tempEdge.info.edgeModeType = 'customTime';
        tempEdge.info.edgeModeDatetime.from = allValue.agentStartDT;
        tempEdge.info.edgeModeDatetime.to = allValue.agentEndDT;
      }

      this.setState({
        showFilter: false
      });
    } else if (type === 'tableList') {
      tempEdge.info = {};
    } else if (type === 'cancel') {
      showPage = 'tableList';
      tempEdge.info = {};
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
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleDataChange = (type, value) => {
    let tempEdge = {...this.state.edge};
    tempEdge.info[type] = value;

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
   * Handle Edge Edit confirm
   * @method
   */
  handleEdgeSubmit = () => {
    const {baseUrl} = this.context;
    const {edge} = this.state;
    let data = {
      id: edge.info.id,
      agentName: edge.info.name,
      memo: edge.info.memo
    };

    if (edge.info.isConfigurable) {
      if (edge.info.edgeIPlist) {
        data.ipList = edge.info.edgeIPlist;
      }

      if (edge.info.serviceMode) {
        data.agentMode = edge.info.serviceMode;
      }

      if (edge.info.edgeModeType === 'customTime') {
        if (edge.info.edgeModeDatetime.from) {
          if (edge.info.edgeModeDatetime.to) {
            data.agentStartDt = Moment(edge.info.edgeModeDatetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
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
            data.agentEndDt = Moment(edge.info.edgeModeDatetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
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

    ah.one({
      url: `${baseUrl}/api/agent`,
      data: JSON.stringify(data),
      type: 'PATCH',
      contentType: 'text/plain'
    })
    .then(data => {
      switch(data.ret) {
        case 0:
          helper.showPopupMsg(t('edge-management.txt-edgeEditSuccess'));
          break;
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
      this.toggleContent('tableList');
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display edit Edge content
   * @method
   * @returns HTML DOM
   */
  displayEditEdgeContent = () => {
    const {contextRoot, locale} = this.context;
    const {activeContent, edge} = this.state;
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
        <header className='main-header'>{t('edge-management.txt-editEdge')}</header>
        <div className='form-group normal'>
          <header>
            <div className='text'>{t('edge-management.txt-basicInfo')}</div>
            {icon &&
              <img className='status' src={icon.src} title={icon.title} />
            }
            {edge.info.lastUpdateTime &&
              <span className='msg'>{t('edge-management.txt-lastUpateTime')} {helper.getFormattedDate(edge.info.lastUpdateTime, 'local')}</span>
            }
          </header>
          {edge.info.lastStatus &&
            <ToggleBtn
              className='toggle-btn'
              onText='On'
              offText='Off'
              on={btnStatusOn}
              onChange={this.handleEdgeStatusChange.bind(this, action)}
              disabled={!edge.info.isConfigurable} />
          }
          <div className='group'>
            <label htmlFor='edgeName'>{t('edge-management.txt-edgeName')}</label>
            <Input
              id='edgeName'
              onChange={this.handleDataChange.bind(this, 'name')}
              value={edge.info.name} />
          </div>
          <div className='group'>
            <label htmlFor='edgeID'>{t('edge-management.txt-edgeID')}</label>
            <Input
              id='edgeID'
              onChange={this.handleDataChange.bind(this, 'id')}
              value={edge.info.id}
              readOnly={true} />
          </div>
          <div className='group'>
            <label htmlFor='edgeIP'>{t('edge-management.txt-ip')}</label>
            <Input
              id='edgeIP'
              onChange={this.handleDataChange.bind(this, 'ip')}
              validate={{
                pattern:/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):(\d+)$/,
                patternReadable:'xxx.xxx.xxx.xxx:xxx',
                t:(code, {value, pattern}) => {
                  if (code[0] === 'missing') {
                    return t('txt-required');
                  } else if (code[0] === 'no-match') {
                    return t('edge-management.txt-ipValidationFail');
                  }
                }
              }}
              value={edge.info.ip}
              readOnly={true} />
          </div>
          <div className='group'>
            <label htmlFor='edgeIPlist'>{t('edge-management.txt-ipList')} ({t('txt-commaSeparated')}</label>
            <Input
              id='edgeIPlist'
              onChange={this.handleDataChange.bind(this, 'edgeIPlist')}
              value={edge.info.edgeIPlist}
              readOnly={!edge.info.isConfigurable} />
          </div>
          <div className='group'>
            <label htmlFor='edgeVPNip'>{t('edge-management.txt-vpnIP')}</label>
            <Input
              id='edgeVPNip'
              onChange={this.handleDataChange.bind(this, 'vpnIP')}
              value={edge.info.vpnIP}
              readOnly={true} />
          </div>
          <div className='group'>
            <label htmlFor='edgeLicenseName'>{t('edge-management.txt-vpnLicenseName')}</label>
            <Input
              id='edgeLicenseName'
              onChange={this.handleDataChange.bind(this, 'licenseName')}
              value={edge.info.licenseName}
              readOnly={true} />
          </div>
          <div className='group'>
            <label htmlFor='edgeServiceType'>{t('edge-management.txt-serviceType')}</label>
            <Input
              id='edgeServiceType'
              onChange={this.handleDataChange.bind(this, 'serviceType')}
              value={edge.info.serviceType}
              readOnly={true} />
          </div>
          <div className='group'>
            <label htmlFor='edgeServiceMode'>{t('edge-management.txt-serviceMode')}</label>
            <DropDownList
              id='edgeServiceMode'
              required={true}
              list={[
                {
                  value: 'REALTIME',
                  text: t('txt-realtime')
                },
                {
                  value: 'TCPDUMP',
                  text: t('txt-tcpdump')
                }
              ]}
              onChange={this.handleDataChange.bind(this, 'serviceMode')}
              value={edge.info.serviceMode}
              readOnly={!edge.info.isConfigurable} />
          </div>
          <div className='group'>
            <label>{t('edge-management.txt-activatTime')}</label>
            <RadioGroup
              id='edgeModeType'
              className='radio-group'
              list={[
                {value: 'anyTime', text: t('edge-management.txt-anyTime')},
                {value: 'customTime', text: t('edge-management.txt-customTime')}
              ]}
              onChange={this.handleDataChange.bind(this, 'edgeModeType')}
              value={edge.info.edgeModeType}
              disabled={!edge.info.isConfigurable} />

            {edge.info.edgeModeType === 'customTime' &&
              <DateRange
                id='edgeModeDatetime'
                className='daterange'
                onChange={this.handleDataChange.bind(this, 'edgeModeDatetime')}
                enableTime={true}
                value={edge.info.edgeModeDatetime}
                locale={locale}
                t={et} />
            }
          </div>
          <div className='group full'>
            <label htmlFor='edgeMemo'>{t('txt-memo')} ({t('txt-memoMaxLength')})</label>
            <Textarea
              id='edgeMemo'
              rows={4}
              maxLength={250}
              value={edge.info.memo}
              onChange={this.handleDataChange.bind(this, 'memo')} />
          </div>
        </div>
        <footer>
          <button className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</button>
          <button onClick={this.handleEdgeSubmit}>{t('txt-save')}</button>
        </footer>
      </div>
    )
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, serviceType, connectionStatus, edgeSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='edgeSearchKeyword' className='first-label'>{f('edgeFields.keywords')}</label>
            <Input
              id='edgeSearchKeyword'
              className='search-textarea'
              onChange={this.handleEdgeSearch.bind(this, 'keyword')}
              value={edgeSearch.keyword} />
          </div>
          <div className='group'>
            <label htmlFor='edgeSearchServiceType'>{f('edgeFields.serviceType')}</label>
            <DropDownList
              id='edgeSearchServiceType'
              list={serviceType}
              required={true}
              onChange={this.handleEdgeSearch.bind(this, 'serviceType')}
              value={edgeSearch.serviceType} />
          </div>
          <div className='group'>
            <label htmlFor='edgeSearchConnectionStatus'>{f('edgeFields.connectionStatus')}</label>
            <DropDownList
              id='edgeSearchConnectionStatus'
              list={connectionStatus}
              required={true}
              onChange={this.handleEdgeSearch.bind(this, 'connectionStatus')}
              value={edgeSearch.connectionStatus} />
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
    const {activeContent, showFilter, edge} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
          </div>
        </div>

        <div className='data-content'>
          <Config />

          <div className='parent-content'>
            { this.renderFilter() }

            {activeContent === 'tableList' &&
              <div className='main-content'>
                <header className='main-header'>{t('txt-edge')}</header>

                <div className='content-header-btns'>
                  <button className='standard btn'><Link to='/SCP/configuration/notifications'>{t('notifications.txt-settings')}</Link></button>
                </div>

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
              </div>
            }

            {activeContent === 'editEdge' &&
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

const HocEdge = withRouter(withLocale(Edge));
export { Edge, HocEdge };