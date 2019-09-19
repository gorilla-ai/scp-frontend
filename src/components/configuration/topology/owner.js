import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Checkbox from 'react-ui/build/src/components/checkbox'
import DataTable from 'react-ui/build/src/components/table'
import DropDownList from 'react-ui/build/src/components/dropdown'
import FileInput from 'react-ui/build/src/components/file-input'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Tabs from 'react-ui/build/src/components/tabs'
import ButtonGroup from 'react-ui/build/src/components/button-group'

import {HocConfig as Config} from '../../common/configuration'
import helper from '../../common/helper'
import Name from './owner-mixname'
import RowMenu from '../../common/row-menu'
import TableContent from '../../common/table-content'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

class NetworkOwner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'ownerList',
      activeContent: 'tableList', //tableList, addOwner
      list: {
        department: [],
        title: []
      },
      search: {
        name: '',
        department: 'all',
        title: 'all',
      },
      addOwnerType: '',
      addOwnerTitle: '',
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
        info: {}
      },
      error: false,
      info: '',
      previewOwnerPic: ''
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
   this.getSearchData(); //For search on the left nav
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state === 'tableList') {
      this.toggleContent('tableList');
    }
  }
  getSearchData = () => {
    const {baseUrl} = this.props;
    const {list, search, owner} = this.state;
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
      let tempList = {...list};
      let departmentList = [];
      let titleList = [];

      _.forEach(data[0], val => {
        departmentList.push({
          value: val.nameUUID,
          text: val.name
        });
      })

      _.forEach(data[1], val => {
        titleList.push({
          value: val.nameUUID,
          text: val.name
        });
      })

      tempList.department = departmentList;
      tempList.title = titleList;

      const tempSearch = {...search};
      const tempOwner = {...owner};
      tempSearch.department = departmentList[0].value;
      tempSearch.title = titleList[0].value;
      tempOwner.info.department = departmentList[0].value;
      tempOwner.info.title = titleList[0].value;      

      this.setState({
        list: tempList,
        search: tempSearch,
        owner: tempOwner
      }, () => {
        this.getOwnerData(); //For main table
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
      pageSize: Number(owner.pageSize)
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
                      onEdit={this.getOwnerInfo}
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
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleRowMouseOver = (value, allValue, evt) => {
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
    tempOwner[type] = Number(value);

    if (type === 'pageSize') {
      tempOwner.currentPage = 1;
    }

    this.setState({
      owner: tempOwner
    }, () => {
      this.getOwnerData();
    });
  }
  getOwnerInfo = (allValue) => {
    const {baseUrl} = this.props;
    let tempOwner = {...this.state.owner};

    if (allValue.ownerID) {
      this.ah.one({
        url: `${baseUrl}/api/owner?uuid=${allValue.ownerUUID}`,
        type: 'GET'
      })
      .then(data => {
        if (data) {
          tempOwner.info = {...data};

          this.setState({
            owner: tempOwner
          }, () => {
            this.toggleContent('addOwner', 'edit');
          });          
        }
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
  }
  toggleContent = (type, options) => {
    const {owner} = this.state;
    let tempOwner = {...owner};
    let addOwnerType = '';
    let addOwnerTitle = '';

    if (type === 'addOwner') {
      if (options === 'new') {
        addOwnerType = 'new';
        addOwnerTitle = t('txt-addNewOwner');
        tempOwner.info = {
          department: owner.info.department,
          title: owner.info.title
        };
      } else if (options === 'edit') {
        addOwnerType = 'edit';
        addOwnerTitle = t('txt-editOwner');
      }
      tempOwner.removePhoto = false;
    }

    this.setState({
      activeContent: type,
      addOwnerType,
      addOwnerTitle,
      owner: tempOwner,
      previewOwnerPic: '',
    });
  }
  handleDataChange = (type, value) => {
    let tempOwner = {...this.state.owner};
    tempOwner.info[type] = value;

    if (type === 'file') {
      const file = value ? URL.createObjectURL(value) : '';

      this.setState({
        previewOwnerPic: file
      });
    }

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
  handleOwnerConfirm = () => {
    const {baseUrl, contextRoot} = this.props;
    const {addOwnerType, owner} = this.state;
    let requestType = 'POST';
    let updatePic = owner.removePhoto;
    let formData = new FormData();
    formData.append('ownerID', owner.info.ownerID);
    formData.append('ownerName', owner.info.ownerName);
    formData.append('department', owner.info.department);
    formData.append('title', owner.info.title);

    if (owner.info.file) {
      updatePic = true;
      formData.append('file', owner.info.file);
    }
    formData.append('updatePic', updatePic);

    if (addOwnerType === 'edit') {
      formData.append('ownerUUID', owner.info.ownerUUID);
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
      this.getSearchData();
      this.getOwnerData();
      this.toggleContent('tableList');
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), t('network-topology.txt-ownerDuplicated'));
    })
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
  getBtnPos = (type) => {
    const {locale} = this.props;

    if (type === 'add') {
      if (locale === 'zh') {
        return '168px';
      } else if (locale === 'en') {
        return '268px';
      }
    }
  }
  render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {
      activeTab,
      activeContent,
      list,
      addOwnerTitle,
      owner,
      openFilter,
      openADConnect,
      openADImport,
      previewOwnerPic
    } = this.state;

    return (
      <div>
        {openADConnect &&
          this.modalADConnect()
        }

        {openADImport &&
          this.modalADImport()
        }

        <Name ref={ref => { this.name=ref }} onDone={this.onDone.bind(this)} />

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button onClick={this.switchADConnect.bind(this)} title={t('txt-adImport')}><i className='fg fg-signage-ad'></i></button>
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

            {activeContent === 'tableList' &&
              <div className='main-content'>
                <Tabs
                  className='subtab-menu'
                  menu={{
                    ownerList: t('txt-ownerList')
                  }}
                  current={activeTab}>
                </Tabs>

                <button className='standard btn last' onClick={this.openName.bind(this)} >{t('txt-manageDepartmentTitle')}</button>
                <button className='standard btn' onClick={this.toggleContent.bind(this, 'addOwner', 'new')} style={{right: this.getBtnPos('add')}}>{t('txt-addNewOwner')}</button>

                <TableContent
                  dataTableData={owner.dataContent}
                  dataTableFields={owner.dataFields}
                  dataTableSort={owner.sort}
                  paginationTotalCount={owner.totalCount}
                  paginationPageSize={owner.pageSize}
                  paginationCurrentPage={owner.currentPage}
                  handleTableSort={this.handleTableSort}
                  handleRowMouseOver={this.handleRowMouseOver}
                  paginationPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                  paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
              </div>
            }

            {activeContent === 'addOwner' &&
              <div className='main-content add-ip-steps'>
                <header className='main-header'>{addOwnerTitle}</header>
                <button className='standard btn last' onClick={this.openName.bind(this)} >{t('txt-manageDepartmentTitle')}</button>
                <div className='steps steps-owner'>
                  <header>{t('ipFields.owner')}</header>
                  <div className='user-pic'>
                    <div className='group'>
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
                    </div>
                    <div className='group'>
                      {previewOwnerPic &&
                        <img src={previewOwnerPic} title={t('network-topology.txt-profileImage')} />
                      }
                      {owner.info.base64 &&
                        <div>
                          <img src={owner.info.base64} title={t('network-topology.txt-profileImage')} />
                          <div className='removePhoto'>
                            <label htmlFor='removePhoto'>{t('network-topology.txt-removePhoto')}</label>
                            <Checkbox
                              id='removePhoto'
                              onChange={this.handleRemovePhoto}
                              checked={owner.removePhoto} />
                          </div>
                        </div>
                      }
                      {!previewOwnerPic && !owner.info.base64 &&
                        <img src={contextRoot + '/images/empty_profile.png'} className='' title={t('network-topology.txt-profileImage')} />
                      }
                    </div>
                  </div>
                  <div className='user-info'>
                    <div className='group'>
                      <label htmlFor='ownerName'>{t('ownerFields.ownerName')}</label>
                      <Input
                        id='ownerName'
                        onChange={this.handleDataChange.bind(this, 'ownerName')}
                        required={true}
                        validate={{
                          t: et
                        }}
                        value={owner.info.ownerName} />
                    </div>
                    <div className='group'>
                      <label htmlFor='ownerID'>{t('ownerFields.ownerID')}</label>
                      <Input
                        id='ownerID'
                        onChange={this.handleDataChange.bind(this, 'ownerID')}
                        required={true}
                        validate={{
                          t: et
                        }}
                        value={owner.info.ownerID} />
                    </div>
                    <div className='group'>
                      <label htmlFor='ownerDepartment'>{t('ownerFields.department')}</label>
                      <DropDownList
                        id='ownerDepartment'
                        list={list.department}
                        required={true}
                        validate={{t: et}}
                        onChange={this.handleDataChange.bind(this, 'department')}
                        value={owner.info.department} />
                    </div>
                    <div className='group'>
                      <label htmlFor='ownerTitle'>{t('ownerFields.title')}</label>
                      <DropDownList
                        id='ownerTitle'
                        list={list.title}
                        required={true}
                        onChange={this.handleDataChange.bind(this, 'title')}
                        value={owner.info.title} />
                    </div>
                  </div>
                </div>
                <footer>
                  <button className='standard' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-cancel')}</button>
                  <button className='next-step' onClick={this.handleOwnerConfirm}>{t('txt-save')}</button>
                </footer>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

NetworkOwner.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

const HocNetworkOwner = withRouter(withLocale(NetworkOwner));
export { NetworkOwner, HocNetworkOwner };