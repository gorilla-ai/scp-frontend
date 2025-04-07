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

var _underscore = require('underscore.string');

var _underscore2 = _interopRequireDefault(_underscore);

var _propTypes3 = require('../consts/prop-types');

var _popover = require('./popover');

var _popover2 = _interopRequireDefault(_popover);

var _inputHelper = require('../utils/input-helper');

var _inputHelper2 = _interopRequireDefault(_inputHelper);

var _propWire = require('../hoc/prop-wire');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/input');

/**
 * A React (text) Input. Note this is wrapper around react builtin input element, major differences are:
 *
 * * Provides validation tooltip (optional)
 * * Only fire onChange event when the field has lost focus
 *
 * @constructor
 * @param {string} [id] - Input element #id
 * @param {string} [name] - Input element name
 * @param {'text'|'number'|'integer'} [type='text'] - Input type, default to 'text', if type='number' or 'integer' will trigger validation
 * @param {function} [formatter] - Input value display formatter
 * @param {string} formatter.value - currently entered input
 * @param {object} [validate] - Validation config
 * @param {number} validate.min - minimum value when type='number' or 'integer'
 * @param {number} validate.max - maximum value when type='number' or 'integer'
 * @param {RegExp|string} validate.pattern - RegExp string to test against when type='text'
 * @param {string} validate.patternReadable - Readable pattern string
 * @param {fuction} [validate.t] - Transform/translate error into readable message.<br>
 * If not specified, error message will be `${value} ${code}`<br>
 * For example see [i18next]{@link http://i18next.com/translate/} translator for generating error message.<br>
 * @param {'missing'|'no-match'|'not-int'|'not-num'|'out-of-bound'} validate.t.code - Error code
 * @param {object} validate.t.params - Parameters relevant to the error code
 * @param {string} validate.t.params.field - offending field name/id
 * @param {string} validate.t.params.value - offending field value
 * @param {RegExp|string} [validate.t.params.pattern] - pattern the value was supposed to follow
 * @param {number} [validate.t.params.min] - configured minimum value
 * @param {number} [validate.t.params.max] - configured maximum value
 * @param {string} [className] - Classname for the input
 * @param {string|number} [defaultValue] - Default value
 * @param {string|number} [value] - Current value
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean} [required=false] - Is this field mandatory? If true will trigger validation.
 * @param {boolean} [disabled=false] - Is this field disabled?
 * @param {boolean} [readOnly=false] - Is this field readonly?
 * @param {string} [maxLength] - Maximum input length
 * @param {string} [placeholder] - Placeholder for input
 * @param {function} [onChange] - Callback function when value is changed. <br> Required when value prop is supplied
 * @param {string|number} onChange.value - updated value
 * @param {object} onChange.eventInfo - event related info
 * @param {string|number} onChange.eventInfo.before - previous value
 * @param {boolean} onChange.eventInfo.isComplete - was it triggered by pressing enter key?
 *
 * @example
// controlled

import {Input} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            name:'',
            age:'',
            email:''
        }
    },
    handleChange(field,value) {
        this.setState({[field]:value})
    },
    render() {
        let {name, age, email} = this.state;
        return <div className='c-form'>
            <div>
                <label htmlFor='name'>Name</label>
                <Input id='name'
                    onChange={this.handleChange.bind(this,'name')}
                    value={name}
                    required={true}
                    placeholder='Your name'/>
            </div>
            <div>
                <label htmlFor='age'>Age</label>
                <Input id='age'
                    type='number'
                    validate={{
                        max:100,
                        t:(code, {value})=>`Age ${value} is invalid`
                    }}
                    className='my-age'
                    onChange={this.handleChange.bind(this,'age')}
                    value={age}
                    placeholder='Your age'/>
            </div>
            <div>
                <label htmlFor='email'>Email</label>
                <Input id='email'
                    validate={{
                        pattern:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        patternReadable:'xxx@xxx.xxx',
                        t:(code, {value,pattern})=>{
                            if (code==='missing') {
                                return 'You didn\'t enter an email address'
                            }
                            else { // assume pattern issue
                                return `You didn't provide a valid email, the correct format should be ${pattern}`
                            }
                        }
                    }}
                    onChange={this.handleChange.bind(this,'email')}
                    value={email}/>
            </div>
        </div>
    }
})
 */

