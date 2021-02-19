import React, {Component} from 'react'
import _ from 'lodash'
import i18n from 'i18next'
import PropTypes from 'prop-types';
import cx from 'classnames'
import im from 'object-path-immutable'
import queryString from 'query-string'

import Checkbox from '@material-ui/core/Checkbox';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../../common/context';
import helper from '../../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

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
  formValidation: {
    name: {
      valid: true
    },
    privileges: {
      valid: true
    }
  }
};

/**
 * Account Privileges Edit
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
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
   * Get locale name for module
   * @method
   * @param {string} name - module name
   * @returns locale name
   */
  getLocaleName = (name) => {
    if (name === 'Common Module') {
      return c('txt-commonModule');
    }
    if (name === 'Configuration Module') {
      return c('txt-configModule');
    }
    if (name === 'SOC Module') {
      return c('txt-socModule');
    }
  }
  /**
   * Get and set privilege permits data
   * @method
   */
  loadPermits = () => {
    const {baseUrl} = this.context;

    ah.one({
      url: `${baseUrl}/api/account/permits`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const permitsList = _.map(data.rt, val => {
          return {
            value: val.permitid,
            text: this.getLocaleName(val.dispname)
          }
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
      formValidation: {
        name: {
          valid: true
        },
        privileges: {
          valid: true
        }
      }
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
   * @returns HTML DOM
   */
  getRoleList = (val, i) => {
    const {name} = this.state;
    let showCheckbox = false
    if (name === 'SOC Analyzer'|| name === 'SOC Executor'|| name === 'SOC Supervior'|| name === 'SOC Supervisor'){
      showCheckbox =true
    }

    if (val.text.includes('SOC')){
      return (
          <FormControlLabel
              key={i}
              label={val.text}
              control={
                <Checkbox
                    className='checkbox-ui'
                    name={val.value}
                    checked={this.checkSelectedItem(val.value)}
                    disabled={!showCheckbox}
                    onChange={this.toggleCheckbox}
                    color='primary' />
              } />
      )
    }else{
      return (
          <FormControlLabel
              key={i}
              label={val.text}
              control={
                <Checkbox
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
   * Display edit privilege content
   * @method
   * @returns HTML DOM
   */
  displayEditPrivilege = () => {
    const {permitsList, name, formValidation} = this.state;

    return (
      <div className='c-form'>
        <TextField
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
          disabled={name==='SOC Analyzer'||name==='SOC Executor'||name==='SOC Supervior'||name==='SOC Supervisor'}
          onChange={this.handleDataChange} />
        <div className='group'>
          <FormControl
            required
            error={!formValidation.privileges.valid}>
            <FormLabel>{c('txt-privileges')}</FormLabel>
            <FormGroup>
              {permitsList.map(this.getRoleList)}
            </FormGroup>
            <FormHelperText>{formValidation.privileges.valid ? '' : c('txt-required')}</FormHelperText>
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