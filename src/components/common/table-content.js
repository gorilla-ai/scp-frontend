import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import DataTable from 'react-ui/build/src/components/table'

import helper from '../common/helper'
import {HocPagination as Pagination} from './pagination'
import withLocale from '../../hoc/locale-provider'

class TableContent extends Component {
  constructor(props) {
    super(props);
  }
  handleRowClass = (allValue) => {
    const {currentTableID, tableUniqueID} = this.props;

    if (currentTableID && currentTableID === allValue[tableUniqueID]) {
      return 'table-row grey';
    }

    if (allValue.tag && allValue.tag.color) {
      return 'table-row ' + helper.showColor(allValue.tag.color);
    }
  }
  getTableHight = () => {
    const {tableHeight} = this.props;

    if (tableHeight) {
      return {
        height: tableHeight
      };
    }
  }
  render() {
    const {
      hideTable,
      withPointer,
      dataTableData,
      dataTableFields,
      dataTableSort,
      paginationOptions,
      paginationTotalCount,
      paginationPageSize,
      paginationCurrentPage
    } = this.props;

    return (
      <div className='table-content'>
        {!hideTable &&
          <div className='table' style={this.getTableHight()}>
            <DataTable
              className={cx('main-table', {'with-pointer': withPointer})}
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
            paginationOptions={paginationOptions}
            totalCount={paginationTotalCount}
            pageSize={paginationPageSize}
            currentPage={paginationCurrentPage}
            onPageChange={this.props.paginationPageChange}
            onDropDownChange={this.props.paginationDropDownChange} />
        </footer>
      </div>
    )
  }
}

TableContent.propTypes = {
  dataTableData: PropTypes.array.isRequired,
  dataTableFields: PropTypes.object.isRequired,
  dataTableSort: PropTypes.object.isRequired,
  paginationPageSize: PropTypes.number.isRequired,
  paginationCurrentPage: PropTypes.number.isRequired
};

export default TableContent;