import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import Timebar from 'react-timebar/build/src/components'

import {HocFilterContent as FilterContent} from '../common/filter-content'
import helper from '../common/helper'
import TableContent from '../common/table-content'
import {HocTimebarChart as TimebarChart} from '../common/timebar-chart'
import {HocTree as Tree} from '../common/tree'

import withLocale from '../../hoc/locale-provider'

let t = null;

let initialLoad = false;

class Alert extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  render() {
    const {baseUrl, contextRoot, language, chartsID, mainContentData, tabChartData, tableMouseOver} = this.props;
    const assetsPath = `${contextRoot}/lib/keylines/assets/`;

    return (
      <div className='data-content'>
        <Tree
          {...mainContentData} />

        <div className='parent-content'>
          <FilterContent
            {...mainContentData} />

          <TimebarChart
            contextRoot={contextRoot}
            mainContentData={mainContentData}
            tabChartData={tabChartData}
            tableMouseOver={tableMouseOver} />

          <div className='main-content'>
            <header className='main-header'>{t('alert.txt-alertList')}</header>
            <TableContent
              {...mainContentData}
              withPointer={true} />
          </div>
        </div>
      </div>
    )
  }
}

Alert.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  chartsID: PropTypes.array.isRequired,
  mainContentData: PropTypes.object.isRequired,
  tabChartData: PropTypes.object.isRequired,
  tableMouseOver: PropTypes.bool.isRequired
};

export default withLocale(Alert);