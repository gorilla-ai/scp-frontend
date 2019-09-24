import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'
import queryString from 'query-string'

import Gis from 'react-gis/build/src/components'

import DataTable from 'react-ui/build/src/components/table'
import DateRange from 'react-ui/build/src/components/date-range'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {HocPagination as Pagination} from '../../common/pagination'
import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'
import 'react-gis/build/css/react-gis.css'

let t = null;
let et = null;

class EmployeeRecord extends Component {
  constructor(props) {
    super(props);

    this.state = {
      switchTab: {
        activeDirectory: true,
        smartEnterprise: false
      },
      search: {
        datetime: {
          from: helper.getSubstractDate(1, 'week'),
          to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
          //from: '2018-07-01T00:00:00Z',
          //to: '2018-07-29T23:00:00Z'
        }
      },
      activeDirectory: {
        dataFieldsArr: ['@timestamp', 'target', 'message'],
        dataFields: {},
        dataContent: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      smartEnterprise: {
        dataFieldsArr: ['operatorId', 'operatorName', 'deviceTime', 'photo'],
        dataFields: {},
        dataContent: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      topologyData: [],
      seatData: {},
      ownerPic: '',
      currentMap: '',
      currentBaseLayers: {},
      mapAreaUUID: '',
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentWillMount() {
    this.getTopologyData();
  }
  toggleSwitch = (type, mode) => {
    const tempSwitchTab = {
      worldMap: false,
      floorMap: false
    };

    if (type === 'tab') {
      if (mode === 'ad') {
        tempSwitchTab.activeDirectory = true;
      } else if (mode === 'se') {
        tempSwitchTab.smartEnterprise = true;
      }

      this.setState({
        switchTab: tempSwitchTab,
        search: this.clearData('date'),
        activeDirectory: this.clearData('ad'),
        smartEnterprise: this.clearData('se')
      }, () => {
        this.getEmployeeData();
      });
    }
  }
  getTopologyData = () => {
    const {location, baseUrl} = this.props;
    const origDataObj = queryString.parse(location.search);
    const timeObj = _.pick(origDataObj, ['eventDttm']);
    const dataObj = _.omit(origDataObj, ['eventDttm', 'lng']);

    if (timeObj.eventDttm) {
      const topologyData = this.props.location.state.alertData;
      const eventDttm = helper.getFormattedDate(Number(timeObj.eventDttm));
      const search = {
        datetime: {
          from: Moment(eventDttm).local().subtract(7, 'days').format('YYYY-MM-DDTHH:mm:ss'),
          to: eventDttm
        }
      };

      this.setState({
        search,
        topologyData
      }, () => {
        this.getAreaData();
        this.getEmployeeData('search');
      });
    } else {
      this.ah.one({
        url: `${baseUrl}/api/honeynet/attack/attack`,
        data: JSON.stringify(dataObj),
        type: 'POST',
        contentType: 'text/plain'
      })
      .then(data => {
        if (data) {
          this.setState({
            topologyData: data
          }, () => {
            const {topologyData} = this.state;

            if (topologyData.srcTopoInfo) {
              this.getAreaData();
            }
            this.getEmployeeData();
          });
        }
      })
    }
  }
  getAreaData = () => {
    const {baseUrl, contextRoot} = this.props;
    const {topologyData} = this.state;
    let currentMap = {};

    if (!topologyData.srcTopoInfo && !topologyData.destTopoInfo) {
      return;
    }

    const data = topologyData.srcTopoInfo ? topologyData.srcTopoInfo : topologyData.destTopoInfo;
    const areaUUID = data.areaUUID;

    if (data.areaPicPath) {
      const areaName = data.areaName;
      const picPath = `${baseUrl}${contextRoot}/api/area/_image?path=${data.areaPicPath}`;
      const picWidth = data.areaPicWidth;
      const picHeight = data.areaPicHeight;

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

    let currentBaseLayers = {};
    currentBaseLayers[areaUUID] = currentMap;

    this.setState({
      currentMap,
      currentBaseLayers,
      mapAreaUUID: areaUUID
    }, () => {
      this.getSeatData(areaUUID);
    });
  }
  getSeatData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.props;
    const {topologyData} = this.state;
    let seatData = {};
    let seatListArr = [];

    if (!topologyData.srcTopoInfo && !topologyData.destTopoInfo) {
      return;
    }

    const topoInfo = topologyData.srcTopoInfo ? topologyData.srcTopoInfo : topologyData.destTopoInfo;

    seatListArr.push({
      id: topoInfo.seatUUID,
      type: 'spot',
      xy: [topoInfo.seatCoordX, topoInfo.seatCoordY],
      label: topoInfo.seatName,
      data: {
        name: topoInfo.seatName,
        tag: 'red'
      }
    });

    seatData[areaUUID] = {
      data: seatListArr
    };

    this.setState({
      seatData
    });
  }
  getOwnerPic = (seatUUID) => {
    const {baseUrl} = this.props;
    const {topologyData} = this.state;
    let ownerUUID = '';

    if (topologyData.srcTopoInfo) {
      ownerUUID = topologyData.srcTopoInfo.ownerUUID;
    } else if (topologyData.destTopoInfo) {
      ownerUUID = topologyData.destTopoInfo.ownerUUID;
    }

    if (ownerUUID) {
      this.ah.one({
        url: `${baseUrl}/api/owner?uuid=${ownerUUID}`,
        type: 'GET'
      })
      .then(data => {
        const ownerPic = data.base64;

        this.setState({
          ownerPic
        }, () => {
          this.displaySeatInfo();
        });
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    }
  }
  displaySeatInfo = () => {
    const {contextRoot} = this.props;
    const {topologyData, ownerPic} = this.state;
    const title = t('ipFields.seat');
    const value = topologyData.srcTopoInfo ? topologyData.srcTopoInfo : topologyData.destTopoInfo;
    let picPath = contextRoot + '/images/empty_profile.png';

    if (ownerPic) {
      picPath = ownerPic;
    }

    const seatInfo =  <div className='display-seat'>
      <div className='info'>
        <ul>
          {value.seatName && <li><strong>{t('ipFields.seat')}</strong>: {value.seatName}</li>}
          {value.areaFullName && <li><strong>{t('ipFields.areaFullName')}</strong>: {value.areaFullName}</li>}
          {value.srcIp && <li><strong>{t('attacksFields.srcIp')}</strong>: {value.srcIp}</li>}
          {value.srcMac && <li><strong>{t('ipFields.mac')}</strong>: {value.srcMac}</li>}
          {value.ownerName && <li><strong>{t('ipFields.owner')}</strong>: {value.ownerName}</li>}
          {value.hostName && <li><strong>{t('ipFields.hostName')}</strong>: {value.hostName}</li>}
          {value.system && <li><strong>{t('ipFields.system')}</strong>: {value.system}</li>}
          {value.deviceType && <li><strong>{t('ipFields.deviceType')}</strong>: {value.deviceType}</li>}
        </ul>
      </div>
      <img src={picPath} title={t('network-topology.txt-profileImage')} />
    </div>;

    PopupDialog.alertId('small-area-map', {
      id: 'modalWindowSmall',
      title,
      confirmText: t('txt-ok'),
      display: seatInfo
    });
  }
  displayFullMap = () => {
    const {seatData, mapAreaUUID, currentBaseLayers} = this.state;

    return (
      <div className='employee-record'>
        <Gis
          _ref={(ref) => {this.gisNode = ref}}
          data={_.get(seatData, [mapAreaUUID, 'data'], [])}
          baseLayers={currentBaseLayers}
          baseLayer={mapAreaUUID}
          layouts={['standard']}
          dragModes={['pan']}
          scale={{enabled: false}}
          onClick={this.getOwnerPic}
          symbolOptions={[{
            match: {
              data: {tag: 'red'}
            },
            props: {
              backgroundColor: 'red'
            }
          }]} />
      </div>
    )
  }
  viewFullMap = (title) => {
    PopupDialog.alertId('full-area-map', {
      title,
      id: 'modalWindow',
      className: 'employee-record',
      confirmText: t('txt-confirm'),
      display: this.displayFullMap(),
      act: (confirmed, data) => {
      }
    });
  }
  getEmployeeData = (fromSearch) => {
    const {baseUrl} = this.props;
    const {switchTab, search, topologyData, activeDirectory, smartEnterprise} = this.state;
    let setPage = '';
    let url = '';
    let dataObj = {
      startTime: Moment(search.datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      endTime: Moment(search.datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };

    if (!topologyData.srcTopoInfo && !topologyData.destTopoInfo) {
      return;
    }

    if (switchTab.activeDirectory) {
      setPage = fromSearch === 'search' ? 1 : activeDirectory.currentPage;
      url = `${baseUrl}/api/ad/event/_search?page=${setPage}&pageSize=${activeDirectory.pageSize}`;

      if (topologyData.srcTopoInfo) {
        dataObj.hostName = topologyData.srcTopoInfo.hostName;
      } else if (topologyData.destTopoInfo) {
        dataObj.hostName = topologyData.destTopoInfo.hostName;
      }
    } else if (switchTab.smartEnterprise) {
      setPage = fromSearch === 'search' ? 1 : smartEnterprise.currentPage;
      url = `${baseUrl}/api/se/attendance/_search?page=${setPage}&pageSize=${smartEnterprise.pageSize}`;

      if (topologyData.srcTopoInfo) {
        dataObj.employeeId = topologyData.srcTopoInfo.ownerID;
      } else if (topologyData.destTopoInfo) {
        dataObj.employeeId = topologyData.destTopoInfo.ownerID;
      }
    }

    this.ah.one({
      url: url,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      let dataFields = {};

      if (switchTab.activeDirectory) {
        let dataContent = [];
        let tempActiveDirectory = {...this.state.activeDirectory};

        _.forEach(data.rows, val => {
          dataContent.push(val.content)
        });

        tempActiveDirectory.dataContent = dataContent;
        tempActiveDirectory.totalCount = data.counts;
        tempActiveDirectory.currentPage = fromSearch === 'search' ? 1 : activeDirectory.currentPage;

        activeDirectory.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: t(`adFields.${tempData}`),
            sortable: null,
            formatter: (value, allValue) => {
              if (tempData === '@timestamp') {
                return <span>{helper.getFormattedDate(value, 'local')}</span>
              } else if (tempData === 'target') {
                return <span>{allValue.event_data.TargetUserName}</span>;
              } else if (tempData === 'message') {
                const formattedValue = allValue.message.substr(0, 100) + '...';
                return <a onClick={this.displayMessage.bind(this, allValue.message)}>{formattedValue}</a>;
              }
            }
          };
        })

        tempActiveDirectory.dataFields = dataFields;

        this.setState({
          activeDirectory: tempActiveDirectory
        });
      } else if (switchTab.smartEnterprise) {
        let tempSmartEnterprise = {...this.state.smartEnterprise};
        tempSmartEnterprise.dataContent = data.rows;
        tempSmartEnterprise.totalCount = data.counts;
        tempSmartEnterprise.currentPage = fromSearch === 'search' ? 1 : smartEnterprise.currentPage;

        smartEnterprise.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: t(`seFields.${tempData}`),
            sortable: null,
            formatter: (value, allValue) => {
              if (tempData === 'deviceTime') {
                return <span>{helper.getFormattedDate(value, 'unix')}</span>
              } else if (tempData === 'photo') {
                const base64 = 'data:image/png;base64,' + value;
                return <div onClick={this.viewPhoto.bind(this, base64)}><img src={base64} /></div>;
              } else {
                return <span>{value}</span>;
              }
            }
          };
        })

        tempSmartEnterprise.dataFields = dataFields;

        this.setState({
          smartEnterprise: tempSmartEnterprise
        });
      }
    })
  }
  displayPhoto = (base64) => {
    return (
      <div className='photo'>
        <img src={base64} />
      </div>
    )
  }
  viewPhoto = (base64) => {
    PopupDialog.alert({
      title: t('seFields.photo'),
      id: 'modalWindow',
      confirmText: t('txt-confirm'),
      display: this.displayPhoto(base64),
      act: (confirmed, data) => {
      }
    });
  }
  displayMessage = (messageText) => {
    const title = t('adFields.message');

    PopupDialog.alert({
      id: 'modalWindowSmall',
      title,
      confirmText: t('txt-ok'),
      display: messageText
    });
  }
  handleDataChange = (formType, type, value) => {
    let tempSearch = {...this.state.search};

    if (formType === 'search') {
      tempSearch[type] = value;

      this.setState({
        search: tempSearch
      });
    }
  }
  handlePaginationChange = (type, field, value) => {
    if (type === 'ad') {
      let tempActiveDirectory = {...this.state.activeDirectory};
      tempActiveDirectory[field] = value;

      if (field === 'pageSize') {
        tempActiveDirectory.currentPage = 1;
      }

      this.setState({
        activeDirectory: tempActiveDirectory
      }, () => {
        this.getEmployeeData();
      });
    } else if (type === 'se') {
      let tempSmartEnterprise = {...this.state.smartEnterprise};
      tempSmartEnterprise[field] = value;

      if (field === 'pageSize') {
        tempSmartEnterprise.currentPage = 1;
      }

      this.setState({
        smartEnterprise: tempSmartEnterprise
      }, () => {
        this.getEmployeeData();
      });
    }
  }
  clearData = (type) => {
    const {activeDirectory, smartEnterprise} = this.state;
    let tempData = {};

    if (type === 'date') {
      tempData = {
        datetime: {
          from: helper.getSubstractDate(1, 'week'),
          to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
        }
      };
    } else if (type === 'ad') {
      tempData = {
        dataFieldsArr: activeDirectory.dataFieldsArr,
        dataFields: {},
        dataContent: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      };
    } else if (type === 'se') {
      tempData = {
        dataFieldsArr: smartEnterprise.dataFieldsArr,
        dataFields: {},
        dataContent: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      };
    }
    return tempData;
  }
  render() {
    const {
      switchTab,
      search,
      currentMap,
      topologyData,
      seatData,
      mapAreaUUID,
      currentBaseLayers,
      activeDirectory,
      smartEnterprise
    } = this.state;
    let areaRoute = '';

    if (topologyData.srcTopoInfo) {
      areaRoute = (topologyData.srcTopoInfo.areaFullName || topologyData.srcTopoInfo.areaName).trim();
    } else if (topologyData.destTopoInfo) {
      areaRoute = (topologyData.destTopoInfo.areaFullName || topologyData.destTopoInfo.areaName).trim();
    }

    return (
      <div>
        <div className='data-content'>
          <div className='left-nav floor-plan'>
            {(topologyData.srcTopoInfo || topologyData.destTopoInfo) &&
              <div className='floor-map employee-record'>
                <header>
                  {areaRoute &&
                    <div className='title'>{areaRoute}</div>
                  }
                  <span><i className='fg fg-fullscreen-exit' title={t('txt-fullScreen')} onClick={this.viewFullMap.bind(this, areaRoute)}></i></span>
                </header>
                <div className='content-area'>
                  {currentMap &&
                    <Gis
                      _ref={(ref) => {this.gisNode = ref}}
                      data={_.get(seatData, [mapAreaUUID, 'data'], [])}
                      baseLayers={currentBaseLayers}
                      baseLayer={mapAreaUUID}
                      layouts={['standard']}
                      dragModes={['pan']}
                      scale={{enabled: false}}
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
          </div>

          <div className='right-content center'>
            <div className='search-bar'>
              <div className='button-group'>
                <button className={cx({'standard': !switchTab.activeDirectory})} onClick={this.toggleSwitch.bind(this, 'tab', 'ad')}>Active Directory</button>
                <button className={cx({'standard': !switchTab.smartEnterprise})} onClick={this.toggleSwitch.bind(this, 'tab', 'se')}>Smart Enterprise</button>
              </div>

              <div className='datepicker'>
                <label htmlFor='attacksDate'></label>
                <DateRange
                  id='attacksDate'
                  className='daterange'
                  onChange={this.handleDataChange.bind(this, 'search', 'datetime')}
                  enableTime={true}
                  value={search.datetime}
                  t={et} />
                <button className='search-button' onClick={this.getEmployeeData.bind(this, 'search')}>{t('txt-search')}</button>
              </div>
            </div>

            <div className='parent-content manage wide-width scroll-y'>
              {switchTab.activeDirectory && activeDirectory.dataFields &&
                <DataTable
                  className='main-table'
                  fields={activeDirectory.dataFields}
                  data={activeDirectory.dataContent} />
              }
              {switchTab.smartEnterprise && smartEnterprise.dataFields &&
                <DataTable
                  className='main-table'
                  fields={smartEnterprise.dataFields}
                  data={smartEnterprise.dataContent} />
              }
            </div>
            <footer>
              {activeDirectory.dataFields &&
                <Pagination
                  totalCount={activeDirectory.totalCount}
                  pageSize={activeDirectory.pageSize}
                  currentPage={activeDirectory.currentPage}
                  onPageChange={this.handlePaginationChange.bind(this, 'ad', 'currentPage')}
                  onDropDownChange={this.handlePaginationChange.bind(this, 'ad', 'pageSize')} />
              }
              {smartEnterprise.dataFields &&
                <Pagination
                  totalCount={smartEnterprise.totalCount}
                  pageSize={smartEnterprise.pageSize}
                  currentPage={smartEnterprise.currentPage}
                  onPageChange={this.handlePaginationChange.bind(this, 'se', 'currentPage')}
                  onDropDownChange={this.handlePaginationChange.bind(this, 'se', 'pageSize')} />
              }
            </footer>
          </div>
        </div>
      </div>
    )
  }
}

EmployeeRecord.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  locale: PropTypes.string.isRequired
};

const HocEmployeeRecord = withRouter(withLocale(EmployeeRecord));
export { EmployeeRecord, HocEmployeeRecord };