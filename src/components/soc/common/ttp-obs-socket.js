import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Input from 'react-ui/build/src/components/input'

let t = null
let et = null
let f = null

class TtpObsSocket extends Component {
	constructor(props) {
		super(props)

		t = global.chewbaccaI18n.getFixedT(null, 'connections')
    	et = global.chewbaccaI18n.getFixedT(null, 'errors')
    	f = chewbaccaI18n.getFixedT(null, "tableFields");
	}
	componentDidMount() {
	}
	handleDataChange = (field, value) => {
        let {onChange, value: curValue} = this.props
        onChange({...curValue, [field]: value})
    }
	render() {
		let {activeContent, value: {ip, port}} = this.props

		return <div className='event-content'>
			<div className='line'>
				<div className='group'>
	                <label htmlFor='ip'>IP</label>
	                <Input
	                    id='ip'
	                    onChange={this.handleDataChange.bind(this, 'ip')}
	                    value={ip}
						validate={{
							pattern: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
							patternReadable: 'xxx.xxx.xxx.xxx',
							t: this.getErrorMsg
						}}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='port'>Port</label>
	                <Input
	                    id='port'
	                    onChange={this.handleDataChange.bind(this, 'port')}
	                    value={port}
	                    validate={{
		                    pattern:/^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
		                    patternReadable: '0-65535',
		                    t: et
	                    }}
	                    readOnly={activeContent === 'viewIncident'}/>
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