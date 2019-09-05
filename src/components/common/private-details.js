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
  componentDidMount = () => {

  }
  render() {
    const {type, alertInfo, topoInfo, picPath, srcDestType} = this.props;

    return (
      <div className='private'>
        <section>
          <div className='header'>{t('alert.txt-ipInfo')}</div>
          <table className='c-table main-table ip'>
            <tbody>
              <tr>
                <td>IP</td>
                <td>{topoInfo[type] || NOT_AVAILABLE}</td>
              </tr>
              <tr>
                <td>MAC</td>
                <td>{topoInfo[srcDestType + 'Mac'] || NOT_AVAILABLE}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <div className='header'>{t('alert.txt-systemInfo')}</div>
          <table className='c-table main-table host'>
            <tbody>
              <tr>
                <td>{t('ipFields.hostName')}</td>
                <td>{topoInfo.hostName || NOT_AVAILABLE}</td>
              </tr>
              <tr>
                <td>{t('ipFields.system')}</td>
                <td>{topoInfo.system || NOT_AVAILABLE}</td>
              </tr>
              <tr>
                <td>{t('ipFields.deviceType')}</td>
                <td>{topoInfo.deviceType || NOT_AVAILABLE}</td>
              </tr>
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
                <td>{topoInfo.ownerName || NOT_AVAILABLE}</td>
              </tr>
              <tr>
                <td>{t('ownerFields.ownerID')}</td>
                <td>{topoInfo.ownerID || NOT_AVAILABLE}</td>
              </tr>
              <tr>
                <td>{t('ownerFields.department')}</td>
                <td>{topoInfo.department || NOT_AVAILABLE}</td>
              </tr>
              <tr>
                <td>{t('ownerFields.title')}</td>
                <td>{topoInfo.title || NOT_AVAILABLE}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <div className='header'>{t('alert.txt-floorInfo')}</div>
          {!_.isEmpty(alertInfo[type].ownerMap) &&
            <div className='floor-map'>
              <Gis
                _ref={(ref) => {this.gisNode = ref}}
                data={_.get(alertInfo[type].ownerSeat, [topoInfo.areaUUID, 'data'], [])}
                baseLayers={alertInfo[type].ownerBaseLayers}
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
          {_.isEmpty(alertInfo[type].ownerMap) &&
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