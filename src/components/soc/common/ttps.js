import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Input from 'react-ui/build/src/components/input'
import MultiInput from 'react-ui/build/src/components/multi-input'

import TtpEts from './ttp-ets'
import TtpObsFile from './ttp-obs-file'
import TtpObsUri from './ttp-obs-uri'
import TtpObsSocket from './ttp-obs-socket'

let t = null
let et = null
let f = null

class Ttps extends Component {
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
		let {activeContent, value: {title, infrastructureType, etsList, obsFileList, obsUriList, obsSocketList}} = this.props

		return <div className='event-content'>
			<div className='line'>
				<div className='group'>
	                <label htmlFor='title'>{f('incidentFields.technique')}</label>
	                <Input
	                    id='title'
	                    onChange={this.handleDataChange.bind(this, 'title')}
	                    value={title}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='infrastructureType'>{f('incidentFields.infrastructureType')}</label>
	                <Input
	                    id='infrastructureType'
	                    onChange={this.handleDataChange.bind(this, 'infrastructureType')}
	                    value={infrastructureType}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>

	        </div>

	        <div className='line'>
				<div className='group full'>
	            	<MultiInput
	                    id='ttpEts'
	                    className='ttp-group'
	                    base={TtpEts}
	                    value={etsList}
	                    props={{activeContent: activeContent}}
	                    onChange={this.handleDataChange.bind(this, 'etsList')} />
	            </div>
            </div>

            <div className='line'>
				<div className='group full'>
	            	<MultiInput
	                    id='obsFile'
	                    className='ttp-group'
	                    base={TtpObsFile}
	                    value={obsFileList}
	                    props={{activeContent: activeContent}}
	                    onChange={this.handleDataChange.bind(this, 'obsFileList')} />
	            </div>
            </div>

            <div className='line'>
				<div className='group full'>
	            	<MultiInput
	                    id='obsUri'
	                    className='ttp-group'
	                    base={TtpObsUri}
	                    value={obsUriList}
	                    props={{activeContent: activeContent}}
	                    onChange={this.handleDataChange.bind(this, 'obsUriList')} />
	            </div>
            </div>

            <div className='line'>
				<div className='group full'>
	            	<MultiInput
	                    id='obsSocket'
	                    className='ttp-group'
	                    base={TtpObsSocket}
	                    value={obsSocketList}
	                    props={{activeContent: activeContent}}
	                    onChange={this.handleDataChange.bind(this, 'obsSocketList')} />
	            </div>
            </div>

		</div>
	}
}

Ttps.propTypes = {
}

export default Ttps