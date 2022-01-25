import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'

import DataTable from 'react-ui/build/src/components/table'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context'
import Config from '../../common/configuration'
import Edge from './edge'
import FloorMap from '../../common/floor-map'
import helper from '../../common/helper'
import IpRange from './ip-range'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const IP_PATTERN = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

let t = null;
let et = null;

/**
 * Network Topology Inventory Auto Settings
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to manage auto settings
 */
class AutoSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeContent: 'viewMode', //'viewMode' or 'editMode'
      networkTestOpen: false,
      originalStatusEnable: {},
      statusEnable: {
        ipRange: true,
        ad_ldap: true,
        netflow: true,
        networkTopology: true
      },
      originalIPrangeData: [],
      ipRangeData: [{
        type: 'private',
        ip: '',
        mask: ''
      }],
      originalADdata: {},
      adData: {
        type: 'AD', //AD, LDAP
        ip: '',
        port: '',
        domain: '',
        username: '',
        password: ''
      },
      adTableData: [],
      originalNetflowData: {},
      netflowData: {
        time: '24'
      },
      netFlowTableData: [],
      deviceList: [],
      originalEdgeData: [],
      edgeData: [{
        edge: '',
        networkTopoData: {
          target: [{
            ip: '',
            mask: ''
          }],
          switch: [{
            ip: '',
            mask: ''
          }],
        },
        index: 0
      }],
      topoTriggerStatus: '',
      networkTestResult: [],
      formValidation: {
        ip: {
          valid: true
        },
        port: {
          valid: true
        }
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);
    helper.inactivityTime(baseUrl, locale);

    this.getSettingsInfo();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get and set auto settings data
   * @method
   */
  getSettingsInfo = () => {
    const {baseUrl} = this.context;
    const {statusEnable, ipRangeData, adData, netflowData, deviceList, edgeData} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/ipdevice/config`,
      type: 'GET'
    })
    .then(data => {
      if (data && data.ret === 0) {
        data = data.rt.value;

        let tempStatusEnable = {...statusEnable};
        let ipRangeData = [];
        let tempADdata = {...adData};
        let tempNetflowData = {...netflowData};
        let tempScannerData = [];
        let tempEdgeData = [];
        tempStatusEnable.ipRange = data['ip.enable'];
        tempStatusEnable.ad_ldap = data['ad.enable'];
        tempStatusEnable.netflow = data['netflow.enable'];
        tempStatusEnable.networkTopology = data['networktopology.enable'];

        let privateIParr = [];
        let publicIParr = [];

        if (data['ip.private'] && data['ip.private'].range.length > 0) {
          _.forEach(data['ip.private'].range, val => {
            privateIParr = val.split('/');

            ipRangeData.push({
              type: 'private',
              ip: privateIParr[0],
              mask: privateIParr[1]
            });
          })
        }

        if (data['ip.public'] && data['ip.public'].range.length > 0) {
          _.forEach(data['ip.public'].range, val => {
            publicIParr = val.split('/');

            ipRangeData.push({
              type: 'public',
              ip: publicIParr[0],
              mask: publicIParr[1]
            });
          })
        }

        tempADdata.type = data['ad.type'] || adData.type;
        tempADdata.ip = data['ad.host'];
        tempADdata.port = data['ad.port'];
        tempADdata.domain = data['ad.domain'];
        tempADdata.username = data['ad.username'];
        tempADdata.password = data['ad.password'];
        tempNetflowData.time = data['netflow.period.hr'] || netflowData.time;

        if (data.networktopology && data.networktopology.length > 0) {
          _.forEach(data.networktopology, (val, i) => {
            let networkTopology = {};
            networkTopology.edge = val.edge;
            networkTopology.networkTopoData = {};
            networkTopology.networkTopoData.target = _.map(val.targetInfo, val2 => {
              return {
                ip: val2.target,
                mask: val2.mask
              };
            });
            networkTopology.networkTopoData.switch = _.map(val.switchInfo, val2 => {
              return {
                ip: val2.host,
                mask: val2.community
              };
            });
            networkTopology.index = i;
            tempEdgeData.push(networkTopology);
          })
        } else {
          tempEdgeData = edgeData;
        }

        this.setState({
          activeContent: 'viewMode',
          originalStatusEnable: _.cloneDeep(tempStatusEnable),
          statusEnable: tempStatusEnable,
          originalIPrangeData: _.cloneDeep(ipRangeData),
          ipRangeData,
          originalADdata: _.cloneDeep(tempADdata),
          adData: tempADdata,
          originalNetflowData: _.cloneDeep(tempNetflowData),
          netflowData: tempNetflowData,
          originalEdgeData: _.cloneDeep(tempEdgeData),
          edgeData: tempEdgeData,
          topoTriggerStatus: data['networktopology.trigger.enable']
        }, () => {
          this.getDeviceList();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set device list data
   * @method
   */
  getDeviceList = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/ipdevice/edges`,
      type: 'GET'
    })
    .then(data => {
      if (data && data.ret === 0) {
        data = data.rt;

        if (data.length > 0) {
          const deviceList = _.map(data, (val, i) => {
            return <MenuItem key={i} value={val.target}>{val.name}</MenuItem>
          });

          this.setState({
            deviceList
          });
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set IP range data
   * @method
   * @param {array} ipRangeData - IP range data
   */
  setIpRangeData = (ipRangeData) => {
    this.setState({
      ipRangeData
    });
  }
  /**
   * Set IP edge data
   * @method
   * @param {string} type - edge type ('edge', 'target' or 'switch')
   * @param {object} data - edge data
   * @param {object} [scanner] - scanner data
   */
  setEdgeData = (type, data, scanner) => {
    let tempEdgeData = this.state.edgeData;

    if (type === 'edge') {
      this.setState({
        edgeData: data
      });
    } else {
      tempEdgeData[data.index].networkTopoData[type] = scanner;

      this.setState({
        edgeData: tempEdgeData
      });
    }
  }
  /**
   * Set status data
   * @method
   * @param {object} event - event object
   */
  handleStatusChange = (event) => {
    let tempStatusEnable = {...this.state.statusEnable};
    tempStatusEnable[event.target.name] = event.target.checked;

    this.setState({
      statusEnable: tempStatusEnable
    });
  }
  /**
   * Handle AD/LDAP input value change
   * @method
   * @param {object} event - event object
   */
  handleADchange = (event) => {
    let tempADdata = {...this.state.adData};
    tempADdata[event.target.name] = event.target.value;

    this.setState({
      adData: tempADdata
    });
  }
  /**
   * Display AD/LDAP test query content
   * @method
   * @returns HTML DOM
   */
  getADtestContent = () => {
    const {adTableData} = this.state;

    if (adTableData.length > 0) {
      return (
        <DataTable
          className='main-table'
          fields={{
            ownerID: { label: t('ownerFields.ownerID'), sortable: true },
            ownerName: { label: t('ownerFields.ownerName'), sortable: true }
          }}
          data={adTableData}
          defaultSort={{
            field: 'ownerID',
            desc: true
          }} />
      )
    } else {
      return <div className='align-center'>{t('txt-notFound')}</div>
    }
  }
  /**
   * Get and set AD/LDAP test result
   * @method
   */
  handleADtest = () => {
    const {baseUrl} = this.context;
    const {adData} = this.state;
    const url = `${baseUrl}/api/ipdevice/config/ad/_test`;
    const requestData = {
      'ad.type': adData.type,
      'ad.host': adData.ip,
      'ad.port': Number(adData.port),
      'ad.domain': adData.domain,
      'ad.username': adData.username,
      'ad.password': adData.password
    };

    this.ah.one({
      url: url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data && data.ret === 0) {
        data = data.rt;

        this.setState({
          adTableData: data
        }, () => {
          PopupDialog.alert({
            id: 'modalWindowSmall',
            confirmText: t('txt-close'),
            display: this.getADtestContent()
          });
        });
      } else {
        helper.showPopupMsg(t('auto-settings.txt-connectionsFail'), t('txt-error'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg(t('auto-settings.txt-connectionsFail'), t('txt-error'));
    })
  }
  /**
   * Display Netflow test query content
   * @method
   * @returns HTML DOM
   */
  getNetflowTestContent = () => {
    const {netFlowTableData} = this.state;

    if (netFlowTableData.length > 0) {
      return (
        <DataTable
          className='main-table'
          fields={{
            ip: { label: t('ipFields.ip'), sortable: true },
            mac: { label: t('ipFields.mac'), sortable: true },
            connSize: { label: t('ipFields.connSize'), sortable: true },
            unauthType: { label: t('ipFields.unauthType'), sortable: true }
          }}
          data={netFlowTableData}
          defaultSort={{
            field: 'ip',
            desc: true
          }} />
      )
    } else {
      return <div className='align-center'>{t('txt-notFound')}</div>
    }
  }
  /**
   * Get and test Netflow test result
   * @method
   */
  handleNetflowtest = () => {
    const {baseUrl} = this.context;
    const dateTime = {
      from: moment(helper.getSubstractDate(24, 'hour')).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment().utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };

    this.ah.one({
      url: `${baseUrl}/api/network/session/unauthHosts?startDttm=${dateTime.from}&endDttm=${dateTime.to}&page=1&pageSize=10`,
      type: 'GET'
    })
    .then(data => {
      if (data && data.ret === 0) {
        this.setState({
          netFlowTableData: data.rt.rows
        }, () => {
          PopupDialog.alert({
            id: 'modalWindowSmall',
            confirmText: t('txt-close'),
            display: this.getNetflowTestContent()
          });
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get formatted edgeData for http request
   * @method
   * @returns formatted network topology data
   */
  getFormattedEdgeData = () => {
    let networkTopology = [];

    _.forEach(this.state.edgeData, val => {
      networkTopology.push({
        edge: val.edge,
        targetInfo: _.map(val.networkTopoData.target, val2 => {
          return {
            target: val2.ip,
            mask: val2.mask
          };
        }),
        switchInfo: _.map(val.networkTopoData.switch, val2 => {
          return {
            host: val2.ip,
            community: val2.mask
          };
        })
      });
    })

    return networkTopology;
  }
  /**
   * Show message to the user
   * @param {number} [index] - index of edgeData
   * @method
   */
  showMessage = (index) => {
    PopupDialog.prompt({
      title: t('network-inventory.txt-testQuery'),
      id: 'modalWindowSmall',
      confirmText: t('txt-ok'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{t('network-inventory.txt-warningMsg')}</span>
        </div>
      ),
      act: (confirmed) => {
        if (confirmed) {
          this.handleNetworkTest('test', index);
        }
      }
    });
  }
  /**
   * Get and network test result
   * @param {string} type - button type ('generate' or 'test')
   * @param {number} [index] - index of edgeData
   * @method
   */
  handleNetworkTest = (type, index) => {
    const {baseUrl} = this.context;
    const {edgeData} = this.state;
    const url = `${baseUrl}/api/ipdevice/topology`;
    const formattedEdgeData = this.getFormattedEdgeData();
    let requestData = {};

    if (type === 'generate') {
      requestData = {
        isTest: false,
        networktopology: formattedEdgeData
      };
    } else if (type === 'test') {
      requestData = {
        isTest: true,
        networktopology: [formattedEdgeData[index]]
      };
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: type === 'test'})
    .then(data => {
      if (data && data.ret === 0) {
        data = data.rt;

        if (type === 'test') {
          this.setState({
            networkTestResult: data
          }, () => {
            this.toggleNetworkTestDialog();
          });
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    if (type === 'generate') {
      helper.showPopupMsg(t('txt-requestSent'));
    }
  }
  /**
   * Toggle content type
   * @method
   * @param {string} type - content type ('viewMode', 'editMode', 'save' or 'cancel')
   */
  toggleContent = (type) => {
    const {
      originalStatusEnable,
      originalIPrangeData,
      originalADdata,
      originalNetflowData,
      originalScannerData,
      originalEdgeData
    } = this.state;
    let showPage = type;

    if (type === 'save') {
      this.handleSettingsConfirm();
      return;
    } else if (type === 'viewMode' || type === 'cancel') {
      showPage = 'viewMode';

      this.setState({
        statusEnable: _.cloneDeep(originalStatusEnable),
        ipRangeData: _.cloneDeep(originalIPrangeData),
        adData: _.cloneDeep(originalADdata),
        netflowData: _.cloneDeep(originalNetflowData),
        edgeData: _.cloneDeep(originalEdgeData),
        formValidation: {
          ip: {
            valid: true
          },
          port: {
            valid: true
          }
        }
      });
    }

    this.setState({
      activeContent: showPage
    });
  }
  /**
   * Handle auto settings confirm
   * @method
   */
  handleSettingsConfirm = () => {
    const {baseUrl} = this.context;
    const {statusEnable, ipRangeData, adData, netflowData, edgeData, formValidation} = this.state;
    const url = `${baseUrl}/api/ipdevice/config`;
    let requestData = {
      'ip.enable': statusEnable.ipRange,
      'ad.enable': statusEnable.ad_ldap,
      'netflow.enable': statusEnable.netflow,
      'networktopology.enable': statusEnable.networkTopology
    };
    let ipRangePrivate = [];
    let ipRangePublic = [];
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (adData.ip) {
      if (IP_PATTERN.test(adData.ip)) { //Check IP format
        tempFormValidation.ip.valid = true;
      } else {
        tempFormValidation.ip.valid = false;
        validate = false;
      }
    }

    if (adData.port) {
      const portNumber = Number(adData.port);

      if (portNumber <= 0 || portNumber > 65535) { //Check port number
        tempFormValidation.port.valid = false;
        validate = false;
      } else {
        tempFormValidation.port.valid = true;
      }
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    _.forEach(ipRangeData, val => {
      if (val.type === 'private') {
        ipRangePrivate.push(val.ip + '/' + val.mask);
      } else if (val.type === 'public') {
        ipRangePublic.push(val.ip + '/' + val.mask);
      }
    })

    requestData['ip.private'] = {
      range: ipRangePrivate
    };

    requestData['ip.public'] = {
      range: ipRangePublic
    };

    requestData['netflow.period.hr'] = Number(netflowData.time);
    requestData['ad.type'] = adData.type;
    requestData['ad.host'] = adData.ip;
    requestData['ad.port'] = adData.port;
    requestData['ad.domain'] = adData.domain;
    requestData['ad.username'] = adData.username;
    requestData['ad.password'] = adData.password;

    requestData.networktopology = this.getFormattedEdgeData();

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data && data.ret === 0) {
        this.getSettingsInfo();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get input width based on content mode
   * @method
   * @param {string} type - input type ('ipRange')
   * @returns input width
   */
  getInputWidth = (type) => {
    const {activeContent} = this.state;

    if (type === 'ipRange') {
      if (activeContent === 'viewMode') {
        return '32%';
      } else if (activeContent === 'editMode') {
        return '30%';
      }
    }

    if (type === 'networkTopology') {
      return '50%';
    }
  }
  /**
   * Toggle test result modal dialog
   * @method
   */
  toggleNetworkTestDialog = () => {
    this.setState({
      networkTestOpen: !this.state.networkTestOpen
    });
  }
  /**
   * Display network data
   * @method
   * @param {object} val - content of the data
   * @param {number} i - index of the data
   * @returns HTML DOM
   */
  showNetworkData = (val, i) => {
    return (
      <tr>
        <td><div>{val.content.dstIP}</div><div>{val.content.srcIP}</div></td>
        <td>{val.content.message}</td>
      </tr>
    )
  }
  /**
   * Display Network data table
   * @method
   * @returns HTML DOM
   */
  displayNetworkTable = () => {
    const {networkTestResult} = this.state;

    if (networkTestResult.length > 0) {
      return (
        <table className='c-table main-table'>
          <thead>
            <tr>
              <th>Host</th>
              <th>Port</th>
            </tr>
          </thead>
          <tbody>
            {this.state.networkTestResult.map(this.showNetworkData)}
          </tbody>
        </table>
      )
    } else {
      return (
        <div>{t('txt-notFound')}</div>
      )
    }
  }
  /**
   * Display network test result modal dialog
   * @method
   * @returns ModalDialog component
   */
  showNetworkTestDialog = () => {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.toggleNetworkTestDialog}
    };

    return (
      <ModalDialog
        id='testResultDialog'
        className='modal-dialog'
        title={t('network-inventory.txt-testQuery')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displayNetworkTable()}
      </ModalDialog>
    )
  }
  render() {
    const {
      activeContent,
      networkTestOpen,
      statusEnable,
      ipRangeData,
      adData,
      netflowData,
      deviceList,
      edgeData,
      topoTriggerStatus,
      formValidation
    } = this.state;
    const scannerProps = {
      activeContent,
      statusEnable,
      deviceList
    };
    const networkTopologyProps = {
      activeContent,
      statusEnable,
      deviceList,
      edgeData,
      getInputWidth: this.getInputWidth,
      showMessage: this.showMessage,
      handleNetworkTest: this.handleNetworkTest,
      setEdgeData: this.setEdgeData
    };
    const adFormTitle = adData.type === 'AD' ? t('auto-settings.txt-AD') : t('auto-settings.txt-LDAP');

    return (
      <div className='parent-content'>
        {networkTestOpen &&
          this.showNetworkTestDialog()
        }

        <div className='main-content basic-form'>
          <header className='main-header'>{t('network-inventory.txt-autoSettings')}</header>

          {activeContent === 'viewMode' &&
            <div className='content-header-btns'>
              <Button id='autoSettingsBackToList' variant='outlined' color='primary' className='standard btn no-padding'>
                <Link to={{pathname: '/SCP/configuration/topology/inventory', state: 'tableList'}}>{t('txt-back')}</Link>
              </Button>
              <Button id='autoSettingsEditSettings' variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode')}>{t('txt-edit')}</Button>
            </div>
          }

          <div className='auto-settings' style={{height: activeContent === 'viewMode' ? '78vh' : '70vh'}}>
            <div className='form-group normal'>
              <header>{t('auto-settings.txt-ipRange')}</header>
              <div className='form-options'>
                <FormControlLabel
                  id='autoSettingsIpRangeSwitch'
                  className='toggle-btn'
                  control={
                    <Switch
                      name='ipRange'
                      checked={statusEnable.ipRange}
                      onChange={this.handleStatusChange}
                      color='primary' />
                  }
                  label={t('txt-switch')}
                  disabled={activeContent === 'viewMode'} />
              </div>
              <div className='group full multi'>
                <label id='ipRangeLabel' htmlFor='autoSettingsIpRange'>
                  <span style={{width: this.getInputWidth('ipRange')}}>Type</span>
                  <span style={{width: this.getInputWidth('ipRange')}}>IP</span>
                  <span style={{width: this.getInputWidth('ipRange')}}>Mask</span>
                </label>
                <MultiInput
                  id='autoSettingsIpRange'
                  className='ip-range-group'
                  base={IpRange}
                  props={scannerProps}
                  defaultItemValue={{
                    type: 'private',
                    ip: '',
                    mask: ''
                  }}
                  value={ipRangeData}
                  onChange={this.setIpRangeData}
                  disabled={activeContent === 'viewMode'} />
              </div>
            </div>

            <div className='form-group normal short'>
              <header>{adFormTitle}</header>
              <RadioGroup
                id='autoSettingsAD'
                className='radio-group'
                name='type'
                value={adData.type}
                onChange={this.handleADchange}>
                <FormControlLabel
                  value='AD'
                  control={
                    <Radio
                      id='autoSettingsADad'
                      className='radio-ui'
                      color='primary' />
                  }
                  label={t('auto-settings.txt-AD')}
                  disabled={activeContent === 'viewMode'} />
                <FormControlLabel
                  value='LDAP'
                  control={
                    <Radio
                      id='autoSettingsADLdap'
                      className='radio-ui'
                      color='primary' />
                  }
                  label={t('auto-settings.txt-LDAP')}
                  disabled={activeContent === 'viewMode'} />
              </RadioGroup>
              <div className='form-options'>
                <Button id='autoSettingsHandleAdTest' variant='contained' color='primary' onClick={this.handleADtest} disabled={!statusEnable.ad_ldap}>{t('network-inventory.txt-testQuery')}</Button>
                <FormControlLabel
                  id='autoSettingsAdTestSwitch'
                  className='toggle-btn'
                  control={
                    <Switch
                      name='ad_ldap'
                      checked={statusEnable.ad_ldap}
                      onChange={this.handleStatusChange}
                      color='primary' />
                  }
                  label={t('txt-switch')}
                  disabled={activeContent === 'viewMode'} />
              </div>
              <div className='group'>
                <TextField
                  id='autoSettingsAdIP'
                  name='ip'
                  label='IP'
                  variant='outlined'
                  fullWidth
                  size='small'
                  error={!formValidation.ip.valid}
                  helperText={formValidation.ip.valid ? '' : t('network-topology.txt-ipValidationFail')}
                  value={adData.ip}
                  onChange={this.handleADchange}
                  disabled={activeContent === 'viewMode'} />
              </div>
              <div className='group'>
                <TextField
                  id='autoSettingsAdPort'
                  name='port'
                  type='number'
                  label='Port'
                  variant='outlined'
                  fullWidth
                  size='small'
                  error={!formValidation.port.valid}
                  helperText={formValidation.port.valid ? '' : t('network-topology.txt-portValidationFail')}
                  InputProps={{ inputProps: { min: 1, max: 65535 } }}
                  value={adData.port}
                  onChange={this.handleADchange}
                  disabled={activeContent === 'viewMode'} />
              </div>
              <div className='group' style={{width: '50%'}}>
                <TextField
                  id='autoSettingsAdDomain'
                  name='domain'
                  label={t('txt-domain')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={adData.domain}
                  onChange={this.handleADchange}
                  disabled={activeContent === 'viewMode'} />
              </div>
              <div className='group' style={{width: '50%'}}>
                <TextField
                  id='autoSettingsAdUsername'
                  name='username'
                  label={t('auto-settings.txt-username')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={adData.username}
                  onChange={this.handleADchange}
                  disabled={activeContent === 'viewMode'} />
              </div>
              <div className='group' style={{width: '50%'}}>
                <TextField
                  id='autoSettingsAdPassword'
                  name='password'
                  type='password'
                  label={t('auto-settings.txt-password')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={adData.password}
                  onChange={this.handleADchange}
                  disabled={activeContent === 'viewMode'} />
              </div>
            </div>

            <div className='form-group normal' style={{display: 'none'}}>
              <header>{t('auto-settings.txt-netflow')}</header>
              <div className='form-options'>
                <Button id='autoSettingsHandleFlowTest' variant='contained' color='primary' onClick={this.handleNetflowtest} disabled={!statusEnable.netflow}>{t('network-inventory.txt-testQuery')}</Button>
                <FormControlLabel
                  id='autoSettingsNetFlowSwitch'
                  className='toggle-btn'
                  control={
                    <Switch
                      name='netflow'
                      checked={statusEnable.netflow}
                      onChange={this.handleStatusChange}
                      color='primary' />
                  }
                  label={t('txt-switch')}
                  disabled={activeContent === 'viewMode'} />
              </div>
              <div className='group'>
                <TextField
                  id='autoSettingsNetflowUpdateTime'
                  name='type'
                  label={t('txt-updateTime')}
                  select
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={netflowData.time}
                  disabled={activeContent === 'viewMode'}>
                  <MenuItem value={'24'}>{t('time-interval.txt-last24h')}</MenuItem>
                </TextField>
              </div>
            </div>

            {deviceList.length > 0 &&
              <div className='form-group normal'>
                <header>{t('auto-settings.txt-scanner')}</header>
                <div className='form-options'>
                  <FormControlLabel
                    id='autoSettingScannerSwitch'
                    className='toggle-btn'
                    control={
                      <Switch
                        name='networkTopology'
                        checked={statusEnable.networkTopology}
                        onChange={this.handleStatusChange}
                        color='primary' />
                    }
                    label={t('txt-switch')}
                    disabled={activeContent === 'viewMode'} />
                </div>
                <div className='group full multi'>
                  {activeContent === 'viewMode' && edgeData.length > 0 &&
                    <Button id='autoSettingsGenerateTopology' variant='contained' color='primary' className='generate-topo' onClick={this.handleNetworkTest.bind(this, 'generate')} disabled={!topoTriggerStatus}>{t('network-inventory.txt-generateTopology')}</Button>
                  }
                  <MultiInput
                    id='autoSettingsNetworkTopology'
                    className='edge-group'
                    base={Edge}
                    props={networkTopologyProps}
                    defaultItemValue={{
                      edge: '',
                      networkTopoData: {
                        target: [{
                          ip: '',
                          mask: ''
                        }],
                        switch: [{
                          ip: '',
                          mask: ''
                        }],
                      },
                      index: edgeData.length
                    }}
                    value={edgeData}
                    onChange={this.setEdgeData.bind(this, 'edge')}
                    disabled={activeContent === 'viewMode'} />
                </div>
              </div>
            }
          </div>

          {activeContent === 'editMode' &&
            <footer>
              <Button id='autoSettingsCancelSettings' variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</Button>
              <Button id='autoSettingsSaveSettings' variant='contained' color='primary' onClick={this.toggleContent.bind(this, 'save')}>{t('txt-save')}</Button>
            </footer>
          }
        </div>
      </div>
    )
  }
}

AutoSettings.contextType = BaseDataContext;

AutoSettings.propTypes = {
};

export default AutoSettings;