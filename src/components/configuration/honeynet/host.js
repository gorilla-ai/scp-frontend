import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import Moment from 'moment'
import _ from 'lodash'
import cx from 'classnames'

import ComboBox from 'react-ui/build/src/components/combobox'
import DataTable from 'react-ui/build/src/components/table'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import Popover from 'react-ui/build/src/components/popover'

import countryList from '../../common/country-list'
import {HocPagination as Pagination} from '../../common/pagination'
import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'
import {HocConfig as Config} from '../../common/configuration'
import RowMenu from '../../common/row-menu'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let et = null;

class Honeynet extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list: {
        country: []
      },
      search: {
        name: '',
        vpnName: '',
        IP: '',
        honeypot: '',
        status: 'All',
        groupName: []
      },
      honeynet: {
        dataFieldsArr: ['_menu', 'vpnName', 'name', /*'ip', 'hostname',*/ 'honeypot', 'groupName', 'attackCnt', 'status'/*, 'lastDataUpdDT'*/, 'enableUpd', 'isDeleted'/*, 'deletedDT'*/],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'vpnName',
          desc: false
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      sensor: {
        vpnName: '',
        name: '',
        ip: '',
        hostname: '',
        areaName: '',
        seatName: '',
        city: '',
        country: 'all',
        countryCode: '',
        latitude: '',
        longitude: '',
        enableUpd: 0,
        groupName: []
      },
      vpnName: '',
      modalOpen: false,
      openFilter: false,
      groupData: [],
      openNewGroupName: false,
      newGroupName: ''
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    this.ah = getInstance('chewbacca');
  }
  componentWillMount() {
    this.getCountryList()
    this.getHostData()
    this.getGroupData()
  }
  getCountryList = () => {
    let tempList = {...this.state.list};
    let countryDataArr = [];
    const country = countryList.getCountry();

    _.forEach(country, val => {
      countryDataArr.push({
        value: val.name + '/' + val['alpha-2'],
        text: val.name
      })
    });

    tempList.country = countryDataArr;

    this.setState({
      list: tempList
    });
  }
  getGroupData = () => {
    const {baseUrl} = this.props

    this.ah.one({
      url: `${baseUrl}/api/honeynet/host/group`,
      type: 'GET'
    })
    .then(data => {
      let groupData = _.map(data, el => {
        return {value:el, text:el}
      })

      this.setState({groupData})
    })
  }
  getHostData = () => {
    const {baseUrl} = this.props;
    const {search, honeynet} = this.state;
    let page = honeynet.currentPage;

    if (search.name || search.vpnName || search.IP || search.honeypot) {
      page = 1;
    }

    const dataObj = {
      sort: honeynet.sort.field,
      order: honeynet.sort.desc ? 'desc' : 'asc',
      page: page,
      pageSize: honeynet.pageSize
    };

    if (search.name) {
      dataObj.name = search.name;
    }

    if (search.vpnName) {
      dataObj.vpnName = search.vpnName;
    }

    if (search.IP) {
      dataObj.ip = search.IP;
    }

    if (search.honeypot) {
      dataObj.honeypot = search.honeypot;
    }

    if (search.status !== 'All') {
      dataObj.status = search.status;
    }

    if (search.groupName) {
      dataObj.groupName = search.groupName;
    }

    this.ah.one({
      url: `${baseUrl}/api/honeynet/host/_search`,
      data: JSON.stringify(dataObj),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      let tempHoneynet = {...honeynet};
      tempHoneynet.dataContent = data.rows;
      tempHoneynet.totalCount = data.counts;
      tempHoneynet.currentPage = page;

      let dataFields = {};
      honeynet.dataFieldsArr.forEach(tempData => {
        dataFields[tempData] = {
          label: tempData === '_menu' ? '' : t(`honeynetFields.${tempData}`),
          sortable: this.checkSortable(tempData),
          formatter: (value, allValue) => {
            if (tempData === 'vpnName' || tempData === 'name') {
              let formattedValue = value;

              if (value.length > 20) {
                formattedValue = value.substr(0, 20) + '...';
                return <a className='no-underline' onClick={helper.showPopupMsg.bind(this, value, t(`honeynetFields.${tempData}`))}>{formattedValue}</a>;
              } else {
                return <span>{value}</span>;
              }
            } else if (tempData === 'status') {
              let statusStyle = '';

              if (value === 'On-Line') {
                statusStyle = 'green';
                value = t('txt-online');
              } else if (value === 'Off-Line') {
                statusStyle = 'red';
                value = t('txt-offline');
              } else {
                statusStyle = 'orange';
              }
              // return <span className={statusStyle}>{value}</span>;
              return <span className={statusStyle}><i className='fg fg-recode'/></span>
            } else if (tempData === 'attackCnt') {
              let statusStyle = '';

              if (value > 0) {
                statusStyle = 'red';
              }
              return <span className={statusStyle}>{value}</span>;
            } else if (tempData === 'enableUpd') {
              let statusStyle = '';

              if (value === 0) {
                statusStyle = 'red';
                value = t('txt-disable');
              } else if (value === 1) {
                statusStyle = 'green';
                value = t('txt-enable');
              }
              // return <span className={statusStyle}>{value}</span>;
              return <div onMouseEnter={this.mouseEnter.bind(this, allValue.lastDataUpdDT)} onMouseLeave={this.mouseLeave.bind(this)}>
                <span className={statusStyle}><i className='fg fg-recode'/></span>
                </div>
            } else if (tempData === 'isDeleted') {
              let statusStyle = ''

              if (value === 0) {
                value = t('honeynet.keyStatus.txt-normal');
                statusStyle = 'green';
              } else if (value === 1) {
                value = t('honeynet.keyStatus.txt-wait');
                statusStyle = 'red';
              } else if (value === 2) {
                value = t('honeynet.keyStatus.txt-deleted');
                statusStyle = 'red';
              }
              return <span className={statusStyle}><i className='fg fg-recode'/></span>
            } else if (tempData === 'deletedDT') {
              return <span>{helper.getFormattedDate(value, 'local')}</span>;
            } else if (tempData === '_menu') {
              return <RowMenu 
                      page='pot'
                      active={value}
                      targetEdit={allValue}
                      targetDelete={allValue.vpnName}
                      text={{
                        edit: t('txt-edit'),
                        delete: t('txt-delete')
                      }}
                      onEdit={this.addSensor}
                      onDelete={this.openDeleteHostModal} />
              // return (
              //   <div className='add-padding'>
              //     <i className='c-link fg fg-edit' onClick={this.addSensor.bind(this, allValue)} title={t('honeynet.txt-editSensor')}></i>
              //     {allValue.isDeleted === 0 &&
              //       <i className='c-link fg fg-trashcan' onClick={this.openDeleteHostModal.bind(this, allValue.vpnName)} title={t('honeynet.txt-deleteSensor')}></i>
              //     }
              //   </div>
              // )
            } else if (tempData === 'groupName') {
              return <span>{value.toString()}</span>
            } else {
              return <span>{value}</span>;
            }
          }
        };
      })

      tempHoneynet.dataFields = dataFields;

      this.setState({
        honeynet: tempHoneynet
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  mouseEnter(time, evt) {
    Popover.openId('popup-id', evt, t('honeynetFields.lastDataUpdDT') + ' ' + helper.getFormattedDate(time, 'local'))
  }
  mouseLeave() {
    Popover.closeId('popup-id')
  }
  handleRowMouseOver(value, allValue, evt) {
    let tmp = {...this.state.honeynet}

    tmp['dataContent'] = _.map(tmp['dataContent'], el => {
      return {
        ...el,
        _menu: el.vpnName === allValue.vpnName ? true : false
      }
    })

    this.setState({honeynet: tmp})
  }
  checkSortable = (field) => {
    const unSortableFields = ['name', '_menu'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  handleTableSort = (value) => {
    let tempHoneynet = {...this.state.honeynet};
    tempHoneynet.sort.field = value.field;
    tempHoneynet.sort.desc = !tempHoneynet.sort.desc;

    this.setState({
      honeynet: tempHoneynet
    }, () => {
      this.getHostData();
    });
  }
  handlePaginationChange = (type, value) => {
    let tempHoneynet = {...this.state.honeynet};
    tempHoneynet[type] = value;

    if (type === 'pageSize') {
      tempHoneynet.currentPage = 1;
    }

    this.setState({
      honeynet: tempHoneynet
    }, () => {
      this.getHostData();
    });
  }
  handleDataChange = (formType, type, value) => {
    const {search, sensor} = this.state;
    let tempSearch = {...search};
    let tempSensor = {...sensor};

    if (formType === 'search') {
      tempSearch[type] = value;

      this.setState({
        search: tempSearch
      });
    } else if (formType === 'sensor') {
      tempSensor[type] = value;

      this.setState({
        sensor: tempSensor
      });
    } 
  }
  displayAddSensor = () => {
    const {list, sensor, groupData} = this.state;

    return (
      <div>
        <div className='content'>
          <label htmlFor='sensorVPNname'>{t('honeynetFields.vpnName')}</label>
          <Input
            id='sensorVPNname'
            className='add'
            readOnly={true}
            value={sensor.vpnName}
            onChange={this.handleDataChange.bind(this, 'sensor', 'vpnName')} />

          <label htmlFor='sensorIP'>{t('honeynetFields.ip')}</label>
          <Input
            id='sensorIP'
            className='add'
            readOnly={true}
            value={sensor.ip}
            onChange={this.handleDataChange.bind(this, 'sensor', 'ip')} />

          <label htmlFor='sensorName'>{t('honeynetFields.name')}</label>
          <Input
            id='sensorName'
            className='add'
            value={sensor.name}
            onChange={this.handleDataChange.bind(this, 'sensor', 'name')} />

          <label htmlFor='sensorAreaName'>{t('sensorFields.areaName')}</label>
          <Input
            id='sensorAreaName'
            className='add'
            value={sensor.areaName}
            onChange={this.handleDataChange.bind(this, 'sensor', 'areaName')} />

          <label htmlFor='sensorSeatName'>{t('sensorFields.seatName')}</label>
          <Input
            id='sensorSeatName'
            className='add'
            value={sensor.seatName}
            onChange={this.handleDataChange.bind(this, 'sensor', 'seatName')} />

          <label htmlFor='sensorCity'>{t('sensorFields.city')}</label>
          <Input
            id='sensorCity'
            className='add'
            value={sensor.city}
            onChange={this.handleDataChange.bind(this, 'sensor', 'city')} />

          <label htmlFor='sensorCountry'>{t('sensorFields.country')}</label>
          <DropDownList
            id='sensorCountry'
            className='add'
            list={list.country}
            required={true}
            onChange={this.handleDataChange.bind(this, 'sensor', 'country')}
            value={sensor.country}/>

          <label htmlFor='sensorLatitude'>{t('sensorFields.latitude')}</label>
          <Input
            id='sensorLatitude'
            className='add'
            value={sensor.latitude}
            onChange={this.handleDataChange.bind(this, 'sensor', 'latitude')} />

          <label htmlFor='sensorLongitude'>{t('sensorFields.longitude')}</label>
          <Input
            id='sensorLongitude'
            className='add'
            value={sensor.longitude}
            onChange={this.handleDataChange.bind(this, 'sensor', 'longitude')} />

          <label htmlFor='sensorUpdateData'>{t('honeynetFields.enableUpd')}</label>
          <DropDownList
            id='sensorUpdateData'
            className='add'
            list={[
              {
                value: 0,
                text: t('txt-disable')
              },
              {
                value: 1,
                text: t('txt-enable')
              }
            ]}
            required={true}
            defaultValue='0'
            onChange={this.handleDataChange.bind(this, 'sensor', 'enableUpd')}
            value={sensor.enableUpd}/>
          <label htmlFor='groupData'>{t('honeynetFields.groupName')}</label>
          <div className='host-cfg'>
            <ComboBox
              className='host-cfg'
              list={groupData}
              multiSelect={{enabled: true, toggleAll: true}}
              search={{enabled: true}}
              info={(list)=>{
                  return list.length <=0 ? 'No Results Found' : ''
              }}
              onChange={this.handleDataChange.bind(this, 'sensor', 'groupName')}
              value={sensor.groupName}/>
            <i className='c-link fg fg-add' title={t('honeynet.txt-addGroupName')} onClick={this.switchAddGroupName.bind(this)} />
          </div>
        </div>
      </div>
    )
  }
  handleGroupName(value) {
    this.setState({newGroupName: value})
  }
  switchAddGroupName() {
    const {openNewGroupName} = this.state
    openNewGroupName ? this.setState({openNewGroupName: false, newGroupName: ''}) : this.setState({openNewGroupName: true})
  }
  handleAddGroupName() {
    let {newGroupName, groupData, sensor} = this.state
    groupData.push({value:newGroupName, text:newGroupName})
    sensor.groupName.push(newGroupName)
    this.setState({groupData, sensor}, () => this.switchAddGroupName())
  }
  addGroupName() {
    const {newGroupName} = this.state
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.switchAddGroupName.bind(this)},
      confirm: {text: t('txt-confirm'), handler: this.handleAddGroupName.bind(this)}
    }

    return (
    <ModalDialog className='modal-dialog' title={t('honeynet.txt-addGroupName')} draggable={true} global={true} actions={actions} closeAction='cancel'>
      <Input className='add' value={newGroupName} onChange={this.handleGroupName.bind(this)} />
    </ModalDialog>
    )
  }
  addSensor = (allValue) => {
    let tempSensor = {...this.state.sensor};

    if (allValue.vpnName) {
      tempSensor = {...allValue};
      tempSensor.country = tempSensor.country + '/' + tempSensor.countryCode;
    }

    this.setState({
      sensor: tempSensor,
      modalOpen: true
    });
  }
  getDeleteHostContent = (vpnName) => {
    if (vpnName) {
      this.setState({
        vpnName
      });
    }

    return (
      <div className='content delete'>
        <span>{t('honeynet.txt-deleteHostMsg')}: {vpnName}?</span>
      </div>
    )
  }
  openDeleteHostModal = (vpnName) => {
    PopupDialog.prompt({
      title: t('honeynet.txt-deleteHost'),
      id: 'modalWindow',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteHostContent(vpnName),
      act: (confirmed) => {
        if (confirmed) {
          this.deleteHost();
        }
      }
    });
  }
  deleteHost = () => {
    const {baseUrl} = this.props;
    const {vpnName} = this.state;
    const url = `${baseUrl}/api/honeynet/host/${vpnName}`;

    this.ah.one({
      url,
      type: 'DELETE'
    })
    .then(data => {
      if (data) {
        this.resetDataTable();
      } else {
        helper.showPopupMsg('', t('txt-error'), err.message);
      }
      return null;
    });
  }
  handleSensorConfirm = (data) => {
    const {baseUrl} = this.props;
    const {sensor} = this.state;
    const dataObj = {
      vpnName: sensor.vpnName,
      name: sensor.name,
      ip: sensor.vpnIp,
      areaName: sensor.areaName,
      seatName: sensor.seatName,
      city: sensor.city,
      latitude: sensor.latitude,
      longitude: sensor.longitude,
      enableUpd: Number(sensor.enableUpd),
      groupName: sensor.groupName
    };

    if (sensor.country) {
      dataObj.country = sensor.country.slice(0, -3);
      dataObj.countryCode = sensor.country.slice(-2);
    }

    this.ah.one({
      url: `${baseUrl}/api/honeynet/host`,
      data: JSON.stringify(dataObj),
      type: 'PATCH',
      contentType: 'text/plain'
    })
    .then(data => {
      this.closeDialog();
      this.getHostData();
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  closeDialog = () => {
    this.setState({
      modalOpen: false
    });
  }
  modalDialog = () => {
    const titleText = t('honeynet.txt-editSensor');
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeDialog.bind(this)},
      confirm: {text: t('txt-confirm'), handler: this.handleSensorConfirm.bind(this)}
    };

    return (
      <ModalDialog
        id='hostModalDialog'
        className='modal-dialog'
        title={titleText}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.displayAddSensor()}
      </ModalDialog>
    )
  }
  setFilter(flag) {
    this.setState({openFilter: flag})
  }
  clearFilter() {
    const clear = { name: '', vpnName: '', IP: '', honeypot: '', status: 'All' }
    this.setState({search: clear})
  }
  renderFilter() {
    const {search, openFilter, groupData} = this.state

    return (
      <div className={cx('main-filter', {'active': openFilter})}>
        <i className='fg fg-close' onClick={this.setFilter.bind(this, false)} title={t('txt-close')}></i>
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <label htmlFor='honeypotName'>{t('honeynetFields.name')}</label>
            <Input id='honeypotName' onChange={this.handleDataChange.bind(this, 'search', 'name')} value={search.name} />
          </div>
          <div className='group'>
            <label htmlFor='honeypotVPNname' className='first-label'>{t('honeynetFields.vpnName')}</label>
            <Input id='honeypotVPNname' onChange={this.handleDataChange.bind(this, 'search', 'vpnName')} value={search.vpnName} />
          </div>
          <div className='group'>
            <label htmlFor='honeypotIP'>{t('honeynetFields.ip')}</label>
            <Input id='honeypotIP' onChange={this.handleDataChange.bind(this, 'search', 'IP')} value={search.IP} />
          </div>
          <div className='group'>
            <label htmlFor='honeypotPot'>{t('honeynetFields.honeypot')}</label>
            <Input id='honeypotPot' onChange={this.handleDataChange.bind(this, 'search', 'honeypot')} value={search.honeypot} />
          </div>
          <div className='group'>
            <label htmlFor='honeypotStatus'>{t('honeynetFields.status')}</label>
            <DropDownList id='honeypotStatus'
              list={[
                {
                  value: 'All',
                  text: t('txt-all')
                },
                {
                  value: 'On-Line',
                  text: t('txt-online')
                },
                {
                  value: 'Off-Line',
                  text: t('txt-offline')
                }
              ]}
              required={true}
              onChange={this.handleDataChange.bind(this, 'search', 'status')}
              value={search.status} />
          </div>
          <div className='group'>
            <label htmlFor='honeypotGroup'>{t('honeynetFields.groupName')}</label>
            <ComboBox list={groupData} multiSelect={{enabled: true, toggleAll: true}}
              search={{enabled: true}} info={(list)=>{return list.length <=0 ? 'No Results Found' : ''}}
              onChange={this.handleDataChange.bind(this, 'search', 'groupName')}
              value={search.groupName}/>
          </div>
        </div>
        <div className='button-group'>
          <button className='filter' onClick={this.getHostData}>{t('txt-filter')}</button>
          <button className='clear' onClick={this.clearFilter.bind(this)}>{t('txt-clear')}</button>
        </div>
      </div>
    )
  }
  render() {
    const {baseUrl, contextRoot, language, session} = this.props;
    const {honeynet, modalOpen, openFilter, openNewGroupName} = this.state;

    return (
      <div>
        { modalOpen && this.modalDialog() }
        { openNewGroupName && this.addGroupName() }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button onClick={this.getHostData} title={t('txt-refresh')}><i className='fg fg-update'></i></button>
            <button onClick={this.setFilter.bind(this, !openFilter)} className={cx('last', {'active': openFilter})} title={t('txt-filter')}><i className='fg fg-filter'></i></button>
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

            <div className='main-content'>
              <div className='table-content'>
                <div className='table normal'>
                  <DataTable
                    className='main-table'
                    fields={honeynet.dataFields}
                    data={honeynet.dataContent}
                    onRowMouseOver={this.handleRowMouseOver.bind(this)}
                    sort={honeynet.dataContent.length === 0 ? {} : honeynet.sort}
                    onSort={this.handleTableSort} />
                </div>
                <footer>
                  <Pagination
                    totalCount={honeynet.totalCount}
                    pageSize={honeynet.pageSize}
                    currentPage={honeynet.currentPage}
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

Honeynet.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  contextRoot: PropTypes.string.isRequired
};

const HocHoneynet = withLocale(Honeynet);
export { Honeynet, HocHoneynet };