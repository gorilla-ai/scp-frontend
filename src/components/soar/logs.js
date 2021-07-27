import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

/**
 * Config Inventory auto settings IP Range
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
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
    const {activeContent, value} = this.props;

    return (
      <div className='group-content'>
        <TextField
          name='type'
          className='ip-range'
          select
          variant='outlined'
          size='small'
          required
          value={value.type}
          onChange={this.handleDataChange}
          disabled={activeContent === 'viewMode'}>
          <MenuItem value={'private'}>Private</MenuItem>
          <MenuItem value={'public'}>Public</MenuItem>
        </TextField>
        <TextField
          name='ip'
          className='ip-range'
          variant='outlined'
          size='small'
          value={value.ip}
          onChange={this.handleDataChange}
          disabled={activeContent === 'viewMode'} />
        <TextField
          name='mask'
          className='ip-range'
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
  activeContent: PropTypes.string.isRequired,
  value: PropTypes.object.isRequired
};

export default IpRange;