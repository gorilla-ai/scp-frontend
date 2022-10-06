import React, {Component} from 'react'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import cx from 'classnames'

import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const FILTER_LIST = ['part', 'vendor', 'product', 'version', 'update', 'edition', 'language', 'swEdition', 'targetSw', 'other', 'cpe23uri', 'productCpename', 'isMatched'];

let t = null;
let f = null;

/**
 * Host CPE page
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the CPE page
 */
class Cpe extends Component {
  constructor(props) {
    super(props);

    this.state = {
    	showFilter: false,
      account: {
        id: '',
        login: false,
        fields: [],
        logsLocale: ''
      },
      originalFilterData: {},
      filterData: {},
      contextAnchor: null,
      currentCpeData: {},
      cpeData: {
        dataFieldsArr: ['_menu', 'id', 'part', 'vendor', 'product', 'version', 'update', 'edition', 'language', 'swEdition', 'targetSw', 'targetHw', 'other', 'cpe23uri', 'productCpename', 'isMatched'],
        dataFields: [],
        dataContent: null,
        sort: {
          field: 'vendor',
          desc: true
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, session, sessionRights} = this.context;
    let tempAccount = {...this.state.account};

    helper.getPrivilegesInfo(sessionRights, 'common', locale);
    helper.inactivityTime(baseUrl, locale);

    if (session.accountId) {
      tempAccount.id = session.accountId;
      tempAccount.login = true;

      this.setState({
        account: tempAccount
      }, () => {
      	this.getFilterData();
        this.loadCpe();
      });
    }
  }
  ryan = () => {}
  /**
   * Construct filter data
   * @method
   */
  getFilterData = () => {
  	let filterData = {};

  	_.forEach(FILTER_LIST, val => {
  		if (val === 'isMatched') {
  			filterData[val] = 'all';
  		} else {
  			filterData[val] = '';
  		}
  	})

  	this.setState({
  		originalFilterData: _.cloneDeep(filterData),
  		filterData
  	});
  }
  /**
   * Load CPE data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  loadCpe = (fromPage) => {
    const {baseUrl} = this.context;
    const {filterData, cpeData} = this.state;
    const page = fromPage === 'currentPage' ? cpeData.currentPage : 0;
    const url = `${baseUrl}/api/hmd/cpe/_search?page=${page + 1}&pageSize=${cpeData.pageSize}`;
    let requestData = {
    	...filterData
    };

    if (filterData.isMatched === 'all') {
    	requestData.isMatched = '';
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempCpeData = {...cpeData};

        if (!data.rows || data.rows.length === 0) {
          tempCpeData.dataContent = [];
          tempCpeData.totalCount = 0;

          this.setState({
            cpeData: tempCpeData
          });
          return null;
        }

        tempCpeData.dataContent = data.rows;
        tempCpeData.totalCount = data.counts;
        tempCpeData.currentPage = page;
        tempCpeData.dataFields = _.map(cpeData.dataFieldsArr, val => {
          return {
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : f('hostCpeFields.' + val),
            options: {
              filter: true,
              sort: false,
              viewColumns: val === '_menu' ? false : true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempCpeData.dataContent[dataIndex];
                const value = tempCpeData.dataContent[dataIndex][val];

                if (val === '_menu') {
                  return (
                    <div className='table-menu active'>
                      <Button variant='outlined' color='primary' onClick={this.handleOpenMenu.bind(this, allValue)}><i className='fg fg-more'></i></Button>
                    </div>
                  )
                } else if (val === 'isMatched') {
                	return <span>{value.toString()}</span>
                } else {
                  return <span>{value}</span>
                }
              }
            }
          };
        });

        this.setState({
          cpeData: tempCpeData
        });
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
   * Handle filter click
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    let tempFilterData = {...this.state.filterData};
    tempFilterData[event.target.name] = event.target.value;  

    this.setState({
      filterData: tempFilterData
    });
  }
  /**
   * Display filter form
   * @method
   * @param {string} val - filter data
   * @param {number} i - index of the filter data
   * @returns HTML DOM
   */
  showFilterForm = (val, i) => {
    const {filterData} = this.state;

    if (val === 'isMatched') {
      return (
      	<div key={i} className='group'>
	        <TextField
	          name='isMatched'
	          label={f('hostCpeFields.' + val)}
	          select
	          variant='outlined'
	          fullWidth
	          size='small'
	          value={filterData.isMatched}
	          onChange={this.handleDataChange}>
	          <MenuItem value='all'>{t('txt-all')}</MenuItem>
	          <MenuItem value={true}>True</MenuItem>
	          <MenuItem value={false}>False</MenuItem>
	        </TextField>
        </div>
      )
    } else {
      return (
	      <div key={i} className='group'>
	        <TextField
	          name={val}
	          label={f('hostCpeFields.' + val)}
	          variant='outlined'
	          fullWidth
	          size='small'
	          value={filterData[val]}
	          onChange={this.handleDataChange} />
	      </div>
	    )
    }
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <div className='filter-section config host'>
          {FILTER_LIST.map(this.showFilterForm)}
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.loadCpe}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /**
   * Clear filter data
   * @method
   */
  clearFilter = () => {
    this.setState({
    	filterData: _.cloneDeep(this.state.originalFilterData)
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempCpeData = {...this.state.cpeData};
    tempCpeData[type] = Number(value);

    if (type === 'pageSize') {
      tempCpeData.currentPage = 0;
    }

    this.setState({
      cpeData: tempCpeData
    }, () => {
      this.loadCpe(type);
    });
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempCpeData = {...this.state.cpeData};
    tempCpeData.sort.field = field;
    tempCpeData.sort.desc = sort;

    this.setState({
      cpeData: tempCpeData
    }, () => {
      this.loadCpe();
    });
  }
  /**
   * Display content message
   * @method
   * @param {string} type - action type ('delete')
   * @param {string} id - selected account ID
   * @returns HTML DOM
   */
  getCpeMsgContent = (type, id) => {
    const msg = t('txt-delete-msg') + ': ' + id;

    return (
      <div className='content delete'>
        <span>{msg}?</span>
      </div>
    )
  }
  /**
   * Display modal dialog
   * @method
   * @param {string} type - action type ('delete')
   * @param {string} id - selected CPE ID
   */
  showDialog = (type, id) => {
    PopupDialog.prompt({
      title: t('txt-delete'),
      id: 'modalWindowSmall',
      confirmText: t('txt-ok'),
      cancelText: t('txt-cancel'),
      display: this.getCpeMsgContent(type, id),
      act: (confirmed) => {
        if (confirmed) {
          this.cpeAction(type);
        }
      }
    });

    this.handleCloseMenu();
  }
  /**
   * Handle modal confirm
   * @method
   * @param {string} type - action type ('delete')
   */
  cpeAction = (type) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/hmd/cpe?id=${this.state.currentCpeData.id}`;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url,
      type: 'DELETE'
    })
    .then(() => {
      this.loadCpe();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', c('txt-error'), err.message);
    })
  }
  /**
   * Handle open menu
   * @method
   * @param {object} cpe - active CPE data
   * @param {object} event - event object
   */
  handleOpenMenu = (cpe, event) => {
    this.setState({
      contextAnchor: event.currentTarget,
      currentCpeData: cpe
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
  render() {
  	const {showFilter, contextAnchor, currentCpeData, cpeData} = this.state;
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
        <Menu
          anchorEl={contextAnchor}
          keepMounted
          open={Boolean(contextAnchor)}
          onClose={this.handleCloseMenu}>
          <MenuItem id='cpeMenuEdit'>{t('txt-edit')}</MenuItem>
          <MenuItem id='cpeMenuDelete' onClick={this.showDialog.bind(this, 'delete', currentCpeData.id)}>{t('txt-delete')}</MenuItem>
        </Menu>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button variant='outlined' color='primary'><Link to='/SCP/host'>{t('host.txt-hostList')}</Link></Button>
            <Button variant='outlined' color='primary' className={cx({'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></Button>
          </div>
        </div>
        <div className='data-content'>
          <div className='parent-content'>
            {this.renderFilter()}

            <div className='main-content'>
              <header className='main-header'>{t('host.txt-cpePage')}</header>
              <MuiTableContent
                data={cpeData}
                tableOptions={tableOptions} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Cpe.contextType = BaseDataContext;

Cpe.propTypes = {
};

export default withRouter(Cpe);