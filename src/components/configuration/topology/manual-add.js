import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import Gis from 'react-gis/build/src/components'

import Checkbox from 'react-ui/build/src/components/checkbox'
import DataTable from 'react-ui/build/src/components/table'
import DropDownList from 'react-ui/build/src/components/dropdown'
import FileInput from 'react-ui/build/src/components/file-input'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import RadioGroup from 'react-ui/build/src/components/radio-group'
import Tabs from 'react-ui/build/src/components/tabs'
import Textarea from 'react-ui/build/src/components/textarea'
import TreeView from 'react-ui/build/src/components/tree'

import {HocFloorMap as FloorMap} from '../../common/floor-map'
import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'
import {HocConfig as Config} from '../../common/configuration'
import TableContent from '../../common/table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

class ManualAdd extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSteps: 1
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
  }
  test = () => {

  }
  showAddIpSteps = (val, i) => {
    const {activeSteps} = this.state;
    const index = ++i;
    const groupClass = 'group group' + index;
    const lineClass = 'line line' + index;
    const stepClass = 'step step' + index;
    const textClass = 'text text' + index;

    return (
      <div className={groupClass} key={index}>
        <div className={cx(lineClass, {active: activeSteps >= index})}></div>
        <div className={cx(stepClass, {active: activeSteps >= index})}>{index}
          <div className={textClass}>{val}</div>
        </div>
      </div>
    )
  }
  checkFormValidation = (step) => {
    const {addIP, ownerType} = this.props;

    if (step === 1) {
      if (!addIP.ip || !addIP.mac) {
        return true;
      }
    }

    if (step === 3) {
      if (ownerType === 'new') {
        if (!addIP.newOwnerName || !addIP.newOwnerID) {
          return true;
        }
      }
    }
  }
  toggleSteps = (type) => {
    const {activeSteps} = this.state;
    let tempActiveSteps = activeSteps;

    if (type === 'previous') {
      tempActiveSteps--;
    } else if (type === 'next') {
      if (activeSteps === 1) {
        if (this.checkFormValidation(1)) {
          helper.showPopupMsg(et('fill-required-fields'), t('txt-error'));
          return;
        }
      }

      if (activeSteps === 3) {
        if (this.checkFormValidation(3)) {
          helper.showPopupMsg(et('fill-required-fields'), t('txt-error'));
          return;
        }
      }

      if (activeSteps === 4) {
        this.props.handleAddIpConfirm();
        return;
      }
      tempActiveSteps++;
    }

    this.setState({
      activeSteps: tempActiveSteps
    });
  }
  getBtnText = () => {
    return this.state.activeSteps === 4 ? t('txt-confirm') : t('txt-nextStep');
  }
  render() {
    const {
      baseUrl,
      contextRoot,
      addIP,
      currentDeviceData,
      ownerType,
      previewOwnerPic,
      ownerList,
      departmentList,
      titleList,
      floorPlan,
      mapAreaUUID,
      currentMap,
      seatData,
      currentBaseLayers
    } = this.props;
    const {activeSteps} = this.state;
    const addIPtext = [t('txt-ipAddress'), t('alert.txt-systemInfo'), t('ipFields.owner'), t('alert.txt-floorInfo')];

    return (
      <div className='parent-content'>
        <div className='main-content basic-form'>
          <header className='main-header'>{t('alert.txt-ipBasicInfo')}</header>
          <div className='steps-indicator'>
            {addIPtext.map(this.showAddIpSteps)}
          </div>
          {activeSteps === 1 &&
            <div className='form-group steps-address'>
              <header>{t('txt-ipAddress')}</header>
              <div className='group'>
                <label htmlFor='addIPstepsIP'>{t('ipFields.ip')}</label>
                <Input
                  id='addIPstepsIP'
                  required={true}
                  validate={{
                    pattern: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,
                    patternReadable: 'xxx.xxx.xxx.xxx',
                    t: et
                  }}
                  onChange={this.props.handleAddIpChange.bind(this, 'ip')}
                  value={addIP.ip} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsMac'>{t('ipFields.mac')}</label>
                <Input
                  id='addIPstepsMac'
                  required={true}
                  validate={{
                    t: et
                  }}
                  onChange={this.props.handleAddIpChange.bind(this, 'mac')}
                  value={addIP.mac} />
              </div>
            </div>
          }
          {activeSteps === 2 &&
            <div className='form-group steps-host'>
              <header>{t('alert.txt-systemInfo')}</header>
              <div className='group'>
                <label htmlFor='addIPstepsHostname'>{t('ipFields.hostName')}</label>
                <Input
                  id='addIPstepsHostname'
                  onChange={this.props.handleAddIpChange.bind(this, 'hostName')}
                  value={addIP.hostName}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsHostID'>{t('ipFields.hostID')}</label>
                <Input
                  id='addIPstepsHostID'
                  value={addIP.hostID}
                  readOnly={true} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsSystem'>{t('ipFields.system')}</label>
                <Input
                  id='addIPstepsSystem'
                  onChange={this.props.handleAddIpChange.bind(this, 'system')}
                  value={addIP.system}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsDeviceType'>{t('ipFields.deviceType')}</label>
                <Input
                  id='addIPstepsDeviceType'
                  onChange={this.props.handleAddIpChange.bind(this, 'deviceType')}
                  value={addIP.deviceType}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsUser'>{t('ipFields.owner')}</label>
                <Input
                  id='addIPstepsUser'
                  onChange={this.props.handleAddIpChange.bind(this, 'userName')}
                  value={addIP.userName}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsCPU'>{t('txt-cpu')}</label>
                <Input
                  id='addIPstepsCPU'
                  onChange={this.props.handleAddIpChange.bind(this, 'cpu')}
                  value={addIP.cpu}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsRam'>{t('txt-ram')}</label>
                <Input
                  id='addIPstepsRam'
                  onChange={this.props.handleAddIpChange.bind(this, 'ram')}
                  value={addIP.ram}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsDisks'>{t('txt-disks')}</label>
                <Textarea
                  id='addIPstepsDisks'
                  rows={3}
                  onChange={this.props.handleAddIpChange.bind(this, 'disks')}
                  value={addIP.disks}
                  readOnly={currentDeviceData.isHmd} />
              </div>
              <div className='group'>
                <label htmlFor='addIPstepsFolders'>{t('txt-shareFolders')}</label>
                <Textarea
                  id='addIPstepsFolders'
                  rows={3}
                  onChange={this.props.handleAddIpChange.bind(this, 'shareFolders')}
                  value={addIP.shareFolders}
                  readOnly={currentDeviceData.isHmd} />
              </div>
            </div>
          }
          {activeSteps === 3 &&
            <div className='form-group steps-owner'>
              <header>{t('ipFields.owner')}</header>
              <RadioGroup
                className='owner-type'
                list={[
                  {
                    value: 'existing',
                    text: t('txt-existingOwner')
                  },
                  {
                    value: 'new',
                    text: t('txt-addNewOwner')
                  }
                ]}
                onChange={this.props.handleOwnerTypeChange}
                value={ownerType} />
              {ownerType === 'new' &&
                <button className='standard manage' onClick={this.props.openManage}>{t('txt-manageDepartmentTitle')}</button>
              }
              <div className='user-pic'>
                {ownerType === 'new' &&
                  <div className='group'>
                    <label htmlFor='ownerPhotoUpload'>{t('txt-uploadPhoto')}</label>
                    <FileInput
                      id='ownerPhotoUpload'
                      name='file'
                      btnText={t('txt-uploadPhoto')}
                      validate={{
                        max: 10,
                        extension: ['.jpg', '.jpeg', '.png'],
                        t: (code, params) => {
                          if (code[0] === 'file-wrong-format') {
                            return t('txt-file-format-error') + ` ${params.extension}`
                          }
                        }
                      }}
                      onChange={this.props.handleAddIpChange.bind(this, 'file')} />
                  </div>
                }
                <div className='group'>
                  {ownerType === 'existing' && addIP.ownerPic &&
                    <img src={addIP.ownerPic} className='existing' title={t('network-topology.txt-profileImage')} />
                  }
                  {ownerType === 'new' && previewOwnerPic &&
                    <img src={previewOwnerPic} title={t('network-topology.txt-profileImage')} />
                  }
                  {(ownerType === 'existing' && !addIP.ownerPic) &&
                    <img src={contextRoot + '/images/empty_profile.png'} className={cx({'existing': ownerType === 'existing'})} title={t('network-topology.txt-profileImage')} />
                  }
                  {(ownerType === 'new' && !previewOwnerPic) &&
                    <img src={contextRoot + '/images/empty_profile.png'} className={cx({'existing': ownerType === 'existing'})} title={t('network-topology.txt-profileImage')} />
                  }
                </div>
              </div>
              <div className='user-info'>
                {ownerType === 'existing' &&
                  <div className='group'>
                    <label htmlFor='addIPstepsOwnerName'>{t('ownerFields.ownerName')}</label>
                    <DropDownList
                      id='addIPstepsOwnerName'
                      list={ownerList}
                      required={true}
                      onChange={this.props.handleOwnerChange}
                      value={addIP.ownerUUID} />
                  </div>
                }
                {ownerType === 'new' &&
                  <div className='group'>
                    <label htmlFor='addIPstepsOwnerName'>{t('ownerFields.ownerName')}</label>
                    <Input
                      id='addIPstepsOwnerName'
                      onChange={this.props.handleAddIpChange.bind(this, 'newOwnerName')}
                      required={true}
                      validate={{
                        t: et
                      }}
                      value={addIP.newOwnerName} />
                  </div>
                }
                {ownerType === 'existing' &&
                <div className='group'>
                  <label htmlFor='addIPstepsOwnerID'>{t('ownerFields.ownerID')}</label>
                  <Input
                    id='addIPstepsOwnerID'
                    readOnly={true}
                    value={addIP.ownerID} />
                </div>
                }
                {ownerType === 'new' &&
                  <div className='group'>
                    <label htmlFor='addIPstepsOwnerID'>{t('ownerFields.ownerID')}</label>
                    <Input
                      id='addIPstepsOwnerID'
                      onChange={this.props.handleAddIpChange.bind(this, 'newOwnerID')}
                      required={true}
                      validate={{
                        t: et
                      }}
                      value={addIP.newOwnerID} />
                  </div>
                }
                {ownerType === 'existing' &&
                  <div className='group'>
                    <label htmlFor='addIPstepsDepartment'>{t('ownerFields.department')}</label>
                    <Input
                      id='addIPstepsDepartment'
                      readOnly={true}
                      value={addIP.department} />
                  </div>
                }
                {ownerType === 'new' &&
                  <div className='group'>
                    <label htmlFor='addIPstepsDepartment'>{t('ownerFields.department')}</label>
                    <DropDownList
                      id='addIPstepsDepartment'
                      list={departmentList}
                      required={true}
                      validate={{t: et}}
                      onChange={this.handleDepartmentChange}
                      value={addIP.newDepartment} />
                  </div>
                }
                {ownerType === 'existing' &&
                  <div className='group'>
                    <label htmlFor='addIPstepsTitle'>{t('ownerFields.title')}</label>
                    <Input
                      id='addIPstepsTitle'
                      readOnly={true}
                      value={addIP.title} />
                  </div>
                }
                {ownerType === 'new' &&
                  <div className='group'>
                    <label htmlFor='addIPstepsTitle'>{t('ownerFields.title')}</label>
                    <DropDownList
                      id='addIPstepsTitle'
                      list={titleList}
                      required={true}
                      onChange={this.props.handleTitleChange}
                      value={addIP.newTitle} />
                  </div>
                }
              </div>
            </div>
          }
          {activeSteps === 4 &&
            <div className='form-group steps-floor'>
              <header>{t('alert.txt-floorInfo')}</header>
              <button className='standard manage' onClick={this.props.openFloorMap}>{t('network-inventory.txt-editFloorMap')}</button>
              <div className='floor-info'>
                <div className='tree'>
                  {floorPlan.treeData && floorPlan.treeData.length > 0 &&
                    floorPlan.treeData.map(this.props.displayTree)
                  }
                </div>
                <div className='map'>
                  {currentMap.label &&
                    <Gis
                      _ref={(ref) => {this.gisNode = ref}}
                      data={_.get(seatData, [mapAreaUUID, 'data'], [])}
                      baseLayers={currentBaseLayers}
                      baseLayer={mapAreaUUID}
                      layouts={['standard']}
                      dragModes={['pan']}
                      scale={{enabled: false}}
                      defaultSelected={[currentDeviceData.seatUUID]}
                      onClick={this.props.handleFloorMapClick} />
                  }
                </div>
              </div>
            </div>
          }
          <footer>
            <button className='standard' onClick={this.props.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</button>
            {activeSteps > 1 &&
              <button className='standard previous-step' onClick={this.toggleSteps.bind(this, 'previous')}>{t('txt-previousStep')}</button>
            }
            <button className='next-step' onClick={this.toggleSteps.bind(this, 'next')}>{this.getBtnText()}</button>
          </footer>
        </div>
      </div>
    )
  }
}

ManualAdd.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

const HocManualAdd = withLocale(ManualAdd);
export { ManualAdd, HocManualAdd };