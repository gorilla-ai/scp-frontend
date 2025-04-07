'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.wireSet = wireSet;
exports.wire = wire;
exports.wireValue = wireValue;
exports.wireChecked = wireChecked;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _objectPathImmutable = require('object-path-immutable');

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/hoc/prop-wire');

function wireSet(Component, propsCfg) {
    propsCfg = _lodash2.default.mapValues(propsCfg, function (cfg, propName) {
        var _cfg$name = cfg.name,
            name = _cfg$name === undefined ? propName : _cfg$name,
            linkName = cfg.linkName,
            defaultName = cfg.defaultName,
            changeHandlerName = cfg.changeHandlerName,
            defaultValue = cfg.defaultValue,
            _cfg$enforceHandler = cfg.enforceHandler,
            enforceHandler = _cfg$enforceHandler === undefined ? true : _cfg$enforceHandler;

        return {
            name: name,
            linkName: linkName || propName + 'Link',
            defaultName: defaultName || 'default' + _lodash2.default.capitalize(propName),
            changeHandlerName: changeHandlerName || 'on' + _lodash2.default.capitalize(propName) + 'Change',
            defaultValue: _lodash2.default.has(cfg, 'defaultValue') ? defaultValue : '',
            enforceHandler: enforceHandler
        };
    });

    return function (_React$Component) {
        _inherits(_class2, _React$Component);

        function _class2() {
            var _ref;

            var _temp, _this, _ret;

            _classCallCheck(this, _class2);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = _lodash2.default.mapValues(propsCfg, function (_ref2) {
                var name = _ref2.name,
                    linkName = _ref2.linkName,
                    defaultName = _ref2.defaultName,
                    masterDefaultValue = _ref2.defaultValue;

                var val = _lodash2.default.get(_this.props, name);
                var valueLink = _lodash2.default.get(_this.props, linkName);
                var defaultValue = _lodash2.default.get(_this.props, defaultName);

                if (val == null && valueLink) {
                    val = valueLink.value;
                }
                if (val == null) {
                    val = defaultValue;
                }

                if (val == null) {
                    if (_lodash2.default.isFunction(masterDefaultValue)) {
                        val = masterDefaultValue(_this.props);
                    } else {
                        val = masterDefaultValue;
                    }
                }

                return val;
            }), _this.handleChange = function (propName, newVal, eventInfo) {
                var _propsCfg$propName = propsCfg[propName],
                    name = _propsCfg$propName.name,
                    linkName = _propsCfg$propName.linkName,
                    changeHandlerName = _propsCfg$propName.changeHandlerName,
                    enforceHandler = _propsCfg$propName.enforceHandler;

                var isControlled = _lodash2.default.has(_this.props, name);
                var valueLink = _lodash2.default.get(_this.props, linkName);
                var handler = _lodash2.default.get(_this.props, changeHandlerName);

                var eventData = _extends({
                    before: _this.state[propName]
                }, eventInfo);

                if (isControlled && handler) {
                    handler(newVal, eventData);
                } else if (isControlled && !handler && enforceHandler) {
                    log.error('handleChange::' + Component.displayName + '::' + propName + '. Controlled component without a \'' + JSON.stringify(changeHandlerName) + '\' event prop');
                } else if (valueLink) {
                    valueLink.requestChange(newVal, eventData);
                } else {
                    _this.setState(_defineProperty({}, propName, newVal), function () {
                        if (handler) {
                            handler(_this.state[propName], eventData);
                        }
                    });
                }
            }, _temp), _possibleConstructorReturn(_this, _ret);
        }

        _createClass(_class2, [{
            key: 'componentWillReceiveProps',
            value: function componentWillReceiveProps(nextProps) {
                var _this2 = this;

                var nextState = _lodash2.default.mapValues(propsCfg, function (_ref3, propName) {
                    var name = _ref3.name,
                        linkName = _ref3.linkName,
                        defaultName = _ref3.defaultName,
                        masterDefaultValue = _ref3.defaultValue;

                    var isControlled = _lodash2.default.has(nextProps, name);

                    var val = _lodash2.default.get(nextProps, name);
                    var valueLink = _lodash2.default.get(nextProps, linkName);
                    var defaultValue = _lodash2.default.get(nextProps, defaultName);

                    var curVal = _this2.state[propName];


                    if (val == null && valueLink) {
                        val = valueLink.value;
                    }

                    if (val == null) {
                        if (isControlled) {
                            val = defaultValue;

                            if (val == null) {
                                if (_lodash2.default.isFunction(masterDefaultValue)) {
                                    val = masterDefaultValue(nextProps);
                                } else {
                                    val = masterDefaultValue;
                                }
                            }
                        } else {
                            val = curVal;
                        }
                    }

                    return val;
                });

                this.setState(nextState);
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                var propsToIgnore = _lodash2.default.reduce(propsCfg, function (acc, _ref4) {
                    var name = _ref4.name,
                        linkName = _ref4.linkName,
                        defaultName = _ref4.defaultName,
                        changeHandlerName = _ref4.changeHandlerName;

                    return [].concat(_toConsumableArray(acc), [name, linkName, defaultName, changeHandlerName]);
                }, []);

                var baseProps = _lodash2.default.omit(this.props, propsToIgnore);

                var newProps = _lodash2.default.reduce(propsCfg, function (acc, _ref5, propName) {
                    var name = _ref5.name,
                        changeHandlerName = _ref5.changeHandlerName;

                    return (0, _objectPathImmutable2.default)(acc).set(name, _this3.state[propName]).set(changeHandlerName, _this3.handleChange.bind(_this3, propName)).value();
                }, baseProps);

                return _react2.default.createElement(Component, _extends({}, newProps, {
                    ref: function ref(_ref6) {
                        _this3._component = _ref6;
                    }
                }));
            }
        }]);

        return _class2;
    }(_react2.default.Component);
}

function wire(Component, propName) {
    var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var changeHandlerName = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'onChange';

    return wireSet(Component, _defineProperty({}, propName, {
        defaultValue: defaultValue,
        changeHandlerName: changeHandlerName
    }));
}

function wireValue(Component) {
    return wire(Component, 'value');
}

function wireChecked(Component) {
    return wire(Component, 'checked', false);
}

exports.default = {
    wireValue: wireValue,
    wireChecked: wireChecked,
    wire: wire
};