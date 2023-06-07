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
   * Display general info
   * @method
   * @returns HTML DOM
   */
  showGeneralInfo = () => {
    const {page, data} = this.props;

    if (page === 'vulnerabilities') {
      return (
        <ul className='vulnerability'>
          <li><span>{t('host.vulnerabilities.txt-vulnerabilityDesc')}</span>: {data.description || NOT_AVAILABLE}</li>
          <li><span>{t('host.vulnerabilities.txt-name')}</span>: {data.cveId || NOT_AVAILABLE}</li>
          <li><span>{t('host.vulnerabilities.txt-severity')}</span>: {t('txt-' + data.severity.toLowerCase())}</li> 
          <li><span>CVSS</span>: {data.cvss || NOT_AVAILABLE}</li>
          <li><span>{t('host.vulnerabilities.txt-cvssVersion')}</span>: {data.cvssVersion || NOT_AVAILABLE}</li>
          <li><span>{t('host.vulnerabilities.txt-publishedDate')}</span>: {helper.getFormattedDate(data.publishedDate, 'local')}</li>
          <li><span>{t('host.vulnerabilities.txt-updatedDate')}</span>: {helper.getFormattedDate(data.lastModifiedDate, 'local')}</li>
          <li><span>{t('host.vulnerabilities.txt-daysOpen')}</span>: {data.daysOpen}</li>
        </ul>
      )
    } else if (page === 'inventory') {
      return (
        <ul className='vulnerability'>
          <li className='header'><span>{t('host.inventory.txt-cpe23uri')}</span>: {data.cpe23uri || NOT_AVAILABLE}</li>
          <li className='header'><span>{t('host.inventory.txt-cpeNameComponents')}</span></li>
          <li><span>{t('host.inventory.txt-edition')}</span>: {data.edition || NOT_AVAILABLE}</li>
          <li><span>{t('host.inventory.txt-language')}</span>: {data.language || NOT_AVAILABLE}</li>
          <li><span>{t('host.inventory.txt-other')}</span>: {data.other || NOT_AVAILABLE}</li>
          <li><span>{t('host.inventory.txt-part')}</span>: {data.part || NOT_AVAILABLE}</li>
          <li><span>{t('host.inventory.txt-product')}</span>: {data.product || NOT_AVAILABLE}</li>
          <li><span>{t('host.inventory.txt-swEdition')}</span>: {data.swEdition || NOT_AVAILABLE}</li>
          <li><span>{t('host.inventory.txt-targetHw')}</span>: {data.targetHw || NOT_AVAILABLE}</li>
          <li><span>{t('host.inventory.txt-targetSw')}</span>: {data.targetSw || NOT_AVAILABLE}</li>
          <li><span>{t('host.inventory.txt-update')}</span>: {data.update || NOT_AVAILABLE}</li>
          <li><span>{t('host.inventory.txt-vendor')}</span>: {data.vendor || NOT_AVAILABLE}</li>
          <li><span>{t('host.inventory.txt-version')}</span>: {data.version || NOT_AVAILABLE}</li>
          <li className='header'><span>{t('host.inventory.txt-productCpename')}</span>: <span>{data.productCpename}</span></li>
        </ul>
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
              onChange={this.props.handleSearchChange} />
          </div>
          <div className='group'>
            <TextField
              name='ip'
              className='search-text'
              label={t('host.vulnerabilities.txt-ip')}
              variant='outlined'
              size='small'
              value={search.ip}
              onChange={this.props.handleSearchChange} />
          </div>
          <div className='group'>
            <TextField
              name='system'
              className='search-text'
              label={t('host.vulnerabilities.txt-system')}
              variant='outlined'
              size='small'
              value={search.system}
              onChange={this.props.handleSearchChange} />
          </div>
          <Button id='hostExposedSearch' variant='contained' color='primary' className='search-btn' onClick={this.props.handleSearchSubmit}>{t('txt-search')}</Button>
          <Button id='hostExposedClear' variant='outlined' color='primary' className='clear' onClick={this.props.handleResetBtn.bind(this, 'exposedDevices')}>{t('txt-clear')}</Button>
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
              onChange={this.props.handleSearchChange} />
          </div>
          <Button id='hostGeneralSearch' variant='contained' color='primary' className='search-btn' onClick={this.props.handleSearchSubmit}>{t('txt-search')}</Button>
          <Button id='hostGeneralClear' variant='outlined' color='primary' className='clear' onClick={this.props.handleResetBtn.bind(this, searchType)}>{t('txt-clear')}</Button>
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