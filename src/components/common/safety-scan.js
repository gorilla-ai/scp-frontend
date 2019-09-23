import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import withLocale from '../../hoc/locale-provider'

let t = null;

class SafetyScan extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
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
  checkTriggerTime = (type) => {
    const {ipDeviceInfo} = this.state;
    const resultType = type + 'Result';
    const createTime = helper.getFormattedDate(ipDeviceInfo[type][resultType].taskCreateDttm, 'local');
    const responseTime = helper.getFormattedDate(ipDeviceInfo[type][resultType].taskResponseDttm, 'local');

    if (Moment(createTime).isAfter(responseTime)) {
      return true;
    }
  }
  render() {
    const {type, ipDeviceInfo} = this.props;
    let hmdInfo = {};

    if (ipDeviceInfo[type].yaraResult) {
      hmdInfo.yara = {
        createTime: helper.getFormattedDate(ipDeviceInfo[type].yaraResult.taskCreateDttm, 'local'),
        responseTime: helper.getFormattedDate(ipDeviceInfo[type].yaraResult.taskResponseDttm, 'local'),
        result: ipDeviceInfo[type].yaraResult.ScanResult ? ipDeviceInfo[type].yaraResult.ScanResult : [],
        taskID: ipDeviceInfo[type].yaraResult.taskId
      };

      return (
        <div className='safety-scan-content'>
          <div className='nav'>
            <ul>
              <li>
                <span className='name'>Yara Scan</span>
                <span className='count' style={{color: '#d0021b'}}>{t('network-inventory.txt-suspiciousFileCount')}: {hmdInfo.yara.result.length}</span>
              </li>
              {/*<li>
                <span className='name'>GCB</span>
                <span className='count' style={{color: '#11a629'}}>通過/總項目: 49/87</span>
              </li>*/}
            </ul>
          </div>
          <div className='content'>
            <div className='time'>
              <span>{t('network-inventory.txt-createTime')}: {hmdInfo.yara.createTime}</span>
              <span>{t('network-inventory.txt-responseTime')}: {hmdInfo.yara.responseTime}</span>
            </div>
            <button onClick={this.props.triggerTask.bind(this, hmdInfo.yara.taskID, type)} disabled={this.checkTriggerTime('yara')}>{t('network-inventory.txt-reCheck')}</button>
            <table className='c-table main-table'>
              <thead>
                <tr>
                  <th>{t('network-inventory.txt-suspiciousFileName')}, {t('network-inventory.txt-suspiciousFilePath')}</th>
                </tr>
              </thead>
              <tbody>
                {hmdInfo.yara.result.map(this.showScanInfo)}
              </tbody>
            </table>
          </div>
        </div>
      )
    } else {
      return (
        <span>N/A</span>
      )
    }
  }
}

SafetyScan.propTypes = {

};

const HocSafetyScan = withLocale(SafetyScan);
export { SafetyScan, HocSafetyScan };