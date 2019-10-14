import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import BarChart from 'react-chart/build/src/components/bar'
import LineChart from 'react-chart/build/src/components/line'
import PieChart from 'react-chart/build/src/components/pie'

import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'
import {HocConfig as Config} from '../../common/configuration'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

class ThreatIntelligence extends Component {
  constructor(props) {
    super(props);

    this.state = {
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
  getChartsData = () => {
    const {baseUrl, contextRoot} = this.props;

    this.ah.all([
      {
        url: `${baseUrl}/api/indicators/summary`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/indicators/trend?startDttm=2019-03-08T23:59:59Z&endDttm=2019-03-13T23:59:00Z`,
        type: 'GET'
      },
      {
        url: `${baseUrl}/api/indicators/trend/accum?startDttm=2019-03-08T23:59:59Z&endDttm=2019-03-13T23:59:00Z`,
        type: 'GET'
      }
    ])
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
  getText = (eventInfo, data) => {
    const text = data[0].indicator + ': ' + data[0].count + ' ' + t('txt-at') + ' ' + Moment(data[0].day, 'x').utc().format('YYYY/MM/DD');
    return text;
  }
  onTooltip = (eventInfo, data) => {
    return (
      <div>
        <div>{this.getText(eventInfo, data)}</div>
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {indicatorsData, indicatorsTrendData, acuIndicatorsTrendData} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          <div className='parent-content'>
            <div className='main-content'>
              <header className='main-header'>{t('txt-threatIntelligence')}</header>
              <button className='standard btn last'>{t('edge-management.txt-addThreat')}</button>

              <div className='main-statistics'>
                <div className='statistics-content'>
                  <div className='chart-group'>
                    <PieChart
                      title={t('edge-management.statistics.txt-sourceIndicators')}
                      data={indicatorsData}
                      keyLabels={{
                        key: t('txt-indicator'),
                        doc_count: t('txt-count')
                      }}
                      valueLabels={{
                        key: t('txt-indicator'),
                        doc_count: t('txt-count')
                      }}
                      dataCfg={{
                        splitSlice: ['key'],
                        sliceSize: 'doc_count'
                      }} />
                  </div>
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