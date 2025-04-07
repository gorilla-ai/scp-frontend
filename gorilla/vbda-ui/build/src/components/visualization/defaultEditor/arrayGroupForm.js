"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

var _baseForm = require("./baseForm");

var _baseForm2 = _interopRequireDefault(_baseForm);

var _groupForm = require("./groupForm");

var _groupForm2 = _interopRequireDefault(_groupForm);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

var _objectPathImmutable = require("object-path-immutable");

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var gt = global.vbdaI18n.getFixedT(null, 'vbda');

var ArrayGroupForm = _react2.default.createClass({
    displayName: "ArrayGroupForm",

    propTypes: {
        id: _react2.default.PropTypes.string,
        onChange: _react2.default.PropTypes.func.isRequired,
        value: _react2.default.PropTypes.array,
        fields: _react2.default.PropTypes.object.isRequired,
        groupGridWidth: _react2.default.PropTypes.string // defined each group width
    },
    getInitialState: function getInitialState() {
        var newFields = _lodash2.default.mapValues(this.props.fields, function (field, key) {
            var gridWidth = _lodash2.default.get(field, ['gridWidth'], '24');
            _lodash2.default.set(field, ['className'], "pure-u-" + gridWidth + "-24 c-padding");
            return field;
        });
        return {
            open: false,
            fields: newFields
        };
    },
    handleAdd: function handleAdd() {
        var _props = this.props,
            onChange = _props.onChange,
            value = _props.value,
            fields = _props.fields;

        if (!value) value = [];
        var newRow = {};
        _lodash2.default.map(fields, function (val, key) {
            if (val.inputType === 'checkbox') {
                newRow[key] = 0;
            }
        });
        value.push(newRow);
        onChange(value);
    },
    handleDataChange: function handleDataChange(rid, value) {
        var _props2 = this.props,
            onChange = _props2.onChange,
            wholeValue = _props2.value;

        onChange(_objectPathImmutable2.default.set(wholeValue, rid, value));
    },
    handleChange: function handleChange(value) {
        var onChange = this.props.onChange;

        onChange(value);
    },
    handleDataDelete: function handleDataDelete(rid) {
        var _props3 = this.props,
            id = _props3.id,
            onChange = _props3.onChange,
            value = _props3.value;

        var rowData = value[rid];
        var groupFormId = id + "-" + rid;
        if ((0, _jquery2.default)("#" + groupFormId).find('img').length) {
            alert(gt('txt-delete-file-first'));
            return;
        }
        onChange([].concat(_toConsumableArray(value.slice(0, rid)), _toConsumableArray(value.slice(++rid))));
    },
    render: function render() {
        var _this = this;

        var _props4 = this.props,
            id = _props4.id,
            value = _props4.value,
            label = _props4.label,
            fields = _props4.fields,
            disabled = _props4.disabled,
            _props4$groupGridWidt = _props4.groupGridWidth,
            groupGridWidth = _props4$groupGridWidt === undefined ? 24 : _props4$groupGridWidt;

        if (_lodash2.default.isNil(value)) value = [];
        _lodash2.default.forEach(fields, function (field) {
            _lodash2.default.set(field, ['props', 'disabled'], disabled);
        });
        return _react2.default.createElement(
            "div",
            { id: id, className: 'c-flex fdc' },
            _react2.default.createElement(
                "div",
                null,
                _react2.default.createElement(
                    "button",
                    {
                        onClick: function onClick() {
                            _this.handleAdd();
                        }
                    },
                    "\u65B0\u589E"
                )
            ),
            _react2.default.createElement(
                "div",
                { className: 'pure-g' },
                _lodash2.default.map(value, function (subValue, index) {
                    var newFields = _lodash2.default.cloneDeep(_lodash2.default.mapValues(fields, function (field, key) {
                        //改成包含index的路徑
                        field.targetFieldName = id + "." + index + "." + key;
                        // console.log(`${id}.${index}.${key}`)
                        return field;
                    }));
                    return _react2.default.createElement(_groupForm2.default, {
                        id: id + '-' + index,
                        key: index,
                        className: "pure-u-" + groupGridWidth + "-24",
                        label: _react2.default.createElement(
                            "div",
                            { className: "c-flex" },
                            label + ' - ' + index,
                            _react2.default.createElement(
                                "div",
                                { className: "end", onClick: function onClick() {
                                        _this.handleDataDelete(index);
                                    } },
                                _react2.default.createElement("i", { className: "c-link fg fg-close" })
                            )
                        ),
                        formClassName: "c-form c-grid-form pure-g",
                        fields: newFields,
                        onChange: function onChange(value) {
                            _this.handleDataChange(index, value);
                        },
                        disabled: disabled,
                        value: subValue
                    });
                })
            )
        );
    }
});
exports.default = ArrayGroupForm;