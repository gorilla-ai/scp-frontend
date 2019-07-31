import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {SortableContainer} from 'react-sortable-hoc'

import {HocSortableItem as SortableItem} from '../common/sortable-item'

import withLocale from '../../hoc/locale-provider'

class SortableList extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {items, activeTab, getCustomFieldName, setFieldsChange, checkDisplayFields, showQueryOptions, toggleLocaleEdit} = this.props;

    return (
      <ul className='table-sort'>
        {
          items.map(function(value, index) {
            return (
              <SortableItem
                key={index}
                index={index}
                activeTab={activeTab}
                value={value}
                getCustomFieldName={getCustomFieldName}
                setFieldsChange={setFieldsChange}
                checkDisplayFields={checkDisplayFields}
                showQueryOptions={showQueryOptions}
                toggleLocaleEdit={toggleLocaleEdit} />
            )
          })
        }
      </ul>
    )
  }
}

SortableList.propTypes = {
};

const HocSortableList = withLocale(SortableContainer(SortableList));
export { SortableList, HocSortableList };