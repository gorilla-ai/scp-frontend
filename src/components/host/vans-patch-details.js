import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment'
import cx from 'classnames'

import Button from '@material-ui/core/Button'

import {downloadWithForm} from 'react-ui/build/src/utils/download'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

/**
 * Vans Patch Details
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show Vans Patch Details component
 */
class VansPatchDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vansDetails: {
        dataFieldsArr: ['ip', 'hostName', 'system', 'taskCreateDttm', 'taskResponseDttm', 'hbDttm', 'receiveDttm', 'receiveCompleteDttm', 'isConnected', 'taskStatus', 'executeStatus'],
        dataFields: [],
        dataContent: null
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getVansDetailsTable();
  }
  /**
   * Construct Vans Details table
   * @method
   */
  getVansDetailsTable = () => {
    const {vansPatchDetails} = this.props;
    const {vansDetails} = this.state;
    let tempVansRecord = {...vansDetails};

    tempVansRecord.dataContent = vansPatchDetails;
    tempVansRecord.dataFields = _.map(vansDetails.dataFieldsArr, val => {
      return {
        name: val,
        label: f(`vansPatchFields.${val}`),
        options: {
          sort: false,
          viewColumns: true,
          customBodyRenderLite: (dataIndex) => {
            const allValue = tempVansRecord.dataContent[dataIndex];
            const value = tempVansRecord.dataContent[dataIndex][val];
            const deviceInfo = allValue['ipDeviceDTO'];
            const vansInfo = allValue['vansPatchDescriptionDTO'];

            if (val === 'ip' || val === 'hostName' || val === 'system') {
              return <span>{deviceInfo[val]}</span>
            } else if (val === 'taskCreateDttm' || val === 'taskResponseDttm') {
              return <span>{helper.getFormattedDate(value, 'local')}</span>
            } else if (val === 'hbDttm') {
              return <span>{helper.getFormattedDate(deviceInfo[value], 'local')}</span>
            } else if (val === 'receiveDttm') {
              return <span>{helper.getFormattedDate(value, 'local')}</span>
            } else if (val === 'receiveCompleteDttm') {
              return <span>{helper.getFormattedDate(value, 'local')}</span>
            } else if (val === 'isConnected') {
              const status = deviceInfo[val] ? t('txt-connected') : t('txt-disconnected');
              let color = '';
              let backgroundColor = '';

              if (deviceInfo[val]) {
                color = '#fff';
                backgroundColor = '#22ac38';
              } else {
                color = '#000';
                backgroundColor = '#d9d9d9';
              }

              return <span className='status-item' style={{color, backgroundColor}}>{status}</span>
            } else if (val === 'taskStatus') {
              let backgroundColor = '';

              if (value === 'Running') {
                backgroundColor = '#ff9802';
              } else if (value === 'Complete') {
                backgroundColor = '#22ac38';
              } else if (value === 'Failure') {
                backgroundColor = '#d10d25';
              } else if (value === 'NotSupport') {
                backgroundColor = '#d10d25';
              }

              return <span className='status-item' style={{color: '#fff', backgroundColor}}>{t('hmd-scan.txt-task' + value)}</span>
            } else if (val === 'executeStatus') {
              let backgroundColor = '';

              if (value === 'Running') {
                backgroundColor = '#ff9802';
              } else if (value === 'Complete') {
                backgroundColor = '#22ac38';
              } else if (value === 'Failure') {
                backgroundColor = '#d10d25';
              } else if (value === 'NotSupport') {
                backgroundColor = '#d10d25';
              }

              return <span className='status-item' style={{color: '#fff', backgroundColor}}>{t('hmd-scan.txt-execute' + value)}</span>
            }
          }
        }
      };
    });

    this.setState({
      vansDetails: tempVansRecord
    });
  }
  /**
   * Handle PDF export
   * @method
   */
  exportPdf = () => {
    const {baseUrl, contextRoot} = this.context;
    const {activeVansPatch, vansSearch} = this.props;
    const url = `${baseUrl}${contextRoot}/api/ipdevice/assessment/_search/_vansPatch/_pdf`;
    const requestData = {
      groupId: activeVansPatch.groupId,
      keyword: vansSearch.keyword,
      startDttm: moment(vansSearch.datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      endDttm: moment(vansSearch.datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  /**
   * Display vans patch record content
   * @method
   * @returns HTML DOM
   */
  displayVansPatchDetailsContent = () => {
    const {vansPatchDetails, activeVansPatch} = this.props;
    const {vansDetails} = this.state;
    const tableOptions = {
      viewColumns: false,
      pagination: false,
      tableBodyHeight: '51vh',
      draggableColumns: {
        enabled: false
      }
    };
    const vansInfo = activeVansPatch['vansPatchDescriptionDTO'];

    return (
      <div>
        <Button variant='outlined' color='primary' className='standard back-btn' onClick={this.props.toggleVansPatchDetails}>{t('txt-backToList')}</Button>
        <Button variant='contained' color='primary' className='btn pdf-btn details' onClick={this.exportPdf}>{t('txt-exportPDF')}</Button>

        {vansInfo &&
          <table className='c-table main-table align-center with-border patch-table'>
            <thead>
              <tr>
                <th>{t('hmd-scan.txt-vansType')}</th>
                <th>{t('hmd-scan.txt-executeInfo')}</th>
                <th>{t('txt-memo')}</th>
                <th>{f('vansPatchFields.taskCreateDttm')}</th>
                <th>{f('vansPatchFields.taskUpdateDttm')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('hmd-scan.txt-patch-' + vansInfo.actionModel)}</td>
                <td>
                  <div><span className='cell-header'>{f('vansPatchFields.scriptFileName')}</span>: {vansInfo.scriptFileName}</div>
                  <div><span className='cell-header'>{f('vansPatchFields.executableFileName')}</span>: {vansInfo.executableFileName}</div>
                </td>
                <td>{vansInfo.memo}</td>
                <td>{helper.getFormattedDate(activeVansPatch.taskCreateDttm, 'local')}</td>
                <td>{helper.getFormattedDate(activeVansPatch.taskUpdateDttm, 'local')}</td>
              </tr>
            </tbody>
          </table>
        }

        <MuiTableContent
          data={vansDetails}
          tableOptions={tableOptions}
          tableHeight='auto'
          showLoading={false} />
      </div>
    )
  }
  render() {
    const actions = {
      confirm: {text: t('txt-close'), handler: this.props.toggleVansPatchDetails}
    };

    return (
      <ModalDialog
        id='vansPatchRecordDialog'
        className='modal-dialog'
        title={t('hmd-scan.txt-vansPatchHost')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='confirm'>
        {this.displayVansPatchDetailsContent()}
      </ModalDialog>
    )
  }
}

VansPatchDetails.contextType = BaseDataContext;

VansPatchDetails.propTypes = {
  vansPatchDetails: PropTypes.array.isRequired,
  activeVansPatch: PropTypes.object.isRequired,
  vansSearch: PropTypes.object.isRequired,
  toggleVansPatchDetails: PropTypes.func.isRequired
};

export default VansPatchDetails;