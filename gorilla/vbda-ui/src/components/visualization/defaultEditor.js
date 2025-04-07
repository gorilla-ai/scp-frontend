import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'

import Input from 'react-ui/build/src/components/input'
import DropDownList from 'react-ui/build/src/components/dropdown'
import DatePicker from 'react-ui/build/src/components/date-picker'
import RadioGroup from 'react-ui/build/src/components/radio-group'
import Checkbox from 'react-ui/build/src/components/checkbox'
import Textarea from 'vbda/components/visualization/textarea'
import FilesUpdate from 'vbda/components/visualization/defaultEditor/filesUpdate'
import ImagesUpdate from 'vbda/components/visualization/defaultEditor/imagesUpdate'
import Address from 'vbda/components/visualization/defaultEditor/address'
import AddableTable from 'vbda/components/visualization/defaultEditor/AddableTable'
import GroupForm from 'vbda/components/visualization/defaultEditor/groupForm'
import MultiDropDownList from 'vbda/components/visualization/defaultEditor/MultiDropDownList'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import Form from './defaultEditor/baseForm'

import ah from "react-ui/build/src/utils/ajax-helper";
import {config as configLoader} from "vbda/loader";
import cx from "classnames";
import {Validation} from "vbda/components/visualization/defaultEditor/validation";
import {Table} from "vbda/components/visualization/table";
import {findUrlFromFileServiceFormat, findrReferencePathForFileServiceToDelete} from 'vbda/utils/image-helper'

const log = require('loglevel').getLogger('defaultEditor')

const gt = global.vbdaI18n.getFixedT(null, 'vbda')
import localize from '../../hoc/locale-provider'

const FILED_TYPE = {
    INPUT: 'Input',
    DATE: 'Date',
    IMAGE: 'Image',
    CHECKBOX: 'Checkbox',
    FILE: 'File',
    TEXT_AREA: 'TextArea',
    DROP_DOWN_LIST: 'DropDownList',
    RADIO_GROUP: 'RadioGroup',
    ADDRESS: 'Address',
    UNIT: 'Unit',
    TABLE: 'Table',
    MULTI_DROP_DOWN_LIST: 'MultiDropDownList',
    HIDE: 'Hide',
    GROUP_FORM: 'GroupForm'
}

const INITIAL_STATE = {
    open: false,
    info: gt('txt-loading'),
    error: false,
    data: {},
    isUpdate: false,
    postTreatmentList: [],
    //以下不需要init
    // fields: {}
    // dataMappings: {}
}

class defaultEditor extends React.Component {
    static propTypes = {
        currentDt: PropTypes.object.isRequired,
        lng: PropTypes.string,
        onUpdate: PropTypes.func,
        onCreate: PropTypes.func
    };

    state = _.clone(INITIAL_STATE);

    componentDidMount() {
        const {currentDt: {data_mappings}} = this.props
        this.preLoad(data_mappings)
        const {_ref} = this.props
        if (_ref) {
            _ref(this)
        }
    }

    componentWillReceiveProps(nextProps) {
        const {currentDt: nextCurrentDt, currentDt: {data_mappings}} = nextProps
        const {currentDt} = this.props
        if (nextCurrentDt !== currentDt)
            this.preLoad(data_mappings)
    }

    preLoad = (data_mappings) => {
        this.setState({
            info: gt('txt-loading')
        })
        log.info('pre load')
        configLoader.processDataMappings(data_mappings)
            .then(dataMappings => {
                configLoader.processRefDataMappings(data_mappings)
                    .then(refDataMappings => {
                        this.afterLoadDataMapping({...dataMappings, ...refDataMappings})
                    })
            })
    };

    afterLoadDataMapping = (dataMappings) => {
        log.info('afterLoadDataMapping')
        this.setState({
            // dataMappings: dataMappings,
            addEditorFields: this.getFields(false, dataMappings),
            updateEditorFields: this.getFields(true, dataMappings),
            info: null,
        })
    };

    open = (data, forceAdd = false) => {
        // const {currentDt} = this.props
        const isUpdate = !forceAdd && !_.isEmpty(data)
        this.setState({
            open: true, data,
            // __data_type: data.__data_type, _index: data._index, _id: data._id,//若是更新的話需要這些資料
            isUpdate
        })
    };

    close = () => {
        this.setState(_.clone(INITIAL_STATE))
    };

