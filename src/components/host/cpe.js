import React, { Component } from 'react'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../common/context'
import FilterQuery from './common/filter-query'
import helper from '../common/helper'
import HostMenu from './common/host-menu'
import TableList from './common/table-list'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const TRUE_FALSE = ['true', 'false'];
const FILTER_LIST = [
  {
    name: 'part',
    displayType: 'text_field'
  },
  {
    name: 'vendor',
    displayType: 'text_field',
  },
  {
    name: 'product',
    displayType: 'text_field',
  },
  {
    name: 'version',
    displayType: 'text_field',
  },
  {
    name: 'update',
    displayType: 'text_field',
  },
  {
    name: 'edition',
    displayType: 'text_field',
  },
  {
    name: 'language',
    displayType: 'text_field',
  },
  {
    name: 'swEdition',
    displayType: 'text_field',
  },
  {
    name: 'targetSw',
    displayType: 'text_field',
  },
  {
    name: 'targetHw',
    displayType: 'text_field',
  },
  {
    name: 'other',
    displayType: 'text_field',
  },
  {
    name: 'productCpename',
    displayType: 'text_field',
  },
  {
    name: 'isMatched',
    displayType: 'select_list',
    filterType: 'select_list'
  }
];
const CPE_SEARCH = {
  keyword: '',
  count: 0
};
const CPE_FILTER = {
  part: '',
  vendor: '',
  product: '',
  update: '',
  edition: '',
  language: '',
  swEdition: '',
  targetSw: '',
  targetHw: '',
  other: '',
  productCpename: '',
  isMatched: ''
};
const CPE_FILTER_LIST = {
  isMatched: []
};
const EDIT_LIST_PART1 = ['part', 'vendor', 'product', 'version', 'update', 'edition'];
const EDIT_LIST_PART2 = ['language', 'swEdition', 'targetSw', 'targetHw', 'other', 'productCpename'];
const FORM_VALIDATION = {
  cpe23uri: {
    valid: true
  }
};

let t = null;
let f = null;

/**
 * Host CPE
 * @class
 * @summary A react component to show the Host CPE page
 */
