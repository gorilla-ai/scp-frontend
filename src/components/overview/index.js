import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Gis from 'react-gis/build/src/components'
import RadioGroup from 'react-ui/build/src/components/radio-group'

import {BaseDataContext} from '../common/context';
import helper from '../common/helper'
import WORLDMAP from '../../mock/world-map-low.json'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};

/**
 * Overview
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Overview page
 */
class Overview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      datetime: {
        from: helper.getSubstractDate(24, 'hours'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
        //from: '2020-08-02T01:00:00Z',
        //to: '2020-08-02T01:10:00Z'
      },
      past24hTime: helper.getFormattedDate(helper.getSubstractDate(24, 'hours')),
      updatedTime: helper.getFormattedDate(Moment()),
      alertMapData: [],
      worldMapData: [],
      worldAttackData: [],
      mapInterval: 5,
      mapLimit: 20,
      mapCounter: 1,
      pathSpeed: 1000,
      countDown: ''
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getWorldMap();
    this.loadAlertData();
    this.setInterval();
  }
  componentWillUnmount() {
    this.clearInterval('mapInterval');
    this.clearInterval('timer');
  }
  /**
   * Set time interval for each data to be displayed
   * @method
   */
  setInterval = () => {
    this.mapInterval = setInterval(this.getAttackData, this.state.mapInterval * 1000);
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
        id: val.properties.name,
        type: 'geojson',
        geojson: val.geometry,
        weight: 0.6,
        fillColor: '#424242',
        color: '#303030',
        fillOpacity: 1
      }
    });

    this.setState({
      worldMapData
    });
  }
  /**
   * Get and set alert maps data
   * @method
   */
  loadAlertData = () => {
    const {baseUrl} = this.context;
    const {datetime} = this.state;
    const dateTime = {
      from: Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };
    const url = `${baseUrl}/api/u2/alert/_search?page=1&pageSize=10000`;
    const requestData = {
      timestamp: [dateTime.from, dateTime.to],
      filters: [{
        condition: 'must',
        query: 'ExternalSrcCountry'
      }]
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }, {showProgress: true})
    .then(data => {
      if (data) {
        const tempArray = _.map(data.data.rows, val => {
          val._source.id = val._id;
          return val._source;
        });
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

        this.setState({
          past24hTime: helper.getFormattedDate(helper.getSubstractDate(24, 'hours')),
          updatedTime: helper.getFormattedDate(Moment()),
          alertMapData: tempArray
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get and set attack data for new map (based on interval)
   * @method
   */
  getAttackData = () => {
    const {alertMapData, mapLimit, mapCounter} = this.state;
    const dataSet = mapLimit * mapCounter; //Data set to be shown on map
    let worldAttackData = [];

    if (alertMapData.length === 0) {
      return;
    }

    _.forEach(alertMapData, (val, i) => {
      if (mapCounter === 1) { //Initial set of data
        if (i >= mapLimit) return false; //Index greater than first set, exit the loop
      } else {
        if (i < dataSet - mapLimit) return; //Index is small than initial data set, continue the loop
        if (i > dataSet) return false; //Index is greater than data set, exit the loop
      }

      const timestamp = helper.getFormattedDate(val._eventDttm_ || val.timestamp, 'local');

      if (val.srcLatitude && val.srcLongitude) {
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
      }

      if (val.destLatitude && val.destLongitude) {
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
      }
    })

    this.clearInterval('timer');

    let setCounter = mapCounter;

    this.setState({
      worldAttackData,
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
      val.setAttribute('style', `stroke-dasharray: ${this.state.pathSpeed}; animation-duration: ${this.state.mapInterval}s;`);
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
   * Set attack path speed
   * @method
   * @param {string} val - path speed
   */
  handlePathSpeedChange = (val) => {
    this.setState({
      pathSpeed: Number(val)
    }, () => {
      this.setAnimationConfig();
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
      worldAttackData: [],
      [type]: Number(val),
      mapCounter: 1,
      countDown: ''
    }, () => {
      this.clearInterval('mapInterval');
      this.clearInterval('timer');
      this.setInterval();
    });
  }
  render() {
    const {
      past24hTime,
      updatedTime,
      worldMapData,
      worldAttackData,
      mapInterval,
      mapLimit,
      pathSpeed,
      countDown
    } = this.state;
    const displayTime = past24hTime + ' - ' + updatedTime;

    return (
      <div>
        <div className='sub-header overview'>
          <RadioGroup
            id='attackPathType'
            className='radio-group'
            list={[
              {value: 1000, text: 'Normal'},
              {value: 100, text: 'Fast'},
              {value: 50, text: 'Faster'},
              {value: 0, text: 'No animation'}
            ]}
            value={pathSpeed}
            onChange={this.handlePathSpeedChange} />
          <div className='dropdown'>
            <label>Data count: </label>
            <DropDownList
              id='mapLimitList'
              required={true}
              list={[
                {value: 10, text: 10},
                {value: 20, text: 20},
                {value: 50, text: 50}
              ]}
              value={mapLimit}
              onChange={this.handleMapConfigChange.bind(this, 'mapLimit')} />
          </div>
          <div className='dropdown'>
            <label>Interval: </label>
            <DropDownList
              id='mapIntervalList'
              required={true}
              list={[
                {value: 5, text: 5},
                {value: 10, text: 10},
                {value: 15, text: 15}
              ]}
              value={mapInterval}
              onChange={this.handleMapConfigChange.bind(this, 'mapInterval')} />
          </div>
          {countDown && countDown >= 0 &&
            <span className='count-down'>{countDown}s</span>
          }
          <span className='date-time'>{displayTime}</span>
        </div>

        <div className='main-overview'>
          {worldAttackData.length === 0 &&
            <div className='loader-wrap'>
              <i className='fg fg-loading-2'></i>
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
              //console.log('clicked', id)
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

Overview.contextType = BaseDataContext;

Overview.propTypes = {
};

export default Overview;