    handleUpdateEvent = (data) => {
        // const {__data_type, _index, _id} = this.state
        this.setState(_.clone(INITIAL_STATE), () => {
            // this.props.onUpdate({...data, __data_type, _index, _id})
            this.props.onUpdate(data)
        })
    };

    handleCreateEvent = (data) => {
        this.setState(_.clone(INITIAL_STATE), () => {
            this.props.onCreate(data)
        })
    };

    getDataMappingToList = (fieldName, dataMappings) => {
        if (_.isNil(dataMappings[fieldName])) {
            alert(`fields [${fieldName}] missing data mappings config`)
            console.error(`fields [${fieldName}] missing data mappings config`)
            return []
        }
        return _.map(dataMappings[fieldName], (text, value) => {
            return {value, text}
        })
    };

    getFormField = (field, fieldName, dataMappings) => {
        let {currentDt} = this.props
        const {fields: cfgFields} = currentDt
        let newField = {}
        switch (field.type) {
            case FILED_TYPE.INPUT:
                newField.editor = Input
                newField.props = field.props
                break;
            case FILED_TYPE.DATE:
                newField.editor = DatePicker
                // tempField.props.required = field.required ? field.required : false
                break
            case FILED_TYPE.IMAGE:
                newField.editor = ImagesUpdate
                newField.props = field.props
                newField.onChange = (imageArray, event) => {
                    const {isUpdate} = this.state
                    if (isUpdate) {//準備資料放到__fileInfoToAdd供 base service 新增檔案的api 使用
                        //新增檔案
                        const imageList = _.chain(imageArray)
                            .omitBy(({base64}) => {//只取base64的部分
                                return _.isNil(base64)
                            })
                            .map(({base64}) => {
                                return base64
                            }).value()
                        if (imageList.length > 0)
                            _.set(event, ['__fileInfoToAdd', fieldName], imageList)
                        else {//空值得話要把欄位清掉
                            let fileInfoToAdd = _.get(event, '__fileInfoToAdd')
                            fileInfoToAdd = _.omitBy(fileInfoToAdd, (o, key) => {
                                return key === fieldName
                            })
                            _.set(event, ['__fileInfoToAdd'], fileInfoToAdd)
                        }
                        //刪除檔案
                        if (_.has(event, fieldName)) {
                            let originUrlList = findUrlFromFileServiceFormat(event, fieldName)
                            const newUrlList = _.chain(imageArray)
                                .omitBy(({url}) => {//只取得url的部分
                                    return _.isNil(url)
                                })
                                .map(({url}) => {
                                    return url
                                }).value()

                            const fileUrlToDelete = _.xor(originUrlList, newUrlList)//去掉重複的，即為需要刪除的
                            const fileInfoToDelete =
                                _.chain(fileUrlToDelete)
                                    .map(fileServerPath => {
                                        const fileInfoIndex = _.findIndex(event['__fileInfo'], function (o) {
                                            return o.fileServerPath === fileServerPath;
                                        })
                                        try {
                                            const fileInfo = _.get(event, ['__fileInfo', fileInfoIndex])
                                            const referencePath = findrReferencePathForFileServiceToDelete(event, fieldName, fileInfo.uuid)
                                            return {referencePath: referencePath, uuid: fileInfo.uuid, url: fileInfo.fileServerPath}
                                        }
                                        catch (e) {
                                            log.info('no matched file url', e)
                                            return null
                                        }
                                    })
                                    .value()
                            _.set(event, ['__fileInfoToDelete'], fileInfoToDelete)
                        }
                    }
                    else {
                        const imageList = _.map(imageArray, ({base64}) => {
                            return base64
                        })
                        _.set(event, fieldName, imageList)
                    }
                    this.handleFormChange(event)
                }
                newField.preProcess = (event) => {
                    const {isUpdate} = this.state
                    let imageArray = []
                    if (isUpdate) {
                        if (_.has(event, fieldName)) {
                            let urlList = findUrlFromFileServiceFormat(event, fieldName)
                            const fileUrlToDelete = _.map(_.get(event, ['__fileInfoToDelete']), o => {
                                return o.url
                            })//取得點選刪除的圖片url
                            urlList = _.xor(urlList, fileUrlToDelete)//去掉重複的，即保留不須刪除的
                            imageArray = _.concat(imageArray, _.map(urlList, (urlString) => {
                                return {url: urlString, name: ''}
                            }))
                        }
                        if (_.has(event, ['__fileInfoToAdd', fieldName])) {
                            let imageArrayFromAdd = _.map(_.get(event, ['__fileInfoToAdd', fieldName]), (base64String) => {
                                return {base64: base64String, name: ''}
                            })
                            imageArray = _.concat(imageArray, imageArrayFromAdd)
                        }
                    }
                    else {
                        if (_.has(event, fieldName)) {
                            imageArray = _.map(_.get(event, fieldName), (base64String) => {
                                return {base64: base64String, name: ''}
                            })
                        }
                    }
                    return imageArray
                }
                break
            case FILED_TYPE.FILE:
                newField.editor = FilesUpdate
                newField.props = field.props
                newField.onChange = (value) => {
                    const {data} = this.state
                    if (!_.has(field, ['props', 'fileField'])) {
                        const fileList = _.map(value, ({base64}) => {
                            return base64
                        })
                        _.set(data, fieldName, fileList)
                    }
                    else {
                        const fileField = _.get(field, ['props', 'fileField'])
                        const nameField = _.get(field, ['props', 'nameField'])
                        const fileList = _.map(value, ({base64, name}) => {
                            return {[fileField]: base64, [nameField]: name}
                        })
                        _.set(data, fieldName, fileList)
                    }
                    this.handleFormChange(data)
                }
                newField.preProcess = (event) => {
                    let fileArray = []
                    if (_.has(event, fieldName)) {
                        if (!_.has(field, ['props', 'fileField'])) {
                            fileArray = _.map(_.get(event, fieldName), (base64String) => {
                                return {base64: base64String, name: ''}
                            })
                        }
                        else {
                            const fileField = _.get(field, ['props', 'fileField'])
                            const nameField = _.get(field, ['props', 'nameField'])
                            fileArray = _.map(_.get(event, fieldName), (content) => {
                                return {base64: content[fileField], name: content[nameField]}
                            })
                        }
                    }
                    return fileArray
                }
                break
            case FILED_TYPE.CHECKBOX:
                newField.editor = Checkbox
                break
            case FILED_TYPE.TEXT_AREA:
                newField.editor = Textarea
                break
            case FILED_TYPE.DROP_DOWN_LIST:
                newField.editor = DropDownList
                newField.props = {
                    list: this.getDataMappingToList(fieldName, dataMappings)
                }
                break;
            case FILED_TYPE.RADIO_GROUP:
                newField.editor = RadioGroup
                newField.props = {
                    list: this.getDataMappingToList(fieldName, dataMappings)
                }
                break;
            case FILED_TYPE.TABLE:
                newField.editor = AddableTable
                newField.props = {
                    fields: _.chain(field.props.fields)//array轉成object
                        .keyBy('fieldKey')
                        .mapValues((childField, childFieldName) => {
                            return this.getFormField(childField, fieldName + '.' + childField.fieldKey, dataMappings)
                        })
                        .value()
                }
                break;
            case FILED_TYPE.GROUP_FORM:
                newField.editor = GroupForm
                newField.props = {
                    fields: _.chain(field.props.fields)//array
                        .keyBy('fieldKey')
                        .mapValues((childField, childFieldName) => {
                            let newChildField = this.getFormField(childField, childField.fieldKey, dataMappings)
                            newChildField.gridWidth = _.get(childField, ['gridWidth'], '24')
                            return newChildField
                        })
                        .value(),
                    label: field.props.label
                }
                newField.onChange = (groupFormValue) => {
                    const {data} = this.state
                    _.forEach(field.props.fields, ({fieldKey}) => {
                        if (_.has(groupFormValue, fieldKey))
                            _.set(data, fieldKey, _.get(groupFormValue, fieldKey))
                    })
                    this.handleFormChange(data)
                }
                newField.preProcess = (event) => {
                    // let processedValue = {}
                    // _.forEach(field.props.fields, ({fieldKey}) => {
                    //     if (_.has(event, fieldKey))
                    //         _.set(processedValue, fieldKey, _.get(event, fieldKey))
                    // })
                    return event
                }
                break;
            case FILED_TYPE.MULTI_DROP_DOWN_LIST:
                newField.editor = MultiDropDownList
                newField.props = field.props
                newField.props.dataMappings = dataMappings
                newField.onChange = (mValue) => {
                    const {data} = this.state
                    const combineToFieldKey = _.get(field, ['props', 'combineToFieldKey'], null)
                    let combinString = ''
                    _.forEach(field.props.fields, ({fieldKey, ifKeep = true}) => {
                        // if (ifKeep)
                        data[fieldKey] = mValue[fieldKey]
                        if (combineToFieldKey)
                            combinString += (mValue[fieldKey] ? mValue[fieldKey] : '')
                    })
                    if(combineToFieldKey)
                        _.set(data, combineToFieldKey, combinString)
                    this.handleFormChange(data)
                }
                newField.preProcess = (event) => {
                    let processedValue = {}
                    _.forEach(field.props.fields, ({fieldKey}) => {
                        if (_.has(event, fieldKey))
                            _.set(processedValue, fieldKey, _.get(event, fieldKey))
                    })
                    return processedValue
                }
                break;
            default://可以允許沒設定，或設定錯誤，這邊就會以property的type來對應預設欄位。
                if (!_.has(cfgFields, fieldName.replace('.', '.properties.'))) {
                    console.error(`no match property name [${fieldName}] in config`)
                    newField.label = <a className='c-error'>{fieldName} (error config)</a>
                    newField.editor = Input
                    newField.props = {disabled: true, placeholder: 'error config', className: 'c-error', required: true}
                    return newField
                }
                switch (cfgFields[fieldName].type) {//如果沒設定的話會依照properties的type給預設值
                    case 'text':
                    case 'keyword':
                    case 'float':
                        newField.editor = Input
                        break
                    case 'date':
                        newField.editor = DatePicker
                        break
                    case 'image':
                        newField.editor = ImagesUpdate
                        break
                    case 'boolean':
                        newField.editor = Checkbox
                        break
                    default:
                        newField.editor = Input
                        break
                }
        }
        //驗證規則
        newField.validRules = _.get(field, 'validRules', [])
        //必填
        const ifRequired = _.indexOf(field.validRules, 'required') > -1
        _.set(newField, ['props', 'required'], ifRequired)
        //label
        if (field.type === 'GroupForm') {
            newField.label = ''
        } else {
            if (fieldName.indexOf('.') > 0) {//確認是否為物件
                let fieldPathInConfigFields = fieldName.replace(/\./g, '.properties.').split('.')
                newField.label = _.get(cfgFields, [...fieldPathInConfigFields, 'display_name'], fieldName)
            }
            else {
                newField.label = _.get(cfgFields, [fieldName, 'display_name'], fieldName)
            }
        }
        return newField
    };

