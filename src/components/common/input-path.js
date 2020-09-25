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
   * Set data input
   * @method
   * @param {string} listType - list data type
   * @param {string} value - input value
   */
  handleDataChange = (listType, value) => {
    const dataType = listType === 'processKeyword' ? 'keyword' : 'path';

    this.props.onChange({
      ...this.props.value,
      [dataType]: value
    });
  }
  render() {
    const {scanType, listType, value} = this.props;
    const dataType = listType === 'processKeyword' ? 'keyword' : 'path';

    let inputProps = {
      value: value[dataType],
      onChange: this.handleDataChange.bind(this, listType)
    };

    if (scanType === 'fileIntegrity' && listType === 'includePath') {
      inputProps = {
        ...inputProps,
        required: true,
        validate: {
          t: et
        }
      };
    }

    return (
      <div className={cx('path-input', {'short': listType === 'processKeyword'})}>
        <Input
          {...inputProps} />
      </div>
    )
  }
}

InputPath.propTypes = {
  value: PropTypes.object.isRequired
};

export default InputPath;