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
        this.setState({
          permits: _.map(data.rt, (permit) => {
            return {
              value: permit.permitid,
              text: this.getLocaleName(permit.dispname)
            };
          })
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
    const {name, selected, privilegeid} = this.state;

    if (!privilegeid) {
      return;
    }

    ah.one({
      url: `${baseUrl}/api/account/privilege/permits/v1?privilegeId=${privilegeid}&${queryString.stringify({permitIds:selected})}`,
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
   * Handle checkboxgroup value change
   * @method
   * @param {array} selected - selected checkboxs value
   */
  handleDataChange = (type, value) => {
    this.setState({
      [type]: value
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
            value={name}
            onChange={this.handleDataChange.bind(this, 'name')} />
        </div>
        <div className='group'>
          <label className='required'>{t('l-permits')}</label>
          <CheckboxGroup
            list={permits}
            value={selected}
            onChange={this.handleDataChange.bind(this, 'selected')} />
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