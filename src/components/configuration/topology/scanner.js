import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'

let t = null;

/**
 * Config Inventory auto settings Scanner
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the scanner form
 */
class Scanner extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Set input value change
   * @method
   * @param {string} field - input field
   * @param {string} value - input value
   * @returns none
   */
  handleDataChange = (field, value) => {
    this.props.onChange({
      ...this.props.value,
      [field]: value
    });
  }
  render() {
    const {activeContent, statusEnable, deviceList, value} = this.props;

    return (
      <div className='group-content'>
        <DropDownList
          required={true}
          onChange={this.handleDataChange.bind(this, 'edge')}
          list={deviceList}
          value={value.edge}
          readOnly={activeContent === 'viewMode' || !statusEnable.scanner} />
        <Input
          onChange={this.handleDataChange.bind(this, 'ip')}
          value={value.ip}
          readOnly={activeContent === 'viewMode' || !statusEnable.scanner} />
        <Input
          onChange={this.handleDataChange.bind(this, 'mask')}
          value={value.mask}
          readOnly={activeContent === 'viewMode' || !statusEnable.scanner} />
        <button onClick={this.props.handleScannerTest.bind(this, value)} disabled={!statusEnable.scanner}>{t('network-inventory.txt-testQuery')}</button>
      </div>
    )
  }
}

Scanner.propTypes = {
  value: PropTypes.object.isRequired
};

export default Scanner;