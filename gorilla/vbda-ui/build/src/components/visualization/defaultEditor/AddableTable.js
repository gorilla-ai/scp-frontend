"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _objectPathImmutable = require("object-path-immutable");

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _table = require("react-ui/build/src/components/table");

var _table2 = _interopRequireDefault(_table);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AddableTable = function (_React$Component) {
    _inherits(AddableTable, _React$Component);

    function AddableTable(props, context) {
        _classCallCheck(this, AddableTable);

        var _this = _possibleConstructorReturn(this, (AddableTable.__proto__ || Object.getPrototypeOf(AddableTable)).call(this, props, context));

        _initialiseProps.call(_this);

        var fields = props.fields;


        var newFields = {};
        newFields.__delete = {
            label: '刪除',
            formatter: function formatter(val, rowData, rid) {
                return _react2.default.createElement(
                    "div",
                    { onClick: function onClick() {
                            _this.handleDataDelete(rid);
                        } },
                    _react2.default.createElement("i", { className: "c-link fg fg-close" })
                );
            }
            // _.map(fields, ({inputType}, key) => {
            //     fields[key].editor = this.getInputComponent(inputType)
            // })
        };newFields = _extends({}, newFields, fields);

        _this.state = {
            open: false,
            fields: newFields
        };
        return _this;
    }

    _createClass(AddableTable, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                value = _props.value;
            var fields = this.state.fields;

            return _react2.default.createElement(
                "div",
                { id: "" + id, className: "AddableTable" },
                _react2.default.createElement(
                    "button",
                    {
                        onClick: function onClick() {
                            _this2.handleAdd();
                        }
                    },
                    "\u65B0\u589E"
                ),
                _react2.default.createElement("div", null),
                !value || value.length <= 0 ? _react2.default.createElement(
                    "div",
                    null,
                    "no data"
                ) : _react2.default.createElement(_table2.default, { id: "",
                    className: "border-inner bland c-border",
                    data: value,
                    fields: fields,
                    onInputChange: function onInputChange(rid, name, value) {
                        _this2.handleDataChange(rid, name, value);
                    }
                })
            );
        }
    }]);

    return AddableTable;
}(_react2.default.Component);

AddableTable.propTypes = {
    onChange: _propTypes2.default.func.isRequired,
    value: _propTypes2.default.array,
    id: _propTypes2.default.string,
    fields: _propTypes2.default.object.isRequired
};

var _initialiseProps = function _initialiseProps() {
    var _this3 = this;

    this.error = function (msg) {
        _this3.setState({ info: msg, error: true });
    };

    this.handleAdd = function () {
        var _props2 = _this3.props,
            onChange = _props2.onChange,
            value = _props2.value,
            fields = _props2.fields;

        if (!value) value = [];
        var newRow = {};
        _.map(fields, function (val, key) {
            if (val.inputType === 'checkbox') {
                newRow[key] = 0;
            }
        });
        value.push(newRow);
        onChange(value);
    };

    this.handleDataChange = function (rid, name, value) {
        var _props3 = _this3.props,
            onChange = _props3.onChange,
            wholeValue = _props3.value,
            fields = _props3.fields;

        if (fields[name].inputType === 'checkbox') value = value ? 1 : 0;
        var rowData = _objectPathImmutable2.default.set(wholeValue[rid], name, value);
        onChange(_objectPathImmutable2.default.set(wholeValue, rid, rowData));
    };

    this.handleDataDelete = function (rid) {
        var _props4 = _this3.props,
            onChange = _props4.onChange,
            value = _props4.value;

        onChange([].concat(_toConsumableArray(value.slice(0, rid)), _toConsumableArray(value.slice(++rid))));
    };
};

exports.default = AddableTable;