import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import queryString from 'query-string'

import BarChart from 'react-chart/build/src/components/bar'
import DataTable from 'react-ui/build/src/components/table'
import Metric from 'react-chart/build/src/components/metric'
import PieChart from 'react-chart/build/src/components/pie'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;
let l = null;
let intervalId = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};

//Charts ID must be unique
const CHARTS_LIST = [
  {
    id: 'alertThreatLevel',
    key: 'severity'
  },
  {
    id: 'InternalIp',
    key: 'srcIp'
  },
  {
    id: 'InternalMaskedIp',
    key: 'maskedIP'
  },
  {
    id: 'IVAR'
  },
  {
    id: 'Top10ExternalSrcCountry',
    key: 'srcCountry'
  },
  {
    id: 'Top10SyslogConfigSource',
    key: 'configSrc',
    path: 'agg'
  },
  {
    id: 'dnsQuery',
    key: 'query',
    path: 'dns-status-term'
  }
];

/**
 * Dashboard Statistics
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Dashboard Statistics
 */
class DashboardStats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      datetime: {
        from: helper.getSubstractDate(24, 'hours'),
        to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
        //from: '2019-08-06T01:00:00Z',
        //to: '2019-08-07T02:02:13Z'
      },
      alertDataArr: null,
      internalMaskedIpArr: null,
      alertChartsList: [],
      alertPieData: {},
      syslogPieData: {},
      alertPatternData: null,
      dnsPieData: {},
      dnsMetricData: {
        id: 'dns-histogram'
      },
      diskMetricData: {
        id: 'disk-usage'
      },
      ivar: {
        dataFieldsArr: ['frmotp', 'intrusion'],
        dataFields: {},
        dataContent: null
      },
      hmdData: {},
      lms: null
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    l = global.chewbaccaI18n.getFixedT(null, 'lms');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const statisticsParam = queryString.parse(location.search);
    let alertChartsList = [];

    _.forEach(CHARTS_LIST, val => {
      if (val.id === 'IVAR') {
        alertChartsList.push({
          chartID: val.id,
          chartTitle: 'IVA Events',
          type: 'table'
        });
      } else {
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
          chartData: null,
          type: 'pie'
        });
      }
    })

    if (!_.isEmpty(statisticsParam)) { //For internal use only
      let tempDatetime = {...this.state.datetime};
      tempDatetime.from = helper.getSubstractDate(statisticsParam.unit, statisticsParam.type);

      this.setState({
        datetime: tempDatetime
      });
    }

    this.setState({
      alertChartsList
    }, () => {
      this.loadAlertData();
    });

    intervalId = setInterval(this.loadAlertData, 300000); //5 minutes
  }
  componentWillUnmount() {
    clearInterval(intervalId);
  }
  /**
   * Show tooltip info when mouseover the chart
   * @method
   * @param {string} type - chart type ('barChart' or 'lineChart')
   * @param {object} eventInfo - MouseoverEvents
   * @param {object} data - chart data
   * @returns HTML DOM
   */
  onTooltip = (type, eventInfo, data) => {
    if (type === 'barChart') {
      return (
        <section>
          <span>{t('txt-severity')}: {data[0].rule}<br /></span>
          <span>{t('txt-time')}: {moment(data[0].time).format('YYYY/MM/DD HH:mm:ss')}<br /></span>
          <span>{t('txt-count')}: {helper.numberWithCommas(data[0].number)}</span>
        </section>
      )
    } else if (type === 'lineChart') {
      return (
        <section>
          <span>{t('dashboard.txt-patternName')}: {data[0].patternName}<br /></span>
          <span>{t('txt-date')}: {moment(data[0].time).format('YYYY/MM/DD HH:mm:ss')}<br /></span>
          <span>{t('txt-count')}: {helper.numberWithCommas(data[0].count)}</span>
        </section>
      )
    }
  }
  /**
   * Get and set alert charts data
   * @method
   */
  loadAlertData = () => {
    const {baseUrl} = this.context;
    const {datetime, alertPieData} = this.state;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    const url = `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0&skipHistogram=true`;
    const requestData = {
      timestamp: [dateTime.from, dateTime.to],
      filters: [{
        condition: 'must',
        query: 'All'
      }],
      search: ['Top10ExternalSrcCountry', 'InternalIp', 'InternalMaskedIp']
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        let tempAlertPieData = {...alertPieData};
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
        let internalMaskedIpArr = [];

        _.forEach(SEVERITY_TYPE, val => { //Create Alert histogram for Emergency, Alert, Critical, Warning, Notice
          if (data.event_histogram) {
            _.forEach(data.event_histogram[val].buckets, val2 => {
              if (val2.doc_count > 0) {
                alertHistogram[val][val2.key_as_string] = val2.doc_count;
              }
            })
          }
        })

        _.forEach(_.keys(alertHistogram), val => { //Manually add rule name to the response data
          rulesObj[val] = _.map(alertHistogram[val], (value, key) => {
            return {
              time: parseInt(moment(key, 'YYYY-MM-DDTHH:mm:ss.SSZ').utc(true).format('x')),
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

        if (data.aggregations) {
          maskedIPdata = data.aggregations.InternalMaskedIp;

          _.forEach(maskedIPdata, (key, val) => {
            if (val !== 'doc_count' && maskedIPdata[val].doc_count > 0) {
              _.forEach(maskedIPdata[val].srcIp.buckets, val2 => {
                internalMaskedIpArr.push({
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

          if (i === 0) { //alertThreatLevel
            if (data.aggregations) {
              _.forEach(SEVERITY_TYPE, val2 => { //Create Alert histogram for Emergency, Alert, Critical, Warning, Notice
                tempArr.push({
                  key: val2,
                  doc_count: data.aggregations[val2].doc_count
                });
              })
            }
          } else if (i === 1 || i === 4) { //InternalIp, Top10ExternalSrcCountry
            if (data.aggregations) {
              let chartData = [];

              if (data.aggregations[val.id]) {
                chartData = data.aggregations[val.id][val.key].buckets;
              }

              if (chartData.length > 0) {
                _.forEach(chartData, val2 => {
                  if (val2.key) { //Remove empty data
                    let newValue = val2.key;

                    if (newValue.length > 18) {
                      newValue = newValue.substr(0, 18) + '...';
                    }

                    tempArr.push({
                      key: newValue,
                      doc_count: val2.doc_count
                    });
                  }
                })
              }
            }
          } else if (i === 2) { //InternalMaskedIp
            if (data.aggregations) {
              const chartData = data.aggregations[val.id];

              _.forEach(_.keys(chartData), val2 => {
                if (val2 !== 'doc_count' && chartData[val2].doc_count) {
                  tempArr.push({
                    key: val2,
                    doc_count: chartData[val2].doc_count
                  });
                }
              })
            }
          } else {
            return;
          }
          tempAlertPieData[val.id] = tempArr;
        })

        this.setState({
          alertDataArr,
          internalMaskedIpArr,
          // internalMaskedIpArr: [{
          //   ip: "192.168.5.0/24",
          //   number: 2,
          //   severity: "Alert"
          // }],
          alertPieData: tempAlertPieData
        }, () => {
          this.getPieChartsData();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.loadPatternData();
    this.loadIvarData();
    this.loadSyslogData();
    this.loadDnsPieData();
    this.loadMetricData();
    this.loadHmdData();
  }
  /**
   * Construct and set the pattern data
   * @method
   */
  loadPatternData = () => {
    const {baseUrl, session} = this.context;
    const {datetime} = this.state;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    const url = `${baseUrl}/api/alert/pattern/histogram`;
    const requestData = {
      timestamp: [dateTime.from, dateTime.to],
      accountId: session.accountId
    };

    if (!session.accountId) {
      return;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        let alertPatternData = [];

        if (data.event_histogram) {
          _.forEach(data.event_histogram, (val, key) => {
            if (val.event_histogram.buckets.length > 0) {
              _.forEach(val.event_histogram.buckets, val2 => {
                if (val2.doc_count > 0) {
                  alertPatternData.push({
                    time: parseInt(moment(val2.key_as_string, 'YYYY-MM-DDTHH:mm:ss.SSZ').utc(true).format('x')),
                    count: val2.doc_count,
                    patternName: key
                  });
                }
              })
            }
          })
        }

        this.setState({
          alertPatternData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Redirect IVA link
   * @method
   */
  redirectIVA = (type) => {
    const {baseUrl, contextRoot, language} = this.context;
    const url = `${baseUrl}${contextRoot}/threats?iva=${type}&interval=24h&lng=${language}`;
    window.open(url, '_blank');
  }
  /**
   * Construct and set the IVAR data
   * @method
   */
  loadIvarData = () => {
    const {baseUrl} = this.context;
    const {datetime, ivar} = this.state;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };

    this.ah.one({
      url: `${baseUrl}/api/dashboard/iva?startDttm=${dateTime.from}&endDttm=${dateTime.to}`,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        let tempIvar = {...ivar};
        tempIvar.dataContent = [data];

        let dataFields = {};
        ivar.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: t(`dashboard.txt-${tempData}`),
            sortable: false,
            formatter: (value, allValue, i) => {
              return <span className='c-link' onClick={this.redirectIVA.bind(this, tempData)}>{value}</span>
            }
          };
        })

        tempIvar.dataFields = dataFields;

        this.setState({
          ivar: tempIvar
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Construct and set the syslog config chart
   * @method
   */
  loadSyslogData = () => {
    const {baseUrl} = this.context;
    const {datetime, syslogPieData} = this.state;
    const configSrcInfo = CHARTS_LIST[5];
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    const url = `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0&skipHistogram=true`;
    const requestData = {
      timestamp: [dateTime.from, dateTime.to],
      filters: [{
        condition: 'must',
        query: configSrcInfo.id
      }]
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      if (data.aggregations) {
        let configSrcData = [];
        let tempSyslogPieData = {...syslogPieData};

        if (data.aggregations[configSrcInfo.id]) {
          configSrcData = data.aggregations[configSrcInfo.id][configSrcInfo.path].buckets;
        }

        tempSyslogPieData[configSrcInfo.id] = configSrcData;

        this.setState({
          syslogPieData: tempSyslogPieData
        }, () => {
          this.getPieChartsData();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Construct and set the DNS chart
   * @method
   */
  loadDnsPieData = () => {
    const {baseUrl} = this.context;
    const {datetime, dnsPieData, dnsMetricData} = this.state;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    const url = `${baseUrl}/api/alert/dnsQuery?page=1&pageSize=0`;
    const requestData = {
      timestamp: [dateTime.from, dateTime.to]
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        const dnsInfo = CHARTS_LIST[6];
        let tempDnsPieData = {...dnsPieData};
        let tempDnsMetricData = {...dnsMetricData};
        tempDnsMetricData.data = [];

        if (data.aggregations) {
          let dnsQueryData = [];
          let dnsData = {};

          if (data.aggregations[dnsInfo.id]) {
            dnsQueryData = data.aggregations[dnsInfo.id][dnsInfo.path].buckets;
          }

          tempDnsPieData[dnsInfo.id] = dnsQueryData;

          if (data.aggregations.session_histogram) {
            dnsData = data.aggregations.session_histogram;

            tempDnsMetricData.data = [{
              doc_count: dnsData.doc_count,
              MegaPackages: dnsData.MegaPackages,
              MegaBytes: dnsData.MegaBytes
            }];
            tempDnsMetricData.agg = ['doc_count', 'MegaPackages', 'MegaBytes'];
            tempDnsMetricData.keyLabels = {
              doc_count: t('dashboard.txt-session'),
              MegaPackages: t('dashboard.txt-packet'),
              MegaBytes: t('dashboard.txt-databyte')
            };
          }
        }

        this.setState({
          dnsPieData: tempDnsPieData,
          dnsMetricData: tempDnsMetricData
        }, () => {
          this.getPieChartsData();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
    }, {showProgress: false})
    .then(data => {
      if (data) {
        data = data.rt;

        let validData = false;
        let tempDiskMetricData = {...this.state.diskMetricData};
        tempDiskMetricData.data = [{
          diskAvail: '',
          diskTotal: ''
        }];

        if (data['disk-avail'] && data['disk-avail'] >= 0) {
          tempDiskMetricData.data[0].diskAvail = data['disk-avail'];
          validData = true;
        }

        if (data['disk-total'] && data['disk-total'] >= 0) {
          tempDiskMetricData.data[0].diskTotal = data['disk-total'];
          validData = true;
        }

        if (validData) {
          tempDiskMetricData.agg = ['diskAvail', 'diskTotal'];
          tempDiskMetricData.keyLabels = {
            diskAvail: t('dashboard.txt-diskAvail'),
            diskTotal: t('dashboard.txt-diskTotal')
          };
        } else {
          tempDiskMetricData.data = [];
        }

        this.setState({
          diskMetricData: tempDiskMetricData
        });
      }
      return null;
    })
  }
  /**
   * Construct and set the HMD table chart
   * @method
   */
  loadHmdData = () => {
    const {baseUrl, contextRoot} = this.context;
    const {hmdData} = this.state;
    const apiArr = [
      {
        url: `${baseUrl}/api/lms/verifyOnline`,
        data: JSON.stringify({}),
        type: 'POST',
        contentType: 'text/plain'
      },
      {
        url: `${baseUrl}/api/dashboard/hmd`,
        type: 'GET'
      }
    ];

    this.ah.all(apiArr, {showProgress: false})
    .then(data => {
      if (data) {
        let lms = 'empty';

        if (data[0].expireDate) {
          lms = moment(data[0].expireDate, 'YYYYMMDD').format('YYYY-MM-DD');
        }

        let tempHmdData = {...hmdData};
        tempHmdData.data = [{
          hmd: data[1].hmd,
          max: data[1].max,
          hosts: data[1].hosts
        }];
        tempHmdData.agg = ['hmd', 'max', 'hosts'];
        tempHmdData.keyLabels = {
          hmd: t('dashboard.txt-hmd'),
          max: t('dashboard.txt-max'),
          hosts: t('dashboard.txt-hosts')
        };

        this.setState({
          hmdData: tempHmdData,
          lms
        });
      }
      return null;
    })
  }
  /**
   * Construct and set the pie charts
   * @method
   */
  getPieChartsData = () => {
    const {alertChartsList, alertPieData, syslogPieData, dnsPieData} = this.state;
    let tempAlertChartsList = [];

    _.forEach(alertChartsList, val => {
      if (val.chartID === 'alertThreatLevel') { //Handle special case for Alert Threat Level
        let chartData = null; //Data has not been loaded, show spinning icon
        let i = null;

        _.forEach(alertPieData.alertThreatLevel, val2 => {
          i = 'loop';

          if (val2.doc_count > 0) {
            i = 'data';
            return false;
          }
        })

        if (i) {
          if (i === 'data') {
            chartData = alertPieData[val.chartID]; //Data is found, show data
          } else if (i === 'loop') {
            chartData = []; //Data is not found, show not found message
          }
        }

        tempAlertChartsList.push({
          ...val,
          chartData
        });
      } else {
        let pieData = alertPieData[val.chartID];

        if (val.chartID === 'Top10SyslogConfigSource') {
          pieData = syslogPieData[val.chartID];
        } else if (val.chartID === 'dnsQuery') {
          pieData = dnsPieData[val.chartID];
        }

        tempAlertChartsList.push({
          ...val,
          chartData: pieData
        });
      }
    })

    this.setState({
      alertChartsList: tempAlertChartsList
    });
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
    const {baseUrl, contextRoot, language} = this.context;
    const severityChart = ['alertThreatLevel'];
    const ipChart = ['InternalIp', 'InternalMaskedIp', 'maskedIP'];
    const countryChart = ['Top10ExternalSrcCountry'];
    const syslogChart = ['Top10SyslogConfigSource'];
    let data = chartData[0].key;
    let type = '';

    if (_.includes(syslogChart, chartID)) {
      const url = `${baseUrl}${contextRoot}/events/syslog?configSource=${data}&interval=24h&lng=${language}`;
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

    const url = `${baseUrl}${contextRoot}/threats?type=${type}&data=${data}&interval=24h&lng=${language}`;
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
    const {alertChartsList, ivar} = this.state;

    if (alertChartsList[i].type === 'pie') {
      return (
        <div key={alertChartsList[i].chartID} className='chart-group'>
          {!alertChartsList[i].chartData &&
            <div className='empty-data'>
              <header>{alertChartsList[i].chartTitle}</header>
              <span><i className='fg fg-loading-2'></i></span>
            </div>
          }

          {(alertChartsList[i].chartData && alertChartsList[i].chartData.length === 0) &&
            <div className='empty-data'>
              <header>{alertChartsList[i].chartTitle}</header>
              <span>{t('txt-notFound')}</span>
            </div>
          }
          {alertChartsList[i].chartData && alertChartsList[i].chartData.length > 0 &&
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
          }
        </div>
      )
    } else if (alertChartsList[i].type === 'table') {
      return (
        <div key={alertChartsList[i].chartID} className='chart-group'>
          {!ivar.dataContent &&
            <div className='empty-data'>
              <header>{alertChartsList[i].chartTitle}</header>
              <span><i className='fg fg-loading-2'></i></span>
            </div>
          }
          {ivar.dataContent && ivar.dataContent.length === 0 &&
            <div className='empty-data'>
              <header>{alertChartsList[i].chartTitle}</header>
              <span>{t('txt-notFound')}</span>
            </div>
          }
          {ivar.dataContent && ivar.dataContent.length > 0 &&
            <div>
              <header className='main-header'>{alertChartsList[i].chartTitle}</header>
              <div id={alertChartsList[i].chartID} className='c-chart table'>
                <DataTable
                  className='main-table align-center ivr'
                  fields={ivar.dataFields}
                  data={ivar.dataContent} />
              </div>
            </div>
          }
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
  displayMetrics = (val, i) => {
    if (!val.data || (val.data && val.data.length === 0)) {
      const content = val.data ? t('txt-notFound') : <span><i className='fg fg-loading-2'></i></span>;

      return (
        <div key={val.id} className='c-chart dns-histogram'>
          <header>{t('dashboard.txt-' + val.id)}</header>
          <span className='show-empty'>{content}</span>
        </div>
      )
    } else if (val.data && val.data.length > 0) {
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
  /**
   * Display HMD metrics chart
   * @method
   * @returns HTML DOM
   */
  displayHmdData = () => {
    const {hmdData} = this.state;

    if (!hmdData.data || (hmdData.data && hmdData.data.length === 0)) {
      const content = hmdData.data ? t('txt-notFound') : <span><i className='fg fg-loading-2'></i></span>;

      return (
        <div className='c-chart hmd-info'>
          <header>HMD</header>
          <span className='show-empty'>{content}</span>
        </div>
      )
    } else if (hmdData.data && hmdData.data.length > 0) {
      return (
        <Metric
          className='hmd-info'
          title='HMD'
          data={hmdData.data}
          dataCfg={{
            agg: hmdData.agg
          }}
          keyLabels={hmdData.keyLabels} />
      )
    }
  }
  render() {
    const {
      datetime,
      alertDataArr,
      internalMaskedIpArr,
      alertChartsList,
      alertPatternData,
      dnsMetricData,
      diskMetricData,
      hmdData,
      lms
    } = this.state;

    return (
      <div>
        <div className='sub-header'>
          {helper.getDashboardMenu('statistics')}
          <span className='date-time'>{helper.getFormattedDate(datetime.from) + ' - ' + helper.getFormattedDate(datetime.to)}</span>
        </div>

        <div className='main-dashboard'>
          <div className='charts'>
            <div className='chart-group bar'>
              {!alertDataArr &&
                <div className='empty-data'>
                  <header>{t('dashboard.txt-alertStatistics')}</header>
                  <span><i className='fg fg-loading-2'></i></span>
                </div>
              }
              {alertDataArr && alertDataArr.length === 0 &&
                <div className='empty-data'>
                  <header>{t('dashboard.txt-alertStatistics')}</header>
                  <span>{t('txt-notFound')}</span>
                </div>
              }
              {alertDataArr && alertDataArr.length > 0 &&
                <BarChart
                  stacked
                  vertical
                  title={t('dashboard.txt-alertStatistics')}
                  data={alertDataArr}
                  colors={ALERT_LEVEL_COLORS}
                  dataCfg={{
                    x: 'time',
                    y: 'number',
                    splitSeries: 'rule'
                  }}
                  xAxis={{
                    type: 'datetime'
                  }}
                  plotOptions={{
                    series: {
                      maxPointWidth: 20
                    }
                  }}
                  tooltip={{
                    formatter: this.onTooltip.bind(this, 'barChart')
                  }} />
              }
            </div>

            <div className='chart-group bar'>
              {!internalMaskedIpArr &&
                <div className='empty-data'>
                  <header>{t('dashboard.txt-alertMaskedIpStatistics')}</header>
                  <span><i className='fg fg-loading-2'></i></span>
                </div>
              }
              {internalMaskedIpArr && internalMaskedIpArr.length === 0 &&
                <div className='empty-data'>
                  <header>{t('dashboard.txt-alertMaskedIpStatistics')}</header>
                  <span>{t('txt-notFound')}</span>
                </div>
              }
              {internalMaskedIpArr && internalMaskedIpArr.length > 0 &&
                <BarChart
                  stacked
                  vertical
                  title={t('dashboard.txt-alertMaskedIpStatistics')}
                  data={internalMaskedIpArr}
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
                  plotOptions={{
                    series: {
                      maxPointWidth: 20
                    }
                  }}
                  keyLabels={{
                    ip: 'IP',
                    number: t('txt-count'),
                    severity: t('txt-severity')
                  }}
                  onClick={this.getChartRedirect.bind(this, 'maskedIP')} />
              }
            </div>

            <div className='chart-group line'>
              {!alertPatternData &&
                <div className='empty-data'>
                  <header>{t('dashboard.txt-customAlertStat')}</header>
                  <span><i className='fg fg-loading-2'></i></span>
                </div>
              }
              {alertPatternData && alertPatternData.length === 0 &&
                <div className='empty-data'>
                  <header>{t('dashboard.txt-customAlertStat')}</header>
                  <span>{t('txt-notFound')}</span>
                </div>
              }
              {alertPatternData && alertPatternData.length > 0 &&
                <BarChart
                  stacked
                  vertical
                  title={t('dashboard.txt-customAlertStat')}
                  data={alertPatternData}
                  dataCfg={{
                    x: 'time',
                    y: 'count',
                    splitSeries: 'patternName'
                  }}
                  xAxis={{
                    type: 'datetime'
                  }}
                  plotOptions={{
                    series: {
                      maxPointWidth: 20
                    }
                  }}
                  tooltip={{
                    formatter: this.onTooltip.bind(this, 'lineChart')
                  }} />
              }
            </div>

            {alertChartsList.map(this.displayCharts)}

            <div className='chart-group'>
              {this.displayHmdData()}

              <div className='c-chart license-date'>
                <header>{l('l-license-expiry')}</header>
                {!lms &&
                  <span className='show-empty'><span><i className='fg fg-loading-2'></i></span></span>
                }
                {lms && lms === 'empty' &&
                  <span className='show-empty'>{t('txt-notFound')}</span>
                }
                {lms && lms !== 'empty' &&
                  <span className='show-empty date'>{lms}</span>
                }
              </div>
            </div>

            <div className='chart-group'>
              {[dnsMetricData, diskMetricData].map(this.displayMetrics)}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

DashboardStats.contextType = BaseDataContext;

DashboardStats.propTypes = {
};

export default withRouter(DashboardStats);