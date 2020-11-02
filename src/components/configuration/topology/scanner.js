import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import _ from 'lodash'

import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

let t = null;

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
 * Config Inventory auto settings Scanner
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the scanner form
 */
class Scanner extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Set input value change
   * @method
   * @param {string} field - input field
   * @param {string} value - input value
   */
  handleDataChange = (event) => {
    this.props.onChange({
      ...this.props.value,
      [event.target.name]: event.target.value
    });
  }
  render() {
    const {activeContent, statusEnable, deviceList, value} = this.props;

    return (
      <div className='group-content'>
        <StyledTextField
          className='scanner'
          name='edge'
          select
          variant='outlined'
          size='small'
          value={value.edge}
          onChange={this.handleDataChange}
          disabled={activeContent === 'viewMode' || !statusEnable.scanner}>
          {deviceList}
        </StyledTextField>
        <TextFieldComp
          className='scanner'
          name='ip'
          variant='outlined'
          size='small'
          value={value.ip}
          onChange={this.handleDataChange}
          disabled={activeContent === 'viewMode' || !statusEnable.scanner} />
        <TextFieldComp
          className='scanner'
          name='mask'
          variant='outlined'
          size='small'
          value={value.mask}
          onChange={this.handleDataChange}
          disabled={activeContent === 'viewMode' || !statusEnable.scanner} />
        <button onClick={this.props.handleScannerTest.bind(this, value)} disabled={!statusEnable.scanner || !value.edge}>{t('network-inventory.txt-testQuery')}</button>
      </div>
    )
  }
}

Scanner.propTypes = {

};

export default Scanner;