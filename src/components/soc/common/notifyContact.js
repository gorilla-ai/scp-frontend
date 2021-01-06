import React, {Component} from 'react'
import TextField from '@material-ui/core/TextField';

let t = null
let et = null
let f = null
let it = null;
let at = null;

class NotifyContact extends Component {
	constructor(props) {
		super(props)

		t = global.chewbaccaI18n.getFixedT(null, 'connections')
		et = global.chewbaccaI18n.getFixedT(null, 'errors')
		f = chewbaccaI18n.getFixedT(null, "tableFields");
		it = global.chewbaccaI18n.getFixedT(null, "incident");
		at = global.chewbaccaI18n.getFixedT(null, "account");
	}

	componentDidMount() {
	}


	handleDataChangeMui = (event) => {
		let {onChange, value: curValue} = this.props
		onChange({...curValue, [event.target.name]: event.target.value})
	}

	render() {
		let {activeContent, locale, value: {title, name, phone, email}} = this.props
		const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		return <div className='event-content'>
			<div className='line'>
				<div className='group'>
					<label htmlFor='title'>{f('incidentFields.name')}</label>
					<TextField style={{paddingRight: '2em'}}
					           id='title'
					           name='title'
					           variant='outlined'
					           fullWidth={true}
					           size='small'
					           onChange={this.handleDataChangeMui}
					           value={title}
					           disabled={activeContent === 'viewIncident'}/>
				</div>
				<div className='group'>
					<label htmlFor='name'>{f('incidentFields.reviewerName')}</label>
					<TextField style={{paddingRight: '2em'}}
					           id='name'
					           name='name'
					           variant='outlined'
					           fullWidth={true}
					           size='small'
					           onChange={this.handleDataChangeMui}
					           value={name}
					           disabled={activeContent === 'viewIncident'}/>
				</div>
				<div className='group'>
					<label htmlFor='phone'>{f('incidentFields.phone')}</label>
					<TextField style={{paddingRight: '2em'}}
					           id='phone'
					           name='phone'
					           variant='outlined'
					           fullWidth={true}
					           size='small'
					           onChange={this.handleDataChangeMui}
					           value={phone}
					           disabled={activeContent === 'viewIncident'}/>
				</div>
				<div className='group'>
					<label htmlFor='email'>{f('incidentFields.email')}</label>
					<TextField style={{paddingRight: '2em'}}
					           id='email'
					           name='email'
					           variant='outlined'
					           fullWidth={true}
					           size='small'
					           onChange={this.handleDataChangeMui}
					           value={email}
					           helperText={emailPattern.test(email) ? '' : it('txt-checkRequiredFieldType')}
					           error={email === '' ? false:!emailPattern.test(email)}
					           disabled={activeContent === 'viewIncident'}>
					</TextField>
				</div>
			</div>
		</div>
	}
}

NotifyContact.propTypes = {}

export default NotifyContact