import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import DateRange from 'react-ui/build/src/components/date-range'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import RadioGroup from 'react-ui/build/src/components/radio-group'

import helper from './helper'
import withLocale from '../../hoc/locale-provider'

let t = null;
let et = null;

class SearchOptions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchType: 'manual',
      searchInterval: '1h',
      refreshTime: '600000', //10 minutes
      showManualMenu: false,
      showAutoMenu: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
  }
  componentDidMount = () => {
    this.loadSearchOptions();
    document.addEventListener('mousedown', this.handleClickOutside);
  }
  componentWillUnmount() {
    this.intervalId && clearInterval(this.intervalId);
    this.intervalId = null;
    document.removeEventListener('mousedown', this.handleClickOutside);
  }
  loadSearchOptions = (search) => {
    const {searchType, refreshTime} = this.state;

    if (search) {
      this.props.handleSearchSubmit('search');
    }

    if (searchType === 'auto') {
      this.setState({
        showAutoMenu: false
      }, () => {
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
        this.intervalId = setInterval(this.setNewDatetime, Number(refreshTime));
      });
    }
  }
  setNewDatetime = () => {
    const {searchInterval} = this.state;
    const dataObj = this.getTimeAndText(searchInterval);
    const datetime = {
      from: dataObj.time,
      to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
    };

    this.props.handleDateChange(datetime, 'refresh');
  }
  handleClickOutside = (e) => {
    if (this.wrapperRef && !this.wrapperRef.contains(e.target)) {
      this.setState({
        showManualMenu: false,
        showAutoMenu: false
      });
    }
  }
  setWrapperRef = (node) => {
    this.wrapperRef = node;
  }
  handleSearchType = (type) => {
    this.setState({
      searchType: type,
      searchInterval: '1h',
      refreshTime: '600000',
      showManualMenu: false,
      showAutoMenu: false
    }, () => {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    });
  }
  hideTimeMenu = () => {
    this.setState({
      showManualMenu: false,
      showAutoMenu: false
    });
  }
  toggleTimeOptions = () => {
    const {searchType, showManualMenu, showAutoMenu} = this.state;

    if (searchType === 'manual') {
      this.setState({
        showManualMenu: !showManualMenu
      });
    } else if (searchType === 'auto') {
      this.setState({
        showAutoMenu: !showAutoMenu
      });
    }
  }
  handleTimeframe = (type) => {
    let tempDatetime = {...this.state.datetime};
    const dataObj = this.getTimeAndText(type);
    tempDatetime.to = Moment().local().format('YYYY-MM-DDTHH:mm:ss');
    tempDatetime.from = dataObj.time;

    this.props.handleDateChange(tempDatetime);
    this.setState({
      searchInterval: type
    });
  }
  handleRefreshTime = (refreshTime) => {
    this.setState({
      refreshTime
    });
  }
  renderDateRange = () => {
    return (
      <DateRange
        id='datetime'
        className='daterange'
        onChange={this.props.handleDateChange}
        onClick={this.hideTimeMenu}
        onFocus={this.hideTimeMenu}
        enableTime={true}
        value={this.props.datetime}
        t={et} />
    )
  }
  getTimeAndText = (type) => {
    let text = '';
    let time = '';

    switch(type) {
      case '15m':
        text = t('network.connections.txt-last15m');
        time = helper.getSubstractDate(15, 'minutes');
        break;
      case '30m':
        text = t('network.connections.txt-last30m');
        time = helper.getSubstractDate(30, 'minutes');
        break;
      case '1h':
        text = t('network.connections.txt-last1h');
        time = helper.getSubstractDate(1, 'hours');
        break;
      case '2h':
        text = t('network.connections.txt-last2h');
        time = helper.getSubstractDate(2, 'hours');
        break;
      case '12h':
        text = t('network.connections.txt-last12h');
        time = helper.getSubstractDate(12, 'hours');
        break;
      case '24h':
        text = t('network.connections.txt-last24h');
        time = helper.getSubstractDate(24, 'hours');
        break;
      case 'today':
        text = t('network.connections.txt-today');
        time = helper.getStartDate('day');
        break;
      case 'week':
        text = t('network.connections.txt-week');
        time = helper.getStartDate('week');
        break;
      case '15000':
        text = t('network.connections.txt-15s');
        break;
      case '30000':
        text = t('network.connections.txt-30s');
        break;
      case '60000':
        text = t('network.connections.txt-1m');
        break;
      case '300000':
        text = t('network.connections.txt-5m');
        break;
      case '600000':
        text = t('network.connections.txt-10m');
        break;
    }

    return {
      text,
      time
    }
  }
  render() {
    const {showFilter} = this.props;
    const {searchType, searchInterval, refreshTime, showManualMenu, showAutoMenu} = this.state;
    let dataObj = {};
    let searchManualText = '';
    let searchAutoText = '';

    if (searchType === 'manual') {
      dataObj = this.getTimeAndText(searchInterval);
      searchManualText = dataObj.text;
    } else if (searchType === 'auto') {
      dataObj = this.getTimeAndText(refreshTime);
      searchAutoText = t('txt-interval') + ': ' + dataObj.text;
    }

    return (
      <div style={{float: 'left'}}>
        <DropDownList
          className='search-type'
          list={[
            {value: 'manual', text: t('network.connections.txt-search-manual')},
            {value: 'auto', text: t('network.connections.txt-search-auto')}
          ]}
          required={true}
          onChange={this.handleSearchType}
          onClick={this.hideTimeMenu}
          value={searchType} />

        {searchType === 'manual' &&
          <div className='search-interval'>
            <Input
              className='time-interval'
              value={searchManualText}
              onClick={this.toggleTimeOptions}
              readOnly={true} />
            {showManualMenu &&
              <div className='interval-options' ref={this.setWrapperRef}>
                <label>{t('network.connections.txt-time-frame')}</label>
                <RadioGroup
                  id='timeInterval'
                  list={[
                    {value: '30m', text: t('network.connections.txt-last30m')},
                    {value: '1h', text: t('network.connections.txt-last1h')},
                    {value: '2h', text: t('network.connections.txt-last2h')},
                    {value: '24h', text: t('network.connections.txt-last24h')},
                    {value: 'today', text: t('network.connections.txt-today')},
                    {value: 'week', text: t('network.connections.txt-week')}
                  ]}
                  onChange={this.handleTimeframe}
                  value={searchInterval} />
              </div>
            }
          </div>
        }

        {searchType === 'auto' &&
          <div className='search-interval'>
            <Input
              className='time-interval'
              value={searchAutoText}
              onClick={this.toggleTimeOptions}
              readOnly={true} />
            {showAutoMenu &&
              <div className='interval-options' ref={this.setWrapperRef}>
                <label>{t('network.connections.txt-time-frame')}</label>
                <RadioGroup
                  id='timeInterval'
                  list={[
                    {value: '15m', text: t('network.connections.txt-last15m')},
                    {value: '30m', text: t('network.connections.txt-last30m')},
                    {value: '1h', text: t('network.connections.txt-last1h')},
                    {value: '12h', text: t('network.connections.txt-last12h')}
                  ]}
                  onChange={this.handleTimeframe}
                  value={searchInterval} />

                <label>{t('network.connections.txt-auto-update')}</label>
                <RadioGroup
                  id='updateInterval'
                  list={[
                    {value: '15000', text: t('network.connections.txt-15s')},
                    {value: '30000', text: t('network.connections.txt-30s')},
                    {value: '60000', text: t('network.connections.txt-1m')},
                    {value: '300000', text: t('network.connections.txt-5m')},
                    {value: '600000', text: t('network.connections.txt-10m')}
                  ]}
                  onChange={this.handleRefreshTime}
                  value={refreshTime} />
              </div>
            }
          </div>
        }
        
        <div className='datepicker'>
          <label htmlFor='datetime' className='datetime'></label>
          {this.renderDateRange()}
        </div>

        {!showFilter &&
          <button className='search-button' onClick={this.loadSearchOptions.bind(this, 'search')}>{t('network.connections.txt-toggleFilter')}</button>
        }
      </div>
    )
  }
}

SearchOptions.propTypes = {
};

const HocSearchOptions = withLocale(SearchOptions);
export { SearchOptions, HocSearchOptions };