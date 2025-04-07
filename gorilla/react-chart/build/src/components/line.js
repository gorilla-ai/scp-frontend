'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _axis = require('./axis');

var _axis2 = _interopRequireDefault(_axis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = require('loglevel').getLogger('chart/components/line');

/**
 * A React Line Chart<br>
 * Essentially an AxisChart with chartType='line'.
 * See [AxisChart]{@link module:AxisChart} for API
 * @constructor
 * @example

import _ from 'lodash'
import LineChart from 'chart/components/line'

const {data:DATA, keyLabels:KEY_LABELS, valueLabels:VALUE_LABELS} = {
    "data":[
        { "director":"martin", "actor":"tom", "movies":2, "tvs":1, "year":1990 },
        { "director":"martin", "actor":"tom", "movies":3, "tvs":2, "year":1990 },
        { "director":"martin", "actor":"tom", "movies":3, "year":1991 },
        { "director":"martin", "actor":"tom", "movies":2, "year":1992 },
        { "director":"martin", "actor":"tom", "movies":10, "year":1996 },
        { "director":"martin", "actor":"tom", "movies":2, "year":1997 },
        { "director":"martin", "actor":"tom", "movies":5, "year":2000 },
        { "director":"martin", "actor":"nicole", "movies":5, "year":1990 },
        { "director":"martin", "actor":"nicole", "movies":4, "year":1991 },
        { "director":"martin", "actor":"nicole", "movies":3, "year":1992 },
        { "director":"martin", "actor":"nicole", "movies":6, "year":1993 },
        { "director":"martin", "actor":"nicole", "movies":1, "year":1994 },
        { "director":"martin", "actor":"nicole", "movies":0, "year":1997 },
        { "director":"martin", "actor":"nicole", "movies":1, "year":2000 },
        { "director":"francis", "actor":"tom", "movies":4, "year":1990 },
        { "director":"francis", "actor":"tom", "movies":2, "year":1991 },
        { "director":"francis", "actor":"tom", "movies":7, "year":1992 },
        { "director":"francis", "actor":"tom", "movies":2, "year":1996 },
        { "director":"francis", "actor":"tom", "movies":1, "year":1997 },
        { "director":"francis", "actor":"tom", "movies":1, "year":2000 },
        { "director":"francis", "actor":"nicole", "movies":1, "year":1990 },
        { "director":"francis", "actor":"nicole", "movies":3, "year":1991 },
        { "director":"francis", "actor":"nicole", "movies":4, "year":1992 },
        { "director":"francis", "actor":"nicole", "movies":1, "year":1993 },
        { "director":"francis", "actor":"nicole", "movies":2, "year":1994 },
        { "director":"francis", "actor":"nicole", "movies":0, "year":1997 },
        { "director":"francis", "actor":"nicole", "movies":2, "year":2000 },
        { "director":"francis", "movies":2, "year":2000 },
        { "actor":"tom", "movies":2, "year":1994 },
        { "actor":"nicole", "movies":2, "year":2001 }
    ],
    "keyLabels":{
        "director": "Director",
        "actor": "Actor",
        "year": "Year"
    },
    "valueLabels":{
        "director": {"martin":"Martin Scorsese", "francis":"Francis Copola"},
        "actor": {"tom":"Tom Cruise", "nicole":"Nicole Kidman"}
    }
}

React.createClass({
    render() {
        return <LineChart
            title='Line Charts by Actor'
            stacked
            vertical
            data={DATA}
            keyLabels={KEY_LABELS}
            valueLabels={VALUE_LABELS}
            dataCfg={{
                splitChart: 'actor',
                splitSeries: 'director',
                x: 'year',
                y: 'movies'
            }} />
    }
})
 */
var LineChart = function LineChart(props) {
    return _react2.default.createElement(_axis2.default, _extends({}, props, { chartType: 'line' }));
};

exports.default = LineChart;