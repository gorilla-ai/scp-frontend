import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormLabel from '@material-ui/core/FormLabel'
import Switch from '@material-ui/core/Switch'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../../common/context'
import Config from '../../common/configuration'
import helper from '../../common/helper'
import MuiTableContent from '../../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

/**
 * Service Status
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Config service status page
 */
class Status extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lastUpdateTime: '',
      showNotifyStatus: false,
      serviceStatus: {
        dataFieldsArr: ['status', 'serviceName', 'notifyStatus'],
        dataFields: [],
        dataContent: null
      },
      notifyStatusList: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);
    helper.inactivityTime(baseUrl, locale);

    this.getServiceStatus();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get and set service status data
   * @method
   * @param {string} option - option for 'refresh'
   */
  getServiceStatus = (option) => {
    const {baseUrl} = this.context;
    const {serviceStatus} = this.state;
    let url = `${baseUrl}/api/monitor`;

    if (option === 'refresh') {
      url += '?refresh=true';
    }

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const lastUpdateTime = helper.getFormattedDate(data.lastUpdateDttm, 'local');
        let tempServiceStatus = {...serviceStatus};

        if (!data.monitor || data.monitor.length === 0) {
          tempServiceStatus.dataContent = [];

          this.setState({
            serviceStatus: tempServiceStatus
          });
          return null;
        }

        tempServiceStatus.dataContent = data.monitor;
        tempServiceStatus.dataFields = _.map(serviceStatus.dataFieldsArr, val => {
          return {
            name: val,
            label: f('serviceStatusFields.' + val),
            options: {
              filter: true,
              sort: false,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempServiceStatus.dataContent[dataIndex];
                const value = tempServiceStatus.dataContent[dataIndex][val];

                if (val === 'status') {
                  let color = '';
                  let title = '';

                  if (value.toLowerCase() === 'active') {
                    color = '#22ac38';
                    title = t('txt-online');
                  } else if (value.toLowerCase() === 'inactive') {
                    color = '#d10d25';
                    title = t('txt-offline');
                  } else if (value.toLowerCase() === 'unstable') {
                    color = '#e6e448';
                    title = t('txt-unstable');
                  } else if (value.toLowerCase() === 'unknown') {
                    color = '#999';
                    title = t('txt-unknown');
                  }

                  return <div style={{color}}><i className='fg fg-recode' title={title} /></div>
                } else if (val === 'serviceName') {
                  let tooltip = '';

                  if (allValue.responseCode) {
                    tooltip += allValue.responseCode + ': ';
                  } else {
                    tooltip += 'N/A: ';
                  }

                  if (allValue.reponseMsg) {
                    tooltip += allValue.reponseMsg;
                  } else {
                    tooltip += 'N/A';
                  }

                  return <span>{value} <i className='fg fg-info' title={tooltip}></i></span>
                } else if (val === 'notifyStatus') {
                  const color = value ? '#22ac38' : '#d10d25';
                  const title = value ? t('txt-online') : t('txt-offline');

                  return <span><i className='fg fg-recode' style={{color}} title={title} /></span>
                }
              }
            }
          };
        });

        const notifyStatusList = _.map(data.monitor, val => {
          return {
            serviceName: val.serviceName,
            status: val.notifyStatus
          };
        });

        this.setState({
          lastUpdateTime,
          serviceStatus: tempServiceStatus,
          notifyStatusList
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle notify settings dialog
   * @method
   */
  toggleNotifySettings = () => {
    this.setState({
      showNotifyStatus: !this.state.showNotifyStatus
    });
  }
  /**
   * Handle notify status change
   * @method
   * @param {number} i - index of the monitor data array
   * @param {object} event - event object
   */
  handleNotifyStatusChange = (i, event) => {
    let tempNotifyStatusList = _.cloneDeep(this.state.notifyStatusList);
    tempNotifyStatusList[i].status = event.target.checked;

    this.setState({
      notifyStatusList: tempNotifyStatusList
    });
  }
  /**
   * Display individual switch control
   * @method
   * @param {object} val - monitor data
   * @param {number} i - index of the monitor data array
   * @returns HTML DOM
   */
  displaySwitchControl = (val, i) => {
    return (
      <div key={i} className='switch-group'>
        <FormLabel className='service-name'>{val.serviceName}</FormLabel>
        <FormControlLabel
          className='switch-control'
          control={
            <Switch
              checked={val.status}
              onChange={this.handleNotifyStatusChange.bind(this, i)}
              color='primary' />
          }
          label={t('txt-switch')} />
      </div>
    )
  }
  /**
   * Display notify settings content
   * @method
   * @returns HTML DOM
   */
  displayNotifySettings = () => {
    return (
      <div className='notify-settings'>
        {this.state.notifyStatusList.map(this.displaySwitchControl)}
      </div>
    )
  }
  /**
   * Show Notify settings dialog
   * @method
   * @returns ModalDialog component
   */
  notifySettingsDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleNotifySettings},
      confirm: {text: t('txt-confirm'), handler: this.notifySettingsConfirm}
    };
    const titleText = t('notifications.txt-settings');

    return (
      <ModalDialog
        id='notifySettingsDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayNotifySettings()}
      </ModalDialog>
    )
  }
  /**
   * Notify Settings confirm
   * @method
   */
  notifySettingsConfirm = () => {
    const {baseUrl} = this.context;
    const {notifyStatusList} = this.state;
    const url = `${baseUrl}/api/monitor/updateService`;

    this.ah.one({
      url,
      data: JSON.stringify(notifyStatusList),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.toggleNotifySettings();
        this.getServiceStatus('refresh');
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {lastUpdateTime, serviceStatus, showNotifyStatus} = this.state;
    const tableOptions = {
      pagination: false,
      tableBodyHeight: '78vh'
    };

    return (
      <div>
        {showNotifyStatus &&
          this.notifySettingsDialog()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button variant='contained' color='primary' onClick={this.getServiceStatus.bind(this, 'refresh')} title={t('txt-update')}><i className='fg fg-update'></i></Button>
	          <span className='last-update'>{lastUpdateTime}</span>
	        </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            <div className='main-content'>
              <header className='main-header'>{t('txt-serviceStatus')}</header>

              <div className='content-header-btns with-menu'>
                <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleNotifySettings}>{t('notifications.txt-settings')}</Button>
              </div>

              <div className='table-content'>
                <div className='table no-pagination'>
                  <MuiTableContent
                    data={serviceStatus}
                    tableOptions={tableOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Status.contextType = BaseDataContext;

Status.propTypes = {
};

export default withRouter(Status);