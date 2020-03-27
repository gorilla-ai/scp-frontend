import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import FilterInput from './filter-input'

let t = null;

/**
 * Filter Content
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the filter menu content
 */
class FilterContent extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Display the filter button
   * @method
   * @returns HTML DOM
   */
  getSubmitButton = () => {
    const {activeTab} = this.props;

    if (activeTab !== 'logs') { //Don't show the button for Logs page
      return <button className='filter' onClick={this.props.handleSearchSubmit.bind(this, 'search')}>{t('txt-filter')}</button>
    }
  }
  /**
   * Toggle filter/mark content on/off
   * @method
   */
  toggleFilter = () => {
    const {activeTab} = this.props;

    if (activeTab === 'logs') {
      this.props.toggleMark();
    } else {
      this.props.toggleFilter();
    }
  }
  render() {
    const {showFilter, queryData} = this.props;
    let filterTitle = t('txt-filter');

    if (queryData && queryData.displayName) {
      filterTitle = queryData.displayName;
    }

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{filterTitle}</div>
        <div className='button-group open-query'>
          <button className='open-query' onClick={this.props.openQuery.bind(this, 'open')}>{t('events.connections.txt-openQuery')}</button>
          <button className='save-query' onClick={this.props.openQuery.bind(this, 'save')}>{t('events.connections.txt-saveQuery')}</button>
        </div>
        <FilterInput
          inline={true}
          {...this.props} />
        <div className='button-group'>
          {this.getSubmitButton()}
          <button className='clear' onClick={this.props.handleResetBtn.bind(this, 'filter')}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
}

FilterContent.propTypes = {
  showFilter: PropTypes.bool.isRequired,
  handleSearchSubmit: PropTypes.func.isRequired,
  handleResetBtn: PropTypes.func.isRequired
};

export default FilterContent;