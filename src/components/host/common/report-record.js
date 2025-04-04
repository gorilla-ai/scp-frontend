import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';

let t = null;

/**
 * Host report record component
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the report record
 */
class ReportRecord extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');

    this.state = {
      hmdVansConfigurations: {
        oid: '',
        unitName: '',
        apiKey: '',
        apiUrl: ''
      },
      vansFormValidation: {
        oid: {
          valid: true
        },
        unitName: {
          valid: true
        },
        apiKey: {
          valid: true
        },
        apiUrl: {
          valid: true
        }
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.deleteFileRecord();    
  }
  /**
   * Delete file record before showing the dialog
   * @method
   */
  deleteFileRecord = () => {
    const {baseUrl} = this.context;
    const {page} = this.props;
    let url = '';

    if (page === 'inventory') {
      url = `${baseUrl}/api/hmd/cpeUpdateToDate/merge/_delete`;
    } else if (page === 'kbid') {
      url = `${baseUrl}/api/hmd/kbid/merge/_delete`;
    }

    this.ah.one({
      url,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })    
  }
  /**
   * Handle input data change
   * @method
   * @param {object} event - event object
   */
  handleVansConfigChange = (event) => {
    const {name, value} = event.target;
    let tempHmdVansConfigurations = {...this.state.hmdVansConfigurations};
    tempHmdVansConfigurations[name] = value;

    this.setState({
      hmdVansConfigurations: tempHmdVansConfigurations
    });
  }
  /**
   * Display Vans record data
   * @method
   * @param {string} val - vans record data
   * @param {number} i - index of the vans record data
   * @returns HTML DOM
   */
  showVansRecordRow = (val, i) => {
    return (
      <tr key={i}>
        <td><span>{val}</span></td>
      </tr>
    )
  }
  /**
   * Display Vans record data
   * @method
   * @param {string} key - vans record type ('Server' or 'PC')
   * @param {object} vansRecord - vans record data
   * @returns HTML DOM
   */
  showVansRecordTable = (key, vansRecord) => {
    return (
      <table key={key} className='c-table' style={{width: '100%', marginTop: '10px', marginBottom: '10px'}}>
        <tbody>
          <tr>
            <th>{key}</th>
          </tr>

          {vansRecord[key].length > 0 &&
            vansRecord[key].map(this.showVansRecordRow)
          }

          {vansRecord[key].length === 0 &&
            <tr><td><span>{NOT_AVAILABLE}</span></td></tr>
          }
        </tbody>
      </table>
    )
  }
  /**
   * Display Vans record content
   * @method
   * @returns HTML DOM
   */
  showVansRecordContent = (vansRecord) => {
    return (
      <div>
        {
          Object.keys(vansRecord).map(key =>
            this.showVansRecordTable(key, vansRecord)
          )
        }
      </div>
    )
  }
  /**
   * Handle CPE download button
   * @method
   */
  fileDownload = () => {
    const {baseUrl, contextRoot} = this.context;
    const {page} = this.props;
    let url = '';

    if (page === 'inventory') {
      url = `${baseUrl}${contextRoot}/api/hmd/cpeFile/merge/_download`;
    } else if (page === 'kbid') {
      url = `${baseUrl}${contextRoot}/api/hmd/kbid/merge/_download`;
    }

    window.open(url, '_blank');
  }
  /**
   * Get Vans Record
   * @method
   */
  getVansRecord = () => {
    const {baseUrl} = this.context;
    const {page, filter} = this.props;
    let requestData = {
      departmentArray: filter.departmentSelected
    };
    let recordType = '';

    if (page === 'inventory') {
      recordType = 'vans';
    } else if (page === 'kbid') {
      recordType = 'kbid';
    }

    requestData.recordType = recordType;

    this.ah.one({
      url: `${baseUrl}/api/hmd/nccst/report/record`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        PopupDialog.alert({
          id: 'modalWindowSmall',
          title: t('host.txt-vansRecord'),
          confirmText: t('txt-close'),
          display: this.showVansRecordContent(data)
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display report form content
   * @method
   * @returns HTML DOM
   */
  displayReportForm = () => {
    const {page, uploadedFile} = this.props;
    const {hmdVansConfigurations, vansFormValidation} = this.state;
    let uploadTitle = '';

    if (page === 'inventory') {
      uploadTitle = t('host.txt-uploadMergedCpe');
    } else if (page === 'kbid') {
      uploadTitle = t('host.txt-uploadMergedKbid');
    }    

    return (
      <div className='vans-config-form'>
        {(page === 'inventory' || page === 'kbid') &&
          <Button id='uploadMergedCpe' variant='outlined' color='primary' className='standard btn' onClick={this.props.toggleUploadFile}>{uploadTitle}</Button>
        }

        {page === 'inventory' && uploadedFile &&
          <Button id='downloadMergedCpe' variant='outlined' color='primary' className='standard btn' onClick={this.fileDownload}>{t('host.txt-downloadMergedCpe')}</Button>
        }

        {page === 'kbid' && uploadedFile &&
          <Button id='downloadMergedCpe' variant='outlined' color='primary' className='standard btn' onClick={this.fileDownload}>{t('host.txt-downloadMergedKbid')}</Button>
        }

        <Button id='vansRecordCpe' variant='outlined' color='primary' className='standard btn' onClick={this.getVansRecord}>{t('host.txt-vansRecord')}</Button>
        <div className='group'>
          <TextField
            id='vansConfigOID'
            name='oid'
            label={t('host.txt-vansConfigOID')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!vansFormValidation.oid.valid}
            helperText={vansFormValidation.oid.valid ? '' : t('txt-required')}
            value={hmdVansConfigurations.oid}
            onChange={this.handleVansConfigChange} />
        </div>
        <div className='group'>
          <TextField
            id='vansConfigUnitName'
            name='unitName'
            label={t('host.txt-vansConfigUnitName')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!vansFormValidation.unitName.valid}
            helperText={vansFormValidation.unitName.valid ? '' : t('txt-required')}
            value={hmdVansConfigurations.unitName}
            onChange={this.handleVansConfigChange} />
        </div>
        <div className='group'>
          <TextField
            id='vansConfigApiKey'
            name='apiKey'
            label={t('host.txt-vansConfigApiKey')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!vansFormValidation.apiKey.valid}
            helperText={vansFormValidation.apiKey.valid ? '' : t('txt-required')}
            value={hmdVansConfigurations.apiKey}
            onChange={this.handleVansConfigChange} />
        </div>
        <div className='group'>    
          <TextField
            id='vansConfigApiUrl'
            name='apiUrl'
            label={t('host.txt-vansConfigApiUrl')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!vansFormValidation.apiUrl.valid}
            helperText={vansFormValidation.apiUrl.valid ? '' : t('txt-required')}
            value={hmdVansConfigurations.apiUrl}
            onChange={this.handleVansConfigChange} />
        </div>
      </div>
    )
  }
  /**
   * Check form validations
   * @method
   */
  checkFormValidations = () => {
    const {hmdVansConfigurations, vansFormValidation} = this.state;
    let tempVansFormValidation = {...vansFormValidation};
    let validate = true;

    if (hmdVansConfigurations.oid) {
      tempVansFormValidation.oid.valid = true;
    } else {
      tempVansFormValidation.oid.valid = false;
      validate = false;
    }

    if (hmdVansConfigurations.unitName) {
      tempVansFormValidation.unitName.valid = true;
    } else {
      tempVansFormValidation.unitName.valid = false;
      validate = false;
    }

    if (hmdVansConfigurations.apiKey) {
      tempVansFormValidation.apiKey.valid = true;
    } else {
      tempVansFormValidation.apiKey.valid = false;
      validate = false;
    }

    if (hmdVansConfigurations.apiUrl) {
      tempVansFormValidation.apiUrl.valid = true;
    } else {
      tempVansFormValidation.apiUrl.valid = false;
      validate = false;
    }

    this.setState({
      vansFormValidation: tempVansFormValidation
    });

    if (validate) {
      this.props.confirmReportList(hmdVansConfigurations);
      this.props.toggleReport();
    }
  }
  render() {
    const {page} = this.props;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.toggleReport},
      confirm: {text: t('txt-confirm'), handler: this.checkFormValidations}
    };
    let title = '';

    if (page === 'inventory') {
      title = t('host.txt-report-vans');
    } else if (page === 'kbid') {
      title = t('host.txt-report-kbid');
    }

    return (
      <ModalDialog
        id='reportNCCSTdialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayReportForm()}
      </ModalDialog>
    )
  }
}

ReportRecord.contextType = BaseDataContext;

ReportRecord.propTypes = {
  page: PropTypes.string.isRequired,
  filter: PropTypes.object.isRequired,
  uploadedFile: PropTypes.boolean,
  toggleReport: PropTypes.func.isRequired,
  toggleUploadFile: PropTypes.func.isRequired,
  confirmReportList: PropTypes.func.isRequired
};

export default ReportRecord;