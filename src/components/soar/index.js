import React, { Component, useRef } from 'react'
import { withRouter } from 'react-router'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Popover from '@material-ui/core/Popover'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import {BaseDataContext} from '../common/context'
import helper from '../common/helper'
import MuiTableContent from '../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;

/**
 * SOAR
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the SOAR page
 */
class SoarController extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');

    this.state = {
      soarData: {
        dataFieldsArr: ['_eventDttm_', '_severity_', 'srcIp', 'srcPort', 'destIp', 'destPort', 'Source', 'Info', 'Collector', 'severity_type_name'],
        dataFields: [],
        dataContent: null,
        sort: {
          field: '_eventDttm_',
          desc: true
        },
        totalCount: 0,
        currentPage: 1,
        oldPage: 1,
        pageSize: 20
      }
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getSoarData();
  }
  ryan = () => {

  }
  /**
   * Get and set SOAR data
   * @method
   * @param {string} [fromPage] - option for 'currentPage'
   */
  getSoarData = (fromPage) => {
    const {baseUrl} = this.context;
    const {soarData} = this.state;
    const page = fromPage === 'currentPage' ? soarData.currentPage : 0;
    const url = `${baseUrl}/api/soar/flowList?page=${page + 1}&pageSize=${soarData.pageSize}`;
    const requestData = {
      flowName: '',
      aggField: '',
      status: '',
      isEnable: '',
      adapter: '',
      action: ''
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        this.setState({
          soarData: data
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempSoarData = {...this.state.soarData};
    tempSoarData[type] = Number(value);

    this.setState({
      soarData: tempSoarData
    }, () => {
      this.getSoarData(type);
    });
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempSoarData = {...this.state.soarData};
    tempSoarData.sort.field = field;
    tempSoarData.sort.desc = sort;

    this.setState({
      soarData: tempSoarData
    }, () => {
      this.getSoarData();
    });
  }
  render() {
    const {
      soarData
    } = this.state;
    const tableOptions = {
      onChangePage: (currentPage) => {
        this.handlePaginationChange('currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort(changedColumn, direction === 'desc');
      },
      setRowProps: (row, dataIndex, rowIndex) => {
        if (!row[0]) {
          return;
        }

        const allValue = row[0](rowIndex, 'getAllValue');
        const tableUniqueID = allValue.id;

        if (tableUniqueID === currentTableID) {
          return {
            className: 'grey'
          };
        }
      },
      pagination: true
    };

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>

          </div>
        </div>

        <span>ryan</span>

        {/*<MuiTableContent
          data={soarData}
          tableOptions={tableOptions} />*/}
      </div>
    )
  }
}

SoarController.contextType = BaseDataContext;

SoarController.propTypes = {
};

export default SoarController;