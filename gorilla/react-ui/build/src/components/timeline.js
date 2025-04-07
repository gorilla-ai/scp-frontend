'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A React Timeline
 * @todo  Auto time traversal??
 *
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {number} [defaultTime] - Default current time
 * @param {number} [time] - Current time (center of timeline)
 * @param {object} [timeLink] - Link to update time. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} timeLink.value - value to update
 * @param {function} timeLink.requestChange - function to request value change
 * @param {function} [onTimeChange] - Callback function when value is selected. <br> Required when value prop is supplied
 * @param {number} onTimeChange.value - selected value
 * @param {object} onTimeChange.eventInfo - event related info
 * @param {number} onTimeChange.eventInfo.before - previously selected value
 * @param {boolean} [onTimeChange.eventInfo.byUser=false] - triggered by user?
 * @param {number} [defaultInterval] - Default interval config
 * @param {number} [interval] - Current interval config
 * @param {object} [intervalLink] - Link to update interval. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} intervalLink.value - interval to update
 * @param {function} intervalLink.requestChange - function to request interval change
 * @param {function} [onIntervalChange] - Callback function when interval is changed. <br> Required when interval prop is supplied
 * @param {number} onIntervalChange.value - current interval object
 * @param {object} onIntervalChange.eventInfo - event related info
 * @param {number} onIntervalChange.eventInfo.before - previous interval object
 * @param {array.<object>} eventGroups - Group config
 * @param {string | number} eventGroups.id - Group id
 * @param {renderable} [eventGroups.label] - Group label
 * @param {array.<object>} [events] - List of events
 * @param {string | number} events.id - event id
 * @param {renderable} [events.label=id] - event label
 * @param {number} events.start - event start time
 * @param {number} [events.end=start] - event end time
 * @param {string | number} [events.group] - event group id
 * @param {boolean | string} [move=['month','day','hour']] - Can timeline be moved by user?
 * @param {boolean} [zoom=false] - Can timeline be zoomed?
 * @param {boolean} [autoRun=false] - Automatic running time
 *
 * @example
import {Timeline} from 'react-ui'

// controlled with events and zooming
React.createClass({
    getInitialState() {
        return {
            time: 60000,
            interval: 60000
        }
    },
    handleTimeChange(time, {byUser}) {
        this.setState({time})
    },
    handleIntervalChange(interval) {
        this.setState({interval})
    },
    render() {
        let {time, interval} = this.state
        return <div>
            <label>Drag or select a Time</label>
            <Timeline id='timeline'
                className='customize-timeline'
                time={time}
                onTimeChange={this.handleTimeChange}
                interval={interval}
                onIntervalChange={this.handleIntervalChange}
                eventGroups={[
                    {id:'x',label:'X'},
                    {id:'y',label:'Y'}
                ]}
                events={[
                    {id:'a',time:60},
                    {id:'b',label:'B',start:60,group:'x'},
                    {id:'c',label:'C',start:120,group:'y'}
                ]}
                autoRun
                zoom/>
        </div>
    }
})

// simulates a movie player, can only move time not interval
React.createClass({
    getInitialState() {
        return {
            time: 0
        }
    },
    handleTimeChange(time) {
        this.setState({time})
    },
    render() {
        let {time} = this.state
        return <div>
            <label>Drag or select a Time</label>
            <Timeline
                time={time}
                onTimeChange={this.handleTimeChange}
                interval={{min:0, max:3600}}
                traverse={false}/>
        </div>
    }
})
 */

var Timeline = function (_Component) {
    _inherits(Timeline, _Component);

    function Timeline() {
        _classCallCheck(this, Timeline);

        return _possibleConstructorReturn(this, (Timeline.__proto__ || Object.getPrototypeOf(Timeline)).apply(this, arguments));
    }

    _createClass(Timeline, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement('div', null);
        }
    }]);

    return Timeline;
}(_react.Component);

Timeline.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    time: _propTypes2.default.number,
    onTimeChange: _propTypes2.default.func,
    interval: _propTypes2.default.number,
    onIntervalChange: _propTypes2.default.func,
    eventGroups: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        id: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
        label: _propTypes2.default.element
    })),
    events: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        id: _propTypes2.default.string,
        label: _propTypes2.default.element,
        start: _propTypes2.default.number,
        end: _propTypes2.default.number,
        group: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string])
    })),
    zoom: _propTypes2.default.bool,
    autoRun: _propTypes2.default.bool
};

exports.default = Timeline;