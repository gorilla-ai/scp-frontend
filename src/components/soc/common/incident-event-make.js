import React, {Component} from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'
import queryString from 'query-string'

import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import DataTable from 'react-ui/build/src/components/table'
import FileInput from 'react-ui/build/src/components/file-input'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'
import Events from '../common/events'
import NotifyContact from '../common/notifyContact'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;
let it = null;
let at = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};

class IncidentEventMake extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');
    at = global.chewbaccaI18n.getFixedT(null, 'account');

    this.state = {
      INCIDENT_ACCIDENT_LIST: _.map(_.range(1, 6), el => {
        return <MenuItem id={`accident.${el}`} value={el}>{it(`accident.${el}`)}</MenuItem>
      }),
      INCIDENT_ACCIDENT_SUB_LIST: [
        _.map(_.range(11, 17), el => {
          return <MenuItem id={`accident.${el}`} value={el}>{it(`accident.${el}`)}</MenuItem>
        }),
        _.map(_.range(21, 26), el => {
          return <MenuItem id={`accident.${el}`} value={el}>{it(`accident.${el}`)}</MenuItem>
        }),
        _.map(_.range(31, 33), el => {
          return <MenuItem id={`accident.${el}`} value={el}>{it(`accident.${el}`)}</MenuItem>
        }),
        _.map(_.range(41, 45), el => {
          return <MenuItem id={`accident.${el}`} value={el}>{it(`accident.${el}`)}</MenuItem>
        })
      ],
      activeContent: 'addIncident', //tableList, viewIncident, editIncident, addIncident
      displayPage: 'main', /* main, events, ttps */
      incidentType: '',
      toggleType: '',
      showFilter: false,
      showChart: true,
      currentIncident: {},
      originalIncident: {},
      severityList: [],
      deviceListOptions: [],
      incident: {
        dataFieldsArr: ['_menu', 'id', 'tag', 'status', 'createDttm', 'title', 'reporter', 'srcIPListString', 'dstIPListString'],
        fileFieldsArr: ['fileName', 'fileSize', 'fileDttm', 'fileMemo', 'action'],
        flowFieldsArr: ['id', 'status', 'reviewDttm', 'reviewerName', 'suggestion'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'createDttm',
          desc: true
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        info: {
          status: 1,
          socType: 1
        }
      },
      attach: null,
      contextAnchor: null,
      currentData: {},
      activeSteps: 1
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
  }
  handleOpenMenu = (data, event) => {
    this.setState({
      contextAnchor: event.currentTarget,
      currentData: data
    });
  }
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null,
      currentData: {}
    });
  }
  toggleSteps = (type) => {
    const { activeSteps, formValidation} = this.state;
    let tempActiveSteps = activeSteps;
    let tempFormValidation = {...formValidation};

    if (type === 'previous') {
      tempActiveSteps--;

      this.setState({
        activeSteps: tempActiveSteps
      });
    } else if (type === 'next') {
      if (activeSteps === 1) {
        let validate = true;

        this.setState({
          formValidation: tempFormValidation
        });

        if (!validate) {
          return;
        }

        tempActiveSteps++;

        this.setState({
          activeSteps: tempActiveSteps
        });
      }
    }
  }
  displayEditContent = () => {
    const {session} = this.context
    const {activeSteps} = this.state;

    return (
      <div className='main-content basic-form'>
        <div className='auto-settings' style={{width: '100vh'}}>
          {activeSteps === 1 &&
            this.displayMainPage()
          }

          {activeSteps === 1 &&
            this.displayNoticePage()
          }

          {activeSteps === 1 &&
            this.displayAttached()
          }

          {activeSteps === 1 &&
            this.displayConnectUnit()
          }

          {activeSteps === 2 &&
            this.displayEventsPage()
          }
        </div>
      </div>
    )
  }
  displayMainPage = () => {
    const {remoteIncident, socFlowList, enableEstablishDttm} = this.props;
    const {incidentType, severityList} = this.state;
    const {locale} = this.context;
    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <div className='form-group long' style={{width: '85%'}}>
        <header>
          <div className='text'>{t('edge-management.txt-basicInfo')}</div>
        </header>

        <Button id='previousStep' className='last-left' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.toggleSteps.bind(this, 'previous')} disabled={this.state.activeSteps === 1}>{it('txt-prev-page')}</Button>

        <Button id='nextStep' className='last' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.toggleSteps.bind(this, 'next')} disabled={this.state.activeSteps === 2}>{it('txt-next-page')}</Button>

        <div className='group full'>
          <label htmlFor='title'>{f('incidentFields.title')}</label>
          <TextField
            id='title'
            name='title'
            variant='outlined'
            fullWidth={true}
            size='small'
            onChange={this.handleDataChangeMui}
            value={remoteIncident.info.title}
            helperText={it('txt-required')}
            required
            error={!(remoteIncident.info.title || '')} />
        </div>
        <div className='group full'>
          <label htmlFor='incidentDescription'>{f('incidentFields.incidentDescription')}</label>
          <TextField
            id='incidentDescription'
            onChange={this.handleDataChangeMui}
            required
            variant='outlined'
            fullWidth={true}
            size='small'
            multiline
            rows={3}
            rowsMax={3}
            helperText={it('txt-required')}
            name='incidentDescription'
            error={!(remoteIncident.info.incidentDescription || '')}
            value={remoteIncident.info.incidentDescription} />
        </div>
        <div className='group'>
          <label htmlFor='category'>{f('incidentFields.category')}</label>
          <TextField
            id='category'
            name='category'
            variant='outlined'
            fullWidth={true}
            size='small'
            onChange={this.handleDataChangeMui}
            helperText={it('txt-required')}
            required
            select
            value={remoteIncident.info.category}
            error={!(remoteIncident.info.category || '')}>
            {_.map(_.range(1, 9), el => {
              return <MenuItem id={`category.${el}`} value={el}>{it(`category.${el}`)}</MenuItem>
            })}
          </TextField>
        </div>
        <div className='group'>
          <label htmlFor='reporter'>{f('incidentFields.reporter')}</label>
          <TextField
            id='reporter'
            name='reporter'
            variant='outlined'
            fullWidth={true}
            size='small'
            onChange={this.handleDataChangeMui}
            required
            helperText={it('txt-required')}
            error={!(remoteIncident.info.reporter || '')}
            value={remoteIncident.info.reporter} />
        </div>
        <div className='group'>
          <label htmlFor='flowTemplateId'>{f('incidentFields.flowId')}</label>
          <TextField
            id='flowTemplateId'
            name='flowTemplateId'
            select
            required
            fullWidth={true}
            variant='outlined'
            size='small'
            onChange={this.handleDataChangeMui}
            value={remoteIncident.info.flowTemplateId}>
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
            onChange={this.handleDataChangeMui}
            required
            helperText={it('txt-required')}
            value={remoteIncident.info.impactAssessment}
            error={!(remoteIncident.info.impactAssessment || '')}
            disabled={true}>
            {
              _.map(_.range(1, 5), el => {
                return <MenuItem id={`day.${el}`} value={el}>{`${el} (${(9 - 2 * el)} ${it('txt-day')})`}</MenuItem>
              })
            }
          </TextField>
        </div>

        <div className='group severity-level' style={{width: '96.4%'}}>
          <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[remoteIncident.info.severity]}}/>
          <TextField
            id='severityLevel'
            name='severity'
            select
            fullWidth={true}
            label={f('syslogPatternTableFields.severity')}
            variant='outlined'
            size='small'
            onChange={this.handleDataChangeMui}
            value={remoteIncident.info.severity}
            disabled={true}>
            {severityList}
          </TextField>
        </div>

        <div className='group'>
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
              value={remoteIncident.info.expireDttm}
              onChange={this.handleDataChange.bind(this, 'expireDttm')}/>
          </MuiPickersUtilsProvider>
        </div>

        <div className='group'>
          <FormControlLabel
            label={f('incidentFields.establishDate')}
            style={{width: '20%'}}
            control={
              <Checkbox
                className='checkbox-ui'
                checked={enableEstablishDttm}
                onChange={this.props.toggleEstablishDateCheckbox}
                color='primary' />
            } />
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
              value={remoteIncident.info.establishDttm}
              disabled={!enableEstablishDttm}
              onChange={this.handleDataChange.bind(this, 'establishDttm')} />
          </MuiPickersUtilsProvider>
        </div>

        <div className='group full'>
          <label htmlFor='attackName'>{f('incidentFields.attackName')}</label>
          <TextField
            id='attackName'
            onChange={this.handleDataChangeMui}
            required
            variant='outlined'
            fullWidth={true}
            size='small'
            multiline
            rows={3}
            rowsMax={3}
            helperText={it('txt-required')}
            name='attackName'
            error={!(remoteIncident.info.attackName || '')}
            value={remoteIncident.info.attackName} />
        </div>

        <div className='group full'>
          <label htmlFor='description'>{f('incidentFields.description')}</label>
          <TextField
            id='description'
            onChange={this.handleDataChangeMui}
            required
            variant='outlined'
            fullWidth={true}
            size='small'
            multiline
            rows={4}
            rowsMax={5}
            helperText={it('txt-required')}
            name='description'
            error={!(remoteIncident.info.description || '')}
            value={remoteIncident.info.description}/>
        </div>
      </div>
    )
  }
  formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0 || bytes === '0') {
      return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  getErrorMsg = (code, params) => {
    if (params.code === 'file-too-large') {
      return it('file-too-large')
    }
  }
  uploadAttachmentModal = () => {
    PopupDialog.prompt({
      title: t('txt-upload'),
      confirmText: t('txt-confirm'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='c-form content'>
          <div>
            <FileInput
              id='attach'
              name='file'
              validate={{
                max: 20,
                t: this.getErrorMsg
              }}
              onChange={this.handleAFChange}
              btnText={t('txt-selectFile')} />
          </div>
          <div>
            <label>{it('txt-fileMemo')}</label>
            <TextareaAutosize
              id='comment'
              className='textarea-autosize'
              rows={3} />
          </div>
        </div>
      ),
      act: (confirmed, data) => {
        if (confirmed) {
          let flag = new RegExp("[\`~!@#$^&*()=|{}':;',\\[\\]<>+《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")

          if (flag.test(data.file.name)) {
          } else {
            this.uploadAttachmentByModal(data.file, data.comment);
          }
        }
      }
    })
  }
  displayAttached = () => {
    const {remoteIncident} = this.props;

    return (
      <div className='form-group long' style={{width: '85%'}}>
        <header>
          <div className='text'>{it('txt-attachedFile')}<span style={{color: 'red', fontSize: '0.8em'}}>{it('txt-attachedFileHint')}</span></div>
        </header>

        <div className='group'>
          <FileInput
            id='attach'
            name='file'
            className='file-input'
            validate={{
              max: 20,
              t: this.getErrorMsg
            }}
            onChange={this.handleAttachChange}
            btnText={t('txt-selectFile')} />
        </div>
        <div className='group'>
          <label htmlFor='fileMemo'>{it('txt-fileMemo')}</label>
          <TextareaAutosize
            id='fileMemo'
            name='fileMemo'
            className='textarea-autosize'
            onChange={this.handleDataChangeMui}
            value={remoteIncident.info.fileMemo}
            rows={2} />
        </div>
      </div>
    )
  }
  displayNoticePage = () => {
    const {INCIDENT_ACCIDENT_LIST, INCIDENT_ACCIDENT_SUB_LIST} = this.state;
    const {remoteIncident} = this.props;

    return (
      <div className='form-group long' style={{width: '85%'}}>
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
            onChange={this.handleDataChangeMui}
            value={remoteIncident.info.accidentCatogory}>
            {INCIDENT_ACCIDENT_LIST}
          </TextField>
        </div>

        {remoteIncident.info.accidentCatogory === '5' &&
          <div className='group'>
            <label htmlFor='accidentAbnormal'>{it('txt-reason')}</label>
            <TextField
              id='accidentAbnormal'
              name='accidentAbnormal'
              variant='outlined'
              fullWidth={true}
              size='small'
              onChange={this.handleDataChangeMui}
              value={remoteIncident.info.accidentAbnormalOther} />
          </div>
        }

        {remoteIncident.info.accidentCatogory !== '5' &&
          <div className='group'>
            <label htmlFor='accidentAbnormal'>{it('txt-reason')}</label>
            <TextField
              id='accidentAbnormal'
              name='accidentAbnormal'
              select
              variant='outlined'
              fullWidth={true}
              size='small'
              onChange={this.handleDataChangeMui}
              value={remoteIncident.info.accidentAbnormal}>
              {INCIDENT_ACCIDENT_SUB_LIST[remoteIncident.info.accidentCatogory - 1]}
            </TextField>
          </div>
        }

        <div className='group full'>
          <label htmlFor='accidentDescription'>{it('txt-accidentDescr')}</label>
          <TextareaAutosize
            id='accidentDescription'
            name='accidentDescription'
            className='textarea-autosize'
            onChange={this.handleDataChangeMui}
            value={remoteIncident.info.accidentDescription}
            rows={3} />
        </div>
        <div className='group full'>
          <label htmlFor='accidentReason'>{it('txt-reasonDescr')}</label>
          <TextareaAutosize
            id='accidentReason'
            name='accidentReason'
            className='textarea-autosize'
            onChange={this.handleDataChangeMui}
            value={remoteIncident.info.accidentReason}
            rows={3} />
        </div>
        <div className='group full'>
          <label htmlFor='accidentInvestigation'>{it('txt-accidentInvestigation')}</label>
          <TextareaAutosize
            id='accidentInvestigation'
            name='accidentInvestigation'
            className='textarea-autosize'
            onChange={this.handleDataChangeMui}
            value={remoteIncident.info.accidentInvestigation}
            rows={3} />
        </div>
      </div>
    )
  }
  displayConnectUnit = () => {
    const {activeContent} = this.state;
    const {remoteIncident} = this.props;

    return (
      <div className='form-group long' style={{width: '85%'}}>
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
            value={remoteIncident.info.notifyList}
            props={{
              activeContent: activeContent
            }}
            onChange={this.handleConnectContactChange} />
        </div>
      </div>
    )
  }
  displayEventsPage = () => {
    const {incidentType, activeContent, incident, deviceListOptions} = this.state;
    const {remoteIncident} = this.props;
    const {locale} = this.context;

    const now = new Date();
    const nowTime = moment(now).local().format('YYYY-MM-DD HH:mm:ss');

    return (
      <div className='form-group long' style={{width: '85%'}}>
        <header>
          <div className='text'>{it('txt-incident-events')}</div>
        </header>

        <Button id='previousStep' className='last-left' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.toggleSteps.bind(this, 'previous')} disabled={this.state.activeSteps === 1}>{it('txt-prev-page')}</Button>

        <Button id='nextStep' className='last' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.toggleSteps.bind(this, 'next')} disabled={this.state.activeSteps === 2}>{it('txt-next-page')}</Button>

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
            value={remoteIncident.info.eventList}
            props={{
              activeContent: activeContent,
              locale: locale,
              deviceListOptions: deviceListOptions
            }}
            onChange={this.handleEventsChange} />
        </div>
      </div>
    )
  }
  handleDataChange = (type, value) => {
    this.props.handleDataChange(type, value);
  }
  handleDataChangeMui = (event) => {
    this.props.handleDataChangeMui(event);
  }
  handleEventsChange = (val) => {
    this.props.handleEventsChange(val);
  }
  handleConnectContactChange = (val) => {
    this.props.handleConnectContactChange(val);
  }
  handleAttachChange = (val) => {
    this.props.handleAttachChange(val);
  }
  render() {
    return (
      <div className='data-content'>
        <div className='parent-content'>
          {this.displayEditContent()}
        </div>
      </div>
    )
  }  
}

IncidentEventMake.contextType = BaseDataContext;

IncidentEventMake.propTypes = {
  remoteIncident: PropTypes.string.isRequired,
  socFlowList: PropTypes.array.isRequired,
  handleDataChange: PropTypes.func.isRequired,
  handleDataChangeMui: PropTypes.func.isRequired,
  handleEventsChange: PropTypes.func.isRequired,
  handleConnectContactChange: PropTypes.func.isRequired,
  handleAttachChange: PropTypes.func.isRequired,
  handleAFChange: PropTypes.func.isRequired,
  toggleEstablishDateCheckbox: PropTypes.func.isRequired
};

export default IncidentEventMake;