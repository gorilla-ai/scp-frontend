import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Form from 'react-ui/build/src/components/form'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Textarea from 'react-ui/build/src/components/textarea'

import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import MenuItem from '@material-ui/core/MenuItem'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'
import {withStyles} from '@material-ui/core'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;
let it = null;

const INIT = {
	open: false,
    comments: [],
    selected: 'new',
    comment: null
}

class IncidentComment extends Component {
	constructor(props) {
		super(props)

		t = global.chewbaccaI18n.getFixedT(null, 'connections');
    	et = global.chewbaccaI18n.getFixedT(null, 'errors');
    	it = global.chewbaccaI18n.getFixedT(null, 'incident');

    	this.state = _.cloneDeep(INIT)
	}
	componentDidMount() {
	}
	open() {
        const {baseUrl} = this.context

        helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

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

    refresh() {
        const {baseUrl} = this.context

        helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

        ah.one({
            url: `${baseUrl}/api/soc/command/_search`
        })
            .then(data => {
                this.setState({open: true, comments: data.rt, selected: 'selected',})
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })
    }
	close() {
        this.setState({
            open: false,
            comments: [],
            selected: 'new',
            comment: null
        })
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
    handleChangeMuiComment(event, title, command,id) {
        let value = {command:command,title:title};
        if (event.target.name === 'title'){
            value.title = event.target.value
        }else  if (event.target.name === 'command'){
            value.command = event.target.value
        }

        this.setState({['comment']: value})
    }

    handleChangeMui(event) {
        this.setState({[event.target.name]: event.target.value}, () => {
            if (event.target.name === 'selected') {
                if (event.target.value === 'new') {
                    this.setState({comment: {}})
                }
                else {
                    const {comments} = this.state
                    const target = _.find(comments, {id: event.target.value})

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

        helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

        ah.one({
            url: `${baseUrl}/api/soc/command`,
            data: JSON.stringify(payload),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
        .then(data => {

            this.setState({
                open: false,
                comments: [],
                selected: 'new',
                comment: null
            },()=>{
                this.open()
            })
            helper.showPopupMsg('', t('txt-success'),   it('txt-new')+it('txt-comment-example')+t('txt-success'))
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
                    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

                    ah.one({
                        url: `${baseUrl}/api/soc/command`,
                        data: JSON.stringify(payload),
                        type: 'PATCH',
                        contentType: 'application/json',
                        dataType: 'json'
                    })
                    .then(data => {
                        this.close()
                        helper.showPopupMsg('', t('txt-success'),   it('txt-update')+it('txt-comment-example')+t('txt-success'))
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
                    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

                    ah.one({
                        url: `${baseUrl}/api/soc/command?id=${selected}`,
                        type: 'DELETE'
                    })
                    .then(data => {
                        this.setState({
                            open: false,
                            comments: [],
                            selected: 'new',
                            comment: null
                        },()=>{
                            this.open()
                        })
                        helper.showPopupMsg('', t('txt-success'),   it('txt-delete')+it('txt-comment-example')+t('txt-success'))
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
                {/*<DropDownList size={15} list={list} required={true} value={selected} onChange={this.handleChange.bind(this, 'selected')} />*/}
                <TextField
                    id='selected'
                    name='selected'
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    required
                    multiline
                    value={selected}
                    select
                    onChange={this.handleChangeMui.bind(this)}>
                    {
                        _.map(list,el=>{
                            return <MenuItem value={el.value}>{el.text}</MenuItem>
                        })
                    }
                </TextField>
                {/*<Drawer*/}
                {/*    variant="permanent"*/}
                {/*    anchor="left"*/}
                {/*    open={true}*/}
                {/*    classes={{*/}
                {/*        paper: classes.drawerPaper,*/}
                {/*    }}*/}
                {/*>*/}
                {/*    <List>*/}
                {/*        {list.map((obj, index) => (*/}
                {/*            <ListItem button key={obj.value} onClick={this.handleChange.bind(this, 'selected',obj.value)}>*/}
                {/*                <ListItemText primary={obj.text} />*/}
                {/*            </ListItem>*/}
                {/*        ))}*/}
                {/*    </List>*/}
                {/*</Drawer>*/}
            </div>
            <div className='right'>
                {/*<Form className='content' formClassName='c-form'*/}
                {/*    fields={{*/}
                {/*        title: {label: it('txt-title'), editor: Input, props: {*/}
                {/*            t: et,*/}
                {/*            required: true*/}
                {/*        }},*/}
                {/*        command: {label: it('txt-comment'), editor: Textarea, props: {*/}
                {/*            t: et,*/}
                {/*            required: true,*/}
                {/*            rows: 10*/}
                {/*        }}*/}
                {/*    }}*/}
                {/*    value={comment}*/}
                {/*    onChange={this.handleChange.bind(this, 'comment')} />*/}
                <label htmlFor='title'>{it('txt-title')}</label>
                <TextField
                    name='title'
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    required
                    value={comment.title}
                    onChange={(event) => this.handleChangeMuiComment(event,comment.title,comment.command,comment.id)}>
                </TextField>
                <label htmlFor='comment'>{it('txt-comment')}</label>
                <TextareaAutosize
                    name='command'
                    className='textarea-autosize'
                    value={comment.command}
                    rows={8}
                    required
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    onChange={(event) => this.handleChangeMuiComment(event,comment.title,comment.command,comment.id)}
                />
                {/*<Form className='content' formClassName='c-form'*/}
                {/*      fields={{*/}
                {/*          title: {label: it('txt-title'), editor: TextField, props: {*/}
                {/*                  t: et,*/}
                {/*                  variant:'outlined',*/}
                {/*                  fullWidth:true,*/}
                {/*                  size:'small',*/}
                {/*                  required: true,*/}
                {/*                  onChange: this.handleChangeMui*/}
                {/*              }},*/}
                {/*          command: {label: it('txt-comment'), editor: TextareaAutosize, props: {*/}
                {/*                  t: et,*/}
                {/*                  required: true,*/}
                {/*                  rows: 10,*/}
                {/*                  name:'command',*/}
                {/*                  onChange: this.handleChangeMui*/}
                {/*              }}*/}
                {/*      }}*/}

                {/*      value={comment}*/}
                {/*      onChange={this.handleChange.bind(this, 'comment')} />*/}
            </div>
    	</ModalDialog>
    }
}


IncidentComment.contextType = BaseDataContext
IncidentComment.propTypes = {
}

export default IncidentComment