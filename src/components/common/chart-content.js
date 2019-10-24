import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import BarChart from 'react-chart/build/src/components/bar'
import LineChart from 'react-chart/build/src/components/line'

import helper from './helper'
import withLocale from '../../hoc/locale-provider'

let t = null;

class ChartContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartAttributes: {}
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  componentDidMount = () => {
    this.getChartData();
  }
  componentDidUpdate = (prevProps) => {
    this.getChartData(prevProps);
  }
  /**
   * Call corresponding Alert data based on conditions
   * @param {object} eventInfo - event info for the mouseover
   * @param {object} data - data info to show for tooltip
   * @returns none
   */
  getText = (eventInfo, data) => {
    let text = '';

    if (data[0].rule) {
      text += data[0].rule + ': ';
    }

    text += data[0].number + ' ' + t('txt-at') + ' ' + Moment(data[0].time, 'x').utc().format('YYYY/MM/DD HH:mm:ss');
    return text;
  }
  /**
   * Show tooltip info when mouseover
   * @param {object} eventInfo - event info for the mouseover
   * @param {object} data - data info to show for tooltip
   * @returns none
   */
  onTooltip = (eventInfo, data) => {
    return (
      <div>
        <div>{this.getText(eventInfo, data)}</div>
      </div>
    )
  }
  /**
   * Load data for chart content
   * @param {object} prevProps - previous props when the props have been updated
   * @returns none
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

    if (!tableMouseOver) {
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
  }
  render() {
    const {pageType} = this.props;
    const {chartAttributes} = this.state;
    const dataCount = chartAttributes.data ? chartAttributes.data.length : 0;

    return (
      <div className='bar-chart'>
        {pageType === 'connections' && dataCount > 1000 &&
          <div className='error'>{t('events.connections.txt-chartExceedMaxMsg')}</div>
        }

        {pageType === 'logs' && !_.isEmpty(chartAttributes) &&
          <LineChart
            vertical
            className='chart fixed'
            {...chartAttributes} />
        }

        {pageType === 'connections' && !_.isEmpty(chartAttributes) && dataCount <= 1000 &&
          <BarChart
            stacked
            vertical
            className={cx('chart fixed', {'connections': pageType === 'connections'})}
            {...chartAttributes} />
        }

        {pageType !== 'logs' && pageType !== 'connections' && !_.isEmpty(chartAttributes) &&
          <BarChart
            stacked
            vertical
            className={cx('chart fixed', {'connections': pageType === 'connections'})}
            {...chartAttributes} />
        }
      </div>
    )
  }
}

ChartContent.propTypes = {
  pageType: PropTypes.string.isRequired
};

const HocChartContent = withLocale(ChartContent);
export { ChartContent, HocChartContent };