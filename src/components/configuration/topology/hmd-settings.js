import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import {ReactMultiEmail} from 'react-multi-email';

import RadioGroup from 'react-ui/build/src/components/radio-group'

import {BaseDataContext} from '../../common/context';
import helper from '../../common/helper'

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
      scanFiles: [],
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
          const scanFiles = data[0].value.split(',');

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
   * Handle scan files confirm
   * @method
   */
  handleScanFilesConfirm = () => {
    const {baseUrl} = this.context;
    const {scanFiles, gcbVersion} = this.state;
    const scanType = [
      {
        type: 'hmd.scanFile.path',
        value: scanFiles.join()
      },
      {
        type: 'hmd.gcb.version',
        value: gcbVersion
      }
    ];
    const url = `${baseUrl}/api/common/config`;
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
   * Handle scan files input change
   * @method
   * @param {array} newScanFilesPath - new scan files path list
   */
  handleScanFilesChange = (newScanFilesPath) => {
    this.setState({
      scanFiles: newScanFilesPath
    });
  }
  /**
   * Display individual scan file
   * @method
   * @param {string} val - scan file value
   * @param {string} i - index of the scan files array
   * @returns HTML DOM
   */
  displayScanFile = (val, i) => {
    return <span key={i}>{val}</span>
  }
  /**
   * Handle file scan path delete
   * @method
   * @param {function} removePath - function to remove path
   * @param {number} index - index of the emails list array
   */
  deleteFileScanPath = (removePath, index) => {
    removePath(index);
  }
  /**
   * Validate scan files input
   * @method
   * @param {function} path - path from user's input
   */
  validatePathInput = (path) => {
    let valid = true;

    if (path.indexOf('/') > 0) { //Slash is not allowed
      valid = false;
    }

    if (path[path.length - 1] !== '\\') { //Path has to end with '\\'
      valid = false;
    }

    if (valid) {
      return path;
    } else {
      helper.showPopupMsg(t('network-inventory.txt-pathFormatError'), t('txt-error'));
    }
  }
  /**
   * Handle file scan path delete
   * @method
   * @param {string} path - individual file scan path
   * @param {number} index - index of the file scan path list array
   * @param {function} removePath - function to remove file scan path
   * @returns HTML DOM
   */
  getLabel = (path, index, removePath) => {
    return (
      <div data-tag key={index}>
        {path}
        <span data-tag-handle onClick={this.deleteFileScanPath.bind(this, removePath, index)}> <span className='font-bold'>x</span></span>
      </div>
    )
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
                  <ReactMultiEmail
                    emails={scanFiles}
                    validateEmail={this.validatePathInput.bind(this)}
                    onChange={this.handleScanFilesChange}
                    getLabel={this.getLabel} />
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