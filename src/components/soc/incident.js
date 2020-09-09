import React, {Component} from "react"
import {default as ah, getInstance} from "react-ui/build/src/utils/ajax-helper"
import cx from "classnames"
import Moment from 'moment'

import ComboBox from 'react-ui/build/src/components/combobox'
import ContextMenu from 'react-ui/build/src/components/contextmenu'
import DropDownList from 'react-ui/build/src/components/dropdown'
import Input from 'react-ui/build/src/components/input'
import MultiInput from 'react-ui/build/src/components/multi-input'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'
import TableContent from '../common/table-content'
import Textarea from 'react-ui/build/src/components/textarea'

import {BaseDataContext} from "../common/context"
import SocConfig from "../common/soc-configuration"
import helper from "../common/helper"

import Events from './common/events'
import Ttps from './common/ttps'
import {downloadWithForm} from "react-ui/build/src/utils/download";
import ModalDialog from "react-ui/build/src/components/modal-dialog";
import FileUpload from "../common/file-upload";
import DataTable from "react-ui/build/src/components/table";
import _ from "lodash";
import DateRange from "react-ui/build/src/components/date-range";
import DatePicker from "react-ui/build/src/components/date-picker";


let t = null;
let f = null;
let et = null;
let it = null;

const INCIDENT_STATUS_ALL = 0
const INCIDENT_STATUS_SIGNING_OFF = 1
const INCIDENT_STATUS_SIGNED_OFF = 2
const INCIDENT_STATUS_CLOSE_PUBLISHED = 3
const INCIDENT_STATUS_DELETE = 4
const INCIDENT_STATUS_EDITING = 5
const INCIDENT_STATUS_CLOSE_UNPUBLISHED = 6

