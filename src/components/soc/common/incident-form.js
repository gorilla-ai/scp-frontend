import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import DataTable from 'react-ui/build/src/components/table'
import {downloadLink, downloadWithForm} from 'react-ui/build/src/utils/download'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context'
import Events from './events'
import helper from '../../common/helper'
import NotifyContact from './notifyContact'
import Ttps from './ttps'

import {default as ah} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;
let it = null;
let at = null;

const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};

/**
 * IncidentForm
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the SOC Incident form
 */
class IncidentForm extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');
    at = global.chewbaccaI18n.getFixedT(null, 'account');

    this.state = {
    };
  }
  componentDidMount() {
  }
  showRelatedList = (val, i) => {
    return <span key={i} className='item'>{val}</span>
  }
  /**
   * Get classname for form group
   * @method
   * @returns class name
   */
  getClassName = () => {
    const {from} = this.props;

    if (from === 'soc' || from === 'pattern') {
      return 'form-group normal';
    } else if (from === 'threats') {
      return 'form-group long';
    }
  }
  /**
   * Get classname for form group
   * @method
   * @returns CSS property object
   */
  getStyle = () => {
    const {from} = this.props;

    if (from === 'threats') {
      return { width: '85%' };
    } else if (from === 'pattern') {
      return { width: '100%' };
    }
  }
  /**
   * Check required field
   * @method
   * @param {string} field - form name
   * @returns boolean true / false
   */
  checkRequiredField = (field) => {
    const {from, activeContent, requiredField} = this.props;
    let required = false;

    if (activeContent === 'viewIncident' || activeContent === 'viewPattern') {
      return;
    }

    if (from === 'soc') {
      required = true;
    }

    if (from === 'pattern' && requiredField.indexOf(field) > -1) {
      required = true;
    }

    return required;
  }
  /**
   * Check error field
   * @method
   * @param {string} field - field name
   * @param {string} value - field value
   * @returns boolean true
   */
  checkErrorField = (field, value) => {
    const {from, activeContent, requiredField} = this.props;

    if (activeContent === 'viewIncident' || activeContent === 'viewPattern') {
      return false;
    }

    if (from === 'soc' && !value) {
      return true;
    }

    if (from === 'pattern' && requiredField.indexOf(field) > -1 && !value) {
      return true;
    }
  }
  /**
   * Check helper text
   * @method
   * @param {string} field - field name
   * @param {string} value - field value
   * @returns required text
   */
  checkHelperText = (field, value) => {
    const {from, activeContent, requiredField} = this.props;

    if (activeContent === 'viewIncident' || activeContent === 'viewPattern') {
      return;
    }

    if (from === 'soc' && !value) {
      return it('txt-required');
    }

    if (from === 'pattern' && requiredField.indexOf(field) > -1 && !value) {
      return it('txt-required');
    }
  }
  /**
   * Check disabled status
   * @method
   * @returns boolean true / false
   */
  checkDisabledStatus = (field) => {
    const {from, activeContent} = this.props;
    let disabled = null;

    if (from === 'soc') {
      if (activeContent === 'addIncident') {
        disabled = false;
      } else {
        disabled = true;
      }
    }

    if (from === 'pattern') {
      if (activeContent === 'viewPattern') {
        disabled = true;
      } else {
        disabled = false;
      }
    }

    return disabled;
  }
  /**
   * Display main section
   * @method
   * @returns HTML DOM
   */
  displayMain = () => {
    const {locale} = this.context;
    const {
      from,
      activeContent,
      activeSteps,
      incidentType,
      incident,
      severityList,
      socFlowList,
      enableEstablishDttm
    } = this.props;
    let required = false;
    let error = false;
    let helperText = '';
    let disabledStatus = null;
    let establishDttm = '';
    let disabledEstablishDttm = '';
    let dateLocale = locale;

    if (from === 'soc' || from === 'pattern') {
      establishDttm = incident.info.enableEstablishDttm;

      if (from === 'soc') {
        required = true;
        disabledStatus = activeContent === 'viewIncident' ? true : false;
        disabledEstablishDttm = (activeContent === 'viewIncident' || !incident.info.enableEstablishDttm);
      } else if (from === 'pattern') {
        disabledStatus = activeContent === 'viewPattern' ? true : false;
        disabledEstablishDttm = (activeContent === 'viewPattern' || !incident.info.enableEstablishDttm);
      }
    } else if (from === 'threats') {
      establishDttm = enableEstablishDttm;
      disabledEstablishDttm = !enableEstablishDttm;
    }

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <div className={this.getClassName()} style={this.getStyle()}>
        <header>
          <div className='text'>{t('edge-management.txt-basicInfo')}</div>
          {activeContent && (activeContent !== 'addIncident' && activeContent !== 'addPattern') &&
            <span className='msg'>{f('incidentFields.updateDttm')}{helper.getFormattedDate(incident.info.updateDttm, 'local')}</span>
          }
        </header>

        {from === 'soc' &&
          <div className='btn btn-group'>
            <Button className='left-btn' variant='contained' color='primary' onClick={this.props.handleIncidentPageChange.bind(this, 'main')} disabled={true}>{it('txt-prev-page')}</Button>
            <Button variant='contained' color='primary' onClick={this.props.handleIncidentPageChange.bind(this, 'events')}>{it('txt-next-page')}</Button>
          </div>
        }

        {from === 'threats' &&
          <div className='btn btn-group'>
            <Button id='previousStep' variant='contained' color='primary' className='left-btn' onClick={this.props.toggleSteps.bind(this, 'previous')} disabled={activeSteps === 1}>{it('txt-prev-page')}</Button>
            <Button id='nextStep' variant='contained' color='primary' onClick={this.props.toggleSteps.bind(this, 'next')} disabled={activeSteps === 2}>{it('txt-next-page')}</Button>
          </div>
        }

        <div className='group full'>
          <label htmlFor='title'>{f('incidentFields.title')}</label>
          <TextField
            id='title'
            name='title'
            variant='outlined'
            fullWidth
            size='small'
            required={this.checkRequiredField(incident.info.title)}
            error={this.checkErrorField('title', incident.info.title)}
            helperText={this.checkHelperText('title', incident.info.title)}
            value={incident.info.title}
            onChange={this.props.handleDataChangeMui}
            disabled={disabledStatus} />
        </div>
        {from === 'pattern' &&
          <div className='group full'>
            <label htmlFor='title'>{f('incidentFields.rule')}</label>
            <TextField
              id='eventDescription'
              name='eventDescription'
              variant='outlined'
              fullWidth
              size='small'
              required={this.checkRequiredField(incident.info.eventDescription)}
              error={this.checkErrorField('eventDescription', incident.info.eventDescription)}
              helperText={this.checkHelperText('eventDescription', incident.info.eventDescription)}
              value={incident.info.eventDescription}
              onChange={this.props.handleDataChangeMui}
              disabled={disabledStatus} />
          </div>
        }
        <div className='group full'>
          <label htmlFor='incidentDescription'>{f('incidentFields.incidentDescription')}</label>
          <TextField
            id='incidentDescription'
            name='incidentDescription'
            variant='outlined'
            fullWidth
            size='small'
            multiline
            rows={3}
            rowsMax={3}
            required={this.checkRequiredField(incident.info.incidentDescription)}
            error={this.checkErrorField('incidentDescription', incident.info.incidentDescription)}
            helperText={this.checkHelperText('incidentDescription', incident.info.incidentDescription)}
            value={incident.info.incidentDescription}
            onChange={this.props.handleDataChangeMui}
            disabled={disabledStatus} />
        </div>
        <div className='group'>
          <label htmlFor='category'>{f('incidentFields.category')}</label>
          <TextField
            id='category'
            name='category'
            variant='outlined'
            fullWidth
            size='small'
            select
            required={this.checkRequiredField(incident.info.category)}
            error={this.checkErrorField('category', incident.info.category)}
            helperText={this.checkHelperText('category', incident.info.category)}
            value={incident.info.category}
            onChange={this.props.handleDataChangeMui}
            disabled={disabledStatus}>
            {
              _.map(_.range(10, 20), el => {
                return <MenuItem value={el}>{it(`category.${el}`)}</MenuItem>
              })
            }
          </TextField>
        </div>
        <div className='group'>
          <label htmlFor='reporter'>{f('incidentFields.reporter')}</label>
          <TextField
            id='reporter'
            name='reporter'
            variant='outlined'
            fullWidth
            size='small'
            required={this.checkRequiredField(incident.info.reporter)}
            error={this.checkErrorField('reporter', incident.info.reporter)}
            helperText={this.checkHelperText('reporter', incident.info.reporter)}
            value={incident.info.reporter}
            onChange={this.props.handleDataChangeMui}
            disabled={disabledStatus} />
        </div>
        <div className='group'>
          <label htmlFor='reporter'>{f('incidentFields.flowId')}</label>
          <TextField
            id='flowTemplateId'
            name='flowTemplateId'
            variant='outlined'
            fullWidth
            size='small'
            select
            required
            error={this.checkErrorField('flowTemplateId', incident.info.flowTemplateId)}
            helperText={this.checkHelperText('flowTemplateId', incident.info.flowTemplateId)}
            value={incident.info.flowTemplateId || ''}
            onChange={this.props.handleDataChangeMui}
            disabled={this.checkDisabledStatus()}>
            {socFlowList}
          </TextField>
        </div>
        <div className='group'>
          <label htmlFor='impactAssessment'>{f('incidentFields.impactAssessment')}</label>
          <TextField
            id='impactAssessment'
            name='impactAssessment'
            variant='outlined'
            fullWidth
            size='small'
            select
            required
            error={this.checkErrorField('impactAssessment', incident.info.impactAssessment)}
            helperText={this.checkHelperText('impactAssessment', incident.info.impactAssessment)}
            value={incident.info.impactAssessment || ''}
            onChange={this.props.handleDataChangeMui}
            disabled={true}>
            {
              _.map(_.range(1, 5), el => {
                return <MenuItem value={el}>{`${el} (${(9 - 2 * el)} ${it('txt-day')})`}</MenuItem>
              })
            }
          </TextField>
        </div>
        <div className='group severity-level' style={{width: '25vh', paddingTop: '27px'}}>
          <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[incident.info.severity]}} />
          <TextField
            id='severityLevel'
            name='severity'
            label={f('syslogPatternTableFields.severity')}
            variant='outlined'
            fullWidth
            size='small'
            select
            value={incident.info.severity || ''}
            onChange={this.props.handleDataChangeMui}
            disabled={disabledStatus}>
            {severityList}
          </TextField>
        </div>
        {from !== 'pattern' &&
          <div className='group' style={{width: '25vh', paddingLeft: '5%'}}>
            <label htmlFor='expireDttm'>{f('incidentFields.finalDate')}</label>
            <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
              <KeyboardDateTimePicker
                id='expireDttm'
                className='date-time-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD HH:mm'
                invalidDateMessage={t('txt-invalidDateMessage')}
                ampm={false}
                required={this.checkRequiredField(incident.info.expireDttm)}
                error={this.checkErrorField(incident.info.expireDttm)}
                helperText={this.checkHelperText(incident.info.expireDttm)}
                value={incident.info.expireDttm}
                onChange={this.props.handleDataChange.bind(this, 'expireDttm')}
                disabled={disabledStatus} />
            </MuiPickersUtilsProvider>
          </div>
        }
        {from !== 'pattern' &&
          <div className='group' style={{width: '25vh', paddingLeft: '5%'}}>
            <FormControlLabel
              label={f('incidentFields.establishDate')}
              control={
                <Checkbox
                  className='checkbox-ui'
                  checked={establishDttm}
                  onChange={this.props.toggleEstablishDateCheckbox}
                  color='primary' />
              }
              disabled={disabledStatus} />
            <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
              <KeyboardDateTimePicker
                id='establishDttm'
                className='date-time-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD HH:mm'
                invalidDateMessage={t('txt-invalidDateMessage')}
                ampm={false}
                required={false}
                error={this.checkErrorField(incident.info.establishDttm)}
                helperText={this.checkHelperText(incident.info.establishDttm)}
                value={incident.info.establishDttm}
                onChange={this.props.handleDataChange.bind(this, 'establishDttm')}
                disabled={disabledEstablishDttm} />
            </MuiPickersUtilsProvider>
          </div>
        }
        <div className='group full'>
          <label htmlFor='attackName'>{f('incidentFields.attackName')}</label>
          <TextField
            id='attackName'
            name='attackName'
            variant='outlined'
            fullWidth
            size='small'
            multiline
            rows={3}
            rowsMax={3}
            required={this.checkRequiredField(incident.info.attackName)}
            error={this.checkErrorField('attackName', incident.info.attackName)}
            helperText={this.checkHelperText('attackName', incident.info.attackName)}
            value={incident.info.attackName}
            onChange={this.props.handleDataChangeMui}
            disabled={disabledStatus} />
        </div>
        <div className='group full'>
          <label htmlFor='description'>{f('incidentFields.description')}</label>
          <TextField
            id='description'
            name='description'
            variant='outlined'
            fullWidth
            size='small'
            multiline
            rows={3}
            rowsMax={3}
            required={this.checkRequiredField(incident.info.description)}
            error={this.checkErrorField('description', incident.info.description)}
            helperText={this.checkHelperText('description', incident.info.description)}
            value={incident.info.description}
            onChange={this.props.handleDataChangeMui}
            disabled={disabledStatus} />
        </div>
        {incidentType === 'ttps' &&
          <div className='group full'>
            <label htmlFor='relatedList' style={{float: 'left', marginRight: '10px'}}>{f('incidentFields.relatedList')}</label>
            <Button variant='contained' color='primary' style={{marginTop: '-8px', marginBottom: '10px'}} onClick={this.props.toggleRelatedListModal} disabled={disabledStatus}>{t('txt-query')}</Button>
            <div className='flex-item'>{incident.info.showFontendRelatedList.map(this.showRelatedList)}</div>
          </div>
        }
      </div>
    )    
  }
  /**
   * Display notice section
   * @method
   * @returns HTML DOM
   */
  displayNotice = () => {
    const {from, activeContent, incidentAccidentList, incidentAccidentSubList, incident} = this.props;
    let disabledStatus = null;

    if (from === 'soc') {
      disabledStatus = activeContent === 'viewIncident' ? true : false;
    } else if (from === 'pattern') {
      disabledStatus = activeContent === 'viewPattern' ? true : false;
    }

    return (
      <div className={this.getClassName()} style={this.getStyle()}>
        <header>
          <div className='text'>{it('txt-accidentTitle')}</div>
        </header>

        <div className='group'>
          <label htmlFor='accidentCatogory'>{it('txt-accidentClassification')}</label>
          <TextField
            id='accidentCatogory'
            name='accidentCatogory'
            variant='outlined'
            fullWidth
            size='small'
            select
            value={incident.info.accidentCatogory}
            onChange={this.props.handleDataChangeMui}
            disabled={disabledStatus}>
            {incidentAccidentList}
          </TextField>
        </div>
        {incident.info.accidentCatogory === '5' &&
          <div className='group'>
            <label htmlFor='accidentAbnormal'>{it('txt-reason')}</label>
            <TextField
              id='accidentAbnormal'
              name='accidentAbnormal'
              variant='outlined'
              fullWidth
              size='small'
              value={incident.info.accidentAbnormalOther}
              onChange={this.props.handleDataChangeMui}
              disabled={disabledStatus} />
          </div>
        }
        {incident.info.accidentCatogory !== '5' &&
          <div className='group'>
            <label htmlFor='accidentAbnormal'>{it('txt-reason')}</label>
            <TextField
              id='accidentAbnormal'
              name='accidentAbnormal'
              select
              variant='outlined'
              fullWidth
              size='small'
              value={incident.info.accidentAbnormal}
              onChange={this.props.handleDataChangeMui}
              disabled={disabledStatus}>
              {incidentAccidentSubList[incident.info.accidentCatogory - 1]}
            </TextField>
          </div>
        }
        <div className='group full'>
          <label htmlFor='accidentDescription'>{it('txt-accidentDescr')}</label>
          <TextareaAutosize
            id='accidentDescription'
            name='accidentDescription'
            className={cx('textarea-autosize', {'disabled': disabledStatus})}
            rows={3}
            value={incident.info.accidentDescription}
            onChange={this.props.handleDataChangeMui}
            disabled={disabledStatus} />
        </div>
        <div className='group full'>
          <label htmlFor='accidentReason'>{it('txt-reasonDescr')}</label>
          <TextareaAutosize
            id='accidentReason'
            name='accidentReason'
            className={cx('textarea-autosize', {'disabled': disabledStatus})}
            rows={3}
            value={incident.info.accidentReason}
            onChange={this.props.handleDataChangeMui}
            disabled={disabledStatus} />
        </div>
        <div className='group full'>
          <label htmlFor='accidentInvestigation'>{it('txt-accidentInvestigation')}</label>
          <TextareaAutosize
            id='accidentInvestigation'
            name='accidentInvestigation'
            className={cx('textarea-autosize', {'disabled': disabledStatus})}
            rows={3}
            value={incident.info.accidentInvestigation}
            onChange={this.props.handleDataChangeMui}
            disabled={disabledStatus} />
        </div>
      </div>
    )
  }
  /**
   * Format file size to readable format
   * @method
   * @returns numbers to represent bytes
   */
  formatBytes = (bytes, decimals = 2) => {
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    if (bytes === 0 || bytes === '0') {
      return '0 Bytes';
    }

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  /**
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable or null
   */
  checkSortable = (field) => {
    const unSortableFields = ['description', '_menu', 'action', 'tag'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  /**
   * Handle attachment download
   * @method
   * @param {objet} allValue - data from table
   */
  downloadAttachment = (allValue) => {
    const {baseUrl, contextRoot} = this.context;
    const {incident} = this.props;
    const url = `${baseUrl}${contextRoot}/api/soc/attachment/_download?id=${incident.info.id}&fileName=${allValue.fileName}`;

    downloadLink(url);
  }
  /**
   * Handle all attachment download
   * @method
   */
  handleDownloadAll = () => {
    const {baseUrl, contextRoot} = this.context;
    const {incident} = this.props;
    const url = `${baseUrl}${contextRoot}/api/soc/attachment/_download/all?id=${incident.info.id}`

    downloadLink(url);
  }
  /**
   * Handle attachment delete
   * @method
   * param {objet} allValue - data from table
   */
  deleteAttachment = (allValue) => {
    const {baseUrl} = this.context;
    const {incident} = this.props;

    PopupDialog.prompt({
      title: t('txt-delete'),
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{t('txt-delete-msg')}: {allValue.fileName}?</span>
        </div>
      ),
      act: (confirmed, data) => {
        if (confirmed) {
          helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

          ah.one({
            url: `${baseUrl}/api/soc/attachment/_delete?id=${incident.info.id}&fileName=${allValue.fileName}`,
            type: 'DELETE'
          })
          .then(data => {
            if (data.ret === 0) {
              this.props.refreshIncidentAttach(incident.info.id);
            }
          })
          .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message);
          })
        }
      }
    });
  }
  /**
   * Display file upload content
   * @method
   * @param {string} type - page type ('page' or 'modal')
   * @returns HTML DOM
   */  
  commonUploadContent = (type) => {
    const {from, activeContent, incident, filesName} = this.props;
    let disabledStatus = false;

    if (from === 'soc') {
      disabledStatus = activeContent === 'viewIncident' ? true : false;
    } else if (from === 'pattern') {
      disabledStatus = activeContent === 'viewPattern' ? true : false;
    }

    return (
      <React.Fragment>
        <div className='group'>
          <div className='c-file-input clearable file-input' style={type === 'page' ? {width: '95%'} : null}>
            <input
              id='multiMalware'
              style={{width: 'calc(100% - 25px)'}}
              type='file'
              multiple
              onChange={this.props.handleFileChange}
              disabled={disabledStatus} />
            <button type='button' disabled={disabledStatus}>{t('txt-selectFile')}</button>
            <input
              className='long-name'
              type='text'
              value={filesName}
              readOnly />
            {filesName.length > 0 &&
              <i class='c-link inline fg fg-close' onClick={this.props.handleFileChange.bind(this, 'clear')}></i>
            }
          </div>
        </div>
        <div className='group'>
          <label htmlFor='fileMemo'>{it('txt-fileMemo')}</label>
          <TextareaAutosize
            id='fileMemo'
            name='fileMemo'
            className={cx('textarea-autosize', {'disabled': disabledStatus})}
            rows={2}
            value={incident.info.fileMemo}
            onChange={this.props.handleDataChangeMui} />
        </div>
      </React.Fragment>
    )
  }
  /**
   * Display file upload section
   * @method
   * @returns HTML DOM
   */
  displayAttached = () => {
    const {from, activeContent, incident, attach, filesName} = this.props;
    let dataFields = {};

    if (from === 'soc') {
      incident.fileFieldsArr.forEach(tempData => {
        dataFields[tempData] = {
          label: tempData === 'action' ? '' : f(`incidentFields.${tempData}`),
          sortable: this.checkSortable(tempData),
          formatter: (value, allValue, i) => {
            if (tempData === 'fileSize') {
              return <span>{this.formatBytes(value)}</span>
            } else if (tempData === 'fileDttm') {
              return <span>{moment(value).local().format('YYYY-MM-DD HH:mm:ss')}</span>
            } else if (tempData === 'fileMemo') {
              if (incident.info.attachmentDescription) {
                const target = _.find(JSON.parse(incident.info.attachmentDescription), {fileName: allValue.fileName});
                let formattedWording = '';

                if (target) {
                  if (target.fileMemo && target.fileMemo.length > 32) {
                    formattedWording = target.fileMemo.substr(0, 32) + '...';
                  } else {
                    formattedWording = target.fileMemo;
                  }
                }
                return <span style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>{formattedWording}</span>
              }
            } else if (tempData === 'action') {
              let isShow = true;

              if (incident.info.status === 3 || incident.info.status === 4) {
                if (moment(allValue.fileDttm).valueOf() < moment(incident.info.updateDttm).valueOf()) {
                  isShow = false;
                }
              }

              return (
                <div>
                  <i className='c-link fg fg-data-download' title={t('txt-download')} onClick={this.downloadAttachment.bind(this, allValue)} />
                  {isShow &&
                    <i className='c-link fg fg-trashcan' title={t('txt-delete')} onClick={this.deleteAttachment.bind(this, allValue)} />
                  }
                </div>
              )
            } else {
              return <span>{value}</span>
            }
          }
        }
      });

      incident.fileFields = dataFields;

      return (
        <div className='form-group normal'>
          <header>
            <div className='text'>{it('txt-attachedFile')}<span style={{color: 'red', fontSize: '0.8em', marginLeft: '5px'}}>{it('txt-attachedFileHint')}</span></div>
          </header>
          {activeContent === 'addIncident' &&
            this.commonUploadContent('page')
          }
          {(activeContent === 'viewIncident') &&
            <div className='group'>
              <Button variant='contained' color='primary' className='upload' style={{marginRight: '10px'}} onClick={this.props.toggleUploadAttachment}>{t('txt-upload')}</Button>
              {incident.info.attachmentDescription &&
                <Button variant='contained' color='primary' className='upload' style={{marginRight: '10px'}} onClick={this.handleDownloadAll}>{t('txt-downloadAll')}</Button>
              }
            </div>
          }
          {_.size(incident.info.fileList) > 0 &&
            <div className='group full'>
              <DataTable
                style={{width: '100%'}}
                className='main-table full'
                fields={incident.fileFields}
                data={incident.info.fileList} />
            </div>
          }
        </div>
      )
    } else if (from === 'threats' || from === 'pattern') {
      let className = 'form-group ';

      if (from === 'threats') {
        className += 'long';
      } else if (from === 'pattern') {
        className += 'normal';
      }

      return (
        <div className={className} style={this.getStyle()}>
          <header>
            <div className='text'>{it('txt-attachedFile')}<span style={{color: 'red', fontSize: '0.8em'}}>{it('txt-attachedFileHint')}</span></div>
          </header>
          {this.commonUploadContent()}
        </div>
      )
    }
  }
  /**
   * Display connect unit section
   * @method
   * @returns HTML DOM
   */
  displayConnectUnit = () => {
    const {from, activeContent, incident} = this.props;
    let disabledStatus = null;

    if (from === 'soc') {
      disabledStatus = activeContent === 'viewIncident' ? true : false;
    } else if (from === 'pattern') {
      disabledStatus = activeContent === 'viewPattern' ? true : false;
    } 

    return (
      <div className={this.getClassName()} style={this.getStyle()}>
        <header>
          <div className='text'>{it('txt-notifyUnit')}</div>
        </header>

        <div className='group full multi'>
          <MultiInput
            id='incidentEvent'
            className='incident-group'
            base={NotifyContact}
            defaultItemValue={{
              title: '',
              name: '',
              phone: '',
              email: ''
            }}
            value={incident.info.notifyList}
            props={{
              disabledStatus
            }}
            onChange={this.props.handleConnectContactChange}
            readOnly={disabledStatus} />
        </div>
      </div>
    )
  }
  /**
   * Display flow section
   * @method
   * @returns HTML DOM
   */
  displayFlow = () => {
    const {incident} = this.props;
    let dataFields = {};

    incident.flowFieldsArr.forEach(tempData => {
      dataFields[tempData] = {
        hide: tempData === 'id',
        label: tempData === '_menu' ? '' : f(`incidentFields.${tempData}`),
        sortable: this.checkSortable(tempData),
        formatter: (value, allValue, i) => {
          if (tempData === 'reviewDttm') {
            return <span>{moment(value).local().format('YYYY-MM-DD HH:mm:ss')}</span>
          } else if (tempData === 'status') {
            return <span>{it(`action.${value}`)}</span>
          } else {
            return <span style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>{value}</span>
          }
        }
      }
    });
    incident.flowFields = dataFields;

    return (
      <div className='form-group normal'>
        <header>
          <div className='text'>{it('txt-flowTitle')}</div>
        </header>

        <div className='group full'>
          <DataTable
            style={{width: '100%'}}
            className='main-table full'
            fields={incident.flowFields}
            data={incident.info.historyList} />
        </div>
      </div>
    )
  }
  /**
   * Display events section
   * @method
   * @returns HTML DOM
   */
  displayEvents = () => {
    const {locale} = this.context;
    const {from, incidentType, incidentFormType, activeContent, activeSteps, incident, deviceListOptions, showDeviceListOptions} = this.props;
    const now = new Date();
    const nowTime = moment(now).local().format('YYYY-MM-DD HH:mm:ss');
    let propsData = {};
    let disabledStatus = false;

    if (from === 'soc') {
      propsData = {
        incidentFormType,
        activeContent,
        disabledStatus: activeContent === 'viewIncident' ? true : false,
        locale,
        deviceListOptions,
        showDeviceListOptions
      };
    } else if (from === 'threats') {
      propsData = {
        incidentFormType,
        activeContent,
        disabledStatus,
        locale,
        deviceListOptions
      };
    } else if (from === 'pattern') {
      propsData = {
        incidentFormType,
        activeContent,
        disabledStatus: activeContent === 'viewPattern' ? true : false,
        locale,
        deviceListOptions
      };
    }

    return (
      <div className={this.getClassName()} style={this.getStyle()}>
        <header>
          <div className='text'>{it('txt-incident-events')}</div>
        </header>

        {from === 'soc' &&
          <div className='btn btn-group'>
            <Button className='left-btn' variant='contained' color='primary' onClick={this.props.handleIncidentPageChange.bind(this, 'main')}>{it('txt-prev-page')}</Button>
            <Button variant='contained' color='primary' onClick={this.props.handleIncidentPageChange.bind(this, 'ttps')} disabled={incidentType !== 'ttps'}>{it('txt-next-page')}</Button>
          </div>
        }

        {(from === 'threats' || from === 'pattern') &&
          <div className='btn btn-group'>
            <Button id='previousStep' variant='contained' color='primary' className='left-btn' onClick={this.props.toggleSteps.bind(this, 'previous')} disabled={activeSteps === 1}>{it('txt-prev-page')}</Button>
            <Button id='nextStep' variant='contained' color='primary' onClick={this.props.toggleSteps.bind(this, 'next')} disabled={activeSteps === 2}>{it('txt-next-page')}</Button>
          </div>
        }

        <div className='group full multi'>
          <MultiInput
            id='incidentEvent'
            className='incident-group'
            base={Events}
            defaultItemValue={{
              description: '',
              deviceId: '',
              time: {
                from: nowTime,
                to: nowTime
              },
              frequency: 1
            }}
            value={incident.info.eventList}
            props={propsData}
            onChange={this.props.handleEventsChange}
            readOnly={disabledStatus} />
        </div>
      </div>
    )
  }
  /**
   * Display TTP section
   * @method
   * @returns HTML DOM
   */
  displayTTP = () => {
    const {from, activeContent, incident} = this.props;
    let disabledStatus = null;

    if (from === 'soc') {
      disabledStatus = activeContent === 'viewIncident' ? true : false;
    } else if (from === 'pattern') {
      disabledStatus = activeContent === 'viewPattern' ? true : false;
    }

    return (
      <div className='form-group normal'>
        <header>
          <div className='text'>{it('txt-incident-ttps')} ({it('txt-ttp-obs-file')}/{it('txt-ttp-obs-uri')}/{it('txt-ttp-obs-socket')} {it('txt-mustOne')})
          </div>
        </header>

        <div className='btn btn-group'>
          <Button className='left-btn' variant='contained' color='primary' onClick={this.props.handleIncidentPageChange.bind(this, 'events')}>{it('txt-prev-page')}</Button>
          <Button variant='contained' color='primary' onClick={this.props.handleIncidentPageChange.bind(this, 'events')} disabled={true}>{it('txt-next-page')}</Button>
        </div>

        <div className='group full multi'>
          <MultiInput
            id='incidentTtp'
            className='incident-group'
            base={Ttps}
            value={incident.info.ttpList}
            props={{
              activeContent,
              disabledStatus
            }}
            onChange={this.props.handleTtpsChange}
            readOnly={disabledStatus} />
        </div>
      </div>
    )
  }
  render() {
    const {from, displayPage, activeContent, activeSteps} = this.props;

    return (
      <React.Fragment>
        {from === 'soc' &&
          <div>
            {displayPage === 'main' &&
              this.displayMain()
            }

            {_.includes(['addIncident', 'editIncident', 'viewIncident'], activeContent) && displayPage === 'main' &&
              this.displayNotice()
            }

            {_.includes(['addIncident', 'editIncident', 'viewIncident'], activeContent) && displayPage === 'main' &&
              this.displayAttached()
            }

            {_.includes(['addIncident', 'editIncident', 'viewIncident'], activeContent) && displayPage === 'main' &&
              this.displayConnectUnit()
            }

            {activeContent !== 'addIncident' &&  displayPage === 'main' &&
              this.displayFlow()
            }

            {displayPage === 'events' &&
              this.displayEvents()
            }

            {displayPage === 'ttps' &&
              this.displayTTP()
            }
          </div>
        }

        {(from === 'threats' || from === 'pattern') && 
          <div>
            {activeSteps === 1 &&
              this.displayMain()
            }

            {activeSteps === 1 &&
              this.displayNotice()
            }

            {activeSteps === 1 && from === 'threats' &&
              this.displayAttached()
            }

            {activeSteps === 1 && from === 'threats' &&
              this.displayConnectUnit()
            }

            {activeSteps === 2 && from === 'threats' &&
              this.displayEvents()
            }
          </div>
        }
      </React.Fragment>
    )
  }
}

