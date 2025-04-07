import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'

import Detail from '../visualization/detail'

let log = require('loglevel').getLogger('vbda/components/event/event')

class Event extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        details: PropTypes.bool,
        lng: PropTypes.string,
        event: PropTypes.object,
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
            // only support info render
            renders: PropTypes.objectOf(PropTypes.shape({
                type: PropTypes.string, //React.PropTypes.oneOf(['detail','custom']),
                vis: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.func
                ])
            }))
        })
    };

    static defaultProps = {
        details: false
    };

    render() {
        const {cfg:{dt, renders}, event, lng, details} = this.props
        if (event===null) { return <div /> }
        //const [dsId, dtId] = event._index.split('_')
        const dtId = event.__data_type
        const eventDt = dt[dtId]

        if (!eventDt) {
            return <div className='c-error'>No data type found for {dtId}</div>
        }

        const infoVisId = details ? eventDt.renderDetails : eventDt.renderSummary
        const infoVisCfg = renders[infoVisId]
        let Vis

        if (!infoVisCfg) {
            if (infoVisId) {
                // render info specified but not defined in renders
                return <div className='c-error'>{infoVisId} does not exist in renders cfg</div>
            }
            else {
                // render info not specified
                // Show all fields
                return <div className='c-form'>
                    {
                        _.map(event, (v, k)=>{
                            return <div key={k}>
                                <label>{k}</label><span>{JSON.stringify(v)}</span>
                            </div>
                        })
                    }
                </div>
            }
        }

        Vis = infoVisCfg.vis || Detail

        return <Vis
            id={infoVisId}
            lng={lng}
            event={event}
            cfg={infoVisCfg} />
    }
}

export default Event