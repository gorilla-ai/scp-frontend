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

var _propTypes3 = require('../consts/prop-types');

var _propWire = require('../hoc/prop-wire');

var _listNormalizer = require('../hoc/list-normalizer');

var _listNormalizer2 = _interopRequireDefault(_listNormalizer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/button-group');

/**
 * A React Button Group
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {Array.<object>} list - List of options
 * @param {string | number} list.value - item value
 * @param {string} list.text - item display text
 * @param {string} list.className - classname for item button
 * @param {string} [className] - Classname for the container
 * @param {string|number|Array.<string|number>} [defaultValue] - Default selected value (array if multi=true)
 * @param {string|number|Array.<string|number>} [value] - Current selected value (array if multi=true)
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean|Array.<string|number>} [disabled=false] - Is selection disabled?
 * @param {boolean} [multi=false] - Allow multi-selection?
 * @param {function} [onChange] - Callback function when value is selected. <br> Required when value prop is supplied
 * @param {string|number|Array.<string|number>} onChange.value - selected value (array if multi=true)
 * @param {object} onChange.eventInfo - event related info
 * @param {string|number|Array.<string|number>} onChange.eventInfo.before - previously selected value (array if multi=true)
 *
 * @example
// controlled

import {ButtonGroup} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            type: 'movie',
            types: ['tv']
        }
    },
    handleChange(name, val) {
        this.setState({[name]:val})
    },
    render() {
        const {type, types} = this.state
        return <div className='c-form'>
            <div>
                <label>Select a type</label>
                <ButtonGroup
                    id='type'
                    className='column'
                    list={[
                        {value:'movie', text:'Movie'},
                        {value:'tv', text:'TV'},
                        {value:'actors', text:'Actors'}
                    ]}
                    onChange={this.handleChange.bind(this,'type')}
                    value={type} />
            </div>
            <div>
                <label>Select multiple types (movie disabled)</label>
                <ButtonGroup
                    id='types'
                    className='column'
                    list={[
                        {value:'movie', text:'Movie'},
                        {value:'tv', text:'TV'},
                        {value:'actors', text:'Actors'}
                    ]}
                    multi
                    disabled={['movie']}
                    onChange={this.handleChange.bind(this,'types')}
                    value={types} />
            </div>
        </div>
    }
})
 */

var ButtonGroup = function (_React$Component) {
    _inherits(ButtonGroup, _React$Component);

    function ButtonGroup() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ButtonGroup);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ButtonGroup.__proto__ || Object.getPrototypeOf(ButtonGroup)).call.apply(_ref, [this].concat(args))), _this), _this.handleSelect = function (newVal) {
            var _this$props = _this.props,
                onChange = _this$props.onChange,
                multi = _this$props.multi,
                value = _this$props.value;

            onChange(multi ? _lodash2.default.includes(value, newVal) ? _lodash2.default.without(value, newVal) : [].concat(_toConsumableArray(value), [newVal]) : newVal);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ButtonGroup, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                list = _props.list,
                value = _props.value,
                disabled = _props.disabled,
                multi = _props.multi,
                className = _props.className;


            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-button-group', className) },
                _lodash2.default.map(list, function (_ref2) {
                    var itemValue = _ref2.value,
                        itemText = _ref2.text,
                        itemClassName = _ref2.className;

                    var selected = multi ? _lodash2.default.includes(value, itemValue) : value === itemValue;
                    var isDisabled = _lodash2.default.isBoolean(disabled) && disabled || _lodash2.default.isArray(disabled) && _lodash2.default.includes(disabled, itemValue);
                    return _react2.default.createElement(
                        'button',
                        {
                            key: itemValue,
                            className: (0, _classnames2.default)('thumb', { selected: selected }, itemClassName),
                            onClick: _this2.handleSelect.bind(_this2, itemValue),
                            disabled: isDisabled },
                        itemText
                    );
                })
            );
        }
    }]);

    return ButtonGroup;
}(_react2.default.Component);

ButtonGroup.propTypes = {
    id: _propTypes2.default.string,
    list: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        value: _propTypes3.SIMPLE_VALUE_PROP,
        text: _propTypes2.default.node,
        className: _propTypes2.default.string
    })),
    className: _propTypes2.default.string,
    value: _propTypes2.default.oneOfType([_propTypes3.SIMPLE_VALUE_PROP, _propTypes3.SIMPLE_ARRAY_PROP]),
    disabled: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes3.SIMPLE_ARRAY_PROP]),
    multi: _propTypes2.default.bool,
    onChange: _propTypes2.default.func
};
ButtonGroup.defaultProps = {
    disabled: false,
    multi: false
};
exports.default = (0, _propWire.wire)((0, _listNormalizer2.default)(ButtonGroup), 'value', function (_ref3) {
    var multi = _ref3.multi;
    return multi ? [] : '';
});