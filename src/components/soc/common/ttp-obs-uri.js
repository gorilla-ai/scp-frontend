import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'


let t = null
let et = null
let f = null

class TtpObsUri extends Component {
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
		let {activeContent, value: {uriType, uriValue}} = this.props

		return <div className='event-content'>
			<div className='line'>
				<div className='group'>
	                <label htmlFor='uriType'>{f('incidentFields.uriType')}</label>
	                <DropDownList
	                    id='uriType'
	                    onChange={this.handleDataChange.bind(this, 'uriType')}
	                    list={[
	                    	{text: 'URL' , value: 0},
	                    	{text: f('incidentFields.domain'), value: 1}
                    	]}
	                    value={uriType}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	            <div className='group'>
	                <label htmlFor='uriValue'>{f('incidentFields.uriValue')}</label>
	                <Input
	                    id='uriValue'
	                    onChange={this.handleDataChange.bind(this, 'uriValue')}
	                    value={uriValue}
	                    readOnly={activeContent === 'viewIncident'}/>
	            </div>
	        </div>
		</div>
	}
}

TtpObsUri.propTypes = {
}

export default TtpObsUri