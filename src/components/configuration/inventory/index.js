import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import DataTable from 'react-ui/build/src/components/table'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import Tabs from 'react-ui/build/src/components/tabs'

import {HocConfig as Config} from '../../common/configuration'
import {HocFilterContent as FilterContent} from '../../common/filter-content'
import helper from '../../common/helper'
import {HocPagination as Pagination} from '../../common/pagination'
import {HocPrivateDetails as PrivateDetails} from '../../common/private-details'
import TableContent from '../../common/table-content'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';
const RULES = [
  {
    id: 1,
    path: 'c:/desktop/readme.doc',
    rule: 'rule MatchGoogleUpdateExe'
  },
  {
    id: 2,
    path: 'c:/desktop/test/hello.doc',
    rule: 'rule MatchFacebookUpdate'
  },
  {
    id: 3,
    path: 'c:/desktop/andrew/world.html',
    rule: 'rule MatchNetflix'
  }
];

let t = null;
let f = null;

class NetworkInventory extends Component {
	constructor(props) {
		super(props);

		this.state = {
      activeTab: 'deviceList', //deviceList, deviceMap
      activeContent: 'tableList', //tableList, dataInfo
      showFilter: false,
      showScanInfo: false,
      activeScanType: 'yara', //yara, ir
      activeRule: null,
      deviceSearch: {
        ip: '',
        mac: '',
        hostName: ''
      },
      deviceData: {
        dataFieldsArr: ['ip', 'mac', 'hostName', 'owner', 'location', '_menu_'],
        dataFields: {},
        dataContent: [],
        ipListArr: [],
        ipDeviceUUID: '',
        sort: {
          field: 'ip',
          desc: false
        },
        itemID: '',
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        currentIndex: '',
        currentLength: ''
      },
      currentDeviceData: {},
      alertInfo: {
        srcIp: {}
      }
		};

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
	}
	componentWillMount() {
    this.getDeviceData();
	}
  getDeviceData = (fromSearch) => {
    const {baseUrl} = this.props;
    const {deviceSearch, deviceData} = this.state;
    let dataObj = {
      sort: deviceData.sort.field,
      order: deviceData.sort.desc ? 'desc' : 'asc',
      page: fromSearch === 'search' ? 1 : deviceData.currentPage,
      pageSize: deviceData.pageSize
    };

    if (fromSearch === 'search') {
      if (deviceSearch.ip) {
        dataObj.ip = deviceSearch.ip;
      }

      if (deviceSearch.mac) {
        dataObj.mac = deviceSearch.mac;
      }

      if (deviceSearch.hostName) {
        dataObj.hostName = deviceSearch.hostName;
      }
    }

    this.ah.one({
      url: `${baseUrl}/api/ipdevice/_search`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      let tempDeviceData = {...deviceData};
      tempDeviceData.dataContent = data.rows;
      tempDeviceData.totalCount = data.counts;
      tempDeviceData.currentPage = fromSearch === 'search' ? 1 : deviceData.currentPage;
      tempDeviceData.currentIndex = 0;
      tempDeviceData.currentLength = data.rows.length;

      let dataFields = {};
      deviceData.dataFieldsArr.forEach(tempData => {
        dataFields[tempData] = {
          label: tempData === '_menu_' ? '' : t(`ipFields.${tempData}`),
          sortable: this.checkSortable(tempData),
          formatter: (value, allValue, index) => {
            if (tempData === 'owner') {
              if (allValue.ownerObj) {
                return <span>{allValue.ownerObj.ownerName}</span>;
              } else {
                return <span>{value}</span>;
              }
            } else if (tempData === 'location') {
              if (allValue.areaObj && allValue.seatObj) {
                return <span>{allValue.areaObj.areaName} {allValue.seatObj.seatName}</span>;
              }
            } else if (tempData === '_menu_') {
              return (
                <div className={cx('table-menu inventory', {'active': value})}>
                  <i className='fg fg-eye' onClick={this.openMenu.bind(this, 'view', allValue, index)}></i>
                  <i className='fg fg-chart-kpi' onClick={this.openMenu.bind(this, 'info', allValue, index)}></i>
                  <i className='fg fg-trashcan' onClick={this.openMenu.bind(this, 'delete')}></i>
                </div>
              )
            } else {
              return <span>{value}</span>;
            }
          }
        };
      })

      tempDeviceData.dataFields = dataFields;

      if (!fromSearch) {
        let ipListArr = [];

        _.forEach(data.rows, val => {
          ipListArr.push({
            value: val.ip,
            text: val.ip
          });
        })

        tempDeviceData.ipListArr = ipListArr;
      }

      this.setState({
        deviceData: tempDeviceData
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  checkSortable = (field) => {
    const unSortableFields = ['options', 'owner', '_menu_'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  renderFilter = () => {
    const {showFilter, deviceSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='deviceSearchIP' className='first-label'>{t('ipFields.ip')}</label>
            <Input 
              id='deviceSearchIP'
              className='search-textarea'
              onChange={this.handleDeviceSearch.bind(this, 'ip')}
              value={deviceSearch.ip} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchMac'>{t('ipFields.mac')}</label>
            <Input 
              id='deviceSearchMac'
              className='search-textarea'
              onChange={this.handleDeviceSearch.bind(this, 'mac')}
              value={deviceSearch.mac} />
          </div>
          <div className='group'>
            <label htmlFor='deviceSearchHostname'>{t('ipFields.hostName')}</label>
            <Input 
              id='deviceSearchHostname'
              className='search-textarea'
              onChange={this.handleDeviceSearch.bind(this, 'hostName')}
              value={deviceSearch.hostName} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getDeviceData.bind(this, 'search')}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter.bind(this)}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  openMenu = (type, allValue, index) => {
    if (type === 'view') {
      this.setState({
        activeContent: 'dataInfo',
        currentDeviceData: allValue
      });
    } else if (type === 'info') {
      this.openDetailInfo(index, allValue);
    } else if (type === 'delete') {

    }
  }
  showAlertData = (type) => {
    const {deviceData} = this.state;
    let tempDeviceData = {...deviceData};

    if (type === 'previous') {
      if (deviceData.currentIndex !== 0) {
        tempDeviceData.currentIndex--;
      }
    } else if (type === 'next') {
      if (deviceData.currentLength - deviceData.currentIndex > 1) {
        tempDeviceData.currentIndex++;
      }
    }

    this.setState({
      deviceData: tempDeviceData
    }, () => {
      const {deviceData} = this.state;
      const index = deviceData.currentIndex;
      const allValue = deviceData.dataContent[index];

      this.openDetailInfo(index, allValue);
    });
  }
  openDetailInfo = (index, allValue, evt) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData.currentIndex = Number(index);

    if (allValue.ip) {
      tempDeviceData.itemID = allValue.ip;
    }

    this.setState({
      showScanInfo: true,
      deviceData: tempDeviceData,
      currentDeviceData: allValue
    });
  }
  handleTableSort = (value) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData.sort.field = value.field;
    tempDeviceData.sort.desc = !tempDeviceData.sort.desc;

    this.setState({
      deviceData: tempDeviceData
    }, () => {
      this.getDeviceData();
    });
  }
  handlePageChange = (currentPage) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData.currentPage = currentPage;

    this.setState({
      deviceData: tempDeviceData
    }, () => {
      this.getDeviceData();
    });
  }  
  handlePageDropdown = (pageSize) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData.currentPage = 1;
    tempDeviceData.pageSize = Number(pageSize);

    this.setState({
      deviceData: tempDeviceData
    }, () => {
      this.getDeviceData();
    });
  }
  handleSubTabChange = (type) => {
    this.setState({
      activeTab: type,
      showFilter: false
    });
  }
  toggleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter
    });
  }
  handleRowMouseOver = (id, allValue, evt) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData.dataContent = _.map(tempDeviceData.dataContent, item => {
      return {
        ...item,
        _menu_: allValue.ip === item.ip ? true : false
      }
    });

