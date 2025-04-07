import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'

import {Progress} from 'react-ui'

import Labels from './labels'
import Events from './events'

import {analyze} from '../../analyzer'
import localize from '../../hoc/locale-provider'


const log = require('loglevel').getLogger('vbda/components/analysis/source')

const lt = global.vbdaI18n.getFixedT(null, 'analysis')
const gt = global.vbdaI18n.getFixedT(null, 'vbda')

class Source extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        events: PropTypes.objectOf(PropTypes.object),
        eventsCfg: PropTypes.shape({
            dt: PropTypes.object
        }).isRequired,
        analyze: PropTypes.object,
        selectable: PropTypes.bool,
        action: PropTypes.shape({
            className: PropTypes.string,
            text: PropTypes.node,
            handler: PropTypes.func
        })
    };

    static defaultProps = {
        events: {},
        eventsCfg: {},
        analyze: {},
        selectable: false
    };

    state = {
        source: {},
        currentLabel: null,
        selectedEvents: []
    };

    componentDidMount() {
        setTimeout(()=>{
            this.analyzeEvents(this.props.events)
        }, 0)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.events !== nextProps.events) {
            this.analyzeEvents(nextProps.events)
        }
    }

    analyzeEvents = (events) => {
        const {eventsCfg, analyze:analyzeCfg} = this.props
        const {currentLabel} = this.state

        Progress.startSpin()
        const source = analyze(events, eventsCfg, {...analyzeCfg, analyzeLinks:false})
        Progress.done()
        this.setState({
            source,
            currentLabel: currentLabel && _.has(source.labels, currentLabel) ? currentLabel : null
        })
    };

    handleLabelClick = (labelId) => {
        this.setState({currentLabel:labelId})
    };

    handleEventToggle = (eventId, selected) => {
        const {selectedEvents} = this.state
        const newSelectedEvents = (selected ? [...selectedEvents, eventId] : _.without(selectedEvents, eventId))
        this.setState({selectedEvents:newSelectedEvents})
    };

    renderEvents = () => {
        const {eventsCfg, events, selectable} = this.props
        const {source:{labels, nodes}, currentLabel:currentLabelId, selectedEvents} = this.state

        const currentLabel = labels[currentLabelId]
        const currentEvents = currentLabel ? _.pick(events, nodes[currentLabel.nodeId].events) : {}

        return <Events
            className='content h0'
            events={currentEvents}
            eventsCfg={eventsCfg}
            selectable={selectable}
            selected={selectedEvents}
            onSelectionChange={this.handleEventToggle} />
    };

    render() {
        const {id, eventsCfg, className, action} = this.props
        const {source, currentLabel, selectedEvents} = this.state

        return <div id={id} className={cx(className, 'c-flex c-join vertical c-vbda-source')}>
            <div className='c-box labels fixed'>
                <header>{lt('hdr-intel-list')}</header>
                {
                    _.isEmpty(source) ? <div className='content'>{gt('txt-loading')}</div> :
                    <Labels
                        className='content nopad'
                        source={source}
                        sourceCfg={eventsCfg}
                        hilited={[currentLabel]}
                        onClick={this.handleLabelClick} />
                }
            </div>
            <div className='c-box grow source'>
                <header className='c-flex aic'>
                    {lt('hdr-source')}
                    {action && <button className={cx('end', action.className)} onClick={action.handler.bind(null, selectedEvents)}>{action.text}</button>}
                </header>
                {
                    !_.isEmpty(source) && this.renderEvents()
                }
            </div>
        </div>
    }
}

export default localize(Source)