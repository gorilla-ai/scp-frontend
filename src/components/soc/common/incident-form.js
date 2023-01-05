import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'

import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import DataTable from 'react-ui/build/src/components/table'
import {downloadLink, downloadWithForm} from 'react-ui/build/src/utils/download'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'

import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

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
    super(props)

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

    if (from === 'soc') {
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
    if (this.props.from === 'threats') {
      return { width: '85%' };
    }
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
    const {showSteps} = this.state;
    let establishDttm = '';
    let disabledEstablishDttm = '';
    let dateLocale = locale;

    if (from === 'soc') {
      establishDttm = incident.info.enableEstablishDttm;
      disabledEstablishDttm = (activeContent === 'viewIncident' || !incident.info.enableEstablishDttm);
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
          {activeContent && activeContent !== 'addIncident' &&
            <span className='msg'>{f('incidentFields.updateDttm')}{helper.getFormattedDate(incident.info.updateDttm, 'local')}</span>
          }
        </header>

        {from === 'soc' &&
          <React.Fragment>
            <Button className='last-left' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.props.handleIncidentPageChange.bind(this, 'main')} disabled={true}>{it('txt-prev-page')}</Button>
            <Button className='last' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.props.handleIncidentPageChange.bind(this, 'events')}>{it('txt-next-page')}</Button>
          </React.Fragment>  
        }

        {from === 'threats' &&
          <React.Fragment>
            <Button id='previousStep' className='last-left' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.props.toggleSteps.bind(this, 'previous')} disabled={activeSteps === 1}>{it('txt-prev-page')}</Button>
            <Button id='nextStep' className='last' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.props.toggleSteps.bind(this, 'next')} disabled={activeSteps === 2}>{it('txt-next-page')}</Button>
          </React.Fragment>
        }

        <div className='group full'>
          <label htmlFor='title'>{f('incidentFields.title')}</label>
          <TextField
            id='title'
            name='title'
            variant='outlined'
            fullWidth={true}
            size='small'
            onChange={this.props.handleDataChangeMui}
            value={incident.info.title}
            helperText={it('txt-required')}
            required
            error={!(incident.info.title || '')}
            disabled={activeContent === 'viewIncident'} />
        </div>
        <div className='group full'>
          <label htmlFor='incidentDescription'>{f('incidentFields.incidentDescription')}</label>
          <TextField
            id='incidentDescription'
            onChange={this.props.handleDataChangeMui}
            required
            variant='outlined'
            fullWidth={true}
            size='small'
            multiline
            rows={3}
            rowsMax={3}
            helperText={it('txt-required')}
            name='incidentDescription'
            error={!(incident.info.incidentDescription || '')}
            value={incident.info.incidentDescription}
            disabled={activeContent === 'viewIncident'} />
        </div>
        <div className='group'>
          <label htmlFor='category'>{f('incidentFields.category')}</label>
          {activeContent === 'viewIncident' &&
            <TextField
              id='category'
              name='category'
              variant='outlined'
              fullWidth={true}
              size='small'
              select
              value={incident.info.category}
              disabled={true}>
              {
                _.map(_.range(0, 20), el => {
                  return <MenuItem value={el}>{it(`category.${el}`)}</MenuItem>
                })
              }
            </TextField>
          }
          {activeContent !== 'viewIncident' &&
            <TextField
              id='category'
              name='category'
              variant='outlined'
              fullWidth={true}
              size='small'
              onChange={this.props.handleDataChangeMui}
              helperText={it('txt-required')}
              required
              select
              value={incident.info.category}
              error={!(incident.info.category || '')}
              disabled={activeContent === 'viewIncident'}>
              {
                _.map(_.range(10, 20), el => {
                  return <MenuItem value={el}>{it(`category.${el}`)}</MenuItem>
                })
              }
            </TextField>
          }
        </div>
        <div className='group'>
          <label htmlFor='reporter'>{f('incidentFields.reporter')}</label>
          <TextField
            id='reporter'
            name='reporter'
            variant='outlined'
            fullWidth={true}
            size='small'
            onChange={this.props.handleDataChangeMui}
            required
            helperText={it('txt-required')}
            error={!(incident.info.reporter || '')}
            value={incident.info.reporter}
            disabled={activeContent === 'viewIncident'} />
        </div>
        <div className='group'>
          <label htmlFor='reporter'>{f('incidentFields.flowId')}</label>
          <TextField
            id='flowTemplateId'
            name='flowTemplateId'
            select
            required
            fullWidth={true}
            variant='outlined'
            size='small'
            onChange={this.props.handleDataChangeMui}
            value={incident.info.flowTemplateId}
            disabled={activeContent === 'viewIncident' || activeContent === 'editIncident'}>
            {socFlowList}
          </TextField>
        </div>
        <div className='group'>
          <label htmlFor='impactAssessment'>{f('incidentFields.impactAssessment')}</label>
          <TextField
            id='impactAssessment'
            variant='outlined'
            fullWidth={true}
            size='small'
            select
            name='impactAssessment'
            onChange={this.props.handleDataChangeMui}
            required
            helperText={it('txt-required')}
            value={incident.info.impactAssessment}
            error={!(incident.info.impactAssessment || '')}
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
            select
            fullWidth={true}
            label={f('syslogPatternTableFields.severity')}
            variant='outlined'
            size='small'
            onChange={this.props.handleDataChangeMui}
            value={incident.info.severity}
            disabled={activeContent === 'viewIncident'}>
            {severityList}
          </TextField>
        </div>
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
              required
              helperText={it('txt-required')}
              value={incident.info.expireDttm}
              disabled={activeContent === 'viewIncident'}
              onChange={this.props.handleDataChange.bind(this, 'expireDttm')} />
          </MuiPickersUtilsProvider>
        </div>
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
            disabled={activeContent === 'viewIncident'} />
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
              value={incident.info.establishDttm}
              disabled={disabledEstablishDttm}
              onChange={this.props.handleDataChange.bind(this, 'establishDttm')} />
          </MuiPickersUtilsProvider>
        </div>
        <div className='group full'>
          <label htmlFor='attackName'>{f('incidentFields.attackName')}</label>
          <TextField
            id='attackName'
            onChange={this.props.handleDataChangeMui}
            required
            variant='outlined'
            fullWidth={true}
            size='small'
            multiline
            rows={3}
            rowsMax={3}
            helperText={it('txt-required')}
            name='attackName'
            error={!(incident.info.attackName || '')}
            value={incident.info.attackName}
            disabled={activeContent === 'viewIncident'} />
        </div>
        <div className='group full'>
          <label htmlFor='description'>{f('incidentFields.description')}</label>
          <TextField
            id='description'
            onChange={this.props.handleDataChangeMui}
            required
            variant='outlined'
            fullWidth={true}
            size='small'
            multiline
            rows={3}
            rowsMax={3}
            helperText={it('txt-required')}
            name='description'
            error={!(incident.info.description || '')}
            value={incident.info.description}
            disabled={activeContent === 'viewIncident'} />
        </div>
        {incidentType === 'ttps' &&
          <div className='group full'>
            <label htmlFor='relatedList' style={{float: 'left', marginRight: '10px'}}>{f('incidentFields.relatedList')}</label>
            <Button variant='contained' color='primary' style={{marginTop: '-8px', marginBottom: '10px'}} onClick={this.props.toggleRelatedListModal} disabled={activeContent === 'viewIncident'}>{t('txt-query')}</Button>
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
    const {activeContent, incidentAccidentList, incidentAccidentSubList, incidentType, incident} = this.props;

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
            select
            variant='outlined'
            fullWidth={true}
            size='small'
            onChange={this.props.handleDataChangeMui}
            value={incident.info.accidentCatogory}
            disabled={activeContent === 'viewIncident'}>
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
              fullWidth={true}
              size='small'
              onChange={this.props.handleDataChangeMui}
              value={incident.info.accidentAbnormalOther}
              disabled={activeContent === 'viewIncident'} />
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
              fullWidth={true}
              size='small'
              onChange={this.props.handleDataChangeMui}
              value={incident.info.accidentAbnormal}
              disabled={activeContent === 'viewIncident'}>
              {incidentAccidentSubList[incident.info.accidentCatogory - 1]}
            </TextField>
          </div>
        }
        <div className='group full'>
          <label htmlFor='accidentDescription'>{it('txt-accidentDescr')}</label>
          <TextareaAutosize
            id='accidentDescription'
            name='accidentDescription'
            className='textarea-autosize'
            onChange={this.props.handleDataChangeMui}
            value={incident.info.accidentDescription}
            rows={3}
            disabled={activeContent === 'viewIncident'} />
        </div>
        <div className='group full'>
          <label htmlFor='accidentReason'>{it('txt-reasonDescr')}</label>
          <TextareaAutosize
            id='accidentReason'
            name='accidentReason'
            className='textarea-autosize'
            onChange={this.props.handleDataChangeMui}
            value={incident.info.accidentReason}
            rows={3}
            disabled={activeContent === 'viewIncident'} />
        </div>
        <div className='group full'>
          <label htmlFor='accidentInvestigation'>{it('txt-accidentInvestigation')}</label>
          <TextareaAutosize
            id='accidentInvestigation'
            name='accidentInvestigation'
            className='textarea-autosize'
            onChange={this.props.handleDataChangeMui}
            value={incident.info.accidentInvestigation}
            rows={3}
            disabled={activeContent === 'viewIncident'} />
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
    let {incident} = this.state;

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
    const {incident, filesName} = this.props;

    return (
      <React.Fragment>
        <div className='group'>
          <div className='c-file-input clearable file-input' style={type === 'page' ? {width: '95%'} : null}>
            <input type='file' id='multiMalware' style={{width: 'calc(100% - 25px)'}} multiple onChange={this.props.handleFileChange} />
            <button type='button'>{t('txt-selectFile')}</button>
            <input type='text' className='long-name' readOnly value={filesName} />
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
            className='textarea-autosize'
            onChange={this.props.handleDataChangeMui}
            value={incident.info.fileMemo}
            rows={2} />
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
    const {from, activeContent, incidentType, incident, attach, filesName} = this.props;
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
          {activeContent !== 'addIncident' &&
            <div className='group'>
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
    } else if (from === 'threats') {
      return (
        <div className='form-group long' style={{width: '85%'}}>
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
    const {activeContent, incident} = this.props;

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
              activeContent
            }}
            onChange={this.props.handleConnectContactChange}
            readOnly={activeContent === 'viewIncident'} />
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
    const {activeContent, incidentType, incident} = this.props;
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
    const {from, incidentType, activeContent, activeSteps, incident, deviceListOptions, showDeviceListOptions} = this.props;
    const now = new Date();
    const nowTime = moment(now).local().format('YYYY-MM-DD HH:mm:ss');
    let propsData = {};

    if (from === 'soc') {
      propsData = {
        activeContent,
        locale,
        deviceListOptions,
        showDeviceListOptions
      };
    } else if (from === 'threats') {
      propsData = {
        activeContent,
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
          <React.Fragment>
            <Button className='last-left' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.props.handleIncidentPageChange.bind(this, 'main')}>{it('txt-prev-page')}</Button>
            <Button className='last' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.props.handleIncidentPageChange.bind(this, 'ttps')} disabled={incidentType !== 'ttps'}>{it('txt-next-page')}</Button>
          </React.Fragment>  
        }

        {from === 'threats' &&
          <React.Fragment>
            <Button id='previousStep' className='last-left' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.props.toggleSteps.bind(this, 'previous')} disabled={activeSteps === 1}>{it('txt-prev-page')}</Button>
            <Button id='nextStep' className='last' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.props.toggleSteps.bind(this, 'next')} disabled={activeSteps === 2}>{it('txt-next-page')}</Button>
          </React.Fragment>
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
            readOnly={activeContent === 'viewIncident'} />
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
    const {activeContent, incident} = this.props;

    return (
      <div className='form-group normal'>
        <header>
          <div className='text'>{it('txt-incident-ttps')} ({it('txt-ttp-obs-file')}/{it('txt-ttp-obs-uri')}/{it('txt-ttp-obs-socket')} {it('txt-mustOne')})
          </div>
        </header>

        <Button className='last-left' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.props.handleIncidentPageChange.bind(this, 'events')}>{it('txt-prev-page')}</Button>

        <Button className='last' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.props.handleIncidentPageChange.bind(this, 'events')} disabled={true}>{it('txt-next-page')}</Button>

        <div className='group full multi'>
          <MultiInput
            id='incidentTtp'
            className='incident-group'
            base={Ttps}
            value={incident.info.ttpList}
            props={{
              activeContent
            }}
            onChange={this.props.handleTtpsChange}
            readOnly={activeContent === 'viewIncident'} />
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

        {from === 'threats' &&
          <div>
            {activeSteps === 1 &&
              this.displayMain()
            }

            {activeSteps === 1 &&
              this.displayNotice()
            }

            {activeSteps === 1 &&
              this.displayAttached()
            }

            {activeSteps === 1 &&
              this.displayConnectUnit()
            }

            {activeSteps === 2 &&
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
  incidentType: PropTypes.string.isRequired,
  socFlowList: PropTypes.array.isRequired,
  attach: PropTypes.array.isRequired,
  filesName: PropTypes.array.isRequired,
  deviceListOptions: PropTypes.array.isRequired,
  showDeviceListOptions: PropTypes.array,
  incidentAccidentList: PropTypes.array.isRequired,
  incidentAccidentSubList: PropTypes.array.isRequired,
  enableEstablishDttm: PropTypes.string,
  handleDataChange: PropTypes.func.isRequired,
  handleDataChangeMui: PropTypes.func.isRequired,
  handleFileChange: PropTypes.func.isRequired,
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