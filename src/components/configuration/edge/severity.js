import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { NavLink, Link, Switch, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import Checkbox from 'react-ui/build/src/components/checkbox'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import helper from '../../common/helper'
import TableContent from '../../common/table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};

/**
 * Severity
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Config Edge Severity table page
 */
class Severity extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');

    this.state = {
      activeContent: 'tableList', //tableList, viewSeverity, addSeverity, editSeverity
      showFilter: false,
      severitySearchType: '',
      severitySearchOptions: {},
      originalSeverityData: {},
      severityList: [],
      currentSeverityData: '',
      severity: {
        dataFieldsArr: ['dataSourceType', 'severityLevel', 'nickname', 'description', 'updateDttm', '_menu'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'dataSourceType',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        info: {
          type: '',
          severity: 'Emergency'
        }
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.setDefaultSearchOptions();
  }
  /**
   * Set Severity checkbox filter and dropdown list
   * @method
   */
  setDefaultSearchOptions = () => {
    let tempSeveritySearchOptions = {...this.state.severitySearchOptions};
    let severityList = [];   

    _.forEach(SEVERITY_TYPE, val => {
      tempSeveritySearchOptions[val] = false;
      severityList.push({
        value: val,
        text: val
      });
    })

    this.setState({
      severitySearchOptions: tempSeveritySearchOptions,
      severityList
    }, () => {
      this.getSeverityMapping();
    });
  }
  /**
   * Get and set severity table data
   * @method
   * @param {string} fromSearch - option for 'search'
   */
  getSeverityMapping = (fromSearch) => {
    const {baseUrl} = this.context;
    const {severitySearchType, severitySearchOptions, severity} = this.state;
    const url = `${baseUrl}/api/severityMapping/_search?&page=${severity.currentPage}&pageSize=${severity.pageSize}`;
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

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
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
              if (tempData === 'severityLevel') {
                return <span className='severity' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>
              } else if (tempData === 'updateDttm') {
                value = helper.getFormattedDate(value, 'local');
              } else if (tempData === '_menu') {
                return (
                  <div className='table-menu menu active'>
                    <i className='fg fg-eye' onClick={this.toggleContent.bind(this, 'viewSeverity', allValue)} title={t('txt-view')}></i>
                  </div>
                )
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
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle different content
   * @method
   * @param {string} type - page type ('tableList', 'viewSeverity', 'addSeverity', editSeverity' and 'cancel')
   * @param {object} allValue - Severity data
   */
  toggleContent = (type, allValue) => {
    const {originalSeverityData, severity} = this.state;
    let tempSeverity = {...severity};
    let showPage = type;

    if (type === 'tableList') {
      tempSeverity.info = {
        type: '',
        severity: 'Emergency'
      };
    } else if (type === 'viewSeverity') {
      tempSeverity.info = {
        type: allValue.dataSourceType,
        severity: allValue.severityLevel,
        updateDttm: allValue.updateDttm
      };

      this.setState({
        originalSeverityData: _.cloneDeep(tempSeverity)
      });
    } else if (type === 'cancel') {
      showPage = 'viewSeverity';
      tempSeverity = _.cloneDeep(originalSeverityData);
    }

    this.setState({
      showFilter: false,
      activeContent: showPage,
      severity: tempSeverity
    }, () => {
      if (type === 'tableList') {
        this.getSeverityMapping();
      }
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
  /**
   * Handle Severity edit input data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleDataChange = (type, value) => {
    let tempSeverity = {...this.state.severity};
    tempSeverity.info[type] = value;

    this.setState({
      severity: tempSeverity
    });
  }
  /**
   * Display edit Severity content
   * @method
   * @returns HTML DOM
   */
  displayEditSeverityContent = () => {
    const {activeContent, severityList, severity} = this.state;
    let pageType = '';

    if (activeContent === 'addSeverity') {
      pageType = 'tableList';
    } else if (activeContent === 'editSeverity') {
      pageType = 'cancel';
    }

    return (
      <div className='main-content basic-form'>
        <header className='main-header'>{t('threat-severity-mapping.txt-severityMapping')}</header>

        <div className='content-header-btns'>
          {activeContent === 'viewSeverity' &&
            <div>
              <button className='standard btn list' onClick={this.toggleContent.bind(this, 'tableList')}>{t('network-inventory.txt-backToList')}</button>
              <button className='standard btn edit' onClick={this.toggleContent.bind(this, 'editSeverity')}>{t('txt-edit')}</button>
            </div>
          }
        </div>

        <div className='form-group normal'>
          <header>
            <div className='text'>{t('threat-severity-mapping.txt-typeInfo')}</div>
            {severity.info.updateDttm &&
              <span className='msg'>{t('threat-severity-mapping.txt-lastUpateTime')} {helper.getFormattedDate(severity.info.updateDttm, 'local')}</span>
            }
          </header>
          <div className='group'>
            <label htmlFor='severityType'>{f('severityTableFields.dataSourceType')}</label>
            <Input
              id='severityType'
              value={severity.info.type}
              onChange={this.handleDataChange.bind(this, 'type')}
              readOnly={activeContent === 'viewSeverity' || activeContent === 'editSeverity'} />
          </div>
          <div className='group severity-level'>
            <label htmlFor='severityLevel'>{f('severityTableFields.severityLevel')}</label>
            <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[severity.info.severity]}}></i>
            <DropDownList
              id='severityLevel'
              required={true}
              list={severityList}
              value={severity.info.severity}
              onChange={this.handleDataChange.bind(this, 'severity')}
              readOnly={activeContent === 'viewSeverity'} />
          </div>
        </div>

        {(activeContent === 'addSeverity' || activeContent === 'editSeverity') &&
          <footer>
            <button className='standard' onClick={this.toggleContent.bind(this, pageType)}>{t('txt-cancel')}</button>
            <button onClick={this.handleSeveritySubmit}>{t('txt-save')}</button>
          </footer>
        }
      </div>
    )
  }
  /**
   * Handle Severity add/edit confirm
   * @method
   */
  handleSeveritySubmit = () => {
    const {baseUrl} = this.context;
    const {activeContent, severity} = this.state;
    let requestType = '';

    if (!severity.info.type) {
      helper.showPopupMsg(t('threat-severity-mapping.txt-severityMissing'), t('txt-error'));
      return;
    }

    if (activeContent === 'addSeverity') {
      requestType = 'POST';
    } else if (activeContent === 'editSeverity') {
      requestType = 'PATCH';
    }

    const requestData = {
      dataSourceType: severity.info.type,
      severityLevel: severity.info.severity
    };

    ah.one({
      url: `${baseUrl}/api/severityMapping`,
      data: JSON.stringify(requestData),
      type: requestType,
      contentType: 'text/plain'
    })
    .then(data => {
      this.setState({
        originalSeverityData: _.cloneDeep(severity)
      }, () => {
        let showPage = '';

        if (activeContent === 'addSeverity') {
          showPage = 'tableList';
        } else if (activeContent === 'editSeverity') {
          showPage = 'cancel';
        }

        this.toggleContent(showPage);
      })
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
   * Toggle filter content on/off
   * @method
   * @param {string} event - Severity type input from user
   */
  handleSearchType = (event) => {
    this.setState({
      severitySearchType: event.target.value
    });
  }
  /**
   * Display Severity checkbox group
   * @method
   * @param {string} val - severity level
   * @param {number} i - index of the severity level list
   * @returns HTML DOM
   */
  displaySeverityCheckbox = (val, i) => {
    return (
      <div className='option' key={val + i}>
        <label htmlFor={val} className='active'>{val}</label>
        <Checkbox
          id={val}
          checked={this.state.severitySearchOptions[val]}
          onChange={this.toggleSeverityOptions.bind(this, val)} />
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
            <label htmlFor='severityType'>{f('severityTableFields.dataSourceType')}</label>
            <input
              id='severityType'
              type='text'
              value={severitySearchType}
              onChange={this.handleSearchType} />
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
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {activeContent, showFilter, severity} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            {activeContent === 'tableList' &&
              <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
            }
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            { this.renderFilter() }

            {activeContent === 'tableList' &&
              <div className='main-content'>
                <header className='main-header'>{t('threat-severity-mapping.txt-severityMapping')}</header>

                <div className='content-header-btns'>
                  <button className='standard btn' onClick={this.toggleContent.bind(this, 'addSeverity')}>{t('threat-severity-mapping.txt-addSeverityTable')}</button>
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
            }

            {(activeContent === 'viewSeverity' || activeContent === 'addSeverity' || activeContent === 'editSeverity') &&
              this.displayEditSeverityContent()
            }
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