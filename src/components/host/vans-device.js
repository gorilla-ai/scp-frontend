import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

/**
 * Vans Device
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show Vans Device component
 */
class VansDevice extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  /**
   * Display vans device data
   * @method
   * @param {object} val - individual device data
   * @param {number} i - index of the device data
   * @returns HTML DOM
   */
  showVansDeviceData = (val, i) => {
    return (
      <ul>
        <li className='device-name'>{val.hostName}</li>
        <li className='device-ip'>{val.ip}</li>
        <li className='vans-count'>{val.vansCounts}</li>
        <li className='vans-high'>{val.vansHigh}</li>
        <li className='vans-medium'>{val.vansMedium}</li>
        <li className='vans-low'>{val.vansLow}</li>
        <li className='gcb-count'>{val.gcbCounts}</li>
        <li className='malware-count'>{val.malwareCounts}</li>
        <li className='mark'>{val.deptName}</li>
      </ul>
    )
  }
  render() {
   const {vansChartsData, vansData} = this.props;
   let tableHeader = '';
   let parentDept = '';

   if (vansData.parentId) {
    const selectedDeptIndex = _.findIndex(vansChartsData.deptTree, { 'id': vansData.parentId });
    parentDept = vansChartsData.deptTree[selectedDeptIndex].name;
    tableHeader = parentDept + ' / ';
   }

   tableHeader += vansData.name + ' ' + t('host.txt-threatsDevice');

    return (
      <React.Fragment>
        <div className='table-header'>
          <header>{tableHeader}</header>
          <div className='header-btn-group'>
            <i className='c-link fg fg-chart-columns'></i>
            <i className='c-link fg fg-file-csv'></i>
          </div>
        </div>
        <div className='vans-table'>
          <ul className='header'>
            <li>{t('host.txt-deviceName')}</li>
            <li>{t('host.txt-deviceIP')}</li>
            <li>{t('host.txt-vansCounts')}</li>
            <li>{t('host.txt-vansHigh')}</li>
            <li>{t('host.txt-vansMedium')}</li>
            <li>{t('host.txt-vansLow')}</li>
            <li>{t('host.txt-gcbCounts')}</li>
            <li>{t('host.txt-malwareCounts')}</li>
            <li>{t('host.txt-mark')}</li>
          </ul>

          <div className='body'>
            {vansData && vansData.devs.length > 0 &&
              vansData.devs.map(this.showVansDeviceData)
            }
          </div>
        </div>
      </React.Fragment>
    )
  }
}

VansDevice.contextType = BaseDataContext;

VansDevice.propTypes = {
  vansChartsData: PropTypes.object.isRequired,
  vansData: PropTypes.array.isRequired
};

export default VansDevice;