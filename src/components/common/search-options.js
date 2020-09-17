import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import DateRange from 'react-ui/build/src/components/date-range'
import DropDownList from 'react-ui/build/src/components/dropdown'

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
   * @param {string} type - input value ('manual' or 'auto')
   */
  handleSearchTypeChange = (type) => {
    this.props.setSearchData('all', {
      searchType: type,
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
   * Display date picker
   * @method
   * @returns DateRange component
   */
  showDataRange = () => {
    const {locale} = this.context;
    const {enableTime, datetime} = this.props;
    const showTime = typeof enableTime === 'boolean' ? enableTime : true;

    return (
      <DateRange
        id='datetime'
        className='daterange'
        enableTime={showTime}
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
    const {showFilter, showInterval, searchInput} = this.props;

    return (
      <div className='search-options'>
        {showInterval &&
          <DropDownList
            className='search-type'
            list={[
              {value: 'manual', text: t('events.connections.txt-search-manual')},
              {value: 'auto', text: t('events.connections.txt-search-auto')}
            ]}
            required={true}
            value={searchInput.searchType}
            onChange={this.handleSearchTypeChange} />
        }

        {showInterval &&
          <div className='search-interval'>
            {searchInput.searchType === 'auto' &&
              <div>
                <DropDownList
                  id='updateInterval'
                  list={[
                    {value: '15000', text: t('events.connections.txt-15s')},
                    {value: '30000', text: t('events.connections.txt-30s')},
                    {value: '60000', text: t('events.connections.txt-1m')},
                    {value: '300000', text: t('events.connections.txt-5m')},
                    {value: '600000', text: t('events.connections.txt-10m')}
                  ]}
                  required={true}
                  value={searchInput.refreshTime}
                  onChange={this.props.setSearchData.bind(this, 'refreshTime')} />
                <DropDownList
                  id='timeInterval'
                  list={[
                    {value: '15m', text: t('events.connections.txt-last15m')},
                    {value: '30m', text: t('events.connections.txt-last30m')},
                    {value: '1h', text: t('events.connections.txt-last1h')},
                    {value: '12h', text: t('events.connections.txt-last12h')}
                  ]}
                  required={true}
                  value={searchInput.searchInterval}
                  onChange={this.props.setSearchData.bind(this, 'searchInterval')} />          
              </div>
            }
            {searchInput.searchType === 'manual' &&
              <DropDownList
                id='timeInterval'
                list={[
                  {value: '30m', text: t('events.connections.txt-last30m')},
                  {value: '1h', text: t('events.connections.txt-last1h')},
                  {value: '2h', text: t('events.connections.txt-last2h')},
                  {value: 'today', text: t('events.connections.txt-today')},
                  {value: '24h', text: t('events.connections.txt-last24h')},
                  {value: 'week', text: t('events.connections.txt-week')}
                ]}
                required={true}
                value={searchInput.searchInterval}
                onChange={this.props.setSearchData.bind(this, 'searchInterval')} />
            }
          </div>
        }
        
        <div className='datepicker'>
          <label htmlFor='datetime' className='datetime'></label>
          {this.showDataRange()}
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