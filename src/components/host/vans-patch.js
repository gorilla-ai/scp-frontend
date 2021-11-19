import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextareaAutosize from '@material-ui/core/TextareaAutosize'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import FileUpload from '../common/file-upload'
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const VANS_FILES = ['scriptFile', 'executableFile'];

let t = null;

/**
 * Vans Patch
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show Vans Patch component
 */
class VansPatch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      patch: {
        actionType: 'install', //'install' or 'delete'
        scriptFile: {},
        executableFile: {},
        memo: ''
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  /**
   * Handle input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempPatch = {...this.state.patch};
    tempPatch[event.target.name] = event.target.value;  

    this.setState({
      patch: tempPatch
    });
  }
  /**
   * Handle HMD setup file upload
   * @method
   * @param {string} type - file type ('scriptFile' or 'executableFile')
   * @param {object} file - file uploaded by the user
   */
  getVansPatchFile = (type, file) => {
    let tempPatch = {...this.state.patch};
    tempPatch[type] = file;

    this.setState({
      patch: tempPatch
    });
  }
  /**
   * Display file upload
   * @method
   * @param {string} val - file type
   * @param {number} i - index of the files
   * @returns HTML DOM
   */
  displayFileUpload = (val, i) => {
    return (
      <div key={i} className='group'>
        <FileUpload
          id={'vansPatch' + val}
          supportText={t('hmd-scan.txt-' + val)}
          btnText={t('txt-upload')}
          handleFileChange={this.getVansPatchFile.bind(this, val)} />
      </div>
    )
  }
  /**
   * Display vans patch content
   * @method
   * @returns HTML DOM
   */
  displayVansPatchContent = () => {
    const {patch} = this.state;

    return (
      <div className='vans-patch'>
        <div className='group'>
          <label>{t('hmd-scan.txt-vansType')}</label>
          <RadioGroup
            id='vansType'
            className='radio-group'
            name='actionType'
            value={patch.actionType}
            onChange={this.handleDataChange}>
            <FormControlLabel
              value='install'
              control={
                <Radio
                  id='vansInstall'
                  className='radio-ui'
                  color='primary' />
              }
              label={t('hmd-scan.txt-vansInstall')} />
            <FormControlLabel
              value='delete'
              control={
                <Radio
                  id='vansUninstall'
                  className='radio-ui'
                  color='primary' />
              }
              label={t('hmd-scan.txt-vansUninstall')} />
          </RadioGroup>
        </div>
        {VANS_FILES.map(this.displayFileUpload)}
        <div className='group memo'>
          <TextareaAutosize
            name='memo'
            className='textarea-autosize'
            placeholder={t('txt-tag')}
            rows={3}
            value={patch.memo}
            onChange={this.handleDataChange} />
        </div>
      </div>
    )
  }
  render() {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.toggleVansPatch},
      confirm: {text: t('hmd-scan.txt-readyPatch'), handler: this.props.confirmVansPatch.bind(this, this.state.patch)}
    };

    return (
      <ModalDialog
        id='vansPatchDialog'
        className='modal-dialog'
        title={t('hmd-scan.txt-vansPatch')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayVansPatchContent()}
      </ModalDialog>
    )
  }
}

VansPatch.contextType = BaseDataContext;

VansPatch.propTypes = {
  toggleVansPatch: PropTypes.func.isRequired,
  confirmVansPatch: PropTypes.func.isRequired
};

export default VansPatch;