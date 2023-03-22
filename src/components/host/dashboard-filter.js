import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Autocomplete from '@material-ui/lab/Autocomplete'
import MenuItem from '@material-ui/core/MenuItem'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

let t = null;
let f = null;

/**
 * Dashboard Filter
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component for the Dashboard filter input
 */
class DashboardFilter extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
  }
  /**
   * Display status list
   * @method
   * @param {object} params - parameters for Autocomplete
   * @returns TextField component
   */
  renderStatusList = (params) => {
    return (
      <TextField
        {...params}
        label={t('host.txt-status')}
        variant='outlined'
        size='small' />
    )
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
    const {activeFilter, value} = this.props;
    const conditionList = ['>', '=', '<'];
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
          label={f('hostDashboardFields.' + activeFilter)}
          variant='outlined'
          fullWidth
          size='small'
          value={value.input || ''}
          onChange={this.handleDataChange} />
      </div>
    )
  }
}

DashboardFilter.propTypes = {
  value: PropTypes.object.isRequired
};

export default DashboardFilter;