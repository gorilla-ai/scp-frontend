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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactUi = require('react-ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('vbda/components/analysis/link');

var Link = function (_React$Component) {
    _inherits(Link, _React$Component);

    function Link() {
        _classCallCheck(this, Link);

        return _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).apply(this, arguments));
    }

    _createClass(Link, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                className = _props.className,
                data = _props.data;

            var tableData = (0, _lodash2.default)(data).map(function (_ref) {
                var ts = _ref.ts,
                    props = _ref.propsReadable;

                if (ts) {
                    return _extends({}, props);
                }
                return _lodash2.default.isEmpty(props) ? null : props;
            }).compact().value();

            //deduce fields from all possible data keys
            var tableFields = (0, _lodash2.default)(tableData).map(function (item) {
                return _lodash2.default.keys(item);
            }).flatten().uniq().reduce(function (acc, field) {
                return _extends({}, acc, _defineProperty({}, field, { label: field }));
            }, {});

            return _react2.default.createElement(
                'fieldset',
                { className: (0, _classnames2.default)(className, 'c-vbda-link') },
                _react2.default.createElement(
                    'legend',
                    null,
                    data.length > 0 ? _lodash2.default.first(data).typeReadable + ' (' + data.length + ')' : ''
                ),
                !_lodash2.default.isEmpty(tableFields) && _react2.default.createElement(_reactUi.Table, { fields: tableFields, data: tableData })
            );
        }
    }]);

    return Link;
}(_react2.default.Component);

Link.propTypes = {
    className: _propTypes2.default.string,
    data: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        ts: _propTypes2.default.string,
        type: _propTypes2.default.string,
        props: _propTypes2.default.object
    }))
};
Link.defaultProps = {
    data: []
};
exports.default = Link;