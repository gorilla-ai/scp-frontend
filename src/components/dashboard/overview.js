import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'

import Gis from 'react-gis/build/src/components'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import WORLDMAP from '../../mock/world-map-low.json'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};
const PAGE_RESET_INTERVAL = 300000; //5 minutes
const PATH_SPEED = '50,5,10,5';
const PATH_DURATION = 10; //10 seconds

/**
 * Overview
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Overview page
 */
class DashboardOverview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dateTime: {
        from: '',
        to: ''
      },
      past24hTime: helper.getFormattedDate(helper.getSubstractDate(24, 'hours')),
      updatedTime: helper.getFormattedDate(moment()),
      alertMapData: [],
      worldMapData: [],
      countryData: [],
      worldAttackData: null,
      alertDisplayData: [],
      threatsCountData: [],
      countryTopList: [],
      selectedAttackData: [],
      mapInterval: 5,
      mapLimit: 20,
      mapCounter: 1,
      countDown: '',
      showAlertInfo: true
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getWorldMap();
    this.loadAlertData();
    this.setInterval();

    this.pageRefresh = setInterval(this.resetData, PAGE_RESET_INTERVAL);
  }
  componentWillUnmount() {
    this.clearInterval('pageRefresh');
    this.clearInterval('mapInterval');
    this.clearInterval('timer');
  }
  /**
   * Reset data for page refresh
   * @method
   */
  resetData = () => {
    const {worldAttackData} = this.state;

    if (worldAttackData && worldAttackData.length > 0) {
      this.setState({
        worldAttackData: null,
        alertDisplayData: [],
        mapCounter: 1,
        countDown: '',
        showAlertInfo: true
      }, () => {
        this.loadAlertData();
      });
    }
  }
  /**
   * Set time interval for each data to be displayed
   * @method
   */
  setInterval = () => {
    this.mapInterval = setInterval(this.setAttackData, this.state.mapInterval * 1000);
  }
  /**
   * Clear time interval
   * @method
   * @param {string} type - 'mapInterval' or 'timer'
   */
  clearInterval = (type) => {
    this[type] && clearInterval(this[type]);
    this[type] = null;
  }
  /**
   * Get world map data
   * @method
   */
  getWorldMap = () => {
    const worldMapData = _.map(WORLDMAP.features, val => {
      return {
        id: val.properties.iso_a2,
        type: 'geojson',
        geojson: val.geometry,
        weight: 0.6,
        fillColor: '#424242',
        color: '#303030',
        fillOpacity: 1
      };
    });

    let countryData = {};

    _.forEach(WORLDMAP.features, val => {
      countryData[val.properties.iso_a2] = val.properties.name;
    });

    this.setState({
      worldMapData,
      countryData
    });
  }
  /**
   * Get and set alert maps data
   * @method
   */
  loadAlertData = () => {
    const {baseUrl} = this.context;
    const datetime = {
      from: helper.getSubstractDate(24, 'hours'),
      to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
    };
    const dateTime = {
      from: moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };

    /* Get Country top ranks data */
    const requestData = {
      timestamp: [dateTime.from, dateTime.to],
      filters: [
        {
          condition: 'must',
          query: 'ExternalSrcCountryCode'
        }
      ]
    };

    this.ah.one({
      url: `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0&skipHistogram=true`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'application/json'
    })
    .then(data => {
      if (data) {
        let countryTopList = [];

        if (data.aggregations) {
          countryTopList = data.aggregations.ExternalSrcCountryCode.srcCountryCode.buckets;
        }

        this.setState({
          countryTopList
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    /* Get Alert data */
    this.ah.one({
      url: `${baseUrl}/api/alert/overview?startDttm=${dateTime.from}&endDttm=${dateTime.to}`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        const tempArray = _.map(data.data.rows, val => {
          val.id = val.srcCity + '-' + val.destCity + '-' + val._eventDttm_;
          return val;
        });
        let alertMapData = [];

        _.forEach(tempArray, val => {
          if (val.srcLatitude && val.srcLatitude && val.destLatitude && val.destLongitude) {
            alertMapData.push(val);
          }
        })
        
        let threatsCountData = [];

        _.forEach(SEVERITY_TYPE, val => {
          _.forEach(data.aggregations, (val2, key) => {
            if (key === val) {
              threatsCountData.push({
                name: key,
                count: data.aggregations[key].doc_count
              });
            }
          })
        })

        this.setState({
          alertMapData,
          threatsCountData
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    /* Set Datetime */
    this.setState({
      dateTime: {
        from: dateTime.from,
        to: dateTime.to
      },
      past24hTime: helper.getFormattedDate(helper.getSubstractDate(24, 'hours')),
      updatedTime: helper.getFormattedDate(moment())
    });
  }
  /**
   * Determine the data loop to show on map
   * @method
   */
  setAttackData = () =>{
    const {alertMapData, mapLimit, mapCounter} = this.state;
    const dataSet = mapLimit * mapCounter; //Data set to be shown on map

    if (dataSet - alertMapData.length >= mapLimit) { //No more data to show, restart the counter
      this.setState({
        mapCounter: 1
      }, () => {
        this.getAttackData();
      });
    } else {
      this.getAttackData();
    }
  }
  /**
   * Get and set attack data for new map (based on interval)
   * @method
   */
  getAttackData = () => {
    const {alertMapData, mapLimit, mapInterval, mapCounter} = this.state;
    const dataSet = mapLimit * mapCounter; //Data set to be shown on map
    let worldAttackData = [];
    let alertDisplayData = [];

    if (alertMapData.length === 0) {
      this.setState({
        worldAttackData
      });
      return;
    }

    _.forEach(alertMapData, (val, i) => {
      if (mapCounter === 1) { //Initial set of data
        if (i >= mapLimit) { //Index is greater than the first set, exit the loop
          return false;
        }
      } else {
        if (i < dataSet - mapLimit) { //Index is smaller than the initial data set, continue the loop
          return;
        }

        if (i > dataSet) { //Index is greater than the data set, exit the loop
          return false;
        }
      }

      const timestamp = helper.getFormattedDate(val._eventDttm_ || val.timestamp, 'local');

      worldAttackData.push({
        type: 'polyline',
        id: 'set-polyline_' + i,
        color: ALERT_LEVEL_COLORS[val._severity_],
        latlng: [
          [val.srcLatitude, val.srcLongitude],
          [val.destLatitude, val.destLongitude]
        ],
        directed: false
      });

      worldAttackData.push({
        type: 'spot',
        id: 'setSpotSmall' + i,
        className: 'spot-small',
        latlng: [
          val.destLatitude,
          val.destLongitude
        ],
        data: {
          type: 'small',
          color: ALERT_LEVEL_COLORS[val._severity_]
        }
      });

      worldAttackData.push({
        type: 'spot',
        id: 'setSpotBig' + i,
        className: 'spot-big',
        latlng: [
          val.destLatitude,
          val.destLongitude
        ],
        data: {
          type: 'big',
          color: ALERT_LEVEL_COLORS[val._severity_]
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

      alertDisplayData.push(val);
    });

    this.clearInterval('timer');

    let setCounter = mapCounter;

    this.setState({
      worldAttackData,
      alertDisplayData,
      mapCounter: ++setCounter
    }, () => {
      this.setAnimationConfig();
      this.startTimer();
    });
  }
  /**
   * Set attack path animation
   * @method
   */
  setAnimationConfig = () => {
    const polyLine = document.getElementsByClassName('gis-polyline');

    _.forEach(polyLine, val => {
      val.setAttribute('style', `stroke-dasharray: ${PATH_SPEED}; animation-duration: ${PATH_DURATION}s;`);
    })
  }
  /**
   * Start timer for countdown display
   * @method
   */
  startTimer = () => {
    this.setState({
      countDown: this.state.mapInterval
    }, () => {
      this.timer = setInterval(this.displayCountDown, 1000); //Every 1 second
    });
  }
  /**
   * Set countdown
   * @method
   */
  displayCountDown = () => {
    this.setState({
      countDown: this.state.countDown - 1
    });
  }
  /**
   * Set map config
   * @method
   * @param {string} type - 'mapLimit' or 'mapInterval'
   * @param {string} val - map config data
   */
  handleMapConfigChange = (type, val) => {
    this.setState({
      worldAttackData: null,
      alertDisplayData: [],
      [type]: Number(val),
      mapCounter: 1,
      countDown: '',
      showAlertInfo: true
    }, () => {
      this.clearInterval('mapInterval');
      this.clearInterval('timer');
      this.setInterval();
    });
  }
  /**
   * Display alert info in map
   * @method
   * @param {object} val - alert data
   * @param {number} i - index of the alert info data
   * @returns HTML DOM
   */
  displayAlertInfo = (val, i) => {
    if (val.srcCountry && val.destCountry) {
      return (
        <li key={i}>
          <div className='count' style={{backgroundColor: ALERT_LEVEL_COLORS[val._severity_]}}>{helper.numberWithCommas(val.srcDestCityCnt)}</div>
          <div className='data'>
            <div className='info'>{val.Info}</div>
            <div className='datetime'>{moment(val._eventDttm_).local().format('HH:mm:ss')}</div>
            <div className='country'>{val.srcCountry} <i className='fg fg-next' style={{color: ALERT_LEVEL_COLORS[val._severity_]}}></i> {val.destCountry}</div>
          </div>
        </li>
      )
    }
  }
  /**
   * Display threats count in map
   * @method
   * @param {object} val - threats data
   * @param {number} i - index of the threats count data
   * @returns HTML DOM
   */
  displayThreatsCount = (val, i) => {
    return (
      <div key={i} className='item'>
        <i className='fg fg-checkbox-fill' style={{color: ALERT_LEVEL_COLORS[val.name]}}></i>
        <div className='threats'>{val.name}<span>{helper.numberWithCommas(val.count)}</span></div>
      </div>
    )
  }
  /**
   * Toggle alert info on/off
   * @method
   */  
  toggleShowAlertInfo = () => {
    this.setState({
      showAlertInfo: !this.state.showAlertInfo
    });
  }
  /**
   * Get attack data for specific country
   * @method
   * @param {string} countryCode - country code from user's selection
   */
  getCountryAttackData = (countryCode) => {
    const {baseUrl} = this.context;
    const {dateTime} = this.state;
    const url = `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0&skipHistogram=true`;

    if (!countryCode || countryCode.length > 2) { //If clicking on spots, don't show dialog
      return;
    }

    const requestData = {
      timestamp: [dateTime.from, dateTime.to],
      filters: [
        {
          condition: 'must',
          query: 'ExternalSrcCountry'
        },
        {
          condition: 'must',
          query: 'srcCountryCode: ' + countryCode
        }
      ]
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'application/json'
    })
    .then(data => {
      if (data) {
        let selectedAttackData = [];

        if (data.aggregations) {
          _.forEach(SEVERITY_TYPE, val => {
            _.forEach(data.aggregations, (val2, key) => {
              if (key === val) {
                selectedAttackData.push({
                  name: key,
                  count: data.aggregations[key].doc_count
                });
              }
            })
          })
        }

        this.setState({
          selectedAttackData
        }, () => {
          this.showCountryAttackInfo(countryCode);
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display attack table
   * @method
   * @param {string} val - attack data
   * @param {number} i - index of the attack data
   * @returns HTML DOM
   */
  displayAttackCount = (val, i) => {
    const {selectedAttackData} = this.state;
    let totalCount = 0;
    let percentage = 0;

    _.forEach(selectedAttackData, val => {
      totalCount += val.count;
    })

    if (totalCount > 0) {
      percentage = (val.count / totalCount) * 100;
    }

    return (
      <tr key={i}>
        <td>
          <i className='fg fg-checkbox-fill' style={{color: ALERT_LEVEL_COLORS[val.name]}}></i>{val.name}
        </td>
        <td>{helper.numberWithCommas(val.count)}</td>
        <td>{percentage.toFixed(0)}%</td>
      </tr>
    )
  }
  /**
   * Get country attack content
   * @method
   * @param {string} countryCode - selected country code from user
   * @returns HTML DOM
   */
  displayCountryAttackContent = (countryCode) => {
    const {countryTopList, selectedAttackData} = this.state;
    let rank = 0;

    _.forEach(countryTopList, (val, i) => {
      if (countryCode === val.key) {
        rank = i + 1;
        return false;
      }
    })

    return (
      <div>
        {rank > 0 &&
          <span className='country-rank'>{t('txt-threatsSrcCountryRank')}: {rank}</span>
        }

        <table className='c-table main-table severity'>
          <thead>
            <tr>
              <th>{t('txt-severity')}</th>
              <th>{t('txt-count')}</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {selectedAttackData.map(this.displayAttackCount)}
          </tbody>
        </table>
      </div>
    )
  }
  /**
   * Open dialog to show country attack info
   * @method
   * @param {string} countryCode - selected country code from user
   */
  showCountryAttackInfo = (countryCode) => {
    PopupDialog.alert({
      title: this.state.countryData[countryCode],
      id: 'modalWindowSmall',
      confirmText: t('txt-close'),
      display: this.displayCountryAttackContent(countryCode)
    });
  }
  render() {
    const {
      past24hTime,
      updatedTime,
      worldMapData,
      worldAttackData,
      alertDisplayData,
      threatsCountData,
      mapInterval,
      mapLimit,
      countDown,
      showAlertInfo
    } = this.state;
    const displayTime = past24hTime + ' - ' + updatedTime;

    return (
      <div>
        <div className='sub-header overview'>
          {helper.getDashboardMenu('overview')}

          <span className='date-time-display'>{displayTime}</span>
        </div>

        <div className='main-overview'>
          {!worldAttackData &&
            <div className='loader-wrap'>
              <i className='fg fg-loading-2'></i>
            </div>
          }

          {alertDisplayData.length > 0 &&
            <i className={`toggle-info fg fg-arrow-${showAlertInfo ? 'top' : 'bottom'}`} onClick={this.toggleShowAlertInfo}></i>
          }

          {showAlertInfo && alertDisplayData.length > 0 &&
            <ul className='alert-info'>
              {alertDisplayData.map(this.displayAlertInfo)}
            </ul>
          }

          {alertDisplayData.length > 0 &&
            <div className='alert-count'>
              {threatsCountData.map(this.displayThreatsCount)}
            </div>
          }

          <Gis
            id='gisMapNew'
            ref={(ref) => {
              const gis = _.get(ref, '_component._component._component._component.gis');
              this.gisMapData = gis ? gis._map : null;
            }}
            data={worldMapData}
            layers={{
              world: {
                label: 'World Map',
                interactive: false,
                data: worldAttackData
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
            onClick={(id) => {
              this.getCountryAttackData(id);
            }}
            symbolOptions={[
              {
                match: {
                  type: 'spot'
                },
                props: {
                  'background-color': ({data}) => {
                    return data.color;
                  },
                  width: ({data}) => {
                    return data.type === 'small' ? '12px' : '36px';
                  },
                  height: ({data}) => {
                    return data.type === 'small' ? '12px' : '36px';
                  },
                  opacity: ({data}) => {
                    return data.type === 'small' ? '1' : '.3';
                  }
                }
              }
            ]}
            layouts={['standard']}
            dragModes={['pan']} />
        </div>
      </div>
    )
  }
}

DashboardOverview.contextType = BaseDataContext;

DashboardOverview.propTypes = {
};

export default DashboardOverview;