var Input = function (_React$Component) {
    _inherits(Input, _React$Component);

    function Input(props, context) {
        _classCallCheck(this, Input);

        var _this = _possibleConstructorReturn(this, (Input.__proto__ || Object.getPrototypeOf(Input)).call(this, props, context));

        _initialiseProps.call(_this);

        var value = props.value;


        _this.state = {
            value: value,
            error: _this.validateInput(value)
        };
        return _this;
    }

    _createClass(Input, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var value = nextProps.value;

            this.setState({
                value: value,
                error: this.validateInput(value, nextProps)
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _popover2.default.close();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                className = _props.className,
                id = _props.id,
                name = _props.name,
                type = _props.type,
                disabled = _props.disabled,
                readOnly = _props.readOnly,
                placeholder = _props.placeholder,
                maxLength = _props.maxLength;
            var _state = this.state,
                value = _state.value,
                error = _state.error;


            var changeHandler = this.changeHandler;

            switch (type) {
                default:
                    return _react2.default.createElement('input', {
                        id: id,
                        name: name,
                        ref: function ref(_ref) {
                            _this2.input = _ref;
                        },
                        type: type === 'password' ? 'password' : 'text' /* {type}*/
                        /* min={min}
                        max={max}
                        step={step}
                        pattern={pattern}
                        required={required}*/
                        , readOnly: readOnly,
                        disabled: disabled,
                        maxLength: maxLength,
                        onChange: changeHandler,
                        onBlur: this.blurHandler,
                        onKeyUp: this.keyHandler,
                        placeholder: placeholder,
                        className: (0, _classnames2.default)(className, { invalid: error }),
                        value: value });
            }
        }
    }]);

    return Input;
}(_react2.default.Component);

Input.propTypes = {
    id: _propTypes2.default.string,
    name: _propTypes2.default.string,
    type: _propTypes2.default.oneOf(['text', 'number', 'integer', 'password']),
    formatter: _propTypes2.default.func,
    validate: _propTypes2.default.shape({
        min: _propTypes2.default.number,
        max: _propTypes2.default.number,
        pattern: _propTypes2.default.oneOfType([_propTypes2.default.instanceOf(RegExp), _propTypes2.default.string]),
        patternReadable: _propTypes2.default.string,
        t: _propTypes2.default.func
    }),
    className: _propTypes2.default.string,
    value: _propTypes3.SIMPLE_VALUE_PROP,
    required: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    readOnly: _propTypes2.default.bool,
    maxLength: _propTypes2.default.number,
    placeholder: _propTypes3.SIMPLE_VALUE_PROP,
    onChange: _propTypes2.default.func
};
Input.defaultProps = {
    type: 'text',
    validate: {},
    required: false,
    disabled: false,
    readOnly: false
};

var _initialiseProps = function _initialiseProps() {
    var _this3 = this;

    this.changeHandler = function (evt) {
        var newVal = evt.target.value;
        var error = _this3.validateInput(newVal);
        _this3.nextTime = false;

        if (error) {
            evt.stopPropagation();
            evt.preventDefault();
            _popover2.default.open(evt, error);
            _this3.setState({ error: error, value: newVal });
        } else {
            _popover2.default.close();
            _this3.setState({ value: newVal, error: false });
        }
    };

    this.keyHandler = function (evt) {
        if (evt.keyCode === 13) {
            _this3.blurHandler(evt, { isComplete: true });
        }
    };

    this.blurHandler = function (evt) {
        var info = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var oldVal = _this3.props.value;
        var _state2 = _this3.state,
            error = _state2.error,
            newVal = _state2.value;


        if (error) {
            if (!_this3.nextTime) {
                _this3.nextTime = true;
                _this3.setState({ value: oldVal });
                _this3.input.focus();
            } else {
                _this3.nextTime = false;
                _popover2.default.close();
                _this3.setState({ error: _this3.validateInput(evt.target.value) !== null });
            }
        } else {
            if (oldVal !== newVal) {
                var _props2 = _this3.props,
                    formatter = _props2.formatter,
                    onChange = _props2.onChange;


                if (newVal != null && !_underscore2.default.isBlank(newVal) && formatter && _lodash2.default.isFunction(formatter)) {
                    newVal = formatter(newVal);
                }

                onChange(newVal, info);
            }
        }
    };

    this.validateInput = function (value, props) {
        var _ref2 = props || _this3.props,
            name = _ref2.name,
            id = _ref2.id,
            type = _ref2.type,
            required = _ref2.required,
            _ref2$validate = _ref2.validate,
            t = _ref2$validate.t,
            params = _objectWithoutProperties(_ref2$validate, ['t']);

        var msg = _inputHelper2.default.validateField(value, _extends({ name: name || id, type: type, required: required }, params), t ? { et: t } : true);

        if (msg) {
            return _react2.default.createElement(
                'span',
                null,
                msg
            );
        }
        return null;
    };
};

exports.default = (0, _propWire.wireValue)(Input);