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
import {KeyboardDateTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import Autocomplete from "@material-ui/lab/Autocomplete";

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

		if (field === 'from'){
			let tmpTime =  curValue.time
			tmpTime.from = value
			onChange({...curValue, [field]: tmpTime})
		}else if (field === 'to'){
			let tmpTime =  curValue.time
			tmpTime.to = value
			onChange({...curValue, [field]: tmpTime})
		}else{
			onChange({...curValue, [field]: value})
		}
	}

	handleEventsChange = (val) => {
		let {onChange, value: curValue} = this.props
		onChange({...curValue, ['eventConnectionList']: val})
	};

	handleDataChangeMui = (event) => {
		let {onChange, value: curValue} = this.props
		onChange({...curValue, [event.target.name]: event.target.value})
	}

	onUnitChange = (event, values) => {
		let {onChange, value: curValue} = this.props
		if (values && values.value){
			onChange({...curValue, ['deviceId']: values.value, ['deviceObj']: values})
		}else{
			onChange({...curValue, ['deviceId']: '', ['deviceObj']: {}})
		}

	}

	render() {
		let {activeContent, locale, deviceListOptions, showDeviceListOptions, value: {description, deviceId, time, frequency, eventConnectionList, deviceObj}} = this.props
		let dateLocale = locale;

		if (locale === 'zh') {
			dateLocale += '-tw';
		}

		let deviceNameCheck = false;
		let furtherDeviceList = deviceListOptions;

		_.forEach(deviceListOptions, deviceItem=>{
			if(deviceItem.value === deviceId){
				deviceNameCheck = true
				deviceObj = {
					value:deviceItem.value,
					text:deviceItem.text
				}
			}
		})

		if(!deviceNameCheck){
			let furtherObj = {}
			_.forEach(showDeviceListOptions, deviceItem=>{
				if(deviceItem.value === deviceId){
					furtherObj = {
						value:deviceItem.value,
						text:deviceItem.text
					}
					furtherDeviceList.push(furtherObj)
				}
			})
		}

		moment.locale(dateLocale);
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
				{activeContent === 'viewIncident' &&
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
							_.map(showDeviceListOptions,el=>{
								return <MenuItem value={el.value}>{el.text}</MenuItem>
							})
						}
					</TextField>

				</div>
				}
				{activeContent !== 'viewIncident' &&
				<div className='group'>
					<label htmlFor='deviceId'>{f('incidentFields.deviceId')}</label>
					{/*<TextField style={{paddingRight: '2em'}}*/}
					{/*           id='deviceId'*/}
					{/*           name='deviceId'*/}
					{/*           variant='outlined'*/}
					{/*           fullWidth={true}*/}
					{/*           size='small'*/}
					{/*           select*/}
					{/*           onChange={this.handleDataChangeMui}*/}
					{/*           value={deviceId}*/}
					{/*           required*/}
					{/*           helperText={it('txt-required')}*/}
					{/*           error={!(deviceId || '').trim()}*/}
					{/*           disabled={activeContent === 'viewIncident'}>*/}
					{/*	{*/}
					{/*		_.map(furtherDeviceList,el=>{*/}
					{/*			return <MenuItem value={el.value}>{el.text}</MenuItem>*/}
					{/*		})*/}
					{/*	}*/}
					{/*</TextField>*/}
					<Autocomplete style={{paddingRight: '2em'}}
					              id='deviceId'
					              name='deviceId'
					              required
					              helperText={it('txt-required')}
					              variant='outlined'
					              fullWidth={true}
					              size='small'
					              options={furtherDeviceList}
					              select
					              onChange={this.onUnitChange}
					              value={deviceObj}
					              getOptionLabel={(option) => option.text}
					              disabled={activeContent === 'viewIncident'}
					              renderInput={(params) =>
						              <TextField
							              {...params}
							              required
							              error={!(deviceId || '').trim()}
							              helperText={it('txt-required')}
							              variant='outlined'
							              fullWidth={true}
							              size='small'
							              InputProps={{...params.InputProps, type: 'search'}}
						              />}
					/>
				</div>
				}
			</div>

			<div className='line'>
				<div className='group'>
					<label htmlFor='datetime'>{f('incidentFields.dateRange')}</label>
					<MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
						<KeyboardDateTimePicker
							id='event-from-date-time-picker'
							className='date-time-picker'
							inputVariant='outlined'
							variant='inline'
							format='YYYY-MM-DD HH:mm'
							ampm={false}
							value={time.from}
							readOnly={activeContent === 'viewIncident' }
							onChange={this.handleDataChange.bind(this, 'from')} />
						<div className='between'>~</div>
						<KeyboardDateTimePicker
							id='event-to-from-date-time-picker'
							className='date-time-picker'
							inputVariant='outlined'
							variant='inline'
							format='YYYY-MM-DD HH:mm'
							ampm={false}
							value={time.to}
							readOnly={activeContent === 'viewIncident' }
							onChange={this.handleDataChange.bind(this, 'to')} />
					</MuiPickersUtilsProvider>
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
						disabled={activeContent === 'viewIncident'}/>
				</div>
			</div>

			<div className='line'>
				<MultiInput
					id='eventConnections'
					className='event-connection-group'
					base={EventConnections}
					defaultItemValue={{srcIp:'', srcPort:'', srcHostname:'', dstIp:'', dstPort:'', dstHostname:''}}
					value={eventConnectionList}
					props={{activeContent: activeContent}}
					onChange={this.handleEventsChange}
					readOnly={activeContent === 'viewIncident'} />
			</div>
		</div>
	}
}

Events.propTypes = {
}

export default Events
