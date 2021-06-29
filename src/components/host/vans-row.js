import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

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
  /**
   * Toggle table row on/off
   * @method
   * @param {string} toggle - toggle child on/off ('toogle' or 'noToggle')
   * @param {array.<object>} data - vans child data
   */
  toggleRow = (toggle, data) => {
    if (toggle === 'toggle') {
      this.setState({
        open: !this.state.open
      }, () => {
        let vansData = {};

        if (this.state.open) {
          vansData = data;
        }

        this.props.setVansDeviceData(vansData);
      });
    } else if (toggle === 'noToggle') {
      this.props.setVansDeviceData(data);
    }
  }
  /**
   * Check child element
   * @method
   * @param {object} child - vans child data
   * @returns css cursor pointer
   */
  checkChildNode = (child) => {
    if (child && child.length > 0) {
      return { cursor: 'pointer' };
    }
  }
  /**
   * Display vans child data
   * @method
   * @param {object} val - vans child data
   * @param {number} i - index of the child data
   * @returns HTML component
   */
  displayChildData = (val, i) => {
    return (
      <ul key={val.id} style={this.checkChildNode(val.devs)} className='child-data' onClick={this.toggleRow.bind(this, 'noToggle', val)}>
        <li className='vans-name'>{val.name}</li>
        <li className='vans-count'>{val.vansCounts}</li>
        <li className='vans-high'>{val.vansHigh}</li>
        <li className='vans-medium'>{val.vansMedium}</li>
        <li className='vans-low'>{val.vansLow}</li>
        <li className='gcb-count'>{val.gcbCounts}</li>
        <li className='malware-count'>{val.malwareCounts}</li>
        <li className='actions'>
          <i className='c-link fg fg-chart-columns'></i>
          <i className='c-link fg fg-file-csv'></i>
        </li>
      </ul>
    )
  }
  render() {
   const {row} = this.props;
   const {open} = this.state;

    return (
      <React.Fragment>
        <ul style={this.checkChildNode(row.children)} onClick={this.toggleRow.bind(this, 'toggle', row)}>
          <li className='vans-name'>
            {row.children && row.children.length > 0 &&
              <IconButton aria-label='expand row' size='small'>
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            }
            {row.name}
          </li>
          <li className='vans-count'>{row.vansCounts}</li>
          <li className='vans-high'>{row.vansHigh}</li>
          <li className='vans-medium'>{row.vansMedium}</li>
          <li className='vans-low'>{row.vansLow}</li>
          <li className='gcb-count'>{row.gcbCounts}</li>
          <li className='malware-count'>{row.malwareCounts}</li>
          <li className='actions'>
            <i className='c-link fg fg-chart-columns'></i>
            <i className='c-link fg fg-file-csv'></i>
          </li>
        </ul>
        <ul className={cx('child-row', {'active': open})}>
          <li>
            <Collapse in={open} timeout='auto' unmountOnExit>
              {row.children.map(this.displayChildData)}
            </Collapse>
          </li>
        </ul>
      </React.Fragment>
    )
  }
}

VansRow.contextType = BaseDataContext;

VansRow.propTypes = {
  countType: PropTypes.string.isRequired,
  row: PropTypes.object.isRequired
};

export default VansRow;