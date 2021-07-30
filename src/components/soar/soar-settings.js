import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import { ReactMultiEmail } from 'react-multi-email'

import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'
import 'react-multi-email/style.css';

const ACTION_TYPE = ['shutdownHost', 'logoffAllUsers', 'netcut', 'netcutResume'];
const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];

let t = null;
let et = null;
let c = null;

/**
 * SoarSettings
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the SOAR main settings page
 */
class SoarSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeContent: 'viewMode', //'viewMode' or 'editMode'
      openEmailDialog: false,
      testEmails: [],
      info: '',
      actionTypeList: [],
      severityTypeList: [],
      originalSoarIP: {},
      soarIP: '',
      originalSoarAdapter: {},
      soarAdapter: {
        scp: {
          gap: ''
        },
        socket: {
          protocol: '',
          port: ''
        }
      },
      originalSoarAction: {},
      soarAction: {
        dump: {
          path: '',
          file: ''
        },
        email: {
          smtpServer: '',
          smtpPort: '',
          smtpConnectType: '',
          emailAuthentication: '',
          sender: '',
          senderAccount: '',
          senderPassword: '',
          receiver: [],
          title: '',
          content: ''
        },
        hmd: {
          id: '',
          action: '',
          scpIp: '',
          apiAuth: ''
        },
        netprobe: {
          apiAuth: '',
          drop: '',
          ipPath: '',
          scpIp: '',
          severityType: ''
        }
      },
      formValidation: {
        email: {
          smtpServer: {
            valid: true
          },
          sender: {
            valid: true,
            msg: ''
          },
          senderAccount: {
            valid: true
          },
          senderPassword: {
            valid: true
          }
        }
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    c = global.chewbaccaI18n.getFixedT(null, 'accounts');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getDropDownList();
    this.getSoarSettingsInfo();
  }
  /**
   * Set dropdown list for HMD Action and Severity type
   * @method
   */
  getDropDownList = () => {
    const actionTypeList = _.map(ACTION_TYPE, val => {
      return <MenuItem value={val}>{t('hmd-scan.txt-' + val)}</MenuItem>
    });

    const severityTypeList = _.map(SEVERITY_TYPE, val => {
      return <MenuItem value={'DEFINED_IOC_' + val.toUpperCase()}>{val}</MenuItem>
    });

    this.setState({
      actionTypeList,
      severityTypeList
    });
  }
  /**
   * Get and set mail and notification data
   * @method
   */
  getSoarSettingsInfo = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/soar/configuration`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const soarIP = data['soar.ip'];
        const soarAdapter = data['soar.adapter'];
        const soarAction = data['soar.action'];

        this.setState({
          originalSoarIP: _.cloneDeep(soarIP),
          soarIP,
          originalSoarAdapter: _.cloneDeep(soarAdapter),
          soarAdapter,
          originalSoarAction: _.cloneDeep(soarAction),
          soarAction
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Check IP connections
   * @method
   */
  handleTestConnections = () => {
    const {baseUrl} = this.context;
    const {soarIP} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/soar/ipCheck?ip=${soarIP}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg('', '', t('soar.txt-successConnections'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle email settings input data change
   * @method
   * @param {string} type - data type ('soarIP', soarAdapter' or 'soarAction')
   * @param {string} [subType] - data sub type
   * @param {string | object} [options] - option for 'number' or event
   * @param {object} event - event object
   */
  handleDataChange = (type, subType, options, event) => {
    const {soarAdapter, soarAction} = this.state;
    
    if (type === 'soarIP') {
      this.setState({
        soarIP: event.target.value
      });
    } else if (type === 'soarAdapter') {
      let tempSoarAdapter = {...soarAdapter};

      if (typeof options === 'string') {
        tempSoarAdapter[subType][event.target.name] = Number(event.target.value);
      } else {
        tempSoarAdapter[subType][options.target.name] = options.target.value;
      }
      
      this.setState({
        soarAdapter: tempSoarAdapter
      });
    } else if (type === 'soarAction') {
      let tempSoarAction = {...soarAction};

      if (typeof options === 'string') {
        tempSoarAction[subType][event.target.name] = Number(event.target.value);
      } else {
        tempSoarAction[subType][options.target.name] = options.target.value;
      }

      this.setState({
        soarAction: tempSoarAction
      });
    }
  }
  /**
   * Toggle different content
   * @method
   * @param {string} type - content type ('editMode', 'viewMode', 'save' or 'cancel')
   */
  toggleContent = (type) => {
    const {originalSoarIP, originalSoarAdapter, originalSoarAction} = this.state;
    let showPage = type;

    if (type === 'save') {
      this.handleSoarSettingsConfirm();
      return;
    } else if (type === 'viewMode' || type === 'cancel') {
      showPage = 'viewMode';

      this.setState({
        soarIP: _.cloneDeep(originalSoarIP),
        soarAdapter: _.cloneDeep(originalSoarAdapter),
        soarAction: _.cloneDeep(originalSoarAction),
        formValidation: {
          email: {
            smtpServer: {
              valid: true
            },
            sender: {
              valid: true,
              msg: ''
            },
            senderAccount: {
              valid: true
            },
            senderPassword: {
              valid: true
            }
          }
        }
      });
    }

    this.setState({
      activeContent: showPage
    });
  }
  /**
   * Handle edit confirm
   * @method
   */
  handleSoarSettingsConfirm = () => {
    const {baseUrl} = this.context;
    const {soarIP, soarAdapter, soarAction, formValidation} = this.state;
    const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const requestData = {
      'soar.ip': soarIP,
      'soar.adapter': soarAdapter,
      'soar.action': soarAction
    };
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (soarAction.email.smtpServer) {
      tempFormValidation.email.smtpServer.valid = true;
    } else {
      tempFormValidation.email.smtpServer.valid = false;
      validate = false;
    }

    if (soarAction.email.sender) {
      if (emailPattern.test(soarAction.email.sender)) { //Check email format
        tempFormValidation.email.sender.valid = true;
        tempFormValidation.email.sender.msg = '';
      } else {
        tempFormValidation.email.sender.valid = false;
        tempFormValidation.email.sender.msg = c('txt-email-invalid');
        validate = false;
      }
    } else {
      tempFormValidation.email.sender.valid = false;
      tempFormValidation.email.sender.msg = t('txt-required');
      validate = false;
    }

    if (soarAction.email.senderAccount) {
      tempFormValidation.email.senderAccount.valid = true;
    } else {
      tempFormValidation.email.senderAccount.valid = false;
      validate = false;
    }

    if (soarAction.email.senderPassword) {
      tempFormValidation.email.senderPassword.valid = true;
    } else {
      tempFormValidation.email.senderPassword.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/soar/configuration`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.getSoarSettingsInfo();
        this.toggleContent('viewMode');
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle email delete
   * @method
   * @param {function} removeEmail - function to remove email
   * @param {number} index - index of the emails list array
   */
  deleteEmail = (removeEmail, index) => {
    removeEmail(index);
  }
  /**
   * Handle email delete
   * @method
   * @param {string} email - individual email
   * @param {number} index - index of the emails list array
   * @param {function} removeEmail - function to remove email
   * @returns HTML DOM
   */
  getLabel = (email, index, removeEmail) => {
    return (
      <div data-tag key={index}>
        {email}
        <span data-tag-handle onClick={this.deleteEmail.bind(this, removeEmail, index)}> <span className='font-bold'>x</span></span>
      </div>
    )
  }
  /**
   * Toggle Email notifications checkbox
   * @method
   * @param {object} event - event object
   */
  toggleEmailCheckbox = (event) => {
    let tempEmails = {...this.state.emails};
    tempEmails[event.target.name].enable = event.target.checked;

    this.setState({
      emails: tempEmails
    })
  }
  /**
   * Set test email dialog
   * @method
   */
  openEmailDialog = () => {
    this.setState({
      openEmailDialog: true
    });
  }
  /**
   * Set test emails list
   * @method
   * @param {array} newEmails - new emails list
   */
  handleTestEmailChange = (newEmails) => {
    this.setState({
      testEmails: newEmails
    });
  }
  /**
   * Display test email content
   * @method
   * @returns HTML DOM
   */
  displayTestEmail = () => {
    return (
      <div>
        <label>{t('notifications.txt-recipientEmail')}</label>
        <ReactMultiEmail
          emails={this.state.testEmails}
          onChange={this.handleTestEmailChange}
          getLabel={this.getLabel}
        />
      </div>
    )
  }
  /**
   * Open test email dialog
   * @method
   * @returns ModalDialog component
   */
  testEmailDialog = () => {
    const titleText = t('notifications.txt-testEmails');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog},
      confirm: {text: t('txt-send'), handler: this.handleTestEmailConfirm}
    };

    return (
      <ModalDialog
        id='testEmailDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        info={this.state.info}
        closeAction='cancel'>
        {this.displayTestEmail()}
      </ModalDialog>
    )
  }
  /**
   * Handle test email confirm
   * @method
   */
  handleTestEmailConfirm = () => {
    const {baseUrl} = this.context;
    const {testEmails} = this.state;
    let dataParams = '';

    if (testEmails.length === 0) {
      this.setState({
        info: t('notifications.txt-emailInvalid')
      });
      return;
    }

    _.forEach(testEmails, val => {
      dataParams += '&receipts=' + val;
    })

    ah.one({
      url: `${baseUrl}/api/notification/mailServer/_test?${dataParams}`,
      type: 'GET'
    })
    .then(data => {
      if (data.rt) {
        helper.showPopupMsg(t('notifications.txt-sendSuccess'));
        this.closeDialog();
      } else {
        this.setState({
          info: data.message
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display individual email
   * @method
   * @param {string} val - email value
   * @param {string} i - index of the emails array
   * @returns HTML DOM
   */
  displayEmail = (val, i) => {
    return <span key={i}>{val}</span>
  }
  /**
   * Handle email input change
   * @method
   * @param {array} newEmails - new emails list
   */
  handleEmailChange = (newEmails) => {
    let tempSoarAction = {...this.state.soarAction};
    tempSoarAction.email.receiver = newEmails;

    this.setState({
      soarAction: tempSoarAction
    });
  }
  /**
   * Close test email dialog
   * @method
   */
  closeDialog = () => {
    this.setState({
      openEmailDialog: false,
      testEmails: [],
      info: ''
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {
      activeContent,
      openEmailDialog,
      actionTypeList,
      severityTypeList,
      soarIP,
      soarAdapter,
      soarAction,
      formValidation
    } = this.state;

    return (
      <div>
        {openEmailDialog &&
          this.testEmailDialog()
        }

        <div className='sub-header'>
        </div>

        <div className='data-content soar-settings'>
          <div className='parent-content'>
            <div className='main-content basic-form'>
              <header className='main-header'>{t('soar.txt-soarSettings')}</header>

              {activeContent === 'viewMode' &&
                <div className='content-header-btns'>
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.props.toggleContent.bind(this, 'table', 'refresh')}>{t('txt-backToList')}</Button>
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode')}>{t('txt-edit')}</Button>
                </div>
              }

              <div className='config-notify' style={{height: activeContent === 'viewMode' ? '78vh' : '70vh'}}>
                <div className='form-group normal short'>
                  <header>IP</header>
                  <div className='group'>
                    <TextField
                      id='soarIP'
                      name='gap'
                      label='IP'
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={soarIP}
                      onChange={this.handleDataChange.bind(this, 'soarIP', '', '')}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                  <Button variant='contained' color='primary' className='soar-test-btn' onClick={this.handleTestConnections}>{t('soar.txt-testConnections')}</Button>
                </div>

                <div className='form-group normal short'>
                  <header>{t('soar.txt-adapter')}</header>
                  <div className='group-header'>SCP</div>
                  <div className='group'>
                    <TextField
                      id='soarAdapterGap'
                      name='gap'
                      type='number'
                      label={'Gap (' + t('txt-minutes') + ')'}
                      variant='outlined'
                      fullWidth
                      size='small'
                      InputProps={{inputProps: { min: 0 }}}
                      value={soarAdapter.scp.gap}
                      onChange={this.handleDataChange.bind(this, 'soarAdapter', 'scp', 'number')}
                      disabled={activeContent === 'viewMode'} />
                  </div>

                  <div className='group-header'>Socket</div>
                  <div className='group'>
                    <TextField
                      id='soarAdapterProtocol'
                      name='protocol'
                      label='Protocol'
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={soarAdapter.socket.protocol}
                      onChange={this.handleDataChange.bind(this, 'soarAdapter', 'socket')}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <TextField
                      id='soarAdapterPort'
                      name='port'
                      type='number'
                      label='Port'
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={soarAdapter.socket.port}
                      onChange={this.handleDataChange.bind(this, 'soarAdapter', 'socket', 'number')}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                </div>

                <div className='form-group normal short'>
                  <header>{t('soar.txt-action')}</header>
                  <Button variant='contained' color='primary' className='last' onClick={this.openEmailDialog} disabled={activeContent === 'editMode'}>{t('notifications.txt-testEmails')}</Button>
                  <div className='group-header'>Dump</div>
                  <div className='group'>
                    <TextField
                      id='soarActionPath'
                      name='path'
                      label='Path'
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={soarAction.dump.path}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'dump')}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <TextField
                      id='soarActionFile'
                      name='file'
                      label='File'
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={soarAction.dump.file}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'dump')}
                      disabled={activeContent === 'viewMode'} />
                  </div>

                  <div className='group-header'>Email</div>
                  <div className='group'>
                    <TextField
                      id='soarActionServer'
                      name='smtpServer'
                      label={t('notifications.txt-smtpServer')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      required
                      error={!formValidation.email.smtpServer.valid}
                      helperText={formValidation.email.smtpServer.valid ? '' : t('txt-required')}
                      value={soarAction.email.smtpServer}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'email')}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <TextField
                      id='soarActionPort'
                      name='smtpPort'
                      select
                      label={t('notifications.txt-smtpPort')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={soarAction.email.smtpPort}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'email')}
                      disabled={activeContent === 'viewMode'}>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={465}>465</MenuItem>
                      <MenuItem value={587}>587</MenuItem>
                    </TextField>
                  </div>
                  <div className='group'>
                    <TextField
                      id='soarActionSender'
                      name='sender'
                      label={t('notifications.txt-sender')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      required
                      error={!formValidation.email.sender.valid}
                      helperText={formValidation.email.sender.msg}
                      value={soarAction.email.sender}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'email')}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <TextField
                      id='soarActionConnectType'
                      name='smtpConnectType'
                      select
                      label={t('notifications.txt-smtpConnectType')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={soarAction.email.smtpConnectType}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'email')}
                      disabled={activeContent === 'viewMode'}>
                      <MenuItem value='standard'>standard</MenuItem>
                      <MenuItem value='ssl'>SSL</MenuItem>
                      <MenuItem value='tls'>TLS</MenuItem>
                    </TextField>
                  </div>
                  <div className='group'>
                    <TextField
                      id='soarActionEmailAuth'
                      name='emailAuthentication'
                      select
                      label={t('notifications.txt-authentication')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={soarAction.email.emailAuthentication}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'email')}
                      disabled={activeContent === 'viewMode'}>
                      <MenuItem value={true}>True</MenuItem>
                      <MenuItem value={false}>False</MenuItem>
                    </TextField>
                  </div>
                  <div className='group'>
                    <TextField
                      id='soarActionAccount'
                      name='senderAccount'
                      label={t('notifications.txt-senderAccount')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      required
                      error={!formValidation.email.senderAccount.valid}
                      helperText={formValidation.email.senderAccount.valid ? '' : t('txt-required')}
                      value={soarAction.email.senderAccount}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'email')}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <TextField
                      id='soarActionSenderPassword'
                      name='senderPassword'
                      type='password'
                      label={t('notifications.txt-senderPassword')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      required
                      error={!formValidation.email.senderPassword.valid}
                      helperText={formValidation.email.senderPassword.valid ? '' : t('txt-required')}
                      value={soarAction.email.senderPassword}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'email')}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <TextField
                      id='soarActionTitle'
                      name={t('soar.txt-title')}
                      label={t('soar.txt-title')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={soarAction.email.title}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'email')}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                  <div className='group' style={{width: '50%'}}>
                    <label>{t('notifications.txt-recipientEmail')}</label>
                    {activeContent === 'viewMode' && soarAction.email.receiver.length > 0 &&
                      <div className='flex-item'>{soarAction.email.receiver.map(this.displayEmail)}</div>
                    }
                    {activeContent === 'editMode' &&
                      <ReactMultiEmail
                        emails={soarAction.email.receiver}
                        onChange={this.handleEmailChange}
                        getLabel={this.getLabel} />
                    }
                  </div>
                  <div className='group' style={{width: '50%'}}>
                    {activeContent === 'viewMode' &&
                      <TextField
                        id='soarActionContent'
                        name='content'
                        className='text-area'
                        label={t('soar.txt-content')}
                        multiline
                        rows={3}
                        variant='outlined'
                        fullWidth
                        size='small'
                        value={soarAction.email.content}
                        disabled={true} />
                    }
                    {activeContent === 'editMode' &&
                      <React.Fragment>
                        <label>{t('soar.txt-content')}</label>
                        <TextareaAutosize
                          name='content'
                          className='textarea-autosize'
                          rows={3}
                          value={soarAction.email.content}
                          onChange={this.handleDataChange.bind(this, 'soarAction', 'email')} />
                      </React.Fragment>
                    }
                  </div>

                  <div className='group-header'>HMD</div>
                  <div className='group'>
                    <TextField
                      id='soarActionId'
                      name='id'
                      label='ID'
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={soarAction.hmd.id}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'hmd')}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <TextField
                      id='soarActionAction'
                      name='action'
                      select
                      label='Action'
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={soarAction.hmd.action}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'hmd')}
                      disabled={activeContent === 'viewMode'}>
                      {actionTypeList}
                    </TextField>
                  </div>

                  <div className='group-header'>NetProbe</div>
                  <div className='group'>
                    <TextField
                      id='soarActionNetApiAuth'
                      name='apiAuth'
                      label='API Auth'
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={soarAction.netprobe.apiAuth}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'netprobe')}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <TextField
                      id='soarActionDrop'
                      name='drop'
                      select
                      label='Drop'
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={soarAction.netprobe.drop}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'netprobe')}
                      disabled={activeContent === 'viewMode'}>
                      <MenuItem value={true}>True</MenuItem>
                      <MenuItem value={false}>False</MenuItem>
                    </TextField>
                  </div>
                  <div className='group'>
                    <TextField
                      id='soarActionSeverityType'
                      name='severityType'
                      select
                      label='Severity Type'
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={soarAction.netprobe.severityType}
                      onChange={this.handleDataChange.bind(this, 'soarAction', 'netprobe')}
                      disabled={activeContent === 'viewMode'}>
                      {severityTypeList}
                    </TextField>
                  </div>
                </div>
              </div>

              {activeContent === 'editMode' &&
                <footer>
                  <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</Button>
                  <Button variant='contained' color='primary' onClick={this.toggleContent.bind(this, 'save')}>{t('txt-save')}</Button>
                </footer>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SoarSettings.contextType = BaseDataContext;

SoarSettings.propTypes = {
  toggleContent: PropTypes.func.isRequired
};

export default SoarSettings;