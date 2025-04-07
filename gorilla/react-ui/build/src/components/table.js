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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _propWire = require('../hoc/prop-wire');

var _checkbox = require('./checkbox');

var _checkbox2 = _interopRequireDefault(_checkbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/table');

var Row = function (_React$Component) {
    _inherits(Row, _React$Component);

    function Row() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Row);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Row.__proto__ || Object.getPrototypeOf(Row)).call.apply(_ref, [this].concat(args))), _this), _this.formatItem = function (value, data, formatter, id, name) {
            if (_react2.default.isValidElement(formatter)) {
                return formatter;
            } else if (_lodash2.default.isFunction(formatter)) {
                return formatter(value, data, id);
            } else if (_lodash2.default.isString(formatter)) {
                return _lodash2.default.template(formatter)({ value: value, data: data });
            } else if (_lodash2.default.isObject(formatter)) {
                var type = formatter.type,
                    options = _objectWithoutProperties(formatter, ['type']);

                var formatted = value;
                switch (type) {
                    case 'date':
                    case 'datetime':
                        {
                            if (value == null || _lodash2.default.isString(value) && _lodash2.default.trim(value) === '') {
                                formatted = null;
                            } else {
                                formatted = (0, _moment2.default)(value, options.inputFormat).format(options.format || (type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'));
                            }
                            break;
                        }
                    case 'mapping':
                        {
                            var list = options.list,
                                _options$listTransfor = options.listTransform,
                                listTransform = _options$listTransfor === undefined ? {} : _options$listTransfor;
                            var _listTransform$value = listTransform.value,
                                valueField = _listTransform$value === undefined ? 'value' : _listTransform$value,
                                _listTransform$text = listTransform.text,
                                textField = _listTransform$text === undefined ? 'text' : _listTransform$text;

                            if (_lodash2.default.isObject(list)) {
                                if (_lodash2.default.isArray(list)) {
                                    formatted = _lodash2.default.find(list, _defineProperty({}, valueField, value));
                                } else {
                                    formatted = _lodash2.default.get(list, value);
                                }

                                if (formatted == null) {
                                    formatted = value;
                                } else if (_lodash2.default.isObject(formatted)) {
                                    formatted = _lodash2.default.get(formatted, textField, value);
                                }
                            } else {
                                log.error('renderField:: field \'' + name + '\' mapping list is invalid or undefined');
                            }
                            break;
                        }
                    default:
                        log.error('renderField:: field \'' + name + '\' formatter type \'' + type + '\' is invalid');
                        break;
                }
                return formatted;
            } else {
                log.error('renderField:: field \'' + name + '\' formatter is invalid');
                return value;
            }
        }, _this.renderField = function (name, value, fieldCfg, rowData) {
            var _this$props = _this.props,
                id = _this$props.id,
                onInputChange = _this$props.onInputChange;
            var _fieldCfg$formatArray = fieldCfg.formatArrayItem,
                formatArrayItem = _fieldCfg$formatArray === undefined ? false : _fieldCfg$formatArray,
                formatter = fieldCfg.formatter,
                editor = fieldCfg.editor,
                props = fieldCfg.props;


            if (formatter) {
                if (_lodash2.default.isArray(value) && formatArrayItem) {
                    return _react2.default.createElement(
                        'div',
                        null,
                        _lodash2.default.map(value, function (item, idx) {
                            return _react2.default.createElement(
                                'div',
                                { key: idx + '' },
                                _this.formatItem(null, item, formatter, null, name)
                            );
                        })
                    );
                } else {
                    return _this.formatItem(value, rowData, formatter, id, name);
                }
            } else if (editor) {
                if (_lodash2.default.isFunction(props)) {
                    props = props(rowData);
                }
                // TODO: check editor must be ReactClass
                props = _lodash2.default.assign({ name: name, value: value, onChange: onInputChange && onInputChange.bind(null, id, name) }, props || {});

                return _react2.default.createElement(editor, props);
            } else {
                return value;
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Row, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps) {
            if (nextProps.force) {
                log.debug('Row::shouldComponentUpdate::forced');
                return true;
            }

            if (nextProps.fields !== this.props.fields) {
                log.debug('Row::shouldComponentUpdate::fields changed');
                return true;
            }

            if (nextProps.className !== this.props.className) {
                log.debug('Row::shouldComponentUpdate::className changed');
                return true;
            }

            if (JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data)) {
                log.debug('Row::shouldComponentUpdate::data changed');
                return true;
            }
            return false;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                data = _props.data,
                fields = _props.fields,
                id = _props.id,
                className = _props.className,
                style = _props.style,
                onClick = _props.onClick,
                onDoubleClick = _props.onDoubleClick,
                onMouseOver = _props.onMouseOver,
                onMouseOut = _props.onMouseOut,
                onContextMenu = _props.onContextMenu;


            return _react2.default.createElement(
                'tr',
                { id: id, onClick: onClick, onDoubleClick: onDoubleClick, onContextMenu: onContextMenu, className: className, style: style, onMouseOver: onMouseOver, onMouseOut: onMouseOut },
                _lodash2.default.map(fields, function (field, key) {
                    var hide = field.hide,
                        keyPath = field.keyPath,
                        fieldStyle = field.style,
                        fieldClassName = field.className;

                    if (hide) {
                        return null;
                    }

                    var val = _lodash2.default.get(data, keyPath || key, null); // to support traverse of nested field properties, eg a.b.c
                    return _react2.default.createElement(
                        'td',
                        {
                            key: key,
                            style: fieldStyle,
                            className: (0, _classnames2.default)(key, fieldClassName) },
                        _this2.renderField(key, val, field, data)
                    );
                })
            );
        }
    }]);

    return Row;
}(_react2.default.Component);

