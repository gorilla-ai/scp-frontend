import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import ButtonGroup from 'react-ui/build/src/components/button-group'

import {BaseDataContext} from './context';
import {HocChartContent as ChartContent} from './chart-content'
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
    const {contextRoot} = this.context;
    const {mainContentData, tabChartData, markData, tableMouseOver} = this.props;
    const {chartData} = this.state;
    const assetsPath = `${contextRoot}/lib/keylines/assets/`;

    if (mainContentData.activeTab === 'connections') {
      return (
        <div className={cx('main-chart', {'active': mainContentData.showChart})}>
          <i className='fg fg-close' onClick={mainContentData.toggleChart} title={t('txt-close')}></i>
          <div className='chart-content connections'>
            <ButtonGroup
              id='chartType'
              className='chart-btn'
              list={[
                {value: 'connections', text: t('txt-connections')},
                {value: 'packets', text: t('txt-packets')},
                {value: 'databytes', text: t('txt-databytes')}
              ]}
              onChange={tabChartData.chartTypeChange}
              value={tabChartData.chartTypeValue} />
            <ButtonGroup
              id='chartType'
              className='interval-btn'
              list={[
                {value: '1m', text: t('events.connections.txt-connections1m')},
                {value: '15m', text: t('events.connections.txt-connections15m')},
                {value: '30m', text: t('events.connections.txt-connections30m')},
                {value: '60m', text: t('events.connections.txt-connections60m')}
              ]}
              onChange={tabChartData.chartIntervalChange}
              value={tabChartData.chartIntervalValue} />
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

const HocDataChart = DataChart;
export { DataChart, HocDataChart };