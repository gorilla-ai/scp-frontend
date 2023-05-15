import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import styled from 'styled-components'

import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import Button from '@material-ui/core/Button'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import Input from 'react-ui/build/src/components/input'
import MultiInput from 'react-ui/build/src/components/multi-input'

import {BaseDataContext} from '../../common/context'
import EventProcess from './event-process'
import FileUpload from '../../common/file-upload'
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let it = null;

const CheckBoxIconContainer = styled(CheckBoxIcon)`
  color: #7ACC29;
`;

class TtpObsFile extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');

    this.state = {
      file: {},
      uploadFileName: ''
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
  handleDataChangeMui = (event) => {
    this.props.onChange({
      ...this.props.value,
      [event.target.name]: event.target.value
    });
  }
  /**
   * Handle date change
   * @method
   * @param {string} type - date type ('createDttm', 'modifyDttm' or 'accessDttm')
   * @param {string} value - input value
   */
  handleDateChange = (type, value) => {
    this.props.onChange({
      ...this.props.value,
      [type]: value
    });
  }
  /**
   * Handle events change
   * @method
   * @param {string} value - input value
   */
  handleEventsChange = (value) => {
    this.props.onChange({
      ...this.props.value,
      eventProcessList: value
    });
  }
  /**
   * Handle file upload input value change
   * @method
   * @param {object} value - file data to be set
   */
  handleFileChange = (value) => {
    if (value) {
      this.setState({
        file: value,
        uploadFileName: value.name
      });
    } else {
      this.setState({
        file: {},
        uploadFileName: ''
      });

      this.props.onChange({
        ...this.props.value,
        uploadFileName: '',
        tmpFileId: ''
      });
    }
  }
  /**
   * Handle file upload
   * @method
   */
  handleFileUpload = () => {
    const {baseUrl, contextRoot} = this.context;
    const {file, uploadFileName} = this.state;
    let formData = new FormData();
    formData.append('file', file);

    this.ah.one({
      url: `${baseUrl}/api/soc/malware/upload`,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data) {
        this.props.onChange({
          ...this.props.value,
          uploadFileName,
          tmpFileId: data
        });

        helper.showPopupMsg(t('txt-uploadSuccess'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {locale} = this.context;
    const {
      incidentFormType,
      disabledStatus,
      value: {
        fileName,
        fileExtension,
        fileSize,
        createDttm,
        modifyDttm,
        accessDttm,
        md5,
        sha1,
        sha256,
        product,
        isFamily,
        resultName,
        result,
        uploadFileName: originalUploadFileName,
        tmpFileId,
        malwareTypes,
        eventProcessList
      }
    } = this.props;
    const {uploadFileName} = this.state;
    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <div className='event-content'>
        <div className='line'>
          <div className='group'>
            <label htmlFor='fileName'>{f('incidentFields.fileName')}</label>
            <TextField style={{paddingRight: '2em'}}
              id='fileName'
              name='fileName'
              variant='outlined'
              fullWidth
              size='small'
              value={fileName}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus} />
          </div>
          <div className='group'>
            <label htmlFor='fileExtension'>{f('incidentFields.fileExtension')}</label>
            <TextField style={{paddingRight: '2em'}}
              id='fileExtension'
              name='fileExtension'
              variant='outlined'
              fullWidth
              size='small'
              value={fileExtension}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus} />
          </div>
        </div>

        <div className='line'>
          <div className='group'>
            <label htmlFor='fileSize'>{f('incidentFields.fileSize')}</label>
            <TextField style={{paddingRight: '2em'}}
              id='fileSize'
              name='fileSize'
              type='number'
              variant='outlined'
              size='small'
              InputProps={{inputProps: { min: 1 }}}
              value={fileSize}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus} />
          </div>
          <div className='group' style={{width: '25vh', marginRight: '10px'}}>
            <label htmlFor='expireDttm'>{f('incidentFields.fileCreateDttm')}</label>
            <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
              <KeyboardDateTimePicker
                id='fileCreateDttm'
                className='date-time-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD HH:mm'
                invalidDateMessage={t('txt-invalidDateMessage')}
                ampm={false}
                value={createDttm}
                onChange={this.handleDateChange.bind(this, 'createDttm')}
                disabled={disabledStatus} />
            </MuiPickersUtilsProvider>
          </div>
          <div className='group' style={{width: '25vh', marginRight: '10px'}}>
            <label htmlFor='expireDttm'>{f('incidentFields.fileModifyDttm')}</label>
            <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
              <KeyboardDateTimePicker
                id='fileModifyDttm'
                className='date-time-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD HH:mm'
                invalidDateMessage={t('txt-invalidDateMessage')}
                ampm={false}
                value={modifyDttm}
                onChange={this.handleDateChange.bind(this, 'modifyDttm')}
                disabled={disabledStatus} />
            </MuiPickersUtilsProvider>
          </div>
          <div className='group' style={{width: '25vh', marginRight: '10px'}}>
            <label htmlFor='expireDttm'>{f('incidentFields.fileAccessDttm')}</label>
            <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
              <KeyboardDateTimePicker
                id='fileAccessDttm'
                className='date-time-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD HH:mm'
                invalidDateMessage={t('txt-invalidDateMessage')}
                ampm={false}
                value={accessDttm}
                onChange={this.handleDateChange.bind(this, 'accessDttm')}
                disabled={disabledStatus} />
            </MuiPickersUtilsProvider>
          </div>
        </div>

        <div className='line'>
          <div className='group'>
            <label htmlFor='md5'>MD5</label>
            <TextField style={{paddingRight: '2em'}}
              id='md5'
              name='md5'
              variant='outlined'
              fullWidth
              size='small'
              maxLength={32}
              value={md5}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus} />
          </div>
          <div className='group'>
            <label htmlFor='sha1'>SHA1</label>
            <TextField style={{paddingRight: '2em'}}
              id='sha1'
              name='sha1'
              variant='outlined'
              fullWidth
              size='small'
              maxLength={40}
              value={sha1}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus} />
          </div>
        </div>

        <div className='line'>
          <div className='group full'>
            <label htmlFor='sha256'>SHA256</label>
            <TextField style={{paddingRight: '2em'}}
              id='sha256'
              name='sha256'
              variant='outlined'
              fullWidth
              size='small'
              maxLength={64}
              value={sha256}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus} />
          </div>
        </div>

        <div className='line'>
          <div className='group'>
            <label htmlFor='fileProduct'>{f('incidentFields.fileProduct')}</label>
            <TextField style={{paddingRight: '2em'}}
              id='fileProduct'
              name='product'
              variant='outlined'
              fullWidth
              size='small'
              value={product}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus} />
          </div>
          <div className='group'>
            <label htmlFor='fileIsFamily'>{f('incidentFields.fileFamily')}</label>
            <TextField style={{paddingRight: '2em'}}
              id='fileIsFamily'
              name='isFamily'
              variant='outlined'
              fullWidth
              size='small'
              select
              value={isFamily}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus}>
              <MenuItem value={true}>True</MenuItem>
              <MenuItem value={false}>False</MenuItem>
            </TextField>
          </div>
        </div>

        <div className='line'>
          <div className='group'>
            <label htmlFor='fileResultName'>{f('incidentFields.fileSeverity')}</label>
            <TextField style={{paddingRight: '2em'}}
              id='fileResultName'
              name='resultName'
              placeholder='8/10'
              variant='outlined'
              fullWidth
              size='small'
              value={resultName}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus} />
          </div>
          <div className='group'>
            <label htmlFor='fileResult'>{f('incidentFields.fileResult')}</label>
            <TextField style={{paddingRight: '2em'}}
              id='fileResult'
              name='result'
              variant='outlined'
              fullWidth
              size='small'
              select
              value={result}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus}>
              <MenuItem value='Malicious'>Malicious</MenuItem>
              <MenuItem value='suspicious'>Suspicious</MenuItem>
              <MenuItem value='benign'>Benign</MenuItem>
              <MenuItem value='unknown'>Unknown</MenuItem>
            </TextField>
          </div>
        </div>

        <div className='line'>
          <div className='group'>
            {(uploadFileName || originalUploadFileName) &&
              <React.Fragment>
                <div className='upload-file'>{t('txt-fileName')}: {uploadFileName || originalUploadFileName}</div>
                {tmpFileId &&
                  <CheckBoxIconContainer />
                }
              </React.Fragment>
            }
            <div className='upload-header'>{f('incidentFields.fileUpload')} (.zip) ({it('txt-zipPassword')})</div>
            <FileUpload
              id='fileUpload'
              fileType='zip'
              btnText={t('txt-selectFile')}
              handleFileChange={this.handleFileChange} />
            <Button variant='contained' color='primary' className='upload-btn' onClick={this.handleFileUpload} disabled={!uploadFileName}>{t('txt-upload')}</Button>
          </div>
          <div className='group'>
            <label htmlFor='malwareTypes'>{f('incidentFields.malwareTypes')}</label>
            <TextField style={{paddingRight: '2em'}}
              id='malwareTypes'
              name='malwareTypes'
              variant='outlined'
              fullWidth
              size='small'
              select
              value={malwareTypes}
              onChange={this.handleDataChangeMui}
              disabled={disabledStatus}>
              <MenuItem value='adware'>Adware</MenuItem>
              <MenuItem value='backdoor'>Backdoor</MenuItem>
              <MenuItem value='bootkit'>Bootkit</MenuItem>
              <MenuItem value='bot'>Bot</MenuItem>
              <MenuItem value='ddos'>Ddos</MenuItem>
              <MenuItem value='downloader'>Downloader</MenuItem>
              <MenuItem value='dropper'>Dropper</MenuItem>
              <MenuItem value='exploit-kit'>Exploit Kit</MenuItem>
              <MenuItem value='keylogger'>Keylogger</MenuItem>
              <MenuItem value='ransomware'>Ransomware</MenuItem>
              <MenuItem value='remote-access-trojan'>Remote Access Trojan</MenuItem>
              <MenuItem value='resource-exploitation'>Resource Exploitation</MenuItem>
              <MenuItem value='rogue-security-software'>Rogue Security Software</MenuItem>
              <MenuItem value='rootkit'>Rootkit</MenuItem>
              <MenuItem value='screen-capture'>Screen Capture</MenuItem>
              <MenuItem value='spyware'>Spyware</MenuItem>
              <MenuItem value='trojan'>Trojan</MenuItem>
              <MenuItem value='virus'>Virus</MenuItem>
              <MenuItem value='webshell'>Web Shell</MenuItem>
              <MenuItem value='wiper'>Wiper</MenuItem>
              <MenuItem value='worm'>Worm</MenuItem>
              <MenuItem value='unknown'>Unknown</MenuItem>
            </TextField>
          </div>
        </div>

        <div className='line'>
          <MultiInput
            id='eventProcess'
            className='event-process-group'
            base={EventProcess}
            defaultItemValue={{
              process: ''
            }}
            value={eventProcessList}
            props={{
              disabledStatus
            }}
            onChange={this.handleEventsChange}
            readOnly={disabledStatus} />
        </div>
      </div>
    )
  }
}

TtpObsFile.contextType = BaseDataContext;
TtpObsFile.propTypes = {
};

export default TtpObsFile;