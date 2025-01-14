import React, { Component, Fragment, useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import DataTable from 'react-ui/build/src/components/table'
import PieChart from 'react-chart/build/src/components/pie'
import {default as ah} from 'react-ui/build/src/utils/ajax-helper'
import {downloadWithForm} from 'react-ui/build/src/utils/download'

import {BaseDataContext} from '../../common/context'
import helper from '../../common/helper'
import MuiTableContent from '../../common/mui-table-content'

const NOT_AVAILABLE = 'N/A';

let t = null;
let f = null;

HighchartsMore(Highcharts) //init module

const RadarChart = (props) => {
  const {data} = props;
  const [polarChartSettings, setPolarChartSettings] = useState({})
  const [dashboardInfo, setDashboardInfo] = useState({
    dataFieldsArr: ['item', 'score'],
    dataFields: {},
    dataContent: [],
    sort: {
      field: 'score',
      desc: true
    }
  })
  const redarRef = useRef(null);

  useEffect(() => {
    loadRadarCharts();
  }, []);

  useEffect(() => {
    if (redarRef.current) {
      Highcharts.chart(redarRef.current, polarChartSettings);
    }
  }, [polarChartSettings]);

  /**
   * Set spider and table chart for Dashboard tab
   * @method
   */
  const loadRadarCharts = () => {
    let polarData = {
      categories: [],
      data: []
    };
    let tempDashboardInfo = _.clone(dashboardInfo);
    let totalScore = '';

    _.forEach(data, val => {
      polarData.categories.push(val.key);
      polarData.data.push(val.value);
      tempDashboardInfo.dataContent.push({ //For Dashboard table chart
        item: val.key,
        score: val.value
      });
      totalScore = val.total;
    })

    const polarChartSettings = {
      chart: {
        polar: true,
        type: 'line'
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: polarData.categories,
        tickmarkPlacement: 'on',
        lineWidth: 0
      },
      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
        max: totalScore
      },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'vertical'
      },
      series: [{
        name: t('txt-score') + '(' + t('txt-maxScore') + ':' + totalScore + ')',
        data: polarData.data,
        pointPlacement: 'on'
      }]
    };

    if (redarRef.current) {
      Highcharts.chart(redarRef.current, polarChartSettings);
    }

    let tempFields = {};
    tempDashboardInfo.dataFieldsArr.forEach(tempData => {
      tempFields[tempData] = {
        label: t(`txt-${tempData}`),
        sortable: true,
        formatter: (value, allValue, i) => {
          return <span>{value}</span>
        }
      }
    })

    tempDashboardInfo.dataFields = tempFields;
    setPolarChartSettings(polarChartSettings);
    setDashboardInfo(tempDashboardInfo);
  }
  /**
   * Handle table sort
   * @method
   * @param {object} sort - sort data object
   */
  const handleTableSort = (sort) => {
    let tempDashboardInfo = {...dashboardInfo};
    tempDashboardInfo.sort.field = sort.field;
    tempDashboardInfo.sort.desc = sort.desc;

    setDashboardInfo(tempDashboardInfo);
  }
  return (
    <Fragment>
      <div ref={redarRef}></div>
      <DataTable
        className='main-table score radar-data-table'
        fields={dashboardInfo.dataFields}
        data={dashboardInfo.dataContent}
        sort={dashboardInfo.dataContent.length === 0 ? {} : dashboardInfo.sort}
        onSort={handleTableSort} />
    </Fragment>
  )
}

/**
 * Host table general dialog
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the general dialog
 */
class GeneralDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      remoteControlAnchor: null
    }

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
  handleRemoteControlClick = (e) => {
    this.setState({remoteControlAnchor: e.currentTarget});
  }
  handleMenuClose = () => {
    this.setState({
      remoteControlAnchor: null
    });
  }
  confirmRemoteControl = (type) => {
    const {data} = this.props;
    
    this.handleMenuClose()

    PopupDialog.prompt({
      title: data.hostName,
      id: 'modalWindowSmall',
      confirmText: t('txt-confirm'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content delete'>
          <span>{t('hmd-scan.txt-confirmTo')}{t('hmd-scan.txt-' + type)}?</span>
        </div>
      ),
      act: (confirmed) => {
        if (confirmed) {
          this.handleRemoteControl(type);
        }
      }
    });
  }
  handleRemoteControl = (type) => {
    const {baseUrl} = this.context;
    const {data} = this.props;

    const url = `${baseUrl}/api/endPoint/retrigger`;
    const requestData = {
      hostId: data.hostId,
      cmds: [type]
    };

    ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(result => {
      if (result) {
        helper.showPopupMsg(t('txt-requestSent'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  confirmCompressFile = (data) => {
    PopupDialog.prompt({
      id: 'modalWindowSmall',
      title: t('host.endpoints.txt-compressFile'),
      confirmText: t('txt-confirm'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='form'>
          <FormLabel component="div" className="form-title">{t('host.endpoints.txt-chooseFile')}</FormLabel>
          <FormGroup>
            {_.map(data.dataContent, (file, i) => {
              return <FormControlLabel key={i} control={<Checkbox name={file.filePath} color='default' defaultChecked />} label={file.filePath}/>
            })}
          </FormGroup>
        </div>
      ),
      act: (confirmed, data) => {
        let filePathList = []
        _.forEach(data, (checked, filePath) => {
          if (checked)
            filePathList.push(filePath)
        });

        if (confirmed) {
          this.handleCompressFile(filePathList);
        }
      }
    });
  }
  handleCompressFile = (filePathList) => {
    const {baseUrl} = this.context;
    const {data} = this.props;

    const requestData = {
      hostId: data.hostId,
      cmds: ['getHmdFiles'],
      paras: {
        _FilepathVec: filePathList,
        _FileName: data.hostId
      }
    };

    ah.one({
      url: `${baseUrl}/api/hmd/retrigger`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-requestSent'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleDownloadFile = () => {
    const {baseUrl, contextRoot} = this.context;
    const {data} = this.props;

    const url = `${baseUrl}${contextRoot}/api/hmd/file/_download?hostId=${data.hostId}`;
    window.open(url, '_blank');
    return;
  }
  confirmCompressLogs = () => {
    PopupDialog.prompt({
      id: 'modalWindowSmall',
      confirmText: t('txt-confirm'),
      cancelText: t('txt-cancel'),
      display: (
        <div className='content'>
          <span>{t('txt-confirmProceed')}?</span>
        </div>
      ),
      act: (confirmed) => {
        if (confirmed) {
          this.handleCompressLogs();
        }
      }
    });
  }
  handleCompressLogs = () => {
    const {baseUrl} = this.context;
    const {data} = this.props;

    const requestData = {
      hostId: data.hostId,
      cmds: ['getHmdLogs']
    };

    ah.one({
      url: `${baseUrl}/api/hmd/retrigger`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        helper.showPopupMsg(t('txt-requestSent'));
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleDownloadLogs = () => {
    const {baseUrl, contextRoot} = this.context;
    const {data} = this.props;

    const url = `${baseUrl}${contextRoot}/api/hmd/file/_download?hostId=${data.hostId}`;
    window.open(url, '_blank');
    return;
  }
  handleExportSafetyScanInfo = () => {
    const {baseUrl, contextRoot} = this.context;
    const {data, search} = this.props;

    let url = `${baseUrl}${contextRoot}/api/endPoint/safetyScanInfo/record/_export`;
    let requestData = {
      hostId: data.hostId,
      ip: data.ip,
      taskName: search.keyword,
      exportFields: _.mapValues(_.keyBy(data.dataFields, 'name'), 'label')
    };

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  showGeneralInfo = () => {
    const {page, data, alertLevelColors} = this.props;
    const {remoteControlAnchor} = this.state

    if (page === 'gcb') {
      return (
        <div className='overview'>
          <div className='table-data'>
            <div className='column'>
              <div className='group'>
                <header>{t('host.gcb.txt-exposedDevices')}</header>
                <div className="content">
                {data.gcbDevicesCount && data.gcbDevicesCount.length > 0 &&
                <PieChart
                  id='gcb-overview-pie-chart'
                  holeSize={70}
                  centerText={<div className='center-text'>{_.find(data.gcbDevicesCount, ['key', 'exposedDeviceCount']).value + '/' + (_.find(data.gcbDevicesCount, ['key', 'exposedDeviceCount']).value + _.find(data.gcbDevicesCount, ['key', 'notExposedDeviceCount']).value)} {t('host.gcb.txt-endpoint')}</div>}
                  data={data.gcbDevicesCount}
                  colors={{
                    key: {
                      notExposedDeviceCount: '#CCCCCC',
                      exposedDeviceCount: '#373BC4'
                    }
                  }}
                  legend={{
                    enabled: false
                  }}
                  onTooltip = {(eventInfo, data) => {
                    return (
                      <section>
                        <span>{t('host.gcb.txt-' + data[0].key)}: {data[0].value}</span>
                      </section>
                  )}}
                  dataCfg={{
                    splitSlice: ['key'],
                    sliceSize: 'value'
                  }} />
                }
                </div>
              </div>
            </div>
            <div className='column'>
              <div className='group'>
                <header>{t('host.gcb.txt-gcbInfo')}</header>
                <table className='c-table main-table'>
                  <tbody>
                    {_.map(data.dataFieldsArr, (field) => {
                      return <tr key={field}>
                        <td className='header'><span>{t('host.gcb.txt-' + field)}</span></td>
                        {typeof(data.dataContent[field]) === 'boolean' &&
                          <td><span>{t('txt-' + data.dataContent[field])}</span></td>
                        }
                        {typeof(data.dataContent[field]) !== 'boolean' &&
                          <td><span>{data.dataContent[field] || NOT_AVAILABLE}</span></td>
                        }
                      </tr>
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
      </div>)
    } else if (page === 'malware') {
      return (
        <div className='overview'>
          <div className='overview-btn-group'>
            <div className='overview-btn-group-left'></div>
            <div className='overview-btn-group-right'>
              <Button variant='outlined' color='primary' className='btn' onClick={this.props.handleAddWhitelist.bind(this)}>{t('txt-addWhiteList')}</Button>
            </div>
          </div>
          <div className='table-data'>
            <div className='column'>
              <div className='group'>
                <header>{t('host.malware.txt-exposedDevices')}</header>
                <div className="content">
                {data.malwareDevicesCount && data.malwareDevicesCount.length > 0 &&
                <PieChart
                  id='malware-overview-pie-chart'
                  holeSize={70}
                  centerText={<div className='center-text'>{_.find(data.malwareDevicesCount, ['key', 'exposedDeviceCount']).value + '/' + (_.find(data.malwareDevicesCount, ['key', 'exposedDeviceCount']).value + _.find(data.malwareDevicesCount, ['key', 'notExposedDeviceCount']).value)} {t('host.malware.txt-endpoint')}</div>}
                  data={data.malwareDevicesCount}
                  colors={{
                    key: {
                      notExposedDeviceCount: '#CCCCCC',
                      exposedDeviceCount: '#373BC4'
                    }
                  }}
                  legend={{
                    enabled: false
                  }}
                  onTooltip = {(eventInfo, data) => {
                    return (
                      <section>
                        <span>{t('host.malware.txt-' + data[0].key)}: {data[0].value}</span>
                      </section>
                  )}}
                  dataCfg={{
                    splitSlice: ['key'],
                    sliceSize: 'value'
                  }} />
                }
                </div>
              </div>
            </div>
            <div className='column'>
              <div className='group'>
                <header>{t('host.malware.txt-malwareInfo')}</header>
                <table className='c-table main-table'>
                  <tbody>
                    {_.map(data.dataFieldsArr, (field) => {
                      return <tr key={field}>
                        <td className='header'><span>{t('host.malware.txt-' + field)}</span></td>
                        {typeof(data.dataContent[field]) === 'boolean' &&
                          <td><span>{t('txt-' + data.dataContent[field])}</span></td>
                        }
                        {typeof(data.dataContent[field]) !== 'boolean' &&
                          <td><span>{data.dataContent[field] || NOT_AVAILABLE}</span></td>
                        }
                      </tr>
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
      </div>)
    } else if (page === 'vulnerabilities') {
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
      const severityLevel = data.riskLevel ? t('txt-' + data.riskLevel.toLowerCase()) : NOT_AVAILABLE;
      const btnDisabled = !data.hasNewVersion;
      let btnText = t('txt-update');

      if (!btnDisabled) {
        btnText += ' (' + t('txt-version') + data.newVersion + ')';
      }

      return (
        <div className='overview'>
          <div className='overview-btn-group'>
            <div className='overview-btn-group-left'>
              <Button variant='outlined' color='primary' className='btn' onClick={this.props.toggleViewMore}>{t('hmd-scan.txt-viewMore')}</Button>
              <Button variant='outlined' color='primary' className='btn' onClick={this.props.triggerTask.bind(this, ['getSystemInfo'])}>{t('txt-reTrigger')}</Button>
            </div>
            <div className='overview-btn-group-right'>
              <Button variant='outlined' color='primary' className='btn' onClick={this.handleRemoteControlClick.bind(this)}>{t('host.endpoints.txt-remoteControl')}</Button>
              <Menu
                anchorEl={remoteControlAnchor}
                keepMounted
                open={Boolean(remoteControlAnchor)}
                onClose={this.handleMenuClose}>
                <MenuItem onClick={this.confirmRemoteControl.bind(this, 'shutdownHost')}>{t('host.endpoints.txt-shutdownHost')}</MenuItem>
                <MenuItem onClick={this.confirmRemoteControl.bind(this, 'logoffAllUsers')}>{t('host.endpoints.txt-logoffAllUsers')}</MenuItem>
                <MenuItem onClick={this.confirmRemoteControl.bind(this, 'netcut')}>{t('host.endpoints.txt-netcut')}</MenuItem>
                <MenuItem onClick={this.confirmRemoteControl.bind(this, 'netcutResume')}>{t('host.endpoints.txt-netcutResume')}</MenuItem>
                <MenuItem onClick={this.confirmRemoteControl.bind(this, 'terminateHmd')}>{t('host.endpoints.txt-terminateHmd')}</MenuItem>
              </Menu>
              <Button variant='outlined' color='primary' className='btn' onClick={this.confirmCompressLogs.bind(this)}>{data.isUploaded ? t(`host.endpoints.txt-recompressLogs`) : t('host.endpoints.txt-compressLogs')}</Button>
              {data.isUploaded &&
              <Button variant='outlined' color='primary' className='btn' onClick={this.handleDownloadLogs.bind(this)}>{t('host.endpoints.txt-downloadLogs')}</Button>
              }
            </div>
          </div>
          <div className='update-dttm'>{t('host.endpoints.txt-updateDttm') + ': ' + (data.hbDttm ? helper.getFormattedDate(data.updateDttm, 'local') : NOT_AVAILABLE)}</div>
          <div className='table-data'>
            <div className='column'>
              <div className='group'>
                <header>{t('host.endpoints.txt-riskLevel')}</header>
                <div className="content">
                  <span className='severity-level' style={{color: severityLevel === NOT_AVAILABLE ? 'inherit' : alertLevelColors[severityLevel]}}>{severityLevel}</span> 
                </div>
              </div>
              <div className='group'>
                <header>{t('host.endpoints.txt-riskRadar')}</header>
                <div className="content">
                  <RadarChart
                    data={data.radarResult}
                    />
                </div>
              </div>
            </div>
            <div className='column'>
              <div className='group'>
                <header>{t('host.endpoints.txt-networkInfo')}</header>
                <table className='c-table main-table'>
                  <tbody>
                    <tr>
                      <td className='header'><span>{t('txt-ipAddress')}</span></td>
                      <td><span>{data.ip || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td className='header'><span>{t('txt-macAddress')}</span></td>
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
                      <td className='header'><span>{t('host.txt-system')}</span></td>
                      <td><span>{data.system || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td className='header'><span>{t('txt-hostName')}</span></td>
                      <td><span>{data.hostName || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td className='header'><span>{t('txt-cpu')}</span></td>
                      <td><span>{data.cpu || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td className='header'><span>{t('txt-ram')}</span></td>
                      <td><span>{data.ram || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td className='header'><span>{t('txt-disks')}</span></td>
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
                      <td className='header'><span>{t('ownerFields.ownerName')}</span></td>
                      <td><span>{data.ownername || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td className='header'><span>{t('ownerFields.ownerID')}</span></td>
                      <td><span>{data.ownerid || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td className='header'><span>{t('ownerFields.departmentName')}</span></td>
                      <td><span>{data.department || NOT_AVAILABLE}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className='group'>
                <header>{t('host.endpoints.txt-securityAssessments')}</header>
                <table className='c-table main-table'>
                  <tbody>
                    <tr>
                      <td className='header'><span>{t('host.endpoints.txt-riskLevel')}</span></td>
                      <td><span>{data.riskLevel ? t('txt-' + data.riskLevel.toLowerCase()) : NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td className='header'><span>{t('host.endpoints.txt-installedSoftware')}</span></td>
                      <td><span>{data.installedSize || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td className='header'><span>{t('host.endpoints.txt-discoveredVulnerabilityCount')}</span></td>
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
                      <td className='header'><span>{t('txt-status')}</span></td>
                      <td><span>{data.status ? t('txt-' + data.status) : NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td className='header'><span>{t('host.endpoints.txt-hbTime')}</span></td>
                      <td><span>{data.hbDttm ? helper.getFormattedDate(data.hbDttm, 'local') : NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td className='header'><span>{t('txt-version')}</span></td>
                      <td><span>{data.version || NOT_AVAILABLE}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className='group'>
                <header>{t('host.endpoints.txt-netProxyInfo')}</header>
                <table className='c-table main-table'>
                  <tbody>
                    <tr>
                      <td className='header'><span>{t('host.endpoints.txt-netProxyIP')}</span></td>
                      <td><span>{data.netproxyIp || NOT_AVAILABLE}</span></td>
                    </tr>
                    <tr>
                      <td className='header'><span>{t('host.endpoints.txt-netProxyName')}</span></td>
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
          <div className='search-field-left'>
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
            {page === 'gcb' &&
              <div className='group'>
                <TextField
                  name='compareResult'
                  style={{width: '115px'}}
                  select
                  label={t('host.gcb.txt-compareResult')}
                  variant='outlined'
                  fullWidth
                  size='small'
                  value={search.compareResult}
                  onChange={this.props.handleSearchChange}
                  data-cy='hostInfoDialogCompareResultTextField'>
                  <MenuItem value='all'>{t('txt-all')}</MenuItem>
                  <MenuItem value='true'>{t('txt-success')}</MenuItem>
                  <MenuItem value='false'>{t('txt-fail')}</MenuItem>
                </TextField>
              </div>
            }
            <Button id='hostExposedSearch' variant='contained' color='primary' className='search-btn' onClick={this.props.handleSearchSubmit} data-cy='hostInfoDialogDeviceSubmitBtn'>{t('txt-search')}</Button>
            <Button id='hostExposedClear' variant='outlined' color='primary' className='clear' onClick={this.props.handleResetBtn.bind(this, 'exposedDevices')} data-cy='hostInfoDialogDeviceClearBtn'>{t('txt-clear')}</Button>
          </div>
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
      } else if (searchType === 'gcb') {
        searchFieldText = t('host.gcb.txt-originalKey');
        searchCountHeader = t('txt-searchCount');
      } else if (searchType === 'discoveredVulnerability') {
        searchFieldText = t('host.vulnerabilities.txt-cveName');
        searchCountHeader = t('host.inventory.txt-discoveredVulnerabilityCount');
      } else if (searchType === 'kbid') {
        searchFieldText = t('host.txt-kbidName');
        searchCountHeader = t('txt-searchCount');
      } else if (searchType === 'malware') {
        searchFieldText = t('host.endpoints.txt-md5');
        searchCountHeader = t('txt-searchCount');
      } else if (searchType === 'fileIntegrity') {
        searchFieldText = t('host.fileIntegrity.txt-filePath');
        searchCountHeader = t('txt-searchCount');
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

        {!(page === 'endpoints' && searchType === 'fileIntegrity') &&
        <div className='search-field'>
          <div className='search-field-left'>
            <div className='group'>
              <TextField
                name='keyword'
                className='search-text'
                label={searchFieldText}
                variant='outlined'
                size='small'
                value={search.keyword}
                onChange={this.props.handleSearchChange}
                data-cy='hostInfoDialogSearchField' />
            </div>
            {searchType === 'discoveredVulnerability' &&
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
            {searchType === 'gcb' &&
            <React.Fragment>
            <div className='group'>
              <TextField
                name='policyName'
                className='search-text'
                label={t('host.gcb.txt-policyName')}
                variant='outlined'
                size='small'
                value={search.policyName}
                onChange={this.props.handleSearchChange}
                data-cy='hostInfoDialogSearchField' />
            </div>
            <div className='group'>
              <TextField
                name='type'
                className='search-text'
                label={t('host.gcb.txt-type')}
                variant='outlined'
                size='small'
                value={search.type}
                onChange={this.props.handleSearchChange}
                data-cy='hostInfoDialogSearchField' />
            </div>
            <div className='group'>
              <TextField
                name='compareResult'
                style={{width: '115px'}}
                select
                label={t('host.gcb.txt-compareResult')}
                variant='outlined'
                fullWidth
                size='small'
                value={search.compareResult}
                onChange={this.props.handleSearchChange}
                data-cy='hostInfoDialogCompareResultTextField'>
                <MenuItem value='all'>{t('txt-all')}</MenuItem>
                <MenuItem value='true'>{t('txt-success')}</MenuItem>
                <MenuItem value='false'>{t('txt-fail')}</MenuItem>
              </TextField>
            </div>
            </React.Fragment>
            }
            <Button id='hostGeneralSearch' variant='contained' color='primary' className='search-btn' onClick={this.props.handleSearchSubmit} data-cy='hostInfoDialogSoftwareSubmitBtn'>{t('txt-search')}</Button>
            <Button id='hostGeneralClear' variant='outlined' color='primary' className='clear' onClick={this.props.handleResetBtn.bind(this, searchType)} data-cy='hostInfoDialogSoftwareClearBtn'>{t('txt-clear')}</Button>
          </div>
          <div className='search-field-right'>
            {searchType === 'safetyScanInfo' &&
            <Button id='hostGeneralClear' variant='outlined' color='primary' className='clear' onClick={this.handleExportSafetyScanInfo.bind(this)} data-cy='hostInfoDialogSoftwareClearBtn'>{t('txt-export')}</Button>
            }
            {searchType === 'malware' && data.totalCount > 0 &&
            <Button variant='outlined' color='primary' className='btn' onClick={this.confirmCompressFile.bind(this, data)}>{data.isUploaded ? t(`host.endpoints.txt-recompressFile`) : t('host.endpoints.txt-compressFile')}</Button>
            }
            {searchType === 'malware' && data.totalCount > 0 && data.isUploaded &&
            <Button variant='outlined' color='primary' className='btn' onClick={this.handleDownloadFile.bind(this)}>{t('host.endpoints.txt-downloadFile')}</Button>
            }
          </div>
        </div>
        }
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
  handleUpdateButton: PropTypes.func,
  handleAddWhitelist: PropTypes.func,
};

export default GeneralDialog;