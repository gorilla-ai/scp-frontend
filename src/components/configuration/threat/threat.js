import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import jschardet from 'jschardet'
import XLSX from 'xlsx'

import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'

import BarChart from 'react-chart/build/src/components/bar'
import LineChart from 'react-chart/build/src/components/line'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PieChart from 'react-chart/build/src/components/pie'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import AddThreats from './add-threats'
import {BaseDataContext} from '../../common/context'
import Config from '../../common/configuration'
import FileUpload from '../../common/file-upload'
import helper from '../../common/helper'
import MuiTableContent from '../../common/mui-table-content'
import SearchOptions from '../../common/search-options'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];

/**
 * Threat Intelligence
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Config Edge Threat Intelligence page
 */
class ThreatIntelligence extends Component {
  constructor(props) {
    super(props);

    this.state = {
      threatsSearch: {
        keyword: '',
        type: 'IP'
      },
      datetime: {
        from: helper.getSubstractDate(1, 'week', moment().local().format('YYYY-MM-DD') + 'T00:00:00'),
        to: helper.getSubstractDate(1, 'day', moment().local().format('YYYY-MM-DD') + 'T00:00:00')
        //from: '2020-06-04T00:00:00Z',
        //to: '2020-06-04T01:00:00Z'
      },
      activeDateType: 'allDays', //'today', 'past7days', 'allDays' or 'custom'
      contextAnchor: null,
      indicatorsData: null,
      indicatorsTrendData: null,
      acuIndicatorsTrendData: null,
      addThreatsOpen: false,
      uplaodThreatsOpen: false,
      importThreatsOpen: false,
      searchThreatsOpen: false,
      autoDetectType: true,
      addThreats: [],
      threatsFile: {},
      threats: {
        dataFieldsArr: ['threatText', 'threatType', 'dataSourceType', 'createDttm', '_menu'],
        dataFields: [],
        dataContent: null,
        sort: {
          field: 'threatText',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      info: '',
      uploadedThreatsData: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;
    const {activeDateType} = this.state;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);
    helper.inactivityTime(baseUrl, locale);

    this.getChartsData(activeDateType);
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get and set charts data
   * @param {string} activeDateType - date type ('today', 'past7days', 'allDays' or 'custom')
   * @param {object} [dateTime] - custom datetime set by the user
   * @method
   */
  getChartsData = (activeDateType, dateTime) => {
    const {baseUrl} = this.context;
    const url = {
      summary: `${baseUrl}/api/indicators/summary`,
      trend: `${baseUrl}/api/indicators/trend`,
      trendAccum: `${baseUrl}/api/indicators/trend/accum`
    };
    let params = '';

    if (activeDateType === 'today') {
      const todayDateTime = {
        from: moment(helper.getStartDate('day')).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
        to: moment().utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
      };
      params = `/period?startDttm=${todayDateTime.from}&endDttm=${todayDateTime.to}`;
    } else if (activeDateType === 'past7days') {
      params += '?recent7days=true';
    } else if (activeDateType === 'allDays') {
      params += '?totalcount=true';
    } else if (activeDateType === 'custom') {
      params = `/period?startDttm=${dateTime.from}&endDttm=${dateTime.to}`;
    }

    //Pie Chart
    this.ah.one({
      url: url.summary + params,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        this.setState({
          indicatorsData: this.formatPieChartData(data)
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    //Bar Chart
    this.ah.one({
      url: url.trend + params,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        let indicatorsTrendData = [];

        _.keys(data)
        .forEach(key => {
          _.keys(data[key])
          .forEach(key2 => {
            if (data[key][key2] > 0) {
              indicatorsTrendData.push({
                day: parseInt(moment(helper.getFormattedDate(key2, 'local')).format('x')),
                count: data[key][key2],
                indicator: key
              })
            }
          })
        });

        this.setState({
          indicatorsTrendData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    //Line Chart
    this.ah.one({
      url: url.trendAccum + params,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        let acuIndicatorsTrendData = [];

        _.keys(data)
        .forEach(key => {
          _.forEach(data[key], val => {
            if (val.counts > 0) {
              acuIndicatorsTrendData.push({
                day: parseInt(moment(helper.getFormattedDate(val.time, 'local')).format('x')),
                count: val.counts,
                indicator: key
              })
            }
          })
        });

        this.setState({
          acuIndicatorsTrendData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Format the object data into array type
   * @method
   * @param {object} data - chart data
   */
  formatPieChartData = (data) => {
    let indicatorsData = [];

    _.keys(data)
    .forEach(key => {
      if (data[key] > 0) {
        indicatorsData.push({
          key,
          doc_count: data[key]
        });
      }
    });

    return indicatorsData;
  }
  /**
   * Reset indicators data
   * @method
   * @param {string} activeDateType - date type ('today', 'past7days', 'allDays' or 'custom')
   * @param {object} [dateTime] - custom datetime set by the user
   */
  clearIndicatorsData = (activeDateType, dateTime) => {
    this.setState({
      indicatorsData: null,
      indicatorsTrendData: null,
      acuIndicatorsTrendData: null
    }, () => {
      this.getChartsData(activeDateType, dateTime);
    });
  }
  /**
   * Toggle date options buttons
   * @method
   * @param {object} event - event object
   * @param {string} activeDateType - date type ('today', 'past7days', 'allDays' or 'custom')
   */
  toggleDateRangeButtons = (event, activeDateType) => {
    if (activeDateType !== 'custom') {
      this.clearIndicatorsData(activeDateType);
    }

    this.setState({
      activeDateType
    });
  }
  /**
   * Set new datetime
   * @method
   * @param {string} type - date type ('from' or 'to')
   * @param {object} newDatetime - new datetime object
   */
  handleDateChange = (type, newDatetime) => {
    let tempDatetime = {...this.state.datetime};
    tempDatetime[type] = newDatetime;

    this.setState({
      datetime: tempDatetime
    });
  }
  /**
   * Handle open menu
   * @method
   * @param {object} event - event object
   */
  handleOpenMenu = (event) => {
    this.setState({
      contextAnchor: event.currentTarget
    });
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null
    });
  }
  /**
   * Toggle upload modal dialog on/off
   * @method
   * @param {string} options - option for 'showMsg'
   */
  toggleUploadThreat = (options) => {
    this.setState({
      uplaodThreatsOpen: !this.state.uplaodThreatsOpen
    }, () => {
      if (options === 'showMsg') {
        PopupDialog.alert({
          id: 'modalWindowSmall',
          confirmText: t('txt-close'),
          display: <div className='content'><span>{t('txt-uploadSuccess')}</span></div>
        });
        this.getChartsData();
      }
    });

    this.handleCloseMenu();
  }
  /**
   * Handle file change and set the file
   * @method
   * @param {object} file - file uploaded by the user
   * @param {object} check - a returned promise for the encode info
   */
  handleFileChange = (file, check) => {
    let reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;

    reader.onload = (e) => {
      const bstr = btoa(e.target.result); //Encode text result
      const wb = XLSX.read(bstr, {type: rABS ? 'binary' : 'array'});
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws, {header: 1});
      const result = data.filter(o => Object.keys(o).length);
      const uploadedThreatsData = atob(result).split('\r\n'); //Decode text result

      this.setState({
        uploadedThreatsData
      });
    }
    reader.onerror = error => reject(error);

    if (rABS) {
      if (check.encoding) {
        if (check.encoding === 'UTF-8') {
          reader.readAsText(file, 'UTF-8');
        } else { //If check.encoding is available, force to read as BIG5 encoding
          reader.readAsText(file, 'BIG5');
        }
      } else {
        reader.readAsBinaryString(file);
      }
    } else {
      reader.readAsArrayBuffer(file);
    }
  }
  /**
   * Check file encoding
   * @method
   * @param {object} file - file uploaded by the user
   * @returns promise of the file reader
   */
  checkEncode = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const rABS = !!reader.readAsBinaryString;

      reader.onload = async (e) => {
        resolve(jschardet.detect(e.target.result));
      }
      reader.onerror = error => reject(error);

      if (rABS) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }
  /**
   * Handle CSV batch upload
   * @method
   * @param {object} file - file uploaded by the user
   */
  parseUploadFile = async (file) => {
    if (file) {
      this.handleFileChange(file, await this.checkEncode(file));
    }
  }
  /**
   * Show file upload example
   * @method
   */
  showUploadExample = () => {
    PopupDialog.alert({
      id: 'modalWindowSmall',
      confirmText: t('txt-close'),
      display: <div style={{textAlign: 'left'}}>
        <div>{t('edge-management.txt-exampleDesc')}</div>
        <pre>
          127.0.0.1<br />
          http://www.google.com<br />
          msn.com<br />
          2001:0:1234::C1C0:ABCD:876<br />
          595f44fec1e92a71d3e9e77456ba80d1
        </pre>
      </div>
    });
  }
  /**
   * Get see example margin
   * @method
   * @returns width in px
   */
  getMarginWidth = () => {
    const {locale} = this.context;

    if (locale === 'en') {
      return '115px';
    } else if (locale === 'zh') {
      return '100px';
    }
  }
  /**
   * Display threat upload modal dialog and its content
   * @method
   * @returns ModalDialog component
   */
  uploadThreatsDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleUploadThreat},
      confirm: {text: t('txt-confirm'), handler: this.confirmThreatUpload}
    };
    const title = t('edge-management.txt-addThreat') + ' - ' + t('edge-management.txt-addMultiple');
    const fileTitle = t('edge-management.txt-threatsFile') + '(.txt)';

    return (
      <ModalDialog
        id='uploadThreatsDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        <div className='c-link view-example' style={{marginLeft: this.getMarginWidth()}} onClick={this.showUploadExample}>({t('edge-management.txt-viewExample')})</div>
        <FileUpload
          id='uploadThreat'
          fileType='text'
          supportText={fileTitle}
          btnText={t('txt-upload')}
          handleFileChange={this.parseUploadFile} />
      </ModalDialog>
    )
  }
  /**
   * Handle threat upload confirm
   * @method
   */
  confirmThreatUpload = () => {
    const {uploadedThreatsData} = this.state;

    if (uploadedThreatsData.length > 0) {
      let addThreats = [];

      _.forEach(uploadedThreatsData, val => {
        addThreats.push({
          input: val,
          type: helper.determineInputRuleType(val),
          severity: 'ALERT',
          validate: true
        });
      })

      this.setState({
        uplaodThreatsOpen: false,
        addThreats
      }, () => {
        this.toggleAddThreats();
      });
    } else {
      helper.showPopupMsg(t('txt-selectFile'), t('txt-error'));
      return;
    }
  }
  /**
   * Handle filter search submit
   * @method
   */
  handleSearchSubmit = () => {
    const {datetime} = this.state;
    const dateTimeFrom = moment(datetime.from).format('YYYY-MM-DD') + 'T00:00:00';
    const dateTimeToToday = moment(this.state.datetime.to).format('YYYY-MM-DD');
    const dateTimeTo = moment(datetime.to).format('YYYY-MM-DD') + 'T23:59:59';
    const yesterday = moment(helper.getSubstractDate(1, 'day', moment().local())).format('YYYY-MM-DD');
    const dateTime = {
      from: moment(dateTimeFrom).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(dateTimeTo).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };

    if (moment(dateTimeToToday).isAfter(yesterday)) { //Show error message
      helper.showPopupMsg(t('edge-management.txt-threatEndTimeError'), t('txt-error'));
      return;
    }

    if (moment(dateTime.from).isAfter()) { //Show error message
      helper.showPopupMsg(t('edge-management.txt-threatDateError'), t('txt-error'));
      return;
    }

    this.clearIndicatorsData('custom', dateTime);
  }
  /**
   * Toggle add threats modal on/off
   * @method
   */
  toggleAddThreats = () => {
    const {addThreatsOpen} = this.state;

    if (addThreatsOpen) { //Clear threats info and error msg
      this.setState({
        addThreats: [],
        info: ''
      });
    }

    this.setState({
      addThreatsOpen: !addThreatsOpen,
      autoDetectType: true
    });

    this.handleCloseMenu();
  }
  /**
   * Handle add/remove the add threats box
   * @method
   * @param {array.<object>} data - add threats list array
   */
  handleAddThreatsChange = (data) => {
    const {autoDetectType} = this.state;

    if (autoDetectType) { //Auto detect type is on
      let addThreats = [];

      if (data.length > 0) {
        _.forEach(data, val => {
          addThreats.push({
            ...val,
            type: helper.determineInputRuleType(val.input)
          });
        })
      }

      this.setState({
        addThreats
      });
    } else { //Auto detect type is off
      this.setState({
        addThreats: data
      });
    }
  }
  /**
   * Toggle auto detect type checkbox
   * @method
   */
  toggleAutoDetectCheckbox = () => {
    this.setState({
      autoDetectType: !this.state.autoDetectType
    }, () => {
      const {autoDetectType, addThreats} = this.state;

      if (autoDetectType) { //Update threats input and clear error message
        let tempAddThreats = [];

        if (addThreats.length > 0) {
          _.forEach(addThreats, val => {
            tempAddThreats.push({
              ...val,
              type: helper.determineInputRuleType(val.input),
              validate: true
            });
          })
        }

        this.setState({
          addThreats: tempAddThreats,
          info: ''
        });
      }
    });
  }
  /**
   * Display add threats content
   * @method
   * @returns HTML DOM
   */
  displayAddThreatsContent = () => {
    const {autoDetectType, addThreats} = this.state;
    const data = {
      autoDetectType
    };

    return (
      <div>
        <div className='auto-detect'>
          <FormControlLabel
            label={t('edge-management.txt-autoDetectType')}
            className='checkbox'
            control={
              <Checkbox
                className='checkbox-ui'
                checked={autoDetectType}
                onChange={this.toggleAutoDetectCheckbox}
                color='primary' />
            } />
        </div>
        <MultiInput
          id='threatMultiInputs'
          base={AddThreats}
          defaultItemValue={{
            input: '',
            type: '',
            severity: 'ALERT',
            validate: true
          }}
          value={addThreats}
          props={data}
          onChange={this.handleAddThreatsChange}/>
      </div>
    )
  }
  /**
   * Open add threats modal dialog
   * @method
   * @returns ModalDialog component
   */
  addThreatsDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleAddThreats},
      confirm: {text: t('txt-confirm'), handler: this.confirmAddThreats}
    };
    const title = t('edge-management.txt-addThreat') + ' - ' + t('edge-management.txt-addManually');

    return (
      <ModalDialog
        id='addThreatsDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        info={this.state.info}
        closeAction='cancel'>
        {this.displayAddThreatsContent()}
      </ModalDialog>
    )
  }
  /**
   * Handle add threats confirm
   * @method
   */
  confirmAddThreats = () => {
    const {baseUrl, contextRoot} = this.context;
    const {addThreats} = this.state;
    let tempAddThreats = [];
    let validation = true;
    let formattedData = {};
    let requestData = {};

    if (addThreats.length === 0) {
      this.setState({
        info: t('edge-management.txt-edgeFormatError')
      });
      return;
    }

    _.forEach(addThreats, val => { //Validate threats input based on threats type
      let validate = true;
      
      if (val.type !== '' && !helper.validateInputRuleData(val.type, val.input)) { //Threats input validation is not valid
        validate = false;
        validation = false;
      }

      tempAddThreats.push({
        ...val,
        validate
      });
    })

    _.forEach(SEVERITY_TYPE, val => { //Create formattedData object for input data based on severity
      _.forEach(addThreats, val2 => {
        if (val.toUpperCase() === val2.severity) {
          if (val2.type) {
            if (formattedData[val]) {
              formattedData[val].push({
                input: val2.input,
                type: val2.type + 'Array'
              });
            } else {
              formattedData[val] = [{
                input: val2.input,
                type: val2.type + 'Array'
              }];
            }
          } else { //Threats type is missing
            validation = false;
            return false;
          }
        }
      })
    })

    if (!validation) {
      this.setState({
        addThreats: tempAddThreats,
        info: t('edge-management.txt-edgeFormatError')
      });
      return;
    }

    _.forEach(formattedData, (val, key) => { //Create requestData object for aggregated input data
      requestData[key] = {};

      _.forEach(val, val2 => {
        if (requestData[key][val2.type]) {
          requestData[key][val2.type].push(val2.input);
        } else {
          requestData[key][val2.type] = [val2.input];
        }
      })
    })

    _.forEach(requestData, (val, key) => { //Generate formData for multiple APIs call
      let formData = new FormData();
      formData.append('severity', key.toUpperCase());

      _.forEach(val, (val2, key2) => {
        if (key2 === 'ipv6Array') { //Special case for IPv6
          key2 = 'ipArray';
        }

        formData.append(key2, val2.toString());
      })

      this.ah.one({
        url: `${baseUrl}/api/indicators`,
        data: formData,
        type: 'POST',
        processData: false,
        contentType: false
      })
      .then(data => {
        if (data) {
          if (addThreats.length > 0) {
            helper.showPopupMsg(t('edge-management.txt-addSuccess'));

            this.setState({ //Clear threats info and error msg
              addThreatsOpen: false,
              addThreats: [],
              info: ''
            });
          }
        }
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    })
  }
  /**
   * Toggle Import Threats dialog on/off
   * @method
   */
  toggleImportThreats = () => {
    this.setState({
      importThreatsOpen: !this.state.importThreatsOpen
    });

    this.handleCloseMenu();
  }
  /**
   * Set import threats file
   * @method
   * @param {object} file - indicators file uploaded by the user
   */
  getIndicatorsFile = (file) => {
    this.setState({
      threatsFile: file
    });
  }
  /**
   * Display threat import modal dialog and its content
   * @method
   * @returns ModalDialog component
   */
  importThreatsDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleImportThreats},
      confirm: {text: t('txt-confirm'), handler: this.confirmThreatImport}
    };
    const title = t('edge-management.txt-addThreat') + ' - ' + t('edge-management.txt-importTIMAP');
    const fileTitle = t('edge-management.txt-threatsFile') + '(.zip)';

    return (
      <ModalDialog
        id='importThreatsDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        <FileUpload
          id='importThreat'
          fileType='indicators'
          supportText={fileTitle}
          btnText={t('txt-upload')}
          handleFileChange={this.getIndicatorsFile} />
      </ModalDialog>
    )
  }
  /**
   * Handle Threats Import dialog confirm
   * @method
   */
  confirmThreatImport = () => {
    const {baseUrl} = this.context;
    const {threatsFile} = this.state;
    let formData = new FormData();
    formData.append('file', threatsFile);

    if (!threatsFile.name) {
      return;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    this.ah.one({
      url: `${baseUrl}/api/threat/upload`,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('edge-management.txt-addSuccess'));
        this.toggleImportThreats();

        this.setState({
          indicatorsData: null,
          threatsFile: {}
        }, () => {
          this.getChartsData();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle Search Threats dialog on/off
   * @method
   */
  toggleSearchThreats = () => {
    this.setState({
      threatsSearch: {
        keyword: '',
        type: 'IP'
      },
      searchThreatsOpen: !this.state.searchThreatsOpen
    });
  }
  /**
   * Handle filter input data change
   * @method
   * @param {object} event - event object
   */
  handleThreatsChange = (event) => {
    let tempThreatsSearch = {...this.state.threatsSearch};
    tempThreatsSearch[event.target.name] = event.target.value;

    this.setState({
      threatsSearch: tempThreatsSearch
    });
  }
  /**
   * Display search threats content
   * @method
   * @returns HTML DOM
   */
  displaySearchThreatsContent = () => {
    const {threatsSearch, threats} = this.state;
    const tableOptions = {
      tableBodyHeight: '57vh',
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
      <div className='filter'>
        <div className='filter-wrapper'>
          <div className='filter-section'>
            <TextField
              id='threatsSearchType'
              className='search-type'
              name='type'
              select
              label={t('edge-management.txt-serviceMode')}
              variant='outlined'
              fullWidth
              size='small'
              value={threatsSearch.type}
              onChange={this.handleThreatsChange}>
              <MenuItem value={'IP'}>IP</MenuItem>
              <MenuItem value={'DOMAIN'}>DomainName</MenuItem>
              <MenuItem value={'URL'}>URL</MenuItem>
              <MenuItem value={'SNORT'}>SNORT</MenuItem>
              <MenuItem value={'YARA'}>YARA</MenuItem>
              <MenuItem value={'CERT'}>Certification</MenuItem>
              <MenuItem value={'FILEHASH'}>FileHash</MenuItem>
              <MenuItem value={'FILEHASHWHITE'}>FileHashWhite</MenuItem>
            </TextField>
            <TextField
              id='threatsSearchKeyword'
              className='search-keyword'
              name='keyword'
              variant='outlined'
              fullWidth
              size='small'
              value={threatsSearch.keyword}
              onChange={this.handleThreatsChange} />
          </div>
          <div className='button-group'>
            <Button variant='contained' color='primary' className='btn' onClick={this.handleThreatsSearch.bind(this, 'search')}>{t('txt-search')}</Button>
          </div>
        </div>

        <MuiTableContent
          data={threats}
          tableOptions={tableOptions}
          tableHeight='auto'
          showLoading={false} />
      </div>
    )
  }
  /**
   * Display search threats modal dialog
   * @method
   * @returns ModalDialog component
   */
  searchThreatsDialog = () => {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.toggleSearchThreats}
    };

    return (
      <ModalDialog
        id='searchThreatsDialog'
        className='modal-dialog'
        title={t('edge-management.txt-searchThreat')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displaySearchThreatsContent()}
      </ModalDialog>
    )
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempThreats = {...this.state.threats};
    tempThreats.sort.field = field;
    tempThreats.sort.desc = sort;

    this.setState({
      threats: tempThreats
    }, () => {
      this.handleThreatsSearch();
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempThreats = {...this.state.threats};
    tempThreats[type] = Number(value);

    this.setState({
      threats: tempThreats
    }, () => {
      this.handleThreatsSearch(type);
    });
  }
  /**
   * Get and set Threats table data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   * @param {string} type - option for 'delete'
   * @param {object} allValue - threats data
   */
  handleThreatsSearch = (fromPage, type, allValue) => {
    const {baseUrl, contextRoot} = this.context;
    const {threatsSearch, threats} = this.state;
    const page = fromPage === 'currentPage' ? threats.currentPage : 0;

    if (!threatsSearch.keyword) {
      helper.showPopupMsg(t('txt-plsEnterKeyword'), t('txt-error'));
      return;
    }

    if (threatsSearch.type === 'URL') { //Handle special case for URL
      const pattern = /:\/\//;

      if (pattern.test(threatsSearch.keyword)) {
        helper.showPopupMsg(t('edge-management.txt-urlErrorMsg'), t('txt-error'));
        return;
      }
    }

    let apiArr = [
      {
        url: `${baseUrl}/api/indicators/_search?text=${threatsSearch.keyword}&threatTypeArray=${threatsSearch.type}&page=${page + 1}&pageSize=${threats.pageSize}`,
        type: 'GET'
      }
    ];

    //Combine the two APIs to show the loading icon
    if (type === 'delete') { //For deleting threat
      apiArr.unshift({
        url: `${baseUrl}/api/indicator?id=${allValue.id}&threatType=${allValue.threatType}`,
        type: 'DELETE'
      });
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.series(apiArr)
    .then(data => {
      if (data) {
        if (type === 'delete') {
          if (data[0] && data[0].ret === 0) {
            let tempThreats = {...threats};
            tempThreats.dataContent = [];
            tempThreats.totalCount = 0;
            tempThreats.sort = {
              field: 'threatText',
              desc: false
            };

            this.setState({
              threats: tempThreats
            }, () => {
              data = data[1].rt;
            });
          }
        } else {
          data = data[0].rt;
        }

        let tempThreats = {...threats};

        if (data[threatsSearch.type].rows.length === 0) {
          tempThreats.dataContent = [];
          tempThreats.totalCount = 0;

          this.setState({
            threats: tempThreats
          });
          return null;
        }

        tempThreats.dataContent = data[threatsSearch.type].rows;
        tempThreats.totalCount = data[threatsSearch.type].counts;
        tempThreats.currentPage = page;
        tempThreats.dataFields = _.map(threats.dataFieldsArr, val => {
          return {
            name: val,
            label: val === '_menu' ? ' ' : f(`threatsTableFields.${val}`),
            options: {
              sort: false,
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempThreats.dataContent[dataIndex];
                const value = tempThreats.dataContent[dataIndex][val];

                if (val === 'threatText' && allValue.score === -999) {
                  return <span style={{textDecoration: 'line-through'}}>{value}</span>
                } else if (val === 'createDttm') {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                } else if (val === '_menu') {
                  if (allValue.score !== -999) {
                    return (
                      <div className='table-menu menu active'>
                        <i className='fg fg-trashcan' onClick={this.openDeleteThreats.bind(this, allValue)} title={t('txt-delete')}></i>
                      </div>
                    )
                  }
                } else {
                  return value;
                }
              }
            }
          };
        });

        this.setState({
          threats: tempThreats
        }, () => {
          if (this.state.threats.dataContent.length === 0) {
            helper.showPopupMsg(t('txt-notFound'));
          }
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Open delete threats modal dialog
   * @method
   * @param {object} allValue - threats data
   */
  openDeleteThreats = (allValue) => {
    PopupDialog.prompt({
      title: t('edge-management.txt-deleteThreats'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{t('txt-delete-msg')}: {allValue.threatText}?</span>
        </div>
      ),
      act: (confirmed) => {
        if (confirmed) {
          this.handleThreatsSearch('', 'delete', allValue);
        }
      }
    });
  }
  /**
   * Show pie chart
   * @method
   * @param {array.<object>} indicatorsData - indicators data
   * @returns HTML DOM
   */
  showPieChart = (indicatorsData) => {
    return (
      <div className='chart-group'>
        {!indicatorsData &&
          <div className='empty-data'>
            <header>{t('edge-management.statistics.txt-sourceIndicators')}</header>
            <span><i className='fg fg-loading-2'></i></span>
          </div>
        }
        {indicatorsData && indicatorsData.length === 0 &&
          <div className='empty-data'>
            <header>{t('edge-management.statistics.txt-sourceIndicators')}</header>
            <span>{t('txt-notFound')}</span>
          </div>
        }
        {indicatorsData && indicatorsData.length > 0 &&
          <PieChart
            title={t('edge-management.statistics.txt-sourceIndicators')}
            data={indicatorsData}
            keyLabels={{
              key: t('txt-indicator'),
              doc_count: t('txt-count')
            }}
            valueLabels={{
              'Pie Chart': {
                key: t('txt-indicator'),
                doc_count: t('txt-count')
              }
            }}
            dataCfg={{
              splitSlice: ['key'],
              sliceSize: 'doc_count'
            }} />
        }
      </div>
    )
  }
  /**
   * Show tooltip info when mouseover the chart
   * @method
   * @param {object} eventInfo - MouseoverEvents
   * @param {array.<object>} data - chart data
   * @returns HTML DOM
   */
  onTooltip = (eventInfo, data) => {
    return (
      <section>
        <span>{t('txt-indicator')}: {data[0].indicator}<br /></span>
        <span>{t('txt-date')}: {moment(data[0].day).format('YYYY/MM/DD')}<br /></span>
        <span>{t('txt-count')}: {helper.numberWithCommas(data[0].count)}</span>
      </section>
    )
  }
  /**
   * Show bar chart
   * @method
   * @param {array.<object>} indicatorsData - indicators data
   * @returns HTML DOM
   */
  showBarChart = (indicatorsData) => {
    return (
      <div className='chart-group'>
        {!indicatorsData &&
          <div className='empty-data'>
            <header>{t('edge-management.statistics.txt-indicatorsTrend')}</header>
            <span><i className='fg fg-loading-2'></i></span>
          </div>
        }
        {indicatorsData && indicatorsData.length === 0 &&
          <div className='empty-data'>
            <header>{t('edge-management.statistics.txt-indicatorsTrend')}</header>
            <span>{t('txt-notFound')}</span>
          </div>
        }
        {indicatorsData && indicatorsData.length > 0 &&
          <BarChart
            stacked
            vertical
            title={t('edge-management.statistics.txt-indicatorsTrend')}
            legend={{
              enabled: true
            }}
            data={indicatorsData}
            dataCfg={{
              x: 'day',
              y: 'count',
              splitSeries: 'indicator'
            }}
            xAxis={{
              type: 'datetime'
            }}
            plotOptions={{
              series: {
                maxPointWidth: 20
              }
            }}
            tooltip={{
              formatter: this.onTooltip
            }} />
        }
      </div>
    )
  }
  /**
   * Show line chart
   * @method
   * @param {array.<object>} indicatorsData - indicators data
   * @returns HTML DOM
   */
  showLineChart = (indicatorsData) => {
    return (
      <div className='chart-group'>
        {!indicatorsData &&
          <div className='empty-data'>
            <header>{t('edge-management.statistics.txt-acuIndicatorsTrend')}</header>
            <span><i className='fg fg-loading-2'></i></span>
          </div>
        }
        {indicatorsData && indicatorsData.length === 0 &&
          <div className='empty-data'>
            <header>{t('edge-management.statistics.txt-acuIndicatorsTrend')}</header>
            <span>{t('txt-notFound')}</span>
          </div>
        }
        {indicatorsData && indicatorsData.length > 0 &&
          <LineChart
            title={t('edge-management.statistics.txt-acuIndicatorsTrend')}
            legend={{
              enabled: true
            }}
            data={indicatorsData}
            dataCfg={{
              x: 'day',
              y: 'count',
              splitSeries: 'indicator'
            }}
            xAxis={{
              type: 'datetime'
            }}
            tooltip={{
              formatter: this.onTooltip
            }} />
        }
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {
      datetime,
      activeDateType,
      contextAnchor,
      indicatorsData,
      indicatorsTrendData,
      acuIndicatorsTrendData,
      uplaodThreatsOpen,
      addThreatsOpen,
      importThreatsOpen,
      searchThreatsOpen,
      threats
    } = this.state;

    return (
      <div>
        {addThreatsOpen &&
          this.addThreatsDialog()
        }

        {uplaodThreatsOpen &&
          this.uploadThreatsDialog()
        }

        {importThreatsOpen &&
          this.importThreatsDialog()
        }

        {searchThreatsOpen &&
          this.searchThreatsDialog()
        }

        <div className='sub-header edge-options'>
          <ToggleButtonGroup
            id='edgeBtns'
            value={activeDateType}
            exclusive
            onChange={this.toggleDateRangeButtons}>
            <ToggleButton id='edgeToday' value='today'>{t('edge-management.txt-today')}</ToggleButton>
            <ToggleButton id='edgePast7days' value='past7days'>{t('edge-management.txt-past7days')}</ToggleButton>
            <ToggleButton id='edgeAllDays' value='allDays'>{t('edge-management.txt-allDays')}</ToggleButton>
            <ToggleButton id='edgeCustom' value='custom'>{t('edge-management.txt-customDate')}</ToggleButton>
          </ToggleButtonGroup>

          {activeDateType === 'custom' &&
            <SearchOptions
              datetime={datetime}
              enableTime={false}
              handleDateChange={this.handleDateChange}
              handleSearchSubmit={this.handleSearchSubmit} />
          }
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            <div className='main-content'>
              <header className='main-header'>{t('txt-threatIntelligence')}</header>
              <div className='content-header-btns'>
                <Button variant='outlined' color='primary' className='standard btn' onClick={this.handleOpenMenu}><span>{t('edge-management.txt-addThreat')}</span></Button>
                <Menu
                  anchorEl={contextAnchor}
                  keepMounted
                  open={Boolean(contextAnchor)}
                  onClose={this.handleCloseMenu}>
                  <MenuItem onClick={this.toggleAddThreats}>{t('edge-management.txt-addManually')}</MenuItem>
                  <MenuItem onClick={this.toggleUploadThreat}>{t('edge-management.txt-addMultiple') + '(.txt)'}</MenuItem>
                  <MenuItem onClick={this.toggleImportThreats}>{t('edge-management.txt-importTIMAP') + '(.zip)'}</MenuItem>
                </Menu>
                <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleSearchThreats}>{t('edge-management.txt-searchThreat')}</Button>
              </div>

              <div className='main-statistics'>
                <div className='statistics-content'>
                  {this.showPieChart(indicatorsData)}

                  {this.showBarChart(indicatorsTrendData)}

                  {activeDateType !== 'today' &&
                    this.showLineChart(acuIndicatorsTrendData)
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ThreatIntelligence.contextType = BaseDataContext;

ThreatIntelligence.propTypes = {
};

export default ThreatIntelligence;