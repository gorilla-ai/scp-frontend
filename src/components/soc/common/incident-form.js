import React, { Component } from 'react'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

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

class IncidentForm extends Component {
  constructor(props) {
    super(props)

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');
    at = global.chewbaccaI18n.getFixedT(null, 'account');

    this.state = {
      showSteps: 'main', //'main' or 'events'
    };
  }
  componentDidMount() {

  }
  ryan = () => {}
  /**
   * Toggle steps
   * @method
   * @param {string} step - step to show ('main' or 'events')
   */
  toggleSteps = (step) => {
    this.setState({
      showSteps: step
    });
  }
  showRelatedList = (val, i) => {
    return <span key={i} className='item'>{val}</span>
  }
  render() {
    const {locale} = this.context;
    const {activeContent, incidentType, incident, severityList, socFlowList} = this.props;
    const {showSteps} = this.state;
    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);    

    return (
      <div className='form-group normal'>
        <header>
          <div className='text'>{t('edge-management.txt-basicInfo')}</div>
          {activeContent !== 'addIncident' &&
            <span className='msg'>{f('incidentFields.updateDttm')}{helper.getFormattedDate(incident.info.updateDttm, 'local')}</span>
          }
        </header>

        <Button className='last-left' disabled={true} style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.toggleSteps.bind(this, 'main')}>{it('txt-prev-page')}</Button>

        <Button className='last' style={{backgroundColor: '#001b34', color: '#FFFFFF'}} onClick={this.toggleSteps.bind(this, 'events')}>{it('txt-next-page')}</Button>

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
              _.map(_.range(0, 20), el => {
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
                checked={incident.info.enableEstablishDttm}
                onChange={this.toggleEstablishDateCheckbox}
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
              disabled={activeContent === 'viewIncident' || !incident.info.enableEstablishDttm}
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
            <div className='flex-item'>{incident.info.showFontendRelatedList.map(this.props.showRelatedList)}</div>
          </div>
        }
      </div>
    )
  }
}

IncidentForm.contextType = BaseDataContext;
IncidentForm.propTypes = {

};

export default IncidentForm;