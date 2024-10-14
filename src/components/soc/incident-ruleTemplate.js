import React, { Component } from 'react'
import _ from 'lodash'
import cx from 'classnames'
import moment from 'moment'

import Button from '@material-ui/core/Button'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import MenuItem from '@material-ui/core/MenuItem'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../common/context'
import constants from '../constant/constant-incidnet'
import FilterInput from '../common/filter-input'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'
import MuiTableContentWithoutLoading from '../common/mui-table-content-withoutloading'
import SocConfig from '../common/soc-configuration'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;
let it = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const PERIOD_MIN = [10, 15, 30, 60];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};

/**
 * Settings - IncidentRuleTemplate
 * @class
 * @author Kenneth Chiao <kennethchiao@ns-guard.com>
 * @summary A react component to show the IncidentRuleTemplate page
 */
class IncidentRuleTemplate extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');

    this.state = {
      activeContent: 'tableList', //tableList, viewItem, editItem
      showFilter: false,
      searchParam: {
        keyword: '',
        category: 0,
        impact: 0,
        severity: '',
        status: true
      },
      severityList: [],
      periodMinList: [],
      originalData: {},
      accountType: constants.soc.LIMIT_ACCOUNT,
      formValidation: {
        title: {
          valid: true,
          msg: ''
        },
        eventDescription: {
          valid: true,
          msg: ''
        }
      },
      incidentRule: {
        dataFieldsArr: ['accountQueryDTO.name', 'title', 'severity', 'impact', 'category', 'eventDescription', 'accountQueryDTO.module', 'status', '_menu'],
        dataFields: [],
        dataContent: [],
        sort: {
          field: 'severity',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        info: {
          accountQueryDTO: {},
          alertPattern: {},
          id: '',
          title: '',
          severity: 'Emergency',
          category: 0,
          impact: 0,
          eventDescription: '',
          limitQuery: 10,
          status: true
        }
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'soc', locale);
    helper.inactivityTime(baseUrl, locale);

    this.checkAccountType();

    this.setDefaultSearchOptions();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  checkAccountType = () => {
    const {baseUrl, session} = this.context;
    const requestData = {
      account: session.accountId
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/unit/limit/_check`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        if (data.rt.isLimitType === constants.soc.LIMIT_ACCOUNT) {
          this.setState({
            accountType: constants.soc.LIMIT_ACCOUNT
          });
        } else if (data.rt.isLimitType === constants.soc.NONE_LIMIT_ACCOUNT) {
          this.setState({
            accountType: constants.soc.NONE_LIMIT_ACCOUNT
          });
        } else {
          this.setState({
            accountType: constants.soc.CHECK_ERROR
          });
        }
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  setDefaultSearchOptions = () => {
    const severityList = _.map(SEVERITY_TYPE, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });

    const periodMinList = _.map(PERIOD_MIN, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });

    this.setState({
      severityList,
      periodMinList,
    }, () => {
      this.getData();
    });
  }
  /**
   * Get and set Incident Unit table data
   * @method
   * @param options
   */
  getData = (options) => {
    const {baseUrl, contextRoot, session} = this.context;
    const {searchParam, incidentRule} = this.state;
    const sort = incidentRule.sort.desc ? 'desc' : 'asc';
    const page = options === 'currentPage' ? incidentRule.currentPage : 0;
    const url = `${baseUrl}/api/soc/template/_search?page=${page + 1}&pageSize=${incidentRule.pageSize}&orders=${incidentRule.sort.field} ${sort}`;
    let requestData = {};

    if (searchParam.keyword) {
      requestData.keyword = searchParam.keyword;
    }

    if (searchParam.category) {
      requestData.category = searchParam.category;
    }

    if (searchParam.impact) {
      requestData.impact = searchParam.impact;
    }

    if (searchParam.severity) {
      requestData.severity = searchParam.severity;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempData = {...incidentRule};
        tempData.dataContent = data.rows;
        tempData.totalCount = data.counts;
        tempData.currentPage = page;

        tempData.dataFields = _.map(incidentRule.dataFieldsArr, val => {
          return {
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : f(`incidentFields.${val}`),
            options: {
              filter: true,
              sort: val === 'severity',
              viewColumns: val !== '_menu',
              customBodyRenderLite: (dataIndex, options) => {
                const allValue = tempData.dataContent[dataIndex];
                let value = tempData.dataContent[dataIndex][val];

                if (options === 'getAllValue') {
                  return allValue;
                }

                if (val === 'updateDttm' || val === 'createDttm') {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                } else if (val === 'category') {
                  return <span>{it(`category.${value}`)}</span>
                } else if (val === 'severity') {
                  return <span className='severity-level' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>
                } else if (val === 'accountQueryDTO.module') {
                  let accountDTO = tempData.dataContent[dataIndex]['accountQueryDTO'];
                  return <span>{accountDTO ? accountDTO.module : ''}</span>
                } else if (val === 'accountQueryDTO.name') {
                  let accountDTO = tempData.dataContent[dataIndex]['accountQueryDTO'];
                  return <span>{accountDTO ? accountDTO.name : ''}</span>
                } else if (val === 'status') {
                  return value ? <CheckCircleOutlineIcon style={{fill: '#29CC7A'}}/> : <HighlightOffIcon style={{fill: '#CC2943'}}/>
                } else if (val === '_menu') {
                  return (
                    <div className='table-menu menu active'>
                      <i className='fg fg-eye' title={t('txt-view')} onClick={this.toggleContent.bind(this, 'view', allValue)}/>
                    </div>
                  )
                } else {
                  return <span>{value}</span>
                }
              }
            }
          };
        });

        this.setState({
          incidentRule: tempData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let temp = {...this.state.incidentRule};
    temp[type] = Number(value);

    this.setState({
      incidentRule: temp
    }, () => {
      this.getData(type);
    });
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let temp = {...this.state.incidentRule};
    temp.sort.field = field;
    temp.sort.desc = sort;

    this.setState({
      incidentRule: temp
    }, () => {
      this.getData();
    });
  }
  toggleContent = (type, allValue) => {
    const {originalData, incidentRule} = this.state;
    let tempData = {...incidentRule};
    let showPage = type;

    if (type === 'tableList') {
      tempData.info = {
        accountQueryDTO: {},
        alertPattern: {},
        id: '',
        title: '',
        severity: 'Emergency',
        category: 0,
        impact: 0,
        eventDescription: '',
        limitQuery: 10,
        status: true
      };
    } else if (type === 'view') {
      tempData.info = {
        accountQueryDTO: allValue.accountQueryDTO,
        alertPattern: allValue.alertPatternDTO,
        id: allValue.id,
        title: allValue.title,
        severity: allValue.severity,
        category: allValue.category,
        impact: allValue.impact,
        eventDescription: allValue.eventDescription,
        limitQuery: allValue.limitQuery,
        status: allValue.status
      };

      this.setState({
        originalData: _.cloneDeep(tempData)
      });
    } else if (type === 'cancel') {
      showPage = 'view';
      tempData = _.cloneDeep(originalData);
    } else if (type === 'save') {
      showPage = 'view';
    }

    this.setState({
      showFilter: false,
      activeContent: showPage,
      incidentRule: tempData
    }, () => {
      if (type === 'tableList') {
        this.getData();
      }
    });
  }
  handleSeverityWithSOCChange = (event) => {
    const {incidentRule} = this.state;
    let tempData = {...incidentRule};
    tempData.info[event.target.name] = event.target.value;

    if (event.target.name === 'severity') {
      if (event.target.value === 'Emergency') {
        tempData.info['impact'] = 4;
      } else if (event.target.value === 'Alert') {
        tempData.info['impact'] = 3;
      } else if (event.target.value === 'Notice') {
        tempData.info['impact'] = 1;
      } else if (event.target.value === 'Warning') {
        tempData.info['impact'] = 2;
      } else if (event.target.value === 'Critical') {
        tempData.info['impact'] = 3;
      }
    }

    this.setState({
      incidentRule: tempData
    });
  }
  handlePatternChange = (event) => {
    const {incidentRule} = this.state;
    let tempData = {...incidentRule};
    tempData.info.alertPattern[event.target.name] = event.target.value;
    tempData.info[event.target.name] = event.target.value;

    if (event.target.name === 'severity') {
      if (event.target.value === 'Emergency') {
        tempData.info['impact'] = 4;
      } else if (event.target.value === 'Alert') {
        tempData.info['impact'] = 3;
      } else if (event.target.value === 'Notice') {
        tempData.info['impact'] = 1;
      } else if (event.target.value === 'Warning') {
        tempData.info['impact'] = 2;
      } else if (event.target.value === 'Critical') {
        tempData.info['impact'] = 3;
      }
    }

    this.setState({
      incidentRule: tempData
    });
  }
  handleChange = (field, value) => {
    const {incidentRule} = this.state;
    let tempData = {...incidentRule};
    tempData.info[field] = value;

    this.setState({
      incidentRule: tempData
    });
  }
  handlePatternSubmit = () => {
    const {baseUrl, session} = this.context;
    const {incidentRule, activeContent} = this.state;

    if (!session.accountId) {
      return;
    }

    if (incidentRule.info.alertPattern) {
      const requestData = {
        accountId: incidentRule.info.alertPattern.accountId,
        patternName: incidentRule.info.alertPattern.patternName,
        severity: incidentRule.info.alertPattern.severity,
        queryScript: incidentRule.info.alertPattern.queryScript,
        periodMin: Number(incidentRule.info.alertPattern.periodMin),
        threshold: Number(incidentRule.info.alertPattern.threshold),
        patternId: incidentRule.info.alertPattern.patternId
      };

      this.ah.one({
        url: `${baseUrl}/api/alert/pattern`,
        data: JSON.stringify(requestData),
        type: 'PATCH',
        contentType: 'text/plain'
      })
      .then(data => {
        const requestData = {
          id: incidentRule.info.id,
          title: incidentRule.info.title,
          severity: incidentRule.info.severity,
          category: incidentRule.info.category,
          impact: incidentRule.info.impact,
          eventDescription: incidentRule.info.eventDescription,
          limitQuery: incidentRule.info.limitQuery,
          status: incidentRule.info.status
        };

        this.ah.one({
          url: `${baseUrl}/api/soc/template`,
          data: JSON.stringify(requestData),
          type: 'POST',
          contentType: 'text/plain'
        })
        .then(data => {
          if (data) {
            let showPage = '';

            if (activeContent === 'add') {
              showPage = 'tableList';
            } else if (activeContent === 'edit') {
              showPage = 'save';
            }

            this.toggleContent(showPage);

            helper.showPopupMsg('', t('txt-success'), t('network-topology.txt-saveSuccess'));
          } else {
            helper.showPopupMsg('', t('txt-error'), t('txt-fail'));
          }
          return null;
        })
        .catch(err => {
          helper.showPopupMsg('', t('txt-error'), err.message);
        })
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    } else {
      const requestData = {
        id: incidentRule.info.id,
        title: incidentRule.info.title,
        severity: incidentRule.info.severity,
        category: incidentRule.info.category,
        impact: incidentRule.info.impact,
        eventDescription: incidentRule.info.eventDescription,
        limitQuery: incidentRule.info.limitQuery,
        status: incidentRule.info.status
      };

      this.ah.one({
        url: `${baseUrl}/api/soc/template`,
        data: JSON.stringify(requestData),
        type: 'POST',
        contentType: 'text/plain'
      })
      .then(data => {
        if (data) {
          helper.showPopupMsg('', t('txt-success'), t('network-topology.txt-saveSuccess'));
          let showPage = '';

          if (activeContent === 'add') {
            showPage = 'tableList';
          } else if (activeContent === 'edit') {
            showPage = 'save';
          }

          this.toggleContent(showPage);
        } else {
          helper.showPopupMsg('', t('txt-error'), t('txt-fail'));
        }
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
  }
  displayMarkSearch = (value, index) => {
    return (
      <FilterInput
        queryType='query'
        filterData={[{
          condition: value.condition,
          query: value.query
        }]} />
    )
  }
  displayEditContent = () => {
    const {activeContent, severityList, periodMinList, incidentRule, formValidation} = this.state;
    let pageType = '';

    if (activeContent === 'add') {
      pageType = 'tableList';
    } else if (activeContent === 'edit') {
      pageType = 'cancel';
    }

    return (
      <div className='main-content basic-form'>
        <header className='main-header'>{it('txt-incident-soc-rule')}</header>

        <div className='content-header-btns'>
          {activeContent === 'view' &&
            <div>
              <Button variant='outlined' color='primary' className='standard btn list' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'edit')}>{t('txt-edit')}</Button>
            </div>
          }
        </div>

        <div className='form-group normal'>
          <header>
            <div className='text'>{it('txt-soc-filter')}</div>
          </header>
          <div className='group'>
            <TextField
              id='patternName'
              name='name'
              label={f('incidentFields.accountQueryDTO.name')}
              variant='outlined'
              fullWidth
              size='small'
              required
              value={incidentRule.info.accountQueryDTO.name}
              disabled />
          </div>
          <div className='group'>
            <TextField
              id='patternName'
              name='name'
              label={f('incidentFields.accountQueryDTO.module')}
              variant='outlined'
              fullWidth
              size='small'
              required
              value={incidentRule.info.accountQueryDTO.module}
              disabled />
          </div>
        </div>

        {incidentRule.info.accountQueryDTO.queryText.filter &&
          <div className='form-group normal'>
            <header>
              <div className='text'>{it('txt-soc-filter-input')}</div>
            </header>
            <div className='filter-group'>
              {incidentRule.info.accountQueryDTO.queryText.filter.map(this.displayMarkSearch)}
            </div>
          </div>
        }

        {incidentRule.info.accountQueryDTO.module === 'SYSLOG' &&
          <div className='form-group normal'>
            <header>
              <div className='text'>{t('system-defined-pattern.txt-patternInfo')}</div>
            </header>
            <div className='group'>
              <TextField
                id='patternName'
                name='name'
                label={f('syslogPatternTableFields.patternName')}
                variant='outlined'
                fullWidth
                size='small'
                required
                value={incidentRule.info.alertPattern.patternName}
                disabled />
            </div>
            <div className='group severity-level'>
              <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[incidentRule.info.severity]}}/>
              <TextField
                id='severityLevel'
                name='severity'
                select
                label={f('syslogPatternTableFields.severity')}
                variant='outlined'
                size='small'
                onChange={this.handlePatternChange}
                value={incidentRule.info.alertPattern.severity}
                disabled={activeContent === 'view'}>
                {severityList}
              </TextField>
            </div>

            <div className='group full'>
              <TextField
                id='queryScript'
                name='queryScript'
                label={f('syslogPatternTableFields.queryScript')}
                multiline
                rows={4}
                maxLength={250}
                variant='outlined'
                fullWidth
                size='small'
                required
                value={incidentRule.info.alertPattern.queryScript}
                disabled />
            </div>

            <div className='group full'>
              <div className='period'>
                <span className='support-text'>{t('events.connections.txt-patternQuery1')} </span>
                <TextField
                  className='number'
                  name='periodMin'
                  select
                  variant='outlined'
                  size='small'
                  required
                  value={incidentRule.info.alertPattern.periodMin}
                  disabled>
                  {periodMinList}
                </TextField>
                <span className='support-text'> {t('events.connections.txt-patternQuery2')} </span>
                <TextField
                  id='threshold'
                  className='number'
                  name='threshold'
                  type='number'
                  variant='outlined'
                  size='small'
                  InputProps={{inputProps: {min: 1, max: 1000}}}
                  required
                  value={incidentRule.info.alertPattern.threshold}
                  disabled />
                <span className='support-text'> {t('events.connections.txt-patternQuery3')}</span>
              </div>
            </div>
          </div>
        }

        <div className='form-group normal'>
          <header>
            <div className='text'>{t('events.connections.txt-enableSOCScript')}</div>
            <FormControlLabel
              className='switch-control'
              control={
                <Switch
                  checked={incidentRule.info.status}
                  onChange={(event) => this.handleChange('status', event.target.checked)}
                  color='primary' />
              }
              label={t('txt-switch')}
              disabled={activeContent === 'view'} />
          </header>
          <div className='group full'>
            <TextField
              name='title'
              variant='outlined'
              size='small'
              required
              fullWidth
              label={f('incidentFields.title')}
              value={incidentRule.info.title}
              error={!formValidation.title.valid}
              helperText={formValidation.title.msg}
              onChange={this.handleSeverityWithSOCChange}
              disabled={activeContent === 'view'}>
            </TextField>
          </div>
          <div className='group full'>
            <TextField
              name='eventDescription'
              variant='outlined'
              size='small'
              required
              fullWidth
              label={f('incidentFields.rule')}
              value={incidentRule.info.eventDescription}
              error={!formValidation.eventDescription.valid}
              helperText={formValidation.eventDescription.msg}
              onChange={this.handleSeverityWithSOCChange}
              disabled={activeContent === 'view'}>
            </TextField>
          </div>

          {incidentRule.info.accountQueryDTO.module !== 'SYSLOG' &&
            <div className='group severity-level' style={{width: '33vh', paddingRight: '33px'}}>
              <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[incidentRule.info.severity]}} />
              <TextField
                id='severity'
                name='severity'
                select
                fullWidth
                label={f('syslogPatternTableFields.severity')}
                variant='outlined'
                size='small'
                value={incidentRule.info.severity}
                onChange={this.handleSeverityWithSOCChange}
                disabled={activeContent === 'view'}>
                {severityList}
              </TextField>
            </div>
          }

          <div className='group'>
            <TextField
              id='impact'
              name='impact'
              variant='outlined'
              fullWidth
              size='small'
              onChange={this.handleSeverityWithSOCChange}
              required
              select
              label={f('incidentFields.impactAssessment')}
              value={incidentRule.info.impact}
              disabled>
              {
                _.map(_.range(1, 5), el => {
                  return <MenuItem value={el}>{`${el} (${(9 - 2 * el)} ${it('txt-day')})`}</MenuItem>
                })
              }
            </TextField>
          </div>
          <div className='group'>
            <TextField
              id='category'
              name='category'
              variant='outlined'
              fullWidth={true}
              size='small'
              onChange={this.handleSeverityWithSOCChange}
              required
              select
              label={f('incidentFields.category')}
              value={incidentRule.info.category}
              disabled={activeContent === 'view'}>
              {
                _.map(_.range(10, 20), el => {
                  return <MenuItem value={el}>{it(`category.${el}`)}</MenuItem>
                })
              }
            </TextField>
          </div>
          <div className='group full'>
            <div className='period'>
              <span className='support-text'>{t('events.connections.txt-socQuery1')} </span>
              <TextField
                name='limitQuery'
                variant='outlined'
                size='small'
                required
                value={incidentRule.info.limitQuery}
                onChange={this.handleSeverityWithSOCChange}
                disabled />
              <span className='support-text'>{t('events.connections.txt-socQuery2')} </span>
            </div>
          </div>
        </div>

        {(activeContent === 'add' || activeContent === 'edit') &&
          <footer>
            <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, pageType)}>{t('txt-cancel')}</Button>
            <Button variant='contained' color='primary' onClick={this.handlePatternSubmit}>{t('txt-save')}</Button>
          </footer>
        }
      </div>
    )
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {locale} = this.context;
    const {showFilter, searchParam, severityList} = this.state;

    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}/>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='keyword'>{f('incidentFields.keywords')}</label>
            <TextField
              id='keyword'
              name='keyword'
              type='text'
              variant='outlined'
              fullWidth={true}
              size='small'
              className='search-textarea'
              value={searchParam.keyword}
              onChange={this.handleLogInputSearchMui}/>
          </div>
          <div className='group'>
            <label htmlFor='searchCategory'>{f('incidentFields.severity')}</label>
            <TextField
              id='searchCategory'
              name='severity'
              select
              required={true}
              variant='outlined'
              fullWidth={true}
              size='small'
              value={searchParam.severity}
              onChange={this.handleLogInputSearchMui}>
              {severityList}
            </TextField>
          </div>
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.getData.bind(this, 'search')}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /* ---- Func Space ---- */
  /**
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable or null
   */
  checkSortable = (field) => {
    const unSortableFields = ['_menu'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - input type
   * @param {object} event - input value
   */
  handleLogInputSearchMui = (event) => {
    let tempSearch = {...this.state.searchParam};

    if (event.target.name === 'category') {
      tempSearch[event.target.name] = event.target.value;
    }

    tempSearch[event.target.name] = event.target.value.trim();

    this.setState({
      searchParam: tempSearch
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
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      searchParam: {
        keyword: '',
        category: 0,
        impact: 0,
        severity: ''
      }
    });
  }
  render() {
    const {session} = this.context;
    const {activeContent, baseUrl, contextRoot, showFilter, incidentRule, accountType} = this.state;
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
            <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'/></button>
          </div>
        </div>

        <div className='data-content'>
          <SocConfig baseUrl={baseUrl} contextRoot={contextRoot} session={session} accountType={accountType}/>
          <div className='parent-content'>
            {this.renderFilter()}

            {activeContent === 'tableList' &&
              <div className='main-content'>
                <header className='main-header'>{it('txt-incident-soc-rule')}</header>
                <MuiTableContentWithoutLoading
                  data={incidentRule}
                  tableOptions={tableOptions}/>
              </div>
            }
            {(activeContent === 'view' || activeContent === 'edit') &&
              this.displayEditContent()
            }
          </div>
        </div>
      </div>
    )
  }
}

IncidentRuleTemplate.contextType = BaseDataContext;

IncidentRuleTemplate.propTypes = {
  //nodeBaseUrl: PropTypes.string.isRequired
};

export default IncidentRuleTemplate;