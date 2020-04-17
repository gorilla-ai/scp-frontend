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


let t = null
let f = null
let et = null
let it = null

/**
 * Settings - IncidentDevice
 * @class
 * @author Kenneth Chiao <kennethchiao@telmediatech.com>
 * @summary A react component to show the Config IncidentDevice page
 */
class Incident extends Component {
    constructor(props) {
        super(props);

        t = global.chewbaccaI18n.getFixedT(null, "connections")
        f = chewbaccaI18n.getFixedT(null, "tableFields")
        et = global.chewbaccaI18n.getFixedT(null, "errors")
        it = global.chewbaccaI18n.getFixedT(null, "incident")

        this.state = {
            activeContent: 'tableList', //tableList, viewIncident, editIncident, addIncident
            displayPage: 'main', /* main, events, ttps */
            incidentType: '',
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
            // unitListOptions: [],
            incident: {
                dataFieldsArr: ['_menu', 'id', 'title', 'category', 'reporter', 'createDttm', 'status'],
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
                }
            }
        };

        this.ah = getInstance("chewbacca");
    }

    componentDidMount() {


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
        const {baseUrl, contextRoot} = this.context
        const {search, incident} = this.state
        let data = {}

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
                let tempEdge = {...incident}
                tempEdge.dataContent = data.rt.rows
                tempEdge.totalCount = data.rt.counts
                tempEdge.currentPage = fromSearch === 'search' ? 1 : incident.currentPage

                let dataFields = {}
                incident.dataFieldsArr.forEach(tempData => {
                    dataFields[tempData] = {
                        label: tempData === '_menu' ? '' : f(`incidentFields.${tempData}`),
                        // sortable: this.checkSortable(tempData),
                        formatter: (value, allValue, i) => {
                            if (tempData === '_menu') {
                                return <div className={cx('table-menu', {'active': value})}>
                                    <button onClick={this.handleRowContextMenu.bind(this, allValue)}><i className='fg fg-more'></i></button>
                                </div>
                            } 
                            else if (tempData === 'category') {
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
                })

                tempEdge.dataFields = dataFields
                this.setState({incident: tempEdge, activeContent: 'tableList'})
            }
            return null
        })
        .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        })
    }

    handleRowContextMenu = (allValue, evt) => {
        const menuItems = [
            {
                id: 'view',
                text: t('txt-view'),
                action: () => this.getIncident(allValue.id)
            },
            {
                id: 'download',
                text: it('txt-download'),
                action: () => this.getIncidentSTIXFile(allValue.id)
            },
            {
                id: 'delete',
                text: t('txt-delete'),
                action: () => this.openDeleteMenu(allValue)
            }
        ];
        let item = {};
        if (allValue.status === 1) {
            item = {
                id: 'audit',
                text: it('txt-audit'),
                action: () => this.toggleContent.bind(this, 'audit', allValue)
            };
            menuItems.push(item);
        } else if (allValue.status === 2) {
            item = {
                id: 'send',
                text: it('txt-send'),
                action: () => this.toggleContent.bind(this, 'send', allValue)
            };
            menuItems.push(item);
        }

        ContextMenu.open(evt, menuItems, 'incidentMenu');
        evt.stopPropagation();
    }

    handleRowMouseOver = (index, allValue, evt) => {
        let tempIncident = {...this.state.incident}
        tempIncident['dataContent'] = _.map(tempIncident['dataContent'], el => {
            return {...el, _menu: el.id === allValue.id ? true : false}
        })
        this.setState({incident: tempIncident})
    }


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
                            // handleTableSort={this.handleTableSort}
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


    /** TODO
     * Display edit Incident content
     * @method
     * @returns HTML DOM
     */
    displayEditContent = () => {
        const {activeContent, incidentType, incident, displayPage} = this.state

        return <div className='main-content basic-form'>
            <header className='main-header'>{it(`txt-${activeContent}-${incidentType}`)}</header>

            <div className='content-header-btns'>
                {activeContent === 'viewIncident' &&
                <button className='standard btn list'
                        onClick={this.toggleContent.bind(this, 'tableList')}>{t('network-inventory.txt-backToList')}</button>
                }


                {activeContent === 'viewIncident' && incident.info.state !== 0 &&
                <button className='standard btn list'
                        onClick={this.toggleContent.bind(this, 'audit')}>{it('txt-audit')}</button>
                }


                {activeContent !== 'addIncident' &&
                <button className='standard btn edit'
                        onClick={this.toggleContent.bind(this, 'editIncident')}>{t('txt-edit')}</button>
                }
            </div>
            
            <div className='auto-settings' style={{height: '70vh'}}>
            {
                displayPage === 'main' && this.displayMainPage()
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
    }

    handleIncidentPageChange = (val) => {
        this.setState({displayPage: val})
    }

    displayMainPage = () => {
        const {activeContent, incident, relatedListOptions} = this.state

        return <div className='form-group normal'>
            <header>
                <div className='text'>{t('edge-management.txt-basicInfo')}</div>
            </header>

            <button className='last' onClick={this.handleIncidentPageChange.bind(this, 'events')}>{it('txt-next-page')}</button>

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
            <div className='group'>
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

            {incidentType === 'ttps' && <div className='group'>
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

            <div className='group'>
                <label htmlFor='socType'>{f('incidentFields.socType')}</label>
                <DropDownList
                    id='socType'
                    onChange={this.handleDataChange.bind(this, 'socType')}
                    list={[
                        {text: 'N-SOC', value: 0}, {text: 'G-SOC', value: 1}
                    ]}
                    required={true}
                    validate={{t: et}}
                    value={incident.info.socType}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>

            {incidentType === 'ttps' &&
            <div className='group full'>
                <label htmlFor='relatedList'>{f('incidentFields.relatedList')}</label>
                <ComboBox
                    id='relatedList'
                    className='relatedList'
                    onChange={this.handleDataChange.bind(this, 'relatedList')}
                    list={relatedListOptions}
                    multiSelect={{enabled: true, toggleAll: true}}
                    value={incident.info.relatedList}
                    disabled={activeContent === 'viewIncident'}/>
            </div>
            }
        </div>
    }

    handleEventsChange = (val) => {
        let temp = {...this.state.incident}
        temp.info.eventList = val
        this.setState({incident: temp})
    }
    displayEventsPage = () => {
        const {incidentType, activeContent, incident, deviceListOptions} = this.state
        const {locale} = this.context

        const now = new Date()
        const nowTime = Moment(now).local().format('YYYY-MM-DD HH:mm:ss')

        return <div className='form-group normal'>
            <header>
                <div className='text'>{it('txt-incident-events')}</div>
            </header>

            <button className={incidentType === 'events' ? 'last' : 'last-left'} onClick={this.handleIncidentPageChange.bind(this, 'main')}>{it('txt-prev-page')}</button>
            {
                incidentType === 'ttps' &&
                <button className='last' onClick={this.handleIncidentPageChange.bind(this, 'ttps')}>{it('txt-next-page')}</button>
            }

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
    }

    handleTtpsChange = (val) => {
        let temp = {...this.state.incident}
        temp.info.ttpList = val
        this.setState({incident: temp})
    }
    displayTtpPage = () => {
        const {activeContent, incident} = this.state

        return <div className='form-group normal'>
            <header>
                <div className='text'>{it('txt-incident-ttps')}</div>
            </header>
            
            <button className='last' onClick={this.handleIncidentPageChange.bind(this, 'events')}>{it('txt-prev-page')}</button>

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
    }


    handleSubmit = () => {
        const {baseUrl, contextRoot} = this.context
        const {activeContent, incidentType} = this.state
        let incident = {...this.state.incident.info}

        if (!this.checkRequired(incident)) {
            console.log("incident == " , incident)
            PopupDialog.alert({
                title: t('txt-tips'),
                display: it('txt-required'),
                confirmText: t('txt-close')
            })

            return
        }

        if (incident.relatedList) {
            incident.relatedList = _.map(incident.relatedList, el => {
                return {incidentRelatedId: el}
            })
        }

        if (incident.eventList) {
            incident.eventList = _.map(incident.eventList, el => {
                return {
                    ...el,
                    startDttm: Moment(el.time.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
                    endDttm: Moment(el.time.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
                }
            })
        }

        ah.one({
            url: `${baseUrl}/api/soc`,
            data: JSON.stringify(incident),
            type: activeContent === 'addIncident' ? 'POST' : 'PATCH',
            contentType: 'application/json',
            dataType: 'json'
        })
            .then(data => {
                console.log(data)
                this.loadData()
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })
    }


    checkRequired(incident) {
        const {incidentType} = this.state

        if (!incident.title || !incident.category || !incident.reporter || !incident.impactAssessment || !incident.socType) {
            return false
        }

        // always check event list
        if (!incident.eventList) {
            return false
        }
        else {
            let empty = _.filter(incident.eventList, function(o){
                return !o.description || !o.deviceId
            }) 

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
                let empty = _.filter(incident.ttpList, function (o) {
                    return !o.title || !o.infrastructureType
                })

                if (_.size(empty) > 0) {
                    return false
                }
            }
        }

        return true
    }

    getIncident = (id) => {
        const {baseUrl} = this.context

        if (!id) {
            return
        }

        ah.one({
            url: `${baseUrl}/api/soc?id=${id}`,
            type: 'GET'
        })
            .then(data => {
                let {incident} = this.state
                let temp = data.rt

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

            let incidentType = _.size(temp.ttpList) > 0  ? 'ttps' : 'events'

            incident.info = temp
                this.setState({incident, incidentType}, () => {
                    this.toggleContent('viewIncident', temp)
                })
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })
    }


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
                        <label htmlFor='searchKeyword' className='first-label'>{f('edgeFields.keywords')}</label>
                        <Input
                            id='searchKeyword'
                            className='search-textarea'
                            onChange={this.handleSearch.bind(this, 'keyword')}
                            value={search.keyword}/>
                    </div>
                    <div className='group'>
                        <label htmlFor='searchCategory' className='first-label'>{f('incidentFields.category')}</label>
                        <DropDownList
                            id='searchCategory'
                            onChange={this.handleSearch.bind(this, 'category')}
                            required={true}
                            list={
                                _.map(_.range(0, 9), el => {
                                    return {text: it(`category.${el}`), value: el}
                                })
                            }
                            value={search.category}/>
                    </div>
                    <div className='group'>
                        <label htmlFor='searchStatus' className='first-label'>{f('incidentFields.status')}</label>
                        <DropDownList
                            id='searchStatus'
                            onChange={this.handleSearch.bind(this, 'status')}
                            required={true}
                            list={
                                _.map(_.range(0, 4), el => {
                                    return {text: it(`status.${el}`), value: el}
                                })
                            }
                            value={search.status}/>
                    </div>
                </div>
                <div className='button-group'>
                    <button className='filter'
                            onClick={this.loadData.bind(this, 'search')}>{t('txt-filter')}</button>
                    <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
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
            display: <div className='content delete'>
                <span>{t('txt-delete-msg')}: {allValue.id}?</span>
            </div>,
            act: (confirmed, data) => {
                if (confirmed) {
                    this.deleteIncident(allValue.id)
                }
            }
        })
    }

    /**
     * Handle delete Incident confirm
     * @method
     */
    deleteIncident = (id) => {
        const {baseUrl} = this.context

        if (!id) {
            return
        }

        ah.one({
            url: `${baseUrl}/api/soc/_delete?id=${id}`,
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
    }

    /**
     * Handle table pagination change
     * @method
     * @param {string} type - page type ('currentPage' or 'pageSize')
     * @param {string | number} value - new page number
     */
    handlePaginationChange = (type, value) => {
        let temp = {...this.state.incident}
        temp[type] = Number(value)

        if (type === 'pageSize') {
            temp.currentPage = 1
        }

        this.setState({incident: temp}, () => {
            this.loadData()
        })
    }


    toggleContent = (type, allValue) => {
        const {baseUrl, contextRoot} = this.context
        const {originalIncident, incident} = this.state
        let tempIncident = {...incident}
        let showPage = type


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
                relatedList: allValue.relatedList,
                ttpList: allValue.ttpList,
                eventList: allValue.eventList,
            }

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
                eventList: null
            }
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
            console.log("alertData = ", alertData)
            tempIncident.info = {
                /**
                 * TODO make redirect incident
                 */
                title: alertData.Info,
                reporter: alertData.Collector,

                // relatedList: allValue.relatedList,
                // ttpList: allValue.ttpList,
                // eventList: allValue.eventList
            };


            if (!tempIncident.info.socType) {
                tempIncident.info.socType = 1
            }

            // make incident.info
            let eventNetworkList = [];
            let eventNetworkItem = {
                srcIp: alertData.ipSrc,
                srcPort: parseInt(alertData.portSrc),
                dstIp: alertData.ipDst,
                dstPort: parseInt(alertData.destPort),
                srcHostname: '',
                dstHostname: ''
            };
            eventNetworkList.push(eventNetworkItem);

            let eventList = [];
            let eventListItem = {
                description: alertData.trailName,
                deviceId: '',
                frequency: 1,
                time: {
                    from: helper.getFormattedDate(alertData._eventDttm_, 'local'),
                    to: helper.getFormattedDate(alertData._eventDttm_, 'local')
                },
                connectionList: eventNetworkList
            };
            if (alertData._edgeInfo) {
                let searchRequestData = {
                    deviceName: alertData._edgeInfo.agentName
                };

                ah.one({
                    url: `${baseUrl}/api/soc/device/redirect/_search`,
                    data: JSON.stringify(searchRequestData),
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json'
                }).then(data => {
                    // console.log("data=", data)
                    eventListItem.deviceId = data.rt.device.id;
                })
            }

            eventList.push(eventListItem);
            tempIncident.info.eventList = eventList;
            console.log("tempIncident == ", tempIncident.info)

            showPage = 'addIncident';
            this.setState({
                showFilter: false,
                originalIncident: _.cloneDeep(tempIncident),
                incidentType: 'events',
                displayPage: 'main'
            })
        } else if (type === 'audit') {
            // 1. show viewIncident
            // 2. could complement Incident
            // 3. could decide send nccst or not (different status)
        } else if (type === 'download') {
            this.getIncidentSTIXFile(allValue.id);
        }
        console.log("showPage ==", showPage);
        console.log("showPage ==", showPage);
        this.setState({
            activeContent: showPage,
            incident: tempIncident
        }, () => {
            if (showPage === 'tableList' || showPage === 'cancel-add') {
                this.loadData()
            }
        })
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
    }

    /**
     * Toggle filter content on/off
     * @method
     */
    toggleFilter = () => {
        this.setState({showFilter: !this.state.showFilter})
    }

    /**
     * Clear filter input value
     * @method
     */
    clearFilter = () => {
        this.setState({search: {keyword: ''}})
    }

    /**
     * Handle Incident data change
     * @method
     * @param {string} type - input type
     * @param {string} value - input value
     */
    handleDataChange = (type, value) => {
        let temp = {...this.state.incident}
        temp.info[type] = value

        this.setState({
            incident: temp
        })
    }

    getOptions = () => {
        const {baseUrl, contextRoot} = this.context

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
                        return {value: val.id, text: val.id}
                    })

                    this.setState({relatedListOptions: list})
                }
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })


        // ah.one({
        //     url: `${baseUrl}/api/soc/unit/_search`,
        //     data: JSON.stringify({}),
        //     type: 'POST',
        //     contentType: 'application/json',
        //     dataType: 'json'
        // })
        // .then(data => {
        //     if (data) {
        //         let list = _.map(data.rows, val => {
        //             return {value: val.id, text: val.name}
        //         })

        //         this.setState({unitListOptions: list})
        //     }
        // })
        // .catch(err => {
        //     helper.showPopupMsg('', t('txt-error'), err.message)
        // })

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
                    })

                    this.setState({deviceListOptions: list})
                }
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            })
    }

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
    }

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

}

Incident.contextType = BaseDataContext
Incident.propTypes = {
    // nodeBaseUrl: PropTypes.string.isRequired
}

export default Incident
