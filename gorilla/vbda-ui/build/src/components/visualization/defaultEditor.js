'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _input = require('react-ui/build/src/components/input');

var _input2 = _interopRequireDefault(_input);

var _dropdown = require('react-ui/build/src/components/dropdown');

var _dropdown2 = _interopRequireDefault(_dropdown);

var _datePicker = require('react-ui/build/src/components/date-picker');

var _datePicker2 = _interopRequireDefault(_datePicker);

var _radioGroup = require('react-ui/build/src/components/radio-group');

var _radioGroup2 = _interopRequireDefault(_radioGroup);

var _checkbox = require('react-ui/build/src/components/checkbox');

var _checkbox2 = _interopRequireDefault(_checkbox);

var _textarea = require('vbda/components/visualization/textarea');

var _textarea2 = _interopRequireDefault(_textarea);

var _filesUpdate = require('vbda/components/visualization/defaultEditor/filesUpdate');

var _filesUpdate2 = _interopRequireDefault(_filesUpdate);

var _imagesUpdate = require('vbda/components/visualization/defaultEditor/imagesUpdate');

var _imagesUpdate2 = _interopRequireDefault(_imagesUpdate);

var _address = require('vbda/components/visualization/defaultEditor/address');

var _address2 = _interopRequireDefault(_address);

var _AddableTable = require('vbda/components/visualization/defaultEditor/AddableTable');

var _AddableTable2 = _interopRequireDefault(_AddableTable);

var _groupForm = require('vbda/components/visualization/defaultEditor/groupForm');

var _groupForm2 = _interopRequireDefault(_groupForm);

var _MultiDropDownList = require('vbda/components/visualization/defaultEditor/MultiDropDownList');

var _MultiDropDownList2 = _interopRequireDefault(_MultiDropDownList);

var _modalDialog = require('react-ui/build/src/components/modal-dialog');

var _modalDialog2 = _interopRequireDefault(_modalDialog);

var _baseForm = require('./defaultEditor/baseForm');

var _baseForm2 = _interopRequireDefault(_baseForm);

var _ajaxHelper = require('react-ui/build/src/utils/ajax-helper');

var _ajaxHelper2 = _interopRequireDefault(_ajaxHelper);

var _loader = require('vbda/loader');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _validation = require('vbda/components/visualization/defaultEditor/validation');

var _table = require('vbda/components/visualization/table');

var _imageHelper = require('vbda/utils/image-helper');

