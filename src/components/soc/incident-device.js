import React, {Component} from "react";

import {default as ah, getInstance} from "react-ui/build/src/utils/ajax-helper";
import {BaseDataContext} from "../common/context";
import SocConfig from "../common/soc-configuration";
import helper from "../common/helper";
import cx from "classnames";
import Input from "react-ui/build/src/components/input";
import PopupDialog from "react-ui/build/src/components/popup-dialog";
import TableContent from "../common/table-content";
import DropDownList from "react-ui/build/src/components/dropdown";
import Textarea from "react-ui/build/src/components/textarea";

const INCIDENT = "incident";
const DEVICE = "device";
const PROTECT_TYPE_LIST = [
    {
        value: '0',
        text: '防毒軟體'
    },
    {
        value: '1',
        text: '網路防火牆'
    },
    {
        value: '2',
        text: '電子郵件過濾機制'
    },
    {
        value: '3',
        text: '入侵偵測及防禦機制'
    },
    {
        value: '4',
        text: '應用程式防火牆'
    },
    {
        value: '5',
        text: '進階持續性威脅攻擊防禦措施'
    },
    {
        value: '6',
        text: '其他'
    },
];

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
class IncidentDevice extends Component {
    constructor(props) {
        super(props);

        t = global.chewbaccaI18n.getFixedT(null, "connections");
        f = chewbaccaI18n.getFixedT(null, "tableFields");
        et = global.chewbaccaI18n.getFixedT(null, "errors");
        it = global.chewbaccaI18n.getFixedT(null, "incident");

        this.state = {
            activeContent: 'tableList', //tableList, viewDevice, editDevice
            showFilter: false,
            currentIncidentDeviceData: {},
            originalIncidentDeviceData: {},
            deviceSearch: {
                keyword: ''
            },
            incidentDevice: {
                dataFieldsArr: ['deviceId', 'deviceName', 'protectTypeInfo', 'unitName', 'unitLevel', 'frequency', 'updateDttm', '_menu'],
                dataFields: {},
                dataContent: [],
                sort: {
                    field: 'deviceId',
                    desc: false
                },
                totalCount: 0,
                currentPage: 1,
                pageSize: 20,
                info: {
                    id: '',
                    deviceId: '',
                    deviceName: '',
                    unitOid: '',
                    unitName: '',
                    unitLevel: 'A',
                    frequency: null,
                    protectType: '1',
                    protectTypeInfo: '',
                    note: '',
                    updateDttm: ''
                }
            }
        };

        this.ah = getInstance("chewbacca");
    }

    componentDidMount() {
        this.getDeviceData();
    }

