import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

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
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    this.props.onChange({
      ...this.props.value,
      [event.target.name]: event.target.value
    });
  }
  render() {
    const {queryType, activeTab, value} = this.props;
    const formStatus = queryType === 'query' ? true : false;
    const conditionList = ['Must', 'Must Not', 'Either'];
    const filterList = _.map(conditionList, (val, i) => {
      let formattedValue = val.toLowerCase();
      formattedValue = formattedValue.replace(' ', '_');
      return <MenuItem key={i} value={formattedValue}>{val}</MenuItem>
    });

    return (
      <div>
        <TextField
          name='condition'
          className='condition-select'
          select
          variant='outlined'
          fullWidth={true}
          size='small'
          value={value.condition}
          onChange={this.handleDataChange}
          disabled={formStatus}>
          {filterList}
        </TextField>
        <TextField
          name='query'
          className='filter-inputbox'
          multiline={true}
          variant='outlined'
          fullWidth={true}
          size='small'
          value={value.query}
          onChange={this.handleDataChange}
          disabled={formStatus} />
      </div>
    )
  }
}

SearchFilter.propTypes = {
  value: PropTypes.object.isRequired
};

export default SearchFilter;