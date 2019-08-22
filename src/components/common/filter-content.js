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
    const {showFilter, queryData} = this.props;
    const filterTitle = queryData.displayName ? queryData.displayName : t('txt-filter');

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.props.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{filterTitle}</div>
        <div className='button-group'>
          <button className='open-query' onClick={this.props.openQuery.bind(this, 'open')}>{t('network.connections.txt-openQuery')}</button>
          <button className='save-query' onClick={this.props.openQuery.bind(this, 'save')}>{t('network.connections.txt-saveQuery')}</button>
        </div>
        <Filter
          inline={true}
          {...this.props} />
        <div className='button-group'>
          {this.getSubmitButton()}
          <button className='clear' onClick={this.props.handleResetBtn.bind(this, 'filter')}>{t('network.connections.txt-clear')}</button>
        </div>
      </div>
    )
  }
}

FilterContent.propTypes = {
};

const HocFilterContent = withLocale(FilterContent);
export { FilterContent, HocFilterContent };