    this.setState({
      deviceData: tempDeviceData
    });
  }
  toggleScanType = (activeScanType) => {
    this.setState({
      activeScanType
    });
  }
  toggleRule = (i) => {
    const {activeRule} = this.state;
    const rule = activeRule === i ? null : i;

    this.setState({
      activeRule: rule
    });
  }
  toggleAccordion = (type, i) => {
    const {activeRule} = this.state;

    if (type === 'arrow') {
      return activeRule === i ? 'fg fg-arrow-top' : 'fg fg-arrow-bottom';
    } else if (type === 'rule') {
      return activeRule === i ? false : true;
    }
  }
  displayRules = (val, i) => {
    return (
      <div className='group' key={val.id}>
        <div className='path' onClick={this.toggleRule.bind(this, i)}>
          <i className={this.toggleAccordion('arrow', i)}></i>
          <span>{val.path}</span>
        </div>
        <div className={cx('rule', {hide: this.toggleAccordion('rule', i)})}>
          <div className='header'><i className='fg fg-play'></i>規則</div>
          <code>{val.rule}</code>
        </div>
      </div>
    )    
  }
  displayScanInfo = () => {
    const {activeScanType, deviceData, currentDeviceData} = this.state;
    const ip = currentDeviceData.ip ? currentDeviceData.ip : NOT_AVAILABLE;
    const mac = currentDeviceData.mac ? currentDeviceData.mac : NOT_AVAILABLE;
    const hostName = currentDeviceData.hostName ? currentDeviceData.hostName : NOT_AVAILABLE;
    const ownerName = currentDeviceData.ownerObj ? currentDeviceData.ownerObj.ownerName : NOT_AVAILABLE;

    return (
      <div>
        <table className='c-table main-table'>
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
          <div className='c-button-group left'>
            <button className={cx('thumb', {'selected': activeScanType === 'yara'})} onClick={this.toggleScanType.bind(this, 'yara')}>Yara</button>
            <button className={cx('thumb', {'selected': activeScanType === 'ir'})} onClick={this.toggleScanType.bind(this, 'ir')}>IR</button>
          </div>

          <div className='info-content'>
            {activeScanType === 'yara' &&
              <div>
                <div className='info'>
                  <div className='last-update'>最近更新時間: 2019/09/05 11:43</div>
                  <div className='count'>可疑檔案數: 6</div>
                  <button className='btn'>重新檢測</button>
                </div>
                <div className='file-path'>
                  <div className='header'>可疑檔案路徑</div>
                  <div className='list'>
                    {RULES.map(this.displayRules)}
                  </div>
                </div>
              </div>
            }
            {activeScanType === 'ir' &&
              <div>
                <div className='info'>
                  <div className='last-update'>最近更新時間: 2019/10/17 05:26</div>
                  <button className='btn'>重新壓縮</button>
                </div>
                <div className='msg'>
                  <div className=''>IR data has been uploaded to xxx.xx.xx.xx</div>
                </div>
              </div>
            }
          </div>
        </div>

        <div className='pagination'>
          <div className='buttons'>
            <button onClick={this.showAlertData.bind(this, 'previous')} disabled={deviceData.currentIndex === 0}>{t('txt-previous')}</button>
            <button onClick={this.showAlertData.bind(this, 'next')} disabled={deviceData.currentIndex + 1 === deviceData.currentLength}>{t('txt-next')}</button>
          </div>
          <span className='count'>{deviceData.currentIndex + 1} / {deviceData.currentLength}</span>
        </div>
      </div>
    )
  }
  showScanInfo = () => {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeDialog.bind(this, 'scan')}
    };
    const titleText = t('alert.txt-safetyScanInfo');

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
  closeDialog = (type) => {
    if (type === 'scan') {
      this.setState({
        showScanInfo: false,
        currentDeviceData: {}
      });
    }
  }
  clearFilter = () => {
    this.setState({
      deviceSearch: {
        ip: '',
        mac: '',
        hostName: ''
      }
    });
  }
  handleDeviceSearch = (type, value) => {
    const tempDeviceSearch = {...this.state.deviceSearch};
    tempDeviceSearch[type] = value;

    this.setState({
      deviceSearch: tempDeviceSearch
    });
  }
  toggleContent = () => {
    this.setState({
      activeContent: 'tableList'
    });
  }
	render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {activeTab, activeContent, showFilter, showScanInfo, deviceData, currentDeviceData, alertInfo} = this.state;
    const picPath = alertInfo.srcIp.ownerPic ? alertInfo.srcIp.ownerPic : contextRoot + '/images/empty_profile.png';

		return (
      <div>
        {showScanInfo &&
          this.showScanInfo()
        }
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            {activeTab === 'deviceList' && activeContent === 'tableList' &&
              <button onClick={this.toggleFilter} className={cx('last', {'active': showFilter})} title={t('network.connections.txt-toggleFilter')}><i className='fg fg-filter'></i></button>
            }
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          {activeContent === 'tableList' &&
            <div className='data-table'>
              {activeTab === 'deviceList' &&
                this.renderFilter()
              }

              <div className='main-content'>
                <Tabs
                  className='subtab-menu'
                  menu={{
                    deviceList: t('network-inventory.txt-deviceList'),
                    deviceMap: t('network-inventory.txt-deviceMap')
                  }}
                  current={activeTab}
                  onChange={this.handleSubTabChange}>
                </Tabs>

                <button className='standard btn notification'>通知設定</button>
                <button className='standard btn auto-settings'>自動執行設定</button>
                <button className='standard btn manual-settings'>手動新增IP</button>

                {activeTab === 'deviceList' &&
                  <TableContent
                    activeTab='config'
                    dataTableData={deviceData.dataContent}
                    dataTableFields={deviceData.dataFields}
                    dataTableSort={deviceData.sort}
                    paginationTotalCount={deviceData.totalCount}
                    paginationPageSize={deviceData.pageSize}
                    paginationCurrentPage={deviceData.currentPage}
                    currentTableID={deviceData.itemID}
                    tableUniqueID='ip'
                    handleTableSort={this.handleTableSort}
                    handleRowMouseOver={this.handleRowMouseOver}
                    paginationPageChange={this.handlePageChange}
                    paginationDropDownChange={this.handlePageDropdown} />
                }

                {activeTab === 'deviceMap' &&
                  <div>
                    <span>Device Map</span>
                  </div>
                }
              </div>
            </div>
          }

          {activeContent === 'dataInfo' &&
            <div className='data-table'>
              <div className='main-content'>
                <div className='privateIp-info'>
                  <header>IP基本資訊</header>
                  <button className='standard btn edit'>編輯</button>
                  <button className='standard btn list' onClick={this.toggleContent}>返回列表</button>
                  <PrivateDetails
                    type='srcIp'
                    alertInfo={alertInfo}
                    topoInfo={currentDeviceData}
                    picPath={picPath}
                    srcDestType='src' />
                </div>
              </div>
            </div>
          }
        </div>
      </div>
		)
	}
}

NetworkInventory.propTypes = {
	baseUrl: PropTypes.string.isRequired,
	contextRoot: PropTypes.string.isRequired
};

const HocNetworkInventory = withRouter(withLocale(NetworkInventory));
export { NetworkInventory, HocNetworkInventory };