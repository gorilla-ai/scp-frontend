import React, { Component } from 'react'
import moment from 'moment'
import momentTimezone from 'moment-timezone'
import _ from 'lodash'

import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardDateTimePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import Button from '@material-ui/core/Button'

import {downloadWithForm} from 'react-ui/build/src/utils/download'

import {BaseDataContext} from '../common/context'
import constants from '../constant/constant-incidnet'
import helper from '../common/helper'
import SocConfig from '../common/soc-configuration'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let it = null;

/**
 * Incident Report
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Incident Report page
 */
class IncidentReport extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');

    this.state = {
      accountType: constants.soc.LIMIT_ACCOUNT,
      datetime: {
        from: helper.getSubstractDate(1, 'day'),
        to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
      },
      monthlyReportDate: moment().local().format('YYYY-MM-DDTHH:mm:ss')
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'soc', locale);
    helper.inactivityTime(baseUrl, locale);

    this.getAccountType();
  }
  /**
   * Get account type
   * @method
   */
  getAccountType = () => {
    const {baseUrl, session} = this.context;
    const requestData = {
      account: session.accountId
    };

    this.ah.one({
      url: `${baseUrl}/api/soc/unit/limit/_check`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let accountType = '';

        if (data.isLimitType === constants.soc.LIMIT_ACCOUNT) {
          accountType = constants.soc.LIMIT_ACCOUNT;
        } else if (data.isLimitType === constants.soc.NONE_LIMIT_ACCOUNT) {
          accountType = constants.soc.NONE_LIMIT_ACCOUNT;
        } else {
          accountType = constants.soc.CHECK_ERROR;
        }

        this.setState({
          accountType
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  /**
   * Set new datetime
   * @method
   * @param {string} type - date type ('from' or 'to')
   * @param {object} newDatetime - new datetime object
   */
  handleDateChange = (type, newDatetime) => {
    let tempDatetime = {...this.state.datetime};
    tempDatetime[type] = newDatetime;

    this.setState({
      datetime: tempDatetime
    });
  }
  /**
   * Set new datetime for monthly report
   * @method
   * @param {object} newDatetime - new datetime object
   */
  handleMonthlyDateChange = (newDatetime) => {
    this.setState({
      monthlyReportDate: newDatetime
    });
  }
  /**
   * Handle export button confirm
   * @method
   * @param {string} type - datetime type ('logs' or 'monthly')
   */
  handleExportConfirm = (type) => {
    const {baseUrl, contextRoot} = this.context;
    const {datetime, monthlyReportDate} = this.state;
    const timezone = momentTimezone.tz(momentTimezone.tz.guess()); //Get local timezone object
    const utc_offset = timezone._offset / 60; //Convert minute to hour
    let url = '';
    let requestData = {};

    if (type === 'logs') {
      const dateTime = {
        from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
        to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
      };
      url = `${baseUrl}${contextRoot}/api/soc/daily/_export`;  
      requestData = {
        startDttm: dateTime.from,
        endDttm: dateTime.to,
        timeZone: utc_offset
      };
    } else if (type === 'monthly') {
      url = `${baseUrl}${contextRoot}/api/soc/monthly/_export`;
      requestData = {
        startDttm: moment(monthlyReportDate).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
        timeZone: utc_offset
      };
    }

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  render() {
    const {baseUrl, contextRoot, locale, session} = this.context;
    const {accountType, datetime, monthlyReportDate} = this.state;
    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
          </div>
        </div>

        <div className='data-content'>
          <SocConfig
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            session={session}
            accountType={accountType} />

          <div className='parent-content'>
            <div className='main-content basic-form'>
              <header className='main-header'>{it('txt-incident-soc-report')}</header>
              <div className='form-group normal long'>
                <header>{t('txt-logReport')}</header>
                <div className='group'>
                  <label>{t('txt-dateRange')}:</label>
                  <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
                    <KeyboardDateTimePicker
                      id='incidentReportDateTimePickerFrom'
                      className='date-time-picker'
                      inputVariant='outlined'
                      variant='inline'
                      format='YYYY-MM-DD HH:mm'
                      invalidDateMessage={t('txt-invalidDateMessage')}
                      maxDateMessage={t('txt-maxDateMessage')}
                      minDateMessage={t('txt-minDateMessage')}
                      ampm={false}
                      value={datetime.from}
                      onChange={this.handleDateChange.bind(this, 'from')} />
                    <div className='between'>~</div>
                    <KeyboardDateTimePicker
                      id='incidentReportDateTimePickerTo'
                      className='date-time-picker'
                      inputVariant='outlined'
                      variant='inline'
                      format='YYYY-MM-DD HH:mm'
                      invalidDateMessage={t('txt-invalidDateMessage')}
                      maxDateMessage={t('txt-maxDateMessage')}
                      minDateMessage={t('txt-minDateMessage')}
                      ampm={false}
                      value={datetime.to}
                      onChange={this.handleDateChange.bind(this, 'to')} />
                  </MuiPickersUtilsProvider>
                  <Button variant='contained' color='primary' onClick={this.handleExportConfirm.bind(this, 'logs')}>{t('txt-export')}</Button>
                </div>
              </div>

              <div className='form-group normal long'>
                <header>{it('txt-monthlyReport')}</header>
                <div className='group'>
                  <label>{t('txt-yearMonth')}:</label>
                  <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
                    <KeyboardDatePicker
                      id='incidentReportMonthly'
                      className='date-picker'
                      inputVariant='outlined'
                      openTo='year'
                      views={['year', 'month']}
                      format='YYYY / MM'
                      invalidDateMessage={t('txt-invalidDateMessage')}
                      value={monthlyReportDate}
                      onChange={this.handleMonthlyDateChange} />
                  </MuiPickersUtilsProvider>
                  <Button variant='contained' color='primary' onClick={this.handleExportConfirm.bind(this, 'monthly')}>{t('txt-export')}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }  
}

IncidentReport.contextType = BaseDataContext;

export default IncidentReport;