import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import VbdaLA from 'vbda-ui/build/src/components/analysis/la'

import {BaseDataContext} from '../../common/context';
import DataChart from '../../common/data-chart'
import FilterContent from '../../common/filter-content'
import helper from '../../common/helper'
import MarkContent from '../../common/mark-content'
import MuiTableContent from '../../common/mui-table-content'
import Pagination from '../../common/pagination'
//import TableContent from '../../common/table-content'
import Tree from '../../common/tree'

/**
 * Events Syslog
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Events Syslog
 */
class Syslog extends Component {
  constructor(props) {
    super(props);
  }
  /**
   * Display loading icon or table content
   * @method
   * @returns HTML DOM
   */
  renderTableContent = () => {
    const {mainContentData} = this.props;

    if (!mainContentData.syslogData.dataContent) {
      return (
        <div className='table-content'>
          <div className='table' style={{height: '78vh'}}>
            <span className='loading'><i className='fg fg-loading-2'></i></span>
          </div>
        </div>
      )
    }

    if (mainContentData.syslogData.dataContent.length > 0) {
      return (
        <MuiTableContent
          data={mainContentData.syslogData}
          tableOptions={mainContentData.tableOptions} />
      )
    }
  }
  render() {
    const {contextRoot, language} = this.context;
    const {mainContentData, tabChartData, markData, tableMouseOver} = this.props;
    const assetsPath = `${contextRoot}/lib/keylines/assets/`;
    const tabsMenu = _.map(mainContentData.subTabMenu, (val, key) => {
      return <Tab label={val} value={key} />
    });

    return (
      <div className='data-content'>
        <Tree
          {...mainContentData} />

        <div className='parent-content'>
          <FilterContent
            {...mainContentData} />

          <MarkContent
            {...mainContentData} />

          <DataChart
            mainContentData={mainContentData}
            tabChartData={tabChartData}
            markData={markData}
            tableMouseOver={tableMouseOver} />

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

            {mainContentData.activeSubTab === 'linkAnalysis' &&
              <div className='la-content'>
                <VbdaLA
                  assetsPath={assetsPath}
                  sourceCfg={mainContentData.LAdata.LAconfig}
                  events={mainContentData.LAdata.logEventsData}
                  source={mainContentData.LAdata.dataContent}
                  sourceItemOptions={mainContentData.LAdata.LAconfig.la}
                  lng={language} />

                <footer>
                  <Pagination
                    paginationOptions={[
                      {value: 500, text: '500'},
                      {value: 1000, text: '1000'},
                      {value: 2000, text: '2000'},
                      {value: 5000, text: '5000'}
                    ]}
                    totalCount={mainContentData.LAdata.totalCount}
                    pageSize={mainContentData.LAdata.pageSize}
                    currentPage={mainContentData.LAdata.currentPage}
                    onPageChange={mainContentData.handleLaPageChange.bind(this, 'currentPage')}
                    onDropDownChange={mainContentData.handleLaPageChange.bind(this, 'pageSize')} />
                </footer>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

Syslog.contextType = BaseDataContext;

Syslog.propTypes = {
  mainContentData: PropTypes.object.isRequired,
  tabChartData: PropTypes.object.isRequired,
  markData: PropTypes.array.isRequired
};

export default Syslog;