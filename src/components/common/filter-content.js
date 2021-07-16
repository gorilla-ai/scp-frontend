import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import Button from '@material-ui/core/Button'

import {BaseDataContext} from './context'
import FilterInput from './filter-input'

let t = null;

/**
 * Filter Content
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
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
      return <Button id='confirmQueryBtn' variant='contained' color='primary' className='filter' onClick={this.props.handleSearchSubmit.bind(this, 'search')}>{t('txt-filter')}</Button>
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
    const {sessionRights} = this.context;
    const {showFilter, queryModalType, queryData, queryDataPublic} = this.props;
    let filterTitle = t('txt-filter');

    if (queryModalType === 'open' && queryData && queryData.displayName) {
      filterTitle = queryData.displayName;
    }

    if (queryModalType === 'publicOpen' && queryDataPublic && queryDataPublic.displayName) {
      filterTitle = queryDataPublic.displayName;
    }

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i id='queryCloseBtn' className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div id='queryHeaderText' className='header-text'>{filterTitle}</div>
        {this.props.openQuery &&
          <div className='button-group open-query'>
            <Button id='openQueryBtn' variant='outlined' color='primary' className='open-query' onClick={this.props.openQuery.bind(this, 'open')}>{t('events.connections.txt-openQuery')}</Button>
            <Button id='saveQueryBtn' variant='outlined' color='primary' className='save-query' onClick={this.props.openQuery.bind(this, 'save')}>{t('events.connections.txt-saveQuery')}</Button>
            <Button id='publicOpenQuery' variant='outlined' color='primary' className='save-query' onClick={this.props.openQuery.bind(this, 'publicOpen')}>{t('events.connections.txt-publicOpenQuery')}</Button>
            {sessionRights.Module_Config &&
              <Button id='publicSaveQuery' variant='outlined' color='primary' className='save-query' onClick={this.props.openQuery.bind(this, 'publicSave')}>{t('events.connections.txt-publicSaveQuery')}</Button>
            }
          </div>
        }
        <FilterInput
          inline={true}
          {...this.props} />
        <div className='button-group'>
          {this.getSubmitButton()}
          <Button id='clearQueryBtn' variant='outlined' color='primary' className='clear' onClick={this.props.handleResetBtn.bind(this, 'filter')}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
}

FilterContent.contextType = BaseDataContext;

FilterContent.propTypes = {
  activeTab: PropTypes.string.isRequired,
  showFilter: PropTypes.bool.isRequired,
  handleSearchSubmit: PropTypes.func.isRequired,
  handleResetBtn: PropTypes.func.isRequired,
  filterData: PropTypes.array,
  setFilterData: PropTypes.func,
  toggleFilter: PropTypes.func
};

export default FilterContent;