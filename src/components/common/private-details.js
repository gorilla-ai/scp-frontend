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

let t = null;
let f = null;

class PrivateDetails extends Component {
  constructor(props) {
    super(props);

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  displayIpInfo = (info, val, i) => {
    return (
      <tr key={i}>
        <td>{t('ipFields.' + val)}</td>
        <td>{info[val] || NOT_AVAILABLE}</td>
      </tr>
    )
  }
  displayOwnerInfo = (owner, val, i) => {
    let ownerField = val;

    if (val === 'ownerName') {
      ownerField = 'name';
    } else if (val === 'ownerID') {
      ownerField = 'id';
    }

    return (
      <tr key={i}>
        <td>{t('ownerFields.' + val)}</td>
        <td>{owner[ownerField] || NOT_AVAILABLE}</td>
      </tr>
    )
  }
  render() {
    const {type, alertInfo, topoInfo, picPath, srcDestType} = this.props;
    const ip = {
      ip: topoInfo[type] ? topoInfo[type] : topoInfo.ip,
      mac: topoInfo[srcDestType + 'Mac'] ? topoInfo[srcDestType + 'Mac'] : topoInfo.mac
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
    const ipInfoArr = ['ip', 'mac'];
    const hostInfoArr = ['hostName', 'system', 'deviceType', 'userName', 'cpu', 'ram', 'disks', 'shareFolders'];
    const ownerInfoArr = ['ownerName', 'ownerID', 'department', 'title'];

    return (
      <div className='private'>
        <section>
          <div className='header'>{t('alert.txt-ipInfo')}</div>
          <table className='c-table main-table ip'>
            <tbody>
              {ipInfoArr.map(this.displayIpInfo.bind(this, ip))}
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
              {hostInfoArr.map(this.displayIpInfo.bind(this, topoInfo))}
            </tbody>
          </table>
        </section>

        <section>
          <div className='header'>{t('alert.txt-ownerInfo')}</div>
          <img src={picPath} className='owner-pic' title={t('network-topology.txt-profileImage')} />
          <table className='c-table main-table owner'>
            <tbody>
              {ownerInfoArr.map(this.displayOwnerInfo.bind(this, owner))}
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