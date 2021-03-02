import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import TextField from '@material-ui/core/TextField';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

import helper from './helper'

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
        <TextareaAutosize
          id='searchMarkInput'
          className='textarea-autosize mark-inputbox'
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