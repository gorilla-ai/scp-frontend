import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import ButtonGroup from 'react-ui/build/src/components/button-group'
import DataTable from 'react-ui/build/src/components/table'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context';
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const INIT = {
  openManage: false,
  openName: false,
  tableArr: ['nameUUID', 'name', 'option'],
  tab: {
    department: true,
    title: false
  },
  nameUUID: '',
  name: '',
  header: '',
  data: [],
};
const DEPARTMENT = 1;
const TITLE = 2;

let t = null;
let et = null;

/**
 * Config Topology Department and Title management
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to manage department and title
 */
class Manage extends Component {
  constructor(props) {
    super(props);

    this.state = _.cloneDeep(INIT);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  /**
   * Get and set department or title data
   * @method
   * @param {string} tab - tab name ('department' or 'title')
   */
  getNameList = (tab) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/name/_search`;
    let nameType = '';

    if (tab === 'department') {
      nameType = DEPARTMENT;
    } else if (tab === 'title') {
      nameType = TITLE;
    }

    const requestData = {
      nameType
    };

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      if (data) {
        this.setState({
          data
        });
      }
      return null;
    });
  }
  /**
   * Get department data and set open manage modal
   * @method
   */
  openManage = () => {
    this.getNameList('department');
    this.setState({
      openManage: true
    });
  }
  /**
   * Handle tabs change
   * @method
   * @param {string} tab - tab name ('department' or 'title')
   */
  handleTabChange = (tab) => {
    let tabs = {
      department: false,
      title: false
    };
    tabs[tab] = true;

    this.getNameList(tab);
    this.setState({
      tab: tabs
    });
  }
  /**
   * Handle add/edit name action
   * @method
   * @param {string} type - action type ('add' or 'edit')
   * @param {string} nameUUID - name UUID
   * @param {string} name - selected name value
   */
  openName = (type, nameUUID, name) => {
    const {tab} = this.state;
    let header = '';

    if (type === 'add') {
      header = tab.department ? t('txt-addDepartment') : t('txt-addTitle');
      name = '';
      nameUUID = '';
    } else if (type === 'edit') {
      header = tab.department ? t('txt-updateDepartment') : t('txt-updateTitle');
    }

    this.setState({
      openName: true,
      header,
      name,
      nameUUID
    });
  }
  /**
   * Open delete name modal dialog
   * @method
   * @param {string} nameUUID - name UUID
   * @param {string} name - selected name value
   */
  openDeleteName = (nameUUID, name) => {
    PopupDialog.prompt({
      title: this.state.tab.department ? t('txt-deleteDepartment') : t('txt-deleteTitle'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{t('txt-delete-msg')}: {name}?</span>
        </div>
      ),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteName(nameUUID)
        }
      }
    })
  }
  /**
   * Handle delete name confirm
   * @method
   * @param {string} nameUUID - name UUID
   */
  deleteName = (nameUUID) => {
    const {baseUrl} = this.context;
    const {tab} = this.state;

    if (!nameUUID) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/name?uuid=${nameUUID}`,
      type: 'DELETE'
    })
    .then(data => {
      this.getNameList(tab.department ? 'department' : 'title');
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display department/title manage content
   * @method
   * @returns HTML DOM
   */
  displayDepartmentTitle = () => {
    const {tableArr, tab, data} = this.state;
    const label = tab.department ? t('ownerFields.department') : t('ownerFields.title');

    let dataFields = {};
    tableArr.forEach(tempData => {
      dataFields[tempData] = {
        hide: tempData === 'nameUUID' ? true : false,
        label: tempData === 'name' ? label : '',
        sortable: false,
        formatter: (value, allValue) => {
          if (tempData === 'option') {
            return (
              <div>
                <i className='c-link fg fg-edit' onClick={this.openName.bind(this, 'edit', allValue.nameUUID, allValue.name)} title={t('txt-edit')} />
                <i className='c-link fg fg-trashcan' onClick={this.openDeleteName.bind(this, allValue.nameUUID, allValue.name)} title={t('txt-delete')} />
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
        <ButtonGroup
          list={[
            {value: 'department', text: t('ownerFields.department')},
            {value: 'title', text: t('ownerFields.title')}
          ]}
          onChange={this.handleTabChange}
          value={tab.department ? 'department' : 'title'} />

        <i className='c-link fg fg-add' onClick={this.openName.bind(this, 'add')} title={tab.department ? t('txt-addDepartment') : t('txt-addTitle')}></i>

        <div className='table-data'>
          <DataTable
            fields={dataFields}
            data={data} />
        </div>
      </div>
    )
  }
  /**
   * Display department/title manage content in modal dialog
   * @method
   * @returns ModalDialog component
   */
  departmentTitleManageModal = () => {
    const actions = {
      cancel: {text: t('txt-close'), handler: this.closeManage}
    };

    return (
      <ModalDialog
        id='departmentTitleDialog'
        className='modal-dialog'
        title={t('txt-mixName')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayDepartmentTitle()}
      </ModalDialog>
    )
  }
  /**
   * Handle close manage confirm
   * @method
   */
  closeManage = () => {
    this.setState(_.cloneDeep(INIT));
    this.props.onDone('fromManage');
  }
  /**
   * Handle name input value change
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
   * Display name content
   * @method
   * @returns HTML DOM
   */
  displayName = () => {
    return (
      <Input
        placeholder={t('txt-enterName')}
        onChange={this.handleDataChange.bind(this, 'name')}
        value={this.state.name} />
    )
  }
  /**
   * Display name content in modal dialog
   * @method
   * @returns ModalDialog component
   */
  departmentTitleNameModal = () => {
    const {header} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeName},
      confirm: {text: t('txt-confirm'), handler: this.confirmName}
    };

    return (
      <ModalDialog
        id='renderNameDialog'
        className='modal-dialog'
        title={header}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayName()}
      </ModalDialog>
    )
  }
  /**
   * Handle name modal confirm
   * @method
   */
  confirmName = () => {
    const {baseUrl} = this.context;
    const {tab, name, nameUUID} = this.state;
    let type = 'POST';
    let requestData = {};

    if (!name.trim()) {
      helper.showPopupMsg(t('txt-nameInvalid'), t('txt-error'));
      return;
    }

    if (nameUUID) {
      type = 'PATCH';
      requestData = {
        nameUUID: nameUUID,
        name: name,
        nameType: tab.department ? DEPARTMENT : TITLE
      };
    } else {
      requestData = {
        name: name,
        nameType: tab.department ? DEPARTMENT : TITLE
      };
    }

    ah.one({
      url: `${baseUrl}/api/name`,
      data: JSON.stringify(requestData),
      type,
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        this.setState({
          openName: false
        });
        this.getNameList(tab.department ? 'department' : 'title');
      }
      return null;
    })
    .catch(err => {
      this.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Close open name dialog
   * @method
   */
  closeName = () => {
    this.setState({
      openName: false
    });
  }
  render() {
    const {openManage, openName} = this.state;

    return (
      <div>
        {openManage &&
          this.departmentTitleManageModal()
        }

        {openName &&
          this.departmentTitleNameModal()
        }
      </div>
    )
  }
}

Manage.contextType = BaseDataContext;

Manage.propTypes = {
  onDone: PropTypes.func.isRequired
}

export default Manage;