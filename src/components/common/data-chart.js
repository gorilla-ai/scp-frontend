import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import {BaseDataContext} from './context';
import ChartContent from './chart-content'
import helper from './helper'

let t = null;

/**
 * Data Chart
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to set the chart data and display chart related content
 */
class DataChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: {}
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
   * Get chart data based on user selections
   * @method
   * @returns chart data object
   */
  getHistogramType = () => {
    const {tabChartData} = this.props;

    if (tabChartData.chartTypeValue == 'connections') {
      return tabChartData.sessionHistogram;
    } else if (tabChartData.chartTypeValue == 'packets') {
      return tabChartData.packageHistogram;
    } else if (tabChartData.chartTypeValue == 'databytes') {
      return tabChartData.byteHistogram;
    }
  }
  /**
   * Set chart data
   * @method
   * @param {object} chartData - chart data to be set
   */
  setChartData = (chartData) => {
    this.setState({
      chartData
    });
  }
  /**
   * Get chart data and handle the button clicks for chart options
   * @method
   * @param {object} prevProps - previous react props when the props have been updated
   */
  getChartData = (prevProps) => {
    const {mainContentData, tabChartData, tableMouseOver} = this.props;
    const activeTab = mainContentData.activeTab;
    let chartData = '';

    if (tableMouseOver) {
      return;
    }

    if (activeTab === 'alert' || activeTab === 'logs') {
      chartData = tabChartData.chartData;
    } else if (activeTab === 'connections') {
      chartData = this.getHistogramType();
    }

    if (_.isEmpty(chartData)) {
      if (!_.isEmpty(this.state.chartData)) {
        this.setChartData({}, []);
      }
    } else {
      if (activeTab === 'alert' || activeTab === 'logs') {
        let combinedData = '';

        _.forEach(_.keys(chartData), val => {
          combinedData = _.assign({}, chartData[val]); //Combine chart object data for Alert
        })

        if (!prevProps || (prevProps && chartData !== prevProps.tabChartData.chartData)) {
          this.setChartData(chartData);
        }
      } else if (activeTab === 'connections') {
        let setChartData = false;

        if (!prevProps) { //For switching the Table view and LA/Map view
          setChartData = true;
        } else {
          if (tabChartData.chartTypeValue !== prevProps.tabChartData.chartTypeValue) { //For switching chart type
            setChartData = true;
          } else { //For switching chart interval
            if (tabChartData.chartTypeValue === 'connections') {
              if (chartData !== prevProps.tabChartData.sessionHistogram) {
                setChartData = true;
              }
            } else if (tabChartData.chartTypeValue === 'packets') {
              if (chartData !== prevProps.tabChartData.packageHistogram) {
                setChartData = true;
              }
            } else if (tabChartData.chartTypeValue === 'databytes') {
              if (chartData !== prevProps.tabChartData.byteHistogram) {
                setChartData = true;
              }
            }
          }
        }

        if (setChartData) {
          this.setChartData(chartData);
        }
      }
    }
  }
  render() {
    const {mainContentData, tabChartData, markData, tableMouseOver} = this.props;
    const {chartData} = this.state;

    if (mainContentData.activeTab === 'connections') {
      return (
        <div className={cx('main-chart', {'active': mainContentData.showChart})}>
          <i className='fg fg-close' onClick={mainContentData.toggleChart} title={t('txt-close')}></i>
          <div className='chart-content interval-options'>
            <ToggleButtonGroup
              className='chart-btn'
              value={tabChartData.chartTypeValue}
              exclusive
              onChange={tabChartData.chartTypeChange}>
              <ToggleButton value='connections'>{t('txt-connections')}</ToggleButton>
              <ToggleButton value='packets'>{t('txt-packets')}</ToggleButton>
              <ToggleButton value='databytes'>{t('txt-databytes')}</ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              className='chart-btn'
              value={tabChartData.chartIntervalValue}
              exclusive
              onChange={tabChartData.chartIntervalChange}>
              <ToggleButton value='1m'>{t('time-interval.txt-1m')}</ToggleButton>
              <ToggleButton value='15m'>{t('time-interval.txt-15m')}</ToggleButton>
              <ToggleButton value='30m'>{t('time-interval.txt-30m')}</ToggleButton>
              <ToggleButton value='60m'>{t('time-interval.txt-60m')}</ToggleButton>
            </ToggleButtonGroup>
          </div>

          {chartData &&
            <ChartContent
              chartData={chartData}
              pageType={mainContentData.activeTab}
              tableMouseOver={tableMouseOver} />
          }
        </div>
      )
    } else {
      return (
        <div className={cx('main-chart', {'active': mainContentData.showChart})}>
          <i className='fg fg-close' onClick={mainContentData.toggleChart} title={t('txt-close')}></i>
          <div className='chart-content interval-options'>
            <ToggleButtonGroup
              className='chart-btn'
              value={mainContentData.chartIntervalValue}
              exclusive
              onChange={mainContentData.chartIntervalChange}>
              {mainContentData.chartIntervalList}
            </ToggleButtonGroup>
          </div>

          {tabChartData &&
            <ChartContent
              {...tabChartData}
              markData={markData}
              chartColors={mainContentData.chartColors}
              pageType={mainContentData.activeTab}
              tableMouseOver={tableMouseOver} />
          }
        </div>
      )
    }
  }
}

DataChart.contextType = BaseDataContext;

DataChart.propTypes = {
  mainContentData: PropTypes.object.isRequired,
  tabChartData: PropTypes.object.isRequired
};

export default DataChart;