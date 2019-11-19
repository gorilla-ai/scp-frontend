import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Tabs from 'react-ui/build/src/components/tabs'

import {HocFilterContent as FilterContent} from '../../../common/filter-content'
import helper from '../../../common/helper'
import TableContent from '../../../common/table-content'
import {HocTree as Tree} from '../../../common/tree'

/**
 * Events Netflow DNS
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Netflow DNS
 */
class Dns extends Component {
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

Dns.propTypes = {
  mainContentData: PropTypes.object.isRequired
};

export default Dns;