import React, { Component } from 'react'
import PropTypes from 'prop-types'

import MultiInput from 'react-ui/build/src/components/multi-input'

import SearchFilter from './search-filter'

class Filter extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {activeTab, queryType, searchFields, logFields, filterData, inline} = this.props;
    let data = {};

    if (queryType === 'query') {
      data = {
        activeTab,
        searchFields,
        logFields,
        queryType
      };

      return (
        <MultiInput
          className='main-filter-group'
          base={SearchFilter}
          inline={inline}
          props={data}
          value={filterData} />
      )
    } else {
      let defaultFilter = {};

      if (activeTab === 'logs') {
        if (logFields.length > 0) {
          data = {
            activeTab,
            searchFields,
            logFields
          };

          defaultFilter = {
            condition: 'Must',
            query: '',
            color: 'red'
          };
        }
      } else {
        data = {
          activeTab,
          searchFields: this.props.searchFields
        };

        defaultFilter = {
          condition: 'Must',
          query: ''
        };
      }

      return (
        <div className='filter-section'>
          <MultiInput
            className='filter-warp'
            base={SearchFilter}
            inline={inline}
            props={data}
            defaultItemValue={defaultFilter}
            onChange={this.props.setFilterData}
            value={filterData} />
        </div>
      )
    }
  }
}

Filter.propTypes = {
  activeTab: PropTypes.string.isRequired,
  filterData: PropTypes.array.isRequired,
  inline: PropTypes.bool.isRequired
};

export default Filter;