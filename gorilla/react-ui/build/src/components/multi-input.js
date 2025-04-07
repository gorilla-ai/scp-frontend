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

var _objectPathImmutable = require('object-path-immutable');

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _propWire = require('../hoc/prop-wire');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/multi-input');

/**
 * A React Multi Input Group, can be used on any type of 'value', string, number, object etc
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string|function} base - React class to use for rendering the input
 * * native dom elements: eg 'input'|'div' etc
 * * react-ui input components: 'ButtonGroup' | CheckboxGroup' | Checkbox' | Combobox' | DatePicker' | DateRange' | Dropdown' | FileInput' | Input' | MultiInput' | RadioGroup' | RangeCalendar' | ToggleButton'
 * * custom defined React class
 * @param {object} [props] - Props for the above react class, see individual doc for the base class
 * @param {string} [className] - Classnames to apply
 * @param {string} [groupClassName] - Classnames to apply to individual input groups
 * @param {boolean} [expand=false] - Should input items expand to fill the horizontal space as restricted by its parent element #id
 * @param {boolean} [inline=false] - Should input items be displayed as inline?
 * @param {boolean} [boxed=false] - Should input items be displayed as boxed areas? This will make remove icon/button appear at top right corner of the box
 * @param {boolean} [disabled=false] - Are input items disabled?
 * @param {boolean} [readOnly=false] - Are input items read only?
 * @param {boolean} [persistKeys=false] - Avoid react conflict resolution by persisting keys? Should be used along side file inputs
 * @param {*} [defaultItemValue=''] - When adding new item, what is the default value of this item?
 * @param {array} [defaultValue] - Default array of input values
 * @param {array} [value] - Current array of input values
 * @param {object} [valueLink] - Link to update values. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {function} [onChange] - Callback function when any of the input is changed/entered. <br> Required when value prop is supplied
 * @param {array} onChange.values - input values
 * @param {object} onChange.eventInfo - event related info
 * @param {array} onChange.eventInfo.before - previous input values
 * @param {renderable} [addText] - Text shown in add button, default to showing '+' icon
 * @param {renderable} [removeText] - Text shown in remove button, default to showing 'x' icon
 *
 * @example

import {MultiInput, Input} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            phones:[]
        }
    },
    handleChange(phones) {
        this.setState({phones})
    },
    render() {
        let {phones} = this.state;
        return <div>
            <label htmlFor='phones'>Enter phones</label>
            <MultiInput id='phones'
                base={Input}
                props={{validate:{
                    pattern:/^[0-9]{10}$/,
                    t:()=>'Incorrect phone number, should read like 0900000000'
                }}}
                inline={true}
                onChange={this.handleChange}
                value={phones}/>
        </div>
    }
})
 */

