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

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _objectPathImmutable = require('object-path-immutable');

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * modify from react-ui
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var log = require('loglevel').getLogger('core/components/form');

var BaseForm = function (_React$Component) {
    _inherits(BaseForm, _React$Component);

    function BaseForm() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, BaseForm);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = BaseForm.__proto__ || Object.getPrototypeOf(BaseForm)).call.apply(_ref, [this].concat(args))), _this), _this.handleChange = function (key, iValue) {
            var _this$props = _this.props,
                onChange = _this$props.onChange,
                value = _this$props.value;

            onChange(_objectPathImmutable2.default.set(value, key, iValue));
        }, _this.renderField = function (id, value, fieldCfg, dataSet) {
            var wholeValue = _this.props.value;
            var formatter = fieldCfg.formatter,
                editor = fieldCfg.editor,
                _fieldCfg$props = fieldCfg.props,
                props = _fieldCfg$props === undefined ? {} : _fieldCfg$props,
                onChange = fieldCfg.onChange,
                preProcess = fieldCfg.preProcess;


            if (formatter) {
                if (_lodash2.default.isFunction(formatter)) {
                    return formatter(value, dataSet);
                } else {
                    return formatter;
                }
            } else if (editor) {
                if (_lodash2.default.isFunction(props)) {
                    props = props(dataSet);
                }
                // TODO: check editor must be ReactClass
                props = _extends({}, props, { id: id,
                    value: preProcess ? preProcess(wholeValue) : value,
                    onChange: onChange ? function (value) {
                        onChange(value, wholeValue);
                    } : _this.handleChange.bind(_this, id)
                });

                return _react2.default.createElement(editor, props);
            } else {
                return value;
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(BaseForm, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                fields = _props.fields,
                value = _props.value,
                header = _props.header,
                footer = _props.footer,
                className = _props.className,
                formClassName = _props.formClassName,
                fieldClassName = _props.fieldClassName;


            return _react2.default.createElement(
                'div',
                { id: id, className: className },
                header ? _react2.default.createElement(
                    'header',
                    null,
                    header
                ) : null,
                _react2.default.createElement(
                    'div',
                    { className: (0, _classnames2.default)(formClassName, 'content c-align') },
                    _lodash2.default.map(fields, function (field, key) {
                        var _field$label = field.label,
                            label = _field$label === undefined ? key : _field$label,
                            _field$className = field.className,
                            fieldCls = _field$className === undefined ? fieldClassName : _field$className;

                        var iValue = _lodash2.default.get(value, key, null); // to support traverse of nested field properties, eg a.b.c

                        return _react2.default.createElement(
                            'div',
                            { key: key, className: (0, _classnames2.default)(key, fieldCls) },
                            _react2.default.createElement(
                                'label',
                                { htmlFor: key },
                                label
                            ),
                            _this2.renderField(key, iValue, field, value)
                        );
                    })
                ),
                footer ? _react2.default.createElement(
                    'footer',
                    null,
                    footer
                ) : null
            );
        }
    }]);

    return BaseForm;
}(_react2.default.Component);

BaseForm.propTypes = {
    id: _propTypes2.default.string,
    fields: _propTypes2.default.objectOf(_propTypes2.default.shape({
        label: _propTypes2.default.node,
        className: _propTypes2.default.string,
        formatter: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.node]),
        editor: _propTypes2.default.func, // react class
        props: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.object])
    })).isRequired,
    header: _propTypes2.default.node,
    footer: _propTypes2.default.node,
    className: _propTypes2.default.string,
    formClassName: _propTypes2.default.string,
    fieldClassName: _propTypes2.default.string,
    value: _propTypes2.default.object, // might not be just a simple object
    onChange: _propTypes2.default.func
};
BaseForm.defaultProps = {
    value: {}
};
exports.default = BaseForm;