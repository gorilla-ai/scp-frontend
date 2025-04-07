'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SIMPLE_VALUE_PROP = _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]);

var log = require('loglevel').getLogger('core/components/input');

var TextArea = function (_React$Component) {
    _inherits(TextArea, _React$Component);

    function TextArea(props, context) {
        _classCallCheck(this, TextArea);

        var _this = _possibleConstructorReturn(this, (TextArea.__proto__ || Object.getPrototypeOf(TextArea)).call(this, props, context));

        _initialiseProps.call(_this);

        var value = props.value;


        _this.state = {
            value: _this.validateTextArea(value)
        };
        return _this;
    }

    _createClass(TextArea, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var value = nextProps.value;

            this.setState({
                value: this.validateTextArea(value)
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {}
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                className = _props.className,
                id = _props.id,
                type = _props.type,
                placeholder = _props.placeholder;
            var _state = this.state,
                value = _state.value,
                error = _state.error;


            var changeHandler = this.changeHandler;

            switch (type) {
                default:
                    return _react2.default.createElement('textarea', {
                        id: id,
                        ref: function ref(_ref) {
                            _this2.input = _ref;
                        },
                        onChange: changeHandler,
                        onBlur: this.blurHandler,
                        onKeyUp: this.keyHandler,
                        placeholder: placeholder,
                        className: (0, _classnames2.default)(className, { invalid: error }),
                        value: value });
            }
        }
    }]);

    return TextArea;
}(_react2.default.Component);

TextArea.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    value: SIMPLE_VALUE_PROP,
    placeholder: SIMPLE_VALUE_PROP,
    onChange: _propTypes2.default.func
};
TextArea.defaultProps = {};

var _initialiseProps = function _initialiseProps() {
    var _this3 = this;

    this.validateTextArea = function (value) {
        return value == null ? '' : value;
    };

    this.changeHandler = function (evt) {
        var newVal = evt.target.value;
        _this3.setState({ value: newVal });
    };

    this.keyHandler = function (evt) {
        if (evt.keyCode === 13) {
            _this3.blurHandler(evt);
        }
    };

    this.blurHandler = function (evt) {
        var oldVal = _this3.props.value;
        var newVal = _this3.state.value;


        if (oldVal !== newVal) {
            var onChange = _this3.props.onChange;

            console.log(newVal);
            onChange(newVal);
        }
    };
};

exports.default = TextArea;