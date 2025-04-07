'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.withPaginate = withPaginate;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes2 = require('prop-types');

var _propTypes3 = _interopRequireDefault(_propTypes2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pageNav = require('../components/page-nav');

var _pageNav2 = _interopRequireDefault(_pageNav);

var _propWire = require('./prop-wire');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var log = require('loglevel').getLogger('react-ui/hoc/paginator');

function withPaginate(Component) {
    var _propTypes, _class, _temp;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$target = options.target,
        target = _options$target === undefined ? 'data' : _options$target;


    var propTypes = (_propTypes = {}, _defineProperty(_propTypes, target, _propTypes3.default.array), _defineProperty(_propTypes, 'paginate', _propTypes3.default.shape({
        wrapperClassName: _propTypes3.default.string,
        pageSize: _propTypes3.default.number,
        pages: _propTypes3.default.number,
        current: _propTypes3.default.number,
        thumbnails: _propTypes3.default.number,
        className: _propTypes3.default.string,
        onChange: _propTypes3.default.func
    })), _propTypes);

    return (0, _propWire.wireSet)((_temp = _class = function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        _createClass(_class, [{
            key: 'render',
            value: function render() {
                var _this2 = this;

                var _props = this.props,
                    paginate = _props.paginate,
                    data = _props[target];

                var _paginate$enabled = paginate.enabled,
                    enablePagination = _paginate$enabled === undefined ? true : _paginate$enabled,
                    _paginate$pageSize = paginate.pageSize,
                    pageSize = _paginate$pageSize === undefined ? 30 : _paginate$pageSize,
                    wrapperClassName = paginate.wrapperClassName,
                    pageNavProps = _objectWithoutProperties(paginate, ['enabled', 'pageSize', 'wrapperClassName']);

                if (enablePagination === false) {
                    return _react2.default.createElement(Component, _extends({}, _lodash2.default.omit(this.props, 'paginate'), {
                        ref: function ref(_ref) {
                            _this2._component = _ref;
                        } }));
                }

                var pages = paginate.pages;

                var propsToPass = _lodash2.default.omit(this.props, ['paginate']);
                if (!pages) {
                    var current = pageNavProps.current;

                    var total = data.length;
                    pages = Math.ceil(total / pageSize);
                    propsToPass[target] = _lodash2.default.slice(data, (current - 1) * pageSize, current * pageSize);
                }

                return _react2.default.createElement(
                    'div',
                    { className: wrapperClassName },
                    _react2.default.createElement(Component, _extends({}, propsToPass, {
                        ref: function ref(_ref2) {
                            _this2._component = _ref2;
                        } })),
                    pages > 1 && _react2.default.createElement(_pageNav2.default, _extends({
                        className: 'c-flex jcc c-margin',
                        pages: pages
                    }, pageNavProps))
                );
            }
        }]);

        return _class;
    }(_react2.default.Component), _class.propTypes = propTypes, _class.defaultProps = {
        paginate: {}
    }, _temp), {
        paginate: {
            name: 'paginate.current',
            defaultName: 'paginate.defaultCurrent',
            defaultValue: 1,
            changeHandlerName: 'paginate.onChange'
        }
    });
}

exports.default = withPaginate;