'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.withSearch = withSearch;

var _propTypes2 = require('prop-types');

var _propTypes3 = _interopRequireDefault(_propTypes2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _form = require('../components/form');

var _form2 = _interopRequireDefault(_form);

var _popover = require('../components/popover');

var _popover2 = _interopRequireDefault(_popover);

var _propWire = require('./prop-wire');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var log = require('loglevel').getLogger('react-ui/hoc/search-provider');

function withSearch(Component) {
    var _propTypes, _class, _temp, _initialiseProps;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$searchTarget = options.searchTarget,
        searchTarget = _options$searchTarget === undefined ? 'data' : _options$searchTarget,
        filterEntryField = options.filterEntryField,
        _options$defaultTitle = options.defaultTitle,
        defaultTitle = _options$defaultTitle === undefined ? 'Search' : _options$defaultTitle,
        _options$defaultApply = options.defaultApplyText,
        defaultApplyText = _options$defaultApply === undefined ? 'Apply' : _options$defaultApply;


    var propTypes = (_propTypes = {}, _defineProperty(_propTypes, searchTarget, _propTypes3.default.arrayOf(_propTypes3.default.object)), _defineProperty(_propTypes, 'id', _propTypes3.default.string), _defineProperty(_propTypes, 'actions', _propTypes3.default.node), _defineProperty(_propTypes, 'show', _propTypes3.default.arrayOf(_propTypes3.default.string)), _defineProperty(_propTypes, 'search', _propTypes3.default.shape({
        title: _propTypes3.default.string,
        applyText: _propTypes3.default.string,
        filter: _propTypes3.default.oneOfType([_propTypes3.default.bool, _propTypes3.default.object, _propTypes3.default.func]),
        form: _propTypes3.default.object,
        value: _propTypes3.default.object,
        onSearch: _propTypes3.default.func
    })), _propTypes);

    return (0, _propWire.wireSet)((_temp = _class = function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class(props, context) {
            _classCallCheck(this, _class);

            var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, props, context));

            _initialiseProps.call(_this);

            _this.searchContainerId = 'g-' + (props.id || Math.random()) + '-search-container';
            var items = props[searchTarget],
                show = props.show,
                _props$search = props.search,
                searchForm = _props$search.form,
                filter = _props$search.filter,
                search = _props$search.value;


            if (_lodash2.default.isEmpty(searchForm)) {
                _this.state = {};
                return _possibleConstructorReturn(_this);
            }

            _this.state = {
                showSearch: false,
                show: _this.getIdsToShow(items, show, searchForm, filter, search)
            };
            return _this;
        }

        _createClass(_class, [{
            key: 'componentWillReceiveProps',
            value: function componentWillReceiveProps(nextProps) {
                var items = nextProps[searchTarget],
                    show = nextProps.show,
                    _nextProps$search = nextProps.search,
                    searchForm = _nextProps$search.form,
                    filter = _nextProps$search.filter,
                    search = _nextProps$search.value;
                var _props = this.props,
                    prevItems = _props[searchTarget],
                    prevShow = _props.show,
                    _props$search2 = _props.search,
                    prevSearchForms = _props$search2.form,
                    prevSearch = _props$search2.value;


                if (_lodash2.default.isEmpty(searchForm)) {
                    return;
                }

                if (items !== prevItems || !_lodash2.default.isEqual(search, prevSearch) || !_lodash2.default.isEqual(searchForm, prevSearchForms) || show !== prevShow) {
                    log.debug('componentDidUpdate::re-calculate show', { search: search, prevSearch: prevSearch, show: show, prevShow: prevShow });
                    this.setState({
                        show: this.getIdsToShow(items, show, searchForm, filter, search)
                    });
                }
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                _popover2.default.closeId(this.searchContainerId);
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this;

                var _props2 = this.props,
                    _props2$search = _props2.search,
                    searchTitle = _props2$search.title,
                    searchForm = _props2$search.form,
                    originalActions = _props2.actions;


                if (_lodash2.default.isEmpty(searchForm)) {
                    return _react2.default.createElement(Component, _extends({}, this.props, {
                        ref: function ref(_ref) {
                            _this2._component = _ref;
                        } }));
                }

                var _state = this.state,
                    showSearch = _state.showSearch,
                    show = _state.show;


                var actions = [_react2.default.createElement('button', {
                    ref: function ref(_ref2) {
                        _this2.searchBtnNode = _ref2;
                    },
                    onClick: this.toggleSearchPanel,
                    className: (0, _classnames2.default)('standard fg fg-search', { active: showSearch }),
                    title: searchTitle || (_lodash2.default.isFunction(defaultTitle) ? defaultTitle() : defaultTitle) }), originalActions];

                return _react2.default.createElement(Component, _extends({}, _lodash2.default.omit(this.props, ['search']), {
                    actions: actions,
                    show: show,
                    ref: function ref(_ref3) {
                        _this2._component = _ref3;
                    } }));
            }
        }]);

        return _class;
    }(_react2.default.Component), _class.propTypes = propTypes, _class.defaultProps = {
        search: {}
    }, _initialiseProps = function _initialiseProps() {
        var _this3 = this;

        this.compactSearch = function (data) {
            if (_lodash2.default.isString(data)) {
                return _lodash2.default.trim(data) || null;
            }
            if (data === false) {
                return null;
            }
            if (_lodash2.default.isObject(data)) {
                var compactedObj = _lodash2.default.reduce(data, function (acc, v, k) {
                    var compactedVal = _this3.compactSearch(v);
                    if (compactedVal == null) {
                        return acc;
                    }
                    return _extends({}, acc, _defineProperty({}, k, compactedVal));
                }, {});
                return _lodash2.default.isEmpty(compactedObj) ? null : compactedObj;
            }
            if (_lodash2.default.isArray(data)) {
                var compactedArr = _lodash2.default.reduce(data, function (acc, v) {
                    var compactedVal = _this3.compactSearch(v);
                    if (compactedVal == null) {
                        return acc;
                    }
                    return [].concat(_toConsumableArray(acc), [compactedVal]);
                }, []);
                return _lodash2.default.isEmpty(compactedArr) ? null : compactedArr;
            }
            return data;
        };

        this.getIdsToShow = function (items, show, searchForm, filter, search) {
            var compactedSearch = _this3.compactSearch(search);

            log.debug('getIdsToShow', { filter: filter });

            if (filter === false || _lodash2.default.isEmpty(compactedSearch)) {
                return show;
            }

            var filterToApply = filter;
            if (!filter || filter === true) {
                filterToApply = filterEntryField ? _defineProperty({}, filterEntryField, compactedSearch) : compactedSearch;
            }

            var toShow = (0, _lodash2.default)(items).filter(function (item) {
                var id = item.id;

                if (show && !_lodash2.default.includes(show, id)) {
                    return false;
                }

                if (_lodash2.default.isFunction(filterToApply)) {
                    return filterToApply(item, compactedSearch);
                } else {
                    return _lodash2.default.isMatchWith(item, filterToApply, function (itemVal, filterVal) {
                        if (_lodash2.default.isString(filterVal) && _lodash2.default.trim(filterVal) === '') {
                            return true;
                        }
                        if (_lodash2.default.isString(itemVal) && _lodash2.default.isString(filterVal)) {
                            return (itemVal + '').toLowerCase().indexOf(filterVal.toLowerCase()) >= 0;
                        }
                        return undefined;
                    });
                }
            }).map('id').value();
            return toShow;
        };

        this.toggleSearchPanel = function () {
            _this3.setState(function (_ref5) {
                var showSearch = _ref5.showSearch;

                return {
                    showSearch: !showSearch
                };
            }, function () {
                var showSearch = _this3.state.showSearch;


                if (!showSearch) {
                    _popover2.default.closeId(_this3.searchContainerId);
                    return;
                }

                var _props$search3 = _this3.props.search,
                    searchForm = _props$search3.form,
                    searchValue = _props$search3.value,
                    _props$search3$applyT = _props$search3.applyText,
                    searchApplyText = _props$search3$applyT === undefined ? _lodash2.default.isFunction(defaultApplyText) ? defaultApplyText() : defaultApplyText : _props$search3$applyT;


                var rect = _this3.searchBtnNode.getBoundingClientRect();
                var bottom = rect.bottom,
                    left = rect.left;

                var position = {
                    x: left,
                    y: bottom
                };

                var SearchPanel = _react2.default.createElement(_form2.default, _extends({}, searchForm, {
                    className: (0, _classnames2.default)('search', searchForm.className),
                    defaultValue: searchValue,
                    actions: {
                        apply: {
                            text: searchApplyText,
                            handler: _this3.handleSearch
                        }
                    } }));
                _popover2.default.openId(_this3.searchContainerId, position, SearchPanel, { className: 'nopad' });
            });
        };

        this.handleSearch = function (search) {
            var onSearch = _this3.props.search.onSearch;

            onSearch(search);
        };
    }, _temp), {
        search: {
            name: 'search.value',
            defaultName: 'search.defaultValue',
            defaultValue: {},
            changeHandlerName: 'search.onSearch'
        }
    });
}

exports.default = withSearch;