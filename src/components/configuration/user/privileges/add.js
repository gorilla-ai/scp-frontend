import React, {Component} from 'react'
import _ from 'lodash'
import i18n from 'i18next'
import PropTypes from 'prop-types'
import cx from 'classnames'

import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../../common/context'
import helper from '../../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const FORM_VALIDATION = {
  name: {
    valid: true
  }
};

const log = require('loglevel').getLogger('privileges')
const t = i18n.getFixedT(null, 'privileges');
const c = i18n.getFixedT(null, 'connections');
const gt = i18n.getFixedT(null, 'app');
const et =  i18n.getFixedT(null, 'errors');

const INITIAL_STATE = {
  open: false,
  info: null,
  error: false,
  name: '',
  formValidation: _.cloneDeep(FORM_VALIDATION)
};

/**
 * Account Privileges Add
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
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
    this.setState({
      open: false,
      info: null,
      error: false,
      name: '',
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
    const {name, formValidation} = this.state;
    const reqArg = {
      name
    };
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (name) {
      tempFormValidation.name.valid = true;
    } else {
      tempFormValidation.name.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

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
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display add privilege content
   * @method
   * @returns HTML DOM
   */
  displayAddPrivilege = () => {
    const {name, formValidation} = this.state;

    return (
      <div className='group'>
        <TextField
          id='privilegesAddRole'
          name='name'
          label={c('txt-plsEnterName')}
          variant='outlined'
          fullWidth
          size='small'
          required
          error={!formValidation.name.valid}
          helperText={formValidation.name.valid ? '' : c('txt-required')}
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
        infoClassName={cx({'c-error': error})}
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