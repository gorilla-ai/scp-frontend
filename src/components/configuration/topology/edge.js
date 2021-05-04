import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import MultiInput from 'react-ui/build/src/components/multi-input'

import Scanner from './scanner'

let t = null;

/**
 * Config Inventory Edge
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Edge group
 */
class Edge extends Component {
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
    this.props.onChange({
      ...this.props.value,
      edge: event.target.value
    });
  }
  render() {
    const {activeContent, statusEnable, deviceList, edgeData, value} = this.props;
    const data = {
      activeContent,
      statusEnable,
      deviceList,
      getInputWidth: this.props.getInputWidth,
      handleScannerTest: this.props.handleScannerTest,
      setScannerData: this.props.setScannerData
    };

    return (
      <div className='group-content edge'>
        <Button variant='contained' color='primary' className='network-test' onClick={this.props.handleNetworkTest.bind(this, value.index)}>{t('network-inventory.txt-testQuery')}</Button>
        <label id='scannerLabel' htmlFor='autoSettingsEdge'>
          <span style={{width: this.props.getInputWidth('scanner')}}>Edge</span>
        </label>
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

        <div className='target'>
          <div className='header'>Target</div>
          <MultiInput
            id='autoSettingsScanner'
            className='scanner-group'
            base={Scanner}
            props={{
              ...data,
              type: 'target'
            }}
            defaultItemValue={{
              ip: '',
              mask: ''
            }}
            value={value.target}
            onChange={this.props.setEdgeData.bind(this, 'target', value)}
            handleScannertest={this.handleScannerTest}
            disabled={activeContent === 'viewMode'} />
        </div>

        <div className='switch'>
          <div className='header'>Switch</div>
          <MultiInput
            id='autoSettingsScanner'
            className='scanner-group'
            base={Scanner}
            props={{
              ...data,
              type: 'switch'
            }}
            defaultItemValue={{
              ip: '',
              mask: ''
            }}
            value={value.switch}
            onChange={this.props.setEdgeData.bind(this, 'switch', value)}
            handleScannertest={this.handleScannerTest}
            disabled={activeContent === 'viewMode'} />
        </div>
      </div>
    )
  }
}

Edge.propTypes = {

};

export default Edge;