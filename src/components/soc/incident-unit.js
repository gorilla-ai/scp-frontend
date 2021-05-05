import React, {Component} from "react";

import {default as ah, getInstance} from "react-ui/build/src/utils/ajax-helper";
import {BaseDataContext} from "../common/context";
import SocConfig from "../common/soc-configuration";
import helper from "../common/helper";
import cx from "classnames";
import PopupDialog from "react-ui/build/src/components/popup-dialog";
import TableContent from "../common/table-content";
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import _ from "lodash";
import Autocomplete from "@material-ui/lab/Autocomplete";
import constants from "../constant/constant-incidnet";
import 'react-sortable-tree/style.css';
import SortableTree from 'react-sortable-tree';

import ModalDialog from "react-ui/build/src/components/modal-dialog";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
// import FileExplorerTheme from 'react-sortable-tree-theme-full-node-drag';

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
class IncidentUnit extends Component {
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
            unitSearch: {
                keyword: '',
                industryType: ''
            },
            accountListOptions: [],
            accountType:constants.soc.LIMIT_ACCOUNT,
            incidentUnit: {
                dataFieldsArr: ['isDefault','isGovernment', 'oid', 'name', 'abbreviation', 'level', 'industryType', '_menu'],
                dataFields: {},
                dataContent: [],
                sort: {
                    field: 'isDefault',
                    desc: true
                },
                totalCount: 0,
                currentPage: 1,
                pageSize: 20,
                info: {
                    id: '',
                    oid: '',
                    name: '',
                    level: 'A',
                    industryType: '0',
                    isUse: false,
                    isDefault: false,
                    isGovernment:false,
                    abbreviation: '',
                    relatedAccountList: []
                }
            },
            isOrganizationDialogOpen: false,
            treeData: [],
            treeObj: {}
        };

        this.ah = getInstance("chewbacca");
    }

    componentDidMount() {
        const {locale, sessionRights} = this.context;

        helper.getPrivilegesInfo(sessionRights, 'soc', locale);

        this.checkAccountType();

        this.getOptions();

        this.checkUnitOrg();

    }


    getData = () => {
        const {baseUrl, contextRoot} = this.context;
        const {unitSearch, incidentUnit: incidentUnit} = this.state;
        const url = `${baseUrl}/api/soc/unit/_search`;
        let requestData = {};

        if (unitSearch.keyword) {
            requestData.keyword = unitSearch.keyword;
        }
        if (unitSearch.industryType) {
            requestData.industryType = unitSearch.industryType;
        }

        this.ah.one({
            url,
            data: JSON.stringify(requestData),
            type: 'POST',
            contentType: 'text/plain'
        })
        .then(data => {
            if (data) {
                let tempEdge = {...incidentUnit};
                tempEdge.dataContent = data.rows;
                tempEdge.totalCount = data.counts;

                let dataFields = {};
                incidentUnit.dataFieldsArr.forEach(tempData => {
                    dataFields[tempData] = {
                        label: tempData === '_menu' ? ' ' : f(`incidentFields.${tempData}`),
                        sortable: this.checkSortable(tempData),
                        formatter: (value, allValue, i) => {
                            if (tempData === 'industryType') {
                                return <span>{this.mappingType(value)}</span>
                            } else if (tempData === 'updateDttm') {
                                return <span>{helper.getFormattedDate(value, 'local')}</span>
                            } else if (tempData === 'isDefault') {

                                if (value){
                                    return <span style={{color:'#f13a56'}}>{this.checkDefault(value)}</span>
                                }else {
                                    return <span>{this.checkDefault(value)}</span>
                                }

                            }
                            else if (tempData === 'isGovernment') {

                                if (value){
                                    return <span style={{color:'#f13a56'}}>{this.checkDefault(value)}</span>
                                }else {
                                    return <span>{this.checkDefault(value)}</span>
                                }

                            }
                            else if (tempData === '_menu') {
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
                    incidentUnit: tempEdge
                });
            }
            return null;
        })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message);
            })
    };


    checkDefault = (value) => {
        let info = it('unit.txt-isNotDefault');
        if (value) {
            info = it('unit.txt-isDefault')
        }
        return info;
    };

    checkUnitOrg = () => {
        const {baseUrl, session} = this.context;
        this.ah.one({
            url: `${baseUrl}/api/soc/unit/_getOrganization`,
            type: 'GET'
        })
            .then(data => {
                let jsonData = JSON.parse(data);
                this.setState({
                    treeData: jsonData.children,
                    treeObj: jsonData
                })

            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message);
            })
    }

    checkAccountType = () => {
        const {baseUrl, session} = this.context;

        let requestData = {
            account: session.accountId
        }
        ah.one({
            url: `${baseUrl}/api/soc/unit/limit/_check`,
            data: JSON.stringify(requestData),
            type: 'POST',
            contentType: 'text/plain'
        })
            .then(data => {
                if (data) {
                    const {incidentUnit} = this.state;
                    let tempUnitObj = incidentUnit;

                    if (data.rt.isLimitType === constants.soc.LIMIT_ACCOUNT) {
                        tempUnitObj.dataFieldsArr = ['isGovernment','oid', 'name', 'abbreviation', 'level', 'industryType'];
                        this.setState({
                            accountType: constants.soc.LIMIT_ACCOUNT,
                            incidentUnit: tempUnitObj
                        }, () => {
                            this.getData();
                        })
                    } else if (data.rt.isLimitType === constants.soc.NONE_LIMIT_ACCOUNT) {
                        this.setState({
                            accountType: constants.soc.NONE_LIMIT_ACCOUNT,
                        }, () => {
                            this.getData();
                        })
                    } else {
                        this.setState({
                            accountType: constants.soc.CHECK_ERROR
                        }, () => {
                            this.getData();
                        })
                    }
                }
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message)
            });
    }

    getOptions = () => {
        const {baseUrl} = this.context;
        const {userAccount} = this.state;
        const sort = 'desc';
        const url = `${baseUrl}/api/account/v2/_search?page=1&pageSize=100000&orders=account ${sort}`;
        let requestData = {};


        this.ah.one({
            url,
            data: JSON.stringify(requestData),
            type: 'POST',
            contentType: 'application/json'
        })
            .then(data => {
                if (data) {
                    let list = _.map(data.rows, val => {
                        return {
                            value: val.accountid,
                            text: val.account + ' (' + val.name + ')'
                        }
                    });

                    this.setState({
                        accountListOptions: list
                    });
                }
                return null;
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message);
            })
    };


    mappingType = (value) => {
        let info = '';
        switch (value) {
            case 0:
                info = "能源";
                break;
            case 1:
                info = "水資源";
                break;
            case 2:
                info = "通訊傳播";
                break;
            case 3:
                info = "交通";
                break;
            case 4:
                info = "金融";
                break;
            case 5:
                info = "緊急救援及醫院";
                break;
            case 6:
                info = "中央及地方政府";
                break;
            case 7:
                info = "科學園區與工業區";
                break;
            case 8:
                info = "臺北區域聯防中心";
                break;
            case 9:
                info = "新北區域聯防中心";
                break;
            case 10:
                info = "桃園區域聯防中心";
                break;
            case 11:
                info = "臺中區域聯防中心";
                break;
            case 12:
                info = "臺南區域聯防中心";
                break;
            case 13:
                info = "高雄區域聯防中心";
                break;
        }
        return info;
    };

    /* ------------------ View ------------------- */
    render() {
        const {
            activeContent,
            baseUrl,
            contextRoot,
            showFilter,
            incidentUnit: incidentUnit,
            accountType,
            isOrganizationDialogOpen,
            treeData,
            treeObj
        } = this.state;
        const {session} = this.context;

        const actions = {
            cancel: {text: t('txt-cancel'), className: 'standard', handler: this.closeODialog},
            confirm: {text: t('txt-confirm'), handler: this.handleUnitTreeConfirm}
        };

        return (
            <div>

                <div className="sub-header">
                    <div className='secondary-btn-group right'>
                        <button className={cx('last', {'active': showFilter})} onClick={this.toggleFilter}
                                title={t('txt-filter')}><i className='fg fg-filter'/></button>
                    </div>
                </div>

                {isOrganizationDialogOpen &&
                <ModalDialog
                    id='addUnitDialog'
                    className='modal-dialog'
                    title={t('txt-setOrganization') + '-' + t('txt-defaultUnit') + ' : ' + treeObj.title}
                    draggable={true}
                    global={true}
                    actions={actions}
                    closeAction='cancel'>

                    <div style={{width: '890px', height: '630px'}}>
                        <SortableTree
                            treeData={treeData}
                            onChange={treeData => this.setState({treeData: treeData})}
                        />
                    </div>
                </ModalDialog>
                }


                <div className='data-content'>
                    <SocConfig baseUrl={baseUrl} contextRoot={contextRoot} session={session} accountType={accountType}/>

                    <div className='parent-content'>
                        {this.renderFilter()}

                        {activeContent === 'tableList' &&
                        <div className='main-content'>
                            <header className='main-header'>{it('txt-incident-unit')}</header>
                            <div className='content-header-btns'>
                                {activeContent === 'viewDevice' &&
                                    <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>
                                }
                                <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'addDevice')}>{t('txt-add')}</Button>
                            </div>
                            <TableContent
                                dataTableData={incidentUnit.dataContent}
                                dataTableFields={incidentUnit.dataFields}
                                dataTableSort={incidentUnit.sort}
                                paginationTotalCount={incidentUnit.totalCount}
                                paginationPageSize={incidentUnit.pageSize}
                                paginationCurrentPage={incidentUnit.currentPage}
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

    openODialog = () => {
        this.setState({
            isOrganizationDialogOpen: true
        })
    }

    closeODialog = () => {
        this.setState({
            isOrganizationDialogOpen: false
        })
    }

    handleUnitTreeConfirm = () =>{
        const {treeData, treeObj} = this.state;
        const {baseUrl} = this.context;
        let tempUnitTree = treeObj
        tempUnitTree.children = treeData

        this.ah.one({
            url: `${baseUrl}/api/soc/unit/_overrideOrganization`,
            data: JSON.stringify(tempUnitTree),
            type: 'POST',
            contentType: 'text/plain'
        }).then(data => {
            if(data){
                helper.showPopupMsg('', t('txt-error'),t('txt-update')+t('txt-success'));
            }
        }).catch(err => {
            helper.showPopupMsg('', t('txt-error'),t('txt-update')+t('txt-fail'));
        })

    }

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
            this.getData();
        });
    };

    /**
     * Display edit incidentUnit content
     * @method
     * @returns HTML DOM
     */
    displayEditDeviceContent = () => {
        const {activeContent, incidentUnit, accountType} = this.state;
        return (
            <div className='main-content basic-form'>
                <header className='main-header'>{it('txt-incident-unit')}</header>

                <div className='content-header-btns'>
                    {activeContent === 'viewDevice' &&
                    <Button variant='outlined' color='primary' className='standard btn edit'
                            onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>
                    }
                    {activeContent !== 'addDevice' && activeContent !== 'editDevice' &&
                    <Button variant='outlined' color='primary' className='standard btn edit'
                            onClick={this.toggleContent.bind(this, 'editDevice')}>{t('txt-edit')}</Button>
                    }
                    {activeContent === 'viewDevice' && incidentUnit.info.isDefault && accountType === constants.soc.NONE_LIMIT_ACCOUNT &&
                    <Button variant='outlined' color='primary' className='standard btn edit'
                            onClick={this.openODialog.bind(this)}>{t('txt-setOrganization')}</Button>
                    }
                </div>

                <div className='form-group normal'>
                    <header>
                        <div className='text'>{t('edge-management.txt-basicInfo')}</div>
                    </header>

                    <div className='group'>
                        <label htmlFor='oid'>{it('unit.txt-oid')}</label>
                        <TextField
                            id='oid'
                            name='oid'
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            required
                            error={!(incidentUnit.info.oid || '').trim()}
                            helperText={it('txt-required')}
                            onChange={this.handleDataChangeMui}
                            value={incidentUnit.info.oid}
                            disabled={activeContent === 'viewDevice'}/>
                    </div>
                    <div className='group'>
                        <label htmlFor='name'>{it('unit.txt-name')}</label>
                        <TextField
                            id='name'
                            name='name'
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            required
                            error={!(incidentUnit.info.name || '').trim()}
                            helperText={it('txt-required')}
                            onChange={this.handleDataChangeMui}
                            value={incidentUnit.info.name}
                            disabled={activeContent === 'viewDevice'}/>
                    </div>
                    <div className='group'>
                        <label htmlFor='abbreviation'>{it('unit.txt-abbreviation')}</label>
                        <TextField
                            id='abbreviation'
                            name='abbreviation'
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            required
                            error={!(incidentUnit.info.abbreviation || '').trim()}
                            helperText={it('txt-required')}
                            onChange={this.handleDataChangeMui}
                            value={incidentUnit.info.abbreviation}
                            disabled={activeContent === 'viewDevice'}/>
                    </div>

                    <div className='group'>
                        <label htmlFor='level'>{it('unit.txt-level')}</label>
                        <TextField
                            id='level'
                            name='level'
                            required
                            error={!(incidentUnit.info.level || '').trim()}
                            helperText={it('txt-required')}
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            select
                            onChange={this.handleDataChangeMui}
                            value={incidentUnit.info.level}
                            disabled={activeContent === 'viewDevice'}>
                            {
                                _.map([
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
                                ],el =>{
                                    return <MenuItem value={el.value}>{el.text}</MenuItem>
                                })
                            }
                        </TextField>
                    </div>

                    <div className='group'>
                        <label htmlFor='industryType'>{it('unit.txt-type')}</label>
                        <TextField
                            id='industryType'
                            name='industryType'
                            required
                            helperText={it('txt-required')}
                            error={!(incidentUnit.info.industryType || '')}
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            select
                            onChange={this.handleDataChangeMui}
                            value={incidentUnit.info.industryType}
                            disabled={activeContent === 'viewDevice'}>
                            {_.map(_.range(0, 14), el => {
                                return <MenuItem value={el.toString()}>{it(`industryType.${el}`)}</MenuItem>
                            })}
                        </TextField>
                    </div>

                    <div className='group'  style={{width: '25%'}}>
                        <label htmlFor='isDefault' className='checkbox'>{it('unit.txt-default')}</label>
                        <FormControlLabel
                            className='switch-control'
                            control={
                                <Switch
                                    checked={incidentUnit.info.isDefault}
                                    onChange={(event) => this.handleChange('isDefault', event.target.checked)}
                                    color='primary' />
                            }
                            label={t('txt-switch')}
                            disabled={activeContent === 'viewDevice'}
                        />
                    </div>
                    <div className='group' style={{width: '25%'}}>
                        <label htmlFor='isDefault' className='checkbox'>{it('unit.txt-government')}</label>
                        <FormControlLabel
                            className='switch-control'
                            control={
                                <Switch
                                    checked={incidentUnit.info.isGovernment}
                                    onChange={(event) => this.handleChange('isGovernment', event.target.checked)}
                                    color='primary' />
                            }
                            label={t('txt-switch')}
                            disabled={activeContent === 'viewDevice'}
                        />
                    </div>
                    <div className='group full'>
                        <label htmlFor='accountListOptions'>{f('incidentFields.relatedAccountList')}</label>
                        <Autocomplete
                            multiple
                            id="tags-standard"
                            size='small'
                            options={incidentUnit.info.differenceWithOptions}
                            getOptionLabel={(option) => option.text}
                            value={incidentUnit.info.showFontendRelatedList}
                            onChange={this.onTagsChange}
                            disabled={activeContent === 'viewDevice'}
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
                </div>

                {activeContent === 'editDevice' &&
                <footer>
                    <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, 'cancel')}>{t('txt-cancel')}</Button>
                    <Button variant='contained' color='primary' onClick={this.handleUnitSubmit}>{t('txt-save')}</Button>
                </footer>
                }
                {activeContent === 'addDevice' &&
                <footer>
                    <Button variant='outlined' color='primary' className='standard'
                            onClick={this.toggleContent.bind(this, 'cancel-add')}>{t('txt-cancel')}</Button>
                    <Button variant='contained' color='primary' onClick={this.handleUnitSubmit}>{t('txt-save')}</Button>
                </footer>
                }
            </div>
        )
    };

    onTagsChange = (event, values) => {
        let temp = {...this.state.incidentUnit};
        temp.info['showFontendRelatedList'] = values;
        this.setState({
            incidentUnit: temp
        })
    }

    /**
     * Handle IncidentUnit Edit confirm
     * @method
     */
    handleUnitSubmit = () => {
        const {baseUrl} = this.context;
        let tmpIncidentUnit = {...this.state.incidentUnit};
        if (!this.checkAddData(tmpIncidentUnit)) {
            return
        }

        tmpIncidentUnit.info.industryType = tmpIncidentUnit.info.industryType.toString()

        if (tmpIncidentUnit.info.showFontendRelatedList) {
            tmpIncidentUnit.info.relatedAccountList = _.map(tmpIncidentUnit.info.showFontendRelatedList, el => {
                return {relatedAccountId: el.value}
            })
        }


        let apiType = 'POST';
        if (tmpIncidentUnit.info.id) {
            apiType = 'PATCH'
        }

        ah.one({
            url: `${baseUrl}/api/soc/unit`,
            data: JSON.stringify(tmpIncidentUnit.info),
            type: apiType,
            contentType: 'text/plain'
        })
            .then(data => {
                tmpIncidentUnit.info.id = data.rt.id;
                tmpIncidentUnit.info.isUse = data.rt.isUse;
                tmpIncidentUnit.info.isDefault = data.rt.isDefault;

                this.setState({
                    originalIncidentDeviceData: _.cloneDeep(tmpIncidentUnit)
                }, () => {
                    this.toggleContent('cancel');
                });
                return null;
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), it('unit.txt-exists'));
            })
    };

    checkAddData = (incidentUnit) => {



        if (!incidentUnit.info.oid ||
            !incidentUnit.info.name||
            !incidentUnit.info.abbreviation) {
            // helper.showPopupMsg('', t('txt-error'), '[Unit OID],[Unit Name], and [Unit Abbreviation] is required');
            helper.showPopupMsg('', t('txt-error'), it('txt-validUnit'));
            return false;
        }

        if (!incidentUnit.info.level){
            // helper.showPopupMsg('', t('txt-error'), '[Unit Level] is required');
            helper.showPopupMsg('', t('txt-error'), it('txt-validUnit'));
        }

        if (incidentUnit.info.industryType.toString() === ''){
            // helper.showPopupMsg('', t('txt-error'), '[Unit Industry] is required');
            helper.showPopupMsg('', t('txt-error'), it('txt-validUnit'));
        }

        if (!incidentUnit.info.isDefault) {
            incidentUnit.info.isDefault = false;
            this.setState({
                incidentUnit: incidentUnit
            });
        }


        return true;
    };

    /**
     * Display filter content
     * @method
     * @returns HTML DOM
     */
    renderFilter = () => {
        const {showFilter, unitSearch} = this.state;

        return (
            <div className={cx('main-filter', {'active': showFilter})}>
                <i className='fg fg-close' onClick={this.toggleFilter} title={t('txt-close')}/>
                <div className='header-text'>{t('txt-filter')}</div>
                <div className='filter-section config'>
                    <div className='group'>
                        <TextField
                            id='keyword'
                            name='keyword'
                            label={f('incidentFields.keywords')}
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            className='search-textarea'
                            value={unitSearch.keyword}
                            onChange={this.handleUnitInputSearchMui}/>
                    </div>
                    <div className='group'>
                        <TextField
                            id='industryType'
                            name='industryType'
                            select
                            label={f('incidentFields.industryType')}
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            value={unitSearch.industryType}
                            onChange={this.handleUnitInputSearchMui}>
                            {_.map(_.range(0, 14), el => {
                                return <MenuItem value={el.toString()}>{it(`industryType.${el}`)}</MenuItem>
                            })}
                        </TextField>

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
     * Show Delete IncidentDevice dialog
     * @method
     * @param {object} allValue - IncidentDevice data
     */
    openDeleteMenu = (allValue) => {

        if (allValue.isDefault){
            helper.showPopupMsg('', t('txt-fail'), it('unit.txt-defaultDelete'));
            return;
        }


        PopupDialog.prompt({
            title: t('txt-delete'),
            id: 'modalWindowSmall',
            confirmText: t('txt-delete'),
            cancelText: t('txt-cancel'),
            display: this.getDeleteIncidentDeviceContent(allValue),
            act: (confirmed, data) => {
                if (confirmed) {
                    this.deleteUnit();
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
                <span>{t('txt-delete-msg')}:{allValue.name} ?</span>
            </div>
        )
    };

    /**
     * Handle delete IncidentDevice confirm
     * @method
     */
    deleteUnit = () => {
        const {baseUrl} = this.context;
        const {currentIncidentDeviceData} = this.state;

        if (!currentIncidentDeviceData.id) {
            return;
        }

        ah.one({
            url: `${baseUrl}/api/soc/unit?id=${currentIncidentDeviceData.id}`,
            type: 'DELETE'
        })
            .then(data => {
                if (data.ret === 0) {
                    this.getData();
                }else if (data.ret === -1004) {
                    // this.getData();
                    helper.showPopupMsg('', t('txt-error'),it('unit.txt-existDevice'));
                }
                return null;
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message);
            })
    };

    /**
     * Handle table sort
     * @method
     * @param {object} sort - sort data object
     */
    handleTableSort = (sort) => {
        let tempDevice = {...this.state.incidentUnit};
        tempDevice.sort.field = sort.field;
        tempDevice.sort.desc = sort.desc;

        this.setState({
            incidentUnit: tempDevice
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
        const {originalIncidentDeviceData, incidentUnit, accountListOptions} = this.state;
        let tempIncidentDevice = {...incidentUnit};
        let showPage = type;

        if (type === 'viewDevice') {
            tempIncidentDevice.info = {
                id: allValue.id,
                oid: allValue.oid,
                name: allValue.name,
                level: allValue.level,
                isUse: allValue.isUse,
                isDefault: allValue.isDefault,
                isGovernment:allValue.isGovernment,
                industryType: allValue.industryType,
                abbreviation: allValue.abbreviation,
                relatedAccountList: allValue.relatedAccountList
            };

            if (tempIncidentDevice.info.relatedAccountList) {
                tempIncidentDevice.info.accountList = _.map(tempIncidentDevice.info.relatedAccountList, el => {
                    let obj = {
                        value: el.relatedAccountId,
                        text: el.relatedAccountId
                    }
                    return obj
                })
            }


            let result = _.map(tempIncidentDevice.info.accountList, function (obj) {
                return _.assign(obj, _.find(accountListOptions, {value: obj.value}));
            });

            tempIncidentDevice.info.differenceWithOptions = _.differenceWith(accountListOptions, tempIncidentDevice.info.accountList, function (p, o) {
                return p.value === o.value
            })
            tempIncidentDevice.info.showFontendRelatedList = result


            this.setState({
                showFilter: false,
                // currentIncidentDeviceData:_.cloneDeep(tempIncidentDevice),
                originalIncidentDeviceData: _.cloneDeep(tempIncidentDevice)
            });
        } else if (type === 'addDevice') {
            tempIncidentDevice.info = {
                id: allValue.id,
                oid: allValue.oid,
                name: allValue.name,
                level: allValue.level,
                isUse: allValue.isUse,
                isGovernment:allValue.isGovernment,
                isDefault: allValue.isDefault,
                industryType: allValue.industryType,
                abbreviation: allValue.abbreviation,
                relatedAccountList: allValue.relatedAccountList
            };

            if (tempIncidentDevice.info.relatedAccountList) {
                tempIncidentDevice.info.accountList = _.map(tempIncidentDevice.info.relatedAccountList, el => {
                    let obj = {
                        value: el.relatedAccountId,
                        text: el.relatedAccountId
                    }
                    return obj
                })
            }

            let result = _.map(tempIncidentDevice.info.accountList, function (obj) {
                return _.assign(obj, _.find(accountListOptions, {value: obj.value}));
            });

            tempIncidentDevice.info.differenceWithOptions = _.differenceWith(accountListOptions, tempIncidentDevice.info.accountList, function (p, o) {
                return p.value === o.value
            })
            tempIncidentDevice.info.showFontendRelatedList = result


            this.setState({
                showFilter: false,
                // currentIncidentDeviceData:_.cloneDeep(tempIncidentDevice),
                originalIncidentDeviceData: _.cloneDeep(tempIncidentDevice)
            });
        } else if (type === 'tableList') {
            tempIncidentDevice.info = _.cloneDeep(incidentUnit.info);
        } else if (type === 'cancel-add') {
            showPage = 'tableList';
            tempIncidentDevice = _.cloneDeep(originalIncidentDeviceData);
        } else if (type === 'cancel') {
            showPage = 'viewDevice';
            tempIncidentDevice = _.cloneDeep(originalIncidentDeviceData);
        }

        this.setState({
            activeContent: showPage,
            incidentUnit: tempIncidentDevice
        }, () => {
            if (type === 'tableList') {
                this.getData();
            }
        });
    };

    /**
     * Handle filter input data change
     * @method
     * @param {string} type - input type
     * @param {object} event - input value
     */
    handleUnitInputSearch = (type, event) => {
        let tempUnitSearch = {...this.state.unitSearch};
        tempUnitSearch[type] = event.target.value.trim();

        this.setState({
            unitSearch: tempUnitSearch
        });
    };

    /**
     * Handle filter input data change
     * @method
     * @param {string} type - input type
     * @param {object} event - input value
     */
    handleUnitInputSearchMui = (event) => {
        let tempUnitSearch = {...this.state.unitSearch};
        tempUnitSearch[event.target.name] = event.target.value.trim();

        this.setState({
            unitSearch: tempUnitSearch
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
            unitSearch: {
                keyword: '',
                industryType: ''
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
        let tempDevice = {...this.state.incidentUnit};
        tempDevice.info[type] = value;

        this.setState({
            incidentUnit: tempDevice
        });
    };

    handleDataChangeMuiCheck = (event) => {
        let tempDevice = {...this.state.incidentUnit};
        tempDevice.info[event.target.name] = event.target.checked;

        this.setState({
            incidentUnit: tempDevice
        });
    };

    handleChange(field, value) {
        let tempDevice = {...this.state.incidentUnit};

        tempDevice.info[field] = value
        this.setState({
            incidentUnit: tempDevice
        });
    }

    /**
     * Handle Incident Device edit input data change
     * @method
     * @param {string} type - input type
     * @param {string} value - input value
     */
    handleDataChangeMui = (event) => {
        let tempDevice = {...this.state.incidentUnit};
        tempDevice.info[event.target.name] = event.target.value;

        this.setState({
            incidentUnit: tempDevice
        });
    };
}

IncidentUnit.contextType = BaseDataContext;

IncidentUnit.propTypes = {
    // nodeBaseUrl: PropTypes.string.isRequired
};

export default IncidentUnit;
