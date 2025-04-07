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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/radio-group');

/**
 * A React Radio Group
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {Array.<object>} list - List of options
 * @param {string | number} list.value - item value
 * @param {string} list.text - item display text
 * @param {renderable} [list.children] - things to render after the label
 * @param {string} [className] - Classname for the container
 * @param {string|number} [defaultValue] - Default selected value
 * @param {string|number} [value] - Current selected value
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean} [disabled=false] - Is selection disabled?
 * @param {function} [onChange] - Callback function when value is selected. <br> Required when value prop is supplied
 * @param {string|number} onChange.value - selected value
 * @param {object} onChange.eventInfo - event related info
 * @param {string|number} onChange.eventInfo.before - previously selected value
 *
 * @example
// controlled

import {RadioGroup} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            movie:'oz'
        }
    },
    handleChange(movie) {
        this.setState({movie})
    },
    render() {
        let {movie} = this.state;
        return <div>
            <label>Select a movie</label>
            <RadioGroup id='movie'
                list={[
                    {value:'dory',text:'dory - Finding Dory'},
                    {value:'oz',text:'oz - Wizard of Oz'},
                    {value:'kane',text:'kane - Citizen Kane',children:<input defaultValue='abc'/>}
                ]}
                onChange={this.handleChange}
                value={movie}/>
        </div>
    }
})
 */

var RadioGroup = function (_React$Component) {
    _inherits(RadioGroup, _React$Component);

    function RadioGroup() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, RadioGroup);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = RadioGroup.__proto__ || Object.getPrototypeOf(RadioGroup)).call.apply(_ref, [this].concat(args))), _this), _this.handleChange = function (evt) {
            var onChange = _this.props.onChange;

            onChange(evt.target.value);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(RadioGroup, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                list = _props.list,
                value = _props.value,
                disabled = _props.disabled,
                className = _props.className;


            var onChange = this.handleChange;

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-radio-group', className) },
                _lodash2.default.map(list, function (_ref2) {
                    var itemValue = _ref2.value,
                        itemText = _ref2.text,
                        children = _ref2.children;

                    return _react2.default.createElement(
                        'div',
                        { key: itemValue, className: 'list-item' },
                        _react2.default.createElement('input', {
                            id: id + '-' + itemValue,
                            type: 'radio',
                            onChange: disabled ? null : onChange // workaround for IE: double click on disabled will still trigger onChange
                            , value: itemValue,
                            checked: value + '' === itemValue + '',
                            disabled: disabled }),
                        _react2.default.createElement(
                            'label',
                            { htmlFor: id + '-' + itemValue, key: itemValue, className: itemValue },
                            itemText
                        ),
                        children
                    );
                })
            );
        }
    }]);

    return RadioGroup;
}(_react2.default.Component);

RadioGroup.propTypes = {
    id: _propTypes2.default.string,
    list: _propTypes3.LIST_PROP,
    className: _propTypes2.default.string,
    value: _propTypes3.SIMPLE_VALUE_PROP,
    disabled: _propTypes2.default.bool,
    onChange: _propTypes2.default.func
};
RadioGroup.defaultProps = {
    disabled: false
};
exports.default = (0, _propWire.wireValue)((0, _listNormalizer2.default)(RadioGroup));