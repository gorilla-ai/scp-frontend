import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import i18n from 'i18next'
import cx from 'classnames'
import _ from 'lodash'

import ContextMenu from 'react-ui/build/src/components/contextmenu'
import DataTable from 'react-ui/build/src/components/table'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import AccountEdit from './account-edit'
import {BaseDataContext} from '../../../common/context';
import Config from '../../../common/configuration'
import helper from '../../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const log = require('loglevel').getLogger('user/accounts')
const c = i18n.getFixedT(null, 'connections');
const t = i18n.getFixedT(null, 'accounts');
const gt =  i18n.getFixedT(null, 'app');

/**
 * Account List
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the account list
 */
class AccountList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showFilter: false,
      originalAccountData: [],
      accountData: [],
      dataFieldsArr: ['_menu', 'accountid', 'account', 'name', 'email', 'unit', 'title', 'phone'],
      param: {
        name: '',
        account: ''
      },
      accountID: '',
      accountName: '',
      dataFields: {},
      showNewPassword: false,
      newPassword: '',
      info: ''
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.loadAccounts();
  }
  /**
   * Get and set account list data
   * @method
   */
  loadAccounts = () => {
    const {baseUrl} = this.context;
    const {dataFieldsArr} = this.state;

    ah.one({
      url: `${baseUrl}/api/account/v1/_search`,
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data) {
        const accountData = data.rt.rows;

        let tempFields = {};
        dataFieldsArr.forEach(tempData => {
          tempFields[tempData] = {
            hide: tempData === 'accountid' ? true : false,
            label: tempData === '_menu' ? '' : t(`accountFields.${tempData}`),
            sortable: tempData === '_menu' ? null : true,
            formatter: (value, allValue, i) => {
              if (tempData === '_menu') {
                return (
                  <div className={cx('table-menu', {'active': value})}>
                    <button onClick={this.handleRowContextMenu.bind(this, allValue)}><i className='fg fg-more'></i></button>
                  </div>
                )
              } else {
                return <span>{value}</span>;
              }
            }
          }
        })

        this.setState({
          originalAccountData: _.cloneDeep(accountData),
          accountData,
          dataFields: tempFields
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Construct and display table context menu
   * @method
   * @param {object} allValue - account data
   * @param {object} evt - mouseClick events
   */
  handleRowContextMenu = (allValue, evt) => {
    const menuItems = [
      {
        id: 'edit',
        text: c('txt-edit'),
        action: () => this.showEditDialog(allValue.accountid)
      },
      {
        id: 'delete',
        text: c('txt-delete'),
        action: () => this.showDialog('delete', allValue, allValue.accountid)
      },
      {
        id: 'unlock',
        text: c('txt-unlock'),
        action: () => this.showDialog('unlock', allValue, allValue.accountid)
      },
      {
        id: 'resetPassword',
        text: c('txt-resetPassword'),
        action: () => this.showResetPassword(allValue.account)
      }
    ];

    ContextMenu.open(evt, menuItems, 'configUserAccountsMenu');
    evt.stopPropagation();
  }
  /**
   * Handle table row mouse over
   * @method
   * @param {string} index - index of the account data
   * @param {object} allValue - account data
   * @param {object} evt - MouseoverEvents
   */
  handleRowMouseOver = (value, allValue, evt) => {
    let tempAccountData = {...this.state.accountData};
    tempAccountData = _.map(tempAccountData, el => {
      return {
        ...el,
        _menu: el.accountid === allValue.accountid ? true : false
      };
    });

    this.setState({
      accountData: tempAccountData
    });
  }
  /**
   * Handle account filter action
   * @method
   */
  getAccountFilterData = () => {
    const {originalAccountData, accountData, param} = this.state;
    let filteredAccountArr = [];

    if (param.name || param.account) { //If filters are set
      filteredAccountArr = _.filter(accountData, ({name, account}) => {
        return (_.includes(name, param.name) && _.includes(account, param.account));
      });
    } else  {
      filteredAccountArr = originalAccountData;
    }

    this.setState({
      accountData: filteredAccountArr
    });
  }
  /**
   * Open account edit modal dialog
   * @method
   * @param {string} id - selected account ID
   */
  showEditDialog = (id) => {
    this.editor.openAccount(id, 'fromAccount');
  }
  /**
   * Display delete and unlock content
   * @method
   * @param {string} type - action type ('delete' or 'unlock')
   * @param {object} allValue - account data
   * @param {string} id - selected account ID
   * @returns HTML DOM
   */
  getAccountMsgContent = (type, allValue, id) => {
    let msg = '';

    if (type === 'delete') {
      msg = c('txt-delete-msg') + ': ' + allValue.account;
    } else if (type === 'unlock') {
      msg = c('txt-account-unlock') + ': ' + allValue.account;
    }

    this.setState({
      accountID: id
    });

    return (
      <div className={cx('content', {'delete': type === 'delete'})}>
        <span>{msg}?</span>
      </div>
    )
  }
  /**
   * Display delete/unlock modal dialog
   * @method
   * @param {string} type - action type ('delete' or 'unlock')
   * @param {object} allValue - account data
   * @param {string} id - selected account ID
   */
  showDialog = (type, allValue, id) => {
    PopupDialog.prompt({
      title: c('txt-' + type + 'Account'),
      id: 'modalWindowSmall',
      confirmText: c('txt-' + type),
      cancelText: c('txt-cancel'),
      display: this.getAccountMsgContent(type, allValue, id),
      act: (confirmed) => {
        if (confirmed) {
          this.accountAction(type);
        }
      }
    });
  }
  /**
   * Handle delete/unlock modal confirm
   * @method
   * @param {string} type - action type ('delete' or 'unlock')
   */
  accountAction = (type) => {
    const {baseUrl} = this.context;
    const {accountID} = this.state;

    if (!accountID) {
      return;
    }

    if (type === 'delete') {
      ah.one({
        url: `${baseUrl}/api/account/?accountid=${accountID}`,
        type: 'DELETE'
      })
      .then(() => {
        this.loadAccounts();
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    } else if (type === 'unlock') {
      ah.one({
        url: `${baseUrl}/api/account/_unlock?accountid=${accountID}`,
        type: 'PATCH'
      })
      .then(() => {
        helper.showPopupMsg(t('txt-unlockAccountSuccess', ''));
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
  }
  /**
   * Show reset password dialog and set active account name
   * @method
   * @returns HTML DOM
   */
  showResetPassword = (accountName) => {
    this.setState({
      accountName,
      showNewPassword: true
    });
  }
  /**
   * Handle password input box
   * @method
   * @param {string} value - password entered by the user
   */
  handlePasswordChange = (value) => {
    this.setState({
      newPassword: value
    });
  }
  /**
   * Display new password content
   * @method
   * @returns HTML DOM
   */
  displayNewPassword = () => {
    return (
      <div className='group'>
        <label htmlFor='resetPassword'></label>
        <Input
          id='resetPassword'
          type='password'
          value={this.state.newPassword}
          onChange={this.handlePasswordChange} />
      </div>
    )    
  }
  /**
   * Show password reset dialog
   * @method
   * @returns ModalDialog
   */
  showNewPasswordDialog = () => {
    const actions = {
      cancel: {text: c('txt-cancel'), className: 'standard', handler: this.closeResetPasswordDialog},
      confirm: {text: c('txt-confirm'), handler: this.handleResetPasswordConfirm}
    };
    const titleText = c('txt-resetPassword');

    return (
      <ModalDialog
        id='adminResetPasswordDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        info={this.state.info}
        closeAction='cancel'>
        {this.displayNewPassword()}
      </ModalDialog>
    )
  }
  /**
   * Handle reset password confirm
   * @method
   */
  handleResetPasswordConfirm = () => {
    const {baseUrl} = this.context;
    const {accountName, newPassword} = this.state;
    const url = `${baseUrl}/api/account/password/_reset`;
    const requestData = {
      account: accountName,
      newPassword
    };

    if (!newPassword) {
      this.setState({
        info: t('pwd-empty')
      });
      return;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(c('txt-resetPasswordSuccess'));
        this.closeResetPasswordDialog();
      }
      return null;
    })
    .catch(err => {
      this.setState({
        info: err.message
      });
    })
  }
  /**
   * Handle reset password cancel
   * @method
   */
  closeResetPasswordDialog = () => {
    this.setState({
      showNewPassword: false,
      newPassword: '',
      info: ''
    });
  }
  /**
   * Handle filter input value change
   * @method
   * @param {string} type - input type
   * @param {object} event - input value
   */
  handleSearchChange = (type, event) => {
    let tempParam = {...this.state.param};
    tempParam[type] = event.target.value.trim();

    this.setState({
      param: tempParam
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
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      param: {
        name: '',
        account: ''
      }
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, param} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{c('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='account' >{t('l-account')}</label>
            <input
              id='account'
              type='text'
              placeholder={t('ph-account')}
              value={param.account}
              onChange={this.handleSearchChange.bind(this, 'account')} />
          </div>
          <div className='group'>
            <label htmlFor='name'>{t('l-name')}</label>
            <input
              id='name'
              type='text'
              placeholder={t('ph-name')}
              value={param.name}
              onChange={this.handleSearchChange.bind(this, 'name')} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getAccountFilterData}>{c('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter}>{c('txt-clear')}</button>
        </div>
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {accountData, dataFields, showFilter, showNewPassword} = this.state;

    return (
      <div>
        {showNewPassword &&
          this.showNewPasswordDialog()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button onClick={this.showEditDialog.bind(this, null)} title={t('txt-add-account')}><i className='fg fg-add'></i></button>
            <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={c('txt-filter')}><i className='fg fg-filter'></i></button>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            { this.renderFilter() }

            <div className='main-content'>
              <header className='main-header'>{c('txt-account')}</header>
              <div className='table-content'>
                <div className='table no-pagination'>
                  <DataTable
                    className='main-table'
                    fields={dataFields}
                    onRowMouseOver={this.handleRowMouseOver}
                    data={accountData} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <AccountEdit
          ref={ref => { this.editor = ref }}
          onDone={this.loadAccounts} />
      </div>
    )
  }
}

AccountList.contextType = BaseDataContext;

AccountList.propTypes = {
};

export default AccountList;