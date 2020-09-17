import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import Input from 'react-ui/build/src/components/input'

import helper from './helper'

let t = null;
let et = null;

/**
 * Input Path
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component for the input path
 */
class InputPath extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
  }
  /**
   * Set path input
   * @method
   * @param {string} value - input value
   */
  handleDataChange = (value) => {
    this.props.onChange({
      ...this.props.value,
      path: value
    });
  }
  render() {
    const {value} = this.props;

    return (
      <div className='path-input'>
        <Input
          required={true}
          validate={{
            t: et
          }}
          value={value.path}
          onChange={this.handleDataChange} />
      </div>
    )
  }
}

InputPath.propTypes = {
  value: PropTypes.object.isRequired
};

export default InputPath;