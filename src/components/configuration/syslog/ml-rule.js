import React, { Component } from 'react';
import cx from 'classnames';
import moment from 'moment'

import Button from '@material-ui/core/Button';
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment'
import PopupDialog from 'react-ui/build/src/components/popup-dialog';
import LineChart from 'react-chart/build/src/components/line'
import BarChart from 'react-chart/build/src/components/bar'
import { BaseDataContext } from '../../common/context';
import Config from '../../common/configuration';
import helper from '../../common/helper';
import MuiTableContent from '../../common/mui-table-content';

import {
  default as ah,
  getInstance,
} from 'react-ui/build/src/utils/ajax-helper';

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29',
};
const ML_RULE_SEARCH = {
  name: '',
  observeColumn: '',
  ruleType: '',
  trainingStatus: ''
};
const FORM_VALIDATION = {
  name: {
    valid: true,
    msg: ''
  },
  queryScript: {
    valid: true,
    msg: ''
  },
  aggColumn: {
    valid: true,
    msg: ''
  },
  observeColumn: {
    valid: true,
    msg: ''
  },
  trainingDataTime: {
    valid: true,
    msg: ''
  },
  trainingTimeScale: {
    valid: true,
    msg: ''
  }
};

let t = null;
let f = null;
let et = null;
let at = null;

/**
 * MlRule
 * @class
 * @summary A react component to show the Config Syslog ML Rule Management page
 */
