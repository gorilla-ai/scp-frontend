import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import DataTable from 'react-ui/build/src/components/table'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import RadioGroup from 'react-ui/build/src/components/radio-group'
import ToggleBtn from 'react-ui/build/src/components/toggle-button'

import {HocConfig as Config} from '../../common/configuration'
import {HocFloorMap as FloorMap} from '../../common/floor-map'
import helper from '../../common/helper'
import IpRange from './ip-range'
import Scanner from './scanner'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

/**
 * Network Topology Inventory Auto Settings
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to manage auto settings
 */
class AutoSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeContent: 'viewMode', //viewMode, editMode
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
      originalScannerData: [],
      scannerData: [{
        edge: '',
        ip: '',
        mask: ''
      }],
      scannerTableData: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.props;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.getSettingsInfo();
  }
  /**
   * Get and set auto settings data
   * @method
   */
  getSettingsInfo = () => {
    const {baseUrl, contextRoot} = this.props;
    const {statusEnable, ipRangeData, adData, netflowData, deviceList, scannerData} = this.state;

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
        let scannerData = [];
        tempStatusEnable.ipRange = data['ip.enable'];
        tempStatusEnable.ad_ldap = data['ad.enable'];
        tempStatusEnable.netflow = data['netflow.enable'];
        tempStatusEnable.scanner = data['scanner.enable'];

        let privateIParr = [];
        let publicIParr = [];

        if (data['ip.private'].range.length > 0) {
          _.forEach(data['ip.private'].range, val => {
            privateIParr = val.split('/');

            ipRangeData.push({
              type: 'private',
              ip: privateIParr[0],
              mask: privateIParr[1]
            });
          })
        }

        if (data['ip.public'].range.length > 0) {
          _.forEach(data['ip.public'].range, val => {
            publicIParr = val.split('/');

            ipRangeData.push({
              type: 'public',
              ip: publicIParr[0],
              mask: publicIParr[1]
            });
          })
        }

        tempADdata.type = data['ad.type'];
        tempADdata.ip = data['ad.host'];
        tempADdata.port = data['ad.port'];
        tempADdata.domain = data['ad.domain'];
        tempADdata.username = data['ad.username'];
        tempADdata.password = data['ad.password'];
        tempNetflowData.time = data['netflow.period.hr'];

        if (data.scanner.length > 0) {
          _.forEach(data.scanner, val => {
            scannerData.push({
              edge: val.edge,
              ip: val.target,
              mask: val.mask
            });
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
    const {baseUrl, contextRoot} = this.props;
    const {scannerData} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/ipdevice/edges`,
      type: 'GET'
    })
    .then(data => {
      if (data && data.length > 0) {
        const deviceList = _.map(data, val => {
          return {
            value: val.target,
            text: val.target
          };
        });

        let tempScannerData = scannerData;

        if (!scannerData[0].edge) {
          tempScannerData = [{
            edge: deviceList[0].value,
            ip: '',
            mask: ''
          }];
        }

        this.setState({
          deviceList,
          scannerData: tempScannerData
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
   * Set IP range data
   * @method
   * @param {array} scannerData - scanner data
   */
  setScannerData = (scannerData) => {
    this.setState({
      scannerData
    });
  }
  /**
   * Set status data
   * @method
   * @param {string} type - status type
   * @param {boolean} value - status data
   */
  handleStatusChange = (type, value) => {
    let tempStatusEnable = {...this.state.statusEnable};
    tempStatusEnable[type] = value;

    this.setState({
      statusEnable: tempStatusEnable
    });
  }
  /**
   * Handle AD/LDAP input value change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleADchange = (type, value) => {
    let tempADdata = {...this.state.adData};
    tempADdata[type] = value;

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
    const {baseUrl, contextRoot} = this.props;
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
        helper.showPopupMsg(t('network-inventory.auto-settings.txt-connectionsFail'), t('txt-error'));
      }
    })
    .catch(err => {
      helper.showPopupMsg(t('network-inventory.auto-settings.txt-connectionsFail'), t('txt-error'));
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
      return <span>{t('txt-notFound')}</span>
    }
  }
  /**
   * Get and test Netflow test result
   * @method
   */
  handleNetflowtest = () => {
    const {baseUrl, contextRoot} = this.props;
    const dateTime = {
      from: Moment(helper.getSubstractDate(24, 'hour')).utc().format('YYYY-MM-DDTHH:mm') + ':00Z',
      to: Moment().utc().format('YYYY-MM-DDTHH:mm') + ':00Z'
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
      return <span>{t('txt-notFound')}</span>
    }
  }
  /**
   * Get and set Scanner test result
   * @method
   */
  handleScannerTest = (value) => {
    const {baseUrl, contextRoot} = this.props;

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
      helper.showPopupMsg(t('network-inventory.auto-settings.txt-connectionsFail'), t('txt-error'));
    })
  }
  /**
   * Toggle content type
   * @method
   * @param {string} type - content type ('viewMode', 'editMode', 'save' or 'cancel')
   */
  toggleContent = (type) => {
    const {originalStatusEnable, originalIPrangeData, originalADdata, originalNetflowData, originalScannerData} = this.state;
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
        scannerData: _.cloneDeep(originalScannerData)
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
    const {baseUrl, contextRoot} = this.props;
    const {statusEnable, ipRangeData, adData, netflowData, scannerData} = this.state;
    const url = `${baseUrl}/api/ipdevice/config`;
    let requestData = {
      'ip.enable': statusEnable.ipRange,
      'ad.enable': statusEnable.ad_ldap,
      'netflow.enable': statusEnable.netflow,
      'scanner.enable': statusEnable.scanner,
    };
    let ipRangePrivate = [];
    let ipRangePublic = [];

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
    requestData.scanner = _.map(scannerData, val => {
      return {
        edge: val.edge,
        target: val.ip,
        mask: Number(val.mask)
      };
    });

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      if (data) {
        this.getSettingsInfo();
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'));
    });
  }
  /**
   * Get Back button position
   * @method
   * @param {string} type - button type
   * @returns width
   */
  getBtnPos = (type) => {
    const {locale} = this.props;

    if (type === 'back') {
      if (locale === 'zh') {
        return '88px';
      } else if (locale === 'en') {
        return '83px';
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
      scannerData
    } = this.state;
    const data = {
      activeContent,
      statusEnable,
      deviceList,
      handleScannerTest: this.handleScannerTest
    };
    const adFormTitle = adData.type === 'AD' ? t('network-inventory.auto-settings.txt-AD') : t('network-inventory.auto-settings.txt-LDAP');

    return (
      <div className='parent-content'>
        <div className='main-content basic-form'>
          <header className='main-header'>{t('network-inventory.txt-autoSettings')}</header>
          {activeContent === 'viewMode' &&
            <div>
              <button className='standard btn last' onClick={this.toggleContent.bind(this, 'editMode')}>{t('txt-edit')}</button>
              <button className='standard btn no-padding' style={{right: this.getBtnPos('back')}}>
                <Link to={{pathname: '/ChewbaccaWeb/configuration/topology/inventory', state: 'tableList'}}>{t('txt-back')}</Link>
              </button>
            </div>
          }
          <div className='form-group normal'>
            <header>{t('network-inventory.auto-settings.txt-ipRange')}</header>
            <ToggleBtn
              className='toggle-btn'
              onText='On'
              offText='Off'
              on={statusEnable.ipRange}
              onChange={this.handleStatusChange.bind(this, 'ipRange')}
              disabled={activeContent === 'viewMode'} />
            <div className='group full multi'>
              <label id='ipRangeLabel' htmlFor='autoSettingsIpRange'>
                <span>Type</span>
                <span>IP</span>
                <span>Mask</span>
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
                onChange={this.setIpRangeData}
                value={ipRangeData} />
            </div>
          </div>
          <div className='form-group normal short'>
            <header>{adFormTitle}</header>
            <RadioGroup
              id='autoSettingsAD'
              className='radio-group'              
              list={[
                {value: 'AD', text: t('network-inventory.auto-settings.txt-AD')},
                {value: 'LDAP', text: t('network-inventory.auto-settings.txt-LDAP')}
              ]}
              onChange={this.handleADchange.bind(this, 'type')}
              value={adData.type}
              disabled={activeContent === 'viewMode' || !statusEnable.ad_ldap} />
            <button className='last' style={{right: '85px'}} onClick={this.handleADtest} disabled={!statusEnable.ad_ldap}>{t('network-inventory.txt-testQuery')}</button>
            <ToggleBtn
              className='toggle-btn'
              onText='On'
              offText='Off'
              on={statusEnable.ad_ldap}
              onChange={this.handleStatusChange.bind(this, 'ad_ldap')}
              disabled={activeContent === 'viewMode'} />
            <div className='group'>
              <label htmlFor='autoSettingsIP'>IP</label>
              <Input
                id='autoSettingsIP'
                onChange={this.handleADchange.bind(this, 'ip')}
                value={adData.ip}
                readOnly={activeContent === 'viewMode' || !statusEnable.ad_ldap} />
            </div>
            <div className='group'>
              <label htmlFor='autoSettingsPort'>Port</label>
              <Input
                id='autoSettingsPort'
                onChange={this.handleADchange.bind(this, 'port')}
                value={adData.port}
                readOnly={activeContent === 'viewMode' || !statusEnable.ad_ldap} />
            </div>
            <div className='group' style={{width: '50%'}}>
              <label htmlFor='autoSettingsDomain'>Domain</label>
              <Input
                id='autoSettingsDomain'
                onChange={this.handleADchange.bind(this, 'domain')}
                value={adData.domain}
                readOnly={activeContent === 'viewMode' || !statusEnable.ad_ldap} />
            </div>
            <div className='group' style={{width: '50%'}}>
              <label htmlFor='autoSettingsUsername'>Username</label>
              <Input
                id='autoSettingsUsername'
                onChange={this.handleADchange.bind(this, 'username')}
                value={adData.username}
                readOnly={activeContent === 'viewMode' || !statusEnable.ad_ldap} />
            </div>
            <div className='group' style={{width: '50%'}}>
              <label htmlFor='autoSettingsPassword'>Password</label>
              <Input
                id='autoSettingsPassword'
                type='password'
                onChange={this.handleADchange.bind(this, 'password')}
                value={adData.password}
                readOnly={activeContent === 'viewMode' || !statusEnable.ad_ldap} />
            </div>
          </div>

          <div className='form-group normal'>
            <header>{t('network-inventory.auto-settings.txt-netflow')}</header>
            <button className='last' style={{right: '85px'}} onClick={this.handleNetflowtest} disabled={!statusEnable.netflow}>{t('network-inventory.txt-testQuery')}</button>
            <ToggleBtn
              className='toggle-btn'
              onText='On'
              offText='Off'
              on={statusEnable.netflow}
              onChange={this.handleStatusChange.bind(this, 'netflow')}
              disabled={activeContent === 'viewMode'} />
            <div className='group'>
              <label htmlFor='autoSettingsNetflow'>{t('txt-updateTime')}</label>
              <DropDownList
                id='autoSettingsNetflow'
                required={true}
                list={[
                  {value: '24', text: t('events.connections.txt-last24h')}
                ]}
                value={netflowData.time}
                readOnly={activeContent === 'viewMode' || !statusEnable.netflow} />
            </div>
          </div>

          {deviceList.length > 0 &&
            <div className='form-group normal'>
              <header>{t('network-inventory.auto-settings.txt-scanner')}</header>
              <ToggleBtn
                className='toggle-btn'
                onText='On'
                offText='Off'
                on={statusEnable.scanner}
                onChange={this.handleStatusChange.bind(this, 'scanner')}
                disabled={activeContent === 'viewMode'} />
              <div className='group full multi'>
                <label id='scannerLabel' htmlFor='autoSettingsScanner'>
                  <span>Edge</span>
                  <span>IP</span>
                  <span>Mask</span>
                </label>
                <MultiInput
                  id='autoSettingsScanner'
                  className='scanner-group'
                  base={Scanner}
                  props={data}
                  defaultItemValue={{
                    edge: deviceList[0].value,
                    ip: '',
                    mask: ''
                  }}
                  onChange={this.setScannerData}
                  handleScannertest={this.handleScannerTest}
                  value={scannerData} />
              </div>
            </div>
          }

          {activeContent === 'editMode' &&
            <footer className='no-fixed'>
              <button className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</button>
              <button onClick={this.toggleContent.bind(this, 'save')}>{t('txt-save')}</button>
            </footer>
          }
        </div>
      </div>
    )
  }
}

AutoSettings.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  sessionRights: PropTypes.object.isRequired
};

const HocAutoSettings = withLocale(AutoSettings);
export { AutoSettings, HocAutoSettings };