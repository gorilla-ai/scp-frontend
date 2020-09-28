import React, {Component} from 'react'
import {withRouter} from 'react-router'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import CheckboxGroup from 'react-ui/build/src/components/checkbox-group'
import ContextMenu from 'react-ui/build/src/components/contextmenu'
import DropDownList from 'react-ui/build/src/components/dropdown'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Tabs from 'react-ui/build/src/components/tabs'

import {BaseDataContext} from '../common/context';
import helper from '../common/helper'
import HostAnalysis from '../common/host-analysis'
import Pagination from '../common/pagination'
import SearchOptions from '../common/search-options'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};
const SCAN_RESULT = [
{
  name: 'Yara Scan',
  result: 'yaraResult',
  count: 'ScanResultTotalCnt',
},
{
  name: 'Malware',
  result: 'scanFileResult',
  count: 'DetectionResultTotalCnt'
},
{
  name: 'GCB',
  result: 'gcbResult',
  count: 'GCBResultTotalCnt',
  pass: 'GCBResultPassCnt'
},
{
  name: 'File Integrity',
  result: 'fileIntegrityResult',
  count: 'getFileIntegrityTotalCnt'
}];
const HMD_LIST = [
  {
    value: 'isScanProc',
    text: 'Yara Scan'
  },
  {
    value: 'isScanFile',
    text: 'Malware'
  },
  {
    value: 'isGCB',
    text: 'GCB'
  },
  {
    value: 'isFileIntegrity',
    text: 'File Integrity'
  },
  {
    value: 'isProcessMonitor',
    text: 'Process Monitor'
  },
  {
    value: 'isIR',
    text: 'IR'
  }
];
const HMD_STATUS_LIST = [
  {
    value: 'notHmd',
    text: 'Not Installed'
  },
  {
    value: 'isLatestVersion',
    text: 'Latest Version'
  },
  {
    value: 'isOldVersion',
    text: 'Old Version'
  },
  {
    value: 'isOwnerNull',
    text: 'No Owner'
  },
  {
    value: 'isAreaNull',
    text: 'No Area'
  },
  {
    value: 'isSeatNull',
    text: 'No Seat'
  }
];
const HOST_SORT_LIST = [
  {
    name: 'ip',
    type: 'asc'
  },
  {
    name: 'ip',
    type: 'desc'
  },
  {
    name: 'mac',
    type: 'asc'
  },
  {
    name: 'mac',
    type: 'desc'
  },
  {
    name: 'hostName',
    type: 'asc'
  },
  {
    name: 'hostName',
    type: 'desc'
  },
  {
    name: 'system',
    type: 'asc'
  },
  {
    name: 'system',
    type: 'desc'
  }
];

let t = null;
let f = null;

/**
 * Host
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to handle the business logic for the threats page
 */
