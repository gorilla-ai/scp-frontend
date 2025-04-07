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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-ui/components/image');

/**
 * A React Image Component, with preloading options
 * @constructor
 * @param {string} [id] - Container element #id
 * @param {string} [className] - Classname for the container
 * @param {object} [style] - Styles for the container
 * @param {string} src - Image source url
 * @param {string} [alt] - Image alt
 * @param {boolean} [preload=true] - Allow preloading image? If false then will act as normal <img> tag
 * @param {number} [timeout=30000] - When preload is enabled, maximum time (in milliseconds) to wait before error kicks in
 * @param {string} [placeholder] - When preload is enabled, alternative image url to show when image load has failed
 * @param {renderable} [error='Load failed'] - When preload is enabled, error message to show when image load has filed
 *
 * @example
import {Image} from 'react-ui'

Examples.Image = React.createClass({
    render() {
        return <Image
            src='/images/missing.png'
            error=':('
            placeholder='/images/tiles/ic_alert_2.png' />
    }
})
 */

var Image = function (_React$Component) {
    _inherits(Image, _React$Component);

    function Image() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Image);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Image.__proto__ || Object.getPrototypeOf(Image)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            done: false,
            error: false
        }, _this.clearTimer = function () {
            if (_this.timer) {
                clearTimeout(_this.timer);
            }
        }, _this.createTimer = function () {
            var timeout = _this.props.timeout;

            _this.clearTimer();
            _this.timer = setTimeout(function () {
                _this.handleDone(false);
            }, timeout);
        }, _this.handleDone = function (success) {
            _this.clearTimer();
            if (!_this.state.done) {
                _this.setState({ done: true, error: !success });
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Image, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var preload = this.props.preload;

            preload && this.createTimer();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var src = nextProps.src,
                preload = nextProps.preload;
            var prevSrc = this.props.src;


            this.clearTimer();
            if (preload && prevSrc !== src) {
                this.setState({ done: false, error: false });
                this.createTimer();
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.clearTimer();
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                className = _props.className,
                style = _props.style,
                src = _props.src,
                alt = _props.alt,
                preload = _props.preload,
                error = _props.error,
                placeholder = _props.placeholder;
            var _state = this.state,
                hasError = _state.error,
                done = _state.done;


            if (preload) {
                if (!done) {
                    return _react2.default.createElement(
                        'div',
                        { id: id, className: (0, _classnames2.default)('c-image loading c-flex aic jcc', className), style: style },
                        _react2.default.createElement('i', { className: 'fg fg-loading-2 fg-spin' }),
                        _react2.default.createElement('img', {
                            src: src,
                            alt: alt,
                            onError: this.handleDone.bind(this, false),
                            onAbort: this.handleDone.bind(this, false),
                            onLoad: this.handleDone.bind(this, true) })
                    );
                } else if (hasError) {
                    return _react2.default.createElement(
                        'div',
                        { id: id, className: (0, _classnames2.default)('c-image error c-flex aic jcc', className), style: style },
                        error && _react2.default.createElement(
                            'div',
                            { className: 'error' },
                            error
                        ),
                        placeholder && _react2.default.createElement('img', { alt: alt, src: placeholder })
                    );
                }
            }

            return _react2.default.createElement('img', {
                id: id,
                className: (0, _classnames2.default)('c-image complete', className),
                style: style,
                src: src,
                alt: alt });
        }
    }]);

    return Image;
}(_react2.default.Component);

Image.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    style: _propTypes2.default.object,
    src: _propTypes2.default.string.isRequired,
    alt: _propTypes2.default.string,
    preload: _propTypes2.default.bool,
    timeout: _propTypes2.default.number,
    placeholder: _propTypes2.default.string,
    error: _propTypes2.default.node
};
Image.defaultProps = {
    preload: true,
    timeout: 30000,
    error: 'Load failed'
};
exports.default = Image;