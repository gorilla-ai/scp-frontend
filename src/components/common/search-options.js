import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import DateRange from 'react-ui/build/src/components/date-range'
import DropDownList from 'react-ui/build/src/components/dropdown'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import RadioGroup from 'react-ui/build/src/components/radio-group'

import helper from './helper'
import withLocale from '../../hoc/locale-provider'

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

    this.state = {
      intervalModalOpen: false
    };
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
        this.handleIntervalConfirm('noToggle');
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
    const {searchInput} = this.props;
    const dataObj = this.getTimeAndText(searchInput.searchInterval);
    const datetime = {
      from: dataObj.time,
      to: Moment().local().format('YYYY-MM-DDTHH:mm') + ':00'
    };

    this.props.handleDateChange(datetime, 'refresh');
  }
  /**
   * Get text and time to be displayed in the search bar based on user's selection
   * @method
   * @param {string} type - time options
   * @returns text and time
   */
  getTimeAndText = (type) => {
    let text = '';
    let time = '';

    switch(type) {
      case '15m':
        text = t('events.connections.txt-last15m');
        time = helper.getSubstractDate(15, 'minutes');
        break;
      case '30m':
        text = t('events.connections.txt-last30m');
        time = helper.getSubstractDate(30, 'minutes');
        break;
      case '1h':
        text = t('events.connections.txt-last1h');
        time = helper.getSubstractDate(1, 'hours');
        break;
      case '2h':
        text = t('events.connections.txt-last2h');
        time = helper.getSubstractDate(2, 'hours');
        break;
      case '12h':
        text = t('events.connections.txt-last12h');
        time = helper.getSubstractDate(12, 'hours');
        break;
      case '24h':
        text = t('events.connections.txt-last24h');
        time = helper.getSubstractDate(24, 'hours');
        break;
      case 'today':
        text = t('events.connections.txt-today');
        time = helper.getStartDate('day');
        break;
      case 'week':
        text = t('events.connections.txt-week');
        time = helper.getStartDate('week');
        break;
      case '15000':
        text = t('events.connections.txt-15s');
        break;
      case '30000':
        text = t('events.connections.txt-30s');
        break;
      case '60000':
        text = t('events.connections.txt-1m');
        break;
      case '300000':
        text = t('events.connections.txt-5m');
        break;
      case '600000':
        text = t('events.connections.txt-10m');
        break;
    }

    return {
      text,
      time
    };
  }
  /**
   * Toggle interval dialog on/off
   * @method
   */
  toggleIntervalDialog = () => {
    this.setState({
      intervalModalOpen: !this.state.intervalModalOpen
    });
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
      refreshTime: '600000',
      inputManual: t('events.connections.txt-last1h'),
      inputAuto: t('txt-interval') + ': ' + t('events.connections.txt-10m')
    });

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  /**
   * Display interval options content
   * @method
   * @returns HTML DOM
   */
  displayIntervalOptions = () => {
    const {searchInput} = this.props;

    if (searchInput.searchType === 'manual') {
      return (
        <div className='interval-options manual'>
          <label>{t('events.connections.txt-time-frame')}</label>
          <RadioGroup
            id='timeInterval'
            list={[
              {value: '30m', text: t('events.connections.txt-last30m')},
              {value: '1h', text: t('events.connections.txt-last1h')},
              {value: '2h', text: t('events.connections.txt-last2h')},
              {value: 'today', text: t('events.connections.txt-today')},
              {value: '24h', text: t('events.connections.txt-last24h')},
              {value: 'week', text: t('events.connections.txt-week')}
            ]}
            onChange={this.props.setSearchData.bind(this, 'searchInterval')}
            value={searchInput.searchInterval} />
        </div>
      )
    } else if (searchInput.searchType === 'auto') {
      return (
        <div className='interval-options auto'>
          <label>{t('events.connections.txt-time-frame')}</label>
          <RadioGroup
            id='timeInterval'
            list={[
              {value: '15m', text: t('events.connections.txt-last15m')},
              {value: '30m', text: t('events.connections.txt-last30m')},
              {value: '1h', text: t('events.connections.txt-last1h')},
              {value: '12h', text: t('events.connections.txt-last12h')}
            ]}
            onChange={this.props.setSearchData.bind(this, 'searchInterval')}
            value={searchInput.searchInterval} />

          <label>{t('events.connections.txt-auto-update')}</label>
          <RadioGroup
            id='updateInterval'
            list={[
              {value: '15000', text: t('events.connections.txt-15s')},
              {value: '30000', text: t('events.connections.txt-30s')},
              {value: '60000', text: t('events.connections.txt-1m')},
              {value: '300000', text: t('events.connections.txt-5m')},
              {value: '600000', text: t('events.connections.txt-10m')}
            ]}
            onChange={this.props.setSearchData.bind(this, 'refreshTime')}
            value={searchInput.refreshTime} />
        </div>
      )
    }
  }
  /**
   * Display interval options modal dialog
   * @method
   * @returns ModalDialog component
   */
  intervalModalDialog = () => {
    const {activeTab} = this.state;
    const actions = {
      confirm: {text: t('txt-close'), handler: this.handleIntervalConfirm}
    };
    const titleText = t('events.connections.txt-time-frame');

    return (
      <ModalDialog
        id='intervalModalDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displayIntervalOptions()}
      </ModalDialog>
    )
  }
  /**
   * Set search data based on user's selection
   * @method
   */
  handleIntervalConfirm = (options) => {
    const {searchInput} = this.props;
    let dataObj = this.getTimeAndText(searchInput.searchInterval);
    let inputManual = '';
    let inputAuto = '';

    this.props.handleDateChange({
      from: dataObj.time,
      to: Moment().local().format('YYYY-MM-DDTHH:mm') + ':00Z'
    });

    if (searchInput.searchType === 'manual') {
      inputManual = dataObj.text;
    } else if (searchInput.searchType === 'auto') {
      dataObj = this.getTimeAndText(searchInput.refreshTime);
      inputAuto = t('txt-interval') + ': ' + dataObj.text;
    }

    this.props.setSearchData('inputManual', inputManual);
    this.props.setSearchData('inputAuto', inputAuto);

    if (!options || options !== 'noToggle') {
      this.toggleIntervalDialog(options);
    }
  }
  /**
   * Display date picker
   * @method
   * @returns DateRange component
   */
  showDataRange = () => {
    return (
      <DateRange
        id='datetime'
        className='daterange'
        onChange={this.props.handleDateChange}
        enableTime={true}
        value={this.props.datetime}
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
    const {locale, searchInput} = this.props;
    const searchType = searchInput.searchType;

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
    const {position, showFilter, showInterval, searchInput} = this.props;
    const {intervalModalOpen} = this.state;
    const searchStyle = position ? position : '10px';
    let searchManualText = '';
    let searchAutoText = '';
    let searchInputValue = '';

    if (searchInput) {
      searchManualText = searchInput.inputManual ? searchInput.inputManual : t('events.connections.txt-last1h');
      searchAutoText = searchInput.inputAuto ? searchInput.inputAuto : t('txt-interval') + ': ' + t('events.connections.txt-10m');

      if (searchInput.searchType === 'manual') {
        searchInputValue = searchManualText;
      } else if (searchInput.searchType === 'auto') {
        searchInputValue = searchAutoText;
      }
    }

    return (
      <div className='search-options' style={{right: searchStyle}}>
        {intervalModalOpen &&
          this.intervalModalDialog()
        }

        {showInterval &&
          <DropDownList
            className='search-type'
            list={[
              {value: 'manual', text: t('events.connections.txt-search-manual')},
              {value: 'auto', text: t('events.connections.txt-search-auto')}
            ]}
            required={true}
            onChange={this.handleSearchTypeChange}
            value={searchInput.searchType} />
        }

        {showInterval &&
          <div className='search-interval'>
            <input className='time-interval' style={{width: this.getInputWidth()}} value={searchInputValue} onClick={this.toggleIntervalDialog} readOnly />
          </div>
        }
        
        <div className='datepicker'>
          <label htmlFor='datetime' className='datetime'></label>
          {this.showDataRange()}
        </div>

        <button className='search-button' onClick={this.loadSearchOptions.bind(this, 'search')} disabled={showFilter}>{t('events.connections.txt-toggleFilter')}</button>
      </div>
    )
  }
}

SearchOptions.propTypes = {
  datetime: PropTypes.object.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  handleSearchSubmit: PropTypes.func.isRequired
};

const HocSearchOptions = withLocale(SearchOptions);
export { SearchOptions, HocSearchOptions };