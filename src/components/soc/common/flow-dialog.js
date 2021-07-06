import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from "classnames"

import CheckboxGroup from 'react-ui/build/src/components/checkbox-group'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import TextField from '@material-ui/core/TextField';
import {BaseDataContext} from "../../common/context"
import {default as ah, getInstance} from "react-ui/build/src/utils/ajax-helper"
import helper from "../../common/helper"
import Checkbox from '@material-ui/core/Checkbox';

import Select from 'react-select'
import FormControlLabel from "@material-ui/core/FormControlLabel";
import SocConfig from "../../common/soc-configuration";
import MuiTableContent from "../../common/mui-table-content";

let t = null
let et = null
let it = null

const INIT = {
	open: false,
	activeSteps:1,
	stepTitleList:['SOC 1', 'SOC 2' , '設備單位承辦人', '資訊中心承辦人'],
    id: null
}


class IncidentFlowDialog extends Component {
	constructor(props) {
		super(props)

		t = global.chewbaccaI18n.getFixedT(null, 'connections')
    	et = global.chewbaccaI18n.getFixedT(null, 'errors')
    	it = global.chewbaccaI18n.getFixedT(null, "incident")

    	this.state = _.cloneDeep(INIT)
	}
	componentDidMount() {
	}

	open(id) {
		const {baseUrl, session} = this.context

		ah.one({
			url: `${baseUrl}/api/soc/flowEngine/instance?id=${id}`,
			type: 'GET',
			contentType: 'application/json',
			dataType: 'json'
		}).then(result => {
			console.log('result == ' , result)
			this.setState({open: true})
		}).catch(err => {
			helper.showPopupMsg('', t('txt-error'), err.message)
		})
	}
	close() {
    	this.setState({open: false})
    }

	showUnitStepIcon = (val, i) => {
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
				pos = '0px';
			} else if (locale === 'zh') {
				pos = '0';
			}
			textAttr.style = {left: pos};
		}

		if (index === 2) {
			let pos = '';

			if (locale === 'en') {
				pos = '0px';
			} else if (locale === 'zh') {
				pos = '0px';
			}
			textAttr.style = {left: pos};
		}

		if (index === 3) {
			let pos = '';

			if (locale === 'en') {
				pos = '-27px';
			} else if (locale === 'zh') {
				pos = '-27px';
			}
			textAttr.style = {left: pos};
		}

		if (index === 4) {
			let pos = '';

			if (locale === 'en') {
				pos = '-27px';
			} else if (locale === 'zh') {
				pos = '-27px';
			}
			textAttr.style = {left: pos};
		}

		if (index === 5) {
			let pos = '';

			if (locale === 'en') {
				pos = '-27px';
			} else if (locale === 'zh') {
				pos = '-27px';
			}
			textAttr.style = {left: pos};
		}

		if (index === 6) {
			let pos = '';

			if (locale === 'en') {
				pos = '-27px';
			} else if (locale === 'zh') {
				pos = '-27px';
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

	render() {
    	const {open, stepTitleList, id} = this.state
    	const actions ={
    		cancel: {text: t('txt-cancel'), className:'standard', handler: this.close.bind(this)},
        }

        if (!open) {
            return null
        }

        return<ModalDialog className='incident-tag-modal' style={{width:"1080px"}} title={it('txt-incident-soc-flow')} draggable={true} global={true} closeAction='cancel' actions={actions}>
	        <div className='data-content' style={{minHeight: "26vh"}}>
		        <div className='parent-content'>
			        <div className='main-content basic-form' style={{minHeight: "47vh"}}>
				        <div className='steps-indicator' style={{marginTop: "20vh"}}>
					        {stepTitleList.map(this.showUnitStepIcon)}
				        </div>
			        </div>
		        </div>
	        </div>
        </ModalDialog>
	}
}

IncidentFlowDialog.contextType = BaseDataContext
IncidentFlowDialog.propTypes = {
}

export default IncidentFlowDialog