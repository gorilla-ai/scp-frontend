import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Tabs from 'react-ui/build/src/components/tabs'

import helper from '../../common/helper'
import {HocFilterContent as FilterContent} from '../../common/filter-content'
import TableContent from '../../common/table-content'
import {HocTree as Tree} from '../../common/tree'

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

        <div className='data-table'>
          <FilterContent
            {...mainContentData} />

          <Tabs
            id='subTabMenu'
            menu={mainContentData.subTabMenu}
            current={mainContentData.activeSubTab}
            onChange={mainContentData.handleSubTabChange}>
          </Tabs>

          <TableContent
            {...mainContentData} />
        </div>
      </div>
    )
  }
}

Certification.propTypes = {
  mainContentData: PropTypes.object.isRequired
};

export default Certification;