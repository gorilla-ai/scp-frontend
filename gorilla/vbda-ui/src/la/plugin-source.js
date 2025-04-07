import _ from 'lodash'
import moment from 'moment'

const log = require('loglevel').getLogger('vbda/la/plugin-source')

function getNodeLabel({id, d:{names:nodeTypes, labels:nodeLabelIds}}, labels) {
    if (nodeLabelIds && nodeLabelIds.length > 0) {
        return _.map(nodeLabelIds, nodeLabelId=>{
            const label = labels[nodeLabelId]
            if (!label.type) { // no label
                return ''
            }
            if (label.localId.indexOf('@@')===0) { // label but no unique id
                return label.type
            }
            return `${label.localId} (${label.typeReadable})`
        }).join(', ')
    }
    return '' //`${nodeTypes.join(',')} ${id}`
}

function visualizeGraphItem(cfgs, labels, labelsCfg, item) {
    const {id, type, id1, id2, a1, a2, ...d} = item

    if (type==='node') {
        item = {id, type, d}
    }
    else {
        item = {id, type, id1, id2, a1, a2, d}
    }

    // prepend cfgs with base cfg
    if (item.type === 'node') {
        cfgs = [
            {
                c: (item) => {
                    if (!getNodeLabel(item, labels)) {
                        return '#aaaaaa'
                    }
                },
                u: (item) => {
                    const labelTypes = _.map(_.pick(labels, item.d.labels), 'type')
                    if (!_.isEmpty(labelTypes)) {
                        const labelType = _.first(labelTypes)
                        if (labelType) {
                            return labelsCfg[labelType].icon_url
                        }
                    }
                },
                t: (item) => getNodeLabel(item, labels)
            },
            ...cfgs
        ]
    }
    else {
        cfgs = [
            {
                dt:({d:{ts}}) => _.map(ts, t=>moment(t).valueOf())
            },
            ...cfgs
        ]
    }

    // get props as render source
    let {props, propsHistory, labels:labelIds, ...metadata} = item.d
    if (!props && propsHistory) {
        props = _.last(propsHistory).props
    }
    props = _.merge({}, metadata, props, ..._.map(_.pick(labels,labelIds),'props'))

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

    const finalVis = _.merge({}, ...allVis)

    return {
        ...item, ...finalVis
    }
}

