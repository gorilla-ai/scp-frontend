import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Input from 'react-ui/build/src/components/input'
import Textarea from 'react-ui/build/src/components/textarea'

import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

let t = null;
let et = null;
let f = null;

class TtpEts extends Component {
	constructor(props) {
		super(props)

		t = global.chewbaccaI18n.getFixedT(null, 'connections');
  	et = global.chewbaccaI18n.getFixedT(null, 'errors');
  	f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
	}
	componentDidMount() {
	}
	handleDataChange = (field, value) => {
        let {onChange, value: curValue} = this.props
        onChange({...curValue, [field]: value})
    }
	handleDataChangeMui = (event) => {
		let {onChange, value: curValue} = this.props
		onChange({...curValue, [event.target.name]: event.target.value})
	}
	render() {
		let {activeContent, value: {cveId, description}} = this.props

		return <div className='event-content'>
			<div className='line'>
				<div className='group'>
	                <label htmlFor='srcIp'>{f('incidentFields.cveId')}</label>
	                <TextField style={{paddingRight: '2em'}}
	                    id='cveId'
	                    name='cveId'
	                    variant='outlined'
	                    fullWidth={true}
	                    size='small'
	                    onChange={this.handleDataChangeMui}
	                    value={cveId}
	                    disabled={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='description'>{f('incidentFields.etsDescription')}</label>
	                <TextField style={{paddingRight: '2em'}}
		                id='description'
		                name='description'
		                variant='outlined'
		                fullWidth={true}
		                size='small'
	                    onChange={this.handleDataChangeMui}
	                    value={description}
	                    disabled={activeContent === 'viewIncident'}/>
	            </div>
	        </div>
		</div>
	}
}

TtpEts.propTypes = {
}

export default TtpEts