IncidentForm.contextType = BaseDataContext;
IncidentForm.propTypes = {
  from: PropTypes.string.isRequired,
  activeContent: PropTypes.string,
  activeSteps: PropTypes.number,
  displayPage: PropTypes.string,
  incident: PropTypes.object.isRequired,
  severityList: PropTypes.array.isRequired,
  incidentType: PropTypes.string,
  incidentFormType: PropTypes.string,
  socFlowList: PropTypes.array.isRequired,
  attach: PropTypes.array,
  filesName: PropTypes.array.isRequired,
  requiredField: PropTypes.array,
  deviceListOptions: PropTypes.array.isRequired,
  showDeviceListOptions: PropTypes.array,
  incidentAccidentList: PropTypes.array.isRequired,
  incidentAccidentSubList: PropTypes.array.isRequired,
  enableEstablishDttm: PropTypes.string,
  handleDataChange: PropTypes.func.isRequired,
  handleDataChangeMui: PropTypes.func.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  toggleUploadAttachment: PropTypes.func,
  handleConnectContactChange: PropTypes.func.isRequired,
  handleIncidentPageChange: PropTypes.func,
  handleEventsChange: PropTypes.func.isRequired,
  handleTtpsChange: PropTypes.func,
  toggleRelatedListModal: PropTypes.func,
  refreshIncidentAttach: PropTypes.func,
  toggleEstablishDateCheckbox: PropTypes.func.isRequired,
  toggleSteps: PropTypes.func
};

export default IncidentForm;