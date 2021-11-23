import React, {Component} from "react"
import {default as ah, getInstance} from "react-ui/build/src/utils/ajax-helper"
import cx from "classnames"
import Moment from 'moment'
import moment from 'moment'

import FileInput from 'react-ui/build/src/components/file-input'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {BaseDataContext} from "../common/context"
import SocConfig from "../common/soc-configuration"
import helper from "../common/helper"
import Autocomplete from '@material-ui/lab/Autocomplete';
import Events from './common/events'
import Ttps from './common/ttps'
import {downloadLink, downloadWithForm} from "react-ui/build/src/utils/download";
import DataTable from "react-ui/build/src/components/table";
import _ from "lodash";

import IncidentComment from './common/comment'
import IncidentTag from './common/tag'
import IncidentReview from './common/review'
import {KeyboardDateTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import NotifyContact from "./common/notifyContact";
import Menu from "@material-ui/core/Menu";
import constants from "../constant/constant-incidnet";
import MoreIcon from '@material-ui/icons/More';
import IconButton from '@material-ui/core/IconButton';
import IncidentFlowDialog from "./common/flow-dialog";
import MuiTableContentWithoutLoading from "../common/mui-table-content-withoutloading";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

let t = null;
let f = null;
let et = null;
let it = null;
let at = null;

const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];
const ALERT_LEVEL_COLORS = {
    Emergency: '#CC2943',
    Alert: '#CC7B29',
    Critical: '#29B0CC',
    Warning: '#29CC7A',
    Notice: '#7ACC29'
};

class IncidentManagement extends Component {
    constructor(props) {
        super(props);

        t = global.chewbaccaI18n.getFixedT(null, "connections");
        f = chewbaccaI18n.getFixedT(null, "tableFields");
        et = global.chewbaccaI18n.getFixedT(null, "errors");
        it = global.chewbaccaI18n.getFixedT(null, "incident");
        at = global.chewbaccaI18n.getFixedT(null, "account");

        this.state = {
            INCIDENT_ACCIDENT_LIST: _.map(_.range(1, 6), el => {
                return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
            }),
            INCIDENT_ACCIDENT_SUB_LIST: [
                _.map(_.range(11, 17), el => {
                    return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
                }),
                _.map(_.range(21, 26), el => {
                    return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
                }),
                _.map(_.range(31, 33), el => {
                    return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
                }),
                _.map(_.range(41, 45), el => {
                    return <MenuItem value={el}>{it(`accident.${el}`)}</MenuItem>
                })
            ],
            activeContent: 'tableList', //tableList, viewIncident, editIncident, addIncident
            displayPage: 'main', /* main, events, ttps */
            incidentType: '',
            toggleType:'',
            showFilter: false,
            showChart: true,
            currentIncident: {},
            originalIncident: {},
            accountType:constants.soc.LIMIT_ACCOUNT,
            accountDefault:false,
            severityList: [],
            socFlowList: [],
            selectedStatus:[],
            search: {
                keyword: '',
                category: 0,
                status: 0,
                datetime: {
                    from: helper.getSubstractDate(1, 'month'),
                    to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
                },
                isExpired: 2
            },
            severitySelected: [],
            dashboard: {
                all: 0,
                expired: 0,
                unhandled: 0,
                mine: 0
            },
            relatedListOptions: [],
            deviceListOptions: [],
            showDeviceListOptions: [],
            incident: {
                dataFieldsArr: ['_menu', 'id', 'tag', 'status', 'severity', 'createDttm', 'title', 'reporter', 'srcIPListString' , 'dstIPListString'],
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
                pageSize: 20,
                info: {
                    status: 1,
                    socType: 1
                }
            },
            accountRoleType:[],
            loadListType:2,
            attach: null,
            contextAnchor: null,
            currentData: {},
        };

        this.ah = getInstance("chewbacca");
    }

    componentDidMount() {
        const {locale, sessionRights} = this.context;
        helper.getPrivilegesInfo(sessionRights, 'soc', locale);

        let alertDataId = this.getQueryString('alertDataId');
        let alertData = sessionStorage.getItem(alertDataId);

        this.checkAccountType();
        this.setDefaultSearchOptions(alertData, alertDataId);

    }


