import React, {Component} from 'react'
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash'
import i18n from 'i18next'
import PropTypes from 'prop-types';
import cx from 'classnames'

import TextField from '@material-ui/core/TextField';

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../../common/context';
import helper from '../../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const log = require('loglevel').getLogger('privileges')
const t = i18n.getFixedT(null, 'privileges');
const gt = i18n.getFixedT(null, 'app');
const et =  i18n.getFixedT(null, 'errors');

const INITIAL_STATE = {
  open: false,
  info: null,
  error: false,
  name: ''
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
      error={props.required}
      helperText={props.helperText}
      value={props.value}
      onChange={props.onChange}
      disabled={props.disabled} />
  )
}

/**
 * Account Privileges Add
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the account privileges add
 */
class PrivilegeAdd extends Component {
  constructor(props) {
    super(props);

    this.state = _.clone(INITIAL_STATE);
  }
  /**
   * Open privilege add modal dialog
   * @method
   */
  openPrivilegeAdd = () => {
    this.setState({
      open: true
    });
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
    });
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
  /**
   * Handle privilege add input value change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }
  /**
   * Handle add privilege confirm
   * @method
   */
  addPrivilege = () => {
    const {baseUrl} = this.context;
    const {name} = this.state;
    const reqArg = {
      name
    };

    if (name !== '') {
      ah.one({
        url: `${baseUrl}/api/account/privilege`,
        data: JSON.stringify(reqArg),
        type: 'POST',
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
    } else {
      this.setState({
        error: true,
        info: et('fill-required-fields')
      });
    }
  }
  /**
   * Display add privilege content
   * @method
   * @returns HTML DOM
   */
  displayAddPrivilege = () => {
    return (
      <div className='c-flex fdc dialog-width'>
        <TextFieldComp
          name='name'
          variant='outlined'
          fullWidth={true}
          size='small'
          value={this.state.name}
          onChange={this.handleDataChange} />
      </div>
    )
  }
  render() {
    const {info, error, open} = this.state;
    const actions = {
      cancel: {text:gt('btn-cancel'), className: 'standard', handler: this.close},
      confirm: {text:gt('btn-ok'), handler: this.addPrivilege}
    };

    if (!open) {
      return null;
    }

    return (
      <ModalDialog
        id='privilegeAddDialog'
        className='modal-dialog'
        title={t('dlg-add-privilege')}
        draggable={true}
        global={true}
        info={info}
        infoClassName={cx({'c-error':error})}
        closeAction='cancel'
        actions={actions}>
        {this.displayAddPrivilege()}
      </ModalDialog>
    )
  }
}

PrivilegeAdd.contextType = BaseDataContext;

PrivilegeAdd.defaultProps = {
};

export default PrivilegeAdd;