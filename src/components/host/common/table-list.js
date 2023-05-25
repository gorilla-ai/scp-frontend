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

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

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

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
  }
  render() {
    const {page, searchType, search, data, options, tableAnchor, exportAnchor, cveSeverityLevel, monthlySeverityTrend} = this.props;
    let headerTitle = '';
    let searchLabel = '';

    if (page === 'dashboard') {
      headerTitle = t('host.dashboard.txt-vulnerabilityList');
      searchLabel = t('host.dashboard.txt-cveName');
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
            <Button variant='outlined' color='primary'><Link to='/SCP/host'>{t('host.txt-hostList')}</Link></Button>
          </div>
        </div>

        <div className='data-content'>
          <div className='parent-content'>
            {page === 'dashboard' &&
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
                <Button variant='outlined' color='primary' className='standard btn' onClick={this.props.toggleFilterQuery}>{t('txt-filterQuery')}</Button>
                {page === 'dashboard' &&
                  <React.Fragment>
                    <Button variant='outlined' color='primary' className='standard btn' onClick={this.props.exportList}>{t('txt-export')}</Button>
                  </React.Fragment>
                }
                {page === 'inventory' &&
                  <React.Fragment>
                    <Button variant='outlined' color='primary' className='standard btn' onClick={this.props.handleExportMenu}>{t('txt-export')}</Button>
                  </React.Fragment>
                }
                {page === 'kbid' &&
                  <React.Fragment>
                    <Button variant='outlined' color='primary' className='standard btn' onClick={this.props.exportList}>{t('txt-export')}</Button>
                    <Button variant='outlined' color='primary' className='standard btn' onClick={this.props.toggleReport}>{t('host.txt-report-kbid')}</Button>
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
                  <Button variant='contained' color='primary' className='search-btn' onClick={this.props.getData}>{t('txt-search')}</Button>
                  <Button variant='outlined' color='primary' className='standard btn clear' onClick={this.props.handleReset.bind(this, searchType)}>{t('txt-clear')}</Button>
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
};

export default TableList;