import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import Button from '@material-ui/core/Button'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import TextField from '@material-ui/core/TextField'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import TreeItem from '@material-ui/lab/TreeItem'
import TreeView from '@material-ui/lab/TreeView'

import DataTable from 'react-ui/build/src/components/table'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'
import SortableTree from "react-sortable-tree";

let t = null;
let et = null;

/**
 * Config Topology Department and Title management
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to manage department and title
 */
class Manage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'department', //'department' or 'title'  or 'drag'
      openManage: true,
      openName: false,
      openDrag: false,
      name: '',
      header: '',
      departmentList: [],
      titleNameList: [],
      treeData:[],
      parentTreetId: '',
      treeId: '',
      tableArr: ['nameUUID', 'name', 'option'],
      nameUUID: '',
      formValidation: {
        name: {
          valid: true
        }
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getDepartmentTree();
  }
  /**
   * Get and set department tree data
   * @method
   */
  getDepartmentTree = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/department/_tree`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        this.setState({
          departmentList: data,
          treeData:data
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle tabs change
   * @method
   * @param {object} event - event object
   * @param {string} tab - tab name ('department' or 'title')
   */
  handleTabChange = (event, tab) => {
    const activeTab = tab;

    if (!tab) {
      return;
    }

    if (tab === 'department') {
      this.getDepartmentTree();
    } else if (tab === 'title') {
      this.getTitleNameList();
    } else if (tab === 'drag') {
      this.getDepartmentTree();
    }

    this.setState({
      activeTab
    });
  }
  /**
   * Handle tree action
   * @method
   * @param {string} type - action type ('add, 'edit' or 'delete')
   * @param {object} tree - department tree data
   * @param {object} event - click event
   * @returns HTML DOM
   */
  handleTreeAction = (type, tree, event) => {
    let header = '';
    let name = '';
    let parentTreetId = '';
    let treeId = '';

    if (event) {
      event.preventDefault();
    }

    if (type === 'add') {
      header = t('txt-addDepartment');
      parentTreetId = tree ? tree.id : 'root';
    } else if (type === 'edit') {
      header = t('txt-updateDepartment');
      name = tree.name;
      parentTreetId = tree.parentId || tree.rootId;
      treeId = tree.id;
    } else if (type === 'delete') {
      this.openDeleteTreeName(tree);
      return;
    }

    this.setState({
      openName: true,
      header,
      name,
      parentTreetId,
      treeId
    });
  }
  /**
   * Display department tree content
   * @method
   * @param {object} tree - department tree data
   * @returns HTML DOM
   */
  getDepartmentTreeLabel = (tree) => {
    return (
      <div className='tree-label'>
        <span>{tree.name}</span> 
        <div className='action-icons'>
          <i className='c-link fg fg-add' title={t('txt-add')} onClick={this.handleTreeAction.bind(this, 'add', tree)} />
          <i className='c-link fg fg-edit' title={t('txt-edit')} onClick={this.handleTreeAction.bind(this, 'edit', tree)} />
          <i className='c-link fg fg-trashcan' title={t('txt-delete')} onClick={this.handleTreeAction.bind(this, 'delete', tree)} />
        </div>
      </div>
    );
  }
  /**
   * Display department tree item
   * @method
   * @param {object} val - department tree data
   * @param {number} i - index of the department tree data
   * @returns TreeItem component
   */
  getDepartmentTreeItem = (val, i) => {
    return (
      <TreeItem
        key={val.id + i}
        nodeId={val.id}
        label={this.getDepartmentTreeLabel(val)}>
        {val.children && val.children.length > 0 &&
          val.children.map(this.getDepartmentTreeItem)
        }
      </TreeItem>
    )
  }
  /**
   * Open delete tree name modal dialog
   * @method
   * @param {object} tree - department tree data
   */
  openDeleteTreeName = (tree) => {
    // TODO asking Incident Unit
    const {baseUrl, contextRoot} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/soc/unit?uuid=${tree.id}`,
      type: 'GET',
    }).then(data => {
          if(data.id){
            PopupDialog.prompt({
              title: t('txt-deleteDepartment'),
              id: 'modalWindowSmall',
              confirmText: t('txt-delete'),
              cancelText: t('txt-cancel'),
              display: (
                  <React.Fragment>
                    <div className='content '>
                      <span>{t('txt-delete-msg-with-soc')}?</span>
                    </div>
                    <div className='content delete'>
                      <span>{tree.name} </span>
                    </div>
                  </React.Fragment>
              ),
              act: (confirmed) => {
                if (confirmed) {
                  this.deleteTreeName(tree)
                }
              }
            });
          }else{
            PopupDialog.prompt({
              title: t('txt-deleteDepartment'),
              id: 'modalWindowSmall',
              confirmText: t('txt-delete'),
              cancelText: t('txt-cancel'),
              display: (
                  <div className='content delete'>
                    <span>{t('txt-delete-msg')}: {tree.name}?</span>
                  </div>
              ),
              act: (confirmed) => {
                if (confirmed) {
                  this.deleteTreeName(tree)
                }
              }
            });
          }
    }).catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle delete tree name confirm
   * @method
   * @param {object} tree - department tree data
   */
  deleteTreeName = (tree) => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/department?id=${tree.id}`,
      type: 'DELETE'
    })
    .then(data => {
      this.getDepartmentTree();
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
  displayDepartmentTitleContent = () => {
    const {activeTab, departmentList, treeData, titleNameList, tableArr, nameUUID} = this.state;
    let dataFields = {};

    if (activeTab === 'title') {
      tableArr.forEach(tempData => {
        dataFields[tempData] = {
          hide: tempData === 'nameUUID' ? true : false,
          label: tempData === 'name' ? t('ownerFields.title') : '',
          sortable: false,
          formatter: (value, allValue) => {
            if (tempData === 'option') {
              return (
                <div>
                  <i className='c-link fg fg-edit' onClick={this.openTitleName.bind(this, 'edit', allValue.nameUUID, allValue.name)} title={t('txt-edit')} />
                  <i className='c-link fg fg-trashcan' onClick={this.openDeleteTitleName.bind(this, allValue.nameUUID, allValue.name)} title={t('txt-delete')} />
                </div>
              )
            } else {
              return <span>{value}</span>
            }
          }
        };
      })
    }

    return (
      <div>
        <ToggleButtonGroup
          id='manageBtn'
          exclusive
          value={activeTab}
          onChange={this.handleTabChange}>
          <ToggleButton id='manageDepartment' value='department'>{t('ownerFields.department')}</ToggleButton>
          <ToggleButton id='manageTitle' value='title'>{t('ownerFields.title')}</ToggleButton>
        </ToggleButtonGroup>

        {activeTab === 'department' &&
          <div className='tree-section'>
            <i className='c-link fg fg-add' onClick={this.handleTreeAction.bind(this, 'add')} title={t('txt-addDepartment')}></i>
            {departmentList && departmentList.length > 0 &&
              <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}>
                {departmentList.map(this.getDepartmentTreeItem)}
              </TreeView>
            }
          </div>
        }

        {activeTab === 'title' &&
          <div className='title-section'>
            <i className='c-link fg fg-add' onClick={this.openTitleName.bind(this, 'add')} title={t('txt-addTitle')}></i>

            <div className='table-data'>
              <DataTable
                fields={dataFields}
                data={titleNameList} />
            </div>
          </div>
        }
        {activeTab === 'drag' &&
        <div className='title-section'>
          <SortableTree
              treeData={treeData}
              onChange={treeData => this.setState({treeData: treeData})}
          />
        </div>
        }
      </div>
    )
  }
  /**
   * Get and set title data
   * @method
   */
  getTitleNameList = () => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/name/_search`;
    const requestData = {
      nameType: 2
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.setState({
          titleNameList: data
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle add/edit title name action
   * @method
   * @param {string} type - action type ('add' or 'edit')
   * @param {string} nameUUID - name UUID
   * @param {string} name - selected name value
   */
  openTitleName = (type, nameUUID, name) => {
    const {activeTab} = this.state;
    let header = '';

    if (type === 'add') {
      header = t('txt-addTitle');
      name = '';
      nameUUID = '';
    } else if (type === 'edit') {
      header = t('txt-updateTitle');
    }

    this.setState({
      openName: true,
      header,
      name,
      nameUUID
    });
  }
  /**
   * Open delete title name modal dialog
   * @method
   * @param {string} nameUUID - name UUID
   * @param {string} name - selected name value
   */
  openDeleteTitleName = (nameUUID, name) => {
    PopupDialog.prompt({
      title: t('txt-deleteTitle'),
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
          this.deleteTitleName(nameUUID)
        }
      }
    });
  }
  /**
   * Handle delete title name confirm
   * @method
   * @param {string} nameUUID - name UUID
   */
  deleteTitleName = (nameUUID) => {
    const {baseUrl} = this.context;

    if (!nameUUID) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/name?uuid=${nameUUID}`,
      type: 'DELETE'
    })
    .then(data => {
      this.getTitleNameList();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display title manage content in modal dialog
   * @method
   * @returns ModalDialog component
   */
  titleManageModal = () => {
    const actions = {
      cancel: {text: t('txt-close'), handler: this.closeTitleManage}
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
        {this.displayDepartmentTitleContent()}
      </ModalDialog>
    )
  }
  /**
   * Handle close manage confirm
   * @method
   */
  closeTitleManage = () => {
    this.props.handleCloseManage('fromManage');
  }
  /**
   * Handle name input value change
   * @method
   * @param {string} event - event object
   */
  handleDataChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }
  /**
   * Display title name content
   * @method
   * @returns HTML DOM
   */
  displayTitleName = () => {
    const {name, formValidation} = this.state;

    return (
      <TextField
        name='name'
        label={t('txt-plsEnterName')}
        variant='outlined'
        fullWidth
        size='small'
        required
        error={!formValidation.name.valid}
        helperText={formValidation.name.valid ? '' : t('txt-required')}
        value={name}
        onChange={this.handleDataChange} />
    )
  }
  /**
   * Display name content in modal dialog
   * @method
   * @returns ModalDialog component
   */
  titleNameModal = () => {
    const {header} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeTitleName},
      confirm: {text: t('txt-confirm'), handler: this.handleConfirmName}
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
        {this.displayTitleName()}
      </ModalDialog>
    )
  }

  dragModal = () => {
    const {treeData} = this.state;

    const actions = {
      cancel: {text: t('txt-close'), className: 'standard', handler: this.closeODialog},
      confirm: {text: t('txt-confirm'), handler: this.handleUnitTreeConfirm}
    };

    return (
        <ModalDialog
            id='addUnitDialog'
            className='modal-dialog'
            title={t('txt-setOrganization')}
            draggable={true}
            global={true}
            actions={actions}
            closeAction='cancel'>
          <div style={{width: '890px', height: '630px'}}>
            <SortableTree
                treeData={treeData}
                onChange={treeData => this.setState({treeData: treeData})}
            />
          </div>
        </ModalDialog>
    )
  }

  closeODialog = () => {
    this.setState({openDrag: false})
  }

  handleUnitTreeConfirm = () =>{
    const {treeData} = this.state;
    const {baseUrl} = this.context;

    ah.one({
      url: `${baseUrl}/api/department/_tree`,
      data: JSON.stringify(treeData),
      type: 'POST',
      contentType: 'text/plain'
    }).then(data => {
      if(data.status.includes('success')){
        helper.showPopupMsg('', t('txt-success'),t('txt-update')+t('txt-success'));
      }
    }).catch(err => {
      helper.showPopupMsg('', t('txt-fail'),t('txt-update')+t('txt-fail'));
    })
  }

  /**
   * Handle name modal confirm
   * @method
   */
  handleConfirmName = () => {
    const {baseUrl} = this.context;
    const {activeTab, name, parentTreetId, treeId, nameUUID, formValidation} = this.state;
    let url = '';
    let tempFormValidation = {...formValidation};
    let requestType = 'POST';
    let requestData = {};
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

    if (activeTab === 'department') {
      url = `${baseUrl}/api/department`;
      requestData = {
        name
      };

      if (parentTreetId !== 'root' && parentTreetId !== treeId) {
        requestData.parentId = parentTreetId;
      }

      if (parentTreetId === treeId) {
        requestData.id = treeId;
      }

      if (treeId) {
        requestType = 'PATCH';
        requestData.id = treeId;
      }
    } else if (activeTab === 'title') {
      url = `${baseUrl}/api/name`;
      requestData = {
        name,
        nameType: 2
      };

      if (nameUUID) {
        requestType = 'PATCH';
        requestData.nameUUID = nameUUID;
      }
    }

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: requestType,
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        if (activeTab === 'department') {
          this.setState({
            openName: false,
            name: '',
            parentTreetId: '',
            treeId: ''
          });

          this.getDepartmentTree();
        } else if (activeTab === 'title') {
          this.setState({
            openName: false,
            nameUUID: ''
          });

          this.getTitleNameList();
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Close open name dialog
   * @method
   */
  closeTitleName = () => {
    this.setState({
      openName: false,
      formValidation: {
        name: {
          valid: true
        }
      }
    });
  }
  render() {
    const {openManage, openName} = this.state;

    return (
      <div>
        {openManage &&
          this.titleManageModal()
        }

        {openName &&
          this.titleNameModal()
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