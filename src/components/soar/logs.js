import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import TextareaAutosize from "@material-ui/core/TextareaAutosize";

/**
 * SOAR Logs page
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the logs
 */
class Log extends Component {
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
        <TextareaAutosize
          style={{width: '25rem'}}
          name='log'
          id='searchFilterInput'
          aria-label="minimum height" minRows={5}
          className='textarea-autosize filter-inputbox'
          value={value.log}
          onChange={this.handleDataChange}
          disabled={activeContent === 'viewMode'} />
      </div>
    )
  }
}

Log.propTypes = {
  activeContent: PropTypes.string.isRequired,
  value: PropTypes.object.isRequired
};

export default Log;