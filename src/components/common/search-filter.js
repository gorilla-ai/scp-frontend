import React, { Component } from 'react'
import PropTypes from 'prop-types'

import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'

/**
 * Search Filter
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
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
    const {queryType, value} = this.props;
    const formStatus = queryType === 'query' ? true : false;
    const conditionList = ['Must', 'Must Not', 'Either'];
    const filterList = _.map(conditionList, (val, i) => {
      let formattedValue = val.toLowerCase();
      formattedValue = formattedValue.replace(' ', '_');
      return <MenuItem id={'searchFilter' + val.replace(' ', '')} key={i} value={formattedValue}>{val}</MenuItem>
    });

    return (
      <div>
        <TextField
          name='condition'
          id='searchFilterDropdown'
          className='condition-select'
          select
          variant='outlined'
          fullWidth
          size='small'
          value={value.condition}
          onChange={this.handleDataChange}
          disabled={formStatus}>
          {filterList}
        </TextField>
        <TextareaAutosize
          name='query'
          id='searchFilterInput'
          className='textarea-autosize filter-inputbox'
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