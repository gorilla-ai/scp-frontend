import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment'
import cx from 'classnames'

import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardDateTimePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

import {downloadWithForm} from 'react-ui/build/src/utils/download'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

/**
 * Vans Patch Group
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show Vans Patch Group component
 */
class VansPatchGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vansRecordSearch: {
        keyword: ''
      },
      datetime: {
        from: '',
        to: ''
      },
      vansRecord: {
        dataFieldsArr: ['description', 'software', 'taskCreateDttm', 'taskUpdateDttm', 'deviceCount', 'taskStatus', '_menu'],
        dataFields: [],
        dataContent: null
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.setInitialDatetime();
    this.getVansPatchTable();
  }
  componentDidUpdate(prevProps) {
    if (!prevProps || (this.props.vansPatchGroup !== prevProps.vansPatchGroup)) {
      this.getVansPatchTable();
    }
  }
  componentWillUnmount() {
    this.props.getVansPatchGroup(); //Refresh vansPatchGroup value
  }
  /**
   * Set initial datetime
   * @method
   */
  setInitialDatetime = () => {
    const {vansDateTime} = this.props;
    const datetime = {
      from: vansDateTime.from,
      to: vansDateTime.to
    };

    this.setState({
      datetime
    });
  }
  /**
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable field
   */
  checkSortable = (field) => {
    const unSortableFields = ['description', 'software', 'deviceCount', '_menu'];

    if (_.includes(unSortableFields, field)) {
      return false;
    } else {
      return true;
    }
  }
  /**
   * Construct Vans Patch table
   * @method
   */
  getVansPatchTable = () => {
    const {vansPatchGroup} = this.props;
    const {vansRecord} = this.state;
    let tempVansRecord = {...vansRecord};

    tempVansRecord.dataContent = vansPatchGroup;
    tempVansRecord.dataFields = _.map(vansRecord.dataFieldsArr, val => {
      return {
        name: val,
        label: val === '_menu' ? ' ' : f(`vansPatchFields.${val}`),
        options: {
          sort: this.checkSortable(val),
          viewColumns: true,
          customBodyRenderLite: (dataIndex) => {
            const allValue = tempVansRecord.dataContent[dataIndex];
            const value = tempVansRecord.dataContent[dataIndex][val];
            const vansInfo = allValue['vansPatchDescriptionDTO'];

            if (val === 'description' && vansInfo) {
              return (
                <div>
                  {vansInfo.actionModel &&
                    <div><span className='cell-header'>{f('vansPatchFields.actionModel')}</span>: {t('hmd-scan.txt-patch-' + vansInfo.actionModel)}</div>
                  }
                  {vansInfo.scriptFileName &&
                    <div><span className='cell-header'>{f('vansPatchFields.scriptFileName')}</span>: {vansInfo.scriptFileName}</div>
                  }
                  {vansInfo.executableFileName &&
                    <div><span className='cell-header'>{f('vansPatchFields.executableFileName')}</span>: {vansInfo.executableFileName}</div>
                  }
                  {vansInfo.memo &&
                    <div><span className='cell-header'>{f('vansPatchFields.memo')}</span>: {vansInfo.memo}</div>
                  }
                </div>
              )
            } else if (val === 'software' && vansInfo) {
              return (
                <div>
                  {vansInfo.patchProduct &&
                    <div><span className='cell-header'>{f('vansPatchFields.patchProduct')}</span>: {vansInfo.patchProduct}</div>
                  }
                  {vansInfo.patchVendor &&
                    <div><span className='cell-header'>{f('vansPatchFields.patchVendor')}</span>: {vansInfo.patchVendor}</div>
                  }
                  {vansInfo.patchVersion &&
                    <div><span className='cell-header'>{f('vansPatchFields.patchVersion')}</span>: {vansInfo.patchVersion}</div>
                  }
                </div>
              )
            } else if (val === 'taskCreateDttm' || val === 'taskUpdateDttm') {
              return <span>{helper.getFormattedDate(value, 'local')}</span>
            } else if (val === 'deviceCount') {
              return (
                <div>
                  <div><span className='cell-header'>{f('vansPatchFields.deviceCount')}</span>: {allValue.deviceCount}</div>
                  <div><span className='cell-header'>{t('txt-success')}</span>: {allValue.deviceSuccessCount}</div>
                  <div><span className='cell-header'>{t('txt-fail')}</span>: {allValue.deviceFailCount}</div>
                  <div><span className='cell-header'>{t('hmd-scan.txt-notSupport')}</span>: {allValue.deviceNotSupportCount}</div>
                </div>
              )
            } else if (val === 'taskStatus') {
              let backgroundColor = '';

              if (value === 'Running') {
                backgroundColor = '#ff9802';
              } else if (value === 'Complete') {
                backgroundColor = '#22ac38';
              } else if (value === 'Failure') {
                backgroundColor = '#d10d25';
              } else if (value === 'NotSupport') {
                backgroundColor = '#d10d25';
              }

              return <span className='status-item' style={{color: '#fff', backgroundColor}}>{t('hmd-scan.txt-task' + value)}</span>
            } else if (val === '_menu') {
              return (
                <div className='table-menu menu active'>
                  <i className='fg fg-eye' onClick={this.props.getVansPatchDetails.bind(this, allValue)} title={t('txt-view')}></i>
                </div>
              )
            }
          }
        }
      };
    });

    this.setState({
      vansRecord: tempVansRecord
    });
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
   * Handle PDF export
   * @method
   */
  exportPdf = () => {
    const {baseUrl, contextRoot} = this.context;
    const {vansRecordSearch, datetime} = this.state;
    const url = `${baseUrl}${contextRoot}/api/ipdevice/assessment/_search/_vansPatch/_pdf`;
    const requestData = {
      keyword: vansRecordSearch.keyword,
      startDttm: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      endDttm: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
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
      serverSide: false,
      viewColumns: false,
      pagination: false,
      tableBodyHeight: '57vh',
      draggableColumns: {
        enabled: false
      }
    };
    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <div className='filter'>
        {vansRecord.dataContent && vansRecord.dataContent.length > 0 &&
          <div className='export-btn group'>
            <Button variant='contained' color='primary' className='btn' onClick={this.exportPdf}>{t('txt-exportPDF')}</Button>
          </div>
        }
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
          <div className='date-picker-section'>
            <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
              <KeyboardDatePicker
                id='searchDatePickerFrom'
                className='date-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD'
                invalidDateMessage={t('txt-invalidDateMessage')}
                maxDateMessage={t('txt-maxDateMessage')}
                minDateMessage={t('txt-minDateMessage')}
                value={datetime.from}
                onChange={this.handleDateChange.bind(this, 'from')} />
              <div className='between'>~</div>
              <KeyboardDatePicker
                id='searchDatePickerTo'
                className='date-picker'
                inputVariant='outlined'
                variant='inline'
                format='YYYY-MM-DD'
                invalidDateMessage={t('txt-invalidDateMessage')}
                maxDateMessage={t('txt-maxDateMessage')}
                minDateMessage={t('txt-minDateMessage')}
                value={datetime.to}
                onChange={this.handleDateChange.bind(this, 'to')} />
            </MuiPickersUtilsProvider>
          </div>
          <div className='button-group'>
            <Button variant='contained' color='primary' className='btn' onClick={this.props.getVansPatchGroup.bind(this, vansRecordSearch.keyword, datetime.from, datetime.to)}>{t('txt-search')}</Button>
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
  render() {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.props.toggleVansPatchGroup}
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

VansPatchGroup.contextType = BaseDataContext;

VansPatchGroup.propTypes = {
  vansPatchGroup: PropTypes.array.isRequired,
  vansDateTime: PropTypes.object.isRequired,
  toggleVansPatchGroup: PropTypes.func.isRequired,
  getVansPatchGroup: PropTypes.func.isRequired,
  getVansPatchDetails: PropTypes.func.isRequired
};

export default VansPatchGroup;