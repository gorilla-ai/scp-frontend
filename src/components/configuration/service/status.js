import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import DataTable from 'react-ui/build/src/components/table'

import {HocConfig as Config} from '../../common/configuration'
import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

/**
 * Service Status
 * @class
 * @author Ryan Chen <ryanchen@telmediatech.com>
 * @summary A react component to show the Config service status page
 */
class Status extends Component {
  constructor(props) {
    super(props);

    this.state = {
      serviceStatus: {
        dataFieldsArr: ['status', 'serviceName'],
        lastUpdateTime: '',
        dataFields: {},
        dataContent: []
      }
    };

    t = chewbaccaI18n.getFixedT(null, 'connections');
    f = chewbaccaI18n.getFixedT(null, 'tableFields');
    et = chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getServiceStatus();
  }
  /**
   * Get and set service status data
   * @method
   * @param {string} option - option for 'refresh'
   */
  getServiceStatus = (option) => {
    const {baseUrl} = this.props;
    const {serviceStatus} = this.state;
    let url = `${baseUrl}/api/monitor`;

    if (option === 'refresh') {
      url += '?refresh=true';
    }

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      let tempServiceStatus = {...serviceStatus};
      tempServiceStatus.lastUpdateTime = helper.getFormattedDate(data.lastUpdateDttm, 'local');
      tempServiceStatus.dataContent = data.monitor;

      let dataFields = {};
      serviceStatus.dataFieldsArr.forEach(tempData => {
        dataFields[tempData] = {
          label: f(`serviceStatusFields.${tempData}`),
          sortable: true,
          formatter: (value, allValue, i) => {
            if (tempData === 'status') {
              let styleStatus = '';
              let title = '';

              if (value.toLowerCase() === 'active') {
                styleStatus = '#22ac38';
                title = t('txt-online');
              } else if (value.toLowerCase() === 'unstable') {
                styleStatus = '#e6e448';
                title = t('txt-offline');
              } else {
                styleStatus = '#d0021b';
                title = t('txt-unstable');
              }

              return <div style={{color : styleStatus}}><i className='fg fg-recode' title={title} /></div>
            }
            if (tempData === 'serviceName') {
              let tooltip = '';

              if (allValue.responseCode) {
                tooltip += allValue.responseCode + ': ';
              } else {
                tooltip += 'N/A: ';
              }

              if (allValue.reponseMsg) {
                tooltip += allValue.reponseMsg;
              } else {
                tooltip += 'N/A';
              }

              return <span>{value} <i className='fg fg-info' title={tooltip}></i></span>
            }
          }
        };
      })

      tempServiceStatus.dataFields = dataFields;

      this.setState({
        serviceStatus: tempServiceStatus
      });
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {baseUrl, contextRoot, language, locale, session} = this.props;
    const {serviceStatus} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button onClick={this.getServiceStatus.bind(this, 'refresh')} title={t('txt-update')}><i className='fg fg-update'></i></button>
	          <span className='last-update'>{serviceStatus.lastUpdateTime}</span>
	        </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            locale={locale}
            session={session} />

          <div className='parent-content'>
            <div className='main-content'>
              <header className='main-header'>{t('txt-serviceStatus')}</header>
              <div className='table-content'>
                <div className='table no-pagination'>
                  <DataTable
                    className='main-table align-center'
                    fields={serviceStatus.dataFields}
                    data={serviceStatus.dataContent} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Status.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  locale: PropTypes.string.isRequired,
  session: PropTypes.object.isRequired
};

const HocStatus = withRouter(withLocale(Status));
export { Status, HocStatus };