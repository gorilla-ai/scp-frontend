import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Input from 'react-ui/build/src/components/input'

let t = null
let et = null
let f = null

class EventConnections extends Component {
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
		let {activeContent, value: {srcIp, srcPort, srcHostname, dstIp, dstPort, dstHostname}} = this.props

		return <div className='connection-content'>
			<div className='line'>
				<div className='group'>
	                <label htmlFor='srcIp'>{f('incidentFields.srcIp')}</label>
	                <Input
	                    id='srcIp'
	                    onChange={this.handleDataChange.bind(this, 'srcIp')}
	                    value={srcIp}
						required={true}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='srcPort'>{f('incidentFields.srcPort')}</label>
	                <Input
	                    id='srcPort'
	                    onChange={this.handleDataChange.bind(this, 'srcPort')}
	                    value={srcPort}
						required={true}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='srcHostname'>{f('incidentFields.srcHostname')}</label>
	                <Input
	                    id='srcHostname'
	                    onChange={this.handleDataChange.bind(this, 'srcHostname')}
	                    value={srcHostname}

	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	        </div>
	        
	        <div className='line'>
				<div className='group'>
	                <label htmlFor='dstIp'>{f('incidentFields.dstIp')}</label>
	                <Input
	                    id='dstIp'
	                    onChange={this.handleDataChange.bind(this, 'dstIp')}
	                    value={dstIp}
						required={true}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='dstPort'>{f('incidentFields.dstPort')}</label>
	                <Input
	                    id='dstPort'
	                    onChange={this.handleDataChange.bind(this, 'dstPort')}
	                    value={dstPort}
						required={true}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='dstHostname'>{f('incidentFields.dstHostname')}</label>
	                <Input
	                    id='dstHostname'
	                    onChange={this.handleDataChange.bind(this, 'dstHostname')}
	                    value={dstHostname}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	        </div>
		</div>
	}
}

EventConnections.propTypes = {
}

export default EventConnections