export function generateGraph(nodes, links, {la:laCfg,labels:labelsCfg}, labels) {
    return _.map([..._.values(nodes), ..._.values(links)], item=>{
        const matchedProfiles = _.filter(laCfg, ({type, match})=>{
            if (type && item.type!==type) {
                return false
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

function matchIds(a, b, fullCoverage) {
    const jointCount = _.intersection(a, b).length
    if (fullCoverage) {
        return jointCount === b.length
    }
    return jointCount > 0
}

function bind(la) {
    let _source = {}
    let nodes = {}
    let links = {}
    let events = {}
    let labels = {}
    let items = []


    la.getItems = () => {
        return items
    }

    la.getSource = () => {
        return {
            nodes,
            links,
            labels,
            events
        }
    }

    la.setSource = (source, merge=false) => {
        if (!merge) {
            nodes = {}
            links = {}
            labels = {}
            events = {}
        }
        const {nodes:newNodes, links:newLinks, events:newEvents, labels:newLabels} = source
        nodes = {...nodes, ...newNodes}
        links = {...links, ...newLinks}
        events = {...events, ...newEvents}
        labels = {...labels, ...newLabels}
    }


    la.loadFromSource = ({cfg, selectedLabels}, onDone) => {
        const nodesToShow = _.pickBy(nodes, item=>{
            return matchIds(_.map(item.labels, i=>i+''), selectedLabels)
        })
        const linksToShow = _.pickBy(links, item=>{
            return nodesToShow[item.id1] && nodesToShow[item.id2]
        })

        items = generateGraph(nodesToShow, linksToShow, cfg, labels)

        la.load({type:'LinkChart', items}, onDone)
    }

    la.mergeFromSource = ({cfg}, onDone) => {
        items = generateGraph(nodes, links, cfg, labels)

        log.info('mergeSource:items after', items)
        la.merge(items, onDone)
    }

    la.filterSource = (labelFilter, dtFilter, options={}, onDone) => {
        
        const {showMissingLabels, ...chartOptions} = options
        let idsToShow = _.isArray(labelFilter) ? labelFilter : _.reduce(labels, (acc, item, id)=>{
            if (labelFilter(item.props)) {
                return [...acc, id]
            }
            return acc
        }, [])

        // deal with number<-->string type mismatch
        // TODO: handle it more gracefully
        la.filter(({d})=> {
            if ((!d.labels || d.labels.length<=0) && showMissingLabels) {
                return true
            }
            return matchIds(_.map(d.labels, i=>i+''), idsToShow)
        }, {type:'node', ...chartOptions}, onDone)
    }


    la.filterEvent = (filter, options={}, onDone) => {
        let idsToShow = _.reduce(events, (acc, item, id)=>{
            if (filter(item)) {
                return [...acc, id]
            }
            return acc
        }, [])

        // deal with number<-->string type mismatch
        // TODO: handle it more gracefully
        la.filter(({d})=>matchIds(_.map(d.events, i=>i+''), idsToShow), options, onDone)
    }

    la.filterLabel = (filter, options={}, onDone) => {
        const {showMissingLabels, ...chartOptions} = options
        let idsToShow = _.isArray(filter) ? filter : _.reduce(labels, (acc, item, id)=>{
            if (filter(item.props)) {
                return [...acc, id]
            }
            return acc
        }, [])

        // deal with number<-->string type mismatch
        // TODO: handle it more gracefully
        la.filter(({d})=>{
            if ((!d.labels || d.labels.length<=0) && showMissingLabels) {
                return true
            }
            return matchIds(_.map(d.labels, i=>i+''), idsToShow)
        }, {type:'node', ...chartOptions}, onDone)
    }

    la.getItemForSource = () => {

    }

    la.getSourceForItem = (ids) => {
        if (!_.isArray(ids)) {
            ids = [ids]
        }

        const selected = la.getItem(ids)
        const result = _(selected)
            .map('d')
            .reduce(
            (acc, d)=>{
                return {
                    events: d.events ? _.uniq([...acc.events, ...d.events]) : acc.events,
                    labels: d.labels ? _.uniq([...acc.labels, ...d.labels]) : acc.labels
                }
            },
                {events:[], labels:[]}
            )

        return result
    }

    la.hideSource = (ids, options={}, onDone) => {
        if (!_.isArray(ids)) {
            ids = [ids]
        }
        let itemsToHide = []
        la.each({}, ({d, id})=>{
            if (matchIds(d, ids)) {
                itemsToHide.push(id)
            }
        })

        la.hide(itemsToHide, options, onDone)
    }

    la.showSource = (ids, options={}, onDone) => {
        if (!_.isArray(ids)) {
            ids = [ids]
        }
        let itemsToShow = []
        la.each({}, ({d, id})=>{
            if (matchIds(d, ids)) {
                itemsToShow.push(id)
            }
        })

        la.show(itemsToShow, options, onDone)
    }

    la.removeSource = (ids) => {
        if (!_.isArray(ids)) {
            ids = [ids]
        }
        let itemsToRemove = []
        la.each({}, (item)=>{
            const {d, id} = item
            if (matchIds(ids, d, true)) {
                itemsToRemove.push(id)
            }
        })

        _source = _.omit(_source, ids)
        la.removeItem(itemsToRemove)
    }

    la.serializeWithSource = () => {
        const graph = la.serialize()
        return {
            events,
            labels,
            graph
        }
    }
}


export default bind