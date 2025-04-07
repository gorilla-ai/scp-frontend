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

var log = require('loglevel').getLogger('react-ui/components/checkbox');

/**
 * A React Checkbox
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {boolean} [defaultChecked] - Default checked value
 * @param {boolean} [checked] - Current checked value
 * @param {object} [checkedLink] - Link to update check value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} checkedLink.value - value to update
 * @param {function} checkedLink.requestChange - function to request check value change
 * @param {boolean} [disabled=false] - Is checkbox disabled?
 * @param {function} onChange  - Callback function when checkbox is ticked/unticked. <br> Required when value prop is supplied
 * @param {boolean} onChange.checked - checked?
 * @param {object} onChange.eventInfo - event related info
 * @param {boolean} onChange.eventInfo.before - was checked or unchecked?
 *
 * @example
// controlled

import {Checkbox} from 'react-ui'
React.createClass({
    getInitialState() {
        return {subscribe:false}
    },
    handleChange(subscribe) {
        this.setState({subscribe})
    },
    render() {
        const {subscribe} = this.state;
        return <div className='c-flex aic'>
            <label htmlFor='subscribe'>Would you like to subscribe to this newsletter?</label>
            <Checkbox id='subscribe'
                onChange={this.handleChange}
                checked={subscribe}/>
        </div>
    }
})
 */

var Checkbox = function (_React$Component) {
    _inherits(Checkbox, _React$Component);

    function Checkbox() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Checkbox);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Checkbox.__proto__ || Object.getPrototypeOf(Checkbox)).call.apply(_ref, [this].concat(args))), _this), _this.getLabelForCheckbox = function () {
            return (0, _jquery2.default)(_this.node).parent().find('label[for="' + _this.props.id + '"]');
        }, _this.handleChange = function (evt) {
            evt.stopPropagation();
            var _this$props = _this.props,
                onChange = _this$props.onChange,
                checked = _this$props.checked;

            onChange(!checked);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Checkbox, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            if (this.props.id && !this.props.disabled) {
                this.getLabelForCheckbox().on('click', function (evt) {
                    _this2.handleChange(evt);
                });
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.getLabelForCheckbox().off();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                checked = _props.checked,
                disabled = _props.disabled;

            return _react2.default.createElement('i', {
                id: id,
                ref: function ref(_ref2) {
                    _this3.node = _ref2;
                },
                onClick: disabled ? null : this.handleChange,
                className: (0, _classnames2.default)('c-checkbox', 'fg', checked ? 'fg-checkbox' : 'fg-checkbox-outline', { disabled: disabled }, className) });
        }
    }]);

    return Checkbox;
}(_react2.default.Component);

Checkbox.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    checked: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    onChange: _propTypes2.default.func
};
Checkbox.defaultProps = {
    disabled: false
};
exports.default = (0, _propWire.wireChecked)(Checkbox);