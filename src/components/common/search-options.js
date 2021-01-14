import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import cx from 'classnames'

import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardDateTimePicker } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import 'moment/locale/zh-tw';

import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import {BaseDataContext} from './context';
import helper from './helper'

let t = null;
let et = null;

/**
 * Search Options
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
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
    const {searchInput} = this.props;

    if (search) {
      this.props.handleSearchSubmit('search');
    }

    if (prevProps && prevProps.searchInput) {
      if (prevProps.searchInput.searchInterval !== searchInput.searchInterval) {
        this.handleIntervalConfirm();
      }
    }

    if (searchInput && searchInput.searchType === 'auto') {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      this.intervalId = setInterval(this.setNewDatetime, Number(searchInput.refreshTime));
    }
  }
  /**
   * Get calculated time based on user's time selection
   * @method
   * @param {string} type - time options
   * @returns calculated time
   */
  getCalculatedTime = (type) => {
    let time = '';

    switch (type) {
      case '15m':
        time = helper.getSubstractDate(15, 'minutes');
        break;
      case '30m':
        time = helper.getSubstractDate(30, 'minutes');
        break;
      case '1h':
        time = helper.getSubstractDate(1, 'hours');
        break;
      case '2h':
        time = helper.getSubstractDate(2, 'hours');
        break;
      case '12h':
        time = helper.getSubstractDate(12, 'hours');
        break;
      case '24h':
        time = helper.getSubstractDate(24, 'hours');
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
   * Set search type and interval based on user's selection
   * @method
   * @param {object} event - event object ('manual' or 'auto')
   */
  handleSearchTypeChange = (event) => {
    this.props.setSearchData('all', {
      searchType: event.target.value,
      searchInterval: '1h',
      refreshTime: '600000'
    });

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  /**
   * Set new datetime based on time interval
   * @method
   */
  setNewDatetime = () => {
    this.props.handleDateChange('refresh', {
      from: this.getCalculatedTime(this.props.searchInput.searchInterval),
      to: moment().local().format('YYYY-MM-DDTHH:mm') + ':00'
    });
  }
  /**
   * Set search data based on user's selection
   * @method
   */
  handleIntervalConfirm = () => {
    this.props.handleDateChange('customTime', {
      from: this.getCalculatedTime(this.props.searchInput.searchInterval),
      to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
    });
  }
  /**
   * Display date range
   * @method
   * @returns DateTimePicker component
   */
  showDataRange = () => {
    const {locale} = this.context;
    const {enableTime, datetime} = this.props;
    const showTime = typeof enableTime === 'boolean' ? enableTime : true;
    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    if (showTime) {
      return (
        <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
          <KeyboardDateTimePicker
            className='date-time-picker'
            inputVariant='outlined'
            variant='inline'
            format='YYYY-MM-DD HH:mm'
            ampm={false}
            value={datetime.from}
            onChange={this.props.handleDateChange.bind(this, 'from')} />
          <div className='between'>~</div>
          <KeyboardDateTimePicker
            className='date-time-picker'
            inputVariant='outlined'
            variant='inline'
            format='YYYY-MM-DD HH:mm'
            ampm={false}
            value={datetime.to}
            onChange={this.props.handleDateChange.bind(this, 'to')} />
        </MuiPickersUtilsProvider>
      )
    } else {
      return (
        <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
          <KeyboardDatePicker
            className='date-picker'
            inputVariant='outlined'
            variant='inline'
            format='YYYY-MM-DD'
            value={datetime.from}
            onChange={this.props.handleDateChange.bind(this, 'from')} />
          <div className='between'>~</div>
          <KeyboardDatePicker
            className='date-picker'
            inputVariant='outlined'
            variant='inline'
            format='YYYY-MM-DD'
            value={datetime.to}
            onChange={this.props.handleDateChange.bind(this, 'to')} />
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
          className='date-picker'
          inputVariant='outlined'
          variant='inline'
          format='YYYY-MM-DD'
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
            className='search-type'
            select
            variant='outlined'
            size='small'
            value={searchInput.searchType}
            onChange={this.handleSearchTypeChange}>
            <MenuItem value={'manual'}>{t('time-interval.txt-search-manual')}</MenuItem>
            <MenuItem value={'auto'}>{t('time-interval.txt-search-auto')}</MenuItem>
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
                    select
                    variant='outlined'
                    size='small'
                    value={searchInput.refreshTime}
                    onChange={this.props.setSearchData.bind(this, 'refreshTime')}>
                    <MenuItem value={'15000'}>{t('time-interval.txt-15s')}</MenuItem>
                    <MenuItem value={'30000'}>{t('time-interval.txt-30s')}</MenuItem>
                    <MenuItem value={'60000'}>{t('time-interval.txt-1m')}</MenuItem>
                    <MenuItem value={'300000'}>{t('time-interval.txt-5m')}</MenuItem>
                    <MenuItem value={'600000'}>{t('time-interval.txt-10m')}</MenuItem>
                  </TextField>
                </div>

                <div className='time-interval'>
                  <TextField
                    id='timeInterval'
                    className='select-field'
                    select
                    variant='outlined'
                    size='small'
                    value={searchInput.searchInterval}
                    onChange={this.props.setSearchData.bind(this, 'searchInterval')}>
                    <MenuItem value={'15m'}>{t('time-interval.txt-last15m')}</MenuItem>
                    <MenuItem value={'30m'}>{t('time-interval.txt-last30m')}</MenuItem>
                    <MenuItem value={'1h'}>{t('time-interval.txt-last1h')}</MenuItem>
                    <MenuItem value={'12h'}>{t('time-interval.txt-last12h')}</MenuItem>
                  </TextField>
                </div>
              </div>
            }
            {searchInput.searchType === 'manual' &&
              <TextField
                id='timeInterval'
                className='select-field'
                select
                variant='outlined'
                fullWidth
                size='small'
                value={searchInput.searchInterval}
                onChange={this.props.setSearchData.bind(this, 'searchInterval')}>
                <MenuItem value={'30m'}>{t('time-interval.txt-last30m')}</MenuItem>
                <MenuItem value={'1h'}>{t('time-interval.txt-last1h')}</MenuItem>
                <MenuItem value={'2h'}>{t('time-interval.txt-last2h')}</MenuItem>
                <MenuItem value={'today'}>{t('time-interval.txt-today')}</MenuItem>
                <MenuItem value={'24h'}>{t('time-interval.txt-last24h')}</MenuItem>
                <MenuItem value={'week'}>{t('time-interval.txt-week')}</MenuItem>
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

        <Button variant='contained' color='primary' className='search-button' onClick={this.loadSearchOptions.bind(this, 'search')} disabled={showFilter || false}>{t('events.connections.txt-toggleFilter')}</Button>
      </div>
    )
  }
}

SearchOptions.contextType = BaseDataContext;

SearchOptions.propTypes = {
  handleDateChange: PropTypes.func.isRequired,
  handleSearchSubmit: PropTypes.func.isRequired
};

export default SearchOptions;