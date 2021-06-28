import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
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
      countType: 'device' //'device' or 'hmd'
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
  /**
   * Handle count type value change
   * @method
   * @param {object} event - event object
   */
  handleRadioChange = (event) => {
    this.setState({
      countType: event.target.value
    });
  }
  render() {
   const {vansChartsData} = this.props;
   const {countType} = this.state;

    return (
      <React.Fragment>
        <div className='table-header'>
          <header>{t('host.txt-hmdStats')}</header>
          <div className='header-btn-group'>
            <i className='c-link fg fg-chart-columns'></i>
            <i className='c-link fg fg-file-csv'></i>
          </div>
          <RadioGroup
            className='radio-group'
            value={countType}
            onChange={this.handleRadioChange}>
            <FormControlLabel
              value='device'
              control={<Radio color='primary' />}
              label={t('host.txt-deviceCount')} />
            <FormControlLabel
              value='hmt'
              control={<Radio color='primary' />}
              label={t('host.txt-hmdCount')} />
          </RadioGroup>
        </div>
        <div className='vans-table'>
          <ul className='header'>
            <li>{t('host.txt-dept')}</li>
            <li>{t('host.txt-vansCount')}</li>
            <li>{t('host.txt-vansHigh')}</li>
            <li>{t('host.txt-cveMedium')}</li>
            <li>{t('host.txt-vansLow')}</li>
            <li>{t('host.txt-gcbCount')}</li>
            <li>{t('host.txt-malwareCount')}</li>
            <li>{t('host.txt-tableOptions')}</li>
          </ul>

          <div className='body'>
            {vansChartsData.deptTree && vansChartsData.deptTree.length > 0 &&
              vansChartsData.deptTree.map((row) => {
                return <VansRow key={row.id} row={row} />
              })
            }
          </div>
        </div>
      </React.Fragment>
    )
  }
}

VansNotes.contextType = BaseDataContext;

VansNotes.propTypes = {
  vansChartsData: PropTypes.object.isRequired
};

export default VansNotes;