var _localeProvider = require('../../hoc/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('defaultEditor');

var gt = global.vbdaI18n.getFixedT(null, 'vbda');


var FILED_TYPE = {
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
};

var INITIAL_STATE = {
    open: false,
    info: gt('txt-loading'),
    error: false,
    data: {},
    isUpdate: false,
    postTreatmentList: []
    //以下不需要init
    // fields: {}
    // dataMappings: {}
};

var defaultEditor = function (_React$Component) {
    _inherits(defaultEditor, _React$Component);

    function defaultEditor() {
        var _ref2;

        var _temp, _this, _ret;

        _classCallCheck(this, defaultEditor);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = defaultEditor.__proto__ || Object.getPrototypeOf(defaultEditor)).call.apply(_ref2, [this].concat(args))), _this), _this.state = _lodash2.default.clone(INITIAL_STATE), _this.preLoad = function (data_mappings) {
            _this.setState({
                info: gt('txt-loading')
            });
            log.info('pre load');
            _loader.config.processDataMappings(data_mappings).then(function (dataMappings) {
                _loader.config.processRefDataMappings(data_mappings).then(function (refDataMappings) {
                    _this.afterLoadDataMapping(_extends({}, dataMappings, refDataMappings));
                });
            });
        }, _this.afterLoadDataMapping = function (dataMappings) {
            log.info('afterLoadDataMapping');
            _this.setState({
                // dataMappings: dataMappings,
                addEditorFields: _this.getFields(false, dataMappings),
                updateEditorFields: _this.getFields(true, dataMappings),
                info: null
            });
        }, _this.open = function (data) {
            var forceAdd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            // const {currentDt} = this.props
            var isUpdate = !forceAdd && !_lodash2.default.isEmpty(data);
            _this.setState({
                open: true, data: data,
                // __data_type: data.__data_type, _index: data._index, _id: data._id,//若是更新的話需要這些資料
                isUpdate: isUpdate
            });
        }, _this.close = function () {
            _this.setState(_lodash2.default.clone(INITIAL_STATE));
        }, _this.handleUpdateEvent = function (data) {
            // const {__data_type, _index, _id} = this.state
            _this.setState(_lodash2.default.clone(INITIAL_STATE), function () {
                // this.props.onUpdate({...data, __data_type, _index, _id})
                _this.props.onUpdate(data);
            });
        }, _this.handleCreateEvent = function (data) {
            _this.setState(_lodash2.default.clone(INITIAL_STATE), function () {
                _this.props.onCreate(data);
            });
        }, _this.getDataMappingToList = function (fieldName, dataMappings) {
            if (_lodash2.default.isNil(dataMappings[fieldName])) {
                alert('fields [' + fieldName + '] missing data mappings config');
                console.error('fields [' + fieldName + '] missing data mappings config');
                return [];
            }
            return _lodash2.default.map(dataMappings[fieldName], function (text, value) {
                return { value: value, text: text };
            });
        }, _this.getFormField = function (field, fieldName, dataMappings) {
            var currentDt = _this.props.currentDt;
            var cfgFields = currentDt.fields;

            var newField = {};
            switch (field.type) {
                case FILED_TYPE.INPUT:
                    newField.editor = _input2.default;
                    newField.props = field.props;
                    break;
                case FILED_TYPE.DATE:
                    newField.editor = _datePicker2.default;
                    // tempField.props.required = field.required ? field.required : false
                    break;
                case FILED_TYPE.IMAGE:
                    newField.editor = _imagesUpdate2.default;
                    newField.props = field.props;
                    newField.onChange = function (imageArray, event) {
                        var isUpdate = _this.state.isUpdate;

                        if (isUpdate) {
                            //準備資料放到__fileInfoToAdd供 base service 新增檔案的api 使用
                            //新增檔案
                            var imageList = _lodash2.default.chain(imageArray).omitBy(function (_ref3) {
                                var base64 = _ref3.base64;
                                //只取base64的部分
                                return _lodash2.default.isNil(base64);
                            }).map(function (_ref4) {
                                var base64 = _ref4.base64;

                                return base64;
                            }).value();
                            if (imageList.length > 0) _lodash2.default.set(event, ['__fileInfoToAdd', fieldName], imageList);else {
                                //空值得話要把欄位清掉
                                var fileInfoToAdd = _lodash2.default.get(event, '__fileInfoToAdd');
                                fileInfoToAdd = _lodash2.default.omitBy(fileInfoToAdd, function (o, key) {
                                    return key === fieldName;
                                });
                                _lodash2.default.set(event, ['__fileInfoToAdd'], fileInfoToAdd);
                            }
                            //刪除檔案
                            if (_lodash2.default.has(event, fieldName)) {
                                var originUrlList = (0, _imageHelper.findUrlFromFileServiceFormat)(event, fieldName);
                                var newUrlList = _lodash2.default.chain(imageArray).omitBy(function (_ref5) {
                                    var url = _ref5.url;
                                    //只取得url的部分
                                    return _lodash2.default.isNil(url);
                                }).map(function (_ref6) {
                                    var url = _ref6.url;

                                    return url;
                                }).value();

                                var fileUrlToDelete = _lodash2.default.xor(originUrlList, newUrlList); //去掉重複的，即為需要刪除的
                                var fileInfoToDelete = _lodash2.default.chain(fileUrlToDelete).map(function (fileServerPath) {
                                    var fileInfoIndex = _lodash2.default.findIndex(event['__fileInfo'], function (o) {
                                        return o.fileServerPath === fileServerPath;
                                    });
                                    try {
                                        var fileInfo = _lodash2.default.get(event, ['__fileInfo', fileInfoIndex]);
                                        var referencePath = (0, _imageHelper.findrReferencePathForFileServiceToDelete)(event, fieldName, fileInfo.uuid);
                                        return { referencePath: referencePath, uuid: fileInfo.uuid, url: fileInfo.fileServerPath };
                                    } catch (e) {
                                        log.info('no matched file url', e);
                                        return null;
                                    }
                                }).value();
                                _lodash2.default.set(event, ['__fileInfoToDelete'], fileInfoToDelete);
                            }
                        } else {
                            var _imageList = _lodash2.default.map(imageArray, function (_ref7) {
                                var base64 = _ref7.base64;

                                return base64;
                            });
                            _lodash2.default.set(event, fieldName, _imageList);
                        }
                        _this.handleFormChange(event);
                    };
                    newField.preProcess = function (event) {
                        var isUpdate = _this.state.isUpdate;

                        var imageArray = [];
                        if (isUpdate) {
                            if (_lodash2.default.has(event, fieldName)) {
                                var urlList = (0, _imageHelper.findUrlFromFileServiceFormat)(event, fieldName);
                                var fileUrlToDelete = _lodash2.default.map(_lodash2.default.get(event, ['__fileInfoToDelete']), function (o) {
                                    return o.url;
                                }); //取得點選刪除的圖片url
                                urlList = _lodash2.default.xor(urlList, fileUrlToDelete); //去掉重複的，即保留不須刪除的
                                imageArray = _lodash2.default.concat(imageArray, _lodash2.default.map(urlList, function (urlString) {
                                    return { url: urlString, name: '' };
                                }));
                            }
                            if (_lodash2.default.has(event, ['__fileInfoToAdd', fieldName])) {
                                var imageArrayFromAdd = _lodash2.default.map(_lodash2.default.get(event, ['__fileInfoToAdd', fieldName]), function (base64String) {
                                    return { base64: base64String, name: '' };
                                });
                                imageArray = _lodash2.default.concat(imageArray, imageArrayFromAdd);
                            }
                        } else {
                            if (_lodash2.default.has(event, fieldName)) {
                                imageArray = _lodash2.default.map(_lodash2.default.get(event, fieldName), function (base64String) {
                                    return { base64: base64String, name: '' };
                                });
                            }
                        }
                        return imageArray;
                    };
                    break;
                case FILED_TYPE.FILE:
                    newField.editor = _filesUpdate2.default;
                    newField.props = field.props;
                    newField.onChange = function (value) {
                        var data = _this.state.data;

                        if (!_lodash2.default.has(field, ['props', 'fileField'])) {
                            var fileList = _lodash2.default.map(value, function (_ref8) {
                                var base64 = _ref8.base64;

                                return base64;
                            });
                            _lodash2.default.set(data, fieldName, fileList);
                        } else {
                            var fileField = _lodash2.default.get(field, ['props', 'fileField']);
                            var nameField = _lodash2.default.get(field, ['props', 'nameField']);
                            var _fileList = _lodash2.default.map(value, function (_ref9) {
                                var _ref10;

                                var base64 = _ref9.base64,
                                    name = _ref9.name;

                                return _ref10 = {}, _defineProperty(_ref10, fileField, base64), _defineProperty(_ref10, nameField, name), _ref10;
                            });
                            _lodash2.default.set(data, fieldName, _fileList);
                        }
                        _this.handleFormChange(data);
                    };
                    newField.preProcess = function (event) {
                        var fileArray = [];
                        if (_lodash2.default.has(event, fieldName)) {
                            if (!_lodash2.default.has(field, ['props', 'fileField'])) {
                                fileArray = _lodash2.default.map(_lodash2.default.get(event, fieldName), function (base64String) {
                                    return { base64: base64String, name: '' };
                                });
                            } else {
                                var fileField = _lodash2.default.get(field, ['props', 'fileField']);
                                var nameField = _lodash2.default.get(field, ['props', 'nameField']);
                                fileArray = _lodash2.default.map(_lodash2.default.get(event, fieldName), function (content) {
                                    return { base64: content[fileField], name: content[nameField] };
                                });
                            }
                        }
                        return fileArray;
                    };
                    break;
                case FILED_TYPE.CHECKBOX:
                    newField.editor = _checkbox2.default;
                    break;
                case FILED_TYPE.TEXT_AREA:
                    newField.editor = _textarea2.default;
                    break;
                case FILED_TYPE.DROP_DOWN_LIST:
                    newField.editor = _dropdown2.default;
                    newField.props = {
                        list: _this.getDataMappingToList(fieldName, dataMappings)
                    };
                    break;
                case FILED_TYPE.RADIO_GROUP:
                    newField.editor = _radioGroup2.default;
                    newField.props = {
                        list: _this.getDataMappingToList(fieldName, dataMappings)
                    };
                    break;
                case FILED_TYPE.TABLE:
                    newField.editor = _AddableTable2.default;
                    newField.props = {
                        fields: _lodash2.default.chain(field.props.fields) //array轉成object
                        .keyBy('fieldKey').mapValues(function (childField, childFieldName) {
                            return _this.getFormField(childField, fieldName + '.' + childField.fieldKey, dataMappings);
                        }).value()
                    };
                    break;
                case FILED_TYPE.GROUP_FORM:
                    newField.editor = _groupForm2.default;
                    newField.props = {
                        fields: _lodash2.default.chain(field.props.fields) //array
                        .keyBy('fieldKey').mapValues(function (childField, childFieldName) {
                            var newChildField = _this.getFormField(childField, childField.fieldKey, dataMappings);
                            newChildField.gridWidth = _lodash2.default.get(childField, ['gridWidth'], '24');
                            return newChildField;
                        }).value(),
                        label: field.props.label
                    };
                    newField.onChange = function (groupFormValue) {
                        var data = _this.state.data;

                        _lodash2.default.forEach(field.props.fields, function (_ref11) {
                            var fieldKey = _ref11.fieldKey;

                            if (_lodash2.default.has(groupFormValue, fieldKey)) _lodash2.default.set(data, fieldKey, _lodash2.default.get(groupFormValue, fieldKey));
                        });
                        _this.handleFormChange(data);
                    };
                    newField.preProcess = function (event) {
                        // let processedValue = {}
                        // _.forEach(field.props.fields, ({fieldKey}) => {
                        //     if (_.has(event, fieldKey))
                        //         _.set(processedValue, fieldKey, _.get(event, fieldKey))
                        // })
                        return event;
                    };
                    break;
                case FILED_TYPE.MULTI_DROP_DOWN_LIST:
                    newField.editor = _MultiDropDownList2.default;
                    newField.props = field.props;
                    newField.props.dataMappings = dataMappings;
                    newField.onChange = function (mValue) {
                        var data = _this.state.data;

                        var combineToFieldKey = _lodash2.default.get(field, ['props', 'combineToFieldKey'], null);
                        var combinString = '';
                        _lodash2.default.forEach(field.props.fields, function (_ref12) {
                            var fieldKey = _ref12.fieldKey,
                                _ref12$ifKeep = _ref12.ifKeep,
                                ifKeep = _ref12$ifKeep === undefined ? true : _ref12$ifKeep;

                            // if (ifKeep)
                            data[fieldKey] = mValue[fieldKey];
                            if (combineToFieldKey) combinString += mValue[fieldKey] ? mValue[fieldKey] : '';
                        });
                        if (combineToFieldKey) _lodash2.default.set(data, combineToFieldKey, combinString);
                        _this.handleFormChange(data);
                    };
                    newField.preProcess = function (event) {
                        var processedValue = {};
                        _lodash2.default.forEach(field.props.fields, function (_ref13) {
                            var fieldKey = _ref13.fieldKey;

                            if (_lodash2.default.has(event, fieldKey)) _lodash2.default.set(processedValue, fieldKey, _lodash2.default.get(event, fieldKey));
                        });
                        return processedValue;
                    };
                    break;
                default:
                    //可以允許沒設定，或設定錯誤，這邊就會以property的type來對應預設欄位。
                    if (!_lodash2.default.has(cfgFields, fieldName.replace('.', '.properties.'))) {
                        console.error('no match property name [' + fieldName + '] in config');
                        newField.label = _react2.default.createElement(
                            'a',
                            { className: 'c-error' },
                            fieldName,
                            ' (error config)'
                        );
                        newField.editor = _input2.default;
                        newField.props = { disabled: true, placeholder: 'error config', className: 'c-error', required: true };
                        return newField;
                    }
                    switch (cfgFields[fieldName].type) {//如果沒設定的話會依照properties的type給預設值
                        case 'text':
                        case 'keyword':
                        case 'float':
                            newField.editor = _input2.default;
                            break;
                        case 'date':
                            newField.editor = _datePicker2.default;
                            break;
                        case 'image':
                            newField.editor = _imagesUpdate2.default;
                            break;
                        case 'boolean':
                            newField.editor = _checkbox2.default;
                            break;
                        default:
                            newField.editor = _input2.default;
                            break;
                    }
            }
            //驗證規則
            newField.validRules = _lodash2.default.get(field, 'validRules', []);
            //必填
            var ifRequired = _lodash2.default.indexOf(field.validRules, 'required') > -1;
            _lodash2.default.set(newField, ['props', 'required'], ifRequired);
            //label
            if (field.type === 'GroupForm') {
                newField.label = '';
            } else {
                if (fieldName.indexOf('.') > 0) {
                    //確認是否為物件
                    var fieldPathInConfigFields = fieldName.replace(/\./g, '.properties.').split('.');
                    newField.label = _lodash2.default.get(cfgFields, [].concat(_toConsumableArray(fieldPathInConfigFields), ['display_name']), fieldName);
                } else {
                    newField.label = _lodash2.default.get(cfgFields, [fieldName, 'display_name'], fieldName);
                }
            }
            return newField;
        }, _this.getFields = function (isUpdate, dataMappings) {
            var currentDt = _this.props.currentDt;

            var editorFields = void 0;
            if (isUpdate) editorFields = _lodash2.default.get(currentDt, ['editors', 'updateFields'], null);else editorFields = _lodash2.default.get(currentDt, ['editors', 'addFields'], null);

            if (_lodash2.default.isNil(editorFields)) {
                //沒設定config 則無法使用
                return null;
            }

            editorFields = _lodash2.default.chain(editorFields).map(function (val, key) {
                var order = parseInt(val.order);
                var newVal = _lodash2.default.omit(val, ['order']);
                return _extends({ __key: key, order: order }, newVal);
            }).sortBy('order').keyBy('__key').omitBy(function (o) {
                return o.type === FILED_TYPE.HIDE; //hide不須呈現
                // || (isUpdate && (o.type === FILED_TYPE.FILE || o.type === FILED_TYPE.IMAGE))//製作中
            }).mapValues(function (o) {
                delete o.__key;
                return o;
            }).value();
            var newEditorFields = _lodash2.default.mapValues(editorFields, function (field, fieldName) {
                return _this.getFormField(field, fieldName, dataMappings);
            });
            log.info("All Editor Fields", newEditorFields);
            return newEditorFields;
        }, _this.handleFormChange = function (formData) {
            log.info('nowEditorData', formData);
            _this.setState({ data: formData });
        }, _this.postTreatment = function (formData) {
            var currentDt = _this.props.currentDt;
            var isUpdate = _this.state.isUpdate;

            var onConfirm = isUpdate ? _this.handleUpdateEvent : _this.handleCreateEvent;
            var editorFields = isUpdate ? _lodash2.default.get(currentDt, ['editors', 'updateFields'], null) : _lodash2.default.get(currentDt, ['editors', 'addFields'], null);
            var resultFormData = {};
            //依照conifg，處理一些需要額外處理的input
            //hide type資料從session或其他地方取值
            var referenceError = false;
            _lodash2.default.forEach(editorFields, function (field, key) {
                switch (field.type) {
                    case 'Hide':
                        if (!_lodash2.default.has(field, ['props', 'referenceTo']) || !_lodash2.default.has(_this.props, field.props.referenceTo)) {
                            referenceError = true;
                            return;
                        }
                        var value = _lodash2.default.get(_this.props, field.props.referenceTo);
                        if (_lodash2.default.has(field, 'props.formatter')) {
                            value = new Function("referenceTo", field.props.formatter)(value);
                        }
                        resultFormData[key] = value;
                        break;
                    default:
                        break;
                }
            });
            if (referenceError) {
                _this.setState({ info: 'hide 類型 reference 資料無法取得', error: true });
                return;
            }
            //2.其他特殊處理
            _lodash2.default.forEach(formData, function (value, key) {
                _lodash2.default.set(resultFormData, key, value);
            });
            log.info('base form submit:', resultFormData);
            if (!_this.validation(resultFormData)) return;
            _this.setState(_lodash2.default.clone(INITIAL_STATE), function () {
                onConfirm(resultFormData);
            });
        }, _this.validation = function (data) {
            var currentDt = _this.props.currentDt;
            var isUpdate = _this.state.isUpdate;

            var fields = isUpdate ? _this.state.updateEditorFields : _this.state.addEditorFields;
            var editorFields = isUpdate ? _lodash2.default.get(currentDt, ['editors', 'updateFields'], null) : _lodash2.default.get(currentDt, ['editors', 'addFields'], null);
            var errMsg = '';
            var errorList = [];
            _lodash2.default.forEach(fields, function (field, key) {
                var editorField = _lodash2.default.get(editorFields, [key]);
                if (_lodash2.default.has(field, ['props', 'fields']) && (editorField.type === FILED_TYPE.TABLE || editorField.type === FILED_TYPE.MULTI_DROP_DOWN_LIST || editorField.type === FILED_TYPE.GROUP_FORM)) {
                    switch (editorField.type) {
                        case FILED_TYPE.TABLE:
                            var error = false;
                            _lodash2.default.forEach(field.props.fields, function (childField, childKey) {
                                if (error) return false;
                                if (!_lodash2.default.isNil(childField.validRules) && !_lodash2.default.isEmpty(childField.validRules)) {
                                    var arrayList = _lodash2.default.get(data, key, {});
                                    _lodash2.default.forEach(arrayList, function (val, index) {
                                        var errorMessage = _validation.Validation.validateWithErrorMessage(val[childKey], childField.validRules, childField.label);
                                        if (errorMessage != null) {
                                            errorList.push(field.label + '\u8CC7\u6599\u6709\u8AA4(' + errorMessage + ')');
                                            error = true;
                                            return false;
                                        }
                                    });
                                }
                            });
                            break;
                        case FILED_TYPE.MULTI_DROP_DOWN_LIST:
                        case FILED_TYPE.GROUP_FORM:
                            _lodash2.default.forEach(field.props.fields, function (childField, childKey) {
                                if (!_lodash2.default.isNil(childField.validRules) && !_lodash2.default.isEmpty(childField.validRules)) {
                                    var value = _lodash2.default.get(data, childKey, '');
                                    var errorMessage = _validation.Validation.validateWithErrorMessage(value, childField.validRules, childField.label);
                                    if (errorMessage != null) {
                                        errorList.push(field.props.label + '-' + errorMessage);
                                    }
                                }
                            });
                            break;
                        default:
                            break;
                    }
                } else if (!_lodash2.default.isNil(field.validRules) && !_lodash2.default.isEmpty(field.validRules)) {
                    var errorMessage = _validation.Validation.validateWithErrorMessage(data[key], field.validRules, field.label);
                    if (errorMessage !== null) errorList.push(errorMessage);
                }
            });
            console.log('errorList: ', errorList);
            _lodash2.default.forEach(errorList, function (massage) {
                errMsg += massage + ', ';
            });
            if (errMsg === '') {
                _this.setState({ info: null, error: false });
                return true;
            }
            errMsg = errMsg.slice(0, errMsg.length - 2);
            _this.setState({ info: errMsg, error: true });
            return false;
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(defaultEditor, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var data_mappings = this.props.currentDt.data_mappings;

            this.preLoad(data_mappings);
            var _ref = this.props._ref;

            if (_ref) {
                _ref(this);
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var nextCurrentDt = nextProps.currentDt,
                data_mappings = nextProps.currentDt.data_mappings;
            var currentDt = this.props.currentDt;

            if (nextCurrentDt !== currentDt) this.preLoad(data_mappings);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                currentDt = _props.currentDt,
                id = _props.id;
            var _state = this.state,
                data = _state.data,
                open = _state.open,
                isUpdate = _state.isUpdate,
                info = _state.info,
                error = _state.error;

            var fields = isUpdate ? this.state.updateEditorFields : this.state.addEditorFields;
            if (info === gt('txt-loading')) return null;
            if (!open) {
                return null;
            }
            var width = _lodash2.default.get(currentDt, ['editors', 'width'], '80%');
            if (!/%/.test(width)) width += 'px';
            return _react2.default.createElement(
                _modalDialog2.default,
                {
                    id: currentDt.display_name + '-' + (isUpdate ? 'edit' : 'add'),
                    className: 'event-editor-form',
                    title: currentDt.display_name + ' - ' + (isUpdate ? '編輯' : '新增'),
                    style: { width: width },
                    draggable: true,
                    global: true,
                    info: info,
                    infoClassName: (0, _classnames2.default)({ 'c-error': error }),
                    closeAction: 'cancel',
                    actions: {
                        cancel: { text: '取消', className: 'standard', handler: this.close },
                        confirm: {
                            text: '確認', handler: function handler() {
                                _this2.postTreatment(data);
                            }
                        }
                    } },
                _react2.default.createElement(
                    'div',
                    { className: 'c-flex' },
                    _react2.default.createElement(_baseForm2.default, {
                        className: 'grow',
                        formClassName: 'c-form',
                        fields: fields,
                        onChange: this.handleFormChange,
                        value: data })
                )
            );
        }
    }]);

    return defaultEditor;
}(_react2.default.Component);

defaultEditor.propTypes = {
    currentDt: _propTypes2.default.object.isRequired,
    lng: _propTypes2.default.string,
    onUpdate: _propTypes2.default.func,
    onCreate: _propTypes2.default.func
};
exports.default = (0, _localeProvider2.default)(defaultEditor);