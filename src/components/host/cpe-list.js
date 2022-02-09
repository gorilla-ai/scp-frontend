import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

let t = null;

/**
 * Host HMD Settings CPE list
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the CPE list group
 */
class CpeList extends Component {
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
    const {activeContent, fieldEnable, value} = this.props;

    return (
      <div className='group-content'>
        <TextField
          className='cpe-list-input'
          name='cpe'
          variant='outlined'
          size='small'
          error={!value.validate}
          helperText={value.msg}
          value={value.cpe}
          onChange={this.handleDataChange}
          disabled={!fieldEnable.security} />
      </div>
    )
  }
}

CpeList.propTypes = {

};

export default CpeList;