import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import cx from 'classnames'

import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import Event from './event'

let log = require('loglevel').getLogger('vbda-examples/event/list')

/**
 * EventList
 * @constructor
 * @param {string} [id] - EventList dom element #id
 * @param {string} [className] - Classname for the search
 * @param {string} lng -
 * @param {array.<object>} - data
 * @param {object} cfg -
 * @param {object} cfg.ds -
 * @param {object} cfg.dt -
 * @param {object} cfg.renders -
 *
 * @example

import EventList from 'vbda/components/list'

 */
class EventList extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        lng: PropTypes.string,
        events: PropTypes.objectOf(PropTypes.object),
        cfg: PropTypes.shape({
            ds: PropTypes.objectOf(PropTypes.shape({
                display_name: PropTypes.string,
                dt: PropTypes.arrayOf(PropTypes.string)
            })),
            dt: PropTypes.objectOf(PropTypes.shape({
                display_name: PropTypes.string,
                renderSummary: PropTypes.string,
                renderDetails: PropTypes.string
            })),
            renders: PropTypes.objectOf(PropTypes.shape({
                type: PropTypes.string, //React.PropTypes.oneOf(['detail','custom']),
                vis: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.func
                ])
            }))
        })
    };

    openEventDetails = (event) => {
        const {cfg, lng} = this.props

        PopupDialog.alert({
            display: <Event
                details
                lng={lng}
                event={event}
                cfg={cfg} />
        })
    };

    renderEventSummary = (event) => {
        const {cfg, lng} = this.props

        return <span
            key={event._id}
            className='c-link'
            onClick={this.openEventDetails.bind(this, event)}>
            <Event
                cfg={cfg}
                lng={lng}
                event={event} />
        </span>
    };

    render() {
        const {cfg, id, className, events} = this.props

        if (!cfg || _.isEmpty(cfg)) {
            return <div>loading...</div>
        }
        return <div
            id={id}
            className={cx('c-vbda-events', className)}>
            {
                _.map(events, e=>this.renderEventSummary(e))
            }
        </div>
    }
}

export default EventList