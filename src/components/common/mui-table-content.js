import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import { createTheme, MuiThemeProvider } from '@material-ui/core/styles'

import MUIDataTable from 'mui-datatables'

import helper from '../common/helper'

let t = null;

/**
 * MUI Table Content
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the MUI table content
 */
class MuiTableContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reload: null
    }
    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  componentDidMount() {
    this._isMounted = true;

    const resizeObserver = new ResizeObserver((entries) => {
      if (this._isMounted)
        this.setState({reload: new Date().getTime()});
    });
    if (this.container)
      resizeObserver.observe(this.container);
  }
  componentWillUnmount() {
    this._isMounted = false;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
  /**
   * Get set table height to auto
   * @method
   * @returns CSS property object
   */
  getTableHeight = () => {
    const {tableHeight} = this.props;

    if (tableHeight === 'auto') {
      return { height: 'auto' };
    } else {
      return { height: '78vh' };
    }
  }
  render() {
    const {data, tableOptions, showLoading, resizableColumns, expandableRows} = this.props;
    const options = {
      tableBodyHeight: tableOptions.tableBodyHeight || '72vh',
      selectableRows: 'none',
      serverSide: true,
      search: false,
      filter: false,
      viewColumns: true,
      print: false,
      download: false,
      rowsPerPageOptions: [10, 20, 50, 100],
      jumpToPage: true,
      count: data.totalCount,
      rowsPerPage: data.pageSize,
      page: data.currentPage,
      draggableColumns: {
        enabled: true
      },
      resizableColumns: resizableColumns,
      expandableRows: expandableRows,
      textLabels: {
        body: {
          noMatch: t('MuiDataTable.body.noMatch'),
          toolTip: t('MuiDataTable.body.toolTip')
        },
        pagination: {
          next: t('MuiDataTable.pagination.next'),
          previous: t('MuiDataTable.pagination.previous'),
          rowsPerPage: t('MuiDataTable.pagination.rowsPerPage'),
          displayRows: t('MuiDataTable.pagination.displayRows'),
          jumpToPage: t('MuiDataTable.pagination.jumpToPage')
        },
        toolbar: {
          search: t('MuiDataTable.toolbar.search'),
          downloadCsv: t('MuiDataTable.toolbar.downloadCsv'),
          print: t('MuiDataTable.toolbar.print'),
          viewColumns: t('MuiDataTable.toolbar.viewColumns'),
          filterTable: t('MuiDataTable.toolbar.filterTable')
        },
        viewColumns: {
          title: t('MuiDataTable.viewColumns.title'),
          titleAria: t('MuiDataTable.viewColumns.titleAria')
        },
        selectedRows: {
          text: t('MuiDataTable.selectedRows.text'),
          delete: t('MuiDataTable.selectedRows.delete'),
          deleteAria: t('MuiDataTable.selectedRows.deleteAria')
        }
      },
      ...tableOptions
    };
    const loadingIcon = showLoading === true ? true : false;

    return (
      <div ref={ref => {this.container = ref}} className='mui-table-content' style={this.getTableHeight()}>
        {loadingIcon && !data.dataContent &&
          <span className='loading'><i className='fg fg-loading-2'></i></span>
        }
        {data.dataContent && data.dataContent.length === 0 &&
          <div className='no-result'>{t('txt-notFound')}</div>
        }
        {data.dataContent && data.dataContent.length > 0 &&
          <MUIDataTable
            className='mui-data-table'
            columns={data.dataFields}
            data={data.dataContent}
            options={options} />
        }
      </div>
    )
  }
}

MuiTableContent.defaultProps = {
  resizableColumns: true,
  expandableRows: false
};

MuiTableContent.propTypes = {
  data: PropTypes.object.isRequired,
  tableOptions: PropTypes.object.isRequired,
  tableHeight: PropTypes.string,
  showLoading: PropTypes.bool,
  resizableColumns: PropTypes.bool,
  expandableRows: PropTypes.bool
};

export default MuiTableContent;