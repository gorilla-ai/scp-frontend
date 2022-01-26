import React, { Component, useRef } from 'react'
import { withRouter } from 'react-router'
import _ from 'lodash'
import cx from 'classnames'

import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Switch from '@material-ui/core/Switch'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'
import SoarFlow from './soar-flow'
import SoarSettings from './soar-settings'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NEW_SOAR_RULE = ['new', 'internalInventory', 'windowsLoginFail', 'fortigateLog'];

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
      activeContent: 'table', //'table', 'settings', or 'flow'
      showFilter: false,
      flowActionType: '', //'add' or 'edit'
      ipExist: true,
      soarColumns: {},
      filterList: {
        adapter: [],
        action: []
      },
      soarSearch: {
        flowName: '',
        aggField: '',
        adapter: 'all',
        action: 'all',
        isEnable: 'all'
      },
      contextAnchor: null,
      soarTemplate: {
        internalInventory: {},
        windowsLoginFail: {},
        fortigateLog: {}
      },
      soarData: {
        dataFieldsArr: ['flowName', 'aggField', 'adapter', 'condition', 'action', 'status', 'isEnable', '_menu'],
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
      },
      soarIndividualData: {},
      currentSoarData: {}
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.inactivityTime(baseUrl, locale);

    this.getSoarColumn();
    this.getSoarTemplateData();
    this.validateIpExist();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get and set columns data and filter list
   * @method
   */
  getSoarColumn = () => {
    const {baseUrl} = this.context;
    const {filterList, soarSearch} = this.state;
    let tempFilterList = {...filterList};

    this.ah.one({
      url: `${baseUrl}/api/soar/columns`,
      type: 'GET'
    })
    .then(data => {
      if (data && data.ret === 0) {
        data = data.rt;

        const isEnable = [
          {
            text: 'true',
            value: true
          },
          {
            text: 'false',
            value: false
          }
        ];

        tempFilterList.adapter = _.map(data.adapter, (val, i) => {
          return <MenuItem key={i} value={val}>{val}</MenuItem>
        });

        tempFilterList.action = _.map(data.action, (val, i) => {
          return <MenuItem key={i} value={val}>{val}</MenuItem>
        });

        tempFilterList.isEnable = _.map(isEnable, (val, i) => {
          return <MenuItem key={i} value={val.value}>{val.text}</MenuItem>
        });

        this.setState({
          filterList: tempFilterList,
          soarColumns: data
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Check if IP exist
   * @method
   */
  validateIpExist = () => {
    const {baseUrl} = this.context;
    const {soarIP} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/soar/ipExist`,
      type: 'GET'
    })
    .then(data => {
      if (data && data.ret === 0) {
        data = data.rt;

        this.setState({
          ipExist: data.ipExists
        }, () => {
          this.getSoarData();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set SOAR data
   * @method
   * @param {string} [options] - option for 'currentPage' or 'toggle'
   * @param {string} [flowId] - flow ID
   */
  getSoarData = (options, flowId) => {
    const {baseUrl} = this.context;
    const {ipExist, soarSearch, soarData} = this.state;
    const page = options === 'currentPage' ? soarData.currentPage : 0;
    const url = `${baseUrl}/api/soar/flowList?page=${page + 1}&pageSize=${soarData.pageSize}`;
    let requestData = {};

    if (soarSearch.flowName) {
      requestData.flowName = soarSearch.flowName;
    }

    if (soarSearch.aggField) {
      requestData.aggField = soarSearch.aggField;
    }

    if (soarSearch.isEnable !== 'all') {
      requestData.isEnable = soarSearch.isEnable;
    }

    if (soarSearch.adapter && soarSearch.adapter !== 'all') {
      requestData.adapter = soarSearch.adapter;
    }

    if (soarSearch.action && soarSearch.action !== 'all') {
      requestData.action = soarSearch.action;
    }

    let apiArr = [{
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }];

    //Combine the two APIs to show the loading icon
    if (options === 'toggle') {
      apiArr.unshift({
        url: `${baseUrl}/api/soar/enableFlow?flowId=${flowId}`,
        data: JSON.stringify({}),
        type: 'POST',
        contentType: 'text/plain'
      });
    }

    this.ah.series(apiArr)
    .then(data => {
      if (data && data.length > 0) {
        if (options === 'toggle') {
          data = data[1].rt;
        } else {
          data = data[0].rt;
        }

        let tempSoarData = {...soarData};

        if (!data.rules || data.rules.length === 0) {
          tempSoarData.dataContent = [];
          tempSoarData.totalCount = 0;

          this.setState({
            soarData: tempSoarData
          });
          return null;
        }

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

                if (val === 'adapter') {
                  return <span className='item'>{value}</span>;
                } else if (val === 'condition') {
                  return (
                    <div className='long-field'>
                      {allValue.node.map(this.getListItem.bind(this, val))}
                    </div>
                  )
                } else if (val === 'action') {
                  return (
                    <div className='long-field'>
                      {value.map(this.getListItem.bind(this, val))}
                    </div>
                  )
                } else if (val === 'isEnable') {
                  return (
                    <FormControlLabel
                      className='switch-control'
                      control={
                        <Switch
                          checked={allValue.isEnable}
                          onChange={this.openSwitchConfirmModal.bind(this, allValue)}
                          color='primary' />
                      }
                      label={t('txt-switch')}
                      disabled={!ipExist} />
                  )
                } else if (val === '_menu') {
                  return (
                    <div className={cx('table-menu menu', {'active': ipExist})}>
                      <i className='fg fg-edit' title={t('txt-edit')} onClick={this.getSoarIndividualData.bind(this, allValue.flowId, allValue.isEnable)} disabled={!ipExist}></i>
                      <i className='fg fg-trashcan' onClick={this.openDeleteMenu.bind(this, allValue)} title={t('txt-delete')} disabled={!ipExist}></i>
                    </div>
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
   * Get SOAR template data
   * @method
   */
  getSoarTemplateData = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/soar/templates`,
      type: 'GET'
    })
    .then(data => {
      if (data && data.ret === 0) {
        data = data.rt;

        this.setState({
          soarTemplate: {
            internalInventory: data.internalInventory,
            windowsLoginFail: data.windowsLoginFail,
            fortigateLog: data.fortigateLog
          }
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle open menu
   * @method
   * @param {object} event - event object
   */
  handleOpenMenu = (event) => {
    this.setState({
      contextAnchor: event.currentTarget
    });
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null
    });
  }
  /**
   * Get add SOAR menu
   * @method
   * @param {string} val - individual Soar name
   * @param {number} i - index of the Soar name
   */
  getAddSoarMenu = (val, i) => {
    return <MenuItem key={i} onClick={this.handleAddSoarMenu.bind(this, val)}>{t('soar.txt-' + val)}</MenuItem>
  }
  /**
   * Handle add Soar menu
   * @method
   * @param {styring} type - soar menu type
   */
  handleAddSoarMenu = (type) => {
    if (type === 'new') {
      this.getSoarIndividualData();
      this.handleCloseMenu();
      return;
    } else {
      this.setState({
        flowActionType: 'edit',
        soarIndividualData: this.state.soarTemplate[type]
      }, () => {
        this.toggleContent('flow');
      });

      this.handleCloseMenu();
    }
  }
  /**
   * Get and set soar data
   * @method
   * @param {string} [flowId] - flow ID
   * @param {string} [isEnable] - enable or not
   */
  getSoarIndividualData = (flowId, isEnable) => {
    const {baseUrl} = this.context;

    if (typeof flowId !== 'string') {
      this.setState({
        flowActionType: 'add',
        soarIndividualData: {}
      }, () => {
        this.toggleContent('flow');
      });
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/soar/flow?flowId=${flowId}`,
      type: 'GET'
    })
    .then(data => {
      if (data && data.ret === 0) {
        data = data.rt;

        const soarIndividualData = {
          ...data,
          isEnable
        };

        this.setState({
          flowActionType: 'edit',
          soarIndividualData
        }, () => {
          this.toggleContent('flow');
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Show the switch confirm modal dialog
   * @method
   * @param {string} allValue - flow rule data
   * @param {object} event - event object
   */
  openSwitchConfirmModal = (allValue, event) => {
    const type = event.target.checked ? 'on' : 'off';

    if (type === 'on') {
      this.getSoarData('toggle', allValue.flowId);
    } else if (type === 'off') {
      PopupDialog.prompt({
        title: t('txt-close'),
        id: 'modalWindowSmall',
        confirmText: t('txt-ok'),
        cancelText: t('txt-cancel'),
        display: (
          <div className='content delete'>
            <span>{t('soar.txt-disableRule')}: {allValue.flowName}?</span>
          </div>
        ),
        act: (confirmed) => {
          if (confirmed) {
            this.getSoarData('toggle', allValue.flowId);
          }
        }
      });
    }
  }
  /**
   * Display list value
   * @method
   * @param {object} type - data type ('condition' or 'action')
   * @param {object} val - individual rule data
   * @param {number} i - index of the rule data
   * @returns HTML DOM
   */
  getListItem = (type, val, i) => {
    const value = type === 'condition' ? val.name : val;

    if (i < 10) {
      return <span key={i} className='item'>{value}</span>
    } else {
      return <span>...</span>
    }
  }
  /**
   * Display delete SOAR content
   * @method
   * @param {object} allValue - SOAR data
   * @returns HTML DOM
   */
  getDeleteSoarContent = (allValue) => {
    this.setState({
      currentSoarData: allValue
    });

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {allValue.flowName}?</span>
      </div>
    )
  }
  /**
   * Show Delete SOAR rule dialog
   * @method
   * @param {object} allValue - SOAR data
   */
  openDeleteMenu = (allValue) => {
    PopupDialog.prompt({
      title: t('soar.txt-deleteRule'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteSoarContent(allValue),
      act: (confirmed, data) => {
        if (confirmed) {
          this.deleteSoar();
        }
      }
    });
  }
  /**
   * Handle delete SOAR confirm
   * @method
   */
  deleteSoar = () => {
    const {baseUrl} = this.context;
    const {currentSoarData} = this.state;

    if (!currentSoarData.flowId) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/soar/flow?flowId=${currentSoarData.flowId}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data && data.ret === 0) {
        this.getSoarData();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
   * Toggle page content
   * @method
   * @param {string} type - content type ('table', 'settings' or 'flow')
   * @param {string} [options] - option for refresh table
   */
  toggleContent = (type, options) => {
    this.setState({
      activeContent: type
    });

    if (options === 'refresh') {
      let tempSoarData = {...this.state.soarData};
      tempSoarData.dataFields = [];
      tempSoarData.dataContent = null;
      tempSoarData.totalCount = 0;
      tempSoarData.currentPage = 1;

      this.setState({
        soarData: tempSoarData
      }, () => {
        this.getSoarColumn();
        this.validateIpExist();
      });
    }
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, filterList, soarSearch} = this.state;

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
              {filterList.adapter}
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
              {filterList.action}
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
              {filterList.isEnable}
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
        flowName: '',
        aggField: '',
        adapter: 'all',
        action: 'all',
        isEnable: 'all'
      }
    });
  }
  render() {
    const {
      activeTab,
      activeContent,
      showFilter,
      flowActionType,
      ipExist,
      soarColumns,
      contextAnchor,
      soarData,
      soarIndividualData
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
        {activeContent === 'table' &&
          <React.Fragment>
            <div className='sub-header'>
              <div className='secondary-btn-group right'>
                <Button variant='contained' color='primary' className={cx({'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></Button>
              </div>
            </div>

            <Menu
              anchorEl={contextAnchor}
              keepMounted
              open={Boolean(contextAnchor)}
              onClose={this.handleCloseMenu}>
              {NEW_SOAR_RULE.map(this.getAddSoarMenu)}
            </Menu>

            <div className='data-content soar-index'>
              <div className='parent-content'>
                {this.renderFilter()}
                <div className='main-content'>
                  <header className='main-header'>{t('soar.txt-ruleList')}</header>
                  <div className='content-header-btns with-menu'>
                    <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'settings')}>{t('txt-settings')}</Button>
                    <Button variant='outlined' color='primary' className='standard btn' onClick={this.handleOpenMenu} disabled={!ipExist}>{t('soar.txt-addRule')}</Button>
                  </div>

                  <MuiTableContent
                    data={soarData}
                    tableOptions={tableOptions} />
                </div>
              </div>
            </div>
          </React.Fragment>
        }

        {activeContent === 'settings' &&
          <SoarSettings
            toggleContent={this.toggleContent} />
        }

        {activeContent === 'flow' &&
          <SoarFlow
            flowActionType={flowActionType}
            soarColumns={soarColumns}
            soarIndividualData={soarIndividualData}
            toggleContent={this.toggleContent} />
        }
      </div>
    )
  }
}

SoarController.contextType = BaseDataContext;

SoarController.propTypes = {
};

export default SoarController;