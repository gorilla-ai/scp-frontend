import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { NavLink, Link, Switch, Route } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

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

const StyledTextField = withStyles({
  root: {
    backgroundColor: '#fff',
    '& .Mui-disabled': {
      backgroundColor: '#f2f2f2'
    }
  }
})(TextField);

function TextFieldComp(props) {
  return (
    <StyledTextField
      id={props.id}
      className={props.className}
      name={props.name}
      type={props.type}
      label={props.label}
      multiline={props.multiline}
      rows={props.rows}
      maxLength={props.maxLength}
      variant={props.variant}
      fullWidth={props.fullWidth}
      size={props.size}
      InputProps={props.InputProps}
      required={props.required}
      value={props.value}
      onChange={props.onChange}
      disabled={props.disabled} />
  )
}

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
        currentPage: 0,
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
    const page = fromSearch === 'search' ? 0 : audit.currentPage;
    const url = `${baseUrl}/api/auditLog/system?page=${page + 1}&pageSize=${audit.pageSize}`;
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
   * @param {number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempAudit = {...this.state.audit};
    tempAudit[type] = value;
    
    if (type === 'pageSize') {
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
            <TextFieldComp
              id='auditSearchKeyword'
              name='keyword'
              label={t('txt-keywords')}
              variant='outlined'
              fullWidth={true}
              size='small'
              value={auditSearch.keyword}
              onChange={this.handleAuditSearch} />
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
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {showFilter, datetime, audit} = this.state;
    const tableOptions = {
      onChangePage: (currentPage) => {
        this.handlePaginationChange('currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('pageSize', numberOfRows);
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