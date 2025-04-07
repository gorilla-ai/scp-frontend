'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _baseForm = require('./baseForm');

var _baseForm2 = _interopRequireDefault(_baseForm);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GroupForm = function (_React$Component) {
    _inherits(GroupForm, _React$Component);

    function GroupForm(props) {
        _classCallCheck(this, GroupForm);

        var _this = _possibleConstructorReturn(this, (GroupForm.__proto__ || Object.getPrototypeOf(GroupForm)).call(this, props));

        _this.handleFormChange = function (formData) {
            // this.setState({data: formData})
            _this.props.onChange(formData);
        };

        var newFields = _.mapValues(props.fields, function (field, key) {
            var gridWidth = _.get(field, ['gridWidth'], '24');
            _.set(field, ['className'], 'pure-u-' + gridWidth + '-24 c-padding');
            return field;
        });

        _this.state = {
            open: false,
            fields: newFields
        };
        return _this;
    }

    _createClass(GroupForm, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                value = _props.value,
                label = _props.label;
            var fields = this.state.fields;

            if (_.isNil(value)) value = {};
            return _react2.default.createElement(
                'div',
                { id: '' + id, className: (0, _classnames2.default)('FormGroup', 'c-box') },
                _react2.default.createElement(
                    'header',
                    null,
                    label
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'content' },
                    _react2.default.createElement(_baseForm2.default, {
                        className: 'grow',
                        formClassName: 'c-form c-grid-form pure-g',
                        fields: fields,
                        onChange: this.handleFormChange,
                        value: value
                    })
                )
            );
        }
    }]);

    return GroupForm;
}(_react2.default.Component);

GroupForm.propTypes = {
    onChange: _propTypes2.default.func.isRequired,
    value: _propTypes2.default.object,
    id: _propTypes2.default.string,
    fields: _propTypes2.default.object.isRequired
};
exports.default = GroupForm;