var MultiInput = function (_React$Component) {
    _inherits(MultiInput, _React$Component);

    function MultiInput() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, MultiInput);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = MultiInput.__proto__ || Object.getPrototypeOf(MultiInput)).call.apply(_ref, [this].concat(args))), _this), _this.handleChange = function (result) {
            var onChange = _this.props.onChange;
            // onChange(_.compact(result));

            onChange(result);
        }, _this.modifyInput = function (i, newVal) {
            var value = _this.props.value;

            // support base react input elements such as 'input'

            if (newVal.target) {
                // newVal should be event e
                newVal = newVal.target.value;
            }
            _this.handleChange(_objectPathImmutable2.default.set(value, i, newVal));
        }, _this.addInput = function () {
            var _this$props = _this.props,
                value = _this$props.value,
                defaultItemValue = _this$props.defaultItemValue;

            // if value was empty, a default item would have been added to display, so need to append this item

            if (value.length <= 0) {
                value = [].concat(_toConsumableArray(value), [defaultItemValue]);
            }

            if (_this.keys) {
                _this.keys.push(_lodash2.default.last(_this.keys) + 1);
            }

            _this.handleChange([].concat(_toConsumableArray(value), [defaultItemValue]));
        }, _this.removeInput = function (i) {
            var value = _this.props.value;


            if (_this.keys) {
                if (value.length <= 1) {
                    // if last item in the list, after removal, still need to create new key
                    _this.keys = [_lodash2.default.last(_this.keys) + 1];
                } else {
                    _this.keys = _objectPathImmutable2.default.del(_this.keys, i);
                }
            }

            _this.handleChange(_objectPathImmutable2.default.del(value, i));
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(MultiInput, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                base = _props.base,
                baseProps = _props.props,
                value = _props.value,
                defaultItemValue = _props.defaultItemValue,
                expand = _props.expand,
                inline = _props.inline,
                boxed = _props.boxed,
                disabled = _props.disabled,
                readOnly = _props.readOnly,
                persistKeys = _props.persistKeys,
                className = _props.className,
                groupClassName = _props.groupClassName,
                addText = _props.addText,
                removeText = _props.removeText;


            var editable = !(disabled || readOnly);

            var items = value.length <= 0 ? [].concat(_toConsumableArray(value), [defaultItemValue]) : value;

            // use this.keys to maintain react keys,
            // so adding will always create new key, instead of possibly reusing existing element with same key
            // mainly used for file input, where react doesn't handle conflict resolution for file inputs
            // When persist keys, things will not work when assigning passing new set of value prop to MultiInput
            if (persistKeys && !this.keys) {
                this.keys = _lodash2.default.map(items, function (item, i) {
                    return i;
                });
            }

            return _react2.default.createElement(
                'span',
                { id: id, className: (0, _classnames2.default)('c-multi', className, { expand: expand, inline: inline, boxed: boxed }) },
                _lodash2.default.map(items, function (item, i) {
                    var key = _this2.keys ? _this2.keys[i] : i;
                    return _react2.default.createElement(
                        'span',
                        { key: key, className: (0, _classnames2.default)('group', groupClassName) },
                        _react2.default.createElement(_lodash2.default.isString(base) && _lodash2.default.has(_index2.default, base) ? _index2.default[base] : base, _lodash2.default.extend(baseProps, {
                            /* required, */
                            onChange: _this2.modifyInput.bind(_this2, i),
                            value: item,
                            disabled: disabled,
                            readOnly: readOnly
                        })),
                        editable && (removeText ? _react2.default.createElement(
                            'button',
                            { onClick: _this2.removeInput.bind(_this2, i), className: 'standard remove' },
                            removeText
                        ) : _react2.default.createElement('i', { onClick: _this2.removeInput.bind(_this2, i), className: 'c-link fg fg-close remove' })),
                        editable && !boxed && _react2.default.createElement(
                            'button',
                            { className: (0, _classnames2.default)('standard add', addText ? '' : 'fg fg-add', { disabled: i < items.length - 1 }), onClick: _this2.addInput },
                            addText
                        )
                    );
                }),
                editable && boxed && _react2.default.createElement(
                    'button',
                    { className: (0, _classnames2.default)('standard add', addText ? '' : 'fg fg-add'), onClick: this.addInput },
                    addText
                )
            );
        }
    }]);

    return MultiInput;
}(_react2.default.Component);

MultiInput.propTypes = {
    id: _propTypes2.default.string,
    base: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]).isRequired,
    props: _propTypes2.default.object,
    expand: _propTypes2.default.bool,
    inline: _propTypes2.default.bool,
    boxed: _propTypes2.default.bool,
    className: _propTypes2.default.string,
    groupClassName: _propTypes2.default.string,
    disabled: _propTypes2.default.bool,
    readOnly: _propTypes2.default.bool,
    persistKeys: _propTypes2.default.bool,
    defaultItemValue: _propTypes2.default.any,
    value: _propTypes2.default.array,
    // required: React.PropTypes.bool,
    onChange: _propTypes2.default.func,
    addText: _propTypes2.default.node,
    removeText: _propTypes2.default.node
};
MultiInput.defaultProps = {
    expand: false,
    inline: false,
    boxed: false,
    disabled: false,
    readOnly: false,
    persistKeys: false,
    defaultItemValue: '' /* ,
                         required: false*/
};
exports.default = (0, _propWire.wire)(MultiInput, 'value', []);