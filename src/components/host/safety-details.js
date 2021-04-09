import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context';
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'


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
          <th>{t('host.txt-hashMD5')}</th>
          <th>{t('host.txt-fileSize')}</th>
          <th>{t('host.txt-isPEfile')}</th>
          <th>{t('host.txt-isPEextension')}</th>
          <th>{t('host.txt-isSignature')}</th>
        </tr>
      )
    } else if (safetyScanType === 'gcbDetection') {

    } else if (safetyScanType === 'getFileIntegrity') {

    } else if (safetyScanType === 'getEventTracing') {

    } else if (safetyScanType === 'getProcessMonitorResult') {

    } else if (safetyScanType === 'getVansCpe') {

    } else if (safetyScanType === 'getVansCve') {

    }
  }
  /**
   * Display top table body
   * @method
   * @returns HTML DOM
   */
  getTopTableBody = () => {
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

    } else if (safetyScanType === 'getFileIntegrity') {

    } else if (safetyScanType === 'getEventTracing') {

    } else if (safetyScanType === 'getProcessMonitorResult') {

    } else if (safetyScanType === 'getVansCpe') {

    } else if (safetyScanType === 'getVansCve') {

    }
  }
  /**
   * Display basic info content
   * @method
   * @returns HTML DOM
   */
  getBasicInfoContent = () => {
    const {currentSafetyData, safetyScanType} = this.props;

    if (safetyScanType === 'scanFile') {
      return (
        <tbody>
          <tr>
            <td>{t('host.txt-hashMD5')}</td>
            <td>{currentSafetyData.primaryKeyValue}</td>
          </tr>
          <tr>
            <td>{t('host.txt-fileSize')}</td>
            <td>{helper.numberWithCommas(currentSafetyData.rawJsonObject._FileInfo._Filesize)}KB</td>
          </tr>
          <tr>
            <td>{t('host.txt-isPEfile')}</td>
            <td><span style={{color: currentSafetyData.rawJsonObject._IsPE ? '#70c97e' : '#e15b6b'}}>{t('txt-' + currentSafetyData.rawJsonObject._IsPE.toString())}</span></td>
          </tr>
          <tr>
            <td>{t('host.txt-isPEextension')}</td>
            <td><span style={{color: currentSafetyData.rawJsonObject._IsPEextension ? '#70c97e' : '#e15b6b'}}>{t('txt-' + currentSafetyData.rawJsonObject._IsPEextension.toString())}</span></td>
          </tr>
          <tr>
            <td>{t('host.txt-isSignature')}</td>
            <td><span style={{color: currentSafetyData.rawJsonObject._IsVerifyTrust ? '#70c97e' : '#e15b6b'}}>{t('txt-' + currentSafetyData.rawJsonObject._IsVerifyTrust.toString())}</span></td>
          </tr>
          <tr>
            <td>{t('host.txt-suspiciousFilePath')}</td>
            <td>{currentSafetyData.rawJsonObject._FileInfo._Filepath}</td>
          </tr>
        </tbody>
      )
    } else if (safetyScanType === 'gcbDetection') {

    } else if (safetyScanType === 'getFileIntegrity') {

    } else if (safetyScanType === 'getEventTracing') {

    } else if (safetyScanType === 'getProcessMonitorResult') {

    } else if (safetyScanType === 'getVansCpe') {

    } else if (safetyScanType === 'getVansCve') {

    }
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
                <li className={cx('header', {'active': contentType === 'availableHost'})} onClick={this.toggleContent.bind(this, 'availableHost')}><span>{t('host.txt-availableHost')}</span></li>
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
                    Hello Ryan
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
          title={t('host.txt-malwareInfo')}
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