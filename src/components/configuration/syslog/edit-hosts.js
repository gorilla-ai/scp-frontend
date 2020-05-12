import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Input from 'react-ui/build/src/components/input'

let t = null

/**
 * Service Status
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to edit host
 */
class EditHosts extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Set edit host input
   * @method
   * @param {string} field - input field
   * @param {string} value - input value
   */
  handleDataChange = (field, value) => {
    this.props.onChange({
      [field]: value
    });
  }
  /**
   * Input validation
   * @method
   * @param {array} code - error code
   * @returns error message
   */
  getErrorMsg = (code, {value, pattern}) => {
    if (code[0] === 'no-match') {
      return t('network-topology.txt-ipValidationFail');
    }
  }
  render() {
    return (
      <Input
        className='edit-hosts-inputbox'
        validate={{
          pattern: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
          patternReadable: 'xxx.xxx.xxx.xxx',
          t: this.getErrorMsg
        }}
        value={this.props.value.host}
        onChange={this.handleDataChange.bind(this, 'host')} />
    )
  }
}

EditHosts.propTypes = {
}

export default EditHosts