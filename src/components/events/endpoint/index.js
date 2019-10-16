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

import helper from '../../common/helper'
import TableContent from '../../common/table-content'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

class Endpoint extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openFilter: false,
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
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount = () => {
   this.getHostData();
  }
  getHostData = (fromSearch) => {
    const {baseUrl} = this.props;
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
              return <span>{helper.getFormattedDate(value)}</span>;
            } else if (tempData === 'runningTaskCount') {
              return <a className='bold' onClick={this.getTaskInfo.bind(this, 'Running', allValue)}>{value}</a>;
            } else if (tempData === 'waitingTaskCount') {
              return <a className='bold' onClick={this.getTaskInfo.bind(this, 'Waiting', allValue)}>{value}</a>;
            } else if (tempData === 'completeTaskCount') {
              return <a className='bold' onClick={this.getTaskInfo.bind(this, 'Complete', allValue)}>{value}</a>;
            } else {
              return <span>{value}</span>;
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
    const id = allValue.ipDeviceUUID;
    let menuItems = [
      {
        id: id + 'addTask',
        text: t('hmdFields.addTask'),
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
    const {baseUrl} = this.props;
    const {taskTable} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/hmd/taskinfo?hostId=${allValue.ipDeviceUUID}&taskStatus=${value}`,
      type: 'GET'
    })
    .then(data => {
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
              return <span>{helper.getFormattedDate(value)}</span>;
            } else {
              return <span>{value}</span>;
            }
          }
        };
      })

      tempTaskTable.dataFields = dataFields;

      this.setState({
        viewTaskOpen: true,
        taskTable: tempTaskTable
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  viewTask = () => {
    const {taskTable} = this.state;
    const titleText = t('hmdFields.viewTask');
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeDialog}
    };

    return (
      <ModalDialog
        id='viewTask'
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
        <label>{t('hmdFields.id')}</label>
        <Input
          className='add'
          maxLength='50'
          value={task.ipDeviceUUID}
          readOnly={true} />

        <label>{t('hmdFields.taskName')}</label>
        <Input
          className='add'
          maxLength='50'
          required={true}
          onChange={this.handleTaskChange.bind(this, 'taskName')}
          value={task.taskName} />

        <label>{t('hmdFields.reqType')}</label>
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

        <label>{t('hmdFields.reqCommand')}</label>
        <Textarea
          className='add'
          rows={6}
          value={task.reqCommand}
          onChange={this.handleTaskChange.bind(this, 'reqCommand')} />

        {task.reqType === 'file' &&
          <div>
            <label>{t('hmdFields.reqParameters')}</label>
            <Input
              className='add'
              maxLength='50'
              required={true}
              onChange={this.handleTaskChange.bind(this, 'reqParameters')}
              value={task.reqParameters} />

            <label>{t('hmdFields.fileCompressPassward')}</label>
            <Input
              type='password'
              className='add'
              maxLength='50'
              onChange={this.handleTaskChange.bind(this, 'fileCompressPassward')}
              value={task.fileCompressPassward} />

            <label>{t('hmdFields.fileUrl')}</label>
            <Input
              className='add'
              maxLength='50'
              required={true}
              onChange={this.handleTaskChange.bind(this, 'fileUrl')}
              value={task.fileUrl} />

            <label>{t('hmdFields.fileAccount')}</label>
            <Input
              className='add'
              maxLength='50'
              required={true}
              onChange={this.handleTaskChange.bind(this, 'fileAccount')}
              value={task.fileAccount} />
          </div>
        }
      </div>
    )
  }
  addTask = () => {
    const titleText = t('hmdFields.addTask');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog},
      confirm: {text: t('txt-confirm'), handler: this.handleAddTaskAction}
    };

    return (
      <ModalDialog
        id='addTask'
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
    const {baseUrl} = this.props;
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
    let tmpHmd = {...this.state.hmd};

    tmpHmd['dataContent'] = _.map(tmpHmd['dataContent'], item => {
      return {
        ...item,
        _menu: allValue.ipDeviceUUID === item.ipDeviceUUID ? true : false
      }
    });

    this.setState({
      hmd: tmpHmd
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
  setFilter = (flag) => {
    this.setState({
      openFilter: flag
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
    const {openFilter, search} = this.state;

    return (
      <div className={cx('main-filter', {'active': openFilter})}>
        <i className='fg fg-close' onClick={this.setFilter.bind(this, false)} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='HMDhostName' className='first-label'>{t('hmdFields.hostName')}</label>
            <Input id='HMDhostName' onChange={this.handleSearchChange.bind(this, 'hostName')} value={search.hostName} />
          </div>
          <div className='group'>
            <label htmlFor='HMDip' className='first-label'>{t('hmdFields.ip')}</label>
            <Input id='HMDip' onChange={this.handleSearchChange.bind(this, 'ip')} value={search.ip} />
          </div>
          <div className='group'>
            <label htmlFor='HMDmac' className='first-label'>{t('hmdFields.mac')}</label>
            <Input id='HMDmac' onChange={this.handleSearchChange.bind(this, 'mac')} value={search.mac} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getHostData.bind(this, 'search')}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter.bind(this)}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  render() {
    const {session} = this.props;
    const {openFilter, addTaskOpen, viewTaskOpen, hmd} = this.state;
    let sessionRights = {};

    _.forEach(session.rights, val => {
      sessionRights[val] = true;
    })

    return (
      <div>
        {addTaskOpen &&
          this.addTask()
        }

        {viewTaskOpen &&
          this.viewTask()
        }

        <div className='sub-header'>
          {helper.getEventsMenu('endpoint', sessionRights)}

          <div className='secondary-btn-group right'>
            <button className={cx('last', {'active': openFilter})} onClick={this.setFilter.bind(this, !openFilter)} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
          </div>
        </div>

        <div className='data-content'>
          <div className='parent-content'>
            {openFilter &&
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

Endpoint.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  session: PropTypes.object.isRequired
};

const HocEndpoint = withRouter(withLocale(Endpoint));
export { Endpoint, HocEndpoint };