import React, { Component } from 'react'
import PropTypes from 'prop-types'

import DataTable from 'react-ui/build/src/components/table'

import helper from '../common/helper'
import {HocPagination as Pagination} from './pagination'
import withLocale from '../../hoc/locale-provider'

class TableContent extends Component {
  constructor(props) {
    super(props);
  }
  handleRowClass = (allValue) => {
    const {currentTableID} = this.props;

    if (currentTableID && currentTableID === allValue.id) {
     return 'table-row grey';
    }

    if (allValue.tag && allValue.tag.color) {
      return 'table-row ' + helper.showColor(allValue.tag.color);
    }
  }
  render() {
    const {
      activeTab,
      filterStyle,
      displayImgType,
      dataTableData,
      dataTableFields,
      dataTableSort,
      paginationTotalCount,
      paginationPageSize,
      paginationCurrentPage
    } = this.props;

    return (
      <div>
        <div className='table'>
          {(activeTab !== 'file' || (activeTab === 'file' && displayImgType === 'list')) &&
            <div className='filter-table'>
              <DataTable
                className='main-table main'
                fields={dataTableFields}
                data={dataTableData}
                rowClassName={this.handleRowClass}
                sort={dataTableData.length === 0 ? {} : dataTableSort}
                onSort={this.props.handleTableSort}
                onRowMouseOver={this.props.handleRowMouseOver}
                onRowMouseOut={this.props.handleRowMouseOut}
                onRowDoubleClick={this.props.handleRowDoubleClick} />
            </div>
          }
          <footer>
            <Pagination
              activeTab={activeTab}
              displayImgType={displayImgType}
              totalCount={paginationTotalCount}
              pageSize={paginationPageSize}
              currentPage={paginationCurrentPage}
              onPageChange={this.props.paginationPageChange}
              onDropDownChange={this.props.paginationDropDownChange} />
          </footer>
        </div>
      </div>
    )
  }
}

TableContent.propTypes = {
};

export default TableContent;