import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import FileInput from 'react-ui/build/src/components/file-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context'
import Config from '../../common/configuration'
import helper from '../../common/helper'
import Manage from './manage'
import MuiTableContent from '../../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const FORM_VALIDATION = {
  ownerName: {
    valid: true
  },
  ownerID: {
    valid: true
  }
};

let t = null;
let et = null;

/**
 * Config Topology Owner
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the owner list
 */
class NetworkOwner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeContent: 'tableList', //'tableList' or 'addOwner'
      list: {
        department: [],
        title: [],
        tenancy: []
      },
      search: {
        name: '',
        department: {},
        title: {},
        tenancy: {}
      },
      openManage: false,
      addOwnerType: '', //'new' or 'edit'
      addOwnerTitle: '',
      showFilter: false,
      currentOwnerData: {},
      owner: {
        dataFieldsArr: ['ownerID', 'multiTenancyPO', 'ownerName', 'departmentName', 'titleName', '_menu'],
        dataFields: [],
        dataContent: null,
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
      previewOwnerPic: '',
      formValidation: _.cloneDeep(FORM_VALIDATION)
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);
    helper.inactivityTime(baseUrl, locale);

   this.getTitleData();
   this.getOwnerData();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state === 'tableList') {
      this.toggleContent('tableList');
    }
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get and set title data
   * @method
   * @param {string} [tenancyId] - tenancy ID
   */
  getTitleData = (tenancyId) => {
    const {baseUrl} = this.context;
    const {list} = this.state;
    const url = `${baseUrl}/api/name/_search`;
    let requestData = {
      nameType: 2
    };

    if (tenancyId) {
      requestData.tenancyId = tenancyId;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempList = {...list};
        let titleList = [];

        _.forEach(data, val => {
          titleList.push({
            value: val.nameUUID,
            text: val.name
          });
        })

        tempList.title = _.cloneDeep(titleList);

        this.setState({
          list: tempList
        }, () => {
          this.getDepartmentData(tenancyId);
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set department data
   * @method
   * @param {string} [tenancyId] - tenancy ID
   */
  getDepartmentData = (tenancyId) => {
    const {baseUrl} = this.context;
    const {list} = this.state;
    let url = `${baseUrl}/api/department/_tree`;

    if (tenancyId) {
      url += `?tenancyId=${tenancyId}`;
    }

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempList = {...list};
        let departmentList = [];

        _.forEach(data, val => {
          helper.floorPlanRecursive(val, obj => {
            departmentList.push({
              value: obj.id,
              text: obj.name
            });
          });
        })

        tempList.department = _.cloneDeep(departmentList);

        this.setState({
          list: tempList
        }, () => {
          if (!tenancyId) {
            this.getTenancyData();
          }
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set tenancy data
   * @method
   */
  getTenancyData = () => {
    const {baseUrl} = this.context;
    const {list} = this.state;
    const url = `${baseUrl}/api/tenancy/_search`;

    this.ah.one({
      url,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'application/json'
    })
    .then(data => {
      if (data) {
        let tempList = {...list};
        let tenancyList = [];

        _.forEach(data.rows, val => {
          helper.floorPlanRecursive(val, obj => {
            tenancyList.push({
              value: obj.id,
              text: obj.name
            });
          });
        })

        tempList.tenancy = _.cloneDeep(tenancyList);

        this.setState({
          list: tempList
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', c('txt-error'), err.message);
    })
  }
  /**
   * Handle owner edit button
   * @method
   * @param {string} tenancyId - tenancy ID
   * @param {object} allValue - owner data object
   */
  handleOwnerEdit = (tenancyId, allValue) => {
    const {baseUrl} = this.context;
    const {list, currentOwnerData, owner} = this.state;
    const url1 = `${baseUrl}/api/name/_search`;
    const url3 = `${baseUrl}/api/tenancy/_search`;
    const ownerUUID = allValue ? allValue.ownerUUID : currentOwnerData.ownerUUID;
    const url4 = `${baseUrl}/api/u1/owner?uuid=${ownerUUID}`;
    let url2 = `${baseUrl}/api/department/_tree`;
    let requestData = {
      nameType: 2
    };
    let tempOwner = {...owner};

    if (tenancyId) {
      requestData.tenancyId = tenancyId;
      url2 += `?tenancyId=${tenancyId}`;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.all([
      {
        url: url1,
        data: JSON.stringify(requestData),
        type: 'POST',
        contentType: 'text/plain'
      },
      {
        url: url2,
        type: 'GET'
      },
      {
        url: url3,
        data: JSON.stringify({}),
        type: 'POST',
        contentType: 'application/json'
      },
      {
        url: url4,
        type: 'GET'
      }
    ])
    .then(data => {
      if (data) {
        let tempList = {...list};
        let titleList = [];
        let departmentList = [];
        let tenancyList = [];

        _.forEach(data[0].rt, val => {
          titleList.push({
            value: val.nameUUID,
            text: val.name
          });
        })

        _.forEach(data[1].rt, val => {
          helper.floorPlanRecursive(val, obj => {
            departmentList.push({
              value: obj.id,
              text: obj.name
            });
          });
        })

        _.forEach(data[2].rt.rows, val => {
          helper.floorPlanRecursive(val, obj => {
            tenancyList.push({
              value: obj.id,
              text: obj.name
            });
          });
        })

        tempList.title = _.cloneDeep(titleList);
        tempList.department = _.cloneDeep(departmentList);
        tempList.tenancy = _.cloneDeep(tenancyList);

        const ownerData = data[3].rt;
        tempOwner.info = {...ownerData};

        if (allValue) {
          this.setState({
            currentOwnerData: allValue
          });
        }

        if (ownerData.multiTenancyDTO) {
          const selectedTenancyIndex = _.findIndex(list.tenancy, { 'value': ownerData.multiTenancyDTO.id });
          tempOwner.info.tenancy = list.tenancy[selectedTenancyIndex];
        }

        const selectedDepartmentIndex = _.findIndex(list.department, { 'value': ownerData.department });
        const selectedTitleIndex = _.findIndex(list.title, { 'value': ownerData.title });
        tempOwner.info.department = list.department[selectedDepartmentIndex];
        tempOwner.info.title = list.title[selectedTitleIndex];

        this.setState({
          list: tempList,
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
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable field
   */
  checkSortable = (field) => {
    const sortableFields = ['ownerID', 'multiTenancyPO', 'ownerName'];

    if (_.includes(sortableFields, field)) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * Get and set owner data
   * @method
   * @param {string} fromPage - option for 'currentPage'
   */
  getOwnerData = (fromPage) => {
    const {baseUrl} = this.context;
    const {owner, search} = this.state;
    const page = fromPage === 'currentPage' ? owner.currentPage : 0;
    let requestData = {
      sort: owner.sort.field,
      order: owner.sort.desc ? 'desc' : 'asc',
      page: page + 1,
      pageSize: Number(owner.pageSize)
    };

    if (search.name) {
      requestData.ownerName = '%' + search.name + '%';
    }

    if (!_.isEmpty(search.department)) {
      requestData.department = search.department.value;
    }

    if (!_.isEmpty(search.title)) {
      requestData.title = search.title.value;
    }

    if (!_.isEmpty(search.tenancy)) {
      requestData.tenancyId = search.tenancy.value;
    }

    this.ah.one({
      url: `${baseUrl}/api/owner/_search`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempOwner = {...owner};

        if (!data.rows || data.rows.length === 0) {
          tempOwner.dataContent = [];
          tempOwner.totalCount = 0;

          this.setState({
            owner: tempOwner
          });
          return null;
        }

        tempOwner.dataContent = data.rows;
        tempOwner.totalCount = data.counts;
        tempOwner.currentPage = page;
        tempOwner.dataFields = _.map(owner.dataFieldsArr, val => {
          return {
            name: val,
            label: val === '_menu' ? ' ' : t(`ownerFields.${val}`),
            options: {
              sort: this.checkSortable(val),
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempOwner.dataContent[dataIndex];
                let value = tempOwner.dataContent[dataIndex][val];

                if (val === 'multiTenancyPO') {
                  value = '';

                  if (tempOwner.dataContent[dataIndex].multiTenancyDTO) {
                    value = tempOwner.dataContent[dataIndex].multiTenancyDTO.name;
                  }
                } else if (val === '_menu') {
                  let tenancyId = '';

                  if (tempOwner.dataContent[dataIndex].multiTenancyDTO) {
                    tenancyId = tempOwner.dataContent[dataIndex].multiTenancyDTO.id;
                  }

                  return (
                    <div className='table-menu menu active'>
                      <i id='topologyOwnerGetOwnerInfo' className='fg fg-edit' onClick={this.handleOwnerEdit.bind(this, tenancyId, allValue)} title={t('txt-edit')}></i>
                      <i id='topologyOwnerDeleteOwner' className='fg fg-trashcan' onClick={this.openDeleteOwnerModal.bind(this, allValue)} title={t('txt-delete')}></i>
                    </div>
                  )
                }
                return value;
              }
            }
          };
        });

        let ownerListArr = [];

        _.forEach(data.rows, val => {
          ownerListArr.push({
            value: val.ownerName,
            text: val.ownerName
          });
        })

        tempOwner.ownerListArr = ownerListArr;

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
   * Handle table row mouse over
   * @method
   * @param {string} index - index of the owner data
   * @param {object} allValue - owner data
   * @param {object} event - event object
   */
  handleRowMouseOver = (index, allValue, event) => {
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
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempOwner = {...this.state.owner};
    tempOwner.sort.field = field;
    tempOwner.sort.desc = sort;

    this.setState({
      owner: tempOwner
    }, () => {
      this.getOwnerData();
    });
  }
  /**
   * Handle filter input value change
   * @method
   * @param {string} event - event object
   */
  handleSearchChange = (event) => {
    let tempSearch = {...this.state.search};
    tempSearch[event.target.name] = event.target.value;

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

    this.setState({
      owner: tempOwner
    }, () => {
      this.getOwnerData(type);
    });
  }
  /**
   * Display department list
   * @method
   * @param {object} params - parameters for Autocomplete
   * @returns TextField component
   */
  renderDepartmentList = (params) => {
    return (
      <TextField
        {...params}
        label={t('ownerFields.department')}
        variant='outlined'
        size='small' />
    )
  }
  /**
   * Display title list
   * @method
   * @param {object} params - parameters for Autocomplete
   * @returns TextField component
   */
  renderTitleList = (params) => {
    return (
      <TextField
        {...params}
        label={t('ownerFields.title')}
        variant='outlined'
        size='small' />
    )
  }
  /**
   * Display tenancy list
   * @method
   * @param {object} params - parameters for Autocomplete
   * @returns TextField component
   */
  renderTenancyList = (params) => {
    return (
      <TextField
        {...params}
        label={t('ownerFields.multiTenancyPO')}
        variant='outlined'
        size='small' />
    )
  }
  /**
   * Handle department/title combo box change
   * @method
   * @param {string} from - form page ('department', 'title' or 'tenancy')
   * @param {string} type - combo type ('search', 'owner' or 'list')
   * @param {object} event - select event
   * @param {object} value - selected department info
   */
  handleComboBoxChange = (from, type, event, value) => {
    const {list, search, owner} = this.state;

    if (value && value.value) {
      if (from === 'department') {
        const selectedDepartmentIndex = _.findIndex(list.department, { 'value': value.value });

        if (type === 'search') {
          let tempSearch = {...search};
          tempSearch.department = list.department[selectedDepartmentIndex];

          this.setState({
            search: tempSearch
          });
        }

        if (type === 'owner') {
          let tempOwner = {...owner};
          tempOwner.info.department = list.department[selectedDepartmentIndex];

          this.setState({
            owner: tempOwner
          });
        }
      } else if (from === 'title') {
        const selectedTitleIndex = _.findIndex(list.title, { 'value': value.value });

        if (type === 'search') {
          let tempSearch = {...search};
          tempSearch.title = list.title[selectedTitleIndex];

          this.setState({
            search: tempSearch
          });
        }

        if (type === 'owner') {
          let tempOwner = {...owner};
          tempOwner.info.title = list.title[selectedTitleIndex];

          this.setState({
            owner: tempOwner
          });
        }
      } else if (from === 'tenancy') {
        const selectedTenancyIndex = _.findIndex(list.tenancy, { 'value': value.value });

        if (type === 'search') {
          let tempSearch = {...search};
          tempSearch.tenancy = list.tenancy[selectedTenancyIndex];

          this.setState({
            search: tempSearch
          });
        }

        if (type === 'list') {
          const tenancyId = list.tenancy[selectedTenancyIndex];
          let tempOwner = {...owner};
          tempOwner.info.department = {};
          tempOwner.info.title = {};

          this.setState({
            owner: tempOwner
          });

          this.getTitleData(tenancyId.value);
        }

        if (type === 'owner') {
          let tempOwner = {...owner};
          tempOwner.info.tenancy = list.tenancy[selectedTenancyIndex];

          this.setState({
            owner: tempOwner
          });
        }
      }
    }
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
      if (options === 'new') {
        addOwnerType = 'new';
        addOwnerTitle = t('txt-addNewOwner');
        tempOwner.info = {};

        if (list.department[0] && list.title[0]) {
          tempOwner.info = {
            department: {},
            title: {}
          };
        }
      } else if (options === 'edit') {
        addOwnerType = 'edit';
        addOwnerTitle = t('txt-editOwner');
      }
      tempOwner.removePhoto = false;
    } else if (type === 'tableList') {
      this.setState({
        formValidation: _.cloneDeep(FORM_VALIDATION)
      });
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
   * @param {string} event - event object
   */
  handleDataChange = (event) => {
    const type = event.target.name;
    const value = event.target.value;    
    let tempOwner = {...this.state.owner};
    tempOwner.info[type] = value;

    this.setState({
      owner: tempOwner
    });  
  }
  /**
   * Handle photo upload input value change
   * @method
   * @param {string | object} value - input data to be set
   */
  handlePhotoChange = (value) => {
    let tempOwner = {...this.state.owner};
    tempOwner.info.file = value;

    this.setState({
      previewOwnerPic: value ? URL.createObjectURL(value) : '',
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
   * Handle add/edit owner form confirm
   * @method
   */
  handleOwnerConfirm = () => {
    const {baseUrl} = this.context;
    const {addOwnerType, owner, formValidation} = this.state;
    let requestType = 'POST';
    let updatePic = owner.removePhoto;
    let formData = new FormData();
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (owner.info.ownerName) {
      tempFormValidation.ownerName.valid = true;
    } else {
      tempFormValidation.ownerName.valid = false;
      validate = false;
    }

    if (owner.info.ownerID) {
      tempFormValidation.ownerID.valid = true;
    } else {
      tempFormValidation.ownerID.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation  
    });

    if (!validate) {
      return;
    }

    formData.append('ownerID', owner.info.ownerID);
    formData.append('ownerName', owner.info.ownerName);

    if (owner.info.tenancy && owner.info.tenancy.value) {
      formData.append('tenancyId', owner.info.tenancy.value);
    } else {
      formData.append('tenancyId', '');
    }

    if (owner.info.department && owner.info.department.value) {
      formData.append('department', owner.info.department.value);
    } else {
      formData.append('department', '');
    }

    if (owner.info.title && owner.info.title.value) {
      formData.append('title', owner.info.title.value);
    } else {
      formData.append('title', '');
    }

    if (owner.info.email) {
      formData.append('email', owner.info.email);
    } else {
      formData.append('email', '');
    }

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
      this.setState({
        currentOwnerData: {}
      }, () => {
        this.getTitleData();
        this.getOwnerData();
        this.toggleContent('tableList');
      });

      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display delete owner content
   * @method
   * @param {object} allValue - Owner data
   * @returns HTML DOM
   */
  getDeleteOwnerContent = (allValue) => {
    this.setState({
      currentOwnerData: allValue
    });

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {allValue.ownerName} (ID: {allValue.ownerID})?</span>
      </div>
    )
  }
  /**
   * Display delete owner modal dialog
   * @method
   * @param {object} allValue - Owner data
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
    const {currentOwnerData} = this.state;

    if (!currentOwnerData.ownerUUID) {
      return;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/owner?uuid=${currentOwnerData.ownerUUID}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.setState({
          currentOwnerData: {}
        }, () => {
          this.getOwnerData();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle close on department/title management modal dialog
   * @method
   */
  handleCloseManage = () => {
    this.toggleManageDialog();
    this.getTitleData();
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
    this.setState({
      search: {
        name: '',
        department: {},
        title: {}
      }
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {list, search, showFilter} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i id='topologyOwnerCloseFilter' className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <TextField
              id='topologyFilterOwnerName'
              name='name'
              label={t('ownerFields.ownerName')}
              variant='outlined'
              fullWidth
              size='small'
              value={search.name}
              onChange={this.handleSearchChange} />
          </div>
          <div className='group'>
            <Autocomplete
              id='topologyFilterComboDepartment'
              className='combo-box'
              options={list.department}
              value={search.department}
              getOptionLabel={(option) => option.text}
              renderInput={this.renderDepartmentList}
              onChange={this.handleComboBoxChange.bind(this, 'department', 'search')} />
          </div>
          <div className='group'>
            <Autocomplete
              id='topologyFilterComboTitle'
              className='combo-box'
              options={list.title}
              value={search.title}
              getOptionLabel={(option) => option.text}
              renderInput={this.renderTitleList}
              onChange={this.handleComboBoxChange.bind(this, 'title', 'search')} />
          </div>
          <div className='group'>
            <Autocomplete
              id='topologyFilterComboTenancy'
              className='combo-box'
              options={list.tenancy}
              value={search.tenancy}
              getOptionLabel={(option) => option.text}
              renderInput={this.renderTenancyList}
              onChange={this.handleComboBoxChange.bind(this, 'tenancy', 'search')} />
          </div>
        </div>
        <div className='button-group'>
          <Button id='topologyFilterBtn' variant='contained' color='primary' className='filter' onClick={this.getOwnerData}>{t('txt-filter')}</Button>
          <Button id='topologyClearBtn' variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /**
   * Toggle manage dialog
   * @method
   */
  toggleManageDialog = () => {
    this.setState({
      openManage: !this.state.openManage
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {
      activeContent,
      list,
      openManage,
      addOwnerType,
      addOwnerTitle,
      owner,
      showFilter,
      previewOwnerPic,
      formValidation
    } = this.state;
    const tableOptions = {
      onChangePage: (currentPage) => {
        this.handlePaginationChange('currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort(changedColumn, direction === 'desc');
      }
    }; 

    return (
      <div>
        {openManage &&
          <Manage
            tenancyList={list.tenancy}
            handleCloseManage={this.handleCloseManage} />
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            {activeContent === 'tableList' &&
              <Button id='topologyTableFilterBtn' variant='outlined' color='primary' className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></Button>
            }
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            {this.renderFilter()}

            {activeContent === 'tableList' &&
              <div className='main-content'>
                <header className='main-header'>{t('txt-ownerList')}</header>

                <div className='content-header-btns with-menu'>
                  <Button id='topologyTableAddOwner' variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'addOwner', 'new')}>{t('txt-addNewOwner')}</Button>
                  <Button id='topologyTableEditDepartmentTitle' variant='outlined' color='primary' className='standard btn' onClick={this.toggleManageDialog}>{t('txt-manageDepartmentTitle')}</Button>
                </div>

                <MuiTableContent
                  data={owner}
                  tableOptions={tableOptions} />
              </div>
            }

            {activeContent === 'addOwner' &&
              <div className='main-content basic-form'>
                <header className='main-header'>{addOwnerTitle}</header>

                <div className='content-header-btns'>
                  <Button id='topologyManageDepartmentTitle' variant='outlined' color='primary' className='standard btn' onClick={this.toggleManageDialog} >{t('txt-manageDepartmentTitle')}</Button>
                </div>

                <div className='form-group steps-owner'>
                  <header>{t('ipFields.owner')}</header>
                  <div className='user-pic'>
                    <div className='group'>
                      <label htmlFor='ownerPhotoUpload'>{t('txt-uploadPhoto')}</label>
                      <FileInput
                        id='topologyOwnerPhotoUpload'
                        className='file-input'
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
                        onChange={this.handlePhotoChange} />
                    </div>
                    <div className='group'>
                      {previewOwnerPic &&
                        <img src={previewOwnerPic} title={t('network-topology.txt-profileImage')} />
                      }
                      {!previewOwnerPic && owner.info.base64 &&
                        <div>
                          <img src={owner.info.base64} title={t('network-topology.txt-profileImage')} />
                          <div className='removePhoto'>
                            <FormControlLabel
                              id='topologyRemovePhoto' 
                              label={t('network-topology.txt-removePhoto')}
                              control={
                                <Checkbox
                                  className='checkbox-ui'
                                  checked={owner.removePhoto}
                                  onChange={this.handleRemovePhoto}
                                  color='primary' />
                              } />
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
                      <Autocomplete
                        id='topologyOwnerTenancy'
                        className='combo-box'
                        options={list.tenancy}
                        value={owner.info.tenancy}
                        getOptionLabel={(option) => option.text}
                        renderInput={this.renderTenancyList}
                        onChange={this.handleComboBoxChange.bind(this, 'tenancy', 'list')}
                        disabled={addOwnerType === 'edit'} />
                    </div>
                    <div className='group'>
                      <TextField
                        id='topologyOwnerName'
                        name='ownerName'
                        label={t('ownerFields.ownerName')}
                        variant='outlined'
                        fullWidth
                        size='small'
                        required
                        error={!formValidation.ownerName.valid}
                        helperText={formValidation.ownerName.valid ? '' : t('txt-required')}
                        value={owner.info.ownerName}
                        onChange={this.handleDataChange} />
                    </div>
                    <div className='group'>
                      <TextField
                        id='topologyOwnerID'
                        name='ownerID'
                        label={t('ownerFields.ownerID')}
                        variant='outlined'
                        fullWidth
                        size='small'
                        required
                        error={!formValidation.ownerID.valid}
                        helperText={formValidation.ownerID.valid ? '' : t('txt-required')}
                        value={owner.info.ownerID}
                        onChange={this.handleDataChange} />
                    </div>
                    <div className='group'>
                      <Autocomplete
                        id='topologyOwnerDepartment'
                        className='combo-box'
                        options={list.department}
                        value={owner.info.department}
                        getOptionLabel={(option) => option.text}
                        renderInput={this.renderDepartmentList}
                        onChange={this.handleComboBoxChange.bind(this, 'department', 'owner')} />
                    </div>
                    <div className='group'>
                      <Autocomplete
                        id='topologyOwnerTitle'
                        className='combo-box'
                        options={list.title}
                        value={owner.info.title}
                        getOptionLabel={(option) => option.text}
                        renderInput={this.renderTitleList}
                        onChange={this.handleComboBoxChange.bind(this, 'title', 'owner')} />
                    </div>
                    <div className='group'>
                      <TextField
                        id='topologyOwnerEmail'
                        name='email'
                        label={t('ownerFields.email')}
                        variant='outlined'
                        fullWidth
                        size='small'
                        value={owner.info.email}
                        onChange={this.handleDataChange} />
                    </div>
                  </div>
                </div>
                <footer>
                  <Button id='topologyOwnerCancel' variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-cancel')}</Button>
                  <Button id='topologyOwnerSave' variant='contained' color='primary' className='next-step' onClick={this.handleOwnerConfirm}>{t('txt-save')}</Button>
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

export default withRouter(NetworkOwner);