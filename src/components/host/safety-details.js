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
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {

  }
  ryan = () => {

  }
  /**
   * Display Safety Scan content
   * @method
   * @returns HTML DOM
   */
  displaySafetyDetails = () => {
    const {currentSafetyData, safetyScanType} = this.props;

    if (safetyScanType === 'scanFile' && !_.isEmpty(currentSafetyData)) {
      return (
        <div>
          <table className='c-table main-table align-center with-border'>
            <thead>
              <tr>
                <th>{t('host.txt-hashMD5')}</th>
                <th>{t('host.txt-fileSize')}</th>
                <th>{t('host.txt-isPEfile')}</th>
                <th>{t('host.txt-isPEextension')}</th>
                <th>{t('host.txt-isSignature')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{currentSafetyData.primaryKeyValue}</td>
                <td>?</td>
                <td><span style={{color: currentSafetyData.rawJsonObject._IsPE ? '#70c97e' : '#e15b6b'}}>{t('txt-' + currentSafetyData.rawJsonObject._IsPE.toString())}</span></td>
                <td><span style={{color: currentSafetyData.rawJsonObject._IsPEextension ? '#70c97e' : '#e15b6b'}}>{t('txt-' + currentSafetyData.rawJsonObject._IsPEextension.toString())}</span></td>
                <td><span style={{color: currentSafetyData.rawJsonObject._IsVerifyTrust ? '#70c97e' : '#e15b6b'}}>{t('txt-' + currentSafetyData.rawJsonObject._IsVerifyTrust.toString())}</span></td>
              </tr>
            </tbody>
          </table>

          <div className='main-content'>
            <div className='nav'>
              <ul>
                <li className='header'><span>{t('host.txt-basicInfo')}</span></li>
                <li className='header'><span>{t('host.txt-availableHost')}</span></li>
              </ul>
            </div>
            <div className='content'>
              <section>
                <div class='header trigger'>{t('host.txt-basicInfo')}</div>
                <div class='trigger-text'>{t('hmd-scan.txt-lastUpdate')}: 2021-04-08 03:04:21</div>
                <table class='c-table main-table host'>
                  <tbody>
                    <tr>
                      <td>{t('host.txt-hashMD5')}</td>
                      <td>{currentSafetyData.primaryKeyValue}</td>
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
                  </tbody>
                </table>
              </section>
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
  safetyData:  PropTypes.object.isRequired,
  safetyScanType: PropTypes.string.isRequired,
  toggleSafetyDetails: PropTypes.func.isRequired,
};

export default SafetyDetails;