import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { NavLink, Link, Route } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

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
const PERIOD_MIN = [10, 15, 30, 60];

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
 * Pattern
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Config Syslog Pattern page
 */
class Pattern extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');

    this.state = {
      activeContent: 'tableList', //tableList, viewPattern, addPattern, editPattern
      showFilter: false,
      patternSearch: {
        name: '',
        queryScript: '',
        severity: {
          Alert: false,
          Critical: false,
          Emergency: false,
          Notice: false,
          Warning: false
        }
      },
      originalPatternData: {},
      severityList: [],
      periodMinList: [],
      currentPatternData: '',
      pattern: {
        dataFieldsArr: ['patternName', 'severity', 'queryScript', 'periodMin', 'threshold', 'lastUpdateDttm', '_menu'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'patternName',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        info: {
          id: '',
          name: '',
          lastUpdateDttm: '',
          severity: '',
          periodMin: 10,
          threshold: 1,
          queryScript: '',
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
    const severityList = _.map(SEVERITY_TYPE, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });
    const periodMinList = _.map(PERIOD_MIN, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });

    this.setState({
      severityList,
      periodMinList
    }, () => {
      this.getPatternScript();
    });
  }
  /**
   * Get and set pattern script data
   * @method
   * @param {string} fromSearch - option for 'search'
   */
  getPatternScript = (fromSearch) => {
    const {baseUrl} = this.context;
    const {patternSearch, pattern} = this.state;
    let query = '';

    if (patternSearch.name) {
      query += `&patternName=${patternSearch.name}`;
    }

    if (patternSearch.queryScript) {
      query += `&queryScript=${patternSearch.queryScript}`;
    } 

    if (!_.isEmpty(patternSearch.severity)) {
      let severityArr = [];

      _.forEach(patternSearch.severity, (val, key) => {
        if (val) {
          severityArr.push(key);
        }
      })

      const severityOptions = severityArr.join();

      if (severityOptions) {
        query += `&severity=${severityOptions}`;
      }
    }

    this.ah.one({
      url: `${baseUrl}/api/alert/pattern?${query}&page=${pattern.currentPage}&pageSize=${pattern.pageSize}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempPattern = {...pattern};
        tempPattern.dataContent = data;
        tempPattern.totalCount = data.length;
        tempPattern.currentPage = fromSearch === 'search' ? 1 : pattern.currentPage;

        let dataFields = {};
        pattern.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: tempData === '_menu' ? '' : f(`syslogPatternTableFields.${tempData}`),
            sortable: tempData === '_menu' ? null : true,
            formatter: (value, allValue, i) => {
              if (tempData === 'severity') {
                return <span className='severity' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>
              } else if (tempData === 'lastUpdateDttm') {
                value = helper.getFormattedDate(value, 'local');
              } else if (tempData === '_menu') {
                return (
                  <div className='table-menu menu active'>
                    <i className='fg fg-eye' onClick={this.toggleContent.bind(this, 'viewPattern', allValue)} title={t('txt-view')}></i>
                    <i className='fg fg-trashcan' onClick={this.openDeleteMenu.bind(this, allValue)} title={t('txt-delete')}></i>
                  </div>
                )
              }
              return <span>{value}</span>
            }
          };
        })

        tempPattern.dataFields = dataFields;

        this.setState({
          pattern: tempPattern
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
   * @param {string} type - page type ('tableList', 'viewPattern', 'addPattern', editPattern' and 'cancel')
   * @param {object} allValue - Severity data
   */
  toggleContent = (type, allValue) => {
    const {originalPatternData, pattern} = this.state;
    let tempPattern = {...pattern};
    let showPage = type;

    if (type === 'tableList') {
      tempPattern.info = {
        id: '',
        name: '',
        lastUpdateDttm: '',
        severity: 'Emergency',
        periodMin: 10,
        threshold: 1,
        queryScript: ''
      };
    } else if (type === 'viewPattern') {
      tempPattern.info = {
        id: allValue.patternId,
        name: allValue.patternName,
        lastUpdateDttm: allValue.lastUpdateDttm,
        severity: allValue.severity,
        periodMin: allValue.periodMin,
        threshold: allValue.threshold,
        queryScript: allValue.queryScript
      };

      this.setState({
        showFilter: false,
        originalPatternData: _.cloneDeep(tempPattern)
      });
    } else if (type === 'addPattern') {
      this.setState({
        showFilter: false
      });      
    } else if (type === 'cancel') {
      showPage = 'viewPattern';
      tempPattern = _.cloneDeep(originalPatternData);
    }

    this.setState({
      activeContent: showPage,
      pattern: tempPattern
    }, () => {
      if (type === 'tableList') {
        this.getPatternScript();
      }
    });
  }
  /**
   * Toggle Severity options
   * @method
   * @param {object} event - event object
   */
  toggleSeverityOptions = (event) => {
    let tempPatternSearch = {...this.state.patternSearch};
    tempPatternSearch.severity[event.target.name] = event.target.checked;

    this.setState({
      patternSearch: tempPatternSearch
    });
  }
  /**
   * Handle Pattern edit input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempPattern = {...this.state.pattern};
    tempPattern.info[event.target.name] = event.target.value;

    this.setState({
      pattern: tempPattern
    });
  }
  /**
   * Display edit Pattern content
   * @method
   * @returns HTML DOM
   */
  displayEditPatternContent = () => {
    const {locale} = this.context;
    const {activeContent, severityList, periodMinList, pattern} = this.state;
    let pageType = '';

    if (activeContent === 'addPattern') {
      pageType = 'tableList';
    } else if (activeContent === 'editPattern') {
      pageType = 'cancel';
    }

    return (
      <div className='main-content basic-form'>
        <header className='main-header'>{t('txt-systemDefinedPattern')}</header>

        <div className='content-header-btns'>
          {activeContent === 'viewPattern' &&
            <div>
              <button className='standard btn list' onClick={this.toggleContent.bind(this, 'tableList')}>{t('network-inventory.txt-backToList')}</button>
              <button className='standard btn edit' onClick={this.toggleContent.bind(this, 'editPattern')}>{t('txt-edit')}</button>
            </div>
          }
        </div>

        <div className='form-group normal'>
          <header>
            <div className='text'>{t('system-defined-pattern.txt-patternInfo')}</div>
            {pattern.info.lastUpdateDttm &&
              <span className='msg'>{t('system-defined-pattern.txt-lastUpdateTime')} {helper.getFormattedDate(pattern.info.lastUpdateDttm, 'local')}</span>
            }
          </header>
          <div className='group'>
            <TextFieldComp
              id='patternName'
              name='name'
              label={f('syslogPatternTableFields.patternName')}
              variant='outlined'
              fullWidth={true}
              size='small'
              value={pattern.info.name}
              onChange={this.handleDataChange}
              disabled={activeContent === 'viewPattern'} />
          </div>
          <div className='group severity-level'>
            <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[pattern.info.severity]}}></i>
            <StyledTextField
              id='severityLevel'
              name='severity'
              select
              label={f('syslogPatternTableFields.severity')}
              variant='outlined'
              size='small'
              value={pattern.info.severity}
              onChange={this.handleDataChange}
              disabled={activeContent === 'viewPattern'}>
              {severityList}
            </StyledTextField>
          </div>
          <div className='group full'>
            <TextFieldComp
              id='queryScript'
              name='queryScript'
              label={f('syslogPatternTableFields.queryScript')}
              multiline={true}
              rows={4}
              maxLength={250}
              variant='outlined'
              fullWidth={true}
              size='small'
              value={pattern.info.queryScript}
              onChange={this.handleDataChange}
              disabled={activeContent === 'viewPattern'} />
          </div>
          <div className='group full'>
            <div className='period'>
              <span className='support-text'>{t('events.connections.txt-patternQuery1')} </span>
              <StyledTextField
                className='number'
                name='periodMin'
                select
                variant='outlined'
                size='small'
                required={true}
                value={pattern.info.periodMin}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewPattern'}>
                {periodMinList}
              </StyledTextField>
              <span className='support-text'> {t('events.connections.txt-patternQuery2')} </span>
              <TextFieldComp
                id='threshold'
                className='number'
                name='threshold'
                type='number'
                variant='outlined'
                size='small'
                InputProps={{inputProps: { min: 1, max: 1000 }}}
                value={pattern.info.threshold}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewPattern'} />
              <span className='support-text'> {t('events.connections.txt-patternQuery3')}</span>
            </div>
          </div>
        </div>

        {(activeContent === 'addPattern' || activeContent === 'editPattern') &&
          <footer>
            <button className='standard' onClick={this.toggleContent.bind(this, pageType)}>{t('txt-cancel')}</button>
            <button onClick={this.handlePatternSubmit}>{t('txt-save')}</button>
          </footer>
        }
      </div>
    )
  }
  /**
   * Display delete Pattern content
   * @method
   * @param {object} allValue - Pattern data
   * @returns HTML DOM
   */
  getDeletePatternContent = (allValue) => {
    this.setState({
      currentPatternData: allValue
    });

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {allValue.patternName}?</span>
      </div>
    )
  }
  /**
   * Show Delete Pattern dialog
   * @method
   * @param {object} allValue - Pattern data
   */
  openDeleteMenu = (allValue) => {
    PopupDialog.prompt({
      title: t('system-defined-pattern.txt-deletePattern'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeletePatternContent(allValue),
      act: (confirmed, data) => {
        if (confirmed) {
          this.deleteSeverity();
        }
      }
    });
  }
  /**
   * Handle delete Pattern confirm
   * @method
   */
  deleteSeverity = () => {
    const {baseUrl} = this.context;
    const {currentPatternData} = this.state;

    if (!currentPatternData.patternId) {
      return;
    }

    ah.one({
      url: `${baseUrl}/api/alert/pattern?patternId=${currentPatternData.patternId}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getPatternScript();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle Pattern add/edit confirm
   * @method
   */
  handlePatternSubmit = () => {
    const {baseUrl} = this.context;
    const {activeContent, pattern} = this.state;
    let requestType = '';

    if (!pattern.info.name) {
      helper.showPopupMsg(t('system-defined-pattern.txt-patternMissing'), t('txt-error'));
      return;
    }

    if (!pattern.info.queryScript) {
      helper.showPopupMsg(t('system-defined-pattern.txt-queryScriptMissing'), t('txt-error'));
      return;
    }

    if (!pattern.info.threshold || !_.includes(PERIOD_MIN, Number(pattern.info.periodMin))) {
      helper.showPopupMsg(t('txt-allRequired'));
      return;
    }

    if (pattern.info.threshold > 1000) {
      helper.showPopupMsg(t('events.connections.txt-threasholdMax'));
      return;
    }

    let requestData = {
      patternName: pattern.info.name,
      severity: pattern.info.severity,
      queryScript: pattern.info.queryScript,
      periodMin: Number(pattern.info.periodMin),
      threshold: Number(pattern.info.threshold)
    };

    if (activeContent === 'addPattern') {
      requestType = 'POST';
    } else if (activeContent === 'editPattern') {
      requestData.patternId = pattern.info.id;
      requestType = 'PATCH';
    }

    this.ah.one({
      url: `${baseUrl}/api/alert/pattern`,
      data: JSON.stringify(requestData),
      type: requestType,
      contentType: 'text/plain'
    })
    .then(data => {
      this.setState({
        originalPatternData: _.cloneDeep(pattern)
      }, () => {
        let showPage = '';

        if (activeContent === 'addPattern') {
          showPage = 'tableList';
        } else if (activeContent === 'editPattern') {
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
   * Handle filter input data change
   * @method
   * @param {object} event - event object
   */
  handlePatternSearch = (event) => {
    let tempPatternSearch = {...this.state.patternSearch};
    tempPatternSearch[event.target.name] = event.target.value;

    this.setState({
      patternSearch: tempPatternSearch
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
              checked={this.state.patternSearch.severity[val]}
              onChange={this.toggleSeverityOptions}
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
    const {showFilter, patternSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <TextFieldComp
              id='patternSearchName'
              name='name'
              label={f('syslogPatternTableFields.patternName')}
              variant='outlined'
              fullWidth={true}
              size='small'
              value={patternSearch.name}
              onChange={this.handlePatternSearch} />
          </div>
          <div className='group'>
            <TextFieldComp
              id='patternSearchQueryScript'
              name='queryScript'
              label={f('syslogPatternTableFields.queryScript')}
              variant='outlined'
              fullWidth={true}
              size='small'
              value={patternSearch.queryScript}
              onChange={this.handlePatternSearch} />
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
          <button className='filter' onClick={this.getPatternScript.bind(this, 'search')}>{t('txt-filter')}</button>
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
    let tempPattern = {...this.state.pattern};
    tempPattern.sort.field = sort.field;
    tempPattern.sort.desc = sort.desc;

    this.setState({
      pattern: tempPattern
    }, () => {
      this.getPatternScript();
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempPattern = {...this.state.pattern};
    tempPattern[type] = Number(value);

    if (type === 'pageSize') {
      tempPattern.currentPage = 1;
    }

    this.setState({
      pattern: tempPattern
    }, () => {
      this.getPatternScript();
    });
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      patternSearch: {
        name: '',
        queryScript: '',
        severity: {
          Alert: false,
          Critical: false,
          Emergency: false,
          Notice: false,
          Warning: false
        }
      }
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {activeContent, showFilter, pattern} = this.state;

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
                <header className='main-header'>{t('txt-systemDefinedPattern')}</header>

                <div className='content-header-btns'>
                  <button className='standard btn' onClick={this.toggleContent.bind(this, 'addPattern')}>{t('system-defined-pattern.txt-addPatternScript')}</button>
                </div>

                <TableContent
                  dataTableData={pattern.dataContent}
                  dataTableFields={pattern.dataFields}
                  dataTableSort={pattern.sort}
                  paginationTotalCount={pattern.totalCount}
                  paginationPageSize={pattern.pageSize}
                  paginationCurrentPage={pattern.currentPage}
                  handleTableSort={this.handleTableSort}
                  paginationPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                  paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
              </div>
            }

            {(activeContent === 'viewPattern' || activeContent === 'addPattern' || activeContent === 'editPattern') &&
              this.displayEditPatternContent()
            }
          </div>
        </div>
      </div>
    )
  }
}

Pattern.contextType = BaseDataContext;

Pattern.propTypes = {
};

export default withRouter(Pattern);