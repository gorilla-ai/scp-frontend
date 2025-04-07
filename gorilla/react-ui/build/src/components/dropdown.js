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

var log = require('loglevel').getLogger('react-ui/components/dropdown');

/**
 * A React (single-select) DropDown List
 * @constructor
 * @param {string} [id] - Input element #id
 * @param {string} [name] - Input element name
 * @param {number} [size=1] - Number of items to display
 * @param {Array.<object>} list - List of items
 * @param {string | number} list.value - item value
 * @param {string} list.text - item display text
 * @param {string} [className] - Classname for the container
 * @param {string} [defaultText] - Default text to display when nothing is selected
 * @param {string|number} [defaultValue] - Default selected value
 * @param {string|number} [value] - Current selected value
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean} [required=false] - Is this field mandatory?
 * @param {boolean} [disabled=false] - Is this field disabled?
 * @param {boolean} [readOnly=false] - Is this field readonly?
 * @param {function} [onChange] - Callback function when item is selected. <br> Required when value prop is supplied
 * @param {string|number} onChange.value - selected value
 * @param {object} onChange.eventInfo - event related info
 * @param {string|number} onChange.eventInfo.before - previously selected value
 *
 * @example
// controlled

import {Dropdown} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            movie:'',
            director:''
        }
    },
    handleChange(field, value) {
        this.setState({[field]:value})
    },
    render() {
        let {movie, director} = this.state;
        return <div className='c-form'>
            <div>
                <label htmlFor='movie'>Select movie (optional)</label>
                <Dropdown id='movie'
                    list={[
                        {value:'fd',text:'Finding Dory'},
                        {value:'woo',text:'Wizard of Oz'},
                        {value:'ck',text:'Citizen Kane'}
                    ]}
                    onChange={this.handleChange.bind(this,'movie')}
                    defaultValue='fd'
                    value={movie}/>
            </div>
            <div>
                <label htmlFor='director'>Select director (mandatory)</label>
                <Dropdown id='director'
                    list={[
                        {value:'a',text:'Steven Spielberg'},
                        {value:'b',text:'Spike'},
                        {value:'c',text:'Lynch'},
                        {value:'d',text:'Bergman'}
                    ]}
                    size={3}
                    required={true}
                    onChange={this.handleChange.bind(this,'director')}
                    defaultText='Please select a director'
                    value={director}/>
            </div>
        </div>
    }
})
 */

var Dropdown = function (_React$Component) {
    _inherits(Dropdown, _React$Component);

    function Dropdown() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Dropdown);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Dropdown.__proto__ || Object.getPrototypeOf(Dropdown)).call.apply(_ref, [this].concat(args))), _this), _this.handleChange = function (evt) {
            var onChange = _this.props.onChange;

            onChange(evt.target.value);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Dropdown, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                name = _props.name,
                size = _props.size,
                list = _props.list,
                value = _props.value,
                disabled = _props.disabled,
                readOnly = _props.readOnly,
                required = _props.required,
                defaultText = _props.defaultText,
                className = _props.className;


            var found = false;
            if (value != null) {
                found = _lodash2.default.find(list, function (item) {
                    return item.value + '' === value + '';
                });
            }

            return _react2.default.createElement(
                'select',
                {
                    id: id,
                    name: name,
                    className: (0, _classnames2.default)({ invalid: !found && required }, className),
                    onChange: readOnly ? null : this.handleChange,
                    required: required,
                    value: value,
                    size: size,
                    readOnly: readOnly,
                    disabled: readOnly || disabled },
                (!found || !required) && _react2.default.createElement(
                    'option',
                    { key: '_', value: '' },
                    defaultText || ''
                ),
                _lodash2.default.map(list, function (_ref2) {
                    var itemValue = _ref2.value,
                        itemText = _ref2.text;

                    return _react2.default.createElement(
                        'option',
                        { key: itemValue, value: itemValue },
                        itemText
                    );
                })
            );
        }
    }]);

    return Dropdown;
}(_react2.default.Component);

Dropdown.propTypes = {
    id: _propTypes2.default.string,
    name: _propTypes2.default.string,
    size: _propTypes2.default.number,
    list: _propTypes3.LIST_PROP,
    className: _propTypes2.default.string,
    defaultText: _propTypes3.SIMPLE_VALUE_PROP,
    value: _propTypes3.SIMPLE_VALUE_PROP,
    required: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    readOnly: _propTypes2.default.bool,
    onChange: _propTypes2.default.func
};
Dropdown.defaultProps = {
    required: false,
    disabled: false,
    readOnly: false,
    size: 1
};
exports.default = (0, _propWire.wireValue)((0, _listNormalizer2.default)(Dropdown));