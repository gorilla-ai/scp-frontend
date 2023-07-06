import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'
import MuiTableContent from '../../common/mui-table-content'

const NOT_AVAILABLE = 'N/A';

let t = null;
let f = null;

/**
 * Host table general dialog
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the general dialog
 */
class GeneralDialog extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
  }
  componentDidMount() {
  }
  /**
   * Set reference list
   * @method
   * @param {object} val - reference list data
   * @param {number} i - index of the reference list
   * @returns HTML DOM
   */
  showReferenceList = (val, i) => {
    return <div key={i}><a href={val} className='c-link blue-color' target='_blank'>{val}</a></div>
  }
  /**
   * Set KBID list
   * @method
   * @param {object} val - KBID list data
   * @param {number} i - index of the KBID list
   * @returns HTML DOM
   */
  showKbidList = (val, i) => {
    return <div key={i}>{val}</div>
  }
  /**
   * Display general info
   * @method
   * @returns HTML DOM
   */
  showGeneralInfo = () => {
    const {page, data} = this.props;

    if (page === 'vulnerabilities') {
      return (
        <table className='c-table main-table'>
          <tbody>
            <tr>
              <td><span className='blue-color'>{t('host.vulnerabilities.txt-vulnerabilityDesc')}</span></td>
              <td><span>{data.description || NOT_AVAILABLE}</span></td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.vulnerabilities.txt-name')}</span></td>
              <td>{data.cveId || NOT_AVAILABLE}</td>
            </tr>

            <tr>
              <td><span className='blue-color'>{t('host.vulnerabilities.txt-severity')}</span></td>
              <td>{t('txt-' + data.severity.toLowerCase())}</td>
            </tr>
            <tr>
              <td><span className='blue-color'>CVSS</span></td>
              <td>{data.cvss || NOT_AVAILABLE}</td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.vulnerabilities.txt-cvssVersion')}</span></td>
              <td>{data.cvssVersion || NOT_AVAILABLE}</td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.vulnerabilities.txt-publishedDate')}</span></td>
              <td>{helper.getFormattedDate(data.publishedDate, 'local')}</td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.vulnerabilities.txt-updatedDate')}</span></td>
              <td>{helper.getFormattedDate(data.lastModifiedDate, 'local')}</td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.vulnerabilities.txt-daysOpen')}</span></td>
              <td>{data.daysOpen}</td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.vulnerabilities.txt-reference')}</span></td>
              <td>
                {data.referenceData && data.referenceData.length > 0 &&
                  data.referenceData.map(this.showReferenceList)
                }
                {data.referenceData && data.referenceData.length === 0 &&
                  <span>{NOT_AVAILABLE}</span>
                }
              </td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.vulnerabilities.txt-kibd')}</span></td>
              <td>
                {data.kbids && data.kbids.length > 0 &&
                  data.kbids.map(this.showKbidList)
                }
                {data.kbids && data.kbids.length === 0 &&
                  <span>{NOT_AVAILABLE}</span>
                }
              </td>
            </tr>
          </tbody>
        </table>
      )
    } else if (page === 'inventory') {
      return (
        <table className='c-table main-table'>
          <tbody>
            <tr>
              <td><span className='blue-color'>{t('host.inventory.txt-cpe23uri')}</span></td>
              <td><span>{data.cpe23uri || NOT_AVAILABLE}</span></td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.inventory.txt-edition')}</span></td>
              <td><span>{data.edition || NOT_AVAILABLE}</span></td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.inventory.txt-language')}</span></td>
              <td><span>{data.language || NOT_AVAILABLE}</span></td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.inventory.txt-other')}</span></td>
              <td><span>{data.other || NOT_AVAILABLE}</span></td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.inventory.txt-part')}</span></td>
              <td><span>{data.part || NOT_AVAILABLE}</span></td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.inventory.txt-product')}</span></td>
              <td><span>{data.product || NOT_AVAILABLE}</span></td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.inventory.txt-swEdition')}</span></td>
              <td><span>{data.swEdition || NOT_AVAILABLE}</span></td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.inventory.txt-targetHw')}</span></td>
              <td><span>{data.targetHw || NOT_AVAILABLE}</span></td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.inventory.txt-targetSw')}</span></td>
              <td><span></span>{data.targetSw || NOT_AVAILABLE}</td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.inventory.txt-update')}</span></td>
              <td><span></span>{data.update || NOT_AVAILABLE}</td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.inventory.txt-vendor')}</span></td>
              <td><span>{data.vendor || NOT_AVAILABLE}</span></td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.inventory.txt-version')}</span></td>
              <td><span>{data.version || NOT_AVAILABLE}</span></td>
            </tr>
            <tr>
              <td><span className='blue-color'>{t('host.inventory.txt-productCpename')}</span></td>
              <td><span>{data.productCpename}</span></td>
            </tr>
          </tbody>
        </table>
      )
    }
  }
  /**
   * Display exposed devices
   * @method
   * @returns HTML DOM
   */
  showExposedDevices = () => {
    const {search, data, tableOptions} = this.props;

    return (
      <React.Fragment>
        <div className='search-field'>
          <div className='group'>
            <TextField
              name='hostName'
              className='search-text'
              label={t('host.vulnerabilities.txt-hostName')}
              variant='outlined'
              size='small'
              value={search.hostName}
              onChange={this.props.handleSearchChange}
              data-cy='hostInfoDialogDeviceHostTextField' />
          </div>
          <div className='group'>
            <TextField
              name='ip'
              className='search-text'
              label={t('host.vulnerabilities.txt-ip')}
              variant='outlined'
              size='small'
              value={search.ip}
              onChange={this.props.handleSearchChange}
              data-cy='hostInfoDialogDeviceIpTextField' />
          </div>
          <div className='group'>
            <TextField
              name='system'
              className='search-text'
              label={t('host.vulnerabilities.txt-system')}
              variant='outlined'
              size='small'
              value={search.system}
              onChange={this.props.handleSearchChange}
              data-cy='hostInfoDialogDeviceSystemTextField' />
          </div>
          <Button id='hostExposedSearch' variant='contained' color='primary' className='search-btn' onClick={this.props.handleSearchSubmit} data-cy='hostInfoDialogDeviceSubmitBtn'>{t('txt-search')}</Button>
          <Button id='hostExposedClear' variant='outlined' color='primary' className='clear' onClick={this.props.handleResetBtn.bind(this, 'exposedDevices')} data-cy='hostInfoDialogDeviceClearBtn'>{t('txt-clear')}</Button>
        </div>
        <div className='search-count'>{t('host.vulnerabilities.txt-exposedDevicesCount') + ': ' + helper.numberWithCommas(search.count)}</div>

        <MuiTableContent
          tableHeight='auto'
          data={data}
          tableOptions={tableOptions} />
      </React.Fragment>
    )
  }
  /**
   * Display general list
   * @method
   * @returns HTML DOM
   */
  showGeneralList = () => {
    const {page, searchType, search, data, tableOptions} = this.props;
    let searchFieldText = '';
    let searchCountHeader = '';

    if (page === 'vulnerabilities') {
      searchFieldText = t('host.inventory.txt-productName');
      searchCountHeader = t('host.vulnerabilities.txt-relatedSoftwareCount');
    } else if (page === 'inventory') {
      searchFieldText = t('host.vulnerabilities.txt-cveName');
      searchCountHeader = t('host.inventory.txt-discoveredVulnerabilityCount');
    } else if (page === 'kbid') {
      searchFieldText = t('host.vulnerabilities.txt-cveName');
      searchCountHeader = t('host.inventory.txt-discoveredVulnerabilityCount');
    }

    return (
      <React.Fragment>
        <div className='search-field'>
          <div className='group'>
            <TextField
              name='search'
              className='search-text'
              label={searchFieldText}
              variant='outlined'
              size='small'
              value={search.keyword}
              onChange={this.props.handleSearchChange}
              data-cy='hostInfoDialogSoftwareCveTextField' />
          </div>
          <Button id='hostGeneralSearch' variant='contained' color='primary' className='search-btn' onClick={this.props.handleSearchSubmit} data-cy='hostInfoDialogSoftwareSubmitBtn'>{t('txt-search')}</Button>
          <Button id='hostGeneralClear' variant='outlined' color='primary' className='clear' onClick={this.props.handleResetBtn.bind(this, searchType)} data-cy='hostInfoDialogSoftwareClearBtn'>{t('txt-clear')}</Button>
        </div>
        <div className='search-count'>{searchCountHeader + ': ' + helper.numberWithCommas(search.count)}</div>

        <MuiTableContent
          tableHeight='auto'
          data={data}
          tableOptions={tableOptions} />
      </React.Fragment>
    )
  }
  render() {
    const {type} = this.props;

    return (
      <div>
        {type === 'general-info' &&
          this.showGeneralInfo()
        }

        {type === 'exposed-devices' &&
          this.showExposedDevices()
        }

        {type === 'general-list' &&
          this.showGeneralList()
        }
      </div>
    )
  }
}

GeneralDialog.contextType = BaseDataContext;

GeneralDialog.propTypes = {
  page: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  search: PropTypes.object,
  searchType: PropTypes.string,
  tableOptions: PropTypes.object,
  handleSearchChange: PropTypes.func,
  handleSearchSubmit: PropTypes.func,
  handleResetBtn: PropTypes.func
};

export default GeneralDialog;