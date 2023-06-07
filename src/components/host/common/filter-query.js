import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import MenuItem from '@material-ui/core/MenuItem'
import PopoverMaterial from '@material-ui/core/Popover'
import TextField from '@material-ui/core/TextField'
import TreeItem from '@material-ui/lab/TreeItem'
import TreeView from '@material-ui/lab/TreeView'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'
import SearchFilter from '../search-filter'

let t = null;
let f = null;

/**
 * Host filter query component
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the filter query
 */
class FilterQuery extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      popOverAnchor: null,
      cpe23uriOperator: 'equal', //'equal' or 'like'
      filterName: '',
      filterType: '',
      originalSystemList: [],
      systemList: [],
      filter: {},
      itemFilterList: {}
    };
  }
  componentDidMount() {
    const {originalSystemList, systemList, filterList, filter, itemFilterList} = this.props;

    this.setState({
      filter,
      itemFilterList
    });

    _.forEach(filterList, val => {
      if (val.name === 'system') {
        this.setState({
          originalSystemList,
          systemList
        });
      }
    })
  }
  componentDidUpdate(prevProps) {
    const {filter, itemFilterList} = this.props;

    if (!prevProps || (prevProps && filter !== prevProps.filter)) {
      this.setState({
        filter,
        itemFilterList
      });
    }
  }
  /**
   * Handle filter click
   * @method
   * @param {string} filterName - active filter name
   * @param {string} filterType - active filter type
   * @param {object} event - event object
   */
  handleFilterClick = (filterName, filterType, event) => {
    this.setState({
      popOverAnchor: event.currentTarget,
      filterName,
      filterType
    });
  }
  /**
   * Handle popover close
   * @method
   * @param {string} [options] - option for 'csvImport'
   */
  handlePopoverClose = (options) => {
    this.setState({
      popOverAnchor: null
    }, () => {
      if (options === 'csvImport') {
        this.props.toggleCsvImport();
      }
    });
  }
  /**
   * Determine whether to show department or not
   * @method
   * @param {string} id - department tree ID
   * @returns boolean true/false
   */
  checkDepartmentList = (id) => {
    const {account, limitedDepartment} = this.props;

    if (account.limitedRole) {
      if (limitedDepartment.length === 0) {
        return true;
      }

      if (limitedDepartment.length > 0) {
        if (!_.includes(limitedDepartment, id)) {
          return true;
        }
      }
      return false;
    }
    return false;
  }
  /**
   * Get list of selected checkbox
   * @method
   * @param {bool} checked - checkbox on/off
   * @param {string} type - filterNav type
   * @param {array.<string>} list - list of selected items
   * @param {string} [id] - selected checkbox id
   * @returns array of selected list
   */
  getSelectedItems = (checked, type, list, id) => {
    const {filter} = this.state;

    if (checked) {
      return _.concat(filter[type], ...list, id);
    } else {
      return _.without(filter[type], ...list, id);
    }
  }
  /**
   * Handle department checkbox check/uncheck
   * @method
   * @param {object} tree - department tree data
   * @param {object} event - event object
   */
  toggleDepartmentCheckbox = (tree, event) => {
    const {departmentNameMapping} = this.props;
    const {filter, itemFilterList} = this.state;
    let tempFilter = {...filter};
    let tempItemFilterList = {...itemFilterList};
    let departmentChildList = [];

    _.forEach(tree.children, val => {
      helper.floorPlanRecursive(val, obj => {
        departmentChildList.push(obj.id);
      });
    })

    tempFilter.departmentSelected = this.getSelectedItems(event.target.checked, 'departmentSelected', departmentChildList, tree.id);

    tempItemFilterList.departmentSelected = _.map(tempFilter.departmentSelected, val => {
      return departmentNameMapping[val];
    })

    this.setState({
      filter: tempFilter,
      itemFilterList: tempItemFilterList
    });
  }
  /**
   * Display department tree content
   * @method
   * @param {object} tree - department tree data
   * @returns HTML DOM
   */
  getDepartmentTreeLabel = (tree) => {
    return <span><Checkbox checked={_.includes(this.state.filter.departmentSelected, tree.id)} onChange={this.toggleDepartmentCheckbox.bind(this, tree)} color='primary' />{tree.name}</span>
  }
  /**
   * Display department tree item
   * @method
   * @param {object} val - department tree data
   * @param {number} i - index of the department tree data
   * @returns TreeItem component
   */
  getDepartmentTreeItem = (val, i) => {
    if (this.checkDepartmentList(val.id)) return; // Hide the tree items that are not belong to the user's account

    return (
      <TreeItem
        key={val.id + i}
        nodeId={val.id}
        label={this.getDepartmentTreeLabel(val)}>
        {val.children && val.children.length > 0 &&
          val.children.map(this.getDepartmentTreeItem)
        }
      </TreeItem>
    )
  }
  /**
   * Handle system checkbox check/uncheck
   * @method
   * @param {object} tree - system tree data
   * @param {object} event - event object
   */
  toggleSystemCheckbox = (tree, event) => {
    const {systemList, itemFilterList} = this.state;
    let tempSystemList = _.cloneDeep(systemList);
    let tempItemFilterList = {...itemFilterList};

    if (tree.type === 'server' || tree.type === 'pc' || !tree.type) {
      let systemSelected = [];

      if (tree.children) { //Handle tree header check/uncheck
        const targetIndex = _.findIndex(systemList, {'name':  tree.name});
        tempSystemList[targetIndex].checked = event.target.checked;
        tempSystemList[targetIndex].children = _.map(systemList[targetIndex].children, val => {
          return {
            ...val,
            checked: event.target.checked
          };
        })
      } else { //Handle tree children check/uncheck
        let parentIndex = '';
        let childrenIndex = '';
        let parentChecked = true;

        _.forEach(systemList, (val, i) => {
          _.forEach(val.children, (val2, j) => {
            if (tree.name === val2.name) {
              parentIndex = i;
              childrenIndex = j;
              return false;
            }
          })
        })
        tempSystemList[parentIndex].children[childrenIndex].checked = event.target.checked;

        _.forEach(tempSystemList[parentIndex].children, val => {
          if (!val.checked) {
            parentChecked = false;
            return false;
          }
        })
        tempSystemList[parentIndex].checked = parentChecked;
      }

      const index = tempItemFilterList.system.indexOf(t('host.txt-noSystemDetected'));

      if (index > -1) {
        systemSelected.push(t('host.txt-noSystemDetected'));
      }

      _.forEach(tempSystemList, val => {
        _.forEach(val.children, val2 => {
          if (val2.checked) {
            systemSelected.push(val2.name);
          }
        })
      })

      tempItemFilterList.system = systemSelected;
    }

    if (tree.type === 'noSystem') {
      tempSystemList[2].checked = event.target.checked;

      if (event.target.checked) {
        tempItemFilterList.system.push(t('host.txt-noSystemDetected'));
      } else {
        const index = tempItemFilterList.system.indexOf(t('host.txt-noSystemDetected'));
        tempItemFilterList.system.splice(index, 1);
      }
    }

    this.setState({
      systemList: tempSystemList,
      itemFilterList: tempItemFilterList
    });
  }
  /**
   * Display system tree content
   * @method
   * @param {object} tree - system tree data
   * @returns HTML DOM
   */
  getSystemTreeLabel = (tree) => {
    return (
      <span>
        <Checkbox
          name={tree.name}
          checked={tree.checked}
          onChange={this.toggleSystemCheckbox.bind(this, tree)}
          color='primary' />
          {tree.name}
      </span>
    )
  }
  /**
   * Display system tree item
   * @method
   * @param {object} val - system tree data
   * @param {number} i - index of the system tree data
   * @returns TreeItem component
   */
  getSystemTreeItem = (val, i) => {
    return (
      <TreeItem
        key={val.name}
        nodeId={val.name}
        label={this.getSystemTreeLabel(val)}>
        {val.children && val.children.length > 0 &&
          val.children.map(this.getSystemTreeItem)
        }
      </TreeItem>
    )
  }
  /**
   * Handle combo box change
   * @method
   * @param {string} type - combo box type
   * @param {object} event - event object
   * @param {array.<object>} value - selected input value
   */
  handleComboBoxChange = (type, event, value) => {
    let tempFilter = {...this.state.filter};
    tempFilter[type] = value;

    this.setState({
      filter: tempFilter
    });
  }
  /**
   * Set search filter data
   * @method
   * @param {string} type - filter type
   * @param {array.<string>} data - filter data
   */
  setSerchFilter = (type, data) => {
    const {filter, itemFilterList} = this.state;
    let tempFilter = {...filter};
    let tempItemFilterList = {...itemFilterList};
    let dataList = [];
    tempFilter[type] = data;

    _.forEach(data, val => {
      let value = val.input;

      if (value) {
        if (val.condition) {
          value = val.condition + ' ' + value;
        }

        dataList.push(value);
      }
    })

    tempItemFilterList[type] = dataList;

    this.setState({
      filter: tempFilter,
      itemFilterList: tempItemFilterList
    });
  }
  /**
   * Handle Safety Scan operator change
   * @method
   * @param {object} event - event object
   */
  handleScanOperatorChange = (event) => {
    this.setState({
      cpe23uriOperator: event.target.value
    });
  }
  /**
   * Show filter popover content
   * @method
   * @returns HTML DOM
   */
  showFilterPopover = () => {
    const {page, departmentList} = this.props;
    const {cpe23uriOperator, filterName, filterType, systemList, filter} = this.state;

    if (filterType === 'tree') {
      if (filterName === 'departmentSelected') {
        return (
          <React.Fragment>
            {departmentList.length === 0 &&
              <div className='not-found'>{t('txt-notFound')}</div>
            }
            {departmentList.length > 0 &&
              <TreeView
                className='tree-view'
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}>
                {departmentList &&
                  departmentList.map(this.getDepartmentTreeItem)
                }
              </TreeView>
            }
          </React.Fragment>
        )
      } else if (filterName === 'system') {
        return (
          <React.Fragment>
            {systemList.length === 0 &&
              <div className='not-found'>{t('txt-notFound')}</div>
            }
            {systemList.length > 0 &&
              <TreeView
                className='tree-view'
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}>
                {systemList &&
                  systemList.map(this.getSystemTreeItem)
                }
              </TreeView>
            }
          </React.Fragment>
        )
      }
    } else if (filterName === 'cpe23uri') {
      const defaultItemValue = {
        input: ''
      };
      const data = {
        pageType: page,
        activeFilter: filterName,
        searchType: 'input'
      };

      return (
        <React.Fragment>
          <MultiInput
            base={SearchFilter}
            defaultItemValue={defaultItemValue}
            value={filter[filterName]}
            props={data}
            onChange={this.setSerchFilter.bind(this, filterName)} />
          <div className='safety-scan-filter'>
            <TextField
              className='scan-operator'
              select
              variant='outlined'
              fullWidth
              size='small'
              value={cpe23uriOperator}
              onChange={this.handleScanOperatorChange}>
              <MenuItem value='equal'>Equal</MenuItem>
              <MenuItem value='like'>Like</MenuItem>
            </TextField>
            <Button id='hostOpenUploadDialog' variant='contained' color='primary' className='filter' onClick={this.handlePopoverClose.bind(this, 'csvImport')}>{t('network-inventory.txt-batchUpload')}</Button>
          </div>
        </React.Fragment>
      )
    } else if (filterType === 'multi_input') {
      const defaultItemValue = {
        condition: '=',
        input: ''
      };
      const data = {
        pageType: page,
        activeFilter: filterName,
        searchType: 'condition_input'
      };

      return (
        <MultiInput
          base={SearchFilter}
          defaultItemValue={defaultItemValue}
          value={filter[filterName]}
          props={data}
          onChange={this.setSerchFilter.bind(this, filterName)} />
      )
    }
  }
  /**
   * Show filter display
   * @method
   * @param {object} val - filter data
   * @param {number} i - index of the filter data
   * @returns HTML DOM
   */
  showFilterDisplay = (val, i) => {
    const {page, severityType, vendorType} = this.props;
    const {filter, itemFilterList} = this.state;
    const filterName = val.name;
    const displayType = val.displayType;
    const filterType = val.filterType;
    let label = '';
    let selectOptions = '';

    if (page === 'vulnerabilities') {
      label = f('hostDashboardFields.' + filterName);
      selectOptions = severityType;
    } else if (page === 'inventory') {
      label = f('hostCpeFields.' + filterName);
      selectOptions = vendorType;
    } else if (page === 'kbid') {
      label = f('hostKbidFields.' + filterName);
    }

    if (displayType === 'text_field') {
      const value = itemFilterList[filterName] ? itemFilterList[filterName].join(', ') : '';

      return (
        <div key={i} className='group'>
          <TextField
            name={filterName}
            label={label}
            variant='outlined'
            fullWidth
            size='small'
            value={value}
            onClick={this.handleFilterClick.bind(this, filterName, filterType)}
            InputProps={{
              readOnly: true
            }} />
        </div>
      )
    } else if (displayType === 'auto_complete') {
      if (!filter[filterName]) return;

      return (
        <div key={i} className='group'>
          <Autocomplete
            className='combo-box'
            multiple
            value={filter[filterName]}
            options={selectOptions}
            getOptionLabel={(option) => option.text}
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
                {option.text}
              </React.Fragment>
            )}
            renderInput={(params) => (
              <TextField {...params} label={label} variant='outlined' size='small' />
            )}
            getOptionSelected={(option, value) => (
              option.value === value.value
            )}
            onChange={this.handleComboBoxChange.bind(this, filterName)} />
        </div>
      )
    }
  }
  /**
   * Display filter query content
   * @method
   * @returns HTML DOM
   */
  displayFilterQuery = () => {
    const {filterList} = this.props;
    const {popOverAnchor} = this.state;

    return (
      <div className='filter-section'>
        <PopoverMaterial
          id='dashboardFilterPopover'
          open={Boolean(popOverAnchor)}
          anchorEl={popOverAnchor}
          onClose={this.handlePopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}>
          <div className='content'>
            {this.showFilterPopover()}
          </div>
        </PopoverMaterial>
        {filterList.map(this.showFilterDisplay)}
        <Button id='hostClearFilter' variant='outlined' color='primary' className='clear-filter' onClick={this.clearFilter}>{t('txt-clear')}</Button>
      </div>
    )
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    const {originalSystemList, filterList, originalFilter, originalItemFilterList} = this.props;

    this.setState({
      cpe23uriOperator: 'equal',
      filter: _.cloneDeep(originalFilter),
      itemFilterList: _.cloneDeep(originalItemFilterList)
    });

    _.forEach(filterList, val => {
      if (val.name === 'system') {
        this.setState({
          systemList: _.cloneDeep(originalSystemList)
        });
      }
    })
  }
  /**
   * Handle query dialog toggle
   * @method
   * @param {string} type - dialog type ('confirm' or 'cancel')
   */
  handleFilterToggle = (type) => {
    const {filterList} = this.props;
    const {cpe23uriOperator, systemList, filter, itemFilterList} = this.state;
    let filterData = {
      filter,
      itemFilterList,
    };

    _.forEach(filterList, val => {
      if (val.name === 'system') {
        filterData.systemList = systemList;
      } else if (val.name === 'cpe23uri') {
        filterData.cpe23uriOperator = cpe23uriOperator;
      }
    })

    this.props.toggleFilterQuery(type, filterData);
  }
  render() {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.handleFilterToggle.bind(this, 'cancel')},
      confirm: {text: t('txt-confirm'), handler: this.handleFilterToggle.bind(this, 'confirm')}
    };

    return (
      <ModalDialog
        id='showFilterQueryDialog'
        className='modal-dialog'
        title={t('txt-filterQuery')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayFilterQuery()}
      </ModalDialog>
    )
  }
}

FilterQuery.contextType = BaseDataContext;

FilterQuery.propTypes = {
  page: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired,
  departmentList: PropTypes.array.isRequired,
  departmentNameMapping: PropTypes.object.isRequired,
  limitedDepartment: PropTypes.array.isRequired,
  originalSystemList: PropTypes.array,
  systemList: PropTypes.array,
  severityType: PropTypes.array,
  vendorType: PropTypes.array,
  filterList: PropTypes.array.isRequired,
  originalFilter: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  originalItemFilterList: PropTypes.object.isRequired,
  itemFilterList: PropTypes.object.isRequired,
  toggleFilterQuery: PropTypes.func.isRequired,
  toggleCsvImport: PropTypes.func
};

export default FilterQuery;