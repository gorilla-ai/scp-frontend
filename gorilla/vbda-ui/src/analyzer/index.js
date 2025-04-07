import _ from 'lodash'

const log = require('loglevel').getLogger('vbda/analyzer')

function resolveProps(props) {
    return _.merge({}, ...props).props
}

function parseGeo(locationCfg, event, base) {
    const geoType = locationCfg.type
    let latitude, longitude
    if (geoType === 'geo_point') {
        latitude = Number(getPropFromRef(event, locationCfg.latitude, base))
        longitude = Number(getPropFromRef(event, locationCfg.longitude, base))
    }
    else if (geoType === 'geo_address' || geoType==='geo_point_raw') {
        const coordinate = getPropFromRef(event, locationCfg.coordinate, base)
        if (coordinate && coordinate.indexOf(',') > 0) {
            const [c1, c2] = coordinate.split(',')
            if (Number(_.trim(c1))+''===_.trim(c1)) {
                latitude = Number(c1)
            }
            if (Number(_.trim(c2))+''===_.trim(c2)) {
                longitude = Number(c2)
            }
        }
    }


    if (latitude==null || longitude==null || isNaN(latitude) || isNaN(longitude)) {
        return null
    }
    if ((latitude===0 && longitude===0) || (latitude===1 && longitude===1)) {
        return null
    }

    return {
        latitude,
        longitude
    }
}

function getPropsFromCfg(cfg, event, base) {
    log.debug('getPropsFromCfg::start', {event, cfg, base})
    const result = _.reduce(cfg, (acc, p, name)=>{
        let val
        if (p.reference) {
            val = getPropFromRef(event, p.reference, base)
        }
        if (val==null) {
            val = p.value
        }
        if (val==='' || val==null) {
            return acc
        }
        return {
            ...acc,
            [name]: val
        }
    }, {})
    log.debug('getPropsFromCfg::end', result)
    return result
}

function getPropFromRef(originalEvent, ref, base, isFile=false) {
    let event = originalEvent
    if (base && base.ref && base.ref.length>0 && ref.join('.').indexOf(base.ref.join('.'))===0) {
        event = _.get(originalEvent, base.path)
        ref = _.slice(ref, base.ref.length)
    }

    const paths = getEventPropPaths(event, ref)
    let result = _(paths)
        .map(path=>{
            return _.get(event, path)
        })
        .filter(item=>item!=null && item!=='')
        .value()

    if (result.length <= 0) {
        result = null
    }
    else {
        if (isFile) {
            result = _.reduce(result, (acc, item)=>{
                if (_.isEmpty(item)) {
                    return acc
                }

                const uuids = _.isArray(item) ? item : [item]
                const filePaths = _(uuids).map(uuid=>_.get(_.find(originalEvent.__fileInfo, {uuid}), 'fileServerPath')).compact().value()
                return [...acc, ...filePaths]
            }, [])
        }

        if (result.length === 1) {
            result = result[0]
        }
    }

    return result
}


function getEventPropPaths(event, segments) {
    let workingPath = []
    let explodeBasePath = []
    let explodedRelPaths = []
    _.forEach(segments, segment=>{
        workingPath = [...workingPath, segment]
        explodeBasePath = [...explodeBasePath, segment]
        const subEvent = _.get(event, workingPath)
        if (_.isArray(subEvent)) {
            explodedRelPaths.push(_.map(_.range(subEvent.length), index=>[...explodeBasePath, index]))
            explodeBasePath = []
        }
    })
    if (explodeBasePath.length > 0) {
        explodedRelPaths.push([explodeBasePath])
    }

    const explodedPaths = _.reduce(explodedRelPaths, (a, b) => {
        return _.flatten(_.map(a, (x) => {
            return _.map(b, (y) => {
                return _.flatten(x.concat([y]))
            })
        }), false)
    }, [[]])

    return explodedPaths
}


