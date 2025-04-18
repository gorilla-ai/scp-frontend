import React, { Component } from 'react'
import PropTypes from 'prop-types'

import DropDownList from 'react-ui/build/src/components/dropdown'
import PageNav from 'react-ui/build/src/components/page-nav'

import helper from '../common/helper'

let t = null;

/**
 * Pagination
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
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
    const allowedTotalCount = totalCount <= 10000 ? totalCount : 10000;
    const pages = Math.ceil(allowedTotalCount / pageSize);

    return (
      <div className='c-flex jcc page-nav'>
        {totalCount > 0 &&
          <PageNav
            pages={pages}
            current={currentPage}
            onChange={this.props.onPageChange} />
        }

        {totalCount > 10000 && currentPage === pages &&
          <div className='c-info'>{t('txt-es-data-over-limit')}</div>
        }

        {totalCount > 0 &&
          <div>
            <div className='pagination dropdown-margin'>
              <label htmlFor='pageSize'>{t('txt-pageSize')}</label>
              <DropDownList
                className='page-size'
                list={paginationOptions || defaultPaginationOptions}
                required={true}
                value={pageSize}
                onChange={this.props.onDropDownChange} />
            </div>

            <div className='total-count'>{t('txt-totalCount')}: {helper.numberWithCommas(totalCount)}</div>
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

export default Pagination;