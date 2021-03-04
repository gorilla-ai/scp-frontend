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
import AdConfig from './ad-config'
import {BaseDataContext} from '../../../common/context';
import Config from '../../../common/configuration'
import MuiTableContent from '../../../common/mui-table-content'
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
      accountSearch: {
        name: '',
        account: ''
      },
      userAccount: {
        dataFieldsArr: ['_menu', 'account', 'name', 'email', 'unit', 'title', 'phone'],
        dataFields: [],
        dataContent: [],
        sort: {
          field: 'account',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      sshDataFieldArr: ['id', 'account', 'option'],
      sshData: [],
      sshAccountName: '',
      accountID: '',
      accountName: '',
      contextAnchor: null,
      menuType: '',
      currentAccountData: {},
      showSshAccount: false,
      showAddSshAccount: false,
      showNewPassword: false,
      newPassword: '',
      info: '',
      formValidation: {
        sshAccountName: {
          valid: true
        },
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

    this.getAccountsData();
    this.getSshAccountList();
  }
  /**
   * Get and set account list data
   * @method
   * @param {string} options - option for 'currentPage'
   */
  getAccountsData = (options) => {
    const {baseUrl} = this.context;
    const {accountSearch, userAccount} = this.state;
    const sort = userAccount.sort.desc ? 'desc' : 'asc';
    const page = options === 'currentPage' ? userAccount.currentPage : 0;
    const url = `${baseUrl}/api/account/v2/_search?page=${page + 1}&pageSize=${userAccount.pageSize}&orders=${userAccount.sort.field} ${sort}`;
    let requestData = {};

    if (accountSearch.account) {
      requestData.account = accountSearch.account;
    }

    if (accountSearch.name) {
      requestData.name = accountSearch.name;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'application/json'
    })
    .then(data => {
      if (data) {
        let tempUserAccount = {...userAccount};
        tempUserAccount.dataContent = data.rows;
        tempUserAccount.totalCount = data.counts;
        tempUserAccount.currentPage = page;

        tempUserAccount.dataFields = _.map(userAccount.dataFieldsArr, val => {
          return {
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : t('accountFields.' + val),
            options: {
              filter: true,
              sort: true,
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempUserAccount.dataContent[dataIndex];
                const value = tempUserAccount.dataContent[dataIndex][val];

                if (val === '_menu') {
                  return (
                    <div className='table-menu active'>
                      <Button variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, 'accountOptions', allValue)}><i className='fg fg-more'></i></Button>
                    </div>
                  )
                } else if (val === 'account' && allValue.isLock) {
                  return <span><i className='fg fg-key' title={c('txt-account-unlocked')}></i>{value}</span>;
                } else {
                  return <span>{value}</span>
                }
              }
            }
          };
        });

        this.setState({
          userAccount: tempUserAccount
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', c('txt-error'), err.message);
    })
  }
  /**
   * Get and set SSH account list data
   * @method
   */
  getSshAccountList = () => {
    const {baseUrl} = this.context;
    const {accountSearch, userAccount} = this.state;
    let requestData = {};

    this.ah.one({
      url: `${baseUrl}/api/log/netproxy/sshaccount`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        this.setState({
          sshData: data.rows
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', c('txt-error'), err.message);
    })
  }
  /**
   * Handle open menu
   * @method
   * @param {string} type - menu type ('accountOptions' or 'accountAdd')
   * @param {object} [account] - active account data
   * @param {object} event - event object
   */
  handleOpenMenu = (type, account, event) => {
    if (type === 'accountOptions') {
      this.setState({
        currentAccountData: account
      });
    }

    this.setState({
      contextAnchor: event.currentTarget,
      menuType: type
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
   * Open account edit modal dialog
   * @method
   * @param {string} id - selected account ID
   */
  showEditDialog = (id) => {
    this.editor.openAccount(id, 'fromAccount');
    this.handleCloseMenu();
  }

  showAdDialog = () => {
    this.config.open()
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
      this.getAccountsData();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', c('txt-error'), err.message);
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
          fullWidth
          size='small'
          required
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
        sshAccountName: {
          valid: true
        },
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
    let tempAccountSearch = {...this.state.accountSearch};
    tempAccountSearch[event.target.name] = event.target.value;

    this.setState({
      accountSearch: tempAccountSearch
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
      accountSearch: {
        name: '',
        account: ''
      }
    });
  }
  /**
   * Handle filter search submit
   * @method
   */
  handleSearchSubmit = () => {
    let tempUserAccount = {...this.state.userAccount};
    tempUserAccount.dataFields = [];
    tempUserAccount.dataContent = [];
    tempUserAccount.totalCount = 0;
    tempUserAccount.currentPage = 1;
    tempUserAccount.pageSize = 20;
    
    this.setState({
      userAccount: tempUserAccount
    }, () => {
      this.getAccountsData();
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, accountSearch} = this.state;

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
              fullWidth
              size='small'
              value={accountSearch.account}
              onChange={this.handleSearchChange} />
          </div>
          <div className='group'>
            <TextField
              id='name'
              name='name'
              label={t('l-name')}
              variant='outlined'
              fullWidth
              size='small'
              value={accountSearch.name}
              onChange={this.handleSearchChange} />
          </div>
        </div>
        <div className='button-group'>
          <Button id='account-btn-filter' variant='contained' color='primary' className='filter' onClick={this.handleSearchSubmit}>{c('txt-filter')}</Button>
          <Button id='account-btn-clear' variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{c('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempUserAccount = {...this.state.userAccount};
    tempUserAccount[type] = Number(value);

    if (type === 'pageSize') {
      tempUserAccount.currentPage = 0;
    }

    this.setState({
      userAccount: tempUserAccount
    }, () => {
      this.getAccountsData(type);
    });
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempUserAccount = {...this.state.userAccount};
    tempUserAccount.sort.field = field;
    tempUserAccount.sort.desc = sort;

    this.setState({
      userAccount: tempUserAccount
    }, () => {
      this.getAccountsData();
    });
  }
  /**
   * Toggle SSH dialog on/off
   * @method
   */
  toggleSshDialog = () => {
    this.setState({
      showSshAccount: !this.state.showSshAccount
    });

    this.handleCloseMenu();
  }
  /**
   * Open delete name modal dialog
   * @method
   * @param {string} id - account ID
   * @param {string} account - selected account name
   */
  openDeleteAccount = (id, account) => {
    PopupDialog.prompt({
      title: c('txt-deleteAccount'),
      id: 'modalWindowSmall',
      confirmText: c('txt-delete'),
      cancelText: c('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{c('txt-delete-msg')}: {account}?</span>
        </div>
      ),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteSshAccount(id)
        }
      }
    });
  }
  /**
   * Handle delete SSH account confirm
   * @method
   * @param {string} id - selected account ID
   */
  deleteSshAccount = (id) => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/log/netproxy/sshaccount?id=${id}`,
      type: 'DELETE'
    })
    .then(data => {
      this.getSshAccountList();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', c('txt-error'), err.message);
    })
  }
  /**
   * Display list of SSH accounts
   * @method
   */
  displaySshAccount = () => {
    const {sshDataFieldArr, sshData} = this.state;

    let dataFields = {};
    sshDataFieldArr.forEach(tempData => {
      dataFields[tempData] = {
        hide: tempData === 'id' ? true : false,
        label: tempData === 'account' ? c('txt-account') : '',
        sortable: false,
        formatter: (value, allValue) => {
          if (tempData === 'option') {
            return (
              <div>
                <i className='c-link fg fg-trashcan' onClick={this.openDeleteAccount.bind(this, allValue.id, allValue.account)} title={c('txt-delete')} />
              </div>
            )
          } else {
            return <span>{value}</span>
          }
        }
      };
    })

    return (
      <div>
        <i className='c-link fg fg-add' onClick={this.openAddSshAccount} title={t('txt-add-account')}></i>
        <div className='table-data'>
          <DataTable
            fields={dataFields}
            data={sshData} />
        </div>
      </div>
    )
  }
  /**
   * Open Add SSH account
   * @method
   */
  openAddSshAccount = () => {
    this.setState({
      showAddSshAccount: true
    });
  }
  /**
   * Show SSH account dialog
   * @method
   */
  showSshAccountDialog = () => {
    const actions = {
      cancel: {text: c('txt-close'), handler: this.toggleSshDialog}
    };

    return (
      <ModalDialog
        id='showSshAccountDialog'
        className='modal-dialog'
        title={t('txt-addSshAccount')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displaySshAccount()}
      </ModalDialog>
    )
  }
  /**
   * Handle SSH account name input value change
   * @method
   * @param {string} event - event object
   */
  handleDataChange = (event) => {
    this.setState({
      sshAccountName: event.target.value
    });
  }
  /**
   * Display add SSH account content
   * @method
   * @returns HTML DOM
   */
  displayAddSshAccount = () => {
    const {sshAccountName, formValidation} = this.state;

    return (
      <TextField
        name='sshAccountName'
        label={c('txt-plsEnterName')}
        variant='outlined'
        fullWidth
        size='small'
        required
        error={!formValidation.sshAccountName.valid}
        helperText={formValidation.sshAccountName.valid ? '' : c('txt-required')}
        value={sshAccountName}
        onChange={this.handleDataChange} />
    )
  }
  /**
   * Display add SSH acount dialog
   * @method
   * @returns ModalDialog component
   */
  addSshAccountDialog = () => {
    const actions = {
      cancel: {text: c('txt-cancel'), className: 'standard', handler: this.closeAddSshAccount},
      confirm: {text: c('txt-confirm'), handler: this.confirmAddSshAccount}
    };

    return (
      <ModalDialog
        id='addSshAccountDialog'
        className='modal-dialog'
        title={t('txt-add-account')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayAddSshAccount()}
      </ModalDialog>
    )
  }
  /**
   * Handle add SSH account modal confirm
   * @method
   */
  confirmAddSshAccount = () => {
    const {baseUrl} = this.context;
    const {sshAccountName, formValidation} = this.state;
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (sshAccountName) {
      tempFormValidation.sshAccountName.valid = true;
    } else {
      tempFormValidation.sshAccountName.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    ah.one({
      url: `${baseUrl}/api/log/netproxy/sshaccount?account=${sshAccountName}`,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        this.setState({
          sshAccountName: '',
          showAddSshAccount: false
        });

        this.getSshAccountList();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Close add SSH account dialog
   * @method
   */
  closeAddSshAccount = () => {
    this.setState({
      sshAccountName: '',
      showAddSshAccount: false,
      formValidation: {
        sshAccountName: {
          valid: true
        },
        password: {
          valid: true
        }
      }
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {
      showFilter,
      userAccount,
      contextAnchor,
      menuType,
      currentAccountData,
      showSshAccount,
      showAddSshAccount,
      showNewPassword
    } = this.state;
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
        {showSshAccount &&
          this.showSshAccountDialog()
        }

        {showAddSshAccount &&
          this.addSshAccountDialog()
        }

        {showNewPassword &&
          this.showNewPasswordDialog()
        }

        {menuType === 'accountAdd' &&
          <Menu
            anchorEl={contextAnchor}
            keepMounted
            open={Boolean(contextAnchor)}
            onClose={this.handleCloseMenu}>
            <MenuItem id='accountAddLogs' onClick={this.showEditDialog.bind(this, null)}>{t('txt-syslogAccount')}</MenuItem>
            <MenuItem id='accountAddSsh' onClick={this.toggleSshDialog}>{t('txt-sshAccount')}</MenuItem>
          </Menu>
        }

        {menuType === 'accountOptions' &&
          <Menu
            anchorEl={contextAnchor}
            keepMounted
            open={Boolean(contextAnchor)}
            onClose={this.handleCloseMenu}>
            <MenuItem id='account-menu-edit' onClick={this.showEditDialog.bind(this, currentAccountData.accountid)}>{c('txt-edit')}</MenuItem>
            <MenuItem id='account-menu-delete' onClick={this.showDialog.bind(this, 'delete', currentAccountData, currentAccountData.accountid)}>{c('txt-delete')}</MenuItem>
            <MenuItem id='account-menu-reset' onClick={this.showResetPassword.bind(this, currentAccountData.account)}>{c('txt-resetPassword')}</MenuItem>
            {currentAccountData.isLock &&
              <MenuItem id='account-menu-unlock' onClick={this.showDialog.bind(this, 'unlock', currentAccountData, currentAccountData.accountid)}>{c('txt-unlock')}</MenuItem>
            }
          </Menu>
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button id='accountShowAd' variant='outlined' color='primary' onClick={this.showAdDialog.bind(this)} title={t('txt-ad-config')}><i className='fg fg-signage-ad'></i></Button>
            <Button id='accountShowAdd' variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, 'accountAdd', '')} title={t('txt-add-account')}><i className='fg fg-add'></i></Button>
            <Button id='accountShowFilter' variant='outlined' color='primary' className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={c('txt-filter')}><i className='fg fg-filter'></i></Button>
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
              <MuiTableContent
                data={userAccount}
                tableOptions={tableOptions} />
            </div>
          </div>
        </div>

        <AccountEdit
          ref={ref => { this.editor = ref }}
          onDone={this.getAccountsData} />

        <AdConfig ref={ref => { this.config = ref }} />
      </div>
    )
  }
}

AccountList.contextType = BaseDataContext;

AccountList.propTypes = {
};

export default AccountList;