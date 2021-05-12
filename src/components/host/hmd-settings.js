import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import InputPath from '../common/input-path'
import MultiInput from 'react-ui/build/src/components/multi-input'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const MALWARE_DETECTION = ['includePath', 'excludePath'];

let t = null;
let et = null;

/**
 * Network Topology Inventory HMD Settings
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to manage auto settings
 */
class HMDsettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeContent: 'viewMode', //'viewMode' or 'editMode'
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
      pmInterval: 1,
      originalFtpIp: '',
      ftpIp: '',
      originalFtpUrl: '',
      ftpUrl: '',
      originalFtpAccount: '',
      ftpAccount: '',
      ftpPassword: '',
      connectionsStatus: '',
      formValidation: {
        ip: {
          valid: true
        },
        url: {
          valid: true
        },
        account: {
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
   * Get and set HMD settings data
   * @method
   */
  getSettingsInfo = () => {
    const {baseUrl} = this.context;
    const scanType = ['hmd.scanFile.path', 'hmd.scanFile.exclude.path', 'hmd.gcb.version', 'hmd.setProcessWhiteList._MonitorSec', 'hmd.sftp.ip', 'hmd.sftp.uploadPath', 'hmd.sftp.account'];
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

        if (data[4] && data[4].value) {
          this.setState({
            originalFtpIp: _.cloneDeep(data[4].value),
            ftpIp: data[4].value
          });
        }

        if (data[5] && data[5].value) {
          this.setState({
            originalFtpUrl: _.cloneDeep(data[5].value),
            ftpUrl: data[5].value
          });
        }

        if (data[6] && data[6].value) {
          this.setState({
            originalFtpAccount: _.cloneDeep(data[6].value),
            ftpAccount: data[6].value
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
    const {
      originalScanFiles,
      originalGcbVersion,
      originalPmInterval,
      originalFtpIp,
      originalFtpUrl,
      originalFtpAccount
    } = this.state;
    let showPage = type;

    if (type === 'save') {
      this.handleScanFilesConfirm();
      return;
    } else if (type === 'cancel') {
      showPage = 'viewMode';

      this.setState({
        scanFiles: _.cloneDeep(originalScanFiles),
        gcbVersion: _.cloneDeep(originalGcbVersion),
        pmInterval: _.cloneDeep(originalPmInterval),
        ftpIp: _.cloneDeep(originalFtpIp),
        ftpUrl: _.cloneDeep(originalFtpUrl),
        ftpAccount: _.cloneDeep(originalFtpAccount)
      });

      this.clearData();
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
        <label>{t('hmd-scan.txt-' + val)}</label>
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
    const {scanFiles, gcbVersion, pmInterval, ftpIp, ftpUrl, ftpAccount, ftpPassword, formValidation} = this.state;
    const url = `${baseUrl}/api/hmd/config`;
    let parsedIncludePath = [];
    let parsedExcludePath = [];
    let tempFormValidation = {...formValidation};
    let validate = true;

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

    if (ftpIp) {
      tempFormValidation.ip.valid = true;
    } else {
      tempFormValidation.ip.valid = false;
      validate = false;
    }

    if (ftpUrl) {
      tempFormValidation.url.valid = true;
    } else {
      tempFormValidation.url.valid = false;
      validate = false;
    }

    if (ftpAccount) {
      tempFormValidation.account.valid = true;
    } else {
      tempFormValidation.account.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

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
      },
      {
        type: 'hmd.sftp.ip',
        value: ftpIp
      },
      {
        type: 'hmd.sftp.uploadPath',
        value: ftpUrl
      },
      {
        type: 'hmd.sftp.account',
        value: ftpAccount
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

    if (ftpPassword) {
      const requestData = {
        configId: 'hmd.sftp.passward',
        value: ftpPassword
      };

      apiArr.push({
        url,
        data: JSON.stringify(requestData),
        type: 'POST',
        contentType: 'text/plain'
      });
    }

    this.ah.all(apiArr)
    .then(data => {
      if (data) {
        this.getSettingsInfo();
        this.clearData();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Clear validations data
   * @method
   */
  clearData = () => {
    this.setState({
      ftpPassword: '',
      connectionsStatus: '',
      formValidation: {
        ip: {
          valid: true
        },
        url: {
          valid: true
        },
        account: {
          valid: true
        }
      }
    });
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
      [event.target.name]: event.target.value
    });
  }
  /**
   * Handle check connections button
   * @method
   */
  checkConnectionsStatus = () => {
    const {baseUrl} = this.context;
    const {ftpIp, ftpAccount, ftpPassword} = this.state;
    const url = `${baseUrl}/api/hmd/isSftpConnected`;
    const requestData = {
      ip: ftpIp,
      account: ftpAccount,
      passward: ftpPassword
    };

    if (!ftpAccount || !ftpPassword) {
      helper.showPopupMsg('', t('txt-error'), t('txt-allRequired'));

      this.setState({
        connectionsStatus: ''
      });
      return;
    }

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.setState({
          connectionsStatus: data.rt
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {
      activeContent,
      gcbVersion,
      pmInterval,
      ftpIp,
      ftpUrl,
      ftpAccount,
      ftpPassword,
      connectionsStatus,
      formValidation
    } = this.state;
    let msg = '';
    let color = '';

    if (connectionsStatus !== '') {
      msg = connectionsStatus ? t('txt-success') : t('txt-fail');
      color = connectionsStatus ? '#22ac38' : '#d10d25'; //green : red
    }

    return (
      <div className='parent-content'>
        <div className='main-content basic-form'>
          <header className='main-header'>{t('hmd-scan.txt-hmdSettings')}</header>

          {activeContent === 'viewMode' &&
            <div className='content-header-btns'>
              <Button variant='outlined' color='primary' className='standard btn no-padding'>
                <Link to={{pathname: '/SCP/host', state: 'hostContent'}}>{t('txt-back')}</Link>
              </Button>
              <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode')}>{t('txt-edit')}</Button>
            </div>
          }

          <div className='hmd-settings' style={{height: activeContent === 'viewMode' ? '78vh' : '70vh'}}>
            <div className='form-group normal long'>
              <header>{t('hmd-scan.scan-list.txt-scanFile')}</header>
              {MALWARE_DETECTION.map(this.showMalwarePath)}
            </div>
            <div className='form-group normal long'>
              <header>{t('hmd-scan.scan-list.txt-gcb')}</header>
              <div className='group'>
                <label>{t('hmd-scan.txt-gcbVersion')}</label>
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
              <header>{t('hmd-scan.scan-list.txt-procMonitor')}</header>
              <div className='group'>
                <label>{t('hmd-scan.txt-learningInterval')}</label>
                <TextField
                  id='hmdSettingsPmInterval'
                  name='pmInterval'
                  type='number'
                  variant='outlined'
                  size='small'
                  InputProps={{inputProps: { min: 0 }}}
                  value={pmInterval}
                  onChange={this.handleDataChange}
                  disabled={activeContent === 'viewMode'} />
              </div>
            </div>

            <div className='form-group normal long'>
              <header>{t('hmd-scan.scan-list.txt-ftpUpload')}</header>
              <div className='group'>
                <label>IP</label>
                {activeContent === 'viewMode' &&
                  <div className='flex-item'><span>{ftpIp}</span></div>
                }
                {activeContent === 'editMode' &&
                  <TextField
                    id='hmdSettingsFtpIp'
                    name='ftpIp'
                    variant='outlined'
                    size='small'
                    required
                    error={!formValidation.ip.valid}
                    helperText={formValidation.ip.valid ? '' : t('txt-required')}
                    value={ftpIp}
                    onChange={this.handleDataChange} />
                }
              </div>
              <div className='group'>
                <label>URL</label>
                {activeContent === 'viewMode' &&
                  <div className='flex-item'><span>{ftpUrl}</span></div>
                }
                {activeContent === 'editMode' &&
                  <TextField
                    id='hmdSettingsFtpUrl'
                    name='ftpUrl'
                    className='full-field'
                    variant='outlined'
                    size='small'
                    required
                    error={!formValidation.url.valid}
                    helperText={formValidation.url.valid ? '' : t('txt-required')}
                    value={ftpUrl}
                    onChange={this.handleDataChange} />
                }
              </div>
              <div className='group'>
                <label>{t('txt-account')}</label>
                {activeContent === 'viewMode' &&
                  <div className='flex-item'><span>{ftpAccount}</span></div>
                }
                {activeContent === 'editMode' &&
                  <TextField
                    id='hmdSettingsFtpAccount'
                    name='ftpAccount'
                    variant='outlined'
                    size='small'
                    required
                    error={!formValidation.account.valid}
                    helperText={formValidation.account.valid ? '' : t('txt-required')}
                    value={ftpAccount}
                    onChange={this.handleDataChange} />
                }
              </div>

              {activeContent === 'editMode' &&
                <div className='group'>
                  <label>{t('txt-password')}</label>
                  <TextField
                    id='hmdSettingsFtpPassword'
                    name='ftpPassword'
                    type='password'
                    variant='outlined'
                    size='small'
                    value={ftpPassword}
                    onChange={this.handleDataChange} />
                  <button id='hmdSettingsConnectionsCheck' className='connections-check' onClick={this.checkConnectionsStatus}>{t('hmd-scan.txt-checkConnections')}</button>
                  {msg &&
                    <span style={{color}}>{msg}</span>
                  }
                </div>
              }
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