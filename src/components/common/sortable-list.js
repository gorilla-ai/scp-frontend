import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {SortableContainer} from 'react-sortable-hoc'

import SortableItem from '../common/sortable-item'

/**
 * Sortable List
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the data with detail information
 */
class SortableList extends Component {
  constructor(props) {
    super(props);
  }
  /**
   * Show data with sortable functionality
   * @method
   * @param {object} value - data value to be displayed
   * @param {number} index - index of the sortable data array
   * @returns SortableItem component
   */
  showTableSort = (value, index) => {
    return (
      <SortableItem
        key={index}
        index={index}
        activeTab={this.props.activeTab}
        value={value}
        getCustomFieldName={this.props.getCustomFieldName}
        setFieldsChange={this.props.setFieldsChange}
        checkDisplayFields={this.props.checkDisplayFields}
        handleOpenQueryMenu={this.props.handleOpenQueryMenu}
        toggleLocaleEdit={this.props.toggleLocaleEdit} />
    )
  }
  render() {
    const {items} = this.props;

    return (
      <ul className='table-sort'>
        {items.length > 0 &&
          items.map(this.showTableSort)
        }
      </ul>
    )
  }
}

SortableList.propTypes = {
  activeTab: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  setFieldsChange: PropTypes.func.isRequired,
  checkDisplayFields: PropTypes.func.isRequired,
  handleOpenQueryMenu: PropTypes.func.isRequired,
  toggleLocaleEdit: PropTypes.func.toggleLocaleEdit
};

export default SortableContainer(SortableList);