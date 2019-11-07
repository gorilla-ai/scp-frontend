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

import {HocConfig as Config} from '../../common/configuration'
import helper from '../../common/helper'
import TableContent from '../../common/table-content'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

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
    this.getEdgeServiceType();
    this.getEdgeData();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state === 'tableList') {
      this.toggleContent('tableList');
    }
  }
  getEdgeServiceType = () => {
    const {baseUrl, contextRoot} = this.props;
    const url = `${baseUrl}/api/edge/serviceType`;

    this.ah.one({
      url: url,
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
  getEdgeData = (fromSearch) => {
    const {baseUrl, contextRoot} = this.props;
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

                return (
                  <span><img src={icon.src} title={icon.title} />{value}</span>
                )
              } else if (tempData === 'description') {
                let serviceType = allValue.serviceType;

                if (serviceType === 'NETTRAP') {
                  return (
                    <ul>
                      {allValue.honeyPotHostDTO && allValue.honeyPotHostDTO.honeypot &&
                        <li><span>honeypot:</span> {allValue.honeyPotHostDTO.honeypot}</li>
                      }
                      {allValue.honeyPotHostDTO && allValue.honeyPotHostDTO.lastDataUpdDT &&
                        <li><span>lastDataUpdDT:</span> {helper.getFormattedDate(allValue.honeyPotHostDTO.lastDataUpdDT, 'local')}</li>
                      }
                      {allValue.honeyPotHostDTO &&
                        <li><span>attackCnt:</span> {allValue.honeyPotHostDTO.attackCnt}</li>
                      }
                    </ul>
                  )
                } else if (serviceType === 'NETFLOW-IDS-SURICATA') {
                  return (
                    <ul>
                      {allValue.agentMode &&
                        <li><span>mode:</span> {allValue.agentMode}</li>
                      }
                      {allValue.lastStatus &&
                        <li><span>status:</span> {allValue.lastStatus}</li>
                      }
                      {allValue.agentMode && allValue.agentMode === 'TCPDUMP' &&
                        <section>
                          {allValue.agentStartDT &&
                            <li><span>start:</span> {helper.getFormattedDate(allValue.agentStartDT)}</li>
                          }
                          {allValue.agentEndDT &&
                            <li><span>end:</span> {helper.getFormattedDate(allValue.agentEndDT)}</li>
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
                      }
                      {allValue.threatIntellLastUpdDT &&
                        <li><span>threatIntellLastUpdDT:</span> {helper.getFormattedDate(allValue.threatIntellLastUpdDT, 'local')}</li>
                      }
                    </ul>
                  )
                } else if (serviceType === 'IPS-NETPROBE') {
                  return (
                    <ul>
                      {allValue.lastStatus &&
                        <li><span>lastStatus:</span> {allValue.lastStatus}</li>
                      }
                      {allValue.lastStatusUpdDT &&
                        <li><span>lastStatusUpdDT:</span> {helper.getFormattedDate(allValue.lastStatusUpdDT, 'local')}</li>
                      }
                      {allValue.threatIntellLastUpdDT &&
                        <li><span>threatIntellLastUpdDT:</span> {helper.getFormattedDate(allValue.threatIntellLastUpdDT, 'local')}</li>
                      }
                      {allValue.statistics && allValue.statistics.rx_pkts &&
                        <li><span>received packets:</span> {allValue.statistics.rx_pkts}</li>
                      }
                      {allValue.statistics && allValue.statistics.tx_pkts &&
                        <li><span>transferred packets:</span> {allValue.statistics.tx_pkts}</li>
                      }
                      {allValue.honeyPotHostDTO &&
                        <li><span>attackCnt:</span> {allValue.honeyPotHostDTO.attackCnt}</li>
                      }
                    </ul>
                  )
                } else {
                  return;
                }
              } else if (tempData === '_menu') {
                return (
                  <div className='table-menu menu active'>
                    <i className='fg fg-edit' onClick={this.toggleContent.bind(this, 'editEdge', allValue, i)} title={t('txt-edit')}></i>
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
    })
    .catch(err => {
      helper.showPopupMsg(t('txt-error'));
    });
  }
  agentAnalysis = (allValue) => {
    const {baseUrl, contextRoot} = this.props;
    const url = `${baseUrl}/api/agent/_analyze?projectId=${allValue.projectId}`;

    ah.one({
      url: url,
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
  checkSortable = (field) => {
    const unSortableFields = ['description', '_menu'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  handleTableSort = (value) => {
    let tempEdge = {...this.state.edge};
    tempEdge.sort.field = value.field;
    tempEdge.sort.desc = !tempEdge.sort.desc;

    this.setState({
      edge: tempEdge
    }, () => {
      this.getEdgeData();
    });
  }
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
  handleEdgeSearch = (type, value) => {
    let tempEdgeSearch = {...this.state.edgeSearch};
    tempEdgeSearch[type] = value;

    this.setState({
      edgeSearch: tempEdgeSearch
    });
  }
  toggleContent = (type, allValue, index) => {
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
  handleDataChange = (type, value) => {
    let tempEdge = {...this.state.edge};
    tempEdge.info[type] = value;

    this.setState({
      edge: tempEdge
    });
  }
  handleEdgeStatusChange = (type) => {
    const {baseUrl, contextRoot} = this.props;
    const {edge} = this.state;
    const url = `${baseUrl}/api/agent/_${type}?id=${edge.info.id}&projectId=${edge.info.projectId}`;

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      let tempEdge = {...this.state.edge};
      tempEdge.info.lastStatus = data;

      this.setState({
        edge: tempEdge
      });
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
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
  deleteEdge = () => {
    const {baseUrl, contextRoot} = this.props;
    const {currentEdgeData} = this.state;

    ah.one({
      url: `${baseUrl}/api/edge?id=${currentEdgeData.agentId}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getEdgeData();
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleEdgeSubmit = () => {
    const {baseUrl, contextRoot} = this.props;
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
  displayEditEdgeContent = () => {
    const {baseUrl, contextRoot} = this.props;
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
  toggleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter
    });
  }
  clearFilter = () => {
    this.setState({
      edgeSearch: {
        keyword: '',
        serviceType: 'all',
        connectionStatus: 'all'
      }
    });
  }
  getBtnPos = (type) => {
    const {locale} = this.props;

    if (type === 'add') {
      if (locale === 'zh') {
        return '120px';
      } else if (locale === 'en') {
        return '200px';
      }
    }
  }
  render() {
    const {baseUrl, contextRoot, language, locale, session} = this.props;
    const {activeContent, showFilter, edge} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            locale={locale}
            session={session} />

          <div className='parent-content'>
            { this.renderFilter() }

            {activeContent === 'tableList' &&
              <div className='main-content'>
                <header className='main-header'>{t('txt-edge')}</header>
                <button className='standard btn last'><Link to='/ChewbaccaWeb/configuration/notifications'>{t('notifications.txt-settings')}</Link></button>
                {/*<button className='standard btn' style={{right: this.getBtnPos('add')}}>{t('edge-management.txt-threatSettings')}</button>*/}

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

Edge.propTypes = {
  baseUrl: PropTypes.string.isRequired
};

const HocEdge = withRouter(withLocale(Edge));
export { Edge, HocEdge };