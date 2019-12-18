import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Moment from 'moment'
import cx from 'classnames'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

import PopupDialog from 'react-ui/build/src/components/popup-dialog'

const helper = {
  getDate: function(datetime) {
    return Moment(datetime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DDTHH:mm:ss') + 'Z';
  },
  getFormattedDate: function(val, timezone) {
    if (!val) {
      return '';
    }
    if (timezone === 'local') {
      val = Moment.utc(val).toDate();
      return Moment(val).local().format('YYYY-MM-DD HH:mm:ss');
    } else if (timezone === 'utc') {
      return Moment(val).utc().format('YYYY-MM-DD HH:mm:ss');
    } else if (timezone === 'unix') {
      return Moment.unix(val).format('YYYY-MM-DD HH:mm:ss');
    } else {
      let date = new Date(val);
      return Moment(date).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  getSubstractDate: function(val, type, date) {
    const dateTime = date ? date : new Date();
    return Moment(dateTime).local().subtract(val, type).format('YYYY-MM-DDTHH:mm:ss');
  },
  getAdditionDate: function(val, type, date) {
    const dateTime = date ? date : new Date();
    return Moment(dateTime).local().add(val, type).format('YYYY-MM-DDTHH:mm:ss');
  },
  getStartDate: function(val) {
    return Moment().local().startOf(val).format('YYYY-MM-DDTHH:mm:ss');
  },
  capitalizeFirstLetter: function(string) {
    string = string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  setChartData: function(data, property) {
    let innerObj = {};
    let dataArray = [];

    for (var key in data) {
      if (property) {
        innerObj = {
          service: key,
          number: data[key][property[0]],
          country: data[key][property[1]],
          city: data[key][property[2]],
          latitude: data[key][property[3]],
          longitude: data[key][property[4]]
        };
      } else {
        innerObj = {
          service: key,
          number: data[key]
        };
      }

      dataArray.push(innerObj);
    }
    return dataArray;
  },
  buildFilterDataArray: function(filterData) {
    let filterDataArr = [];

    _.forEach(filterData, val => {
      if (val.query) {
        filterDataArr.push({
          condition: val.condition,
          query: val.query
        });
      }
    })

    return filterDataArr;
  },
  arrayDataJoin: function(arr, field, separator) {
    let tempArray = [];

    for (var i = 0; i < arr.length; i++) {
      if (field) {
        tempArray.push(arr[i][field]);
      } else {
        tempArray.push(arr[i]);
      }
    }

    return tempArray.join(separator);
  },
  floorPlanRecursive: function(obj, func) {
    func(obj);

    if (obj.children) {
      _.forEach(obj.children, val => {
        this.floorPlanRecursive(val, func);
      })
    }
  },
  getColorList(index) {
    const colorList = ['#B80000', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#DB3E00', '#004DCF', '#5300EB', '#C1B748', '#660000'];

    return colorList[index];
  },
  getColor(index) {
    switch (index) {
      case 0:
        return 'red';
        break;
      case 1:
        return 'yellow';
        break;
      case 2:
        return 'green';
        break;
      case 3:
        return 'darkGreen';
        break;
      case 4:
        return 'blue';
        break;
      case 5:
        return 'orange';
        break;
      case 6:
        return 'darkBlue';
        break;
      case 7:
        return 'purple';
        break;
      case 8:
        return 'soil';
        break;
      case 9:
        return 'brown';
        break;
    }
  },
  showColor(color) {
    switch (color) {
      case '#B80000':
        return 'red';
        break;
      case '#DB3E00':
        return 'orange';
        break;
      case '#FCCB00':
        return 'yellow';
        break;
      case '#008B02':
        return 'green';
        break;
      case '#006B76':
        return 'darkGreen';
        break;
      case '#1273DE':
        return 'blue';
        break;
      case '#004DCF':
        return 'darkBlue';
        break;
      case '#5300EB':
        return 'purple';
        break;
      default:
        return 'yellow';
    }
  },
  getJsonViewTheme: function() {
    return {
      scheme: 'bright',
      author: 'chris kempson (http:\//chriskempson.com)',
      base00: '#000000',
      base01: '#303030',
      base02: '#505050',
      base03: '#b0b0b0',
      base04: '#d0d0d0',
      base05: '#e0e0e0',
      base06: '#f5f5f5',
      base07: '#ffffff',
      base08: '#fb0120',
      base09: '#fc6d24',
      base0A: '#fda331',
      base0B: '#a1c659',
      base0C: '#76c7b7',
      base0D: '#6fb3d2',
      base0E: '#d381c3',
      base0F: '#be643c'
    };
  },
  getAjaxData: function(type, url, dataObj) {
    const t = global.chewbaccaI18n.getFixedT(null, 'connections');

    if (type === 'POST' || type === 'PATCH') {
      return (
        ah.one({
          url: url,
          data: JSON.stringify(dataObj),
          type: type,
          contentType: 'text/plain'
        })
        .then(data => {
          if (data.ret === 0) {
            return data.rt;
          }
        })
        .catch(err => {
          this.showPopupMsg('', t('txt-error'), err.message);
        })
      )
    }
  },
  getLAconfig: function(baseUrl) {
    const url = `${baseUrl}/api/cibd/configurations`;

    return (
      ah.one({
        url,
        type: 'GET'
      })
      .then(data => {
        if (data.data_sources) {
          delete data.data_sources.chewbaccav2;
          return data;
        }
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    )
  },
  getDashboardMenu: function(page) {
    const t = global.chewbaccaI18n.getFixedT(null, 'connections');

    return (
      <div className='c-button-group left menu'>
        <button className={cx('thumb', {'selected': page === 'statistics'})}>
          <Link to='/SCP/dashboard/statistics'>{t('dashboard.txt-statisticsInfo')}</Link>
        </button>
        <button className={cx('thumb', {'selected': page === 'maps'})}>
          <Link to='/SCP/dashboard/maps'>{t('dashboard.txt-attacksMap')}</Link>
        </button>
      </div>
    )
  },
  getEventsMenu: function(page) {
    const t = global.chewbaccaI18n.getFixedT(null, 'connections');

    return (
      <div className='c-button-group left menu'>
        <button className={cx('thumb', {'selected': page === 'syslog'})}>
          <Link to='/SCP/events/syslog'>{t('txt-syslog')}</Link>
        </button>

        <button className={cx('thumb', {'selected': page === 'netflow'})}>
          <Link to='/SCP/events/netflow'>{t('txt-netflow')}</Link>
        </button>
      </div>
    )
  },
  getSavedQuery: function(baseUrl, account, queryData, type) {
    const url = `${baseUrl}/api/account/${type}/queryText?accountId=${account.id}`;
    let tempQueryData = {...queryData};

    return (
      ah.one({
        url,
        type: 'GET'
      })
      .then(data => {
        if (data.ret === 0) {
          data = data.rt;

          if (data.length > 0) {
            let formattedQueryText = [];
            tempQueryData.id = data[0].id;
            tempQueryData.name = data[0].name;

            _.forEach(data[0].queryText.filter, val => {
              let formattedValue = val.condition.toLowerCase();
              formattedValue = formattedValue.replace(' ', '_');

              formattedQueryText.push({
                condition: formattedValue,
                query: val.query
              });
            })

            tempQueryData.query = {
              filter: formattedQueryText
            };
            tempQueryData.list = data;
            return tempQueryData;
          }
        }
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    )
  },
  getWorldMap: function(WORLDMAP, geoJson, mainData) {
    const t = global.chewbaccaI18n.getFixedT(null, 'connections');
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

    _.forEach(mainData, val => {
      const uniqueID = val.id + Math.floor((Math.random() * 1000000) + 1);
      const timestamp = helper.getFormattedDate(val._eventDttm_, 'local');

      if (val.srcLatitude && val.srcLongitude) {
        attacksDataArr.push({
          type: 'spot',
          id: `${uniqueID}_src`,
          latlng: [
            val.srcLatitude,
            val.srcLongitude
          ],
          data: {
            tag: 'red'
          },
          tooltip: () => {
            return `<div>${t('payloadsFields.srcCountry')}: ${val.srcCountry}</div><div>${t('payloadsFields.srcCity')}: ${val.srcCity}</div><div>${t('payloadsFields.srcIp')}: ${val.srcIp}</div><div>${t('payloadsFields.timestamp')}: ${timestamp}</div>`
          }
        });
      }

      if (val.destLatitude && val.destLongitude) {
        attacksDataArr.push({
          type: 'spot',
          id: `${uniqueID}_dest`,
          latlng: [
            val.destLatitude,
            val.destLongitude
          ],
          data: {
            tag: 'yellow'
          },
          tooltip: () => {
            return `<div>${t('payloadsFields.destCountry')}: ${val.destCountry}</div><div>${t('payloadsFields.destCity')}: ${val.destCity}</div><div>${t('payloadsFields.destIp')}: ${val.destIp}</div><div>${t('payloadsFields.timestamp')}: ${timestamp}</div>`
          }
        });
      }
    });

    tempGeoJson.attacksDataArr = attacksDataArr;
    return tempGeoJson;
  },
  getPrivilegesInfo: function(sessionRights, privilege, locale) {
    if (privilege === 'common' && !sessionRights.Module_Common) {
      window.location.href = '/SCP/configuration/edge/edge?lng=' + locale;
    } else if (privilege === 'config' && !sessionRights.Module_Config)  {
      window.location.href = '/SCP?lng=' + locale;
    }
  },
  showPopupMsg: function(msg, title, errorMsg, options, redirect) {
    const t = global.chewbaccaI18n.getFixedT(null, 'connections');
    const lng = global.chewbaccaI18n.language;
    const showErrorMsg = (typeof errorMsg === 'string') ? errorMsg : '';

    PopupDialog.alert({
      id: 'modalWindowSmall',
      title,
      confirmText: t('txt-ok'),
      display: <div className={cx('content', {'small-margin align-left': options})}><span>{msg}</span><div>{showErrorMsg}</div></div>,
      act:(confirmed) => {
      }
    });
  }
};

export default helper;