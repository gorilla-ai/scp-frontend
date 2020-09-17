import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import RadioGroup from 'react-ui/build/src/components/radio-group'

import {BaseDataContext} from '../../common/context';
import helper from '../../common/helper'
import InputPath from '../../common/input-path'
import MultiInput from 'react-ui/build/src/components/multi-input'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

/**
 * Network Topology Inventory HMD Settings
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to manage auto settings
 */
class HMDsettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeContent: 'viewMode', //viewMode, editMode
      originalScanFiles: [],
      scanFiles: [{
        path: ''
      }],
      originalGcbVersion: '',
      gcbVersion: ''
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
   * Get and set HMD settings data
   * @method
   */
  getSettingsInfo = () => {
    const {baseUrl} = this.context;
    const scanType = ['hmd.scanFile.path', 'hmd.gcb.version'];
    let apiArr = [];

    _.forEach(scanType, val => {
      apiArr.push({
        url: `${baseUrl}/api/common/config?configId=${val}`,
        type: 'GET'
      });
    })  

    this.ah.all(apiArr)
    .then(data => {
      if (data) {
        if (data[0] && data[0].value) {
          const scanData = data[0].value.split(',');
          let scanFiles = [];

          _.forEach(scanData, val => {
            if (val) {
              scanFiles.push({
                path: val
              });
            }
          })

          this.setState({
            activeContent: 'viewMode',
            originalScanFiles: _.cloneDeep(scanFiles),
            scanFiles
          });
        }

        if (data[1] && data[1].value) {
          this.setState({
            originalGcbVersion: _.cloneDeep(data[1].value),
            gcbVersion: data[1].value
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
   * Toggle content type
   * @method
   * @param {string} type - content type ('editMode', 'save' or 'cancel')
   */
  toggleContent = (type) => {
    const {originalScanFiles, originalGcbVersion} = this.state;
    let showPage = type;

    if (type === 'save') {
      this.handleScanFilesConfirm();
      return;
    } else if (type === 'cancel') {
      showPage = 'viewMode';

      this.setState({
        scanFiles: _.cloneDeep(originalScanFiles),
        gcbVersion: _.cloneDeep(originalGcbVersion)
      });
    }

    this.setState({
      activeContent: showPage
    });
  }
  /**
   * Display individual scan file
   * @method
   * @param {object} val - scan file object
   * @param {string} i - index of the scan files array
   * @returns HTML DOM
   */
  displayScanFile = (val, i) => {
    return <span key={i}>{val.path}</span>
  }
  /**
   * Set path data
   * @method
   * @param {array} pathData - path data to be set
   */
  setScanFiles = (pathData) => {
    let tempScanFiles = {...this.state.scanFiles};
    tempScanFiles = pathData;

    this.setState({
      scanFiles: tempScanFiles
    });
  }
  /**
   * Handle scan files confirm
   * @method
   */
  handleScanFilesConfirm = () => {
    const {baseUrl} = this.context;
    const {scanFiles, gcbVersion} = this.state;
    const url = `${baseUrl}/api/common/config`;
    let parsedScanFiles = [];

    _.forEach(scanFiles, val => {
      if (val.path) {
        parsedScanFiles.push(val.path);
      }
    });

    const scanType = [
      {
        type: 'hmd.scanFile.path',
        value: parsedScanFiles.join()
      },
      {
        type: 'hmd.gcb.version',
        value: gcbVersion
      }
    ];
    let apiArr = [];

    _.forEach(scanType, val => {
      const requestData = {
        configId: val.type,
        value: val.value
      };

      apiArr.push({
        url,
        data: JSON.stringify(requestData),
        type: 'POST',
        contentType: 'text/plain'
      });
    })

    this.ah.all(apiArr)
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
  /**
   * Handle GCB version change
   * @method
   * @param {string} gcbVersion - GCB version ('TW' or 'US')
   */
  handleGcbVersionChange = (gcbVersion) => {
    this.setState({
      gcbVersion
    });
  }
  render() {
    const {activeContent, scanFiles, gcbVersion} = this.state;

    return (
      <div className='parent-content'>
        <div className='main-content basic-form'>
          <header className='main-header'>{t('network-inventory.txt-hmdSettings')}</header>

          {activeContent === 'viewMode' &&
            <div className='content-header-btns'>
              <button className='standard btn no-padding'>
                <Link to={{pathname: '/SCP/configuration/topology/inventory', state: 'tableList'}}>{t('txt-back')}</Link>
              </button>
              <button className='standard btn' onClick={this.toggleContent.bind(this, 'editMode')}>{t('txt-edit')}</button>
            </div>
          }

          <div className='hmd-settings' style={{height: activeContent === 'viewMode' ? '70vh' : '70vh'}}>
            <div className='form-group normal long'>
              <header>{t('network-inventory.scan-list.txt-scanFile')}</header>
              <div className='group'>
                <label>{t('network-inventory.txt-includePath')}</label>
                {activeContent === 'viewMode' && scanFiles.length > 0 &&
                  <div className='flex-item'>{scanFiles.map(this.displayScanFile)}</div>
                }
                {activeContent === 'editMode' &&
                  <MultiInput
                    className='file-path'
                    base={InputPath}
                    inline={true}
                    value={scanFiles}
                    onChange={this.setScanFiles} />
                }
              </div>
            </div>
            <div className='form-group normal long'>
              <header>{t('network-inventory.scan-list.txt-gcb')}</header>
              <div className='group'>
                <label>{t('network-inventory.txt-gcbVersion')}</label>
                <RadioGroup
                  className='radio-group'
                  list={[
                    {value: 'TW', text: 'TW'},
                    {value: 'US', text: 'US'}
                  ]}
                  value={gcbVersion}
                  onChange={this.handleGcbVersionChange}
                  disabled={activeContent === 'viewMode'} />
              </div>
            </div>
          </div>

          {activeContent === 'editMode' &&
            <footer>
              <button className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</button>
              <button onClick={this.toggleContent.bind(this, 'save')}>{t('txt-save')}</button>
            </footer>
          }
        </div>
      </div>
    )
  }
}

HMDsettings.contextType = BaseDataContext;

HMDsettings.propTypes = {
};

export default HMDsettings;