import React, {Component} from 'react'
import _ from 'lodash'
import cx from 'classnames'
import i18n from 'i18next'
import PropTypes from 'prop-types'

import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Grid from '@material-ui/core/Grid'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../../common/context'
import helper from '../../../common/helper'
import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const log = require('loglevel').getLogger('accounts/ad-setting')
const t = i18n.getFixedT(null, 'accounts')
const gt = i18n.getFixedT(null, 'app')
const c = i18n.getFixedT(null, 'connections')
const et =  i18n.getFixedT(null, 'errors')

const INIT = {
	open: false,
	info: null,
	error: false,
	adConfig: {
		ip: '',
		port: '',
		domain: '',
		adminAccount: '',
		adminPassword: '',
		isSSL: false, 
		enabled: false
	}
}

class AdConfig extends Component {
	constructor(props) {
		super(props)

		this.state = _.cloneDeep(INIT)
		this.ah = getInstance('chewbacca')
	}


	open = () => {
		const {baseUrl} = this.context

		ah.one({
			url: `${baseUrl}/api/common/config?configId=config.ad`
		})
		.then(data => {
			let adConfig = {
				ip: '',
				port: '',
				domain: '',
				adminAccount: '',
				adminPassword: '',
				isSSL: false, 
				enabled: false
			}

			if (data) {
				adConfig = JSON.parse(data.rt.value)
			}

			this.setState({adConfig, open: true})
		})
    	.catch(err => {
    		helper.showPopupMsg('', c('txt-error'), err.message)
    	})
	}

	close = () => {
		this.setState(_.cloneDeep(INIT))
	}

	testAD = () => {
		const {baseUrl} = this.context
		const {adConfig} = this.state

		ah.one({
			url: `${baseUrl}/api/ad/_test`,
      		data: JSON.stringify(adConfig),
      		type: 'POST',
      		contentType: 'application/json',
      		dataType: 'json'
		})
		.then(data => {
			helper.showPopupMsg(c('auto-settings.txt-connectionsSuccess'));
		})
    	.catch(err => {
    		helper.showPopupMsg(c('auto-settings.txt-connectionsFail'), c('txt-error'));
    	})
	}

	save = () => {
		const {baseUrl} = this.context
		const {adConfig} = this.state

		const payload = {
			configId: 'config.ad',
			value: JSON.stringify(adConfig)
		}

		ah.one({
			url: `${baseUrl}/api/common/config`,
      		data: JSON.stringify(payload),
      		type: 'POST',
      		contentType: 'application/json',
      		dataType: 'json'
		})
		.then(data => {
			this.close()
		})
    	.catch(err => {
    		helper.showPopupMsg('', c('txt-error'), err.message)
    	})
	}

	handleAdChange = (event) => {
		let temp = {...this.state.adConfig}
		temp[event.target.name] = event.target.value
		this.setState({adConfig: temp})
	}
	handleAdStatusChange = (event) => {
		let temp = {...this.state.adConfig}
		temp[event.target.name] = event.target.checked
		this.setState({adConfig: temp})
	}

	render() {
		const {info, error, open, adConfig} = this.state
		const actions = {
			cancel: {text: gt('btn-cancel'), className: 'standard', handler: this.close},
			confirm: {text: gt('btn-ok'), handler: this.save}
		}

		if (!open) {
			return null
		}

		return <ModalDialog className='modal-dialog' title={t('txt-ad-config')} draggable global style={{width: '900px', height: '350px', overflowX: 'hidden'}}
			info={info} infoClassName={cx({'c-error': error})} closeAction='cancel' actions={actions} >
			<Grid container spacing={3} style={{padding: '10px'}}>
				<Grid item xs={3}>
					<TextField name='ip' label='IP' variant='outlined' fullWidth size='small' color='secondary'
						value={adConfig.ip} onChange={this.handleAdChange} />
				</Grid>
				<Grid item xs={3}>
					<TextField name='port' label='Port' variant='outlined' fullWidth size='small' type='number'
						value={adConfig.port} onChange={this.handleAdChange} />
				</Grid>
				<Grid item xs={6}>
					<TextField name='domain' label={c('txt-domain')} variant='outlined' fullWidth size='small' 
						value={adConfig.domain} onChange={this.handleAdChange} />
				</Grid>
				<Grid item xs={4}>
					<TextField name='adminAccount' label={c('auto-settings.txt-username')} variant='outlined' fullWidth size='small' 
						value={adConfig.adminAccount} onChange={this.handleAdChange} />
				</Grid>
				<Grid item xs={4}>
					<TextField name='adminPassword' label={c('auto-settings.txt-password')} variant='outlined' fullWidth size='small' type='password'
						value={adConfig.adminPassword} onChange={this.handleAdChange} />
				</Grid>
				<Grid item xs={2}>
					<FormControlLabel label={t('txt-ssl-connect')} 
						control={<Switch name='isSSL' checked={adConfig.isSSL} onChange={this.handleAdStatusChange} />} />
				</Grid>
				<Grid item xs={2}>
					<FormControlLabel label={c('txt-switch')} 
						control={<Switch name='enabled' checked={adConfig.enabled} onChange={this.handleAdStatusChange} />} />
				</Grid>
				{
					adConfig.enabled &&
					<Grid item xs={12}>
						<Button variant='outlined' color='inherit' onClick={this.testAD} >{t('txt-test-connect')}</Button>
					</Grid>
				}
			</Grid>
		</ModalDialog>
	}
}

AdConfig.contextType = BaseDataContext

export default AdConfig