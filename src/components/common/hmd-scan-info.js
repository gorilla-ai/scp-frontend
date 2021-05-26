import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import InfiniteScroll from 'react-infinite-scroll-component'

import Button from '@material-ui/core/Button'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'

import DataTable from 'react-ui/build/src/components/table'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from './context'
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
    type: 'eventTracing',
    path: ''
  },
  {
    type: 'procMonitor',
    path: 'getProcessMonitorResult'
  },
  {
    type: '_Vans',
    path: '_VansResult'
  },
  {
    type: 'snapshot',
    path: 'snapshotResult'
  },
  {
    type: 'procWhiteList',
    path: 'procWhiteListResult'
  }
];
const TRIGGER_NAME = {
  [SAFETY_SCAN_LIST[0].type]: 'compareIOC',
  [SAFETY_SCAN_LIST[1].type]: 'scanFile',
  [SAFETY_SCAN_LIST[2].type]: 'gcbDetection',
  [SAFETY_SCAN_LIST[4].type]: 'getFileIntegrity',
  [SAFETY_SCAN_LIST[6].type]: 'getProcessMonitorResult',
  [SAFETY_SCAN_LIST[7].type]: 'getVans'
};
const SETTINGS = {
  snapshot: 'getSnapshot',
  procWhiteList: 'setProcessWhiteList'
};
let scrollCount = 1;

let t = null;
let f = null;

/**
 * HMD Scan Info
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the HMD scan information
 */
