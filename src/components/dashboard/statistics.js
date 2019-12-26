import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import BarChart from 'react-chart/build/src/components/bar'
import DataTable from 'react-ui/build/src/components/table'
import Metric from 'react-chart/build/src/components/metric'
import PieChart from 'react-chart/build/src/components/pie'

import {BaseDataContext} from '../common/context';
import helper from '../common/helper'
import withLocale from '../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;
let intervalId = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};
let pieCharts = {};

//Charts ID must be unique
const CHARTS_LIST = [
  {
    id: 'alertThreatLevel',
    key: 'severity'
  },
  {
    id: 'Top10ExternalSrcCountry',
    key: 'srcCountry'
  },
  {
    id: 'Top10InternalIp',
    key: 'srcIp'
  },
  {
    id: 'Top10InternalMaskedIp',
    key: 'maskedIP'
  },
  {
    id: 'Top10SyslogConfigSource',
    key: 'configSrc',
    path: 'agg'
  },
  {
    id: 'dnsQuery',
    key: 'query',
    path: 'dns.status-term'
  }
];

/**
 * Dashboard Statistics
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Dashboard Statistics
 */
class DashboardStats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      datetime: {
        from: helper.getStartDate('day'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
        //from: '2019-08-06T01:00:00Z',
        //to: '2019-08-07T02:02:13Z'
      },
      updatedTime: helper.getFormattedDate(Moment()),
      alertDataArr: [],
      internalMaskedIp: [],
      pieCharts: {},
      alertChartsList: [],
      dnsMetricData: {},
      diskMetricData: {}
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'common', locale);

    this.loadAlertData();
    intervalId = setInterval(this.loadAlertData, 300000); //5 minutes
  }
  componentWillUnmount() {
    clearInterval(intervalId);
  }
  /**
   * Show tooltip info when mouseover the chart
   * @method
   * @param {object} eventInfo - MouseoverEvents
   * @param {object} data - chart data
   * @returns HTML DOM
   */
  onTooltip = (eventInfo, data) => {
    return (
      <section>
        <span>{t('txt-severity')}: {data[0].rule}<br /></span>
        <span>{t('txt-time')}: {Moment(data[0].time, 'x').utc().format('YYYY/MM/DD HH:mm:ss')}<br /></span>
        <span>{t('txt-count')}: {data[0].number}</span>
      </section>
    )
  }
  /**
   * Get and set alert charts data
   * @method
   */
  loadAlertData = () => {
    const {baseUrl} = this.context;
    const {datetime, alertDetails} = this.state;
    const configSrcInfo = CHARTS_LIST[4];
    const dateTime = {
      from: Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm') + ':00Z',
      to: Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm') + ':00Z'
    };
    const apiData = [
      {
        url: `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0`,
        requestData: {
          timestamp: [dateTime.from, dateTime.to],
          filters: [{
            condition: 'must',
            query: 'All'
          }],
          search: ['Top10ExternalSrcCountry', 'Top10InternalIp', 'Top10InternalMaskedIp']
        }
      },
      {
        url: `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0`,
        requestData: {
          timestamp: [dateTime.from, dateTime.to],
          filters: [{
            condition: 'must',
            query: configSrcInfo.id
          }]
        }
      },
      {
        url: `${baseUrl}/api/alert/dnsQuery?page=1&pageSize=0`,
        requestData: {
          timestamp: [dateTime.from, dateTime.to]
        }
      }
    ];
    const apiArr = _.map(apiData, val => {
      return {
        url: val.url,
        data: JSON.stringify(val.requestData),
        type: 'POST',
        contentType: 'text/plain'
      };
    });

    this.ah.all(apiArr)
    .then(data => {
      let alertHistogram = {
        Emergency: {},
        Alert: {},
        Critical: {},
        Warning: {},
        Notice: {}
      };
      let rulesObj = {};
      let rulesAll = [];
      let alertDataArr = [];
      let maskedIPdata = '';
      let internalMaskedIp = [];

      _.forEach(SEVERITY_TYPE, val => { //Create Alert histogram for Emergency, Alert, Critical, Warning, Notice
        if (data[0].event_histogram) {
          _.forEach(data[0].event_histogram[val].buckets, val2 => {
            if (val2.doc_count > 0) {
              alertHistogram[val][val2.key_as_string] = val2.doc_count;
            }
          })
        }
      })

      _.forEach(_.keys(alertHistogram), val => { //Manually add rule name to the response data
        rulesObj[val] = _.map(alertHistogram[val], (value, key) => {
          return {
            time: parseInt(Moment(key, 'YYYY-MM-DDTHH:mm:ss.SSZ').utc(true).format('x')),
            number: value,
            rule: val
          };
        });
      })

      _.forEach(_.keys(alertHistogram), val => { //Push multiple rule arrays into a single array
        rulesAll.push(rulesObj[val]);
      })

      //Merge multiple arrays with different rules to a single array
      alertDataArr = rulesAll.reduce((accumulator, currentValue) => {
        return accumulator.concat(currentValue)
      }, []);

      if (data[0].aggregations) {
        maskedIPdata = data[0].aggregations.Top10InternalMaskedIp;

        _.forEach(maskedIPdata, (key, val) => {
          if (val !== 'doc_count' && maskedIPdata[val].doc_count > 0) {
            _.forEach(maskedIPdata[val].srcIp.buckets, val2 => {
              internalMaskedIp.push({
                ip: val,
                number: val2.doc_count,
                severity: val2._severity_
              });
            })
          }
        })
      }

      /* Get charts data */
      _.forEach(CHARTS_LIST, (val, i) => {
        let tempArr = [];

        if (i === 0) {
          if (data[0].aggregations) {
            _.forEach(SEVERITY_TYPE, val2 => { //Create Alert histogram for Emergency, Alert, Critical, Warning, Notice
              tempArr.push({
                key: val2,
                doc_count: data[0].aggregations[val2].doc_count
              });
            })
          }
        } else if (i === 3) {
          if (data[0].aggregations) {
            const chartData = data[0].aggregations[val.id];

            _.forEach(_.keys(chartData), val2 => {
              if (val2 !== 'doc_count' && chartData[val2].doc_count) {
                tempArr.push({
                  key: val2,
                  doc_count: chartData[val2].doc_count
                });
              }
            })
          }
        } else if (i < 3) {
          if (data[0].aggregations) {
            const chartData = data[0].aggregations[val.id][val.key].buckets;

            if (chartData.length > 0) {
              _.forEach(chartData, val2 => {
                if (val2.key) { //Remove empty data
                  tempArr.push({
                    key: val2.key,
                    doc_count: val2.doc_count
                  });
                }
              })
            }
          }
        }
        pieCharts[val.id] = tempArr;
      })

      if (data[1].aggregations) {
        const configSrcData = data[1].aggregations[configSrcInfo.id][configSrcInfo.path].buckets;

        if (configSrcData.length > 0) {
          pieCharts[configSrcInfo.id] = configSrcData;
        }
      }

      const dnsInfo = CHARTS_LIST[5];
      let dnsMetricData = {
        id: 'dns-histogram'
      };

      if (data[2].aggregations) {
        const dnsQueryData = data[2].aggregations[dnsInfo.id][dnsInfo.path].buckets;

        if (dnsQueryData.length > 0) {
          pieCharts[dnsInfo.id] = dnsQueryData;
        }

        const dnsData = data[2].aggregations.session_histogram;
        dnsMetricData.data = [{
          doc_count: dnsData.doc_count,
          MegaPackages: dnsData.MegaPackages,
          MegaBytes: dnsData.MegaBytes
        }];
        dnsMetricData.agg = ['doc_count', 'MegaPackages', 'MegaBytes'];
        dnsMetricData.keyLabels = {
          doc_count: t('dashboard.txt-session'),
          MegaPackages: t('dashboard.txt-packet'),
          MegaBytes: t('dashboard.txt-databyte')
        };
      }

      this.setState({
        updatedTime: helper.getFormattedDate(Moment()),
        alertDataArr,
        internalMaskedIp,
        pieCharts,
        dnsMetricData
      }, () => {
        this.getPieChartsData();
        this.loadMetricData();
      });
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Construct and set the pie charts
   * @method
   */
  getPieChartsData = () => {
    const {pieCharts} = this.state;
    let alertChartsList = [];

    _.forEach(CHARTS_LIST, val => {
      alertChartsList.push({
        chartID: val.id,
        chartTitle: t('dashboard.txt-' + val.id),
        chartKeyLabels: {
          key: t('attacksFields.' + val.key),
          doc_count: t('txt-count')
        },
        chartValueLabels: {
          'Pie Chart': {
            key: t('attacksFields.' + val.key),
            doc_count: t('txt-count')
          }
        },
        chartDataCfg: {
          splitSlice: ['key'],
          sliceSize: 'doc_count'
        },
        chartData: pieCharts[val.id],
        type: 'pie'
      });
    })

    this.setState({
      alertChartsList
    });
  }
  /**
   * Construct and set the metric chart
   * @method
   */
  loadMetricData = () => {
    const {baseUrl} = this.context;

    ah.one({
      url: `${baseUrl}/api/alert/diskUsage`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        data = data.rt;
        const diskMetricData = {
          id: 'disk-usage',
          data: [{
            diskAvail: data['disk.avail'],
            diskTotal: data['disk.total']
          }],
          agg: ['diskAvail', 'diskTotal'],
          keyLabels: {
            diskAvail: t('dashboard.txt-diskAvail'),
            diskTotal: t('dashboard.txt-diskTotal')
          }
        };

        this.setState({
          diskMetricData
        });
      }
    })
  }
  /**
   * Redirect to Alerts or Events page
   * @method
   * @param {string} chartID - unique chart ID
   * @param {object} chart - chart overall data
   * @param {array.<object>} data - chart specific data
   * @param {object} info - chart info
   */
  getChartRedirect = (chartID, chart, chartData, info) => {
    const {baseUrl, contextRoot} = this.context;
    const severityChart = ['alertThreatLevel'];
    const ipChart = ['Top10InternalIp', 'Top10InternalMaskedIp', 'maskedIP'];
    const countryChart = ['Top10ExternalSrcCountry'];
    const syslogChart = ['Top10SyslogConfigSource'];
    let data = chartData[0].key;
    let type = '';

    if (_.includes(syslogChart, chartID)) {
      const url = `${baseUrl}${contextRoot}/events/syslog?configSource=${data}&interval=today`;
      window.open(url, '_blank');
      return;
    }

    if (_.includes(severityChart, chartID)) {
      type = 'severity';
    } else if (_.includes(ipChart, chartID)) {
      type = 'ip';

      if (chartID === 'maskedIP') {
        type = 'maskedIP';
        const ip = chartData[0].ip;
        const severity = chartData[0].severity;
        data = ip + '&severity=' + severity;
      }
    } else if (_.includes(countryChart, chartID)) {
      type = 'country';
    } else {
      return;
    }

    const url = `${baseUrl}${contextRoot}/threats?type=${type}&data=${data}&interval=today`;
    window.open(url, '_blank');
  }
  /**
   * Show tooltip info when mouseover the pie chart
   * @method
   * @param {object} keyLabel - chart key label
   * @param {object} eventInfo - MouseoverEvents
   * @param {array.<object>} data - chart data
   * @returns HTML DOM
   */
  onPieChartTooltip = (keyLabel, eventInfo, data) => {
    return (
      <section>
        <span>{keyLabel.key}: {_.escape(data[0].key)}</span><br />
        <span>{keyLabel.doc_count}: {data[0].doc_count}</span><br />
      </section>
    )
  }
  /**
   * Display pie chart and table chart
   * @method
   * @param {object} val - alert chart data
   * @param {number} i - index of the alert chart data
   * @returns HTML DOM
   */
  displayCharts = (val, i) => {
    const {alertChartsList} = this.state;

    if (alertChartsList[i].type === 'pie') {
      return (
        <div className='chart-group c-box' key={alertChartsList[i].chartID}>
          <PieChart
            id={alertChartsList[i].chartID}
            title={alertChartsList[i].chartTitle}
            data={alertChartsList[i].chartData}
            keyLabels={alertChartsList[i].chartKeyLabels}
            valueLabels={alertChartsList[i].chartValueLabels}
            dataCfg={alertChartsList[i].chartDataCfg}
            onClick={this.getChartRedirect.bind(this, alertChartsList[i].chartID)}
            onTooltip={this.onPieChartTooltip.bind(this, alertChartsList[i].chartKeyLabels)}
            colors={{
              key: ALERT_LEVEL_COLORS
            }} />
        </div>
      )
    } else if (alertChartsList[i].type === 'table') {
      return (
        <div className='chart-group' key={alertChartsList[i].chartID}>
          <header className='main-header'>{alertChartsList[i].chartTitle}</header>
          <div id={alertChartsList[i].chartID} className='c-chart table'>
            <DataTable
              className='main-table overflow-scroll'
              fields={alertChartsList[i].chartFields}
              data={alertChartsList[i].chartData}
              defaultSort={alertChartsList[i].chartData ? alertChartsList[i].sort : {}} />
          </div>
        </div>
      )
    }
  }
  /**
   * Display metrics chart
   * @method
   * @param {object} val - alert chart data
   * @param {number} i - index of the alert chart data
   * @returns HTML DOM
   */
  dispalyMetrics = (val, i) => {
    if (val.id) {
      return (
        <Metric
          key={val.id}
          className={val.id}
          title={t('dashboard.txt-' + val.id)}
          data={val.data}
          dataCfg={{
            agg: val.agg
          }}
          keyLabels={val.keyLabels} />
      )
    }
  }
  render() {
    const {
      updatedTime,
      alertDataArr,
      internalMaskedIp,
      alertChartsList,
      dnsMetricData,
      diskMetricData
    } = this.state;
    const metricsData = [dnsMetricData, diskMetricData];

    return (
      <div>
        <div className='sub-header'>
          {helper.getDashboardMenu('statistics')}
          <span className='date-time'>{updatedTime}</span>
        </div>

        <div className='main-dashboard'>
          <div className='charts'>
            <div className='chart-group bar'>
              <BarChart
                stacked
                vertical
                title={t('dashboard.txt-alertStatistics')}
                data={alertDataArr}
                colors={ALERT_LEVEL_COLORS}
                onTooltip={this.onTooltip}
                dataCfg={{
                  x: 'time',
                  y: 'number',
                  splitSeries: 'rule'
                }}
                xAxis={{
                  type: 'datetime',
                  dateTimeLabelFormats: {
                    day: '%H:%M'
                  }
                }} />
            </div>

            <div className='chart-group bar'>
              <BarChart
                stacked
                vertical
                title={t('dashboard.txt-alertMaskedIpStatistics')}
                data={internalMaskedIp}
                colors={ALERT_LEVEL_COLORS}
                onTooltip={true}
                dataCfg={{
                  splitSeries: 'severity',
                  x: 'ip',
                  y: 'number'
                }}
                xAxis={{
                  type:'category'
                }}
                keyLabels={{
                  ip: 'IP',
                  number: t('txt-count'),
                  severity: t('txt-severity')
                }}
                onClick={this.getChartRedirect.bind(this, 'maskedIP')} />
            </div>

            {alertChartsList.map(this.displayCharts)}

            {(metricsData[0].id || metricsData[1].id) &&
              <div className='chart-group c-box'>
                {metricsData.map(this.dispalyMetrics)}
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

DashboardStats.contextType = BaseDataContext;

DashboardStats.propTypes = {
};

const HocDashboardStats = withRouter(withLocale(DashboardStats));
export { DashboardStats, HocDashboardStats };