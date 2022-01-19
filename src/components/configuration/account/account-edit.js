import React, {Component} from 'react'
import _ from 'lodash'
import cx from 'classnames'
import i18n from 'i18next'
import PropTypes from 'prop-types'
import queryString from 'query-string'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Checkbox from '@material-ui/core/Checkbox'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormHelperText from '@material-ui/core/FormHelperText'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const EMAIL_PATTERN = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const log = require('loglevel').getLogger('accounts/account-edit')
const t = i18n.getFixedT(null, 'accounts');
const gt = i18n.getFixedT(null, 'app');
const c = i18n.getFixedT(null, 'connections');
const et =  i18n.getFixedT(null, 'errors');

const INITIAL_STATE = {
  open: false,
  id: '',
  info: null,
  error: false,
  accountData: {
    account: '',
    name: '',
    email: '',
    unit: {},
    title: {},
    phone: '',
    syncAD: false,
    selected: []
  },
  ownerList: [],
  fromPage: '',
  privileges: [],
  showPrivileges: true,
  selectedPrivileges: [],
  selectedOwner: {},
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
    owner: {
      valid: true
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
      fromPage: options,
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
   * Get and set account privileges
   * @method
   */
  loadPrivileges = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/account/privileges?accountModule=true`
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
   * Get and set account data
   * @method
   * @param {string} id - selected account ID
   */
  loadAccount = (id) => {
    const {baseUrl} = this.context;
    const {list} = this.props;

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
          phone: data[0].rt.phone,
          ownerId: data[0].rt.ownerId,
          selected: _.map(data[1].rt, 'privilegeid')
        };

        const selectedDepartmentIndex = _.findIndex(list.department, { 'value': data[0].rt.unit });
        const selectedTitleIndex = _.findIndex(list.title, { 'value': data[0].rt.title });

        if (selectedDepartmentIndex >= 0) {
          accountData.unit = list.department[selectedDepartmentIndex];
        }

        if (selectedTitleIndex >= 0) {
          accountData.title = list.title[selectedTitleIndex];
        }

        this.setState({
          accountData,
          selectedPrivileges: _.cloneDeep(accountData.selected)
        }, () => {
          if (!_.isEmpty(accountData.unit)) {
            this.getOwnerData(id);
          }
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
   * Get and set owner data
   * @method
   * @param {string} id - selected account ID
   */
  getOwnerData = (id) => {
    const {baseUrl} = this.context;
    const {accountData} = this.state;
    const requestData = {
      accountId : id,
      department: accountData.unit.value,
      getUnusedOwner: true
    };

    this.ah.one({
      url: `${baseUrl}/api/owner/_search`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        if (data.rows.length > 0) {
          const sortedOwnerList = _.orderBy(data.rows, ['ownerName'], ['asc']);
          let ownerList = [];

          _.forEach(sortedOwnerList, val => {
            ownerList.push({
              value: val.ownerUUID,
              text: val.ownerName,
              department: val.department,
              title: val.title
            });
          })

          this.setState({
            ownerList
          }, () => {
            this.setOwnerInfo();
          });
        } else {
          let tempAccountData = {...accountData};
          tempAccountData.title = {};

          this.setState({
            accountData: tempAccountData,
            ownerList: [],
            selectedOwner: {}
          });
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set owner info
   * @method
   */
  setOwnerInfo = () => {
    const {list, currentAccountData} = this.props;
    const {accountData, ownerList, fromPage} = this.state;
    let tempAccountData = {...accountData};
    let ownerId = '';

    if (fromPage === 'fromHeader') {
      ownerId = accountData.ownerId;
    } else if (fromPage === 'fromAccount') {
      ownerId = currentAccountData.ownerId;
    }

    const selectedOwnerIndex = _.findIndex(ownerList, { 'value': ownerId });
    let selectedTitleIndex = '';

    if (selectedOwnerIndex >= 0) {
      selectedTitleIndex = _.findIndex(list.title, { 'value': ownerList[selectedOwnerIndex].title });
      tempAccountData.title = list.title[selectedTitleIndex];
    } else {
      tempAccountData.title = {};
    }

    this.setState({
      accountData: tempAccountData,
      selectedOwner: ownerList[selectedOwnerIndex]
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
   * Handle owner combo box change
   * @method
   * @param {string} type - comboBox type ('department', 'owner' or 'title')
   * @param {object} event - select event
   * @param {object} value - selected owner info
   */
  handleComboBoxChange = (type, event, value) => {
    const {list} = this.props;
    const {accountData, ownerList} = this.state;
    let tempAccountData = {...accountData};

    if (value && value.value) {
      if (type === 'department') {
        const selectedDepartmentIndex = _.findIndex(list.department, { 'value': value.value });

        if (selectedDepartmentIndex >= 0) {
          tempAccountData.unit = list.department[selectedDepartmentIndex];

          this.setState({
            accountData: tempAccountData
          }, () => {
            this.getOwnerData();
          });
        }
      } else if (type === 'owner') {
        const selectedOwnerIndex = _.findIndex(ownerList, { 'value': value.value });

        if (selectedOwnerIndex >= 0) {
          const selectedTitleIndex = _.findIndex(list.title, { 'value': ownerList[selectedOwnerIndex].title });
          tempAccountData.title = list.title[selectedTitleIndex];

          this.setState({
            accountData: tempAccountData,
            selectedOwner: ownerList[selectedOwnerIndex]
          });
        }
      } else if (type === 'title') {
        const selectedTitleIndex = _.findIndex(list.title, { 'value': value.value });

        if (selectedTitleIndex >= 0) {
          tempAccountData.title = list.title[selectedTitleIndex];

          this.setState({
            accountData: tempAccountData
          });
        }
      }
    }
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
    const {list} = this.props;
    const {id, accountData, ownerList, privileges, showPrivileges, selectedOwner, formValidation} = this.state;
    const titleList = ownerList.length > 0 ? list.title : [];

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
            <Autocomplete
              id='account-edit-unit'
              className='combo-box'
              options={list.department}
              value={accountData.unit || ''}
              getOptionLabel={(option) => option.text}
              renderInput={(params) => (
                <TextField {...params} label={t('l-unit') + ' *'} variant='outlined' size='small' />
              )}
              onChange={this.handleComboBoxChange.bind(this, 'department')} />
            <div className='error-msg'>{formValidation.unit.valid ? '' : c('txt-required')}</div>
          </div>
          {id &&
            <div className='group'>
              <Autocomplete
                className='combo-box'
                options={ownerList}
                value={selectedOwner || ''}
                getOptionLabel={(option) => option.text}
                renderInput={(params) => (
                  <TextField {...params} label={c('ownerFields.ownerName') + ' *'} variant='outlined' size='small' />
                )}
                onChange={this.handleComboBoxChange.bind(this, 'owner')} />
              <div className='error-msg'>{formValidation.owner.valid ? '' : c('txt-required')}</div>
            </div>
          }
          <div className='group'>
            <Autocomplete
              id='account-edit-title'
              className='combo-box'
              options={titleList}
              value={accountData.title || ''}
              getOptionLabel={(option) => option.text}
              renderInput={(params) => (
                <TextField {...params} label={t('l-title') + ' *'} variant='outlined' size='small' />
              )}
              onChange={this.handleComboBoxChange.bind(this, 'title')} />
            <div className='error-msg'>{formValidation.title.valid ? '' : c('txt-required')}</div>
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
        </div>
        {showPrivileges &&
          <div className='group privileges-list'>
            <FormControl
              required
              error={!formValidation.privileges.valid}>
              <FormLabel>{t('l-privileges')}</FormLabel>
              <FormHelperText>{formValidation.privileges.valid ? '' : c('txt-required')}</FormHelperText>
              <FormGroup>
                {privileges.map(this.showPrivilegesList)}
              </FormGroup>
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
    const {id, accountData, showPrivileges, selectedPrivileges, selectedOwner, formValidation} = this.state;
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

    if (id && selectedOwner && selectedOwner.value) {
      tempFormValidation.owner.valid = true;
      tempFormValidation.owner.msg = '';
    } else {
      tempFormValidation.owner.valid = false;
      validate = false;
    }

    if (accountData.unit && accountData.unit.value) {
      tempFormValidation.unit.valid = true;
      tempFormValidation.unit.msg = '';
    } else {
      tempFormValidation.unit.valid = false;
      validate = false;
    }

    if (accountData.title && accountData.title.value) {
      tempFormValidation.title.valid = true;
      tempFormValidation.title.msg = '';
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

    const formattedAccountData = _.omit(accountData, 'selected');
    let requestData = {
      ...formattedAccountData,
      unit: accountData.unit.value,
      title: accountData.title.value
    };

    if (id && selectedOwner) {
      requestData.ownerId = selectedOwner.value;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
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
  list: PropTypes.object.isRequired,
  currentAccountData: PropTypes.object,
  onDone: PropTypes.func.isRequired
};

export default AccountEdit;