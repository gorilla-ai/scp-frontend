import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Checkbox from 'react-ui/build/src/components/checkbox'
import ComboBox from 'react-ui/build/src/components/combobox'
import DataTable from 'react-ui/build/src/components/table'
import DropDownList from 'react-ui/build/src/components/dropdown'
import FileInput from 'react-ui/build/src/components/file-input'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import ToggleBtn from 'react-ui/build/src/components/toggle-button'
import ButtonGroup from 'react-ui/build/src/components/button-group'

import {HocPagination as Pagination} from '../../common/pagination'
import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'
import Name from './owner-mixname'
import {HocConfig as Config} from '../../common/configuration'
import RowMenu from '../../common/row-menu'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

class NetworkTopology extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list: {
        department: [],
        title: []
      },
      search: {
        name: '',
        department: 'all',
        title: 'all',
      },
      modalTitle: '',
      modalOwnerOpen: false,
      openFilter: false,
      openADConnect: false,
      openADImport: false,
      adList: [],
      adSelected: null,
      ldap: {
        type: 'ad',
        ip: '',
        port: '',
        domain: '',
        admin: '',
        password: '',
        filterOutExist: false
      },
      owner: {
        dataFieldsArr: ['_menu', 'ownerID', 'ownerName', 'departmentName', 'titleName', 'options'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'ownerID',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        removePhoto: false,
        add: {}
      },
      error: false,
      info: ''
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentWillMount() {
   this.getSearchData(); //For search on the left nav
   this.getOwnerData(); //For main table
  }
  getSearchData = () => {
    const {baseUrl} = this.props;
    const apiNameType = [1, 2]
    let apiArr = [];

    _.forEach(apiNameType, val => {
      const json = {nameType: val}      

      apiArr.push({
        url: `${baseUrl}/api/name/_search`,
        data: JSON.stringify(json),
        type: 'POST',
        contentType: 'application/json'
      });
    })

    this.ah.all(apiArr)
    .then(data => {
      let tempList = {...this.state.list};
      let department = [{value: 'all', text: t('txt-all')}];
      let title = [{value: 'all', text: t('txt-all')}];

      _.forEach(data[0], val => {
        department.push({
          value: val.nameUUID,
          text: val.name
        });
      })

      _.forEach(data[1], val => {
        title.push({
          value: val.nameUUID,
          text: val.name
        });
      })

      tempList.department = department;
      tempList.title = title;

      this.setState({
        list: tempList
      }, () => {
        this.closeDialog();
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getOwnerData = (fromSearch) => {
    const {baseUrl} = this.props;
    const {owner, search} = this.state;
    let dataObj = {
      sort: owner.sort.field,
      order: owner.sort.desc ? 'desc' : 'asc',
      page: fromSearch === 'search' ? 1 : owner.currentPage,
      pageSize: parseInt(owner.pageSize)
    };

    if (fromSearch === 'search') {
      dataObj.ownerName = '%' + search.name + '%';

      if (search.department != 'all') {
        dataObj.department = search.department;
      }

      if (search.title != 'all') {
        dataObj.title = search.title;
      }
    }

    this.ah.one({
      url: `${baseUrl}/api/owner/_search`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      let tempOwner = {...owner};
      tempOwner.dataContent = data.rows;
      tempOwner.totalCount = data.counts;
      tempOwner.currentPage = fromSearch === 'search' ? 1 : owner.currentPage;

      let dataFields = {};
      owner.dataFieldsArr.forEach(tempData => {
        dataFields[tempData] = {
          label: tempData === '_menu' ? '' : t(`ownerFields.${tempData}`),
          sortable: (tempData === 'ownerID' || tempData === 'ownerName') ? true : null,
          formatter: (value, allValue) => {
            if (tempData === '_menu') {
              return <RowMenu 
                      page='owner'
                      active={value}
                      targetEdit={allValue}
                      targetDelete={allValue}
                      text={{
                        edit: t('txt-edit'),
                        delete: t('txt-delete')
                      }}
                      onEdit={this.getAddOwnerContent}
                      onDelete={this.openDeleteOwnerModal} />
            } else {
              return <span>{value}</span>;
            }
          }
        };
      })

      tempOwner.dataFields = dataFields;

      if (!fromSearch) {
        let ownerListArr = [];

        _.forEach(data.rows, val => {
          ownerListArr.push({
            value: val.ownerName,
            text: val.ownerName
          });
        })

        tempOwner.ownerListArr = ownerListArr;
      }

      this.setState({
        owner: tempOwner
      }, () => {
        this.closeDialog();
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleRowMouseOver(value, allValue, evt) {
    let tmp = {...this.state.owner}

    tmp['dataContent'] = _.map(tmp['dataContent'], el => {
      return {
        ...el,
        _menu: el.ownerUUID === allValue.ownerUUID ? true : false
      }
    })

    this.setState({owner: tmp})
  }
  handleTableSort = (value) => {
    let tempOwner = {...this.state.owner};
    tempOwner.sort.field = value.field;
    tempOwner.sort.desc = !tempOwner.sort.desc;

    this.setState({
      owner: tempOwner
    }, () => {
      this.getOwnerData();
    });
  }
  handleSearchChange = (type, value) => {
    let tempSearch = {...this.state.search};
    tempSearch[type] = value.trim();

    this.setState({
      search: tempSearch
    });
  }
  handlePaginationChange = (type, value) => {
    let tempOwner = {...this.state.owner};
    tempOwner[type] = value;

    if (type === 'pageSize') {
      tempOwner.currentPage = 1;
    }

    this.setState({
      owner: tempOwner
    }, () => {
      this.getOwnerData();
    });
  }
  handleDataChange = (type, value) => {
    let tempOwner = {...this.state.owner};
    tempOwner.add[type] = value;

    this.setState({
      owner: tempOwner
    });
  }
  handleRemovePhoto = () => {
    let tempOwner = {...this.state.owner};
    tempOwner.removePhoto = !tempOwner.removePhoto;

    this.setState({
      owner: tempOwner
    });
  }
  displayAddOwner = () => {
    const {contextRoot} = this.props;
    const {owner, list} = this.state;

    return (
      <div className='wide-dialog add-owner'>
        <div className='content'>
          <div className='left'>
            <div className='owner'>
              <label htmlFor='ownerPhotoUpload'>{t('txt-uploadPhoto')}</label>
              <FileInput
                id='ownerPhotoUpload'
                name='file'
                btnText={t('txt-uploadPhoto')}
                validate={{
                  max: 10,
                  extension: ['.jpg', '.jpeg', '.png'],
                  t: (code, params) => {
                    if (code[0] === 'file-wrong-format') {
                      return t('txt-file-format-error') + ` ${params.extension}`
                    }
                  }
                }}
                onChange={this.handleDataChange.bind(this, 'file')} />
              <div className='photo'>
                {owner.add.base64 &&
                  <div>
                    <img src={owner.add.base64} title={t('network-topology.txt-profileImage')} />

                    <div className='removePhoto'>
                      <label htmlFor='removePhoto'>{t('network-topology.txt-removePhoto')}</label>
                      <Checkbox
                        id='removePhoto'
                        onChange={this.handleRemovePhoto}
                        checked={owner.removePhoto} />
                    </div>
                  </div>
                }
                {!owner.add.base64 &&
                  <img src={contextRoot + '/images/empty_profile.png'} title={t('network-topology.txt-profileImage')} />
                }
              </div>
            </div>
          </div>

          <div className='right'>
            <div>
              <label htmlFor='ownerID'>{t('ownerFields.ownerID')}</label>
              <Input
                id='ownerID'
                className='add'
                placeholder=''
                required={true}
                validate={{
                  t: et
                }}
                value={owner.add.ownerID}
                onChange={this.handleDataChange.bind(this, 'ownerID')} />

              <label htmlFor='ownerName'>{t('ownerFields.ownerName')}</label>
              <Input
                id='ownerName'
                className='add'
                required={true}
                validate={{
                  t: et
                }}
                value={owner.add.ownerName}
                onChange={this.handleDataChange.bind(this, 'ownerName')} />
              <label htmlFor='ownerDept'>{t('ownerFields.department')}</label>
              <ComboBox
                id='ownerDept'
                className='add'
                list={_.drop(list.department)}
                search={{
                  enabled: true
                }}
                onChange={this.handleDataChange.bind(this, 'department')}
                value={owner.add.department} />
              <label htmlFor='ownerTitle'>{t('ownerFields.title')}</label>
              <ComboBox
                id='ownerTitle'
                className='add'
                list={_.drop(list.title)}
                search={{
                  enabled: true
                }}
                onChange={this.handleDataChange.bind(this, 'title')}
                value={owner.add.title} />
            </div>
          </div>
        </div>
      </div>
    )
  }
  getAddOwnerContent = (allValue) => {
    const {baseUrl} = this.props;
    const titleText = allValue.ownerID ? t('network-topology.txt-editOwner') : t('network-topology.txt-addOwner');
    let tempOwner = {...this.state.owner};

    if (allValue.ownerID) {
      this.ah.one({
        url: `${baseUrl}/api/owner?uuid=${allValue.ownerUUID}`,
        type: 'GET'
      })
      .then(data => {
        tempOwner.add = {...data};

        this.setState({
          owner: tempOwner,
          modalTitle: titleText,
          modalOwnerOpen: true
        });
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    } else {
      tempOwner.add = {
        ownerUUID: '',
        ownerID: '',
        ownerName: '',
        department: '',
        title: ''
      };

      this.setState({
        owner: tempOwner,
        modalTitle: titleText,
        modalOwnerOpen: true
      });
    }
  }
  handleOwnerConfirm = () => {
    const {baseUrl} = this.props;
    const {owner} = this.state;

    if (!owner.add.ownerID || !owner.add.ownerName) {
      this.setState({error: true, info: et('fill-required-fields')})
      return
    }
    else {
      this.setState({error: false, info: ''})
    }

    let requestType = 'POST';
    let formData = new FormData();
    let updatePic = owner.removePhoto ? true : false;

    formData.append('ownerID', owner.add.ownerID);
    formData.append('ownerName', owner.add.ownerName);
    formData.append('department', owner.add.department);
    formData.append('title', owner.add.title);

    if (owner.add.file) {
      updatePic = true;
      formData.append('file', owner.add.file);
    }
    formData.append('updatePic', updatePic);

    if (owner.add.ownerUUID) {
      formData.append('ownerUUID', owner.add.ownerUUID);
      requestType = 'PATCH';
    }

    this.ah.one({
      url: `${baseUrl}/api/owner`,
      data: formData,
      type: requestType,
      processData: false,
      contentType: false
    })
    .then(data => {
      // this.getSearchData();
      this.getOwnerData();
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), t('network-topology.txt-ownerDuplicated'));
    })
  }
  closeDialog = () => {
    let tempOwner = {...this.state.owner};
    tempOwner.removePhoto = false;

    this.setState({
      owner: tempOwner,
      modalOwnerOpen: false
    });
  }
  modalOwnerDialog = () => {
    const {modalTitle, error, info} = this.state;
    const titleText = modalTitle;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog.bind(this)},
      confirm: {text: t('txt-confirm'), handler: this.handleOwnerConfirm.bind(this)}
    };

    return (
      <ModalDialog
        id="ownerModalDialog"
        className="modal-dialog"
        infoClassName={cx({'c-error':error})} info={info}
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayAddOwner()}
      </ModalDialog>
    )
  }
  getDeleteOwnerContent = (value) => {
    if (value) {
      let tempOwner = {...this.state.owner};
      tempOwner.add = {...value};

      this.setState({
        owner: tempOwner
      });
    }

    return (
      <div className='content delete'>
        <span>{t('network-topology.txt-deleteOwnerMsg')}: {value.ownerID}?</span>
      </div>
    )
  }
  openDeleteOwnerModal = (value) => {
    PopupDialog.prompt({
      title: t('network-topology.txt-deleteOwner'),
      id: 'modalWindow',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteOwnerContent(value),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteOwner();
        }
      }
    });
  }
  deleteOwner = () => {
    const {baseUrl} = this.props;
    const {owner} = this.state;

    ah.one({
      url: `${baseUrl}/api/owner?uuid=${owner.add.ownerUUID}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getOwnerData();
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  connectAD() {
    const {baseUrl} = this.props
    const {ldap} = this.state

    if (ldap.ip && ldap.port && ldap.domain && ldap.admin && ldap.password) {
      this.setState({error: false, info: ''})
    }
    else {
      this.setState({error: true, info: et('fill-required-fields')})
      return
    }

    let dataObj = {
      domain: ldap.domain,
      admin: ldap.admin,
      password: ldap.password,
      filterOutExist: ldap.filterOutExist
    }
    let str = ''
    _.map(ldap.domain.split('.'), el => {
      str += 'DC=' + el + ','
    })

    dataObj.domain = str.substring(0, str.length - 1)

    if (ldap.type === 'ad') {
      dataObj.adIp = ldap.ip
      dataObj.adPort = ldap.port
    }

    if (ldap.type === 'ldap') {
      dataObj.ldapIp = ldap.ip
      dataObj.ldapPort = ldap.port
    }

    this.ah.one({
      url: `${baseUrl}/api/owner/${ldap.type}/_search`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      this.setState({
        adList: data,
        openADConnect: false,
        openADImport:true,
        adSelected: null
      })
    })
    .catch(err => {
      let msg = ''

      if (err && _.includes(err.message, '-9004')) {
        msg = et('txt-param-null')
      }
      else if (err && _.includes(err.message, '-9016')) {
        msg = et('txt-account-fail')
      }
      else {
        msg = err.message
      }

      helper.showPopupMsg('', t('txt-error'), msg);
    })
  }
  switchADImport() {
    const {openADImport} = this.state
    this.setState({openADImport: !openADImport})
  }
  handleADSelected(adSelected) {
    this.setState({adSelected})
  }
  handleADImport() {
    const {adList, adSelected} = this.state
    const {baseUrl} = this.props
    let dataObj = []

    _.map(adSelected, el => {
      _.map(adList, ad => {
        if (ad.ownerID === el) {
          dataObj.push(ad)
        }
      })
    })

    this.ah.one({
      url: `${baseUrl}/api/owners`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      this.setState({openADImport:false}, () => {this.getOwnerData()})
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  modalADImport() {
    const {adList, adSelected} = this.state
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.switchADImport.bind(this)},
      confirm: {text: t('txt-import'), handler: this.handleADImport.bind(this)}
    }

    return(
      <ModalDialog className='modal-dialog' title={t('txt-adImport')} draggable={true} global={true} actions={actions} closeAction='cancel'>
        <div className='narrow-dialog'>
          <DataTable
            className='main-table'
            data={adList}
            selected={adSelected}
            onSelectionChange={this.handleADSelected.bind(this)}
            selection={{enabled:true, toggleAll:true, multiSelect: true }}
            rowIdField='ownerID'
            fields={{
              ownerID: { label: t('ownerFields.ownerID') },
              ownerName: { label: t('ownerFields.ownerName') }
            }}  />
        </div>
      </ModalDialog>
    )
  }
  handleADChange(type, value) {
    let temp = {...this.state.ldap}
    temp[type] = value
    this.setState({ldap: temp})
  }
  switchADConnect() {
    const {openADConnect} = this.state
    this.setState({openADConnect: !openADConnect})
  }
  modalADConnect() {
    const {ldap, error, info} = this.state
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.switchADConnect.bind(this)},
      confirm: {text: t('txt-connect'), handler: this.connectAD.bind(this)}
    }

    return (
      <ModalDialog className='modal-dialog' title={t('txt-adConnect')} infoClassName={cx({'c-error':error})} info={info}
                   draggable={true} global={true} actions={actions} closeAction='cancel'>
        <div className='narrow-dialog'>
          <div className='content'>
            <ButtonGroup list={[{value:'ad', text:'AD'}, {value:'ldap', text:'LDAP'}]}
                         onChange={this.handleADChange.bind(this, 'type')} value={ldap.type} />
            <label htmlFor='ip2' className='first-label'>IP</label>
            <Input id='ip2' required={true} onChange={this.handleADChange.bind(this, 'ip')} value={ldap.ip} />
            <label htmlFor='port'>Port</label>
            <Input id='port' required={true} onChange={this.handleADChange.bind(this, 'port')} value={ldap.port} />
            <label htmlFor='domain'>Domain</label>
            <Input id='domain' required={true} onChange={this.handleADChange.bind(this, 'domain')} value={ldap.domain} />
            <label htmlFor='admin'>Username</label>
            <Input id='admin' required={true} onChange={this.handleADChange.bind(this, 'admin')} value={ldap.admin} />
            <label htmlFor='password'>Password</label>
            <Input id='password' required={true} type='password' onChange={this.handleADChange.bind(this, 'password')} value={ldap.password} />
            <div style={{display: 'flex'}}>
              <Checkbox id='filterOutExist' onChange={this.handleADChange.bind(this, 'filterOutExist')} checked={ldap.filterOutExist} />
              <span>Filter Out Exist</span>
            </div>
          </div>
        </div>
      </ModalDialog>
    )
  }
  openName() {
    this.name._component.open()
  }
  onDone() {
    this.getSearchData()
    this.getOwnerData()
  }
  setFilter(flag) {
    this.setState({openFilter: flag})
  }
  clearFilter() {
    const clear = { name: '', department: 'all', title: 'all' }
    this.setState({search: clear})
  }
  renderFilter() {
    const {list, search, openFilter} = this.state

    return (
      <div className={cx('main-filter', {'active': openFilter})}>
        <i className='fg fg-close' onClick={this.setFilter.bind(this, false)} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='ownerName' className='first-label'>{t('ownerFields.ownerName')}</label>
            <Input id='ownerName' placeholder={t('txt-enterName')} onChange={this.handleSearchChange.bind(this, 'name')} value={search.name} />
          </div>
          <div className='group'>
            <label htmlFor='ownerDept'>{t('ownerFields.department')}</label>
            <DropDownList id='ownerDept' list={list.department} required={true} onChange={this.handleSearchChange.bind(this, 'department')} value={search.department} />
          </div>
          <div className='group'>
            <label htmlFor='ownerTitle'>{t('ownerFields.title')}</label>
            <DropDownList id='ownerTitle' list={list.title} required={true} onChange={this.handleSearchChange.bind(this, 'title')} value={search.title} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getOwnerData.bind(this, 'search')}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter.bind(this)}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {modalOwnerOpen, owner, openFilter, openADConnect, openADImport} = this.state;

    return (
      <div>
        { modalOwnerOpen && this.modalOwnerDialog() }
        { openADConnect && this.modalADConnect() }
        { openADImport && this.modalADImport() }

        <Name ref={ref => { this.name=ref }} onDone={this.onDone.bind(this)} />

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button onClick={this.switchADConnect.bind(this)} title={t('txt-adImport')}><i className='fg fg-signage-ad'></i></button>
            <button onClick={this.openName.bind(this)} title={t('txt-mixName')}><i className='fg fg-id'></i></button>
            <button onClick={this.getAddOwnerContent} title={t('network-topology.txt-addOwner')}><i className='fg fg-add'></i></button>
            <button onClick={this.setFilter.bind(this, !openFilter)} className={cx('last', {'active': openFilter})} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          <div className='data-table'>
            { this.renderFilter() }

            <div className='main-content'>
              <div className='table-content'>
                <div className='table normal'>
                  {owner.dataFields &&
                    <DataTable
                      className='main-table'
                      fields={owner.dataFields}
                      data={owner.dataContent}
                      onRowMouseOver={this.handleRowMouseOver.bind(this)}
                      sort={owner.dataContent.length === 0 ? {} : owner.sort}
                      onSort={this.handleTableSort} />
                  }
                </div>
                <footer>
                  <Pagination
                    totalCount={owner.totalCount}
                    pageSize={owner.pageSize}
                    currentPage={owner.currentPage}
                    onPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                    onDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

NetworkTopology.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

const HocNetworkTopology = withLocale(NetworkTopology);
export { NetworkTopology, HocNetworkTopology };