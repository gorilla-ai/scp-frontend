import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import Popper from '@material-ui/core/Popper';
import Tooltip from '@material-ui/core/Tooltip';
import { TableCell as MuiTableCell } from '@material-ui/core'

import {BaseDataContext} from './context'
import helper from './helper'

const FILTER_EXCLUDE_FIELDS = ['@timestamp', 'firstPacket', 'lastPacket', 'timestamp', '_eventDttm_', '_Raw', 'message', 'msg'];

let t = null;

const oldRender = MuiTableCell.render

MuiTableCell.render = function (...args) {
    const [props, ...otherArgs] = args
    if (typeof props === 'object' && props && 'isEmpty' in props) {
        const { isEmpty, ...propsWithoutEmpty } = props
        return oldRender.apply(this, [propsWithoutEmpty, ...otherArgs])
    } else {
        return oldRender.apply(this, args)
    }
}

/**
 * Table Cell
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to display formatted data in the table
 */
class TableCell extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showIcon: false,
      expandContent: false
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    const {onResize} = this.props
    const {expandContent} = this.state

    if (onResize && prevState.expandContent != expandContent)
      onResize()
  }
  /**
   * Toggle the filter icon on/off
   * @method
   * @param {boolean} boolean - true/false
   */
  showFilterIcon = (boolean) => {
    this.setState({
      showIcon: boolean
    });
  }
  /**
   * Get table row background color
   * @method
   * @param {object} value - field value
   * @returns background color
   */
  getBackgroundColor = (value) => {
    const {markData} = this.props;
    let tempMarkData = [];
    let color = '';

    if (value) {
      if (typeof value === 'string') {
        value = value.toLowerCase();
      } else if (typeof value === 'number') {
        value = value.toString();
        value = value.toLowerCase();
      } else {
        return;
      }
    } else {
      return;
    }

    _.forEach(markData, (val, i) => {
      tempMarkData.push({
        data: val.data,
        color: helper.getColor(i)
      });
    })

    _.forEach(tempMarkData, val => {
      const data = val.data.toLowerCase();

      if (!data) {
        return;
      }

      if (data === value || value.indexOf(data) > -1) {
        color = val.color;
        return false; //Exit the loop
      }
    })

    return color;
  }
  /**
   * Get title for specific fields
   * @method
   * @param {string} fieldName - field name
   * @param {string} fieldValue - field value
   * @returns title content
   */
  getTitleContent = (fieldName, fieldValue) => {
    if (fieldName === '_Raw' || fieldName === 'message' || fieldName === 'msg') {
      return fieldValue;
    }
  }
  /**
   * Get table field content
   * @method
   * @param {object} type - field type ('internet' or 'intranet')
   * @param {object} tooltip - tooltip info
   * @param {object} picPath - icon image path
   * @param {object} country - country name
   * @returns HTML DOM
   */
  getFieldContent = (type, tooltip, picPath, country) => {
    const {activeTab, fieldName, fieldValue, alertLevelColors} = this.props;
    const {showIcon, expandContent} = this.state;

    if (!fieldValue)
      return null

    if (type === 'internet' || type === 'intranet') {
      return (
        <div className={this.getBackgroundColor(fieldValue)}>
          {type === 'internet' && picPath && country &&
            <img src={picPath} className='flag-icon' title={country} />
          }
          {type === 'intranet' &&
            <i className='fg fg-network' title={tooltip}></i>
          }
          <span className='ip'>{fieldValue}</span>
          <i className={cx('fg fg-filter', {'active': showIcon})} title={t('txt-filterQuery')} onClick={this.props.handleOpenQueryMenu.bind(this, fieldName, fieldValue)}></i>
        </div>
      )
    } else {
      if (activeTab === 'alert' && fieldName === '_severity_') {
        return ( //Special case for Severity in Alerts
          <div>
            <span className='severity-level' style={{backgroundColor: alertLevelColors[fieldValue]}}>{fieldValue}</span>
            <i className={cx('fg fg-filter', {'active': showIcon})} title={t('txt-filterQuery')} onClick={this.props.handleOpenQueryMenu.bind(this, fieldName, fieldValue)}></i>
          </div>
        )
      } else { //Everythig else
        if ((fieldName === '_Raw' || fieldName === 'message' || fieldName === 'msg')) {
          if (expandContent) {
            return <pre className={this.getBackgroundColor(fieldValue)}>
                {fieldValue}
              </pre>
          } else {
            return <Tooltip title={fieldValue} interactive={true} classes={{popper:'cell-tooltip'}}>
                <div className='ellipsis-container'>
                  <div className='ellipsis-item'>
                    <span className={this.getBackgroundColor(fieldValue)}>
                      {fieldValue}
                    </span>
                  </div>
                </div>
              </Tooltip>
          }
        }
        return <span className={this.getBackgroundColor(fieldValue)} title={fieldValue}>
            {fieldValue}
            {!_.includes(FILTER_EXCLUDE_FIELDS, fieldName) &&
            <i className={cx('fg fg-filter', {'active': showIcon})} title={t('txt-filterQuery')} onClick={this.props.handleOpenQueryMenu.bind(this, fieldName, fieldValue)}></i>
            }
          </span>
      }
    }
  }
  /**
   * Get table field value
   * @method
   * @returns HTML DOM
   */
  getFieldValue = () => {
    const {contextRoot} = this.context;
    const {fieldName, allValue} = this.props;

    if (fieldName === 'destIp' || fieldName === 'srcIp' || fieldName === 'ipDst' || fieldName === 'ipSrc') {
      let picPath = '';
      let country = '';

      if (fieldName === 'srcIp' || fieldName === 'ipSrc') {
        if (allValue.srcLocType === 2) {
          let tooltip = '';

          if (allValue.srcTopoInfo) {
            const ownerName = allValue.srcTopoInfo.ownerName;
            const areaName = allValue.srcTopoInfo.areaFullName;
            const seatName = allValue.srcTopoInfo.seatName;

            if (ownerName) {
              tooltip += t('ipFields.owner') + ': ' + ownerName;
            }

            if (areaName) {
              tooltip += ', ' + t('ipFields.areaFullName') + ': ' + areaName;
            }

            if (seatName) {
              tooltip += ', ' + t('ipFields.seat') + ': ' + seatName;
            }
          }
          return this.getFieldContent('intranet', tooltip);
        } else if (allValue.srcLocType === 1) {
          if (allValue.srcCountryCode) {
            picPath = `${contextRoot}/images/flag/${allValue.srcCountryCode.toLowerCase()}.png`;
          }
          if (allValue.srcCountry) {
            country = allValue.srcCountry;
          }
          return this.getFieldContent('internet', '', picPath, country);
        } else {
          return this.getFieldContent();
        }
      } else if (fieldName === 'destIp' || fieldName === 'ipDst') {
        if (allValue.destLocType === 2) {
          let tooltip = '';

          if (allValue.destTopoInfo) {
            const ownerName = allValue.destTopoInfo.ownerName;
            const areaName = allValue.destTopoInfo.areaFullName;
            const seatName = allValue.destTopoInfo.seatName;

            if (ownerName) {
              tooltip += t('ipFields.owner') + ': ' + ownerName;
            }

            if (areaName) {
              tooltip += ', ' + t('ipFields.areaFullName') + ': ' + areaName;
            }

            if (seatName) {
              tooltip += ', ' + t('ipFields.seat') + ': ' + seatName;
            }
          }
          return this.getFieldContent('intranet', tooltip);
        } else if (allValue.destLocType === 1) {
          if (allValue.destCountryCode) {
            picPath = `${contextRoot}/images/flag/${allValue.destCountryCode.toLowerCase()}.png`;
          }
          if (allValue.destCountry) {
            country = allValue.destCountry;
          }
          return this.getFieldContent('internet', '', picPath, country);
        } else {
          return this.getFieldContent();
        }
      }
    } else {
      return this.getFieldContent();
    }
  }
  handleCellClick() {
    this.setState({expandContent: !this.state.expandContent});
  }
  render() {
    return (
      <div
        className='table-cell'
        onMouseOver={this.showFilterIcon.bind(this, true)}
        onMouseOut={this.showFilterIcon.bind(this, false)}
        onClick={this.handleCellClick.bind(this)}
        onDoubleClick={this.props.handleRowDoubleClick}>
        {this.getFieldValue()}
      </div>
    )
  }
}

TableCell.contextType = BaseDataContext;

TableCell.propTypes = {
  activeTab: PropTypes.string,
  fieldName: PropTypes.string,
  allValue: PropTypes.object.isRequired,
  alertLevelColors: PropTypes.object,
  onResize: PropTypes.func,
  handleOpenQueryMenu: PropTypes.func,
  handleRowDoubleClick: PropTypes.func
};

export default TableCell;