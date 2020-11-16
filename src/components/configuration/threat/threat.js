import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'
import jschardet from 'jschardet'
import XLSX from 'xlsx';

import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

import BarChart from 'react-chart/build/src/components/bar'
import ContextMenu from 'react-ui/build/src/components/contextmenu'
import LineChart from 'react-chart/build/src/components/line'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PieChart from 'react-chart/build/src/components/pie'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import AddThreats from './add-threats'
import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import FileUpload from '../../common/file-upload'
import helper from '../../common/helper'
import SearchOptions from '../../common/search-options'
import TableContent from '../../common/table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];

/**
 * Threat Intelligence
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
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
        from: helper.getSubstractDate(1, 'week'),
        to: helper.getSubstractDate(1, 'day', Moment().local().format('YYYY-MM-DDTHH:mm:ss'))
        //from: '2020-06-04T00:00:00Z',
        //to: '2020-06-04T01:00:00Z'
      },
      activeDateType: 'past7days',
      indicatorsData: null,
      indicatorsTrendData: null,
      acuIndicatorsTrendData: null,
      todaysIndicatorsData: null,
      addThreatsOpen: false,
      uplaodThreatsOpen: false,
      importThreatsOpen: false,
      searchThreatsOpen: false,
      addThreats: [],
      threatsFile: {},
      threats: {
        dataFieldsArr: ['threatText', 'threatType', 'dataSourceType', 'createDttm', '_menu'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'threatText',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      info: '',
      tempTxtData: ''
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.getChartsData();
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
   * Get and set charts data
   * @method
   */
  getChartsData = () => {
    const {baseUrl} = this.context;
    const {datetime} = this.state;
    let dateTimeFrom = datetime.from;
    let dateTimeTo = datetime.to;

    if (datetime.from.indexOf('T') > 0) {
      dateTimeFrom = datetime.from.substr(0, 11) + '00:00:00';
    } else {
      dateTimeFrom = datetime.from + 'T00:00:00';
    }

    if (datetime.to.indexOf('T') > 0) {
      dateTimeTo = datetime.to.substr(0, 11) + '23:59:59';
    } else {
      dateTimeTo = datetime.to + 'T23:59:59';
    }

    const dateTime = {
      from: Moment(dateTimeFrom).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: Moment(dateTimeTo).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };

    if (Moment(dateTime.from).isAfter()) {
      helper.showPopupMsg(t('edge-management.txt-threatDateError'), t('txt-error'));
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/indicators/summary`,
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

    this.ah.one({
      url: `${baseUrl}/api/indicators/trend?startDttm=${dateTime.from}&endDttm=${dateTime.to}`,
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
                day: parseInt(Moment(helper.getFormattedDate(key2, 'local')).format('x')),
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

    this.ah.one({
      url: `${baseUrl}/api/indicators/trend/accum?startDttm=${dateTime.from}&endDttm=${dateTime.to}`,
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
                day: parseInt(Moment(helper.getFormattedDate(val.time, 'local')).format('x')),
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
   * Get and set today's charts data
   * @method
   */
  getTodayChartsData = () => {
    const {baseUrl} = this.context;
    const dateTime = {
      from: Moment(helper.getStartDate('day')).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: Moment().utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };

    this.ah.one({
      url: `${baseUrl}/api//indicators/summary/period?startDttm=${dateTime.from}&endDttm=${dateTime.to}`,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        this.setState({
          todaysIndicatorsData: this.formatPieChartData(data)
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Reset indicators data
   * @method
   * @param {string} type - data type to be cleared ('today', 'past7days' or 'search')
   */
  clearIndicatorsData = (type) => {
    if (type === 'today') {
      this.setState({
        todaysIndicatorsData: null
      }, () => {
        this.getTodayChartsData();
      })
    } else {
      let indicatorsObj = {
        indicatorsData: null,
        indicatorsTrendData: null,
        acuIndicatorsTrendData: null
      };

      if (type === 'past7days') {
        indicatorsObj.datetime = {
          from: helper.getSubstractDate(1, 'week'),
          to: helper.getSubstractDate(1, 'day', Moment().local().format('YYYY-MM-DDTHH:mm:ss'))
        };
      }

      this.setState({
        ...indicatorsObj
      }, () => {
        this.getChartsData();
      });
    }
  }
  /**
   * Toggle date options buttons
   * @method
   * @param {object} event - event object
   * @param {string} type - 'today', 'past7days' or 'custom'
   */
  toggleDateRangeButtons = (event, type) => {
    if (type === 'today' || type === 'past7days') {
      this.clearIndicatorsData(type);
    }

    this.setState({
      activeDateType: type
    });
  }
  /**
   * Set new datetime
   * @method
   * @param {object} datetime - new datetime object
   */
  handleDateChange = (datetime) => {
    this.setState({
      datetime
    });
  }
  /**
   * Construct and display Add Threats context menu
   * @method
   * @param {object} evt - mouseClick events
   */
  handleRowContextMenu = (evt) => {
    const menuItems = [
      {
        id: 'addManually',
        text: t('edge-management.txt-addManually'),
        action: () => this.toggleAddThreats()
      },
      {
        id: 'addMultiple',
        text: t('edge-management.txt-addMultiple') + '(.txt)',
        action: () => this.toggleUploadThreat()
      },
      {
        id: 'importThreats',
        text: t('edge-management.txt-importTIMAP') + '(.zip)',
        action: () => this.toggleImportThreats()
      }
    ];

    ContextMenu.open(evt, menuItems, 'addThreatsType');
    evt.stopPropagation();
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
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, {type: rABS ? 'binary' : 'array'});
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws, {header: 1});
      let result = data.filter(o => Object.keys(o).length);

      this.setState({
        tempTxtData: result
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
        <FileUpload
          supportText={fileTitle}
          id='uploadThreat'
          fileType='text'
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
    const {addThreats, tempTxtData} = this.state;
    let tempAddThreats = addThreats;

    if (tempTxtData.length > 0) {
      _.forEach(tempTxtData, val => {
        tempAddThreats.push({
          input: val[0],
          type: '',
          severity: 'ALERT',
          validate: true
        });
      })

      this.setState({
        uplaodThreatsOpen: false,
        addThreats: tempAddThreats
      }, () => {
        this.toggleAddThreats();
      });
    } else {
      helper.showPopupMsg(t('txt-selectFile'), t('txt-error'));
      return;
    }
  }
  /**
   * Handle search submit
   * @method
   */
  handleSearchSubmit = () => {
    const dateTimeTo = Moment(this.state.datetime.to).format('YYYY-MM-DD');
    const yesterday = Moment(helper.getSubstractDate(1, 'day', Moment().local())).format('YYYY-MM-DD');

    if (Moment(dateTimeTo).isAfter(yesterday)) { //Show error message
      helper.showPopupMsg(t('edge-management.txt-threatEndTimeError'), t('txt-error'));
      return;
    } else {
      this.clearIndicatorsData('search');
    }
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
      addThreatsOpen: !addThreatsOpen
    });
  }
  /**
   * Handle add/remove for the add threats box
   * @method
   * @param {array} data - add threats list array
   */
  handleAddThreatsChange = (data) => {
    this.setState({
      addThreats: data
    });
  }
  /**
   * Display add threats content
   * @method
   * @returns HTML DOM
   */
  displayAddThreatsContent = () => {
    return (
      <div>
        <MultiInput
          id='threatMultiInputs'
          base={AddThreats}
          defaultItemValue={{
            input: '',
            type: '',
            severity: 'ALERT',
            validate: true
          }}
          value={this.state.addThreats}
          onChange={this.handleAddThreatsChange}/>
      </div>
    )
  }
  /**
   * Open add threats modal dialog
   * @method
   * @returns HTML DOM
   */
  addThreatsDialog = () => {
    const {info} = this.state;
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
        info={info}
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
        addThreats: tempAddThreats
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
          supportText={fileTitle}
          id='importThreat'
          fileType='indicators'
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

    ah.one({
      url: `${baseUrl}/api/threat/upload`,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data.ret === 0) {
        helper.showPopupMsg(t('edge-management.txt-addSuccess'));
        this.toggleImportThreats();

        this.setState({
          indicatorsData: null
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
              fullWidth={true}
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
              fullWidth={true}
              size='small'
              value={threatsSearch.keyword}
              onChange={this.handleThreatsChange} />
          </div>
          <div className='button-group'>
            <button className='btn' onClick={this.handleThreatsSearch.bind(this, 'search')}>{t('txt-search')}</button>
          </div>
        </div>

        {threats.dataContent.length > 0 &&
          <TableContent
            dataTableData={threats.dataContent}
            dataTableFields={threats.dataFields}
            dataTableSort={threats.sort}
            paginationTotalCount={threats.totalCount}
            paginationPageSize={threats.pageSize}
            paginationCurrentPage={threats.currentPage}
            handleTableSort={this.handleTableSort}
            paginationPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
            paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
        }
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
      cancel: {text: t('txt-close'), className: 'standard', handler: this.toggleSearchThreats}
    };

    return (
      <ModalDialog
        id='searchThreatsDialog'
        className='modal-dialog'
        title={t('edge-management.txt-searchThreat')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displaySearchThreatsContent()}
      </ModalDialog>
    )
  }
  /**
   * Handle table sort
   * @method
   * @param {object} sort - sort data object
   */
  handleTableSort = (sort) => {
    let tempThreats = {...this.state.threats};
    tempThreats.sort.field = sort.field;
    tempThreats.sort.desc = sort.desc;

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

    if (type === 'pageSize') {
      tempThreats.currentPage = 1;
    }

    this.setState({
      threats: tempThreats
    }, () => {
      this.handleThreatsSearch();
    });
  }
  /**
   * Get and set Threats table data
   * @method
   * @param {string} fromSearch - option for the 'search'
   * @param {string} type - option for 'delete'
   * @param {object} allValue - threats data
   */
  handleThreatsSearch = (fromSearch, type, allValue) => {
    const {baseUrl, contextRoot} = this.context;
    const {threatsSearch, threats} = this.state;

    if (!threatsSearch.keyword) {
      helper.showPopupMsg(t('txt-plsEnterKeyword'));
      return;
    }

    let apiArr = [
      {
        url: `${baseUrl}/api/indicators/_search?text=${threatsSearch.keyword}&threatTypeArray=${threatsSearch.type}&page=${threats.currentPage}&pageSize=${threats.pageSize}`,
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
        tempThreats.dataContent = data[threatsSearch.type].rows;
        tempThreats.totalCount = data[threatsSearch.type].counts;
        tempThreats.currentPage = fromSearch === 'search' ? 1 : threats.currentPage;

        let dataFields = {};
        threats.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: tempData === '_menu' ? '' : f(`threatsTableFields.${tempData}`),
            sortable: tempData === '_menu' ? null : true,
            formatter: (value, allValue, i) => {
              if (tempData === 'threatText' && allValue.score === -999) {
                return <span style={{textDecoration: 'line-through'}}>{value}</span>
              } else if (tempData === 'createDttm') {
                return <span>{helper.getFormattedDate(value, 'local')}</span>
              } else if (tempData === '_menu') {
                if (allValue.score !== -999) {
                  return (
                    <div className='table-menu menu active'>
                      <i className='fg fg-trashcan' onClick={this.openDeleteThreats.bind(this, allValue)} title={t('txt-delete')}></i>
                    </div>
                  )
                }
              } else {
                return <span>{value}</span>
              }
            }
          };
        })

        tempThreats.dataFields = dataFields;

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
        <span>{t('txt-date')}: {Moment(data[0].day, 'x').utc().format('YYYY/MM/DD')}<br /></span>
        <span>{t('txt-count')}: {data[0].count}</span>
      </section>
    )
  }
  /**
   * Show bar chart
   * @method
   * @param {array.<object>} indicatorsData - indicators data
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
              enabled:true
            }}
            data={indicatorsData}
            onTooltip={this.onTooltip}
            dataCfg={{
              x: 'day',
              y: 'count',
              splitSeries: 'indicator'
            }}
            xAxis={{
              type: 'datetime',
              dateTimeLabelFormats: {
                day: '%Y-%m-%d'
              }
            }}
            plotOptions={{
              series: {
                maxPointWidth: 20
              }
            }} />
        }
      </div>
    )
  }
  /**
   * Show line chart
   * @method
   * @param {array.<object>} indicatorsData - indicators data
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
            onTooltip={this.onTooltip}
            dataCfg={{
              x: 'day',
              y: 'count',
              splitSeries: 'indicator'
            }}
            xAxis={{
              type: 'datetime',
              dateTimeLabelFormats: {
                day: '%Y-%m-%d'
              }
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
      indicatorsData,
      indicatorsTrendData,
      acuIndicatorsTrendData,
      todaysIndicatorsData,
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
            <ToggleButton value='today'>{t('edge-management.txt-today')}</ToggleButton>
            <ToggleButton value='past7days'>{t('edge-management.txt-past7days')}</ToggleButton>
            <ToggleButton value='custom'>{t('edge-management.txt-customDate')}</ToggleButton>
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
                <button className='standard btn' onClick={this.handleRowContextMenu}><span>{t('edge-management.txt-addThreat')}</span></button>
                <button className='standard btn' onClick={this.toggleSearchThreats}>{t('edge-management.txt-searchThreat')}</button>
              </div>

              <div className='main-statistics'>
                <div className='statistics-content'>
                  {activeDateType === 'today' &&
                    this.showPieChart(todaysIndicatorsData)
                  }

                  {activeDateType !== 'today' &&
                    this.showPieChart(indicatorsData)
                  }

                  {activeDateType !== 'today' &&
                    this.showBarChart(indicatorsTrendData)
                  }

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