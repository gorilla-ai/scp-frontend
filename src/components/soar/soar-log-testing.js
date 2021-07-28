import React, {Component} from 'react'
import PropTypes from 'prop-types'

import Button from '@material-ui/core/Button'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import {BaseDataContext} from '../common/context'
import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'
import MultiInput from "react-ui/build/src/components/multi-input";
import Log from "./logs";
import FileUpload from "../common/file-upload";
import FastForwardIcon from '@material-ui/icons/FastForward';

let t = null;
let et = null;


class SoarLogTesting extends Component {
	constructor(props) {
		super(props);

		this.state = {
			resultLogs: [],
			sourceLogs:[],
			openUploadDialog:false,
			logFile:{}
		};

		t = global.chewbaccaI18n.getFixedT(null, 'connections');
		et = global.chewbaccaI18n.getFixedT(null, 'errors');
		this.ah = getInstance('chewbacca');
	}

	componentDidMount() {
	}

	/**
	 * Display settings content
	 * @method
	 * @returns HTML DOM
	 */
	displaySettings = () => {
		const {resultLogs, sourceLogs, openUploadDialog} = this.state
		const {soarFlow} = this.props;

		const {locale} = this.context;

		let logsProps = {
			activeContent: 'editMode',
			sourceLogs,
			resultLogs
		}
		let resultProps = {
			activeContent: 'viewMode',
			sourceLogs,
			resultLogs
		}

		return (
			<div className='data-content'>
				{openUploadDialog &&
					this.importDialog()
				}
				<div className='parent-content' style={{backgroundColor:'transparent'}}>
					<div className='main-content basic-form' style={{border:'none'}}>
						<div className='edit-soar-config'>
							<div className='pattern-content' style={{width:'100%'}}>
								<div className='syslog-config'>
									<div className='filters'>
										<div className='data-result'>
											<div className='left-syslog'>
												<div className='form-group normal long full-width syslog-config'>
													<header style={{top: '-53px'}}>
														Logs
														<Button
															style={{marginLeft: locale === 'en' ? '23.25rem' : '22.95rem'}}
															variant='outlined' color='primary' className='standard'
															onClick={this.toggleUploadDialog}>
															{t('soar.txt-upload')}
														</Button>
													</header>

													<div className='group full multi'>
														<MultiInput
															base={Log}
															props={logsProps}
															defaultItemValue={{
																log: '',
															}}
															value={sourceLogs}
															onChange={this.setLogsData}
														/>
													</div>
												</div>
											</div>

											<Button
												style={{
													float: 'left',
													width: '10%',
													marginTop: '250px',
													textAlign: 'center'
												}}
												variant="contained"
												color="primary"
												onClick={this.dryRunLogs}
												startIcon={<FastForwardIcon/>}
											>{t('soar.txt-dryRun')}
											</Button>

											<div className='left-syslog'>
												<div className='form-group normal long full-width syslog-config'>
													<header style={{top: '-53px'}}>Result</header>
													<div className='group full multi'>
														<MultiInput
															base={Log}
															props={resultProps}
															defaultItemValue={{
																log: '',
															}}
															value={resultLogs}
															onChange={this.setLogsData}
															disabled={true}
														/>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	render() {
		const titleText = t('soar.txt-Settings');
		const actions = {
			cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.closeDialog},
		};

		return (
			<ModalDialog
				id='soarTestingDialog'
				className='modal-dialog'
				title={titleText}
				draggable={true}
				global={true}
				actions={actions}
				closeAction='cancel'>
				{this.displaySettings()}
			</ModalDialog>
		)
	}

	setLogsData = (logs) => {
		this.setState({
			sourceLogs:logs
		});
	}

	dryRunLogs = () =>{
		const {baseUrl} = this.context;
		const {soarFlow, soarRule, soarCondition, soarIndividualData} = this.props;
		const {sourceLogs} = this.state;

		let requestLogList = [];

		_.forEach(sourceLogs, val =>{
			requestLogList.push(val.log)
		})

		let requestBody = {
			flow: {
				flowName: soarRule.name,
				aggField: soarRule.aggFieldId,
				isEnable: soarIndividualData.isEnable,
				condition: soarCondition,
				flow: soarFlow
			},
			logs: requestLogList
		}

		console.log("dryRunLogs flow == " ,requestBody)

		// const url = `${baseUrl}/api/soar/dryRun`;
		// let requestData = {
		// 	flow: soarFlow,
		// 	logs:sourceLogs
		// };
		//
		// this.ah.one({
		// 	url,
		// 	data: JSON.stringify(requestData),
		// 	type: 'POST',
		// 	contentType: 'text/plain'
		// }).then(data => {
		// 		console.log("data == " ,data)
		// }).catch(err => {
		// 		helper.showPopupMsg('', t('txt-error'), err.message);
		// })

	}

	importDialog = () => {

		const actions = {
			cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleUploadDialog},
			confirm: {text: t('txt-confirm'), handler: this.confirmUpload}
		};
		const title = t('soar.txt-upload');
		const fileTitle = t('edge-management.txt-logFile') + '(.txt/.log/.json)';

		return (
			<ModalDialog
				id='importThreatsDialog'
				className='modal-dialog'
				title={title}
				draggable={true}
				global={true}
				actions={actions}
				closeAction='cancel'>
				<FileUpload
					id='importTestLog'
					fileType='log'
					supportText={fileTitle}
					btnText={t('txt-upload')}
					handleFileChange={this.getFile} />
			</ModalDialog>
		)
	}

	getFile = (file) => {
		this.setState({
			logFile: file
		});
	}

	toggleUploadDialog = () => {
		this.setState({
			openUploadDialog: !this.state.openUploadDialog
		});
	}

	confirmUpload = () => {
		const {baseUrl} = this.context;
		const {logFile} = this.state;
		let formData = new FormData();
		formData.append('file', logFile);

		// ah.one({
		// 	url: `${baseUrl}/api/threat/upload`,
		// 	data: formData,
		// 	type: 'POST',
		// 	processData: false,
		// 	contentType: false
		// })
		// 	.then(data => {
		// 		if (data.ret === 0) {
		// 			helper.showPopupMsg(t('edge-management.txt-addSuccess'));
		// 			this.toggleImportThreats();
		//
		// 			this.setState({
		// 				indicatorsData: null
		// 			}, () => {
		// 				this.getChartsData();
		// 			});
		// 		} else if (data.ret === -1) {
		// 			helper.showPopupMsg('', t('txt-error'), err.message);
		// 		}
		// 		return null;
		// 	})
		// 	.catch(err => {
		// 		helper.showPopupMsg('', t('txt-error'), err.message);
		// 	})
	}
}

SoarLogTesting.contextType = BaseDataContext;

SoarLogTesting.propTypes = {
	soarColumns: PropTypes.object.isRequired,
	soarFlow: PropTypes.array.isRequired,
	soarCondition: PropTypes.array.isRequired,
	soarRule: PropTypes.array.isRequired,
	soarIndividualData: PropTypes.array.isRequired,
	activeElementType: PropTypes.string.isRequired,
	activeElement: PropTypes.object.isRequired,
	confirmSoarFlowData: PropTypes.func.isRequired,
	closeDialog: PropTypes.func.isRequired
};

export default SoarLogTesting;