/**
 * A React data Table Component. Renders **data** according to **fields** configuration
 * @constructor
 * @param {string} [id] - Table element #id
 * @param {renderable} [caption] - Table caption
 * @param {renderable} [footer] - Table footer
 * @param {string} [className] - Classname for the container, default selected classnames:
 * * bland - Do not color alternate rows
 * * nohover - Do not change color when hovering over rows
 * * fixed-header - Fix table header when height is limited, allow table body to scroll
 * * column - Make table a column table. Ie data rows will be from left to right, instead of top to bottom
 * * border-inner-vertical - Show vertical border inside table
 * * border-inner-horizontal - Show horizontal border inside table
 * * border-inner - Show both vertical and horizontal border inside table
 * * border-outer - Show table border outline
 * * border-all - Show all border, outer + inner
 * @param {object} [style] - Table style
 * @param {object} fields - All fields definition, in key-config pair, each key represents a column
 * @param {object} fields.key - Config for this **key** field
 * @param {renderable} [fields.key.label=key] - label for this field
 * @param {string | array.<string>} [fields.key.keyPath=key] - key path for this field
 * @param {renderable} [fields.key.sortable=false] - is column sortable?
 * @param {string | array.<string>} [fields.key.sortKeyPath=keyPath] - key path used for sorting
 * @param {renderable} [fields.key.hide=false] - hide this column?
 * @param {string} [fields.key.className] - classname of this column
 * @param {object} [fields.key.style] - column style, eg width, minWidth
 * @param {string | object | function | renderable} [fields.key.formatter] - what to render in this field?
 * * template string literal: eg 'Hi my name is ${value} and address is ${data.address}'
 * * renderable elements supported by react: eg <div>xxxx</div>
 * * format config object, with type='date'|'datetime'|'mapping'
 * * custom defined formatter function, first argument will be data value corresponding to the field, second argument is data for the entire row
 * @param {boolean} [fields.key.formatArrayItem=false] - if field value is an array, whether the formatter above is targeted towards the array item?
 * @param {function | component} [fields.key.editor] - If this field is an input, the react component class to use
 * @param {object | function} [fields.key.props] - If this field is an input, props for the above react class
 * * object - props as object
 * * function - function given row data, returning object props
 * @param {array} [data] - Data to fill table with
 * @param {object} [rows] - Limit data to show
 * @param {number} [rows.start=0] - row to start with
 * @param {number} [rows.end=data.length] - row to end with (not including end)
 * @param {string} [rowIdField] - The field key which will be used as row dom #id
 * @param {string | function} [rowClassName] - Classname of a data row
 * @param {string | function} [rowStyle] - Style of a data row
 * @param {object} [selection] - Table row selection settings
 * @param {boolean} [selection.enabled=false] - Is table rows selectable? If yes checkboxes will appear
 * @param {boolean} [selection.toggleAll=false] - Show toggle all checkbox in header?
 * @param {boolean} [selection.multiSelect=true] - Can select multiple rows?
 * @param {string | array.<string>} [defaultSelected] - Selected row id(s)
 * @param {string | array.<string>} [selected] - Default selected row id(s)
 * @param {object} [selectedLink] - Link to update selections. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} selectedLink.value - value to update
 * @param {function} selectedLink.requestChange - function to request value change
 * @param {function} [onSelectionChange] - Callback function when row is selected. <br> Required when selected prop is supplied
 * @param {string | array} onSelectionChange.value - current selected row ids
 * @param {object} onSelectionChange.eventInfo - event related info
 * @param {string | array} onSelectionChange.eventInfo.before - previous selected row ids
 * @param {string} onSelectionChange.eventInfo.id - id triggering change
 * @param {boolean} onSelectionChange.eventInfo.selected - selected?
 * @param {object} [defaultSort] - Default sort config
 * @param {string} [defaultSort.field] - Default sort field
 * @param {boolean} [defaultSort.desc=false] - Is sort order descending by default?
 * @param {object} [sort] - Current sort config
 * @param {string} [sort.field] - Current sort field
 * @param {boolean} [sort.desc=false] - Is sort order descending?
 * @param {object} [sortLink] - Link to update sort. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} sortLink.value - sort to update
 * @param {function} sortLink.requestChange - function to request sort change
 * @param {function} [onSort] - Callback function when sort is changed. <br> Required when sort prop is supplied
 * @param {object} onSort.value - current sort object
 * @param {object} onSort.eventInfo - event related info
 * @param {object} onSort.eventInfo.before - previous sort object
 * @param {function} [onRowClick] [description]
 * @param {function} [onRowDoubleClick] [description]
 * @param {function} [onRowMouseOver] - Row mouseover event
 * @param {function} [onRowMouseOut] - Row mouseout event
 * @param {function} [onRowContextMenu] [description]
 * @param {function} [onScroll] [description]
 * @param {function} [onInputChange] - Input change event
 * @param {string} onInputChange.rid - row id of this input
 * @param {string} onInputChange.name - input name
 * @param {string|number} onInputChange.value - input value
 * @param {renderable} [info] - React renderable object, display additional information about the list
 * @param {string} [infoClassName] - Assign className to info node
 *
 * @example
// controlled

import $ from 'jquery'
import cx from 'classnames'
import {Table} from 'react-ui'

const FIELDS = {
    id: { label:'ID', sortable:true },
    title: { label:'Title', sortable:true },
    adult: {label:'Adult', formatter:{
        type: 'mapping',
        list: {true:'Yes', false:'No'}
    }},
    original_language: {
        label:'Language',
        formatter: {
            type: 'mapping',
            list: [
                {lang:'en', desc:'English'},
                {lang:'de', desc:'German'}
            ],
            valueField: 'lang',
            textField: 'desc'
        }
    },
    popularity: {label:'Popularity'},
    release_date: {
        label: 'Year',
        formatter: {type:'date', format:'YYYY-MM-DD'},
        sortable: true
    }
}

React.createClass({
    getInitialState() {
        return {
            search: 'ab',
            selected: [],
            clicked: null,
            info: null,
            error: false,
            data: []
        }
    },
    componentDidMount() {
        this.loadList()
    },
    handleSelect(selected) {
        this.setState({selected})
    },
    handleClick(clicked) {
        this.setState({clicked})
    },
    loadList() {
        this.setState({data:[], info:'Loading...', error:false}, () => {
            let {search} = this.state

            $.get(`https://api.themoviedb.org/3/${search?'search':'discover'}/movie`,
                {
                    api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                    query: search
                })
                .done(({results:list=[], total_results:total=0}) => {
                    if (total === 0) {
                        this.setState({info:'No movies found!'})
                        return
                    }

                    this.setState({info:null, data:list})
                })
                .fail(xhr => {
                    this.setState({info:xhr.responseText, error:true})
                })
        })
    },
    render() {
        let {data, info, error} = this.state

        return <div className='c-box noborder'>
            <div className='content'>
                <Table
                    data={data}
                    fields={FIELDS}
                    className='fixed-header'
                    rowIdField='id'
                    info={info}
                    infoClassName={cx({'c-error':error})}
                    defaultSort={{
                        field: 'title',
                        desc: false
                    }}
                    onRowClick={this.handleClick}
                    selection={{
                        enabled:true,
                        toggleAll:true
                    }}
                    onSelectionChange={this.handleSelect} />
            </div>
        </div>
    }
});
 */


