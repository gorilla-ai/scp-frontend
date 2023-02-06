import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import cx from 'classnames'

import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Switch from '@material-ui/core/Switch'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context'
import Config from '../../common/configuration'
import helper from '../../common/helper'
import IncidentForm from '../../soc/common/incident-form'
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
const PERIOD_MIN = [10, 15, 30, 60];
const PATTERN_SEARCH = {
  name: '',
  queryScript: ''
};
const FORM_VALIDATION = {
  name: {
    valid: true
  },
  queryScript: {
    valid: true
  },
  threshold: {
    valid: true
  }
};

let t = null;
let f = null;
let et = null;
let it = null;
let at = null;

/**
 * Pattern
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Config Syslog Pattern page
 */
class Pattern extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');
    at = global.chewbaccaI18n.getFixedT(null, 'account');    

    this.state = {
      activeContent: 'tableList', //'tableList', 'viewPattern', 'addPattern' or 'editPattern'
      showFilter: false,
      patternSearch: _.cloneDeep(PATTERN_SEARCH),
      activeSteps: 1,
      severitySelected: [],
      originalPatternData: {},
      severityList: [],
      socFlowList: [],
      periodMinList: [],
      currentPatternData: '',
      deviceListOptions: [],
      showDeviceListOptions: [],
      attach: null,
      filesName: [],
      pattern: {
        dataFieldsArr: ['patternName', 'severity', 'queryScript', 'periodMin', 'threshold', 'lastUpdateDttm', '_menu'],
        dataFields: [],
        dataContent: null,
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
          severity: 'Emergency',
          periodMin: 10,
          threshold: 1,
          queryScript: '',
        }
      },
      incident: {
        dataFieldsArr: ['_menu', 'id', 'tag', 'status', 'severity', 'createDttm', 'updateDttm', 'title', 'reporter', 'srcIPListString' , 'dstIPListString'],
        fileFieldsArr: ['fileName', 'fileSize', 'fileDttm', 'fileMemo', 'action'],
        flowFieldsArr: ['id', 'status', 'reviewDttm', 'reviewerName', 'suggestion'],
        dataFields: [],
        dataContent: [],
        sort: {
          field: 'createDttm',
          desc: true
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        info: {
          status: 1,
          socType: 1
        }
      },
      currentIncident: {},
      originalIncident: {},
      enableIncidentTemplate: false,
      incidentAccidentList: _.map(_.range(1, 6), el => {
        return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
      }),
      incidentAccidentSubList: [
        _.map(_.range(11, 17), el => {
          return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
        }),
        _.map(_.range(21, 26), el => {
          return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
        }),
        _.map(_.range(31, 33), el => {
          return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
        }),
        _.map(_.range(41, 45), el => {
          return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
        })
      ],
      formValidation: _.cloneDeep(FORM_VALIDATION)
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
    const {baseUrl, session} = this.context;
    const severityList = _.map(SEVERITY_TYPE, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });
    const periodMinList = _.map(PERIOD_MIN, (val, i) => {
      return <MenuItem key={i} value={val}>{val}</MenuItem>
    });

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/flow/_search`,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    }).then(data => {
      if (data) {
        const list = _.map(data.rt.rows, val => {
          return <MenuItem key={val.id} value={val.id}>{`${val.name}`}</MenuItem>
        });

        this.setState({
          socFlowList: list
        });
      }
    }).catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });

    ah.one({
      url: `${baseUrl}/api/soc/device/_search`,
      data: JSON.stringify({use:'1'}),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data) {
        const list = _.map(data.rt.rows, val => {
          return {
            value: val.id,
            text: val.deviceName
          };
        });

        this.setState({
          deviceListOptions: list
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    ah.one({
      url: `${baseUrl}/api/soc/device/_search`,
      data: JSON.stringify({use:'2'}),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data) {
        const list = _.map(data.rt.rows, val => {
          return {
            value: val.id,
            text: val.deviceName
          };
        });

        this.setState({
          showDeviceListOptions: list
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

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
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getPatternScript = (fromPage) => {
    const {baseUrl, session} = this.context;
    const {patternSearch, severitySelected, pattern} = this.state;
    const page = fromPage === 'currentPage' ? pattern.currentPage : 0;
    let query = '';

    if (patternSearch.name) {
      query += `&patternName=${patternSearch.name}`;
    }

    if (patternSearch.queryScript) {
      query += `&queryScript=${patternSearch.queryScript}`;
    }

    if (severitySelected.length > 0) {
      query += `&severity=${severitySelected.join()}`;
    }

    this.ah.one({
      url: `${baseUrl}/api/alert/pattern?accountId=${session.accountId}${query}&page=${page + 1}&pageSize=${pattern.pageSize}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempPattern = {...pattern};

        if (!data.rows || data.rows.length === 0) {
          tempPattern.dataContent = [];
          tempPattern.totalCount = 0;

          this.setState({
            pattern: tempPattern
          });
          return null;
        }

        tempPattern.dataContent = data.rows;
        tempPattern.totalCount = data.counts;
        tempPattern.currentPage = page;
        tempPattern.dataFields = _.map(pattern.dataFieldsArr, val => {
          return {
            name: val,
            label: val === '_menu' ? ' ' : f(`syslogPatternTableFields.${val}`),
            options: {
              sort: false,
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempPattern.dataContent[dataIndex];
                const value = tempPattern.dataContent[dataIndex][val];

                if (val === 'severity') {
                  return <span className='severity-level' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>
                } else if (val === 'lastUpdateDttm') {
                  return helper.getFormattedDate(value, 'local');
                } else if (val === '_menu') {
                  return (
                    <div className='table-menu menu active'>
                      <i className='fg fg-eye' onClick={this.toggleContent.bind(this, 'viewPattern', allValue)} title={t('txt-view')}></i>
                      <i className='fg fg-trashcan' onClick={this.openDeleteMenu.bind(this, allValue)} title={t('txt-delete')}></i>
                    </div>
                  )
                }
                return value;
              }
            }
          };
        });

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
    const {originalPatternData, pattern, incident} = this.state;
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
        showFilter: false,
        originalIncident: _.cloneDeep(incident),
        enableIncidentTemplate: false
      });
    } else if (type === 'cancel') {
      showPage = 'viewPattern';
      tempPattern = _.cloneDeep(originalPatternData);

      this.setState({
        formValidation: _.cloneDeep(FORM_VALIDATION)
      });
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
  toggleSteps = (type) => {
    const {activeSteps} = this.state;
    let tempActiveSteps = activeSteps;

    if (type === 'previous') {
      tempActiveSteps--;

      this.setState({
        activeSteps: tempActiveSteps
      });
    } else if (type === 'next') {
      if (activeSteps === 1) {
        let validate = true;

        if (!validate) {
          return;
        }

        tempActiveSteps++;

        this.setState({
          activeSteps: tempActiveSteps
        });
      }
    }
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
   * Toggle incident status switch
   * @method
   */
  handleIncidentStatusChange = () => {
    this.setState({
      enableIncidentTemplate: !this.state.enableIncidentTemplate
    });
  }
  /**
   * Handle Incident data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleDataChange = (type, value) => {
    let temp = {...this.state.incident};
    temp.info[type] = value;

    if (type === 'impactAssessment') {
      temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * value), 'hours');
    }

    this.setState({
      incident: temp
    });
  }
  handleDataChangeMui = (event) => {
    const {incident, socFlowSourceList} = this.state;
    const name = event.target.name;
    const value = event.target.value;
    let tempIncident = {...incident};
    tempIncident.info[name] = value;

    if (name === 'severity') {
      if (value === 'Emergency') {
        tempIncident.info['impactAssessment'] = 4;
        tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
      } else if (value === 'Alert') {
        tempIncident.info['impactAssessment'] = 3;
        tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
      } else if (value === 'Notice') {
        tempIncident.info['impactAssessment'] = 1;
        tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
      } else if (value === 'Warning') {
        tempIncident.info['impactAssessment'] = 2;
        tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
      } else if (value === 'Critical') {
        tempIncident.info['impactAssessment'] = 3;
        tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
      }
    }

    if (name === 'flowTemplateId') {
      _.forEach(socFlowSourceList , flowVal => {
        if (flowVal.id === value) {
          if (flowVal.severity === 'Emergency') {
            tempIncident.info['severity'] = 'Emergency';
            tempIncident.info['impactAssessment'] = 4;
            tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
          } else if (flowVal.severity === 'Alert') {
            tempIncident.info['severity'] = 'Alert';
            tempIncident.info['impactAssessment'] = 3;
            tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
          } else if (flowVal.severity === 'Notice') {
            tempIncident.info['severity'] = 'Notice';
            tempIncident.info['impactAssessment'] = 1;
            tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
          } else if (flowVal.severity === 'Warning') {
            tempIncident.info['severity'] = 'Warning';
            tempIncident.info['impactAssessment'] = 2;
            tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
          } else if (flowVal.severity === 'Critical') {
            tempIncident.info['severity'] = 'Critical';
            tempIncident.info['impactAssessment'] = 3;
            tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * tempIncident.info['impactAssessment']), 'hours');
          }
        }
      })
    }

    if (name === 'impactAssessment') {
      tempIncident.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * value), 'hours');
    }

    this.setState({
      incident: tempIncident
    });
  }
  /**
   * Handle file upload change
   * @method
   * @param {string} [options] - option for 'clear'
   */
  handleFileChange = (options) => {
    const input = document.getElementById('multiMalware');
    let filesName = [];

    if (options === 'clear') {
      this.setState({
        attach: null,
        filesName: ''
      });
      return;
    }

    if (_.size(input.files) > 0) {
      const flag = new RegExp("[\`~!@#$^&*()=|{}':;',\\[\\]<>+《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
      let validate = true;

      _.forEach(input.files, val => {
        if (flag.test(val.name)) {
          validate = false;
          helper.showPopupMsg(it('txt-attachedFileNameError'), t('txt-error'));
          return;
        } else if (val.size > 20000000) {
          validate = false;
          helper.showPopupMsg(it('file-too-large'), t('txt-error'));
          return;
        } else {
          filesName.push(val.name);
        }
      })

      if (!validate) return;

      this.setState({
        attach: input.files,
        filesName: filesName.join(', ')
      });
    }
  }
  handleConnectContactChange = (val) => {
    let temp = {...this.state.incident};
    temp.info.notifyList = val;

    this.setState({
      incident: temp
    });
  }
  handleEventsChange = (val) => {
    let temp = {...this.state.incident};
    temp.info.eventList = val;

    this.setState({
      incident: temp
    });
  }
  toggleEstablishDateCheckbox = (event) => {
    let tempIncident = {...this.state.incident};
    tempIncident.info.enableEstablishDttm = event.target.checked;

    this.setState({
      incident: tempIncident
    });
  }
  /**
   * Display add/edit Pattern content
   * @method
   * @returns HTML DOM
   */
  displayEditPatternContent = () => {
    const {
      activeContent,
      activeSteps,
      severityList,
      socFlowList,
      periodMinList,
      deviceListOptions,
      showDeviceListOptions,
      attach,
      filesName,
      pattern,
      incident,
      enableIncidentTemplate,
      incidentAccidentList,
      incidentAccidentSubList,
      formValidation
    } = this.state;
    let pageType = '';

    if (activeContent === 'addPattern') {
      pageType = 'tableList';
    } else if (activeContent === 'editPattern') {
      pageType = 'cancel';
    }

    return (
      <div id='addPatternForm' className='main-content basic-form'>
        <header className='main-header'>{t('txt-systemDefinedPattern')}</header>

        <div className='content-header-btns'>
          {activeContent === 'viewPattern' &&
            <div>
              <Button variant='outlined' color='primary' className='standard btn list' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'editPattern')}>{t('txt-edit')}</Button>
            </div>
          }
        </div>

        <div style={{height: '70vh', overflowY: 'auto'}}>
          <div className='form-group normal'>
            <header>
              <div className='text'>{t('system-defined-pattern.txt-patternInfo')}</div>
              {pattern.info.lastUpdateDttm &&
                <span className='msg'>{t('system-defined-pattern.txt-lastUpdateTime')} {helper.getFormattedDate(pattern.info.lastUpdateDttm, 'local')}</span>
              }
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
                error={!formValidation.name.valid}
                helperText={formValidation.name.valid ? '' : t('txt-required')}
                value={pattern.info.name}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewPattern'} />
            </div>
            <div className='group severity-level'>
              <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[pattern.info.severity]}}></i>
              <TextField
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
                error={!formValidation.queryScript.valid}
                helperText={formValidation.queryScript.valid ? '' : t('txt-required')}
                value={pattern.info.queryScript}
                onChange={this.handleDataChange}
                disabled={activeContent === 'viewPattern'} />
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
                  value={pattern.info.periodMin}
                  onChange={this.handleDataChange}
                  disabled={activeContent === 'viewPattern'}>
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
                  InputProps={{inputProps: { min: 1, max: 1000 }}}
                  required
                  error={!formValidation.threshold.valid}
                  helperText={formValidation.threshold.valid ? '' : t('events.connections.txt-threasholdCount')}
                  value={pattern.info.threshold}
                  onChange={this.handleDataChange}
                  disabled={activeContent === 'viewPattern'} />
                <span className='support-text'> {t('events.connections.txt-patternQuery3')}</span>
              </div>
            </div>
            {/*<FormControlLabel
              id='incidentTemplateSwitch'
              className='switch-control'
              control={
                <Switch
                  checked={enableIncidentTemplate}
                  onChange={this.handleIncidentStatusChange}
                  color='primary' />
              }
              label={t('events.connections.txt-enableIncidentTemplate')} />*/}
            {enableIncidentTemplate &&
              <div id='incidentSettingsForm' className='auto-settings'>
                <IncidentForm
                  from='pattern'
                  activeContent={activeContent}
                  activeSteps={activeSteps}
                  incident={incident}
                  severityList={severityList}
                  socFlowList={socFlowList}
                  attach={attach}
                  filesName={filesName}
                  deviceListOptions={deviceListOptions}
                  showDeviceListOptions={showDeviceListOptions}
                  incidentAccidentList={incidentAccidentList}
                  incidentAccidentSubList={incidentAccidentSubList}
                  handleDataChange={this.handleDataChange}
                  handleDataChangeMui={this.handleDataChangeMui}
                  handleFileChange={this.handleFileChange}
                  handleConnectContactChange={this.handleConnectContactChange}
                  handleEventsChange={this.handleEventsChange}
                  toggleEstablishDateCheckbox={this.toggleEstablishDateCheckbox}
                  toggleSteps={this.toggleSteps} />
              </div>
            }
          </div>
        </div>

        {(activeContent === 'addPattern' || activeContent === 'editPattern') &&
          <footer>
            <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, pageType)}>{t('txt-cancel')}</Button>
            <Button variant='contained' color='primary' onClick={this.handlePatternSubmit}>{t('txt-save')}</Button>
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

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

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
    const {baseUrl, session} = this.context;
    const {activeContent, pattern, formValidation} = this.state;
    let tempFormValidation = {...formValidation};
    let validate = true;
    let requestType = '';

    if (!session.accountId) {
      return;
    }

    if (pattern.info.name) {
      formValidation.name.valid = true;
    } else {
      formValidation.name.valid = false;
      validate = false;
    }

    if (pattern.info.queryScript) {
      formValidation.queryScript.valid = true;
    } else {
      formValidation.queryScript.valid = false;
      validate = false;
    }

    if (pattern.info.threshold < 0 || pattern.info.threshold > 1000) {
      formValidation.threshold.valid = false;
      validate = false;
    } else {
      formValidation.threshold.valid = true;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    let requestData = {
      accountId: session.accountId,
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
    const {showFilter, patternSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <TextField
              id='patternSearchName'
              name='name'
              label={f('syslogPatternTableFields.patternName')}
              variant='outlined'
              fullWidth
              size='small'
              value={patternSearch.name}
              onChange={this.handlePatternSearch} />
          </div>
          <div className='group'>
            <TextareaAutosize
              id='patternSearchQueryScript'
              className='textarea-autosize'
              name='queryScript'
              placeholder={f('syslogPatternTableFields.queryScript')}
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
          <Button variant='contained' color='primary' className='filter' onClick={this.getPatternScript}>{t('txt-filter')}</Button>
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
    let tempPattern = {...this.state.pattern};
    tempPattern.sort.field = field;
    tempPattern.sort.desc = sort;

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

    this.setState({
      pattern: tempPattern
    }, () => {
      this.getPatternScript(type);
    });
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      patternSearch: _.cloneDeep(PATTERN_SEARCH),
      severitySelected: []
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {activeContent, showFilter, pattern} = this.state;
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
                <header className='main-header'>{t('txt-systemDefinedPattern')}</header>

                <div className='content-header-btns with-menu'>
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'addPattern')} data-cy='add-pattern'>{t('system-defined-pattern.txt-addPatternScript')}</Button>
                </div>

                <MuiTableContent
                  data={pattern}
                  tableOptions={tableOptions} />
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

export default Pattern;