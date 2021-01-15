import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'

import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';

import {BaseDataContext} from '../../common/context';
import helper from '../../common/helper'
import InputPath from '../../common/input-path'
import MultiInput from 'react-ui/build/src/components/multi-input'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const MALWARE_DETECTION = ['includePath', 'excludePath'];

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
      scanFiles: {
        includePath: [{
          path: ''
        }],
        excludePath: [{
          path: ''
        }]
      },
      originalGcbVersion: '',
      gcbVersion: '',
      originalPmInterval: '',
      pmInterval: 1
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
    const scanType = ['hmd.scanFile.path', 'hmd.scanFile.exclude.path', 'hmd.gcb.version', 'hmd.setProcessWhiteList._MonitorSec'];
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
        if (!_.isEmpty(data[0]) && !_.isEmpty(data[1])) {
          const scanIncludePath = data[0].value.split(',');
          const scanExcludePath = data[1].value.split(',');
          let scanFiles = {
            includePath: [],
            excludePath: []
          };

          _.forEach(scanIncludePath, val => {
            if (val) {
              scanFiles.includePath.push({
                path: val
              });
            }
          })

          _.forEach(scanExcludePath, val => {
            if (val) {
              scanFiles.excludePath.push({
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

        if (data[2] && data[2].value) {
          this.setState({
            originalGcbVersion: _.cloneDeep(data[2].value),
            gcbVersion: data[2].value
          });
        }

        if (data[3] && data[3].value) {
          this.setState({
            originalPmInterval: _.cloneDeep(data[3].value),
            pmInterval: Number(data[3].value)
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
    const {originalScanFiles, originalGcbVersion, originalPmInterval} = this.state;
    let showPage = type;

    if (type === 'save') {
      this.handleScanFilesConfirm();
      return;
    } else if (type === 'cancel') {
      showPage = 'viewMode';

      this.setState({
        scanFiles: _.cloneDeep(originalScanFiles),
        gcbVersion: _.cloneDeep(originalGcbVersion),
        pmInterval: _.cloneDeep(originalPmInterval)
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
   * @param {string} type - path type ('includePath' or 'excludePath')
   * @param {array} pathData - path data to be set
   */
  setScanFiles = (type, pathData) => {
    let tempScanFiles = {...this.state.scanFiles};
    tempScanFiles[type] = pathData;

    this.setState({
      scanFiles: tempScanFiles
    });
  }
  /**
   * Show Malware Detection path
   * @method
   * @param {string} val - malware detection list
   * @param {string} i - index of the  malware detection list
   * @returns HTML DOM
   */
  showMalwarePath = (val, i) => {
    const {activeContent, scanFiles} = this.state;

    return (
      <div key={i} className='group'>
        <label>{t('network-inventory.txt-' + val)}</label>
        {activeContent === 'viewMode' && scanFiles[val].length > 0 &&
          <div className='flex-item'>{scanFiles[val].map(this.displayScanFile)}</div>
        }
        {activeContent === 'editMode' &&
          <MultiInput
            className='file-path'
            base={InputPath}
            inline={true}
            value={scanFiles[val]}
            onChange={this.setScanFiles.bind(this, val)} />
        }
      </div>
    )
  }
  /**
   * Handle scan files confirm
   * @method
   */
  handleScanFilesConfirm = () => {
    const {baseUrl} = this.context;
    const {scanFiles, gcbVersion, pmInterval} = this.state;
    const url = `${baseUrl}/api/hmd/config`;
    let parsedIncludePath = [];
    let parsedExcludePath = [];

    _.forEach(scanFiles.includePath, val => {
      if (val.path) {
        parsedIncludePath.push(val.path);
      }
    });

    _.forEach(scanFiles.excludePath, val => {
      if (val.path) {
        parsedExcludePath.push(val.path);
      }
    });

    const scanType = [
      {
        type: 'hmd.scanFile.path',
        value: parsedIncludePath.join()
      },
      {
        type: 'hmd.scanFile.exclude.path',
        value: parsedExcludePath.join()
      },
      {
        type: 'hmd.gcb.version',
        value: gcbVersion
      },
      {
        type: 'hmd.setProcessWhiteList._MonitorSec',
        value: pmInterval.toString()
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
   * @param {object} event - event object
   */
  handleGcbVersionChange = (event) => {
    this.setState({
      gcbVersion: event.target.value
    });
  }
  /**
   * Handle input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    this.setState({
      pmInterval: event.target.value
    });
  }
  render() {
    const {activeContent, gcbVersion, pmInterval} = this.state;

    return (
      <div className='parent-content'>
        <div className='main-content basic-form'>
          <header className='main-header'>{t('network-inventory.txt-hmdSettings')}</header>

          {activeContent === 'viewMode' &&
            <div className='content-header-btns'>
              <Button variant='outlined' color='primary' className='standard btn no-padding'>
                <Link to={{pathname: '/SCP/configuration/topology/inventory', state: 'tableList'}}>{t('txt-back')}</Link>
              </Button>
              <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode')}>{t('txt-edit')}</Button>
            </div>
          }

          <div className='hmd-settings'>
            <div className='form-group normal long'>
              <header>{t('network-inventory.scan-list.txt-scanFile')}</header>
              {MALWARE_DETECTION.map(this.showMalwarePath)}
            </div>
            <div className='form-group normal long'>
              <header>{t('network-inventory.scan-list.txt-gcb')}</header>
              <div className='group'>
                <label>{t('network-inventory.txt-learningInterval')}</label>
                <RadioGroup
                  className='radio-group'
                  value={gcbVersion}
                  onChange={this.handleGcbVersionChange}>
                  <FormControlLabel
                    value='TW'
                    control={
                      <Radio
                        className='radio-ui'
                        color='primary' />
                    }
                    label='TW'
                    disabled={activeContent === 'viewMode'} />
                  <FormControlLabel
                    className='radio-ui'
                    value='US'
                    control={
                      <Radio
                        className='radio-ui'
                        color='primary' />
                    }
                    label='US'
                    disabled={activeContent === 'viewMode'} />
                </RadioGroup>
              </div>
            </div>

            <div className='form-group normal long'>
              <header>{t('network-inventory.scan-list.txt-procMonitor')}</header>
              <div className='group'>
                <label>{t('network-inventory.txt-learningInterval')}</label>
                <TextField
                  type='number'
                  variant='outlined'
                  size='small'
                  InputProps={{inputProps: { min: 0 }}}
                  value={pmInterval}
                  onChange={this.handleDataChange}
                  disabled={activeContent === 'viewMode'} />
              </div>
            </div>
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

HMDsettings.contextType = BaseDataContext;

HMDsettings.propTypes = {
};

export default HMDsettings;