Row.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    fields: _propTypes2.default.object.isRequired,
    data: _propTypes2.default.object.isRequired,
    force: _propTypes2.default.bool,
    style: _propTypes2.default.object,
    onInputChange: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    onDoubleClick: _propTypes2.default.func,
    onMouseOver: _propTypes2.default.func,
    onMouseOut: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func
};
Row.defaultProps = {
    force: false,
    style: {}
};

var Table = function (_React$Component2) {
    _inherits(Table, _React$Component2);

    function Table() {
        var _ref2;

        var _temp2, _this3, _ret2;

        _classCallCheck(this, Table);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this3 = _possibleConstructorReturn(this, (_ref2 = Table.__proto__ || Object.getPrototypeOf(Table)).call.apply(_ref2, [this].concat(args))), _this3), _this3.state = {
            fieldsSize: null
        }, _this3.getRowId = function (rowData, rowIdField) {
            if (!rowIdField) {
                log.error('getRowId:: rowIdField prop must be specified');
                return null;
            }

            var fields = _this3.props.fields;

            var fieldCfg = _this3.formatField(rowIdField, fields[rowIdField]);
            var id = _lodash2.default.get(rowData, _lodash2.default.get(fieldCfg, 'keyPath', rowIdField));

            if (!id) {
                log.error('getRowId:: unable to produce id based on config ' + fieldCfg);
                return null;
            }

            return id + '';
        }, _this3.resizeFields = function () {
            var fields = _this3.props.fields;

            _this3.setState({
                fieldsSize: null
            }, function () {
                var fieldsSize = {};
                (0, _jquery2.default)(_this3.tableHeaderNode).children().each(function () {
                    fieldsSize[this.id] = _lodash2.default.get(fields, [this.id, 'style', 'width'], (0, _jquery2.default)(this).width() + 14);
                });

                _this3.setState({ fieldsSize: fieldsSize });
            });
        }, _this3.isAutoLayout = function (props) {
            var _ref3 = props || _this3.props,
                className = _ref3.className;

            return _lodash2.default.indexOf(_lodash2.default.split(className, ' '), 'fixed-header') >= 0;
        }, _this3.formatField = function (key, fieldCfg) {
            if (_lodash2.default.isString(fieldCfg)) {
                return { label: fieldCfg };
            } else {
                return _extends({
                    label: key
                }, fieldCfg);
            }
        }, _this3.formatFields = function () {
            var _this3$props = _this3.props,
                fields = _this3$props.fields,
                _this3$props$selectio = _this3$props.selection,
                selectable = _this3$props$selectio.enabled,
                _this3$props$selectio2 = _this3$props$selectio.multiSelect,
                multiSelect = _this3$props$selectio2 === undefined ? true : _this3$props$selectio2,
                _this3$props$selectio3 = _this3$props$selectio.toggleAll,
                toggleAll = _this3$props$selectio3 === undefined ? false : _this3$props$selectio3,
                selected = _this3$props.selected,
                data = _this3$props.data;


            fields = _lodash2.default.mapValues(fields, function (fieldCfg, key) {
                return _this3.formatField(key, fieldCfg);
            });

            if (selectable) {
                var total = data.length;
                var numSelected = multiSelect ? selected.length : null;

                fields = _extends({
                    selector: {
                        label: toggleAll && multiSelect ? _react2.default.createElement(_checkbox2.default, {
                            checked: numSelected > 0,
                            className: (0, _classnames2.default)({ partial: numSelected > 0 && numSelected < total }),
                            onChange: _this3.handleToggleAll }) : '',
                        formatter: function formatter(v, row, rid) {
                            var rowSelected = multiSelect ? _lodash2.default.includes(selected, rid) : selected === rid;
                            return _react2.default.createElement(_checkbox2.default, { checked: rowSelected, onChange: _this3.handleRowSelect.bind(_this3, rid) });
                        }
                    }
                }, fields);
            }
            return fields;
        }, _this3.handleWindowResize = function () {
            if (_this3.isAutoLayout()) {
                _this3.resizeFields();
            }
        }, _this3.handleSort = function (evt) {
            var _this3$props2 = _this3.props,
                onSort = _this3$props2.onSort,
                _this3$props2$sort = _this3$props2.sort,
                sortField = _this3$props2$sort.field,
                sortDesc = _this3$props2$sort.desc;

            var newSortField = evt.currentTarget.id;

            var sortObj = { field: newSortField, desc: newSortField === sortField ? !sortDesc : false };
            onSort(sortObj);
        }, _this3.handleToggleAll = function (selected) {
            var _this3$props3 = _this3.props,
                onSelectionChange = _this3$props3.onSelectionChange,
                data = _this3$props3.data,
                rowIdField = _this3$props3.rowIdField;

            var newSelected = selected ? _lodash2.default.map(data, function (row) {
                return _this3.getRowId(row, rowIdField);
            }) : [];
            onSelectionChange(newSelected, { id: null, selected: selected });
        }, _this3.handleRowSelect = function (rid, selected) {
            var _this3$props4 = _this3.props,
                _this3$props4$selecti = _this3$props4.selection.multiSelect,
                multiSelect = _this3$props4$selecti === undefined ? true : _this3$props4$selecti,
                onSelectionChange = _this3$props4.onSelectionChange,
                curSelected = _this3$props4.selected;

            if (multiSelect) {
                var newSelected = selected ? [].concat(_toConsumableArray(curSelected), [rid]) : _lodash2.default.without(curSelected, rid);
                onSelectionChange(newSelected, { id: rid, selected: selected });
            } else {
                onSelectionChange(selected ? rid : '');
            }
        }, _this3.handleRowClick = function (row, evt) {
            var rid = evt.currentTarget.id;
            _this3.props.onRowClick && _this3.props.onRowClick(rid, row, evt);
        }, _this3.handleRowDoubleClick = function (row, evt) {
            var rid = evt.currentTarget.id;
            _this3.props.onRowDoubleClick && _this3.props.onRowDoubleClick(rid, row, evt);
        }, _this3.handleRowMouseOver = function (row, evt) {
            var rid = evt.currentTarget.id;
            _this3.props.onRowMouseOver && _this3.props.onRowMouseOver(rid, row, evt);
        }, _this3.handleRowMouseOut = function (row, evt) {
            var rid = evt.currentTarget.id;
            _this3.props.onRowMouseOut && _this3.props.onRowMouseOut(rid, row, evt);
        }, _this3.handleContextMenu = function (row, evt) {
            var rid = evt.currentTarget.id;
            _this3.props.onRowContextMenu && _this3.props.onRowContextMenu(rid, row, evt);
        }, _temp2), _possibleConstructorReturn(_this3, _ret2);
    }

    _createClass(Table, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this4 = this;

            window.addEventListener('resize', this.handleWindowResize);
            if (this.isAutoLayout()) {
                setTimeout(function () {
                    _this4.resizeFields();
                }, 1000);
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var prevData = prevProps.data,
                prevClassName = prevProps.className;
            var _props2 = this.props,
                data = _props2.data,
                className = _props2.className;

            if (this.isAutoLayout()) {
                if (className !== prevClassName || !_lodash2.default.isEmpty(data) && JSON.stringify(data) !== JSON.stringify(prevData)) {
                    log.debug('Table::componentDidUpdate::resize fields');
                    this.resizeFields();
                }
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('resize', this.handleWindowResize);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            var _props3 = this.props,
                id = _props3.id,
                className = _props3.className,
                _props3$style = _props3.style,
                style = _props3$style === undefined ? {} : _props3$style,
                caption = _props3.caption,
                footer = _props3.footer,
                info = _props3.info,
                infoClassName = _props3.infoClassName,
                data = _props3.data,
                rows = _props3.rows,
                rowIdField = _props3.rowIdField,
                _props3$selection = _props3.selection,
                selectable = _props3$selection.enabled,
                _props3$selection$mul = _props3$selection.multiSelect,
                multiSelectable = _props3$selection$mul === undefined ? true : _props3$selection$mul,
                selected = _props3.selected,
                _props3$sort = _props3.sort,
                sortField = _props3$sort.field,
                sortDesc = _props3$sort.desc,
                rowClassName = _props3.rowClassName,
                rowStyle = _props3.rowStyle,
                forceRefresh = _props3.forceRefresh,
                onRowClick = _props3.onRowClick,
                onRowDoubleClick = _props3.onRowDoubleClick,
                onRowContextMenu = _props3.onRowContextMenu,
                onInputChange = _props3.onInputChange,
                onScroll = _props3.onScroll,
                onRowMouseOver = _props3.onRowMouseOver,
                onRowMouseOut = _props3.onRowMouseOut;


            var autoLayout = this.isAutoLayout();
            var fieldsSize = this.state.fieldsSize;

            var refreshAll = forceRefresh === true;
            var fields = this.formatFields();

            if (!refreshAll && !_lodash2.default.isArray(forceRefresh)) {
                forceRefresh = [forceRefresh];
            }

            if (sortField && fields[sortField].sortable) {
                data = _lodash2.default.orderBy(data, [function (item) {
                    var val = _lodash2.default.get(item, fields[sortField].sortKeyPath || fields[sortField].keyPath || sortField);
                    return _lodash2.default.isString(val) ? val.toLowerCase() : val;
                }, rowIdField], [sortDesc ? 'desc' : 'asc']);
            }

            if (rows) {
                var start = rows.start,
                    end = rows.end;

                data = data.slice(start, end);
            }

            return _react2.default.createElement(
                'table',
                {
                    id: id,
                    className: (0, _classnames2.default)('c-table', _lodash2.default.replace(className, 'fixed-header', ''), {
                        selectable: selectable,
                        'fixed-header': autoLayout && fieldsSize
                    }),
                    style: _extends({
                        width: autoLayout && !fieldsSize ? '100%' : null,
                        minWidth: autoLayout && fieldsSize ? _lodash2.default.sum(_lodash2.default.values(fieldsSize)) : null
                    }, style) },
                caption ? _react2.default.createElement(
                    'caption',
                    null,
                    caption
                ) : null,
                _react2.default.createElement(
                    'thead',
                    null,
                    _react2.default.createElement(
                        'tr',
                        { id: 'header', ref: function ref(_ref5) {
                                _this5.tableHeaderNode = _ref5;
                            } },
                        _lodash2.default.map(fields, function (_ref4, key) {
                            var _ref4$sortable = _ref4.sortable,
                                sortable = _ref4$sortable === undefined ? false : _ref4$sortable,
                                _ref4$hide = _ref4.hide,
                                hide = _ref4$hide === undefined ? false : _ref4$hide,
                                label = _ref4.label,
                                fieldClassName = _ref4.className,
                                fieldStyle = _ref4.style;

                            if (hide) {
                                return null;
                            }

                            var fieldWidth = _lodash2.default.get(fieldStyle, 'width');
                            if (autoLayout && _lodash2.default.has(fieldsSize, key)) {
                                fieldWidth = fieldsSize[key];
                            }
                            return _react2.default.createElement(
                                'th',
                                {
                                    id: key,
                                    key: key,
                                    className: (0, _classnames2.default)(key, { sortable: sortable }, fieldClassName),
                                    style: _extends({
                                        width: fieldWidth
                                    }, fieldStyle),
                                    onClick: sortable && _this5.handleSort },
                                label,
                                sortable ? key === sortField ? _react2.default.createElement(
                                    'span',
                                    { className: 'dir selected ' + (sortDesc ? 'desc' : '') },
                                    sortDesc ? '\u25BC' : '\u25B2'
                                ) : _react2.default.createElement(
                                    'span',
                                    { className: 'dir' },
                                    '\u25B2'
                                ) : ''
                            );
                        })
                    )
                ),
                _react2.default.createElement(
                    'tbody',
                    { onScroll: onScroll },
                    info ? _react2.default.createElement(
                        'tr',
                        null,
                        _react2.default.createElement(
                            'td',
                            { className: (0, _classnames2.default)('c-info', infoClassName), colSpan: _lodash2.default.size(fields) },
                            info
                        )
                    ) : _lodash2.default.map(data, function (row, index) {
                        var rid = (rowIdField ? _this5.getRowId(row, rowIdField) : index) + '';
                        var _className = rowClassName;
                        if (rowClassName) {
                            if (_lodash2.default.isFunction(rowClassName)) {
                                _className = rowClassName(row);
                            }
                        }

                        if (multiSelectable && _lodash2.default.includes(selected, rid) || !multiSelectable && selected === rid) {
                            _className = [_className, 'selected'];
                        }

                        var _rowStyle = rowStyle;
                        if (rowStyle) {
                            if (_lodash2.default.isFunction(rowStyle)) {
                                _rowStyle = _lodash2.default.isPlainObject(rowStyle(row)) ? rowStyle(row) : {};
                            }
                        }

                        return _react2.default.createElement(Row, {
                            key: rid,
                            id: rid,
                            fields: _lodash2.default.mapValues(fields, function (v, k) {
                                var fieldWidth = _lodash2.default.get(v, 'style.width', autoLayout ? _lodash2.default.get(fieldsSize, k) : null);
                                return _extends({}, v, {
                                    style: _extends({
                                        width: fieldWidth
                                    }, v.style || {})
                                });
                            }),
                            data: row,
                            className: (0, _classnames2.default)(_className),
                            style: _rowStyle,
                            force: refreshAll || forceRefresh.indexOf('' + rid) >= 0,
                            onInputChange: onInputChange,
                            onContextMenu: onRowContextMenu ? _this5.handleContextMenu.bind(_this5, row) : null,
                            onClick: onRowClick ? _this5.handleRowClick.bind(_this5, row) : null,
                            onDoubleClick: onRowDoubleClick ? _this5.handleRowDoubleClick.bind(_this5, row) : null,
                            onMouseOver: onRowMouseOver ? _this5.handleRowMouseOver.bind(_this5, row) : null,
                            onMouseOut: onRowMouseOut ? _this5.handleRowMouseOut.bind(_this5, row) : null });
                    })
                ),
                footer ? _react2.default.createElement(
                    'tfoot',
                    null,
                    _react2.default.createElement(
                        'tr',
                        null,
                        _react2.default.createElement(
                            'td',
                            null,
                            footer
                        )
                    )
                ) : null
            );
        }
    }]);

    return Table;
}(_react2.default.Component);

