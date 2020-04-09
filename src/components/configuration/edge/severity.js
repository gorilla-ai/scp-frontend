import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { NavLink, Link, Switch, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import Checkbox from 'react-ui/build/src/components/checkbox'
import DateRange from 'react-ui/build/src/components/date-range'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import RadioGroup from 'react-ui/build/src/components/radio-group'
import Textarea from 'react-ui/build/src/components/textarea'
import ToggleBtn from 'react-ui/build/src/components/toggle-button'

import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import helper from '../../common/helper'
import TableContent from '../../common/table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];

let t = null;
let f = null;
let et = null;

/**
 * Edge
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Config Edge page
 */
class Severity extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');

    this.state = {
      showFilter: false,
      severitySearchType: '',
      severitySearchOptions: {},
      severity: {
        dataFieldsArr: ['dataSourceType', 'severityLevel', 'updateDttm', '_menu'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'dataSourceType',
          desc: false
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
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.setDefaultSearchOptions();
    this.getSeverityMapping();
  }
  ryan = () => {

  }
  setDefaultSearchOptions = () => {
    let tempSeveritySearchOptions = {...this.state.severitySearchOptions};

    _.forEach(SEVERITY_TYPE, val => {
      tempSeveritySearchOptions[val] = false;
    })

    this.setState({
      severitySearchOptions: tempSeveritySearchOptions
    });
  }
  getSeverityMapping = (fromSearch) => {
    const {baseUrl} = this.context;
    const {severitySearchType, severitySearchOptions, severity} = this.state;
    const url = `${baseUrl}/api/severityMapping/_search`;
    let requestData = {};
    let searchArr = [];

    if (severitySearchType !== '') {
      requestData.keyword = severitySearchType;
    }

    _.forEach(severitySearchOptions, (val, key) => {
      if (val) {
        searchArr.push(key);
      }
    })

    if (searchArr.length > 0) {
      requestData.severityLevelList = searchArr;
    }
    
    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      if (data) {
        let tempSeverity = {...severity};
        tempSeverity.dataContent = data.rows;
        tempSeverity.totalCount = data.counts;
        tempSeverity.currentPage = fromSearch === 'search' ? 1 : severity.currentPage;

        let dataFields = {};
        severity.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: tempData === '_menu' ? '' : f(`severityTableFields.${tempData}`),
            sortable: tempData === '_menu' ? null : true,
            formatter: (value, allValue, i) => {
              if (tempData === '_menu') {
                return (
                  <div className='table-menu menu active'>
                    <i className='fg fg-edit' title={t('txt-edit')}></i>
                    <i className='fg fg-trashcan' title={t('txt-delete')}></i>
                  </div>
                )
              } else if (tempData === 'updateDttm') {
                value = helper.getFormattedDate(value, 'local');
              }
              return <span>{value}</span>
            }
          };
        })

        tempSeverity.dataFields = dataFields;

        this.setState({
          severity: tempSeverity
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'));
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
  handleSearchType = (type) => {
    this.setState({
      severitySearchType: type
    });
  }
  /**
   * Toggle Severity options
   * @method
   * @param {string} field - severity option name
   * @param {boolean} value - true/false
   */
  toggleSeverityOptions = (field, value) => {
    let tempSeveritySearchOptions = {...this.state.severitySearchOptions};
    tempSeveritySearchOptions[field] = value;

    this.setState({
      severitySearchOptions: tempSeveritySearchOptions
    });
  }
  displaySeverityCheckbox = (val, i) => {
    return (
      <div className='option' key={val + i}>
        <label htmlFor={val} className='active'>{val}</label>
        <Checkbox
          id={val}
          onChange={this.toggleSeverityOptions.bind(this, val)}
          checked={this.state.severitySearchOptions[val]} />
      </div>
    )
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, severitySearchType} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='severityType' className='first-label'>{f('severityTableFields.dataSourceType')}</label>
            <Input
              id='severityType'
              onChange={this.handleSearchType}
              value={severitySearchType} />
          </div>
          <div className='severity'>
            <label>{f('severityTableFields.severityLevel')}</label>
            <div className='group group-checkbox narrow'>
              <div className='group-options'>
                {SEVERITY_TYPE.map(this.displaySeverityCheckbox)}
              </div>
            </div>
          </div>
        </div>
        <div className='button-group group-aligned'>
          <button className='filter' onClick={this.getSeverityMapping.bind(this, 'search')}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  /**
   * Handle table sort
   * @method
   * @param {object} sort - sort data object
   */
  handleTableSort = (sort) => {
    let tempSeverity = {...this.state.severity};
    tempSeverity.sort.field = sort.field;
    tempSeverity.sort.desc = sort.desc;

    this.setState({
      severity: tempSeverity
    }, () => {
      this.getSeverityMapping();
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempSeverity = {...this.state.severity};
    tempSeverity[type] = Number(value);

    if (type === 'pageSize') {
      tempSeverity.currentPage = 1;
    }

    this.setState({
      severity: tempSeverity
    }, () => {
      this.getSeverityMapping();
    });
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      severitySearchType: '',
      severitySearchOptions: {}
    }, () => {
      this.setDefaultSearchOptions();
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {showFilter, severity} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            { this.renderFilter() }

            <div className='main-content'>
              <header className='main-header'>{t('txt-severityTable')}</header>

              <div className='content-header-btns'>
                <button className='standard btn'>{t('txt-addSeverityTable')}</button>
              </div>

              <TableContent
                dataTableData={severity.dataContent}
                dataTableFields={severity.dataFields}
                dataTableSort={severity.sort}
                paginationTotalCount={severity.totalCount}
                paginationPageSize={severity.pageSize}
                paginationCurrentPage={severity.currentPage}
                handleTableSort={this.handleTableSort}
                paginationPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Severity.contextType = BaseDataContext;

Severity.propTypes = {
};

export default withRouter(Severity);