class HostController extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      activeSubTab: 'hostList', //'hostList', 'deviceMap'
      showFilter: false,
      showLeftNav: true,
      datetime: helper.getSubstractDate(1, 'day', Moment().local().format('YYYY-MM-DD') + 'T00:00:00'),
      hostAnalysisOpen: false,
      severityList: [],
      privateMaskedIPlist: [],
      filterNav: {
        severitySelected: [],
        hmdSelected: [],
        hmdStatusSelected: [],
        maskedIPSelected: []
      },
      deviceSearch: {
        ip: '',
        mac: '',
        hostName: '',
        deviceType: '',
        system: ''
      },
      subTabMenu: {
        table: t('host.txt-hostList'),
        statistics: t('host.txt-deviceMap')
      },
      hostInfo: {
        dataContent: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      hostData: {},
      hostSortList: [],
      hostSort: 'ip-asc',
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getHostSortList();
    this.getHostData();
  }
  ryan = () => {

  }
  /**
   * Get and set host sort list
   * @method
   */
  getHostSortList = () => {
    const hostSortList = _.map(HOST_SORT_LIST, val => {
      return {
        value: val.name + '-' + val.type,
        text: t('ipFields.' + val.name) + ' - ' + t('txt-' + val.type)
      }
    });

    this.setState({
      hostSortList
    });
  }
  /**
   * Get formatted datetime
   * @method
   * @returns formatted datetime object
   */
  getHostDateTime = () => {
    const {datetime} = this.state;

    return {
      //from: '2020-09-25T16:00:00Z',
      //to: '2020-09-26T16:00:00Z'
      from: Moment(datetime).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: Moment(helper.getAdditionDate(1, 'day', datetime)).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    }
  }
  /**
   * Get and set host info data
   * @method
   */
  getHostData = () => {
    const {baseUrl} = this.context;
    const {filterNav, deviceSearch, hostInfo, hostSort} = this.state;
    const hostSortArr = hostSort.split('-');
    const url = `${baseUrl}/api/ipdevice/assessment/_search?page=${hostInfo.currentPage}&pageSize=${hostInfo.pageSize}&orders=${hostSortArr[0]} ${hostSortArr[1]}`;
    const datetime = this.getHostDateTime('default');
    let requestData = {
      timestamp: [datetime.from, datetime.to]
    };

    if (filterNav.severitySelected.length > 0) {
      requestData.severityLevel = filterNav.severitySelected;
    }

    if (filterNav.hmdSelected.length > 0) {
      requestData.scanInfo = filterNav.hmdSelected;
    }

    if (filterNav.hmdStatusSelected.length > 0) {
      requestData.devInfo = filterNav.hmdStatusSelected;
    }

    if (filterNav.maskedIPSelected.length > 0) {
      requestData.maskedIp = filterNav.maskedIPSelected;
    }

    if (deviceSearch.ip) {
      requestData.ip = deviceSearch.ip;
    }

    if (deviceSearch.mac) {
      requestData.mac = deviceSearch.mac;
    }

    if (deviceSearch.hostName) {
      requestData.hostName = deviceSearch.hostName;
    }

    if (deviceSearch.deviceType) {
      requestData.deviceType = deviceSearch.deviceType;
    }

    if (deviceSearch.system) {
      requestData.system = deviceSearch.system;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let severityList = [];
        let privateMaskedIPlist = [];
        let tempHostInfo = {...hostInfo};
        tempHostInfo.dataContent = data.rows;
        tempHostInfo.totalCount = data.count;

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

        _.forEach(data.InternalMaskedIpWithDevCount, val => {
          if (val.key) {
            privateMaskedIPlist.push({
              value: val.key,
              text: val.key + ' (' + helper.numberWithCommas(val.doc_count) + ')'
            });
          }
        });

        this.setState({
          severityList,
          privateMaskedIPlist,
          hostInfo: tempHostInfo
        });

        if (data.count === 0) {
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
   */
  toggleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter
    });
  }
  /**
   * Set new datetime
   * @method
   * @param {object} datetime - new datetime object
   */
  handleDateChange = (datetime) => {
    this.setState({
      datetime
    });
  }
  /**
   * Handle Host sort change
   * @method
   * @param {string} val - new sort value
   */
  handleHostSortChange = (val) => {
    this.setState({
      hostSort: val
    }, () => {
      this.getHostData();
    });
  }
  /**
   * Handle search submit
   * @method
   */
  handleSearchSubmit = () => {
    let tempHostInfo = {...this.state.hostInfo};
    tempHostInfo.dataContent = [];
    tempHostInfo.totalCount = 0;
    tempHostInfo.currentPage = 1;

    this.setState({
      hostInfo: tempHostInfo
    }, () => {
      this.getHostData();
    });
  }
  /**
   * Handle content tab change
   * @method
   * @param {string} type - content type ('hostList' or 'deviceMap')
   */
  handleSubTabChange = (type) => {
    this.setState({
      activeSubTab: type
    });
  }
  /**
   * Handle Host data filter change
   * @method
   * @param {string} type - filter type ('severitySelected', hmdSelected', 'maskedIPSelected')
   * @param {array} value - selected hmd array
   */
  handleFilterNavChange = (type, value) => {
    let tempFilterNav = {...this.state.filterNav};
    tempFilterNav[type] = value;

    this.setState({
      filterNav: tempFilterNav
    }, () => {
      this.getHostData();
    });
  }
  /**
   * Handle filter input value change
   * @method
   * @param {string} type - input type
   * @param {object} event - input value
   */
  handleDeviceSearch = (type, event) => {
    let tempDeviceSearch = {...this.state.deviceSearch};
    tempDeviceSearch[type] = event.target.value.trim();

    this.setState({
      deviceSearch: tempDeviceSearch
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, deviceSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='deviceSearchIP'>{t('ipFields.ip')}</label>
            <input
              id='deviceSearchIP'
              type='text'
              value={deviceSearch.ip}
              onChange={this.handleDeviceSearch.bind(this, 'ip')} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchMac'>{t('ipFields.mac')}</label>
            <input
              id='deviceSearchMac'
              type='text'
              value={deviceSearch.mac}
              onChange={this.handleDeviceSearch.bind(this, 'mac')} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchHostName'>{t('ipFields.hostName')}</label>
            <input
              id='deviceSearchHostName'
              type='text'
              value={deviceSearch.hostName}
              onChange={this.handleDeviceSearch.bind(this, 'hostName')} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchDeviceType'>{t('ipFields.deviceType')}</label>
            <input
              id='deviceSearchDeviceType'
              type='text'
              value={deviceSearch.deviceType}
              onChange={this.handleDeviceSearch.bind(this, 'deviceType')} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchSystem'>{t('ipFields.system')}</label>
            <input
              id='deviceSearchSystem'
              type='text'
              value={deviceSearch.system}
              onChange={this.handleDeviceSearch.bind(this, 'system')} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.handleSearchSubmit}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      deviceSearch: {
        ip: '',
        mac: '',
        hostName: '',
        deviceType: '',
        system: ''
      }
    });
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
    let safetyData = safetyScanInfo[val.result];

    if (safetyData && safetyData.length > 0) {
      if (safetyData[0][val.count] > 0) {
        if (val.name === 'GCB') {
          return <span key={i}>{val.name} {t('network-inventory.txt-passCount')}/{t('network-inventory.txt-totalItem')}: {safetyData[0][val.pass]}/{safetyData[0][val.count]}</span>
        } else {
          const text = val.name === 'File Integrity' ? t('network-inventory.txt-modifiedFileCount') : t('network-inventory.txt-suspiciousFileCount');
          return <span key={i}>{val.name} {text}: {safetyData[0][val.count]}</span>
        }
      }
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
    const {contextRoot} = this.context;
    let context = '';

    if (dataInfo[val.path]) {
      if (val.path === 'mac') {
        context = <div className={`fg-bg ${val.path}`}></div>;
      } else if (val.path === 'system') {
        const system = dataInfo[val.path].toLowerCase();
        let os = 'windows';

        if (system.indexOf('linux') > -1) {
          os = 'linux';
        } else if (system.indexOf('windows') > -1) {
          os = 'windows';
        }

        context = <div className={`fg-bg ${os}`}></div>;
      } else {
        context = <i className={`fg fg-${val.icon}`}></i>;
      }

      return <li key={i} className={cx({'first': val.first})} title={t('ipFields.' + val.name)}>{context}{dataInfo[val.path]}</li>
    }
  }
  /**
   * Get IP device data info
   * @method
   * @param {object} host - active Host data
   */
  getIPdeviceInfo = (host) => {
    const {baseUrl} = this.context;
    const {hostInfo} = this.state;
    const datetime = this.getHostDateTime();
    const url = `${baseUrl}/api/v2/ipdevice?uuid=${host.ipDeviceUUID}&page=1&pageSize=1&startDttm=${datetime.from}&endDttm=${datetime.to}`;

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const activeHostInfo = _.find(hostInfo.dataContent, {ipDeviceUUID: host.ipDeviceUUID});
        let hostData = {
          ...data
        };

        if (activeHostInfo.networkBehaviorInfo) {
          hostData.severityLevel = activeHostInfo.networkBehaviorInfo.severityLevel;
        }

        this.setState({
          hostData
        }, () => {
          this.toggleHostAnalysis();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Toggle Host Analysis dialog on/off
   * @method
   */
  toggleHostAnalysis = () => {
    this.setState({
      hostAnalysisOpen: !this.state.hostAnalysisOpen
    });
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
        icon: 'fg-ppl-face-2'
      },
      {
        name: 'floorName',
        path: 'areaObj.areaFullName',
        icon: 'map'
      }
    ];
    let newInfoList = [];
    let firstItem = false;
    let safetyScanInfo = '';
    let safetyData = false;
    let severityType = '';
    let severityCount = 0;
    let itemHeader = val.ip;

    _.forEach(infoList, val2 => { //Determine the first item in the list
      if (!firstItem && val[val2.path]) {
        firstItem = true; //Upate flag
        newInfoList.push({
          ...val2,
          first: true
        });
      } else {
        newInfoList.push({
          ...val2,
          first: false
        });
      }
    })

    if (val.safetyScanInfo) {
      safetyScanInfo = val.safetyScanInfo;

      _.forEach(SCAN_RESULT, val => { //Check if safety scan data is available
        if (safetyScanInfo[val.result] && safetyScanInfo[val.result].length > 0) {
          if (safetyScanInfo[val.result][0][val.count] > 0) {
            safetyData = true;
            return false;
          }
        }
      })
    }

    if (val.networkBehaviorInfo) {
      severityType = val.networkBehaviorInfo.severityLevel;
      severityCount = helper.numberWithCommas(val.networkBehaviorInfo.doc_count);
    }

    if (val.hostName) {
      itemHeader += ' / ' + val.hostName;
    }

    return (
      <li key={i}>
        <div className='device'>
        </div>
        <div className='info'>
          <header>{itemHeader}</header>
          <ul>
            {newInfoList.map(this.getInfoList.bind(this, val))}
          </ul>

          {safetyData &&
            <div className='sub-item'>
              <header>Safety Scan</header>
              <div className='flex-item'>
                {SCAN_RESULT.map(this.getSafetyScanInfo.bind(this, safetyScanInfo))}
              </div>
            </div>
          }

          {severityType &&
            <div className='sub-item'>
              <div>
                <header>Network Behavior</header>
                <div className='flex-item'>
                  <span style={{backgroundColor: ALERT_LEVEL_COLORS[severityType]}}>{severityType}: {severityCount}</span>
                </div>
              </div>
            </div>
          }
        </div>
        <div className='view-details' onClick={this.getIPdeviceInfo.bind(this, val)}>
          {t('host.txt-viewInfo')}
        </div>
      </li>
    )
  }
  /**
   * Handle Host data pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempHostInfo = {...this.state.hostInfo};
    tempHostInfo[type] = Number(value);

    if (type === 'pageSize') {
      tempHostInfo.currentPage = 1;
    }

    this.setState({
      hostInfo: tempHostInfo
    }, () => {
      this.getHostData();
    });
  }
  render() {
    const {
      activeSubTab,
      showLeftNav,
      showFilter,
      datetime,
      hostAnalysisOpen,
      severityList,
      privateMaskedIPlist,
      filterNav,
      hostInfo,
      hostData,
      hostSortList,
      hostSort
    } = this.state;

    return (
      <div>
        {hostAnalysisOpen &&
          <HostAnalysis
            hostData={hostData}
            getIPdeviceInfo={this.getIPdeviceInfo}
            toggleHostAnalysis={this.toggleHostAnalysis} />
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
          </div>

          <SearchOptions
            dateType='datepicker'
            datetime={datetime}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.handleSearchSubmit} />
        </div>

        <div className='data-content'>
          <div className={cx('left-nav tree', {'collapse': !showLeftNav})}>
            <div className='content'>
              <div>
                <label className={cx('header-text', {'hide': !showLeftNav})}>{t('alert.txt-threatLevel')}</label>
                <CheckboxGroup
                  list={severityList}
                  value={filterNav.severitySelected}
                  onChange={this.handleFilterNavChange.bind(this, 'severitySelected')} />
              </div>
              <div>
                <label className={cx('header-text', {'hide': !showLeftNav})}>HMD Status</label>
                <CheckboxGroup
                  list={HMD_STATUS_LIST}
                  value={filterNav.hmdStatusSelected}
                  onChange={this.handleFilterNavChange.bind(this, 'hmdStatusSelected')} />
              </div>
              <div>
                <label className={cx('header-text', {'hide': !showLeftNav})}>Scan Status</label>
                <CheckboxGroup
                  list={HMD_LIST}
                  value={filterNav.hmdSelected}
                  onChange={this.handleFilterNavChange.bind(this, 'hmdSelected')} />
              </div>
              <div>
                <label className={cx('header-text', {'hide': !showLeftNav})}>{t('alert.txt-privateMaskedIp')}</label>
                <CheckboxGroup
                  list={privateMaskedIPlist}
                  value={filterNav.maskedIPSelected}
                  onChange={this.handleFilterNavChange.bind(this, 'maskedIPSelected')} />
              </div>
            </div>
            <div className='expand-collapse' onClick={this.toggleLeftNav}>
              <i className={`fg fg-arrow-${showLeftNav ? 'left' : 'right'}`}></i>
            </div>
          </div>

          <div className='parent-content'>
            {this.renderFilter()}

            <div className='host-list'>
              <header>{t('host.txt-hostList2')}</header>
              {hostInfo.totalCount > 0 &&
                <span>{t('txt-total')}: {helper.numberWithCommas(hostInfo.totalCount)}</span>
              }
              <div className='sort-section'>
                <span>{t('txt-sort')}</span>
                <DropDownList
                  id='hostSortList'
                  list={hostSortList}
                  required={true}
                  value={hostSort}
                  onChange={this.handleHostSortChange} />
              </div>
            </div>
            <div className='main-content host'>
              <Tabs
                className='subtab-menu'
                menu={{
                  hostList: t('host.txt-hostList'),
                  deviceMap: t('host.txt-deviceMap')
                }}
                current={activeSubTab}
                onChange={this.handleSubTabChange}>
              </Tabs>

              {activeSubTab === 'hostList' &&
                <div className='table-content'>
                  <div className='table' style={{height: '65vh'}}>
                    <ul className='host-list'>
                      {hostInfo.dataContent && hostInfo.dataContent.length > 0 &&
                        hostInfo.dataContent.map(this.getHostList)
                      }
                    </ul>
                  </div>
                  <footer>
                    <Pagination
                      totalCount={hostInfo.totalCount}
                      pageSize={hostInfo.pageSize}
                      currentPage={hostInfo.currentPage}
                      onPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                      onDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
                  </footer>
                </div>
              }

              {activeSubTab === 'deviceMap' &&
                <div className=''>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

HostController.contextType = BaseDataContext;

HostController.propTypes = {
};

export default HostController;