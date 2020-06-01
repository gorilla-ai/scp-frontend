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
import Textarea from 'react-ui/build/src/components/textarea'

import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import helper from '../../common/helper'
import TableContent from '../../common/table-content'

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
        severity: {}
      },
      originalPatternData: {},
      severityList: [],
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
          periodMin: '',
          threshold: '',
          queryScript: '',
          severity: 'Emergency'
        }
      },
      periodCheckbox: false
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
    let tempPatternSearch = {...this.state.patternSearch};
    let severityList = [];   

    _.forEach(SEVERITY_TYPE, val => {
      tempPatternSearch.severity[val] = false;
      severityList.push({
        value: val,
        text: val
      });
    })

    this.setState({
      patternSearch: tempPatternSearch,
      severityList
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
        periodMin: '',
        threshold: '',
        queryScript: ''
      };
    } else if (type === 'viewPattern') {
      const periodCheckbox = (allValue.periodMin || allValue.threshold) ? true : false;

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
        originalPatternData: _.cloneDeep(tempPattern),
        periodCheckbox
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
   * @param {string} field - severity option name
   * @param {boolean} value - true/false
   */
  toggleSeverityOptions = (field, value) => {
    let tempPatternSearch = {...this.state.patternSearch};
    tempPatternSearch.severity[field] = value;

    this.setState({
      patternSearch: tempPatternSearch
    });
  }
  /**
   * Handle Pattern edit input data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleDataChange = (type, value) => {
    let tempPattern = {...this.state.pattern};
    tempPattern.info[type] = value;

    this.setState({
      pattern: tempPattern
    });
  }
  /**
   * Handle Pattern edit input number change
   * @method
   * @param {string} type - input type
   * @param {string} event - input value
   */
  handleNumberChange = (type, event) => {
    let tempPattern = {...this.state.pattern};
    tempPattern.info[type] = event.target.value;

    this.setState({
      pattern: tempPattern
    });
  }
  /**
   * Toggle pattern period checkbox
   * @method
   */
  togglePeriodCheckbox = () => {
    this.setState({
      periodCheckbox: !this.state.periodCheckbox
    });
  }
  /**
   * Display edit Pattern content
   * @method
   * @returns HTML DOM
   */
  displayEditPatternContent = () => {
    const {locale} = this.context;
    const {activeContent, severityList, pattern, periodCheckbox} = this.state;
    let pageType = '';

    if (activeContent === 'addPattern') {
      pageType = 'tableList';
    } else if (activeContent === 'editPattern') {
      pageType = 'cancel';
    }

    return (
      <div className='main-content basic-form'>
        <header className='main-header'>{t('syslog-pattern.txt-patternScript')}</header>

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
            <div className='text'>{t('syslog-pattern.txt-patternInfo')}</div>
            {pattern.info.lastUpdateDttm &&
              <span className='msg'>{t('syslog-pattern.txt-lastUpateTime')} {helper.getFormattedDate(pattern.info.lastUpdateDttm, 'local')}</span>
            }
          </header>
          <div className='group'>
            <label htmlFor='patternName'>{f('syslogPatternTableFields.patternName')}</label>
            <Input
              id='patternName'
              onChange={this.handleDataChange.bind(this, 'name')}
              value={pattern.info.name}
              readOnly={activeContent === 'viewPattern'} />
          </div>
          <div className='group severity-level'>
            <label htmlFor='severityLevel'>{f('syslogPatternTableFields.severity')}</label>
            <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[pattern.info.severity]}}></i>
            <DropDownList
              id='severityLevel'
              required={true}
              list={severityList}
              onChange={this.handleDataChange.bind(this, 'severity')}
              value={pattern.info.severity}
              readOnly={activeContent === 'viewPattern'} />
          </div>
          <div className='group full'>
            <label htmlFor='queryScript'>{f('syslogPatternTableFields.queryScript')}</label>
            <Textarea
              id='queryScript'
              rows={4}
              maxLength={250}
              value={pattern.info.queryScript}
              onChange={this.handleDataChange.bind(this, 'queryScript')}
              readOnly={activeContent === 'viewPattern'} />
          </div>
          <div className='group full'>
            {locale === 'zh' &&
              <div className='period'>
                <Checkbox
                  id='periodCheckbox'
                  onChange={this.togglePeriodCheckbox}
                  checked={periodCheckbox}
                  disabled={(activeContent === 'viewPattern')} />
                <span>在 </span>
                <input
                  id='periodMin'
                  className='number'
                  type='number'
                  min='1'
                  onChange={this.handleNumberChange.bind(this, 'periodMin')}
                  value={pattern.info.periodMin}
                  readOnly={(activeContent === 'viewPattern') || !periodCheckbox} />
                <span> 分鐘內超過或等於 </span>
                <input
                  id='threshold'
                  className='number'
                  type='number'
                  min='1'
                  onChange={this.handleNumberChange.bind(this, 'threshold')}
                  value={pattern.info.threshold}
                  readOnly={(activeContent === 'viewPattern') || !periodCheckbox} />
                <span> 次</span>
              </div>
            }
            {locale === 'en' &&
              <div className='period'>
                <Checkbox
                  id='periodCheckbox'
                  onChange={this.togglePeriodCheckbox}
                  checked={periodCheckbox}
                  disabled={(activeContent === 'viewPattern')} />
                <span>Occurs more than or equal to </span>
                <input
                  id='threshold'
                  className='number'
                  type='number'
                  min='1'
                  onChange={this.handleNumberChange.bind(this, 'threshold')}
                  value={pattern.info.threshold}
                  readOnly={(activeContent === 'viewPattern') || !periodCheckbox} />
                <span> times in </span>
                <input
                  id='periodMin'
                  className='number'
                  type='number'
                  min='1'
                  onChange={this.handleNumberChange.bind(this, 'periodMin')}
                  value={pattern.info.periodMin}
                  readOnly={(activeContent === 'viewPattern') || !periodCheckbox} />
                <span> minutes</span>
              </div>
            }
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
      title: t('syslog-pattern.txt-deletePattern'),
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
    const {activeContent, pattern, periodCheckbox} = this.state;
    let requestType = '';

    if (!pattern.info.name) {
      helper.showPopupMsg(t('syslog-pattern.txt-patternMissing'), t('txt-error'));
      return;
    }

    if (!pattern.info.queryScript) {
      helper.showPopupMsg(t('syslog-pattern.txt-queryScriptMissing'), t('txt-error'));
      return;
    }

    let data = {
      patternName: pattern.info.name,
      severity: pattern.info.severity,
      queryScript: pattern.info.queryScript
    };

    if (periodCheckbox) {
      data.periodMin = pattern.info.periodMin;
      data.threshold = pattern.info.threshold;
    }

    if (activeContent === 'addPattern') {
      requestType = 'POST';
    } else if (activeContent === 'editPattern') {
      data.patternId = pattern.info.id;
      requestType = 'PATCH';
    }

    ah.one({
      url: `${baseUrl}/api/alert/pattern`,
      data: JSON.stringify(data),
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
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handlePatternSearch = (type, value) => {
    let tempPatternSearch = {...this.state.patternSearch};
    tempPatternSearch[type] = value;

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
        <label htmlFor={val} className='active'>{val}</label>
        <Checkbox
          id={val}
          onChange={this.toggleSeverityOptions.bind(this, val)}
          checked={this.state.patternSearch.severity[val]} />
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
            <label htmlFor='patternSearchName'>{f('syslogPatternTableFields.patternName')}</label>
            <Input
              id='patternSearchName'
              onChange={this.handlePatternSearch.bind(this, 'name')}
              value={patternSearch.name} />
          </div>
          <div className='group'>
            <label htmlFor='patternSearchQueryScript'>{f('syslogPatternTableFields.queryScript')}</label>
            <Input
              id='patternSearchQueryScript'
              onChange={this.handlePatternSearch.bind(this, 'queryScript')}
              value={patternSearch.queryScript} />
          </div>
          <div className='severity'>
            <label>{f('syslogPatternTableFields.severity')}</label>
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
        severity: {}
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
                <header className='main-header'>{t('syslog-pattern.txt-patternScript')}</header>

                <div className='content-header-btns'>
                  <button className='standard btn' onClick={this.toggleContent.bind(this, 'addPattern')}>{t('syslog-pattern.txt-addPatternScript')}</button>
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