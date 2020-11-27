import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import i18n from 'i18next'
import cx from 'classnames'
import _ from 'lodash'

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import DataTable from 'react-ui/build/src/components/table'
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
      contextAnchor: null,
      currentAccountData: {},
      dataFields: {},
      showNewPassword: false,
      newPassword: '',
      info: '',
      formValidation: {
        password: {
          valid: true
        }
      }
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
                    <Button variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue)}><i className='fg fg-more'></i></Button>
                  </div>
                )
              } else if (tempData === 'account' && allValue.isLock) {
                return <span><i className='fg fg-key' title={c('txt-account-unlocked')}></i>{value}</span>;
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
   * Handle open menu
   * @method
   * @param {object} account - active account data
   * @param {object} event - event object
   */
  handleOpenMenu = (account, event) => {
    this.setState({
      contextAnchor: event.currentTarget,
      currentAccountData: account
    });
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null,
      currentAccountData: {}
    });
  }
  /**
   * Handle table row mouse over
   * @method
   * @param {string} index - index of the account data
   * @param {object} allValue - account data
   * @param {object} event - event object
   */
  handleRowMouseOver = (value, allValue, event) => {
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
    this.handleCloseMenu();
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
      msg = c('txt-account-delete') + ': ' + allValue.account;
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

    this.handleCloseMenu();
  }
  /**
   * Handle delete/unlock modal confirm
   * @method
   * @param {string} type - action type ('delete' or 'unlock')
   */
  accountAction = (type) => {
    const {baseUrl} = this.context;
    const {accountID} = this.state;
    let url = '';
    let requestType = '';
    let msg = '';

    if (!accountID) {
      return;
    }

    if (type === 'delete') {
      url = `${baseUrl}/api/account/?accountid=${accountID}`;
      requestType = 'DELETE';
      msg = t('txt-deleteAccountSuccess');
    } else if (type === 'unlock') {
      url = `${baseUrl}/api/account/_unlock?accountid=${accountID}`;
      requestType = 'PATCH';
      msg = t('txt-unlockAccountSuccess');
    }

    ah.one({
      url,
      type: requestType
    })
    .then(() => {
      helper.showPopupMsg(msg);
      this.loadAccounts();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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

    this.handleCloseMenu();
  }
  /**
   * Handle password input box
   * @method
   * @param {object} event - event object
   */
  handlePasswordChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }
  /**
   * Display new password content
   * @method
   * @returns HTML DOM
   */
  displayNewPassword = () => {
    const {newPassword, formValidation} = this.state;

    return (
      <div className='group'>
        <TextField
          id='resetPassword'
          name='newPassword'
          type='password'
          label={c('txt-password')}
          variant='outlined'
          fullWidth={true}
          size='small'
          required={true}
          error={!formValidation.password.valid}
          helperText={formValidation.password.valid ? '' : c('txt-required')}
          value={newPassword}
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
    const {accountName, newPassword, formValidation} = this.state;
    const url = `${baseUrl}/api/account/password/_reset`;
    const requestData = {
      account: accountName,
      newPassword
    };
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (newPassword) {
      formValidation.password.valid = true;
    } else {
      formValidation.password.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
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
      info: '',
      formValidation: {
        password: {
          valid: true
        }
      }
    });
  }
  /**
   * Handle filter input value change
   * @method
   * @param {object} event - event object
   */
  handleSearchChange = (event) => {
    let tempParam = {...this.state.param};
    tempParam[event.target.name] = event.target.value;

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
            <TextField
              id='account'
              name='account'
              label={t('l-account')}
              variant='outlined'
              fullWidth={true}
              size='small'
              value={param.account}
              onChange={this.handleSearchChange} />
          </div>
          <div className='group'>
            <TextField
              id='name'
              name='name'
              label={t('l-name')}
              variant='outlined'
              fullWidth={true}
              size='small'
              value={param.name}
              onChange={this.handleSearchChange} />
          </div>
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.getAccountFilterData}>{c('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{c('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {accountData, dataFields, showFilter, showNewPassword, contextAnchor, currentAccountData} = this.state;

    return (
      <div>
        {showNewPassword &&
          this.showNewPasswordDialog()
        }

        <Menu
          anchorEl={contextAnchor}
          keepMounted
          open={Boolean(contextAnchor)}
          onClose={this.handleCloseMenu}>
          <MenuItem onClick={this.showEditDialog.bind(this, currentAccountData.accountid)}>{c('txt-edit')}</MenuItem>
          <MenuItem onClick={this.showDialog.bind(this, 'delete', currentAccountData, currentAccountData.accountid)}>{c('txt-delete')}</MenuItem>
          <MenuItem onClick={this.showResetPassword.bind(this, currentAccountData.account)}>{c('txt-resetPassword')}</MenuItem>
          {currentAccountData.isLock &&
            <MenuItem onClick={this.showDialog.bind(this, 'unlock', currentAccountData, currentAccountData.accountid)}>{c('txt-unlock')}</MenuItem>
          }
        </Menu>

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button variant='outlined' color='primary' onClick={this.showEditDialog.bind(this, null)} title={t('txt-add-account')}><i className='fg fg-add'></i></Button>
            <Button variant='outlined' color='primary' className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={c('txt-filter')}><i className='fg fg-filter'></i></Button>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            {this.renderFilter()}

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