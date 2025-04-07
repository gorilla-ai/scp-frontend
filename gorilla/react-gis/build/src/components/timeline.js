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

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

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

var log = require('loglevel').getLogger('react-gis/components/timeline');

var ReactGisTimeline = function (_React$Component) {
    _inherits(ReactGisTimeline, _React$Component);

    function ReactGisTimeline(props, context) {
        _classCallCheck(this, ReactGisTimeline);

        var _this = _possibleConstructorReturn(this, (ReactGisTimeline.__proto__ || Object.getPrototypeOf(ReactGisTimeline)).call(this, props, context));

        _initialiseProps.call(_this);

        var show = props.show,
            data = props.data;


        _this.state = {
            timebarItems: _this.generateTimebarItems(data, show),
            timeRange: null,
            isTrackMode: false,
            show: show
        };
        return _this;
    }

    _createClass(ReactGisTimeline, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this2 = this;

            var _props = this.props,
                prevShow = _props.show,
                prevData = _props.data;
            var show = nextProps.show,
                data = nextProps.data;

            if (data !== prevData || show !== prevShow) {
                this.setState({
                    timebarItems: this.generateTimebarItems(data, show),
                    show: show
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
                _props2$timebar = _props2.timebar,
                timebarProps = _props2$timebar === undefined ? {} : _props2$timebar,
                _props2$trackOptions = _props2.trackOptions,
                trackOptions = _props2$trackOptions === undefined ? [] : _props2$trackOptions,
                _props2$children = _props2.children,
                originalChildren = _props2$children === undefined ? [] : _props2$children,
                componentProps = _objectWithoutProperties(_props2, ['timebar', 'trackOptions', 'children']);

            var _state = this.state,
                timebarItems = _state.timebarItems,
                show = _state.show,
                timeRange = _state.timeRange,
                isTrackMode = _state.isTrackMode;


            var TimebarElement = _react2.default.createElement(_reactTimebar2.default, _extends({
                ref: function ref(_ref) {
                    _this3.timebarNode = _ref;
                },
                onRangeChange: this.handleRangeChange
            }, timebarProps, {
                items: timebarItems }));

            return _react2.default.createElement(
                _index2.default,
                _extends({
                    timeRange: timeRange && isTrackMode ? [0, timeRange[1]] : null
                }, componentProps, {
                    show: show,
                    trackOptions: [{
                        props: {
                            showOngoing: true,
                            endSymbol: {
                                type: 'spot'
                            }
                        }
                    }].concat(_toConsumableArray(trackOptions)),
                    onLayoutChange: this.handleLayoutChange,
                    _ref: this.handleRef }),
                [TimebarElement].concat(_toConsumableArray(originalChildren))
            );
        }
    }]);

    return ReactGisTimeline;
}(_react2.default.Component);

ReactGisTimeline.propTypes = {
    _ref: _propTypes2.default.func,
    data: _propTypes2.default.arrayOf(_propTypes2.default.object),
    show: _propTypes2.default.arrayOf(_propTypes2.default.string),
    showStatic: _propTypes2.default.bool,
    trackOptions: _propTypes2.default.arrayOf(_propTypes2.default.object),
    timebar: _propTypes2.default.object,
    onLayoutChange: _propTypes2.default.func
};

var _initialiseProps = function _initialiseProps() {
    var _this4 = this;

    this.getItemsInRange = function (layout, data, show, timeRange, showStatic) {
        if (layout === 'track') {
            return show;
        } else {
            var dataByKey = _lodash2.default.keyBy(data, 'id');
            var newShow = _lodash2.default.filter(show || _lodash2.default.keys(dataByKey), function (showId) {
                var item = dataByKey[showId];
                if (!item) {
                    return false;
                }

                var ts = item.ts;

                var isStatic = ts == null || _lodash2.default.isArray(ts) && ts.length <= 0;
                if (showStatic && isStatic || !isStatic && _this4.timebarNode.timebar.inRange(showId)) {
                    return true;
                }
                return false;
            });
            return newShow;
        }
    };

    this.handleRangeChange = function (timeRange) {
        var layout = _this4.gisNode.props.layout;
        var _props3 = _this4.props,
            data = _props3.data,
            show = _props3.show,
            showStatic = _props3.showStatic;

        if (layout === 'track') {
            _this4.setState({
                timeRange: timeRange,
                isTrackMode: true,
                show: show
            });
        } else {
            var prevShow = _this4.state.show;

            var newShow = _this4.getItemsInRange(layout, data, show, timeRange, showStatic);

            // optimize show so it only triggers show change when necessary
            if (newShow.length === data.length) {
                newShow = null;
            } else if (prevShow) {
                var numShared = _lodash2.default.intersection(prevShow, newShow).length;
                if (numShared === prevShow.length && numShared === newShow.length) {
                    newShow = prevShow;
                }
            }
            _this4.setState({
                timeRange: timeRange,
                isTrackMode: false,
                show: newShow
            });
        }
    };

    this.handleLayoutChange = function (layout, eventInfo) {
        var _props4 = _this4.props,
            data = _props4.data,
            show = _props4.show,
            showStatic = _props4.showStatic,
            onLayoutChange = _props4.onLayoutChange;
        var timeRange = _this4.state.timeRange;
        var prevLayout = eventInfo.before;


        if (layout === 'track' || prevLayout === 'track') {
            _this4.setState({
                isTrackMode: layout === 'track',
                show: _this4.getItemsInRange(layout, data, show, timeRange, showStatic) //reset show
            });
        }

        if (onLayoutChange) {
            onLayoutChange(layout, eventInfo);
        }
    };

    this.handleRef = function (instance) {
        _this4.gisNode = instance;
        if (_lodash2.default.has(_this4.props, '_ref')) {
            _this4.props._ref(instance);
        }
    };

    this.resize = function () {
        _this4.gisNode.resize();
        _this4.timebarNode.resize();
    };

    this.generateTimebarItems = function (data, show) {
        return _lodash2.default.reduce(data, function (acc, item) {
            var id = item.id,
                v = item.v,
                group = item.group,
                ts = item.ts;

            if (!show || _lodash2.default.includes(show, id)) {
                var dt = ts;
                if (dt) {
                    dt = _lodash2.default.map(_lodash2.default.isArray(dt) ? dt : [dt], function (i) {
                        return (0, _moment2.default)(i).toDate();
                    });
                }
                if (!_lodash2.default.isEmpty(dt)) {
                    return [].concat(_toConsumableArray(acc), [{
                        id: id,
                        dt: dt,
                        v: v,
                        group: group
                    }]);
                }
                return acc;
            }
            return acc;
        }, []);
    };
};

exports.default = ReactGisTimeline;