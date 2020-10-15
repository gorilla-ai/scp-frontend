import React, {Component} from 'react'
import {withRouter} from 'react-router'

import {ReactMultiEmail} from 'react-multi-email';

import Button from '@material-ui/core/Button';

import Checkbox from 'react-ui/build/src/components/checkbox'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'
import 'react-multi-email/style.css';

let t = null;
let et = null;

/**
 * Notifications
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Config Notifications page
 */
class Notifications extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeContent: 'viewMode', //viewMode, editMode
      openEmailDialog: false,
      testEmails: [],
      originalNotifications: {},
      notifications: {
        server: '',
        port: 25,
        sender: '',
        connectType: 'standard',
        authentication: 'true',
        senderAccount: '',
        senderPassword: ''
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
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

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
    const {notifications, emails} = this.state;

    this.ah.all([
      {
        url: `${baseUrl}/api/notification/mailServer`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/notification`,
        type: 'GET'
      }
    ])
    .then(data => {
      if (data) {
        const data1 = data[0];
        const data2 = data[1];
        const notifications = {
          server: data1.smtpServer,
          port: data1.smtpPort,
          sender: data1.sender,
          connectType: data1.smtpConnectType,
          authentication: data1.emailAuthentication.toString(), //Convert boolean to string
          senderAccount: data1.senderAcct,
          senderPassword: data1.senderPasswd
        };

        let tempEmails = {...emails};

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

        this.setState({
          originalNotifications: _.cloneDeep(notifications),
          notifications,
          originalEmails: _.cloneDeep(tempEmails),
          emails: tempEmails
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
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleDataChange = (type, value) => {
    let tempNotifications = {...this.state.notifications};
    tempNotifications[type] = value;

    this.setState({
      notifications: tempNotifications
    });
  }
  /**
   * Toggle different content
   * @method
   * @param {string} type - content type ('editMode', 'viewMode', 'save' or 'cancel')
   */
  toggleContent = (type) => {
    const {originalNotifications, originalEmails} = this.state;
    let showPage = type;

    if (type === 'save') {
      this.handleNotificationsConfirm();
      return;
    } else if (type === 'viewMode' || type === 'cancel') {
      showPage = 'viewMode';

      this.setState({
        notifications: _.cloneDeep(originalNotifications),
        emails: _.cloneDeep(originalEmails)
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
    const {notifications, emails} = this.state;
    const mailServerRequestData = {
      smtpServer: notifications.server,
      smtpPort: Number(notifications.port),
      smtpConnectType: notifications.connectType,
      emailAuthentication: notifications.authentication === 'true', //Convert string to boolean
      sender: notifications.sender,
      senderAcct: notifications.senderAccount,
      senderPasswd: notifications.senderPassword
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
      }
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
        data: JSON.stringify(emailsSettings),
        type: 'POST',
        contentType: 'text/plain'
      }
    ];

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
   * Toggle Email notifications checkbox
   * @method
   * @param {string} type - notifications type ('service', 'edge', or 'alert')
   * @param {string} value - input value
   */
  toggleEmailCheckbox = (type, value) => {
    let tempEmails = {...this.state.emails};
    tempEmails[type].enable = value;

    this.setState({
      emails: tempEmails
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
            <div className='flex-item'>{emails[val.type].emails.map(this.displayEmail)}</div>
          }
          {activeContent === 'editMode' &&
            <ReactMultiEmail
              emails={emails[val.type].emails}
              onChange={this.handleEmailChange.bind(this, val)}
              getLabel={this.getLabel} />
          }
        </div>
        <div className='group'>
          <label htmlFor='serviceError' className='checkbox'>{val.checkboxText}</label>
          <Checkbox
            id='serviceError'
            checked={emails[val.type].enable}
            onChange={this.toggleEmailCheckbox.bind(this, val.type)}
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
      helper.showPopupMsg(t('notifications.txt-emailInvalid'), t('txt-error'), );
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
      }

      this.closeDialog();
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
      testEmails: []
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {activeContent, openEmailDialog, notifications, emails} = this.state;
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
                  <button className='standard btn' onClick={this.toggleContent.bind(this, 'editMode')}>{t('txt-edit')}</button>
                </div>
              }

              <div className='config-notify' style={{height: activeContent === 'viewMode' ? '78vh' : '70vh'}}>
                <div className='form-group normal short'>
                  <header>{t('notifications.txt-emailSettings')}</header>
                  <Button variant='contained' color='primary' className='last' onClick={this.openEmailDialog} disabled={activeContent === 'editMode'}>{t('notifications.txt-testEmails')}</Button>
                  <div className='group'>
                    <label htmlFor='notificationsServer'>{t('notifications.txt-smtpServer')}</label>
                    <Input
                      id='notificationsServer'
                      value={notifications.server}
                      onChange={this.handleDataChange.bind(this, 'server')}
                      readOnly={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <label htmlFor='notificationsPort'>{t('notifications.txt-smtpPort')}</label>
                    <DropDownList
                      id='notificationsPort'
                      required={true}
                      list={[
                        {value: 25, text: 25},
                        {value: 465, text: 465},
                        {value: 587, text: 587}
                      ]}
                      value={notifications.port}
                      onChange={this.handleDataChange.bind(this, 'port')}
                      readOnly={activeContent === 'viewMode'} />
                  </div>
                  <div className='group' style={{width: '50%'}}>
                    <label htmlFor='notificationsSender'>{t('notifications.txt-sender')}</label>
                    <Input
                      id='notificationsSender'
                      value={notifications.sender}
                      onChange={this.handleDataChange.bind(this, 'sender')}
                      readOnly={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <label htmlFor='notificationsSender'>{t('notifications.txt-smtpConnectType')}</label>
                    <DropDownList
                      id='notificationsSender'
                      required={true}
                      list={[
                        {value: 'standard', text: 'Standard'},
                        {value: 'ssl', text: 'SSL'},
                        {value: 'tls', text: 'TLS'},
                      ]}
                      value={notifications.connectType}
                      onChange={this.handleDataChange.bind(this, 'connectType')}
                      readOnly={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <label htmlFor='notificationsAuthentication'>{t('notifications.txt-authentication')}</label>
                    <DropDownList
                      id='notificationsAuthentication'
                      required={true}
                      list={[
                        {value: 'true', text: 'True'},
                        {value: 'false', text: 'False'}
                      ]}
                      value={notifications.authentication}
                      onChange={this.handleDataChange.bind(this, 'authentication')}
                      readOnly={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <label htmlFor='notificationsSenderAccount'>{t('notifications.txt-senderAccount')}</label>
                    <Input
                      id='notificationsSenderAccount'
                      value={notifications.senderAccount}
                      onChange={this.handleDataChange.bind(this, 'senderAccount')}
                      readOnly={activeContent === 'viewMode'} />
                  </div>
                  <div className='group'>
                    <label htmlFor='notificationsSenderPassword'>{t('notifications.txt-senderPassword')}</label>
                    <Input
                      id='notificationsSenderPassword'
                      type='password'
                      value={notifications.senderPassword}
                      onChange={this.handleDataChange.bind(this, 'senderPassword')}
                      readOnly={activeContent === 'viewMode'} />
                  </div>
                </div>

                {EMAIL_SETTINGS.map(this.getEmailsContent)}
              </div>

              {activeContent === 'editMode' &&
                <footer>
                  <button className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</button>
                  <button onClick={this.toggleContent.bind(this, 'save')}>{t('txt-save')}</button>
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