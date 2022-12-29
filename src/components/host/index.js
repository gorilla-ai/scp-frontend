import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import { MuiPickersUtilsProvider, KeyboardDateTimePicker, KeyboardDatePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import PictureAsPdfOutlinedIcon from '@material-ui/icons/PictureAsPdfOutlined'
import PopoverMaterial from '@material-ui/core/Popover'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'
import TreeItem from '@material-ui/lab/TreeItem'
import TreeView from '@material-ui/lab/TreeView'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'

import Gis from 'react-gis/build/src/components'

import {analyze} from 'vbda-ui/build/src/analyzer'
import {config as configLoader} from 'vbda-ui/build/src/loader'
import {downloadWithForm} from 'react-ui/build/src/utils/download'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import Popover from 'react-ui/build/src/components/popover'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import VbdaLA from 'vbda-ui/build/src/components/analysis/la'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import FileUpload from '../common/file-upload'
import HMDsettings from './hmd-settings'
import HostAnalysis from './host-analysis'
import HostFilter from './host-filter'
import ImportFile from './import-file'
import Pagination from '../common/pagination'
import QueryOpenSave from '../common/query-open-save'
import SafetyDetails from './safety-details'
import VansCharts from './vans-charts'
import VansDevice from './vans-device'
import VansPatch from './vans-patch'
import VansPatchDetails from './vans-patch-details'
import VansPatchGroup from './vans-patch-group'
import VansPieChart from './vans-pie-chart'
import YaraRule from '../common/yara-rule'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const IP_PATTERN = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
const FILTER_LIST = ['ip', 'mac', 'hostName', 'deviceType', 'system', 'safetyScanInfo', 'status', 'annotation', 'userName', 'groups', 'version', 'theLatestTaskResponseDttmArray', 'undoneTask'];
const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};
const HMD_STATUS_LIST = ['isNotHmd', 'isLatestVersion', 'isOldVersion', 'isNoVersion', 'isConnected', 'isDisconnected', {advanced: ['isOwnerNull', 'isAreaNull', 'isSeatNull']}];
const SCAN_RESULT = [
  {
    name: 'Yara Scan',
    result: 'yaraResult'
  },
  {
    name: 'Malware',
    result: 'scanFileResult'
  },
  {
    name: 'Detect GCB',
    result: 'gcbResult',
    pass: 'PassCnt'
  },
  {
    name: 'Import GCB',
    result: 'importGcbResult',
    pass: 'PassCnt'
  },
  {
    name: 'File Integrity',
    result: 'fileIntegrityResult'
  },
  {
    name: 'Event Tracing',
    result: 'eventTracingResult'
  },
  {
    name: 'Process Monitor',
    result: 'procMonitorResult'
  },
  {
    name: 'VANS',
    result: '_VansResult'
  }
];
const YARA_SCAN = {
  name: 'Yara Scan',
  cmds: 'compareIOC'
};
const HMD_TRIGGER = [
  {
    name: 'HMD Upgrade',
    type: 'hmdUpgrade'
  },
  YARA_SCAN,
  {
    name: 'Malware',
    cmds: 'scanFile'
  },
  {
    name: 'Detect GCB',
    cmds: 'gcbDetection'
  },
  {
    name: 'Import GCB',
    cmds: 'importGcb'
  },
  {
    name: 'File Integrity',
    cmds: 'getFileIntegrity',
    stop: 'FileIntegrityThread'
  },
  {
    name: 'Process Monitor',
    cmds: 'setProcessWhiteList',
    stop: 'ProcessMonitorThread'
  },
  {
    name: 'VANS',
    cmds: 'getVans'
  },
  {
    name: 'KBID',
    cmds: 'getKbidList'
  },
  {
    name: 'vansPatch',
    cmds: 'executePatch'
  },
  {
    name: 'vansPatchRecord',
    cmds: 'executePatchRecord'
  },
  {
    name: 'Event Tracing',
    cmds: 'EventTracingThread',
    stop: 'EventTracingThread'
  }
];
const SAFETY_SCAN_MENU = [
  {
    name: 'Malware',
    value: 'scanFile'
  },
  {
    name: 'GCB',
    value: 'gcbDetection'
  },
  {
    name: 'File Integrity',
    value: 'getFileIntegrity'
  },
  {
    name: 'VANS - CPE',
    value: 'getVansCpe'
  },
  {
    name: 'VANS - CVE',
    value: 'getVansCve'
  }
];
const HOST_SORT_LIST = [
  {
    name: 'ip',
    sort: 'asc'
  },
  {
    name: 'ip',
    sort: 'desc'
  },
  {
    name: 'mac',
    sort: 'asc'
  },
  {
    name: 'mac',
    sort: 'desc'
  },
  {
    name: 'hostName',
    sort: 'asc'
  },
  {
    name: 'hostName',
    sort: 'desc'
  },
  {
    name: 'system',
    sort: 'asc'
  },
  {
    name: 'system',
    sort: 'desc'
  },
  {
    name: 'theLatestTaskResponseDttmArray',
    sort: 'asc'
  },
  {
    name: 'theLatestTaskResponseDttmArray',
    sort: 'desc'
  }
];
const SAFETY_SCAN_LIST = [
  {
    name: 'Malware',
    value: 'scanFile'
  },
  {
    name: 'GCB',
    value: 'gcbDetection'
  },
  {
    name: 'File Integrity',
    value: 'getFileIntegrity'
  },
  {
    name: 'Event Tracing',
    value: 'getEventTraceResult'
  },
  {
    name: 'Process Monitor',
    value: 'getProcessMonitorResult'
  },
  {
    name: 'VANS - CPE',
    value: 'getVansCpe'
  },
  {
    name: 'VANS - CVE',
    value: 'getVansCve'
  }
];
const MODULE_TYPE = {
  device: 'device',
  scanFile: 'malware',
  gcbDetection: 'gcb',
  getFileIntegrity: 'fileIntegrity',
  getEventTraceResult: 'eventTracing',
  getProcessMonitorResult: 'processMonitor',
  getVansCpe: 'cpe',
  getVansCve: 'cve'
};
const VANS_DATA = ['vansCounts', 'vansHigh', 'vansMedium', 'vansLow', 'gcbCounts', 'malwareCounts'];
const MAPS_PRIVATE_DATA = {
  floorList: [],
  currentFloor: '',
  floorPlan: {
    treeData: {},
    currentAreaUUID: '',
    currentAreaName: ''
  },
  currentMap: '',
  currentBaseLayers: {},
  deviceSeatData: {}
};
const NOT_AVAILABLE = 'N/A';
const DEVICE_SEARCH = {
  ip: [{
    input: ''
  }],
  mac: [{
    input: ''
  }],
  hostName: [{
    input: ''
  }],
  deviceType: [{
    input: ''
  }],
  system: [{
    input: ''
  }],
  safetyScanInfo: [{
    input: ''
  }],
  status: [{
    input: {}
  }],
  annotation: [{
    input: ''
  }],
  userName: [{
    input: ''
  }],
  groups: [{
    input: ''
  }],
  version: [{
    condition: '=',
    input: ''
  }],
  theLatestTaskResponseDttmArray: {
    from: '',
    to: ''
  },
  undoneTask: {
    name: 'all',
    dttm: ''
  }
};
const DEVICE_SEARCH_LIST = {
  ip: [],
  mac: [],
  hostName: [],
  deviceType: [],
  system: [],
  safetyScanInfo: [],
  status: [],
  annotation: [],
  userName: [],
  groups: [],
  version: []
};
const FORM_VALIDATION = {
  frMotp: {
    valid: true
  }
};
const VANS_FORM_VALIDATION = {
  oid: {
    valid: true
  },
  unitName: {
    valid: true
  },
  apiKey: {
    valid: true
  },
  apiUrl: {
    valid: true
  }
};

let t = null;
let f = null;

/**
 * Host
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Host page
 */
