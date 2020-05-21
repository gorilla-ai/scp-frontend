import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import ButtonGroup from 'react-ui/build/src/components/button-group'
import ContextMenu from 'react-ui/build/src/components/contextmenu'
import DataTable from 'react-ui/build/src/components/table'
import DateRange from 'react-ui/build/src/components/date-range'
import DropDownList from 'react-ui/build/src/components/dropdown'
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

const default_pattern = '%{GREEDYDATA}';
const default_input = 'streaming log sample';

const INIT_CONFIG = {
  type: 'filter',
  id: '',
  name: '',
  port: '',
  format: '',
  input: default_input,
  pattern: default_pattern,
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
      activeContent: 'syslogData', //syslogData, hostInfo
      dataFieldsArr: ['_menu', 'name', 'port', 'format', 'property'],
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
      openFilter: false,
      search: {
        port: '',
        format: ''
      },
      editHostsType: '',
      editHosts: {
        ip: '',
        name: ''
      },
      openSyslog: false,
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
      modalTitle: '',
      config: INIT_CONFIG,
      configRelationships: [],
      rawOptions: [],
      activeHost: '',
      currentHostData: '',
      error: false,
      info: ''
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
    //this.getSyslogData();
    this.getSyslogList(false);
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
   * Disable the delete functionality based on conditions
   * @method
   * @param {string} name - syslog type
   */
  checkDisabled = (name) => {
    return (name === 'syslog' || name === 'eventlog') ? true : false;
  }
  /**
   * Construct and display table context menu
   * @method
   * @param {object} allValue - syslog data
   * @param {object} evt - mouseClick events
   */
  handleRowContextMenu = (allValue, evt) => {
    const menuItems = [
      {
        id: 'edit',
        text: t('txt-edit'),
        action: () => this.openSyslog(allValue.id)
      },
      {
        id: 'delete',
        text: t('txt-delete'),
        action: () => this.modalDelete(allValue),
        disabled: this.checkDisabled(allValue.name)
      },
      {
        id: 'eventDist',
        text: t('syslogFields.txt-eventDist'),
        action: () => this.openTimeline('configId', allValue)
      },
      {
        id: 'events',
        text: t('syslogFields.txt-viewEvents'),
        action: () => this.forwardSyslog(allValue)
      },
      {
        id: 'hosts',
        text: t('syslogFields.txt-editHosts'),
        action: () => this.getHostsInfoById(allValue.id)
      }
    ];

    ContextMenu.open(evt, menuItems, 'configSyslogMenu');
    evt.stopPropagation();
  }
  /**
   * Toggle different content
   * @method
   * @param {string} activeContent - page type ('syslogData' or 'hostInfo')
   */
  toggleContent = (activeContent) => {
    this.setState({
      activeContent
    });
  }
  /**
   * Display list for property table column
   * @method
   * @param {string} value - property data
   */
  displayProperty = (value) => {
    const propertyList = _.map(value, (val, key) => { //Convert data string to array
      return <span key={key} className='permit'>{key}</span>
    });

    return propertyList;
  }
  /**
   * Get and set syslog data
   * @method
   */
  getSyslogData = () => {
    const {baseUrl} = this.context;
    const {dataFieldsArr, syslog} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/log/config`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempSyslog = {...syslog};
        tempSyslog.dataContent = data.rows;

        let tempFields = {};
        dataFieldsArr.forEach(tempData => {
          tempFields[tempData] = {
            label: tempData === '_menu' ? '' : t(`syslogFields.${tempData}`),
            sortable: (tempData === '_menu' || tempData === 'property') ? null : true,
            formatter: (value, allValue, i) => {
              if (tempData === 'property') {
                return <div className='flex-item'>{this.displayProperty(value)}</div>
              } else if (tempData === '_menu') {
                return '';
              } else {
                return <span>{value}</span>;
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
   * Get and set syslog data
   * @method
   * @param {boolean} flag - flog for port and format
   */
  getSyslogList = (flag) => {
    const {baseUrl} = this.context;
    const {dataFieldsArr, syslog, search} = this.state;
    let uri = ''; 

    if (_.isEmpty(syslog)) {
      return;
    } else {
      uri = `?page=${syslog.currentPage}&pageSize=${syslog.pageSize}&sort=${syslog.sort.field}&order=${syslog.sort.desc ? 'desc' : 'asc'}`;
    }

    // by filter
    if (flag) {
      if (search.port) {
        uri += `&port=${search.port}`;
      }

      if (search.format) {
        uri += `&format=${search.format}`;
      }
    }

    this.ah.one({
      url: `${baseUrl}/api/log/config${uri}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempSyslog = {...syslog};
        tempSyslog.dataContent = data.rows;
        tempSyslog.totalCount = data.counts;
        tempSyslog.currentPage = flag ? 1 : syslog.currentPage;

        let tempFields = {};
        dataFieldsArr.forEach(tempData => {
          tempFields[tempData] = {
            label: tempData === '_menu' ? '' : t(`syslogFields.${tempData}`),
            sortable: (tempData === '_menu' || tempData === 'property') ? null : true,
            formatter: (value, allValue, i) => {
              if (tempData === '_menu') {
                return (
                  <div className={cx('table-menu', {'active': value})}>
                    <button onClick={this.handleRowContextMenu.bind(this, allValue)}><i className='fg fg-more'></i></button>
                  </div>
                )
              } else if (tempData === 'property') {
                return <div className='flex-item'>{this.displayProperty(value)}</div>
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
          this.closeSyslog();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle table sort functionality
   * @method
   * @param {object} sort - sort data object
   */
  handleTableSort = (sort) => {
    let tempSyslog = {...this.state.syslog};
    tempSyslog.sort.field = sort.field;
    tempSyslog.sort.desc = sort.desc;

    this.setState({
      syslog: tempSyslog
    }, () => {
      this.getSyslogList();
    });
  }
  /**
   * Handle table row mouse over
   * @method
   * @param {string} index - index of the syslog data
   * @param {object} allValue - syslog data
   * @param {object} evt - MouseoverEvents
   */
  handleRowMouseOver = (index, allValue, evt) => {
    let tempSyslog = {...this.state.syslog};
    tempSyslog['dataContent'] = _.map(tempSyslog['dataContent'], el => {
      return {
        ...el,
        _menu: el.id === allValue.id ? true : false
      };
    });

    this.setState({
      syslog: tempSyslog
    });
  }
  /**
   * Get and set config data
   * @method
   */
  getRaw = () => {
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
   * Handle syslog edit confirm
   * @method
   */
  confirmSyslog = () => {
    const {baseUrl} = this.context;
    const {config} = this.state;
    let valid = true;

    if (!config.port || !config.input || !config.pattern) {
      valid = false;
    }

    _.forEach(config.relationship, el => {
      if (!el.name || !el.srcNode || !el.dstNode) {
        valid = false;
      }
      _.forEach(el.conditions, cond => {
        if (!cond.node) {
          valid = false;
        }
      })
    })

    if (valid) {
      this.setState({
        error: false,
        info: ''
      });
    } else {
      this.setState({
        error: true,
        info: et('fill-required-fields')
      });
      return;
    }

    let dataObj = {
      name: config.name,
      port: config.port,
      format: config.format,
      input: config.input,
      pattern: config.pattern,
      relationships: JSON.stringify(config.relationships)
    };
    let method = 'POST';

    if (config.id) {
      method = 'PATCH';
      dataObj.id = config.id;
    }

    this.ah.one({
      url: `${baseUrl}/api/log/config`,
      data: JSON.stringify(dataObj),
      type: method,
      contentType: 'text/plain'
    })
    .then(data => {
      this.getSyslogList(false);
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
  modalDelete = (allValue) => {
    const eventNme = allValue.name;

    if (eventNme === 'syslog' || eventNme === 'eventlog') {
      return null;
    }

    PopupDialog.prompt({
      title: t('syslogFields.txt-deleteSyslog'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{t('txt-delete-msg')}: {allValue.name}?</span>
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
      url: `${baseUrl}/api/log/config?id=${id}`,
      type: 'DELETE'
    })
    .then(data => {
      this.getSyslogList(false);
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })  
  }
  /**
   * Open add/edit syslog dialog
   * @method
   * @param {string} id - syslog id
   */
  openSyslog = (id) => {
    const {baseUrl} = this.context

    if (!id) { //Add new syslog
      this.setState({
        openSyslog: true,
        config: INIT_CONFIG,
        modalTitle: t('syslogFields.txt-addSyslog')
      });
      return;
    }

    this.ah.one({ //Edit existing syslog
      url: `${baseUrl}/api/log/config?id=${id}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const config = {
          type: 'filter',
          id: data.id,
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
          openSyslog: true,
          rawOptions,
          modalTitle: t('syslogFields.txt-editSyslog')
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Close syslog dialog
   * @method
   */
  closeSyslog = () => {
    this.setState({
      openSyslog: false,
      error: false,
      info: ''
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
  openEditHosts = (type, allValue) => {
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
   * Display content for the Filter tab
   * @method
   * @returns HTML DOM
   */
  renderTabFilter = () => {
    const {config, rawOptions} = this.state;

    return (
      <div className='filters'>
        <div className='left-syslog'>
          <div className='syslog-content'>
            <div className='main'>
              {config.id &&
                <button onClick={this.getLatestInput.bind(this, config.id)}>{t('syslogFields.txt-getLatest')}</button>
              }
              <label>{t('syslogFields.dataSampleInput')}</label>
              <Textarea
                rows={8}
                value={config.input}
                onChange={this.handleConfigChange.bind(this, 'input')} />
              <i className='c-link fg fg-down' />
              <div className='pattern'>
                <label>{t('syslogFields.matchPattern')}</label><i className='c-link fg fg-help' title={t('txt-tips')} onClick={this.showPatternHint} />
              </div>
              <Textarea
                rows={10}
                value={config.pattern}
                onChange={this.handleConfigChange.bind(this, 'pattern')} />
            </div>
            <i className='c-link fg fg-forward' title={t('txt-parse')} onClick={this.getRaw} />
          </div>
        </div>
        <div>
          <label className='property'>{t('syslogFields.dataProperty')}</label>
          <div className='right-syslog scrollY'>
            {
              _.map(config.property, (val, key) => {
                if (key != '_Raw') {
                  return <div key={key}><label>{key}</label><Input value={val} /></div>
                }
              })
            }
          </div>
        </div>
      </div>
    )
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
   * Display contnet for the relationship tab
   * @method
   * @returns MultiInput component
   */
  renderTabRelationship = () => {
    const {config, configRelationships, rawOptions} = this.state;
    const data = {
      relationships: configRelationships,
      rawOptions
    };

    return (
      <MultiInput
        className='relationships'
        base={Relationships}
        value={config.relationships}
        props={data}
        onChange={this.handleRelationshipChange} />
    )
  }
  /**
   * Display syslog content
   * @method
   * @returns HTML DOM
   */
  displaySyslogDialog = () => {
    const {config} = this.state;

    return (
      <div>
        <div className='syslogs'>
          <div className='syslog'>
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
          <div className='syslog'>
            <label htmlFor='syslogPort'>{t('syslogFields.port')}</label>
            <Input
              id='syslogPort'
              required={true}
              validate={{
                t: et
              }}
              value={config.port}
              onChange={this.handleConfigChange.bind(this, 'port')} />
          </div>
          <div className='syslog'>
            <label htmlFor='syslogFormat'>{t('syslogFields.format')}</label>
            <Input
              id='syslogFormat'
              validate={{t: et}}
              value={config.format}
              onChange={this.handleConfigChange.bind(this, 'format')} />
          </div>
        </div>
        <ButtonGroup
          list={[
            {value: 'filter', text: t('syslogFields.filter')},
            {value: 'relationship', text: t('syslogFields.relationship')}
          ]}
          value={config.type}
          onChange={this.handleConfigChange.bind(this, 'type')} />

        {config.type === 'filter' && 
          this.renderTabFilter()
        }

        {config.type === 'relationship' &&
          this.renderTabRelationship()
        }
      </div>
    )
  }
  /**
   * Display syslog modal dialog
   * @method
   * @returns ModalDialog component
   */
  modalSyslog = () => {
    const {error, info, modalTitle} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeSyslog},
      confirm: {text: t('txt-confirm'), handler: this.confirmSyslog}
    };

    return (
      <ModalDialog
        id='syslogModalDialog'
        className='modal-dialog'
        title={modalTitle}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'
        infoClassName={cx({'c-error': error})}
        info={info}>
        {this.displaySyslogDialog()}
      </ModalDialog>
    )
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
   * Get Hosts info by config ID
   * @method
   * @param {string} id - config ID
   */
  getHostsInfoById = (id) => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/log/config?id=${id}`,
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
                    <i className='fg fg-edit' onClick={this.openEditHosts.bind(this, 'edit', allValue)} title={t('txt-edit')}></i>
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
    const url = `${baseUrl}/api/log/config/hosts/u1`;
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
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempSyslog = {...this.state.syslog};
    tempSyslog[type] = value;

    if (type === 'pageSize') {
      tempSyslog.currentPage = 1;
    }

    this.setState({
      syslog: tempSyslog
    }, () => {
      this.getSyslogList();
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
    const search = {
      name: '',
      port: '',
      format: ''
    };

    this.setState({
      search
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
            <label className='first-label'>{t('syslogFields.port')}</label>
            <input
              type='text'
              value={search.port}
              onChange={this.handleSearchChange.bind(this, 'port')} />
          </div>
          <div className='group'>
            <label className='first-label'>{t('syslogFields.format')}</label>
            <input
              type='text'
              value={search.format}
              onChange={this.handleSearchChange.bind(this, 'format')} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getSyslogList.bind(this, true)}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  displayHostInfo = (val, i) => {
    //console.log(val, i)

    return (
      <div className='host-info'>
        <header>Host IP: 172.18.0.120</header>
        <div className='host-content'>
          <span className='status'>Syslog Status: normal</span>
          <header>{t('syslogFields.txt-syslog')}</header>

          {syslog && syslog.dataContent &&
            <DataTable
              className='main-table'
              fields={dataFields}
              data={syslog.dataContent}
              defaultSort={syslog.sort}
              onRowMouseOver={this.handleTableRowMouseOver} />
          }

          <div className='content-header-btns'>
            <button className='standard btn'>{t('syslogFields.txt-addSyslog')}</button>
            <button className='standard btn'>{t('syslogFields.txt-viewEvents')}</button>
            <button className='standard btn'>{t('syslogFields.txt-overallDist')}</button>
          </div>
        </div>
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {
      activeContent,
      dataFields,
      syslog,
      hostsFields,
      hosts,
      openFilter,
      openSyslog,
      openTimeline,
      openEditHosts,
      activeHost
    } = this.state;

    return (
      <div>
        {openSyslog &&
          this.modalSyslog()
        }

        {openTimeline &&
          this.modalTimeline()
        }

        {openEditHosts &&
          this.modalEditHosts()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button onClick={this.openTimeline.bind(this, 'overall')} title={t('syslogFields.txt-overallDist')}><i className='fg fg-chart-kpi'></i></button>
            <button onClick={this.openSyslog.bind(this, null)} title={t('syslogFields.txt-addSyslog')}><i className='fg fg-add'></i></button>
            <button className={cx('last', {'active': openFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
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
                <TableContent
                  dataTableData={syslog.dataContent}
                  dataTableFields={dataFields}
                  dataTableSort={syslog.sort}
                  paginationTotalCount={syslog.totalCount}
                  paginationPageSize={syslog.pageSize}
                  paginationCurrentPage={syslog.currentPage}
                  handleTableSort={this.handleTableSort}
                  handleRowMouseOver={this.handleRowMouseOver}
                  paginationPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                  paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />              

                {/*<div className='config-syslog'>
                  {syslog.dataContent.map(this.displayHostInfo)}
                </div>*/}
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
                    <button className='standard btn add-host' onClick={this.openEditHosts.bind(this, 'add')}>{t('syslogFields.txt-addHost')}</button>
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