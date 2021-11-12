import React, {Component} from "react";

import {default as ah, getInstance} from "react-ui/build/src/utils/ajax-helper";
import {BaseDataContext} from "../common/context";
import SocConfig from "../common/soc-configuration";
import helper from "../common/helper";
import cx from "classnames";
import moment from "moment";
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";
import constants from "../constant/constant-incidnet";
import _ from "lodash";
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import MuiTableContentWithoutLoading from "../common/mui-table-content-withoutloading";

let t = null;
let f = null;
let et = null;
let it = null;

const ALERT_LEVEL_COLORS = {
    Emergency: '#CC2943',
    Alert: '#CC7B29',
    Critical: '#29B0CC',
    Warning: '#29CC7A',
    Notice: '#7ACC29'
};
const SEVERITY_TYPE = ['Emergency', 'Alert', 'Critical', 'Warning', 'Notice'];


/**
 * Settings - IncidentFlow
 * @class
 * @author Kenneth Chiao <kennethchiao@ns-guard.com>
 * @summary A react component to show the IncidentFlow page
 */
class IncidentFlow extends Component {
    constructor(props) {
        super(props);

        t = global.chewbaccaI18n.getFixedT(null, "connections");
        f = global.chewbaccaI18n.getFixedT(null, "tableFields");
        et = global.chewbaccaI18n.getFixedT(null, "errors");
        it = global.chewbaccaI18n.getFixedT(null, "incident");

        this.state = {
            activeContent: 'tableList', //tableList, view, edit
            showFilter: false,
            searchParam: {
                keyword: '',
            },
            accountType: constants.soc.LIMIT_ACCOUNT,
            severityList: [],
            flowList: [],
            stepList:[],
            stepListObj:[],
            originalData: {},
            formValidation: {
                name: {
                    valid: true,
                    msg: ''
                },
                severity: {
                    valid: true,
                    msg: ''
                },
                flowId: {
                    valid: true,
                    msg: ''
                }
            },
            incidentRule: {
                dataFieldsArr: ['name', 'severity', 'impact', 'status', '_menu'],
                dataFields: [],
                dataContent: [],
                sort: {
                    field: 'severity',
                    desc: false
                },
                totalCount: 0,
                currentPage: 1,
                pageSize: 20,
                info: {
                    id: '',
                    name: '',
                    severity: 'Emergency',
                    impact: 4,
                    status: false,
                    flowId: ''
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
        this.setDefaultSearchOptions();
    }

    componentWillUnmount() {
        helper.clearTimer();
    }

    checkAccountType = () => {
        const {baseUrl, session} = this.context;
        let requestData = {
            account: session.accountId
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

                    if (data.rt.isLimitType === constants.soc.LIMIT_ACCOUNT) {
                        this.setState({
                            accountType: constants.soc.LIMIT_ACCOUNT
                        })
                    } else if (data.rt.isLimitType === constants.soc.NONE_LIMIT_ACCOUNT) {
                        this.setState({
                            accountType: constants.soc.NONE_LIMIT_ACCOUNT
                        })
                    } else {
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


    setDefaultSearchOptions = () => {
        const {baseUrl} = this.context;
        const severityList = _.map(SEVERITY_TYPE, (val, i) => {
            return <MenuItem key={i} value={val}>{val}</MenuItem>
        });
        let flowSourceList = [];

        helper.getVersion(baseUrl); //Reset global apiTimer and keep server session

        ah.one({
            url: `${baseUrl}/api/soc/flowEngine/_search`,
            data: JSON.stringify({}),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        }).then(data => {
            if (data) {
                let list = _.map(data.rt.rows, val => {
                    flowSourceList.push(val)
                    return <MenuItem key={val.entityId} value={val.entityId}>{`${val.entityName}`}</MenuItem>
                });

                this.setState({
                    flowSourceList:flowSourceList,
                    flowList:list
                },()=>{
                    this.setState({
                        severityList,
                    }, () => {
                        this.getData();
                    });
                });
            }
        }).catch(err => {
             helper.showPopupMsg('', t('txt-error'), err.message)
        });
    }

    /**
     * Get and set Incident Unit table data
     * @method
     * @param options
     */
    getData = (options) => {
        const {baseUrl} = this.context;
        const {searchParam, incidentRule} = this.state;
        const sort = incidentRule.sort.desc ? 'desc' : 'asc';
        const page = options === 'currentPage' ? incidentRule.currentPage : 0;
        const url = `${baseUrl}/api/soc/flow/_search?page=${page + 1}&pageSize=${incidentRule.pageSize}&orders=${incidentRule.sort.field} ${sort}`;
        let requestData = {};

        if (searchParam.keyword) {
            requestData.keyword = searchParam.keyword;
        }

        this.ah.one({
            url,
            data: JSON.stringify(requestData),
            type: 'POST',
            contentType: 'text/plain'
        })
            .then(data => {
                if (data) {
                    let tempData = {...incidentRule};
                    tempData.dataContent = data.rows;
                    tempData.totalCount = data.counts;
                    tempData.currentPage = page;

                    tempData.dataFields = _.map(incidentRule.dataFieldsArr, val => {
                        return {
                            name: val === '_menu' ? '' : val,
                            label: val === '_menu' ? '' : val === 'name' ? f(`incidentFields.flowName`) : f(`incidentFields.${val}`),
                            options: {
                                filter: true,
                                sort: val === 'severity',
                                viewColumns: val !== '_menu',
                                customBodyRenderLite: (dataIndex, options) => {
                                    const allValue = tempData.dataContent[dataIndex];
                                    let value = tempData.dataContent[dataIndex][val];

                                    if (options === 'getAllValue') {
                                        return allValue;
                                    }

                                    if (val === 'status') {
                                        return value ? <CheckCircleOutlineIcon style={{fill: '#29CC7A'}}/> :
                                            <HighlightOffIcon style={{fill: '#CC2943'}}/>
                                    } else if (val === '_menu') {
                                        return (
                                            <div className='table-menu menu active'>
                                                <i className='fg fg-eye' title={t('txt-view')} onClick={this.toggleContent.bind(this, 'view', allValue)} />
                                                {/*<i className='fg fg-trashcan'  title={t('txt-delete')}/>*/}
                                            </div>
                                        )
                                    } else if (val === 'severity') {
                                        return <span className='severity-level'
                                                     style={{backgroundColor: ALERT_LEVEL_COLORS[value]}}>{value}</span>;
                                    } else if (val === 'impact') {
                                        let impactValue = 4
                                        if (allValue.severity === 'Emergency'){
                                            impactValue = 4
                                        }else  if (allValue.severity === 'Alert'){
                                            impactValue = 3
                                        }else  if (allValue.severity === 'Notice'){
                                            impactValue = 1
                                        }else  if (allValue.severity === 'Warning'){
                                            impactValue = 2
                                        }else  if (allValue.severity === 'Critical'){
                                            impactValue = 3
                                        }
                                        return <span >{`${impactValue} (${(9 - 2 * impactValue)} ${it('txt-day')})`}</span>;
                                    }  else {
                                        return <span>{value}</span>
                                    }
                                }
                            }
                        };
                    });

                    this.setState({
                        incidentRule: tempData
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
        let temp = {...this.state.incidentRule};
        temp[type] = Number(value);

        this.setState({
            incidentRule: temp
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
        let temp = {...this.state.incidentRule};
        temp.sort.field = field;
        temp.sort.desc = sort;

        this.setState({
            incidentRule: temp
        }, () => {
            this.getData();
        });
    }

    toggleContent = (type, allValue) => {
        const {originalData, incidentRule} = this.state;
        let tempData = {...incidentRule};
        let showPage = type;
        let tempStepList = [];
        let stepListObj = {}
        if (type === 'tableList') {
            tempData.info = {
                id: '',
                name: '',
                severity: 'Emergency',
                status: false,
                impact: 4,
                flowId: ''
            };
            this.setState({
                stepList:[],
                stepListObj:stepListObj
            });
        } else if (type === 'view') {
            tempData.info = {
                id: allValue.id,
                name: allValue.name,
                severity: allValue.severity,
                status: allValue.status,
                flowId: allValue.flowId
            };

            if (tempData.info.severity === 'Emergency'){
                tempData.info['impact'] = 4
            }else  if (tempData.info.severity === 'Alert'){
                tempData.info['impact'] = 3
            }else  if (tempData.info.severity === 'Notice'){
                tempData.info['impact'] = 1
            }else  if (tempData.info.severity === 'Warning'){
                tempData.info['impact'] = 2
            }else  if (tempData.info.severity === 'Critical'){
                tempData.info['impact'] = 3
            }

            if (allValue.flowId){
                _.forEach(this.state.flowSourceList , flowVal =>{

                    if (flowVal.entityId === allValue.flowId){

                        stepListObj = flowVal.entities
                        for (const [key, value] of Object.entries(flowVal.entities)) {
                            let index = 0;
                            if (Object.entries(flowVal.entities).length > 4){
                                if (value.entityName.includes('SOC-1')) {
                                    index = 0
                                }else if (value.entityName.includes('SOC-2')){
                                    index = 1
                                }else if (value.entityName === '單位承辦人簽核'){
                                    index = 2
                                }else if (value.entityName === '單位資安長簽核'){
                                    index = 3
                                }else if (value.entityName.includes('主管單位承辦人簽核')){
                                    index = 4
                                }else if (value.entityName.includes('主管單位資安長簽核')){
                                    index = 5
                                }
                            }else{
                                if (value.entityName.includes('SOC-1')) {
                                    index = 0
                                }else if (value.entityName.includes('SOC-2')){
                                    index= 1
                                }else if (value.entityName === '單位承辦人簽核'){
                                    index = 2
                                }else if (value.entityName === '主管單位承辦人簽核'){
                                    index = 3
                                }
                            }
                            let obj = {
                                index: index,
                                entityName: value.entityName
                            }
                            tempStepList.push(obj)
                        }

                    }
                })
            }

            this.setState({
                stepList:tempStepList,
                stepListObj:stepListObj,
                originalData: _.cloneDeep(tempData)
            });
        } else if (type === 'cancel') {
            showPage = 'view';
            tempData = _.cloneDeep(originalData);
            if (tempData.info.flowId){
                _.forEach(this.state.flowSourceList , flowVal =>{
                    if (flowVal.entityId === tempData.info.flowId){
                        stepListObj = flowVal.entities;
                        for (const [key, value] of Object.entries(flowVal.entities)) {
                            let index = 0;
                            if (Object.entries(flowVal.entities).length > 4){
                                if (value.entityName.includes('SOC-1')) {
                                    index = 0
                                }else if (value.entityName.includes('SOC-2')){
                                    index = 1
                                }else if (value.entityName === '單位承辦人簽核'){
                                    index = 2
                                }else if (value.entityName === '單位資安長簽核'){
                                    index = 3
                                }else if (value.entityName.includes('主管單位承辦人簽核')){
                                    index = 4
                                }else if (value.entityName.includes('主管單位資安長簽核')){
                                    index = 5
                                }
                            }else{
                                if (value.entityName.includes('SOC-1')) {
                                    index = 0
                                }else if (value.entityName.includes('SOC-2')){
                                    index= 1
                                }else if (value.entityName === '單位承辦人簽核'){
                                    index = 2
                                }else if (value.entityName === '主管單位承辦人簽核'){
                                    index = 3
                                }
                            }
                            let obj = {
                                index: index,
                                entityName: value.entityName
                            }
                            tempStepList.push(obj)
                        }
                    }
                })
            }
            this.setState({
                stepList:tempStepList,
                stepListObj:stepListObj
            });
        } else if (type === 'save') {
            showPage = 'view';
        }

        this.setState({
            showFilter: false,
            activeContent: showPage,
            incidentRule: tempData
        }, () => {
            if (type === 'tableList') {
                this.getData()
            }
        });
    }

    handleSeverityWithSOCChange = (event) => {
        const {incidentRule, flowSourceList} = this.state;
        let tempData = {...incidentRule};
        let tempStepList = [];
        let stepListObj ={};
        tempData.info[event.target.name] = event.target.value;

        if (event.target.name === 'severity'){

            if (event.target.value === 'Emergency'){
                tempData.info['impact'] = 4
            }else  if (event.target.value === 'Alert'){
                tempData.info['impact'] = 3
            }else  if (event.target.value === 'Notice'){
                tempData.info['impact'] = 1
            }else  if (event.target.value === 'Warning'){
                tempData.info['impact'] = 2
            }else  if (event.target.value === 'Critical'){
                tempData.info['impact'] = 3
            }

        }
        if (event.target.name === 'flowId'){
            _.forEach(flowSourceList , flowVal =>{
                if (flowVal.entityId === event.target.value){
                    stepListObj = flowVal.entities
                    for (const [key, value] of Object.entries(flowVal.entities)) {
                        let index = 0;
                        if (Object.entries(flowVal.entities).length > 4){
                            if (value.entityName.includes('SOC-1')) {
                                index = 0
                            }else if (value.entityName.includes('SOC-2')){
                                index = 1
                            }else if (value.entityName === '單位承辦人簽核'){
                                index = 2
                            }else if (value.entityName === '單位資安長簽核'){
                                index = 3
                            }else if (value.entityName.includes('主管單位承辦人簽核')){
                                index = 4
                            }else if (value.entityName.includes('主管單位資安長簽核')){
                                index = 5
                            }
                        }else{
                            if (value.entityName.includes('SOC-1')) {
                                index = 0
                            }else if (value.entityName.includes('SOC-2')){
                                index= 1
                            }else if (value.entityName === '單位承辦人簽核'){
                                index = 2
                            }else if (value.entityName === '主管單位承辦人簽核'){
                                index = 3
                            }
                        }
                        let obj = {
                            index: index,
                            entityName: value.entityName
                        }
                        tempStepList.push(obj)
                    }
                }
            })
        }


        this.setState({
            stepList:tempStepList,
            stepListObj:stepListObj,
            incidentRule: tempData
        });
    }

    handlePatternSubmit = () => {
        const {baseUrl, session} = this.context;
        const {incidentRule, activeContent} = this.state;

        let   requestType = 'PATCH';

        if (!session.accountId) {
            return;
        }

        let requestData = {
            id: incidentRule.info.id,
            name: incidentRule.info.name,
            severity: incidentRule.info.severity,
            status: incidentRule.info.status,
            flowId: incidentRule.info.flowId
        };


        this.ah.one({
            url: `${baseUrl}/api/soc/flow`,
            data: JSON.stringify(requestData),
            type: requestType,
            contentType: 'text/plain'
        })
            .then(data => {
                if (data){
                    helper.showPopupMsg('', t('txt-success'), t('network-topology.txt-saveSuccess'));
                    let showPage = '';

                    if (activeContent === 'add') {
                        showPage = 'tableList';
                    } else if (activeContent === 'edit') {
                        showPage = 'save';
                    }

                    this.toggleContent(showPage);
                }else{
                    helper.showPopupMsg('', t('txt-error'), t('txt-fail'));
                }
                return null;
            })
            .catch(err => {
                helper.showPopupMsg('', t('txt-error'), err.message);
            })

    }

    /* ------------------ View ------------------- */
    render() {
        const {activeContent, baseUrl, contextRoot, showFilter, incidentRule, accountType} = this.state;
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
                    <SocConfig baseUrl={baseUrl} contextRoot={contextRoot} session={session} accountType={accountType}/>
                    <div className='parent-content'>
                        {this.renderFilter()}

                        {activeContent === 'tableList' &&
                        <div className='main-content'>
                            <header className='main-header'>{it('txt-incident-soc-flow')}</header>
                            <MuiTableContentWithoutLoading
                                data={incidentRule}
                                tableOptions={tableOptions}/>
                        </div>
                        }
                        {(activeContent === 'view' || activeContent === 'edit') &&
                        this.displayEditContent()
                        }
                    </div>
                </div>
            </div>
        );
    }

    displayEditContent = () => {
        const {activeContent, severityList, flowList, incidentRule, formValidation, stepList, stepListObj} = this.state;
        let stepTitle =  ['SOC 1', 'SOC 2' , '設備單位承辦人', '資訊中心承辦人'];

        if (stepList.length > 0){
            stepList.sort(this.compare('index'))
            stepTitle = stepList
        }

        let pageType = '';

        if (activeContent === 'add') {
            pageType = 'tableList';
        } else if (activeContent === 'edit') {
            pageType = 'cancel';
        }

        return (
            <div className='main-content basic-form'>
                <header className='main-header'>{it('txt-incident-soc-flow')}</header>

                <div className='content-header-btns'>
                    {activeContent === 'view' &&
                    <div>
                        <Button variant='outlined' color='primary' className='standard btn list' onClick={this.toggleContent.bind(this, 'tableList')}>{t('txt-backToList')}</Button>
                        <Button variant='outlined' color='primary' className='standard btn edit' onClick={this.toggleContent.bind(this, 'edit')}>{t('txt-edit')}</Button>
                    </div>
                    }
                </div>

                <div className='form-group normal'>
                    <header>
                        <div className='text'>{it('txt-soc-flow-basic')}</div>
                    </header>
                    <div className='group '>
                        <TextField
                            id='patternName'
                            name='name'
                            label={f('incidentFields.accountQueryDTO.name')}
                            variant='outlined'
                            fullWidth
                            size='small'
                            required
                            value={incidentRule.info.name}
                            disabled={true} />
                    </div>

                    <div className='group severity-level' style={{width: '25vh', paddingRight:'33px'}}>
                        <i className='fg fg-recode' style={{color: ALERT_LEVEL_COLORS[incidentRule.info.severity]}}/>
                        <TextField
                            id='severity'
                            name='severity'
                            select
                            fullWidth
                            label={f('syslogPatternTableFields.severity')}
                            variant='outlined'
                            size='small'
                            value={incidentRule.info.severity}
                            onChange={this.handleSeverityWithSOCChange}
                            disabled={true}>
                            {severityList}
                        </TextField>
                    </div>

                    <div className='group' style={{width: '25vh'}}>
                        <TextField
                            id='impact'
                            name='impact'
                            variant='outlined'
                            fullWidth
                            size='small'
                            onChange={this.handleSeverityWithSOCChange}
                            required
                            select
                            label={f('incidentFields.impactAssessment')}
                            value={incidentRule.info.impact}
                            disabled={true}>
                            {
                                _.map(_.range(1, 5), el => {
                                    return  <MenuItem value={el}>{`${el} (${(9 - 2 * el)} ${it('txt-day')})`}</MenuItem>
                                })
                            }
                        </TextField>
                    </div>
                </div>

                <div className='form-group normal'>
                    <header>
                        <div className='text'>{it('txt-soc-flow-step')}</div>
                    </header>

                    <div className='group'>
                        <TextField
                            id='flowId'
                            name='flowId'
                            variant='outlined'
                            fullWidth
                            size='small'
                            onChange={this.handleSeverityWithSOCChange}
                            required
                            select
                            label={f('incidentFields.flowId')}
                            value={incidentRule.info.flowId}
                            disabled={activeContent === 'view'}>
                            {flowList}
                        </TextField>

                    </div>

                    <div className='steps-indicator'>
                        {stepTitle.map(this.showUnitStepIcon)}
                    </div>

                </div>


                {(activeContent === 'add' || activeContent === 'edit') &&
                <footer>
                    <Button variant='outlined' color='primary' className='standard' onClick={this.toggleContent.bind(this, pageType)}>{t('txt-cancel')}</Button>
                    <Button variant='contained' color='primary' onClick={this.handlePatternSubmit}>{t('txt-save')}</Button>
                </footer>
                }
            </div>
        )
    }

    compare = function (prop) {
        return function (obj1, obj2) {
            let val1 = obj1[prop];
            let val2 = obj2[prop];
            if (val1 < val2) {
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    showUnitStepIcon = (val) => {

        const {locale} = this.context;
        const index = val.index + 1;
        const groupClass = 'group group' + index;
        const lineClass = 'line line' + index;
        const stepClass = 'step step' + index;
        const textClass = 'text';

        let textAttr = {
            className: textClass
        };

        if (index === 1) {
            let pos = '';

            if (locale === 'en') {
                pos = '0px';
            } else if (locale === 'zh') {
                pos = '0';
            }
            textAttr.style = {left: pos};
        }

        if (index === 2) {
            let pos = '';

            if (locale === 'en') {
                pos = '0px';
            } else if (locale === 'zh') {
                pos = '0px';
            }
            textAttr.style = {left: pos};
        }

        if (index === 3) {
            let pos = '';

            if (locale === 'en') {
                pos = '-27px';
            } else if (locale === 'zh') {
                pos = '-27px';
            }
            textAttr.style = {left: pos};
        }

        if (index === 4) {
            let pos = '';

            if (locale === 'en') {
                pos = '-27px';
            } else if (locale === 'zh') {
                pos = '-27px';
            }
            textAttr.style = {left: pos};
        }

        if (index === 5) {
            let pos = '';

            if (locale === 'en') {
                pos = '-27px';
            } else if (locale === 'zh') {
                pos = '-27px';
            }
            textAttr.style = {left: pos};
        }

        if (index === 6) {
            let pos = '';

            if (locale === 'en') {
                pos = '-27px';
            } else if (locale === 'zh') {
                pos = '-27px';
            }
            textAttr.style = {left: pos};
        }

        return (
            <div className={groupClass} key={index}>
                <div className={cx(lineClass, {active: true})}/>
                <div className={cx(stepClass, {active: true})}>
                    <div className='wrapper'><span className='number'>{index}</span></div>
                    <div {...textAttr}>{val.entityName}</div>
                </div>
            </div>
        )
    }

    showUnitStepIcon4 = (val, i) => {

        if (val.includes('SOC-1')) {
            i = 0
        }else if (val.includes('SOC-2')){
            i = 1
        }else if (val === '單位承辦人簽核'){
            i = 2
        }else if (val === '主管單位承辦人簽核'){
            i = 3
        }

        const {locale} = this.context;
        const index = ++i;
        const groupClass = 'group group' + index;
        const lineClass = 'line line' + index;
        const stepClass = 'step step' + index;
        const textClass = 'text';

        let textAttr = {
            className: textClass
        };

        if (index === 1) {
            let pos = '';

            if (locale === 'en') {
                pos = '0px';
            } else if (locale === 'zh') {
                pos = '0';
            }
            textAttr.style = {left: pos};
        }

        if (index === 2) {
            let pos = '';

            if (locale === 'en') {
                pos = '0px';
            } else if (locale === 'zh') {
                pos = '0px';
            }
            textAttr.style = {left: pos};
        }

        if (index === 3) {
            let pos = '';

            if (locale === 'en') {
                pos = '-27px';
            } else if (locale === 'zh') {
                pos = '-27px';
            }
            textAttr.style = {left: pos};
        }

        if (index === 4) {
            let pos = '';

            if (locale === 'en') {
                pos = '-27px';
            } else if (locale === 'zh') {
                pos = '-27px';
            }
            textAttr.style = {left: pos};
        }

        if (index === 5) {
            let pos = '';

            if (locale === 'en') {
                pos = '-27px';
            } else if (locale === 'zh') {
                pos = '-27px';
            }
            textAttr.style = {left: pos};
        }

        if (index === 6) {
            let pos = '';

            if (locale === 'en') {
                pos = '-27px';
            } else if (locale === 'zh') {
                pos = '-27px';
            }
            textAttr.style = {left: pos};
        }

        return (
            <div className={groupClass} key={index}>
                <div className={cx(lineClass, {active: true})}/>
                <div className={cx(stepClass, {active: true})}>
                    <div className='wrapper'><span className='number'>{index}</span></div>
                    <div {...textAttr}>{val}</div>
                </div>
            </div>
        )
    }

    showUnitStepIcon6 = (val, i) => {

        if (val.includes('SOC-1')) {
            i = 0
        }else if (val.includes('SOC-2')){
            i = 1
        }else if (val === '單位承辦人簽核'){
            i = 2
        }else if (val === '單位資安長簽核'){
            i = 3
        }else if (val.includes('主管單位承辦人簽核')){
            i = 4
        }else if (val.includes('主管單位資安長簽核')){
            i = 5
        }

        const {locale} = this.context;
        const index = ++i;
        const groupClass = 'group group' + index;
        const lineClass = 'line line' + index;
        const stepClass = 'step step' + index;
        const textClass = 'text';

        let textAttr = {
            className: textClass
        };

        if (index === 1) {
            let pos = '';

            if (locale === 'en') {
                pos = '0px';
            } else if (locale === 'zh') {
                pos = '0';
            }
            textAttr.style = {left: pos};
        }

        if (index === 2) {
            let pos = '';

            if (locale === 'en') {
                pos = '0px';
            } else if (locale === 'zh') {
                pos = '0px';
            }
            textAttr.style = {left: pos};
        }

        if (index === 3) {
            let pos = '';

            if (locale === 'en') {
                pos = '-27px';
            } else if (locale === 'zh') {
                pos = '-27px';
            }
            textAttr.style = {left: pos};
        }

        if (index === 4) {
            let pos = '';

            if (locale === 'en') {
                pos = '-27px';
            } else if (locale === 'zh') {
                pos = '-27px';
            }
            textAttr.style = {left: pos};
        }

        if (index === 5) {
            let pos = '';

            if (locale === 'en') {
                pos = '-27px';
            } else if (locale === 'zh') {
                pos = '-27px';
            }
            textAttr.style = {left: pos};
        }

        if (index === 6) {
            let pos = '';

            if (locale === 'en') {
                pos = '-27px';
            } else if (locale === 'zh') {
                pos = '-27px';
            }
            textAttr.style = {left: pos};
        }

        return (
            <div className={groupClass} key={index}>
                <div className={cx(lineClass, {active: true})}/>
                <div className={cx(stepClass, {active: true})}>
                    <div className='wrapper'><span className='number'>{index}</span></div>
                    <div {...textAttr}>{val}</div>
                </div>
            </div>
        )
    }

    showUnitStepIconWithObj = () => {
        const {locale} = this.context;
        let stepListObj = this.state.stepListObj;
        Object.keys(stepListObj).forEach(key => {
            let i = 0;
            let val = '';
            if (stepListObj[key].entityName.includes('SOC-1')) {
                i = 0
            }else if (stepListObj[key].entityName.includes('SOC-2')){
                i = 1
            }else if (stepListObj[key].entityName === '單位承辦人簽核'){
                i = 2
            }else if (stepListObj[key].entityName === '單位資安長簽核'){
                i = 3
            }else if (stepListObj[key].entityName.includes('主管單位承辦人簽核')){
                i = 4
            }else if (stepListObj[key].entityName.includes('主管單位資安長簽核')){
                i = 5
            }

            const index = ++i;
            const groupClass = 'group group' + index;
            const lineClass = 'line line' + index;
            const stepClass = 'step step' + index;
            const textClass = 'text';

            let textAttr = {
                className: textClass
            };

            if (index === 1) {
                let pos = '';

                if (locale === 'en') {
                    pos = '0px';
                } else if (locale === 'zh') {
                    pos = '0px';
                }
                textAttr.style = {left: pos};
            }

            if (index === 2) {
                let pos = '';

                if (locale === 'en') {
                    pos = '0px';
                } else if (locale === 'zh') {
                    pos = '0px';
                }
                textAttr.style = {left: pos};
            }

            if (index === 3) {
                let pos = '';

                if (locale === 'en') {
                    pos = '-27px';
                } else if (locale === 'zh') {
                    pos = '-27px';
                }
                textAttr.style = {left: pos};
            }

            if (index === 4) {
                let pos = '';

                if (locale === 'en') {
                    pos = '-27px';
                } else if (locale === 'zh') {
                    pos = '-27px';
                }
                textAttr.style = {left: pos};
            }

            if (index === 5) {
                let pos = '';

                if (locale === 'en') {
                    pos = '-27px';
                } else if (locale === 'zh') {
                    pos = '-27px';
                }
                textAttr.style = {left: pos};
            }

            if (index === 6) {
                let pos = '';

                if (locale === 'en') {
                    pos = '-27px';
                } else if (locale === 'zh') {
                    pos = '-27px';
                }
                textAttr.style = {left: pos};
            }

            return (
                <div className={groupClass} key={index}>
                    <div className={cx(lineClass, {active: true})}/>
                    <div className={cx(stepClass, {active: true})}>
                        <div className='wrapper'><span className='number'>{index}</span></div>
                        <div {...textAttr}>{stepListObj[key].entityName}</div>
                    </div>
                </div>
            )

        })

    }
    /**
     * Display filter content
     * @method
     * @returns HTML DOM
     */
    renderFilter = () => {
        const {showFilter, searchParam} = this.state;
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
                        <label htmlFor='keyword'>{f('incidentFields.keywords')}</label>
                        <TextField
                            id='keyword'
                            name='keyword'
                            type='text'
                            variant='outlined'
                            fullWidth={true}
                            size='small'
                            className='search-textarea'
                            value={searchParam.keyword}
                            onChange={this.handleLogInputSearchMui}/>
                    </div>
                </div>
                <div className='button-group'>
                    <Button variant='contained' color='primary' className='filter'
                            onClick={this.getData.bind(this, 'search')}>{t('txt-filter')}</Button>
                    <Button variant='outlined' color='primary' className='clear'
                            onClick={this.clearFilter}>{t('txt-clear')}</Button>
                </div>
            </div>
        )
    };

    /* ---- Func Space ---- */
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
     * @param {object} event - input value
     */
    handleLogInputSearchMui = (event) => {
        let tempSearch = {...this.state.searchParam};
        tempSearch[event.target.name] = event.target.value.trim();

        this.setState({
            searchParam: tempSearch
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
            searchParam: {
                keyword: '',
            },
        });
    };

}

IncidentFlow.contextType = BaseDataContext;

IncidentFlow.propTypes = {
    // nodeBaseUrl: PropTypes.string.isRequired
};

export default IncidentFlow;
