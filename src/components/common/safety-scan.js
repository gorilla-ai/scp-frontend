import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import withLocale from '../../hoc/locale-provider'

const NOT_AVAILABLE = 'N/A';

let t = null;

/**
 * Safety Scan
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the safety scan data
 */
class SafetyScan extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  /**
   * Construct and show scan info in table row
   * @method
   * @param {object} val - Yara scan data
   * @param {number} i - index of the yara scan result array
   * @returns HTML DOM
   */
  showScanInfo = (val, i) => {
    let text = '';

    if (val._MatchedFile) {
      text += t('txt-path') + ': ' + val._MatchedFile;
    }

    if (val._MatchedFile && val._MatchedPid) {
      text += ', ';
    }

    if (val._MatchedPid) {
      text += 'PID: ' + val._MatchedPid;
    }

    return (
      <tr key={i}>
        <td>text</td>
      </tr>
    )
  }
  /**
   * Compare the task create datetime and task response datetime
   * @method
   * @param {string} type - scan type
   * @returns boolean true/false
   */
  checkTriggerTime = (type) => {
    const {ipDeviceInfo} = this.state;
    const resultType = type + 'Result';

    if (ipDeviceInfo[type][resultType].taskCreateDttm && ipDeviceInfo[type][resultType].taskResponseDttm) {
      const createTime = helper.getFormattedDate(ipDeviceInfo[type][resultType].taskCreateDttm, 'local');
      const responseTime = helper.getFormattedDate(ipDeviceInfo[type][resultType].taskResponseDttm, 'local');

      return Moment(createTime).isAfter(responseTime);
    }
  }
  render() {
    const {type, ipDeviceInfo} = this.props;
    let hmdInfo = {
      yara: {}
    };

    if (ipDeviceInfo[type].yaraResult) {
      hmdInfo.yara = {
        createTime: helper.getFormattedDate(ipDeviceInfo[type].yaraResult.taskCreateDttm, 'local'),
        responseTime: helper.getFormattedDate(ipDeviceInfo[type].yaraResult.taskResponseDttm, 'local'),
        result: ipDeviceInfo[type].yaraResult.ScanResult ? ipDeviceInfo[type].yaraResult.ScanResult : []
      };

      return (
        <div className='safety-scan-content'>
          <div className='nav'>
            <ul>
              <li>
                <span className='name'>Yara Scan</span>
                {hmdInfo.yara.result &&
                  <span className='count' style={{color: '#d0021b'}}>{t('network-inventory.txt-suspiciousFileCount')}: {hmdInfo.yara.result.length}</span>
                }
              </li>
            </ul>
          </div>
          <div className='content'>
            <div className='time'>
              {hmdInfo.yara.createTime &&
                <span>{t('network-inventory.txt-createTime')}: {hmdInfo.yara.createTime}</span>
              }
              {hmdInfo.yara.responseTime &&
                <span>{t('network-inventory.txt-responseTime')}: {hmdInfo.yara.responseTime}</span>
              }
            </div>
            <button onClick={this.props.triggerTask} disabled={this.checkTriggerTime('yara')}>{t('network-inventory.txt-reCheck')}</button>
            <table className='c-table main-table'>
              <thead>
                <tr>
                  <th>{t('network-inventory.txt-suspiciousFileName')}, {t('network-inventory.txt-suspiciousFilePath')}</th>
                </tr>
              </thead>
              <tbody>
                {hmdInfo.yara.result && hmdInfo.yara.result.length > 0 &&
                  hmdInfo.yara.result.map(this.showScanInfo)
                }
              </tbody>
            </table>
          </div>
        </div>
      )
    } else {
      return <span>{NOT_AVAILABLE}</span>
    }
  }
}

SafetyScan.propTypes = {
};

const HocSafetyScan = withLocale(SafetyScan);
export { SafetyScan, HocSafetyScan };