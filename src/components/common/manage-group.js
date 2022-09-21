import React, { Component } from 'react'
import PropTypes from 'prop-types'

import TextField from '@material-ui/core/TextField'

import DataTable from 'react-ui/build/src/components/table'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from './context'
import helper from './helper'
import InputPath from './input-path'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const FORM_VALIDATION = {
  name: {
    valid: true
  }
};

let t = null;

/**
 * Manage Group
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to display group management
 */
class ManageGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openManageGroup: false,
      openAddGroup: false,
      groupTableFields: ['group', 'option'],
      formattedGroupList: [],
      groupName: '',
      info: '',
      formValidation: _.cloneDeep(FORM_VALIDATION)
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getFormattedGroupList();
  }
  componentDidUpdate(prevProps) {
    const {allGroupList} = this.props;

    if (!prevProps || (prevProps && allGroupList != prevProps.allGroupList)) {
      this.getFormattedGroupList();
    }
  }
  /**
   * Get and set group list
   * @method
   */
  getFormattedGroupList = () => {
    const {allGroupList} = this.props;
    const formattedGroupList = _.map(allGroupList, val => {
      return {
        group: val
      };
    })

    this.setState({
      formattedGroupList
    }, () => {
      this.setState({
        openManageGroup: true
      });
    });
  }
  /**
   * Display manage group content
   * @method
   * @returns HTML DOM
   */
  displayManageGroup = () => {
    const {groupTableFields, formattedGroupList} = this.state;

    let dataFields = {};
    groupTableFields.forEach(tempData => {
      dataFields[tempData] = {
        label: tempData === 'group' ? t('txt-group') : '',
        sortable: false,
        formatter: (value, allValue) => {
          if (tempData === 'option') {
            return (
              <div>
                <i className='c-link fg fg-trashcan' onClick={this.openDeleteGroup.bind(this, allValue.group)} title={t('txt-delete')} />
              </div>
            )
          } else {
            return <span>{value}</span>
          }
        }
      };
    })

    return (
      <div>
        <i className='c-link fg fg-add' onClick={this.toggleAddGroup} title={t('edge-management.txt-addGroup')}></i>
        <div className='table-data'>
          <DataTable
            fields={dataFields}
            data={formattedGroupList} />
        </div>
      </div>
    )
  }
  /**
   * Display manage group dialog
   * @method
   * @returns ModalDialog component
   */
  openManageGroupDialog = () => {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.props.toggleManageGroup}
    };

    return (
      <ModalDialog
        id='selectGroupDialog'
        className='modal-dialog'
        title={t('edge-management.txt-manageGroup')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displayManageGroup()}
      </ModalDialog>
    )
  }
  /**
   * Toggle add group dialog on/off
   * @method
   */
  toggleAddGroup = () => {
    const {openAddGroup} = this.state;

    if (!openAddGroup) {
      this.setState({
        groupName: '',
        formValidation: _.cloneDeep(FORM_VALIDATION)
      });
    }

    this.setState({
      openAddGroup: !openAddGroup
    });
  }
  /**
   * Handle input value change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }
  /**
   * Display add group content
   * @method
   * @returns TextField component
   */
  displayAddGroup = () => {
    const {groupName, formValidation} = this.state;

    return (
      <TextField
        name='groupName'
        label={t('txt-plsEnterName')}
        variant='outlined'
        fullWidth
        size='small'
        required
        error={!formValidation.name.valid}
        helperText={formValidation.name.valid ? '' : t('txt-required')}
        value={groupName}
        onChange={this.handleDataChange} />
    )
  }
  /**
   * Display add group dialog
   * @method
   * @returns ModalDialog component
   */
  openAddGroupDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleAddGroup},
      confirm: {text: t('txt-confirm'), handler: this.confirmAddGroup}
    };

    return (
      <ModalDialog
        id='addGroupDialog'
        className='modal-dialog'
        title={t('edge-management.txt-addGroup')}
        draggable={true}
        global={true}
        actions={actions}
        info={this.state.info}
        closeAction='cancel'>
        {this.displayAddGroup()}
      </ModalDialog>
    )
  }
  /**
   * Handle confirm add group
   * @method
   */
  confirmAddGroup = () => {
    const {baseUrl} = this.context;
    const {groupName, formValidation} = this.state;
    const url = `${baseUrl}/api/edge/group`;
    let tempFormValidation = {...formValidation};
    let requestData = {};
    let validate = true;

    if (groupName) {
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

    requestData = {
      groupName
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.toggleAddGroup();
        this.props.getGroupList();

        this.setState({
          info: ''
        });
      } else {
        this.setState({
          info: t('txt-duplicatedName')
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Open delete group modal dialog
   * @method
   * @param {string} group - selected group name
   */
  openDeleteGroup = (group) => {
    PopupDialog.prompt({
      title: t('edge-management.txt-deleteGroup'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{t('txt-delete-msg')}: {group}?</span>
        </div>
      ),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteGroup(group);
        }
      }
    });
  }
  /**
   * Handle delete group confirm
   * @method
   * @param {string} group - group name
   */
  deleteGroup = (group) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/edge/group`;
    const requestData = {
      groupName: group
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'DELETE',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.props.updateGroupList(group);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {openManageGroup, openAddGroup} = this.state;

    return (
      <div>
        {openManageGroup &&
          this.openManageGroupDialog()
        }

        {openAddGroup &&
          this.openAddGroupDialog()
        }
      </div>
    )
  }
}

ManageGroup.contextType = BaseDataContext;

ManageGroup.propTypes = {
  allGroupList: PropTypes.array.isRequired,
  toggleManageGroup: PropTypes.func.isRequired,
  updateGroupList: PropTypes.func.isRequired,
  getGroupList: PropTypes.func.isRequired
};

export default ManageGroup;