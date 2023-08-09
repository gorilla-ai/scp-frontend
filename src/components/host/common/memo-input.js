import React, { Component } from 'react'
import PropTypes from 'prop-types'

import TextField from '@material-ui/core/TextField'

let t = null;

/**
 * Memo Input
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component for the Host Endpoints memo input
 */
class MemoInput extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Set search filter input
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    this.props.onChange({
      ...this.props.value,
      input: event.target.value
    });
  }
  render() {
    const {value} = this.props;

    return (
      <TextField
        name='input'
        variant='outlined'
        fullWidth
        size='small'
        value={value.input || ''}
        onChange={this.handleDataChange}
        data-cy='hostEndpointsMemoTextField' />
    )
  }
}

MemoInput.propTypes = {
  value: PropTypes.object.isRequired
};

export default MemoInput;