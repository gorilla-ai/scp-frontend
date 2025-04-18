import React, { Component } from 'react'
import _ from 'lodash'

import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

let t = null;
let et = null;
let f = null;

class TtpObsUri extends Component {
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
    const {disabledStatus, value: {uriType, uriValue}} = this.props;

    return (
      <div className='event-content'>
        <div className='line'>
          <div className='group'>
            <label htmlFor='uriType'>{f('incidentFields.uriType')}</label>
            <TextField style={{paddingRight: '2em'}}
              id='uriType'
              name='uriType'
              variant='outlined'
              fullWidth
              size='small'
              select
              onChange={this.handleDataChangeMui}
              value={uriType}
              disabled={disabledStatus}>
              {
                _.map([
                  {text: f('incidentFields.domain'), value: 1}
                ], el => {
                  return <MenuItem value={el.value}>{el.text}</MenuItem>
                })
              }
            </TextField>
          </div>
          <div className='group'>
            <label htmlFor='uriValue'>{f('incidentFields.uriValue')}</label>
            <TextField style={{paddingRight: '2em'}}
              id='uriValue'
              name='uriValue'
              variant='outlined'
              fullWidth
              size='small'
              onChange={this.handleDataChangeMui}
              value={uriValue}
              disabled={disabledStatus}/>
          </div>
        </div>
      </div>
    )
  }
}

TtpObsUri.propTypes = {
};

export default TtpObsUri;