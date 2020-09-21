import React, { Component } from 'react'
import PropTypes from 'prop-types'

import DataTable from 'react-ui/build/src/components/table'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from './context';
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
      openManageGroup: false,
      openAddGroup: false,
      groupTableFields: ['group', 'option'],
      groupList: [],
      groupName: '',
      groupSelected: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getGroupList();
  }
  /**
   * Get and set group list
   * @method
   */
  getGroupList = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/edge/groups`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let groupList = [];

        _.forEach(data.rows, val => {
          if (val) {
            groupList.push({
              group: val
            });
          }
        })

        this.setState({
          groupList
        }, () => {
          this.setState({
            openManageGroup: true
          });
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })    
  }
  /**
   * Toggle add group dialog on/off
   * @method
   */
  toggleAddGroup = () => {
    const {openAddGroup} = this.state;

    if (!openAddGroup) {
      this.setState({
        groupName: ''
      });
    }

    this.setState({
      openAddGroup: !openAddGroup
    });
  }
  /**
   * Handle input value change
   * @method
   * @param {string} key - input type
   * @param {string} value - input value
   */
  handleDataChange = (key, value) => {
    this.setState({
      [key]: value
    });
  }
  /**
   * Display add group content
   * @method
   * @returns HTML DOM
   */
  displayAddGroup = () => {
    return (
      <Input
        value={this.state.groupName}
        onChange={this.handleDataChange.bind(this, 'groupName')} />
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
    const {groupName} = this.state;
    const url = `${baseUrl}/api/edge/group`;
    const requestData = {
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
        this.getGroupList();
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
          this.deleteGroup(group)
        }
      }
    })
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
      this.getGroupList();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle table group selection
   * @method
   * @param {array.<string>} value - selected group
   */
  handleTableSelection = (value) => {
    this.setState({
      groupSelected: value
    });
  }
  /**
   * Display manage group content
   * @method
   * @returns HTML DOM
   */
  displayManageGroup = () => {
    const {edgeGroupList} = this.props;
    const {groupTableFields, groupList} = this.state;

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

    let selectedGroup = [];

    _.forEach(edgeGroupList, val => {
      _.forEach(groupList, (val2, i) => {
        if (val === val2.group) {
          selectedGroup.push(i.toString());
        }
      })
    })

    return (
      <div>
        <i className='c-link fg fg-add' onClick={this.toggleAddGroup} title={t('edge-management.txt-addGroup')}></i>

        <div className='table-data'>
          <DataTable
            fields={dataFields}
            data={groupList}
            selection={{
              enabled: true
            }}
            defaultSelected={selectedGroup}
            onSelectionChange={this.handleTableSelection} />
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
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.toggleManageGroup},
      confirm: {text: t('txt-confirm'), handler: this.confirmManageGroup}
    };

    return (
      <ModalDialog
        id='selectGroupDialog'
        className='modal-dialog'
        title={t('edge-management.txt-manageGroup')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayManageGroup()}
      </ModalDialog>
    )
  }
  /**
   * Handle confirm manage group
   * @method
   */
  confirmManageGroup = () => {
    const {groupList, groupSelected} = this.state;
    const selectedGroupName = _.map(groupSelected, val => {
      return groupList[Number(val)].group;
    });

    this.props.manageGroupConfirm(selectedGroupName);
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
  edgeGroupList: PropTypes.array.isRequired,
  toggleManageGroup: PropTypes.func.isRequired,
  manageGroupConfirm: PropTypes.func.isRequired
};

export default ManageGroup;