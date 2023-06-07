import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'
import MuiTableContent from '../../common/mui-table-content'

let t = null;
let f = null;

/**
 * Host table list component
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the table list
 */
class TableList extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
  }
  componentDidMount() {
  }
  render() {
    const {page, searchType, search, data, options, tableAnchor, exportAnchor, cveSeverityLevel, monthlySeverityTrend} = this.props;
    let headerTitle = '';
    let searchLabel = '';

    if (page === 'vulnerabilities') {
      headerTitle = t('host.vulnerabilities.txt-vulnerabilityList');
      searchLabel = t('host.vulnerabilities.txt-cveName');
    } else if (page === 'inventory') {
      headerTitle = t('host.inventory.txt-orgSoftwareList');
      searchLabel = t('host.inventory.txt-applicationName');
    } else if (page === 'kbid') {
      headerTitle = t('host.txt-kbid');
      searchLabel = t('host.txt-kbidName');
    }

    return (
      <div>
        <Menu
          anchorEl={tableAnchor}
          keepMounted
          open={Boolean(tableAnchor)}
          onClose={this.props.handleCloseMenu}>
          <MenuItem onClick={this.props.getActiveData.bind(this, 'open')}>{t('txt-view')}</MenuItem>
        </Menu>

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button id='hostVulnerabilities' variant='outlined' color='primary'><Link to='/SCP/host/vulnerabilities'>{t('host.txt-vulnerabilities')}</Link></Button>
            <Button id='hostInventory' variant='outlined' color='primary'><Link to='/SCP/host/inventory'>{t('host.txt-inventory')}</Link></Button>
            <Button id='hostKbid' variant='outlined' color='primary'><Link to='/SCP/host/kbid'>{t('host.txt-kbid')}</Link></Button>

            <Button id='hostIndex' variant='outlined' color='primary'><Link to='/SCP/host'>{t('host.txt-hostList')}</Link></Button>
          </div>
        </div>

        <div className='data-content'>
          <div className='parent-content'>
            {page === 'vulnerabilities' &&
              <div className='main-statistics host'>
                <div className='statistics-content'>
                  {this.props.showPieChart(cveSeverityLevel.data)}
                  {this.props.showBarChart(monthlySeverityTrend)}
                </div>
              </div>
            }

            <div className='main-content'>
              <header className='main-header'>{headerTitle}</header>
              <div className='content-header-btns with-menu'>
                {page === 'inventory' &&
                  <Menu
                    anchorEl={exportAnchor}
                    keepMounted
                    open={Boolean(exportAnchor)}
                    onClose={this.props.handleCloseMenu}>
                    <MenuItem onClick={this.props.exportList.bind(this, 'cpe')}>{t('host.inventory.txt-inventoryList')}</MenuItem>
                    <MenuItem onClick={this.props.exportList.bind(this, 'nccst')}>NCCST</MenuItem>
                  </Menu>
                }
                <Button id='hostFilterQuery' variant='outlined' color='primary' className='standard btn' onClick={this.props.toggleFilterQuery.bind(this, 'open')}>{t('txt-filterQuery')}</Button>
                {page === 'vulnerabilities' &&
                  <React.Fragment>
                    <Button id='hostExportList' variant='outlined' color='primary' className='standard btn' onClick={this.props.exportList}>{t('txt-export')}</Button>
                  </React.Fragment>
                }
                {page === 'inventory' &&
                  <React.Fragment>
                    <Button id='hostExportMenu' variant='outlined' color='primary' className='standard btn' onClick={this.props.handleExportMenu}>{t('txt-export')}</Button>
                  </React.Fragment>
                }
                {page === 'kbid' &&
                  <React.Fragment>
                    <Button id='hostExportList' variant='outlined' color='primary' className='standard btn' onClick={this.props.exportList}>{t('txt-export')}</Button>
                    <Button id='hostToggleReport' variant='outlined' color='primary' className='standard btn' onClick={this.props.toggleReport}>{t('host.txt-report-kbid')}</Button>
                  </React.Fragment>
                }
              </div>

              <div className='actions-bar'>
                <div className='search-field'>
                  <div className='group'>
                    <TextField
                      name='search'
                      className='search-text'
                      label={searchLabel}
                      variant='outlined'
                      size='small'
                      value={search.keyword}
                      onChange={this.props.handleSearch} />
                  </div>
                  <Button id='hostSearchData' variant='contained' color='primary' className='search-btn' onClick={this.props.getData}>{t('txt-search')}</Button>
                  <Button id='hostClearData' variant='outlined' color='primary' className='standard btn clear' onClick={this.props.handleReset.bind(this, searchType)}>{t('txt-clear')}</Button>
                </div>

                <div className='search-count'>{t('host.inventory.txt-softwareCount') + ': ' + helper.numberWithCommas(search.count)}</div>
              </div>

              <MuiTableContent
                data={data}
                tableOptions={options} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

TableList.contextType = BaseDataContext;

TableList.propTypes = {
  page: PropTypes.string.isRequired,
  searchType: PropTypes.string.isRequired,
  search: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  tableAnchor: PropTypes.string.isRequired,
  exportAnchor: PropTypes.string,
  cveSeverityLevel: PropTypes.object,
  monthlySeverityTrend: PropTypes.array,
  getData: PropTypes.func.isRequired,
  getActiveData: PropTypes.func.isRequired,
  exportList: PropTypes.func.isRequired,
  toggleFilterQuery: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  handleCloseMenu: PropTypes.func.isRequired,
  showPieChart: PropTypes.func,
  showBarChart: PropTypes.func,
  toggleReport: PropTypes.func
};

export default TableList;