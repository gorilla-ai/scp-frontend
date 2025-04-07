import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import moment from 'moment'
import $ from 'jquery'
import ReactDOMServer from 'react-dom/server'

import {PopupDialog} from 'react-ui'
import ReactGis from 'react-gis'
import ReactGisWithTimeline from 'react-gis/build/src/components/timeline'


import Node from './node'
import Events from './events'
import localize from '../../hoc/locale-provider'

const log = require('loglevel').getLogger('vbda/components/analysis/gis')

const lt = global.vbdaI18n.getFixedT(null, 'analysis')
const gt = global.vbdaI18n.getFixedT(null, 'vbda')

const VIEW_SOURCE_BUTTON_ID = 'g-vbda-gis-source-btn'
const LAYOUTS = ['standard', 'track', 'heatmap', 'contour']


function mergeProps(cfgs, label, snapshot, location) {
    // generate all visualization props for all cfgs
    const allVis = _.map(cfgs, (cfg) => {
        return _.reduce(cfg, (acc, v, k)=>{
            let newKey = k
            let newVal = v
            if (_.endsWith(k, 'Template')) {
                newKey = _.replace(k, /Template$/, '')
                newVal = _.template(v)({label, snapshot, location})
            }
            else if (_.endsWith(k, 'Key')) {
                newKey = _.replace(k, /Key$/, '')
                newVal = _.get({label, snapshot, location}, v)
            }
            else if (_.isFunction(v)) {
                newVal = v(label, snapshot, location)
            }

            return {
                ...acc,
                [newKey]: newVal
            }
        }, {})
    })

    return _.merge({}, ...allVis)
}

function getSymbolLabel({type, typeReadable, localId}) {
    if (!type) { // no label
        return ''
    }
    if (localId.indexOf('@@')===0) { // label but no unique id
        return typeReadable
    }
    return `${localId} (${typeReadable})`
}

function visualizeGraphItem(cfgs, labelsCfg, isTrack, item) {
    const {id:labelId, history, type:labelType} = item
    const iconUrl = _.get(labelsCfg, [labelType, 'icon_url'])
    const defaultLabel = getSymbolLabel(item)

    if (isTrack) {
        cfgs = [
            {
                type: 'marker',
                id: (label, snapshot)=>`${labelId}__${snapshot.event}`,
                //label: defaultLabel,
                tooltip: defaultLabel,
                popup: (label, {propsReadable, lPropsReadable, track, images})=>ReactDOMServer.renderToStaticMarkup(<Node
                    nodeData={{propsReadable:{...propsReadable, [lt('lbl-time')]:track.datetime?moment(track.datetime).format('YYYY-MM-DD HH:mm:ss'):null}, images}}
                    labelData={{[labelId]:{propsReadable:lPropsReadable}}} 
                    contentClassName='inline' />),
                icon: iconUrl ? {
                    iconUrl
                } : undefined,
                enableViewEvents: false,
                track: labelId,
                ts: (label, {track})=> { return track.datetime ? moment(track.datetime).valueOf() : null },
                data: (label, {event, tags}) => ({
                    labelId,
                    labelType,
                    event,
                    tags
                })
            },
            ...cfgs
        ]
    }
    else {
        cfgs = [
            {
                type: 'marker',
                id: (label, {event}, location) => `${label.id}__${event}__${location.type}`,
                label: defaultLabel,
                //tooltip: defaultLabel,
                popup: (label, {propsReadable, lPropsReadable, images})=>ReactDOMServer.renderToStaticMarkup(<Node
                    nodeData={{propsReadable, images}}
                    labelData={{[labelId]:{propsReadable:lPropsReadable}}} 
                    contentClassName='inline' />),
                icon: iconUrl ? {
                    iconUrl
                } : undefined,
                enableViewEvents: false,
                group: '__base__',
                cluster: labelType,
                data: (label, {event, tags}, location) => ({
                    labelId,
                    labelType,
                    event,
                    locationType: location.type,
                    tags
                })
            },
            ...cfgs
        ]
    }

    let symbols = []
    _.forEach(history, (snapshot)=>{
        const {locations=[], track={}} = snapshot

        if (isTrack && track && track.location) {
            const latlng = _.values(track.location)
            if (!latlng) {
                return
            }
            const computedProps = mergeProps(cfgs, item, snapshot)

            symbols.push({
                latlng,
                ...computedProps
            })
        }
        else if (!isTrack && locations && locations.length > 0) {
            _.forEach(locations, (location)=>{
                const computedProps = mergeProps(cfgs, item, snapshot, location)
                symbols.push({
                    latlng: [location.latitude, location.longitude],
                    ...computedProps
                })
            })
        }
    })

    _.forEach(symbols, symbol=>{
        if (symbol.enableViewEvents) {
            symbol.popup = `<div>
                ${symbol.popup}
                <button id=${VIEW_SOURCE_BUTTON_ID} value=${symbol.data.event}>${lt('btn-view-source')}</button>
            </div>`
        }
        //delete symbol.enableViewEvents
    })
    return symbols
}


