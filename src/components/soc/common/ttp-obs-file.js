import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Input from 'react-ui/build/src/components/input'

import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

let t = null;
let et = null;
let f = null;

class TtpObsFile extends Component {
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
    const {disabledStatus, value: {fileName, fileExtension, md5, sha1, sha256}} = this.props;

    return (
      <div className='event-content'>
        <div className='line'>
          <div className='group'>
            <label htmlFor='fileName'>{f('incidentFields.fileName')}</label>
            <TextField style={{paddingRight: '2em'}}
              id='fileName'
              name='fileName'
              variant='outlined'
              fullWidth
              size='small'
              onChange={this.handleDataChangeMui}
              value={fileName}
              disabled={disabledStatus} />
          </div>
          <div className='group'>
            <label htmlFor='fileExtension'>{f('incidentFields.fileExtension')}</label>
            <TextField style={{paddingRight: '2em'}}
              id='fileExtension'
              name='fileExtension'
              variant='outlined'
              fullWidth
              size='small'
              onChange={this.handleDataChangeMui}
              value={fileExtension}
              disabled={disabledStatus} />
          </div>
        </div>
            
        <div className='line'>
          <div className='group'>
            <label htmlFor='md5'>MD5</label>
            <TextField style={{paddingRight: '2em'}}
              id='md5'
              name='md5'
              variant='outlined'
              fullWidth
              size='small'
              maxLength={32}
              value={md5}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus} />
            </div>
            <div className='group'>
              <label htmlFor='sha1'>SHA1</label>
              <TextField style={{paddingRight: '2em'}}
                id='sha1'
                name='sha1'
                variant='outlined'
                fullWidth
                size='small'
                maxLength={40}
                value={sha1}
                onChange={this.handleDataChangeMui}
                disabled={disabledStatus} />
            </div>
          </div>

          <div className='line'>
            <div className='group full'>
              <label htmlFor='sha256'>SHA256</label>
              <TextField style={{paddingRight: '2em'}}
                id='sha256'
                name='sha256'
                variant='outlined'
                fullWidth
                size='small'
                maxLength={64}
                value={sha256}
                onChange={this.handleDataChangeMui}
                disabled={disabledStatus} />
            </div>
        </div>
      </div>
    )
  }
}

TtpObsFile.propTypes = {
};

export default TtpObsFile;