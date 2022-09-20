import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardDateTimePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from './context'
import helper from './helper'

let t = null;
let et = null;

/**
 * Search Options
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component for the search options in Alert and Events pages
 */
class SearchOptions extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
  }
  componentDidMount() {
    this.loadSearchOptions();
  }
  componentDidUpdate(prevProps) {
    this.loadSearchOptions('', prevProps);
  }
  componentWillUnmount() {
    this.intervalId && clearInterval(this.intervalId);
    this.intervalId = null;
  }
  /**
   * Set and run the time interval for auto refresh
   * @method
   * @param {string} search - search option
   */
  loadSearchOptions = (search, prevProps) => {
    const {datetime, searchInput} = this.props;

    if (search) {
      if (datetime.from && datetime.to) {
        if (moment(datetime.to).isBefore(moment(datetime.from))) {
          helper.showPopupMsg(t('txt-timeRangeError'), t('txt-error'));
          return;
        }
      }
      this.props.handleSearchSubmit('search');
    }

    if (prevProps && prevProps.searchInput && searchInput) {
      if (prevProps.searchInput.searchInterval !== searchInput.searchInterval) {
        this.setNewDatetime(searchInput.searchType);
      }
    }

    if (searchInput && searchInput.searchType === 'auto') {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      this.intervalId = setInterval(this.setNewDatetime.bind(this, searchInput.searchType), Number(searchInput.refreshTime));
    }
  }
  /**
   * Set search type and interval based on user's selection
   * @method
   * @param {object} event - event object ('manual' or 'auto')
   */
  handleSearchTypeChange = (event) => {
    this.props.setSearchData({
      searchType: event.target.value
    }, event.target.name);

    if (event.target.value === 'manual' && this.intervalId) { //clear time interval for manual search type
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  /**
   * Set new datetime based on time interval
   * @method
   * @param {string} searchType - search type ('manual' or 'auto')
   */
  setNewDatetime = (searchType) => {
    const {searchInput} = this.props;
    const currentTime = moment().local().format('YYYY-MM-DDTHH:mm:ss');
    let dateType = '';
    let datetime = '';

    if (searchType === 'manual') {
      dateType = 'customTime';
    } else if (searchType === 'auto') {
      dateType = 'refresh';
      datetime = currentTime;
    }

    this.props.handleDateChange(dateType, {
      from: this.getCalculatedTime(searchInput.searchInterval, datetime),
      to: currentTime //set to current time
    });
  }
  /**
   * Get calculated time based on user's time selection
   * @method
   * @param {string} type - time options
   * @param {string} [datetime] - datetime
   * @returns calculated time
   */
  getCalculatedTime = (type, datetime) => {
    let time = '';

    switch (type) {
      case '15m':
        time = helper.getSubstractDate(15, 'minutes', datetime);
        break;
      case '30m':
        time = helper.getSubstractDate(30, 'minutes', datetime);
        break;
      case '1h':
        time = helper.getSubstractDate(1, 'hours', datetime);
        break;
      case '2h':
        time = helper.getSubstractDate(2, 'hours', datetime);
        break;
      case '12h':
        time = helper.getSubstractDate(12, 'hours', datetime);
        break;
      case '24h':
        time = helper.getSubstractDate(24, 'hours', datetime);
        break;
      case 'today':
        time = helper.getStartDate('day');
        break;
      case 'week':
        time = helper.getStartDate('week');
        break;
    }

    return time;
  }
  /**
   * Display date range
   * @method
   * @returns DateTimePicker component
   */
  showDataRange = () => {
    const {locale} = this.context;
    const {enableTime, datetime, searchInput} = this.props;
    const showTime = typeof enableTime === 'boolean' ? enableTime : true;
    let dateLocale = locale;
    let searchType = '';

    if (searchInput && searchInput.searchType) {
      searchType = searchInput.searchType;
    }

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    if (showTime) {
      return (
        <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
          <KeyboardDateTimePicker
            id='searchDateTimePickerFrom'
            className='date-time-picker'
            inputVariant='outlined'
            variant='inline'
            format='YYYY-MM-DD HH:mm'
            invalidDateMessage={t('txt-invalidDateMessage')}
            maxDateMessage={t('txt-maxDateMessage')}
            minDateMessage={t('txt-minDateMessage')}
            ampm={false}
            value={datetime.from}
            onChange={this.props.handleDateChange.bind(this, 'from')} />
          <div className='between'>~</div>
          <KeyboardDateTimePicker
            id='searchDateTimePickerTo'
            className='date-time-picker'
            inputVariant='outlined'
            variant='inline'
            format='YYYY-MM-DD HH:mm'
            invalidDateMessage={t('txt-invalidDateMessage')}
            maxDateMessage={t('txt-maxDateMessage')}
            minDateMessage={t('txt-minDateMessage')}
            ampm={false}
            value={datetime.to}
            onChange={this.props.handleDateChange.bind(this, 'to')}
            disabled={searchType && searchType === 'auto'} />
        </MuiPickersUtilsProvider>
      )
    } else {
      return (
        <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
          <KeyboardDatePicker
            id='searchDatePickerFrom'
            className='date-picker'
            inputVariant='outlined'
            variant='inline'
            format='YYYY-MM-DD'
            invalidDateMessage={t('txt-invalidDateMessage')}
            maxDateMessage={t('txt-maxDateMessage')}
            minDateMessage={t('txt-minDateMessage')}
            value={datetime.from}
            onChange={this.props.handleDateChange.bind(this, 'from')} />
          <div className='between'>~</div>
          <KeyboardDatePicker
            id='searchDatePickerTo'
            className='date-picker'
            inputVariant='outlined'
            variant='inline'
            format='YYYY-MM-DD'
            invalidDateMessage={t('txt-invalidDateMessage')}
            maxDateMessage={t('txt-maxDateMessage')}
            minDateMessage={t('txt-minDateMessage')}
            value={datetime.to}
            onChange={this.props.handleDateChange.bind(this, 'to')}
            disabled={searchType && searchType === 'auto'} />
        </MuiPickersUtilsProvider>
      )
    }
  }
  /**
   * Display date picker
   * @method
   * @returns DatePicker component
   */
  showDatePicker = () => {
    const {locale} = this.context;
    const {datetime} = this.props;
    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
        <KeyboardDatePicker
          id='searchDatePicker'
          className='date-picker'
          inputVariant='outlined'
          variant='inline'
          format='YYYY-MM-DD'
          invalidDateMessage={t('txt-invalidDateMessage')}
          maxDateMessage={t('txt-maxDateMessage')}
          minDateMessage={t('txt-minDateMessage')}
          value={datetime}
          onChange={this.props.handleDateChange} />
      </MuiPickersUtilsProvider>
    )
  }
  /**
   * Get time interval input width
   * @method
   * @param {string} type - input value ('manual' or 'auto')
   * @returns input box width
   */
  getInputWidth = (type) => {
    const {locale} = this.context;
    const searchType = this.props.searchInput.searchType;

    if (searchType === 'manual') {
      return '110px';
    } else if (searchType === 'auto') {
      if (locale === 'zh') {
        return '114px';
      } else if (locale === 'en') {
        return '135px';
      }
    }
  }
  render() {
    const {dateType, showFilter, showInterval, searchInput} = this.props;

    return (
      <div className='search-options'>
        {showInterval &&
          <TextField
            id='searhType'
            className='search-type'
            name='searchType'
            select
            variant='outlined'
            size='small'
            value={searchInput.searchType}
            onChange={this.handleSearchTypeChange}>
            <MenuItem id='searhTypeManual' value={'manual'}>{t('time-interval.txt-search-manual')}</MenuItem>
            <MenuItem id='searhTypeAuto' value={'auto'}>{t('time-interval.txt-search-auto')}</MenuItem>
          </TextField>
        }

        {showInterval &&
          <div className='search-interval'>
            {searchInput.searchType === 'auto' &&
              <div>
                <div className='update-interval'>
                  <TextField
                    id='updateInterval'
                    className='select-field'
                    name='refreshTime'
                    select
                    variant='outlined'
                    size='small'
                    value={searchInput.refreshTime}
                    onChange={this.props.setSearchData}>
                    <MenuItem id='updateInterval15s' value={'15000'}>{t('time-interval.txt-15s')}</MenuItem>
                    <MenuItem id='updateInterval30s' value={'30000'}>{t('time-interval.txt-30s')}</MenuItem>
                    <MenuItem id='updateInterval1m' value={'60000'}>{t('time-interval.txt-1m')}</MenuItem>
                    <MenuItem id='updateInterval5m' value={'300000'}>{t('time-interval.txt-5m')}</MenuItem>
                    <MenuItem id='updateInterval10m' value={'600000'}>{t('time-interval.txt-10m')}</MenuItem>
                  </TextField>
                </div>

                <div className='time-interval'>
                  <TextField
                    id='timeInterval'
                    className='select-field'
                    name='searchInterval'
                    select
                    variant='outlined'
                    size='small'
                    value={searchInput.searchInterval}
                    onChange={this.props.setSearchData}>
                    <MenuItem id='timeInterval15m' value={'15m'}>{t('time-interval.txt-last15m')}</MenuItem>
                    <MenuItem id='timeInterval30m' value={'30m'}>{t('time-interval.txt-last30m')}</MenuItem>
                    <MenuItem id='timeInterval1h' value={'1h'}>{t('time-interval.txt-last1h')}</MenuItem>
                    <MenuItem id='timeInterval12h' value={'12h'}>{t('time-interval.txt-last12h')}</MenuItem>
                  </TextField>
                </div>
              </div>
            }
            {searchInput.searchType === 'manual' &&
              <TextField
                id='timeInterval'
                className='select-field'
                name='searchInterval'
                select
                variant='outlined'
                fullWidth
                size='small'
                value={searchInput.searchInterval}
                onChange={this.props.setSearchData}>
                <MenuItem id='timeInterval30m' value={'30m'}>{t('time-interval.txt-last30m')}</MenuItem>
                <MenuItem id='timeInterval1h' value={'1h'}>{t('time-interval.txt-last1h')}</MenuItem>
                <MenuItem id='timeInterval2h' value={'2h'}>{t('time-interval.txt-last2h')}</MenuItem>
                <MenuItem id='timeIntervalToday' value={'today'}>{t('time-interval.txt-today')}</MenuItem>
                <MenuItem id='timeInterval24h' value={'24h'}>{t('time-interval.txt-last24h')}</MenuItem>
                <MenuItem id='timeIntervalWeek' value={'week'}>{t('time-interval.txt-week')}</MenuItem>
              </TextField>
            }
          </div>
        }

        <div className='datepicker'>
          {dateType === 'datepicker' &&
            this.showDatePicker()
          }

          {(!dateType || dateType === 'daterange') &&
            this.showDataRange()
          }
        </div>

        <Button id='searchBarButton' variant='contained' color='primary' className='search-button' onClick={this.loadSearchOptions.bind(this, 'search')} disabled={showFilter || false}>{t('events.connections.txt-toggleFilter')}</Button>
      </div>
    )
  }
}

SearchOptions.contextType = BaseDataContext;

SearchOptions.propTypes = {
  dateType: PropTypes.string,
  datetime: PropTypes.object,
  showFilter: PropTypes.bool,
  handleDateChange: PropTypes.func,
  handleSearchSubmit: PropTypes.func.isRequired
};

export default SearchOptions;