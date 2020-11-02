import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import TextField from '@material-ui/core/TextField';

import helper from './helper'

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
 * Search Filter
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component for the search mark multi input (mark-input.js)
 */
class SearchMark extends Component {
  constructor(props) {
    super(props);
  }
  /**
   * Set search mark input
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    const {markData} = this.props;
    let index = '';

    _.forEach(markData, (val, i) => {
      if (val.data === '') {
        index = i;
      }
    })

    this.props.onChange({
      data: event.target.value.trim(),
      color: helper.getColor(index)
    });
  }
  render() {
    const {value, queryType} = this.props;
    const formStatus = queryType === 'query' ? true : false;
    const inputValue = typeof value.data === 'object' ? value.data.data : value.data;  

    return (
      <div>
        <i className={'c-link fg fg-recode ' + value.color}></i>
        <TextFieldComp
          className='mark-inputbox'
          variant='outlined'
          fullWidth={true}
          size='small'
          value={inputValue}
          onChange={this.handleDataChange}
          disabled={formStatus} />
      </div>
    )
  }
}

SearchMark.propTypes = {
  value: PropTypes.object.isRequired
};

export default SearchMark;