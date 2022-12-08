import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import cx from 'classnames'

import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context'
import Config from '../../common/configuration'
import helper from '../../common/helper'
import MuiTableContent from '../../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};

let t = null;
let f = null;
let et = null;

/**
 * Severity
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Config Edge Severity table page
 */
class Severity extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');

    this.state = {
      activeContent: 'tableList', //'tableList', 'viewSeverity', 'addSeverity' or 'editSeverity'
      showFilter: false,
      severitySearchType: '',
      severitySelected: [],
      originalSeverityData: {},
      severityList: [],
      currentSeverityData: '',
      currentThreatType: '',
      severity: {
        dataFieldsArr: ['dataSourceType', 'severityLevel', 'nickname', 'description', 'updateDttm', '_menu'],
        dataFields: [],
        dataContent: null,
        sort: {
          field: 'dataSourceType',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        info: {
          type: '',
          severity: 'Emergency',
          nickname: '',
          description: ''
        }
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);
    helper.inactivityTime(baseUrl, locale);

    this.setDefaultSearchOptions();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Set Severity checkbox filter and dropdown list
   * @method
   */
  setDefaultSearchOptions = () => {
    const severityList = _.map(SEVERITY_TYPE, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });

    this.setState({
      severityList
    }, () => {
      this.getSeverityMapping();
    });
  }
  /**
   * Get and set severity table data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getSeverityMapping = (fromPage) => {
    const {baseUrl} = this.context;
    const {severitySearchType, severitySelected, severity} = this.state;
    const page = fromPage === 'currentPage' ? severity.currentPage : 0;
    const url = `${baseUrl}/api/severityMapping/_search?&page=${page + 1}&pageSize=${severity.pageSize}`;
    let requestData = {};

    if (severitySearchType !== '') {
      requestData.keyword = severitySearchType;
    }

    if (severitySelected.length > 0) {
      requestData.severityLevelList = severitySelected;
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

        if (!data.rows || data.rows.length === 0) {
          tempSeverity.dataContent = [];
          tempSeverity.totalCount = 0;

          this.setState({
            severity: tempSeverity
          });
          return null;
        }

        tempSeverity.dataContent = data.rows;
        tempSeverity.totalCount = data.counts;
        tempSeverity.currentPage = page;
        tempSeverity.dataFields = _.map(severity.dataFieldsArr, val => {
          return {
            name: val,
            label: val === '_menu' ? ' ' : f(`severityTableFields.${val}`),
            options: {
              sort: false,
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempSeverity.dataContent[dataIndex];
                const value = tempSeverity.dataContent[dataIndex][val];

                if (val === 'severityLevel') {
                  return <span className='severity-level' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>;
                } else if (val === 'updateDttm') {
                  return helper.getFormattedDate(value, 'local');
                } else if (val === '_menu') {
                  return (
                    <div className='table-menu menu active'>
                      <i className='fg fg-eye' onClick={this.toggleContent.bind(this, 'viewSeverity', allValue)} title={t('txt-view')}></i>
                    </div>
                  )
                } else if (val === 'docCount' || val === 'storeSize' || val === 'priStoreSize') {
                  return helper.numberWithCommas(value);
                }
                return value;
              }
            }
          };
        });

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
        nickname: allValue.nickname,
        description: allValue.description,
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
   * Handle Severity edit input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempSeverity = {...this.state.severity};
    tempSeverity.info[event.target.name] = event.target.value;

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
              <Button variant='outlined' color='primary' className='standard btn list' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'editSeverity')}>{t('txt-edit')}</Button>
            </div>
          }
        </div>

        <div className='form-group normal'>
          <header>
            <div className='text'>{t('threat-severity-mapping.txt-typeInfo')}</div>
            {severity.info.updateDttm &&
              <span className='msg'>{t('threat-severity-mapping.txt-lastUpdateTime')} {helper.getFormattedDate(severity.info.updateDttm, 'local')}</span>
            }
          </header>
          <div className='group'>
            <TextField
              id='severityType'
              name='type'
              label={f('severityTableFields.dataSourceType')}
              variant='outlined'
              fullWidth
              size='small'
              value={severity.info.type}
              onChange={this.handleDataChange}
              disabled={activeContent === 'viewSeverity' || activeContent === 'editSeverity'} />
          </div>
          <div className='group severity-level'>
            <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[severity.info.severity]}}></i>
            <TextField
              id='severityLevel'
              name='severity'
              select
              label={f('severityTableFields.severityLevel')}
              variant='outlined'
              size='small'
              value={severity.info.severity}
              onChange={this.handleDataChange}
              disabled={activeContent === 'viewSeverity'}>
              {severityList}
            </TextField>
          </div>
          <div className='group'>
            <TextField
              id='severityNickname'
              name='nickname'
              label={f('severityTableFields.nickname')}
              variant='outlined'
              fullWidth
              size='small'
              value={severity.info.nickname}
              onChange={this.handleDataChange}
              disabled={activeContent === 'viewSeverity' || activeContent === 'editSeverity'} />
          </div>
          <div className='group'>
            <TextField
              id='severityDescription'
              name='description'
              label={f('severityTableFields.description')}
              variant='outlined'
              fullWidth
              size='small'
              value={severity.info.description}
              onChange={this.handleDataChange}
              disabled={activeContent === 'viewSeverity'} />
          </div>
        </div>

        {(activeContent === 'addSeverity' || activeContent === 'editSeverity') &&
          <footer>
            <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, pageType)}>{t('txt-cancel')}</Button>
            <Button variant='contained' color='primary' onClick={this.handleSeveritySubmit}>{t('txt-save')}</Button>
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
      severityLevel: severity.info.severity,
      nickname: severity.info.nickname,
      description: severity.info.description
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

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
   * @param {string} event - event object
   */
  handleSearchType = (event) => {
    this.setState({
      severitySearchType: event.target.value
    });
  }
  /**
   * Check if item is already in the selected list
   * @method
   * @param {string} val - checked item name
   * @returns boolean true/false
   */
  checkSelectedItem = (val) => {
    return _.includes(this.state.severitySelected, val);
  }
  /**
   * Handle checkbox check/uncheck
   * @method
   * @param {object} event - event object
   */
  toggleCheckbox = (event) => {
    let severitySelected = _.cloneDeep(this.state.severitySelected);

    if (event.target.checked) {
      severitySelected.push(event.target.name);
    } else {
      const index = severitySelected.indexOf(event.target.name);
      severitySelected.splice(index, 1);
    }

    this.setState({
      severitySelected
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
        <FormControlLabel
          key={i}
          label={val}
          control={
            <Checkbox
              id={val}
              className='checkbox-ui'
              name={val}
              checked={this.checkSelectedItem(val)}
              onChange={this.toggleCheckbox}
              color='primary' />
          } />
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
            <TextField
              id='severityType'
              label={f('severityTableFields.dataSourceType')}
              variant='outlined'
              fullWidth
              size='small'
              value={severitySearchType}
              onChange={this.handleSearchType} />
          </div>
          <div className='severity'>
            <div className='group group-checkbox narrow'>
              <div className='group-options'>
                {SEVERITY_TYPE.map(this.displaySeverityCheckbox)}
              </div>
            </div>
          </div>
        </div>
        <div className='button-group group-aligned'>
          <Button variant='contained' color='primary' className='filter' onClick={this.getSeverityMapping}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempSeverity = {...this.state.severity};
    tempSeverity.sort.field = field;
    tempSeverity.sort.desc = sort;

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

    this.setState({
      severity: tempSeverity
    }, () => {
      this.getSeverityMapping(type);
    });
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      severitySearchType: '',
      severitySelected: []
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {activeContent, showFilter, severity} = this.state;
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
            {activeContent === 'tableList' &&
              <Button variant='outlined' color='primary' className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></Button>
            }
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            {this.renderFilter()}

            {activeContent === 'tableList' &&
              <div className='main-content'>
                <header className='main-header'>{t('threat-severity-mapping.txt-severityMapping')}</header>
                <MuiTableContent
                  data={severity}
                  tableOptions={tableOptions} />
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