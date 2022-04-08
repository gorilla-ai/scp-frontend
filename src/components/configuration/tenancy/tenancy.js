import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import i18n from 'i18next'
import cx from 'classnames'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context'
import Config from '../../common/configuration'
import helper from '../../common/helper'
import MuiTableContent from '../../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const FORM_VALIDATION = {
  name: {
    valid: true
  }
};

const log = require('loglevel').getLogger('user/accounts')
const c = i18n.getFixedT(null, 'connections');
const t = i18n.getFixedT(null, 'accounts');
const gt =  i18n.getFixedT(null, 'app');

/**
 * Multi Tenancy
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the multi tenancy page
 */
class MultiTenancy extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showFilter: false,
      editDialogOpen: false,
      dialogType: '', //'new' or 'edit'
      tenancySearch: {
        keyword: ''
      },
      tenancyData: {
        name: '',
        info: '',
        enterpriseId: ''
      },
      tenancyInfo: {
        dataFieldsArr: ['_menu', 'name', 'info', 'enterpriseId'],
        dataFields: [],
        dataContent: null,
        sort: {
          field: 'name',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      contextAnchor: null,
      currentTenancyData: {},
      formValidation: _.cloneDeep(FORM_VALIDATION)
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'account', locale);
    helper.inactivityTime(baseUrl, locale);

    this.getTenancyData();
  }
  ryan = () => {}
  /**
   * Get and set tenancy data
   * @method
   * @param {string} options - option for 'currentPage'
   */
  getTenancyData = (options) => {
    const {baseUrl} = this.context;
    const {tenancySearch, tenancyInfo} = this.state;
    const sort = tenancyInfo.sort.desc ? 'desc' : 'asc';
    const page = options === 'currentPage' ? tenancyInfo.currentPage : 0;
    const url = `${baseUrl}/api/tenancy/_search?page=${page + 1}&pageSize=${tenancyInfo.pageSize}&orders=${tenancyInfo.sort.field} ${sort}`;
    let requestData = {};

    if (tenancySearch.keyword) {
      requestData.keyword = tenancySearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'application/json'
    })
    .then(data => {
      if (data) {
        let tempTenancyInfo = {...tenancyInfo};

        if (!data.rows || data.rows.length === 0) {
          tempTenancyInfo.dataContent = [];
          tempTenancyInfo.totalCount = 0;

          this.setState({
            tenancyInfo: tempTenancyInfo
          });
          return null;
        }

        tempTenancyInfo.dataContent = data.rows;
        tempTenancyInfo.totalCount = data.counts;
        tempTenancyInfo.currentPage = page;
        tempTenancyInfo.dataFields = _.map(tenancyInfo.dataFieldsArr, val => {
          return {
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : t('tenancyFields.' + val),
            options: {
              filter: true,
              sort: true,
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempTenancyInfo.dataContent[dataIndex];
                const value = tempTenancyInfo.dataContent[dataIndex][val];

                if (val === '_menu') {
                  return (
                    <div className='table-menu active'>
                      <Button variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue)}><i className='fg fg-more'></i></Button>
                    </div>
                  )
                } else {
                  return <span>{value}</span>
                }
              }
            }
          };
        });

        this.setState({
          tenancyInfo: tempTenancyInfo
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', c('txt-error'), err.message);
    })
  }
  /**
   * Handle open menu
   * @method
   * @param {object} tenancy - active tenancy data
   * @param {object} event - event object
   */
  handleOpenMenu = (tenancy, event) => {
    this.setState({
      tenancyData: {
        id: tenancy.id,
        name: tenancy.name,
        info: tenancy.info,
        enterpriseId: tenancy.enterpriseId
      },
      contextAnchor: event.currentTarget,
      currentTenancyData: tenancy
    });
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null
    });
  }
  /**
   * Open account edit modal dialog
   * @method
   * @param {string} type - dialog type ('new' or 'edit')
   */
  toggleEditDialog = (type) => {
    if (type === 'new') {
      this.setState({
        tenancyData: {
          name: '',
          info: '',
          enterpriseId: ''
        }
      });
    }

    this.setState({
      editDialogOpen: !this.state.editDialogOpen,
      dialogType: type
    });

    this.handleCloseMenu();
  }
  /**
   * Handle tenancy edit form change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempTenancyData = {...this.state.tenancyData};
    tempTenancyData[event.target.name] = event.target.value;

    this.setState({
      tenancyData: tempTenancyData
    });
  }
  /**
   * Display multi tenancy content
   * @method
   * @returns HTML DOM
   */
  displayTenancyContent = () => {
    const {tenancyData, formValidation} = this.state;

    return (
      <div className='account-form'>
        <div className='basic-info'>
          <div className='group'>
            <TextField
              id='tenancyEditName'
              name='name'
              label={t('tenancyFields.name')}
              variant='outlined'
              fullWidth
              size='small'
              required
              error={!formValidation.name.valid}
              helperText={formValidation.name.valid ? '' : c('txt-required')}
              value={tenancyData.name}
              onChange={this.handleDataChange} />
          </div>
          <div className='group'>
            <TextField
              id='tenancyEditInfo'
              name='info'
              label={t('tenancyFields.info')}
              variant='outlined'
              fullWidth
              size='small'
              value={tenancyData.info}
              onChange={this.handleDataChange} />
          </div>
          <div className='group'>
            <TextField
              id='tenancyEditEnterpriseId'
              name='enterpriseId'
              label={t('tenancyFields.enterpriseId')}
              variant='outlined'
              fullWidth
              size='small'
              value={tenancyData.enterpriseId}
              onChange={this.handleDataChange} />
          </div>
        </div>
      </div>
    )
  }
  /**
   * Display multi tenancy edit dialog
   * @method
   * @returns ModalDialog component
   */
  openEditDialog = () => {
    const {dialogType} = this.state;
    const actions = {
      cancel: {text: c('txt-cancel'), className: 'standard', handler: this.toggleEditDialog.bind(this, '')},
      confirm: {text: c('txt-confirm'), handler: this.confirmMultiTenancy}
    };
    let title = '';

    if (dialogType === 'new') {
      title = c('txt-add');
    } else if (dialogType === 'edit') {
      title = c('txt-edit');
    }

    return (
      <ModalDialog
        id='accountEditDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayTenancyContent()}
      </ModalDialog>
    )
  }
  /**
   * Handle confirm multi tenancy
   * @method
   */
  confirmMultiTenancy = () => {
    const {baseUrl} = this.context;
    const {dialogType, tenancyData, formValidation} = this.state;
    const url = `${baseUrl}/api/tenancy`;
    const requestData = {
      ...tenancyData
    };
    let tempFormValidation = {...formValidation};
    let requestType = '';
    let validate = true;

    if (tenancyData.name) {
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

    if (dialogType ===  'new') {
      requestType = 'POST';
    } else if (dialogType === 'edit') {
      requestType = 'PATCH';
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: requestType,
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.toggleEditDialog();
        this.getTenancyData();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', c('txt-error'), err.message);
    })
  }
  /**
   * Display delete content
   * @method
   * @returns HTML DOM
   */
  getTenancyMsgContent = () => {
    return (
      <div className='content delete'>
        <span>{c('txt-tenancy-delete') + ': ' + this.state.currentTenancyData.name}?</span>
      </div>
    )
  }
  /**
   * Display delete modal dialog
   * @method
   */
  showDeleteDialog = () => {
    PopupDialog.prompt({
      title: c('txt-deleteTenancy'),
      id: 'modalWindowSmall',
      confirmText: c('txt-delete'),
      cancelText: c('txt-cancel'),
      display: this.getTenancyMsgContent(),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteTenancy();
        }
      }
    });

    this.handleCloseMenu();
  }
  /**
   * Handle delete multi tenancy confirm
   * @method
   */
  deleteTenancy = () => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/tenancy?id=${this.state.currentTenancyData.id}`;

    this.ah.one({
      url,
      type: 'DELETE'
    })
    .then(data => {
      if (data) {
        this.getTenancyData();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', c('txt-error'), err.message);
    })
  }
  /**
   * Handle filter input value change
   * @method
   * @param {object} event - event object
   */
  handleSearchChange = (event) => {
    let tempTenancySearch = {...this.state.tenancySearch};
    tempTenancySearch[event.target.name] = event.target.value;

    this.setState({
      tenancySearch: tempTenancySearch
    });
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
      tenancySearch: {
        keyword: ''
      }
    });
  }
  /**
   * Handle filter search submit
   * @method
   */
  handleSearchSubmit = () => {
    let tempTenancyInfo = {...this.state.tenancyInfo};
    tempTenancyInfo.dataFields = [];
    tempTenancyInfo.dataContent = null;
    tempTenancyInfo.totalCount = 0;
    tempTenancyInfo.currentPage = 1;
    tempTenancyInfo.pageSize = 20; 
    
    this.setState({
      tenancyInfo: tempTenancyInfo
    }, () => {
      this.getTenancyData();
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, tenancySearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{c('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <TextField
              id='tenancyKeyword'
              name='keyword'
              label={c('txt-keywords')}
              variant='outlined'
              fullWidth
              size='small'
              value={tenancySearch.keyword}
              onChange={this.handleSearchChange} />
          </div>
        </div>
        <div className='button-group'>
          <Button id='account-btn-filter' variant='contained' color='primary' className='filter' onClick={this.handleSearchSubmit}>{c('txt-filter')}</Button>
          <Button id='account-btn-clear' variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{c('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempTenancyInfo = {...this.state.tenancyInfo};
    tempTenancyInfo[type] = Number(value);

    if (type === 'pageSize') {
      tempTenancyInfo.currentPage = 0;
    }

    this.setState({
      tenancyInfo: tempTenancyInfo
    }, () => {
      this.getTenancyData(type);
    });
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempTenancyInfo = {...this.state.tenancyInfo};
    tempTenancyInfo.sort.field = field;
    tempTenancyInfo.sort.desc = sort;

    this.setState({
      tenancyInfo: tempTenancyInfo
    }, () => {
      this.getTenancyData();
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {showFilter, editDialogOpen, tenancyInfo, contextAnchor} = this.state;
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
        {editDialogOpen &&
          this.openEditDialog()
        }

        <Menu
          anchorEl={contextAnchor}
          keepMounted
          open={Boolean(contextAnchor)}
          onClose={this.handleCloseMenu}>
          <MenuItem id='account-menu-edit' onClick={this.toggleEditDialog.bind(this, 'edit')}>{c('txt-edit')}</MenuItem>
          <MenuItem id='account-menu-delete' onClick={this.showDeleteDialog}>{c('txt-delete')}</MenuItem>
        </Menu>

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button id='accountShowAdd' variant='outlined' color='primary' onClick={this.toggleEditDialog.bind(this, 'new')} title={t('txt-add-account')}><i className='fg fg-add'></i></Button>
            <Button id='accountShowFilter' variant='outlined' color='primary' className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={c('txt-filter')}><i className='fg fg-filter'></i></Button>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            {this.renderFilter()}

            <div className='main-content'>
              <header className='main-header'>{c('txt-multiTenancy')}</header>
              <MuiTableContent
                data={tenancyInfo}
                tableOptions={tableOptions} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

MultiTenancy.contextType = BaseDataContext;

MultiTenancy.propTypes = {
};

export default MultiTenancy;