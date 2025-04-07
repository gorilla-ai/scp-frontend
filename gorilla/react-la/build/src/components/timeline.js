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

var _reactTimebar = require('react-timebar');

var _reactTimebar2 = _interopRequireDefault(_reactTimebar);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-la/components/timeline');

var ReactLaTimeline = function (_React$Component) {
    _inherits(ReactLaTimeline, _React$Component);

    function ReactLaTimeline(props, context) {
        _classCallCheck(this, ReactLaTimeline);

        var _this = _possibleConstructorReturn(this, (ReactLaTimeline.__proto__ || Object.getPrototypeOf(ReactLaTimeline)).call(this, props, context));

        _initialiseProps.call(_this);

        var items = props.items,
            show = props.show,
            layoutOnFilter = props.layoutOnFilter;


        _this.state = {
            timebarItems: _this.generateTimebarItems(items, show),
            show: show,
            layoutOnFilter: layoutOnFilter
        };
        return _this;
    }

    _createClass(ReactLaTimeline, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this2 = this;

            var _props = this.props,
                prevShow = _props.show,
                prevItems = _props.items,
                layoutOnFilter = _props.layoutOnFilter;
            var show = nextProps.show,
                items = nextProps.items;

            if (items !== prevItems || show !== prevShow) {
                this.setState({
                    timebarItems: this.generateTimebarItems(items, show),
                    show: show,
                    layoutOnFilter: layoutOnFilter
                }, function () {
                    _this2.timebarNode.resetView();
                });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props2 = this.props,
                showStatic = _props2.showStatic,
                layoutOnPlay = _props2.layoutOnPlay,
                _props2$timebar = _props2.timebar,
                timebarProps = _props2$timebar === undefined ? {} : _props2$timebar,
                _props2$children = _props2.children,
                originalChildren = _props2$children === undefined ? [] : _props2$children,
                componentProps = _objectWithoutProperties(_props2, ['showStatic', 'layoutOnPlay', 'timebar', 'children']);

            var _state = this.state,
                timebarItems = _state.timebarItems,
                show = _state.show,
                layoutOnFilter = _state.layoutOnFilter;


            var TimebarElement = _react2.default.createElement(_reactTimebar2.default, _extends({
                ref: function ref(_ref) {
                    _this3.timebarNode = _ref;
                },
                onRangeChange: this.handleRangeChange
            }, timebarProps, {
                items: timebarItems }));

            return _react2.default.createElement(
                _index2.default,
                _extends({}, componentProps, {
                    layoutOnFilter: layoutOnFilter,
                    show: show,
                    _ref: this.handleRef }),
                [TimebarElement].concat(_toConsumableArray(originalChildren))
            );
        }
    }]);

    return ReactLaTimeline;
}(_react2.default.Component);

ReactLaTimeline.propTypes = {
    timebar: _propTypes2.default.object,
    items: _propTypes2.default.arrayOf(_propTypes2.default.object),
    show: _propTypes2.default.arrayOf(_propTypes2.default.string),
    showStatic: _propTypes2.default.bool,
    layoutOnFilter: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.oneOf([].concat(_toConsumableArray(_index.LAYOUTS), ['tweak']))]),
    layoutOnPlay: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.oneOf([].concat(_toConsumableArray(_index.LAYOUTS), ['tweak']))]),
    _ref: _propTypes2.default.func
};
ReactLaTimeline.defaultProps = {
    showStatic: false,
    layoutOnFilter: false,
    layoutOnPlay: 'tweak'
};

var _initialiseProps = function _initialiseProps() {
    var _this4 = this;

    this.generateTimebarItems = function (items, show) {
        if (show && show.length <= 0) {
            return [];
        }

        var itemsByKey = _lodash2.default.keyBy(items, 'id');
        var nodeIds = _lodash2.default.filter(show, function (showId) {
            return _lodash2.default.get(itemsByKey, [showId, 'type']) === 'node';
        });
        var linkIds = !show || show.length === nodeIds.length ? (0, _lodash2.default)(items).filter({ type: 'link' }).map('id').value() : _lodash2.default.difference(show, nodeIds);
        var filterNodes = nodeIds.length > 0;

        var result = _lodash2.default.reduce(linkIds, function (acc, linkId) {
            var link = itemsByKey[linkId];
            if (!filterNodes || _lodash2.default.includes(nodeIds, link.id1) && _lodash2.default.includes(nodeIds, link.id2)) {
                return [].concat(_toConsumableArray(acc), [link]);
            }
            return acc;
        }, []);

        return result;
    };

    this.getItemsInRange = function (items, timebarItems, curShow, timeRange, timebarInstance, showStatic) {
        var itemsByKey = _lodash2.default.keyBy(items, 'id');
        var nodeIds = _lodash2.default.filter(curShow, function (showId) {
            return _lodash2.default.get(itemsByKey, [showId, 'type']) === 'node';
        });
        var linkIds = _lodash2.default.reduce(timebarItems, function (acc, timebarItem) {
            var id = timebarItem.id,
                dt = timebarItem.dt;

            var isStatic = dt == null || _lodash2.default.isArray(dt) && dt.length <= 0;
            if (showStatic && isStatic || !isStatic && timebarInstance.inRange(id)) {
                return [].concat(_toConsumableArray(acc), [id]);
            }
            return acc;
        }, []);
        return [].concat(_toConsumableArray(nodeIds), _toConsumableArray(linkIds));
    };

    this.updateItemsToShowWithRange = function (curShow, timeRange) {
        var _props3 = _this4.props,
            items = _props3.items,
            showStatic = _props3.showStatic,
            layoutOnPlay = _props3.layoutOnPlay;
        var _state2 = _this4.state,
            prevShow = _state2.show,
            timebarItems = _state2.timebarItems;


        var newShow = _this4.getItemsInRange(items, timebarItems, curShow, timeRange, _this4.timebarNode.timebar, showStatic);

        if (prevShow === newShow) {
            return;
        }

        if (prevShow == null || newShow == null) {
            _this4.setState({
                show: newShow
            });
            return;
        }

        var numShared = _lodash2.default.intersection(prevShow, newShow).length;
        if (numShared !== prevShow.length || numShared !== newShow.length) {
            _this4.setState({
                show: newShow,
                layoutOnFilter: layoutOnPlay
            });
        }
    };

    this.handleRangeChange = function (timeRange) {
        var show = _this4.props.show;

        _this4.updateItemsToShowWithRange(show, timeRange);
    };

    this.handleRef = function (instance) {
        _this4.laNode = instance;
        if (_lodash2.default.has(_this4.props, '_ref')) {
            _this4.props._ref(instance);
        }
    };

    this.resize = function () {
        _this4.laNode.resize();
        _this4.timebarNode.resize();
    };
};

exports.default = ReactLaTimeline;