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
        dataFieldsArr: ['ip', 'hostName', 'receiveDttm', 'receiveCompleteDttm', 'hbDttm', 'isConnected', 'taskStatus', 'executeStatus', 'taskStatusDescription'],
        dataFields: [],
        dataContent: null
      },
      selectableRows: 'none',
      rowsSelected: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getVansDetailsTable();
  }
  /**
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable field
   */
  checkSortable = (field) => {
    const unSortableFields = ['taskStatusDescription'];

    if (_.includes(unSortableFields, field)) {
      return false;
    } else {
      return true;
    }
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
          sort: this.checkSortable(val),
          viewColumns: true,
          customBodyRenderLite: (dataIndex) => {
            const allValue = tempVansRecord.dataContent[dataIndex];
            const value = tempVansRecord.dataContent[dataIndex][val];
            const deviceInfo = allValue['ipDeviceDTO'];
            const vansInfo = allValue['vansPatchDescriptionDTO'];

            if (val === 'ip' || val === 'hostName') {
              return <span>{deviceInfo[val]}</span>
            } else if (val === 'receiveDttm' || val === 'receiveCompleteDttm') {
              return <span>{helper.getFormattedDate(value, 'local')}</span>
            } else if (val === 'hbDttm') {
              return <span>{helper.getFormattedDate(deviceInfo[val], 'local')}</span>
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
              let color = '#fff';
              let backgroundColor = '';

              if (value === 'Running') {
                backgroundColor = '#ff9802';
              } else if (value === 'Complete') {
                backgroundColor = '#22ac38';
              } else if (value === 'Failure') {
                backgroundColor = '#d10d25';
              } else if (value === 'NotSupport') {
                backgroundColor = '#d10d25';
              } else if (value === 'Waiting') {
                color = '#000';
                backgroundColor = '#d9d9d9';
              }

              return <span className='status-item' style={{color, backgroundColor}}>{t('hmd-scan.txt-task' + value)}</span>
            } else if (val === 'executeStatus') {
              let color = '#fff';
              let backgroundColor = '';

              if (value === 'Running') {
                backgroundColor = '#ff9802';
              } else if (value === 'Complete') {
                backgroundColor = '#22ac38';
              } else if (value === 'Failure') {
                backgroundColor = '#d10d25';
              } else if (value === 'NotSupport') {
                backgroundColor = '#d10d25';
              } else if (value === 'Waiting') {
                color = '#000';
                backgroundColor = '#d9d9d9';
              }

              return <span className='status-item' style={{color, backgroundColor}}>{t('hmd-scan.txt-execute' + value)}</span>
            } else if (val === 'taskStatusDescription') {
              let desc = '';

              if (value === 1) {
                desc = t('hmd-scan.txt-taskReceived');
              } else if (value === 2) {
                desc = t('hmd-scan.txt-downloadCompleted');
              } else if (value === 3) {
                desc = t('hmd-scan.txt-executeCompleted');
              } else if (value === 4) {
                desc = t('hmd-scan.txt-executeAberrant');
              } else if (value === -1) {
                desc = t('hmd-scan.txt-netProxyFail');
              } else if (value === -2) {
                desc = t('hmd-scan.txt-msgQueueFail');
              }

              return <span>{desc}</span>
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
   * @param {string} type - file type ('pdf' or 'csv')
   */
  exportFile = (type) => {
    const {baseUrl, contextRoot} = this.context;
    const {activeVansPatch, vansSearch} = this.props;
    const url = `${baseUrl}${contextRoot}/api/ipdevice/assessment/_search/_vansPatch/_${type}`;
    const requestData = {
      groupId: activeVansPatch.groupId,
      keyword: vansSearch.keyword,
      startDttm: moment(vansSearch.datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      endDttm: moment(vansSearch.datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  /**
   * Toggle table selectable on/off
   * @method
   * @param {string} selectableRows - selectable rows ('none' or 'multiple')
   */
  toggleTableSelectable = (selectableRows) => {
    if (selectableRows === 'none') {
      this.setState({
        rowsSelected: []
      });
    }

    this.setState({
      selectableRows
    });
  }
  /**
   * Select failure items
   * @method
   */
  selectFailureOnes = () => {
    const {vansDetails, rowsSelected} = this.state;
    let tempRowsSelected = [];
    let mergedRowsSelected = [];

    _.forEach(vansDetails.dataContent, (val, i) => {
      if (val.executeStatus === 'Failure') {
        tempRowsSelected.push(i);
      }
    });

    mergedRowsSelected = _.uniq(_.concat(rowsSelected, tempRowsSelected));

    this.setState({
      rowsSelected: mergedRowsSelected
    });
  }
  /**
   * Handle selected row items
   * @method
   */
  getSelectedItems = () => {
    const {activeVansPatch} = this.props;
    const {vansDetails, rowsSelected} = this.state;

    if (rowsSelected.length > 0) {
      const vansInfo = activeVansPatch['vansPatchDescriptionDTO'];
      const selectedItems = _.map(rowsSelected, val => {
        return {
          ip: vansDetails.dataContent[val].ipDeviceDTO.ip,
          hostName: vansDetails.dataContent[val].ipDeviceDTO.hostName,
          osType: vansDetails.dataContent[val].ipDeviceDTO.osType
        }
      });

      this.props.toggleVansPatchSelected(vansInfo, selectedItems);
    }
  }
  /**
   * Display vans patch record content
   * @method
   * @returns HTML DOM
   */
  displayVansPatchDetailsContent = () => {
    const {activeVansPatch} = this.props;
    const {vansDetails, selectableRows, rowsSelected} = this.state;
    const vansInfo = activeVansPatch['vansPatchDescriptionDTO'];
    const tableOptions = {
      serverSide: false,
      viewColumns: false,
      pagination: false,
      tableBodyHeight: '51vh',
      draggableColumns: {
        enabled: false
      },
      selectableRows,
      rowsSelected,
      onRowSelectionChange: (currentRowsSelected, allRowsSelected, rowsSelected) => {
        this.setState({
          rowsSelected
        });
      },
      customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
        return null
      }
    };

    return (
      <div>
        <Button variant='outlined' color='primary' className='standard back-btn' onClick={this.props.toggleVansPatchDetails}>{t('txt-backToList')}</Button>
        <div className='export-btn details'>
          <Button variant='contained' color='primary' className='btn' onClick={this.exportFile.bind(this, 'csv')}>{t('txt-exportCSV')}</Button>
          <Button variant='contained' color='primary' className='btn' onClick={this.exportFile.bind(this, 'pdf')}>{t('txt-exportPDF')}</Button>
        </div>

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
                <td style={{textAlign: 'left'}}>
                  <div><span className='cell-header'>{f('vansPatchFields.scriptFileName')}</span>: {vansInfo.scriptFileName}</div>
                  <div><span className='cell-header'>{f('vansPatchFields.executableFileName')}</span>: {vansInfo.executableFileName}</div>
                  <div><span className='cell-header'>{t('hmd-scan.txt-patchProduct')}</span>: {vansInfo.patchProduct}</div>
                  <div><span className='cell-header'>{t('hmd-scan.txt-patchVendor')}</span>: {vansInfo.patchVendor}</div>
                  <div><span className='cell-header'>{t('hmd-scan.txt-patchVersion')}</span>: {vansInfo.patchVersion}</div>
                </td>
                <td>{vansInfo.memo}</td>
                <td>{helper.getFormattedDate(activeVansPatch.taskCreateDttm, 'local')}</td>
                <td>{helper.getFormattedDate(activeVansPatch.taskUpdateDttm, 'local')}</td>
              </tr>
            </tbody>
          </table>
        }

        <div className='patch-btns'>
          {selectableRows === 'none' &&
            <Button variant='contained' color='primary' className='btn' onClick={this.toggleTableSelectable.bind(this, 'multiple')}>{t('hmd-scan.txt-rePatch')}</Button>
          }
          {selectableRows === 'multiple' &&
            <React.Fragment>
              <Button variant='outlined' color='primary' className='standard' onClick={this.toggleTableSelectable.bind(this, 'none')}>{t('txt-cancel')}</Button>
              <Button variant='contained' color='primary' className='btn' onClick={this.selectFailureOnes}>{t('hmd-scan.txt-patchFailure')}</Button>
              <Button variant='contained' color='primary' className='btn' onClick={this.getSelectedItems} disabled={rowsSelected.length === 0}>Vans Patch</Button>
            </React.Fragment>
          }
        </div>

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
  toggleVansPatchDetails: PropTypes.func.isRequired,
  toggleVansPatchSelected: PropTypes.func.isRequired
};

export default VansPatchDetails;