import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import Button from '@material-ui/core/Button';

import {BaseDataContext} from '../../common/context';
import Config from '../../common/configuration'
import helper from '../../common/helper'
import MuiTableContent from '../../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

/**
 * Service Status
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component to show the Config service status page
 */
class Status extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lastUpdateTime: '',
      serviceStatus: {
        dataFieldsArr: ['status', 'serviceName'],
        dataFields: [],
        dataContent: []
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'config', locale);

    this.getServiceStatus();
  }
  /**
   * Get and set service status data
   * @method
   * @param {string} option - option for 'refresh'
   */
  getServiceStatus = (option) => {
    const {baseUrl} = this.context;
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
      if (data) {
        const lastUpdateTime = helper.getFormattedDate(data.lastUpdateDttm, 'local');
        let tempServiceStatus = {...serviceStatus};
        tempServiceStatus.dataContent = data.monitor;

        tempServiceStatus.dataFields = _.map(serviceStatus.dataFieldsArr, val => {
          return {
            name: val,
            label: f('serviceStatusFields.' + val),
            options: {
              filter: true,
              sort: false,
              customBodyRenderLite: (dataIndex) => {
                const allValue = tempServiceStatus.dataContent[dataIndex];
                const value = tempServiceStatus.dataContent[dataIndex][val];

                if (val === 'status') {
                  let color = '';
                  let title = '';

                  if (value.toLowerCase() === 'active') {
                    color = '#22ac38';
                    title = t('txt-online');
                  } else if (value.toLowerCase() === 'inactive') {
                    color = '#d10d25';
                    title = t('txt-offline');
                  } else if (value.toLowerCase() === 'unstable') {
                    color = '#e6e448';
                    title = t('txt-unstable');
                  } else if (value.toLowerCase() === 'unknown') {
                    color = '#999';
                    title = t('txt-unknown');
                  }

                  return <div style={{color}}><i className='fg fg-recode' title={title} /></div>
                } else if (val === 'serviceName') {
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
            }
          };
        });

        this.setState({
          lastUpdateTime,
          serviceStatus: tempServiceStatus
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {baseUrl, contextRoot} = this.context;
    const {lastUpdateTime, serviceStatus} = this.state;
    const tableOptions = {
      pagination: false,
      tableBodyHeight: '78vh'
    };

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <Button variant='contained' color='primary' onClick={this.getServiceStatus.bind(this, 'refresh')} title={t('txt-update')}><i className='fg fg-update'></i></Button>
	          <span className='last-update'>{lastUpdateTime}</span>
	        </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot} />

          <div className='parent-content'>
            <div className='main-content'>
              <header className='main-header'>{t('txt-serviceStatus')}</header>
              <div className='table-content'>
                <div className='table no-pagination'>
                  <MuiTableContent
                    data={serviceStatus}
                    tableOptions={tableOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Status.contextType = BaseDataContext;

Status.propTypes = {
};

export default withRouter(Status);