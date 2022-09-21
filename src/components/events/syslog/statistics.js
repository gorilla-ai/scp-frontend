import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import BarChart from 'react-chart/build/src/components/bar'
import DataTable from 'react-ui/build/src/components/table'
import PieChart from 'react-chart/build/src/components/pie'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

/**
 * Events Syslog Statistics
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Events Syslog statistics page
 */
class Statistics extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartType: 'pieChart' //'pieChart' or 'barChart'
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  /**
   * Handle input value change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }
  /**
   * Show pie chart
   * @method
   * @returns HTML DOM
   */
  showPieChart = () => {
    const {mainContentData} = this.props;

    return (
      <div className='chart-group'>
        {mainContentData.statisticsData.data.length === 0 &&
          <div className='empty-data'>
            <header>{t('events.txt-statisticsPieChart')}</header>
            <span>{t('txt-notFound')}</span>
          </div>
        }
        {mainContentData.statisticsData.data.length > 0 &&
          <PieChart
            title={t('events.txt-statisticsPieChart')}
            data={mainContentData.statisticsData.data}
            keyLabels={{
              key: mainContentData.statisticsData.column,
              doc_count: t('txt-count')
            }}
            valueLabels={{
              'Pie Chart': {
                key: mainContentData.statisticsData.column,
                doc_count: t('txt-count')
              }
            }}
            dataCfg={{
              splitSlice: ['key'],
              sliceSize: 'doc_count'
            }} />
        }
      </div>
    )
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
        <span>{this.props.mainContentData.statisticsData.column}: {data[0].key}<br /></span>
        <span>{t('txt-count')}: {helper.numberWithCommas(data[0].doc_count)}</span>
      </section>
    )
  }
  /**
   * Show bar chart
   * @method
   * @returns HTML DOM
   */
  showBarChart = () => {
    const {mainContentData} = this.props;

    return (
      <div className='chart-group'>
        {mainContentData.statisticsData.data.length === 0 &&
          <div className='empty-data'>
            <header>{t('events.txt-statisticsBarChart')}</header>
            <span>{t('txt-notFound')}</span>
          </div>
        }
        {mainContentData.statisticsData.data.length > 0 &&
          <BarChart
            stacked
            vertical
            title={t('events.txt-statisticsBarChart')}
            legend={{
              enabled: true
            }}
            data={mainContentData.statisticsData.data}
            dataCfg={{
              x: 'key',
              y: 'doc_count'
            }}
            xAxis={{
              type: 'category'
            }}
            plotOptions={{
              series: {
                maxPointWidth: 20
              }
            }}
            tooltip={{
              formatter: this.onTooltip
            }} />
        }
      </div>
    )
  }
  /**
   * Show table chart
   * @method
   * @returns HTML DOM
   */
  showTableChart = () => {
    const {mainContentData} = this.props;

    return (
      <div className='chart-group'>
        {mainContentData.statisticsData.data.length === 0 &&
          <div className='empty-data'>
            <header>{t('events.txt-statisticsTableChart')}</header>
            <span>{t('txt-notFound')}</span>
          </div>
        }

        {mainContentData.statisticsData.data.length > 0 &&
          <div>
            <header className='main-header'>{t('events.txt-statisticsTableChart')}</header>
            <div className='c-chart table'>
              <DataTable
                className='main-table overflow-scroll'
                fields={mainContentData.statisticsTableChart.dataFields}
                data={mainContentData.statisticsTableChart.dataContent}
                defaultSort={mainContentData.statisticsTableChart.dataContent ? mainContentData.statisticsTableChart.sort : {}} />
            </div>
          </div>
        }
      </div>
    )
  }
  render() {
    const {mainContentData} = this.props;
    const {chartType} = this.state;

    return (
      <div className='events-syslog-statistics'>
        <div className='filter-section'>
          <TextField
            id='syslogStatisticsColumn'
            className='input-field'
            name='column'
            label={t('events.txt-statisticField')}
            variant='outlined'
            size='small'
            value={mainContentData.statisticsData.column}
            onChange={mainContentData.handleStatisticsDataChange}>
          </TextField>
          <TextField
            id='syslogStatisticsPageSize'
            className='input-field count'
            name='pageSize'
            label={t('events.txt-statisticsCount')}
            type='number'
            InputProps={{ inputProps: { min: 1 } }}
            variant='outlined'
            size='small'
            value={mainContentData.statisticsData.pageSize}
            onChange={mainContentData.handleStatisticsDataChange} />
          <Button variant='contained' color='primary' className='btn' onClick={mainContentData.handleSearchSubmit.bind(this, 'statistics')}>{t('events.txt-generateCharts')}</Button>
          <TextField
            id='syslogStatisticsChartType'
            className='input-field'
            name='chartType'
            select
            variant='outlined'
            size='small'
            value={chartType}
            onChange={this.handleDataChange}>
            <MenuItem value='pieChart'>{t('txt-chartTypePie')}</MenuItem>
            <MenuItem value='barChart'>{t('txt-chartTypeBar')}</MenuItem>
          </TextField>
          <Button variant='contained' color='primary' className='btn export' onClick={mainContentData.getStatisticsExport}>{t('txt-export')}</Button>
        </div>

        <div className='main-statistics'>
          <div className='statistics-content'>
            {mainContentData.statisticsData.data && mainContentData.statisticsData.data.length >= 0 && chartType ==='pieChart' &&
              this.showPieChart()
            }
            {mainContentData.statisticsData.data && mainContentData.statisticsData.data.length >= 0 && chartType ==='barChart' &&
              this.showBarChart()
            }
            {mainContentData.statisticsData.data && mainContentData.statisticsData.data.length >= 0 &&
              this.showTableChart()
            }
          </div>
        </div>
      </div>
    )
  }
}

Statistics.contextType = BaseDataContext;

Statistics.propTypes = {
  mainContentData: PropTypes.object.isRequired
};

export default Statistics;