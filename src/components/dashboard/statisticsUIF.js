import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'
import Promise from 'bluebird'

import Button from '@material-ui/core/Button';

import Progress from 'react-ui/build/src/components/progress'

import SearchOptions from '../common/search-options'
import {BaseDataContext} from '../common/context';
import helper from '../common/helper'

import {downloadLink} from 'react-ui/build/src/utils/download'
import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'
import {HOC} from 'widget-builder'

import htmlToImage from 'html-to-image'

let t = null
let et = null
let intervalId = null

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {Emergency: '#CC2943', Alert: '#CC7B29', Critical: '#29B0CC', Warning: '#29CC7A', Notice: '#7ACC29'}
const COLORS = ['#069BDA', '#57C3D9', '#57D998', '#6CD957', '#C3D957', '#D99857', '#D9576C', '#D957C3', '#9857D9', '#576CD9', '#5798D9', '#57D9C3', '#57D96C', '#98D957', '#D9C357', '#D96C57', '#D95798', '#C357D9', '#6C57D9']

const INIT = {
  uifCfg: {},
  appendConfig: {},
  datetime: {},
  searchInput: {
    searchType: 'manual',
    searchInterval: '1h',
    refreshTime: '600000' //10 minutes
  }
}

class StatisticsUIF extends Component {
	constructor(props) {
		super(props)

	    t = global.chewbaccaI18n.getFixedT(null, 'connections')
	    et = global.chewbaccaI18n.getFixedT(null, 'errors')
	    this.ah = getInstance('chewbacca')

      this.state = _.cloneDeep(INIT)
	}
  componentDidMount() {
    const datetime = {
      from: helper.getSubstractDate(1, 'days', moment().local()),
      to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
    }

    this.setState({datetime}, () => {
      this.loadUIF()  
    })
  }
  componentWillUnmount() {

  }
  loadUIF = () => {
    const {baseUrl, session} = this.context
    const url = `${baseUrl}/api/uif?id=SCP-Overview`

    let {datetime} = this.state
    let appendConfig = {}

    this.ah.one({url})
    .then(data => {
      let dataJson = JSON.parse(data)
      let uifCfg = JSON.parse(dataJson.data)


      _.forEach(uifCfg.config.widgets, (widgetValue, widgetName) => {

        const oldUrl = widgetValue.widgetConfig.config.dataSource.query.url
        const pattern = _.includes(oldUrl, '?') ? oldUrl.substring(oldUrl.indexOf('/api'), oldUrl.indexOf('?')) : oldUrl.substring(oldUrl.indexOf('/api'))
        const params = _.includes(oldUrl, '?') ? oldUrl.substring(oldUrl.indexOf('?') + 1) : ''
        let newUrl = `${baseUrl}${pattern}`

        if (params) {
          _.forEach(params.split('&'), param => {
            _.includes(newUrl, '?') ? newUrl += '&' : newUrl += '?'

            if (_.includes(param, 'startDttm')) {
              const startDttm = moment(datetime.from, 'YYYY-MM-DD hh:mm:ss').utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
              newUrl += `startDttm=${startDttm}`
            }
            else if (_.includes(param, 'endDttm')) {
              const endDttm = moment(datetime.to, 'YYYY-MM-DD hh:mm:ss').utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
              newUrl += `endDttm=${endDttm}`
            }
            else if (_.includes(param, 'accountId')) {
              newUrl += `accountId=${session.accountId}` 
            }
            else if (_.includes(param, 'timeZone')) {
              newUrl += `timeZone=8` 
            }
            else {
              newUrl += param
            }
          })
        }

        _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.dataSource.query.url`], newUrl)

        // set tool tip
        if (widgetName === 'AlertStatistics-bar') {
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.onTooltip`], this.onTooltip.bind(this, 'AlertStatistics-bar'))
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.xAxis`], {
            labels: {
              formatter() {
                return moment(this.value, 'x').local().format('MM/DD HH:mm')
              }
            }
          })
        }

        if (widgetName === 'CustomAlertStatistics') {
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.onTooltip`], this.onTooltip.bind(this, 'CustomAlertStatistics'))
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.xAxis`], {
            labels: {
              formatter() {
                return moment(this.value, 'x').local().format('MM/DD HH:mm')
              }
            }
          })
        }

        if (widgetName === 'MaskedIPAlertStatistics-bar') {
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.onTooltip`], this.onTooltip.bind(this, 'MaskedIPAlertStatistics-bar'))
        }

        if (widgetName === 'honeypotLoginPassword-table') {
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.fields.password.formatter`], this.formatter.bind(this))
        }

      })

      this.setState({appendConfig, uifCfg})
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message)
    })
  }
  handleChange(field, value) {
    this.setState({[field]: value})
  }
  handleDateChange = (type, newDatetime, refresh) => {
    let tempDatetime = {...this.state.datetime};
    tempDatetime[type] = newDatetime;

    this.setState({
      datetime: tempDatetime
    }, () => {
      if (refresh === 'refresh') {
        this.loadUIF()
      }
    });
  }
  setSearchData = (type, event) => {
    const value = event.target ? event.target.value : event;

    if (type === 'all') {
      this.setState({
        searchInput: value
      });
    } else {
      let tempSearchInput = {...this.state.searchInput};

      if (value) {
        tempSearchInput[type] = value;

        this.setState({
          searchInput: tempSearchInput
        });
      }
    }
  }
  formatter = (value) => {
    return <div dangerouslySetInnerHTML={{__html: value}} />
  }
  onTooltip = (type, eventInfo, data) => {
    if (type === 'AlertStatistics-bar') {
      return <section>
        <span>{t('txt-severity')}: {data[0].severity}<br /></span>
        <span>{t('txt-time')}: {moment(data[0].key, 'x').local().format('YYYY/MM/DD HH:mm:ss')}<br /></span>
        <span>{t('txt-count')}: {helper.numberWithCommas(data[0].doc_count)}</span>
      </section>
    }
    else if (type === 'CustomAlertStatistics') {
      return <section>
        <span>{t('dashboard.txt-patternName')}: {data[0].patternName}<br /></span>
        <span>{t('txt-time')}: {moment(data[0].key, 'x').local().format('YYYY/MM/DD HH:mm:ss')}<br /></span>
        <span>{t('txt-count')}: {helper.numberWithCommas(data[0].doc_count)}</span>
      </section>
    }
    else if (type === 'CustomAccountQueryAlertStatistics') {
      return <section>
        <span>{t('dashboard.txt-patternName')}: {data[0].QueryFilterName}<br /></span>
        <span>{t('txt-time')}: {Moment(data[0].key, 'x').local().format('YYYY/MM/DD HH:mm:ss')}<br /></span>
        <span>{t('txt-count')}: {data[0].doc_count}</span>
      </section>
    }
    else if (type === 'MaskedIPAlertStatistics-bar') {
      return <section>
        <span>{t('txt-subnet')}: {data[0].subnet}<br /></span>
        <span>{t('txt-count')}: {helper.numberWithCommas(data[0].doc_count)}</span>
      </section>
    } 
  }
  exportPDF() {
    Progress.startSpin()

    const {uifCfg} = this.state
    let cfg = {
      data: []
    }    

    cfg.data = _.map(uifCfg.config.widgets, (v, k) => {
      return {
        display_setting: {
          x: v.layout.x * 2,
          y: v.layout.y * 2,
          width: v.layout.w * 2,
          height: v.layout.h * 2
        },
        content_setting: {
          type: 'image',
          value: `${k}.jpg`
        }
      }
    })

    const {baseUrl, contextRoot} = this.context

    _.forEach(uifCfg.config.widgets, (value, chart) => {
      htmlToImage.toPng(document.getElementById(chart))
      .then(function(dataUrl) {
          const imgArray = dataUrl.split(',')
          const mime = imgArray[0].match(/:(.*?);/)[1]
          const bstr = atob(imgArray[1])
          let n = bstr.length
          let u8arr = new Uint8Array(n)

          while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
          }
          const img = new File([u8arr], `${chart}.jpg`, {type: mime})

          let formData = new FormData()
          formData.append('file', img)
          formData.append('config_string', JSON.stringify(cfg))
          formData.append('size', _.size(cfg.data))

          ah.one({
            url: `${baseUrl}/api/pdf/_relay2`,
            data: formData,
            type: 'POST',
            dataType: 'JSON',
            processData: false,
            contentType: false
          })
          .then(data => {
            if (data.rt) {
              downloadLink(`${baseUrl}${contextRoot}/api/pdf/_download`)

              Progress.done()
            }
          })
          .catch(err => {
            console.log(err)

            helper.showPopupMsg('', t('txt-error'), err.message)
          })
      })
      .catch(err => {
        console.log(err)

        helper.showPopupMsg('', t('txt-error'), err.message)
      })
    })


    // Promise.all(_.map(uifCfg.config.widgets, (value, chart) => {
    //   return htmlToImage.toPng(document.getElementById(chart))
    //   .then(function(dataUrl) {
    //       const imgArray = dataUrl.split(',')
    //       const mime = imgArray[0].match(/:(.*?);/)[1]
    //       const bstr = atob(imgArray[1])
    //       let n = bstr.length
    //       let u8arr = new Uint8Array(n)

    //       while (n--) {
    //         u8arr[n] = bstr.charCodeAt(n)
    //       }
    //       return new File([u8arr], `${chart}.jpg`, {type: mime})
    //   })
    // }))
    // .then(files => {
    //   let formData = new FormData()
    //   formData.append('config_string', JSON.stringify(cfg))

    //   _.forEach(files, file => {
    //     formData.append('files', file)
    //   })
      
    //   this.ah.one({
    //     url: `${baseUrl}/api/pdf/_relay`,
    //     data: formData,
    //     type: 'POST',
    //     dataType: 'JSON',
    //     processData: false,
    //     contentType: false
    //   })
    //   .then(data => {
    //     downloadLink(`${baseUrl}${contextRoot}/api/pdf/_download`)
    //   })
    //   .catch(err => {
    //     helper.showPopupMsg('', t('txt-error'), err.message)
    //   })
    // })
    // .finally(() => {
    //   Progress.done()
    // })
  }
	render() {
    const {locale} = this.context
    const {appendConfig, datetime, searchInput} = this.state

		return <div>
			<div className='sub-header'>
				{helper.getDashboardMenu('statisticsUIF')}

        <div className='secondary-btn-group right'>
          <Button variant='outlined' color='primary' className='last' title={t('txt-export')} onClick={this.exportPDF.bind(this)} ><i className='fg fg-data-download'></i></Button>
        </div>

        <SearchOptions
          datetime={datetime}
          searchInput={searchInput}
          enableTime={true}
          showInterval={true}
          setSearchData={this.setSearchData}
          handleDateChange={this.handleDateChange}
          handleSearchSubmit={this.loadUIF} />
      </div>
      {
        !_.isEmpty(appendConfig) &&
        <div className='uif-dashboard'>
           <HOC $id={'dashboard/SCP-Overview'} $appendConfig={appendConfig} />
        </div>
      }
		</div>
	}
}

StatisticsUIF.contextType = BaseDataContext;

StatisticsUIF.propTypes = {
}

export default withRouter(StatisticsUIF)