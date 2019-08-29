import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import DataTable from 'react-ui/build/src/components/table'

import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'
import {HocConfig as Config} from '../../common/configuration'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;

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
	componentWillMount() {
		this.getServiceStatus();
	}
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

              if (value.toLowerCase() === 'active') {
              	styleStatus = '#22ac38';
              } else if (value.toLowerCase() === 'unstable') {
                styleStatus = '#e6e448';
              } else {
              	styleStatus = '#d0021b';
              }

              return <div style={{color : styleStatus}}><i className='fg fg-recode' title={helper.capitalizeFirstLetter(value)} /></div>
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
		const {baseUrl, contextRoot, language, session} = this.props;
		const {serviceStatus} = this.state;

		return (
      <div>
        <div className='sub-nav-header' />

        <div className='config-header'>
          <div className='breadcrumb' />
          <div className='last-update'>
	          <button onClick={this.getServiceStatus.bind(this, 'refresh')}>{t('txt-update')}</button>
	          <span>{t('txt-lastUpdateTime')}: {serviceStatus.lastUpdateTime}</span>
	        </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          <div className='data-table manage'>
	          <DataTable
              className='main-table align-center'
              fields={serviceStatus.dataFields}
              data={serviceStatus.dataContent} />
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
	session: PropTypes.object.isRequired
};

const HocStatus = withRouter(withLocale(Status));
export { Status, HocStatus };