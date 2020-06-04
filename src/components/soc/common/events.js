import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import DateRange from 'react-ui/build/src/components/date-range'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import MultiInput from 'react-ui/build/src/components/multi-input'

import EventConnections from './event-connections'

let t = null
let et = null
let f = null
let it = null;

class Events extends Component {
	constructor(props) {
		super(props)

		t = global.chewbaccaI18n.getFixedT(null, 'connections')
    	et = global.chewbaccaI18n.getFixedT(null, 'errors')
    	f = chewbaccaI18n.getFixedT(null, "tableFields");
		it = global.chewbaccaI18n.getFixedT(null, "incident");
	}
	componentDidMount() {
	}
	handleDataChange = (field, value) => {
        let {onChange, value: curValue} = this.props
        onChange({...curValue, [field]: value})
    }
	render() {
		let {activeContent, locale, deviceListOptions, value: {description, deviceId, time, frequency, eventConnectionList}} = this.props

		return <div className='event-content'>
			<div className='line'>
				<div className='group'>
	                <label htmlFor='rule'>{f('incidentFields.rule')}</label>
	                <Input
	                    id='rule'
	                    onChange={this.handleDataChange.bind(this, 'description')}
	                    value={description}
	                    required={true}
	                    validate={{t: et}}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='deviceId'>{f('incidentFields.deviceId')}</label>
	                <DropDownList
	                    id='deviceId'
	                    onChange={this.handleDataChange.bind(this, 'deviceId')}
	                    list={deviceListOptions}
	                    value={deviceId}
	                    required={true}
	                    validate={{t: et}}
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
				        required={true}
				        validate={{t: et}}
				        value={time}
				        locale={locale}
				        readOnly={activeContent === 'viewIncident'} />
		        </div>
		        <div className='group'>
	                <label htmlFor='frequency'>{it('txt.frequency')}</label>
	                <Input
	                    id='frequency'
	                    onChange={this.handleDataChange.bind(this, 'frequency')}
	                    value={frequency}
	                    required={true}
	                    validate={{t: et}}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	        </div>

	        <div className='line'>
                <MultiInput
                    id='eventConnections'
                    className='event-connection-group'
                    base={EventConnections}
                    value={eventConnectionList}
                    props={{activeContent: activeContent}}
                    onChange={this.handleDataChange.bind(this, 'eventConnectionList')} 
                    readOnly={activeContent === 'viewIncident'} />
	        </div>
		</div>
	}
}

Events.propTypes = {
}

export default Events