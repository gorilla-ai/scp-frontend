import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import TextField from '@material-ui/core/TextField'

import helper from '../common/helper'

let t = null;
let et = null;

/**
 * SOAR Request Headers
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component for the SOAR request headers
 */
class RequestHeaders extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
  }
  componentDidMount() {
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
    const {value} = this.props;

    return (
      <div className='group-content request-headers'>
        <TextField
          id='requestHeadersHeader'
          className='request-field'
          name='header'
          label='Header'
          variant='outlined'
          size='small'
          value={value.header}
          onChange={this.handleDataChange} />
        <TextField
          id='requestHeadersValue'
          className='request-field'
          name='value'
          label='Value'
          variant='outlined'
          size='small'
          value={value.value}
          onChange={this.handleDataChange} />
      </div>
    )
  }
}

RequestHeaders.propTypes = {
  value: PropTypes.array.isRequired
};

export default RequestHeaders;