function getBaseRef(event, nodeCfg, labelsCfg) {
    // find the first label having unique property, this property will decide how to split the nodes
    const {properties:propsCfg, labels:nodeLabelsCfg} = nodeCfg
    let ref = null

    _.some(nodeLabelsCfg, cfg=>{
        const {label_name, conditions, properties} = cfg
        const globalLabelCfg = labelsCfg[label_name]

        if (!globalLabelCfg) {
            return false
        }

        const uniqueProp = properties[globalLabelCfg.unique_property]

        if (!uniqueProp) {
            return false
        }

        const uniquePropVal = getPropFromRef(event, uniqueProp.reference)
        if (uniquePropVal == null) {
            return false
        }
/*
        if (conditions) {
            const eventHasLabel = _.every(conditions, c=>{
                const res = getPropFromRef(event, c.reference)
                log.info('condition xxxxxxxxxx', res, c.value)
                return res === c.value
            })

            if (!eventHasLabel) {
                return false
            }
        }*/

        ref = _.initial(uniqueProp.reference)
        return true
    })

    return ref
}

function explodeNodeCfgs(event, nodeSetCfg, labelsCfg) {
    log.debug('explodeNodeCfgs::start', event, nodeSetCfg)
    const segments = getBaseRef(event, nodeSetCfg, labelsCfg)

    const explodedPaths = getEventPropPaths(event, segments)

    log.debug('explodeNodeCfgs::explodedPaths', explodedPaths)

    const explodedNodeCfgs = _.map(explodedPaths, p=>{
        return {
            base: {
                ref: segments,
                path: p
            },
            ...nodeSetCfg
        }
    })
    log.debug('explodeNodeCfgs::end', explodedNodeCfgs)
    return explodedNodeCfgs
}


