import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {SortableContainer} from 'react-sortable-hoc'

import {HocSortableItem as SortableItem} from '../common/sortable-item'
import withLocale from '../../hoc/locale-provider'

class SortableList extends Component {
  constructor(props) {
    super(props);
  }
  showTableSort = (value, index) => {
    const {activeTab} = this.props;

    return (
      <SortableItem
        key={index}
        index={index}
        activeTab={activeTab}
        value={value}
        getCustomFieldName={this.props.getCustomFieldName}
        setFieldsChange={this.props.setFieldsChange}
        checkDisplayFields={this.props.checkDisplayFields}
        showQueryOptions={this.props.showQueryOptions}
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
  showQueryOptions: PropTypes.func.isRequired
};

const HocSortableList = withLocale(SortableContainer(SortableList));
export { SortableList, HocSortableList };