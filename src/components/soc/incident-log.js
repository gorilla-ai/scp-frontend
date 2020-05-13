import React, {Component} from "react";

import {getInstance} from "react-ui/build/src/utils/ajax-helper";
import {BaseDataContext} from "../common/context";
import SocConfig from "../common/soc-configuration";
import helper from "../common/helper";
import cx from "classnames";
import Input from "react-ui/build/src/components/input";
import TableContent from "../common/table-content";
import {Link} from "react-router-dom";
import DropDownList from "react-ui/build/src/components/dropdown";

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
class IncidentLog extends Component {
    constructor(props) {
        super(props);

        t = global.chewbaccaI18n.getFixedT(null, "connections");
        f = global.chewbaccaI18n.getFixedT(null, "tableFields");
        et = global.chewbaccaI18n.getFixedT(null, "errors");
        it = global.chewbaccaI18n.getFixedT(null, "incident");

        this.state = {
            activeContent: 'tableList', //tableList, viewDevice, editDevice
            showFilter: false,
            logSearch: {
                keyword: '',
                type: '',
                status: ''
            },
            incidentLog: {
                dataFieldsArr: ['id', 'type', 'status', 'createDttm', 'updateDttm', 'sendTime'],
                dataFields: {},
                dataContent: [],
                sort: {
                    field: 'type',
                    desc: false
                },
                totalCount: 0,
                currentPage: 1,
                pageSize: 20,
                info: {
                    id: '',
                    type: '',
                    status: ''
                }
            }
        };

        this.ah = getInstance("chewbacca");
    }

    componentDidMount() {
        const {locale, sessionRights} = this.context;

        helper.getPrivilegesInfo(sessionRights, 'config', locale);
        this.getData();
    }

    /**
     * Get and set Incident Unit table data
     * @method
     * @param {string} fromSearch - option for the 'search'
     */
    getData = (fromSearch) => {
        const {baseUrl, contextRoot} = this.context;
        const {logSearch, incidentLog} = this.state;
        const url = `${baseUrl}/api/soc/log/_search?page=${incidentLog.currentPage}&pageSize=${incidentLog.pageSize}`;
        let data = {};

        if (logSearch.keyword) {
            data.keyword = logSearch.keyword;
        }

        if (logSearch.type) {
            data.type = logSearch.type;
        }

        if (logSearch.status) {
            data.status = logSearch.status;
        }


        helper.getAjaxData('POST', url, data)
            .then(data => {
                if (data) {
                    let tempLog = {...incidentLog};
                    tempLog.dataContent = data.rows;
                    tempLog.totalCount = data.counts;
                    tempLog.currentPage = fromSearch === 'search' ? 1 : incidentLog.currentPage;

                    let dataFields = {};
                    incidentLog.dataFieldsArr.forEach(tempData => {
                        dataFields[tempData] = {
                            label: tempData === '_menu' ? '' : f(`incidentFields.${tempData}`),
                            sortable: this.checkSortable(tempData),
                            formatter: (value, allValue, i) => {
                                if (tempData === 'updateDttm') {
                                    return <span>{helper.getFormattedDate(value, 'local')}</span>
                                } else if (tempData === 'createDttm') {
                                    return <span>{helper.getFormattedDate(value, 'local')}</span>
                                } else if (tempData === 'sendTime') {
                                    return <span>{helper.getFormattedDate(value, 'local')}</span>
                                } else if (tempData === 'type') {
                                    if (value === 'event') {
                                        return <span>{it('txt-incident-event')}</span>
                                    } else if (value === 'related') {
                                        return <span>{it('txt-incident-related')}</span>
                                    } else if (value === 'health') {
                                        return <span>{it('txt-incident-health')}</span>
                                    }
                                } else if (tempData === 'status') {
                                    if (value === 'success') {
                                        return <span style={{color: '#008B02'}}>{it('txt-send-success')}</span>
                                    } else if (value === 'fail') {
                                        return <span style={{color: '#DB3E00'}}>{it('txt-send-fail')}</span>
                                    }
                                } else {
                                    return <span>{value}</span>
                                }
                            }
                        };
                    });

                    tempLog.dataFields = dataFields;

                    this.setState({
                        incidentLog: tempLog
                    });
                }
                return null;
            })
            .catch(err => {
                helper.showPopupMsg(t('txt-error'));
            });
    };

