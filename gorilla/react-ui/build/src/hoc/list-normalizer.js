'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.normalize = normalize;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/hoc/list-normalizer');

function normalize(Component) {
    var listPropName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'list';

    var _class, _temp, _class$propTypes;

    var transformPropName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'listTransform';
    var fields = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ['value', 'text'];

    return _temp = _class = function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        _createClass(_class, [{
            key: 'render',
            value: function render() {
                var _this2 = this,
                    _extends3;

                var _props = this.props,
                    transform = _props[transformPropName],
                    listToTransform = _props[listPropName];

                if (!transform) {
                    return _react2.default.createElement(Component, _extends({}, this.props, {
                        ref: function ref(_ref) {
                            _this2._component = _ref;
                        }
                    }));
                }

                var transformCfg = _extends({}, _lodash2.default.reduce(fields, function (acc, field) {
                    return _extends({}, acc, _defineProperty({}, field, field));
                }, {}), transform);

                return _react2.default.createElement(Component, _extends({}, _lodash2.default.omit(this.props, transformPropName), (_extends3 = {}, _defineProperty(_extends3, listPropName, _lodash2.default.map(listToTransform, function (item) {
                    return _lodash2.default.mapKeys(item, function (v, k) {
                        return _lodash2.default.get(_lodash2.default.invert(transformCfg), k);
                    });
                })), _defineProperty(_extends3, 'ref', function ref(_ref2) {
                    _this2._component = _ref2;
                }), _extends3)));
            }
        }]);

        return _class;
    }(_react2.default.Component), _class.propTypes = (_class$propTypes = {}, _defineProperty(_class$propTypes, transformPropName, _propTypes2.default.object), _defineProperty(_class$propTypes, listPropName, _propTypes2.default.array), _class$propTypes), _temp;
}

exports.default = normalize;