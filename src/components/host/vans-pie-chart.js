import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PieChart from 'react-chart/build/src/components/pie'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

/**
 * Vans Pie Chart
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show Vans Pie Chart component
 */
class VansPicChart extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  /**
   * Display Vans Pie Chart content
   * @method
   * @param {object} val - vans data
   * @param {number} i - index of the vans data
   * @returns PieChart component
   */
  displayVansPieChart = (val, i) => {
    const {vansPieChartData} = this.props;
    let newVansData = [];

    _.forEach(vansPieChartData[val], val => {
      const vansName = val.key === 'parentDept' ? t('host.txt-parentDept') : val.key;

      newVansData.push({
        ...val,
        key: vansName
      });
    })

    return (
      <div key={i} className='chart-group'>
        <PieChart
          title={t('host.txt-' + val)}
          data={newVansData}
          keyLabels={{
            key: t('txt-dept'),
            doc_count: t('txt-count')
          }}
          valueLabels={{
            'Pie Chart': {
              key: t('txt-dept'),
              doc_count: t('txt-count')
            }
          }}
          dataCfg={{
            splitSlice: ['key'],
            sliceSize: 'doc_count'
          }} />
      </div>
    )
  }
  render() {
    const {vansDataType} = this.props;
    const actions = {
      confirm: {text: t('txt-close'), handler: this.props.togglePieChart}
    };

    return (
      <ModalDialog
        id='vansPieChartdialog'
        className='modal-dialog'
        title={t('host.txt-hmdStats')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        <div className='charts'>
          {vansDataType.map(this.displayVansPieChart)}
        </div>
      </ModalDialog>
    )
  }
}

VansPicChart.contextType = BaseDataContext;

VansPicChart.propTypes = {
  vansDataType: PropTypes.array.isRequired,
  vansPieChartData: PropTypes.object.isRequired,
  togglePieChart: PropTypes.func.isRequired
};

export default VansPicChart;