export function generateGraph({source={}, labelsCfg={}, sourceSymbolOptions=[], isTrack=false}) {
    return _.flatten(_.map(source, (item, labelId)=>{
        const matchedProfiles = _.filter(sourceSymbolOptions, ({match})=>{
            if (_.isFunction(match)) {
                return match(item)
            }
            return _.every(match, (v, k)=>{
                if (k==='labels') {
                    return _.includes(v, item.type)
                }
                else {
                    return _.get(item, k)==v
                }
            })
        })

        return visualizeGraphItem(
            _.map(matchedProfiles, 'props'),
            labelsCfg,
            isTrack,
            {id:labelId, ...item}
        )
    }))
}


class GisAnalysis extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        events: PropTypes.object,
        source: PropTypes.object,
        sourceCfg: PropTypes.shape({
            dt: PropTypes.object
        }).isRequired,
        sourceSymbolOptions: PropTypes.arrayOf(PropTypes.shape({
            match: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
            props: PropTypes.object
        })),
        clusterOptions: PropTypes.array,
        layouts: PropTypes.arrayOf(PropTypes.oneOf(LAYOUTS)),
        layout: PropTypes.oneOf(LAYOUTS),
        onLayoutChange: PropTypes.func,
        layers: PropTypes.objectOf(
            PropTypes.shape({
                label: PropTypes.node,
                events: PropTypes.object,
                source: PropTypes.object,
                data: PropTypes.array
            })
        ),
        show: PropTypes.arrayOf(PropTypes.string),
        selected: PropTypes.arrayOf(PropTypes.string),
        onSelectionChange: PropTypes.func
    };

    static defaultProps = {
        events: {},
        source: {},
        sourceCfg: {},
        sourceSymbolOptions: [],
        layouts: LAYOUTS,
        layers: {}
    };

    constructor(props, context) {
        super(props, context);
        const {sourceCfg:{labels:labelsCfg}, source, sourceSymbolOptions, selected, show, layout, layouts, layers} = props
        const isTrack = (layout || _.first(layouts)) === 'track'
        const data = generateGraph({source, labelsCfg, sourceSymbolOptions, isTrack})

        this.state = {
            data,
            isTrack,
            show: this.labelIdsToSymbolIds(data, show, isTrack),
            selected: this.labelIdsToSymbolIds(data, selected, isTrack) || [],
            layers: _.mapValues(layers, (layer)=>{
                if (layer.source) {
                    return {
                        label: layer.label,
                        data: generateGraph({source:layer.source, labelsCfg, sourceSymbolOptions, isTrack})
                    }
                }
                return layer
            })
        };
    }

    componentDidMount() {
        $('body').on('click', `button#${VIEW_SOURCE_BUTTON_ID}`, evt => {
            this.showEvents([evt.target.value])
        })
    }

    componentWillReceiveProps(nextProps) {
        const {
            sourceCfg: {labels:labelsCfg}, source, sourceSymbolOptions,
            selected, show, layout, layers
        } = nextProps
        const {
            selected: prevSelected, show: prevShow, source: prevSource,
            layout: prevLayout, layers: prevLayers
        } = this.props

        const isTrack = layout ? layout==='track' : this.state.isTrack
        const wasTrack = this.state.isTrack

        let stateToUpdate = {}
        if (isTrack !== wasTrack) {
            stateToUpdate.isTrack = isTrack
        }

        if (source !== prevSource || isTrack !== wasTrack) {
            log.info('componentWillReceiveProps::source/isTrack changed', {prevSource, source, prevLayout, isTrack})
            stateToUpdate.data = generateGraph({source, labelsCfg, sourceSymbolOptions, isTrack})
            log.info('end', stateToUpdate.data)
        }

        if (show !== prevShow) {
            log.info('componentWillReceiveProps::show changed', {prevShow, show})
            stateToUpdate.show = this.labelIdsToSymbolIds(stateToUpdate.data || this.state.data, show, isTrack)
        }
        if (selected !== prevSelected) {
            log.info('componentWillReceiveProps::selected changed', {prevSelected, selected})
            stateToUpdate.selected = this.labelIdsToSymbolIds(stateToUpdate.data || this.state.data, selected, isTrack) || []
        }

        if (layers !== prevLayers) {
            log.info('componentWillReceiveProps::layers changed', {layers, prevLayers})
            const newLayers = _.mapValues(layers, (layer, layerId)=>{
                const prevLayer = prevLayers[layerId]
                if (!prevLayer || layer.source !== prevLayer.source || layer.data !== prevLayer.data) {
                    // update layer data from new source/data
                    if (layer.source) {
                        return {
                            label: layer.label,
                            data: generateGraph({source:layer.source, labelsCfg, sourceSymbolOptions, isTrack})
                        }
                    }
                    return layer
                }
                else { // layer not changed, use existing layer from state
                    return this.state.layers[layerId]
                }
            })
            stateToUpdate.layers = newLayers
        }

        if (!_.isEmpty(stateToUpdate)) {
            this.setState(stateToUpdate)
        }
    }

    componentWillUnmount() {
        $('body').off('click', `button#${VIEW_SOURCE_BUTTON_ID}`)
    }

    labelIdsToSymbolIds = (data, labelIds, isTrack) => {
        if (!labelIds) {
            return null
        }
        const symbolsIds = _(data)
                .filter(item=>_.includes(labelIds, item.data.labelId))
                .map('id')
                .value()

        return isTrack ? [...labelIds, ...symbolsIds] : symbolsIds
    };

    handleLayoutChange = (layout, eventInfo) => {
        const {onLayoutChange} = this.props
        const {before:prevLayout} = eventInfo

        if ((layout==='track' || prevLayout==='track') && !_.has(this.props, 'layout')) { // uncontrolled
            const {sourceCfg:{labels:labelsCfg}, source, sourceSymbolOptions, selected, show} = this.props
            const isTrack = layout==='track'
            const data = generateGraph({source, labelsCfg, sourceSymbolOptions, isTrack})
            this.setState({
                data,
                isTrack,
                show: this.labelIdsToSymbolIds(data, show, isTrack),
                selected: this.labelIdsToSymbolIds(data, selected, isTrack) || []
            })
        }

        if (onLayoutChange) {
            onLayoutChange(layout, eventInfo)
        }
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
            'g-vbda-gis-source-container',
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
        const {
            className, timebar:{enabled:enableTimebar}={}, 
            clusterOptions=[], heatmapOptions={}, sourceCfg:{labels:labelsCfg},
            defaultIcon
        } = this.props
        const {data, show, selected, layers} = this.state

        const propsToPass = _.omit(this.props, ['events', 'source', 'sourceCfg', 'sourceSymbolOptions'])
        const defaultProps = enableTimebar ? {showStatic:true} : {}
        
        const Gis = enableTimebar ? ReactGisWithTimeline : ReactGis

        const defaultLabelsClusterOptions = {
            props: {
                spiderfyOnMaxZoom: false,
                showListOnClick: {
                    enabled:true,
                    formatter:({enableViewEvents, label, data})=>{
                        const labelText = _.get(label, 'content')
                        if (!labelText) {
                            return undefined
                        }
                        else {
                            return <div className='c-flex aic jcsb'>
                                {labelText}
                                {enableViewEvents && <button className='standard button fg fg-eye' id={VIEW_SOURCE_BUTTON_ID} value={data.event} />}
                                </div>
                        }
                    }
                },
                symbol: {
                    type: 'marker',
                    icon: ({data:{cluster}})=>{
                        return {
                            iconUrl: _.get(labelsCfg, [cluster, 'icon_url'], defaultIcon),
                            iconSize: [30, 30],
                            iconAnchor: [15, 15]
                        }
                    },
                    label: ({data:{cluster, count}})=>{
                        return `${count} ${_.get(labelsCfg, [cluster, 'display_name'], cluster)}`
                    }
                }
            }
        }
        const defaultHeatmapOptions = {
            legend: {
                enabled: true
            }
        }
        return <Gis
            {...defaultProps}
            {...propsToPass}
            ref={ref=>{this.containerNode = ref}}
            className={cx('grow c-vbda-analysis-gis', className)}
            clusterOptions={[
                defaultLabelsClusterOptions,
                ...clusterOptions
            ]}
            heatmapOptions={{
                ...defaultHeatmapOptions,
                ...heatmapOptions
            }}
            data={data}
            show={show}
            selected={selected}
            onSelectionChange={this.handleSelectionChange}
            layers={layers}
            onLayoutChange={this.handleLayoutChange} />
    }
}

export default localize(GisAnalysis)