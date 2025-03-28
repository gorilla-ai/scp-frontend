import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import moment from 'moment'
import cx from 'classnames'
import _ from 'lodash'

import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker, KeyboardDateTimePicker } from '@material-ui/pickers'
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
import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import CpeHeader from './cpe-header'
import FileUpload from '../common/file-upload'
import helper from '../common/helper'
import InputPath from '../common/input-path'

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
const FORM_VALIDATION = {
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
};
const FIELD_ENABLE = {
  server: false,
  pc: false,
  scanFiles: false,
  scanFilesLinux: false,
  gcb: false,
  processMonitor: false,
  ftpUpload: false,
  frMotp: false,
  security: false,
  scannerSchedule: false
};

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
      originalServerOs: [],
      serverOs: [{
        path: ''
      }],
      originalPcOs: [],
      pcOs: [{
        path: ''
      }],
      originalScanFiles: [],
      scanFiles: {
        includePath: [{
          path: ''
        }],
        excludePath: [{
          path: ''
        }]
      },
      scanFilesDefault: {
        includePath: [{
          path: ''
        }],
        excludePath: [{
          path: ''
        }]
      },
      originalScanFilesLinux: [],
      scanFilesLinux: {
        includePath: [{
          path: ''
        }],
        excludePath: [{
          path: ''
        }]
      },
      scanFilesLinuxDefault: {
        includePath: [{
          path: ''
        }],
        excludePath: [{
          path: ''
        }]
      },
      malwareWhiteCount: -1,
      malwareWhiteListFile: '',
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
      originalCpeData: [],
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
      connectionsStatus: '',
      originalFrMotpSettings: '',
      frMotp: {
        enable: true,
        ip: '',
        apiKey: ''
      },
      originalScannerSchedule: '',
      scannerSchedule: '',
      hmdFile: '',
      activeSettings: '',
      fieldEnable: _.cloneDeep(FIELD_ENABLE),
      formValidation: _.cloneDeep(FORM_VALIDATION)
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
    const scanType = ['hmd.server.os', 'hmd.pc.os', 'hmd.scanFile.windows.path', 'hmd.scanFile.windows.exclude.path', 'hmd.scanFile.linux.path', 'hmd.scanFile.linux.exclude.path', 'hmd.scanFile.windows.path.default', 'hmd.scanFile.windows.exclude.path.default', 'hmd.scanFile.linux.path.default', 'hmd.scanFile.linux.exclude.path.default', 'hmd.gcb.version', 'hmd.setProcessWhiteList._MonitorSec', 'hmd.sftp.ip', 'hmd.sftp.uploadPath', 'hmd.sftp.account', 'hmd.export.kbid.items', 'hmd.frmotp', 'hmd.scanner.schedule'];
    let apiArr = [];

    _.forEach(scanType, val => {
      apiArr.push({
        url: `${baseUrl}/api/common/config?configId=${val}`,
        type: 'GET'
      });
    })
    apiArr.push({
      url: `${baseUrl}/api/hmd/malware/white/count`,
      type: 'GET'
    });
    this.ah.all(apiArr)
    .then(data => {
      if (data) {
        if (data[0] && data[0].value) {
          const serverOs = _.map(data[0].value, val => ({ path: val }));

          this.setState({
            originalServerOs: serverOs,
            serverOs
          });
        }

        if (data[1] && data[1].value) {
          const pcOs = _.map(data[1].value, val => ({ path: val }));

          this.setState({
            originalPcOs: pcOs,
            pcOs
          });
        }

        if (!_.isEmpty(data[2]) && !_.isEmpty(data[3])) {
          const scanIncludePath = data[2].value.split(',');
          const scanExcludePath = data[3].value.split(',');
          const scanIncludePathLinux = data[4].value.split(',');
          const scanExcludePathLinux = data[5].value.split(',');
          let scanFiles = {
            includePath: [],
            excludePath: []
          };
          let scanFilesLinux = {
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

          _.forEach(scanIncludePathLinux, val => {
            if (val) {
              scanFilesLinux.includePath.push({
                path: val
              });
            }
          })

          _.forEach(scanExcludePathLinux, val => {
            if (val) {
              scanFilesLinux.excludePath.push({
                path: val
              });
            }
          })

          this.setState({
            activeContent: 'viewMode',
            originalScanFiles: _.cloneDeep(scanFiles),
            scanFiles,
            originalScanFilesLinux: _.cloneDeep(scanFilesLinux),
            scanFilesLinux
          });
        }

        const winIncludePath = data[6].value.split(',');
        const winExcludePath = data[7].value.split(',');
        const linIncludePath = data[8].value.split(',');
        const linExcludePath = data[9].value.split(',');
        let scanFilesDefault = {
          includePath: [],
          excludePath: []
        };
        let scanFilesLinuxDefault = {
          includePath: [],
          excludePath: []
        };

        _.forEach(winIncludePath, val => {
          if (val) {
            scanFilesDefault.includePath.push({
              path: val
            });
          }
        })

        _.forEach(winExcludePath, val => {
          if (val) {
            scanFilesDefault.excludePath.push({
              path: val
            });
          }
        })

        _.forEach(linIncludePath, val => {
          if (val) {
            scanFilesLinuxDefault.includePath.push({
              path: val
            });
          }
        })

        _.forEach(linExcludePath, val => {
          if (val) {
            scanFilesLinuxDefault.excludePath.push({
              path: val
            });
          }
        })

        this.setState({
          scanFilesDefault,
          scanFilesLinuxDefault
        });

        if (data[10] && data[10].value) {
          this.setState({
            originalGcbVersion: _.cloneDeep(data[10].value),
            gcbVersion: data[10].value
          });
        }

        if (data[11] && data[11].value) {
          this.setState({
            originalPmInterval: _.cloneDeep(data[11].value),
            pmInterval: Number(data[11].value)
          });
        }

        if (data[12] && data[12].value) {
          this.setState({
            originalFtpIp: _.cloneDeep(data[12].value),
            ftpIp: data[12].value
          });
        }

        if (data[13] && data[13].value) {
          this.setState({
            originalFtpUrl: _.cloneDeep(data[13].value),
            ftpUrl: data[13].value
          });
        }

        if (data[14] && data[14].value) {
          this.setState({
            originalFtpAccount: _.cloneDeep(data[14].value),
            ftpAccount: data[14].value
          });
        }

        if (data[15] && data[15].value) {
          const parsedCpeData = JSON.parse(data[15].value);
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

        if (data[18] && data[18].malwareWhiteCount) {
          this.setState({
            malwareWhiteCount: data[18].malwareWhiteCount
          });
        }

        const parsedFrMotpData = JSON.parse(data[16].value);
        const frMotp = {
          ip: parsedFrMotpData.ip,
          apiKey: parsedFrMotpData.apiKey,
          enable: parsedFrMotpData.enable
        };

        const scannerSchedule = moment(data[17].value).local().format('YYYY-MM-DDTHH:mm:ss')

        this.setState({
          originalFrMotpSettings: _.cloneDeep(frMotp),
          frMotp,
          originalScannerSchedule: scannerSchedule,
          scannerSchedule
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
   * @param {string} [activeSettings] - option for field type
   */
  toggleContent = (type, activeSettings) => {
    const {
      originalServerOs,
      originalPcOs,
      originalScanFiles,
      originalScanFilesLinux,
      originalGcbVersion,
      originalPmInterval,
      originalFtpIp,
      originalFtpUrl,
      originalFtpAccount,
      originalCpeData,
      originalFrMotpSettings,
      originalScannerSchedule,
      fieldEnable
    } = this.state;
    let showPage = type;

    if (type === 'editMode') {
      let tempFieldEnable = {...fieldEnable};
      tempFieldEnable[activeSettings] = true;

      this.setState({
        activeSettings,
        fieldEnable: tempFieldEnable
      });
    } else if (type === 'save') {
      this.handleSettingsConfirm();
      return;
    } else if (type === 'cancel') {
      showPage = 'viewMode';

      this.setState({
        serverOs: _.cloneDeep(originalServerOs),
        pcOs: _.cloneDeep(originalPcOs),
        scanFiles: _.cloneDeep(originalScanFiles),
        scanFilesLinux: _.cloneDeep(originalScanFilesLinux),
        gcbVersion: _.cloneDeep(originalGcbVersion),
        pmInterval: _.cloneDeep(originalPmInterval),
        ftpIp: _.cloneDeep(originalFtpIp),
        ftpUrl: _.cloneDeep(originalFtpUrl),
        ftpAccount: _.cloneDeep(originalFtpAccount),
        cpeData: _.cloneDeep(originalCpeData),
        frMotp: _.cloneDeep(originalFrMotpSettings),
        scannerSchedule: _.cloneDeep(originalScannerSchedule)
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
   * Set path data for Linux
   * @method
   * @param {string} type - path type ('includePath' or 'excludePath')
   * @param {array} pathData - path data to be set
   */
  setScanFilesLinux = (type, pathData) => {
    let tempScanFilesLinux = {...this.state.scanFilesLinux};
    tempScanFilesLinux[type] = pathData;

    this.setState({
      scanFilesLinux: tempScanFilesLinux
    });
  }
  /**
   * Show Malware Detection path
   * @method
   * @param {string} val - malware detection list ('includePath' or 'excludePath')
   * @param {string} i - index of the  malware detection list
   * @returns HTML DOM
   */
  showMalwarePath = (val, i) => {
    const {scanFiles, fieldEnable} = this.state;

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
            defaultItemValue={{
              path: ''
            }}
            value={scanFiles[val]}
            onChange={this.setScanFiles.bind(this, val)} />
        }
      </div>
    )
  }
  /**
   * Show Malware Detection path for Linux
   * @method
   * @param {string} val - malware detection list
   * @param {string} i - index of the  malware detection list
   * @returns HTML DOM
   */
  showMalwarePathLinux = (val, i) => {
    const {scanFilesLinux, fieldEnable} = this.state;

    return (
      <div key={i} className='group'>
        <label>{t('hmd-scan.txt-' + val)}</label>
        {!fieldEnable.scanFilesLinux && scanFilesLinux[val].length > 0 &&
          <div className='flex-item'>{scanFilesLinux[val].map(this.displayScanFile)}</div>
        }
        {fieldEnable.scanFilesLinux &&
          <MultiInput
            className='file-path'
            base={InputPath}
            inline={true}
            defaultItemValue={{
              path: ''
            }}
            value={scanFilesLinux[val]}
            onChange={this.setScanFilesLinux.bind(this, val)} />
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
   * Set new time
   * @method
   * @param {object} newTime - new datetime object
   */
  handleScannerTimeChange = (newTime) => {
    this.setState({
      scannerSchedule: newTime
    });
  }
  /**
   * Handle HMD upload input value change
   * @method
   * @param {object} value - input data to be set
   */
  handleFileChange = (fileType, value) => {
    this.setState({
      [fileType]: value
    });
  }
  /**
   * Handle HMD export
   * @method
   */
  handleFileExport = () => {
    const {baseUrl, contextRoot} = this.context;
    const {datetimeExport} = this.state;
    const startDttm = moment(datetimeExport.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const endDttm = moment(datetimeExport.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const url = `${baseUrl}${contextRoot}/api/hmd/dbsync/ipdeviceAndtask/_export?startDttm=${startDttm}&endDttm=${endDttm}`;

    downloadLink(url);
  }
  /**
   * Handle HMD file import
   * @method
   */
  handleFileImport = (fileType) => {
    const {baseUrl} = this.context;
    const {[fileType]:file} = this.state;

    let url = fileType === 'hmdFile' ? `${baseUrl}/api/hmd/dbsync/ipdeviceAndtask/_import` : fileType === 'malwareWhiteListFile' ? `${baseUrl}/api/hmd/malware/whiteList/upload` : null;
    if (!url) return;

    let formData = new FormData();
    formData.append('file', file);

    if (!file) return;

    ah.one({
      url,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data) {
        if (data.ret === 0) {
          let msg = t('txt-uploadSuccess');

          if (data.rt && data.rt.totalCount) {
            msg = t('txt-uploadWhitelistSuccess', data.rt);

            if (data.rt.totalCount) {
              this.setState({
                malwareWhiteCount: data.rt.totalCount
              });
            }
          }
          helper.showPopupMsg(msg, msg === t('txt-uploadSuccess') ? null : t('txt-uploadSuccess'));
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get default file path
   * @method
   * @param {string} type - scan file type ('scanFiles' or 'scanFilesLinux')
   */
  getDefaultScanFile = (type) => {
    const {scanFilesDefault, scanFilesLinuxDefault} = this.state;

    if (type === 'scanFiles') {
      this.setState({
        scanFiles: scanFilesDefault
      });
    } else if (type === 'scanFilesLinux') {
      this.setState({
        scanFilesLinux: scanFilesLinuxDefault
      });
    }
  }
  /**
   * Show OS list
   * @method
   * @param {string} val - OS list
   * @param {string} i - index of the OS list
   * @returns HTML DOM
   */
  showOsList = (val, i) => {
    return <span key={i} className='flex-item'>{val.path}</span>
  }
  /**
   * Set path data
   * @method
   * @param {string} type - path type ('serverOs' or 'pcOs')
   * @param {array} osData - OS data to be set
   */
  setOSlist = (type, osData) => {
    this.setState({
      [type]: osData
    });
  }
  /**
   * Handle settings confirm
   * @method
   */
  handleSettingsConfirm = () => {
    const {baseUrl} = this.context;
    const {serverOs, pcOs, scanFiles, scanFilesLinux, gcbVersion, pmInterval, ftpIp, ftpUrl, ftpAccount, ftpPassword, cpeData, frMotp, scannerSchedule, activeSettings, fieldEnable, formValidation} = this.state;
    const url = `${baseUrl}/api/hmd/config`;
    let tempFormValidation = {...formValidation};
    let validate = true;
    let requestData = {};

    if (activeSettings === 'server') {
      requestData = {
        configId: 'hmd.server.os',
        value: _.uniq(_.map(serverOs, val => val.path))
      };
    } else if (activeSettings === 'pc') {
      requestData = {
        configId: 'hmd.pc.os',
        value: _.uniq(_.map(pcOs, val => val.path))
      };
    } else if (activeSettings === 'scanFiles') {
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
          type: 'hmd.scanFile.windows.path',
          value: parsedIncludePath.join()
        },
        {
          type: 'hmd.scanFile.windows.exclude.path',
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
    } else if (activeSettings === 'scanFilesLinux') {
      let parsedIncludePath = [];
      let parsedExcludePath = [];

      _.forEach(scanFilesLinux.includePath, val => {
        if (val.path) {
          parsedIncludePath.push(val.path);
        }
      });

      _.forEach(scanFilesLinux.excludePath, val => {
        if (val.path) {
          parsedExcludePath.push(val.path);
        }
      });

      const scanType = [
        {
          type: 'hmd.scanFile.linux.path',
          value: parsedIncludePath.join()
        },
        {
          type: 'hmd.scanFile.linux.exclude.path',
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
    } else if (activeSettings === 'frMotp') {
      requestData = {
        configId: 'hmd.frmotp',
        value: JSON.stringify(frMotp)
      };
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
    } else if (activeSettings === 'scannerSchedule') {
      requestData = {
        configId: 'hmd.scanner.schedule',
        value: moment(scannerSchedule).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
      };
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
   * Clear validations data
   * @method
   */
  clearData = () => {
    this.setState({
      ftpPassword: '',
      connectionsStatus: '',
      activeSettings: '',
      fieldEnable: _.cloneDeep(FIELD_ENABLE),
      formValidation: _.cloneDeep(FORM_VALIDATION)
    });
  }
  renderContent = () => {
    const {locale} = this.context;
    const {mode} = this.props;
    const {
      activeContent,
      datetimeExport,
      serverOs,
      pcOs,
      malwareWhiteCount,
      gcbVersion,
      pmInterval,
      ftpIp,
      ftpUrl,
      ftpAccount,
      ftpPassword,
      connectionsStatus,
      frMotp,
      scannerSchedule,
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
      <div className='hmd-settings' style={{height: mode === 'normal' ? activeContent === 'viewMode' ? '78vh' : '70vh' : 'auto'}}>
        <div className={cx('form-group normal long', {'disabled-status': activeContent === 'editMode' && !fieldEnable.server})}>
          <header>{t('hmd-scan.txt-serverOs')}</header>
          <div className='header-btn-group'>
            {activeContent === 'viewMode' &&
              <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode', 'server')}>{t('txt-edit')}</Button>
            }
          </div>
          {!fieldEnable.server &&
            <div className='group'>
              {serverOs.length > 0 &&
                <div className='flex-item'>{serverOs.map(this.showOsList)}</div>
              }
              {serverOs.length === 0 &&
                <div>{NOT_AVAILABLE}</div>
              }
            </div>
          }
          {fieldEnable.server &&
            <MultiInput
              base={InputPath}
              inline={true}
              defaultItemValue={{
                path: ''
              }}
              value={serverOs}
              onChange={this.setOSlist.bind(this, 'serverOs')} />
          }
        </div>

        <div className={cx('form-group normal long', {'disabled-status': activeContent === 'editMode' && !fieldEnable.pc})}>
          <header>{t('hmd-scan.txt-pcOs')}</header>
          <div className='header-btn-group'>
            {activeContent === 'viewMode' &&
              <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode', 'pc')}>{t('txt-edit')}</Button>
            }
          </div>
          {!fieldEnable.pc &&
            <div className='group'>
              {pcOs.length > 0 &&
                <div className='flex-item'>{pcOs.map(this.showOsList)}</div>
              }
              {pcOs.length === 0 &&
                <div>{NOT_AVAILABLE}</div>
              }
            </div>
          }
          {fieldEnable.pc &&
            <MultiInput
              base={InputPath}
              inline={true}
              defaultItemValue={{
                path: ''
              }}
              value={pcOs}
              onChange={this.setOSlist.bind(this, 'pcOs')} />
          }
        </div>

        <div className={cx('form-group normal long', {'disabled-status': activeContent === 'editMode' && !fieldEnable.scanFiles})}>
          <header>{t('hmd-scan.scan-list.txt-scanFile')}</header>
          <div className='header-btn-group'>
            {activeContent === 'editMode' && fieldEnable.scanFiles &&
              <Button variant='contained' color='primary' onClick={this.getDefaultScanFile.bind(this, 'scanFiles')}>{t('hmd-scan.txt-restoreDefault')}</Button>
            }
            {activeContent === 'viewMode' &&
              <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode', 'scanFiles')}>{t('txt-edit')}</Button>
            }
          </div>
          {MALWARE_DETECTION.map(this.showMalwarePath)}
        </div>

        <div className={cx('form-group normal long', {'disabled-status': activeContent === 'editMode' && !fieldEnable.scanFilesLinux})}>
          <header>{t('hmd-scan.scan-list.txt-scanFileLinux')}</header>
          <div className='header-btn-group'>
            {activeContent === 'editMode' && fieldEnable.scanFilesLinux &&
              <Button variant='contained' color='primary' onClick={this.getDefaultScanFile.bind(this, 'scanFilesLinux')}>{t('hmd-scan.txt-restoreDefault')}</Button>
            }
            {activeContent === 'viewMode' &&
              <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode', 'scanFilesLinux')}>{t('txt-edit')}</Button>
            }
          </div>
          {MALWARE_DETECTION.map(this.showMalwarePathLinux)}
        </div>

        <div className='form-group normal long'>
          <header>{t('hmd-scan.txt-scanFileWhitelist')}</header>
          <div className='header-btn-group'>
          </div>
          {malwareWhiteCount !== -1 &&
          <div className='sub-section'>
            <span>{t('hmd-scan.txt-whitelistSize')}: {malwareWhiteCount}</span>
          </div>
          }
          <div className='sub-section'>
            <div className='import-header'>{t('txt-import')}</div>
            <FileUpload
              id='importMalwareWhiteList'
              fileType='csv'
              btnText={t('txt-selectFile')}
              handleFileChange={(val) => this.handleFileChange('malwareWhiteListFile', val)} />
            <Button variant='contained' color='primary' className='import-btn' onClick={(val) => this.handleFileImport('malwareWhiteListFile')}>{t('txt-import')}</Button>
          </div>
        </div>
        
        <div className={cx('form-group normal long', {'disabled-status': activeContent === 'editMode' && !fieldEnable.gcb})}>
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

        <div className={cx('form-group normal long', {'disabled-status': activeContent === 'editMode' && !fieldEnable.processMonitor})}>
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

        <div className={cx('form-group normal long', {'disabled-status': activeContent === 'editMode' && !fieldEnable.scannerSchedule})}>
          <header>{t('hmd-scan.txt-scannerSchedule')}</header>
          <div className='header-btn-group'>
            {activeContent === 'viewMode' &&
              <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'editMode', 'scannerSchedule')}>{t('txt-edit')}</Button>
            }
          </div>
          <div className='sub-section'>
            <div className='time-picker'>
              <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
                <KeyboardTimePicker
                  id='hmdSettingsTimePicker'
                  inputVariant='outlined'
                  variant='inline'
                  invalidDateMessage={t('txt-invalidDateMessage')}
                  ampm={false}
                  value={scannerSchedule}
                  onChange={this.handleScannerTimeChange}
                  disabled={!fieldEnable.scannerSchedule} />
              </MuiPickersUtilsProvider>
            </div>
          </div>
        </div>

        <div className={cx('form-group normal long', {'disabled-status': activeContent === 'editMode' && !fieldEnable.ftpUpload})}>
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

        <div className={cx('form-group normal', {'disabled-status': activeContent === 'editMode' && !fieldEnable.frMotp})}>
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

        <div className={cx('form-group normal long', {'disabled-status': activeContent === 'editMode' && !fieldEnable.security})}>
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
          <div className='sub-section space'>
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
              handleFileChange={(val) => this.handleFileChange('hmdFile', val)} />
            <Button variant='contained' color='primary' className='import-btn' onClick={(val) => this.handleFileImport('hmdFile')}>{t('txt-import')}</Button>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const {mode, onClose} = this.props;
    const {activeContent} = this.state;

    if (mode === 'normal') {
      return <div className='parent-content'>
        <div className='main-content basic-form'>
          <header className='main-header'>{t('hmd-scan.txt-hmdSettings')}</header>

          {activeContent === 'viewMode' &&
            <div className='content-header-btns'>
              <Button variant='outlined' color='primary' className='standard btn no-padding'>
                <Link to={{pathname: '/SCP/host', state: 'hostContent'}}>{t('txt-back')}</Link>
              </Button>
            </div>
          }

          {this.renderContent()}

          {activeContent === 'editMode' &&
            <footer>
              <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</Button>
              <Button variant='contained' color='primary' onClick={this.toggleContent.bind(this, 'save')}>{t('txt-save')}</Button>
            </footer>
          }
        </div>
      </div>
    } else if (mode === 'modal') {
      let actions = {}
      if (activeContent === 'viewMode') {
        actions = {
          cancel: {text: t('txt-close'), handler: onClose}
        };
      } else {
        actions = {
          cancel: {text: t('txt-cancel'), handler: this.toggleContent.bind(this, 'cancel')},
          save: {text: t('txt-save'), handler: this.toggleContent.bind(this, 'save')}
        };
      }

      return (
        <ModalDialog
          id='hmdSettingsDialog'
          className='modal-dialog'
          title={t('hmd-scan.txt-hmdSettings')}
          draggable={true}
          global={true}
          actions={actions}
          closeAction='cancel'>
          <div className='data-content'>
            <div className='parent-content'>
              <div className='main-content basic-form'>
                {this.renderContent()}
              </div>
            </div>
          </div>
        </ModalDialog>
      )
    }
  }
}

HMDsettings.contextType = BaseDataContext;

HMDsettings.propTypes = {
};

export default HMDsettings;