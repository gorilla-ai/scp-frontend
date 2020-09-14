import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import InfiniteScroll from 'react-infinite-scroll-component'

import ButtonGroup from 'react-ui/build/src/components/button-group'
import DataTable from 'react-ui/build/src/components/table'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import ToggleBtn from 'react-ui/build/src/components/toggle-button'

import {BaseDataContext} from './context';
import helper from './helper'
import InputPath from './input-path'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

HighchartsMore(Highcharts) //init module

const NOT_AVAILABLE = 'N/A';
const SAFETY_SCAN_LIST = [
  {
    type: 'yara',
    path: 'ScanResult'
  },
  {
    type: 'scanFile',
    path: 'scanFileResult'
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
    type: 'fileIntegrity',
    path: 'fileIntegrityResult'
  },
  {
    type: 'snapshot',
    path: 'snapshotResult'
  }
];
const TRIGGER_NAME = {
  [SAFETY_SCAN_LIST[0].type]: 'compareIOC',
  [SAFETY_SCAN_LIST[1].type]: 'scanFile',
  [SAFETY_SCAN_LIST[2].type]: 'gcbDetection',
  [SAFETY_SCAN_LIST[4].type]: 'getFileIntegrity',
  [SAFETY_SCAN_LIST[5].type]: 'getSnapshot'
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
      activeTab: 'dashboard', //dashboard, yara, scanFile, gcb, ir, fileIntegrity, settings
      buttonGroupList: [],
      polarChartSettings: {},
      activePath: null,
      activeRuleHeader: false,
      activeRule: [],
      activeDLL: false,
      activeConnections: false,
      dashboardInfo: {
        dataFieldsArr: ['item', 'score'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'score',
          desc: true
        }
      },
      gcbFieldsArr: ['_CceId', '_OriginalKey', '_Type', '_CompareResult'],
      gcbSort: 'asc',
      hmdInfo: {},
      hasMore: true,
      disabledBtn: false,
      settingsActiveContent: 'viewMode',
      originalFileIntegrityEnableData: '',
      fileIntegrityEnable: '',
      originalSettingsPathData: {},
      settingsPath: {
        includePath: [{
          path: ''
        }],
        excludePath: [{
          path: ''
        }],
        processKeyword: [{
          path: ''
        }]
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.loadInitialData();
  }
  componentDidUpdate(prevProps) {
    if (!prevProps || (this.props.currentDeviceData !== prevProps.currentDeviceData)) {
      let tempDashboardInfo = {...this.state.dashboardInfo};
      tempDashboardInfo.dataContent = [];

      this.setState({ //Reset Dashboard data content
        dashboardInfo: tempDashboardInfo
      }, () => {
        this.loadInitialData();
      });
    }

    if (!prevProps || (this.props.currentDeviceData.ip !== prevProps.currentDeviceData.ip)) {
      this.setState({
        activeTab: 'yara'
      });
    }

    if (this.chartNode) {
      Highcharts.chart(this.chartNode, this.state.polarChartSettings);
    }
  }
  componentWillUnmount() {
    scrollCount = 1;

    this.setState({
      hasMore: true
    });
  }
  /**
   * Load initial data for HMD dialog
   * @method
   */
  loadInitialData = () => {
    this.loadInitialContent();
    this.loadDashboardCharts();
    this.loadHMDdata();
    this.loadSettingsData();
  }
  /**
   * Set sync status and button group list
   * @method
   */
  loadInitialContent = () => {
    const {location, currentDeviceData} = this.props;
    let buttonGroupList = [{
      value: 'dashboard',
      text: t('txt-dashboard')
    }];

    _.forEach(SAFETY_SCAN_LIST, val => {
      if (val.type === 'snapshot') return; //Ignore 'snapshot' tab

      buttonGroupList.push({ //Create list for Button group
        value: val.type,
        text: t('network-inventory.scan-list.txt-' + val.type)
      });
    });

    if (location.pathname.indexOf('configuration') > 0) { //Add Settings tab for Config section
      buttonGroupList.push({
        value: 'settings',
        text: t('txt-setting-eng')
      });
    }

    this.setState({
      buttonGroupList
    });
  }
  /**
   * Set spider and table chart for Dashboard tab
   * @method
   */
  loadDashboardCharts = () => {
    const {currentDeviceData} = this.props;
    let polarData = {
      categories: [],
      data: []
    };
    let tempDashboardInfo = {...this.state.dashboardInfo};
    let totalScore = '';

    _.forEach(currentDeviceData.radarResult, val => {
      polarData.categories.push(val.key);
      polarData.data.push(val.value);
      tempDashboardInfo.dataContent.push({ //For Dashboard table chart
        item: val.key,
        score: val.value
      });
      totalScore = val.total;
    })

    const polarChartSettings = {
      chart: {
        polar: true,
        type: 'line'
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: polarData.categories,
        tickmarkPlacement: 'on',
        lineWidth: 0
      },
      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
        max: totalScore
      },
      legend: {
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical'
      },
      series: [{
        name: t('txt-score') + '(' + t('txt-maxScore') + ':' + totalScore + ')',
        data: polarData.data,
        pointPlacement: 'on'
      }]
    };

    if (this.chartNode) {
      Highcharts.chart(this.chartNode, polarChartSettings);
    }

    let tempFields = {};
    tempDashboardInfo.dataFieldsArr.forEach(tempData => {
      tempFields[tempData] = {
        label: t(`txt-${tempData}`),
        sortable: true,
        formatter: (value, allValue, i) => {
          return <span>{value}</span>
        }
      }
    })

    tempDashboardInfo.dataFields = tempFields;

    this.setState({
      polarChartSettings,
      dashboardInfo: tempDashboardInfo
    });
  }
  /**
   * Load and set HMD data
   * @method
   */
  loadHMDdata = () => {
    const {locale} = this.context;
    const {currentDeviceData} = this.props;
    const {gcbFieldsArr} = this.state;
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
              let color = '';
              let tooltip = '';

              if (value) {
                color = '#22ac38';
                value = 'Pass';
              } else {
                color = '#d0021b';
                value = 'Fail';
              }

              tooltip += 'GPO Value: ' + (allValue._GpoValue || 'N/A');
              tooltip += ' / GCB Value: ' + (allValue._GcbValue || 'N/A');

              return <span style={{color}} title={tooltip}>{value}</span>
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
   * Get parsed path list data
   * @method
   * @param {object} pathData - path list data
   * @returns parsed path list
   */
  getParsedPathData = (pathData) => {
    let pathList = [];

    if (pathData.length > 0) {
      _.forEach(pathData, val => {
        if (val) {
          pathList.push({
            path: val
          })
        }
      })
    } else {
      pathList.push({
        path: ''
      });
    }

    return pathList;
  }
  /**
   * Load and set Settings data
   * @method
   */
  loadSettingsData = () => {
    const {currentDeviceData} = this.props;
    let tempSettingsPath = {...this.state.settingsPath};
    let status = false;
    let includePathList = [];
    let excludePathList = [];
    let pathData = '';

    if (currentDeviceData.hmdSetting && currentDeviceData.hmdSetting.length > 0) {
      status = currentDeviceData.hmdSetting[0]._Parameters.isJobEnable;
      pathData = currentDeviceData.hmdSetting[0]._Parameters;
      tempSettingsPath.includePath = this.getParsedPathData(pathData._IncludePathList);
      tempSettingsPath.excludePath = this.getParsedPathData(pathData._ExcludePathList);
      tempSettingsPath.processKeyword = this.getParsedPathData(pathData._ProcessKeyword);
    }

    this.setState({
      originalFileIntegrityEnableData: status,
      fileIntegrityEnable: status,
      originalSettingsPathData: _.cloneDeep(tempSettingsPath),
      settingsPath: tempSettingsPath
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
      activeConnections: false,
      disabledBtn: false
    });
  }
  /**
   * Compare the current datetime and the 10 minutes after latest create time
   * @method
   * @param {string} latestCreateTime - latest create time
   * @returns boolean true/false
   */
  checkTimeAfter = (latestCreateTime) => {
    const currentDateTime = helper.getFormattedDate(Moment(), 'local');
    const oneDayAfter = helper.getAdditionDate(10, 'minutes', latestCreateTime);

    if (Moment(currentDateTime).isAfter(oneDayAfter)) {
      return false; //Enable trigger button if current time is 10 minutes after latest create time
    } else {
      return true; //Disable trigger button
    }
  }
  /**
   * Compare the task create datetime and task response datetime
   * @method
   * @param {string} type - scan type
   * @returns boolean true/false
   */
  checkTriggerTime = (type) => {
    const {disabledBtn} = this.state;
    const {currentDeviceData} = this.props;
    const resultType = type + 'Result';

    if (disabledBtn) {
      return true;
    }

    if (currentDeviceData[resultType] && currentDeviceData[resultType].length > 0) {
      if (currentDeviceData[resultType][0].latestCreateDttm) {
        const latestCreateTime = helper.getFormattedDate(currentDeviceData[resultType][0].latestCreateDttm, 'local');

        if (currentDeviceData[resultType][0].taskResponseDttm) {
          const responseTime = helper.getFormattedDate(currentDeviceData[resultType][0].taskResponseDttm, 'local');

          if (Moment(latestCreateTime).isAfter(responseTime)) {
            return this.checkTimeAfter(latestCreateTime);
          } else {
            return false; //Enable trigger button if latest create time is later than response time
          }
        } else {
          return this.checkTimeAfter(latestCreateTime);
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

    if (val._MatchedFile || val._MatchedPid) {
      const uniqueKey = val._ScanType + i;
      const uniqueID = parentIndex.toString() + i.toString() + (val._MatchedFile || val._MatchedPid);
      let displayInfo = '';

      if (val._MatchedRuleList && val._MatchedRuleList.length > 0 && val._MatchedRuleNameList) {
        displayInfo = val._MatchedRuleList.map(this.displayRule.bind(this, val._MatchedRuleNameList));
      } else {
        displayInfo = NOT_AVAILABLE;
      }

      return (
        <div className='group' key={uniqueKey}>
          <div className='path pointer' onClick={this.togglePathRule.bind(this, 'path', i, uniqueID)}>
            <i className={`fg fg-arrow-${activePath === uniqueID ? 'top' : 'bottom'}`}></i>
            <div className='path-header'>
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
   * Display boolean value
   * @method
   * @param {boolean} val - true/false value
   * @returns HTML DOM
   */
  getBoolValue = (val) => {
    return <span style={{color : val ? '#22ac38' : '#d0021b'}}>{val.toString()}</span>
  }
  /**
   * Display Scan File content
   * @method
   * @param {number} parentIndex - parent index of the scan file array
   * @param {object} val - scan file content
   * @param {number} i - index of the scan file array
   * @returns HTML DOM
   */
  displayScanFilePath = (parentIndex, val, i) => {
    const {activePath, activeRuleHeader} = this.state;
    let uniqueKey = '';
    let uniqueID = '';
    let displayInfo = NOT_AVAILABLE;
    let filePath = '';
    let matchPID = '';
    let scanType = '';

    if (val && val._FileInfo) { //For AI
      uniqueKey = val._FileInfo._Filepath + i;
      uniqueID = parentIndex.toString() + i.toString() + val._FileInfo._Filepath;
      filePath = val._FileInfo._Filepath;

      if (val.isAI) {
        scanType += 'AI';
      }
    }

    if (val && val._YaraResult && !_.isEmpty(val._YaraResult)) { //For Yara
      uniqueKey = val._YaraResult._MatchedFile + i;
      uniqueID = parentIndex.toString() + i.toString() + (val._YaraResult._MatchedFile || val._YaraResult._MatchedPid);

      if (val._YaraResult._MatchedRuleList && val._YaraResult._MatchedRuleList.length > 0 && val._YaraResult._MatchedRuleNameList) {
        displayInfo = val._YaraResult._MatchedRuleList.map(this.displayRule.bind(this, val._YaraResult._MatchedRuleNameList));
      }

      if (!filePath) {
        filePath = val._YaraResult._MatchedFile;
      }

      if (val._YaraResult._MatchedPid) {
        matchPID = ', PID: ' + val._YaraResult._MatchedPid;
      }

      if (scanType) {
        scanType += ' / ';
      }

      if (val.isYARA) {
        scanType += 'YARA';
      }
    }

    if (!filePath) {
      return;
    }

    return (
      <div className='group' key={uniqueKey}>
        <div className='path pointer' onClick={this.togglePathRule.bind(this, 'path', i, uniqueID)}>
          <i className={`fg fg-arrow-${activePath === uniqueID ? 'top' : 'bottom'}`}></i>
          <div className='path-header'>
            {filePath &&
              <span>{t('txt-path')}: {filePath}</span>
            }
            {matchPID &&
              <span>{matchPID}</span>
            }
          </div>
          <div className='scan-type'>
            {scanType &&
              <span>{scanType}</span>
            }
          </div>
        </div>
        <div className={cx('rule', {'hide': activePath !== uniqueID})}>
          <div className='rule-content'>
            {val._FileInfo && val._FileInfo._Filepath &&
              <div className='header'>
                <ul>
                  {val._FileInfo._Filepath &&
                    <li>{f('malwareFields._FileInfo._Filepath')}: {val._FileInfo._Filepath}</li>
                  }
                  {val._FileInfo._Filesize &&
                    <li>{f('malwareFields._FileInfo._Filesize')}: {helper.numberWithCommas(val._FileInfo._Filesize) + 'KB'}</li>
                  }
                  {val._FileInfo._HashValues._MD5 &&
                    <li>{f('malwareFields._FileInfo._HashValues._MD5')}: {val._FileInfo._HashValues._MD5}</li>
                  }
                  {val._IsPE &&
                    <li>{f('malwareFields._IsPE')}: {this.getBoolValue(val._IsPE)}</li>
                  }
                  {val._IsPEextension &&
                    <li>{f('malwareFields._IsPEextension')}: {this.getBoolValue(val._IsPEextension)}</li>
                  }
                  {val._IsVerifyTrust &&
                    <li>{f('malwareFields._IsVerifyTrust')}: {this.getBoolValue(val._IsVerifyTrust)}</li>
                  }
                  {val.hostIdArrCnt &&
                    <li>{f('malwareFields.hostIdArrCnt')}: {helper.numberWithCommas(val.hostIdArrCnt)}</li>
                  }
                </ul>
              </div>
            }
            {val._YaraResult && (val._YaraResult._MatchedFile || val._YaraResult._MatchedPid) &&
              <div>
                <div className='header' onClick={this.toggleInfoHeader.bind(this, 'rule')}>
                  <i className={cx('fg fg-play', {'rotate': activeRuleHeader})}></i>
                  <span>{t('txt-rule')}</span>
                </div>
                <div className={cx('sub-content', {'hide': !activeRuleHeader})}>
                  {displayInfo}
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
  /**
   * Display File Path List content
   * @method
   * @param {object} val - file path content
   * @param {number} i - index of the file path array
   * @returns HTML DOM
   */
  displayFilePathList = (val, i) => {
    const uniqueKey = val + i;

    if (!val) {
      return;
    }

    return (
      <div className='group' key={uniqueKey}>
        <div className='path'>
          <div className='path-header'>
            {val &&
              <span>{val}</span>
            }
          </div>
        </div>
      </div>
    )
  }
  /**
   * Display Yara Rules List content
   * @method
   * @param {number} parentIndex - parent index of the yara rules array
   * @param {object} val - yara rules content
   * @param {number} i - index of the yara rules array
   * @returns HTML DOM
   */
  displayYaraRuleList = (parentIndex, val, i) => {
    const {activePath} = this.state;
    const uniqueKey = val.ruleName + i;
    const uniqueID = parentIndex.toString() + i.toString() + val.ruleName;
    const ruleName = val.ruleName;
    const yaraRule = val.yaraRule;

    if (!ruleName) {
      return;
    }

    return (
      <div className='group' key={uniqueKey}>
        <div className='path pointer' onClick={this.togglePathRule.bind(this, 'path', i, uniqueID)}>
          <i className={`fg fg-arrow-${activePath === uniqueID ? 'top' : 'bottom'}`}></i>
          <div className='path-header'>
            {ruleName &&
              <span>{t('txt-name')}: {ruleName}</span>
            }
          </div>
        </div>
        <div className={cx('rule', {'hide': activePath !== uniqueID})}>
          <div className='rule-content'>
            {yaraRule &&
              <pre>{yaraRule}</pre>
            }
            {!yaraRule &&
              <div>NOT_AVAILABLE</div>
            }
          </div>
        </div>
      </div>
    )
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
      const color = dataResult.length === 0 ? '#22ac38' : '#d10d25'; //green : red
      return <span style={{color}}>{t('network-inventory.txt-suspiciousFileCount')}: {helper.numberWithCommas(dataResult.length)}</span>
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
        const color = gcbFilteredResult.length === gcbDataResult.length ? '#22ac38' : '#d10d25'; //green : red

        return <span style={{color}}>{t('network-inventory.txt-passCount')}/{t('network-inventory.txt-totalItem')}: {helper.numberWithCommas(gcbFilteredResult.length)}/{helper.numberWithCommas(gcbDataResult.length)}</span>
      }
    }
  }
  /**
   * Get current active tab name
   * @method
   * @returns current active tab
   */
  getActiveTab = () => {
    return this.state.activeTab === 'settings' ? 'snapshot' : this.state.activeTab;
  }
  /**
   * Handle trigger task button
   * @method
   * @param {string} type - scan type
   */
  getTriggerTask = (type) => {
    const {ipType} = this.props;

    if (type === 'ir') { //Special case for IR
      this.props.toggleSelectionIR(ipType);
    } else {
      if (type === 'yara') { //Special case for Yara
        this.props.toggleYaraRule(ipType);
      } else {
        this.props.triggerTask([TRIGGER_NAME[this.getActiveTab()]], ipType);

        this.setState({
          disabledBtn: true
        });
      }
    }
  }
  /**
   * Display trigger button for scan type
   * @method
   * @returns HTML DOM
   */
  getTriggerBtn = () => {
    const btnText = this.state.activeTab === 'ir' ? t('network-inventory.txt-reCompress') : t('network-inventory.txt-reCheck');
    const currentTab = this.getActiveTab();

    return <button className='btn' onClick={this.getTriggerTask.bind(this, currentTab)} disabled={this.checkTriggerTime(currentTab)}>{btnText}</button>
  }
  /**
   * Display trigger button info for scan type
   * @method
   * @returns HTML DOM
   */
  getTriggerBtnInfo = () => {
    const {ipType} = this.props;
    const {hmdInfo} = this.state;
    const currentTab = this.getActiveTab();

    return (
      <div className='info'>
        <button className='btn refresh' onClick={this.props.getHMDinfo.bind(this, ipType)}>{t('network-inventory.txt-refresh')}</button>
        {this.getTriggerBtn()}
        <div className='last-update'>
          <span>{t('network-inventory.txt-createTime')}: {hmdInfo[currentTab].latestCreateDttm || hmdInfo[currentTab].createTime || NOT_AVAILABLE}</span>
        </div>
      </div>
    )
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
   * Display File Integrity path
   * @method
   * @param {number} parentIndex - parent index of the file integrity array
   * @param {object} val - file integrity content
   * @param {number} i - index of the file integrity array
   * @returns HTML DOM
   */
  displayFileIntegrityPath = (parentIndex, val, i) => {
    const {activePath, activeRuleHeader} = this.state;
    let uniqueKey = '';
    let uniqueID = '';
    let filePath = '';

    if (val && val._FileIntegrityResultPath) {
      uniqueKey = val._FileIntegrityResultPath + i;
      uniqueID = parentIndex.toString() + i.toString() + val._FileIntegrityResultPath;
      filePath = val._FileIntegrityResultPath;
    }

    if (!filePath) {
      return;
    }

    return (
      <div className='group' key={uniqueKey}>
        <div className='path pointer' onClick={this.togglePathRule.bind(this, 'path', i, uniqueID)}>
          <i className={`fg fg-arrow-${activePath === uniqueID ? 'top' : 'bottom'}`}></i>
          <div className='path-header'>
            {filePath &&
              <span>{t('txt-path')}: {filePath}</span>
            }
          </div>
        </div>
        <div className={cx('rule', {'hide': activePath !== uniqueID})}>
          <div className='rule-content'>
            {val.Md5HashInfo &&
              <div className='header'>
                <ul>
                  {val.Md5HashInfo._BaselineMd5Hash &&
                    <li>Baseline MD5: {val.Md5HashInfo._BaselineMd5Hash}</li>
                  }
                  {val.Md5HashInfo._RealMd5Hash &&
                    <li>Real MD5: {val.Md5HashInfo._RealMd5Hash}</li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
  /**
   * Display File Integrity content
   * @method
   * @param {object} data - file integrity data object
   * @param {string} val - file integrity path type
   * @param {number} i - index of the file integrity path array
   * @returns HTML DOM
   */
  getFileIntegrityContent = (data, val, i) => {
    const dataResult = data[val];

    if (dataResult) {
      return (
        <div className='scan-content'>
          <div className='header'>{t(`network-inventory.txt-${val}`)}</div>
            {dataResult.length > 0 &&
              <div className='list'>
                {dataResult.map(this.displayFileIntegrityPath.bind(this, i))}
              </div>
            }
            {dataResult.length === 0 &&
              <div className='empty-msg'>{NOT_AVAILABLE}</div>
            }
        </div>
      )
    }
  }
  /**
   * Display content for accordion type
   * @method
   * @param {object} val - scan file data
   * @param {number} i - index of the file array
   * @returns HTML DOM
   */
  displayAccordionContent = (val, i) => {
    const {activeTab} = this.state;
    const fileIntegrityArr = ['_NewCreateFile', '_MissingFile', '_ModifyFile'];
    let dataResult = [];
    let scanPath = '';
    let filePathList = [];
    let yaraRuleList = [];

    if (!val.taskResponseDttm) {
      return;
    }

    if (activeTab === 'yara') {
      dataResult = this.sortedRuleList(val.ScanResult);
      scanPath = this.displayScanProcessPath.bind(this, i);

      if (val._Parameters) {
        filePathList = val._Parameters._FilepathList;
        yaraRuleList = val._Parameters._RulesList;
      }
    } else if (activeTab === 'scanFile') {
      dataResult = val.DetectionResult;
      scanPath = this.displayScanFilePath.bind(this, i);
    }

    return (
      <div className='scan-section' key={i}>
        <div className='scan-header'>
          <span>{t('network-inventory.txt-createTime')}: {helper.getFormattedDate(val.taskCreateDttm, 'local') || NOT_AVAILABLE}</span>
          <span>{t('network-inventory.txt-responseTime')}: {helper.getFormattedDate(val.taskResponseDttm, 'local') || NOT_AVAILABLE}</span>
          {(activeTab === 'yara' || activeTab === 'scanFile') &&
            this.getSuspiciousFileCount(dataResult)
          }
        </div>
        {(activeTab === 'yara' || activeTab === 'scanFile') &&
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
        }
        {activeTab === 'yara' &&
          <div className='scan-content'>
            <div className='header'>{t('network-inventory.txt-filePathList')}</div>
            {filePathList && filePathList.length > 0 &&
              <div className='list'>
                {filePathList.map(this.displayFilePathList)}
              </div>
            }
            {(!filePathList || filePathList.length === 0) &&
              <div className='empty-msg'>{NOT_AVAILABLE}</div>
            }
          </div>
        }
        {activeTab === 'yara' &&
          <div className='scan-content'>
            <div className='header'>{t('network-inventory.txt-yaraRules')}</div>
            {yaraRuleList && yaraRuleList.length > 0 &&
              <div className='list'>
                {yaraRuleList.map(this.displayYaraRuleList.bind(this, i))}
              </div>
            }
            {(!yaraRuleList || yaraRuleList.length === 0) &&
              <div className='empty-msg'>{NOT_AVAILABLE}</div>
            }
          </div>
        }
        {activeTab === 'fileIntegrity' &&
          fileIntegrityArr.map(this.getFileIntegrityContent.bind(this, val))
        }
      </div>
    )
  }
  /**
   * Handle table sort
   * @method
   * @param {object} sort - sort data object
   */
  handleTableSort = (sort) => {
    const {activeTab, dashboardInfo, gcbSort} = this.state;

    if (activeTab === 'gcb') {
      this.setState({
        gcbSort: gcbSort === 'asc' ? 'desc' : 'asc'
      });
    } else {
      let tempDashboardInfo = {...dashboardInfo};
      tempDashboardInfo.sort.field = sort.field;
      tempDashboardInfo.sort.desc = sort.desc;

      this.setState({
        dashboardInfo: tempDashboardInfo
      });
    }
  }
  /**
   * Display table data for gcb
   * @method
   * @param {string} activeTab - current active tab
   * @param {object} val - HMD data
   * @returns DataTable component
   */
  displayDataTable = (activeTab, val) => {
    const {hmdInfo, gcbSort} = this.state;
    let data = '';

    if (activeTab === 'gcb') {
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
   * Display table content for gcb
   * @method
   * @param {object} val - gcb data
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

    if (page === 'threats') {
      return 330;
    } else if (page === 'inventory') {
      return 435;
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

    if (activeTab === 'yara' || activeTab === 'scanFile' || activeTab === 'fileIntegrity') {
      displayContent = this.displayAccordionContent;
    } else if (activeTab === 'gcb') {
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
  /**
   * Toggle Settings active content
   * @method
   * @param {string} type - page type ('edit, 'save' and 'cancel')
   */
  toggleSettingsContent = (type) => {
    const {originalFileIntegrityEnableData, originalSettingsPathData} = this.state;
    let tempActiveContent = '';

    if (type === 'edit') {
      tempActiveContent = 'editMode';
    } else if (type === 'save') {
      tempActiveContent = 'viewMode';
    } else if (type === 'cancel') {
      tempActiveContent = 'viewMode';
      this.setState({
        fileIntegrityEnable: _.cloneDeep(originalFileIntegrityEnableData),
        settingsPath: _.cloneDeep(originalSettingsPathData)
      });
    }

    this.setState({
      settingsActiveContent: tempActiveContent
    });
  }
  /**
   * Set path data
   * @method
   * @param {string} type - path data type ('includePath', 'excludePath' or 'processKeyword')
   * @param {array} pathData - path data to be set
   */
  setPathData = (type, pathData) => {
    let tempSettingsPath = {...this.state.settingsPath};
    tempSettingsPath[type] = pathData;

    this.setState({
      settingsPath: tempSettingsPath
    });
  }
  /**
   * Display File Integrity settings content
   * @method
   * @param {object} val - FILE_INTEGRITY_SETTINGS object
   * @param {number} i - index of the FILE_INTEGRITY_SETTINGS array
   * @returns HTML DOM
   */
  getSettingsPathContent = (val, i) => {
    return (
      <div className='path-group' key={i}>
        <label>{val.headerText}</label>
        <MultiInput
          base={InputPath}
          inline={true}
          value={this.state.settingsPath[val.type]}
          onChange={this.setPathData.bind(this, val.type)} />
      </div>
    )
  }
  /**
   * Display list of settings path
   * @method
   * @param {string} type - settings path type ('includePath', 'excludePath', or 'processKeyword')
   * @param {string | object} val - settings path value
   * @param {string} i - index of the settings path array
   * @returns HTML DOM
   */
  displaySettingsPath = (type, val, i) => {
    if (val) {
      if (val.path) {
        return <span key={i}>{val.path}</span>
      } else {
        return <span key={i}>{val}</span>
      }
    }
  }
  /**
   * Display File Integrity settings view only content
   * @method
   * @param {object} val - FILE_INTEGRITY_SETTINGS object
   * @param {number} i - index of the FILE_INTEGRITY_SETTINGS array
   * @returns HTML DOM
   */
  viewSettingsPathContent = (val, i) => {
    const {settingsPath} = this.state;

    return (
      <div className='form-group' key={i}>
        <label>{val.headerText}</label>
        {settingsPath[val.type].length > 0 &&
          <div className='flex-item'>{settingsPath[val.type].map(this.displaySettingsPath.bind(this, [val.type]))}</div>
        }
        {settingsPath[val.type].length === 0 &&
          <div>{NOT_AVAILABLE}</div>
        }
      </div>
    )
  }
  /**
   * Get parsed path list data
   * @method
   * @param {string} type - path list type
   * @param {array.<object>} pathData - path list data
   * @returns parsed path list
   */
  getSavedSettings = (type, pathData) => {
    let pathList = [];
    let validPath = true;

    _.forEach(pathData, val => {
      if (val.path) {
        if (type === 'includePath' || type === 'excludePath') {
          validPath = helper.validatePathInput(val.path);

          if (validPath) {
            pathList.push(val.path);
          } else {
            helper.showPopupMsg(t('network-inventory.txt-pathFormatError'), t('txt-error'));
            return false;
          }
        } else {
          pathList.push(val.path);
        }
      }
    })

    if (type === 'includePath' && pathData.length === 0) {
      helper.showPopupMsg(t('network-inventory.txt-includePathEmpty'), t('txt-error'));
      validPath = false;
    }

    if (!validPath) {
      return validPath;
    }

    return pathList.toString();
}
  /**
   * Handle settings save confirm
   * @method
   */
  saveSettings = () => {
    const {baseUrl} = this.context;
    const {currentDeviceData} = this.props;
    const {fileIntegrityEnable, settingsPath} = this.state;
    const url = `${baseUrl}/api/hmd/snapshotSettings`;
    const requestData = {
      hostId: currentDeviceData.ipDeviceUUID,
      isJobEnable: fileIntegrityEnable,
      _IncludePathList: this.getSavedSettings('includePath', settingsPath.includePath),
      _ExcludePathList: this.getSavedSettings('excludePath', settingsPath.excludePath),
      _ProcessKeyword: this.getSavedSettings('processKeyword', settingsPath.processKeyword)
    };

    if (!requestData._IncludePathList || !requestData._ExcludePathList) { //Invalid path data
      return;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'PATCH',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        data = data[0]._Parameters;

        this.setState({
          fileIntegrityEnable: data.isJobEnable,
          settingsPath: {
            includePath: this.getParsedPathData(data._IncludePathList),
            excludePath: this.getParsedPathData(data._ExcludePathList),
            processKeyword: this.getParsedPathData(data._ProcessKeyword)
          }
        }, () => {
          this.toggleSettingsContent('save');
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Restore to default path
   * @method
   */
  restoreDefaultSettings = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/hmd/defaultSnapshotSettings`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        this.setState({
          fileIntegrityEnable: data.isJobEnable,
          settingsPath: {
            includePath: this.getParsedPathData(data._IncludePathList.split(',')),
            excludePath: this.getParsedPathData(data._ExcludePathList.split(',')),
            processKeyword: this.getParsedPathData(data._ProcessKeyword.split(','))
          }
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set file integrity status data
   * @method
   * @param {boolean} value - status data
   */
  handleStatusChange = (value) => {
    this.setState({
      fileIntegrityEnable: value
    });
  }
  render() {
    const {
      activeTab,
      buttonGroupList,
      dashboardInfo,
      hmdInfo,
      settingsActiveContent,
      fileIntegrityEnable,
      settingsPath
    } = this.state;
    const FILE_INTEGRITY_SETTINGS = [
      {
        type: 'includePath',
        headerText: t('network-inventory.txt-includePath')
      },
      {
        type: 'excludePath',
        headerText: t('network-inventory.txt-excludePath')
      },
      {
        type: 'processKeyword',
        headerText: t('network-inventory.txt-processKeyword')
      }
    ];

    return (
      <div className='scan-info'>
        <ButtonGroup
          className='left'
          list={buttonGroupList}
          value={activeTab}
          onChange={this.toggleScanType} />

        <div className='info-content'>
          {activeTab === 'dashboard' &&
            <div className='dashboard-wrapper'>
              <div className='chart-group c-box spider-chart'>
                <div ref={node => { this.chartNode = node }}></div>
              </div>

              <DataTable
                className='main-table score'
                fields={dashboardInfo.dataFields}
                data={dashboardInfo.dataContent}
                sort={dashboardInfo.dataContent.length === 0 ? {} : dashboardInfo.sort}
                onSort={this.handleTableSort} />
            </div>
          }

          {activeTab !== 'dashboard' && activeTab !== 'settings' && !_.isEmpty(hmdInfo) &&
            <div>
              {this.getTriggerBtnInfo()}
              {this.getMainContent()}
            </div>
          }

          {activeTab === 'settings' &&
            <div className='settings'>
              {this.getTriggerBtnInfo()}

              <div className='settings-wrapper'>
                <div className='options-btn'>
                  {settingsActiveContent === 'viewMode' &&
                    <button className='standard btn edit' onClick={this.toggleSettingsContent.bind(this, 'edit')}>{t('txt-edit')}</button>
                  }
                  {settingsActiveContent === 'editMode' &&
                    <div>
                      <button className='standard btn cancel' onClick={this.toggleSettingsContent.bind(this, 'cancel')}>{t('txt-cancel')}</button>
                      <button className='btn save' onClick={this.saveSettings}>{t('network-inventory.txt-saveSettings')}</button>
                      <button className='standard btn restore-default' onClick={this.restoreDefaultSettings}>{t('network-inventory.txt-restoreDefault')}</button>
                    </div>
                  }
                </div>

                <header>{t('network-inventory.scan-list.txt-fileIntegrity')}</header>
                <ToggleBtn
                  className='toggle-btn'
                  onText={t('txt-on')}
                  offText={t('txt-off')}
                  on={fileIntegrityEnable}
                  onChange={this.handleStatusChange}
                  disabled={settingsActiveContent === 'viewMode'} />
                <div className='settings-form'>
                  {settingsActiveContent === 'viewMode' && 
                    FILE_INTEGRITY_SETTINGS.map(this.viewSettingsPathContent)
                  }
                  {settingsActiveContent === 'editMode' &&
                    FILE_INTEGRITY_SETTINGS.map(this.getSettingsPathContent)
                  }
                </div>
              </div>
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
  triggerTask: PropTypes.func.isRequired,
  toggleYaraRule: PropTypes.func.isRequired,
  getHMDinfo: PropTypes.func.isRequired
};

export default withRouter(HMDscanInfo);