class HostController extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      hmd_list: [],
      activeTab: 'hostList', //'hostList', 'deviceMap', 'safetyScan' or 'vansCharts'
      activeSafetyTab: 'list', //'list' or 'la'
      activeContent: 'hostContent', //'hostContent' or 'hmdSettings'
      account: {
        id: '',
        login: false,
        fields: [],
        logsLocale: '',
        departmentId: '',
        limitedRole: false
      },
      showFilter: false,
      openQueryOpen: false,
      saveQueryOpen: false,
      uploadHmdFileOpen: false,
      trackHostListOpen: false,
      uploadCpeFileOpen: false,
      importCsvOpen: false,
      activeTrackHostTab: 'date', //'date' or 'file'
      importFilterType: '', //'ip' or 'safetyScanInfo'
      safetyScanInfoScore: '',
      LAconfig: {},
      hmdFile: {},
      cpeFile: {},
      notifyEmailData: [],
      queryModalType: '',
      queryData: {
        id: '',
        name: '',
        inputName: '',
        displayId: '',
        displayName: '',
        list: [],
        query: '',
        formattedQuery: '',
        emailList: [],
        openFlag: false
      },
      popOverAnchor: null,
      activeFilter: '', //Same as FILTER_LIST
      showLeftNav: true,
      datetimeExport: helper.getSubstractDate(1, 'day', moment().local().format('YYYY-MM-DDTHH:mm:ss')),
      trackHostFile: null,
      assessmentDatetime: {
        from: '',
        to: ''
      },
      requestSentOpen: false,
      frMotpOpen: false,
      vansPatchOpen: false,
      vansPatchGroupOpen: false,
      vansPatchDetailsOpen: false,
      vansPatchSelectedOpen: false,
      yaraRuleOpen: false,
      hostAnalysisOpen: false,
      safetyDetailsOpen: false,
      hostDeviceOpen: false,
      reportNCCSTopen: false,
      vansPieChartOpen: false,
      showHMDadvancedOption: false,
      showScanStatusOption: {
        callBackFileIntegrity: false,
        callBackEventTracing: false,
        callBackPprocessMonitor: false
      },
      showSafetyTab: '', //'basicInfo' or 'availableHost'
      contextAnchor: null,
      menuType: '', //'hmdTriggerAll', 'safetyScan' or 'hmdDownload'
      vansDeviceStatusList: [],
      vansHmdStatusList: [],
      severityList: null,
      hmdStatusList: null,
      scanStatusList: null,
      departmentList: null,
      originalSystemList: [],
      systemList: null,
      netProxyTree: {},
      privateMaskedIPtree: {},
      hostCreateTime: '',
      leftNavData: [],
      privateIpData: {},
      currentHostModule: 'device',
      filterNav: {
        severitySelected: [],
        hmdStatusSelected: [],
        scanStatusSelected: [],
        departmentSelected: [],
        netProxyHostSelected: [],
        netProxyDeviceSelected: [],
        maskedIPSelected: []
      },
      deviceSearch: _.cloneDeep(DEVICE_SEARCH),
      deviceSearchList: _.cloneDeep(DEVICE_SEARCH_LIST),
      hmdSearch: {
        status: {},
        annotation: ''
      },
      subTabMenu: {
        table: t('host.txt-hostList'),
        statistics: t('host.txt-deviceMap')
      },
      activeVansPatch: {},
      hostInfo: {
        dataContent: null,
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      hostData: {},
      hostDeviceList: [],
      currentDeviceData: {},
      assignedDevice: '',
      hostSort: 'ip-asc',
      selectedTreeID: '',
      floorMapType: '',
      safetyScanData: {
        dataContent: null,
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      currentSafetyData: {},
      hmdEventsData: {},
      hmdLAdata: {},
      safetyScanType: '', //'scanFile', 'gcbDetection', 'getFileIntegrity', 'getEventTraceResult', 'getProcessMonitorResult', 'getVansCpe' or 'getVansCve'
      savedCpeData: {},
      fromSafetyPage: '',
      eventInfo: {
        dataFieldsArr: ['@timestamp', '_EventCode', 'message'],
        dataFields: {},
        dataContent: null,
        scrollCount: 1,
        hasMore: false
      },
      frMotpEnable: '',
      frMotp: '',
      vansPatch: {},
      openHmdType: '',
      vansChartsData: {},
      vansData: {},
      vansTableType: 'assessment', //'assessment' or 'hmd'
      vansPieChartData: {},
      showLoadingIcon: false,
      uploadedCPE: false,
      hmdVansConfigurations: {
        oid: '',
        unitName: '',
        apiKey: '',
        apiUrl: ''
      },
      limitedDepartment: [],
      patchInfo: {},
      patchSelectedItem: [],
      safetyScanInfoOperator: 'equal',
      formValidation: _.cloneDeep(FORM_VALIDATION),
      vansFormValidation: _.cloneDeep(VANS_FORM_VALIDATION),
      ..._.cloneDeep(MAPS_PRIVATE_DATA)
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, session, sessionRights} = this.context;
    let tempAccount = {...this.state.account};

    helper.getPrivilegesInfo(sessionRights, 'common', locale);
    helper.inactivityTime(baseUrl, locale);

    if (session.accountId) {
      tempAccount.id = session.accountId;
      tempAccount.login = true;
      tempAccount.departmentId = session.departmentId;

      if (!sessionRights.Module_Config) {
        tempAccount.limitedRole = true;
      }

      this.setState({
        account: tempAccount
      }, () => {
        //this.getLAconfig();
        this.getHmdlist();
        this.getSavedQuery();
        this.setLeftNavData();
        this.getFloorPlan();
        this.getVansStatus();
        this.getSystemList();
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state === 'hostContent') {
      this.getSystemList();
      this.toggleFilter('off');
      this.toggleContent('hostContent');
    }
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  /**
   * Get and set the Link Analysis config
   * @method
   */
  getLAconfig = () => {
    const {baseUrl} = this.context;

    helper.getLAconfig(baseUrl)
    .then(data => {
      if (!_.isEmpty(data)) {
        this.setState({
          LAconfig: configLoader.processAll(data)
        });
      }
      return null;
    });
  }
  /**
   * Get HMD list constant
   * @method
   */
  getHmdlist = () => {
    const hmd_list = [
      {
        name: 'Malware',
        value: 'isScanFile'
      },
      {
        name: 'VANS',
        value: 'isVans'
      },
      {
        name: 'GCB',
        value: 'isGCB'
      },
      {
        name: 'File Integrity',
        value: 'isFileIntegrity'
      },
      {
        name: 'Callback File Integrity',
        type: 'callBackFileIntegrity',
        value: [
          {
            name: 'Enabled',
            value: 'isSnapshot'
          },
          {
            name: 'Disabled',
            value: 'isNotSnapshot'
          }
        ]
      },
      {
        name: 'Event Tracing',
        value: 'isEventTracing'
      },
      {
        name: 'Callback Event Tracing',
        type: 'callBackEventTracing',
        value: [
          {
            name: 'Enabled',
            value: 'eventTracingEnable'
          },
          {
            name: 'Disabled',
            value: 'eventTracingDisable'
          }
        ]
      },
      {
        name: 'Process Monitor',
        value: 'isProcessMonitor'
      },
      {
        name: 'Callback Process Monitor',
        type: 'callBackPprocessMonitor',
        value: [
          {
            name: 'Enabled',
            value: 'isProcWhiteList'
          },
          {
            name: 'Disabled',
            value: 'isNotProcWhiteList'
          }
        ]
      },
      {
        name: 'Yara Scan',
        value: 'isScanProc'
      },
      {
        name: 'IR',
        value: 'isIR'
      },
      {
        name: t('host.txt-isScanFail'),
        value: 'isScanFail'
      }
    ];

    this.setState({
      hmd_list
    });
  }
  /**
   * Get and set the account saved query
   * @method
   */
  getSavedQuery = () => {
    const {baseUrl} = this.context;
    const {account, queryData} = this.state;

    helper.getSavedQuery(baseUrl, account, queryData, 'host')
    .then(data => {
      if (!_.isEmpty(data)) {
        this.setState({
          queryData: data
        });
      }
      return null;
    });
  }
  /**
   * Set Left nav data
   * @method
   */
  setLeftNavData = () => {
    const leftNavData = [
      {
        list: 'severityList',
        text: t('alert.txt-threatLevel'),
        selected: 'severitySelected'
      },
      {
        list: 'hmdStatusList',
        text: 'HMD ' + t('txt-status'),
        selected: 'hmdStatusSelected'
      },
      {
        list: 'scanStatusList',
        text: 'Scan ' + t('txt-status'),
        selected: 'scanStatusSelected'
      }
    ];

    this.setState({
      leftNavData
    });
  }
  /**
   * Get and set host sort list
   * @method
   * @returns HTML DOM
   */
  getHostSortList = () => {
    const hostSortList = _.map(HOST_SORT_LIST, (val, i) => {
      return <MenuItem key={i} value={val.name + '-' + val.sort}>{t('ipFields.' + val.name) + ' - ' + t('txt-' + val.sort)}</MenuItem>
    });
    return hostSortList;
  }
  /**
   * Get and set floor plan data
   * @method
   */
  getFloorPlan = () => {
    const {baseUrl} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/area/_tree`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        if (data.length > 0) {
          const floorPlanData = data[0];
          const floorPlan = {
            treeData: data,
            currentAreaUUID: floorPlanData.areaUUID,
            currentAreaName: floorPlanData.areaName
          };

          this.setState({
            floorPlan
          }, () => {
            this.getFloorList();
          });
        } else {
          this.getDepartmentTree();
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set floor list data
   * @method
   */
  getFloorList = () => {
    const {floorPlan} = this.state;
    let floorList = [];
    let floorListArr = [];

    _.forEach(floorPlan.treeData, val => {
      helper.floorPlanRecursive(val, obj => {
        floorList.push(
          <MenuItem key={obj.areaUUID} value={obj.areaUUID}>{obj.areaName}</MenuItem>
        );

        floorListArr.push({
          value: obj.areaUUID
        });
      });
    })

    const currentFloor = floorListArr[0].value; //Default to the top parent floor

    this.setState({
      floorList,
      currentFloor
    }, () => {
      this.getAreaData(currentFloor);
    });
  }
  /**
   * Get and set area related data
   * @method
   * @param {string | object} event - current floor or event object
   */
  getAreaData = (event) => {
    const {baseUrl, contextRoot} = this.context;
    const floorPlan = event.target ? event.target.value : event;

    this.ah.one({
      url: `${baseUrl}/api/area?uuid=${floorPlan}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const areaName = data.areaName;
        const areaUUID = data.areaUUID;
        let currentMap = '';

        if (data.picPath) {
          const picPath = `${baseUrl}${contextRoot}/api/area/_image?path=${data.picPath}`;
          const picWidth = data.picWidth;
          const picHeight = data.picHeight;

          currentMap = {
            label: areaName,
            images: [
              {
                id: areaUUID,
                url: picPath,
                size: {width: picWidth, height: picHeight}
              }
            ]
          };
        }

        const currentBaseLayers = {
          [floorPlan]: currentMap
        };

        this.setState({
          currentMap,
          currentBaseLayers,
          currentFloor: areaUUID
        }, () => {
          this.getDepartmentTree();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get vans status list
   * @method
   */
  getVansStatus = () => {
    const {baseUrl} = this.context;
    const {currentHostModule} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/annotation/statusList?module=${currentHostModule}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const list = _.map(data, val => {
          return {
            value: val,
            text: val
          };
        });

        if (currentHostModule === 'device') {
          this.setState({
            vansDeviceStatusList: list
          });
        } else {
          this.setState({
            vansHmdStatusList: list
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
   * Get system list
   * @method
   */
  getSystemList = () => {
    const {baseUrl} = this.context;
    const apiArr = [
      {
        url: `${baseUrl}/api/common/config?configId=hmd.server.os`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/common/config?configId=hmd.pc.os`,
        type: 'GET'
      }
    ];

    this.ah.all(apiArr)
    .then(data => {
      if (data) {
        let systemList = [];

        if (data[0] && data[0].value) {
          systemList.push({
            name: 'Server',
            checked: false,
            type: 'server',
            children: _.map(data[0].value, val => {
              return {
                name: val,
                checked: false
              }
            })
          });
        }

        if (data[1] && data[1].value) {
          systemList.push({
            name: 'PC',
            checked: false,
            type: 'pc',
            children: _.map(data[1].value, val => {
              return {
                name: val,
                checked: false
              }
            })
          });
        }

        systemList.push({
          name: t('host.txt-noSystemDetected'),
          checked: false,
          type: 'noSystem'
        });

        this.setState({
          originalSystemList: _.cloneDeep(systemList),
          systemList
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get department tree data
   * @method
   */
  getDepartmentTree = () => {
    const {baseUrl} = this.context;
    const {account} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/department/_tree`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        this.setState({
          departmentList: data
        }, () => {
          if (account.limitedRole) {
            if (account.departmentId) {
              this.setSelectedDepartment();
            } else {
              this.getHostData();              
            }
          } else {
            this.getHostData();
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
   * Get and set host info data
   * @method
   * @param {string} [options] - option for CSV or PDF export
   */
  getHostData = (options) => {
    const {baseUrl} = this.context;
    const {hmd_list, activeTab, deviceSearchList, assessmentDatetime, hostInfo, hostSort, currentFloor} = this.state;
    const hostSortArr = hostSort.split('-');
    let url = `${baseUrl}/api/v2/ipdevice/assessment/_search`;

    if (activeTab === 'hostList') {
      url += `?page=${hostInfo.currentPage}&pageSize=${hostInfo.pageSize}&orders=${hostSortArr[0]} ${hostSortArr[1]}`;
    }

    let requestData = {
      ...this.getHostSafetyRequestData()
    };

    if (activeTab === 'deviceMap' && currentFloor) {
      requestData.areaUUID = currentFloor;
    }

    if (options === 'csv' || options === 'pdf') { //For CSV or PDF export
      return requestData;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      let severityList = [];
      let hmdStatusList = [];
      let scanStatusList = [];
      let tempHostInfo = {...hostInfo};

      if (_.isEmpty(data)) { //Take care empty data case
        tempHostInfo.dataContent = [];
        tempHostInfo.totalCount = 0;

        _.forEach(SEVERITY_TYPE, val => {
          severityList.push({
            value: val,
            text: <span><i className={'fg fg-recode ' + val.toLowerCase()}></i>{val + ' (0)'}</span>
          });
        })

        _.forEach(HMD_STATUS_LIST, val => {
          if (typeof val === 'object') {
            const items = _.map(val.advanced, val => {
              return {
                text: t('host.txt-' + val) + ' (0)',
                value: val
              };
            });

            hmdStatusList.push({
              text: t('txt-advanced'),
              value: items
            });
          } else {
            hmdStatusList.push({
              text: t('host.txt-' + val) + ' (0)',
              value: val
            });
          }
        })

        _.forEach(hmd_list, val => {
          if (_.isArray(val.value)) {
            const items = _.map(val.value, val => {
              return {
                text: val.name + ' (0)',
                value: val.value
              };
            });

            scanStatusList.push({
              text: val.name,
              type: val.type,
              value: items
            });
          } else {
            scanStatusList.push({
              text: val.name + ' (0)',
              value: val.value
            });
          }
        });

        this.setState({
          severityList,
          hmdStatusList,
          scanStatusList,
          netProxyTree: {
            children: []
          },
          privateMaskedIPtree: {
            children: []
          },
          hostInfo: tempHostInfo
        });
        helper.showPopupMsg(t('txt-notFound'));
      } else {
        tempHostInfo.dataContent = data.rows;
        tempHostInfo.totalCount = data.count;

        if (data.netproxyHostAgg && data.netproxyHostAgg.length > 0) {
          this.getNetProxyTreeData(data.netproxyHostAgg);
        }

        if (!_.isEmpty(data.subnetAgg)) {
          this.getPrivateTreeData(data.subnetAgg);

          this.setState({
            privateIpData: data.subnetAgg
          });
        }

        _.forEach(SEVERITY_TYPE, val => { //Create formattedSeverityType object for input data based on severity
          _.forEach(data.severityAgg, (val2, key) => {
            if (val === key) {
              severityList.push({
                value: val,
                text: <span><i className={'fg fg-recode ' + val.toLowerCase()}></i>{val + ' (' + helper.numberWithCommas(val2) + ')'}</span>
              });
            }
          })
        })

        _.forEach(HMD_STATUS_LIST, val => {
          if (typeof val === 'object') {
            const items = _.map(val.advanced, val => {
              let text = t('host.txt-' + val);

              if (data.devInfoAgg[val]) {
                text += ' (' + helper.numberWithCommas(data.devInfoAgg[val]) + ')';
              }

              return {
                text,
                value: val
              };
            });

            hmdStatusList.push({
              text: t('txt-advanced'),
              value: items
            });
          } else {
            let text = t('host.txt-' + val);

            if (data.devInfoAgg[val]) {
              text += ' (' + helper.numberWithCommas(data.devInfoAgg[val]) + ')';
            }

            hmdStatusList.push({
              text,
              value: val
            });
          }
        })

        _.forEach(hmd_list, val => {
          if (_.isArray(val.value)) {
            const items = _.map(val.value, val => {
              let text = val.name;

              if (_.has(data.scanInfoAgg, val.value)) {
                text += ' (' + data.scanInfoAgg[val.value] + ')';
              }

              return {
                text,
                value: val.value
              };
            });

            scanStatusList.push({
              text: val.name,
              type: val.type,
              value: items
            });
          } else {
            let text = val.name;

            if (_.has(data.scanInfoAgg, val.value)) {
              text += ' (' + data.scanInfoAgg[val.value] + ')';
            }

            scanStatusList.push({
              text,
              value: val.value
            });
          }
        });

        if (!data.rows || data.rows.length === 0) {
          if (activeTab === 'hostList') {
            this.setState({
              severityList,
              hmdStatusList,
              scanStatusList,
              hostInfo: tempHostInfo
            });
            helper.showPopupMsg(t('txt-notFound'));
          } else if (activeTab === 'deviceMap') {
            this.setState({
              severityList,
              hmdStatusList,
              scanStatusList,
              showLoadingIcon: false
            });
          }
          return;
        }

        this.setState({
          assessmentDatetime: {
            from: data.assessmentStartDttm,
            to: data.assessmentEndDttm
          },
          severityList,
          hmdStatusList,
          scanStatusList,
          hostCreateTime: helper.getFormattedDate(data.assessmentCreateDttm, 'local'),
          hostInfo: tempHostInfo,
          showLoadingIcon: false
        }, () => {
          if (activeTab === 'deviceMap' && data.rows && data.rows.length > 0) {
            this.getDeviceSeatData();
          }
        });

        if (activeTab === 'hostList' && data.count === 0) {
          helper.showPopupMsg(t('txt-notFound'));
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Build device search list format
   * @method
   * @param {object} filterData - filter data to be set
   * @returns searchList array
   */
  getDeviceSearchList = (list) => {
    return _.map(list, val => ({ input: val }));
  }
  /**
   * Set filter data
   * @method
   * @param {object} filterData - filter data to be set
   */
  setFilterData = (filterData) => {
    let tempDeviceSearch =  _.cloneDeep(DEVICE_SEARCH);
    let tempDeviceSearchList = _.cloneDeep(DEVICE_SEARCH_LIST);

    Object.keys(filterData).map(val => {
      const type = val.replace('Array', '');

      if (type === 'annotationObj') {
        if (filterData[type].statusArray.length > 0) {
          tempDeviceSearch.status = this.getDeviceSearchList(filterData[type].statusArray);
          tempDeviceSearchList.status = filterData[type].statusArray;
        }

        if (filterData[type].annotationArray.length > 0) {
          tempDeviceSearch.annotation = this.getDeviceSearchList(filterData[type].annotationArray);
          tempDeviceSearchList.annotation = filterData[type].annotationArray;
        }
      } else {
        tempDeviceSearch[type] = this.getDeviceSearchList(filterData[val]);
        tempDeviceSearchList[type] = filterData[val];
      }
    });

    this.setState({
      deviceSearch: tempDeviceSearch,
      deviceSearchList: tempDeviceSearchList
    });
  }
  /**
   * Set query data
   * @method
   * @param {object} queryData - query data to be set
   */
  setQueryData = (queryData) => {
    this.setState({
      queryData
    });
  }
  /**
   * Set notify email data
   * @method
   * @param {object} queryData - query data to be set
   */
  setNotifyEmailData = (notifyEmailData) => {
    this.setState({
      notifyEmailData
    });
  }
  /**
   * Display query menu modal dialog
   * @method
   * @returns QueryOpenSave component
   */
  queryDialog = () => {
    const {activeTab, account, queryData, deviceSearchList, queryModalType, notifyEmailData} = this.state;

    return (
      <QueryOpenSave
        page='hostList'
        type={queryModalType}
        account={account}
        queryData={queryData}
        notifyEmailData={notifyEmailData}
        filterData={deviceSearchList}
        setFilterData={this.setFilterData}
        setQueryData={this.setQueryData}
        setNotifyEmailData={this.setNotifyEmailData}
        getSavedQuery={this.getSavedQuery}
        closeDialog={this.closeDialog} />
    )
  }
  /**
   * Close query modal dialog
   * @method
   */
  closeDialog = () => {
    this.setState({
      openQueryOpen: false,
      saveQueryOpen: false
    });
  }
  /**
   * Get and set vans charts data
   * @method
   */
  getVansChartsData = () => {
    const {baseUrl} = this.context;
    const {vansTableType} = this.state;
    const requestData = {
      ...this.getHostSafetyRequestData()
    };
    let url = `${baseUrl}/api/v2/`;

    if (vansTableType === 'assessment') {
      url += 'ipdevice/assessment/deptCountsTable';
    } else if (vansTableType === 'hmd') {
      url += 'hmd/hmdScanDistribution/deptCountsTable';
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.setState({
          vansChartsData: data,
          vansData: {}
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set Vans device data
   * @param {object} vansData - vans data
   * @method
   */
  setVansDeviceData = (vansData) => {
    this.setState({
      vansData
    });
  }
  /**
   * Clear Vans data
   * @method
   * @param {string} vansTableType - vans table type ('assessment' or 'hmd')
   */
  clearVansData = (vansTableType) => {
    this.setState({
      vansChartsData: {},
      vansData: {},
      vansTableType
    }, () => {
      this.getVansChartsData();
    });
  }
  /**
   * Get Host and Safety Scan request data
   * @method
   * @returns requestData object
   */
  getHostSafetyRequestData = () => {
    const {account, activeTab, filterNav, deviceSearch, deviceSearchList, hmdSearch, safetyScanType, safetyScanInfoOperator} = this.state;
    const responseDatetime = {
      from: deviceSearch.theLatestTaskResponseDttmArray.from,
      to: deviceSearch.theLatestTaskResponseDttmArray.to
    };
    let requestData = {};

    if (filterNav.severitySelected.length > 0) {
      requestData.severityLevel = filterNav.severitySelected;
    }

    if (filterNav.hmdStatusSelected.length > 0) {
      requestData.devInfo = filterNav.hmdStatusSelected;
    }

    if (filterNav.scanStatusSelected.length > 0) {
      requestData.scanInfo = filterNav.scanStatusSelected;
    }

    if (filterNav.departmentSelected.length > 0) {
      requestData.departmentArray = filterNav.departmentSelected;
    } else {
      if (account.limitedRole) {
        requestData.departmentArray =  ['emptyDepartmentId'];
      }
    }

    if (filterNav.netProxyHostSelected.length > 0) {
      requestData.netproxyHostIdArray = filterNav.netProxyHostSelected;
    }

    if (filterNav.netProxyDeviceSelected.length > 0) {
      requestData.hostIdArray = filterNav.netProxyDeviceSelected;
    }

    if (filterNav.maskedIPSelected.length > 0) {
      requestData.exactIps = filterNav.maskedIPSelected;
    }

    if (deviceSearchList.ip.length > 0) {
      requestData.ipArray = deviceSearchList.ip;
    }

    if (deviceSearchList.mac.length > 0) {
      requestData.macArray = deviceSearchList.mac;
    }

    if (deviceSearchList.hostName.length > 0) {
      requestData.hostNameArray = deviceSearchList.hostName;
    }

    if (deviceSearchList.deviceType.length > 0) {
      requestData.deviceTypeArray = deviceSearchList.deviceType;
    }

    if (deviceSearchList.system.length > 0) {
      requestData.systemArray = deviceSearchList.system;
    }

    if (deviceSearchList.safetyScanInfo.length > 0) {
      let safetyScanInfo = deviceSearchList.safetyScanInfo;

      if (safetyScanType === 'getFileIntegrity') {
        safetyScanInfo = _.map(deviceSearchList.safetyScanInfo, val => {
          return val.replace(/\\/g, '\\\\');
        });
      }

      requestData.safetyScanInfoArray = safetyScanInfo;
      requestData.safetyScanInfoOperator = safetyScanInfoOperator;
    }

    if (deviceSearchList.status.length > 0 || deviceSearchList.annotation.length > 0) {
      requestData.annotationObj = {
        statusArray: deviceSearchList.status,
        annotationArray: deviceSearchList.annotation
      };
    }

    if (activeTab === 'safetyScan' && (hmdSearch.status.value || hmdSearch.annotation)) {
      requestData.annotationObj = {
        disStatus: hmdSearch.status.value,
        disAnnotation: hmdSearch.annotation
      };
    }

    if (deviceSearchList.userName.length > 0) {
      requestData.userNameArray = deviceSearchList.userName;
    }

    if (deviceSearchList.groups.length > 0) {
      requestData.groupsArray = deviceSearchList.groups;
    }

    if (deviceSearchList.version.length > 0) {
      requestData.versionArray = _.map(deviceSearchList.version, val => {
        const condition = val.substr(0, 1);
        const version = val.substr(2);
        let mode = '';

        if (condition === '=') {
          mode = 'eq';
        } else if (condition === '>') {
          mode = 'gt';
        } else if (condition === '<') {
          mode = 'lt';
        }

        return {
          mode,
          version
        }
      });
    }

    if (responseDatetime.from && responseDatetime.to) {
      const searchTimeFrom =  moment(responseDatetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      const searchTimeTo = moment(responseDatetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      requestData.theLatestTaskResponseDttmArray = [searchTimeFrom, searchTimeTo];
    }

    if (deviceSearch.undoneTask.name !== 'all') {
      requestData.undoneTaskName = deviceSearch.undoneTask.name;
    }

    if (deviceSearch.undoneTask.dttm) {
      requestData.undoneDttm = moment(deviceSearch.undoneTask.dttm).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    }

    return requestData;
  }
  /**
   * Toggle safety content data
   * @method
   * @param {object} event - event object
   * @param {string} type - safety content ('list' or 'la')
   */
  toggleSfetyContent = (event, type) => {
    if (!type) {
      return;
    }

    this.setState({
      activeSafetyTab: type
    });
  }
  /**
   * Get and set safety scan data
   * @method
   * @param {string} [options] - option for vansStatus'
   */
  getSafetyScanData = (options) => {
    const {baseUrl} = this.context;
    const {LAconfig, deviceSearchList, safetyScanData, safetyScanType} = this.state;
    let url = '';
    let requestData = {
      ...this.getHostSafetyRequestData()
    };

    if (options === 'hitCVE') {
      url = `${baseUrl}/api/v2/hmd/hmdScanDistribution/_search`;
      requestData.hmdScanDistribution = {
        taskName: 'getVans',
        primaryKeyName: 'cpe23Uri',
        hitCVE: true
      };
    } else {
      url = `${baseUrl}/api/v2/hmd/hmdScanDistribution/_search?page=${safetyScanData.currentPage}&pageSize=${safetyScanData.pageSize}`;

      if (safetyScanType === 'getVansCpe') {
        requestData.hmdScanDistribution = {
          taskName: 'getVans',
          primaryKeyName: 'cpe23Uri'
        };
      } else if (safetyScanType === 'getVansCve') {
        requestData.hmdScanDistribution = {
          taskName: 'getVans',
          primaryKeyName: 'cveId'
        };
      } else {
        requestData.hmdScanDistribution = {
          taskName: safetyScanType
        };
      }
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempSafetyScanData = {...safetyScanData};
        let hmdEventsData = {};

        if (!data.hmdScanDistribution || data.hmdScanDistribution.length === 0) {
          tempSafetyScanData.dataContent = [];
          tempSafetyScanData.totalCount = 0;

          this.setState({
            safetyScanData: tempSafetyScanData
          });
          helper.showPopupMsg(t('txt-notFound'));
          return;
        }

        tempSafetyScanData.dataContent = data.hmdScanDistribution;
        tempSafetyScanData.totalCount = data.count;

        this.setState({
          safetyScanData: tempSafetyScanData
        });

        if (!_.isEmpty(LAconfig)) {
          if (data.linkLA && data.linkLA.length > 0) {
            _.forEach(data.linkLA, val => {
              hmdEventsData[val.id] = val;
            })
          }

          this.setState({
            hmdEventsData,
            hmdLAdata: analyze(hmdEventsData, LAconfig, {analyzeGis: false})
          });
        }

        if (options === 'vansStatus') {
          this.getVansStatus();
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Check if item is already in the selected list
   * @method
   * @param {string} type - checked item type ('severitySelected', 'hmdStatusSelected', 'scanStatusSelected', 'netProxyHostSelected', 'netProxyDeviceSelected', 'maskedIPSelected')
   * @param {string} val - checked item name
   * @returns boolean true/false
   */
  checkSelectedItem = (type, val) => {
    return _.includes(this.state.filterNav[type], val);
  }
  /**
   * Handle checkbox check/uncheck
   * @method
   * @param {string} type - checked item type ('severitySelected', 'hmdStatusSelected', 'scanStatusSelected')
   * @param {string} item - item for the arrow option
   * @param {object} event - event object
   */
  toggleCheckbox = (type, item, event) => {
    const checkedItem = item || event.target.name;
    let tempFilterNav = {...this.state.filterNav};

    if (event.target.checked) {
      tempFilterNav[type].push(checkedItem);
    } else {
      const index = tempFilterNav[type].indexOf(checkedItem);
      tempFilterNav[type].splice(index, 1);
    }

    this.setState({
      activeContent: 'hostContent',
      filterNav: tempFilterNav
    }, () => {
      this.handleSearchSubmit();
    });
  }
  /**
   * Toggle HMD arrow options
   * @method
   */
  toggleHMDadvancedOption = () => {
    this.setState({
      showHMDadvancedOption: !this.state.showHMDadvancedOption
    });
  }
  /**
   * Toggle HMD scan status arrow options
   * @method
   * @param {string} type - item type ('callBackFileIntegrity', 'callBackEventTracing' or 'callBackProcessMonitor')
   */
  toggleScanStatusOption = (type) => {
    const {showScanStatusOption} = this.state;
    let tempShowScanStatusOption = {...showScanStatusOption};
    tempShowScanStatusOption[type] = !showScanStatusOption[type];

    this.setState({
      showScanStatusOption: tempShowScanStatusOption
    });
  }
  /**
   * Show checkbox for option items
   * @method
   * @param {string} type - filter type ('hmdStatusSelected' or 'scanStatusSelected')
   * @param {object} val - individual filter data
   * @param {number} i - index of the filter data
   * @returns FormControlLabel component
   */
  showCheckbox = (type, val, i) => {
    return (
      <FormControlLabel
        key={i}
        label={val.text}
        control={
          <Checkbox
            className='checkbox-ui nav-box'
            name={val.value}
            checked={this.checkSelectedItem(type, val.value)}
            onChange={this.toggleCheckbox.bind(this, type, val.value)}
            color='primary' />
        } />
    )    
  }
  /**
   * Display checkbox for left nav
   * @method
   * @param {string} type - filter type ('severitySelected', 'hmdStatusSelected', 'scanStatusSelected')
   * @param {object} val - individual filter data
   * @param {number} i - index of the filter data
   * @returns FormControlLabel component
   */
  getCheckboxItem = (type, val, i) => {
    const {showHMDadvancedOption, showScanStatusOption} = this.state;

    if (val.text === t('txt-advanced')) {
      return (
        <div key={i}>
          <div className='toggle-arrow' onClick={this.toggleHMDadvancedOption}>
            <i className={`fg arrow fg-arrow-${showHMDadvancedOption ? 'bottom' : 'right'}`}></i>
            <span>{val.text}</span>
          </div>
          {showHMDadvancedOption &&
            <div className='option-items'>
              {val.value.map(this.showCheckbox.bind(this, type))}
            </div>
          }
        </div>
      )
    } else if (_.isArray(val.value)) {
      return (
        <div key={i}>
          <div className='toggle-arrow' onClick={this.toggleScanStatusOption.bind(this, val.type)}>
            <i className={`fg arrow fg-arrow-${showScanStatusOption[val.type] ? 'bottom' : 'right'}`}></i>
            <span>{val.text}</span>
          </div>
          {showScanStatusOption[val.type] &&
            <div className='option-items'>
              {val.value.map(this.showCheckbox.bind(this, type))}
            </div>
          }
        </div>
      )
    } else {
      return (
        <FormControlLabel
          key={i}
          label={val.text}
          control={
            <Checkbox
              className='checkbox-ui nav-box'
              name={val.value}
              checked={this.checkSelectedItem(type, val.value)}
              onChange={this.toggleCheckbox.bind(this, type, '')}
              color='primary' />
          } />
      )
    }
  }
  /**
   * Display Left nav data
   * @method
   * @param {object} val - individual left nav data
   * @param {number} i - index of the left nav data
   * @returns HTML DOM
   */
  showLeftNavItems = (val, i) => {
    return (
      <div key={i}>
        <label className={cx('header-text', {'hide': !this.state.showLeftNav})}>{val.text}</label>
        <div className='left-nav-group'>
          {!this.state[val.list] &&
            <span className='loading no-padding'><i className='fg fg-loading-2'></i></span>
          }
          {this.state[val.list] && this.state[val.list].length === 0 &&
            <span>{t('txt-notFound')}</span>
          }
          {this.state[val.list] && this.state[val.list].length > 0 &&
            this.state[val.list].map(this.getCheckboxItem.bind(this, val.selected))
          }
        </div>
      </div>
    )
  }
  /**
   * Get and set seat data with device
   * @method
   */
  getDeviceSeatData = () => {
    const {baseUrl, contextRoot} = this.context;
    const {currentFloor, hostInfo} = this.state;
    let deviceSeatData = {};
    let seatListArr = [];

    _.forEach(hostInfo.dataContent, val => {
      if (val.seatObj) {
        seatListArr.push({
          id: val.seatUUID,
          type: 'marker',
          xy: [val.seatObj.coordX, val.seatObj.coordY],
          icon: {
            iconUrl: `${contextRoot}/images/ic_person_device.png`,
            iconSize: [25, 25],
            iconAnchor: [12.5, 12.5]
          },
          label: val.seatObj.seatName,
          data: {
            name: val.seatObj.seatName
          }
        });
      }
    })

    deviceSeatData[currentFloor] = {
      data: seatListArr
    };

    this.setState({
      deviceSeatData
    });
  }
  /**
   * Handle seat selection for floor map
   * @method
   * @param {string} seatUUID - selected seat UUID
   */
  handleFloorMapClick = (seatUUID) => {
    const {baseUrl} = this.context;

    if (!seatUUID) {
      return;
    }

    this.ah.one({
      url: `${baseUrl}/api/v3/ipdevice/_search?&seatUUID=${seatUUID}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        if (data.rows.length > 0) {
          this.setState({
            hostDeviceOpen: true,
            hostDeviceList: data.rows,
            currentDeviceData: data.rows[0],
            assignedDevice: data.rows[0].ip
          });
        } else {
          helper.showPopupMsg(t('host.txt-deviceNotAvailable'));
        }
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle device dropdown change
   * @method
   * @param {object} event - event object
   */
  handleDeviceChange = (event) => {
    let currentDeviceData = {};

    _.forEach(this.state.hostDeviceList, val => {
      if (val.ip === event.target.value) {
        currentDeviceData = val;
        return false;
      }
    })

    this.setState({
      currentDeviceData,
      assignedDevice: event.target.value
    });
  }
  /**
   * Display Host device list content
   * @method
   * @returns HTML DOM
   */
  displayHostDeviceList = () => {
    const {hostDeviceList, currentDeviceData, assignedDevice} = this.state;
    const allAssignedDeviceList = _.map(hostDeviceList, (val, i) => {
      return <MenuItem key={i} value={val.ip}>{val.ip}</MenuItem>
    });
    const deviceInfo = {
      ip: currentDeviceData.ip,
      mac: currentDeviceData.mac,
      hostName: currentDeviceData.hostName,
      system: currentDeviceData.system
    };

    return (
      <div>
        <div className='seat-name'>{t('txt-seatName')}: <span>{hostDeviceList[0].seatObj.seatName}</span></div>
        <TextField
          id='allAssignedDevice'
          className='assigned-device'
          name='assignedDevice'
          select
          variant='outlined'
          fullWidth
          size='small'
          value={assignedDevice}
          onChange={this.handleDeviceChange}>
          {allAssignedDeviceList}
        </TextField>
        <div className='main'>{t('ipFields.ip')}: {deviceInfo.ip}</div>
        <div className='main'>{t('ipFields.mac')}: {deviceInfo.mac}</div>
        <div className='table-menu inventory active'>
          <i className='fg fg-eye' onClick={this.getIPdeviceInfo.bind(this, currentDeviceData, 'toggle')} title={t('network-inventory.txt-viewDevice')}></i>
        </div>
        <div className='main header'>{t('alert.txt-systemInfo')}</div>
        <div className='info'><span>{t('ipFields.hostName')}:</span>{deviceInfo.hostName || NOT_AVAILABLE}</div>
        <div className='info'><span>{t('ipFields.system')}:</span>{deviceInfo.system || NOT_AVAILABLE}</div>
      </div>
    )
  }
  /**
   * Show Host device list modal dialog
   * @method
   * @returns ModalDialog component
   */
  showHostDeviceList = () => {
    const actions = {
      cancel: {text: t('txt-close'), handler: this.closeHostDeviceList}
    };

    return (
      <ModalDialog
        id='configSeatDialog'
        className='modal-dialog'
        title={t('network-inventory.txt-seatDeviceInfo')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayHostDeviceList()}
      </ModalDialog>
    )
  }
  /**
   * Close Host device list modal dialog
   * @method
   */
  closeHostDeviceList = () => {
    this.setState({
      hostDeviceOpen: false,
      currentDeviceData: {},
      assignedDevice: ''
    });
  }
  /**
   * Toggle NCCST list modal dialog on/off
   * @method
   */
  toggleReportNCCST = () => {
    const {baseUrl} = this.context;
    const {reportNCCSTopen} = this.state;

    if (!reportNCCSTopen) {
      this.ah.one({
        url: `${baseUrl}/api/hmd/cpeFile/merge/_delete`,
        data: JSON.stringify({}),
        type: 'POST',
        contentType: 'text/plain'
      })
      .then(data => {
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }

    this.setState({
      reportNCCSTopen: !reportNCCSTopen,
      uploadedCPE: false,
      vansFormValidation: _.cloneDeep(VANS_FORM_VALIDATION)
    });

    this.handleCloseMenu();
  }
  /**
   * Set input data change
   * @method
   * @param {object} event - event object
   */
  handleVansConfigChange = (event) => {
    const {name, value} = event.target;
    let tempHmdVansConfigurations = {...this.state.hmdVansConfigurations};
    tempHmdVansConfigurations[name] = value;

    this.setState({
      hmdVansConfigurations: tempHmdVansConfigurations
    });
  }
  /**
   * Display Vans record data
   * @method
   * @param {string} val - vans record data
   * @param {number} i - index of the vans record data
   * @returns HTML DOM
   */
  showVansRecordRow = (val, i) => {
    return (
      <tr key={i}>
        <td><span>{val}</span></td>
      </tr>
    )
  }
  /**
   * Display Vans record data
   * @method
   * @param {string} key - vans record type ('Server' or 'PC')
   * @param {object} vansRecord - vans record data
   * @returns HTML DOM
   */
  showVansRecordTable = (key, vansRecord) => {
    return (
      <table key={key} className='c-table' style={{width: '100%', marginTop: '10px', marginBottom: '10px'}}>
        <tbody>
          <tr>
            <th>{key}</th>
          </tr>

          {vansRecord[key].length > 0 &&
            vansRecord[key].map(this.showVansRecordRow)
          }

          {vansRecord[key].length === 0 &&
            <tr><td><span>{NOT_AVAILABLE}</span></td></tr>
          }
        </tbody>
      </table>
    )
  }
  /**
   * Display Vans record content
   * @method
   * @returns HTML DOM
   */
  showVansRecordContent = (vansRecord) => {
    return (
      <div>
        {
          Object.keys(vansRecord).map(key =>
            this.showVansRecordTable(key, vansRecord)
          )
        }
      </div>
    )
  }
  /**
   * Get Vans Record
   * @method
   */
  getVansRecord = () => {
    const {baseUrl} = this.context;
    const {filterNav} = this.state;
    const requestData = {
      departmentArray: filterNav.departmentSelected
    };

    this.ah.one({
      url: `${baseUrl}/api/hmd/vans/report/record`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        PopupDialog.alert({
          id: 'modalWindowSmall',
          title: t('host.txt-vansRecord'),
          confirmText: t('txt-close'),
          display: this.showVansRecordContent(data)
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display NCCST form content
   * @method
   * @returns HTML DOM
   */
  displayNCCSTform = () => {
    const {uploadedCPE, hmdVansConfigurations, vansFormValidation} = this.state;

    return (
      <div className='vans-config-form'>
        <Button id='uploadMergedCpe' variant='outlined' color='primary' className='standard btn' onClick={this.toggleCpeUploadFile}>{t('host.txt-uploadMergedCpe')}</Button>
        {uploadedCPE &&
          <Button id='downloadMergedCpe' variant='outlined' color='primary' className='standard btn' onClick={this.cpeDownload}>{t('host.txt-downloadMergedCpe')}</Button>
        }
        <Button id='vansRecordCpe' variant='outlined' color='primary' className='standard btn' onClick={this.getVansRecord}>{t('host.txt-vansRecord')}</Button>
        <div className='group'>
          <TextField
            id='vansConfigOID'
            name='oid'
            label={t('host.txt-vansConfigOID')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!vansFormValidation.oid.valid}
            helperText={vansFormValidation.oid.valid ? '' : t('txt-required')}
            value={hmdVansConfigurations.oid}
            onChange={this.handleVansConfigChange} />
        </div>
        <div className='group'>
          <TextField
            id='vansConfigUnitName'
            name='unitName'
            label={t('host.txt-vansConfigUnitName')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!vansFormValidation.unitName.valid}
            helperText={vansFormValidation.unitName.valid ? '' : t('txt-required')}
            value={hmdVansConfigurations.unitName}
            onChange={this.handleVansConfigChange} />
        </div>
        <div className='group'>   
          <TextField
            id='vansConfigApiKey'
            name='apiKey'
            label={t('host.txt-vansConfigApiKey')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!vansFormValidation.apiKey.valid}
            helperText={vansFormValidation.apiKey.valid ? '' : t('txt-required')}
            value={hmdVansConfigurations.apiKey}
            onChange={this.handleVansConfigChange} />
        </div>
        <div className='group'>    
          <TextField
            id='vansConfigApiUrl'
            name='apiUrl'
            label={t('host.txt-vansConfigApiUrl')}
            variant='outlined'
            fullWidth
            size='small'
            required
            error={!vansFormValidation.apiUrl.valid}
            helperText={vansFormValidation.apiUrl.valid ? '' : t('txt-required')}
            value={hmdVansConfigurations.apiUrl}
            onChange={this.handleVansConfigChange} />
        </div>
      </div>
    )
  }
  /**
   * Show NCCST list modal dialog
   * @method
   * @returns ModalDialog component
   */
  showNCCSTlist = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleReportNCCST},
      confirm: {text: t('txt-confirm'), handler: this.confirmNCCSTlist}
    };

    return (
      <ModalDialog
        id='reportNCCSTdialog'
        className='modal-dialog'
        title={t('host.txt-report-nccst')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayNCCSTform()}
      </ModalDialog>
    )
  }
  /**
   * Handle NCCST list confirm
   * @method
   */
  confirmNCCSTlist = () => {
    const {baseUrl} = this.context;
    const {hmdVansConfigurations, vansFormValidation} = this.state;
    const url = `${baseUrl}/api/v2/hmd/vans/_report`;
    let tempVansFormValidation = {...vansFormValidation};
    let validate = true;

    if (hmdVansConfigurations.oid) {
      tempVansFormValidation.oid.valid = true;
    } else {
      tempVansFormValidation.oid.valid = false;
      validate = false;
    }

    if (hmdVansConfigurations.unitName) {
      tempVansFormValidation.unitName.valid = true;
    } else {
      tempVansFormValidation.unitName.valid = false;
      validate = false;
    }

    if (hmdVansConfigurations.apiKey) {
      tempVansFormValidation.apiKey.valid = true;
    } else {
      tempVansFormValidation.apiKey.valid = false;
      validate = false;
    }

    if (hmdVansConfigurations.apiUrl) {
      tempVansFormValidation.apiUrl.valid = true;
    } else {
      tempVansFormValidation.apiUrl.valid = false;
      validate = false;
    }

    this.setState({
      vansFormValidation: tempVansFormValidation
    });

    if (!validate) {
      return;
    }

    const requestData = {
      ...this.getHostSafetyRequestData(),
      hmdScanDistribution: {
        taskName: 'getVans',
        primaryKeyName: 'cpe23Uri'
      },
      hmdVansConfigurations: {
        oid: hmdVansConfigurations.oid,
        unit_name: hmdVansConfigurations.unitName,
        api_key: hmdVansConfigurations.apiKey,
        api_url: hmdVansConfigurations.apiUrl
      }
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t(`host.txt-nccstCode-${data.Code}`));

        this.toggleReportNCCST();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle Vans Pie Chart modal dialog on/off
   * @method
   * @param {array.<object>} data - vans data
   */
  togglePieChart = (data) => {
    this.setState({
      vansPieChartOpen: !this.state.vansPieChartOpen
    }, () => {
      if (this.state.vansPieChartOpen) {
        let vansPieChartData = {};

        _.forEach(VANS_DATA, val => {
          vansPieChartData[val] = [];
        })

        _.forEach(data, val => {
          _.forEach(vansPieChartData, (val2, key) => {
            vansPieChartData[key].push({
              key: val.name || val.hostName,
              doc_count: val[key]
            });
          })
        })

        this.setState({
          vansPieChartData
        });
      }
    });
  }
  /**
   * Get list of selected checkbox
   * @method
   * @param {bool} checked - checkbox on/off
   * @param {string} type - filterNav type
   * @param {array.<string>} list - list of selected items
   * @param {string} [id] - selected checkbox id
   * @returns array of selected list
   */
  getSelectedItems = (checked, type, list, id) => {
    const {filterNav} = this.state;

    if (checked) {
      return _.concat(filterNav[type], ...list, id);
    } else {
      return _.without(filterNav[type], ...list, id);
    }
  }
  /**
   * Handle net proxy host checkbox check/uncheck
   * @method
   * @param {string} id - selected host or device ID
   * @param {string} type - checkbox type ('netProxyDeviceSelected' or 'netProxyHostSelected')
   * @param {object} event - event object
   */
  toggleNetProxyCheckbox = (id, type, event) => {
    let tempFilterNav = {...this.state.filterNav};
    tempFilterNav[type] = this.getSelectedItems(event.target.checked, type, '', id);

    this.setState({
      filterNav: tempFilterNav
    }, () => {
      this.handleSearchSubmit();
    });
  }
  /**
   * Handle private IP checkbox check/uncheck
   * @method
   * @param {string} ip - selected IP
   * @param {string} type - IP type ('ip' or 'masked')
   * @param {object} event - event object
   */
  togglePrivateIpCheckbox = (ip, type, event) => {
    const {filterNav, privateIpData} = this.state;
    let tempFilterNav = {...filterNav};
    let selectedPrivateIP = [];

    if (type === 'masked') {
      const maskedChildList = _.map(privateIpData[ip].buckets, val => {
        return val.ip;
      });
      selectedPrivateIP = this.getSelectedItems(event.target.checked, 'maskedIPSelected', maskedChildList);
    } else if (type === 'ip') {
      selectedPrivateIP = this.getSelectedItems(event.target.checked, 'maskedIPSelected', '', ip);
    }

    tempFilterNav.maskedIPSelected = selectedPrivateIP;

    this.setState({
      activeContent: 'hostContent',
      filterNav: tempFilterNav
    }, () => {
      this.handleSearchSubmit();
    });
  }
  /**
   * Set the net proxy tree data
   * @method
   * @param {array.<object>} netProxyData - net proxy data
   * @returns tree data object
   */
  getNetProxyTreeData = (netProxyData) => {
    let treeObj = {
      id: 'All',
      children: []
    };

    _.forEach(netProxyData, val => {
      let tempChild = [];
      let treeProperty = {};

      if (val.devs && val.devs.length > 0) {
        _.forEach(val.devs, val2 => {
          tempChild.push({
            id: val2.ipdeviceuuid,
            label: <span><Checkbox color='primary' checked={this.checkSelectedItem('netProxyDeviceSelected', val2.ipdeviceuuid)} onChange={this.toggleNetProxyCheckbox.bind(this, val2.ipdeviceuuid, 'netProxyDeviceSelected')} />{val2.ip}</span>
          });
        })
      }

      treeProperty = {
        id: val.id,
        label: <span><Checkbox color='primary' checked={this.checkSelectedItem('netProxyHostSelected', val.id)} onChange={this.toggleNetProxyCheckbox.bind(this, val.id, 'netProxyHostSelected')} />{val.hostName} ({helper.numberWithCommas(val.devs.length)})</span>
      };

      if (tempChild.length > 0) {
        treeProperty.children = tempChild;
      }

      treeObj.children.push(treeProperty);
    })

    treeObj.label = t('txt-all') + ' (' + helper.numberWithCommas(netProxyData.length) + ')';

    this.setState({
      netProxyTree: treeObj
    });
  }
  /**
   * Set the alert private tree data
   * @method
   * @param {array.<object>} privateIpData - private masked IP data
   * @returns tree data object
   */
  getPrivateTreeData = (privateIpData) => {
    let treeObj = {
      id: 'All',
      children: []
    };

    _.keys(privateIpData)
    .forEach(key => {
      let tempChild = [];
      let treeProperty = {};

      if (key && key !== 'doc_count') {
        if (privateIpData[key].buckets.length > 0) {
          _.forEach(privateIpData[key].buckets, val => {
            if (val.ip) {
              let nodeClass = '';

              if (val._severity_) {
                nodeClass = 'fg fg-recode ' + val._severity_.toLowerCase();
              }

              tempChild.push({
                id: val.ip,
                label: <span><Checkbox color='primary' checked={this.checkSelectedItem('maskedIPSelected', val.ip)} onChange={this.togglePrivateIpCheckbox.bind(this, val.ip, 'ip')} /><i className={nodeClass} />{val.ip}</span>
              });
            }
          })
        }

        let nodeClass = '';

        if (privateIpData[key]._severity_) {
          nodeClass = 'fg fg-recode ' + privateIpData[key]._severity_.toLowerCase();
        }

        treeProperty = {
          id: key,
          label: <span><Checkbox color='primary' onChange={this.togglePrivateIpCheckbox.bind(this, key, 'masked')} /><i className={nodeClass} />{key} ({helper.numberWithCommas(privateIpData[key].doc_count)})</span>
        };

        if (tempChild.length > 0) {
          treeProperty.children = tempChild;
        }

        treeObj.children.push(treeProperty);
      }
    })

    treeObj.label = t('txt-all') + ' (' + helper.numberWithCommas(privateIpData.doc_count) + ')';

    this.setState({
      privateMaskedIPtree: treeObj
    });
  }
  /**
   * Toggle (show/hide) the left menu
   * @method
   */
  toggleLeftNav = () => {
    this.setState({
      showLeftNav: !this.state.showLeftNav
    });
  }
  /**
   * Toggle filter content on/off
   * @method
   * @param {string} [options] - options for turning off filter
   */
  toggleFilter = (options) => {
    if (options === 'off') {
      this.setState({
        showFilter: false
      });
      return;
    }

    this.setState({
      showFilter: !this.state.showFilter
    });
  }
  /**
   * Handle Host sort change
   * @method
   * @param {object} event - event object
   */
  handleHostSortChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    }, () => {
      this.getHostData();
    });
  }
  /**
   * Handle filter search submit
   * @method
   */
  handleSearchSubmit = () => {
    const {activeTab, deviceSearch, hostInfo, safetyScanData, safetyScanInfoOperator} = this.state;

    if (activeTab === 'hostList') {
      const responseDatetime = {
        from: deviceSearch.theLatestTaskResponseDttmArray.from,
        to: deviceSearch.theLatestTaskResponseDttmArray.to
      };

      if (responseDatetime.from && responseDatetime.to) {
        if (moment(responseDatetime.to).isBefore(moment(responseDatetime.from))) {
          helper.showPopupMsg(t('txt-timeRangeError'), t('txt-error'));
          return;
        }
      }

      let tempHostInfo = {...hostInfo};
      tempHostInfo.dataContent = null;
      tempHostInfo.totalCount = 0;
      tempHostInfo.currentPage = 1;

      this.setState({
        hostInfo: tempHostInfo
      }, () => {
        this.getHostData();
      });
    } else if (activeTab === 'deviceMap') {
      this.setState({
        showLoadingIcon: true,
      });
      this.getHostData();
    } else if (activeTab === 'safetyScan') {
      let tempSafetyScanData = {...safetyScanData};
      tempSafetyScanData.dataContent = null;
      tempSafetyScanData.totalCount = 0;
      tempSafetyScanData.currentPage = 1;

      this.setState({
        safetyScanData: tempSafetyScanData,
        hmdEventsData: {},
        hmdLAdata: {}
      }, () => {
        this.getHostData();
        this.getSafetyScanData();
      });
    } else if (activeTab === 'vansCharts') {
      this.getVansChartsData();
    }
  }
  /**
   * Handle content tab change
   * @method
   * @param {object} event - event object
   * @param {string} newTab - content type ('hostList', 'deviceMap', 'safetyScan' or 'vansCharts')
   */
  handleSubTabChange = (event, newTab) => {
    if (newTab === 'deviceMap') {
      this.setState({
        deviceSeatData: {},
        showLoadingIcon: true
      });
    }

    this.setState({
      activeTab: newTab
    }, () => {
      if (newTab === 'safetyScan') {
        let tempSafetyScanData = {...this.state.safetyScanData};
        tempSafetyScanData.dataContent = [];

        this.setState({
          currentHostModule: 'malware',
          safetyScanData: tempSafetyScanData
        });
      } else if (newTab === 'vansCharts') {
        this.getVansChartsData();
      } else {
        this.getHostData();
      }
    });
  }
  /**
   * Handle HMD search value change
   * @method
   * @param {object} event - event object
   */
  handleHmdSearch = (event) => {
    let tempHmdSearch = {...this.state.hmdSearch};
    tempHmdSearch[event.target.name] = event.target.value.trim();

    this.setState({
      hmdSearch: tempHmdSearch
    });
  }
  /**
   * Display status list
   * @method
   * @param {object} params - parameters for Autocomplete
   * @returns TextField component
   */
  renderStatusList = (params) => {
    return (
      <TextField
        {...params}
        label={t('host.txt-status')}
        variant='outlined'
        size='small' />
    )
  }
  /**
   * Handle status combo box change
   * @method
   * @param {object} event - event object
   * @param {object} value - selected info
   */
  handleComboBoxChange = (event, value) => {
    const {vansHmdStatusList, hmdSearch} = this.state;

    if (value && value.value) {
      const selectedStatusIndex = _.findIndex(vansHmdStatusList, { 'value': value.value });
      let tempHmdSearch = {...hmdSearch};
      tempHmdSearch.status = vansHmdStatusList[selectedStatusIndex];

      this.setState({
        hmdSearch: tempHmdSearch
      });
    }
  }
  /**
   * Handle filter click
   * @method
   * @param {string} activeFilter - active filter type
   * @param {object} event - event object
   */
  handleFilterclick = (activeFilter, event) => {
    this.setState({
      popOverAnchor: event.currentTarget,
      activeFilter
    });
  }
  /**
   * Handle popover close
   * @method
   */
  handlePopoverClose = () => {
    this.setState({
      popOverAnchor: null
    });
  }
  /**
   * Set device filter data
   * @method
   * @param {string} type - filter type
   * @param {array.<string>} data - filter data
   */
  setDeviceSearch = (type, data) => {
    const {deviceSearch, deviceSearchList} = this.state;
    let tempDeviceSearch = {...deviceSearch};
    let tempDeviceSearchList = {...deviceSearchList};
    let dataList = [];
    tempDeviceSearch[type] = data;

    _.forEach(data, val => {
      let value = val.input;

      if (value) {
        if (type === 'status') {
          value = val.input.text;
        } else if (type === 'version') {
          value = val.condition + ' ' + value;
        }

        dataList.push(value);
      }
    });
    tempDeviceSearchList[type] = dataList;

    this.setState({
      deviceSearch: tempDeviceSearch,
      deviceSearchList: tempDeviceSearchList
    });
  }
  /**
   * Set device filter data for datetime picker
   * @method
   * @param {string} type - date type ('from' or 'to')
   * @param {object} newDatetime - new datetime object
   */
  setDateTimePickerChange = (type, newDatetime) => {
    let tempDeviceSearch = {...this.state.deviceSearch};
    tempDeviceSearch.theLatestTaskResponseDttmArray[type] = newDatetime;

    this.setState({
      deviceSearch: tempDeviceSearch
    });
  }
  /**
   * Display filter form
   * @method
   * @param {string} val - filter data
   * @param {number} i - index of the filter data
   * @returns HTML DOM
   */
  showFilterForm = (val, i) => {
    const {deviceSearch, deviceSearchList} = this.state;
    const mapping = {
      all: t('txt-all'),
      scanFile: 'Malware',
      gcbDetection: 'Detect GCB',
      getVans: 'Vans',
      upgradeHmd: 'HMD Upgrade',
      getSystemInfo: 'System Info'
    };
    let value = '';

    if (val === 'theLatestTaskResponseDttmArray') {
      if (deviceSearch.theLatestTaskResponseDttmArray.from) {
        value = moment(deviceSearch.theLatestTaskResponseDttmArray.from).local().format('YYYY-MM-DD HH:mm')  + ' ~ ';
      }

      if (deviceSearch.theLatestTaskResponseDttmArray.to) {
        value += moment(deviceSearch.theLatestTaskResponseDttmArray.to).local().format('YYYY-MM-DD HH:mm');
      }
    } else if (val === 'undoneTask') {
      const name = mapping[deviceSearch.undoneTask.name];
      const dttm = deviceSearch.undoneTask.dttm ? moment(deviceSearch.undoneTask.dttm).local().format('YYYY-MM-DD HH:mm') : '';
      value = name;

      if (dttm) {
        value += ', ' + dttm;
      }
    } else {
      value = deviceSearchList[val].join(', ');
    }

    return (
      <div key={i} className='group'>
        <TextField
          name={val}
          label={t('ipFields.' + val)}
          variant='outlined'
          fullWidth
          size='small'
          value={value}
          onClick={this.handleFilterclick.bind(this, val)}
          InputProps={{
            readOnly: true
          }} />
      </div>
    )
  }
  /**
   * Toggle query menu on/off
   * @method
   * @param {string} type - type of query menu ('open' or 'save')
   */
  openQuery = (type) => {
    const {queryData} = this.state;
    let tempQueryData = {...queryData};

    if (type === 'open') {
      if (queryData.list.length > 0) {
        tempQueryData.id = queryData.list[0].id;
        tempQueryData.name = queryData.list[0].name;
        tempQueryData.query = queryData.list[0].queryText;
        tempQueryData.emailList = queryData.list[0].emailList;
      }

      this.setState({
        openQueryOpen: true,
        queryData: tempQueryData
      });
    } else if (type === 'save') {
      tempQueryData.inputName = '';
      tempQueryData.openFlag = false;

      this.setState({
        saveQueryOpen: true,
        queryData: tempQueryData
      });
    }

    this.setState({
      queryModalType: type
    });
  }
  /**
   * Handle Undone task name change
   * @method
   * @param {string} type - form type ('name' or 'dttm')
   * @param {object} obj - data object
   */
  handleUndoneTaskChange = (type, obj) => {
    let tempDeviceSearch = {...this.state.deviceSearch};
    tempDeviceSearch.undoneTask[type] = type === 'name' ? obj.target.value : obj;

    this.setState({
      deviceSearch: tempDeviceSearch
    });
  }
  /**
   * Handle Safety Scan operator change
   * @method
   * @param {object} event - event object
   */
  handleScanOperatorChange = (event) => {
    this.setState({
      safetyScanInfoOperator: event.target.value
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {locale} = this.context;
    const {
      queryData,
      popOverAnchor,
      activeFilter,
      showFilter,
      systemList,
      vansDeviceStatusList,
      deviceSearch,
      safetyScanInfoOperator
    } = this.state;
    const data = {
      activeFilter,
      vansDeviceStatusList
    };
    const filterTitle = queryData.displayName || t('txt-filter');
    let defaultItemValue = {};
    let dateLocale = locale;

    if (activeFilter === 'status') {
      defaultItemValue = {
        input: {}
      };
    } else if (activeFilter === 'version') {
      defaultItemValue = {
        condition: '=',
        input: ''
      };
    } else {
      defaultItemValue = {
        input: ''
      };
    }

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i id='queryCloseBtn' className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div id='queryHeaderText' className='header-text'>{filterTitle}</div>
        <div className='button-group open-query'>
          <Button id='openQueryBtn' variant='outlined' color='primary' className='open-query' onClick={this.openQuery.bind(this, 'open')}>{t('events.connections.txt-openQuery')}</Button>
          <Button id='saveQueryBtn' variant='outlined' color='primary' className='save-query' onClick={this.openQuery.bind(this, 'save')}>{t('events.connections.txt-saveQuery')}</Button>
        </div>

        <div className='filter-section config host'>
          <PopoverMaterial
            id='hostFilterPopover'
            open={Boolean(popOverAnchor)}
            anchorEl={popOverAnchor}
            onClose={this.handlePopoverClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}>
            <div className='content'>
              {activeFilter === 'system' &&
                <TreeView
                  className='tree-view'
                  defaultCollapseIcon={<ExpandMoreIcon />}
                  defaultExpandIcon={<ChevronRightIcon />}>
                  {systemList.map(this.getSystemTreeItem)}
                </TreeView>
              }
              {activeFilter === 'theLatestTaskResponseDttmArray' &&
                <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
                  <KeyboardDateTimePicker
                    id='hostFilterDateTimePickerFrom'
                    className='date-time-picker'
                    inputVariant='outlined'
                    variant='inline'
                    format='YYYY-MM-DD HH:mm'
                    invalidDateMessage={t('txt-invalidDateMessage')}
                    maxDateMessage={t('txt-maxDateMessage')}
                    minDateMessage={t('txt-minDateMessage')}
                    ampm={false}
                    value={deviceSearch[activeFilter].from}
                    onChange={this.setDateTimePickerChange.bind(this, 'from')} />
                  <div className='between'>~</div>
                  <KeyboardDateTimePicker
                    id='hostFilterDateTimePickerTo'
                    className='date-time-picker'
                    inputVariant='outlined'
                    variant='inline'
                    format='YYYY-MM-DD HH:mm'
                    invalidDateMessage={t('txt-invalidDateMessage')}
                    maxDateMessage={t('txt-maxDateMessage')}
                    minDateMessage={t('txt-minDateMessage')}
                    ampm={false}
                    value={deviceSearch[activeFilter].to}
                    onChange={this.setDateTimePickerChange.bind(this, 'to')} />
                </MuiPickersUtilsProvider>
              }
              {activeFilter === 'undoneTask' &&
                <React.Fragment>
                  <TextField
                    id='hostFilterUndonetaskName'
                    className='undone-task'
                    name='undoneTaskName'
                    select
                    variant='outlined'
                    fullWidth
                    size='small'
                    value={deviceSearch.undoneTask.name}
                    onChange={this.handleUndoneTaskChange.bind(this, 'name')}>
                    <MenuItem value='all'>{t('txt-all')}</MenuItem>
                    <MenuItem value='scanFile'>Malware</MenuItem>
                    <MenuItem value='gcbDetection'>Detect GCB</MenuItem>
                    <MenuItem value='getVans'>Vans</MenuItem>
                    <MenuItem value='upgradeHmd'>HMD Upgrade</MenuItem>
                    <MenuItem value='getSystemInfo'>System Info</MenuItem>
                  </TextField>
                  <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
                    <KeyboardDateTimePicker
                      id='hostFilterUndonetaskDttm'
                      className='date-time-picker'
                      inputVariant='outlined'
                      variant='inline'
                      format='YYYY-MM-DD HH:mm'
                      invalidDateMessage={t('txt-invalidDateMessage')}
                      maxDateMessage={t('txt-maxDateMessage')}
                      minDateMessage={t('txt-minDateMessage')}
                      ampm={false}
                      value={deviceSearch.undoneTask.dttm}
                      onChange={this.handleUndoneTaskChange.bind(this, 'dttm')} />
                  </MuiPickersUtilsProvider>
                </React.Fragment>
              }
              {activeFilter !== 'system' && activeFilter !== 'undoneTask' && activeFilter !== 'theLatestTaskResponseDttmArray' &&
                <React.Fragment>
                  <MultiInput
                    base={HostFilter}
                    defaultItemValue={defaultItemValue}
                    value={deviceSearch[activeFilter]}
                    props={data}
                    onChange={this.setDeviceSearch.bind(this, activeFilter)} />
                  {activeFilter === 'ip' &&
                    <Button variant='contained' color='primary' className='filter' onClick={this.toggleCsvImport.bind(this, 'ip')}>{t('network-inventory.txt-batchUpload')}</Button>
                  }
                  {activeFilter === 'safetyScanInfo' &&
                    <div className='safety-scan-filter'>
                      <TextField
                        className='scan-operator'
                        select
                        variant='outlined'
                        fullWidth
                        size='small'
                        value={safetyScanInfoOperator}
                        onChange={this.handleScanOperatorChange}>
                        <MenuItem value='equal'>Equal</MenuItem>
                        <MenuItem value='like'>Like</MenuItem>
                      </TextField>
                      <Button variant='contained' color='primary' className='filter' onClick={this.toggleCsvImport.bind(this, 'safetyScanInfo')}>{t('network-inventory.txt-batchUpload')}</Button>
                    </div>
                  }
                </React.Fragment>
              }
            </div>
          </PopoverMaterial>
          {FILTER_LIST.map(this.showFilterForm)}
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.handleSearchSubmit}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /**
   * Clear input value for main filter
   * @method
   */
  clearFilter = () => {
    let tempQueryData = {...this.state.queryData};
    tempQueryData.displayId = '';
    tempQueryData.displayName = '';
    tempQueryData.openFlag = false;

    this.setState({
      importFilterType: '',
      queryData: tempQueryData,
      systemList: _.cloneDeep(this.state.originalSystemList),
      deviceSearch: _.cloneDeep(DEVICE_SEARCH),
      deviceSearchList: _.cloneDeep(DEVICE_SEARCH_LIST),
      safetyScanInfoOperator: 'equal'
    });
  }
  /**
   * Clear input value for HMD filter
   * @method
   */
  clearHmdFilter = () => {
    this.setState({
      hmdSearch: {
        status: {},
        annotation: ''
      }
    });
  }
  /**
   * Handle Severity block click
   * @method
   * @param {boolean} hmd - HMD or not (true or false)
   * @param {object} val - individual Safety Scan data
   * @param {object} safetyScanInfo - Safety Scan data
   * @returns HTML DOM
   */
  handleSeverityClick = (hmd, val, safetyScanInfo) => {
    let name = val.severity_type_name;

    if (hmd) {
      if (name === 'gcbResult' || name === 'importGcbResult') {
        name = 'importGcbAndGcbDetectionResult';
      }

      this.getIPdeviceInfo(safetyScanInfo, 'toggle', name);
    } else {
      this.redirectNewPage(safetyScanInfo.ip, this.getReadableName(name));
    }
  }
  /**
   * Redirect to Threats page
   * @method
   * @param {string} ip - source IP for the Host
   * @param {string} name - severity type name
   */
  redirectNewPage = (ip, name) => {
    const {baseUrl, contextRoot, language} = this.context;
    const {assessmentDatetime} = this.state;
    const dateTime = {
      from: helper.getFormattedDate(assessmentDatetime.from, 'local'),
      to: helper.getFormattedDate(assessmentDatetime.to, 'local')
    };
    const linkUrl = `${baseUrl}${contextRoot}/threats?from=${dateTime.from}&to=${dateTime.to}&sourceIP=${ip}&severityName=${name}&page=host&lng=${language}`;

    window.open(linkUrl, '_blank');
  }
  /**
   * Format HMD readable name
   * @method
   * @param {string} name - HMD scan name
   * @returns readable name
   */
  getReadableName = (name) => {
    let formattedName = name;

    if (name === 'procWhiteListResult') {
      formattedName = 'Process Monitor';
    } else if (name === 'kbidResult') {
      formattedName = 'KBID';
    }

    return formattedName;
  }
  /**
   * Display Safety Scan list
   * @method
   * @param {object} safetyScanInfo - Safety Scan data
   * @param {object} val - individual Safety Scan data
   * @param {number} i - index of the Safety Scan data
   * @returns HTML DOM
   */
  getSafetyScanInfo = (safetyScanInfo, val, i) => {
    const scanResult = _.map(SCAN_RESULT, val => {
      return val.result;
    });
    let severityTypeName = this.getReadableName(val.severity_type_name);
    let hmd = false;
    let spanStyle = '';
    let displayTooltip = '';
    let displayCount = val.doc_count >= 0 ? val.doc_count : t('txt-unknown');
    let text = t('hmd-scan.txt-suspiciousFileCount');
    let title = '';
    let status = '';

    if (_.includes(scanResult, val.severity_type_name)) {
      _.forEach(SCAN_RESULT, val2 => {
        if (val2.result === val.severity_type_name) {
          severityTypeName = val2.name;
          hmd = true;
          return false;
        }
      })
    }

    if (severityTypeName === '_ExecutePatchResult') {
      severityTypeName = 'VANS Patch'
      hmd = true;
    }

    displayTooltip = severityTypeName + ' ';

    if (val.severity) {
      const color = val.doc_count === 0 ? '#333' : '#fff';
      const backgroundColor = val.doc_count === 0 ? '#d9d9d9' : ALERT_LEVEL_COLORS[val.severity];
      spanStyle = {color, backgroundColor, fontWeight: 'bold'};
    } else {
      const color = val.doc_count === 0 ? '#70c97e' : '#e15b6b';
      spanStyle = {color, border: '1px solid ' + color, fontWeight: 'bold'};
    } 

    if (val.severity_type_name === 'gcbResult') {
      if (val.PassCnt >= 0 || val.TotalCnt >= 0) {
        displayCount = helper.numberWithCommas(val.PassCnt) + '/' + helper.numberWithCommas(val.TotalCnt);
      }

      text = t('hmd-scan.txt-passCount') + '/' + t('hmd-scan.txt-totalItem');
    } else if (val.severity_type_name === 'fileIntegrityResult') {
      text = t('hmd-scan.txt-modifiedFileCount');
    } else if (val.severity_type_name === 'eventTracingResult') {
      text = t('hmd-scan.txt-eventsLogCount');
    } else if (val.severity_type_name === '_VansResult') {
      text = t('hmd-scan.txt-VulnerabilityCount');
    }

    displayTooltip += text;
    title = displayTooltip + ': ' + displayCount;

    let responseTime = '';

    if (val.taskResponseDttm) {
      responseTime = t('hmd-scan.txt-responseTime') + ': ' + helper.getFormattedDate(val.taskResponseDttm, 'local');
      title += ', ' + responseTime;
    }

    if (val.doc_count === 0 || val.doc_count > 0) {
      status = val.doc_count;

      if (val.severity_type_name === 'gcbResult') {
        status = val.FailCnt;
      }
    } else {
      if (val.taskStatus === 'Failure') {
        status = t('hmd-scan.txt-taskFailure');
      } else if (val.taskStatus === 'NotSupport') {
        status = t('hmd-scan.txt-notSupport');
      }

      if (val.severity_type_name === '_ExecutePatchResult') { //Special case for Vans Patch
        if (val.executeStatus === 'Complete') {
          status = t('txt-success');
        } else if (val.executeStatus === 'Failure') {
          status = t('txt-fail');
        }
        title = severityTypeName + ': ' + status;
      }

      if (val.severity_type_name === 'importGcbResult') { //Special case for Import GCB
        return;
      }
    }

    return <span key={i} className='c-link' style={spanStyle} title={title} onClick={this.handleSeverityClick.bind(this, hmd, val, safetyScanInfo)}>{severityTypeName}: {status}</span>
  }
  /**
   * Get vans status color
   * @method
   * @param {string} color - color defined by user
   * @returns style object
   */
  getVansStatusColor = (color) => {
    if (color) {
      return {
        color: '#fff',
        backgroundColor: color
      };
    }
  }
  /**
   * Display Host info list
   * @method
   * @param {object} dataInfo - Host data
   * @param {object} val - individual Host data
   * @param {number} i - index of the Host data
   * @returns HTML DOM
   */
  getInfoList = (dataInfo, val, i) => {
    if (dataInfo[val.path]) {
      let context = <i className={`fg fg-${val.icon}`}></i>;
      let content = dataInfo[val.path];

      if (val.name === 'mac') {
        context = <div className={`fg-bg ${val.path}`}></div>;
      } else if (val.name === 'system') {
        let os = '';

        if (dataInfo.osType === 'linux') {
          os = 'linux';
        } else if (dataInfo.osType = 'windows') {
          os = 'windows';
        }

        context = <div className={`fg-bg ${os}`}></div>;
      } else if (val.name === 'version') {
        context = <div className='fg-bg hmd'></div>;
        content = 'HMD v.' + content;
      } else if (val.name === 'latestTime') {
        if (!content) return;
        content = helper.getFormattedDate(content, 'local');
      } else if (val.name === 'vansNotes' && dataInfo[val.path]) {
        return <li key={i} onMouseOver={this.openPopover.bind(this, dataInfo[val.path].annotation)} onMouseOut={this.closePopover}><div className={`fg fg-${val.icon}`}></div><span className='vans-status' style={this.getVansStatusColor(dataInfo[val.path].color)}>{dataInfo[val.path].status}</span></li>
      }

      let newContent = content;

      if (content.length > 25) {
        newContent = content.substr(0, 25) + '...';
      }

      return <li key={i} title={t('ipFields.' + val.name)}>{context}<span title={content}>{newContent}</span></li>
    }
  }
  /**
   * Get Event Tracing request data
   * @method
   * @param {string} ipDeviceUUID - IP Device UUID
   * @returns requestData object
   */
  getRequestData = (ipDeviceUUID) => {
    const {assessmentDatetime} = this.state;
    const requestData = {
      '@timestamp': [assessmentDatetime.from, assessmentDatetime.to],
      sort: [
        {
          '@timestamp': 'desc'
        }
      ],
      filters: [
        {
          condition: 'must',
          query: 'configSource: hmd'
        },
        {
          condition: 'must',
          query: 'hostId: ' + ipDeviceUUID
        }
      ]
    };

    return requestData;
  }
  /**
   * Get IP device data info
   * @method
   * @param {object} host - active Host data
   * @param {string} options - options for 'toggle'
   * @param {string} [defaultOpen] - HMD type
   */
  getIPdeviceInfo = (host, options, defaultOpen) => {
    const {baseUrl} = this.context;
    const {assessmentDatetime, hostInfo, hostData, eventInfo} = this.state;
    const ipDeviceUUID = host ? host.ipDeviceUUID : hostData.ipDeviceUUID;

    this.ah.all([
      {
        url: `${baseUrl}/api/v3/ipdevice?uuid=${ipDeviceUUID}&page=1&pageSize=5&startDttm=${assessmentDatetime.from}&endDttm=${assessmentDatetime.to}`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/u1/log/event/_search?page=1&pageSize=20`,
        data: JSON.stringify(this.getRequestData(ipDeviceUUID)),
        type: 'POST',
        contentType: 'text/plain'
      }
    ])
    .then(data => {
      if (data) {
        if (data[0]) {
          const activeHostInfo = _.find(hostInfo.dataContent, {ipDeviceUUID});
          let hostData = {...data[0]};

          if (activeHostInfo && activeHostInfo.networkBehaviorInfo) {
            hostData.severityLevel = activeHostInfo.networkBehaviorInfo.severityLevel;
          } else if (host) {
            hostData.severityLevel = host.severityLevel;
          }

          if (!hostData.safetyScanInfo) {
            hostData.safetyScanInfo = {};
          }

          this.setState({
            hostData
          }, () => {
            if (options === 'toggle') {
              if (defaultOpen && typeof defaultOpen === 'string') {
                this.setState({
                  openHmdType: defaultOpen
                }, () => {
                  this.toggleHostAnalysis();
                });
              } else {
                this.setState({
                  hostDeviceOpen: false,
                  openHmdType: ''
                }, () => {
                  this.toggleHostAnalysis();
                });
              }
            } else {
              this.setState({
                openHmdType: ''
              });
            }
          });
        } else {
          helper.showPopupMsg(t('txt-notFound'));
        }

        if (data[1]) {
          let tempEventInfo = {...eventInfo};
          tempEventInfo.dataContent = null;
          tempEventInfo.scrollCount = 1;
          tempEventInfo.hasMore = false;

          this.setState({
            eventInfo: tempEventInfo
          }, () => {
            this.setEventTracingData(data[1]);
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
   * Load Event Tracing data
   * @method
   * @param {number} [page] - page number
   * @param {string} [ipDeviceUUID] - ipDeviceUUID
   */
  loadEventTracing = (page, ipDeviceUUID) => {
    const {baseUrl} = this.context;
    const {hostData, eventInfo} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/u1/log/event/_search?page=${page || eventInfo.scrollCount}&pageSize=20`,
      data: JSON.stringify(this.getRequestData(ipDeviceUUID || hostData.ipDeviceUUID)),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.setEventTracingData(data);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set Event Tracing data
   * @method
   * @param {object} data - data from server response
   */
  setEventTracingData = (data) => {
    const {eventInfo} = this.state;
    let tempEventInfo = {...eventInfo};

    if (data.data.rows.length > 0) {
      const dataContent = data.data.rows.map(tempData => {
        tempData.content.id = tempData.id;
        return tempData.content;
      });

      eventInfo.dataFieldsArr.forEach(tempData => {
        tempEventInfo.dataFields[tempData] = {
          label: f(`logsFields.${tempData}`),
          sortable: false,
          formatter: (value, allValue) => {
            if (tempData === '@timestamp') {
              value = helper.getFormattedDate(value, 'local');
            }
            return <span>{value}</span>
          }
        };
      })

      tempEventInfo.dataContent = _.concat(eventInfo.dataContent, dataContent);
      tempEventInfo.scrollCount++;
      tempEventInfo.hasMore = true;

      this.setState({
        eventInfo: tempEventInfo
      });
    } else {
      tempEventInfo.hasMore = false;

      this.setState({
        eventInfo: tempEventInfo
      });
    }
  }
  /**
   * Toggle Host Analysis dialog on/off
   * @method
   * @param {string} [from] - option for from page
   */
  toggleHostAnalysis = (from) => {
    if (from === 'safetyScan') {
      this.setState({
        hostAnalysisOpen: !this.state.hostAnalysisOpen
      });
    } else {
      this.setState({
        hostAnalysisOpen: !this.state.hostAnalysisOpen,
        safetyDetailsOpen: false,
        eventInfo: {
          dataFieldsArr: ['@timestamp', '_EventCode', 'message'],
          dataFields: {},
          dataContent: null,
          scrollCount: 1,
          hasMore: false
        }
      }, () => {
        const {activeTab, hostAnalysisOpen} = this.state;

        if (activeTab === 'hostList' && !this.state.hostAnalysisOpen) {
          this.getHostData();
          this.getVansStatus();
        }
      });
    }
  }
  /**
   * Display Host content
   * @method
   * @param {object} val - Host data
   * @param {number} i - index of the Host data
   * @returns HTML DOM
   */
  getHostList = (val, i) => {
    const {contextRoot} = this.context;
    const infoList = [
      {
        name: 'hostName',
        path: 'hostName',
        icon: 'box'
      },
      {
        name: 'mac',
        path: 'mac'
      },
      {
        name: 'system',
        path: 'system'
      },
      {
        name: 'owner',
        path: 'ownerObj.ownerName',
        icon: 'fg-user'
      },
      {
        name: 'floorName',
        path: 'areaObj.areaFullName',
        icon: 'map'
      },
      {
        name: 'version',
        path: 'version',
        icon: 'report'
      },
      {
        name: 'netproxyName',
        path: 'netproxyName',
        icon: 'network'
      },
      {
        name: 'latestTime',
        path: 'theLatestTaskResponseDttmArray',
        icon: 'clock'
      },
      {
        name: 'vansNotes',
        path: 'annotationObj',
        icon: 'edit'
      }
    ];
    const hbTitle = val.hbDttm ? 'HB Time: ' + helper.getFormattedDate(val.hbDttm, 'local') : '';
    let iconType = '';
    let title = '';

    if (val.isConnected === true) {
      iconType = 'icon_connected_on';
      title = t('txt-online');
    } else if (val.isConnected === false) {
      iconType = 'icon_connected_off';
      title = t('txt-offline');
    }

    return (
      <li key={i}>
        <div className='device-alert' style={{backgroundColor: ALERT_LEVEL_COLORS[val.severityLevel] || '#999'}}>
          <i className='fg fg-host' title={hbTitle}></i>
        </div>
        <div className='info'>
          <ul className='c-link' onClick={this.getIPdeviceInfo.bind(this, val, 'toggle')}>
            <li className='first' title={t('ipFields.ip')}>
              {iconType === '' &&
                <div className='fg-bg ip'></div>
              }
              {iconType !== '' &&
                <img src={contextRoot + `/images/${iconType}.png`} className='connections-status' title={title} />
              }
              <span>{val.ip}</span>
            </li>
            {infoList.map(this.getInfoList.bind(this, val))}
          </ul>

          <div className='flex-item'>
            {val.severityAssessmentArray && val.severityAssessmentArray.length > 0 &&
              val.severityAssessmentArray.map(this.getSafetyScanInfo.bind(this, val))
            }
          </div>
        </div>
        <div className='view-details' onClick={this.getIPdeviceInfo.bind(this, val, 'toggle')}>
          {t('host.txt-viewInfo')}
        </div>
      </li>
    )
  }
  /**
   * Handle Host data pagination change
   * @method
   * @param {string} contentType - content type ('hostInfo' or 'safetyScanData')
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (contentType, type, value) => {
    const {hostInfo, safetyScanData} = this.state;

    if (contentType === 'hostInfo') {
      let tempHostInfo = {...hostInfo};
      tempHostInfo[type] = Number(value);

      if (type === 'pageSize') {
        tempHostInfo.currentPage = 1;
      }

      this.setState({
        hostInfo: tempHostInfo
      }, () => {
        this.getHostData();
      });
    } else if (contentType === 'safetyScanData') {
      let tempSafetyScanData = {...safetyScanData};
      tempSafetyScanData[type] = Number(value);

      if (type === 'pageSize') {
        tempSafetyScanData.currentPage = 1;
      }

      this.setState({
        safetyScanData: tempSafetyScanData
      }, () => {
        this.getSafetyScanData();
      });
    }
  }
  /**
   * Toggle safety details dialog and set safety data
   * @method
   * @param {object} safetyData - active safety scan data
   * @param {string | bool} options - option to show safety scan tab ('basicInfo' or 'showAvailableHost'); option for 'getVansCpe' or 'availableHost'
   */
  toggleSafetyDetails = (safetyData, options) => {
    const {savedCpeData, fromSafetyPage} = this.state;
    const showSafetyTab = options === 'showAvailableHost' ? 'availableHost' : 'basicInfo';
    let data = {};

    if (options === 'getVansCpe') {
      this.setState({
        currentSafetyData: savedCpeData,
        safetyScanType: 'getVansCpe',
        fromSafetyPage: ''
      });
      return;
    }

    if (options === 'availableHost') {
      this.setState({
        safetyDetailsOpen: !this.state.safetyDetailsOpen,
        fromSafetyPage: ''
      });
      this.toggleHostAnalysis('safetyScan');
      return;
    }

    if (!_.isEmpty(safetyData)) {
      data.currentSafetyData = safetyData;
    }

    this.setState({
      ...data,
      safetyDetailsOpen: !this.state.safetyDetailsOpen,
      showSafetyTab
    }, () => {
      if (!this.state.safetyDetailsOpen) {
        this.getSafetyScanData('vansStatus');
      }
    });
  }
  /**
   * Format primary content length
   * @method
   * @param {string} content - Safety Scan content
   * @param {number} length - length of content
   * @param {string} [className] - class name of the text
   * @returns formatted content
   */
  getFormattedLength = (content, length, className) => {
    if (content.length > length) {
      const newValue = content.substr(0, length) + '...';
      content = <span className={className} title={content}>{newValue}</span>;
    } else {
      content = <span className={className}>{content}</span>;
    }
    return content;
  }
  /**
   * Display primary info for safety scan table
   * @method
   * @param {string} safetyData - active safety scan data
   * @returns formatted content
   */
  getPrimaryContent = (safetyData) => {
    const {safetyScanType} = this.state;
    let content = safetyData;

    if (safetyScanType === 'getEventTraceResult') {
      content = t('host.txt-eventCode') + ': ' + safetyData;
    }

    if (safetyData.length > 80) {
      const newValue = safetyData.substr(0, 200) + '...';
      content = <span className='primary-content' title={safetyData}>{newValue}</span>;
    } else {
      content = <span className='primary-content'>{content}</span>;
    }
    return content;
  }
  /**
   * Display secondary info for safety scan table
   * @method
   * @param {object} safetyData - active safety scan data
   * @returns HTML DOM
   */
  getSecondaryContent = (safetyData) => {
    const {locale} = this.context;
    const {safetyScanType} = this.state;

    if (safetyScanType === 'scanFile') {
      return (
        <div className='flex-item'>
          {safetyData.rawJsonObject._FileInfo && safetyData.rawJsonObject._FileInfo._Filesize &&
            <span className='text'>{helper.numberWithCommas(helper.formatBytes(safetyData.rawJsonObject._FileInfo._Filesize))}</span>
          }
          {safetyData.rawJsonObject && safetyData.rawJsonObject._IsPE &&
            <span className='success'>{t('host.txt-peFile')}</span>
          }
          {safetyData.rawJsonObject && safetyData.rawJsonObject._IsPEextension &&
            <span className='success'>{t('host.txt-peFileExtension')}</span>
          }
          {safetyData.rawJsonObject && safetyData.rawJsonObject._IsVerifyTrust &&
            <span className='success'>{t('host.txt-verifyTrust')}</span>
          }
        </div>
      )
    } else if (safetyScanType === 'gcbDetection') {
      let content = '';

      if (locale === 'zh' && safetyData.rawJsonObject['_PolicyName_zh-tw']) {
        content = safetyData.rawJsonObject['_PolicyName_zh-tw'];
      } else if (locale === 'en' && safetyData.rawJsonObject['_PolicyName_en']) {
        content = safetyData.rawJsonObject['_PolicyName_en'];
      }

      return (
        <div className='flex-item'>
          {safetyData.rawJsonObject._CompareResult &&
            <span className='success'>{t('txt-pass')}</span>
          }
          {!safetyData.rawJsonObject._CompareResult &&
            <span className='fail'>{t('txt-fail')}</span>
          }
          {content &&
            <span className='text'>{content}</span>
          }
        </div>
      )
    } else if (safetyScanType === 'getFileIntegrity') {
      const path = safetyData.rawJsonObject ? safetyData.rawJsonObject._FileIntegrityResultPath : '';
      const content = path ? this.getFormattedLength(path, 60, 'text') : '';

      return (
        <div className='flex-item'>
          {safetyData.primaryKeyName &&
            <span className='fail'>{t('host.txt-' + safetyData.primaryKeyName)}</span>
          }
          {content}
        </div>
      )
    } else if (safetyScanType === 'getEventTraceResult') {
      return (
        <div className='flex-item'>
          {safetyData.rawJsonObject &&
            <span className='text'>{safetyData.rawJsonObject.message ? this.getFormattedLength(safetyData.rawJsonObject.message, 120) : 'N/A'}</span>
          }
        </div>
      )
    } else if (safetyScanType === 'getProcessMonitorResult') {
      return (
        <div className='flex-item'>
          {safetyData.rawJsonObject && safetyData.rawJsonObject._IsMd5Modified &&
            <span className='fail'>{t('host.txt-md5Modified')}</span>
          }
          {safetyData.rawJsonObject && safetyData.rawJsonObject._IsNotInWhiteList &&
            <span className='fail'>{t('host.txt-notWhiteList')}</span>
          }
          {safetyData.rawJsonObject && safetyData.rawJsonObject._ProcessInfo &&
            <span className='text'>{this.getFormattedLength(safetyData.rawJsonObject._ProcessInfo._ExecutableInfo._FileInfo._Filepath, 100)}</span>
          }
        </div>
      )
    } else if (safetyScanType === 'getVansCpe') {
      const type = safetyData.rawJsonObject ? safetyData.rawJsonObject.part : '';
      let typeText = '';

      if (type === 'a') {
        typeText = t('host.txt-software');
      } else if (type === 'h') {
        typeText = t('host.txt-hardware');
      } else if (type === 'o') {
        typeText = t('host.txt-os');
      }

      return (
        <div className='flex-item'>
          {type &&
            <span className='text border'>{t('host.txt-type')}: {typeText}</span>
          }
          {safetyData.rawJsonObject && safetyData.rawJsonObject.vendor &&
            <span className='text border'>{t('host.txt-vendor')}: {safetyData.rawJsonObject.vendor}</span>
          }
          {safetyData.rawJsonObject && safetyData.rawJsonObject.product &&
            <span className='text border'>{t('host.txt-product')}: {safetyData.rawJsonObject.product}</span>
          }
          {safetyData.rawJsonObject && safetyData.rawJsonObject.version &&
            <span className='text'>{t('host.txt-version')}: {safetyData.rawJsonObject.version}</span>
          }
        </div>
      )
    } else if (safetyScanType === 'getVansCve') {
      let severity = '';
      let description = '';

      if (safetyData.rawJsonObject) {
        if (safetyData.rawJsonObject.severity) {
          severity = safetyData.rawJsonObject.severity.toLowerCase();
        }

        if (safetyData.rawJsonObject.description) {
          description = this.getFormattedLength(safetyData.rawJsonObject.description.description_data[0].value, 120);
        }
      }

      return (
        <div className='flex-item'>
          {severity &&
            <span className={severity}>{t('txt-' + severity)}</span>
          }
          {description &&
            <span className='text'>{description}</span>
          }
        </div>
      )
    }
  }
  /**
   * Handle popover open
   * @method
   * @param {string} annotation - vans annotation to be displayed
   * @param {object} event - event object
   */
  openPopover = (annotation, event) => {
    Popover.openId('vansNotesDisplay', event, annotation);
  }
  /**
   * Handle popover close
   * @method
   */
  closePopover = () => {
    Popover.closeId('vansNotesDisplay');
  }
  /**
   * Display common info for safety scan table
   * @method
   * @param {object} safetyData - active safety scan data
   * @returns HTML DOM
   */
  getCommonContent = (safetyData) => {
    return (
      <div className='common-info'>
        {safetyData.annotationObj &&
          <div className={cx('divider', {'border': safetyData.annotationObj.color})}></div>
        }
        {safetyData.annotationObj &&
          <span className='vans-status scan' style={this.getVansStatusColor(safetyData.annotationObj.color)} onMouseOver={this.openPopover.bind(this, safetyData.annotationObj.annotation)} onMouseOut={this.closePopover}>{safetyData.annotationObj.status}</span>
        }
        <span>{t('host.txt-hostCount')}: {helper.numberWithCommas(safetyData.hostIdArraySize)}</span>
      </div>
    )
  }
  /**
   * Get available host data
   * @method
   * @param {object | string} safetyData - active safety scan data, or primary key value
   * @param {object} [cpeData] - cpe data
   * @param {string} [from] - from option for 'safetyPage' or 'showAvailableHost'
   */
  getHostInfo = (safetyData, cpeData, from) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/hmd/hmdScanDistribution`;
    const requestData = {
      primaryKeyValue: from === 'showAvailableHost' ? safetyData : safetyData.primaryKeyValue || safetyData.id,
      exactStartDttm: safetyData.startTimeString,
      hostIdObj: safetyData.hostIdObj
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        if (_.isEmpty(data)) {
          helper.showPopupMsg(t('txt-notFound'));
          return;
        }

        if (from === 'safetyPage') {
          this.setState({
            safetyScanType: 'getVansCve',
            safetyDetailsOpen: false,
            savedCpeData: cpeData,
            fromSafetyPage: 'getVansCve'
          });
        }

        if (from === 'showAvailableHost') {
          this.setState({
            currentSafetyData: data,
            fromSafetyPage: 'availableHost',
            safetyDetailsOpen: !this.state.safetyDetailsOpen,
            showSafetyTab: 'availableHost'
          }, () => {
            this.toggleHostAnalysis('safetyScan');
          });
          return;
        }

        this.toggleSafetyDetails(data, from);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display Safety Scan content
   * @method
   * @param {object} val - Safety Scan data
   * @param {number} i - index of the Safety Scan data
   * @returns HTML DOM
   */
  getSafetyList = (val, i) => {
    return (
      <li key={i}>
        <div className='device-alert product-safety'>
          <i className='fg fg-wifi-beacon-1'></i>
          {this.getPrimaryContent(val.primaryKeyValue)}
        </div>
        <div className='info'>
          {this.getSecondaryContent(val)}
        </div>
        {this.getCommonContent(val)}
        <div className='view-details' onClick={this.getHostInfo.bind(this, val)}>
          {t('host.txt-viewInfo')}
        </div>
      </li>
    )
  }
  /**
   * Handle CSV download
   * @method
   * @param {string} [options] - option for 'default' or department ID
   */
  getCSVfile = (options) => {
    const {baseUrl, contextRoot} = this.context;
    const {vansTableType} = this.state;
    let url = '';
    let requestData = this.getHostData('csv');

    if (options === 'default') {
      url = `${baseUrl}${contextRoot}/api/v2/ipdevice/assessment/_export`;
    } else {
      if (vansTableType === 'assessment') {
        url = `${baseUrl}${contextRoot}/api/v2/ipdevice/assessment/deptCountsTable/_export`;
        
        if (options && typeof options === 'string') {
          requestData.deptId = options;
        }
      } else if (vansTableType === 'hmd') {
        url = `${baseUrl}${contextRoot}/api/v2/hmd/hmdScanDistribution/deptCountsTable/_export`;

        if (options && typeof options === 'string') {
          requestData.deptId = options;
        }
      }
    }

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  /**
   * Handle PDF download
   * @method
   */
  getPDFfile = () => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/v2/ipdevice/assessment/_pdfs`;
    const requestData = this.getHostData('pdf');

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  /**
   * Handle security diagnostic
   * @method
   */
  exportSecurityDiagnostic = () => {
    const {baseUrl, contextRoot} = this.context
    const url = `${baseUrl}${contextRoot}/api/v2/ipdevice/kbid/_export`
    const requestData = this.getHostData('csv')

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  /**
   * Set default selected department
   * @method
   */
  setSelectedDepartment = () => {
    const {baseUrl} = this.context;
    const {account} = this.state;
    let tempFilterNav = {...this.state.filterNav};

    this.ah.one({
      url: `${baseUrl}/api/department/child/_set?id=${account.departmentId}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        tempFilterNav.departmentSelected = data;

        this.setState({
          filterNav: tempFilterNav,
          limitedDepartment: data
        }, () => {
          this.getHostData();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle department checkbox check/uncheck
   * @method
   * @param {object} tree - department tree data
   * @param {object} event - event object
   */
  toggleDepartmentCheckbox = (tree, event) => {
    let tempFilterNav = {...this.state.filterNav};
    let departmentChildList = [];

    _.forEach(tree.children, val => {
      helper.floorPlanRecursive(val, obj => {
        departmentChildList.push(obj.id);
      });
    })

    tempFilterNav.departmentSelected = this.getSelectedItems(event.target.checked, 'departmentSelected', departmentChildList, tree.id);

    this.setState({
      filterNav: tempFilterNav
    }, () => {
      this.handleSearchSubmit();
    });
  }
  /**
   * Determine checkbox disabled status
   * @method
   * @param {string} id - department tree ID
   * @returns boolean true/false
   */
  checkboxDisabled = (id) => {
    const {account, limitedDepartment} = this.state;

    if (account.limitedRole) {
      if (limitedDepartment.length === 0) {
        return true;
      }

      if (limitedDepartment.length > 0) {
        if (!_.includes(limitedDepartment, id)) {
          return true;
        }
      }
      return false;
    }
    return false;
  }
  /**
   * Display department tree content
   * @method
   * @param {object} tree - department tree data
   * @returns HTML DOM
   */
  getDepartmentTreeLabel = (tree) => {
    return <span><Checkbox checked={_.includes(this.state.filterNav.departmentSelected, tree.id)} onChange={this.toggleDepartmentCheckbox.bind(this, tree)} color='primary' disabled={this.checkboxDisabled(tree.id)} />{tree.name}</span>
  }
  /**
   * Display department tree item
   * @method
   * @param {object} val - department tree data
   * @param {number} i - index of the department tree data
   * @returns TreeItem component
   */
  getDepartmentTreeItem = (val, i) => {
    return (
      <TreeItem
        key={val.id + i}
        nodeId={val.id}
        label={this.getDepartmentTreeLabel(val)}>
        {val.children && val.children.length > 0 &&
          val.children.map(this.getDepartmentTreeItem)
        }
      </TreeItem>
    )
  }
  /**
   * Handle system checkbox check/uncheck
   * @method
   * @param {object} tree - system tree data
   * @param {object} event - event object
   */
  toggleSystemCheckbox = (tree, event) => {
    const {systemList, deviceSearchList} = this.state;
    let tempSystemList = _.cloneDeep(systemList);
    let tempDeviceSearchList = {...deviceSearchList};

    if (tree.type === 'server' || tree.type === 'pc' || !tree.type) {
      let systemSelected = [];

      if (tree.children) { //Handle tree header check/uncheck
        const targetIndex = _.findIndex(systemList, {'name':  tree.name});
        tempSystemList[targetIndex].checked = event.target.checked;
        tempSystemList[targetIndex].children = _.map(systemList[targetIndex].children, val => {
          return {
            ...val,
            checked: event.target.checked
          };
        })
      } else { //Handle tree children check/uncheck
        let parentIndex = '';
        let childrenIndex = '';
        let parentChecked = true;

        _.forEach(systemList, (val, i) => {
          _.forEach(val.children, (val2, j) => {
            if (tree.name === val2.name) {
              parentIndex = i;
              childrenIndex = j;
              return false;
            }
          })
        })
        tempSystemList[parentIndex].children[childrenIndex].checked = event.target.checked;

        _.forEach(tempSystemList[parentIndex].children, val => {
          if (!val.checked) {
            parentChecked = false;
            return false;
          }
        })
        tempSystemList[parentIndex].checked = parentChecked;
      }

      const index = tempDeviceSearchList.system.indexOf('noExist');

      if (index > -1) {
        systemSelected.push('noExist');
      }

      _.forEach(tempSystemList, val => {
        _.forEach(val.children, val2 => {
          if (val2.checked) {
            systemSelected.push(val2.name);
          }
        })
      })

      tempDeviceSearchList.system = systemSelected;
    }

    if (tree.type === 'noSystem') {
      tempSystemList[2].checked = event.target.checked;

      if (event.target.checked) {
        tempDeviceSearchList.system.push('noExist');
      } else {
        const index = tempDeviceSearchList.system.indexOf('noExist');
        tempDeviceSearchList.system.splice(index, 1);
      }
    }

    this.setState({
      systemList: tempSystemList,
      deviceSearchList: tempDeviceSearchList
    });
  }
  /**
   * Display system tree content
   * @method
   * @param {object} tree - system tree data
   * @returns HTML DOM
   */
  getSystemTreeLabel = (tree) => {
    return (
      <span>
        <Checkbox
          name={tree.name}
          checked={tree.checked}
          onChange={this.toggleSystemCheckbox.bind(this, tree)}
          color='primary' />
          {tree.name}
      </span>
    )
  }
  /**
   * Display system tree item
   * @method
   * @param {object} val - system tree data
   * @param {number} i - index of the system tree data
   * @returns TreeItem component
   */
  getSystemTreeItem = (val, i) => {
    return (
      <TreeItem
        key={val.name}
        nodeId={val.name}
        label={this.getSystemTreeLabel(val)}>
        {val.children && val.children.length > 0 &&
          val.children.map(this.getSystemTreeItem)
        }
      </TreeItem>
    )
  }
  /**
   * Display tree item
   * @method
   * @param {string} [type] - option for onLabelClick
   * @param {object} val - tree data
   * @param {number} i - index of the tree data
   * @returns TreeItem component
   */
  getTreeItem = (type, val, i) => {
    let treeParam = {
      key: val.id + i,
      nodeId: val.id,
      label: val.label
    };

    if (type === 'click') {
      treeParam.onLabelClick = this.handleSelectTree.bind(this, val);
    }

    return (
      <TreeItem {...treeParam}>
        {val.children && val.children.length > 0 &&
          val.children.map(this.getTreeItem.bind(this, type))
        }
      </TreeItem>
    )
  }
  /**
   * Handle open menu
   * @method
   * @param {string} type - menu type ('hmdTriggerAll', 'safetyScan' or 'hmdDownload')
   * @param {object} event - event object
   */
  handleOpenMenu = (type, event) => {
    this.setState({
      contextAnchor: event.currentTarget,
      menuType: type
    });
  }
  /**
   * Handle close menu
   * @method
   */
  handleCloseMenu = () => {
    this.setState({
      contextAnchor: null,
      menuType: ''
    });
  }
  /**
   * Toggle HMD file upload dialog on/off
   * @method
   */
  toggleHmdUploadFile = () => {
    this.setState({
      uploadHmdFileOpen: !this.state.uploadHmdFileOpen
    });
  }
  /**
   * Toggle track host list
   * @method
   */
  toggleTrackHostList = () => {
    this.setState({
      trackHostListOpen: !this.state.trackHostListOpen,
      activeTrackHostTab: 'date',
      datetimeExport: helper.getSubstractDate(1, 'day', moment().local().format('YYYY-MM-DDTHH:mm:ss')),
      trackHostFile: null
    });

    this.handleCloseMenu();
  }
  /**
   * Handle HMD setup file upload
   * @method
   * @param {object} file - file uploaded by the user
   */
  getHmdSetupFile = (file) => {
    this.setState({
      hmdFile: file
    });
  }
  /**
   * Handle upload HMD setup file
   * @method
   * @returns ModalDialog component
   */
  uploadHmdFileDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleHmdUploadFile},
      confirm: {text: t('txt-confirm'), handler: this.confirmHmdFileUpload}
    };
    const title = t('hmd-scan.txt-uploadHMDfile');
    const fileTitle = t('hmd-scan.txt-hmdSetupFile') + '(.zip)';

    return (
      <ModalDialog
        id='hmdFileUploadDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        <FileUpload
          id='fileUpload'
          fileType='indicators'
          supportText={fileTitle}
          btnText={t('txt-upload')}
          handleFileChange={this.getHmdSetupFile} />
      </ModalDialog>
    )
  }
  /**
   * Handle HMD file upload confirm
   * @method
   */
  confirmHmdFileUpload = () => {
    const {baseUrl} = this.context;
    const {hmdFile} = this.state;
    let formData = new FormData();
    formData.append('file', hmdFile);

    if (!hmdFile.name) {
      return;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    this.ah.one({
      url: `${baseUrl}/api/hmd/setupFile/_upload`,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-uploadSuccess'));

        this.setState({
          hmdFile: {}
        });

        this.toggleHmdUploadFile();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle track host list tab
   * @method
   * @param {object} event - event object
   * @param {string} type - track type ('date' or 'file')
   */
  toggleHostListType = (event, type) => {
    if (!type) {
      return;
    }

    this.setState({
      activeTrackHostTab: type
    });
  }
  /**
   * Set new datetime
   * @method
   * @param {object} newDatetime - new datetime object
   */
  handleDateChange = (newDatetime) => {
    this.setState({
      datetimeExport: newDatetime
    });
  }
  /**
   * Handle track host file upload
   * @method
   * @param {object} file - file uploaded by the user
   */
  getTrackHostFile = (file) => {
    this.setState({
      trackHostFile: file
    });
  }
  /**
   * Display track host list content
   * @method
   * @returns HTML DOM
   */
  displayTrackHostListContent = () => {
    const {locale} = this.context;
    const {activeTrackHostTab, datetimeExport} = this.state;
    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <div className='track-host-content'>
        <div className='options-btns'>
          <ToggleButtonGroup
            id='trackHostListBtn'
            value={activeTrackHostTab}
            exclusive
            onChange={this.toggleHostListType}>
            <ToggleButton id='trackHostListDate' value='date'>{t('txt-selectDate')}</ToggleButton>
            <ToggleButton id='trackHostListFile' value='file'>{t('host.txt-uploadHostList')}</ToggleButton>
          </ToggleButtonGroup>
        </div>

        {activeTrackHostTab === 'date' &&
          <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
            <KeyboardDatePicker
              className='picker'
              inputVariant='outlined'
              variant='inline'
              format='YYYY-MM-DD'
              maxDate={helper.getSubstractDate(1, 'day')}
              minDate={helper.getSubstractDate(1, 'month', helper.getSubstractDate(1, 'day'))}
              invalidDateMessage={t('txt-invalidDateMessage')}
              maxDateMessage={t('txt-maxDateMessage')}
              minDateMessage={t('txt-minDateMessage')}
              value={datetimeExport}
              onChange={this.handleDateChange} />
          </MuiPickersUtilsProvider>
        }

        {activeTrackHostTab === 'file' &&
          <FileUpload
            id='fileUploadHost'
            fileType='csv'
            supportText={t('host.txt-hostList2') + '(.xlsx)'}
            btnText={t('txt-upload')}
            handleFileChange={this.getTrackHostFile} />
        }
      </div>
    )
  }
  /**
   * Handle track host list
   * @method
   * @returns ModalDialog component
   */
  trackHostListDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleTrackHostList},
      confirm: {text: t('host.txt-downloadTrackList'), handler: this.confirmTrackHostList}
    };
    const title = t('host.txt-trackHostList');

    return (
      <ModalDialog
        id='trackHostListDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayTrackHostListContent()}
      </ModalDialog>
    )
  }
  /**
   * Handle track host list confirm
   * @method
   */
  confirmTrackHostList = () => {
    const {baseUrl, contextRoot} = this.context;
    const {activeTrackHostTab, datetimeExport, trackHostFile} = this.state;
    const url = `${baseUrl}/api/hmd/ipdevice/vans/diff`;
    let formData = new FormData();
    let requestData = {
      hmdScanDistribution: {
        taskName: 'getVans',
        primaryKeyName: 'cpe23Uri'
      }
    };

    if (activeTrackHostTab === 'date') {
      const dateTimeFrom = moment(datetimeExport).format('YYYY-MM-DD') + 'T00:00:00';
      const dateTimeTo = moment(datetimeExport).format('YYYY-MM-DD') + 'T23:59:59';
      requestData.diffDate = {
        from: moment(dateTimeFrom).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
        to: moment(dateTimeTo).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
      };
      formData.append('payload', JSON.stringify(requestData));
    } else if (activeTrackHostTab === 'file') {
      formData.append('payload', JSON.stringify(requestData));
      formData.append('file', trackHostFile);
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    this.ah.one({
      url,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data) {
        const url = `${baseUrl}${contextRoot}/api/hmd/ipdevice/vans/diff/download?fileName=${data.fileName}`;
        window.open(url, '_blank');

        this.toggleTrackHostList();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })    
  }
  /**
   * Toggle CPE file upload dialog on/off
   * @method
   */
  toggleCpeUploadFile = () => {
    this.setState({
      uploadCpeFileOpen: !this.state.uploadCpeFileOpen
    });
  }
  /**
   * Handle CPE setup file upload
   * @method
   * @param {object} file - file uploaded by the user
   */
  getCpeSetupFile = (file) => {
    this.setState({
      cpeFile: file
    });
  }
  /**
   * Handle upload CPE setup file
   * @method
   * @returns ModalDialog component
   */
  uploadCpeFileDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleCpeUploadFile},
      confirm: {text: t('txt-confirm'), handler: this.confirmCpeFileUpload}
    };
    const title = t('host.txt-uploadMergedCpe');

    return (
      <ModalDialog
        id='cpeFileUploadDialog'
        className='modal-dialog'
        title={title}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        <FileUpload
          id='fileUpload'
          fileType='csv'
          supportText={title}
          btnText={t('txt-upload')}
          handleFileChange={this.getCpeSetupFile} />
      </ModalDialog>
    )
  }
  /**
   * Handle CPE file upload confirm
   * @method
   */
  confirmCpeFileUpload = () => {
    const {baseUrl} = this.context;
    const {cpeFile} = this.state;
    const requestData = {
      hmdScanDistribution: {
        taskName: 'getVans',
        primaryKeyName: 'cpe23Uri'
      },
      ...this.getHostSafetyRequestData()
    };
    let formData = new FormData();
    formData.append('payload', JSON.stringify(requestData));
    formData.append('file', cpeFile);

    if (!cpeFile.name) {
      return;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    this.ah.one({
      url: `${baseUrl}/api/hmd/cpeFile/merge/_upload`,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-uploadSuccess'));

        this.setState({
          cpeFile: {},
          uploadedCPE: data
        });

        this.toggleCpeUploadFile();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle CPE download button
   * @method
   */
  cpeDownload = () => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/hmd/cpeFile/merge/_download`;
    window.open(url, '_blank');
  }
  /**
   * Toggle CSV import dialog on/off
   * @method
   * @param {string} [importFilterType] - Import filter type ('ip' or 'safetyScanInfo')
   */
  toggleCsvImport = (importFilterType) => {
    this.setState({
      importCsvOpen : !this.state.importCsvOpen,
      importFilterType
    });

    this.handlePopoverClose();
  }
  /**
   * Handle CSV import confirm 
   * @method
   * @param {array.<array>} csvData - upload CSV data
   * @param {string} [safetyScanInfoScore] - safety scan score
   */
  confirmCsvImport = (csvData, safetyScanInfoScore) => {
    const {baseUrl} = this.context;
    const {importFilterType} = this.state;

    if (importFilterType === 'ip') {
      let validData = true;
      let validIpFormat = true;
      let formattedData = [];

      if (csvData.length > 0) {
        _.forEach(csvData, val => {
          if (val.length > 1) { //Check CSV column count
            validData = false;
            return;
          }

          _.forEach(val, val2 => {
            if (!IP_PATTERN.test(val2)) { //Check IP format
              validIpFormat = false;
              return;
            }

            formattedData.push({
              input: val2
            });
          })
        })
      }

      if (!validData) {
        helper.showPopupMsg(t('host.txt-csvFileError'));
        return;
      }

      if (!validIpFormat) {
        helper.showPopupMsg(t('network-inventory.txt-uploadFailedIP'));
        return;
      }

      this.setDeviceSearch(importFilterType, formattedData);
    } else if (importFilterType === 'safetyScanInfo') {
      if (!csvData) {
        this.toggleCsvImport();
        return;
      }

      let formData = new FormData();
      formData.append('file', csvData);
      formData.append('score', safetyScanInfoScore);

      this.ah.one({
        url: `${baseUrl}/api/hmd/uploadNistCpe`,
        data: formData,
        type: 'POST',
        processData: false,
        contentType: false
      })
      .then(data => {
        if (data) {
          const formattedData = _.map(data, val => ({ input: val }));

          this.setDeviceSearch(importFilterType, formattedData);
        }
        return null;
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }

    this.toggleCsvImport();
  }
  /**
   * Toggle yara rule modal dialog on/off
   * @method
   */
  toggleYaraRule = () => {
    this.setState({
      yaraRuleOpen: !this.state.yaraRuleOpen
    });

    this.handleCloseMenu();
  }
  /**
   * Check FR-MOTP
   * @method
   */
  checkFrMotp = () => {
    const {patch} = this.state;
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/frmotp/_enable`;

    this.ah.one({
      url,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      this.setState({
        vansPatchSelectedOpen: false,
        frMotpEnable: data
      }, () => {
        this.toggleVansPatch();
      });
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle FR-MOTP modal dialog on/off
   * @method
   * @param {object} patch - Vans patch data object
   * @param {string} [options] - option for 'close'
   */
  toggleFrMotp = (patch, options) => {
    if (options === 'close') {
      this.setState({
        frMotpOpen: false,
        vansPatch: {}
      });
      return;
    }

    if (this.state.frMotpEnable) {
      this.setState({
        frMotpOpen: true,
        frMotp: '',
        vansPatch: patch
      });
    } else {
      this.confirmVansPatch(patch);
    }
  }
  /**
   * Toggle vans patch modal dialog on/off
   * @method
   */
  toggleVansPatch = () => {
    const {vansPatchOpen} = this.state;

    if (vansPatchOpen) { //Clear patch info when close dialog
      this.setState({
        patchInfo: {}
      });
    }

    this.setState({
      vansPatchOpen: !vansPatchOpen
    });

    this.handleCloseMenu();
  }
  /**
   * Handle Vans patch dialog confirm
   * @method
   * @param {object} patch - Vans patch data object
   */
  confirmVansPatch = (patch) => {
    const {baseUrl} = this.context;
    const {account, activeVansPatch, patchSelectedItem} = this.state;
    let retriggerBody = {
      cmdJO: {
        cmds: ['executePatch']
      }
    };

    if (patchSelectedItem.length > 0) {
      retriggerBody.hostIdArray = _.map(patchSelectedItem, val => {
        return val.ipDeviceUUID;
      });
    } else {
      retriggerBody = {
        ...retriggerBody,
        ...this.getHostSafetyRequestData()
      };
    }

    let formData = new FormData();
    formData.append('actionModel', patch.actionType);
    formData.append('scriptFile', patch.scriptFile);
    formData.append('executableFile', patch.executableFile);
    formData.append('patchProduct', patch.product);
    formData.append('patchVendor', patch.vendor);
    formData.append('patchVersion', patch.version);
    formData.append('memo', patch.memo);
    formData.append('departmentId', account.departmentId);
    formData.append('retriggerBody', JSON.stringify(retriggerBody));

    this.ah.one({
      url: `${baseUrl}/api/ipdevice/assessment/_search/_vansPatch/upload`,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      this.setState({
        patchSelectedItem: []
      });

      helper.showPopupMsg(t('host.txt-patchSuccess'));
      this.toggleFrMotp('', 'close');
      this.toggleVansPatch();
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle vans patch group modal dialog on/off
   * @method
   */
  toggleVansPatchGroup = () => {
    this.setState({
      vansPatchGroupOpen: !this.state.vansPatchGroupOpen
    });

    this.handleCloseMenu();
  }
  /**
   * Toggle vans patch details modal dialog on/off
   * @method
   * @param {object} [allValue] - selected Vans data
   */
  toggleVansPatchDetails = (allValue) => {
    if (allValue && allValue.groupId) {
      this.setState({
        activeVansPatch: allValue
      });
    }

    this.setState({
      vansPatchDetailsOpen: !this.state.vansPatchDetailsOpen
    });

    this.handleCloseMenu();
  }
  /**
   * Toggle vans patch selected modal dialog on/off
   * @method
   * @param {object} patchInfo - user selected patch info
   * @param {object} patchSelectedItem - user selected patch items
   */
  toggleVansPatchSelected = (patchInfo, patchSelectedItem) => {
    this.setState({
      vansPatchSelectedOpen: !this.state.vansPatchSelectedOpen,
      patchInfo,
      patchSelectedItem: patchSelectedItem || []
    });

    this.setVansPatchFrom('exist');
  }
  /**
   * Show vans patch info
   * @method
   * @param {string} val - individual patch item
   * @param {number} i - index of the patch item
   * @returns HTML DOM
   */
  showPatchItem = (val, i) => {
    return (
      <tr key={i}>
        <td>{val.ip}</td>
        <td>{val.hostName}</td>
        <td>{val.osType}</td>
      </tr>
    )
  }
  /**
   * Display Vans Patch selected content
   * @method
   * @returns HTML DOM
   */
  displayVansPatchSelectedContent = () => {
    return (
      <div className='table-content'>
        <table className='c-table main-table align-center with-border'>
          <thead>
            <tr>
              <th>{t('ipFields.ip')}</th>
              <th>{t('ipFields.hostName')}</th>
              <th>{t('ipFields.system')}</th>
            </tr>
          </thead>
          <tbody>
            {this.state.patchSelectedItem.map(this.showPatchItem)}
          </tbody>
        </table>
      </div>
    )
  }
  /**
   * Display Vans Patch selected dialog
   * @method
   * @returns ModalDialog component
   */
  vansPatchSelectedDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleVansPatchSelected},
      confirm: {text: t('txt-confirm'), handler: this.checkFrMotp}
    };

    return (
      <ModalDialog
        id='vansPatchSelectedDialog'
        className='modal-dialog'
        title={t('hmd-scan.txt-reviewHostList')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayVansPatchSelectedContent()}
      </ModalDialog>
    )
  }
  /**
   * Set input data change
   * @method
   * @param {object} event - event object
   */
  handleDataChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }
  /**
   * Set VansPatchFrom type
   * @method
   * @param {string} type - vans patch from ('new' or 'exist')
   */
  setVansPatchFrom = (type) => {
    if (type === 'new') {
      this.checkFrMotp();
    }
  }
  /**
   * Get HMD test menu
   * @method
   * @param {string} val - individual HMD data
   * @param {number} i - index of the HMD data
   * @returns MenuItem component
   */
  getHMDmenu = (val, i) => {
    if (val.cmds === 'executePatch') {
      return (
        <MenuItem key={i}>
          <span>{t('hmd-scan.txt-vansPatch')}</span>
          <Button variant='outlined' color='primary' className='standard btn' onClick={this.setVansPatchFrom.bind(this, 'new')}>{t('hmd-scan.txt-execute')}</Button>
        </MenuItem>
      )
    } else if (val.cmds === 'executePatchRecord') {
      return (
        <MenuItem key={i}>
          <span>{t('hmd-scan.txt-vansPatchRecord')}</span>
          <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleVansPatchGroup}>{t('hmd-scan.txt-execute')}</Button>
        </MenuItem>
      )
    } else if (val.cmds === 'compareIOC') {
      return (
        <MenuItem key={i}>
          <span>{val.name}</span>
          <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleYaraRule}>{t('hmd-scan.txt-execute')}</Button>
        </MenuItem>
      )
    } else {
      return (
        <MenuItem key={i} style={val.cmds === 'importGcb' ? {display: 'none'} : null}>
          <span>{val.name}</span>
          <Button variant='outlined' color='primary' className='standard btn' onClick={this.openConfirmModal.bind(this, 'start', val)}>{t('hmd-scan.txt-execute')}</Button>
          {(val.name === 'File Integrity' || val.name === 'Process Monitor' || val.name === 'Event Tracing') && 
            <Button variant='outlined' color='primary' className='standard btn' onClick={this.openConfirmModal.bind(this, 'stop', val)}>{t('hmd-scan.txt-terminate')}</Button>
          }
        </MenuItem>
      )
    }
  }
  /**
   * Check NCCST button disabled status
   * @method
   * @returns boolean true/false
   */
  checkNCCSTdisabled = () => {
    const {sessionRights} = this.context;
    let disabled = true;

    if (sessionRights.Module_Config || sessionRights.Module_Account) {
      disabled = false;
    }
    return disabled;
  }
  /**
   * Handle safety scan download button
   * @method
   * @param {string} type - download type ('hostList' or 'report')
   * @param {string} safetyScanType - scan type
   */
  handleSafetyScanBtn = (type, safetyScanType) => {
    const {baseUrl, contextRoot} = this.context;
    let url = '';
    let requestData = {
      ...this.getHostSafetyRequestData()
    };

    if (type === 'hostList') {
      url = `${baseUrl}${contextRoot}/api/hmd/ipdevice/safetyScanInfo/_export`;
    } else if (type === 'report') {
      url = `${baseUrl}${contextRoot}/api/hmd/safetyScanInfo/_export`;
    }

    if (safetyScanType === 'getVansCpe') {
      requestData.hmdScanDistribution = {
        taskName: 'getVans',
        primaryKeyName: 'cpe23Uri'
      };
    } else if (safetyScanType === 'getVansCve') {
      requestData.hmdScanDistribution = {
        taskName: 'getVans',
        primaryKeyName: 'cveId'
      };
    } else {
      requestData.hmdScanDistribution = {
        taskName: safetyScanType
      };
    }

    downloadWithForm(url, {payload: JSON.stringify(requestData)});

    this.handleCloseMenu();
  }
  /**
   * Get safety scan menu
   * @method
   * @param {string} val - individual safety scan menu
   * @param {number} i - index of the safety scan menu
   * @returns MenuItem component
   */
  getSafetyScanMenu = (val, i) => {
    const type = val.value;
    let name = val.name;

    if (type === 'getVansCpe') {
      name = 'CPE';
    } else if (type === 'getVansCve') {
      name = 'CVE';
    }

    return (
      <MenuItem key={i} className='safety-scan-menu'>
        <span className='header'>{val.name}</span>
        <Button variant='outlined' color='primary' className='standard btn' onClick={this.handleSafetyScanBtn.bind(this, 'hostList', type)}>{t('host.txt-downloadHostList')}</Button>
        {type === 'getVansCpe' &&
          <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleTrackHostList.bind(this, 'hostList')}>{t('host.txt-trackHostList')}</Button>
        }
        <Button variant='outlined' color='primary' className='standard btn' onClick={this.handleSafetyScanBtn.bind(this, 'report', type)}>{t('txt-export') + ' ' + name}</Button>
        {type === 'getVansCpe' &&
          <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleReportNCCST} disabled={this.checkNCCSTdisabled()}>{t('host.txt-report-nccst')}</Button>
        }
      </MenuItem>
    )
  }
  /**
   * Handle HMD download button
   * @method
   * @param {string} type - download type ('windows' or 'linux')
   */
  hmdDownload = (type) => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/hmd/download?ver=${type}`;
    window.open(url, '_blank');
    this.handleCloseMenu();
  }
  /**
   * Display confirm content
   * @method
   * @param {string} type - action type ('start' or 'stop')
   * @param {string} name - action name
   * @returns HTML DOM
   */
  getConfirmContent = (type, name) => {
    let text = '';

    if (type === 'start') {
      text = t('txt-confirmProceed') + ': ' + name;
    } else if (type === 'stop') {
      text = t('txt-confirmTerminate') + ': ' + name;
    }

    return (
      <div className='content'>
        <span>{text}?</span>
      </div>
    )
  }
  /**
   * Show the confirm modal dialog
   * @method
   * @param {string} type - action type ('start' or 'stop')
   * @param {object} hmdObj - HMD object
   */
  openConfirmModal = (type, hmdObj) => {
    PopupDialog.prompt({
      id: 'modalWindowSmall',
      confirmText: t('txt-confirm'),
      cancelText: t('txt-cancel'),
      display: this.getConfirmContent(type, hmdObj.name),
      act: (confirmed) => {
        if (confirmed) {
          if (type === 'start') {
            if (hmdObj.type === 'hmdUpgrade') {
              this.handleHmdUpgrade(hmdObj);
            } else {
              this.triggerHmdAll(hmdObj);
            }
          } else if (type === 'stop') {
            this.stopHmd(hmdObj);
          }
        }
      }
    });
    this.handleCloseMenu();
  }
  /**
   * Handle HMD upgrade action
   * @method
   * @param {object} hmdObj - HMD object
   */
  handleHmdUpgrade = (hmdObj) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/v2/ipdevice/assessment/_search/_retrigger/upgrade`;
    const requestData = {
      ...this.getHostSafetyRequestData()
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.setState({
      requestSentOpen: true
    });
  }
  /**
   * Handle trigger button for HMD trigger all
   * @method
   * @param {object} hmdObj - HMD object
   * @param {object} [yaraRule] - yara rule data
   */
  triggerHmdAll = (hmdObj, yaraRule) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/v2/ipdevice/assessment/_search/_retrigger`;
    let requestData = {
      ...this.getHostSafetyRequestData(),
      cmdJO: {
        cmds: [hmdObj.cmds]
      }
    };

    if (hmdObj.cmds === 'EventTracingThread') {
      requestData.cmdJO = {
        cmds: ['resetTaskConfig'],
        taskThreads: [
          {
            _Name: hmdObj.cmds,
            _Enable: true
          }
        ]
      };
    }

    if (hmdObj.cmds === 'compareIOC') {
      let pathData = [];

      _.forEach(yaraRule.pathData, val => {
        if (val.path) {
          pathData.push(val.path);
        }
      })

      requestData.paras = {
        _FilepathList: pathData,
        _RuleString: yaraRule.rule
      };
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.setState({
      requestSentOpen: true
    });

    this.handleCloseMenu();

    if (hmdObj.cmds === 'compareIOC') {
      this.toggleYaraRule();
    }
  }
  /**
   * Stop HMD
   * @method
   * @param {object} hmdObj - HMD object
   */
  stopHmd = (hmdObj) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/v2/ipdevice/assessment/_search/_retrigger`;
    const requestData = {
      ...this.getHostSafetyRequestData(),
      cmdJO: {
        cmds: ['resetTaskConfig'],
        taskThreads: [
          {
            _Name: hmdObj.stop,
            _Enable: false
          }
        ]
      }
    };

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: false})
    .then(data => {
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    this.setState({
      requestSentOpen: true
    });

    this.handleCloseMenu();
  }
  /**
   * Check yara rule before submit for trigger
   * @method
   * @param {object} yaraRule - yara rule data
   */
  checkYaraRule = (yaraRule) => {
    const {baseUrl} = this.context;
    const url = `${baseUrl}/api/hmd/compileYara`;
    const requestData = {
      _RuleString: yaraRule.rule
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.triggerHmdAll(YARA_SCAN, yaraRule);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle page content
   * @method
   * @param {string} type - content type ('hostContent' or 'hmdSettings')
   */
  toggleContent = (type) => {
    this.setState({
      activeContent: type
    });
  }
  /**
   * Get and set safety scan list
   * @method
   * @returns safetyScanList array
   */
  getSafetyScanList = () => {
    const safetyScanList = _.map(SAFETY_SCAN_LIST, (val, i) => {
      return <MenuItem key={i} value={val.value}>{val.name}</MenuItem>
    });
    return safetyScanList;
  }  
  /**
   * Handle Safety Scan list change
   * @method
   * @param {object} event - event object
   */
  safetyScanChange = (event) => {
    const {hmdSearch, safetyScanData} = this.state;
    let tempHmdSearch = {...hmdSearch};
    let tempSafetyScanData = {...safetyScanData};
    tempHmdSearch.status = {};
    tempSafetyScanData.dataContent = null;
    tempSafetyScanData.currentPage = 1;

    this.setState({
      currentHostModule: MODULE_TYPE[event.target.value],
      hmdSearch: tempHmdSearch,
      safetyScanData: tempSafetyScanData,
      safetyScanType: event.target.value,
      hmdEventsData: {},
      hmdLAdata: {}
    }, () => {
      this.getSafetyScanData('vansStatus');
    });
  }
  /**
   * Handle tree selection
   * @param {object} tree - tree data
   * @method
   */
  handleSelectTree = (tree) => {
    const areaUUID = tree.areaUUID;
    let tempFloorPlan = {...this.state.floorPlan};
    tempFloorPlan.currentAreaUUID = areaUUID;
    tempFloorPlan.currentAreaName = tree.areaName;

    this.setState({
      floorPlan: tempFloorPlan,
      selectedTreeID: areaUUID,
      floorMapType: 'selected',
      showLoadingIcon: true
    }, () => {
      this.getAreaData(areaUUID);
    });
  }
  /**
   * Get tree data
   * @method
   * @param {object} tree - tree data
   * @param {number} i - index of the floorPlan tree data
   * @returns TreeView component
   */
  displayTreeView = (tree, i) => {
    const {selectedTreeID, floorMapType} = this.state;
    const defaultExpanded = [tree.areaUUID];
    let defaultSelectedID = '';

    if (i === 0) {
      defaultSelectedID = tree.areaUUID;
    }

    if (floorMapType === 'selected') {
      defaultSelectedID = selectedTreeID;
    }

    return (
      <TreeView
        key={i}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultSelected={defaultSelectedID}
        defaultExpanded={defaultExpanded}
        selected={defaultSelectedID}>
        {tree.areaUUID &&
          <TreeItem
            nodeId={tree.areaUUID}
            label={tree.areaName}
            onLabelClick={this.handleSelectTree.bind(this, tree)}>
            {tree.children.length > 0 &&
              tree.children.map(this.getTreeItem.bind(this, 'click'))
            }
          </TreeItem>
        }
      </TreeView>
    )
  }
  /**
   * Display request sent dialog
   * @method
   * @returns ModalDialog component
   */
  requestSentDialog = () => {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.confirmRequestSent}
    };

    return (
      <ModalDialog
        id='requestSentDialog'
        className='modal-dialog'
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
          <div className='msg'>{t('txt-requestSent')}</div>
      </ModalDialog>
    )
  }
  /**
   * Confirm request sent
   * @method
   */
  confirmRequestSent = () => {
    this.setState({
      requestSentOpen: false
    });
  }
  /**
   * Display FR-MOTP dialog content
   * @method
   * @returns HTML DOM
   */
  displayfrMotpContent = () => {
    const {frMotp, formValidation} = this.state;

    return (
      <div>
        <div className='desc-text' style={{marginBottom: '15px'}}>{t('host.txt-frMotpMsg')}</div>
        <TextField
          name='frMotp'
          label={t('txt-verificationCode')}
          variant='outlined'
          fullWidth={true}
          size='small'
          required
          error={!formValidation.frMotp.valid}
          helperText={formValidation.frMotp.valid ? '' : t('txt-required')}
          value={frMotp}
          onChange={this.handleDataChange} />
      </div>
    )
  }
  /**
   * Display FR-MOTP dialog
   * @method
   * @returns ModalDialog component
   */
  frMotpDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleFrMotp.bind(this, '', 'close')},
      confirm: {text: t('txt-confirm'), handler: this.confirmFrMotp}
    };

    return (
      <ModalDialog
        id='frMotpDialog'
        className='modal-dialog'
        title='FR-MOTP'
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayfrMotpContent()}
      </ModalDialog>
    )
  }
  /**
   * Confirm FR-MOTP
   * @method
   */
  confirmFrMotp = () => {
    const {baseUrl, session} = this.context;
    const {frMotp, vansPatch, formValidation} = this.state;
    const url = `${baseUrl}/api/frmotp/_verify`;
    const requestData = {
      otp: frMotp,
      accountId: session.accountId,
    };
    let tempFormValidation = {...formValidation};
    let validate = true;

    if (frMotp) {
      tempFormValidation.frMotp.valid = true;
    } else {
      tempFormValidation.frMotp.valid = false;
      validate = false;
    }

    this.setState({
      formValidation: tempFormValidation
    });

    if (!validate) {
      return;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.confirmVansPatch(vansPatch);
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {contextRoot, language, session, sessionRights} = this.context;
    const {
      activeTab,
      activeSafetyTab,
      activeContent,
      showLeftNav,
      showFilter,
      openQueryOpen,
      saveQueryOpen,
      uploadHmdFileOpen,
      uploadCpeFileOpen,
      importCsvOpen,
      trackHostListOpen,
      importFilterType,
      LAconfig,
      assessmentDatetime,
      requestSentOpen,
      frMotpOpen,
      vansPatchOpen,
      vansPatchGroupOpen,
      vansPatchDetailsOpen,
      vansPatchSelectedOpen,
      yaraRuleOpen,
      hostAnalysisOpen,
      safetyDetailsOpen,
      hostDeviceOpen,
      reportNCCSTopen,
      vansPieChartOpen,
      showSafetyTab,
      contextAnchor,
      menuType,
      hostCreateTime,
      vansDeviceStatusList,
      vansHmdStatusList,
      netProxyTree,
      privateMaskedIPtree,
      departmentList,
      leftNavData,
      filterNav,
      hmdSearch,
      activeVansPatch,
      hostInfo,
      hostData,
      hostSort,
      safetyScanData,
      hmdEventsData,
      hmdLAdata,
      floorList,
      currentFloor,
      currentMap,
      currentBaseLayers,
      deviceSeatData,
      eventInfo,
      openHmdType,
      currentSafetyData,
      safetyScanType,
      fromSafetyPage,
      vansChartsData,
      vansData,
      vansTableType,
      vansPieChartData,
      patchInfo,
      limitedDepartment,
      floorPlan,
      showLoadingIcon
    } = this.state;
    const assetsPath = `${contextRoot}/lib/keylines/assets/`;
    let adminPrivilege = false;

    if (sessionRights.Module_Config) {
      adminPrivilege = true;
    }

    return (
      <div>
        {openQueryOpen &&
          this.queryDialog()
        }

        {saveQueryOpen &&
          this.queryDialog()
        }

        {uploadHmdFileOpen &&
          this.uploadHmdFileDialog()
        }

        {trackHostListOpen &&
          this.trackHostListDialog()
        }

        {importCsvOpen &&
          <ImportFile
            importFilterType={importFilterType}
            toggleCsvImport={this.toggleCsvImport}
            confirmCsvImport={this.confirmCsvImport} />
        }

        {vansPatchGroupOpen &&
          <VansPatchGroup
            limitedDepartment={limitedDepartment}
            toggleVansPatchGroup={this.toggleVansPatchGroup}
            toggleVansPatchDetails={this.toggleVansPatchDetails} />
        }

        {vansPatchDetailsOpen &&
          <VansPatchDetails
            activeVansPatch={activeVansPatch}
            toggleVansPatchDetails={this.toggleVansPatchDetails}
            toggleVansPatchSelected={this.toggleVansPatchSelected} />
        }

        {vansPatchSelectedOpen &&
          this.vansPatchSelectedDialog()
        }

        {vansPatchOpen &&
          <VansPatch
            patchInfo={patchInfo}
            toggleVansPatch={this.toggleVansPatch}
            toggleFrMotp={this.toggleFrMotp} />
        }

        {requestSentOpen &&
          this.requestSentDialog()
        }

        {frMotpOpen &&
          this.frMotpDialog()
        }

        {yaraRuleOpen &&
          <YaraRule
            toggleYaraRule={this.toggleYaraRule}
            checkYaraRule={this.checkYaraRule} />
        }

        {hostAnalysisOpen &&
          <HostAnalysis
            activeTab={activeTab}
            assessmentDatetime={assessmentDatetime}
            hostCreateTime={hostCreateTime}
            hostData={hostData}
            eventInfo={eventInfo}
            openHmdType={openHmdType}
            vansDeviceStatusList={vansDeviceStatusList}
            getIPdeviceInfo={this.getIPdeviceInfo}
            loadEventTracing={this.loadEventTracing}
            toggleHostAnalysis={this.toggleHostAnalysis}
            toggleSafetyDetails={this.toggleSafetyDetails}
            getHostInfo={this.getHostInfo}
            getVansStatus={this.getVansStatus} />
        }

        {safetyDetailsOpen &&
          <SafetyDetails
            currentSafetyData={currentSafetyData}
            safetyScanType={safetyScanType}
            showSafetyTab={showSafetyTab}
            fromSafetyPage={fromSafetyPage}
            vansHmdStatusList={vansHmdStatusList}
            getIPdeviceInfo={this.getIPdeviceInfo}
            getSafetyScanData={this.getSafetyScanData}
            toggleSafetyDetails={this.toggleSafetyDetails}
            getHostInfo={this.getHostInfo}
            getVansStatus={this.getVansStatus} />
        }

        {hostDeviceOpen &&
          this.showHostDeviceList()
        }

        {reportNCCSTopen &&
          this.showNCCSTlist()
        }

        {uploadCpeFileOpen &&
          this.uploadCpeFileDialog()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button variant='outlined' color='primary'><Link to='/SCP/host/cpe'>{t('host.txt-cpePage')}</Link></Button>
            <Button variant='outlined' color='primary' className={cx({'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></Button>
            <Button variant='outlined' color='primary' onClick={this.exportSecurityDiagnostic} title={t('txt-exportSecurityDiagnostic')}><i className='fg fg-file-csv'></i></Button>
            <Button variant='outlined' color='primary' onClick={this.getCSVfile.bind(this, 'default')} title={t('txt-exportCSV')}><i className='fg fg-file-csv'></i></Button>
            <Button variant='outlined' color='primary' className='last' onClick={this.getPDFfile} title={t('txt-exportPDF')}><PictureAsPdfOutlinedIcon /></Button>
          </div>
        </div>

        <div className='data-content'>
          <div className={cx('left-nav tree', {'collapse': !showLeftNav})}>
            <div className='content'>
              {leftNavData.map(this.showLeftNavItems)}
              <div>
                <label className={cx('header-text', {'hide': !showLeftNav})}>{t('ownerFields.department')}</label>
                {!departmentList &&
                  <div className='left-nav-group'><span className='loading no-padding'><i className='fg fg-loading-2'></i></span></div>
                }
                {departmentList && departmentList.length === 0 &&
                  <div className='left-nav-group'><span>{t('txt-notFound')}</span></div>
                }
                {departmentList && departmentList.length > 0 &&
                  <TreeView
                    className='tree-view'
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}>
                    {departmentList.map(this.getDepartmentTreeItem)}
                  </TreeView>
                }
              </div>
              <div>
                <label className={cx('header-text', {'hide': !showLeftNav})}>NetProxy</label>
                {!netProxyTree.children &&
                  <div className='left-nav-group'><span className='loading no-padding'><i className='fg fg-loading-2'></i></span></div>
                }
                {netProxyTree.children && netProxyTree.children.length === 0 &&
                  <div className='left-nav-group'><span>{t('txt-notFound')}</span></div>
                }
                {netProxyTree.children && netProxyTree.children.length > 0 &&
                  <TreeView
                    className='tree-view'
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    defaultExpanded={['All']}>
                    {!_.isEmpty(netProxyTree) &&
                      <TreeItem
                        nodeId={netProxyTree.id}
                        label={netProxyTree.label}>
                        {netProxyTree.children.length > 0 &&
                          netProxyTree.children.map(this.getTreeItem.bind(this, ''))
                        }
                      </TreeItem>
                    }
                  </TreeView>
                }
              </div>
              <div>
                <label className={cx('header-text', {'hide': !showLeftNav})}>{t('alert.txt-privateMaskedIp')}</label>
                {!privateMaskedIPtree.children &&
                  <div className='left-nav-group'><span className='loading no-padding'><i className='fg fg-loading-2'></i></span></div>
                }
                {privateMaskedIPtree.children && privateMaskedIPtree.children.length === 0 &&
                  <div className='left-nav-group'><span>{t('txt-notFound')}</span></div>
                }
                {privateMaskedIPtree.children && privateMaskedIPtree.children.length > 0 &&
                  <TreeView
                    className='tree-view'
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    defaultExpanded={['All']}>
                    {!_.isEmpty(privateMaskedIPtree) &&
                      <TreeItem
                        nodeId={privateMaskedIPtree.id}
                        label={privateMaskedIPtree.label}>
                        {privateMaskedIPtree.children.length > 0 &&
                          privateMaskedIPtree.children.map(this.getTreeItem.bind(this, ''))
                        }
                      </TreeItem>
                    }
                  </TreeView>
                }
              </div>
            </div>
            <div className='expand-collapse' onClick={this.toggleLeftNav}>
              <i className={`fg fg-arrow-${showLeftNav ? 'left' : 'right'}`}></i>
            </div>
          </div>

          {activeContent === 'hostContent' &&
            <div className='parent-content'>
              {this.renderFilter()}

              <div className='host-list'>
                <header>{t('host.txt-hostList2')}</header>
                {hostInfo.totalCount > 0 &&
                  <div>
                    <span>{t('txt-total')}: {helper.numberWithCommas(hostInfo.totalCount)}</span>
                    <span>{t('host.txt-hostCreateTime')}: {hostCreateTime}</span>
                  </div>
                }
                {activeTab === 'hostList' &&
                  <div className='sort-section'>
                    <TextField
                      id='hostSortList'
                      name='hostSort'
                      label={t('txt-sort')}
                      select
                      variant='outlined'
                      fullWidth
                      size='small'
                      value={hostSort}
                      onChange={this.handleHostSortChange}>
                      {this.getHostSortList()}
                    </TextField>
                  </div>
                }
              </div>
              <div className='main-content host'>
                <Tabs
                  indicatorColor='primary'
                  textColor='primary'
                  value={activeTab}
                  onChange={this.handleSubTabChange}>
                  <Tab label={t('host.txt-hostList')} value='hostList' />
                  <Tab label={t('host.txt-deviceMap')} value='deviceMap' />
                  <Tab label={t('host.txt-safetyScan')} value='safetyScan' />
                  <Tab label={t('host.txt-vans')} value='vansCharts' />
                </Tabs>

                {activeTab !== 'vansCharts' &&
                  <div className={cx('content-header-btns', {'with-menu': activeTab === 'deviceList'})}>
                    <Button variant='outlined' color='primary' className='standard btn' onClick={this.handleOpenMenu.bind(this, 'hmdTriggerAll')}>{t('hmd-scan.txt-triggerAll')}</Button>
                    <Button variant='outlined' color='primary' className='standard btn' onClick={this.handleOpenMenu.bind(this, 'safetyScan')}>{t('host.txt-safetyScan')}</Button>
                    {adminPrivilege &&
                      <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleContent.bind(this, 'hmdSettings')}>{t('hmd-scan.txt-hmdSettings')}</Button>
                    }
                    <Button variant='outlined' color='primary' className='standard btn' onClick={this.handleOpenMenu.bind(this, 'hmdDownload')}>{t('hmd-scan.txt-hmdDownload')}</Button>
                    <Button variant='outlined' color='primary' className='standard btn' onClick={this.toggleHmdUploadFile}>{t('hmd-scan.txt-uploadHMDfile')}</Button>
                  </div>
                }

                <Menu
                  anchorEl={contextAnchor}
                  className='trigger-menu hmd'
                  keepMounted
                  open={menuType === 'hmdTriggerAll' && Boolean(contextAnchor)}
                  onClose={this.handleCloseMenu}>
                  {HMD_TRIGGER.map(this.getHMDmenu)}
                </Menu>

                <Menu
                  anchorEl={contextAnchor}
                  className='trigger-menu safety'
                  keepMounted
                  open={menuType === 'safetyScan' && Boolean(contextAnchor)}
                  onClose={this.handleCloseMenu}>
                  {SAFETY_SCAN_MENU.map(this.getSafetyScanMenu)}
                </Menu>

                <Menu
                  anchorEl={contextAnchor}
                  keepMounted
                  open={menuType === 'hmdDownload' && Boolean(contextAnchor)}
                  onClose={this.handleCloseMenu}>
                  <MenuItem onClick={this.hmdDownload.bind(this, 'windows')}>Windows</MenuItem>
                  <MenuItem onClick={this.hmdDownload.bind(this, 'linux')}>Linux</MenuItem>
                </Menu>

                {activeTab === 'hostList' &&
                  <div className='table-content'>
                    <div className='table' style={{height: '64vh'}}>
                      {!hostInfo.dataContent &&
                        <span className='loading'><i className='fg fg-loading-2'></i></span>
                      }
                      {hostInfo.dataContent && hostInfo.dataContent.length > 0 &&
                        <ul className='host-list'>
                          {hostInfo.dataContent.map(this.getHostList)}
                        </ul>
                      }
                    </div>
                    <footer>
                      <Pagination
                        totalCount={hostInfo.totalCount}
                        pageSize={hostInfo.pageSize}
                        currentPage={hostInfo.currentPage}
                        onPageChange={this.handlePaginationChange.bind(this, 'hostInfo', 'currentPage')}
                        onDropDownChange={this.handlePaginationChange.bind(this, 'hostInfo', 'pageSize')} />
                    </footer>
                  </div>
                }

                {activeTab === 'deviceMap' &&
                  <div className='inventory-map host'>
                    <div className='tree'>
                      {floorPlan.treeData && floorPlan.treeData.length > 0 &&
                        floorPlan.treeData.map(this.displayTreeView)
                      }
                    </div>
                    <div className='map'>
                      {showLoadingIcon &&
                        <span className='loading'><i className='fg fg-loading-2'></i></span>
                      }
                      {currentMap && !showLoadingIcon &&
                        <Gis
                          className='floor-map-area'
                          _ref={(ref) => {this.gisNode = ref}}
                          data={_.get(deviceSeatData, [currentFloor, 'data'])}
                          baseLayers={currentBaseLayers}
                          baseLayer={currentFloor}
                          layouts={['standard']}
                          dragModes={['pan']}
                          scale={{enabled: false}}
                          mapOptions={{
                            maxZoom: 2
                          }}
                          onClick={this.handleFloorMapClick}
                          symbolOptions={[{
                            match: {
                              data: {tag: 'red'}
                            },
                            props: {
                              backgroundColor: 'red'
                            }
                          }]} />
                      }
                    </div>
                  </div>
                }

                {activeTab === 'safetyScan' &&
                  <div>
                    <TextField
                      className='safety-scan-type'
                      name='safetyScanType'
                      label={t('host.txt-safetyScanType')}
                      select
                      variant='outlined'
                      size='small'
                      value={safetyScanType}
                      onChange={this.safetyScanChange}>
                      {this.getSafetyScanList()}
                    </TextField>
                    <Autocomplete
                      className='combo-box'
                      options={vansHmdStatusList}
                      value={hmdSearch.status}
                      getOptionLabel={(option) => option.text}
                      renderInput={this.renderStatusList}
                      onChange={this.handleComboBoxChange} />
                    <TextareaAutosize
                      className='textarea-autosize search-annotation'
                      name='annotation'
                      placeholder={t('host.txt-annotation')}
                      value={hmdSearch.annotation}
                      onChange={this.handleHmdSearch} />
                    <Button variant='contained' color='primary' className='btn filter-btn' onClick={this.handleSearchSubmit}>{t('txt-filter')}</Button>
                    <Button variant='outlined' color='primary' className='standard btn clear-btn' onClick={this.clearHmdFilter}>{t('txt-clear')}</Button>

                    {/*<div className='options-btns'>
                      <ToggleButtonGroup
                        id='hmdSafetyContentBtn'
                        value={activeSafetyTab}
                        exclusive
                        onChange={this.toggleSfetyContent}>
                        <ToggleButton id='hmdSafetyList' value='list'>{t('txt-table')}</ToggleButton>
                        <ToggleButton id='hmdSafetyLA' value='la'>{t('txt-linkAnalysis')}</ToggleButton>
                      </ToggleButtonGroup>
                    </div>*/}

                    {activeSafetyTab === 'list' &&
                      <div className='table-content'>
                        <div className='table' style={{height: '57vh'}}>
                          {!safetyScanData.dataContent &&
                            <span className='loading'><i className='fg fg-loading-2'></i></span>
                          }
                          {safetyScanData.dataContent && safetyScanData.dataContent.length > 0 &&
                            <ul className='safety-list'>
                              {safetyScanData.dataContent.map(this.getSafetyList)}
                            </ul>
                          }
                        </div>
                        <footer>
                          <Pagination
                            totalCount={safetyScanData.totalCount}
                            pageSize={safetyScanData.pageSize}
                            currentPage={safetyScanData.currentPage}
                            onPageChange={this.handlePaginationChange.bind(this, 'safetyScanData', 'currentPage')}
                            onDropDownChange={this.handlePaginationChange.bind(this, 'safetyScanData', 'pageSize')} />
                        </footer>
                      </div>
                    }

                    {activeSafetyTab === 'la' &&
                      <React.Fragment>
                        <div className='la-content' style={{height: '56vh'}}>
                          <VbdaLA
                            assetsPath={assetsPath}
                            sourceCfg={LAconfig}
                            events={hmdEventsData}
                            source={hmdLAdata}
                            sourceItemOptions={LAconfig.la}
                            lng={language} />
                        </div>
                        <footer>
                          <Pagination
                            totalCount={safetyScanData.totalCount}
                            pageSize={safetyScanData.pageSize}
                            currentPage={safetyScanData.currentPage}
                            onPageChange={this.handlePaginationChange.bind(this, 'safetyScanData', 'currentPage')}
                            onDropDownChange={this.handlePaginationChange.bind(this, 'safetyScanData', 'pageSize')} />
                        </footer>
                      </React.Fragment>
                    }
                  </div>
                }

                {activeTab === 'vansCharts' &&
                  <React.Fragment>
                    {vansPieChartOpen &&
                      <VansPieChart
                        vansDataType={VANS_DATA}
                        vansPieChartData={vansPieChartData}
                        togglePieChart={this.togglePieChart} />
                    }

                    <div className='host-table'>
                      <VansCharts
                        vansChartsData={vansChartsData}
                        vansTableType={vansTableType}
                        setVansDeviceData={this.setVansDeviceData}
                        clearVansData={this.clearVansData}
                        togglePieChart={this.togglePieChart}
                        getCSVfile={this.getCSVfile} />
                    </div>

                    {vansData.devs && vansData.devs.length > 0 &&
                      <div className='host-table'>
                        <VansDevice
                          vansChartsData={vansChartsData}
                          vansData={vansData}
                          getIPdeviceInfo={this.getIPdeviceInfo}
                          togglePieChart={this.togglePieChart}
                          getCSVfile={this.getCSVfile} />
                      </div>
                    }
                  </React.Fragment>
                }
              </div>
            </div>
          }

          {activeContent === 'hmdSettings' &&
            <HMDsettings />
          }
        </div>
      </div>
    )
  }
}

HostController.contextType = BaseDataContext;

HostController.propTypes = {
};

export default withRouter(HostController);