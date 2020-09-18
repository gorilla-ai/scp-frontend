import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import helper from './helper'
import InputPath from './input-path'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

/**
 * Manage Group
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to display group management
 */
class ManageGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  ryan = () => {

  }
  /**
   * Display edit group content
   * @method
   * @returns HTML DOM
   */
  displayEditGroup = () => {
    return (
      <span>edit group content</span>
    )
  }
  render() {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.toggleEditGroup},
      confirm: {text: t('txt-confirm'), handler: this.props.editGroupConfirm}
    };

    return (
      <ModalDialog
        id='editGroupDialog'
        className='modal-dialog'
        title={t('edge-management.txt-editGroup')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayEditGroup()}
      </ModalDialog>
    )
  }
}

ManageGroup.propTypes = {
  toggleEditGroup: PropTypes.func.isRequired,
  editGroupConfirm: PropTypes.func.isRequired
};

export default ManageGroup;