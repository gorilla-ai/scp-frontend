import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import Filter from './filter'

import withLocale from '../../hoc/locale-provider'

let t = null;

class FilterContent extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  getSubmitButton = () => {
    const {activeTab} = this.props;

    if (activeTab !== 'logs') {
      return (
        <button className='filter' onClick={this.props.handleSearchSubmit.bind(this, 'search')}>{t('txt-filter')}</button>
      )
    }
  }
  render() {
    const {activeTab, showFilter, queryData} = this.props;
    let filterTitle = t('txt-filter');

    if (queryData && queryData.displayName) {
      filterTitle = queryData.displayName;
    }

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.props.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{filterTitle}</div>
        {activeTab !== 'config' &&
          <div className='button-group open-query'>
            <button className='open-query' onClick={this.props.openQuery.bind(this, 'open')}>{t('network.connections.txt-openQuery')}</button>
            <button className='save-query' onClick={this.props.openQuery.bind(this, 'save')}>{t('network.connections.txt-saveQuery')}</button>
          </div>
        }
        <Filter
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
  toggleFilter: PropTypes.func.isRequired,
  handleResetBtn: PropTypes.func.isRequired
};

const HocFilterContent = withLocale(FilterContent);
export { FilterContent, HocFilterContent };