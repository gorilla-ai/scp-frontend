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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _objectPathImmutable = require('object-path-immutable');

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _table = require('react-ui/build/src/components/table');

var _table2 = _interopRequireDefault(_table);

var _buttonGroup = require('react-ui/build/src/components/button-group');

var _buttonGroup2 = _interopRequireDefault(_buttonGroup);

var _reactAddonsCreateFragment = require('react-addons-create-fragment');

var _reactAddonsCreateFragment2 = _interopRequireDefault(_reactAddonsCreateFragment);

var _loader = require('vbda/loader');

var _syntax = require('vbda/parser/syntax');

var _localeProvider = require('../../hoc/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('vbda/components/visualization/defaultDetail');
var gt = global.vbdaI18n.getFixedT(null, 'vbda');

/**
 * @param cfg config
 * @param event event data
 *
 */
var IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'tiff', 'bmp'];
var WORD_BREAK = { wordBreak: "break-word" };

var defaultDetail = function (_React$Component) {
    _inherits(defaultDetail, _React$Component);

    function defaultDetail(props, context) {
        _classCallCheck(this, defaultDetail);

        var _this = _possibleConstructorReturn(this, (defaultDetail.__proto__ || Object.getPrototypeOf(defaultDetail)).call(this, props, context));

        _initialiseProps.call(_this);

        var dtCfg = props.dtCfg;

        var cfgDetailTabs = _lodash2.default.cloneDeep(_lodash2.default.get(dtCfg, ['detail', 'tabs'], null));
        if (!cfgDetailTabs) {
            //沒有對應config
            var _event = props.event;


            _this.state = {
                info: gt('txt-config-error') + '(' + _event.__data_source + '-' + _event.__data_type + ')',
                error: true
            };

            return _possibleConstructorReturn(_this);
        }
        var event = _this.prepareFileToEvent();

        _this.state = {
            event: event,
            nowTab: 0,
            arrayIndex: {},
            info: gt('txt-loading')
        };
        return _this;
    }

    _createClass(defaultDetail, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var data_mappings = this.props.dtCfg.data_mappings;

            if (this.state.error) {
                //config 設置錯誤
                return;
            }
            _loader.config.processDataMappings(data_mappings).then(function (dataMappings) {
                _this2.afterLoadDataMapping(dataMappings);
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _state = this.state,
                tabs = _state.tabs,
                nowTab = _state.nowTab,
                info = _state.info,
                error = _state.error;

            if (info) return this.renderInfo(info, error);
            var list = _lodash2.default.map(tabs, function (_ref, index) {
                var label = _ref.label;

                return { value: index, text: label };
            });
            var fragments = (0, _reactAddonsCreateFragment2.default)({
                tabs: tabs.length > 1 ? _react2.default.createElement(
                    'div',
                    { className: 'c-flex aic jcsb fixed c-toolbar' },
                    _react2.default.createElement(_buttonGroup2.default, {
                        list: list,
                        value: nowTab,
                        onChange: function onChange(value) {
                            _this3.setState({ nowTab: value });
                        }
                    })
                ) : null,

                groups: _react2.default.createElement(
                    'div',
                    { className: 'c-flex boxes' },
                    _lodash2.default.map(tabs[nowTab].groups, function (group, index) {
                        return _this3.renderGroup(group, index);
                    })
                )
            });
            return _react2.default.createElement(
                'div',
                { id: 'info_main', className: 'defaultDetail' },
                fragments
            );
        }
    }]);

    return defaultDetail;
}(_react2.default.Component);

defaultDetail.propTypes = {
    dtCfg: _propTypes2.default.object,
    event: _propTypes2.default.object
};

