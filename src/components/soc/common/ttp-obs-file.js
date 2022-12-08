import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Input from 'react-ui/build/src/components/input'

import TextField from '@material-ui/core/TextField'

let t = null
let et = null
let f = null

class TtpObsFile extends Component {
	constructor(props) {
		super(props)

		t = global.chewbaccaI18n.getFixedT(null, 'connections')
  	et = global.chewbaccaI18n.getFixedT(null, 'errors')
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
		let {activeContent, value: {fileName, fileExtension, md5, sha1, sha256}} = this.props

		return <div className='event-content'>
			<div className='line'>
				<div className='group'>
	                <label htmlFor='fileName'>{f('incidentFields.fileName')}</label>
	                <TextField style={{paddingRight: '2em'}}
	                    id='fileName'
	                    name='fileName'
	                    variant='outlined'
	                    fullWidth={true}
	                    size='small'
	                    onChange={this.handleDataChangeMui}
	                    value={fileName}
	                    disabled={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='fileExtension'>{f('incidentFields.fileExtension')}</label>
	                <TextField style={{paddingRight: '2em'}}
	                    id='fileExtension'
	                    name='fileExtension'
	                    variant='outlined'
	                    fullWidth={true}
	                    size='small'
	                    onChange={this.handleDataChangeMui}
	                    value={fileExtension}
	                    disabled={activeContent === 'viewIncident'}/>
	            </div>
	        </div>
	        
	        <div className='line'>
				<div className='group'>
	                <label htmlFor='md5'>MD5</label>
	                <TextField style={{paddingRight: '2em'}}
	                    id='md5'
	                    name='md5'
	                    variant='outlined'
	                    fullWidth={true}
	                    size='small'
	                    onChange={this.handleDataChangeMui}
	                    value={md5}
						maxLength={32}
	                    disabled={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='sha1'>SHA1</label>
	                <TextField style={{paddingRight: '2em'}}
	                    id='sha1'
	                    name='sha1'
	                    variant='outlined'
	                    fullWidth={true}
	                    size='small'
	                    onChange={this.handleDataChangeMui}
	                    value={sha1}
						maxLength={40}
	                    disabled={activeContent === 'viewIncident'}/>
	            </div>
	        </div>

	        <div className='line'>
				<div className='group full'>
	                <label htmlFor='sha256'>SHA256</label>
	                <TextField style={{paddingRight: '2em'}}
	                    id='sha256'
	                    name='sha256'
	                    variant='outlined'
	                    fullWidth={true}
	                    size='small'
	                    onChange={this.handleDataChangeMui}
	                    value={sha256}
						maxLength={64}
	                    disabled={activeContent === 'viewIncident'}/>
	            </div>
	        </div>
		</div>
	}
}

TtpObsFile.propTypes = {
}

export default TtpObsFile