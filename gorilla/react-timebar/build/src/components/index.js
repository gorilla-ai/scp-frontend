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

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-timebar/components');

/**
 * A wrapper React Timebar Component for [timebar]{@link http://172.18.0.166:8099/docs/keylines/API%20Reference.html} library.
 * @constructor
 * @param {string} [id] - Timebar element #id
 * @param {function} [_ref] - Reference to the underlying component
 * @param {string} [className] - Classname for the container
 * @param {string} [assetsPath='/lib/keylines/assets/'] - path to KeyLines assets folder
 * @param {object} [chartOptions] - global chart options to be supplied to [KeyLines]{@link http://172.18.0.166:8099/docs/keylines/API%20Reference.html}
 * @param {array.<object>} [items] - array of items to show in timebar
 * @param {string} items.id - item id
 * @param {number|array.<number>} items.dt - timestamp(s) for this item
 * @param {number|array.<number>} [items.v=1] - value(s) for this item, corresponding to individual timestamp
 * @param {string} [items.group] - associated group id for this item
 * @param {object} [groups] - groups represented by object of id-group(group config) pairs, note at any time at most 3 groups can be set
 * @param {string} groups.id - group id
 * @param {string} [groups.id.color] - group line color
 * @param {object} [scrollWheelZoom] - Configuration for enabling/disabling zooming on mouse wheel scroll
 * @param {boolean} [scrollWheelZoom.enabled=true] - enable zooming on mouse wheel scroll?
 * @param {function} [onReady] - Callback function when chart is initialized and ready
 * @param {function} [onRangeChange] - Callback function when selected range is changed
 * @param {array.<number>} onRangeChange.range - [start, end] timestamp of current selected range
 * @param {function} [onClick] - Callback function when chart is clicked
 * @param {'bar'|'selection'} onClick.type - whether clicked on bar or group
 * @param {object} onClick.eventInfo - event related info
 * @param {string} onClick.eventInfo.group - group id (if type='selection')
 * @param {number} onClick.eventInfo.value - sum of items' *value* contained in current bar/selection
 * @param {number} onClick.eventInfo.x - x coords
 * @param {number} onClick.eventInfo.y - y coords
 * @param {function} [onDoubleClick] - Callback function when chart is double-clicked
 * @param {'bar'|'selection'} onDoubleClick.type - whether clicked on bar or group
 * @param {object} onDoubleClick.eventInfo - event related info
 * @param {string} onDoubleClick.eventInfo.group - group id (if type='selection')
 * @param {number} onDoubleClick.eventInfo.value - sum of items' *value* contained in current bar/selection
 * @param {number} onDoubleClick.eventInfo.x - x coords
 * @param {number} onDoubleClick.eventInfo.y - y coords
 * @param {function} [onMouseOver] - Callback function when chart is hovered
 * @param {'bar'|'selection'} onMouseOver.type - whether clicked on bar or group
 * @param {object} onMouseOver.eventInfo - event related info
 * @param {string} onMouseOver.eventInfo.group - group id (if type='selection')
 * @param {number} onMouseOver.eventInfo.value - sum of items' *value* contained in current bar/selection
 * @param {number} onMouseOver.eventInfo.x - x coords
 * @param {number} onMouseOver.eventInfo.y - y coords
 * @param {function} [onContextMenu] - Callback function when chart is right-clicked
 * @param {'bar'|'selection'} onContextMenu.type - whether clicked on bar or group
 * @param {object} onContextMenu.eventInfo - event related info
 * @param {string} onContextMenu.eventInfo.group - group id (if type='selection')
 * @param {number} onContextMenu.eventInfo.value - sum of items' *value* contained in current bar/selection
 * @param {number} onContextMenu.eventInfo.x - x coords
 * @param {number} onContextMenu.eventInfo.y - y coords
 *
 *
 *
 * @example
// See [example]{@link http://ivs.duckdns.org:10080/web-ui/react-timebar/blob/master/examples/src/timebar.js}
 */

