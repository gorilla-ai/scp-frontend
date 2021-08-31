import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

let t = null;

/**
 * Config Inventory auto settings Network Topology
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the network topology form
 */
class NetworkTopology extends Component {
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
    const {activeContent, statusEnable, type, value} = this.props;

    return (
      <div className='group-content'>
        <label id='scannerLabel'>
          <span style={{width: this.props.getInputWidth('networkTopology')}}>IP</span>
          {type === 'target' &&
            <span style={{width: this.props.getInputWidth('networkTopology')}}>Mask</span>
          }
          {type === 'switch' &&
            <span style={{width: this.props.getInputWidth('networkTopology')}}>Community</span>
          }
        </label>
        <TextField
          id='networkTopologyIP'
          className='network-topology'
          name='ip'
          variant='outlined'
          size='small'
          value={value.ip}
          onChange={this.handleDataChange}
          disabled={activeContent === 'viewMode' || !statusEnable.networkTopology} />
        {type === 'target' &&
          <TextField
            id='networkTopologTargetyMask'
            className='network-topology'
            name='mask'
            variant='outlined'
            size='small'
            value={value.mask}
            onChange={this.handleDataChange}
            disabled={activeContent === 'viewMode' || !statusEnable.networkTopology} />
        }
        {type === 'switch' &&
          <TextField
            id='networkTopologySiwtchMask'
            className='network-topology'
            name='mask'
            variant='outlined'
            size='small'
            value={value.mask}
            onChange={this.handleDataChange}
            disabled={activeContent === 'viewMode' || !statusEnable.networkTopology} />
        }
      </div>
    )
  }
}

NetworkTopology.propTypes = {

};

export default NetworkTopology;