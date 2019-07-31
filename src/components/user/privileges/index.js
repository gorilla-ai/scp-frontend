import React, {Component} from 'react'
import i18n from 'i18next'
import PropTypes from 'prop-types';
import cx from 'classnames'
import _ from 'lodash'

import DataTable from 'react-ui/build/src/components/table'
import Input from 'react-ui/build/src/components/input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import helper from '../../common/helper'
import {HocConfig as Config} from '../../common/configuration'
import RowMenu from '../../common/row-menu'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

import PrivilegeEdit from './edit'
import PrivilegeAdd from './add'

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
  showEditDialog(id) {
    this.editor.open(id);
  }
  showAddDialog = () => {
    this.addor.open();
  }
  showDeleteDialog = (id) => {
    const {baseUrl} = this.props;

    PopupDialog.confirm({
      display: t('txt-delete-privilege'),
      cancelText: gt('btn-cancel'),
      confirmText: gt('btn-confirm'),
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
    })
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
          return <RowMenu page='privileges' active={val} targetEdit={allValue} targetDelete={allValue.privilegeid} 
                          text={{ edit: c('txt-edit'), delete: c('txt-delete') }}
                          onEdit={this.showEditDialog.bind(this)} onDelete={this.showDeleteDialog} />
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
  handleRowMouseOver(value, allValue, evt) {
    let tmp = {...this.state.data}

    tmp = _.map(tmp, el => {
      return {...el, _menu: el.privilegeid === allValue.privilegeid ? true : false}
    })

    this.setState({data: tmp})
  }

  render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {data, dataFields, info, error} = this.state;

    return (
      <div>
        <div className='sub-nav-header'>
          <div className='breadcrumb' />
          <i className='c-link fg fg-add' onClick={this.showAddDialog} title={t('txt-add')}></i>
        </div>
        <div className='data-content'>
          <Config 
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          <div className='data-table manage scroll-x'>
            <DataTable
              className='table-100'
              data={data}
              fields={dataFields}
              rowIdField='privilegeid'
              onRowMouseOver={this.handleRowMouseOver.bind(this)}
              info={info}
              infoClassName={cx({'c-error':error})} />
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