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
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import Divider from '@material-ui/core/Divider'
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'
import MuiTableContent from '../../common/mui-table-content'
import NestedMenuItem from '../../common/nested-menu-item'

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
      moreAnchor,
      filterAnchor,
      filterDataCount
    } = this.props;
    const {datePickerOpen} = this.state;
    const {sessionRights} = this.context;
    let adminPrivilege = false;

    if (sessionRights.Module_Config) {
      adminPrivilege = true;
    }

    let headerTitle = '';
    let searchLabel = '';

    if (page === 'gcb') {
      headerTitle = t('host.gcb.txt-gcbList');
      searchLabel = t('host.gcb.txt-originalKey');
    } else if (page === 'malware') {
      headerTitle = t('host.malware.txt-malwareList');
      searchLabel = t('host.malware.txt-fileMD5');
    } else if (page === 'vulnerabilities') {
      headerTitle = t('host.vulnerabilities.txt-vulnerabilityList');
      searchLabel = t('host.vulnerabilities.txt-cveName');
    } else if (page === 'inventory') {
      headerTitle = t('host.inventory.txt-orgSoftwareList');
      searchLabel = t('host.inventory.txt-applicationName');
    } else if (page === 'kbid') {
      headerTitle = t('host.txt-kbid');
      searchLabel = t('host.txt-kbidName');
    } else if (page === 'endpoints') {
      headerTitle = t('host.txt-endpoint');
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
          <MenuItem onClick={this.props.getActiveData.bind(this, 'open')}>{t('txt-view')}</MenuItem>
          {page === 'malware' &&
            <MenuItem onClick={this.props.handleAddWhitelist.bind(this)}>{t('txt-addWhiteList')}</MenuItem>
          }
          {page === 'endpoints' &&
            <MenuItem onClick={this.props.toggleShowMemo}>{t('txt-memo')}</MenuItem>
          }
        </Menu>

        <div className='main-content'>
          <header className='main-header'>{headerTitle}</header>
          <div className='content-header-btns with-menu'>
            {page === 'gcb' &&
              <Menu
                anchorEl={exportAnchor}
                keepMounted
                open={Boolean(exportAnchor)}
                onClose={this.props.handleCloseMenu}>
                <MenuItem onClick={this.props.exportList.bind(this, 'gcbUpdateToDate')}>{t('host.gcb.txt-gcbList')}</MenuItem>
              </Menu>
            }
            {page === 'malware' &&
              <Menu
                anchorEl={exportAnchor}
                keepMounted
                open={Boolean(exportAnchor)}
                onClose={this.props.handleCloseMenu}>
                <MenuItem onClick={this.props.exportList.bind(this, 'malwareUpdateToDate')}>{t('host.malware.txt-malwareList')}</MenuItem>
                <MenuItem onClick={this.props.exportList.bind(this, 'malware/devices')}>{t('host.malware.txt-hostList')}</MenuItem>
              </Menu>
            }
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
                <MenuItem onClick={this.props.exportList.bind(this, 'nccst')}>{t('host.kbid.txt-nccstList')}</MenuItem>
              </Menu>
            }
            {page === 'endpoints' && moreAnchor &&
              <Menu
                anchorEl={moreAnchor}
                keepMounted
                open={Boolean(moreAnchor)}
                onClose={this.props.handleCloseMenu}>
                <NestedMenuItem
                  ref={ref => {this.menuItemRef = ref}}
                  innerRef={this.menuItemRef}
                  label={t('host.endpoints.txt-endpointDetection')}
                  parentMenuOpen={Boolean(moreAnchor)}
                >
                  <MenuItem onClick={this.props.executeMoreAction.bind(this, 'start', {name: t('host.endpoints.txt-malwareDetection'), cmds: 'scanFile'})}>{t('host.endpoints.txt-malwareDetection')}</MenuItem>
                  <Divider />
                  <MenuItem onClick={this.props.executeMoreAction.bind(this, 'start', {name: t('host.endpoints.txt-cveDetection'), cmds: 'getVans'})}>{t('host.endpoints.txt-cveDetection')}</MenuItem>
                  <MenuItem onClick={this.props.executeMoreAction.bind(this, 'start', {name: t('host.endpoints.txt-kbidDetection'), cmds: 'getKbidList'})}>{t('host.endpoints.txt-kbidDetection')}</MenuItem>
                  <MenuItem onClick={this.props.executeMoreAction.bind(this, 'start', {name: t('host.endpoints.txt-gcbDetection'), cmds: 'gcbDetection'})}>{t('host.endpoints.txt-gcbDetection')}</MenuItem>
                  <MenuItem onClick={this.props.executeMoreAction.bind(this, 'start', {name: t('host.endpoints.txt-updateGpo'), cmds: 'syncGcbTemplates'})}>{t('host.endpoints.txt-updateGpo')}</MenuItem>
                  <Divider />
                  <MenuItem onClick={this.props.executeMoreAction.bind(this, 'stop', {name: t('host.endpoints.txt-procMonitorDisable'), cmds: 'setProcessWhiteList', stop: 'ProcessMonitorThread'})}>{t('host.endpoints.txt-procMonitorDisable')}</MenuItem>
                  <MenuItem onClick={this.props.executeMoreAction.bind(this, 'stop', {name: t('host.endpoints.txt-fileIntegrityMonitorDisable'), cmds: 'getFileIntegrity', stop: 'FileIntegrityThread'})}>{t('host.endpoints.txt-fileIntegrityMonitorDisable')}</MenuItem>
                </NestedMenuItem>
                <NestedMenuItem
                  ref={ref => {this.menuItemRef = ref}}
                  innerRef={this.menuItemRef}
                  label={t('host.endpoints.txt-hmd')}
                  parentMenuOpen={Boolean(moreAnchor)}
                >
                  <MenuItem onClick={this.props.executeMoreAction.bind(this, 'start', {name: t('host.endpoints.txt-upgradeHmd'), type: 'hmdUpgrade'})}>{t('host.endpoints.txt-upgradeHmd')}</MenuItem>
                  <MenuItem onClick={this.props.toggleHmdUploadFile.bind(this)}>{t('host.endpoints.txt-uploadHmdPrograms')}</MenuItem>
                  { adminPrivilege &&
                  <React.Fragment>
                    <Divider />
                    <MenuItem><Link to={{pathname: '/SCP/host', state: {activeContent: 'hmdSettings'}}}>{t('host.endpoints.txt-settings')}</Link></MenuItem>
                  </React.Fragment>
                  }
                </NestedMenuItem>
              </Menu>
            }
            <ButtonGroup className='standard btn' variant="outlined" color="primary" ref={ref => {this.menuItemRef = ref}} aria-label="split button">
              <Button id='hostFilterQuery' className='standard' onClick={this.props.onFilterQueryClick.bind(this, 'open')} data-cy='hostFilterQueryBtn'>{t('txt-filterQuery')}&nbsp;<span>({filterDataCount})</span></Button>
              <Button
                size="small"
                className='standard'
                aria-controls={Boolean(filterAnchor) ? 'split-button-menu' : undefined}
                aria-expanded={Boolean(filterAnchor) ? 'true' : undefined}
                aria-label="select merge strategy"
                aria-haspopup="menu"
                onClick={this.props.handleFilterMenu}
              >
                <ArrowDropDownIcon />
              </Button>
              <Menu
                anchorEl={filterAnchor}
                keepMounted
                open={Boolean(filterAnchor)}
                onClose={this.props.handleCloseMenu}>
                <MenuItem onClick={this.props.onFilterQueryClick.bind(this, 'load')}>{t('txt-openQuery')}</MenuItem>
                <MenuItem onClick={this.props.onFilterQueryClick.bind(this, 'save')}>{t('txt-saveQuery')}</MenuItem>
              </Menu>
            </ButtonGroup>
            {page === 'gcb' &&
              <React.Fragment>
                <Button id='hostExportMenu' variant='outlined' color='primary' className='standard btn' onClick={this.props.handleExportMenu} data-cy='hostExportBtn'>{t('txt-export')}</Button>
              </React.Fragment>
            }
            {page === 'malware' &&
              <React.Fragment>
                <Button id='hostExportMenu' variant='outlined' color='primary' className='standard btn' onClick={this.props.handleExportMenu} data-cy='hostExportBtn'>{t('txt-export')}</Button>
              </React.Fragment>
            }
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
                <Button id='hostExportMenu' variant='outlined' color='primary' className='standard btn' onClick={this.props.handleExportMenu} data-cy='hostExportBtn'>{t('txt-export')}</Button>
                <Button id='hostToggleReport' variant='outlined' color='primary' className='standard btn' onClick={this.props.toggleReport} data-cy='hostReportBtn'>{t('host.txt-report-kbid')}</Button>
              </React.Fragment>
            }
            {page === 'endpoints' &&
              <React.Fragment>
                <Button id='hostExportList' variant='outlined' color='primary' className='standard btn' onClick={this.props.exportList} data-cy='hostExportBtn'>{t('txt-export')}</Button>
                <Button id='hostMoreMenu' variant='outlined' color='primary' className='standard btn' startIcon={<MoreHorizIcon/>} onClick={this.props.handleMoreMenu} data-cy='hostMoreBtn'>{t('txt-more')}</Button>
              </React.Fragment>
            }
            
          </div>

          <div className='actions-bar'>
            <div className='search-field'>
              <div className='group'>
                <TextField
                  name='keyword'
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

            <div className='search-count'>{t('txt-searchCount') + ': ' + helper.numberWithCommas(search.count)}</div>
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
  tableAnchor: PropTypes.object,
  exportAnchor: PropTypes.object,
  moreAnchor: PropTypes.object,
  getData: PropTypes.func.isRequired,
  getActiveData: PropTypes.func.isRequired,
  handleAddWhitelist: PropTypes.func,
  toggleShowMemo: PropTypes.func,
  executeMoreAction: PropTypes.func,
  exportList: PropTypes.func.isRequired,
  onFilterQueryClick: PropTypes.func.isRequired,
  filterDataCount: PropTypes.number.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  handleCloseMenu: PropTypes.func.isRequired,
  toggleReport: PropTypes.func
};

export default TableList;