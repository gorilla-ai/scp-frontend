import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import ContextMenu from 'react-ui/build/src/components/contextmenu'
import DataTable from 'react-ui/build/src/components/table'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import Textarea from 'react-ui/build/src/components/textarea'

import {BaseDataContext} from '../../common/context';
import helper from '../../common/helper'
import TableContent from '../../common/table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

class Endpoint extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showFilter: false,
      addTaskOpen: false,
      viewTaskOpen: false,
      search: {
        hostName: '',
        ip: '',
        mac: ''
      },
      hmd: {
        dataFieldsArr: ['_menu', 'ipDeviceUUID', 'hostName', 'ip', 'mac', 'createDttm', 'runningTaskCount', 'waitingTaskCount', 'completeTaskCount'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'ipDeviceUUID',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        removePhoto: false,
        add: {}
      },
      task: {
        hostId: '',
        taskName: '',
        reqType: 'msg',
        reqCommand: '',
        reqParameters: '',
        fileCompressPassward: '',
        fileUrl: '',
        fileAccount: ''
      },
      taskTable: {
        dataFieldsArr: ['taskId', 'hostId', 'taskName', 'reqType', 'fileCompressPassward', 'fileUrl', 'fileAccount', 'filePassward', 'reqCommand', 'reqParameters', 'rspStatus', 'rspOutput', 'executeStartDttm', 'executeEndDttm', 'taskStatus', 'taskCreateDttm', 'taskUpdateDttm', 'taskHandleDttm', 'taskResponseDttm', 'taskComment'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'taskId',
          desc: false
        },
        totalCount: 0
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
   this.getHostData();
  }
  getTaskCount = (taskType, value, allValue) => {
    if (value === 0) {
      return value;
    } else {
      return <a className='bold' onClick={this.getTaskInfo.bind(this, taskType, allValue)}>{value}</a>
    }
  }
  getHostData = (fromSearch) => {
    const {baseUrl} = this.context;
    const {search, hmd} = this.state;
    let url = `${baseUrl}/api/hmd/host`;

    if (!_.isEmpty(search)) {
      url += '?';
    }

    if (search.hostName) {
      url += '&hostName=' + search.hostName;
    }

    if (search.ip) {
      url += '&ip=' + search.ip;
    }

    if (search.mac) {
      url += '&mac=' + search.mac;
    }

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      let tempHmd = {...hmd};
      tempHmd.dataContent = data.rows;
      tempHmd.totalCount = data.counts;

      let dataFields = {};
      hmd.dataFieldsArr.forEach(tempData => {
        dataFields[tempData] = {
          label: tempData === '_menu' ? '' : f(`hmdFields.${tempData}`),
          sortable: tempData !== '_menu' ? true : null,
          formatter: (value, allValue) => {
            if (tempData === '_menu') {
              return (
                <div className={cx('table-menu', {'active': value})}>
                  <button onClick={this.handleRowContextMenu.bind(this, allValue)}><i className='fg fg-more'></i></button>
                </div>
              )
            } else if (tempData === 'createDttm') {
              return <span>{helper.getFormattedDate(value)}</span>
            } else if (tempData === 'runningTaskCount') {
              return this.getTaskCount('Running', value, allValue);
            } else if (tempData === 'waitingTaskCount') {
              return this.getTaskCount('Waiting', value, allValue);
            } else if (tempData === 'completeTaskCount') {
              return this.getTaskCount('Complete', value, allValue);
            } else {
              return <span>{value}</span>
            }
          }
        };
      })

      tempHmd.dataFields = dataFields;

      this.setState({
        hmd: tempHmd
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleRowContextMenu = (allValue, evt) => {
    const menuItems = [
      {
        id: 'addTask',
        text: f('hmdFields.addTask'),
        action: () => this.openTask(allValue)
      }
    ];

    ContextMenu.open(evt, menuItems, 'hmdOptionsMenu');
    evt.stopPropagation();
  }
  handleTaskChange = (type, value) => {
    let tempTask = {...this.state.task};
    tempTask[type] = value.trim();

    this.setState({
      task: tempTask
    });
  }
  openTask = (allValue) => {
    let tempTask = {...this.state.task};
    tempTask.ipDeviceUUID = allValue.ipDeviceUUID;

    this.setState({
      addTaskOpen: true,
      task: tempTask
    });
  }
  getTaskInfo = (value, allValue) => {
    const {baseUrl} = this.context;
    const {taskTable} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/hmd/taskinfo?hostId=${allValue.ipDeviceUUID}&taskStatus=${value}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        let tempTaskTable = {...taskTable};
        tempTaskTable.dataContent = data.rows;
        tempTaskTable.totalCount = data.counts;

        let dataFields = {};
        taskTable.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: f(`hmdFields.${tempData}`),
            sortable: true,
            formatter: (value, allValue) => {
              if (tempData.indexOf('Dttm') > 0) {
                return <span>{helper.getFormattedDate(value)}</span>
              } else {
                return <span>{value}</span>
              }
            }
          };
        })

        tempTaskTable.dataFields = dataFields;

        this.setState({
          viewTaskOpen: true,
          taskTable: tempTaskTable
        });
      } else {
        helper.showPopupMsg(t('txt-notFound'));
        return;
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  viewTask = () => {
    const {taskTable} = this.state;
    const titleText = f('hmdFields.viewTask');
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeDialog}
    };

    return (
      <ModalDialog
        id='viewTaskDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        <DataTable
          className='main-table'
          fields={taskTable.dataFields}
          data={taskTable.dataContent}
          onRowMouseOver={this.handleRowMouseOver}
          sort={taskTable.dataContent.length === 0 ? {} : taskTable.sort}
          onSort={this.handleViewTaskSort} />
      </ModalDialog>
    )
  }
  displayAddTask = () => {
    const {task} = this.state;

    return (
      <div className='content'>
        <label>{f('hmdFields.ipDeviceUUID')}</label>
        <Input
          className='add'
          value={task.ipDeviceUUID}
          readOnly={true} />

        <label>{f('hmdFields.taskName')}</label>
        <Input
          className='add'
          maxLength={50}
          required={true}
          onChange={this.handleTaskChange.bind(this, 'taskName')}
          value={task.taskName} />

        <label>{f('hmdFields.reqType')}</label>
        <DropDownList
          className='add'
          list={[
            {
              value: 'msg',
              text: 'Msg'
            },
            {
              value: 'file',
              text: 'File'
            }
          ]}
          required={true}
          onChange={this.handleTaskChange.bind(this, 'reqType')}
          value={task.reqType} />

        <label>{f('hmdFields.reqCommand')}</label>
        <Textarea
          className='add'
          rows={6}
          value={task.reqCommand}
          onChange={this.handleTaskChange.bind(this, 'reqCommand')} />

        {task.reqType === 'file' &&
          <div>
            <label>{f('hmdFields.reqParameters')}</label>
            <Input
              className='add'
              maxLength={50}
              required={true}
              onChange={this.handleTaskChange.bind(this, 'reqParameters')}
              value={task.reqParameters} />

            <label>{f('hmdFields.fileCompressPassward')}</label>
            <Input
              type='password'
              className='add'
              maxLength={50}
              onChange={this.handleTaskChange.bind(this, 'fileCompressPassward')}
              value={task.fileCompressPassward} />

            <label>{f('hmdFields.fileUrl')}</label>
            <Input
              className='add'
              maxLength={50}
              required={true}
              onChange={this.handleTaskChange.bind(this, 'fileUrl')}
              value={task.fileUrl} />

            <label>{f('hmdFields.fileAccount')}</label>
            <Input
              className='add'
              maxLength={50}
              required={true}
              onChange={this.handleTaskChange.bind(this, 'fileAccount')}
              value={task.fileAccount} />
          </div>
        }
      </div>
    )
  }
  addTask = () => {
    const titleText = f('hmdFields.addTask');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog},
      confirm: {text: t('txt-confirm'), handler: this.handleAddTaskAction}
    };

    return (
      <ModalDialog
        id='addTaskDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayAddTask()}
      </ModalDialog>
    )
  }
  handleAddTaskAction = () => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/hmd/taskinfo`;
    let dataObj = {...this.state.task};
    dataObj.hostId = dataObj.ipDeviceUUID;

    helper.getAjaxData('POST', url, dataObj)
    .then(data => {
      this.closeDialog();
      this.getHostData();
    });
  }
  closeDialog = () => {
    this.setState({
      addTaskOpen: false,
      viewTaskOpen: false,
      task: {
        hostId: '',
        taskName: '',
        reqType: 'msg',
        reqCommand: '',
        reqParameters: '',
        fileCompressPassward: '',
        fileUrl: '',
        fileAccount: ''
      }
    });
  }
  handleRowMouseOver = (value, allValue, evt) => {
    let tempHmd = {...this.state.hmd};
    tempHmd['dataContent'] = _.map(tempHmd['dataContent'], item => {
      return {
        ...item,
        _menu: allValue.ipDeviceUUID === item.ipDeviceUUID ? true : false
      };
    });

    this.setState({
      hmd: tempHmd
    });
  }
  handleTableSort = (value) => {
    let tempHmd = {...this.state.hmd};
    tempHmd.sort.field = value.field;
    tempHmd.sort.desc = !tempHmd.sort.desc;

    this.setState({
      hmd: tempHmd
    }, () => {
      this.getHostData();
    });
  }
  handleViewTaskSort = (value) => {
    let tempTaskTable = {...this.state.taskTable};
    tempTaskTable.sort.field = value.field;
    tempTaskTable.sort.desc = !tempTaskTable.sort.desc;

    this.setState({
      taskTable: tempTaskTable
    });
  }
  handlePaginationChange = (type, value) => {
    let tempHmd = {...this.state.hmd};
    tempHmd[type] = value;

    if (type === 'pageSize') {
      tempHmd.currentPage = 1;
    }

    this.setState({
      hmd: tempHmd
    }, () => {
      this.getHostData();
    });
  }
  toggleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter
    });
  }
  handleSearchChange = (type, value) => {
    let tempSearch = {...this.state.search};
    tempSearch[type] = value.trim();

    this.setState({
      search: tempSearch
    });
  }
  clearFilter = () => {
    this.setState({
      search: {
        hostName: '',
        ip: '',
        mac: ''
      }
    });
  }
  renderFilter = () => {
    const {showFilter, search} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='HMDhostName' className='first-label'>{f('hmdFields.hostName')}</label>
            <Input id='HMDhostName' onChange={this.handleSearchChange.bind(this, 'hostName')} value={search.hostName} />
          </div>
          <div className='group'>
            <label htmlFor='HMDip' className='first-label'>{f('hmdFields.ip')}</label>
            <Input id='HMDip' onChange={this.handleSearchChange.bind(this, 'ip')} value={search.ip} />
          </div>
          <div className='group'>
            <label htmlFor='HMDmac' className='first-label'>{f('hmdFields.mac')}</label>
            <Input id='HMDmac' onChange={this.handleSearchChange.bind(this, 'mac')} value={search.mac} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getHostData.bind(this, 'search')}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  render() {
    const {showFilter, addTaskOpen, viewTaskOpen, hmd} = this.state;

    return (
      <div>
        {addTaskOpen &&
          this.addTask()
        }

        {viewTaskOpen &&
          this.viewTask()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
          </div>
        </div>

        <div className='data-content'>
          <div className='parent-content'>
            {showFilter &&
              this.renderFilter()
            }

            <div className='main-content'>
              <TableContent
                dataTableData={hmd.dataContent}
                dataTableFields={hmd.dataFields}
                dataTableSort={hmd.sort}
                paginationTotalCount={hmd.totalCount}
                paginationPageSize={hmd.pageSize}
                paginationCurrentPage={hmd.currentPage}
                handleTableSort={this.handleTableSort}
                handleRowMouseOver={this.handleRowMouseOver}
                paginationPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Endpoint.contextType = BaseDataContext;

Endpoint.propTypes = {
};

export default withRouter(Endpoint);