import React, {Component} from 'react'
import {withRouter} from 'react-router'

import {ReactMultiEmail} from 'react-multi-email';

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context';
import Config from '../common/configuration'
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'
import 'react-multi-email/style.css';
import SocConfig from "../common/soc-configuration";
import Switch from "@material-ui/core/Switch";
import constants from "../constant/constant-incidnet";

let t = null;
let it = null;
let et = null;

/**
 * Notifications
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Config Notifications page
 */
class IncidentIsac extends Component {
	constructor(props) {
		super(props);

		this.state = {
			activeContent: 'viewMode', //viewMode, editMode
			originalSetting: {},
			accountType:constants.soc.LIMIT_ACCOUNT,
			isacSettings: {
				url: '',
				account: '',
				key: '',
				sendFlag: false,
			},
		};

		t = global.chewbaccaI18n.getFixedT(null, 'connections');
		it = global.chewbaccaI18n.getFixedT(null, 'incident');
		et = global.chewbaccaI18n.getFixedT(null, 'errors');
		this.ah = getInstance('chewbacca');
	}

	componentDidMount() {
		const {baseUrl, locale, sessionRights} = this.context;

		helper.getPrivilegesInfo(sessionRights, 'soc', locale);
		helper.inactivityTime(baseUrl, locale);

		this.checkAccountType();
		this.getSettingInfo();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.location.state === 'viewMode') {
			this.toggleContent('viewMode');
		}
	}

	checkAccountType = () =>{
		const {baseUrl, session} = this.context;
		let requestData={
			account:session.accountId
		}
		ah.one({
			url: `${baseUrl}/api/soc/unit/limit/_check`,
			data: JSON.stringify(requestData),
			type: 'POST',
			contentType: 'text/plain'
		})
			.then(data => {
				if (data) {

					if (data.rt.isLimitType === constants.soc.LIMIT_ACCOUNT){
						this.setState({
							accountType: constants.soc.LIMIT_ACCOUNT
						})
					}else  if (data.rt.isLimitType === constants.soc.NONE_LIMIT_ACCOUNT){
						this.setState({
							accountType: constants.soc.NONE_LIMIT_ACCOUNT
						})
					}else {
						this.setState({
							accountType: constants.soc.CHECK_ERROR
						})
					}
				}
			})
			.catch(err => {
				helper.showPopupMsg('', t('txt-error'), err.message)
			});
	}

	/**
	 * Get and set mail and notification data
	 * @method
	 */
	getSettingInfo = () => {
		const {baseUrl} = this.context;
		const {isacSettings} = this.state;

		this.ah.all([
			{
				url: `${baseUrl}/api/soc/isacSettings/_search`,
				type: 'GET'
			}
		])
			.then(data => {
				if (data) {
					const data1 = data[0];

					const tmpIsacSetting = {
                      url: data1.url,
                      account: data1.account,
                      key: data1.key,
                      sendFlag: data1.sendFlag,
					};

					this.setState({
                      originalSetting: _.cloneDeep(isacSettings),
                      isacSettings : tmpIsacSetting,
					});
				}
				return null;
			})
			.catch(err => {
				helper.showPopupMsg('', t('txt-error'), err.message);
			})
	}
	/**
	 * Handle email settings input data change
	 * @method
	 * @param {object} event - event object
	 */
	handleDataChange = (event) => {
		let tmpIsacSettings = {...this.state.isacSettings};
		tmpIsacSettings[event.target.name] = event.target.value;

		this.setState({
			isacSettings: tmpIsacSettings
		});
	}

	handleChange(field, value) {
		let tmpIsacSettings = {...this.state.isacSettings};

		tmpIsacSettings[field] = value
		this.setState({isacSettings:tmpIsacSettings})
	}

	/**
	 * Toggle different content
	 * @method
	 * @param {string} type - content type ('editMode', 'viewMode', 'save' or 'cancel')
	 */
	toggleContent = (type) => {
		let showPage = type;

		if (type === 'save') {
			this.handleConfirm();
			return;
		} else if (type === 'viewMode' || type === 'cancel') {
			showPage = 'viewMode';
		}

		this.setState({
			activeContent: showPage
		},()=>{
			this.getSettingInfo();
		});
	}
	/**
	 * Handle edit confirm
	 * @method
	 */
	handleConfirm = () => {
		const {baseUrl} = this.context;
		const {isacSettings} = this.state;

		const apiArr = [
			{
				url: `${baseUrl}/api/soc/isacSettings/_update`,
				data: JSON.stringify(isacSettings),
				type: 'POST',
				contentType: 'application/json',
				dataType: 'json'
			}
		];
		this.ah.all(apiArr)
			.then(data => {
				if (data) {
					this.getSettingInfo();
					this.toggleContent('viewMode');
				}
				return null;
			})
			.catch(err => {
				helper.showPopupMsg('', t('txt-error'), err.message);
			})
	}

	render() {
		const {baseUrl, contextRoot, session} = this.context;
		const {activeContent, isacSettings, accountType} = this.state;
		return (
			<div>
				<div className='sub-header'/>

				<div className='data-content'>
					<SocConfig baseUrl={baseUrl} contextRoot={contextRoot} session={session} accountType={accountType} />

					<div className='parent-content'>
						<div className='main-content basic-form'>
							<header className='main-header'>{it('txt-incident-isac-config')}</header>

							{activeContent === 'viewMode' &&
							<div className='content-header-btns'>
								<Button variant='contained' color='primary'
								        onClick={this.toggleContent.bind(this, 'editMode')}>{t('txt-edit')}</Button>
							</div>
							}

							<div className='config-notify'
							     style={{height: activeContent === 'viewMode' ? '78vh' : '70vh'}}>
								<div className='form-group normal short'>
									<header>{it('isac.txt-sendFlag')}</header>

									<div className='group'>
										<FormControlLabel
											className='switch-control'
											control={
												<Switch
													checked={isacSettings.sendFlag}
													onChange={(event) => this.handleChange('sendFlag', event.target.checked)}
													color='primary' />
											}
											label={t('txt-switch')}
											disabled={activeContent === 'viewMode'}
										/>
									</div>
								</div>

								<div className='form-group normal short'>
									<header>{it('isac.txt-config-setting')}</header>

									<div className='group'  style={{width: '50%'}}>
										<TextField
											id='url'
											name='url'
											label={it('isac.txt-url')}
											variant='outlined'
											fullWidth
											size='small'
											value={isacSettings.url}
											onChange={this.handleDataChange}
											disabled={activeContent === 'viewMode'}/>
									</div>
									<div className='group' style={{width: '25%'}}>
										<TextField
											id='account'
											name='account'
											label={it('isac.txt-account')}
											variant='outlined'
											fullWidth
											size='small'
											value={isacSettings.account}
											onChange={this.handleDataChange}
											disabled={activeContent === 'viewMode'}/>
									</div>
									<div className='group'  style={{width: '25%'}}>
										<TextField
											id='key'
											name='key'
											label={it('isac.txt-key')}
											variant='outlined'
											fullWidth
											size='small'
											value={isacSettings.key}
											onChange={this.handleDataChange}
											disabled={activeContent === 'viewMode'}/>
									</div>
								</div>
							</div>

							{activeContent === 'editMode' &&
							<footer>
								<Button variant='outlined' color='primary' className='standard'
								        onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</Button>
								<Button variant='contained' color='primary'
								        onClick={this.toggleContent.bind(this, 'save')}>{t('txt-save')}</Button>
							</footer>
							}
						</div>
					</div>
				</div>
			</div>
		)
	}
}

IncidentIsac.contextType = BaseDataContext;

IncidentIsac.propTypes = {};

export default withRouter(IncidentIsac);