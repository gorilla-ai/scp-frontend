import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import DateRange from 'react-ui/build/src/components/date-range'
import Input from 'react-ui/build/src/components/input'
import MultiInput from 'react-ui/build/src/components/multi-input'

import EventConnections from './event-connections'

let t = null
let et = null
let f = null

class Events extends Component {
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
		let {activeContent, locale, value: {description, deviceId, time, frequency, connectionList}} = this.props

		return <div className='event-content'>
			<div className='line'>
				<div className='group'>
	                <label htmlFor='rule'>{f('incidentFields.rule')}</label>
	                <Input
	                    id='rule'
	                    onChange={this.handleDataChange.bind(this, 'description')}
	                    value={description}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='deviceId'>{f('incidentFields.deviceId')}</label>
	                <Input
	                    id='deviceId'
	                    onChange={this.handleDataChange.bind(this, 'deviceId')}
	                    value={deviceId}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	        </div>
	        
	        <div className='line'>
	        	<div className='group'>
		        	<label htmlFor='datetime'>{f('incidentFields.dateRange')}</label>
		        	<DateRange
				        id='datetime'
				        className='daterange'
				        onChange={this.handleDataChange.bind(this, 'time')}
				        enableTime={true}
				        value={time}
				        locale={locale} />
		        </div>
		        <div className='group'>
	                <label htmlFor='frequency'>{f('incidentFields.frequency')}</label>
	                <Input
	                    id='frequency'
	                    onChange={this.handleDataChange.bind(this, 'frequency')}
	                    value={frequency}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	        </div>

	        <div className='line'>

	                <MultiInput
	                    id='eventConnections'
	                    className='event-connection-group'
	                    base={EventConnections}
	                    value={connectionList}
	                    props={{activeContent: activeContent}}
	                    onChange={this.handleDataChange.bind(this, 'connectionList')} />

	        </div>
		</div>
	}
}

Events.propTypes = {
}

export default Events