var Timebar = function (_React$Component) {
    _inherits(Timebar, _React$Component);

    function Timebar() {
        var _ref2;

        var _temp, _this, _ret;

        _classCallCheck(this, Timebar);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = Timebar.__proto__ || Object.getPrototypeOf(Timebar)).call.apply(_ref2, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Timebar, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            if (!window.KeyLines) {
                log.error('KeyLines not found');
                return;
            }

            var _props = this.props,
                _ref = _props._ref,
                onReady = _props.onReady;

            if (_ref) {
                _ref(this);
            }
            window.addEventListener('resize', this.resize);

            this.init(function () {
                onReady && onReady();
                _this2.load();
            });
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var _props2 = this.props,
                items = _props2.items,
                groups = _props2.groups;
            var prevItems = prevProps.items,
                prevGroups = prevProps.groups;


            if (!this.timebar) {
                // chart not ready yet
                return;
            }

            if (items !== prevItems) {
                log.debug('componentDidUpdate::items changed', prevItems, items);
                this.load();
            } else {
                if (!_lodash2.default.isEqual(groups, prevGroups)) {
                    log.debug('componentDidUpdate::groups changed', prevGroups, groups);
                    this.hiliteGroups(groups);
                }
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.timebar.clear();
            this.timebar.unbind();
            window.removeEventListener('resize', this.resize);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props3 = this.props,
                id = _props3.id,
                className = _props3.className;


            return _react2.default.createElement(
                'div',
                { id: id, ref: function ref(_ref4) {
                        _this3.timebarContainerNode = _ref4;
                    }, className: (0, _classnames2.default)('c-timebar', className) },
                _react2.default.createElement('div', { ref: function ref(_ref3) {
                        _this3.timebarNode = _ref3;
                    } })
            );
        }
    }]);

    return Timebar;
}(_react2.default.Component);

Timebar.propTypes = {
    id: _propTypes2.default.string,
    _ref: _propTypes2.default.func,
    className: _propTypes2.default.string,
    assetsPath: _propTypes2.default.string,
    chartOptions: _propTypes2.default.object,
    items: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        id: _propTypes2.default.string,
        dt: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.arrayOf(_propTypes2.default.number), _propTypes2.default.instanceOf(Date), _propTypes2.default.arrayOf(_propTypes2.default.instanceOf(Date))]),
        v: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.arrayOf(_propTypes2.default.number)]),
        group: _propTypes2.default.string
    })),
    groups: _propTypes2.default.objectOf(_propTypes2.default.shape({
        color: _propTypes2.default.string
    })),
    scrollWheelZoom: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool
    }),
    onReady: _propTypes2.default.func,
    onRangeChange: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    onDoubleClick: _propTypes2.default.func,
    onMouseOver: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func
};
Timebar.defaultProps = {
    assetsPath: '/lib/keylines/assets/',
    chartOptions: {},
    items: [],
    groups: {},
    scrollWheelZoom: {}
};

