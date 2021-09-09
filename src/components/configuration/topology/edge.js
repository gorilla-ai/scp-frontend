import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

import MultiInput from 'react-ui/build/src/components/multi-input'

import NetworkTopology from './network-topology'

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
  /**
   * Check if all input data is available
   * @method
   * @param {object} data - edge data
   * @returns valid true/false
   */
  checkValidData = (data) => {
    let valid = true;

    if (!data.edge) {
      valid = false;
    } else {
      _.forEach(data.networkTopoData.target, val => {
        if (!val.ip || !val.mask) {
          valid = false;
          return;
        }
      })

      _.forEach(data.networkTopoData.switch, val => {
        if (!val.ip || !val.mask) {
          valid = false;
          return;
        }
      })
    }

    return !valid;
  }
  render() {
    const {activeContent, statusEnable, deviceList, value} = this.props;
    const data = {
      activeContent,
      statusEnable,
      getInputWidth: this.props.getInputWidth,
      showMessage: this.props.showMessage
    };

    return (
      <div className='group-content edge'>
        {activeContent === 'editMode' &&
          <Button variant='contained' color='primary' className='network-test' onClick={this.props.showMessage.bind(this, value.index)} disabled={this.checkValidData(value)}>{t('network-inventory.txt-testQuery')}</Button>
        }
        <label id='scannerLabel' htmlFor='autoSettingsNetworkTarget'>
          <span style={{width: this.props.getInputWidth('networkTopology')}}>Edge</span>
        </label>
        <TextField
          className='scanner'
          name='edge'
          select
          variant='outlined'
          size='small'
          value={value.edge}
          onChange={this.handleDataChange}
          disabled={activeContent === 'viewMode' || !statusEnable.networkTopology}>
          {deviceList}
        </TextField>

        <div className='target'>
          <div className='header'>Target</div>
          <MultiInput
            id='autoSettingsNetworkTarget'
            className='scanner-group'
            base={NetworkTopology}
            props={{
              ...data,
              type: 'target'
            }}
            defaultItemValue={{
              ip: '',
              mask: ''
            }}
            value={value.networkTopoData.target}
            onChange={this.props.setEdgeData.bind(this, 'target', value)}
            disabled={activeContent === 'viewMode'} />
        </div>

        <div className='switch'>
          <div className='header'>Switch</div>
          <MultiInput
            id='autoSettingsNetworkTarget'
            className='scanner-group'
            base={NetworkTopology}
            props={{
              ...data,
              type: 'switch'
            }}
            defaultItemValue={{
              ip: '',
              mask: ''
            }}
            value={value.networkTopoData.switch}
            onChange={this.props.setEdgeData.bind(this, 'switch', value)}
            disabled={activeContent === 'viewMode'} />
        </div>
      </div>
    )
  }
}

Edge.propTypes = {

};

export default Edge;