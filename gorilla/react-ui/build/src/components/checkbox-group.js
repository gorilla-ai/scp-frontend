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

var _checkbox = require('./checkbox');

var _checkbox2 = _interopRequireDefault(_checkbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/checkbox-group');

/**
 * A React Checkbox Group
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {Array.<object>} list - List of items
 * @param {string | number} list.value - item value
 * @param {renderable} list.text - item display text
 * @param {string} list.className - item classname
 * @param {renderable} [list.children] - things to render after the label
 * @param {string} [className] - Classname for the container
 * @param {Array.<string|number>} [defaultValue] - Default checked values
 * @param {Array.<string|number>} [value] - Current checked values
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean|Array.<string|number>} [disabled=false] - true/false if disable all checkboxes, or array of values to disable specific checkboxes
 * @param {boolean} [toggleAll=false] - Show toggle all checkbox?
 * @param {string} [toggleAllText='All'] - Text shown in toggle all label
 * @param {function} [onChange] - Callback function when any of the checkboxes is ticked/unticked. <br> Required when value prop is supplied
 * @param {Array.<string|number>} onChange.values - current checked values
 * @param {object} onChange.eventInfo - event related info
 * @param {Array.<string|number>} onChange.eventInfo.before - previously checked values
 * @param {string|number} onChange.eventInfo.value - which value triggered change?
 * @param {boolean} onChange.eventInfo.checked - checked or unchecked?
 *
 * @example
// controlled

import {CheckboxGroup} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            movies:[1]
        }
    },
    handleChange(movies) {
        this.setState({movies})
    },
    render() {
        let {movies} = this.state;
        return <div>
            <label>Select movies</label>
            <CheckboxGroup
                list={[
                    {value:1,text:'1d - Finding Dory (selected by default, cannot deselect)'},
                    {value:2,text:'2 - Wizard of Oz'},
                    {value:3,text:'3 - Citizen Kane'}
                ]}
                onChange={this.handleChange}
                value={movies}
                disabled={[1]}/>
        </div>
    }
})
 */

var CheckboxGroup = function (_React$Component) {
    _inherits(CheckboxGroup, _React$Component);

    function CheckboxGroup() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, CheckboxGroup);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = CheckboxGroup.__proto__ || Object.getPrototypeOf(CheckboxGroup)).call.apply(_ref, [this].concat(args))), _this), _this.getDisabledItems = function () {
            var _this$props = _this.props,
                disabled = _this$props.disabled,
                list = _this$props.list;

            var disabledItems = [];
            if (_lodash2.default.isBoolean(disabled)) {
                if (disabled) {
                    disabledItems = _lodash2.default.map(list, 'value');
                } else {
                    disabledItems = [];
                }
            } else if (_lodash2.default.isArray(disabled)) {
                disabledItems = disabled;
            }
            return disabledItems;
        }, _this.getSelectableItems = function () {
            var list = _this.props.list;

            return _lodash2.default.without.apply(_lodash2.default, [_lodash2.default.map(list, 'value')].concat(_toConsumableArray(_this.getDisabledItems())));
        }, _this.handleChange = function (value, checked) {
            var _this$props2 = _this.props,
                curValue = _this$props2.value,
                onChange = _this$props2.onChange;

            var newValue = checked ? [].concat(_toConsumableArray(curValue), [value]) : _lodash2.default.without(curValue, value);
            onChange(newValue, { value: value, checked: checked });
        }, _this.handleToggleAll = function (checked) {
            var _this$props3 = _this.props,
                onChange = _this$props3.onChange,
                value = _this$props3.value;

            var disabledItems = _this.getDisabledItems();
            var selectableItems = _this.getSelectableItems();
            var disabledSelectedItems = _lodash2.default.intersection(disabledItems, value);
            var newValue = checked ? [].concat(_toConsumableArray(selectableItems), _toConsumableArray(disabledSelectedItems)) : disabledSelectedItems;
            onChange(newValue, { checked: checked });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(CheckboxGroup, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                toggleAll = _props.toggleAll,
                toggleAllText = _props.toggleAllText,
                className = _props.className,
                list = _props.list,
                value = _props.value;

            var disabledItems = this.getDisabledItems();
            var numSelected = _lodash2.default.without.apply(_lodash2.default, [value].concat(_toConsumableArray(disabledItems))).length;
            var numSelectable = this.getSelectableItems().length;

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-checkbox-group', className) },
                toggleAll && numSelectable > 0 && _react2.default.createElement(
                    'span',
                    { className: 'all list-item' },
                    _react2.default.createElement(_checkbox2.default, {
                        id: id + '-_all',
                        checked: numSelected > 0,
                        className: (0, _classnames2.default)({ partial: numSelected > 0 && numSelected < numSelectable }),
                        onChange: this.handleToggleAll }),
                    _react2.default.createElement(
                        'label',
                        { htmlFor: id + '-_all' },
                        toggleAllText
                    )
                ),
                _lodash2.default.map(list, function (_ref2) {
                    var itemValue = _ref2.value,
                        itemText = _ref2.text,
                        itemClassName = _ref2.className,
                        children = _ref2.children;

                    return _react2.default.createElement(
                        'span',
                        { className: (0, _classnames2.default)('list-item', itemClassName), key: itemValue },
                        _react2.default.createElement(_checkbox2.default, {
                            id: id + '-' + itemValue,
                            onChange: _this2.handleChange.bind(_this2, itemValue),
                            value: itemValue,
                            checked: value.indexOf(itemValue) >= 0,
                            disabled: _lodash2.default.includes(disabledItems, itemValue) }),
                        _react2.default.createElement(
                            'label',
                            { htmlFor: id + '-' + itemValue },
                            itemText
                        ),
                        children
                    );
                })
            );
        }
    }]);

    return CheckboxGroup;
}(_react2.default.Component);

CheckboxGroup.propTypes = {
    id: _propTypes2.default.string,
    list: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        value: _propTypes3.SIMPLE_VALUE_PROP,
        text: _propTypes2.default.node,
        className: _propTypes2.default.string,
        children: _propTypes2.default.node
    })).isRequired,
    className: _propTypes2.default.string,
    value: _propTypes3.SIMPLE_ARRAY_PROP,
    disabled: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes3.SIMPLE_ARRAY_PROP]),
    toggleAll: _propTypes2.default.bool,
    toggleAllText: _propTypes2.default.string,
    onChange: _propTypes2.default.func
};
CheckboxGroup.defaultProps = {
    disabled: false,
    toggleAll: false,
    toggleAllText: 'All'
};
exports.default = (0, _propWire.wire)((0, _listNormalizer2.default)(CheckboxGroup), 'value', []);