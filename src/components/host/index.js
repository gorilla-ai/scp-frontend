import React, {Component} from 'react'
import {withRouter} from 'react-router'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import CheckboxGroup from 'react-ui/build/src/components/checkbox-group'
import ContextMenu from 'react-ui/build/src/components/contextmenu'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Tabs from 'react-ui/build/src/components/tabs'

import {BaseDataContext} from '../common/context';
import FilterContent from '../common/filter-content'
import helper from '../common/helper'
import Pagination from '../common/pagination'
import SearchOptions from '../common/search-options'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

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
      datetime: {
        from: helper.getSubstractDate(1, 'hour'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
      },
      hmdList: [],
      filterNav: {
        hmdSelected: []
      },
      subTabMenu: {
        table: t('host.txt-hostList'),
        statistics: t('host.txt-deviceMap')
      },
      filterData: [{
        condition: 'ip',
        query: ''
      }],
      hostInfo: {
        dataContent: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getHMDlist();
    this.getHostData();
  }
  ryan = () => {

  }
  getHMDlist = () => {
    const hmdList = [
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

    this.setState({
      hmdList
    });
  }
  /**
   * Get and set host info data
   * @method
   */
  getHostData = () => {
    const {baseUrl} = this.context;
    const {datetime, filterNav, filterData, hostInfo} = this.state;
    let url = `${baseUrl}/api/ipdevice/assessment/_search?page=${hostInfo.currentPage}&pageSize=${hostInfo.pageSize}`;
    let requestData = {
      timestamp: [
        Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
        Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
      ]
      //exactIp: '10.0.10.103
    };

    if (filterNav.hmdSelected.length > 0) {
      requestData.isHmd = true;

      _.forEach(filterNav.hmdSelected, val => {
        requestData[val] = true;
      })
    }

    if (filterData.length > 0) {
      _.forEach(filterData, val => {
        if (val.query) {
          requestData[val.condition] = val.query.trim();
        }
      })
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempHostInfo = {...hostInfo};
        tempHostInfo.dataContent = data.rows;
        tempHostInfo.totalCount = data.counts;

        this.setState({
          hostInfo: tempHostInfo
        });

        if (data.counts === 0) {
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
   * Set new datetime and reload page data
   * @method
   * @param {object} datetime - new datetime object
   */
  handleDateChange = (datetime) => {
    this.setState({
      datetime
    });
  }
  /**
   * Set filter data
   * @method
   * @param {array.<object>} filterData - filter data to be set
   */
  setFilterData = (filterData) => {
    this.setState({
      filterData
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
   * Handle Host filter reset
   * @method
   */
  handleResetBtn = () => {
    const filterData = [{
      condition: 'ip',
      query: ''
    }];

    this.setState({
      filterData
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
    if (dataInfo[val.path]) {
      return <li key={i} className={cx({'first': val.name === 'hostName'})} title={t('ipFields.' + val.name)}><i className={`fg fg-${val.icon}`}></i>{dataInfo[val.path]}</li>
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
    const infoList = [
      {
        name: 'hostName',
        path: 'hostName',
        icon: 'id-card'
      },
      {
        name: 'mac',
        path: 'mac',
        icon: 'database'
      },
      {
        name: 'system',
        path: 'system',
        icon: 'coupon'
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
    let safetyScanInfo = '';
    let safetyData = false;
    let severityType = '';
    let severityCount = 0;

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

    return (
      <li key={i}>
        <div className='device'>
          <i className='fg fg-network'></i>
        </div>
        <div className='info'>
          <header>{val.ip}</header>
          <ul>
            {infoList.map(this.getInfoList.bind(this, val))}
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
        <div className='details'>
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
  /**
   * Handle Host data filter change
   * @method
   * @param {string} type - filter type ('hmdSelected')
   * @param {array} value - selected hmd array
   */
  handleFilterNavChange = (type, value) => {
    let tempFilterNav = {...this.state.filterNav};
    
    if (type === 'hmdSelected') {
      tempFilterNav[type] = value;
    }

    this.setState({
      filterNav: tempFilterNav
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
      hmdList,
      filterNav,
      filterData,
      hostInfo
    } = this.state;
    let filterDataCount = 0;

    _.forEach(filterData, val => {
      if (val.query) {
        filterDataCount++;
      }
    })  

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i><span>({filterDataCount})</span></button>
          </div>

          <SearchOptions
            datetime={datetime}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.handleSearchSubmit} />
        </div>

        <div className='data-content'>
          <div className={cx('left-nav tree', {'collapse': !showLeftNav})}>
            <div className='content'>
              <div>
                <label className={cx('header-text', {'hide': !showLeftNav})}>HMD</label>
                <CheckboxGroup
                  list={hmdList}
                  value={filterNav.hmdSelected}
                  onChange={this.handleFilterNavChange.bind(this, 'hmdSelected')} />
              </div>
            </div>
            <div className='expand-collapse' onClick={this.toggleLeftNav}>
              <i className={`fg fg-arrow-${showLeftNav ? 'left' : 'right'}`}></i>
            </div>
          </div>

          <div className='parent-content'>
            <FilterContent
              activeTab='host'
              showFilter={showFilter}
              filterData={filterData}
              setFilterData={this.setFilterData}
              toggleFilter={this.toggleFilter}
              handleSearchSubmit={this.handleSearchSubmit}
              handleResetBtn={this.handleResetBtn} />
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
                  <div className='table'>
                    <ul className='host-list'>
                      {hostInfo.dataContent.length > 0 &&
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

export default withRouter(HostController);