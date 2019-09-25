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

    this.state = {
    };

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  render() {
    const {type, alertInfo, topoInfo, picPath, srcDestType} = this.props;
    const IP = topoInfo[type] ? topoInfo[type] : topoInfo.ip;
    const mac = topoInfo[srcDestType + 'Mac'] ? topoInfo[srcDestType + 'Mac'] : topoInfo.mac;
    const owner = {
      id: topoInfo.ownerObj ? topoInfo.ownerObj.ownerID : topoInfo.ownerID,
      name: topoInfo.ownerObj ? topoInfo.ownerObj.ownerName : topoInfo.ownerName,
      department: topoInfo.ownerObj ? topoInfo.ownerObj.departmentName : topoInfo.department,
      title: topoInfo.ownerObj ? topoInfo.ownerObj.titleName : topoInfo.title,
      map: alertInfo[type] ? alertInfo[type].ownerMap : alertInfo.ownerMap,
      seat: alertInfo[type] ? alertInfo[type].ownerSeat : alertInfo.ownerSeat,
      baseLayers: alertInfo[type] ? alertInfo[type].ownerBaseLayers : alertInfo.ownerBaseLayers
    };
    const areaName = topoInfo.areaObj ? topoInfo.areaObj.areaFullName : topoInfo.areaFullName;
    const disksContent = topoInfo.disks.substr(0, 80) + '...';
    const foldersContent = topoInfo.shareFolders.substr(0, 80) + '...';

    return (
      <div className='private'>
        <section>
          <div className='header'>{t('alert.txt-ipInfo')}</div>
          <table className='c-table main-table ip'>
            <tbody>
              <tr>
                <td>IP</td>
                <td>{IP || NOT_AVAILABLE}</td>
              </tr>
              <tr>
                <td>MAC</td>
                <td>{mac || NOT_AVAILABLE}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <div className='header trigger'>{t('alert.txt-systemInfo')}</div>
          <div className='trigger-text'>{t('edgeManagement.txt-lastUpateTime')}: {helper.getFormattedDate(topoInfo.updateDttm, 'local')}</div>
          <button className='btn trigger' onClick={this.props.triggerTask.bind(this, '', 'getSystemInfo')}>{t('txt-reTrigger')}</button>
          <table className='c-table main-table host'>
            <tbody>
              {topoInfo.hostName &&
                <tr>
                  <td>{t('ipFields.hostName')}</td>
                  <td>{topoInfo.hostName}</td>
                </tr>
              }
              {topoInfo.system &&
                <tr>
                  <td>{t('ipFields.system')}</td>
                  <td>{topoInfo.system}</td>
                </tr>
              }
              {topoInfo.deviceType &&
                <tr>
                  <td>{t('ipFields.deviceType')}</td>
                  <td>{topoInfo.deviceType}</td>
                </tr>
              }
              {topoInfo.userName &&
                <tr>
                  <td>User</td>
                  <td>{topoInfo.userName}</td>
                </tr>
              }
              {topoInfo.cpu &&
                <tr>
                  <td>{t('txt-cpu')}</td>
                  <td>{topoInfo.cpu}</td>
                </tr>
              }
              {topoInfo.cpu &&
                <tr>
                  <td>{t('txt-ram')}</td>
                  <td>{topoInfo.ram}</td>
                </tr>
              }
              {topoInfo.disks &&
                <tr>
                  <td>{t('txt-disks')}</td>
                  <td onClick={helper.showPopupMsg.bind(this, topoInfo.disks, '')} style={{cursor: 'pointer'}}>{disksContent}</td>
                </tr>
              }
              {topoInfo.shareFolders &&
                <tr>
                  <td>{t('txt-shareFolders')}</td>
                  <td onClick={helper.showPopupMsg.bind(this, topoInfo.shareFolders, '')} style={{cursor: 'pointer'}}>{foldersContent}</td>
                </tr>
              }
            </tbody>
          </table>
        </section>

        <section>
          <div className='header'>{t('alert.txt-ownerInfo')}</div>
          <img src={picPath} className='owner-pic' title={t('network-topology.txt-profileImage')} />
          <table className='c-table main-table owner'>
            <tbody>
              <tr>
                <td>{t('ownerFields.ownerName')}</td>
                <td>{owner.name || NOT_AVAILABLE}</td>
              </tr>
              <tr>
                <td>{t('ownerFields.ownerID')}</td>
                <td>{owner.id || NOT_AVAILABLE}</td>
              </tr>
              <tr>
                <td>{t('ownerFields.department')}</td>
                <td>{owner.department || NOT_AVAILABLE}</td>
              </tr>
              <tr>
                <td>{t('ownerFields.title')}</td>
                <td>{owner.title || NOT_AVAILABLE}</td>
              </tr>
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