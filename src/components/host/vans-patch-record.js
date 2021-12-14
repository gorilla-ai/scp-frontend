import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment'
import cx from 'classnames'

import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardDateTimePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

/**
 * Vans Patch Record
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show Vans Patch Record component
 */
class VansPatchRecord extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vansRecordSearch: {
        keyword: ''
      },
      datetime: {
        from: helper.getSubstractDate(1, 'week', moment().local().format('YYYY-MM-DD') + 'T00:00:00'),
        to: helper.getSubstractDate(1, 'day', moment().local().format('YYYY-MM-DD') + 'T00:00:00')
      },
      vansRecord: {
        dataFieldsArr: ['threatText', 'threatType', 'dataSourceType', 'createDttm'],
        dataFields: [],
        dataContent: null,
        sort: {
          field: 'threatText',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.handleVansRecordSearch();
  }
  ryan = () => {}
  /**
   * Get and set Vans Record table data
   * @method
   */
  handleVansRecordSearch = () => {
    const {baseUrl, contextRoot} = this.context;
    const {vansRecordSearch, datetime, vansRecord} = this.state;
    let url = `${baseUrl}/api/v2/ipdevice?startDttm=${datetime.from}&endDttm=${datetime.to}`;

    if (vansRecordSearch.keyword) {
      
    }

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        console.log(data);

        // let tempThreats = {...threats};

        // if (data[threatsSearch.type].rows.length === 0) {
        //   tempThreats.dataContent = [];
        //   tempThreats.totalCount = 0;

        //   this.setState({
        //     threats: tempThreats
        //   });
        //   return null;
        // }

        // tempThreats.dataContent = data[threatsSearch.type].rows;
        // tempThreats.totalCount = data[threatsSearch.type].counts;
        // tempThreats.currentPage = page;
        // tempThreats.dataFields = _.map(threats.dataFieldsArr, val => {
        //   return {
        //     name: val,
        //     label: val === '_menu' ? ' ' : f(`threatsTableFields.${val}`),
        //     options: {
        //       sort: false,
        //       viewColumns: val === '_menu' ? false : true,
        //       customBodyRenderLite: (dataIndex) => {
        //         const allValue = tempThreats.dataContent[dataIndex];
        //         const value = tempThreats.dataContent[dataIndex][val];

        //         if (val === 'threatText' && allValue.score === -999) {
        //           return <span style={{textDecoration: 'line-through'}}>{value}</span>
        //         } else if (val === 'createDttm') {
        //           return <span>{helper.getFormattedDate(value, 'local')}</span>
        //         } else if (val === '_menu') {
        //           if (allValue.score !== -999) {
        //             return (
        //               <div className='table-menu menu active'>
        //                 <i className='fg fg-trashcan' onClick={this.openDeleteThreats.bind(this, allValue)} title={t('txt-delete')}></i>
        //               </div>
        //             )
        //           }
        //         } else {
        //           return value;
        //         }
        //       }
        //     }
        //   };
        // });

        // this.setState({
        //   threats: tempThreats
        // }, () => {
        //   if (this.state.threats.dataContent.length === 0) {
        //     helper.showPopupMsg(t('txt-notFound'));
        //   }
        // });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempVansRecordSearch = {...this.state.vansRecordSearch};
    tempVansRecordSearch[event.target.name] = event.target.value;

    this.setState({
      vansRecordSearch: tempVansRecordSearch
    });
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
  /**
   * Display vans patch record content
   * @method
   * @returns HTML DOM
   */
  displayVansPatchRecordContent = () => {
    const {locale} = this.context;
    const {datetime, vansRecordSearch, vansRecord} = this.state;
    const tableOptions = {
      tableBodyHeight: '57vh',
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
    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <div className='filter'>
        <div className='filter-wrapper'>
          <div className='filter-section'>
            <TextField
              id='threatsSearchKeyword'
              className='search-keyword'
              name='keyword'
              label={t('txt-enterKeyword')}
              variant='outlined'
              fullWidth
              size='small'
              value={vansRecordSearch.keyword}
              onChange={this.handleDataChange} />
          </div>
          <div className='date-picker'>
            <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
              <KeyboardDateTimePicker
                id='searchDateTimePickerFrom'
                className='date-time-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD HH:mm'
                invalidDateMessage={t('txt-invalidDateMessage')}
                maxDateMessage={t('txt-maxDateMessage')}
                minDateMessage={t('txt-minDateMessage')}
                ampm={false}
                value={datetime.from}
                onChange={this.handleDateChange.bind(this, 'from')} />
              <div className='between'>~</div>
              <KeyboardDateTimePicker
                id='searchDateTimePickerTo'
                className='date-time-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD HH:mm'
                invalidDateMessage={t('txt-invalidDateMessage')}
                maxDateMessage={t('txt-maxDateMessage')}
                minDateMessage={t('txt-minDateMessage')}
                ampm={false}
                value={datetime.to}
                onChange={this.handleDateChange.bind(this, 'to')} />
            </MuiPickersUtilsProvider>
          </div>
          <div className='button-group'>
            <Button variant='contained' color='primary' className='btn' onClick={this.handleVansRecordSearch.bind(this, 'search')}>{t('txt-search')}</Button>
          </div>
        </div>

        <MuiTableContent
          data={vansRecord}
          tableOptions={tableOptions}
          tableHeight='auto'
          showLoading={false} />
      </div>
    )
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempVansRecord = {...this.state.vansRecord};
    tempVansRecord.sort.field = field;
    tempVansRecord.sort.desc = sort;

    this.setState({
      vansRecord: tempVansRecord
    }, () => {
      this.handleVansRecordSearch();
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempVansRecord = {...this.state.vansRecord};
    tempVansRecord[type] = Number(value);

    this.setState({
      vansRecord: tempVansRecord
    }, () => {
      this.handleVansRecordSearch(type);
    });
  }
  render() {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.props.toggleVansPatchRecord}
    };

    return (
      <ModalDialog
        id='vansPatchRecordDialog'
        className='modal-dialog'
        title={t('hmd-scan.txt-vansPatchRecord')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displayVansPatchRecordContent()}
      </ModalDialog>
    )
  }
}

VansPatchRecord.contextType = BaseDataContext;

VansPatchRecord.propTypes = {
  toggleVansPatchRecord: PropTypes.func.isRequired
};

export default VansPatchRecord;