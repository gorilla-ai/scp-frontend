import React, {Component} from 'react'
import _ from 'lodash'

import { ReactMultiEmail } from 'react-multi-email'

import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;
let it = null;

class NotifyDialog extends Component {
  constructor(props) {
    super(props)

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');

    this.state = {
      open: false,
      incidentId: '',
      emailCheckAll: false,
      notifyEmailList: [],
      emailSelectedList: [],
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
   * @param {object} event - event object
   */
  toggleCheckbox = (event) => {
    const {emailSelectedList, notifyEmailList} = this.state;
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
  /**
   * Check if item is already in the selected list
   * @method
   * @param {string} val - checked item name
   * @returns boolean true/false
   */
  checkSelectedItem = (val) => {
    return _.includes(this.state.emailSelectedList, val);
  }
  /**
   * Display checkbox for account list
   * @method
   * @param {object} val - individual account
   * @param {number} i - index of the account
   * @returns HTML DOM
   */
  showEmailAccount = (val, i) => {
    return (
      <tr key={i}>
        <td>
          <FormControlLabel
            key={i}
            control={
              <Checkbox
                className='checkbox-ui'
                name={val.email}
                checked={this.checkSelectedItem(val.email)}
                onChange={this.toggleCheckbox}
                color='primary' />
            } />
        </td>
        <td>{val.account}</td>
        <td>{`${val.email} (${val.sourceText})`}</td>
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
  getLabel = (email, index, removeEmail) => {
    return (
      <div data-tag key={index}>
        {email}
        <span data-tag-handle onClick={this.deleteEmail.bind(this, removeEmail, index)}> <span className='font-bold'>x</span></span>
      </div>
    )
  }
  /**
   * Handle notify email submit
   * @method
   */
  handleNotifySubmit = () => {
    const {baseUrl, session} = this.context;
    const {incidentId, emailSelectedList, emails} = this.state;
    const emailList = _.concat(emailSelectedList, emails);

    if (emailList.length === 0) {
      helper.showPopupMsg(t('txt-plsEnterEmail'));
      return;
    }

    const requestData = {
      incidentId,
      userId: session.accountId,
      sendMailList: emailList
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
        if (data.status.includes('success')){
          helper.showPopupMsg('', it('txt-notify'), it('txt-notify') + t('notifications.txt-sendSuccess'));
        } else {
          helper.showPopupMsg('', it('txt-notify'), t('txt-txt-fail'));
        }
        this.close();
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message)
    });
  }
  /**
   * Handle dialog close
   * @method
   */
  close = () => {
    this.setState({
      open: false
    });
  }
  render() {
    const {open, emailCheckAll, notifyEmailList, emails} = this.state;
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
                      <th></th>
                      <th>{t('txt-account')}</th>
                      <th>{t('soar.txt-email')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
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
                    {notifyEmailList.map(this.showEmailAccount)}
                  </tbody>
                </table>
              </div>
              <div className='user-email'>
                <label>{t('notifications.txt-recipientEmail')}</label>
                <ReactMultiEmail
                  emails={emails}
                  onChange={this.handleEmailChange}
                  getLabel={this.getLabel} />
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