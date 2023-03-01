import React, { Component } from 'react'

import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

let t = null;
let et = null;
let f = null;

class TtpObsSocket extends Component {
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
    const {disabledStatus, value: {ip, port}} = this.props;

    return (
      <div className='event-content'>
        <div className='line'>
          <div className='group'>
            <label htmlFor='ip'>IP</label>
            <TextField style={{paddingRight: '2em'}}
              id='ip'
              name='ip'
              variant='outlined'
              fullWidth
              size='small'
              error={ip === '' || ip === undefined ? false : !helper.ValidateIP_Address(ip)}
              helperText={disabledStatus ? '' : t('network-topology.txt-ipValidationFail')}
              value={ip}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus} />
          </div>
          <div className='group'>
            <label htmlFor='port'>Port</label>
            <TextField style={{paddingRight: '2em'}}
              id='port'
              name='port'
              variant='outlined'
              fullWidth
              size='small'
              value={port}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus} />
          </div>
        </div>
      </div>
    )
  }
}

TtpObsSocket.propTypes = {
};

export default TtpObsSocket;