import React, {Component} from "react";

import {default as ah, getInstance} from "react-ui/build/src/utils/ajax-helper";
import {BaseDataContext} from "../common/context";
import SocConfig from "../common/soc-configuration";
import helper from "../common/helper";
import cx from "classnames";
import Moment from "moment";
import moment from "moment";
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";
import {KeyboardDateTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import constants from "../constant/constant-incidnet";
import _ from "lodash";
import MuiTableContent from "../common/mui-table-content";
import MuiTableContentWithoutLoading from "../common/mui-table-content-withoutloading";

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
                status: '',
                dttmType: 'createdDttm',
                datetime: {
                    from: helper.getSubstractDate(1, 'month'),
                    to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
                },
            },
            accountType:constants.soc.LIMIT_ACCOUNT,
            incidentLog: {
                dataFieldsArr: ['id', 'type', 'status', 'createDttm', 'updateDttm', 'sendTime'],
                dataFields: [],
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
        const {baseUrl, locale, sessionRights} = this.context;

        helper.getPrivilegesInfo(sessionRights, 'soc', locale);
        helper.inactivityTime(baseUrl, locale);

        this.checkAccountType();
        this.getData();
    }

    componentWillUnmount() {
        helper.clearTimer();
    }

    checkAccountType = () =>{
        const {baseUrl, session} = this.context;
        let requestData={
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
     * Get and set Incident Unit table data
     * @method
     * @param {string} fromSearch - option for the 'search'
     */
    getData = (options) => {
        const {baseUrl, contextRoot, session} = this.context;
        const {logSearch, incidentLog} = this.state;

        const sort = incidentLog.sort.desc ? 'desc' : 'asc';
        const page = options === 'currentPage' ? incidentLog.currentPage : 0;
        const url = `${baseUrl}/api/soc/log/_searchV2?page=${page + 1}&pageSize=${incidentLog.pageSize}&orders=${incidentLog.sort.field} ${sort}`;

        let requestData = {};

        if (logSearch.keyword) {
            requestData.keyword = logSearch.keyword;
        }

        if (logSearch.type) {
            requestData.type = logSearch.type;
        }

        if (logSearch.status) {
            requestData.status = logSearch.status;
        }

        if (logSearch.dttmType) {
            requestData.dttmType = logSearch.dttmType;
        }

        requestData.account = session.accountId;

        if (logSearch.datetime) {
            requestData.startDttm =   Moment(logSearch.datetime.from).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
            requestData.endDttm =   Moment(logSearch.datetime.to).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
        }

        this.ah.one({
            url,
            data: JSON.stringify(requestData),
            type: 'POST',
            contentType: 'text/plain'
        })
        .then(data => {
            if (data) {
                let tempLog = {...incidentLog};
                tempLog.dataContent = data.rows;
                tempLog.totalCount = data.counts;
                tempLog.currentPage = page;

                tempLog.dataFields = _.map(incidentLog.dataFieldsArr, val => {
                    return {
                        name: val === '_menu' ? '' : val,
                        label: val === '_menu' ? '' : val === 'updateDttm' ? f(`incidentFields.lastSendDttm`):f(`incidentFields.${val}`),
                        options: {
                            filter: true,
                            sort: this.checkSortable(val),
                            viewColumns: val !== '_menu',
                            customBodyRenderLite: (dataIndex, options) => {
                                const allValue = tempLog.dataContent[dataIndex];
                                let value = tempLog.dataContent[dataIndex][val];

                                if (options === 'getAllValue') {
                                    return allValue;
                                }

                                if (val === 'updateDttm') {
                                    return <span>{helper.getFormattedDate(value, 'local')}</span>
                                } else if (val === 'createDttm') {
                                    return <span>{helper.getFormattedDate(value, 'local')}</span>
                                } else if (val === 'sendTime') {
                                    return <span>{helper.getFormattedDate(value, 'local')}</span>
                                } else if (val === 'type') {
                                    if (value === 'event') {
                                        return <span>{it('txt-incident-event')}</span>
                                    } else if (value === 'related') {
                                        return <span>{it('txt-incident-related')}</span>
                                    } else if (value === 'health') {
                                        return <span>{it('txt-incident-health')}</span>
                                    }
                                } else if (val === 'status') {
                                    if (value === 'success') {
                                        return <span style={{color: '#008B02'}}>{it('txt-send-success')}</span>
                                    } else if (value === 'fail') {
                                        return <span style={{color: '#DB3E00'}}>{it('txt-send-fail')}</span>
                                    } else if (value === 'fail-connect') {
                                        return <span style={{color: '#DB3E00'}}>{it('txt-send-connect-fail')}</span>
                                    }
                                } else {
                                    return <span>{value}</span>
                                }
                            }
                        }
                    };
                });

                this.setState({
                    incidentLog: tempLog
                });
            }
            return null;
        })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message);
            })
    };

    /**
     * Handle table pagination change
     * @method
     * @param {string} type - page type ('currentPage' or 'pageSize')
     * @param {number} value - new page number
     */
    handlePaginationChange = (type, value) => {
        let temp = {...this.state.incidentLog};
        temp[type] = Number(value);
        this.setState({
            incidentLog: temp
        }, () => {
            this.getData(type);
        });
    }
    /**
     * Handle table sort
     * @method
     * @param {string} field - sort field
     * @param {string} boolean - sort type ('asc' or 'desc')
     */
    handleTableSort = (field, sort) => {
        let temp = {...this.state.incidentLog};
        temp.sort.field = field;
        temp.sort.desc = sort;

        this.setState({
            incidentLog: temp
        }, () => {
            this.getData();
        });
    }

    /* ------------------ View ------------------- */
    render() {
        const {activeContent, baseUrl, contextRoot, showFilter, incidentLog, accountType} = this.state;
        const {session} = this.context;

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

        return (
            <div>

                <div className="sub-header">
                    <div className='secondary-btn-group right'>

                        <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter}
                                title={t('txt-filter')}><i className='fg fg-filter'/></button>
                    </div>
                </div>

                <div className='data-content'>
                    <SocConfig baseUrl={baseUrl} contextRoot={contextRoot} session={session} accountType={accountType} />
                    <div className='parent-content'>
                        {this.renderFilter()}

                        {activeContent === 'tableList' &&
                        <div className='main-content'>
                            <header className='main-header'>{it('txt-incident-log-management')}</header>
                            <MuiTableContentWithoutLoading
                                data={incidentLog}
                                tableOptions={tableOptions}/>
                        </div>
                        }

                    </div>
                </div>
            </div>
        );
    }

    // /**
    //  * Handle table pagination change
    //  * @method
    //  * @param {string} type - page type ('currentPage' or 'pageSize')
    //  * @param {string | number} value - new page number
    //  */
    // handlePaginationChange = (type, value) => {
    //     let tempLog = {...this.state.incidentLog};
    //     tempLog[type] = Number(value);
    //
    //     if (type === 'pageSize') {
    //         tempLog.currentPage = 1;
    //     }
    //
    //     this.setState({
    //         incidentLog: tempLog
    //     }, () => {
    //         this.getData();
    //     });
    // };

    /**
     * Display filter content
     * @method
     * @returns HTML DOM
     */
    renderFilter = () => {
        const {showFilter, logSearch} = this.state;
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
                        <label htmlFor='keyword'>{f('incidentFields.id')}</label>
                        <TextField
                            id='keyword'
                            name='keyword'
                            type='text'
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            className='search-textarea'
                            value={logSearch.keyword}
                            onChange={this.handleLogInputSearchMui}/>
                    </div>
                    <div className='group'>
                        <label htmlFor='type'>{it('txt-send-type')}</label>
                        <TextField
                            id='type'
                            name='type'
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            select
                            value={logSearch.type}
                            onChange={this.handleLogInputSearchMui}>
                            {
                                _.map([
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
                                ], el => {
                                    return <MenuItem value={el.value}>{el.text}</MenuItem>
                                })
                            }
                        </TextField>
                    </div>
                    <div className='group'>
                        <label htmlFor='status'>{it('txt-send-status')}</label>
                        <TextField
                            id='status'
                            name='status'
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            select
                            value={logSearch.status}
                            onChange={this.handleLogInputSearchMui}>
                            {
                                _.map([
                                    {
                                        value: 'success',
                                        text: it('txt-send-success')
                                    },
                                    {
                                        value: 'fail',
                                        text: it('txt-send-fail')
                                    },
                                    {
                                        value: 'fail-connect',
                                        text: it('txt-send-connect-fail')
                                    }
                                ], el => {
                                    return <MenuItem value={el.value}>{el.text}</MenuItem>
                                })
                            }
                        </TextField>
                    </div>
                    <div className='group'>
                        <label htmlFor='searchDttmType'>{it('txt-searchDttmType')}</label>
                        <TextField
                            id='searchDttmType'
                            name='dttmType'
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            select
                            required={true}
                            value={logSearch.dttmType}
                            onChange={this.handleLogInputSearchMui}>
                            {
                                _.map([
                                    {
                                        value: 'sendDttm',
                                        text: f('incidentFields.sendTime')
                                    },
                                    {
                                        value: 'updateDttm',
                                        text: f('incidentFields.updateDttm')
                                    },
                                    {
                                        value: 'createdDttm',
                                        text: f('incidentFields.createDttm')
                                    }
                                ], el => {
                                    return <MenuItem value={el.value}>{el.text}</MenuItem>
                                })
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
                                value={logSearch.datetime.from}
                                onChange={this.handleSearchTime.bind(this, 'from')} />
                            <div className='between'>~</div>
                            <KeyboardDateTimePicker
                                className='date-time-picker'
                                inputVariant='outlined'
                                variant='inline'
                                format='YYYY-MM-DD HH:mm'
                                ampm={false}
                                value={logSearch.datetime.to}
                                onChange={this.handleSearchTime.bind(this, 'to')} />
                        </MuiPickersUtilsProvider>
                    </div>
                </div>
                <div className='button-group'>
                    <Button variant='contained' color='primary' className='filter' onClick={this.getData.bind(this, 'search')}>{t('txt-filter')}</Button>
                    <Button variant='outlined' color='primary' className='clear' onClick={this.clearFilter}>{t('txt-clear')}</Button>
                </div>
            </div>
        )
    };

    /* ---- Func Space ---- */


    /**
     * Handle filter input data change
     * @method
     * @param {string} type - input type
     * @param {string} value - input value
     */
    handleSearchTime = (type, value) => {
        let tempSearch = {...this.state.logSearch};
        tempSearch.datetime[type] = value;

        this.setState({
            logSearch: tempSearch
        });
    };

    // /**
    //  * Handle table sort
    //  * @method
    //  * @param {object} sort - sort data object
    //  */
    // handleTableSort = (sort) => {
    //     let tempLog = {...this.state.incidentLog};
    //     tempLog.sort.field = sort.field;
    //     tempLog.sort.desc = sort.desc;
    //
    //     this.setState({
    //         incidentLog: tempLog
    //     }, () => {
    //         this.getData();
    //     });
    // };

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
     * @param {object} event - input value
     */
    handleLogInputSearchMui = (event) => {
        let tempLogSearch = {...this.state.logSearch};
        tempLogSearch[event.target.name] = event.target.value.trim();

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
     * Handle filter input data change
     * @method
     * @param {string} type - input type
     * @param {string} value - input value
     */
    handleLogSearchMui = (event) => {
        let tempLogSearch = {...this.state.logSearch};
        tempLogSearch[event.target.name] = event.target.value;

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
                status: '',
                dttmType: 'createdDttm',
                datetime: {
                    from: helper.getSubstractDate(1, 'month'),
                    to: Moment().local().format('YYYY-MM-DDTHH:mm:ss')
                },
            },
        });
    };

}

IncidentLog.contextType = BaseDataContext;

IncidentLog.propTypes = {
    // nodeBaseUrl: PropTypes.string.isRequired
};

export default IncidentLog;
