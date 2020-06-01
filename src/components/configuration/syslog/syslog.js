import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import ButtonGroup from 'react-ui/build/src/components/button-group'
import DataTable from 'react-ui/build/src/components/table'
import DateRange from 'react-ui/build/src/components/date-range'
import Input from 'react-ui/build/src/components/input'
import LineChart from 'react-chart/build/src/components/line'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Textarea from 'react-ui/build/src/components/textarea'

import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import helper from '../../common/helper'
import Relationships from './relationships'
import TableContent from '../../common/table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

const DEFAULT_SYSLOG = ['syslog', 'eventlog'];
const DEFAULT_INPUT = 'streaming log sample';
const DEFAULT_PATTERN = '%{GREEDYDATA}';
const INIT_CONFIG = {
  type: 'formatSettings',
  id: '',
  hostIP: '',
  name: '',
  port: '',
  format: '',
  input: DEFAULT_INPUT,
  pattern: DEFAULT_PATTERN,
  property: null,
  relationships: [
    {name: '', srcNode: '', dstNode: '', conditions:[]}
  ]
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
      dataFieldsArr: ['name', 'port', 'format', 'avgLogSizeB', 'property', '_menu'],
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
      openTimeline: false,
      openEditHosts: false,
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
      config: INIT_CONFIG,
      configRelationships: [],
      rawOptions: [],
      activeHost: '',
      currentHostData: ''
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

    if (search.loghostip || search.port) {
      urlParams += '?';

      if (search.loghostip) {
        urlParams += `&loghostip=${search.loghostip}`;
      }

      if (search.port) {
        urlParams += `&port=${search.port}`;
      }
    }

    this.ah.one({
      url: `${baseUrl}/api/v1/log/config${urlParams}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempSyslog = {...syslog};
        let formattedSyslogObj = {};
        let formattedSyslogArr = [];

        _.forEach(data.rows, val => {
          if (formattedSyslogObj[val.loghostIp]) {
            formattedSyslogObj[val.loghostIp].push(val);
          } else {
            formattedSyslogObj[val.loghostIp] = [val];
          }
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
            sortable: (tempData === '_menu' || tempData === 'property') ? null : true,
            formatter: (value, allValue, i) => {
              if (tempData === 'avgLogSizeB') {
                return <span>{value > 0 ? value : 'N/A'}</span>;
              } else if (tempData === 'property') {
                return <div className='flex-item'>{this.displayPropertyV2(value)}</div>
              } else if (tempData === '_menu') {
                return (
                  <div className='table-menu menu active'>
                    <i className={this.getSyslogMenuClass('edit', allValue)} onClick={this.openSyslogV2.bind(this, allValue)} title={t('txt-edit')}></i>
                    <i className={this.getSyslogMenuClass('delete', allValue)} onClick={this.openDeleteSyslogMenu.bind(this, allValue)} title={t('txt-delete')}></i>
                    <i className='fg fg-chart-kpi' onClick={this.openTimeline.bind(this, 'configId', allValue)} title={t('syslogFields.txt-viewEvents')}></i>
                    <i className='fg fg-list' onClick={this.forwardSyslog.bind(this, allValue)} title={t('syslogFields.txt-overallDist')}></i>
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
   * Display list for property table column
   * @method
   * @param {string} value - property data
   */
  displayPropertyV2 = (value) => {
    const propertyList = _.map(value, (val, key) => { //Convert data string to array
      return <span key={key} className='permit'>{key}</span>
    });

    return propertyList;
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
   * Display syslog parsed input data
   * @method
   * @param {string} val - syslog parsed data value
   * @param {string} key - syslog parsed data key
   * @returns HTML DOM
   */
  displayParsedData = (val, key) => {
    if (key != '_Raw') {
      return (
        <div className='group' key={key}>
          <label htmlFor={key}>{key}</label>
          <Input
            id={key}
            value={val}
            onChange={this.handleConfigChange.bind(this, 'format')} />
        </div>
      )
    }
  }
  /**
   * Get and set syslog grok data
   * @method
   */
  getSyslogGrok = () => {
    const {baseUrl} = this.context;
    const {config} = this.state;
    const dataObj = {
      input: config.input,
      pattern: config.pattern
    };

    this.ah.one({
      url: `${baseUrl}/api/log/grok`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        config.property = data;
        let rawOptions = [];

        _.forEach(data, (value, key) => {
          rawOptions.push({
            value: key,
            text: key
          });
        })

        this.setState({
          config,
          rawOptions
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
    let config = {};

    if (type === 'new') {
      config = INIT_CONFIG;
    } else if (type === 'edit-exist') {
      config = {
        hostIP: val.ip
      };
    }

    this.setState({
      config: {
        type: 'formatSettings',
        input: DEFAULT_INPUT,
        pattern: DEFAULT_PATTERN,
        ...config
      }
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
    const {baseUrl} = this.context
    let id = allValue.id;

    if (_.includes(DEFAULT_SYSLOG, allValue.name)) {
      return null;
    }

    if (!id) { //Add new syslog
      this.setState({
        config: INIT_CONFIG
      });
      return;
    }

    this.ah.one({ //Edit existing syslog
      url: `${baseUrl}/api/v1/log/config?id=${id}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const config = {
          type: 'formatSettings',
          id: data.id,
          hostIP: data.loghostIp,
          name: data.name,
          port: data.port,
          format: data.format,
          input: data.input,
          pattern: data.pattern,
          property: data.property,
          relationships: data.relationships
        };
        let rawOptions = [];

        _.forEach(config.property, (value, key) => {
          rawOptions.push({
            value: key,
            text: key
          });
        })

        this.setState({
          config,
          rawOptions
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
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleConfigChange = (type, value) => {
    let tempConfig = {...this.state.config};
    tempConfig[type] = value;

    this.setState({
      config: tempConfig
    });
  }
  /**
   * Get and set the latest event sample data
   * @method
   * @param {string} configId - config ID
   */
  getLatestInput = (configId) => {
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
        let tempConfig = {...this.state.config};
        tempConfig.input = data;

        this.setState({
          config: tempConfig
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display pattern hint
   * @method
   * @returns HTML DOM
   */
  showPatternContent = () => {
    return (
      <table className='c-table pattern'>
        <tbody>
          <tr>
            <td valign='top'>
              <div>Log: </div>
              <div>Pattern: </div>
            </td>
            <td>
              <div>EventReceivedTime:2020-02-18 10:03:33, SourceModuleName:dns3</div>
              <div>EventReceivedTime:&#37;&#123;DATESTAMP:datestamp&#125;, SourceModuleName:&#37;&#123;WORD:word&#125;</div>
            </td>
          </tr>
          <tr>
            <td valign='top'>
              <div>Log: </div>
              <div>Pattern: </div>
            </td>
            <td>
              <div><span>"</span>EventReceivedTime<span>"</span>:<span>"</span>2020-02-18 10:03:33<span>"</span>, <span>"</span>SourceModuleName<span>"</span>:<span>"</span>dns3<span>"</span></div>
              <div><span>&#37;&#123;QUOTEDSTRING&#125;</span>:<span>&#37;&#123;QUOTEDSTRING</span>:datestamp<span>&#125;</span>, <span>&#37;&#123;QUOTEDSTRING&#125;</span>:<span>&#37;&#123;QUOTEDSTRING</span>:word<span>&#125;</span></div>
            </td>
          </tr>
          <tr>
            <td valign='top'>
              <div>Log: </div>
              <div>Pattern: </div>
            </td>
            <td>
              <div><span>\"</span>EventReceivedTime<span>\"</span>:<span>\"</span>2020-02-18 10:03:33<span>\"</span>, <span>\"</span>SourceModuleName<span>\"</span>:<span>\"</span>dns3<span>\"</span></div>
              <div><span>&#37;&#123;NOTSPACE&#125;&#37;&#123;NOTSPACE&#125;</span>EventReceivedTime<span>&#37;&#123;NOTSPACE&#125;&#37;&#123;NOTSPACE&#125;</span>:<span>&#37;&#123;NOTSPACE&#125;&#37;&#123;NOTSPACE&#125;</span>&#37;&#123;DATESTAMP:datestamp&#125;<span>&#37;&#123;NOTSPACE&#125;&#37;&#123;NOTSPACE&#125;</span>, <span>&#37;&#123;NOTSPACE&#125;&#37;&#123;NOTSPACE&#125;</span>SourceModuleName<span>&#37;&#123;NOTSPACE&#125;&#37; &#123;NOTSPACE&#125;</span>:<span>&#37;&#123;NOTSPACE&#125;&#37;&#123;NOTSPACE&#125;</span>&#37;&#123;WORD:word&#125;<span>&#37;&#123;NOTSPACE&#125;&#37;&#123;NOTSPACE&#125;</span></div>
            </td>
          </tr>
          <tr>
            <td valign='top'>
              <div>Log: </div>
              <div>Pattern: </div>
            </td>
            <td>
              <div>"EventReceivedTime":"2020-02-18 10:03:33", "SourceModuleName<span>":</span>"dns3"</div>
              <div>&#37;&#123;GREEDYDATA&#125;SourceModuleName<span>&#37;&#123;DOUBLEQUOTESCOLON&#125;</span>&#37;&#123;QUOTEDSTRING:word&#125;</div>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
  /**
   * Open dialog for pattern hint
   * @method
   */
  showPatternHint = () => {
    PopupDialog.alert({
      id: 'modalWindowSmall',
      title: t('txt-tips'),
      confirmText: t('txt-close'),
      display: this.showPatternContent()
    });
  }
  /**
   * Handle add/remove for the relationship box
   * @method
   * @param {array} val - relationship list array
   */
  handleRelationshipChange = (val) => {
    let tempConfig = {...this.state.config};
    tempConfig.relationships = val;

    this.setState({
      config: tempConfig
    });
  }
  /**
   * Handle syslog edit confirm
   * @method
   */
  confirmSyslog = () => {
    const {baseUrl} = this.context;
    const {config} = this.state;
    const url = `${baseUrl}/api/v1/log/config`;
    const requiredFields = ['hostIP', 'name', 'port', 'input', 'pattern'];
    let valid = true;

    _.forEach(requiredFields, val => {
      if (!config[val]) {
        valid = false;
        return false;
      }
    })

    if (!valid) {
      helper.showPopupMsg(et('fill-required-fields'), t('txt-error'));
      return;
    }

    let requestData = {
      loghostIp: config.hostIP,
      name: config.name,
      port: config.port,
      format: config.format,
      input: config.input,
      pattern: config.pattern,
      relationships: JSON.stringify(config.relationships)
    };
    let requestType = 'POST';

    if (config.id) {
      requestData.id = config.id;
      requestType = 'PATCH';
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
      helper.showPopupMsg(t('edge-management.txt-threatDateErr'), t('txt-error'));
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
            onChange={this.handleDateChange}
            enableTime={true}
            value={datetime}
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
      url: `${baseUrl}/api/v1/log/config?id=${id}`,
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
    const {hostsData} = this.state;
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

    helper.getAjaxData('PATCH', url, requestData)
    .then(data => {
      if (data) {
        this.getHostsInfoById(activeHost.id);
      }
      return null;
    });
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
  getDeleteHostContent = (allValue) => {
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
      display: this.getDeleteHostContent(allValue),
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

    helper.getAjaxData('DELETE', url, requestData)
    .then(data => {
      if (data) {
        this.getHostsInfoById(activeHost.id);
      }
      return null;
    });
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
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {
      openFilter,
      activeContent,
      dataFields,
      syslog,
      hostsFields,
      hosts,
      editSyslogType,
      openTimeline,
      openEditHosts,
      config,
      configRelationships,
      rawOptions,
      activeHost
    } = this.state;
    const data = {
      relationships: configRelationships,
      rawOptions
    };    

    return (
      <div>
        {openTimeline &&
          this.modalTimeline()
        }

        {openEditHosts &&
          this.modalEditHosts()
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
                        validate={{
                          pattern: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
                          patternReadable: 'xxx.xxx.xxx.xxx',
                          t: et
                        }}
                        value={config.hostIP}
                        required={true}
                        onChange={this.handleConfigChange.bind(this, 'hostIP')}
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
                        value={config.name}
                        onChange={this.handleConfigChange.bind(this, 'name')} />
                    </div>
                    <div className='group'>
                      <label htmlFor='syslogReceivedPort'>{t('syslogFields.port')}</label>
                      <Input
                        id='syslogReceivedPort'
                        required={true}
                        validate={{
                          t: et
                        }}
                        value={config.port}
                        onChange={this.handleConfigChange.bind(this, 'port')} />
                    </div>
                    <div className='group'>
                      <label htmlFor='syslogDataFormat'>{t('syslogFields.format')}</label>
                      <Input
                        id='syslogDataFormat'
                        value={config.format}
                        onChange={this.handleConfigChange.bind(this, 'format')} />
                    </div>
                  </div>

                  <ButtonGroup
                    className='group-btn'
                    list={[
                      {value: 'formatSettings', text: t('syslogFields.txt-formatSettings')},
                      {value: 'relationship', text: t('syslogFields.txt-relationship')}
                    ]}
                    value={config.type}
                    onChange={this.handleConfigChange.bind(this, 'type')} />

                  {config.type === 'formatSettings' &&
                    <div className='filters'>
                      <div className='left-syslog'>
                        <div className='form-group normal long full-width syslog-config'>
                          <header>{t('syslogFields.txt-originalData')}</header>
                          <div className='group'>
                            <label htmlFor='syslogInput'>{t('syslogFields.dataSampleInput')}</label>
                            {config.id &&
                              <button onClick={this.getLatestInput.bind(this, config.id)}>{t('syslogFields.txt-getLatest')}</button>
                            }
                            <Textarea
                              id='syslogInput'
                              rows={8}
                              value={config.input}
                              onChange={this.handleConfigChange.bind(this, 'input')} />
                          </div>
                          <div className='group'>
                            <div className='pattern'>
                              <label>{t('syslogFields.matchPattern')}</label><i className='c-link fg fg-help' title={t('txt-tips')} onClick={this.showPatternHint} />
                            </div>
                            <Textarea
                              id='syslogPattern'
                              rows={10}
                              value={config.pattern}
                              onChange={this.handleConfigChange.bind(this, 'pattern')} />
                          </div>
                        </div>
                      </div>
                      <i className='c-link fg fg-forward' title={t('txt-parse')} onClick={this.getSyslogGrok} />
                      <div className='left-syslog'>
                        <div className='form-group normal long full-width syslog-config'>
                          <header>{t('syslogFields.txt-originalData')}</header>
                          <div className='parsed-list'>
                            {_.map(config.property, this.displayParsedData)}
                          </div>
                        </div>
                      </div>
                    </div>
                  }

                  {config.type === 'relationship' &&
                    <MultiInput
                      className='relationships'
                      base={Relationships}
                      value={config.relationships}
                      props={data}
                      onChange={this.handleRelationshipChange} />
                  }
                  <footer>
                    <button className='standard' onClick={this.toggleContent.bind(this, 'syslogData')}>{t('txt-cancel')}</button>
                    <button onClick={this.confirmSyslog}>{t('txt-save')}</button>
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
                  <button className='standard btn list' onClick={this.toggleContent.bind(this, 'syslogData')}>{t('syslogFields.txt-backToList')}</button>
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