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

import MultiInput from 'react-ui/build/src/components/multi-input'

import {BaseDataContext} from '../common/context'
import CpeHeader from './cpe-header'
import helper from '../common/helper'
import InputPath from '../common/input-path'
import ProductRegex from './product-regex'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const IP_PATTERN = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
const CPE_PATTERN = /cpe:2\.3:[aho](?::(?:[a-zA-Z0-9!"#$%&'()*+,\\\-_.\/;<=>?@\[\]^`{|}~]|\\:)+){10}$/;
const MALWARE_DETECTION = ['includePath', 'excludePath'];
const NOT_AVAILABLE = 'N/A';
const PRODUCT_REGEX = [
  {
    name: 'regexp',
    label: 'Regexp'
  },
  {
    name: 'part',
    label: 'Part'
  },
  {
    name: 'vendor',
    label: 'Vendor'
  },
  {
    name: 'product',
    label: 'Product'
  },
  {
    name: 'version',
    label: 'Version'
  },
  {
    name: 'update',
    label: 'Update'
  },
  {
    name: 'edition',
    label: 'Edition'
  },
  {
    name: 'language',
    label: 'Language'
  },
  {
    name: 'sw_edition',
    label: 'Software Edition'
  },
  {
    name: 'target_sw',
    label: 'Target Software'
  },
  {
    name: 'target_hw',
    label: 'Target Hardware'
  },
  {
    name: 'other',
    label: 'Other'
  }
];

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
      originalProductRegex: '',
      productRegexData: [{
        regexp: '',
        part: '',
        vendor: '',
        product: '',
        version: '',
        update: '',
        edition: '',
        language: '',
        sw_edition: '',
        target_sw: '',
        target_hw: '',
        other: ''
      }],
      originalCpeData: '',
      cpeData: [{
        header: '',
        validate: true,
        msg: '',
        list: [{
          cpe: '',
          validate: true,
          msg: ''
        }],
        index: 0
      }],
      cpeInputTest: '',
      cpe23Uri: '',
      cpeConvertResult: '',
      connectionsStatus: '',
      originalNccstSettings: '',
      nccstSettings: {
        unitOID: '',
        unitName: '',
        apiKey: '',
        apiUrl: ''
      },
      formValidation: {
        ip: {
          valid: true,
          msg: ''
        },
        url: {
          valid: true
        },
        account: {
          valid: true
        },
        password: {
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

    helper.getPrivilegesInfo(sessionRights, 'common', locale);
    helper.inactivityTime(baseUrl, locale);

    this.getSettingsInfo();
    this.getProductRegexInfo();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get and set HMD settings data
   * @method
   */
  getSettingsInfo = () => {
    const {baseUrl} = this.context;
    const scanType = ['hmd.scanFile.path', 'hmd.scanFile.exclude.path', 'hmd.gcb.version', 'hmd.setProcessWhiteList._MonitorSec', 'hmd.sftp.ip', 'hmd.sftp.uploadPath', 'hmd.sftp.account', 'vans.oid', 'vans.unit_name', 'vans.api_key', 'vans.api_url', 'hmd.export.kbid.items'];
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

        const nccstSettings = {
          unitOID: data[7].value,
          unitName: data[8].value,
          apiKey: data[9].value,
          apiUrl: data[10].value
        };

        this.setState({
          originalNccstSettings: _.cloneDeep(nccstSettings),
          nccstSettings
        });

        const parsedCpeData = JSON.parse(data[11].value);
        let cpeData = [];
      
        _.forEach(parsedCpeData, (val, index) => {
          cpeData.push({
            header: val.cpeHeader,
            validate: true,
            msg: '',
            list: _.map(val.cpeArray, val2 => {
              return {
                cpe: val2,
                validate: true,
                msg: ''
              }
            }),
            index
          });
        })

        this.setState({
          originalCpeData: _.cloneDeep(cpeData),
          cpeData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set product regex data
   * @method
   */
  getProductRegexInfo = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/hmd/productRegex`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        this.setState({
          originalProductRegex: _.cloneDeep(data),
          productRegexData: data
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
    const {
      originalScanFiles,
      originalGcbVersion,
      originalPmInterval,
      originalFtpIp,
      originalFtpUrl,
      originalFtpAccount,
      originalProductRegex,
      originalCpeData,
      originalNccstSettings
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
        ftpAccount: _.cloneDeep(originalFtpAccount),
        productRegexData: _.cloneDeep(originalProductRegex),
        cpeData: _.cloneDeep(originalCpeData),
        nccstSettings: _.cloneDeep(originalNccstSettings)
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
   * Set CPE data
   * @method
   * @param {string} type - cpe type ('header' or 'list')
   * @param {object} data - cpe data
   * @param {object} [cpe] - cpe data
   */
  setCpeData = (type, data, cpe) => {
    let tempCpeData = this.state.cpeData;

    if (type === 'header') {
      this.setState({
        cpeData: data
      });
    } else {
      tempCpeData[data.index].list = cpe;

      this.setState({
        cpeData: tempCpeData
      });
    }
  }
  /**
   * Handle scan files confirm
   * @method
   */
  handleScanFilesConfirm = () => {
    const {baseUrl} = this.context;
    const {scanFiles, gcbVersion, pmInterval, ftpIp, ftpUrl, ftpAccount, ftpPassword, cpeData, nccstSettings, formValidation} = this.state;
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
      if (IP_PATTERN.test(ftpIp)) {
        tempFormValidation.ip.valid = true;
        tempFormValidation.ip.msg = '';
      } else {
        tempFormValidation.ip.valid = false;
        tempFormValidation.ip.msg = t('network-topology.txt-ipValidationFail');
        validate = false;
      }
    } else {
      tempFormValidation.ip.valid = false;
      tempFormValidation.ip.msg = t('txt-required');
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

    if (ftpPassword || !ftpPassword) {
      tempFormValidation.password.valid = true;
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
      },
      {
        type: 'vans.oid',
        value: nccstSettings.unitOID
      },
      {
        type: 'vans.unit_name',
        value: nccstSettings.unitName
      },
      {
        type: 'vans.api_key',
        value: nccstSettings.apiKey
      },
      {
        type: 'vans.api_url',
        value: nccstSettings.apiUrl
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
        configId: 'hmd.sftp.password',
        value: ftpPassword
      };

      apiArr.push({
        url,
        data: JSON.stringify(requestData),
        type: 'POST',
        contentType: 'text/plain'
      });
    }

    let tempCpeData = [];
    let cpeValid = true;

    if (cpeData.length > 0) {
      let parsedCpeData = [];

      _.forEach(cpeData, (val, i) => {
        let validate = true;
        let msg = '';

        if (val.header === '') {
          validate = false;
          cpeValid = false;
          msg = t('txt-required');
        }

        tempCpeData.push({
          header: val.header,
          validate,
          msg,
          index: i
        });

        let cpeList = [];

        if (val.list.length === 0) {
          cpeList.push({
            cpe: '',
            validate: false,
            msg: t('txt-required')
          });

          cpeValid = false;
        }

        _.forEach(val.list, val2 => {
          let validate = true;
          let msg = '';

          if (val2.cpe === '') {
            validate = false;
            cpeValid = false;
            msg = t('txt-required');
          }

          if (val2.cpe && !CPE_PATTERN.test(val2.cpe)) { //Check CPE format
            validate = false;
            cpeValid = false;
            msg = t('txt-checkFormat');
          }

          cpeList.push({
            cpe: val2.cpe,
            validate,
            msg
          });
        })

        tempCpeData[i].list = cpeList;

        if (cpeValid) {
          parsedCpeData.push({
            cpeHeader: val.header,
            cpeArray: _.map(val.list, val2 => {
              return val2.cpe
            })
          });
        }
      })

      if (!cpeValid) {
        helper.showPopupMsg('', t('txt-error'), t('network-inventory.txt-cpeFormatError'));

        this.setState({
          cpeData: tempCpeData
        });
        return;
      }

      const cpeRequestData = {
        configId: 'hmd.export.kbid.items',
        value: JSON.stringify(parsedCpeData)
      };

      apiArr.push({
        url,
        data: JSON.stringify(cpeRequestData),
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

    this.handleHmdProductRegex();
  }
  /**
   * Handle HMD product regex confirm
   * @method
   */
  handleHmdProductRegex = () => {
    const {baseUrl} = this.context;
    const requestData = {
      productRegex: this.state.productRegexData
    };

    this.ah.one({
      url: `${baseUrl}/api/hmd/productRegex`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
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
          valid: true,
          msg: ''
        },
        url: {
          valid: true
        },
        account: {
          valid: true
        },
        password: {
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

    if (event.target.name === 'ftpIp' || event.target.name === 'ftpAccount' || event.target.name === 'ftpPassword') {
      this.setState({
        connectionsStatus: ''
      });
    }
  }
  /**
   * Handle input data change for NCCST
   * @method
   * @param {object} event - event object
   */
  handleNccstDataChange = (event) => {
    let tempNccstSettings = {...this.state.nccstSettings};
    tempNccstSettings[event.target.name] = event.target.value;

    this.setState({
      nccstSettings: tempNccstSettings
    });
  }
  /**
   * Handle check connections button
   * @method
   */
  checkConnectionsStatus = () => {
    const {baseUrl} = this.context;
    const {ftpIp, ftpAccount, ftpPassword, formValidation} = this.state;
    const url = `${baseUrl}/api/hmd/isSftpConnected`;
    const requestData = {
      ip: ftpIp,
      account: ftpAccount,
      password: ftpPassword
    };
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (ftpIp) {
      if (IP_PATTERN.test(ftpIp)) {
        tempFormValidation.ip.valid = true;
        tempFormValidation.ip.msg = '';
      } else {
        tempFormValidation.ip.valid = false;
        tempFormValidation.ip.msg = t('network-topology.txt-ipValidationFail');
        validate = false;
      }
    } else {
      tempFormValidation.ip.valid = false;
      tempFormValidation.ip.msg = t('txt-required');
      validate = false;
    }

    if (ftpAccount) {
      tempFormValidation.account.valid = true;
    } else {
      tempFormValidation.account.valid = false;
      validate = false;
    }

    if (ftpPassword) {
      tempFormValidation.password.valid = true;
    } else {
      tempFormValidation.password.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

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
  /**
   * Set Product Regex data
   * @method
   * @param {array} productRegexData - product regex data
   */
  setProductRegexData = (productRegexData) => {
    this.setState({
      productRegexData
    });
  }
  /**
   * Handle CPE convert test button
   * @method
   */
  handleCPEconvertTest = () => {
    const {baseUrl} = this.context;
    const {productRegexData, cpeInputTest} = this.state;
    const url = `${baseUrl}/api/hmd/productRegex/_test`;
    let requestData = {
      productRegex: productRegexData,
      cpe23Uri: cpeInputTest
    };

    if (cpeInputTest === '' || productRegexData.length === 0) {
      return;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.setState({
          cpe23Uri: data.cpe23Uri,
          cpeConvertResult: data.match
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get CPE content
   * @method
   * @returns CPE content
   */
  showCpeResult = () => {
    const {cpeConvertResult} = this.state;

    if (cpeConvertResult !== '') {
      return cpeConvertResult ? t('txt-pass') : t('txt-fail');
    }
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
      productRegexData,
      cpeInputTest,
      cpe23Uri,
      cpeConvertResult,
      connectionsStatus,
      nccstSettings,
      cpeData,
      formValidation
    } = this.state;
    const data = {
      activeContent,
      PRODUCT_REGEX
    };
    const cpeProps = {
      activeContent,
      cpeData,
      setCpeData: this.setCpeData
    };
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
                {activeContent === 'viewMode' &&
                  <label>IP</label>
                }
                {activeContent === 'editMode' &&
                  <label>IP *</label>
                }
                {activeContent === 'viewMode' &&
                  <div className='flex-item'><span>{ftpIp || NOT_AVAILABLE}</span></div>
                }
                {activeContent === 'editMode' &&
                  <TextField
                    id='hmdSettingsFtpIp'
                    name='ftpIp'
                    variant='outlined'
                    size='small'
                    required
                    error={!formValidation.ip.valid}
                    helperText={formValidation.ip.msg}
                    value={ftpIp}
                    onChange={this.handleDataChange} />
                }
              </div>
              <div className='group'>
                {activeContent === 'viewMode' &&
                  <label>URL</label>
                }
                {activeContent === 'editMode' &&
                  <label>URL *</label>
                }
                {activeContent === 'viewMode' &&
                  <div className='flex-item'><span>{ftpUrl || NOT_AVAILABLE}</span></div>
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
                {activeContent === 'viewMode' &&
                  <label>{t('txt-account')}</label>
                }
                {activeContent === 'editMode' &&
                  <label>{t('txt-account')} *</label>
                }
                {activeContent === 'viewMode' &&
                  <div className='flex-item'><span>{ftpAccount || NOT_AVAILABLE}</span></div>
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
                    required
                    error={!formValidation.password.valid}
                    helperText={formValidation.password.valid ? '' : t('txt-required')}
                    value={ftpPassword}
                    onChange={this.handleDataChange} />
                  <button id='hmdSettingsConnectionsCheck' className='connections-check' onClick={this.checkConnectionsStatus}>{t('hmd-scan.txt-checkConnections')}</button>
                  {msg &&
                    <span style={{color}}>{msg}</span>
                  }
                </div>
              }
            </div>

            <div className='form-group normal'>
              <header>{t('network-inventory.txt-VansProductRegex')}</header>
              <div className='group full multi product-regex-group'>
                <MultiInput
                  id='hmdSettingsProductRegex'
                  className='ip-range-group'
                  base={ProductRegex}
                  props={data}
                  defaultItemValue={{
                    regexp: '',
                    part: '',
                    vendor: '',
                    product: '',
                    version: '',
                    update: '',
                    edition: '',
                    language: '',
                    sw_edition: '',
                    target_sw: '',
                    target_hw: '',
                    other: ''
                  }}
                  value={productRegexData}
                  onChange={this.setProductRegexData}
                  disabled={activeContent === 'viewMode'} />
              </div>
            </div>

            <div className='form-group normal'>
              <header>{t('network-inventory.txt-CPEconvertTest')}</header>
              <div className='group full'>
                <label></label>
                <TextField
                  name='cpeInputTest'
                  label={t('network-inventory.txt-CPEinputTest')}
                  className='cpe-input-test'
                  variant='outlined'
                  size='small'
                  value={cpeInputTest}
                  onChange={this.handleDataChange} />
                <button className='convert-test' onClick={this.handleCPEconvertTest}>{t('network-inventory.txt-CPEconvertTest')}</button>
                <TextField
                  name='cpeConvertResult'
                  label={t('network-inventory.txt-CPEconvertResult')}
                  className='cpe-convert-result'
                  variant='outlined'
                  size='small'
                  value={cpe23Uri || ''}
                  disabled={true} />
                <div className='convert-result-text' style={{color: cpeConvertResult ? '#22ac38' : '#d10d25'}}>{this.showCpeResult()}</div>
              </div>
            </div>

            <div className='form-group normal'>
              <header>{t('network-inventory.txt-reportNCCST')}</header>
              <div className='group'>
                <TextField
                  id='nccstSettingsUnitOID'
                  name='unitOID'
                  label={t('network-inventory.txt-unitOID')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={nccstSettings.unitOID}
                  onChange={this.handleNccstDataChange}
                  disabled={activeContent === 'viewMode'} />
              </div>
              <div className='group'>
                <TextField
                  id='nccstSettingsUnitName'
                  name='unitName'
                  label={t('network-inventory.txt-unitName')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={nccstSettings.unitName}
                  onChange={this.handleNccstDataChange}
                  disabled={activeContent === 'viewMode'} />
              </div>
              <div className='group full'>
                <TextField
                  id='nccstSettingsApiKey'
                  name='apiKey'
                  label={t('network-inventory.txt-apiKey')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={nccstSettings.apiKey}
                  onChange={this.handleNccstDataChange}
                  disabled={activeContent === 'viewMode'} />
              </div>
              <div className='group full'>
                <TextField
                  id='nccstSettingsApiUrl'
                  name='apiUrl'
                  label={t('network-inventory.txt-apiUrl')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={nccstSettings.apiUrl}
                  onChange={this.handleNccstDataChange}
                  disabled={activeContent === 'viewMode'} />
              </div>
            </div>

            <div className='form-group normal long'>
              <header>{t('network-inventory.txt-cpeSoftwareList')}</header>
              <MultiInput
                className='cpe-group'
                base={CpeHeader}
                props={cpeProps}
                defaultItemValue={{
                  header: '',
                  validate: true,
                  msg: '',
                  list: [{
                    cpe: '',
                    validate: true,
                    msg: ''
                  }],
                  index: cpeData.length
                }}
                value={cpeData}
                onChange={this.setCpeData.bind(this, 'header')}
                disabled={activeContent === 'viewMode'} />
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