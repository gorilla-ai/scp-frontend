import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import ComboBox from 'react-ui/build/src/components/combobox'
import Input from 'react-ui/build/src/components/input'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'
import withLocale from '../../hoc/locale-provider'

import AddOwner from '../network-topology/owner-add'

let t = null;
let et = null;

class IpOwnerMapModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedID: '',
      addOwners: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  // selectEntry = (selected, eventData) => {
  //   const {baseUrl} = this.props;

  //   this.ah.one({
  //     url: `${baseUrl}/api/area?uuid=${selected}`,
  //     type: 'GET'
  //   })
  //   .then(data => {
  //     this.setState({
  //       selectedID: selected
  //     });
  //   })
  // }
  // handleChange = (field, value) => {
  //   this.setState({
  //     [field]: value
  //   });
  // };
  handleAddOwner = () => {
    const {baseUrl, contextRoot} = this.props;
    this.adder._component.openDialog(baseUrl, contextRoot);
  }
  afterAddOwner = (ownerUUID, ownerName) => {
    let {addOwners} = this.state

    addOwners.push({
      value: ownerUUID,
      text: ownerName
    });

    this.setState({addOwners})
  }
  getErrorMsg = (code, {value, pattern}) => {
    if (code[0] === 'missing') {
      return t('txt-required');
    } else if (code[0] === 'no-match') {
      return t('network-topology.txt-ipValidationFail');
    }
  }
  render() {
    const {baseUrl, contextRoot, showTabs, IP, owner} = this.props
    const {addOwners} = this.state
    // let list = owner.ownerListArr

    // _.map(addOwners, el => {
    //   if (!_.includes(list, el)) {
    //     list.push(el)
    //   }
    // })

    return (
      <div>
      <AddOwner ref={ref => { this.adder=ref }} onDone={this.afterAddOwner.bind(this)} /> 

      <div className='wide-dialog add-ip'>
        <div className='button-group'>
          <button className={cx({'standard': !showTabs.ip})} onClick={this.props.switchTab.bind(this, 'ip')}>{t('ipFields.ip')}</button>
          <button className={cx({'standard': !showTabs.owner})} onClick={this.props.switchTab.bind(this, 'owner')}>{t('ipFields.owner')}</button>
          { 
            showTabs.owner &&             
            <i className='c-link fg fg-poople-invite' onClick={this.handleAddOwner.bind(this)} title={t('network-topology.txt-addOwner')}></i>
          }
        </div>
        <div className='content'>
          <div className='left'>
            {showTabs.ip && IP.add &&
              <div>
                <label htmlFor='ipIP'>{t('ipFields.ip')}</label>
                <Input
                  id='ipIP'
                  className='add'
                  placeholder=''
                  required={true}
                  validate={{
                    pattern: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
                    patternReadable: 'xxx.xxx.xxx.xxx',
                    t: this.getErrorMsg
                  }}
                  value={IP.add.ip}
                  onChange={this.props.handleDataChange.bind(this, 'ip')} />

                <label htmlFor='ipMac'>{t('ipFields.mac')}</label>
                <Input
                  id='ipMac'
                  className='add'
                  placeholder=''
                  value={IP.add.mac}
                  onChange={this.props.handleDataChange.bind(this, 'mac')} />
              </div>
            }

            {showTabs.owner &&
              <div className='owner'>
                <div className='photo'>
                  {owner.base64 &&
                    <img src={owner.base64} title={t('network-topology.txt-profileImage')} />
                  }
                  {!owner.base64 &&
                    <img src={contextRoot + '/images/empty_profile.png'} title={t('network-topology.txt-profileImage')} />
                  }
                </div>
              </div>
            }
          </div>

          <div className='right'>
            {showTabs.ip && IP.add &&
              <div>
                <label htmlFor='ipHost'>{t('ipFields.hostName')}</label>
                <Input
                  id='ipHost'
                  className='add'
                  placeholder=''
                  value={IP.add.hostName}
                  onChange={this.props.handleDataChange.bind(this, 'hostName')} />

                <label htmlFor='ipSystem'>{t('ipFields.system')} </label>
                <Input
                  id='ipSystem'
                  className='add'
                  placeholder=''
                  value={IP.add.system}
                  onChange={this.props.handleDataChange.bind(this, 'system')} />

                <label htmlFor='ipType'>{t('ipFields.deviceType')} </label>
                <Input
                  id='ipType'
                  className='add'
                  placeholder=''
                  value={IP.add.deviceType}
                  onChange={this.props.handleDataChange.bind(this, 'deviceType')} />  
              </div>
            }

            {showTabs.owner &&
              <div>
                <label htmlFor='ownerName'>{t('ownerFields.ownerName')}</label>
                <ComboBox
                  id='ownerName'
                  className='add'
                  list={owner.ownerListArr}
                  search={{
                    enabled: true
                  }}
                  onChange={this.props.handleOwnerChange}
                  value={owner.selectedOwner} />

                <label htmlFor='ownerID'>{t('ownerFields.ownerID')}</label>
                <Input
                  id='ownerID'
                  className='add'
                  readOnly={true}
                  value={owner.ownerID} />

                <label htmlFor='ownerDept'>{t('ownerFields.department')}</label>
                <Input
                  id='ownerDept'
                  className='add'
                  readOnly={true}
                  value={owner.departmentName} />

                <label htmlFor='ownerTitle'>{t('ownerFields.title')}</label>
                <Input
                  id='ownerTitle'
                  className='add'
                  readOnly={true}
                  value={owner.titleName} />
              </div>
            }
          </div>
        </div>
      </div>
      </div>
    )
  }
}

IpOwnerMapModal.propTypes = {
};

const HocIpOwnerMapModal = withLocale(IpOwnerMapModal);
export { IpOwnerMapModal, HocIpOwnerMapModal };