import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import InfiniteScroll from 'react-infinite-scroll-component'

import ButtonGroup from 'react-ui/build/src/components/button-group'
import DataTable from 'react-ui/build/src/components/table'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from './context';
import helper from './helper'

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
    type: 'malware',
    path: 'DetectionResult'
  },
  {
    type: 'gcb',
    path: 'GCBResult'
  },
  {
    type: 'ir',
    path: '_ZipPath'
  }
];
const TRIGGER_NAME = {
  [SAFETY_SCAN_LIST[0].type]: 'compareIOC',
  [SAFETY_SCAN_LIST[1].type]: 'yaraScanFile',
  [SAFETY_SCAN_LIST[2].type]: 'malwareDetection',
  [SAFETY_SCAN_LIST[3].type]: 'gcbDetection'
};

let scrollCount = 1;
let t = null;
let f = null;

/**
 * HMD Scan Info
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the HMD scan information
 */
class HMDscanInfo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'yara', //yara, yaraScanFile, malware, gcb, ir
      syncStatus: '',
      syncTime: '',
      buttonGroupList: [],
      activePath: null,
      activeRuleHeader: false,
      activeRule: [],
      activeDLL: false,
      activeConnections: false,
      malwareFieldsArr: ['_FileInfo._Filepath', '_FileInfo._Filesize', '_FileInfo._HashValues._MD5', '_IsPE', '_IsPEextension', '_IsVerifyTrust', 'hostIdArrCnt'],
      malwareSort: ['asc'],
      gcbFieldsArr: ['_CceId', '_OriginalKey', '_Type', '_CompareResult'],
      gcbSort: 'asc',
      hmdInfo: {},
      hasMore: true
    };

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.loadInitialContent();
    this.loadHMDdata();
  }
  componentDidUpdate(prevProps) {
    if (!prevProps || (this.props.currentDeviceData !== prevProps.currentDeviceData)) {
      this.loadInitialContent();
      this.loadHMDdata();
    }

    if (!prevProps || (this.props.currentDeviceData.ip !== prevProps.currentDeviceData.ip)) {
      this.setState({
        activeTab: 'yara'
      });
    }
  }
  componentWillUnmount() {
    scrollCount = 1;

    this.setState({
      hasMore: true
    });
  }
  /**
   * Set sync status and button group list
   * @method
   */
  loadInitialContent = () => {
    const {currentDeviceData} = this.props;
    let syncStatus = '';
    let syncTime = '';
    let buttonGroupList = [];

    if (currentDeviceData.syncYaraResult && currentDeviceData.syncYaraResult.length > 0) {
      if (currentDeviceData.syncYaraResult[0].status === 'failed') {
        syncStatus = 'show';
        syncTime = helper.getFormattedDate(currentDeviceData.syncYaraResult[0].latestCreateDttm, 'local');
      }
    }

    _.forEach(SAFETY_SCAN_LIST, val => {
      buttonGroupList.push({ //Create list for Button group
        value: val.type,
        text: t('network-inventory.scan-list.txt-' + val.type)
      });
    });

    this.setState({
      syncStatus,
      syncTime,
      buttonGroupList
    });
  }
  /**
   * Load and set HMD data
   * @method
   */
  loadHMDdata = () => {
    const {locale} = this.context;
    const {currentDeviceData} = this.props;
    const {malwareFieldsArr, malwareSort, gcbFieldsArr, gcbSort} = this.state;
    let hmdInfo = {};

    _.forEach(SAFETY_SCAN_LIST, val => {
      hmdInfo[val.type] = {}; //Create the hmdInfo object
    });

    _.forEach(SAFETY_SCAN_LIST, val => { //Construct the HMD info object
      const currentDataObj = currentDeviceData[val.type + 'Result'];

      if (currentDataObj && currentDataObj.length > 0 && !_.isEmpty(currentDataObj[0])) {
        hmdInfo[val.type] = {
          latestCreateDttm: helper.getFormattedDate(currentDataObj[0].latestCreateDttm, 'local'),
          createTime: helper.getFormattedDate(currentDataObj[0].taskCreateDttm, 'local'),
          responseTime: helper.getFormattedDate(currentDataObj[0].taskResponseDttm, 'local'),
          data: currentDataObj
        };
      }
    })

    if (hmdInfo.malware && hmdInfo.malware.data) {
      hmdInfo.malware.fields = {};
      malwareFieldsArr.forEach(tempData => {
        hmdInfo.malware.fields[tempData] = {
          label: f(`malwareFields.${tempData}`),
          sortable: true,
          className: this.getFieldName(tempData),
          formatter: (value, allValue) => {
            if (tempData === '_FileInfo._Filepath') {
              return <span>{value}</span>
            }
            if (tempData === '_FileInfo._HashValues._MD5') {
              return <span>{value}</span>
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
            if (tempData === 'hostIdArrCnt') {
              if (allValue.hostIdArr) {
                const tooltip = f('malwareFields.hostIdArrCnt') + '/' + f('malwareFields.totalHostCnt') + ': ' + value + '/' + allValue.totalHostCnt;
                return <span title={tooltip}>{value}</span>
              } else {
                value = NOT_AVAILABLE;
              }
            }
            return <span>{value}</span>
          }
        };
      })
    }

    if (hmdInfo.gcb && hmdInfo.gcb.data) {
      hmdInfo.gcb.filteredResult = _.filter(hmdInfo.gcb.data[0].GCBResult, ['_CompareResult', true]);

      hmdInfo.gcb.fields = {};
      gcbFieldsArr.forEach(tempData => {
        hmdInfo.gcb.fields[tempData] = {
          label: f(`gcbFields.${tempData}`),
          sortable: true,
          className: 'gcb' + tempData,
          formatter: (value, allValue) => {
            if (tempData === '_CceId') {
              return <span>{value}</span>
            }
            if (tempData === '_OriginalKey') {
              let content = value;

              if (locale === 'zh' && allValue['_PolicyName_zh-tw']) {
                content = allValue['_PolicyName_zh-tw'];
              } else if (locale === 'en' && allValue['_PolicyName_en']) {
                content = allValue['_PolicyName_en'];
              }

              if (content.length > 70) {
                const newValue = content.substr(0, 70) + '...';
                return <span title={content}>{newValue}</span>
              } else {
                return <span>{content}</span>
              }
            }
            if (tempData === '_Type') {
              return <span>{value}</span>
            }
            if (tempData === '_CompareResult') {
              let styleStatus = '';
              let tooltip = '';

              if (value) {
                styleStatus = '#22ac38';
                value = 'Pass';
              } else {
                styleStatus = '#d0021b';
                value = 'Fail';
              }

              tooltip += 'GPO Value: ' + (allValue._GpoValue || 'N/A');
              tooltip += ' / GCB Value: ' + (allValue._GcbValue || 'N/A');

              return <span style={{color : styleStatus}} title={tooltip}>{value}</span>
            }
          }
        };
      })
    }

    this.setState({
      hmdInfo
    });
  }
  /**
   * Sort the Yara and Yara Scan File by matched file availablility
   * @method
   * @param {object} scanResult - scan file for Yara and Yara Scan File
   * @returns sorted and mereged list
   */
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
  /**
   * Set active tab based on scan type
   * @method
   * @param {string} activeTab - active scan type
   */
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
  /**
   * Compare the task create datetime and task response datetime
   * @method
   * @param {string} type - scan type
   * @returns boolean true/false
   */
  checkTriggerTime = (type) => {
    const {currentDeviceData} = this.props;
    const resultType = type + 'Result';

    if (currentDeviceData[resultType] && currentDeviceData[resultType].length > 0) {
      if (currentDeviceData[resultType][0].latestCreateDttm) {
        if (currentDeviceData[resultType][0].taskResponseDttm) {
          const latestCreateTime = helper.getFormattedDate(currentDeviceData[resultType][0].latestCreateDttm, 'local');
          const responseTime = helper.getFormattedDate(currentDeviceData[resultType][0].taskResponseDttm, 'local');
          return Moment(latestCreateTime).isAfter(responseTime);
        } else {
          return true; //Disable when create dttm is available and resonse dttm is N/A
        }
      }
    }
  }
  /**
   * Toggle scan path/rule on/off and set the rule
   * @method
   * @param {string} type - scan type
   * @param {number} i - index of the rule array
   * @param {string} id - unique ID of the rule array
   */
  togglePathRule = (type, i, id) => {
    const {activePath, activeRule} = this.state;

    if (type === 'path') {
      const tempActivePath = activePath === id ? null : id;

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
  /**
   * Display rule for yara scan
   * @method
   * @param {array} nameList - scan rule list
   * @param {string} val - scan file data
   * @param {number} i - index of the rule array
   * @returns HTML DOM
   */
  displayRule = (nameList, val, i) => {
    const {activeRule} = this.state;
    const uniqueKey = val + i;

    return (
      <div className='rule-content' key={uniqueKey}>
        <div className='header' onClick={this.togglePathRule.bind(this, 'rule', i)}>
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
  /**
   * Display individual file
   * @method
   * @param {string} val - scan file data
   * @param {number} i - index of the file array
   * @returns HTML DOM
   */
  displayIndividualFile = (val, i) => {
    const uniqueKey = val + i;

    return (
      <div key={uniqueKey}>{val}</div>
    )
  }
  /**
   * Display file path
   * @method
   * @param {object} val - scan file data
   * @returns HTML DOM
   */
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
  /**
   * Display individual connection for Yara Scan
   * @method
   * @param {object} val - connection data
   * @param {number} i - index of the connections array
   * @returns HTML DOM
   */
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
  /**
   * Display connections for Yara Scan
   * @method
   * @param {object} val - connection data
   * @returns HTML DOM
   */
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
  /**
   * Toggle scan rule item on/off
   * @method
   * @param {string} type - item type ('rule', 'dll' or 'connections')
   */
  toggleInfoHeader = (type) => {
    if (type === 'rule') {
      this.setState({
        activeRuleHeader: !this.state.activeRuleHeader
      });
    } else if (type === 'dll') {
      this.setState({
        activeDLL: !this.state.activeDLL
      });
    } else if (type === 'connections') {
      this.setState({
        activeConnections: !this.state.activeConnections
      });
    }
  }
  /**
   * Display Yara Scan Process content
   * @method
   * @param {number} parentIndex - parent index of the scan process array
   * @param {object} val - scan data content
   * @param {number} i - index of the scan process array
   * @returns HTML DOM
   */
  displayScanProcessPath = (parentIndex, val, i) => {
    const {activePath, activeRuleHeader, activeDLL, activeConnections} = this.state;
    const uniqueKey = val._ScanType + i;
    let displayInfo = '';

    if (val._MatchedRuleList && val._MatchedRuleList.length > 0 && val._MatchedRuleNameList) {
      displayInfo = val._MatchedRuleList.map(this.displayRule.bind(this, val._MatchedRuleNameList));
    } else {
      displayInfo = NOT_AVAILABLE;
    }

    if (val._MatchedFile || val._MatchedPid) {
      const uniqueID = parentIndex.toString() + i.toString() + (val._MatchedFile || val._MatchedPid);

      return (
        <div className='group' key={uniqueKey}>
          <div className='path' onClick={this.togglePathRule.bind(this, 'path', i, uniqueID)}>
            <i className={`fg fg-arrow-${activePath === uniqueID ? 'top' : 'bottom'}`}></i>
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
          <div className={cx('rule', {'hide': activePath !== uniqueID})}>
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
              <div className='header' onClick={this.toggleInfoHeader.bind(this, 'dll')}>
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
  /**
   * Display Yara Scan File content
   * @method
   * @param {number} parentIndex - parent index of the scan file array
   * @param {object} val - scan file content
   * @param {number} i - index of the scan file array
   * @returns HTML DOM
   */
  displayScanFilePath = (parentIndex, val, i) => {
    const {activePath, activeRuleHeader} = this.state;
    const uniqueKey = val._ScanType + i;
    let displayInfo = '';

    if (val._MatchedRuleList && val._MatchedRuleList.length > 0 && val._MatchedRuleNameList) {
      displayInfo = val._MatchedRuleList.map(this.displayRule.bind(this, val._MatchedRuleNameList));
    } else {
      displayInfo = NOT_AVAILABLE;
    }

    if (val._MatchedFile || val._MatchedPid) {
      const uniqueID = parentIndex.toString() + i.toString() + (val._MatchedFile || val._MatchedPid);

      return (
        <div className='group' key={uniqueKey}>
          <div className='path' onClick={this.togglePathRule.bind(this, 'path', i, uniqueID)}>
            <i className={`fg fg-arrow-${activePath === uniqueID ? 'top' : 'bottom'}`}></i>
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
          <div className={cx('rule', {'hide': activePath !== uniqueID})}>
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
  /**
   * Reset the activeTab and rule data
   * @method
   * @param {string} type - button action type ('previous' or 'next')
   */
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
  /**
   * Display suspicious file count content
   * @method
   * @param {object} dataResult - HMD data
   * @returns HTML DOM
   */
  getSuspiciousFileCount = (dataResult) => {
    if (dataResult) {
      const styleColor = dataResult.length === 0 ? '#22ac38' : '#d10d25'; //green : red
      return <span style={{'color': styleColor}}>{t('network-inventory.txt-suspiciousFileCount')}: {dataResult.length}</span>
    }
  }
  /**
   * Display pass / total count info for GCB
   * @method
   * @returns HTML DOM
   */
  getPassTotalCount = () => {
    const {hmdInfo} = this.state;

    if (hmdInfo.gcb.data[0] && hmdInfo.gcb.data[0].GCBResult) {
      const gcbDataResult = hmdInfo.gcb.data[0].GCBResult;
      const gcbFilteredResult = hmdInfo.gcb.filteredResult;

      if (gcbFilteredResult) {
        const styleColor = gcbFilteredResult.length === gcbDataResult.length ? '#22ac38' : '#d10d25'; //green : red

        return <span style={{'color': styleColor}}>{t('network-inventory.txt-passCount')}/{t('network-inventory.txt-totalItem')}: {gcbFilteredResult.length}/{gcbDataResult.length}</span>
      }
    }
  }
  /**
   * Display trigger button for scan type
   * @method
   * @returns HTML DOM
   */
  getTriggerBtn = () => {
    const {ipType} = this.props;
    const {activeTab, hmdInfo} = this.state;

    if (activeTab === 'gcb') {
      return <button className='btn' onClick={this.props.triggerTask.bind(this, [TRIGGER_NAME[activeTab]], ipType)} disabled={this.checkTriggerTime(activeTab)}>{t('network-inventory.txt-reCheck')}</button>
    } else if (activeTab === 'ir') {
      return <button className='btn' onClick={this.props.toggleSelectionIR.bind(this, ipType)} disabled={this.checkTriggerTime(activeTab)}>{t('network-inventory.txt-reCompress')}</button>
    } else {
      return <button className='btn' onClick={this.props.triggerTask.bind(this, [TRIGGER_NAME[activeTab]], ipType)} disabled={this.checkTriggerTime(activeTab)}>{t('network-inventory.txt-reCheck')}</button>
    }
  }
  /**
   * Load more items when scrolling to the bottom of the dialog
   * @method
   */
  loadMoreContent = () => {
    const {baseUrl} = this.context;
    const {currentDeviceData} = this.props;
    const {activeTab, hmdInfo} = this.state;
    let tempHmdInfo = {...hmdInfo};
    scrollCount++;

    this.ah.one({
      url: `${baseUrl}/api/u1/ipdevice?uuid=${currentDeviceData.ipDeviceUUID}&page=${scrollCount}&pageSize=5`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const hmdResult = data[activeTab + 'Result'];

        if (hmdResult.length > 0) {
          tempHmdInfo[activeTab].data = _.concat(hmdInfo[activeTab].data, hmdResult);

          this.setState({
            hmdInfo: tempHmdInfo,
            hasMore: true
          });
        } else {
          this.setState({
            hasMore: false
          });
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display scan content
   * @method
   * @param {object} val - scan file data
   * @param {number} i - index of the file array
   * @returns HTML DOM
   */  
  displayScanContent = (val, i) => {
    const {activeTab} = this.state;
    const dataResult = this.sortedRuleList(val.ScanResult);
    let scanPath = '';

    if (!val.taskResponseDttm) {
      return;
    }

    if (activeTab === 'yara') {
      scanPath = this.displayScanProcessPath.bind(this, i);
    } else if (activeTab === 'yaraScanFile') {
      scanPath = this.displayScanFilePath.bind(this, i);
    }

    return (
      <div className='scan-section' key={i}>
        <div className='scan-header'>
          <span>{t('network-inventory.txt-createTime')}: {helper.getFormattedDate(val.taskCreateDttm, 'local') || NOT_AVAILABLE}</span>
          <span>{t('network-inventory.txt-responseTime')}: {helper.getFormattedDate(val.taskResponseDttm, 'local') || NOT_AVAILABLE}</span>
          {this.getSuspiciousFileCount(dataResult)}
        </div>
        <div className='scan-content'>
          <div className='header'>{t('network-inventory.txt-suspiciousFilePath')}</div>
          {dataResult && dataResult.length > 0 &&
            <div className='list'>
              {dataResult.map(scanPath)}
            </div>
          }
          {(!dataResult || dataResult.length === 0) &&
            <div className='empty-msg'>{NOT_AVAILABLE}</div>
          }
        </div>
      </div>
    )
  }
  /**
   * Handle table sort for malware and gcb
   * @method
   */
  handleTableSort = () => {
    const {activeTab, malwareSort, gcbSort} = this.state;

    if (activeTab === 'malware') {
      this.setState({
        malwareSort: malwareSort === 'asc' ? 'desc' : 'asc'
      });
    } else if (activeTab === 'gcb') {
      this.setState({
        gcbSort: gcbSort === 'asc' ? 'desc' : 'asc'
      });
    }
  }
  /**
   * Display table data for malware and gcb
   * @method
   * @param {string} activeTab - current active tab
   * @param {object} val - HMD data
   * @returns DataTable component
   */
  displayDataTable = (activeTab, val) => {
    const {hmdInfo, malwareSort, gcbSort} = this.state;
    let data = '';

    if (activeTab === 'malware') {
      data = _.orderBy(val.DetectionResult, ['_IsVerifyTrust'], [malwareSort]);
    } else if (activeTab === 'gcb') {
      data = _.orderBy(val.GCBResult, ['_CompareResult'], [gcbSort]);
    }

    if (data.length === 0) {
      return <div className='empty-msg'>{NOT_AVAILABLE}</div>
    }

    if (data.length > 0) {
      return (
        <DataTable
          className='main-table'
          fields={hmdInfo[activeTab].fields}
          data={data}
          onSort={this.handleTableSort} />
      )
    }
  }
  /**
   * Display table content for malware and gcb
   * @method
   * @param {object} val - malware and gcb data
   * @param {number} i - index of the file array
   * @returns HTML DOM
   */
  displayTableContent = (val, i) => {
    const {activeTab} = this.state;

    if (!val.taskResponseDttm) {
      return;
    }

    return (
      <div className='scan-section' key={i}>
        <div className='table'>
          <div className='scan-header'>
            <span>{t('network-inventory.txt-createTime')}: {helper.getFormattedDate(val.taskCreateDttm, 'local') || NOT_AVAILABLE}</span>
            <span>{t('network-inventory.txt-responseTime')}: {helper.getFormattedDate(val.taskResponseDttm, 'local') || NOT_AVAILABLE}</span>
            {activeTab === 'malware' && this.getSuspiciousFileCount(val.DetectionResult)}
            {activeTab === 'gcb' && this.getPassTotalCount()}
          </div>
          {this.displayDataTable(activeTab, val)}
        </div>
      </div>
    )
  }
  /**
   * Display IR content
   * @method
   * @param {object} val - IR data
   * @param {number} i - index of the IR array
   * @returns HTML DOM
   */
  displayIrContent = (val, i) => {
    if (!val.taskResponseDttm) {
      return;
    }

    return (
      <div className='scan-section' key={i}>
        <div className='scan-header'>
          <span>{t('network-inventory.txt-createTime')}: {helper.getFormattedDate(val.taskCreateDttm, 'local') || NOT_AVAILABLE}</span>
          <span>{t('network-inventory.txt-responseTime')}: {helper.getFormattedDate(val.taskResponseDttm, 'local') || NOT_AVAILABLE}</span>
        </div>
        <div className='scan-content'>
          <div className='header'>{t('network-inventory.txt-irMsg')}:</div>
          <div className='empty-msg'>{val._ZipPath || NOT_AVAILABLE}</div>
        </div>
      </div>
    )
  }
  /**
   * Get table height for scan content
   * @method
   * @returns table height in px
   */
  getContentHeight = () => {
    const {page} = this.props;
    const {syncStatus} = this.state;

    if (page === 'threats') {
      return syncStatus ? 300 : 335;
    } else if (page === 'inventory') {
      return syncStatus ? 428 : 435;
    }
  }
  /**
   * Display content for HMD tabs
   * @method
   * @returns HTML DOM
   */
  getMainContent = () => {
    const {activeTab, hmdInfo, hasMore} = this.state;
    const hmdData = hmdInfo[activeTab].data;
    const loader = '';
    let displayContent = '';

    if (activeTab === 'yara' || activeTab === 'yaraScanFile') {
      displayContent = this.displayScanContent;
    } else if (activeTab === 'malware' || activeTab === 'gcb') {
      displayContent = this.displayTableContent;
    } else if (activeTab === 'ir') {
      displayContent = this.displayIrContent;
    }

    return (
      <div className='scan-wrapper'>
        {hmdData && displayContent &&
          <InfiniteScroll
            dataLength={hmdData.length}
            next={this.loadMoreContent}
            hasMore={hasMore}
            loader={loader}
            height={this.getContentHeight()}>
            {hmdData.map(displayContent)}
          </InfiniteScroll>
        }
      </div>
    )
  }
  /**
   * Get formatted field name
   * @method
   * @param {string} tempData - original field name
   * @returns formatted field name
   */
  getFieldName = (tempData) => {
    if (tempData === '_FileInfo._Filesize') {
      tempData = '_Filesize';
    }
    return 'scan-file' + tempData;
  }
  render() {
    const {activeTab, syncStatus, syncTime, buttonGroupList, hmdInfo} = this.state;

    return (
      <div className='scan-info'>
        {syncStatus &&
          <div className='sync-status'>
            <span className='fg fg-alert-1'></span>{t('network-inventory.txt-syncYaraFail')}: {syncTime}
          </div>
        }
        <ButtonGroup
          className='left'
          list={buttonGroupList}
          onChange={this.toggleScanType}
          value={activeTab} />

        <div className='info-content'>
          {!_.isEmpty(hmdInfo) &&
            <div>
              <div className='info'>
                {this.getTriggerBtn()} {/*For all*/}
                <div className='last-update'>
                  <span>{t('network-inventory.txt-createTime')}: {hmdInfo[activeTab].latestCreateDttm || hmdInfo[activeTab].createTime || NOT_AVAILABLE}</span>
                </div>
              </div>
              {this.getMainContent()}
            </div>
          }
        </div>
      </div>
    )
  }
}

HMDscanInfo.contextType = BaseDataContext;

HMDscanInfo.propTypes = {
  page: PropTypes.string.isRequired,
  currentDeviceData: PropTypes.object.isRequired,
  toggleSelectionIR: PropTypes.func.isRequired,
  triggerTask: PropTypes.func.isRequired
};

export default HMDscanInfo;