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

var _popover = require('./popover');

var _popover2 = _interopRequireDefault(_popover);

var _inputHelper = require('../utils/input-helper');

var _inputHelper2 = _interopRequireDefault(_inputHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/file-input');

/**
 * A React file input
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [name] - FileInput element name
 * @param {string} [className] - Classname for the container
 * @param {string} [btnText='Choose file'] - Text on the button
 * @param {string} [placeholder] - Placeholder for the text field
 * @param {boolean} [required=false] - Is this field mandatory?
 * @param {boolean} [disabled=false] - Is file input disabled?
 * @param {boolean} [enableClear=true] - Can this field can be cleared?
 * @param {object} [validate] - Validation config
 * @param {number} [validate.max] - Maximum file size which unit is 'MB'
 * @param {string | Array.<string>} [validate.extension] - Accepted file format, e.g., '.mp3'; ['.jpg', '.png']
 * @param {fuction} [validate.t] - Transform/translate error into readable message.<br>
 * If not specified, error message will be `${validate.t.params.name} ${code}`<br>
 * For example see [i18next]{@link http://i18next.com/translate/} translator for generating error message.<br>
 * @param {'missing'|'file-too-large'|'file-wrong-format'} validate.t.code - Error code
 * @param {object} validate.t.params - Parameters relevant to the error code
 * @param {string} validate.t.params.field - offending field name/id
 * @param {object} validate.t.params.value - offending file object
 * @param {number} [validate.t.params.max] - configured maximum file size which unit is MB
 * @param {string} [validate.t.params.extension] - configured accepted file extension
 * @param {function} [onChange] - Callback function when file is changed
 * @param {object} onChange.file - updated file
 * @param {object} onChange.eventInfo - event related info
 * @param {object} onChange.eventInfo.before - previous file
 *
 *
 * @example
// controlled

import {FileInput} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            name: '',
            type: '',
            size: 0
        }
    },
    handleChange(file) {
        this.setState({
            name: file ? file.name : '',
            type: file ? file.type : '',
            size: file ? file.size : 0
        })
    },
    render() {
        return <div className='c-flex aic'>
            <FileInput
                onChange={this.handleChange} required={true} name='fileDemo'
                validate={{
                    max: 10,
                    extension: ['.mp3', '.wma'],
                    t: (code, params) => {
                        if (code === 'file-too-large') {
                            return `File size should be lower than ${params.max} MB`
                        }
                        else {
                            return `File format should be ${params.extension}`
                        }
                    }
                }}
            />
        </div>
    }
})
 */

var FileInput = function (_React$Component) {
    _inherits(FileInput, _React$Component);

    function FileInput() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, FileInput);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = FileInput.__proto__ || Object.getPrototypeOf(FileInput)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            file: null,
            isInvalid: false
        }, _this.handleChange = function (e) {
            var fileInput = _this.fileInput,
                fileSub = _this.fileSub;

            var _this$props = _this.props,
                validate = _this$props.validate,
                onChange = _this$props.onChange;


            if (fileInput.files.length > 0) {
                var file = fileInput.files[0];
                var error = validate ? _this.validateFile(file) : null;

                if (error) {
                    _this.fileInput.value = '';
                    _this.fileSub.value = '';

                    _popover2.default.open(e, error, { pointy: true });

                    _this.setState({
                        isInvalid: true
                    });
                } else {
                    _popover2.default.close();
                    fileSub.value = file.name;

                    if (onChange) {
                        onChange(file);
                    }

                    _this.setState({
                        file: file,
                        isInvalid: false
                    });
                }
            }
        }, _this.handleBlur = function () {
            _popover2.default.close();
            _this.setState({ isInvalid: false });
        }, _this.handleClick = function () {
            _popover2.default.close();

            var onChange = _this.props.onChange;


            _this.fileInput.value = '';
            _this.fileSub.value = '';

            if (onChange) {
                onChange(null);
            }

            _this.setState({
                file: null,
                isInvalid: false
            });
        }, _this.validateFile = function (file) {
            var _this$props2 = _this.props,
                id = _this$props2.id,
                name = _this$props2.name,
                required = _this$props2.required,
                _this$props2$validate = _this$props2.validate,
                t = _this$props2$validate.t,
                params = _objectWithoutProperties(_this$props2$validate, ['t']);

            var msg = _inputHelper2.default.validateField(file, _extends({ name: name || id, type: 'file', required: required }, params), t ? { et: t } : true);

            if (msg) {
                return _react2.default.createElement(
                    'span',
                    null,
                    msg
                );
            }
            return null;
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(FileInput, [{
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _popover2.default.close();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                name = _props.name,
                className = _props.className,
                placeholder = _props.placeholder,
                btnText = _props.btnText,
                disabled = _props.disabled,
                enableClear = _props.enableClear,
                required = _props.required,
                validate = _props.validate;
            var _state = this.state,
                file = _state.file,
                isInvalid = _state.isInvalid;

            var hasFile = !!file;
            var extension = validate && validate.extension ? validate.extension : '';

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-file-input', { disabled: disabled, clearable: enableClear }, className) },
                _react2.default.createElement('input', {
                    type: 'file', name: name, ref: function ref(_ref2) {
                        _this2.fileInput = _ref2;
                    }, accept: extension,
                    onChange: this.handleChange,
                    onBlur: this.handleBlur,
                    disabled: disabled,
                    required: required }),
                _react2.default.createElement(
                    'button',
                    { disabled: disabled },
                    btnText
                ),
                _react2.default.createElement('input', {
                    type: 'text',
                    ref: function ref(_ref3) {
                        _this2.fileSub = _ref3;
                    },
                    className: (0, _classnames2.default)({ invalid: isInvalid }),
                    placeholder: placeholder,
                    disabled: disabled,
                    readOnly: true }),
                enableClear && hasFile && _react2.default.createElement('i', { className: (0, _classnames2.default)('c-link inline fg fg-close'), onClick: this.handleClick })
            );
        }
    }]);

    return FileInput;
}(_react2.default.Component);

FileInput.propTypes = {
    id: _propTypes2.default.string,
    name: _propTypes2.default.string,
    className: _propTypes2.default.string,
    btnText: _propTypes2.default.string,
    placeholder: _propTypes2.default.string,
    required: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    enableClear: _propTypes2.default.bool,
    validate: _propTypes2.default.shape({
        max: _propTypes2.default.number,
        extension: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.arrayOf(_propTypes2.default.string)]),
        t: _propTypes2.default.func
    }),
    onChange: _propTypes2.default.func
};
FileInput.defaultProps = {
    btnText: 'Choose file',
    disabled: false,
    enableClear: true,
    required: false,
    validate: {}
};
exports.default = FileInput;