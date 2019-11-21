import React, {Component} from 'react'
import _ from 'lodash'
import i18n from 'i18next'
import PropTypes from 'prop-types';
import cx from 'classnames'
import queryString from 'query-string'

import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'

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
   * @param none
   * @returns none
   */
  openPrivilegeAdd = () => {
    this.setState({
      open: true
    });
  }
  /**
   * Handle close confirm and reset data
   * @method
   * @param none
   * @returns none
   */
  close = () => {
    this.setState(_.clone(INITIAL_STATE));
  }
  /**
   * Reset data and call onDone props funciton
   * @method
   * @param none
   * @returns none
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
   * @returns none
   */
  error = (msg) => {
    this.setState({
      info:msg,
      error:true
    });
  }
  /**
   * Handle privilege add input value change
   * @method
   * @param {string} value - input value
   * @returns none
   */
  handleDataChange = (value) => {
    this.setState({
      name: value
    });
  }
  /**
   * Handle add privilege confirm
   * @method
   * @param none
   * @returns none
   */
  addPrivilege = () => {
    const {baseUrl} = this.props;
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
   * @param none
   * @returns HTML DOM
   */
  displayAddPrivilege = () => {
    const {name} = this.state;

    return (
      <div className='c-flex fdc dialog-width'>
        <Input
          type='text'
          value={name}
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

PrivilegeAdd.defaultProps = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

export default PrivilegeAdd;