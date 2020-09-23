import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from "classnames"

import CheckboxGroup from 'react-ui/build/src/components/checkbox-group'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'

import {BaseDataContext} from "../../common/context"
import {default as ah, getInstance} from "react-ui/build/src/utils/ajax-helper"
import helper from "../../common/helper"

import Select from 'react-select'

let t = null
let et = null
let it = null

const RAINBOW = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#8B00FF']

const INIT = {
	open: false,
    origianlTags: [],
    tags: [],
    selectedTags: [],
    originalSelectedTags: [],
    mapping: [],
    id: null
}


class IncidentTag extends Component {
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
            url: `${baseUrl}/api/soc/tag/_search`,
            data: JSON.stringify({account: session.accountId}),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
        .then(data => {
            if (id) {
                ah.one({
                    url: `${baseUrl}/api/soc/tag/mapping/_search`,
                    data: JSON.stringify({incidentId: id}),
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json'
                })
                .then(result => {
                    const selected = _.map(result.rt, 'tagId')

                    this.setState({open: true, tags: data.rt, id, selectedTags: selected, originalSelectedTags: selected, mapping: result.rt})
                })
                .catch(err => {
                    helper.showPopupMsg('', t('txt-error'), err.message)
                })
            }
            else {
                this.setState({open: true, tags: data.rt, origianlTags: data.rt, id})
            }
        })
        .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        })
	}
	close() {
    	this.setState({open: false})
    }
    handleChange(field, value) {
    	this.setState({[field]: value})
    }

    confirmTag() {
    	const {baseUrl, session} = this.context
    	const {origianlTags, tags} = this.state

    	let addTags = []
        let updateTags = []
        let deleteTags = []
        let apis = []

        _.forEach(tags, el => {
            (!el.id && el.tag) && addTags.push(el)
        })

        _.forEach(origianlTags, el => {
        	const target = _.find(tags, {id: el.id})

            if (target) {
                updateTags.push(target)
            }
            else {
            	deleteTags.push(el)
            }
        })

        // set api
        _.forEach(addTags, el => {
			const payload = {tag: el.tag, color: el.color, account: session.accountId}
			const api = {
				url : `${baseUrl}/api/soc/tag`,
				method: 'POST',
				contentType: 'application/json',
		        dataType: 'json',
				data: JSON.stringify(payload)
			}

			apis.push(api)
		})

        _.forEach(updateTags, el => {
			const payload = {id: el.id, tag: el.tag, color: el.color, account: session.accountId}
			const api = {
				url : `${baseUrl}/api/soc/tag`,
				method: 'PATCH',
				contentType: 'application/json',
		        dataType: 'json',
				data: JSON.stringify(payload)
			}

			apis.push(api)
		})

        _.forEach(deleteTags, el => {
			const api = {
				url : `${baseUrl}/api/soc/tag?id=${el.id}`,
				method: 'DELETE'
			}

			apis.push(api)
		})

        ah.all(apis)
        .then(result => {
            this.close()
        })
        .catch(err => {
            popupErrorMsg(err.message)
        })
    }

    combineTag() {
        const {baseUrl, session} = this.context
        const {id, selectedTags, originalSelectedTags, mapping} = this.state

        let addTags = []
        let deleteTags = []
        let apis = []

        _.forEach(selectedTags, el => {
            !_.includes(originalSelectedTags, el) && addTags.push(el)
        })

        _.forEach(originalSelectedTags, el => {
            !_.includes(selectedTags, el) && deleteTags.push(el)
        })

        _.forEach(deleteTags, el => {
            const target = _.find(mapping, {tagId: el})

            apis.push({
                url : `${baseUrl}/api/soc/tag/mapping?id=${target.id}`,
                method: 'DELETE'
            })
        })

        _.forEach(addTags, el => {
            apis.push({
                url : `${baseUrl}/api/soc/tag/mapping`,
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data:JSON.stringify({incidentId: id, tagId: el})
            })
        })

        ah.all(apis)
        .then(result => {
            this.props.onLoad()
            this.close()
        })
        .catch(err => {
            popupErrorMsg(err.message)
        })
    }

    confirm() {
        const {id} = this.state

        if (id) {
            this.combineTag()
        }
        else {
            this.confirmTag()
        }
    }

	render() {
    	const {open, tags, selectedTags, id} = this.state
    	const actions ={
    		cancel: {text: t('txt-cancel'), className:'standard', handler: this.close.bind(this)},
            confirm: {text: t('txt-save'), handler: this.confirm.bind(this)}
        }

        if (!open) {
            return null
        }

        const tagList = _.map(tags, el => {
            return {
                value: el.id, 
                text: <div style={{display: 'flex'}}>
                    <div className='incident-tag-square' style={{backgroundColor: el.color}}></div>
                    &nbsp;{el.tag}
                </div>
            }
        })

        return <ModalDialog className='incident-tag-modal' title={it('txt-custom-tag')} draggable={true} global={true} closeAction='cancel' actions={actions}>
            {
                id &&
                <CheckboxGroup list={tagList} onChange={this.handleChange.bind(this, 'selectedTags')} value={selectedTags} />
            }
            {
                !id &&
                <MultiInput base={TagArray} defaultItemValue={{color: RAINBOW[0]}} value={tags} onChange={this.handleChange.bind(this, 'tags')} />
            }
        </ModalDialog>
	}
}

class TagArray extends React.Component {
    static propTypes = {
        onChange: PropTypes.func,
        value: PropTypes.shape({
            id: PropTypes.string,
            tag: PropTypes.string,
            color: PropTypes.string,
            account: PropTypes.string
        })
    }
    handleChange = (field, value) => {
        let {onChange, value:curValue} = this.props

        if (field === 'color') {
            onChange({...curValue, [field]: value.value})
        }
        else {
            onChange({...curValue, [field]: value})
        }
    }
    render() {
        let {value: {id, tag, color, account}} = this.props
        const options = _.map(RAINBOW, el => {
            return {value: el, label: <div className='incident-tag-square' style={{backgroundColor: el}}></div>}
        })

        let target = options[0]
        if (color) {
            target = _.find(options, function(o) {return o.value === color})
        }


        return <div className='tagArray'>
            <Select className='tagColor' options={options} onChange={this.handleChange.bind(this, 'color')} value={target} />
            <Input className='tagName' onChange={this.handleChange.bind(this, 'tag')} value={tag} />
        </div>
    }
}


IncidentTag.contextType = BaseDataContext
IncidentTag.propTypes = {
}

export default IncidentTag