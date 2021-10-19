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
class IncidentSoc extends Component {
	constructor(props) {
		super(props);

		this.state = {
			activeContent: 'viewMode', //viewMode, editMode
			originalSetting: {},
			accountType:constants.soc.LIMIT_ACCOUNT,

			socSettings: {
				companyName: '',
				companyAbbreviation: '',
				ip: '',
				port: '',
				account: '',
				password: '',
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

		helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

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
		const {socSettings} = this.state;

		this.ah.all([
			{
				url: `${baseUrl}/api/soc/settings/_search`,
				type: 'GET'
			}
		])
			.then(data => {
				if (data) {
					const data1 = data[0];

					const tmpSocSetting = {
						companyName: data1.companyName,
						companyAbbreviation: data1.companyAbbreviation,
						ip: data1.ip,
						port: data1.port,
						account: data1.account,
						password: data1.password,
					};

					this.setState({
                      originalSetting: _.cloneDeep(socSettings),
                      socSettings : tmpSocSetting,
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
		let tmpSocSetting = {...this.state.socSettings};
		tmpSocSetting[event.target.name] = event.target.value;

		this.setState({
			socSettings: tmpSocSetting
		});
	}

	handleChange(field, value) {
		let tmpSocSetting = {...this.state.socSettings};

		tmpSocSetting[field] = value
		this.setState({socSettings:tmpSocSetting})
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
		const {socSettings} = this.state;

		const apiArr = [
			{
				url: `${baseUrl}/api/soc/settings/_update`,
				data: JSON.stringify(socSettings),
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
		const {activeContent, socSettings, accountType} = this.state;
		return (
			<div>
				<div className='sub-header'/>

				<div className='data-content'>
					<SocConfig baseUrl={baseUrl} contextRoot={contextRoot} session={session} accountType={accountType} />

					<div className='parent-content'>
						<div className='main-content basic-form'>
							<header className='main-header'>{it('txt-incident-soc-config')}</header>

							{activeContent === 'viewMode' &&
							<div className='content-header-btns'>
								<Button variant='contained' color='primary'
								        onClick={this.toggleContent.bind(this, 'editMode')}>{t('txt-edit')}</Button>
							</div>
							}

							<div className='config-notify'
							     style={{height: activeContent === 'viewMode' ? '78vh' : '70vh'}}>

								<div className='form-group normal short'>
									<header>{it('soc.txt-config-setting')}</header>

									<div className='group'  style={{width: '50%'}}>
										<TextField
											id='companyName'
											name='companyName'
											label={it('soc.txt-companyName')}
											variant='outlined'
											fullWidth
											required
											size='small'
											placeholder={it('soc.txt-companyName-sample')}
											value={socSettings.companyName}
											onChange={this.handleDataChange}
											disabled={activeContent === 'viewMode'}/>
									</div>
									<div className='group' style={{width: '50%'}}>
										<TextField
											id='companyAbbreviation'
											name='companyAbbreviation'
											label={it('soc.txt-companyAbbreviation')}
											variant='outlined'
											fullWidth
											required
											size='small'
											placeholder={it('soc.txt-companyAbbreviation-sample')}
											value={socSettings.companyAbbreviation}
											onChange={this.handleDataChange}
											disabled={activeContent === 'viewMode'}/>
									</div>
									<div className='group'  style={{width: '25%'}}>
										<TextField
											id='ip'
											name='ip'
											label={it('soc.txt-ip')}
											variant='outlined'
											fullWidth
											required
											size='small'
											value={socSettings.ip}
											onChange={this.handleDataChange}
											disabled={activeContent === 'viewMode'}/>
									</div>
									<div className='group'  style={{width: '25%'}}>
										<TextField
											id='port'
											name='port'
											label={it('soc.txt-port')}
											variant='outlined'
											fullWidth
											required
											size='small'
											value={socSettings.port}
											error={!helper.ValidatePort(socSettings.port)}
											onChange={this.handleDataChange}
											disabled={activeContent === 'viewMode'}/>
									</div>
									<div className='group'  style={{width: '25%'}}>
										<TextField
											id='account'
											name='account'
											label={it('soc.txt-account')}
											variant='outlined'
											fullWidth
											required
											size='small'
											value={socSettings.account}
											onChange={this.handleDataChange}
											disabled={activeContent === 'viewMode'}/>
									</div>
									<div className='group'  style={{width: '25%'}}>
										<TextField
											id='password'
											name='password'
											label={it('soc.txt-password')}
											variant='outlined'
											type='password'
											fullWidth
											required
											size='small'
											value={socSettings.password}
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

IncidentSoc.contextType = BaseDataContext;

IncidentSoc.propTypes = {};

export default withRouter(IncidentSoc);