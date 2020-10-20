import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import MUIDataTable from 'mui-datatables';

import helper from '../common/helper'

/**
 * MUI Table Content
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the MUI table content
 */
class MuiTableContent extends Component {
  constructor(props) {
    super(props);
  }
  ryan = () => {

  }
  getMuiTheme = () => createMuiTheme({
    overrides: {
      MuiTableCell: {
        head: {
          fontWeight: 'bold',
          fontSize: '1em'
        },
      },
      MuiTableRow: {
				root: {
				  '&:nth-of-type(odd)': {
				    backgroundColor: '#f5f5f5'
				  },
				  '&:nth-of-type(even)': {
				    backgroundColor: '#fff'
				  }
				},
        hover: {
          '&:hover': {
						backgroundColor: '#e2ecfd !important'
          }
        }
      }
    }
  })
  render() {
    const {columns, data, options} = this.props;

    return (
    	<MuiThemeProvider theme={this.getMuiTheme()}>
				<MUIDataTable
					columns={columns}
					data={data}
					options={options} />
      </MuiThemeProvider>
    )
  }
}

MuiTableContent.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  options: PropTypes.object.isRequired
};

export default MuiTableContent;