    /**
     * Get and set Incident Device table data
     * @method
     * @param {string} fromSearch - option for the 'search'
     */
    getDeviceData = (fromSearch) => {
        const {baseUrl, contextRoot} = this.context;
        const {deviceSearch, incidentDevice} = this.state;
        const url = `${baseUrl}/api/soc/device/_search?page=${incidentDevice.currentPage}&pageSize=${incidentDevice.pageSize}`;
        let data = {};

        if (deviceSearch.keyword) {
            data.keyword = deviceSearch.keyword;
        }

        helper.getAjaxData('POST', url, data)
            .then(data => {
                if (data) {
                    let tempEdge = {...incidentDevice};
                    tempEdge.dataContent = data.rows;
                    tempEdge.totalCount = data.counts;
                    tempEdge.currentPage = fromSearch === 'search' ? 1 : incidentDevice.currentPage;

                    let dataFields = {};
                    incidentDevice.dataFieldsArr.forEach(tempData => {
                        dataFields[tempData] = {
                            label: tempData === '_menu' ? '' : f(`incidentFields.${tempData}`),
                            sortable: this.checkSortable(tempData),
                            formatter: (value, allValue, i) => {
                                if (tempData === 'ipPort') {

                                } else if (tempData === 'updateDttm') {
                                    return <span>{helper.getFormattedDate(value,'local')}</span>
                                } else if (tempData === '_menu') {
                                    return (
                                        <div className='table-menu menu active'>
                                            <i className='fg fg-edit'
                                               onClick={this.toggleContent.bind(this, 'viewDevice', allValue)}
                                               title={t('txt-view')}/>
                                            <i className='fg fg-trashcan'
                                               onClick={this.openDeleteMenu.bind(this, allValue)}
                                               title={t('txt-delete')}/>
                                        </div>
                                    )
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
                helper.showPopupMsg(t('txt-error'));
            });
    };

    /* ------------------ View ------------------- */
    render() {
        const {activeContent, baseUrl, contextRoot, showFilter, incidentDevice} = this.state;

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
                            <header className='main-header'>{it('txt-incident-device')}</header>
                            <div className='content-header-btns'>
                                {activeContent === 'viewDevice' &&
                                <button className='standard btn list'
                                        onClick={this.toggleContent.bind(this, 'tableList')}>{t('network-inventory.txt-backToList')}</button>
                                }
                                <button className='standard btn edit'
                                        onClick={this.toggleContent.bind(this, 'addDevice')}>{t('txt-add')}</button>
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
                                paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')}/>
                        </div>
                        }

                        {(activeContent === 'viewDevice' || activeContent === 'editDevice' || activeContent === 'addDevice') &&
                        this.displayEditDeviceContent()
                        }
                    </div>
                </div>
            </div>
        );
    }


    /** TODO
     * Display edit IncidentDevice content
     * @method
     * @returns HTML DOM
     */
    displayEditDeviceContent = () => {
        const {activeContent, incidentDevice} = this.state;

        return (
            <div className='main-content basic-form'>
                <header className='main-header'>{it('txt-incident-device')}</header>

                <div className='content-header-btns'>
                    {activeContent === 'viewDevice' &&
                    <button className='standard btn list'
                            onClick={this.toggleContent.bind(this, 'tableList')}>{t('network-inventory.txt-backToList')}</button>
                    }
                    {activeContent !== 'addDevice' &&
                    <button className='standard btn edit'
                            onClick={this.toggleContent.bind(this, 'editDevice')}>{t('txt-edit')}</button>
                    }
                </div>

                <div className='form-group normal'>
                    <header>
                        <div className='text'>{t('edge-management.txt-basicInfo')}</div>

                        {activeContent !== 'addDevice' &&
                        <span
                            className='msg'>{t('edge-management.txt-lastUpateTime')} {helper.getFormattedDate(incidentDevice.info.updateDttm, 'local')}</span>
                        }
                    </header>

                    <div className='group'>
                        <label htmlFor='deviceId'>{it('device.txt-id')}</label>
                        <Input
                            id='deviceId'
                            onChange={this.handleDataChange.bind(this, 'deviceId')}
                            value={incidentDevice.info.deviceId}
                            readOnly={activeContent === 'viewDevice'}/>
                    </div>
                    <div className='group'>
                        <label htmlFor='deviceName'>{it('device.txt-name')}</label>
                        <Input
                            id='deviceName'
                            onChange={this.handleDataChange.bind(this, 'deviceName')}
                            value={incidentDevice.info.deviceName}
                            readOnly={activeContent === 'viewDevice'}/>
                    </div>

                    <div className='group'>
                        <label htmlFor='unitOid'>{it('unit.txt-oid')}</label>
                        <Input
                            id='unitOid'
                            onChange={this.handleDataChange.bind(this, 'unitOid')}
                            value={incidentDevice.info.unitOid}
                            readOnly={activeContent === 'viewDevice'}/>
                    </div>
                    <div className='group'>
                        <label htmlFor='unitName'>{it('unit.txt-name')}</label>
                        <Input
                            id='unitName'
                            onChange={this.handleDataChange.bind(this, 'unitName')}
                            value={incidentDevice.info.unitName}
                            readOnly={activeContent === 'viewDevice'}/>
                    </div>

                    <div className='group'>
                        <label htmlFor='unitLevel'>{it('unit.txt-level')}</label>
                        <DropDownList
                            id='unitLevel'
                            required={true}
                            list={[
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
                                },
                            ]}

                            onChange={this.handleDataChange.bind(this, 'unitLevel')}
                            value={incidentDevice.info.unitLevel}
                            readOnly={activeContent === 'viewDevice'}/>
                    </div>

                    <div className='group'>
                        <label htmlFor='protectType'>{it('txt-protect-type')}</label>
                        <DropDownList
                            id='protectType'
                            required={true}
                            list={PROTECT_TYPE_LIST}

                            onChange={this.handleDataChange.bind(this, 'protectType')}
                            value={incidentDevice.info.protectType}
                            readOnly={activeContent === 'viewDevice'}/>
                    </div>
                    {incidentDevice.info.protectType === '6' &&
                    <div className='group'>
                        <label htmlFor='protectTypeInfo'>{it('txt-protect-type-info')}</label>
                        <Input
                            id='protectTypeInfo'
                            onChange={this.handleDataChange.bind(this, 'protectTypeInfo')}
                            value={incidentDevice.info.protectTypeInfo}
                            readOnly={activeContent === 'viewDevice'}/>
                    </div>
                    }

                    {activeContent !== 'addDevice' &&
                    <div className='group'>
                        <label htmlFor='frequency'>{it('txt-frequency')}</label>
                        <Input
                            id='frequency'
                            onChange={this.handleDataChange.bind(this, 'frequency')}
                            value={incidentDevice.info.frequency}
                            readOnly={activeContent === 'viewDevice'}/>
                    </div>
                    }
                    {activeContent !== 'addDevice' &&
                    <div className='group full'>
                        <label htmlFor='note'>{it('txt-note')} ({t('txt-memoMaxLength')})</label>
                        <Textarea
                            id='note'
                            rows={4}
                            maxLength={250}
                            value={incidentDevice.info.note}
                            onChange={this.handleDataChange.bind(this, 'note')}
                            readOnly={activeContent === 'viewDevice'}/>
                    </div>
                    }
                </div>

                {activeContent === 'editDevice' &&
                <footer>
                    <button className='standard'
                            onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</button>
                    <button onClick={this.handleDeviceSubmit}>{t('txt-save')}</button>

                </footer>
                }
                {activeContent === 'addDevice' &&
                <footer>
                    <button className='standard'
                            onClick={this.toggleContent.bind(this, 'cancel-add')}>{t('txt-cancel')}</button>
                    <button onClick={this.handleDeviceSubmit}>{t('txt-save')}</button>

                </footer>
                }
            </div>
        )
    };


    /** TODO
     * Handle IncidentDevice Edit confirm
     * @method
     */
    handleDeviceSubmit = () => {
        const {baseUrl} = this.context;
        const {incidentDevice} = this.state;
        let apiType = 'POST';

        if (incidentDevice.info.id !== '') {
            apiType = 'PATCH'
        }

        ah.one({
            url: `${baseUrl}/api/soc/device`,
            data: JSON.stringify(incidentDevice.info),
            type: apiType,
            contentType: 'text/plain'
        })
            .then(data => {
                console.log('data == ', data);

                this.setState({
                    originalIncidentDeviceData: _.cloneDeep(incidentDevice)
                }, () => {
                    this.toggleContent('cancel');
                });

                return null;
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message);
            })
    };

    /**
     * Display filter content
     * @method
     * @returns HTML DOM
     */
    renderFilter = () => {
        const {showFilter, deviceSearch} = this.state;

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
                            onChange={this.handleDeviceSearch.bind(this, 'keyword')}
                            value={deviceSearch.keyword}/>
                    </div>
                </div>
                <div className='button-group'>
                    <button className='filter'
                            onClick={this.getDeviceData.bind(this, 'search')}>{t('txt-filter')}</button>
                    <button className='clear' onClick={this.clearFilter}>{t('txt-clear')}</button>
                </div>
            </div>
        )
    };

    /* ---- Func Space ---- */
    /**
     * Show Delete IncidentDevice dialog
     * @method
     * @param {object} allValue - IncidentDevice data
     */
    openDeleteMenu = (allValue) => {
        PopupDialog.prompt({
            title: t('edge-management.txt-deleteEdge'),
            id: 'modalWindowSmall',
            confirmText: t('txt-delete'),
            cancelText: t('txt-cancel'),
            display: this.getDeleteIncidentDeviceContent(allValue),
            act: (confirmed, data) => {
                if (confirmed) {
                    this.deleteEdge();
                }
            }
        });
    };

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
                <span>{t('txt-delete-msg')}: {allValue.deviceName || allValue.deviceId}?</span>
            </div>
        )
    };

    /**
     * Handle delete IncidentDevice confirm
     * @method
     */
    deleteEdge = () => {
        const {baseUrl} = this.context;
        const {currentIncidentDeviceData} = this.state;

        if (!currentIncidentDeviceData.id) {
            return;
        }

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
    };

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
    };

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
    };

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
     * Handle filter input data change
     * @method
     * @param {string} type - page type ('tableList', 'editEdge' and 'cancel')
     * @param {object} allValue - Edge data
     */
    toggleContent = (type, allValue) => {
        const {originalIncidentDeviceData, incidentDevice} = this.state;
        let tempIncidentDevice = {...incidentDevice};
        let showPage = type;

        if (type === 'viewDevice') {
            tempIncidentDevice.info = {
                id: allValue.id,
                deviceId: allValue.deviceId,
                deviceName: allValue.deviceName,
                unitOid: allValue.unitOid,
                unitName: allValue.unitName,
                unitLevel: allValue.unitLevel,
                frequency: allValue.frequency,
                protectType: allValue.protectType,
                protectTypeInfo: allValue.protectTypeInfo,
                note: allValue.note,
                updateDttm: allValue.updateDttm
            };
            this.setState({
                showFilter: false,
                // currentIncidentDeviceData:_.cloneDeep(tempIncidentDevice),
                originalIncidentDeviceData: _.cloneDeep(tempIncidentDevice)
            });
        } else if (type === 'addDevice') {
            tempIncidentDevice.info = {
                id: allValue.id,
                deviceId: allValue.deviceId,
                deviceName: allValue.deviceName,
                unitOid: allValue.unitOid,
                unitName: allValue.unitName,
                unitLevel: allValue.unitLevel,
                frequency: allValue.frequency,
                protectType: allValue.protectType,
                protectTypeInfo: allValue.protectTypeInfo,
                note: allValue.note,
                updateDttm: allValue.updateDttm
            };
            this.setState({
                showFilter: false,
                // currentIncidentDeviceData:_.cloneDeep(tempIncidentDevice),
                originalIncidentDeviceData: _.cloneDeep(tempIncidentDevice)
            });
        } else if (type === 'tableList') {
            tempIncidentDevice.info = _.cloneDeep(incidentDevice.info);
        } else if (type === 'cancel-add') {
            showPage = 'tableList';
            tempIncidentDevice = _.cloneDeep(originalIncidentDeviceData);
        } else if (type === 'cancel') {
            showPage = 'viewDevice';
            tempIncidentDevice = _.cloneDeep(originalIncidentDeviceData);
        }

        this.setState({
            activeContent: showPage,
            incidentDevice: tempIncidentDevice
        }, () => {
            if (type === 'tableList') {
                this.getDeviceData();
            }
        });
    };

    /**
     * Handle filter input data change
     * @method
     * @param {string} type - input type
     * @param {string} value - input value
     */
    handleDeviceSearch = (type, value) => {
        let tempDeviceSearch = {...this.state.deviceSearch};
        tempDeviceSearch[type] = value;

        this.setState({
            deviceSearch: tempDeviceSearch
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
            deviceSearch: {
                keyword: ''
            }
        });
    };

    /**
     * Handle Incident Device edit input data change
     * @method
     * @param {string} type - input type
     * @param {string} value - input value
     */
    handleDataChange = (type, value) => {
        let tempDevice = {...this.state.incidentDevice};
        tempDevice.info[type] = value;

        this.setState({
            incidentDevice: tempDevice
        });
    };

}

IncidentDevice.contextType = BaseDataContext;

IncidentDevice.propTypes = {
    // nodeBaseUrl: PropTypes.string.isRequired
};

export default IncidentDevice;
