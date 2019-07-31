import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {HocFilterContent as FilterContent} from '../../common/filter-content'
import helper from '../../common/helper'
import {HocPagination as Pagination} from '../../common/pagination'
import {HocTimebarChart as TimebarChart} from '../../common/timebar-chart'
import VbdaLA from 'vbda-ui/build/src/components/analysis/la'

import withLocale from '../../../hoc/locale-provider'

let t = null;

class LinkAnalysis extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  render() {
    const {baseUrl, contextRoot, language, mainContentData, tabChartData, tableMouseOver} = this.props;
    const assetsPath = `${contextRoot}/lib/keylines/assets/`;
    let eventsData = {};

    if (mainContentData.activeTab === 'logs') {
      eventsData = mainContentData.logEventsData;
    } else {
      eventsData = mainContentData.mainEventsData;
    }

    return (
      <div className='la-content'>
        <FilterContent
          {...mainContentData} />

        <TimebarChart
          baseUrl={baseUrl}
          contextRoot={contextRoot}
          mainContentData={mainContentData}
          tabChartData={tabChartData}
          tableMouseOver={tableMouseOver} />

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
            pageSize={mainContentData.paginationPageSize}
            currentPage={mainContentData.paginationCurrentPage}
            onPageChange={this.props.mainContentData.paginationPageChange}
            onDropDownChange={this.props.mainContentData.paginationDropDownChange} />
        </footer>
      </div>
    )
  }
}

LinkAnalysis.propTypes = {
  mainContentData: PropTypes.object.isRequired,
  tabChartData: PropTypes.object.isRequired
};

export default withLocale(LinkAnalysis);