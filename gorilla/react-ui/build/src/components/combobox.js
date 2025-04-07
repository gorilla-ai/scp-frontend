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

var _underscore = require('underscore.string');

var _underscore2 = _interopRequireDefault(_underscore);

var _propTypes3 = require('../consts/prop-types');

var _propWire = require('../hoc/prop-wire');

var _listNormalizer = require('../hoc/list-normalizer');

var _listNormalizer2 = _interopRequireDefault(_listNormalizer);

var _popover = require('./popover');

var _popover2 = _interopRequireDefault(_popover);

var _search = require('./search');

var _search2 = _interopRequireDefault(_search);

var _checkboxGroup = require('./checkbox-group');

var _checkboxGroup2 = _interopRequireDefault(_checkboxGroup);

var _outsideEvent = require('../utils/outside-event');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/combobox');

var PopupList = function (_React$Component) {
    _inherits(PopupList, _React$Component);

    function PopupList() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, PopupList);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PopupList.__proto__ || Object.getPrototypeOf(PopupList)).call.apply(_ref, [this].concat(args))), _this), _this.onClickOutside = function (target) {
            _this.props.onClickOutside(target);
        }, _this.onSelect = function (selected, data) {
            _this.props.onSelect(selected, data);
        }, _this.focusSearchInput = function () {
            if (_this.searchComp) {
                _this.searchComp._component.focus();
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(PopupList, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.handler = (0, _outsideEvent.subscribe)(this.node).onOutside(this.onClickOutside);

            this.focusSearchInput();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.focusSearchInput();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.handler.unsubscribe();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                selected = _props.selected,
                search = _props.search,
                multiSelect = _props.multiSelect,
                list = _props.list,
                info = _props.info,
                infoClassName = _props.infoClassName;

            var infoText = _lodash2.default.isFunction(info) ? info(list) : info;

            return _react2.default.createElement(
                'div',
                { ref: function ref(_ref4) {
                        _this2.node = _ref4;
                    }, className: 'c-combo-list c-flex fdc' },
                search.enabled && _react2.default.createElement(_search2.default, _extends({ className: 'asc', ref: function ref(_ref2) {
                        _this2.searchComp = _ref2;
                    } }, search)),
                _react2.default.createElement(
                    'div',
                    { className: 'list' },
                    multiSelect.enabled ? _react2.default.createElement(_checkboxGroup2.default, _extends({}, multiSelect, {
                        list: list,
                        onChange: this.onSelect,
                        value: selected })) : _react2.default.createElement(
                        'div',
                        { className: 'c-flex fdc' },
                        _lodash2.default.map(list, function (_ref3) {
                            var value = _ref3.value,
                                text = _ref3.text;

                            return _react2.default.createElement(
                                'span',
                                {
                                    key: value,
                                    className: (0, _classnames2.default)('list-item', { selected: selected === value }),
                                    onClick: _this2.onSelect.bind(_this2, value, { text: text }) },
                                text
                            );
                        })
                    ),
                    infoText && _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)('c-info', infoClassName) },
                        infoText
                    )
                )
            );
        }
    }]);

    return PopupList;
}(_react2.default.Component);

