import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'

/**
 * Search Filter
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component for the search filter multi input (filter-input.js)
 */
class SearchFilter extends Component {
  constructor(props) {
    super(props);
  }
  /**
   * Set search filter input
   * @method
   * @param {string} field - input type ('condition' or 'query')
   * @param {string} value - input value
   * @returns none
   */
  handleDataChange = (field, value) => {
    this.props.onChange({
      ...this.props.value,
      [field]: value
    });
  }
  render() {
    const {queryType, value} = this.props;
    const conditionList = ['Must', 'Must Not', 'Either'];
    const formStatus = queryType === 'query' ? true : false;
    const filterList = _.map(conditionList, val => {
      let formattedValue = val.toLowerCase();
      formattedValue = formattedValue.replace(' ', '_');

      return {
        value: formattedValue,
        text: val
      };
    });

    return (
      <div>
        <DropDownList
          className='condition-select'
          list={filterList}
          required={true}
          onChange={this.handleDataChange.bind(this, 'condition')}
          value={value.condition}
          disabled={formStatus} />
        <Input
          className='filter-inputbox'
          onChange={this.handleDataChange.bind(this, 'query')}
          value={value.query}
          disabled={formStatus} />
      </div>
    )
  }
}

SearchFilter.propTypes = {
  value: PropTypes.object.isRequired
};

export default SearchFilter;