import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context';
import helper from '../common/helper'

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
      contentType: 'basicInfo' //'basicInfo' or 'availableHost'
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {

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
          <th>{t('host.txt-suspiciousFilePath')}</th>
        </tr>
      )
    } else if (safetyScanType === 'getEventTraceResult') {
      return (
        <tr>
          <th>{t('host.txt-eventCode')}</th>
          <th>{t('host.txt-eventDesc')}</th>
        </tr>
      )
    } else if (safetyScanType === 'getProcessMonitorResult') {
      return (
        <tr>
          <th>MD5</th>
          <th>{t('host.txt-suspiciousFilePath')}</th>
        </tr>
      )
    } else if (safetyScanType === 'getVansCpe') {
      return (
        <tr>
          <th>CPE ID</th>
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
          <th>CPE ID</th>
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
          <td>{helper.numberWithCommas(currentSafetyData.rawJsonObject._FileInfo._Filesize)}KB</td>
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
          <td>{this.getFormattedLength(currentSafetyData.rawJsonObject.message, 80)}</td>
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
      return (
        <tr>
          <td>{currentSafetyData.primaryKeyValue}</td>
          <td>{currentSafetyData.rawJsonObject.vendor}</td>
          <td>{currentSafetyData.rawJsonObject.product}</td>
          <td>{currentSafetyData.rawJsonObject.version}</td>
        </tr>
      )
    } else if (safetyScanType === 'getVansCve') {
      const cpeData = currentSafetyData.rawJsonObject.cpeRecordDTOs[0];
      const severity = currentSafetyData.rawJsonObject.severity.toLowerCase();

      return (
        <tr>
          <td>{currentSafetyData.primaryKeyValue}</td>
          <td><span className={severity}>{t('txt-' + severity)}</span></td>
          <td><span>{cpeData.vendor} | {cpeData.product} | {cpeData.version} | {cpeData.name}</span></td>
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
            <td>{helper.numberWithCommas(currentSafetyData.rawJsonObject._FileInfo._Filesize)}KB</td>
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
          <tr>
            <td><span className='blue-color'>{t('host.txt-suspiciousFilePath')}</span></td>
            <td>{currentSafetyData.rawJsonObject._FileInfo._Filepath}</td>
          </tr>
        </tbody>
      )
    } else if (safetyScanType === 'gcbDetection') {
      let policyContent = '';
      let result = '';

      if (locale === 'zh' && currentSafetyData.rawJsonObject['_PolicyName_zh-tw']) {
        policyContent = currentSafetyData.rawJsonObject['_PolicyName_zh-tw'];
      } else if (locale === 'en' && currentSafetyData.rawJsonObject['_PolicyName_en']) {
        policyContent = currentSafetyData.rawJsonObject['_PolicyName_en'];
      }

      if (currentSafetyData.rawJsonObject._CompareResult) {
        result = 'Pass';
      } else {
        result = 'Fail';
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
          <tr>
            <td><span className='blue-color'>{t('host.txt-checkResult')}</span></td>
            <td><span style={{color: result === 'Pass' ? '#70c97e' : '#e15b6b'}}>{result}</span></td>
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
            <td><span className='blue-color'>{t('host.txt-suspiciousFilePath')}</span></td>
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
            <td><span className='blue-color'>{t('host.txt-eventDesc')}</span></td>
            <td>{currentSafetyData.rawJsonObject.message}</td>
          </tr>
        </tbody>
      )
    } else if (safetyScanType === 'getProcessMonitorResult') {
      return (
        <tbody>
          <tr>
            <td><span className='blue-color'>DLLs</span></td>
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
      return (
        <tbody>
          <tr>
            <td><span className='blue-color'>CPE ID</span></td>
            <td>{currentSafetyData.primaryKeyValue}</td>
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
   * @param {string} type - content type ('desc' or 'ref')
   * @param {object} val - individual vans data
   * @param {number} i - index of the vans data
   * @returns HTML DOM
   */
  displayVansContent = (type, val, i) => {
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
    return (
      <tr key={i}>
        <td>{val.ip}</td>
        <td>{val.hostName}</td>
        <td>{val.system}</td>
        <td>{val.userName}</td>
        <td>{val.version}</td>
      </tr>
    )
  }
  /**
   * Display Safety Scan content
   * @method
   * @returns HTML DOM
   */
  displaySafetyDetails = () => {
    const {currentSafetyData} = this.props;
    const {contentType} = this.state;

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
                <li className={cx('header', {'active': contentType === 'basicInfo'})} onClick={this.toggleContent.bind(this, 'basicInfo')}><span>{t('host.txt-basicInfo')}</span></li>
                <li className={cx('header', {'active': contentType === 'availableHost'})} onClick={this.toggleContent.bind(this, 'availableHost')}><span>{t('host.txt-availableHost')}</span><span className='host-count'>{currentSafetyData.disDevDtos.length}</span></li>
              </ul>
            </div>
            <div className='content'>
              <div className='safety-details'>
                {contentType === 'basicInfo' &&
                  <div>
                    <div className='header trigger'>{t('host.txt-basicInfo')}</div>
                    <div className='trigger-text'>{t('hmd-scan.txt-lastUpdate')}: {helper.getFormattedDate(currentSafetyData.createDttm, 'local')}</div>
                    <table className='c-table main-table'>
                      {this.getBasicInfoContent()}
                    </table>
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
      confirm: {text: t('txt-close'), handler: this.props.toggleSafetyDetails}
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
  currentSafetyData:  PropTypes.object.isRequired,
  safetyScanType: PropTypes.string.isRequired,
  toggleSafetyDetails: PropTypes.func.isRequired,
};

export default SafetyDetails;