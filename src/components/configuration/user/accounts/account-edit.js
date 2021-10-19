import React, {Component} from 'react'
import _ from 'lodash'
import cx from 'classnames'
import i18n from 'i18next'
import PropTypes from 'prop-types'
import queryString from 'query-string'

import Checkbox from '@material-ui/core/Checkbox'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormHelperText from '@material-ui/core/FormHelperText'
import MenuItem from '@material-ui/core/MenuItem'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../../common/context'
import helper from '../../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const EMAIL_PATTERN = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const log = require('loglevel').getLogger('accounts/account-edit')
const t = i18n.getFixedT(null, 'accounts');
const gt = i18n.getFixedT(null, 'app');
const c = i18n.getFixedT(null, 'connections');
const et =  i18n.getFixedT(null, 'errors');

const INITIAL_STATE = {
  open: false,
  info: null,
  error: false,
  accountData: {
    account: '',
    name: '',
    email: '',
    unit: '',
    title: '',
    phone: '',
    syncAD: false,
    selected: []
  },
  privileges: [],
  showPrivileges: true,
  selectedPrivileges: [],
  formValidation: {
    account: {
      valid: true
    },
    name: {
      valid: true
    },
    email: {
      valid: true,
      msg: ''
    },
    unit: {
      valid: true
    },
    title: {
      valid: true
    },
    phone: {
      valid: true
    },
    privileges: {
      valid: true
    }
  }
};

/**
 * AccountEdit
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show account edit form
 */
