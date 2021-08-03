import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

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
  ryan = () => {}
  /**
   * Set search filter input
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
    const {activeFilter, value} = this.props;

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

HostFilter.propTypes = {
  value: PropTypes.object.isRequired
};

export default HostFilter;