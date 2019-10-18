import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Checkbox from 'react-ui/build/src/components/checkbox'
import DropDownList from 'react-ui/build/src/components/dropdown'
import FileInput from 'react-ui/build/src/components/file-input'
import Input from 'react-ui/build/src/components/input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

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
   this.getOwnerData(); //For main table
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state === 'tableList') {
      this.toggleContent('tableList');
    }
  }
  getSearchData = () => {
    const {baseUrl} = this.props;
    const {list} = this.state;
    const apiNameType = [1, 2]; //1: Department, 2: Title
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

      tempList.department = _.cloneDeep(departmentList);
      tempList.title = _.cloneDeep(titleList);
      tempList.department.unshift({value: 'all', text: t('txt-all')});
      tempList.title.unshift({value: 'all', text: t('txt-all')});

      this.setState({
        list: tempList
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
      };
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
    const {list, owner} = this.state;
    let tempList = {...list};
    let tempOwner = {...owner};
    let addOwnerType = '';
    let addOwnerTitle = '';

    if (type === 'addOwner') {
      tempList.department.shift(); //Remove 'all' option
      tempList.title.shift(); //Remove 'all' option

      if (options === 'new') {
        addOwnerType = 'new';
        addOwnerTitle = t('txt-addNewOwner');
        tempOwner.info = {
          department: list.department[0].value,
          title: list.title[0].value
        };
      } else if (options === 'edit') {
        addOwnerType = 'edit';
        addOwnerTitle = t('txt-editOwner');
      }
      tempOwner.removePhoto = false;
    } else if (type === 'tableList') {
      tempList.department.unshift({value: 'all', text: t('txt-all')});
      tempList.title.unshift({value: 'all', text: t('txt-all')});
    }

    this.setState({
      activeContent: type,
      list: tempList,
      addOwnerType,
      addOwnerTitle,
      openFilter: false,
      owner: tempOwner,
      previewOwnerPic: ''
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
        <span>{t('txt-delete-msg')}: {value.ownerID}?</span>
      </div>
    )
  }
  openDeleteOwnerModal = (value) => {
    PopupDialog.prompt({
      title: t('network-topology.txt-deleteOwner'),
      id: 'modalWindowSmall',
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
  openName = () => {
    this.name._component.open();
  }
  onDone = () => {
    this.getSearchData();
    this.getOwnerData();
  }
  setFilter = (flag) => {
    this.setState({
      openFilter: flag
    });
  }
  clearFilter = () => {
    const tempSearch = {
      name: '',
      department: 'all',
      title: 'all'
    };

    this.setState({
      search: tempSearch
    });
  }
  renderFilter = () => {
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
      activeContent,
      list,
      addOwnerTitle,
      owner,
      openFilter,
      previewOwnerPic
    } = this.state;

    return (
      <div>
        <Name ref={ref => { this.name=ref }} onDone={this.onDone.bind(this)} />

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('last', {'active': openFilter})} onClick={this.setFilter.bind(this, !openFilter)} title={t('txt-filter')} disabled={activeContent !== 'tableList'}><i className='fg fg-filter'></i></button>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          <div className='parent-content'>
            { this.renderFilter() }

            {activeContent === 'tableList' &&
              <div className='main-content'>
                <header className='main-header'>{t('txt-ownerList')}</header>
                <button className='standard btn last' onClick={this.openName}>{t('txt-manageDepartmentTitle')}</button>
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
              <div className='main-content basic-form'>
                <header className='main-header'>{addOwnerTitle}</header>
                <button className='standard btn last' onClick={this.openName} >{t('txt-manageDepartmentTitle')}</button>
                <div className='form-group steps-owner'>
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