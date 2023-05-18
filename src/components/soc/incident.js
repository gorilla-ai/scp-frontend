import React, { Component } from 'react'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreIcon from '@material-ui/icons/More'
import IconButton from '@material-ui/core/IconButton'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import DataTable from 'react-ui/build/src/components/table'
import {downloadLink, downloadWithForm} from 'react-ui/build/src/utils/download'
import FileInput from 'react-ui/build/src/components/file-input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../common/context'
import constants from '../constant/constant-incidnet'
import helper from '../common/helper'
import IncidentComment from './common/comment'
import IncidentFlowDialog from './common/flow-dialog'
import IncidentForm from './common/incident-form'
import IncidentReview from './common/review'
import IncidentTag from './common/tag'
import MuiTableContent from '../common/mui-table-content'
import NotifyDialog from './common/notify-dialog'
import RelatedList from './common/related-list'
import SocConfig from '../common/soc-configuration'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;
let it = null;
let at = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};

/**
 * Threats
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to handle the Incident page
 */
class Incident extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');
    at = global.chewbaccaI18n.getFixedT(null, 'account');

    this.state = {
      activeContent: 'tableList', //tableList, viewIncident, editIncident, addIncident
      displayPage: 'main', /* main, events, ttps */
      incidentType: '',
      incidentFormType: '', //'monitor', analyze' or 'EDR'
      toggleType:'',
      showFilter: false,
      showChart: true,
      relatedListOpen: false,
      uploadAttachmentOpen: false,
      currentIncident: {},
      originalIncident: {},
      accountType:constants.soc.LIMIT_ACCOUNT,
      accountDefault:false,
      severityList: [],
      socFlowList: [],
      search: {
        keyword: '',
        category: 0,
        status: 0,
        datetime: {
          from: helper.getSubstractDate(2, 'month'),
          to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
        },
        severity:'',
        isExpired: 2
      },
      dashboard: {
        all: 0,
        expired: 0,
        unhandled: 0,
        mine: 0
      },
      deviceListOptions: [],
      showDeviceListOptions: [],
      incident: {
        dataFieldsArr: ['_menu', 'id', 'tag', 'status', 'severity', 'createDttm', 'updateDttm',  'title', 'reporter', 'srcIPListString' , 'dstIPListString'],
        fileFieldsArr: ['fileName', 'fileSize', 'fileDttm', 'fileMemo', 'action'],
        flowFieldsArr: ['id', 'status', 'reviewDttm', 'reviewerName', 'suggestion'],
        dataFields: [],
        dataContent: [],
        sort: {
          field: 'createDttm',
          desc: true
        },
        totalCount: 0,
        currentPage: 0,
        pageSize: 20,
        info: {
          status: 1,
          socType: 1
        }
      },
      notifyEmailList: [],
      accountRoleType: [],
      loadListType: 1,
      attach: null,
      filesName: [],
      contextAnchor: null,
      currentData: {},
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
      ]
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'soc', locale);
    helper.inactivityTime(baseUrl, locale);

    let alertDataId = this.getQueryString('alertDataId');
    let alertData = sessionStorage.getItem(alertDataId);

    this.checkAccountType();
    this.setDefaultSearchOptions(alertData, alertDataId);
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  setDefaultSearchOptions = (alertData, alertDataId) => {
    const {baseUrl} = this.context;
    const severityList = _.map(SEVERITY_TYPE, (val, i) => {
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
        let socFlowSourceList = [];
        const socFlowList = _.map(data.rt.rows, val => {
          socFlowSourceList.push(val);
          return <MenuItem key={val.id} value={val.id}>{`${val.name}`}</MenuItem>
        });

        this.setState({
          socFlowSourceList,
          socFlowList
        });
      }
    }).catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });

    this.setState({
      severityList,
    }, () => {
      const {session} = this.context;

      this.setState({
        accountRoleType: session.roles
      }, () => {
        this.loadData('');
        this.getOptions();
      });
    });
  }
  getQueryString = (name) => {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    let r = window.location.search.substr(1).match(reg);

    if (r != null) return unescape(r[2]);
    return null;
  }
  checkAccountType = () => {
    const {baseUrl, session} = this.context;
    const requestData = {
      account:session.accountId
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
    });
  }
  /**
   * Get and set Incident Device table data
   * @method
   * @param {string} fromSearch - option for the 'search'
   */
  loadData = (fromSearch) => {
    this.setState({
      activeContent: 'tableList'
    },() => {
      const {baseUrl, contextRoot, session} = this.context;
      const {search, incident} = this.state;
      const sort = incident.sort.desc ? 'desc' : 'asc';
      const page = fromSearch === 'currentPage' ? incident.currentPage : 0;

      if (search.datetime) {
        search.startDttm = moment(search.datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
        search.endDttm = moment(search.datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      }

      search.accountRoleType = this.state.accountRoleType
      search.account = session.accountId

      helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

      ah.one({
        url: `${baseUrl}/api/soc/_searchV3?page=${page + 1}&pageSize=${incident.pageSize}&orders=${incident.sort.field} ${sort}`,
        data: JSON.stringify(search),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json'
      })
      .then(data => {
        if (data) {
          let tempEdge = {...incident};

          if (_.isEmpty(data.rt.rows) || data.rt.counts === 0) {
            tempEdge.dataFields = [];
            tempEdge.dataContent = [];
            tempEdge.totalCount = 0;
            tempEdge.currentPage = 1;
            tempEdge.pageSize = 20;

            this.setState({
              incident: tempEdge,
              activeContent: 'tableList'
            });
          } else {
            tempEdge.dataContent = data.rt.rows;
            tempEdge.totalCount = data.rt.counts;
            tempEdge.currentPage = page;

            tempEdge.dataFields = _.map(incident.dataFieldsArr, val => {
              return {
                name: val === '_menu' ? '' : val,
                label: val === '_menu' ? '' : f(`incidentFields.${val}`),
                options: {
                  filter: true,
                  sort: val === 'severity' || val === 'id' || val === 'createDttm'  || val === 'updateDttm' ,
                  customBodyRenderLite: (dataIndex, options) => {
                    const allValue = tempEdge.dataContent[dataIndex];
                    let value = tempEdge.dataContent[dataIndex][val];

                    if (options === 'getAllValue') {
                      return allValue;
                    }

                    if (val === '_menu') {
                      return (
                        <IconButton aria-label='more' onClick={this.handleOpenMenu.bind(this, allValue)}>
                          <MoreIcon/>
                        </IconButton>
                      )
                    } else if (val === 'type') {
                      let tmpList = [];
                      tmpList = allValue.ttpList;

                      if (tmpList.length === 0) {
                        return <span>{it('txt-incident-event')}</span>
                      } else {
                        return <span>{it('txt-incident-related')}</span>
                      }
                    } else if (val === 'category') {
                      return <span>{it(`category.${value}`)}</span>
                    } else if (val === 'status') {
                      let status = 'N/A';

                      if (allValue.flowData) {
                        if (allValue.flowData.finish) {
                          return <span>{it('status.3')}</span>
                        }

                        if (allValue.flowData.currentEntity) {
                          status = allValue.flowData.currentEntity[allValue.id].entityName;
                        }
                      }
                      return <span>{status}</span>
                    } else if (val === 'createDttm' || val === 'updateDttm') {
                      return <span>{helper.getFormattedDate(value, 'local')}</span>
                    } else if (val === 'tag') {
                      const tags = _.map(allValue.tagList, 'tag.tag');

                      return (
                        <div>
                          {
                            _.map(allValue.tagList, el => {
                              return (
                                <div style={{display: 'flex', marginRight: '30px'}}>
                                  <div className='incident-tag-square' style={{backgroundColor: el.tag.color}}></div>
                                    &nbsp;{el.tag.tag}
                                </div>
                              )
                            })
                          }
                        </div>
                      )
                    } else if (val === 'severity') {
                      return <span className='severity-level' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>;
                    } else if (val === 'srcIPListString' || val === 'dstIPListString') {
                      let formattedPatternIP = ''

                      if (value.length > 32) {
                        formattedPatternIP = value.substr(0, 32) + '...';
                      } else {
                        formattedPatternIP = value;
                      }

                      return <span>{formattedPatternIP}</span>
                    } else {
                      return <span>{value}</span>
                    }
                  }
                }
              };
            });

            this.setState({
              incident: tempEdge,
              activeContent: 'tableList',
              loadListType: 1
            });
          }
        }
        return null
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    });
  }
  /**
   * Handle open menu
   * @method
   * @param {object} data - active data
   * @param {object} event - event object
   */
  handleOpenMenu = (data, event) => {
    this.setState({
      contextAnchor: event.currentTarget,
      currentData: data
    });
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null,
      currentData: {}
    });
  }
  handleRowMouseOver = (index, allValue, evt) => {
    let tempIncident = {...this.state.incident};

    tempIncident['dataContent'] = _.map(tempIncident['dataContent'], el => {
      return {
        ...el,
        _menu: el.id === allValue.id
      };
    });

    this.setState({
      incident: tempIncident
    });
  }
  /**
   * Display edit Incident content
   * @method
   * @returns HTML DOM
   */
  displayEditContent = () => {
    const {session} = this.context;
    const {
      activeContent,
      severityList,
      incidentType,
      incidentFormType,
      incident,
      toggleType,
      socFlowList,
      displayPage,
      attach,
      filesName,
      deviceListOptions,
      showDeviceListOptions,
      incidentAccidentList,
      incidentAccidentSubList
    } = this.state;
    let editCheck = false;
    let drawCheck = false;
    let submitCheck = true;
    let returnCheck = true;
    let closeCheck = false;

    if (session.accountId === incident.info.creator) {
      drawCheck = true;
    }

    if (incident.info.flowData.currentEntity[incident.info.id].entityId === incident.info.flowData.firstEntityId) {
      returnCheck = false;
    }

    if (_.includes(this.state.accountRoleType,constants.soc.SOC_Analyzer)) {
      editCheck = true;
    }

    if (_.includes(this.state.accountRoleType,constants.soc.SOC_Executor)) {
      closeCheck = true;
      editCheck = true;
    }

    let tmpTagList = [];

    if (incident.info.tagList && incident.info.tagList.length >= 3) {
      tmpTagList = incident.info.tagList.slice(0,3);
    } else {
      tmpTagList = incident.info.tagList;
    }

    return (
      <div className='main-content basic-form'>
        <header className='main-header' style={{display: 'flex'}}>
          {it(`txt-${activeContent}-${incidentFormType}`)}

          {activeContent !== 'addIncident' &&
            <div className='msg' style={{display: 'flex'}}>{it('txt-id')}<span style={{color: 'red'}}>{incident.info.id}</span>
              <div style={{display: 'flex', marginLeft: '10px'}}>
              {
                _.map(tmpTagList, el => {
                  let formattedWording = '';

                  if (el.tag.tag.length > 6) {
                    formattedWording = el.tag.tag.substr(0, 6) + '...';
                  } else {
                    formattedWording = el.tag.tag;
                  }

                  return (
                    <div style={{display: 'flex', marginRight: '5px'}}>
                    <div className='incident-tag-square' style={{backgroundColor: el.tag.color}}/>
                      {formattedWording}
                    </div>
                  )
                })
              }
              {incident.info.tagList && incident.info.tagList.length >= 3 && '...'}
              </div>
            </div>
          }
        </header>

        {activeContent === 'viewIncident' &&
          <div className='content-header-btns'>
            <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>

            {editCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'editIncident')}>{t('txt-edit')}</Button>
            }
            {returnCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'return')}>{it('txt-return')}</Button>
            }
            {submitCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'submit')}>{it('txt-submit')}</Button>
            }
            {closeCheck &&
              <Button variant='outlined' color='primary' className='standard btn edit'  onClick={this.openReviewModal.bind(this, incident.info, 'closeV2')}>{it('txt-close')}</Button>
            }
            <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.exportPdf}>{t('txt-export')}</Button>
            <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.notifyContact}>{it('txt-notify')}</Button>
          </div>
        }

        <div className='auto-settings'>
          <IncidentForm
            from='soc'
            activeContent={activeContent}
            displayPage={displayPage}
            incident={incident}
            severityList={severityList}
            incidentType={incidentType}
            incidentFormType={incidentFormType}
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
            toggleUploadAttachment={this.toggleUploadAttachment}
            handleConnectContactChange={this.handleConnectContactChange}
            handleIncidentPageChange={this.handleIncidentPageChange}
            handleEventsChange={this.handleEventsChange}
            handleKillChainChange={this.handleKillChainChange}
            handleTtpsChange={this.handleTtpsChange}
            handleTtpEdrChange={this.handleTtpEdrChange}
            toggleRelatedListModal={this.toggleRelatedListModal}
            refreshIncidentAttach={this.refreshIncidentAttach}
            toggleEstablishDateCheckbox={this.toggleEstablishDateCheckbox} />
        </div>

        {activeContent === 'editIncident' &&
          <footer>
            <Button variant='outlined' color='primary' className='standard'  onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</Button>
            <Button variant='contained' color='primary'  onClick={this.handleSubmit}>{t('txt-save')}</Button>
          </footer>
        }

        {activeContent === 'addIncident' &&
          <footer>
            <Button variant='outlined' color='primary' className='standard'  onClick={this.toggleContent.bind(this, 'cancel-add')}>{t('txt-cancel')}</Button>
            <Button variant='contained' color='primary'onClick={this.handleSubmit}>{t('txt-save')}</Button>
          </footer>
        }
      </div>
    )
  }
  handleIncidentPageChange = (val) => {
    this.setState({
      displayPage: val
    });
  }
  toggleRelatedListModal = () => {
    this.setState({
      relatedListOpen: !this.state.relatedListOpen
    });
  }
  setIncidentList = (list) => {
    const tempIncident = {...this.state.incident};
    tempIncident.info.showFontendRelatedList = list;

    this.setState({
      incident: tempIncident
    }, () => {
      this.toggleRelatedListModal();
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
   * Display related list
   * @method
   * @param {object} params - parameters for Autocomplete
   * @returns TextField component
   */
  renderRelatedList = (params) => {
    return (
      <TextField
        {...params}
        variant='outlined'
        size='small'
        fullWidth={true} />
    )
  }
  onTagsChange = (event, values) => {
    let temp = {...this.state.incident};
    temp.info['showFontendRelatedList'] = values;

    this.setState({
      incident: temp
    });
  }
  formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0 || bytes === '0') {
      return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
  /**
   * Toggle file upload modal
   * @method
   */
  toggleUploadAttachment = () => {
    this.setState({
      uploadAttachmentOpen: !this.state.uploadAttachmentOpen
    }, () => {
      if (!this.state.uploadAttachmentOpen) {
        this.setState({
          attach: null,
          filesName: []
        });
      }
    });
  }
  /**
   * Display file upload content
   * @method
   * @param {string} type - page type ('page' or 'modal')
   * @returns HTML DOM
   */  
  commonUploadContent = (type) => {
    const {incident, filesName} = this.state;

    return (
      <React.Fragment>
        <div className='group'>
          <div className='c-file-input clearable file-input' style={type === 'page' ? {width: '95%'} : null}>
            <input type='file' id='multiMalware' style={{width: 'calc(100% - 25px)'}} multiple onChange={this.handleFileChange} />
            <button type='button'>{t('txt-selectFile')}</button>
            <input type='text' className='long-name' readOnly value={filesName} />
            {filesName.length > 0 &&
              <i class='c-link inline fg fg-close' onClick={this.handleFileChange.bind(this, 'clear')}></i>
            }
          </div>
        </div>
        <div className='group'>
          <label htmlFor='fileMemo'>{it('txt-fileMemo')}</label>
          <TextareaAutosize
            id='fileMemo'
            name='fileMemo'
            className='textarea-autosize'
            onChange={this.handleDataChangeMui}
            value={incident.info.fileMemo}
            rows={2} />
        </div>
      </React.Fragment>
    )
  }
  /**
   * Handle file upload modal
   * @method
   * @returns ModalDialog component
   */
  uploadAttachmentModal = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleUploadAttachment},
      confirm: {text: t('txt-confirm'), handler: this.uploadAttachmentConfirm}
    };

    return (
      <ModalDialog
        id='uploadAttachmentDialog'
        className='modal-dialog'
        title={it('txt-attachedFile')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        <div className='c-form content'>
          {this.commonUploadContent('modal')}
        </div>
      </ModalDialog>
    )
  }
  /**
   * Handle file upload confirm
   * @method
   */
  uploadAttachmentConfirm = () => {
    const {baseUrl} = this.context;
    const {incident, attach} = this.state;

    if (attach.length > 0) {
      let formData = new FormData();
      formData.append('id', incident.info.id);

      _.forEach(attach, val => {
        formData.append('file', val);
      })

      formData.append('fileMemo', incident.info.fileMemo || '');

      helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

      ah.one({
        url: `${baseUrl}/api/soc/attachment/_upload`,
        data: formData,
        type: 'POST',
        processData: false,
        contentType: false
      })
      .then(data => {
        this.refreshIncidentAttach(incident.info.id);
        this.toggleUploadAttachment();
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
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
  handleKillChainChange = (val) => {
    let temp = {...this.state.incident};
    temp.info.killChainList = val;

    this.setState({
      incident: temp
    });
  }
  handleTtpsChange = (val) => {
    let temp = {...this.state.incident};
    temp.info.ttpList = val;

    this.setState({
      incident: temp
    });
  }
  handleTtpEdrChange = (val, event) => {
    let temp = {...this.state.incident};

    if (val[0] && val[0].obsSocketList) { //Handle special case for obsSocketList
      const obsSocket = val[0].obsSocketList[0];

      if (obsSocket && !obsSocket.ip && !obsSocket.port) {
        val[0].obsSocketList = [];
      }
    }

    temp.info.edrList = val;

    this.setState({
      incident: temp
    });
  }
  handleSubmit = () => {
    const {baseUrl, contextRoot, session} = this.context;
    const {activeContent, incidentType, incidentFormType, attach} = this.state;
    let incident = {...this.state.incident};

    if (!this.checkRequired(incident.info)) {
      return;
    }

    if (incident.info.showFontendRelatedList && incident.info.showFontendRelatedList.length > 0) {
      incident.info.relatedList = _.map(incident.info.showFontendRelatedList, val => {
        return {
          incidentRelatedId: val
        };
      });
    }

    if (incident.info.eventList && incident.info.eventList.length > 0) {
      incident.info.eventList = _.map(incident.info.eventList, el => {
        _.forEach(el.eventConnectionList, eventConnectItem => {
          if (eventConnectItem.srcPort === '') {
            eventConnectItem.srcPort = 0;
          }

          if (eventConnectItem.dstPort === '') {
            eventConnectItem.dstPort = 0;
          }
        })

        let processArray = [];

        if (el.eventProcessList.length > 0) {
          processArray = _.map(el.eventProcessList, val => {
            return val.process;
          });
        }

        return {
          ...el,
          processArray,
          startDttm: moment(el.time.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
          endDttm: moment(el.time.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
        };
      });
    }

    if (incidentFormType === 'EDR') {
      let newTtpList = [{
        obsFileList: []
      }];

      _.forEach(incident.info.ttpList, val => {
        newTtpList[0].obsFileList.push(val.obsFileList[0]);
      })

      incident.info.ttpList = newTtpList;
    }

    if (incident.info.ttpList && incident.info.ttpList.length > 0) {
      incident.info.ttpList = _.map(incident.info.ttpList, el => {
        if (el.obsFileList && el.obsFileList.length > 0) {
          let obsFileList = [];

          _.forEach(el.obsFileList, val => {
            let processArray = [];

            if (val.eventProcessList && val.eventProcessList.length > 0) {
              processArray = _.map(val.eventProcessList, val2 => {
                return val2.process;
              });
            }

            obsFileList.push({
              ...val,
              fileSize: Number(val.fileSize),
              createDttm: moment(val.createDttm).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
              modifyDttm: moment(val.modifyDttm).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
              accessDttm: moment(val.accessDttm).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
              incidentMalwareAnalysisDTO: {
                product: val.product,
                resultName: val.resultName,
                result: val.result,
                processArray
              }
            });
          })

          return {
            ...el,
            obsFileList
          };
        } else {
          return {
            ...el
          };
        }
      });
    }

    if (incidentFormType === 'EDR') {
      if (incident.info.ttpList && incident.info.ttpList.length > 0 && incident.info.edrList && incident.info.edrList.length > 0) {
        incident.info.ttpList = [{
          ...incident.info.ttpList[0],
          ...incident.info.edrList[0]
        }];
      }
    }

    if (incident.info.accidentCatogory) {
      if (incident.info.accidentCatogory === 5) {
        incident.info.accidentAbnormal = null;
      } else {
        incident.info.accidentAbnormalOther = null;
      }
    }

    if (incident.info.expireDttm) {
      incident.info.expireDttm = moment(incident.info.expireDttm).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    }

    if (incident.info.enableEstablishDttm) {
      incident.info.establishDttm = moment(incident.info.establishDttm).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    } else {
      incident.info.establishDttm = '';
    }

    if (!incident.info.creator) {
      incident.info.creator = session.accountId;
    }

    // add for save who edit
    incident.info.editor = session.accountId;

    if (activeContent === 'addIncident') {
      incident.info.status =  constants.soc.INCIDENT_STATUS_UNREVIEWED;
    }

    if (incidentFormType) {
      incident.info.incidentType = incidentFormType;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc`,
      data: JSON.stringify(incident.info),
      type: activeContent === 'addIncident' ? 'POST' : 'PATCH',
      contentType: 'application/json',
      dataType: 'json'
    }).then(data => {
      incident.info.id = data.rt.id;
      incident.info.updateDttm = data.rt.updateDttm;
      incident.info.status = data.rt.status;

      this.setState({
        incidentFormType: '',
        originalIncident: _.cloneDeep(incident)
      }, () => {
        if (attach) {
          this.uploadAttachment();
        }

        this.getIncident(incident.info.id);
        this.toggleContent('cancel');
      });

      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  checkRequired = (incident) => {
    const {incidentType, incidentFormType} = this.state;

    if (!incident.title || !incident.incidentDescription || !incident.reporter || !incident.attackName || !incident.description || !incident.impactAssessment || !incident.socType || !incident.severity || !incident.flowTemplateId) {
      PopupDialog.alert({
        title: t('txt-tips'),
        display: it('txt-validBasic'),
        confirmText: t('txt-close')
      });
      return false;
    }

    if (!incident.category) {
      PopupDialog.alert({
        title: t('txt-tips'),
        display: it('txt-validCategory'),
        confirmText: t('txt-close')
      });
      return false;
    }

    //check for kill chain list
    if (incident.killChainList && incident.killChainList.length > 0) {
      let killChainCheck = true;

      _.forEach(incident.killChainList, val => {
        if (val.killChainName || val.phaseName) {
          if (!val.killChainName || !val.phaseName) {
            killChainCheck = false;
            return;
          }
        }
      })

      if (!killChainCheck) {
        PopupDialog.alert({
          title: t('txt-tips'),
          display: it('txt-validKillChain'),
          confirmText: t('txt-close')
        });
        return false;
      }
    }

    // always check event list
    if (!incident.eventList) {
      PopupDialog.alert({
        title: t('txt-tips'),
        display: it('txt-validEvents'),
        confirmText: t('txt-close')
      });
      return false;
    } else {
      let eventCheck = true;

      if (incident.eventList.length <= 0) {
        PopupDialog.alert({
          title: t('txt-tips'),
          display: it('txt-validEvents'),
          confirmText: t('txt-close')
        });
        eventCheck = false;
      } else {
        _.forEach(incident.eventList, event => {
          if (_.size(event.eventConnectionList)<= 0) {
            PopupDialog.alert({
              title: t('txt-tips'),
              display: it('txt-validEvents'),
              confirmText: t('txt-close')
            });
            eventCheck = false;
          } else {
            _.forEach(event.eventConnectionList, eventConnect => {
              if (!helper.ValidateIP_Address(eventConnect.srcIp) ) {
                PopupDialog.alert({
                  title: t('txt-tips'),
                  display: t('network-topology.txt-ipValidationFail'),
                  confirmText: t('txt-close')
                });
                eventCheck = false;
                return;
              }

              if (!helper.ValidateIP_Address(eventConnect.dstIp)) {
                PopupDialog.alert({
                  title: t('txt-tips'),
                  display: t('network-topology.txt-ipValidationFail'),
                  confirmText: t('txt-close')
                });
                eventCheck = false;
                return;
              }

              if (eventConnect.dstPort) {
                if (!helper.ValidatePort(eventConnect.dstPort)) {
                  PopupDialog.alert({
                    title: t('txt-tips'),
                    display: t('network-topology.txt-portValidationFail'),
                    confirmText: t('txt-close')
                  });
                  eventCheck = false;
                  return;
                }
              }

              if (eventConnect.srcPort) {
                if (!helper.ValidatePort(eventConnect.srcPort)) {
                  PopupDialog.alert({
                    title: t('txt-tips'),
                    display: t('network-topology.txt-portValidationFail'),
                    confirmText: t('txt-close')
                  });
                  eventCheck = false;
                }
              }

              if (incidentFormType === 'EDR') {
                if (eventConnect.dstHostname === '') {
                  PopupDialog.alert({
                    title: t('txt-tips'),
                    display: it('txt-validDstHostname'),
                    confirmText: t('txt-close')
                  });
                  eventCheck = false;
                  return;
                }
              }
            })
          }
        })
      }

      if (!eventCheck) {
        return false;
      }

      const empty = _.filter(incident.eventList, function(o) {
        return !o.description || !o.deviceId || !o.eventConnectionList || !o.frequency;
      });

      if (_.size(empty) > 0) {
        PopupDialog.alert({
          title: t('txt-tips'),
          display: it('txt-validEvents'),
          confirmText: t('txt-close')
        });
        return false;
      }
    }

    // check ttp list
    if (incidentType === 'ttps') {
      if (!incident.ttpList) {
        PopupDialog.alert({
          title: t('txt-tips'),
          display: it('txt-validTTPs'),
          confirmText: t('txt-close')
        });
        return false;
      } else {
        let statusCheck = true;
        let fileCheck = false;
        let edrCheck = false;
        let urlCheck = false;
        let socketCheck = false;

        _.forEach(incident.ttpList, ttp => {
          if (ttp && ttp.obsFileList && (_.size(ttp.obsFileList) > 0)) {
            _.forEach(ttp.obsFileList, file => {
              if (!file.fileName || !file.fileExtension) {
                fileCheck = false;
                return;
              } else {
                if (file.md5 || file.sha1 || file.sha256) {
                  if (helper.validateInputRuleData('fileHashMd5', file.md5)) {
                    fileCheck = true;
                  } else if (helper.validateInputRuleData('fileHashSha1', file.sha1)) {
                    fileCheck = true;
                  } else if (helper.validateInputRuleData('fileHashSha256', file.sha256)) {
                    fileCheck = true;
                  } else {
                    fileCheck = false;
                    return;
                  }
                } else {
                  fileCheck = false;
                  return;
                }
              }

              if (!file.fileSize || !file.createDttm || !file.modifyDttm || !file.accessDttm || !file.product || file.isFamily.toString() === '' || !file.resultName || !file.result || !file.uploadFileName || !file.tmpFileId || !file.malwareTypes) {
                fileCheck = false;
                return;
              } else {
                fileCheck = true;
              }
            })
          } else {
            fileCheck = true;
          }

          if (ttp && ttp.obsUriList && (_.size(ttp.obsUriList) > 0)) {
            _.forEach(ttp.obsUriList, uri => {
              if (uri.uriType && uri.uriValue) {
                urlCheck = true;
              } else {
                urlCheck = false;
                return;
              }
            })
          } else {
            urlCheck = true;
          }

          if (incidentFormType !== 'EDR') {
            if (ttp && ttp.obsSocketList && (_.size(ttp.obsSocketList) > 0)) {
              _.forEach(ttp.obsSocketList, socket => {
                if (socket.ip || socket.port) {
                  if (socket.ip && !helper.ValidateIP_Address(socket.ip)) {
                    PopupDialog.alert({
                      title: t('txt-tips'),
                      display: t('network-topology.txt-ipValidationFail'),
                      confirmText: t('txt-close')
                    });
                    socketCheck = false;
                    return;
                  }

                  if (socket.port) {
                    if (!helper.ValidatePort(socket.port)) {
                      PopupDialog.alert({
                        title: t('txt-tips'),
                        display: t('network-topology.txt-portValidationFail'),
                        confirmText: t('txt-close')
                      });
                      socketCheck = false;
                      return;
                    } else {
                      if (!socket.ip) {
                        PopupDialog.alert({
                          title: t('txt-tips'),
                          display: t('network-topology.txt-ipValidationFail'),
                          confirmText: t('txt-close')
                        });
                        socketCheck = false;
                        return;
                      }
                      socketCheck = true;
                    }
                  }
                  socketCheck = true;
                } else {
                  socketCheck = false;
                  return;
                }
              })
            } else {
              socketCheck = true;
            }

            if (!fileCheck && !urlCheck && !socketCheck) {
              PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-incident-ttps') + '(' + it('txt-ttp-obs-file') + '/' + it('txt-ttp-obs-uri') + '/' + it('txt-ttp-obs-socket') + '-' + it('txt-mustOne') + ')',
                confirmText: t('txt-close')
              });
              statusCheck = false;
            }
          }

          if (!fileCheck) {
            PopupDialog.alert({
              title: t('txt-tips'),
              display: it('txt-checkFileFieldType'),
              confirmText: t('txt-close')
            });
            statusCheck = false;
          }

          if (incidentFormType !== 'EDR') {
            if (!urlCheck) {
              PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-checkUrlFieldType'),
                confirmText: t('txt-close')
              });
              statusCheck = false;
            }
            if (!socketCheck) {
              PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-checkIPFieldType'),
                confirmText: t('txt-close')
              });
              statusCheck = false;
            }

            if (_.size(ttp.obsSocketList) <= 0 && _.size(ttp.obsUriList) <= 0 && _.size(ttp.obsFileList) <= 0) {
              PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-incident-ttps') + '(' + it('txt-ttp-obs-file') + '/' + it('txt-ttp-obs-uri') + '/' + it('txt-ttp-obs-socket') + '-' + it('txt-mustOne') + ')',
                confirmText: t('txt-close')
              });
              statusCheck = false;
            }
          }
        })

        if (incidentFormType !== 'EDR') {
          const empty = _.filter(incident.ttpList, function(o) {
            if (o.infrastructureType === undefined || o.infrastructureType === 0) {
              o.infrastructureType = '0';
            }

            if (!o.title || !o.infrastructureType) {
              statusCheck = false;
            }
          });

          if (_.size(empty) > 0) {
            PopupDialog.alert({
              title: t('txt-tips'),
              display: it('txt-validTechniqueInfa'),
              confirmText: t('txt-close')
            });
            statusCheck = false;
          }
          return statusCheck;
        }

        if (incidentFormType === 'EDR' && incident.edrList && incident.edrList.length > 0) {
          if (incident.edrList[0].title || incident.edrList[0].infrastructureType) {
            edrCheck = true;

            if (!incident.edrList[0].title && !incident.edrList[0].infrastructureType) {
              edrCheck = false;
            }

            if (_.isEmpty(incident.edrList[0].obsUriList) && _.isEmpty(incident.edrList[0].obsSocketList)) {
              edrCheck = false;
            }

            if (!edrCheck) {
              PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-incident-ttps') + '('+it('txt-ttp-obs-uri') + '/' + it('txt-ttp-obs-socket') + '-' + it('txt-mustOne') + ')',
                confirmText: t('txt-close')
              });
              return;
            }
          }

          if (incident.edrList[0].obsUriList && _.size(incident.edrList[0].obsUriList) > 0) {
            _.forEach(incident.edrList[0].obsUriList, uri => {
              if (uri.uriType && uri.uriValue) {
                urlCheck = true;
              } else {
                urlCheck = false;
                return;
              }
            })
          } else {
            urlCheck = true;
          }

          if (!urlCheck) {
            PopupDialog.alert({
              title: t('txt-tips'),
              display: it('txt-checkUrlFieldType'),
              confirmText: t('txt-close')
            });
            return;
          }

          if (incident.edrList[0].obsSocketList && _.size(incident.edrList[0].obsSocketList) > 0) {
            _.forEach(incident.edrList[0].obsSocketList, socket => {
              if (socket.ip || socket.port) {
                if (socket.ip && !helper.ValidateIP_Address(socket.ip)) {
                  PopupDialog.alert({
                    title: t('txt-tips'),
                    display: t('network-topology.txt-ipValidationFail'),
                    confirmText: t('txt-close')
                  });
                  socketCheck = false;
                  return;
                }

                if (socket.port) {
                  if (!helper.ValidatePort(socket.port)) {
                    PopupDialog.alert({
                      title: t('txt-tips'),
                      display: t('network-topology.txt-portValidationFail'),
                      confirmText: t('txt-close')
                    });
                    socketCheck = false;
                    return;
                  } else {
                    if (!socket.ip) {
                      PopupDialog.alert({
                        title: t('txt-tips'),
                        display: t('network-topology.txt-ipValidationFail'),
                        confirmText: t('txt-close')
                      });
                      socketCheck = false;
                      return;
                    }
                    socketCheck = true;
                  }
                } else {
                  socketCheck = false;
                  return;
                }
              } else {
                socketCheck = true;
              }
            })
          } else {
            socketCheck = true;
          }

          if (!socketCheck) {
            PopupDialog.alert({
              title: t('txt-tips'),
              display: it('txt-checkIPFieldType'),
              confirmText: t('txt-close')
            });
            return;
          }
        }
        return statusCheck;
      }
    }
    return true;
  }
  getIncident = (id, type) => {
    const {baseUrl} = this.context;
    const {activeContent, incidentType, incident, showDeviceListOptions} = this.state;

    this.handleCloseMenu();

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc?id=${id}`,
      type: 'GET'
    })
    .then(data => {
      let tempIncident = {...incident};
      let tempShowDeviceListOptions = _.cloneDeep(showDeviceListOptions);
      let temp = data.rt;
      temp.showFontendRelatedList = _.map(temp.relatedList, val => {
        return val.incidentRelatedId;
      });
      const incidentFormType = temp.incidentType;

      if (temp.eventList && temp.eventList.length > 0) {
        temp.eventList = _.map(temp.eventList, el => {
          let eventProcessList  = [];

          if (el.processArray && el.processArray.length > 0) {
            eventProcessList = _.map(el.processArray, val => {
              return {
                process: val
              };
            });
          }

          return {
            ...el,
            eventProcessList,
            time: {
              from: moment(el.startDttm, 'YYYY-MM-DDTHH:mm:ssZ').local().format('YYYY-MM-DD HH:mm:ss'),
              to: moment(el.endDttm, 'YYYY-MM-DDTHH:mm:ssZ').local().format('YYYY-MM-DD HH:mm:ss')
            }
          };
        })
      }

      if (temp.ttpList && temp.ttpList.length > 0) {
        temp.ttpList = _.map(temp.ttpList, el => {
          let tempTtp = el;

          if (tempTtp.infrastructureType === 0) {
            tempTtp.infrastructureType = '0';
          } else if (tempTtp.infrastructureType === 1) {
            tempTtp.infrastructureType = '1';
          }

          if (tempTtp.obsFileList && tempTtp.obsFileList.length > 0) {
            tempTtp.obsFileList = _.map(tempTtp.obsFileList, el => {
              let eventProcessList  = [];

              if (el.incidentMalwareAnalysisDTO && el.incidentMalwareAnalysisDTO.processArray && el.incidentMalwareAnalysisDTO.processArray.length > 0) {
                eventProcessList = _.map(el.incidentMalwareAnalysisDTO.processArray, val => {
                  return {
                    process: val
                  };
                });
              }

              return {
                ...el,
                createDttm: moment(el.createDttm).local().format('YYYY-MM-DD HH:mm:ss'),
                modifyDttm: moment(el.modifyDttm).local().format('YYYY-MM-DD HH:mm:ss'),
                accessDttm: moment(el.accessDttm).local().format('YYYY-MM-DD HH:mm:ss'),
                product: el.incidentMalwareAnalysisDTO.product,
                resultName: el.incidentMalwareAnalysisDTO.resultName,
                result: el.incidentMalwareAnalysisDTO.result,
                eventProcessList
              };
            })
          }

          return {
            ...tempTtp
          };
        });
      }

      if (incidentFormType === 'EDR') {
        if (temp.ttpList && temp.ttpList.length > 0) {
          temp.edrList = _.cloneDeep(temp.ttpList);
          delete temp.edrList[0].obsFileList;

          temp.ttpList = _.map(temp.ttpList[0].obsFileList, val => {
            return {
              obsFileList: [val]
            };
          });
        }
      }

      let toggleType = type;
      tempIncident.info = temp;

      let deviceListIDs = [];

      _.forEach(showDeviceListOptions, val => {
        deviceListIDs.push(val.value);
      });

      _.forEach(temp.eventDeviceList, val => {
        if (!_.includes(deviceListIDs, val.id)) {
          tempShowDeviceListOptions.push({
            value: val.id,
            text: val.deviceName
          });
        }
      })

      this.setState({
        incident: tempIncident,
        incidentType: _.size(temp.ttpList) > 0 ? 'ttps' : 'events',
        incidentFormType,
        toggleType,
        showDeviceListOptions: tempShowDeviceListOptions
      }, () => {
        this.toggleContent('viewIncident', temp);
      })
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  refreshIncidentAttach = (id) => {
    const {baseUrl} = this.context;
    const {activeContent, incidentType, incident} = this.state;

    this.handleCloseMenu();

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc?id=${id}`,
      type: 'GET'
    })
    .then(data => {
      let {incident} = this.state;
      let tempIncident = {...incident};
      let temp = data.rt;

      if (temp.relatedList) {
        temp.relatedList = _.map(temp.relatedList, el => {
          const obj = {
            value: el.incidentRelatedId,
            text: el.incidentRelatedId
          };
          return obj;
        });
      }

      let result = _.map(temp.relatedList, function(obj) {
        return _.assign(obj, _.find([], {value: obj.value}));
      });

      temp.showFontendRelatedList = result;

      if (temp.eventList) {
        temp.eventList = _.map(temp.eventList, el => {
          return {
            ...el,
            time: {
              from: moment(el.startDttm, 'YYYY-MM-DDTHH:mm:ssZ').local().format('YYYY-MM-DD HH:mm:ss'),
              to: moment(el.endDttm, 'YYYY-MM-DDTHH:mm:ssZ').local().format('YYYY-MM-DD HH:mm:ss')
            }
          };
        });
      }

      if (temp.ttpList) {
        temp.ttpList = _.map(temp.ttpList, el => {
          let tempTtp = el;

          if (tempTtp.infrastructureType === 0) {
            tempTtp.infrastructureType = '0';
          } else if (tempTtp.infrastructureType === 1) {
            tempTtp.infrastructureType = '1';
          }

          return {
            ...tempTtp
          };
        });
      }

      let incidentType = _.size(temp.ttpList) > 0 ? 'ttps' : 'events';
      incident.info.attachmentDescription = temp.attachmentDescription;
      incident.info.fileList = temp.fileList;
      incident.info.fileMemo =  temp.fileMemo;

      this.setState({
        incident,
        incidentType
      }, () => {
        this.toggleContent('refreshAttach', temp);
      })
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {locale} = this.context;
    const {showFilter, search, severityList} = this.state;
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
            <label htmlFor='keyword'>{f('edgeFields.keywords')}</label>
            <TextField
              id='keyword'
              name='keyword'
              variant='outlined'
              fullWidth={true}
              size='small'
              value={search.keyword}
              onChange={this.handleSearchMui} />
          </div>
          <div className='group'>
            <label htmlFor='searchCategory'>{f('incidentFields.category')}</label>
            <TextField
              id='searchCategory'
              name='category'
              select
              required={true}
              variant='outlined'
              fullWidth={true}
              size='small'
              value={search.category}
              onChange={this.handleSearchMui}>
              {
                _.map(_.range(0, 9), el => {
                  return <MenuItem value={el}>{it(`category.${el}`)}</MenuItem>
                })
              }
            </TextField>
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
              value={search.severity}
              onChange={this.handleSearchMui}>
              {severityList}
            </TextField>
          </div>
          <div className='group' style={{width: '500px'}}>
            <label htmlFor='searchDttm'>{f('incidentFields.createDttm')}</label>
            <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
              <KeyboardDateTimePicker
                className='date-time-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD HH:mm'
                ampm={false}
                value={search.datetime.from}
                onChange={this.handleSearchTime.bind(this, 'from')} />
              <div className='between'>~</div>
              <KeyboardDateTimePicker
                className='date-time-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD HH:mm'
                ampm={false}
                value={search.datetime.to}
                onChange={this.handleSearchTime.bind(this, 'to')} />
            </MuiPickersUtilsProvider>
          </div>
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.loadData.bind(this, 'search')}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /* ---- Func Space ---- */
  /**
   * Show Delete Incident dialog
   * @method
   * @param {object} allValue - IncidentDevice data
   */
  openDeleteMenu = (allValue) => {
    PopupDialog.prompt({
      title: t('txt-delete'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{t('txt-delete-msg')}: {allValue.id}?</span>
        </div>
      ),
      act: (confirmed, data) => {
        if (confirmed) {
          this.deleteIncident(allValue.id);
        }
      }
    })
  }
  openReviewModal= (allValue, reviewType) => {
    PopupDialog.prompt({
      title: it(`txt-${reviewType}`),
      confirmText: t('txt-confirm'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{it(`txt-${reviewType}-msg`)}: {allValue.id}?</span>
        </div>
      ),
      act: (confirmed, data) => {
        if (confirmed) {
          this.openIncidentReview(allValue.id, reviewType);
        }
      }
    })
  }
  /**
   * Show Send Incident dialog
   * @method
   * @param {object} allValue - IncidentDevice data
   */
  openSendMenu = (id) => {
    PopupDialog.prompt({
      title: it('txt-send'),
      id: 'modalWindowSmall',
      confirmText: it('txt-send'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
            <span>{it('txt-send-msg')}: {id} ?</span>
        </div>
      ),
      act: (confirmed, data) => {
        if (confirmed) {
          this.sendIncident(id);
        }
      }
    })
  }
  /**
   * Handle delete Incident confirm
   * @method
   */
  deleteIncident = (id) => {
    const {baseUrl} = this.context;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc?id=${id}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.loadData();
      }
      return null
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let temp = {...this.state.incident};
    temp[type] = Number(value);

    this.setState({
      incident: temp
    }, () => {
      this.loadData(type);
    });
  }
  toggleContent = (type, allValue) => {
    const {baseUrl, contextRoot} = this.context;
    const {originalIncident, incident, incidentFormType} = this.state;
    let tempIncident = {...incident};
    let showPage = type;

    if (type === 'viewIncident') {
      tempIncident.info = {
        id: allValue.id,
        title: allValue.title,
        incidentDescription: allValue.incidentDescription,
        category: allValue.category,
        reporter: allValue.reporter,
        attackName: allValue.attackName,
        description: allValue.description,
        impactAssessment: allValue.impactAssessment,
        socType: allValue.socType,
        createDttm: allValue.createDttm,
        updateDttm: allValue.updateDttm,
        relatedList: allValue.relatedList,
        showFontendRelatedList:allValue.showFontendRelatedList,
        differenceWithOptions:allValue.differenceWithOptions,
        ttpList: allValue.ttpList,
        eventList: allValue.eventList,
        killChainList: allValue.killChainList,
        status: allValue.status,
        fileList: allValue.fileList,
        fileMemo: allValue.fileMemo,
        tagList: allValue.tagList,
        notifyList: allValue.notifyList,
        historyList: allValue.historyList,
        creator: allValue.creator,
        announceSource: allValue.announceSource,
        expireDttm: helper.getFormattedDate(allValue.expireDttm, 'local'),
        establishDttm: helper.getFormattedDate(allValue.establishDttm, 'local'),
        attachmentDescription: allValue.attachmentDescription,
        accidentCatogory: allValue.accidentCatogory,
        accidentDescription: allValue.accidentDescription,
        accidentReason: allValue.accidentReason,
        accidentInvestigation: allValue.accidentInvestigation,
        accidentAbnormal: allValue.accidentAbnormal,
        accidentAbnormalOther: allValue.accidentAbnormalOther,
        severity: allValue.severity,
        flowTemplateId:allValue.flowTemplateId,
        flowData: allValue.flowData
      };

      if (incidentFormType === 'EDR') {
        tempIncident.info.edrList = allValue.edrList;
      }

      if (!tempIncident.info.socType) {
        tempIncident.info.socType = 1
      }

      if (allValue.establishDttm) {
        tempIncident.info.enableEstablishDttm = true;
      } else {
        tempIncident.info.enableEstablishDttm = false;
      }

      this.setState({
        showFilter: false,
        originalIncident: _.cloneDeep(tempIncident)
      });
    } else if (type === 'tableList') {
      tempIncident.info = _.cloneDeep(incident.info);
    } else if (type === 'cancel-add') {
      showPage = 'tableList';
      tempIncident = _.cloneDeep(originalIncident);

      this.setState({
        incidentFormType: ''
      });
    } else if (type === 'cancel') {
      showPage = 'viewIncident';
      tempIncident = _.cloneDeep(originalIncident);
    } else if (type === 'redirect') {
      let alertData = JSON.parse(allValue);

      tempIncident.info = {
        title: alertData.Info,
        reporter: alertData.Collector,
        rawData:alertData,
        severity: alertData._severity_,
      };

      if (tempIncident.info.severity === 'Emergency') {
        tempIncident.info['impactAssessment'] = 4;
      } else  if (tempIncident.info.severity === 'Alert') {
        tempIncident.info['impactAssessment'] = 3;
      } else  if (tempIncident.info.severity === 'Notice') {
        tempIncident.info['impactAssessment'] = 1;
      } else  if (tempIncident.info.severity === 'Warning') {
        tempIncident.info['impactAssessment'] = 2;
      } else  if (tempIncident.info.severity === 'Critical') {
        tempIncident.info['impactAssessment'] = 3;
      }

      if (!tempIncident.info.socType) {
        tempIncident.info.socType = 1
      }

      // make incident.info
      let eventNetworkList = [];
      let eventNetworkItem = {
        srcIp: alertData.ipSrc || alertData.srcIp,
        srcPort: parseInt(alertData.portSrc) || parseInt(alertData.srcPort),
        dstIp: alertData.ipDst || alertData.dstIp,
        dstPort: parseInt(alertData.destPort),
        srcHostname: '',
        dstHostname: ''
      };
      eventNetworkList.push(eventNetworkItem);

      let eventList = [];
      let eventListItem = {
        description: alertData.Rule || alertData.trailName || alertData.__index_name,
        deviceId: '',
        frequency: 1,
        time: {
          from: helper.getFormattedDate(alertData._eventDttm_, 'local'),
          to: helper.getFormattedDate(alertData._eventDttm_, 'local')
        },
        eventConnectionList: eventNetworkList
      };

      if (alertData._edgeInfo || alertData._edgeId) {
        let searchRequestData = {
          deviceId: alertData._edgeInfo.agentId || alertData._edgeId
        };

        helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

        ah.one({
          url: `${baseUrl}/api/soc/device/redirect/_search`,
          data: JSON.stringify(searchRequestData),
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json'
        }).then(data => {
          eventListItem.deviceId = data.rt.device.id;
        })
      }

      eventList.push(eventListItem);
      tempIncident.info.eventList = eventList;
      showPage = 'addIncident';

      this.setState({
        showFilter: false,
        originalIncident: _.cloneDeep(tempIncident),
        incidentType: 'events',
        displayPage: 'main'
      });
    } else if (type === 'audit') {

    } else if (type === 'download') {
      this.getIncidentSTIXFile(allValue.id);
    } else if (type === 'refreshAttach') {
      tempIncident.info.attachmentDescription = allValue.attachmentDescription;
      tempIncident.info.fileList = allValue.fileList;
      tempIncident.info.fileMemo =  allValue.fileMemo;

      this.setState({
        showFilter: false,
        originalIncident: _.cloneDeep(tempIncident)
      });

      if (this.state.activeContent === 'editIncident') {
        showPage = 'editIncident';
      } else {
        showPage = 'viewIncident';
      }
    }

    this.setState({
      displayPage: 'main',
      activeContent: showPage,
      incident: tempIncident
    }, () => {
      if (showPage === 'tableList' || showPage === 'cancel-add') {
        this.loadData('currentPage');
      }
    });
  }
  /**
   *
   * @param {string} id
   */
  auditIncident = (id) => {
    const {baseUrl} = this.context;
    const tmp = {
      id
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/_audit`,
      data: JSON.stringify(tmp),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      this.afterAuditDialog(id);
      return null;
    })
    .catch(err => {
      helper.showPopupMsg(it('txt-audit-fail'), it('txt-audit'));
    })
  }
  /**
   * Send Incident
   * @param {string} id
   */
  sendIncident = (id) => {
    const {baseUrl} = this.context;
    const tmp = {
      id
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/_send`,
      data: JSON.stringify(tmp),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data.rt) {
        if (data.rt.error) {
          helper.showPopupMsg(it('txt-send-fail'), data.rt.message);
        } else {
          this.loadData();
          helper.showPopupMsg(it('txt-send-success'), it('txt-send'));
        }
      }
    })
    .catch(err => {
      helper.showPopupMsg(it('txt-send-fail'), it('txt-send'));
    })
  }
  /**
   * Open audit finish dialog
   * @method
   * @returns ModalDialog component
   */
  afterAuditDialog = (incidentId) => {
    const titleText = it('txt-send');

    PopupDialog.prompt({
      id: 'afterAuditDialog',
      title: titleText,
      cancelText: t('txt-close'),
      confirmText: it('txt-send'),
      display: this.displayAfterAudit(),
      act: (confirmed) => {
        if (confirmed) {
          this.sendIncident(incidentId);
        } else {
          this.loadData();
        }
      }
    });
  }
  /**
   * Display audit finish dialog content
   * @method
   * @returns HTML DOM
   */
  displayAfterAudit = () => {
    return (
      <div>
        <label>{it('txt-audit-success')}{it('txt-sendCheck')}</label>
      </div>
    )
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - input type
   * @param {Object} event - input value
   */
  handleInputSearch = (type, event) => {
    let tempSearch = {...this.state.search};
    tempSearch[type] = event.target.value.trim();

    this.setState({
      search: tempSearch
    });
  }
  handleSearchChange = (event) => {
    let tempSearch = {...this.state.search};
    tempSearch[event.target.name] = event.target.value.trim();

    this.setState({
      search: tempSearch
    });
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleSearch = (type, value) => {
    let tempSearch = {...this.state.search};
    tempSearch[type] = value;

    this.setState({
      search: tempSearch
    });
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleSearchTime = (type, value) => {
    let tempSearch = {...this.state.search};
    tempSearch.datetime[type] = value;

    this.setState({
      search: tempSearch
    });
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleSearchMui = (event) => {
    let tempSearch = {...this.state.search};
    tempSearch[event.target.name] = event.target.value;

    this.setState({
      search: tempSearch
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
  toggleChart = () => {
    this.setState({
      showChart: !this.state.showChart
    });
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      search: {
        keyword: '',
        category: 0,
        status: 0,
        datetime:{
          from: helper.getSubstractDate(1, 'month'),
          to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
        },
        isExpired: 2
      }
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
    const {socFlowSourceList} = this.state;
    let temp = {...this.state.incident};
    temp.info[event.target.name] = event.target.value;       

    if (event.target.name === 'severity') {
      if (event.target.value === 'Emergency') {
        temp.info['impactAssessment'] = 4;
        temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours');
      } else if (event.target.value === 'Alert') {
        temp.info['impactAssessment'] = 3;
        temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours');
      } else if (event.target.value === 'Notice') {
        temp.info['impactAssessment'] = 1;
        temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours');
      } else if (event.target.value === 'Warning') {
        temp.info['impactAssessment'] = 2;
        temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours');
      } else if (event.target.value === 'Critical') {
        temp.info['impactAssessment'] = 3;
        temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours');
      }
    }

    if (event.target.name === 'flowTemplateId') {
      _.forEach(socFlowSourceList , flowVal => {
        if (flowVal.id === event.target.value) {
          if (flowVal.severity === 'Emergency') {
            temp.info['severity'] = 'Emergency';
            temp.info['impactAssessment'] = 4;
            temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours');
          } else if (flowVal.severity === 'Alert') {
            temp.info['severity'] = 'Alert';
            temp.info['impactAssessment'] = 3;
            temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours');
          } else if (flowVal.severity === 'Notice') {
            temp.info['severity'] = 'Notice';
            temp.info['impactAssessment'] = 1;
            temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours');
          } else if (flowVal.severity === 'Warning') {
            temp.info['severity'] = 'Warning';
            temp.info['impactAssessment'] = 2;
            temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours');
          } else if (flowVal.severity === 'Critical') {
            temp.info['severity'] = 'Critical';
            temp.info['impactAssessment'] = 3;
            temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours');
          }
        }
      })
    }

    if (event.target.name === 'impactAssessment') {
      temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * event.target.value), 'hours');
    }

    this.setState({
      incident: temp
    });
  }
  getOptions = () => {
    const {baseUrl, contextRoot, session} = this.context;

    // helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    // ah.one({
    //   url: `${baseUrl}/api/soc/_search`,
    //   data: JSON.stringify({}),
    //   type: 'POST',
    //   contentType: 'application/json',
    //   dataType: 'json'
    // })
    // .then(data => {
    //   if (data) {
    //     let list = _.map(data.rt.rows, val => {
    //       let ipContent = '';

    //       if (val.eventList) {
    //         val.eventList = _.map(val.eventList, el => {
    //           if (el.eventConnectionList) {
    //             el.eventConnectionList = _.map(el.eventConnectionList, ecl => {
    //                 ipContent += '(' + it('txt-srcIp')+ ': ' + ecl.srcIp + ')'
    //             })
    //           }
    //         })
    //       }

    //       return {
    //         value: val.id,
    //         text: val.id + ' (' + it(`category.${val.category}`) + ')' + ipContent
    //       };
    //     });

    //     this.setState({
    //       relatedListOptions: list
    //     });
    //   }
    // })
    // .catch(err => {
    //   helper.showPopupMsg('', t('txt-error'), err.message);
    // })

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/device/_search`,
      data: JSON.stringify({use:'1'}),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data) {
        let list = _.map(data.rt.rows, val => {
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
        let list = _.map(data.rt.rows, val => {
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
  }
  /**
   * Handle XML download
   * @param {Example-Type} option
   */
  getIncidentSTIXFileExample = (option) => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/soc/incident/example/_export`;
    const requestData = {
      example: option
    };

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  /**
   * Incident-ID
   * @param {Incident-ID} incidentId
   */
  getIncidentSTIXFile = (incidentId) => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/soc/_export`;
    const requestData = {
      id: incidentId
    };

    this.handleCloseMenu();

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  /**
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable or null
   */
  checkSortable = (field) => {
    const unSortableFields = ['description', '_menu', 'action', 'tag'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  /**
   * Handle table sort
   * @method
   * @param {object} sort - sort data object
   */
  handleTableSort = (field, sort) => {
    let tmpIncident = {...this.state.incident};
    tmpIncident.sort.field = field;
    tmpIncident.sort.desc = sort;

    this.setState({
      incident: tmpIncident
    }, () => {
      this.loadData('currentPage');
    });
  }
  openIncidentComment = () => {
    this.incidentComment.open();
  }
  openIncidentTag = (id) => {
    this.handleCloseMenu();
    this.incidentTag.open(id);
  }
  openIncidentFlow = (id) => {
    this.handleCloseMenu();
    this.incidentFlowDialog.open(id);
  }
  openIncidentReview = (incidentId, reviewType) => {
    this.incidentReview.open(incidentId, reviewType);
  }
  openNotifyDialog = () => {
    this.notifyDialog.open(this.state.incident.info.id, this.state.notifyEmailList);
  }
  uploadAttachment = () => {
    const {baseUrl} = this.context;
    let {incident, attach} = this.state;

    let formData = new FormData();
    formData.append('id', incident.info.id);
    formData.append('file', attach);
    formData.append('fileMemo', incident.info.fileMemo || '');

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/attachment/_upload`,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      this.setState({
        attach: null
      },() => {
        this.getIncident(incident.info.id, 'view');
      })
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  downloadAttachment = (allValue) => {
    const {baseUrl, contextRoot} = this.context
    const {incident} = this.state
    const url = `${baseUrl}${contextRoot}/api/soc/attachment/_download?id=${incident.info.id}&fileName=${allValue.fileName}`

    downloadLink(url);
  }
  deleteAttachment = (allValue) => {
    const {baseUrl} = this.context;
    let {incident} = this.state;

    PopupDialog.prompt({
      title: t('txt-delete'),
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: <div className='content delete'>
          <span>{t('txt-delete-msg')}: {allValue.fileName}?</span>
      </div>,
      act: (confirmed, data) => {
        if (confirmed) {
          helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

          ah.one({
            url: `${baseUrl}/api/soc/attachment/_delete?id=${incident.info.id}&fileName=${allValue.fileName}`,
            type: 'DELETE'
          })
          .then(data => {
            if (data.ret === 0) {
              this.refreshIncidentAttach(incident.info.id);
            }
          })
          .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message);
          })
        }
      }
    })
  }
  toPdfPayload = (incident) => {
    const {incidentType, deviceListOptions, showDeviceListOptions} = this.state;
    let payload = {};

    payload.id = incident.id;
    payload.header = `${it('txt-incident-id')}${incident.id}`;
    // basic
    payload.basic = {};
    payload.basic.cols = 4;
    payload.basic.header = `${t('edge-management.txt-basicInfo')}    ${f('incidentFields.updateDttm')}  ${helper.getFormattedDate(incident.updateDttm, 'local')}`;
    payload.basic.table = [];
    payload.basic.table.push({text: f('incidentFields.title'), colSpan: 2});
    payload.basic.table.push({text: f('incidentFields.category'), colSpan: 2});
    payload.basic.table.push({text: incident.title, colSpan: 2});
    payload.basic.table.push({text: it(`category.${incident.category}`), colSpan: 2});
    payload.basic.table.push({text: f('incidentFields.incidentDescription'), colSpan: 4});
    payload.basic.table.push({text: incident.incidentDescription, colSpan: 4});
    payload.basic.table.push({text: f('incidentFields.reporter'), colSpan: 2});
    payload.basic.table.push({text: f('incidentFields.impactAssessment'), colSpan: 1});
    payload.basic.table.push({text: f('incidentFields.finalDate'), colSpan: 1});
    payload.basic.table.push({text: incident.reporter, colSpan: 2});
    payload.basic.table.push({text: `${incident.impactAssessment} (${(9 - 2 * incident.impactAssessment)} ${it('txt-day')})`, colSpan: 1});
    payload.basic.table.push({text: helper.getFormattedDate(incident.expireDttm, 'local'), colSpan: 1});
    payload.basic.table.push({text: helper.getFormattedDate(incident.establishDttm, 'local'), colSpan: 1});
    payload.basic.table.push({text: f('incidentFields.attackName'), colSpan: 4});
    payload.basic.table.push({text: incident.attackName, colSpan: 4});
    payload.basic.table.push({text: f('incidentFields.description'), colSpan: 4});
    payload.basic.table.push({text: incident.description, colSpan: 4});        

    if (incidentType === 'ttps') {
      if (_.size(incident.relatedList) > 0) {
        let value = []
        _.forEach(incident.relatedList, el => {
          const target = _.find([], {value: el.value})
          value.push(target.text)
        })

        payload.basic.table.push({text: f('incidentFields.relatedList'), colSpan: 4})
        payload.basic.table.push({text: value.toString(), colSpan: 4})
      }
    }

    // history
    payload.history = {};
    payload.history.cols = 4;
    payload.history.header = it('txt-flowTitle');
    payload.history.table = [];
    payload.history.table.push({text: f(`incidentFields.status`), colSpan: 1});
    payload.history.table.push({text: f(`incidentFields.reviewDttm`), colSpan: 1});
    payload.history.table.push({text: f(`incidentFields.reviewerName`), colSpan: 1});
    payload.history.table.push({text: f(`incidentFields.suggestion`), colSpan: 1});

    _.forEach(incident.historyList, el => {
      payload.history.table.push({text: it(`action.${el.status}`), colSpan: 1});
      payload.history.table.push({text: moment(el.reviewDttm).local().format('YYYY-MM-DD HH:mm:ss'), colSpan: 1});
      payload.history.table.push({text: el.reviewerName, colSpan: 1});
      payload.history.table.push({text: el.suggestion, colSpan: 1});
    })


    // attach
    if (_.size(incident.fileList) > 0) {
      payload.attachment = {};
      payload.attachment.cols = 4;
      payload.attachment.header = it('txt-attachedFile');
      payload.attachment.table = [];
      payload.attachment.table.push({text: f(`incidentFields.fileName`), colSpan: 1});
      payload.attachment.table.push({text: f(`incidentFields.fileSize`), colSpan: 1});
      payload.attachment.table.push({text: f(`incidentFields.fileDttm`), colSpan: 1});
      payload.attachment.table.push({text: f(`incidentFields.fileMemo`), colSpan: 1});

      _.forEach(incident.fileList, file => {
        payload.attachment.table.push({text: file.fileName, colSpan: 1});
        payload.attachment.table.push({text: this.formatBytes(file.fileSize), colSpan: 1});
        payload.attachment.table.push({text: moment(file.fileDttm).local().format('YYYY-MM-DD HH:mm:ss'), colSpan: 1});
        const target = _.find(JSON.parse(incident.attachmentDescription), {fileName: file.fileName});
        payload.attachment.table.push({text: target.fileMemo, colSpan: 1});
      })
    }

    //  Contact list
    payload.notifyList = {};
    payload.notifyList.cols = 8;
    payload.notifyList.header = it('txt-notifyUnit');
    payload.notifyList.table = [];

    _.forEach(incident.notifyList, notify => {
      payload.notifyList.table.push({text: f('incidentFields.name'), colSpan: 2});
      payload.notifyList.table.push({text: f('incidentFields.reviewerName'), colSpan: 2});
      payload.notifyList.table.push({text: f('incidentFields.phone'), colSpan: 2});
      payload.notifyList.table.push({text: f('incidentFields.email'), colSpan: 2});
      payload.notifyList.table.push({text: notify.title, colSpan: 2});
      payload.notifyList.table.push({text: notify.name, colSpan: 2});
      payload.notifyList.table.push({text: notify.phone, colSpan: 2});
      payload.notifyList.table.push({text: notify.email, colSpan: 2});
    })

    // accident
    payload.accident = {};
    payload.accident.cols = 4;
    payload.accident.header = it('txt-accidentTitle');
    payload.accident.table = [];
    payload.accident.table.push({text: it('txt-accidentClassification'), colSpan: 2});
    payload.accident.table.push({text: it('txt-reason'), colSpan: 2});

    if (incident.accidentCatogory) {
      payload.accident.table.push({text: it(`accident.${incident.accidentCatogory}`), colSpan: 2});
    } else {
      payload.accident.table.push({text: ' ', colSpan: 2});
    }

    if (!incident.accidentCatogory) {
      payload.accident.table.push({text: ' ', colSpan: 2});
    } else if (incident.accidentCatogory === '5') {
      payload.accident.table.push({text: incident.accidentAbnormalOther, colSpan: 2});
    } else {
      payload.accident.table.push({text: it(`accident.${incident.accidentAbnormal}`), colSpan: 2});
    }

    payload.accident.table.push({text: it('txt-accidentDescr'), colSpan: 4});
    payload.accident.table.push({text: incident.accidentDescription, colSpan: 4});
    payload.accident.table.push({text: it('txt-reasonDescr'), colSpan: 4});
    payload.accident.table.push({text: incident.accidentReason, colSpan: 4});
    payload.accident.table.push({text: it('txt-accidentInvestigation'), colSpan: 4});
    payload.accident.table.push({text: incident.accidentInvestigation, colSpan: 4});


    //  event list
    payload.eventList = {};
    payload.eventList.cols = 6;
    payload.eventList.header = it('txt-incident-events');
    payload.eventList.table = [];

    _.forEach(incident.eventList, event => {
      payload.eventList.table.push({text: f('incidentFields.rule'), colSpan: 3});
      payload.eventList.table.push({text: f('incidentFields.deviceId'), colSpan: 3});
      payload.eventList.table.push({text: event.description, colSpan: 3});

      const target = _.find(showDeviceListOptions, {value: event.deviceId});

      if (target) {
        payload.eventList.table.push({text: target.text, colSpan: 3});
      } else {
        payload.eventList.table.push({text: '', colSpan: 3});
      }

      payload.eventList.table.push({text: f('incidentFields.dateRange'), colSpan: 4});
      payload.eventList.table.push({text: it('txt-frequency'), colSpan: 2});
      payload.eventList.table.push({text: moment.utc(event.startDttm, 'YYYY-MM-DDTHH:mm:ss[Z]').local().format('YYYY-MM-DD HH:mm:ss'), colSpan: 2});
      payload.eventList.table.push({text: moment.utc(event.endDttm, 'YYYY-MM-DDTHH:mm:ss[Z]').local().format('YYYY-MM-DD HH:mm:ss'), colSpan: 2});
      payload.eventList.table.push({text: event.frequency, colSpan: 2});

      _.forEach(event.eventConnectionList, conn => {
        payload.eventList.table.push({text: f('incidentFields.srcIp'), colSpan: 2});
        payload.eventList.table.push({text: f('incidentFields.srcPort'), colSpan: 2});
        payload.eventList.table.push({text: f('incidentFields.srcHostname'), colSpan: 2});
        payload.eventList.table.push({text: conn.srcIp, colSpan: 2});
        payload.eventList.table.push({text: conn.srcPort, colSpan: 2});
        payload.eventList.table.push({text: conn.srcHostname, colSpan: 2});
        payload.eventList.table.push({text: f('incidentFields.dstIp'), colSpan: 2});
        payload.eventList.table.push({text: f('incidentFields.dstPort'), colSpan: 2});
        payload.eventList.table.push({text: f('incidentFields.dstHostname'), colSpan: 2});
        payload.eventList.table.push({text: conn.dstIp, colSpan: 2});
        payload.eventList.table.push({text: conn.dstPort, colSpan: 2});
        payload.eventList.table.push({text: conn.dstHostname, colSpan: 2});
      })
    })

    // ttps
    if (_.size(incident.ttpList) > 0) {
      payload.ttps = {};
      payload.ttps.cols = 4;
      payload.ttps.header = it('txt-incident-ttps');
      payload.ttps.table = [];
    }

    _.forEach(incident.ttpList, ttp => {
      payload.ttps.table.push({text: f('incidentFields.technique'), colSpan: 2});
      payload.ttps.table.push({text: f('incidentFields.infrastructureType'), colSpan: 2});
      payload.ttps.table.push({text: ttp.title, colSpan: 2});
      payload.ttps.table.push({text: (ttp.infrastructureType === 0 || ttp.infrastructureType === '0') ? 'IOC' : 'IOA' , colSpan: 2});

      if (_.size(ttp.etsList) > 0) {
        payload.ttps.table.push({text: it('txt-ttp-ets'), colSpan: 4});

        _.forEach(ttp.etsList, ets => {
          payload.ttps.table.push({text: f('incidentFields.cveId'), colSpan: 2});
          payload.ttps.table.push({text: f('incidentFields.etsDescription'), colSpan: 2});
          payload.ttps.table.push({text: ets.cveId || '', colSpan: 2});
          payload.ttps.table.push({text: ets.description || '', colSpan: 2});
        })
      }

      if (_.size(ttp.obsFileList) > 0) {
        payload.ttps.table.push({text: it('txt-ttp-obs-file'), colSpan: 4});

        _.forEach(ttp.obsFileList, obsFile => {
          payload.ttps.table.push({text: f('incidentFields.fileName'), colSpan: 2});
          payload.ttps.table.push({text: f('incidentFields.fileExtension'), colSpan: 2});
          payload.ttps.table.push({text: obsFile.fileName, colSpan: 2});
          payload.ttps.table.push({text: obsFile.fileExtension, colSpan: 2});
          payload.ttps.table.push({text: 'MD5', colSpan: 2});
          payload.ttps.table.push({text: 'SHA1', colSpan: 2});
          payload.ttps.table.push({text: obsFile.md5, colSpan: 2});
          payload.ttps.table.push({text: obsFile.sha1, colSpan: 2});
          payload.ttps.table.push({text: 'SHA256', colSpan: 4});
          payload.ttps.table.push({text: obsFile.sha256, colSpan: 4});
        })
      }

      if (_.size(ttp.obsUriList) > 0) {
        payload.ttps.table.push({text: it('txt-ttp-obs-uri'), colSpan: 4});

        _.forEach(ttp.obsUriList, obsUri => {
          payload.ttps.table.push({text: f('incidentFields.uriType'), colSpan: 2});
          payload.ttps.table.push({text: f('incidentFields.uriValue'), colSpan: 2});
          payload.ttps.table.push({text: obsUri.uriType === 0 ? 'URL' : f('incidentFields.domain'), colSpan: 2});
          payload.ttps.table.push({text: obsUri.uriValue, colSpan: 2});
        })
      }

      if (_.size(ttp.obsSocketList) > 0) {
        payload.ttps.table.push({text: it('txt-ttp-obs-socket'), colSpan: 4});

        _.forEach(ttp.obsSocketList, obsSocket => {
          payload.ttps.table.push({text: 'IP', colSpan: 2});
          payload.ttps.table.push({text: 'Port', colSpan: 2});
          payload.ttps.table.push({text: obsSocket.ip, colSpan: 2});
          payload.ttps.table.push({text: obsSocket.port, colSpan: 2});
        })
      }
    })

    return payload;
  }
  exportPdf = () => {
    const {baseUrl, contextRoot} = this.context;
    const {incident} = this.state;

    downloadWithForm(`${baseUrl}${contextRoot}/api/soc/_pdf`, {payload: JSON.stringify(this.toPdfPayload(incident.info))});
  }

  exportAll = () => {
    const {baseUrl, contextRoot, session} = this.context;
    const {search, incident, loadListType, accountRoleType} = this.state;

    if (search.datetime) {
      search.startDttm = moment(search.datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      search.endDttm = moment(search.datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    }

    search.accountRoleType = this.state.accountRoleType;
    search.account = session.accountId;

    let payload = {
      subStatus: 0,
      keyword: '',
      category: 0,
      isExpired: 2,
      accountRoleType:search.accountRoleType,
    };

    if (loadListType === 0) {
      payload.status = 0;
      payload.isExpired = 1;
    } else if (loadListType === 1) {

    } else if (loadListType === 2) {
      payload.creator = session.accountId;
    } else if (loadListType === 3) {
      payload = search;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/_searchV3`,
      data: JSON.stringify(payload),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      const payload = _.map(data.rt.rows, el => {
        return this.toPdfPayload(el)
      });

      downloadWithForm(`${baseUrl}${contextRoot}/api/soc/_pdfs`, {payload: JSON.stringify(payload)});
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  notifyContact = () => {
    const {baseUrl} = this.context;
    const {incident} = this.state;
    const requestData = {
      incidentId: incident.info.id
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/_sendEmailList`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data && data.rt) {
        this.setState({
          notifyEmailList: data.rt.rows
        }, () => {
          this.openNotifyDialog();
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  render() {
    const {session} = this.context;
    const {
      activeContent,
      baseUrl,
      contextRoot,
      showFilter,
      showChart,
      relatedListOpen,
      uploadAttachmentOpen,
      incident, 
      contextAnchor,
      currentData,
      accountType
    } = this.state;
    
    let superUserCheck = false;

    if (_.includes(session.roles, 'SOC Supervior') || _.includes(session.roles, 'SOC Supervisor')) {
      superUserCheck = true;
    }

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
        <IncidentComment ref={ref => {this.incidentComment = ref}} />
        <IncidentTag ref={ref => {this.incidentTag = ref}} onLoad={this.loadData.bind(this,'currentPage')} />
        <IncidentFlowDialog ref={ref => {this.incidentFlowDialog = ref}} />
        <IncidentReview ref={ref => {this.incidentReview = ref}} loadTab={'flow'} onLoad={this.loadData.bind(this,'currentPage')} />
        <NotifyDialog ref={ref => {this.notifyDialog = ref}} />

        {uploadAttachmentOpen &&
          this.uploadAttachmentModal()
        }

        {relatedListOpen &&
          <RelatedList
            incidentList={incident.info.showFontendRelatedList}
            setIncidentList={this.setIncidentList}
            toggleRelatedListModal={this.toggleRelatedListModal} />
        }

        <Menu
          anchorEl={contextAnchor}
          keepMounted
          open={Boolean(contextAnchor)}
          onClose={this.handleCloseMenu}>
          <MenuItem onClick={this.getIncident.bind(this, currentData.id, 'view')}>{t('txt-view')}</MenuItem>
          <MenuItem onClick={this.openIncidentTag.bind(this, currentData.id)}>{it('txt-tag')}</MenuItem>
          <MenuItem onClick={this.openIncidentFlow.bind(this, currentData.id)}>{it('txt-view-flow')}</MenuItem>
          <MenuItem onClick={this.getIncidentSTIXFile.bind(this, currentData.id)}>{it('txt-download')}</MenuItem>
        </Menu>

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'/></button>
            {accountType === constants.soc.NONE_LIMIT_ACCOUNT &&
              <button className='' onClick={this.openIncidentTag.bind(this, null)} title={it('txt-custom-tag')}><i className='fg fg-color-ruler'/></button>
            }
            <button className='' onClick={this.openIncidentComment} title={it('txt-comment-example-edit')}><i className='fg fg-report'/></button>
          </div>
        </div>

        <div className='data-content'>
          <SocConfig baseUrl={baseUrl} contextRoot={contextRoot} session={session} accountType={accountType} />

          <div className='parent-content'>
            {this.renderFilter()}

            {activeContent === 'tableList' &&
              <div className='main-content'>
                <header className='main-header'>{it('txt-incident-sign')}</header>
                <div className='content-header-btns with-menu '>
                  {activeContent === 'viewIncident' &&
                    <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>
                  }
                </div>
                <MuiTableContent
                  data={incident}
                  tableOptions={tableOptions}
                  showLoading={true} />
              </div>
            }

            {(activeContent === 'viewIncident' || activeContent === 'editIncident' || activeContent === 'addIncident') &&
              this.displayEditContent()
            }
          </div>
        </div>
      </div>
    )
  }
}

Incident.contextType = BaseDataContext;
Incident.propTypes = {
};

export default Incident;