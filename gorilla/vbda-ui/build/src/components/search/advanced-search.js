'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _tabs = require('react-ui/build/src/components/tabs');

var _tabs2 = _interopRequireDefault(_tabs);

var _form = require('../visualization/form');

var _form2 = _interopRequireDefault(_form);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AdvancedSearch = function AdvancedSearch(props) {
    var lng = props.lng,
        cfg = props.cfg,
        dtId = props.dtId,
        currentSearchId = props.currentSearchId,
        onSearch = props.onSearch,
        onSearchChange = props.onSearchChange;
    var dt = cfg.dt,
        searches = cfg.searches;


    if (!dtId) {
        return null;
    }

    var searchIds = dt[dtId].searches;
    var searchCfgs = _lodash2.default.pick(searches, searchIds);
    var searchCfg = searches[currentSearchId];
    var SearchVis = searchCfg.vis || _form2.default;

    return _react2.default.createElement(
        _tabs2.default,
        {
            className: (0, _classnames2.default)('advanced-search fixed'),
            menu: _lodash2.default.mapValues(searchCfgs, function (v, k) {
                return v.display_name || k;
            }),
            current: currentSearchId,
            onChange: onSearchChange },
        _react2.default.createElement(SearchVis, {
            id: currentSearchId,
            lng: lng,
            cfg: searchCfg,
            onSearch: onSearch })
    );
};

exports.default = AdvancedSearch;