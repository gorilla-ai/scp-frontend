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

const HMD_VANS_CONFIG = {
  oid: '',
  unitName: '',
  apiKey: '',
  apiUrl: ''
};
const VANS_FORM_VALIDATION = {
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
};
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
      hmdVansConfigurations: _.cloneDeep(HMD_VANS_CONFIG),
      vansFormValidation: _.cloneDeep(VANS_FORM_VALIDATION)
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
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
      url: `${baseUrl}/api/hmd/vans/report/record`,
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
    const {hmdVansConfigurations, vansFormValidation} = this.state;

    return (
      <div className='vans-config-form'>
        <Button id='uploadMergedCpe' style={{visibility: 'hidden'}} variant='outlined' color='primary' className='standard btn' onClick={this.toggleCpeUploadFile}>{t('host.txt-uploadMergedCpe')}</Button>
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
  toggleReport: PropTypes.func.isRequired,
  confirmReportList: PropTypes.func.isRequired
};

export default ReportRecord;