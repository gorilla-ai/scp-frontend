import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import DataTable from 'react-ui/build/src/components/table'
import PieChart from 'react-chart/build/src/components/pie'

import helper from '../common/helper'
import withLocale from '../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

class StatisticNew extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alertChartsList: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  componentDidUpdate = (prevProps) => {
    this.getChartsData(prevProps);
  }
  getChartsData = (prevProps) => {
    const {chartsID, alertStatisticData} = this.props;
    let alertChartsList = [];

    _.forEach(chartsID, (val, i) => {
      if (i <= 5) {
        alertChartsList.push({
          chartID: val.title,
          chartTitle: t('alert.statistics.' + val.title),
          chartKeyLabels: {
            key: t('attacksFields.' + val.key),
            doc_count: t('txt-count')
          },
          chartValueLabels: {
            'Pie Chart': {
              key: t('attacksFields.' + val.key),
              doc_count: t('txt-count')
            }
          },
          chartDataCfg: {
            splitSlice: ['key'],
            sliceSize: 'doc_count'
          },
          chartData: alertStatisticData[val.title],
          type: 'pie'
        });
      }
    })

    alertChartsList.push(
      {
        chartID: 'topAttackLogin',
        chartTitle: t('network.statistic.top10AttackingLogin'),
        chartKeyLabels: {
          account: t('txt-account'),
          totalCnt: t('txt-count')
        },
        chartValueLabels: {
          "Pie Chart": {
            account: t('txt-account'),
            totalCnt: t('txt-count')
          }
        },
        chartDataCfg: {
          splitSlice: ['account'],
          sliceSize: 'totalCnt'
        },
        chartData: alertStatisticData.topAttackLogin,
        type: 'pie'
      },
      {
        chartID: 'topAttackPassword',
        chartTitle: t('network.statistic.top10AttackingPassword'),
        chartKeyLabels: {
          password: t('txt-password'),
          totalCnt: t('txt-count')
        },
        chartValueLabels: {
          "Pie Chart": {
            password: t('txt-password'),
            totalCnt: t('txt-count')
          }
        },
        chartDataCfg: {
          splitSlice: ['password'],
          sliceSize: 'totalCnt'
        },
        chartData: alertStatisticData.topAttackPassword,
        type: 'pie'
      }      
    );

    if (!prevProps || (prevProps && alertStatisticData !== prevProps.alertStatisticData)) {
      this.setState({
        alertChartsList
      });
    }
  }
  render() {
    const {alertChartsList} = this.state;

    return (
      <div className='main-statistic c-flex boxes'>
        <div className='content statistic'>
          {
            alertChartsList.map((key, i) => {
              if (alertChartsList[i].type === 'pie' && !_.isEmpty(alertChartsList[i].chartData)) {
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
                        className='main-table no-pointer'
                        fields={alertChartsList[i].chartFields}
                        data={alertChartsList[i].chartData}
                        defaultSort={alertChartsList[i].chartData ? alertChartsList[i].sort : {}} />
                    </div>
                  </div>
                )
              }
            })
          }
        </div>
      </div>
    )
  }
}

StatisticNew.propTypes = {
  alertStatisticData: PropTypes.object.isRequired
};

export default withLocale(StatisticNew);