class MlRule extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    at = global.chewbaccaI18n.getFixedT(null, 'account');

    this.state = {
      activeContent: 'tableList', //'tableList', 'viewMlRule', 'addMlRule' or 'editMlRule'
      showFilter: false,
      mlRuleSearch: _.cloneDeep(ML_RULE_SEARCH),
      originalMlRuleData: {},
      fieldsArr: [],
      logsLocale: {},
      severityList: [],
      currentMlRuleData: '',
      mlRule: {
        dataFieldsArr: [
          'patternName',
          'observeColumn',
          'ruleType',
          'createDttm',
          'lastUpdateDttm',
          'trainingStatus',
          'isDetection',
          '_menu',
        ],
        dataFields: [],
        dataContent: null,
        sort: {
          field: 'patternName',
          desc: false,
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        info: {
          id: '',
          name: '',
          createDttm: '',
          lastUpdateDttm: '',
          severity: 'Emergency',
          isDetection: true,
          queryScript: '',
          ruleType: 'abnormal',
          aggColumn: '',
          observeColumn: '',
          trainingDataTime: 1,
          trainingTimeScale: 1,
          trainingTimeScaleUnit: 'hour',
          thresholdWeight: 'low'
        }
      },
      formValidation: _.cloneDeep(FORM_VALIDATION),
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const { baseUrl, locale, sessionRights } = this.context;

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
    const { baseUrl, session } = this.context;

    const severityList = _.map(SEVERITY_TYPE, (val, i) => {
      return (
        <MenuItem
          key={i}
          value={val}
        >
          {val}
        </MenuItem>
      );
    });

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/account/log/fields?accountId=${session.accountId}`,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data && data.rt && data.rt.length > 0) {
        this.setState({
          fieldsArr: data.rt
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    ah.one({
      url: `${baseUrl}/api/account/log/locales?accountId=${session.accountId}`,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data && data.rt && data.rt.length > 0) {
        let localObj = {};

        _.forEach(data.rt, (val, key) => {
          localObj[val.field] = val.locale;
        })

        this.setState({
          logsLocale: localObj
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.setState(
      {
        severityList
      },
      () => {
        this.getMlRuleScript();
      }
    );
  };
  /**
   * Get custom field name
   * @method
   * @param {string} field - field name
   * @returns field name
   */
  getCustomFieldName = (field) => {
    const {logsLocale} = this.state;

    if (_.has(logsLocale, field)) {
      return logsLocale[field];
    } else {
      return f(`logsFields.${field}`);
    }
  }
  /**
   * Get and set ML rule script data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getMlRuleScript = (fromPage) => {
    const { baseUrl, session } = this.context;
    const { mlRuleSearch, mlRule } = this.state;
    const page = fromPage === 'currentPage' ? mlRule.currentPage : 0;
    let query = '';

    if (mlRuleSearch.name) {
      query += `&patternName=${mlRuleSearch.name}`;
    }

    if (mlRuleSearch.observeColumn && mlRuleSearch.observeColumn !== 'all') {
      query += `&observeColumn=${mlRuleSearch.observeColumn}`;
    }
    
    if (mlRuleSearch.ruleType && mlRuleSearch.ruleType !== 'all') {
      query += `&ruleType=${mlRuleSearch.ruleType}`;
    }

    if (mlRuleSearch.trainingStatus && mlRuleSearch.trainingStatus !== 'all') {
      query += `&trainingStatus=${mlRuleSearch.trainingStatus}`;
    }

    this.ah
      .one({
        url: `${baseUrl}/api/alert/ml_rule?accountId=${
          session.accountId
        }${query}&page=${page + 1}&pageSize=${mlRule.pageSize}`,
        type: 'GET',
      })
      .then((data) => {
        if (data) {
          let tempMlRule = { ...mlRule };

          if (!data.rows || data.rows.length === 0) {
            tempMlRule.dataContent = [];
            tempMlRule.totalCount = 0;

            this.setState({
              mlRule: tempMlRule,
            });
            return null;
          }

          tempMlRule.dataContent = data.rows;
          tempMlRule.totalCount = data.counts;
          tempMlRule.currentPage = page;
          tempMlRule.dataFields = _.map(mlRule.dataFieldsArr, (val) => {
            return {
              name: val,
              label:
                val === '_menu' ? ' ' : f(`syslogMlRuleTableFields.${val}`),
              options: {
                sort: false,
                viewColumns: val === '_menu' ? false : true,
                customBodyRenderLite: (dataIndex) => {
                  const allValue = tempMlRule.dataContent[dataIndex];
                  const value = tempMlRule.dataContent[dataIndex][val];

                  if (val === 'ruleType') {
                    return value ? f('syslogMlRuleTableFields.ruleType-' + value) : '';
                  } else if (val === 'observeColumn') {
                    return this.getCustomFieldName(value)
                  } else if (val === 'trainingStatus') {
                    return <span className={'training-status training-status-' + value}>{f('syslogMlRuleTableFields.trainingStatus-' + value)}</span>
                  } else if (val === 'isDetection') {
                    return value ? t('txt-true') : t('txt-false');
                  } else if (val === 'createDttm' || val === 'lastUpdateDttm') {
                    return helper.getFormattedDate(value, 'local');
                  } else if (val === '_menu') {
                    return (
                      <div className='table-menu menu active'>
                        <i
                          className='fg fg-eye'
                          onClick={this.toggleContent.bind(
                            this,
                            'viewMlRule',
                            allValue
                          )}
                          title={t('txt-view')}
                        ></i>
                        <i
                          className='fg fg-trashcan'
                          onClick={this.openDeleteMenu.bind(this, allValue)}
                          title={t('txt-delete')}
                        ></i>
                      </div>
                    );
                  }
                  return value;
                },
              },
            };
          });

          this.setState({
            mlRule: tempMlRule,
          });
        }
        return null;
      })
      .catch((err) => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      });
  };
  /**
   * Toggle different content
   * @method
   * @param {string} type - page type ('tableList', 'viewMlRule', 'addMlRule', editMlRule' and 'cancel')
   * @param {object} allValue - ML rule data
   */
  toggleContent = (type, allValue) => {
    const {
      originalMlRuleData,
      mlRule
    } = this.state;
    let tempMlRule = { ...mlRule };
    let showPage = type;

    if (type === 'tableList') {
      tempMlRule.info = {
        id: '',
        name: '',
        aggColumn: '',
        ruleType: 'abnormal',
        createDttm: '',
        lastUpdateDttm: '',
        trainingStatus: 'Waiting',
        isDetection: true
      };
    } else if (type === 'viewMlRule') {
      tempMlRule.info = {
        id: allValue.patternId,
        name: allValue.patternName,
        isDetection: allValue.isDetection,
        severity: allValue.severity,
        queryScript: allValue.queryScript,
        ruleType: allValue.ruleType,
        aggColumn: allValue.aggColumn,
        observeColumn: allValue.observeColumn,
        trainingDataTime: allValue.trainingDataTime,
        trainingTimeScale: allValue.trainingTimeScale,
        trainingTimeScaleUnit: allValue.trainingTimeScaleUnit,
        thresholdWeight: allValue.thresholdWeight,
        trainingStatus: allValue.trainingStatus,
        createDttm: allValue.createDttm,
        lastUpdateDttm: allValue.lastUpdateDttm
      };

      let mlPrediction = {}
      if (allValue.mlPrediction)
        _.forEach(eval(allValue.mlPrediction), (p) => {
          mlPrediction[_.keys(p)[0]] = p[_.keys(p)[0]];
        });
      tempMlRule.info.mlPrediction = mlPrediction;
      tempMlRule.info.mlPredictionSelectList = _.keys(mlPrediction);
      tempMlRule.info.mlPredictionSelected = _.keys(mlPrediction).length > 0 ? _.keys(mlPrediction)[0] : null;

      this.setState({
        showFilter: false,
        originalMlRuleData: _.cloneDeep(tempMlRule),
        formValidation: _.cloneDeep(FORM_VALIDATION)
      });
    } else if (type === 'addMlRule') {
      tempMlRule.info = {
        id: '',
        name: '',
        createDttm: '',
        lastUpdateDttm: '',
        severity: 'Emergency',
        isDetection: true,
        queryScript: '',
        ruleType: 'abnormal',
        aggColumn: '',
        observeColumn: '',
        trainingDataTime: 1,
        trainingTimeScale: 1,
        trainingTimeScaleUnit: 'hour',
        thresholdWeight: 'low'
      }
      this.setState({
        showFilter: false,
        formValidation: _.cloneDeep(FORM_VALIDATION),
      });
    } else if (type === 'cancel') {
      showPage = 'viewMlRule';
      tempMlRule = _.cloneDeep(originalMlRuleData);
    }

    this.setState(
      {
        activeContent: showPage,
        mlRule: tempMlRule,
      },
      () => {
        if (type === 'tableList') {
          this.getMlRuleScript();
        }
      }
    );
  };
  /**
   * Handle ML rule edit input data change
   * @method
   * @param {object} event - event object
   */
  handleMlRuleChange = (event) => {
    let tempMlRule = { ...this.state.mlRule };
    tempMlRule.info[event.target.name] = event.target.value;

    this.setState({
      mlRule: tempMlRule,
    });
  };
  /**
   * Toggle isDetection switch
   * @method
   */
  handleMlRuleStatusChange = (e) => {
    const { mlRule } = this.state;
    const updatedMlRule = _.cloneDeep(mlRule);
    updatedMlRule.info.mlPredictionSelected = e.target.value;

    this.setState({
      mlRule: updatedMlRule,
    });
  };
  handleMlPredictionSelectChange = () => {
    this.setState((prevState) => {
      const { mlRule } = prevState;
      const updatedMlRule = { ...mlRule };
      updatedMlRule.info.isDetection = !mlRule.info.isDetection;
      return {
        mlRule: updatedMlRule,
      };
    });
  };
  /**
   * Display add/edit ML rule content
   * @method
   * @returns HTML DOM
   */
  displayEditMlRuleContent = () => {
    const {
      activeContent,
      severityList,
      fieldsArr,
      mlRule,
      formValidation,
    } = this.state;
    let pageType = '';

    if (activeContent === 'addMlRule') {
      pageType = 'tableList';
    } else if (activeContent === 'editMlRule') {
      pageType = 'cancel';
    }

    let dataArr = []
    if (_.keys(mlRule.info.mlPrediction).length > 0) {
      if (mlRule.info.ruleType === 'abnormal') {
        dataArr = _.map(mlRule.info.mlPrediction[mlRule.info.mlPredictionSelected]['abnormal trend'], (val, key) => {
            return {
              time: key,
              count: val
            };
        });
      } else if (mlRule.info.ruleType === 'unusual') {
        dataArr = _.map(mlRule.info.mlPrediction[mlRule.info.mlPredictionSelected], (val, key) => {
            return {
              range: key,
              count: val.count,
              list: val.list
            };
        });
      }
    }

    return (
      <div
        id='addMlRuleForm'
        className='main-content basic-form'
      >
        <header className='main-header'>{t('txt-mlRuleManagement')}</header>

        <div className='content-header-btns'>
          {activeContent === 'viewMlRule' && (
            <div>
              <Button
                variant='outlined'
                color='primary'
                className='standard btn list'
                onClick={this.toggleContent.bind(this, 'tableList')}
              >
                {t('txt-backToList')}
              </Button>
              <Button
                variant='outlined'
                color='primary'
                className='standard btn edit'
                onClick={this.toggleContent.bind(this, 'editMlRule')}
              >
                {t('txt-edit')}
              </Button>
            </div>
          )}
        </div>

        <div style={{ height: '70vh', overflowY: 'auto' }}>
          <div className='form-group normal'>
            <header>
              <div className='text'>
                {t('ml-rule-management.txt-mlRuleInfo')}
              </div>
              {mlRule.info.lastUpdateDttm && (
                <span className='msg'>
                  {t('ml-rule-management.txt-lastUpdateTime')}{' '}
                  {helper.getFormattedDate(
                    mlRule.info.lastUpdateDttm,
                    'local'
                  )}
                </span>
              )}
            </header>
            <div className='group'>
              <TextField
                id='patternName'
                name='name'
                label={f('syslogMlRuleTableFields.patternName')}
                variant='outlined'
                fullWidth
                size='small'
                required
                error={!formValidation.name.valid}
                helperText={formValidation.name.msg}
                value={mlRule.info.name}
                onChange={this.handleMlRuleChange}
                disabled={activeContent === 'viewMlRule'}
              />
            </div>
            <div className='group severity-level'>
              <i
                className='fg fg-recode'
                style={{
                  color: ALERT_LEVEL_COLORS[mlRule.info.severity],
                }}
              ></i>
              <TextField
                id='severityLevel'
                name='severity'
                select
                label={f('syslogMlRuleTableFields.severity')}
                variant='outlined'
                size='small'
                value={mlRule.info.severity}
                onChange={this.handleMlRuleChange}
                disabled={activeContent === 'viewMlRule'}
              >
                {severityList}
              </TextField>
              <FormControlLabel
                style={{ marginTop: '7px', marginLeft: '5px' }}
                id='mlRuleSwitch'
                className='switch-control'
                control={
                  <Switch
                    checked={mlRule.info.isDetection}
                    onChange={this.handleMlRuleStatusChange.bind(this)}
                    color='primary'
                  />
                }
                label={t('events.connections.txt-isEnabled')}
                disabled={activeContent === 'viewMlRule'}
              />
            </div>
            <div className='group full'>
              <TextField
                id='queryScript'
                name='queryScript'
                label={f('syslogMlRuleTableFields.queryScript')}
                multiline
                minRows={4}
                maxLength={250}
                variant='outlined'
                fullWidth
                size='small'
                required
                error={!formValidation.queryScript.valid}
                helperText={
                  formValidation.queryScript.msg
                }
                value={mlRule.info.queryScript}
                onChange={this.handleMlRuleChange}
                disabled={activeContent !== 'addMlRule'}
              />
            </div>
            <div className='group full rule-type'>
              <FormControl>
                <FormLabel className='label-ruleType' id='ruleType'>{t('events.connections.txt-ruleType')}</FormLabel>
                <RadioGroup
                  row
                  name='ruleType'
                  aria-labelledby='ruleType'
                  value={mlRule.info.ruleType}
                  onChange={this.handleMlRuleChange}
                >
                  <FormControlLabel className='rule-type' value="abnormal" control={<Radio className='checkbox-ui' disabled={activeContent !== 'addMlRule'} />} label={t('events.connections.txt-ruleType-abnormal')} />
                  <FormControlLabel value="unusual" control={<Radio className='checkbox-ui' disabled={activeContent !== 'addMlRule'} />} label={t('events.connections.txt-ruleType-unusual')} />
                </RadioGroup>
              </FormControl>
            </div>
            <div className='group full'>
              <TextField
                id='aggColumn'
                name='aggColumn'
                variant='outlined'
                fullWidth={true}
                size='small'
                onChange={this.handleMlRuleChange}
                required
                error={!formValidation.aggColumn.valid}
                helperText={formValidation.aggColumn.msg}
                label={t('events.connections.txt-groupBy')}
                value={mlRule.info.aggColumn}
                disabled={activeContent !== 'addMlRule'} />
            </div>
            <div className='group full'>
              <TextField
                id='observeColumn'
                name='observeColumn'
                variant='outlined'
                fullWidth={true}
                size='small'
                onChange={this.handleMlRuleChange}
                required
                error={!formValidation.observeColumn.valid}
                helperText={formValidation.observeColumn.msg}
                label={t('events.connections.txt-y')}
                value={mlRule.info.observeColumn}
                disabled={activeContent !== 'addMlRule'} />
            </div>
            <div className='group full training-data-time'>
              <TextField
                name='trainingDataTime'
                type='number'
                className='trainingDataTime'
                label={t('events.connections.txt-trainingDataTime')}
                variant='outlined'
                fullWidth
                size='small'
                value={mlRule.info.trainingDataTime}
                onChange={this.handleMlRuleChange}
                required
                error={!formValidation.trainingDataTime.valid}
                helperText={formValidation.trainingDataTime.msg}
                disabled={activeContent !== 'addMlRule'}
                InputProps={{
                  inputProps: { min: 0 },
                  startAdornment: <InputAdornment position="start">{t('events.connections.txt-trainingDataTimePrefix')}</InputAdornment>,
                  endAdornment: <InputAdornment position="end">{t('events.connections.txt-trainingDataTimePostfix')}</InputAdornment>
                }}
                />
            </div>
            <div className='group full trainingTimeScale-field'>
              <TextField
                name='trainingTimeScale'
                type='number'
                className='trainingTimeScale'
                label={t('events.connections.txt-trainingTimeScale')}
                variant='outlined'
                size='small'
                value={mlRule.info.trainingTimeScale}
                onChange={this.handleMlRuleChange}
                required
                error={!formValidation.trainingTimeScale.valid}
                helperText={formValidation.trainingTimeScale.msg}
                disabled={activeContent !== 'addMlRule'}
                InputProps={{
                  inputProps: { min: 0 }
                }}
                />
              <TextField
                  id='trainingTimeScaleUnit'
                  name='trainingTimeScaleUnit'
                  className='trainingTimeScaleUnit'
                  variant='outlined'
                  size='small'
                  onChange={this.handleMlRuleChange}
                  required
                  select
                  value={mlRule.info.trainingTimeScaleUnit}
                  disabled={activeContent !== 'addMlRule'}>
                  {
                    _.map(['minute', 'hour', 'day'], val => {
                      return <MenuItem key={val} value={val}>{t('events.connections.txt-trainingTimeScale-' + val)}</MenuItem>
                    })
                  }
                </TextField>
            </div>
            <div className='group full threshold-weight'>
              <FormControl>
                <FormLabel className='label-thresholdWeight' id='thresholdWeight'>{t('events.connections.txt-thresholdWeight')}</FormLabel>
                <RadioGroup
                  row
                  name='thresholdWeight'
                  aria-labelledby='thresholdWeight'
                  value={mlRule.info.thresholdWeight}
                  onChange={this.handleMlRuleChange}
                >
                  <FormControlLabel className='threshold-weight' value="low" control={<Radio className='checkbox-ui' disabled={activeContent !== 'addMlRule'} />} label={t('events.connections.txt-thresholdWeightLow')} />
                  <FormControlLabel value="medium" control={<Radio className='checkbox-ui' disabled={activeContent !== 'addMlRule'} />} label={t('events.connections.txt-thresholdWeightMedium')} />
                  <FormControlLabel value="high" control={<Radio className='checkbox-ui' disabled={activeContent !== 'addMlRule'} />} label={t('events.connections.txt-thresholdWeightHigh')} />
                </RadioGroup>
              </FormControl>
            </div>
          </div>
          {activeContent === 'viewMlRule' &&
          <div className='form-group prediction-chart'>
            <header>
              <div className='text'>
                {t('ml-rule-management.txt-trainingResult')}
              </div>
            </header>
            <section>
              <table className='c-table main-table ip'>
                <tbody>
                  <tr><td>{f('syslogMlRuleTableFields.createDttm')}</td><td>{helper.getFormattedDate(mlRule.info.createDttm, 'local')}</td></tr>
                  <tr><td>{f('syslogMlRuleTableFields.lastUpdateDttm')}</td><td>{helper.getFormattedDate(mlRule.info.lastUpdateDttm, 'local')}</td></tr>
                  <tr>
                    <td>{f('syslogMlRuleTableFields.trainingStatus')}</td>
                    <td><span className={'training-status training-status-' + mlRule.info.trainingStatus}>{f('syslogMlRuleTableFields.trainingStatus-' + mlRule.info.trainingStatus)}</span></td>
                  </tr>
                  <tr>
                    <td>{f('syslogMlRuleTableFields.trainingCurve')}</td>
                    <td>
                      <TextField
                        id='mlPredictionSelect'
                        name='mlPredictionSelect'
                        className='mlPredictionSelect'
                        variant='outlined'
                        size='small'
                        onChange={this.handleMlPredictionSelectChange}
                        required
                        select
                        value={mlRule.info.mlPredictionSelected} >
                        {
                          _.map(mlRule.info.mlPredictionSelectList, val => {
                            return <MenuItem key={val} value={val}>{val}</MenuItem>
                          })
                        }
                      </TextField>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
            <div className='group full'>
              {mlRule.info.ruleType === 'abnormal' &&
              <LineChart
                className='chart fixed'
                data={dataArr}
                dataCfg={{
                  x: 'time',
                  y: 'count'
                }}
                xAxis={{
                  type: 'datetime',
                  labels: {
                    rotation: -45,
                    format: '{value:%Y/%m/%d %H:%M:%S}'
                  }
                }}
                yAxis={{
                  allowDecimals: false
                }}
                legend={{
                  enabled: false
                }}
                tooltip={{
                  formatter: (eventInfo, data) => {
                    return (
                      <section>
                        <span>{moment(data[0].time).format('YYYY/MM/DD HH:mm:ss')}<br /></span>
                        <span>{helper.numberWithCommas(data[0].count)}</span>
                      </section>
                    )
                  }
                }}
                />
              }
              {mlRule.info.ruleType === 'unusual' &&
              <BarChart
                vertical
                data={dataArr}
                dataCfg={{
                  splitSeries: 'range',
                  x: 'range',
                  y: 'count'
                }}
                xAxis={{
                  type: 'category'
                }}
                colors={{
                  '0-20': '#5A77E2',
                  '21-40': '#5AD2E2',
                  '41-60': '#5AE26A',
                  '61-80': '#E2975A',
                  '81-100': '#E25A77'
                }}
                plotOptions={{
                  series: {
                    pointWidth: 60,
                    groupPadding: 0.5,
                    pointPadding: 0,
                    column: {colorByPoint: true}
                  }
                }}
                legend={{
                  enabled: false
                }}
                tooltip={{
                  formatter: (eventInfo, data) => {
                    return (
                      <section>
                        {_.map(data[0].list, val =>
                          <div key={val}>{val}</div>
                        )}
                      </section>
                    )
                  }
                }} />
              }
              {mlRule.info.ruleType === 'unusual' &&
              <React.Fragment>
                <div className='unusual-legend'>
                  <div className='unusual-legend-item'></div>
                  <div className='unusual-legend-item'></div>
                  <div className='unusual-legend-item'></div>
                  <div className='unusual-legend-item'></div>
                  <div className='unusual-legend-item'></div>
                </div>
                <div className='unusual-legend-label'>
                  <div className='unusual-legend-label-item'>0</div>
                  <div className='unusual-legend-label-item'>20</div>
                  <div className='unusual-legend-label-item'>40</div>
                  <div className='unusual-legend-label-item'>60</div>
                  <div className='unusual-legend-label-item'>80</div>
                  <div className='unusual-legend-label-item'>100</div>
                </div>
              </React.Fragment>
              }
            </div>
          </div>
        }
        </div>

        {(activeContent === 'addMlRule' ||
          activeContent === 'editMlRule') && (
          <footer>
            <Button
              variant='outlined'
              color='primary'
              className='standard'
              onClick={this.toggleContent.bind(this, pageType)}
            >
              {t('txt-cancel')}
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={this.handleMlRuleSubmit}
            >
              {t('txt-save')}
            </Button>
          </footer>
        )}
      </div>
    );
  };
  /**
   * Display delete ML rule content
   * @method
   * @param {object} allValue - ML rule data
   * @returns HTML DOM
   */
  getDeleteMlRuleContent = (allValue) => {
    this.setState({
      currentMlRuleData: allValue,
    });

    return (
      <div className='content delete'>
        <span>
          {t('txt-delete-msg')}: {allValue.patternName}?
        </span>
      </div>
    );
  };
  /**
   * Show Delete ML rule dialog
   * @method
   * @param {object} allValue - ML rule data
   */
  openDeleteMenu = (allValue) => {
    PopupDialog.prompt({
      title: t('ml-rule-management.txt-deleteMlRule'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteMlRuleContent(allValue),
      act: (confirmed, data) => {
        if (confirmed) {
          this.deleteMlRule();
        }
      },
    });
  };
  /**
   * Handle delete ML rule confirm
   * @method
   */
  deleteMlRule = () => {
    const { baseUrl } = this.context;
    const { currentMlRuleData } = this.state;

    if (!currentMlRuleData.patternId) {
      return;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/alert/pattern?patternId=${currentMlRuleData.patternId}`,
      type: 'DELETE',
    })
      .then((data) => {
        if (data.ret === 0) {
          this.getMlRuleScript();
        }
        return null;
      })
      .catch((err) => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      });
  };
  /**
   * Handle ML rule add/edit confirm
   * @method
   */
  handleMlRuleSubmit = () => {
    const { baseUrl, session } = this.context;
    const {
      activeContent,
      mlRule
    } = this.state;
    let tempFormValidation = _.cloneDeep(FORM_VALIDATION);
    let validate = true;
    let requestType = '';

    if (!session.accountId) {
      return;
    }

    if (!mlRule.info.name) {
      tempFormValidation.name.valid = false;
      tempFormValidation.name.msg = t('txt-required');
      validate = false;
    }

    if (!mlRule.info.queryScript) {
      tempFormValidation.queryScript.valid = false;
      tempFormValidation.queryScript.msg = t('txt-required');
      validate = false;
    }

    if (!mlRule.info.aggColumn) {
      tempFormValidation.aggColumn.valid = false;
      tempFormValidation.aggColumn.msg = t('txt-required');
      validate = false;
    }

    if (!mlRule.info.observeColumn) {
      tempFormValidation.observeColumn.valid = false;
      tempFormValidation.observeColumn.msg = t('txt-required');
      validate = false;
    }

    if (mlRule.info.trainingDataTime === '') {
      tempFormValidation.trainingDataTime.valid = false;
      tempFormValidation.trainingDataTime.msg = t('txt-required');
      validate = false;
    } else {
      if (isNaN(Number(mlRule.info.trainingDataTime)) || Number(mlRule.info.trainingDataTime) < 0) {
        console.log(t('txt-checkFormat'))
        tempFormValidation.trainingDataTime.valid = false;
        tempFormValidation.trainingDataTime.msg = t('txt-checkFormat');
        validate = false;
      }
    }

    if (mlRule.info.trainingTimeScale === '') {
      tempFormValidation.trainingTimeScale.valid = false;
      tempFormValidation.trainingTimeScale.msg = t('txt-required');
      validate = false;
    } else {
      if (isNaN(Number(mlRule.info.trainingTimeScale)) || Number(mlRule.info.trainingTimeScale) < 0) {
        tempFormValidation.trainingTimeScale.valid = false;
        tempFormValidation.trainingTimeScale.msg = t('txt-checkFormat');
        validate = false;
      }
    }
    console.log(tempFormValidation)
    this.setState({
      formValidation: tempFormValidation,
    });

    if (!validate) {
      return;
    }

    let requestData = {
      accountId: session.accountId,
      patternName: mlRule.info.name,
      severity: mlRule.info.severity,
      queryScript: mlRule.info.queryScript,
      isDetection: mlRule.info.isDetection,
      ruleType: mlRule.info.ruleType,
      aggColumn: mlRule.info.aggColumn,
      observeColumn: mlRule.info.observeColumn,
      trainingDataTime: mlRule.info.trainingDataTime,
      trainingTimeScale: mlRule.info.trainingTimeScale,
      trainingTimeScaleUnit: mlRule.info.trainingTimeScaleUnit,
      thresholdWeight: mlRule.info.thresholdWeight
    };

    if (activeContent === 'addMlRule') {
      requestType = 'POST';
    } else if (activeContent === 'editMlRule') {
      requestData.patternId = mlRule.info.id;
      requestType = 'PATCH';
    }

    this.ah
      .one({
        url: `${baseUrl}/api/v2/alert/pattern`,
        data: JSON.stringify(requestData),
        type: requestType,
        contentType: 'text/plain',
      })
      .then((data) => {
        this.setState(
          {
            originalMlRuleData: _.cloneDeep(mlRule)
          },
          () => {
            let showPage = '';

            if (activeContent === 'addMlRule') {
              showPage = 'tableList';
            } else if (activeContent === 'editMlRule') {
              showPage = 'cancel';
            }

            this.toggleContent(showPage);
          }
        );
        return null;
      })
      .catch((err) => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      });
  };
  /**
   * Toggle filter content on/off
   * @method
   */
  toggleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter,
    });
  };
  /**
   * Handle filter input data change
   * @method
   * @param {object} event - event object
   */
  handleMlRuleSearch = (event) => {
    let tempMlRuleSearch = { ...this.state.mlRuleSearch };
    tempMlRuleSearch[event.target.name] = event.target.value;

    this.setState({
      mlRuleSearch: tempMlRuleSearch,
    });
  };
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const { showFilter, mlRuleSearch, fieldsArr } = this.state;

    return (
      <div className={cx('main-filter', { active: showFilter })}>
        <i
          className='fg fg-close'
          onClick={this.toggleFilter}
          title={t('txt-close')}
        ></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div
          className='filter-section config'
          style={{ display: 'flex', flexDirection: 'row' }}
        >
          <div className='group'>
            <TextField
              id='mlRuleSearchName'
              name='name'
              label={f('syslogMlRuleTableFields.patternName')}
              variant='outlined'
              fullWidth
              size='small'
              value={mlRuleSearch.name}
              onChange={this.handleMlRuleSearch}
            />
          </div>
          <div
            className='group'
            style={{ margin: '0px 0px -2px 0', width: '300px' }}
          >
            <TextField
              id='mlRuleSearchObserveColumn'
              name='observeColumn'
              select
              label={f('syslogMlRuleTableFields.observeColumn')}
              size='small'
              fullWidth
              variant='outlined'
              value={mlRuleSearch.observeColumn}
              onChange={this.handleMlRuleSearch}
            >
              <MenuItem value='all'>{t('txt-all')}</MenuItem>
              {_.map(fieldsArr, (val) => {
                return <MenuItem key={val} value={val}>{this.getCustomFieldName(val)}</MenuItem>;
              })}
            </TextField>
          </div>
          <div
            className='group'
            style={{ margin: '0px 0px -2px 0', width: '120px' }}
          >
            <TextField
              id='mlRuleSearchRuleType'
              name='ruleType'
              select
              label={f('syslogMlRuleTableFields.ruleType')}
              size='small'
              fullWidth
              variant='outlined'
              value={mlRuleSearch.ruleType}
              onChange={this.handleMlRuleSearch}
            >
              <MenuItem value='all'>{t('txt-all')}</MenuItem>
              <MenuItem value='abnormal'>{f('syslogMlRuleTableFields.ruleType-abnormal')}</MenuItem>
              <MenuItem value='unusual'>{f('syslogMlRuleTableFields.ruleType-unusual')}</MenuItem>
            </TextField>
          </div>
          <div
            className='group'
            style={{ margin: '0px 0px -2px 0', width: '120px' }}
          >
            <TextField
              id='mlRuleSearchTrainingStatus'
              name='trainingStatus'
              select
              label={f('syslogMlRuleTableFields.trainingStatus')}
              size='small'
              fullWidth
              variant='outlined'
              value={mlRuleSearch.trainingStatus}
              onChange={this.handleMlRuleSearch}
            >
              <MenuItem value='all'>{t('txt-all')}</MenuItem>
              <MenuItem value='Waiting'>{f('syslogMlRuleTableFields.trainingStatus-Waiting')}</MenuItem>
              <MenuItem value='Training'>{f('syslogMlRuleTableFields.trainingStatus-Training')}</MenuItem>
              <MenuItem value='Trained'>{f('syslogMlRuleTableFields.trainingStatus-Trained')}</MenuItem>
            </TextField>
          </div>
        </div>
        <div className='button-group group-aligned'>
          <Button
            variant='contained'
            color='primary'
            className='filter'
            onClick={this.getMlRuleScript}
          >
            {t('txt-filter')}
          </Button>
          <Button
            variant='outlined'
            color='primary'
            className='clear'
            onClick={this.clearFilter}
          >
            {t('txt-clear')}
          </Button>
        </div>
      </div>
    );
  };
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempMlRule = { ...this.state.mlRule };
    tempMlRule.sort.field = field;
    tempMlRule.sort.desc = sort;

    this.setState(
      {
        mlRule: tempMlRule,
      },
      () => {
        this.getMlRuleScript();
      }
    );
  };
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempMlRule = { ...this.state.mlRule };
    tempMlRule[type] = Number(value);

    this.setState(
      {
        mlRule: tempMlRule,
      },
      () => {
        this.getMlRuleScript(type);
      }
    );
  };
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      mlRuleSearch: _.cloneDeep(ML_RULE_SEARCH)
    });
  };
  render() {
    const { baseUrl, contextRoot } = this.context;
    const { activeContent, showFilter, mlRule } = this.state;
    const tableOptions = {
      onChangePage: (currentPage) => {
        this.handlePaginationChange('currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort(changedColumn, direction === 'desc');
      },
    };

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            {activeContent === 'tableList' && (
              <Button
                variant='outlined'
                color='primary'
                className={cx('last', { active: showFilter })}
                onClick={this.toggleFilter}
                title={t('txt-filter')}
              >
                <i className='fg fg-filter'></i>
              </Button>
            )}
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
          />

          <div className='parent-content'>
            {this.renderFilter()}

            {activeContent === 'tableList' && (
              <div className='main-content'>
                <header className='main-header'>
                  {t('txt-mlRuleManagement')}
                </header>

                <div className='content-header-btns with-menu'>
                  <Button
                    variant='outlined'
                    color='primary'
                    className='standard btn'
                    onClick={this.toggleContent.bind(this, 'addMlRule')}
                    data-cy='add-mlRule'
                  >
                    {t('ml-rule-management.txt-addMlRuleScript')}
                  </Button>
                </div>

                <MuiTableContent
                  data={mlRule}
                  tableOptions={tableOptions}
                />
              </div>
            )}

            {(activeContent === 'viewMlRule' ||
              activeContent === 'addMlRule' ||
              activeContent === 'editMlRule') &&
              this.displayEditMlRuleContent()}
          </div>
        </div>
      </div>
    );
  }
}

MlRule.contextType = BaseDataContext;

MlRule.propTypes = {};

export default MlRule;
