import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Input from 'react-ui/build/src/components/input'


let t = null
let et = null
let f = null

class TtpObsFile extends Component {
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
		let {activeContent, value: {fileName, fileExtension, md5, sha1, sha256}} = this.props

		return <div className='event-content'>
			<div className='line'>
				<div className='group'>
	                <label htmlFor='fileName'>{f('incidentFields.fileName')}</label>
	                <Input
	                    id='fileName'
	                    onChange={this.handleDataChange.bind(this, 'fileName')}
	                    value={fileName}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='fileExtension'>{f('incidentFields.fileExtension')}</label>
	                <Input
	                    id='fileExtension'
	                    onChange={this.handleDataChange.bind(this, 'fileExtension')}
	                    value={fileExtension}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	        </div>
	        
	        <div className='line'>
				<div className='group'>
	                <label htmlFor='md5'>MD5</label>
	                <Input
	                    id='md5'
	                    onChange={this.handleDataChange.bind(this, 'md5')}
	                    value={md5}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='sha1'>SHA1</label>
	                <Input
	                    id='sha1'
	                    onChange={this.handleDataChange.bind(this, 'sha1')}
	                    value={sha1}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	        </div>

	        <div className='line'>
				<div className='group full'>
	                <label htmlFor='sha256'>SHA256</label>
	                <Input
	                    id='sha256'
	                    onChange={this.handleDataChange.bind(this, 'sha256')}
	                    value={sha256}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	        </div>
		</div>
	}
}

TtpObsFile.propTypes = {
}

export default TtpObsFile