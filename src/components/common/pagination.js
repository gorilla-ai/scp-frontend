import React, { Component } from 'react'
import PropTypes from 'prop-types'

import DropDownList from 'react-ui/build/src/components/dropdown'
import PageNav from 'react-ui/build/src/components/page-nav'

let t = null;

/**
 * Pagination
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the pagination
 */
class Pagination extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  render() {
    const {paginationOptions, totalCount, pageSize, currentPage} = this.props;
    const defaultPaginationOptions = [
      {value: 10, text: '10'},
      {value: 20, text: '20'},
      {value: 50, text: '50'},
      {value: 100, text: '100'},
      {value: 500, text: '500'},
      {value: 1000, text: '1000'}
    ];

    return (
      <div className='c-flex jcc'>
        {totalCount > 0 &&
          <PageNav
            pages={Math.ceil(totalCount / pageSize)}
            current={currentPage}
            onChange={this.props.onPageChange} />
        }

        {totalCount > 0 &&
          <div className='pagination dropdown-margin'>
            <label htmlFor='pageSize'>{t('txt-pageSize')}</label>
            <DropDownList
              id='pageSize'
              list={paginationOptions || defaultPaginationOptions}
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
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onDropDownChange: PropTypes.func.isRequired
};

const HocPagination = Pagination;
export { Pagination, HocPagination };