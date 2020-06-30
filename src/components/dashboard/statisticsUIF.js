import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import DateRange from 'react-ui/build/src/components/date-range'

import {BaseDataContext} from '../common/context';
import helper from '../common/helper'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'
import {HOC} from 'widget-builder'

let t = null
let et = null

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {Emergency: '#CC2943', Alert: '#CC7B29', Critical: '#29B0CC', Warning: '#29CC7A', Notice: '#7ACC29'}
const COLORS = ['#069BDA', '#57C3D9', '#57D998', '#6CD957', '#C3D957', '#D99857', '#D9576C', '#D957C3', '#9857D9', '#576CD9', '#5798D9', '#57D9C3', '#57D96C', '#98D957', '#D9C357', '#D96C57', '#D95798', '#C357D9', '#6C57D9']

const INIT = {
  appendConfig: {},
  datetime: {
    from: helper.getSubstractDate(1, 'days', Moment().local()),
    to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
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
    this.loadUIF()
  }
  loadUIF() {
    const {baseUrl, session} = this.context
    const {datetime} = this.state
    const url = `${baseUrl}/api/uif?id=SCP-Overview`
    let appendConfig = {}

    this.ah.one({url})
    .then(data => {
      let dataJson = JSON.parse(data)
      let uifCfg = JSON.parse(dataJson.data)

      _.forEach(uifCfg.config.widgets, (widgetValue, widgetName) => {

        const oldUrl = widgetValue.widgetConfig.config.dataSource.query.url
        const pattern = _.includes(oldUrl, '?') ? oldUrl.substring(oldUrl.indexOf('/api'), oldUrl.indexOf('?')) : oldUrl.substring(oldUrl.indexOf('/api'))
        let newUrl = `${baseUrl}${pattern}`

        if (_.includes(oldUrl, 'startDttm') && _.includes(oldUrl, 'endDttm')) {
          const startDttm = Moment(datetime.from, 'YYYY-MM-DD hh:mm:ss').utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
          const endDttm = Moment(datetime.to, 'YYYY-MM-DD hh:mm:ss').utc().format('YYYY-MM-DDTHH:mm:ss[Z]')  

          newUrl += `?startDttm=${startDttm}&endDttm=${endDttm}`
        }

        if (_.includes(oldUrl, 'page') && _.includes(oldUrl, 'pageSize')) {
          newUrl += `&page=1&pageSize=0`
        }

        if (_.includes(oldUrl, 'topSize')) {
          newUrl += `&topSize=10`
        }

        if (_.includes(oldUrl, 'accountId')) {
          newUrl += `&accountId=${session.accountId}` 
        }

        _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.dataSource.query.url`], newUrl)

        // set tool tip
        if (widgetName === 'AlertStatistics-bar') {
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.onTooltip`], this.onTooltip.bind(this, 'AlertStatistics-bar'))
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.xAxis`], {
            labels: {
              formatter() {
                return Moment(this.value, 'x').local().format('MM/DD HH:mm')
              }
            }
          })
        }

        if (widgetName === 'CustomAlertStatistics') {
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.onTooltip`], this.onTooltip.bind(this, 'CustomAlertStatistics'))
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.xAxis`], {
            labels: {
              formatter() {
                return Moment(this.value, 'x').local().format('MM/DD HH:mm')
              }
            }
          })
        }

        if (widgetName === 'MaskedIPAlertStatistics-bar') {
          _.set(appendConfig, [`config.widgets.${widgetName}.widgetConfig.config.onTooltip`], this.onTooltip.bind(this, 'MaskedIPAlertStatistics-bar'))
        }

      })

      this.setState({appendConfig})
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message)
    })
  }
  handleChange(field, value) {
    this.setState({[field]: value})
  }
  onTooltip = (type, eventInfo, data) => {
    if (type === 'AlertStatistics-bar') {
      return <section>
        <span>{t('txt-severity')}: {data[0].severity}<br /></span>
        <span>{t('txt-time')}: {Moment(data[0].key, 'x').local().format('YYYY/MM/DD HH:mm:ss')}<br /></span>
        <span>{t('txt-count')}: {data[0].doc_count}</span>
      </section>
    }
    if (type === 'CustomAlertStatistics') {
      return <section>
        <span>{t('dashboard.txt-patternName')}: {data[0].patternName}<br /></span>
        <span>{t('txt-time')}: {Moment(data[0].key, 'x').local().format('YYYY/MM/DD HH:mm:ss')}<br /></span>
        <span>{t('txt-count')}: {data[0].doc_count}</span>
      </section>
    }
    else if (type === 'MaskedIPAlertStatistics-bar') {
      return <section>
        <span>{t('txt-subnet')}: {data[0].subnet}<br /></span>
        <span>{t('txt-count')}: {data[0].doc_count}</span>
      </section>
    } 
  }
	render() {
    const {locale} = this.context
    const {appendConfig, datetime} = this.state

		return <div>
			<div className='sub-header'>
				{helper.getDashboardMenu('statisticsUIF')}
        <div style={{display: 'flex', float: 'right'}}>
          <DateRange id='datetime' className='daterange' onChange={this.handleChange.bind(this, 'datetime')}
            enableTime={true} value={datetime} locale={locale} t={et} />
          <button style={{marginLeft: '5px'}} onClick={this.loadUIF.bind(this)}>{t('txt-filter')}</button>
        </div>
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