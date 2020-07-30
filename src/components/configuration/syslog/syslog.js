import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import ContextMenu from 'react-ui/build/src/components/contextmenu'
import DataTable from 'react-ui/build/src/components/table'
import DateRange from 'react-ui/build/src/components/date-range'
import Input from 'react-ui/build/src/components/input'
import LineChart from 'react-chart/build/src/components/line'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import helper from '../../common/helper'
import SyslogConfig from './syslog-config'
import TableContent from '../../common/table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

const DEFAULT_SYSLOG = ['syslog', 'eventlog'];
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

/**
 * Syslog Management
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to manage the System Syslog
 */
class Syslog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openFilter: false,
      activeContent: 'syslogData', //syslogData, hostInfo, editSyslog
      dataFieldsArr: ['name', 'port', 'format', 'avgLogSizeB', 'patternName', '_menu'],
      dataFields: {},
      syslog: {
        dataContent: [],
        sort: {
          field: 'name',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
      },
      hostsFieldsArr: ['id', 'ip', 'name', '_menu'],
      hostsFields: {}, 
      hosts: {
        dataContent: [],
        sort: {
          field: 'ip',
          desc: false
        }
      },
      search: {
        name: '',
        loghostip: '',
        port: ''
      },
      activeSyslogData: {},
      editSyslogType: '',
      editHostsType: '',
      editHosts: {
        ip: '',
        name: ''
      },
      showPatternLeftNav: true,
      openTimeline: false,
      openEditHosts: false,
      openEditPatternName: false,
      clickTimeline: false,
      activeTimeline: '',
      activeConfigId: '',
      activeConfigName: '',
      datetime: {
        from: helper.getStartDate('day'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
      },
      eventsData: {},
      hostsData: {},
      configRelationships: [],
      syslogPatternConfig: {},
      activeHost: {},
      currentHostData: '',
      activePatternIndex: '',
      activePatternName: INIT_PATTERN_NAME,
      activePatternMouse: '',
      newPatternName: '',
      info: '',
      editPatternType: 'edit'
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors')
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.getRelationship();
    this.getSyslogData();
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
    const {dataFieldsArr, syslog, search} = this.state;
    let urlParams = '';

    if (search.name) {
      urlParams += `&name=${search.name}`;
    }

    if (search.loghostip) {
      urlParams += `&loghostip=${search.loghostip}`;
    }

    if (search.port) {
      urlParams += `&port=${search.port}`;
    }

    this.ah.one({
      url: `${baseUrl}/api/v2/log/config?${urlParams}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempSyslog = {...syslog};
        let formattedSyslogObj = {};
        let formattedSyslogArr = [];

        _.forEach(data.loghostList, val => {
          formattedSyslogObj[val] = [];

          _.forEach(data.rows, val2 => {
            if (val2.loghostIp === val) {
              formattedSyslogObj[val].push(val2);
            }
          })
        })

        _.forEach(formattedSyslogObj, (val, key) => {
          formattedSyslogArr.push({
            ip: key,
            data: val
          })
        })

        tempSyslog.dataContent = formattedSyslogArr;

        let tempFields = {};
        dataFieldsArr.forEach(tempData => {
          tempFields[tempData] = {
            label: tempData === '_menu' ? '' : t(`syslogFields.${tempData}`),
            sortable: tempData === '_menu' ? null : true,
            formatter: (value, allValue, i) => {
              if (tempData === 'avgLogSizeB') {
                return <span>{value > 0 ? value : 'N/A'}</span>;
              } else if (tempData === 'patternName') {
                if (allValue.patternSetting.length > 0) {
                  return <div className='flex-item'>{allValue.patternSetting.map(this.displayPatternName)}</div>
                }
              } else if (tempData === '_menu') {
                return (
                  <div className='table-menu menu active'>
                    <i className={this.getSyslogMenuClass('edit', allValue)} onClick={this.openSyslogV2.bind(this, allValue)} title={t('txt-edit')}></i>
                    <i className={this.getSyslogMenuClass('delete', allValue)} onClick={this.openDeleteSyslogMenu.bind(this, allValue)} title={t('txt-delete')}></i>
                    <i className='fg fg-chart-kpi' onClick={this.openTimeline.bind(this, 'configId', allValue)} title={t('syslogFields.txt-overallDist')}></i>
                    <i className='fg fg-list' onClick={this.forwardSyslog.bind(this, allValue)} title={t('syslogFields.txt-viewEvents')}></i>
                    <i className='fg fg-network' onClick={this.getHostsInfoById.bind(this, allValue.id)} title={t('txt-settings')}></i>
                  </div>
                )
              } else {
                return <span>{value}</span>;
              }
            }
          }
        })

        this.setState({
          syslog: tempSyslog,
          dataFields: tempFields
        }, () => {
          this.getSyslogStatus();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set syslog status
   * @method
   */
  getSyslogStatus = () => {
    const {baseUrl} = this.context;
    const {syslog} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/log/config/status`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempSyslog = {...syslog};
        let formattedSyslogArr = [];

        _.forEach(syslog.dataContent, val => {
          formattedSyslogArr.push({
            ...val,
            status: data[val.ip]
          });
        })

        tempSyslog.dataContent = formattedSyslogArr;

        this.setState({
          syslog: tempSyslog
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get syslog menu class name
   * @method
   * @param {string} type - menu type ('edit' or 'delete')
   * @param {object} allValue - syslog data
   */
  getSyslogMenuClass = (type, allValue) => {
    let className = 'fg ';

    if (type === 'edit') {
      className += 'fg-edit';
    } else if (type === 'delete') {
      className += 'fg-trashcan';
    }

    if (_.includes(DEFAULT_SYSLOG, allValue.name)) {
      className += ' not-allowed';
    }
    return className;
  }
  /**
   * Display list for pattern name
   * @method
   * @param {object} val - pattern data
   * @param {number} i - index of pattern name array
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
   * @param {string} type - edit syslog type ('new', 'edit' or 'save')
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
    }

    this.setState({
      activeContent
    });
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
    let color = '';
    let title = '';
    let errorText = '';

    if (val.status && val.status.logstashStatus.toLowerCase() === 'active') {
      color = '#22ac38';
      title = t('txt-online');
    } else if (val.status && val.status.logstashStatus.toLowerCase() === 'inactive') {
      color = '#d10d25';
      title = t('txt-offline');
      errorText = val.status.inactive.join(', ');
    }

    return (
      <div className='host-info' key={i}>
        <header>{t('syslogFields.txt-hostIP')}: {val.ip}</header>
        <span className='status'>{t('txt-status')}: <i className='fg fg-recode' style={{color}} title={title} /></span>
        <div className='content-header-btns'>
          <button className='standard btn' onClick={this.openNewSyslog.bind(this, 'edit-exist', val)}>{t('syslogFields.txt-addSyslog')}</button>
        </div>
        <div className='host-content'>
          {errorText &&
            <span className='error-text'><i className='fg fg-alert-1'></i>{errorText}</span>
          }
          <DataTable
            className='main-table syslog-config'
            fields={dataFields}
            data={val.data}
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
          }
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
   * Open edit syslog dialog
   * @method
   * @param {string} type - edit type ('new' or 'edit-exist')
   * @param {object} val - syslog data
   */
  openNewSyslog = (type, val) => {
    let syslogPatternConfig = _.cloneDeep(INIT_CONFIG);

    if (type === 'edit-exist') {
      syslogPatternConfig.loghostIp = val.ip;
    }

    this.setState({
      syslogPatternConfig,
      activePatternName: INIT_PATTERN_NAME
    }, () => {
      this.toggleContent('editSyslog', type);
    });
  }
  /**
   * Open add/edit syslog dialog
   * @method
   * @param {object} allValue - syslog data
   */
  openSyslogV2 = (allValue) => {
    const {baseUrl} = this.context;

    if (_.includes(DEFAULT_SYSLOG, allValue.name)) {
      return null;
    }

    if (!allValue.id) { //Add new syslog
      this.resetConfigValue();
      return;
    }

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
            }
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
   * Open delete syslog dialog
   * @method
   * @param {object} allValue - syslog data
   */
  openDeleteSyslogMenu = (allValue) => {
    const eventNme = allValue.name;

    if (_.includes(DEFAULT_SYSLOG, allValue.name)) {
      return null;
    }

    PopupDialog.prompt({
      title: t('syslogFields.txt-deleteSyslog'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{t('txt-delete-msg')}: {eventNme}?</span>
        </div>
      ),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteSyslog(allValue.id);
        }
      }
    });
  }
  /**
   * Handle delete syslog confirm
   * @method
   * @param {string} id - syslog id
   */
  deleteSyslog = (id) => {
    const {baseUrl} = this.context;

    if (!id) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/v1/log/config?id=${id}`,
      type: 'DELETE'
    })
    .then(data => {
      this.getSyslogData();
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
      this.getTimeline();
    });
  }
  /**
   * Construct URL and redirect to events page
   * @method
   * @param {object} allValue - syslog data
   */
  forwardSyslog = (allValue) => {
    const {baseUrl, contextRoot, language} = this.context;
    const url = `${baseUrl}${contextRoot}/events/syslog?configId=${allValue.id}&lng=${language}`;
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
      tempEditHosts.ip = '';
      tempEditHosts.name = '';
    } else if (type === 'edit') {
      tempEditHosts.ip = allValue.ip;
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
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleConfigChange = (i, type, value) => {
    let tempSyslogPatternConfig = {...this.state.syslogPatternConfig};

    if (typeof i === 'number') {
      tempSyslogPatternConfig.patternSetting[i][type] = value;
    } else {
      tempSyslogPatternConfig[type] = value;
    }

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
    const requiredFields = ['loghostIp', 'name', 'port'];
    const url = `${baseUrl}/api/v2/log/config`;
    let valid = true;

    _.forEach(requiredFields, val => { //Check basic Syslog info
      if (!syslogPatternConfig[val]) {
        valid = false;
        return false;
      }
    })

    if (!Number(syslogPatternConfig.port)) { //Port has to be a number type
      valid = false;
    }

    _.forEach(syslogPatternConfig.patternSetting, val => { //Check input and pattern for each pattern
      if (!val.input || !val.pattern) {
        valid = false;
        return false;
      }
    })

    if (!valid) {
      helper.showPopupMsg(t('txt-checkRequiredFieldType'), t('txt-error'));
      return;
    }

    let requestType = 'POST';
    let requestData = {
      loghostIp: syslogPatternConfig.loghostIp,
      name: syslogPatternConfig.name,
      port: syslogPatternConfig.port,
      format: syslogPatternConfig.format
    };

    requestData.patternSetting = _.map(syslogPatternConfig.patternSetting, val => {
      return {
        patternName: val.patternName,
        input: val.input,
        pattern: val.pattern,
        relationships: JSON.stringify(val.relationships)
      }
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
    const {activeTimeline, activeConfigId, datetime} = this.state;
    const startDttm = Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const endDttm = Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const configId = activeTimeline === 'configId' ? activeConfigId : '';
    let uri = '';

    if (Moment(datetime.from).isAfter()) {
      helper.showPopupMsg(t('edge-management.txt-threatDateError'), t('txt-error'));
      return;
    }

    if (configId) {
      uri += `&configId=${configId}`;
    }

    this.ah.one({
      url: `${baseUrl}/api/log/event/_event_source_agg?startDttm=${startDttm}&endDttm=${endDttm}${uri}`,
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
        <span>{data[0].type}<br /></span>
        <span>{t('txt-time')}: {Moment(data[0].time, 'x').utc().format('YYYY/MM/DD HH:mm:ss')}<br /></span>
        <span>{t('txt-count')}: {data[0].count}</span>
      </section>
    )
  }
  /**
   * Set new datetime
   * @method
   * @param {object} datetime - datetime object
   */
  handleDateChange = (datetime) => {
    this.setState({
      datetime
    });
  }
  /**
   * Display Events timeline content
   * @method
   * @returns HTML DOM
   */
  displayEventsTimeline = () => {
    const {locale} = this.context;
    const {activeTimeline, activeConfigName, clickTimeline, datetime, eventsData} = this.state;
    let type = '';

    if (activeTimeline === 'configId') {
      type = activeConfigName;
    } else if (activeTimeline === 'overall') {
      type = 'overall';
    }

    const dataArr = _.map(eventsData.hostOverTime, val => {
      return {
        time: parseInt(Moment(val.time, 'YYYY-MM-DDTHH:mm:ss.SSZ').utc(true).format('x')),
        count: val.count,
        IP: val.IP
      };
    });

    const chartAttributes = {
      data: dataArr,
      onTooltip: this.onTooltip,
      dataCfg: {
        x: 'time',
        y: 'count',
        splitSeries: 'IP'
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%m-%d %H:%M'
        }
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

    return (
      <div>
        <div className='calendar-section'>
          <DateRange
            id='datetime'
            className='daterange'
            enableTime={true}
            value={datetime}
            onChange={this.handleDateChange}
            locale={locale}
            t={et} />
          <button onClick={this.getTimeline}>{t('txt-search')}</button>
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
   * Toggle pattern edit name dialog on/off
   * @method
   * @param {string>} [type] - edit type ('new')
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
   * @param {string} newPatternName - input name
   */
  handleEditPatternNameChange = (newPatternName) => {
    this.setState({
      newPatternName
    });
  }
  /**
   * Display Pattern name edit content
   * @method
   * @returns HTML DOM
   */
  displayEditPatternName = () => {
    return (
      <div>
        <label>{t('syslogFields.txt-patternName')}</label>
        <Input
          required={true}
          validate={{
            t: et
          }}
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
        closeAction='confirm'>
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
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
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
    const url = `${baseUrl}${contextRoot}/configuration/topology/inventory?ip=${allValue.ip}&type=edit&hostName=${allValue.name}&lng=${language}`;
    window.open(url, '_blank');
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
            ip: key,
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
                    <i className='fg fg-setting' onClick={this.redirectIp.bind(this, allValue)} title={t('txt-settings')}></i>
                    <i className='fg fg-trashcan' onClick={this.openDeleteMenu.bind(this, allValue)} title={t('txt-delete')}></i>
                  </div>
                )
              } else {
                return <span>{value}</span>;
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
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleEditHostsChange = (type, value) => {
    let tempEditHosts = {...this.state.editHosts};
    tempEditHosts[type] = value.trim();

    this.setState({
      editHosts: tempEditHosts
    });
  }
  /**
   * Display edit hosts content
   * @method
   */
  displayEditHosts = () => {
    const {editHostsType, editHosts} = this.state;

    return (
      <div className='syslog'>
        <div className='group'>
          <label>{t('syslogFields.ip')}</label>
          <Input
            required={true}
            validate={{
              pattern: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
              patternReadable: 'xxx.xxx.xxx.xxx',
              t: et
            }}
            value={editHosts.ip}
            onChange={this.handleEditHostsChange.bind(this, 'ip')}
            readOnly={editHostsType === 'edit'} />
        </div>
        <div className='group'>
          <label>{t('syslogFields.name')}</label>
          <Input
            value={editHosts.name}
            onChange={this.handleEditHostsChange.bind(this, 'name')} />
        </div>
      </div>
    )
  }
  /**
   * Display edit hosts modal dialog
   * @method
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
        closeAction='confirm'>
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
    const {editHosts, activeHost} = this.state;
    const url = `${baseUrl}/api/v1/log/config/hosts`;
    const requestData = {
      id: activeHost.id,
      hostip: editHosts.ip,
      hostname: editHosts.name
    };

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
      openEditHosts: false
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
        <span>{t('txt-delete-msg')}: {allValue.ip}?</span>
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
      hosts: currentHostData.ip
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
   * @param {string} type - input type
   * @param {object} event - input value
   */
  handleSearchChange = (type, event) => {
    let tempSearch = {...this.state.search};
    tempSearch[type] = event.target.value.trim();

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
      openFilter: !this.state.openFilter
    });
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      search: {
        name: '',
        loghostip: '',
        port: ''
      }
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {search, openFilter} = this.state;

    return (
      <div className={cx('main-filter', {'active': openFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='syslogName'>{t('syslogFields.name')}</label>
            <input
              id='syslogName'
              type='text'
              value={search.name}
              onChange={this.handleSearchChange.bind(this, 'name')} />
          </div>
          <div className='group'>
            <label htmlFor='syslogLogHostIP'>{t('syslogFields.txt-hostIP')}</label>
            <input
              id='syslogLogHostIP'
              type='text'
              value={search.loghostip}
              onChange={this.handleSearchChange.bind(this, 'loghostip')} />
          </div>
          <div className='group'>
            <label htmlFor='syslogPort'>{t('syslogFields.port')}</label>
            <input
              id='syslogPort'
              type='text'
              value={search.port}
              onChange={this.handleSearchChange.bind(this, 'port')} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getSyslogData}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
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
   * Set left menu arrow class name
   * @method
   * @returns {string} - class name
   */
  getArrowClassName = () => {
    return this.state.showPatternLeftNav ? 'fg fg-arrow-left' : 'fg fg-arrow-right';
  }
  /**
   * Display Syslog Config content
   * @method
   * @param {object} val - content of the syslogPatternConfig
   * @param {number} i - index of the syslogPatternConfig pattern list
   * @returns Syslog Config component
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
   * Handle context menu action
   * @method
   * @param {object} val - active mouse over pattern data
   * @param {number} i - index of the syslogPatternConfig pattern list
   */
  handleContextMenu = (val, i, evt) => {
    let menuItems = [
      {
        id: 'editPattern',
        text: t('syslogFields.txt-editName'),
        action: () => this.handlePatternAction('edit', val, i)
      }
    ];

    if (this.state.syslogPatternConfig.patternSetting.length > 1) { //Add Delete Pattern menu
      menuItems.push({
        id: 'deletePattern',
        text: t('txt-delete'),
        action: () => this.handlePatternAction('delete', val, i)
      });
    }

    ContextMenu.open(evt, menuItems, 'patternAction');
    evt.stopPropagation();
  }
  /**
   * handle edit/delete Pattern name
   * @method
   * @param {object} val - active mouse over pattern data
   * @param {number} i - index of the syslogPatternConfig pattern list
   */
  handlePatternAction = (type, val, i) => {
    if (type === 'edit') {
      this.setState({
        activePatternIndex: i,
        newPatternName: val.patternName
      }, () => {
        this.toggleEditPatternName();
      });
    } else if (type === 'delete') {
      let tempSyslogPatternConfig = {...this.state.syslogPatternConfig};
      let activePatternName = '';
      tempSyslogPatternConfig.patternSetting.splice(i, 1);
      activePatternName = tempSyslogPatternConfig.patternSetting[tempSyslogPatternConfig.patternSetting.length - 1].patternName;

      this.setState({
        syslogPatternConfig: tempSyslogPatternConfig,
        activePatternName
      });
    }
  }
  /**
   * Display Syslog Config content
   * @method
   * @param {object} val - content of the syslogPatternConfig
   * @param {number} i - index of the syslogPatternConfig pattern list
   * @returns Syslog Config component
   */
  getPatternItem = (val, i) => {
    const {syslogPatternConfig, activePatternName, activePatternMouse} = this.state;
    const patternName = val.patternName;
    let formattedPatternName = '';

    if (patternName.length > 9) {
      formattedPatternName = patternName.substr(0, 9) + '...';
    }

    return (
      <div className='item'>
        <div key={i} className='item frame' onClick={this.handleActivePatternChange.bind(this, i, patternName)} onMouseOver={this.handlePatternMouseOver.bind(this, patternName)} onMouseOut={this.handlePatternMouseOver.bind(this, '')}>
          <span title={patternName}>{formattedPatternName || patternName}</span>
          <i className={cx('fg fg-more', {'show': activePatternMouse === patternName})} onClick={this.handleContextMenu.bind(this, val, i)}></i>
          <i className={`c-link fg fg-arrow-${activePatternName === patternName ? 'top' : 'bottom'}`}></i>
        </div>

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
      openTimeline,
      openEditHosts,
      openEditPatternName,
      activeHost,
      syslogPatternConfig
    } = this.state;

    return (
      <div>
        {openTimeline &&
          this.modalTimeline()
        }

        {openEditHosts &&
          this.modalEditHosts()
        }

        {openEditPatternName &&
          this.modalEditPatternName()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            {activeContent === 'syslogData' &&
              <div>
                <button onClick={this.openTimeline.bind(this, 'overall')} title={t('syslogFields.txt-overallDist')}><i className='fg fg-chart-kpi'></i></button>
                <button onClick={this.openNewSyslog.bind(this, 'new')} title={t('syslogFields.txt-addSyslog')}><i className='fg fg-add'></i></button>
                <button className={cx('last', {'active': openFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
              </div>
            }
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          {activeContent === 'syslogData' &&
            <div className='parent-content'>
              { this.renderFilter() }

              <div className='main-content'>
                <header className='main-header'>{t('txt-syslogManage')}</header>
                <div className='config-syslog'>
                  {syslog.dataContent.map(this.displayHostInfo)}
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
                      <label htmlFor='syslogHostIP'>{t('syslogFields.txt-hostIP')}</label>
                      <Input
                        id='syslogHostIP'
                        required={true}
                        validate={{
                          pattern: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
                          patternReadable: 'xxx.xxx.xxx.xxx',
                          t: et
                        }}
                        value={syslogPatternConfig.loghostIp}
                        onChange={this.handleConfigChange.bind(this, '', 'loghostIp')}
                        readOnly={editSyslogType === 'edit' || editSyslogType === 'edit-exist'} />
                    </div>
                    <div className='group'>
                      <label htmlFor='syslogName'>{t('syslogFields.name')}</label>
                      <Input
                        id='syslogName'
                        required={true}
                        validate={{
                          t: et
                        }}
                        value={syslogPatternConfig.name}
                        onChange={this.handleConfigChange.bind(this, '', 'name')} />
                    </div>
                    <div className='group'>
                      <label htmlFor='syslogReceivedPort'>{t('syslogFields.port')}</label>
                      <Input
                        id='syslogReceivedPort'
                        type='number'
                        required={true}
                        validate={{
                          t: et
                        }}
                        value={syslogPatternConfig.port}
                        onChange={this.handleConfigChange.bind(this, '', 'port')} />
                    </div>
                    <div className='group'>
                      <label htmlFor='syslogDataFormat'>{t('syslogFields.format')}</label>
                      <Input
                        id='syslogDataFormat'
                        value={syslogPatternConfig.format}
                        onChange={this.handleConfigChange.bind(this, '', 'format')} />
                    </div>
                  </div>

                  <div className='pattern-content'>
                    <header>{t('syslogFields.matchPattern')}</header>
                    <button className='standard add-pattern' onClick={this.toggleEditPatternName.bind(this, 'new')}>{t('syslogFields.txt-addPattern')}</button>

                    <div className='syslog-config'>
                      <div className={cx('left-nav', {'collapse': !showPatternLeftNav})}>
                        {syslogPatternConfig.patternSetting.map(this.getPatternItem)}
                        <div className='expand-collapse' onClick={this.toggleLeftNav}><i className={this.getArrowClassName()}></i></div>
                      </div>
                      {syslogPatternConfig.patternSetting.map(this.getSyslogConfig)}
                    </div>
                  </div>
                  <footer>
                    <button className='standard' onClick={this.toggleContent.bind(this, 'syslogData', '')}>{t('txt-cancel')}</button>
                    <button onClick={this.confirmSyslogSave}>{t('txt-save')}</button>
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
                  <button className='standard btn list' onClick={this.toggleContent.bind(this, 'syslogData', '')}>{t('syslogFields.txt-backToList')}</button>
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
                          <td style={{width: '30%'}}>Config Name</td>
                          <td>{activeHost.name}</td>
                        </tr>
                      </tbody>
                    </table>

                    <header>{t('syslogFields.txt-syslogHostList')}</header>
                    <button className='standard btn add-host' onClick={this.openEditHostsV1.bind(this, 'add')}>{t('syslogFields.txt-addHost')}</button>
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