class AccountEdit extends Component {
  constructor(props) {
    super(props);

    this.state = _.cloneDeep(INITIAL_STATE);

    this.ah = getInstance('chewbacca');
  }
  /**
   * Get and set account data
   * @method
   * @param {string} id - selected account ID
   */
  loadAccount = (id) => {
    const {baseUrl} = this.context;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.all([
      {
        url: `${baseUrl}/api/account/v1?accountid=${id}`,
        type:'GET'
      },
      {
        url: `${baseUrl}/api/account/privileges?accountId=${id}`,
        type:'GET'
      }
    ])
    .then(data => {
      if (data) {
        let accountData = {
          accountid: data[0].rt.accountid,
          account: data[0].rt.account,
          name: data[0].rt.name,
          email: data[0].rt.email,
          unit: data[0].rt.unit,
          title: data[0].rt.title,
          phone: data[0].rt.phone,
          selected: _.map(data[1].rt, 'privilegeid')
        };

        this.setState({
          accountData,
          selectedPrivileges: _.cloneDeep(accountData.selected)
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', c('txt-error'), err.message);
      this.close();
    })
  }
  /**
   * Get and set account privileges
   * @method
   */
  loadPrivileges = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/account/privileges`
    })
    .then(data => {
      if (data) {
        const privileges = _.map(data, el => {
          return {
            value: el.privilegeid,
            text: el.name
          };
        })

        this.setState({
          privileges
        });
      }
      return null;
    })
  }
  /**
   * Open account add/edit modal dialog
   * @method
   * @param {string} id - selected account ID
   * @param {string} options - option for 'fromHeader' or 'fromAccount'
   */
  openAccount = (id, options) => {
    let showPrivileges = true;

    if (options === 'fromHeader') {
      showPrivileges = false;
    }

    this.setState({
      open: true,
      id,
      showPrivileges,
      selectedPrivileges: []
    }, () => {
      this.loadPrivileges();
      
      if (id) {
       this.loadAccount(id);
      }
    });
  }
  /**
   * Check if item is already in the selected list
   * @method
   * @param {string} val - checked item name
   * @returns boolean true/false
   */
  checkSelectedItem = (val) => {
    return _.includes(this.state.selectedPrivileges, val);
  }
  /**
   * Handle checkbox check/uncheck
   * @method
   * @param {object} event - event object
   */
  toggleCheckbox = (event) => {
    let selectedPrivileges = _.cloneDeep(this.state.selectedPrivileges);

    if (event.target.checked) {
      selectedPrivileges.push(event.target.name);
    } else {
      const index = selectedPrivileges.indexOf(event.target.name);
      selectedPrivileges.splice(index, 1);
    }

    this.setState({
      selectedPrivileges
    });
  }
  /**
   * Display checkbox for privilege
   * @method
   * @param {object} val - individual privilege
   * @param {number} i - index of the privilege
   * @returns HTML DOM
   */
  showPrivilegesList = (val, i) => {
    let acc = `account-edit-check-${i}`

    return (
      <FormControlLabel
        key={i}
        label={val.text}
        control={
          <Checkbox
            id={acc}
            className='checkbox-ui'
            name={val.value}
            checked={this.checkSelectedItem(val.value)}
            onChange={this.toggleCheckbox}
            color='primary' />
        } />
    )
  }
  /**
   * Handle account edit form change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempAccountData = {...this.state.accountData};
    tempAccountData[event.target.name] = event.target.value;

    this.setState({
      accountData: tempAccountData
    });
  }
  /**
   * Toggle sync data
   * @method
   * @param {object} event - event object
   */
  handleSyncAdChange = (event) => {
    let tempAccountData = {...this.state.accountData};
    tempAccountData.syncAD = event.target.checked;

    this.setState({
      accountData: tempAccountData
    });
  }
  /**
   * Set content width
   * @method
   * @returns content width
   */
  getContentWidth = () => {
    const {showPrivileges} = this.state;

    if (showPrivileges) {
      return { width: '610px', overflow: 'hidden' };
    } else {
      return { width: '350px', overflow: 'hidden' };
    }
  }
  /**
   * Display account edit content
   * @method
   * @returns HTML DOM
   */
  displayAccountsEdit = () => {
    const {
      id,
      accountData,
      privileges,
      showPrivileges,
      formValidation
    } = this.state;

    return (
      <div className='account-form' style={this.getContentWidth()}>
        <div className={cx('basic-info', {'more': showPrivileges && privileges.length > 0})}>
          <div className='group'>
            <TextField
              id='account-edit-account'
              name='account'
              label={t('l-account')}
              variant='outlined'
              fullWidth
              size='small'
              required
              error={!formValidation.account.valid}
              helperText={formValidation.account.valid ? '' : c('txt-required')}
              value={accountData.account}
              onChange={this.handleDataChange}
              disabled={id} />
          </div>
          <div className='group'>
            <TextField
              id='account-edit-name'
              name='name'
              label={t('l-name')}
              variant='outlined'
              fullWidth
              size='small'
              required
              error={!formValidation.name.valid}
              helperText={formValidation.name.valid ? '' : c('txt-required')}
              value={accountData.name}
              onChange={this.handleDataChange} />
          </div>
          <div className='group'>
            <TextField
              id='account-edit-email'
              name='email'
              label={t('l-email')}
              variant='outlined'
              fullWidth
              size='small'
              error={!formValidation.email.valid}
              helperText={formValidation.email.msg}
              required
              value={accountData.email}
              onChange={this.handleDataChange} />
          </div>
          <div className='group'>
            <TextField
              id='account-edit-unit'
              name='unit'
              label={t('l-unit')}
              variant='outlined'
              fullWidth
              size='small'
              required
              error={!formValidation.unit.valid}
              helperText={formValidation.unit.valid ? '' : c('txt-required')}
              value={accountData.unit}
              onChange={this.handleDataChange} />
          </div>
          <div className='group'>
            <TextField
              id='account-edit-title'
              name='title'
              label={t('l-title')}
              variant='outlined'
              fullWidth
              size='small'
              required
              error={!formValidation.title.valid}
              helperText={formValidation.title.valid ? '' : c('txt-required')}
              value={accountData.title}
              onChange={this.handleDataChange} />
          </div>
          <div className='group'>
            <TextField
              id='account-edit-phone'
              name='phone'
              label={t('l-phone')}
              variant='outlined'
              fullWidth
              size='small'
              required
              error={!formValidation.phone.valid}
              helperText={formValidation.phone.valid ? '' : c('txt-required')}
              value={accountData.phone}
              onChange={this.handleDataChange} />
          </div>
          {!id &&
            <FormControlLabel
              className='switch-control'
              control={
                <Switch
                  checked={accountData.syncAD}
                  onChange={this.handleSyncAdChange}
                  color='primary' />
              }
              label='Sync AD' />
          }
        </div>
        {showPrivileges &&
          <div className='group privileges-list'>
            <FormControl
              required
              error={!formValidation.privileges.valid}>
              <FormLabel>{t('l-privileges')}</FormLabel>
              <FormGroup>
                {privileges.map(this.showPrivilegesList)}
              </FormGroup>
              <FormHelperText>{formValidation.privileges.valid ? '' : c('txt-required')}</FormHelperText>
            </FormControl>
          </div>
        }
      </div>
    )
  }
  /**
   * Handle save account confirm
   * @method
   */
  saveAccount = () => {
    const {baseUrl} = this.context;
    const {id, accountData, showPrivileges, selectedPrivileges, formValidation} = this.state;
    const url = `${baseUrl}/api/account/v1`;
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (accountData.account) {
      tempFormValidation.account.valid = true;
    } else {
      tempFormValidation.account.valid = false;
      validate = false;
    }

    if (accountData.name) {
      tempFormValidation.name.valid = true;
    } else {
      tempFormValidation.name.valid = false;
      validate = false;
    }

    if (accountData.email) {
      if (EMAIL_PATTERN.test(accountData.email)) { //Check email format
        tempFormValidation.email.valid = true;
        tempFormValidation.email.msg = '';
      } else {
        tempFormValidation.email.valid = false;
        tempFormValidation.email.msg = t('txt-email-invalid');
        validate = false;
      }
    } else {
      tempFormValidation.email.valid = false;
      tempFormValidation.email.msg = c('txt-required');
      validate = false;
    }

    if (accountData.unit) {
      tempFormValidation.unit.valid = true;
    } else {
      tempFormValidation.unit.valid = false;
      validate = false;
    }

    if (accountData.title) {
      tempFormValidation.title.valid = true;
    } else {
      tempFormValidation.title.valid = false;
      validate = false;
    }

    if (accountData.phone) {
      tempFormValidation.phone.valid = true;
    } else {
      tempFormValidation.phone.valid = false;
      validate = false;
    }

    if (showPrivileges) {
      if (selectedPrivileges.length > 0) {
        tempFormValidation.privileges.valid = true;
        accountData.selected = selectedPrivileges;
      } else {
        tempFormValidation.privileges.valid = false;
        validate = false;
      }
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    this.ah.one({
      url,
      data: JSON.stringify(_.omit(accountData, 'selected')),
      type: id ? 'PATCH' : 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data) {
        const resId = id || data || data.rt;

        this.setState({
          id: resId
        }, () => {
          if (showPrivileges) {
            this.savePrivileges();
          } else {
            this.close();
            this.props.onDone();
          }
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', c('txt-error'), err.message);
    })
  }
  /**
   * Handle save privileges confirm
   * @method
   */
  savePrivileges = () => {
    const {baseUrl} = this.context;
    const {id, accountData:{selected}} = this.state;

    if (!id) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/account/privileges?accountId=${id}&${queryString.stringify({privilegeIds:selected})}`,
      type: 'PATCH',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      this.setState(
        _.cloneDeep(INITIAL_STATE), () => {
        this.props.onDone();
      });
      return null;
    })
    .catch(err => {
      this.setState({
        error: true,
        info: err.message
      })
    })
  }
  /**
   * Handle close confirm and reset data
   * @method
   */
  close = () => {
    this.setState(
      _.cloneDeep(INITIAL_STATE)
    );
  }
  /**
   * Set form error message
   * @method
   * @param {string} msg - error message
   */
  error = (msg) => {
    this.setState({
      info: msg,
      error: true
    });
  }
  render() {
    const {id, info, error, open} = this.state;
    const actions = {
      cancel: {text: gt('btn-cancel'), className: 'standard', handler: this.close},
      confirm: {text: gt('btn-ok'), handler: this.saveAccount}
    };

    if (!open) {
      return null
    }

    return (
      <ModalDialog
        id='accountEditDialog'
        className='modal-dialog'
        title={id ? t('dlg-edit') : t('dlg-add')}
        draggable
        global
        info={info}
        infoClassName={cx({'c-error': error})}
        closeAction='cancel'
        actions={actions}>
        {this.displayAccountsEdit()}
      </ModalDialog>
    )
  }
}

AccountEdit.contextType = BaseDataContext;

AccountEdit.propTypes = {
  onDone: PropTypes.func.isRequired
};

AccountEdit.defaultProps = {
};

export default AccountEdit;