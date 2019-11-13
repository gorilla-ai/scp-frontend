import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import ButtonGroup from 'react-ui/build/src/components/button-group'
import DataTable from 'react-ui/build/src/components/table'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import helper from './helper'
import withLocale from '../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';
const SAFETY_SCAN_LIST = [
  {
    type: 'yara',
    path: 'ScanResult'
  },
  {
    type: 'yaraScanFile',
    path: 'ScanResult'
  },
  {
    type: 'gcb',
    path: 'GCBResult'
  },
  {
    type: 'ir',
    path: '_ZipPath'
  },
  {
    type: 'malware',
    path: 'DetectionResult'
  }
];
const TRIGGER_NAME = {
  [SAFETY_SCAN_LIST[0].type]: 'compareIOC',
  [SAFETY_SCAN_LIST[1].type]: 'yaraScanFile',
  [SAFETY_SCAN_LIST[2].type]: 'gcbDetection',
  [SAFETY_SCAN_LIST[4].type]: 'malwareDetection'
};

let t = null;
let f = null;

class HMDscanInfo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'yara', //yara, yaraScanFile, gcb, ir, malware
      activePath: null,
      activeRuleHeader: false,
      activeRule: [],
      activeDLL: false,
      activeConnections: false,
      gcbFieldsArr: ['cceId', 'name', 'type', 'compareResult'],
      malwareFieldsArr: ['_FileInfo._Filepath', '_FileInfo._Filesize', '_FileInfo._HashValues._MD5', '_IsPE', '_IsPEextension', '_IsVerifyTrust', 'download']
    };

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
  }
  sortedRuleList = (scanResult) => {
    let ruleWithFile = [];
    let ruleWithNoFile = [];
    let mergedRule = [];

    _.forEach(scanResult, val => {
      if (val._MatchedFile) {
        ruleWithFile.push(val);
      } else {
        ruleWithNoFile.push(val);
      }
    })

    mergedRule = _.concat(ruleWithFile, ruleWithNoFile);
    return mergedRule;
  }
  toggleScanType = (activeTab) => {
    this.setState({
      activeTab,
      activePath: null,
      activeRuleHeader: false,
      activeRule: [],
      activeDLL: false,
      activeConnections: false
    });
  }
  checkTriggerTime = (type) => {
    const {currentDeviceData} = this.props;
    const resultType = type + 'Result';
    let createTime = '';
    let responseTime = '';

    if (currentDeviceData[resultType].taskCreateDttm && currentDeviceData[resultType].taskResponseDttm) {
      createTime = helper.getFormattedDate(currentDeviceData[resultType].taskCreateDttm, 'local');
      responseTime = helper.getFormattedDate(currentDeviceData[resultType].taskResponseDttm, 'local');

      if (Moment(createTime).isAfter(responseTime)) {
        return true;
      }
    }
  }
  togglePathRule = (type, i, parentIndex) => {
    const {activePath, activeRule} = this.state;
    const tempActivePath = activePath === i ? null : i;

    if (type === 'path') {
      this.setState({
        activePath: tempActivePath,
        activeRuleHeader: false,
        activeRule: [],
        activeDLL: false,
        activeConnections: false
      });
    } else if (type === 'rule') {
      let tempActiveRule = activeRule;

      if (_.includes(activeRule, i)) {
        tempActiveRule.splice(tempActiveRule.indexOf(i), 1);
      } else {
        tempActiveRule.push(i);
      }

      this.setState({
        activeRule: tempActiveRule
      });
    }
  }
  displayRule = (nameList, parentIndex, val, i) => {
    const {activeRule} = this.state;
    const uniqueKey = val + i;

    return (
      <div className='rule-content' key={uniqueKey}>
        <div className='header' onClick={this.togglePathRule.bind(this, 'rule', i, parentIndex)}>
          <i className={cx('fg fg-play', {'rotate': _.includes(activeRule, i)})}></i>
          <span>{nameList[i]}</span>
        </div>
        {val &&
          <code className={cx({'hide': !_.includes(activeRule, i)})}>{val}</code>
        }
        {!val &&
          <span>{NOT_AVAILABLE}</span>
        }
      </div>
    )
  }
  displayIndividualFile = (val, i) => {
    const uniqueKey = val + i;

    return (
      <div key={uniqueKey}>{val}</div>
    )
  }
  displayFilePath = (val) => {
    const {activeDLL} = this.state;
    let filePathList = [];
    let displayInfo = '';

    _.forEach(val._ProcessInfo._ModulesInfo, val2 => {
      if (val2._FileInfo && val2._FileInfo._Filepath) {
        filePathList.push(val2._FileInfo._Filepath);
      }
    })

    if (filePathList.length > 0) {
      displayInfo = filePathList.map(this.displayIndividualFile);
    } else {
      displayInfo = NOT_AVAILABLE;
    }

    return (
      <div className={cx('sub-content', {'hide': !activeDLL})}>
        {displayInfo}
      </div>
    )
  }
  displayIndividualConnection = (val, i) => {
    const uniqueKey = val + i;

    return (
      <ul key={uniqueKey}>
        <li><span>{t('attacksFields.protocolType')}:</span> {val.protocol || NOT_AVAILABLE}</li>
        <li><span>{t('attacksFields.srcIp')}:</span> {val.srcIp || NOT_AVAILABLE}</li>
        <li><span>{t('attacksFields.srcPort')}:</span> {val.srcPort || NOT_AVAILABLE}</li>
        <li><span>{t('attacksFields.destIp')}:</span> {val.destIP || NOT_AVAILABLE}</li>
        <li><span>{t('attacksFields.destPort')}:</span> {val.destPort || NOT_AVAILABLE}</li>
      </ul>
    )
  }
  displayConnections = (val) => {
    const {activeConnections} = this.state;
    let connectionsList = [];
    let displayInfo = '';

    _.forEach(val._ProcessInfo._ConnectionList, val2 => {
      connectionsList.push({
        destIp: val2._DstIP,
        destPort: val2._DstPort,
        protocol: val2._ProtocolType,
        srcIp: val2._SrcIP,
        srcPort: val2._SrcPort
      });
    })

    if (connectionsList.length > 0) {
      displayInfo = connectionsList.map(this.displayIndividualConnection);
    } else {
      displayInfo = NOT_AVAILABLE;
    }

    return (
      <div className={cx('sub-content flex', {'hide': !activeConnections})}>
        {displayInfo}
      </div>
    )
  }
  toggleInfoHeader = (type) => {
    if (type === 'rule') {
      this.setState({
        activeRuleHeader: !this.state.activeRuleHeader
      });
    } else if (type === 'ddl') {
      this.setState({
        activeDLL: !this.state.activeDLL
      });
    } else if (type === 'connections') {
      this.setState({
        activeConnections: !this.state.activeConnections
      });
    }
  }
  displayScanProcessPath = (val, i) => {
    const {activePath, activeRuleHeader, activeDLL, activeConnections} = this.state;
    const uniqueKey = val._ScanType + i;
    let displayInfo = '';

    if (val._MatchedRuleList && val._MatchedRuleList.length > 0 && val._MatchedRuleNameList) {
      displayInfo = val._MatchedRuleList.map(this.displayRule.bind(this, val._MatchedRuleNameList, i));
    } else {
      displayInfo = NOT_AVAILABLE;
    }

    if (val._MatchedFile || val._MatchedPid) {
      return (
        <div className='group' key={uniqueKey}>
          <div className='path' onClick={this.togglePathRule.bind(this, 'path', i)}>
            <i className={cx('fg fg-arrow-bottom', {'rotate': activePath === i})}></i>
            {val._MatchedFile &&
              <span>{t('txt-path')}: {val._MatchedFile}</span>
            }
            {val._MatchedFile && val._MatchedPid &&
              <span>, </span>
            }
            {val._MatchedPid &&
              <span>PID: {val._MatchedPid}</span>
            }
          </div>
          <div className={cx('rule', {'hide': activePath !== i})}>
            <div className='rule-content'>
              <div className='header' onClick={this.toggleInfoHeader.bind(this, 'rule')}>
                <i className={cx('fg fg-play', {'rotate': activeRuleHeader})}></i>
                <span>{t('txt-rule')}</span>
              </div>
              <div className={cx('sub-content', {'hide': !activeRuleHeader})}>
                {displayInfo}
              </div>
            </div>

            <div className='rule-content'>
              <div className='header' onClick={this.toggleInfoHeader.bind(this, 'ddl')}>
                <i className={cx('fg fg-play', {'rotate': activeDLL})}></i>
                <span>DLLs</span>
              </div>
              {this.displayFilePath(val)}
            </div>

            <div className='rule-content'>
              <div className='header' onClick={this.toggleInfoHeader.bind(this, 'connections')}>
                <i className={cx('fg fg-play', {'rotate': activeConnections})}></i>
                <span>{t('txt-networkBehavior')}</span>
              </div>
              {this.displayConnections(val)}
            </div>
          </div>
        </div>
      )
    }
  }
  displayScanFilePath = (val, i) => {
    const {activePath, activeRuleHeader} = this.state;
    const uniqueKey = val._ScanType + i;
    let displayInfo = '';

    if (val._MatchedRuleList && val._MatchedRuleList.length > 0 && val._MatchedRuleNameList) {
      displayInfo = val._MatchedRuleList.map(this.displayRule.bind(this, val._MatchedRuleNameList, i));
    } else {
      displayInfo = NOT_AVAILABLE;
    }

    if (val._MatchedFile || val._MatchedPid) {
      return (
        <div className='group' key={uniqueKey}>
          <div className='path' onClick={this.togglePathRule.bind(this, 'path', i)}>
            <i className={cx('fg fg-arrow-bottom', {'rotate': activePath === i})}></i>
            {val._MatchedFile &&
              <span>{t('txt-path')}: {val._MatchedFile}</span>
            }
            {val._MatchedFile && val._MatchedPid &&
              <span>, </span>
            }
            {val._MatchedPid &&
              <span>PID: {val._MatchedPid}</span>
            }
          </div>
          <div className={cx('rule', {'hide': activePath !== i})}>
            <div className='rule-content'>
              <div className='header' onClick={this.toggleInfoHeader.bind(this, 'rule')}>
                <i className={cx('fg fg-play', {'rotate': activeRuleHeader})}></i>
                <span>{t('txt-rule')}</span>
              </div>
              <div className={cx('sub-content', {'hide': !activeRuleHeader})}>
                {displayInfo}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
  showAlertData = (type) => {
    this.setState({
      activeTab: 'yara',
      activePath: null,
      activeRuleHeader: false,
      activeDLL: false,
      activeConnections: false
    }, () => {
      this.props.showAlertData(type);
    });
  }
  getSuspiciousFileCount = (hmdInfo) => {
    const {activeTab} = this.state;

    if (hmdInfo[activeTab].count && hmdInfo[activeTab].count >= 0) {
      return <div className='count'>{t('network-inventory.txt-suspiciousFileCount')}: {hmdInfo[activeTab].count}</div>
    }
  }
  getPassTotalCount = (hmdInfo) => {
    const {activeTab} = this.state;

    if (hmdInfo[activeTab].filteredResult) {
      return <span className='pass-total'>{t('network-inventory.txt-passCount')}/{t('network-inventory.txt-totalItem')}: {hmdInfo[activeTab].filteredResult.length}/{hmdInfo[activeTab].result.length}</span>
    }
  }
  getTriggerBtn = (hmdInfo) => {
    const {activeTab} = this.state;

    if (activeTab === 'ir') {
      return <button className='btn' onClick={this.props.toggleSelectionIR} disabled={this.checkTriggerTime(activeTab)}>{t('network-inventory.txt-reCompress')}</button>
    } else {
      return <button className='btn' onClick={this.props.triggerTask.bind(this, [TRIGGER_NAME[activeTab]])} disabled={this.checkTriggerTime(activeTab)}>{t('network-inventory.txt-reCheck')}</button>
    }
  }
  getScanContent = (hmdInfo) => {
    const {activeTab} = this.state;

    if (activeTab === 'yara' || activeTab === 'yaraScanFile') {
      let scanPath = '';

      if (activeTab === 'yara') {
        scanPath = this.displayScanProcessPath;
      } else if (activeTab === 'yaraScanFile') {
        scanPath = this.displayScanFilePath;
      }

      return (
        <div className='scan-content'>
          <div className='header'>{t('network-inventory.txt-suspiciousFilePath')}</div>
          {hmdInfo[activeTab].result && hmdInfo[activeTab].result.length > 0 &&
            <div className='list'>
              {hmdInfo[activeTab].result.map(scanPath)}
            </div>
          }
          {(!hmdInfo[activeTab].result || hmdInfo[activeTab].result.length === 0) &&
            <div className='empty-msg'>{NOT_AVAILABLE}</div>
          }
        </div>
      )
    } else if (activeTab === 'ir') {
      return (
        <div className='scan-content'>
          <div className='header'>{t('network-inventory.txt-irMsg')}:</div>
          <div className='empty-msg'>{hmdInfo[activeTab].result || NOT_AVAILABLE}</div>
        </div>
      )
    }
  }
  getTableContent = (hmdInfo) => {
    const {activeTab} = this.state;

    if (!_.isEmpty(hmdInfo[activeTab].fields) && hmdInfo[activeTab].result.length > 0) {
      return (
        <div className='table'>
          <DataTable
            className='main-table'
            fields={hmdInfo[activeTab].fields}
            data={hmdInfo[activeTab].result} />
        </div>
      )
    }   
  }
  displayScanInfo = () => {
    const {deviceData, currentDeviceData} = this.props;
    const {activeTab, gcbFieldsArr, malwareFieldsArr} = this.state;
    const ip = currentDeviceData.ip || NOT_AVAILABLE;
    const mac = currentDeviceData.mac || NOT_AVAILABLE;
    const hostName = currentDeviceData.hostName || NOT_AVAILABLE;
    const ownerName = currentDeviceData.ownerObj ? currentDeviceData.ownerObj.ownerName : NOT_AVAILABLE;
    let hmdInfo = {};
    let buttonGroupList = [];

    _.forEach(SAFETY_SCAN_LIST, val => {
      hmdInfo[val.type] = {}; //Create the hmdInfo object

      buttonGroupList.push({ //Create list for Button group
        value: val.type,
        text: t('network-inventory.scan-list.txt-' + val.type)
      });
    });

    _.forEach(SAFETY_SCAN_LIST, val => { //Construct the HMD info object
      const dataType = val.type + 'Result';
      const currentDataObj = currentDeviceData[dataType];

      if (!_.isEmpty(currentDataObj)) {
        let dataResult = currentDataObj[val.path];

        if (val.path === 'ScanResult') { //For Scan Process and Scan File
          dataResult = this.sortedRuleList(dataResult);
        }

        hmdInfo[val.type] = {
          createTime: helper.getFormattedDate(currentDataObj.taskCreateDttm, 'local'),
          responseTime: helper.getFormattedDate(currentDataObj.taskResponseDttm, 'local'),
          result: dataResult
        };
      }
    })

    if (hmdInfo.yara.result) {
      hmdInfo.yara.count = Number(hmdInfo.yara.result.length);
    }

    if (hmdInfo.yaraScanFile.result) {
      hmdInfo.yaraScanFile.count = Number(hmdInfo.yaraScanFile.result.length);
    }

    if (hmdInfo.gcb.result) {
      hmdInfo.gcb.filteredResult = _.filter(hmdInfo.gcb.result, ['compareResult', true]);

      hmdInfo.gcb.fields = {};
      gcbFieldsArr.forEach(tempData => {
        hmdInfo.gcb.fields[tempData] = {
          label: f(`gcbFields.${tempData}`),
          sortable: null,
          formatter: (value, allValue) => {
            if (tempData === 'compareResult') {
              let styleStatus = '';

              if (value) {
                styleStatus = '#22ac38';
                value = 'Pass';
              } else {
                styleStatus = '#d0021b';
                value = 'Fail';
              }

              return <span style={{color : styleStatus}}>{value}</span>
            } else {
              return <span>{value}</span>
            }
          }
        };
      })
    }

    if (hmdInfo.malware.result) {
      hmdInfo.malware.fields = {};
      malwareFieldsArr.forEach(tempData => {
        hmdInfo.malware.fields[tempData] = {
          label: tempData === 'download' ? '' : f(`malwareFields.${tempData}`),
          sortable: null,
          formatter: (value, allValue) => {
            if (tempData === '_FileInfo._Filepath') {
              const newValue = value.substr(0, 20) + '...';
              return <span title={value}>{newValue}</span>
            }
            if (tempData === '_FileInfo._Filesize') {
              value = value + ' KB';
            }
            if (tempData === '_IsPE' || tempData === '_IsPEextension' || tempData === '_IsVerifyTrust') {
              let styleStatus = '';

              if (value) {
                styleStatus = '#22ac38';
                value = 'True';
              } else {
                styleStatus = '#d0021b';
                value = 'False';
              }

              return <span style={{color : styleStatus}}>{value}</span>
            }
            if (tempData === 'download') {
              return (
                <div className='table-menu menu active'>
                  <i className='fg fg-data-download' style={{cursor: 'not-allowed'}} title={t('txt-download')}></i>
                </div>
              )
            }
            return <span>{value}</span>
          }
        };
      })
    }

    return (
      <div>
        <table className='c-table main-table with-border'>
          <thead>
            <tr>
              <th>{t('ipFields.ip')}</th>
              <th>{t('ipFields.mac')}</th>
              <th>{t('ipFields.hostName')}</th>
              <th>{t('ipFields.owner')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='align-center ip'>{ip}</td>
              <td className='align-center mac'>{mac}</td>
              <td className='align-center hostName'>{hostName}</td>
              <td className='align-center ownerName'>{ownerName}</td>
            </tr>
          </tbody>
        </table>

        <div className='scan-info'>
          <ButtonGroup
            className='left'
            list={buttonGroupList}
            onChange={this.toggleScanType}
            value={activeTab} />

          <div className='info-content'>
            <div>
              <div className='info'>
                <div className='last-update'>
                  <span>{t('network-inventory.txt-createTime')}: {hmdInfo[activeTab].createTime || NOT_AVAILABLE}</span>
                  <span>{t('network-inventory.txt-responseTime')}: {hmdInfo[activeTab].responseTime || NOT_AVAILABLE}</span>
                </div>
                {this.getSuspiciousFileCount(hmdInfo)} {/*For Yara and Yara Scan File*/}
                {this.getPassTotalCount(hmdInfo)} {/*For GCB*/}
                {this.getTriggerBtn(hmdInfo)} {/*For all*/}
              </div>
              {this.getScanContent(hmdInfo)} {/*For Yara, Yara Scan File and IR*/}
              {this.getTableContent(hmdInfo)} {/*For GCB and Malware*/}
            </div>
          </div>
        </div>

        {deviceData.currentLength > 1 &&
          <div className='pagination'>
            <div className='buttons'>
              <button onClick={this.showAlertData.bind(this, 'previous')} disabled={deviceData.currentIndex === 0}>{t('txt-previous')}</button>
              <button onClick={this.showAlertData.bind(this, 'next')} disabled={deviceData.currentIndex + 1 === deviceData.currentLength}>{t('txt-next')}</button>
            </div>
            <span className='count'>{deviceData.currentIndex + 1} / {deviceData.currentLength}</span>
          </div>
        }
      </div>
    )
  }
  render() {
    const {titleText, actions} = this.props;

    return (
      <ModalDialog
        id='configScanModalDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displayScanInfo()}
      </ModalDialog>
    )
  }
}

HMDscanInfo.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  locale: PropTypes.string.isRequired,
  titleText: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  deviceData: PropTypes.object.isRequired,
  currentDeviceData: PropTypes.object.isRequired,
  toggleSelectionIR: PropTypes.func.isRequired,
  showAlertData: PropTypes.func.isRequired,
  triggerTask: PropTypes.func.isRequired
};

const HocHMDscanInfo = withLocale(HMDscanInfo);
export { HMDscanInfo, HocHMDscanInfo };