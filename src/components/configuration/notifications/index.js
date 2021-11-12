import React, {Component} from 'react'
import { withRouter } from 'react-router'

import ChipInput from 'material-ui-chip-input'
import { ReactMultiEmail } from 'react-multi-email'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../common/context'
import Config from '../../common/configuration'
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'
import 'react-multi-email/style.css';

const EMAIL_PATTERN = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

let t = null;
let et = null;
let c = null;

/**
 * Notifications
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Config Notifications page
 */
class Notifications extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeContent: 'viewMode', //'viewMode' or 'editMode'
      openEmailDialog: false,
      testEmails: [],
      info: '',
      originalNotifications: {},
      notifications: {
        server: '',
        port: 25,
        sender: '',
        connectType: 'standard',
        authentication: true,
        senderAccount: '',
        senderPassword: ''
      },
      originalSmsProvider: {},
      smsProvider: {
        list: [],
        value: '',
        data: {}
      },
      originalEmails: {},
      emails: {
        service: {
          emails: [],
          enable: true
        },
        edge: {
          emails: [],
          enable: true
        },
        alert: {
          emails: [],
          enable: true
        },
        soc: {
          emails: [],
          enable: true
        }
      },
      lineBotSetting:{
        channelAccessToken:'',
        channelSecret:'',
        qrcodeLink:'',
      },
      formValidation: {
        notificationsServer: {
          valid: true
        },
        notificationsSender: {
          valid: true,
          msg: ''
        },
        notificationsSenderAccount: {
          valid: true
        },
        notificationsSenderPassword: {
          valid: true
        }
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    c = global.chewbaccaI18n.getFixedT(null, 'accounts');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);
    helper.inactivityTime(baseUrl, locale);

    this.getMailServerInfo();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state === 'viewMode') {
      this.toggleContent('viewMode');
    }
  }
  /**
   * Get and set mail and notification data
   * @method
   */
  getMailServerInfo = () => {
    const {baseUrl} = this.context;
    const {notifications, smsProvider, emails, lineBotSetting} = this.state;

    this.ah.all([
      {
        url: `${baseUrl}/api/notification/mailServer`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/notification`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/notification/smsProvider`,
        type: 'GET'
      }
    ])
    .then(data => {
      if (data) {
        const data1 = data[0];
        const data2 = data[1];
        const data3 = data[2];
        const notifications = {
          server: data1.smtpServer,
          port: data1.smtpPort,
          sender: data1.sender,
          connectType: data1.smtpConnectType,
          authentication: data1.emailAuthentication, //Convert boolean to string
          senderAccount: data1.senderAcct,
          senderPassword: data1.senderPasswd
        };

        let tempSmsProvider = {...smsProvider};
        tempSmsProvider.list = _.map(data3.rows, val => {
          return <MenuItem value={val.ServiceProviderName}>{t('notifications.sms.txt-' + val.ServiceProviderName)}</MenuItem>
        });
        tempSmsProvider.value = data2['notify.sms.server.id'][0].ServiceProviderName;
        tempSmsProvider.data = data2['notify.sms.server.id'][0];

        let tempEmails = {...emails};
        let tempLineBotSetting = {...lineBotSetting}

        if (data2['notify.service.failure.id']) {
          tempEmails.service.emails = data2['notify.service.failure.id'].receipts;
          tempEmails.service.enable = data2['notify.service.failure.id'].enable;
        }

        if (data2['notify.edge.disconnected.id']) {
          tempEmails.edge.emails = data2['notify.edge.disconnected.id'].receipts;
          tempEmails.edge.enable = data2['notify.edge.disconnected.id'].enable;
        }

        if (data2['notify.alert.report.id']) {
          tempEmails.alert.emails = data2['notify.alert.report.id'].receipts;
          tempEmails.alert.enable = data2['notify.alert.report.id'].enable;
        }

        if (data2['notify.soc.send.id']) {
          tempEmails.soc.emails = data2['notify.soc.send.id'].receipts;
          tempEmails.soc.enable = data2['notify.soc.send.id'].enable;
        }

        if (data2['linetbot.config.id']) {
          tempLineBotSetting.channelAccessToken = data2['linetbot.config.id'].channelAccessToken;
          tempLineBotSetting.channelSecret = data2['linetbot.config.id'].channelSecret;
          tempLineBotSetting.qrcodeLink = data2['linetbot.config.id'].qrcodeLink;
        }

        this.setState({
          originalNotifications: _.cloneDeep(notifications),
          notifications,
          originalSmsProvider: _.cloneDeep(tempSmsProvider),
          smsProvider: tempSmsProvider,
          originalEmails: _.cloneDeep(tempEmails),
          emails: tempEmails,
          lineBotSetting:tempLineBotSetting
        });
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
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempNotifications = {...this.state.notifications};
    tempNotifications[event.target.name] = event.target.value;

    this.setState({
      notifications: tempNotifications
    });
  }
  /**
   * Handle SMS dropdown change
   * @method
   * @param {object} event - event object
   */
  handleSMSchange = (event) => {
    let tempSmsProvider = {...this.state.smsProvider};
    tempSmsProvider.value = event.target.value;

    this.setState({
      smsProvider: tempSmsProvider
    });
  }
  handleLineBotChange = (event) => {
    let tempLineBotSetting = {...this.state.lineBotSetting};
    tempLineBotSetting[event.target.name] = event.target.value;

    this.setState({
      lineBotSetting: tempLineBotSetting
    });
  }
  /**
   * Toggle different content
   * @method
   * @param {string} type - content type ('editMode', 'viewMode', 'save' or 'cancel')
   */
  toggleContent = (type) => {
    const {originalNotifications, originalSmsProvider, originalEmails} = this.state;
    let showPage = type;

    if (type === 'save') {
      this.handleNotificationsConfirm();
      return;
    } else if (type === 'viewMode' || type === 'cancel') {
      showPage = 'viewMode';

      this.setState({
        notifications: _.cloneDeep(originalNotifications),
        smsProvider: _.cloneDeep(originalSmsProvider),
        emails: _.cloneDeep(originalEmails),
        formValidation: {
          notificationsServer: {
            valid: true
          },
          notificationsSender: {
            valid: true,
            msg: ''
          },
          notificationsSenderAccount: {
            valid: true
          },
          notificationsSenderPassword: {
            valid: true
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
  handleNotificationsConfirm = () => {
    const {baseUrl} = this.context;
    const {notifications, smsProvider, emails, lineBotSetting, formValidation} = this.state;
    const mailServerRequestData = {
      smtpServer: notifications.server,
      smtpPort: Number(notifications.port),
      smtpConnectType: notifications.connectType,
      emailAuthentication: notifications.authentication === true, //Convert string to boolean
      sender: notifications.sender,
      senderAcct: notifications.senderAccount,
      senderPasswd: notifications.senderPassword
    };
    const smsSettings = {
      'notify.sms.server.id': [{
        ...smsProvider.data,
        ServiceProviderName: smsProvider.value
      }]
    };
    const emailsSettings = {
      'notify.service.failure.id': {
        receipts: emails.service.emails,
        enable: emails.service.enable
      },
      'notify.edge.disconnected.id': {
        receipts: emails.edge.emails,
        enable: emails.edge.enable
      },
      'notify.alert.report.id': {
        receipts: emails.alert.emails,
        enable: emails.alert.enable
      },
      'notify.soc.send.id': {
        receipts: emails.soc.emails,
        enable: emails.soc.enable
      },
      'linetbot.config.id': {
        channelAccessToken: lineBotSetting.channelAccessToken,
        channelSecret: lineBotSetting.channelSecret,
        qrcodeLink: lineBotSetting.qrcodeLink
      }
    };
    const requestData = {
      ...smsSettings,
      ...emailsSettings
    };
    const apiArr = [
      {
        url: `${baseUrl}/api/notification/mailServer`,
        data: JSON.stringify(mailServerRequestData),
        type: 'POST',
        contentType: 'text/plain'
      },
      {
        url: `${baseUrl}/api/notification`,
        data: JSON.stringify(requestData),
        type: 'POST',
        contentType: 'text/plain'
      }
    ];
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (notifications.server) {
      tempFormValidation.notificationsServer.valid = true;
    } else {
      tempFormValidation.notificationsServer.valid = false;
      validate = false;
    }

    if (notifications.sender) {
      if (EMAIL_PATTERN.test(notifications.sender)) { //Check email format
        tempFormValidation.notificationsSender.valid = true;
        tempFormValidation.notificationsSender.msg = '';
      } else {
        tempFormValidation.notificationsSender.valid = false;
        tempFormValidation.notificationsSender.msg = c('txt-email-invalid');
        validate = false;
      }
    } else {
      tempFormValidation.notificationsSender.valid = false;
      tempFormValidation.notificationsSender.msg = t('txt-required');
      validate = false;
    }

    if (notifications.senderAccount) {
      tempFormValidation.notificationsSenderAccount.valid = true;
    } else {
      tempFormValidation.notificationsSenderAccount.valid = false;
      validate = false;
    }

    if (notifications.senderPassword) {
      tempFormValidation.notificationsSenderPassword.valid = true;
    } else {
      tempFormValidation.notificationsSenderPassword.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    this.ah.all(apiArr)
    .then(data => {
      if (data) {
        this.getMailServerInfo();
        this.toggleContent('viewMode');
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display list item
   * @method
   * @param {string} val - individual value
   * @param {string} i - index of the list array
   * @returns HTML DOM
   */
  displayListItem = (val, i) => {
    return <span key={i}>{val}</span>
  }
  /**
   * Handle email input change
   * @method
   * @param {object} val - EMAIL_SETTINGS object
   * @param {array} newEmails - new emails list
   */
  handleEmailChange = (val, newEmails) => {
    let tempEmails = {...this.state.emails};
    tempEmails[val.type].emails = newEmails;

    this.setState({
      emails: tempEmails
    });
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
   * Display emails notifications content
   * @method
   * @param {object} val - EMAIL_SETTINGS object
   * @param {number} i - index of the EMAIL_SETTINGS array
   * @returns HTML DOM
   */
  getEmailsContent = (val, i) => {
    const {activeContent, emails} = this.state;

    return (
      <div className='form-group normal long' key={val.type}>
        <header>{val.headerText}</header>
        <div className='group'>
          <label>{t('notifications.txt-recipientEmail')}</label>
          {activeContent === 'viewMode' && emails[val.type].emails.length > 0 &&
            <div className='flex-item'>{emails[val.type].emails.map(this.displayListItem)}</div>
          }
          {activeContent === 'editMode' &&
            <ReactMultiEmail
              emails={emails[val.type].emails}
              onChange={this.handleEmailChange.bind(this, val)}
              getLabel={this.getLabel} />
          }
        </div>
        <div className='group'>
          <FormControlLabel
            label={val.checkboxText}
            control={
              <Checkbox
                className='checkbox-ui'
                name={val.type}
                checked={emails[val.type].enable}
                onChange={this.toggleEmailCheckbox}
                color='primary' />
            }
            disabled={activeContent === 'viewMode'} />
        </div>
      </div>
    )
  }
  /**
   * Handle SMS input data change
   * @method
   * @param {object} event - event object
   */
  handleSmsDataChange = (event) => {
    let tempSmsProvider = {...this.state.smsProvider};
    tempSmsProvider.data[event.target.name] = event.target.value;

    this.setState({
      smsProvider: tempSmsProvider
    });
  }
  /**
   * Handle phone delete
   * @method
   * @param {function} removePhone - function to remove phone
   * @param {number} index - index of the phone list array
   */
  deletePhone = (removePhone, index) => {
    removePhone(index);
  }
  /**
   * Handle phone delete
   * @method
   * @param {string} phone - individual phone
   * @param {number} index - index of the emails list array
   * @param {function} removePhone - function to remove phone
   * @returns HTML DOM
   */
  getPhoneLabel = (phone, index, removePhone) => {
    return (
      <div data-tag key={index}>
        {phone}
        <span data-tag-handle onClick={this.deletePhone.bind(this, removePhone, index)}> <span className='font-bold'>x</span></span>
      </div>
    )
  }
  /**
   * Handle SMS phone change
   * @method
   * @param {array} newPhones - new phone list
   */
  handleSmsPhoneChange = (newPhones) => {
    let tempSmsProvider = {...this.state.smsProvider};
    tempSmsProvider.data.recipientNumberList = newPhones;

    this.setState({
      smsProvider: tempSmsProvider
    });
  }
  /**
   * Display SMS provider content
   * @method
   * @returns HTML DOM
   */
  getSmsProviderContent = () => {
    const {activeContent, smsProvider} = this.state;

    return (
      <div className='form-group normal sms-provider'>
        <div className='group'>
          <TextField
            id='smsNotificationAccount'
            name='account'
            label={t('txt-account')}
            variant='outlined'
            fullWidth
            size='small'
            value={smsProvider.data.account || ''}
            onChange={this.handleSmsDataChange}
            disabled={activeContent === 'viewMode'} />
        </div>
        <div className='group'>
          <TextField
            id='smsNotificationPassword'
            name='password'
            type='password'
            label={t('txt-password')}
            variant='outlined'
            fullWidth
            size='small'
            value={smsProvider.data.password || ''}
            onChange={this.handleSmsDataChange}
            disabled={activeContent === 'viewMode'} />
        </div>

        <div className='group full'>
          <label style={{fontSize: '14px'}}>{t('notifications.sms.txt-recipients')}</label>
          {activeContent === 'viewMode' &&
            <div className='flex-item'>{smsProvider.data.recipientNumberList.map(this.displayListItem)}</div>
          }
          {activeContent === 'editMode' &&
            <ChipInput
              className='phone-chip-input'
              defaultValue={smsProvider.data.recipientNumberList}
              onChange={this.handleSmsPhoneChange}
              disableUnderline={true}
              fullWidth={true} />
          }
        </div>

        <div className='group'>
          <TextField
            id='smsNotificationPointUrl'
            name='apiPointCheckUrl'
            label={t('notifications.sms.txt-pointCheckUrl')}
            variant='outlined'
            fullWidth
            size='small'
            value={smsProvider.data.apiPointCheckUrl || ''}
            onChange={this.handleSmsDataChange}
            disabled={activeContent === 'viewMode'} />
        </div>

        <div className='group'>
          <TextField
            id='smsNotificationMultipleUrl'
            name='apiMultipleSendUrl'
            label={t('notifications.sms.txt-multipleSendUrl')}
            variant='outlined'
            fullWidth
            size='small'
            value={smsProvider.data.apiMultipleSendUrl || ''}
            onChange={this.handleSmsDataChange}
            disabled={activeContent === 'viewMode'} />
        </div>
      </div>
    )
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

    this.ah.one({
      url: `${baseUrl}/api/notification/mailServer/_test?${dataParams}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('notifications.txt-sendSuccess'));
        this.closeDialog();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle test SMS connections
   * @method
   */
  testSMSconnections = () => {
    const {baseUrl} = this.context;
    const {smsProvider} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/notification/sms/_test?ServiceProviderName=${smsProvider.value}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('notifications.sms.txt-connectionsSuccess') + ': ' + data.point);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle test SMS sending message
   * @method
   */
  testSMSsend = () => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/notification/sms/send/_test`;

    this.ah.one({
      url,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-success'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
    const {activeContent, openEmailDialog, notifications, smsProvider, emails, lineBotSetting, formValidation} = this.state;
    const EMAIL_SETTINGS = [
      {
        type: 'service',
        headerText: t('notifications.txt-serviceNotifications'),
        checkboxText: t('notifications.txt-serviceError')
      },
      {
        type: 'edge',
        headerText: t('notifications.txt-edgeNotifications'),
        checkboxText: t('notifications.txt-conectionsError')
      },
      {
        type: 'alert',
        headerText: t('notifications.txt-alertNotifications'),
        checkboxText: t('notifications.txt-dailyAlert')
      },
      {
        type: 'soc',
        headerText: t('notifications.txt-socNotifications'),
        checkboxText: t('notifications.txt-sendResult')
      }
    ];
    const actions = {
      cancel: {
        color: 'default',
        variant: 'contained',
        text: t('txt-cancel'),
        handler: this.closeDialog
      },
      confirm: {
        color: 'primary',
        variant: 'contained',
        text: t('txt-send'),
        handler: this.handleTestEmailConfirm
      }
    };
    let accountName = 'N/A';

    if (lineBotSetting.qrcodeLink.includes('sid/L/')) {
      const tempSpiltAccountNameArray =  lineBotSetting.qrcodeLink.split("sid/L/");
      const tmpNameArray = tempSpiltAccountNameArray[1].split(".");
      accountName = '@'+ tmpNameArray[0];
    }

    return (
      <div>
        {openEmailDialog &&
          this.testEmailDialog()
        }

        <div className='sub-header'>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            <div className='main-content basic-form'>
              <header className='main-header'>{t('notifications.txt-settings')}</header>

              {activeContent === 'viewMode' &&
                <div className='content-header-btns'>
                  <Button variant='contained' color='primary' onClick={this.toggleContent.bind(this, 'editMode')}>{t('txt-edit')}</Button>
                </div>
              }

              <div className='config-notify' style={{height: activeContent === 'viewMode' ? '78vh' : '70vh'}}>
                <div className='form-group normal short'>
                  <header>{t('notifications.txt-emailSettings')}</header>
                  <Button variant='contained' color='primary' className='last' onClick={this.openEmailDialog} disabled={activeContent === 'editMode'}>{t('notifications.txt-testEmails')}</Button>
                  <div className='group'>
                    <TextField
                      id='notificationsServer'
                      name='server'
                      label={t('notifications.txt-smtpServer')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      required
                      error={!formValidation.notificationsServer.valid}
                      helperText={formValidation.notificationsServer.valid ? '' : t('txt-required')}
                      value={notifications.server}
                      onChange={this.handleDataChange}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <TextField
                      id='notificationsPort'
                      name='port'
                      select
                      label={t('notifications.txt-smtpPort')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={notifications.port}
                      onChange={this.handleDataChange}
                      disabled={activeContent === 'viewMode'}>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={465}>465</MenuItem>
                      <MenuItem value={587}>587</MenuItem>
                    </TextField>
                  </div>
                  <div className='group' style={{width: '50%'}}>
                    <TextField
                      id='notificationsSender'
                      name='sender'
                      label={t('notifications.txt-sender')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      required
                      error={!formValidation.notificationsSender.valid}
                      helperText={formValidation.notificationsSender.msg}
                      value={notifications.sender}
                      onChange={this.handleDataChange}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <TextField
                      id='notificationsSender'
                      name='connectType'
                      select
                      label={t('notifications.txt-smtpConnectType')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={notifications.connectType}
                      onChange={this.handleDataChange}
                      disabled={activeContent === 'viewMode'}>
                      <MenuItem value='standard'>standard</MenuItem>
                      <MenuItem value='ssl'>SSL</MenuItem>
                      <MenuItem value='tls'>TLS</MenuItem>
                    </TextField>
                  </div>
                  <div className='group'>
                    <TextField
                      id='notificationsAuthentication'
                      name='authentication'
                      select
                      label={t('notifications.txt-authentication')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={notifications.authentication}
                      onChange={this.handleDataChange}
                      disabled={activeContent === 'viewMode'}>
                      <MenuItem value={true}>True</MenuItem>
                      <MenuItem value={false}>False</MenuItem>
                    </TextField>
                  </div>
                  <div className='group'>
                    <TextField
                      id='notificationsSenderAccount'
                      name='senderAccount'
                      label={t('notifications.txt-senderAccount')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      required
                      error={!formValidation.notificationsSenderAccount.valid}
                      helperText={formValidation.notificationsSenderAccount.valid ? '' : t('txt-required')}
                      value={notifications.senderAccount}
                      onChange={this.handleDataChange}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <TextField
                      id='notificationsSenderPassword'
                      name='senderPassword'
                      type='password'
                      label={t('notifications.txt-senderPassword')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      required
                      error={!formValidation.notificationsSenderPassword.valid}
                      helperText={formValidation.notificationsSenderPassword.valid ? '' : t('txt-required')}
                      value={notifications.senderPassword}
                      onChange={this.handleDataChange}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                </div>

                <div className='form-group normal long'>
                  <header>{t('notifications.lineBot.txt-lineBotSettings')}</header>

                  {activeContent === 'viewMode' && lineBotSetting.qrcodeLink &&
                    <div className='group'>
                      <label>{t('notifications.lineBot.txt-qrcode')}</label>
                      <img style={{width: '150px', height: '150px'}} width='100%' height='100%' src={lineBotSetting.qrcodeLink} border="0"  title={t('notifications.lineBot.txt-accountId')+accountName}/>
                    </div>
                  }

                  {activeContent !== 'viewMode' &&
                    <div className='group'>
                      <TextField
                        id='lineBotSetting.qrcodeLink'
                        name='qrcodeLink'
                        label={t('notifications.lineBot.txt-qrcode')}
                        variant='outlined'
                        fullWidth
                        size='small'
                        value={lineBotSetting.qrcodeLink}
                        onChange={this.handleLineBotChange} />
                    </div>
                  }

                  <div className='group'>
                    <TextField
                      id='lineBotSetting.channelAccessToken'
                      name='channelAccessToken'
                      label={t('notifications.lineBot.txt-channelAccessToken')}
                      variant='outlined'
                      fullWidth
                      rows={4}
                      rowsMax={5}
                      multiline
                      size='small'
                      value={lineBotSetting.channelAccessToken}
                      onChange={this.handleLineBotChange}
                      disabled={activeContent === 'viewMode'} />
                  </div>

                  <div className='group'>
                    <TextField
                      id='lineBotSetting.channelSecret'
                      name='channelSecret'
                      label={t('notifications.lineBot.txt-channelSecret')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={lineBotSetting.channelSecret}
                      onChange={this.handleLineBotChange}
                      disabled={activeContent === 'viewMode'} />
                  </div>
                </div>

                <div className='form-group normal long'>
                  <header>{t('notifications.sms.txt-smsNotification')}</header>
                  <div className='sms-button-group' style={{position: 'absolute', top: '-45px', right: 0}}>
                    <Button variant='contained' color='primary' style={{marginRight: '5px'}} onClick={this.testSMSconnections} disabled={activeContent === 'editMode'}>{t('notifications.sms.txt-testSMSconnections')}</Button>
                    <Button variant='contained' color='primary' onClick={this.testSMSsend} disabled={activeContent === 'editMode'}>{t('notifications.sms.txt-testSMSsend')}</Button>
                  </div>

                  <div className='group'>
                    <TextField
                      id='notificationsSMS'
                      select
                      label={t('notifications.sms.txt-addNewService')}
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={smsProvider.value}
                      onChange={this.handleSMSchange}
                      disabled={activeContent === 'viewMode'}>
                      {smsProvider.list}
                    </TextField>
                  </div>

                  <div className='sms-content'>
                    {smsProvider.value &&
                      this.getSmsProviderContent()
                    }
                  </div>
                </div>

                {EMAIL_SETTINGS.map(this.getEmailsContent)}
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

Notifications.contextType = BaseDataContext;

Notifications.propTypes = {
};

export default withRouter(Notifications);