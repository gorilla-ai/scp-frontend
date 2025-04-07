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

var log = require('loglevel').getLogger('react-ui/components/toggle-button');

/**
 * A React toggle button
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {boolean} [defaultOn] - Default on value
 * @param {boolean} [on=false] - Current on value
 * @param {object} [onLink] - Link to update check value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} onLink.value - value to update
 * @param {function} onLink.requestChange - function to request check value change
 * @param {boolean} [disabled=false] - Is toggle button disabled?
 * @param {function} onChange  - Callback function when toggle on/off. <br> Required when value prop is supplied
 * @param {boolean} onChange.on - on?
 * @param {object} onChange.eventInfo - event related info
 * @param {boolean} onChange.eventInfo.before - was on or off?
 * @param {string} [onText] - Text shown in toggle when the toggle is turned on
 * @param {string} [offText] - Text shown in toggle when the toggle is turned off
 *
 * @example
// controlled

import {ToggleButton} from 'react-ui'
React.createClass({
    getInitialState() {
        return {subscribe:false}
    },
    handleChange(subscribe) {
        this.setState({subscribe})
    },
    render() {
        let {subscribe} = this.state
        return <div className='c-flex aic'>
            <label htmlFor='subscribe'>Would you like to subscribe to this newsletter?</label>
            <ToggleButton id='subscribe'
                onChange={this.handleChange}
                on={subscribe}/>
        </div>
    }
})
 */

var ToggleButton = function (_React$Component) {
    _inherits(ToggleButton, _React$Component);

    function ToggleButton() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ToggleButton);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ToggleButton.__proto__ || Object.getPrototypeOf(ToggleButton)).call.apply(_ref, [this].concat(args))), _this), _this.getLabelForToggle = function () {
            return (0, _jquery2.default)(_this.node).parent().find('label[for="' + _this.props.id + '"]');
        }, _this.handleChange = function () {
            var _this$props = _this.props,
                onChange = _this$props.onChange,
                on = _this$props.on;

            onChange(!on);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ToggleButton, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            if (this.props.id && !this.props.disabled) {
                this.getLabelForToggle().on('click', function () {
                    _this2.handleChange();
                });
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.getLabelForToggle().off();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                on = _props.on,
                disabled = _props.disabled,
                onText = _props.onText,
                offText = _props.offText;


            return _react2.default.createElement(
                'div',
                { id: id, ref: function ref(_ref2) {
                        _this3.node = _ref2;
                    }, className: (0, _classnames2.default)('c-toggle-btn', { disabled: disabled }, className) },
                _react2.default.createElement('input', {
                    type: 'checkbox',
                    onChange: disabled ? null : this.handleChange,
                    checked: on,
                    disabled: disabled }),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: id, className: 'on' },
                        onText
                    ),
                    _react2.default.createElement(
                        'label',
                        { htmlFor: id, className: 'off' },
                        offText
                    ),
                    _react2.default.createElement('span', null)
                )
            );
        }
    }]);

    return ToggleButton;
}(_react2.default.Component);

ToggleButton.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    on: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    onChange: _propTypes2.default.func,
    onText: _propTypes2.default.string,
    offText: _propTypes2.default.string
};
ToggleButton.defaultProps = {
    disabled: false,
    on: false
};
exports.default = (0, _propWire.wire)(ToggleButton, 'on', false);