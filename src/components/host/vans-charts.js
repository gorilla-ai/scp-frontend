import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import VansRow from './vans-row'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

/**
 * Vans Charts
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show Vans Charts component
 */
class VansNotes extends Component {
  constructor(props) {
    super(props);

    this.state = {

    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getVansChartData();
  }
  componentDidUpdate(prevProps) {
    this.getVansChartData();
  }
  ryan = () => {

  }
  /**
   * Set vans info data if available
   * @method
   */
  getVansChartData = () => {
    console.log(this.props.vansChartsData);
  }
  render() {
   const {vansChartsData} = this.props;

    return (
      <table className='c-table main-table with-border'>
        <thead>
          <tr>
            <th>{t('host.txt-dept')}</th>
            <th>{t('host.txt-vansCount')}</th>
            <th>{t('host.txt-vansHigh')}</th>
            <th>{t('host.txt-cveMedium')}</th>
            <th>{t('host.txt-vansLow')}</th>
            <th>{t('host.txt-gcbCount')}</th>
            <th>{t('host.txt-malwareCount')}</th>
          </tr>
        </thead>
        <tbody>
          {vansChartsData.deptTree && vansChartsData.deptTree.length > 0 &&
            vansChartsData.deptTree.map((row) => {
              return <VansRow key={row.id} row={row} />
            })
          }
        </tbody>
      </table>
    )
  }
}

VansNotes.contextType = BaseDataContext;

VansNotes.propTypes = {
  vansChartsData: PropTypes.object.isRequired
};

export default VansNotes;