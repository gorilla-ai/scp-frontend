/**
  * @module popup-dialog
  * @description A module to help with opening/closing **global** popup dialog<br>
  * This is to replace traditional window.alert, window.confirm, window.prompt
  */

import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'

import {retrieveFormData} from '../utils/input-helper'
import ModalDialog from './modal-dialog'

let log = require('loglevel').getLogger('react-ui/components/popup-dialog')

let handles = {}

const TYPES = {ALERT:'1', CONFIRM:'2', PROMPT:'3'}

const GLOBAL_POPUP_ID = 'g-popup-container'

class PopupDialog extends React.Component {
    static propTypes = {
    };

    state = {
        open: false,
        error: null
    };

    open = (type, title, display, id, style, cancelText, confirmText, act) => {
        this.setState({
            type: TYPES[type.toUpperCase()],
            title,
            display,
            id,
            style,
            cancelText,
            confirmText,
            act,
            open: true,
            error: null
        })
    };

    handleConfirm = () => {
        let {act} = this.state
        let result = retrieveFormData(ReactDOM.findDOMNode(this))

        let p = act && act(true, result)
        if (p && p.then) {
            // is promise
            p
                .then(() => {
                    this.handleError()
                })
                .catch((err) => {
                    this.handleError(err.message)
                })
        }
        else {
            this.handleError(p)
        }
    };

    handleError = (err) => {
        if (err) {
            this.setState({error:err})
        }
        else {
            this.close()
        }
    };

    close = () => {
        this.setState({open:false, error:null})
    };

    handleCancel = () => {
        let {act} = this.state

        act(false)
        this.close()
    };

    render() {
        let {type, title, display, id, style, cancelText, confirmText, open, error} = this.state

        if (!open) {
            return null
        }
        switch (type) {
            case TYPES.ALERT:
                return <ModalDialog
                    title={title}
                    id={id}
                    defaultAction='confirm'
                    closeAction='confirm'
                    contentClassName='pure-form'
                    actions={{
                        confirm: {
                            handler: this.handleConfirm,
                            text: confirmText
                        }
                    }}
                    global={true}
                    draggable={true}
                    style={style}>
                    {display}
                </ModalDialog>
            case TYPES.CONFIRM:
            case TYPES.PROMPT:
                return <ModalDialog
                    title={title}
                    id={id}
                    info={error}
                    infoClassName='c-error'
                    defaultAction='cancel'
                    closeAction='cancel'
                    contentClassName='pure-form'
                    actions={{
                        cancel: {handler:this.handleCancel, className:'standard', text:cancelText},
                        confirm: {
                            handler: this.handleConfirm,
                            text: confirmText
                        }
                    }}
                    global={true}
                    draggable={true}
                    style={style}>
                    {display}
                </ModalDialog>

            default:
                return null
        }
    }
}

function openPopup(instance, args, type) {
  if (instance) {
    if (!_.isObject(args)) {
        args = {display:args}
    }

    instance.open(
        type,
        args.title,
        args.display,
        args.id,
        args.style,
        args.cancelText || 'Cancel',
        args.confirmText || 'Confirm',
        args.act
    )
  }
}

function openId(type, id, args) {
    if (!id) {
        log.error('openId:missing id')
        return
    }

    let handle = handles[id]

    if (!handle) {
        let node = document.createElement('DIV')
        node.id = id
        document.body.appendChild(node)
        ReactDOM.render(
            <PopupDialog ref={el=>{
              handle=handles[id]=el
              openPopup(handle, args, type)
            }}/>,
            document.getElementById(id)
        )
    }
    else {
        openPopup(handle, args, type)
    }
}

function openIdIf(type, id, condition, args) {
    if (condition) {
        openId(type, id, args)
    }
    else {
        args.act(true)
    }
}

function closeId(id) {
    handles[id] && handles[id].close()
}

