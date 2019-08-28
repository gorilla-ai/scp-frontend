import React, { Component } from 'react'
import PropTypes from 'prop-types'

import DropDownList from 'react-ui/build/src/components/dropdown'
import PageNav from 'react-ui/build/src/components/page-nav'

import withLocale from '../../hoc/locale-provider'

let t = null;

class Pagination extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  getPaginationOptions() {
    const {activeTab, page, displayImgType} = this.props;

    let paginationOptions = [
      {value: 10, text: '10'},
      {value: 20, text: '20'},
      {value: 50, text: '50'},
      {value: 100, text: '100'},
      {value: 500, text: '500'},
      {value: 1000, text: '1000'}
    ];

    if (page === 'linkAnalysis' || page === 'worldMap') {
      paginationOptions = [
        {value: 500, text: '500'},
        {value: 1000, text: '1000'},
        {value: 2000, text: '2000'},
        {value: 5000, text: '5000'}
      ];
    }

    if (activeTab === 'file' && displayImgType === 'grid') {
      paginationOptions = [
        {value: 50, text: '50'},
        {value: 100, text: '100'},
        {value: 150, text: '150'},
        {value: 200, text: '200'},
        {value: 300, text: '300'}
      ];
    }

    return paginationOptions;
  }
  render() {
    const {totalCount, pageSize, currentPage} = this.props;

    return (
      <div className='c-flex jcc'>
        {totalCount > 0 &&
          <PageNav
            pages={Math.ceil(totalCount / pageSize)}
            current={currentPage}
            onChange={this.props.onPageChange} />
        }

        {totalCount > 0 &&
          <div className='pure-control-group dropdown-margin pagination'>
            <label htmlFor='pageSize'>{t('txt-pageSize')}</label>
            <DropDownList
              id='pageSize'
              list={this.getPaginationOptions()}
              required={true}
              onChange={this.props.onDropDownChange}
              value={pageSize} />
          </div>
        }
      </div>
    )
  }
}

Pagination.propTypes = {
  pageSize: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  currentPage: PropTypes.number.isRequired
};

const HocPagination = withLocale(Pagination);
export { Pagination, HocPagination };