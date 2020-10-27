import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import DatePicker from 'react-ui/build/src/components/date-picker'
import DateRange from 'react-ui/build/src/components/date-range'

import {BaseDataContext} from './context';
import helper from './helper'

let t = null;
let et = null;

const StyledTextField = withStyles({
  root: {
    backgroundColor: '#fff',
    '& .Mui-disabled': {
      backgroundColor: '#f2f2f2'
    }
  }
})(TextField);

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
   * Set new datetime based on time interval
   * @method
   */
  setNewDatetime = () => {
    const datetime = {
      from: this.getCalculatedTime(this.props.searchInput.searchInterval),
      to: Moment().local().format('YYYY-MM-DDTHH:mm') + ':00'
    };

    this.props.handleDateChange(datetime, 'refresh');
  }
  /**
   * Get calculated time based on user's time selection
   * @method
   * @param {string} type - time options
   * @returns calculated time
   */
  getCalculatedTime = (type) => {
    let time = '';

    switch(type) {
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
   * Set search data based on user's selection
   * @method
   */
  handleIntervalConfirm = () => {
    this.props.handleDateChange({
      from: this.getCalculatedTime(this.props.searchInput.searchInterval),
      to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
    });
  }
  /**
   * Display date range
   * @method
   * @returns DateRange component
   */
  showDataRange = () => {
    const {locale} = this.context;
    const {enableTime, datetime} = this.props;
    const showTime = typeof enableTime === 'boolean' ? enableTime : true;

    return (
      <DateRange
        id='dateTime'
        className='date-range'
        enableTime={showTime}
        value={datetime}
        onChange={this.props.handleDateChange}
        locale={locale}
        t={et} />
    )
  }
  /**
   * Display date picker
   * @method
   * @returns DatePicker component
   */
  showDatePicker = () => {
    const {locale} = this.context;
    const {datetime} = this.props;

    return (
      <DatePicker
        id='datePicker'
        className='date-picker'
        value={datetime}
        onChange={this.props.handleDateChange}
        locale={locale}
        t={et} />
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
          <StyledTextField
            className='search-type'
            select
            variant='outlined'
            size='small'
            value={searchInput.searchType}
            onChange={this.handleSearchTypeChange}>
            <MenuItem value={'manual'}>{t('events.connections.txt-search-manual')}</MenuItem>
            <MenuItem value={'auto'}>{t('events.connections.txt-search-auto')}</MenuItem>
          </StyledTextField>
        }

        {showInterval &&
          <div className='search-interval'>
            {searchInput.searchType === 'auto' &&
              <div>
                <div className='update-interval'>
                  <StyledTextField
                    id='updateInterval'
                    select
                    variant='outlined'
                    size='small'
                    value={searchInput.refreshTime}
                    onChange={this.props.setSearchData.bind(this, 'refreshTime')}>
                    <MenuItem value={'15000'}>{t('events.connections.txt-15s')}</MenuItem>
                    <MenuItem value={'30000'}>{t('events.connections.txt-30s')}</MenuItem>
                    <MenuItem value={'60000'}>{t('events.connections.txt-1m')}</MenuItem>
                    <MenuItem value={'300000'}>{t('events.connections.txt-5m')}</MenuItem>
                    <MenuItem value={'600000'}>{t('events.connections.txt-10m')}</MenuItem>
                  </StyledTextField>
                </div>

                <div className='time-interval'>
                  <StyledTextField
                    id='timeInterval'
                    select
                    variant='outlined'
                    size='small'
                    value={searchInput.searchInterval}
                    onChange={this.props.setSearchData.bind(this, 'searchInterval')}>
                    <MenuItem value={'15m'}>{t('events.connections.txt-last15m')}</MenuItem>
                    <MenuItem value={'30m'}>{t('events.connections.txt-last30m')}</MenuItem>
                    <MenuItem value={'1h'}>{t('events.connections.txt-last1h')}</MenuItem>
                    <MenuItem value={'12h'}>{t('events.connections.txt-last12h')}</MenuItem>
                  </StyledTextField>
                </div>
              </div>
            }
            {searchInput.searchType === 'manual' &&
                <StyledTextField
                  id='timeInterval'
                  select
                  variant='outlined'
                  fullWidth={true}
                  size='small'
                  value={searchInput.searchInterval}
                  onChange={this.props.setSearchData.bind(this, 'searchInterval')}>
                  <MenuItem value={'30m'}>{t('events.connections.txt-last30m')}</MenuItem>
                  <MenuItem value={'1h'}>{t('events.connections.txt-last1h')}</MenuItem>
                  <MenuItem value={'2h'}>{t('events.connections.txt-last2h')}</MenuItem>
                  <MenuItem value={'today'}>{t('events.connections.txt-today')}</MenuItem>
                  <MenuItem value={'24h'}>{t('events.connections.txt-last24h')}</MenuItem>
                  <MenuItem value={'week'}>{t('events.connections.txt-week')}</MenuItem>
                </StyledTextField>
            }
          </div>
        }
        
        <div className='datepicker'>
          <label htmlFor='datetime' className='datetime'></label>
          {dateType === 'datepicker' &&
            this.showDatePicker()
          }

          {(!dateType || dateType === 'daterange') &&
            this.showDataRange()
          }
        </div>

        <button className='search-button' onClick={this.loadSearchOptions.bind(this, 'search')} disabled={showFilter || false}>{t('events.connections.txt-toggleFilter')}</button>
      </div>
    )
  }
}

SearchOptions.contextType = BaseDataContext;

SearchOptions.propTypes = {
  datetime: PropTypes.object.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  handleSearchSubmit: PropTypes.func.isRequired
};

export default SearchOptions;