/**
 * Config for the popup dialog
 * @typedef {object} PopupConfig
 * @property {renderable} [title] - Title of the dialog
 * @property {renderable} display - What to display in the dialog
 * @property {string} [id] - Container dom #id
 * @property {object} [style] - Style to apply to the container
 * @property {string} [cancelText='Cancel'] - Cancel button text, only used with prompt & confirm dialogs
 * @property {string} [confirmText='Confirm'] - Confirm button text
 * @property {function} act - Action to perform when submit buttn clicked.<br>Can return a promise or error text
 * @property {boolean} act.confirmed - did the user say 'ok'?
 * @property {object} act.data - Input data embedded inside display, only used with prompt & confirm dialogs
 */

export default {
    /**
     * Open alert box
     * @param {PopupConfig | renderable} cfg - Popup config, or simple renderable string
     *
     * @example
     *
import {PopupDialog} from 'react-ui'

PopupDialog.alertId('g-custom-alert-container', 'Test')
PopupDialog.alert('Test')
PopupDialog.alert({display:'Test', act:(confirmed)=>{
    console.log('User is okay? ',confirmed)
}})
     */
    alert: openId.bind(null, 'alert', GLOBAL_POPUP_ID),
    alertId: openId.bind(null, 'alert'),

    /**
     * Open confirm box
     * @param {PopupConfig | renderable} cfg - Popup config, or simple renderable string
     *
     * @example
     *
import {PopupDialog} from 'react-ui'

PopupDialog.confirm({
    display:'Fetch more data?',
    cancelText: 'No!',
    confirmText: 'Go Ahead',
    act:(confirmed)=>{
        if (confirmed) {
            $.get('...') // get more data
        }
    }
})
     */
    confirm: openId.bind(null, 'confirm', GLOBAL_POPUP_ID),
    confirmId: openId.bind(null, 'confirm'),

    /**
     * Open confirm box if condition is satisfied.<br>
     * If condition is not satisfied (ie no need to confirm), act will be fired with confirmed=true
     * @param {boolean} condition - Should confirm first before proceed?
     * @param {PopupConfig | renderable} cfg - Popup config, or simple renderable string
     *
     * @example
     *
import Promise from 'bluebird'
import {PopupDialog} from 'react-ui'

let userDidNotEnterAddress = !user.address;
PopupDialog.confirmIf(userDidNotEnterAddress, {
    display:'You have not entered address, are you sure you want to proceed?',
    act:(confirmed)=>{
        if (confirmed) {
            // note if user has entered address, then it will reach here without popup
            return Promise.resolve($.post('/api/save/user',{data:user})) // post user information
            // if post returned with error (eg 404), error message will be displayed
        }
    }
})
     */
    confirmIf: openIdIf.bind(null, 'confirm', GLOBAL_POPUP_ID),
    confirmIdIf: openIdIf.bind(null, 'confirm'),

    /**
     * Open prompt box
     * @param {PopupConfig | renderable} cfg - Popup config, or simple renderable string
     *
     * @example
     *
import Promise from 'bluebird'
import {PopupDialog} from 'react-ui'

PopupDialog.prompt({
    display: <div>
        <label htmlFor='name'>Name</label><input id='name'/>
        <label htmlFor='phone'>Phone</label><input id='phone'/>
        <label htmlFor='address'>Address</label><input id='address'/>
    </div>,
    act:(confirmed, data)=>{
        if (confirmed) {
            console.log(data) // {name:'abc', phone:'012345678', address:'Taiwan'}
            return Promise.resolve($.post('/api/save/user',data)) // post user information
        }
    }
})
     */
    prompt: openId.bind(null, 'prompt', GLOBAL_POPUP_ID),
    promptId: openId.bind(null, 'prompt'),

    /**
     * Close popup dialog
     *
     * @example
     *
import {PopupDialog} from 'react-ui'

PopupDialog.close()
PopupDialog.closeId('g-g-custom-alert-container')
     */
    close: closeId.bind(null, GLOBAL_POPUP_ID),
    closeId
}