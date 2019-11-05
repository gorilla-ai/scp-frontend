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

const SEVERITY_TYPE = ['High', 'Medium', 'Low'];
const ALERT_LEVEL_COLORS = {
  High: '#d9576c',
  Medium: '#d99857',
  Low: '#57c3d9'
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
  onTooltip = (eventInfo, data) => {
    const text = data[0].rule + ': ' + data[0].number + ' ' + t('txt-at') + ' ' + Moment(data[0].time, 'x').utc().format('YYYY/MM/DD HH:mm:ss');

    return <div>{text}</div>
  }
  formattedPieChartsList = () => {
    const tempPieChartsList = _.cloneDeep(PIE_CHARTS_LIST);
    tempPieChartsList.shift(); //Remove first chart from list
    tempPieChartsList.pop(); //Remove last chart from list
    return tempPieChartsList;
  }
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
        url: `${baseUrl}/api/u1/alert/_search?page=1&pageSize=0`,
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
        url: `${baseUrl}/api/u1/alert/_search?page=1&pageSize=0`,
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
        High: {},
        Medium: {},
        Low: {}
      };
      let rulesObj = {};
      let rulesAll = [];
      let dataArr = [];

      _.forEach(SEVERITY_TYPE, val => { //Create Alert histogram for High, Medium, Low
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
            _.forEach(SEVERITY_TYPE, val2 => { //Create Alert histogram for High, Medium, Low
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
  displayCharts = (key, i) => {
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
  dispalyMetrics = (key, i) => {
    if (!_.isEmpty(key.data)) {
      return (
        <Metric
          key={key.id}
          className={key.id}
          title={t('dashboard.txt-' + key.id)}
          data={key.data}
          dataCfg={{
            agg: key.agg
          }}
          keyLabels={key.keyLabels} />
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