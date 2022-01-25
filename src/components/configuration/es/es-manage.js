import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { NavLink, Link, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import moment from 'moment'
import cx from 'classnames'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context'
import Config from '../../common/configuration'
import helper from '../../common/helper'
import MuiTableContent from '../../common/mui-table-content'
import SearchOptions from '../../common/search-options'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

/**
 * ES Management
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
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
        to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
      },
      importList: [],
      statusList: [],
      esSearch: {
        status: 'all'
      },
      selectedImportList: [],
      es: {
        dataFieldsArr: ['date', 'status', 'docCount', 'storeSize', 'priStoreSize', '_menu'],
        dataFields: [],
        dataContent: null,
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
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);
    helper.inactivityTime(baseUrl, locale);

    this.getEsData();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Show the export confirm modal dialog
   * @method
   * @param {object} allValue - ES data
   */
  openExportConfirmModal = (allValue) => {
    PopupDialog.prompt({
      title: t('txt-export'),
      id: 'modalWindowSmall',
      confirmText: t('txt-ok'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{t('es-management.txt-exportMsg')}?</span>
        </div>
      ),
      act: (confirmed) => {
        if (confirmed) {
          this.handleIndexExport(allValue);
        }
      }
    });
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

    helper.showPopupMsg(t('txt-requestSent'));

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

    this.getEsData();
  }
  /**
   * Show the close index confirm modal dialog
   * @method
   * @param {string} date - selected date
   * @param {object} event - event object
   */
  openIndexConfirmModal = (date, event) => {
    const type = event.target.checked ? 'open' : 'close';

    if (type === 'open') {
      this.getEsData('status', date, 'open');
    } else if (type === 'close') {
      PopupDialog.prompt({
        title: t('txt-close'),
        id: 'modalWindowSmall',
        confirmText: t('txt-ok'),
        cancelText: t('txt-cancel'),
        display: (
          <div className='content'>
            <div style={{marginBottom: '10px'}}>{t('es-management.txt-turnOffMsg')}?</div>
            <div>({t('es-management.txt-turnOffMsg-more')})</div>
          </div>
        ),
        act: (confirmed) => {
          if (confirmed) {
            this.getEsData('status', date, 'close');
          }
        }
      });
    }
  }
  /**
   * Get and set ES table data
   * @method
   * @param {string} options - option for 'currentPage' or 'status'
   * @param {string} date - selected date
   * @param {string} type - 'open' or 'close'
   */
  getEsData = (options, date, type) => {
    const {baseUrl} = this.context;
    const {datetime, esSearch, es} = this.state;
    const sort = es.sort.desc ? 'desc' : 'asc';
    const page = options === 'currentPage' ? es.currentPage : 0;
    const dateTime = {
      from: moment(datetime.from).format('YYYY.MM.DD'),
      to: moment(datetime.to).format('YYYY.MM.DD')
    };
    let url = `${baseUrl}/api/elasticsearch/list?page=${page + 1}&pageSize=${es.pageSize}&orders=${es.sort.field} ${sort}&startDate=${dateTime.from}&endDate=${dateTime.to}`;

    if (esSearch.status !== 'all') {
      url += `&status=${esSearch.status}`;
    }

    let apiArr = [{
      url,
      type: 'GET'
    }];

    //Combine the two APIs to show the loading icon
    if (options === 'status') {
      apiArr.unshift({
        url: `${baseUrl}/api/elasticsearch/${type}?date=${date}`,
        type: 'GET'
      });
    }

    this.ah.series(apiArr)
    .then(data => {
      if (data && data.length > 0) {
        if (data[1] && data[1].ret === 0 && options === 'status') {
          data = data[1].rt;
        } else if (data[0] && data[0].ret === 0) {
          data = data[0].rt;
        }

        let tempEs = {...es};

        if (!data.rows || data.rows.length === 0) {
          tempEs.dataContent = [];
          tempEs.totalCount = 0;

          this.setState({
            es: tempEs
          });
          return null;
        }

        tempEs.dataContent = data.rows;
        tempEs.totalCount = data.counts;
        tempEs.currentPage = page;
        const statusList = _.map(data.statusList, (val, i) => {
          return <MenuItem key={i} value={val.toLowerCase()}>{val}</MenuItem>
        });
        tempEs.dataFields = _.map(es.dataFieldsArr, val => {
          return {
            name: val,
            label: val === '_menu' ? ' ' : f(`esFields.${val}`),
            options: {
              filter: val === 'date' ? true : false,
              sort: val === 'date' ? true : false,
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempEs.dataContent[dataIndex];
                const value = tempEs.dataContent[dataIndex][val];

                if (val === '_menu' && allValue.showButton) {
                  return (
                    <div className='table-menu menu active'>
                      <FormControlLabel
                        className='toggle-btn'
                        control={
                          <Switch
                            checked={allValue.isOpen}
                            onChange={this.openIndexConfirmModal.bind(this, allValue.date)}
                            color='primary' />
                        }
                        label={t('txt-switch')}
                        disabled={!allValue.actionEnable} />
                      <i className={cx('fg fg-data-export', {'not-allowed': !allValue.export})} title={t('txt-export')} onClick={this.openExportConfirmModal.bind(this, allValue)}></i>
                    </div>
                  )
                } else if (val === 'docCount' || val === 'storeSize' || val === 'priStoreSize') {
                  return helper.numberWithCommas(value);
                } else {
                  return value;
                }
              }
            }
          };
        });

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
      if (data && data.ret === 0) {
        data = data.rt;

        const importList = _.map(data.folderList, val => {
          return {
            value: val.replace(/\./g, '-')
          };
        });

        this.setState({
          importList
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
  handleTableSort = (field, sort) => {
    let tempEs = {...this.state.es};
    tempEs.sort.field = field;
    tempEs.sort.desc = sort;

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
      tempEs.currentPage = 0;
    }

    this.setState({
      es: tempEs
    }, () => {
      this.getEsData(type);
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
   * Handle filter search submit
   * @method
   */
  handleSearchSubmit = () => {
    let tempEs = {...this.state.es};
    tempEs.dataFields = [];
    tempEs.dataContent = [];
    tempEs.totalCount = 0;
    tempEs.currentPage = 1;
    tempEs.oldPage = 1;
    tempEs.pageSize = 20;
    
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
              fullWidth
              size='small'
              value={esSearch.status}
              onChange={this.handleEsSearch}>
              <MenuItem value={'all'}>{t('txt-all')}</MenuItem>
              {statusList}
            </TextField>
          </div>
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.handleSearchSubmit}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
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
   * @param {object} event - event object
   * @param {array.<object>} value - selected input value
   */
  handleComboBoxChange = (event, value) => {
    this.setState({
      selectedImportList: value
    });    
  }
  /**
   * Display import index content
   * @method
   * @returns HTML DOM
   */
  displayImportIndexContent = () => {
    const {importList, selectedImportList} = this.state;

    return (
      <div>
        <label>{t('txt-esImportMsg')}</label>
        <Autocomplete
          className='combo-box checkboxes-tags groups'
          multiple
          value={selectedImportList}
          options={importList}
          getOptionLabel={(option) => option.value}
          disableCloseOnSelect
          noOptionsText={t('txt-notFound')}
          openText={t('txt-on')}
          closeText={t('txt-off')}
          clearText={t('txt-clear')}
          renderOption={(option, { selected }) => (
            <React.Fragment>
              <Checkbox
                color='primary'
                icon={<CheckBoxOutlineBlankIcon />}
                checkedIcon={<CheckBoxIcon />}
                checked={selected} />
              {option.value}
            </React.Fragment>
          )}
          renderInput={(params) => (
            <TextField {...params} variant='outlined' size='small' />
          )}
          getOptionSelected={(option, value) => (
            option.value === value.value
          )}
          onChange={this.handleComboBoxChange} />
      </div>
    )
  }
  /**
   * Open import index modal dialog
   * @method
   * @returns HTML DOM
   */
  importIndexDialog = () => {
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
        info={this.state.info}
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
      esData: _.map(selectedImportList, val => {
        return val.value.replace(/\-/g, '.');
      })
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    helper.showPopupMsg(t('txt-requestSent'));
    this.toggleImportIndex();
    this.getEsData();    
  }
  /**
   * Set new datetime
   * @method
   * @param {string} type - date type ('from' or 'to')
   * @param {object} newDatetime - new datetime object
   */
  handleDateChange = (type, newDatetime) => {
    let tempDatetime = {...this.state.datetime};
    tempDatetime[type] = newDatetime;

    this.setState({
      datetime: tempDatetime
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
            <Button variant='outlined' color='primary' className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></Button>
          </div>

          <SearchOptions
            datetime={datetime}
            enableTime={false}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.getEsData} />
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            {this.renderFilter()}

            <div className='main-content'>
              <header className='main-header'>{t('txt-esManage')}</header>

              <div className='content-header-btns with-menu'>
                <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleImportIndex}>{t('txt-importEsIndex')}</Button>
              </div>

              <MuiTableContent
                data={es}
                tableOptions={tableOptions} />
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