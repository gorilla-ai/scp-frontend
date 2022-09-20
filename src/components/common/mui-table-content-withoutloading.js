import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'

import MUIDataTable from 'mui-datatables'

import helper from '../common/helper'

let t = null;

/**
 * MUI Table Content
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the MUI table content
 */
class MuiTableContentWithoutLoading extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tableData: {}
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  componentDidMount() {
    this.loadTableContent();
  }
  componentDidUpdate(prevProps) {
    this.loadTableContent(prevProps);
  }
  loadTableContent = (prevProps) => {
    const {data} = this.props;

    if (!prevProps || (prevProps && !_.isEqual(data.dataContent, prevProps.data.dataContent))) {
      this.setState({
        tableData: data
      });
    }
  }
  render() {
    const {data, tableOptions} = this.props;
    const {tableData} = this.state;
    const options = {
			tableBodyHeight: tableOptions.tableBodyHeight || '72vh',
      selectableRows: 'none',
      serverSide: true,
      search: false,
      filter: false,
      print: false,
      download: false,
      rowsPerPageOptions: [10, 20, 50, 100],
      jumpToPage: true,
      count: tableData.totalCount,
      rowsPerPage: tableData.pageSize,
      page: tableData.currentPage,
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
      <div className='mui-table-content'>
          <MUIDataTable
            className='mui-data-table'
            columns={tableData.dataFields}
            data={tableData.dataContent}
            options={options} />
      </div>
    )
  }
}

MuiTableContentWithoutLoading.propTypes = {
  data: PropTypes.object.isRequired,
  tableOptions: PropTypes.object.isRequired
};

export default MuiTableContentWithoutLoading;