import React, {Component} from "react"
import {default as ah, getInstance} from "react-ui/build/src/utils/ajax-helper"
import cx from "classnames"
import Moment from 'moment'

import ComboBox from 'react-ui/build/src/components/combobox'
import ContextMenu from 'react-ui/build/src/components/contextmenu'
import DropDownList from 'react-ui/build/src/components/dropdown'
import FileInput from 'react-ui/build/src/components/file-input'
import Input from 'react-ui/build/src/components/input'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import TableContent from '../common/table-content'
import Textarea from 'react-ui/build/src/components/textarea'
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import GeneralDialog from '@f2e/gui/dist/components/dialog/general-dialog'
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {BaseDataContext} from "../common/context"
import SocConfig from "../common/soc-configuration"
import helper from "../common/helper"

import Events from './common/events'
import Ttps from './common/ttps'
import {downloadLink, downloadWithForm} from "react-ui/build/src/utils/download";
import ModalDialog from "react-ui/build/src/components/modal-dialog";
import DataTable from "react-ui/build/src/components/table";
import _ from "lodash";
import DateRange from "react-ui/build/src/components/date-range";
import DatePicker from "react-ui/build/src/components/date-picker";

import IncidentComment from './common/comment'
import IncidentTag from './common/tag'
import IncidentReview from './common/review'
import FileUpload from "../common/file-upload";
import {KeyboardDateTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import moment from "moment";

let t = null;
let f = null;
let et = null;
let it = null;

const INCIDENT_STATUS_ALL = 0
const INCIDENT_STATUS_UNREVIEWED = 1
const INCIDENT_STATUS_REVIEWED = 2
const INCIDENT_STATUS_CLOSED = 3
const INCIDENT_STATUS_SUBMITTED = 4
const INCIDENT_STATUS_DELETED = 5
const INCIDENT_STATUS_ANALYZED = 6
const INCIDENT_STATUS_EXECUTOR_UNREVIEWED = 7
const INCIDENT_STATUS_EXECUTOR_CLOSE = 8

const SOC_Analyzer = 1
const SOC_Executor = 2
const SOC_Super = 3

class Incident extends Component {
    constructor(props) {
        super(props);

        t = global.chewbaccaI18n.getFixedT(null, "connections");
        f = chewbaccaI18n.getFixedT(null, "tableFields");
        et = global.chewbaccaI18n.getFixedT(null, "errors");
        it = global.chewbaccaI18n.getFixedT(null, "incident");

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
            dashboard: {
                all: 0,
                expired: 0,
                unhandled: 0,
                mine: 0
            },
            relatedListOptions: [],
            deviceListOptions: [],
            incident: {
                dataFieldsArr: ['_menu', 'id', 'tag', 'status', 'type', 'createDttm', 'title', 'category', 'reporter'],
                fileFieldsArr: ['fileName', 'fileSize', 'fileDttm', 'fileMemo', 'action'],
                flowFieldsArr: ['id', 'status', 'reviewDttm', 'reviewerName', 'suggestion'],
                dataFields: {},
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
            accountRoleType:1,
            loadListType:SOC_Analyzer,
            attach: null
        };

        this.ah = getInstance("chewbacca");
    }

    componentDidMount() {
        const {locale, sessionRights} = this.context;
        helper.getPrivilegesInfo(sessionRights, 'config', locale);

        let alertDataId = this.getQueryString('alertDataId');
        let alertData = sessionStorage.getItem(alertDataId);

        if (alertData) {
            this.toggleContent('redirect', alertData);
            sessionStorage.removeItem(alertDataId)
        } else {
            const {session} = this.context;

            if (_.includes(session.roles, 'SOC Supervior' || 'SOC Supervisor' || 'SOC Executor')){
                if (_.includes(session.roles, 'SOC Executor')){
                    this.setState({
                        accountRoleType:SOC_Super
                    },() => {
                        this.loadCondition('unhandled')
                    })
                }else{
                    this.setState({
                        accountRoleType:SOC_Super
                    },() => {
                        this.loadCondition('unhandled')
                    })
                }
            } else  if (_.includes(session.roles, 'SOC Executor')){
                this.setState({
                    accountRoleType:SOC_Executor
                },() => {
                    this.loadCondition('unhandled')
                })
            } else{
                this.setState({
                    accountRoleType:SOC_Analyzer
                },() => {
                    this.loadCondition('unhandled')
                })
            }
        }

        this.getOptions()
        this.loadDashboard()
    }

    getQueryString(name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    /**
     * Get and set Incident Device table data
     * @method
     * @param {string} fromSearch - option for the 'search'
     */
    loadData = (fromSearch) => {
        const {baseUrl, contextRoot, session} = this.context;
        const {search, incident} = this.state;

        if (search.datetime) {
            search.startDttm = Moment(search.datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
            search.endDttm = Moment(search.datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
        }

        search.isExecutor = _.includes(session.roles, 'SOC Executor')
        search.accountRoleType = this.state.accountRoleType
        search.account = session.accountId

        ah.one({
            url: `${baseUrl}/api/soc/_searchV2?page=${incident.currentPage}&pageSize=${incident.pageSize}`,
            data: JSON.stringify(search),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
        .then(data => {
            if (data) {
                let tempEdge = {...incident};
                tempEdge.dataContent = data.rt.rows;
                tempEdge.totalCount = data.rt.counts;
                tempEdge.currentPage = fromSearch === 'search' ? 1 : incident.currentPage;

                let dataFields = {};
                incident.dataFieldsArr.forEach(tempData => {
                    dataFields[tempData] = {
                        label: tempData === '_menu' ? '' : f(`incidentFields.${tempData}`),
                        sortable: this.checkSortable(tempData),
                        formatter: (value, allValue, i) => {
                            if (tempData === '_menu') {
                                return <div className={cx('table-menu', {'active': value})}>
                                    <button onClick={this.handleRowContextMenu.bind(this, allValue)}><i
                                        className='fg fg-more'/></button>
                                </div>
                            } else if (tempData === 'type') {
                                let tmpList = [];
                                tmpList = allValue.ttpList;
                                if (tmpList.length === 0) {
                                    return <span>{it('txt-incident-event')}</span>
                                } else {
                                    return <span>{it('txt-incident-related')}</span>
                                }
                            } else if (tempData === 'category') {
                                return <span>{it(`category.${value}`)}</span>
                            } else if (tempData === 'status') {
                                return <span>{it(`status.${value}`)}</span>
                            } else if (tempData === 'createDttm') {
                                return <span>{helper.getFormattedDate(value, 'local')}</span>
                            } else if (tempData === 'tag') {
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

                            } else {
                                return <span>{value}</span>
                            }
                        }
                    }
                });

                tempEdge.dataFields = dataFields;
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

        searchPayload.account = session.accountId

        ah.one({
            url: `${baseUrl}/api/soc/_searchV2?page=${incident.currentPage}&pageSize=${incident.pageSize}`,
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
                    tempEdge.currentPage = fromSearch === 'search' ? 1 : incident.currentPage;

                    let dataFields = {};
                    incident.dataFieldsArr.forEach(tempData => {
                        dataFields[tempData] = {
                            label: tempData === '_menu' ? '' : f(`incidentFields.${tempData}`),
                            sortable: this.checkSortable(tempData),
                            formatter: (value, allValue, i) => {
                                if (tempData === '_menu') {
                                    return <div className={cx('table-menu', {'active': value})}>
                                        <button onClick={this.handleRowContextMenu.bind(this, allValue)}><i
                                            className='fg fg-more'/></button>
                                    </div>
                                } else if (tempData === 'type') {
                                    let tmpList = [];
                                    tmpList = allValue.ttpList;
                                    if (tmpList.length === 0) {
                                        return <span>{it('txt-incident-event')}</span>
                                    } else {
                                        return <span>{it('txt-incident-related')}</span>
                                    }
                                } else if (tempData === 'category') {
                                    return <span>{it(`category.${value}`)}</span>
                                } else if (tempData === 'status') {
                                    return <span>{it(`status.${value}`)}</span>
                                } else if (tempData === 'createDttm') {
                                    return <span>{helper.getFormattedDate(value, 'local')}</span>
                                } else if (tempData === 'tag') {
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
                                } else {
                                    return <span>{value}</span>
                                }
                            }
                        }
                    });

                    tempEdge.dataFields = dataFields;
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

        let roleType = 'analyzer';

        const payload = {
            keyword: '',
            category: 0,
            status: 0,
            startDttm: Moment(helper.getSubstractDate(1, 'month')).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
            endDttm: Moment(Moment().local().format('YYYY-MM-DDTHH:mm:ss')).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
            isExpired: 2,
            isExecutor:_.includes(session.roles, 'SOC Executor'),
            accountRoleType:this.state.accountRoleType,
            account: session.accountId
        }

        switch (this.state.accountRoleType){
            case 1:
                roleType = 'analyzer'
                break
            case 2:
                roleType = 'executor'
                break
            case 3:
                roleType = 'supervisor'
                break
        }

        ah.all([
            {
                url: `${baseUrl}/api/soc/_searchV2?page=1&pageSize=20`,
                data: JSON.stringify(payload),
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json'
            },
            {
                url: `${baseUrl}/api/soc/statistic/${roleType}/_search?createrId=${session.accountId}`
            }
        ])
        .then(data => {
            let dashboard = {
                all: data[0].rt.counts,
                expired: data[1].rt.rows[0].expireCount,
                unhandled: data[1].rt.rows[0].dealCount,
                mine: data[1].rt.rows[0].myCount,
            }

            this.setState({dashboard})
        })
        .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        })
    }

    loadCondition = (type) => {
        const {session} = this.context

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
            this.loadWithoutDateTimeData('search',search)
        } else if (type === 'unhandled') {
            this.setState({loadListType: 1})
            if (search.accountRoleType === SOC_Executor){
                search.status = 2
                search.subStatus = 6
            }else if(search.accountRoleType === SOC_Super){
                search.status = 7
            }else{
                search.status = 1
            }
            this.loadWithoutDateTimeData('search',search)
        } else if (type === 'mine') {
            this.setState({loadListType: 2})
            search.status = 0
            search.creator = session.accountId
            this.loadWithoutDateTimeData('search',search)
        }else{

        }
        this.clearFilter()
    }

    handleRowContextMenu = (allValue, evt) => {
        let menuItems = [];

        menuItems = this.generateClickMenu(allValue)

        ContextMenu.open(evt, menuItems, 'incidentMenu');
        evt.stopPropagation();
    };

    generateClickMenu = (allValue) => {
        let menuItems = [];

        let itemDownload =  {
            id: 'download',
            text: it('txt-download'),
            action: () => this.getIncidentSTIXFile(allValue.id)
        }
        let viewItem = {
            id: 'view',
            text: t('txt-view'),
            action: () => this.getIncident(allValue.id,'view')
        }
        let itemTag = {
            id: 'tag',
            text: it('txt-tag'),
            action: () => this.openIncidentTag(allValue.id)
        };

        menuItems.push(itemTag)
        menuItems.push(viewItem)

        if (allValue.status === INCIDENT_STATUS_CLOSED || allValue.status === INCIDENT_STATUS_SUBMITTED) {
            menuItems.push(itemDownload)
        }

        return menuItems
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
        const {activeContent, baseUrl, contextRoot, showFilter, showChart, incident} = this.state

        return <div>
            <IncidentComment ref={ref => { this.incidentComment=ref }} />
            {this.state.loadListType === 0 && (
                <IncidentTag ref={ref => { this.incidentTag=ref }} onLoad={this.loadCondition.bind(this,'expired')} />
            )}
            {this.state.loadListType === 1 && (
                <IncidentTag ref={ref => { this.incidentTag=ref }} onLoad={this.loadCondition.bind(this,'unhandled')} />
            )}
            {this.state.loadListType === 2 && (
                <IncidentTag ref={ref => { this.incidentTag=ref }} onLoad={this.loadCondition.bind(this,'mine')} />
            )}
            {this.state.loadListType === 3 && (
                <IncidentTag ref={ref => { this.incidentTag=ref }} onLoad={this.loadData.bind(this)} />
            )}

            <IncidentReview ref={ref => { this.incidentReview=ref }} onLoad={this.getIncident.bind(this)} />

            <div className="sub-header">
                <div className='secondary-btn-group right'>
                    <button className={cx('', {'active': showFilter})} onClick={this.toggleFilter}
                            title={t('txt-filter')}><i className='fg fg-filter'/></button>
                    <button className={cx('', {'active': showChart})} onClick={this.toggleChart}
                            title={it('txt-statistics')}><i className='fg fg-chart-columns'/></button>
                    {/*<button className='' onClick={this.getIncidentSTIXFileExample.bind(this, 'event')}*/}
                    {/*        title={it('txt-downloadEvent')}><i className='fg fg-data-download'/></button>*/}
                    {/*<button className='' onClick={this.getIncidentSTIXFileExample.bind(this, 'related')}*/}
                    {/*        title={it('txt-downloadRelated')}><i className='fg fg-data-download'/></button>*/}
                    <button className='' onClick={this.openIncidentTag.bind(this, null)}
                            title={it('txt-custom-tag')}><i className='fg fg-color-ruler'/></button>
                    <button className='' onClick={this.openIncidentComment.bind(this)}
                            title={it('txt-comment-example-edit')}><i className='fg fg-report'/></button>
                </div>
            </div>

            <div className='data-content'>
                <SocConfig baseUrl={baseUrl} contextRoot={contextRoot} />

                <div className='parent-content'>
                    {this.renderStatistics()}
                    {this.renderFilter()}

                    {activeContent === 'tableList' &&
                    <div className='main-content'>
                        <header className='main-header'>{it('txt-incident')}</header>
                        <div className='content-header-btns'>
                            {activeContent === 'viewIncident' &&
                            <button className='standard btn list'
                                    onClick={this.toggleContent.bind(this, 'tableList')}>{t('network-inventory.txt-backToList')}</button>
                            }
                            <button className='standard btn edit'
                                    onClick={this.toggleContent.bind(this, 'addIncident', 'events')}>{it('txt-addIncident-events')}</button>
                            <button className='standard btn edit'
                                    onClick={this.toggleContent.bind(this, 'addIncident', 'ttps')}>{it('txt-addIncident-ttps')}</button>
                        </div>
                        <TableContent
                            dataTableData={incident.dataContent}
                            dataTableFields={incident.dataFields}
                            dataTableSort={incident.sort}
                            paginationTotalCount={incident.totalCount}
                            paginationPageSize={incident.pageSize}
                            paginationCurrentPage={incident.currentPage}
                            handleTableSort={this.handleTableSort}
                            handleRowMouseOver={this.handleRowMouseOver}
                            paginationPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                            paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')}/>
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


        if (incident.info.status === INCIDENT_STATUS_UNREVIEWED) {
            // 待送審
            if (this.state.accountRoleType === SOC_Executor) {

            }else if (this.state.accountRoleType === SOC_Super){

            }else {
                editCheck = true
                submitCheck = true
            }
        } else if (incident.info.status === INCIDENT_STATUS_REVIEWED) {
            // 待審核
            if (session.accountId === incident.info.creator) {
                drawCheck = true
            }

            if (this.state.accountRoleType === SOC_Executor) {
                editCheck = true
                returnCheck = true
                auditCheck = true
                closeCheck = true
            }else if (this.state.accountRoleType === SOC_Super){

            }else {
                editCheck = true
            }
        } else if (incident.info.status === INCIDENT_STATUS_CLOSED) {
            // 結案(未發布)
            if (session.accountId === incident.info.creator) {
            }

            if (this.state.accountRoleType === SOC_Super) {
                publishCheck = true
            }
        } else if (incident.info.status === INCIDENT_STATUS_SUBMITTED) {
            if (this.state.accountRoleType === SOC_Executor) {
                editCheck = true
            }else if (this.state.accountRoleType === SOC_Super){
                returnCheck = true
                editCheck = true
                auditCheck = true
            }else {
                editCheck = true
            }
        } else if (incident.info.status === INCIDENT_STATUS_DELETED) {

        } else if (incident.info.status === INCIDENT_STATUS_ANALYZED) {
            if (this.state.accountRoleType === SOC_Executor) {
                editCheck = true
                transferCheck = true
            }else if (this.state.accountRoleType === SOC_Super){
                editCheck = true
                transferCheck = true
            }
        } else if (incident.info.status === INCIDENT_STATUS_EXECUTOR_UNREVIEWED) {
            if (this.state.accountRoleType === SOC_Executor) {
                editCheck = true
            }else if (this.state.accountRoleType === SOC_Super){
                editCheck = true
                returnCheck = true
                signCheck = true
            }else{
                if (session.accountId === incident.info.creator) {
                    drawCheck = true
                }
                editCheck = true
            }
        }else if (incident.info.status === INCIDENT_STATUS_EXECUTOR_CLOSE) {
            if (this.state.accountRoleType === SOC_Executor) {
                transferCheck = true
            }else if (this.state.accountRoleType === SOC_Super){

            }
        }


        return <div className='main-content basic-form'>
            <header className='main-header' style={{display: 'flex'}}>
                {it(`txt-${activeContent}-${incidentType}`)}
                {
                    activeContent !== 'addIncident' &&
                    <div className='msg' style={{display: 'flex'}}>{it('txt-id')}{incident.info.id}
                        <div style={{display: 'flex', marginLeft: '30px'}}>
                        {
                            _.map(incident.info.tagList, el => {
                                return <div style={{display: 'flex', marginRight: '30px'}}>
                                    <div className='incident-tag-square' style={{backgroundColor: el.tag.color}}/>
                                    &nbsp;{el.tag.tag}
                                </div>
                            })
                        }
                        </div>
                    </div>
                }
            </header>


            <div className='auto-settings' style={{height: '70vh'}}>
                {
                    displayPage === 'main' && this.displayMainPage()
                }
                {
                    _.includes(['addIncident', 'editIncident', 'viewIncident'], activeContent) && displayPage === 'main' && this.displayAttached()
                }
                {
                    activeContent !== 'addIncident' &&  displayPage === 'main' && this.displayFlow()
                }
            {
                displayPage === 'notice' && this.displayNoticePage()
            }
            {
                displayPage === 'events' && this.displayEventsPage()
            }
            {
                displayPage === 'ttps' && this.displayTtpPage()
            }
            </div>

            {activeContent === 'viewIncident' &&
                <footer style={{'textAlign':'center'}}>
                    <button className='standard btn list'
                            onClick={this.toggleContent.bind(this, 'tableList')}>{t('network-inventory.txt-backToList')}</button>
                    {editCheck &&
                        <button className='standard btn list'
                                onClick={this.toggleContent.bind(this, 'editIncident')}>{t('txt-edit')}</button>
                    }
                    {drawCheck &&
                        <button className='standard btn list'
                                onClick={this.openReviewModal.bind(this, incident.info, 'draw')}>{it('txt-draw')}</button>
                    }
                    {submitCheck &&
                        <button className='standard btn list'
                                onClick={this.openReviewModal.bind(this, incident.info, 'submit')}>{it('txt-submit')}</button>
                    }
                    {returnCheck &&
                       <button className='standard btn list'
                                onClick={this.openReviewModal.bind(this, incident.info, 'return')}>{it('txt-return')}</button>
                    }
                    {auditCheck &&
                        <button className='standard btn list'
                                onClick={this.openReviewModal.bind(this, incident.info, 'auditV2')}>{it('txt-audit')}</button>
                    }
                    {publishCheck &&
                        <button className='standard btn list'
                                onClick={this.openSendMenu.bind(this, incident.info.id)}>{it('txt-send')}</button>
                    }
                    {transferCheck &&
                        <button className='standard btn list'
                                onClick={this.openReviewModal.bind(this, incident.info, 'analyze')}>{it('txt-transfer')}</button>
                    }
                    {signCheck &&
                    <button className='standard btn list'
                            onClick={this.openReviewModal.bind(this, incident.info, 'sign')}>{it('txt-sign')}</button>
                    }
                    {closeCheck &&
                    <button className='standard btn list'
                            onClick={this.openReviewModal.bind(this, incident.info, 'close')}>{it('txt-close')}</button>
                    }
                </footer>
            }

            {
                activeContent === 'editIncident' &&
                <footer>
                    <button className='standard'
                            onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</button>
                    <button onClick={this.handleSubmit}>{t('txt-save')}</button>

                </footer>
            }
            {
                activeContent === 'addIncident' &&
                <footer>
                    <button className='standard'
                            onClick={this.toggleContent.bind(this, 'cancel-add')}>{t('txt-cancel')}</button>
                    <button onClick={this.handleSubmit}>{t('txt-save')}</button>

                </footer>
            }
        </div>
    };

    handleIncidentPageChange = (val) => {
        this.setState({displayPage: val})
    };

    displayMainPage = () => {
        const {activeContent, incidentType, incident, relatedListOptions} = this.state;
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

            <div className='group'>
                <label htmlFor='title'>{f('incidentFields.title')}</label>
                <TextField
                    id='title'
                    name='title'
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    onChange={this.handleDataChangeMui}
                    value={incident.info.title}
                    required={true}
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
                    required={true}
                    select
                    value={incident.info.category}
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
                    required={true}
                    value={incident.info.reporter}
                    disabled={activeContent === 'viewIncident'}/>
            </div>
            <div className='group' style={{width: '25vh'}}>
                <label htmlFor='impactAssessment'>{f('incidentFields.impactAssessment')}</label>
                <TextField
                    id='impactAssessment'
                    variant='outlined'
                    fullWidth={true}
                    size='small'
                    select
                    name='impactAssessment'
                    onChange={this.handleDataChangeMui}
                    required={true}
                    value={incident.info.impactAssessment}
                    disabled={activeContent === 'viewIncident'}>
                    {
                        _.map(_.range(1, 5), el => {
                            return  <MenuItem value={el}>{`${el} (${(9 - 2 * el)} ${it('txt-day')})`}</MenuItem>
                        })
                    }
                </TextField>
            </div>

            <div className='group' style={{width: '25vh'}}>
                <label htmlFor='expireDttm'>{f('incidentFields.finalDate')}</label>
                {/*<DatePicker*/}
                {/*    id='expireDttm'*/}
                {/*    className='daterange'*/}
                {/*    onChange={this.handleDataChange.bind(this, 'expireDttm')}*/}
                {/*    enableTime={true}*/}
                {/*    required={true}*/}
                {/*    validate={{t: et}}*/}
                {/*    value={incident.info.expireDttm}*/}
                {/*    locale={locale}*/}
                {/*    readOnly={activeContent === 'viewIncident'} />*/}
                <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
                    <KeyboardDateTimePicker
                        id='expireDttm'
                        className='date-time-picker'
                        inputVariant='outlined'
                        variant='inline'
                        format='YYYY-MM-DD HH:mm'
                        ampm={false}
                        required={true}
                        value={incident.info.expireDttm}
                        readOnly={activeContent === 'viewIncident' }
                        onChange={this.handleDataChange.bind(this, 'expireDttm')} />
                </MuiPickersUtilsProvider>
            </div>

            {incidentType === 'ttps' && <div className='group full'>
                <label htmlFor='description'>{f('incidentFields.description')}</label>
                <TextareaAutosize
                    id='description'
                    onChange={this.handleDataChangeMui}
                    required={true}
                    name='description'
                    value={incident.info.description}
                    rows={3}
                    disabled={activeContent === 'viewIncident'}/>
            </div>}

            {incidentType === 'ttps' &&
            <div className='group full'>
                <label htmlFor='relatedList'>{f('incidentFields.relatedList')}</label>
                <ComboBox
                    id='relatedList'
                    className='relatedList'
                    onChange={this.handleDataChange.bind(this, 'relatedList')}
                    list={relatedListOptions}
                    search={{enabled: true, placeholder: '', interactive: true}}
                    multiSelect={{enabled: true}}
                    value={incident.info.relatedList}
                    disabled={activeContent === 'viewIncident'}/>
            </div>
            }

        </div>
    };

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
        this.setState({attach: val})
    }

    handleAFChange(file) {
        let flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")
        if (flag.test(file.name)){
            helper.showPopupMsg( it('txt-attachedFileNameError'), t('txt-error'), )
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
                    <TextareaAutosize id='comment' rows={3} />
                </div>
            </div>,
            act: (confirmed, data) => {

                if (confirmed) {
                    let flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")

                    if (flag.test(data.file.name)){
                    }else{
                        this.uploadAttachmentByModal(data.file, data.comment)
                    }
                }
            }
        })
    }

    displayAttached = () => {
        const {activeContent, incidentType, incident, relatedListOptions, attach} = this.state;
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
                        const target = _.find(JSON.parse(incident.info.attachmentDescription), {fileName: allValue.fileName})
                        return <span>{target.fileMemo}</span>
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
                        btnText={t('txt-selectFile')}
                        value={attach}
                        onChange={this.handleAttachChange.bind(this)} />
                </div>
            }
            {
                activeContent === 'addIncident' &&
                <div className='group'>
                    <label htmlFor='fileMemo'>{it('txt-fileMemo')}</label>
                    <TextareaAutosize
                        id='fileMemo'
                        name='fileMemo'
                        onChange={this.handleDataChangeMui}
                        value={incident.info.fileMemo}
                        rows={2} />
                </div>
            }
            {
                activeContent !== 'addIncident' &&
                <div className='group'>
                    <button onClick={this.uploadAttachmentModal.bind(this)}>{t('txt-upload')}</button>
                </div>
            }
            {
                _.size(incident.info.fileList) > 0 &&
                <div className='group full'>
                    <DataTable
                        style={{width: '100%'}}
                        className='main-table full '
                        fields={incident.fileFields}
                        data={incident.info.fileList}
                    />
                </div>
            }
        </div>
    }

    displayFlow = () => {
        const {activeContent, incidentType, incident, relatedListOptions} = this.state;

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
                    }
                    else {
                        return <span>{value}</span>
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
        const {activeContent, INCIDENT_ACCIDENT_LIST, INCIDENT_ACCIDENT_SUB_LIST,incidentType, incident, relatedListOptions} = this.state;

        return <div className='form-group normal'>
            <header>
                <div className='text'>{it('txt-accidentTitle')}</div>
            </header>

            {/*<Button className={incidentType === 'events' ? 'last' : 'last-left'}  style={{backgroundColor:'#001b34',color:'#FFFFFF'}}*/}
            {/*        onClick={this.handleIncidentPageChange.bind(this, 'events')}>{it('txt-prev-page')}</Button>*/}
            <Button className='last-left' style={{backgroundColor:'#001b34',color:'#FFFFFF'}}
                    onClick={this.handleIncidentPageChange.bind(this, 'events')}>{it('txt-prev-page')}</Button>

            <Button className='last' disabled={incidentType !== 'ttps'}  style={{backgroundColor:'#001b34',color:'#FFFFFF'}}
                    onClick={this.handleIncidentPageChange.bind(this, 'ttps')}>{it('txt-next-page')}</Button>

            {/*{*/}
            {/*    incidentType === 'ttps' &&*/}

            {/*}*/}

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
                    onChange={this.handleDataChangeMui}
                    value={incident.info.accidentInvestigation}
                    rows={3}
                    disabled={activeContent === 'viewIncident'}/>
            </div>
        </div>
    }

    handleEventsChange = (val) => {
        let temp = {...this.state.incident};
        temp.info.eventList = val;
        this.setState({incident: temp})
    };

    displayEventsPage = () => {
        const {incidentType, activeContent, incident, deviceListOptions} = this.state;
        const {locale} = this.context;

        const now = new Date();
        const nowTime = Moment(now).local().format('YYYY-MM-DD HH:mm:ss');

        return <div className='form-group normal'>
            <header>
                <div className='text'>{it('txt-incident-events')}</div>
            </header>

            <Button className='last-left '  style={{backgroundColor:'#001b34',color:'#FFFFFF'}}
                    onClick={this.handleIncidentPageChange.bind(this, 'main')}>{it('txt-prev-page')}</Button>

            <Button className='last'  style={{backgroundColor:'#001b34',color:'#FFFFFF'}}
                    onClick={this.handleIncidentPageChange.bind(this, 'notice')}>{it('txt-next-page')}</Button>


            <div className='group full multi'>
                <MultiInput
                    id='incidentEvent'
                    className='incident-group'
                    base={Events}
                    defaultItemValue={{description: '', deviceId: '', time: {from: nowTime, to: nowTime}, frequency: 1}}
                    value={incident.info.eventList}
                    props={{activeContent: activeContent, locale: locale, deviceListOptions: deviceListOptions}}
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
                    onClick={this.handleIncidentPageChange.bind(this, 'notice')}>{it('txt-prev-page')}</Button>

            <Button className='last' disabled={true} style={{backgroundColor:'#001b34',color:'#FFFFFF'}}
                    onClick={this.handleIncidentPageChange.bind(this, 'events')}>{it('txt-next-page')}</Button>

            <div className='group full multi'>
                <MultiInput
                    id='incidentTtp'
                    className='incident-group'
                    base={Ttps}
                    value={incident.info.ttpList}
                    props={{activeContent: activeContent}}
                    onChange={this.handleTtpsChange}/>
            </div>
        </div>
    };

    handleSubmit = () => {
        const {baseUrl, contextRoot, session} = this.context;
        const {activeContent, incidentType} = this.state;
        let incident = {...this.state.incident};

        if (!this.checkRequired(incident.info)) {

            PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-required'),
                confirmText: t('txt-close')
            });

            return
        }

        if (incident.info.relatedList) {
            incident.info.relatedList = _.map(incident.info.relatedList, el => {
                return {incidentRelatedId: el}
            })
        }

        if (incident.info.eventList) {
            incident.info.eventList = _.map(incident.info.eventList, el => {
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

        // add by soc executer
        if (activeContent === 'addIncident') {
            incident.info.status = _.includes(session.roles, 'SOC Executor') ? 6 : 1
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

            if (incident.info.relatedList) {
                incident.info.relatedList = _.map(incident.info.relatedList, el => {
                    return el.incidentRelatedId
                })
            }

            this.setState({
                originalIncident: _.cloneDeep(incident)
            }, () => {
                this.uploadAttachment()

                // this.loadData();
                // this.getIncident(incident.info.id);
                this.toggleContent('cancel');
                //
            });

            return null;
        })
        .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        });
    };

    checkRequired(incident) {
        const {incidentType} = this.state;

        if (!incident.title || !incident.category || !incident.reporter || !incident.impactAssessment || !incident.socType) {
            return false
        }

        // always check event list
        if (!incident.eventList) {
            return false
        }
        else {
            let empty = _.filter(incident.eventList, function (o) {
                return !o.description || !o.deviceId
            });

            if (_.size(empty) > 0) {
                return false
            }
        }

        // check ttp list
        if (incidentType === 'ttps') {

            if (!incident.description) {
                return false
            }


            if (!incident.ttpList) {
                return false
            } else {
                let sizeCheck = false
                _.forEach(incident.ttpList, ttp => {

                    if (_.size(ttp.obsFileList) > 0) {
                        _.forEach(ttp.obsFileList, file => {
                            if (file.fileName && file.fileExtension) {
                                if (file.md5 || file.sha1 || file.sha256) {
                                    sizeCheck = true
                                }
                            }
                        })
                    }

                    if (_.size(ttp.obsUriList) > 0) {
                        _.forEach(ttp.obsUriList, uri => {
                            if (uri.uriType && uri.uriValue) {
                                sizeCheck = true
                            }
                        })
                    }

                    if (_.size(ttp.obsSocketList) > 0) {
                        _.forEach(ttp.obsSocketList, socket => {
                            if (socket.ip && socket.port) {
                                sizeCheck = true
                            }
                        })
                    }
                })

                let empty = _.filter(incident.ttpList, function (o) {
                    return !o.title || !o.infrastructureType
                });

                if (_.size(empty) > 0) {
                    sizeCheck = false
                }

                return sizeCheck
            }
        }

        return true
    }

    getIncident = (id, type) => {
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
                    return el.incidentRelatedId
                })
            }

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

    /**
     * Display filter content
     * @method
     * @returns HTML DOM
     */
    renderFilter = () => {
        const {showFilter, search} = this.state;
        const {locale} = this.context;

        let dateLocale = locale;

        if (locale === 'zh') {
            dateLocale += '-tw';
        }

        moment.locale(dateLocale);

        return (
            <div className={cx('main-filter', {'active': showFilter})}>
                <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}/>
                <div className='header-text'>{t('txt-filter')}</div>
                <div className='filter-section config'>
                    <div className='group'>
                        <label htmlFor='keyword'>{f('edgeFields.keywords')}</label>
                        <TextField
                            id='keyword'
                            name='keyword'
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            value={search.keyword}
                            onChange={this.handleSearchMui}/>
                    </div>
                    <div className='group'>
                        <label htmlFor='searchCategory'>{f('incidentFields.category')}</label>
                        <TextField
                            id='searchCategory'
                            name='category'
                            select
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
                    <div className='group'>
                        <label htmlFor='searchStatus'>{f('incidentFields.status')}</label>
                        <TextField
                            id='searchStatus'
                            name='status'
                            required={true}
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            select
                            value={search.status}
                            onChange={this.handleSearchMui}>
                            {
                                _.map(_.range(0, 9), el => {
                                    return  <MenuItem value={el}>{it(`status.${el}`)}</MenuItem>
                                })}
                            }
                        </TextField>
                    </div>
                    <div className='group'>
                        <label htmlFor='isExpired'>{it('txt-expired')}</label>
                        <TextField
                            id='isExpired'
                            name='isExpired'
                            required={true}
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            select
                            value={search.isExpired}
                            onChange={this.handleSearchMui}>
                            {
                                _.map([
                                    {
                                        value: 2,
                                        text: it('txt-allSearch')
                                    },
                                    {
                                        value: 1,
                                        text: it('unit.txt-isDefault')
                                    },
                                    {
                                        value: 0,
                                        text: it('unit.txt-isNotDefault')
                                    }
                                ], el => {
                                    return <MenuItem value={el.value}>{el.text}</MenuItem>
                                })}
                            }
                        </TextField>
                    </div>
                    <div className='group' style={{width: '500px'}}>
                        <label htmlFor='searchDttm'>{f('incidentFields.createDttm')}</label>
                        <MuiPickersUtilsProvider utils={MomentUtils} locale={dateLocale}>
                            <KeyboardDateTimePicker
                                className='date-time-picker'
                                inputVariant='outlined'
                                variant='inline'
                                format='YYYY-MM-DD HH:mm'
                                ampm={false}
                                value={search.datetime.from}
                                onChange={this.handleSearchTime.bind(this, 'from')} />
                            <div className='between'>~</div>
                            <KeyboardDateTimePicker
                                className='date-time-picker'
                                inputVariant='outlined'
                                variant='inline'
                                format='YYYY-MM-DD HH:mm'
                                ampm={false}
                                value={search.datetime.to}
                                onChange={this.handleSearchTime.bind(this, 'to')} />
                        </MuiPickersUtilsProvider>
                    </div>
                </div>
                <div className='button-group'>
                    <button className='filter'
                            onClick={this.loadData.bind(this, 'search')}>{t('txt-filter')}</button>
                    <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
                </div>
            </div>
        )
    };

    renderStatistics = () => {
        const {showChart, dashboard} = this.state

        return <div className={cx('main-filter', {'active': showChart})}>
            <i className='fg fg-close' onClick={this.toggleChart} title={t('txt-close')}/>
            <div className='incident-statistics'>
                <div className='item c-link' onClick={this.loadCondition.bind(this,'expired')}>
                    <i className='fg fg-checkbox-fill' style={{color: '#ec8f8f'}}/>
                    <div className='threats'>{it('txt-incident-expired')}<span>{dashboard.expired}</span></div>
                </div>

                <div className='item c-link' onClick={this.loadCondition.bind(this,'unhandled')}>
                    <i className='fg fg-checkbox-fill' style={{color: '#f5f77a'}}/>
                    <div className='threats'>{it('txt-incident-unhandled')}<span>{dashboard.unhandled}</span></div>
                </div>

                <div className='item c-link' onClick={this.loadCondition.bind(this,'mine')}>
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
                        this.loadCondition('expired')
                    }else if (this.state.loadListType === 1){
                        this.loadCondition('unhandled')
                    }else if (this.state.loadListType === 2){
                        this.loadCondition('mine')
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

        if (type === 'pageSize') {
            temp.currentPage = 1
        }

        this.setState({incident: temp}, () => {
            // this.loadData()
            if (this.state.loadListType === 0){
                this.loadCondition('expired')
            }else if (this.state.loadListType === 1){
                this.loadCondition('unhandled')
            }else if (this.state.loadListType === 2){
                this.loadCondition('mine')
            }else if (this.state.loadListType === 3){
                this.loadData()
            }
        })
    };

    toggleContent = (type, allValue) => {
        const {baseUrl, contextRoot} = this.context;
        const {originalIncident, incident} = this.state;
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
                ttpList: allValue.ttpList,
                eventList: allValue.eventList,
                status: allValue.status,
                fileList: allValue.fileList,
                fileMemo: allValue.fileMemo,
                tagList: allValue.tagList,
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
                accidentAbnormalOther: allValue.accidentAbnormalOther
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
                impactAssessment: null,
                socType: null,
                createDttm: null,
                relatedList: null,
                ttpList: null,
                eventList: null,
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
                accidentAbnormalOther: null
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
                rawData:alertData
            };

            if (!tempIncident.info.socType) {
                tempIncident.info.socType = 1
            }

            // make incident.info
            let eventNetworkList = [];
            let eventNetworkItem = {
                srcIp: alertData.ipSrc || alertData.srcIp,
                srcPort: parseInt(alertData.portSrc),
                dstIp: alertData.ipDst || alertData.dstIp,
                dstPort: parseInt(alertData.destPort),
                srcHostname: '',
                dstHostname: ''
            };
            eventNetworkList.push(eventNetworkItem);

            let eventList = [];
            let eventListItem = {
                description: alertData.trailName || alertData.__index_name,
                deviceId: '',
                frequency: 1,
                time: {
                    from: helper.getFormattedDate(alertData._eventDttm_, 'local'),
                    to: helper.getFormattedDate(alertData._eventDttm_, 'local')
                },
                eventConnectionList: eventNetworkList
            };
            if (alertData._edgeInfo) {
                let searchRequestData = {
                    deviceId: alertData._edgeInfo.agentId
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
        }

        this.setState({
            displayPage: 'main',
            activeContent: showPage,
            incident: tempIncident
        }, () => {
            if (showPage === 'tableList' || showPage === 'cancel-add') {
                if (this.state.loadListType === 0){
                    this.loadCondition('expired')
                }else if (this.state.loadListType === 1){
                    this.loadCondition('unhandled')
                }else if (this.state.loadListType === 2){
                    this.loadCondition('mine')
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
                    this.loadCondition('expired')
                }else if (this.state.loadListType === 1){
                    this.loadCondition('unhandled')
                }else if (this.state.loadListType === 2){
                    this.loadCondition('mine')
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
            }
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

        let temp = {...this.state.incident};
        temp.info[event.target.name] = event.target.value;
        if (event.target.name === 'impactAssessment') {
            temp.info.expireDttm = helper.getAdditionDate(24 * (9 - 2 * event.target.value), 'hours')
        }
        this.setState({
            incident: temp
        })
    }

    getOptions = () => {
        const {baseUrl, contextRoot} = this.context;

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
            data: JSON.stringify({}),
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
    handleTableSort = (sort) => {
        let tmpIncident = {...this.state.incident};
        tmpIncident.sort.field = sort.field;
        tmpIncident.sort.desc = sort.desc;

        this.setState({
            incident: tmpIncident
        }, () => {
            if (this.state.loadListType === 0){
                this.loadCondition('expired')
            }else if (this.state.loadListType === 1){
                this.loadCondition('unhandled')
            }else if (this.state.loadListType === 2){
                this.loadCondition('mine')
            }else if (this.state.loadListType === 3){
                this.loadData()
            }
        });
    };

    openIncidentComment() {
        this.incidentComment.open()
    }

    openIncidentTag(id) {
        this.incidentTag.open(id)
    }

    openIncidentReview(incidentId, reviewType) {
        this.incidentReview.open(incidentId, reviewType)
    }

    uploadAttachment() {
        const {baseUrl} = this.context
        let {incident, attach} = this.state

        if (attach) {
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
                this.getIncident(incident.info.id, 'view')
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })
        }
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
                this.getIncident(incident.info.id, 'view')
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
                        url: `${baseUrl}/api//soc/attachment/_delete?id=${incident.info.id}&fileName=${allValue.fileName}`,
                        type: 'DELETE'
                    })
                    .then(data => {
                        if (data.ret === 0) {
                            this.getIncident(incident.info.id, 'view')
                        }
                    })
                    .catch(err => {
                        helper.showPopupMsg('', t('txt-error'), err.message)
                    })
                }
            }
        })
    }
}

Incident.contextType = BaseDataContext;
Incident.propTypes = {
    // nodeBaseUrl: PropTypes.string.isRequired
};

export default Incident
