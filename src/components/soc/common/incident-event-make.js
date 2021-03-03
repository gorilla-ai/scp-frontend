import React, {Component} from "react"
import {default as ah, getInstance} from "react-ui/build/src/utils/ajax-helper"
import Moment from 'moment'
import moment from 'moment'
import FileInput from 'react-ui/build/src/components/file-input'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {BaseDataContext} from "../../common/context"

import helper from "../../common/helper"
import Autocomplete from '@material-ui/lab/Autocomplete';
import Events from '../common/events'
import DataTable from "react-ui/build/src/components/table";
import _ from "lodash";
import {KeyboardDateTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";

import PropTypes from "prop-types";
import queryString from "query-string";
import cx from "classnames";
import NotifyContact from "../common/notifyContact";

let t = null;
let f = null;
let et = null;
let it = null;
let at = null;

const INCIDENT_STATUS_ALL = 0
const INCIDENT_STATUS_UNREVIEWED = 1
const INCIDENT_STATUS_REVIEWED = 2
const INCIDENT_STATUS_CLOSED = 3
const INCIDENT_STATUS_SUBMITTED = 4
const INCIDENT_STATUS_DELETED = 5
const INCIDENT_STATUS_ANALYZED = 6
const INCIDENT_STATUS_EXECUTOR_UNREVIEWED = 7
const INCIDENT_STATUS_EXECUTOR_CLOSE = 8

const SOC_Analyzer = 1
const SOC_Executor = 2
const SOC_Super = 3

class IncidentEventMake extends Component {
	constructor(props) {
		super(props);

		t = global.chewbaccaI18n.getFixedT(null, "connections");
		f = chewbaccaI18n.getFixedT(null, "tableFields");
		et = global.chewbaccaI18n.getFixedT(null, "errors");
		it = global.chewbaccaI18n.getFixedT(null, "incident");
		at = global.chewbaccaI18n.getFixedT(null, "account");

		this.state = {
			INCIDENT_ACCIDENT_LIST: _.map(_.range(1, 6), el => {
				return <MenuItem id={`accident.${el}`} value={el}>{it(`accident.${el}`)}</MenuItem>
			}),
			INCIDENT_ACCIDENT_SUB_LIST: [
				_.map(_.range(11, 17), el => {
					return <MenuItem id={`accident.${el}`} value={el}>{it(`accident.${el}`)}</MenuItem>
				}),
				_.map(_.range(21, 26), el => {
					return <MenuItem id={`accident.${el}`} value={el}>{it(`accident.${el}`)}</MenuItem>
				}),
				_.map(_.range(31, 33), el => {
					return <MenuItem id={`accident.${el}`} value={el}>{it(`accident.${el}`)}</MenuItem>
				}),
				_.map(_.range(41, 45), el => {
					return <MenuItem id={`accident.${el}`} value={el}>{it(`accident.${el}`)}</MenuItem>
				})
			],
			activeContent: 'addIncident', //tableList, viewIncident, editIncident, addIncident
			displayPage: 'main', /* main, events, ttps */
			incidentType: '',
			toggleType: '',
			showFilter: false,
			showChart: true,
			currentIncident: {},
			originalIncident: {},

			relatedListOptions: [],
			deviceListOptions: [],
			incident: {
				dataFieldsArr: ['_menu', 'id', 'tag', 'status', 'createDttm', 'title', 'reporter', 'srcIPListString', 'dstIPListString'],
				fileFieldsArr: ['fileName', 'fileSize', 'fileDttm', 'fileMemo', 'action'],
				flowFieldsArr: ['id', 'status', 'reviewDttm', 'reviewerName', 'suggestion'],
				dataFields: {},
				dataContent: [],
				sort: {
					field: 'createDttm',
					desc: true
				},
				totalCount: 0,
				currentPage: 1,
				pageSize: 20,
				info: {
					status: 1,
					socType: 1
				}
			},
			accountRoleType: SOC_Analyzer,
			loadListType: SOC_Analyzer,
			attach: null,
			contextAnchor: null,
			currentData: {},
			activeSteps: 1,
		};

		this.ah = getInstance("chewbacca");
	}

	componentDidMount() {
		this.getOptions()
	}

	getOptions = () => {
		const {baseUrl, contextRoot} = this.context;

		ah.one({
			url: `${baseUrl}/api/soc/_search`,
			data: JSON.stringify({}),
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json'
		})
			.then(data => {
				if (data) {
					let list = _.map(data.rt.rows, val => {
						let ipContent = '';

						if (val.eventList) {
							val.eventList = _.map(val.eventList, el => {
								if (el.eventConnectionList) {
									el.eventConnectionList = _.map(el.eventConnectionList, ecl => {
										ipContent += '(' + it('txt-srcIp') + ': ' + ecl.srcIp + ')'
									})
								}
							})
						}

						return {
							value: val.id,
							text: val.id + ' (' + it(`category.${val.category}`) + ')' + ipContent
						}
					});

					this.setState({relatedListOptions: list})
				}
			})
			.catch(err => {
				helper.showPopupMsg('', t('txt-error'), err.message)
			});

		ah.one({
			url: `${baseUrl}/api/soc/device/_search`,
			data: JSON.stringify({}),
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json'
		})
			.then(data => {
				if (data) {
					let list = _.map(data.rt.rows, val => {
						return {value: val.id, text: val.deviceName}
					});

					this.setState({deviceListOptions: list})
				}
			})
			.catch(err => {
				helper.showPopupMsg('', t('txt-error'), err.message)
			})


	};

	handleOpenMenu = (data, event) => {
		this.setState({
			contextAnchor: event.currentTarget,
			currentData: data
		});
	}

	handleCloseMenu = () => {
		this.setState({
			contextAnchor: null,
			currentData: {}
		});
	}

	toggleSteps = (type) => {
		const { activeSteps, formValidation} = this.state;
		let tempActiveSteps = activeSteps;
		let tempFormValidation = {...formValidation};
		if (type === 'previous') {
			tempActiveSteps--;
			this.setState({
				activeSteps: tempActiveSteps
			});
		} else if (type === 'next') {
			if (activeSteps === 1) {
				let validate = true;

				this.setState({
					formValidation: tempFormValidation
				});

				if (!validate) {
					return;
				}

				tempActiveSteps++;
				this.setState({
					activeSteps: tempActiveSteps
				});
			}
		}
	}

	/* ------------------ View ------------------- */
	render() {
		return <div>
			<div className='data-content'>

				<div className='parent-content'>
					{this.displayEditContent()}
				</div>
			</div>
		</div>
	}

	showAddSteps = (val, i) => {
		const {locale} = this.context;
		const {activeSteps} = this.state;
		const index = ++i;
		const groupClass = 'group group' + index;
		const lineClass = 'line line' + index;
		const stepClass = 'step step' + index;
		const textClass = 'text';

		let textAttr = {
			className: textClass
		};

		if (index === 1) {
			let pos = '';

			if (locale === 'en') {
				pos = '-11px';
			} else if (locale === 'zh') {
				pos = '0';
			}
			textAttr.style = {left: pos};
		}

		if (index === 2) {
			let pos = '';

			if (locale === 'en') {
				pos = '-1px';
			} else if (locale === 'zh') {
				pos = '-22px';
			}
			textAttr.style = {left: pos};
		}

		if (index === 3) {
			let pos = '';

			if (locale === 'en') {
				pos = '-1px';
			} else if (locale === 'zh') {
				pos = '-6px';
			}
			textAttr.style = {left: pos};
		}

		if (index === 4) {
			let pos = '';

			if (locale === 'en') {
				pos = '5px';
			} else if (locale === 'zh') {
				pos = '-1px';
			}
			textAttr.style = {left: pos};
		}

		return (
			<div className={groupClass} key={index}>
				<div className={cx(lineClass, {active: activeSteps >= index})}></div>
				<div className={cx(stepClass, {active: activeSteps >= index})}>
					<div className='wrapper'><span className='number'>{index}</span></div>
					<div {...textAttr}>{val}</div>
				</div>
			</div>
		)
	}

	displayEditContent = () => {
		const {session} = this.context
		const {activeSteps} = this.state;

		const stepText = [t('edge-management.txt-basicInfo'), it('txt-incident-events')];
		return <div className='main-content basic-form'>
			{/*<div className='steps-indicator'>*/}
			{/*	{stepText.map(this.showAddSteps)}*/}
			{/*</div>*/}
			<div className='auto-settings' style={{width: '100vh'}}>
				{
					activeSteps === 1 && this.displayMainPage()
				}
				{
					activeSteps === 1 && this.displayNoticePage()
				}
				{
					activeSteps === 1 && this.displayAttached()
				}
				{
					activeSteps === 1 && this.displayConnectUnit()
				}
				{
					activeSteps === 2 && this.displayEventsPage()
				}
			</div>
		</div>
	};

	displayMainPage = () => {
		const {incidentType} = this.state;
		const {traceAlertData, remoteIncident} = this.props;
		const {locale} = this.context;
		let dateLocale = locale;

		if (locale === 'zh') {
			dateLocale += '-tw';
		}

		moment.locale(dateLocale);

		return <div className='form-group normal'>
			<header>
				<div className='text'>{t('edge-management.txt-basicInfo')}</div>
			</header>

			<Button id='previousStep' className='last-left' disabled={this.state.activeSteps === 1} style={{backgroundColor: '#001b34', color: '#FFFFFF'}}
			        onClick={this.toggleSteps.bind(this, 'previous')}>{it('txt-prev-page')}</Button>

			<Button id='nextStep' className='last' disabled={this.state.activeSteps === 2} style={{backgroundColor: '#001b34', color: '#FFFFFF'}}
			        onClick={this.toggleSteps.bind(this, 'next')}>{it('txt-next-page')}</Button>

			<div className='group'>
				<label htmlFor='title'>{f('incidentFields.title')}</label>
				<TextField
					id='title'
					name='title'
					variant='outlined'
					fullWidth={true}
					size='small'
					onChange={this.handleDataChangeMui}
					value={remoteIncident.info.title}
					helperText={it('txt-required')}
					required
					error={!(remoteIncident.info.title || '')}/>
			</div>
			<div className='group'>
				<label htmlFor='category'>{f('incidentFields.category')}</label>
				<TextField
					id='category'
					name='category'
					variant='outlined'
					fullWidth={true}
					size='small'
					onChange={this.handleDataChangeMui}
					helperText={it('txt-required')}
					required
					select
					value={remoteIncident.info.category}
					error={!(remoteIncident.info.category || '')}>
					{_.map(_.range(1, 9), el => {
						return <MenuItem id={`category.${el}`} value={el}>{it(`category.${el}`)}</MenuItem>
					})}
				</TextField>
			</div>
			<div className='group'>
				<label htmlFor='reporter'>{f('incidentFields.reporter')}</label>
				<TextField
					id='reporter'
					name='reporter'
					variant='outlined'
					fullWidth={true}
					size='small'
					onChange={this.handleDataChangeMui}
					required
					helperText={it('txt-required')}
					error={!(remoteIncident.info.reporter || '')}
					value={remoteIncident.info.reporter}
				/>
			</div>
			<div className='group' style={{width: '25vh'}}>
				<label htmlFor='impactAssessment'>{f('incidentFields.impactAssessment')}</label>
				<TextField
					id='impactAssessment'
					variant='outlined'
					fullWidth={true}
					size='small'
					select
					name='impactAssessment'
					onChange={this.handleDataChangeMui}
					required
					helperText={it('txt-required')}
					value={remoteIncident.info.impactAssessment}
					error={!(remoteIncident.info.impactAssessment || '')}
					>
					{
						_.map(_.range(1, 5), el => {
							return <MenuItem id={`day.${el}`} value={el}>{`${el} (${(9 - 2 * el)} ${it('txt-day')})`}</MenuItem>
						})
					}
				</TextField>
			</div>

			<div className='group' style={{width: '25vh'}}>
				<label htmlFor='expireDttm'>{f('incidentFields.finalDate')}</label>
				<MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
					<KeyboardDateTimePicker
						id='expireDttm'
						className='date-time-picker'
						inputVariant='outlined'
						variant='inline'
						format='YYYY-MM-DD HH:mm'
						ampm={false}
						required
						helperText={it('txt-required')}
						value={remoteIncident.info.expireDttm}
						onChange={this.handleDataChange.bind(this, 'expireDttm')}/>
				</MuiPickersUtilsProvider>
			</div>

			{incidentType === 'ttps' && <div className='group full'>
				<label htmlFor='description'>{f('incidentFields.description')}</label>
				<TextField
					id='description'
					onChange={this.handleDataChangeMui}
					required
					variant='outlined'
					fullWidth={true}
					size='small'
					multiline
					rows={4}
					rowsMax={5}
					helperText={it('txt-required')}
					name='description'
					error={!(remoteIncident.info.description || '')}
					value={remoteIncident.info.description}
				/>
			</div>}
		</div>
	};

	formatBytes = (bytes, decimals = 2) => {
		if (bytes === 0 || bytes === '0') {
			return '0 Bytes';
		}

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

	getErrorMsg = (code, params) => {
		if (params.code === 'file-too-large') {
			return it('file-too-large')
		}
	}

	uploadAttachmentModal() {
		PopupDialog.prompt({
			title: t('txt-upload'),
			confirmText: t('txt-confirm'),
			cancelText: t('txt-cancel'),
			display: <div className='c-form content'>
				<div>
					<FileInput id='attach' name='file' validate={{max: 20, t: this.getErrorMsg}}
					           onChange={this.handleAFChange} btnText={t('txt-selectFile')}/>
				</div>
				<div>
					<label>{it('txt-fileMemo')}</label>
					<TextareaAutosize id='comment'
					                  className='textarea-autosize' rows={3}/>
				</div>
			</div>,
			act: (confirmed, data) => {

				if (confirmed) {
					let flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]<>+《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")

					if (flag.test(data.file.name)) {
					} else {
						this.uploadAttachmentByModal(data.file, data.comment)
					}
				}
			}
		})
	}

	displayAttached = () => {
		const {traceAlertData, remoteIncident} = this.props;

		return <div className='form-group normal'>
			<header>
				<div className='text'>{it('txt-attachedFile')}<span
					style={{color: 'red', 'fontSize': '0.8em'}}>{it('txt-attachedFileHint')}</span></div>
			</header>
			{
				<div className='group'>
					<FileInput
						id='attach'
						name='file'
						className='file-input'
						validate={{max: 20, t: this.getErrorMsg}}
						onChange={this.handleAttachChange}
						btnText={t('txt-selectFile')}
					/>
				</div>
			}
			{
				<div className='group'>
					<label htmlFor='fileMemo'>{it('txt-fileMemo')}</label>
					<TextareaAutosize
						id='fileMemo'
						name='fileMemo'
						className='textarea-autosize'
						onChange={this.handleDataChangeMui}
						value={remoteIncident.info.fileMemo}
						rows={2}/>
				</div>
			}

		</div>
	}

	displayNoticePage = () => {
		const {INCIDENT_ACCIDENT_LIST, INCIDENT_ACCIDENT_SUB_LIST} = this.state;
		const {traceAlertData, remoteIncident} = this.props;

		return <div className='form-group normal'>
			<header>
				<div className='text'>{it('txt-accidentTitle')}</div>
			</header>

			<div className='group'>
				<label htmlFor='accidentCatogory'>{it('txt-accidentClassification')}</label>
				<TextField
					id='accidentCatogory'
					name='accidentCatogory'
					select
					variant='outlined'
					fullWidth={true}
					size='small'
					onChange={this.handleDataChangeMui}
					value={remoteIncident.info.accidentCatogory}
				>
					{INCIDENT_ACCIDENT_LIST}
				</TextField>
			</div>
			{remoteIncident.info.accidentCatogory === '5' &&
			<div className='group'>
				<label htmlFor='accidentAbnormal'>{it('txt-reason')}</label>
				<TextField
					id='accidentAbnormal'
					name='accidentAbnormal'
					variant='outlined'
					fullWidth={true}
					size='small'
					onChange={this.handleDataChangeMui}
					value={remoteIncident.info.accidentAbnormalOther}
				/>
			</div>
			}
			{remoteIncident.info.accidentCatogory !== '5' &&
			<div className='group'>
				<label htmlFor='accidentAbnormal'>{it('txt-reason')}</label>
				<TextField
					id='accidentAbnormal'
					name='accidentAbnormal'
					select
					variant='outlined'
					fullWidth={true}
					size='small'
					onChange={this.handleDataChangeMui}
					value={remoteIncident.info.accidentAbnormal}>
					{INCIDENT_ACCIDENT_SUB_LIST[remoteIncident.info.accidentCatogory - 1]}
				</TextField>
			</div>
			}

			<div className='group full'>
				<label htmlFor='accidentDescription'>{it('txt-accidentDescr')}</label>
				<TextareaAutosize
					id='accidentDescription'
					name='accidentDescription'
					className='textarea-autosize'
					onChange={this.handleDataChangeMui}
					value={remoteIncident.info.accidentDescription}
					rows={3}
				/>
			</div>
			<div className='group full'>
				<label htmlFor='accidentReason'>{it('txt-reasonDescr')}</label>
				<TextareaAutosize
					id='accidentReason'
					name='accidentReason'
					className='textarea-autosize'
					onChange={this.handleDataChangeMui}
					value={remoteIncident.info.accidentReason}
					rows={3}
				/>
			</div>
			<div className='group full'>
				<label htmlFor='accidentInvestigation'>{it('txt-accidentInvestigation')}</label>
				<TextareaAutosize
					id='accidentInvestigation'
					name='accidentInvestigation'
					className='textarea-autosize'
					onChange={this.handleDataChangeMui}
					value={remoteIncident.info.accidentInvestigation}
					rows={3}
				/>
			</div>
		</div>
	}

	displayConnectUnit = () => {
		const {activeContent} = this.state;
		const {traceAlertData, remoteIncident} = this.props;

		return <div className='form-group normal'>
			<header>
				<div className='text'>{it('txt-notifyUnit')}</div>
			</header>

			<div className='group full multi'>
				<MultiInput
					id='incidentEvent'
					className='incident-group'
					base={NotifyContact}
					defaultItemValue={{title: '', name: '', phone: '', email: ''}}
					value={remoteIncident.info.notifyList}
					props={{activeContent: activeContent}}
					onChange={this.handleConnectContactChange}
				/>
			</div>
		</div>
	}

	displayEventsPage = () => {
		const {incidentType, activeContent, incident, deviceListOptions} = this.state;
		const {traceAlertData, remoteIncident} = this.props;
		const {locale} = this.context;

		const now = new Date();
		const nowTime = Moment(now).local().format('YYYY-MM-DD HH:mm:ss');

		return <div className='form-group normal'>
			<header>
				<div className='text'>{it('txt-incident-events')}</div>
			</header>

			<Button id='previousStep' className='last-left' disabled={this.state.activeSteps === 1} style={{backgroundColor: '#001b34', color: '#FFFFFF'}}
			        onClick={this.toggleSteps.bind(this, 'previous')}>{it('txt-prev-page')}</Button>

			<Button id='nextStep' className='last' disabled={this.state.activeSteps === 2} style={{backgroundColor: '#001b34', color: '#FFFFFF'}}
			        onClick={this.toggleSteps.bind(this, 'next')}>{it('txt-next-page')}</Button>


			<div className='group full multi'>
				<MultiInput
					id='incidentEvent'
					className='incident-group'
					base={Events}
					defaultItemValue={{description: '', deviceId: '', time: {from: nowTime, to: nowTime}, frequency: 1}}
					value={remoteIncident.info.eventList}
					props={{activeContent: activeContent, locale: locale, deviceListOptions: deviceListOptions}}
					onChange={this.handleEventsChange}
					/>
			</div>
		</div>
	};

	handleDataChange = (type, value) => {
		this.props.handleDataChange(type, value)
	};

	handleDataChangeMui = (event) => {
		this.props.handleDataChangeMui(event)
	}

	handleEventsChange = (val) => {
		this.props.handleEventsChange(val);
	};

	handleConnectContactChange = (val) => {
		this.props.handleConnectContactChange(val);
	};

	handleAttachChange = (val) => {
		this.props.handleAttachChange(val)
	}

}

IncidentEventMake.contextType = BaseDataContext;
IncidentEventMake.propTypes = {
	traceAlertData: PropTypes.string.isRequired,
	remoteIncident: PropTypes.string.isRequired,
	handleDataChange: PropTypes.func.isRequired,
	handleDataChangeMui: PropTypes.func.isRequired,
	handleEventsChange: PropTypes.func.isRequired,
	handleConnectContactChange: PropTypes.func.isRequired,
	handleAttachChange: PropTypes.func.isRequired,
	handleAFChange: PropTypes.func.isRequired
};

export default IncidentEventMake