/**
 * A React Combobox that can dynamically load (via callback function) and update list when user types into input.<br>
 * Can be seen as a dropdown with typing/filtering feature.
 * @constructor
 * @param {string} [id] - Input element #id
 * @param {string} [name] - Input element name
 * @param {Array.<object>} list - List of items
 * @param {string | number} list.value - item value
 * @param {string} list.text - item display text
 * @param {string} [className] - Classname for the container
 * @param {renderable | function} [info] - React renderable object or function producing renderable object, display additional information about the list
 * @param {array.<object>} info.list - argument for **info** function, list of currently displayed items
 * @param {string} [infoClassName] - Assign className to info node
 * @param {string | number | Array.<string|number>} [defaultValue] - Default selected value
 * @param {string | number | Array.<string|number>} [value] - Current selected value
 * @param {object} [valueLink] - Link to update value. Used in conjuction with {@link module:linked-state-mixins linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {object} [multiSelect] - multi-select configuration
 * @param {boolean} [multiSelect.enabled=false] - Allow multi-select (checkbox)?
 * @param {boolean} [multiSelect.toggleAll=false] - Allow toggle all?
 * @param {string} [multiSelect.toggleAllText='All'] - Text to show on toggle all label
 * @param {object} [search] - search/filter configuration
 * @param {boolean} [search.enabled=false] - Allow search/filter list?
 * @param {string} [search.placeholder] - Placeholder for search input
 * @param {boolean} [search.enableClear=true] - Can this field be cleared?
 * @param {boolean} [search.interactive=true] - Determine if search is interactive
 * @param {number} [search.delaySearch=750] - If search is interactive, this setting will trigger onSearch event after *delaySearch* milliseconds<br>
 * true: onSearch event called as user types; <br>
 * false: onSearch event called when user hits enter
 * @param {function} [search.onSearch] - Callback function when search is changed. <br> Required when value prop is supplied
 * @param {string|number} search.onSearch.search - updated search value
 * @param {boolean} [required=false] - Is this field mandatory?
 * @param {boolean} [disabled=false] - Is this field disabled?
 * @param {boolean} [enableClear=true] - Can this field can be cleared?
 * @param {string} [placeholder] - Placeholder for input
 * @param {function} [onChange] - Callback function when item is selected. <br> Required when value prop is supplied
 * @param {string | number | Array.<string|number>} onChange.value - selected value(s)
 * @param {object} onChange.eventInfo - event related info
 * @param {string | number | Array.<string|number>} onChange.eventInfo.before - previously selected value(s)
 * @param {string} onChange.eventInfo.text - currently selected text
 *
 * @example
// controlled

import $ from 'jquery'
import cx from 'classnames'
import {Combobox} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            movie: {
                selected: 'test',
                eventInfo: null,
                info: null,
                error: false,
                list: [{value:'test', text:'TEST'}]
            },
            tv: {
                selected: [],
                eventInfo: null,
                info: null,
                error: false,
                list: []
            }
        }
    },
    handleChange(field, value, eventInfo) {
        this.setState(
            im(this.state)
                .set(field+'.selected', value)
                .set(field+'.eventInfo', eventInfo)
                .value()
        )
    },
    handleSearch(type, text) {
        // ajax to fetch movies, but doesn't need to be ajax
        this.setState(
            im(this.state)
                .set(type+'.list', [])
                .set(type+'.error', false)
                .set(type+'.info', 'Loading...')
                .value(),
            () => {
                $.get(
                    `https://api.themoviedb.org/3/${text?'search':'discover'}/${type}`,
                    {
                        api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                        query: text
                    })
                    .done(({results:list=[], total_results:total=0})=>{
                        if (total <= 0) {
                            this.setState(
                                im(this.state)
                                    .set(type+'.list', [])
                                    .set(type+'.info', `No ${type} found`)
                                    .value()
                            )
                        }
                        else {
                            this.setState(
                                im(this.state)
                                    .set(type+'.list', _.map(list, ({id, name, title})=>({value:id, text:title||name})))
                                    .set(type+'.info', total>10 ? `There are ${total} results, only show the first 10 records` : null)
                                    .value()
                            )
                        }
                    })
                    .fail((xhr)=>{
                        this.setState(im.set(this.state, type+'.error', xhr.responseText))
                    })
            }
        )
    },
    render() {
        return <div className='c-form'>
            {
                ['movie', 'tv'].map(type=>{
                    let {info, error, list, selected} = this.state[type]

                    return <div key={type}>
                        <label htmlFor={type}>Select {type}</label>
                        <Combobox
                            id={type}
                            required={true}
                            onChange={this.handleChange.bind(this, type)}
                            search={{
                                enabled: true,
                                onSearch:this.handleSearch.bind(this, type)
                            }}
                            info={info}
                            infoClassName={cx({'c-error':error})}
                            list={list}
                            placeholder={type}
                            enableClear={type==='tv'}
                            multiSelect={{
                                enabled:type==='tv',
                                toggleAll:true,
                                toggleAllText:'All'
                            }}
                            value={selected} />
                    </div>
                })
            }
        </div>
    }
})

 */


