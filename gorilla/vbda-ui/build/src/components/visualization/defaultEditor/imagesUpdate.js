'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fileInput = require('react-ui/build/src/components/file-input');

var _fileInput2 = _interopRequireDefault(_fileInput);

var _input = require('react-ui/build/src/components/input');

var _input2 = _interopRequireDefault(_input);

var _buttonGroup = require('react-ui/build/src/components/button-group');

var _buttonGroup2 = _interopRequireDefault(_buttonGroup);

var _inputHelper = require('react-ui/build/src/utils/input-helper');

var _progress = require('react-ui/build/src/components/progress');

var _progress2 = _interopRequireDefault(_progress);

var _imageHelper = require('vbda/utils/image-helper');

var _imageHelper2 = _interopRequireDefault(_imageHelper);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('core/components/input');
var gt = global.vbdaI18n.getFixedT(null, 'vbda');

var FILE_SERVICE_API = '/api/file';
var MODE = {
    FILE: 0,
    URL: 1
};

var photoStyle = {
    position: 'relative',
    margin: '0px 10px 0px 0px',
    width: 'auto',
    height: '100px'
};
var buttonStyle = {
    position: "absolute",
    top: 0,
    right: 0,
    padding: "2px 0 0 0",
    textAlign: "center",
    width: "18px",
    height: "18px",
    font: "16px/14px Tahoma, Verdana, sans-serif",
    color: "rgba(0,0,0,0.9)",
    background: "#ffffff",
    borderColor: "black",
    borderEadius: "15px",
    textDecoration: "none",
    fontWeight: "bold"
};

var ImagesUpdate = function (_React$Component) {
    _inherits(ImagesUpdate, _React$Component);

    function ImagesUpdate() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ImagesUpdate);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ImagesUpdate.__proto__ || Object.getPrototypeOf(ImagesUpdate)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            url: '',
            mode: MODE.FILE
        }, _this.addImage = function (base64, name) {
            var onChange = _this.props.onChange;

            var base64OfFile = _lodash2.default.cloneDeep(_this.props.value);
            if (_lodash2.default.isEmpty(base64OfFile)) base64OfFile = [];
            base64OfFile.push({ base64: base64.slice(base64.indexOf(",") + 1), name: name });
            _this.setState({ url: '' });
            onChange(base64OfFile);
            log.info('base64OfFile', base64OfFile);
        }, _this.deleteImage = function (index) {
            var onChange = _this.props.onChange;
            var base64OfFile = _this.props.value;

            base64OfFile.splice(index, 1);
            onChange(base64OfFile);
            log.info('base64OfFile', base64OfFile);
        }, _this.handleChange = function (newFile) {
            if (!newFile) {
                //清空
                return;
            }
            console.log(newFile);
            (0, _imageHelper2.default)(newFile).then(function (base64Data) {
                _this.addImage(base64Data, newFile.name);
                _this.fileInput.handleClick(); //把component的內容清掉
                _progress2.default.done();
            });
        }, _this.handleUrl = function (url) {
            _this.setState({ url: url });
        }, _this.handleUrlConvert = function () {
            (0, _imageHelper2.default)(_this.state.url).then(function (value) {
                if (value === null) return;
                _this.addImage(value, _this.state.url.slice(_this.state.url.lastIndexOf("/") + 1));
            });
        }, _this.renderImageFileUpdate = function () {
            return _react2.default.createElement(_fileInput2.default, {
                ref: function ref(_ref2) {
                    _this.fileInput = _ref2;
                },
                btnText: '\u4E0A\u50B3',
                validate: { extension: 'image/*' },
                onChange: function onChange(file) {
                    _this.handleChange(file);
                }
            });
        }, _this.renderImageFileURL = function () {
            return _react2.default.createElement(
                'div',
                { className: 'c-flex' },
                _react2.default.createElement(_input2.default, {
                    className: 'grow',
                    type: 'text',
                    onChange: function onChange(url) {
                        _this.handleUrl(url);
                    },
                    value: _this.state.url
                }),
                _react2.default.createElement(
                    'button',
                    { className: (0, _classnames2.default)('inline'), onClick: _this.handleUrlConvert },
                    gt('btn-import')
                )
            );
        }, _this.renderImage = function (index, srcUrl) {
            return _react2.default.createElement(
                'div',
                { key: index, style: photoStyle },
                _react2.default.createElement('img', {
                    src: srcUrl,
                    style: photoStyle,
                    alt: ''
                }),
                _react2.default.createElement(
                    'a',
                    { style: buttonStyle, onClick: function onClick() {
                            return _this.deleteImage(index);
                        } },
                    'X'
                )
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ImagesUpdate, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var mode = this.state.mode;
            var base64OfFile = this.props.value;

            var list = [{ value: 0, text: gt('btn-file') }, { value: 1, text: gt('btn-url') }];
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(_buttonGroup2.default, {
                    list: list,
                    value: mode,
                    onChange: function onChange(value) {
                        _this2.setState({ mode: value });
                    }
                }),
                mode === MODE.FILE ? this.renderImageFileUpdate() : this.renderImageFileURL(),
                _react2.default.createElement(
                    'div',
                    { className: 'c-flex' },
                    _lodash2.default.map(base64OfFile, function (_ref3, index) {
                        var base64 = _ref3.base64,
                            url = _ref3.url;

                        if (base64) {
                            //base64
                            var srcUrl = 'data:image;base64,' + base64;

                            return _this2.renderImage(index, srcUrl);
                        } else {
                            //url
                            var _srcUrl = FILE_SERVICE_API + url;

                            return _this2.renderImage(index, _srcUrl);
                        }
                    })
                )
            );
        }
    }]);

    return ImagesUpdate;
}(_react2.default.Component);

ImagesUpdate.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    onChange: _propTypes2.default.func
};
ImagesUpdate.defaultProps = {};
exports.default = ImagesUpdate;