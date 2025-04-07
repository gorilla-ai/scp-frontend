'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _propWire = require('../hoc/prop-wire');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A React Textarea
 * @constructor
 * @param {string} [id] - Textarea #id
 * @param {string} [name] - Textarea name
 * @param {string} [className] - Classname for the textarea
 * @param {string|number} [placeholder] - Placeholder for textarea
 * @param {number} [rows] - Visible number of lines in a textarea
 * @param {number} [cols] - Visible width of a textarea
 * @param {boolean} [readOnly=false] - Is this field readonly?
 * @param {boolean} [disabled=false] - Is this field disabled?
 * @param {number} [maxLength] - The maximum number of characters allowed in the textarea
 * @param {string|number} [value] - Current value
 * @param {boolean} [required=false] - Is this field mandatory?
 * @param {function} [onChange] - Callback function when value is changed. <br> Required when value prop is supplied
 *
 * @example
import {Textarea} from 'react-ui'

Examples.Textarea = React.createClass({
    getInitialState() {
        return {
            feedback: ''
        }
    },
    handleChange(field, value) {
        this.setState({[field]:value})
    },
    render() {
        const {feedback} = this.state
        return <div className='c-form inline'>
            <div>
                <label htmlFor='feedback'>Feedback</label>
                <Textarea
                    id='feedback'
                    onChange={this.handleChange.bind(this, 'feedback')}
                    value={feedback} />
            </div>
        </div>
    }
})
 */

var Textarea = function (_Component) {
    _inherits(Textarea, _Component);

    function Textarea(props) {
        _classCallCheck(this, Textarea);

        var _this = _possibleConstructorReturn(this, (Textarea.__proto__ || Object.getPrototypeOf(Textarea)).call(this, props));

        _this.handleChange = _this.handleChange.bind(_this);
        return _this;
    }

    _createClass(Textarea, [{
        key: 'handleChange',
        value: function handleChange(e) {
            this.props.onChange(e.target.value);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                name = _props.name,
                className = _props.className,
                placeholder = _props.placeholder,
                rows = _props.rows,
                cols = _props.cols,
                readOnly = _props.readOnly,
                disabled = _props.disabled,
                maxLength = _props.maxLength,
                required = _props.required,
                value = _props.value;


            return _react2.default.createElement('textarea', {
                id: id,
                name: name,
                className: className,
                placeholder: placeholder,
                rows: rows,
                cols: cols,
                readOnly: readOnly,
                disabled: disabled,
                maxLength: maxLength,
                value: value,
                required: required,
                onChange: this.handleChange });
        }
    }]);

    return Textarea;
}(_react.Component);

Textarea.propTypes = {
    id: _propTypes2.default.string,
    name: _propTypes2.default.string,
    className: _propTypes2.default.string,
    placeholder: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
    rows: _propTypes2.default.number,
    cols: _propTypes2.default.number,
    readOnly: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    maxLength: _propTypes2.default.number,
    value: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
    required: _propTypes2.default.bool,
    onChange: _propTypes2.default.func.isRequired
};

Textarea.defaultProps = {
    id: '',
    className: '',
    value: ''
};

exports.default = (0, _propWire.wireValue)(Textarea);