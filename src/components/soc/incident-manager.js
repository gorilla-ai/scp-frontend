import React, { Component } from 'react'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import _ from 'lodash'
import cx from 'classnames'

import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardDateTimePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreIcon from '@material-ui/icons/More'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import DataTable from 'react-ui/build/src/components/table'
import {downloadLink, downloadWithForm} from 'react-ui/build/src/utils/download'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../common/context'
import constants from '../constant/constant-incidnet'
import helper from '../common/helper'
import IncidentComment from './common/comment'
import IncidentFlowDialog from './common/flow-dialog'
import IncidentForm from './common/incident-form'
import IncidentReview from './common/review'
import IncidentTag from './common/tag'
import MuiTableContentWithoutLoading from '../common/mui-table-content-withoutloading'
import NotifyDialog from './common/notify-dialog'
import RelatedList from './common/related-list'
import SocConfig from '../common/soc-configuration'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const FILE_NAME_PATTERN = /^[a-z0-9-_]+$/i;
const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};

let t = null;
let f = null;
let et = null;
let it = null;
let at = null;

/**
 * IncidentManagement
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the SOC Incident Management page
 */
class IncidentManagement extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');
    at = global.chewbaccaI18n.getFixedT(null, 'account');

    this.state = {
      activeContent: 'tableList', //tableList, viewIncident, editIncident, addIncident
      displayPage: 'main', //'main', 'events', 'ttps' or 'edr'
      incidentType: '',
      incidentFormType: '', //'monitor', analyze' or 'EDR'
      toggleType: '',
      showFilter: false,
      showChart: true,
      relatedListOpen: false,
      uploadAttachmentOpen: false,
      statisticsReportOpen: false,
      sendIncidentOpen: false,
      tempSavedData: {},
      currentIncident: {},
      originalIncident: {},
      accountType: constants.soc.LIMIT_ACCOUNT,
      accountDefault: false,
      severityList: [],
      socFlowSourceList: [],
      socFlowList: [],
      selectedStatus: [],
      tagList: [],
      search: {
        keyword: '',
        category: 0,
        status: 0,
        datetime: {
          from: helper.getSubstractDate(1, 'month'),
          to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
        },
        tagList: [],
        isExpired: 2,
        checkbox: {
          isExpired: false,
          creator: false
        }
      },
      severitySelected: [],
      dashboard: {
        all: 0,
        expired: 0,
        unhandled: 0,
        mine: 0
      },
      deviceListOptions: [],
      showDeviceListOptions: [],
      incident: {
        dataFieldsArr: ['_menu', 'id', 'tag', 'status', 'severity', 'createDttm', 'updateDttm', 'title', 'reporter', 'srcIPListString' , 'dstIPListString'],
        fileFieldsArr: ['fileName', 'fileSize', 'fileDttm', 'fileMemo', 'action'],
        flowFieldsArr: ['id', 'status', 'reviewDttm', 'reviewerName', 'suggestion'],
        dataFields: [],
        dataContent: [],
        sort: {
          field: 'createDttm',
          desc: true
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        info: {
          status: 1,
          socType: 1
        }
      },
      notifyEmailList: [],
      accountRoleType: [],
      loadListType: 2,
      attach: null,
      filesName: [],
      monthlyReport: {
        fileName: '',
        date: moment().local().format('YYYY-MM-DDTHH:mm:ss'),
        info: ''
      },
      activeIncidentId: '',
      attachmentCheckAll: false,
      attachmentList: [],
      attachmentSelectedList: [],
      contextAnchor: null,
      menuType: '', //'incidentMenu' or 'tableMenu'
      currentData: {},
      incidentAccidentList: _.map(_.range(1, 6), el => {
        return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
      }),
      incidentAccidentSubList: [
        _.map(_.range(11, 17), el => {
          return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
        }),
        _.map(_.range(21, 26), el => {
          return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
        }),
        _.map(_.range(31, 33), el => {
          return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
        }),
        _.map(_.range(41, 45), el => {
          return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
        })
      ]
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'soc', locale);
    helper.inactivityTime(baseUrl, locale);

    let alertDataId = this.getQueryString('alertDataId');
    let alertData = sessionStorage.getItem(alertDataId);

    this.checkAccountType();
    this.setDefaultSearchOptions(alertData, alertDataId);
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  setDefaultSearchOptions = (alertData, alertDataId) => {
    const {baseUrl, session} = this.context;
    const severityList = _.map(SEVERITY_TYPE, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/flow/_search`,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    }).then(data => {
      if (data) {
        let flowSourceList = [];
        const list = _.map(data.rt.rows, val => {
          flowSourceList.push(val);
          return <MenuItem key={val.id} value={val.id}>{`${val.name}`}</MenuItem>
        });

        this.setState({
          socFlowSourceList: flowSourceList,
          socFlowList: list
        });
      }
    }).catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });

    this.setState({
      severityList,
    }, () => {
      if (alertData) {
        this.toggleContent('redirect', alertData);
        sessionStorage.removeItem(alertDataId);

        this.setState({
          accountRoleType: session.roles
        }, () => {
          this.getOptions();
        });
      } else {
        this.setState({
          accountRoleType: session.roles
        }, () => {
          this.loadCondition('button', 'mine');
          this.getOptions();
        });
      }
    });
  }
  getQueryString = (name) => {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    const r = window.location.search.substr(1).match(reg);

    if (r != null) return unescape(r[2]);
    return null;
  }
  checkAccountType = () => {
    const {baseUrl, session} = this.context;
    const requestData = {
      account: session.accountId
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
        if (data.rt.isLimitType === constants.soc.LIMIT_ACCOUNT) {
          this.setState({
            accountType: constants.soc.LIMIT_ACCOUNT
          });
        } else if (data.rt.isLimitType === constants.soc.NONE_LIMIT_ACCOUNT) {
          this.setState({
            accountType: constants.soc.NONE_LIMIT_ACCOUNT
          });
        } else {
          this.setState({
            accountType: constants.soc.CHECK_ERROR
          });
        }
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  /**
   * Get request data payload
   * @method
   */
  getIncidentRequestData = () => {
    const {session} = this.context;
    const {search, severitySelected, selectedStatus, accountRoleType} = this.state;

    if (search.datetime) {
      search.startDttm = moment(search.datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      search.endDttm = moment(search.datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    }

    search.isExecutor = _.includes(session.roles, 'SOC Executor');
    search.accountRoleType = accountRoleType;
    search.account = session.accountId;
    search.status = selectedStatus;

    const requestData = {
      ...search,
      severity: severitySelected
    };

    requestData.isExpired = search.checkbox.isExpired ? 1 : 2;

    if (search.checkbox.creator) {
      requestData.creator = session.accountId;
    }

    delete requestData.checkbox;

    return requestData;
  }
  /**
   * Get and set Incident Device table data
   * @method
   * @param {string} fromSearch - option for the 'search'
   */
  loadData = (fromSearch) => {
    const {baseUrl, contextRoot} = this.context;
    const {incident} = this.state;
    const sort = incident.sort.desc ? 'desc' : 'asc';
    const page = fromSearch === 'currentPage' ? incident.currentPage : 0;
    const requestData = this.getIncidentRequestData();

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/_searchV4?page=${page + 1}&pageSize=${incident.pageSize}&orders=${incident.sort.field} ${sort}`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data) {
        let tempIncident = {...incident};
        tempIncident.dataContent = data.rt.rows;
        tempIncident.totalCount = data.rt.counts;
        tempIncident.currentPage = page;

        tempIncident.dataFields = _.map(incident.dataFieldsArr, val => {
          return {
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : f(`incidentFields.${val}`),
            options: {
              filter: true,
              sort: val === 'severity' || val === 'id' || val === 'createDttm' || val === 'updateDttm',
              customBodyRenderLite: (dataIndex, options) => {
                const allValue = tempIncident.dataContent[dataIndex];
                let value = tempIncident.dataContent[dataIndex][val];

                if (options === 'getAllValue') {
                  return allValue;
                }

                if (val === '_menu') {
                  return (
                    <IconButton aria-label='more' onClick={this.handleOpenMenu.bind(this, 'tableMenu', allValue)}>
                      <MoreIcon />
                    </IconButton>
                  )
                } else if (val === 'type') {
                  let tmpList = [];
                  tmpList = allValue.ttpList;

                  if (tmpList.length === 0) {
                    return <span>{it('txt-incident-event')}</span>
                  } else {
                    return <span>{it('txt-incident-related')}</span>
                  }
                } else if (val === 'category') {
                  return <span>{it(`category.${value}`)}</span>
                } else if (val === 'status') {
                  let status = 'N/A'

                  if (allValue.flowData) {
                    if (allValue.flowData.finish) {
                      if (value === constants.soc.INCIDENT_STATUS_SUBMITTED) {
                        return <span>{it('status.4')}</span>
                      } else if (value === constants.soc.INCIDENT_STATUS_DELETED) {
                        return <span>{it('status.5')}</span>
                      } else if (value === constants.soc.INCIDENT_STATUS_EXECUTOR_CLOSE) {
                        return <span>{it('status.8')}</span>
                      } else {
                        return <span>{it('status.3')}</span>
                      }
                    } else {
                      if (value === constants.soc.INCIDENT_STATUS_EXECUTOR_CLOSE) {
                        return <span>{it('status.8')}</span>
                      } else if (allValue.flowData.currentEntity) {
                        status = allValue.flowData.currentEntity[allValue.id].entityName;
                      }
                    }
                  } else if (value === constants.soc.INCIDENT_STATUS_DELETED) {
                    return <span>{it('status.5')}</span>
                  }
                  return <span>{status}</span>
                } else if (val === 'createDttm') {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                } else if (val === 'updateDttm') {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                } else if (val === 'tag') {
                    const tags = _.map(allValue.tagList, 'tag.tag');

                    return (
                      <div>
                        {
                          _.map(allValue.tagList, el => {
                            return (
                              <div style={{display: 'flex', marginRight: '30px'}}>
                                <div className='incident-tag-square' style={{backgroundColor: el.tag.color}}></div>
                                  &nbsp;{el.tag.tag}
                              </div>
                            )
                          })
                        }
                      </div>
                    )
                } else if (val === 'severity') {
                  return <span className='severity-level' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>
                } else if (val === 'srcIPListString' || val === 'dstIPListString') {
                  let formattedPatternIP = '';

                  if (value.length > 32) {
                    formattedPatternIP = value.substr(0, 32) + '...';
                  } else {
                    formattedPatternIP = value;
                  }
                  return <span>{formattedPatternIP}</span>
                } else {
                  return <span>{value}</span>
                }
              }
            }
          };
        });

        this.setState({
          incident: tempIncident,
          activeContent: 'tableList',
          loadListType: 3
        });
      }
      return null
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set Incident Device table data
   * @method
   * @param {string} fromSearch - option for the 'search'
   */
  loadWithoutDateTimeData = (fromSearch, searchPayload) => {
    const {baseUrl, contextRoot, session} = this.context;
    const {incident} = this.state;
    const sort = incident.sort.desc ? 'desc' : 'asc';
    const page = fromSearch === 'currentPage' ? incident.currentPage : 0;
    searchPayload.account = session.accountId;
    searchPayload.status = this.state.selectedStatus;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/_searchV4?page=${page + 1}&pageSize=${incident.pageSize}&orders=${incident.sort.field} ${sort}`,
      data: JSON.stringify(searchPayload),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data) {
        let tempIncident = {...incident};
        tempIncident.dataContent = data.rt.rows;
        tempIncident.totalCount = data.rt.counts;
        tempIncident.currentPage = page;

        tempIncident.dataFields = _.map(incident.dataFieldsArr, val => {
          return {
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : f(`incidentFields.${val}`),
            options: {
              filter: true,
              sort: val === 'severity' || val === 'id' || val === 'createDttm' || val === 'updateDttm',
              customBodyRenderLite: (dataIndex, options) => {
                const allValue = tempIncident.dataContent[dataIndex];
                let value = tempIncident.dataContent[dataIndex][val];

                if (options === 'getAllValue') {
                  return allValue;
                }

                if (val === '_menu') {
                    return (
                      <div className='table-menu active'>
                        <IconButton aria-label='more' onClick={this.handleOpenMenu.bind(this, 'tableMenu', allValue)}>
                          <MoreIcon />
                        </IconButton>
                      </div>
                    )
                } else if (val === 'type') {
                  let tmpList = [];
                  tmpList = allValue.ttpList;

                  if (tmpList.length === 0) {
                    return <span>{it('txt-incident-event')}</span>
                  } else {
                    return <span>{it('txt-incident-related')}</span>
                  }
                } else if (val === 'category') {
                  return <span>{it(`category.${value}`)}</span>
                } else if (val === 'status') {
                  let status = 'N/A'

                  if (allValue.flowData) {
                    if (allValue.flowData.finish) {
                      if (value === constants.soc.INCIDENT_STATUS_SUBMITTED) {
                        return <span>{it('status.4')}</span>
                      } else if (value === constants.soc.INCIDENT_STATUS_DELETED) {
                        return <span>{it('status.5')}</span>
                      } else if (value === constants.soc.INCIDENT_STATUS_EXECUTOR_CLOSE) {
                        return <span>{it('status.8')}</span>
                      } else {
                        return <span>{it('status.3')}</span>
                      }
                    } else {
                      if (value === constants.soc.INCIDENT_STATUS_EXECUTOR_CLOSE) {
                        return <span>{it('status.8')}</span>
                      } else if (allValue.flowData.currentEntity) {
                        status = allValue.flowData.currentEntity[allValue.id].entityName;
                      }
                    }
                  } else if (value === constants.soc.INCIDENT_STATUS_DELETED) {
                    return <span>{it('status.5')}</span>
                  }
                  return <span>{status}</span>
                } else if (val === 'createDttm') {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                } else if (val === 'updateDttm') {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                } else if (val === 'tag') {
                  const tags = _.map(allValue.tagList, 'tag.tag');

                  return (
                    <div>
                        {
                          _.map(allValue.tagList, el => {
                            return (
                              <div style={{display: 'flex', marginRight: '30px'}}>
                                <div className='incident-tag-square' style={{backgroundColor: el.tag.color}} />
                                &nbsp;{el.tag.tag}
                              </div>
                            )
                          })
                        }
                    </div>
                  )
                } else if (val === 'severity') {
                  return <span className='severity-level' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>
                } else if (val === 'srcIPListString' || val === 'dstIPListString') {
                  let formattedPatternIP = '';

                  if (value.length > 32) {
                    formattedPatternIP = value.substr(0, 32) + '...';
                  } else {
                    formattedPatternIP = value;
                  }

                  return <span>{formattedPatternIP}</span>
                } else {
                  return <span>{value}</span>
                }
              }
            }
          };
        });

        this.setState({
          incident: tempIncident,
          activeContent: 'tableList'
        }, () => {
          this.loadDashboard();
        });
      }
      return null
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  loadDashboard = () => {
    const {baseUrl, session} = this.context;
    const req = {
      accountRoleType :this.state.accountRoleType
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.all([{
      url: `${baseUrl}/api/soc/statistic/_search?creator=${session.accountId}`,
      data: JSON.stringify(req),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    }])
    .then(data => {
      const dashboard = {
        expired: data[0].rt.rows[0].expireCount,
        unhandled: data[0].rt.rows[0].dealCount,
        mine: data[0].rt.rows[0].myCount
      };

      this.setState({
        dashboard
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  loadCondition = (from,type) => {
    const {session} = this.context;
    let fromSearch = from;
    let search = {
      subStatus:0,
      keyword: '',
      category: 0,
      isExpired: 2,
      accountRoleType: this.state.accountRoleType,
      isExecutor : _.includes(session.roles, 'SOC Executor'),
    };

    if (from === 'button') {
      fromSearch = 'search';
    }

    if (type === 'expired') {
      search.status = 0;
      search.isExpired = 1;

      this.setState({
        loadListType: 0
      });

      this.loadWithoutDateTimeData(fromSearch,search);
    } else if (type === 'mine') {
      search.status = 0;
      search.creator = session.accountId;

      this.setState({
        loadListType: 2
      });

      this.loadWithoutDateTimeData(fromSearch,search);
    }
    this.clearFilter();
  }
  /**
   * Handle open menu
   * @method
   * @param {string} type - menu type ('incidentMenu' or 'tableMenu')
   * @param {object} data - active data
   * @param {object} event - event object
   */
  handleOpenMenu = (type, data, event) => {
    this.setState({
      contextAnchor: event.currentTarget,
      menuType: type
    });

    if (data) {
      this.setState({
        currentData: data
      });
    }
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null,
      currentData: {}
    });
  }
  handleRowMouseOver = (index, allValue, evt) => {
    let tempIncident = {...this.state.incident};
    tempIncident['dataContent'] = _.map(tempIncident['dataContent'], el => {
      return {
        ...el,
        _menu: el.id === allValue.id
      };
    });

    this.setState({
      incident: tempIncident
    });
  }
  /**
   * Display temp saved message
   * @method
   * @returns HTML DOM
   */
  getTempSavedMsg = () => {
    return (
      <div className='content'>
        <span>{it('txt-tempSaveRestore')}?</span>
      </div>
    )
  }
  /**
   * Check if user has temp saved data
   * @method
   * @param {string} formType - form Type ('events' or 'ttps')
   * @param {string} incidentFormType - incident Type ('monitor', analyze' or 'EDR')
   */
  checkTempSave = (formType, incidentFormType) => {
    const {baseUrl, session} = this.context;
    const requestData = {
      accountId: session.accountId,
      incidentType: incidentFormType
    };

    this.ah.one({
      url: `${baseUrl}/api/soc/temporary/search`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      this.toggleContent('addIncident', formType, !_.isEmpty(data) ? data : null, incidentFormType);
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.handleCloseMenu();
  }
  /**
   * Delete temp saved data
   * @method
   * @param {string} id - temp saved ID
   */
  deleteTempSavedData = (id) => {
    const {baseUrl} = this.context;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/temporary?id=${id}`,
      type: 'DELETE'
    })
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display edit Incident content
   * @method
   * @returns HTML DOM
   */
  displayFormContent = () => {
    const {session} = this.context;
    const {
      activeContent,
      severityList,
      incidentType,
      incidentFormType,
      incident,
      toggleType,
      socFlowList,
      displayPage,
      attach,
      filesName,
      deviceListOptions,
      showDeviceListOptions,
      incidentAccidentList,
      incidentAccidentSubList
    } = this.state;
    let editCheck = false;
    let drawCheck = false;
    let submitCheck = false;
    let auditCheck = false;
    let returnCheck = false;
    let publishCheck = false;
    let transferCheck = false;
    let signCheck = false;
    let closeCheck = false;
    let restartCheck = false;
    let deleteCheck = false;

    if (_.includes(this.state.accountRoleType,constants.soc.SOC_Executor)) {
      closeCheck = true;
      deleteCheck = true;
    }

    if (incident.info.status === constants.soc.INCIDENT_STATUS_UNREVIEWED) {
      if (_.includes(this.state.accountRoleType,constants.soc.SOC_Executor)) {
        editCheck = true;
      }

      if (session.accountId === incident.info.creator) {
        editCheck = true;
      }
    } else if (incident.info.status === constants.soc.INCIDENT_STATUS_REVIEWED) {

    } else if (incident.info.status === constants.soc.INCIDENT_STATUS_CLOSED) {
      closeCheck = false;
    } else if (incident.info.status === constants.soc.INCIDENT_STATUS_SUBMITTED) {
      closeCheck = false;

      if (_.includes(this.state.accountRoleType,constants.soc.SOC_Executor)) {
        publishCheck = true;
      }
    } else if (incident.info.status === constants.soc.INCIDENT_STATUS_DELETED) {
      if (_.includes(this.state.accountRoleType,constants.soc.SOC_Executor)) {
        restartCheck = true;
        deleteCheck = false;
        closeCheck = false;
      }
    } else if (incident.info.status === constants.soc.INCIDENT_STATUS_ANALYZED) {

    } else if (incident.info.status === constants.soc.INCIDENT_STATUS_EXECUTOR_UNREVIEWED) {

    } else if (incident.info.status === constants.soc.INCIDENT_STATUS_EXECUTOR_CLOSE) {
      closeCheck = false;
    }

    let tmpTagList = [];

    if (incident.info.tagList && incident.info.tagList.length >= 3) {
      tmpTagList = incident.info.tagList.slice(0, 3);
    } else {
      tmpTagList = incident.info.tagList;
    }

    return (
      <div className='main-content basic-form'>
        <header className='main-header' style={{display: 'flex'}}>
          {it(`txt-${activeContent}-${incidentFormType}`)}

          {activeContent !== 'addIncident' &&
            <div className='msg' style={{display: 'flex'}}>{it('txt-id')}<span style={{color: 'red', marginLeft: '5px'}}>{incident.info.id}</span>
              <div style={{display: 'flex', marginLeft: '10px'}}>
              {
                _.map(tmpTagList, el => {
                  let formattedWording = '';

                  if (el.tag.tag.length > 6) {
                    formattedWording = el.tag.tag.substr(0, 6) + '...';
                  } else {
                    formattedWording = el.tag.tag;
                  }

                  return (
                    <div style={{display: 'flex', marginRight: '5px'}}>
                      <div className='incident-tag-square' style={{backgroundColor: el.tag.color}}>
                        {formattedWording}
                      </div>
                    </div>
                  )
                })
              }
              {incident.info.tagList && incident.info.tagList.length >= 3 && '...'}
              </div>
            </div>
          }
        </header>

        {activeContent === 'viewIncident' &&
          <div className='content-header-btns'>
            <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>

            {editCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'editIncident')}>{t('txt-edit')}</Button>
            }
            {drawCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'draw')}>{it('txt-draw')}</Button>
            }
            {submitCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'submit')}>{it('txt-submit')}</Button>
            }
            {returnCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'return')}>{it('txt-return')}</Button>
            }
            {auditCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'auditV2')}>{it('txt-audit')}</Button>
            }
            {transferCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'analyze')}>{it('txt-transfer')}</Button>
            }
            {signCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit'  onClick={this.openReviewModal.bind(this, incident.info, 'sign')}>{it('txt-sign')}</Button>
            }
            {closeCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit'  onClick={this.openReviewModal.bind(this, incident.info, 'closeV2')}>{it('txt-close')}</Button>
            }
            {publishCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleSendIncident.bind(this, incident.info)}>{it('txt-send')}</Button>
            }
            {deleteCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'delete')}>{it('txt-delete')}</Button>
            }
            {restartCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'restart')}>{it('txt-restart')}</Button>
            }
            <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.exportPdf}>{t('txt-export')}</Button>
            <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.notifyContact}>{it('txt-notify')}</Button>
          </div>
        }

        <div className='auto-settings' style={{height: '70vh'}}>
          <IncidentForm
            from='soc'
            activeContent={activeContent}
            displayPage={displayPage}
            incident={incident}
            severityList={severityList}
            incidentType={incidentType}
            incidentFormType={incidentFormType}
            socFlowList={socFlowList}
            attach={attach}
            filesName={filesName}
            deviceListOptions={deviceListOptions}
            showDeviceListOptions={showDeviceListOptions}
            incidentAccidentList={incidentAccidentList}
            incidentAccidentSubList={incidentAccidentSubList}
            handleDataChange={this.handleDataChange}
            handleDataChangeMui={this.handleDataChangeMui}
            handleFileChange={this.handleFileChange}
            toggleUploadAttachment={this.toggleUploadAttachment}
            handleConnectContactChange={this.handleConnectContactChange}
            handleIncidentPageChange={this.handleIncidentPageChange}
            handleEventsChange={this.handleEventsChange}
            handleKillChainChange={this.handleKillChainChange}
            handleTtpsChange={this.handleTtpsChange}
            handleTtpEdrChange={this.handleTtpEdrChange}
            toggleRelatedListModal={this.toggleRelatedListModal}
            refreshIncidentAttach={this.refreshIncidentAttach}
            toggleEstablishDateCheckbox={this.toggleEstablishDateCheckbox} />
        </div>

        {activeContent === 'editIncident' &&
          <footer>
            <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</Button>
            <Button variant='contained' color='primary' onClick={this.handleSubmit.bind(this, 'save')}>{t('txt-save')}</Button>
            <Button variant='outlined' color='primary' className='standard' onClick={this.handleSubmit.bind(this, 'tempSave')}>{t('txt-tempSave')}</Button>
          </footer>
        }

        {activeContent === 'addIncident' &&
          <footer>
            <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, 'cancel-add')}>{t('txt-cancel')}</Button>
            <Button variant='contained' color='primary' onClick={this.handleSubmit.bind(this, 'save')}>{t('txt-save')}</Button>
            <Button variant='outlined' color='primary' className='standard' onClick={this.handleSubmit.bind(this, 'tempSave')}>{t('txt-tempSave')}</Button>
          </footer>
        }
      </div>
    )
  }
  handleIncidentPageChange = (val) => {
    this.setState({
      displayPage: val
    });
  }
  toggleRelatedListModal = () => {
    this.setState({
      relatedListOpen: !this.state.relatedListOpen
    });
  }
  setIncidentList = (list) => {
    const tempIncident = {...this.state.incident};
    tempIncident.info.showFontendRelatedList = list;

    this.setState({
      incident: tempIncident
    }, () => {
      this.toggleRelatedListModal();
    });
  }
  toggleEstablishDateCheckbox = (event) => {
    let tempIncident = {...this.state.incident};
    tempIncident.info.enableEstablishDttm = event.target.checked;

    this.setState({
      incident: tempIncident
    });
  }
  onTagsChange = (event, values) => {
    let temp = {...this.state.incident};
    temp.info['showFontendRelatedList'] = values;

    this.setState({
      incident: temp
    });
  }
  formatBytes = (bytes, decimals = 2) => {
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    if (bytes === 0 || bytes === '0') {
      return '0 Bytes';
    }

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  /**
   * Handle file upload change
   * @method
   * @param {string} [options] - option for 'clear'
   */
  handleFileChange = (options) => {
    const input = document.getElementById('multiMalware');
    let filesName = [];

    if (options === 'clear') {
      this.setState({
        attach: null,
        filesName: ''
      });
      return;
    }

    if (_.size(input.files) > 0) {
      const flag = new RegExp("[\`~!@#$^&*()=|{}':;',\\[\\]<>+《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
      let validate = true;

      _.forEach(input.files, val => {
        if (flag.test(val.name)) {
          validate = false;
          helper.showPopupMsg(it('txt-attachedFileNameError'), t('txt-error'));
          return;
        } else if (val.size > 20000000) {
          validate = false;
          helper.showPopupMsg(it('file-too-large'), t('txt-error'));
          return;
        } else {
          filesName.push(val.name);
        }
      })

      if (!validate) return;

      this.setState({
        attach: input.files,
        filesName: filesName.join(', ')
      });
    }
  }
  /**
   * Toggle file upload modal
   * @method
   */
  toggleUploadAttachment = () => {
    this.setState({
      uploadAttachmentOpen: !this.state.uploadAttachmentOpen
    }, () => {
      if (!this.state.uploadAttachmentOpen) {
        this.setState({
          attach: null,
          filesName: []
        });
      }
    });
  }
  /**
   * Display file upload content
   * @method
   * @param {string} type - page type ('page' or 'modal')
   * @returns HTML DOM
   */  
  commonUploadContent = (type) => {
    const {incident, filesName} = this.state;

    return (
      <React.Fragment>
        <div className='group'>
          <div className='c-file-input clearable file-input' style={type === 'page' ? {width: '95%'} : null}>
            <input type='file' id='multiMalware' style={{width: 'calc(100% - 25px)'}} multiple onChange={this.handleFileChange} />
            <button type='button'>{t('txt-selectFile')}</button>
            <input type='text' className='long-name' readOnly value={filesName} />
            {filesName.length > 0 &&
              <i class='c-link inline fg fg-close' onClick={this.handleFileChange.bind(this, 'clear')}></i>
            }
          </div>
        </div>
        <div className='group'>
          <label htmlFor='fileMemo'>{it('txt-fileMemo')}</label>
          <TextareaAutosize
            id='fileMemo'
            name='fileMemo'
            className='textarea-autosize'
            onChange={this.handleDataChangeMui}
            value={incident.info.fileMemo}
            rows={2} />
        </div>
      </React.Fragment>
    )
  }
  /**
   * Handle file upload modal
   * @method
   * @returns ModalDialog component
   */
  uploadAttachmentModal = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleUploadAttachment},
      confirm: {text: t('txt-confirm'), handler: this.uploadAttachmentConfirm}
    };

    return (
      <ModalDialog
        id='uploadAttachmentDialog'
        className='modal-dialog'
        title={it('txt-attachedFile')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        <div className='c-form content'>
          {this.commonUploadContent('modal')}
        </div>
      </ModalDialog>
    )
  }
  /**
   * Handle file upload confirm
   * @method
   */
  uploadAttachmentConfirm = () => {
    const {baseUrl} = this.context;
    const {incident, attach} = this.state;

    if (attach.length > 0) {
      let formData = new FormData();
      formData.append('id', incident.info.id);

      _.forEach(attach, val => {
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
        this.refreshIncidentAttach(incident.info.id);
        this.toggleUploadAttachment();
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
  }
  /**
   * Toggle statistics report modal
   * @method
   */
  toggleStatisticsReport = () => {
    this.setState({
      statisticsReportOpen: !this.state.statisticsReportOpen
    }, () => {
      if (!this.state.statisticsReportOpen) {
        this.setState({
          monthlyReport: {
            fileName: '',
            date: moment().local().format('YYYY-MM-DDTHH:mm:ss'),
            info: ''
          }
        });
      }
    });
  }
  /**
   * Set new data for monthly report
   * @method
   * @param {string} type - new datetime object
   * @param {object} newData - new data for monthly report
   */
  handleMonthlyReportChange = (type, newData) => {
    let tempMonthlyReport = {...this.state.monthlyReport};
    let value = '';

    if (type === 'fileName') {
      value = newData.target.value;
    } else if (type === 'date') {
      value = newData;
    }

    tempMonthlyReport[type] = value;

    this.setState({
      monthlyReport: tempMonthlyReport
    });
  }
  /**
   * Display statistics report content
   * @method
   * @returns HTML DOM
   */  
  statisticsReportContent = () => {
    const {locale} = this.context;
    const {monthlyReport} = this.state;
    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <React.Fragment>
        <div className='group file-name'>
          <TextField
            id='monthlyReportFile'
            name='fileName'
            label={t('txt-fileName')}
            variant='outlined'
            fullWidth
            size='small'
            value={monthlyReport.fileName}
            onChange={this.handleMonthlyReportChange.bind(this, 'fileName')} />
        </div>
        <div className='group date-time'>
          <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
            <KeyboardDatePicker
              id='monthlyReportDate'
              className='date-picker'
              label={t('txt-date')}
              inputVariant='outlined'
              openTo='year'
              views={['year', 'month']}
              format='YYYY-MM'
              invalidDateMessage={t('txt-invalidDateMessage')}
              value={monthlyReport.date}
              onChange={this.handleMonthlyReportChange.bind(this, 'date')} />
          </MuiPickersUtilsProvider>
        </div>
      </React.Fragment>
    )
  }
  /**
   * Handle statistics report modal
   * @method
   * @returns ModalDialog component
   */
  statisticsReportModal = () => {
    const {monthlyReport} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleStatisticsReport},
      confirm: {text: t('txt-confirm'), handler: this.statisticsReportConfirm}
    };

    return (
      <ModalDialog
        id='statisticsReportDialog'
        className='modal-dialog'
        title={it('txt-exportStatisticsReport')}
        draggable={true}
        global={true}
        actions={actions}
        info={monthlyReport.info}
        closeAction='cancel'>
        {this.statisticsReportContent()}
      </ModalDialog>
    )
  }
  /**
   * Handle statistics report confirm
   * @method
   */
  statisticsReportConfirm = () => {
    const {baseUrl, contextRoot} = this.context;
    const {monthlyReport} = this.state;
    const timezone = momentTimezone.tz(momentTimezone.tz.guess()); //Get local timezone object
    const utc_offset = timezone._offset / 60; //Convert minute to hour
    const url = `${baseUrl}${contextRoot}/api/v2/soc/monthly/_export`;
    const requestData = {
      fileName: monthlyReport.fileName,
      startDttm: moment(monthlyReport.date).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      timeZone: utc_offset
    };
    let tempMonthlyReport = {...monthlyReport};
    let validFileName = true;

    if (monthlyReport.fileName === '') {
      tempMonthlyReport.info = t('txt-fileNameEmpty');
      validFileName = false;
    }

    if (monthlyReport.fileName && !FILE_NAME_PATTERN.test(monthlyReport.fileName)) { //Check file name format
      tempMonthlyReport.info = t('txt-fileNameInvalid');
      validFileName = false;
    }

    if (validFileName) {
      downloadWithForm(url, {payload: JSON.stringify(requestData)});

      this.toggleStatisticsReport();
    } else {
      this.setState({
        monthlyReport: tempMonthlyReport
      });
    }
  }
  /**
   * Toggle send incident modal
   * @method
   * @param {object} [currentData] - incident data
   */
  toggleSendIncident = (currentData) => {
    if (currentData && currentData.id) {
      const attachmentList = currentData.attachmentDescription ? JSON.parse(currentData.attachmentDescription) : [];

      this.setState({
        activeIncidentId: currentData.id,
        attachmentCheckAll: false,
        attachmentList,
        attachmentSelectedList: []
      }, () => {
        this.setState({
          sendIncidentOpen: true
        });
      });
    } else {
      this.setState({
        sendIncidentOpen: false
      });
    }

    this.handleCloseMenu();
  }
  /**
   * Handle attachment checkbox for all
   * @method
   * @param {object} event - event object
   */
  toggleAttachmentCheckAll = (event) => {
    this.setState({
      attachmentCheckAll: !this.state.attachmentCheckAll
    }, () => {
      const {attachmentCheckAll, attachmentList} = this.state;
      let attachmentSelectedList = [];

      if (attachmentCheckAll) {
        attachmentSelectedList = attachmentList.map(val => {
          return val.fileName;
        });
      }

      this.setState({
        attachmentSelectedList
      });
    });
  }
  /**
   * Handle checkbox check/uncheck
   * @method
   * @param {object} event - event object
   */
  toggleAttachmentCheckbox = (event) => {
    const {attachmentList, attachmentSelectedList} = this.state;
    let tempAttachmentSelectedList = _.cloneDeep(attachmentSelectedList);

    if (event.target.checked) {
      tempAttachmentSelectedList.push(event.target.name);
    } else {
      const index = tempAttachmentSelectedList.indexOf(event.target.name);
      tempAttachmentSelectedList.splice(index, 1);
    }

    this.setState({
      attachmentCheckAll: tempAttachmentSelectedList.length === attachmentList.length,
      attachmentSelectedList: tempAttachmentSelectedList
    });
  }
  /**
   * Display checkbox for attachment list
   * @method
   * @param {object} val - individual attachment list
   * @param {number} i - index of the attachment list
   * @returns FormControlLabel component
   */
  showCheckboxList = (val, i) => {
    return (
      <tr key={i}>
        <td>
          <FormControlLabel
            key={i}
            control={
              <Checkbox
                className='checkbox-ui'
                name={val.fileName}
                checked={_.includes(this.state.attachmentSelectedList, val.fileName)}
                onChange={this.toggleAttachmentCheckbox}
                color='primary' />
            } />
        </td>
        <td>{val.fileName}</td>
        <td>{val.fileMemo}</td>
      </tr>
    )
  }
  /**
   * Display send incident content
   * @method
   * @returns HTML DOM
   */  
  sendIncidentContent = () => {
    const {activeIncidentId, attachmentCheckAll, attachmentList} = this.state;

    return (
      <div>
        <div className='msg'>
          <span>{it('txt-send-msg')}: {activeIncidentId}?</span>
        </div>
        {attachmentList.length > 0 &&
          <React.Fragment>
            <div>{it('txt-fileSendConfirm')}?</div>
            <table className='c-table main-table with-border'>
              <thead>
                <tr>
                  <th>
                    <FormControlLabel
                      control={
                        <Checkbox
                          className='checkbox-ui'
                          name='emailCheckAll'
                          checked={attachmentCheckAll}
                          onChange={this.toggleAttachmentCheckAll}
                          color='primary' />
                      } />
                  </th>
                  <th>{t('txt-fileName')}</th>
                  <th>{t('txt-memo')}</th>
                </tr>
              </thead>
              <tbody>
                {attachmentList.map(this.showCheckboxList)}
              </tbody>
            </table>
          </React.Fragment>
        }
      </div>
    )
  }
  /**
   * Handle send incident modal
   * @method
   * @returns ModalDialog component
   */
  sendIncidentModal = () => {
    const {activeIncidentId} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleSendIncident},
      confirm: {text: t('txt-confirm'), handler: this.sendIncident.bind(this, activeIncidentId)}
    };

    return (
      <ModalDialog
        id='sendIncidentDialog'
        className='modal-dialog'
        title={it('txt-send')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.sendIncidentContent()}
      </ModalDialog>
    )
  }
  handleConnectContactChange = (val) => {
    let temp = {...this.state.incident};
    temp.info.notifyList = val;

    this.setState({
      incident: temp
    });
  }
  handleEventsChange = (val) => {
    let temp = {...this.state.incident};
    temp.info.eventList = val;

    this.setState({
      incident: temp
    });
  }
  handleKillChainChange = (val) => {
    let temp = {...this.state.incident};
    temp.info.killChainList = val;

    this.setState({
      incident: temp
    });
  }
  handleTtpsChange = (val, event) => {
    let temp = {...this.state.incident};
    temp.info.ttpList = val;

    this.setState({
      incident: temp
    });
  }
  handleTtpEdrChange = (val, event) => {
    let temp = {...this.state.incident};

    if (val[0] && val[0].obsSocketList) { //Handle special case for obsSocketList
      const obsSocket = val[0].obsSocketList[0];

      if (obsSocket && !obsSocket.ip && !obsSocket.port) {
        val[0].obsSocketList = [];
      }
    }

    temp.info.edrList = val;

    this.setState({
      incident: temp
    });
  }
  /**
   * Handle submit button
   * @method
   * @param {string} type - button Type ('save' or 'tempSave')
   */
  handleSubmit = (type) => {
    const {baseUrl, contextRoot, session} = this.context;
    const {activeContent, incidentFormType, tempSavedData, attach} = this.state;
    let incident = {...this.state.incident};

    if (type === 'save' && !this.checkRequired(incident.info)) {
      return;
    }

    if (incident.info.showFontendRelatedList && incident.info.showFontendRelatedList.length > 0) {
      incident.info.relatedList = _.map(incident.info.showFontendRelatedList, val => {
        return {
          incidentRelatedId: val
        };
      });
    }

    if (incident.info.eventList && incident.info.eventList.length > 0) {
      incident.info.eventList = _.map(incident.info.eventList, el => {
        _.forEach(el.eventConnectionList, eventConnectItem => {
          if (eventConnectItem.srcPort === '') {
            eventConnectItem.srcPort = null;
          }

          if (eventConnectItem.dstPort === '') {
            eventConnectItem.dstPort = null;
          }
        })

        let processArray = [];

        if (el.eventProcessList && el.eventProcessList.length > 0) {
          processArray = _.map(el.eventProcessList, val => {
            return val.process;
          });
        }

        return {
          ...el,
          processArray,
          startDttm: moment(el.time.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
          endDttm: moment(el.time.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
        };
      })
    }

    if (incidentFormType === 'EDR') {
      let newTtpList = [{
        obsFileList: []
      }];

      _.forEach(incident.info.ttpList, val => {
        newTtpList[0].obsFileList.push(val.obsFileList[0]);
      })

      incident.info.ttpList = newTtpList;
    }

    if (incident.info.ttpList && incident.info.ttpList.length > 0) {
      incident.info.ttpList = _.map(incident.info.ttpList, el => {
        if (el.obsFileList && el.obsFileList.length > 0) {
          let obsFileList = [];

          _.forEach(el.obsFileList, val => {
            let processArray = [];

            if (val.eventProcessList && val.eventProcessList.length > 0) {
              processArray = _.map(val.eventProcessList, val2 => {
                return val2.process;
              });
            }

            obsFileList.push({
              ...val,
              fileSize: Number(val.fileSize),
              createDttm: moment(val.createDttm).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
              modifyDttm: moment(val.modifyDttm).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
              accessDttm: moment(val.accessDttm).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
              incidentMalwareAnalysisDTO: {
                product: val.product,
                resultName: val.resultName,
                result: val.result,
                processArray
              }
            });
          })

          return {
            ...el,
            obsFileList
          };
        } else {
          return {
            ...el
          };
        }
      });
    }

    if (incidentFormType === 'EDR') {
      if (incident.info.ttpList && incident.info.ttpList.length > 0 && incident.info.edrList && incident.info.edrList.length > 0) {
        incident.info.ttpList = [{
          ...incident.info.ttpList[0],
          ...incident.info.edrList[0]
        }];
      }
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

    if (incident.info.enableEstablishDttm) {
      incident.info.establishDttm = moment(incident.info.establishDttm).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    } else {
      incident.info.establishDttm = '';
    }

    if (!incident.info.creator) {
      incident.info.creator = session.accountId;
    }

    // add for save who edit
    incident.info.editor = session.accountId;

    if (activeContent === 'addIncident') {
      if (_.includes(session.roles, 'SOC Supervior') || _.includes(session.roles, 'SOC Supervisor')||  _.includes(session.roles, 'SOC Executor')) {
        incident.info.status =  constants.soc.INCIDENT_STATUS_UNREVIEWED;
      } else {
        incident.info.status =  constants.soc.INCIDENT_STATUS_UNREVIEWED;
      }
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    if (type === 'save') {
      let requestData = {
        ...incident.info
      };

      if (incidentFormType) {
        requestData.incidentType = incidentFormType;
      }

      if (tempSavedData.id) {
        requestData.incidentTemporaryId = tempSavedData.id;
      }

      ah.one({
        url: `${baseUrl}/api/soc`,
        data: JSON.stringify(requestData),
        type: activeContent === 'addIncident' ? 'POST' : 'PATCH',
        contentType: 'application/json',
        dataType: 'json'
      }).then(data => {
        if (data.ret === 0) {
          incident.info.id = data.rt.id;
          incident.info.updateDttm = data.rt.updateDttm;
          incident.info.status = data.rt.status;

          this.setState({
            incidentFormType: '',
            originalIncident: _.cloneDeep(incident)
          }, () => {
            if (attach) {
              this.uploadAttachment();
            }
            this.getIncident(incident.info.id);
            this.toggleContent('cancel');
          });
        }
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      });
    } else if (type === 'tempSave') {
      const requestData = {
        accountId: session.accountId,
        contentJson: incident.info,
        incidentType: incidentFormType
      };

      ah.one({
        url: `${baseUrl}/api/soc/temporary`,
        data: JSON.stringify(requestData),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json'
      }).then(data => {
        if (data.ret === 0) {
          this.toggleContent('tableList');

          this.setState({ //temp save not support file upload
            incidentFormType: '',
            attach: null,
            filesName: []
          });
        }
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      });
    }
  }
  checkRequired = (incident) => {
    const {incidentType, incidentFormType} = this.state;

    if (!incident.title || !incident.incidentDescription || !incident.reporter || !incident.attackName || !incident.description || !incident.impactAssessment || !incident.socType || !incident.severity || !incident.flowTemplateId) {
      PopupDialog.alert({
        title: t('txt-tips'),
        display: it('txt-validBasic'),
        confirmText: t('txt-close')
      });
      return false;
    }

    if (!incident.category) {
      PopupDialog.alert({
        title: t('txt-tips'),
        display: it('txt-validCategory'),
        confirmText: t('txt-close')
      });
      return false;
    }

    //check for kill chain list
    if (incident.killChainList && incident.killChainList.length > 0) {
      let killChainCheck = true;

      _.forEach(incident.killChainList, val => {
        if (val.killChainName || val.phaseName) {
          if (!val.killChainName || !val.phaseName) {
            killChainCheck = false;
            return;
          }
        }
      })

      if (!killChainCheck) {
        PopupDialog.alert({
          title: t('txt-tips'),
          display: it('txt-validKillChain'),
          confirmText: t('txt-close')
        });
        return false;
      }
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

      if (incident.eventList.length <= 0) {
        PopupDialog.alert({
          title: t('txt-tips'),
          display: it('txt-validEvents'),
          confirmText: t('txt-close')
        });
        eventCheck = false;
      } else {
        _.forEach(incident.eventList, event => {
          if (_.size(event.eventConnectionList) <= 0) {
            PopupDialog.alert({
              title: t('txt-tips'),
              display: it('txt-validEvents'),
              confirmText: t('txt-close')
            });
            eventCheck = false;
          } else {
            _.forEach(event.eventConnectionList, eventConnect => {
              if (!helper.ValidateIP_Address(eventConnect.srcIp) ) {
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

              if (incidentFormType === 'EDR') {
                if (eventConnect.dstHostname === '') {
                  PopupDialog.alert({
                    title: t('txt-tips'),
                    display: it('txt-validDstHostname'),
                    confirmText: t('txt-close')
                  });
                  eventCheck = false;
                  return;
                }
              }
            })
          }
        })
      }

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

    // check ttp list
    if (incidentType === 'ttps') {
      if (!incident.ttpList) {
        PopupDialog.alert({
          title: t('txt-tips'),
          display: it('txt-validTTPs'),
          confirmText: t('txt-close')
        });
        return false;
      } else {
        let statusCheck = true;
        let fileCheck = false;
        let edrCheck = false;
        let urlCheck = false;
        let socketCheck = false;

        _.forEach(incident.ttpList, ttp => {
          if (ttp && ttp.obsFileList && (_.size(ttp.obsFileList) > 0)) {
            _.forEach(ttp.obsFileList, file => {
              if (!file.fileName || !file.fileExtension) {
                fileCheck = false;
                return;
              } else {
                if (file.md5 || file.sha1 || file.sha256) {
                  if (helper.validateInputRuleData('fileHashMd5', file.md5)) {
                    fileCheck = true;
                  } else if (helper.validateInputRuleData('fileHashSha1', file.sha1)) {
                    fileCheck = true;
                  } else if (helper.validateInputRuleData('fileHashSha256', file.sha256)) {
                    fileCheck = true;
                  } else {
                    fileCheck = false;
                    return;
                  }
                } else {
                  fileCheck = false;
                  return;
                }
              }

              if (!file.fileSize || !file.createDttm || !file.modifyDttm || !file.accessDttm || !file.product || file.isFamily.toString() === '' || !file.resultName || !file.result || !file.uploadFileName || !file.tmpFileId || !file.malwareTypes) {
                fileCheck = false;
                return;
              } else {
                fileCheck = true;
              }
            })
          } else {
            fileCheck = true;
          }

          if (incidentFormType !== 'EDR') {
            if (ttp && ttp.obsUriList && (_.size(ttp.obsUriList) > 0)) {
              _.forEach(ttp.obsUriList, uri => {
                if (uri.uriType && uri.uriValue) {
                  urlCheck = true;
                } else {
                  urlCheck = false;
                  return;
                }
              })
            } else {
              urlCheck = true;
            }

            if (ttp && ttp.obsSocketList && (_.size(ttp.obsSocketList) > 0)) {
              _.forEach(ttp.obsSocketList, socket => {
                if (socket.ip || socket.port) {
                  if (socket.ip && !helper.ValidateIP_Address(socket.ip)) {
                    PopupDialog.alert({
                      title: t('txt-tips'),
                      display: t('network-topology.txt-ipValidationFail'),
                      confirmText: t('txt-close')
                    });
                    socketCheck = false;
                    return;
                  }

                  if (socket.port) {
                    if (!helper.ValidatePort(socket.port)) {
                      PopupDialog.alert({
                        title: t('txt-tips'),
                        display: t('network-topology.txt-portValidationFail'),
                        confirmText: t('txt-close')
                      });
                      socketCheck = false;
                      return;
                    } else {
                      if (!socket.ip) {
                        PopupDialog.alert({
                          title: t('txt-tips'),
                          display: t('network-topology.txt-ipValidationFail'),
                          confirmText: t('txt-close')
                        });
                        socketCheck = false;
                        return
                      }
                      socketCheck = true;
                    }
                  }
                  socketCheck = true;
                } else {
                  socketCheck = false;
                  return;
                }
              })
            } else {
              socketCheck = true;
            }

            if (!fileCheck && !urlCheck && !socketCheck) {
              PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-incident-ttps') + '(' + it('txt-ttp-obs-file') + '/' + it('txt-ttp-obs-uri') + '/' + it('txt-ttp-obs-socket') + '-' + it('txt-mustOne') + ')',
                confirmText: t('txt-close')
              });
              statusCheck = false;
            }
          }

          if (!fileCheck) {
            PopupDialog.alert({
              title: t('txt-tips'),
              display: it('txt-checkFileFieldType'),
              confirmText: t('txt-close')
            });
            statusCheck = false;
          }

          if (incidentFormType !== 'EDR') {
            if (!urlCheck) {
              PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-checkUrlFieldType'),
                confirmText: t('txt-close')
              });
              statusCheck = false;
            }

            if (!socketCheck) {
              PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-checkIPFieldType'),
                confirmText: t('txt-close')
              });
              statusCheck = false;
            }

            if (_.size(ttp.obsSocketList) <= 0 && _.size(ttp.obsUriList) <= 0 && _.size(ttp.obsFileList) <= 0) {
              PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-incident-ttps') + '(' + it('txt-ttp-obs-file') + '/' + it('txt-ttp-obs-uri') + '/' + it('txt-ttp-obs-socket') + '-' + it('txt-mustOne') + ')',
                confirmText: t('txt-close')
              });
              statusCheck = false;
            }
          }
        })

        if (incidentFormType !== 'EDR') {
          const empty = _.filter(incident.ttpList, function(o) {
            if (o.infrastructureType === undefined || o.infrastructureType === 0) {
              o.infrastructureType = '0';
            }

            if (!o.title || !o.infrastructureType) {
              statusCheck = false;
            }
          });

          if (_.size(empty) > 0) {
            PopupDialog.alert({
              title: t('txt-tips'),
              display: it('txt-validTechniqueInfa'),
              confirmText: t('txt-close')
            });
            statusCheck = false;
          }
          return statusCheck;
        }

        if (incidentFormType === 'EDR' && incident.edrList && incident.edrList.length > 0) {
          if (incident.edrList[0].title || incident.edrList[0].infrastructureType) {
            edrCheck = true;

            if (!incident.edrList[0].title && !incident.edrList[0].infrastructureType) {
              edrCheck = false;
            }

            if (_.isEmpty(incident.edrList[0].obsUriList) && _.isEmpty(incident.edrList[0].obsSocketList)) {
              edrCheck = false;
            }

            if (!edrCheck) {
              PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-incident-ttps') + '('+it('txt-ttp-obs-uri') + '/' + it('txt-ttp-obs-socket') + '-' + it('txt-mustOne') + ')',
                confirmText: t('txt-close')
              });
              return;
            }
          }

          if (incident.edrList[0].obsUriList && _.size(incident.edrList[0].obsUriList) > 0) {
            _.forEach(incident.edrList[0].obsUriList, uri => {
              if (uri.uriType && uri.uriValue) {
                urlCheck = true;
              } else {
                urlCheck = false;
                return;
              }
            })
          } else {
            urlCheck = true;
          }

          if (!urlCheck) {
            PopupDialog.alert({
              title: t('txt-tips'),
              display: it('txt-checkUrlFieldType'),
              confirmText: t('txt-close')
            });
            return;
          }

          if (incident.edrList[0].obsSocketList && _.size(incident.edrList[0].obsSocketList) > 0) {
            _.forEach(incident.edrList[0].obsSocketList, socket => {
              if (socket.ip || socket.port) {
                if (socket.ip && !helper.ValidateIP_Address(socket.ip)) {
                  PopupDialog.alert({
                    title: t('txt-tips'),
                    display: t('network-topology.txt-ipValidationFail'),
                    confirmText: t('txt-close')
                  });
                  socketCheck = false;
                  return;
                }

                if (socket.port) {
                  if (!helper.ValidatePort(socket.port)) {
                    PopupDialog.alert({
                      title: t('txt-tips'),
                      display: t('network-topology.txt-portValidationFail'),
                      confirmText: t('txt-close')
                    });
                    socketCheck = false;
                    return;
                  } else {
                    if (!socket.ip) {
                      PopupDialog.alert({
                        title: t('txt-tips'),
                        display: t('network-topology.txt-ipValidationFail'),
                        confirmText: t('txt-close')
                      });
                      socketCheck = false;
                      return;
                    }
                    socketCheck = true;
                  }
                } else {
                  socketCheck = false;
                  return;
                }
              } else {
                socketCheck = true;
              }
            })
          } else {
            socketCheck = true;
          }

          if (!socketCheck) {
            PopupDialog.alert({
              title: t('txt-tips'),
              display: it('txt-checkIPFieldType'),
              confirmText: t('txt-close')
            });
            return;
          }
        }
        return statusCheck;
      }
    }
    return true;
  }
  getIncident = (id, type) => {
    const {baseUrl} = this.context;
    const {incident, showDeviceListOptions} = this.state;

    this.handleCloseMenu();

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc?id=${id}`,
      type: 'GET'
    })
    .then(data => {
      let tempIncident = {...incident};
      let tempShowDeviceListOptions = _.cloneDeep(showDeviceListOptions);
      let temp = data.rt;
      temp.showFontendRelatedList = _.map(temp.relatedList, val => {
        return val.incidentRelatedId;
      });
      const incidentFormType = temp.incidentType;

      if (temp.eventList && temp.eventList.length > 0) {
        temp.eventList = _.map(temp.eventList, el => {
          let eventProcessList  = [];

          if (el.processArray && el.processArray.length > 0) {
            eventProcessList = _.map(el.processArray, val => {
              return {
                process: val
              };
            });
          }

          return {
            ...el,
            eventProcessList,
            time: {
              from: moment(el.startDttm, 'YYYY-MM-DDTHH:mm:ssZ').local().format('YYYY-MM-DD HH:mm:ss'),
              to: moment(el.endDttm, 'YYYY-MM-DDTHH:mm:ssZ').local().format('YYYY-MM-DD HH:mm:ss')
            }
          };
        })
      }

      if (temp.ttpList && temp.ttpList.length > 0) {
        temp.ttpList = _.map(temp.ttpList, el => {
          let tempTtp = el;

          if (tempTtp.infrastructureType === 0) {
            tempTtp.infrastructureType = '0';
          } else if (tempTtp.infrastructureType === 1) {
            tempTtp.infrastructureType = '1';
          }

          if (tempTtp.obsFileList && tempTtp.obsFileList.length > 0) {
            tempTtp.obsFileList = _.map(tempTtp.obsFileList, el => {
              let eventProcessList  = [];

              if (el.incidentMalwareAnalysisDTO && el.incidentMalwareAnalysisDTO.processArray && el.incidentMalwareAnalysisDTO.processArray.length > 0) {
                eventProcessList = _.map(el.incidentMalwareAnalysisDTO.processArray, val => {
                  return {
                    process: val
                  };
                });
              }

              return {
                ...el,
                createDttm: moment(el.createDttm).local().format('YYYY-MM-DD HH:mm:ss'),
                modifyDttm: moment(el.modifyDttm).local().format('YYYY-MM-DD HH:mm:ss'),
                accessDttm: moment(el.accessDttm).local().format('YYYY-MM-DD HH:mm:ss'),
                product: el.incidentMalwareAnalysisDTO.product,
                resultName: el.incidentMalwareAnalysisDTO.resultName,
                result: el.incidentMalwareAnalysisDTO.result,
                eventProcessList
              };
            })
          }

          return {
            ...tempTtp
          };
        })
      }

      if (incidentFormType === 'EDR') {
        temp.edrList = _.cloneDeep(temp.ttpList);
        delete temp.edrList[0].obsFileList;

        temp.ttpList = _.map(temp.ttpList[0].obsFileList, val => {
          return {
            obsFileList: [val]
          };
        });
      }

      let toggleType = type;
      tempIncident.info = temp;

      let deviceListIDs = [];

      _.forEach(showDeviceListOptions, val => {
        deviceListIDs.push(val.value);
      });

      _.forEach(temp.eventDeviceList, val => {
        if (!_.includes(deviceListIDs, val.id)) {
          tempShowDeviceListOptions.push({
            value: val.id,
            text: val.deviceName
          });
        }
      })

      this.setState({
        incident: tempIncident,
        incidentType: _.size(temp.ttpList) > 0 ? 'ttps' : 'events',
        incidentFormType,
        toggleType,
        showDeviceListOptions: tempShowDeviceListOptions
      }, () => {
        this.toggleContent('viewIncident', temp);
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  refreshIncidentAttach = (id) => {
    const {baseUrl} = this.context;
    const {activeContent, incidentType, incident} = this.state;

    this.handleCloseMenu();

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc?id=${id}`,
      type: 'GET'
    })
    .then(data => {
      const {incident} = this.state;
      let tempIncident = {...incident};
      let temp = data.rt;

      if (temp.relatedList) {
        temp.relatedList = _.map(temp.relatedList, el => {
          let obj = {
            value :el.incidentRelatedId,
            text:el.incidentRelatedId
          }
          return obj;
        })
      }

      let result = _.map(temp.relatedList, function(obj) {
        return _.assign(obj, _.find([], {value: obj.value}));
      });

      temp.showFontendRelatedList = result;

      if (temp.eventList) {
        temp.eventList = _.map(temp.eventList, el => {
          return {
            ...el,
            time: {
              from: moment(el.startDttm, 'YYYY-MM-DDTHH:mm:ssZ').local().format('YYYY-MM-DD HH:mm:ss'),
              to: moment(el.endDttm, 'YYYY-MM-DDTHH:mm:ssZ').local().format('YYYY-MM-DD HH:mm:ss')
            }
          };
        })
      }

      if (temp.ttpList) {
        temp.ttpList = _.map(temp.ttpList, el => {
          let tempTtp = el;

          if (tempTtp.infrastructureType === 0) {
            tempTtp.infrastructureType = '0';
          } else if (tempTtp.infrastructureType === 1) {
            tempTtp.infrastructureType = '1';
          }

          return {
            ...tempTtp
          };
        })
      }

      let incidentType = _.size(temp.ttpList) > 0 ? 'ttps' : 'events';
      incident.info.attachmentDescription = temp.attachmentDescription;
      incident.info.fileList = temp.fileList;
      incident.info.fileMemo =  temp.fileMemo;

      this.setState({
        incident,
        incidentType
      }, () => {
        this.toggleContent('refreshAttach', temp);
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Check if item is already in the selected list
   * @method
   * @param {string} val - checked item name
   * @returns boolean true/false
   */
  checkSeveritySelectedItem = (val) => {
    return _.includes(this.state.severitySelected, val);
  }
  /**
   * Handle checkbox check/uncheck
   * @method
   * @param {object} event - event object
   */
  toggleSeverityCheckbox = (event) => {
    let severitySelected = _.cloneDeep(this.state.severitySelected);

    if (event.target.checked) {
      severitySelected.push(event.target.name);
    } else {
      const index = severitySelected.indexOf(event.target.name);
      severitySelected.splice(index, 1);
    }

    this.setState({
      severitySelected
    });
  }
  /**
   * Handle optional checkbox
   * @method
   * @param {object} event - event object
   */
  toggleOptionalCheckbox = (event) => {
    const {name, checked} = event.target;
    let tempSearch = {...this.state.search};
    tempSearch.checkbox[name] = checked;

    this.setState({
      search: tempSearch
    });
  }
  /**
   * Display Severity checkbox group
   * @method
   * @param {string} val - severity level
   * @param {number} i - index of the severity level list
   * @returns HTML DOM
   */
  displaySeverityCheckbox = (val, i) => {
    return (
      <div key={val + i} className='option'>
        <FormControlLabel
          label={val}
          control={
            <Checkbox
              id={val}
              className='checkbox-ui'
              name={val}
              checked={this.checkSeveritySelectedItem(val)}
              onChange={this.toggleSeverityCheckbox}
              color='primary' />
          } />
      </div>
    )
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {locale} = this.context;
    const {showFilter, search, severityList} = this.state;
    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')} />
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group' style={{width: '60vh'}}>
            <TextField
              id='keyword'
              name='keyword'
              label={f('edgeFields.keywords')}
              variant='outlined'
              fullWidth={true}
              size='small'
              rows={1}
              multiline
              rowsMax={3}
              value={search.keyword}
              onChange={this.handleSearchMui} />
          </div>
          <div className='group'>
            <TextField
              id='searchCategory'
              name='category'
              select
              label={f('incidentFields.category')}
              required={true}
              variant='outlined'
              fullWidth={true}
              size='small'
              value={search.category}
              onChange={this.handleSearchMui}>
              {
                _.map(_.range(10, 20), el => {
                  return <MenuItem value={el}>{it(`category.${el}`)}</MenuItem>
                })
              }
            </TextField>
          </div>

          <div className='severity'>
            <div className='group group-checkbox narrow'>
              <div className='group-options'>
                {SEVERITY_TYPE.map(this.displaySeverityCheckbox)}
              </div>
            </div>
          </div>
          <div className='severity' style={{marginTop: '20px', marginBottom: '20px'}}>
            <div className='group group-checkbox narrow'>
              <div className='group-options'>
                {['1','3','4','5','8'].map(this.displayStatusCheckbox)}
              </div>
            </div>
          </div>
          <div className='group' style={{width: '500px', marginTop: '20px'}}>
            <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
              <KeyboardDateTimePicker
                className='date-time-picker'
                inputVariant='outlined'
                variant='inline'
                label={f('incidentFields.createDttm-start')}
                format='YYYY-MM-DD HH:mm'
                ampm={false}
                invalidDateMessage={t('txt-invalidDateMessage')}
                maxDateMessage={t('txt-maxDateMessage')}
                minDateMessage={t('txt-minDateMessage')}
                value={search.datetime.from}
                onChange={this.handleSearchTime.bind(this, 'from')} />
              <div className='between'>~</div>
              <KeyboardDateTimePicker
                className='date-time-picker'
                inputVariant='outlined'
                variant='inline'
                label={f('incidentFields.createDttm-end')}
                format='YYYY-MM-DD HH:mm'
                ampm={false}
                invalidDateMessage={t('txt-invalidDateMessage')}
                maxDateMessage={t('txt-maxDateMessage')}
                minDateMessage={t('txt-minDateMessage')}
                value={search.datetime.to}
                onChange={this.handleSearchTime.bind(this, 'to')} />
            </MuiPickersUtilsProvider>
          </div>
          <div className='group' style={{width: '500px'}}>
            <Autocomplete
              multiple
              id='tagList'
              name='tagList'
              variant='outlined'
              fullWidth={true}
              size='small'
              options={this.state.tagList}
              // options={_.map(this.state.tagList, (val) => { return { value: val }; })}
              select
              onChange={this.onNameChange}
              value={search.tagList}
              getOptionLabel={(option) => option.tag}
              renderInput={(params) =>
                <TextField
                  {...params}
                  label={it('txt-custom-tag')}
                  variant='outlined'
                  fullWidth={true}
                  size='small'
                  InputProps={{...params.InputProps, type: 'search'}}
                />}
              />
          </div>
          <div className='severity'>
            <div className='group group-checkbox narrow'>
              <div className='group-options'>
                <div className='option'>
                  <FormControlLabel
                    label={it('txt-isExpired')}
                    control={
                      <Checkbox
                        className='checkbox-ui'
                        name='isExpired'
                        onChange={this.toggleOptionalCheckbox}
                        color='primary' />
                    } />
                </div>
                <div className='option'>
                  <FormControlLabel
                    label={it('txt-incident-mine')}
                    control={
                      <Checkbox
                        className='checkbox-ui'
                        name='creator'
                        onChange={this.toggleOptionalCheckbox}
                        color='primary' />
                    } />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.loadData.bind(this, 'search')}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  displayStatusCheckbox = (val, i) => {
    return (
      <div key={val + i} className='option'>
        <FormControlLabel
          label={it(`status.${val}`)}
          control={
            <Checkbox
              id={val}
              className='checkbox-ui'
              name={val}
              checked={this.checkSelectedItem(val)}
              onChange={this.toggleCheckbox}
              color='primary' />
          } />
      </div>
    )
  }
  checkSelectedItem = (val) => {
    return _.includes(this.state.selectedStatus, val);
  }
  toggleCheckbox = (event) => {
    let itemSelected = _.cloneDeep(this.state.selectedStatus);

    if (event.target.checked) {
      itemSelected.push(event.target.name);
    } else {
      const index = itemSelected.indexOf(event.target.name);
      itemSelected.splice(index, 1);
    }

    this.setState({
      selectedStatus: itemSelected
    });
  }
  renderStatistics = () => {
    const {showChart, dashboard} = this.state;

    return (
      <div className={cx('main-filter', {'active': showChart})}>
        <i className='fg fg-close' onClick={this.toggleChart} title={t('txt-close')} />
        <div className='incident-statistics' id='incident-statistics'>
          <div className='item c-link' onClick={this.loadCondition.bind(this,'button','expired')}>
            <i className='fg fg-checkbox-fill' style={{color: '#ec8f8f'}} />
            <div className='threats'>{it('txt-incident-expired')}<span>{dashboard.expired}</span></div>
          </div>

          <div className='item c-link' onClick={this.loadCondition.bind(this,'button','mine')}>
            <i className='fg fg-checkbox-fill' style={{color: '#99ea8a'}} />
            <div className='threats'>{it('txt-incident-mine')}<span>{dashboard.mine}</span></div>
          </div>
        </div>
      </div>
    )
  }
  /* ---- Func Space ---- */
  /**
   * Show Delete Incident dialog
   * @method
   * @param {object} allValue - IncidentDevice data
   */
  openDeleteMenu = (allValue) => {
    PopupDialog.prompt({
      title: t('txt-delete'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{t('txt-delete-msg')}: {allValue.id}?</span>
        </div>
      ),
      act: (confirmed, data) => {
        if (confirmed) {
          this.deleteIncident(allValue.id);
        }
      }
    })
  }
  openReviewModal = (allValue, reviewType) => {
    this.handleCloseMenu();

    PopupDialog.prompt({
      title: it(`txt-${reviewType}`),
      confirmText: t('txt-confirm'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{it(`txt-${reviewType}-msg`)}: {allValue.id}?</span>
        </div>
      ),
      act: (confirmed, data) => {
        if (confirmed) {
          this.openIncidentReview(allValue.id, reviewType);
        }
      }
    });
  }
  /**
   * Handle delete Incident confirm
   * @method
   */
  deleteIncident = (id) => {
    const {baseUrl} = this.context;
    const {loadListType} = this.state;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc?id=${id}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        if (loadListType === 0) {
          this.loadCondition('other','expired');
        } else if (loadListType === 1) {
          this.loadCondition('other','unhandled');
        } else if (loadListType === 2) {
          this.loadCondition('other','mine');
        } else if (loadListType === 3) {
          this.loadData();
        }
      }
      return null
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    const {incident, loadListType} = this.state;
    let temp = {...incident};
    temp[type] = Number(value);

    this.setState({
      incident: temp
    }, () => {
      if (loadListType === 0) {
        this.loadCondition(type,'expired');
      } else if (loadListType === 1) {
        this.loadCondition(type,'unhandled');
      } else if (loadListType === 2) {
        this.loadCondition(type,'mine');
      } else if (loadListType === 3) {
        this.loadData(type);
      }
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string} allValue - new page number
   * @param {string} savedData - new page number
   * @param {string} formType - incident form type ('monitor', 'analyze' or 'EDR')
   */
  toggleContent = (type, allValue, savedData, formType) => {
    const {baseUrl, contextRoot} = this.context;
    const {originalIncident, incident, incidentFormType, tempSavedData, loadListType} = this.state;
    let tempIncident = {...incident};
    let showPage = type;

    if (type === 'viewIncident') {
      tempIncident.info = {
        id: allValue.id,
        title: allValue.title,
        incidentDescription: allValue.incidentDescription,
        category: allValue.category,
        reporter: allValue.reporter,
        attackName: allValue.attackName,
        description: allValue.description,
        impactAssessment: allValue.impactAssessment,
        socType: allValue.socType,
        createDttm: allValue.createDttm,
        updateDttm: allValue.updateDttm,
        relatedList: allValue.relatedList,
        showFontendRelatedList: allValue.showFontendRelatedList,
        ttpList: allValue.ttpList,
        eventList: allValue.eventList,
        killChainList: allValue.killChainList,
        status: allValue.status,
        fileList: allValue.fileList,
        fileMemo: allValue.fileMemo,
        tagList: allValue.tagList,
        notifyList: allValue.notifyList,
        historyList: allValue.historyList,
        creator: allValue.creator,
        announceSource: allValue.announceSource,
        expireDttm: helper.getFormattedDate(allValue.expireDttm, 'local'),
        establishDttm: helper.getFormattedDate(allValue.establishDttm, 'local'),
        attachmentDescription: allValue.attachmentDescription,
        accidentCatogory: allValue.accidentCatogory,
        accidentDescription: allValue.accidentDescription,
        accidentReason: allValue.accidentReason,
        accidentInvestigation: allValue.accidentInvestigation,
        accidentAbnormal: allValue.accidentAbnormal,
        accidentAbnormalOther: allValue.accidentAbnormalOther,
        severity: allValue.severity,
        flowTemplateId: allValue.flowTemplateId
      };

      if (incidentFormType === 'EDR') {
        tempIncident.info.edrList = allValue.edrList;
      }

      if (!tempIncident.info.socType) {
        tempIncident.info.socType = 1;
      }

      if (allValue.establishDttm) {
        tempIncident.info.enableEstablishDttm = true;
      } else {
        tempIncident.info.enableEstablishDttm = false;
      }

      this.setState({
        showFilter: false,
        originalIncident: _.cloneDeep(tempIncident)
      });
    } else if (type === 'addIncident') {
      tempIncident.info = {
        id: null,
        title: null,
        incidentDescription: null,
        category: null,
        reporter: null,
        attackName: null,
        description: null,
        impactAssessment: 4,
        socType: null,
        createDttm: null,
        relatedList: [],
        showFontendRelatedList: [],
        ttpList: null,
        eventList: null,
        notifyList: null,
        fileMemo: '',
        tagList: null,
        historyList: null,
        creator: null,
        announceSource: null,
        expireDttm: null,
        enableEstablishDttm: true,
        establishDttm: null,
        attachmentDescription: null,
        accidentCatogory: null,
        accidentDescription: null,
        accidentReason: null,
        accidentInvestigation: null,
        accidentAbnormal: null,
        accidentAbnormalOther: null,
        severity: 'Emergency',
        flowTemplateId: ''
      };

      if (!tempIncident.info.socType) {
        tempIncident.info.socType = 1;
      }

      this.setState({
        showFilter: false,
        originalIncident: _.cloneDeep(tempIncident),
        incidentType: allValue,
        incidentFormType: formType,
        displayPage: 'main'
      });
    } else if (type === 'tableList') {
      tempIncident.info = _.cloneDeep(incident.info);
    } else if (type === 'cancel-add') {
      showPage = 'tableList';
      tempIncident = _.cloneDeep(originalIncident);

      this.setState({
        incidentFormType: ''
      });
    } else if (type === 'cancel') {
      showPage = 'viewIncident';
      tempIncident = _.cloneDeep(originalIncident);
    } else if (type === 'redirect') {
      let alertData = JSON.parse(allValue);
      tempIncident.info = {
        title: alertData.Info,
        reporter: alertData.Collector,
        rawData:alertData,
        severity: alertData._severity_
      };

      if (tempIncident.info.severity === 'Emergency') {
        tempIncident.info['impactAssessment'] = 4;
      } else if (tempIncident.info.severity === 'Alert') {
        tempIncident.info['impactAssessment'] = 3;
      } else if (tempIncident.info.severity === 'Notice') {
        tempIncident.info['impactAssessment'] = 1;
      } else if (tempIncident.info.severity === 'Warning') {
        tempIncident.info['impactAssessment'] = 2;
      } else if (tempIncident.info.severity === 'Critical') {
        tempIncident.info['impactAssessment'] = 3;
      }

      if (!tempIncident.info.socType) {
        tempIncident.info.socType = 1;
      }

      // make incident.info
      let eventNetworkList = [];
      let eventNetworkItem = {
        srcIp: alertData.ipSrc || alertData.srcIp || alertData.ipsrc,
        srcPort: (parseInt(alertData.portSrc) || parseInt(alertData.srcPort) ? parseInt(alertData.portSrc) || parseInt(alertData.srcPort) : null),
        dstIp: alertData.ipDst || alertData.dstIp || alertData.destIp || alertData.ipdst,
        dstPort: parseInt(alertData.destPort) ? parseInt(alertData.destPort) : null,
        srcHostname: '',
        dstHostname: ''
      };
      eventNetworkList.push(eventNetworkItem);

      let eventList = [];
      let eventListItem = {
        description: alertData.Rule || alertData.trailName || alertData.__index_name,
        deviceId: '',
        frequency: 1,
        time: {
          from: helper.getFormattedDate(alertData._eventDttm_, 'local'),
          to: helper.getFormattedDate(alertData._eventDttm_, 'local')
        },
        eventConnectionList: eventNetworkList
      };

      if (alertData._edgeInfo || alertData._edgeId) {
        const searchRequestData = {
          deviceId: alertData._edgeInfo.agentId || alertData._edgeId
        };

        helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

        ah.one({
          url: `${baseUrl}/api/soc/device/redirect/_search`,
          data: JSON.stringify(searchRequestData),
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json'
        }).then(data => {
          eventListItem.deviceId = data.rt.device.id;
        })
      }

      eventList.push(eventListItem);
      tempIncident.info.eventList = eventList;
      showPage = 'addIncident';

      this.setState({
        showFilter: false,
        originalIncident: _.cloneDeep(tempIncident),
        incidentType: 'events',
        displayPage: 'main'
      });
    } else if (type === 'audit') {

    } else if (type === 'download') {
      this.getIncidentSTIXFile(allValue.id);
    } else if (type === 'refreshAttach') {
      tempIncident.info.attachmentDescription = allValue.attachmentDescription;
      tempIncident.info.fileList = allValue.fileList;
      tempIncident.info.fileMemo =  allValue.fileMemo;

      this.setState({
        showFilter: false,
        originalIncident: _.cloneDeep(tempIncident)
      });

      if (this.state.activeContent === 'editIncident') {
        showPage = 'editIncident';
      } else {
        showPage = 'viewIncident';
      }
    }

    this.setState({
      displayPage: 'main',
      activeContent: showPage,
      incident: tempIncident
    }, () => {
      if (showPage === 'addIncident' && !_.isEmpty(savedData)) {
        PopupDialog.prompt({
          id: 'modalWindowSmall',
          confirmText: it('txt-restore'),
          cancelText: it('txt-abandon'),
          display: this.getTempSavedMsg(),
          act: (confirmed) => {
            if (confirmed) {
              tempIncident.info = {
                ...savedData.contentJson
              };

              if (!tempIncident.info.socType) {
                tempIncident.info.socType = 1;
              }

              this.setState({
                originalIncident: _.cloneDeep(tempIncident),
                incident: tempIncident,
                tempSavedData: savedData
              });
            } else {
              this.deleteTempSavedData(savedData.id);
            }
          }
        });
      }

      if (showPage === 'tableList' || showPage === 'cancel-add') {
        if (loadListType === 0) {
          this.loadCondition('other', 'expired');
        } else if (loadListType === 1) {
          this.loadCondition('other', 'unhandled');
        } else if (loadListType === 2) {
          this.loadCondition('other', 'mine');
        } else if (loadListType === 3) {
          this.loadData();
        }
        this.loadDashboard();
      }
    })
  }
  /**
   *
   * @param {string} id
   */
  auditIncident = (id) => {
    const {baseUrl} = this.context;
    const tmp = {
      id
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/_audit`,
      data: JSON.stringify(tmp),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      this.afterAuditDialog(id);
      return null;
    })
    .catch(err => {
      helper.showPopupMsg(it('txt-audit-fail'), it('txt-audit'));
    })
  }
  /**
   * Send Incident
   * @param {string} id - active incident ID
   */
  sendIncident = (id) => {
    const {baseUrl} = this.context;
    const {loadListType, attachmentList} = this.state;
    const fileNameList = _.map(attachmentList, val => {
      return val.fileName
    });

    let requestData = {
      id
    };

    if (fileNameList.length > 0) {
      requestData.fileNameList = fileNameList;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/_send`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (loadListType === 0) {
        this.loadCondition('other','expired');
      } else if (loadListType === 2) {
        this.loadCondition('other','mine');
      } else if (loadListType === 3) {
        this.loadData();
      }
      helper.showPopupMsg(it('txt-send-success'), it('txt-send'));
    })
    .catch(err => {
      helper.showPopupMsg(it('txt-send-fail'), it('txt-send'));
    })

    this.handleCloseMenu();
    this.toggleSendIncident();
  }
  /**
   * Open audit finish dialog
   * @method
   * @returns ModalDialog component
   */
  afterAuditDialog = (incidentId) => {
    const {loadListType} = this.state;
    const titleText = it('txt-send');
    PopupDialog.prompt({
      id: 'afterAuditDialog',
      title: titleText,
      cancelText: t('txt-close'),
      confirmText: it('txt-send'),
      display: this.displayAfterAudit(),
      act: (confirmed) => {
        if (confirmed) {
          this.sendIncident(incidentId);
        } else {
          if (loadListType === 0) {
            this.loadCondition('expired');
          } else if (loadListType === 1) {
            this.loadCondition('unhandled');
          } else if (loadListType === 2) {
            this.loadCondition('mine');
          } else if (loadListType === 3) {
            this.loadData();
          }
        }
      }
    });
  }
  /**
   * Display audit finish dialog content
   * @method
   * @returns HTML DOM
   */
  displayAfterAudit = () => {
    return (
      <div>
        <label>{it('txt-audit-success')}{it('txt-sendCheck')}</label>
      </div>
    )
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - input type
   * @param {Object} event - input value
   */
  handleInputSearch = (type, event) => {
    let tempSearch = {...this.state.search};
    tempSearch[type] = event.target.value.trim();

    this.setState({
      search: tempSearch
    });
  }
  handleSearchChange = (event) => {
    let tempSearch = {...this.state.search};
    tempSearch[event.target.name] = event.target.value.trim();

    this.setState({
      search: tempSearch
    });
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleSearch = (type, value) => {
    let tempSearch = {...this.state.search};
    tempSearch[type] = value;

    this.setState({
      search: tempSearch
    });
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleSearchTime = (type, value) => {
    let tempSearch = {...this.state.search};
    tempSearch.datetime[type] = value;

    this.setState({
      search: tempSearch
    });
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleSearchMui = (event) => {
    let tempSearch = {...this.state.search};
    tempSearch[event.target.name] = event.target.value;

    this.setState({
      search: tempSearch
    });
  }
  onNameChange = (event, values) => {
    let tempSearch = {...this.state.search};
    tempSearch['tagList'] = values;

    this.setState({
      search: tempSearch
    });
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
  toggleChart = () => {
    this.setState({
      showChart: !this.state.showChart
    });
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      search: {
        keyword: '',
        category: 0,
        status: 0,
        datetime:{
          from: helper.getSubstractDate(1, 'month'),
          to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
        },
        isExpired: 2,
        checkbox: {
          isExpired: false,
          creator: false
        },
        tagList:[]
      },
      selectedStatus:[]
    });
  }
  /**
   * Handle Incident data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleDataChange = (type, value) => {
    let temp = {...this.state.incident};
    temp.info[type] = value;

    if (type === 'impactAssessment') {
      temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * value), 'hours');
    }

    this.setState({
      incident: temp
    });
  }
  handleDataChangeMui = (event) => {
    const {incident, socFlowSourceList} = this.state;
    const name = event.target.name;
    const value = event.target.value;
    let tempIncident = {...incident};
    tempIncident.info[name] = value;

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
  getOptions = () => {
    const {baseUrl, contextRoot, session , tagList} = this.context;

    // helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    // ah.one({
    //   url: `${baseUrl}/api/soc/_search`,
    //   data: JSON.stringify({}),
    //   type: 'POST',
    //   contentType: 'application/json',
    //   dataType: 'json'
    // })
    // .then(data => {
    //   if (data) {
    //     let list = _.map(data.rt.rows, val => {
    //       let ipContent = '';

    //       if (val.eventList) {
    //         val.eventList = _.map(val.eventList, el => {
    //           if (el.eventConnectionList) {
    //             el.eventConnectionList = _.map(el.eventConnectionList, ecl => {
    //               ipContent += '(' + it('txt-srcIp')+ ': ' + ecl.srcIp + ')'
    //             })
    //           }
    //         })
    //       }

    //       return {
    //         value: val.id,
    //         text: val.id + ' (' + it(`category.${val.category}`) + ')' + ipContent
    //       };
    //     });

    //     this.setState({
    //       relatedListOptions: list
    //     });
    //   }
    // })
    // .catch(err => {
    //   helper.showPopupMsg('', t('txt-error'), err.message);
    // });

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/device/_search`,
      data: JSON.stringify({use:'1'}),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data) {
        const list = _.map(data.rt.rows, val => {
          return {
            value: val.id,
            text: val.deviceName
          };
        });

        this.setState({
          deviceListOptions: list
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/device/_search`,
      data: JSON.stringify({use:'2'}),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data) {
        const list = _.map(data.rt.rows, val => {
          return {
            value: val.id,
            text: val.deviceName
          };
        });

        this.setState({
          showDeviceListOptions: list
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/tag/_search`,
      data: JSON.stringify({account: session.accountId}),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      this.setState({
        tagList: data.rt
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle XML download
   * @param {Example-Type} option
   */
  getIncidentSTIXFileExample = (option) => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/soc/incident/example/_export`;
    let requestData = {
      example: option
    };

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  /**
   * Incident-ID
   * @param {Incident-ID} incidentId
   */
  getIncidentSTIXFile = (incidentId) => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/soc/_export`;
    let requestData = {
      id: incidentId
    };

    this.handleCloseMenu();

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  /**
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable or null
   */
  checkSortable = (field) => {
    const unSortableFields = ['description', '_menu', 'action', 'tag'];

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
  handleTableSort = (field, sort) => {
    const {loadListType} = this.state;
    let tmpIncident = {...this.state.incident};
    tmpIncident.sort.field = field;
    tmpIncident.sort.desc = sort;

    this.setState({
      incident: tmpIncident
    }, () => {
      if (loadListType === 0) {
        this.loadCondition('other','expired');
      } else if (loadListType === 1) {
        this.loadCondition('other','unhandled');
      } else if (loadListType === 2) {
        this.loadCondition('other','mine');
      } else if (loadListType === 3) {
        this.loadData();
      }
    });
  }
  openIncidentComment = () => {
    this.incidentComment.open();
  }
  openIncidentTag = (id) => {
    this.handleCloseMenu();
    this.incidentTag.open(id);
  }
  openIncidentFlow = (id) => {
    this.handleCloseMenu();
    this.incidentFlowDialog.open(id);
  }
  openIncidentReview = (incidentId, reviewType) => {
    this.incidentReview.open(incidentId, reviewType);
  }
  openNotifyDialog = () => {
    this.notifyDialog.open(this.state.incident.info.id, this.state.notifyEmailList);
  }
  uploadAttachment = () => {
    const {baseUrl} = this.context;
    const {incident, attach} = this.state;

    let formData = new FormData();
    formData.append('id', incident.info.id);

    if (attach.length > 0) {
      _.forEach(attach, val => {
        formData.append('file', val);
      })
    }

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
        attach: null
      }, () => {
        this.getIncident(incident.info.id, 'view');
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  toPdfPayload = (incident) => {
    const {incidentType, deviceListOptions, showDeviceListOptions} = this.state;
    let payload = {};

    payload.id = incident.id;
    payload.header = `${it('txt-incident-id')}${incident.id}`;
    // basic
    payload.basic = {};
    payload.basic.cols = 4;
    payload.basic.header = `${t('edge-management.txt-basicInfo')}    ${f('incidentFields.updateDttm')}  ${helper.getFormattedDate(incident.updateDttm, 'local')}`;
    payload.basic.table = [];
    payload.basic.table.push({text: f('incidentFields.title'), colSpan: 2});
    payload.basic.table.push({text: f('incidentFields.category'), colSpan: 2});
    payload.basic.table.push({text: incident.title, colSpan: 2});
    payload.basic.table.push({text: it(`category.${incident.category}`), colSpan: 2});
    payload.basic.table.push({text: f('incidentFields.incidentDescription'), colSpan: 4});
    payload.basic.table.push({text: incident.incidentDescription, colSpan: 4});
    payload.basic.table.push({text: f('incidentFields.reporter'), colSpan: 2});
    payload.basic.table.push({text: f('incidentFields.impactAssessment'), colSpan: 1});
    payload.basic.table.push({text: f('incidentFields.finalDate'), colSpan: 1});
    payload.basic.table.push({text: incident.reporter, colSpan: 2});
    payload.basic.table.push({text: `${incident.impactAssessment} (${(9 - 2 * incident.impactAssessment)} ${it('txt-day')})`, colSpan: 1});
    payload.basic.table.push({text: helper.getFormattedDate(incident.expireDttm, 'local'), colSpan: 1});
    payload.basic.table.push({text: helper.getFormattedDate(incident.establishDttm, 'local'), colSpan: 1});
    payload.basic.table.push({text: f('incidentFields.attackName'), colSpan: 4});
    payload.basic.table.push({text: incident.attackName, colSpan: 4});
    payload.basic.table.push({text: f('incidentFields.description'), colSpan: 4});
    payload.basic.table.push({text: incident.description, colSpan: 4});

    if (incidentType === 'ttps') {
      if (_.size(incident.relatedList) > 0) {
        let value = [];
        _.forEach(incident.relatedList, el => {
          const target = _.find([], {value: el.value});
          value.push(target.text);
        })

        payload.basic.table.push({text: f('incidentFields.relatedList'), colSpan: 4});
        payload.basic.table.push({text: value.toString(), colSpan: 4});
      }
    }

    // history
    payload.history = {};
    payload.history.cols = 4;
    payload.history.header = it('txt-flowTitle');
    payload.history.table = [];
    payload.history.table.push({text: f(`incidentFields.status`), colSpan: 1});
    payload.history.table.push({text: f(`incidentFields.reviewDttm`), colSpan: 1});
    payload.history.table.push({text: f(`incidentFields.reviewerName`), colSpan: 1});
    payload.history.table.push({text: f(`incidentFields.suggestion`), colSpan: 1});

    _.forEach(incident.historyList, el => {
      payload.history.table.push({text: it(`action.${el.status}`), colSpan: 1});
      payload.history.table.push({text: moment(el.reviewDttm).local().format('YYYY-MM-DD HH:mm:ss'), colSpan: 1});
      payload.history.table.push({text: el.reviewerName, colSpan: 1});
      payload.history.table.push({text: el.suggestion, colSpan: 1});
    })

    // attach
    if (_.size(incident.fileList) > 0) {
      payload.attachment = {};
      payload.attachment.cols = 4;
      payload.attachment.header = it('txt-attachedFile');
      payload.attachment.table = [];
      payload.attachment.table.push({text: f(`incidentFields.fileName`), colSpan: 1});
      payload.attachment.table.push({text: f(`incidentFields.fileSize`), colSpan: 1});
      payload.attachment.table.push({text: f(`incidentFields.fileDttm`), colSpan: 1});
      payload.attachment.table.push({text: f(`incidentFields.fileMemo`), colSpan: 1});

      _.forEach(incident.fileList, file => {
        payload.attachment.table.push({text: file.fileName, colSpan: 1});
        payload.attachment.table.push({text: this.formatBytes(file.fileSize), colSpan: 1});
        payload.attachment.table.push({text: moment(file.fileDttm).local().format('YYYY-MM-DD HH:mm:ss'), colSpan: 1});
        const target = _.find(JSON.parse(incident.attachmentDescription), {fileName: file.fileName});
        payload.attachment.table.push({text: target.fileMemo, colSpan: 1});
      })
    }

    //  Contact list
    payload.notifyList = {};
    payload.notifyList.cols = 8;
    payload.notifyList.header = it('txt-notifyUnit');
    payload.notifyList.table = [];

    _.forEach(incident.notifyList, notify => {
      payload.notifyList.table.push({text: f('incidentFields.name'), colSpan: 2});
      payload.notifyList.table.push({text: f('incidentFields.reviewerName'), colSpan: 2});
      payload.notifyList.table.push({text: f('incidentFields.phone'), colSpan: 2});
      payload.notifyList.table.push({text: f('incidentFields.email'), colSpan: 2});
      payload.notifyList.table.push({text: notify.title, colSpan: 2});
      payload.notifyList.table.push({text: notify.name, colSpan: 2});
      payload.notifyList.table.push({text: notify.phone, colSpan: 2});
      payload.notifyList.table.push({text: notify.email, colSpan: 2});
    })

    // accident
    payload.accident = {};
    payload.accident.cols = 4;
    payload.accident.header = it('txt-accidentTitle');
    payload.accident.table = [];
    payload.accident.table.push({text: it('txt-accidentClassification'), colSpan: 2});
    payload.accident.table.push({text: it('txt-reason'), colSpan: 2});

    if (incident.accidentCatogory) {
      payload.accident.table.push({text: it(`accident.${incident.accidentCatogory}`), colSpan: 2});
    } else {
      payload.accident.table.push({text: ' ', colSpan: 2});
    }

    if (!incident.accidentCatogory) {
      payload.accident.table.push({text: ' ', colSpan: 2});
    } else if (incident.accidentCatogory === '5') {
      payload.accident.table.push({text: incident.accidentAbnormalOther, colSpan: 2});
    } else {
      payload.accident.table.push({text: it(`accident.${incident.accidentAbnormal}`), colSpan: 2});
    }

    payload.accident.table.push({text: it('txt-accidentDescr'), colSpan: 4});
    payload.accident.table.push({text: incident.accidentDescription, colSpan: 4});
    payload.accident.table.push({text: it('txt-reasonDescr'), colSpan: 4});
    payload.accident.table.push({text: incident.accidentReason, colSpan: 4});
    payload.accident.table.push({text: it('txt-accidentInvestigation'), colSpan: 4});
    payload.accident.table.push({text: incident.accidentInvestigation, colSpan: 4});

    //  event list
    payload.eventList = {};
    payload.eventList.cols = 6;
    payload.eventList.header = it('txt-incident-events');
    payload.eventList.table = [];

    _.forEach(incident.eventList, event => {
      payload.eventList.table.push({text: f('incidentFields.rule'), colSpan: 3});
      payload.eventList.table.push({text: f('incidentFields.deviceId'), colSpan: 3});
      payload.eventList.table.push({text: event.description, colSpan: 3});
      const target = _.find(showDeviceListOptions, {value: event.deviceId});

      if (target) {
        payload.eventList.table.push({text: target.text, colSpan: 3});
      } else {
        payload.eventList.table.push({text: '', colSpan: 3});
      }

      payload.eventList.table.push({text: f('incidentFields.dateRange'), colSpan: 4});
      payload.eventList.table.push({text: it('txt-frequency'), colSpan: 2});
      payload.eventList.table.push({text: moment.utc(event.startDttm, 'YYYY-MM-DDTHH:mm:ss[Z]').local().format('YYYY-MM-DD HH:mm:ss'), colSpan: 2});
      payload.eventList.table.push({text: moment.utc(event.endDttm, 'YYYY-MM-DDTHH:mm:ss[Z]').local().format('YYYY-MM-DD HH:mm:ss'), colSpan: 2});
      payload.eventList.table.push({text: event.frequency, colSpan: 2});

      _.forEach(event.eventConnectionList, conn => {
        payload.eventList.table.push({text: f('incidentFields.srcIp'), colSpan: 2});
        payload.eventList.table.push({text: f('incidentFields.srcPort'), colSpan: 2});
        payload.eventList.table.push({text: f('incidentFields.srcHostname'), colSpan: 2});
        payload.eventList.table.push({text: conn.srcIp, colSpan: 2});
        payload.eventList.table.push({text: conn.srcPort, colSpan: 2});
        payload.eventList.table.push({text: conn.srcHostname, colSpan: 2});
        payload.eventList.table.push({text: f('incidentFields.dstIp'), colSpan: 2});
        payload.eventList.table.push({text: f('incidentFields.dstPort'), colSpan: 2});
        payload.eventList.table.push({text: f('incidentFields.dstHostname'), colSpan: 2});
        payload.eventList.table.push({text: conn.dstIp, colSpan: 2});
        payload.eventList.table.push({text: conn.dstPort, colSpan: 2});
        payload.eventList.table.push({text: conn.dstHostname, colSpan: 2});
      })
    })

    // ttps
    if (_.size(incident.ttpList) > 0) {
      payload.ttps = {};
      payload.ttps.cols = 4;
      payload.ttps.header = it('txt-incident-ttps');
      payload.ttps.table = [];
    }

    _.forEach(incident.ttpList, ttp => {
      payload.ttps.table.push({text: f('incidentFields.technique'), colSpan: 2});
      payload.ttps.table.push({text: f('incidentFields.infrastructureType'), colSpan: 2});
      payload.ttps.table.push({text: ttp.title, colSpan: 2});
      payload.ttps.table.push({text: (ttp.infrastructureType === 0 || ttp.infrastructureType === '0') ? 'IOC' : 'IOA' , colSpan: 2});

      if (_.size(ttp.etsList) > 0) {
        payload.ttps.table.push({text: it('txt-ttp-ets'), colSpan: 4});

        _.forEach(ttp.etsList, ets => {
          payload.ttps.table.push({text: f('incidentFields.cveId'), colSpan: 2});
          payload.ttps.table.push({text: f('incidentFields.etsDescription'), colSpan: 2});
          payload.ttps.table.push({text: ets.cveId || '', colSpan: 2});
          payload.ttps.table.push({text: ets.description || '', colSpan: 2});
        })
      }

      if (_.size(ttp.obsFileList) > 0) {
        payload.ttps.table.push({text: it('txt-ttp-obs-file'), colSpan: 4});

        _.forEach(ttp.obsFileList, obsFile => {
          payload.ttps.table.push({text: f('incidentFields.fileName'), colSpan: 2});
          payload.ttps.table.push({text: f('incidentFields.fileExtension'), colSpan: 2});
          payload.ttps.table.push({text: obsFile.fileName, colSpan: 2});
          payload.ttps.table.push({text: obsFile.fileExtension, colSpan: 2});
          payload.ttps.table.push({text: 'MD5', colSpan: 2});
          payload.ttps.table.push({text: 'SHA1', colSpan: 2});
          payload.ttps.table.push({text: obsFile.md5, colSpan: 2});
          payload.ttps.table.push({text: obsFile.sha1, colSpan: 2});
          payload.ttps.table.push({text: 'SHA256', colSpan: 4});
          payload.ttps.table.push({text: obsFile.sha256, colSpan: 4});
        })
      }

      if (_.size(ttp.obsUriList) > 0) {
        payload.ttps.table.push({text: it('txt-ttp-obs-uri'), colSpan: 4});

        _.forEach(ttp.obsUriList, obsUri => {
          payload.ttps.table.push({text: f('incidentFields.uriType'), colSpan: 2});
          payload.ttps.table.push({text: f('incidentFields.uriValue'), colSpan: 2});
          payload.ttps.table.push({text: obsUri.uriType === 0 ? 'URL' : f('incidentFields.domain'), colSpan: 2});
          payload.ttps.table.push({text: obsUri.uriValue, colSpan: 2});
        })
      }

      if (_.size(ttp.obsSocketList) > 0) {
        payload.ttps.table.push({text: it('txt-ttp-obs-socket'), colSpan: 4});

        _.forEach(ttp.obsSocketList, obsSocket => {
          payload.ttps.table.push({text: 'IP', colSpan: 2});
          payload.ttps.table.push({text: 'Port', colSpan: 2});
          payload.ttps.table.push({text: obsSocket.ip, colSpan: 2});
          payload.ttps.table.push({text: obsSocket.port, colSpan: 2});
        })
      }
    })

    return payload;
  }
  exportPdf = () => {
    const {baseUrl, contextRoot} = this.context;
    const {incident} = this.state;

    downloadWithForm(`${baseUrl}${contextRoot}/api/soc/_pdf`, {payload: JSON.stringify(this.toPdfPayload(incident.info))});
  }
  exportPdfFromTable = (data) => {
    const {baseUrl, contextRoot} = this.context;
    this.handleCloseMenu();

    downloadWithForm(`${baseUrl}${contextRoot}/api/soc/_pdf`, {payload: JSON.stringify(this.toPdfPayload(data))});
  }
  exportAll = () => {
    const {baseUrl, contextRoot} = this.context;
    const requestData = this.getIncidentRequestData();

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/_searchV4`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      let payload = _.map(data.rt.rows, el => {
        return this.toPdfPayload(el);
      });

      downloadWithForm(`${baseUrl}${contextRoot}/api/soc/_pdfs`, {payload: JSON.stringify(payload)});
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  exportAllByWord = () => {
    const {baseUrl, contextRoot} = this.context;
    const payload = this.getIncidentRequestData();

    downloadWithForm(`${baseUrl}${contextRoot}/api/soc/_exportWord`, {payload: JSON.stringify(payload)});
  }
  notifyContact = () => {
    const {baseUrl} = this.context;
    const {incident} = this.state;
    const requestData = {
      incidentId: incident.info.id
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/_sendEmailList`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data && data.rt) {
        this.setState({
          notifyEmailList: data.rt.rows
        }, () => {
          this.openNotifyDialog();
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  render() {
    const {session} = this.context;
    const {
      activeContent,
      baseUrl,
      contextRoot,
      showFilter,
      showChart,
      incident, 
      contextAnchor,
      menuType,
      currentData,
      accountType,
      relatedListOpen,
      uploadAttachmentOpen,
      statisticsReportOpen,
      sendIncidentOpen,
      loadListType
    } = this.state;
    let insertCheck = false;
    let sendCheck = false;

    if (_.includes(session.roles, constants.soc.SOC_Analyzer) || _.includes(session.roles, constants.soc.SOC_Executor)) {
      insertCheck = true;
    }

    if ((_.includes(this.state.accountRoleType,constants.soc.SOC_Super) && ((currentData.status === constants.soc.INCIDENT_STATUS_CLOSED) || ((currentData.flowData && currentData.flowData.finish) && (currentData.status === constants.soc.INCIDENT_STATUS_UNREVIEWED))))
        || (_.includes(this.state.accountRoleType,constants.soc.SOC_Ciso) && ((currentData.status === constants.soc.INCIDENT_STATUS_CLOSED) || ((currentData.flowData && currentData.flowData.finish) && (currentData.status === constants.soc.INCIDENT_STATUS_UNREVIEWED))))
        || (_.includes(this.state.accountRoleType,constants.soc.SOC_Executor) && ((currentData.status === constants.soc.INCIDENT_STATUS_CLOSED) || ((currentData.flowData && currentData.flowData.finish) && (currentData.status === constants.soc.INCIDENT_STATUS_UNREVIEWED))))) {
        sendCheck = true;
    }

    const tableOptions = {
      onChangePage: (currentPage) => {
        this.handlePaginationChange('currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort(changedColumn, direction === 'desc');
      }
    };

    return (
      <div>
        <IncidentComment ref={ref => { this.incidentComment = ref }} />

        {loadListType === 0 &&
          <IncidentTag ref={ref => { this.incidentTag = ref }} onLoad={this.loadCondition.bind(this,'button','expired')} />
        }

        {loadListType === 1 &&
          <IncidentTag ref={ref => { this.incidentTag = ref }} onLoad={this.loadCondition.bind(this,'button','unhandled')} />
        }

        {loadListType === 2 &&
          <IncidentTag ref={ref => { this.incidentTag = ref }} onLoad={this.loadCondition.bind(this,'button','mine')} />
        }

        {loadListType === 3 &&
          <IncidentTag ref={ref => { this.incidentTag = ref }} onLoad={this.loadData} />
        }

        <IncidentFlowDialog ref={ref => { this.incidentFlowDialog = ref }} />
        <IncidentReview ref={ref => { this.incidentReview = ref }} loadTab={'manager'} onLoad={this.getIncident} />
        <NotifyDialog ref={ref => { this.notifyDialog = ref }} />

        {relatedListOpen &&
          <RelatedList
            incidentList={incident.info.showFontendRelatedList}
            setIncidentList={this.setIncidentList}
            toggleRelatedListModal={this.toggleRelatedListModal} />
        }

        {uploadAttachmentOpen &&
          this.uploadAttachmentModal()
        }

        {statisticsReportOpen &&
          this.statisticsReportModal()
        }

        {sendIncidentOpen &&
          this.sendIncidentModal()
        }

        <Menu
          anchorEl={contextAnchor}
          keepMounted
          open={menuType === 'incidentMenu' && Boolean(contextAnchor)}
          onClose={this.handleCloseMenu}>
          {accountType === constants.soc.NONE_LIMIT_ACCOUNT && insertCheck &&
            <MenuItem onClick={this.checkTempSave.bind(this, 'events', 'monitor')}>{it('txt-eventsIncident')}</MenuItem>
          }
          {accountType === constants.soc.NONE_LIMIT_ACCOUNT && insertCheck &&
            <MenuItem onClick={this.checkTempSave.bind(this, 'ttps', 'analyze')}>{it('txt-ttpsIncident')}</MenuItem>
          }
          <MenuItem onClick={this.checkTempSave.bind(this, 'ttps', 'EDR')}>EDR</MenuItem>
        </Menu>

        <Menu
          anchorEl={contextAnchor}
          keepMounted
          open={menuType === 'tableMenu' && Boolean(contextAnchor)}
          onClose={this.handleCloseMenu}>
          <MenuItem onClick={this.getIncident.bind(this, currentData.id, 'view')}>{t('txt-view')}</MenuItem>
          <MenuItem onClick={this.openIncidentTag.bind(this, currentData.id)}>{it('txt-tag')}</MenuItem>
          <MenuItem onClick={this.exportPdfFromTable.bind(this, currentData)}>{t('txt-export')}</MenuItem>

          {currentData.status === constants.soc.INCIDENT_STATUS_DELETED &&
            <MenuItem onClick={this.openReviewModal.bind(this, currentData, 'restart')}>{it('txt-restart')}</MenuItem>
          }

          {_.includes(this.state.accountRoleType,constants.soc.SOC_Executor) && currentData.status !== constants.soc.INCIDENT_STATUS_DELETED &&
            <MenuItem onClick={this.openReviewModal.bind(this, currentData, 'delete')}>{it('txt-delete')}</MenuItem>
          }

          {!(currentData.flowData && currentData.flowData.finish) &&
            <MenuItem onClick={this.openIncidentFlow.bind(this, currentData.id)}>{it('txt-view-flow')}</MenuItem>
          }

          {sendCheck &&
            <MenuItem onClick={this.toggleSendIncident.bind(this, currentData)}>{it('txt-send')}</MenuItem>
          }

          {currentData.status === constants.soc.INCIDENT_STATUS_SUBMITTED || currentData.status === constants.soc.INCIDENT_STATUS_CLOSED &&
            <MenuItem onClick={this.getIncidentSTIXFile.bind(this, currentData.id)}>{it('txt-download')}</MenuItem>
          }
        </Menu>

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter' /></button>
            <button className={cx('', {'active': showChart})} onClick={this.toggleChart} title={it('txt-statistics')}><i className='fg fg-chart-columns' /></button>
            {accountType === constants.soc.NONE_LIMIT_ACCOUNT &&
              <button className='' onClick={this.openIncidentTag.bind(this, null)} title={it('txt-custom-tag')}><i className='fg fg-color-ruler' /></button>
            }
            <button className='' onClick={this.openIncidentComment} title={it('txt-comment-example-edit')}><i className='fg fg-report' /></button>
          </div>
        </div>

        <div className='data-content'>
          <SocConfig
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            session={session}
            accountType={accountType} />

          <div className='parent-content'>
            {this.renderStatistics()}
            {this.renderFilter()}

            {activeContent === 'tableList' &&
              <div className='main-content'>
                <header className='main-header'>{it('txt-incident')}</header>
                <div className='content-header-btns with-menu '>
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleStatisticsReport} data-cy='export-statistics-report'>{it('txt-exportStatisticsReport')}</Button>
                  {activeContent === 'viewIncident' &&
                    <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>
                  }
                  {_.size(incident.dataContent) > 0 &&
                    <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.exportAll}>{it('txt-export-all')}</Button>
                  }
                  {_.size(incident.dataContent) > 0 &&
                    <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.exportAllByWord}>{it('txt-export-all-word')}</Button>
                  }

                  <Button id='inventoryAddIp' variant='outlined' color='primary' className='standard btn' onClick={this.handleOpenMenu.bind(this, 'incidentMenu', '')}>{it('txt-addIncident')}</Button>
                </div>
                <MuiTableContentWithoutLoading
                  data={incident}
                  tableOptions={tableOptions} />
              </div>
            }
            {(activeContent === 'viewIncident' || activeContent === 'editIncident' || activeContent === 'addIncident') &&
              this.displayFormContent()
            }
          </div>
        </div>
      </div>
    )
  }
}

IncidentManagement.contextType = BaseDataContext;
IncidentManagement.propTypes = {
};

export default IncidentManagement;