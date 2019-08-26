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

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');

    this.state = {
      intervalModalOpen: false
    };
  }
  componentDidMount = () => {
    this.loadSearchOptions();
  }
  componentWillUnmount() {
    this.intervalId && clearInterval(this.intervalId);
    this.intervalId = null;
  }
  loadSearchOptions = (search) => {
    const {searchType, refreshTime} = this.props;

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
    const {searchInterval} = this.props;
    const dataObj = this.getTimeAndText(searchInterval);
    const datetime = {
      from: dataObj.time,
      to: Moment().local().format('YYYY-MM-DDTHH:mm') + ':00'
    };

    this.props.handleDateChange(datetime, 'refresh');
  }
  handleSearchTypeChange = (type) => {
    this.props.setSearchType(type);
    this.props.setSearchInterval('1h');
    this.props.setRefreshTime('600000');
    this.props.setSearchInputManual(t('network.connections.txt-last1h'));
    this.props.setSearchInputAuto(t('txt-interval') + ': ' + t('network.connections.txt-10m'));

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
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
  toggleIntervalDialog = () => {
    this.setState({
      intervalModalOpen: !this.state.intervalModalOpen
    });
  }
  displayIntervalOptions = () => {
    const {searchType, searchInterval, refreshTime} = this.props;

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
            onChange={this.props.setSearchInterval}
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
            onChange={this.props.setSearchInterval}
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
            onChange={this.props.setRefreshTime}
            value={refreshTime} />
        </div>
      )
    }
  }
  handleIntervalConfirm = () => {
    const {searchType, searchInterval, refreshTime} = this.props;
    let dataObj = this.getTimeAndText(searchInterval);
    let searchInputManual = '';
    let searchInputAuto = '';

    this.props.handleDateChange({
      from: dataObj.time,
      to: Moment().local().format('YYYY-MM-DDTHH:mm') + ':00Z'
    });

    if (searchType === 'manual') {
      searchInputManual = dataObj.text;
    } else if (searchType === 'auto') {
      dataObj = this.getTimeAndText(refreshTime);
      searchInputAuto = t('txt-interval') + ': ' + dataObj.text;
    }

    this.props.setSearchInputManual(searchInputManual);
    this.props.setSearchInputAuto(searchInputAuto);
    this.toggleIntervalDialog();
  }
  intervalModalDialog = () => {
    const {activeTab} = this.state;
    const actions = {
      confirm: {text: t('txt-close'), handler: this.handleIntervalConfirm}
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
    const {page, showFilter, searchType, searchInputManual, searchInputAuto} = this.props;
    const {intervalModalOpen} = this.state;
    const searchStyle = page === 'syslog' ? '226px' : '180px';
    let searchInputValue = '';

    if (searchType === 'manual') {
      searchInputValue = searchInputManual;
    } else if (searchType === 'auto') {
      searchInputValue = searchInputAuto;
    }

    return (
      <div className='search-options' style={{right: searchStyle}}>
        {intervalModalOpen &&
          this.intervalModalDialog()
        }

        <DropDownList
          className='search-type'
          list={[
            {value: 'manual', text: t('network.connections.txt-search-manual')},
            {value: 'auto', text: t('network.connections.txt-search-auto')}
          ]}
          required={true}
          onChange={this.handleSearchTypeChange}
          value={searchType} />

        <div className='search-interval'>
          <input className='time-interval' value={searchInputValue} onClick={this.toggleIntervalDialog.bind(this)} readOnly />
        </div>
        
        <div className='datepicker'>
          <label htmlFor='datetime' className='datetime'></label>
          {this.renderDateRange()}
        </div>

        <button className='search-button' onClick={this.loadSearchOptions.bind(this, 'search')} disabled={showFilter}>{t('network.connections.txt-toggleFilter')}</button>
      </div>
    )
  }
}

SearchOptions.propTypes = {
};

const HocSearchOptions = withLocale(SearchOptions);
export { SearchOptions, HocSearchOptions };