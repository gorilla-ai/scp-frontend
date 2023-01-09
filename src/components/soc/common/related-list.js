import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment'

import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardDateTimePicker } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import 'moment/locale/zh-tw'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'

import AddIcon from '@material-ui/icons/Add'
import Button from '@material-ui/core/Button'
import CancelIcon from '@material-ui/icons/Cancel'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'

import {BaseDataContext} from '../../common/context'
import constants from '../../constant/constant-incidnet'
import helper from '../../common/helper'
import MuiTableContent from '../../common/mui-table-content'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

const ALERT_LEVEL_COLORS = {
  Emergency: '#CC2943',
  Alert: '#CC7B29',
  Critical: '#29B0CC',
  Warning: '#29CC7A',
  Notice: '#7ACC29'
};

let t = null;
let f = null;
let it = null;

/**
 * Related List
 * @class
 * @author Ryan Chen <ryanchen@ns-guard.com>
 * @summary A react component for the related list content
 */
class RelatedList extends Component {
  constructor(props) {
    super(props);

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    f = global.chewbaccaI18n.getFixedT(null, 'tableFields');
    it = global.chewbaccaI18n.getFixedT(null, 'incident');

    this.state = {
      search: {
        keyword: '',
        datetime: {
          from: helper.getSubstractDate(1, 'month'),
          to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
        }
      },
      incident: {
        dataFieldsArr: ['_menu', 'id', 'tag', 'status', 'severity', 'createDttm', 'updateDttm', 'title', 'reporter', 'srcIPListString' , 'dstIPListString'],
        fileFieldsArr: ['fileName', 'fileSize', 'fileDttm', 'fileMemo', 'action'],
        flowFieldsArr: ['id', 'status', 'reviewDttm', 'reviewerName', 'suggestion'],
        dataFields: [],
        dataContent: [],
        sort: {
          field: 'createDttm',
          desc: true
        },
        totalCount: 0,
        currentPage: 1,
        pageSize: 10,
        info: {
          status: 1,
          socType: 1
        }
      },
      incidentList: []
    };

    this.ah = getInstance('chewbacca');
  }
  componentDidMount() {
    this.loadData();
    this.setIncidentList();
  }
  /**
   * Get and set Incident Device table data
   * @method
   * @param {string} fromSearch - option for the 'search'
   */
  loadData = (fromSearch) => {
    const {baseUrl, contextRoot, session} = this.context;
    const {search, incident} = this.state;
    const sort = incident.sort.desc ? 'desc' : 'asc';
    const page = fromSearch === 'currentPage' ? incident.currentPage : 0;
    let requestData = {
      accountRoleType: session.roles,
      account: session.accountId
    };

    if (search.keyword) {
      requestData.keyword = search.keyword;
    }

    if (search.datetime) {
      requestData.startDttm = moment(search.datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      requestData.endDttm = moment(search.datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    }

    helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

    ah.one({
      url: `${baseUrl}/api/soc/_searchV4?page=${page + 1}&pageSize=${incident.pageSize}&orders=${incident.sort.field} ${sort}`,
      data: JSON.stringify(requestData),
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json'
    })
    .then(data => {
      if (data) {
        let tempEdge = {...incident};
        tempEdge.dataContent = data.rt.rows;
        tempEdge.totalCount = data.rt.counts;
        tempEdge.currentPage = page;

        tempEdge.dataFields = _.map(incident.dataFieldsArr, val => {
          return {
            name: val === '_menu' ? '' : val,
            label: val === '_menu' ? '' : f(`incidentFields.${val}`),
            options: {
              filter: true,
              sort: val === 'severity' || val === 'id' || val === 'createDttm' || val === 'updateDttm',
              customBodyRenderLite: (dataIndex, options) => {
                const allValue = tempEdge.dataContent[dataIndex];
                let value = tempEdge.dataContent[dataIndex][val];

                if (options === 'getAllValue') {
                  return allValue;
                }

                if (val === '_menu') {
                  return (
                    <IconButton aria-label='Add' className='add-button' onClick={this.handleAddButton.bind(this, allValue)}>
                      <AddIcon />
                    </IconButton>
                  )
                } else if (val === 'type') {
                  let tmpList = [];
                  tmpList = allValue.ttpList;

                  if (tmpList.length === 0) {
                    return <span>{it('txt-incident-event')}</span>
                  } else {
                    return <span>{it('txt-incident-related')}</span>
                  }
                } else if (val === 'category') {
                  return <span>{it(`category.${value}`)}</span>
                } else if (val === 'status') {
                  let status = 'N/A'

                  if (allValue.flowData) {
                    if (allValue.flowData.finish) {
                      if (value === constants.soc.INCIDENT_STATUS_SUBMITTED) {
                        return <span>{it('status.4')}</span>
                      } else if (value === constants.soc.INCIDENT_STATUS_DELETED) {
                        return <span>{it('status.5')}</span>
                      } else if (value === constants.soc.INCIDENT_STATUS_EXECUTOR_CLOSE) {
                        return <span>{it('status.8')}</span>
                      } else {
                        return <span>{it('status.3')}</span>
                      }
                    } else {
                      if (value === constants.soc.INCIDENT_STATUS_EXECUTOR_CLOSE) {
                        return <span>{it('status.8')}</span>
                      } else if (allValue.flowData.currentEntity) {
                        status = allValue.flowData.currentEntity[allValue.id].entityName
                      }
                    }
                  } else if (value === constants.soc.INCIDENT_STATUS_DELETED) {
                    return <span>{it('status.5')}</span>
                  }
                  return <span>{status}</span>
                } else if (val === 'createDttm') {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                } else if (val === 'updateDttm') {
                  return <span>{helper.getFormattedDate(value, 'local')}</span>
                } else if (val === 'tag') {
                  const tags = _.map(allValue.tagList, 'tag.tag')

                  return (
                    <div>
                      {
                        _.map(allValue.tagList, el => {
                          return <div style={{display: 'flex', marginRight: '30px'}}>
                            <div className='incident-tag-square' style={{backgroundColor: el.tag.color}}></div>
                              &nbsp;{el.tag.tag}
                          </div>
                        })
                      }
                    </div>
                  )
                } else if (val === 'severity') {
                  return <span className='severity-level' style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>
                } else if (val === 'srcIPListString' || val === 'dstIPListString') {
                  let formattedPatternIP = ''

                  if (value.length > 32) {
                    formattedPatternIP = value.substr(0, 32) + '...';
                  } else {
                    formattedPatternIP = value
                  }
                  return <span>{formattedPatternIP}</span>
                } else {
                  return <span>{value}</span>
                }
              }
            }
          };
        });

        this.setState({
          incident: tempEdge
        });
      }
      return null
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  /**
   * Set default incident list
   * @method
   */
  setIncidentList = () => {
    this.setState({
      incidentList: this.props.incidentList
    });
  }
  /**
   * Handle add button in table list
   * @method
   * @param {object} allValue - values for related list
   */
  handleAddButton = (allValue) => {
    const {incidentList} = this.state;
    const id = allValue.id;
    let tempIncidentList = _.cloneDeep(incidentList);

    if (!_.includes(incidentList, id)) {
      tempIncidentList.push(id);

      this.setState({
        incidentList: tempIncidentList
      });
    }
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleSearchKeyword = (event) => {
    let tempSearch = {...this.state.search};
    tempSearch[event.target.name] = event.target.value;

    this.setState({
      search: tempSearch
    });
  }
  /**
   * Handle filter input data change
   * @method
   * @param {string} type - input type
   * @param {string} value - input value
   */
  handleSearchTime = (type, value) => {
    let tempSearch = {...this.state.search};
    tempSearch.datetime[type] = value;

    this.setState({
      search: tempSearch
    });
  }
  /**
   * Display filter content
   * @method
   * @returns HTML DOM
   */
  renderFilter = () => {
    const {locale} = this.context;
    const {search} = this.state;
    let dateLocale = locale;

    if (locale === 'zh') {
      dateLocale += '-tw';
    }

    moment.locale(dateLocale);

    return (
      <div className='filter-content'>
        <div className='group' className='keyword'>
          <TextField
            id='keyword'
            name='keyword'
            label={f('edgeFields.keywords')}
            variant='outlined'
            fullWidth={true}
            size='small'
            rows={1}
            multiline
            rowsMax={3}
            value={search.keyword}
            onChange={this.handleSearchKeyword}/>
        </div>
        <div className='group' className='date'>
          <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
            <KeyboardDateTimePicker
              className='date-time-picker'
              inputVariant='outlined'
              variant='inline'
              label={f('incidentFields.createDttm-start')}
              format='YYYY-MM-DD HH:mm'
              ampm={false}
              invalidDateMessage={t('txt-invalidDateMessage')}
              maxDateMessage={t('txt-maxDateMessage')}
              minDateMessage={t('txt-minDateMessage')}
              value={search.datetime.from}
              onChange={this.handleSearchTime.bind(this, 'from')} />
            <div className='between'>~</div>
            <KeyboardDateTimePicker
              className='date-time-picker'
              inputVariant='outlined'
              variant='inline'
              label={f('incidentFields.createDttm-end')}
              format='YYYY-MM-DD HH:mm'
              ampm={false}
              invalidDateMessage={t('txt-invalidDateMessage')}
              maxDateMessage={t('txt-maxDateMessage')}
              minDateMessage={t('txt-minDateMessage')}
              value={search.datetime.to}
              onChange={this.handleSearchTime.bind(this, 'to')} />
          </MuiPickersUtilsProvider>
        </div>

        <div className='button-group' className='buttons'>
          <Button variant='contained' color='primary' className='btn filter' onClick={this.loadData}>{t('txt-filter')}</Button>
          <Button variant='outlined' variant='outlined' color='primary' className='standard btn' onClick={this.clearFilter}>{t('txt-clear')}</Button>
        </div>
      </div>
    )
  }
  /**
   * Handle list remove
   * @method
   * @param {string} id - ID of the event
   * @returns HTML DOM
   */
  handleListRemove = (id) => {
    const {incidentList} = this.state;
    const index = incidentList.indexOf(id);

    if (index > -1) {
      let tempIncidentList = _.cloneDeep(incidentList);
      tempIncidentList.splice(index, 1);

      this.setState({
        incidentList: tempIncidentList
      });
    }
  }
  /**
   * Display list content
   * @method
   * @param {object} val - content of the list
   * @param {number} i - index of the list
   * @returns HTML DOM
   */
  renderList = (val, i) => {
    return (
      <div key={i} className='list'>
        <span className='remove-icon' onClick={this.handleListRemove.bind(this, val)}><CancelIcon /></span> <span>{val}</span>
      </div>
    )
  }
  /**
   * Clear filter input value
   * @method
   */
  clearFilter = () => {
    this.setState({
      search: {
        keyword: '',
        datetime: {
          from: helper.getSubstractDate(1, 'month'),
          to: moment().local().format('YYYY-MM-DDTHH:mm:ss')
        }
      }
    });
  }
  /**
   * Handle modal confirm
   * @method
   */
  handleRelatedConfirm = () => {
    this.props.setIncidentList(this.state.incidentList);
  }
  /**
   * Handle table pagination change
   * @method
   * @param {string} type - page type ('currentPage' or 'pageSize')
   * @param {number} value - new page number
   */
  handlePaginationChange = (type, value) => {
    let tempIncident = {...this.state.incident};
    tempIncident[type] = Number(value);

    if (type === 'pageSize') {
      tempIncident.currentPage = 0;
    }

    this.setState({
      incident: tempIncident
    }, () => {
      this.loadData(type);
    });
  }
  /**
   * Handle table sort
   * @method
   * @param {string} field - sort field
   * @param {string} boolean - sort type ('asc' or 'desc')
   */
  handleTableSort = (field, sort) => {
    let tempIncident = {...this.state.incident};
    tempIncident.sort.field = field;
    tempIncident.sort.desc = sort;

    this.setState({
      incident: tempIncident
    }, () => {
      this.loadData();
    });
  }
  render() {
    const {incident, incidentList} = this.state;
    const tableOptions = {
      tableBodyHeight: 'auto',
      onChangePage: (currentPage) => {
        this.handlePaginationChange('currentPage', currentPage);
      },
      onChangeRowsPerPage: (numberOfRows) => {
        this.handlePaginationChange('pageSize', numberOfRows);
      },
      onColumnSortChange: (changedColumn, direction) => {
        this.handleTableSort(changedColumn, direction === 'desc');
      }
    };
    const actions = {
      cancel: {text: t('txt-cancel'), className: 'standard', handler: this.props.toggleRelatedListModal},
      confirm: {text: t('txt-confirm'), handler: this.handleRelatedConfirm}
    };

    return (
      <ModalDialog
        id='relatedListDialog'
        className='modal-dialog'
        title={f('incidentFields.relatedList')}
        draggable={true}
        global={true}
        actions={actions}
        closeAction='cancel'>
        {this.renderFilter()}

        <div className='table-section'>
          <div className='table-content'>
            <MuiTableContent
              data={incident}
              tableOptions={tableOptions}
              tableHeight='auto' />
          </div>

          <div className='list-content'>
            <header>{t('txt-addedList')}</header>
            {incidentList.map(this.renderList)}
          </div>
        </div>
      </ModalDialog>
    )
  }
}

RelatedList.contextType = BaseDataContext;

RelatedList.propTypes = {
  incidentList: PropTypes.array.isRequired,
  setIncidentList: PropTypes.func.isRequired,
  toggleRelatedListModal: PropTypes.func.isRequired
};

export default RelatedList;