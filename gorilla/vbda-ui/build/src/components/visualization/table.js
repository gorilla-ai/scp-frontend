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

var _reactAddonsCreateFragment = require('react-addons-create-fragment');

var _reactAddonsCreateFragment2 = _interopRequireDefault(_reactAddonsCreateFragment);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _table = require('react-ui/build/src/components/table');

var _table2 = _interopRequireDefault(_table);

var _pageNav = require('react-ui/build/src/components/page-nav');

var _pageNav2 = _interopRequireDefault(_pageNav);

var _popupDialog = require('react-ui/build/src/components/popup-dialog');

var _popupDialog2 = _interopRequireDefault(_popupDialog);

var _localeProvider = require('../../hoc/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

var _loader = require('vbda/loader');

var _syntax = require('vbda/parser/syntax');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('vbda/components/visualization/table');

var gt = global.vbdaI18n.getFixedT(null, 'vbda');
var lt = global.vbdaI18n.getFixedT(null, 'search');

/**
 * Result Table
 * @constructor
 * @param {string} [id] - Table dom element #id
 * @param {string} [className] - Classname for the table
 * @param {string} lng -
 * @param {array.<object>} data -
 * @param {number} total - total number of search results
 * @param {object} cfg - config
 * @param {object} cfg.fields - fields
 * @param {object} cfg.fields._key - field key
 * @param {object} cfg.fields._key.title - field title
 * @param {object} cfg.fields._key.type - field type
 * @param {object} [cfg.locales] -
 * @param {number} cfg.page_size - number of records to display per page
 * @param {object} [cfg.style] - style for the table
 * @param {function} onReq - Function to call when more data is requested
 * @param {function} onSelect - Function to call when event is selected
 * @param {function} onClick - Function to call when event is clicked
 *
 * @example

import _ from 'lodash'
import Table from 'vbda/components/visualization/table'

React.createClass({
    getInitialState() {
        return {
            events:{
                'xxxx':{_id:'xxxx','_index':'netflow-out-...', type:'logs'},
                'yyyy':{_id:'yyyy','_index':'netflow-out-...', type:'logs'}
            }
        }
    },
    showInGis(events) {
        // events == [{...}]
    },
    render() {
        const {events} = this.state
        return <Table
            id='t1'
            lng='en_us'
            events={events}
            page=2
            cfg={{
                fields:{
                    Identity:{title:'person_name'},
                    Locaiton:{title:'locaiton'},
                    RepresentativeImage:{title:'rep_image'},
                    _id:{hidden:true}
                },
                locales:{
                    en_us:{
                        fields:{
                            Identity:{title:'person name'},
                            Locaiton:{title:'locaiton'},
                            RepresentativeImage:{title:'rep image'}
                        },
                        data_mappings:{
                            event_types:{
                                '0':'line',
                                '1':'facebook'
                            }
                        }
                    }
                },
                page_size:25
            }}
            onReq={}
            onSelect={this.showInGis} />
    }
})
 */

var IMAGES_ROOT_PATH = '__fileInfo';

var Table = function (_React$Component) {
    _inherits(Table, _React$Component);

    function Table(props, context) {
        _classCallCheck(this, Table);

        var _this = _possibleConstructorReturn(this, (Table.__proto__ || Object.getPrototypeOf(Table)).call(this, props, context));

        _initialiseProps.call(_this);

        var events = props.events,
            cfg = props.cfg,
            fields = props.cfg.fields,
            total = props.total;

        var dataTableFields = _this.fieldsParser(fields);
        var page_size = cfg.page_size ? parseInt(cfg.page_size.value) : 20;
        var pages = total % page_size !== 0 ? Math.floor(total / page_size) + 1 : Math.floor(total / page_size);

        _this.state = {
            // pages: pages > 500 ? 500 : pages,
            pages: pages,
            pageEvents: events,
            dataTableFields: dataTableFields,
            sortBy: undefined,
            sortDesc: undefined,
            dataMappings: {},
            info: gt('txt-loading')
        };
        return _this;
    }

    _createClass(Table, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var data_mappings = this.props.cfg.dt.data_mappings;

            _loader.config.processDataMappings(data_mappings).then(function (dataMappings) {
                _this2.afterLoadDataMapping(dataMappings);
            });
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var events = this.props.events;

            if (!_lodash2.default.isEmpty(events) && _lodash2.default.isEmpty(prevProps.events) || //第一次傳入events
            !_lodash2.default.isEmpty(events) && JSON.stringify(prevProps.events) !== JSON.stringify(events)) this.setState({
                pageEvents: events
            });
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            //目前流程切換dt都會mount
            // log.info('componentWillReceiveProps')
            // const {dtId: nextDtId} = nextProps
            // const {dtId} = this.props
            // if (nextDtId !== dtId)
            //     this.loadDataMapping()
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props,
                id = _props.id,
                _props$cfg$style = _props.cfg.style,
                style = _props$cfg$style === undefined ? {} : _props$cfg$style,
                nowPage = _props.nowPage,
                onClick = _props.onClick,
                _onSort = _props.onSort;
            var _props$rowIdField = this.props.rowIdField,
                rowIdField = _props$rowIdField === undefined ? '__s_uuid' : _props$rowIdField;
            var _state = this.state,
                pages = _state.pages,
                pageEvents = _state.pageEvents,
                dataTableFields = _state.dataTableFields,
                sortBy = _state.sortBy,
                sortDesc = _state.sortDesc,
                info = _state.info;


            if (info) return this.renderInfo(info);

            if (!pageEvents || pageEvents.length === 0) return this.renderInfo(gt('txt-no-data'));
            var content = (0, _reactAddonsCreateFragment2.default)({
                dataTable: _react2.default.createElement(
                    'div',
                    { className: 'content nopad' },
                    _react2.default.createElement(_table2.default, { id: id,
                        className: (0, _classnames2.default)('c-vbda-vis-table fixed-header js-sync-scroll'),
                        style: style,
                        data: pageEvents,
                        onRowDoubleClick: function onRowDoubleClick(id, data) {
                            onClick(data, nowPage);
                        },
                        fields: dataTableFields,
                        rowIdField: rowIdField,
                        selectable: { toggleAll: true },
                        onSelectionChange: this.onSelect,
                        onSort: function onSort(_ref) {
                            var field = _ref.field,
                                desc = _ref.desc;

                            if (field.indexOf('.[].') > 0) {
                                //if array
                                field = field.replace('.[]', '');
                            }
                            _this3.setState({ sortBy: field, sortDesc: desc });
                            _onSort(field, desc);
                        },
                        defaultSort: { field: sortBy, desc: sortDesc }
                    })
                ),
                pageNavBottom: _react2.default.createElement(
                    'footer',
                    null,
                    _react2.default.createElement(_pageNav2.default, { pages: pages, current: nowPage, className: 'jcc', onChange: this.gotoPage })
                )
            });
            return _react2.default.createElement(
                'div',
                { className: 'c-box grow' },
                content
            );
        }
    }]);

    return Table;
}(_react2.default.Component);

