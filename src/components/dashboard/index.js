import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Gis from 'react-gis/build/src/components'
import WORLDMAP from '../../mock/world-map-low.json'

import BarChart from 'react-chart/build/src/components/bar'
import Checkbox from 'react-ui/build/src/components/checkbox'
import DataTable from 'react-ui/build/src/components/table'
import DropDownList from 'react-ui/build/src/components/dropdown'
import PieChart from 'react-chart/build/src/components/pie'

import {HocAlertDetails as AlertDetails} from '../common/alert-details'
import helper from '../common/helper'
import withLocale from '../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;
let intervalId = null;

const SEVERITY_TYPE = ['High', 'Medium', 'Low'];
const PRIVATE = 'private';
const PUBLIC = 'public';

//Charts ID must be unique
const CHARTS_ID = [
  'alert-statistics-pie',
  'alert-statistics-private-table',
  'alert-statistics-public-table'
];

const CHARTS_TITLE = [
  'dashboard.txt-alertIndicator',
  'dashboard.txt-privateAlert',
  'dashboard.txt-publicAlert'
];

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      datetime: {
        from: helper.getStartDate('day'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
        //from: '2019-02-18T15:00:00Z',
        //to: '2019-02-18T23:23:36Z'
      },
      updatedTime: helper.getFormattedDate(Moment()),
      activeTab: 'statistics',
      chartAttributes: {},
      alertAggregations: [],
      alertStatisticData: {
        alertPie: [],
        alertPrivateTable: {},
        alertPublicTable: {}
      },
      top10alerts: '',
      alertChartsData: {
        statistic: [],
        private: [],
        public: [],
      },
      mapType: PUBLIC,
      chartType: '',
      geoJson: {
        mapDataArr: [],
        attacksDataArr: []
      },
      // alertDetails: {
      //   privateCount: '',
      //   publicCount: '',
      //   private: [],
      //   public: [],
      //   privateFormatted: [],
      //   publicFormatted: {
      //     srcIp: {},
      //     destIp: {}
      //   },
      //   currentID: '',
      //   currentIndex: '',
      //   currentLength: ''
      // },
      alertMapData: [],
      alertDetails: {
        all: [],
        publicFormatted: {
          srcIp: {},
          destIp: {}
        },
        currentIndex: '',
        currentLength: ''
      },
      alertData: '',
      floorList: [],
      currentFloor: '',
      floorPlan: {
        treeData: {},
        currentAreaUUID: '',
        currentAreaName: ''
      },
      currentMap: '',
      currentBaseLayers: {},
      seatData: {},
      modalOpen: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount = () => {
    this.loadBarChartData();
    //this.loadAlertData();
    intervalId = setInterval(this.loadBarChartData, 300000); //5 minutes
  }
  componentWillUnmount = () => {
    clearInterval(intervalId);
  }
  getText = (eventInfo, data) => {
    const text = data[0].number + ' ' + t('txt-at') + ' ' + Moment(data[0].time, 'x').utc().format('YYYY/MM/DD HH:mm:ss');
    return text;
  }
  onTooltip = (eventInfo, data) => {
    return (
      <div>
        <div>{this.getText(eventInfo, data)}</div>
      </div>
    )
  }
  loadBarChartData = (prevProps) => {
    const {baseUrl, contextRoot} = this.props;
    const {datetime, alertDetails, alertMapData} = this.state;
    const pageSize = 10000;
    const url =`${baseUrl}/api/u1/alert/_search?page=1&pageSize=${pageSize}`;
    const dateTime = {
      from: Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm') + ':00Z',
      to: Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm') + ':00Z'
    };
    const requestData = {
      timestamp: [dateTime.from, dateTime.to],
      filters: [{
        condition: 'must',
        query: 'All'
      }]
    };

    helper.getAjaxData('POST', url, requestData)
    .then(data => {
      let alertHistogram = {
        High: {},
        Medium: {},
        Low: {}
      };
      const tempArray = _.map(data.data.rows, val => {
        val._source.id = val._id;
        val._source.index = val._index;
        return val._source;
      });
      let alertAggregations = [];
      let tempAlertDetails = {...alertDetails};
      let tempAlertMapData = {...alertMapData};
      tempAlertMapData.all = tempArray;

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

      _.forEach(SEVERITY_TYPE, val => { //Create Alert histogram for High, Medium, Low
        _.forEach(data.event_histogram[val].buckets, val2 => {
          if (val2.doc_count > 0) {
            alertHistogram[val][val2.key_as_string] = val2.doc_count;
          }
        })

        alertAggregations.push({
          key: val,
          doc_count: data.aggregations[val].doc_count
        });
      })

      let dataArr = [];
      let rulesObj = {};
      let rulesAll = [];

      _.forEach(_.keys(alertHistogram), val => { //Manually add rule name to the response data
        rulesObj[val] = _.map(alertHistogram[val], (value, key) => {
          return {
            time: parseInt(Moment(key, 'YYYY-MM-DDTHH:mm:ss.SSZ').utc(true).format('x')),
            number: value,
            rule: val
          }
        });
      })

      _.forEach(_.keys(alertHistogram), val => { //Push multiple rule arrays into a single array
        rulesAll.push(rulesObj[val]);
      })

      //Merge multiple arrays with different rules to a single array
      dataArr = rulesAll.reduce((accumulator, currentValue) => {
        return accumulator.concat(currentValue)
      }, []);

      const chartAttributes = {
        legend: {
          enabled: true
        },
        data: dataArr,
        onTooltip: this.onTooltip,
        dataCfg: {
          x: 'time',
          y: 'number',
          splitSeries: 'rule'
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            day: '%H:%M'
          }
        }
      };

      this.setState({
        chartAttributes,
        alertAggregations,
        alertDetails: tempAlertDetails,
        alertMapData: tempAlertMapData
      }, () => {
        this.getFloorPlan();
      });

      return null;
    });
  }
  // loadAlertData = (options) => {
  //   const {baseUrl} = this.props;
  //   const {datetime, alertDetails} = this.state;
  //   const apiNameList = ['_search/pie', '_search', '_search'];
  //   const dateTime = {
  //     from: Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm') + ':00Z',
  //     to: Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm') + ':00Z'
  //   };

  //   let dataObj = {
  //     _eventDttm_: {
  //       op: 'BETWEEN',
  //       arg: [dateTime.from, dateTime.to]
  //     }
  //   };

  //   if (options === 'getPrivate') {
  //     dataObj.srcIpType = PRIVATE;

  //     this.ah.one({
  //       url: `${baseUrl}/api/alert/_search?page=1&pageSize=10000`,
  //       data: JSON.stringify(dataObj),
  //       type: 'POST',
  //       contentType: 'text/plain'
  //     })
  //     .then(data => {
  //       let tempAlertDetails = {...alertDetails};
  //       tempAlertDetails.private = data.rows;

  //       this.setState({
  //         alertDetails: tempAlertDetails
  //       }, () => {
  //         this.getFloorPlan();
  //       });

  //       return null;
  //     })
  //     .catch(err => {
  //       helper.showPopupMsg('', t('txt-error'), err.message);
  //     })
  //   } else {
  //     const apiArr = _.map(apiNameList, (val, i) => {
  //       let apiName = val;

  //       if (i === 1 || i === 2) {
  //         if (i === 1) {
  //           apiName = val + '?page=1&pageSize=10';
  //           dataObj.srcIpType = PRIVATE;
  //         } else {
  //           apiName = val + '?page=1&pageSize=10000';
  //           dataObj.srcIpType = PUBLIC;
  //         }
  //       }

  //       return {
  //         url: `${baseUrl}/api/alert/${apiName}`,
  //         data: JSON.stringify(dataObj),
  //         type: 'POST',
  //         contentType: 'text/plain'
  //       };
  //     });

  //     this.ah.all(apiArr)
  //     .then(data => {
  //       const alertStatisticData = {
  //         alertPie: helper.setChartData(data[0]),
  //         alertPrivateTable: data[1],
  //         alertPublicTable: data[2]
  //       };
  //       let alertDetails = {
  //         privateCount: data[1].privateCounts,
  //         publicCount: data[1].publicCounts,
  //         public: data[2].rows,
  //         publicFormatted: {
  //           srcIp: {},
  //           destIp: {}
  //         }
  //       };
  //       let publicData = {
  //         srcIp: {},
  //         destIp: {}
  //       };

  //       _.forEach(alertDetails.public, val => {
  //         if (!publicData.srcIp[val.content.srcIp]) {
  //           publicData.srcIp[val.content.srcIp] = [];
  //         }

  //         if (!publicData.destIp[val.content.destIp]) {
  //           publicData.destIp[val.content.destIp] = [];
  //         }

  //         publicData.srcIp[val.content.srcIp].push(val);
  //         publicData.destIp[val.content.destIp].push(val);
  //       })

  //       alertDetails.publicFormatted.srcIp = publicData.srcIp;
  //       alertDetails.publicFormatted.destIp = publicData.destIp;

  //       this.setState({
  //         updatedTime: helper.getFormattedDate(Moment()),
  //         mapType: PUBLIC,
  //         alertStatisticData,
  //         alertDetails
  //       }, () => {
  //         this.getChartsData();
  //       });

  //       return null;
  //     })
  //     .catch(err => {
  //       helper.showPopupMsg('', t('txt-error'), err.message);
  //     })
  //   }
  // }
  // getFilterData = (data) => {
  //   const filterData = _.filter(data, (val, i) => {
  //     if (i < 10) {
  //       return val;
  //     }
  //   });

  //   return filterData;
  // }
  // getChartsData = () => {
  //   const {alertStatisticData} = this.state;
  //   const tableArr = ['alertPrivateTable', 'alertPublicTable'];
  //   let tempChartData = {};

  //   _.forEach(tableArr, val => {
  //     tempChartData[val] = [];
  //   })

  //   if (!_.isEmpty(alertStatisticData)) {
  //     _.forEach(tableArr, val => {
  //       tempChartData[val].chartData = _.map(alertStatisticData[val].rows, val => {
  //         return val.content;
  //       });
  //     })
  //   }

  //   const alertChartsData = {
  //     statistic: alertStatisticData.alertPie,
  //     private: this.getFilterData(tempChartData.alertPrivateTable.chartData),
  //     public: this.getFilterData(tempChartData.alertPublicTable.chartData)
  //   };

  //   this.setState({
  //     alertChartsData
  //   });
  // }
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

    _.forEach(alertMapData.all, val => {
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
  getFloorPlan = () => {
    const {baseUrl} = this.props;

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
  }
  filterTopologyData = (mainData, matchObjPath, matchID) => {
    const filterData = _.filter(mainData, { 'srcLocType': 2 }); //Filter the intranet (type: 2)
    const data = _.filter(filterData, obj => { //Get the data for the selected area
      return _.get(obj, matchObjPath) === matchID;
    });
    return data;
  }
  getFloorList = () => {
    const {floorPlan, alertDetails} = this.state;
    let tempFloorPlan = {...floorPlan};
    let attacksCount = {};
    let floorList = [];
    let currentFloor = '';

    const privateTopoData = _.map(alertDetails.private, val => {
      return val.content;
    });

    _.forEach(floorPlan.treeData, val => {
      helper.floorPlanRecursive(val, obj => {
        const filterData = this.filterTopologyData(privateTopoData, 'srcTopoInfo.areaUUID', obj.areaUUID);
        const count = filterData.length;

        floorList.push({
          value: obj.areaUUID,
          text: obj.areaName + ' (' + count + ')'
        });
      });
    })

    currentFloor = floorList[0].value;

    this.setState({
      floorList,
      currentFloor
    }, () => {
      this.getAreaData(currentFloor);
    });
  }
  handleFloorChange = (areaUUID) => {
    this.getAreaData(areaUUID);
  }
  getAreaData = (areaUUID) => {
    const {baseUrl, contextRoot} = this.props;
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
        this.getSeatData(areaUUID);
      });
    })
  }
  getSeatData = (areaUUID) => {
    const {alertDetails} = this.state;
    let tempAlertDetails = [];
    let tempSeatID = '';
    let seatListArr = [];
    let seatData = {};

    _.forEach(alertDetails.private, val => {
      if (val.content.srcTopoInfo && val.content.srcTopoInfo.areaUUID === areaUUID) {
        if (tempSeatID) {
          if (tempSeatID !== val.content.srcTopoInfo.seatUUID) {
            tempSeatID = val.content.srcTopoInfo.seatUUID;
            tempAlertDetails.push(val.content.srcTopoInfo);
          }
        } else {
          tempSeatID = val.content.srcTopoInfo.seatUUID;
          tempAlertDetails.push(val.content.srcTopoInfo);
        }
      }
    });

    if (tempAlertDetails.length > 0) {
      _.forEach(tempAlertDetails, val => {
        let tempSeatData = [];

        _.forEach(alertDetails.private, val2 => {
          if (val2.content.srcTopoInfo && val2.content.srcTopoInfo.seatUUID === val.seatUUID) {
            tempSeatData.push(val2.content);
          }
        })

        seatListArr.push({
          id: val.seatUUID,
          type: 'spot',
          xy: [val.seatCoordX, val.seatCoordY],
          label: val.seatName,
          data: {
            count: tempSeatData.length,
            seatName: val.seatName,
            areaFullName: val.areaFullName,
            srcIp: val.srcIp,
            srcMac: val.srcMac,
            ownerName: val.ownerName,
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
  showPrivateTooltip = (data) => {
    if (data) {
      return `
        <div class='map-tooltip'>
          <div><span class='key'>${t('payloadsFields.attacksCount')}:</span> <span class='count'>${data.count}</span></div>
          <div><span class='key'>${t('attacksFields.srcIp')}:</span> <span class='value'>${data.srcIp}</span></div>
          <div><span class='key'>${t('ipFields.mac')}:</span> <span class='value'>${data.srcMac}</span></div>
          <div><span class='key'>${t('ipFields.areaFullName')}:</span> <span class='value'>${data.areaFullName}</span></div>
          <div><span class='key'>${t('ipFields.seat')}:</span> <span class='value'>${data.seatName}</span></div>
          <div><span class='key'>${t('ipFields.owner')}:</span> <span class='value'>${data.ownerName}</span></div>
        </div>
        `
    }
  }
  toggleMaps = (type) => {
    this.setState({
      mapType: type
    }, () => {
      if (this.state.mapType === PRIVATE) {
        //this.loadBarChartData('getPrivate');
      }
    });
  }
  showTopoDetail = (type, id, eventInfo) => {
    return;

    const {alertDetails} = this.state;
    let tempAlertDetails = {...alertDetails};
    let data = '';

    if (!id) {
      return;
    }

    tempAlertDetails.currentIndex = 0;
    tempAlertDetails.currentID = id;

    if (type === PUBLIC) {
      const uniqueIP = id;

      if (id.indexOf('.') < 0) {
        return;
      }

      data = alertDetails.publicFormatted.srcIp[uniqueIP] || alertDetails.publicFormatted.destIp[uniqueIP];
      tempAlertDetails.currentLength = data.length;
    } else if (type === PRIVATE) {
      const seatUUID = id;
      let tempPrivateData = [];

      _.forEach(alertDetails.private, val => {
        if (val.content.srcTopoInfo && val.content.srcTopoInfo.seatUUID === seatUUID) {
          tempPrivateData.push(val.content);
        }
      })

      tempAlertDetails.privateFormatted = tempPrivateData;
      tempAlertDetails.currentLength = tempPrivateData.length;
      data = tempPrivateData[0];
    }

    this.setState({
      alertDetails: tempAlertDetails
    }, () => {
      this.openDetailInfo(type, '', data);
    });
  }
  showAlertData = (type) => {
    const {top10alerts, chartType, alertChartsData, alertDetails} = this.state;
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
      let currentIndex = '';
      let data = '';

      if (top10alerts) {
        currentIndex = alertDetails.currentIndex;

        if (chartType === PRIVATE) {
          data = alertChartsData.private[alertDetails.currentIndex];
        } else if (chartType === PUBLIC) {
          data = alertChartsData.public[alertDetails.currentIndex];
        }
      } else {
        if (chartType === PRIVATE) {
          data = alertDetails.privateFormatted[alertDetails.currentIndex];
        } else if (chartType === PUBLIC) {
          data = alertDetails.publicFormatted.srcIp[alertDetails.currentID] || alertDetails.publicFormatted.destIp[alertDetails.currentID];
        }
      }
      this.openDetailInfo(chartType, currentIndex, data);
    });
  }
  openDetailInfo = (type, index, data, evt) => {
    const {alertDetails} = this.state;
    let tempAlertDetails = {...alertDetails};
    let top10alerts = '';
    let chartType = '';

    if (type.indexOf(PRIVATE) > -1) {
      chartType = PRIVATE;
    } else if (type.indexOf(PUBLIC) > -1) {
      chartType = PUBLIC;
    }

    if (index.toString()) {
      top10alerts = true;
      tempAlertDetails.currentIndex = Number(index);

      if (chartType === PRIVATE) {
        if (tempAlertDetails.privateCount < 10) {
          tempAlertDetails.currentLength = tempAlertDetails.privateCount;
        }
      } else if (chartType === PUBLIC) {
        if (tempAlertDetails.publicCount < 10) {
          tempAlertDetails.currentLength = tempAlertDetails.publicCount;
        }
      }

      if (!tempAlertDetails.currentLength) {
        tempAlertDetails.currentLength = 10;
      }
    } else {
      if (alertDetails.currentIndex.toString() !== '') {
        top10alerts = false;

        if (chartType === PUBLIC) {
          data = data[alertDetails.currentIndex].content;
        }
      }
    }

    this.setState({
      alertDetails: tempAlertDetails,
      top10alerts,
      chartType,
      alertData: data,
      modalOpen: true
    });
  }
  modalDialog = () => {
    const {baseUrl, contextRoot, language} = this.props;
    const {alertDetails, alertData} = this.state;
    const actions = {
      confirm: {text: t('txt-close'), handler: this.closeDialog}
    };

    return (
      <AlertDetails
        baseUrl={baseUrl}
        contextRoot={contextRoot}
        language={language}
        titleText={t('alert.txt-alertInfo')}
        actions={actions}
        alertDetails={alertDetails}
        alertData={alertData}
        showAlertData={this.showAlertData}
        fromPage='dashboard' />
    )
  }
  closeDialog = () => {
    this.setState({
      alertData: '',
      top10alerts: '',
      chartType: '',
      alertDetails: {
        ...this.state.alertDetails,
        currentID: '',
        currentIndex: '',
        currentLength: ''
      },
      modalOpen: false
    });
  }
  toggleTab = (tab) => {
    if (tab === 'maps') {
      this.getWorldMap();
    }

    this.setState({
      activeTab: tab
    });
  }
  // testChartFunction = (evt, data, cfg) => {
  //   const {baseUrl, contextRoot} = this.props;
  //   const url = `${baseUrl}${contextRoot}/syslog?service=${data[0].service}`;
  //   window.open(url, '_blank');
  // }
  render() {
    const {
      updatedTime,
      activeTab,
      chartAttributes,
      alertAggregations,
      alertChartsData,
      alertDetails,
      mapType,
      geoJson,
      floorList,
      currentFloor,
      currentMap,
      currentBaseLayers,
      seatData,
      modalOpen
    } = this.state;

    const alertChartsList = [{
      chartID: t('dashboard.txt-alertThreatLevel'),
      chartTitle: t('dashboard.txt-alertThreatLevel'),
      chartKeyLabels: {
        key: t('txt-level'),
        doc_count: t('txt-count')
      },
      chartValueLabels: {
        'Pie Chart': {
          key: t('txt-level'),
          doc_count: t('txt-count')
        }
      },
      chartDataCfg: {
        splitSlice: ['key'],
        sliceSize: 'doc_count'
      },
      chartData: alertAggregations,
      type: 'pie'
    }];

    // const tempAlertChartsList = [
    //   {
    //     chartKeyLabels: {
    //       service: t('txt-service'),
    //       number: t('txt-count')
    //     },
    //     chartValueLabels: {
    //       'Pie Chart': {
    //         service: t('txt-service'),
    //         number: t('txt-count')
    //       }
    //     },
    //     chartDataCfg: {
    //       splitSlice: ['service'],
    //       sliceSize: 'number'
    //     },
    //     chartData: alertChartsData.statistic,
    //     type: 'pie'
    //   },
    //   {
    //     chartFields: {
    //       '_eventDttm_': {
    //         label: t('alert.txt-alertTime'),
    //         sortable: true,
    //         formatter: (value) => {
    //           return helper.getFormattedDate(value);
    //         }
    //       },
    //       'alertInformation.type': {
    //         label: t('dashboard.txt-alertType'),
    //         sortable: true,
    //         formatter: (value, allValue) => {
    //           if (allValue.vpnName) {
    //             return 'Honeynet';
    //           }
    //           return value;
    //         }
    //       },
    //       srcIp: {
    //         label: t('alert.txt-ipSrc'),
    //         sortable: true
    //       },
    //       'srcTopoInfo.areaName': {
    //         label: t('dashboard.txt-deviceName'),
    //         sortable: true
    //       },
    //       'srcTopoInfo.ownerName': {
    //         label: t('dashboard.txt-ownerName'),
    //         sortable: true
    //       }
    //     },
    //     chartData: alertChartsData.private,
    //     sort: {
    //       field: '_eventDttm_',
    //       desc: true
    //     },
    //     type: 'table'
    //   },
    //   {
    //     chartFields: {
    //       '_eventDttm_': {
    //         label: t('alert.txt-alertTime'),
    //         sortable: true,
    //         formatter: (value) => {
    //           return helper.getFormattedDate(value);
    //         }
    //       },
    //       'alertInformation.type': {
    //         label: t('dashboard.txt-alertType'),
    //         sortable: true,
    //         formatter: (value, allValue) => {
    //           if (allValue.vpnName) {
    //             return 'Honeynet';
    //           }
    //           return value;
    //         }
    //       },
    //       srcIp: {
    //         label: t('alert.txt-ipSrc'),
    //         sortable: true
    //       },
    //       srcCountryCode: {
    //         label: t('dashboard.txt-srcCountry'),
    //         sortable: true
    //       },
    //       srcCity: {
    //         label: t('dashboard.txt-srcCity'),
    //         sortable: true
    //       }
    //     },
    //     chartData: alertChartsData.public,
    //     sort: {
    //       field: '_eventDttm_',
    //       desc: true
    //     },
    //     type: 'table'
    //   }
    // ];

    // const alertChartsList = _.map(tempAlertChartsList, (val, i) => {
    //   return {
    //     chartID: CHARTS_ID[i], //Insert chart ID
    //     chartTitle: t(CHARTS_TITLE[i]), //Insert chart title
    //     ...val
    //   }
    // });

    return (
      <div>
        {modalOpen &&
          this.modalDialog()
        }

        <div className='sub-header dashboard'>
          <div className='secondary-btn-group left'>
            <button className={cx({'active': activeTab === 'statistics'})} onClick={this.toggleTab.bind(this, 'statistics')}>{t('dashboard.txt-statisticsInfo')}</button>
            <button className={cx({'active': activeTab === 'maps'})} onClick={this.toggleTab.bind(this, 'maps')}>{t('dashboard.txt-attacksMap')}</button>
            <span className='date-time'>{updatedTime}</span>
          </div>
        </div>

        <div className='main-dashboard c-flex'>
          {activeTab === 'statistics' &&
            <div className='charts'>
              {!_.isEmpty(chartAttributes.data) &&
                <div className='chart-group bar'>
                  <header>{t('dashboard.txt-alertStatistics')}</header>
                  <BarChart
                    stacked
                    vertical
                    {...chartAttributes} />
                </div>
              }
              {
                alertChartsList.map((key, i) => {
                  if (alertChartsList[i].type === 'pie') {
                    return (
                      <div className='chart-group c-box' key={alertChartsList[i].chartID}>
                        <PieChart
                          id={alertChartsList[i].chartID}
                          title={alertChartsList[i].chartTitle}
                          data={alertChartsList[i].chartData}
                          keyLabels={alertChartsList[i].chartKeyLabels}
                          valueLabels={alertChartsList[i].chartValueLabels}
                          dataCfg={alertChartsList[i].chartDataCfg} />
                      </div>
                    )
                  } else if (alertChartsList[i].type === 'table') {
                    return (
                      <div className='chart-group' key={alertChartsList[i].chartID}>
                        <header>{alertChartsList[i].chartTitle}</header>
                        <div id={alertChartsList[i].chartID} className='c-chart table'>
                          <DataTable
                            className='main-table overflow-scroll'
                            fields={alertChartsList[i].chartFields}
                            data={alertChartsList[i].chartData}
                            defaultSort={alertChartsList[i].chartData ? alertChartsList[i].sort : {}}
                            onRowClick={this.openDetailInfo.bind(this, alertChartsList[i].chartID)} />
                        </div>
                      </div>
                    )
                  }
                })
              }
            </div>
          }

          {activeTab === 'maps' &&
            <div className='maps'>
              <div className='secondary-btn-group left'>
                <button className={cx({'active': mapType === PUBLIC})} onClick={this.toggleMaps.bind(this, PUBLIC)}>{t('dashboard.txt-public')}</button>
                <button className={cx({'active': mapType === PRIVATE})} onClick={this.toggleMaps.bind(this, PRIVATE)}>{t('dashboard.txt-private')}</button>
              </div>
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
              {mapType === PRIVATE &&
                <div className='floor-map'>
                  <DropDownList
                    className='drop-down'
                    list={floorList}
                    required={true}
                    onChange={this.handleFloorChange}
                    value={currentFloor} />
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
              }
            </div>
          }
        </div>
      </div>
    )
  }
}

Dashboard.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  session: PropTypes.object.isRequired
};

Dashboard.defaultProps = {
};

const HocDashboard = withRouter(withLocale(Dashboard));
export { Dashboard, HocDashboard };