import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import {HocDataChart as DataChart} from '../common/data-chart'
import {HocFilterContent as FilterContent} from '../common/filter-content'
import helper from '../common/helper'
import TableContent from '../common/table-content'
import {HocTree as Tree} from '../common/tree'
import withLocale from '../../hoc/locale-provider'

let t = null;

let initialLoad = false;

/**
 * Threats
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the threats page
 */
class Threats extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  render() {
    const {mainContentData, tabChartData} = this.props;

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
            <header className='main-header'>{t('alert.txt-alertList')}</header>
            <TableContent
              {...mainContentData} />
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