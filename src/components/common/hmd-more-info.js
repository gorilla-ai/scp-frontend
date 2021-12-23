import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import helper from './helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const NOT_AVAILABLE = 'N/A';

let t = null;
let f = null;

/**
 * HMD more info
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to display HMD more info
 */
class HmdMoreInfo extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  /**
   * Display HMD more table
   * @method
   * @param {object} val - host data
   * @param {number} i - index of the hostInfo array
   * @returns HTML DOM
   */
  displayDataInfo = (val, i) => {
    return (
      <tr key={i}>
        <td style={{width: '180px'}}>{f('hmdDeviceFields.' + val)}</td>
        <td>{this.props.hostData[val] || NOT_AVAILABLE}</td>
      </tr>
    )
  }
  /**
   * Display individual table field item
   * @method
   * @param {string} field - field type
   * @param {object} val - field item
   * @param {number} i - index of the field items
   * @returns HTML DOM
   */
  displayItem = (field, val, i) => {
    return <div key={i} className='item'>{f('hmdDeviceFields.' + val)}: {field[val]}</div>
  }
  /**
   * Display more table field
   * @method
   * @param {string} field - table type
   * @param {object} val - field item
   * @param {number} i - index of the field items
   * @returns HTML DOM
   */
  displayFieldInfo = (type, val, i) => {
    let tableFields = '';

    if (type === 'initProgramInfo') {
      tableFields = ['name', 'command', 'location'];
    } else if (type === 'installs') {
      tableFields = ['name', 'displayName', 'displayVersion', 'publisher', 'installDate'];
    } else if (type === 'firewallInfo') {
      tableFields = ['name', 'enabled', 'remoteAddresses', 'remotePorts', 'ipProtocol', 'applicationName', 'localAddresses', 'localPorts', 'interfaceType', 'direction', 'edgeTraversal', 'profile'];
    }

    return (
      <div key={i} className='field'>
        {tableFields.map(this.displayItem.bind(this, val))}
      </div>
    )
  }
  /**
   * Display more table
   * @method
   * @param {string} val - table type
   * @param {number} i - index of the table type
   * @returns HTML DOM
   */
  displayMoreTable = (val, i) => {
    return (
      <tr key={i}>
        <td>{f('hmdDeviceFields.' + val)}</td>
        {!this.props.hostData[val] &&
          <td className='long-field'>{NOT_AVAILABLE}</td>
        }
        {this.props.hostData[val] &&
          <td className='long-field'>{this.props.hostData[val].map(this.displayFieldInfo.bind(this, val))}</td>
        }
      </tr>
    )
  }
  /**
   * Display device info content
   * @method
   * @returns HTML DOM
   */
  displayDeviceInfo = () => {
    const tableFields = ['browserInfo', 'trustedSite', 'cpu', 'ram', 'disks', 'antiVirus', 'userName', 'groups'];
    const moreFields = ['initProgramInfo', 'installs', 'firewallInfo'];

    return (
      <div>
        <table className='c-table main-table'>
          <tbody>
            {tableFields.map(this.displayDataInfo)}
            {moreFields.map(this.displayMoreTable)}
          </tbody>
        </table>
      </div>
    )
  }
  render() {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.props.toggleViewMore}
    };

    return (
      <ModalDialog
        id='deviceInfoDialog'
        className='modal-dialog'
        title={t('alert.txt-systemInfo')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displayDeviceInfo()}
      </ModalDialog>
    )
  }
}

HmdMoreInfo.propTypes = {
  hostData: PropTypes.object.isRequired,
  toggleViewMore: PropTypes.func.isRequired
};

export default HmdMoreInfo;