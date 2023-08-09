import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment'

import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'
import MuiTableContent from '../../common/mui-table-content'

let t = null;
let f = null;

/**
 * Host table list component
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the table list
 */
class TableList extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      datePickerOpen: false,
      datetime: {}
    };
  }
  componentDidMount() {
  }
  /**
   * Toggle date picker dialog
   * @method
   * @param {string} type - action type ('confirm' or 'cancel')
   */
  toggleDatePickerDialog = (type) => {
    const {datePickerOpen, datetime} = this.state;

    if (datePickerOpen && type === 'confirm') {
      if (moment(datetime.from).isAfter(datetime.to)) {
        helper.showPopupMsg(t('txt-timeRangeError'), t('txt-error'));
        return;
      }

      this.props.exportList('nccst', datetime);
    }

    this.setState({
      datePickerOpen: !datePickerOpen,
      datetime: {
        from: helper.getFormattedDate(helper.getSubstractDate(1, 'day')),
        to: helper.getFormattedDate(helper.getSubstractDate(1, 'day'))
      }
    });

    this.props.handleCloseMenu();
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
   * Display date picker
   * @method
   * @returns HTML DOM
   */
  displayDatePicker = () => {
    const {locale} = this.context;
    const {datetime} = this.state;
    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
        <KeyboardDatePicker
          id='hostDatePickerFrom'
          className='date-picker'
          inputVariant='outlined'
          variant='inline'
          format='YYYY-MM-DD'
          minDate={helper.getSubstractDate(6, 'month')}
          maxDate={helper.getSubstractDate(1, 'day')}
          invalidDateMessage={t('txt-invalidDateMessage')}
          maxDateMessage={t('txt-maxDateMessage')}
          minDateMessage={t('txt-minDateMessage')}
          value={datetime.from}
          onChange={this.handleDateChange.bind(this, 'from')} />
        <div className='between'>~</div>
        <KeyboardDatePicker
          id='hostDatePickerTo'
          className='date-picker'
          inputVariant='outlined'
          variant='inline'
          format='YYYY-MM-DD'
          minDate={helper.getSubstractDate(6, 'month')}
          maxDate={helper.getSubstractDate(1, 'day')}
          invalidDateMessage={t('txt-invalidDateMessage')}
          maxDateMessage={t('txt-maxDateMessage')}
          minDateMessage={t('txt-minDateMessage')}
          value={datetime.to}
          onChange={this.handleDateChange.bind(this, 'to')} />
      </MuiPickersUtilsProvider>
    )
  }
  /**
   * Show date picker dialog
   * @method
   * @returns ModalDialog component
   */
  showDatePickerDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleDatePickerDialog.bind(this, 'cancel')},
      confirm: {text: t('txt-confirm'), handler: this.toggleDatePickerDialog.bind(this, 'confirm')}
    };

    return (
      <ModalDialog
        id='showDatePickerDialog'
        className='modal-dialog'
        title={t('host.vulnerabilities.txt-cveStatisticsExport')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayDatePicker()}
      </ModalDialog>
    )
  }
  render() {
    const {
      page,
      searchType,
      search,
      data,
      options,
      tableAnchor,
      exportAnchor,
      cveSeverityLevel,
      monthlySeverityTrend
    } = this.props;
    const {datePickerOpen} = this.state;
    let headerTitle = '';
    let searchLabel = '';

    if (page === 'vulnerabilities') {
      headerTitle = t('host.vulnerabilities.txt-vulnerabilityList');
      searchLabel = t('host.vulnerabilities.txt-cveName');
    } else if (page === 'inventory') {
      headerTitle = t('host.inventory.txt-orgSoftwareList');
      searchLabel = t('host.inventory.txt-applicationName');
    } else if (page === 'kbid') {
      headerTitle = t('host.txt-kbid');
      searchLabel = t('host.txt-kbidName');
    } else if (page === 'endpoints') {
      searchLabel = t('host.txt-ipOrHostName');
    }

    return (
      <div>
        {datePickerOpen &&
          this.showDatePickerDialog()
        }

        <Menu
          anchorEl={tableAnchor}
          keepMounted
          open={Boolean(tableAnchor)}
          onClose={this.props.handleCloseMenu}>
          {page === 'endpoints' &&
            <MenuItem onClick={this.props.toggleShowMemo}>{t('txt-memo')}</MenuItem>
          }
          <MenuItem onClick={this.props.getActiveData.bind(this, 'open')}>{t('txt-view')}</MenuItem>
        </Menu>

        <div className='main-content'>
          <header className='main-header'>{headerTitle}</header>
          <div className='content-header-btns with-menu'>
            {page === 'vulnerabilities' &&
              <Menu
                anchorEl={exportAnchor}
                keepMounted
                open={Boolean(exportAnchor)}
                onClose={this.props.handleCloseMenu}>
                <MenuItem onClick={this.props.exportList.bind(this, 'cve')}>{t('host.vulnerabilities.txt-cveList')}</MenuItem>
                <MenuItem onClick={this.toggleDatePickerDialog}>{t('host.vulnerabilities.txt-cveStatistics')}</MenuItem>
              </Menu>
            }
            {page === 'inventory' &&
              <Menu
                anchorEl={exportAnchor}
                keepMounted
                open={Boolean(exportAnchor)}
                onClose={this.props.handleCloseMenu}>
                <MenuItem onClick={this.props.exportList.bind(this, 'cpe')}>{t('host.inventory.txt-inventoryList')}</MenuItem>
                <MenuItem onClick={this.props.exportList.bind(this, 'nccst')}>NCCST</MenuItem>
              </Menu>
            }
            {page === 'kbid' &&
              <Menu
                anchorEl={exportAnchor}
                keepMounted
                open={Boolean(exportAnchor)}
                onClose={this.props.handleCloseMenu}>
                <MenuItem onClick={this.props.exportList.bind(this, 'kbid')}>{t('host.kbid.txt-kbidList')}</MenuItem>
                <MenuItem onClick={this.props.exportList.bind(this, 'nccst')}>{t('host.kbid.txt-vulnerabilityList')}</MenuItem>
              </Menu>
            }
            <Button id='hostFilterQuery' variant='outlined' color='primary' className='standard btn' onClick={this.props.toggleFilterQuery.bind(this, 'open')} data-cy='hostFilterQueryBtn'>{t('txt-filterQuery')}</Button>
            {page === 'vulnerabilities' &&
              <React.Fragment>
                <Button id='hostExportMenu' variant='outlined' color='primary' className='standard btn' onClick={this.props.handleExportMenu} data-cy='hostExportBtn'>{t('txt-export')}</Button>
              </React.Fragment>
            }
            {page === 'inventory' &&
              <React.Fragment>
                <Button id='hostExportMenu' variant='outlined' color='primary' className='standard btn' onClick={this.props.handleExportMenu} data-cy='hostExportBtn'>{t('txt-export')}</Button>
                <Button id='hostToggleReport' variant='outlined' color='primary' className='standard btn' onClick={this.props.toggleReport} data-cy='hostReportBtn'>{t('host.txt-report-vans')}</Button>
              </React.Fragment>
            }
            {page === 'kbid' &&
              <React.Fragment>
                <Button id='hostExportList' variant='outlined' color='primary' className='standard btn' onClick={this.props.handleExportMenu} data-cy='hostExportBtn'>{t('txt-export')}</Button>
                <Button id='hostToggleReport' variant='outlined' color='primary' className='standard btn' onClick={this.props.toggleReport} data-cy='hostReportBtn'>{t('host.txt-report-kbid')}</Button>
              </React.Fragment>
            }
          </div>

          <div className='actions-bar'>
            <div className='search-field'>
              <div className='group'>
                <TextField
                  name='search'
                  className='search-text'
                  label={searchLabel}
                  variant='outlined'
                  size='small'
                  value={search.keyword}
                  onChange={this.props.handleSearch}
                  data-cy='hostSearchTextField' />
              </div>
              <Button id='hostSearchData' variant='contained' color='primary' className='search-btn' onClick={this.props.getData} data-cy='hostSearchSubmitBtn'>{t('txt-search')}</Button>
              <Button id='hostClearData' variant='outlined' color='primary' className='standard btn clear' onClick={this.props.handleReset.bind(this, searchType)} data-cy='hostSearchClearBtn'>{t('txt-clear')}</Button>
            </div>

            <div className='search-count'>{t('host.inventory.txt-softwareCount') + ': ' + helper.numberWithCommas(search.count)}</div>
          </div>

          <MuiTableContent
            data={data}
            tableOptions={options} />
        </div>
      </div>
    )
  }
}

TableList.contextType = BaseDataContext;

TableList.propTypes = {
  page: PropTypes.string.isRequired,
  searchType: PropTypes.string.isRequired,
  search: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  tableAnchor: PropTypes.string.isRequired,
  exportAnchor: PropTypes.string,
  getData: PropTypes.func.isRequired,
  getActiveData: PropTypes.func.isRequired,
  toggleShowMemo: PropTypes.func,
  exportList: PropTypes.func.isRequired,
  toggleFilterQuery: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  handleCloseMenu: PropTypes.func.isRequired,
  toggleReport: PropTypes.func
};

export default TableList;