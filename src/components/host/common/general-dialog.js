import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'

import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
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
    } else if (page === 'endpoints') {
      const btnDisabled = !data.hasNewVersion;
      let btnText = t('txt-update');

      if (!btnDisabled) {
        btnText += ' (' + t('txt-version') + data.newVersion + ')';
      }

      return (
        <div className='overview'>
          <div className='overview-btn-group'>
            <Button variant='outlined' color='primary' className='btn' onClick={this.props.toggleViewMore}>{t('hmd-scan.txt-viewMore')}</Button>
            <Button variant='outlined' color='primary' className='btn' onClick={this.props.triggerTask.bind(this, ['getSystemInfo'])}>{t('txt-reTrigger')}</Button>
          </div>

          <div className='table-data'>
            <div className='column'>
              <div className='group'>
                <header>{t('host.endpoints.txt-networkInfo')}</header>
                <table className='c-table main-table'>
                  <tbody>
                    <tr>
                      <td><span className='blue-color'>{t('txt-ipAddress')}</span></td>
                      <td><span>{data.ip || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td><span className='blue-color'>{t('txt-macAddress')}</span></td>
                      <td><span>{data.mac || NOT_AVAILABLE}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className='group'>
                <header>{t('host.endpoints.txt-deviceInfo')}</header>
                <table className='c-table main-table'>
                  <tbody>
                    <tr>
                      <td><span className='blue-color'>{t('host.txt-system')}</span></td>
                      <td><span>{data.system || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td><span className='blue-color'>{t('txt-hostName')}</span></td>
                      <td><span>{data.hostName || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td><span className='blue-color'>{t('txt-cpu')}</span></td>
                      <td><span>{data.cpu || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td><span className='blue-color'>{t('txt-ram')}</span></td>
                      <td><span>{data.ram || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td><span className='blue-color'>{t('txt-disks')}</span></td>
                      <td><span>{data.disks || NOT_AVAILABLE}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className='group'>
                <header>{t('alert.txt-ownerInfo')}</header>
                <table className='c-table main-table'>
                  <tbody>
                    <tr>
                      <td><span className='blue-color'>{t('ownerFields.ownerName')}</span></td>
                      <td><span>{data.ownername || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td><span className='blue-color'>{t('ownerFields.ownerID')}</span></td>
                      <td><span>{data.ownerid || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td><span className='blue-color'>{t('ownerFields.departmentName')}</span></td>
                      <td><span>{data.department || NOT_AVAILABLE}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className='column'>
              <div className='group'>
                <header>{t('host.endpoints.txt-securityAssessments')}</header>
                <table className='c-table main-table'>
                  <tbody>
                    <tr>
                      <td><span className='blue-color'>{t('host.endpoints.txt-riskLevel')}</span></td>
                      <td><span>{data.riskLevel || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td><span className='blue-color'>{t('host.endpoints.txt-installedSoftware')}</span></td>
                      <td><span>{data.installedSize || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td><span className='blue-color'>{t('host.endpoints.txt-discoveredVulnerabilityCount')}</span></td>
                      <td><span>{data.vulnerabilityNum || NOT_AVAILABLE}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>


              <div className='group'>
                <header>{t('host.endpoints.txt-hmdInfo')}</header>
                <Button id='hostSafetyScanSearch' variant='outlined' color='primary' onClick={this.props.handleUpdateButton} disabled={btnDisabled}>{btnText}</Button>
                <table className='c-table main-table'>
                  <tbody>
                    <tr>
                      <td><span className='blue-color'>{t('txt-status')}</span></td>
                      <td><span>{data.status ? t('txt-' + data.status) : NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td><span className='blue-color'>{t('host.endpoints.txt-hbTime')}</span></td>
                      <td><span>{data.hbDttm ? helper.getFormattedDate(data.hbDttm, 'local') : NOT_AVAILABLE}</span></td>
                    </tr>
                    {data.hasNewVersion &&
                      <tr>
                        <td><span className='blue-color'>{t('txt-version')}</span></td>
                        <td><span>{data.version || NOT_AVAILABLE}</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div className='group'>
                <header>{t('host.endpoints.txt-netProxyInfo')}</header>
                <table className='c-table main-table'>
                  <tbody>
                    <tr>
                      <td><span className='blue-color'>{t('host.endpoints.txt-netProxyIP')}</span></td>
                      <td><span>{data.netproxyIp || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td><span className='blue-color'>{t('host.endpoints.txt-netProxyName')}</span></td>
                      <td><span>{data.netproxyName || NOT_AVAILABLE}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
  /**
   * Display exposed devices
   * @method
   * @returns HTML DOM
   */
  showExposedDevices = () => {
    const {page, search, data, tableOptions} = this.props;

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
          {page === 'vulnerabilities' &&
            <div className='group'>
              <TextField
                name='fix'
                style={{width: '115px'}}
                select
                label={t('host.vulnerabilities.txt-fix')}
                variant='outlined'
                fullWidth
                size='small'
                value={search.fix}
                onChange={this.props.handleSearchChange}
                data-cy='hostInfoDialogDeviceFixTextField'>
                <MenuItem value='all'>{t('txt-all')}</MenuItem>
                <MenuItem value='true'>{t('txt-fixed')}</MenuItem>
                <MenuItem value='false'>{t('txt-notFixed')}</MenuItem>
              </TextField>
            </div>
          }
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
   * Get individual severity box
   * @method
   * @param {object} val - severity data
   * @param {number} i - index of the severity data
   * @returns HTML DOM
   */
  getSeverityBox = (val, i) => {
    const {severityColors} = this.props;
    const backgroundColor = severityColors[val.severity];

    return (
      <div key={val} className='box' style={{backgroundColor}}>
        <header>{t('txt-' + val.severity)}</header>
        <div className='number'>{val.value}</div>
      </div>
    )
  }
  /**
   * Display general list
   * @method
   * @returns HTML DOM
   */
  showGeneralList = () => {
    const {page, searchType, search, data, tableOptions, severityStatistics} = this.props;
    let searchFieldText = '';
    let searchCountHeader = '';

    if (page === 'vulnerabilities') {
      if (searchType === 'relatedSoftware') {
        searchFieldText = t('host.inventory.txt-productName');
        searchCountHeader = t('host.vulnerabilities.txt-relatedSoftwareCount');
      }
    } else if (page === 'inventory') {
      if (searchType === 'discoveredVulnerability') {
        searchFieldText = t('host.vulnerabilities.txt-cveName');
        searchCountHeader = t('host.inventory.txt-discoveredVulnerabilityCount');
      }
    } else if (page === 'endpoints') {
      if (searchType === 'safetyScanInfo') {
        searchFieldText = t('host.endpoints.txt-taskName');
        searchCountHeader = t('txt-searchCount');
      } else if (searchType === 'softwareInventory') {
        searchFieldText = t('host.inventory.txt-cpe23uri');
        searchCountHeader = t('txt-searchCount');
      } else if (searchType === 'discoveredVulnerability') {
        searchFieldText = t('host.vulnerabilities.txt-cveName');
        searchCountHeader = t('host.inventory.txt-discoveredVulnerabilityCount');
      }
    }

    return (
      <React.Fragment>
        {page === 'endpoints' && searchType === 'discoveredVulnerability' &&
          <div className='statistics-content'>
            {severityStatistics && severityStatistics.length > 0 &&
              severityStatistics.map(this.getSeverityBox)
            }
          </div>
        }

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
              data-cy='hostInfoDialogSearchField' />
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
  severityStatistics: PropTypes.array,
  handleSearchChange: PropTypes.func,
  handleSearchSubmit: PropTypes.func,
  handleResetBtn: PropTypes.func,
  toggleViewMore: PropTypes.func,
  triggerTask: PropTypes.func,
  handleUpdateButton: PropTypes.func
};

export default GeneralDialog;