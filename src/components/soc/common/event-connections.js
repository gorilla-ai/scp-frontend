import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import Input from 'react-ui/build/src/components/input'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

let t = null;
let et = null;
let f = null;

class EventConnections extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
  }
  componentDidMount() {
  }
  handleDataChange = (field, value) => {
    const {onChange, value: curValue} = this.props;
    onChange({...curValue, [field]: value});
  }
  handleDataChangeMui = (event) => {
    const {onChange, value: curValue} = this.props;
    onChange({...curValue, [event.target.name]: event.target.value});
  }
  render() {
    const {activeContent, value: {srcIp, srcPort, srcHostname, dstIp, dstPort, dstHostname}} = this.props

    return (
      <div className='connection-content'>
        <div className='line'>
          <div className='group'>
            <label htmlFor='srcIp'>{f('incidentFields.srcIp')}</label>
            <TextField
              id='srcIp'
              name='srcIp'
              variant='outlined'
              fullWidth={true}
              size='small'
              onChange={this.handleDataChangeMui}
              value={srcIp}
              helperText={t('txt-checkRequiredFieldType')}
              aria-errormessage={t('network-topology.txt-ipValidationFail')}
              error={!helper.ValidateIP_Address(srcIp)}
              required
              disabled={activeContent === 'viewIncident'} />
          </div>
          <div className='group'>
            <label htmlFor='srcPort' style={{paddingRight: '2em', paddingLeft: '2em'}}>{f('incidentFields.srcPort')}</label>
            <TextField style={{paddingRight: '2em', paddingLeft: '2em'}}
              id='srcPort'
              name='srcPort'
              variant='outlined'
              fullWidth={true}
              size='small'
              onChange={this.handleDataChangeMui}
              value={srcPort}
              disabled={activeContent === 'viewIncident'} />
          </div>
          <div className='group'>
            <label htmlFor='srcHostname' style={{paddingRight: '2em', paddingLeft: '2em'}}>{f('incidentFields.srcHostname')}</label>
            <TextField style={{paddingRight: '2em', paddingLeft: '2em'}}
              id='srcHostname'
              name='srcHostname'
              variant='outlined'
              fullWidth={true}
              size='small'
              onChange={this.handleDataChangeMui}
              value={srcHostname}
              disabled={activeContent === 'viewIncident'} />
          </div>
        </div>

        <div className='line'>
          <div className='group'>
            <label htmlFor='dstIp'>{f('incidentFields.dstIp')}</label>
            <TextField
              id='dstIp'
              name='dstIp'
              variant='outlined'
              fullWidth={true}
              size='small'
              onChange={this.handleDataChangeMui}
              value={dstIp}
              helperText={t('txt-checkRequiredFieldType')}
              error={!helper.ValidateIP_Address(dstIp)}
              required
              disabled={activeContent === 'viewIncident'} />
          </div>
          <div className='group'>
            <label htmlFor='dstPort' style={{paddingRight: '2em', paddingLeft: '2em'}}>{f('incidentFields.dstPort')}</label>
            <TextField style={{paddingRight: '2em', paddingLeft: '2em'}}
              id='dstPort'
              name='dstPort'
              variant='outlined'
              fullWidth={true}
              size='small'
              onChange={this.handleDataChangeMui}
              value={dstPort}
              disabled={activeContent === 'viewIncident'} />
          </div>
          <div className='group'>
            <label htmlFor='dstHostname' style={{paddingRight: '2em', paddingLeft: '2em'}}>{f('incidentFields.dstHostname')}</label>
            <TextField style={{paddingRight: '2em', paddingLeft: '2em'}}
              id='dstHostname'
              name='dstHostname'
              variant='outlined'
              fullWidth={true}
              size='small'
              onChange={this.handleDataChangeMui}
              value={dstHostname}
              disabled={activeContent === 'viewIncident'} />
          </div>
        </div>
      </div>
    )
  }
}

EventConnections.propTypes = {
};

export default EventConnections;