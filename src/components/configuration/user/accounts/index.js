import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import i18n from 'i18next'
import cx from 'classnames'
import _ from 'lodash'

import DataTable from 'react-ui/build/src/components/table'
import Input from 'react-ui/build/src/components/input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import AccountEdit from './account-edit'
import {HocConfig as Config} from '../../../common/configuration'
import helper from '../../../common/helper'
import RowMenu from '../../../common/row-menu'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const log = require('loglevel').getLogger('user/accounts')
const c = i18n.getFixedT(null, 'connections');
const t = i18n.getFixedT(null, 'accounts');
const gt =  i18n.getFixedT(null, 'app');

class AccountList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      originalAccountData: [],
      accountData: [],
      param: {
        name: '',
        account: ''
      },
      accountID: '',
      formFields: {},
      dataFields: {},
      openFilter: false
    };
  }
  componentDidMount() {
    this.loadAccounts();
    this.getFormFields();
  }
  handleChange = (param) => {
    this.setState({
      param
    });
  }
  loadAccounts = () => {
    const {baseUrl} = this.props;

    ah.one({
      url: `${baseUrl}/api/account/_search`,
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      const accountData = data.rt.rows;
      const dataFields = {
        _menu: {label: '', sortable: null, formatter: (val, allValue) => {
          return <RowMenu
            page='accounts'
            active={val}
            targetEdit={allValue.accountid}
            targetDelete={allValue.accountid}
            targetUnlock={allValue.accountid}
            text={{
              edit: c('txt-edit'),
              delete: c('txt-delete'),
              unlock: c('txt-unlock')
            }}
            onEdit={this.showEditDialog}
            onDelete={this.showDeleteDialog.bind(this, allValue)}
            onUnlock={this.showUnlockDialog.bind(this, allValue)} />
        }},
        accountid: {label: 'ID', hide: true},
        account: {label: t('l-account'), sortable: null},
        name: {label: t('l-name'), sortable: null},
        email: {label: t('l-email'), sortable: null},
        unit: {label: t('l-unit'), sortable: null},
        title: {label: t('l-title'), sortable: null},
        phone: {label: t('l-phone'), sortable: null}
      };

      this.setState({
        originalAccountData: _.cloneDeep(accountData),
        accountData,
        dataFields
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
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
  filterData = () => {
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
  getFormFields = () => {
    const formFields = {
      account: {
        label: t('l-account'),
        editor: Input,
        props: {
          id:'search-account',
          placeholder:t('ph-account')
        }
      },
      name: {
        label: t('l-name'),
        editor: Input,
        props: {
          placeholder:t('ph-name')
        }
      }
    };

    this.setState({
      formFields
    });
  }
  showEditDialog = (id) => {
    this.editor._component.open(id);
  }
  getAccountMsgContent = (allValue, id, type) => {
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
      <div className='content delete'>
        <span>{msg}?</span>
      </div>
    )
  }
  showDeleteDialog = (allValue, id) => {
    PopupDialog.prompt({
      title: c('txt-deleteAccount'),
      id: 'modalWindowSmall',
      confirmText: c('txt-delete'),
      cancelText: c('txt-cancel'),
      display: this.getAccountMsgContent(allValue, id, 'delete'),
      act: (confirmed) => {
        if (confirmed) {
          this.accountAction('delete');
        }
      }
    });
  }
  showUnlockDialog = (allValue, id) => {
    PopupDialog.prompt({
      title: c('txt-unlockAccount'),
      id: 'modalWindowSmall',
      confirmText: c('txt-delete'),
      cancelText: c('txt-cancel'),
      display: this.getAccountMsgContent(allValue, id, 'unlock'),
      act: (confirmed) => {
        if (confirmed) {
          this.accountAction('unlock');
        }
      }
    });
  }
  accountAction = (type) => {
    const {baseUrl} = this.props;
    const {accountID} = this.state;

    if (type === 'delete') {
      ah.one({
        url: `${baseUrl}/api/account/?accountid=${accountID}`,
        type: 'DELETE'
      })
      .then(() => {
        this.loadAccounts();
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
        PopupDialog.alertId('modalWindowSmall', {
          id: 'modalWindowSmall',
          confirmText: c('txt-confirm'),
          display: t('txt-unlockAccountSuccess')
        });
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
  }
  handleSearchChange = (type, value) => {
    let tempParam = {...this.state.param}
    tempParam[type] = value.trim()

    this.setState({
      param: tempParam
    });
  }
  setFilter = (flag) => {
    this.setState({
      openFilter: flag
    });
  }
  clearFilter = () => {
    this.setState({
      param: {
        name: '',
        account: ''
      }
    });
  }
  renderFilter = () => {
    const {param, openFilter} = this.state

    return (
      <div className={cx('main-filter', {'active': openFilter})}>
        <i className='fg fg-close' onClick={this.setFilter.bind(this, false)} title={t('txt-close')}></i>
        <div className='header-text'>{c('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='account' >{t('l-account')}</label>
            <Input id='account' placeholder={t('ph-account')} onChange={this.handleSearchChange.bind(this, 'account')} value={param.account} />
          </div>
          <div className='group'>
            <label htmlFor='name'>{t('l-name')}</label>
            <Input id='name' placeholder={t('ph-name')} onChange={this.handleSearchChange.bind(this, 'name')} value={param.name} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.filterData}>{c('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter}>{c('txt-clear')}</button>
        </div>
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot, language, locale, session} = this.props;
    const {accountData, dataFields, openFilter} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button onClick={this.showEditDialog.bind(this, null)} title={t('txt-add-account')}><i className='fg fg-add'></i></button>
            <button className={cx('last', {'active': openFilter})} onClick={this.setFilter.bind(this, !openFilter)} title={c('txt-filter')}><i className='fg fg-filter'></i></button>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            locale={locale}
            session={session} />

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
          baseUrl={baseUrl}
          contextRoot={contextRoot}
          session={session}
          ref={ref => { this.editor = ref }}
          onDone={this.loadAccounts} />
      </div>
    )
  }
}

AccountList.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

export default AccountList;