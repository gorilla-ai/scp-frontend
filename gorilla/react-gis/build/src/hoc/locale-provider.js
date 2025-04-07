'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.localize = localize;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

var _global = require('../../locales/en/global.json');

var _global2 = _interopRequireDefault(_global);

var _global3 = require('../../locales/zh/global.json');

var _global4 = _interopRequireDefault(_global3);

var _gis = require('../../locales/en/gis.json');

var _gis2 = _interopRequireDefault(_gis);

var _gis3 = require('../../locales/zh/gis.json');

var _gis4 = _interopRequireDefault(_gis3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('react-gis/hoc/localize');

var LOCALES = {
    en: {
        global: _global2.default,
        gis: _gis2.default
    },
    zh: {
        global: _global4.default,
        gis: _gis4.default
    }
};
global.gisI18n = _i18next2.default.createInstance();
var i18nLoaded = false;

function localize(Component) {
    var _class, _temp2;

    var propTypes = {
        lng: _propTypes2.default.string
    };

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

                global.gisI18n.init({
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
                if (!i18nLoaded) {
                    log.info('creating react-gis locale');
                    this.createLocale();
                    i18nLoaded = true;
                }
            }
        }, {
            key: 'componentWillReceiveProps',
            value: function componentWillReceiveProps(nextProps) {
                var lng = this.props.lng;
                var nextLng = nextProps.lng;

                if (lng !== nextLng) {
                    global.gisI18n.changeLanguage(nextLng);
                }
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this;

                return _react2.default.createElement(Component, _extends({
                    ref: function ref(_ref2) {
                        _this2._component = _ref2;
                    }
                }, this.props));
            }
        }]);

        return _class;
    }(_react2.default.Component), _class.propTypes = propTypes, _temp2;
}

exports.default = localize;