PopupList.propTypes = {
    info: _propTypes2.default.oneOfType([_propTypes2.default.node, _propTypes2.default.func]),
    infoClassName: _propTypes2.default.string,
    list: _propTypes3.LIST_PROP,
    selected: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes3.SIMPLE_VALUE_PROP), _propTypes3.SIMPLE_VALUE_PROP]),
    search: _propTypes2.default.object,
    multiSelect: _propTypes2.default.object,
    onSelect: _propTypes2.default.func.isRequired,
    onClickOutside: _propTypes2.default.func.isRequired
};
PopupList.defaultProps = {
    multiSelect: { enabled: false },
    search: { enabled: false }
};

var Combobox = function (_React$Component2) {
    _inherits(Combobox, _React$Component2);

    function Combobox() {
        var _ref5;

        var _temp2, _this3, _ret2;

        _classCallCheck(this, Combobox);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this3 = _possibleConstructorReturn(this, (_ref5 = Combobox.__proto__ || Object.getPrototypeOf(Combobox)).call.apply(_ref5, [this].concat(args))), _this3), _this3.state = {
            isListOpen: false,
            searchText: '',
            searchIsSelected: true,
            cachedValueText: {}
        }, _this3.onSelect = function (selected, data) {
            var _this3$props = _this3.props,
                onChange = _this3$props.onChange,
                multiSelectable = _this3$props.multiSelect.enabled;


            if (multiSelectable) {
                onChange(selected, data);
            } else {
                _this3.setState({ isListOpen: false, searchIsSelected: true }, function () {
                    onChange(selected, data);
                    _this3.input.focus();
                });
            }
        }, _this3.onInput = function (evt) {
            var searchText = evt.target ? evt.target.value : evt;
            _this3.setState({ isListOpen: true, searchText: searchText, searchIsSelected: false });
        }, _this3.getListPosition = function () {
            var input = _this3.input.getBoundingClientRect();
            return { x: input.left, y: input.bottom };
        }, _this3.showList = function (updateOnly) {
            var searchText = _this3.state.searchText;
            var _this3$props2 = _this3.props,
                list = _this3$props2.list,
                value = _this3$props2.value,
                search = _this3$props2.search,
                info = _this3$props2.info,
                infoClassName = _this3$props2.infoClassName,
                multiSelect = _this3$props2.multiSelect;
            var onSearch = search.onSearch,
                enableSearch = search.enabled;

            var popupWidth = _this3.input.getBoundingClientRect().width;

            if (enableSearch && !onSearch) {
                // not dynamic search, try to filter list by input value
                list = _lodash2.default.filter(list, function (item) {
                    return item.text.toLowerCase().indexOf(searchText.toLowerCase()) >= 0;
                });
            }

            _popover2.default.open(_this3.getListPosition(), _react2.default.createElement(PopupList, {
                list: list,
                multiSelect: multiSelect,
                search: multiSelect.enabled && enableSearch ? _extends({
                    enableClear: true,
                    interactive: true
                }, search, {
                    value: searchText,
                    onSearch: _this3.onInput
                }) : { enabled: false },
                selected: value,
                onSelect: _this3.onSelect,
                onClickOutside: _this3.handleListClickOutside,
                info: info, infoClassName: infoClassName }), {
                pointy: false,
                className: 'no-shadow',
                updateOnly: updateOnly,
                style: {
                    minWidth: popupWidth,
                    borderWidth: 1,
                    borderColor: '#a9a9a9',
                    borderStyle: 'solid',
                    borderRadius: '5px',
                    padding: 0,
                    backgroundColor: 'rgb(255, 255, 255)',
                    color: 'inherit',
                    overflowX: 'hidden'
                }
            });
        }, _this3.handleListClickOutside = function (target) {
            if (target !== _this3.clearIcon && target !== _this3.toggleIcon && target !== _this3.input) {
                _this3.toggleList();
            }
        }, _this3.toggleList = function () {
            var isListOpen = _this3.state.isListOpen;

            _this3.setState({ isListOpen: !isListOpen, searchText: '', searchIsSelected: true });
        }, _this3.formatDisplayText = function () {
            var _this3$props3 = _this3.props,
                list = _this3$props3.list,
                value = _this3$props3.value,
                multiSelect = _this3$props3.multiSelect;
            var _this3$state = _this3.state,
                cachedValueText = _this3$state.cachedValueText,
                searchIsSelected = _this3$state.searchIsSelected,
                searchText = _this3$state.searchText;


            if (multiSelect.enabled) {
                var items = (0, _lodash2.default)(value).map(function (item) {
                    return _lodash2.default.find(list, { value: item }) || { value: item, text: cachedValueText[item] };
                }).map('text').value();
                var itemsToShow = _lodash2.default.take(items, 3);

                return itemsToShow.join(', ') + (items.length > 3 ? ' (+' + (items.length - 3) + ')' : '');
            } else {
                var formatted = '';
                if (searchIsSelected) {
                    if (value) {
                        var selectedItem = null;
                        selectedItem = _lodash2.default.find(list, { value: value }) || { value: value, text: cachedValueText[value] };
                        formatted = selectedItem ? selectedItem.text : '';
                    }
                } else {
                    formatted = searchText;
                }
                return formatted;
            }
        }, _temp2), _possibleConstructorReturn(_this3, _ret2);
    }

    _createClass(Combobox, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var multiSelectable = nextProps.multiSelect.enabled,
                nextValue = nextProps.value,
                nextList = nextProps.list;
            var _props2 = this.props,
                value = _props2.value,
                list = _props2.list;
            var _state = this.state,
                searchIsSelected = _state.searchIsSelected,
                cachedValueText = _state.cachedValueText;

            var valueChanged = JSON.stringify(value) !== JSON.stringify(nextValue);
            var listChanged = JSON.stringify(list) !== JSON.stringify(nextList);

            if (valueChanged || listChanged) {
                log.debug('componentWillReceiveProps::value/list changed', { value: value, nextValue: nextValue, list: list, nextList: nextList });
                this.setState({
                    searchIsSelected: valueChanged ? true : searchIsSelected,
                    cachedValueText: _extends({}, _lodash2.default.reduce(multiSelectable ? value : [value], function (acc, v) {
                        return _extends({}, acc, _defineProperty({}, v, _lodash2.default.get(_lodash2.default.find(list, { value: v }), 'text', v)));
                    }, {}), cachedValueText)
                });
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            var _this4 = this;

            var _props$search = this.props.search,
                _props$search$delaySe = _props$search.delaySearch,
                delaySearch = _props$search$delaySe === undefined ? 750 : _props$search$delaySe,
                onSearch = _props$search.onSearch;
            var _state2 = this.state,
                searchIsSelected = _state2.searchIsSelected,
                searchText = _state2.searchText,
                isListOpen = _state2.isListOpen;
            var prevSearchText = prevState.searchText,
                wasListOpen = prevState.isListOpen;


            log.debug('componentDidUpdate', prevState, this.state, prevProps, this.props);
            if (isListOpen) {
                log.debug('componentDidUpdate::isListOpen');
                if (!wasListOpen) {
                    log.debug('componentDidUpdate::was closed');
                    if (onSearch) {
                        log.debug('performing search when list is opened');
                        onSearch(searchText);
                    } else {
                        this.showList();
                    }
                } else if (!searchIsSelected && searchText !== prevSearchText) {
                    log.debug('componentDidUpdate::search changed', { searchText: searchText, prevSearchText: prevSearchText });
                    if (onSearch) {
                        if (this.timer) {
                            log.debug('clearing search timer');
                            clearTimeout(this.timer);
                            delete this.timer;
                        }
                        this.timer = setTimeout(function () {
                            _this4.timer = null;
                            log.debug('performing search', searchText);
                            onSearch(searchText);
                        }, delaySearch);
                    } else {
                        this.showList(true);
                    }
                } else {
                    this.showList(true);
                }
            } else if (wasListOpen) {
                _popover2.default.close();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            var _props3 = this.props,
                id = _props3.id,
                name = _props3.name,
                className = _props3.className,
                required = _props3.required,
                placeholder = _props3.placeholder,
                enableClear = _props3.enableClear,
                disabled = _props3.disabled,
                list = _props3.list,
                value = _props3.value,
                multiSelectable = _props3.multiSelect.enabled,
                enableSearch = _props3.search.enabled;


            var displayText = this.formatDisplayText(list, value);

            return _react2.default.createElement(
                'span',
                { className: (0, _classnames2.default)('c-combobox', className, { multi: multiSelectable, clearable: enableClear }) },
                _react2.default.createElement('input', {
                    type: 'text',
                    ref: function ref(_ref6) {
                        _this5.input = _ref6;
                    },
                    id: id,
                    name: name,
                    className: (0, _classnames2.default)({ invalid: required && _underscore2.default.isBlank(displayText) }),
                    onChange: !multiSelectable && enableSearch ? this.onInput : function () {},
                    required: required,
                    placeholder: placeholder,
                    value: displayText,
                    disabled: disabled }),
                !disabled && _react2.default.createElement(
                    'span',
                    { className: 'actions c-flex aic' },
                    enableClear && _react2.default.createElement('i', { className: 'fg fg-close', ref: function ref(_ref7) {
                            _this5.clearIcon = _ref7;
                        }, onClick: this.onSelect.bind(this, multiSelectable ? [] : '', { text: '' }) }),
                    _react2.default.createElement('i', { className: 'fg fg-arrow-bottom', ref: function ref(_ref8) {
                            _this5.toggleIcon = _ref8;
                        }, onClick: this.toggleList })
                )
            );
        }
    }]);

    return Combobox;
}(_react2.default.Component);

