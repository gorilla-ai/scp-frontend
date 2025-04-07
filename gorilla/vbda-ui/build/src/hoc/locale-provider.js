'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.localize = localize;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

var _vbda = require('../../locales/en/vbda.json');

var _vbda2 = _interopRequireDefault(_vbda);

var _vbda3 = require('../../locales/zh/vbda.json');

var _vbda4 = _interopRequireDefault(_vbda3);

var _analysis = require('../../locales/en/analysis.json');

var _analysis2 = _interopRequireDefault(_analysis);

var _analysis3 = require('../../locales/zh/analysis.json');

var _analysis4 = _interopRequireDefault(_analysis3);

var _search = require('../../locales/en/search.json');

var _search2 = _interopRequireDefault(_search);

var _search3 = require('../../locales/zh/search.json');

var _search4 = _interopRequireDefault(_search3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('vbda/hoc/localize');

var LOCALES = {
    en: {
        vbda: _vbda2.default,
        analysis: _analysis2.default,
        search: _search2.default
    },
    zh: {
        vbda: _vbda4.default,
        analysis: _analysis4.default,
        search: _search4.default
    }
};
global.vbdaI18n = _i18next2.default.createInstance();
var vbdaI18nLoaded = false;

function localize(Component, keyToDetect) {
    var _class, _temp2;

    var propTypes = {
        lng: _propTypes2.default.string
    };
    if (keyToDetect) {
        propTypes[keyToDetect] = _propTypes2.default.object;
    }

    return _temp2 = _class = function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class() {
            var _ref;

            var _temp, _this, _ret;

            _classCallCheck(this, _class);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args))), _this), _this.createLocale = function () {
                var lng = _this.props.lng;

                global.vbdaI18n.init({
                    lng: lng,
                    fallbackLng: 'en',
                    resources: LOCALES
                }, function (err) {
                    err && log.error(err);
                });
                //setupErrorTranslate(global.chewbaccaI18n.getFixedT(null, 'errors'))
            }, _temp), _possibleConstructorReturn(_this, _ret);
        }

        _createClass(_class, [{
            key: 'componentWillMount',
            value: function componentWillMount() {
                if (!vbdaI18nLoaded) {
                    log.info('creating vbda locale');
                    this.createLocale();
                    vbdaI18nLoaded = true;
                }
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this,
                    _extends2;

                if (!keyToDetect) {
                    return _react2.default.createElement(Component, _extends({}, this.props, {
                        ref: function ref(_ref2) {
                            _this2._component = _ref2;
                        } }));
                }

                var _props$keyToDetect = this.props[keyToDetect],
                    locales = _props$keyToDetect.locales,
                    main = _objectWithoutProperties(_props$keyToDetect, ['locales']);

                var lng = this.props.lng;

                return _react2.default.createElement(Component, _extends({}, _lodash2.default.omit(this.props, keyToDetect), (_extends2 = {}, _defineProperty(_extends2, keyToDetect, locales && locales[lng] ? _lodash2.default.merge(main, locales[lng]) : main), _defineProperty(_extends2, 'ref', function ref(_ref3) {
                    _this2._component = _ref3;
                }), _extends2)));
            }
        }]);

        return _class;
    }(_react2.default.Component), _class.propTypes = propTypes, _temp2;
}

exports.default = localize;