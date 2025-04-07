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

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/text');

/*
let isInParentView = function(el, parent) {
    let rect = el.getBoundingClientRect();
    let parent2 = parent.parentNode.getBoundingClientRect();
    return (
        rect.top > parent2.top &&
        rect.bottom < parent2.bottm
    );
}*/

var Text = function (_React$Component) {
    _inherits(Text, _React$Component);

    function Text() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Text);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Text.__proto__ || Object.getPrototypeOf(Text)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            line: _this.props.line || -1
        }, _this.onScroll = function () {
            log.debug('onScroll');
            if (!_this.autoScrollComingUp) {
                _this.disableAutoScroll = true;
            }
            _this.autoScrollComingUp = false;
        }, _this.renderListItem = function (item, id) {
            return _react2.default.createElement(
                'li',
                { key: id, className: (0, _classnames2.default)({ selected: id === _this.state.line }) },
                _react2.default.createElement(
                    'span',
                    { className: 'line' },
                    id,
                    '.'
                ),
                _react2.default.createElement(
                    'span',
                    null,
                    item
                )
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Text, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            if (this.props.store) {
                this.unsubscribe = this.props.store.listen(function (line) {
                    _this2.setState({ line: line });
                });
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.line && nextProps.line !== this.state.line) {
                this.setState({ line: nextProps.line });
            }
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            return nextState.line !== this.state.line || nextProps.maxLines !== this.props.maxLines || nextProps.content !== this.props.content;
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            var selected = (0, _jquery2.default)(this.node).find('li.selected')[0];
            if (!this.disableAutoScroll && selected /* && !isInParentView(selected, node)*/) {
                    this.autoScrollComingUp = true;
                    selected.scrollIntoView(false);
                }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.unsubscribe) {
                this.unsubscribe();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props,
                className = _props.className,
                content = _props.content,
                maxLines = _props.maxLines,
                id = _props.id;

            var lines = content.split('\n');
            var line = this.state.line;
            var start = 1;
            var end = lines.length;

            if (maxLines) {
                start = Math.max(line - Math.floor(maxLines / 2), 1);
                end = start + maxLines - 1;
                if (end > lines.length) {
                    start = Math.max(1, start - (end - lines.length));
                    end = lines.length;
                }
                lines = lines.slice(start - 1, end);
            }

            return _react2.default.createElement(
                'ul',
                { id: id, ref: function ref(_ref2) {
                        _this3.node = _ref2;
                    }, className: (0, _classnames2.default)('c-text', className), onScroll: this.onScroll },
                _lodash2.default.map(lines, function (val, i) {
                    return _this3.renderListItem(val, start + i);
                })
            );
        }
    }]);

    return Text;
}(_react2.default.Component);

Text.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.any,
    maxLines: _propTypes2.default.number,
    line: _propTypes2.default.number,
    content: _propTypes2.default.string,
    store: _propTypes2.default.any
};
Text.defaultProps = {
    content: ''
};
exports.default = Text;