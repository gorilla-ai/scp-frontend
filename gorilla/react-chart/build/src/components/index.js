'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Timeline = exports.Metric = exports.Table = exports.Pie = exports.Line = exports.Dashboard = exports.Bar = exports.Axis = exports.Area = undefined;

var _area = require('./area');

var _area2 = _interopRequireDefault(_area);

var _axis = require('./axis');

var _axis2 = _interopRequireDefault(_axis);

var _bar = require('./bar');

var _bar2 = _interopRequireDefault(_bar);

var _dashboard = require('./dashboard');

var _dashboard2 = _interopRequireDefault(_dashboard);

var _line = require('./line');

var _line2 = _interopRequireDefault(_line);

var _pie = require('./pie');

var _pie2 = _interopRequireDefault(_pie);

var _table = require('./table');

var _table2 = _interopRequireDefault(_table);

var _metric = require('./metric');

var _metric2 = _interopRequireDefault(_metric);

var _timeline = require('./timeline');

var _timeline2 = _interopRequireDefault(_timeline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Area = _area2.default;
exports.Axis = _axis2.default;
exports.Bar = _bar2.default;
exports.Dashboard = _dashboard2.default;
exports.Line = _line2.default;
exports.Pie = _pie2.default;
exports.Table = _table2.default;
exports.Metric = _metric2.default;
exports.Timeline = _timeline2.default;
exports.default = {
	Area: _area2.default,
	Axis: _axis2.default,
	Bar: _bar2.default,
	Dashboard: _dashboard2.default,
	Line: _line2.default,
	Pie: _pie2.default,
	Table: _table2.default,
	Metric: _metric2.default,
	Timeline: _timeline2.default
};