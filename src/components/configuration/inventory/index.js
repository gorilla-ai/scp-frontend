import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import DataTable from 'react-ui/build/src/components/table'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import Tabs from 'react-ui/build/src/components/tabs'

import {HocFilterContent as FilterContent} from '../../common/filter-content'
import helper from '../../common/helper'
import {HocPagination as Pagination} from '../../common/pagination'
import {HocConfig as Config} from '../../common/configuration'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';

let t = null;
let f = null;

class NetworkInventory extends Component {
	constructor(props) {
		super(props);

		this.state = {
      activeTab: 'deviceList',
      showFilter: false,
      showScanInfo: false,
      filterData: [{
        condition: 'Must',
        query: ''
      }],
      deviceData: {
        dataFieldsArr: ['ip', 'mac', 'hostName', 'owner', 'system', 'deviceType', '_menu_'],
        dataFields: {},
        dataContent: [],
        ipListArr: [],
        ipDeviceUUID: '',
        sort: {
          field: 'ip',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        currentIndex: '',
        currentLength: ''
      },
      currentDeviceData: {}
      // owner: {
      //   ownerListArr: [],
      //   selectedOwner: ''
      // }
		};

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
	}
	componentWillMount() {
    //this.getOwnerData();
    this.getDeviceData();
	}
  // getOwnerData = () => {
  //   const {baseUrl} = this.props;
  //   const tempOwner = {...this.state.owner};

  //   this.ah.one({
  //     url: `${baseUrl}/api/owner/_search`,
  //     data: JSON.stringify({}),
  //     type: 'POST',
  //     contentType: 'text/plain'
  //   })
  //   .then(data => {
  //     let ownerListArr = [];

  //     _.forEach(data.rows, val => {
  //       ownerListArr.push({
  //         value: val.ownerUUID,
  //         text: val.ownerName
  //       });
  //     })

  //     tempOwner.ownerListArr = ownerListArr;

  //     this.setState({
  //       owner: tempOwner
  //     });
  //   })
  //   .catch(err => {
  //     helper.showPopupMsg('', t('txt-error'), err.message);
  //   })
  // }
  checkSortable = (field) => {
    const unSortableFields = ['options', 'owner', '_menu_'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  openMenu = (type, allValue) => {
    if (type === 'info') {
      this.setState({
        showScanInfo: true,
        currentDeviceData: allValue
      });
    } else if (type === 'edit') {

    } else if (type === 'delete') {

    }
  }
  getDeviceData = (fromSearch) => {
    const {baseUrl} = this.props;
    const {search, deviceData} = this.state;
    let dataObj = {
      sort: deviceData.sort.field,
      order: deviceData.sort.desc ? 'desc' : 'asc',
      page: fromSearch === 'search' ? 1 : deviceData.currentPage,
      pageSize: parseInt(deviceData.pageSize)
    };
    let type = '';

    if (fromSearch === 'search') {
      dataObj.keyword = search.ip;

      if (search.system != 'all') {
        dataObj.system = search.system;
      }

      if (search.deviceType != 'all') {
        dataObj.deviceType = search.deviceType;
      }

      if (search.name) {
        dataObj.ownerUUID = search.name;
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
      tempDeviceData.currentLength = data.length;

      let dataFields = {};
      deviceData.dataFieldsArr.forEach(tempData => {
        dataFields[tempData] = {
          label: tempData === '_menu_' ? '' : t(`ipFields.${tempData}`),
          sortable: this.checkSortable(tempData),
          formatter: (value, allValue) => {
            if (tempData === 'owner') {
              if (allValue.ownerObj) {
                return <span>{allValue.ownerObj.ownerName}</span>;
              } else {
                return <span>{value}</span>;
              }
            } else if (tempData === '_menu_') {
              return <div className={cx('table-menu', {'active': value})}><i className='fg fg-eye' onClick={this.openMenu.bind(this, 'info', allValue)}></i><i className='fg fg-chart-kpi' onClick={this.openMenu.bind(this, 'edit')}></i><i className='fg fg-trashcan' onClick={this.openMenu.bind(this, 'delete')}></i></div>;
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
  handlePaginationChange = (type, value) => {
    let tempDeviceData = {...this.state.deviceData};
    tempDeviceData[type] = value;

    if (type === 'pageSize') {
      tempDeviceData.currentPage = 1;
    }

    this.setState({
      deviceData: tempDeviceData
    }, () => {
      this.getDeviceData();
    });
  }
  handleSearchSubmit = () => {

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
  setFilterData = (filterData) => {
    this.setState({
      filterData
    });
  }
  handleResetBtn = () => {

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
  showAlertData = (type) => {
    let tempDeviceData = {...this.state.deviceData};

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
      // const {deviceData} = this.state;
      // let data = '';

      // if (deviceData.currentID) {
      //   data = deviceData.publicFormatted.srcIp[deviceData.currentID] || deviceData.publicFormatted.destIp[deviceData.currentID];
      // }

      //this.openDetailInfo(data);
    });
  }
  displayScanInfo = () => {
    const {currentDeviceData} = this.state;
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

        <div className='pagination'>
          <div className='buttons'>
            <button onClick={this.showAlertData.bind(this, 'previous')} disabled={currentDeviceData.currentIndex === 0}>{t('txt-previous')}</button>
            <button onClick={this.showAlertData.bind(this, 'next')} disabled={currentDeviceData.currentIndex + 1 === currentDeviceData.currentLength}>{t('txt-next')}</button>
          </div>
          <span className='count'>{currentDeviceData.currentIndex + 1} / {currentDeviceData.currentLength}</span>
        </div>
      </div>
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
	render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {activeTab, showFilter, showScanInfo, filterData, deviceData} = this.state;
    let filterDataCount = 0;

		return (
      <div>
        {showScanInfo &&
          this.showScanInfo()
        }
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            {activeTab === 'deviceList' &&
              <button onClick={this.toggleFilter} className={cx('last', {'active': showFilter})} title={t('network.connections.txt-toggleFilter')}><i className='fg fg-filter'></i><span>({filterDataCount})</span></button>
            }
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          <div className='data-table'>
            {activeTab === 'deviceList' &&
              <FilterContent
                showFilter={showFilter}
                activeTab='config'
                filterData={filterData}
                handleSearchSubmit={this.handleSearchSubmit}
                toggleFilter={this.toggleFilter}
                setFilterData={this.setFilterData}
                handleResetBtn={this.handleResetBtn} />
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

              {activeTab === 'deviceList' &&
                <div className='table-content'>
                  <div className='table'>
                    {deviceData.dataFields &&
                      <DataTable
                        className='main-table'
                        fields={deviceData.dataFields}
                        data={deviceData.dataContent}
                        sort={deviceData.dataContent.length === 0 ? {} : deviceData.sort}
                        onSort={this.handleTableSort}
                        onRowMouseOver={this.handleRowMouseOver} />
                    }
                  </div>
                  <footer>
                    <Pagination
                      totalCount={deviceData.totalCount}
                      pageSize={deviceData.pageSize}
                      currentPage={deviceData.currentPage}
                      onPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                      onDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
                  </footer>
                </div>
              }

              {activeTab === 'deviceMap' &&
                <div>
                  <span>Device Map</span>
                </div>
              }
            </div>
          </div>
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