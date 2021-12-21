import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

import Button from '@material-ui/core/Button'

import Gis from 'react-gis/build/src/components'

import {BaseDataContext} from './context'
import helper from './helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';
const IP_INFO = ['ip', 'mac', 'netproxyIp', 'netproxyName'];
const HOST_INFO = ['hostName', 'system', 'deviceType', 'userAccount', 'cpu', 'ram', 'disks', 'shareFolders', 'remarks'];
const OWNER_INFO = ['ownerName', 'ownerID', 'department', 'title'];

let t = null;
let f = null;

/**
 * Private Details
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
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

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getPrivateInfo();
  }
  componentDidUpdate(prevProps) {
    if (!prevProps || (this.props.topoInfo !== prevProps.topoInfo)) {
      this.getPrivateInfo(prevProps);
    }
  }
  /**
   * Get and set the ip, owner, area and host information
   * @method
   */
  getPrivateInfo = (prevProps) => {
    const {alertInfo, topoInfo} = this.props;
    const ip = {
      ip: topoInfo.ip,
      mac: topoInfo.mac,
      netproxyIp: topoInfo.netproxyIp,
      netproxyName: topoInfo.netproxyName
    };
    const owner = {
      id: topoInfo.ownerObj ? topoInfo.ownerObj.ownerID : topoInfo.ownerID,
      name: topoInfo.ownerObj ? topoInfo.ownerObj.ownerName : topoInfo.ownerName,
      department: topoInfo.ownerObj ? topoInfo.ownerObj.departmentName : topoInfo.departmentName,
      title: topoInfo.ownerObj ? topoInfo.ownerObj.titleName : topoInfo.titleName,
      map: alertInfo.ownerMap,
      seat: alertInfo.ownerSeat,
      baseLayers: alertInfo.ownerBaseLayers
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

    if (!prevProps || (prevProps && alertInfo.ownerMap != prevProps.alertInfo.ownerMap)) {
      this.setState({
        ip,
        owner,
        areaName,
        hostInfo,
        ownerInfo
      });
    }
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
  /**
   * Redirect to Config inventory page
   * @param {string} ip - device IP
   * @method
   */
  redirectInventory = (ip) => {
    const {baseUrl, contextRoot, language} = this.context;
    const url = `${baseUrl}${contextRoot}/configuration/topology/inventory?ip=${ip}&type=search&lng=${language}`;

    window.open(url, '_blank');
  }
  render() {
    const {from, topoInfo, picPath} = this.props;
    const {ip, owner, areaName, hostInfo, ownerInfo} = this.state;

    return (
      <div className='private'>
        <section>
          <div className='header'>{t('alert.txt-ipInfo')}</div>
          {(from === 'host' || from === 'alert') && ip &&
            <Button variant='contained' color='primary' className='btn trigger' onClick={this.redirectInventory.bind(this, ip.ip)}>{t('txt-viewEdit')}</Button>
          }
          <table className='c-table main-table ip'>
            <tbody>
              {IP_INFO.map(this.displayIpInfo.bind(this, ip))}
            </tbody>
          </table>
        </section>

        <section>
          <div className='header trigger'>{t('alert.txt-systemInfo')}</div>
          {topoInfo && topoInfo.isHmd && topoInfo.updateDttm &&
            <div className='trigger-text'>{t('edge-management.txt-lastUpdateTime')}: {helper.getFormattedDate(topoInfo.updateDttm, 'local')}</div>
          }
          {topoInfo && topoInfo.isHmd &&
            <Button variant='contained' color='primary' className='btn trigger' onClick={this.props.triggerTask.bind(this, ['getSystemInfo'], 'fromInventory')}>{t('txt-reTrigger')}</Button>
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
                mapOptions={{
                  maxZoom: 2
                }}
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

PrivateDetails.contextType = BaseDataContext;

PrivateDetails.propTypes = {
  from: PropTypes.string.isRequired,
  alertInfo: PropTypes.object.isRequired,
  topoInfo: PropTypes.object.isRequired,
  picPath: PropTypes.string.isRequired,
  triggerTask: PropTypes.func.isRequired
};

export default PrivateDetails;