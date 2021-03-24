import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import FilterContent from '../../../common/filter-content'
import helper from '../../../common/helper'
import TableContent from '../../../common/table-content'
import Tree from '../../../common/tree'

/**
 * Events Netflow HTML
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Netflow HTML
 */
class Html extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {mainContentData} = this.props;
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

          <div className='main-content'>
            <Tabs
              indicatorColor='primary'
              textColor='primary'
              value={mainContentData.activeSubTab}
              onChange={mainContentData.handleSubTabChange}>
              {tabsMenu}
            </Tabs>

            <TableContent
              {...mainContentData} />
          </div>
        </div>
      </div>
    )
  }
}

Html.propTypes = {
  mainContentData: PropTypes.object.isRequired
};

export default Html;