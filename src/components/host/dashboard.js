import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
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

const SEVERITY_TYPE = ['HIGH', 'MEDIUM', 'LOW'];
const ALERT_LEVEL_COLORS = {
  HIGH: '#CC2943',
  MEDIUM: '#CC7B29',
  LOW: '#7ACC29'
};
const CVE_SEARCH = {
  cveId: '',
  cvss: '',
  relatedSoftware: '',
  severity: []
};

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
      cveSearch: _.cloneDeep(CVE_SEARCH),
      cveData: {
        dataFieldsArr: ['cveId', 'severity', 'cvss', 'relatedSoftware', 'daysOpen', 'exposedDevices'],
        dataFields: [],
        dataContent: null,
        sort: {
          field: 'severity',
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

    this.getCveData();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get and set ES table data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getCveData = (fromPage) => {
    const {baseUrl} = this.context;
    const {cveSearch, cveData} = this.state;
    const sort = cveData.sort.desc ? 'desc' : 'asc';
    const page = fromPage === 'currentPage' ? cveData.currentPage : 0;
    const url = `${baseUrl}/api/hmd/cveUpdateToDate/_search?page=${page + 1}&pageSize=${cveData.pageSize}&orders=${cveData.sort.field} ${sort}`;
    let requestData = {};

    if (cveSearch.keyword) {
      requestData.keyword = cveSearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempCveData = {...cveData};

        if (!data.rows || data.rows.length === 0) {
          tempCveData.dataContent = [];
          tempCveData.totalCount = 0;

          this.setState({
            cveData: tempCveData
          });
          return null;
        }       

        tempCveData.dataContent = data.rows;
        tempCveData.totalCount = data.count;
        tempCveData.currentPage = page;
        tempCveData.dataFields = _.map(cveData.dataFieldsArr, val => {
          return {
            name: val,
            label: f('hostDashboardFields.' + val),
            options: {
              filter: true,
              sort: true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempCveData.dataContent[dataIndex];
                const value = tempCveData.dataContent[dataIndex][val];

                if (val === 'severity' && value) {
                  return <span className='severity-level' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>
                } else {
                  return value;
                }
              }
            }
          };
        });

        this.setState({
          cveData: tempCveData
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
    let tempCveData = {...this.state.cveData};
    let tableField = field;

    if (field === 'cveId') {
      tableField = 'cve_id';
    }

    tempCveData.sort.field = tableField;
    tempCveData.sort.desc = sort;

    this.setState({
      cveData: tempCveData
    }, () => {
      this.getCveData();
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempCveData = {...this.state.cveData};
    tempCveData[type] = value;

    this.setState({
      cveData: tempCveData
    }, () => {
      this.getCveData(type);
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
  handleCveSearch = (event) => {
    let tempCveSearch = {...this.state.cveSearch};
    tempCveSearch[event.target.name] = event.target.value;

    this.setState({
      cveSearch: tempCveSearch
    });
  }
  /**
   * Handle search submit
   * @method
   */
  handleSearchSubmit = () => {
    let tempCveData = {...this.state.cveData};
    tempCveData.dataContent = [];
    tempCveData.totalCount = 0;
    tempCveData.currentPage = 1;

    this.setState({
      cveData: tempCveData
    }, () => {
      this.getCveData();
    });
  }
  /**
   * Handle combo box change
   * @method
   * @param {object} event - event object
   * @param {array.<object>} value - selected input value
   */
  handleComboBoxChange = (event, value) => {
    let tempCveSearch = {...this.state.cveSearch};
    tempCveSearch.severity = value;

    this.setState({
      cveSearch: tempCveSearch
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, cveSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <TextField
              id='cveSearchId'
              name='cveId'
              label={f('hostDashboardFields.cveId')}
              variant='outlined'
              fullWidth
              size='small'
              value={cveSearch.cveId}
              onChange={this.handleCveSearch} />
          </div>
          <div className='group'>
            <TextField
              id='cveSearchCVSS'
              name='cvss'
              label={f('hostDashboardFields.cvss')}
              variant='outlined'
              fullWidth
              size='small'
              value={cveSearch.cvss}
              onChange={this.handleCveSearch} />
          </div>
          <div className='group'>
            <TextField
              id='cveSearchSoftware'
              name='relatedSoftware'
              label={f('hostDashboardFields.relatedSoftware')}
              variant='outlined'
              fullWidth
              size='small'
              value={cveSearch.relatedSoftware}
              onChange={this.handleCveSearch} />
          </div>
          <div className='group' style={{width: '300px'}}>
            <Autocomplete
              className='combo-box checkboxes-tags'
              multiple
              value={cveSearch.severity}
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
      cveSearch: _.cloneDeep(CVE_SEARCH)
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {showFilter, cveData} = this.state;
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
            <Button variant='contained' color='primary' className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')} disabled><i className='fg fg-filter'></i></Button>
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
                data={cveData}
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