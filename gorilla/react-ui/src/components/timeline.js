import PropTypes from 'prop-types';
import React, { Component } from 'react';


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


class Timeline extends Component {
    render() {
        return (
            <div />
        )
    }
}

Timeline.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    time: PropTypes.number,
    onTimeChange: PropTypes.func,
    interval: PropTypes.number,
    onIntervalChange: PropTypes.func,
    eventGroups: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        label: PropTypes.element
    })),
    events: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.element,
        start: PropTypes.number,
        end: PropTypes.number,
        group: PropTypes.oneOfType([
            PropTypes.number, PropTypes.string
        ])
    })),
    zoom: PropTypes.bool,
    autoRun: PropTypes.bool
}

export default Timeline