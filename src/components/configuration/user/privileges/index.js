import React, {Component} from 'react'
import i18n from 'i18next'
import PropTypes from 'prop-types';
import cx from 'classnames'
import _ from 'lodash'

import ContextMenu from 'react-ui/build/src/components/contextmenu'
import DataTable from 'react-ui/build/src/components/table'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../../common/context';
import {HocConfig as Config} from '../../../common/configuration'
import helper from '../../../common/helper'
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
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the account privileges
 */
class Roles extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      dataFieldsArr: ['_menu', 'privilegeid', 'name', 'permits'],
      dataFields: {}
    };
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.loadList();
  }
  /**
   * Get and set privileges list
   * @method
   */
  loadList = () => {
    const {baseUrl} = this.context;
    const {dataFieldsArr} = this.state;

    ah.one({
      url: `${baseUrl}/api/account/privileges?getPermits=true`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempFields = {};
        dataFieldsArr.forEach(tempData => {
          tempFields[tempData] = {
            hide: tempData === 'privilegeid' ? true : false,
            label: tempData === '_menu' ? '' : t(`privilegeFields.${tempData}`),
            sortable: tempData === 'name' ? true : null,
            formatter: (value, allValue, i) => {
              if (tempData === '_menu') {
                return (
                  <div className={cx('table-menu', {'active': value})}>
                    <button onClick={this.handleRowContextMenu.bind(this, allValue)}><i className='fg fg-more'></i></button>
                  </div>
                )
              } else if (tempData === 'permits') {
                return <div className='flex-item'>{this.displayPermit(value)}</div>
              } else {
                return <span>{value}</span>;
              }
            }
          }
        })

        this.setState({
          data: data.rt,
          dataFields: tempFields
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
   * Open account privilege edit dialog
   * @method
   * @param {string} id - selected privilege id
   */
  showEditDialog = (id) => {
    this.editor.openPrivilegeEdit(id);
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
          ah.one({
            url: `${baseUrl}/api/account/privilege?privilegeId=${id}`,
            type: 'DELETE',
            contentType: 'application/json'
          })
          .then(data => {
            if (!data.rt) {
              helper.showPopupMsg(c('txt-privilegeError'), c('txt-error'));
            }

            this.loadList();
            return null;
          })
          .catch(err => {
            helper.showPopupMsg('', c('txt-error'), err.message);
          })
        }
      }
    });
  }
  /**
   * Construct and display table context menu
   * @method
   * @param {object} allValue - owner data
   * @param {object} evt - mouseClick events
   */
  handleRowContextMenu = (allValue, evt) => {
    const menuItems = [
      {
        id: 'edit',
        text: c('txt-edit'),
        action: () => this.showEditDialog(allValue)
      },
      {
        id: 'delete',
        text: c('txt-delete'),
        action: () => this.showDeleteDialog(allValue, allValue.privilegeid)
      }
    ];

    ContextMenu.open(evt, menuItems, 'configUserPrivilegesMenu');
    evt.stopPropagation();
  }
  /**
   * Display role privilege data
   * @method
   * @param {array} value - role list
   * @returns HTML DOM
   */
  displayPermit = (value) => {
    const permitList = _.map(value, (val, i) => {
      return <span key={i} className='permit'>{val.dispname}</span>
    });

    return permitList;
  }
  /**
   * Handle table row mouse over
   * @method
   * @param {string} id - selected privilege id
   * @param {object} allValue - privilege data
   * @param {object} evt - MouseoverEvents
   */
  handleRowMouseOver = (id, allValue, evt) => {
    let tempData = {...this.state.data};
    tempData = _.map(tempData, el => {
      return {
        ...el,
        _menu: el.privilegeid === allValue.privilegeid ? true : false
      };
    });

    this.setState({
      data: tempData
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {data, dataFields, info, error} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className='last' onClick={this.showAddDialog} title={t('txt-add')}><i className='fg fg-add'></i></button>
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
                  <DataTable
                    className='main-table'
                    data={data}
                    fields={dataFields}
                    rowIdField='privilegeid'
                    onRowMouseOver={this.handleRowMouseOver}
                    info={info}
                    infoClassName={cx({'c-error':error})} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <PrivilegeEdit
          ref={ref => { this.editor = ref }}
          onDone={() => setTimeout(this.loadList, 1000)} />

        <PrivilegeAdd
          ref={ref => { this.addor = ref }}
          onDone={() => setTimeout(this.loadList, 1000)} />
      </div>
    )
  }
}

Roles.contextType = BaseDataContext;

Roles.defaultProps = {
};

export default Roles;