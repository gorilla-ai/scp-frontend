import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import cx from 'classnames'
import _ from 'lodash'

import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardDateTimePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'

import UpdateIcon from '@material-ui/icons/Update'

import DataTable from 'react-ui/build/src/components/table'
import LineChart from 'react-chart/build/src/components/line'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context'
import Config from '../../common/configuration'
import ExportCharts from './export-charts'
import ExportCSV from '../../common/export-csv'
import helper from '../../common/helper'
import SyslogConfig from './syslog-config'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const IP_PATTERN = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
const DEFAULT_INPUT = 'streaming log sample';
const DEFAULT_PATTERN = '%{GREEDYDATA}';
const INIT_PATTERN_NAME = 'Pattern1';
const INIT_CONFIG = {
  type: 'formatSettings',
  id: '',
  loghostIp: '',
  name: '',
  port: '',
  format: '',
  patternSetting: [{
    patternName: INIT_PATTERN_NAME,
    input: DEFAULT_INPUT,
    pattern: DEFAULT_PATTERN,
    property: null,
    relationships: [
      {name: '', srcNode: '', dstNode: '', conditions:[]}
    ],
    rawOptions: []
  }]
};
const SYSLOG_SEARCH = {
  name: '',
  loghostip: '',
  port: '',
  isactive: '',
  netproxyname: ''
};
const FORM_VALIDATION = {
  editHostsHost: {
    valid: true
  },
  sshAccountName: {
    valid: true
  }
};

let a = null;
let t = null;
let f = null;
let et = null;

/**
 * Syslog Management
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to manage the System Syslog
 */
