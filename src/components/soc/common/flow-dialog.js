import React, {Component} from 'react'
import _ from 'lodash'
import cx from "classnames"
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import {BaseDataContext} from "../../common/context"
import {default as ah, getInstance} from "react-ui/build/src/utils/ajax-helper"
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
    	this.ah = getInstance('chewbacca');
	}
	componentDidMount() {
	}

	open(id) {
		const {baseUrl, session} = this.context
		let tempList = [];
		let activeSteps = 1;

		this.ah.one({
			url: `${baseUrl}/api/soc/flowEngine/instance?id=${id}`,
			type: 'GET',
			contentType: 'application/json',
			dataType: 'json'
		}).then(data => {
			if (data && data.ret === 0) {
				Object.keys(data.rt.entities).forEach(key => {
					let index = 0;
					if (Object.entries(data.rt.entities).length > 4){
						if (data.rt.entities[key].entityName.includes('SOC-1')) {
							index = 0
						} else if (data.rt.entities[key].entityName.includes('SOC-2')) {
							index = 1
						} else if (data.rt.entities[key].entityName === '單位承辦人簽核') {
							index = 2
						} else if (data.rt.entities[key].entityName === '單位資安長簽核') {
							index = 3
						} else if (data.rt.entities[key].entityName === '主管單位承辦人簽核') {
							index = 4
						} else if (data.rt.entities[key].entityName === '主管單位資安長簽核') {
							index = 5
						}
					}else{
						if (data.rt.entities[key].entityName.includes('SOC-1')) {
							index = 0
						}else if (data.rt.entities[key].entityName.includes('SOC-2')){
							index= 1
						}else if (data.rt.entities[key].entityName === '單位承辦人簽核'){
							index = 2
						}else if (data.rt.entities[key].entityName === '主管單位承辦人簽核'){
							index = 3
						}
					}
					let tmpData = {
						index: index,
						step: data.rt.entities[key].entityName,
						updateTime: data.rt.entities[key].updateTime ? data.rt.entities[key].updateTime : ''
					}
					tempList.push(tmpData)

					if (data.rt.currentEntity[id].entityName === data.rt.entities[key].entityName){
						activeSteps = tmpData.index + 1
					}
				})
				this.setState({open: true, activeSteps: activeSteps, stepTitleList: tempList})
			}
		}).catch(err => {
			helper.showPopupMsg('', t('txt-error'), it('txt-flow-msg-na'))
		})
	}
	close() {
    	this.setState({open: false})
    }

	compare = function (prop) {
		return function (obj1, obj2) {
			let val1 = obj1[prop];
			let val2 = obj2[prop];
			if (val1 < val2) {
				return -1;
			} else if (val1 > val2) {
				return 1;
			} else {
				return 0;
			}
		}
	}

	showUnitStepIcon = (val, i) => {
		// console.log("val == " , val)
		const {locale} = this.context;
		const {activeSteps} = this.state;
		const index = val.index + 1;
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
				<div className={cx(lineClass, {active: activeSteps >= index})}/>
				<div className={cx(stepClass, {active: activeSteps > index})}>
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

		let tempStepTitleList = stepTitleList.sort(this.compare('index'))

        if (!open) {
            return null
        }

        return<ModalDialog className='incident-tag-modal' style={{width:"1080px"}} title={it('txt-incident-soc-flow')} draggable={true} global={true} closeAction='cancel' actions={actions}>
	        <div className='data-content' style={{minHeight: "26vh"}}>
		        <div className='parent-content'>
			        <div className='main-content basic-form' style={{minHeight: "47vh"}}>
				        <div className='steps-indicator' style={{marginTop: "20vh"}}>
					        {tempStepTitleList.map(this.showUnitStepIcon)}
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