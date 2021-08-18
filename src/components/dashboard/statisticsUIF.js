import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import * as htmlToImage from 'html-to-image'
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import BlurLinearIcon from '@material-ui/icons/BlurLinear'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Grid from '@material-ui/core/Grid'
import MenuItem from '@material-ui/core/MenuItem'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import {downloadLink} from 'react-ui/build/src/utils/download'
import Progress from 'react-ui/build/src/components/progress'

import SearchOptions from '../common/search-options'
import {BaseDataContext} from '../common/context'
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'
import {HOC} from 'widget-builder'

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {Emergency: '#CC2943', Alert: '#CC7B29', Critical: '#29B0CC', Warning: '#29CC7A', Notice: '#7ACC29'};
const COLORS = ['#069BDA', '#57C3D9', '#57D998', '#6CD957', '#C3D957', '#D99857', '#D9576C', '#D957C3', '#9857D9', '#576CD9', '#5798D9', '#57D9C3', '#57D96C', '#98D957', '#D9C357', '#D96C57', '#D95798', '#C357D9', '#6C57D9'];

const INIT = {
  uifCfg: {},
  appendConfig: {},
  datetime: {},
  searchInput: {
    searchType: 'manual',
    searchInterval: '1h',
    refreshTime: '60000' //1 min.
  },
  openLayout: false,
  openEdit: false,
  oneFlag: false,
  allChartsID: [],
  toggleAll: true,
  layoutConfig: {
    display: {},
    position: []
  },
  displayContent: {},
  intervalArray: ['10m', '1h'],
  intervalValue: '10m'
};

let t = null;
let et = null;
let intervalId = null;

/**
 * Dashboard Statistics UI Framework
 * @class
 * @author Ken Lee <kenlee@ns-guard.com>
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the main Dashboard page
 */
