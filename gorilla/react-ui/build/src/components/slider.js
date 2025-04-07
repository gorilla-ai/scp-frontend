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

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _propWire = require('../hoc/prop-wire');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('core/components/slider');

var isIncrease = true;

/**
 * A React toggle button
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {boolean} [disabled=false] - Is slider disabled?
 * @param {function} onChange - Callback function when slider value is updated
 * @param {function} [onPlus] - Function for clicking plus icon
 * @param {function} [onMinus] - Function for clicking minus icon
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {number} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {number} [max=1] - The slider max value
 * @param {number} [min=0] - The slider min value
 * @param {number} [step=0.01] - Legal number intervals for the input
 * @param {number} [value=0.5] - Current slider value
 * @param {boolean} [showProgress=false] - Show the slider's progress?
 *
 * @example
// controlled

import Slider from 'core/components/slider'
React.createClass({
    getInitialState() {
        return {value:40}
    },
    handleChange(e) {
        let value = e
        this.setState({value})
    },
    render() {
        let {value} = this.state
        return <Slider value={value} onChange={this.handleChange} showProgress={true} min={0} max={100} step={5} />
    }
})
 */

var Slider = function (_React$Component) {
    _inherits(Slider, _React$Component);

    function Slider() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Slider);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Slider.__proto__ || Object.getPrototypeOf(Slider)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            width: 0
        }, _this.handleChange = function (e) {
            var val = parseFloat(e.target.value);
            var onChange = _this.props.onChange;

            onChange(val);
        }, _this.handleClick = function (isPlus) {
            var _this$props = _this.props,
                disabled = _this$props.disabled,
                max = _this$props.max,
                min = _this$props.min,
                step = _this$props.step,
                value = _this$props.value,
                onChange = _this$props.onChange;


            if (disabled) {
                return;
            }

            // Fix the decimal of value as the step's
            var numArr = step.toString().split('.');
            var decimal = 0;

            if (numArr.length === 2) {
                decimal = numArr[1].length;
            }

            var tmp = isPlus ? (value + step).toFixed(decimal) : (value - step).toFixed(decimal);
            if (isPlus) {
                value = parseFloat(tmp) > max ? max : parseFloat(tmp);
            } else {
                value = parseFloat(tmp) < min ? min : parseFloat(tmp);
            }

            onChange(value);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Slider, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var showProgress = this.props.showProgress;

            var width = (0, _jquery2.default)(this.input).width();

            if (showProgress) {
                this.setState({
                    width: width
                });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                disabled = _props.disabled,
                max = _props.max,
                min = _props.min,
                step = _props.step,
                value = _props.value,
                showProgress = _props.showProgress,
                onPlus = _props.onPlus,
                onMinus = _props.onMinus;
            var width = this.state.width;

            var prgs = (value - min) / (max - min) * width;
            var prgsBar = showProgress ? _react2.default.createElement('div', { className: 'progress', style: { width: prgs + 'px' }, 'data-tooltip': value }) : '';

            return _react2.default.createElement(
                'div',
                { className: (0, _classnames2.default)('c-flex', 'aic', 'c-slider', className) },
                _react2.default.createElement(
                    'div',
                    { className: 'c-flex aic' },
                    _react2.default.createElement('input', {
                        type: 'range',
                        id: id,
                        ref: function ref(_ref2) {
                            _this2.input = _ref2;
                        },
                        disabled: disabled,
                        max: max,
                        min: min,
                        step: step,
                        value: value,
                        onChange: disabled ? null : this.handleChange }),
                    prgsBar
                )
            );
        }
    }]);

    return Slider;
}(_react2.default.Component);

Slider.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    disabled: _propTypes2.default.bool,
    max: _propTypes2.default.number,
    min: _propTypes2.default.number,
    step: _propTypes2.default.number,
    value: _propTypes2.default.number,
    showProgress: _propTypes2.default.bool,
    onChange: _propTypes2.default.func,
    onMinus: _propTypes2.default.func,
    onPlus: _propTypes2.default.func
};
Slider.defaultProps = {
    disabled: false,
    max: 1,
    min: 0,
    step: 0.01,
    value: 0.5
};
exports.default = (0, _propWire.wireValue)(Slider);