'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _multiInput = require('react-ui/build/src/components/multi-input');

var _multiInput2 = _interopRequireDefault(_multiInput);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ArrayInput = _react2.default.createClass({
    displayName: 'ArrayInput',

    propTypes: {
        id: _react2.default.PropTypes.string,
        value: _react2.default.PropTypes.array,
        onChange: _react2.default.PropTypes.func
    },
    getDefaultProps: function getDefaultProps() {
        return {};
    },
    getInitialState: function getInitialState() {
        return {};
    },
    render: function render() {
        var _props = this.props,
            id = _props.id,
            value = _props.value,
            _onChange = _props.onChange;

        return _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(_multiInput2.default, {
                id: id,
                base: 'Input',
                props: _lodash2.default.omit(this.props, 'value'),
                inline: true,
                onChange: function onChange(value) {
                    _onChange(value);
                },
                value: value
            })
        );
    }
});

exports.default = ArrayInput;