import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import ButtonGroup from 'react-ui/build/src/components/button-group'
import DataTable from 'react-ui/build/src/components/table'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const initialState = JSON.parse(document.getElementById('initial-state').innerHTML || '{}');
const {envCfg:cfg} = initialState;
const baseUrl = cfg.apiPrefix;

const INIT = {
  open: false,
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
const _department = 1;
const _title = 2;

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
  addName = () => {
    const {tab, name} = this.state;

    if (!name.trim()) {
      helper.showPopupMsg('', t('txt-error'), t('txt-noEmpty'));
      return;
    }

    const json = {
      name: name,
      nameType: tab.department ? _department : _title
    };

    this.ah.one({
      url: `${baseUrl}/api/name`,
      type: 'POST',
      data: JSON.stringify(json),
      contentType: 'application/json'
    })
    .then(data => {
      this.setState({
        openName: false
      });
      this.getNameList(tab.department ? 'department' : 'title');
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  updateName = () => {
    const {tab, name, nameUUID} = this.state;

    if (!name.trim()) {
      helper.showPopupMsg('', t('txt-error'), t('txt-noEmpty'));
      return;
    }

    const json = {
      nameUUID: nameUUID,
      name: name,
      nameType: tab.department ? _department : _title
    };

    this.ah.one({
      url: `${baseUrl}/api/name`,
      type: 'PATCH',
      data: JSON.stringify(json),
      contentType: 'application/json'
    })
    .then(data => {
      this.setState({
        openName: false
      });
      this.getNameList(tab.department ? 'department' : 'title');
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  deleteName = (nameUUID) => {
    const {tab} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/name?uuid=${nameUUID}`,
      type: 'DELETE'
    })
    .then(data => {
      this.getNameList(tab.department ? 'department' : 'title');
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getNameList = (tab) => {
    const json = {
      nameType: tab === 'department' ? _department : _title
    };

    this.ah.one({
      url: `${baseUrl}/api/name/_search`,
      data: JSON.stringify(json),
      type: 'POST',
      contentType: 'application/json'
    })
    .then(data => {
      this.setState({
        data: data
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  open = () => {
    this.getNameList('department');
    this.setState({
      open: true
    });
  }
  close = () => {
    this.setState(_.cloneDeep(INIT));
    this.props.onDone();
  }
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
  handleDataChange = (key, value) => {
    this.setState({
      [key]: value
    });
  }
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
                <i className='c-link fg fg-edit' onClick={this.openEditName.bind(this, allValue.nameUUID, allValue.name)} title={t('txt-edit')} />
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

        <i className='c-link fg fg-add' onClick={this.openAddName} title={tab.department ? t('txt-addDepartment') : t('txt-addTitle')}></i>

        <DataTable
          fields={dataFields}
          data={data} />
      </div>
    )
  }
  renderModal = () => {
    const actions = {
      cancel: {text: t('txt-close'), handler: this.close}
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
  openAddName = () => {
    const header = this.state.tab.department ? t('txt-addDepartment') : t('txt-addTitle');

    this.setState({
      openName: true,
      header,
      name: '',
      nameUUID: ''
    });
  }
  openEditName = (nameUUID, name) => {
    const header = this.state.tab.department ? t('txt-updateDepartment') : t('txt-updateTitle');

    this.setState({
      openName: true,
      header,
      name,
      nameUUID
    });
  }
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
  closeName = () => {
    this.setState({
      openName: false
    });
  }
  renderName = () => {
    const {openName, name, nameUUID, header} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeName},
      confirm: {text: t('txt-confirm'), handler: nameUUID === '' ? this.addName : this.updateName}
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
        <Input
          placeholder={t('txt-enterName')}
          onChange={this.handleDataChange.bind(this, 'name')}
          value={name} />
      </ModalDialog>
    )
  }
  render() {
    const {open, openName} = this.state;

    return (
      <div>
        {open &&
          this.renderModal()
        }

        {openName &&
          this.renderName()
        }
      </div>
    )
  }
}

Manage.propTypes = {
  onDone: PropTypes.func.isRequired
}

export default withLocale(Manage);