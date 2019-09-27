import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import Textarea from 'react-ui/build/src/components/textarea'

import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'
import {HocConfig as Config} from '../../common/configuration'
import TableContent from '../../common/table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

class Notifications extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeContent: 'viewMode', //viewMode, editMode
      originalNotifications: {},
      notifications: {
        email: {
          server: '',
          port: '',
          sender: '',
          connectType: 'standard',
          authentication: false,
          senderAccount: '',
          senderPassword: ''
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
    const {notifications} = this.state;
    const url = `${baseUrl}/api/notification/mailServer`;

    ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      if (data.rt) {
        data = data.rt;
        let notifications = {};
        notifications.email = {
          server: data.smtpServer,
          port: data.smtpPort,
          sender: data.sender,
          connectType: data.smtpConnectType,
          authentication: data.emailAuthentication,
          senderAccount: data.senderAcct,
          senderPassword: data.senderPasswd,
        };

        this.setState({
          originalNotifications: _.cloneDeep(notifications),
          notifications
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
    tempNotifications.email[type] = field;

    this.setState({
      notifications: tempNotifications
    });
  }
  toggleContent = (type) => {
    let showPage = type;

    if (type === 'save') {
      this.handleNotificationsConfirm();
      return;
    } else if (type === 'viewMode' || type === 'cancel') {
      showPage = 'viewMode';

      this.setState({
        notifications: this.state.originalNotifications
      });
    }

    this.setState({
      activeContent: showPage
    });
  }
  handleNotificationsConfirm = () => {
    const {baseUrl, contextRoot} = this.props;
    const {notifications} = this.state;
    const url = `${baseUrl}/api/notification/mailServer`;
    const requestData = {
      smtpServer: notifications.email.server,
      smtpPort: notifications.email.port,
      smtpConnectType: notifications.email.connectType,
      emailAuthentication: notifications.email.authentication,
      sender: notifications.email.sender,
      senderAcct: notifications.email.senderAccount,
      senderPasswd: notifications.email.senderPassword
    };

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      if (data) {
        this.getMailServerInfo();
        this.toggleContent('viewMode');
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'));
    });
  }
  render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {activeContent, notifications} = this.state;

    return (
      <div>
        <div className='sub-header'>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          <div className='parent-content'>
            <div className='main-content basic-form'>
              <header className='main-header'>{t('notifications.txt-settings')}</header>
              {activeContent === 'viewMode' &&
                <button className='standard btn last' onClick={this.toggleContent.bind(this, 'editMode')}>{t('txt-edit')}</button>
              }

              <div className='steps normal short'>
                <header>{t('notifications.txt-emailSettings')}</header>
                <div className='group'>
                  <label htmlFor='notificationsServer'>{t('notifications.txt-smtpServer')}</label>
                  <Input
                    id='notificationsServer'
                    onChange={this.handleDataChange.bind(this, 'server')}
                    value={notifications.email.server}
                    readOnly={activeContent === 'viewMode'} />
                </div>
                <div className='group'>
                  <label htmlFor='notificationsPort'>{t('notifications.txt-smtpPort')}</label>
                  <Input
                    id='notificationsPort'
                    onChange={this.handleDataChange.bind(this, 'port')}
                    value={notifications.email.port}
                    readOnly={activeContent === 'viewMode'} />
                </div>
                <div className='group' style={{width: '50%'}}>
                  <label htmlFor='notificationsSender'>{t('notifications.txt-sender')}</label>
                  <Input
                    id='notificationsSender'
                    onChange={this.handleDataChange.bind(this, 'sender')}
                    value={notifications.email.sender}
                    readOnly={activeContent === 'viewMode'} />
                </div>
                <div className='group'>
                  <label htmlFor='notificationsSender'>{t('notifications.txt-smtpConnectType')}</label>
                  <DropDownList
                    id='notificationsSender'
                    required={true}
                    list={[
                      {value: 'standard', text: 'Standard'}
                    ]}
                    onChange={this.handleDataChange.bind(this, 'connectType')}
                    value={notifications.email.connectType}
                    readOnly={activeContent === 'viewMode'} />
                </div>
                <div className='group'>
                  <label htmlFor='notificationsAuthentication'>{t('notifications.txt-authentication')}</label>
                  <DropDownList
                    id='notificationsAuthentication'
                    required={true}
                    list={[
                      {value: true, text: 'True'},
                      {value: false, text: 'False'}
                    ]}
                    onChange={this.handleDataChange.bind(this, 'authentication')}
                    value={notifications.email.authentication}
                    readOnly={activeContent === 'viewMode'} />
                </div>
                <div className='group'>
                  <label htmlFor='notificationsSenderAccount'>{t('notifications.txt-senderAccount')}</label>
                  <Input
                    id='notificationsSenderAccount'
                    onChange={this.handleDataChange.bind(this, 'senderAccount')}
                    value={notifications.email.senderAccount}
                    readOnly={activeContent === 'viewMode'} />
                </div>
                <div className='group'>
                  <label htmlFor='notificationsSenderPassword'>{t('notifications.txt-senderPassword')}</label>
                  <Input
                    id='notificationsSenderPassword'
                    type='password'
                    onChange={this.handleDataChange.bind(this, 'senderPassword')}
                    value={notifications.email.senderPassword}
                    readOnly={activeContent === 'viewMode'} />
                </div>
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

Notifications.propTypes = {
  baseUrl: PropTypes.string.isRequired
};

const HocNotifications = withRouter(withLocale(Notifications));
export { Notifications, HocNotifications };