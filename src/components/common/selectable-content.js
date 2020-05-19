import React, {Component} from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import DataTable from 'react-ui/build/src/components/table'

import helper from '../common/helper'
import Pagination from './pagination'

/**
 * Table Content
 * @class
 * @author Kenneth Chiao <kennethchiao@ns-guard.com>
 * @summary A react component to show the table content
 */
class SelecTableContent extends Component {
    constructor(props) {
        super(props);
    }

    /**
     * Get row class name
     * @method
     * @param {object} allValue - data value in the table
     * @returns class name
     */
    handleRowClass = (allValue) => {
        const {currentTableID, tableUniqueID} = this.props;

        if (currentTableID && currentTableID === allValue[tableUniqueID]) {
            return 'table-row grey';
        }

        if (allValue.tag && allValue.tag.color) {
            return 'table-row ' + helper.showColor(allValue.tag.color);
        }
    }
    /**
     * Get table height
     * @method
     * @returns object with height value
     */
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
            projectID,
            checkProjectID,
            hideTable,
            withPointer,
            dataTableData,
            dataTableFields,
            dataTableSort,
            paginationOptions,
            paginationTotalCount,
            paginationPageSize,
            paginationCurrentPage,

        } = this.props;

        return (
            <div className='table-content'>
                {!hideTable &&
                <div className='table' style={this.getTableHight()}>
                    {((checkProjectID && projectID && !dataTableData) || (!checkProjectID && !dataTableData)) &&
                    <span className='loading'><i className='fg fg-loading-2'/></span>
                    }

                    {dataTableData && dataTableData.length > 0 &&
                    <DataTable
                        className={cx('main-table', {'with-pointer': withPointer})}
                        fields={dataTableFields}
                        data={dataTableData}
                        rowClassName={this.handleRowClass}
                        sort={dataTableData.length === 0 ? {} : dataTableSort}
                        onSort={this.props.handleTableSort}
                        onRowMouseOver={this.props.handleRowMouseOver}
                        onRowMouseOut={this.props.handleRowMouseOut}
                        onRowDoubleClick={this.props.handleRowDoubleClick}/>
                    }
                </div>
                }
                <footer>
                    {dataTableData && dataTableData.length > 0 &&
                    <Pagination
                        paginationOptions={paginationOptions}
                        totalCount={paginationTotalCount}
                        pageSize={paginationPageSize}
                        currentPage={paginationCurrentPage}
                        onPageChange={this.props.paginationPageChange}
                        onDropDownChange={this.props.paginationDropDownChange}/>
                    }
                </footer>
            </div>
        )
    }
}

SelecTableContent.propTypes = {
    dataTableFields: PropTypes.object.isRequired,
    dataTableSort: PropTypes.object.isRequired,
    paginationPageSize: PropTypes.number.isRequired,
    paginationCurrentPage: PropTypes.number.isRequired
};

export default SelecTableContent;