import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import BarChart from 'react-chart/build/src/components/bar'
import LineChart from 'react-chart/build/src/components/line'

import helper from './helper'
import withLocale from '../../hoc/locale-provider'

let t = null;

/**
 * Chart Content
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the chart
 */
class ChartContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartAttributes: {}
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  componentDidMount() {
    this.getChartData();
  }
  componentDidUpdate(prevProps) {
    this.getChartData(prevProps);
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
        <span>{t('txt-severity')}: {data[0].rule}</span><br />
        <span>{t('txt-time')}: {Moment(data[0].time, 'x').utc().format('YYYY/MM/DD HH:mm:ss')}</span><br />
        <span>{t('txt-count')}: {data[0].number}</span>
      </section>
    )
  }
  /**
   * Construct and set the chart content
   * @method
   * @param {object} prevProps - previous react props when the props have been updated
   */
  getChartData = (prevProps) => {
    const {chartData, markData, chartColors, pageType, tableMouseOver} = this.props;
    let dataArr = [];
    let legend = {
      enabled: false
    };
    let dataCfg = {
      x: 'time',
      y: 'number'
    };
    let colorCode = {};

    if (tableMouseOver) {
      return;
    }

    if (markData) {
      _.forEach(markData, (val, i) => {
        colorCode[val.data] = helper.getColorList(i);
      })
    }

    if (pageType === 'connections') {
      dataArr = _.map(chartData, (value, key) => {
        return {
          time: parseInt(Moment(key, 'YYYY-MM-DDTHH:mm:ss.SSZ').utc(true).format('x')),
          number: value
        };
      });
    } else if (pageType === 'alert' || pageType === 'logs') {
      let rulesObj = {};
      let rulesAll = [];

      _.forEach(_.keys(chartData), val => { //Manually add rule name to the response data
        rulesObj[val] = _.map(chartData[val], (value, key) => {
          return {
            time: parseInt(Moment(key, 'YYYY-MM-DDTHH:mm:ss.SSZ').utc(true).format('x')),
            number: value,
            rule: val
          };
        });
      })

      _.forEach(_.keys(chartData), val => { //Push multiple rule arrays into a single array
        rulesAll.push(rulesObj[val]);
      })

      //Merge multiple arrays with different rules to a single array
      dataArr = rulesAll.reduce((accumulator, currentValue) => {
        return accumulator.concat(currentValue)
      }, []);

      legend.enabled = true;
      dataCfg.splitSeries = 'rule';

      if (pageType === 'alert') {
        colorCode = chartColors;
      }
    }

    const chartAttributes = {
      legend,
      data: dataArr,
      colors: colorCode,
      onTooltip: this.onTooltip,
      dataCfg,
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%H:%M'
        }
      }
    };

    if (!prevProps || (prevProps && chartData !== prevProps.chartData)) {
      this.setState({
        chartAttributes
      });
    }
  }
  /**
   * Display chart content
   * @method
   * @returns HTML DOM or BarChart/LineChart component
   */
  showChartContent = () => {
    const {pageType} = this.props;
    const {chartAttributes} = this.state;
    const dataCount = chartAttributes.data ? chartAttributes.data.length : 0;

    if (dataCount > 1000) {
      return <div className='error'>{t('events.connections.txt-chartExceedMaxMsg')}</div>
    }

    if (!_.isEmpty(chartAttributes)) {
      if (pageType === 'alert' || pageType === 'connections') {
        return (
          <BarChart
            stacked
            vertical
            className={cx('chart fixed', {'connections': pageType === 'connections'})}
            {...chartAttributes} />
        )
      }

      if (pageType === 'logs') {
        return (
          <LineChart
            vertical
            className='chart fixed'
            {...chartAttributes} />
        )
      }
    }
  }
  render() {
    return (
      <div className='bar-chart'>
        {this.showChartContent()}
      </div>
    )
  }
}

ChartContent.propTypes = {
  pageType: PropTypes.string.isRequired
};

const HocChartContent = withLocale(ChartContent);
export { ChartContent, HocChartContent };