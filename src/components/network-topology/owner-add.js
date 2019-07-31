import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import ComboBox from 'react-ui/build/src/components/combobox'
import FileInput from 'react-ui/build/src/components/file-input'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import helper from '../common/helper'
import withLocale from '../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const INIT = {
	baseUrl: '',
	contextRoot: '',
	modalOwnerOpen: false,
  list: {
    department: [],
    title: []
  },
	owner: {
		ownerID: '',
		ownerName: '',
		department: '',
		title: '',
    departmentName: '',
    titleName: '',
		file: null
	}
}

let t = null;
let et = null;

class Adder extends Component {
	constructor(props, context) {
    super(props, context)
    this.state = _.cloneDeep(INIT)

    this.openDialog = this.openDialog.bind(this)
    this.closeDialog = this.closeDialog.bind(this)

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca')
  }
  openDialog(baseUrl, contextRoot) {
  	this.setState({
  		baseUrl,
  		contextRoot,
  		modalOwnerOpen: true
  	}, () => {
      this.getSearchData()
    })
  }
  closeDialog() {
  	this.setState(_.cloneDeep(INIT))
	}
  getSearchData() {
    const {baseUrl} = this.state
    const apiNameType = [1, 2]
    let apiArr = [];

    _.forEach(apiNameType, val => {
      const json = {nameType: val}

      apiArr.push({
        url: `${baseUrl}/api/name/_search`,
        data: JSON.stringify(json),
        type: 'POST',
        contentType: 'application/json'
      })
    })

    this.ah.all(apiArr)
    .then(data => {
      let tempList = {...this.state.list}
      let department = [{value: 'all', text: t('txt-all')}]
      let title = [{value: 'all', text: t('txt-all')}]

      _.forEach(data[0], val => {
        department.push({
          value: val.nameUUID,
          text: val.name
        })
      })

      _.forEach(data[1], val => {
        title.push({
          value: val.nameUUID,
          text: val.name
        })
      })

      tempList.department = department
      tempList.title = title

      this.setState({
        list: tempList
      })
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
	handleOwnerConfirm() {
		const {baseUrl, owner} = this.state
  	let formData = new FormData()

  	formData.append('ownerID', owner.ownerID)
  	formData.append('ownerName', owner.ownerName)
  	formData.append('department', owner.department)
  	formData.append('title', owner.title)
	  formData.append('file', owner.file)

  	this.ah.one({
  		url: `${baseUrl}/api/owner`,
  		data: formData,
  		type: 'POST',
  		processData: false,
  		contentType: false
  	})
  	.then(data => {
  		this.closeDialog()
  		this.props.onDone(data, owner.ownerName)
  	})
  	.catch(err => {
  		helper.showPopupMsg('', t('txt-error'), t('network-topology.txt-ownerDuplicated'));
  	})
	}
  handleDataChange(type, value) {
  	let tempOwner = {...this.state.owner}
  	tempOwner[type] = value

  	this.setState({
  		owner: tempOwner
  	})
	}
  displayAddOwner() {
  	const {contextRoot, owner, list} = this.state

  	return (
  		<div className='wide-dialog add-owner'>
  			<div className='content'>
  				<div className='left'>
  					<div className='owner'>
  						<label htmlFor='ownerPhotoUpload'>{t('txt-uploadPhoto')}</label>
  						<FileInput id='ownerPhotoUpload' name='file' btnText={t('txt-uploadPhoto')}
        				validate={{
        					max: 10,
        					extension: ['.jpg', '.jpeg', '.png'],
        					t: (code, params) => {
          					if (code[0] === 'file-wrong-format') {
          						return t('txt-file-format-error') + ` ${params.extension}`
          					}
        					}
        				}}
        				onChange={this.handleDataChange.bind(this, 'file')} />
        			<div className='photo'>
      					{
                  // owner.add.base64 &&
                  // <div>
                  // 	<img src={owner.add.base64} title={t('network-topology.txt-profileImage')} />
                  // 	<div className='removePhoto'>
                  // 		<label htmlFor='removePhoto'>{t('network-topology.txt-removePhoto')}</label>
                  // 		<Checkbox id='removePhoto' onChange={this.handleRemovePhoto} checked={owner.removePhoto} />
                  // 	</div>
                  // </div>
      					}
      					{
      						// !owner.add.base64 &&
                	<img src={contextRoot + '/images/empty_profile.png'} title={t('network-topology.txt-profileImage')} />
      					}
        			</div>
  					</div>
  				</div>

  				<div className='right'>
      			<div>
      				<label htmlFor='ownerID'>{t('ownerFields.ownerID')}</label>
      				<Input id='ownerID' className='add' placeholder='' required={true} validate={{t: et}} value={owner.ownerID}
        				onChange={this.handleDataChange.bind(this, 'ownerID')} />

      				<label htmlFor='ownerName'>{t('ownerFields.ownerName')}</label>
      				<Input id='ownerName' className='add' required={true} validate={{t: et}} value={owner.ownerName}
        				onChange={this.handleDataChange.bind(this, 'ownerName')} />

      				<label htmlFor='ownerDept'>{t('ownerFields.department')}</label>
              {
      				// <Input id='ownerDept' className='add' placeholder='' value={owner.department} onChange={this.handleDataChange.bind(this, 'department')} />
              }
              <ComboBox id='ownerDept' className='add' list={_.drop(list.department)} search={{enabled: true}} 
                onChange={this.handleDataChange.bind(this, 'department')} value={owner.department} />

      				<label htmlFor='ownerTitle'>{t('ownerFields.title')}</label>
              {
      				// <Input id='ownerTitle' className='add' placeholder='' value={owner.title} onChange={this.handleDataChange.bind(this, 'title')} />
              }
              <ComboBox id='ownerTitle' className='add' list={_.drop(list.title)} search={{enabled: true}}
                onChange={this.handleDataChange.bind(this, 'title')} value={owner.title} />
      			</div>
    			</div>
  			</div>
  		</div>
	  )
  }
  modalOwnerDialog() {
  	const actions = {
    		cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog.bind(this)},
    		confirm: {text: t('txt-confirm'), handler: this.handleOwnerConfirm.bind(this)}
  	}

  	return (
  		<ModalDialog id='ownerModalDialog' className='modal-dialog' title={t('network-topology.txt-addOwner')} draggable={true} 
  			global={true} actions={actions} closeAction='cancel'>
    		{this.displayAddOwner()}
  		</ModalDialog>
  	)
  }
  render() {
  	const {modalOwnerOpen} = this.state

  	return modalOwnerOpen && this.modalOwnerDialog()
  }
}


Adder.propTypes = {
  onDone: PropTypes.func.isRequired
}

export default withLocale(Adder)