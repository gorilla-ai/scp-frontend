import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'

class SearchFilter extends Component {
  constructor(props) {
    super(props);
  }
  handleChange(field, value) {
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
      }
    });

    return (
      <div>
        <DropDownList
          className='condition-select'
          list={filterList}
          required={true}
          onChange={this.handleChange.bind(this, 'condition')}
          value={value.condition}
          disabled={formStatus} />
        <Input
          className='filter-inputbox'
          onChange={this.handleChange.bind(this, 'query')}
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