var _initialiseProps = function _initialiseProps() {
    var _this4 = this;

    this.state = {};

    this.init = function (onDone) {
        var chartOptions = _this4.props.chartOptions;


        var g = window.KeyLines;
        var assetsPath = _this4.props.assetsPath;


        g.paths({
            assets: assetsPath
        });

        log.info('creating instance of Timebar module', _this4.timebarNode);

        g.create({
            element: _this4.timebarNode,
            type: 'timebar',
            options: _extends({}, chartOptions)
        }, function (err, timebar) {
            _this4.timebar = timebar;
            log.info('timebar chart created', timebar);
            _this4.setupEvents();
            onDone && onDone();
        });
    };

    this.setupEvents = function () {
        var _props4 = _this4.props,
            onRangeChange = _props4.onRangeChange,
            onClick = _props4.onClick,
            onDoubleClick = _props4.onDoubleClick,
            onMouseOver = _props4.onMouseOver,
            onContextMenu = _props4.onContextMenu;


        var timebar = _this4.timebar;

        timebar.bind('mousewheel', function () {
            var _props$scrollWheelZoo = _this4.props.scrollWheelZoom.enabled,
                enableScrollWheelZoom = _props$scrollWheelZoo === undefined ? true : _props$scrollWheelZoo;

            return !enableScrollWheelZoom;
        });

        if (onRangeChange) {
            timebar.bind('change', function () {
                var _timebar$range = timebar.range(),
                    dt1 = _timebar$range.dt1,
                    dt2 = _timebar$range.dt2;

                onRangeChange([(0, _moment2.default)(dt1).valueOf(), (0, _moment2.default)(dt2).valueOf()]);
            });
        }

        if (onClick) {
            timebar.bind('click', function (type) {
                for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = arguments[_key2];
                }

                if (type !== 'bar' && type !== 'selection') {
                    return;
                }
                var index = args[0],
                    value = args[1],
                    x = args[2],
                    y = args[3];

                onClick(type, { group: _this4.getGroupId(index), value: value, x: x, y: y });
            });
        }
        if (onDoubleClick) {
            timebar.bind('dblclick', function (type) {
                for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                    args[_key3 - 1] = arguments[_key3];
                }

                if (type !== 'bar' && type !== 'selection') {
                    return;
                }
                var index = args[0],
                    value = args[1],
                    x = args[2],
                    y = args[3];

                onDoubleClick(type, { group: _this4.getGroupId(index), value: value, x: x, y: y });
            });
        }
        if (onMouseOver) {
            timebar.bind('hover', function (type) {
                for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                    args[_key4 - 1] = arguments[_key4];
                }

                if (type !== 'bar' && type !== 'selection') {
                    return;
                }
                var index = args[0],
                    value = args[1],
                    x = args[2],
                    y = args[3];

                onMouseOver(type, { group: _this4.getGroupId(index), value: value, x: x, y: y });
            });
        }
        if (onContextMenu) {
            timebar.bind('contextmenu', function (type) {
                for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
                    args[_key5 - 1] = arguments[_key5];
                }

                if (type !== 'bar' && type !== 'selection') {
                    return;
                }
                var index = args[0],
                    value = args[1],
                    x = args[2],
                    y = args[3];

                onContextMenu(type, { group: _this4.getGroupId(index), value: value, x: x, y: y });
            });
        }
    };

    this.getGroupId = function (index) {
        if (index == null) {
            return undefined;
        }

        var groups = _this4.props.groups;

        var groupId = _lodash2.default.keys(groups)[index];
        return groupId;
    };

    this.load = function () {
        var _props5 = _this4.props,
            items = _props5.items,
            groups = _props5.groups;

        log.debug('load::start', items);
        var timebar = _this4.timebar;

        timebar.clear();

        setTimeout(function () {
            timebar.load({ items: items }, function () {
                if (!_lodash2.default.isEmpty(groups)) {
                    _this4.hiliteGroups(groups);
                }
                log.info('load::done');
            });
        });
    };

    this.resetView = function (onDone) {
        _this4.timebar.zoom('fit', {}, onDone);
    };

    this.hiliteGroups = function (groups) {
        var timebar = _this4.timebar;
        var items = _this4.props.items;

        timebar.selection([]);
        var index = 0;
        var newSelection = _lodash2.default.map(groups, function (_ref5, groupId) {
            var color = _ref5.color;

            return {
                id: (0, _lodash2.default)(items).filter(function (item) {
                    return item.group === groupId;
                }).map('id').value(),
                index: index++,
                c: color
            };
        });

        timebar.selection(newSelection);
    };

    this.resize = function () {
        var bb = _this4.timebarContainerNode.getBoundingClientRect();
        window.KeyLines.setSize(_this4.timebarNode, bb.width, bb.height);
    };
};

exports.default = Timebar;