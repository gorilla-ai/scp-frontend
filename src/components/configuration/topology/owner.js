import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Checkbox from 'react-ui/build/src/components/checkbox'
import ContextMenu from 'react-ui/build/src/components/contextmenu'
import DropDownList from 'react-ui/build/src/components/dropdown'
import FileInput from 'react-ui/build/src/components/file-input'
import Input from 'react-ui/build/src/components/input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context';
import {HocConfig as Config} from '../../common/configuration'
import helper from '../../common/helper'
import Manage from './manage'
import TableContent from '../../common/table-content'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

/**
 * Config Topology Owner
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the owner list
 */
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
      showFilter: false,
      owner: {
        dataFieldsArr: ['_menu', 'ownerID', 'ownerName', 'departmentName', 'titleName'],
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
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

   this.getSearchData();
   this.getOwnerData();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state === 'tableList') {
      this.toggleContent('tableList');
    }
  }
  /**
   * Get and set department and title data
   * @method
   */
  getSearchData = () => {
    const {baseUrl} = this.context;
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
      if (data) {
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
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set owner data
   * @method
   * @param {string} fromSearch - option for 'search'
   */
  getOwnerData = (fromSearch) => {
    const {baseUrl} = this.context;
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
      if (data) {
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
                return (
                  <div className={cx('table-menu', {'active': value})}>
                    <button onClick={this.handleRowContextMenu.bind(this, allValue)}><i className='fg fg-more'></i></button>
                  </div>
                )
              } else {
                return <span>{value}</span>
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
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
        text: t('txt-edit'),
        action: () => this.getOwnerInfo(allValue)
      },
      {
        id: 'delete',
        text: t('txt-delete'),
        action: () => this.openDeleteOwnerModal(allValue)
      }
    ];

    ContextMenu.open(evt, menuItems, 'configTopologyOwnerMenu');
    evt.stopPropagation();
  }
  /**
   * Handle table row mouse over
   * @method
   * @param {string} index - index of the owner data
   * @param {object} allValue - owner data
   * @param {object} evt - mouseOver events
   */
  handleRowMouseOver = (index, allValue, evt) => {
    let tempOwner = {...this.state.owner};
    tempOwner['dataContent'] = _.map(tempOwner['dataContent'], el => {
      return {
        ...el,
        _menu: el.ownerUUID === allValue.ownerUUID ? true : false
      };
    })

    this.setState({
      owner: tempOwner
    });
  }
  /**
   * Handle table sort
   * @method
   * @param {object} sort - sort data object
   */
  handleTableSort = (sort) => {
    let tempOwner = {...this.state.owner};
    tempOwner.sort.field = sort.field;
    tempOwner.sort.desc = sort.desc;

    this.setState({
      owner: tempOwner
    }, () => {
      this.getOwnerData();
    });
  }
  /**
   * Handle filter input value change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleSearchChange = (type, value) => {
    let tempSearch = {...this.state.search};
    tempSearch[type] = value.trim();

    this.setState({
      search: tempSearch
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string} value - new page number
   */
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
  /**
   * Get individual owner data
   * @method
   * @param {object} allValue - owner data
   */
  getOwnerInfo = (allValue) => {
    const {baseUrl} = this.context;
    let tempOwner = {...this.state.owner};

    if (!allValue.ownerID) {
      return;
    }

    ah.one({
      url: `${baseUrl}/api/u1/owner?uuid=${allValue.ownerUUID}`,
      type: 'GET'
    })
    .then(data => {
      if (data.rt) {
        data = data.rt;
        tempOwner.info = {...data};

        this.setState({
          owner: tempOwner
        }, () => {
          this.toggleContent('addOwner', 'edit');
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle and display page content
   * @method
   * @param {string} type - content type ('addOwner' or 'tableList')
   * @param {string} options - options for 'new' or 'edit'
   */
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
        tempOwner.info = {};

        if (list.department[0] && list.title[0]) {
          tempOwner.info = {
            department: list.department[0].value,
            title: list.title[0].value
          };
        }
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
      showFilter: false,
      owner: tempOwner,
      previewOwnerPic: ''
    });
  }
  /**
   * Handle add/edit owner data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
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
  /**
   * Handle remove owner photo checkbox
   * @method
   */
  handleRemovePhoto = () => {
    let tempOwner = {...this.state.owner};
    tempOwner.removePhoto = !tempOwner.removePhoto;

    this.setState({
      owner: tempOwner
    });
  }
  /**
   * Check add owner form validation
   * @method
   * @returns true if form is invalid
   */
  checkFormValidation = () => {
    const {owner} = this.state;

    if (!owner.info.ownerID || !owner.info.ownerName) {
      return true;
    }
  }
  /**
   * Handle add/edit owner form confirm
   * @method
   */
  handleOwnerConfirm = () => {
    const {baseUrl} = this.context;
    const {addOwnerType, owner} = this.state;
    let requestType = 'POST';
    let updatePic = owner.removePhoto;
    let formData = new FormData();

    if (this.checkFormValidation()) {
      helper.showPopupMsg(et('fill-required-fields'), t('txt-error'));
      return;
    }

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
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display delete owner content
   * @method
   * @param {object} allValue - owner data
   * @returns HTML DOM
   */
  getDeleteOwnerContent = (allValue) => {
    if (allValue.ownerID) {
      let tempOwner = {...this.state.owner};
      tempOwner.info = {...allValue};

      this.setState({
        owner: tempOwner
      });
    }

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {allValue.ownerID}?</span>
      </div>
    )
  }
  /**
   * Display delete owner modal dialog
   * @method
   * @param {object} allValue - owner data
   */
  openDeleteOwnerModal = (allValue) => {
    PopupDialog.prompt({
      title: t('network-topology.txt-deleteOwner'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteOwnerContent(allValue),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteOwner();
        }
      }
    });
  }
  /**
   * Handle delete owner confirm
   * @method
   */
  deleteOwner = () => {
    const {baseUrl} = this.context;
    const {owner} = this.state;

    if (owner.info && !owner.info.ownerUUID) {
      return;
    }

    ah.one({
      url: `${baseUrl}/api/owner?uuid=${owner.info.ownerUUID}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getOwnerData();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Open department/title management modal dialog
   * @method
   */
  openManage = () => {
    this.name._component.openManage();
  }
  /**
   * Handle close on department/title management modal dialog
   * @method
   */
  onDone = () => {
    this.getSearchData();
    this.getOwnerData();
  }
  /**
   * Toggle filter content on/off
   * @method
   */
  toggleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter
    });
  }
  /**
   * Clear filter input value
   * @method
   */
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
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {list, search, showFilter} = this.state

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
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
          <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {
      activeContent,
      list,
      addOwnerTitle,
      owner,
      showFilter,
      previewOwnerPic
    } = this.state;

    return (
      <div>
        <Manage
          ref={ref => { this.name=ref }}
          onDone={this.onDone} />

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')} disabled={activeContent !== 'tableList'}><i className='fg fg-filter'></i></button>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            { this.renderFilter() }

            {activeContent === 'tableList' &&
              <div className='main-content'>
                <header className='main-header'>{t('txt-ownerList')}</header>

                <div className='content-header-btns'>
                  <button className='standard btn' onClick={this.toggleContent.bind(this, 'addOwner', 'new')}>{t('txt-addNewOwner')}</button>
                  <button className='standard btn' onClick={this.openManage}>{t('txt-manageDepartmentTitle')}</button>
                </div>

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

                <div className='content-header-btns'>
                  <button className='standard btn' onClick={this.openManage} >{t('txt-manageDepartmentTitle')}</button>
                </div>

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

NetworkOwner.contextType = BaseDataContext;

NetworkOwner.propTypes = {
};

const HocNetworkOwner = withRouter(withLocale(NetworkOwner));
export { NetworkOwner, HocNetworkOwner };