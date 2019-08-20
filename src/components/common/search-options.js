import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import DateRange from 'react-ui/build/src/components/date-range'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
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
      modalOpen: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
  }
  componentDidMount = () => {
    this.loadSearchOptions();
  }
  componentWillUnmount() {
    this.intervalId && clearInterval(this.intervalId);
    this.intervalId = null;
  }
  loadSearchOptions = (search) => {
    const {searchType, refreshTime} = this.state;

    if (search) {
      this.props.handleSearchSubmit('search');
    }

    if (searchType === 'auto') {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      this.intervalId = setInterval(this.setNewDatetime, Number(refreshTime));
    }
  }
  setNewDatetime = () => {
    const {searchInterval} = this.state;
    const dataObj = this.getTimeAndText(searchInterval);
    const datetime = {
      from: dataObj.time,
      to: Moment().local().format('YYYY-MM-DDTHH:mm') + ':00'
    };

    this.props.handleDateChange(datetime, 'refresh');
  }
  setWrapperRef = (node) => {
    this.wrapperRef = node;
  }
  handleSearchType = (type) => {
    this.setState({
      searchType: type,
      searchInterval: '1h',
      refreshTime: '600000'
    }, () => {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    });
  }
  handleTimeframe = (type) => {
    let tempDatetime = {...this.state.datetime};
    const dataObj = this.getTimeAndText(type);
    tempDatetime.to = Moment().local().format('YYYY-MM-DDTHH:mm') + ':00Z';
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
  toggleTimeOptions = () => {
    this.setState({
      modalOpen: !this.state.modalOpen
    });
  }
  displayIntervalOptions = () => {
    const {searchType, searchInterval, refreshTime} = this.state;

    if (searchType === 'manual') {
      return (
        <div className='interval-options manual'>
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
      )
    } else if (searchType === 'auto') {
      return (
        <div className='interval-options auto'>
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
      )
    }
  }
  modalDialog = () => {
    const {activeTab} = this.state;
    const actions = {
      confirm: {text: t('txt-confirm'), handler: this.toggleTimeOptions}
    };
    const titleText = t('network.connections.txt-time-frame');

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
  render() {
    const {showFilter} = this.props;
    const {searchType, searchInterval, refreshTime, modalOpen} = this.state;
    let dataObj = {};
    let searchInputValue = '';

    if (searchType === 'manual') {
      dataObj = this.getTimeAndText(searchInterval);
      searchInputValue = dataObj.text;
    } else if (searchType === 'auto') {
      dataObj = this.getTimeAndText(refreshTime);
      searchInputValue = t('txt-interval') + ': ' + dataObj.text;
    }

    return (
      <div style={{float: 'left'}}>
        {modalOpen &&
          this.modalDialog()
        }

        <DropDownList
          className='search-type'
          list={[
            {value: 'manual', text: t('network.connections.txt-search-manual')},
            {value: 'auto', text: t('network.connections.txt-search-auto')}
          ]}
          required={true}
          onChange={this.handleSearchType}
          value={searchType} />

        <div className='search-interval'>
          <input className='time-interval' value={searchInputValue} onClick={this.toggleTimeOptions.bind(this)} readOnly />
        </div>
        
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