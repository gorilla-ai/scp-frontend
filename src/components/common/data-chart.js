import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import ButtonGroup from 'react-ui/build/src/components/button-group'

import {HocChartContent as ChartContent} from './chart-content'
import helper from './helper'
import withLocale from '../../hoc/locale-provider'

let t = null;

class DataChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: {}
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  componentDidMount() {
    this.getTimebarData();
  }
  componentDidUpdate = (prevProps) => {
    this.getTimebarData(prevProps);
  }
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
  setChartState = (chartData) => {
    this.setState({
      chartData
    });
  }
  getTimebarData = (prevProps) => {
    const {mainContentData, tabChartData, tableMouseOver} = this.props;
    const activeTab = mainContentData.activeTab;
    let chartData = '';

    if (!tableMouseOver) {
      if (activeTab === 'alert' || activeTab === 'logs') {
        chartData = tabChartData.chartData;
      } else if (activeTab === 'connections') {
        chartData = this.getHistogramType();
      }

      if (_.isEmpty(chartData)) {
        if (!_.isEmpty(this.state.chartData)) {
          this.setChartState({}, []);
        }
      } else {
        if (activeTab === 'alert' || activeTab === 'logs') {
          let combinedData = '';

          _.forEach(_.keys(chartData), val => {
            combinedData = _.assign({}, chartData[val]); //Combine chart object data for Alert
          })

          if (!prevProps || (prevProps && chartData !== prevProps.tabChartData.chartData)) {
            this.setChartState(chartData);
          }
        } else if (activeTab === 'connections') {
          let setChartState = false;

          if (!prevProps) { //For switching the Table view and LA/Map view
            setChartState = true;
          } else {
            if (tabChartData.chartTypeValue !== prevProps.tabChartData.chartTypeValue) { //For switching chart type
              setChartState = true;
            } else { //For switching chart interval
              if (tabChartData.chartTypeValue === 'connections') {
                if (chartData !== prevProps.tabChartData.sessionHistogram) {
                  setChartState = true;
                }
              } else if (tabChartData.chartTypeValue === 'packets') {
                if (chartData !== prevProps.tabChartData.packageHistogram) {
                  setChartState = true;
                }
              } else if (tabChartData.chartTypeValue === 'databytes') {
                if (chartData !== prevProps.tabChartData.byteHistogram) {
                  setChartState = true;
                }
              }
            }
          }

          if (setChartState) {
            this.setChartState(chartData);
          }
        }
      }
    }
  }
  render() {
    const {contextRoot, mainContentData, tabChartData, markData, tableMouseOver} = this.props;
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
          <div className='chart-content'>
            <button className='placeholder'></button>
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

DataChart.propTypes = {
  contextRoot: PropTypes.string.isRequired,
  mainContentData: PropTypes.object.isRequired,
  tabChartData: PropTypes.object.isRequired
};

const HocDataChart = withLocale(DataChart);
export { DataChart, HocDataChart };