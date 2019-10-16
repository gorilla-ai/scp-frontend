import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Tabs from 'react-ui/build/src/components/tabs'
import VbdaLA from 'vbda-ui/build/src/components/analysis/la'

import {HocFilterContent as FilterContent} from '../../common/filter-content'
import helper from '../../common/helper'
import {HocMarkContent as MarkContent} from '../../common/mark-content'
import {HocPagination as Pagination} from '../../common/pagination'
import TableContent from '../../common/table-content'
import {HocTimebarChart as TimebarChart} from '../../common/timebar-chart'
import {HocTree as Tree} from '../../common/tree'

class Syslog extends Component {
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

        <div className='parent-content'>
          <FilterContent
            {...mainContentData} />

          <MarkContent
            {...mainContentData} />

          <div className='main-content'>
            <Tabs
              className='subtab-menu'
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
                    paginationOptions={[
                      {value: 500, text: '500'},
                      {value: 1000, text: '1000'},
                      {value: 2000, text: '2000'},
                      {value: 5000, text: '5000'}
                    ]}
                    totalCount={mainContentData.paginationTotalCount}
                    pageSize={mainContentData.paginationAlertPageSize}
                    currentPage={mainContentData.paginationCurrentPage}
                    onPageChange={mainContentData.paginationAlertPageChange.bind(this, 'la')}
                    onDropDownChange={mainContentData.paginationAlertDropDownChange.bind(this, 'la')} />
                </footer>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

Syslog.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  mainContentData: PropTypes.object.isRequired,
  tabChartData: PropTypes.object.isRequired,
  markData: PropTypes.array.isRequired,
  tableMouseOver: PropTypes.bool.isRequired
};

export default Syslog;