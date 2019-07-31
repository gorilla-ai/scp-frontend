import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Tabs from 'react-ui/build/src/components/tabs'

import {HocFilterContent as FilterContent} from '../../common/filter-content'
import helper from '../../common/helper'
import {HocMarkContent as MarkContent} from '../../common/mark-content'
import TableContent from '../../common/table-content'
import {HocPagination as Pagination} from '../../common/pagination'
import {HocTimebarChart as TimebarChart} from '../../common/timebar-chart'
import {HocTree as Tree} from '../../common/tree'
import VbdaLA from 'vbda-ui/build/src/components/analysis/la'

class Log extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {baseUrl, contextRoot, language, mainContentData, tabChartData, markData, tableMouseOver} = this.props;
    const assetsPath = `${contextRoot}/lib/keylines/assets/`;
    const eventsData = mainContentData.logEventsData;

    return (
      <div className='data-content'>
        <Tree
          {...mainContentData} />

        <div className='data-table'>
          <FilterContent
            {...mainContentData} />

          <MarkContent
            {...mainContentData} />

          <Tabs
            id='subTabMenu'
            menu={mainContentData.subTabMenu}
            current={mainContentData.activeSubTab}
            onChange={mainContentData.handleSubTabChange}>
          </Tabs>

          <TimebarChart
            contextRoot={contextRoot}
            mainContentData={mainContentData}
            tabChartData={tabChartData}
            markData={markData}
            tableMouseOver={tableMouseOver} />

          {mainContentData.activeSubTab === 'table' &&
            <TableContent
              {...mainContentData} />
          }

          {mainContentData.activeSubTab === 'linkAnalysis' &&
            <div className='la-content'>
              <VbdaLA
                assetsPath={assetsPath}
                sourceCfg={mainContentData.LAconfig}
                events={eventsData}
                source={mainContentData.LAdata}
                sourceItemOptions={mainContentData.LAconfig.la}
                lng={language} />

              <footer>
                <Pagination
                  activeTab={mainContentData.activeTab}
                  page='linkAnalysis'
                  totalCount={mainContentData.paginationTotalCount}
                  pageSize='500'
                  currentPage={mainContentData.paginationCurrentPage}
                  onPageChange={mainContentData.paginationAlertPageChange.bind(this, 'la')}
                  onDropDownChange={mainContentData.paginationAlertDropDownChange.bind(this, 'la')} />
              </footer>
            </div>
          }
        </div>
      </div>
    )
  }
}

Log.propTypes = {
  mainContentData: PropTypes.object.isRequired,
  tabChartData: PropTypes.object.isRequired
};

export default Log;