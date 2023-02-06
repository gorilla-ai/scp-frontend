import React, { Component } from 'react'
import i18n from 'i18next'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../../common/context'
import Config from '../../../common/configuration'
import helper from '../../../common/helper'
import MuiTableContent from '../../../common/mui-table-content'
import PrivilegeAdd from './add'
import PrivilegeEdit from './edit'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const log = require('loglevel').getLogger('user/privileges')
const c = i18n.getFixedT(null, 'connections');
const t = i18n.getFixedT(null, 'privileges');
const gt =  i18n.getFixedT(null, 'app');

/**
 * Account Privileges
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the account privileges
 */
class Roles extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userPrivileges: {
        dataFieldsArr: ['_menu', 'name', 'permits'],
        dataFields: [],
        dataContent: null
      },
      contextAnchor: null,
      currentRolesData: {}
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);
    helper.inactivityTime(baseUrl, locale);

    this.getPrivilegesData();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get and set privileges list
   * @method
   */
  getPrivilegesData = () => {
    const {baseUrl} = this.context;
    const {userPrivileges} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/account/privileges?getPermits=true`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempUserPrivileges = {...userPrivileges};

        if (data.length === 0) {
          tempUserPrivileges.dataContent = [];

          this.setState({
            userPrivileges: tempUserPrivileges
          });
          return null;
        }

        tempUserPrivileges.dataContent = data;
        tempUserPrivileges.dataFields = _.map(userPrivileges.dataFieldsArr, val => {
          return {
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : t('privilegeFields.' + val),
            options: {
              filter: true,
              sort: false,
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempUserPrivileges.dataContent[dataIndex];
                const value = tempUserPrivileges.dataContent[dataIndex][val];

                if (val === '_menu') {
                  return (
                    <div className='table-menu active'>
                      <Button variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue)}><i className='fg fg-more'></i></Button>
                    </div>
                  )
                } else if (val === 'permits') {
                  return <div className='flex-item'>{this.displayPermit(value)}</div>
                } else {
                  return <span>{value}</span>
                }
              }
            }
          };
        });

        this.setState({
          userPrivileges: tempUserPrivileges
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Open account privilege edit dialog
   * @method
   * @param {string} id - selected privilege id
   */
  showEditDialog = (id) => {
    this.editor.openPrivilegeEdit(id);
    this.handleCloseMenu();
  }
  /**
   * Open account privilege add dialog
   * @method
   */
  showAddDialog = () => {
    this.addor.openPrivilegeAdd();
  }
  /**
   * Display delete privilege content
   * @method
   * @param {object} allValue - selected privilege data
   * @returns HTML DOM
   */
  getDeletePrivilegeContent = (allValue) => {
    const msg = c('txt-delete-msg') + ': ' + allValue.name;

    return (
      <div className='content delete'>
        <span>{msg}?</span>
      </div>
    )
  }
  /**
   * Display delete privilege content in modal dialog
   * @method
   * @param {object} allValue - selected privilege data
   * @param {string} id - selected privilege id
   */
  showDeleteDialog = (allValue, id) => {
    const {baseUrl} = this.context;

    PopupDialog.prompt({
      title: c('txt-deletePrivilege'),
      id: 'modalWindowSmall',
      confirmText: c('txt-delete'),
      cancelText: c('txt-cancel'),
      display: this.getDeletePrivilegeContent(allValue),
      act: (confirmed) => {
        if (confirmed && id) {
          helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

          ah.one({
            url: `${baseUrl}/api/account/privilege?privilegeId=${id}`,
            type: 'DELETE',
            contentType: 'application/json'
          })
          .then(data => {
            if (!data.rt) {
              helper.showPopupMsg(c('txt-privilegeError'), c('txt-error'));
            }

            this.getPrivilegesData();
            return null;
          })
          .catch(err => {
            helper.showPopupMsg('', c('txt-error'), err.message);
          })
        }
      }
    });

    this.handleCloseMenu();
  }
  /**
   * Handle open menu
   * @method
   * @param {object} roles - active roles data
   * @param {object} event - event object
   */
  handleOpenMenu = (roles, event) => {
    this.setState({
      contextAnchor: event.currentTarget,
      currentRolesData: roles
    });
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null,
      currentRolesData: {}
    });
  }
  /**
   * Display role privilege data
   * @method
   * @param {array} value - role list
   * @returns permitList array
   */
  displayPermit = (value) => {
    const permitList = _.map(value, (val, i) => {
      return <span key={i} className='item'>{c('txt-' + val.name)}</span>
    });

    return permitList;
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {userPrivileges, contextAnchor, currentRolesData} = this.state;
    const tableOptions = {
      pagination: false,
      tableBodyHeight: '78vh'
    };

    return (
      <div>
        <Menu
          anchorEl={contextAnchor}
          keepMounted
          open={Boolean(contextAnchor)}
          onClose={this.handleCloseMenu}>
          <MenuItem id='privilegesEditBtn' onClick={this.showEditDialog.bind(this, currentRolesData)}>{c('txt-edit')}</MenuItem>
          <MenuItem id='privilegesDeleteBtn' onClick={this.showDeleteDialog.bind(this, currentRolesData, currentRolesData.privilegeid)}>{c('txt-delete')}</MenuItem>
        </Menu>

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button id='privilegesAddBtn' variant='outlined' color='primary' className='last' onClick={this.showAddDialog} title={t('txt-add')} data-cy='add-role'><i className='fg fg-add'></i></Button>
          </div>
        </div>
        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            <div className='main-content'>
              <header className='main-header'>{c('txt-privileges')}</header>
              <div className='table-content'>
                <div className='table no-pagination'>
                  <MuiTableContent
                    data={userPrivileges}
                    tableOptions={tableOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <PrivilegeEdit
          ref={ref => { this.editor = ref }}
          onDone={() => setTimeout(this.getPrivilegesData, 1000)} />

        <PrivilegeAdd
          ref={ref => { this.addor = ref }}
          onDone={() => setTimeout(this.getPrivilegesData, 1000)} />
      </div>
    )
  }
}

Roles.contextType = BaseDataContext;

Roles.defaultProps = {
};

export default Roles;