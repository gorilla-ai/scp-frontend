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
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import RadioGroup from 'react-ui/build/src/components/radio-group'
import ToggleBtn from 'react-ui/build/src/components/toggle-button'

import {HocFloorMap as FloorMap} from '../../common/floor-map'
import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'
import {HocConfig as Config} from '../../common/configuration'
import IpRange from './ip-range'
import Scanner from './scanner'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

class AutoSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      statusEnable: {
        ipRange: true,
        ad_ldap: true,
        netflow: true,
        scanner: true
      },
      ipRangeData: [{
        type: 'private',
        ip: '',
        mask: ''
      }],
      adData: {
        type: 'AD', //AD, LDAP
        ip: '',
        port: '',
        domain: '',
        username: '',
        password: ''
      },
      adTableData: [],
      netflowData: {
        time: '24'
      },
      netFlowTableData: [],
      deviceList: [],
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
    this.getDeviceList();
  }
  test = () => {

  }
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
          return {value: val.target, text: val.target}
        });

        let tempScannerData = {...scannerData};
        tempScannerData[0].edge = deviceList[0].value;

        this.setState({
          deviceList
        });
      }
      return null;
    })
  }
  setIpRangeData = (ipRangeData) => {
    this.setState({
      ipRangeData
    });
  }
  setScannerData = (scannerData) => {
    this.setState({
      scannerData
    });
  }
  toggleADdata = (value) => {
    let tempADdata = {...this.state.adData};
    tempADdata.type = value;

    this.setState({
      adData: tempADdata
    });
  }
  handleStatusChange = (type, value) => {
    let tempStatusEnable = {...this.state.statusEnable};
    tempStatusEnable[type] = value;

    this.setState({
      statusEnable: tempStatusEnable
    });
  }
  handleDataChange = (type, field, value) => {
    let tempADdata = {...this.state.adData};
    let tempLDAPdata = {...this.state.ldapData};

    if (type === 'ad') {
      tempADdata[field] = value;

      this.setState({
        adData: tempADdata
      });
    } else if (type === 'ldap') {
      tempLDAPdata[field] = value;

      this.setState({
        ldapData: tempLDAPdata
      });
    }
  }
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
      return (
        <span>{t('txt-notFound')}</span>
      )
    }
  }
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
      return (
        <span>{t('txt-notFound')}</span>
      )
    }
  }
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
  }
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
      return (
        <span>{t('txt-notFound')}</span>
      )
    }
  }
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
  handleSettingsConfirm = () => {
    const {baseUrl, contextRoot} = this.props;
    const {statusEnable, ipRangeData, adData, ldapData, netflowData, scannerData} = this.state;
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
      }
    });

    //console.log(requestData);


    // helper.getAjaxData('POST', url, requestData)
    // .then(data => {
    //   if (data) {

    //   }
    // })
    // .catch(err => {
    //   helper.showPopupMsg('', t('txt-error'));
    // });
  }
  render() {
    const {statusEnable, ipRangeData, adData, ldapData, netflowData, deviceList, scannerData} = this.state;
    const data = {
      statusEnable,
      deviceList,
      handleScannerTest: this.handleScannerTest
    };
    const adFormTitle = adData.type === 'AD' ? t('network-inventory.auto-settings.txt-AD') : t('network-inventory.auto-settings.txt-LDAP');

    return (
      <div className='parent-content'>
        <div className='main-content basic-form'>
          <header className='main-header'>{t('network-inventory.txt-autoSettings')}</header>
          <div className='form-group normal'>
            <header>{t('network-inventory.auto-settings.txt-ipRange')}</header>
            <ToggleBtn
              className='toggle-btn'
              onText='On'
              offText='Off'
              on={statusEnable.ipRange}
              onChange={this.handleStatusChange.bind(this, 'ipRange')} />
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
              onChange={this.toggleADdata}
              value={adData.type}
              disabled={!statusEnable.ad_ldap} />
            <button className='last' style={{right: '85px'}} onClick={this.handleADtest} disabled={!statusEnable.ad_ldap}>Test Query</button>
            <ToggleBtn
              className='toggle-btn'
              onText='On'
              offText='Off'
              on={statusEnable.ad_ldap}
              onChange={this.handleStatusChange.bind(this, 'ad_ldap')} />
            <div className='group'>
              <label htmlFor='autoSettingsIP'>IP</label>
              <Input
                id='autoSettingsIP'
                onChange={this.handleDataChange.bind(this, 'ad', 'ip')}
                value={adData.ip}
                readOnly={!statusEnable.ad_ldap} />
            </div>
            <div className='group'>
              <label htmlFor='autoSettingsPort'>Port</label>
              <Input
                id='autoSettingsPort'
                onChange={this.handleDataChange.bind(this, 'ad', 'port')}
                value={adData.port}
                readOnly={!statusEnable.ad_ldap} />
            </div>
            <div className='group' style={{width: '50%'}}>
              <label htmlFor='autoSettingsDomain'>Domain</label>
              <Input
                id='autoSettingsDomain'
                onChange={this.handleDataChange.bind(this, 'ad', 'domain')}
                value={adData.domain}
                readOnly={!statusEnable.ad_ldap} />
            </div>
            <div className='group' style={{width: '50%'}}>
              <label htmlFor='autoSettingsUsername'>Username</label>
              <Input
                id='autoSettingsUsername'
                onChange={this.handleDataChange.bind(this, 'ad', 'username')}
                value={adData.username}
                readOnly={!statusEnable.ad_ldap} />
            </div>
            <div className='group' style={{width: '50%'}}>
              <label htmlFor='autoSettingsPassword'>Password</label>
              <Input
                id='autoSettingsPassword'
                type='password'
                onChange={this.handleDataChange.bind(this, 'ad', 'password')}
                value={adData.password}
                readOnly={!statusEnable.ad_ldap} />
            </div>
          </div>

          <div className='form-group normal'>
            <header>{t('network-inventory.auto-settings.txt-netflow')}</header>
            <button className='last' style={{right: '85px'}} onClick={this.handleNetflowtest} disabled={!statusEnable.netflow}>Test Query</button>
            <ToggleBtn
              className='toggle-btn'
              onText='On'
              offText='Off'
              on={statusEnable.netflow}
              onChange={this.handleStatusChange.bind(this, 'netflow')} />
            <div className='group'>
              <label htmlFor='autoSettingsNetflow'>{t('honeynet.txt-updateTime')}</label>
              <DropDownList
                id='autoSettingsNetflow'
                required={true}
                onChange={this.handleDataChange.bind(this, 'edge')}
                list={[
                  {value: '24', text: t('network.connections.txt-last24h')}
                ]}
                value={netflowData.time}
                disabled={!statusEnable.netflow} />
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
                onChange={this.handleStatusChange.bind(this, 'scanner')} />
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

          <footer className='no-fixed'>
            <button className='standard' onClick={this.props.toggleContent.bind(this, 'showList')}>{t('txt-cancel')}</button>
            <button onClick={this.handleSettingsConfirm}>{t('txt-save')}</button>
          </footer>
        </div>
      </div>
    )
  }
}

AutoSettings.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

const HocAutoSettings = withLocale(AutoSettings);
export { AutoSettings, HocAutoSettings };