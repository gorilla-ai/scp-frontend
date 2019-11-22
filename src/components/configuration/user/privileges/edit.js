import React, {Component} from 'react'
import _ from 'lodash'
import i18n from 'i18next'
import PropTypes from 'prop-types';
import cx from 'classnames'
import im from 'object-path-immutable'
import queryString from 'query-string'

import CheckboxGroup from 'react-ui/build/src/components/checkbox-group'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import helper from '../../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const log = require('loglevel').getLogger('user/privileges/edit');
const t = i18n.getFixedT(null, 'privileges');
const gt =  i18n.getFixedT(null, 'app');

const initialState = JSON.parse(document.getElementById('initial-state').innerHTML || '{}')
const {apiServerPrefix} = initialState.envCfg

const INITIAL_STATE = {
  open: false,
  info: null,
  error: false,
  permits: [],
  name: '',
  selected: [],
  privilegeid: ''
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
    this.setState({
      open: true,
      name: privilege.name,
      privilegeid: privilege.privilegeid,
      selected: _.map(privilege.permits, (permit) => { return permit.permitid }
    )}, this.loadPermits)
  }
  /**
   * Get and set privilege permits data
   * @method
   */
  loadPermits = () => {
    const {baseUrl} = this.props;

    ah.one({
      url: `${baseUrl}/api/account/permits`,
      type: 'GET'
    })
    .then(data => {
      this.setState({
        permits: _.map(data.rt, (permit) => {
          return {
            value: permit.permitid,
            text: permit.dispname
          };
        })
      });
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
    const {baseUrl} = this.props;
    const {selected, privilegeid} = this.state;

    ah.one({
      url: `${baseUrl}/api/account/privilege/permits?privilegeId=${privilegeid}&${queryString.stringify({permitIds:selected})}`,
      type: 'PATCH',
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
  }
  /**
   * Handle checkboxgroup value change
   * @method
   * @param {array} selected - selected checkboxs value
   */
  handleDataChange = (selected) => {
    this.setState({
      selected
    });
  }
  /**
   * Display edit privilege content
   * @method
   * @returns HTML DOM
   */
  displayEditPrivilege = () => {
    const {permits, selected, name} = this.state;

    return (
      <div className='c-form'>
        <div>
          <label className='required'>{t('l-name')}</label>
          <Input
            type='text'
            readOnly
            value={name} />
        </div>
        <div className='group'>
          <label className='required'>{t('l-permits')}</label>
          <CheckboxGroup
            list={permits}
            onChange={this.handleDataChange}
            value={selected} />
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

PrivilegeEdit.defaultProps = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

export default PrivilegeEdit;