class Syslog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openFilter: false,
      activeContent: 'syslogData', //'syslogData', 'hostInfo' or 'editSyslog'
      dataFieldsArr: ['name', 'port', 'format', 'avgLogSizeB', 'patternName', 'notify', '_menu'],
      dataFields: {},
      syslog: {
        dataContent: null,
        sort: {
          field: 'name',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
      },
      hostsFieldsArr: ['id', 'host', 'name', '_menu'],
      hostsFields: {}, 
      hosts: {
        dataContent: [],
        sort: {
          field: 'ip',
          desc: false
        }
      },
      syslogSearch: _.cloneDeep(SYSLOG_SEARCH),
      activeHostInfo: {
        id: '',
        ip: ''
      },
      newHostName: '',
      hostNotifyStatus: '',
      sshDataFieldArr: ['id', 'account', 'option'],
      sshData: [],
      sshAccountName: '',
      activeSyslogData: {},
      editSyslogType: '', //'edit' or 'save'
      editHostsType: '',
      editHosts: {
        host: '',
        name: ''
      },
      showPatternLeftNav: true,
      openExportCharts: false,
      openEditHost: false,
      openTimeline: false,
      openEditHosts: false,
      openEditPatternName: false,
      clickTimeline: false,
      showSshAccount: false,
      showAddSshAccount: false,
      contextAnchorCharts: null,
      activeTimeline: '',
      activeConfigId: '',
      activeConfigName: '',
      chartIntervalList: [],
      chartIntervalValue: '',
      datetime: {
        from: helper.getStartDate('day'),
        to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
      },
      chartExportType: 'securityLog', //'securityLog' or 'syslog'
      datetimeExport: {
        from: helper.getStartDate('day'),
        to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
      },
      netProxyData: {
        list: [],
        configs: {}
      },
      netProxyLookUp: {},
      exportChartsIpList: [],
      exportCharts: [{
        hostIp: '',
        hostName: '',
        configList: []
      }],
      exportType: '',
      popOverAnchor: null,
      taskServiceList: {
        data: null,
        scrollCount: 0,
        pageSize: 10,
        hasMore: true
      },
      eventsData: {},
      hostsData: {},
      configRelationships: [],
      syslogPatternConfig: {},
      activeHost: {},
      currentHostData: {},
      currentConfigData: {},
      activePatternIndex: '',
      activePatternName: INIT_PATTERN_NAME,
      activePatternMouse: '',
      newPatternName: '',
      info: '',
      editPatternType: 'edit',
      contextAnchor: null,
      currentPattern: {
        index: '',
        data: {}
      },
      formValidation: _.cloneDeep(FORM_VALIDATION)
    };

    a = global.chewbaccaI18n.getFixedT(null, 'accounts');
    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors')
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);
    helper.inactivityTime(baseUrl, locale);

    this.getRelationship();
    this.getSyslogData();
    this.getSshAccountList();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get and set the relationships data
   * @method
   */
  getRelationship = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/log/relationships`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        this.setState({
          configRelationships: data.relationships
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set syslog data
   * @method
   */
  getSyslogData = () => {
    const {baseUrl} = this.context;
    const {dataFieldsArr, syslog, syslogSearch} = this.state;
    let urlParams = '';

    if (syslogSearch.name) {
      urlParams += `&name=${syslogSearch.name}`;
    }

    if (syslogSearch.loghostip) {
      urlParams += `&loghostip=${syslogSearch.loghostip}`;
    }

    if (syslogSearch.port) {
      urlParams += `&port=${syslogSearch.port}`;
    }

    if (syslogSearch.isactive === true || syslogSearch.isactive === false) {
      urlParams += `&isactive=${syslogSearch.isactive}`;
    }

    if (syslogSearch.netproxyname) {
      urlParams += `&netproxyname=${syslogSearch.netproxyname}`;
    }

    this.ah.one({
      url: `${baseUrl}/api/v3/log/config?${urlParams}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempSyslog = {...syslog};
        tempSyslog.dataContent = data.rows;

        if (!data.rows || data.rows.length === 0) {
          tempSyslog.dataContent = [];
          tempSyslog.totalCount = 0;

          this.setState({
            syslog: tempSyslog
          });
          return null;
        }

        let tempFields = {};
        dataFieldsArr.forEach(tempData => {
          tempFields[tempData] = {
            label: tempData === '_menu' ? '' : t(`syslogFields.${tempData}`),
            sortable: (tempData === '_menu' || tempData === 'patternName') ? null : true,
            formatter: (value, allValue, i) => {
              if (tempData === 'avgLogSizeB') {
                return <span>{value > 0 ? value : 'N/A'}</span>;
              } else if (tempData === 'patternName') {
                if (allValue.patternSetting.length > 0) {
                  return <div className='flex-item'>{allValue.patternSetting.map(this.displayPatternName)}</div>
                }
              } else if (tempData === 'notify') {
                return <span>{value ? t('txt-statusOn') : t('txt-statusOff')}</span>
              } else if (tempData === '_menu') {
                return (
                  <div className='table-menu menu active'>
                    <i className='fg fg-edit' onClick={this.openSyslogV2.bind(this, allValue)} title={t('txt-edit')}></i>
                    {/* <i className='fg fg-trashcan' onClick={this.openDeleteConfigModal.bind(this, allValue)} title={t('txt-delete')}></i> */}
                    <i className='fg fg-chart-kpi' onClick={this.openTimeline.bind(this, 'configId', allValue)} title={t('syslogFields.txt-overallDist')}></i>
                    <i className='fg fg-list' onClick={this.redirectSyslog.bind(this, allValue)} title={t('syslogFields.txt-viewEvents')}></i>
                    <i className='fg fg-network' onClick={this.getHostsInfoById.bind(this, allValue.id)} title={t('txt-settings')}></i>
                  </div>
                )
              } else {
                return <span>{value}</span>
              }
            }
          }
        })

        this.setState({
          syslog: tempSyslog,
          dataFields: tempFields
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
 /**
   * Get and set SSH account list data
   * @method
   */
  getSshAccountList = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/log/netproxy/sshaccount`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        this.setState({
          sshData: data.rows
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle SSH dialog on/off
   * @method
   */
  toggleSshDialog = () => {
    this.setState({
      showSshAccount: !this.state.showSshAccount
    });

    this.handleCloseMenu();
  }
  /**
   * Open delete name modal dialog
   * @method
   * @param {string} id - account ID
   * @param {string} account - selected account name
   */
  openDeleteSshAccount = (id, account) => {
    PopupDialog.prompt({
      title: t('txt-deleteAccount'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{t('txt-delete-msg')}: {account}?</span>
        </div>
      ),
      act: (confirmed, data) => {
        if (confirmed) {
          this.deleteSshAccount(id);
        }
      }
    });
  }
  /**
   * Handle delete SSH account confirm
   * @method
   * @param {string} id - selected account ID
   */
  deleteSshAccount = (id) => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/log/netproxy/sshaccount?id=${id}`,
      type: 'DELETE'
    })
    .then(data => {
      this.getSshAccountList();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display list of SSH accounts
   * @method
   * @returns HTML DOM
   */
  displaySshAccount = () => {
    const {sshDataFieldArr, sshData} = this.state;

    let dataFields = {};
    sshDataFieldArr.forEach(tempData => {
      dataFields[tempData] = {
        hide: tempData === 'id' ? true : false,
        label: tempData === 'account' ? t('txt-account') : '',
        sortable: false,
        formatter: (value, allValue) => {
          if (tempData === 'option') {
            return (
              <div>
                <i className='c-link fg fg-trashcan' onClick={this.openDeleteSshAccount.bind(this, allValue.id, allValue.account)} title={t('txt-delete')} />
              </div>
            )
          } else {
            return <span>{value}</span>
          }
        }
      };
    })

    return (
      <div>
        <i className='c-link fg fg-add' onClick={this.openAddSshAccount} title={a('txt-add-account')}></i>
        <div className='table-data'>
          <DataTable
            fields={dataFields}
            data={sshData} />
        </div>
      </div>
    )
  }
  /**
   * Open Add SSH account
   * @method
   */
  openAddSshAccount = () => {
    this.setState({
      showAddSshAccount: true
    });
  }
  /**
   * Show SSH account dialog
   * @method
   * @returns ModalDialog component
   */
  showSshAccountDialog = () => {
    const actions = {
      cancel: {text: t('txt-close'), handler: this.toggleSshDialog}
    };

    return (
      <ModalDialog
        id='showSshAccountDialog'
        className='modal-dialog'
        title={a('txt-addSshAccount')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displaySshAccount()}
      </ModalDialog>
    )
  }
  /**
   * Handle SSH account name input value change
   * @method
   * @param {string} event - event object
   */
  handleDataChange = (event) => {
    this.setState({
      sshAccountName: event.target.value
    });
  }
  /**
   * Display add SSH account content
   * @method
   * @returns TextField component
   */
  displayAddSshAccount = () => {
    const {sshAccountName, formValidation} = this.state;

    return (
      <TextField
        name='sshAccountName'
        label={t('txt-plsEnterName')}
        variant='outlined'
        fullWidth
        size='small'
        required
        error={!formValidation.sshAccountName.valid}
        helperText={formValidation.sshAccountName.valid ? '' : t('txt-required')}
        value={sshAccountName}
        onChange={this.handleDataChange} />
    )
  }
  /**
   * Display add SSH acount dialog
   * @method
   * @returns ModalDialog component
   */
  addSshAccountDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeAddSshAccount},
      confirm: {text: t('txt-confirm'), handler: this.confirmAddSshAccount}
    };

    return (
      <ModalDialog
        id='addSshAccountDialog'
        className='modal-dialog'
        title={a('txt-add-account')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayAddSshAccount()}
      </ModalDialog>
    )
  }
  /**
   * Handle add SSH account modal confirm
   * @method
   */
  confirmAddSshAccount = () => {
    const {baseUrl} = this.context;
    const {sshAccountName, formValidation} = this.state;
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (sshAccountName) {
      tempFormValidation.sshAccountName.valid = true;
    } else {
      tempFormValidation.sshAccountName.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    this.ah.one({
      url: `${baseUrl}/api/log/netproxy/sshaccount?account=${sshAccountName}`,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.setState({
          sshAccountName: '',
          showAddSshAccount: false
        });

        this.getSshAccountList();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Close add SSH account dialog
   * @method
   */
  closeAddSshAccount = () => {
    this.setState({
      sshAccountName: '',
      showAddSshAccount: false,
      formValidation: _.cloneDeep(FORM_VALIDATION)
    });
  }
  /**
   * Display list for pattern name
   * @method
   * @param {object} val - pattern data
   * @param {number} i - index of pattern name array
   * @returns HTML DOM
   */
  displayPatternName = (val, i) => {
    return <span key={i} className='item'>{val.patternName}</span>
  }
  /**
   * Reset config value to initial value
   * @method
   */
  resetConfigValue = () => {
    this.setState({
      syslogPatternConfig: _.cloneDeep(INIT_CONFIG),
      activePatternName: INIT_PATTERN_NAME
    });
  }
  /**
   * Toggle different content
   * @method
   * @param {string} activeContent - page type ('syslogData', 'hostInfo' or 'editSyslog')
   * @param {string} type - edit syslog type (edit' or 'save')
   */
  toggleContent = (activeContent, type) => {
    const editSyslogType = type === 'save' ? '' : type;

    if (type) {
      this.setState({
        editSyslogType
      });

      if (type === 'save') {
        this.getSyslogData();
      }
    }

    if (activeContent === 'syslogData') { //Reset config data
      this.resetConfigValue();

      this.setState({
        formValidation: _.cloneDeep(FORM_VALIDATION)
      });
    }

    this.setState({
      activeContent
    });
  }
  /**
   * Display delete host content
   * @method
   * @param {object} value - host data
   * @returns HTML DOM
   */
  getDeleteHostContent = (value) => {
    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {value.netProxyHostName}?</span>
      </div>
    )
  }
  /**
   * Display delete host modal dialog
   * @method
   * @param {object} value - host data
   */
  openDeleteHostModal = (value) => {
    PopupDialog.prompt({
      title: t('syslogFields.txt-deleteHost'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteHostContent(value),
      act: (confirmed, data) => {
        if (confirmed) {
          this.deleteHostIP(value);
        }
      }
    });
  }
  /**
   * Handle delete host IP
   * @method
   * @param {object} value - host data
   */
  deleteHostIP = (value) => {
    const {baseUrl} = this.context;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/log/netproxy/deletehost?id=${value.netProxyHostId}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getSyslogData();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display main syslog host info
   * @method
   * @param {object} val - syslog data
   * @param {number} i - index of the syslog data
   * @returns HTML DOM
   */
  displayHostInfo = (val, i) => {
    const {syslog, dataFields} = this.state;
    const fullHostName = val.netProxyHostName;
    let hostName = val.netProxyHostName;
    let status = {
      notify: {},
      netproxy: {}
    };

    if (val.netProxyNotify) {
      status.notify.title = t('txt-statusOn');
    } else {
      status.notify.title = t('txt-statusOff');
    }

    if (val.netProxyStatus.toLowerCase() === 'active') {
      status.netproxy.color = '#22ac38';
      status.netproxy.title = t('txt-online');
    } else if (val.netProxyStatus.toLowerCase() === 'inactive') {
      status.netproxy.color = '#d10d25';
      status.netproxy.title = t('txt-offline');

      if (val.inactive.length > 0) {
        status.netproxy.errorText = val.inactive.join(', ');
      }
    }

    if (fullHostName.length > 10) {
      hostName = fullHostName.substr(0, 9) + '...';
    }

    return (
      <div key={i} className='host-info'>
        <header>
          <div className='title'>{t('syslogFields.txt-hostIP')}: {val.netProxyIp}</div>
          <div className='name'>{t('txt-name')}: <span title={fullHostName}>{hostName}</span></div>
          <span className='status'>{t('txt-notifyStatus')}: {status.notify.title}</span>
          <span className='status'>NetProxy {t('txt-status')}: <i className='fg fg-recode' style={{color: status.netproxy.color}} title={status.netproxy.title} /></span>
          <span className='status'>NetProxy {t('syslogFields.txt-lastUpdate')}: {helper.getFormattedDate(val.updatetime, 'local')}</span>
          {val.netProxyStatus === 'INACTIVE' &&
            <i className='fg fg-trashcan host' onClick={this.openDeleteHostModal.bind(this, val)} title={t('txt-delete')}></i>
          }
          <i className='fg fg-edit host' onClick={this.toggleHostEdit.bind(this, val)} title={t('txt-edit')}></i>
        </header>
        <div className='content-header-btns'>
        </div>
        <div className='host-content'>
          {status.netproxy.errorText &&
            <span className='error-text'><i className='fg fg-alert-1'></i>NetProxy: {status.netproxy.errorText}</span>
          }
          <DataTable
            className='main-table syslog-config'
            fields={dataFields}
            data={val.configs}
            defaultSort={syslog.sort} />
        </div>
      </div>
    )
  }
  /**
   * Get and set syslog grok data
   * @method
   * @param {number} i - index of the syslogPatternConfig pattern list
   */
  getSyslogGrok = (i) => {
    const {baseUrl} = this.context;
    const {syslogPatternConfig} = this.state;
    const requestData = {
      input: syslogPatternConfig.patternSetting[i].input,
      pattern: syslogPatternConfig.patternSetting[i].pattern
    };

    this.ah.one({
      url: `${baseUrl}/api/log/grok`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempSyslogPatternConfig = {...syslogPatternConfig};
        tempSyslogPatternConfig.patternSetting[i].property = data;
        tempSyslogPatternConfig.patternSetting[i].rawOptions = _.map(data, (value, key) => {
          return {
            value: key,
            text: key
          };
        });

        this.setState({
          syslogPatternConfig: tempSyslogPatternConfig
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Open add/edit syslog dialog
   * @method
   * @param {object} allValue - syslog data
   */
  openSyslogV2 = (allValue) => {
    const {baseUrl} = this.context;

    if (allValue.patternSetting.length > 0) {
      this.setState({
        activePatternName: allValue.patternSetting[0].patternName
      });
    }

    this.ah.one({ //Edit existing syslog
      url: `${baseUrl}/api/v2/log/config?id=${allValue.id}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let syslogPatternConfig = {...data};
        syslogPatternConfig.type = 'formatSettings';

        _.forEach(data.patternSetting, (val, i) => {
          syslogPatternConfig.patternSetting[i].rawOptions = _.map(val.property, (val, key) => {
            return {
              value: key,
              text: key
            };
          });
        })

        this.setState({
          syslogPatternConfig
        }, () => {
          this.toggleContent('editSyslog', 'edit');
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display delete config content
   * @method
   * @param {object} allValue - config data
   * @returns HTML DOM
   */
  getDeleteConfigContent = (allValue) => {
    this.setState({
      currentConfigData: allValue
    });

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {allValue.name}?</span>
      </div>
    )
  }
  /**
   * Display delete config modal dialog
   * @method
   * @param {object} allValue - config data
   */
  openDeleteConfigModal = (allValue) => {
    PopupDialog.prompt({
      title: t('syslogFields.txt-deleteConfig'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteConfigContent(allValue),
      act: (confirmed, data) => {
        if (confirmed) {
          this.deleteConfig();
        }
      }
    });
  }
  /**
   * Handle delete config
   * @method
   */
  deleteConfig = () => {
    const {baseUrl} = this.context;
    const {currentConfigData} = this.state;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/log/netproxy/config?port=${currentConfigData.port}&hostIp=${currentConfigData.loghostIp}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getSyslogData();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set chart interval buttons
   * @method
   */
  setChartInterval = () => {
    const {datetime} = this.state;
    const dateTime = {
      from: moment(datetime.from),
      to: moment(datetime.to)
    };
    const day = dateTime.to.diff(dateTime.from, 'days');
    let chartIntervalList = [];
    let chartIntervalValue = '';

    if (day < 1) {
      chartIntervalList = ['1h'];
      chartIntervalValue = '1h';
    } else if (day >= 1 && day <= 7) {
      chartIntervalList = ['1h', '1d'];
      chartIntervalValue = '1h';
    } else if (day > 7 && day <= 28) {
      chartIntervalList = ['1d', '1w'];
      chartIntervalValue = '1d';
    } else if (day > 28) {
      chartIntervalList = ['1d', '1w'];
      chartIntervalValue = '1w';
    }

    chartIntervalList = _.map(chartIntervalList, val => {
      return <ToggleButton id={'chartInterval' + val} value={val}>{t('time-interval.txt-' + val)}</ToggleButton>
    });

    this.setState({
      chartIntervalList,
      chartIntervalValue
    }, () => {
      this.getTimeline();
    });
  }
  /**
   * Handle restart logstash
   * @method
   */
  restartLogstash = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/maintain/service/logstash`,
      type: 'GET'
    })
    .then(data => {
      if (data && data === 'success') {
        helper.showPopupMsg(t('syslogFields.txt-logStashRestarted'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Open syslog events chart dialog
   * @method
   * @param {string} type - syslog type
   * @param {object} allValue - syslog data
   */
  openTimeline = (type, allValue) => {
    this.setState({
      openTimeline: true,
      activeTimeline: type,
      activeConfigId: allValue.id,
      activeConfigName: allValue.name
    }, () => {
      this.setChartInterval();
    });
  }
  /**
   * Construct URL and redirect to events page
   * @method
   * @param {object} allValue - syslog data
   */
  redirectSyslog = (allValue) => {
    const {baseUrl, contextRoot, language} = this.context;
    const url = `${baseUrl}${contextRoot}/events/syslog?configSource=${allValue.name}&loghostIp=${allValue.loghostIp}&lng=${language}`;
    window.open(url, '_blank');
  }
  /**
   * Open edit hosts dialog
   * @method
   * @param {string} type - edit type ('add' or 'edit')
   * @param {object} allValue - syslog data
   */
  openEditHostsV1 = (type, allValue) => {
    let tempEditHosts = {...this.state.editHosts};

    if (type === 'add') {
      tempEditHosts.host = '';
      tempEditHosts.name = '';
    } else if (type === 'edit') {
      tempEditHosts.host = allValue.host;
      tempEditHosts.name = allValue.name;
    }

    this.setState({
      openEditHosts: true,
      editHostsType: type,
      editHosts: tempEditHosts
    });
  }
  /**
   * Handle syslog edit input value change
   * @method
   * @param {number} [i] - index of the config pattern list
   * @param {string} type - input type ('form' or 'type')
   * @param {string | object} event - event object
   */
  handleConfigChange = (i, type, event) => {
    const value = event.target ? event.target.value : event;
    const field = type === 'form' ? event.target.name : type;
    let tempSyslogPatternConfig = {...this.state.syslogPatternConfig};

    if (typeof i === 'number') {
      tempSyslogPatternConfig.patternSetting[i][type] = value;
    } else {
      tempSyslogPatternConfig[field] = value;
    }

    this.setState({
      syslogPatternConfig: tempSyslogPatternConfig
    });
  }
  /**
   * Handle syslog edit notify change
   * @method
   */
  handleConfigNotifyChange = () => {
    let tempSyslogPatternConfig = {...this.state.syslogPatternConfig};
    tempSyslogPatternConfig.notify = !tempSyslogPatternConfig.notify;

    this.setState({
      syslogPatternConfig: tempSyslogPatternConfig
    });
  }
  /**
   * Get and set the latest event sample data
   * @method
   * @param {number} i - index of the syslogPatternConfig pattern list
   * @param {string} configId - config ID
   */
  getLatestInput = (i, configId) => {
    const {baseUrl} = this.context;

    if (!configId) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/log/event/sample?configId=${configId}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempSyslogPatternConfig = {...this.state.syslogPatternConfig};
        tempSyslogPatternConfig.patternSetting[i].input = data;

        this.setState({
          syslogPatternConfig: tempSyslogPatternConfig
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle add/remove for the relationship box
   * @method
   * @param {number} i - index of the syslogPatternConfig pattern list
   * @param {array} val - relationship list array
   */
  handleRelationshipChange = (i, val) => {
    let tempSyslogPatternConfig = {...this.state.syslogPatternConfig};
    tempSyslogPatternConfig.patternSetting[i].relationships = val;

    this.setState({
      syslogPatternConfig: tempSyslogPatternConfig
    });
  }
  /**
   * Handle syslog edit confirm
   * @method
   */
  confirmSyslogSave = () => {
    const {baseUrl} = this.context;
    const {syslogPatternConfig} = this.state;
    const url = `${baseUrl}/api/v3/log/config`;
    let validate = true;

    _.forEach(syslogPatternConfig.patternSetting, val => { //Check input and pattern for each pattern
      if (!val.input || !val.pattern) {
        validate = false;
        return false;
      }

      _.forEach(val.relationships, val2 => { //Validate relationships data
        if (val2.name || val2.srcNode || val2.dstNode) {
          if (!val2.name) {
            validate = false;
            return false;
          }
          if (!val2.srcNode) {
            validate = false;
            return false;
          }
          if (!val2.dstNode) {
            validate = false;
            return false;
          }
        }
      })
    })

    if (!validate) {
      helper.showPopupMsg(t('txt-checkRequiredFieldType'), t('txt-error'));
      return;
    }

    let requestType = 'POST';
    let requestData = {
      loghostIp: syslogPatternConfig.loghostIp,
      name: syslogPatternConfig.name,
      port: Number(syslogPatternConfig.port),
      format: syslogPatternConfig.format,
      notify: syslogPatternConfig.notify
    };

    requestData.patternSetting = _.map(syslogPatternConfig.patternSetting, val => {
      return {
        patternName: val.patternName,
        input: val.input,
        pattern: val.pattern,
        relationships: JSON.stringify(val.relationships)
      };
    });

    if (syslogPatternConfig.id) { //Update existing pattern
      requestType = 'PATCH';
      requestData.id = syslogPatternConfig.id;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: requestType,
      contentType: 'text/plain'
    })
    .then(data => {
      this.toggleContent('syslogData', 'save');
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set timeline events data
   * @method
   */
  getTimeline = () => {
    const {baseUrl} = this.context;
    const {activeTimeline, activeConfigId, chartIntervalValue, datetime} = this.state;
    const startDttm = moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const endDttm = moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const configId = activeTimeline === 'configId' ? activeConfigId : '';
    let uri = '';

    if (moment(datetime.from).isAfter()) {
      helper.showPopupMsg(t('edge-management.txt-threatDateError'), t('txt-error'));
      return;
    }

    if (configId) {
      uri += `&configId=${configId}`;
    }

    this.ah.one({
      url: `${baseUrl}/api/log/event/_event_source_agg?startDttm=${startDttm}&endDttm=${endDttm}&interval=${chartIntervalValue}${uri}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const hostsArr = _.map(data.hosts, (key, value) => {
          return {
            ip: value,
            events: key
          };
        });

        const eventsData = {
          hosts: hostsArr,
          hostOverTime: data.hostOverTime
        };

        this.setState({
          clickTimeline: true,
          eventsData
        });     
      } else {
        this.setState({
          eventsData: {}
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Show tooltip info when mouseover the chart
   * @method
   * @param {object} eventInfo - MouseoverEvents
   * @param {array.<object>} data - chart data
   * @returns HTML DOM
   */
  onTooltip = (eventInfo, data) => {
    return (
      <section>
        <span>{t('txt-ipAddress')}: {data[0].IP}<br /></span>
        <span>{t('txt-time')}: {moment(data[0].time).format('YYYY/MM/DD HH:mm:ss')}<br /></span>
        <span>{t('txt-count')}: {helper.numberWithCommas(data[0].count)}</span>
      </section>
    )
  }
  /**
   * Set new datetime
   * @method
   * @param {string} type - form type ('timeline' or 'exportCharts')
   * @param {string} type - date type ('from' or 'to')
   * @param {object} newDatetime - new datetime object
   */
  handleDateChange = (form, type, newDatetime) => {
    if (form === 'timeline') {
      let tempDatetime = {...this.state.datetime};
      tempDatetime[type] = newDatetime;

      this.setState({
        datetime: tempDatetime
      });
    } else if (form === 'exportCharts') {
      let tempDatetimeExport = {...this.state.datetimeExport};
      tempDatetimeExport[type] = newDatetime;

      this.setState({
        datetimeExport: tempDatetimeExport
      });
    }
  }
  /**
   * Handle chart export type change
   * @method
   * @param {object} event - event object
   */
  handleChartExportTypeChange = (event) => {
    const chartExportType = event.target.value;
    let datetimeExport = {};

    if (chartExportType === 'securityLog') {
      datetimeExport = {
        from: helper.getStartDate('day'),
        to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
      };
    } else if (chartExportType === 'syslog') {
      datetimeExport = {
        from: moment().local().startOf('day').format('YYYY-MM-DD'),
        to: moment().local().format('YYYY-MM-DD')
      };
    }

    this.setState({
      chartExportType,
      datetimeExport
    });
  }
  /**
   * Handle chart interval change for Config Syslog
   * @method
   * @param {object} event - event object
   * @param {string} type - interval type ('1h', '1d' or '1w')
   */
  handleIntervalChange = (event, type) => {
    if (!type) {
      return;
    }

    this.setState({
      chartIntervalValue: type
    }, () => {
      this.getTimeline();
    });
  }
  /**
   * Display Events timeline content
   * @method
   * @returns HTML DOM
   */
  displayEventsTimeline = () => {
    const {locale} = this.context;
    const {
      activeTimeline,
      activeConfigName,
      clickTimeline,
      chartIntervalList,
      chartIntervalValue,
      datetime,
      eventsData
    } = this.state;
    let type = '';

    if (activeTimeline === 'configId') {
      type = activeConfigName;
    } else if (activeTimeline === 'overall') {
      type = 'overall';
    }

    const dataArr = _.map(eventsData.hostOverTime, val => {
      return {
        time: val.time,
        count: val.count,
        IP: val.IP
      };
    });

    const chartAttributes = {
      data: dataArr,
      dataCfg: {
        x: 'time',
        y: 'count',
        splitSeries: 'IP'
      },
      xAxis: {
        type: 'datetime'
      },
      tooltip: {
        formatter: this.onTooltip
      }
    };
    let showTimeline = false;
    let showTable = false;

    if (!_.isEmpty(eventsData.hostOverTime)) {
      showTimeline = true;
    }

    if (!_.isEmpty(eventsData.hosts)) {
      showTable = true;
    }

    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <div>
        <div className='interval-section'>
          <ToggleButtonGroup
            id='chartIntervalBtn'
            className='chart-btn'
            value={chartIntervalValue}
            exclusive
            onChange={this.handleIntervalChange}>
            {chartIntervalList}
          </ToggleButtonGroup>
        </div>
        <div className='calendar-section'>
          <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
            <KeyboardDateTimePicker
              className='date-time-picker'
              inputVariant='outlined'
              variant='inline'
              format='YYYY-MM-DD HH:mm'
              invalidDateMessage={t('txt-invalidDateMessage')}
              maxDateMessage={t('txt-maxDateMessage')}
              minDateMessage={t('txt-minDateMessage')}
              ampm={false}
              value={datetime.from}
              onChange={this.handleDateChange.bind(this, 'timeline', 'from')} />
            <div className='between'>~</div>
            <KeyboardDateTimePicker
              className='date-time-picker'
              inputVariant='outlined'
              variant='inline'
              format='YYYY-MM-DD HH:mm'
              invalidDateMessage={t('txt-invalidDateMessage')}
              maxDateMessage={t('txt-maxDateMessage')}
              minDateMessage={t('txt-minDateMessage')}
              ampm={false}
              value={datetime.to}
              onChange={this.handleDateChange.bind(this, 'timeline', 'to')} />
          </MuiPickersUtilsProvider>
          <Button variant='contained' color='primary' onClick={this.setChartInterval}>{t('txt-search')}</Button>
          </div>
        <div className='chart-section'>
          {showTimeline &&
            <LineChart
              className='chart fixed'
              {...chartAttributes} />
          }
          {clickTimeline && !showTimeline &&
            <div className='msg'>{t('syslogFields.txt-timelineUnavailable')}</div>
          }
        </div>
        <div className='table-section'>
          {showTable &&
            <DataTable
              className='main-table'
              data={eventsData.hosts}
              fields={{
                ip: { label: f('alertFields.srcIp'), sortable: true },
                events: { label: t('txt-size'), sortable: true }
              }}
              defaultSort={{
                field: 'ip',
                desc: true
              }} />
          }
        </div>
      </div>
    )
  }
  /**
   * Display Events timeline modal dialog
   * @method
   * @returns ModalDialog component
   */
  modalTimeline = () => {
    const {activeTimeline, activeConfigName} = this.state;
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeTimeline}
    };
    let title = '';

    if (activeTimeline === 'configId') {
      title = activeConfigName + t('syslogFields.txt-eventDist');
    } else if (activeTimeline === 'overall') {
      title = t('syslogFields.txt-overallDist');
    }

    return (
      <ModalDialog
        id='viewEventsTimeline'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displayEventsTimeline()}    
      </ModalDialog>
    )
  }
  /**
   * Toggle export charts on/off
   * @method
   */
  toggleExportCharts = () => {
    const {baseUrl, session} = this.context;
    const {openExportCharts, exportCharts} = this.state;

    if (openExportCharts) {
      this.setState({
        openExportCharts: false,
        chartExportType: 'securityLog',
        datetimeExport: {
          from: helper.getStartDate('day'),
          to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
        }
      });
    } else {
      this.ah.one({
        url: `${baseUrl}/api/log/config/exportItem`,
        type: 'GET'
      })
      .then(data => {
        if (data) {
          const netProxyData = {
            list: data.netProxyList,
            configs: data.configs
          };
          const exportChartsIpList = _.map(data.netProxyList, (val, i) => {
            return <MenuItem key={i} value={val.netProxyIp}>{val.netProxyIp}</MenuItem>
          });
          let netProxyLookUp = {};

          _.forEach(data.netProxyList, val => {
            netProxyLookUp[val.netProxyIp] = val.netProxyName
          })

          this.setState({
            openExportCharts: true,
            netProxyData,
            netProxyLookUp,
            exportChartsIpList
          });
        }
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })

      this.handleCloseChartsMenu();
    }

    this.setState({
      exportCharts: [{
        hostIp: '',
        hostName: '',
        configList: []
      }]
    });
  }
  /**
   * Handle add/remove the export charts box
   * @method
   * @param {array.<object>} data - export charts list array
   */
  handleExportChartsChange = (data) => {
    const exportCharts = _.map(data, val => {
      return {
        ...val,
        hostName: this.state.netProxyLookUp[val.hostIp]
      }
    });

    this.setState({
      exportCharts
    });
  }
  /**
   * Display export charts content
   * @method
   * @returns HTML DOM
   */
  displayExportCharts = () => {
    const {locale} = this.context;
    const {chartExportType, datetimeExport, netProxyData, exportChartsIpList, exportCharts} = this.state;
    const data = {
      netProxyData,
      exportChartsIpList
    };
    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <div>
        <div className='form-group normal'>
          <RadioGroup
            id='chartExportType'
            className='radio-group'
            value={chartExportType}
            onChange={this.handleChartExportTypeChange}>
            <FormControlLabel
              value='securityLog'
              control={
                <Radio
                  id='chartExportSecurityLog'
                  className='radio-ui'
                  color='primary' />
              }
              label={t('syslogFields.txt-securityLog')} />
            <FormControlLabel
              value='syslog'
              control={
                <Radio
                  id='chartExportSyslog'
                  className='radio-ui'
                  color='primary' />
              }
              label={t('syslogFields.txt-syslog')} />
          </RadioGroup>
        </div>  
        <div className='calendar-section'>
          {chartExportType === 'securityLog' &&
            <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
              <KeyboardDateTimePicker
                className='date-time-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD HH:mm'
                invalidDateMessage={t('txt-invalidDateMessage')}
                maxDateMessage={t('txt-maxDateMessage')}
                minDateMessage={t('txt-minDateMessage')}
                ampm={false}
                value={datetimeExport.from}
                onChange={this.handleDateChange.bind(this, 'exportCharts', 'from')} />
              <div className='between'>~</div>
              <KeyboardDateTimePicker
                className='date-time-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD HH:mm'
                invalidDateMessage={t('txt-invalidDateMessage')}
                maxDateMessage={t('txt-maxDateMessage')}
                minDateMessage={t('txt-minDateMessage')}
                ampm={false}
                value={datetimeExport.to}
                onChange={this.handleDateChange.bind(this, 'exportCharts', 'to')} />
            </MuiPickersUtilsProvider>
          }
          {chartExportType === 'syslog' &&
            <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
              <KeyboardDatePicker
                className='date-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD'
                invalidDateMessage={t('txt-invalidDateMessage')}
                maxDateMessage={t('txt-maxDateMessage')}
                minDateMessage={t('txt-minDateMessage')}
                value={datetimeExport.from}
                onChange={this.handleDateChange.bind(this, 'exportCharts', 'from')} />
              <div className='between'>~</div>
              <KeyboardDatePicker
                className='date-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD'
                invalidDateMessage={t('txt-invalidDateMessage')}
                maxDateMessage={t('txt-maxDateMessage')}
                minDateMessage={t('txt-minDateMessage')}
                value={datetimeExport.to}
                onChange={this.handleDateChange.bind(this, 'exportCharts', 'to')} />
            </MuiPickersUtilsProvider>
          }
        </div>
        <div className='host-section'>
          <MultiInput
            id='exportChartsMultiInputs'
            base={ExportCharts}
            defaultItemValue={{
              hostIp: '',
              hostName: '',
              configList: []
            }}
            value={exportCharts}
            props={data}
            onChange={this.handleExportChartsChange} />
        </div>
      </div>
    )
  }
  /**
   * Display export charts dialog
   * @method
   * @returns ModalDialog component
   */
  showExportChartsDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleExportCharts},
      confirm: {text: t('txt-export'), handler: this.confirmExportCharts}
    };

    return (
      <ModalDialog
        id='exprotChartsDialog'
        className='modal-dialog'
        title={t('syslogFields.txt-exportSyslogCharts')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayExportCharts()}    
      </ModalDialog>
    )
  }
  /**
   * Handle export charts confirm
   * @method
   */
  confirmExportCharts = () => {
    const {baseUrl, session} = this.context;
    const {chartExportType, datetimeExport, exportCharts} = this.state;
    const timezone = momentTimezone.tz(momentTimezone.tz.guess()); //Get local timezone object
    const utc_offset = timezone._offset / 60; //Convert minute to hour
    let startDttm = '';
    let endDttm = '';
    let totalConfigList = [];

    _.forEach(exportCharts, val => {
      Object.keys(val.configList).map(val2 => {
        if (val.configList[val2] && totalConfigList.indexOf(val2) < 0) {
          totalConfigList.push(val2);
        }
      });
    })

    let requestData = {
      accountId: session.accountId,
      configIds: totalConfigList
    };

    if (chartExportType === 'securityLog') {
      startDttm = moment(datetimeExport.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      endDttm = moment(datetimeExport.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      requestData.type = ['exportLogTrendStatistics'];
      requestData.timeZone = utc_offset;
    } else if (chartExportType === 'syslog') {
      startDttm = moment(datetimeExport.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      endDttm = moment(datetimeExport.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      requestData.type = ['exportRawDataStatistics'];
    }

    requestData.timestamp = [startDttm, endDttm];

    if (startDttm && endDttm) {
      if (moment(endDttm).isBefore(moment(startDttm))) {
        helper.showPopupMsg(t('txt-timeRangeError'), t('txt-error'));
        return;
      }
    }

    this.ah.one({
      url: `${baseUrl}/api/taskService`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-requestSent'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.toggleExportCharts();
  }
  /**
   * Toggle export schedule list on/off
   * @method
   * @param {string} type - export type ('securityLog' or 'syslog')
   */
  toggleExportScheduleList = (type) => {
    this.setState({
      exportType: type,
      popOverAnchor: {top: 83, right: 10}
    }, () => {
      this.getTaskService('firstLoad');
    });

    this.handleCloseChartsMenu();
  }
  /**
   * Get list of task service
   * @method
   * @param {string} options - option for 'firstLoad'
   */
  getTaskService = (options) => {
    const {exportType, taskServiceList} = this.state;
    const {baseUrl} = this.context;
    const datetime = {
      from: moment(helper.getSubstractDate(7, 'day', moment().utc())).format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    let type = '';
    let fromItem = 0;

    if (options !== 'firstLoad') {
      fromItem = taskServiceList.pageSize - 1; //index starts from zero

      if (taskServiceList.scrollCount > 0) {
        fromItem = taskServiceList.scrollCount + taskServiceList.pageSize;
      }
    }

    if (exportType === 'securityLog') {
      type = 'exportLogTrendStatistics';
    } else if (exportType === 'syslog') {
      type = 'exportRawDataStatistics';
    }

    this.ah.one({
      url: `${baseUrl}/api/taskService/list?source=SCP&type=${type}&createStartDttm=${datetime.from}&from=${fromItem}&size=${taskServiceList.pageSize}`,
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
   * Toggle host edit dialog on/off
   * @method
   * @param {object} [val] - host info
   */
  toggleHostEdit = (val) => {
    this.setState({
      openEditHost: !this.state.openEditHost
    }, () => {
      if (val && val.netProxyHostId) {
        this.setState({
          activeHostInfo: {
            id: val.netProxyHostId,
            ip: val.netProxyIp
          },
          newHostName: val.netProxyHostName,
          hostNotifyStatus: val.netProxyNotify
        });
      }
    });
  }
  /**
   * Handle edit host name input value change
   * @method
   * @param {object} event - event object
   */
  handleEditHostNameChange = (event) => {
    this.setState({
      newHostName:  event.target.value
    });
  }
  /**
   * Toggle notifiy status switch
   * @method
   */
  handleNotifyStatusChange = () => {
    this.setState({
      hostNotifyStatus: !this.state.hostNotifyStatus
    });
  }
  /**
   * Display edit host content
   * @method
   * @returns HTML DOM
   */
  displayEditHost = () => {
    const {newHostName, hostNotifyStatus} = this.state;

    return (
      <React.Fragment>
        <div className='group'>
          <TextField
            name='name'
            label={t('syslogFields.txt-hostName')}
            variant='outlined'
            fullWidth
            size='small'
            value={newHostName}
            onChange={this.handleEditHostNameChange} />
        </div>
        <div className='group'>
          <FormLabel className='notify'>{t('txt-notifyStatus')}</FormLabel>
          <FormControlLabel
            className='switch-control'
            control={
              <Switch
                checked={hostNotifyStatus}
                onChange={this.handleNotifyStatusChange}
                color='primary' />
            }
            label={t('txt-switch')} />
        </div>
      </React.Fragment>
    )
  }
  /**
   * Display edit host dialog
   * @method
   * @returns ModalDialog component
   */
  showEditHostDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleHostEdit},
      confirm: {text: t('txt-confirm'), handler: this.confirmEditHost}
    };

    return (
      <ModalDialog
        id='configEditHost'
        className='modal-dialog'
        title={t('syslogFields.txt-editHostInfo')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displayEditHost()}    
      </ModalDialog>
    )
  }
  /**
   * Handle edit host confirm
   * @method
   */
  confirmEditHost = () => {
    const {baseUrl} = this.context;
    const {activeHostInfo, newHostName, hostNotifyStatus} = this.state;
    const url = `${baseUrl}/api/log/netproxy/updatehost`;
    const requestData = {
      ...activeHostInfo,
      hostName: newHostName,
      notify: hostNotifyStatus
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'PATCH',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.getSyslogData();
        this.toggleHostEdit();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle pattern edit name dialog on/off
   * @method
   * @param {string} [type] - edit type ('new')
   */
  toggleEditPatternName = (type) => {
    const {openEditPatternName} = this.state;

    if (openEditPatternName) {
      this.setState({
        activePatternIndex: '',
        newPatternName: ''
      });
    };

    this.setState({
      openEditPatternName: !openEditPatternName,
      info: '',
      editPatternType: type || 'edit'
    });
  }
  /**
   * Handle Pattern name input value change
   * @method
   * @param {object} event - event object
   */
  handleEditPatternNameChange = (event) => {
    this.setState({
      newPatternName: event.target.value
    });
  }
  /**
   * Display Pattern name edit content
   * @method
   * @returns HTML DOM
   */
  displayEditPatternName = () => {
    return (
      <div className='parent'>
        <TextField
          id='syslogHostIP'
          name='loghostIp'
          label={t('syslogFields.txt-patternName')}
          variant='outlined'
          fullWidth
          size='small'
          value={this.state.newPatternName}
          onChange={this.handleEditPatternNameChange} />
      </div>
    )
  }
  /**
   * Display Pattern name edit dialog
   * @method
   * @returns ModalDialog component
   */
  modalEditPatternName = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleEditPatternName},
      confirm: {text: t('txt-confirm'), handler: this.confirmEditPatternName}
    };
    const title = this.state.editPatternType === 'new' ? t('syslogFields.txt-addPattern') : t('syslogFields.txt-editName');

    return (
      <ModalDialog
        id='editPatternName'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        info={this.state.info}
        closeAction='cancel'>
        {this.displayEditPatternName()}    
      </ModalDialog>
    )
  }
  /**
   * Handle Pattern edit name confirm
   * @method
   */
  confirmEditPatternName = () => {
    const {syslogPatternConfig, activePatternIndex, newPatternName, editPatternType} = this.state;
    let tempSyslogPatternConfig = _.cloneDeep(syslogPatternConfig);
    let newPatternNameList = [];

    if (!newPatternName) {
      this.setState({
        info: t('txt-checkRequiredFieldType')
      });
      return;
    }

    if (editPatternType === 'new') { //For adding new pattern
      tempSyslogPatternConfig.type = 'formatSettings';
      tempSyslogPatternConfig.patternSetting.push({
        input: DEFAULT_INPUT,
        pattern: DEFAULT_PATTERN,
        patternName: newPatternName,
        property: {},
        relationships: [
          {name: '', srcNode: '', dstNode: '', conditions:[]}
        ]
      });

      _.forEach(syslogPatternConfig.patternSetting, (val, i) => {
        newPatternNameList.push(val.patternName);
      })

      newPatternNameList.push(newPatternName);
    } else if (editPatternType === 'edit') { //For editing existing pattern
      _.forEach(syslogPatternConfig.patternSetting, (val, i) => {
        if (i === activePatternIndex) {
          tempSyslogPatternConfig.patternSetting[i].patternName = newPatternName;
          newPatternNameList.push(newPatternName);
        } else {
          newPatternNameList.push(val.patternName);
        }
      })
    }

    if (_.uniq(newPatternNameList).length === newPatternNameList.length) { //Check duplicated pattern name
      this.setState({
        syslogPatternConfig: tempSyslogPatternConfig,
        activePatternName: newPatternName,
        info: ''
      });

      this.toggleEditPatternName();
    } else { //Pattern name is duplicated
      this.setState({
        info: t('txt-duplicatedName')
      });
    }
  }
  /**
   * Close syslog events chart dialog
   * @method
   */
  closeTimeline = () => {
    this.setState({
      openTimeline: false,
      clickTimeline: false,
      activeTimeline: '',
      activeConfigId: '',
      activeConfigName: '',
      datetime: {
        from: helper.getStartDate('day'),
        to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
      },
      eventsData: {}
    });
  }
  /**
   * Open new tab for Inventory page
   * @method
   * @param {object} allValue - Host data
   */
  redirectIp = (allValue) => {
    const {baseUrl, contextRoot, language} = this.context;
    const url = `${baseUrl}${contextRoot}/configuration/topology/inventory?ip=${allValue.host}&type=edit&hostName=${allValue.name}&lng=${language}`;

    if (IP_PATTERN.test(allValue.host)) { //Check IP format
      window.open(url, '_blank');
    }
  }
  /**
   * Get Hosts info by config ID
   * @method
   * @param {string} id - config ID
   */
  getHostsInfoById = (id) => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/v2/log/config?id=${id}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const {hostsFieldsArr, hosts} = this.state;
        let tempHosts = {...hosts};
        let hostsDataArr = [];

        _.forEach(data.hostname, (val, key) => {
          hostsDataArr.push({
            id: data.id,
            host: key,
            name: val
          });
        })

        tempHosts.dataContent = hostsDataArr;

        let tempFields = {};
        hostsFieldsArr.forEach(tempData => {
          tempFields[tempData] = {
            hide: tempData === 'id' ? true : false,
            label: tempData === '_menu' ? '' : t(`syslogFields.${tempData}`),
            sortable: tempData === '_menu' ? null : true,
            formatter: (value, allValue, i) => {
              if (tempData === '_menu') {
                return (
                  <div className='table-menu menu active'>
                    <i className='fg fg-edit' onClick={this.openEditHostsV1.bind(this, 'edit', allValue)} title={t('txt-edit')}></i>
                    <i className={cx('fg fg-setting', {'not-allowed': !IP_PATTERN.test(allValue.host)})} onClick={this.redirectIp.bind(this, allValue)} title={t('txt-settings')}></i>
                    <i className='fg fg-trashcan' onClick={this.openDeleteMenu.bind(this, allValue)} title={t('txt-delete')}></i>
                  </div>
                )
              } else {
                return <span>{value}</span>
              }
            }
          }
        })

        this.setState({
          hosts: tempHosts,
          hostsFields: tempFields,
          activeHost: data
        }, () => {
          this.toggleContent('hostInfo');
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle edit hosts input value change
   * @method
   * @param {object} event - event object
   */
  handleEditHostsChange = (event) => {
    let tempEditHosts = {...this.state.editHosts};
    tempEditHosts[event.target.name] = event.target.value.trim();

    this.setState({
      editHosts: tempEditHosts
    });
  }
  /**
   * Display edit hosts content
   * @method
   * @returns HTML DOM
   */
  displayEditHosts = () => {
    const {editHostsType, editHosts, formValidation} = this.state;

    return (
      <div className='parent'>
        <div className='group'>
          <TextField
            name='host'
            label={t('txt-host')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!formValidation.editHostsHost.valid}
            helperText={formValidation.editHostsHost.valid ? '' : t('txt-required')}
            value={editHosts.host}
            onChange={this.handleEditHostsChange}
            disabled={editHostsType === 'edit'} />
        </div>
        <div className='group'>
          <TextField
            name='name'
            label={t('syslogFields.name')}
            variant='outlined'
            fullWidth
            size='small'
            value={editHosts.name}
            onChange={this.handleEditHostsChange} />
        </div>
      </div>
    )
  }
  /**
   * Display edit hosts modal dialog
   * @method
   * @returns ModalDialog component
   */
  modalEditHosts = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeEditHosts},
      confirm: {text: t('txt-confirm'), handler: this.confirmEditHosts}
    }
    const title = t('syslogFields.txt-editHosts');

    return (
      <ModalDialog
        id='editHostDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayEditHosts()}
      </ModalDialog>
    )
  }
  /**
   * Handle edit hosts confirm
   * @method
   */
  confirmEditHosts = () => {
    const {baseUrl} = this.context;
    const {editHosts, activeHost, formValidation} = this.state;
    const url = `${baseUrl}/api/v1/log/config/hosts`;
    const requestData = {
      id: activeHost.id,
      hostip: editHosts.host,
      hostname: editHosts.name
    };
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (editHosts.host) {
      tempFormValidation.editHostsHost.valid = true;
      tempFormValidation.editHostsHost.msg = '';
    } else {
      tempFormValidation.editHostsHost.valid = false;
      tempFormValidation.editHostsHost.msg = t('txt-required');
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'PATCH',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.getHostsInfoById(activeHost.id);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
    this.closeEditHosts();
  }
  /**
   * Close edit hosts dialog
   * @method
   */
  closeEditHosts = () => {
    this.setState({
      openEditHosts: false,
      formValidation: _.cloneDeep(FORM_VALIDATION)
    });
  }
  /**
   * Display delete Host content
   * @method
   * @param {object} allValue - Host data
   * @returns HTML DOM
   */
  displayDeleteHostContent = (allValue) => {
    this.setState({
      currentHostData: allValue
    });

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {allValue.host}?</span>
      </div>
    )
  }
  /**
   * Show Delete Host IP dialog
   * @method
   * @param {object} allValue - Host data
   */
  openDeleteMenu = (allValue) => {
    PopupDialog.prompt({
      title: t('syslogFields.txt-deleteHost'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.displayDeleteHostContent(allValue),
      act: (confirmed, data) => {
        if (confirmed) {
          this.deleteHost();
        }
      }
    });
  }
  /**
   * Handle delete Host confirm
   * @method
   */
  deleteHost = () => {
    const {baseUrl} = this.context;
    const {activeHost, currentHostData} = this.state;
    const url = `${baseUrl}/api/log/config/hosts`;
    const requestData = {
      id: currentHostData.id,
      hosts: currentHostData.host
    }

    if (!currentHostData.id) {
      return;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'DELETE',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.getHostsInfoById(activeHost.id);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle filter input value change
   * @method
   * @param {string} event - event object
   */
  handleSearchChange = (event) => {
    let tempSyslogSearch = {...this.state.syslogSearch};
    tempSyslogSearch[event.target.name] = event.target.value;

    this.setState({
      syslogSearch: tempSyslogSearch
    });
  }
  /**
   * Toggle filter content on/off
   * @method
   */
  toggleFilter = () => {
    this.setState({
      openFilter: !this.state.openFilter
    });
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      syslogSearch: _.cloneDeep(SYSLOG_SEARCH)
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {syslogSearch, openFilter} = this.state;

    return (
      <div className={cx('main-filter', {'active': openFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <TextField
              id='syslogName'
              name='name'
              label={t('syslogFields.name')}
              variant='outlined'
              fullWidth
              size='small'
              value={syslogSearch.name}
              onChange={this.handleSearchChange} />
          </div>
          <div className='group'>
            <TextField
              id='syslogLogHostIP'
              name='loghostip'
              label={t('syslogFields.txt-hostIP')}
              variant='outlined'
              fullWidth
              size='small'
              value={syslogSearch.loghostip}
              onChange={this.handleSearchChange} />
          </div>
          <div className='group'>
            <TextField
              id='syslogPort'
              name='port'
              type='number'
              label={t('syslogFields.port')}
              variant='outlined'
              fullWidth
              size='small'
              value={syslogSearch.port}
              onChange={this.handleSearchChange} />
          </div>
          <div className='group'>
            <TextField
              id='syslogNetProxyStatus'
              name='isactive'
              select
              label={t('syslogFields.txt-netProxyStatus')}
              variant='outlined'
              fullWidth
              size='small'
              value={syslogSearch.isactive}
              onChange={this.handleSearchChange}>
              <MenuItem value='all'>{t('txt-all')}</MenuItem>
              <MenuItem value={true}>{t('txt-online')}</MenuItem>
              <MenuItem value={false}>{t('txt-offline')}</MenuItem>
            </TextField>
          </div>
          <div className='group'>
            <TextField
              id='syslogNetProxyName'
              name='netproxyname'
              label={t('syslogFields.txt-netProxyName')}
              variant='outlined'
              fullWidth
              size='small'
              value={syslogSearch.netproxyname}
              onChange={this.handleSearchChange} />
          </div>
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.getSyslogData}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /**
   * Toggle (show/hide) the left menu
   * @method
   */
  toggleLeftNav = () => {
    this.setState({
      showPatternLeftNav: !this.state.showPatternLeftNav
    });
  }
  /**
   * Display Syslog Config content
   * @method
   * @param {object} val - content of the syslogPatternConfig
   * @param {number} i - index of the syslogPatternConfig pattern list
   * @returns SyslogConfig component
   */
  getSyslogConfig = (val, i) => {
    const {showPatternLeftNav, configRelationships, syslogPatternConfig, activePatternName} = this.state;

    if (val.patternName === activePatternName) {
      return (
        <SyslogConfig
          key={val.patternName + i}
          config={syslogPatternConfig}
          index={i}
          data={{
            relationships: configRelationships,
            rawOptions: syslogPatternConfig.patternSetting[i].rawOptions,
            showPatternLeftNav
          }}
          handleConfigChange={this.handleConfigChange.bind(this, i)}
          getLatestInput={this.getLatestInput.bind(this, i)}
          getSyslogGrok={this.getSyslogGrok.bind(this, i)}
          handleRelationshipChange={this.handleRelationshipChange.bind(this, i)} />
      )
    }
  }
  /**
   * Handle active pattern change
   * @method
   * @param {number} i - index of the syslogPatternConfig pattern list
   * @param {string} activePatternName - active pattern name
   */
  handleActivePatternChange = (i , activePatternName) => {
    let tempSyslogPatternConfig = {...this.state.syslogPatternConfig};
    tempSyslogPatternConfig.type = 'formatSettings';

    this.setState({
      syslogPatternConfig: tempSyslogPatternConfig,
      activePatternName
    });
  }
  /**
   * Handle pattern item mouse over
   * @method
   * @param {string} activePatternMouse - active pattern mouse over name
   */
  handlePatternMouseOver = (activePatternMouse) => {
    this.setState({
      activePatternMouse
    });
  }
  /**
   * Handle open menu
   * @method
   * @param {object} val - active mouse over pattern data
   * @param {number} i - index of the syslogPatternConfig pattern list
   * @param {object} event - event object
   */
  handleOpenMenu = (val, i, event) => {
    let tempCurrentPattern = {...this.state.currentPattern};
    tempCurrentPattern.index = i;
    tempCurrentPattern.data = val;

    this.setState({
      contextAnchor: event.currentTarget,
      currentPattern: tempCurrentPattern
    });
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null,
      currentPattern: {
        index: '',
        data: {}
      }
    });
  }
  /**
   * handle edit/delete Pattern name
   * @method
   * @param {string} type - action type ('edit' or 'delete')
   */
  handlePatternAction = (type) => {
    const {currentPattern} = this.state;

    if (type === 'edit') {
      this.setState({
        activePatternIndex: currentPattern.index,
        newPatternName: currentPattern.data.patternName
      }, () => {
        this.toggleEditPatternName();
      });
    } else if (type === 'delete') {
      let tempSyslogPatternConfig = {...this.state.syslogPatternConfig};
      let activePatternName = '';
      tempSyslogPatternConfig.patternSetting.splice(currentPattern.index, 1);
      activePatternName = tempSyslogPatternConfig.patternSetting[tempSyslogPatternConfig.patternSetting.length - 1].patternName;

      this.setState({
        syslogPatternConfig: tempSyslogPatternConfig,
        activePatternName
      });
    }

    this.handleCloseMenu();
  }
  /**
   * Display Syslog Config content
   * @method
   * @param {object} val - content of the syslogPatternConfig
   * @param {number} i - index of the syslogPatternConfig pattern list
   * @returns HTML DOM
   */
  getPatternItem = (val, i) => {
    const {syslogPatternConfig, activePatternName, activePatternMouse, contextAnchor} = this.state;
    const patternName = val.patternName;
    let formattedPatternName = '';

    if (patternName.length > 9) {
      formattedPatternName = patternName.substr(0, 9) + '...';
    }

    return (
      <div className='item'>
        <div key={i} className='item frame' onClick={this.handleActivePatternChange.bind(this, i, patternName)} onMouseOver={this.handlePatternMouseOver.bind(this, patternName)} onMouseOut={this.handlePatternMouseOver.bind(this, '')}>
          <span title={patternName}>{formattedPatternName || patternName}</span>
          <i className='fg fg-more show' onClick={this.handleOpenMenu.bind(this, val, i)}></i>
          <i className={`c-link fg fg-arrow-${activePatternName === patternName ? 'top' : 'bottom'}`}></i>
        </div>

        <Menu
          anchorEl={contextAnchor}
          keepMounted
          open={Boolean(contextAnchor)}
          onClose={this.handleCloseMenu}>
          <MenuItem onClick={this.handlePatternAction.bind(this, 'edit')}>{t('syslogFields.txt-editName')}</MenuItem>
          {syslogPatternConfig.patternSetting.length > 1 &&
            <MenuItem onClick={this.handlePatternAction.bind(this, 'delete')}>{t('txt-delete')}</MenuItem>
          }
        </Menu>

        {activePatternName === patternName &&
          <div className='item'>
            <div className='subframe' onClick={this.handleConfigChange.bind(this, '', 'type', 'formatSettings')}>
              <span className={syslogPatternConfig.type === 'formatSettings' ? 'true' : ''}>{t('syslogFields.txt-formatSettings')}</span>
            </div>
            <div className='subframe' onClick={this.handleConfigChange.bind(this, '', 'type', 'relationship')}>
              <span className={syslogPatternConfig.type === 'relationship' ? 'true' : ''}>{t('syslogFields.txt-relationship')}</span>
            </div>
          </div>
        }
      </div>
    )
  }
  /**
   * Handle open charts menu
   * @method
   * @param {object} event - event object
   */
  handleOpenChartsMenu = (event) => {
    this.setState({
      contextAnchorCharts: event.currentTarget
    });
  }
  /**
   * Handle close charts menu
   * @method
   */
  handleCloseChartsMenu = () => {
    this.setState({
      contextAnchorCharts: null
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {
      openFilter,
      activeContent,
      syslog,
      hostsFields,
      hosts,
      editSyslogType,
      showPatternLeftNav,
      openExportCharts,
      openEditHost,
      openTimeline,
      openEditHosts,
      openEditPatternName,
      showSshAccount,
      showAddSshAccount,
      contextAnchorCharts,
      activeHost,
      exportType,
      popOverAnchor,
      taskServiceList,
      syslogPatternConfig,
      contextAnchor
    } = this.state;
    let exportTitle = '';

    if (exportType === 'securityLog') {
      exportTitle = t('txt-exportSecurityLog');
    } else if (exportType === 'syslog') {
      exportTitle = t('txt-exportSyslog');
    }

    return (
      <div>
        {openExportCharts &&
          this.showExportChartsDialog()
        }

        {openEditHost &&
          this.showEditHostDialog()
        }

        {openTimeline &&
          this.modalTimeline()
        }

        {openEditHosts &&
          this.modalEditHosts()
        }

        {openEditPatternName &&
          this.modalEditPatternName()
        }

        {showSshAccount &&
          this.showSshAccountDialog()
        }

        {showAddSshAccount &&
          this.addSshAccountDialog()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            {activeContent === 'syslogData' &&
              <div>
                <Button variant='outlined' color='primary' onClick={this.restartLogstash} title={t('syslogFields.txt-restartLogstash')}><UpdateIcon className='fg-update' fontSize='large' /></Button>
                <Button variant='outlined' color='primary' onClick={this.openTimeline.bind(this, 'overall')} title={t('syslogFields.txt-overallDist')}><i className='fg fg-chart-kpi'></i></Button>
                <Button variant='outlined' color='primary' onClick={this.toggleSshDialog} title={a('txt-addSshAccount')}><i className='fg fg-add'></i></Button>
                <Button variant='outlined' color='primary' className={cx({'active': openFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></Button>
                <Button variant='outlined' color='primary' className='last' onClick={this.handleOpenChartsMenu}><i className='fg fg-data-download-2'></i></Button>
              </div>
            }

            <Menu
              anchorEl={contextAnchorCharts}
              keepMounted
              open={Boolean(contextAnchorCharts)}
              onClose={this.handleCloseChartsMenu}>
              <MenuItem onClick={this.toggleExportCharts}>{t('syslogFields.txt-exportSyslogCharts')}</MenuItem>
              <MenuItem onClick={this.toggleExportScheduleList.bind(this, 'securityLog')}>{t('txt-exportSecurityLog')}</MenuItem>
              <MenuItem onClick={this.toggleExportScheduleList.bind(this, 'syslog')}>{t('txt-exportSyslog')}</MenuItem>
            </Menu>
          </div>

          <ExportCSV
            title={exportTitle}
            anchorPosition={popOverAnchor}
            taskServiceList={taskServiceList}
            handlePopoverClose={this.handlePopoverClose}
            getTaskService={this.getTaskService} />
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          {activeContent === 'syslogData' &&
            <div className='parent-content'>
              {this.renderFilter()}

              <div className='main-content'>
                <header className='main-header'>{t('txt-syslogManage')}</header>
                <div className='config-syslog mui-table-content' style={{height: '78vh', overflow: 'auto'}}>
                  {syslog.dataContent && syslog.dataContent.length > 0 &&
                    syslog.dataContent.map(this.displayHostInfo)
                  }
                  {syslog.dataContent && syslog.dataContent.length === 0 &&
                    <div className='no-result'>{t('txt-notFound')}</div>
                  }
                </div>
              </div>
            </div>
          }

          {activeContent === 'editSyslog' &&
            <div className='parent-content'>
              <div className='main-content basic-form'>
                <header className='main-header'>{t('syslogFields.txt-editSyslogInfo')}</header>
                <div className='edit-syslog-config'>
                  <div className='form-group normal'>
                    <header>{t('syslogFields.txt-syslogInfo')}</header>
                    <div className='group'>
                      <TextField
                        id='syslogHostIP'
                        name='loghostIp'
                        label={t('syslogFields.ip')}
                        variant='outlined'
                        fullWidth
                        size='small'
                        value={syslogPatternConfig.loghostIp}
                        disabled />
                    </div>
                    <div className='group'>
                      <TextField
                        id='syslogName'
                        name='name'
                        label={t('syslogFields.name')}
                        variant='outlined'
                        fullWidth
                        size='small'
                        value={syslogPatternConfig.name}
                        disabled />
                    </div>
                    <div className='group'>
                      <TextField
                        id='syslogReceivedPort'
                        name='port'
                        type='number'
                        label={t('syslogFields.port')}
                        variant='outlined'
                        fullWidth
                        size='small'
                        value={syslogPatternConfig.port}
                        disabled />
                    </div>
                    <div className='group'>
                      <TextField
                        id='syslogDataFormat'
                        name='format'
                        label={t('syslogFields.format')}
                        variant='outlined'
                        fullWidth
                        size='small'
                        value={syslogPatternConfig.format}
                        disabled />
                    </div>
                  </div>

                  <div className='notify-status'>
                    <FormLabel className='notify'>{t('txt-notifyStatus')}</FormLabel>
                    <FormControlLabel
                      className='switch-control'
                      control={
                        <Switch
                          checked={syslogPatternConfig.notify}
                          onChange={this.handleConfigNotifyChange}
                          color='primary' />
                      }
                      label={t('txt-switch')} />
                  </div>

                  <div className='pattern-content'>
                    <header>{t('syslogFields.matchPattern')}</header>
                    <Button variant='outlined' color='primary' className='standard add-pattern' onClick={this.toggleEditPatternName.bind(this, 'new')}>{t('syslogFields.txt-addPattern')}</Button>

                    <div className='syslog-config'>
                      <div className={cx('left-nav', {'collapse': !showPatternLeftNav})}>
                        {syslogPatternConfig.patternSetting.map(this.getPatternItem)}
                        <div className='expand-collapse' onClick={this.toggleLeftNav}><i className={`fg fg-arrow-${showPatternLeftNav ? 'left' : 'right'}`}></i></div>
                      </div>
                      {syslogPatternConfig.patternSetting.map(this.getSyslogConfig)}
                    </div>
                  </div>
                  <footer>
                    <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, 'syslogData', '')}>{t('txt-cancel')}</Button>
                    <Button variant='contained' color='primary' onClick={this.confirmSyslogSave}>{t('txt-save')}</Button>
                  </footer>
                </div>
              </div>
            </div>
          }

          {activeContent === 'hostInfo' &&
            <div className='parent-content'>
              <div className='main-content'>
                <header className='main-header'>{t('syslogFields.txt-syslogHost')}</header>

                <div className='content-header-btns'>
                  <Button variant='outlined' color='primary' className='standard btn list' onClick={this.toggleContent.bind(this, 'syslogData', '')}>{t('txt-back')}</Button>
                </div>

                <div className='config-syslog'>
                  <div className='host-list'>
                    <header>{t('syslogFields.txt-syslogInfo')}</header>
                    <table className='c-table main-table info'>
                      <tbody>
                        <tr>
                          <td style={{width: '30%'}}>IP</td>
                          <td>{activeHost.loghostIp}</td>
                        </tr>
                        <tr>
                          <td style={{width: '30%'}}>{t('txt-name')}</td>
                          <td>{activeHost.name}</td>
                        </tr>
                      </tbody>
                    </table>

                    <header>{t('syslogFields.txt-syslogHostList')}</header>
                    <Button variant='outlined' color='primary' className='standard btn add-host' onClick={this.openEditHostsV1.bind(this, 'add')}>{t('syslogFields.txt-addHost')}</Button>
                    <DataTable
                      className='main-table'
                      fields={hostsFields}
                      data={hosts.dataContent} />
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}

Syslog.contextType = BaseDataContext;

Syslog.propTypes = {
};

export default Syslog;