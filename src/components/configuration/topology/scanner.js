import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button';
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
  ryan = () => {

  }
  /**
   * Set input value change
   * @method
   * @param {string} field - input field
   * @param {string} value - input value
   */
  handleDataChange = (event) => {
    const {type, edgeDataValue} = this.props;

    this.props.setEdgeData(type, edgeDataValue, {
      ...this.props.value,
      [event.target.name]: event.target.value
    });
  }
  render() {
    const {activeContent, statusEnable, type, value} = this.props;

    return (
      <div className='group-content'>
        <label id='scannerLabel'>
          <span style={{width: this.props.getInputWidth('scanner')}}>IP</span>
          {type === 'target' &&
            <span style={{width: this.props.getInputWidth('scanner')}}>Mask</span>
          }
          {type === 'switch' &&
            <span style={{width: this.props.getInputWidth('scanner')}}>Community</span>
          }
        </label>
        {type === 'target' &&
          <TextField
            className='scanner'
            name='target'
            variant='outlined'
            size='small'
            value={value.target}
            onChange={this.handleDataChange}
            disabled={activeContent === 'viewMode' || !statusEnable.scanner} />
        }
        {type === 'switch' &&
          <TextField
            className='scanner'
            name='host'
            variant='outlined'
            size='small'
            value={value.host}
            onChange={this.handleDataChange}
            disabled={activeContent === 'viewMode' || !statusEnable.scanner} />
        }
        {type === 'target' &&
          <TextField
            className='scanner'
            name='mask'
            variant='outlined'
            size='small'
            value={value.mask}
            onChange={this.handleDataChange}
            disabled={activeContent === 'viewMode' || !statusEnable.scanner} />
        }
        {type === 'switch' &&
          <TextField
            className='scanner'
            name='community'
            variant='outlined'
            size='small'
            value={value.community}
            onChange={this.handleDataChange}
            disabled={activeContent === 'viewMode' || !statusEnable.scanner} />
        }
        {/*<Button variant='contained' color='primary' onClick={this.props.handleScannerTest.bind(this, value)} disabled={!statusEnable.scanner || !value.edge}>{t('network-inventory.txt-testQuery')}</Button>*/}
      </div>
    )
  }
}

Scanner.propTypes = {

};

export default Scanner;