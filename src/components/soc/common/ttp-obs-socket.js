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
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='port'>Port</label>
	                <Input
	                    id='port'
	                    onChange={this.handleDataChange.bind(this, 'port')}
	                    value={port}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	        </div>
		</div>
	}
}

TtpObsSocket.propTypes = {
}

export default TtpObsSocket