import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Tabs from 'react-ui/build/src/components/tabs'

import FilterContent from '../../../common/filter-content'
import helper from '../../../common/helper'
import TableContent from '../../../common/table-content'
import Tree from '../../../common/tree'

/**
 * Events Netflow Certification
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Netflow Certification
 */
class Certification extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {mainContentData} = this.props;

    return (
      <div className='data-content'>
        <Tree
          {...mainContentData} />

        <div className='parent-content'>
          <FilterContent
            {...mainContentData} />

          <div className='main-content'>
            <Tabs
              className='subtab-menu'
              menu={mainContentData.subTabMenu}
              current={mainContentData.activeSubTab}
              onChange={mainContentData.handleSubTabChange}>
            </Tabs>

            <TableContent
              {...mainContentData} />
          </div>
        </div>
      </div>
    )
  }
}

Certification.propTypes = {
  mainContentData: PropTypes.object.isRequired
};

export default Certification;