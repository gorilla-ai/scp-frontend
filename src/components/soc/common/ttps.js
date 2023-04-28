import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'

import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import MultiInput from 'react-ui/build/src/components/multi-input'

import GeneralDialog from '@f2e/gui/dist/components/dialog/general-dialog'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'
import TtpEts from './ttp-ets'
import TtpObsFile from './ttp-obs-file'
import TtpObsUri from './ttp-obs-uri'
import TtpObsSocket from './ttp-obs-socket'

let t = null;
let et = null;
let f = null;
let it = null;

class Ttps extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');
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
    let {
      disabledStatus,
      incidentFormType,
      value: {
        title,
        infrastructureType,
        etsList,
        obsFileList,
        obsUriList,
        obsSocketList
      }
    } = this.props;

    if (infrastructureType  === 1) {
      infrastructureType = '1';
    }

    if (infrastructureType  === 0) {
      infrastructureType = '0';
    }

    return (
      <div className='event-content'>
        <div className='line'>
          <div className='group'>
            <label htmlFor='title'>{f('incidentFields.technique')}</label>
            <TextField style={{paddingRight: '2em'}}
              id='title'
              name='title'
              variant='outlined'
              fullWidth={true}
              size='small'
              required
              helperText={disabledStatus ? '' : t('txt-checkRequiredFieldType')}
              error={!(title || '').trim()}
              value={title}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus}/>
          </div>
          <div className='group'>
            <label htmlFor='infrastructureType'>{f('incidentFields.infrastructureType')}</label>
            <TextField style={{paddingRight: '2em'}}
              id='infrastructureType'
              name='infrastructureType'
              variant='outlined'
              fullWidth={true}
              size='small'
              select
              error={!(infrastructureType || '')}
              helperText={disabledStatus ? '' : t('txt-checkRequiredFieldType')}
              value={infrastructureType}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus}>
              {
                _.map([
                  {value: '0', text: 'IOC'}, {value: '1', text: 'IOA'}
                ], el => {
                  return <MenuItem value={el.value}>{el.text}</MenuItem>
                })
              }
            </TextField>
          </div>
        </div>
        <div className='event-sub'>
          <label className='ttp-header' htmlFor='TtpEts'>{it('txt-ttp-ets')}</label>
          <div className='group full'>
            <MultiInput
              id='ttpEts'
              className='ttp-group'
              base={TtpEts}
              value={etsList}
              props={{
                disabledStatus
              }}
              onChange={this.handleDataChange.bind(this, 'etsList')}
              readOnly={disabledStatus} />
          </div>
        </div>

        <div className='event-sub'>
          <label className='ttp-header' htmlFor='obsFile'>{it('txt-ttp-obs-file')}</label>
          <div className='group full'>
            <MultiInput
              id='obsFile'
              className='ttp-group'
              base={TtpObsFile}
              defaultItemValue={{
                createDttm: moment().local().format('YYYY-MM-DDTHH:mm:ss'),
                modifyDttm: moment().local().format('YYYY-MM-DDTHH:mm:ss'),
                accessDttm: moment().local().format('YYYY-MM-DDTHH:mm:ss'),
                isFamily: false,
                result: 'Malicious'
              }}
              value={obsFileList}
              props={{
                disabledStatus
              }}
              onChange={this.handleDataChange.bind(this, 'obsFileList')}
              readOnly={disabledStatus} />
          </div>
        </div>

        <div className='event-sub'>
          <label className='ttp-header' htmlFor='obsUri'>{it('txt-ttp-obs-uri')}</label>
          <div className='group full'>
            <MultiInput
              id='obsUri'
              className='ttp-group'
              base={TtpObsUri}
              value={obsUriList}
              props={{
                disabledStatus
              }}
              onChange={this.handleDataChange.bind(this, 'obsUriList')}
              readOnly={disabledStatus} />
          </div>
        </div>

        <div className='event-sub'>
          <label className='ttp-header' htmlFor='obsSocket'>{it('txt-ttp-obs-socket')}</label>
          <div className='group full'>
            <MultiInput
              id='obsSocket'
              className='ttp-group'
              base={TtpObsSocket}
              value={obsSocketList}
              props={{
                disabledStatus
              }}
              onChange={this.handleDataChange.bind(this, 'obsSocketList')}
              readOnly={disabledStatus} />
          </div>
        </div>
      </div>
    )
  }
}

Ttps.propTypes = {
};

export default Ttps;