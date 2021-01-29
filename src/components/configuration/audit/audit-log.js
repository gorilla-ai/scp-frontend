import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { NavLink, Link, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import moment from 'moment'
import cx from 'classnames'

import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import helper from '../../common/helper'
import MuiTableContent from '../../common/mui-table-content'
import SearchOptions from '../../common/search-options'

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
        to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
      },
      auditSearch: {
        keyword: ''
      },
      audit: {
        dataFieldsArr: ['createDttm', 'message'],
        dataFields: [],
        dataContent: [],
        sort: {
          field: 'createDttm',
          desc: true
        },
        totalCount: 0,
        currentPage: 0,
        pageSize: 20,
        info: {}
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getAuditData();
  }
  /**
   * Get and set ES table data
   * @method
   * @param {string} fromPage - option for 'currentPage'
   */
  getAuditData = (fromPage) => {
    const {baseUrl} = this.context;
    const {datetime, auditSearch, audit} = this.state;
    const page = fromPage === 'currentPage' ? audit.currentPage : 0;
    const url = `${baseUrl}/api/auditLog/system?page=${page + 1}&pageSize=${audit.pageSize}`;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
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
        if (!data.rows || data.rows.length === 0) {
          helper.showPopupMsg(t('txt-notFound'));
          return;
        }

        let tempAudit = {...audit};
        tempAudit.totalCount = data.counts;
        tempAudit.currentPage = page;
        tempAudit.dataContent = _.map(data.rows, val => {
          return {
            createDttm: val.content.createDttm,
            message: val.content.message
          };
        });

        tempAudit.dataFields = _.map(audit.dataFieldsArr, val => {
          return {
            name: val,
            label: f('auditFields.' + val),
            options: {
              filter: true,
              sort: false,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempAudit.dataContent[dataIndex];
                const value = tempAudit.dataContent[dataIndex][val];

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
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempAudit = {...this.state.audit};
    tempAudit.sort.field = field;
    tempAudit.sort.desc = sort;

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
   * @param {number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempAudit = {...this.state.audit};
    tempAudit[type] = value;

    this.setState({
      audit: tempAudit
    }, () => {
      this.getAuditData(type);
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
   * @param {object} event - event object
   */
  handleAuditSearch = (event) => {
    let tempAuditSearch = {...this.state.auditSearch};
    tempAuditSearch[event.target.name] = event.target.value;

    this.setState({
      auditSearch: tempAuditSearch
    });
  }
  /**
   * Set new datetime
   * @method
   * @param {string} type - date type ('from' or 'to')
   * @param {object} newDatetime - new datetime object
   */
  handleDateChange = (type, newDatetime) => {
    let tempDatetime = {...this.state.datetime};
    tempDatetime[type] = newDatetime;

    this.setState({
      datetime: tempDatetime
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
            <TextField
              id='auditSearchKeyword'
              name='keyword'
              label={t('txt-keywords')}
              variant='outlined'
              fullWidth
              size='small'
              value={auditSearch.keyword}
              onChange={this.handleAuditSearch} />
          </div>
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.handleSearchSubmit}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
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
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {showFilter, datetime, audit} = this.state;
    const tableOptions = {
      onChangePage: (currentPage) => {
        this.handlePaginationChange('currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort(changedColumn, direction === 'desc');
      }
    };

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button variant='contained' color='primary' className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></Button>
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

              {audit.dataContent.length > 0 &&
                <MuiTableContent
                  data={audit}
                  tableOptions={tableOptions} />
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