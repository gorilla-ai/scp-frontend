import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';

import DataTable from 'react-ui/build/src/components/table'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import Edge from './edge'
import FloorMap from '../../common/floor-map'
import helper from '../../common/helper'
import IpRange from './ip-range'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

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
      originalStatusEnable: {},
      statusEnable: {
        ipRange: true,
        ad_ldap: true,
        netflow: true,
        scanner: true
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
        edge: ''
      }],
      originalScannerData: [],
      scannerData: {
        target: [{
          ip: '',
          mask: ''
        }],
        switch: [{
          ip: '',
          mask: ''
        }]
      },
      scannerTableData: [],
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
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.getSettingsInfo();
  }
  /**
   * Get and set auto settings data
   * @method
   */
  getSettingsInfo = () => {
    const {baseUrl} = this.context;
    const {statusEnable, ipRangeData, adData, netflowData, deviceList, edgeData, scannerData} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/ipdevice/config`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        data = data.value;
        let tempStatusEnable = {...statusEnable};
        let ipRangeData = [];
        let tempADdata = {...adData};
        let tempNetflowData = {...netflowData};
        let edgeData = [];
        let scannerData = {};
        tempStatusEnable.ipRange = data['ip.enable'];
        tempStatusEnable.ad_ldap = data['ad.enable'];
        tempStatusEnable.netflow = data['netflow.enable'];
        tempStatusEnable.scanner = data['networktopology.enable'];

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

        if (data.scanner && data.scanner.length > 0) {
          _.forEach(data.scanner, val => {
            // scannerData.push({
            //   ip: val.target,
            //   mask: val.mask
            // });
          })
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
          originalEdgeData: _.cloneDeep(edgeData),
          edgeData,
          originalScannerData: _.cloneDeep(scannerData),
          scannerData
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
      if (data && data.length > 0) {
        const deviceList = _.map(data, (val, i) => {
          return <MenuItem key={i} value={val.target}>{val.name}</MenuItem>
        });

        this.setState({
          deviceList
        });
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
   * @param {array} edgeData - edge data
   */
  setEdgeData = (edgeData) => {
    this.setState({
      edgeData
    });
  }
  /**
   * Set IP range data
   * @method
   * @param {array} scannerData - scanner data
   */
  setScannerData = (type, scannerData) => {
    let tempScannerData = {...this.state.scannerData};
    tempScannerData[type] = scannerData;

    this.setState({
      scannerData: tempScannerData
    });
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
      if (data) {
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
      if (data) {
        data = data.rows;

        this.setState({
          netFlowTableData: data
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
   * Display Scanner test query content
   * @method
   * @returns HTML DOM
   */
  getScannerTestContent = () => {
    const {scannerTableData} = this.state;

    if (scannerTableData.length > 0) {
      return (
        <DataTable
          className='main-table'
          fields={{
            ip: { label: t('ipFields.ip'), sortable: true },
            mac: { label: t('ipFields.mac'), sortable: true },
            hostName: { label: t('ipFields.hostName'), sortable: true }
          }}
          data={scannerTableData}
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
   * Get and set Scanner test result
   * @param {object} value - scanner test info
   * @method
   */
  handleScannerTest = (value) => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/u1/ipdevice/_scan?edge=${value.edge}&target=${value.ip}&mask=${value.mask}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        this.setState({
          scannerTableData: data
        }, () => {
          PopupDialog.alert({
            id: 'modalWindowSmall',
            confirmText: t('txt-close'),
            display: this.getScannerTestContent()
          });
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg(t('auto-settings.txt-connectionsFail'), t('txt-error'));
    })
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
      originalEdgeData,
      originalScannerData
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
        scannerData: _.cloneDeep(originalScannerData),
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
    const {statusEnable, ipRangeData, adData, netflowData, edgeData, scannerData, formValidation} = this.state;
    const url = `${baseUrl}/api/ipdevice/config`;
    const ipPattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    let requestData = {
      'ip.enable': statusEnable.ipRange,
      'ad.enable': statusEnable.ad_ldap,
      'netflow.enable': statusEnable.netflow,
      'networktopology.enable': statusEnable.scanner
    };
    let ipRangePrivate = [];
    let ipRangePublic = [];
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (adData.ip) {
      if (ipPattern.test(adData.ip)) { //Check IP format
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
    // requestData.scanner = _.map(scannerData, val => {
    //   return {
    //     edge: val.edge,
    //     target: val.ip,
    //     mask: val.mask ? Number(val.mask) : ''
    //   };
    // });

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.getSettingsInfo();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getInputWidth = (type) => {
    const {activeContent} = this.state;

    if (type === 'ipRange') {
      if (activeContent === 'viewMode') {
        return '32%';
      } else if (activeContent === 'editMode') {
        return '30%';
      }
    }

    if (type === 'scanner') {
      if (activeContent === 'viewMode') {
        return '28%';
      } else if (activeContent === 'editMode') {
        return '50%';
      }
    }
  }
  render() {
    const {
      activeContent,
      statusEnable,
      ipRangeData,
      adData,
      netflowData,
      deviceList,
      edgeData,
      scannerData,
      formValidation
    } = this.state;
    const data = {
      activeContent,
      statusEnable,
      deviceList,
      scannerData,
      getInputWidth: this.getInputWidth,
      handleScannerTest: this.handleScannerTest,
      setScannerData: this.setScannerData
    };
    const adFormTitle = adData.type === 'AD' ? t('auto-settings.txt-AD') : t('auto-settings.txt-LDAP');

    return (
      <div className='parent-content'>
        <div className='main-content basic-form'>
          <header className='main-header'>{t('network-inventory.txt-autoSettings')}</header>

          {activeContent === 'viewMode' &&
            <div className='content-header-btns'>
              <Button variant='outlined' color='primary' className='standard btn no-padding'>
                <Link to={{pathname: '/SCP/configuration/topology/inventory', state: 'tableList'}}>{t('txt-back')}</Link>
              </Button>
              <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode')}>{t('txt-edit')}</Button>
            </div>
          }

          <div className='auto-settings' style={{height: activeContent === 'viewMode' ? '78vh' : '70vh'}}>
            <div className='form-group normal'>
              <header>{t('auto-settings.txt-ipRange')}</header>
              <div className='form-options'>
                <FormControlLabel
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
                  props={data}
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
                      className='radio-ui'
                      color='primary' />
                  }
                  label={t('auto-settings.txt-AD')}
                  disabled={activeContent === 'viewMode'} />
                <FormControlLabel
                  value='LDAP'
                  control={
                    <Radio
                      className='radio-ui'
                      color='primary' />
                  }
                  label={t('auto-settings.txt-LDAP')}
                  disabled={activeContent === 'viewMode'} />
              </RadioGroup>
              <div className='form-options'>
                <Button variant='contained' color='primary' onClick={this.handleADtest} disabled={!statusEnable.ad_ldap}>{t('network-inventory.txt-testQuery')}</Button>
                <FormControlLabel
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
                  id='autoSettingsIP'
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
                  id='autoSettingsPort'
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
                  id='autoSettingsDomain'
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
                  id='autoSettingsUsername'
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
                  id='autoSettingsPassword'
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
                <Button variant='contained' color='primary' onClick={this.handleNetflowtest} disabled={!statusEnable.netflow}>{t('network-inventory.txt-testQuery')}</Button>
                <FormControlLabel
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
                  id='autoSettingsNetflow'
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
                    className='toggle-btn'
                    control={
                      <Switch
                        name='scanner'
                        checked={statusEnable.scanner}
                        onChange={this.handleStatusChange}
                        color='primary' />
                    }
                    label={t('txt-switch')}
                    disabled={activeContent === 'viewMode'} />
                </div>
                <div className='group full multi'>
                  <MultiInput
                    id='autoSettingsEdge'
                    className='edge-group'
                    base={Edge}
                    props={data}
                    defaultItemValue={{
                      edge: ''
                    }}
                    value={edgeData}
                    onChange={this.setEdgeData}
                    disabled={activeContent === 'viewMode'} />
                </div>
              </div>
            }
          </div>

          {activeContent === 'editMode' &&
            <footer>
              <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</Button>
              <Button variant='contained' color='primary' onClick={this.toggleContent.bind(this, 'save')}>{t('txt-save')}</Button>
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