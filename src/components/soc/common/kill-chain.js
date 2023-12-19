import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

let t = null;
let f = null;

/**
 * Kill Chain
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component for the Incident Form Kill Chain
 */
class KillChain extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      attackChains: [],
      phases: [],
    };
  }
  componentDidMount() {
  }

  componentDidUpdate(prevProps) {
    if (prevProps.killChains !== this.props.killChains) {
      const {killChains, value: {killChainName, phaseName}} = this.props;
      if (killChains && Array.isArray(killChains.attackChain)) {
        if (Array.isArray(killChains.attackChain)) {
          this.setState({
            attackChains: [ '', ...(killChains.attackChain || [])],
          });
        }
        if (killChainName) {
          this.setState({
            phases: [ '', ...(killChains[killChainName] || [])],
          });
        }
      }
    }
  }

  /**
   * Handle input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    this.props.onChange({
      ...this.props.value,
      [event.target.name]: event.target.value
    });
  }
  /**
   * Handle kill-chain name change
   * @method
   * @param {object} event - event object
   */
  handleKillChainNameChange = (event) => {
    const {killChains} = this.props;
    this.props.onChange({
      ...this.props.value,
      [event.target.name]: event.target.value
    });
    
    this.setState({
      phases: [ '', ...(killChains[event.target.value] || [])],
    });
  }
  /**
   * Handle phase name change
   * @method
   * @param {object} event - event object
   */
  handlePhaseNameChange = (event) => {
    this.props.onChange({
      ...this.props.value,
      [event.target.name]: event.target.value
    });
  }

  render() {
    const {killChains, disabledStatus, locale, value: {killChainName, phaseName}} = this.props;
    const {attackChains, phases} = this.state;

    return (
      <div className='event-content'>
        <div className='line'>
          <div className='group'>
            <label htmlFor='killChainName'>{f('incidentFields.killChainName')}</label>
            <TextField
              style={{paddingRight: '2em'}}
              id='killChainName'
              name='killChainName'
              variant='outlined'
              fullWidth={true}
              size='small'
              select={!disabledStatus}
              SelectProps={{
                displayEmpty: true,
                native: true,
              }}
              onChange={this.handleKillChainNameChange}
              value={killChainName}
              disabled={disabledStatus}>
              { attackChains.map((v) => <option value={v}>{v}</option>) }
            </TextField>
          </div>
          <div className='group'>
            <label htmlFor='phaseName'>{f('incidentFields.phaseName')}</label>
            <TextField
              style={{paddingRight: '2em'}}
              id='phaseName'
              name='phaseName'
              variant='outlined'
              fullWidth={true}
              size='small'
              select={!disabledStatus}
              SelectProps={{
                displayEmpty: true,
                native: true,
              }}
              onChange={this.handlePhaseNameChange}
              value={phaseName}
              disabled={disabledStatus}>
              { phases.map((v) => <option value={v}>{v}</option>) }
            </TextField>
          </div>
        </div>
      </div>
    )
  }
}


export default KillChain;