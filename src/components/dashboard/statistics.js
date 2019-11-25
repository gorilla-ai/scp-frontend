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

import helper from '../common/helper'
import withLocale from '../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;
let intervalId = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#d9576c',
  Alert: '#E4D354',
  Critical: '#F7A35C',
  Warning: '#57c3d9',
  Notice: '#90ED7D'
};
let pieCharts = {};

//Charts ID must be unique
const PIE_CHARTS_LIST = [
  {
    id: 'alertThreatLevel',
    key: 'level'
  },
  {
    id: 'Top10ExternalPotSrcCountry',
    key: 'agg'
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
      chartAttributes: {},
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
    this.loadAlertData();
    intervalId = setInterval(this.loadAlertData, 300000); //5 minutes
  }
  componentWillUnmount = () => {
    clearInterval(intervalId);
  }
  /**
   * Show tooltip info when mouseover the chart
   * @method
   * @param {object} eventInfo - MouseoverEvents
   * @param {object} data - chart data
   */
  onTooltip = (eventInfo, data) => {
    const text = data[0].rule + ': ' + data[0].number + ' ' + t('txt-at') + ' ' + Moment(data[0].time, 'x').utc().format('YYYY/MM/DD HH:mm:ss');

    return <div>{text}</div>
  }
  /**
   * Remove the charts that require special manipulation
   * @method
   * @returns formatted chars list
   */
  formattedPieChartsList = () => {
    const tempPieChartsList = _.cloneDeep(PIE_CHARTS_LIST);
    tempPieChartsList.shift(); //Remove first chart from list
    tempPieChartsList.pop(); //Remove last chart from list
    return tempPieChartsList;
  }
  /**
   * Get and set alert charts data
   * @method
   */
  loadAlertData = () => {
    const {baseUrl, contextRoot} = this.props;
    const {datetime, alertDetails} = this.state;
    const configSrcInfo = PIE_CHARTS_LIST[4];
    const dateTime = {
      from: Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm') + ':00Z',
      to: Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm') + ':00Z'
    };
    const tempPieChartsList = this.formattedPieChartsList();
    const apiData = [
      {
        url: `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0`,
        requestData: {
          timestamp: [dateTime.from, dateTime.to],
          filters: [{
            condition: 'must',
            query: 'All'
          }],
          search: _.map(tempPieChartsList, val => {
            return val.id;
          })
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
      let dataArr = [];

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
      dataArr = rulesAll.reduce((accumulator, currentValue) => {
        return accumulator.concat(currentValue)
      }, []);

      const chartAttributes = {
        legend: {
          enabled: true
        },
        data: dataArr,
        colors: ALERT_LEVEL_COLORS,
        onTooltip: this.onTooltip,
        dataCfg: {
          x: 'time',
          y: 'number',
          splitSeries: 'rule'
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            day: '%H:%M'
          }
        }
      };

      /* Get charts data */
      _.forEach(PIE_CHARTS_LIST, (val, i) => {
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
        } else if (i <= 4){
          if (data[0].aggregations) {
            const chartData = data[0].aggregations[val.id][val.path || val.key].buckets;

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

      const dnsInfo = PIE_CHARTS_LIST[5];
      let dnsMetricData = {};

      if (data[2].aggregations) {
        const dnsQueryData = data[2].aggregations[dnsInfo.id][dnsInfo.path].buckets;

        if (dnsQueryData.length > 0) {
          pieCharts[dnsInfo.id] = dnsQueryData;
        }

        const dnsData = data[2].aggregations.session_histogram;
        dnsMetricData = {
          id: 'dns-histogram',
          data: [{
            doc_count: dnsData.doc_count,
            MegaPackages: dnsData.MegaPackages,
            MegaBytes: dnsData.MegaBytes
          }],
          agg: ['doc_count', 'MegaPackages', 'MegaBytes'],
          keyLabels: {
            doc_count: t('dashboard.txt-session'),
            MegaPackages: t('dashboard.txt-packet'),
            MegaBytes: t('dashboard.txt-databyte')
          }
        };
      }

      this.setState({
        updatedTime: helper.getFormattedDate(Moment()),
        chartAttributes,
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

    _.forEach(PIE_CHARTS_LIST, val => {
      if (pieCharts[val.id].length > 0) {
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
      }
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
    const {baseUrl, contextRoot} = this.props;

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
    if (!_.isEmpty(val.data)) {
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
      chartAttributes,
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
            {!_.isEmpty(chartAttributes.data) &&
              <div className='chart-group bar'>
                <header className='main-header'>{t('dashboard.txt-alertStatistics')}</header>
                <BarChart
                  stacked
                  vertical
                  {...chartAttributes} />
              </div>
            }

            {alertChartsList.length > 0 &&
              alertChartsList.map(this.displayCharts)
            }

            <div className='chart-group c-box'>
              {metricsData.map(this.dispalyMetrics)}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

DashboardStats.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  locale: PropTypes.string.isRequired,
  session: PropTypes.object.isRequired
};

const HocDashboardStats = withRouter(withLocale(DashboardStats));
export { DashboardStats, HocDashboardStats };