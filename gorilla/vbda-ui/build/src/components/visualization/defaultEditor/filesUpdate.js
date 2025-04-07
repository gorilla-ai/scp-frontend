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

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _fileInput = require('react-ui/build/src/components/file-input');

var _fileInput2 = _interopRequireDefault(_fileInput);

var _multiInput = require('react-ui/build/src/components/multi-input');

var _multiInput2 = _interopRequireDefault(_multiInput);

var _progress = require('react-ui/build/src/components/progress');

var _progress2 = _interopRequireDefault(_progress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('core/components/input');

var FilesUpdate = function (_React$Component) {
    _inherits(FilesUpdate, _React$Component);

    function FilesUpdate() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, FilesUpdate);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = FilesUpdate.__proto__ || Object.getPrototypeOf(FilesUpdate)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            base64OfFile: {},
            nameOfFile: {}
        }, _this.handleChange = function (value) {
            console.log(value);
            var onChange = _this.props.onChange;
            var _this$state = _this.state,
                base64OfFile = _this$state.base64OfFile,
                nameOfFile = _this$state.nameOfFile;


            var newObjectsOfFile = _lodash2.default.chain(value).filter(function (o) {
                return o !== '';
            }).keyBy('lastModified').value();
            var newFilesToAdd = _lodash2.default.omit(newObjectsOfFile, _lodash2.default.keys(base64OfFile));
            //新增檔案
            if (!_lodash2.default.isEmpty(newFilesToAdd)) {
                _lodash2.default.forEach(newFilesToAdd, function (newFile, newFileKey) {
                    if (!_lodash2.default.isNil(newFile)) new _bluebird2.default(function (resolve, reject) {
                        return getBase64(newFile, resolve);
                    }).then(function (base64Data) {
                        base64OfFile[newFileKey] = base64Data;
                        nameOfFile[newFileKey] = newFile.name;
                        onChange(_lodash2.default.map(base64OfFile, function (base64, key) {
                            return { base64: base64, name: nameOfFile[key] };
                        }));
                        _this.setState({ base64OfFile: base64OfFile, nameOfFile: nameOfFile });
                        log.info('base64OfFile', base64OfFile, 'nameOfFile', nameOfFile);
                        _progress2.default.done();
                    });
                });
            }
            //刪除檔案
            var fileToDelete = _lodash2.default.omit(base64OfFile, _lodash2.default.keys(newObjectsOfFile));
            if (!_lodash2.default.isEmpty(fileToDelete)) {
                _lodash2.default.forEach(fileToDelete, function (file, fileKey) {
                    delete base64OfFile[fileKey];
                    delete nameOfFile[fileKey];
                });
                onChange(_lodash2.default.map(base64OfFile, function (base64, key) {
                    return { base64: base64, name: nameOfFile[key] };
                }));
                _this.setState({ base64OfFile: base64OfFile, nameOfFile: nameOfFile });
                log.info('base64OfFile', base64OfFile, 'nameOfFile', nameOfFile);
            }

            function getBase64(file, resolve) {
                _progress2.default.startSpin();
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    // callBack(reader.result)
                    var base64Value = reader.result;
                    var result = base64Value.slice(base64Value.indexOf(",") + 1);
                    resolve(result);
                };
            }
        }, _this.renderImageFileUpdate = function () {
            return _react2.default.createElement(_multiInput2.default, { id: 'phones',
                base: _fileInput2.default,
                persistKeys: true,
                props: { btnText: '選擇檔案' },
                onChange: _this.handleChange });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(FilesUpdate, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                this.renderImageFileUpdate()
            );
        }
    }]);

    return FilesUpdate;
}(_react2.default.Component);

FilesUpdate.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    onChange: _propTypes2.default.func
};
FilesUpdate.defaultProps = {};
exports.default = FilesUpdate;