    getFields = (isUpdate, dataMappings) => {
        let {currentDt} = this.props
        let editorFields
        if (isUpdate)
            editorFields = _.get(currentDt, ['editors', 'updateFields'], null)
        else
            editorFields = _.get(currentDt, ['editors', 'addFields'], null)

        if (_.isNil(editorFields)) {//沒設定config 則無法使用
            return null
        }

        editorFields = _.chain(editorFields)
            .map((val, key) => {
                let order = parseInt(val.order)
                let newVal = _.omit(val, ['order'])
                return {__key: key, order, ...newVal}
            })
            .sortBy('order')
            .keyBy('__key')
            .omitBy(o => {
                    return o.type === FILED_TYPE.HIDE //hide不須呈現
                    // || (isUpdate && (o.type === FILED_TYPE.FILE || o.type === FILED_TYPE.IMAGE))//製作中
                }
            )
            .mapValues((o) => {
                delete o.__key
                return o
            })
            .value();
        const newEditorFields = _.mapValues(editorFields, (field, fieldName) => {
            return this.getFormField(field, fieldName, dataMappings)
        })
        log.info("All Editor Fields", newEditorFields)
        return newEditorFields
    };

    handleFormChange = (formData) => {
        log.info('nowEditorData', formData)
        this.setState({data: formData})
    };

