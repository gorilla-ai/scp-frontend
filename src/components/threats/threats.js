import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'

import DataTable from 'react-ui/build/src/components/table'
import PieChart from 'react-chart/build/src/components/pie'

import DataChart from '../common/data-chart'
import FilterContent from '../common/filter-content'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'
import Tree from '../common/tree'

let t = null;

const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};

/**
 * Threats
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the threats page
 */
class Threats extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
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
    const alertChartsList = this.props.mainContentData.alertChartsList;

    if (alertChartsList[i].type === 'pie') {
      return (
        <div className='chart-group' key={alertChartsList[i].chartID}>
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
              onTooltip={this.onPieChartTooltip.bind(this, alertChartsList[i].chartKeyLabels)}
              colors={{
                key: ALERT_LEVEL_COLORS
              }} />
          }
        </div>
      )
    } else if (alertChartsList[i].type === 'table') {
      return (
        <div className='chart-group' key={alertChartsList[i].chartID}>
          {!alertChartsList[i].chartData &&
            <div className='empty-data'>
              <header>{alertChartsList[i].chartTitle}</header>
              <span><i className='fg fg-loading-2'></i></span>
            </div>
          }
          {alertChartsList[i].chartData && alertChartsList[i].chartData.length === 0 &&
            <div className='empty-data'>
              <header>{alertChartsList[i].chartTitle}</header>
              <span>{t('txt-notFound')}</span>
            </div>
          }
          {alertChartsList[i].chartData && alertChartsList[i].chartData.length > 0 &&
            <div>
              <header className='main-header'>{alertChartsList[i].chartTitle}</header>
              <div id={alertChartsList[i].chartID} className='c-chart table'>
                <DataTable
                  className='main-table overflow-scroll'
                  fields={alertChartsList[i].chartFields}
                  data={alertChartsList[i].chartData}
                  defaultSort={alertChartsList[i].chartData ? alertChartsList[i].sort : {}} />
              </div>
            </div>
          }
        </div>
      )
    }
  }
  /**
   * Display loading icon or table content
   * @method
   * @returns HTML DOM
   */
  renderTableContent = () => {
    const {mainContentData} = this.props;
    if (!mainContentData.threatsData.dataContent) {
      return (
        <div className='table-content'>
          <div className='table' style={{height: '78vh'}}>
            <span className='loading'><i className='fg fg-loading-2'></i></span>
          </div>
        </div>
      )
    }

    if (mainContentData.threatsData.dataContent.length > 0) {
      return (
        <MuiTableContent
          data={mainContentData.threatsData}
          tableOptions={mainContentData.tableOptions} />
      )
    }
  }
  renderTrackTableContent = () => {
    const {mainContentData} = this.props;

    if (!mainContentData.trackData.dataContent) {
      return (
        <div className='table-content'>
          <div className='table' style={{height: '78vh'}}>
            <span className='loading'><i className='fg fg-loading-2'></i></span>
          </div>
        </div>
      )
    }

    if (mainContentData.trackData.dataContent.length > 0) {
      return (
        <MuiTableContent
          data={mainContentData.trackData}
          tableOptions={mainContentData.tableOptions} />
      )
    }
  }
  render() {
    const {mainContentData, tabChartData} = this.props;
    const tabsMenu = _.map(mainContentData.subTabMenu, (val, key) => {
      return <Tab id={'threats' + helper.capitalizeFirstLetter(key) + 'Tab'} label={val} value={key} />
    });

    return (
      <div className='data-content'>
        <Tree
          {...mainContentData} />

        <div className='parent-content'>
          <FilterContent
            {...mainContentData} />

          <DataChart
            mainContentData={mainContentData}
            tabChartData={tabChartData} />

          <div className='main-content'>
            <Tabs
              indicatorColor='primary'
              textColor='primary'
              value={mainContentData.activeSubTab}
              onChange={mainContentData.handleSubTabChange}>
              {tabsMenu}
            </Tabs>

            {mainContentData.activeSubTab === 'table' &&
              this.renderTableContent()
            }

            {mainContentData.activeSubTab === 'trackTreats' &&
              this.renderTrackTableContent()
            }

            {mainContentData.activeSubTab === 'statistics' &&
              <div className='main-dashboard threats'>
                <div className='charts'>
                  {mainContentData.alertChartsList.map(this.displayCharts)}
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

Threats.propTypes = {
  mainContentData: PropTypes.object.isRequired,
  tabChartData: PropTypes.object.isRequired
};

export default Threats;