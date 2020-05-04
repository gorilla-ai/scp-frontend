import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import Checkbox from 'react-ui/build/src/components/checkbox'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from './context';
import FilterInput from './filter-input'
import helper from './helper'
import MarkInput from './mark-input'

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
 * Query open/save
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Query open/save menu
 */
class QueryOpenSave extends Component {
  constructor(props) {
    super(props);

    this.state = {
      severityList: [],
      newQueryName: true,
      pattern: {
        name: '',
        periodMin: '',
        threshold: '',
        severity: 'Emergency'
      },
      activePatternId: '',
      patternCheckbox: false,
      periodCheckbox: false,
      info: ''
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.setSeverityList();
  }
  /**
   * Set Severity list
   * @method
   */
  setSeverityList = () => {
    let severityList = [];   

    _.forEach(SEVERITY_TYPE, val => {
      severityList.push({
        value: val,
        text: val
      });
    })

    this.setState({
      severityList
    });
  }
  /**
   * Set and close query menu
   * @method
   * @param {string} type - query type ('open' or 'save')
   */
  handleQueryAction = (type) => {
    const {pattern, patternCheckbox, periodCheckbox} = this.state;
    const {activeTab, filterData, queryData, markData} = this.props;   

    if (type === 'open') {
      let tempQueryData = {...queryData};
      tempQueryData.openFlag = true;
      tempQueryData.displayId = queryData.id;
      tempQueryData.displayName = queryData.name;

      this.props.setQueryData(tempQueryData);

      if (queryData.query) {
        if (activeTab === 'logs') {
          let formattedMarkData = [];

          _.forEach(queryData.query.search, val => {
            if (val) {
              formattedMarkData.push({
                data: val
              });
            }
          })
          this.props.setMarkData(formattedMarkData);
        }
        this.props.setFilterData(queryData.query.filter);
      }
    } else if (type === 'save') {
      const {baseUrl} = this.context;
      const {account, queryData} = this.props;
      const {newQueryName} = this.state;
      let tempFilterData = [];
      let url = '';
      let queryText = {};
      let requestType = '';
      let data = {};

      _.forEach(filterData, val => {
        if (val.query) {
          tempFilterData.push({
            condition: val.condition,
            query: val.query.trim()
          });
        }
      })

      if (_.isEmpty(tempFilterData)) { //Close Save dialog if filterData is empty
        this.props.closeDialog();
        return;
      }

      if (newQueryName) {
        if (!queryData.inputName) {
          this.setState({
            info: t('events.connections.txt-noOpenQuery')
          });
          return;
        }
      }

      if (activeTab === 'alert') {
        url = `${baseUrl}/api/account/alert/queryText`;
        queryText = {
          filter: filterData
        };
      } else if (activeTab === 'logs') {
        let markDataArr = [];
        url = `${baseUrl}/api/v1/account/syslog/queryText`;

        _.forEach(markData, val => {
          if (val.data) {
            markDataArr.push(val.data);
          }
        })

        queryText = {
          filter: filterData,
          search: markDataArr
        };
      } else {
        url = `${baseUrl}/api/account/event/queryText`;
        queryText = {
          filter: filterData
        };
      }

      if (newQueryName) {
        requestType = 'POST';
        data = {
          accountId: account.id,
          name: queryData.inputName,
          queryText
        };
      } else {
        requestType = 'PATCH';
        data = {
          id: queryData.id,
          name: this.getQueryName(),
          queryText
        };
      }

      if (activeTab === 'logs') {
        if (patternCheckbox) {
          if (pattern.severity) {
            data.severity = pattern.severity;
          }

          if (periodCheckbox) {
            if (pattern.periodMin) {
              data.periodMin = pattern.periodMin;
            }

            if (pattern.threshold) {
              data.threshold = pattern.threshold;
            }
          }
        } else { //Pattern script checkbox is unchecked
          this.setState({
            activePatternId: ''
          });
        }
      }

      helper.getAjaxData(requestType, url, data)
      .then(data => {
        if (data) {
          helper.showPopupMsg(t('events.connections.txt-querySaved'));
          this.props.getSavedQuery();
        }
        return null;
      });
    }
    this.props.closeDialog();
  }
  /**
   * Get active query name
   * @method
   * @returns matched query name
   */
  getQueryName = () => {
    const {queryData} = this.props;
    let queryName = '';

    _.forEach(queryData.list, val => {
      if (val.id === queryData.id) {
        queryName = val.name;
        return false;
      }
    })

    return queryName;
  }
  /**
   * Display delete query content
   * @method
   * @returns HTML DOM
   */
  getDeleteQueryContent = () => {
    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {this.getQueryName()}?</span>
      </div>
    )
  }
  /**
   * Open delete query dialog
   * @method
   */
  removeQuery = () => {
    PopupDialog.prompt({
      title: t('events.connections.txt-deleteFilter'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteQueryContent(),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteFilterQuery();
        }
      }
    });
  }
  /**
   * Delete saved query and reset query data
   * @method
   */
  deleteFilterQuery = () => {
    const {baseUrl} = this.context;
    const {activeTab, queryData} = this.props;
    let url = '';

    if (!queryData.id) {
      return;
    }

    if (activeTab === 'alert') {
      url = `${baseUrl}/api/account/alert/queryText?id=${queryData.id}`;
    } else if (activeTab === 'logs') {
      url = `${baseUrl}/api/account/syslog/queryText?id=${queryData.id}`;
    } else {
      url = `${baseUrl}/api/account/event/queryText?id=${queryData.id}`;
    }

    this.ah.one({
      url,
      type: 'DELETE'
    })
    .then(data => {
      if (data) {
        let newQueryList = [];
        let tempQueryData = {...queryData};

        _.forEach(queryData.list, val => {
          if (val.id !== queryData.id) {
            newQueryList.push(val);
          }
        })

        if (newQueryList.length > 0) {
          tempQueryData.id = newQueryList[0].id;
          tempQueryData.name = newQueryList[0].name;
          tempQueryData.list = newQueryList;
          tempQueryData.query = newQueryList[0].queryText;
        } else {
          tempQueryData.id = '';
          tempQueryData.name = '';
          tempQueryData.list = [];
          tempQueryData.query = '';
        }

        this.props.setQueryData(tempQueryData);
      } else {
        helper.showPopupMsg('', t('txt-error'), err.message);
      }
      return null;
    });
  }
  /**
   * Display all saved filter queries
   * @method
   * @param {object} value - saved query data
   * @param {number} index - index of the queryDataList array
   * @returns FilterInput component
   */
  displayFilterQuery = (value, index) => {
    const {activeTab, logFields} = this.props;

    return (
      <FilterInput
        key={index}
        activeTab={activeTab}
        logFields={logFields}
        queryType='query'
        filterData={[{
          condition: value.condition,
          query: value.query
        }]}
        inline={false} />
    )
  }
  /**
   * Display all saved mark
   * @method
   * @param {object} value - saved mark data
   * @param {number} index - index of the queryDataMark array
   * @returns MarkInput component
   */
  displayMarkSearch = (value, index) => {
    const {activeTab, logFields} = this.props;

    return (
      <MarkInput
        key={index}
        activeTab={activeTab}
        logFields={logFields}
        queryType='query'
        markData={[{
          data: value
        }]}
        inline={false} />
    )
  }
  /**
   * Set query data for new selected saved query
   * @method
   * @param {string} type - input type ('id' or 'name')
   * @param {number} value - input value
   */
  handleQueryChange = (type, value) => {
    const {activeTab, queryData} = this.props;
    const {newQueryName, pattern} = this.state;
    let tempQueryData = {...queryData};
    let tempPattern = {...pattern};
    let patternCheckbox = false;
    let periodCheckbox = false;
    let queryName = '';

    if (type === 'id') {
      tempQueryData.id = value;    
      tempQueryData.openFlag = true;
      tempQueryData.query = {};

      tempQueryData.pattern = {
        name: '',
        periodMin: '',
        threshold: '',
        severity: ''
      };
      tempPattern = {
        name: '',
        periodMin: '',
        threshold: '',
        severity: 'Emergency'
      };

      _.forEach(queryData.list, val => {
        if (val.id === value) {
          let formattedQueryText = [];
          tempQueryData.name = val.name;

          _.forEach(val.queryText.filter, val => {
            let formattedValue = val.condition.toLowerCase();
            formattedValue = formattedValue.replace(' ', '_');

            formattedQueryText.push({
              condition: formattedValue,
              query: val.query.trim()
            });
          })

          tempQueryData.query.filter = formattedQueryText;

          if (activeTab === 'logs') {
            tempQueryData.query.search = val.queryText.search;
          }

          if (val.patternName) {
            tempQueryData.pattern.name = val.patternName;
            tempPattern.name = val.patternName;
          }

          if (val.periodMin) {
            tempQueryData.pattern.periodMin = val.periodMin;
            tempPattern.periodMin = val.periodMin;
            periodCheckbox = true;
          }

          if (val.threshold) {
            tempQueryData.pattern.threshold = val.threshold;
            tempPattern.threshold = val.threshold;
            periodCheckbox = true;
          }

          if (val.severity) {
            tempQueryData.pattern.severity = val.severity;
            tempPattern.severity = val.severity;
            patternCheckbox = true;
          }
          return false;
        }
      })

      if (value === 'new') {
        queryName = true;
      } else {
        queryName = false;
      }
    } else if (type === 'name') {
      queryName = newQueryName;
      tempQueryData.inputName = value;
    }

    this.props.setQueryData(tempQueryData);
    this.setState({
      newQueryName: queryName,
      pattern: tempPattern,
      patternCheckbox,
      periodCheckbox
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
    tempPattern[type] = value;

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
    tempPattern[type] = event.target.value;

    this.setState({
      pattern: tempPattern
    });
  }
  /**
   * Toggle pattern period checkbox
   * @method
   */
  toggleCheckbox = (type) => {
    if (type === 'pattern') {
      this.setState({
        patternCheckbox: !this.state.patternCheckbox
      });
    } else if (type === 'period') {
      this.setState({
        periodCheckbox: !this.state.periodCheckbox
      });
    }
  }
  /**
   * Display query menu content
   * @method
   * @param {string} type - query type ('open' or 'save')
   * @returns HTML DOM
   */
  displayQueryContent = (type) => {
    const {locale} = this.context;
    const {activeTab, queryData, filterData, markData} = this.props;
    const {pattern, severityList, patternCheckbox, periodCheckbox} = this.state;
    let displayList = [];
    let tempFilterData = [];
    let tempMarkData = [];

    if (queryData.list.length > 0) {
      _.forEach(queryData.list, val => {
        displayList.push({
          value: val.id,
          text: val.name
        });
      })
    }

    if (type === 'open') {
      let queryDataList = [];
      let queryDataMark = [];

      if (queryData.list.length === 0) {
        return <div className='error-msg'>{t('events.connections.txt-noSavedQuery')}</div>
      }

      if (activeTab === 'logs') {
        queryDataList = queryData.query.filter;
        queryDataMark = queryData.query.search;
      } else {
        queryDataList = queryData.query.filter;
      }

      return (
        <div>
          <label>{t('events.connections.txt-queryName')}</label>
          <DropDownList
            className='query-name dropdown'
            list={displayList}
            required={true}
            onChange={this.handleQueryChange.bind(this, 'id')}
            value={queryData.id} />

          {queryDataList && queryDataList.length > 0 &&
            <div className='filter-group'>
              {queryDataList.map(this.displayFilterQuery)}
            </div>
          }

          {queryDataMark && queryDataMark.length > 0 &&
            <div className='filter-group'>
              {queryDataMark.map(this.displayMarkSearch)}
            </div>
          }

          {activeTab === 'logs' && queryData.patternId &&
            <div>
              <Checkbox
                id='patternCheckbox'
                onChange={this.toggleCheckbox.bind(this, 'pattern')}
                checked={true}
                disabled={true} />
              <span>{t('events.connections.txt-addPatternScript')}</span>

              {locale === 'zh' &&
                <div className='group severity-level'>
                  <label htmlFor='severityLevel'>{f('syslogPatternTableFields.severity')}</label>
                  <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[queryData.pattern.severity]}}></i>
                  <DropDownList
                    id='severityLevel'
                    required={true}
                    list={severityList}
                    value={queryData.pattern.severity}
                    readOnly={true} />
                  <div className='period'>
                    <Checkbox
                      id='periodCheckbox'
                      className='period-checkbox'
                      onChange={this.toggleCheckbox.bind(this, 'period')}
                      checked={queryData.pattern.periodMin !== '' || queryData.pattern.threshold !== ''}
                      disabled={true} />
                    <span>在 </span>
                    <input
                      id='periodMin'
                      className='number'
                      type='number'
                      min='1'
                      onChange={this.handleNumberChange.bind(this, 'periodMin')}
                      value={queryData.pattern.periodMin}
                      readOnly={true} />
                    <span> 分鐘內超過或等於 </span>
                    <input
                      id='threshold'
                      className='number'
                      type='number'
                      min='1'
                      onChange={this.handleNumberChange.bind(this, 'threshold')}
                      value={queryData.pattern.threshold}
                      readOnly={true} />
                    <span> 次</span>
                  </div>
                </div>
              }
              {locale === 'en' &&
                <div className='group severity-level'>
                  <label htmlFor='severityLevel'>{f('syslogPatternTableFields.severity')}</label>
                  <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[queryData.pattern.severity]}}></i>
                  <DropDownList
                    id='severityLevel'
                    required={true}
                    list={severityList}
                    value={queryData.pattern.severity}
                    readOnly={true} />
                  <div className='period'>
                    <Checkbox
                      id='periodCheckbox'
                      className='period-checkbox'
                      onChange={this.toggleCheckbox.bind(this, 'period')}
                      checked={queryData.pattern.periodMin !== '' || queryData.pattern.threshold !== ''}
                      disabled={true} />
                    <span>Occurs more than or equal to </span>
                    <input
                      id='periodMin'
                      className='number'
                      type='number'
                      min='1'
                      onChange={this.handleNumberChange.bind(this, 'periodMin')}
                      value={queryData.pattern.periodMin}
                      readOnly={true} />
                    <span> times in </span>
                    <input
                      id='threshold'
                      className='number'
                      type='number'
                      min='1'
                      onChange={this.handleNumberChange.bind(this, 'threshold')}
                      value={queryData.pattern.threshold}
                      readOnly={true} />
                    <span> minutes</span>
                  </div>
                </div>
              }
            </div>
          }

          <button className='standard delete-query' onClick={this.removeQuery} disabled={queryData.displayId === queryData.id}>{t('txt-delete')}</button>
        </div>
      )
    } else if (type === 'save') {
      let dropDownValue = 'new';

      _.forEach(filterData, val => {
        if (val.query) {
          tempFilterData.push({
            condition: val.condition,
            query: val.query.trim()
          });
        }
      })

      _.forEach(markData, val => {
        if (val.data) {
          tempMarkData.push({
            data: val.data
          });
        }
      })

      if (activeTab === 'logs') {
        if (tempFilterData.length === 0 && tempMarkData.length == 0) {
          return <div className='error-msg'>{t('events.connections.txt-noOpenQuery')}</div>
        }
      } else {
        if (tempFilterData.length === 0) {
          return <div className='error-msg'>{t('events.connections.txt-noOpenQuery')}</div>
        }
      }

      displayList.unshift({
        value: 'new',
        text: t('events.connections.txt-addQuery')
      });

      if (queryData.openFlag) {
        dropDownValue = queryData.id;
      }

      return (
        <div>
          <label>{t('events.connections.txt-queryName')}</label>
          <DropDownList
            className='query-name dropdown'
            list={displayList}
            required={true}
            onChange={this.handleQueryChange.bind(this, 'id')}
            value={dropDownValue} />

          {dropDownValue === 'new' &&
            <Input
              placeholder={t('events.connections.txt-enterQueryName')}
              className='query-name'
              maxLength={50}
              required={true}
              validate={{
                t: et
              }}
              onChange={this.handleQueryChange.bind(this, 'name')}
              value={queryData.inputName} />
          }

          {tempFilterData.length > 0 &&
            <div className='filter-group'>
              {tempFilterData.map(this.displayFilterQuery)}
            </div>
          }

          {tempMarkData.length > 0 &&
            <div className='filter-group'>
              {tempMarkData.map(this.displayMarkSearch)}
            </div>
          }

          {activeTab === 'logs' &&
            <div>
              <Checkbox
                id='patternCheckbox'
                onChange={this.toggleCheckbox.bind(this, 'pattern')}
                checked={patternCheckbox} />
              <span>{t('events.connections.txt-addPatternScript')}</span>

              {locale === 'zh' &&
                <div className='group severity-level'>
                  <label htmlFor='severityLevel'>{f('syslogPatternTableFields.severity')}</label>
                  <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[pattern.severity]}}></i>
                  <DropDownList
                    id='severityLevel'
                    required={true}
                    list={severityList}
                    onChange={this.handleDataChange.bind(this, 'severity')}
                    value={pattern.severity}
                    readOnly={!patternCheckbox} />
                  <div className='period'>
                    <Checkbox
                      id='periodCheckbox'
                      className='period-checkbox'
                      onChange={this.toggleCheckbox.bind(this, 'period')}
                      checked={periodCheckbox}
                      disabled={!patternCheckbox} />
                    <span>在 </span>
                    <input
                      id='periodMin'
                      className='number'
                      type='number'
                      min='1'
                      onChange={this.handleNumberChange.bind(this, 'periodMin')}
                      value={pattern.periodMin}
                      readOnly={!periodCheckbox} />
                    <span> 分鐘內超過或等於 </span>
                    <input
                      id='threshold'
                      className='number'
                      type='number'
                      min='1'
                      onChange={this.handleNumberChange.bind(this, 'threshold')}
                      value={pattern.threshold}
                      readOnly={!periodCheckbox} />
                    <span> 次</span>
                  </div>
                </div>
              }
              {locale === 'en' &&
                <div className='group severity-level'>
                  <label htmlFor='severityLevel'>{f('syslogPatternTableFields.severity')}</label>
                  <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[pattern.severity]}}></i>
                  <DropDownList
                    id='severityLevel'
                    required={true}
                    list={severityList}
                    onChange={this.handleDataChange.bind(this, 'severity')}
                    value={pattern.severity}
                    readOnly={!periodCheckbox} />
                  <div className='period'>
                    <Checkbox
                      id='periodCheckbox'
                      className='period-checkbox'
                      onChange={this.toggleCheckbox.bind(this, 'period')}
                      checked={periodCheckbox || (pattern.periodMin || pattern.threshold)}
                      disabled={!patternCheckbox} />
                    <span>Occurs more than or equal to </span>
                    <input
                      id='periodMin'
                      className='number'
                      type='number'
                      min='1'
                      onChange={this.handleNumberChange.bind(this, 'periodMin')}
                      value={pattern.periodMin}
                      readOnly={!periodCheckbox} />
                    <span> times in </span>
                    <input
                      id='threshold'
                      className='number'
                      type='number'
                      min='1'
                      onChange={this.handleNumberChange.bind(this, 'threshold')}
                      value={pattern.threshold}
                      readOnly={!periodCheckbox} />
                    <span> minutes</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      )
    }
  }
  render() {
    const {type} = this.props;
    const {info} = this.state;
    let titleText = '';

    if (type === 'open') {
      titleText = t('events.connections.txt-openQuery');
    } else if (type === 'save') {
      titleText = t('events.connections.txt-saveQuery');
    }

    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.closeDialog},
      confirm: {text: t('txt-confirm'), handler: this.handleQueryAction.bind(this, type)}
    };

    return (
      <ModalDialog
        id='queryDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        info={info}
        closeAction='cancel'>
        {this.displayQueryContent(type)}
      </ModalDialog>
    )
  }
}

QueryOpenSave.contextType = BaseDataContext;

QueryOpenSave.propTypes = {
  activeTab: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired,
  filterData: PropTypes.array.isRequired,
  setFilterData: PropTypes.func.isRequired,
  setQueryData: PropTypes.func.isRequired,
  getSavedQuery: PropTypes.func.isRequired,
  closeDialog: PropTypes.func.isRequired
};

export default QueryOpenSave;