import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import Autocomplete from '@material-ui/lab/Autocomplete'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'

let t = null;

/**
 * Search Filter
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component for the Host filter input
 */
class HostFilter extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
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
    const {activeFilter, vansDeviceStatusList} = this.props;
    let inputValue = event.target.value;

    if (activeFilter === 'status') {
      const selectedStatusIndex = _.findIndex(vansDeviceStatusList, { 'value': value.value });
      inputValue = vansDeviceStatusList[selectedStatusIndex];
    }

    this.props.onChange({
      ...this.props.value,
      [event.target.name]: inputValue
    });
  }
  render() {
    const {activeFilter, vansDeviceStatusList, value} = this.props;

    if (activeFilter === 'status') {
      return (
        <Autocomplete
          className='combo-box'
          options={vansDeviceStatusList}
          value={value.input}
          getOptionLabel={(option) => option.text}
          renderInput={this.renderStatusList}
          onChange={this.handleDataChange} />
      )
    } else if (activeFilter === 'annotation') {
      return (
        <TextareaAutosize
          className='textarea-autosize search-annotation'
          name='input'
          placeholder={t('host.txt-annotation')}
          value={value.input}
          onChange={this.handleDataChange} />
      )
    } else if (activeFilter === 'version') {
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
            onChange={this.handleDataChange}>
            {filterList}
          </TextField>
          <TextField
            name='input'
            clssName='condition-input'
            style={{float: 'left', width: '65%'}}
            label={t('ipFields.' + activeFilter)}
            variant='outlined'
            fullWidth
            size='small'
            value={value.input}
            onChange={this.handleDataChange} />
        </div>
      )
    } else {
      return (
        <TextField
          name='input'
          label={t('ipFields.' + activeFilter)}
          variant='outlined'
          fullWidth
          size='small'
          value={value.input}
          onChange={this.handleDataChange} />
      )
    }
  }
}

HostFilter.propTypes = {
  value: PropTypes.object.isRequired
};

export default HostFilter;