import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Moment from 'moment'
import cx from 'classnames'

import DateRange from 'react-ui/build/src/components/date-range'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import Filter from './filter'
import helper from './helper'
import Mark from './mark'
import withLocale from '../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

class QueryOpenSave extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newQueryName: true,
      info: '',
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  componentDidMount = () => {

  }
  handleQueryAction = (type) => {
    const {activeTab, filterData, queryData, markData} = this.props;

    if (type === 'open') {
      let tempQueryData = {...queryData};
      tempQueryData.openFlag = true;
      tempQueryData.displayId = queryData.id;
      tempQueryData.displayName = queryData.name;

      this.props.setQueryData(tempQueryData);

      if (queryData.query) {
        if (activeTab === 'logs') {
          let formattedMarkData = [];

          _.forEach(queryData.query.search, val => {
            if (val) {
              formattedMarkData.push({
                data: val
              });
            }
          })
          this.props.setMarkData(formattedMarkData);
        }

        this.props.setFilterData(queryData.query.filter);
      }
    } else if (type === 'save') {
      const {baseUrl, account, queryData} = this.props;
      const {newQueryName} = this.state;
      let tempFilterData = [];
      let url = '';
      let queryText = {};
      let queryString = [];
      let requestType = '';
      let data = {};

      _.forEach(filterData, val => {
        if (val.query) {
          tempFilterData.push({
            condition: val.condition,
            query: val.query
          });
        }
      })

      if (_.isEmpty(tempFilterData)) { //Close Save dialog if filterData is empty
        this.props.closeDialog();
        return;
      }

      if (newQueryName) {
        if (!queryData.inputName) {
          this.setState({
            info: t('network.connections.txt-noOpenQuery')
          });
          return;
        }
      }

      if (activeTab === 'alert') {
        url = `${baseUrl}/api/account/alert/queryText`;
        queryText = {
          filter: filterData
        };
      } else if (activeTab === 'logs') {
        let markDataArr = [];
        url = `${baseUrl}/api/account/syslog/queryText`;

        _.forEach(markData, val => {
          if (val.data) {
            markDataArr.push(val.data);
          }
        })

        queryText = {
          filter: filterData,
          search: markDataArr
        };
      } else {
        url = `${baseUrl}/api/account/event/queryText`;
        queryText = {
          filter: filterData
        };
      }

      if (newQueryName) {
        requestType = 'POST';
        data = {
          accountId: account.id,
          name: queryData.inputName,
          queryText
        };
      } else {
        requestType = 'PATCH';
        data = {
          id: queryData.id,
          name: this.getQueryName(),
          queryText
        };
      }

      helper.getAjaxData(requestType, url, data)
      .then(data => {
        if (data) {
          PopupDialog.alert({
            id: 'queryModal',
            confirmText: t('txt-close'),
            display: <div>{t('network.connections.txt-querySaved')}</div>
          });

          this.props.getSavedQuery();
        }
        return null;
      });
    }
    this.props.closeDialog();
  }
  getQueryName = () => {
    const {queryData} = this.props;
    let queryName = '';

    _.forEach(queryData.list, val => {
      if (val.id === queryData.id) {
        queryName = val.name;
        return false;
      }
    })

    return queryName;
  }
  getDeleteQueryContent = () => {
    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {this.getQueryName()}?</span>
      </div>
    )
  }
  deleteFilterQuery = () => {
    const {baseUrl, activeTab, queryData} = this.props;
    const {} = this.state;
    let url = '';

    if (activeTab === 'alert') {
      url = `${baseUrl}/api/account/alert/queryText?id=${queryData.id}`;
    } else if (activeTab === 'logs') {
      url = `${baseUrl}/api/account/syslog/queryText?id=${queryData.id}`;
    } else {
      url = `${baseUrl}/api/account/event/queryText?id=${queryData.id}`;
    }

    this.ah.one({
      url,
      type: 'DELETE'
    })
    .then(data => {
      if (data) {
        let newQueryList = [];
        let tempQueryData = {...queryData};

        _.forEach(queryData.list, val => {
          if (val.id !== queryData.id) {
            newQueryList.push(val);
          }
        })

        if (newQueryList.length > 0) {
          tempQueryData.id = newQueryList[0].id;
          tempQueryData.name = newQueryList[0].name;
          tempQueryData.list = newQueryList;
          tempQueryData.query = newQueryList[0].queryText;
        } else {
          tempQueryData.id = '';
          tempQueryData.name = '';
          tempQueryData.list = [];
          tempQueryData.query = '';
        }

        this.props.setQueryData(tempQueryData);
      } else {
        helper.showPopupMsg('', t('txt-error'), err.message);
      }
      return null;
    });
  }
  removeQuery = () => {
    PopupDialog.prompt({
      title: t('network.connections.txt-deleteFilter'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteQueryContent(),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteFilterQuery();
        }
      }
    });
  }
  displayFilterQuery = (value, index) => {
    const {searchFields, activeTab, logFields} = this.props;
    const {} = this.state;
    let filterData = [];

    filterData = [{
      condition: value.condition,
      query: value.query
    }];

    return (
      <Filter
        key={index}
        activeTab={activeTab}
        searchFields={searchFields}
        logFields={logFields}
        queryType='query'
        filterData={filterData}
        inline={false} />
    )
  }
  displayMarkSearch = (value, index) => {
    const {searchFields, activeTab, logFields} = this.props;
    const {} = this.state;
    const markData = [{
      data: value
    }];

    return (
      <Mark
        key={index}
        activeTab={activeTab}
        searchFields={searchFields}
        logFields={logFields}
        queryType='query'
        markData={markData}
        inline={false} />
    )
  }
  handleQueryChange = (type, value) => {
    const {activeTab, queryData} = this.props;
    const {newQueryName} = this.state;
    let tempQueryData = {...queryData};
    let queryName = newQueryName;

    if (type === 'id') {
      tempQueryData.id = value;
      tempQueryData.openFlag = true;

      _.forEach(queryData.list, val => {
        if (val.id === value) {
          tempQueryData.name = val.name;
          tempQueryData.query = val.queryText;
        }
      })

      if (value === 'new') {
        queryName = true;
      } else {
        queryName = false;
      }
    } else if (type === 'name') {
      tempQueryData.inputName = value;
    }

    this.props.setQueryData(tempQueryData);
    this.setState({
      newQueryName: queryName
    });
  }
  displayQueryContent = (type) => {
    const {searchFields, activeTab, queryData, filterData, markData, logFields} = this.props;
    const {} = this.state;
    const that = this;
    let displayList = [];
    let tempFilterData = [];
    let tempMarkData = [];

    if (queryData.list.length > 0) {
      _.forEach(queryData.list, val => {
        displayList.push({
          value: val.id,
          text: val.name
        });
      })
    }

    if (type === 'open') {
      let queryDataList = [];
      let queryDataMark = [];

      if (queryData.list.length === 0) {
        return (
          <div className='error-msg'>{t('network.connections.txt-noSavedQuery')}</div>
        )
      }

      if (activeTab === 'logs') {
        queryDataList = queryData.query.filter;
        queryDataMark = queryData.query.search;
      } else {
        queryDataList = queryData.query.filter;
      }

      return (
        <div>
          <label>{t('network.connections.txt-queryName')}</label>
          <DropDownList
            className='query-name'
            list={displayList}
            required={true}
            onChange={this.handleQueryChange.bind(this, 'id')}
            value={queryData.id} />

          {queryDataList && queryDataList.length > 0 &&
            <div className='filter-group'>
              {
                queryDataList.map(function(value, index) {
                  return that.displayFilterQuery(value, index);
                })
              }
            </div>
          }

          {queryDataMark && queryDataMark.length > 0 &&
            <div className='filter-group'>
              {
                queryDataMark.map(function(value, index) {
                  return that.displayMarkSearch(value, index);
                })
              }
            </div>
          }

          <button className='standard delete-query' onClick={this.removeQuery} disabled={queryData.displayId === queryData.id}>{t('txt-delete')}</button>
        </div>
      )
    } else if (type === 'save') {
      let dropDownValue = 'new';

      _.forEach(filterData, val => {
        if (val.query) {
          tempFilterData.push({
            condition: val.condition,
            query: val.query
          });
        }
      })

      _.forEach(markData, val => {
        if (val.data) {
          tempMarkData.push({
            data: val.data
          });
        }
      })

      if (activeTab === 'logs') {
        if (tempFilterData.length === 0 && tempMarkData.length == 0) {
          return (
            <div className='error-msg'>{t('network.connections.txt-noOpenQuery')}</div>
          )
        }
      } else {
        if (tempFilterData.length === 0) {
          return (
            <div className='error-msg'>{t('network.connections.txt-noOpenQuery')}</div>
          )
        }
      }

      displayList.unshift({
        value: 'new',
        text: t('network.connections.txt-addQuery')
      });

      if (queryData.openFlag) {
        dropDownValue = queryData.id;
      }

      return (
        <div>
          <label>{t('network.connections.txt-queryName')}</label>
          <DropDownList
            className='query-name dropdown'
            list={displayList}
            required={true}
            onChange={this.handleQueryChange.bind(this, 'id')}
            value={dropDownValue} />

          {dropDownValue === 'new' &&
            <Input
              placeholder={t('network.connections.txt-enterQueryName')}
              className='query-name'
              maxLength='50'
              required={true}
              validate={{
                t: et
              }}
              onChange={this.handleQueryChange.bind(this, 'name')}
              value={queryData.inputName} />
          }

          {tempFilterData.length > 0 &&
            <div className='filter-group'>
              {
                tempFilterData.map(function(value, index) {
                  const filterData = [{
                    condition: value.condition,
                    query: value.query
                  }];

                  return (
                    <Filter
                      key={index}
                      activeTab={activeTab}
                      searchFields={searchFields}
                      logFields={logFields}
                      queryType='query'
                      filterData={filterData}
                      inline={false} />
                  )
                })
              }
            </div>
          }

          {tempMarkData.length > 0 &&
            <div className='filter-group'>
              {
                tempMarkData.map(function(value, index) {
                  const markData = [{
                    data: value.data
                  }];

                  return (
                    <Mark
                      key={index}
                      activeTab={activeTab}
                      searchFields={searchFields}
                      logFields={logFields}
                      queryType='query'
                      markData={markData}
                      inline={false} />
                  )
                })
              }
            </div>
          }
        </div>
      )
    }
  }
  render() {
    const {type} = this.props;
    const {info} = this.state;
    let titleText = '';

    if (type === 'open') {
      titleText = t('network.connections.txt-openQuery');
    } else if (type === 'save') {
      titleText = t('network.connections.txt-saveQuery');
    }

    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.closeDialog},
      confirm: {text: t('txt-confirm'), handler: this.handleQueryAction.bind(this, type)}
    };

    return (
      <ModalDialog
        id='queryDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        info={info}
        closeAction='cancel'>
        {this.displayQueryContent(type)}
      </ModalDialog>
    )
  }
}

QueryOpenSave.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired,
  activeTab: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired,
  filterData: PropTypes.array.isRequired,
  setFilterData: PropTypes.func.isRequired,
  setQueryData: PropTypes.func.isRequired,
  getSavedQuery: PropTypes.func.isRequired,
  closeDialog: PropTypes.func.isRequired
};

const HocQueryOpenSave = withLocale(QueryOpenSave);
export { QueryOpenSave, HocQueryOpenSave };