class HMDscanInfo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'dashboard', //'dashboard', 'yara', 'scanFile', 'gcb', 'ir', 'fileIntegrity', 'eventTracing', procMonitor', '_Vans', 'edr' or 'settings'
      buttonGroupList: [],
      polarChartSettings: {},
      activePath: null,
      activeRuleHeader: false,
      activeRule: [],
      activeDLL: false,
      activeConnections: false,
      activeExecutableInfo: false,
      activeVansProduct: null,
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
      settingsActiveContent: 'viewMode', //'viewMode' or 'editMode'
      originalSettingsPathData: {},
      settingsPath: {
        fileIntegrity: {
          includePath: [{
            path: ''
          }],
          excludePath: [{
            path: ''
          }],
          processKeyword: [{
            keyword: ''
          }]
        },
        procMonitor: {
          includePath: [{
            path: ''
          }]
        }
      },
      formValidation: {
        fileIntegrity: {
          includePath: {
            valid: true
          }
        }
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
        activeTab: 'dashboard'
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
    this.hmdTypeChecking();
    this.loadInitialContent();
    this.loadRadarCharts();
    this.loadHMDdata();
    this.loadSettingsData();
  }
  /**
   * Set active HMD tab
   * @method
   */
  hmdTypeChecking = () => {
    const {openHmdType} = this.props;

    if (openHmdType && typeof openHmdType === 'string') {
      this.setState({
        activeTab: openHmdType.replace('Result', '')
      });
    }
  }
  /**
   * Set sync status and button group list
   * @method
   */
  loadInitialContent = () => {
    const {location, currentDeviceData} = this.props;
    let buttonGroupList = [];

    buttonGroupList.push(<ToggleButton value='dashboard'>{t('txt-dashboard')}</ToggleButton>);

    _.forEach(SAFETY_SCAN_LIST, val => { //Create list for Button group
      if (val.type !== 'snapshot' && val.type !== 'procWhiteList') {
        buttonGroupList.push(<ToggleButton value={val.type}>{t('hmd-scan.scan-list.txt-' + val.type)}</ToggleButton>);
      }
    });

    if (location.pathname.indexOf('host') > 0 || location.pathname.indexOf('configuration') > 0) { //Add Settings tab for Config section
      buttonGroupList.push(<ToggleButton value='edr'>EDR</ToggleButton>);
      buttonGroupList.push(<ToggleButton value='settings'>{t('txt-settings')}</ToggleButton>);
    }

    this.setState({
      buttonGroupList
    });
  }
  /**
   * Set spider and table chart for Dashboard tab
   * @method
   */
  loadRadarCharts = () => {
    const {currentDeviceData} = this.props;
    let polarData = {
      categories: [],
      data: []
    };
    let tempDashboardInfo = {...this.state.dashboardInfo};
    let totalScore = '';

    _.forEach(currentDeviceData.safetyScanInfo.radarResult, val => {
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
      const currentDataObj = currentDeviceData.safetyScanInfo[val.type + 'Result'];

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

              if (content.length > 60) {
                const newValue = content.substr(0, 60) + '...';
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
   * @param {string} type - value type ('path' or 'keyword')
   * @param {array.<string>} listData - list data
   * @returns parsed path list
   */
  getParsedPathData = (type, listData) => {
    let pathList = [];

    if (listData) {
      if (listData.length > 0) {
        _.forEach(listData, val => {
          if (val) {
            pathList.push({
              [type]: val
            });
          }
        })
      } else {
        pathList.push({
          [type]: ''
        });
      }
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
    let includePathList = [];
    let excludePathList = [];
    let pathData = '';

    if (currentDeviceData.hmdSetting && currentDeviceData.hmdSetting.length > 0) {
      const fileIntegrityData = _.find(currentDeviceData.hmdSetting, {_CommandName: SETTINGS.snapshot});
      const processMonitorData = _.find(currentDeviceData.hmdSetting, {_CommandName: SETTINGS.procWhiteList});

      if (!_.isEmpty(fileIntegrityData) && fileIntegrityData._Parameters) {
        pathData = fileIntegrityData._Parameters;

        if (pathData._IncludePathList) {
          tempSettingsPath.fileIntegrity.includePath = this.getParsedPathData('path', pathData._IncludePathList);
        }

        if (pathData._ExcludePathList) {
          tempSettingsPath.fileIntegrity.excludePath = this.getParsedPathData('path', pathData._ExcludePathList);
        }

        if (pathData._ProcessKeyword) {
          tempSettingsPath.fileIntegrity.processKeyword = this.getParsedPathData('keyword', pathData._ProcessKeyword);
        }
      }

      if (!_.isEmpty(processMonitorData) && processMonitorData._Parameters) {
        if (processMonitorData._Parameters._WhiteList) {
          pathData = processMonitorData._Parameters._WhiteList;
          tempSettingsPath.procMonitor.includePath = this.getParsedPathData('path', pathData);
        }
      }

      this.setState({
        originalSettingsPathData: _.cloneDeep(tempSettingsPath),
        settingsPath: tempSettingsPath
      });
    }
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
   * @param {object} event - event object
   * @param {string} activeTab - active scan type
   */
  toggleScanType = (event, activeTab) => {
    const {baseUrl} = this.context;
    const {currentDeviceData} = this.props;

    if (!activeTab) {
      return;
    }

    if (activeTab === 'settings') {
      this.toggleSettingsContent('cancel');
    }

    scrollCount = 1;

    this.setState({
      activeTab,
      activePath: null,
      activeRuleHeader: false,
      activeRule: [],
      activeDLL: false,
      activeConnections: false,
      activeExecutableInfo: false,
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
    const currentDateTime = helper.getFormattedDate(moment(), 'local');
    const tenMinutesAfter = helper.getAdditionDate(10, 'minutes', latestCreateTime);

    if (moment(currentDateTime).isAfter(tenMinutesAfter)) {
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
    const resultType = type + 'Result';
    const currentDevice = this.props.currentDeviceData.safetyScanInfo[resultType];

    if (this.state.disabledBtn) {
      return true; //Disable trigger button
    }

    if (currentDevice && currentDevice.length > 0) {
      if (currentDevice[0].latestCreateDttm) {
        const latestCreateTime = helper.getFormattedDate(currentDevice[0].latestCreateDttm, 'local');

        if (currentDevice[0].taskResponseDttm) {
          const responseTime = helper.getFormattedDate(currentDevice[0].taskResponseDttm, 'local');

          if (moment(latestCreateTime).isAfter(responseTime)) {
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
   * @param {string} type - scan type ('path' or 'rule')
   * @param {number} i - index of the rule array
   * @param {string} id - unique ID of the rule array
   */
  togglePathRule = (type, i, id) => {
    const {activePath, activeRule} = this.state;

    if (type === 'path') {
      this.setState({
        activePath: activePath === id ? null : id,
        activeRuleHeader: false,
        activeRule: [],
        activeDLL: false,
        activeConnections: false,
        activeExecutableInfo: false
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

    return (
      <div key={val + i} className='item-content'>
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
    return (
      <div key={val + i}>{val}</div>
    )
  }
  /**
   * Display file path for Yara Scan and Process Monitor
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
   * Display individual connection for Yara Scan and Process Monitor
   * @method
   * @param {object} val - connection data
   * @param {number} i - index of the connections array
   * @returns HTML DOM
   */
  displayIndividualConnection = (val, i) => {
    return (
      <ul key={val + i}>
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
   * Display item for Executable Info
   * @method
   * @param {object} info - executable data
   * @param {string} val - executable list
   * @param {number} i - index of the executable list array
   * @returns HTML DOM
   */
  displayExecutableList = (info, val, i) => {
    let value = info._ProcessInfo._ExecutableInfo[val];

    if (val === '_AutorunLocation' || val === '_CommandLine') {
      value = info._ProcessInfo[val];
    }

    if (val === '_Filepath' || val === '_Filesize') {
      value = info._ProcessInfo._ExecutableInfo._FileInfo[val];

      if (val === '_Filesize') {
        value = helper.numberWithCommas(helper.formatBytes(value));
      }
    }

    if (val === '_MD5' || val === '_SHA1' || val === '_SHA256') {
      value = info._ProcessInfo._ExecutableInfo._FileInfo._HashValues[val];
    }

    if (val === '_IsPE') {
      value = this.getBoolValue(value);
    }

    if (val === '_Signatures') { //Signature is an array type
      let signatureList = '';
      value = '';

      if (info._ProcessInfo && info._ProcessInfo._ExecutableInfo[val].length > 0) {
        _.forEach(info._ProcessInfo._ExecutableInfo[val], val => {
          signatureList = <ul className='signature-list padding'><li><span className='blue-color'>{t('hmd-scan.signature._CertificateType')}</span>: {val._CertificateType}</li><li><span className='blue-color'>{t('hmd-scan.signature._IssuerName')}</span>: {val._IssuerName}</li><li><span className='blue-color'>{t('hmd-scan.signature._SerialNumber')}</span>: {val._SerialNumber}</li><li><span className='blue-color'>{t('hmd-scan.signature._SubjectName')}</span>: {val._SubjectName}</li></ul>;
        })
      }

      if (signatureList) {
        value = <ul className='signature-list'>{signatureList}</ul>;
      }
    }

    return <li key={val + i}><span className='blue-color'>{t('hmd-scan.executable-list.txt-' + val)}</span>: {value || NOT_AVAILABLE}</li>
  }
  /**
   * Display Executable Info for Process Monitor
   * @method
   * @param {object} val - process monitor data
   * @returns HTML DOM
   */
  displayExecutableInfo = (val) => {
    const {activeExecutableInfo} = this.state;
    const executableList = ['_AutorunLocation', '_CommandLine', '_CompanyName', '_Filepath', '_Filesize', '_MD5', '_SHA1', '_SHA256', '_IsPE', '_OwnerSID', '_Signatures'];

    if (val._ProcessInfo && val._ProcessInfo._ExecutableInfo) {
      return (
        <div className={cx('sub-content', {'hide': !activeExecutableInfo})}>
          <ul className='no-padding'>
            {executableList.map(this.displayExecutableList.bind(this, val))}
          </ul>
        </div>
      )
    }
  }
  /**
   * Toggle scan rule item on/off
   * @method
   * @param {string} type - item type ('rule', 'dll', 'connections', 'executableInfo' or 'vans')
   * @param {string} id - unique ID of vans
   */
  toggleInfoHeader = (type, id) => {
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
    } else if (type === 'executableInfo') {
      this.setState({
        activeExecutableInfo: !this.state.activeExecutableInfo
      });
    } else if (type === 'vans') {
      this.setState({
        activeVansProduct: this.state.activeVansProduct === id ? null : id
      });
    }
  }
  /**
   * Add file path to Settings tab
   * @method
   * @param {string} type - Scan type
   * @param {string} path - File path to be added
   */
  addToSettings = (type, path) => {
    const {settingsPath} = this.state;
    let tempSettingsPath = {...settingsPath};

    if (settingsPath[type].includePath.length === 1 && settingsPath[type].includePath[0].path === '') { //Take care the empty path
      tempSettingsPath[type].includePath[0].path = path;
    } else {
      tempSettingsPath[type].includePath.push({path});
    }

    this.setState({
      activeTab: 'settings',
      settingsActiveContent: 'editMode',
      settingsPath: tempSettingsPath
    }, () => {
      const settings = document.getElementById('settingsWrapper');
      settings.scrollIntoView(false);
    });
  }
  /**
   * Display Yara Scan Process and Process Monitor content
   * @method
   * @param {number} parentIndex - parent index of the scan process array
   * @param {object} val - scan data content
   * @param {number} i - index of the scan process array
   * @returns HTML DOM
   */
  displayScanProcessPath = (parentIndex, val, i) => {
    const {location} = this.props;
    const {activeTab, activePath, activeRuleHeader, activeDLL, activeConnections, activeExecutableInfo} = this.state;
    let filePath = val._MatchedFile;

    if (val._ProcessInfo) {
      filePath = filePath || val._ProcessInfo._ExecutableInfo._FileInfo._Filepath;
    }

    if (!filePath && !val._MatchedPid) {
      return;
    }

    const uniqueID = parentIndex.toString() + i.toString() + (filePath || val._MatchedPid);
    const uniqueKey = uniqueID;
    let displayInfo = '';

    if (val._MatchedRuleList && val._MatchedRuleList.length > 0 && val._MatchedRuleNameList) {
      displayInfo = val._MatchedRuleList.map(this.displayRule.bind(this, val._MatchedRuleNameList));
    } else {
      displayInfo = NOT_AVAILABLE;
    }

    return (
      <div key={uniqueKey} className='group'>
        <div className='path'>
          <i className={`fg fg-arrow-${activePath === uniqueID ? 'top' : 'bottom'}`} onClick={this.togglePathRule.bind(this, 'path', i, uniqueID)}></i>
          <div className='path-header'>
            {filePath &&
              <span>{t('txt-path')}: {filePath}</span>
            }
            {filePath && val._MatchedPid &&
              <span>, </span>
            }
            {val._MatchedPid &&
              <span>PID: {val._MatchedPid}</span>
            }
            {activeTab === 'procMonitor' && (location.pathname.indexOf('host') > 0 || location.pathname.indexOf('configuration') > 0) &&
              <i className='c-link fg fg-add' title={t('hmd-scan.txt-addToFilterList')} onClick={this.addToSettings.bind(this, 'procMonitor', filePath)}></i>
            }
          </div>
        </div>
        <div className={cx('rule', {'hide': activePath !== uniqueID})}>
          {activeTab === 'yara' &&
            <div className='item-content'>
              <div className='header' onClick={this.toggleInfoHeader.bind(this, 'rule')}>
                <i className={cx('fg fg-play', {'rotate': activeRuleHeader})}></i>
                <span>{t('txt-rule')}</span>
              </div>
              <div className={cx('sub-content', {'hide': !activeRuleHeader})}>
                {displayInfo}
              </div>
            </div>
          }

          <div className='item-content'>
            <div className='header' onClick={this.toggleInfoHeader.bind(this, 'dll')}>
              <i className={cx('fg fg-play', {'rotate': activeDLL})}></i>
              <span>DLLs</span>
            </div>
            {this.displayFilePath(val)}
          </div>

          <div className='item-content'>
            <div className='header' onClick={this.toggleInfoHeader.bind(this, 'connections')}>
              <i className={cx('fg fg-play', {'rotate': activeConnections})}></i>
              <span>{t('txt-networkBehavior')}</span>
            </div>
            {this.displayConnections(val)}
          </div>

          {activeTab === 'procMonitor' &&
            <div className='item-content'>
              <div className='header' onClick={this.toggleInfoHeader.bind(this, 'executableInfo')}>
                <i className={cx('fg fg-play', {'rotate': activeExecutableInfo})}></i>
                <span>{t('txt-executableInfo')}</span>
              </div>
              {this.displayExecutableInfo(val)}
            </div>
          }
        </div>
      </div>
    )
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
   * Open confirm white list dialog
   * @method
   * @param {string} fileMD5 - File MD5
   * @param {string} [ipType] - 'srcIp' or 'destIp'
   */
  confirmAddWhitelist = (fileMD5, ipType) => {
    PopupDialog.prompt({
      title: t('hmd-scan.txt-addWhiteList'),
      id: 'modalWindowSmall',
      confirmText: t('txt-ok'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content'>
          <span>{t('hmd-scan.txt-confirmWhiteList')}?</span>
        </div>
      ),
      act: (confirmed) => {
        if (confirmed) {
          this.props.addToWhiteList(fileMD5, ipType);
        }
      }
    });
  }
  /**
   * Display Scan File (Malware) content
   * @method
   * @param {number} parentIndex - parent index of the scan file array
   * @param {object} val - scan file content
   * @param {number} i - index of the scan file array
   * @returns HTML DOM
   */
  displayScanFilePath = (parentIndex, val, i) => {
    const {ipType} = this.props;
    const {activePath, activeRuleHeader} = this.state;
    const virusTotalLink = `https://www.virustotal.com/gui/file/${val._FileInfo._HashValues._MD5}`;
    let uniqueKey = '';
    let uniqueID = '';
    let displayInfo = NOT_AVAILABLE;
    let filePath = '';
    let matchPID = '';
    let detectedCount = NOT_AVAILABLE;
    let formattedFilePath = '';

    if (val && val._FileInfo) { //For AI
      uniqueKey = val._FileInfo._Filepath + i;
      uniqueID = parentIndex.toString() + i.toString() + val._FileInfo._Filepath;
      filePath = val._FileInfo._Filepath;
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
    }

    if (val.virusTotalDetectedCount !== null) {
      detectedCount = val.virusTotalDetectedCount;
    }

    if (filePath) {
      if (filePath.length >= 100) {
        formattedFilePath = filePath.substr(0, 100) + '...';
      } else {
        formattedFilePath = filePath;
      }
    } else {
      return;
    }

    return (
      <div key={uniqueKey} className='group'>
        <div className='path'>
          <i className={`fg fg-arrow-${activePath === uniqueID ? 'top' : 'bottom'}`} onClick={this.togglePathRule.bind(this, 'path', i, uniqueID)}></i>
          <div className='path-header'>
            {filePath &&
              <span title={filePath}>{t('txt-path')}: {formattedFilePath}</span>
            }
            {matchPID &&
              <span>{matchPID}</span>
            }
          </div>
          {val.hasHandled === false &&
            <Button variant='outlined' color='primary' className='path-btn' onClick={this.confirmAddWhitelist.bind(this, val._FileInfo._HashValues._MD5, ipType)}>{t('hmd-scan.txt-addWhiteList')}</Button>
          }
          {val.hasHandled === true &&
            <span className='normal-cursor'>{t('hmd-scan.txt-addedWhiteList')}</span>
          }
        </div>
        <div className={cx('rule', {'hide': activePath !== uniqueID})}>
          <div className='item-content'>
            {val._FileInfo && val._FileInfo._Filepath &&
              <div className='header'>
                <ul>
                  {val._FileInfo._Filepath &&
                    <li><span className='blue-color'>{f('malwareFields._FileInfo._Filepath')}</span>: {val._FileInfo._Filepath}</li>
                  }
                  {val._FileInfo._Filesize &&
                    <li><span className='blue-color'>{f('malwareFields._FileInfo._Filesize')}</span>: {helper.numberWithCommas(helper.formatBytes(val._FileInfo._Filesize))}</li>
                  }
                  {val._FileInfo._HashValues._MD5 &&
                    <li><span className='blue-color'>{f('malwareFields._FileInfo._HashValues._MD5')}</span>: {val._FileInfo._HashValues._MD5}</li>
                  }
                  <li><span className='blue-color'>{f('malwareFields.detectedCount')}</span>: {helper.numberWithCommas(detectedCount)} (<a href={virusTotalLink} target='_blank'>VirusTotal</a>)</li>
                  {val._IsPE &&
                    <li><span className='blue-color'>{f('malwareFields._IsPE')}</span>: {this.getBoolValue(val._IsPE)}</li>
                  }
                  {val._IsPEextension &&
                    <li><span className='blue-color'>{f('malwareFields._IsPEextension')}</span>: {this.getBoolValue(val._IsPEextension)}</li>
                  }
                  {val._IsVerifyTrust &&
                    <li><span className='blue-color'>{f('malwareFields._IsVerifyTrust')}</span>: {this.getBoolValue(val._IsVerifyTrust)}</li>
                  }
                  {val.hostIdArrCnt &&
                    <li><span className='blue-color'>{f('malwareFields.hostIdArrCnt')}</span>: {helper.numberWithCommas(val.hostIdArrCnt)}</li>
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
      <div key={uniqueKey} className='group'>
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
      <div key={uniqueKey} className='group'>
        <div className='path'>
          <i className={`fg fg-arrow-${activePath === uniqueID ? 'top' : 'bottom'}`} onClick={this.togglePathRule.bind(this, 'path', i, uniqueID)}></i>
          <div className='path-header'>
            {ruleName &&
              <span>{t('txt-name')}: {ruleName}</span>
            }
          </div>
        </div>
        <div className={cx('rule', {'hide': activePath !== uniqueID})}>
          <div className='item-content'>
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
   * Display Vans details content
   * @method
   * @param {object} val - individual vans data content
   * @param {number} i - index of the vans data
   * @returns HTML DOM
   */
  displayVansData = (val, i) => {
    const {activeVansProduct} = this.state;
    const uniqueKey = val.id + i;
    const severityLevel = helper.capitalizeFirstLetter(val.severity);
    let color = '';

    switch (severityLevel) {
      case 'High':
        color = '#CC2943';
        break;
      case 'Medium':
        color = '#CC7B29';
        break;
      case 'Low':
        color = '#29CC7A';
        break;
    }

    return (
      <div key={uniqueKey} className='item-content'>
        <div className='header' onClick={this.toggleInfoHeader.bind(this, 'vans', uniqueKey)}>
          <i className={cx('fg fg-play', {'rotate': activeVansProduct === uniqueKey})}></i>
          <span>{val.id}</span>
        </div>
        <div className={cx('sub-content', {'hide': activeVansProduct !== uniqueKey})}>
          <table className='c-table main-table vans'>
            <tbody>
              <tr>
                <td>{t('txt-severity')}</td>
                <td><span style={{color}}>{severityLevel}</span></td>
              </tr>
              {val.description.description_data.length > 0 &&
                <tr>
                  <td>{t('txt-description')}</td>
                  <td>{val.description.description_data.map(this.displayVansContent.bind(this, 'desc'))}</td>
                </tr>
              }
              {val.referenceData.reference_data.length > 0 &&
                <tr>
                  <td>{t('txt-reference')}</td>
                  <td><ul>{val.referenceData.reference_data.map(this.displayVansContent.bind(this, 'ref'))}</ul></td>
                </tr>
              }
              <tr>
                <td>{t('hmd-scan.txt-publishedDate')}</td>
                <td>{helper.getFormattedDate(val.publishedDate, 'local')}</td>
              </tr>
              <tr>
                <td>{t('hmd-scan.txt-lastModifiedDate')}</td>
                <td>{helper.getFormattedDate(val.lastModifiedDate, 'local')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  /**
   * Display Vans content
   * @method
   * @param {number} parentIndex - parent index of the vans array
   * @param {object} val - vans data content
   * @param {number} i - index of the vans array
   * @returns HTML DOM
   */
  displayVansPath = (parentIndex, val, i) => {
    const {activePath} = this.state;
    const vansName = val.name;
    const uniqueKey = vansName + i;
    const uniqueID = parentIndex.toString() + i.toString() + vansName;

    return (
      <div key={uniqueKey} className='group'>
        <div className='path'>
          <i className={`fg fg-arrow-${activePath === uniqueID ? 'top' : 'bottom'}`} onClick={this.togglePathRule.bind(this, 'path', i, uniqueID)}></i>
          <div className='path-header'>
            <span><span className='main'>{val.vendor}</span> | <span className='main'>{val.product}</span> | <span className='main'>{val.version}</span> | {vansName}</span>
          </div>
          <div className='product-count'>
            <span>{val.rows.length}</span>
          </div>
        </div>
        <div className={cx('rule', {'hide': activePath !== uniqueID})}>
          {val.rows.length > 0 &&
            val.rows.map(this.displayVansData)
          }
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
      activeTab: 'dashboard',
      activePath: null,
      activeRuleHeader: false,
      activeDLL: false,
      activeConnections: false,
      activeExecutableInfo: false
    }, () => {
      this.props.showAlertData(type);
    });
  }
  /**
   * Display suspicious file count content
   * @method
   * @param {array} dataResult - HMD data
   * @param {number} totalCount - total count for scan file
   * @returns HTML DOM
   */
  getSuspiciousFileCount = (dataResult, totalCount) => {
    const count = this.state.activeTab === 'scanFile' ? totalCount : dataResult.length;
    const color = count === 0 ? '#22ac38' : '#d10d25'; //green : red

    return <span style={{color}}>{t('hmd-scan.txt-suspiciousFileCount')}: {helper.numberWithCommas(count)}</span>
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

        return <span style={{color}}>{t('hmd-scan.txt-passCount')}/{t('hmd-scan.txt-totalItem')}: {helper.numberWithCommas(gcbFilteredResult.length)}/{helper.numberWithCommas(gcbDataResult.length)}</span>
      }
    }
  }
  /**
   * Handle trigger task button
   * @method
   * @param {string} type - scan type
   */
  getTriggerTask = (type) => {
    const {ipType} = this.props;
    const {activeTab} = this.state;

    if (type === 'ir') { //Special case for IR
      this.props.toggleSelectionIR(ipType);
    } else {
      if (type === 'yara') { //Special case for Yara
        this.props.toggleYaraRule(ipType);
      } else {
        if (activeTab === 'settings') { //For Settings tab
          if (type === 'snapshot') {
            this.props.triggerTask([SETTINGS[type]]);
          } else if (type === 'procWhiteList') {
            const procMonitorPath = this.state.settingsPath.procMonitor.includePath;
            let formattedPath = [];

            _.forEach(procMonitorPath, val => {
              if (val.path) {
                formattedPath.push(val.path);
              }
            });

            this.props.triggerTask([SETTINGS[type]], formattedPath);
          }
        } else {
          this.props.triggerTask([TRIGGER_NAME[activeTab]], ipType);
        }
      }
    }
  }
  /**
   * Display trigger button info for scan type
   * @method
   * @param {string} [type] - tab ('fileIntegrity' or 'procMonitor')
   * @returns HTML DOM
   */
  getTriggerBtnInfo = (type) => {
    const {ipType} = this.props;
    const {activeTab, hmdInfo} = this.state;
    const btnText = activeTab === 'ir' ? t('hmd-scan.txt-reCompress') : t('hmd-scan.txt-reCheck');
    let currentTab = activeTab;

    if (type) { //Exceptions for Settings tab
      if (type === 'fileIntegrity') {
        currentTab = 'snapshot';
      } else if (type === 'procMonitor') {
        currentTab = 'procWhiteList';
      }
    }

    return (
      <div className='info'>
        {activeTab !== 'settings' &&
          <Button variant='contained' color='primary' className='btn refresh' onClick={this.props.getHMDinfo.bind(this, ipType)}>{t('hmd-scan.txt-refresh')}</Button>
        }
        {activeTab !== 'eventTracing' && activeTab !== 'edr' &&
          <div>
            <Button variant='contained' color='primary' className='btn' onClick={this.getTriggerTask.bind(this, currentTab)} disabled={this.checkTriggerTime(currentTab)}>{btnText}</Button>
            <div className='last-update'>
              <span>{t('hmd-scan.txt-createTime')}: {hmdInfo[currentTab].latestCreateDttm || hmdInfo[currentTab].createTime || NOT_AVAILABLE}</span>
            </div>
          </div>
        }
      </div>
    )
  }
  /**
   * Load more items when scrolling to the bottom of the dialog
   * @method
   */
  loadMoreContent = () => {
    const {baseUrl} = this.context;
    const {page, assessmentDatetime, currentDeviceData} = this.props;
    const {activeTab, hmdInfo} = this.state;

    scrollCount++;
    let url = `${baseUrl}/api/v2/ipdevice?uuid=${currentDeviceData.ipDeviceUUID}&page=${scrollCount}&pageSize=5`;

    if (page === 'host') {
      url += `&startDttm=${assessmentDatetime.from}&endDttm=${assessmentDatetime.to}`;
    }

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      if (data && data.safetyScanInfo) {
        const hmdResult = data.safetyScanInfo[activeTab + 'Result'];
        let tempHmdInfo = {...hmdInfo};

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
    let uniqueKey = i;
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
      <div key={uniqueKey} className='group'>
        <div className='path' onClick={this.togglePathRule.bind(this, 'path', i, uniqueID)}>
          <div className='path-header'>
            {filePath &&
              <span>{t('txt-path')}: {filePath}</span>
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
          <div className='header'>{t(`hmd-scan.txt-${val}`)}</div>
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
   * Handle malware button action
   * @method
   * @param {string} type - button type ('download' or 'compress')
   * @param {object | string} dataResult - malware detection result or 'getHmdLogs'
   * @param {string} id - Task ID or Host ID
   * @param {string} from - 'task' or 'host'
   */
  handleMalwareBtn = (type, dataResult, id, from) => {
    const {baseUrl, contextRoot} = this.context;

    if (type === 'download') {
      const url = `${baseUrl}${contextRoot}/api/hmd/file/_download?${from}Id=${id}`;
      window.open(url, '_blank');
      return;
    }

    if (from === 'task') {
      const filePath = _.map(dataResult, val => {
        return val._FileInfo._Filepath;
      });
      this.props.triggerFilesTask(filePath, id);
    } else if (from === 'host') {
      const requestData = {
        hostId: id,
        cmds: [dataResult],
      };

      this.ah.one({
        url: `${baseUrl}/api/hmd/retrigger`,
        data: JSON.stringify(requestData),
        type: 'POST',
        contentType: 'text/plain'
      })
      .then(data => {
        if (data) {
          helper.showPopupMsg(t('txt-requestSent'));
        }
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
  }
  /**
   * Check malware button disabled
   * @method
   * @param {string} type - button type ('download' or 'compress')
   * @param {object} dataResult - malware detection result
   */
  checkMalwareCompress = (type, dataResult) => {
    if (type === 'compress' && dataResult.length === 0) {
      return true;
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
    const malwareBtnType = val.isUploaded ? 'download' : 'compress';
    let dataResult = [];
    let scanPath = '';
    let filePathList = [];
    let yaraRuleList = [];
    let header = t('hmd-scan.txt-suspiciousFilePath');    

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
    } else if (activeTab === 'procMonitor') {
      dataResult = val.getProcessMonitorResult;
      scanPath = this.displayScanProcessPath.bind(this, i);
    } else if (activeTab === '_Vans') {
      dataResult = val.cpeInfoArray;
      scanPath = this.displayVansPath.bind(this, i);
      header = t('hmd-scan.txt-vulnerabilityInfo');
    }

    return (
      <div key={i} className='scan-section'>
        <div className='scan-header'>
          <span>{t('hmd-scan.txt-createTime')}: {helper.getFormattedDate(val.taskCreateDttm, 'local') || NOT_AVAILABLE}</span>
          <span>{t('hmd-scan.txt-responseTime')}: {helper.getFormattedDate(val.taskResponseDttm, 'local') || NOT_AVAILABLE}</span>
          {val.taskStatus && val.taskStatus === 'Failure' &&
            <span style={{color: '#d10d25'}}>{t('hmd-scan.txt-taskFailure')}</span>
          }
          {val.taskStatus && val.taskStatus === 'NotSupport' &&
            <span style={{color: '#d10d25'}}>{t('hmd-scan.txt-notSupport')}</span>
          }
          {(activeTab === 'yara' || activeTab === 'scanFile' || activeTab === 'procMonitor') && dataResult &&
            this.getSuspiciousFileCount(dataResult, val.TotalCnt)
          }
          {activeTab === 'scanFile' && dataResult &&
            <Button variant='contained' color='primary' className='btn download' onClick={this.handleMalwareBtn.bind(this, malwareBtnType, dataResult, val.taskId, 'task')} disabled={this.checkMalwareCompress(malwareBtnType, dataResult)}>{t(`hmd-scan.txt-${malwareBtnType}File`)}</Button>
          }
          {activeTab === '_Vans' && dataResult && dataResult.length > 0 &&
            <span style={{color: '#d10d25'}}>{t('hmd-scan.txt-VulnerabilityCount')}: {dataResult.length}</span>
          }
        </div>
        {(activeTab === 'yara' || activeTab === 'scanFile' || activeTab === 'procMonitor' || activeTab === '_Vans') &&
          <div className='scan-content'>
            <div className='header'>{header}</div>
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
            <div className='header'>{t('hmd-scan.txt-filePathList')}</div>
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
            <div className='header'>{t('hmd-scan.txt-yaraRules')}</div>
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
      <div key={i} className='scan-section'>
        <div className='table'>
          <div className='scan-header'>
            <span>{t('hmd-scan.txt-createTime')}: {helper.getFormattedDate(val.taskCreateDttm, 'local') || NOT_AVAILABLE}</span>
            <span>{t('hmd-scan.txt-responseTime')}: {helper.getFormattedDate(val.taskResponseDttm, 'local') || NOT_AVAILABLE}</span>
            {val.taskStatus && val.taskStatus === 'Failure' &&
              <span style={{color: '#d10d25'}}>{t('hmd-scan.txt-taskFailure')}</span>
            }
            {val.taskStatus && val.taskStatus === 'NotSupport' &&
              <span style={{color: '#d10d25'}}>{t('hmd-scan.txt-notSupport')}</span>
            }
            {activeTab === 'gcb' && (!val.taskStatus || val.taskStatus && val.taskStatus === 'Complete') &&
              this.getPassTotalCount()
            }
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
      <div key={i} className='scan-section'>
        <div className='scan-header'>
          <span>{t('hmd-scan.txt-createTime')}: {helper.getFormattedDate(val.taskCreateDttm, 'local') || NOT_AVAILABLE}</span>
          <span>{t('hmd-scan.txt-responseTime')}: {helper.getFormattedDate(val.taskResponseDttm, 'local') || NOT_AVAILABLE}</span>
          {val.taskStatus && val.taskStatus === 'Failure' &&
            <span style={{color: '#d10d25'}}>{t('hmd-scan.txt-taskFailure')}</span>
          }
          {val.taskStatus && val.taskStatus === 'NotSupport' &&
            <span style={{color: '#d10d25'}}>{t('hmd-scan.txt-notSupport')}</span>
          }
        </div>
        <div className='scan-content'>
          <div className='header'>{t('hmd-scan.txt-irMsg')}:</div>
          <div className='empty-msg'>{val._ZipPath || NOT_AVAILABLE}</div>
        </div>
      </div>
    )
  }
  /**
   * Get table height for scan content
   * @method
   * @param {string} type - display type ('scan' or 'event')
   * @returns table height in px
   */
  getContentHeight = (type) => {
    const {page} = this.props;

    if (type === 'scan') {
      if (page === 'host') {
        return 440;
      } else if (page === 'threats') {
        return 380;
      } else if (page === 'inventory') {
        return 435;
      }
    } else if (type === 'event') {
      if (page === 'host') {
        return 475;
      } else if (page === 'threats') {
        return 415;
      } else if (page === 'inventory') {
        return 485;
      }
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
    let displayContent = '';

    if (activeTab === 'yara' || activeTab === 'scanFile' || activeTab === 'fileIntegrity' || activeTab === 'procMonitor' || activeTab === '_Vans') {
      displayContent = this.displayAccordionContent;
    } else if (activeTab === 'gcb') {
      displayContent = this.displayTableContent;
    } else if (activeTab === 'ir') {
      displayContent = this.displayIrContent;
    }

    return (
      <div className='scan-wrapper'>
        {hmdData && hmdData.length > 0 &&
          <InfiniteScroll
            dataLength={hmdData.length}
            next={this.loadMoreContent}
            hasMore={hasMore}
            height={this.getContentHeight('scan')}>
            {hmdData.map(displayContent)}
          </InfiniteScroll>
        }

        {(!hmdData || hmdData.length === 0) &&
          <div className='empty-msg'>{NOT_AVAILABLE}</div>
        }
      </div>
    )
  }
  /**
   * Display content for Event Tracing
   * @method
   * @returns HTML DOM
   */
  getEventTracingContent = () => {
    const {ipType, eventInfo} = this.props;
    const dataCount = eventInfo.dataContent.length;

    return (
      <div className='scan-section'>
        {dataCount > 0 &&
          <div className='table event-tracing'>
            <InfiniteScroll
              dataLength={dataCount}
              next={this.props.loadEventTracing.bind(this, ipType)}
              hasMore={eventInfo.hasMore}
              height={this.getContentHeight('event')}>
              <DataTable
                className='main-table'
                fields={eventInfo.dataFields}
                data={eventInfo.dataContent} />
            </InfiniteScroll>
          </div>
        }

        {dataCount === 0 &&
          <div className='empty-msg' style={{marginTop: '20px'}}>{NOT_AVAILABLE}</div>
        }
      </div>
    )
  }
  /**
   * Handle button click for EDR
   * @method
   * @param {string} type - btn type ('shutdownHost', 'logoffAllUsers', 'netcut', 'netcutResume')
   */
  handleEdrBtn = (type) => {
    const {baseUrl} = this.context;
    const {currentDeviceData} = this.props;
    const url = `${baseUrl}/api/hmd/retrigger`;
    const requestData = {
      hostId: currentDeviceData.ipDeviceUUID,
      cmds: [type]
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-requestSent'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
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
    const {originalSettingsPathData} = this.state;
    let tempActiveContent = '';

    if (type === 'edit') {
      tempActiveContent = 'editMode';
    } else if (type === 'save') {
      tempActiveContent = 'viewMode';
    } else if (type === 'cancel') {
      tempActiveContent = 'viewMode';

      this.setState({
        settingsPath: _.cloneDeep(originalSettingsPathData),
        formValidation: {
          fileIntegrity: {
            includePath: {
              valid: true
            }
          }
        }
      });
    }

    this.setState({
      settingsActiveContent: tempActiveContent
    });
  }
  /**
   * Display list of settings path
   * @method
   * @param {object} val - settings path object
   * @param {string} i - index of the settings path array
   * @returns HTML DOM
   */
  displaySettingsPath = (val, i) => {
    return <div key={i} className={cx('item', {'block': val.path})}><span>{val.path || val.keyword}</span></div>
  }
  /**
   * Display File Integrity settings view only content
   * @method
   * @param {string} type - path type ('fileIntegrity', 'procMonitor')
   * @param {object} val - settings object
   * @param {number} i - index of the settings array
   * @returns HTML DOM
   */
  viewSettingsPathContent = (type, val, i) => {
    const {settingsPath} = this.state;
    const dataType = val.type === 'processKeyword' ? 'keyword' : 'path';

    return (
      <div key={i} className='form-group'>
        <label>{val.headerText}</label>
        {settingsPath[type][val.type][0][dataType] !== '' &&
          <div className='path-item'>{settingsPath[type][val.type].map(this.displaySettingsPath)}</div>
        }
        {settingsPath[type][val.type][0][dataType] === '' &&
          <div>{NOT_AVAILABLE}</div>
        }
      </div>
    )
  }
  /**
   * Set path data
   * @method
   * @param {string} type - path type ('fileIntegrity', 'procMonitor')
   * @param {string} listType - path data type ('includePath', 'excludePath' or 'processKeyword')
   * @param {array} pathData - path data to be set
   */
  setPathData = (type, listType, pathData) => {
    let tempSettingsPath = {...this.state.settingsPath};
    let setPathData = pathData;

    if (pathData.length === 0) {
      if (listType === 'processKeyword') {
        setPathData = [{
          keyword: ''
        }];
      } else {
        setPathData = [{
          path: ''
        }];
      }
    }

    tempSettingsPath[type][listType] = setPathData;

    this.setState({
      settingsPath: tempSettingsPath
    });
  }
  /**
   * Display File Integrity settings content
   * @method
   * @param {string} type - path type ('fileIntegrity', 'procMonitor')
   * @param {object} val - settings object
   * @param {number} i - index of the settings array
   * @returns HTML DOM
   */
  editSettingsPathContent = (type, val, i) => {
    const {settingsPath, formValidation} = this.state;
    const data = {
      scanType: type,
      listType: val.type,
      formValidation
    };

    return (
      <div key={i} className='path-group'>
        <label>{val.headerText}</label>
        <MultiInput
          base={InputPath}
          inline={true}
          value={settingsPath[type][val.type]}
          props={data}
          onChange={this.setPathData.bind(this, type, val.type)} />
      </div>
    )
  }
  /**
   * Display view/edit settings content
   * @method
   * @param {object} val - settings object ('fileIntegrity' or 'procMonitor')
   * @param {number} i - index of the settings array
   * @returns HTML DOM
   */
  displaySettingsContent = (val, i) => {
    const {settingsActiveContent} = this.state;

    return (
      <div key={i} className='settings-group'>
        {settingsActiveContent === 'viewMode' &&
          this.getTriggerBtnInfo(val.type)
        }
        <header>{t('hmd-scan.scan-list.txt-' + val.type)} {t('txt-settings')}</header>
        <div className='settings-form'>
          {settingsActiveContent === 'viewMode' &&
            val.settings.map(this.viewSettingsPathContent.bind(this, val.type))
          }
          {settingsActiveContent === 'editMode' &&
            val.settings.map(this.editSettingsPathContent.bind(this, val.type))
          }
        </div>
      </div>
    )
  }
  /**
   * Get parsed list data
   * @method
   * @param {boolean} required - required field or not
   * @param {string} type - value type
   * @param {array.<object>} listData - list data
   * @returns parsed list or boolean
   */
  getSavedSettings = (required, type, listData) => {
    let tempFormValidation = {...this.state.formValidation};
    let dataList = [];
    let validate = true;

    _.forEach(listData, val => {
      if (val[type]) {
        dataList.push(val[type]);
      }
    })

    if (required) {
      if (listData[0].path) {
        tempFormValidation.fileIntegrity.includePath.valid = true;
      } else {
        tempFormValidation.fileIntegrity.includePath.valid = false;
        validate = false;
      }

      this.setState({
        formValidation: tempFormValidation
      });

      if (!validate) {
        return false;
      }
    }

    return dataList;
  }
  /**
   * Handle settings save confirm
   * @method
   */
  saveSettings = () => {
    const {baseUrl} = this.context;
    const {currentDeviceData} = this.props;
    const {settingsPath} = this.state;
    const url = `${baseUrl}/api/hmd/setting`;
    const requestData = {
      hostId: currentDeviceData.ipDeviceUUID,
      hmdSetting: [
        {
          _CommandName: SETTINGS.snapshot,
          _Parameters: {
            _IncludePathList: this.getSavedSettings(true, 'path', settingsPath.fileIntegrity.includePath),
            _ExcludePathList: this.getSavedSettings(false, 'path', settingsPath.fileIntegrity.excludePath),
            _ProcessKeyword: this.getSavedSettings(false, 'keyword', settingsPath.fileIntegrity.processKeyword),
            _IsRecursive: true
          }
        },
        {
          _CommandName: SETTINGS.procWhiteList,
          _Parameters: {
            _WhiteList: this.getSavedSettings(false, 'path', settingsPath.procMonitor.includePath)
          }
        }
      ]
    };

    if (!requestData.hmdSetting[0]._Parameters._IncludePathList) { //Invalid path data
      return;
    }

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'PATCH',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.ret === 0) {
        this.props.getHMDinfo('');
        this.toggleSettingsContent('save');
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Restore to default settings
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
        let includePath = '';
        let excludePath = '';
        let processKeyword = '';

        if (data._IncludePathList) {
          includePath = data._IncludePathList.split(',');
        }

        if (data._ExcludePathList) {
          excludePath = data._ExcludePathList.split(',');
        }

        if (data._ProcessKeyword) {
          processKeyword = data._ProcessKeyword.split(',');
        }

        if (includePath && excludePath && processKeyword) {
          this.setState({
            settingsPath: {
              fileIntegrity: {
                includePath: this.getParsedPathData('path', includePath),
                excludePath: this.getParsedPathData('path', excludePath),
                processKeyword: this.getParsedPathData('keyword', processKeyword)
              },
              procMonitor: {
                includePath: [{
                  path: ''
                }]
              }
            },
            formValidation: {
              fileIntegrity: {
                includePath: {
                  valid: true
                }
              }
            }
          });
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {currentDeviceData} = this.props;
    const {
      activeTab,
      buttonGroupList,
      dashboardInfo,
      hmdInfo,
      settingsActiveContent
    } = this.state;
    const SETTINGS_LIST = [
      {
        type: 'fileIntegrity',
        settings: [
          {
            type: 'includePath',
            headerText: t('hmd-scan.txt-includePath')
          },
          {
            type: 'excludePath',
            headerText: t('hmd-scan.txt-excludePath')
          },
          {
            type: 'processKeyword',
            headerText: t('hmd-scan.txt-processKeyword')
          }
        ]
      },
      {
        type: 'procMonitor',
        settings: [
          {
            type: 'includePath',
            headerText: t('hmd-scan.txt-includePath')
          }
        ]
      }
    ];

    return (
      <div className='scan-info'>
        <ToggleButtonGroup
          className='hmd-btns-group'
          value={activeTab}
          exclusive
          onChange={this.toggleScanType}>
          {buttonGroupList}
        </ToggleButtonGroup>

        <div className='info-content'>
          {activeTab === 'dashboard' &&
            <div className='dashboard-wrapper'>
              <div className='chart-group spider-chart'>
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

          {activeTab !== 'dashboard' && activeTab !== 'eventTracing' && activeTab !== 'edr' && activeTab !== 'settings' && !_.isEmpty(hmdInfo) &&
            <div>
              {this.getTriggerBtnInfo()}
              {this.getMainContent()}
            </div>
          }

          {activeTab === 'eventTracing' &&
            <div>
              {this.getTriggerBtnInfo()}
              {this.getEventTracingContent()}
            </div>
          }

          {activeTab === 'edr' &&
            <div className='edr'>
              {this.getTriggerBtnInfo()}
              <div className='edr-btn-group'>
                <div className='btn-group'>
                  <Button variant='contained' color='primary' className='btn' onClick={this.handleEdrBtn.bind(this, 'shutdownHost')}>{t('txt-shutdown')}</Button>
                  <div className='display-time'>
                    {currentDeviceData.safetyScanInfo.netcutResult.length > 0 &&
                      <div className='trigger'><span>{t('hmd-scan.txt-lastTriggerTime')}</span>: {helper.getFormattedDate(currentDeviceData.safetyScanInfo.netcutResult[0].latestCreateDttm, 'local') || NOT_AVAILABLE}</div>
                    }
                    {currentDeviceData.safetyScanInfo.netcutResult.length > 0 &&
                      <div className='execute'><span>{t('hmd-scan.txt-executeTime')}</span>: {helper.getFormattedDate(currentDeviceData.safetyScanInfo.netcutResult[0].taskResponseDttm, 'local') || NOT_AVAILABLE}</div>
                    }
                  </div>
                </div>
                <div className='btn-group'>
                  <Button variant='contained' color='primary' className='btn' onClick={this.handleEdrBtn.bind(this, 'logoffAllUsers')}>{t('txt-logOff')}</Button>
                  <div className='display-time'>
                    {currentDeviceData.safetyScanInfo.netcutResumeResult.length > 0 &&
                      <div className='trigger'><span>{t('hmd-scan.txt-lastTriggerTime')}</span>: {helper.getFormattedDate(currentDeviceData.safetyScanInfo.netcutResumeResult[0].latestCreateDttm, 'local') || NOT_AVAILABLE}</div>
                    }
                    {currentDeviceData.safetyScanInfo.netcutResumeResult.length > 0 &&
                      <div className='execute'><span>{t('hmd-scan.txt-executeTime')}</span>: {helper.getFormattedDate(currentDeviceData.safetyScanInfo.netcutResumeResult[0].taskResponseDttm, 'local') || NOT_AVAILABLE}</div>
                    }
                  </div>
                </div>
                <div className='btn-group'>
                  <Button variant='contained' color='primary' className='btn' onClick={this.handleEdrBtn.bind(this, 'netcut')}>{t('txt-disconnectedNet')}</Button>
                  <div className='display-time'>
                    {currentDeviceData.safetyScanInfo.shutdownHostResult.length > 0 &&
                      <div className='trigger'><span>{t('hmd-scan.txt-lastTriggerTime')}</span>: {helper.getFormattedDate(currentDeviceData.safetyScanInfo.shutdownHostResult[0].latestCreateDttm, 'local') || NOT_AVAILABLE}</div>
                    }
                    {currentDeviceData.safetyScanInfo.shutdownHostResult.length > 0 &&
                      <div className='execute'><span>{t('hmd-scan.txt-executeTime')}</span>: {helper.getFormattedDate(currentDeviceData.safetyScanInfo.shutdownHostResult[0].taskResponseDttm, 'local') || NOT_AVAILABLE}</div>
                    }
                  </div>
                </div>
                <div className='btn-group'>
                  <Button variant='contained' color='primary' className='btn' onClick={this.handleEdrBtn.bind(this, 'netcutResume')}>{t('txt-resume')}</Button>
                  <div className='display-time'>
                    {currentDeviceData.safetyScanInfo.shutdownHostResult.length > 0 &&
                      <div className='trigger'><span>{t('hmd-scan.txt-lastTriggerTime')}</span>: {helper.getFormattedDate(currentDeviceData.safetyScanInfo.shutdownHostResult[0].latestCreateDttm, 'local') || NOT_AVAILABLE}</div>
                    }
                    {currentDeviceData.safetyScanInfo.shutdownHostResult.length > 0 &&
                      <div className='execute'><span>{t('hmd-scan.txt-executeTime')}</span>: {helper.getFormattedDate(currentDeviceData.safetyScanInfo.shutdownHostResult[0].taskResponseDttm, 'local') || NOT_AVAILABLE}</div>
                    }
                  </div>
                </div>
              </div>
            </div>
          }

          {activeTab === 'settings' &&
            <div className='settings'>
              <Button variant='contained' color='primary' className='btn refresh' onClick={this.props.getHMDinfo.bind(this, '')} disabled={settingsActiveContent === 'editMode'}>{t('hmd-scan.txt-refresh')}</Button>
              {settingsActiveContent === 'viewMode' && currentDeviceData.isUploaded &&
                <Button variant='contained' color='primary' className='btn download' onClick={this.handleMalwareBtn.bind(this, 'download', '', currentDeviceData.ipDeviceUUID, 'host')}>{t(`hmd-scan.txt-downloadLogs`)}</Button>
              }
              {settingsActiveContent === 'viewMode' &&
                <Button variant='contained' color='primary' className='btn compress' onClick={this.handleMalwareBtn.bind(this, 'compress', 'getHmdLogs', currentDeviceData.ipDeviceUUID, 'host')}>{currentDeviceData.isUploaded ? t(`hmd-scan.txt-recompress-logs`) : t(`hmd-scan.txt-compress-logs`)}</Button>
              }
              {settingsActiveContent === 'viewMode' &&
                <Button variant='contained' color='primary' className='btn edit' onClick={this.toggleSettingsContent.bind(this, 'edit')}>{t('txt-edit')}</Button>
              }
              {settingsActiveContent === 'editMode' &&
                <div className='edit-btns'>
                  <Button variant='outlined' color='primary' className='standard btn cancel' onClick={this.toggleSettingsContent.bind(this, 'cancel')}>{t('txt-cancel')}</Button>
                  <Button variant='contained' color='primary' className='btn save' onClick={this.saveSettings}>{t('hmd-scan.txt-saveSettings')}</Button>
                  <Button variant='outlined' color='primary' className='standard btn restore-default' onClick={this.restoreDefaultSettings}>{t('hmd-scan.txt-restoreDefault')}</Button>
                </div>
              }
              <div id='settingsWrapper' className='settings-wrapper'>
                {SETTINGS_LIST.map(this.displaySettingsContent)}
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
  eventInfo: PropTypes.object.isRequired,
  toggleSelectionIR: PropTypes.func.isRequired,
  triggerTask: PropTypes.func.isRequired,
  triggerFilesTask: PropTypes.func.isRequired,
  addToWhiteList: PropTypes.func.isRequired,
  toggleYaraRule: PropTypes.func.isRequired,
  getHMDinfo: PropTypes.func.isRequired,
  loadEventTracing: PropTypes.func.isRequired,
  openHmdType: PropTypes.string,
  assessmentDatetime: PropTypes.object
};

export default withRouter(HMDscanInfo);