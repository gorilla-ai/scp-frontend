import React, { Component, useRef } from 'react'
import { withRouter } from 'react-router'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Popover from '@material-ui/core/Popover'
import Switch from '@material-ui/core/Switch'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

/**
 * SOAR
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the SOAR page
 */
class SoarController extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      activeTab: 'rule',
      showFilter: false,
      soarSearch: {
        flowName: '',
        aggField: '',
        adapter: '',
        action: '',
        status: '',
        isEnable: ''
      },
      soarData: {
        dataFieldsArr: ['flowName', 'aggField', 'adapter', 'action', 'status', 'isEnable', '_menu'],
        dataFields: [],
        dataContent: null,
        sort: {
          field: '_eventDttm_',
          desc: true
        },
        totalCount: 0,
        currentPage: 1,
        oldPage: 1,
        pageSize: 20
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getSoarData();
  }
  ryan = () => {

  }
  /**
   * Get and set SOAR data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getSoarData = (fromPage) => {
    const {baseUrl} = this.context;
    const {soarData} = this.state;
    const page = fromPage === 'currentPage' ? soarData.currentPage : 0;
    const url = `${baseUrl}/api/soar/flowList?page=${page + 1}&pageSize=${soarData.pageSize}`;
    const requestData = {
      flowName: '',
      aggField: '',
      status: '',
      isEnable: '',
      adapter: '',
      action: ''
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempSoarData = {...soarData};
        let statusOn = false;
        tempSoarData.dataContent = data.rules;
        tempSoarData.totalCount = data.count;
        tempSoarData.currentPage = page;

        tempSoarData.dataFields = _.map(soarData.dataFieldsArr, val => {
          return {
            name: val,
            label: val === '_menu' ? ' ' : f(`soarFields.${val}`),
            options: {
              filter: true,
              sort: false,
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex, options) => {
                const allValue = tempSoarData.dataContent[dataIndex];
                let value = tempSoarData.dataContent[dataIndex][val];

                if (val === 'action') {
                  return value.toString(', ');
                } else if (val === '_menu') {
                  return (
                    <div className='table-menu menu active'>
                      <i className='fg fg-edit' title={t('txt-edit')}></i>
                      <i className='fg fg-trashcan' title={t('txt-delete')}></i>
                    </div>
                  )
                } else if (val === 'isEnable') {
                  return (
                    <FormControlLabel
                      className='switch-control'
                      control={
                        <Switch
                          checked={statusOn}
                          onChange={this.handleSoarStatusChange}
                          color='primary' />
                      }
                      label={t('txt-switch')} />
                  )
                } else {
                  return value;
                }
              }
            }
          };
        });

        this.setState({
          soarData: tempSoarData
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle Soar status toggle
   * @method
   * @param {string} type - status action type ('start' or 'stop')
   */
  handleSoarStatusChange = (type) => {

  }
  /**
   * Handle content tab change
   * @method
   * @param {object} event - event object
   * @param {string} newTab - content type ('rule')
   */
  handleSubTabChange = (event, newTab) => {
    this.setState({
      activeTab: newTab
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
  handleSoarSearch = (event) => {
    let tempSoarSearch = {...this.state.soarSearch};
    tempSoarSearch[event.target.name] = event.target.value;

    this.setState({
      soarSearch: tempSoarSearch
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, soarSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <TextField
              id='soarName'
              name='flowName'
              label={f('soarFields.flowName')}
              variant='outlined'
              fullWidth
              size='small'
              value={soarSearch.flowName}
              onChange={this.handleSoarSearch} />
          </div>
          <div className='group'>
            <TextField
              id='soarAggField'
              name='aggField'
              label={f('soarFields.aggField')}
              variant='outlined'
              fullWidth
              size='small'
              value={soarSearch.aggField}
              onChange={this.handleSoarSearch} />
          </div>
          <div className='group'>
            <TextField
              id='soarAdapter'
              name='adapter'
              select
              label={f('soarFields.adapter')}
              variant='outlined'
              fullWidth
              size='small'
              value={soarSearch.adapter}
              onChange={this.handleSoarSearch}>
              <MenuItem value={'all'}>{t('txt-all')}</MenuItem>
            </TextField>
          </div>
          <div className='group'>
            <TextField
              id='soarAction'
              name='action'
              select
              label={f('soarFields.action')}
              variant='outlined'
              fullWidth
              size='small'
              value={soarSearch.action}
              onChange={this.handleSoarSearch}>
              <MenuItem value={'all'}>{t('txt-all')}</MenuItem>
            </TextField>
          </div>
          <div className='group'>
            <TextField
              id='soarStatus'
              name='status'
              select
              label={f('soarFields.status')}
              variant='outlined'
              fullWidth
              size='small'
              value={soarSearch.status}
              onChange={this.handleSoarSearch}>
              <MenuItem value={'all'}>{t('txt-all')}</MenuItem>
            </TextField>
          </div>
          <div className='group'>
            <TextField
              id='soarIsEnable'
              name='isEnable'
              select
              label={f('soarFields.isEnable')}
              variant='outlined'
              fullWidth
              size='small'
              value={soarSearch.isEnable}
              onChange={this.handleSoarSearch}>
              <MenuItem value={'all'}>{t('txt-all')}</MenuItem>
            </TextField>
          </div>
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.getSoarData}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempSoarData = {...this.state.soarData};
    tempSoarData[type] = Number(value);

    this.setState({
      soarData: tempSoarData
    }, () => {
      this.getSoarData(type);
    });
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempSoarData = {...this.state.soarData};
    tempSoarData.sort.field = field;
    tempSoarData.sort.desc = sort;

    this.setState({
      soarData: tempSoarData
    }, () => {
      this.getSoarData();
    });
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      soarSearch: {
        name: '',
        aggField: '',
        adapter: '',
        action: '',
        status: '',
        isEnable: ''
      }
    });
  }
  render() {
    const {
      activeTab,
      showFilter,
      soarData
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
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button variant='contained' color='primary' className={cx({'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></Button>
          </div>
        </div>

        <div className='data-content'>
          <div className='parent-content'>
            {this.renderFilter()}
            <div className='main-content'>
              <Tabs
                indicatorColor='primary'
                textColor='primary'
                value={activeTab}
                onChange={this.handleSubTabChange}>
                <Tab label={t('soar.txt-ruleList')} value='rule' />
              </Tabs>

              {soarData.dataContent &&
                <MuiTableContent
                  data={soarData}
                  tableOptions={tableOptions} />
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SoarController.contextType = BaseDataContext;

SoarController.propTypes = {
};

export default SoarController;