import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Gis from 'react-gis/build/src/components'

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

const mapInterval = 5; //seconds
const mapLimit = 20; //count
let mapCounter = 1;

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
      worldAttackData: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getWorldMap();
    this.loadAlertData();

    this.intervalId = setInterval(this.getAttackData, mapInterval * 1000);
  }
  componentWillUnmount() {
    this.intervalId && clearInterval(this.intervalId);
    this.intervalId = null;
  }
  /**
   * Get world map data
   * @method
   */
  getWorldMap = () => {
    let worldMapData = [];

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
      worldMapData.push(countryObj);
    });

    this.setState({
      worldMapData
    });
  }
  /**
   * Get and set alert maps data
   * @method
   */
  loadAlertData = (type) => {
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
    const {alertMapData} = this.state;
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

    mapCounter++;

    this.setState({
      worldAttackData
    });
  }
  render() {
    const {past24hTime, updatedTime, worldMapData, worldAttackData} = this.state;
    const displayTime = past24hTime + ' - ' + updatedTime;

    return (
      <div>
        <div className='sub-header'>
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