class Incident extends Component {
    constructor(props) {
        super(props);

        t = global.chewbaccaI18n.getFixedT(null, "connections");
        f = chewbaccaI18n.getFixedT(null, "tableFields");
        et = global.chewbaccaI18n.getFixedT(null, "errors");
        it = global.chewbaccaI18n.getFixedT(null, "incident");

        this.state = {
            incident_accident_list : [
                {
                    text:it('accident.txt-webAttack'),
                    value:'1'
                },
                {
                    text:it('accident.txt-illegalInvasion'),
                    value:'2'
                },
                {
                    text:it('accident.txt-dos'),
                    value:'3'
                },
                {
                    text:it('accident.txt-deviceProblem'),
                    value:'4'
                },
                {
                    text:it('accident.txt-other'),
                    value:'5'
                }
            ],
            INCIDENT_SUB_ACCIDENT_WEB_LIST : [
                {
                    text:it('accident.web.txt-webDefacement'),
                    value:'1'
                },
                {
                    text:it('accident.web.txt-maliciousMessage'),
                    value:'2'
                },
                {
                    text:it('accident.web.txt-maliciousPage'),
                    value:'3'
                },
                {
                    text:it('accident.web.txt-aptPage'),
                    value:'4'
                },
                {
                    text:it('accident.web.txt-trojan'),
                    value:'5'
                },
                {
                    text:it('accident.web.txt-leak'),
                    value:'6'
                }
            ],
            INCIDENT_SUB_ACCIDENT_INVASION_LIST : [
                {
                    text:it('accident.invasion.txt-systemInvasion'),
                    value:'7'
                },
                {
                    text:it('accident.invasion.txt-implantMalware'),
                    value:'8'
                },
                {
                    text:it('accident.invasion.txt-abnormalConnection'),
                    value:'9'
                },
                {
                    text:it('accident.invasion.txt-aptMail'),
                    value:'10'
                },
                {
                    text:it('accident.invasion.txt-leak'),
                    value:'11'
                }
            ],
            INCIDENT_SUB_ACCIDENT_DOS_LIST : [
                {
                    text:it('accident.dos.txt-serviceInterruption'),
                    value:'12'
                },
                {
                    text:it('accident.dos.txt-lowPerformance'),
                    value:'13'
                }
            ],
            INCIDENT_SUB_ACCIDENT_DEVICE_LIST : [
                {
                    text:it('accident.device.txt-damage'),
                    value:'14'
                },
                {
                    text:it('accident.device.txt-abnormalPower'),
                    value:'15'
                },
                {
                    text:it('accident.device.txt-internetInterruption'),
                    value:'16'
                },
                {
                    text:it('accident.device.txt-miss'),
                    value:'17'
                }
            ],
            activeContent: 'tableList', //tableList, viewIncident, editIncident, addIncident
            displayPage: 'main', /* main, events, ttps */
            incidentType: '',
            toggleType:'',
            showFilter: false,
            currentIncident: {},
            originalIncident: {},
            search: {
                keyword: '',
                category: 0,
                status: 0
            },
            relatedListOptions: [],
            deviceListOptions: [],
            accountData:{},
            incident: {
                dataFieldsArr: ['_menu', 'id', 'status', 'type', 'createDttm', 'title', 'category', 'reporter'],
                fileFieldsArr: ['fileName', 'fileExtension', 'fileSize','fileMemo'],
                flowFieldsArr: ['id', 'status', 'createDttm', 'suggestion'],
                dataFields: {},
                dataContent: [],
                sort: {
                    field: 'id',
                    desc: false
                },
                totalCount: 0,
                currentPage: 1,
                pageSize: 20,
                info: {
                    status: 1,
                    socType: 1,
                    flowList:[]
                }
            }
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
            this.loadData()
        }
        this.getOptions()
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
        const {baseUrl, contextRoot} = this.context;
        const {search, incident} = this.state;
        let data = {};

        if (search.keyword) {
            data.keyword = search.keyword
        }

        ah.one({
            url: `${baseUrl}/api/soc/_search?page=${incident.currentPage}&pageSize=${incident.pageSize}`,
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
                            } else {
                                return <span>{value}</span>
                            }
                        }
                    }
                });

                tempEdge.dataFields = dataFields;
                this.setState({incident: tempEdge, activeContent: 'tableList'})
            }
            return null
        })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })
    };

    handleRowContextMenu = (allValue, evt) => {
        let menuItems = [];

        menuItems = this.generateClickMenu(allValue)

        ContextMenu.open(evt, menuItems, 'incidentMenu');
        evt.stopPropagation();
    };

    /**
     * Construct and display Add Threats context menu
     * @method
     * @param {object} evt - mouseClick events
     */
    handleRowContextMenuByView = (evt) => {
        const menuItems = [];
        const {accountData,incident} = this.state;
        // in View Interface(page)

        let itemEdit =  {
            id: 'edit',
            text: t('txt-edit'),
            action: () => this.toggleContent('editIncident')
        }
        let itemDownload =  {
            id: 'download',
            text: it('txt-download'),
            action: () => this.getIncidentSTIXFile(incident.info.id)
        }
        let itemWithdraw = {
            id: 'withdraw',
            text: it('txt-withdraw'),
            action: () => this.openWithdrawMenu(incident.info)
        };
        let itemDelete = {
            id: 'delete',
            text: t('txt-delete'),
            action: () => this.openDeleteMenu(incident.info)
        };
        let viewItem = {
            id: 'view',
            text: t('txt-view'),
            action: () => this.getIncident(incident.info.id,'view')
        }
        let itemAudit = {
            id: 'audit',
            text: it('txt-audit'),
            action: () => this.getIncident(incident.info.id,'audit')
        };
        let itemSubmit = {
            id: 'submit',
            text: it('txt-submit'),
            action: () => this.getIncident(incident.info.id,'submit')
        };
        let itemClose =  {
            id: 'close',
            text: t('txt-close'),
            action: () => this.getIncident(incident.info.id,'close')
        }
        let itemPublish = {
            id: 'send',
            text: it('txt-send'),
            action: () => this.openSendMenu(incident.info.id)
        };
        let itemReturn = {
            id: 'return',
            text: it('txt-return'),
            action: () => this.getIncident(incident.info.id,'return')
        };

        if (incident.info.status === INCIDENT_STATUS_EDITING) {
            if (accountData.privilegeid === 'user'){
                menuItems.push(itemEdit)
                menuItems.push(itemSubmit)
            }else if(accountData.privilegeid.includes('DPIR')){
                menuItems.push(itemEdit)
                menuItems.push(itemSubmit)
                menuItems.push(itemClose)
            }
        } else if (incident.info.status === INCIDENT_STATUS_SIGNING_OFF) {
            if (accountData === incident.info.creater_id){
                menuItems.push(itemWithdraw)
            }else{
                if (accountData.privilegeid === 'user'){

                }else if(accountData.privilegeid.includes('DPIR')){
                    // edit (type -> INCIDENT_STATUS_EDITING)
                    menuItems.push(itemEdit)
                    // return
                    menuItems.push(itemReturn)
                    // close
                    menuItems.push(itemClose)
                    // audit
                    menuItems.push(itemAudit)
                }
            }

        } else if (incident.info.status === INCIDENT_STATUS_SIGNED_OFF) {

            if (accountData === incident.info.creater_id){
                // withdraw
                menuItems.push(itemWithdraw)
            }else{
                if (accountData.privilegeid === 'user'){

                }else if(accountData.privilegeid.includes('DPIR')){
                    // edit (type -> INCIDENT_STATUS_EDITING)
                    menuItems.push(itemEdit)
                    // return
                    menuItems.push(itemReturn)
                    // close
                    menuItems.push(itemClose)
                    // publish
                    menuItems.push(itemPublish)
                }
            }

        } else if (incident.info.status === INCIDENT_STATUS_CLOSE_PUBLISHED){

        } else if (incident.info.status === INCIDENT_STATUS_CLOSE_UNPUBLISHED){
            if (accountData.privilegeid === 'user'){

            }else if(accountData.privilegeid.includes('DPIR')){
                // edit (type -> INCIDENT_STATUS_EDITING)
                menuItems.push(itemEdit)
            }
        }


        ContextMenu.open(evt, menuItems, 'modifyEvent');
        evt.stopPropagation();
    }

    generateClickMenu = (allValue)=>{
        const {accountData} = this.state;
        let menuItems = [];

        let itemDownload =  {
            id: 'download',
            text: it('txt-download'),
            action: () => this.getIncidentSTIXFile(allValue.id)
        }
        let itemWithdraw = {
            id: 'withdraw',
            text: it('txt-withdraw'),
            action: () => this.openWithdrawMenu(allValue)
        };
        let itemDelete = {
            id: 'delete',
            text: t('txt-delete'),
            action: () => this.openDeleteMenu(allValue)
        };
        let viewItem = {
            id: 'view',
            text: t('txt-view'),
            action: () => this.getIncident(allValue.id,'view')
        }
        let itemAudit = {
            id: 'audit',
            text: it('txt-audit'),
            action: () => this.getIncident(allValue.id,'audit')
        };
        let itemSubmit = {
            id: 'submit',
            text: it('txt-submit'),
            action: () => this.getIncident(allValue.id,'submit')
        };
        let itemClose =  {
            id: 'close',
            text: it('txt-close'),
            action: () => this.getIncident(allValue.id,'close')
        }
        let itemPublish = {
            id: 'send',
            text: it('txt-send'),
            action: () => this.openSendMenu(allValue.id)
        };
        let itemReturn = {
            id: 'return',
            text: it('txt-return'),
            action: () => this.getIncident(allValue.id,'return')
        };

        if (allValue.status === INCIDENT_STATUS_EDITING) {
            menuItems.push(viewItem)

            if (accountData.privilegeid === 'user'){
                menuItems.push(itemSubmit)
            }else if(accountData.privilegeid.includes('DPIR')){
                menuItems.push(itemClose)
            }

        } else if (allValue.status === INCIDENT_STATUS_SIGNING_OFF) {
            menuItems.push(viewItem)
            if (accountData === allValue.creater_id){

                menuItems.push(itemWithdraw)
            }else{
                if (accountData.privilegeid === 'user'){
                }else if(accountData.privilegeid.includes('DPIR')){
                    menuItems.push(itemClose)
                    menuItems.push(itemAudit)
                    menuItems.push(itemReturn)
                }
            }

        } else if (allValue.status === INCIDENT_STATUS_SIGNED_OFF) {
            menuItems.push(viewItem)

            if (accountData === allValue.creater_id){
                menuItems.push(itemWithdraw)
            }else{
                if (accountData.privilegeid === 'user'){

                }else if(accountData.privilegeid.includes('DPIR')){
                    menuItems.push(itemClose)
                    menuItems.push(itemPublish)
                }
            }

        } else if (allValue.status === INCIDENT_STATUS_CLOSE_PUBLISHED){
            menuItems.push(viewItem)
            menuItems.push(itemDownload)
        }else if (allValue.status === INCIDENT_STATUS_CLOSE_UNPUBLISHED){
            menuItems.push(viewItem)
            if (accountData.privilegeid === 'user'){
            }else if(accountData.privilegeid.includes('DPIR')){
                menuItems.push(itemReturn)
            }
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
        const {activeContent, incidentType, baseUrl, contextRoot, showFilter, incident} = this.state

        return <div>
            <div className="sub-header">
                <div className='secondary-btn-group right'>
                    <button className={cx('', {'active': showFilter})} onClick={this.toggleFilter}
                            title={t('txt-filter')}><i className='fg fg-filter'/></button>
                    <button className='' onClick={this.getIncidentSTIXFileExample.bind(this, 'event')}
                            title={it('txt-downloadEvent')}><i className='fg fg-data-download'/></button>
                    <button className='' onClick={this.getIncidentSTIXFileExample.bind(this, 'related')}
                            title={it('txt-downloadRelated')}><i className='fg fg-data-download'/></button>
                </div>
            </div>

            <div className='data-content'>
                <SocConfig baseUrl={baseUrl} contextRoot={contextRoot} />

                <div className='parent-content'>
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
        const {activeContent, incidentType, incident, toggleType, accountData, displayPage} = this.state;

        let tempFile ={
            fileName:incident.info.fileName,
            fileExtension:incident.info.fileExtension,
            fileSize:incident.info.fileSize,
            fileMemo:incident.info.fileMemo
        }
        incident.fileList = []

        if (tempFile.fileName !== ''){
            incident.fileList.push(tempFile)
        }

        let editCheck = false
        let withdrawCheck = false
        let submitCheck = false
        let auditCheck = false
        let returnCheck = false
        let closeCheck = false
        let publishCheck = false


        if (incident.info.status === INCIDENT_STATUS_EDITING) {
            if (accountData.privilegeid === 'user'){
                editCheck = true
                submitCheck = true
            }else if(accountData.privilegeid.includes('DPIR')){
                editCheck = true
                submitCheck = true
                closeCheck = true
            }
        } else if (incident.info.status === INCIDENT_STATUS_SIGNING_OFF) {
            if (accountData === incident.info.creater_id){
                withdrawCheck = true
            }else{
                if (accountData.privilegeid === 'user'){

                }else if(accountData.privilegeid.includes('DPIR')){
                    // edit (type -> INCIDENT_STATUS_EDITING)
                    editCheck = true
                    // return
                    returnCheck = true
                    // close
                    closeCheck = true
                    // audit
                    auditCheck = true
                }
            }

        } else if (incident.info.status === INCIDENT_STATUS_SIGNED_OFF) {

            if (accountData === incident.info.creater_id){
                // withdraw
                withdrawCheck = true
            }else{
                if (accountData.privilegeid === 'user'){

                }else if(accountData.privilegeid.includes('DPIR')){
                    // edit (type -> INCIDENT_STATUS_EDITING)
                    editCheck = true
                    // return
                    returnCheck = true
                    // close
                    closeCheck = true
                    // publish
                    publishCheck = true
                }
            }

        } else if (incident.info.status === INCIDENT_STATUS_CLOSE_PUBLISHED){

        } else if (incident.info.status === INCIDENT_STATUS_CLOSE_UNPUBLISHED){
            if (accountData.privilegeid === 'user'){

            }else if(accountData.privilegeid.includes('DPIR')){
                // edit (type -> INCIDENT_STATUS_EDITING)
                editCheck = true
            }
        }



        return <div className='main-content basic-form'>
            <header className='main-header'>
                {it(`txt-${activeContent}-${incidentType}`)}
                {activeContent !== 'addIncident' &&
                <span
                    className='msg'>{it('txt-id')}{incident.info.id}</span>
                }
            </header>


            <div className='auto-settings' style={{height: '70vh'}}>
            {
                displayPage === 'main' && this.displayMainPage()
            }
                {
                    activeContent === 'addIncident' && displayPage === 'main' && this.displayAttached()
                }
                {
                    activeContent === 'editIncident' && displayPage === 'main' &&  incident.fileList.length > 0 && this.displayAttached()
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
                <footer style={{'text-align':'center'}}>
                    <button className='standard btn list'
                            onClick={this.toggleContent.bind(this, 'tableList')}>{t('network-inventory.txt-backToList')}</button>
                    {editCheck &&
                        <button className='standard btn list'
                                onClick={this.toggleContent.bind(this, 'editIncident')}>{t('txt-edit')}</button>
                    }
                    {withdrawCheck &&
                        <button className='standard btn list'
                                onClick={this.openWithdrawMenu.bind(this, incident.info)}>{it('txt-withdraw')}</button>
                    }
                    {submitCheck &&
                        <button className='standard btn list'
                                onClick={this.openSubmitMenu.bind(this, incident.info)}>{it('txt-submit')}</button>
                    }
                    {returnCheck &&
                       <button className='standard btn list'
                                onClick={this.openReturnMenu.bind(this, incident.info)}>{it('txt-return')}</button>
                    }
                    {closeCheck &&
                        <button className='standard btn list'
                                onClick={this.openCloseMenu.bind(this, incident.info)}>{it('txt-close')}</button>
                    }
                    {auditCheck &&
                        <button className='standard btn list'
                                onClick={this.openAuditMenu.bind(this, incident.info)}>{it('txt-audit')}</button>
                    }
                    {publishCheck &&
                        <button className='standard btn list'
                                onClick={this.openSendMenu.bind(this, incident.info.id)}>{it('txt-send')}</button>
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

        return <div className='form-group normal'>
            <header>
                <div className='text'>{t('edge-management.txt-basicInfo')}</div>
                {activeContent !== 'addIncident' &&
                <span
                    className='msg'>{f('incidentFields.updateDttm')} {helper.getFormattedDate(incident.info.updateDttm, 'local')}</span>
                }
            </header>

            <button className='last'
                    onClick={this.handleIncidentPageChange.bind(this, 'events')}>{it('txt-next-page')}</button>

            <div className='group'>
                <label htmlFor='title'>{f('incidentFields.title')}</label>
                <Input
                    id='title'
                    onChange={this.handleDataChange.bind(this, 'title')}
                    value={incident.info.title}
                    required={true}
                    validate={{t: et}}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
            <div className='group'>
                <label htmlFor='category'>{f('incidentFields.category')}</label>
                <DropDownList
                    id='category'
                    onChange={this.handleDataChange.bind(this, 'category')}
                    required={true}
                    validate={{t: et}}
                    list={
                        _.map(_.range(1, 9), el => {
                            return {text: it(`category.${el}`), value: el}
                        })
                    }
                    value={incident.info.category}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
            <div className='group'>
                <label htmlFor='reporter'>{f('incidentFields.reporter')}</label>
                <Input
                    id='reporter'
                    onChange={this.handleDataChange.bind(this, 'reporter')}
                    required={true}
                    validate={{t: et}}
                    value={incident.info.reporter}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
            <div className='group' style={{width: '25vh'}}>
                <label htmlFor='impactAssessment'>{f('incidentFields.impactAssessment')}</label>
                <DropDownList
                    id='impactAssessment'
                    onChange={this.handleDataChange.bind(this, 'impactAssessment')}
                    required={true}
                    validate={{t: et}}
                    list={
                        _.map(_.range(1, 5), el => {
                            return {text: el, value: el}
                        })
                    }
                    value={incident.info.impactAssessment}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>

            <div className='group' style={{width: '25vh'}}>
                <label htmlFor='finalDate'>{f('incidentFields.finalDate')}</label>
                <DatePicker
                    id='finalDate'
                    className='daterange'
                    onChange={this.handleDataChange.bind(this, 'finalDate')}
                    enableTime={true}
                    required={true}
                    validate={{t: et}}
                    value={incident.info.finalDate}
                    locale={locale}
                    readOnly={activeContent === 'viewIncident'} />
            </div>

            {incidentType === 'ttps' && <div className='group full'>
                <label htmlFor='description'>{f('incidentFields.description')}</label>
                <Textarea
                    id='description'
                    onChange={this.handleDataChange.bind(this, 'description')}
                    required={true}
                    validate={{t: et}}
                    value={incident.info.description}
                    rows={3}
                    readOnly={activeContent === 'viewIncident'}/>
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

            <div className='group full'>
                <label htmlFor='description'>{f('incidentFields.Suggestion')}</label>
                <Textarea
                    id='suggestion'
                    onChange={this.handleDataChange.bind(this, 'suggestion')}
                    required={true}
                    validate={{t: et}}
                    value={incident.info.suggestion}
                    rows={3}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
        </div>
    };

    formatBytes = (bytes, decimals = 2) => {
        // console.log("bytes == " , bytes)
        if (bytes === 0 || bytes === '0'){
            // console.log("into bytes == 0 ")
            return '0 Bytes';
        }

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    displayAttached = () => {
        const {activeContent, incidentType, incident, relatedListOptions} = this.state;
        let dataFields = {};
        incident.fileFieldsArr.forEach(tempData => {
            dataFields[tempData] = {
                label: tempData === '_menu' ? '' : f(`incidentFields.${tempData}`),
                sortable: this.checkSortable(tempData),
                formatter: (value, allValue, i) => {
                    if (tempData === 'size') {
                        return <span>{this.formatBytes(value)}</span>
                    }else {
                        return <span>{value}</span>
                    }
                }
            }
        });

        let tempFile ={
            fileName:incident.info.fileName,
            fileExtension:incident.info.fileExtension,
            fileSize:incident.info.fileSize,
            fileMemo:incident.info.fileMemo
        }
        incident.fileList = []

        if (tempFile.fileName !== ''){
            incident.fileList.push(tempFile)
        }
        incident.fileFields = dataFields;

        return <div className='form-group normal'>
            <header>
                <div className='text'>{it('txt-attachedFile')}<span style={{color:'red','font-size':'0.8em'}}>{it('txt-attachedFileHint')}</span></div>
            </header>
            {(activeContent === 'editIncident' || activeContent === 'addIncident') &&
                <div className='group'>
                    <FileUpload
                        supportText={'Attached File'}
                        id='attachedFileInput'
                        fileType='attached'
                        btnText={t('txt-upload')}
                        handleFileChange={this.handleDataChange.bind(this, 'file')}
                        readOnly={activeContent === 'viewIncident'}/>
                </div>
            }
            {(activeContent === 'editIncident' || activeContent === 'addIncident') &&
            <div className='group'>
                <label htmlFor='fileMemo'>{it('txt-fileMemo')}</label>
                <Textarea
                    id='fileMemo'
                    onChange={this.handleDataChange.bind(this, 'fileMemo')}
                    required={true}
                    validate={{t: et}}
                    value={incident.info.fileMemo}
                    rows={2}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
            }
            {incident.fileList.length > 0 &&
                <div className='group full'>
                    <DataTable
                        style={{width: '100%'}}
                        className='main-table full '
                        fields={incident.fileFields}
                        data={incident.fileList}
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
                    if (tempData === 'size') {
                        return <span>{this.formatBytes(value)}</span>
                    }else {
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
                    data={incident.flowList}
                />
            </div>

        </div>
    }

    displayNoticePage = () => {
        const {activeContent, incident_accident_list, INCIDENT_SUB_ACCIDENT_DEVICE_LIST,INCIDENT_SUB_ACCIDENT_DOS_LIST, INCIDENT_SUB_ACCIDENT_INVASION_LIST, INCIDENT_SUB_ACCIDENT_WEB_LIST,incidentType, incident, relatedListOptions} = this.state;

        return <div className='form-group normal'>
            <header>
                <div className='text'>{it('txt-accidentTitle')}</div>
            </header>

            <button className={incidentType === 'events' ? 'last' : 'last-left'}
                    onClick={this.handleIncidentPageChange.bind(this, 'events')}>{it('txt-prev-page')}</button>

            {
                incidentType === 'ttps' &&
                <button className='last'
                        onClick={this.handleIncidentPageChange.bind(this, 'ttps')}>{it('txt-next-page')}</button>
            }

            <div className='group'>
                <label htmlFor='accident'>{it('txt-accidentClassification')}</label>
                <DropDownList
                    id='accident'
                    onChange={this.handleDataChange.bind(this, 'accident')}
                    required={true}
                    validate={{t: et}}
                    list={incident_accident_list}
                    value={incident.info.accident}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
            {incident.info.accident === '5' &&
                <div className='group'>
                    <label htmlFor='subAccident'>{it('txt-reason')}</label>
                    <Input
                        id='subAccident'
                        onChange={this.handleDataChange.bind(this, 'subAccident')}
                        required={true}
                        validate={{t: et}}
                        value={incident.info.subAccident}
                        readOnly={activeContent === 'viewIncident'}/>
                </div>
            }
            {incident.info.accident === '4' &&
            <div className='group'>
                <label htmlFor='subAccident'>{it('txt-reason')}</label>
                <DropDownList
                    id='subAccident'
                    onChange={this.handleDataChange.bind(this, 'subAccident')}
                    required={true}
                    validate={{t: et}}
                    list={INCIDENT_SUB_ACCIDENT_DEVICE_LIST}
                    value={incident.info.subAccident}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
            }
            {incident.info.accident === '3' &&
            <div className='group'>
                <label htmlFor='subAccident'>{it('txt-reason')}</label>
                <DropDownList
                    id='subAccident'
                    onChange={this.handleDataChange.bind(this, 'subAccident')}
                    required={true}
                    validate={{t: et}}
                    list={INCIDENT_SUB_ACCIDENT_DOS_LIST}
                    value={incident.info.subAccident}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
            }
            {incident.info.accident === '2' &&
            <div className='group'>
                <label htmlFor='subAccident'>{it('txt-reason')}</label>
                <DropDownList
                    id='subAccident'
                    onChange={this.handleDataChange.bind(this, 'subAccident')}
                    required={true}
                    validate={{t: et}}
                    list={INCIDENT_SUB_ACCIDENT_INVASION_LIST}
                    value={incident.info.subAccident}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
            }
            {incident.info.accident === '1' &&
            <div className='group'>
                <label htmlFor='subAccident'>{it('txt-reason')}</label>
                <DropDownList
                    id='subAccident'
                    onChange={this.handleDataChange.bind(this, 'subAccident')}
                    required={true}
                    validate={{t: et}}
                    list={INCIDENT_SUB_ACCIDENT_WEB_LIST}
                    value={incident.info.subAccident}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
            }

            <div className='group full'>
                <label htmlFor='accidentDescr'>{it('txt-accidentDescr')}</label>
                <Textarea
                    id='accidentDescr'
                    onChange={this.handleDataChange.bind(this, 'accidentDescr')}
                    required={true}
                    validate={{t: et}}
                    value={incident.info.accidentDescr}
                    rows={3}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
            <div className='group full'>
                <label htmlFor='reasonDescr'>{it('txt-reasonDescr')}</label>
                <Textarea
                    id='reasonDescr'
                    onChange={this.handleDataChange.bind(this, 'reasonDescr')}
                    required={true}
                    validate={{t: et}}
                    value={incident.info.reasonDescr}
                    rows={3}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
            <div className='group full'>
                <label htmlFor='accidentInvestigation'>{it('txt-accidentInvestigation')}</label>
                <Textarea
                    id='accidentInvestigation'
                    onChange={this.handleDataChange.bind(this, 'accidentInvestigation')}
                    required={true}
                    validate={{t: et}}
                    value={incident.info.accidentInvestigation}
                    rows={3}
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
        const {incidentType, activeContent, incident, deviceListOptions} = this.state;
        const {locale} = this.context;

        const now = new Date();
        const nowTime = Moment(now).local().format('YYYY-MM-DD HH:mm:ss');

        return <div className='form-group normal'>
            <header>
                <div className='text'>{it('txt-incident-events')}</div>
            </header>

            <button className='last-left '
                    onClick={this.handleIncidentPageChange.bind(this, 'main')}>{it('txt-prev-page')}</button>

            <button className='last'
                    onClick={this.handleIncidentPageChange.bind(this, 'notice')}>{it('txt-next-page')}</button>


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
            <button className='last'
                    onClick={this.handleIncidentPageChange.bind(this, 'notice')}>{it('txt-prev-page')}</button>

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
        const {baseUrl, contextRoot} = this.context;
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

    getIncident = (id,type) => {
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
                this.setState({incident, incidentType,toggleType}, () => {
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

        return (
            <div className={cx('main-filter', {'active': showFilter})}>
                <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}/>
                <div className='header-text'>{t('txt-filter')}</div>
                <div className='filter-section config'>
                    <div className='group'>
                        <label htmlFor='searchKeyword'>{f('edgeFields.keywords')}</label>
                        <input
                            id='searchKeyword'
                            type='text'
                            className='search-textarea'
                            value={search.keyword}
                            onChange={this.handleInputSearch.bind(this, 'keyword')}/>
                    </div>
                    <div className='group'>
                        <label htmlFor='searchCategory'>{f('incidentFields.category')}</label>
                        <DropDownList
                            id='searchCategory'
                            required={true}
                            list={
                                _.map(_.range(0, 9), el => {
                                    return {text: it(`category.${el}`), value: el}
                                })
                            }
                            value={search.category}
                            onChange={this.handleSearch.bind(this, 'category')}/>
                    </div>
                    <div className='group'>
                        <label htmlFor='searchStatus'>{f('incidentFields.status')}</label>
                        <DropDownList
                            id='searchStatus'
                            required={true}
                            list={
                                _.map(_.range(0, 5), el => {
                                    return {text: it(`status.${el}`), value: el}
                                })
                            }
                            value={search.status}
                            onChange={this.handleSearch.bind(this, 'status')}/>
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

    /**
     * Show Withdraw Incident dialog
     * @method
     * @param {object} allValue - IncidentDevice data
     */
    openWithdrawMenu = (allValue) => {
        PopupDialog.prompt({
            title: it('txt-withdraw'),
            id: 'modalWindowSmall',
            confirmText: it('txt-withdraw'),
            cancelText: t('txt-cancel'),
            display: <div className='content delete'>
                <span>{it('txt-withdraw-msg')}: {allValue.id}?</span>
            </div>,
            act: (confirmed, data) => {
                if (confirmed) {
                    // this.deleteIncident(allValue.id)
                }
            }
        })
    };

    /**
     * Show Submit Incident dialog
     * @method
     * @param {object} allValue - IncidentDevice data
     */
    openSubmitMenu = (allValue) => {
        PopupDialog.prompt({
            title: it('txt-submit'),
            id: 'modalWindowSmall',
            confirmText: it('txt-submit'),
            cancelText: t('txt-cancel'),
            display: <div className='content delete'>
                <span>{it('txt-submit-msg')}: {allValue.id}?</span>
            </div>,
            act: (confirmed, data) => {
                if (confirmed) {
                    // this.deleteIncident(allValue.id)
                }
            }
        })
    };

    /**
     * Show Return Incident dialog
     * @method
     * @param {object} allValue - IncidentDevice data
     */
    openReturnMenu = (allValue) => {
        PopupDialog.prompt({
            title: it('txt-return'),
            id: 'modalWindowSmall',
            confirmText: it('txt-return'),
            cancelText: t('txt-cancel'),
            display: <div className='content delete'>
                <span>{it('txt-return-msg')}: {allValue.id}?</span>
            </div>,
            act: (confirmed, data) => {
                if (confirmed) {
                    // this.deleteIncident(allValue.id)
                }
            }
        })
    };

    /**
     * Show Return Incident dialog
     * @method
     * @param {object} allValue - IncidentDevice data
     */
    openCloseMenu = (allValue) => {
        PopupDialog.prompt({
            title: it('txt-close'),
            id: 'modalWindowSmall',
            confirmText: it('txt-close'),
            cancelText: t('txt-cancel'),
            display: <div className='content delete'>
                <span>{it('txt-close-msg')}: {allValue.id}?</span>
            </div>,
            act: (confirmed, data) => {
                if (confirmed) {
                    // this.deleteIncident(allValue.id)
                }
            }
        })
    };

    /**
     * Show Return Incident dialog
     * @method
     * @param {object} allValue - IncidentDevice data
     */
    openAuditMenu = (allValue) => {
        PopupDialog.prompt({
            title: it('txt-audit'),
            id: 'modalWindowSmall',
            confirmText: it('txt-audit'),
            cancelText: t('txt-cancel'),
            display: <div className='content delete'>
                <span>{it('txt-audit-msg')}: {allValue.id}?</span>
            </div>,
            act: (confirmed, data) => {
                if (confirmed) {
                    // this.deleteIncident(allValue.id)
                }
            }
        })
    };

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
                    this.loadData()
                }
                return null
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })
    };

    /**
     * Handle withdraw Incident confirm
     * @method
     */
    withdrawIncident = (id) => {
        const {baseUrl} = this.context;

        ah.one({
            url: `${baseUrl}/api/soc/_withdraw?id=${id}`,
            type: 'get'
        })
            .then(data => {
                if (data.ret === 0) {
                    this.loadData()
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
            this.loadData()
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
                suggestion:allValue.suggestion,
                fileName: allValue.fileName||'',
                fileType: allValue.fileType||'',
                fileSize: allValue.fileSize|| 0 ,
                fileMemo: allValue.fileMemo||''
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
                suggestion: null,
                fileName: '',
                fileType: '',
                fileSize:  0 ,
                fileMemo: ''
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
                suggestion:alertData.toString(),
                fileName: '',
                fileType: '',
                fileSize:  0 ,
                fileMemo: ''
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
            activeContent: showPage,
            incident: tempIncident
        }, () => {
            if (showPage === 'tableList' || showPage === 'cancel-add') {
                this.loadData()
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
     *
     * @param {string} id
     */
    submittedIncident = (id) => {
        const {baseUrl} = this.context;
        let tmp = {
            id: id
        }
        ah.one({
            url: `${baseUrl}/api/soc/_submit`,
            data: JSON.stringify(tmp),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
            .then(data => {
                if (data) {
                    helper.showPopupMsg(it('txt-submit-success'), it('txt-submit'));
                    this.loadData()
                }
            })
            .catch(err => {
                helper.showPopupMsg(it('txt-submit-fail'), it('txt-submit'));
            })
    };

    /**
     *
     * @param {string} id
     */
    returnIncident = (id) => {
        const {baseUrl} = this.context;
        let tmp = {
            id: id
        }
        ah.one({
            url: `${baseUrl}/api/soc/_return`,
            data: JSON.stringify(tmp),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
            .then(data => {

                if (data){
                    helper.showPopupMsg(it('txt-return-success'), it('txt-return'));
                    this.loadData()
                }
            })
            .catch(err => {
                helper.showPopupMsg(it('txt-return-fail'), it('txt-return'));
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
                this.loadData()
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
                    this.loadData()
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
     * Toggle filter content on/off
     * @method
     */
    toggleFilter = () => {
        this.setState({showFilter: !this.state.showFilter})
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
                status: 0
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

        if (type === 'impactAssessment'){
            switch (value){
                case '1':
                    temp.info.finalDate = helper.getAdditionDate(48, 'hours')
                    break;
                case '2':
                    temp.info.finalDate = helper.getAdditionDate(48, 'hours')
                    break;
                case '3':
                    temp.info.finalDate = helper.getAdditionDate(24, 'hours')
                    break;
                case '4':
                    temp.info.finalDate = helper.getAdditionDate(8, 'hours')
                    break;
            }
        }

        this.setState({
            incident: temp
        })
    };

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

        //利用 account_id 查詢 privilege_id
        const {session} = this.context;

        ah.all([
            {
                url:`${baseUrl}/api/account?accountid=${session.accountId}`,
                type:'GET'
            },
            {
                url: `${baseUrl}/api/account/privileges?accountId=${session.accountId}`,
                type:'GET'
            }
        ])
            .then(data => {
                if (data) {

                    let privilegeidList =  _.map(data[1].rt, 'privilegeid')
                    let accountData = {
                        accountid: data[0].rt.accountid,
                        privilegeid: privilegeidList[0]
                    };
                    // console.log("accountData == ",accountData)
                    this.setState({
                        accountData
                    });
                }
                return null;
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message);
                this.close();
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
        const unSortableFields = ['description', '_menu'];

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
            this.loadData();
        });
    };

}

Incident.contextType = BaseDataContext;
Incident.propTypes = {
    // nodeBaseUrl: PropTypes.string.isRequired
};

export default Incident
