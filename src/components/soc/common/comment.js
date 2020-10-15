import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from "classnames"

import DropDownList from 'react-ui/build/src/components/dropdown'
import Form from 'react-ui/build/src/components/form'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Textarea from 'react-ui/build/src/components/textarea'

import {BaseDataContext} from "../../common/context"
import {default as ah, getInstance} from "react-ui/build/src/utils/ajax-helper"
import helper from "../../common/helper"

let t = null
let et = null
let it = null


const INIT = {
	open: false,
    comments: [],
    selected: 'new',
    comment: null
}

class IncidentComment extends Component {
	constructor(props) {
		super(props)

		t = global.chewbaccaI18n.getFixedT(null, 'connections')
    	et = global.chewbaccaI18n.getFixedT(null, 'errors')
    	it = global.chewbaccaI18n.getFixedT(null, "incident")

    	this.state = _.cloneDeep(INIT)
	}
	componentDidMount() {
	}
	open() {
        const {baseUrl} = this.context

        ah.one({
            url: `${baseUrl}/api/soc/command/_search`
        })
        .then(data => {
            this.setState({open: true, comments: data.rt, selected: 'new', comment: {}})
        })
        .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        })
	}
	close() {
    	this.setState({open: false})
    }
    handleChange(field, value) {
    	this.setState({[field]: value}, () => {
            if (field === 'selected') {
                if (value === 'new') {
                    this.setState({comment: {}})
                }
                else {
                    const {comments} = this.state
                    const target = _.find(comments, {id: value})

                    this.setState({
                        comment: {
                            title: target.title,
                            command: target.command
                        }
                    })
                }
            }
        })
    }
    addComment() {
        const {baseUrl} = this.context
        const {comment} = this.state

        if (!comment.title || !comment.command) {
            PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-required'),
                confirmText: t('txt-close')
            })

            return
        }

        let payload = {
            title: comment.title, 
            command: comment.command
        }

        ah.one({
            url: `${baseUrl}/api/soc/command`,
            data: JSON.stringify(payload),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
        .then(data => {
            this.open()
        })
        .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        })
    }
    editComment() {
        const {baseUrl} = this.context
        const {comment, selected} = this.state

        if (!comment.title || !comment.command) {
            PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-required'),
                confirmText: t('txt-close')
            })

            return
        }

        let payload = {
            id: selected,
            title: comment.title, 
            command: comment.command
        }

        PopupDialog.prompt({
            title: t('txt-edit'),
            confirmText: t('txt-confirm'),
            cancelText: t('txt-cancel'),
            display: <span>{it('txt-edit-msg')}</span>,
            act: (confirmed, data) => {
                if (confirmed) {
                    ah.one({
                        url: `${baseUrl}/api/soc/command`,
                        data: JSON.stringify(payload),
                        type: 'PATCH',
                        contentType: 'application/json',
                        dataType: 'json'
                    })
                    .then(data => {
                        this.open()
                    })
                    .catch(err => {
                        helper.showPopupMsg('', t('txt-error'), err.message)
                    })
                }
            }
        })        
    }
    deleteComment() {
        const {baseUrl} = this.context
        const {comment, selected} = this.state

        PopupDialog.prompt({
            title: t('txt-delete'),
            confirmText: t('txt-confirm'),
            cancelText: t('txt-cancel'),
            display: <div className='content delete'>
                <span>{t('txt-delete-msg')}: {comment.title} ?</span>
            </div>,
            act: (confirmed, data) => {
                if (confirmed) {
                    ah.one({
                        url: `${baseUrl}/api/soc/command?id=${selected}`,
                        type: 'DELETE'
                    })
                    .then(data => {
                        this.open()
                    })
                    .catch(err => {
                        helper.showPopupMsg('', t('txt-error'), err.message)
                    })
                }
            }
        })
    }
    render() {
    	const {open, comments, selected, comment} = this.state
    	const actions_old = {
    		cancel: {text: t('txt-cancel'), className:'standard', handler: this.close.bind(this)},
            delete: {text: t('txt-delete'), handler: this.deleteComment.bind(this)},
            edit: {text: t('txt-edit'), handler: this.editComment.bind(this)}
        }
        const actions_new = {
            cancel: {text: t('txt-cancel'), className:'standard', handler: this.close.bind(this)},
            add: {text: t('txt-add'), handler: this.addComment.bind(this)}
        }

        if (!open) {
            return null
        }

        const actions = selected === 'new' ? actions_new : actions_old

        let list = _.map(comments, el => {
            return {text: el.title, value: el.id}
        })
        list.push({text: it('txt-comment-new'), value: 'new'})

    	return <ModalDialog className='incident-comment' title={it('txt-comment-example')} 
            draggable={true} global={true} closeAction='cancel' actions={actions}>
            <div className='left'>
                <DropDownList size={15} list={list} required={true} value={selected} onChange={this.handleChange.bind(this, 'selected')} />
            </div>
            <div className='right'>
                <Form className='content' formClassName='c-form'
                    fields={{
                        title: {label: it('txt-title'), editor: Input, props: {
                            t: et,
                            required: true
                        }},
                        command: {label: it('txt-comment'), editor: Textarea, props: {
                            t: et,
                            required: true,
                            rows: 10
                        }}
                    }}
                    value={comment}
                    onChange={this.handleChange.bind(this, 'comment')} />
            </div>
    	</ModalDialog>
    }
}


IncidentComment.contextType = BaseDataContext
IncidentComment.propTypes = {
}

export default IncidentComment