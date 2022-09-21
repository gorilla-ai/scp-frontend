import React, {Component} from 'react'
import _ from 'lodash'
import i18n from 'i18next'
import PropTypes from 'prop-types'
import cx from 'classnames'
import im from 'object-path-immutable'
import queryString from 'query-string'

import Checkbox from '@material-ui/core/Checkbox'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormHelperText from '@material-ui/core/FormHelperText'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../../common/context'
import helper from '../../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const FORM_VALIDATION = {
  name: {
    valid: true
  },
  privileges: {
    valid: true
  }
};

const log = require('loglevel').getLogger('user/privileges/edit');
const t = i18n.getFixedT(null, 'privileges');
const c = i18n.getFixedT(null, 'connections');
const gt =  i18n.getFixedT(null, 'app');

const initialState = JSON.parse(document.getElementById('initial-state').innerHTML || '{}')
const {apiServerPrefix} = initialState.envCfg

const INITIAL_STATE = {
  open: false,
  info: null,
  error: false,
  permitsList: [],
  permitsSelected: [],
  name: '',
  privilegeid: '',
  formValidation: _.cloneDeep(FORM_VALIDATION)
};

/**
 * Account Privileges Edit
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the account privileges edit
 */
class PrivilegeEdit extends Component {
  constructor(props) {
    super(props);

    this.state = _.clone(INITIAL_STATE);
  }
  /**
   * Open privilege edit modal dialog and set data
   * @method
   * @param {object} privilege - selected privilege data
   */
  openPrivilegeEdit = (privilege) => {
    const permitsSelected = _.map(privilege.permits, val => {
      return val.permitid;
    });

    this.setState({
      open: true,
      name: privilege.name,
      privilegeid: privilege.privilegeid,
      permitsSelected
    }, () => {
      this.loadPermits();
    });
  }
  /**
   * Get and set privilege permits data
   * @method
   */
  loadPermits = () => {
    const {baseUrl} = this.context;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/account/permits`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const permitsList = _.map(data.rt, val => {
          return {
            value: val.permitid,
            text: c('txt-' + val.name)
          };
        });

        this.setState({
          permitsList
        });
      }
      return null;
    })
    .catch(err => {
      this.setState({
        error: true,
        info: err
      });
    })
  }
  /**
   * Handle close confirm and reset data
   * @method
   */
  close = () => {
    this.setState({
      open: false,
      info: null,
      error: false,
      permitsList: [],
      permitsSelected: [],
      name: '',
      privilegeid: '',
      formValidation: _.cloneDeep(FORM_VALIDATION)
    });
  }
  /**
   * Reset data and call onDone props funciton
   * @method
   */
  save = () => {
    this.setState(_.clone(INITIAL_STATE), () => {
      this.props.onDone();
    })
  }
  /**
   * Handle privilege edit confirm
   * @method
   */
  editPrivilege = () => {
    const {baseUrl} = this.context;
    const {name, permitsSelected, privilegeid, formValidation} = this.state;
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (name) {
      tempFormValidation.name.valid = true;
    } else {
      tempFormValidation.name.valid = false;
      validate = false;
    }

    if (permitsSelected.length > 0) {
      tempFormValidation.privileges.valid = true;
    } else {
      tempFormValidation.privileges.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate || !privilegeid) {
      return;
    }

    let permitIds = '';

    _.forEach(permitsSelected, val => {
      permitIds += '&permitIds=' + val;
    })

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/account/privilege/permits/v1?privilegeId=${privilegeid}&${permitIds}`,
      data: JSON.stringify({name}),
      type: 'PATCH',
      contentType: 'application/json'
    })
    .then(data => {
      this.save();
      return null;
    })
    .catch(err => {
      this.setState({
        error: true,
        info: err
      });
    })
  }
  /**
   * Handle textbox value change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }
  /**
   * Check if item is already in the selected list
   * @method
   * @param {string} val - checked item name
   * @returns boolean true/false
   */
  checkSelectedItem = (val) => {
    return _.includes(this.state.permitsSelected, val);
  }
  /**
   * Handle checkbox check/uncheck
   * @method
   * @param {object} event - event object
   */
  toggleCheckbox = (event) => {
    let permitsSelected = _.cloneDeep(this.state.permitsSelected);

    if (event.target.checked) {
      permitsSelected.push(event.target.name);
    } else {
      const index = permitsSelected.indexOf(event.target.name);
      permitsSelected.splice(index, 1);
    }

    this.setState({
      permitsSelected
    });
  }
  /**
   * Display role checkbox group
   * @method
   * @param {string} val - checkbox group
   * @param {number} i - index of the checkbox group
   * @returns FormControlLabel component
   */
  getRoleList = (val, i) => {
    const {name, privilegeid} = this.state;
    let showCheckbox = false;

    if (name.includes('SOC')){
      showCheckbox = true;
    }

    if (!val.text) return;


    if (val.text.includes('SOC') || privilegeid === 'DPIR-00000000-0000-0000-0000-000000000000') {
      return (
        <FormControlLabel
          className='privilege-checkbox'
          key={i}
          label={val.text}
          control={
            <Checkbox
              id={val.value}
              className='checkbox-ui'
              name={val.value}
              checked={this.checkSelectedItem(val.value)}
              disabled={!showCheckbox}
              onChange={this.toggleCheckbox}
              color='primary' />
          } />
      )
    } else {
      return (
        <FormControlLabel
          className='privilege-checkbox'
          key={i}
          label={val.text}
          control={
            <Checkbox
              id={val.value}
              className='checkbox-ui'
              name={val.value}
              checked={this.checkSelectedItem(val.value)}
              onChange={this.toggleCheckbox}
              color='primary' />
          } />
      )
    }
  }
  /**
   * Check disable status
   * @method
   * @param {string} name - role name
   * @returns boolean true/false
   */
  checkDisabled = (name) => {
    const roleList = ['SOC Analyzer', 'SOC Executor', 'SOC Supervior', 'SOC單位設備承辦人', 'SOC單位設備資安長', 'Default Admin Privilege'];

    if (_.includes(roleList, name)) {
      return true;
    }
  }
  /**
   * Display edit privilege content
   * @method
   * @returns HTML DOM
   */
  displayEditPrivilege = () => {
    const {permitsList, name, formValidation} = this.state;

    return (
      <div className='c-form'>
        <TextField
          id='privilegesEditRole'
          className='role-name'
          name='name'
          label={t('l-name')}
          variant='outlined'
          fullWidth
          size='small'
          required
          error={!formValidation.name.valid}
          helperText={formValidation.name.valid ? '' : c('txt-required')}
          value={name}
          onChange={this.handleDataChange}
          disabled={this.checkDisabled(name)} />
        <div className='group'>
          <FormControl
            required
            error={!formValidation.privileges.valid}>
            <FormLabel>{c('txt-privileges')}</FormLabel>
            <FormHelperText>{formValidation.privileges.valid ? '' : c('txt-required')}</FormHelperText>
            <FormGroup>
              {permitsList.map(this.getRoleList)}
            </FormGroup>
          </FormControl>
        </div>
      </div>
    )
  }
  render() {
    const {info, error, open} = this.state;
    const actions = {
      cancel: {text: gt('btn-cancel'), className: 'standard', handler: this.close.bind(this, false)},
      confirm: {text: gt('btn-ok'), handler: this.editPrivilege}
    };

    if (!open) {
      return null;
    }

    return (
      <ModalDialog
        id='privilegeEditDialog'
        className='modal-dialog'
        title={t('dlg-edit-privilege')}
        draggable={true}
        global={true}
        info={info}
        infoClassName={cx({'c-error': error})}
        closeAction='cancel'
        actions={actions}>
        {this.displayEditPrivilege()}
      </ModalDialog>
    )
  }
}

PrivilegeEdit.contextType = BaseDataContext;

PrivilegeEdit.defaultProps = {
};

export default PrivilegeEdit;