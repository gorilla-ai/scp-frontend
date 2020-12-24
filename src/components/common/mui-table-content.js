import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import MUIDataTable from 'mui-datatables';

import helper from '../common/helper'

let t = null;

/**
 * MUI Table Content
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the MUI table content
 */
class MuiTableContent extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  render() {
    const {columns, data, tableOptions} = this.props;
    const options = {
			tableBodyHeight: '66vh',
      selectableRows: 'none',
      serverSide: true,
      search: false,
      filter: false,
      print: false,
      download: false,
      rowsPerPageOptions: [10, 20, 50, 100],
      jumpToPage: true,
      count: data.totalCount,
      rowsPerPage: data.pageSize,
      page: data.currentPage,
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
          jumpToPage: t('MuiDataTable.pagination.jumpToPage'),
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
        }
      },
			...tableOptions
    };

    return (
      <MUIDataTable
        className='mui-data-table'
        columns={data.dataFields}
        data={data.dataContent}
        options={options} />
    )
  }
}

MuiTableContent.propTypes = {
  data: PropTypes.object.isRequired,
  tableOptions: PropTypes.object.isRequired
};

export default MuiTableContent;