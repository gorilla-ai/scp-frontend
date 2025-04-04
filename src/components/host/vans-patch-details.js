import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment'

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
        dataFieldsArr: ['ip', 'hostName', 'receiveDttm', 'receiveCompleteDttm', 'hbDttm', 'isConnected', 'sendStatus', 'executeStatus', 'taskStatusDescription'],
        dataFields: [],
        dataContent: null,
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      selectableRows: 'none',
      rowsSelected: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getVansPatchDetails();
  }
  /**
   * Get vans patch details info
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getVansPatchDetails = (fromPage) => {
    const {baseUrl} = this.context;
    const {activeVansPatch} = this.props;
    const {vansDetails} = this.state;
    const page = fromPage === 'currentPage' ? vansDetails.currentPage : 0;
    const url = `${baseUrl}/api/hmd/taskinfo/ipdevice?page=${page + 1}&pageSize=${vansDetails.pageSize}`;
    const requestData = {
      taskName: 'executePatch',
      groupId: activeVansPatch.groupId
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempVansDetails = {...vansDetails};

        if (!data.rows || data.rows.length === 0) {
          tempVansDetails.dataContent = [];
          tempVansDetails.totalCount = 0;

          this.setState({
            vansDetails: tempVansDetails
          });
          return null;
        }

        tempVansDetails.dataContent = data.rows;
        tempVansDetails.totalCount = data.count;
        tempVansDetails.currentPage = page;
        tempVansDetails.dataFields = _.map(vansDetails.dataFieldsArr, val => {
          return {
            name: val,
            label: f(`vansPatchFields.${val}`),
            options: {
              sort: this.checkSortable(val),
              viewColumns: true,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempVansDetails.dataContent[dataIndex];
                const value = tempVansDetails.dataContent[dataIndex][val];
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
                } else if (val === 'sendStatus') {
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
                  if (value !== 0) {
                    return <span>{t('hmd-scan.txt-taskStatusCode' + value)}</span>
                  }
                }
              }
            }
          };
        });

        this.setState({
          vansDetails: tempVansDetails
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }  
  /**
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable field
   */
  checkSortable = (field) => {
    const unSortableFields = ['taskStatusDescription'];

    return !_.includes(unSortableFields, field);
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempVansDetails = {...this.state.vansDetails};
    tempVansDetails[type] = Number(value);

    this.setState({
      vansDetails: tempVansDetails
    }, () => {
      this.getVansPatchDetails(type);
    });
  }
  /**
   * Handle PDF export
   * @method
   * @param {string} type - file type ('pdf' or 'csv')
   */
  exportFile = (type) => {
    const {baseUrl, contextRoot} = this.context;
    const {activeVansPatch} = this.props;
    const url = `${baseUrl}${contextRoot}/api/ipdevice/assessment/_search/_vansPatch/_${type}`;
    const requestData = {
      groupId: activeVansPatch.groupId
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
          osType: vansDetails.dataContent[val].ipDeviceDTO.osType,
          ipDeviceUUID: vansDetails.dataContent[val].ipDeviceDTO.ipDeviceUUID
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
      viewColumns: false,
      tableBodyHeight: '35vh',
      draggableColumns: {
        enabled: false
      },
      selectableRows,
      rowsSelected,
      onChangePage: (currentPage) => {
        this.handlePaginationChange('currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('pageSize', numberOfRows);
      },
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
          {selectableRows === 'none' && (vansDetails.dataContent && vansDetails.dataContent.length > 0) &&
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
  activeVansPatch: PropTypes.object.isRequired,
  toggleVansPatchDetails: PropTypes.func.isRequired,
  toggleVansPatchSelected: PropTypes.func.isRequired
};

export default VansPatchDetails;