    postTreatment = (formData) => {
        const {currentDt} = this.props
        const {isUpdate} = this.state
        const onConfirm = isUpdate ? this.handleUpdateEvent : this.handleCreateEvent
        const editorFields = isUpdate ? _.get(currentDt, ['editors', 'updateFields'], null) : _.get(currentDt, ['editors', 'addFields'], null)
        let resultFormData = {}
        //依照conifg，處理一些需要額外處理的input
        //hide type資料從session或其他地方取值
        let referenceError = false
        _.forEach(editorFields, (field, key) => {
            switch (field.type) {
                case 'Hide':
                    if (!_.has(field, ['props', 'referenceTo']) ||
                        !_.has(this.props, field.props.referenceTo)
                    ) {
                        referenceError = true
                        return
                    }
                    let value = _.get(this.props, field.props.referenceTo)
                    if (_.has(field, 'props.formatter')) {
                        value = new Function("referenceTo", field.props.formatter)(value);
                    }
                    resultFormData[key] = value
                    break
                default:
                    break
            }
        })
        if (referenceError) {
            this.setState({info: 'hide 類型 reference 資料無法取得', error: true})
            return
        }
        //2.其他特殊處理
        _.forEach(formData, (value, key) => {
            _.set(resultFormData, key, value)
        })
        log.info('base form submit:', resultFormData)
        if (!this.validation(resultFormData))
            return
        this.setState(_.clone(INITIAL_STATE), () => {
            onConfirm(resultFormData)
        })
    };

