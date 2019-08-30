import React, { Component } from 'react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import DataTable from 'react-ui/build/src/components/table'

import helper from '../../common/helper'
import {HocPagination as Pagination} from '../../common/pagination'
import {HocConfig as Config} from '../../common/configuration'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

class NetworkInventory extends Component {
	constructor(props) {
		super(props);

		this.state = {
      IP: {
        dataFieldsArr: ['ip', 'mac', 'hostName', 'owner', 'system', 'deviceType', '_menu'],
        dataFields: {},
        dataContent: [],
        ipListArr: [],
        ipDeviceUUID: '',
        sort: {
          field: 'ip',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      owner: {
        ownerListArr: [],
        selectedOwner: ''
      }
		};

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
	}
	componentWillMount() {
    this.getOwnerData();
    this.getIPData();
	}
  getOwnerData = () => {
    const {baseUrl} = this.props;
    const tempOwner = {...this.state.owner};

    this.ah.one({
      url: `${baseUrl}/api/owner/_search`,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      let ownerListArr = [];

      _.forEach(data.rows, val => {
        ownerListArr.push({
          value: val.ownerUUID,
          text: val.ownerName
        });
      })

      tempOwner.ownerListArr = ownerListArr;

      this.setState({
        owner: tempOwner
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  checkSortable = (field) => {
    const unSortableFields = ['options', 'owner', '_menu'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  getIPData = (fromSearch) => {
    const {baseUrl} = this.props;
    const {search, IP} = this.state;
    let dataObj = {
      sort: IP.sort.field,
      order: IP.sort.desc ? 'desc' : 'asc',
      page: fromSearch === 'search' ? 1 : IP.currentPage,
      pageSize: parseInt(IP.pageSize)
    };
    let type = '';

    if (fromSearch === 'search') {
      dataObj.keyword = search.ip;

      if (search.system != 'all') {
        dataObj.system = search.system;
      }

      if (search.deviceType != 'all') {
        dataObj.deviceType = search.deviceType;
      }

      if (search.name) {
        dataObj.ownerUUID = search.name;
      }
    }

    this.ah.one({
      url: `${baseUrl}/api/ipdevice/_search`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      let tempIP = {...IP};
      tempIP.dataContent = data.rows;
      tempIP.totalCount = data.counts;
      tempIP.currentPage = fromSearch === 'search' ? 1 : IP.currentPage;

      let dataFields = {};
      IP.dataFieldsArr.forEach(tempData => {
        dataFields[tempData] = {
          label: tempData === '_menu' ? '' : t(`ipFields.${tempData}`),
          sortable: this.checkSortable(tempData),
          formatter: (value, allValue) => {
            if (tempData === 'owner') {
              if (allValue.ownerObj) {
                return <span>{allValue.ownerObj.ownerName}</span>;
              } else {
                return <span>{value}</span>;
              }
            }
            if (tempData === '_menu') {
              return <div></div>;
            } else {
              return <span>{value}</span>;
            }
          }
        };
      })

      tempIP.dataFields = dataFields;

      if (!fromSearch) {
        let ipListArr = [];

        _.forEach(data.rows, val => {
          ipListArr.push({
            value: val.ip,
            text: val.ip
          });
        })

        tempIP.ipListArr = ipListArr;
      }

      this.setState({
        IP: tempIP
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleTableSort = (value) => {
    let tempIP = {...this.state.IP};
    tempIP.sort.field = value.field;
    tempIP.sort.desc = !tempIP.sort.desc;

    this.setState({
      owner: tempIP
    }, () => {
      this.getIPData();
    });
  }
  handlePaginationChange = (type, value) => {
    let tempIP = {...this.state.IP};
    tempIP[type] = value;

    if (type === 'pageSize') {
      tempIP.currentPage = 1;
    }

    this.setState({
      IP: tempIP
    }, () => {
      this.getIPData();
    });
  }
	render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {IP} = this.state;

		return (
      <div>
        <div className='sub-nav-header' />

        <div className='config-header'>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          <div className='data-table'>
            <div className='main-content'>
              <div className='table-content'>
                <div className='table normal'>
                  {IP.dataFields &&
                    <DataTable
                      className='main-table'
                      fields={IP.dataFields}
                      data={IP.dataContent}
                      sort={IP.dataContent.length === 0 ? {} : IP.sort}
                      onSort={this.handleTableSort} />
                  }
                </div>
                <footer>
                  <Pagination
                    totalCount={IP.totalCount}
                    pageSize={IP.pageSize}
                    currentPage={IP.currentPage}
                    onPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                    onDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
		)
	}
}

NetworkInventory.propTypes = {
	baseUrl: PropTypes.string.isRequired,
	contextRoot: PropTypes.string.isRequired,
	language: PropTypes.string.isRequired,
	session: PropTypes.object.isRequired
};

const HocNetworkInventory = withRouter(withLocale(NetworkInventory));
export { NetworkInventory, HocNetworkInventory };