var _initialiseProps = function _initialiseProps() {
    var _this5 = this;

    this.afterLoadDataMapping = function (dataMappings) {
        log.info('afterLoadDataMapping', dataMappings);
        var tabs = _this5.mappingEventToFields(_extends({}, dataMappings));
        if (tabs.length !== 0) {
            _this5.setState({
                info: null,
                tabs: tabs
            });
        } else {
            _this5.setState({
                info: gt('txt-config-error'),
                error: true
            });
        }
    };

    this.mappingEventToFields = function (dataMappings) {
        var dtCfg = _this5.props.dtCfg;

        var cfgDetail = _lodash2.default.cloneDeep(_lodash2.default.get(dtCfg, ['detail'], null));
        var result = _lodash2.default.chain(cfgDetail.tabs).sortBy('order').map(function (_ref3) {
            var label = _ref3.label,
                groups = _ref3.groups;

            groups = _lodash2.default.chain(groups).sortBy('order').map(function (group) {
                // let data = {}
                var fields = group.fields,
                    type = group.type;

                switch (type) {//基本的
                    default:
                        fields = _lodash2.default.chain(fields).map(function (_ref4, fieldName) {
                            var order = _ref4.order,
                                format = _ref4.format;

                            var dataMapping = _lodash2.default.get(dataMappings, fieldName, null);
                            return fields = {
                                __name: fieldName,
                                label: _this5.getDisplayName(fieldName),
                                formatter: _this5.getFormatter(fieldName, dataMapping, _this5.getFormatterByDetailConfig(format)),
                                order: order
                            };
                        }).sortBy('order').keyBy('__name').mapValues(function (o) {
                            delete o.__name;
                            delete o.order;
                            return o;
                        }).value();
                        group.type = 'list';
                        break;
                    case 'table':
                    case 'array':
                        if (_lodash2.default.isNil(_lodash2.default.get(group, 'props.rootKey'))) return group; //設置錯誤不處理
                        var rootKey = group.props.rootKey;

                        fields = _lodash2.default.chain(fields).map(function (_ref5, fieldName) {
                            var order = _ref5.order,
                                format = _ref5.format;

                            var dataMapping = _lodash2.default.get(dataMappings, fieldName, null);
                            return {
                                __name: fieldName.replace(rootKey + '.', ''),
                                label: _this5.getDisplayName(fieldName),
                                formatter: _this5.getFormatter(fieldName, dataMapping, _this5.getFormatterByDetailConfig(format)),
                                order: order
                            };
                        }).sortBy('order').keyBy('__name').mapValues(function (o) {
                            delete o.__name;
                            delete o.order;
                            return o;
                        }).value();
                        break;

                }
                // group.data = data//考慮到別得地方可能需要用到完整的event，暫時不這樣做
                group.fields = fields;
                return group;
            }).value();
            return { label: label, groups: groups };
        }).value();
        console.log(result);
        return result;
    };

    this.getDisplayName = function (key) {
        var dtCfg = _this5.props.dtCfg;

        var cfgDtFields = dtCfg.fields;
        var fieldNamePathArray = _lodash2.default.split(key.replace(/\./g, '.properties.'), '.');
        return _lodash2.default.get(cfgDtFields, [].concat(_toConsumableArray(fieldNamePathArray), ['display_name']), key);
    };

    this.getType = function (key) {
        //TODO 未來應該有別的地方定義type而不是由property決定
        var dtCfg = _this5.props.dtCfg;

        var cfgDtFields = dtCfg.fields;
        var fieldNamePathArray = _lodash2.default.split(key.replace(/\./g, '.properties.'), '.');
        var type = _lodash2.default.get(cfgDtFields, [].concat(_toConsumableArray(fieldNamePathArray), ['type']), null);
        return type;
    };

    this.getFormatterByDetailConfig = function () {
        var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var type = format.type,
            _format$props = format.props,
            props = _format$props === undefined ? {} : _format$props;

        log.info(format);
        switch (type) {
            case 'hyper-link':
                var linkFormatter = function linkFormatter(value, data) {
                    if (_lodash2.default.isNil(value) || value === '') return gt('field-no-data');
                    return _react2.default.createElement(
                        'a',
                        { href: props.prefix ? props.prefix + value : value, target: '_blank' },
                        _react2.default.createElement('i', { className: 'fg fg-globe' }),
                        props.label_string ? (0, _syntax.syntaxStringParse)(props.label_string, data) : value
                    );
                };
                return linkFormatter;
            default:
                return null;
        }
    };

    this.getFormatter = function (key, dataMapping, customFormatter) {
        var type = void 0;
        if (customFormatter) type = 'default'; //一律用default
        else type = _this5.getType(key);
        switch (type) {
            default:
                var defaultFormatter = function defaultFormatter(value, data) {
                    if (dataMapping) {
                        value = _lodash2.default.get(dataMapping, value, value);
                    }
                    if (_lodash2.default.isArray(value)) {
                        var dataTableFields = {
                            fakeKey: {
                                label: '', formatter: function formatter(value, tableRowData) {
                                    return _react2.default.createElement(
                                        'div',
                                        { style: WORD_BREAK },
                                        !_lodash2.default.isNil(value) ? customFormatter ? customFormatter(value, tableRowData) : value : gt('field-no-data')
                                    );
                                }
                            }
                        };
                        var valArray = _lodash2.default.chain(value).map(function (o) {
                            return { fakeKey: o };
                        }).value();
                        return _react2.default.createElement(_table2.default, { className: 'bland no_header',
                            fields: dataTableFields,
                            data: valArray
                        });
                    }
                    value = !_lodash2.default.isNil(value) ? value !== '' ? value : ' ' : value;
                    return _react2.default.createElement(
                        'div',
                        { key: key, style: WORD_BREAK },
                        !_lodash2.default.isNil(value) ? customFormatter ? customFormatter(value, data) : value : gt('field-no-data')
                    );
                };
                return defaultFormatter;
            case 'image':
                var imageFormatter = function imageFormatter(value) {
                    return _react2.default.createElement(
                        'div',
                        { key: key },
                        !_lodash2.default.isEmpty(value) ? _lodash2.default.map(value, function (val, index) {
                            return _react2.default.createElement(CustomImage, { key: index, srcString: val });
                        }) : gt('field-no-data')
                    );
                };
                return imageFormatter;
            case 'date':
                var dateFormatter = function dateFormatter(value) {
                    return _react2.default.createElement(
                        'div',
                        { key: key },
                        !_lodash2.default.isEmpty(value) ? (0, _moment2.default)(value).format('YYYY-MM-DD HH:mm:ss') : gt('field-no-data')
                    );
                };
                return dateFormatter;
            case 'file':
            case 'video':
                var fileFormatter = function fileFormatter(value) {
                    return _react2.default.createElement(
                        'div',
                        { key: key },
                        !_lodash2.default.isEmpty(value) ? _lodash2.default.map(value, function (val, index) {
                            var fileNameExtension = val.slice(val.lastIndexOf('.') + 1);
                            var isImage = false;
                            _lodash2.default.forEach(IMAGE_EXTENSIONS, function (IMAGE_EXTENSION) {
                                if (fileNameExtension.toLowerCase() === IMAGE_EXTENSION) {
                                    isImage = true;
                                    return false;
                                }
                            });
                            if (isImage) {
                                return _react2.default.createElement(CustomImage, { key: index, srcString: val });
                            }
                            return _react2.default.createElement(
                                'button',
                                { key: index,
                                    onClick: function onClick() {
                                        _this5.downloadDataUrl('/api/file/' + val);
                                    }
                                },
                                _react2.default.createElement('i', { className: 'c-link fg fg-data-download', title: val })
                            );
                        }) : gt('field-no-data')
                    );
                };
                return fileFormatter;
            case 'boolean':
                var booleanFormatter = function booleanFormatter(value) {
                    return _react2.default.createElement(
                        'div',
                        { key: key },
                        !_lodash2.default.isNil(value) ? _react2.default.createElement(
                            'div',
                            null,
                            value === true ? '是' : '否'
                        ) : gt('field-no-data')
                    );
                };
                return booleanFormatter;
        }
    };

    this.getValue = function (key) {
        //TODO Mapping
        var event = _this5.state.event;
        // const fieldNamePathArray = _.split(key.replace(/\./g, '.properties.'), '.')

        return _lodash2.default.get(event, key, null);
    };

    this.prepareFileToEvent = function () {
        var _props = _this5.props,
            dtCfg = _props.dtCfg,
            propsEvent = _props.event;

        var newEvent = _lodash2.default.cloneDeep(propsEvent);
        if (_lodash2.default.isEmpty(propsEvent.__fileInfo)) return newEvent;
        var fields = dtCfg.fields;
        var fileMapping = _lodash2.default.chain(propsEvent.__fileInfo).keyBy('uuid').value();
        newEvent = _this5.parseFileObject(newEvent, fields, fileMapping);
        log.info('fomattedEventWithFileInfo', newEvent);
        return newEvent;
    };

    this.parseFileObject = function (event, fields, fileMapping) {
        _lodash2.default.forEach(fields, function (field1, key1) {
            if (field1.type) {
                //有type就不是object
                switch (field1.type) {
                    case 'image':
                    case 'file':
                        if (_lodash2.default.has(event, '__' + key1)) {
                            var fileUUIDList = [];
                            fileUUIDList = _lodash2.default.concat(fileUUIDList, _lodash2.default.get(event, '__' + key1));
                            var fileUrlList = _lodash2.default.map(fileUUIDList, function (fileUUID) {
                                return fileMapping[fileUUID].fileServerPath;
                            });
                            _lodash2.default.set(event, key1, fileUrlList);
                        } else {
                            //可能是object array的形式，再次檢查
                            if (_lodash2.default.isArray(event) && !_lodash2.default.isEmpty(event) && _lodash2.default.isObject(event[0])) {
                                event = _lodash2.default.map(event, function (e) {
                                    if (_lodash2.default.has(e, '__' + key1)) {
                                        var _fileUUIDList = [];
                                        _fileUUIDList = _lodash2.default.concat(_fileUUIDList, _lodash2.default.get(e, '__' + key1));
                                        var _fileUrlList = _lodash2.default.map(_fileUUIDList, function (fileUUID) {
                                            return fileMapping[fileUUID].fileServerPath;
                                        });
                                        _lodash2.default.set(e, key1, _fileUrlList);
                                    }
                                    return e;
                                });
                            }
                        }
                        break;
                    default:
                        break;
                }
            } else {
                var childFieldsEvent = _this5.parseFileObject(_lodash2.default.get(event, [key1]), field1.properties, fileMapping);
                _lodash2.default.set(event, key1, childFieldsEvent);
            }
        });
        return event;
    };

    this.parseFieldsForDetail = function (fields) {
        //遞迴把displayName換掉
        var resultFields = {};
        _lodash2.default.forEach(fields, function (_ref6, key) {
            var type = _ref6.type;

            var title = _lodash2.default.get(fields, key + '.display_name', key);
            if (type) {
                //有type就不是object
                resultFields[key] = {
                    title: title,
                    type: type
                };
            } else {
                var properties = _this5.parseFieldsForDetail(fields[key].properties, fields);
                resultFields[key] = {
                    title: title,
                    properties: properties
                };
            }
        });
        return resultFields;
    };

    this.renderGroup = function (group, groupIndex) {
        var label = group.label,
            type = group.type,
            fields = group.fields,
            props = group.props,
            width = group.width;
        var _state3 = _this5.state,
            arrayIndex = _state3.arrayIndex,
            event = _state3.event;

        var header = void 0;
        var content = void 0;
        switch (type) {
            default:
                header = _react2.default.createElement(
                    'header',
                    null,
                    label
                );
                content = _react2.default.createElement(
                    'div',
                    { className: 'content c-result' },
                    _this5.renderGroupContent(fields, event)
                );
                break;
            case 'table':
                header = _react2.default.createElement(
                    'header',
                    null,
                    label
                );
                content = _react2.default.createElement(
                    'div',
                    { className: 'content c-result' },
                    _this5.renderGroupTable(fields, _this5.getValue(props.rootKey))
                );
                break;
            case 'array':
                if (_lodash2.default.isNil(_lodash2.default.get(props, 'rootKey'))) {
                    //設置錯誤不處理
                    header = _react2.default.createElement(
                        'header',
                        { className: 'dspFlex' },
                        label
                    );
                    content = _react2.default.createElement(
                        'div',
                        { className: 'content' },
                        _react2.default.createElement(
                            'div',
                            { className: 'c-error' },
                            gt('txt-config-error') + '(missing root key)'
                        )
                    );
                    break;
                }
                var rootKey = props.rootKey;

                var index = _lodash2.default.get(arrayIndex, rootKey, 0);
                var rootValue = _this5.getValue(rootKey);
                var data = _lodash2.default.get(rootValue, index, {});
                header = _react2.default.createElement(
                    'header',
                    { className: 'dspFlex' },
                    !_lodash2.default.isNil(rootValue) ? function () {
                        var maxLength = rootValue.length;
                        if (_lodash2.default.isEmpty(data)) return label + '0/0';
                        return _react2.default.createElement(
                            'div',
                            { className: 'c-flex' },
                            _react2.default.createElement(
                                'div',
                                null,
                                label
                            ),
                            _react2.default.createElement(
                                'div',
                                { className: 'c-flex' },
                                _react2.default.createElement('i', { className: 'fg fg-arrow-left', onClick: function onClick() {
                                        if (index !== 0) _this5.setState({ arrayIndex: _objectPathImmutable2.default.set(arrayIndex, rootKey, index - 1) });
                                    } }),
                                index + 1,
                                '/',
                                maxLength,
                                _react2.default.createElement('i', { className: 'fg fg-arrow-right', onClick: function onClick() {
                                        if (index < maxLength - 1) _this5.setState({ arrayIndex: _objectPathImmutable2.default.set(arrayIndex, rootKey, index + 1) });
                                    } })
                            )
                        );
                    }() : label
                );
                content = _react2.default.createElement(
                    'div',
                    { className: 'content c-result' },
                    _this5.renderGroupContent(fields, data)
                );
                break;
        }
        return _react2.default.createElement(
            'div',
            { key: groupIndex, className: (0, _classnames2.default)('c-box', width ? '' : 'grow'), style: { flexBasis: width ? 'auto' : '200px', width: width ? width + 'px' : '100%' } },
            header,
            content
        );
    };

    this.renderGroupContent = function (fields, data) {
        if (_lodash2.default.isEmpty(data)) return _react2.default.createElement(
            'div',
            { className: 'content c-flex jcc' },
            gt('field-no-data')
        );
        return _react2.default.createElement(
            'div',
            { className: 'content c-result' },
            _lodash2.default.map(fields, function (_ref7, key) {
                var label = _ref7.label,
                    formatter = _ref7.formatter,
                    dataMapping = _ref7.dataMapping;

                var val = _lodash2.default.get(data, key, null);
                var content = formatter(val, data);
                if (_lodash2.default.isNil(val) && key.indexOf('.') > -1) {
                    //如果沒有資料，嘗試往object array的方向找
                    var rootKeyTest = key.slice(0, key.lastIndexOf('.'));
                    var childKeyTest = key.slice(key.lastIndexOf('.') + 1);
                    var objectArrayTest = _lodash2.default.get(data, rootKeyTest, null); //往上一層找，看看是不是一個Object Array
                    if (_lodash2.default.isArray(objectArrayTest)) {
                        var valueArray = _lodash2.default.map(objectArrayTest, function (object) {
                            //把Value從object array裡面的，各個object中一個一個取出來
                            var objectArrayValue = _lodash2.default.get(object, childKeyTest, null);
                            return objectArrayValue;
                        });
                        content = formatter(_this5.flattenArray(valueArray), data);
                    }
                }
                return _react2.default.createElement(
                    'div',
                    { key: key },
                    _react2.default.createElement(
                        'label',
                        { title: key },
                        label
                    ),
                    _react2.default.createElement(
                        'div',
                        { title: val },
                        content
                    )
                );
            })
        );
    };

    this.flattenArray = function (array) {
        //把多層攤成一層array
        var resultArray = [];
        _lodash2.default.forEach(array, function (val) {
            if (_lodash2.default.isArray(val)) {
                resultArray = [].concat(_toConsumableArray(resultArray), _toConsumableArray(_this5.flattenArray(val)));
            } else resultArray.push(val);
        });
        return resultArray;
    };

    this.renderGroupTable = function (fields, data) {
        if (_lodash2.default.isEmpty(data)) return _react2.default.createElement(
            'div',
            { className: 'content c-flex jcc' },
            gt('field-no-data')
        );
        log.info(fields);
        log.info(data);
        _lodash2.default.map(fields, function (field, key) {
            var val = _lodash2.default.get(data, key, null);
            if (field.dataMapping) val = _lodash2.default.get(field.dataMapping, _lodash2.default.get(data, key, null), _lodash2.default.get(data, key, null));
            log.info(val);
            return;
        });
        return _react2.default.createElement(_table2.default, { className: 'bland',
            fields: fields,
            data: data
        });
    };

    this.downloadDataUrl = function (dataUrl) {
        var fileName = dataUrl.slice(dataUrl.lastIndexOf('/'));

        // Anchor
        var anchor = document.createElement('a');
        anchor.setAttribute('href', dataUrl);
        anchor.setAttribute('download', fileName);

        // Click event
        var event = document.createEvent('MouseEvent');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

        anchor.dispatchEvent(event);
        // document.removeChild(anchor)
        // delete anchor;
    };

    this.renderInfo = function (text) {
        var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        return _react2.default.createElement(
            'div',
            { className: 'c-box grow' },
            _react2.default.createElement(
                'div',
                { className: (0, _classnames2.default)("content c-center c-info", { 'c-error': error }) },
                text
            )
        );
    };
};

