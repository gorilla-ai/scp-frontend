import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import $ from 'jquery'
import moment from 'moment'
import ReactDOMServer from 'react-dom/server'

import {PopupDialog} from 'react-ui'
import ReactLa from 'react-la'
import ReactLaWithTimeline from 'react-la/build/src/components/timeline'


import Node from './node'
import Link from './link'
import Events from './events'
import localize from '../../hoc/locale-provider'

const log = require('loglevel').getLogger('vbda/components/analysis/la')

const lt = global.vbdaI18n.getFixedT(null, 'analysis')
const gt = global.vbdaI18n.getFixedT(null, 'vbda')


const VIEW_SOURCE_BUTTON_ID = 'g-vbda-la-source-btn'


function getNodeLabel({id, names:nodeTypes, labels:nodeLabelIds}, labels) {
    if (nodeLabelIds && nodeLabelIds.length > 0) {
        return _.map(nodeLabelIds, nodeLabelId=>{
            const label = labels[nodeLabelId]
            if (!label.type) { // no label
                return ''
            }
            if (label.localId.indexOf('@@')===0) { // label but no unique id
                return label.typeReadable
            }
            return `${label.localId} (${label.typeReadable})`
        }).join(', ')
    }
    return '' //`${nodeTypes.join(',')} ${id}`
}

function visualizeGraphItem(cfgs, labels, labelsCfg, item) {
    const {id, type, id1, id2, a1, a2, ...d} = item

    // prepend cfgs with base cfg
    if (item.type === 'node') {
        const labelTypes = _(labels).pick(item.labels).map('type').compact().value()
        const labelText = getNodeLabel(item, labels)
        let defaultNodeCfg = {
            c: '#aaaaaa',
            popup: ReactDOMServer.renderToStaticMarkup(
                <Node nodeData={item} labelData={_.pick(labels, item.labels)} contentClassName='inline' />),
            t: labelText,
            enableViewEvents: false
        }

        if (!_.isEmpty(labelTypes)) {
            defaultNodeCfg.u = _.get(labelsCfg, [_.first(labelTypes), 'icon_url'])
        }

        cfgs = [
            defaultNodeCfg,
            ...cfgs
        ]
    }
    else {
        cfgs = [
            {
                popup: ReactDOMServer.renderToStaticMarkup(<Link data={item.propsHistory} />),
                dt: _.map(item.ts, t=>moment(t).valueOf())
            },
            ...cfgs
        ]
    }

    // get props as render source
    let {props, propsHistory, labels:labelIds, ...metadata} = d
    if (!props && propsHistory) {
        props = _.last(propsHistory).props
    }
    props = _.merge({}, metadata, props, ..._.map(_.pick(labels, labelIds), 'props'))

    // generate all visualization props for all cfgs
    const allVis = _.map(cfgs, (cfg) => {
        return _.reduce(cfg, (acc, v, k)=>{
            let newKey = k
            let newVal = v
            if (_.endsWith(k, 'Template')) {
                newKey = _.replace(k, /Template$/, '')
                newVal = _.template(v)(props)
            }
            else if (_.endsWith(k, 'Key')) {
                newKey = _.replace(k, /Key$/, '')
                newVal = _.get(props, v)
            }
            else if (_.isFunction(v)) {
                newVal = v(item, labels)
            }

            return {
                ...acc,
                [newKey]: newVal
            }
        }, {})
    })


    let result = _.merge(
        type==='node' ? {id, type, d} : {id, type, id1, id2, a1, a2, d},
        ...allVis
    )

    if (result.enableViewEvents) {
        result.popup = `<div>
            ${result.popup}
            <button id=${VIEW_SOURCE_BUTTON_ID} value=${item.events.join(',')}>${lt('btn-view-source')}</button>
        </div>`
    }

    delete result.enableViewEvents
    return result
}

export function generateGraph({source={}, labelsCfg={}, sourceItemOptions=[]}) {
    const {nodes={}, links={}, labels={}} = source

    return _.map([..._.values(nodes), ..._.values(links)], item=>{
        const matchedProfiles = _.filter(sourceItemOptions, ({type, match})=>{
            if (type && item.type!==type) {
                return false
            }
            if (_.isFunction(match)) {
                return match(item, labels)
            }
            return _.every(match, (v, k)=>{
                if (type==='node' && k==='labels') {
                    const {labels:nodeLabels} = item
                    const labelsToCheck = v
                    return _.some(nodeLabels, l=>_.includes(labelsToCheck, labels[l].type))
                }
                else if (type==='link' && k==='type') {
                    const {types:linkTypes} = item
                    return _.includes(linkTypes, v)
                }
                else {
                    return _.get(item, k)==v
                }
            })
        })

        return visualizeGraphItem(_.map(matchedProfiles, 'render'), labels, labelsCfg, item)
    })
}