class StatisticsUIF extends Component {
  constructor(props) {
    super(props);

    this.state = _.cloneDeep(INIT);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const datetime = {
      from: helper.getSubstractDate(1, 'days', moment().local()),
      to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
    };

    this.setState({
      datetime
    }, () => {
      this.loadLayoutCfg();
    });
  }
  loadLayoutCfg = () => {
    const {baseUrl, session} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/dashboard/layout/_get?accountId=${session.accountId}`,
      type: 'GET'
    })
    .then(data => {
      this.setState({
        layoutConfig: data
      }, () => {
        this.loadUIF();
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  loadUIF = () => {
    const {baseUrl, session} = this.context;
    const {datetime, intervalValue, oneFlag, layoutConfig} = this.state;
    const url = `${baseUrl}/api/uif?id=SCP-Overview`;
    let appendConfig = {};

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      let dataJson = JSON.parse(data);
      let uifCfg = JSON.parse(dataJson.data);

      _.forEach(uifCfg.config.widgets, (widgetValue, widgetName) => {
        const oldUrl = widgetValue.widgetConfig.config.dataSource.query.url;
        const pattern = _.includes(oldUrl, '?') ? oldUrl.substring(oldUrl.indexOf('/api'), oldUrl.indexOf('?')) : oldUrl.substring(oldUrl.indexOf('/api'));
        const params = _.includes(oldUrl, '?') ? oldUrl.substring(oldUrl.indexOf('?') + 1) : '';
        let newUrl = `${baseUrl}${pattern}`;

        if (params) {
          _.forEach(params.split('&'), param => {
            _.includes(newUrl, '?') ? newUrl += '&' : newUrl += '?';

            if (_.includes(param, 'startDttm')) {
              const startDttm = moment(datetime.from, 'YYYY-MM-DD hh:mm:ss').utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
              newUrl += `startDttm=${startDttm}`;
            } else if (_.includes(param, 'endDttm')) {
              const endDttm = moment(datetime.to, 'YYYY-MM-DD hh:mm:ss').utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
              newUrl += `endDttm=${endDttm}`;
            } else if (_.includes(param, 'accountId')) {
              newUrl += `accountId=${session.accountId}`;
            } else if (_.includes(param, 'timeZone')) {
              newUrl += `timeZone=8`;
            } else if (_.includes(param, 'histogramInterval')) {
              newUrl += `histogramInterval=${intervalValue}`;
            } else {
              newUrl += param;
            }
          })
        }

        _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.dataSource.query.url`], newUrl);
        _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.dataSource.errorMessage`], t('txt-error'));
        _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.placeholder`], t('txt-notFound'));

        // set tooltip
        if (widgetName === 'AlertStatistics-bar') {
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.onTooltip`], this.onTooltip.bind(this, 'AlertStatistics-bar'));
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.xAxis`], {
            labels: {
              formatter() {
                return moment(this.value, 'x').local().format('MM/DD HH:mm');
              }
            }
          });
        }

        if (widgetName === 'CustomAlertStatistics') {
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.onTooltip`], this.onTooltip.bind(this, 'CustomAlertStatistics'));
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.xAxis`], {
            labels: {
              formatter() {
                return moment(this.value, 'x').local().format('MM/DD HH:mm');
              }
            }
          });
        }

        if (widgetName === 'MaskedIPAlertStatistics-bar') {
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.onTooltip`], this.onTooltip.bind(this, 'MaskedIPAlertStatistics-bar'));
        }

        if (widgetName === 'honeypotLoginPassword-table') {
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.fields.password.formatter`], this.formatter.bind(this));
        }
      })

      // set display
      let displayContent = {};

      _.forEach(uifCfg.config.widgets, (content, key) => {
        let type = _.get(content.widgetConfig, 'type');
        type = type.substring(type.indexOf('/') + 1);
        let label = `${content.boxTitle}(${type})`;

        displayContent[key] = label;
      })
      
      _.set(uifCfg, 'config.onLayoutChange', this.positionChange);

      // overwrite uifcfg
      _.forEach(appendConfig, (v, k) => {
        _.set(uifCfg, k, v);
      })

      // set position
      _.forEach(layoutConfig.position, el => {
        _.set(uifCfg, `config.widgets.${el.id}.layout`, el);
      })

      this.setState({
        uifCfg,
        appendConfig,
        displayContent
      }, () => {
        if (oneFlag) {
          this.hoc.forceRefresh();
        }
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleChange = (field, value) => {
    this.setState({
      [field]: value
    });
  }
  handleDateChange = (type, newDatetime) => {
    let tempDatetime = {...this.state.datetime};
    let period = moment(tempDatetime.to).diff(moment(tempDatetime.from));
    let intervalArray = [];

    if (type === 'customTime' || type === 'refresh') {
      tempDatetime.from = newDatetime.from;
      tempDatetime.to = newDatetime.to;
    } else {
      tempDatetime[type] = newDatetime;
    }

    if (period <= 8640000) {
      intervalArray = ['10m', '1h'];
    } else if (8640000 < period && period <= 604800000) {
      intervalArray = ['1h', '12h', '1d'];
    } else if (604800000 < period && period <= 2419200000) {
      intervalArray = ['12h', '1d'];
    } else {
      intervalArray = ['1d'];
    }

    this.setState({
      datetime: tempDatetime,
      intervalArray,
      intervalValue: intervalArray[0]
    }, () => {
      if (type === 'refresh') {
        this.loadUIF();
      }
    });
  }
  /**
   * Set search options data
   * @method
   * @param {string | object} event - event object
   * @param {string} [type] - for 'searchType' input
   */
  setSearchData = (event, inputType) => {
    let tempSearchInput = {...this.state.searchInput};

    if (event.target) {
      tempSearchInput[event.target.name] = event.target.value;
    } else {
      tempSearchInput[inputType] = event[inputType];
      tempSearchInput.searchInterval = '1h'; //set default value
      tempSearchInput.refreshTime = '60000'; //set default value for 1 min.
    }

    this.setState({
      searchInput: tempSearchInput
    });
  }
  formatter = (value) => {
    return <div dangerouslySetInnerHTML={{__html: value}} />
  }
  onTooltip = (type, eventInfo, data) => {
    if (type === 'AlertStatistics-bar') {
      return (
        <section>
          <span>{t('txt-severity')}: {data[0].severity}<br /></span>
          <span>{t('txt-time')}: {moment(data[0].key, 'x').local().format('YYYY/MM/DD HH:mm:ss')}<br /></span>
          <span>{t('txt-count')}: {helper.numberWithCommas(data[0].doc_count)}</span>
        </section>
      )
    } else if (type === 'CustomAlertStatistics') {
      return (
        <section>
          <span>{t('dashboard.txt-patternName')}: {data[0].patternName}<br /></span>
          <span>{t('txt-time')}: {moment(data[0].key, 'x').local().format('YYYY/MM/DD HH:mm:ss')}<br /></span>
          <span>{t('txt-count')}: {helper.numberWithCommas(data[0].doc_count)}</span>
        </section>
      )
    } else if (type === 'CustomAccountQueryAlertStatistics') {
      return (
        <section>
          <span>{t('dashboard.txt-patternName')}: {data[0].QueryFilterName}<br /></span>
          <span>{t('txt-time')}: {Moment(data[0].key, 'x').local().format('YYYY/MM/DD HH:mm:ss')}<br /></span>
          <span>{t('txt-count')}: {data[0].doc_count}</span>
        </section>
      )
    } else if (type === 'MaskedIPAlertStatistics-bar') {
      return (
        <section>
          <span>{t('txt-subnet')}: {data[0].subnet}<br /></span>
          <span>{t('txt-count')}: {helper.numberWithCommas(data[0].doc_count)}</span>
        </section>
      )
    }
  }
  exportPDF = () => {
    const {baseUrl, contextRoot} = this.context;
    const {uifCfg} = this.state;
    let cfg = {
      data: []
    };

    Progress.startSpin();

    cfg.data = _.map(uifCfg.config.widgets, (v, k) => {
      return {
        display_setting: {
          x: v.layout.x * 2,
          y: v.layout.y * 2,
          width: v.layout.w * 2,
          height: v.layout.h * 2
        },
        content_setting: {
          type: 'image',
          value: `${k}.jpg`
        }
      };
    });

    _.forEach(uifCfg.config.widgets, (value, chart) => {
      htmlToImage.toPng(document.getElementById(chart))
      .then(function(dataUrl) {
        const imgArray = dataUrl.split(',');
        const mime = imgArray[0].match(/:(.*?);/)[1];
        const bstr = atob(imgArray[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);

        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const img = new File([u8arr], `${chart}.jpg`, {type: mime});

        let formData = new FormData();
        formData.append('file', img);
        formData.append('config_string', JSON.stringify(cfg));
        formData.append('size', _.size(cfg.data));

        this.ah.one({
          url: `${baseUrl}/api/pdf/_relay2`,
          data: formData,
          type: 'POST',
          dataType: 'JSON',
          processData: false,
          contentType: false
        })
        .then(data => {
          if (data.rt) {
            downloadLink(`${baseUrl}${contextRoot}/api/pdf/_download`);
            Progress.done();
          }
        })
        .catch(err => {
          helper.showPopupMsg('', t('txt-error'), err.message);
        })
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    })
  }
  positionChange = (event) => {
    const {allChartsID, layoutConfig, oneFlag} = this.state;
    let chartsIDs = [];
    layoutConfig.position = event;

    if (allChartsID.length === 0 && event.length > 0) {
      chartsIDs = _.map(event, val => {
        return val.id
      });

      this.setState({
        allChartsID: chartsIDs
      });
    }

    if (oneFlag) {
      this.setState({
        openEdit: true,
        layoutConfig
      });
    } else {
      this.setState({
        oneFlag: true,
        layoutConfig
      });
    }
  }
  openLayoutDialog = () => {
    this.setState({
      openLayout: true
    });
  }
  cancelLayout = () => {
    this.setState({
      openLayout: false
    });
  }
  saveLayout = () => {
    const {baseUrl, session} = this.context;
    const {layoutConfig} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/dashboard/layout/_set?accountId=${session.accountId}`,
      data: JSON.stringify(layoutConfig),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      this.setState({
        openLayout: false,
        openEdit: false,
        oneFlag: false
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getSwitchStatus = (val) => {
    if (this.state.layoutConfig.display[val] === false) {
      return false;
    } else {
      return true;
    }
  }
  handleSwitchChange = (name, event) => {
    const {allChartsID, layoutConfig} = this.state;
    const checked = event.target.checked;
    let tempLayoutConfig = {...layoutConfig};
    tempLayoutConfig = _.set(layoutConfig, `display.${name}`, checked);
    let toggleAll = true;
    
    let chart = document.getElementById(name);
    chart.parentNode.style.visibility = checked ? 'visible' : 'hidden';

    _.forEach(allChartsID, val => {
      let chart = document.getElementById(val);

      if (chart.parentNode.style.visibility === 'hidden') {
        toggleAll = false;
        return false;
      }
    })

    this.setState({
      openEdit: true,
      toggleAll,
      layoutConfig: tempLayoutConfig
    });
  }
  setChartSwitch = (val, i) => {
    const {displayContent} = this.state;

    return (
      <Grid item xs={4}>
        <FormControlLabel
          className='switch-control'
          control={
          <Switch
            name={val}
            checked={this.getSwitchStatus(val)}
            onChange={this.handleSwitchChange.bind(this, val)}
            color='primary' />
          }
          label={displayContent[val]} />
      </Grid>
    )
  }
  handleToggleAllChange = () => {
    this.setState({
      toggleAll: !this.state.toggleAll
    }, () => {
      const {allChartsID, toggleAll, layoutConfig} = this.state;
      const visible = toggleAll ? 'visible' : 'hidden';
      let tempLayoutConfig = {...layoutConfig};

      _.forEach(allChartsID, val => {
        let chart = document.getElementById(val);
        chart.parentNode.style.visibility = visible;
        tempLayoutConfig.display[val] = toggleAll;
      })

      this.setState({
        openEdit: true,
        layoutConfig: tempLayoutConfig
      });
    });
  }
	render() {
    const {
      uifCfg,
      appendConfig,
      datetime,
      searchInput,
      openLayout,
      openEdit,
      allChartsID,
      toggleAll,
      layoutConfig,
      displayContent,
      intervalArray,
      intervalValue
    } = this.state;

    _.forEach(layoutConfig.display, (isDisplay, key) => {
      if (!isDisplay) {
        const chart = document.getElementById(key);

        if (chart) {
          let charts = chart.parentNode;
          charts.style.visibility = 'hidden';
        }
      }
    })

    return (
      <div>
        <div className='sub-header'>
          <Grid container justify='space-between'>
            <Grid item xs={3}>
              {helper.getDashboardMenu('statisticsUIF')}
            </Grid>
            <Grid item xs={9}>
              <Grid container justify='flex-end'>
                <Grid item className='secondary-btn-group'>
                  <Button variant='outlined' color='primary' title={t('txt-export')} onClick={this.exportPDF} ><CloudDownloadIcon /></Button>
                  <Button variant='outlined' color='primary' title={t('txt-layout-setting')} onClick={this.openLayoutDialog}><BlurLinearIcon /></Button>
                </Grid>
                <Grid item>
                  <div className='search-options'>
                    <TextField
                      className='search-type'
                      select
                      variant='outlined'
                      size='small'
                      value={intervalValue}
                      onChange={(event) => this.handleChange('intervalValue', event.target.value)} >
                      {
                        _.map(intervalArray, el => {
                          return <MenuItem key={el} value={el}>{t(`time-interval.txt-chart-interval`)}{t(`time-interval.txt-${el}`)}</MenuItem>
                        })
                      }
                    </TextField>
                  </div>
                </Grid>
                <Grid item>
                  <SearchOptions
                    datetime={datetime}
                    searchInput={searchInput}
                    enableTime={true}
                    showInterval={true}
                    setSearchData={this.setSearchData}
                    handleDateChange={this.handleDateChange}
                    handleSearchSubmit={this.loadUIF} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>

        {openEdit &&
          <Grid container style={{backgroundColor: 'white', padding: '5px'}} justify='center' alignItems='center'>
            <Typography color='error' display='inline'>{t('txt-layout-change')}</Typography>&nbsp;&nbsp;&nbsp;
            <Button variant='outlined' color='primary' onClick={this.handleChange.bind(this, 'openEdit', false)}>{t('txt-cancel')}</Button>&nbsp;&nbsp;&nbsp;
            <Button variant='outlined' color='primary' onClick={this.saveLayout.bind(this)} >{t('txt-save')}</Button>
          </Grid>
        }

        {!_.isEmpty(appendConfig) &&
          <div className='uif-dashboard'>
             <HOC ref={ref => { this.hoc=ref }} {...uifCfg} />
          </div>
        }

        <Dialog
          className='dashboard-layout-settings'
          maxWidth='lg'
          open={openLayout}
          onClose={this.cancelLayout}>
          <DialogTitle>{t('txt-layout-setting')}</DialogTitle>
          <DialogContent>
            <Grid container>
              {allChartsID.length > 0 &&
                <FormControlLabel
                  className='switch-control toggle-all'
                  control={
                  <Switch
                    checked={toggleAll}
                    onChange={this.handleToggleAllChange}
                    color='primary' />
                  }
                  label={t('txt-toggleAll')} />
              }
              {Object.keys(displayContent).map(this.setChartSwitch)}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant='outlined' color='primary' className='standard btn' onClick={this.cancelLayout}>{t('txt-close')}</Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

StatisticsUIF.contextType = BaseDataContext;

StatisticsUIF.propTypes = {
}

export default withRouter(StatisticsUIF);