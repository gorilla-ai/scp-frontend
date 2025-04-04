import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import cx from 'classnames'
import Promise from 'bluebird'
import $ from 'jquery'

import ToggleButton from '@material-ui/lab/ToggleButton'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Progress from 'react-ui/build/src/components/progress'

const helper = {
  getDate: function(datetime) {
    return moment(datetime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DDTHH:mm:ss') + 'Z';
  },
  getFormattedDate: function(val, timezone) {
    if (!val) {
      return '';
    }
    if (timezone === 'local') {
      val = moment.utc(val).toDate();
      return moment(val).local().format('YYYY-MM-DD HH:mm:ss');
    } else if (timezone === 'utc') {
      return moment(val).utc().format('YYYY-MM-DD HH:mm:ss');
    } else if (timezone === 'unix') {
      return moment.unix(val).format('YYYY-MM-DD HH:mm:ss');
    } else {
      const date = new Date(val);
      return moment(date).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  getSubstractDate: function(val, type, date) {
    const dateTime = date ? date : new Date();
    return moment(dateTime).local().subtract(val, type).format('YYYY-MM-DDTHH:mm:ss');
  },
  getAdditionDate: function(val, type, date) {
    const dateTime = date ? date : new Date();
    return moment(dateTime).local().add(val, type).format('YYYY-MM-DDTHH:mm:ss');
  },
  getStartDate: function(val) {
    return moment().local().startOf(val).format('YYYY-MM-DDTHH:mm:ss');
  },
  capitalizeFirstLetter: function(string) {
    string = string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  numberWithCommas: function(n) {
    if (n) {
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
      if (n === 0) {
        return n;
      } else {
        return;
      }
    }
  },
  downloadWithBlob: function(fileName, data) {
    const url = window.URL.createObjectURL(new Blob([data], {type: 'application/octet-binary'}));
    const link = document.createElement('a');
    let filename = fileName;
    filename = decodeURI(filename);
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    link.remove();
  },
  formatBytes(bytes, decimals = 0) {
    if (bytes === 0 || bytes === '0') {
      return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    return (bytes / k).toFixed(dm) + ' ' + sizes[1];

    //const i = Math.floor(Math.log(bytes) / Math.log(k));

    //return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },
  getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  },
  setChartInterval: function(datetime) {
    const t = global.chewbaccaI18n.getFixedT(null, 'connections');
    const dateTime = {
      from: moment(datetime.from),
      to: moment(datetime.to)
    };
    const hr = dateTime.to.diff(dateTime.from, 'hours');
    const day = dateTime.to.diff(dateTime.from, 'days');
    let chartIntervalList = [];
    let chartIntervalValue = '';

    if (hr <= 24) {
      chartIntervalList = ['10m', '1h'];
    } else if (hr > 24 && day <= 7) {
      chartIntervalList = ['1h', '12h', '1d'];
    } else if (day > 7 && day <= 28) {
      chartIntervalList = ['12h', '1d'];
    } else if (day > 28) {
      chartIntervalList = ['1d'];
    }

    chartIntervalValue = chartIntervalList[0];

    chartIntervalList = _.map(chartIntervalList, val => {
      return <ToggleButton id={'chartInterval' + val} key={val} value={val}>{t('time-interval.txt-' + val)}</ToggleButton>
    });

    return {
      chartIntervalList,
      chartIntervalValue
    };
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
          query: val.query.trim()
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
      case 1:
        return 'yellow';
      case 2:
        return 'green';
      case 3:
        return 'darkGreen';
      case 4:
        return 'blue';
      case 5:
        return 'orange';
      case 6:
        return 'darkBlue';
      case 7:
        return 'purple';
      case 8:
        return 'soil';
      case 9:
        return 'brown';
    }
  },
  showColor(color) {
    switch (color) {
      case '#B80000':
        return 'red';
      case '#DB3E00':
        return 'orange';
      case '#FCCB00':
        return 'yellow';
      case '#008B02':
        return 'green';
      case '#006B76':
        return 'darkGreen';
      case '#1273DE':
        return 'blue';
      case '#004DCF':
        return 'darkBlue';
      case '#5300EB':
        return 'purple';
      default:
        return 'yellow';
    }
  },
  getSeverityColor: function(value) {
    let backgroundColor = '';

    if (value === 'Emergency') {
      backgroundColor = '#CC2943';
    } else if (value === 'Alert') {
      backgroundColor = '#CC7B29';
    } else if (value === 'Critical') {
      backgroundColor = '#29B0CC';
    } else if (value === 'Warning') {
      backgroundColor = '#29CC7A';
    } else if (value === 'Notice') {
      backgroundColor = '#7ACC29';
    } else {
      return 'N/A'
    }

    return <span className='severity' style={{backgroundColor}}>{value}</span>
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
  getLAconfig: function(baseUrl) {
    return (
      ah.one({
        url: `${baseUrl}/api/cibd/configurations`,
        type: 'GET'
      }, {showProgress: false})
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
        <button id='dashboardOverviewBtn' className={cx('thumb', {'selected': page === 'overview'})}>
          <Link to='/SCP/dashboard/overview'>{t('dashboard.txt-overview')}</Link>
        </button>
        <button id='dashboardStatisticsBtn' className={cx('thumb', {'selected': page === 'statisticsUIF'})}>
          <Link to='/SCP/dashboard/statisticsUIF'>{t('dashboard.txt-statisticsInfo')}</Link>
        </button>
        {/* <button id='dashboardMapsBtn' className={cx('thumb', {'selected': page === 'maps'})}>
          <Link to='/SCP/dashboard/maps'>{t('dashboard.txt-attacksMap')}</Link>
        </button> */}
      </div>
    )
  },
  getEventsMenu: function(page) {
    const t = global.chewbaccaI18n.getFixedT(null, 'connections');

    return (
      <div className='c-button-group left menu'>
        <button className={cx('thumb', {'selected': page === 'syslog'})}>
          <Link to='/SCP/events/syslog'>{t('txt-syslog-en')}</Link>
        </button>
        {/*<button className={cx('thumb', {'selected': page === 'netflow'})}>
          <Link to='/SCP/events/netflow'>{t('txt-netflow')}</Link>
        </button>*/}
      </div>
    )
  },
  getPublicSavedQuery: function(baseUrl, queryDataPublic, type) {
    let tempQueryDataPublic = {...queryDataPublic};

    return (
      ah.one({
        url: `${baseUrl}/api/account/${type}/public/queryText`,
        type: 'GET'
      }, {showProgress: false})
      .then(data => {
        if (data.ret === 0) {
          data = data.rt;

          if (data.length > 0) {
            let formattedQueryText = [];
            tempQueryDataPublic.id = data[0].id;
            tempQueryDataPublic.name = data[0].name;
            tempQueryDataPublic.query = {};

            _.forEach(data[0].queryText.filter, val => {
              let formattedValue = val.condition.toLowerCase();
              formattedValue = formattedValue.replace(' ', '_');

              formattedQueryText.push({
                condition: formattedValue,
                query: val.query.trim()
              });
            })

            tempQueryDataPublic.query.filter = formattedQueryText;

            if (type === 'syslog') {
              tempQueryDataPublic.query.search = data[0].queryText.search;
            }

            tempQueryDataPublic.list = data;

            return tempQueryDataPublic;
          }
        }
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    )
  },
  getSavedQuery: function(baseUrl, account, queryData, type) {
    const urlParam = type === 'syslog' ? 'v1/' : '';
    let tempQueryData = {...queryData};

    return (
      ah.one({
        url: `${baseUrl}/api/${urlParam}account/${type}/queryText?accountId=${account.id}`,
        type: 'GET'
      }, {showProgress: false})
      .then(data => {
        if (data.ret === 0) {
          data = data.rt;

          if (data.length > 0) {
            let formattedQueryText = [];
            tempQueryData.id = data[0].id;
            tempQueryData.name = data[0].name;
            tempQueryData.query = {};

            if (type === 'host') {
              formattedQueryText = data[0].queryText;
            } else {
              _.forEach(data[0].queryText.filter, val => {
                let formattedValue = val.condition.toLowerCase();
                formattedValue = formattedValue.replace(' ', '_');

                formattedQueryText.push({
                  condition: formattedValue,
                  query: val.query.trim()
                });
              })
            }

            tempQueryData.query.filter = formattedQueryText;

            if (type === 'syslog') {
              tempQueryData.query.search = data[0].queryText.search;
            }

            tempQueryData.list = data;
            tempQueryData.patternId = '';
            tempQueryData.pattern = {
              name: '',
              aggColumn: '',
              periodMin: '',
              threshold: '',
              severity: 'Emergency'
            };

            tempQueryData.soc = {
              id:'',
              severity: 'Emergency',
              limitQuery: 10,
              title: '',
              eventDescription:'',
              impact: 4,
              category: 1,
            }

            if (data[0].patternId) {
              tempQueryData.patternId = data[0].patternId;
            }

            if (data[0].patternName) {
              tempQueryData.pattern.name = data[0].patternName;
            }

            if (data[0].aggColumn) {
              tempQueryData.pattern.aggColumn = data[0].aggColumn;
            }

            if (data[0].periodMin) {
              tempQueryData.pattern.periodMin = data[0].periodMin;
            }

            if (data[0].threshold) {
              tempQueryData.pattern.threshold = data[0].threshold;
            }

            if (data[0].severity) {
              tempQueryData.pattern.severity = data[0].severity;
            }

            if (data[0].emailList) {
              tempQueryData.emailList = data[0].emailList;
            }

            return tempQueryData;
          }
        }
      })
      .catch(err => {
        helper.showPopupMsg('', t('txt-error'), err.message);
      })
    )
  },
  determineInputRuleType: function(data) {
    const patternIP = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const patternIPv6 = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
    const patternDomainName = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
    const patternURL = /^\w+[^\s]+(\.[^\s]+){1,}$/;
    const patternFileHashMd5 = /^[a-fA-F0-9]{32}$/;
    const patternFileHashSha1 = /^[a-fA-F0-9]{40}$/;
    const patternFileHashSha256 = /^[a-fA-F0-9]{64}$/;
    let type = '';

    if (patternIP.test(data)) {
      type = 'ip';
    } else if (patternDomainName.test(data)) {
      type = 'domainName';
    } else if (patternURL.test(data)) {
      type = 'url';
    } else if (patternFileHashMd5.test(data)) {
      type = 'fileHashMd5';
    } else if (patternFileHashSha1.test(data)) {
      type = 'fileHashSha1';
    } else if (patternFileHashSha256.test(data)) {
      type = 'fileHashSha256';
    } else if (patternIPv6.test(data)) {
      type = 'ipv6';
    }

    return type;
  },
  validateInputRuleData: function(type, data) {
    let pattern = '';

    if (type === 'snort') {
      return data.indexOf('sid') > 0 ? true : false;
    } else if (type === 'yara') {
      return true;
    } else if (type === 'ip') {
      pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    } else if (type === 'ipv6') {
      pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
    } else if (type === 'domainName') {
      pattern = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
    } else if (type === 'url') {
      pattern = /^\w+[^\s]+(\.[^\s]+){1,}$/;
    } else if (type === 'certMd5' || type === 'fileHashMd5' || type === 'fileHashWhiteMd5') {
      pattern = /^[a-fA-F0-9]{32}$/;
    } else if (type === 'certSha1' || type === 'fileHashSha1') {
      pattern = /^[a-fA-F0-9]{40}$/;
    } else if (type === 'certSha256' || type === 'fileHashSha256') {
      pattern = /^[a-fA-F0-9]{64}$/;
    }

    return pattern.test(data);
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
      const timestamp = helper.getFormattedDate(val._eventDttm_ || val.timestamp, 'local');

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
            return `<div>${t('payloadsFields.srcCountry')}: ${val.srcCountry}</div><div>${t('payloadsFields.srcCity')}: ${val.srcCity}</div><div>${t('payloadsFields.srcIp')}: ${val.srcIp || val.ipSrc}</div><div>${t('payloadsFields.timestamp')}: ${timestamp}</div>`
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
            return `<div>${t('payloadsFields.destCountry')}: ${val.destCountry}</div><div>${t('payloadsFields.destCity')}: ${val.destCity}</div><div>${t('payloadsFields.destIp')}: ${val.destIp || val.ipDst}</div><div>${t('payloadsFields.timestamp')}: ${timestamp}</div>`
          }
        });
      }
    });

    tempGeoJson.attacksDataArr = attacksDataArr;
    return tempGeoJson;
  },
  getPrivilegesInfo: function(sessionRights, privilege, locale) {
    if (privilege === 'common' && (!sessionRights.Module_Common && !sessionRights.Module_Account)) {
      window.location.href = '/SCP/configuration/edge/edge?lng=' + locale;
    } else if (privilege === 'config' && !sessionRights.Module_Config)  {
      window.location.href = '/SCP?lng=' + locale;
    } else if (privilege === 'account' && !sessionRights.Module_Account)  {
      window.location.href = '/SCP?lng=' + locale;
    } else if (privilege === 'soc' && !sessionRights.Module_Soc)  {
      window.location.href = '/SCP?lng=' + locale;
    }
  },
  inactivityTime: function(baseUrl, locale) {
    const url = `${baseUrl}/api/logout`;
    global.activityTimer = '';

    document.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onmousedown = resetTimer; // touchscreen presses
    document.ontouchstart = resetTimer;
    document.onclick = resetTimer;     // touchpad clicks
    document.onkeydown = resetTimer;   // onkeypress is deprectaed
    document.addEventListener('scroll', resetTimer, true);

    function resetTimer() {
      const currentUrl = window.location.href;

      if (currentUrl.indexOf('172.18.0.61') > 0 || currentUrl.indexOf('localhost') > 0) {
        return;
      }

      clearTimeout(global.activityTimer);
      global.activityTimer = setTimeout(logout, 1500000); //25 min.
    }

    function logout() {
      Progress.startSpin();

      Promise.resolve($.post(url))
        .finally(() => {
          Progress.done();
          window.location.href = '/SCP?lng=' + locale;
        })
    }
  },
  clearTimer: function() {
    clearTimeout(global.activityTimer);
  },
  getVersion: function(baseUrl) {
    clearTimeout(global.apiTimer);
    global.apiTimer = setTimeout(getVersionNumber, 1500000); //25 min.

    function getVersionNumber() {
      const url = `${baseUrl}/api/version`;

      Promise.resolve($.get(url))
        .then(data => {
          return null;
        })
        .catch(xhr => {
          return null;
        })
        .then(resources => {
          return null;
        })
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
      display: <div className={cx('content', {'small-margin align-left': options})}><span className='msg'>{msg}</span><div className='err-msg'>{showErrorMsg}</div></div>,
      act:(confirmed) => {
      }
    });
  },
  /**
   * Validate IP Regex
   * @return {boolean}
   */
  ValidateIP_Address(ip) {
    let check = false

    if (ip === null || ip === undefined){
      return false
    }

    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)){
      return true
    }

    if (!check){
      // Check if there are more then 2 : together (ex. :::)
      if(/:{3,}/.test(ip)) return false;
      // Check if there are more then 2 :: (ex. ::2001::)
      if(/::.+::/.test(ip)) return false;
      // Check if there is a single : at the end (requires :: if any)
      if(/[^:]:$/.test(ip)) return false;
      // Check for leading colon
      if(/^:(?!:)/.test(ip)) return false;
      // Split all the part to check each
      let ipv6_parts = ip.split(':');
      // Make sure there are at lease 2 parts and no more then 8
      if(ipv6_parts.length < 2 || ipv6_parts.length > 8) return false;

      let is_valid = true;
      // Loop through the parts
      ipv6_parts.forEach(function(part) {
        // If the part is not blank (ex. ::) it must have no more than 4 digits
        if(/^[0-9a-fA-F]{0,4}$/.test(part)) return;
        // Fail if none of the above match
        is_valid = false;
      });

      return is_valid;
    }


    return check;
  },

  ValidatePort(port) {
    return /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/.test(port);
  },
};

export default helper;