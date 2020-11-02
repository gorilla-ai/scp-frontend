import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import _ from 'lodash'

import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

const StyledTextField = withStyles({
  root: {
    backgroundColor: '#fff',
    '& .Mui-disabled': {
      backgroundColor: '#f2f2f2'
    }
  }
})(TextField);

function TextFieldComp(props) {
  return (
    <StyledTextField
      id={props.id}
      className={props.className}
      name={props.name}
      type={props.type}
      label={props.label}
      multiline={props.multiline}
      rows={props.rows}
      maxLength={props.maxLength}
      variant={props.variant}
      fullWidth={props.fullWidth}
      size={props.size}
      InputProps={props.InputProps}
      required={props.required}
      error={props.required}
      helperText={props.helperText}
      value={props.value}
      onChange={props.onChange}
      disabled={props.disabled} />
  )
}

/**
 * Config Inventory auto settings IP Range
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the IP range form
 */
class IpRange extends Component {
  constructor(props) {
    super(props);
  }
  /**
   * Set input value change
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
    const {activeContent, statusEnable, value} = this.props;

    return (
      <div className='group-content'>
        <StyledTextField
          className='ip-range'
          name='type'
          select
          variant='outlined'
          size='small'
          required={true}
          value={value.type}
          onChange={this.handleDataChange}
          disabled={activeContent === 'viewMode'}>
          <MenuItem value={'private'}>Private</MenuItem>
          <MenuItem value={'public'}>Public</MenuItem>
        </StyledTextField>
        <TextFieldComp
          className='ip-range'
          name='ip'
          variant='outlined'
          size='small'
          value={value.ip}
          onChange={this.handleDataChange}
          disabled={activeContent === 'viewMode'} />
        <TextFieldComp
          className='ip-range'
          name='mask'
          variant='outlined'
          size='small'
          value={value.mask}
          onChange={this.handleDataChange}
          disabled={activeContent === 'viewMode'} />
      </div>
    )
  }
}

IpRange.propTypes = {
  value: PropTypes.object.isRequired
};

export default IpRange;