import React, { Component } from 'react'
import _ from 'lodash'

import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import MultiInput from 'react-ui/build/src/components/multi-input'

import TtpEts from './ttp-ets'
import TtpObsSocket from './ttp-obs-socket'
import TtpObsUri from './ttp-obs-uri'

let t = null;
let et = null;
let f = null;
let it = null;

class TtpEdr extends Component {
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

    onChange({
      ...curValue,
      [event.target.name]: event.target.value
    });
  }
  /**
   * Check helper text
   * @method
   * @returns required text
   */
  checkHelperText = () => {
    const {disabledStatus, incidentFormType} = this.props;

    if (!disabledStatus && incidentFormType === 'analyze') {
      return t('txt-checkRequiredFieldType');
    }
  }
  render() {
    let {
      disabledStatus,
      incidentFormType,
      value: {
        title,
        infrastructureType,
        obsUriList,
        obsSocketList,
        etsList
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
              required={incidentFormType === 'analyze'}
              error={incidentFormType === 'analyze' && !title}
              helperText={this.checkHelperText()}
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
              error={incidentFormType === 'analyze' && !infrastructureType}
              helperText={this.checkHelperText()}
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
          <label className='ttp-header' htmlFor='obsUri'>{it('txt-ttp-obs-uri')}</label>
          <div className='group full'>
            <MultiInput
              id='obsUri'
              className='ttp-group'
              base={TtpObsUri}
              defaultItemValue={{
                uriType: '',
                uriValue: ''
              }}
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
              defaultItemValue={{
                ip: '',
                port: ''
              }}
              value={obsSocketList}
              props={{
                disabledStatus
              }}
              onChange={this.handleDataChange.bind(this, 'obsSocketList')}
              readOnly={disabledStatus} />
          </div>
        </div>

        <div className='event-sub'>
          <label className='ttp-header' htmlFor='TtpEts'>{it('txt-ttp-ets')}</label>
          <div className='group full'>
            <MultiInput
              id='ttpEts'
              className='ttp-group'
              base={TtpEts}
              defaultItemValue={{
                cveId: '',
                description: ''
              }}
              value={etsList}
              props={{
                disabledStatus
              }}
              onChange={this.handleDataChange.bind(this, 'etsList')}
              readOnly={disabledStatus} />
          </div>
        </div>
      </div>
    )
  }
}

TtpEdr.propTypes = {
};

export default TtpEdr;