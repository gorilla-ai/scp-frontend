import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import queryString from 'query-string'
import cx from 'classnames'
import _ from 'lodash'

import Gis from 'react-gis'

import {downloadWithForm} from 'react-ui/build/src/utils/download'
import FileInput from 'react-ui/build/src/components/file-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import Autocomplete from '@material-ui/lab/Autocomplete'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Switch from '@material-ui/core/Switch'
import TextareaAutosize from '@material-ui/core/TextareaAutosize'
import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../common/context'
import constants from '../constant/constant-incidnet'
import helper from '../common/helper'
import Manage from '../configuration/topology/manage'
import SelecTableContent from '../common/selectable-content'
import SocConfig from '../common/soc-configuration'
import TableContent from '../common/table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;
let f = null;
let et = null;
let it = null;

/**
 * Settings - IncidentDevice
 * @class
 * @author Kenneth Chiao <kennethchiao@telmediatech.com>
 * @summary A react component to show the Config IncidentDevice page
 */
class IncidentDeviceStep extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    et = global.chewbaccaI18n.getFixedT(null, 'errors');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');

    this.state = {
      activeContent: 'tableList', //'tableList', 'viewDevice' or 'editDevice'
      showFilter: false,
      dataFromEdgeDevice: false,
      currentIncidentDeviceData: {},
      originalIncidentDeviceData: {},
      deviceSearch: {
        keyword: ''
      },
      setType:null,
      accountType:constants.soc.LIMIT_ACCOUNT,
      unitList: [{
        value: '',
        text: ''
      }],
      departmentList:[],
      sendCheck: {
        sendStatus: false,
      },
      openManage: false,
      ownerType: 'existing',
      activeSteps: 1,
      edgeList:[],
      healthStatistic: {
        dataFieldsArr: ['select', 'deviceName', 'frequency', 'reason', 'protectTypeInfo', 'incidentUnitDTO.name', 'incidentUnitDTO.level'],
        // dataFieldsArr: ['select', 'deviceId', 'deviceName', 'frequency', 'reason', 'protectTypeInfo', 'incidentUnitDTO.name', 'incidentUnitDTO.level'],
        dataFields: {},
        dataContent: [],
        rowIdField: [],
        sort: {
          field: 'frequency',
          desc: true
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 1000,
        edgeItem: '',
        deviceItem:{
          id:'',
          value:'',
          text:'',
        },
        usedDeviceIdList: [],
        sendDataDeviceList: [],
        selected: {
          ids: [],
          eventInfo: {
            before: [],
            id: null,
            selected: true
          }
        },
        info: {
          id: '',
          unitId: '',
          deviceId: '',
          deviceName: '',
          deviceCompany: '',
          unitOid: '',
          unitName: '',
          unitLevel: 'A',
          frequency: null,
          protectType: '0',
          protectTypeInfo: '',
          note: '',
          reason:'',
          updateDttm: ''
        }
      },
      incidentDevice: {
        dataFieldsArr: ['incidentUnitDTO.isGovernment', 'deviceName', 'protectTypeInfo', 'incidentUnitDTO.name', 'incidentUnitDTO.level', 'frequency', 'updateDttm', '_menu'],
        // dataFieldsArr: ['deviceId', 'deviceName', 'protectTypeInfo', 'incidentUnitDTO.name', 'incidentUnitDTO.level', 'frequency', 'updateDttm', '_menu'],
        dataFields: {},
        dataContent: [],
        sort: {
          field: 'frequency',
          desc: true
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 20,
        edgeItem: '',
        deviceItem:{
          id:'',
          value:'',
          text:''
        },
        usedDeviceIdList: [],
        info: {
          id: '',
          unitId: '',
          deviceId: '',
          deviceName: '',
          deviceCompany: '',
          unitOid: '',
          unitName: '',
          unitLevel: 'A',
          frequency: null,
          protectType: '0',
          protectTypeInfo: '',
          note: '',
          reason:'',
          updateDttm: '',
          selectUnitObject: {},
        }
      },
      unit: {
        id: '',
        oid: '',
        name: '',
        level: 'A',
        industryType: '1',
        isUse: false,
        isGovernment:false,
        abbreviation: '',
        relatedAccountList: []
      },
      originalDefenseRangeData: {},
      defenseRange: {
        list: [],
        value: []
      },
      slaveList: [],
      isSlave: ''
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    const {baseUrl, locale, sessionRights} = this.context;

    helper.getPrivilegesInfo(sessionRights, 'soc', locale);
    helper.inactivityTime(baseUrl, locale);

    this.checkAccountType();
    this.getUnitList();
    this.getSendCheck();
  }
  componentWillUnmount() {
    helper.clearTimer();
  }
  comparer(otherArray) {
    return function(current) {
      return otherArray.filter(function(other) {
        return other.value === current.value && other.display === current.display
      }).length === 0;
    }
  }
  checkUnitOrgFromDepartment = () => {
    const {baseUrl, session} = this.context;
    const {activeContent, dataFromEdgeDevice, incidentDevice, departmentList, unitList, unit,edgeList, accountType, activeSteps, ownerType} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/department/_tree`,
      type: 'GET'
    })
    .then(data => {
      let  departmentList = [];

      _.forEach(data, val => {
        helper.floorPlanRecursive(val, obj => {
          departmentList.push({
            id:obj.id,
            name: obj.name,
            title:obj.name,
            value:obj.id,
            text: obj.name,
          });
        });
      })

      this.setState({
        departmentList:departmentList
      });
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  checkAccountType = () => {
    const {baseUrl, session} = this.context;
    let requestData = {
      account:session.accountId
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/unit/limit/_check`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        const {incidentDevice} = this.state;
        let tempDeviceObj = incidentDevice;

        if (data.rt.isLimitType === constants.soc.LIMIT_ACCOUNT) {
          tempDeviceObj.dataFieldsArr = ['incidentUnitDTO.isGovernment', 'deviceName', 'protectTypeInfo', 'incidentUnitDTO.name', 'incidentUnitDTO.level', 'frequency', 'updateDttm'];

          this.setState({
            accountType: constants.soc.LIMIT_ACCOUNT,
            incidentDevice:tempDeviceObj
          }, () => {
            this.getDeviceData();
          });
        } else if (data.rt.isLimitType === constants.soc.NONE_LIMIT_ACCOUNT) {
          this.setState({
            accountType: constants.soc.NONE_LIMIT_ACCOUNT
          }, () => {
            this.getDeviceData();
          });
        } else {
          this.setState({
            accountType: constants.soc.CHECK_ERROR
          }, () => {
            this.getDeviceData();
          });
        }
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getSendCheck = () => {
    const {baseUrl, contextRoot} = this.context;
    let tempSendCheck = {...this.state.sendCheck};

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/device/_status`,
      type: 'GET'
    })
    .then(data => {
      if (data) {
        tempSendCheck.sendStatus = data.rt;

        this.setState({
          sendCheck: tempSendCheck
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  getDeviceUsableList = (type, allValue) => {
    const {baseUrl, contextRoot, session} = this.context;
    const {defenseRange} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/soc/deviceSlave/usable`,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    }).then(data => {
      if (data) {
        let tempDefenseRange = {...defenseRange};
        tempDefenseRange.list = data.rows;
        
        this.setState({
          defenseRange: tempDefenseRange
        }, () => {
          if (type === 'add') {
            this.toggleContent('addDevice');
          } else if (type === 'edit') {
            this.getDeviceSlave(allValue, 'load');
          }
        });
      }
    }).catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getDeviceSlave = (allValue, type) => {
    const {baseUrl, contextRoot,} = this.context;
    const {defenseRange} = this.state;

    this.ah.one({
      url: `${baseUrl}/api/soc/deviceSlave?masterId=${allValue.id}`,
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).then(data => {
      if (data) {
        let tempDefenseRange = {...defenseRange};

        if (type === 'load') {
          tempDefenseRange.list = _.concat(data.rows, defenseRange.list);
        }
        
        tempDefenseRange.value = _.map(data.rows, val => {
          return {
            text: val.deviceName + ' - ' + val.incidentUnitDTO.name,
            value: val.id
          };
        });
        
        this.setState({
          originalDefenseRangeData: _.cloneDeep(tempDefenseRange),
          defenseRange: tempDefenseRange
        }, () => {
          if (type === 'load') {
            this.toggleContent('viewDevice', allValue);
          } else if (type === 'submit') {
            this.toggleContent('cancel');
          }
        });
      }
    }).catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  /**
   * Get and set Incident Device table data
   * @method
   * @param {string} fromSearch - option for the 'search'
   */
  getDeviceData = (fromSearch) => {
    const {baseUrl, session, contextRoot} = this.context;
    const {deviceSearch, incidentDevice, edgeList} = this.state;
    const url = `${baseUrl}/api/soc/device/_search?page=${incidentDevice.currentPage}&pageSize=${incidentDevice.pageSize}`;
    let requestData = {};

    if (deviceSearch.keyword) {
      requestData.keyword = deviceSearch.keyword;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    }).then(data => {
      if (data) {
        let tempEdge = {...incidentDevice};
        tempEdge.dataContent = data.rows;
        tempEdge.totalCount = data.counts;
        tempEdge.currentPage = fromSearch === 'search' ? 1 : incidentDevice.currentPage;

        let usedDeviceIdList = [];
        _.forEach(tempEdge.dataContent, deviceItem => {
          let tmp = {
            deviceId: deviceItem.deviceId
          };
          usedDeviceIdList.push(tmp);
        })

        this.setState({
          usedDeviceIdList: usedDeviceIdList
        });

        let dataFields = {};
        incidentDevice.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: tempData === '_menu' ? '' : f(`incidentFields.${tempData}`),
            sortable: this.checkSortable(tempData),
            formatter: (value, allValue, i) => {
              if (tempData === 'updateDttm') {
                return <span>{helper.getFormattedDate(value, 'local')}</span>
              } else if (tempData === '_menu') {
                return (
                  <div className='table-menu menu active'>
                    <i className='fg fg-edit' onClick={this.getDeviceUsableList.bind(this, 'edit', allValue)} title={t('txt-view')} />
                    <i className='fg fg-trashcan' onClick={this.openDeleteMenu.bind(this, allValue)} title={t('txt-delete')} />
                  </div>
                )
              } else if (tempData === 'incidentUnitDTO.isGovernment') {
                if (value) {
                  return <span style={{color:'#f13a56'}}>{this.checkDefault(value)}</span>
                } else {
                  return <span>{this.checkDefault(value)}</span>
                }
              } else {
                return <span>{value}</span>
              }
            }
          };
        });

        tempEdge.dataFields = dataFields;

        this.setState({
          incidentDevice: tempEdge
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set Incident Device table data before send to FTP
   * @method
   * @param {string} fromSearch - option for the 'search'
   */
  setupHealthStatisticData = (fromSearch) => {
    const {baseUrl, contextRoot, session} = this.context;
    const {deviceSearch, healthStatistic, slaveList} = this.state;
    const url = `${baseUrl}/api/soc/device/_search?page=${healthStatistic.currentPage}&pageSize=${healthStatistic.pageSize}`;
    let requestData = {};

    if (deviceSearch.keyword) {
      requestData.keyword = deviceSearch.keyword;
    }

    if (this.state.setType === 'send') {
      requestData.isGovernment = true;
    }

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let tempStatistic = {...healthStatistic};

        if (this.state.setType === 'send' && data.counts === 0) {
          helper.showPopupMsg(it('txt-isGovernmentNotFound'), t('txt-help'), );
          return null;
        }

        tempStatistic.dataContent = data.rows;
        tempStatistic.totalCount = data.counts;
        tempStatistic.currentPage = fromSearch === 'search' ? 1 : healthStatistic.currentPage;

        let sendDeviceDateList = [];
        let usedDeviceIdList = [];

        _.forEach(tempStatistic.dataContent, deviceItem => {
          deviceItem.select = true;

          let tempSend = {
            id: deviceItem.id,
            deviceId: deviceItem.deviceId,
            frequency: deviceItem.frequency,
            reason: deviceItem.reason
          };
          sendDeviceDateList.push(tempSend);

          let tmp = {
            deviceId: deviceItem.deviceId
          };
          usedDeviceIdList.push(tmp);
        })

        tempStatistic.usedDeviceIdList = usedDeviceIdList;

        this.setState({
          usedDeviceIdList: usedDeviceIdList
        });

        tempStatistic.sendDataDeviceList = sendDeviceDateList;

        let dataFields = {};

        if (this.state.setType === 'download') {
          tempStatistic.dataFieldsArr = ['select', 'deviceId', 'deviceName', 'frequency', 'protectTypeInfo', 'incidentUnitDTO.name', 'incidentUnitDTO.level'];
        } else {
          tempStatistic.dataFieldsArr = ['select', 'deviceId', 'deviceName', 'frequency', 'reason', 'protectTypeInfo', 'incidentUnitDTO.name', 'incidentUnitDTO.level'];
        }

        tempStatistic.dataFieldsArr.forEach(tempData => {
          dataFields[tempData] = {
            label: tempData === '_menu' ? '' : f(`incidentFields.${tempData}`),
            sortable: this.checkSortable(tempData),
            formatter: (value, allValue, i) => {
              if (tempData === 'select') {
                return (
                  <Checkbox
                    id={allValue.deviceId}
                    className='checkbox-ui'
                    name='select'
                    checked={value}
                    onChange={this.handleSendDataChangeMui.bind(this, allValue.deviceId)}
                    color='primary'
                    disabled={_.includes(slaveList, allValue.id)} />
                )
              }

              if (tempData === 'frequency') {
                return (
                  <TextField
                    id={allValue.deviceId + '_fre'}
                    fullWidth={true}
                    size='small'
                    name='frequency'
                    onChange={this.handleSendDataChangeMui.bind(this, allValue.deviceId)}
                    value={value}
                    disabled={!allValue.select || _.includes(slaveList, allValue.id)} />
                )
              } else if (tempData === 'reason') {
                if (allValue.frequency === 0) {
                  return (
                    <TextField
                      id={allValue.deviceId + '_reason'}
                      fullWidth={true}
                      size='small'
                      name='reason'
                      onChange={this.handleSendDataChangeMui.bind(this, allValue.deviceId)}
                      value={value}
                      disabled={!allValue.select} />
                  )
                } else {
                  return <span />
                }
              } else if (tempData === 'updateDttm') {
                return <span>{helper.getFormattedDate(value, 'local')}</span>
              } else {
                return <span>{value}</span>
              }
            }
          };
        });

        tempStatistic.dataFields = dataFields;

        this.setState({
          healthStatistic: tempStatistic,
          activeContent: 'sendList'
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  checkDefault = (value) => {
    let info = it('unit.txt-isNotDefault');

    if (value) {
      info = it('unit.txt-isDefault');
    }
    return info;
  }
  getUnitList = () => {
    const {baseUrl, contextRoot, session} = this.context;
    const url = `${baseUrl}/api/soc/unit/_search`;
    let requestData = {
      account:session.accountId
    };

    this.ah.one({
      url,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'text/plain'
    })
    .then(data => {
      if (data) {
        let list = [];

        _.forEach(data.rows, val => {
          let tmp = {
            value: val.id,
            text: val.name
          };
          list.push(tmp);
        });

        this.setState({
          unitList: list
        }, () => {
          this.checkUnitOrgFromDepartment();
        });
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  handleCloseManage = () => {
    this.toggleManageDialog();
  }
  handleComboBoxChange = (event, value) => {
    let tempDefenseRange = {...this.state.defenseRange};
    tempDefenseRange.value = value;

    this.setState({
      defenseRange: tempDefenseRange
    });
  }
  displayDefenseList = (val) => {
    return <span>{val.text}</span>
  }
  checkDeviceSlave = (id) => {
    const {baseUrl} = this.context;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/deviceSlave/isSlave?id=${id}`,
      type: 'GET'
    })
    .then(data => {
      if (data.ret === 0) {
        this.setState({
          isSlave: data.rt
        }, () => {
          this.toggleContent('editDevice');
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  displayEditDeviceContentWithStep = () => {
    const {activeContent, dataFromEdgeDevice, incidentDevice, departmentList, unitList, unit,edgeList, accountType, activeSteps, ownerType, defenseRange, isSlave} = this.state;
    const stepTitle = [t('edge-management.txt-basicInfo'), it('txt-protect-type') ,it('txt-unit-select'), it('txt-defense-range'), it('txt-device-comment')];
    let tempDefenseRangeList = _.cloneDeep(defenseRange.list);

    if (activeContent === 'editDevice') {
      let index = '';

      _.forEach(defenseRange.list, (val, i) => {
        if (val.id === incidentDevice.info.id) {
          index = i;
          return;
        }
      })

      if (index > -1) {
        tempDefenseRangeList.splice(index, 1);
      }
    }

    return (
      <div className='main-content basic-form'>
        <header className='main-header'>{it('txt-incident-device')}</header>
        <div className='content-header-btns'>
          {activeContent === 'viewDevice' &&
            <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>
          }
          {activeContent === 'viewDevice' &&
            <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.checkDeviceSlave.bind(this, incidentDevice.info.id)}>{t('txt-edit')}</Button>
          }
        </div>

        {activeContent === 'viewDevice' &&
          <React.Fragment>
            <div className='form-group steps-address'>
              <header>
                <div className='text'>{t('edge-management.txt-basicInfo')}</div>

                {activeContent !== 'addDevice' &&
                  <span className='msg'>{t('edge-management.txt-lastUpdateTime')} {helper.getFormattedDate(incidentDevice.info.updateDttm, 'local')}</span>
                }
              </header>

              {accountType !== constants.soc.LIMIT_ACCOUNT &&
                <div className='group'>
                  <label htmlFor='edgeDevice'>{it('device.txt-edgeDevice')}</label>
                  <TextField
                    id='edgeDevice'
                    name='edgeDevice'
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    select
                    onChange={this.handleDataChangeMui}
                    value={incidentDevice.edgeItem}
                    disabled={activeContent === 'viewDevice'}>
                    {_.map(edgeList, el => {
                      return <MenuItem value={el}>{el.agentName || el.agentId}</MenuItem>
                    })}
                  </TextField>
                </div>
              }

              <div className='group'>
                <label htmlFor='deviceId'>{accountType !== constants.soc.LIMIT_ACCOUNT ? it('device.txt-id') : it('device.txt-id-limit')}</label>
                <TextField
                  id='deviceId'
                  name='deviceId'
                  variant='outlined'
                  fullWidth={true}
                  size='small'
                  onChange={this.handleDataChangeMui}
                  value={incidentDevice.info.deviceId}
                  error={!(incidentDevice.info.deviceId || '')}
                  required
                  helperText={it('txt-required')}
                  disabled={activeContent === 'viewDevice' || dataFromEdgeDevice} />
              </div>
              <div className='group'>
                <label htmlFor='deviceName'>{it('device.txt-name')}</label>
                <TextField
                  id='deviceName'
                  name='deviceName'
                  variant='outlined'
                  fullWidth={true}
                  size='small'
                  onChange={this.handleDataChangeMui}
                  value={incidentDevice.info.deviceName}
                  error={!(incidentDevice.info.deviceName || '')}
                  required
                  helperText={it('txt-required')}
                  disabled={activeContent === 'viewDevice'} />
              </div>
              <div className='group'>
                <label htmlFor='deviceCompany'>{it('device.txt-company')}</label>
                <TextField
                  id='deviceCompany'
                  name='deviceCompany'
                  error={!(incidentDevice.info.deviceCompany || '')}
                  helperText={it('txt-required')}
                  required
                  variant='outlined'
                  fullWidth={true}
                  size='small'
                  onChange={this.handleDataChangeMui}
                  value={incidentDevice.info.deviceCompany}
                  disabled={activeContent === 'viewDevice' || dataFromEdgeDevice} />
              </div>
            </div>

            <div className='form-group steps-host'>
              <header>{it('txt-protect-type')}</header>
              <div className='group'>
                <label htmlFor='protectType'>{it('txt-protect-type')}</label>
                <TextField
                  id='protectType'
                  name='protectType'
                  error={!(incidentDevice.info.protectType || '')}
                  required
                  helperText={it('txt-required')}
                  variant='outlined'
                  fullWidth={true}
                  size='small'
                  select
                  onChange={this.handleDataChangeMui}
                  value={incidentDevice.info.protectType}
                  disabled={activeContent === 'viewDevice'}>
                  {
                    _.map(_.range(0, 7), el => {
                      return <MenuItem value={el.toString()}>{it(`protectType.${el}`)}</MenuItem>
                    })
                  }
                </TextField>
              </div>

              {incidentDevice.info.protectType === '6' &&
                <div className='group'>
                  <label htmlFor='protectTypeInfo'>{it('txt-protect-type-info')}</label>
                  <TextField
                    id='protectTypeInfo'
                    name='protectTypeInfo'
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    onChange={this.handleDataChangeMui}
                    value={incidentDevice.info.protectTypeInfo}
                    disabled={activeContent === 'viewDevice'} />
                </div>
              }
            </div>
            <div className='form-group steps-owner'>
              <header>{it('txt-unit-select')}</header>
                <div className='group'>
                <label htmlFor='unitId'>{it('unit.txt-name')}</label>
                <Autocomplete
                  id='unitId'
                  name='unitId'
                  required
                  helperText={it('txt-required')}
                  variant='outlined'
                  fullWidth={true}
                  size='small'
                  options={departmentList}
                  select
                  // onChange={this.onUnitChange}
                  value={incidentDevice.info.selectUnitObject}
                  getOptionLabel={(option) => option.text}
                  disabled={activeContent === 'viewDevice'}
                  renderInput={(params) =>
                  <TextField
                    {...params}
                    required
                    error={!(incidentDevice.info.selectUnitObject ? incidentDevice.info.selectUnitObject.value : '' || '')}
                    helperText={it('txt-required')}
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    InputProps={{...params.InputProps, type: 'search'}}
                  />} />
              </div>
            </div>

            <div className='form-group steps-owner'>
              <header>{it('txt-defense-range')}</header>
              <div className='group'>
                <div className='flex-item'>{defenseRange.value.map(this.displayDefenseList)}</div>
              </div>
            </div>

            <div className='form-group steps-host'>
              <header>{it('txt-note')} ({t('txt-memoMaxLength')})</header>
              <div className='group full'>
                <label htmlFor='note'>{it('txt-note')} ({t('txt-memoMaxLength')})</label>
                <TextareaAutosize
                  id='note'
                  name='note'
                  className='textarea-autosize'
                  rows={4}
                  maxLength={250}
                  value={incidentDevice.info.note}
                  onChange={this.handleDataChangeMui}
                  disabled={activeContent === 'viewDevice'} />
              </div>
            </div>
          </React.Fragment>
        }

        {activeContent === 'editDevice' &&
          <React.Fragment>
            <div className='steps-indicator'>
              {stepTitle.map(this.showUnitStepIcon)}
            </div>

            {activeSteps === 1 &&
              <div className='form-group steps-address'>
                <header>
                  <div className='text'>{t('edge-management.txt-basicInfo')}</div>

                  {activeContent !== 'addDevice' &&
                    <span className='msg'>{t('edge-management.txt-lastUpdateTime')} {helper.getFormattedDate(incidentDevice.info.updateDttm, 'local')}</span>
                  }
                </header>

                {accountType !== constants.soc.LIMIT_ACCOUNT &&
                  <div className='group'>
                    <label htmlFor='edgeDevice'>{it('device.txt-edgeDevice')}</label>
                    <TextField
                      id='edgeDevice'
                      name='edgeDevice'
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      select
                      onChange={this.handleDataChangeMui}
                      value={incidentDevice.edgeItem}
                      disabled={activeContent === 'viewDevice'}>
                      {_.map(edgeList, el => {
                        return <MenuItem value={el}>{el.agentName}</MenuItem>
                      })}
                    </TextField>
                  </div>
                }
                <div className='group'>
                  <label htmlFor='deviceId'>{accountType !== constants.soc.LIMIT_ACCOUNT ? it('device.txt-id') : it('device.txt-id-limit')}</label>
                  <TextField
                    id='deviceId'
                    name='deviceId'
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    onChange={this.handleDataChangeMui}
                    value={incidentDevice.info.deviceId}
                    error={!(incidentDevice.info.deviceId || '')}
                    required
                    helperText={it('txt-required')}
                    disabled={activeContent === 'viewDevice' || dataFromEdgeDevice} />
                </div>
                <div className='group'>
                  <label htmlFor='deviceName'>{it('device.txt-name')}</label>
                  <TextField
                    id='deviceName'
                    name='deviceName'
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    onChange={this.handleDataChangeMui}
                    value={incidentDevice.info.deviceName}
                    error={!(incidentDevice.info.deviceName || '')}
                    required
                    helperText={it('txt-required')}
                    disabled={activeContent === 'viewDevice'} />
                </div>

                <div className='group'>
                  <label htmlFor='deviceCompany'>{it('device.txt-company')}</label>
                  <TextField
                    id='deviceCompany'
                    name='deviceCompany'
                    error={!(incidentDevice.info.deviceCompany || '')}
                    helperText={it('txt-required')}
                    required
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    onChange={this.handleDataChangeMui}
                    value={incidentDevice.info.deviceCompany}
                    disabled={activeContent === 'viewDevice' || dataFromEdgeDevice} />
                </div>
              </div>
            }

            {activeSteps === 2 &&
              <div className='form-group steps-host'>
                <header>{it('txt-protect-type')}</header>
                <div className='group'>
                  <label htmlFor='protectType'>{it('txt-protect-type')}</label>
                  <TextField
                    id='protectType'
                    name='protectType'
                    error={!(incidentDevice.info.protectType || '')}
                    required
                    helperText={it('txt-required')}
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    select
                    onChange={this.handleDataChangeMui}
                    value={incidentDevice.info.protectType}
                    disabled={activeContent === 'viewDevice'}>
                    {
                      _.map(_.range(0, 7), el => {
                        return <MenuItem value={el.toString()}>{it(`protectType.${el}`)}</MenuItem>
                      })
                    }
                    </TextField>
                </div>

                {incidentDevice.info.protectType === '6' &&
                  <div className='group'>
                    <label htmlFor='protectTypeInfo'>{it('txt-protect-type-info')}</label>
                    <TextField
                      id='protectTypeInfo'
                      name='protectTypeInfo'
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      onChange={this.handleDataChangeMui}
                      value={incidentDevice.info.protectTypeInfo}
                      disabled={activeContent === 'viewDevice'} />
                  </div>
                }
              </div>
            }

            {activeSteps === 3 &&
              <div className='form-group steps-owner'>
                <header>{it('txt-unit-select')}</header>
                <Button variant='outlined' color='primary' className='standard manage' onClick={this.toggleManageDialog}>{t('txt-manageDepartmentTitle')}</Button>
                <React.Fragment>
                  <div className='group'>
                    <label htmlFor='unitId'>{it('unit.txt-name')}</label>
                    <Autocomplete
                      id='unitId'
                      name='unitId'
                      required
                      helperText={it('txt-required')}
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      options={departmentList}
                      select
                      onChange={this.onUnitChange}
                      value={incidentDevice.info.selectUnitObject}
                      getOptionLabel={(option) => option.text}
                      renderInput={(params) =>
                        <TextField
                          {...params}
                          required
                          error={!(incidentDevice.info.selectUnitObject ? incidentDevice.info.selectUnitObject.value : '' || '')}
                          helperText={it('txt-required')}
                          variant='outlined'
                          fullWidth={true}
                          size='small'
                          InputProps={{...params.InputProps, type: 'search'}}
                        />} />
                  </div>
                  <div className='group'>
                    <label htmlFor='oid'>{it('unit.txt-oid')}</label>
                    <TextField
                      id='oid'
                      name='oid'
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      required
                      error={!(unit.oid || '').trim()}
                      helperText={it('txt-required')}
                      onChange={this.handleUnitDataChangeMui}
                      value={unit.oid}
                      disabled={ownerType === 'existing'} />
                  </div>
                  <div className='group'>
                    <label htmlFor='abbreviation'>{it('unit.txt-abbreviation')}</label>
                    <TextField
                      id='abbreviation'
                      name='abbreviation'
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      required
                      error={!(unit.abbreviation || '').trim()}
                      helperText={it('txt-required')}
                      onChange={this.handleUnitDataChangeMui}
                      value={unit.abbreviation}
                      disabled={ownerType === 'existing'} />
                  </div>
                  <div className='group'>
                    <label htmlFor='level'>{it('unit.txt-level')}</label>
                    <TextField
                      id='level'
                      name='level'
                      required
                      error={!(unit.level || '').trim()}
                      helperText={it('txt-required')}
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      select
                      onChange={this.handleUnitDataChangeMui}
                      value={unit.level}
                      disabled={ownerType === 'existing'}>
                      {
                        _.map([
                          {
                            value: 'A',
                            text: 'A'
                          },
                          {
                            value: 'B',
                            text: 'B'
                          },
                          {
                            value: 'C',
                            text: 'C'
                          },
                          {
                            value: 'D',
                            text: 'D'
                          },
                          {
                            value: 'E',
                            text: 'E'
                          }
                        ], el => {
                          return <MenuItem value={el.value}>{el.text}</MenuItem>
                        })
                      }
                    </TextField>
                  </div>
                  <div className='group'>
                    <label htmlFor='industryType'>{it('unit.txt-type')}</label>
                    <TextField
                      id='industryType'
                      name='industryType'
                      required
                      helperText={it('txt-required')}
                      error={!(unit.industryType || '')}
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      select
                      onChange={this.handleUnitDataChangeMui}
                      value={unit.industryType}
                      disabled={ownerType === 'existing'}>
                      {_.map(_.range(0, 14), el => {
                        return <MenuItem value={el.toString()}>{it(`industryType.${el}`)}</MenuItem>
                      })}
                    </TextField>
                  </div>
                  <div className='group' style={{width: '25%'}}>
                    <label htmlFor='isGovernment' className='checkbox'>{it('unit.txt-government')}</label>
                    <FormControlLabel
                      className='switch-control'
                      control={
                        <Switch
                          checked={unit.isGovernment}
                          onChange={(event) => this.handleChange('isGovernment', event.target.checked)}
                          color='primary'/>
                      }
                      disabled={ownerType === 'existing'} />
                  </div>
                </React.Fragment>
            </div>
            }

            {activeSteps === 4 &&
              <div className='form-group steps-host'>
                <header>{it('txt-defense-range')}</header>
                {isSlave &&
                  <span>{it('txt-is-slave')}</span>
                }
                {!isSlave &&
                  <div className='group full'>
                    <Autocomplete
                      className='combo-box checkboxes-tags groups'
                      multiple
                      value={defenseRange.value}
                      options={_.map(tempDefenseRangeList, (val) => {
                        return {
                          text: val.deviceName + ' - ' + val.incidentUnitDTO.name,
                          value: val.id
                        };
                      })}
                      getOptionLabel={(option) => option.text}
                      disableCloseOnSelect
                      noOptionsText={t('txt-notFound')}
                      openText={t('txt-on')}
                      closeText={t('txt-off')}
                      clearText={t('txt-clear')}
                      renderOption={(option, { selected }) => (
                        <React.Fragment>
                          <Checkbox
                            color='primary'
                            icon={<CheckBoxOutlineBlankIcon />}
                            checkedIcon={<CheckBoxIcon />}
                            checked={selected} />
                          {option.text}
                        </React.Fragment>
                      )}
                      renderInput={(params) => (
                        <TextField {...params} variant='outlined' size='small' />
                      )}
                      getOptionSelected={(option, value) => (
                        option.value === value.value
                      )}
                      onChange={this.handleComboBoxChange}
                      disabled={isSlave} />
                  </div>
                }
              </div>
            }

            {activeSteps === 5 &&
              <div className='form-group steps-host'>
                <header>{it('txt-note')} ({t('txt-memoMaxLength')})</header>
                <div className='group full'>
                  <label htmlFor='note'>{it('txt-note')} ({t('txt-memoMaxLength')})</label>
                  <TextareaAutosize
                    id='note'
                    name='note'
                    className='textarea-autosize'
                    rows={4}
                    maxLength={250}
                    value={incidentDevice.info.note}
                    onChange={this.handleDataChangeMui}
                    disabled={activeContent === 'viewDevice'} />
                </div>
              </div>
            }
          </React.Fragment>
        }

        {activeContent === 'editDevice' &&
          <footer>
            <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</Button>
            {activeSteps > 1 &&
              <Button variant='outlined' color='primary' className='standard previous-step' onClick={this.toggleSteps.bind(this, 'previous')}>{t('txt-previousStep')}</Button>
            }
            <Button variant='contained' color='primary' className='next-step' onClick={this.toggleSteps.bind(this, 'next')}>{this.getBtnText()}</Button>
          </footer>
        }

        {activeContent === 'addDevice' &&
          <React.Fragment>
            <div className='steps-indicator'>
              {stepTitle.map(this.showUnitStepIcon)}
            </div>

            {activeSteps === 1 &&
              <div className='form-group steps-address'>
                <header>
                  <div className='text'>{t('edge-management.txt-basicInfo')}</div>

                  {activeContent !== 'addDevice' &&
                    <span className='msg'>{t('edge-management.txt-lastUpdateTime')} {helper.getFormattedDate(incidentDevice.info.updateDttm, 'local')}</span>
                  }
                </header>

                {accountType !== constants.soc.LIMIT_ACCOUNT &&
                  <div className='group'>
                    <label htmlFor='edgeDevice'>{it('device.txt-edgeDevice')}</label>
                    <TextField
                      id='edgeDevice'
                      name='edgeDevice'
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      select
                      onChange={this.handleDataChangeMui}
                      value={incidentDevice.edgeItem}
                      disabled={activeContent === 'viewDevice'}>
                      {_.map(edgeList, el => {
                        return <MenuItem value={el}>{el.agentName}</MenuItem>
                      })}
                    </TextField>
                  </div>
                }
                <div className='group'>
                  <label htmlFor='deviceId'>{accountType !== constants.soc.LIMIT_ACCOUNT ? it('device.txt-id') : it('device.txt-id-limit')}</label>
                  <TextField
                    id='deviceId'
                    name='deviceId'
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    onChange={this.handleDataChangeMui}
                    value={incidentDevice.info.deviceId}
                    error={!(incidentDevice.info.deviceId || '')}
                    required
                    helperText={it('txt-required')}
                    disabled={activeContent === 'viewDevice' || dataFromEdgeDevice} />
                </div>
                <div className='group'>
                  <label htmlFor='deviceName'>{it('device.txt-name')}</label>
                  <TextField
                    id='deviceName'
                    name='deviceName'
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    onChange={this.handleDataChangeMui}
                    value={incidentDevice.info.deviceName}
                    error={!(incidentDevice.info.deviceName || '')}
                    required
                    helperText={it('txt-required')}
                    disabled={activeContent === 'viewDevice'} />
                </div>
                <div className='group'>
                  <label htmlFor='deviceCompany'>{it('device.txt-company')}</label>
                  <TextField
                    id='deviceCompany'
                    name='deviceCompany'
                    error={!(incidentDevice.info.deviceCompany || '')}
                    helperText={it('txt-required')}
                    required
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    onChange={this.handleDataChangeMui}
                    value={incidentDevice.info.deviceCompany}
                    disabled={activeContent === 'viewDevice' || dataFromEdgeDevice} />
                </div>
              </div>
            }

            {activeSteps === 2 &&
              <div className='form-group steps-host'>
                <header>{it('txt-protect-type')}</header>
                <div className='group'>
                  <label htmlFor='protectType'>{it('txt-protect-type')}</label>
                  <TextField
                    id='protectType'
                    name='protectType'
                    error={!(incidentDevice.info.protectType || '')}
                    required
                    helperText={it('txt-required')}
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    select
                    onChange={this.handleDataChangeMui}
                    value={incidentDevice.info.protectType}
                    disabled={activeContent === 'viewDevice'}>
                    {
                      _.map(_.range(0, 7), el => {
                        return <MenuItem value={el.toString()}>{it(`protectType.${el}`)}</MenuItem>
                      })
                    }
                  </TextField>
                </div>

                {incidentDevice.info.protectType === '6' &&
                  <div className='group'>
                    <label htmlFor='protectTypeInfo'>{it('txt-protect-type-info')}</label>
                    <TextField
                      id='protectTypeInfo'
                      name='protectTypeInfo'
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      onChange={this.handleDataChangeMui}
                      value={incidentDevice.info.protectTypeInfo}
                      disabled={activeContent === 'viewDevice'} />
                  </div>
                }
              </div>
            }

            {activeSteps === 3 &&
              <div className='form-group steps-owner'>
                <header>{it('txt-unit-select')}</header>
                <React.Fragment>
                  <div className='group'>
                    <label htmlFor='unitId'>{it('unit.txt-name')}</label>
                    <Autocomplete
                      id='unitId'
                      name='unitId'
                      required
                      helperText={it('txt-required')}
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      options={departmentList}
                      select
                      onChange={this.onUnitChange}
                      value={incidentDevice.info.selectUnitObject}
                      getOptionLabel={(option) => option.text}
                      renderInput={(params) =>
                        <TextField
                          {...params}
                          required
                          error={!(incidentDevice.info.selectUnitObject ? incidentDevice.info.selectUnitObject.value : '' || '')}
                          helperText={it('txt-required')}
                          variant='outlined'
                          fullWidth={true}
                          size='small'
                          InputProps={{...params.InputProps, type: 'search'}}
                        />} />
                  </div>
                  <div className='group'>
                    <label htmlFor='oid'>{it('unit.txt-oid')}</label>
                    <TextField
                      id='oid'
                      name='oid'
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      required
                      error={!(unit.oid || '').trim()}
                      helperText={it('txt-required')}
                      onChange={this.handleUnitDataChangeMui}
                      value={unit.oid}
                      disabled={ownerType === 'existing'} />
                  </div>
                  <div className='group'>
                    <label htmlFor='abbreviation'>{it('unit.txt-abbreviation')}</label>
                    <TextField
                      id='abbreviation'
                      name='abbreviation'
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      required
                      error={!(unit.abbreviation || '').trim()}
                      helperText={it('txt-required')}
                      onChange={this.handleUnitDataChangeMui}
                      value={unit.abbreviation}
                      disabled={ownerType === 'existing'} />
                  </div>
                  <div className='group'>
                    <label htmlFor='level'>{it('unit.txt-level')}</label>
                    <TextField
                      id='level'
                      name='level'
                      required
                      error={!(unit.level || '').trim()}
                      helperText={it('txt-required')}
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      select
                      onChange={this.handleUnitDataChangeMui}
                      value={unit.level}
                      disabled={ownerType === 'existing'}>
                      {
                        _.map([
                          {
                            value: 'A',
                            text: 'A'
                          },
                          {
                            value: 'B',
                            text: 'B'
                          },
                          {
                            value: 'C',
                            text: 'C'
                          },
                          {
                            value: 'D',
                            text: 'D'
                          },
                          {
                            value: 'E',
                            text: 'E'
                          }
                        ], el => {
                          return <MenuItem value={el.value}>{el.text}</MenuItem>
                        })
                      }
                    </TextField>
                  </div>

                  <div className='group'>
                    <label htmlFor='industryType'>{it('unit.txt-type')}</label>
                    <TextField
                      id='industryType'
                      name='industryType'
                      required
                      helperText={it('txt-required')}
                      error={!(unit.industryType || '')}
                      variant='outlined'
                      fullWidth={true}
                      size='small'
                      select
                      onChange={this.handleUnitDataChangeMui}
                      value={unit.industryType}
                      disabled={ownerType === 'existing'}>
                      {_.map(_.range(0, 14), el => {
                        return <MenuItem value={el.toString()}>{it(`industryType.${el}`)}</MenuItem>
                      })}
                    </TextField>
                  </div>
                  <div className='group' style={{width: '25%'}}>
                    <label htmlFor='isGovernment' className='checkbox'>{it('unit.txt-government')}</label>
                    <FormControlLabel
                      className='switch-control'
                      control={
                        <Switch
                          checked={unit.isGovernment}
                          onChange={(event) => this.handleChange('isGovernment', event.target.checked)}
                          color='primary' />
                      }
                      disabled={ownerType === 'existing'} />
                  </div>
                </React.Fragment>
              </div>
            }

            {activeSteps === 4 &&
              <div className='form-group steps-host'>
                <header>{it('txt-defense-range')}</header>
                <div className='group full'>
                  <Autocomplete
                    className='combo-box checkboxes-tags groups'
                    multiple
                    value={defenseRange.value}
                    options={_.map(defenseRange.list, (val) => {
                      return {
                        text: val.deviceName + ' - ' + val.incidentUnitDTO.name,
                        value: val.id
                      };
                    })}
                    getOptionLabel={(option) => option.text}
                    disableCloseOnSelect
                    noOptionsText={t('txt-notFound')}
                    openText={t('txt-on')}
                    closeText={t('txt-off')}
                    clearText={t('txt-clear')}
                    renderOption={(option, { selected }) => (
                      <React.Fragment>
                        <Checkbox
                          color='primary'
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={<CheckBoxIcon />}
                          checked={selected} />
                        {option.text}
                      </React.Fragment>
                    )}
                    renderInput={(params) => (
                      <TextField {...params} variant='outlined' size='small' />
                    )}
                    getOptionSelected={(option, value) => (
                      option.value === value.value
                    )}
                    onChange={this.handleComboBoxChange} />
                </div>
              </div>
            }

            {activeSteps === 5 &&
              <div className='form-group steps-host'>
                <header>{it('txt-note')} ({t('txt-memoMaxLength')})</header>
                <div className='group full'>
                  <label htmlFor='note'>{it('txt-note')} ({t('txt-memoMaxLength')})</label>
                  <TextareaAutosize
                    id='note'
                    name='note'
                    className='textarea-autosize'
                    rows={4}
                    maxLength={250}
                    value={incidentDevice.info.note}
                    onChange={this.handleDataChangeMui}
                    disabled={activeContent === 'viewDevice'} />
                </div>
              </div>
            }
          </React.Fragment>
        }

        {activeContent === 'addDevice' &&
          <footer>
            <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, 'cancel-add')}>{t('txt-cancel')}</Button>
            {activeSteps > 1 &&
              <Button variant='outlined' color='primary' className='standard previous-step' onClick={this.toggleSteps.bind(this, 'previous')}>{t('txt-previousStep')}</Button>
            }
            <Button variant='contained' color='primary' className='next-step' onClick={this.toggleSteps.bind(this, 'next')}>{this.getBtnText()}</Button>
          </footer>
        }
      </div>
     )
  }
  handleChange = (field, value) => {
    let tempDevice = {...this.state.unit};
    tempDevice[field] = value;

    this.setState({
      unit: tempDevice
    });
  }
  onNameChange = (event, values) => {
    const {unit, departmentList} = this.state;
    let temp = {...unit};
    temp['name'] = values;
    
    _.forEach(departmentList, value => {
      if (values === value.name) {
        temp.id = value.id;
      }
    })

    this.setState({
      unit: temp
    });
  }
  showUnitStepIcon = (val, i) => {
    const {activeSteps} = this.state;
    const index = ++i;
    const lineClass = 'line line' + index;
    const stepClass = 'step step' + index;

    return (
      <div key={i} className={`group group${index}`}>
        <div className={cx(lineClass, {active: activeSteps >= index})}></div>
        <div className={cx(stepClass, {active: activeSteps >= index})}>
          <div className='border-wrapper'>
            <span className='number'>{index}</span>
          </div>
          <div className='text-wrapper'>
            <div className='text'>{val}</div>
          </div>
        </div>
      </div>
    )
  }
  /**
   * Toggle add/edit form step content
   * @method
   * @param {string} type - form step type ('previous' or 'next')
   */
  toggleSteps = (type) => {
    const {formTypeEdit, activeSteps, unit, incidentDevice,  ownerType, formValidation} = this.state;
    let tempActiveSteps = activeSteps;
    let tempFormValidation = {...formValidation};

    if (type === 'previous') {
      tempActiveSteps--;

      this.setState({
        activeSteps: tempActiveSteps
      });
    } else if (type === 'next') {
      if (activeSteps === 1) {
        let validate = true;

        if (incidentDevice.info.deviceId) {
        } else {
          helper.showPopupMsg('', t('txt-error'), it('required.deviceId'));
          validate = false;
          return;
        }

        if (incidentDevice.info.deviceName) {
        } else {
          helper.showPopupMsg('', t('txt-error'), it('required.deviceName'));
          validate = false;
          return;
        }

        if (incidentDevice.info.deviceCompany) {
        } else {
          helper.showPopupMsg('', t('txt-error'), it('required.deviceCompany'));
          validate = false;
          return;
        }

        if (!validate) {
          return;
        }

        this.setState({
          activeSteps: 2
        });
      } else {
        if (activeSteps === 2) {
          let validate = true;

          if (incidentDevice.info.protectType) {
          } else {
            helper.showPopupMsg('', t('txt-error'), it('required.protectType'));
            validate = false;
          }

          if (!validate) {
            return;
          }
        }

        if (activeSteps === 3 && ownerType === 'new') {
          let validate = true;

          if (unit.oid) {

          } else {
            helper.showPopupMsg('', t('txt-error'), it('required.oid'));
            validate = false;
            return;
          }

          if (unit.abbreviation) {

          } else {
            helper.showPopupMsg('', t('txt-error'), it('required.abbreviation'));
            validate = false;
            return;
          }

          if (unit.level) {

          } else {
            helper.showPopupMsg('', t('txt-error'), it('required.level'));
            validate = false;
            return;
          }

          if (unit.industryType) {

          } else {
            helper.showPopupMsg('', t('txt-error'), it('required.industryType'));
            validate = false;
            return;
          }

          if (incidentDevice.info.selectUnitObject.value) {

          } else {
            helper.showPopupMsg('', t('txt-error'), it('required.unit'));
            validate = false;
            return;
          }

          if (!validate) {
            return;
          }
        }

        if (activeSteps === 3 && ownerType !== 'new') {
          let validate = true;

          if (incidentDevice.info.selectUnitObject.value) {

          } else {
            helper.showPopupMsg('', t('txt-error'), it('required.unit'));
            validate = false;
            return;
          }

          if (!validate) {
            return;
          }
        }

        if (activeSteps === 4) {
          let validate = true;

          if (!validate) {
            return;
          }
        }

        if (activeSteps === 5) {
          if (ownerType === 'new') {
            let validate = true;

            if (!this.handleUnitSubmit()) {
              validate = false;
            }

            if (!validate) {
              return;
            }
          } else {
            this.handleDeviceSubmit();
          }
          return;
        }

        tempActiveSteps++;

        this.setState({
          activeSteps: tempActiveSteps
        });
      }
    }
  }
  toggleManageDialog = () => {
    this.setState({
      openManage: !this.state.openManage
    }, () => {
      this.checkUnitOrgFromDepartment();
    });
  }
  getBtnText = () => {
    return this.state.activeSteps === 5 ? t('txt-confirm') : t('txt-nextStep');
  }
  getOwnerType = () => {
    const {ownerList} = this.state;

    let ownerType = [{
      value: 'new',
      text: t('txt-addNewOwner')
    }];

    if (!_.isEmpty(ownerList)) {
      ownerType.unshift({
        value: 'existing',
        text: t('txt-existingOwner')
      });
    }

    return ownerType;
  }
  handleUnitSubmit = () => {
    const {baseUrl} = this.context;
    let tmpIncidentUnit = {...this.state.unit};

    if (!this.checkAddUnitData(tmpIncidentUnit)) {
      return false;
    }

    tmpIncidentUnit.industryType = tmpIncidentUnit.industryType.toString();

    let apiType = 'POST';

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/unit`,
      data: JSON.stringify(tmpIncidentUnit),
      type: apiType,
      contentType: 'text/plain'
    })
    .then(data => {
      if (data.status.includes('success')) {
        this.handleDeviceSubmit();
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  checkAddUnitData = (incidentUnit) => {
    if (!incidentUnit.id || !incidentUnit.oid || !incidentUnit.name || !incidentUnit.abbreviation) {
      helper.showPopupMsg('', t('txt-error'), it('txt-validUnit'));
      return false;
    }

    if (!incidentUnit.level) {
      helper.showPopupMsg('', t('txt-error'), it('txt-validUnit'));
      return false;
    }

    if (incidentUnit.industryType.toString() === '') {
      helper.showPopupMsg('', t('txt-error'), it('txt-validUnit'));
      return false;
    }

    return true;
  }
  /**
   * Handle IncidentDevice Edit confirm
   * @method
   */
  handleDeviceSubmit = () => {
    const {baseUrl, session} = this.context;
    const {incidentDevice, defenseRange} = this.state;
    let dataFromEdgeDevice = this.state.dataFromEdgeDevice;

    if (!this.checkAddData(incidentDevice)) {
      return;
    }

    // TODO Assign unit id
    incidentDevice.info.unitId = incidentDevice.info.selectUnitObject.value;

    let apiType = 'POST';

    if (incidentDevice.info.id) {
      apiType = 'PATCH';
    }

    let slaveDeviceIdList = [];

    slaveDeviceIdList = _.map(defenseRange.value, val => {
      return val.value;
    });

    const requestData = {
      ...incidentDevice.info,
      slaveDeviceIdList
    };

    this.ah.one({
      url: `${baseUrl}/api/soc/device`,
      data: JSON.stringify(requestData),
      type: apiType,
      contentType: 'text/plain'
    })
    .then(data => {
      incidentDevice.edgeItem = '';
      incidentDevice.edgeList = [];
      incidentDevice.info.updateDttm = data.updateDttm;
      dataFromEdgeDevice = false;

      let tempUnit = {...this.state.unit};
      let result = {
        text: tempUnit.name,
        value:tempUnit.id
      }

      incidentDevice.info.selectUnitObject = result;

      this.setState({
        originalIncidentDeviceData: _.cloneDeep(incidentDevice)
      }, () => {
        this.getDeviceSlave(data, 'submit');
      });

      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   *
   * @param incidentDevice
   * @returns {boolean}
   */
  checkAddData = (incidentDevice) => {
    if (!incidentDevice.info.selectUnitObject || !incidentDevice.info.deviceId || !incidentDevice.info.deviceCompany || !incidentDevice.info.deviceName || !incidentDevice.info.protectType) {
      helper.showPopupMsg('', t('txt-error'), t('txt-allRequired'));
      return false;
    }
    return true;
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {showFilter, deviceSearch} = this.state;

    return (
      <div className={cx('main-filter', {'active': showFilter})}>
        <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')} />
        <div className='header-text'>{t('txt-filter')}</div>
        <div className='filter-section config'>
          <div className='group'>
            <TextField
              id='edgeSearchKeyword'
              name='keyword'
              variant='outlined'
              fullWidth={true}
              size='small'
              className='search-textarea'
              value={deviceSearch.keyword}
              onChange={this.handleDeviceInputSearchMui} />
          </div>
        </div>
        <div className='button-group'>
          <Button variant='contained' color='primary' className='filter' onClick={this.getDeviceData.bind(this, 'search')}>{t('txt-filter')}</Button>
          <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /* ---- Func Space ---- */
  /**
   * Show Delete IncidentDevice dialog
   * @method
   * @param {object} allValue - IncidentDevice data
   */
  openDeleteMenu = (allValue) => {
    PopupDialog.prompt({
      title: t('txt-delete'),
      id: 'modalWindowSmall',
      confirmText: t('txt-delete'),
      cancelText: t('txt-cancel'),
      display: this.getDeleteIncidentDeviceContent(allValue),
      act: (confirmed, data) => {
        if (confirmed) {
          this.deleteDevice();
        }
      }
    });
  }
  /**
   * Display delete IncidentDevice content
   * @method
   * @param {object} allValue - IncidentDevice data
   * @returns HTML DOM
   */
  getDeleteIncidentDeviceContent = (allValue) => {
    this.setState({
      currentIncidentDeviceData: allValue
    });

    return (
      <div className='content delete'>
        <span>{t('txt-delete-msg')}: {allValue.deviceName + ': ID(' + allValue.deviceId + ')'} ?</span>
      </div>
    )
  }
  autoSendSettingsDialog = () => {
    PopupDialog.prompt({
      title: it('txt-autoSendSettings'),
      confirmText: it('unit.txt-isDefault'),
      cancelText: it('unit.txt-isNotDefault'),
      display: (
        <div className='c-form content'>
          <span>{it('txt-autoSend')}</span>
        </div>
      ),
      act: (confirmed) => {
        if (confirmed) {
          this.handleStatusChange('isDefault', true);
        } else {
          this.handleStatusChange('isDefault', false);
        }
      }
    });
  }
  /**
   * Handle delete IncidentDevice confirm
   * @method
   */
  deleteDevice = () => {
    const {baseUrl} = this.context;
    const {currentIncidentDeviceData} = this.state;

    if (!currentIncidentDeviceData.id) {
      return;
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/device?id=${currentIncidentDeviceData.id}`,
      type: 'DELETE'
    })
    .then(data => {
      if (data.ret === 0) {
        this.getDeviceData();
      }
      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempDevice = {...this.state.incidentDevice};
    tempDevice[type] = Number(value);

    if (type === 'pageSize') {
      tempDevice.currentPage = 1;
    }

    this.setState({
      incidentDevice: tempDevice
    }, () => {
      this.getDeviceData();
    });
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {string | number} value - new page number
   */
  handleSelectPaginationChange = (type, value) => {
    let tempDevice = {...this.state.healthStatistic};
    tempDevice[type] = Number(value);

    if (type === 'pageSize') {
      tempDevice.currentPage = 1;
    }

    this.setState({
      healthStatistic: tempDevice
    }, () => {
      this.setupHealthStatisticData();
    });
  }
  /**
   * Handle table sort
   * @method
   * @param {object} sort - sort data object
   */
  handleTableSort = (sort) => {
    let tempDevice = {...this.state.incidentDevice};
    tempDevice.sort.field = sort.field;
    tempDevice.sort.desc = sort.desc;

    this.setState({
      incidentDevice: tempDevice
    }, () => {
      this.getDeviceData();
    });
  }
  /**
   * Handle table sort
   * @method
   * @param {object} sort - sort data object
   */
  handleSelectTableSort = (sort) => {
    let tempDevice = {...this.state.healthStatistic};
    tempDevice.sort.field = sort.field;
    tempDevice.sort.desc = sort.desc;

    this.setState({
      healthStatistic: tempDevice
    }, () => {
      this.setupHealthStatisticData();
    });
  }
  /**
   * Check table sort
   * @method
   * @param {string} field - table field name
   * @returns true for sortable or null
   */
  checkSortable = (field) => {
    const unSortableFields = ['description', '_menu'];

    if (_.includes(unSortableFields, field)) {
      return null;
    } else {
      return true;
    }
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - page type ('tableList', 'editEdge' and 'cancel')
   * @param {object} allValue - Edge data
   */
  toggleContent = (type, allValue) => {
    const {baseUrl} = this.context;
    const {originalIncidentDeviceData, incidentDevice, unit, edgeList, originalDefenseRangeData, defenseRange} = this.state;
    let tempIncidentDevice = {...incidentDevice};
    let tempUnit = {...unit};
    let tempDefenseRange = {...defenseRange};
    let dataFromEdgeDevice = this.state.dataFromEdgeDevice;
    let showPage = type;

    this.getOptions();

    if (type === 'viewDevice') {
      _.forEach(edgeList, val => {
        if (val.agentId === allValue.deviceId) {
          tempIncidentDevice.edgeItem = allValue.deviceId;
        }
      })

      tempIncidentDevice.info = {
        id: allValue.id,
        deviceId: allValue.deviceId,
        deviceCompany: allValue.deviceCompany,
        deviceName: allValue.deviceName,
        unitId: allValue.unitId,
        frequency: allValue.frequency,
        protectType: allValue.protectType,
        protectTypeInfo: allValue.protectTypeInfo,
        note: allValue.note,
        updateDttm: allValue.updateDttm,
        selectUnitObject:{
          text:allValue.incidentUnitDTO.name || '',
          value:allValue.unitId
        }
      };

      if (allValue.incidentUnitDTO) {
        tempUnit.id = allValue.incidentUnitDTO.id;
        tempUnit.oid = allValue.incidentUnitDTO.oid;
        tempUnit.name = allValue.incidentUnitDTO.name;
        tempUnit.abbreviation = allValue.incidentUnitDTO.abbreviation;
        tempUnit.industryType = allValue.incidentUnitDTO.industryType.toString();
        tempUnit.level = allValue.incidentUnitDTO.level;
        tempUnit.isGovernment = allValue.incidentUnitDTO.isGovernment;
      }

      this.setState({
        showFilter: false,
        unit:tempUnit,
        originalIncidentDeviceData: _.cloneDeep(tempIncidentDevice)
      });
    } else if (type === 'addDevice') {
      tempDefenseRange.value = [];

      if (allValue) {
        _.forEach(edgeList, val => {
          if (val.agentId === allValue.deviceId) {
            tempIncidentDevice.edgeItem = allValue.deviceId
          }
        })

        tempIncidentDevice.info = {
          id: allValue.id,
          deviceId: allValue.deviceId,
          deviceName: allValue.deviceName,
          deviceCompany: allValue.deviceCompany,
          unitId: allValue.unitId,
          frequency: allValue.frequency,
          protectType: allValue.protectType,
          protectTypeInfo: allValue.protectTypeInfo,
          note: allValue.note,
          updateDttm: allValue.updateDttm,
          selectUnitObject:{
            text: '',
            value:''
          }
        };
      } else {
        tempIncidentDevice.info = {
          id: '',
          unitId: '',
          deviceId: '',
          deviceName: '',
          deviceCompany: '',
          unitOid: '',
          unitName: '',
          unitLevel: 'A',
          frequency: null,
          protectType: '0',
          protectTypeInfo: '',
          note: '',
          reason:'',
          updateDttm: '',
          selectUnitObject: {
            text: '',
            value: ''
          }
        };
      }

      this.setState({
        showFilter: false,
        unit: {
          id: '',
          oid: '',
          name: '',
          level: '',
          industryType: '',
          isUse: true,
          isGovernment:false,
          abbreviation: '',
          relatedAccountList: []
        },
        originalIncidentDeviceData: _.cloneDeep(tempIncidentDevice)
      });
    } else if (type === 'tableList') {
      tempIncidentDevice.info = _.cloneDeep(incidentDevice.info);
    } else if (type === 'cancel-add') {
      showPage = 'tableList';
      dataFromEdgeDevice = false;
      tempIncidentDevice = _.cloneDeep(originalIncidentDeviceData);
      tempDefenseRange = _.cloneDeep(originalDefenseRangeData);
    } else if (type === 'cancel') {
      showPage = 'viewDevice';
      dataFromEdgeDevice = false;
      tempIncidentDevice = _.cloneDeep(originalIncidentDeviceData);
      tempDefenseRange = _.cloneDeep(originalDefenseRangeData);
    }

    this.setState({
      activeContent: showPage,
      incidentDevice: tempIncidentDevice,
      dataFromEdgeDevice: dataFromEdgeDevice,
      defenseRange: tempDefenseRange,
      activeSteps: 1
    }, () => {
      if (type === 'tableList') {
        this.getDeviceData();
        this.getUnitList();
      }
    });
  }
  /**
   * Send edit CSV data to backend
   */
  sendCsvWithOnlineEditData = () => {
    const {baseUrl} = this.context;
    let tempList = {...this.state.healthStatistic.dataContent};
    let sendList = [];

    _.forEach(tempList, sendTemp => {
      let tmp = {
        id: sendTemp.id,
        select: sendTemp.select,
        frequency: sendTemp.frequency,
        reason: sendTemp.reason
      };
      sendList.push(tmp);
    })

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/device/_sendV2?`,
      data: JSON.stringify(sendList),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if ((data && data.ret === constants.soc.SEND_STATUS_SUCCESS) || (data && data.ret === constants.soc.SEND_STATUS_DEFAULT_SUCCESS)) {
        helper.showPopupMsg(it('txt-send-success'), it('txt-send'));
      } else if (data && data.ret === constants.soc.SEND_STATUS_ERROR_NOT_CONNECT_NCCST) {
        helper.showPopupMsg(it('txt-send-connect-fail'), it('txt-send'));
      } else {
        helper.showPopupMsg(it('txt-send-other-fail'), it('txt-send'));
      }
    })
    .catch(err => {
      helper.showPopupMsg(it('txt-send-fail'), it('txt-send'));
    })
  }
  downloadCsvWithOnlineEditData = () => {
    const {baseUrl, contextRoot} = this.context;
    const url = `${baseUrl}${contextRoot}/api/soc/device/_exportV2`;
    let tempList = {...this.state.healthStatistic.dataContent};
    let sendList = [];

    _.forEach(tempList, sendTemp => {
      let tmp = {
        id: sendTemp.id,
        select: sendTemp.select,
        frequency: sendTemp.frequency,
        note: sendTemp.note
      }
      sendList.push(tmp);
    })

    let requestData = {
      columns: sendList
    };

    downloadWithForm(url, {payload: JSON.stringify(requestData)});
  }
  /**
   * Show Delete IncidentDevice dialog
   * @method
   * @param {object} allValue - IncidentDevice data
   */
  openSendMenu = () => {
    this.setState({
      setType: 'send',
    }, () => {
      this.setupHealthStatisticData();
    });
  }
  getSlaveList = () => {
    const {baseUrl, session} = this.context;

    this.ah.one({
      url: `${baseUrl}/api/soc/deviceSlave/slaveList`,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data) {
        this.setState({
          slaveList: data.rows
        }, () => {
          this.openDownloadMenu();
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  openDownloadMenu = () => {
    this.setState({
      setType: 'download',
    }, () => {
      this.setupHealthStatisticData();
    });
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - input type
   * @param {object} event - input value
   */
  handleDeviceInputSearch = (type, event) => {
    let tempDeviceSearch = {...this.state.deviceSearch};
    tempDeviceSearch[type] =  event.target.value.trim();

    this.setState({
      deviceSearch: tempDeviceSearch
    });
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - input type
   * @param {object} event - input value
   */
  handleDeviceInputSearchMui = (event) => {
    let tempDeviceSearch = {...this.state.deviceSearch};
    tempDeviceSearch[event.target.name] =  event.target.value;

    this.setState({
      deviceSearch: tempDeviceSearch
    });
  }
  /**
   * Toggle filter content on/off
   * @method
   */
  toggleFilter = () => {
    this.setState({
      showFilter: !this.state.showFilter
    });
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      deviceSearch: {
        keyword: ''
      }
    });
  }
  /**
   * Handle Incident Device edit input data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleDataChange = (type, value) => {
    let tempDevice = {...this.state.incidentDevice};
    let edgeItemList = {...this.state.edgeList};
    let dataFromEdgeDevice = this.state.dataFromEdgeDevice;

    if (type === 'edgeDevice') {
      tempDevice.edgeItem = value;

      _.forEach(edgeItemList, val => {
        if (val.agentId === value) {
          tempDevice.info.deviceId = val.agentId;
          tempDevice.info.deviceName = val.agentName;
          tempDevice.info.deviceCompany = val.agentCompany;
        }
      })

      if (tempDevice.info.deviceId.length !== 0) {
        dataFromEdgeDevice = true;
      } else {
        dataFromEdgeDevice = false;
      }

      this.setState({
        incidentDevice: tempDevice,
        dataFromEdgeDevice: dataFromEdgeDevice
      });
    } else {
      tempDevice.info[type] = value;

      this.setState({
        incidentDevice: tempDevice
      });
    }
  }
  handleUnitDataChangeMui = (event) => {
    let tempDevice = {...this.state.unit};
    tempDevice[event.target.name] = event.target.value;

    this.setState({
      unit: tempDevice
    });
  }
  handleDataChangeMui = (event) => {
    let tempDevice = {...this.state.incidentDevice};
    let edgeItemList = {...this.state.edgeList};
    let dataFromEdgeDevice = this.state.dataFromEdgeDevice;

    if (event.target.name === 'edgeDevice') {
      tempDevice.edgeItem = event.target.value;

      _.forEach(edgeItemList, val => {
        if (val.agentId === event.target.value.agentId) {
          tempDevice.info.deviceId = val.agentId;
          tempDevice.info.deviceName = val.agentName;
          tempDevice.info.deviceCompany = val.agentCompany;
        }
      })

      if (tempDevice.info.deviceId.length !== 0) {
        dataFromEdgeDevice = true;
      } else {
        dataFromEdgeDevice = false;
      }

      this.setState({
        incidentDevice: tempDevice,
        dataFromEdgeDevice: dataFromEdgeDevice
      });
    } else {
      tempDevice.info[event.target.name] = event.target.value;

      this.setState({
        incidentDevice: tempDevice
      });
    }
  }
  onUnitChange = (event, values) => {
    const {baseUrl, contextRoot} = this.context;
    let tempDevice = {...this.state.incidentDevice};
    let tempUnit = {...this.state.unit};
    tempDevice.info['selectUnitObject'] = values;

    this.ah.one({
      url: `${baseUrl}/api/soc/unit?uuid=${values.value}`,
      type: 'GET',
    })
    .then(data => {
      if (data.id) {
        tempUnit.id = data.id;
        tempUnit.oid = data.oid;
        tempUnit.name = data.name;
        tempUnit.abbreviation = data.abbreviation;
        tempUnit.industryType = data.industryType.toString();
        tempUnit.level = data.level;
        tempUnit.isGovernment = data.isGovernment;

        this.setState({
          ownerType: 'existing',
          incidentDevice: tempDevice,
          unit:tempUnit
        });
      } else {
        tempUnit.id = values.value;
        tempUnit.name = values.text;
        tempUnit.oid = '';
        tempUnit.abbreviation = '';
        tempUnit.industryType = '';
        tempUnit.level = '';
        tempUnit.isGovernment = '';

        this.setState({
          ownerType: 'new',
          incidentDevice: tempDevice,
          unit:tempUnit
        });
      }
    })
    .catch(err => {
      //helper.showPopupMsg(it('txt-send-fail'), it('txt-send'));
    })
  }
  /**
   * Handle Incident Device edit input data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   * @param {string} deviceId - input value
   */
  handleSendDataChange = (type, deviceId, value) => {
    let tempSendDevice = {...this.state.healthStatistic};
    let edgeItemList = {...this.state.edgeList};
    let dataFromEdgeDevice = this.state.dataFromEdgeDevice;

    if (type === 'edgeDevice') {
      tempSendDevice.edgeItem = value;

      _.forEach(edgeItemList, val => {
        if (val.agentId === value) {
          tempSendDevice.info.deviceId = val.agentId;
          tempSendDevice.info.deviceName = val.agentName;
          tempSendDevice.info.deviceCompany = val.agentCompany;
        } else {
          tempSendDevice.info.deviceId = '';
          tempSendDevice.info.deviceName = '';
          tempSendDevice.info.deviceCompany = '';
        }
      })

      if (tempSendDevice.info.deviceId.length !== 0) {
        dataFromEdgeDevice = true;
      } else {
        dataFromEdgeDevice = false;
      }

      this.setState({
        healthStatistic: tempSendDevice,
        dataFromEdgeDevice: dataFromEdgeDevice
      });
    } else {
      _.forEach(tempSendDevice.dataContent, data => {
        if (deviceId === data.deviceId) {
          if (type === 'frequency') {
            data.frequency = value;
          } else if (type === 'note') {
            data.note = value;
          }  else if (type === 'reason') {
            data.reason = value;
          }  else if (type === 'select') {
            data.select = value;
          }
        }
      })

      this.setState({
        healthStatistic: tempSendDevice
      });
    }
  }
  handleSendDataChangeMui = (deviceId, event) => {
    let tempSendDevice = {...this.state.healthStatistic};
    let edgeItemList = {...this.state.edgeList};
    let dataFromEdgeDevice = this.state.dataFromEdgeDevice;

    if (event.target.name === 'edgeDevice') {
      tempSendDevice.edgeItem = event.target.value;

      _.forEach(edgeItemList, val => {
        if (val.agentId === event.target.value) {
          tempSendDevice.info.deviceId = val.agentId;
          tempSendDevice.info.deviceName = val.agentName ||  val.agentId;
          tempSendDevice.info.deviceCompany = val.agentCompany;
        } else {
          tempSendDevice.info.deviceId = '';
          tempSendDevice.info.deviceName = '';
          tempSendDevice.info.deviceCompany = '';
        }
      })

      if (tempSendDevice.info.deviceId.length !== 0) {
        dataFromEdgeDevice = true;
      } else {
        dataFromEdgeDevice = false;
      }

      this.setState({
        healthStatistic: tempSendDevice,
        dataFromEdgeDevice: dataFromEdgeDevice
      });
    } else {
      _.forEach(tempSendDevice.dataContent, data => {
        if (deviceId === data.deviceId) {
          if (event.target.name === 'frequency') {
            data.frequency = event.target.value;
          } else if (event.target.name === 'note') {
            data.note = event.target.value;
          }  else if (event.target.name === 'reason') {
            data.reason = event.target.value;
          }  else if (event.target.name === 'select') {
            data.select = event.target.checked;
          }
        }
      })
      this.setState({
        healthStatistic: tempSendDevice
      });
    }
  }
  /**
   * Handle Incident Device edit checkBox data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleStatusChange = (type, value) => {
    const {baseUrl, contextRoot} = this.context;
    let tempSendCheck = {...this.state.sendCheck};
    tempSendCheck.sendStatus = value;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/device/_override`,
      data: JSON.stringify(tempSendCheck),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data) {
        tempSendCheck.sendStatus = data.rt;

        this.setState({
          sendCheck: tempSendCheck
        });
      }
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  getOptions = () => {
    const {baseUrl, contextRoot} = this.context;
    let usedDeviceIdList = {...this.state.usedDeviceIdList}

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/edge/_search`,
      data: JSON.stringify({}),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    }).then(data => {
      if (data) {
        let edgeList = [];

        let lookup = _.keyBy(usedDeviceIdList, function(o) {
          return o.deviceId;
        });

        let result = _.filter(data.rt.rows, function(u) {
          return lookup[u.agentId] === undefined;
        });

        _.forEach(result, val => {
          let edge = {
            text: val.agentName,
            value: val.agentId,
            agentName: val.agentName,
            agentId: val.agentId,
            agentCompany: 'NSGUARD'
          };
          edgeList.push(edge);
        })

        this.setState({
          edgeList: edgeList
        }, () => {
          this.getNetProxyList();
        });
      }
    }).catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    });
  }
  getNetProxyList = () => {
    const {baseUrl, contextRoot,} = this.context;
    const {edgeList} = this.state;
    let usedDeviceIdList = {...this.state.usedDeviceIdList};
    let tempEdgeList = edgeList;

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/v2/log/config`,
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).then(data => {
      if (data) {
        let netProxyList = [];

        let lookup = _.keyBy(usedDeviceIdList, function(o) {
          return o.deviceId;
        });

        let result = _.filter(data.rt.loghostList, function(u) {
          return lookup[u] === undefined;
        });

        _.forEach(result, val => {
          let netProxyItem = {
            text: val,
            value: val,
            agentName: val,
            agentId: val,
            agentCompany: 'NSGUARD'
          };
          netProxyList.push(netProxyItem);
        })

        let children = tempEdgeList.concat(netProxyList);

        this.setState({
          edgeList: children
        });
      }
    }).catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  render() {
    const {session, sessionRights} = this.context;
    const {
      activeContent,
      baseUrl,
      contextRoot,
      sendCheck,
      showFilter,
      incidentDevice,
      healthStatistic,
      accountType,
      openManage
    } = this.state;
    let insertCheck = true;
    let privCheck = false;

    if (_.includes(session.roles, constants.soc.Default_Admin) && session.roles.length === 1) {
      insertCheck = false;
    }

    if (_.includes(sessionRights, sessionRights.Module_Config)) {
      privCheck = false;
    }

    return (
      <div>
        {openManage &&
          <Manage
            handleCloseManage={this.handleCloseManage} />
         }

        <div className='sub-header'>
          <div className='secondary-btn-group right'>
            <button className={cx('', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'/></button>
          </div>
        </div>

        <div className='data-content'>
          <SocConfig baseUrl={baseUrl} contextRoot={contextRoot} session={session} accountType={accountType} />

          <div className='parent-content'>
            {this.renderFilter()}

            {activeContent === 'tableList' &&
              <div className='main-content'>
                <header className='main-header'>{it('txt-incident-device')}</header>
                <div className='content-header-btns'>
                  {activeContent === 'tableList' && accountType !== constants.soc.LIMIT_ACCOUNT &&
                    <span>{it('txt-autoSendState')}</span>
                  }

                  {activeContent === 'tableList' && accountType !== constants.soc.LIMIT_ACCOUNT && sendCheck.sendStatus &&
                    <CheckIcon style={{color:'#68cb51'}} />
                  }

                  {activeContent === 'tableList' && accountType !== constants.soc.LIMIT_ACCOUNT && !sendCheck.sendStatus &&
                    <CloseIcon style={{color:'#d63030'}} />
                  }

                  {activeContent === 'tableList' && accountType !== constants.soc.LIMIT_ACCOUNT && insertCheck &&
                    <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openSendMenu.bind()}>{it('txt-sendHealthCsv')}</Button>
                  }

                  {activeContent === 'tableList' &&
                    <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.getSlaveList}>{it('txt-exportHealthCsv')}</Button>
                  }

                  {activeContent === 'viewDevice' &&
                    <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>
                  }

                  {accountType !== constants.soc.LIMIT_ACCOUNT && insertCheck &&
                    <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.autoSendSettingsDialog.bind(this)}>{it('txt-autoSendSettings')}</Button>
                  }

                  {insertCheck && accountType === constants.soc.NONE_LIMIT_ACCOUNT && (_.includes(session.roles, constants.soc.SOC_Analyzer) || _.includes(session.roles, constants.soc.SOC_Executor)) &&
                    <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.getDeviceUsableList.bind(this, 'add')}>{t('txt-add')}</Button>
                  }

                  {accountType !== constants.soc.LIMIT_ACCOUNT && privCheck &&
                    <Link to='/SCP/configuration/notifications'>
                      <Button variant='outlined' color='primary' className='standard btn edit' >{t('notifications.txt-settings')}</Button>
                    </Link>
                  }
                </div>

                <TableContent
                  dataTableData={incidentDevice.dataContent}
                  dataTableFields={incidentDevice.dataFields}
                  dataTableSort={incidentDevice.sort}
                  paginationTotalCount={incidentDevice.totalCount}
                  paginationPageSize={incidentDevice.pageSize}
                  paginationCurrentPage={incidentDevice.currentPage}
                  handleTableSort={this.handleTableSort}
                  paginationPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                  paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')} />
              </div>
            }

            {activeContent === 'sendList' &&
              <div className='main-content'>
                <header className='main-header'>{it('txt-incident-device')}</header>
                <div className='content-header-btns'>
                  <Button variant='outlined' color='primary' className='standard btn list' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>
                  {this.state.setType === 'send' &&
                    <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.sendCsvWithOnlineEditData.bind(this)}>{it('txt-send')}</Button>
                  }
                  {this.state.setType === 'download' &&
                    <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.downloadCsvWithOnlineEditData.bind(this)}>{it('txt-exportHealthCsv')}</Button>
                  }
                </div>

                <SelecTableContent
                  hideNav={true}
                  dataTableData={healthStatistic.dataContent}
                  dataTableFields={healthStatistic.dataFields}
                  dataTableSort={healthStatistic.sort}
                  paginationTotalCount={healthStatistic.totalCount}
                  paginationPageSize={healthStatistic.pageSize}
                  paginationCurrentPage={healthStatistic.currentPage}
                  handleTableSort={this.handleSelectTableSort}
                  paginationPageChange={this.handleSelectPaginationChange.bind(this, 'currentPage')}
                  paginationDropDownChange={this.handleSelectPaginationChange.bind(this, 'pageSize')} />
              </div>
            }

            {(activeContent === 'viewDevice' || activeContent === 'editDevice' || activeContent === 'addDevice') &&
              this.displayEditDeviceContentWithStep()
            }
          </div>
        </div>
      </div>
    )
  }
}

IncidentDeviceStep.contextType = BaseDataContext;

IncidentDeviceStep.propTypes = {
  //nodeBaseUrl: PropTypes.string.isRequired
};

export default IncidentDeviceStep;