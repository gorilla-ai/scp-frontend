import React, { Component } from 'react'
import PropTypes from 'prop-types'

import InfiniteScroll from 'react-infinite-scroll-component'

import GetAppIcon from '@material-ui/icons/GetApp'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Popover from '@material-ui/core/Popover'
import RefreshIcon from '@material-ui/icons/Refresh'

import {BaseDataContext} from './context'

import helper from './helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

/**
 * Export CSV
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the export component
 */
class ExportCsv extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  /**
   * Handle CSV download
   * @param {string} id - service task ID
   * @method
   */
  getCSVfile = (id) => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/taskService/file/_download?id=${id}`;
    window.open(url, '_blank');
  }
  /**
   * Delete service task
   * @method
   * @param {string} id - service data ID
   */
  deleteServiceTask = (id) => {
    const {baseUrl} = this.context;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/taskService/${id}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.props.getTaskService('firstLoad');
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Retrigger service task
   * @method
   * @param {string} id - service data ID
   */
  retriggerServiceTask = (id) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/taskService/async/_reimport`;
    const requestData = {
      id: [id]
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        this.props.getTaskService('firstLoad');
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display service task list
   * @method
   * @param {object} val - content of the list
   * @param {number} i - index of the list
   * @returns HTML DOM
   */
  displayServiceTaskList = (val, i) => {
    const fileName = val.name;
    let newFileName = fileName;

    if (fileName.length > 23) {
      newFileName = fileName.substr(0, 23) + '...';
    }

    return (
      <tr key={val.id}>
        <td className='file-name'><span title={fileName}>{newFileName}</span></td>
        <td className='date-time'>{helper.getFormattedDate(val.lastUpdateDttm, 'local')}</td>
        <td>
          <ListItemIcon className='list-icon'>
            {val.progress === 100 &&
              <span title={t('txt-downloadTask')}><GetAppIcon className='c-link' onClick={this.getCSVfile.bind(this, val.id)} /></span>
            }
            {val.progress !== 100 &&
              <span title={t('txt-scheduledTask')}><HourglassEmptyIcon /></span>
            }
            <span title={t('txt-deleteTask')}><HighlightOffIcon className='c-link delete-icon' onClick={this.deleteServiceTask.bind(this, val.id)} /></span>
            {val.progress !== 100 &&
              <span title={t('txt-retriggerTask')}><RefreshIcon className='c-link' onClick={this.retriggerServiceTask.bind(this, val.id)} /></span>
            }
          </ListItemIcon>
        </td>
      </tr>
    )
  }
  render() {
  	const {title, popOverAnchor, anchorPosition, taskServiceList} = this.props;
    const listTitle = title || t('txt-exportScheduledList');
    let anchorInfo = {};
    let open = false;

    if (anchorPosition) {
      anchorInfo = {
        className: 'anchorPosition',
        anchorPosition: anchorPosition,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        transformOrigin: {
          vertical: 'top',
          horizontal: 'right',
        }
      };
      open = Boolean(anchorPosition);
    } else if (popOverAnchor) {
      anchorInfo = {
        anchorEl: popOverAnchor,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'center',
        },
        transformOrigin: {
          vertical: 'top',
          horizontal: 'center',
        }
      };
      open = Boolean(popOverAnchor);
    }

    return (
      <Popover
        {...anchorInfo}
        id='csvDownloadContent'
        open={open}
        onClose={this.props.handlePopoverClose}>
        <div className='content'>
          {popOverAnchor &&
            <List>
              <ListItem button>
                <ListItemText primary={t('txt-exportCSV')} onClick={this.props.registerDownload} />
              </ListItem>
            </List>
          }
          <div>
            {taskServiceList.data && taskServiceList.data.length === 0 &&
              <span className='empty'>{t('txt-notFound')}</span>
            }
            {taskServiceList.data && taskServiceList.data.length > 0 &&
              <div className='scheduled-list'>
                <div className='header'><span>{listTitle}</span> {t('txt-past7days')}</div>
                <List className='service-list'>
                  <InfiniteScroll
                    dataLength={taskServiceList.data.length}
                    next={this.props.getTaskService}
                    hasMore={taskServiceList.hasMore}
                    height={300}>
                    <table className='c-table main-table'>
                      <tbody>
                        {taskServiceList.data.map(this.displayServiceTaskList)}
                      </tbody>
                    </table>
                  </InfiniteScroll>
                </List>
              </div>
            }
          </div>
        </div>
      </Popover>
    )
  }
}

ExportCsv.contextType = BaseDataContext;

ExportCsv.propTypes = {
  title: PropTypes.string,
  popOverAnchor: PropTypes.object,
  anchorPosition: PropTypes.object,
  taskServiceList: PropTypes.object.isRequired,
  handlePopoverClose: PropTypes.func.isRequired,
  registerDownload: PropTypes.func,
  getTaskService: PropTypes.func.isRequired
};

export default ExportCsv;