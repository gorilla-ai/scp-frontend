import React, {Component} from 'react'
import {withRouter} from 'react-router'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import ContextMenu from 'react-ui/build/src/components/contextmenu'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Tabs from 'react-ui/build/src/components/tabs'

import {BaseDataContext} from '../common/context';
import helper from '../common/helper'
import Pagination from '../common/pagination'
import SearchOptions from '../common/search-options'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

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
      datetime: {
        from: helper.getSubstractDate(1, 'hour'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
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
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getHostData();
  }
  ryan = () => {

  }
  /**
   * Get and set host info data
   * @method
   */
  getHostData = () => {
    const {baseUrl} = this.context;
    const {datetime, hostInfo} = this.state;
    const url = `${baseUrl}/api/ipdevice/assessment/_search?page=${hostInfo.currentPage}&pageSize=${hostInfo.pageSize}`;
    const requestData = {
      timestamp: [
        Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
        Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
      ]
    };

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
  handleSearchSubmit = () => {

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
   * Display Network Behavior list
   * @method
   * @param {object} val - Network Behavior data
   * @param {number} i - index of the Network Behavior data
   * @returns HTML DOM
   */
  getNetworkBehavior = (val, i) => {
    return <span key={i}>{val.key}: {val.doc_count}</span>
  }
  /**
   * Display host content
   * @method
   * @param {object} val - host data
   * @param {number} i - index of the host data
   * @returns HTML DOM
   */
  getHostList = (val, i) => {
    return (
      <li key={i}>
        <div className='device'>
          <i className='fg fg-network'></i>
        </div>
        <div className='info'>
          <header>{val.hostName}</header>
          <ul>
            {val.ip &&
              <li><i className='fg fg-id-card'></i>{val.ip}</li>
            }
            {val.mac &&
              <li><i className='fg fg-database'></i>{val.mac}</li>
            }
            {val.system &&
              <li><i className='fg fg-coupon'></i>{val.system}</li>
            }
            {val.ownerObj &&
              <li><i className='fg fg-car-1'></i>{val.ownerObj.ownerName}</li>
            }
            {val.areaObj &&
              <li><i className='fg fg-camera'></i>{val.areaObj.areaFullName}</li>
            }
          </ul>
          <div className='sub-item'>
            <header>Safety Scan</header>
            <div className='flex-item'>
              <span>a</span>
              <span>b</span>
              <span>c</span>
            </div>
          </div>
          <div className='sub-item'>
            {val.networkBehaviorInfo && val.networkBehaviorInfo.severityAgg.buckets.length > 0 &&
              <div>
                <header>Network Behavior</header>
                <div className='flex-item'>
                  {val.networkBehaviorInfo.severityAgg.map(this.getNetworkBehavior)}
                </div>
              </div>
            }
          </div>
        </div>
        <div className='details'>
          {t('host.txt-viewInfo')}
        </div>
      </li>
    )
  }
  /**
   * Handle host data pagination change
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
    const {activeSubTab, showLeftNav, datetime, hostInfo} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
          </div>

          <SearchOptions
            datetime={datetime}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.handleSearchSubmit} />
        </div>

        <div className='data-content'>
          <div className={cx('left-nav', {'collapse': !showLeftNav})}>
            <div className='content'>
              Filter
            </div>
            <div className='expand-collapse' onClick={this.toggleLeftNav}>
              <i className={`fg fg-arrow-${showLeftNav ? 'left' : 'right'}`}></i>
            </div>
          </div>

          <div className='parent-content'>
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