// base is mutable (if supplied)
export function analyze(source, {dt:dtCfg, labels:labelsCfg}, options={}) {
    log.debug('analyze::start', {source, dtCfg, labelsCfg, options})
    const {
        base={},
        tags=[],
        analyzeGis=true,
        analyzeLinks=true,
        propsResolver={},
        ignoreSingletonNodes=false,
        labelIds: labelIdsToAnalyze=undefined,
        labelTypes: labelTypesToAnalyze=undefined,
        locationTypes: locationTypesToAnalyze=undefined,
        imagePrefix=''
    } = options

    if (!_.isEmpty(labelTypesToAnalyze)) {
        labelsCfg = _.pick(labelsCfg, labelTypesToAnalyze)
    }

    let {nodes={}, links={}, labels={}} = base

    let nodesPropsHistory = {}
    let labelsPropsHistory = {}

    _.forEach(source, (event, eid)=>{
        const { __data_type:dtId, __data_source:dsId} = event

        if (!dtCfg[dtId]) {
            log.warn(`analyze::analysis of event ${eid} skipped, data type ${dtId} not configured`)
            return
        }
        if (dtCfg[dtId].ds !==dsId) {
            log.error(`analyze::analysis of event ${eid} skipped, event data source ${dsId} does not match with data source ${dtCfg[dtId].ds} for data type ${dtId} in config`)
            return
        }


        let {
            nodes: nodeSetsCfg, relationships: linksCfg,
            representative_time: tsCfg, geo: locationsCfg/*, geo_points:locationsCfg*/
        } = dtCfg[dtId]

        if (!_.isEmpty(locationTypesToAnalyze)) {
            locationsCfg = _.pick(locationsCfg, locationTypesToAnalyze)
        }

        const nodeTs = _.get(event, tsCfg)

        let nodeNameToIds = {}

//log.debug('analyze::analyze node::start')
        _.forEach(nodeSetsCfg, (nodeSetCfg, nodeName)=>{
            const {description} = nodeSetCfg

            const nodesCfg = explodeNodeCfgs(event, nodeSetCfg, labelsCfg)
            let nodeIds = []

            _.forEach(nodesCfg, nodeCfg=>{
                const {base, properties:nodePropsCfg, labels:nodeLabelsCfg, locations:nodeLocationsCfg, track:nodeTrackCfg, images:nodeImagesCfg} = nodeCfg

                const nProps = getPropsFromCfg(nodePropsCfg, event, base)
                const nPropsReadable = _.mapKeys(nProps, (v, k)=>nodePropsCfg[k].display_name || k)

                let lProps = {}
                let lPropsReadable = {}

                let labelIds = _.uniq(_.reduce(nodeLabelsCfg, (acc, labelCfg)=>{
                    const {label_name, conditions, properties:labelPropsCfg} = labelCfg

                    const globalLabelCfg = labelsCfg[label_name]

                    if (!globalLabelCfg) {
                        return acc
                    }

                    if (!conditions || _.every(conditions, c=>getPropFromRef(event, c.reference, base)==c.value)) {
                        // generate label props
                        const labelProps = getPropsFromCfg(labelPropsCfg, event, base)

                        if (_.isEmpty(labelProps)) {
                            return acc
                        }

                        const labelId = `${label_name}__${_.get(labelProps, globalLabelCfg.unique_property, `@@${_.size(nodes)}`)}`

                        if (!_.isEmpty(labelIdsToAnalyze) && !_.includes(labelIdsToAnalyze, labelId)) {
                            return acc
                        }

                        const labelPropsReadable = _.mapKeys(labelProps, (v, k)=>_.get(globalLabelCfg, ['properties', k, 'display_name'], k))

                        lProps[labelId] = labelProps
                        lPropsReadable[labelId] = labelPropsReadable

                        return [...acc, labelId]
                    }
                    return acc
                }, []))

                // retrieve all images as single layer array
                const images = _.isEmpty(nodeImagesCfg) ? [] : _(nodeImagesCfg)
                    .reduce((acc, imageCfg)=>{
                        const retrievedImages = getPropFromRef(event, imageCfg, base, true)
                        if (_.isEmpty(retrievedImages)) {
                            return acc
                        }
                        if (_.isArray(retrievedImages)) {
                            return [
                                ...acc,
                                ..._.map(retrievedImages, img=>`${imagePrefix}/${img}`)
                            ]
                        }
                        return [
                            ...acc,
                            `${imagePrefix}/${retrievedImages}`
                        ]
                    }, [])

                // do not create node if no node props or label props
                if (_.isEmpty(nProps) && _.isEmpty(lProps) && _.isEmpty(images)) {
                    log.debug('analyze::missing props: no node created', {event, nodeSetsCfg, nodeCfg})
                    return
                }

                if (_.isEmpty(labelIds)) {
                    if (ignoreSingletonNodes) {
                        log.warn('analyze::no labels: no node created', {event, nodeSetsCfg, nodeCfg})
                        return
                    }
                    labelIds = [`__${_.size(nodes)}`]
                }


                let locations = null
                let track = null
                if (analyzeGis) {
                // process node locations
                    locations = _.isEmpty(nodeLocationsCfg) ? null : _.reduce(nodeLocationsCfg, (acc, key)=>{
                        const locationCfg = locationsCfg[key]

                        if (!locationCfg) {
                            return acc
                        }

                        const latlng = parseGeo(locationCfg, event, base)

                        if (!latlng) {
                            return acc
                        }

                        return [...acc, {
                            type: key,
                            ...latlng
                        }]
                    }, [])

                    // process node track
                    if (!_.isEmpty(nodeTrackCfg)) {
                        const locationCfg = locationsCfg[nodeTrackCfg.location]
                        if (locationCfg) {
                            const latlng = parseGeo(locationCfg, event, base)
                            if (latlng) {
                                track = {
                                    datetime: getPropFromRef(event, nodeTrackCfg.datetime, base),
                                    location: latlng
                                }
                            }
                        }
                    }
                }


                let nodeId = null

                // find node id from an existing label (if exists)
                _.some(labelIds, (labelId)=>{
                    let existingLabel = labels[labelId]
                    if (existingLabel && existingLabel.nodeId) {
                        nodeId = existingLabel.nodeId
                        return true
                    }
                    return false
                })

                if (!nodeId) {
                    nodeId = _.size(nodes)+''
                    log.debug('analyze::create new node', nodeId)
                    nodes[nodeId] = {
                        type: 'node',
                        id: nodeId,
                        names: [],
                        labels: [],
                        events: [],
                        tags: []
                    }
                }

                if (!nodesPropsHistory[nodeId]) {
                    nodesPropsHistory[nodeId] = []
                }

                const nodeToUpdate = nodes[nodeId]
                _.assign(nodeToUpdate, {
                    names: _.uniq([...nodeToUpdate.names, nodeName]),
                    images,
                    locations,
                    track,
                    labels: _.uniq([...nodeToUpdate.labels, ...labelIds]),
                    events: _.uniq([...nodeToUpdate.events, eid]),
                    tags: _.uniq([...nodeToUpdate.tags, ...tags])
                })

                nodesPropsHistory[nodeId].push({
                    nodeName,
                    dt: dtId,
                    event: eid,
                    ts: nodeTs,
                    props: nProps,
                    propsReadable: nPropsReadable
                })


                // update labels
                _.forEach(labelIds, labelId=>{
                    const [labelType, ...localId] = labelId.split('__')
                    if (!labels[labelId]) {
                        labels[labelId] = {
                            id: labelId,
                            type: labelType,
                            typeReadable: labelType ? labelsCfg[labelType].display_name || labelType : '',
                            localId: localId.join('__'),
                            tags: []
                        }
                    }

                    if (!labelsPropsHistory[labelId]) {
                        labelsPropsHistory[labelId] = []
                    }

                    labels[labelId].nodeId = nodeId
                    labels[labelId].tags = _.uniq([...labels[labelId].tags, ...tags])
                    labelsPropsHistory[labelId].push({
                        nodeName,
                        dt: dtId,
                        event: eid,
                        label: labelId,
                        ts: nodeTs,
                        props: lProps[labelId],
                        propsReadable: lPropsReadable[labelId]
                    })
                })


                nodeIds.push(nodeId)
            })


            nodeNameToIds[nodeName] = nodeIds
        })

        if (analyzeLinks) {
//log.debug('analyze::analyze link::start')

            _.forEach(linksCfg, (linkCfg, linkName)=>{
                const {
                    description, conditions, node_a, node_b,
                    directions: directionsCfg,
                    type, display_name, properties, representative_time
                } = linkCfg

                const linkTs = _.get(event, representative_time)

                if (!conditions || _.every(conditions, c=>_.get(event, c.reference)==c.value)) {
                    const id1s = nodeNameToIds[node_a]
                    const id2s = nodeNameToIds[node_b]

                    _.forEach(id1s, id1=>{
                        _.forEach(id2s, id2=>{
                            const sortedNodeIds = [id1, id2].sort()

                            const linkId = `${sortedNodeIds[0]}-${sortedNodeIds[1]}-${type}`
                            const rProps = getPropsFromCfg(properties, event)
                            const rPropsReadable = _.mapKeys(rProps, (v, k)=>properties[k].display_name || k)
                            const linkProp = {
                                event: eid,
                                ts: linkTs,
                                a1: false,
                                a2: false,
                                type,
                                typeReadable: display_name || type,
                                props: rProps,
                                propsReadable: rPropsReadable
                            }

                            if (!links[linkId]) {
                                links[linkId] = {
                                    type: 'link',
                                    id: linkId,
                                    id1,
                                    id2,
                                    a1: false,
                                    a2: false,
                                    types: [],
                                    events: [],
                                    ts: [],
                                    propsHistory: [],
                                    tags: []
                                }
                            }

                            const linkToUpdate = links[linkId]

                            const directions = _.uniq(_.reduce(directionsCfg, (acc, directionCfg)=>{
                                const {conditions:dirConditions, value:dirValue} = directionCfg
                                if (!dirConditions || _.every(dirConditions, c=>_.get(event, c.reference)==c.value)) {
                                    return [...acc, dirValue]
                                }
                                return acc
                            }, []))

                            if (
                                _.includes(directions, 3) ||
                                _.includes(directions, 1)
                            ) {
                                linkProp.a2 = true
                                linkToUpdate.a2 = true
                            }
                            if (
                                _.includes(directions, 3) ||
                                _.includes(directions, 2)
                            ) {
                                linkProp.a1 = true
                                linkToUpdate.a1 = true
                            }

                            _.assign(linkToUpdate, {
                                propsHistory: [...linkToUpdate.propsHistory, linkProp],
                                ts: _.compact(_.uniq([...linkToUpdate.ts, linkTs])),
                                types: _.uniq([...linkToUpdate.types, type]),
                                events: _.uniq([...linkToUpdate.events, eid]),
                                tags: _.uniq([...linkToUpdate.tags, ...tags])
                            })
                        })
                    })
                }
            })
        }
    })

    log.debug('==========cleaning up nodes/links==========', nodes, links)
    _.forEach(nodes, (node, nodeId)=>{
        if (node.labels.length > 0) {
            // remove labels from node if it does not match with the nodeId defined in labels
            // this will happen when two nodes are linked to same label, then latest node is used to represent the label
            node.labels = _.filter(node.labels, labelId=>{
                return labels[labelId].nodeId === nodeId
            })

            // if after clean up, no labels are left, remove this node
            if (node.labels.length <= 0) {
                log.debug(`deleting node ${nodeId}`)
                delete nodes[nodeId]
                delete nodesPropsHistory[nodeId]
            }
        }
    })
    _.forEach(links, (link, linkId)=>{
        const {id1, id2, propsHistory} = link
        if (!nodes[id1] || !nodes[id2]) {
            log.debug(`deleting link ${linkId}`)
            delete links[linkId]
        }
        else {
            // post-process link props
            links[linkId].propsHistory = _.orderBy(propsHistory, 'ts')
        }
    })

    log.debug('==========resolving props==========')
    const propsHistory = {
        nodes: nodesPropsHistory,
        labels: labelsPropsHistory
    }
    const allEntities = {
        nodes, labels
    }
    _.forEach(['node', 'label'/*, 'link'*/], type=>{
        _.forEach(propsHistory[type+'s'], (propsList, id)=>{
            const resolveFn = propsResolver[type]
            let resolvedProps
            if (resolveFn) {
                resolvedProps = resolveFn(propsList)
            }
            else {
                resolvedProps = _(propsList)
                    .groupBy('event')
                    .map(items=>_.merge({}, ...items))
                    .last()
            }
            allEntities[type+'s'][id].props = _.merge(allEntities[type+'s'][id].props||{}, resolvedProps.props)
            allEntities[type+'s'][id].propsReadable = _.merge(allEntities[type+'s'][id].propsReadable||{}, resolvedProps.propsReadable)
            log.debug(`resolving ${type} props`, id, propsList, resolvedProps)
        })
    })


    const result = {
        nodes,
        links,
        labels
    }

    log.debug('analyze::end', result)
    return result
}

