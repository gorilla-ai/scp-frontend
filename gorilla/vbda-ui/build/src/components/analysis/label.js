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

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactUi = require('react-ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('vbda/components/analysis/label');

var Label = function (_React$Component) {
    _inherits(Label, _React$Component);

    function Label() {
        _classCallCheck(this, Label);

        return _possibleConstructorReturn(this, (Label.__proto__ || Object.getPrototypeOf(Label)).apply(this, arguments));
    }

    _createClass(Label, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                className = _props.className,
                _props$labelData = _props.labelData,
                labelId = _props$labelData.id,
                labelProps = _props$labelData.propsReadable,
                _props$nodeData = _props.nodeData,
                nodeProps = _props$nodeData.propsReadable,
                images = _props$nodeData.images,
                events = _props$nodeData.events,
                selectable = _props.selectable,
                selected = _props.selected,
                onSelect = _props.onSelect,
                onClick = _props.onClick,
                showLabelText = _props.showLabelText,
                showEventCount = _props.showEventCount;


            var props = _lodash2.default.reduce(_extends({}, labelProps, nodeProps), function (acc, v, k) {
                if ((0, _lodash2.default)(acc).values().includes(v)) {
                    return acc;
                }
                return _extends({}, acc, _defineProperty({}, k, v));
            }, {});

            //const images = ['https://static.wixstatic.com/media/812313_d85a13812e6b4a7fb6c1194cf4113312.png/v1/fill/w_126,h_126,al_c,usm_0.66_1.00_0.01/812313_d85a13812e6b4a7fb6c1194cf4113312.png']

            return _react2.default.createElement(
                'div',
                { className: (0, _classnames2.default)(className, { selected: selected }, 'c-vbda-label'), onClick: onClick ? onClick.bind(null, labelId) : null },
                selectable && _react2.default.createElement(_reactUi.Checkbox, { checked: selected, onChange: onSelect.bind(null, labelId) }),
                _react2.default.createElement(
                    'div',
                    { className: 'c-flex fdc' },
                    _react2.default.createElement(
                        'div',
                        { className: 'images' },
                        _lodash2.default.map(images, function (img) {
                            return _react2.default.createElement('img', { key: img, src: img });
                        })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'info' },
                        _lodash2.default.map(props, function (v, k) {
                            return _react2.default.createElement(
                                'div',
                                { key: k },
                                showLabelText && _react2.default.createElement(
                                    'span',
                                    null,
                                    k,
                                    ': '
                                ),
                                ' ',
                                v
                            );
                        })
                    ),
                    showEventCount && _react2.default.createElement(
                        'div',
                        { className: 'c-bullet' },
                        events.length
                    )
                )
            );
        }
    }]);

    return Label;
}(_react2.default.Component);

Label.propTypes = {
    className: _propTypes2.default.string,
    labelData: _propTypes2.default.object,
    nodeData: _propTypes2.default.object,
    selectable: _propTypes2.default.bool,
    selected: _propTypes2.default.bool,
    onSelect: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    showLabelText: _propTypes2.default.bool,
    showEventCount: _propTypes2.default.bool
};
Label.defaultProps = {
    labelData: {},
    nodeData: {},
    selectable: false,
    selected: false,
    showLabelText: false,
    showEventCount: true
};
exports.default = Label;