import React, {Component} from 'react'
import _ from 'lodash'
import cx from "classnames"
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import {BaseDataContext} from "../../common/context"
import {default as ah} from "react-ui/build/src/utils/ajax-helper"
import helper from "../../common/helper"

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
		let tempList = [];
		let checkList = [];
		let activeSteps = 1;
		ah.one({
			url: `${baseUrl}/api/soc/flowEngine/instance?id=${id}`,
			type: 'GET',
			contentType: 'application/json',
			dataType: 'json'
		}).then(result => {
			Object.keys(result.rt.entities).forEach(key => {
				let tmpData = {
					step: result.rt.entities[key].entityName,
					updateTime: result.rt.entities[key].updateTime ? result.rt.entities[key].updateTime : ''
				}
				checkList.push(result.rt.entities[key].entityName)
				tempList.push(tmpData)
			})
			activeSteps = checkList.indexOf(result.rt.currentEntity[id].entityName) + 1
			this.setState({open: true, activeSteps: activeSteps, stepTitleList: tempList})
		}).catch(err => {
			helper.showPopupMsg('', t('txt-error'), it('txt-flow-msg-na'))
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
		let timeAttr = {
			className: textClass
		};
		timeAttr.style = {left: '-44px',top:'90px'};

		if (index === 1) {
			let pos = '';

			if (locale === 'en') {
				pos = '-14px';
			} else if (locale === 'zh') {
				pos = '-14px';
			}
			textAttr.style = {left: pos};
		}

		if (index === 2) {
			let pos = '';

			if (locale === 'en') {
				pos = '-12px';
			} else if (locale === 'zh') {
				pos = '-12px';
			}
			textAttr.style = {left: pos};
		}

		if (index === 3) {
			let pos = '';

			if (locale === 'en') {
				pos = '-31px';
			} else if (locale === 'zh') {
				pos = '-31px';
			}
			textAttr.style = {left: pos};
		}

		if (index === 4) {
			let pos = '';

			if (locale === 'en') {
				pos = '-38px';
			} else if (locale === 'zh') {
				pos = '-38px';
			}
			textAttr.style = {left: pos};
		}

		if (index === 5) {
			let pos = '';

			if (locale === 'en') {
				pos = '-42px';
			} else if (locale === 'zh') {
				pos = '-42px';
			}
			textAttr.style = {left: pos};
		}

		if (index === 6) {
			let pos = '';

			if (locale === 'en') {
				pos = '-40px';
			} else if (locale === 'zh') {
				pos = '-40px';
			}
			textAttr.style = {left: pos};
		}

		return (
			<div className={groupClass} key={index}>
				<div className={cx(lineClass, {active: activeSteps > index})}/>
				<div className={cx(stepClass, {active: activeSteps >= index})}>
					<div className='wrapper'><span className='number'>{index}</span></div>
					<div {...textAttr}>{val.step}</div>
					<div {...timeAttr}>{helper.getFormattedDate(val.updateTime,'local')}</div>
				</div>
			</div>
		)
	}

	render() {
    	const {open, stepTitleList} = this.state
    	const actions ={
    		cancel: {text: t('txt-close'), className:'standard', handler: this.close.bind(this)},
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