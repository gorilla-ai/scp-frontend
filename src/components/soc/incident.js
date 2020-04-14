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
class Incident extends Component {
    constructor(props) {
        super(props);

        t = global.chewbaccaI18n.getFixedT(null, "connections");
        f = chewbaccaI18n.getFixedT(null, "tableFields");
        et = global.chewbaccaI18n.getFixedT(null, "errors");
        it = global.chewbaccaI18n.getFixedT(null, "incident");

        this.state = {
            activeContent: 'tableList', //tableList, viewDevice, editDevice
            showFilter: false,
            currentIncident: {},
            originalIncident: {},
            search: {
                keyword: ''
            },
            displayPage: 'main', /* main, events, ttps */
            relatedListOptions: [],
            unitListOptions: [],
            incident: {
                dataFieldsArr: ['_menu', 'id', 'title', 'category', 'reporter', 'createDttm'],
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
                }
            }
        };

        this.ah = getInstance("chewbacca");
    }

    componentDidMount() {
        this.loadData()
        this.getOptions()
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
            data: JSON.stringify(data),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
        .then(data => {
            console.log('data == ', data);

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
                            }
                            else if (tempData === 'createDttm') {
                                return <span>{helper.getFormattedDate(value, 'local')}</span>
                            } 
                            else {
                                return <span>{value}</span>
                            }
                        }
                    }
                })

                tempEdge.dataFields = dataFields
                this.setState({incident: tempEdge})
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
                id: 'edit',
                text: t('txt-edit'),
                action: () => this.toggleContent.bind(this, 'viewDevice', allValue)
            },
            {
                id: 'delete',
                text: t('txt-delete'),
                action: () => this.openDeleteMenu(allValue)
            }
        ]

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
        const {activeContent, baseUrl, contextRoot, showFilter, incident} = this.state;

        return <div>
            <div className="sub-header">
                <div className='secondary-btn-group right'>
                    <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter}
                            title={t('txt-filter')}><i className='fg fg-filter'/></button>
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
                                    onClick={this.toggleContent.bind(this, 'addIncident')}>{t('txt-add')}</button>
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

                    {(activeContent === 'viewIncident' || activeContent === 'editIncident' || activeContent === 'addIncident') &&
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
        const {activeContent, incident, displayPage} = this.state

        return (
            <div className='main-content basic-form'>
                <header className='main-header'>{it('txt-incident')}</header>

                <div className='content-header-btns'>
                    {activeContent === 'viewIncident' &&
                    <button className='standard btn list'
                            onClick={this.toggleContent.bind(this, 'tableList')}>{t('network-inventory.txt-backToList')}</button>
                    }
                    {activeContent !== 'addIncident' &&
                    <button className='standard btn edit'
                            onClick={this.toggleContent.bind(this, 'editIncident')}>{t('txt-edit')}</button>
                    }
                </div>


                {
                    displayPage === 'main' && this.displayMainPage()
                }

                {
                    displayPage === 'events' && this.displayEventsPage()
                }

                {
                    displayPage === 'ttps' && this.displayTtpPage()
                }







                {activeContent === 'editIncident' &&
                <footer>
                    <button className='standard'
                            onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</button>
                    <button onClick={this.handleSubmit}>{t('txt-save')}</button>

                </footer>
                }
                {activeContent === 'addIncident' &&
                <footer>
                    <button className='standard'
                            onClick={this.toggleContent.bind(this, 'cancel-add')}>{t('txt-cancel')}</button>
                    <button onClick={this.handleSubmit}>{t('txt-save')}</button>

                </footer>
                }
            </div>
        )
    }

    handleIncidentPageChange = (val) => {
        this.setState({displayPage: val})
    }

    displayMainPage = () => {
        const {activeContent, incident, unitListOptions, relatedListOptions} = this.state

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
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
            <div className='group'>
                <label htmlFor='category'>{f('incidentFields.category')}</label>
                <DropDownList
                    id='category'
                    onChange={this.handleDataChange.bind(this, 'category')}
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
                    value={incident.info.reporter}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
            <div className='group'>
                <label htmlFor='impactAssessment'>{f('incidentFields.impactAssessment')}</label>
                <DropDownList
                    id='impactAssessment'
                    onChange={this.handleDataChange.bind(this, 'impactAssessment')}
                    list={
                        _.map(_.range(1, 5), el => {
                            return {text: el, value: el}
                        })
                    }
                    value={incident.info.impactAssessment}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>

            <div className='group'>
                <label htmlFor='description'>{f('incidentFields.description')}</label>
                <Textarea
                    id='description'
                    onChange={this.handleDataChange.bind(this, 'description')}
                    value={incident.info.description}
                    rows={3}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
            <div className='group'>
                <label htmlFor='socType'>{f('incidentFields.socType')}</label>
                <DropDownList
                    id='socType'
                    onChange={this.handleDataChange.bind(this, 'socType')}
                    list={[
                        {text: 'N-SOC', value: 0},{text: 'G-SOC', value: 1}
                    ]}
                    value={incident.info.socType}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>

            <div className='group full'>
                <label htmlFor='relatedList'>{f('incidentFields.relatedList')}</label>
                <ComboBox
                    id='relatedList'
                    style={{width: '100%'}}
                    onChange={this.handleDataChange.bind(this, 'relatedList')}
                    list={relatedListOptions}
                    multiSelect={{enabled: true, toggleAll: true}}
                    value={incident.info.relatedList}
                    readOnly={activeContent === 'viewIncident'}/>
            </div>
        </div>
    }

    handleEventsChange = (val) => {
        let temp = {...this.state.incident}
        temp.info.relatedList = val
        this.setState({incident: temp})
    }
    displayEventsPage = () => {
        const {activeContent, incident} = this.state
        const {locale} = this.context

        const now = new Date()
        const nowTime = Moment(now).local().format('YYYY-MM-DD HH:mm:ss')

        return <div className='form-group normal'>
            <header>
                <div className='text'>{it('txt-incident-events')}</div>
            </header>

            <button className='last-left' onClick={this.handleIncidentPageChange.bind(this, 'main')}>{it('txt-prev-page')}</button>
            <button className='last' onClick={this.handleIncidentPageChange.bind(this, 'ttps')}>{it('txt-next-page')}</button>

            <div className='group full multi'>
                <MultiInput
                    id='incidentEvent'
                    className='incident-group'
                    base={Events}
                    defaultItemValue={{description: '', deviceId: '', time: {from: nowTime, to: nowTime}, frequency: 0}}
                    value={incident.info.relatedList}
                    props={{activeContent: activeContent, locale: locale}}
                    onChange={this.handleEventsChange} />
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
                    onChange={this.handleTtpsChange} />
            </div>
        </div>
    }




    handleSubmit = () => {
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
                        <label htmlFor='edgeSearchKeyword' className='first-label'>{f('edgeFields.keywords')}</label>
                        <Input
                            id='edgeSearchKeyword'
                            className='search-textarea'
                            onChange={this.handleSearch.bind(this, 'keyword')}
                            value={search.keyword}/>
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

    /**
     * Handle table sort
     * @method
     * @param {object} sort - sort data object
     */
    handleTableSort = (sort) => {
        let tempDevice = {...this.state.incidentDevice};
        tempDevice.sort.field = sort.field;
        tempDevice.sort.desc = sort.desc;

        this.setState({incidentDevice: tempDevice}, () => {
            this.loadData()
        })
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
        const {originalIncident, incident} = this.state
        let tempIncident = {...incident}
        let showPage = type

        if (type === 'viewIncident') {
            tempIncident.info = {
                id: allValue.id,
                title: allValue.title,
                category: allValue.category,
                reporter: allValue.reporter,
                isAuditEvent: allValue.isAuditEvent,
                isAuditAnalysis: allValue.isAuditAnalysis,
                description: allValue.description,
                impactAssessment: allValue.impactAssessment,
                createDttm: allValue.createDttm,
                relatedList: allValue.relatedList,
                ttpList: allValue.ttpList,
                eventList: allValue.eventList
            }
            
            this.setState({showFilter: false, originalIncident: _.cloneDeep(tempIncident)})
        } 
        else if (type === 'addIncident') {
            tempIncident.info = {
                id: allValue.id,
                title: allValue.title,
                category: allValue.category,
                reporter: allValue.reporter,
                isAuditEvent: allValue.isAuditEvent,
                isAuditAnalysis: allValue.isAuditAnalysis,
                description: allValue.description,
                impactAssessment: allValue.impactAssessment,
                createDttm: allValue.createDttm,
                relatedList: allValue.relatedList,
                ttpList: allValue.ttpList,
                eventList: allValue.eventList
            }

            this.setState({showFilter: false, originalIncident: _.cloneDeep(tempIncident)})
        } 
        else if (type === 'tableList') {
            tempIncident.info = _.cloneDeep(incident.info)
        } 
        else if (type === 'cancel-add') {
            showPage = 'tableList';
            tempIncident = _.cloneDeep(originalIncident)
        } 
        else if (type === 'cancel') {
            showPage = 'viewDevice';
            tempIncident = _.cloneDeep(originalIncident)
        }

        this.setState({
            activeContent: showPage,
            incident: tempIncident
        }, () => {
            if (type === 'tableList') {
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
     * Handle Incident Device edit input data change
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


        ah.one({
            url: `${baseUrl}/api/soc/unit/_search`,
            data: JSON.stringify({}),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
        .then(data => {
            if (data) {
                let list = _.map(data.rows, val => {
                    return {value: val.id, text: val.name}
                })
                
                this.setState({unitListOptions: list})
            }
        })
        .catch(err => {
            helper.showPopupMsg('', t('txt-error'), err.message)
        })
    }
}

Incident.contextType = BaseDataContext
Incident.propTypes = {
    // nodeBaseUrl: PropTypes.string.isRequired
}

export default Incident