Table.propTypes = {
    id: _propTypes2.default.string,
    caption: _propTypes2.default.node,
    footer: _propTypes2.default.node,
    className: _propTypes2.default.string,
    style: _propTypes2.default.object,
    rowIdField: _propTypes2.default.string,
    rowClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
    rowStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
    fields: _propTypes2.default.objectOf(_propTypes2.default.shape({
        label: _propTypes2.default.node,
        keyPath: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.arrayOf(_propTypes2.default.string)]),
        sortable: _propTypes2.default.bool,
        sortKeyPath: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.arrayOf(_propTypes2.default.string)]),
        hide: _propTypes2.default.bool,
        className: _propTypes2.default.string,
        style: _propTypes2.default.object,
        formatter: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object, _propTypes2.default.func, _propTypes2.default.node]),
        formatArrayItem: _propTypes2.default.bool,
        editor: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.element, _propTypes2.default.string]),
        props: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func])
    })).isRequired,
    data: _propTypes2.default.array,
    rows: _propTypes2.default.shape({
        start: _propTypes2.default.number,
        end: _propTypes2.default.number
    }),
    forceRefresh: _propTypes2.default.bool,
    selection: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        multiSelect: _propTypes2.default.bool,
        toggleAll: _propTypes2.default.bool
    }),
    selected: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.arrayOf(_propTypes2.default.string)]),
    onSelectionChange: _propTypes2.default.func,
    sort: _propTypes2.default.shape({
        field: _propTypes2.default.string,
        desc: _propTypes2.default.bool
    }),
    onSort: _propTypes2.default.func,
    onRowClick: _propTypes2.default.func,
    onRowDoubleClick: _propTypes2.default.func,
    onRowContextMenu: _propTypes2.default.func,
    onScroll: _propTypes2.default.func,
    onInputChange: _propTypes2.default.func,
    onRowMouseOver: _propTypes2.default.func,
    onRowMouseOut: _propTypes2.default.func,
    info: _propTypes2.default.node,
    infoClassName: _propTypes2.default.string
};
Table.defaultProps = {
    data: [],
    selection: {
        enabled: false
    },
    forceRefresh: false
};
exports.default = (0, _propWire.wireSet)(Table, {
    sort: {
        changeHandlerName: 'onSort',
        defaultValue: {}
    },
    selected: {
        changeHandlerName: 'onSelectionChange',
        defaultValue: function defaultValue(_ref6) {
            var _ref6$selection = _ref6.selection,
                selection = _ref6$selection === undefined ? {} : _ref6$selection;
            var enabled = selection.enabled,
                _selection$multiSelec = selection.multiSelect,
                multiSelect = _selection$multiSelec === undefined ? true : _selection$multiSelec;

            if (enabled) {
                return multiSelect ? [] : '';
            }
            return '';
        }
    }
});