Table.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    lng: _propTypes2.default.string,
    // events: React.PropTypes.objectOf(React.PropTypes.object),
    events: _propTypes2.default.array,
    total: _propTypes2.default.number,
    page: _propTypes2.default.number,
    cfg: _propTypes2.default.shape({
        name: _propTypes2.default.string,
        style: _propTypes2.default.object,
        fields: _propTypes2.default.objectOf(_propTypes2.default.shape({
            title: _propTypes2.default.string /*,
                                              type: React.PropTypes.oneOf(['string','gis'])*/ // defined in initialization.json
        })), /*,
             locales: React.PropTypes.objectOf(React.PropTypes.shape({
             fields: React.PropTypes.object
             }))*/
        page_size: _propTypes2.default.shape({
            value: _propTypes2.default.string
        })
    }),
    onReq: _propTypes2.default.func,
    onSelect: _propTypes2.default.func.isRequired,
    onEdit: _propTypes2.default.func,
    onDelete: _propTypes2.default.func,
    nowPage: _propTypes2.default.number
};
Table.defaultProps = {};

var _initialiseProps = function _initialiseProps() {
    var _this4 = this;

    this.afterLoadDataMapping = function (dataMappings) {
        _this4.setState({ dataMappings: _extends({}, _this4.state.dataMappings, dataMappings), info: null }, function () {
            return setSyncScroll('.c-table.js-sync-scroll thead', '.c-table.js-sync-scroll tbody', 'horizontal');
        });
    };

    this.renderImages = function (fieldName, event) {
        var fieldNameOfUUID = '';
        if (fieldName.indexOf('.') > 0) {
            var pos = fieldName.lastIndexOf('.'); //找出最後一個.並取代成.__
            fieldNameOfUUID = fieldName.substring(0, pos) + '.__' + fieldName.substring(pos + 1);
        } else {
            fieldNameOfUUID = '__' + fieldName;
        }
        var uuid = _lodash2.default.get(event, fieldNameOfUUID);
        if (_lodash2.default.isArray(uuid)) uuid = uuid[0];
        var fileInfoIndex = _lodash2.default.findIndex(event[IMAGES_ROOT_PATH], function (o) {
            return o.uuid === uuid;
        });
        if (fileInfoIndex !== -1) {
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement('img', { src: '/api/file/' + _lodash2.default.get(event, [IMAGES_ROOT_PATH, fileInfoIndex, 'fileServerPath']), width: '100%' })
            );
        } else return _react2.default.createElement(
            'div',
            null,
            gt('field-no-data')
        );
    };

    this.fieldsParser = function (fields) {
        var _props2 = _this4.props,
            onDelete = _props2.onDelete,
            onEdit = _props2.onEdit,
            onClick = _props2.onClick,
            nowPage = _props2.nowPage,
            dt = _props2.cfg.dt;

        var newFields = {};
        //sort fields
        fields = _lodash2.default.chain(fields).map(function (val, key) {
            var order = parseInt(val.order);
            var newVal = _lodash2.default.omit(val, ['order']);
            return _extends({ name: key, order: order }, newVal);
        }).sortBy('order').keyBy('name').mapValues(function (o) {
            delete o.name;
            return o;
        }).value();
        //hide fields and 特殊處理 ex. array
        _lodash2.default.forEach(fields, function (field, key) {
            // if (field.hidden || field.hidden === true) { //if hidden
            //     return
            // }
            var label = _this4.getDisplayName(key);
            if (!label) label = field.title ? field.title : key;
            if (key.indexOf('.[].') > 0) {
                //array用原始資料(event)另外取 因為直接用key找 datatable找不到
                var keySplit = key.split('.[].');
                var rootKey = keySplit[0];
                var objectKey = keySplit[1];
                var sortable = true;
                var type = _lodash2.default.get(dt.fields, [keySplit[0], 'properties', keySplit[1], 'type']);
                switch (type) {
                    case 'text':
                    case 'image':
                    case 'geo_point':
                        sortable = false;
                        break;
                    case 'date':
                    default:
                        break;
                }
                newFields[key] = {
                    label: label,
                    sortable: true,
                    formatter: function formatter(miss, event) {
                        var array = event[rootKey];
                        return _react2.default.createElement(
                            'div',
                            null,
                            _lodash2.default.map(array, function (val, index) {
                                val = _lodash2.default.get(val, objectKey, ' ');

                                var itemFormatter = _this4.getFormatter(type, key.replace('.[].', '.'), true, _this4.getFormatterByDetailConfig(field.format));
                                switch (type) {
                                    case 'image':
                                    case 'file':
                                        if (index > 0) {
                                            return null;
                                        }
                                        return _react2.default.createElement(
                                            'div',
                                            { key: index },
                                            itemFormatter(val, event)
                                        );
                                    default:
                                        if (index === 3) {
                                            return _react2.default.createElement(
                                                'div',
                                                { key: index },
                                                '...'
                                            );
                                        }
                                        if (index > 3) {
                                            return null;
                                        }
                                        return _react2.default.createElement(
                                            'div',
                                            { key: index },
                                            itemFormatter(val, event)
                                        );
                                }
                            })
                        );
                    }
                };
            } else {
                var _sortable = true;
                var formatter = null;
                var _type = void 0;
                if (key.indexOf('.') > 0) {
                    //判斷是否為第二層object
                    var _keySplit = key.split('.');
                    _type = _lodash2.default.get(dt.fields, _keySplit[0] + '.properties.' + _keySplit[1] + '.type');
                } else _type = _lodash2.default.get(dt.fields, key + '.type');
                switch (_type) {
                    case 'text':
                    case 'image':
                    case 'file':
                    case 'geo_point':
                        _sortable = false;
                        break;
                    default:
                        break;
                }
                formatter = _this4.getFormatter(_type, key, false, _this4.getFormatterByDetailConfig(field.format));
                newFields[key] = {
                    label: label,
                    sortable: _sortable,
                    formatter: formatter
                };
            }
        });
        //補上功能欄位
        newFields.actions = {
            label: '', formatter: function formatter(val, data) {
                return _react2.default.createElement(
                    'span',
                    null,
                    _react2.default.createElement(
                        'button',
                        { className: 'img small standard', title: lt('tt-view-details'), onClick: onClick.bind(null, data, nowPage) },
                        _react2.default.createElement('img', { src: '/images/ic_case_detail.png' })
                    ),
                    onEdit ? _react2.default.createElement(
                        'button',
                        { className: 'img small standard', title: lt('tt-edit'), onClick: onEdit.bind(null, data) },
                        _react2.default.createElement('img', { src: '/images/ic_edit.png' })
                    ) : null,
                    onDelete ? _react2.default.createElement(
                        'button',
                        { className: 'img small standard', title: lt('tt-delete'), onClick: function onClick() {
                                _popupDialog2.default.confirm({
                                    title: lt('tt-delete'),
                                    display: _react2.default.createElement(
                                        'div',
                                        { className: 'c-flex fdc boxes' },
                                        lt('tt-delete'),
                                        '?'
                                    ),
                                    cancelText: gt('btn-cancel'),
                                    confirmText: gt('btn-ok'),
                                    act: function act(confirmed) {
                                        if (confirmed) {
                                            onDelete.bind(null, data);
                                        }
                                        return null;
                                    }
                                });
                            } },
                        _react2.default.createElement('img', { src: '/images/ic_delete.png' })
                    ) : null
                );
            }
        };
        return newFields;
    };

    this.getDisplayName = function (key) {
        var dtCfg = _this4.props.cfg.dt;

        var cfgDtFields = dtCfg.fields;
        key = key.replace(/\.\[]\./g, '.');
        var fieldNamePathArray = _lodash2.default.split(key.replace(/\./g, '.properties.'), '.');
        return _lodash2.default.get(cfgDtFields, [].concat(_toConsumableArray(fieldNamePathArray), ['display_name']), null);
    };

    this.getFormatterByDetailConfig = function () {
        var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var type = format.type,
            _format$props = format.props,
            props = _format$props === undefined ? {} : _format$props;
        // log.info(format)

        switch (type) {
            case 'hyper-link':
                var linkFormatter = function linkFormatter(value, data) {
                    if (_lodash2.default.isNil(value) || value === '') return null;
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

    this.getFormatter = function (type, key, isArray, customFormatter) {
        if (customFormatter) type = 'default'; //一律用default
        switch (type) {
            case 'date':
                return function (val) {
                    if ((0, _moment2.default)(val).isValid()) val = (0, _moment2.default)(val).format('YYYY-MM-DD HH:mm:ss');else val = '';
                    return val;
                };
            case 'image':
            case 'file':
                return function (val, rowData) {
                    if (isArray) {
                        var pos = key.lastIndexOf('.'); //找出最後一個.並取代成.0.
                        key = key.substring(0, pos) + '.0.' + key.substring(pos + 1);
                    }
                    return _react2.default.createElement(
                        'div',
                        null,
                        _this4.renderImages(key, rowData)
                    );
                };
            case 'text':
            default:
                return function (val, data) {
                    val = _this4.getMappingString(key, val);
                    if (customFormatter) return customFormatter(val, data);else return _lodash2.default.truncate(val, {
                        'length': 50,
                        'separator': ' '
                    });
                };
        }
    };

    this.getMappingString = function (mappingKey, originString) {
        var dataMappings = _this4.state.dataMappings;

        if (_lodash2.default.has(dataMappings, mappingKey)) {
            return _lodash2.default.get(dataMappings, [mappingKey, originString], originString);
        }
        return originString;
    };

    this.onSelect = function (selectedIds) {
        var _props3 = _this4.props,
            onSelect = _props3.onSelect,
            events = _props3.events,
            _props3$rowIdField = _props3.rowIdField,
            rowIdField = _props3$rowIdField === undefined ? '__s_uuid' : _props3$rowIdField;
        // let {pageEvents} = this.state

        var eventObject = void 0,
            selectEvents = void 0;

        eventObject = _lodash2.default.keyBy(events, rowIdField);
        selectEvents = _lodash2.default.pick(eventObject, selectedIds);
        // if(_.has(this.state.pageEvents[0], '__s_uuid')){
        //     eventObject = _.keyBy(events, rowIdField)
        //     selectEvents = _.pick(eventObject, selectedIds)
        // }
        // else{
        //     selectEvents = _.map(selectedIds, selectedId=>events[selectedId])
        // }
        onSelect(selectEvents);
    };

    this.gotoPage = function (page) {
        var onReq = _this4.props.onReq;
        var _state2 = _this4.state,
            sortBy = _state2.sortBy,
            sortDesc = _state2.sortDesc;

        onReq(page, sortBy, sortDesc);
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

exports.default = (0, _localeProvider2.default)(Table, 'cfg');

//reference from ciap-ui \src\utils\ui-helper.js

var _setScrollEvent = function _setScroll(main, sub, scrollWay) {
    main.on('scroll', function () {
        var mainScroll = main[scrollWay]();
        var subScroll = sub[scrollWay]();

        if (mainScroll !== subScroll) {
            sub[scrollWay](mainScroll);
        }
    });
};

function setSyncScroll(mainSelector, subSelector) {
    var direction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'horizontal';

    if (!mainSelector || !subSelector) {
        log.warn('Parameter mainSelector and subSelector should be String');
        return;
    } else if (!_lodash2.default.includes(['horizontal', 'vertical'], direction)) {
        log.warn('Parameter direction should be \'horizontal\', or \'vertical\'');
        return;
    }

    var main = (0, _jquery2.default)(mainSelector);
    var sub = (0, _jquery2.default)(subSelector);
    var scrollWay = direction === 'horizontal' ? 'scrollLeft' : 'scrollTop';

    _setScrollEvent(main, sub, scrollWay);
    _setScrollEvent(sub, main, scrollWay);
}