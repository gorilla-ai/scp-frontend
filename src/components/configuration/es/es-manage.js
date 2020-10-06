import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { NavLink, Link, Switch, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import DateRange from 'react-ui/build/src/components/date-range'
import DropDownList from 'react-ui/build/src/components/dropdown'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import ToggleBtn from 'react-ui/build/src/components/toggle-button'

import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import helper from '../../common/helper'
import ImportIndex from './import-index'
import TableContent from '../../common/table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

/**
 * Edge
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
      esSearch: {
        keyword: ''
      },
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
      },
      importIndex: [{
        index: ''
      }]
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getEsData();
  }
  /**
   * Set status data
   * @method
   * @param {string} date - selected date
   * @param {boolean} value - status
   */
  handleStatusChange = (date, value) => {
    const {baseUrl} = this.context;
    let type = '';

    if (value) {
      type = 'open';
    } else {
      type = 'close';
    }

    this.ah.one({
      url: `${baseUrl}/api/elasticsearch/${type}?date=*-${date}`,
      type: 'GET'
    })
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    helper.showPopupMsg(t('txt-requestSent'));
    this.getEsData('search');
  }
  /**
   * Handle index export
   * @method
   * @param {string} date - selected date
   */
  handleIndexExport = (date) => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/elasticsearch/export?date=*-${date}`,
      type: 'GET'
    })
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    helper.showPopupMsg(t('txt-requestSent'));
    this.getEsData('search');
  }
  /**
   * Get and set ES table data
   * @method
   * @param {string} fromSearch - option for the 'search'
   */
  getEsData = (fromSearch) => {
    const {baseUrl} = this.context;
    const {es} = this.state;
    const sort = es.sort.desc ? 'desc' : 'asc';

    this.ah.one({
      url: `${baseUrl}/api/elasticsearch/list?page=${es.currentPage}&pageSize=${es.pageSize}&orders=${es.sort.field} ${sort}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempEs = {...es};
        tempEs.dataContent = data.rows;
        tempEs.totalCount = data.counts;
        tempEs.currentPage = fromSearch === 'search' ? 1 : es.currentPage;
        
        let dataFields = {};
        es.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: tempData === '_menu' ? '' : f(`esFields.${tempData}`),
            sortable: tempData === 'date' ? true : null,
            formatter: (value, allValue, i) => {
              if (tempData === '_menu') {
                return (
                  <div className='table-menu menu active'>
                    <ToggleBtn
                      className='toggle-btn'
                      onText={t('txt-on')}
                      offText={t('txt-off')}
                      on={allValue.isOpen}
                      onChange={this.handleStatusChange.bind(this, allValue.date)}
                      disabled={!allValue.actionEnable} />                  
                    <i className={cx('fg fg-data-export', {'not-allowed': !allValue.export})} title={t('txt-export')} onClick={this.handleIndexExport.bind(this, allValue.date)}></i>
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
          es: tempEs
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
   * @param {object} sort - sort data object
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
   * @param {string | number} value - new page number
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
   * @param {string} type - input type
   * @param {string | object} value - input value
   */
  handleEsSearch = (type, value) => {
    let tempEsSearch = {...this.state.esSearch};

    if (type === 'keyword') { //value is an object type
      tempEsSearch[type] = value.target.value.trim();
    }

    this.setState({
      esSearch: tempEsSearch
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, esSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='edgeSearchKeyword'>{f('edgeFields.keywords')}</label>
            <input
              id='edgeSearchKeyword'
              type='text'
              value={esSearch.keyword}
              onChange={this.handleEsSearch.bind(this, 'keyword')} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getEsData.bind(this, 'search')}>{t('txt-filter')}</button>
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
        keyword: ''
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
      importIndex: [{
        index: ''
      }]
    });
  }
  /**
   * Handle add/remove for the import index box
   * @method
   * @param {array} data - import index list array
   */
  handleImportIndexChange = (data) => {
    this.setState({
      importIndex: data
    });
  }
  /**
   * Display import index content
   * @method
   * @returns HTML DOM
   */
  displayImportIndexContent = () => {
    return (
      <MultiInput
        id='esIndexMultiInputs'
        base={ImportIndex}
        defaultItemValue={{
          index: ''
        }}
        value={this.state.importIndex}
        onChange={this.handleImportIndexChange}/>
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
    const {importIndex} = this.state;
    const url = `${baseUrl}/api/elasticsearch/import`;
    let esData = [];

    _.forEach(importIndex, val => {
      if (val.index) {
        const newDate = val.index.replace(/-/g, '.');
        esData.push(newDate);
      }
    })

    const requestData = {
      esData
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
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {showFilter, importIndexOpen, es} = this.state;

    return (
      <div>
        {importIndexOpen &&
          this.importIndexDialog()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
          </div>
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