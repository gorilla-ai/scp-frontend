import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

let t = null;

/**
 * Config Inventory auto settings Scanner
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
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
  handleDataChange = (event) => {
    this.props.onChange({
      ...this.props.value,
      [event.target.name]: event.target.value
    });
  }
  render() {
    const {activeContent, statusEnable, deviceList, value} = this.props;

    return (
      <div className='group-content'>
        <TextField
          className='scanner'
          name='edge'
          select
          variant='outlined'
          size='small'
          value={value.edge}
          onChange={this.handleDataChange}
          disabled={activeContent === 'viewMode' || !statusEnable.scanner}>
          {deviceList}
        </TextField>
        <TextField
          className='scanner'
          name='ip'
          variant='outlined'
          size='small'
          value={value.ip}
          onChange={this.handleDataChange}
          disabled={activeContent === 'viewMode' || !statusEnable.scanner} />
        <TextField
          className='scanner'
          name='mask'
          variant='outlined'
          size='small'
          value={value.mask}
          onChange={this.handleDataChange}
          disabled={activeContent === 'viewMode' || !statusEnable.scanner} />
        <Button variant='contained' color='primary' onClick={this.props.handleScannerTest.bind(this, value)} disabled={!statusEnable.scanner || !value.edge}>{t('network-inventory.txt-testQuery')}</Button>
      </div>
    )
  }
}

Scanner.propTypes = {

};

export default Scanner;