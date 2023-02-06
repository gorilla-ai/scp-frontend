import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import moment from 'moment'
import cx from 'classnames'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};
const AUDIT_SEARCH = {
  name: '',
  cvss: '',
  severity: [],
  software: ''
};

const MOCK_DATA = [
  {
    id: 1,
    name: 'CVE-2020-29123',
    severity: 'Alert',
    cvss: '6.5',
    software: 'Microsoft Windows Server 2012',
    daysOpen: '15',
    devicesCount: '250'
  },
  {
    id: 2,
    name: 'CVE-2020-29125',
    severity: 'Emergency',
    cvss: '6.5',
    software: 'Linux 2012',
    daysOpen: '20',
    devicesCount: '150'
  },
  {
    id: 3,
    name: 'CVE-2020-30513',
    severity: 'Warning',
    cvss: '8.5',
    software: 'Microsoft Windows 2012',
    daysOpen: '5',
    devicesCount: '200'
  }
];

let t = null;
let f = null;

/**
 * Host Dashboard
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Host Dashboard page
 */
class HostDashboard extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      showFilter: false,
      datetime: {
        from: helper.getSubstractDate(1, 'month'),
        to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
      },
      auditSearch: _.cloneDeep(AUDIT_SEARCH),
      audit: {
        dataFieldsArr: ['name', 'severity', 'cvss', 'software', 'daysOpen', 'devicesCount'],
        dataFields: [],
        dataContent: null,
        sort: {
          field: 'createDttm',
          desc: true
        },
        totalCount: 0,
        currentPage: 0,
        pageSize: 20
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'common', locale);
    helper.inactivityTime(baseUrl, locale);

    this.getAuditData();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get and set ES table data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getAuditData = (fromPage) => {
    const {baseUrl} = this.context;
    const {datetime, auditSearch, audit} = this.state;
    const page = fromPage === 'currentPage' ? audit.currentPage : 0;
    const url = `${baseUrl}/api/auditLog/system?page=${page + 1}&pageSize=${audit.pageSize}`;
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    let requestData = {
      startDttm: dateTime.from,
      endDttm: dateTime.to
    };

    if (auditSearch.keyword) {
      requestData.keyword = auditSearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempAudit = {...audit};

        if (!data.rows || data.rows.length === 0) {
          tempAudit.dataContent = [];
          tempAudit.totalCount = 0;

          this.setState({
            audit: tempAudit
          });
          return null;
        }

        tempAudit.totalCount = data.counts;
        tempAudit.currentPage = page;
        tempAudit.dataContent = MOCK_DATA;
        tempAudit.dataFields = _.map(audit.dataFieldsArr, val => {
          return {
            name: val,
            label: f('hostDashboardFields.' + val),
            options: {
              filter: true,
              sort: false,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempAudit.dataContent[dataIndex];
                const value = tempAudit.dataContent[dataIndex][val];

                if (val === 'severity') {
                  return <span className='severity-level' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>;
                } else {
                  return value;
                }
              }
            }
          };
        });

        this.setState({
          audit: tempAudit
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
    let tempAudit = {...this.state.audit};
    tempAudit.sort.field = field;
    tempAudit.sort.desc = sort;

    this.setState({
      audit: tempAudit
    }, () => {
      this.getAuditData();
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempAudit = {...this.state.audit};
    tempAudit[type] = value;

    this.setState({
      audit: tempAudit
    }, () => {
      this.getAuditData(type);
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
  handleAuditSearch = (event) => {
    let tempAuditSearch = {...this.state.auditSearch};
    tempAuditSearch[event.target.name] = event.target.value;

    this.setState({
      auditSearch: tempAuditSearch
    });
  }
  /**
   * Handle search submit
   * @method
   */
  handleSearchSubmit = () => {
    let tempAudit = {...this.state.audit};
    tempAudit.dataContent = [];
    tempAudit.totalCount = 0;
    tempAudit.currentPage = 1;

    this.setState({
      audit: tempAudit
    }, () => {
      this.getAuditData();
    });
  }
  /**
   * Handle combo box change
   * @method
   * @param {object} event - event object
   * @param {array.<object>} value - selected input value
   */
  handleComboBoxChange = (event, value) => {
    let tempAuditSearch = {...this.state.auditSearch};
    tempAuditSearch.severity = value;

    this.setState({
      auditSearch: tempAuditSearch
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, auditSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <TextField
              id='auditSearchName'
              name='name'
              label={f('hostDashboardFields.name')}
              variant='outlined'
              fullWidth
              size='small'
              value={auditSearch.name}
              onChange={this.handleAuditSearch} />
          </div>
          <div className='group'>
            <TextField
              id='auditSearchCVSS'
              name='cvss'
              label={f('hostDashboardFields.cvss')}
              variant='outlined'
              fullWidth
              size='small'
              value={auditSearch.cvss}
              onChange={this.handleAuditSearch} />
          </div>
          <div className='group'>
            <TextField
              id='auditSearchSoftware'
              name='software'
              label={f('hostDashboardFields.software')}
              variant='outlined'
              fullWidth
              size='small'
              value={auditSearch.software}
              onChange={this.handleAuditSearch} />
          </div>
          <div className='group' style={{width: '300px'}}>
            <Autocomplete
              className='combo-box checkboxes-tags'
              multiple
              value={auditSearch.severity}
              options={_.map(SEVERITY_TYPE, (val) => { return { value: val } })}
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
                <TextField {...params} label={f('hostDashboardFields.severity')} variant='outlined' size='small' />
              )}
              getOptionSelected={(option, value) => (
                option.value === value.value
              )}
              onChange={this.handleComboBoxChange} />
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
      auditSearch: _.cloneDeep(AUDIT_SEARCH)
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {showFilter, datetime, audit} = this.state;
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
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button variant='outlined' color='primary'><Link to='/SCP/host'>{t('host.txt-hostList')}</Link></Button>
            <Button variant='contained' color='primary' className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></Button>
          </div>
        </div>

        <div className='data-content'>
          <div className='parent-content'>
            {this.renderFilter()}

            <div className='main-content'>
              <header className='main-header'>{t('host.dashboard.txt-vulnerabilityList')}</header>

              <div className='content-header-btns with-menu'>
              </div>

              <MuiTableContent
                data={audit}
                tableOptions={tableOptions} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

HostDashboard.contextType = BaseDataContext;

HostDashboard.propTypes = {
};

export default HostDashboard;