import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import Checkbox from 'react-ui/build/src/components/checkbox'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {ReactMultiEmail} from 'react-multi-email';

import {HocConfig as Config} from '../../common/configuration'
import helper from '../../common/helper'
import TableContent from '../../common/table-content'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'
import 'react-multi-email/style.css';

let t = null;
let et = null;

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
        }
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getMailServerInfo();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state === 'viewMode') {
      this.toggleContent('viewMode');
    }
  }
  getMailServerInfo = () => {
    const {baseUrl, contextRoot} = this.props;
    const {notifications, emails} = this.state;

    ah.all([
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
        const data1 = data[0].rt;
        const data2 = data[1].rt;

        const notifications = {
          server: data1.smtpServer,
          port: data1.smtpPort,
          sender: data1.sender,
          connectType: data1.smtpConnectType,
          authentication: data1.emailAuthentication.toString(), //Convert boolean to string
          senderAccount: data1.senderAcct,
          senderPassword: data1.senderPasswd,
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
  handleDataChange = (type, field) => {
    let tempNotifications = {...this.state.notifications};
    tempNotifications[type] = field;

    this.setState({
      notifications: tempNotifications
    });
  }
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
  handleNotificationsConfirm = () => {
    const {baseUrl, contextRoot} = this.props;
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
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  toggleEmailCheckbox = (type, value) => {
    let tempEmails = {...this.state.emails};
    tempEmails[type].enable = value;

    this.setState({
      emails: tempEmails
    })
  }
  displayEmail = (val, i) => {
    return <span key={i}>{val}</span>
  }
  handleEmailChange = (val, newEmails) => {
    let tempEmails = {...this.state.emails};
    tempEmails[val.type].emails = newEmails;

    this.setState({
      emails: tempEmails
    });
  }
  deleteEmail = (removeEmail, index) => {
    removeEmail(index);
  }
  getLabel = (email, index, removeEmail) => {
    return (
      <div data-tag key={index}>
        {email}
        <span data-tag-handle onClick={this.deleteEmail.bind(this, removeEmail, index)}> <span className='font-bold'>x</span></span>
      </div>
    )
  }
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
          {activeContent === 'viewMode' && emails[val.type].emails.length === 0 &&
            <div>N/A</div>
          }
          {activeContent === 'editMode' &&
            <ReactMultiEmail
              emails={emails[val.type].emails}
              onChange={this.handleEmailChange.bind(this, val)}
              getLabel={this.getLabel}
            />
          }
        </div>
        <div className='group'>
          <label htmlFor='serviceError' className='checkbox'>{val.checkboxText}</label>
          <Checkbox
            id='serviceError'
            onChange={this.toggleEmailCheckbox.bind(this, val.type)}
            checked={emails[val.type].enable}
            disabled={activeContent === 'viewMode'} />
        </div>
      </div>
    )
  }
  openEmailDialog = () => {
    this.setState({
      openEmailDialog: true
    });
  }
  handleTestEmailChange = (newEmails) => {
    this.setState({
      testEmails: newEmails
    });
  }
  displayTestEmail = () => {
    const {testEmails} = this.state;

    return (
      <div>
        <label>{t('notifications.txt-recipientEmail')}</label>
        <ReactMultiEmail
          emails={testEmails}
          onChange={this.handleTestEmailChange}
          getLabel={this.getLabel}
        />
      </div>
    )
  }
  testEmailDialog = () => {
    const titleText = t('notifications.txt-testEmails');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog},
      confirm: {text: t('txt-send'), handler: this.testEmailConfirm}
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
  testEmailConfirm = () => {
    const {testEmails} = this.state;
    let dataParams = '';

    _.forEach(testEmails, val => {
      dataParams += '&receipts=' + val;
    })

    this.ah.one({
      url: `${baseUrl}/api/notification/mailServer/_test?` + dataParams,
      type: 'GET'
    })
    .then(data => {
      if (data.ret === 0) {
        this.closeDialog();
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  closeDialog = () => {
    this.setState({
      openEmailDialog: false,
      testEmails: []
    });
  }
  render() {
    const {baseUrl, contextRoot, language, locale, session} = this.props;
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
            contextRoot={contextRoot}
            language={language}
            locale={locale}
            session={session} />

          <div className='parent-content'>
            <div className='main-content basic-form'>
              <header className='main-header'>{t('notifications.txt-settings')}</header>
              {activeContent === 'viewMode' &&
                <button className='standard btn last' onClick={this.toggleContent.bind(this, 'editMode')}>{t('txt-edit')}</button>
              }

              <div className='form-group normal short'>
                <header>{t('notifications.txt-emailSettings')}</header>
                <button className='last' onClick={this.openEmailDialog}>{t('notifications.txt-testEmails')}</button>
                <div className='group'>
                  <label htmlFor='notificationsServer'>{t('notifications.txt-smtpServer')}</label>
                  <Input
                    id='notificationsServer'
                    onChange={this.handleDataChange.bind(this, 'server')}
                    value={notifications.server}
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
                    onChange={this.handleDataChange.bind(this, 'port')}
                    value={notifications.port}
                    readOnly={activeContent === 'viewMode'} />
                </div>
                <div className='group' style={{width: '50%'}}>
                  <label htmlFor='notificationsSender'>{t('notifications.txt-sender')}</label>
                  <Input
                    id='notificationsSender'
                    onChange={this.handleDataChange.bind(this, 'sender')}
                    value={notifications.sender}
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
                    onChange={this.handleDataChange.bind(this, 'connectType')}
                    value={notifications.connectType}
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
                    onChange={this.handleDataChange.bind(this, 'authentication')}
                    value={notifications.authentication}
                    readOnly={activeContent === 'viewMode'} />
                </div>
                <div className='group'>
                  <label htmlFor='notificationsSenderAccount'>{t('notifications.txt-senderAccount')}</label>
                  <Input
                    id='notificationsSenderAccount'
                    onChange={this.handleDataChange.bind(this, 'senderAccount')}
                    value={notifications.senderAccount}
                    readOnly={activeContent === 'viewMode'} />
                </div>
                <div className='group'>
                  <label htmlFor='notificationsSenderPassword'>{t('notifications.txt-senderPassword')}</label>
                  <Input
                    id='notificationsSenderPassword'
                    type='password'
                    onChange={this.handleDataChange.bind(this, 'senderPassword')}
                    value={notifications.senderPassword}
                    readOnly={activeContent === 'viewMode'} />
                </div>
              </div>

              {EMAIL_SETTINGS.map(this.getEmailsContent)}

              {activeContent === 'editMode' &&
                <footer className='no-fixed'>
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

Notifications.propTypes = {
  baseUrl: PropTypes.string.isRequired
};

const HocNotifications = withRouter(withLocale(Notifications));
export { Notifications, HocNotifications };