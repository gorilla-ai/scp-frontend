import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import {GithubPicker} from 'react-color'

import Button from '@material-ui/core/Button'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from './context'
import helper from './helper'

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
      vansNotes: {
        id: '',
        status: '',
        annotation: '',
        color: ''
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getVansData();
  }
  /**
   * Set Vans info data if available
   * @method
   */
  getVansData = () => {
    const {currentData} = this.props;

    if (currentData.annotationObj) {
      this.setState({
        vansNotes: {
          id: currentData.annotationObj.id,
          status: currentData.annotationObj.status,
          annotation: currentData.annotationObj.annotation,
          color: currentData.annotationObj.color
        }
      });
    }
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
    const {vansNotes} = this.state;
    const url = `${baseUrl}/api/annotation`;
    let requestType = 'POST';
    let requestData = {
      attribute: currentData.ipDeviceUUID || currentData.primaryKeyValue,
      status: vansNotes.status,
      annotation: vansNotes.annotation,
      color: vansNotes.color,
      module: MODULE_TYPE[currentType]
    };

    if (vansNotes.id) {
      requestData.id = vansNotes.id;
      requestType = 'PATCH';
    }

    if (vansNotes.status === '' && vansNotes.annotation === '') {
      return;
    }

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: requestType,
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        helper.showPopupMsg(t('txt-saved'));
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
    const {vansNotes} = this.state;

    ah.one({
      url: `${baseUrl}/api/annotation?id=${vansNotes.id}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.handleVansNotesClear();
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
   */
  handleVansNotesClear = () => {
    this.setState({
       vansNotes: {
        id: '',
        status: '',
        annotation: '',
        color: ''
      }
    });
  }
  render() {
    const {vansNotes} = this.state;

    return (
      <div className='vans-notes'>
        <div className='group'>
          <TextField
            name='status'
            label={t('host.txt-status')}
            variant='outlined'
            fullWidth
            size='small'
            value={vansNotes.status}
            onChange={this.handleVansNotesChange} />
        </div>
        <div className='group'>
          <TextareaAutosize
            name='annotation'
            className='textarea-autosize notes'
            placeholder={t('host.txt-annotation')}
            rows={5}
            value={vansNotes.annotation}
            onChange={this.handleVansNotesChange} />
        </div>
        <div className='group color'>
          <label>{t('txt-color')}</label>
          {vansNotes.color &&
            <div className='color-box' className={'color-box ' + helper.showColor(vansNotes.color)}></div>
          }
          <GithubPicker
            width='213px'
            colors={COLOR_LIST}
            triangle='hide'
            onChangeComplete={this.handleDataChange} />
        </div>
        <div className='group btn-group'>
          <Button variant='contained' color='primary' className='save' onClick={this.handleVansNotesSave}>{t('txt-save')}</Button>
          {vansNotes.id &&
            <Button variant='outlined' color='primary' className='delete' onClick={this.handleVansNotesDelete}>{t('txt-delete')}</Button>
          }
        </div>
      </div>
    )
  }
}

VansNotes.contextType = BaseDataContext;

VansNotes.propTypes = {
  currentData: PropTypes.object.isRequired,
  currentType: PropTypes.string.isRequired
};

export default VansNotes;