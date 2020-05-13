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
          list={deviceList}
          value={value.edge}
          onChange={this.handleDataChange.bind(this, 'edge')}
          readOnly={activeContent === 'viewMode' || !statusEnable.scanner} />
        <Input
          value={value.ip}
          onChange={this.handleDataChange.bind(this, 'ip')}
          readOnly={activeContent === 'viewMode' || !statusEnable.scanner} />
        <Input
          value={value.mask}
          onChange={this.handleDataChange.bind(this, 'mask')}
          readOnly={activeContent === 'viewMode' || !statusEnable.scanner} />
        <button onClick={this.props.handleScannerTest.bind(this, value)} disabled={!statusEnable.scanner || !value.edge}>{t('network-inventory.txt-testQuery')}</button>
      </div>
    )
  }
}

Scanner.propTypes = {

};

export default Scanner;