import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import Tabs from 'react-ui/build/src/components/tabs'

import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'
import {HocConfig as Config} from '../../common/configuration'
import TableContent from '../../common/table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

class Edge extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');

    this.state = {
      activeTab: 'edgeList',
      activeContent: 'tableList', //tableList, editAgent
      showFilter: false,
      serviceType: [
        { value: 'all', text: t('txt-all') },
        { value: 'NETTRAP', text: 'NETTRAP' },
        { value: 'NETFLOW-IDS-SURICATA', text: 'NETFLOW-IDS-SURICATA' }
      ],
      connectionStatus: [
        { value: 'all', text: t('txt-all') },
        { value: 'Error', text: 'Error' },
        { value: 'Normal', text: 'Normal' }
      ],
      edgeSearch: {
        keyword: '',
        serviceType: 'all',
        connectionStatus: 'all'
      },
      edge: {
        dataFieldsArr: ['agentName', 'ipPort', 'serviceType', 'description', 'options'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'ipPort',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        info: {}
      },
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.getEdgeData();
  }
  getEdgeData = (fromSearch) => {
    const {baseUrl, contextRoot} = this.props;
    const {edgeSearch, edge} = this.state;
    const url = `${baseUrl}/api/edge/_search?page=${edge.currentPage}&pageSize=${edge.pageSize}`;
    let data = {};

    if (edgeSearch.keyword) {
      data.keyword = edgeSearch.keyword;
    }

    if (edgeSearch.serviceType && edgeSearch.serviceType !== 'all') {
      data.serviceType = edgeSearch.serviceType;
    }

    if (edgeSearch.connectionStatus && edgeSearch.connectionStatus !== 'all') {
      data.connectionStatus = edgeSearch.connectionStatus;
    }

    helper.getAjaxData('POST', url, data)
    .then(data => {
      if (data) {
        let tempEdge = {...edge};
        tempEdge.dataContent = data.rows;
        tempEdge.totalCount = data.counts;
        tempEdge.currentPage = fromSearch === 'search' ? 1 : edge.currentPage;

        let dataFields = {};
        edge.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: tempData === 'options' ? '' : t(`edgeFields.${tempData}`),
            sortable: this.checkSortable(tempData),
            formatter: (value, allValue, index) => {
              if (tempData === 'description') {

              } else if (tempData === 'options') {

              } else {
                return <span>{value}</span>;
              }
            }
          };
        })

        tempEdge.dataFields = dataFields;

        this.setState({
          edge: tempEdge
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg(t('txt-error'));
    });
  }
  checkSortable = (field) => {
    const unSortableFields = ['description', 'options'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  handleTableSort = (value) => {
    let tempEdge = {...this.state.edge};
    tempEdge.sort.field = value.field;
    tempEdge.sort.desc = !tempEdge.sort.desc;

    this.setState({
      edge: tempEdge
    }, () => {
      this.getEdgeData();
    });
  }
  handlePaginationChange = (type, value) => {
    let tempEdge = {...this.state.edge};
    tempEdge[type] = Number(value);

    if (type === 'pageSize') {
      tempEdge.currentPage = 1;
    }

    this.setState({
      edge: tempEdge
    }, () => {
      this.getEdgeData();
    });
  }
  handleEdgeSearch = (type, value) => {
    let tempEdgeSearch = {...this.state.edgeSearch};
    tempEdgeSearch[type] = value;

    this.setState({
      edgeSearch: tempEdgeSearch
    });
  }
  renderFilter = () => {
    const {showFilter, serviceType, connectionStatus, edgeSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='edgeSearchKeyword' className='first-label'>{t('edgeFields.keywords')}</label>
            <Input
              id='edgeSearchKeyword'
              className='search-textarea'
              onChange={this.handleEdgeSearch.bind(this, 'keyword')}
              value={edgeSearch.keyword} />
          </div>
          <div className='group'>
            <label htmlFor='edgeSearchServiceType'>{t('edgeFields.serviceType')}</label>
            <DropDownList
              id='edgeSearchServiceType'
              list={serviceType}
              required={true}
              onChange={this.handleEdgeSearch.bind(this, 'serviceType')}
              value={edgeSearch.serviceType} />
          </div>
          <div className='group'>
            <label htmlFor='edgeSearchConnectionStatus'>{t('edgeFields.connectionStatus')}</label>
            <DropDownList
              id='edgeSearchConnectionStatus'
              list={connectionStatus}
              required={true}
              onChange={this.handleEdgeSearch.bind(this, 'connectionStatus')}
              value={edgeSearch.connectionStatus} />
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getEdgeData.bind(this, 'search')}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter.bind(this)}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  toggleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter
    });
  }
  getBtnPos = (type) => {
    const {locale} = this.props;

    if (type === 'add') {
      if (locale === 'zh') {
        return '120px';
      } else if (locale === 'en') {
        return '200px';
      }
    }
  }
  clearFilter = () => {
    this.setState({
      edgeSearch: {
        keyword: '',
        serviceType: 'all',
        connectionStatus: 'all'
      }
    });
  }
  render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {activeTab, activeContent, showFilter, edge} = this.state;

    return (
      <div>
        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
          </div>
        </div>

        <div className='data-content'>
          <Config
            baseUrl={baseUrl}
            contextRoot={contextRoot}
            language={language}
            session={session} />

          <div className='data-table'>
            { this.renderFilter() }

            {activeContent === 'tableList' &&
              <div className='main-content'>
                <Tabs
                  className='subtab-menu'
                  menu={{
                    edgeList: t('txt-edge')
                  }}
                  current={activeTab}>
                </Tabs>

                <button className='standard btn last'>{t('edgeManagement.notificationSettings')}</button>
                <button className='standard btn' style={{right: this.getBtnPos('add')}}>{t('edgeManagement.threatSettings')}</button>

                <TableContent
                  dataTableData={edge.dataContent}
                  dataTableFields={edge.dataFields}
                  dataTableSort={edge.sort}
                  paginationTotalCount={edge.totalCount}
                  paginationPageSize={edge.pageSize}
                  paginationCurrentPage={edge.currentPage}
                  handleTableSort={this.handleTableSort}
                  paginationPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                  paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
              </div>
            }

            {activeContent === 'editAgent' &&
              <div className='main-content'>

              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

Edge.propTypes = {
  baseUrl: PropTypes.string.isRequired
};

const HocEdge = withLocale(Edge);
export { Edge, HocEdge };