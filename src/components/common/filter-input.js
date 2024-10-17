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
    const {page, queryType, logFields, filterData, inline} = this.props;
    let data = {};

    if (queryType === 'query') {
      data = {
        page,
        queryType,
        logFields
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

      if (page === 'logs') {
        if (logFields.length > 0) {
          data = {
            page,
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
          page
        };

        defaultFilter = {
          condition: 'must',
          query: ''
        };
      }

      return (
        <div className='filter-section'>
          <MultiInput
            className='filter-wrap'
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
  page: PropTypes.string,
  filterData: PropTypes.array.isRequired,
  inline: PropTypes.bool.isRequired,
  setFilterData: PropTypes.func
};

export default FilterInput;