import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import helper from './helper'
import withLocale from '../../hoc/locale-provider'

const TIME_FIELDS = ['@timestamp', 'firstPacket', 'lastPacket', 'timestamp', '_eventDttm_'];

let t = null;

class TableCell extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showIcon: false
    };

    t = chewbaccaI18n.getFixedT(null, 'connections');
  }
  showFilterIcon = (boolean) => {
    this.setState({
      showIcon: boolean
    });
  }
  getBackgroundColor = (value) => {
    const {markData} = this.props;
    let tempMarkData = [];
    let color = '';

    _.forEach(markData, (val, i) => {
      tempMarkData.push({
        data: val.data,
        color: helper.getColor(i)
      });
    })

    if (value) {
      _.forEach(tempMarkData, val => {
        if (val.data.toLowerCase() === value.toLowerCase()) {
          color = val.color;
          return false;
        }
      })
    }

    return color;
  }
  getFieldContent = (type, tooltip, picPath, country) => {
    const {activeTab, fieldName, fieldValue} = this.props;
    const {showIcon} = this.state;

    if (fieldValue) {
      if (type === 'internet') {
        return (
          <span className={this.getBackgroundColor(fieldValue)}>{fieldValue}<span className='ip'><img src={picPath} title={country} /><i className={cx('fg fg-filter', {'active': showIcon})} title={t('txt-filterQuery')} onClick={this.props.showQueryOptions(fieldName, fieldValue)}></i></span></span>
        )
      } else if (type === 'intranet') {
        return (
          <span className={this.getBackgroundColor(fieldValue)}>{fieldValue}<span className='ip'><i className='fg fg-network' title={tooltip}></i><i className={cx('fg fg-filter', {'active': showIcon})} title={t('txt-filterQuery')} onClick={this.props.showQueryOptions(fieldName, fieldValue)}></i></span></span>
        )
      } else {
        if (activeTab === 'alert' || _.includes(TIME_FIELDS, fieldName)) {
          return (
            <span className={this.getBackgroundColor(fieldValue)}>{fieldValue}</span>
          )
        } else {
          return (
            <span className={this.getBackgroundColor(fieldValue)}>{fieldValue}<i className={cx('fg fg-filter', {'active': showIcon})} title={t('txt-filterQuery')} onClick={this.props.showQueryOptions(fieldName, fieldValue)}></i></span>
          )
        }
      }
    }
  }
  getFieldValue = () => {
    const {contextRoot, fieldName, allValue} = this.props;

    if (fieldName === 'destIp' || fieldName === 'srcIp' || fieldName === 'ipDst' || fieldName === 'ipSrc') {
      let picPath = '';
      let country = '';

      if (fieldName === 'srcIp' || fieldName === 'ipSrc') {
        if (allValue.srcLocType === 1) {
          if (allValue.srcCountryCode) {
            picPath = `${contextRoot}/images/flag/${allValue.srcCountryCode.toLowerCase()}.png`;
            country = allValue.srcCountry;
            return this.getFieldContent('internet', '', picPath, country);
          } else {
            return this.getFieldContent();
          }
        } else {
          if (allValue.srcTopoInfo) {
            const ownerName = allValue.srcTopoInfo.ownerName;
            const areaName = allValue.srcTopoInfo.areaFullName;
            const seatName = allValue.srcTopoInfo.seatName;
            const tooltip = t('ipFields.owner') + ': ' + ownerName + ', ' + t('ipFields.areaFullName') + ': ' + areaName + ', ' + t('ipFields.seat') + ': ' + seatName;
            return this.getFieldContent('intranet', tooltip);
          } else {
            return this.getFieldContent();
          }
        }
      } else if (fieldName === 'destIp' || fieldName === 'ipDst') {
        if (allValue.destLocType === 1) {
          if (allValue.destCountryCode) {
            picPath = `${contextRoot}/images/flag/${allValue.destCountryCode.toLowerCase()}.png`;
            country = allValue.destCountry;
            return this.getFieldContent('internet', '', picPath, country);          
          } else {
            return this.getFieldContent();
          }
        } else {
          if (allValue.destTopoInfo) {
            const ownerName = allValue.destTopoInfo.ownerName;
            const areaName = allValue.destTopoInfo.areaFullName;
            const seatName = allValue.destTopoInfo.seatName;
            const tooltip = t('ipFields.owner') + ': ' + ownerName + ', ' + t('ipFields.areaFullName') + ': ' + areaName + ', ' + t('ipFields.seat') + ': ' + seatName;
            return this.getFieldContent('intranet', tooltip);
          } else {
            return this.getFieldContent();
          }
        }
      }
    } else {
      return this.getFieldContent();
    }
  }
  render() {
    return (
      <div className='table-cell' onMouseOver={this.showFilterIcon.bind(this, true)} onMouseOut={this.showFilterIcon.bind(this, false)}>
        {this.getFieldValue()}
      </div>
    )
  }
}

TableCell.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  allValue: PropTypes.object.isRequired
};

const HocTableCell = withLocale(TableCell);
export { TableCell, HocTableCell };