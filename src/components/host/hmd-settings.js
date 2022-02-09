import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardDateTimePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import TextField from '@material-ui/core/TextField'

import {downloadLink} from 'react-ui/build/src/utils/download'
import MultiInput from 'react-ui/build/src/components/multi-input'

import {BaseDataContext} from '../common/context'
import CpeHeader from './cpe-header'
import FileUpload from '../common/file-upload'
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
      datetimeExport: {
        from: helper.getStartDate('day'),
        to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
      },
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
      originaFrMotpSettings: '',
      frMotp: {
        enable: true,
        ip: '',
        apiKey: ''
      },
      originalNccstSettings: '',
      nccstSettings: {
        unitOID: '',
        unitName: '',
        apiKey: '',
        apiUrl: ''
      },
      hmdFile: '',
      activeSettings: '',
      fieldEnable: {
        scanFiles: false,
        gcb: false,
        processMonitor: false,
        ftpUpload: false,
        vansSoftware: false,
        frMotp: false,
        cpeConvert: false,
        nccst: false,
        security: false,
        hmd: false
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
    //this.getProductRegexInfo();
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
    const scanType = ['hmd.scanFile.path', 'hmd.scanFile.exclude.path', 'hmd.gcb.version', 'hmd.setProcessWhiteList._MonitorSec', 'hmd.sftp.ip', 'hmd.sftp.uploadPath', 'hmd.sftp.account', 'vans.oid', 'vans.unit_name', 'vans.api_key', 'vans.api_url', 'hmd.export.kbid.items', 'hmd.frmotp'];
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

        const parsedFrMotpData = JSON.parse(data[12].value);
        const frMotp = {
          ip: parsedFrMotpData.ip,
          apiKey: parsedFrMotpData.apiKey,
          enable: parsedFrMotpData.enable
        };

        this.setState({
          originaFrMotpSettings: _.cloneDeep(frMotp),
          frMotp
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
   * @param {string} [options] - option for field type
   */
  toggleContent = (type, options) => {
    const {
      originalScanFiles,
      originalGcbVersion,
      originalPmInterval,
      originalFtpIp,
      originalFtpUrl,
      originalFtpAccount,
      originalProductRegex,
      originalCpeData,
      originaFrMotpSettings,
      originalNccstSettings,
      fieldEnable
    } = this.state;
    let showPage = type;

    if (type === 'editMode') {
      let tempFieldEnable = {...fieldEnable};
      tempFieldEnable[options] = true;

      this.setState({
        activeSettings: options,
        fieldEnable: tempFieldEnable
      });
    } else if (type === 'save') {
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
        frMotp: _.cloneDeep(originaFrMotpSettings),
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
    const {activeContent, scanFiles, fieldEnable} = this.state;

    return (
      <div key={i} className='group'>
        <label>{t('hmd-scan.txt-' + val)}</label>
        {!fieldEnable.scanFiles && scanFiles[val].length > 0 &&
          <div className='flex-item'>{scanFiles[val].map(this.displayScanFile)}</div>
        }
        {fieldEnable.scanFiles &&
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
    const {scanFiles, gcbVersion, pmInterval, ftpIp, ftpUrl, ftpAccount, ftpPassword, cpeData, frMotp, nccstSettings, activeSettings, fieldEnable, formValidation} = this.state;
    const url = `${baseUrl}/api/hmd/config`;
    let parsedIncludePath = [];
    let parsedExcludePath = [];
    let tempFormValidation = {...formValidation};
    let validate = true;
    let requestData = {};

    if (activeSettings === 'scanFiles') {
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
          this.clearData();
        }
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
      return;
    } else if (activeSettings === 'gcb') {
      requestData = {
        configId: 'hmd.gcb.version',
        value: gcbVersion
      };
    } else if (activeSettings === 'processMonitor') {
      requestData = {
        configId: 'hmd.setProcessWhiteList._MonitorSec',
        value: pmInterval.toString()
      };
    } else if (activeSettings === 'ftpUpload') {
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
      return;
    } else if (activeSettings === 'vansSoftware') {
      this.handleHmdProductRegex();
      return;
    } else if (activeSettings === 'frMotp') {
      requestData = {
        configId: 'hmd.frmotp',
        value: JSON.stringify(frMotp)
      };
    } else if (activeSettings === 'nccst') {
      const scanType = [
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
      return;
    } else if (activeSettings === 'security') {
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
                return val2.cpe;
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

        requestData = {
          configId: 'hmd.export.kbid.items',
          value: JSON.stringify(parsedCpeData)
        };
      }
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
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
      activeSettings: '',
      fieldEnable: {
        scanFiles: false,
        gcb: false,
        processMonitor: false,
        ftpUpload: false,
        vansSoftware: false,
        frMotp: false,
        cpeConvert: false,
        nccst: false,
        security: false,
        hmd: false
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
  /**
   * Handle FR-MOTP data change
   * @method
   * @param {object} event - event object
   */
  handleFrMotpChange = (event) => {
    const type = event.target.name === 'enable' ? 'checked' : 'value';
    let tempFrMotp = {...this.state.frMotp};
    tempFrMotp[event.target.name] = event.target[type];

    this.setState({
      frMotp: tempFrMotp
    });
  }
  /**
   * Handle FR-MOTP connections test
   * @method
   */
  handleConnectionsTest = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/common/fr-motp/connect/_test`,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-connectionsSuccess'));
      } else {
        helper.showPopupMsg(t('txt-connectionsFail'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set new datetime
   * @method
   * @param {string} type - date type ('from' or 'to')
   * @param {object} newDatetime - new datetime object
   */
  handleDateChange = (type, newDatetime) => {
    let tempDatetimeExport = {...this.state.datetimeExport};
    tempDatetimeExport[type] = newDatetime;

    this.setState({
      datetimeExport: tempDatetimeExport
    });
  }
  /**
   * Handle HMD upload input value change
   * @method
   * @param {object} value - input data to be set
   */
  handleFileChange = (value) => {
    this.setState({
      hmdFile: value
    });
  }
  /**
   * Handle HMD export
   * @method
   */
  handleFileExport = () => {
    const {baseUrl} = this.context;
    const {datetimeExport} = this.state;
    const startDttm = moment(datetimeExport.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const endDttm = moment(datetimeExport.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const url = `${baseUrl}/api/hmd/dbsync/ipdeviceAndtask/_export?startDttm=${startDttm}&endDttm=${endDttm}`;

    downloadLink(url);
  }
  /**
   * Handle HMD file import
   * @method
   */
  handleFileImport = () => {
    const {baseUrl} = this.context;
    const {hmdFile} = this.state;
    let formData = new FormData();
    formData.append('file', hmdFile);

    if (!hmdFile) return;

    ah.one({
      url: `${baseUrl}/api/hmd/dbsync/ipdeviceAndtask/_import`,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data.ret === 0) {
        helper.showPopupMsg(t('txt-uploadSuccess'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {locale} = this.context;
    const {
      datetimeExport,
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
      frMotp,
      nccstSettings,
      cpeData,
      fieldEnable,
      formValidation
    } = this.state;
    const data = {
      activeContent,
      fieldEnable,
      PRODUCT_REGEX
    };
    const cpeProps = {
      activeContent,
      cpeData,
      setCpeData: this.setCpeData,
      fieldEnable
    };
    let dateLocale = locale;
    let msg = '';
    let color = '';

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

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
            </div>
          }

          <div className='hmd-settings' style={{height: activeContent === 'viewMode' ? '78vh' : '70vh'}}>
            <div className='form-group normal long'>
              <header>{t('hmd-scan.scan-list.txt-scanFile')}</header>
              <div className='header-btn-group'>
                {activeContent === 'viewMode' &&
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode', 'scanFiles')}>{t('txt-edit')}</Button>
                }
              </div>
              {MALWARE_DETECTION.map(this.showMalwarePath)}
            </div>
            <div className='form-group normal long'>
              <header>{t('hmd-scan.scan-list.txt-gcb')}</header>
              <div className='header-btn-group'>
                {activeContent === 'viewMode' &&
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode', 'gcb')}>{t('txt-edit')}</Button>
                }
              </div>
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
                    disabled={!fieldEnable.gcb} />
                  <FormControlLabel
                    className='radio-ui'
                    value='US'
                    control={
                      <Radio
                        className='radio-ui'
                        color='primary' />
                    }
                    label='US'
                    disabled={!fieldEnable.gcb} />
                </RadioGroup>
              </div>
            </div>

            <div className='form-group normal long'>
              <header>{t('hmd-scan.scan-list.txt-procMonitor')}</header>
              <div className='header-btn-group'>
                {activeContent === 'viewMode' &&
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode', 'processMonitor')}>{t('txt-edit')}</Button>
                }
              </div>
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
                  disabled={!fieldEnable.processMonitor} />
              </div>
            </div>

            <div className='form-group normal long'>
              <header>{t('hmd-scan.scan-list.txt-ftpUpload')}</header>
              <div className='header-btn-group'>
                {activeContent === 'viewMode' &&
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode', 'ftpUpload')}>{t('txt-edit')}</Button>
                }
              </div>
              <div className='group'>
                {!fieldEnable.ftpUpload &&
                  <label>IP</label>
                }
                {fieldEnable.ftpUpload &&
                  <label>IP *</label>
                }
                {!fieldEnable.ftpUpload &&
                  <div className='flex-item'><span>{ftpIp || NOT_AVAILABLE}</span></div>
                }
                {fieldEnable.ftpUpload &&
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
                {!fieldEnable.ftpUpload &&
                  <label>URL</label>
                }
                {fieldEnable.ftpUpload &&
                  <label>URL *</label>
                }
                {!fieldEnable.ftpUpload &&
                  <div className='flex-item'><span>{ftpUrl || NOT_AVAILABLE}</span></div>
                }
                {fieldEnable.ftpUpload &&
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
                {!fieldEnable.ftpUpload &&
                  <label>{t('txt-account')}</label>
                }
                {fieldEnable.ftpUpload &&
                  <label>{t('txt-account')} *</label>
                }
                {!fieldEnable.ftpUpload &&
                  <div className='flex-item'><span>{ftpAccount || NOT_AVAILABLE}</span></div>
                }
                {fieldEnable.ftpUpload &&
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

              {fieldEnable.ftpUpload &&
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
                  <Button id='hmdSettingsConnectionsCheck' variant='contained' color='primary' className='connections-check' onClick={this.checkConnectionsStatus}>{t('hmd-scan.txt-checkConnections')}</Button>
                  {msg &&
                    <span style={{color}}>{msg}</span>
                  }
                </div>
              }
            </div>

            <div className='form-group normal'>
              <header>{t('network-inventory.txt-VansProductRegex')}</header>
              <div className='header-btn-group'>
                {activeContent === 'viewMode' &&
                  <React.Fragment>
                    <Button variant='contained' color='primary' onClick={this.getProductRegexInfo}>{t('txt-load')}</Button>
                    <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode', 'vansSoftware')}>{t('txt-edit')}</Button>
                  </React.Fragment>
                }
              </div>
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
                  disabled={!fieldEnable.vansSoftware} />
              </div>
            </div>

            <div className='form-group normal'>
              <header>{t('network-inventory.txt-CPEconvertTest')}</header>
              <div className='header-btn-group'>
              </div>
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
                <Button variant='contained' color='primary' className='convert-test' onClick={this.handleCPEconvertTest}>{t('network-inventory.txt-CPEconvertTest')}</Button>
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
              <header>FR-MOTP</header>
              <div className='header-btn-group'>
                {(activeContent === 'viewMode' || (activeContent === 'editMode' && fieldEnable.frMotp)) &&
                  <Button variant='contained' color='primary' className='header-btn' onClick={this.handleConnectionsTest}>{t('soar.txt-testConnections')}</Button>
                }
                {activeContent === 'viewMode' &&
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode', 'frMotp')}>{t('txt-edit')}</Button>
                }
              </div>
              <div className='group full'>
                <FormControlLabel
                  label={t('network-inventory.txt-frMotpTest')}
                  control={
                    <Checkbox
                      className='checkbox-ui'
                      name='enable'
                      checked={frMotp.enable}
                      onChange={this.handleFrMotpChange}
                      color='primary' />
                  }
                  disabled={!fieldEnable.frMotp} />
              </div>
              <div className='group'>
                <TextField
                  name='ip'
                  label='IP'
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={frMotp.ip}
                  onChange={this.handleFrMotpChange}
                  disabled={!fieldEnable.frMotp} />
              </div>
              <div className='group'>
                <TextField
                  name='apiKey'
                  label='API Key'
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={frMotp.apiKey}
                  onChange={this.handleFrMotpChange}
                  disabled={!fieldEnable.frMotp} />
              </div>
            </div>

            <div className='form-group normal'>
              <header>{t('network-inventory.txt-reportNCCST')}</header>
              <div className='header-btn-group'>
                {activeContent === 'viewMode' &&
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode', 'nccst')}>{t('txt-edit')}</Button>
                }
              </div>
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
                  disabled={!fieldEnable.nccst} />
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
                  disabled={!fieldEnable.nccst} />
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
                  disabled={!fieldEnable.nccst} />
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
                  disabled={!fieldEnable.nccst} />
              </div>
            </div>

            <div className='form-group normal long'>
              <header>{t('network-inventory.txt-cpeSoftwareList')}</header>
              <div className='header-btn-group'>
                {activeContent === 'viewMode' &&
                  <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode', 'security')}>{t('txt-edit')}</Button>
                }
              </div>
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
                disabled={!fieldEnable.security} />
            </div>

            <div className='form-group normal long'>
              <header>{t('hmd-scan.txt-hmdImportExport')}</header>
              <div className='header-btn-group'>
              </div>
              <div className='sub-section'>
                <div className='import-header'>{t('txt-export')}</div>
                <div className='date-picker'>
                  <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
                    <KeyboardDateTimePicker
                      id='hmdSettingsDateTimePickerFrom'
                      className='date-time-picker'
                      inputVariant='outlined'
                      variant='inline'
                      format='YYYY-MM-DD HH:mm'
                      invalidDateMessage={t('txt-invalidDateMessage')}
                      maxDateMessage={t('txt-maxDateMessage')}
                      minDateMessage={t('txt-minDateMessage')}
                      ampm={false}
                      value={datetimeExport.from}
                      onChange={this.handleDateChange.bind(this, 'from')} />
                    <div className='between'>~</div>
                    <KeyboardDateTimePicker
                      id='hmdSettingsDateTimePickerTo'
                      className='date-time-picker'
                      inputVariant='outlined'
                      variant='inline'
                      format='YYYY-MM-DD HH:mm'
                      invalidDateMessage={t('txt-invalidDateMessage')}
                      maxDateMessage={t('txt-maxDateMessage')}
                      minDateMessage={t('txt-minDateMessage')}
                      ampm={false}
                      value={datetimeExport.to}
                      onChange={this.handleDateChange.bind(this, 'to')} />
                  </MuiPickersUtilsProvider>
                </div>
                <Button variant='contained' color='primary' className='export-btn' onClick={this.handleFileExport}>{t('txt-export')}</Button>
              </div>

              <div className='sub-section'>
                <div className='import-header'>{t('txt-import')}</div>
                <FileUpload
                  id='importHmd'
                  fileType='zip'
                  btnText={t('txt-selectFile')}
                  handleFileChange={this.handleFileChange} />
                <Button variant='contained' color='primary' className='import-btn' onClick={this.handleFileImport}>{t('txt-import')}</Button>  
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