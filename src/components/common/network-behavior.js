import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'

import DataTable from 'react-ui/build/src/components/table'

import {BaseDataContext} from './context'
import helper from './helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';
const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};

let t = null;
let f = null;

/**
 * Network Behavior Info
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Network Behavior information
 */
class NetworkBehavior extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeNetworkBehavior: 'threats', //'threats' or 'syslog'
      networkBehavior: {
        threats: {
          fields: ['severity', 'count'],
          srcIp: {
            totalCount: 0,
            data: []
          },
          destIp: {
            totalCount: 0,
            data: []
          }
        },
        syslog: {
          fields: ['configSource', 'count'],
          sort: {
            field: 'configSource',
            desc: true
          },
          srcIp: {
            totalCount: 0,
            data: []
          },
          destIp: {
            totalCount: 0,
            data: []
          }
        }
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.loadNetworkBehavior(this.props.ipType);
  }
  /**
   * Load network behavior data
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   */
  loadNetworkBehavior = (ipType) => {
    const {baseUrl} = this.context;
    const {page, alertData, hostDatetime} = this.props;
    const {networkBehavior} = this.state;
    const eventDateTime = helper.getFormattedDate(alertData._eventDttm_ || alertData.createDttm, 'local');
    const eventDateFrom = helper.getSubstractDate(1, 'hours', eventDateTime);
    let datetime = {};
    let apiArr = [];
    let query = '';

    if (_.isEmpty(hostDatetime)) {
      datetime = {
        from: moment(eventDateFrom).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
        to: moment(eventDateTime).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
      };
    } else {
      datetime = {
        from: hostDatetime.from,
        to: hostDatetime.to
      };
    }

    if (page === 'host') {
      query = alertData.srcIp || alertData.ip;
    } else {
      if (ipType === 'srcIp') {
        query = 'srcIp ' + alertData.srcIp || alertData.ip;
      } else if (ipType === 'destIp') {
        query = 'srcIp ' + alertData.destIp || alertData.ip;
      }
    }

    if (ipType === 'srcIp') {
      const srcIp = alertData.srcIp || alertData.ip;

      if (!srcIp) {
        return;
      }

      apiArr = [
        {
          url: `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0&skipHistogram=true`, //Threats srcIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query
              }
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        },
        {
          url: `${baseUrl}/api/u1/network/session?pageSize=0`, //Connections srcIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query
              }
            ],
            search: [
              'TopDestIpPortAgg'
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        },
        {
          url: `${baseUrl}/api/u1/network/session?pageSize=0`, //DNS srcIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query
              },
              {
                condition: 'must',
                query: 'DNS' 
              }
            ],
            search: [
              'TopDestIpPortAgg'
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        },
        {
          url: `${baseUrl}/api/u2/alert/_search?pageSize=0&skipHistogram=true`, //Syslog srcIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query: 'Top10SyslogConfigSource'
              },
              {
                condition: 'must',
                query: srcIp
              }
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        }
      ];
    } else if (ipType === 'destIp') {
      const destIp = alertData.destIp || alertData.ip;

      if (!destIp) {
        return;
      }

      apiArr = [
        {
          url: `${baseUrl}/api/u2/alert/_search?page=1&pageSize=0&skipHistogram=true`, //Threats destIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query
              }
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        },
        {
          url: `${baseUrl}/api/u1/network/session?pageSize=0`, //Connections destIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query
              }
            ],
            search: [
              'TopDestIpPortAgg'
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        },
        {
          url: `${baseUrl}/api/u1/network/session?pageSize=0`, //DNS destIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query
              },
              {
                condition: 'must',
                query: 'DNS' 
              }
            ],
            search: [
              'TopDestIpPortAgg'
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        },
        {
          url: `${baseUrl}/api/u2/alert/_search?pageSize=0&skipHistogram=true`, //Syslog destIp
          data: JSON.stringify({
            timestamp: [datetime.from, datetime.to],
            filters: [
              {
                condition: 'must',
                query: 'Top10SyslogConfigSource'
              },
              {
                condition: 'must',
                query: destIp
              }
            ]
          }),
          type: 'POST',
          contentType: 'text/plain'
        }
      ];
    }

    this.ah.all(apiArr)
    .then(data => {
      if (data && data.length > 0) {
        let tempNetworkBehavior = {...networkBehavior};
        let tempFields = {};
        networkBehavior.threats.fields.forEach(tempData => {
          tempFields[tempData] = {
            label: t(`txt-${tempData}`),
            sortable: false,
            formatter: (value, allValue, i) => {
              if (tempData === 'severity') {
                return <span className='severity-level' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>
              } else {
                return <span>{value}</span>
              }
            }
          }
        })

        tempNetworkBehavior.threats.fieldsData = tempFields;

        if (ipType === 'srcIp') {
          tempNetworkBehavior.threats.srcIp.totalCount = data[0].data.counts;

          if (data[0].aggregations) {
            tempNetworkBehavior.threats.srcIp.data = this.getNetworkBehaviorData('threats', data[0].aggregations);
          }
        } else if (ipType === 'destIp') {
          tempNetworkBehavior.threats.destIp.totalCount = data[0].data.counts;

          if (data[0].aggregations) {
            tempNetworkBehavior.threats.destIp.data = this.getNetworkBehaviorData('threats', data[0].aggregations);
          }
        }

        tempFields = {};
        networkBehavior.syslog.fields.forEach(tempData => {
          tempFields[tempData] = {
            label: t(`txt-${tempData}`),
            sortable: true,
            formatter: (value, allValue, i) => {
              return <span>{value}</span>
            }
          }
        })

        tempNetworkBehavior.syslog.fieldsData = tempFields;

        if (ipType === 'srcIp') {
          tempNetworkBehavior.syslog.srcIp.totalCount = data[3].data.counts;

          if (data[3].aggregations && data[3].aggregations.Top10SyslogConfigSource) {
            tempNetworkBehavior.syslog.srcIp.data = this.getNetworkBehaviorData('syslog', data[3].aggregations.Top10SyslogConfigSource.agg.buckets);
          }
        } else if (ipType === 'destIp') {
          tempNetworkBehavior.syslog.destIp.totalCount = data[3].data.counts;

          if (data[3].aggregations && data[3].aggregations.Top10SyslogConfigSource) {
            tempNetworkBehavior.syslog.destIp.data = this.getNetworkBehaviorData('syslog', data[3].aggregations.Top10SyslogConfigSource.agg.buckets);
          }
        }

        this.setState({
          networkBehavior: tempNetworkBehavior
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Get aggregated network behavior data
   * @method
   * @param {string} type - network behavior type ('threats' or 'syslog')
   * @param {object | array.<object>} data - network behavior data
   * @returns tempData array
   */
  getNetworkBehaviorData = (type, data) => {
    let tempData = [];

    if (type === 'threats') {
      _.forEach(SEVERITY_TYPE, val => {
        _.forEach(data, (val2, key) => {
          if (key !== 'default' && val === key) {
            tempData.push({
              severity: key,
              count: helper.numberWithCommas(val2.doc_count)
            });
          }
        })
      })
    } else if (type === 'syslog') {
      _.forEach(data, val => {
        tempData.push({
          configSource: val.key,
          count: helper.numberWithCommas(val.doc_count)
        });
      })
    }

    return tempData;
  }
  /**
   * Toggle network behavior button
   * @method
   * @param {object} event - event object
   * @param {string} type - 'threats' or 'syslog'
   */
  toggleNetworkBtn = (event, type) => {
    if (!type) {
      return;
    }
    
    this.setState({
      activeNetworkBehavior: type
    });
  }
  /**
   * Redirect to netflow or syslog page
   * @method
   * @param {string} ipType - 'srcIp' or 'destIp'
   */
  redirectNewPage = (ipType) => {
    const {baseUrl, contextRoot, language} = this.context;
    const {page, alertData, hostDatetime} = this.props;
    const {activeNetworkBehavior} = this.state;
    const srcIp = this.props.getIpPortData ? this.props.getIpPortData('srcIp') : alertData.ip;
    const destIp = this.props.getIpPortData ? this.props.getIpPortData('destIp') : alertData.ip;
    let datetime = {};
    let ipParam = '';
    let linkUrl ='';

    if (_.isEmpty(hostDatetime)) {
      datetime = {
        from: helper.getFormattedDate(helper.getSubstractDate(1, 'hours', alertData._eventDttm_ || alertData.createDttm)),
        to: helper.getFormattedDate(alertData._eventDttm_ || alertData.createDttm, 'local')
      };
    } else {
      datetime = {
        from: helper.getFormattedDate(hostDatetime.from, 'local'),
        to: helper.getFormattedDate(hostDatetime.to, 'local')
      };
    }

    if (ipType === 'srcIp') {
      ipParam = `&sourceIP=${srcIp}`;
    } else if (ipType === 'destIp') {
      ipParam = `&sourceIP=${destIp}`;
    }

    if (page) {
      ipParam += `&page=${page}`;
    }
 
    if (activeNetworkBehavior === 'threats') {
      linkUrl = `${baseUrl}${contextRoot}/threats?from=${datetime.from}&to=${datetime.to}${ipParam}&lng=${language}`;
    } else if (activeNetworkBehavior === 'syslog') {
      linkUrl = `${baseUrl}${contextRoot}/events/syslog?from=${datetime.from}&to=${datetime.to}${ipParam}&lng=${language}`;
    }

    window.open(linkUrl, '_blank');
  }
  /**
   * Handle table sort for network behavior
   * @method
   * @param {string} type - network behavior type ('threats' or 'syslog')
   * @param {object} sort - sort data object
   */
  handleNetworkBehaviorTableSort = (type, sort) => {
    let tempNetworkBehavior = {...this.state.networkBehavior};
    tempNetworkBehavior[type].sort.field = sort.field;
    tempNetworkBehavior[type].sort.desc = sort.desc;

    this.setState({
      networkBehavior: tempNetworkBehavior
    });
  }
  render() {
    const {alertData, ipType, hostDatetime} = this.props;
    const {activeNetworkBehavior, networkBehavior} = this.state;
    let datetime = {};
    let alertTimeText = '';

    if (_.isEmpty(hostDatetime)) {
      if (alertData._eventDttm_ || alertData.createDttm) {
        datetime = {
          from: helper.getFormattedDate(helper.getSubstractDate(1, 'hours', alertData._eventDttm_ || alertData.createDttm)),
          to: helper.getFormattedDate(alertData._eventDttm_ || alertData.createDttm, 'local')
        };
      }
      alertTimeText = t('txt-alertHourBefore');
    } else {
      datetime = {
        from: helper.getFormattedDate(hostDatetime.from, 'local'),
        to: helper.getFormattedDate(hostDatetime.to, 'local')
      };
      alertTimeText = t('alert.txt-alertTime');
    }

    if (this.props.getIpPortData && this.props.getIpPortData(ipType) === NOT_AVAILABLE) {
      return <span>{NOT_AVAILABLE}</span>
    }

    return (
      <div className='network-behavior'>
        <ToggleButtonGroup
          id='networkBehaviorBtn'
          value={activeNetworkBehavior}
          exclusive
          onChange={this.toggleNetworkBtn}>
          <ToggleButton id='networkBehaviorThreats' key='networkBehaviorThreats' value='threats'>{t('txt-threats') + ' (' + helper.numberWithCommas(networkBehavior.threats[ipType].totalCount) + ')'}</ToggleButton>
          <ToggleButton id='networkBehaviorSyslog' key='networkBehaviorSyslog' value='syslog'>{t('txt-syslog-en') + ' (' + helper.numberWithCommas(networkBehavior.syslog[ipType].totalCount) + ')'}</ToggleButton>
        </ToggleButtonGroup>

        {datetime.from && datetime.to &&
          <div className='msg'>{alertTimeText}: {datetime.from} ~ {datetime.to}</div>
        }
        <Button variant='contained' color='primary' className='query-events' onClick={this.redirectNewPage.bind(this, ipType)}>{t('alert.txt-queryEvents')}</Button>

        <div className='table-data'>
          <DataTable
            className='main-table network-behavior'
            fields={networkBehavior[activeNetworkBehavior].fieldsData}
            data={networkBehavior[activeNetworkBehavior][ipType].data}
            sort={networkBehavior[activeNetworkBehavior][ipType].data.length === 0 ? {} : networkBehavior[activeNetworkBehavior].sort}
            onSort={this.handleNetworkBehaviorTableSort.bind(this, activeNetworkBehavior)} />
        </div>
      </div>
    )
  }
}

NetworkBehavior.contextType = BaseDataContext;

NetworkBehavior.propTypes = {
  ipType: PropTypes.string.isRequired,
  alertData: PropTypes.object.isRequired,
  page: PropTypes.string,
  hostDatetime: PropTypes.object
};

export default NetworkBehavior;