    setDefaultSearchOptions = (alertData, alertDataId) => {
        const {baseUrl} = this.context;
        const severityList = _.map(SEVERITY_TYPE, (val, i) => {
            return <MenuItem key={i} value={val}>{val}</MenuItem>
        });
        let flowSourceList = []
        ah.one({
            url: `${baseUrl}/api/soc/flow/_search`,
            data: JSON.stringify({}),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        }).then(data => {
            if (data) {

                let list = _.map(data.rt.rows, val => {
                    flowSourceList.push(val);
                    return <MenuItem key={val.id} value={val.id}>{`${val.name}`}</MenuItem>
                });

                this.setState({
                    socFlowSourceList:flowSourceList,
                    socFlowList:list
                });
            }
        }).catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        });


        this.setState({
            severityList,
        }, () => {
            if (alertData) {
                this.toggleContent('redirect', alertData);
                sessionStorage.removeItem(alertDataId)
                const {session} = this.context;

                this.setState({
                    accountRoleType: session.roles
                }, () =>{
                    this.getOptions();
                });


            } else {
                const {session} = this.context;

                this.setState({
                    accountRoleType: session.roles
                }, () => {
                    this.loadCondition('button', 'mine')
                    this.getOptions();
                });
            }
        });


    }

    getQueryString(name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    checkAccountType = () =>{
        const {baseUrl, session} = this.context;
        let requestData={
            account:session.accountId
        }
        ah.one({
            url: `${baseUrl}/api/soc/unit/limit/_check`,
            data: JSON.stringify(requestData),
            type: 'POST',
            contentType: 'text/plain'
        })
            .then(data => {
                if (data) {

                    if (data.rt.isLimitType === constants.soc.LIMIT_ACCOUNT){
                        this.setState({
                            accountType: constants.soc.LIMIT_ACCOUNT
                        })
                    }else if (data.rt.isLimitType === constants.soc.NONE_LIMIT_ACCOUNT){
                        this.setState({
                            accountType: constants.soc.NONE_LIMIT_ACCOUNT
                        })
                    }else {
                        this.setState({
                            accountType: constants.soc.CHECK_ERROR
                        })
                    }
                }
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            });
    }

    /**
     * Get request data payload
     * @method
     */
    getIncidentRequestData = () => {
        const {session} = this.context;
        const {search, severitySelected, selectedStatus, incident, accountRoleType} = this.state;

        if (search.datetime) {
            search.startDttm = Moment(search.datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
            search.endDttm = Moment(search.datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
        }

        search.isExecutor = _.includes(session.roles, 'SOC Executor');
        search.accountRoleType = accountRoleType;
        search.account = session.accountId;
        search.status = selectedStatus;

        const requestData = {
            ...search,
            severity: severitySelected
        };

        return requestData;
    }

    /**
     * Get and set Incident Device table data
     * @method
     * @param {string} fromSearch - option for the 'search'
     */
    loadData = (fromSearch) => {
        const {baseUrl, contextRoot} = this.context;
        const {incident} = this.state;
        const sort = incident.sort.desc ? 'desc' : 'asc';
        const page = fromSearch === 'currentPage' ? incident.currentPage : 0;
        const requestData = this.getIncidentRequestData();

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
                            sort: val === 'severity' || val === 'id' || val === 'createDttm',
                            customBodyRenderLite: (dataIndex, options) => {
                                const allValue = tempEdge.dataContent[dataIndex];
                                let value = tempEdge.dataContent[dataIndex][val];

                                if (options === 'getAllValue') {
                                    return allValue;
                                }

                                if (val === '_menu') {
                                    return <IconButton aria-label="more" onClick={this.handleOpenMenu.bind(this, allValue)}>
                                        <MoreIcon/>
                                    </IconButton>
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
                                    // return <span>{it(`status.${value}`)}</span>
                                    let status = 'N/A'
                                    if (allValue.flowData) {

                                        if (allValue.flowData.finish) {
                                            if (value === constants.soc.INCIDENT_STATUS_SUBMITTED) {
                                                return <span>{it('status.4')}</span>
                                            } else if (value === constants.soc.INCIDENT_STATUS_DELETED){
                                                return <span>{it('status.5')}</span>
                                            } else if (value === constants.soc.INCIDENT_STATUS_EXECUTOR_CLOSE){
                                                return <span>{it('status.8')}</span>
                                            } else{
                                                return <span>{it('status.3')}</span>
                                            }
                                        }else{
                                            if (value === constants.soc.INCIDENT_STATUS_EXECUTOR_CLOSE){
                                                return <span>{it('status.8')}</span>
                                            }else if (allValue.flowData.currentEntity) {
                                                status = allValue.flowData.currentEntity[allValue.id].entityName
                                            }
                                        }


                                    } else if (value === constants.soc.INCIDENT_STATUS_DELETED){
                                        return <span>{it('status.5')}</span>
                                    }
                                    return <span>{status}</span>
                                } else if (val === 'createDttm') {
                                    return <span>{helper.getFormattedDate(value, 'local')}</span>
                                } else if (val === 'tag') {
                                    const tags = _.map(allValue.tagList, 'tag.tag')

                                    return <div>
                                        {
                                            _.map(allValue.tagList, el => {
                                                return <div style={{display: 'flex', marginRight: '30px'}}>
                                                    <div className='incident-tag-square' style={{backgroundColor: el.tag.color}}></div>
                                                    &nbsp;{el.tag.tag}
                                                </div>
                                            })
                                        }
                                    </div>

                                } else if (val === 'severity') {
                                    return <span className='severity-level'
                                                 style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>;
                                } else if (val === 'srcIPListString' || val === 'dstIPListString'){
                                    let formattedPatternIP = ''
                                    if (value.length > 32) {
                                        formattedPatternIP = value.substr(0, 32) + '...';
                                    }else{
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

                this.setState({incident: tempEdge, activeContent: 'tableList',loadListType :3,})
            }
            return null
        })
        .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        })
    };


    /**
     * Get and set Incident Device table data
     * @method
     * @param {string} fromSearch - option for the 'search'
     */
    loadWithoutDateTimeData = (fromSearch, searchPayload) => {
        const {baseUrl, contextRoot, session} = this.context;
        const {incident} = this.state;
        const sort = incident.sort.desc ? 'desc' : 'asc';
        const page = fromSearch === 'currentPage' ? incident.currentPage : 0;

        searchPayload.account = session.accountId
        searchPayload.status = this.state.selectedStatus

        ah.one({
            url: `${baseUrl}/api/soc/_searchV4?page=${page + 1}&pageSize=${incident.pageSize}&orders=${incident.sort.field} ${sort}`,
            data: JSON.stringify(searchPayload),
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
                                sort: val === 'severity' || val === 'id' || val === 'createDttm',
                                customBodyRenderLite: (dataIndex, options) => {
                                    const allValue = tempEdge.dataContent[dataIndex];
                                    let value = tempEdge.dataContent[dataIndex][val];

                                    if (options === 'getAllValue') {
                                        return allValue;
                                    }

                                    if (val === '_menu') {
                                        return <div className='table-menu active'>
                                            <IconButton aria-label="more"
                                                        onClick={this.handleOpenMenu.bind(this, allValue)}>
                                                <MoreIcon/>
                                            </IconButton>
                                        </div>
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
                                                } else if (value === constants.soc.INCIDENT_STATUS_DELETED){
                                                    return <span>{it('status.5')}</span>
                                                }else if (value === constants.soc.INCIDENT_STATUS_EXECUTOR_CLOSE){
                                                    return <span>{it('status.8')}</span>
                                                }  else{
                                                    return <span>{it('status.3')}</span>
                                                }
                                            }else{
                                                if (value === constants.soc.INCIDENT_STATUS_EXECUTOR_CLOSE){
                                                    return <span>{it('status.8')}</span>
                                                }else if (allValue.flowData.currentEntity) {
                                                    status = allValue.flowData.currentEntity[allValue.id].entityName
                                                }
                                            }


                                        } else if (value === constants.soc.INCIDENT_STATUS_DELETED){
                                            return <span>{it('status.5')}</span>
                                        }
                                        return <span>{status}</span>
                                    } else if (val === 'createDttm') {
                                        return <span>{helper.getFormattedDate(value, 'local')}</span>
                                    } else if (val === 'tag') {
                                        const tags = _.map(allValue.tagList, 'tag.tag')

                                        return <div>
                                            {
                                                _.map(allValue.tagList, el => {
                                                    return <div style={{display: 'flex', marginRight: '30px'}}>
                                                        <div className='incident-tag-square' style={{backgroundColor: el.tag.color}}/>
                                                        &nbsp;{el.tag.tag}
                                                    </div>
                                                })
                                            }
                                        </div>

                                    } else if (val === 'severity') {
                                        return <span className='severity-level'
                                                     style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>;
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

                    this.setState({incident: tempEdge, activeContent: 'tableList'}, () => {
                        this.loadDashboard()
                    })
                }
                return null
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })
    };

    loadDashboard = () => {
        const {baseUrl, session} = this.context

        let req = {
            accountRoleType :this.state.accountRoleType
        }

        ah.all([
            {
                url: `${baseUrl}/api/soc/statistic/_search?creator=${session.accountId}`,
                data: JSON.stringify(req),
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json'
            }
        ])
        .then(data => {
            let dashboard = {
                expired: data[0].rt.rows[0].expireCount,
                unhandled: data[0].rt.rows[0].dealCount,
                mine: data[0].rt.rows[0].myCount,
            }

            this.setState({dashboard})
        })
        .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        })
    }

    loadCondition = (from,type) => {
        const {session} = this.context
        let fromSearch = from
        if (from === 'button'){
            fromSearch = 'search'
        }
        let search = {
            subStatus:0,
            keyword: '',
            category: 0,
            isExpired: 2,
            accountRoleType: this.state.accountRoleType,
            isExecutor : _.includes(session.roles, 'SOC Executor'),
        }
        if (type === 'expired') {
            this.setState({loadListType: 0})
            search.status = 0
            search.isExpired = 1;
            this.loadWithoutDateTimeData(fromSearch,search)
        }else if (type === 'mine') {
            this.setState({loadListType: 2})
            search.status = 0
            search.creator = session.accountId
            this.loadWithoutDateTimeData(fromSearch,search)
        }else{

        }
        this.clearFilter()
    }

    /**
     * Handle open menu
     * @method
     * @param {object} data - active data
     * @param {object} event - event object
     */
    handleOpenMenu = (data, event) => {
        this.setState({
            contextAnchor: event.currentTarget,
            currentData: data
        });
    }
    /**
     * Handle close menu
     * @method
     */
    handleCloseMenu = () => {
        this.setState({
            contextAnchor: null,
            currentData: {}
        });
    }


    handleRowMouseOver = (index, allValue, evt) => {
        let tempIncident = {...this.state.incident};
        tempIncident['dataContent'] = _.map(tempIncident['dataContent'], el => {
            return {...el, _menu: el.id === allValue.id}
        });
        this.setState({incident: tempIncident})
    };


    /* ------------------ View ------------------- */
    render() {
        const {activeContent, baseUrl, contextRoot, showFilter, showChart, incident,  contextAnchor, currentData, accountType} = this.state
        const {session} = this.context
        let insertCheck = false;
        if (_.includes(session.roles, constants.soc.SOC_Analyzer) || _.includes(session.roles, constants.soc.SOC_Executor)){
            insertCheck = true
        }

        const tableOptions = {
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

        return <div>
            <IncidentComment ref={ref => { this.incidentComment=ref }} />
            {this.state.loadListType === 0 && (
                <IncidentTag ref={ref => { this.incidentTag=ref }} onLoad={this.loadCondition.bind(this,'button','expired')} />
            )}
            {this.state.loadListType === 1 && (
                <IncidentTag ref={ref => { this.incidentTag=ref }} onLoad={this.loadCondition.bind(this,'button','unhandled')} />
            )}
            {this.state.loadListType === 2 && (
                <IncidentTag ref={ref => { this.incidentTag=ref }} onLoad={this.loadCondition.bind(this,'button','mine')} />
            )}
            {this.state.loadListType === 3 && (
                <IncidentTag ref={ref => { this.incidentTag=ref }} onLoad={this.loadData.bind(this)} />
            )}

            <IncidentFlowDialog ref={ref => {this.incidentFlowDialog = ref}}/>
            <IncidentReview ref={ref => { this.incidentReview=ref }} loadTab={'manager'} onLoad={this.getIncident.bind(this)} />

            <Menu
                anchorEl={contextAnchor}
                keepMounted
                open={Boolean(contextAnchor)}
                onClose={this.handleCloseMenu}>
                <MenuItem onClick={this.getIncident.bind(this, currentData.id,'view')}>{t('txt-view')}</MenuItem>
                <MenuItem onClick={this.openIncidentTag.bind(this, currentData.id)}>{it('txt-tag')}</MenuItem>
                <MenuItem onClick={this.exportPdfFromTable.bind(this, currentData)}>{t('txt-export')}</MenuItem>


                {currentData.status === constants.soc.INCIDENT_STATUS_DELETED &&
                    <MenuItem onClick={this.openReviewModal.bind(this, currentData, 'restart')}>{it('txt-restart')}</MenuItem>
                }
                {_.includes(this.state.accountRoleType,constants.soc.SOC_Executor) && currentData.status !== constants.soc.INCIDENT_STATUS_DELETED &&
                <MenuItem onClick={this.openReviewModal.bind(this, currentData, 'delete')}>{it('txt-delete')}</MenuItem>
                }
                {!(currentData.flowData && currentData.flowData.finish) &&
                    <MenuItem onClick={this.openIncidentFlow.bind(this, currentData.id)}>{it('txt-view-flow')}</MenuItem>
                }
                {(currentData.flowData && currentData.flowData.finish) && (currentData.status !== constants.soc.INCIDENT_STATUS_DELETED || currentData.status !== constants.soc.INCIDENT_STATUS_CLOSED) &&
                    <MenuItem onClick={this.sendIncident.bind(this, currentData.id)}>{it('txt-send')}</MenuItem>
                }
                {currentData.status === constants.soc.INCIDENT_STATUS_SUBMITTED || currentData.status === constants.soc.INCIDENT_STATUS_CLOSED || (currentData.flowData && currentData.flowData.finish) && currentData.status !== constants.soc.INCIDENT_STATUS_DELETED &&
                    <MenuItem onClick={this.getIncidentSTIXFile.bind(this, currentData.id)}>{it('txt-download')}</MenuItem>
                }

            </Menu>

            <div className="sub-header">
                <div className='secondary-btn-group right'>
                    <button className={cx('', {'active': showFilter})} onClick={this.toggleFilter}
                            title={t('txt-filter')}><i className='fg fg-filter'/></button>
                    <button className={cx('', {'active': showChart})} onClick={this.toggleChart}
                            title={it('txt-statistics')}><i className='fg fg-chart-columns'/></button>
                    {accountType === constants.soc.NONE_LIMIT_ACCOUNT &&
                        <button className='' onClick={this.openIncidentTag.bind(this, null)}
                                title={it('txt-custom-tag')}><i className='fg fg-color-ruler'/></button>
                    }
                    <button className='' onClick={this.openIncidentComment.bind(this)}
                            title={it('txt-comment-example-edit')}><i className='fg fg-report'/></button>
                </div>
            </div>

            <div className='data-content'>
                <SocConfig baseUrl={baseUrl} contextRoot={contextRoot} session={session} accountType={accountType} />

                <div className='parent-content'>
                    {this.renderStatistics()}
                    {this.renderFilter()}

                    {activeContent === 'tableList' &&
                    <div className='main-content'>
                        <header className='main-header'>{it('txt-incident')}</header>
                        <div className='content-header-btns with-menu '>
                            {activeContent === 'viewIncident' &&
                            <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>
                            }
                            {_.size(incident.dataContent) > 0 &&
                            <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.exportAll.bind(this)}>{it('txt-export-all')}</Button>
                            }
                            {_.size(incident.dataContent) > 0 &&
                            <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.exportAllByWord.bind(this)}>{it('txt-export-all-word')}</Button>
                            }
                            {accountType === constants.soc.NONE_LIMIT_ACCOUNT && insertCheck &&
                            <Button variant='outlined' color='primary' className='standard btn edit'
                                    onClick={this.toggleContent.bind(this, 'addIncident', 'events')}>{it('txt-addIncident-events')}</Button>
                            }
                            {accountType === constants.soc.NONE_LIMIT_ACCOUNT && insertCheck &&
                            <Button variant='outlined' color='primary' className='standard btn edit'
                                    onClick={this.toggleContent.bind(this, 'addIncident', 'ttps')}>{it('txt-addIncident-ttps')}</Button>
                            }
                            </div>
                        <MuiTableContentWithoutLoading
                            data={incident}
                            tableOptions={tableOptions} />
                    </div>
                    }

                    {
                        (activeContent === 'viewIncident' || activeContent === 'editIncident' || activeContent === 'addIncident') &&
                        this.displayEditContent()
                    }
                </div>
            </div>
        </div>
    }

    /**
     * Display edit Incident content
     * @method
     * @returns HTML DOM
     */
    displayEditContent = () => {
        const {session} = this.context
        const {activeContent, incidentType, incident, toggleType, displayPage} = this.state;

        let editCheck = false
        let drawCheck = false
        let submitCheck = false
        let auditCheck = false
        let returnCheck = false
        let publishCheck = false
        let transferCheck = false
        // new
        let signCheck = false
        let closeCheck = false
        let restartCheck = false
        let deleteCheck = false



        if (_.includes(this.state.accountRoleType,constants.soc.SOC_Super) || _.includes(this.state.accountRoleType,constants.soc.SOC_Ciso)) {
            if (incident.info.flowData && incident.info.flowData.finish){
                publishCheck = true
            }
        }

        if (_.includes(this.state.accountRoleType,constants.soc.SOC_Executor)) {
            closeCheck = true
            deleteCheck = true
        }

        if (incident.info.status === constants.soc.INCIDENT_STATUS_UNREVIEWED) {
            if (_.includes(this.state.accountRoleType,constants.soc.SOC_Executor)) {
                editCheck = true
            }
            if (session.accountId === incident.info.creator){
                editCheck = true
            }
        } else if (incident.info.status === constants.soc.INCIDENT_STATUS_REVIEWED) {

        } else if (incident.info.status === constants.soc.INCIDENT_STATUS_CLOSED) {
            closeCheck = false
        } else if (incident.info.status === constants.soc.INCIDENT_STATUS_SUBMITTED) {

        } else if (incident.info.status === constants.soc.INCIDENT_STATUS_DELETED) {
            if (_.includes(this.state.accountRoleType,constants.soc.SOC_Executor)) {
                restartCheck = true
                deleteCheck = false
                closeCheck = false
            }

        } else if (incident.info.status === constants.soc.INCIDENT_STATUS_ANALYZED) {

        } else if (incident.info.status === constants.soc.INCIDENT_STATUS_EXECUTOR_UNREVIEWED) {

        }else if (incident.info.status === constants.soc.INCIDENT_STATUS_EXECUTOR_CLOSE) {

        }



        let tmpTagList = []

        if(incident.info.tagList && incident.info.tagList.length >= 3){
            tmpTagList = incident.info.tagList.slice(0,3);
        }else{
            tmpTagList = incident.info.tagList
        }

        return <div className='main-content basic-form'>
            <header className='main-header' style={{display: 'flex'}}>
                {it(`txt-${activeContent}-${incidentType}`)}
                {
                    activeContent !== 'addIncident' &&
                    <div className='msg' style={{display: 'flex'}}>{it('txt-id')}<span style={{color: 'red'}}>{incident.info.id}</span>
                        <div style={{display: 'flex', marginLeft: '10px'}}>
                        {
                            _.map(tmpTagList, el => {
                                    let formattedWording = ''
                                    if (el.tag.tag.length > 6){
                                        formattedWording = el.tag.tag.substr(0, 6) + '...';
                                    }else{
                                        formattedWording = el.tag.tag;
                                    }
                                return (
                                    <div style={{display: 'flex', marginRight: '5px'}}>
                                    <div className='incident-tag-square' style={{backgroundColor: el.tag.color}}/>
                                        {formattedWording}
                                    </div>
                                )
                            })
                        }
                        {incident.info.tagList && incident.info.tagList.length >= 3 && "..."}
                        </div>
                    </div>
                }
            </header>
            {activeContent === 'viewIncident' &&
            <div className='content-header-btns'>
                <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>

                {editCheck &&
                <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'editIncident')}>{t('txt-edit')}</Button>
                }
                {drawCheck &&
                <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'draw')}>{it('txt-draw')}</Button>
                }
                {submitCheck &&
                <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'submit')}>{it('txt-submit')}</Button>
                }
                {returnCheck &&
                <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'return')}>{it('txt-return')}</Button>
                }
                {auditCheck &&
                <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'auditV2')}>{it('txt-audit')}</Button>
                }
                {transferCheck &&
                <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'analyze')}>{it('txt-transfer')}</Button>
                }
                {signCheck &&
                <Button variant='outlined' color='primary' className='standard btn edit'  onClick={this.openReviewModal.bind(this, incident.info, 'sign')}>{it('txt-sign')}</Button>
                }
                {closeCheck &&
                <Button variant='outlined' color='primary' className='standard btn edit'  onClick={this.openReviewModal.bind(this, incident.info, 'closeV2')}>{it('txt-close')}</Button>
                }
                {publishCheck &&
                <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openSendMenu.bind(this, incident.info.id)}>{it('txt-send')}</Button>
                }
                {deleteCheck &&
                <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'delete')}>{it('txt-delete')}</Button>
                }
                {restartCheck &&
                <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.openReviewModal.bind(this, incident.info, 'restart')}>{it('txt-restart')}</Button>
                }
                <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.exportPdf.bind(this)}>{t('txt-export')}</Button>
                <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.notifyContact.bind(this)}>{it('txt-notify')}</Button>
            </div>
            }

            <div className='auto-settings' style={{height: '70vh'}}>
                {
                    displayPage === 'main' && this.displayMainPage()
                }
                {
                    _.includes(['addIncident', 'editIncident', 'viewIncident'], activeContent) && displayPage === 'main' &&  this.displayNoticePage()
                }
                {
                    _.includes(['addIncident', 'editIncident', 'viewIncident'], activeContent) && displayPage === 'main' && this.displayAttached()
                }
                {
                    _.includes(['addIncident', 'editIncident', 'viewIncident'], activeContent) && displayPage === 'main' &&  this.displayConnectUnit()
                }
                {
                    activeContent !== 'addIncident' &&  displayPage === 'main' && this.displayFlow()
                }
            {
                displayPage === 'events' && this.displayEventsPage()
            }
            {
                displayPage === 'ttps' && this.displayTtpPage()
            }
            </div>

            {
                activeContent === 'editIncident' &&
                <footer>
                    <Button variant='outlined' color='primary' className='standard'  onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</Button>
                    <Button variant='contained' color='primary'  onClick={this.handleSubmit}>{t('txt-save')}</Button>
                </footer>
            }
            {
                activeContent === 'addIncident' &&
                <footer>
                    <Button variant='outlined' color='primary' className='standard'  onClick={this.toggleContent.bind(this, 'cancel-add')}>{t('txt-cancel')}</Button>
                    <Button variant='contained' color='primary'onClick={this.handleSubmit}>{t('txt-save')}</Button>
                </footer>
            }
        </div>
    };

    handleIncidentPageChange = (val) => {
        this.setState({displayPage: val})
    };

    displayMainPage = () => {
        const {activeContent, incidentType, incident, severityList, socFlowList} = this.state;
        const {locale} = this.context;
        let dateLocale = locale;

        if (locale === 'zh') {
            dateLocale += '-tw';
        }

        moment.locale(dateLocale);

        return <div className='form-group normal'>
            <header>
                <div className='text'>{t('edge-management.txt-basicInfo')}</div>
                {activeContent !== 'addIncident' &&
                <span
                    className='msg'>{f('incidentFields.updateDttm')} {helper.getFormattedDate(incident.info.updateDttm, 'local')}</span>
                }
            </header>

            <Button className='last-left' disabled={true} style={{backgroundColor:'#001b34',color:'#FFFFFF'}}
                    onClick={this.handleIncidentPageChange.bind(this, 'main')}>{it('txt-prev-page')}</Button>

            <Button className='last' style={{backgroundColor:'#001b34',color:'#FFFFFF'}}
                    onClick={this.handleIncidentPageChange.bind(this, 'events')}>{it('txt-next-page')}</Button>

            <div className='group full'>
                <label htmlFor='title'>{f('incidentFields.title')}</label>
                <TextField
                    id='title'
                    name='title'
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    onChange={this.handleDataChangeMui}
                    value={incident.info.title}
                    helperText={it('txt-required')}
                    required
                    error={!(incident.info.title || '')}
                    disabled={activeContent === 'viewIncident'}/>
            </div>
            <div className='group'>
                <label htmlFor='category'>{f('incidentFields.category')}</label>
                <TextField
                    id='category'
                    name='category'
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    onChange={this.handleDataChangeMui}
                    helperText={it('txt-required')}
                    required
                    select
                    value={incident.info.category}
                    error={!(incident.info.category || '')}
                    disabled={activeContent === 'viewIncident'}>
                    {_.map(_.range(1, 9), el => {
                        return <MenuItem value={el}>{it(`category.${el}`)}</MenuItem>
                    })
                    }</TextField>
            </div>
            <div className='group'>
                <label htmlFor='reporter'>{f('incidentFields.reporter')}</label>
                <TextField
                    id='reporter'
                    name='reporter'
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    onChange={this.handleDataChangeMui}
                    required
                    helperText={it('txt-required')}
                    error={!(incident.info.reporter || '')}
                    value={incident.info.reporter}
                    disabled={activeContent === 'viewIncident'}/>
            </div>

            <div className='group'>
                <label htmlFor='reporter'>{f('incidentFields.flowId')}</label>
                <TextField
                    id='flowTemplateId'
                    name='flowTemplateId'
                    select
                    required
                    fullWidth={true}
                    variant='outlined'
                    size='small'
                    onChange={this.handleDataChangeMui}
                    value={incident.info.flowTemplateId}
                    disabled={activeContent === 'viewIncident' || activeContent === 'editIncident'}>
                    {socFlowList}
                </TextField>
            </div>

            <div className='group'>
                <label htmlFor='impactAssessment'>{f('incidentFields.impactAssessment')}</label>
                <TextField
                    id='impactAssessment'
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    select
                    name='impactAssessment'
                    onChange={this.handleDataChangeMui}
                    required
                    helperText={it('txt-required')}
                    value={incident.info.impactAssessment}
                    error={!(incident.info.impactAssessment || '')}
                    disabled={true}>
                    {
                        _.map(_.range(1, 5), el => {
                            return  <MenuItem value={el}>{`${el} (${(9 - 2 * el)} ${it('txt-day')})`}</MenuItem>
                        })
                    }
                </TextField>
            </div>

            <div className='group severity-level' style={{width: '25vh', paddingTop: '27px'}}>
                <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[incident.info.severity]}}/>
                <TextField
                    id='severityLevel'
                    name='severity'
                    select
                    fullWidth={true}
                    label={f('syslogPatternTableFields.severity')}
                    variant='outlined'
                    size='small'
                    onChange={this.handleDataChangeMui}
                    value={incident.info.severity}
                    disabled={activeContent === 'viewIncident'}>
                    {severityList}
                </TextField>
            </div>

            <div className='group' style={{width: '25vh', paddingLeft: '5%'}}>
                <label htmlFor='expireDttm'>{f('incidentFields.finalDate')}</label>
                <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
                    <KeyboardDateTimePicker
                        id='expireDttm'
                        className='date-time-picker'
                        inputVariant='outlined'
                        variant='inline'
                        format='YYYY-MM-DD HH:mm'
                        ampm={false}
                        required
                        helperText={it('txt-required')}
                        value={incident.info.expireDttm}
                        readOnly={activeContent === 'viewIncident' }
                        onChange={this.handleDataChange.bind(this, 'expireDttm')} />
                </MuiPickersUtilsProvider>
            </div>

            {incidentType === 'ttps' && <div className='group full'>
                <label htmlFor='description'>{f('incidentFields.description')}</label>
                <TextField
                    id='description'
                    onChange={this.handleDataChangeMui}
                    required
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    multiline
                    rows={3}
                    rowsMax={3}
                    helperText={it('txt-required')}
                    name='description'
                    error={!(incident.info.description || '')}
                    value={incident.info.description}
                    disabled={activeContent === 'viewIncident'}/>
            </div>}

            {incidentType === 'ttps' &&
            <div className='group full'>
                <label htmlFor='relatedList'>{f('incidentFields.relatedList')}</label>
                <Autocomplete
                    multiple
                    id="tags-standard"
                    size='small'
                    options={incident.info.differenceWithOptions}
                    getOptionLabel={(option) => option.text}
                    // onChange={this.handleDataChange.bind(this, 'relatedList')}
                    value={incident.info.showFontendRelatedList}
                    onChange={this.onTagsChange}
                    disabled={activeContent === 'viewIncident'}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant='outlined'
                            size='small'
                            fullWidth={true}
                        />
                    )}
                />
            </div>
            }

        </div>
    };

    onTagsChange = (event, values) => {

        // let tempList = []
        // _.forEach(values, el => {
        //     tempList.push(el.text)
        // })

        let temp = {...this.state.incident};
        // temp.info['relatedList'] = tempList;
        temp.info['showFontendRelatedList'] = values;

        this.setState({
            incident: temp
        })
    }

    formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0 || bytes === '0'){
            return '0 Bytes';
        }

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    handleAttachChange = (val) => {
        let flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]<>+《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")
        if (flag.test(val.name)){
            helper.showPopupMsg( it('txt-attachedFileNameError'), t('txt-error'), )
            this.setState({attach: null})
        }else{
            this.setState({attach: val})
        }
    }

    handleAFChange(file) {
        let flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]<>+《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")

        if (flag.test(file.name)){
            helper.showPopupMsg( it('txt-attachedFileNameError'), t('txt-error'), )
            this.setState({attach: null})
        }
    }

    getErrorMsg = (code, params) => {
        if (params.code === 'file-too-large') {
            return it('file-too-large')
        }
    }

    uploadAttachmentModal() {
        PopupDialog.prompt({
            title: t('txt-upload'),
            confirmText: t('txt-confirm'),
            cancelText: t('txt-cancel'),
            display: <div className='c-form content'>
                <div>
                    <FileInput id='attach' name='file'  validate={{ max:20 ,t: this.getErrorMsg}}
                               onChange={this.handleAFChange} btnText={t('txt-selectFile')} />
                </div>
                <div>
                    <label>{it('txt-fileMemo')}</label>
                    <TextareaAutosize id='comment'
                                      className='textarea-autosize' rows={3} />
                </div>
            </div>,
            act: (confirmed, data) => {

                if (confirmed) {
                    let flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]<>+《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")

                    if (flag.test(data.file.name)){
                    }else{
                        this.uploadAttachmentByModal(data.file, data.comment)
                    }
                }
            }
        })
    }

    handleDownloadAll = () => {
        const {baseUrl, contextRoot} = this.context;
        const {incident} = this.state;
        const url = `${baseUrl}${contextRoot}/api/soc/attachment/_download/all?id=${incident.info.id}`

        downloadLink(url);
    }

    displayAttached = () => {
        const {activeContent, incidentType, incident, attach} = this.state;
        let dataFields = {};
        incident.fileFieldsArr.forEach(tempData => {
            dataFields[tempData] = {
                label: tempData === 'action' ? '' : f(`incidentFields.${tempData}`),
                sortable: this.checkSortable(tempData),
                formatter: (value, allValue, i) => {
                    if (tempData === 'fileSize') {
                        return <span>{this.formatBytes(value)}</span>
                    }
                    else if (tempData === 'fileDttm') {
                        return <span>{Moment(value).local().format('YYYY-MM-DD HH:mm:ss')}</span>
                    }
                    else if (tempData === 'fileMemo') {
                        if (incident.info.attachmentDescription){
                            const target = _.find(JSON.parse(incident.info.attachmentDescription), {fileName: allValue.fileName})

                            let formattedWording = ''
                            if (target.fileMemo && target.fileMemo.length > 32) {
                                formattedWording = target.fileMemo.substr(0, 32) + '...';
                            }else{
                                formattedWording = target.fileMemo
                            }
                            return <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>{formattedWording}</span>
                        }
                    }
                    else if (tempData === 'action') {
                        let isShow = true

                        if (incident.info.status === 3 || incident.info.status === 4) {
                            if (Moment(allValue.fileDttm).valueOf() < Moment(incident.info.updateDttm).valueOf()) {
                                isShow = false
                            }
                        }

                        return <div>
                            <i className='c-link fg fg-data-download' title={t('txt-download')} onClick={this.downloadAttachment.bind(this, allValue)} />
                            {
                                isShow &&
                                <i className='c-link fg fg-trashcan' title={t('txt-delete')} onClick={this.deleteAttachment.bind(this, allValue)} />
                            }
                        </div>
                    }
                    else {
                        return <span>{value}</span>
                    }
                }
            }
        });

        incident.fileFields = dataFields;

        return <div className='form-group normal'>
            <header>
                <div className='text'>{it('txt-attachedFile')}<span style={{color:'red','fontSize':'0.8em'}}>{it('txt-attachedFileHint')}</span></div>
            </header>
            {
                activeContent === 'addIncident' &&
                <div className='group'>
                    <FileInput
                        id='attach'
                        name='file'
                        className='file-input'
                        validate={{ max:20 ,t: this.getErrorMsg}}
                        onChange={this.handleAttachChange}
                        btnText={t('txt-selectFile')} />
                </div>
            }
            {
                activeContent === 'addIncident' &&
                <div className='group'>
                    <label htmlFor='fileMemo'>{it('txt-fileMemo')}</label>
                    <TextareaAutosize
                        id='fileMemo'
                        name='fileMemo'
                        className='textarea-autosize'
                        onChange={this.handleDataChangeMui}
                        value={incident.info.fileMemo}
                        rows={2} />
                </div>
            }
            {
                activeContent !== 'addIncident' &&
                <div className='group'>
                    <Button variant='contained' color='primary' className='upload' style={{marginRight: '10px'}} onClick={this.uploadAttachmentModal.bind(this)}>{t('txt-upload')}</Button>
                    {incident.info.attachmentDescription &&
                        <Button variant='contained' color='primary' className='upload' style={{marginRight: '10px'}} onClick={this.handleDownloadAll}>{t('txt-download')}</Button>
                    }
                </div>
            }
            {
                _.size(incident.info.fileList) > 0 &&
                <div className='group full'>
                    <DataTable
                        style={{width: '100%'}}
                        className='main-table full'
                        fields={incident.fileFields}
                        data={incident.info.fileList} />
                </div>
            }
        </div>
    }

    displayFlow = () => {
        const {activeContent, incidentType, incident} = this.state;

        let dataFields = {};
        incident.flowFieldsArr.forEach(tempData => {
            dataFields[tempData] = {
                hide: tempData === 'id',
                label: tempData === '_menu' ? '' : f(`incidentFields.${tempData}`),
                sortable: this.checkSortable(tempData),
                formatter: (value, allValue, i) => {
                    if (tempData === 'reviewDttm') {
                        return <span>{Moment(value).local().format('YYYY-MM-DD HH:mm:ss')}</span>
                    }
                    else if (tempData === 'status') {
                        return <span>{it(`action.${value}`)}</span>
                    }else if (tempData === 'suggestion' || tempData === 'reviewerName'){
                        let formattedWording = ''
                        if (value && value.length > 32) {
                            formattedWording = value.substr(0, 32) + '...';
                        }else{
                            formattedWording = value
                        }
                        return <span  style={{ whiteSpace: 'pre-wrap',
                                         wordBreak: 'break-all'}}>{formattedWording}</span>
                    } else {
                        return <span style={{ whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all'}}>{value}</span>
                    }
                }
            }
        });
        incident.flowFields = dataFields;
        return <div className='form-group normal'>
            <header>
                <div className='text'>{it('txt-flowTitle')}</div>
            </header>

            <div className='group full'>
                <DataTable
                    style={{width: '100%'}}
                    className='main-table full'
                    fields={incident.flowFields}
                    data={incident.info.historyList}
                />
            </div>

        </div>
    }

    displayNoticePage = () => {
        const {activeContent, INCIDENT_ACCIDENT_LIST, INCIDENT_ACCIDENT_SUB_LIST,incidentType, incident} = this.state;

        return <div className='form-group normal'>
            <header>
                <div className='text'>{it('txt-accidentTitle')}</div>
            </header>

            <div className='group'>
                <label htmlFor='accidentCatogory'>{it('txt-accidentClassification')}</label>
                <TextField
                    id='accidentCatogory'
                    name='accidentCatogory'
                    select
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    onChange={this.handleDataChangeMui}
                    value={incident.info.accidentCatogory}
                    disabled={activeContent === 'viewIncident'}>
                    {INCIDENT_ACCIDENT_LIST}
                </TextField>
            </div>
            {incident.info.accidentCatogory === '5' &&
                <div className='group'>
                    <label htmlFor='accidentAbnormal'>{it('txt-reason')}</label>
                    <TextField
                        id='accidentAbnormal'
                        name='accidentAbnormal'
                        variant='outlined'
                        fullWidth={true}
                        size='small'
                        onChange={this.handleDataChangeMui}
                        value={incident.info.accidentAbnormalOther}
                        disabled={activeContent === 'viewIncident'}/>
                </div>
            }
            {incident.info.accidentCatogory !== '5' &&
            <div className='group'>
                <label htmlFor='accidentAbnormal'>{it('txt-reason')}</label>
                <TextField
                    id='accidentAbnormal'
                    name='accidentAbnormal'
                    select
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    onChange={this.handleDataChangeMui}
                    value={incident.info.accidentAbnormal}
                    disabled={activeContent === 'viewIncident'}>
                    {INCIDENT_ACCIDENT_SUB_LIST[incident.info.accidentCatogory - 1]}
                </TextField>
            </div>
            }

            <div className='group full'>
                <label htmlFor='accidentDescription'>{it('txt-accidentDescr')}</label>
                <TextareaAutosize
                    id='accidentDescription'
                    name='accidentDescription'
                    className='textarea-autosize'
                    onChange={this.handleDataChangeMui}
                    value={incident.info.accidentDescription}
                    rows={3}
                    disabled={activeContent === 'viewIncident'}/>
            </div>
            <div className='group full'>
                <label htmlFor='accidentReason'>{it('txt-reasonDescr')}</label>
                <TextareaAutosize
                    id='accidentReason'
                    name='accidentReason'
                    className='textarea-autosize'
                    onChange={this.handleDataChangeMui}
                    value={incident.info.accidentReason}
                    rows={3}
                    disabled={activeContent === 'viewIncident'}/>
            </div>
            <div className='group full'>
                <label htmlFor='accidentInvestigation'>{it('txt-accidentInvestigation')}</label>
                <TextareaAutosize
                    id='accidentInvestigation'
                    name='accidentInvestigation'
                    className='textarea-autosize'
                    onChange={this.handleDataChangeMui}
                    value={incident.info.accidentInvestigation}
                    rows={3}
                    disabled={activeContent === 'viewIncident'}/>
            </div>
        </div>
    }

    handleConnectContactChange = (val) => {
        let temp = {...this.state.incident};
        temp.info.notifyList = val;
        this.setState({incident: temp})
    };

    displayConnectUnit = () => {
        const {activeContent, INCIDENT_ACCIDENT_LIST, INCIDENT_ACCIDENT_SUB_LIST,incidentType, incident} = this.state;

        return <div className='form-group normal'>
            <header>
                <div className='text'>{it('txt-notifyUnit')}</div>
            </header>

            <div className='group full multi'>
                <MultiInput
                    id='incidentEvent'
                    className='incident-group'
                    base={NotifyContact}
                    defaultItemValue={{title: '', name: '', phone:'', email:''}}
                    value={incident.info.notifyList}
                    props={{activeContent: activeContent}}
                    onChange={this.handleConnectContactChange}
                    readOnly={activeContent === 'viewIncident'}/>

            </div>
        </div>
    }

    handleEventsChange = (val) => {
        let temp = {...this.state.incident};
        temp.info.eventList = val;
        this.setState({incident: temp})
    };

    displayEventsPage = () => {
        const {incidentType, activeContent, incident, deviceListOptions, showDeviceListOptions} = this.state;
        const {locale} = this.context;

        const now = new Date();
        const nowTime = Moment(now).local().format('YYYY-MM-DD HH:mm:ss');

        return <div className='form-group normal'>
            <header>
                <div className='text'>{it('txt-incident-events')}</div>
            </header>

            <Button className='last-left '  style={{backgroundColor:'#001b34',color:'#FFFFFF'}}
                    onClick={this.handleIncidentPageChange.bind(this, 'main')}>{it('txt-prev-page')}</Button>

            <Button className='last'  disabled={incidentType !== 'ttps'}   style={{backgroundColor:'#001b34',color:'#FFFFFF'}}
                    onClick={this.handleIncidentPageChange.bind(this, 'ttps')}>{it('txt-next-page')}</Button>


            <div className='group full multi'>
                <MultiInput
                    id='incidentEvent'
                    className='incident-group'
                    base={Events}
                    defaultItemValue={{description: '', deviceId: '', time: {from: nowTime, to: nowTime}, frequency: 1}}
                    value={incident.info.eventList}
                    props={{activeContent: activeContent, locale: locale, deviceListOptions: deviceListOptions , showDeviceListOptions:showDeviceListOptions}}
                    onChange={this.handleEventsChange}
                    readOnly={activeContent === 'viewIncident'}/>

            </div>
        </div>
    };

    handleTtpsChange = (val) => {
        let temp = {...this.state.incident};
        temp.info.ttpList = val;
        this.setState({incident: temp})
    };

    displayTtpPage = () => {
        const {activeContent, incident} = this.state;

        return <div className='form-group normal'>
            <header>
                <div
                    className='text'>{it('txt-incident-ttps')} ({it('txt-ttp-obs-file')}/{it('txt-ttp-obs-uri')}/{it('txt-ttp-obs-socket')} {it('txt-mustOne')})
                </div>
            </header>

            <Button className='last-left '  style={{backgroundColor:'#001b34',color:'#FFFFFF'}}
                    onClick={this.handleIncidentPageChange.bind(this, 'events')}>{it('txt-prev-page')}</Button>

            <Button className='last' disabled={true} style={{backgroundColor:'#001b34',color:'#FFFFFF'}}
                    onClick={this.handleIncidentPageChange.bind(this, 'events')}>{it('txt-next-page')}</Button>

            <div className='group full multi'>
                <MultiInput
                    id='incidentTtp'
                    className='incident-group'
                    base={Ttps}
                    value={incident.info.ttpList}
                    props={{activeContent: activeContent}}
                    onChange={this.handleTtpsChange}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
        </div>
    };

    handleSubmit = () => {
        const {baseUrl, contextRoot, session} = this.context;
        const {activeContent, incidentType, attach} = this.state;
        let incident = {...this.state.incident};

        if (!this.checkRequired(incident.info)) {
            return
        }

        if (incident.info.showFontendRelatedList) {
            incident.info.relatedList = _.map(incident.info.showFontendRelatedList, el => {
                return {incidentRelatedId: el.value}
            })
        }

        if (incident.info.eventList) {
            incident.info.eventList = _.map(incident.info.eventList, el => {

                _.forEach(el.eventConnectionList, eventConnectItem=>{
                   if( eventConnectItem.srcPort === ''){
                       eventConnectItem.srcPort = null
                   }

                   if(  eventConnectItem.dstPort === ''){
                       eventConnectItem.dstPort = null
                   }
                })
                return {
                    ...el,
                    startDttm: Moment(el.time.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
                    endDttm: Moment(el.time.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
                }
            })
        }


        if (incident.info.accidentCatogory) {
            if (incident.info.accidentCatogory === 5) {
                incident.info.accidentAbnormal = null
            }
            else {
                incident.info.accidentAbnormalOther = null
            }
        }

        if (incident.info.expireDttm) {
            incident.info.expireDttm = Moment(incident.info.expireDttm).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
        }


        if (!incident.info.creator) {
            incident.info.creator = session.accountId;
        }

        // add for save who edit
        incident.info.editor = session.accountId;

        if (activeContent === 'addIncident') {

            if (_.includes(session.roles, 'SOC Supervior') || _.includes(session.roles, 'SOC Supervisor')||  _.includes(session.roles, 'SOC Executor')){
                // incident.info.status =  constants.soc.INCIDENT_STATUS_ANALYZED ;
                incident.info.status =  constants.soc.INCIDENT_STATUS_UNREVIEWED ;
            }else{
                incident.info.status =  constants.soc.INCIDENT_STATUS_UNREVIEWED ;
            }
        }

        ah.one({
            url: `${baseUrl}/api/soc`,
            data: JSON.stringify(incident.info),
            type: activeContent === 'addIncident' ? 'POST' : 'PATCH',
            contentType: 'application/json',
            dataType: 'json'
        }).then(data => {
            incident.info.id = data.rt.id;
            incident.info.updateDttm = data.rt.updateDttm;
            incident.info.status = data.rt.status;

            this.setState({
                originalIncident: _.cloneDeep(incident)
            }, () => {
                if (attach) {
                    this.uploadAttachment()
                }
                this.getIncident(incident.info.id);
                this.toggleContent('cancel');
            });

            return null;
        })
        .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        });
    };

    checkRequired(incident) {
        const {incidentType} = this.state;

        if (!incident.title || !incident.category || !incident.reporter || !incident.impactAssessment || !incident.socType || !incident.severity || !incident.flowTemplateId) {
            PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-validBasic'),
                confirmText: t('txt-close')
            });

            return false
        }

        // always check event list
        if (!incident.eventList) {
            PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-validEvents'),
                confirmText: t('txt-close')
            });

            return false
        }
        else {

            let eventCheck = true;

            if (incident.eventList.length <= 0){
                PopupDialog.alert({
                    title: t('txt-tips'),
                    display: it('txt-validEvents'),
                    confirmText: t('txt-close')
                });
                eventCheck = false;
            }else{
                _.forEach(incident.eventList, event => {
                    if(_.size(event.eventConnectionList)<= 0){
                        PopupDialog.alert({
                            title: t('txt-tips'),
                            display: it('txt-validEvents'),
                            confirmText: t('txt-close')
                        });
                        eventCheck = false
                    }else{
                        _.forEach(event.eventConnectionList, eventConnect => {

                            if (!helper.ValidateIP_Address(eventConnect.srcIp) ){
                                PopupDialog.alert({
                                    title: t('txt-tips'),
                                    display: t('network-topology.txt-ipValidationFail'),
                                    confirmText: t('txt-close')
                                });
                                eventCheck = false
                                return
                            }

                            if (!helper.ValidateIP_Address(eventConnect.dstIp)){
                                PopupDialog.alert({
                                    title: t('txt-tips'),
                                    display: t('network-topology.txt-ipValidationFail'),
                                    confirmText: t('txt-close')
                                });
                                eventCheck = false
                                return
                            }

                            if (eventConnect.dstPort){
                                if (!helper.ValidatePort(eventConnect.dstPort)){
                                    PopupDialog.alert({
                                        title: t('txt-tips'),
                                        display: t('network-topology.txt-portValidationFail'),
                                        confirmText: t('txt-close')
                                    });
                                    eventCheck = false
                                    return
                                }
                            }

                            if (eventConnect.srcPort){
                                if (!helper.ValidatePort(eventConnect.srcPort)){
                                    PopupDialog.alert({
                                        title: t('txt-tips'),
                                        display: t('network-topology.txt-portValidationFail'),
                                        confirmText: t('txt-close')
                                    });
                                    eventCheck = false

                                }
                            }
                        })
                    }
                })
            }



            if (!eventCheck){
                return false
            }

            let empty = _.filter(incident.eventList, function (o) {
                return !o.description || !o.deviceId || !o.eventConnectionList  || !o.frequency
            });

            if (_.size(empty) > 0) {
                PopupDialog.alert({
                    title: t('txt-tips'),
                    display: it('txt-validEvents'),
                    confirmText: t('txt-close')
                });

                return false
            }
        }

        // check ttp list
        if (incidentType === 'ttps') {

            if (!incident.description) {
                PopupDialog.alert({
                    title: t('txt-tips'),
                    display: it('txt-validTechniqueInfa'),
                    confirmText: t('txt-close')
                });

                return false
            }


            if (!incident.ttpList) {
                PopupDialog.alert({
                    title: t('txt-tips'),
                    display: it('txt-validTTPs'),
                    confirmText: t('txt-close')
                });

                return false
            } else {
                let statusCheck = true
                let fileCheck = false
                let urlCheck = false
                let socketCheck = false
                _.forEach(incident.ttpList, ttp => {

                    if (_.size(ttp.obsFileList) > 0) {
                        _.forEach(ttp.obsFileList, file => {
                            if (file.fileName && file.fileExtension) {
                                if (file.md5 || file.sha1 || file.sha256) {
                                    if (helper.validateInputRuleData('fileHashMd5',file.md5)){
                                        fileCheck = true
                                    }else if (helper.validateInputRuleData('fileHashSha1',file.sha1)){
                                        fileCheck = true
                                    }else if (helper.validateInputRuleData('fileHashSha256',file.sha256)){
                                        fileCheck = true
                                    }else{
                                        fileCheck = false
                                        return
                                    }
                                }else {
                                    fileCheck = false
                                    return
                                }
                            }
                        })
                    }else{
                        fileCheck = true
                    }

                    if (_.size(ttp.obsUriList) > 0) {
                        _.forEach(ttp.obsUriList, uri => {
                            if (uri.uriType && uri.uriValue) {
                                urlCheck = true
                            } else {
                                urlCheck = false
                                return
                            }
                        })
                    }else{
                        urlCheck = true
                    }


                    if (_.size(ttp.obsSocketList) > 0) {
                        _.forEach(ttp.obsSocketList, socket => {
                            if (socket.ip || socket.port) {
                                if (socket.ip && !helper.ValidateIP_Address(socket.ip)){
                                    PopupDialog.alert({
                                        title: t('txt-tips'),
                                        display: t('network-topology.txt-ipValidationFail'),
                                        confirmText: t('txt-close')
                                    });
                                    socketCheck = false
                                    return
                                }

                                if (socket.port){
                                    if (!helper.ValidatePort(socket.port)){
                                        PopupDialog.alert({
                                            title: t('txt-tips'),
                                            display: t('network-topology.txt-portValidationFail'),
                                            confirmText: t('txt-close')
                                        });
                                        socketCheck = false
                                        return
                                    }else{
                                        if (!socket.ip){
                                            PopupDialog.alert({
                                                title: t('txt-tips'),
                                                display: t('network-topology.txt-ipValidationFail'),
                                                confirmText: t('txt-close')
                                            });
                                            socketCheck = false
                                            return
                                        }
                                        socketCheck = true
                                    }
                                }
                                socketCheck = true
                            }else {
                                socketCheck = false
                                return
                            }
                        })
                    }else{
                        socketCheck = true
                    }

                    if (!fileCheck && !urlCheck && !socketCheck){
                        PopupDialog.alert({
                            title: t('txt-tips'),
                            display: it('txt-incident-ttps')+'('+it('txt-ttp-obs-file')+'/'+it('txt-ttp-obs-uri')+'/'+it('txt-ttp-obs-socket')+'-'+it('txt-mustOne')+')',
                            confirmText: t('txt-close')
                        });
                        statusCheck = false
                    }

                    if (!fileCheck){
                        PopupDialog.alert({
                            title: t('txt-tips'),
                            display: it('txt-checkFileFieldType'),
                            confirmText: t('txt-close')
                        });
                        statusCheck = false
                    }

                    if (!urlCheck){
                        PopupDialog.alert({
                            title: t('txt-tips'),
                            display: it('txt-checkUrlFieldType'),
                            confirmText: t('txt-close')
                        });
                        statusCheck = false
                    }
                    if (!socketCheck){
                        PopupDialog.alert({
                            title: t('txt-tips'),
                            display: it('txt-checkIPFieldType'),
                            confirmText: t('txt-close')
                        });
                        statusCheck = false
                    }

                    if (_.size(ttp.obsSocketList) <= 0 && _.size(ttp.obsUriList) <= 0 && _.size(ttp.obsFileList) <= 0){
                        PopupDialog.alert({
                            title: t('txt-tips'),
                            display: it('txt-incident-ttps')+'('+it('txt-ttp-obs-file')+'/'+it('txt-ttp-obs-uri')+'/'+it('txt-ttp-obs-socket')+'-'+it('txt-mustOne')+')',
                            confirmText: t('txt-close')
                        });
                        statusCheck = false
                    }

                })

                let empty = _.filter(incident.ttpList, function (o) {
                    if (o.infrastructureType === undefined || o.infrastructureType === 0){
                        o.infrastructureType = '0'
                    }
                    if (!o.title || !o.infrastructureType){
                        statusCheck = false
                    }
                });

                if (_.size(empty) > 0) {
                    PopupDialog.alert({
                        title: t('txt-tips'),
                        display: it('txt-validTechniqueInfa'),
                        confirmText: t('txt-close')
                    });
                    statusCheck = false
                }

                return statusCheck
            }
        }

        return true
    }

    getIncident = (id, type) => {
        const {activeContent, incidentType, incident, relatedListOptions} = this.state;
        this.handleCloseMenu()
        const {baseUrl} = this.context;

        ah.one({
            url: `${baseUrl}/api/soc?id=${id}`,
            type: 'GET'
        })
        .then(data => {
            let {incident} = this.state;
            let temp = data.rt;

            if (temp.relatedList) {
                temp.relatedList = _.map(temp.relatedList, el => {
                    let obj = {
                        value :el.incidentRelatedId,
                        text:el.incidentRelatedId
                    }
                    return obj
                })
            }


            let result = _.map(temp.relatedList, function(obj) {
                return _.assign(obj, _.find(relatedListOptions, {value: obj.value}));
            });

            temp.differenceWithOptions = _.differenceWith(relatedListOptions,temp.relatedList,function(p,o) { return p.value === o.value })
            temp.showFontendRelatedList = result

            if (temp.eventList) {
                temp.eventList = _.map(temp.eventList, el => {
                    return {
                        ...el,
                        time: {
                            from: Moment(el.startDttm, 'YYYY-MM-DDTHH:mm:ssZ').local().format('YYYY-MM-DD HH:mm:ss'),
                            to: Moment(el.endDttm, 'YYYY-MM-DDTHH:mm:ssZ').local().format('YYYY-MM-DD HH:mm:ss')
                        }
                    }
                })
            }

            if (temp.ttpList) {
                temp.ttpList = _.map(temp.ttpList, el => {

                    let tempTtp = el
                    if (tempTtp.infrastructureType === 0) {
                        tempTtp.infrastructureType = '0'

                    }else if (tempTtp.infrastructureType === 1) {
                        tempTtp.infrastructureType = '1'

                    }

                    return {
                        ...tempTtp
                    }
                })
            }

            let incidentType = _.size(temp.ttpList) > 0 ? 'ttps' : 'events';
            let toggleType = type
            incident.info = temp;

            this.setState({incident, incidentType, toggleType}, () => {
                this.toggleContent('viewIncident', temp)
            })
        })
        .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        })
    };

    refreshIncidentAttach = (id) => {
        const {activeContent, incidentType, incident, relatedListOptions} = this.state;
        this.handleCloseMenu()
        const {baseUrl} = this.context;

        ah.one({
            url: `${baseUrl}/api/soc?id=${id}`,
            type: 'GET'
        })
            .then(data => {
                let {incident} = this.state;
                let tempIncident = {...incident};
                let temp = data.rt;
                if (temp.relatedList) {
                    temp.relatedList = _.map(temp.relatedList, el => {
                        let obj = {
                            value :el.incidentRelatedId,
                            text:el.incidentRelatedId
                        }
                        return obj
                    })
                }


                let result = _.map(temp.relatedList, function(obj) {
                    return _.assign(obj, _.find(relatedListOptions, {value: obj.value}));
                });

                temp.differenceWithOptions = _.differenceWith(relatedListOptions,temp.relatedList,function(p,o) { return p.value === o.value })
                temp.showFontendRelatedList = result

                if (temp.eventList) {
                    temp.eventList = _.map(temp.eventList, el => {
                        return {
                            ...el,
                            time: {
                                from: Moment(el.startDttm, 'YYYY-MM-DDTHH:mm:ssZ').local().format('YYYY-MM-DD HH:mm:ss'),
                                to: Moment(el.endDttm, 'YYYY-MM-DDTHH:mm:ssZ').local().format('YYYY-MM-DD HH:mm:ss')
                            }
                        }
                    })
                }

                if (temp.ttpList) {
                    temp.ttpList = _.map(temp.ttpList, el => {

                        let tempTtp = el
                        if (tempTtp.infrastructureType === 0) {
                            tempTtp.infrastructureType = '0'

                        }else if (tempTtp.infrastructureType === 1) {
                            tempTtp.infrastructureType = '1'

                        }

                        return {
                            ...tempTtp
                        }
                    })
                }

                let incidentType = _.size(temp.ttpList) > 0 ? 'ttps' : 'events';
                incident.info.attachmentDescription = temp.attachmentDescription;
                incident.info.fileList = temp.fileList;
                incident.info.fileMemo =  temp.fileMemo;
                this.setState({incident,incidentType}, () => {
                    this.toggleContent('refreshAttach', temp)
                })

            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })
    };
  /**
   * Check if item is already in the selected list
   * @method
   * @param {string} val - checked item name
   * @returns boolean true/false
   */
  checkSeveritySelectedItem = (val) => {
    return _.includes(this.state.severitySelected, val);
  }
  /**
   * Handle checkbox check/uncheck
   * @method
   * @param {object} event - event object
   */
  toggleSeverityCheckbox = (event) => {
    let severitySelected = _.cloneDeep(this.state.severitySelected);

    if (event.target.checked) {
      severitySelected.push(event.target.name);
    } else {
      const index = severitySelected.indexOf(event.target.name);
      severitySelected.splice(index, 1);
    }

    this.setState({
      severitySelected
    });
  }
  /**
   * Display Severity checkbox group
   * @method
   * @param {string} val - severity level
   * @param {number} i - index of the severity level list
   * @returns HTML DOM
   */
  displaySeverityCheckbox = (val, i) => {
    return (
      <div className='option' key={val + i}>
        <FormControlLabel
          key={i}
          label={val}
          control={
            <Checkbox
              id={val}
              className='checkbox-ui'
              name={val}
              checked={this.checkSeveritySelectedItem(val)}
              onChange={this.toggleSeverityCheckbox}
              color='primary' />
          } />
      </div>
    )
  }

    /**
     * Display filter content
     * @method
     * @returns HTML DOM
     */
    renderFilter = () => {
        const {showFilter, search, severityList} = this.state;
        const {locale} = this.context;

        let dateLocale = locale;

        if (locale === 'zh') {
            dateLocale += '-tw';
        }

        moment.locale(dateLocale);

        let statusList = ["1","3","4","5","8"]

        return (
            <div className={cx('main-filter', {'active': showFilter})}>
                <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}/>
                <div className='header-text'>{t('txt-filter')}</div>
                <div className='filter-section config'>
                    <div className='group'>
                        {/*<label htmlFor='keyword'>{f('edgeFields.keywords')}</label>*/}
                        <TextField
                            id='keyword'
                            name='keyword'
                            label={f('edgeFields.keywords')}
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            value={search.keyword}
                            onChange={this.handleSearchMui}/>
                    </div>
                    <div className='group'>
                        {/*<label htmlFor='searchCategory'>{f('incidentFields.category')}</label>*/}
                        <TextField
                            id='searchCategory'
                            name='category'
                            select
                            label={f('incidentFields.category')}
                            required={true}
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            value={search.category}
                            onChange={this.handleSearchMui}>
                            {
                                _.map(_.range(0, 9), el => {
                                    return <MenuItem value={el}>{it(`category.${el}`)}</MenuItem>
                                })
                            }
                        </TextField>
                    </div>

                    <div className='severity'>
                        <div className='group group-checkbox narrow'>
                            <div className='group-options'>
                                {SEVERITY_TYPE.map(this.displaySeverityCheckbox)}
                            </div>
                        </div>
                    </div>
                    {/*<div className='group'>*/}
                    {/*    <label htmlFor='searchStatus'>{f('incidentFields.status')}</label>*/}
                    {/*    <TextField*/}
                    {/*        id='searchStatus'*/}
                    {/*        name='status'*/}
                    {/*        required={true}*/}
                    {/*        variant='outlined'*/}
                    {/*        fullWidth={true}*/}
                    {/*        size='small'*/}
                    {/*        select*/}
                    {/*        value={search.status}*/}
                    {/*        onChange={this.handleSearchMui}>*/}
                    {/*        /!*{*!/*/}
                    {/*        /!*    _.map([1,3,4,5], el => {*!/*/}
                    {/*        /!*        return  <MenuItem value={el}>{it(`status.${el}`)}</MenuItem>*!/*/}
                    {/*        /!*    })}*!/*/}
                    {/*        /!*}*!/*/}
                    {/*        <MenuItem value={1}>{it(`status.${1}`)}</MenuItem>*/}
                    {/*        <MenuItem value={3}>{it(`status.${3}`)}</MenuItem>*/}
                    {/*        <MenuItem value={4}>{it(`status.${4}`)}</MenuItem>*/}
                    {/*        <MenuItem value={5}>{it(`status.${5}`)}</MenuItem>*/}
                    {/*        <MenuItem value={8}>{it(`status.${8}`)}</MenuItem>*/}
                    {/*    </TextField>*/}
                    {/*</div>*/}
                    <div className='severity'>
                        <div className='group group-checkbox narrow'>
                            <div className='group-options'>
                                {statusList.map(this.displayStatusCheckbox)}
                            </div>
                        </div>
                    </div>
                    <div className='group' style={{width: '500px', marginTop: '20px'}}>
                        {/*<label htmlFor='searchDttm'>{f('incidentFields.createDttm')}</label>*/}
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
                </div>
                <div className='button-group'>
                    <Button variant='contained' color='primary' className='filter' onClick={this.loadData.bind(this, 'search')}>{t('txt-filter')}</Button>
                    <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
                </div>
            </div>
        )
    };

    displayStatusCheckbox = (val, i) => {
        return (
            <div className='option' key={val + i}>
                <FormControlLabel
                    key={i}
                    label={it(`status.${val}`)}
                    control={
                        <Checkbox
                            id={val}
                            className='checkbox-ui'
                            name={val}
                            checked={this.checkSelectedItem(val)}
                            onChange={this.toggleCheckbox}
                            color='primary' />
                    } />
            </div>
        )
    }

    checkSelectedItem = (val) => {
        return _.includes(this.state.selectedStatus, val);
    }

    toggleCheckbox = (event) => {
        let itemSelected = _.cloneDeep(this.state.selectedStatus);
        if (event.target.checked) {
            itemSelected.push(event.target.name);
        } else {
            const index = itemSelected.indexOf(event.target.name);
            itemSelected.splice(index, 1);
        }

        this.setState({
            selectedStatus:itemSelected
        });
    }

    renderStatistics = () => {
        const {showChart, dashboard} = this.state

        return <div className={cx('main-filter', {'active': showChart})}>
            <i className='fg fg-close' onClick={this.toggleChart} title={t('txt-close')}/>
            <div className='incident-statistics' id='incident-statistics'>
                <div className='item c-link' onClick={this.loadCondition.bind(this,'button','expired')}>
                    <i className='fg fg-checkbox-fill' style={{color: '#ec8f8f'}}/>
                    <div className='threats'>{it('txt-incident-expired')}<span>{dashboard.expired}</span></div>
                </div>

                {/*<div className='item c-link' onClick={this.loadCondition.bind(this,'button','unhandled')}>*/}
                {/*    <i className='fg fg-checkbox-fill' style={{color: '#f5f77a'}}/>*/}
                {/*    <div className='threats'>{it('txt-incident-unhandled')}<span>{dashboard.unhandled}</span></div>*/}
                {/*</div>*/}

                <div className='item c-link' onClick={this.loadCondition.bind(this,'button','mine')}>
                    <i className='fg fg-checkbox-fill' style={{color: '#99ea8a'}}/>
                    <div className='threats'>{it('txt-incident-mine')}<span>{dashboard.mine}</span></div>
                </div>
            </div>
        </div>
    }

    /* ---- Func Space ---- */
    /**
     * Show Delete Incident dialog
     * @method
     * @param {object} allValue - IncidentDevice data
     */
    openDeleteMenu = (allValue) => {
        PopupDialog.prompt({
            title: t('txt-delete'),
            id: 'modalWindowSmall',
            confirmText: t('txt-delete'),
            cancelText: t('txt-cancel'),
            display: <div className='content delete'>
                <span>{t('txt-delete-msg')}: {allValue.id}?</span>
            </div>,
            act: (confirmed, data) => {
                if (confirmed) {
                    this.deleteIncident(allValue.id)
                }
            }
        })
    };


    openReviewModal= (allValue, reviewType) => {
        this.handleCloseMenu()
        PopupDialog.prompt({
            title: it(`txt-${reviewType}`),
            confirmText: t('txt-confirm'),
            cancelText: t('txt-cancel'),
            display: <div className='content delete'>
                <span>{it(`txt-${reviewType}-msg`)}: {allValue.id}?</span>
            </div>,
            act: (confirmed, data) => {
                if (confirmed) {
                    this.openIncidentReview(allValue.id, reviewType)
                }
            }
        })
    }

    /**
     * Show Send Incident dialog
     * @method
     * @param {object} allValue - IncidentDevice data
     */
    openSendMenu = (id) => {
        PopupDialog.prompt({
            title: it('txt-send'),
            id: 'modalWindowSmall',
            confirmText: it('txt-send'),
            cancelText: t('txt-cancel'),
            display: <div className='content delete'>
                <span>{it('txt-send-msg')}: {id} ?</span>
            </div>,
            act: (confirmed, data) => {
                if (confirmed) {
                    this.sendIncident(id)
                }
            }
        })
    };

    /**
     * Handle delete Incident confirm
     * @method
     */
    deleteIncident = (id) => {
        const {baseUrl} = this.context;

        ah.one({
            url: `${baseUrl}/api/soc?id=${id}`,
            type: 'DELETE'
        })
            .then(data => {
                if (data.ret === 0) {
                    // this.loadData()
                    if (this.state.loadListType === 0){
                        this.loadCondition('other','expired')
                    }else if (this.state.loadListType === 1){
                        this.loadCondition('other','unhandled')
                    }else if (this.state.loadListType === 2){
                        this.loadCondition('other','mine')
                    }else if (this.state.loadListType === 3){
                        this.loadData()
                    }
                }
                return null
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })
    };


    /**
     * Handle table pagination change
     * @method
     * @param {string} type - page type ('currentPage' or 'pageSize')
     * @param {string | number} value - new page number
     */
    handlePaginationChange = (type, value) => {
        let temp = {...this.state.incident};
        temp[type] = Number(value);
        this.setState({incident: temp}, () => {
            // this.loadData()
            if (this.state.loadListType === 0){
                this.loadCondition(type,'expired')
            }else if (this.state.loadListType === 1){
                this.loadCondition(type,'unhandled')
            }else if (this.state.loadListType === 2){
                this.loadCondition(type,'mine')
            }else if (this.state.loadListType === 3){
                this.loadData(type)
            }
        })
    };

    toggleContent = (type, allValue) => {
        const {baseUrl, contextRoot} = this.context;
        const {originalIncident, incident,relatedListOptions} = this.state;
        let tempIncident = {...incident};
        let showPage = type;


        if (type === 'viewIncident') {
            tempIncident.info = {
                id: allValue.id,
                title: allValue.title,
                category: allValue.category,
                reporter: allValue.reporter,
                description: allValue.description,
                impactAssessment: allValue.impactAssessment,
                socType: allValue.socType,
                createDttm: allValue.createDttm,
                updateDttm: allValue.updateDttm,
                relatedList: allValue.relatedList,
                showFontendRelatedList:allValue.showFontendRelatedList,
                differenceWithOptions:allValue.differenceWithOptions,
                ttpList: allValue.ttpList,
                eventList: allValue.eventList,
                status: allValue.status,
                fileList: allValue.fileList,
                fileMemo: allValue.fileMemo,
                tagList: allValue.tagList,
                notifyList: allValue.notifyList,
                historyList: allValue.historyList,
                creator: allValue.creator,
                announceSource: allValue.announceSource,
                expireDttm: allValue.expireDttm,
                attachmentDescription: allValue.attachmentDescription,
                accidentCatogory: allValue.accidentCatogory,
                accidentDescription: allValue.accidentDescription,
                accidentReason: allValue.accidentReason,
                accidentInvestigation: allValue.accidentInvestigation,
                accidentAbnormal: allValue.accidentAbnormal,
                accidentAbnormalOther: allValue.accidentAbnormalOther,
                severity: allValue.severity,
                flowTemplateId:allValue.flowTemplateId
            };


            if (!tempIncident.info.socType) {
                tempIncident.info.socType = 1
            }

            this.setState({showFilter: false, originalIncident: _.cloneDeep(tempIncident)})
        }  else if (type === 'addIncident') {
            tempIncident.info = {
                id: null,
                title: null,
                category: null,
                reporter: null,
                description: null,
                impactAssessment: 4,
                socType: null,
                createDttm: null,
                relatedList: [],
                showFontendRelatedList:[],
                differenceWithOptions:relatedListOptions,
                ttpList: null,
                eventList: null,
                notifyList: null,
                fileMemo: '',
                tagList: null,
                historyList: null,
                creator: null,
                announceSource: null,
                expireDttm: null,
                attachmentDescription: null,
                accidentCatogory: null,
                accidentDescription: null,
                accidentReason: null,
                accidentInvestigation: null,
                accidentAbnormal: null,
                accidentAbnormalOther: null,
                severity: 'Emergency',
                flowTemplateId:''
            };
            if (!tempIncident.info.socType) {
                tempIncident.info.socType = 1
            }
            this.setState({
                showFilter: false,
                originalIncident: _.cloneDeep(tempIncident),
                incidentType: allValue,
                displayPage: 'main'
            })
        } else if (type === 'tableList') {
            tempIncident.info = _.cloneDeep(incident.info)
        } else if (type === 'cancel-add') {
            showPage = 'tableList';
            tempIncident = _.cloneDeep(originalIncident)
        } else if (type === 'cancel') {
            showPage = 'viewIncident';
            tempIncident = _.cloneDeep(originalIncident)
        } else if (type === 'redirect') {
            let alertData = JSON.parse(allValue);
            tempIncident.info = {
                title: alertData.Info,
                reporter: alertData.Collector,
                rawData:alertData,
                severity: alertData._severity_,
            };

            if (tempIncident.info.severity === 'Emergency'){
                tempIncident.info['impactAssessment'] = 4
            }else  if (tempIncident.info.severity === 'Alert'){
                tempIncident.info['impactAssessment'] = 3
            }else  if (tempIncident.info.severity === 'Notice'){
                tempIncident.info['impactAssessment'] = 1
            }else  if (tempIncident.info.severity === 'Warning'){
                tempIncident.info['impactAssessment'] = 2
            }else  if (tempIncident.info.severity === 'Critical'){
                tempIncident.info['impactAssessment'] = 3
            }

            if (!tempIncident.info.socType) {
                tempIncident.info.socType = 1
            }

            // make incident.info
            let eventNetworkList = [];
            let eventNetworkItem = {
                srcIp: alertData.ipSrc || alertData.srcIp || alertData.ipsrc,
                srcPort: (parseInt(alertData.portSrc) || parseInt(alertData.srcPort) ? parseInt(alertData.portSrc) || parseInt(alertData.srcPort) : null),
                dstIp: alertData.ipDst || alertData.dstIp || alertData.destIp || alertData.ipdst,
                dstPort: parseInt(alertData.destPort) ? parseInt(alertData.destPort) : null,
                srcHostname: '',
                dstHostname: ''
            };
            eventNetworkList.push(eventNetworkItem);

            let eventList = [];
            let eventListItem = {
                description: alertData.Rule || alertData.trailName || alertData.__index_name,
                deviceId: '',
                frequency: 1,
                time: {
                    from: helper.getFormattedDate(alertData._eventDttm_, 'local'),
                    to: helper.getFormattedDate(alertData._eventDttm_, 'local')
                },
                eventConnectionList: eventNetworkList
            };
            if (alertData._edgeInfo || alertData._edgeId) {
                let searchRequestData = {
                    deviceId: alertData._edgeInfo.agentId || alertData._edgeId
                };

                ah.one({
                    url: `${baseUrl}/api/soc/device/redirect/_search`,
                    data: JSON.stringify(searchRequestData),
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json'
                }).then(data => {
                    eventListItem.deviceId = data.rt.device.id;
                })
            }

            eventList.push(eventListItem);
            tempIncident.info.eventList = eventList;
            showPage = 'addIncident';
            this.setState({
                showFilter: false,
                originalIncident: _.cloneDeep(tempIncident),
                incidentType: 'events',
                displayPage: 'main'
            })
        } else if (type === 'audit') {
        } else if (type === 'download') {
            this.getIncidentSTIXFile(allValue.id);
        } else if(type === 'refreshAttach'){
            tempIncident.info.attachmentDescription = allValue.attachmentDescription;
            tempIncident.info.fileList = allValue.fileList;
            tempIncident.info.fileMemo =  allValue.fileMemo;
            this.setState({showFilter: false, originalIncident: _.cloneDeep(tempIncident)})
            if (this.state.activeContent === 'editIncident'){
                showPage = 'editIncident'
            }else{
                showPage = 'viewIncident'
            }
        }

        this.setState({
            displayPage: 'main',
            activeContent: showPage,
            incident: tempIncident
        }, () => {
            if (showPage === 'tableList' || showPage === 'cancel-add') {
                if (this.state.loadListType === 0){
                    this.loadCondition('other','expired')
                }else if (this.state.loadListType === 1){
                    this.loadCondition('other','unhandled')
                }else if (this.state.loadListType === 2){
                    this.loadCondition('other','mine')
                }else if (this.state.loadListType === 3){
                    this.loadData()
                }
                this.loadDashboard()
            }
        })
    };

    /**
     *
     * @param {string} id
     */
    auditIncident = (id) => {
        const {baseUrl} = this.context;
        let tmp = {
            id: id
        }
        ah.one({
            url: `${baseUrl}/api/soc/_audit`,
            data: JSON.stringify(tmp),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
        .then(data => {
            this.afterAuditDialog(id)
            // helper.showPopupMsg(it('txt-audit-success'), it('txt-audit'));
            return null
        })
        .catch(err => {
            helper.showPopupMsg(it('txt-audit-fail'), it('txt-audit'));
        })
    };



    /**
     * Send Incident
     * @param {string} id
     */
    sendIncident = (id) => {
        this.handleCloseMenu()
        const {baseUrl} = this.context;
        let tmp = {
            id: id
        }
        ah.one({
            url: `${baseUrl}/api/soc/_send`,
            data: JSON.stringify(tmp),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
            .then(data => {
                if (this.state.loadListType === 0){
                    this.loadCondition('other','expired')
                }else if (this.state.loadListType === 2){
                    this.loadCondition('other','mine')
                }else if (this.state.loadListType === 3){
                    this.loadData()
                }
                helper.showPopupMsg(it('txt-send-success'), it('txt-send'));

            })
            .catch(err => {
                helper.showPopupMsg(it('txt-send-fail'), it('txt-send'));
            })
    };

    /**
     * Open audit finish dialog
     * @method
     * @returns ModalDialog component
     */
    afterAuditDialog = (incidentId) => {
        const titleText = it('txt-send');
        PopupDialog.prompt({
            id: 'afterAuditDialog',
            title: titleText,
            cancelText: t('txt-close'),
            confirmText: it('txt-send'),
            display: this.displayAfterAudit(),
            act: (confirmed) => {
                if (confirmed) {
                    this.sendIncident(incidentId);
                } else {
                    if (this.state.loadListType === 0){
                        this.loadCondition('expired')
                    }else if (this.state.loadListType === 1){
                        this.loadCondition('unhandled')
                    }else if (this.state.loadListType === 2){
                        this.loadCondition('mine')
                    }else if (this.state.loadListType === 3){
                        this.loadData()
                    }
                }
            }
        });
    }

    /**
     * Display audit finish dialog content
     * @method
     * @returns HTML DOM
     */
    displayAfterAudit = () => {
        return (
            <div>
                <label>{it('txt-audit-success')}{it('txt-sendCheck')}</label>
            </div>
        )
    }


    /**
     * Handle filter input data change
     * @method
     * @param {string} type - input type
     * @param {Object} event - input value
     */
    handleInputSearch = (type, event) => {
        let tempSearch = {...this.state.search};
        tempSearch[type] = event.target.value.trim();

        this.setState({
            search: tempSearch
        });
    };

    handleSearchChange = (event) => {
        let tempSearch = {...this.state.search};
        tempSearch[event.target.name] = event.target.value.trim();
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
    handleSearch = (type, value) => {
        let tempSearch = {...this.state.search};
        tempSearch[type] = value;

        this.setState({
            search: tempSearch
        });
    };

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
    };

    /**
     * Handle filter input data change
     * @method
     * @param {string} type - input type
     * @param {string} value - input value
     */
    handleSearchMui = (event) => {
        let tempSearch = {...this.state.search};
        tempSearch[event.target.name] = event.target.value;
        this.setState({
            search: tempSearch
        });
    };

    /**
     * Toggle filter content on/off
     * @method
     */
    toggleFilter = () => {
        this.setState({showFilter: !this.state.showFilter})
    };

    toggleChart = () => {
        this.setState({showChart: !this.state.showChart})
    };

    /**
     * Clear filter input value
     * @method
     */
    clearFilter = () => {
        this.setState({
            search: {
                keyword: '',
                category: 0,
                status: 0,
                datetime:{
                    from: helper.getSubstractDate(1, 'month'),
                    to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
                },
                isExpired: 2
            },
            selectedStatus:[]
        })
    };

    /**
     * Handle Incident data change
     * @method
     * @param {string} type - input type
     * @param {string} value - input value
     */
    handleDataChange = (type, value) => {

        let temp = {...this.state.incident};
        temp.info[type] = value;

        if (type === 'impactAssessment') {
            temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * value), 'hours')
        }

        this.setState({
            incident: temp
        })
    };


    handleDataChangeMui = (event) => {
        const {socFlowSourceList} = this.state;
        //
        let temp = {...this.state.incident};
        temp.info[event.target.name] = event.target.value;

        if (event.target.name === 'severity'){
            if (event.target.value === 'Emergency'){
                temp.info['impactAssessment'] = 4
                temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours')
            }else  if (event.target.value === 'Alert'){
                temp.info['impactAssessment'] = 3
                temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours')
            }else  if (event.target.value === 'Notice'){
                temp.info['impactAssessment'] = 1
                temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours')
            }else  if (event.target.value === 'Warning'){
                temp.info['impactAssessment'] = 2
                temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours')
            }else  if (event.target.value === 'Critical'){
                temp.info['impactAssessment'] = 3
                temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours')
            }
        }

        if (event.target.name === 'flowTemplateId'){
            _.forEach(socFlowSourceList , flowVal =>{
                if (flowVal.id === event.target.value){
                    if (flowVal.severity === 'Emergency'){
                        temp.info['severity'] = 'Emergency'
                        temp.info['impactAssessment'] = 4
                        temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours')
                    }else  if (flowVal.severity === 'Alert'){
                        temp.info['severity'] = 'Alert'
                        temp.info['impactAssessment'] = 3
                        temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours')
                    }else  if (flowVal.severity === 'Notice'){
                        temp.info['severity'] = 'Notice'
                        temp.info['impactAssessment'] = 1
                        temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours')
                    }else  if (flowVal.severity === 'Warning'){
                        temp.info['severity'] = 'Warning'
                        temp.info['impactAssessment'] = 2
                        temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours')
                    }else  if (flowVal.severity === 'Critical'){
                        temp.info['severity'] = 'Critical'
                        temp.info['impactAssessment'] = 3
                        temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * temp.info['impactAssessment']), 'hours')
                    }
                }
            })
        }

        if (event.target.name === 'impactAssessment') {
            temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * event.target.value), 'hours')
        }
        this.setState({
            incident: temp
        })
    }

    getOptions = () => {
        const {baseUrl, contextRoot, session} = this.context;

        ah.one({
            url: `${baseUrl}/api/soc/_search`,
            data: JSON.stringify({}),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
        .then(data => {
            if (data) {
                let list = _.map(data.rt.rows, val => {
                    let ipContent = '';

                    if (val.eventList) {
                        val.eventList = _.map(val.eventList, el => {
                            if (el.eventConnectionList) {
                                el.eventConnectionList = _.map(el.eventConnectionList, ecl => {
                                    ipContent += '(' + it('txt-srcIp')+ ': ' + ecl.srcIp + ')'
                                })
                            }
                        })
                    }

                    return {
                        value: val.id,
                        text: val.id + ' (' + it(`category.${val.category}`) + ')' + ipContent
                    }
                });

                this.setState({relatedListOptions: list})
            }
        })
        .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        });

        ah.one({
            url: `${baseUrl}/api/soc/device/_search`,
            data: JSON.stringify({use:'1',account:session.accountId}),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
        .then(data => {
            if (data) {
                let list = _.map(data.rt.rows, val => {
                    return {value: val.id, text: val.deviceName}
                });

                this.setState({deviceListOptions: list})
            }
        })
        .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        })

        ah.one({
            url: `${baseUrl}/api/soc/device/_search`,
            data: JSON.stringify({use:'2',account:session.accountId}),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
            .then(data => {
                if (data) {
                    let list = _.map(data.rt.rows, val => {
                        return {value: val.id, text: val.deviceName}
                    });

                    this.setState({showDeviceListOptions: list})
                }
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })

    };

    /**
     * Handle XML download
     * @param {Example-Type} option
     */
    getIncidentSTIXFileExample = (option) => {
        const {baseUrl, contextRoot} = this.context;
        const url = `${baseUrl}${contextRoot}/api/soc/incident/example/_export`;
        let requestData = {
            example: option
        };
        downloadWithForm(url, {payload: JSON.stringify(requestData)});
    };

    /**
     * Incident-ID
     * @param {Incident-ID} incidentId
     */
    getIncidentSTIXFile = (incidentId) => {
        this.handleCloseMenu()
        const {baseUrl, contextRoot} = this.context;
        const url = `${baseUrl}${contextRoot}/api/soc/_export`;
        let requestData = {
            id: incidentId
        };

        downloadWithForm(url, {payload: JSON.stringify(requestData)});
    }

    /**
     * Check table sort
     * @method
     * @param {string} field - table field name
     * @returns true for sortable or null
     */
    checkSortable = (field) => {
        const unSortableFields = ['description', '_menu', 'action', 'tag'];

        if (_.includes(unSortableFields, field)) {
            return null;
        } else {
            return true;
        }
    };

    /**
     * Handle table sort
     * @method
     * @param {object} sort - sort data object
     */
    handleTableSort = (field, sort) => {
        let tmpIncident = {...this.state.incident};
        tmpIncident.sort.field = field;
        tmpIncident.sort.desc = sort;

        this.setState({
            incident: tmpIncident
        }, () => {
            if (this.state.loadListType === 0){
                this.loadCondition('other','expired')
            }else if (this.state.loadListType === 1){
                this.loadCondition('other','unhandled')
            }else if (this.state.loadListType === 2){
                this.loadCondition('other','mine')
            }else if (this.state.loadListType === 3){
                this.loadData()
            }
        });
    };

    openIncidentComment() {
        this.incidentComment.open()
    }

    openIncidentTag(id) {
        this.handleCloseMenu()
        this.incidentTag.open(id)
    }

    openIncidentFlow(id) {
        this.handleCloseMenu()
        this.incidentFlowDialog.open(id)
    }

    openIncidentReview(incidentId, reviewType) {
        this.incidentReview.open(incidentId, reviewType)
    }

    uploadAttachment() {
        const {baseUrl} = this.context
        let {incident, attach} = this.state

        let formData = new FormData()
        formData.append('id', incident.info.id)
        formData.append('file', attach)
        formData.append('fileMemo', incident.info.fileMemo)

        ah.one({
            url: `${baseUrl}/api/soc/attachment/_upload`,
            data: formData,
            type: 'POST',
            processData: false,
            contentType: false
        })
            .then(data => {
                this.setState({attach: null},()=>{
                    this.getIncident(incident.info.id, 'view')
                })
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })
    }

    uploadAttachmentByModal(file, fileMemo) {
        const {baseUrl} = this.context
        let {incident} = this.state

        if (file) {
            let formData = new FormData()
            formData.append('id', incident.info.id)
            formData.append('file', file)
            formData.append('fileMemo', fileMemo)

            ah.one({
                url: `${baseUrl}/api/soc/attachment/_upload`,
                data: formData,
                type: 'POST',
                processData: false,
                contentType: false
            })
            .then(data => {
                this.refreshIncidentAttach(incident.info.id)
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })
        }
    }

    downloadAttachment(allValue) {
        const {baseUrl, contextRoot} = this.context
        const {incident} = this.state
        const url = `${baseUrl}${contextRoot}/api/soc/attachment/_download?id=${incident.info.id}&fileName=${allValue.fileName}`

        downloadLink(url)
    }

    deleteAttachment(allValue) {
        const {baseUrl} = this.context
        let {incident} = this.state

        PopupDialog.prompt({
            title: t('txt-delete'),
            confirmText: t('txt-delete'),
            cancelText: t('txt-cancel'),
            display: <div className='content delete'>
                <span>{t('txt-delete-msg')}: {allValue.fileName}?</span>
            </div>,
            act: (confirmed, data) => {
                if (confirmed) {
                    ah.one({
                        url: `${baseUrl}/api/soc/attachment/_delete?id=${incident.info.id}&fileName=${allValue.fileName}`,
                        type: 'DELETE'
                    })
                    .then(data => {
                        if (data.ret === 0) {
                            // this.getIncident(incident.info.id, 'view')
                            this.refreshIncidentAttach(incident.info.id)
                        }
                    })
                    .catch(err => {
                        helper.showPopupMsg('', t('txt-error'), err.message)
                    })
                }
            }
        })
    }



    toPdfPayload(incident) {
        const {incidentType, relatedListOptions, deviceListOptions, showDeviceListOptions} = this.state
        let payload = {}

        payload.id = incident.id
        payload.header = `${it('txt-incident-id')}${incident.id}`
        // basic
        payload.basic = {}
        payload.basic.cols = 4
        payload.basic.header = `${t('edge-management.txt-basicInfo')}    ${f('incidentFields.updateDttm')}  ${helper.getFormattedDate(incident.updateDttm, 'local')}`
        payload.basic.table = []
        payload.basic.table.push({text: f('incidentFields.title'), colSpan: 2})
        payload.basic.table.push({text: f('incidentFields.category'), colSpan: 2})
        payload.basic.table.push({text: incident.title, colSpan: 2})
        payload.basic.table.push({text: it(`category.${incident.category}`), colSpan: 2})
        payload.basic.table.push({text: f('incidentFields.reporter'), colSpan: 2})
        payload.basic.table.push({text: f('incidentFields.impactAssessment'), colSpan: 1})
        payload.basic.table.push({text: f('incidentFields.finalDate'), colSpan: 1})
        payload.basic.table.push({text: incident.reporter, colSpan: 2})
        payload.basic.table.push({text: `${incident.impactAssessment} (${(9 - 2 * incident.impactAssessment)} ${it('txt-day')})`, colSpan: 1})
        payload.basic.table.push({text: helper.getFormattedDate(incident.expireDttm, 'local'), colSpan: 1})
       
        if (incidentType === 'ttps') {
            payload.basic.table.push({text: f('incidentFields.description'), colSpan: 4})
            payload.basic.table.push({text: incident.description, colSpan: 4})

            if (_.size(incident.relatedList) > 0) {
                let value = []
                _.forEach(incident.relatedList, el => {
                    const target = _.find(relatedListOptions, {value: el.value})
                    value.push(target.text)
                })

                payload.basic.table.push({text: f('incidentFields.relatedList'), colSpan: 4})
                payload.basic.table.push({text: value.toString(), colSpan: 4})
            }
        }

        // history
        payload.history = {}
        payload.history.cols = 4
        payload.history.header = it('txt-flowTitle')
        payload.history.table = []
        payload.history.table.push({text: f(`incidentFields.status`), colSpan: 1})
        payload.history.table.push({text: f(`incidentFields.reviewDttm`), colSpan: 1})
        payload.history.table.push({text: f(`incidentFields.reviewerName`), colSpan: 1})
        payload.history.table.push({text: f(`incidentFields.suggestion`), colSpan: 1})

        _.forEach(incident.historyList, el => {
            payload.history.table.push({text: it(`action.${el.status}`), colSpan: 1})
            payload.history.table.push({text: Moment(el.reviewDttm).local().format('YYYY-MM-DD HH:mm:ss'), colSpan: 1})
            payload.history.table.push({text: el.reviewerName, colSpan: 1})
            payload.history.table.push({text: el.suggestion, colSpan: 1})
        })


        // attach
        if (_.size(incident.fileList) > 0) {
            payload.attachment = {}
            payload.attachment.cols = 4
            payload.attachment.header = it('txt-attachedFile')
            payload.attachment.table = []
            payload.attachment.table.push({text: f(`incidentFields.fileName`), colSpan: 1})
            payload.attachment.table.push({text: f(`incidentFields.fileSize`), colSpan: 1})
            payload.attachment.table.push({text: f(`incidentFields.fileDttm`), colSpan: 1})
            payload.attachment.table.push({text: f(`incidentFields.fileMemo`), colSpan: 1})

            _.forEach(incident.fileList, file => {
                payload.attachment.table.push({text: file.fileName, colSpan: 1})
                payload.attachment.table.push({text: this.formatBytes(file.fileSize), colSpan: 1})
                payload.attachment.table.push({text: Moment(file.fileDttm).local().format('YYYY-MM-DD HH:mm:ss'), colSpan: 1})
                const target = _.find(JSON.parse(incident.attachmentDescription), {fileName: file.fileName})
                payload.attachment.table.push({text: target.fileMemo, colSpan: 1})
            })
        }

        //  Contact list
        payload.notifyList = {}
        payload.notifyList.cols = 8
        payload.notifyList.header = it('txt-notifyUnit')
        payload.notifyList.table = []

        _.forEach(incident.notifyList, notify => {
            payload.notifyList.table.push({text: f('incidentFields.name'), colSpan: 2})
            payload.notifyList.table.push({text: f('incidentFields.reviewerName'), colSpan: 2})
            payload.notifyList.table.push({text: f('incidentFields.phone'), colSpan: 2})
            payload.notifyList.table.push({text: f('incidentFields.email'), colSpan: 2})
            payload.notifyList.table.push({text: notify.title, colSpan: 2})
            payload.notifyList.table.push({text: notify.name, colSpan: 2})
            payload.notifyList.table.push({text: notify.phone, colSpan: 2})
            payload.notifyList.table.push({text: notify.email, colSpan: 2})
        })


        // accident
        payload.accident = {}
        payload.accident.cols = 4
        payload.accident.header = it('txt-accidentTitle')
        payload.accident.table = []
        payload.accident.table.push({text: it('txt-accidentClassification'), colSpan: 2})
        payload.accident.table.push({text: it('txt-reason'), colSpan: 2})
        
        if (incident.accidentCatogory) {
            payload.accident.table.push({text: it(`accident.${incident.accidentCatogory}`), colSpan: 2})
        }
        else {
            payload.accident.table.push({text: ' ', colSpan: 2})
        }
        
        if (!incident.accidentCatogory) {
            payload.accident.table.push({text: ' ', colSpan: 2})
        }
        else if (incident.accidentCatogory === '5') {
            payload.accident.table.push({text: incident.accidentAbnormalOther, colSpan: 2})
        }
        else {
            payload.accident.table.push({text: it(`accident.${incident.accidentAbnormal}`), colSpan: 2})
        }

        payload.accident.table.push({text: it('txt-accidentDescr'), colSpan: 4})
        payload.accident.table.push({text: incident.accidentDescription, colSpan: 4})
        payload.accident.table.push({text: it('txt-reasonDescr'), colSpan: 4})
        payload.accident.table.push({text: incident.accidentReason, colSpan: 4})
        payload.accident.table.push({text: it('txt-accidentInvestigation'), colSpan: 4})
        payload.accident.table.push({text: incident.accidentInvestigation, colSpan: 4})


        //  event list
        payload.eventList = {}
        payload.eventList.cols = 6
        payload.eventList.header = it('txt-incident-events')
        payload.eventList.table = []

        _.forEach(incident.eventList, event => {
            payload.eventList.table.push({text: f('incidentFields.rule'), colSpan: 3})
            payload.eventList.table.push({text: f('incidentFields.deviceId'), colSpan: 3})
            payload.eventList.table.push({text: event.description, colSpan: 3})
            const target = _.find(showDeviceListOptions, {value: event.deviceId})
            
            if (target) {
                payload.eventList.table.push({text: target.text, colSpan: 3})
            }
            else {
                payload.eventList.table.push({text: '', colSpan: 3})
            }
            
            payload.eventList.table.push({text: f('incidentFields.dateRange'), colSpan: 4})
            payload.eventList.table.push({text: it('txt-frequency'), colSpan: 2})
            payload.eventList.table.push({text: Moment.utc(event.startDttm, 'YYYY-MM-DDTHH:mm:ss[Z]').local().format('YYYY-MM-DD HH:mm:ss'), colSpan: 2})
            payload.eventList.table.push({text: Moment.utc(event.endDttm, 'YYYY-MM-DDTHH:mm:ss[Z]').local().format('YYYY-MM-DD HH:mm:ss'), colSpan: 2})
            payload.eventList.table.push({text: event.frequency, colSpan: 2})

            _.forEach(event.eventConnectionList, conn => {
                payload.eventList.table.push({text: f('incidentFields.srcIp'), colSpan: 2})
                payload.eventList.table.push({text: f('incidentFields.srcPort'), colSpan: 2})
                payload.eventList.table.push({text: f('incidentFields.srcHostname'), colSpan: 2})
                payload.eventList.table.push({text: conn.srcIp, colSpan: 2})
                payload.eventList.table.push({text: conn.srcPort, colSpan: 2})
                payload.eventList.table.push({text: conn.srcHostname, colSpan: 2})
                payload.eventList.table.push({text: f('incidentFields.dstIp'), colSpan: 2})
                payload.eventList.table.push({text: f('incidentFields.dstPort'), colSpan: 2})
                payload.eventList.table.push({text: f('incidentFields.dstHostname'), colSpan: 2})
                payload.eventList.table.push({text: conn.dstIp, colSpan: 2})
                payload.eventList.table.push({text: conn.dstPort, colSpan: 2})
                payload.eventList.table.push({text: conn.dstHostname, colSpan: 2})
            })
        })


        // ttps
        if (_.size(incident.ttpList) > 0) {
            payload.ttps = {}
            payload.ttps.cols = 4
            payload.ttps.header = it('txt-incident-ttps')
            payload.ttps.table = []
        }

        _.forEach(incident.ttpList, ttp => {
            payload.ttps.table.push({text: f('incidentFields.technique'), colSpan: 2})
            payload.ttps.table.push({text: f('incidentFields.infrastructureType'), colSpan: 2})
            payload.ttps.table.push({text: ttp.title, colSpan: 2})
            payload.ttps.table.push({text: (ttp.infrastructureType === 0 || ttp.infrastructureType === '0') ? 'IOC' : 'IOA' , colSpan: 2})

            if (_.size(ttp.etsList) > 0) {
                payload.ttps.table.push({text: it('txt-ttp-ets'), colSpan: 4})
                _.forEach(ttp.etsList, ets => {
                    payload.ttps.table.push({text: f('incidentFields.cveId'), colSpan: 2})
                    payload.ttps.table.push({text: f('incidentFields.etsDescription'), colSpan: 2})
                    payload.ttps.table.push({text: ets.cveId || '', colSpan: 2})
                    payload.ttps.table.push({text: ets.description || '', colSpan: 2})
                })
            }

            if (_.size(ttp.obsFileList) > 0) {
                payload.ttps.table.push({text: it('txt-ttp-obs-file'), colSpan: 4})
                _.forEach(ttp.obsFileList, obsFile => {
                    payload.ttps.table.push({text: f('incidentFields.fileName'), colSpan: 2})
                    payload.ttps.table.push({text: f('incidentFields.fileExtension'), colSpan: 2})
                    payload.ttps.table.push({text: obsFile.fileName, colSpan: 2})
                    payload.ttps.table.push({text: obsFile.fileExtension, colSpan: 2})
                    payload.ttps.table.push({text: 'MD5', colSpan: 2})
                    payload.ttps.table.push({text: 'SHA1', colSpan: 2})
                    payload.ttps.table.push({text: obsFile.md5, colSpan: 2})
                    payload.ttps.table.push({text: obsFile.sha1, colSpan: 2})
                    payload.ttps.table.push({text: 'SHA256', colSpan: 4})
                    payload.ttps.table.push({text: obsFile.sha256, colSpan: 4})
                })
            }

            if (_.size(ttp.obsUriList) > 0) {
                payload.ttps.table.push({text: it('txt-ttp-obs-uri'), colSpan: 4})
                _.forEach(ttp.obsUriList, obsUri => {
                    payload.ttps.table.push({text: f('incidentFields.uriType'), colSpan: 2})
                    payload.ttps.table.push({text: f('incidentFields.uriValue'), colSpan: 2})
                    payload.ttps.table.push({text: obsUri.uriType === 0 ? 'URL' : f('incidentFields.domain'), colSpan: 2})
                    payload.ttps.table.push({text: obsUri.uriValue, colSpan: 2})
                })
            }

            if (_.size(ttp.obsSocketList) > 0) {
                payload.ttps.table.push({text: it('txt-ttp-obs-socket'), colSpan: 4})
                _.forEach(ttp.obsSocketList, obsSocket => {
                    payload.ttps.table.push({text: 'IP', colSpan: 2})
                    payload.ttps.table.push({text: 'Port', colSpan: 2})
                    payload.ttps.table.push({text: obsSocket.ip, colSpan: 2})
                    payload.ttps.table.push({text: obsSocket.port, colSpan: 2})
                })
            }
        })

        return payload
    }

    exportPdf() {
        const {baseUrl, contextRoot} = this.context
        const {incident} = this.state
        downloadWithForm(`${baseUrl}${contextRoot}/api/soc/_pdf`, {payload: JSON.stringify(this.toPdfPayload(incident.info))})
    }

    exportPdfFromTable(data) {
        const {baseUrl, contextRoot} = this.context
        this.handleCloseMenu()
        downloadWithForm(`${baseUrl}${contextRoot}/api/soc/_pdf`, {payload: JSON.stringify(this.toPdfPayload(data))})
    }

    exportAll() {
        const {baseUrl, contextRoot} = this.context
        const requestData = this.getIncidentRequestData();

        ah.one({
            url: `${baseUrl}/api/soc/_searchV4`,
            data: JSON.stringify(requestData),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
        .then(data => {
            let payload = _.map(data.rt.rows, el => {
                return this.toPdfPayload(el)
            })

            downloadWithForm(`${baseUrl}${contextRoot}/api/soc/_pdfs`, {payload: JSON.stringify(payload)})
        })
        .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        })
    }

    exportAllByWord() {
        const {baseUrl, contextRoot} = this.context;
        const payload = this.getIncidentRequestData();
        downloadWithForm(`${baseUrl}${contextRoot}/api/soc/_exportWord`, {payload: JSON.stringify(payload)});
    }

    notifyContact() {
        const {baseUrl, contextRoot} = this.context
        const {incident} = this.state

        let payload = {
            incidentId:incident.info.id
        }

        ah.one({
            url: `${baseUrl}/api/soc/_notify`,
            data: JSON.stringify(payload),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
            .then(data => {
                if (data.status.includes('success')){
                    helper.showPopupMsg('', it('txt-notify'), it('txt-notify')+t('notifications.txt-sendSuccess'))
                }else{
                    helper.showPopupMsg('', it('txt-notify'), t('txt-txt-fail'))
                }
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })

    }
}

IncidentManagement.contextType = BaseDataContext;
IncidentManagement.propTypes = {
    // nodeBaseUrl: PropTypes.string.isRequired
};

export default IncidentManagement
