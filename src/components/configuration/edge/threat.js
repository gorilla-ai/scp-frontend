import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import BarChart from 'react-chart/build/src/components/bar'
import LineChart from 'react-chart/build/src/components/line'
import PieChart from 'react-chart/build/src/components/pie'

import {HocConfig as Config} from '../../common/configuration'
import helper from '../../common/helper'
import {HocSearchOptions as SearchOptions} from '../../common/search-options'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

/**
 * Threat Intelligence
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Config Edge Threat Intelligence page
 */
class ThreatIntelligence extends Component {
  constructor(props) {
    super(props);

    this.state = {
      datetime: {
        from: helper.getSubstractDate(1, 'week'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
        //from: '2019-03-08T00:00:00Z',
        //to: '2019-03-13T00:00:00Z'
      },
      indicatorsData: [],
      indicatorsTrendData: [],
      acuIndicatorsTrendData: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getChartsData();
  }
  /**
   * Get and set charts data
   * @method
   */
  getChartsData = (search) => {
    const {baseUrl, contextRoot} = this.props;
    const {datetime} = this.state;
    const dateTime = {
      from: Moment(datetime.from).utc().format('YYYY-MM-DDTHH:mm') + ':00Z',
      to: Moment(datetime.to).utc().format('YYYY-MM-DDTHH:mm') + ':00Z'
    };
    const apiArr = [
      {
        url: `${baseUrl}/api/indicators/summary`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/indicators/trend?startDttm=${dateTime.from}&endDttm=${dateTime.to}`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/indicators/trend/accum?startDttm=${dateTime.from}&endDttm=${dateTime.to}`,
        type: 'GET'
      }
    ];

    this.ah.all(apiArr)
    .then(data => {
      if (data) {
        let indicatorsData = [];
        let indicatorsTrendData = [];
        let acuIndicatorsTrendData = [];

        _.keys(data[0])
        .forEach(key => {
          indicatorsData.push({
            key,
            doc_count: data[0][key]
          });
        });

        _.keys(data[1])
        .forEach(key => {
          _.keys(data[1][key])
          .forEach(key2 => {
            indicatorsTrendData.push({
              day: parseInt(Moment(helper.getFormattedDate(key2, 'local')).format('x')),
              count: data[1][key][key2],
              indicator: key
            })
          })
        });

        _.keys(data[2])
        .forEach(key => {
          _.forEach(data[2][key], val => {
            acuIndicatorsTrendData.push({
              day: parseInt(Moment(helper.getFormattedDate(val.time, 'local')).format('x')),
              count: val.counts,
              indicator: key
            })
          })
        });

        this.setState({
          indicatorsData,
          indicatorsTrendData,
          acuIndicatorsTrendData
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Display tooltip info when mouse over charts
   * @method
   * @param {object} eventInfo - chart event
   * @param {array} data - chart data
   * @returns HTML DOM
   */
  onTooltip = (eventInfo, data) => {
    const text = data[0].indicator + ': ' + data[0].count + ' ' + t('txt-at') + ' ' + Moment(data[0].day, 'x').utc().format('YYYY/MM/DD');

    return <div>{text}</div>
  }
  /**
   * Set new datetime
   * @method
   * @param {object} datetime - new datetime object
   */
  handleDateChange = (datetime) => {
    this.setState({
      datetime
    });
  }
  render() {
    const {baseUrl, contextRoot, language, locale, session} = this.props;
    const {datetime, indicatorsData, indicatorsTrendData, acuIndicatorsTrendData} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <SearchOptions
            locale={locale}
            datetime={datetime}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.getChartsData} />
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            locale={locale}
            session={session} />

          <div className='parent-content'>
            <div className='main-content'>
              <header className='main-header'>{t('txt-threatIntelligence')}</header>
              {/*<button className='standard btn last'>{t('edge-management.txt-addThreat')}</button>*/}

              <div className='main-statistics'>
                <div className='statistics-content'>
                  {indicatorsData.length > 0 &&
                    <div className='chart-group'>
                      <PieChart
                        title={t('edge-management.statistics.txt-sourceIndicators')}
                        data={indicatorsData}
                        keyLabels={{
                          key: t('txt-indicator'),
                          doc_count: t('txt-count')
                        }}
                        valueLabels={{
                          'Pie Chart': {
                            key: t('txt-indicator'),
                            doc_count: t('txt-count')
                          }
                        }}
                        dataCfg={{
                          splitSlice: ['key'],
                          sliceSize: 'doc_count'
                        }} />
                    </div>
                  }
                  {indicatorsTrendData.length > 0 &&
                    <div className='chart-group'>
                      <header className='main-header'>{t('edge-management.statistics.txt-indicatorsTrend')}</header>
                      <BarChart
                        stacked
                        vertical
                        legend={{
                          enabled:true
                        }}
                        data={indicatorsTrendData}
                        onTooltip={this.onTooltip}
                        dataCfg={{
                          x: 'day',
                          y: 'count',
                          splitSeries: 'indicator'
                        }}
                        xAxis={{
                          type: 'datetime',
                          dateTimeLabelFormats: {
                            day: '%Y-%m-%d'
                          }
                        }} />
                    </div>
                  }
                  {acuIndicatorsTrendData.length > 0 &&
                    <div className='chart-group'>
                      <header className='main-header'>{t('edge-management.statistics.txt-acuIndicatorsTrend')}</header>
                      <LineChart
                        stacked
                        legend={{
                          enabled: true
                        }}
                        data={acuIndicatorsTrendData}
                        onTooltip={this.onTooltip}
                        dataCfg={{
                          x: 'day',
                          y: 'count',
                          splitSeries: 'indicator'
                        }}
                        xAxis={{
                          type: 'datetime',
                          dateTimeLabelFormats: {
                            day: '%Y-%m-%d'
                          }
                        }} />
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ThreatIntelligence.propTypes = {
  baseUrl: PropTypes.string.isRequired
};

const HocThreatIntelligence = withLocale(ThreatIntelligence);
export { ThreatIntelligence, HocThreatIntelligence };