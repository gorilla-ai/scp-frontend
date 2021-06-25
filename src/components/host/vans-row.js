import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import Button from '@material-ui/core/Button'
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import TextField from '@material-ui/core/TextField'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

/**
 * Vans Row
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show Vans Row component
 */
class VansRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getVansRowData();
  }
  componentDidUpdate(prevProps) {
    this.getVansRowData();
  }
  ryan = () => {

  }
  /**
   * Set vans info data if available
   * @method
   */
  getVansRowData = () => {
    console.log(this.props.row);
  }
  toggleRow = () => {
    this.setState({
      open: !this.state.open
    });
  }
  /**
   * Display vans child data
   * @method
   * @param {object} val - vans child data
   * @returns HTML component
   */
  displayChildData = (val) => {
    return (
      <tr key={val.id} className='child-data'>
        <td className='vans-name'>{val.name}</td>
        <td className='vans-count'>{val.vansCounts}</td>
        <td className='vans-high'>{val.vansHigh}</td>
        <td className='vans-medium'>{val.vansMedium}</td>
        <td className='vans-low'>{val.vansLow}</td>
        <td className='gcb-count'>{val.gcbCounts}</td>
        <td className='malware-count'>{val.malwareCounts}</td>
      </tr>
    )
  }
  render() {
   const {row} = this.props;
   const {open} = this.state;

    return (
      <React.Fragment>
        <tr>
          <td className='vans-name'>
            {row.children && row.children.length > 0 &&
              <IconButton aria-label='expand row' size='small' onClick={this.toggleRow}>
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            }
            {row.name}
          </td>
          <td className='vans-count'>{row.vansCounts}</td>
          <td className='vans-high'>{row.vansHigh}</td>
          <td className='vans-medium'>{row.vansMedium}</td>
          <td className='vans-low'>{row.vansLow}</td>
          <td className='gcb-count'>{row.gcbCounts}</td>
          <td className='malware-count'>{row.malwareCounts}</td>
        </tr>
        <tr className={cx('secondary-row', {'active': open})}>
          <td colSpan={7}>
            <Collapse in={open} timeout='auto' unmountOnExit>
              <table className='c-table main-table with-border'>
                <tbody>
                  {row.children.map(this.displayChildData)}
                </tbody>
              </table>
            </Collapse>
          </td>
        </tr>
      </React.Fragment>
    )
  }
}

VansRow.contextType = BaseDataContext;

VansRow.propTypes = {
  row: PropTypes.object.isRequired
};

export default VansRow;