Combobox.propTypes = {
    id: _propTypes2.default.string,
    name: _propTypes2.default.string,
    list: _propTypes3.LIST_PROP,
    className: _propTypes2.default.string,
    info: _propTypes2.default.oneOfType([_propTypes2.default.node, _propTypes2.default.func]),
    infoClassName: _propTypes2.default.string,
    value: _propTypes2.default.oneOfType([_propTypes3.SIMPLE_VALUE_PROP, _propTypes2.default.arrayOf(_propTypes3.SIMPLE_VALUE_PROP)]),
    multiSelect: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        toggleAll: _propTypes2.default.bool,
        toggleAllText: _propTypes2.default.string
    }),
    search: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        placeholder: _propTypes2.default.string,
        onSearch: _propTypes2.default.func,
        interactive: _propTypes2.default.bool,
        enableClear: _propTypes2.default.bool,
        delaySearch: _propTypes2.default.number
    }),
    required: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    enableClear: _propTypes2.default.bool,
    placeholder: _propTypes2.default.string,
    onChange: _propTypes2.default.func
};
Combobox.defaultProps = {
    list: [],
    multiSelect: {
        enabled: false
    },
    search: {
        enabled: false
    },
    disabled: false,
    enableClear: true,
    required: false
};
exports.default = (0, _propWire.wire)((0, _listNormalizer2.default)(Combobox), 'value', function (_ref9) {
    var multiSelect = _ref9.multiSelect;
    return _lodash2.default.get(multiSelect, 'enabled', false) ? [] : '';
});