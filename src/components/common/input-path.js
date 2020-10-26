import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import TextField from '@material-ui/core/TextField';

import helper from './helper'

let t = null;
let et = null;

const StyledTextField = withStyles({
  root: {
    backgroundColor: '#fff'
  }
})(TextField);

function TextFieldComp(props) {
  return (
    <StyledTextField
      name={props.name}
      variant={props.variant}
      fullWidth={props.fullWidth}
      size={props.size}
      value={props.value}
      onChange={props.onChange} />
  )
}

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
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    const dataType = event.target.name === 'processKeyword' ? 'keyword' : 'path';

    this.props.onChange({
      ...this.props.value,
      [dataType]: event.target.value
    });
  }
  render() {
    const {scanType, listType, value} = this.props;
    const dataType = listType === 'processKeyword' ? 'keyword' : 'path';
    let inputProps = {
      name: listType,
      variant: 'outlined',
      fullWidth: true,
      size: 'small',
      value: value[dataType],
      onChange: this.handleDataChange
    };

    if (scanType === 'fileIntegrity' && listType === 'includePath') {
      inputProps = {
        ...inputProps,
        required: true
      };
    }

    return (
      <div className={cx('path-input', {'short': listType === 'processKeyword'})}>
        <TextFieldComp
          {...inputProps} />
      </div>
    )
  }
}

InputPath.propTypes = {
  value: PropTypes.object.isRequired
};

export default InputPath;