exports.default = (0, _localeProvider2.default)(defaultDetail);

var CustomImage = function (_React$Component2) {
    _inherits(CustomImage, _React$Component2);

    function CustomImage() {
        var _ref2;

        var _temp, _this4, _ret;

        _classCallCheck(this, CustomImage);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this4 = _possibleConstructorReturn(this, (_ref2 = CustomImage.__proto__ || Object.getPrototypeOf(CustomImage)).call.apply(_ref2, [this].concat(args))), _this4), _this4.state = {
            imgSrc: null,
            error: false,
            nowSrcString: _this4.props.srcString
        }, _this4.preLoad = function (srcString) {
            var timeout = 30000;
            var timedOut = false,
                timer = void 0;
            var img = new Image();
            var setState = function setState(val) {
                return _this4.setState(val);
            };
            var setImageSrc = function setImageSrc(srcString) {
                return _this4.setImageSrc(srcString);
            };
            img.src = '/api/file/' + srcString;
            img.onerror = img.onabort = function () {
                if (!timedOut) {
                    clearTimeout(timer);
                    setState({ error: true });
                }
            };
            img.onload = function () {
                if (!timedOut) {
                    clearTimeout(timer);
                    setImageSrc(srcString);
                }
            };
            timer = setTimeout(function () {
                timedOut = true;
                setState({ error: true });
            }, timeout);
        }, _this4.setImageSrc = function (srcString) {
            if (srcString === _this4.state.nowSrcString) _this4.setState({ imgSrc: '/api/file/' + srcString });
        }, _temp), _possibleConstructorReturn(_this4, _ret);
    }

    _createClass(CustomImage, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var srcString = this.props.srcString;

            this.preLoad(srcString);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var srcString = nextProps.srcString;
            // log.info(srcString)

            this.setState({ imgSrc: null, error: false, nowSrcString: srcString });
            this.preLoad(srcString);
        }
    }, {
        key: 'render',
        value: function render() {
            var _state2 = this.state,
                imgSrc = _state2.imgSrc,
                error = _state2.error;
            var srcString = this.props.srcString;

            if (error) return _react2.default.createElement(
                'div',
                null,
                '\u8B80\u53D6\u5931\u6557(',
                srcString,
                ')'
            );
            if (imgSrc) return _react2.default.createElement('img', { style: { paddingLeft: '5px' }, src: imgSrc, width: '200px' });
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement('i', { className: 'fg fg-loading-2 fg-spin' })
            );
        }
    }]);

    return CustomImage;
}(_react2.default.Component);

CustomImage.propTypes = {
    srcString: _propTypes2.default.string.isRequired
};