import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import cx from 'classnames'
import i18n from 'i18next'

import {Checkbox} from 'react-ui'

const log = require('loglevel').getLogger('vbda/components/analysis/events')

class Events extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        events: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.array
        ]),
        eventsCfg: PropTypes.object,
        selectable: PropTypes.bool,
        selected: PropTypes.arrayOf(PropTypes.string),
        onSelectionChange: PropTypes.func
    };

    render() {
        const {className, eventsCfg, events, selectable, selected, onSelectionChange} = this.props
        const {dt:dtCfg} = eventsCfg
        const eventGroups = _.groupBy(events, '__data_type')

        return <div className={cx('c-vbda-events', className)}>
            {
            _.map(eventGroups, (groupEvents, dt)=>{
                const fullLength = groupEvents.length === 1
                return <fieldset key={dt}>
                    <legend>{dtCfg[dt].display_name || dt}</legend>
                    <div className='c-flex fww'>
                        {
                            _.map(groupEvents, event=>{
                                const Component = dtCfg[dt].handler.detail
                                const eventId = event.__s_uuid
                                return <div className={cx('c-border c-flex c-padding event', {full:fullLength})} key={eventId}>
                                    {selectable && <Checkbox
                                        checked={_.includes(selected, eventId)}
                                        onChange={onSelectionChange.bind(null, eventId)} />}
                                    <Component event={event} dtCfg={dtCfg[dt]} lng={i18n.language} />
                                </div>
                            })
                        }
                    </div>
                </fieldset>
            })
        }
        </div>
    }
}

export default Events