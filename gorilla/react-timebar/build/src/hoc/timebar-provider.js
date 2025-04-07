'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.withTimebar = withTimebar;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _components = require('../components');

var _components2 = _interopRequireDefault(_components);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var log = require('loglevel').getLogger('react-timebar/hoc/timebar-provider');

function withTimebar(Component) {
    var _class, _temp, _initialiseProps;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$target = options.target,
        target = _options$target === undefined ? 'data' : _options$target,
        _options$idField = options.idField,
        idField = _options$idField === undefined ? 'id' : _options$idField,
        _options$dtField = options.dtField,
        dtField = _options$dtField === undefined ? 'dt' : _options$dtField,
        _options$vField = options.vField,
        vField = _options$vField === undefined ? 'v' : _options$vField,
        _options$groupField = options.groupField,
        groupField = _options$groupField === undefined ? 'group' : _options$groupField;
    var _options$generator = options.generator,
        generator = _options$generator === undefined ? function (items, show) {
        return _lodash2.default.reduce(items, function (acc, item) {
            var itemId = item[idField];

            if (!show || _lodash2.default.includes(show, itemId)) {
                var dt = _lodash2.default.get(item, dtField);
                if (dt) {
                    dt = _lodash2.default.map(_lodash2.default.isArray(dt) ? dt : [dt], function (i) {
                        return (0, _moment2.default)(i).toDate();
                    });
                }

                return [].concat(_toConsumableArray(acc), [{
                    id: itemId,
                    dt: dt,
                    v: _lodash2.default.get(item, vField),
                    group: _lodash2.default.get(item, groupField)
                }]);
            }
            return acc;
        }, []);
    } : _options$generator,
        _options$showGenerato = options.showGenerator,
        showGenerator = _options$showGenerato === undefined ? function (items, timebarItems, curShow, timeRange, timebarInstance, showStatic) {
        var newShow = [];
        _lodash2.default.forEach(timebarItems, function (timebarItem) {
            var id = timebarItem.id,
                dt = timebarItem.dt;

            if (curShow && !_lodash2.default.includes(curShow, id)) {
                return;
            }

            var isStatic = dt == null || _lodash2.default.isArray(dt) && dt.length <= 0;
            if (isStatic && showStatic || !isStatic && timebarInstance.inRange(id)) {
                newShow.push(id);
            }
        });
        newShow = newShow.length === timebarItems.length ? null : newShow;
        return newShow;
    } : _options$showGenerato;


    var propTypes = {
        timebar: _propTypes2.default.object,
        items: _propTypes2.default.arrayOf(_propTypes2.default.object),
        show: _propTypes2.default.arrayOf(_propTypes2.default.string),
        showStatic: _propTypes2.default.bool
    };

    return _temp = _class = function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class(props) {
            _classCallCheck(this, _class);

            var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, props));

            _initialiseProps.call(_this);

            var items = props[target],
                show = props.show;


            _this.state = {
                timebarItems: generator(items, show),
                show: show
            };
            return _this;
        }

        _createClass(_class, [{
            key: 'componentWillReceiveProps',
            value: function componentWillReceiveProps(nextProps) {
                var _this2 = this;

                var _props = this.props,
                    prevShow = _props.show,
                    prevItems = _props[target];
                var show = nextProps.show,
                    items = nextProps[target];

                if (items !== prevItems || show !== prevShow) {
                    this.setState({
                        timebarItems: generator(items, show),
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
                    _props2$children = _props2.children,
                    originalChildren = _props2$children === undefined ? [] : _props2$children,
                    componentProps = _objectWithoutProperties(_props2, ['timebar', 'children']);

                var _state = this.state,
                    timebarItems = _state.timebarItems,
                    show = _state.show;


                var TimebarElement = _react2.default.createElement(_components2.default, _extends({
                    ref: function ref(_ref) {
                        _this3.timebarNode = _ref;
                    },
                    onRangeChange: this.handleRangeChange
                }, timebarProps, {
                    items: timebarItems }));

                return _react2.default.createElement(
                    Component,
                    _extends({}, componentProps, {
                        show: show }),
                    [TimebarElement].concat(_toConsumableArray(originalChildren))
                );
            }
        }]);

        return _class;
    }(_react2.default.Component), _class.propTypes = propTypes, _class.defaultProps = {
        showStatic: false
    }, _initialiseProps = function _initialiseProps() {
        var _this4 = this;

        this.updateItemsToShowWithRange = function (curShow, timeRange) {
            var _props3 = _this4.props,
                items = _props3.items,
                showStatic = _props3.showStatic;
            var _state2 = _this4.state,
                prevShow = _state2.show,
                timebarItems = _state2.timebarItems;


            var newShow = showGenerator(items, timebarItems, curShow, timeRange, _this4.timebarNode.timebar, showStatic);

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
                    show: newShow
                });
            }
        };

        this.handleRangeChange = function (timeRange) {
            var show = _this4.props.show;

            _this4.updateItemsToShowWithRange(show, timeRange);
        };
    }, _temp;
}

exports.default = withTimebar;