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

var _objectPathImmutable = require('object-path-immutable');

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _dropdown = require('react-ui/build/src/components/dropdown');

var _dropdown2 = _interopRequireDefault(_dropdown);

var _input = require('react-ui/build/src/components/input');

var _input2 = _interopRequireDefault(_input);

var _loader = require('vbda/loader');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('defaultEditor/MultiDropDownList');

var customPropType = function customPropType(props, propName, componentName) {
    if (props[propName] && props[propName] !== 'Input') {
        return new Error(propName + ' should be Input');
    }
};

var MultiDropDownList = function (_React$Component) {
    _inherits(MultiDropDownList, _React$Component);

    function MultiDropDownList() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, MultiDropDownList);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = MultiDropDownList.__proto__ || Object.getPrototypeOf(MultiDropDownList)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _this.onChange = function (key, value) {
            var _this$props = _this.props,
                onChange = _this$props.onChange,
                oldValue = _this$props.value;

            onChange(_objectPathImmutable2.default.set(oldValue, key, value));
        }, _this.onChangeBothParentAndChild = function (fieldKey, fieldValue, childShouldClean) {
            var _this$props2 = _this.props,
                onChange = _this$props2.onChange,
                oldValue = _this$props2.value;

            var newValue = _objectPathImmutable2.default.set(oldValue, fieldKey, fieldValue);
            _.forEach(childShouldClean, function (childFieldKey) {
                _.set(newValue, childFieldKey, '');
            });
            onChange(newValue);
        }, _this.renderInput = function () {
            var _this$props3 = _this.props,
                fields = _this$props3.fields,
                value = _this$props3.value,
                dataMappings = _this$props3.dataMappings;
            // const {dataMappings} = this.state

            var error = false;
            return _.map(fields, function (field, index) {
                var list = void 0;
                if (field.inputType === 'Input') {
                    return _react2.default.createElement(_input2.default, {
                        key: field.fieldKey,
                        onChange: function onChange(value) {
                            _this.onChange(field.fieldKey, value);
                        },
                        value: _.get(value, field.fieldKey, '')
                    });
                }
                if (!_.has(dataMappings, field.refDataMappings)) {
                    //在datamapping 裡面找不到對應的資料可以顯示
                    log.error('missing data mapping reference in:' + field.fieldKey);
                    _this.setState({ info: 'missing data mapping reference', error: true });
                    error = true;
                    return;
                }
                if (error) return null;
                if (field.refFieldKey) {
                    var refFieldValue = _.get(value, field.refFieldKey, null);
                    if (_.isNil(refFieldValue)) return _react2.default.createElement(_dropdown2.default, { key: field.fieldKey, disabled: true });
                    list = _.get(dataMappings, [field.refDataMappings, refFieldValue], []); //根據其reference 的值來決定選單
                } else list = _.get(dataMappings, field.refDataMappings, []);
                return _react2.default.createElement(_dropdown2.default, { key: field.fieldKey, list: list,
                    onChange: function onChange(value) {
                        var childShouldClean = [];
                        for (var i = index; i < fields.length; i++) {
                            var childField = fields[i];
                            if (childField.refFieldKey === field.fieldKey) childShouldClean.push(childField.fieldKey);
                        }
                        if (childShouldClean.length !== 0) {
                            _this.onChangeBothParentAndChild(field.fieldKey, value, childShouldClean);
                        } else _this.onChange(field.fieldKey, value);
                    },
                    value: _.get(value, field.fieldKey, '')
                });
            });
        }, _this.renderInfo = function (text) {
            var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            return _react2.default.createElement(
                'div',
                { className: 'c-box grow' },
                _react2.default.createElement(
                    'div',
                    { className: (0, _classnames2.default)("content c-center c-info", { 'c-error': error }) },
                    text
                )
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(MultiDropDownList, [{
        key: 'render',
        value: function render() {
            var id = this.props.id;
            var _state = this.state,
                info = _state.info,
                error = _state.error;

            if (info) {
                return this.renderInfo(info, error);
            }
            return _react2.default.createElement(
                'div',
                { id: id + '_MultiDropDownList MultiDropDownList' },
                this.renderInput()
            );
        }
    }]);

    return MultiDropDownList;
}(_react2.default.Component);

MultiDropDownList.propTypes = {
    onChange: _propTypes2.default.func.isRequired,
    value: _propTypes2.default.object,
    id: _propTypes2.default.string,
    // fields: React.PropTypes.array.isRequired,
    fields: _propTypes2.default.arrayOf(_propTypes2.default.shape({ //需要順序，所以用array
        refDataMappings: _propTypes2.default.string,
        fieldKey: _propTypes2.default.string,
        refFieldKey: _propTypes2.default.string,
        keep: _propTypes2.default.bool,
        inputType: customPropType
    })),
    combineToFieldKey: _propTypes2.default.string
};
exports.default = MultiDropDownList;