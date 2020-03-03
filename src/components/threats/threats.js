import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import DataTable from 'react-ui/build/src/components/table'
import PieChart from 'react-chart/build/src/components/pie'
import Tabs from 'react-ui/build/src/components/tabs'

import {HocDataChart as DataChart} from '../common/data-chart'
import {HocFilterContent as FilterContent} from '../common/filter-content'
import helper from '../common/helper'
import TableContent from '../common/table-content'
import {HocTree as Tree} from '../common/tree'
import withLocale from '../../hoc/locale-provider'

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
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the threats page
 */
class Threats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alertCharts: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  componentDidMount() {
    this.setAlertCharts();
  }
  componentDidUpdate(prevProps) {
    if (prevProps && this.props.mainContentData.alertChartsList !== prevProps.mainContentData.alertChartsList) {
      this.setAlertCharts();
    }
  }
  ryan = () => {

  }
  setAlertCharts = () => {
    this.setState({
      alertCharts: this.props.mainContentData.alertChartsList
    });
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
    const {alertCharts} = this.state;

    if (alertCharts[i].type === 'pie') {
      return (
        <div className='chart-group c-box' key={alertCharts[i].chartID}>
          {!alertCharts[i].chartData &&
            <div className='empty-data'>
              <header>{alertCharts[i].chartTitle}</header>
              <span><i className='fg fg-loading-2'></i></span>
            </div>
          }

          {(alertCharts[i].chartData && alertCharts[i].chartData.length === 0) &&
            <div className='empty-data'>
              <header>{alertCharts[i].chartTitle}</header>
              <span>{t('txt-notFound')}</span>
            </div>
          }
          {alertCharts[i].chartData && alertCharts[i].chartData.length > 0 &&
            <PieChart
              id={alertCharts[i].chartID}
              title={alertCharts[i].chartTitle}
              data={alertCharts[i].chartData}
              keyLabels={alertCharts[i].chartKeyLabels}
              valueLabels={alertCharts[i].chartValueLabels}
              dataCfg={alertCharts[i].chartDataCfg}
              onTooltip={this.onPieChartTooltip.bind(this, alertCharts[i].chartKeyLabels)}
              colors={{
                key: ALERT_LEVEL_COLORS
              }} />
          }
        </div>
      )
    } else if (alertCharts[i].type === 'table') {
      return (
        <div className='chart-group' key={alertCharts[i].chartID}>
          <header className='main-header'>{alertCharts[i].chartTitle}</header>
          <div id={alertCharts[i].chartID} className='c-chart table'>
            <DataTable
              className='main-table overflow-scroll'
              fields={alertCharts[i].chartFields}
              data={alertCharts[i].chartData}
              defaultSort={alertCharts[i].chartData ? alertCharts[i].sort : {}} />
          </div>
        </div>
      )
    }
  }  
  render() {
    const {mainContentData, tabChartData} = this.props;
    const {alertCharts} = this.state;

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
              className='subtab-menu'
              menu={mainContentData.subTabMenu}
              current={mainContentData.activeSubTab}
              onChange={mainContentData.handleSubTabChange}>
            </Tabs>

            {mainContentData.activeSubTab === 'table' &&
              <TableContent
                {...mainContentData} />
            }

            {mainContentData.activeSubTab === 'statistics' &&
              <div className='main-dashboard threats'>
                <div className='charts'>
                  {alertCharts.map(this.displayCharts)}
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

export default withLocale(Threats);