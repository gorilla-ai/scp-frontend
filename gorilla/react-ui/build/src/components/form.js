'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsCreateFragment = require('react-addons-create-fragment');

var _reactAddonsCreateFragment2 = _interopRequireDefault(_reactAddonsCreateFragment);

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/form');

/**
 * A React Form Component, with configuration for one or more fields
 * @constructor
 * @param {string} [id] - Container element #id
 * @param {object} fields - All fields definition, in key-config pair
 * @param {object} fields.key - Config for this **key** field
 * @param {renderable} [fields.key.label=key if non-merging] - Display label
 * @param {string} [fields.key.className] - classname for this field.
 * @param {boolean} [fields.key.merge=false] - Whether to merge the field value into existing form value, only works when field value is itself an object
 * @param {string|function} [fields.key.editor] - React class to use for rendering the input
 * * native dom elements: eg 'input'|'div' etc
 * * react-ui input components: 'ButtonGroup' | CheckboxGroup' | Checkbox' | Combobox' | DatePicker' | DateRange' | Dropdown' | FileInput' | 'Form' | Input' | MultiInput' | RadioGroup' | RangeCalendar' | Slider' | 'ToggleButton'
 * * custom defined React class with 'value' prop and 'onChange' event prop for interactivity
 * @param {object|function} [fields.key.props] - Props for the above react class, see individual doc for the base class
 * @param {renderable|function} [fields.key.formatter] - Render function
 * @param {renderable} [header] - Any react renderable node
 * @param {renderable} [footer] - Any react renderable node
 * @param {object} actions - All actions definition, in key-config pair
 * @param {object} actions.key - Config for this **key** action
 * @param {string} [actions.key.className] - Classname for the action button
 * @param {renderable} [actions.key.text=key] - Display text
 * @param {boolean} [actions.key.disabled=false] - disable this action?
 * @param {function} actions.key.handler - handler function when action is clicked
 * @param {object} actions.key.handler.value - form value as argument for the handler function
 * @param {boolean} [actions.key.clearForm=false] - clear form when this action button is clicked?
 * @param {boolean} [actions.key.triggerOnComplete=false] - whether to trigger the *handler* when input is completed (by pressing enter key)
 * @param {string} [className] - Classname for the form container
 * @param {string} [formClassName] - Classname for the form content, default selected classnames:
 * * aligned - For each field, arrange label and input on left-right layout (default to top-bottom)
 * * inline - Layout fields from left to right (and top to bottom)
 * * left - When field is **aligned**, make label align to left (default to right)
 * @param {number} [columns=1] - Number of columns to show when arranging using **aligned** classname
 * @param {string} [fieldClassName] - Global classname for each field
 * @param {object} [defaultValue] - Default form input values
 * @param {object} [value] - Current form input values
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {function} [onChange] - Callback function when from/to is changed. <br> Required when value prop is supplied
 * @param {object} onChange.value - current form input values
 * @param {object} onChange.eventInfo - event related info
 * @param {string} onChange.eventInfo.field - field information which triggered the change
 * @param {string} onChange.eventInfo.field.name - which field triggered change?
 * @param {*} onChange.eventInfo.field.value - corresponding value for triggered **field.name**
 * @param {object} onChange.eventInfo.before - previous form input values
 * @param {boolean} onChange.eventInfo.isComplete - was it triggered by pressing enter key on an input field?
 *
 * @example
// controlled

import {Form} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            movie: {
                id: 99,
                year: '1982',
                title: 'Blade Runner',
                directory: 'Ridley Scott',
                languages: ['english','japanese'],
                genre: 'scifi', // index into 'scifi' drop down list
                notes: [],
                scores: {
                    imdb: 8.2,
                    rottenTomatoes: 8.9
                }
            }
        }
    },
    handleChange(movie) {
        this.setState({movie})
    },
    render() {
        let {movie} = this.state;
        return <Form id='movie'
            formClassName='c-form'
            header='Create New Movie'
            fields={{
                id: {label:'ID', formatter:id=>`X${id}`},
                year: {label:'Year', editor:'Input', props:{type:'integer', required:true, validate:{min:1900}}},
                title: {label:'Title', editor:'Input', props:{required:true}},
                director: {label:'Director', editor:'Input', props:{required:true}},
                languages: {label:'Languages', editor:'CheckboxGroup', props:{
                    list:[
                        {value:'english',text:'English'},
                        {value:'japanese',text:'Japanese'},
                        {value:'german',text:'German'},
                        {value:'xyz',text:'XYZ'}
                    ],
                    disabled:['xyz']
                }},
                genre: {label:'Genre', editor:'Dropdown', props:{
                    list:[
                        {value:'drama', text:'Drama'},
                        {value:'horror', text:'Horror'},
                        {value:'scifi', text:'Sci-Fi'}
                    ],
                    defaultText:'Please select a genre'
                }},
                notes: {label:'Notes', editor:'MultiInput', props:{base:'Input', inline:true}},
                'scores.imdb': {label:'IMDB Score', editor:'Input', props:(data)=>{
                    // disable IMDB score when production year is in the future
                    if (data.year >= 2017) {
                        return {disabled:true}
                    }
                    else {
                        return {type:'number', validate:{min:0}}}
                    }
                },
                'scores.rottenTomatoes': {label:'Rotten Tomatotes Score', editor:'Input', props:{type:'number', validate:{min:0}}}
            }}
            onChange={this.handleChange}
            value={movie}/>
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

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Form.__proto__ || Object.getPrototypeOf(Form)).call.apply(_ref, [this].concat(args))), _this), _this.handleChange = function (key, merge, iValue) {
            var info = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var _this$props = _this.props,
                onChange = _this$props.onChange,
                value = _this$props.value,
                actions = _this$props.actions;

            var eventInfo = {
                field: _extends({
                    name: key,
                    value: iValue
                }, info),
                isComplete: _lodash2.default.get(info, 'isComplete', false)
            };

            var newValue = void 0;
            if (merge && _lodash2.default.isObject(iValue)) {
                newValue = _lodash2.default.mergeWith({}, value, iValue, function (objValue, srcValue) {
                    if (_lodash2.default.isArray(objValue)) {
                        return srcValue;
                    }
                    return undefined;
                });
            } else {
                newValue = _objectPathImmutable2.default.set(value, key, iValue);
            }

            var completeAction = _lodash2.default.find(actions, { triggerOnComplete: true });
            if (eventInfo.isComplete && completeAction) {
                onChange(newValue, eventInfo);
                setTimeout(function () {
                    completeAction.handler(newValue);
                }, 0);
            } else {
                onChange(newValue, eventInfo);
            }
        }, _this.isAligned = function () {
            var formClassName = _this.props.formClassName;

            return _lodash2.default.indexOf(_lodash2.default.split(formClassName, ' '), 'aligned') >= 0;
        }, _this.renderField = function (id, fieldCfg, dataSet, fieldDefaultClassName) {
            var createContainer = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

            if (!fieldCfg) {
                log.error('renderField:: config for field \'' + id + '\' missing');
                return null;
            }

            var _fieldCfg$label = fieldCfg.label,
                label = _fieldCfg$label === undefined ? fieldCfg.merge ? '' : id : _fieldCfg$label,
                _fieldCfg$merge = fieldCfg.merge,
                merge = _fieldCfg$merge === undefined ? false : _fieldCfg$merge,
                _fieldCfg$className = fieldCfg.className,
                fieldClassName = _fieldCfg$className === undefined ? fieldDefaultClassName : _fieldCfg$className,
                formatter = fieldCfg.formatter,
                editor = fieldCfg.editor,
                _fieldCfg$props = fieldCfg.props,
                props = _fieldCfg$props === undefined ? {} : _fieldCfg$props;


            var value = merge ? dataSet : _lodash2.default.get(dataSet, id, undefined); // to support traverse of nested field properties, eg a.b.c
            var fieldContent = value;

            if (formatter) {
                if (_lodash2.default.isFunction(formatter)) {
                    fieldContent = formatter(value, dataSet);
                } else {
                    fieldContent = formatter;
                }
            } else if (editor) {
                var _extends2;

                if (_lodash2.default.isFunction(props)) {
                    props = props(dataSet);
                }
                // TODO: check editor must be ReactClass
                var propValueName = 'value';
                if (_lodash2.default.isString(editor)) {
                    if (editor === 'Checkbox') {
                        propValueName = 'checked';
                    }
                    if (editor === 'ToggleButton') {
                        propValueName = 'on';
                    }
                }
                props = _extends({}, props, (_extends2 = { id: id }, _defineProperty(_extends2, propValueName, value), _defineProperty(_extends2, 'onChange', _this.handleChange.bind(_this, id, merge)), _extends2));

                fieldContent = _react2.default.createElement(_lodash2.default.isString(editor) && _lodash2.default.has(_index2.default, editor) ? _index2.default[editor] : editor, props);
            }

            var required = _lodash2.default.get(fieldCfg, 'props.required', false);
            if (createContainer) {
                return _react2.default.createElement(
                    'div',
                    { key: id, className: (0, _classnames2.default)(id, fieldClassName) },
                    _react2.default.createElement(
                        'label',
                        { className: (0, _classnames2.default)({ required: required }), htmlFor: id },
                        label
                    ),
                    fieldContent
                );
            } else {
                return (0, _reactAddonsCreateFragment2.default)({
                    label: _react2.default.createElement(
                        'label',
                        { className: (0, _classnames2.default)({ required: required }), htmlFor: id },
                        label
                    ),
                    content: fieldContent
                });
            }
        }, _this.renderRow = function (fields, dataSet, fieldClassName, rowKey) {
            var renderedFields = _lodash2.default.map(fields, function (fieldCfg, fieldKey) {
                return _this.renderField(fieldKey, fieldCfg, dataSet, fieldClassName, !rowKey);
            });
            if (rowKey) {
                return _react2.default.createElement(
                    'div',
                    { key: rowKey, className: (0, _classnames2.default)('row', 'row-' + rowKey, fieldClassName, _lodash2.default.keys(fields)) },
                    renderedFields
                );
            } else {
                return renderedFields;
            }
        }, _this.renderForm = function (extraFormClassName) {
            var _this$props2 = _this.props,
                formClassName = _this$props2.formClassName,
                fieldClassName = _this$props2.fieldClassName,
                fields = _this$props2.fields,
                columns = _this$props2.columns,
                value = _this$props2.value;

            var aligned = _this.isAligned();

            return _react2.default.createElement(
                'div',
                { className: (0, _classnames2.default)(formClassName, extraFormClassName, 'c-form') },
                aligned ? _lodash2.default.map(_lodash2.default.groupBy(_lodash2.default.map(_lodash2.default.keys(fields), function (k, i) {
                    return _extends({ key: k, idx: Math.floor(i / columns) }, fields[k]);
                }), 'idx'), function (row, idx) {
                    return _this.renderRow(_lodash2.default.keyBy(row, 'key'), value, fieldClassName, idx);
                }) : _this.renderRow(fields, value, fieldClassName)
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Form, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                value = _props.value,
                header = _props.header,
                footer = _props.footer,
                className = _props.className,
                controlClassName = _props.controlClassName,
                actions = _props.actions,
                onChange = _props.onChange;

            var actionNodes = _lodash2.default.map(actions, function (action, actionKey) {
                return _react2.default.createElement(
                    'button',
                    {
                        className: (0, _classnames2.default)(controlClassName, action.className),
                        disabled: action.disabled,
                        ref: function ref(_ref2) {
                            _this2[actionKey + 'Btn'] = _ref2;
                        },
                        key: actionKey,
                        name: actionKey,
                        onClick: function onClick() {
                            if (action.clearForm) {
                                onChange({});
                            }
                            if (action.handler) {
                                action.handler(value);
                            }
                        } },
                    action.text || actionKey
                );
            });

            var hasActions = !_lodash2.default.isEmpty(actionNodes);

            if (!hasActions && !footer && !header) {
                return this.renderForm(className);
            }

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-box c-form-container', className) },
                header && _react2.default.createElement(
                    'header',
                    null,
                    header
                ),
                _react2.default.createElement(
                    'div',
                    { className: (0, _classnames2.default)('content nopad') },
                    this.renderForm()
                ),
                (hasActions || footer) && _react2.default.createElement(
                    'footer',
                    null,
                    footer && _react2.default.createElement('div', { className: (0, _classnames2.default)('c-info'), dangerouslySetInnerHTML: { __html: footer } }),
                    actionNodes
                )
            );
        }
    }]);

    return Form;
}(_react2.default.Component);

Form.propTypes = {
    id: _propTypes2.default.string,
    fields: _propTypes2.default.objectOf(_propTypes2.default.shape({
        label: _propTypes2.default.node,
        className: _propTypes2.default.string,
        merge: _propTypes2.default.bool,
        formatter: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.node]),
        editor: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]), // react class
        props: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.object])
    })).isRequired,
    header: _propTypes2.default.node,
    footer: _propTypes2.default.node,
    actions: _propTypes2.default.objectOf(_propTypes2.default.shape({
        className: _propTypes2.default.string,
        text: _propTypes2.default.node,
        disabled: _propTypes2.default.bool,
        clearForm: _propTypes2.default.bool,
        triggerOnComplete: _propTypes2.default.bool,
        handler: _propTypes2.default.func
    }).isRequired),
    columns: _propTypes2.default.number,
    className: _propTypes2.default.string,
    formClassName: _propTypes2.default.string,
    fieldClassName: _propTypes2.default.string,
    controlClassName: _propTypes2.default.string,
    value: _propTypes2.default.object, // might not be just a simple object
    onChange: _propTypes2.default.func
};
Form.defaultProps = {
    formClassName: '',
    columns: 1,
    value: {},
    actions: {}
};
exports.default = (0, _propWire.wire)(Form, 'value', {});