import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Tabs from 'react-ui/build/src/components/tabs'
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
        ad: true,
        netflow: true,
        scanner: true
      },
      ipRangeData: [{
        type: 'private',
        ip: '',
        mask: ''
      }],
      scannerData: [{
        edge: '192.168.0.203',
        ip: '',
        mask: ''
      }]
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
  }
  test = () => {

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
  handleStatusChange = (type, value) => {
    let tempStatusEnable = {...this.state.statusEnable};
    tempStatusEnable[type] = value;

    this.setState({
      statusEnable: tempStatusEnable
    });
  }
  render() {
    const {baseUrl, contextRoot} = this.props;
    const {statusEnable, ipRangeData, scannerData} = this.state;
    let data = {
      statusEnable
    };

    return (
      <div className='parent-content'>
        <div className='main-content basic-form'>
          <header className='main-header'>{t('network-inventory.txt-autoSettings')}</header>
          <div className='form-group normal'>
            <header>{t('network-inventory.auto-settings.txt-ipRange')}</header>
            <button className='last' style={{right: '85px'}}>Test Query</button>
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
                <span>Type</span>
                <span>IP</span>
                <span>Mask</span>
              </label>
              <MultiInput
                id='autoSettingsScanner'
                className='scanner-group'
                base={Scanner}
                props={data}
                defaultItemValue={{
                  edge: '192.168.0.203',
                  ip: '',
                  mask: ''
                }}
                onChange={this.setScannerData}
                value={scannerData} />
            </div>
          </div>
          <footer className='no-fixed'>
            <button className='standard' onClick={this.props.toggleContent.bind(this, 'showList')}>{t('txt-cancel')}</button>
            <button>{t('txt-save')}</button>
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