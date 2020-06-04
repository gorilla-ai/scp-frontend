import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import BarChart from 'react-chart/build/src/components/bar'
import LineChart from 'react-chart/build/src/components/line'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PieChart from 'react-chart/build/src/components/pie'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import AddThreats from './add-threats'
import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import FileUpload from '../../common/file-upload'
import helper from '../../common/helper'
import SearchOptions from '../../common/search-options'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

const DEFINED_IOC_EMERGENCY = 'DEFINED_IOC_EMERGENCY';
const DEFINED_IOC_CRITICAL = 'DEFINED_IOC_CRITICAL';
const DEFINED_IOC_ALERT = 'DEFINED_IOC_ALERT';
const DEFINED_IOC_WARNING = 'DEFINED_IOC_WARNING';
const DEFINED_IOC_NOTICE = 'DEFINED_IOC_NOTICE';

/**
 * Threat Intelligence
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Config Edge Threat Intelligence page
 */
class ThreatIntelligence extends Component {
  constructor(props) {
    super(props);

    this.state = {
      datetime: {
        from: helper.getSubstractDate(1, 'week'),
        to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
        //from: '2020-06-04T00:00:00Z',
        //to: '2020-06-04T01:00:00Z'
      },
      indicatorsData: null,
      indicatorsTrendData: null,
      acuIndicatorsTrendData: null,
      uplaodOpen: false,
      file: {},
      addThreatsOpen: false,
      threats: []
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.getChartsData();
  }
  /**
   * Get and set charts data
   * @method
   */
  getChartsData = () => {
    const {baseUrl} = this.context;
    const {datetime} = this.state;
    let dateTimeFrom = datetime.from;
    let dateTimeTo = datetime.to;

    if (datetime.from.indexOf('T') > 0) {
      dateTimeFrom = datetime.from.substr(0, 11) + '00:00:00';
    } else {
      dateTimeFrom = datetime.from + 'T00:00:00';
    }

    if (datetime.to.indexOf('T') > 0) {
      dateTimeTo = datetime.to.substr(0, 11) + '23:59:59';
    } else {
      dateTimeTo = datetime.to + 'T23:59:59';
    }

    const dateTime = {
      from: Moment(dateTimeFrom).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
      to: Moment(dateTimeTo).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
    };

    if (Moment(dateTime.from).isAfter()) {
      helper.showPopupMsg(t('edge-management.txt-threatDateErr'), t('txt-error'));
      return;
    }

    // this.ah.one({
    //   url: `${baseUrl}/api/indicators/summary`,
    //   type: 'GET'
    // })
    // .then(data => {
    //   if (data) {
    //     let indicatorsData = [];

    //     _.keys(data)
    //     .forEach(key => {
    //       if (data[key] > 0) {
    //         indicatorsData.push({
    //           key,
    //           doc_count: data[key]
    //         });
    //       }
    //     });

    //     this.setState({
    //       indicatorsData
    //     });        
    //   }
    //   return null;
    // })
    // .catch(err => {
    //   helper.showPopupMsg('', t('txt-error'), err.message);
    // })

    this.ah.one({
      url: `${baseUrl}/api/indicators/trend?startDttm=${dateTime.from}&endDttm=${dateTime.to}`,
      type: 'GET'
    }, {showProgress: false})
    .then(data => {
      if (data) {
        let indicatorsTrendData = [];

        _.keys(data)
        .forEach(key => {
          _.keys(data[key])
          .forEach(key2 => {
            if (data[key][key2] > 0) {
              indicatorsTrendData.push({
                day: parseInt(Moment(helper.getFormattedDate(key2, 'local')).format('x')),
                count: data[key][key2],
                indicator: key
              })
            }
          })
        });

        this.setState({
          indicatorsTrendData
        });        
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })

    // this.ah.one({
    //   url: `${baseUrl}/api/indicators/trend/accum?startDttm=${dateTime.from}&endDttm=${dateTime.to}`,
    //   type: 'GET'
    // }, {showProgress: false})
    // .then(data => {
    //   if (data) {
    //     let acuIndicatorsTrendData = [];

    //     _.keys(data)
    //     .forEach(key => {
    //       _.forEach(data[key], val => {
    //         if (val.counts > 0) {
    //           acuIndicatorsTrendData.push({
    //             day: parseInt(Moment(helper.getFormattedDate(val.time, 'local')).format('x')),
    //             count: val.counts,
    //             indicator: key
    //           })
    //         }
    //       })
    //     });

    //     this.setState({
    //       acuIndicatorsTrendData
    //     });        
    //   }
    //   return null;
    // })
    // .catch(err => {
    //   helper.showPopupMsg('', t('txt-error'), err.message);
    // })
  }
  /**
   * Show tooltip info when mouseover the chart
   * @method
   * @param {object} eventInfo - MouseoverEvents
   * @param {array.<object>} data - chart data
   * @returns HTML DOM
   */
  onTooltip = (eventInfo, data) => {
    return (
      <section>
        <span>{t('txt-indicator')}: {data[0].indicator}<br /></span>
        <span>{t('txt-date')}: {Moment(data[0].day, 'x').utc().format('YYYY/MM/DD')}<br /></span>
        <span>{t('txt-count')}: {data[0].count}</span>
      </section>
    )
  }
  /**
   * Set new datetime
   * @method
   * @param {object} datetime - new datetime object
   */
  handleDateChange = (datetime) => {
    this.setState({
      datetime
    });
  }
  /**
   * Toggle upload modal dialog on/off
   * @method
   * @param {string} options - option for 'showMsg'
   */
  toggleUploadThreat = (options) => {
    this.setState({
      uplaodOpen: !this.state.uplaodOpen
    }, () => {
      if (options === 'showMsg') {
        PopupDialog.alert({
          id: 'modalWindowSmall',
          confirmText: t('txt-close'),
          display: <div className='content'><span>{t('txt-uploadSuccess')}</span></div>
        });
        this.getChartsData();
      }
    });
  }
  /**
   * Handle file change
   * @method
   * @param {object} file - file info object
   */
  handleFileChange = (file) => {
    if (file) {
      this.setState({
        file
      });
    }
  }
  /**
   * Display threat upload modal dialog and its content
   * @method
   * @returns ModalDialog component
   */
  uploadDialog = () => {
    const titleText = t('edge-management.txt-uploadThreat');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleUploadThreat},
      confirm: {text: t('txt-confirm'), handler: this.confirmThreatUpload}
    };

    return (
      <ModalDialog
        id='uploadThreatDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        <FileUpload
          supportText={titleText}
          id='uploadThreat'
          fileType='indicators'
          btnText={t('txt-upload')}
          handleFileChange={this.handleFileChange} />
      </ModalDialog>
    )
  }
  /**
   * Handle threat upload confirm
   * @method
   */
  confirmThreatUpload = () => {
    const {baseUrl} = this.context;
    const {file} = this.state;

    if (!file.name) {
      helper.showPopupMsg(t('txt-selectFile'), t('txt-error'));
      return;
    }

    let formData = new FormData();
    formData.append('file', file);

    ah.one({
      url: `${baseUrl}/api/threat/upload`,
      data: formData,
      type: 'POST',
      processData: false,
      contentType: false
    })
    .then(data => {
      if (data.ret === 0) {
        this.toggleUploadThreat('showMsg');
      } else {
        helper.showPopupMsg('', t('txt-error'), t('txt-uploadFailed'));
      }

      this.setState({
        file: {}
      });
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Reset indicators data
   * @method
   */
  clearData = () => {
    this.setState({
      indicatorsData: null,
      indicatorsTrendData: null,
      acuIndicatorsTrendData: null      
    }, () => {
      this.getChartsData();
    });
  }
  /**
   * Toggle add indicator modal on/off
   * @method
   */  
  toggleAddThreats = () => {
    this.setState({
      addThreatsOpen: !this.state.addThreatsOpen
    });
  }
  /**
   * Handle add/remove for the relationship box
   * @method
   * @param {array} val - relationship list array
   */
  handleAddThreatsChange = (data) => {
    _.forEach(data, val => {

    })

    this.setState({
      threats: data
    });
  }
  displayAddThreatsContent = () => {
    const {threats} = this.state;

    return (
      <div>
        <button className='standard btn upload-btn' onClick={this.toggleUploadThreat}><i className='fg fg-data-upload'/>{t('edge-management.txt-uploadThreat')}</button>

        <MultiInput
          id='threatMultiInputs'
          base={AddThreats}
          defaultItemValue={{
            value: '',
            validate: true,
            type: DEFINED_IOC_ALERT
          }}
          value={threats}
          onChange={this.handleAddThreatsChange}/>
      </div>
    )
  }
  addThreatsDialog = () => {
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.toggleAddThreats},
      confirm: {text: t('txt-confirm'), handler: this.confirmAddThreats}
    };

    return (
      <ModalDialog
        id='addThreatsDialog'
        className='modal-dialog'
        title={t('edge-management.txt-addThreat')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayAddThreatsContent()}
      </ModalDialog>
    )
  }
  confirmAddThreats = () => {

  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {
      datetime,
      indicatorsData,
      indicatorsTrendData,
      acuIndicatorsTrendData,
      uplaodOpen,
      addThreatsOpen
    } = this.state;

    return (
      <div>
        {addThreatsOpen &&
          this.addThreatsDialog()
        }

        {uplaodOpen &&
          this.uploadDialog()
        }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button onClick={this.toggleAddThreats} title={t('events.connections.txt-toggleFilter')}><i className='fg fg-add'/><span>{t('edge-management.txt-addThreat')}</span></button>
            <button title={t('events.connections.txt-toggleChart')}><i className='fg fg-search'/><span>{t('txt-query')}</span></button>
          </div>

          <SearchOptions
            datetime={datetime}
            enableTime={false}
            handleDateChange={this.handleDateChange}
            handleSearchSubmit={this.clearData} />
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            <div className='main-content'>
              <header className='main-header'>{t('txt-threatIntelligence')}</header>

              <div className='main-statistics'>
                <div className='statistics-content'>
                  {/*}
                  <div className='chart-group'>
                    {!indicatorsData &&
                      <div className='empty-data'>
                        <header>{t('edge-management.statistics.txt-sourceIndicators')}</header>
                        <span><i className='fg fg-loading-2'></i></span>
                      </div>
                    }
                    {indicatorsData && indicatorsData.length === 0 &&
                      <div className='empty-data'>
                        <header>{t('edge-management.statistics.txt-sourceIndicators')}</header>
                        <span>{t('txt-notFound')}</span>
                      </div>
                    }
                    {indicatorsData && indicatorsData.length > 0 &&
                      <PieChart
                        title={t('edge-management.statistics.txt-sourceIndicators')}
                        data={indicatorsData}
                        keyLabels={{
                          key: t('txt-indicator'),
                          doc_count: t('txt-count')
                        }}
                        valueLabels={{
                          'Pie Chart': {
                            key: t('txt-indicator'),
                            doc_count: t('txt-count')
                          }
                        }}
                        dataCfg={{
                          splitSlice: ['key'],
                          sliceSize: 'doc_count'
                        }} />
                    }
                  </div>*/}

                  <div className='chart-group'>
                    {!indicatorsTrendData &&
                      <div className='empty-data'>
                        <header>{t('edge-management.statistics.txt-indicatorsTrend')}</header>
                        <span><i className='fg fg-loading-2'></i></span>
                      </div>
                    }
                    {indicatorsTrendData && indicatorsTrendData.length === 0 &&
                      <div className='empty-data'>
                        <header>{t('edge-management.statistics.txt-indicatorsTrend')}</header>
                        <span>{t('txt-notFound')}</span>
                      </div>
                    }
                    {indicatorsTrendData && indicatorsTrendData.length > 0 &&
                      <BarChart
                        stacked
                        vertical
                        title={t('edge-management.statistics.txt-indicatorsTrend')}
                        legend={{
                          enabled:true
                        }}
                        data={indicatorsTrendData}
                        onTooltip={this.onTooltip}
                        dataCfg={{
                          x: 'day',
                          y: 'count',
                          splitSeries: 'indicator'
                        }}
                        xAxis={{
                          type: 'datetime',
                          dateTimeLabelFormats: {
                            day: '%Y-%m-%d'
                          }
                        }}
                        plotOptions={{
                          series: {
                            maxPointWidth: 20
                          }
                        }} />
                    }
                  </div>

                  {/*}
                  <div className='chart-group'>
                    {!acuIndicatorsTrendData &&
                      <div className='empty-data'>
                        <header>{t('edge-management.statistics.txt-acuIndicatorsTrend')}</header>
                        <span><i className='fg fg-loading-2'></i></span>
                      </div>
                    }
                    {acuIndicatorsTrendData && acuIndicatorsTrendData.length === 0 &&
                      <div className='empty-data'>
                        <header>{t('edge-management.statistics.txt-acuIndicatorsTrend')}</header>
                        <span>{t('txt-notFound')}</span>
                      </div>
                    }
                    {acuIndicatorsTrendData && acuIndicatorsTrendData.length > 0 &&
                      <LineChart
                        title={t('edge-management.statistics.txt-acuIndicatorsTrend')}
                        legend={{
                          enabled: true
                        }}
                        data={acuIndicatorsTrendData}
                        onTooltip={this.onTooltip}
                        dataCfg={{
                          x: 'day',
                          y: 'count',
                          splitSeries: 'indicator'
                        }}
                        xAxis={{
                          type: 'datetime',
                          dateTimeLabelFormats: {
                            day: '%Y-%m-%d'
                          }
                        }} />
                    }
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ThreatIntelligence.contextType = BaseDataContext;

ThreatIntelligence.propTypes = {
};

export default ThreatIntelligence;