'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.setWidgetLocales = exports.setWidgetDependency = exports.setupConfigService = exports.HOC = undefined;

var _hoc = require('./utils/hoc');

var _hoc2 = _interopRequireDefault(_hoc);

var _widget = require('./loaders/widget');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import '../less/app.less'

exports.HOC = _hoc2.default;
exports.setupConfigService = _widget.setupConfigService;
exports.setWidgetDependency = _widget.setWidgetDependency;
exports.setWidgetLocales = _widget.setWidgetLocales;
exports.default = {
	HOC: _hoc2.default, setupConfigService: _widget.setupConfigService, setWidgetDependency: _widget.setWidgetDependency, setWidgetLocales: _widget.setWidgetLocales
};