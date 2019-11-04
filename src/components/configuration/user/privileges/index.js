import React, {Component} from 'react'
import i18n from 'i18next'
import PropTypes from 'prop-types';
import cx from 'classnames'
import _ from 'lodash'

import DataTable from 'react-ui/build/src/components/table'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {HocConfig as Config} from '../../../common/configuration'
import helper from '../../../common/helper'
import PrivilegeAdd from './add'
import PrivilegeEdit from './edit'
import RowMenu from '../../../common/row-menu'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const log = require('loglevel').getLogger('user/privileges')
const c = i18n.getFixedT(null, 'connections');
const t = i18n.getFixedT(null, 'privileges');
const gt =  i18n.getFixedT(null, 'app');

class Roles extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      dataFields: {}
    };
  }
  componentDidMount() {
    this.loadList();
  }
  showEditDialog = (id) => {
    this.editor.open(id);
  }
  showAddDialog = () => {
    this.addor.open();
  }
  getDeletePrivilegeContent = (allValue) => {
    const msg = c('txt-delete-msg') + ': ' + allValue.name;

    return (
      <div className='content delete'>
        <span>{msg}?</span>
      </div>
    )
  }
  showDeleteDialog = (allValue, id) => {
    const {baseUrl} = this.props;

    PopupDialog.prompt({
      title: c('txt-deletePrivilege'),
      id: 'modalWindowSmall',
      confirmText: c('txt-delete'),
      cancelText: c('txt-cancel'),
      display: this.getDeletePrivilegeContent(allValue),
      act: (confirmed) => {
        if (confirmed) {
          ah.one({
            url: `${baseUrl}/api/account/privilege?privilegeId=${id}`,
            type: 'DELETE',
            contentType: 'application/json'
          })
          .then(data => {
            setTimeout(this.loadList, 1000);
          })
          .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message);
          })
        }
      }
    });
  }
  loadList = () => {
    const {baseUrl} = this.props;

    ah.one({
      url: `${baseUrl}/api/account/privileges?getPermits=true`,
      type: 'GET'
    })
    .then(data => {
      const dataFields = {
        _menu: {label: '', sortable: null, style:{width: '10%'}, formatter: (val, allValue) => {
          return <RowMenu
            page='privileges'
            active={val}
            targetEdit={allValue}
            targetDelete={allValue.privilegeid}
            text={{
              edit: c('txt-edit'),
              delete: c('txt-delete')
            }}
            onEdit={this.showEditDialog}
            onDelete={this.showDeleteDialog.bind(this, allValue)} />
        }},
        privilegeid: {label: 'ID', hide: true},
        name: {label: t('l-name'), sortable: true, style:{width: '30%', textAlign: 'left'}},
        permits: {
          label: t('l-permits'),
          sortable: null,
          style:{width: '50%', textAlign: 'left'},
          formatter: (val, {permits}) => {
            return <span>
              {
                _.map(permits, (permit, index) => {
                  return <span key={index} className='permit' > {permit.dispname} </span>
                })
              }
            </span>
          }
        }
      };

      this.setState({
        data: data.rt,
        dataFields
      });
    })
    .catch(err => {
      this.setState({
        error: true,
        info: err
      });
    })
  }
  handleRowMouseOver = (value, allValue, evt) => {
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
    const {baseUrl, contextRoot, language, locale, session} = this.props;
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
            contextRoot={contextRoot}
            language={language}
            locale={locale}
            session={session} />

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
          baseUrl={baseUrl}
          contextRoot={contextRoot}
          ref={ref => { this.editor = ref }} 
          onDone={() => setTimeout(this.loadList, 1000)} />

        <PrivilegeAdd 
          baseUrl={baseUrl}
          contextRoot={contextRoot}
          ref={ref => { this.addor = ref }}
          onDone={() => setTimeout(this.loadList, 1000)} />
      </div>
    )
  }
}

Roles.defaultProps = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

export default Roles;