import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

let t = null;
let f = null;

/**
 * Search Filter
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component for the search filter input
 */
class SearchFilter extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
  }
  /**
   * Set search filter input
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    this.props.onChange({
      ...this.props.value,
      input: event.target.value
    });
  }
  /**
   * Set condition filter input
   * @method
   * @param {object} event - event object
   */
  handleConditionChange = (event) => {
    this.props.onChange({
      ...this.props.value,
      condition: event.target.value
    });
  }
  render() {
    const {pageType, activeFilter, searchType, value} = this.props;
    const conditionList = ['>', '=', '<'];
    const filterList = _.map(conditionList, (val, i) => {
      let formattedValue = val.toLowerCase();
      formattedValue = formattedValue.replace(' ', '_');
      return <MenuItem key={i} value={formattedValue}>{val}</MenuItem>
    });
    let label = '';

    if (pageType === 'dashboard') {
      label = f('hostDashboardFields.' + activeFilter);
    } else if (pageType === 'inventory') {
      label = f('hostCpeFields.' + activeFilter);
    }

    if (searchType === 'input') {
      return (
        <TextField
          name='input'
          label={label}
          variant='outlined'
          fullWidth
          size='small'
          value={value.input || ''}
          onChange={this.handleDataChange}
          data-cy='hostSearchFilterTextField' />
      )
    } else if (searchType === 'condition_input') {
      return (
        <div>
          <TextField
            name='condition'
            className='condition-select'
            style={{float: 'left', width: '30%', marginRight: '3%'}}
            select
            variant='outlined'
            fullWidth
            size='small'
            value={value.condition}
            onChange={this.handleConditionChange}
            data-cy='hostSearchFilterConditionTextField'>
            {filterList}
          </TextField>
          <TextField
            name='input'
            clssName='condition-input'
            style={{float: 'left', width: '65%'}}
            label={label}
            variant='outlined'
            fullWidth
            size='small'
            value={value.input || ''}
            onChange={this.handleDataChange}
            data-cy='hostSearchFilterDataTextField' />
        </div>
      )
    }
  }
}

SearchFilter.propTypes = {
  value: PropTypes.object.isRequired
};

export default SearchFilter;