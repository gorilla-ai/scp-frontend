import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import VansNotes from './vans-notes'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';
let t = null;
let f = null;

/**
 * Safety Details
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the safety scan information
 */
class SafetyDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contentType: '', //'basicInfo' or 'availableHost'
      showVansNotes: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.toggleContent(this.props.showSafetyTab);
    this.checkVansNotes();
  }
  /**
   * Toggle content type
   * @method
   * @param {string} contentType - content type ('basicInfo' or 'availableHost')
   */
  toggleContent = (contentType) => {
    this.setState({
      contentType
    });
  }
  /**
   * Show / not show default Vans notes
   * @method
   */
  checkVansNotes = () => {
    const {currentSafetyData} = this.props;

    if (currentSafetyData.annotationObj && (currentSafetyData.annotationObj.status || currentSafetyData.annotationObj.annotation)) {
      this.setState({
        showVansNotes: true
      });
    }
  }
  /**
   * Toggle Vans note content on/off
   * @method
   */
  toggleVansNotes = () => {
    this.setState({
      showVansNotes: !this.state.showVansNotes
    });
  }
  /**
   * Display top table header
   * @method
   * @returns HTML DOM
   */
  getTopTableHeader = () => {
    const {safetyScanType} = this.props;

    if (safetyScanType === 'scanFile') {
      return (
        <tr>
          <th>Hash Value (MD5)</th>
          <th>{t('host.txt-fileSize')}</th>
          <th>{t('host.txt-isPEfile')}</th>
          <th>{t('host.txt-isPEextension')}</th>
          <th>{t('host.txt-isSignature')}</th>
        </tr>
      )
    } else if (safetyScanType === 'gcbDetection') {
      return (
        <tr>
          <th>CCE-ID</th>
          <th>{t('host.txt-originalFactory')}</th>
          <th>{t('host.txt-systemType')}</th>
        </tr>
      )
    } else if (safetyScanType === 'getFileIntegrity') {
      return (
        <tr>
          <th>MD5</th>
          <th>{t('host.txt-suspiciousFilePathExample')}</th>
        </tr>
      )
    } else if (safetyScanType === 'getEventTraceResult') {
      return (
        <tr>
          <th>{t('host.txt-eventCode')}</th>
          <th>{t('host.txt-eventDescExample')}</th>
        </tr>
      )
    } else if (safetyScanType === 'getProcessMonitorResult') {
      return (
        <tr>
          <th>MD5</th>
          <th>{t('host.txt-suspiciousFilePathExample')}</th>
        </tr>
      )
    } else if (safetyScanType === 'getVansCpe') {
      return (
        <tr>
          <th>CPE ID</th>
          <th>{t('host.txt-type')}</th>
          <th>{t('host.txt-vendor')}</th>
          <th>{t('host.txt-product')}</th>
          <th>{t('host.txt-version')}</th>
        </tr>
      )
    } else if (safetyScanType === 'getVansCve') {
      return (
        <tr>
          <th>CVE ID</th>
          <th>{t('txt-severity')}</th>
        </tr>
      )
    }
  }
  /**
   * Format primary content length
   * @method
   * @param {string} content - Safety Scan content
   * @param {number} length - length of content
   * @returns formatted content
   */
  getFormattedLength = (content, length) => {
    if (content.length > length) {
      const newValue = content.substr(0, length) + '...';
      content = <span title={content}>{newValue}</span>;
    } else {
      content = <span>{content}</span>;
    }
    return content;
  }
  /**
   * Display top table body
   * @method
   * @returns HTML DOM
   */
  getTopTableBody = () => {
    const {locale} = this.context;
    const {currentSafetyData, safetyScanType} = this.props;

    if (safetyScanType === 'scanFile') {
      return (
        <tr>
          <td>{currentSafetyData.primaryKeyValue}</td>
          <td>{helper.numberWithCommas(helper.formatBytes(currentSafetyData.rawJsonObject._FileInfo._Filesize))}</td>
          <td><span style={{color: currentSafetyData.rawJsonObject._IsPE ? '#70c97e' : '#e15b6b'}}>{t('txt-' + currentSafetyData.rawJsonObject._IsPE.toString())}</span></td>
          <td><span style={{color: currentSafetyData.rawJsonObject._IsPEextension ? '#70c97e' : '#e15b6b'}}>{t('txt-' + currentSafetyData.rawJsonObject._IsPEextension.toString())}</span></td>
          <td><span style={{color: currentSafetyData.rawJsonObject._IsVerifyTrust ? '#70c97e' : '#e15b6b'}}>{t('txt-' + currentSafetyData.rawJsonObject._IsVerifyTrust.toString())}</span></td>
        </tr>
      )
    } else if (safetyScanType === 'gcbDetection') {
      let policyContent = '';

      if (locale === 'zh' && currentSafetyData.rawJsonObject['_PolicyName_zh-tw']) {
        policyContent = currentSafetyData.rawJsonObject['_PolicyName_zh-tw'];
      } else if (locale === 'en' && currentSafetyData.rawJsonObject['_PolicyName_en']) {
        policyContent = currentSafetyData.rawJsonObject['_PolicyName_en'];
      }

      return (
        <tr>
          <td>{currentSafetyData.primaryKeyValue}</td>
          <td>{policyContent}</td>
          <td>{currentSafetyData.rawJsonObject._Type}</td>
        </tr>
      )
    } else if (safetyScanType === 'getFileIntegrity') {
      return (
        <tr>
          <td>{currentSafetyData.primaryKeyValue}</td>
          <td>{currentSafetyData.rawJsonObject._FileIntegrityResultPath}</td>
        </tr>
      )
    } else if (safetyScanType === 'getEventTraceResult') {
      return (
        <tr>
          <td>{currentSafetyData.primaryKeyValue}</td>
          <td>{currentSafetyData.rawJsonObject.message ? this.getFormattedLength(currentSafetyData.rawJsonObject.message, 80) : NOT_AVAILABLE}</td>
        </tr>
      )
    } else if (safetyScanType === 'getProcessMonitorResult') {
      return (
        <tr>
          <td>{currentSafetyData.primaryKeyValue}</td>
          <td>{currentSafetyData.rawJsonObject._ProcessInfo._ExecutableInfo._FileInfo._Filepath}</td>
        </tr>
      )
    } else if (safetyScanType === 'getVansCpe') {
      const type = currentSafetyData.rawJsonObject.part;
      let typeText = '';

      if (type === 'a') {
        typeText = t('host.txt-software');
      } else if (type === 'h') {
        typeText = t('host.txt-hardware');
      } else if (type === 'o') {
        typeText = t('host.txt-os');
      }

      return (
        <tr>
          <td>{currentSafetyData.primaryKeyValue}</td>
          <td>{typeText}</td>
          <td>{currentSafetyData.rawJsonObject.vendor}</td>
          <td>{currentSafetyData.rawJsonObject.product}</td>
          <td>{currentSafetyData.rawJsonObject.version}</td>
        </tr>
      )
    } else if (safetyScanType === 'getVansCve') {
      const severity = currentSafetyData.rawJsonObject.severity.toLowerCase();

      return (
        <tr>
          <td>{currentSafetyData.primaryKeyValue}</td>
          <td><span className={severity}>{t('txt-' + severity)}</span></td>
        </tr>
      )
    }
  }
  /**
   * Display individual file
   * @method
   * @param {string} val - safety scan file data
   * @param {number} i - index of the file array
   * @returns HTML DOM
   */
  displayIndividualFile = (val, i) => {
    return (
      <li key={i}>{val}</li>
    )
  }
  /**
   * Display file path for Yara Scan and Process Monitor
   * @method
   * @param {object} safetyData - safety scan data
   * @returns HTML DOM
   */
  displayFilePath = (safetyData) => {
    let filePathList = [];
    let displayInfo = '';

    _.forEach(safetyData.rawJsonObject._ProcessInfo._ModulesInfo, val => {
      if (val._FileInfo && val._FileInfo._Filepath) {
        filePathList.push(val._FileInfo._Filepath);
      }
    })

    if (filePathList.length > 0) {
      displayInfo = filePathList.map(this.displayIndividualFile);
    } else {
      displayInfo = NOT_AVAILABLE;
    }

    return (
      <div>
        <ul>
          {displayInfo}
        </ul>
      </div>
    )
  }
  /**
   * Display individual connection for Yara Scan and Process Monitor
   * @method
   * @param {object} val - connection data
   * @param {number} i - index of the connections array
   * @returns HTML DOM
   */
  displayIndividualConnection = (val, i) => {
    return (
      <ul key={i} className='item'>
        <li><span className='blue-color'>{t('attacksFields.protocolType')}:</span> {val.protocol || NOT_AVAILABLE}</li>
        <li><span className='blue-color'>{t('attacksFields.srcIp')}:</span> {val.srcIp || NOT_AVAILABLE}</li>
        <li><span className='blue-color'>{t('attacksFields.srcPort')}:</span> {val.srcPort || NOT_AVAILABLE}</li>
        <li><span className='blue-color'>{t('attacksFields.destIp')}:</span> {val.destIP || NOT_AVAILABLE}</li>
        <li><span className='blue-color'>{t('attacksFields.destPort')}:</span> {val.destPort || NOT_AVAILABLE}</li>
      </ul>
    )
  }
  /**
   * Display connections for Yara Scan and Process Monitor
   * @method
   * @param {object} safetyData - safety scan data
   * @returns HTML DOM
   */
  displayConnections = (safetyData) => {
    let connectionsList = [];
    let displayInfo = '';

    _.forEach(safetyData.rawJsonObject._ProcessInfo._ConnectionList, val => {
      connectionsList.push({
        destIp: val._DstIP,
        destPort: val._DstPort,
        protocol: val._ProtocolType,
        srcIp: val._SrcIP,
        srcPort: val._SrcPort
      });
    })

    if (connectionsList.length > 0) {
      displayInfo = connectionsList.map(this.displayIndividualConnection);
    } else {
      displayInfo = NOT_AVAILABLE;
    }

    return (
      <div className='flex-item'>
        {displayInfo}
      </div>
    )
  }
  /**
   * Display item for Executable Info
   * @method
   * @param {object} safetyData - safety scan data
   * @param {string} val - executable list
   * @param {number} i - index of the executable list array
   * @returns HTML DOM
   */
  displayExecutableList = (safetyData, val, i) => {
    let value = safetyData.rawJsonObject._ProcessInfo._ExecutableInfo[val];

    if (val === '_AutorunLocation' || val === '_CommandLine') {
      value = safetyData.rawJsonObject._ProcessInfo[val];
    }

    if (val === '_Filepath' || val === '_Filesize') {
      value = safetyData.rawJsonObject._ProcessInfo._ExecutableInfo._FileInfo[val];

      if (val === '_Filesize') {
        value = helper.numberWithCommas(helper.formatBytes(value));
      }
    }

    if (val === '_MD5' || val === '_SHA1' || val === '_SHA256') {
      value = safetyData.rawJsonObject._ProcessInfo._ExecutableInfo._FileInfo._HashValues[val];
    }

    if (val === '_IsPE') {
      value = <span style={{color : val ? '#22ac38' : '#d0021b'}}>{safetyData.rawJsonObject._ProcessInfo._ExecutableInfo[val].toString()}</span>;
    }

    if (val === '_Signatures') { //Signature is an array type
      let signatureList = '';
      value = '';

      if (safetyData.rawJsonObject._ProcessInfo && safetyData.rawJsonObject._ProcessInfo._ExecutableInfo[val].length > 0) {
        _.forEach(safetyData.rawJsonObject._ProcessInfo._ExecutableInfo[val], val => {
          signatureList = <ul><li><span className='blue-color'>{t('hmd-scan.signature._CertificateType')}</span>: {val._CertificateType}</li><li><span className='blue-color'>{t('hmd-scan.signature._IssuerName')}</span>: {val._IssuerName}</li><li><span className='blue-color'>{t('hmd-scan.signature._SerialNumber')}</span>: {val._SerialNumber}</li><li><span className='blue-color'>{t('hmd-scan.signature._SubjectName')}</span>: {val._SubjectName}</li></ul>;
        })
      }

      if (signatureList) {
        value = <ul className='signature-list'>{signatureList}</ul>;
      }
    }

    return <li key={i}><span className='blue-color'>{t('hmd-scan.executable-list.txt-' + val)}</span>: {value || NOT_AVAILABLE}</li>
  }
  /**
   * Display Executable Info for Process Monitor
   * @method
   * @param {object} safetyData - safety scan data
   * @returns HTML DOM
   */
  displayExecutableInfo = (safetyData) => {
    const executableList = ['_AutorunLocation', '_CommandLine', '_CompanyName', '_Filepath', '_Filesize', '_MD5', '_SHA1', '_SHA256', '_IsPE', '_OwnerSID', '_Signatures'];

    if (safetyData.rawJsonObject._ProcessInfo && safetyData.rawJsonObject._ProcessInfo._ExecutableInfo) {
      return (
        <div>
          <ul>
            {executableList.map(this.displayExecutableList.bind(this, safetyData))}
          </ul>
        </div>
      )
    }
  }
  /**
   * Display basic info content
   * @method
   * @returns HTML DOM
   */
  getBasicInfoContent = () => {
    const {locale} = this.context;
    const {currentSafetyData, safetyScanType} = this.props;

    if (safetyScanType === 'scanFile') {
      return (
        <tbody>
          <tr>
            <td><span className='blue-color'>Hash Value (MD5)</span></td>
            <td>{currentSafetyData.primaryKeyValue}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-fileSize')}</span></td>
            <td>{helper.numberWithCommas(helper.formatBytes(currentSafetyData.rawJsonObject._FileInfo._Filesize))}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-isPEfile')}</span></td>
            <td><span style={{color: currentSafetyData.rawJsonObject._IsPE ? '#70c97e' : '#e15b6b'}}>{t('txt-' + currentSafetyData.rawJsonObject._IsPE.toString())}</span></td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-isPEextension')}</span></td>
            <td><span style={{color: currentSafetyData.rawJsonObject._IsPEextension ? '#70c97e' : '#e15b6b'}}>{t('txt-' + currentSafetyData.rawJsonObject._IsPEextension.toString())}</span></td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-isSignature')}</span></td>
            <td><span style={{color: currentSafetyData.rawJsonObject._IsVerifyTrust ? '#70c97e' : '#e15b6b'}}>{t('txt-' + currentSafetyData.rawJsonObject._IsVerifyTrust.toString())}</span></td>
          </tr>
        </tbody>
      )
    } else if (safetyScanType === 'gcbDetection') {
      let policyContent = '';

      if (locale === 'zh' && currentSafetyData.rawJsonObject['_PolicyName_zh-tw']) {
        policyContent = currentSafetyData.rawJsonObject['_PolicyName_zh-tw'];
      } else if (locale === 'en' && currentSafetyData.rawJsonObject['_PolicyName_en']) {
        policyContent = currentSafetyData.rawJsonObject['_PolicyName_en'];
      }

      return (
        <tbody>
          <tr>
            <td><span className='blue-color'>CCE-ID</span></td>
            <td>{currentSafetyData.primaryKeyValue}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-originalFactory')}</span></td>
            <td>{policyContent}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-systemType')}</span></td>
            <td>{currentSafetyData.rawJsonObject._Type}</td>
          </tr>
        </tbody>
      )
    } else if (safetyScanType === 'getFileIntegrity') {
      return (
        <tbody>
          <tr>
            <td><span className='blue-color'>MD5</span></td>
            <td>{currentSafetyData.primaryKeyValue}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-suspiciousFilePathExample')}</span></td>
            <td>{currentSafetyData.rawJsonObject._FileIntegrityResultPath}</td>
          </tr>
        </tbody>
      )
    } else if (safetyScanType === 'getEventTraceResult') {
      return (
        <tbody>
          <tr>
            <td><span className='blue-color'>{t('host.txt-eventCode')}</span></td>
            <td>{currentSafetyData.primaryKeyValue}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-eventDescExample')}</span></td>
            <td>{currentSafetyData.rawJsonObject.message || NOT_AVAILABLE}</td>
          </tr>
        </tbody>
      )
    } else if (safetyScanType === 'getProcessMonitorResult') {
      return (
        <tbody>
          <tr>
            <td style={{minWidth: '80px'}}><span className='blue-color'>DLLs</span></td>
            <td>{this.displayFilePath(currentSafetyData)}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('txt-networkBehavior')}</span></td>
            <td>{this.displayConnections(currentSafetyData)}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('txt-executableInfo')}</span></td>
            <td>{this.displayExecutableInfo(currentSafetyData)}</td>
          </tr>
        </tbody>
      )
    } else if (safetyScanType === 'getVansCpe') {
      const type = currentSafetyData.rawJsonObject.part;
      let typeText = '';

      if (type === 'a') {
        typeText = t('host.txt-software');
      } else if (type === 'h') {
        typeText = t('host.txt-hardware');
      } else if (type === 'o') {
        typeText = t('host.txt-os');
      }

      return (
        <tbody>
          <tr>
            <td><span className='blue-color'>CPE ID</span></td>
            <td>{currentSafetyData.primaryKeyValue}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-type')}</span></td>
            <td>{typeText}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-vendor')}</span></td>
            <td>{currentSafetyData.rawJsonObject.vendor}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-product')}</span></td>
            <td>{currentSafetyData.rawJsonObject.product}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-version')}</span></td>
            <td>{currentSafetyData.rawJsonObject.version}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-update')}</span></td>
            <td>{currentSafetyData.rawJsonObject.update}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-edition')}</span></td>
            <td>{currentSafetyData.rawJsonObject.edition}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('host.txt-language')}</span></td>
            <td>{currentSafetyData.rawJsonObject.language}</td>
          </tr>
        </tbody>
      )
    } else if (safetyScanType === 'getVansCve') {
      let severity = '';
      let color = '';

      if (currentSafetyData.rawJsonObject.severity) {
        severity = currentSafetyData.rawJsonObject.severity.toLowerCase();

        if (severity === 'high') {
          color = '#CC2943';
        } else if (severity === 'medium') {
          color = '#CC7B29';
        } else if (severity === 'low') {
          color = '#29CC7A';
        }
      }

      return (
        <tbody>
          <tr>
            <td><span className='blue-color'>{t('txt-severity')}</span></td>
            <td><span style={{color}}>{t('txt-' + severity)}</span></td>
          </tr>
          {currentSafetyData.rawJsonObject.description.description_data.length > 0 &&
            <tr>
              <td><span className='blue-color'>{t('txt-description')}</span></td>
              <td>{currentSafetyData.rawJsonObject.description.description_data.map(this.displayVansContent.bind(this, 'desc'))}</td>
            </tr>
          }
          {currentSafetyData.rawJsonObject.cpeRecordDTOs.length > 0 &&
            <tr>
              <td><span className='blue-color'>CPE ID</span></td>
              <td><ul>{currentSafetyData.rawJsonObject.cpeRecordDTOs.map(this.displayVansContent.bind(this, 'cpeID'))}</ul></td>
            </tr>
          }
          {currentSafetyData.rawJsonObject.referenceData.reference_data.length > 0 &&
            <tr>
              <td><span className='blue-color'>{t('txt-reference')}</span></td>
              <td><ul>{currentSafetyData.rawJsonObject.referenceData.reference_data.map(this.displayVansContent.bind(this, 'ref'))}</ul></td>
            </tr>
          }
          <tr>
            <td><span className='blue-color'>{t('hmd-scan.txt-publishedDate')}</span></td>
            <td>{helper.getFormattedDate(currentSafetyData.rawJsonObject.publishedDate, 'local')}</td>
          </tr>
          <tr>
            <td><span className='blue-color'>{t('hmd-scan.txt-lastModifiedDate')}</span></td>
            <td>{helper.getFormattedDate(currentSafetyData.rawJsonObject.lastModifiedDate, 'local')}</td>
          </tr>
        </tbody>
      )
    }
  }
  /**
   * Display Vans individual data
   * @method
   * @param {string} type - content type ('cpeID', desc' or 'ref')
   * @param {object} val - individual vans data
   * @param {number} i - index of the vans data
   * @returns HTML DOM
   */
  displayVansContent = (type, val, i) => {
    if (type === 'cpeID' && val.name) {
      return <li key={i}>{val.name}</li>
    }

    if (type === 'desc' && val.value) {
      return <div key={i} className='desc'>{val.value}</div>
    }

    if (type === 'ref' && val.url) {
      return <li key={i}><a href={val.url} target='_blank'>{val.url}</a></li>
    }
  }
  /**
   * Display individual table row for Host
   * @method
   * @param {string} val - safety scan file data
   * @param {number} i - index of the file array
   * @returns HTML DOM
   */
  getHostTableBody = (val, i) => {
    const {safetyScanType} = this.props;
    let type = '';    

    switch (safetyScanType) {
      case 'scanFile':
        type = 'scanFileResult';
        break;
      case 'gcbDetection':
        type = 'gcbResult';
        break;
      case 'getFileIntegrity':
        type = 'fileIntegrityResult';
        break;
      case 'getEventTraceResult':
        type = 'eventTracingResult';
        break;
      case 'getProcessMonitorResult':
        type = 'procMonitorResult';
        break;
      case 'getVansCpe':
        type = '_VansResult';
        break;
      case 'getVansCve':
        type = '_VansResult';
        break;
    }

    return (
      <tr key={i}>
        <td>{val.ip}</td>
        <td>{val.hostName}</td>
        <td>{val.system}</td>
        <td>{val.userName}</td>
        <td>{val.version}</td>
        {safetyScanType === 'scanFile' &&
          <td>{val.hostIdObj._Filepath}</td>
        }
        {safetyScanType === 'gcbDetection' &&
          <td>{val.hostIdObj._GcbValue || NOT_AVAILABLE}</td> 
        }
        {safetyScanType === 'gcbDetection' &&
          <td>{val.hostIdObj._GpoValue || NOT_AVAILABLE}</td>
        }
        {safetyScanType === 'getFileIntegrity' &&
          <td>{val.hostIdObj.Md5HashInfo._BaselineMd5Hash || NOT_AVAILABLE}</td>
        }
        {safetyScanType === 'getFileIntegrity' &&
          <td>{val.hostIdObj.Md5HashInfo._RealMd5Hash || NOT_AVAILABLE}</td>
        }
        {safetyScanType === 'getFileIntegrity' &&
          <td>{val.hostIdObj._FileIntegrityResultPath || NOT_AVAILABLE}</td>
        }
        {safetyScanType === 'getEventTraceResult' &&
          <td>{val.hostIdObj.doc_count}</td>
        }
        {safetyScanType === 'getProcessMonitorResult' &&
          <td>{val.hostIdObj._Filepath}</td>
        }
        <td><i className='fg fg-eye' onClick={this.props.getIPdeviceInfo.bind(this, val, 'toggle', type)} title={t('txt-view')}></i></td>
      </tr>
    )
  }
  /**
   * Display individual table row for CVE info
   * @method
   * @param {number} currentSafetyData - current safety data
   * @param {string} val - CVE data
   * @param {number} i - index of the CVE data array
   * @returns HTML DOM
   */
  getCveInfo = (currentSafetyData, val, i) => {
    const severity = val.severity.toLowerCase();

    return (
      <tr>
        <td className='name'>
          <span>{val.id}</span><span className={severity}>{t('txt-' + severity)}</span>
        </td>
        <td>
          <div>{this.getFormattedLength(val.description.description_data[0].value, 70)}</div>
        </td>
        <td className='host'>
          <span>{t('host.txt-hostCount')}: {currentSafetyData.hostIdArraySize}</span> 
        </td>
        <td className='info'>
          <span onClick={this.props.getHostInfo.bind(this, val, currentSafetyData, 'safetyPage')}>{t('host.txt-viewInfo')}</span>
        </td>
      </tr>
    )
  }
  /**
   * Display Safety Scan content
   * @method
   * @returns HTML DOM
   */
  displaySafetyDetails = () => {
    const {currentSafetyData, safetyScanType, vansHmdStatusList} = this.props;
    const {contentType, showVansNotes} = this.state;

    let basicInfoText = t('host.txt-basicInfo');

    if (safetyScanType === 'getFileIntegrity' || safetyScanType === 'getProcessMonitorResult') {
      basicInfoText = t('host.txt-basicInfoExample');
    }

    if (!_.isEmpty(currentSafetyData)) {
      return (
        <div>
          <table className='c-table main-table align-center with-border'>
            <thead>
              {this.getTopTableHeader()}
            </thead>
            <tbody>
              {this.getTopTableBody()}
            </tbody>
          </table>

          <div className='main-content'>
            <div className='nav'>
              <ul>
                <li className={cx('header', {'active': contentType === 'basicInfo'})} onClick={this.toggleContent.bind(this, 'basicInfo')}><span>{basicInfoText}</span></li>
                <li className={cx('header', {'active': contentType === 'availableHost'})} onClick={this.toggleContent.bind(this, 'availableHost')}><span>{t('host.txt-availableHost')}</span><span className='host-count'>{currentSafetyData.hostIdArraySize}</span></li>
                <li className='header' onClick={this.toggleVansNotes}><span>{t('host.txt-vansNotes')}</span> <i className={`fg fg-arrow-${showVansNotes ? 'bottom' : 'top'}`}></i></li>
              </ul>
              {showVansNotes &&
                <VansNotes
                  currentData={currentSafetyData}
                  currentType={safetyScanType}
                  vansHmdStatusList={vansHmdStatusList} />
              }
            </div>
            <div className='content'>
              <div className='safety-details'>
                {contentType === 'basicInfo' &&
                  <div>
                    <div className='header trigger'>{basicInfoText}</div>
                    <div className='trigger-text'>{t('hmd-scan.txt-lastUpdate')}: {helper.getFormattedDate(currentSafetyData.createDttm, 'local')}</div>
                    <table className='c-table main-table safety'>
                      {this.getBasicInfoContent()}
                    </table>

                    {safetyScanType === 'getVansCpe' &&
                      <table className='c-table main-table cve'>
                        <tbody>
                          {currentSafetyData.rawJsonObject.rows &&
                            currentSafetyData.rawJsonObject.rows.map(this.getCveInfo.bind(this, currentSafetyData))
                          }
                        </tbody>
                      </table>
                    }
                  </div>
                }
                {contentType === 'availableHost' &&
                  <div>
                    <div className='header trigger'>{t('host.txt-availableHost')}</div>
                    <div className='trigger-text'>{t('hmd-scan.txt-lastUpdate')}: {helper.getFormattedDate(currentSafetyData.createDttm, 'local')}</div>
                    <table className='c-table main-table with-border'>
                      <thead>
                        <tr>
                          <th>{t('ipFields.ip')}</th>
                          <th>{t('ipFields.hostName')}</th>
                          <th>{t('ipFields.system')}</th>
                          <th>{t('ipFields.owner')}</th>
                          <th>{t('ipFields.version')}</th>
                          {safetyScanType === 'scanFile' &&
                            <th>{t('host.txt-suspiciousFilePath')}</th>
                          }
                          {safetyScanType === 'gcbDetection' &&
                            <th>GCB Value</th>
                          }
                          {safetyScanType === 'gcbDetection' &&
                            <th>GPO Value</th>
                          }
                          {safetyScanType === 'getFileIntegrity' &&
                            <th>Baseline MD5</th>
                          }
                          {safetyScanType === 'getFileIntegrity' &&
                            <th>Real MD5</th>
                          }
                          {safetyScanType === 'getFileIntegrity' &&
                            <th>{t('txt-path')}</th>
                          }
                          {safetyScanType === 'getEventTraceResult' &&
                            <th>{t('host.txt-eventCount')}</th>
                          }
                          {safetyScanType === 'getProcessMonitorResult' &&
                            <th>{t('host.txt-suspiciousFilePath')}</th>
                          }
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSafetyData.disDevDtos.length > 0 &&
                          currentSafetyData.disDevDtos.map(this.getHostTableBody)
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
  render() {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.props.toggleSafetyDetails.bind(this, '', this.props.fromSafetyPage)}
    };

    return (
      <div>
        <ModalDialog
          id='hostModalDialog'
          className='modal-dialog'
          title={t('host.txt-title-' + this.props.safetyScanType)}
          draggable={true}
          global={true}
          actions={actions}
          closeAction='confirm'>
          {this.displaySafetyDetails()}
        </ModalDialog>
      </div>
    )
  }
}

SafetyDetails.contextType = BaseDataContext;

SafetyDetails.propTypes = {
  currentSafetyData: PropTypes.object.isRequired,
  safetyScanType: PropTypes.string.isRequired,
  showSafetyTab: PropTypes.string.isRequired,
  fromSafetyPage: PropTypes.bool.isRequired,
  vansHmdStatusList: PropTypes.array.isRequired,
  getHostInfo: PropTypes.func.isRequired,
  toggleSafetyDetails: PropTypes.func.isRequired,
  getIPdeviceInfo: PropTypes.func.isRequired
};

export default SafetyDetails;