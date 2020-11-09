import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { NavLink, Link, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';

import Combobox from 'react-ui/build/src/components/combobox'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import helper from '../../common/helper'
import SearchOptions from '../../common/search-options'
import TableContent from '../../common/table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

/**
 * ES Management
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the ES Management page
 */
class EsManage extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      showFilter: false,
      importIndexOpen: false,
      datetime: {
        from: helper.getSubstractDate(1, 'month'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
      },
      importList: [],
      statusList: [],
      esSearch: {
        status: 'all'
      },
      selectedImportList: [],
      es: {
        dataFieldsArr: ['date', 'status', 'docCount', 'storeSize', 'priStoreSize', '_menu'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'date',
          desc: true
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        info: {}
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getEsData('search');
  }
  /**
   * Set status data
   * @method
   * @param {string} date - selected date
   * @param {object} event - event object
   */
  handleStatusChange = (date, event) => {
    const {baseUrl} = this.context;
    const type = event.target.checked ? 'open' : 'close';

    this.ah.one({
      url: `${baseUrl}/api/elasticsearch/${type}?date=${date}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-requestSent'));
        this.getEsData();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle index export
   * @method
   * @param {object} allValue - ES data
   */
  handleIndexExport = (allValue) => {
    const {baseUrl} = this.context;

    if (!allValue.export) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/elasticsearch/export?date=${allValue.date}`,
      type: 'GET'
    })
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    helper.showPopupMsg(t('txt-requestSent'));
    this.getEsData();
  }
  /**
   * Get and set ES table data
   * @method
   * @param {string} fromSearch - option for the 'search'
   */
  getEsData = (fromSearch) => {
    const {baseUrl} = this.context;
    const {datetime, esSearch, es} = this.state;
    const sort = es.sort.desc ? 'desc' : 'asc';
    const page = fromSearch === 'search' ? 1 : es.currentPage;
    const dateTime = {
      from: Moment(datetime.from).format('YYYY.MM.DD'),
      to: Moment(datetime.to).format('YYYY.MM.DD')
    };
    let url = `${baseUrl}/api/elasticsearch/list?page=${page}&pageSize=${es.pageSize}&orders=${es.sort.field} ${sort}&startDate=${dateTime.from}&endDate=${dateTime.to}`;

    if (esSearch.status !== 'all') {
      url += `&status=${esSearch.status}`;
    }

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempEs = {...es};
        tempEs.dataContent = data.rows;
        tempEs.totalCount = data.counts;
        tempEs.currentPage = page;

        if (!data.rows || data.rows.length === 0) {
          helper.showPopupMsg(t('txt-notFound'));
          return;
        }

        const statusList = _.map(data.statusList, (val, i) => {
          return <MenuItem key={i} value={val.toLowerCase()}>{val}</MenuItem>
        });
        
        let dataFields = {};
        es.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: tempData === '_menu' ? '' : f(`esFields.${tempData}`),
            sortable: tempData === 'date' ? true : null,
            formatter: (value, allValue, i) => {
              if (tempData === '_menu') {
                return (
                  <div className='table-menu menu active'>
                    <FormControlLabel
                      className='toggle-btn'
                      control={
                        <Switch
                          checked={allValue.isOpen}
                          onChange={this.handleStatusChange.bind(this, allValue.date)}
                          color='primary' />
                      }
                      label={t('txt-switch')}
                      disabled={!allValue.actionEnable} />
                    <i className={cx('fg fg-data-export', {'not-allowed': !allValue.export})} title={t('txt-export')} onClick={this.handleIndexExport.bind(this, allValue)}></i>
                  </div>
                )
              }

              if (tempData === 'docCount' || tempData === 'storeSize' || tempData === 'priStoreSize') {
                value = helper.numberWithCommas(value);
              }

              return <span>{value}</span>
            }
          };
        })

        tempEs.dataFields = dataFields;

        this.setState({
          statusList,
          es: tempEs
        }, () => {
          this.getImportList();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set index import list
   * @method
   */
  getImportList = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/elasticsearch/importlist`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        this.setState({
          importList: data.folderList
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (sort) => {
    let tempEs = {...this.state.es};
    tempEs.sort.field = sort.field;
    tempEs.sort.desc = sort.desc;

    this.setState({
      es: tempEs
    }, () => {
      this.getEsData();
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempEs = {...this.state.es};
    tempEs[type] = Number(value);

    if (type === 'pageSize') {
      tempEs.currentPage = 1;
    }

    this.setState({
      es: tempEs
    }, () => {
      this.getEsData();
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
   * Handle filter input data change
   * @method
   * @param {object} event - event object
   */
  handleEsSearch = (event) => {
    let tempEsSearch = {...this.state.esSearch};
    tempEsSearch[event.target.name] = event.target.value;

    this.setState({
      esSearch: tempEsSearch
    });
  }
  /**
   * Handle search submit
   * @method
   */
  handleSearchSubmit = () => {
    let tempEs = {...this.state.es};
    tempEs.dataContent = [];
    tempEs.totalCount = 0;
    tempEs.currentPage = 1;

    this.setState({
      es: tempEs
    }, () => {
      this.getEsData();
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {locale} = this.context;
    const {showFilter, statusList, esSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <TextField
              id='esSearchStatus'
              name='status'
              select
              label={t('txt-status')}
              variant='outlined'
              fullWidth={true}
              size='small'
              value={esSearch.status}
              onChange={this.handleEsSearch}>
              <MenuItem value={'all'}>{t('txt-all')}</MenuItem>
              {statusList}
            </TextField>
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.handleSearchSubmit}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      esSearch: {
        status: 'all'
      }
    });
  }
  /**
   * Toggle Import Index dialog on/off
   * @method
   */
  toggleImportIndex = () => {
    this.setState({
      importIndexOpen: !this.state.importIndexOpen,
      selectedImportList: []
    });
  }
  /**
   * Handle add/remove for the import index box
   * @method
   * @param {array} data - import index list array
   */
  handleImportIndexChange = (data) => {
    this.setState({
      selectedImportList: data
    });
  }
  /**
   * Display import index content
   * @method
   * @returns HTML DOM
   */
  displayImportIndexContent = () => {
    const {importList, selectedImportList} = this.state;
    const formattedImportList = _.map(importList, val => {
      return {
        value: val,
        text: val.replace(/\./g, '-')
      }
    });

    return (
      <div>
        <label>{t('txt-esImportMsg')}</label>
        <Combobox
          list={formattedImportList}
          multiSelect={{
            enabled: true,
            toggleAll: true
          }}
          search={{
            enabled: true
          }}
          value={selectedImportList}
          onChange={this.handleImportIndexChange} />
      </div>
    )
  }
  /**
   * Open import index modal dialog
   * @method
   * @returns HTML DOM
   */
  importIndexDialog = () => {
    const {info} = this.state;
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleImportIndex},
      confirm: {text: t('txt-confirm'), handler: this.confirmImportIndex}
    };

    return (
      <ModalDialog
        id='importEsIndexDialog'
        className='modal-dialog'
        title={t('txt-importEsIndex')}
        draggable={true}
        global={true}
        actions={actions}
        info={info}
        closeAction='cancel'>
        {this.displayImportIndexContent()}
      </ModalDialog>
    )
  }
  /**
   * Handle import index confirm
   * @method
   */
  confirmImportIndex = () => {
    const {baseUrl} = this.context;
    const {selectedImportList} = this.state;
    const url = `${baseUrl}/api/elasticsearch/import`;

    if (selectedImportList.length === 0) {
      return;
    }

    const requestData = {
      esData: selectedImportList
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    helper.showPopupMsg(t('txt-requestSent'));
    this.toggleImportIndex();
    this.getEsData('search');    
  }
  /**
   * Set new datetime
   * @method
   * @param {object} datetime - new datetime object
   */
  handleDateChange = (datetime) => {
    this.setState({
      datetime
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {showFilter, importIndexOpen, datetime, es} = this.state;
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
        {importIndexOpen &&
          this.importIndexDialog()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
          </div>

          <SearchOptions
            datetime={datetime}
            enableTime={false}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.handleSearchSubmit} />          
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            {this.renderFilter()}

            <div className='main-content'>
              <header className='main-header'>{t('txt-esManage')}</header>

              <div className='content-header-btns'>
                <button className='standard btn' onClick={this.toggleImportIndex}>{t('txt-importEsIndex')}</button>
              </div>

              <TableContent
                dataTableData={es.dataContent}
                dataTableFields={es.dataFields}
                dataTableSort={es.sort}
                paginationTotalCount={es.totalCount}
                paginationPageSize={es.pageSize}
                paginationCurrentPage={es.currentPage}
                handleTableSort={this.handleTableSort}
                paginationPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

EsManage.contextType = BaseDataContext;

EsManage.propTypes = {
};

export default EsManage;