import React, {Component} from 'react'
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash'
import i18n from 'i18next'
import PropTypes from 'prop-types';
import cx from 'classnames'
import im from 'object-path-immutable'
import queryString from 'query-string'

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
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
  permitsOptions: {},
  permitsSelected: [],
  name: '',
  privilegeid: ''
};

const StyledTextField = withStyles({
  root: {
    backgroundColor: '#fff',
    '& .Mui-disabled': {
      backgroundColor: '#f2f2f2'
    }
  }
})(TextField);

function TextFieldComp(props) {
  return (
    <StyledTextField
      id={props.id}
      className={props.className}
      name={props.name}
      type={props.type}
      label={props.label}
      multiline={props.multiline}
      rows={props.rows}
      maxLength={props.maxLength}
      variant={props.variant}
      fullWidth={props.fullWidth}
      size={props.size}
      InputProps={props.InputProps}
      required={props.required}
      value={props.value}
      onChange={props.onChange}
      disabled={props.disabled} />
  )
}

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
    this.setState({
      open: true,
      name: privilege.name,
      privilegeid: privilege.privilegeid,
      permitsSelected: privilege.permits
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

        let permitsOptions = {};

        _.forEach(data.rt, val => {
          permitsOptions[val.permitid] = false;
        });

        _.forEach(this.state.permitsSelected, val => {
          permitsOptions[val.permitid] = true;
        })

        this.setState({
          permitsList,
          permitsOptions
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
    this.setState(_.clone(INITIAL_STATE));
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
    const {name, permitsOptions, privilegeid} = this.state;

    if (!privilegeid) {
      return;
    }

    let permitIds = '';

    _.forEach(permitsOptions, (val, key) => {
      if (val) {
        permitIds += '&permitIds=' + key;
      }
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
   * Handle checkboxgroup value change
   * @method
   * @param {object} event - event object
   */
  handleCheckboxChange = (event) => {
    let tempPermitsOptions = {...this.state.permitsOptions}
    tempPermitsOptions[event.target.name] = event.target.checked;

    this.setState({
      permitsOptions: tempPermitsOptions
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
    return (
      <div className='option' key={i}>
        <FormControlLabel
          key={i}
          label={val.text}
          control={
            <Checkbox
              name={val.value}
              checked={this.state.permitsOptions[val.value]}
              onChange={this.handleCheckboxChange}
              color='primary' />
          } />
      </div>
    )
  }
  /**
   * Display edit privilege content
   * @method
   * @returns HTML DOM
   */
  displayEditPrivilege = () => {
    const {permitsList, name} = this.state;

    return (
      <div className='c-form'>
        <div>
          <TextFieldComp
            name='name'
            label={t('l-name')}
            variant='outlined'
            fullWidth={true}
            size='small'
            value={name}
            onChange={this.handleDataChange} />
        </div>
        <div className='group'>
          {permitsList.map(this.getRoleList)}
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
        infoClassName={cx({'c-error':error})}
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