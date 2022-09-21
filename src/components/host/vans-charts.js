import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import VansRow from './vans-row'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

/**
 * Vans Charts
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show Vans Charts component
 */
class VansCharts extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  /**
   * Handle count type value change
   * @method
   * @param {object} event - event object
   */
  handleRadioChange = (event) => {
    this.props.clearVansData(event.target.value);
  }
  /**
   * Set Vans child data
   * @method
   * @param {object} val - individual child data
   * @param {number} i - index of the child data
   * @returns VansRow component
   */
  setVansRowsData = (val, i) => {
    return (
      <VansRow
        key={val.id}
        row={val}
        setVansDeviceData={this.props.setVansDeviceData}
        togglePieChart={this.props.togglePieChart}
        getCSVfile={this.props.getCSVfile} />
    )
  }
  render() {
    const {vansChartsData, vansTableType} = this.props;

    return (
      <React.Fragment>
        <div className='table-header'>
          <header>{t('host.txt-hmdStats')}</header>
          <div className='header-btn-group'>
            <i className='c-link fg fg-chart-columns' onClick={this.props.togglePieChart.bind(this, vansChartsData.deptTree)}></i>
            <i className='c-link fg fg-file-csv' onClick={this.props.getCSVfile}></i>
          </div>
          <RadioGroup
            className='radio-group'
            value={vansTableType}
            onChange={this.handleRadioChange}>
            <FormControlLabel
              value='assessment'
              control={<Radio color='primary' />}
              label={t('host.txt-deviceCount')} />
            <FormControlLabel
              value='hmd'
              control={<Radio color='primary' />}
              label={t('host.txt-hmdCount')} />
          </RadioGroup>
        </div>
        <div className='vans-table'>
          <ul className='header'>
            <li>{t('host.txt-dept')}</li>
            <li>{t('host.txt-vansCounts')}</li>
            <li>{t('host.txt-vansHigh')}</li>
            <li>{t('host.txt-vansMedium')}</li>
            <li>{t('host.txt-vansLow')}</li>
            <li>{t('host.txt-gcbCounts')}</li>
            <li>{t('host.txt-malwareCounts')}</li>
            <li>{t('host.txt-tableOptions')}</li>
          </ul>

          <div className='body'>
            {vansChartsData.deptTree && vansChartsData.deptTree.length > 0 &&
              vansChartsData.deptTree.map(this.setVansRowsData)
            }
          </div>
        </div>
      </React.Fragment>
    )
  }
}

VansCharts.contextType = BaseDataContext;

VansCharts.propTypes = {
  vansChartsData: PropTypes.object.isRequired,
  vansTableType: PropTypes.string.isRequired,
  setVansDeviceData: PropTypes.func.isRequired,
  clearVansData: PropTypes.func.isRequired,
  togglePieChart: PropTypes.func.isRequired,
  getCSVfile: PropTypes.func.isRequired
};

export default VansCharts;