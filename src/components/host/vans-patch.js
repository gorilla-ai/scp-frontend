import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import FileUpload from '../common/file-upload'
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const VANS_FILES = ['scriptFile', 'executableFile'];
const FORM_VALIDATION = {
  product: {
    valid: true
  },
  vendor: {
    valid: true
  },
  version: {
    valid: true
  }
};

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
        product: '',
        vendor: '',
        version: '',
        memo: ''
      },
      formValidation: _.cloneDeep(FORM_VALIDATION)
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getVansPatchInfo();
  }
  /**
   * Get and set Vans Patch info
   * @method
   */
  getVansPatchInfo = () => {
    const {patchInfo} = this.props;
    let tempPatch = {...this.state.patch};

    if (!_.isEmpty(patchInfo)) {
      tempPatch.product = patchInfo.patchProduct;
      tempPatch.vendor = patchInfo.patchVendor;
      tempPatch.version = patchInfo.patchVersion;
      tempPatch.memo = patchInfo.memo;

      this.setState({
        patch: tempPatch
      });
    }
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
          supportText={t('hmd-scan.txt-' + val) + ' *'}
          btnText={t('txt-upload')}
          handleFileChange={this.getVansPatchFile.bind(this, val)} />
      </div>
    )
  }
  /**
   * Check form validation
   * @method
   */
  checkFormValidation = () => {
    const {patch, formValidation} = this.state;
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (patch.product) {
      tempFormValidation.product.valid = true;
    } else {
      tempFormValidation.product.valid = false;
      validate = false;
    }

    if (patch.vendor) {
      tempFormValidation.vendor.valid = true;
    } else {
      tempFormValidation.vendor.valid = false;
      validate = false;
    }

    if (patch.version) {
      tempFormValidation.version.valid = true;
    } else {
      tempFormValidation.version.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    this.props.toggleFrMotp(patch);
  }
  /**
   * Display vans patch content
   * @method
   * @returns HTML DOM
   */
  displayVansPatchContent = () => {
    const {patch, formValidation} = this.state;

    return (
      <div className='form-group vans-patch'>
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
              value='uninstall'
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
        <div className='group full'>
          <label>{t('hmd-scan.txt-patchProduct')} *</label>
          <TextField
            name='product'
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!formValidation.product.valid}
            helperText={formValidation.product.valid ? '' : t('txt-required')}
            value={patch.product}
            onChange={this.handleDataChange} />
        </div>
        <div className='group full'>
          <label>{t('hmd-scan.txt-patchVendor')} *</label>
          <TextField
            name='vendor'
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!formValidation.vendor.valid}
            helperText={formValidation.vendor.valid ? '' : t('txt-required')}
            value={patch.vendor}
            onChange={this.handleDataChange} />
        </div>
        <div className='group full'>
          <label>{t('hmd-scan.txt-patchVersion')} *</label>
          <TextField
            name='version'
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!formValidation.version.valid}
            helperText={formValidation.version.valid ? '' : t('txt-required')}
            value={patch.version}
            onChange={this.handleDataChange} />
        </div>
        <div className='group memo'>
          <TextareaAutosize
            name='memo'
            className='textarea-autosize'
            placeholder={t('txt-tag')}
            minRows={3}
            value={patch.memo}
            onChange={this.handleDataChange} />
        </div>
      </div>
    )
  }
  render() {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.toggleVansPatch},
      confirm: {text: t('hmd-scan.txt-readyPatch'), handler: this.checkFormValidation}
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
  patchInfo: PropTypes.object.isRequired,
  toggleVansPatch: PropTypes.func.isRequired,
  toggleFrMotp: PropTypes.func.isRequired
};

export default VansPatch;