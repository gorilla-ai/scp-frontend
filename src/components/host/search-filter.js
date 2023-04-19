import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

let t = null;
let f = null;

/**
 * Dashboard Filter
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component for the search filter input
 */
class SerchFilter extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
  }
  /**
   * Set search filter input
   * @method
   * @param {object} event - event object
   * @param {object} [value] - selected info
   */
  handleDataChange = (event, value) => {
    const {activeFilter} = this.props;
    let inputValue = event.target.value;

    this.props.onChange({
      ...this.props.value,
      input: inputValue
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
    const {pageType, activeFilter, value} = this.props;
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
          onChange={this.handleConditionChange}>
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
          onChange={this.handleDataChange} />
      </div>
    )
  }
}

SerchFilter.propTypes = {
  value: PropTypes.object.isRequired
};

export default SerchFilter;