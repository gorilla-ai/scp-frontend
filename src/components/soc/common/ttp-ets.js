import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Input from 'react-ui/build/src/components/input'
import Textarea from 'react-ui/build/src/components/textarea'

let t = null
let et = null
let f = null

class TtpEts extends Component {
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
		let {activeContent, value: {cveId, description}} = this.props

		return <div className='event-content'>
			<div className='line'>
				<div className='group'>
	                <label htmlFor='srcIp'>{f('incidentFields.cveId')}</label>
	                <Input
	                    id='cveId'
	                    onChange={this.handleDataChange.bind(this, 'cveId')}
	                    value={cveId}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='description'>{f('incidentFields.etsDescription')}</label>
	                <Input
	                    id='description'
	                    onChange={this.handleDataChange.bind(this, 'description')}
	                    value={description}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	        </div>
		</div>
	}
}

TtpEts.propTypes = {
}

export default TtpEts