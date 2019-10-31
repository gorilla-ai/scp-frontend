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
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import LineChart from 'react-chart/build/src/components/line'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Textarea from 'react-ui/build/src/components/textarea'

import {HocConfig as Config} from '../../common/configuration'
import EditHosts from './edit-hosts'
import helper from '../../common/helper'
import Relationships from './relationships'
import RowMenu from '../../common/row-menu'
import TableContent from '../../common/table-content'
import withLocale from '../../../hoc/locale-provider'

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

const INIT = {
  openFilter: false,
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
  openFilter: false,
  search: {
    port: '',
    format: ''
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
  error: false,
  info: ''
};

class Syslog extends Component {
  constructor(props) {
    super(props);

    this.state = _.cloneDeep(INIT);

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    et = chewbaccaI18n.getFixedT(null, 'errors')
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getRelationship();
    this.getSyslogList(false);
  }
  getRelationship = () => {
    const {baseUrl} = this.props;

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
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getSyslogList = (flag) => {
    const {baseUrl} = this.props;
    let {syslog, search} = this.state;
    let uri = `?page=${syslog.currentPage}&pageSize=${syslog.pageSize}&sort=${syslog.sort.field}&order=${syslog.sort.desc ? 'desc' : 'asc'}`;

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
      let tempSyslog = {...syslog};
      tempSyslog.dataContent = data.rows;
      tempSyslog.totalCount = data.counts;
      tempSyslog.currentPage = flag ? 1 : syslog.currentPage;

      const dataFields = {
        _menu: { label: '', formatter: (value, allValue) => {
          return <RowMenu
            page='syslog'
            active={value}
            targetEdit={allValue}
            targetDelete={allValue}
            targetEventDist={allValue}
            onEdit={this.openSyslog.bind(this, allValue.id)}
            onDelete={this.modalDelete.bind(this, allValue)}
            onEventDist={this.openTimeline.bind(this, 'configId', allValue)}
            onEvents={this.forwardSyslog.bind(this, allValue)}
            onEditHosts={this.openEditHosts.bind(this, allValue)}
            text={{
              edit: t('txt-edit'),
              delete: t('txt-delete'),
              eventDist: t('syslogFields.txt-eventDist'),
              events: t('syslogFields.txt-viewEvents'),
              hosts: t('syslogFields.txt-editHosts')
            }} />
        }},
        name: { label: t('syslogFields.name'), sortable: true },
        port: { label: t('syslogFields.port'), sortable: true },
        format: { label: t('syslogFields.format'), sortable: true },
        property: { label: t('syslogFields.property'), formatter: (value, allValue) => {
          return <div>  
          {
            _.map(JSON.parse(value), (v, k) => {
              return <span key={k} className='permit'>{k}</span>
            })
          }
          </div>
        }}
      };

      this.setState({
        syslog: tempSyslog,
        dataFields
      }, () => {
        this.closeSyslog();
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleTableSort = (value) => {
    let tempSyslog = {...this.state.syslog};
    tempSyslog.sort.field = value.field;
    tempSyslog.sort.desc = !tempSyslog.sort.desc;

    this.setState({
      syslog: tempSyslog
    }, () => {
      this.getSyslogList();
    });
  }
  handleRowMouseOver = (value, allValue, evt) => {
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
  getRaw = () => {
    const {baseUrl} = this.props;
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
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  confirmSyslog = () => {
    const {baseUrl} = this.props;
    const {config} = this.state;
    let flag = false;

    if (!config.port || !config.format || !config.input || !config.pattern) {
      flag = true;
    }

    _.forEach(config.relationship, el => {
      if (!el.name || !el.srcNode || !el.dstNode) {
        flag = true;
      }
      _.forEach(el.conditions, cond => {
        if (!cond.node) {
          flag = true;
        }
      })
    })

    if (flag) {
      this.setState({
        error: true,
        info: et('fill-required-fields')
      });
      return;
    } else {
      this.setState({
        error: false,
        info: ''
      });
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
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  modalDelete = (allValue) => {
    const eventNme = allValue.name;

    if (eventNme === 'syslog' || eventNme === 'eventlog') {
      return null;
    }

    PopupDialog.prompt({
      title: t('syslogFields.txt-delSyslog'),
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
          this.delSyslog(allValue.id);
        }
      }
    });
  }
  delSyslog = (id) => {
    const {baseUrl} = this.props;

    this.ah.one({
      url: `${baseUrl}/api/log/config?id=${id}`,
      type: 'DELETE'
    })
    .then(data => {
      this.getSyslogList(false);
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })  
  }
  handleSyslogChange = (type, value) => {
    let tempSyslog = {...this.state.syslog};
    tempSyslog[type] = value;

    this.setState({
      syslog: tempSyslog
    });
  }
  openSyslog = (id) => {
    const {baseUrl} = this.props

    if (!id) {
      this.setState({
        openSyslog: true,
        config: INIT_CONFIG,
        modalTitle: t('txt-add')
      });
      return;
    }

    this.ah.one({
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
          property: JSON.parse(data.property),
          relationships: JSON.parse(data.relationships)
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
          modalTitle: t('txt-edit')
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  closeSyslog = () => {
    this.setState({
      openSyslog: false,
      error: false,
      info: ''
    });
  }
  forwardSyslog = (config) => {
    const {baseUrl, contextRoot} = this.props;

    window.location.href = `${baseUrl}${contextRoot}/events/syslog?configId=${config.id}`;
  }
  openEditHosts = (data) => {
    const splitHostsData = data.hosts.split(', ');
    let formattedHostsData = [];

    _.forEach(splitHostsData, val => {
      val = val.replace('[', '');
      val = val.replace(']', '');

      formattedHostsData.push({
        host: val
      });
    })

    const hostsData = {
      ...data,
      formattedHostsData
    };

    this.setState({
      openEditHosts: true,
      hostsData
    });
  }
  openTimeline = (type, config) => {
    this.setState({
      openTimeline: true,
      activeTimeline: type,
      activeConfigId: config.id,
      activeConfigName: config.name
    }, () => {
      this.getTimeline();
    });
  }
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
  handleConfigChange = (type, value) => {
    let tempConfig = {...this.state.config};
    tempConfig[type] = value;

    this.setState({
      config: tempConfig
    });
  }
  convertPattern = () => {
    const {baseUrl} = this.props;
    const {config} = this.state;
    const dataObj = {
      input: config.input
    };

    this.ah.one({
      url: `${baseUrl}/api/log/pattern`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      this.handleConfigChange('pattern', data);
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getLatestInput = (configId) => {
    const {baseUrl} = this.props;

    if (configId) {
      this.ah.one({
        url: `${baseUrl}/api/log/event/sample?configId=${configId}`,
        type: 'GET'
      })
      .then(data => {
        let tempConfig = {...this.state.config};
        tempConfig.input = data;

        this.setState({
          config: tempConfig
        });
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
  }
  renderTabFilter = () => {
    const {config, rawOptions} = this.state;

    return (
      <div className='filters'>
        <div className='left-syslog'>
          <div style={{display: 'flex'}}>
            <div style={{width: '90%', position: 'relative'}}>
              {config.id &&
                <button onClick={this.getLatestInput.bind(this, config.id)}>{t('syslogFields.txt-getLatest')}</button>
              }
              <label>Data Sample Input</label>
              <Textarea
                rows={8}
                value={config.input}
                onChange={this.handleConfigChange.bind(this, 'input')} />
              <i className='c-link fg fg-down' title={t('txt-convert')} onClick={this.convertPattern} />
              <label>Match Pattern</label>
              <Textarea
                rows={10}
                value={config.pattern}
                onChange={this.handleConfigChange.bind(this, 'pattern')} />
            </div>
            <i className='c-link fg fg-forward' style={{marginTop: '35%', marginLeft: '25px'}} title={t('txt-parse')} onClick={this.getRaw} />
          </div>
        </div>
        <div>
          <label style={{marginLeft: '540px'}}>Data Property</label>
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
  handleRelationshipChange = (name, val) => {
    let tempConfig = {...this.state.config};
    tempConfig.relationships = val;

    this.setState({
      config: tempConfig
    });
  }
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
        onChange={this.handleRelationshipChange.bind(this, 'config.relationships')} />
    )
  }
  displaySyslogDialog = () => {
    const {config} = this.state;

    return (
      <div>
        <div className='syslogs'>
          <div className='syslog'>
            <label>{t('syslogFields.name')}</label>
            <Input 
              required={true} 
              validate={{t: et}}
              value={config.name}
              onChange={this.handleConfigChange.bind(this, 'name')} />
          </div>
          <div className='syslog'>
            <label>{t('syslogFields.port')}</label>
            <Input
              required={true}
              validate={{t: et}}
              value={config.port}
              onChange={this.handleConfigChange.bind(this, 'port')} />
          </div>
          <div className='syslog'>
            <label>{t('syslogFields.format')}</label>
            <Input
              validate={{t: et}}
              value={config.format}
              onChange={this.handleConfigChange.bind(this, 'format')} />
          </div>
        </div>
        <ButtonGroup
          list={[
            {value:'filter', text:'Filter'},
            {value:'relationship', text:'Relationship'}
          ]}
          onChange={this.handleConfigChange.bind(this, 'type')}
          value={config.type} />

        {config.type === 'filter' && 
          this.renderTabFilter()
        }

        {config.type === 'relationship' &&
          this.renderTabRelationship()
        }
      </div>
    )    
  }
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
        infoClassName={cx({'c-error':error})}
        info={info}>
        {this.displaySyslogDialog()}
      </ModalDialog>
    )
  }
  getTimeline = () => {
    const {baseUrl} = this.props;
    const {activeTimeline, activeConfigId, datetime} = this.state;
    const startDttm = Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const endDttm = Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    let configId = '';

    if (activeTimeline === 'configId') {
      configId = activeConfigId;
    }

    this.ah.one({
      url: `${baseUrl}/api/log/event/_event_source_agg?startDttm=${startDttm}&endDttm=${endDttm}&configId=${configId}`,
      type: 'GET'
    })
    .then(data => {
      const hostsArr = _.map(data.hosts, (key, value) => {
        return {
          ip: value,
          events: key
        };
      });

      const tempEventsData = {
        events: data.events,
        hosts: hostsArr
      };

      this.setState({
        clickTimeline: true,
        eventsData: tempEventsData
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getText = (eventInfo, data) => {
    const text = data[0].type + ': ' + data[0].events + ' ' + t('txt-at') + ' ' + Moment(data[0].time, 'x').utc().format('YYYY/MM/DD HH:mm:ss');
    return text;
  }
  onTooltip = (eventInfo, data) => {
    return (
      <div>
        <div>{this.getText(eventInfo, data)}</div>
      </div>
    )
  }
  handleDateChange = (datetime) => {
    this.setState({
      datetime
    });
  }
  displayEventsTimeline = () => {
    const {activeTimeline, activeConfigName, clickTimeline, datetime, eventsData} = this.state;
    let type = '';

    if (activeTimeline === 'configId') {
      type = activeConfigName;
    } else if (activeTimeline === 'overall') {
      type = 'overall';
    }

    const dataArr = _.map(eventsData.events, (value, key) => {
      return {
        time: parseInt(Moment(key, 'YYYY-MM-DDTHH:mm:ss.SSZ').utc(true).format('x')),
        events: value,
        type: type
      };
    });
    const chartAttributes = {
      legend: {
        enabled: true
      },
      data: dataArr,
      onTooltip: this.onTooltip,
      dataCfg: {
        x: 'time',
        y: 'events',
        splitSeries: 'type'
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%H:%M'
        }
      }
    };
    let showTimeline = false;
    let showTable = false;

    if (!_.isEmpty(eventsData.events)) {
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
            t={et} />
          <button onClick={this.getTimeline}>{t('txt-search')}</button>
          </div>
        <div className='chart-section'>
          {showTimeline &&
            <LineChart
              stacked
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
  handleEditHostsChange = (data) => {
    let tempHostsData = {...this.state.hostsData};
    tempHostsData.formattedHostsData = data;

    this.setState({
      hostsData: tempHostsData
    });
  }
  modalEditHosts = () => {
    const {hostsData} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeEditHosts},
      confirm: {text: t('txt-confirm'), handler: this.updateEditHosts}
    }
    const title = t('syslogFields.txt-editHosts');
    const data = {
      ...hostsData
    };

    return (
      <ModalDialog
        id='queryDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        <MultiInput
          className='edit-hosts-group'
          base={EditHosts}
          props={data}
          value={hostsData.formattedHostsData}
          onChange={this.handleEditHostsChange} />
      </ModalDialog>
    )
  }
  updateEditHosts = () => {
    const {baseUrl} = this.props;
    const {hostsData} = this.state;
    const url = `${baseUrl}/api/log/config/hosts`;
    let hostsArray = [];

    _.forEach(hostsData.formattedHostsData, val => {
      if (val.host) {
        hostsArray.push(val.host);
      }
    })

    const data = {
      id: hostsData.id,
      hosts: hostsArray
    };

    helper.getAjaxData('PATCH', url, data)
    .then(data => {
      if (data) {
        this.getSyslogList(false);
      }
      return null;
    });
    this.closeEditHosts();
  }
  closeEditHosts = () => {
    this.setState({
      openEditHosts: false
    });
  }
  handleSearchChange = (type, value) => {
    let tempSearch = {...this.state.search};
    tempSearch[type] = value.trim();

    this.setState({
      search: tempSearch
    });
  }
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
  setFilter = (flag) => {
    this.setState({
      openFilter: flag
    });
  }
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
  renderFilter = () => {
    const {search, openFilter} = this.state;

    return (
      <div className={cx('main-filter', {'active': openFilter})}>
        <i className='fg fg-close' onClick={this.setFilter.bind(this, false)} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label className='first-label'>{t('syslogFields.port')}</label>
            <Input onChange={this.handleSearchChange.bind(this, 'port')} value={search.port} />
          </div>
          <div className='group'>
            <label className='first-label'>{t('syslogFields.format')}</label>
            <Input onChange={this.handleSearchChange.bind(this, 'format')} value={search.format} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getSyslogList.bind(this, true)}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot, language, locale, session} = this.props;
    const {openSyslog, openTimeline, openEditHosts, syslog, openFilter, dataFields} = this.state;

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
            <button className={cx('last', {'active': openFilter})} onClick={this.setFilter.bind(this, !openFilter)} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
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
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Syslog.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
}

const HocSyslog = withLocale(Syslog);
export { Syslog, HocSyslog };