class HostCpe extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      account: {
        id: '',
        login: false,
        fields: [],
        logsLocale: '',
        departmentId: '',
        limitedRole: false
      },
      isMatched: [],
      cpeSearch: _.cloneDeep(CPE_SEARCH),
      cpeFilter: _.cloneDeep(CPE_FILTER),
      cpeFilterList: _.cloneDeep(CPE_FILTER_LIST),
      filterDataCount: 0,
      tableContextAnchor: null,
      filterContextAnchor: null,
      showFilterQuery: false,
      showFilterType: 'open', // 'open', 'load', 'save'
      filterQueryList: [],
      cpeEditOpen: false,
      currentCpeData: {},
      cpeData: {
        dataFieldsArr: ['_menu', 'part', 'vendor', 'product', 'version', 'update', 'edition', 'language', 'swEdition', 'targetSw', 'targetHw', 'other', 'cpe23uri', 'productCpename', 'isMatched'],
        dataFields: [],
        dataContent: null,
        sort: {
          field: '',
          desc: true
        },
        totalCount: 0,
        currentPage: 0,
        pageSize: 20
      },
      formValidation: _.cloneDeep(FORM_VALIDATION)
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, session, sessionRights} = this.context;
    let tempAccount = {...this.state.account};

    helper.getPrivilegesInfo(sessionRights, 'common', locale);
    helper.inactivityTime(baseUrl, locale);

    if (session.accountId) {
      tempAccount.id = session.accountId;
      tempAccount.login = true;
      tempAccount.departmentId = session.departmentId;

      if (!sessionRights.Module_Config) {
        tempAccount.limitedRole = true;
      }

      this.setState({
        account: tempAccount
      }, () => {
        this.getCpeData();
      });
    }

    this.getIsMatched();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  getIsMatched = () => {
    const isMatched = _.map(TRUE_FALSE, val => {
      return {
        value: val,
        text: t('txt-' + val)
      };
    });

    this.setState({
      isMatched
    });
  }
  /**
   * Get and set CPE data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getCpeData = (fromPage) => {
    const {baseUrl} = this.context;
    const {cpeSearch, cpeData} = this.state;
    const sort = cpeData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? cpeData.currentPage : 0;
    const requestData = {
      ...this.getCpeFilterRequestData()
    };
    let url = `${baseUrl}/api/hmd/cpe/_search?page=${page + 1}&pageSize=${cpeData.pageSize}`;

    if (cpeData.sort.field) {
      url += `&orders=${cpeData.sort.field} ${sort}`;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempCpeSearch = {...cpeSearch};
        let tempCpeData = {...cpeData};

        if (!data.rows || data.rows.length === 0) {
          tempCpeSearch.count = 0;
          tempCpeData.dataContent = [];
          tempCpeData.totalCount = 0;

          this.setState({
            cpeSearch: tempCpeSearch,
            cpeData: tempCpeData
          });
          return null;
        }       

        tempCpeData.dataContent = data.rows;
        tempCpeData.totalCount = data.counts;
        tempCpeData.currentPage = page;
        tempCpeData.dataFields = _.map(cpeData.dataFieldsArr, val => {
          return {
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : f('hostCpeFields.' + val),
            options: {
              filter: true,
              sort: false,
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempCpeData.dataContent[dataIndex];
                const value = tempCpeData.dataContent[dataIndex][val];

                if (val === '_menu') {
                  return (
                    <div className='table-menu active'>
                      <Button className='host-open-table-menu' variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue)} data-cy='hostOpenTableMenuBtn'><i className='fg fg-more'></i></Button>
                    </div>
                  )
                } else if (val === 'isMatched') {
                  return <span className={'true-false-status true-false-status-' + value}>{t('txt-' + value)}</span>
                } else {
                  return <span>{value}</span>
                }
              }
            }
          };
        });
        tempCpeSearch.count = helper.numberWithCommas(data.counts);

        this.setState({
          cpeSearch: tempCpeSearch,
          cpeData: tempCpeData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    const {currentCpeData} = this.state;

    let tempCurrentCpeData = {...currentCpeData};
    tempCurrentCpeData[event.target.name] = event.target.value;  

    this.setState({
      currentCpeData: tempCurrentCpeData
    });
  }
  /**
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable field
   */
  checkSortable = (field) => {
    const unSortableFields = ['_menu'];

    if (_.includes(unSortableFields, field)) {
      return false;
    } else {
      return true;
    }
  }
  /**
   * Get CPE filter request data
   * @method
   * @returns requestData object
   */
  getCpeFilterRequestData = () => {
    const {cpeSearch, cpeFilter} = this.state;
    let requestData = {};

    if (cpeSearch.keyword) {
      requestData.cpe23uri = cpeSearch.keyword;
    }

    if (cpeFilter.part && cpeFilter.part.length > 0) {
      requestData.part = cpeFilter.part;
    }
    
    if (cpeFilter.pavendort && cpeFilter.vendor.length > 0) {
      requestData.vendor = cpeFilter.vendor;
    }

    if (cpeFilter.product && cpeFilter.product.length > 0) {
      requestData.product = cpeFilter.product;
    }

    if (cpeFilter.version && cpeFilter.version.length > 0) {
      requestData.version = cpeFilter.version;
    }

    if (cpeFilter.update && cpeFilter.update.length > 0) {
      requestData.update = cpeFilter.update;
    }

    if (cpeFilter.edition && cpeFilter.edition.length > 0) {
      requestData.edition = cpeFilter.edition;
    }

    if (cpeFilter.language && cpeFilter.language.length > 0) {
      requestData.language = cpeFilter.language;
    }

    if (cpeFilter.swEdition && cpeFilter.swEdition.length > 0) {
      requestData.swEdition = cpeFilter.swEdition;
    }

    if (cpeFilter.targetSw && cpeFilter.targetSw.length > 0) {
      requestData.targetSw = cpeFilter.targetSw;
    }

    if (cpeFilter.targetHw && cpeFilter.targetHw.length > 0) {
      requestData.targetHw = cpeFilter.targetHw;
    }

    if (cpeFilter.other && cpeFilter.other.length > 0) {
      requestData.other = cpeFilter.other;
    }

    if (cpeFilter.productCpename && cpeFilter.productCpename.length > 0) {
      requestData.productCpename = cpeFilter.productCpename;
    }

    if (cpeFilter.isMatched === 'true' || cpeFilter.isMatched === 'false')
      requestData.isMatched = cpeFilter.isMatched === 'true'

    return requestData;
  }
  /**
   * Handle open menu
   * @method
   * @param {string} cpe - active CPE
   * @param {object} event - event object
   */
  handleOpenMenu = (cpe, event) => {
    this.setState({
      tableContextAnchor: event.currentTarget,
      currentCpeData: cpe
    });
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      tableContextAnchor: null,
      filterContextAnchor: null
    });
  }
  /**
   * Toggle CPE edit dialog on/off
   * @method
   */
  toggleCpeEdit = () => {
    this.setState({
      cpeEditOpen: !this.state.cpeEditOpen
    });

    this.handleCloseMenu();
  }
  /**
   * Display edit form
   * @method
   * @param {string} val - edit data
   * @param {number} i - index of the edit data
   * @returns HTML DOM
   */
  showEditForm = (val, i) => {
    return (
      <div key={i} className='group'>
        <TextField
          name={val}
          label={f('hostCpeFields.' + val)}
          variant='outlined'
          fullWidth
          size='small'
          value={this.state.currentCpeData[val]}
          onChange={this.handleDataChange.bind(this)} />
      </div>
    )
  }
  /**
   * Display CPE edit content
   * @method
   * @returns HTML DOM
   */
  displayCpeEdit = () => {
    const {currentCpeData, formValidation} = this.state;

    return (
      <div className='cpe-form'>
        <div className='group-flex'>
          <div className='group-parent'>
            {EDIT_LIST_PART1.map(this.showEditForm)}
          </div>
          <div className='group-parent'>
            {EDIT_LIST_PART2.map(this.showEditForm)}
          </div>
        </div>
        <div className='group cpe'>
          <TextField
            name='cpe23uri'
            label={f('hostCpeFields.cpe23uri')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!formValidation.cpe23uri.valid}
            helperText={formValidation.cpe23uri.valid ? '' : t('txt-required')}
            value={currentCpeData.cpe23uri}
            onChange={this.handleDataChange.bind(this)} />
        </div>
      </div>
    )
  }
  /**
   * Open CPE edit dialog
   * @method
   * @returns ModalDialog component
   */
  showCpeEdit = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeCpeEditDialog},
      confirm: {text: t('txt-confirm'), handler: this.handleCpeEditConfirm}
    };

    return (
      <ModalDialog
        id='cpeEditDialog'
        className='modal-dialog'
        title={t('txt-edit')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayCpeEdit()}
      </ModalDialog>
    )
  }
  /**
   * Handle CPE edit confirm
   * @method
   */
  handleCpeEditConfirm = () => {
    const {baseUrl} = this.context;
    const {currentCpeData, formValidation} = this.state;
    const url = `${baseUrl}/api/hmd/cpe`;
    const requestData = {
      ...currentCpeData
    };
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (currentCpeData.cpe23uri) {
      tempFormValidation.cpe23uri.valid = true;
    } else {
      tempFormValidation.cpe23uri.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    //Remove date property
    delete requestData.createDttm;
    delete requestData.updateDttm;

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'PATCH',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.getCpeData();
        this.closeCpeEditDialog();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Close CPE edit dialog
   * @method
   */
  closeCpeEditDialog = () => {
    this.setState({
      cpeEditOpen: false,
      currentCpeData: {},
      formValidation: _.cloneDeep(FORM_VALIDATION)
    });
  }
  /**
   * Display modal dialog
   * @method
   */
  handleCpeDelete = () => {
    PopupDialog.prompt({
      title: t('txt-delete'),
      id: 'modalWindowSmall',
      confirmText: t('txt-ok'),
      cancelText: t('txt-cancel'),
      display: <div className='content delete'>
          <span>{t('txt-delete-msg')}?</span>
        </div>,
      act: (confirmed) => {
        if (confirmed) {
          this.deleteCpe();
        }
      }
    });

    this.handleCloseMenu();
  }
  /**
   * Handle modal confirm
   * @method
   */
  deleteCpe = () => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/hmd/cpe?id=${this.state.currentCpeData.id}`;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url,
      type: 'DELETE'
    })
    .then(() => {
      this.getCpeData();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle reset button for host name search
   * @method
   * @param {string} type - reset button type ('cpeSearch')
   */
  handleResetBtn = (type) => {
    const {cpeSearch} = this.state;

    if (type === 'cpeSearch') {
      let tempCpeSearch = {...cpeSearch};
      tempCpeSearch.keyword = '';

      this.setState({
        cpeSearch: tempCpeSearch
      });
    }
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    const {cpeData} = this.state;
    let tempCpeData = {...cpeData};
    let tableField = field;

    tempCpeData.sort.field = tableField;
    tempCpeData.sort.desc = sort;

    this.setState({
      cpeData: tempCpeData
    }, () => {
      this.getCpeData();
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    const {cpeData} = this.state;
    let tempCpeData = {...cpeData};

    tempCpeData[type] = value;

    this.setState({
      cpeData: tempCpeData
    }, () => {
      this.getCpeData(type);
    });
  }
  /**
   * Handle CPE search search
   * @method
   * @param {object} event - event object
   */
  handleCpeChange = (event) => {
    let tempCpeSearch = {...this.state.cpeSearch};
    tempCpeSearch[event.target.name] = event.target.value;

    this.setState({
      cpeSearch: tempCpeSearch
    });
  }
  /**
   * Show filter query
   * @method
  */
  handleShowFilterQuery = (type) => {
    if (type === 'load') {
      this.fetchFilterQuery()
    }

    this.setState({
      showFilterQuery: true,
      showFilterType: type,
      filterContextAnchor: null
    });
  }
  handleFilterQuery = (type, filterData) => {
    if (type !== 'cancel') {
      let filterDataCount = 0;
      _.forEach(filterData.filter, (val, key) => {
        if (typeof val === 'string') {
          if (val !== '')
            filterDataCount++;

        } else if (Array.isArray(val)) {
          if (val.length > 0 && val[0].input !== '')
            filterDataCount++;

        } else {
          filterDataCount++;
        }
      })

      this.setState({
        cpeFilter: filterData.filter,
        cpeFilterList: filterData.itemFilterList,
        filterDataCount
      }, () => {
        this.getCpeData();
        if (type === 'save')
          this.saveFilterQuery(filterData.queryName);
      });
    }

    this.setState({
      showFilterQuery: false,
      filterContextAnchor: null
    });
  }
  handleDeleteFilterQuery = (id, queryName) => {
    PopupDialog.prompt({
      title: t('txt-deleteQuery'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: <div className='content delete'><span>{t('txt-delete-msg')}: {queryName}?</span></div>,
      act: (confirmed) => {
        if (confirmed) {
          this.deleteFilterQuery(id);
        }
      }
    });
  }
  fetchFilterQuery = () => {
    const {baseUrl} = this.context;
    const {account, severityType} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/account/queryText?accountId=${account.id}&module=CPE`,
      type: 'GET',
      pcontentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let filterQueryList = _.map(data, filter => {
          let newFilter = {
            id: filter.id,
            name: filter.name,
            content: _.cloneDeep(CPE_FILTER_LIST)
          };
          if (filter.queryText) {
            let content = {
              part: filter.queryText.part ? filter.queryText.part : '',
              vendor: filter.queryText.vendor ? filter.queryText.vendor : '',
              product: filter.queryText.product ? filter.queryText.product : '',
              version: filter.queryText.version ? filter.queryText.version : '',
              update: filter.queryText.update ? filter.queryText.update : '',
              edition: filter.queryText.edition ? filter.queryText.edition : '',
              language: filter.queryText.language ? filter.queryText.language : '',
              swEdition: filter.queryText.swEdition ? filter.queryText.swEdition : '',
              targetSw: filter.queryText.targetSw ? filter.queryText.targetSw : '',
              targetHw: filter.queryText.targetHw ? filter.queryText.targetHw : '',
              other: filter.queryText.other ? filter.queryText.other : '',
              productCpename: filter.queryText.productCpename ? filter.queryText.productCpename : '',
              isMatched: filter.queryText.isMatched === 'true' ? true : filter.queryText.isMatched === 'false' ? false : ''
            }
            newFilter.content = content;
          }
          return newFilter;
        });

        this.setState({filterQueryList});
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  saveFilterQuery = (queryName) => {
    const {baseUrl} = this.context;
    const {account} = this.state;

    const requestData = {
      ...this.getCpeFilterRequestData()
    };

    this.ah.one({
      url: `${baseUrl}/api/account/queryText`,
      data: JSON.stringify({
        accountId: account.id,
        module: 'CPE',
        name: queryName,
        queryText: requestData
      }),
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-querySaved'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  deleteFilterQuery = (id) => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/account/queryText?id=${id}`,
      type: 'DELETE',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.fetchFilterQuery();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  handleFilterOpenMenu = (event) => {
    this.setState({
      filterContextAnchor: event.currentTarget
    });
  }
  render() {
    const {
      account,
      isMatched,
      cpeSearch,
      cpeFilter,
      cpeFilterList,
      filterDataCount,
      filterQueryList,
      tableContextAnchor,
      filterContextAnchor,
      showFilterQuery,
      showFilterType,
      cpeEditOpen,
      cpeData
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
        {showFilterQuery &&
          <FilterQuery
            page='cpe'
            showFilterType={showFilterType}
            account={account}
            isMatched={isMatched}
            filterList={FILTER_LIST}
            originalFilter={CPE_FILTER}
            filter={cpeFilter}
            originalItemFilterList={CPE_FILTER_LIST}
            itemFilterList={cpeFilterList}
            onFilterQuery={this.handleFilterQuery}
            onDeleteFilterQuery={this.handleDeleteFilterQuery}
            filterQueryList={filterQueryList} />
        }

        {cpeEditOpen &&
          this.showCpeEdit()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <HostMenu />
          </div>
        </div>

        <div className='data-content'>
          <div className='parent-content'>
            <TableList
              page='cpe'
              searchType='cpeSearch'
              search={cpeSearch}
              data={cpeData}
              options={tableOptions}
              tableAnchor={tableContextAnchor}
              filterAnchor={filterContextAnchor}
              getData={this.getCpeData}
              toggleCpeEdit={this.toggleCpeEdit}
              handleCpeDelete={this.handleCpeDelete}
              onFilterQueryClick={this.handleShowFilterQuery}
              filterDataCount={filterDataCount}
              handleSearch={this.handleCpeChange}
              handleReset={this.handleResetBtn}
              handleFilterMenu={this.handleFilterOpenMenu}
              handleCloseMenu={this.handleCloseMenu} />
          </div>
        </div>
      </div>
    )
  }
}

HostCpe.contextType = BaseDataContext;

HostCpe.propTypes = {
};

export default HostCpe;