    /* ------------------ View ------------------- */
    render() {
        const {activeContent, baseUrl, contextRoot, showFilter, incidentLog} = this.state;

        return (
            <div>

                <div className="sub-header">
                    <div className='secondary-btn-group right'>
                        <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter}
                                title={t('txt-filter')}><i className='fg fg-filter'/></button>
                    </div>
                </div>

                <div className='data-content'>
                    <SocConfig
                        baseUrl={baseUrl}
                        contextRoot={contextRoot}
                    />

                    <div className='parent-content'>
                        {this.renderFilter()}

                        {activeContent === 'tableList' &&
                        <div className='main-content'>
                            <header className='main-header'>{it('txt-incident-log')}</header>
                            <div className='content-header-btns'>
                                <Link to='/SCP/configuration/notifications'><button className='standard btn'>{t('notifications.txt-settings')}</button></Link>
                            </div>
                            <TableContent
                                dataTableData={incidentLog.dataContent}
                                dataTableFields={incidentLog.dataFields}
                                dataTableSort={incidentLog.sort}
                                paginationTotalCount={incidentLog.totalCount}
                                paginationPageSize={incidentLog.pageSize}
                                paginationCurrentPage={incidentLog.currentPage}
                                handleTableSort={this.handleTableSort}
                                paginationPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                                paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')}/>
                        </div>
                        }

                    </div>
                </div>
            </div>
        );
    }

    /**
     * Handle table pagination change
     * @method
     * @param {string} type - page type ('currentPage' or 'pageSize')
     * @param {string | number} value - new page number
     */
    handlePaginationChange = (type, value) => {
        let tempLog = {...this.state.incidentLog};
        tempLog[type] = Number(value);

        if (type === 'pageSize') {
            tempLog.currentPage = 1;
        }

        this.setState({
            incidentLog: tempLog
        }, () => {
            this.getData();
        });
    };

    /**
     * Display filter content
     * @method
     * @returns HTML DOM
     */
    renderFilter = () => {
        const {showFilter, logSearch} = this.state;

        return (
            <div className={cx('main-filter', {'active': showFilter})}>
                <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}/>
                <div className='header-text'>{t('txt-filter')}</div>
                <div className='filter-section config'>
                    <div className='group'>
                        <label htmlFor='keyword' className='first-label'>{f('incidentFields.keywords')}</label>
                        <input
                            id='keyword'
                            className='search-textarea'
                            value={logSearch.keyword}
                            onChange={this.handleLogInputSearch.bind(this, 'keyword')}/>
                    </div>
                    <div className='group'>
                        <label htmlFor='type' className='first-label'>{it('txt-send-type')}</label>
                        <DropDownList
                            id='type'
                            list={[
                                {
                                    value: 'event',
                                    text: it('txt-incident-event')
                                },
                                {
                                    value: 'related',
                                    text: it('txt-incident-related')
                                },
                                {
                                    value: 'health',
                                    text: it('txt-incident-health')
                                }
                            ]}
                            value={logSearch.type}
                            onChange={this.handleLogSearch.bind(this, 'type')}/>

                    </div>
                    <div className='group'>
                        <label htmlFor='status' className='first-label'>{it('txt-send-status')}</label>
                        <DropDownList
                            id='status'
                            list={[
                                {
                                    value: 'success',
                                    text: it('txt-send-success')
                                },
                                {
                                    value: 'fail',
                                    text: it('txt-send-fail')
                                }
                            ]}
                            value={logSearch.status}
                            onChange={this.handleLogSearch.bind(this, 'status')}/>
                    </div>
                </div>
                <div className='button-group'>
                    <button className='filter'
                            onClick={this.getData.bind(this, 'search')}>{t('txt-filter')}</button>
                    <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
                </div>
            </div>
        )
    };

    /* ---- Func Space ---- */

    /**
     * Handle table sort
     * @method
     * @param {object} sort - sort data object
     */
    handleTableSort = (sort) => {
        let tempLog = {...this.state.incidentLog};
        tempLog.sort.field = sort.field;
        tempLog.sort.desc = sort.desc;

        this.setState({
            incidentLog: tempLog
        }, () => {
            this.getData();
        });
    };

    /**
     * Check table sort
     * @method
     * @param {string} field - table field name
     * @returns true for sortable or null
     */
    checkSortable = (field) => {
        const unSortableFields = ['_menu'];

        if (_.includes(unSortableFields, field)) {
            return null;
        } else {
            return true;
        }
    };

    /**
     * Handle filter input data change
     * @method
     * @param {string} type - input type
     * @param {object} event - input value
     */
    handleLogInputSearch = (type, event) => {
        let tempLogSearch = {...this.state.logSearch};
        tempLogSearch[type] = event.target.value.trim();

        this.setState({
            logSearch: tempLogSearch
        });
    };

    /**
     * Handle filter input data change
     * @method
     * @param {string} type - input type
     * @param {string} value - input value
     */
    handleLogSearch = (type, value) => {
        let tempLogSearch = {...this.state.logSearch};
        tempLogSearch[type] = value;

        this.setState({
            logSearch: tempLogSearch
        });
    };

    /**
     * Toggle filter content on/off
     * @method
     */
    toggleFilter = () => {
        this.setState({
            showFilter: !this.state.showFilter
        });
    };

    /**
     * Clear filter input value
     * @method
     */
    clearFilter = () => {
        this.setState({
            logSearch: {
                keyword: '',
                type: '',
                status: ''
            }
        });
    };

}

IncidentLog.contextType = BaseDataContext;

IncidentLog.propTypes = {
    // nodeBaseUrl: PropTypes.string.isRequired
};

export default IncidentLog;
