import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import {GithubPicker} from 'react-color'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText'
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const COLOR_LIST = ['#B80000', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#004DCF', '#5300EB'];
const MODULE_TYPE = {
  device: 'device',
  scanFile: 'malware',
  gcbDetection: 'gcb',
  getFileIntegrity: 'fileIntegrity',
  getEventTraceResult: 'eventTracing',
  getProcessMonitorResult: 'processMonitor',
  getVansCpe: 'cpe',
  getVansCve: 'cve'
};

let t = null;
let f = null;

/**
 * Vans Notes
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show Vans Notes component
 */
class VansNotes extends Component {
  constructor(props) {
    super(props);

    this.state = {
      statusType: '', //'new' or 'existing'
      statusList: [],
      originalStatus: {},
      vansNotes: {
        id: '',
        status: '',
        annotation: '',
        color: ''
      },
      showColorPalette: false,
      formValidation: {
        status: {
          valid: true
        }
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.setVansData();
    this.setVansStatus();
  }
  componentDidUpdate(prevProps) {
    const {currentData, vansDeviceStatusList} = this.props;

    //For updating new vans notes status
    if (!prevProps || (prevProps && currentData.annotationObj && currentData.annotationObj.id && !prevProps.currentData.annotationObj)) {
      this.setVansData();
    }

    //For updating existing vans notes status
    if (prevProps && prevProps.currentData.annotationObj && currentData.annotationObj) {
      if (prevProps.currentData.annotationObj.status !== currentData.annotationObj.status) {
        this.setVansData();
      }
    }

    if (!prevProps || (prevProps && vansDeviceStatusList !== prevProps.vansDeviceStatusList)) {
      this.setVansStatus();
    }
  }
  /**
   * Set vans info data
   * @method
   */
  setVansData = () => {
    const {currentData, currentType, vansDeviceStatusList, vansHmdStatusList} = this.props;
    let statusList = [];
    let statusType = 'new';
    let currentStatus = '';

    if (currentType === 'device') {
      statusList = vansDeviceStatusList;
    } else {
      statusList = vansHmdStatusList;
    }

    if (currentData.annotationObj) {
      if (currentData.annotationObj.status) {
        const selectedStatusIndex = _.findIndex(statusList, { 'value': currentData.annotationObj.status });
        currentStatus = statusList[selectedStatusIndex];
        statusType = 'existing';
      }

      this.setState({
        vansNotes: {
          id: currentData.annotationObj.id,
          status: currentStatus,
          annotation: currentData.annotationObj.annotation,
          color: currentData.annotationObj.color
        }
      });
    }

    this.setState({
      statusType,
      originalStatus: currentStatus
    });
  }
  /**
   * Set vans status
   * @method
   */
  setVansStatus = () => {
    const {currentType, vansDeviceStatusList, vansHmdStatusList} = this.props;
    let statusList = [];

    if (currentType === 'device') {
      statusList = vansDeviceStatusList;
    } else {
      statusList = vansHmdStatusList;
    }

    this.setState({
      statusList,
      originalStatus: {}
    });
  }
  /**
   * Display status list
   * @method
   * @param {object} params - parameters for Autocomplete
   * @returns TextField component
   */
  renderStatusList = (params) => {
    return (
      <TextField
        {...params}
        label={t('host.txt-status') + ' *'}
        variant='outlined'
        size='small' />
    )
  }
  /**
   * Handle status combo box change
   * @method
   * @param {object} event - select event
   * @param {object} value - selected status info
   */
  handleComboBoxChange = (event, value) => {
    const {statusList, vansNotes} = this.state;

    if (value && value.value) {
      const selectedStatusIndex = _.findIndex(statusList, { 'value': value.value });
      let tempVansNotes = {...vansNotes};
      tempVansNotes.status = statusList[selectedStatusIndex];

      this.setState({
        vansNotes: tempVansNotes
      });
    }
  }
  /**
   * Handle status type value change
   * @method
   * @param {object} event - event object
   */
  handleRadioChange = (event) => {
    const {originalStatus, vansNotes} = this.state;
    const type = event.target.value;
    let tempVansNotes = {...vansNotes};

    if (type === 'new') {
      tempVansNotes.status = '';
    } else if (type === 'existing') {
      tempVansNotes.status = originalStatus;
    }

    this.setState({
      statusType: event.target.value,
      vansNotes: tempVansNotes,
      formValidation: {
        status: {
          valid: true
        }
      }
    });
  }
  /**
   * Handle vans annotation data change
   * @method
   * @param {object} event - event object
   */
  handleVansNotesChange = (event) => {
    let tempVansNotes = {...this.state.vansNotes};
    tempVansNotes[event.target.name] = event.target.value;

    this.setState({
      vansNotes: tempVansNotes
    });
  }
  /**
   * Handle value change for the add tagging form
   * @method
   * @param {object | string} event - event object
   */
  handleDataChange = (event) => {
    const value = event.target ? event.target.value : event.hex;
    let tempVansNotes = {...this.state.vansNotes};

    if (event.hex) {
      tempVansNotes.color = value.toUpperCase();
    } else {
      tempVansNotes.memo = value;
    }

    this.setState({
      vansNotes: tempVansNotes
    });
  }
  /**
   * Handle vans annotation save
   * @method
   */
  handleVansNotesSave = () => {
    const {baseUrl} = this.context;
    const {currentData, currentType} = this.props;
    const {statusType, vansNotes, formValidation} = this.state;
    const url = `${baseUrl}/api/annotation`;
    const status = statusType === 'new' ? vansNotes.status : vansNotes.status.value;
    let requestType = 'POST';
    let requestData = {
      attribute: currentData.ipDeviceUUID || currentData.primaryKeyValue,
      status,
      annotation: vansNotes.annotation,
      color: vansNotes.color,
      module: MODULE_TYPE[currentType]
    };
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (status) {
      tempFormValidation.status.valid = true;
    } else {
      tempFormValidation.status.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    if (vansNotes.id) {
      requestData.id = vansNotes.id;
      requestType = 'PATCH';
    }

    if (requestData.status === '' && requestData.annotation === '') {
      return;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: requestType,
      contentType: 'text/plain'
    })
    .then(data => {
      if (data && data.ret === 0) {
        helper.showPopupMsg(t('txt-saved'));

        if (currentType === 'device') {
          this.props.getIPdeviceInfo();
        } else {
          this.props.getSafetyScanData();
        }

        this.props.getVansStatus();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display delete vans annotation content
   * @method
   * @returns HTML DOM
   */
  getDeleteVansNotesContent = () => {
    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}?</span>
      </div>
    )
  }
  /**
   * Handle vans annotation delete
   * @method
   */
  handleVansNotesDelete = () => {
    PopupDialog.prompt({
      title: t('host.txt-deleteVansNotes'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteVansNotesContent(),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteVansNotes();
        }
      }
    });
  }
  /**
   * Delete vans annotation
   * @method
   */
  deleteVansNotes = () => {
    const {baseUrl} = this.context;
    const {currentType} = this.props;
    const {vansNotes} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/annotation?id=${vansNotes.id}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data && data.ret === 0) {
        this.setState({
          vansNotes: {
            id: '',
            status: '',
            annotation: '',
            color: ''
          }
        });

        if (currentType === 'device') {
          this.props.getIPdeviceInfo();
        } else {
          this.props.getSafetyScanData();
        }

        this.props.getVansStatus();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Clear vans annotation
   * @method
   * @param {string} type - button type ('clear' or 'palette')
   */
  handleVansColorButton = (type) => {
    if (type === 'clear') {
      let tempVansNotes = {...this.state.vansNotes};
      tempVansNotes.color = '';

      this.setState({
        vansNotes: tempVansNotes,
        showColorPalette: false
      });
    } else if (type === 'palette') {
      this.setState({
        showColorPalette: !this.state.showColorPalette
      });
    }
  }
  /**
   * Show color palette
   * @method
   */
  turnOnColorPalette = () => {
    this.setState({
      showColorPalette: true
    });
  }
  /**
   * Get vans notes height
   * @method
   * @returns CSS height
   */
  getHeight = () => {
    const {currentType} = this.props;

    if (currentType === 'device') {
      return { height: '340px' };
    } else {
      return { height: '390px' };
    }
  }
  render() {
    const {statusType, statusList, vansNotes, showColorPalette, formValidation} = this.state;

    return (
      <div className='vans-notes' style={this.getHeight()}>
        <div className='group'>
          {statusList.length > 0 &&
            <RadioGroup
              className='radio-group'
              value={statusType}
              onChange={this.handleRadioChange}>
              <FormControlLabel
                value='new'
                control={<Radio color='primary' />}
                label={t('txt-add')} />
              <FormControlLabel
                value='existing'
                control={<Radio color='primary' />}
                label={t('txt-existing')} />
            </RadioGroup>
          }
          {statusType === 'new' &&
            <TextField
              name='status'
              label={t('host.txt-status')}
              variant='outlined'
              fullWidth
              size='small'
              required
              error={!formValidation.status.valid}
              helperText={formValidation.status.valid ? '' : t('txt-required')}
              value={vansNotes.status}
              onChange={this.handleVansNotesChange} />
          }
          {statusType === 'existing' &&
            <React.Fragment>
              <Autocomplete
                className='combo-box'
                options={statusList}
                value={vansNotes.status}
                getOptionLabel={(option) => option.text}
                renderInput={this.renderStatusList}
                onChange={this.handleComboBoxChange} />
              <div className='error-msg'>{formValidation.status.valid ? '' : t('txt-required')}</div>
            </React.Fragment>
          }
        </div>
        <div className='group'>
          <TextareaAutosize
            name='annotation'
            className='textarea-autosize notes'
            placeholder={t('host.txt-annotation')}
            rows={3}
            value={vansNotes.annotation}
            onChange={this.handleVansNotesChange} />
        </div>
        <div className='group color'>
          <label>{t('txt-color')}</label>
          {vansNotes.color &&
            <React.Fragment>
              <div className='color-box' className={'c-link color-box ' + helper.showColor(vansNotes.color)} onClick={this.turnOnColorPalette}></div>
              <Button variant='outlined' color='primary' className='standard btn clear' onClick={this.handleVansColorButton.bind(this, 'clear')}>{t('txt-clearText')}</Button>
            </React.Fragment>
          }
          {!vansNotes.color &&
            <Button variant='outlined' color='primary' className='standard btn clear' onClick={this.handleVansColorButton.bind(this, 'palette')}>{t('txt-palette')}</Button>
          }
          {showColorPalette &&
            <GithubPicker
              width='213px'
              colors={COLOR_LIST}
              triangle='hide'
              onChangeComplete={this.handleDataChange} />
          }
        </div>
        <div className='group btn-group'>
          <Button variant='contained' color='primary' className='btn save' onClick={this.handleVansNotesSave}>{t('txt-save')}</Button>
          {vansNotes.id &&
            <Button variant='outlined' color='primary' className='standard btn delete' onClick={this.handleVansNotesDelete}>{t('txt-delete')}</Button>
          }
        </div>
      </div>
    )
  }
}

VansNotes.contextType = BaseDataContext;

VansNotes.propTypes = {
  currentData: PropTypes.object.isRequired,
  currentType: PropTypes.string.isRequired,
  getIPdeviceInfo: PropTypes.func.isRequired,
  getSafetyScanData: PropTypes.func.isRequired,
  vansDeviceStatusList: PropTypes.array,
  vansHmdStatusList: PropTypes.array
};

export default VansNotes;