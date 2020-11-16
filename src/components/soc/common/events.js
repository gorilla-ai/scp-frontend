import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import DateRange from 'react-ui/build/src/components/date-range'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import MultiInput from 'react-ui/build/src/components/multi-input'

import EventConnections from './event-connections'
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

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

	handleDataChangeMui = (event) => {
		let {onChange, value: curValue} = this.props
		onChange({...curValue, [event.target.name]: event.target.value})
	}
	render() {
		let {activeContent, locale, deviceListOptions, value: {description, deviceId, time, frequency, eventConnectionList}} = this.props

		return <div className='event-content'>
			<div className='line'>
				<div className='group'>
	                <label htmlFor='description'>{f('incidentFields.rule')}</label>
	                <TextField style={{paddingRight: '2em'}}
	                    id='description'
	                    name='description'
	                    variant='outlined'
	                    fullWidth={true}
	                    size='small'
	                    onChange={this.handleDataChangeMui}
	                    value={description}
	                    required
	                    error={!(description || '').trim()}
	                    helperText={it('txt-required')}
	                    disabled={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='deviceId'>{f('incidentFields.deviceId')}</label>
	                <TextField style={{paddingRight: '2em'}}
	                    id='deviceId'
	                    name='deviceId'
	                    variant='outlined'
	                    fullWidth={true}
	                    size='small'
	                    select
	                    onChange={this.handleDataChangeMui}
	                    value={deviceId}
	                    required
	                    helperText={it('txt-required')}
	                    error={!(deviceId || '').trim()}
	                    disabled={activeContent === 'viewIncident'}>
		                {
		                	_.map(deviceListOptions,el=>{
		                		return <MenuItem value={el.value}>{el.text}</MenuItem>
			                })
		                }
	                </TextField>
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
	                <label htmlFor='frequency'>{it('txt-frequency')}</label>
	                <TextField
	                    id='frequency'
	                    name='frequency'
	                    variant='outlined'
	                    fullWidth={false}
	                    size='small'
	                    onChange={this.handleDataChangeMui}
	                    value={frequency}
	                    required
	                    error={!(frequency || 0)}
	                    helperText={it('txt-required')}
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