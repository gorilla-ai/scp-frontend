import React, { Component } from 'react'

import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

let t = null;
let et = null;
let f = null;

class TtpObsSocket extends Component {
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
		let {activeContent, value: {ip, port}} = this.props

		return <div className='event-content'>
			<div className='line'>
				<div className='group'>
					<label htmlFor='ip'>IP</label>
					<TextField style={{paddingRight: '2em'}}
						id='ip'
						name='ip'
						variant='outlined'
						fullWidth={true}
						size='small'
						onChange={this.handleDataChangeMui}
						value={ip}
						helperText={t('network-topology.txt-ipValidationFail')}
						error={ip === '' || ip === undefined ? false : !helper.ValidateIP_Address(ip)}
						disabled={activeContent === 'viewIncident'}/>
				</div>
				<div className='group'>
					<label htmlFor='port'>Port</label>
					<TextField style={{paddingRight: '2em'}}
						id='port'
						name='port'
						variant='outlined'
						fullWidth={true}
						size='small'
						onChange={this.handleDataChangeMui}
						value={port}
						disabled={activeContent === 'viewIncident'}/>
				</div>
	        </div>
		</div>
	}

	/**
	 * Input validation
	 * @method
	 * @param {array} code - error code
	 * @returns error message
	 */
	getErrorMsg = (code, {value, pattern}) => {
		if (code[0] === 'no-match') {
			return t('network-topology.txt-ipValidationFail');
		}
	}
}

TtpObsSocket.propTypes = {
}

export default TtpObsSocket