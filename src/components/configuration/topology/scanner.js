import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'

class Scanner extends Component {
  constructor(props) {
    super(props);
  }
  handleChange(field, value) {
    this.props.onChange({
      ...this.props.value,
      [field]: value
    });
  }
  render() {
    const {statusEnable, deviceList, value} = this.props;

    return (
      <div className='group-content'>
        <DropDownList
          required={true}
          onChange={this.handleChange.bind(this, 'edge')}
          list={deviceList}
          value={value.edge}
          disabled={!statusEnable.scanner} />
        <Input
          onChange={this.handleChange.bind(this, 'ip')}
          value={value.ip}
          disabled={!statusEnable.scanner} />
        <Input
          onChange={this.handleChange.bind(this, 'mask')}
          value={value.mask}
          disabled={!statusEnable.scanner} />
        <button onClick={this.props.handleScannerTest.bind(this, value)} disabled={!statusEnable.scanner}>Test Query</button>
      </div>
    )
  }
}

Scanner.propTypes = {
  value: PropTypes.object.isRequired
};

export default Scanner;