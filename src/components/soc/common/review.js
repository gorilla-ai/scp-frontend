import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from "classnames"

import DropDownList from 'react-ui/build/src/components/dropdown'
import Form from 'react-ui/build/src/components/form'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import Textarea from 'react-ui/build/src/components/textarea'
import MenuItem from '@material-ui/core/MenuItem';
import {BaseDataContext} from "../../common/context"
import {default as ah, getInstance} from "react-ui/build/src/utils/ajax-helper"
import helper from "../../common/helper"
import TextField from '@material-ui/core/TextField';
import {TextareaAutosize} from "@material-ui/core";

let t = null
let et = null
let it = null


const INIT = {
	open: false,
	incidentId: '',
	reviewType: 'audit',
	comments: [],
	selected: 'none',
	comment: ''
}



class IncidentReview extends Component {
	constructor(props) {
		super(props)

		t = global.chewbaccaI18n.getFixedT(null, 'connections')
    	et = global.chewbaccaI18n.getFixedT(null, 'errors')
    	it = global.chewbaccaI18n.getFixedT(null, "incident")

    	this.state = _.cloneDeep(INIT)
	}
	componentDidMount() {
	}
	open(incidentId, reviewType) {
		const {baseUrl} = this.context

		ah.one({
            url: `${baseUrl}/api/soc/command/_search`
        })
        .then(data => {
            this.setState({incidentId, reviewType, open: true, comments: data.rt})
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
    			if (value === 'none') {
	    			this.setState({comment: ''})
	    		}
	    		else {
	    			const {comments} = this.state
	    			const target = _.find(comments, {id: value})

	    			this.setState({comment: target.command})
	    		}
    		}
    	})
    }
	handleChangeMui(event) {
		this.setState({[event.target.name]: event.target.value}, () => {
			if (event.target.name === 'selected') {
				if (event.target.value === 'none') {
					this.setState({comment: ''})
				}
				else {
					const {comments} = this.state
					const target = _.find(comments, {id: event.target.value})

					this.setState({comment: target.command})
				}
			}
		})
	}
    confirm() {
    	const {baseUrl, session} = this.context
    	const {incidentId, comment, reviewType} = this.state

	    if (comment){
		    const payload = {
			    incidentId,
			    opinion: comment,
			    userId: session.accountId
		    }

            let url = `${baseUrl}/api/soc/_${reviewType}`

            if (reviewType === 'draw') {
                url = _.includes(session.roles, 'SOC Executor') ? `${baseUrl}/api/soc/executor/_draw` : `${baseUrl}/api/soc/analyzer/_draw`
            }

		    ah.one({
			    url: url,
			    data: JSON.stringify(payload),
			    type: 'POST',
			    contentType: 'application/json',
			    dataType: 'json'
		    }).then(data => {
			    helper.showPopupMsg(it(`txt-${reviewType}-success`), it(`txt-${reviewType}`));
			    this.close()
			    this.props.onLoad(incidentId, 'view')
		    })
			    .catch(err => {
				    helper.showPopupMsg('', t('txt-error'), err.message)
			    })
	    }else{
		    helper.showPopupMsg( it(`txt-required`),t(`txt-fail`));
	    }


    }
    render() {
    	const {open, reviewType, comments, selected, comment} = this.state
    	const actions ={
    		cancel: {text: t('txt-cancel'), className:'standard', handler: this.close.bind(this)},
            confirm: {text: it(`txt-${reviewType}`), handler: this.confirm.bind(this)}
        }

        if (!open) {
            return null
        }

        let list = [{text: it('txt-comment-none'), value: 'none'}]
        _.forEach(comments, el => {
        	list.push({text: el.title, value: el.id})
        })
        

    	return <ModalDialog className='incident-review' title={it(`txt-${reviewType}`)} draggable={true} global={true} closeAction='cancel' actions={actions}>
    		<div className='c-form content'>
    			<div>
    				<label>{it('txt-comment-example')}</label>
    				<TextField
					    id='selected'
					    name='selected'
					    variant='outlined'
					    fullWidth={true}
					    size='small'
					    required
					    value={selected}
					    select
					    onChange={this.handleChangeMui.bind(this)}>
					    {
					    	_.map(list,el=>{
					    		return <MenuItem value={el.value}>{el.text}</MenuItem>
						    })
					    }
				    </TextField>
    			</div>
    			<div>
    				<label>{it('txt-comment')}</label>
				    {/*<Textarea rows={6} required={true} value={comment} onChange={this.handleChange.bind(this, 'comment')} />*/}
    				<TextareaAutosize  id='reviewCommentInput'  className='textarea-autosize' name='comment' value={comment} rows={6} required onChange={this.handleChangeMui} />
    			</div>
    		</div>
    	</ModalDialog>
    }
}


IncidentReview.contextType = BaseDataContext
IncidentReview.propTypes = {
}

export default IncidentReview