import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import MultiInput from 'react-ui/build/src/components/multi-input'

import TtpEts from './ttp-ets'
import TtpObsFile from './ttp-obs-file'
import TtpObsUri from './ttp-obs-uri'
import TtpObsSocket from './ttp-obs-socket'
import GeneralDialog from '@f2e/gui/dist/components/dialog/general-dialog'
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';


let t = null
let et = null
let f = null
let it = null

class Ttps extends Component {
	constructor(props) {
		super(props)

		t = global.chewbaccaI18n.getFixedT(null, 'connections')
    	et = global.chewbaccaI18n.getFixedT(null, 'errors')
    	f = chewbaccaI18n.getFixedT(null, "tableFields");
    	it = global.chewbaccaI18n.getFixedT(null, "incident")
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
		let {activeContent, value: {title, infrastructureType, etsList, obsFileList, obsUriList, obsSocketList}} = this.props

		return <div className='event-content'>
			<div className='line'>
				<div className='group'>
	                <label htmlFor='title'>{f('incidentFields.technique')}</label>
	                <TextField style={{paddingRight: '2em'}}
	                    id='title'
	                    name='title'
	                    variant='outlined'
	                    fullWidth={true}
	                    size='small'
	                    helperText={t('txt-checkRequiredFieldType')}
	                    error={!(title || '').trim()}
	                    onChange={this.handleDataChangeMui}
	                    value={title}
	                    required
	                    disabled={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='infrastructureType'>{f('incidentFields.infrastructureType')}</label>
	                <TextField style={{paddingRight: '2em'}}
	                    id='infrastructureType'
	                    name='infrastructureType'
	                    variant='outlined'
	                    fullWidth={true}
	                    size='small'
	                    onChange={this.handleDataChangeMui}
	                    value={infrastructureType}
	                    helperText={t('txt-checkRequiredFieldType')}
	                    error={!(title || '').trim()}
	                    disabled={activeContent === 'viewIncident'}>
		                {
		                	_.map([
				                {value: 0, text: 'IOC'}, {value: 1, text: 'IOA'}
			                ], el=>{
		                		return <MenuItem value={el.value}>{el.text}</MenuItem>
			                })
		                }
	                </TextField>
	            </div>
	        </div>

	        <div className='event-sub'>
	        	<label className='ttp-header' htmlFor='TtpEts'>{it('txt-ttp-ets')}</label>
				<div className='group full'>
	            	<MultiInput
	                    id='ttpEts'
	                    className='ttp-group'
	                    base={TtpEts}
	                    value={etsList}
	                    props={{activeContent: activeContent}}
	                    onChange={this.handleDataChange.bind(this, 'etsList')}
	                    readOnly={activeContent === 'viewIncident'} />
	            </div>
            </div>

            <div className='event-sub'>
            <label className='ttp-header' htmlFor='obsFile'>{it('txt-ttp-obs-file')}</label>
				<div className='group full'>
	            	<MultiInput
	                    id='obsFile'
	                    className='ttp-group'
	                    base={TtpObsFile}
	                    value={obsFileList}
	                    props={{activeContent: activeContent}}
	                    onChange={this.handleDataChange.bind(this, 'obsFileList')}
	                    readOnly={activeContent === 'viewIncident'} />
	            </div>
            </div>

            <div className='event-sub'>
            <label className='ttp-header' htmlFor='obsUri'>{it('txt-ttp-obs-uri')}</label>
				<div className='group full'>
	            	<MultiInput
	                    id='obsUri'
	                    className='ttp-group'
	                    base={TtpObsUri}
	                    value={obsUriList}
	                    props={{activeContent: activeContent}}
	                    onChange={this.handleDataChange.bind(this, 'obsUriList')}
	                    readOnly={activeContent === 'viewIncident'} />
	            </div>
            </div>

            <div className='event-sub'>
            <label className='ttp-header' htmlFor='obsSocket'>{it('txt-ttp-obs-socket')}</label>
				<div className='group full'>
	            	<MultiInput
	                    id='obsSocket'
	                    className='ttp-group'
	                    base={TtpObsSocket}
	                    value={obsSocketList}
	                    props={{activeContent: activeContent}}
	                    onChange={this.handleDataChange.bind(this, 'obsSocketList')}
	                    readOnly={activeContent === 'viewIncident'} />
	            </div>
            </div>

		</div>
	}
}

Ttps.propTypes = {
}

export default Ttps