export function analyzeTrack(source, cfg, labelId) {
    const result = analyzeLabels(
        source,
        cfg,
        {labelIds:[labelId], ignoreMissingTrack:true}
    )[labelId]
    return result
}

export function analyzeLabels(source, cfg, options={}) {
    log.info('analyzeLabels::start', {source, cfg, options})

    const {
        ignoreMissingTrack=false,
        ignoreMissingLocations=false,
        filter,
        base={},
        tags=[],
        ...otherOptions
    } = options

    const list = _.mapValues(source, (event, eid) => {
        return analyze({[eid]:event}, cfg, {analyzeLinks:false, ...otherOptions})
    })

    let result = _.clone(base)

    log.info('analyzeLabels::list', list)
    _.forEach(list, ({nodes, labels}, eventId) => {
        _.forEach(nodes, node=>{
            const {labels:nodeLabelIds, props:nodeProps, propsReadable:nodePropsReadable, track, images, locations} = node
            _.forEach(nodeLabelIds, labelId=>{
                if (ignoreMissingTrack && _.isEmpty(track)) {
                    return
                }
                if (ignoreMissingLocations && _.isEmpty(locations)) {
                    return
                }

                const {type, typeReadable, localId, props:lProps, propsReadable:lPropsReadable} = labels[labelId]

                const labelHistoryItem = {
                    props: nodeProps,
                    propsReadable: nodePropsReadable,
                    lProps,
                    lPropsReadable,
                    event: eventId,
                    images,
                    locations,
                    track,
                    tags
                }
                if (filter && !filter(labelHistoryItem)) {
                    return
                }

                if (!result[labelId]) {
                    result[labelId] = {
                        type,
                        typeReadable,
                        localId,
                        history: [],
                        tags: []
                    }
                }

                result[labelId].tags = _.uniq([...result[labelId].tags, ...tags])
                result[labelId].history.push(labelHistoryItem)
            })
        })
    })

    log.info('analyzeLabels::end', result)
    return result
}

export default {
    analyze,
    analyzeLabels,
    analyzeTrack
}