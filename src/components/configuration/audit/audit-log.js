import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { NavLink, Link, Switch, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import MUIDataTable from 'mui-datatables';

import TablePagination from '@material-ui/core/TablePagination';

import DropDownList from 'react-ui/build/src/components/dropdown'
import PageNav from 'react-ui/build/src/components/page-nav'

import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import helper from '../../common/helper'
import MuiTableContent from '../../common/mui-table-content'
import Pagination from '../../common/pagination'
import SearchOptions from '../../common/search-options'
import TableContent from '../../common/table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

/**
 * Audit Log
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Audit Log page
 */
class AuditLog extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      showFilter: false,
      datetime: {
        from: helper.getSubstractDate(1, 'month'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
      },
      auditSearch: {
        keyword: ''
      },
      audit: {
        dataFieldsArr: ['createDttm', 'message'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'createDttm',
          desc: true
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        info: {}
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getAuditData('search');
  }
  /**
   * Get and set ES table data
   * @method
   * @param {string} fromSearch - option for the 'search'
   */
  getAuditData = (fromSearch) => {
    const {baseUrl} = this.context;
    const {datetime, auditSearch, audit} = this.state;
    const page = fromSearch === 'search' ? 1 : audit.currentPage;
    const url = `${baseUrl}/api/auditLog/system?page=${page}&pageSize=${audit.pageSize}`;
    const dateTime = {
      from: Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    let requestData = {
      startDttm: dateTime.from,
      endDttm: dateTime.to
    };

    if (auditSearch.keyword) {
      requestData.keyword = auditSearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempAudit = {...audit};
        let auditData = [];
        tempAudit.totalCount = data.counts;
        tempAudit.currentPage = page;
        tempAudit.dataContent = _.map(data.rows, val => {
          return {
            createDttm: val.content.createDttm,
            message: val.content.message
          };
        })

        if (!data.rows || data.rows.length === 0) {
          helper.showPopupMsg(t('txt-notFound'));
          return;
        }

        tempAudit.dataFields = _.map(audit.dataFieldsArr, val => {
          return {
            name: val,
            label: f('auditFields.' + val),
            options: {
              filter: true,
              sort: false,
              customBodyRender: (value) => {
                if (val === 'createDttm') {
                  return helper.getFormattedDate(value, 'local');
                } else {
                  return value;
                }
              }
            }
          };
        });

        this.setState({
          audit: tempAudit
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle table sort
   * @method
   * @param {object} sort - sort data object
   */
  handleTableSort = (sort) => {
    let tempAudit = {...this.state.audit};
    tempAudit.sort.field = sort.field;
    tempAudit.sort.desc = sort.desc;

    this.setState({
      audit: tempAudit
    }, () => {
      this.getAuditData();
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {object} event - event
   * @param {number} page - new page number
   */
  handlePaginationChange = (type, event, page) => {
    let tempAudit = {...this.state.audit};
    
    if (type === 'currentPage') {
      tempAudit[type] = Number(page);
    } else if (type === 'pageSize') {
      tempAudit[type] = event.target.value;
      tempAudit.currentPage = 1;
    }

    this.setState({
      audit: tempAudit
    }, () => {
      this.getAuditData();
    });
  }
  /**
   * Toggle filter content on/off
   * @method
   */
  toggleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter
    });
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - input type
   * @param {string | object} value - input value
   */
  handleAuditSearch = (type, value) => {
    let tempAuditSearch = {...this.state.auditSearch};

    if (type === 'keyword') { //value is an object type
      tempAuditSearch[type] = value.target.value.trim();
    }

    this.setState({
      auditSearch: tempAuditSearch
    });
  }
  /**
   * Set new datetime
   * @method
   * @param {object} datetime - new datetime object
   */
  handleDateChange = (datetime) => {
    this.setState({
      datetime
    });
  }
  /**
   * Handle search submit
   * @method
   */
  handleSearchSubmit = () => {
    let tempAudit = {...this.state.audit};
    tempAudit.dataContent = [];
    tempAudit.totalCount = 0;
    tempAudit.currentPage = 1;

    this.setState({
      audit: tempAudit
    }, () => {
      this.getAuditData();
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {locale} = this.context;
    const {showFilter, auditSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='auditSearchKeyword'>{t('txt-keywords')}</label>
            <input
              id='auditSearchKeyword'
              type='text'
              value={auditSearch.keyword}
              onChange={this.handleAuditSearch.bind(this, 'keyword')} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.handleSearchSubmit}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      auditSearch: {
        keyword: ''
      }
    });
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
    const {baseUrl, contextRoot} = this.context;
    const {showFilter, datetime, audit} = this.state;
    const options = {
      selectableRows: 'none',
      serverSide: true,
      search: false,
      filter: false,
      print: false,
      customFooter: () => {
        return (
          <TablePagination
            rowsPerPageOptions={[10, 20, 50, 100]}
            count={audit.totalCount}
            rowsPerPage={audit.pageSize}
            page={audit.currentPage}
            onChangePage={this.handlePaginationChange.bind(this, 'currentPage')}
            onChangeRowsPerPage={this.handlePaginationChange.bind(this, 'pageSize')}
          />
        )
      }
    };

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
          </div>

          <SearchOptions
            datetime={datetime}
            enableTime={true}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.handleSearchSubmit} />          
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            {this.renderFilter()}

            <div className='main-content'>
              <header className='main-header'>{t('txt-auditLog')}</header>

              <div className='content-header-btns'>
              </div>

              {audit.dataContent.length > 0 &&
                <MuiThemeProvider theme={this.getMuiTheme()}>
                  <MUIDataTable
                    columns={audit.dataFields}
                    data={audit.dataContent}
                    options={options} />
                </MuiThemeProvider>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

AuditLog.contextType = BaseDataContext;

AuditLog.propTypes = {
};

export default AuditLog;