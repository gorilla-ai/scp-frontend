import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import {ReactMultiEmail} from 'react-multi-email';

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
      scanFiles: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.getScanFile();
  }
  /**
   * Get and set scan file data
   * @method
   */
  getScanFile = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/common/config?configId=hmd.scanFile.path`,
      type: 'GET'
    })
    .then(data => {
      if (data && data.value) {
        const scanFiles = data.value.split(',');

        this.setState({
          activeContent: 'viewMode',
          originalScanFiles: _.cloneDeep(scanFiles),
          scanFiles
        });
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
    const {originalScanFiles} = this.state;
    let showPage = type;

    if (type === 'save') {
      if (this.validateScanFilesPath()) {
        this.handleScanFilesConfirm();
      } else {
        helper.showPopupMsg(t('network-inventory.txt-pathFormatError'), t('txt-error'));
      }
      return;
    } else if (type === 'cancel') {
      showPage = 'viewMode';

      this.setState({
        scanFiles: _.cloneDeep(originalScanFiles)
      });
    }

    this.setState({
      activeContent: showPage
    });
  }
  /**
   * Validate scan files input
   * @method
   */
  validateScanFilesPath = () => {
    const {scanFiles} = this.state;
    let valid = true;

    _.forEach(scanFiles, val => {
      if (val.indexOf('/') > 0) { //Slash is not allowed
        valid = false;
      }

      if (val[val.length - 1] !== '\\') { //Path has to end with '\'
        valid = false;
      }
    })

    return valid;
  }
  /**
   * Handle scan files confirm
   * @method
   */
  handleScanFilesConfirm = () => {
    const {baseUrl} = this.context;
    const {scanFiles} = this.state;
    const url = `${baseUrl}/api/common/config`;
    const requestData = {
      configId: 'hmd.scanFile.path',
      value: scanFiles.join()
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.getScanFile();
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
  render() {
    const {activeContent, scanFiles} = this.state;

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

          <div className='hmd-settings' style={{'height': activeContent === 'viewMode' ? '78vh' : '70vh'}}>
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
                    validateEmail={path => {
                      return path;
                    }}
                    onChange={this.handleScanFilesChange}
                    getLabel={this.getLabel} />
                }
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