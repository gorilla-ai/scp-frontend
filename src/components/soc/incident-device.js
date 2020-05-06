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
import {downloadWithForm} from "react-ui/build/src/utils/download";
import {Link} from "react-router-dom";
import Checkbox from "react-ui/build/src/components/checkbox";
import SelecTableContent from "../common/selectable-content";

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
            dataFromEdgeDevice: false,
            currentIncidentDeviceData: {},
            originalIncidentDeviceData: {},
            deviceSearch: {
                keyword: ''
            },
            unitList: [{
                value: '',
                text: ''
            }],
            sendCheck: {
                sendStatus: false,
            },
            healthStatistic: {
                dataFieldsArr: ['select', 'deviceId', 'deviceName', 'frequency', 'note', 'protectTypeInfo', 'incidentUnitDTO.name', 'incidentUnitDTO.level'],
                dataFields: {},
                dataContent: [],
                rowIdField: [],
                sort: {
                    field: 'deviceId',
                    desc: false
                },
                totalCount: 0,
                currentPage: 1,
                pageSize: 20,
                edgeItem: '',
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
                    updateDttm: ''
                }
            },
            incidentDevice: {
                dataFieldsArr: ['deviceId', 'deviceName', 'protectTypeInfo', 'incidentUnitDTO.name', 'incidentUnitDTO.level', 'frequency', 'updateDttm', '_menu'],
                dataFields: {},
                dataContent: [],
                sort: {
                    field: 'deviceId',
                    desc: false
                },
                totalCount: 0,
                currentPage: 1,
                pageSize: 20,
                edgeItem: '',
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
                    updateDttm: ''
                }
            }
        };

        this.ah = getInstance("chewbacca");
    }

    componentDidMount() {
        const {locale, sessionRights} = this.context;

        helper.getPrivilegesInfo(sessionRights, 'config', locale);

        this.getDeviceData();
        this.getUnitList();
        this.getSendCheck();
    }

    getSendCheck() {
        const {baseUrl, contextRoot} = this.context;
        let tempSendCheck = {...this.state.sendCheck};
        ah.one({
            url: `${baseUrl}/api/soc/device/_status`,
            type: 'GET'
        })
            .then(data => {
                if (data) {
                    tempSendCheck.sendStatus = data.rt
                    this.setState({
                        sendCheck: tempSendCheck
                    })
                }
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            });

    }

    /**
     * Get and set Incident Device table data
     * @method
     * @param {string} fromSearch - option for the 'search'
     */
    getDeviceData = (fromSearch) => {
        const {baseUrl, contextRoot} = this.context;
        const {deviceSearch, incidentDevice, edgeList} = this.state;
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

                    let usedDeviceIdList = [];
                    _.forEach(tempEdge.dataContent, deviceItem => {
                        let tmp = {
                            deviceId: deviceItem.deviceId
                        }
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


    /**
     * Set Incident Device table data before send to FTP
     * @method
     * @param {string} fromSearch - option for the 'search'
     */
    setupHealthStatisticData = (fromSearch) => {
        const {baseUrl, contextRoot} = this.context;
        const {deviceSearch, healthStatistic} = this.state;
        const url = `${baseUrl}/api/soc/device/_search?page=${healthStatistic.currentPage}&pageSize=${healthStatistic.pageSize}`;
        let data = {};

        if (deviceSearch.keyword) {
            data.keyword = deviceSearch.keyword;
        }

        helper.getAjaxData('POST', url, data)
            .then(data => {
                if (data) {

                    let tempStatistic = {...healthStatistic};
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
                            note: deviceItem.note
                        }
                        sendDeviceDateList.push(tempSend);
                        let tmp = {
                            deviceId: deviceItem.deviceId
                        }
                        usedDeviceIdList.push(tmp);
                    })

                    tempStatistic.usedDeviceIdList = usedDeviceIdList

                    this.setState({
                        usedDeviceIdList: usedDeviceIdList
                    });


                    tempStatistic.sendDataDeviceList = sendDeviceDateList;


                    let dataFields = {};
                    tempStatistic.dataFieldsArr.forEach(tempData => {
                        dataFields[tempData] = {
                            label: tempData === '_menu' ? '' : f(`incidentFields.${tempData}`),
                            sortable: this.checkSortable(tempData),
                            formatter: (value, allValue, i) => {

                                if (tempData === 'select') {
                                    return <Checkbox
                                        id={allValue.deviceId + '_che'}
                                        onChange={this.handleSendDataChange.bind(this, 'select', allValue.deviceId)}
                                        checked={value}
                                    />
                                }

                                if (tempData === 'frequency') {
                                    return <Input
                                        id={allValue.deviceId + '_fre'}
                                        onChange={this.handleSendDataChange.bind(this, "frequency", allValue.deviceId)}
                                        value={value}
                                        readOnly={!allValue.select}
                                    />
                                } else if (tempData === 'note') {
                                    return <Input
                                        id={allValue.deviceId + '_note'}
                                        onChange={this.handleSendDataChange.bind(this, "note", allValue.deviceId)}
                                        value={value}
                                        readOnly={!allValue.select}
                                    />
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
                        activeContent: "sendList",
                    });

                }
                return null;
            })
            .catch(err => {
                helper.showPopupMsg(t('txt-error'));
            });
    };

    getUnitList = () => {
        const {baseUrl, contextRoot} = this.context;
        const url = `${baseUrl}/api/soc/unit/_search`;
        let data = {};

        helper.getAjaxData('POST', url, data)
            .then(data => {
                if (data) {
                    let list = [];
                    _.forEach(data.rows, val => {
                        let tmp = {
                            value: val.id, text: val.name
                        };
                        list.push(tmp)
                    });
                    this.setState({
                        unitList: list
                    });

                }
                return null;
            })
            .catch(err => {
                helper.showPopupMsg(t('txt-error'), err);
            });
    };

    /* ------------------ View ------------------- */
    render() {
        const {activeContent, baseUrl, contextRoot, sendCheck, showFilter, incidentDevice, healthStatistic} = this.state;

        return (
            <div>

                <div className="sub-header">
                    <div className='secondary-btn-group right'>
                        <button className={cx('', {'active': showFilter})} onClick={this.toggleFilter} title={t('txt-filter')}><i className='fg fg-filter'/></button>

                        <button className='' onClick={this.getCSV_File} title={it('txt-exportHealthCsv')}><i className='fg fg-data-download'/></button>
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
                                {activeContent === 'tableList' &&
                                <span>{it('txt-autoSend')}</span>
                                }
                                {activeContent === 'tableList' &&
                                <Checkbox
                                    id='isDefault'
                                    onChange={this.handleStatusChange.bind(this, 'isDefault')}
                                    checked={sendCheck.sendStatus}
                                    disabled={activeContent === 'viewDevice'}/>
                                }

                                {activeContent === 'tableList' &&
                                <button className='standard btn list'
                                        onClick={this.openSendMenu.bind()}>{it('txt-sendHealthCsv')}</button>

                                }

                                {activeContent === 'viewDevice' &&
                                <button className='standard btn list'
                                        onClick={this.toggleContent.bind(this, 'tableList')}>{t('network-inventory.txt-backToList')}</button>
                                }
                                <button className='standard btn edit'
                                        onClick={this.toggleContent.bind(this, 'addDevice')}>{t('txt-add')}</button>

                                <Link to='/SCP/configuration/notifications'><button className='standard btn'>{t('notifications.txt-settings')}</button></Link>

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

                        {activeContent === 'sendList' &&
                        <div className='main-content'>

                            <header className='main-header'>{it('txt-incident-device')}</header>
                            <div className='content-header-btns'>

                                <button className='standard btn edit'
                                        onClick={this.sendCsvWithOnlineEditData.bind(this)}>{it('txt-send')}</button>
                                <button className='standard  btn edit'
                                        onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-cancel')}</button>
                            </div>

                            <SelecTableContent
                                dataTableData={healthStatistic.dataContent}
                                dataTableFields={healthStatistic.dataFields}
                                dataTableSort={healthStatistic.sort}
                                paginationTotalCount={healthStatistic.totalCount}
                                paginationPageSize={healthStatistic.pageSize}
                                paginationCurrentPage={healthStatistic.currentPage}
                                handleTableSort={this.handleTableSort}
                                paginationPageChange={this.handlePaginationChange.bind(this, 'currentPage')}
                                paginationDropDownChange={this.handlePaginationChange.bind(this, 'pageSize')}
                            />
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


    /**
     * Display edit IncidentDevice content
     * @method
     * @returns HTML DOM
     */
    displayEditDeviceContent = () => {
        const {activeContent, dataFromEdgeDevice, incidentDevice, unitList, edgeList} = this.state;
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
                        <label htmlFor='edgeDevice'>{it('device.txt-edgeDevice')}</label>
                        <DropDownList
                            id='edgeDevice'
                            required={false}
                            list={edgeList}
                            onChange={this.handleDataChange.bind(this, 'edgeDevice')}
                            value={incidentDevice.edgeItem}
                            readOnly={activeContent === 'viewDevice'}/>
                    </div>

                    <div className='group'>
                        <label htmlFor='deviceId'>{it('device.txt-id')}</label>
                        <Input
                            id='deviceId'
                            onChange={this.handleDataChange.bind(this, 'deviceId')}
                            value={incidentDevice.info.deviceId}
                            required={true}
                            readOnly={activeContent === 'viewDevice' || dataFromEdgeDevice}/>
                    </div>
                    <div className='group'>
                        <label htmlFor='deviceName'>{it('device.txt-name')}</label>
                        <Input
                            id='deviceName'
                            onChange={this.handleDataChange.bind(this, 'deviceName')}
                            value={incidentDevice.info.deviceName}
                            required={true}
                            readOnly={activeContent === 'viewDevice' || dataFromEdgeDevice}/>
                    </div>

                    <div className='group'>
                        <label htmlFor='deviceCompany'>{it('device.txt-company')}</label>
                        <Input
                            id='deviceCompany'
                            required={true}
                            onChange={this.handleDataChange.bind(this, 'deviceCompany')}
                            value={incidentDevice.info.deviceCompany}
                            readOnly={activeContent === 'viewDevice' || dataFromEdgeDevice}/>
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

                    <div className='group'>
                        <label htmlFor='unitId'>{it('unit.txt-name')}</label>
                        <DropDownList
                            id='unitId'
                            required={true}
                            list={unitList}
                            onChange={this.handleDataChange.bind(this, 'unitId')}
                            value={incidentDevice.info.unitId}
                            readOnly={activeContent === 'viewDevice'}/>
                    </div>

                    {/*{activeContent !== 'addDevice' &&*/}
                    {/*<div className='group'>*/}
                    {/*    <label htmlFor='frequency'>{it('txt-frequency')}</label>*/}
                    {/*    <Input*/}
                    {/*        id='frequency'*/}
                    {/*        onChange={this.handleDataChange.bind(this, 'frequency')}*/}
                    {/*        value={incidentDevice.info.frequency}*/}
                    {/*        readOnly={activeContent === 'viewDevice'}/>*/}
                    {/*</div>*/}
                    {/*}*/}
                    {activeContent !== 'addDevice' && incidentDevice.info.frequency === 0 &&
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


    /**
     * Handle IncidentDevice Edit confirm
     * @method
     */
    handleDeviceSubmit = () => {
        const {baseUrl} = this.context;
        const {incidentDevice} = this.state;
        let dataFromEdgeDevice = this.state.dataFromEdgeDevice;
        if (!this.checkAddData(incidentDevice)) {
            return
        }

        let apiType = 'POST';

        if (incidentDevice.info.id) {
            apiType = 'PATCH'
        }

        this.ah.one({
            url: `${baseUrl}/api/soc/device`,
            data: JSON.stringify(incidentDevice.info),
            type: apiType,
            contentType: 'text/plain'
        })
            .then(data => {
                incidentDevice.edgeItem = '';
                incidentDevice.edgeList = [];
                incidentDevice.info.updateDttm = data.updateDttm;
                dataFromEdgeDevice = false;
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
     *
     * @param incidentDevice
     * @returns {boolean}
     */
    checkAddData = (incidentDevice) => {

        if (!incidentDevice.info.unitId || !incidentDevice.info.deviceId || !incidentDevice.info.deviceCompany ||
            !incidentDevice.info.deviceName || !incidentDevice.info.protectType) {
            helper.showPopupMsg('', t('txt-error'), '[Unit],[Device ID],[Device Name] and [Device Type] is required');
            return false;
        }


        return true;
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
                <span>{t('txt-delete-msg')}: {allValue.deviceName + ': ID(' + allValue.deviceId + ')'} ?</span>
            </div>
        )
    };

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
        const {originalIncidentDeviceData, incidentDevice, edgeList} = this.state;
        let tempIncidentDevice = {...incidentDevice};
        let dataFromEdgeDevice = this.state.dataFromEdgeDevice;
        let showPage = type;
        this.getOptions()

        if (type === 'viewDevice') {
            _.forEach(edgeList, val => {
                if (val.agentId === allValue.deviceId) {
                    tempIncidentDevice.edgeItem = allValue.deviceId
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
                updateDttm: allValue.updateDttm
            };
            this.setState({
                showFilter: false,
                // currentIncidentDeviceData:_.cloneDeep(tempIncidentDevice),
                originalIncidentDeviceData: _.cloneDeep(tempIncidentDevice)
            });
        } else if (type === 'addDevice') {
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
            dataFromEdgeDevice = false;
            tempIncidentDevice = _.cloneDeep(originalIncidentDeviceData);
        } else if (type === 'cancel') {
            showPage = 'viewDevice';
            dataFromEdgeDevice = false;
            tempIncidentDevice = _.cloneDeep(originalIncidentDeviceData);
        }

        this.setState({
            activeContent: showPage,
            incidentDevice: tempIncidentDevice,
            dataFromEdgeDevice: dataFromEdgeDevice
        }, () => {
            if (type === 'tableList') {
                this.getDeviceData();
            }
        });
    };

    /**
     * Call API Send csv to NCCST with real data
     */
    sendCsv = () => {
        const {baseUrl} = this.context;

        ah.one({
            url: `${baseUrl}/api/soc/device/_send`,
            data: JSON.stringify({}),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
            .then(data => {
                helper.showPopupMsg(it('txt-send-success'), it('txt-send'));
                this.setState({
                    activeContent: "tableList",
                }, () => {
                    this.getDeviceData();
                });
            })
            .catch(err => {
                helper.showPopupMsg(it('txt-send-fail'), it('txt-send'));
            })
    };

    /**
     * Send edit CSV data to backend
     */
    sendCsvWithOnlineEditData = () => {
        const {baseUrl} = this.context;
        let tempList = {...this.state.healthStatistic.dataContent}

        let sendList = []
        _.forEach(tempList, sendTemp => {
            let tmp = {
                id: sendTemp.id,
                select: sendTemp.select,
                frequency: sendTemp.frequency,
                note: sendTemp.note
            }
            sendList.push(tmp)
        })

        ah.one({
            url: `${baseUrl}/api/soc/device/_sendV2`,
            data: JSON.stringify(sendList),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
            .then(data => {
                helper.showPopupMsg(it('txt-send-success'), it('txt-send'));
                // this.setState({
                //     activeContent: "tableList",
                // }, () => {
                //     this.getDeviceData();
                // });
            })
            .catch(err => {
                helper.showPopupMsg(it('txt-send-fail'), it('txt-send'));
            })
    };


    /**
     * Show Delete IncidentDevice dialog
     * @method
     * @param {object} allValue - IncidentDevice data
     */
    openSendMenu = () => {
        this.setupHealthStatisticData();
        // PopupDialog.prompt({
        //     title: it('txt-send'),
        //     id: 'modalWindowSmall',
        //     confirmText: it('txt-send'),
        //     cancelText: t('txt-cancel'),
        //     display: <div className='content delete'>
        //         <span>{it('txt-sendCheckHealth')}</span>
        //     </div>,
        //     act: (confirmed) => {
        //         if (confirmed) {
        //             this.sendCsv()
        //         }
        //     }
        // })
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
        let edgeItemList = {...this.state.edgeList};
        let dataFromEdgeDevice = this.state.dataFromEdgeDevice;
        if (type === 'edgeDevice') {
            tempDevice.edgeItem = value;
            _.forEach(edgeItemList, val => {
                if (val.agentId === value) {
                    tempDevice.info.deviceId = val.agentId
                    tempDevice.info.deviceName = val.agentName
                    tempDevice.info.deviceCompany = val.agentCompany
                } else {
                    tempDevice.info.deviceId = ''
                    tempDevice.info.deviceName = ''
                    tempDevice.info.deviceCompany = ''
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
    };

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
                    tempSendDevice.info.deviceId = val.agentId
                    tempSendDevice.info.deviceName = val.agentName
                    tempSendDevice.info.deviceCompany = val.agentCompany
                } else {
                    tempSendDevice.info.deviceId = ''
                    tempSendDevice.info.deviceName = ''
                    tempSendDevice.info.deviceCompany = ''
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
                        data.frequency = value
                    } else if (type === 'note') {
                        data.note = value
                    } else if (type === 'select') {
                        data.select = value;
                    }
                }

            })

            // tempSendDevice.info[type] = value;
            this.setState({
                healthStatistic: tempSendDevice
            });
        }


    };


    /**
     * Handle Incident Device edit checkBox data change
     * @method
     * @param {string} type - input type
     * @param {string} value - input value
     */
    handleStatusChange = (type, value) => {
        let tempSendCheck = {...this.state.sendCheck};
        const {baseUrl, contextRoot} = this.context;

        tempSendCheck.sendStatus = !this.state.sendCheck.sendStatus;


        ah.one({
            url: `${baseUrl}/api/soc/device/_override`,
            data: JSON.stringify(tempSendCheck),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
            .then(data => {
                if (data) {
                    tempSendCheck.sendStatus = data.rt
                    this.setState({
                        sendCheck: tempSendCheck
                    })
                }
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            });
    };

    /**
     * Handle CSV download
     * @method
     */
    getCSV_File = () => {
        const {baseUrl, contextRoot} = this.context;
        const url = `${baseUrl}${contextRoot}/api/soc/device/_export`;
        let requestData = {
            "columns": []
        };
        downloadWithForm(url, {payload: JSON.stringify(requestData)});
    }

    getOptions = () => {
        const {baseUrl, contextRoot} = this.context;
        let usedDeviceIdList = {...this.state.usedDeviceIdList}

        ah.one({
            url: `${baseUrl}/api/edge/_search`,
            data: JSON.stringify({}),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        })
            .then(data => {
                if (data) {
                    let edgeList = [];


                    let lookup = _.keyBy(usedDeviceIdList, function (o) {
                        return o.deviceId
                    });

                    let result = _.filter(data.rt.rows, function (u) {
                        return lookup[u.agentId] === undefined;
                    });

                    _.forEach(result, val => {
                        let edge = {
                            text: val.agentName,
                            value: val.agentId,
                            agentName: val.agentName,
                            agentId: val.agentId,
                            agentCompany: 'NSGUARD'
                        }
                        edgeList.push(edge)
                    })

                    this.setState({
                        edgeList: edgeList,
                    });
                }
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            });
    }
}

IncidentDevice.contextType = BaseDataContext;

IncidentDevice.propTypes = {
    // nodeBaseUrl: PropTypes.string.isRequired
};

export default IncidentDevice;
