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

var _form = require('react-ui/build/src/components/form');

var _form2 = _interopRequireDefault(_form);

var _input = require('react-ui/build/src/components/input');

var _input2 = _interopRequireDefault(_input);

var _textarea = require('vbda/components/visualization/textarea');

var _textarea2 = _interopRequireDefault(_textarea);

var _dropdown = require('react-ui/build/src/components/dropdown');

var _dropdown2 = _interopRequireDefault(_dropdown);

var _checkbox = require('react-ui/build/src/components/checkbox');

var _checkbox2 = _interopRequireDefault(_checkbox);

var _checkboxGroup = require('react-ui/build/src/components/checkbox-group');

var _checkboxGroup2 = _interopRequireDefault(_checkboxGroup);

var _datePicker = require('react-ui/build/src/components/date-picker');

var _datePicker2 = _interopRequireDefault(_datePicker);

var _dateRange = require('react-ui/build/src/components/date-range');

var _dateRange2 = _interopRequireDefault(_dateRange);

var _radioGroup = require('react-ui/build/src/components/radio-group');

var _radioGroup2 = _interopRequireDefault(_radioGroup);

var _localeProvider = require('../../hoc/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var gt = global.vbdaI18n.getFixedT(null, 'vbda');
var lt = global.vbdaI18n.getFixedT(null, 'search');
var log = require('loglevel').getLogger('vbda/components/visualization/search');

/**
 * Search Form
 * @constructor
 * @param {string} [id] - Form dom element #id
 * @param {string} [className] - Classname for the form
 * @param {string} lng -
 * @param {object} cfg - config
 * @param {string} cfg.name - title of this search
 * @param {object} cfg.fields - fields to display in form
 * @param {object} cfg.fields._key - field key
 * @param {title} cfg.fields._key.title - field label
 * @param {'string'|'textarea'|'dropdown'|'checkbox'|'checkbox-group'|'date'|'date-range'|'radio-group'|'gis'} cfg.fields._key.type - field type
 * @param {object} cfg.fields._key.list - key-text pair of options, required for type=dropdown|checkbox-group|radio-group
 * @param {object} cfg.locales - translations
 * @param {function} [onSearch] - Function to call when search button is clicked
 * @param {object} onSearch.params - form data
 *
 * @example

import _ from 'lodash'
import Form from 'vbda/components/visualization/form'

React.createClass({
    search(toSearch) {
        // toSearch == {Identity:'a', CellPhone:'0911'}
    },
    render() {
        return <Form
            id='fulltext'
            lng='en_us'
            cfg={{
                name:'fulltext',
                fields:{
                    Identity:{title:'name', type:'string'},
                    CellPhone:{title:'phone', type:'string'},
                    TestList:{title:'Test List',type:'dropdown', list:{'1':'a','2':'b'}}
                },
                locales:{
                    en_us:{
                        fields:{
                            Identity:{title:'name'},
                            CellPhone:{title:'phone'}
                        }
                    }
                }
            }}
            onSearch={this.search} />
    }
})
 */

var Form = function (_React$Component) {
    _inherits(Form, _React$Component);

    function Form() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Form);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Form.__proto__ || Object.getPrototypeOf(Form)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _this.handleSearch = function () {
            var onSearch = _this.props.onSearch;

            onSearch(_this.state);
        }, _this.handleFormChange = function (inputValue) {
            _this.setState(inputValue);
        }, _this.fieldsParser = function (fields) {
            var newFields = {};
            // let temp = {//portal service api需要的時間範圍
            //     time: {
            //         title: 'date between',
            //         type: 'date'
            //     }}
            // fields = Object.assign(temp, fields)
            _lodash2.default.map(fields, function (field, key) {
                newFields[key] = {
                    label: field.title
                };
                switch (field.type) {
                    case 'string':
                        newFields[key].editor = _input2.default;
                        break;
                    case 'textarea':
                        newFields[key].editor = _textarea2.default;
                        break;
                    case 'dropdown':
                        newFields[key].editor = _dropdown2.default;
                        newFields[key].props = {};
                        newFields[key].props.list = [];
                        _lodash2.default.map(field.list, function (item, itemKey) {
                            newFields[key].props.list.push({ value: itemKey, text: item });
                        });
                        break;
                    case 'checkbox':
                        newFields[key].editor = _checkboxGroup2.default;
                        newFields[key].props = {};
                        newFields[key].props.list = [];
                        newFields[key].props.list.push({ value: 'value', text: 'text' });
                        break;
                    case 'checkbox-group':
                        newFields[key].editor = _checkboxGroup2.default;
                        newFields[key].props = {};
                        newFields[key].props.list = [];
                        newFields[key].props.list.push({ value: 'value1', text: 'text1' });
                        newFields[key].props.list.push({ value: 'value2', text: 'text2' });
                        newFields[key].props.list.push({ value: 'value3', text: 'text3' });
                        // _.map(field.list, (item, itemKey) => {
                        //     newFields[key].props.list.push({value: itemKey, text: item})
                        // })
                        break;
                    case 'date':
                        newFields[key].editor = _datePicker2.default;
                        newFields[key].props = {};
                        newFields[key].props.defaultValue = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate();
                        break;
                    case 'date-range':
                        var newDate = new Date();
                        newFields[key].editor = _dateRange2.default;
                        newFields[key].props = {};
                        if (field.format === 'yyyy-MM-dd') {
                            newFields[key].props.defaultValue = {
                                from: newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate(),
                                to: newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate()
                            };
                        } else {
                            newFields[key].props.enableTime = true;
                            newFields[key].props.defaultValue = {
                                from: newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate() + ' ' + newDate.getHours() + ':' + newDate.getMinutes(),
                                to: newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate() + ' ' + newDate.getHours() + ':' + newDate.getMinutes()
                            };
                        }
                        break;
                    case 'radio-group':
                        newFields[key].editor = _radioGroup2.default;
                        newFields[key].props = {};
                        newFields[key].props.list = [];
                        newFields[key].props.list.push({ value: 'value1', text: 'text1' });
                        newFields[key].props.list.push({ value: 'value2', text: 'text2' });
                        newFields[key].props.list.push({ value: 'value3', text: 'text3' });
                        // _.map(field.list, (item, itemKey) => {
                        //     newFields[key].props.list.push({value: itemKey, text: item})
                        // })
                        break;
                    case 'gis':
                        newFields[key].editor = _input2.default;
                        break;
                    default:
                        newFields[key].editor = _react2.default.createElement(
                            'div',
                            { className: 'c-error' },
                            'not support type'
                        );
                        break;
                }
            });
            // console.log(newFields)
            return newFields;
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Form, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                className = _props.className,
                fields = _props.cfg.fields;

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-box noborder search c-vbda-vis-form', className) },
                _react2.default.createElement(
                    'div',
                    { className: 'content' },
                    _react2.default.createElement(_form2.default, {
                        id: id,
                        formClassName: 'c-form',
                        fields: this.fieldsParser(fields),
                        onChange: this.handleFormChange,
                        value: this.state })
                ),
                _react2.default.createElement(
                    'footer',
                    null,
                    _react2.default.createElement(
                        'button',
                        { onClick: this.handleSearch },
                        lt('btn-advanceSearch')
                    )
                )
            );
        }
    }]);

    return Form;
}(_react2.default.Component);

Form.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    lng: _propTypes2.default.string,
    cfg: _propTypes2.default.shape({
        display_name: _propTypes2.default.string,
        fields: _propTypes2.default.objectOf(_propTypes2.default.shape({
            title: _propTypes2.default.string,
            type: _propTypes2.default.oneOf(['string', 'textarea', 'dropdown', 'checkbox', 'checkbox-group', 'date', 'date-range', 'radio-group', 'gis']),
            list: _propTypes2.default.objectOf(_propTypes2.default.string)
        })).isRequired,
        locales: _propTypes2.default.objectOf(_propTypes2.default.shape({
            fields: _propTypes2.default.shape({
                title: _propTypes2.default.string,
                list: _propTypes2.default.objectOf(_propTypes2.default.string)
            })
        }))
    }).isRequired,
    onSearch: _propTypes2.default.func.isRequired
};
Form.defaultProps = {};
exports.default = (0, _localeProvider2.default)(Form, 'cfg');