    validation = (data) => {
        const {currentDt} = this.props
        const {isUpdate} = this.state
        const fields = isUpdate ? this.state.updateEditorFields : this.state.addEditorFields
        const editorFields = isUpdate ? _.get(currentDt, ['editors', 'updateFields'], null) : _.get(currentDt, ['editors', 'addFields'], null)
        let errMsg = ''
        let errorList = []
        _.forEach(fields, (field, key) => {
            const editorField = _.get(editorFields, [key])
            if (_.has(field, ['props', 'fields'])
                &&
                ((editorField.type === FILED_TYPE.TABLE) || (editorField.type === FILED_TYPE.MULTI_DROP_DOWN_LIST) || (editorField.type === FILED_TYPE.GROUP_FORM))) {
                switch (editorField.type) {
                    case FILED_TYPE.TABLE:
                        let error = false
                        _.forEach(field.props.fields, (childField, childKey) => {
                            if (error)
                                return false
                            if (!_.isNil(childField.validRules) && !_.isEmpty(childField.validRules)) {
                                const arrayList = _.get(data, key, {})
                                _.forEach(arrayList, (val, index) => {
                                    const errorMessage = Validation.validateWithErrorMessage(val[childKey], childField.validRules, childField.label)
                                    if (errorMessage != null) {
                                        errorList.push(`${field.label}資料有誤(${errorMessage})`)
                                        error = true
                                        return false
                                    }
                                })
                            }
                        })
                        break;
                    case FILED_TYPE.MULTI_DROP_DOWN_LIST:
                    case FILED_TYPE.GROUP_FORM:
                        _.forEach(field.props.fields, (childField, childKey) => {
                            if (!_.isNil(childField.validRules) && !_.isEmpty(childField.validRules)) {
                                const value = _.get(data, childKey, '')
                                const errorMessage = Validation.validateWithErrorMessage(value, childField.validRules, childField.label)
                                if (errorMessage != null) {
                                    errorList.push(`${field.props.label}-${errorMessage}`)
                                }
                            }
                        })
                        break;
                    default:
                        break;
                }
            }
            else if (!_.isNil(field.validRules) && !_.isEmpty(field.validRules)) {
                const errorMessage = Validation.validateWithErrorMessage(data[key], field.validRules, field.label)
                if (errorMessage !== null)
                    errorList.push(errorMessage)
            }
        })
        console.log('errorList: ', errorList)
        _.forEach(errorList, (massage) => {
            errMsg += massage + ', '
        })
        if (errMsg === '') {
            this.setState({info: null, error: false})
            return true
        }
        errMsg = errMsg.slice(0, errMsg.length - 2)
        this.setState({info: errMsg, error: true})
        return false
    };

    render() {
        let {currentDt, id} = this.props
        let {data, open, isUpdate, info, error} = this.state
        const fields = isUpdate ? this.state.updateEditorFields : this.state.addEditorFields
        if (info === gt('txt-loading'))
            return null
        if (!open) {
            return null
        }
        let width = _.get(currentDt, ['editors', 'width'], '80%')
        if (!/%/.test(width))
            width += 'px'
        return <ModalDialog
            id={currentDt.display_name + '-' + (isUpdate ? 'edit' : 'add')}
            className={'event-editor-form'}
            title={currentDt.display_name + ' - ' + (isUpdate ? '編輯' : '新增')}
            style={{width}}
            draggable={true}
            global={true}
            info={info}
            infoClassName={cx({'c-error': error})}
            closeAction='cancel'
            actions={{
                cancel: {text: '取消', className: 'standard', handler: this.close},
                confirm: {
                    text: '確認', handler: () => {
                        this.postTreatment(data)
                    }
                }
            }}>
            <div className="c-flex">
                <Form
                    className='grow'
                    formClassName='c-form'
                    fields={fields}
                    onChange={this.handleFormChange}
                    value={data}/>
            </div>

        </ModalDialog>
    }
}

export default localize(defaultEditor)
