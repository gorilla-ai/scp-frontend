import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import DataTable from 'react-ui/build/src/components/table'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import helper from '../common/helper'
import withLocale from '../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const initialState = JSON.parse(document.getElementById('initial-state').innerHTML || '{}')
const {envCfg:cfg} = initialState
const baseUrl = cfg.apiPrefix

const INIT = {
	open: false,
	openName: false,
	tab: {
		department: true,
		title: false
	},
	nameUUID: '',
	name: '',
	header: '',
	data: [],
}
const _department = 1
const _title = 2
let t = null;
let et = null;

class Name extends Component {
	constructor(props, context) {
		super(props, context)
		this.state = _.cloneDeep(INIT)

		t = global.chewbaccaI18n.getFixedT(null, 'connections');
		et = global.chewbaccaI18n.getFixedT(null, 'errors');
		this.ah = getInstance('chewbacca')
	}
	addName() {
		const {tab, name} = this.state

		if (!name.trim()) {
			helper.showPopupMsg('', t('txt-error'), t('txt-noempty'))
			return
		}

		let json = {
			name: name,
			nameType: tab.department ? _department : _title
		}

		this.ah.one({
  		url: `${baseUrl}/api/name`,
  		type: 'POST',
  		data: JSON.stringify(json),
  		contentType: 'application/json'
		})
		.then(data => {
			this.setState({
				openName: false
			})
			this.getNameList(tab.department ? 'department' : 'title')
  	})
  	.catch(err => {
  		helper.showPopupMsg('', t('txt-error'), err.message);
  	})
	}
	updateName() {
		const {tab, name, nameUUID} = this.state

		if (!name.trim()) {
			helper.showPopupMsg('', t('txt-error'), t('txt-noempty'))
			return
		}

		let json = {
			nameUUID: nameUUID,
			name: name,
			nameType: tab.department ? _department : _title
		}

		this.ah.one({
  		url: `${baseUrl}/api/name`,
  		type: 'PATCH',
  		data: JSON.stringify(json),
  		contentType: 'application/json'
		})
		.then(data => {
			this.setState({
				openName: false
			})
			this.getNameList(tab.department ? 'department' : 'title')
  	})
  	.catch(err => {
  		helper.showPopupMsg('', t('txt-error'), err.message);
  	})
	}
	deleteName(nameUUID) {
		const {tab} = this.state

		this.ah.one({
  		url: `${baseUrl}/api/name?uuid=${nameUUID}`,
  		type: 'DELETE'
		})
		.then(data => {
			this.getNameList(tab.department ? 'department' : 'title')
  	})
  	.catch(err => {
  		helper.showPopupMsg('', t('txt-error'), err.message);
  	})
	}
	getNameList(tab) {
		let json = {
			nameType: tab === 'department' ? _department : _title
		}

		this.ah.one({
  		url: `${baseUrl}/api/name/_search`,
  		data: JSON.stringify(json),
  		type: 'POST',
  		contentType: 'application/json'
  	})
  	.then(data => {
 			this.setState({
 				data: data
 			})
  	})
  	.catch(err => {
  		helper.showPopupMsg('', t('txt-error'), err.message);
		})
	}
	open() {
  	this.setState({
  		open: true
  	})
  	this.getNameList('department')
	}
	close() {
		this.setState(_.cloneDeep(INIT))
		this.props.onDone()
	}
	handleTabChange(tab) {
		let tabs = { department:false, title: false }
		tabs[tab] = true
		this.setState({
			tab: tabs
		})
		this.getNameList(tab)
	}
	handleChange(key, value) {
		this.setState({
			[key]: value
		})
	}
	renderModal() {
		const {tab, open, data} = this.state
    	const actions = {
    		cancel: {text: t('txt-close'), className: 'standard', handler: this.close.bind(this)}
    	}
    	const label = tab.department ? t('ownerFields.department') : t('ownerFields.title')

    	return (
    		<ModalDialog className='modal-dialog' title={t('txt-mixName')} draggable={true} global={true} actions={actions} closeAction='cancel'>
					<div className='narrow-dialog add-name'>
						<div className='button-group'>
							<button className={cx({'standard': !tab.department})} onClick={this.handleTabChange.bind(this, 'department')}>{t('ownerFields.department')}</button>
		    			<button className={cx({'standard': !tab.title})} onClick={this.handleTabChange.bind(this, 'title')}>{t('ownerFields.title')}</button>
		    			<i className='c-link fg fg-add' onClick={this.openAddName.bind(this)} title={tab.department ? t('txt-addDepartment') : t('txt-addTitle')}></i>
						</div>
						<div className='content'>
							{
								<DataTable
									className='table-name'
									data={data} 
									fields={{
										nameUUID: { hide: true },
										name: { label: label, style: { textAlign: 'left', width: '80%' } },
										option: { label: '', style: { width: '20%' }, formatter: (el, obj) => {
											return <span>
												<i className='c-link fg fg-edit' onClick={this.openEditName.bind(this, obj.nameUUID, obj.name)} title={t('txt-edit')} />
												<i className='c-link fg fg-trashcan' onClick={this.openDeleteName.bind(this, obj.nameUUID, obj.name)} title={t('txt-delete')} />
											</span>
										}}
									}} />
							}
						</div>
					</div>
    		</ModalDialog>
    	)
    }
    openAddName() {
    	const {tab} = this.state
    	let header = tab.department ? t('txt-addDepartment') : t('txt-addTitle')

			this.setState({
				openName: true,
				header,
				name: '',
				nameUUID: ''
			})
    }
    openEditName(nameUUID, name) {
    	const {tab} = this.state
    	let header = tab.department ? t('txt-updateDepartment') : t('txt-updateTitle')

			this.setState({
				openName: true,
				header,
				name,
				nameUUID
			})
    }
    openDeleteName(nameUUID, name) {
    	const {tab} = this.state
    	
    	PopupDialog.prompt({
    		title: tab.department ? t('txt-deleteDepartment') : t('txt-deleteTitle'),
    		id: 'modalWindow',
    		confirmText: t('txt-delete'),
    		cancelText: t('txt-cancel'),
    		display: (
    			<div className='content delete'>
  					<span>{t('txt-delete-msg')}: {name}?</span>
					</div>
				),
    		act: (confirmed) => {
      		if (confirmed) {
        		this.deleteName(nameUUID)
      		}
    		}
    	})
    }
    closeName() {
    	this.setState({
    		openName: false
    	})
    }
    renderName() {
    	const {openName, name, nameUUID, header} = this.state
    	const actions = {
    		cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeName.bind(this)},
    		confirm: {text: t('txt-confirm'), handler: nameUUID === '' ? this.addName.bind(this) : this.updateName.bind(this)}
    	}

    	return (
    		<ModalDialog className='modal-dialog' title={header} draggable={true}
    			global={true} actions={actions} closeAction='cancel'>
      		<Input placeholder={t('txt-enterName')} onChange={this.handleChange.bind(this, 'name')} value={name} />	
    		</ModalDialog>
    	)
    }
	render() {
		const {open, openName} = this.state

		return (
			<div>
				{ open && this.renderModal() }
				{ openName && this.renderName() }
			</div>
		)
	}
}

Name.propTypes = {
  // onDone: PropTypes.func.isRequired
}

export default withLocale(Name)