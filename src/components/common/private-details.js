import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Gis from 'react-gis/build/src/components'

import helper from './helper'
import withLocale from '../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';
const IP_INFO = ['ip', 'mac'];
const HOST_INFO = ['hostName', 'system', 'deviceType', 'userName', 'cpu', 'ram', 'disks', 'shareFolders'];
const OWNER_INFO = ['ownerName', 'ownerID', 'department', 'title'];

let t = null;
let f = null;

/**
 * Private Details
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the detail IP device information
 */
class PrivateDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ip: {},
      owner: {},
      areaName: '',
      hostInfo: [],
      ownerInfo: []
    };

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getDataInfo();
  }
  /**
   * Get and set the ip, owner, area and host information
   * @method
   */
  getDataInfo = () => {
    const {type, alertInfo, topoInfo, srcDestType} = this.props;
    const ip = {
      ip: topoInfo[type] ? topoInfo[type] : topoInfo.srcIp,
      mac: topoInfo[srcDestType + 'Mac'] ? topoInfo[srcDestType + 'Mac'] : topoInfo.srcMac
    };
    const owner = {
      id: topoInfo.ownerObj ? topoInfo.ownerObj.ownerID : topoInfo.ownerID,
      name: topoInfo.ownerObj ? topoInfo.ownerObj.ownerName : topoInfo.ownerName,
      department: topoInfo.ownerObj ? topoInfo.ownerObj.departmentName : topoInfo.departmentName,
      title: topoInfo.ownerObj ? topoInfo.ownerObj.titleName : topoInfo.titleName,
      map: alertInfo[type] ? alertInfo[type].ownerMap : alertInfo.ownerMap,
      seat: alertInfo[type] ? alertInfo[type].ownerSeat : alertInfo.ownerSeat,
      baseLayers: alertInfo[type] ? alertInfo[type].ownerBaseLayers : alertInfo.ownerBaseLayers
    };
    const areaName = topoInfo.areaObj ? topoInfo.areaObj.areaFullName : topoInfo.areaFullName;
    let hostInfo = [];
    let ownerInfo = [];

    _.forEach(HOST_INFO, val => {
      if (topoInfo[val]) {
        hostInfo.push({
          field: val,
          info: topoInfo[val]
        });
      }
    })

    _.forEach(OWNER_INFO, val => {
      let ownerField = val;

      if (val === 'ownerName') {
        ownerField = 'name';
      } else if (val === 'ownerID') {
        ownerField = 'id';
      }

      if (owner[ownerField]) {
        ownerInfo.push({
          field: val,
          info: owner[ownerField]
        });
      }
    })

    this.setState({
      ip,
      owner,
      areaName,
      hostInfo,
      ownerInfo
    });
  }
  /**
   * Display IP information
   * @method
   * @param {object} ip - IP data
   * @param {string} val - ip or mac
   * @param {number} i - index of the IP_INFO array
   * @returns HTML DOM
   */
  displayIpInfo = (ip, val, i) => {
    return (
      <tr key={i}>
        <td>{t('ipFields.' + val)}</td>
        <td>{ip[val] || NOT_AVAILABLE}</td>
      </tr>
    )
  }
  /**
   * Display host or owner table row
   * @method
   * @param {string} fieldType - field name
   * @param {object} val - host or owner data
   * @param {number} i - index of the hostInfo or ownerInfo array
   * @returns HTML DOM
   */
  displayDataInfo = (fieldType, val, i) => {
    return (
      <tr key={i}>
        <td>{t(fieldType + '.' + val.field)}</td>
        <td>{val.info}</td>
      </tr>
    )
  }
  /**
   * Display host or owner table
   * @method
   * @param {array} infoType - hostInfo or ownerInfo array
   * @param {object} fieldType - field name
   * @returns HTML DOM
   */
  displayTableData = (infoType, fieldType) => {
    if (infoType.length > 0) {
      return infoType.map(this.displayDataInfo.bind(this, fieldType));
    } else if (infoType.length === 0) {
      return (
        <tr>
          <td>{NOT_AVAILABLE}</td>
        </tr>
      )
    }
  }
  render() {
    const {topoInfo, picPath} = this.props;
    const {ip, owner, areaName, hostInfo, ownerInfo} = this.state;

    return (
      <div className='private'>
        <section>
          <div className='header'>{t('alert.txt-ipInfo')}</div>
          <table className='c-table main-table ip'>
            <tbody>
              {IP_INFO.map(this.displayIpInfo.bind(this, ip))}
            </tbody>
          </table>
        </section>

        <section>
          <div className='header trigger'>{t('alert.txt-systemInfo')}</div>
          {topoInfo.isHmd && topoInfo.updateDttm &&
            <div className='trigger-text'>{t('edge-management.txt-lastUpateTime')}: {helper.getFormattedDate(topoInfo.updateDttm, 'local')}</div>
          }
          {topoInfo.isHmd &&
            <button className='btn trigger' onClick={this.props.triggerTask.bind(this, 'getSystemInfo', '')}>{t('txt-reTrigger')}</button>
          }
          <table className='c-table main-table host'>
            <tbody>
              {this.displayTableData(hostInfo, 'ipFields')}
            </tbody>
          </table>
        </section>

        <section>
          <div className='header'>{t('alert.txt-ownerInfo')}</div>
          <img src={picPath} className='owner-pic' title={t('network-topology.txt-profileImage')} />
          <table className='c-table main-table owner'>
            <tbody>
              {this.displayTableData(ownerInfo, 'ownerFields')}
            </tbody>
          </table>
        </section>

        <section className='last'>
          <div className='header'>{t('alert.txt-floorInfo')}</div>
          {!_.isEmpty(owner.map) &&
            <div className='floor-map'>
              <span className='floor-header'>{areaName}</span>
              <Gis
                _ref={(ref) => {this.gisNode = ref}}
                data={_.get(owner.seat, [topoInfo.areaUUID, 'data'], [])}
                baseLayers={owner.baseLayers}
                baseLayer={topoInfo.areaUUID}
                layouts={['standard']}
                dragModes={['pan']}
                scale={{enabled: false}}
                symbolOptions={[{
                  match: {
                    data: {tag: 'red'}
                  },
                  props: {
                    backgroundColor: 'red'
                  }
                }]} />
              </div>
          }
          {_.isEmpty(owner.map) &&
            <span>{NOT_AVAILABLE}</span>
          }
        </section>
      </div>
    )
  }
}

PrivateDetails.propTypes = {
  alertInfo: PropTypes.object.isRequired,
  topoInfo: PropTypes.object.isRequired
};

const HocPrivateDetails = withLocale(PrivateDetails);
export { PrivateDetails, HocPrivateDetails };