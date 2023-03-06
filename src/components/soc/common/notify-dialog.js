import React, { Component } from 'react'
import _ from 'lodash'

import { ReactMultiEmail } from 'react-multi-email'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;
let it = null;

class NotifyDialog extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');

    this.state = {
      open: false,
      incidentId: '',
      phoneCheckAll: false,
      emailCheckAll: false,
      notifyEmailList: [],
      phoneSelectedList: [],
      emailSelectedList: [],
      phones: [],
      emails: []
    };
  }
  componentDidMount() {
  }
  /**
   * Handle dialog open
   * @method
   * @param {string} incidentId - incidient ID
   * @param {array.<string>} notifyEmailList - notify email list
   */
  open = (incidentId, notifyEmailList) => {
    this.setState({
      open: true,
      incidentId,
      notifyEmailList
    });
  }
  /**
   * Handle phone checkbox for all
   * @method
   * @param {object} event - event object
   */
  togglePhonecheckAll = (event) => {
    this.setState({
      phoneCheckAll: !this.state.phoneCheckAll
    }, () => {
      const {notifyEmailList, phoneCheckAll} = this.state;
      let phoneSelectedList = [];

      if (phoneCheckAll) {
        phoneSelectedList = notifyEmailList.map(val => {
          return val.phone;
        });
      }

      this.setState({
        phoneSelectedList
      });
    });
  }
  /**
   * Handle email checkbox for all
   * @method
   * @param {object} event - event object
   */
  toggleEmailcheckAll = (event) => {
    this.setState({
      emailCheckAll: !this.state.emailCheckAll
    }, () => {
      const {notifyEmailList, emailCheckAll} = this.state;
      let emailSelectedList = [];

      if (emailCheckAll) {
        emailSelectedList = notifyEmailList.map(val => {
          return val.email;
        });
      }

      this.setState({
        emailSelectedList
      });
    });
  }
  /**
   * Handle checkbox check/uncheck
   * @method
   * @param {string} type - contact type ('phone' or 'email')
   * @param {object} event - event object
   */
  toggleCheckbox = (type, event) => {
    const {notifyEmailList, phoneSelectedList, emailSelectedList} = this.state;

    if (type === 'phone') {
      let phoneCheckAll = false;
      let tempPhoneSelectedList = _.cloneDeep(phoneSelectedList);

      if (event.target.checked) {
        tempPhoneSelectedList.push(event.target.name);
      } else {
        tempPhoneSelectedList = _.filter(phoneSelectedList, val => {
          return val !== event.target.name;
        });
      }

      if (tempPhoneSelectedList.length === notifyEmailList.length) {
        phoneCheckAll = true;
      }

      this.setState({
        phoneCheckAll,
        phoneSelectedList: tempPhoneSelectedList
      });
    } else if (type === 'email') {
      let emailCheckAll = false;
      let tempEmailSelectedList = _.cloneDeep(emailSelectedList);

      if (event.target.checked) {
        tempEmailSelectedList.push(event.target.name);
      } else {
        tempEmailSelectedList = _.filter(emailSelectedList, val => {
          return val !== event.target.name;
        });
      }

      if (tempEmailSelectedList.length === notifyEmailList.length) {
        emailCheckAll = true;
      }

      this.setState({
        emailCheckAll,
        emailSelectedList: tempEmailSelectedList
      });
    }
  }
  /**
   * Check if item is already in the selected list
   * @method
   * @param {string} type - contact type ('phone' or 'email')
   * @param {string} val - checked item name
   * @returns boolean true/false
   */
  checkSelectedItem = (type, val) => {
    const {phoneSelectedList, emailSelectedList} = this.state;

    if (type === 'phone') {
      return _.includes(phoneSelectedList, val);
    } else if (type === 'email') {
      return _.includes(emailSelectedList, val);
    }
  }
  /**
   * Display checkbox for contact list
   * @method
   * @param {object} val - individual account
   * @param {number} i - index of the account
   * @returns HTML DOM
   */
  showEmailPhoneAccount = (val, i) => {
    return (
      <tr key={i}>
        <td>
          <FormControlLabel
            control={
              <Checkbox
                className='checkbox-ui'
                name={val.phone}
                checked={this.checkSelectedItem('phone', val.phone)}
                onChange={this.toggleCheckbox.bind(this, 'phone')}
                color='primary' />
            }
            disabled={val.phone === ''} />
        </td>
        <td>
          <FormControlLabel
            control={
              <Checkbox
                className='checkbox-ui'
                name={val.email}
                checked={this.checkSelectedItem('email', val.email)}
                onChange={this.toggleCheckbox.bind(this, 'email')}
                color='primary' />
            }
            disabled={val.email === ''} />
        </td>
        <td>{val.account}</td>
        <td>{`${val.email} (${val.sourceText})`}</td>
        <td>{`${val.phone}`}</td>
      </tr>
    )
  }
  /**
   * Handle email input change
   * @method
   * @param {array} newEmails - new emails list
   */
  handleEmailChange = (newEmails) => {
    this.setState({
      emails: newEmails
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
  getEamilLabel = (email, index, removeEmail) => {
    return (
      <div data-tag key={index}>
        {email}
        <span data-tag-handle onClick={this.deleteEmail.bind(this, removeEmail, index)}> <span className='font-bold'>x</span></span>
      </div>
    )
  }
  /**
   * Handle phone input change
   * @method
   * @param {array} newPhones - new phones list
   */
  handlePhoneChange = (newPhones) => {
    this.setState({
      phones: newPhones
    });
  }
  /**
   * Handle phone delete
   * @method
   * @param {function} removePhone - function to remove phone
   * @param {number} index - index of the phones list array
   */
  deletePhone = (removePhone, index) => {
    removePhone(index);
  }
  /**
   * Handle phone delete
   * @method
   * @param {string} phone - individual phone
   * @param {number} index - index of the phones list array
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
   * Display list for contact failed
   * @method
   * @param {object} val - individual contact
   * @param {number} i - index of the contact
   * @returns HTML DOM
   */
  displayFailedList = (val, i) => {
    return <li key={i} style={{fontWeight: 'bold'}}>{val}</li>
  }
  /**
   * Display contact failed list
   * @method
   * @param {array.<string>} failedList - contact failed list
   * @returns HTML DOM
   */
  showFailedList = (failedList) => {
    return (
      <React.Fragment>
        <div>{it('txt-notifySendSuccess')}</div>
        <div style={{margin: '15px 0 5px 0'}}>{t('notifications.txt-sendFailed')}:</div>
        <ul style={{maxHeight: '200px', overflowY: 'auto'}}>
          {failedList.map(this.displayFailedList)}
        </ul>
      </React.Fragment>
    )
  }
  /**
   * Handle notify email submit
   * @method
   */
  handleNotifySubmit = () => {
    const {baseUrl, session} = this.context;
    const {incidentId, phoneSelectedList, emailSelectedList, phones, emails} = this.state;
    const smsPhoneNumberList = _.concat(phoneSelectedList, phones);
    const sendMailList = _.concat(emailSelectedList, emails);

    if (smsPhoneNumberList.length === 0 && sendMailList.length === 0) {
      helper.showPopupMsg('', t('txt-error'), t('txt-plsEnterPhoneEmail'));
      return;
    }

    const requestData = {
      incidentId,
      userId: session.accountId,
      smsPhoneNumberList,
      sendMailList
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/_notify`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data && data.rt) {
        if (data.ret === 0) {
          const failedList = data.rt.failedList;

          if (failedList.length === 0) {
            helper.showPopupMsg('', it('txt-notify'), it('txt-notifySendSuccess'));
          } else {
            PopupDialog.alert({
              id: 'modalWindowSmall',
              title: it('txt-notify'),
              confirmText: t('txt-ok'),
              display: this.showFailedList(failedList)
            });
          }
        } else {
          helper.showPopupMsg('', it('txt-notify'), t('txt-txt-fail'));
        }
        this.close();
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  /**
   * Handle dialog close
   * @method
   */
  close = () => {
    this.setState({
      open: false,
      phoneSelectedList: [],
      emailSelectedList: []
    });
  }
  render() {
    const {open, phoneCheckAll, emailCheckAll, notifyEmailList, phones, emails} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.close},
      confirm: {text: t('txt-confirm'), handler: this.handleNotifySubmit}
    };

    if (!open) {
      return null;
    }

    return (
      <ModalDialog id='notifyDialog' className='incident-tag-modal' style={{width: '1080px'}} title={it('txt-notify')} draggable={true} global={true} closeAction='cancel' actions={actions}>
        <div className='data-content' style={{minHeight: '26vh'}}>
          <div className='parent-content'>
            <div className='main-content basic-form' style={{minHeight: '47vh'}}>
              <div className='existing-email'>
                <table className='c-table main-table'>
                  <thead>
                    <tr>
                      <th>{t('notifications.sms.txt-textMsg')}</th>
                      <th>{t('notifications.txt-sendEmails')}</th>
                      <th>{t('txt-account')}</th>
                      <th>{t('soar.txt-email')}</th>
                      <th>{t('soar.txt-cellPhone')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <FormControlLabel
                          control={
                            <Checkbox
                              className='checkbox-ui'
                              name='phoneCheckAll'
                              checked={phoneCheckAll}
                              onChange={this.togglePhonecheckAll}
                              color='primary' />
                          } />
                      </td>
                      <td>
                        <FormControlLabel
                          control={
                            <Checkbox
                              className='checkbox-ui'
                              name='emailCheckAll'
                              checked={emailCheckAll}
                              onChange={this.toggleEmailcheckAll}
                              color='primary' />
                          } />
                      </td>
                      <td>{t('txt-selectAll')}</td>
                    </tr>                      
                    {notifyEmailList.map(this.showEmailPhoneAccount)}
                  </tbody>
                </table>
              </div>
              <div className='user-email'>
                <label>{t('notifications.txt-recipientEmail')}</label>
                <ReactMultiEmail
                  emails={emails}
                  onChange={this.handleEmailChange}
                  getLabel={this.getEamilLabel} />
              </div>
              <div className='user-phone'>
                <label>{t('notifications.txt-recipientPhone')}</label>
                <ReactMultiEmail
                  emails={phones}
                  onChange={this.handlePhoneChange}
                  validateEmail={phone => true}
                  getLabel={this.getPhoneLabel} />
              </div>
            </div>
          </div>
        </div>
      </ModalDialog>
    )
  }
}

NotifyDialog.contextType = BaseDataContext;
NotifyDialog.propTypes = {
};

export default NotifyDialog;