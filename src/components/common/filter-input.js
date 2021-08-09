import React, { Component } from 'react'
import PropTypes from 'prop-types'

import MultiInput from 'react-ui/build/src/components/multi-input'

import SearchFilter from './search-filter'

/**
 * Filter Input
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the individual filter input
 */
class FilterInput extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {activeTab, queryType, logFields, filterData, inline} = this.props;
    let data = {};

    if (queryType === 'query') {
      data = {
        activeTab,
        logFields,queryType
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
            logFields
          };

          defaultFilter = {
            condition: 'must',
            query: '',
            color: 'red'
          };
        }
      } else {
        data = {
          activeTab
        };

        defaultFilter = {
          condition: 'must',
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
            value={filterData}
            onChange={this.props.setFilterData} />
        </div>
      )
    }
  }
}

FilterInput.propTypes = {
  activeTab: PropTypes.string.isRequired,
  filterData: PropTypes.array.isRequired,
  inline: PropTypes.bool.isRequired,
  setFilterData: PropTypes.func
};

export default FilterInput;