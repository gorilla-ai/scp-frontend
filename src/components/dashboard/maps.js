import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import ButtonGroup from 'react-ui/build/src/components/button-group'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Gis from 'react-gis/build/src/components'

import {HocAlertDetails as AlertDetails} from '../common/alert-details'
import {BaseDataContext} from '../common/context';
import helper from '../common/helper'
import withLocale from '../../hoc/locale-provider'
import WORLDMAP from '../../mock/world-map-low.json'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

const PRIVATE = 'private';
const PUBLIC = 'public';
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};

const MAPS_PUBLIC_DATA = {
  alertDetails: {
    publicFormatted: {
      srcIp: {},
      destIp: {}
    },
    private: {
      tree: [],
      data: '',
      currentFloorPrivateData: [],
      allFloorPrivateData: []
    },
    currentID: '',
    currentIndex: '',
    currentLength: ''
  },
  alertMapData: [],
  geoJson: {
    mapDataArr: [],
    attacksDataArr: []
  },
  alertData: ''
};
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
  seatData: {}
};

/**
 * Dashboard Maps
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Dashboard Maps
 */
class DashboardMaps extends Component {
  constructor(props) {
    super(props);

    this.state = {
      datetime: {
        from: helper.getStartDate('day'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
        //from: '2019-08-06T01:00:00Z',
        //to: '2019-08-07T02:02:13Z'
      },
      updatedTime: helper.getFormattedDate(Moment()),
      mapType: PRIVATE, //PRIVATE PUBLIC
      locationType: '',
      ..._.cloneDeep(MAPS_PUBLIC_DATA),
      ..._.cloneDeep(MAPS_PRIVATE_DATA),
      modalOpen: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'common', locale);

    this.loadAlertData();
    this.getFloorPlan();
  }
  /**
   * Get and set alert maps data
   * @method
   */
  loadAlertData = (type) => {
    const {baseUrl} = this.context;
    const {datetime, alertDetails} = this.state;
    const dateTime = {
      from: Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm') + ':00Z',
      to: Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm') + ':00Z'
    };
    const url = `${baseUrl}/api/u2/alert/_search?page=1&pageSize=10000`;
    const requestData = {
      timestamp: [dateTime.from, dateTime.to],
      filters: [{
        condition: 'must',
        query: 'Top10ExternalSrcCountry'
      }]
    };

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      if (data) {
        const tempArray = _.map(data.data.rows, val => {
          val._source.id = val._id;
          return val._source;
        });
        let tempAlertDetails = {...alertDetails};
        let publicData = {
          srcIp: {},
          destIp: {}
        };

        _.forEach(tempArray, val => {
          if (!publicData.srcIp[val.srcIp]) {
            publicData.srcIp[val.srcIp] = [];
          }

          if (!publicData.destIp[val.destIp]) {
            publicData.destIp[val.destIp] = [];
          }

          publicData.srcIp[val.srcIp].push(val);
          publicData.destIp[val.destIp].push(val);
        })

        tempAlertDetails.publicFormatted.srcIp = publicData.srcIp;
        tempAlertDetails.publicFormatted.destIp = publicData.destIp;

        this.setState({
          updatedTime: helper.getFormattedDate(Moment()),
          alertDetails: tempAlertDetails,
          alertMapData: tempArray
        }, () => {
          this.getWorldMap();
        });
      }
      return null;
    });
  }
  /**
   * Set map geoJson and attacks data
   * @method
   */
  getWorldMap = () => {
    const {geoJson, alertDetails, alertMapData} = this.state;
    let tempGeoJson = {...geoJson};
    let attacksDataArr = [];

    _.forEach(WORLDMAP.features, val => {
      const countryObj = {
        type: 'geojson',
        id: val.properties.name,
        weight: 0.6,
        fillColor: 'white',
        color: '#182f48',
        fillOpacity: 1
      };

      countryObj.geojson = val.geometry;
      tempGeoJson.mapDataArr.push(countryObj);
    });

    _.forEach(alertMapData, val => {
      const timestamp = helper.getFormattedDate(val.timestamp, 'local');

      if (val.srcLatitude && val.srcLongitude) {
        const count = alertDetails.publicFormatted.srcIp[val.srcIp].length;

        attacksDataArr.push({
          type: 'spot',
          id: val.srcIp,
          latlng: [
            val.srcLatitude,
            val.srcLongitude
          ],
          data: {
            tag: 'red'
          },
          tooltip: () => {
            return `
              <div class='map-tooltip'>
                <div><span class='key'>${t('payloadsFields.attacksCount')}:</span> <span class='count'>${count}</span></div>
                <div><span class='key'>${t('payloadsFields.srcCountry')}:</span> <span class='value'>${val.srcCountry}</span></div>
                <div><span class='key'>${t('payloadsFields.srcCity')}:</span> <span class='value'>${val.srcCity}</span></div>
                <div><span class='key'>${t('payloadsFields.srcIp')}:</span> <span class='value'>${val.srcIp}</span></div>
                <div><span class='key'>${t('payloadsFields.timestamp')}:</span> <span class='value'>${timestamp}</span></div>
              </div>
              `
          }
        });
      }

      if (val.destLatitude && val.destLongitude) {
        const count = alertDetails.publicFormatted.destIp[val.destIp].length;

        attacksDataArr.push({
          type: 'spot',
          id: val.destIp,
          latlng: [
            val.destLatitude,
            val.destLongitude
          ],
          data: {
            tag: 'yellow'
          },
          tooltip: () => {
            return `
              <div class='map-tooltip'>
                <div><span class='key'>${t('payloadsFields.destCountry')}:</span> <span class='value'>${val.destCountry}</span></div>
                <div><span class='key'>${t('payloadsFields.destCity')}:</span> <span class='value'>${val.destCity}</span></div>
                <div><span class='key'>${t('payloadsFields.destIp')}:</span> <span class='value'>${val.destIp}</span></div>
                <div><span class='key'>${t('payloadsFields.timestamp')}:</span> <span class='value'>${timestamp}</span></div>
              </div>
              `
          }
        });
      }
    });

    tempGeoJson.attacksDataArr = attacksDataArr;

    this.setState({
      geoJson: tempGeoJson
    });
  }
  /**
   * Toggle public and private maps content
   * @method
   * @param {string} type - content type ('private' or 'public')
   */
  toggleMaps = (type) => {
    this.setState({
      mapType: type,
      ..._.cloneDeep(MAPS_PUBLIC_DATA),
      ..._.cloneDeep(MAPS_PRIVATE_DATA)
    }, () => {
      const {mapType} = this.state;

      if (mapType === PUBLIC) {
        this.loadAlertData();
      } else if (mapType === PRIVATE) {
        this.getFloorPlan();
      }
    });
  }
  /**
   * Get and set selected alert data
   * @method
   * @param {string} type - alert type ('private' or 'public')
   * @param {string} id - selected seat UUID
   * @param {object} eventInfo - MouseClick events
   */
  showTopoDetail = (type, id, eventInfo) => {
    const {baseUrl} = this.context;
    const {alertDetails} = this.state;
    let tempAlertDetails = {...alertDetails};
    let alertData = '';

    if (!id) {
      return;
    }

    if (id.length > 15) {
      _.forEach(alertDetails.private.tree, val => {
        if (val.srcTopoInfo.seatUUID === id) {
          id = val.key;
        }
      })
    }

    tempAlertDetails.currentIndex = 0;
    tempAlertDetails.currentID = id;

    if (type === PUBLIC) {
      const uniqueIP = id;

      if (id.indexOf('.') < 0) {
        return;
      }

      alertData = alertDetails.publicFormatted.srcIp[uniqueIP] || alertDetails.publicFormatted.destIp[uniqueIP];
      tempAlertDetails.currentLength = alertData.length;

      this.setState({
        alertDetails: tempAlertDetails
      }, () => {
        this.openDetailInfo(type, alertData);
      });
    } else if (type === PRIVATE) {
      const {datetime, alertDetails, currentFloor} = this.state;
      const dateTime = {
        from: Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm') + ':00Z',
        to: Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm') + ':00Z'
      };
      const url = `${baseUrl}/api/u2/alert/_search?page=1&pageSize=10000`;
      const requestData = {
        timestamp: [dateTime.from, dateTime.to],
        filters: [{
          condition: 'must',
          query: 'sourceIP:' + id
        }]
      };

      helper.getAjaxData('POST', url, requestData)
      .then(data => {
        const tempArray = _.map(data.data.rows, val => {
          val._source.id = val._id;
          val._source.index = val._index;
          return val._source;
        });
        tempAlertDetails.private.data = tempArray;
        tempAlertDetails.currentLength = data.data.counts;
        alertData = tempArray[0];

        this.setState({
          alertDetails: tempAlertDetails
        }, () => {
          this.openDetailInfo(type, alertData);
        });
      });
    }
  }
  /**
   * Set the alert index and get the alert data
   * @method
   * @param {string} type - button action type ('previous' or 'next')
   */
  showAlertData = (type) => {
    const {locationType, alertDetails} = this.state;
    let tempAlertDetails = {...alertDetails};

    if (type === 'previous') {
      if (alertDetails.currentIndex !== 0) {
        tempAlertDetails.currentIndex--;
      }
    } else if (type === 'next') {
      if (alertDetails.currentLength - alertDetails.currentIndex > 1) {
        tempAlertDetails.currentIndex++;
      }
    }

    this.setState({
      alertDetails: tempAlertDetails
    }, () => {
      const {alertDetails} = this.state;
      let alertData = '';

      if (locationType === PRIVATE) {
        alertData = alertDetails.private.data[alertDetails.currentIndex];
      } else if (locationType === PUBLIC) {
        alertData = alertDetails.publicFormatted.srcIp[alertDetails.currentID] || alertDetails.publicFormatted.destIp[alertDetails.currentID];
      }
      this.openDetailInfo(locationType, alertData);
    });
  }
  /**
   * Set the individual alert data
   * @method
   * @param {string} type - button action type ('previous' or 'next')
   * @param {object} alertData - selected alert data
   */
  openDetailInfo = (type, alertData) => {
    const {alertDetails} = this.state;
    let tempAlertDetails = {...alertDetails};
    let locationType = '';

    if (type.indexOf(PRIVATE) > -1) {
      locationType = PRIVATE;
    } else if (type.indexOf(PUBLIC) > -1) {
      locationType = PUBLIC;
    }

    if (alertDetails.currentIndex.toString() !== '') {
      if (locationType === PUBLIC) {
        alertData = alertData[alertDetails.currentIndex];
      }
    }

    this.setState({
      alertDetails: tempAlertDetails,
      locationType,
      alertData,
      modalOpen: true
    });
  }
  /**
   * Display alert details modal dialog
   * @method
   * @returns AlertDetails component
   */
  alertDialog = () => {
    const {alertDetails, alertData, locationType} = this.state;
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeDialog}
    };

    return (
      <AlertDetails
        titleText={t('alert.txt-alertInfo')}
        actions={actions}
        alertDetails={alertDetails}
        alertData={alertData}
        showAlertData={this.showAlertData}
        fromPage='dashboard'
        locationType={locationType} />
    )
  }
  /**
   * Close alert dialog and reset alert data
   * @method
   */
  closeDialog = () => {
    this.setState({
      locationType: '',
      alertDetails: {
        ...this.state.alertDetails,
        currentID: '',
        currentIndex: '',
        currentLength: ''
      },
      alertData: '',
      modalOpen: false
    });
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
      if (data && data.length > 0) {
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
      }
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
    let currentFloor = '';

    _.forEach(floorPlan.treeData, val => {
      helper.floorPlanRecursive(val, obj => {
        floorList.push({
          value: obj.areaUUID,
          text: obj.areaName
        });
      });
    })

    currentFloor = floorList[0].value; //Default to the top parent floor

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
   * @param {string} areaUUID - area UUID
   */
  getAreaData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.context;
    const floorPlan = areaUUID;

    this.ah.one({
      url: `${baseUrl}/api/area?uuid=${floorPlan}`,
      type: 'GET'
    })
    .then(data => {
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

      let currentBaseLayers = {};
      currentBaseLayers[floorPlan] = currentMap;

      this.setState({
        currentMap,
        currentBaseLayers,
        currentFloor: areaUUID
      }, () => {
        this.loadAlertPrivateData();
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set the alert tree data
   * @method
   */
  loadAlertPrivateData = () => {
    const {baseUrl} = this.context;
    const {datetime, alertDetails, currentFloor} = this.state;
    const dateTime = {
      from: Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm') + ':00Z',
      to: Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm') + ':00Z'
    };
    const url = `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0`;
    const requestData = {
      timestamp: [dateTime.from, dateTime.to],
      filters: [{
        condition: 'must',
        query: 'Top10InternalMaskedIp'
      }]
    };

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      const allPrivateData = data.aggregations.Top10InternalMaskedIp;
      let tempAlertDetails = {...alertDetails};
      let currentFloorPrivateData = [];
      let allFloorPrivateData = [];

      _.forEach(_.keys(allPrivateData), val => {
        if (val !== 'doc_count' && allPrivateData[val].doc_count) {
          _.forEach(allPrivateData[val].srcIp.buckets, val2 => {
            if (val2.srcTopoInfo && val2.srcTopoInfo.areaUUID === currentFloor) {
              currentFloorPrivateData.push(val2);
            } else if (!val2.srcTopoInfo.areaUUID) {
              allFloorPrivateData.push(val2);
            }
          })
        }
      })

      tempAlertDetails.private.currentFloorPrivateData = currentFloorPrivateData;
      tempAlertDetails.private.allFloorPrivateData = allFloorPrivateData;
      tempAlertDetails.private.tree = _.concat(currentFloorPrivateData, allFloorPrivateData);

      this.setState({
        alertDetails: tempAlertDetails
      }, () => {
        this.getSeatData();
      });
    });
  }
  /**
   * Get and set individual floor area data
   * @method
   */
  getSeatData = () => {
    const {alertDetails, currentFloor} = this.state;
    const areaUUID = currentFloor;
    let tempAlertDetails = [];
    let tempSeatID = '';
    let seatListArr = [];
    let seatData = {};

    _.forEach(alertDetails.private.tree, val => {
      if (val.srcTopoInfo && val.srcTopoInfo.areaUUID === areaUUID) {
        if (tempSeatID) {
          if (tempSeatID !== val.srcTopoInfo.seatUUID) {
            tempSeatID = val.srcTopoInfo.seatUUID;
            tempAlertDetails.push(val);
          }
        } else {
          tempSeatID = val.srcTopoInfo.seatUUID;
          tempAlertDetails.push(val);
        }
      }
    })

    if (tempAlertDetails.length > 0) {
      _.forEach(tempAlertDetails, val => {
        seatListArr.push({
          id: val.srcTopoInfo.seatUUID,
          type: 'spot',
          xy: [val.srcTopoInfo.seatCoordX, val.srcTopoInfo.seatCoordY],
          label: val.srcTopoInfo.seatName,
          data: {
            count: val.doc_count,
            seatName: val.srcTopoInfo.seatName,
            areaFullName: val.srcTopoInfo.areaFullName,
            srcIp: val.srcTopoInfo.ip,
            srcMac: val.srcTopoInfo.mac,
            ownerName: val.srcTopoInfo.ownerName,
            tag: 'red'
          }
        });
      })
    }

    seatData[areaUUID] = {
      data: seatListArr
    };

    this.setState({
      seatData
    });
  }
  /**
   * Display tooltip for private floor map
   * @method
   * @param {object} data - selected seat data
   * @returns HTML DOM
   */
  showPrivateTooltip = (data) => {
    if (data) {
      return `
        <div class='map-tooltip'>
          <div><span class='key'>${t('payloadsFields.attacksCount')}:</span> <span class='count'>${data.count}</span></div>
          <div><span class='key'>${t('ipFields.ip')}:</span> <span class='value'>${data.ip || data.srcIp}</span></div>
          <div><span class='key'>${t('ipFields.mac')}:</span> <span class='value'>${data.mac || data.srcMac}</span></div>
          <div><span class='key'>${t('ipFields.areaFullName')}:</span> <span class='value'>${data.areaFullName}</span></div>
          <div><span class='key'>${t('ipFields.seat')}:</span> <span class='value'>${data.seatName}</span></div>
          <div><span class='key'>${t('ipFields.owner')}:</span> <span class='value'>${data.ownerName}</span></div>
        </div>
        `
    }
  }
  /**
   * Get class name for alert hosts text
   * @method
   * @param {number} index - index of the alert data
   * @returns class name
   */
  getTreeColor = (index) => {
    const {alertDetails} = this.state;
    const currentFloorLength = alertDetails.private.currentFloorPrivateData.length;

    if ((index + 1) > currentFloorLength) {
      return 'faded';
    }
  }
  /**
   * Display private host data
   * @method
   * @param {object} val - alert data
   * @param {number} i - index of the alert data
   * @returns HTML DOM
   */
  displayPrivateHost = (val, i) => {
    return (
      <li key={val.key} onClick={this.showTopoDetail.bind(this, PRIVATE, val.key)}>
        <div className={cx('info', {'faded': this.getTreeColor(i)})}>
          <span className='ip'>{val.key}</span>
          <span className='host'>{val.srcTopoInfo && val.srcTopoInfo.hostName}</span>
        </div>
        <span className='count' style={{backgroundColor: ALERT_LEVEL_COLORS[val._severity_]}}>{val.doc_count}</span>
      </li>
    )
  }
  render() {
    const {
      updatedTime,
      mapType,
      alertDetails,
      geoJson,
      floorList,
      currentFloor,
      currentMap,
      currentBaseLayers,
      seatData,
      modalOpen
    } = this.state;

    return (
      <div>
        {modalOpen &&
          this.alertDialog()
        }

        <div className='sub-header'>
          {helper.getDashboardMenu('maps')}
          <span className='date-time'>{updatedTime}</span>
        </div>

        <div className='main-dashboard'>
          <div className='maps'>
          <ButtonGroup
            className='left'
            list={[
              {value: PRIVATE, text: t('dashboard.txt-private')},
              {value: PUBLIC, text: t('dashboard.txt-public')}
            ]}
            onChange={this.toggleMaps}
            value={mapType} />

            {mapType === PRIVATE &&
              <div className='floor-map'>
                <DropDownList
                  className='drop-down'
                  list={floorList}
                  onChange={this.getAreaData}
                  required={true}
                  value={currentFloor} />
                <div className='content'>
                  <ul>
                    {alertDetails.private.tree.length > 0 &&
                      alertDetails.private.tree.map(this.displayPrivateHost)
                    }
                  </ul>
                  <div className='map'>
                    {currentMap &&
                      <Gis
                        className='floor-map-area'
                        _ref={(ref) => {this.gisNode = ref}}
                        data={_.get(seatData, [currentFloor, 'data'])}
                        baseLayers={currentBaseLayers}
                        baseLayer={currentFloor}
                        layouts={['standard']}
                        dragModes={['pan']}
                        scale={{enabled: false}}
                        onClick={this.showTopoDetail.bind(this, PRIVATE)}
                        symbolOptions={[{
                          match: {
                            data: {tag: 'red'}
                          },
                          props: {
                            backgroundColor: 'red',
                            tooltip: ({data}) => {
                              return this.showPrivateTooltip(data);
                            }
                          }
                        }]} />
                    }
                  </div>
                </div>
              </div>
            }
            {mapType === PUBLIC && geoJson.mapDataArr.length > 0 &&
              <Gis
                id='gisMap'
                data={geoJson.mapDataArr}
                layers={{
                  world: {
                    label: 'World Map',
                    interactive: false,
                    data: geoJson.attacksDataArr
                  }
                }}
                activeLayers={['world']}
                baseLayers={{
                  standard: {
                    id: 'world',
                    layer: 'world'
                  }
                }}
                mapOptions={{
                  crs: L.CRS.Simple
                }}
                onClick={this.showTopoDetail.bind(this, PUBLIC)}
                symbolOptions={[{
                  match: {
                    type:'geojson'
                  },
                  selectedProps: {
                    'fill-color': 'white',
                    color: 'black',
                    weight: 0.6,
                    'fill-opacity': 1
                  }
                },
                {
                  match: {
                    type: 'spot'
                  },
                  props: {
                    'background-color': ({data}) => {
                      return data.tag === 'red' ? 'red' : 'yellow';
                    },
                    'border-color': '#333',
                    'border-width': '1px'
                  }
                }]}
                layouts={['standard']}
                dragModes={['pan']} />
            }
          </div>
        </div>
      </div>
    )
  }
}

DashboardMaps.contextType = BaseDataContext;

DashboardMaps.propTypes = {
};

const HocDashboardMaps = withRouter(withLocale(DashboardMaps));
export { DashboardMaps, HocDashboardMaps };