class LaAnalysis extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        events: PropTypes.object,
        source: PropTypes.shape({
            labels: PropTypes.objectOf(PropTypes.shape({
                nodeId: PropTypes.string,
                props: PropTypes.object
            })),
            nodes: PropTypes.object,
            links: PropTypes.object
        }),
        sourceCfg: PropTypes.shape({
            dt: PropTypes.object
        }).isRequired,
        sourceItemOptions: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.oneOf(['node', 'link']),
            match: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
            props: PropTypes.object
        })),
        show: PropTypes.arrayOf(PropTypes.string),
        selected: PropTypes.arrayOf(PropTypes.string),
        onSelectionChange: PropTypes.func,
        hideSingletons: PropTypes.bool
    };

    static defaultProps = {
        events: {},
        source: {},
        sourceCfg: {},
        sourceItemOptions: []
    };

    constructor(props, context) {
        super(props, context);
        const {sourceCfg:{labels:labelsCfg={}}, sourceItemOptions, source, selected, show} = props
        const data = generateGraph({source, labelsCfg, sourceItemOptions})

        this.state = {
            data,
            show: this.labelIdsToItemIds(data, show),
            selected: this.labelIdsToItemIds(data, selected)
        };
    }

    componentDidMount() {
        $('body').on('click', `button#${VIEW_SOURCE_BUTTON_ID}`, evt => {
            this.showEvents(evt.target.value.split(','))
        })
    }

    componentWillReceiveProps(nextProps) {
        const {
            sourceCfg: {labels:labelsCfg={}}, sourceItemOptions, source, selected, show
        } = nextProps
        const {
            source: prevSource, selected: prevSelected, show: prevShow
        } = this.props

        let stateToUpdate = {}

        if (source !== prevSource) {
            log.info('componentWillReceiveProps::source changed', {prevSource, source})
            stateToUpdate.data = generateGraph({source, labelsCfg, sourceItemOptions})
        }

        if (show !== prevShow) {
            log.info('componentWillReceiveProps::show changed', {prevShow, show})
            stateToUpdate.show = this.labelIdsToItemIds(stateToUpdate.data || this.state.data, show)
        }
        if (selected !== prevSelected) {
            log.info('componentWillReceiveProps::selected changed', {prevSelected, selected})
            stateToUpdate.selected = this.labelIdsToItemIds(stateToUpdate.data || this.state.data, selected)
        }

        if (!_.isEmpty(stateToUpdate)) {
            this.setState(stateToUpdate)
        }
    }

    componentWillUnmount() {
        $('body').off('click', `button#${VIEW_SOURCE_BUTTON_ID}`)
    }

    labelIdsToItemIds = (data, labelIds) => {
        if (!labelIds) {
            return null
        }
        return _(data)
            .filter(item=>item.type==='node'&&_.intersection(labelIds, item.d.labels).length>0)
            .map('id')
            .value()
    };

    handleSelectionChange = (selected, eventInfo) => {
        const {onSelectionChange} = this.props
        if (!onSelectionChange) {
            this.setState({selected})
        }
        else {
            onSelectionChange(selected, eventInfo)
        }
    };

    showEvents = (eventIds) => {
        const {events, sourceCfg:eventsCfg} = this.props
        const nodeEvents = _.pick(events, eventIds)
        PopupDialog.alertId(
            'g-vbda-la-source-container',
            {
                title: lt('hdr-source'),
                display: <Events
                    events={nodeEvents}
                    eventsCfg={eventsCfg} />,
                confirmText: gt('btn-close')
            }
        )
    };

    resize = () => {
        const {timebar:{enabled:enableTimebar}={}} = this.props
        if (enableTimebar) {
            this.containerNode.resize()
        }
        else {
            this.containerNode._component._component._component._component.resize()
        }
    };

    render() {
        const {className, timebar:{enabled:enableTimebar}={}} = this.props
        const {data, show, selected} = this.state

        const propsToPass = _.omit(this.props, ['events', 'source', 'sourceCfg', 'sourceItemOptions'])
        const defaultProps = enableTimebar ? {showStatic:true, layoutOnPlay:'tweak', layoutOnFilter:true} : {}
        const La = enableTimebar ? ReactLaWithTimeline : ReactLa

        return <La
            {...defaultProps}
            {...propsToPass}
            ref={ref=>{this.containerNode = ref}}
            //layoutOnFilter
            //snaOnFilter
            className={cx('grow c-vbda-analysis-la', className)}
            items={data}
            show={show}
            selected={selected}
            onSelectionChange={this.handleSelectionChange} />
    }
}

export default localize(LaAnalysis)