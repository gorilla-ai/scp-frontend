import _ from 'lodash'
import im from 'object-path-immutable'
import Promise from 'bluebird'

import ah from 'react-ui/build/src/utils/ajax-helper'

let log = require('loglevel').getLogger('vbda/loader/config')

let CFG_API_PREFIX = '/api/configurations'

const DT_ORDERS = [
    'monitor',
    'p_geo',
    'smartpatrol',
    'hotspot',
    'terminal',
    'account',
    'calllog',
    'chat',
    'email',
    'message',
    'contact',
    'account_sync',
    'case',
    'ccpss',
    'workrecord',
    'caserecord',
    'judiccialdoc',
    'interrogationuse',
    'vil_case',
    'querylog',
    'suspect',
    'fraudulentdriver',
    'onesixfive',
    'goldparty',
    'crimemedia',
    'crowdfight',
    'casino',
    'unredeemedpledgedcars',
    'rightcars',
    'lunatic',
    'person'
]



export function setupPrefix(prefix) {
    CFG_API_PREFIX = prefix
}

export function loadAllInOneCfg() {
    log.info('loadAllInOneCfg')
    return ah.one(`${CFG_API_PREFIX}`)
}

export function loadAllDSIds() {
    log.info('loadAllDSIds')
    return ah.one(`${CFG_API_PREFIX}/dataSourceNames`)
}

export function loadLabels() {
    log.info('loadLabels')
    return ah.one(`${CFG_API_PREFIX}/labels`)
}

export function loadLACfg() {
    log.info('loadLACfg')
    return ah.one(`${CFG_API_PREFIX}/laRenders`)
}

export function loadES2Neo4jCfgForDS(ds) {
    log.info('loadES2Neo4jCfgForDS', ds)
    return ah.one({
        url: `${CFG_API_PREFIX}/dataMappings`,
        data: {dataSourceName:ds}
    })
}

export function loadUICfgForDS(ds) {
    log.info('loadUICfgForDS', ds)
    return ah.one({
        url: `${CFG_API_PREFIX}/portals`,
        data: {dataSourceName:ds}
    })
}

export function processAll(cfg, ds, lng='en') {
    const {la_renders=[], data_sources={}, labels={}, labels_portal={}} = cfg

    log.info('processAll::start', {cfg, ds, lng})

    let result = {ds:{}, dt:{}, searches:{}, renders:{}, labels:{}, la:{}}
    let dsIds = _.keys(data_sources)


    result.labels = _.reduce(labels, (acc, labelCfg, labelName)=>{
        // const trackable = _.includes(trackableLabels, labelName)
        const {unique_property, indexed_properties=[]} = labelCfg

        if (!labelName) {
            log.warn(`processAll::label skipped due to missing label name`, labelCfg)
            return acc
        }
        if (!unique_property) {
            log.warn(`processAll::label '${labelName}' skipped due to missing unique property`, labelCfg)
            return acc
        }

        const labelLocale = _.get(labels_portal, [labelName, 'locales', lng], {})
        const {properties:propsLocale={}, ...metaLocale} = labelLocale

        return {
            ...acc,
            [labelName]: {
                ..._.merge(labelCfg, metaLocale),
                properties: _.reduce(_.uniq([unique_property, ...indexed_properties]), (acc, propName)=>{
                    const propLocale = propsLocale[propName] || {}
                    return {
                        ...acc,
                        [propName]: propLocale
                    }
                }, {})
            }
        }
    }, {})


    //let trackableLabels = []

    _.forEach(data_sources, (dsCfg, dsId)=>{
        const {
            data_mapping={},
            portal: uiCfg={}
        } = dsCfg

        const {data_types=[]} = data_mapping
        const {
            display_name: dsName, description: dsDescription,
            data_types: ui_data_types={}, searches, renders
        } = uiCfg



        // do not want to process this data source
        if (ds && !_.includes(ds, dsId)) {
            return
        }

        // porcess data definitions and node/link mappings
        result.ds[dsId] = {
            display_name: dsName || dsId,
            description: dsDescription || '',
            dts: _.map(data_types, 'name')
        }


        _.forEach(data_types, dtCfg=>{
            const {name: dtId, display_name: dtName, description: dtDescription, properties = {}, nodes = [], relationships = [], data_group, geo_points = {}, geo_address = {}, representative_time, file = {}} = dtCfg
            // unused props: partition, active_image_processing

            const {locales:localesCfg={}, ...uiDtCfg} = ui_data_types[dtId] || {}
            const {properties:propsLocale={}, nodes:nodesLocale={}, relationships:relationsLocale={}, ...metaLocale} = localesCfg[lng] || {}


            const geoPointsCfg = _.reduce(geo_points, (acc, gCfg, geoName)=>{
                const {latitude, longitude} = gCfg
                if (!latitude || !longitude) {
                    log.warn(`processAll::datatype '${dtId}': geopoint '${geoName}' ignored due to missing latitude/longitude`, gCfg)
                    return acc
                }
                const latPropFieldToCheck = latitude.replace(/\./g, '.properties.')
                const lngPropFieldToCheck = longitude.replace(/\./g, '.properties.')
                if (!_.get(properties, latPropFieldToCheck) || !_.get(properties, lngPropFieldToCheck)) {
                    log.warn(`processAll::datatype '${dtId}': geopoint '${geoName}' ignored, latitude '${latPropFieldToCheck}'/ longitude '${lngPropFieldToCheck}' not present in properties`, gCfg)
                    return acc
                }
                const propField = geoName
                return {
                    ...acc,
                    [propField]:{
                        ...gCfg,
                        //type: 'geo_address',
                        type: 'geo_point',
                        //coordinate: [..._.initial(propField.split('.')), propField],
                        latitude: latitude.split('.'),
                        longitude: longitude.split('.')
                    }
                }
            },{})
            const geoAddressCfg = _.reduce(geo_address, (acc, gCfg, geoName)=>{
                const {address} = gCfg
                if (!address) {
                    log.warn(`processAll::datatype '${dtId}': geoaddress '${geoName}' ignored due to missing address`, gCfg)
                    return acc
                }
                const propFieldToCheck = address.replace(/\./g, '.properties.')
                if (!_.get(properties, propFieldToCheck)) {
                    log.warn(`processAll::datatype '${dtId}': geoaddress '${geoName}' ignored, address '${propFieldToCheck}' not present in properties`, gCfg)
                    return acc
                }
                const parent = _.initial(address.split('.'))
                const propField = (_.isEmpty(parent) ? '' : parent.join('.')+'.')+geoName+'.coordinate'
                return {
                    ...acc,
                    [propField]:{
                        ...gCfg,
                        type: 'geo_address',
                        coordinate: propField.split('.')
                    }
                }
            },{})
            let geoCfg = {
                ...geoPointsCfg, ...geoAddressCfg
            }

            const dtProperties = _.reduce(propsLocale, (acc, propLocale, propName)=>{
                const propPath = propName.replace(/\./g, '.properties.')
                if (_.get(properties, propPath) == null) {
                    return acc
                }

                return im.assign(acc, propPath, propLocale)
            }, properties)

            const nodesCfg = _.reduce(nodes, (acc, {name:nodeName, ...nCfg})=>{

                if (!nodeName) {
                    log.warn(`processAll::datatype '${dtId}': node skipped due to missing node name`, nCfg)
                    return acc
                }

                const labelsCfg = _.reduce(nCfg.labels, (acc, lCfg)=>{
                    const {label_name:labelName} = lCfg

                    if (!labelName) {
                        log.warn(`processAll::datatype '${dtId}': node '${nodeName}' label skipped due to missing label name`, lCfg)
                        return acc
                    }
                    if (!result.labels[labelName]) {
                        log.warn(`processAll::datatype '${dtId}': node '${nodeName}' label '${labelName}' skipped, not configured in global labels`, lCfg)
                        return acc
                    }

                    const validPropNames = _.keys(result.labels[labelName].properties)

                    const labelPropertiesCfg = _.reduce(lCfg.properties, (acc, {name:propName, ...pCfg})=>{
                        const {reference, value} = pCfg
                        if (!propName) {
                            log.warn(`processAll::datatype '${dtId}': node '${nodeName}' label '${labelName}' property skipped due to missing property name`, pCfg)
                            return acc
                        }
                        if (!_.includes(validPropNames, propName)) {
                            log.warn(`processAll::datatype '${dtId}': node '${nodeName}' label '${labelName}' property '${propName}' skipped, not a valid prop name`, pCfg)
                            return acc
                        }
                        if (!reference && _.isUndefined(value)) {
                            log.warn(`processAll::datatype '${dtId}': node '${nodeName}' label '${labelName}' property '${propName}' skipped due to missing property reference/value`, pCfg)
                            return acc
                        }

                        if (reference) {
                            const propFieldToCheck = reference.replace(/\./g, '.properties.')
                            if (!_.get(properties, propFieldToCheck)) {
                                log.warn(`processAll::datatype '${dtId}': node '${nodeName}' label '${labelName}' property '${propName}' skipped, reference ${propFieldToCheck} not present in properties`, pCfg)
                                return acc
                            }
                            pCfg.reference = reference.split('.')
                        }

                        return {
                            ...acc,
                            [propName]: pCfg
                        }
                    }, {})

                    if (_.isEmpty(labelPropertiesCfg)) {
                        log.warn(`processAll::datatype '${dtId}': node '${nodeName}' label '${labelName}' skipped due to missing valid properties`, lCfg)
                        return acc
                    }

                    return [
                        ...acc,
                        {
                            ...lCfg,
                            conditions: _.reduce(lCfg.conditions, (acc, {name:cName, ...cCfg})=>{
                                const {value} = cCfg
                                if (!cName || _.isUndefined(value)) {
                                    log.warn(`processAll::datatype '${dtId}': node '${nodeName}' label '${labelName}' condition skipped due to missing name/value`, cCfg)
                                    return acc
                                }

                                const propFieldToCheck = cName.replace(/\./g, '.properties.')
                                if (!_.get(properties, propFieldToCheck)) {
                                    log.warn(`processAll::datatype '${dtId}': node '${nodeName}' label '${labelName}' condition skipped, reference ${propFieldToCheck} not present in properties`, cCfg)
                                    return acc
                                }

                                return [
                                    ...acc,
                                    {
                                        ...cCfg,
                                        reference: cName.split('.')
                                    }
                                ]
                            }, []),
                            properties: labelPropertiesCfg
                        }
                    ]
                }, [])

                const {properties:nodePropsLocale={}, ...nodeMetaLocale} = nodesLocale[nodeName] || {}

                const propertiesCfg =  _.reduce(nCfg.properties, (acc, {name:propName, ...pCfg})=>{
                    const {reference, value} = pCfg
                    if (!propName) {
                        log.warn(`processAll::datatype '${dtId}': node '${nodeName}' property skipped due to missing property name`, pCfg)
                        return acc
                    }
                    if (!reference && _.isUndefined(value)) {
                        log.warn(`processAll::datatype '${dtId}': node '${nodeName}' property '${propName}' skipped due to missing property reference/value`, pCfg)
                        return acc
                    }

                    const dtField = reference ? _.get(dtProperties, reference.replace(/\./g, '.properties.')) : null

                    if (reference && !dtField) {
                        log.warn(`processAll::datatype '${dtId}': node '${nodeName}' property '${propName}' skipped, reference ${reference.replace(/\./g, '.properties.')} not present in properties`, reference)
                        return acc
                    }

                    if (reference) {
                        pCfg.reference = reference.split('.')
                    }

                    return {
                        ...acc,
                        [propName]:{
                            ..._.pick(dtField, 'display_name'),
                            ...pCfg,
                            ...nodePropsLocale[propName]
                        }
                    }
                }, {})


                let trackCfg = null
                if (nCfg.track) {
                    const {location, datetime} = nCfg.track

                    if (!location || !datetime) {
                        log.warn(`processAll::datatype '${dtId}': node '${nodeName}' track skipped due to missing location/datetime`, nCfg.track)
                    }
                    else if (!geoCfg[location] && !_.get(properties, location.replace(/\./g, '.properties.'))) {
                        log.warn(`processAll::datatype '${dtId}': node '${nodeName}' track skipped due to unfound location '${location}' in geo_points/property cfg`, nCfg.track)
                    }
                    else {
                        if (!geoCfg[location]) {
                            geoCfg[location] = {
                                type: 'geo_point_raw',
                                coordinate: location.split('.')
                            }
                        }
                        //trackableLabels = _.uniq([...trackableLabels, ..._.map(labelsCfg, 'label_name')])
                        trackCfg = {
                            datetime: datetime.split('.'),
                            location
                        }
                    }
                }

                //const imagesCfg = _.map(_.compact(nCfg.images), iCfg=>(['__file_service_images_original', iCfg]))
                const imagesCfg = _.map(_.compact(nCfg.images), iCfg=>{
                    const arr = iCfg.split('.')
                    const initial = _.initial(arr)
                    const last = _.last(arr)
                    return [...initial, '__'+last]
                })

                const locationsCfg = _.reduce(nCfg.locations, (acc,locationKey)=>{
                    if (geoCfg[locationKey] || _.get(properties, locationKey.replace(/\./g, '.properties.'))) {
                        if (!geoCfg[locationKey]) {
                            geoCfg[locationKey] = {
                                type: 'geo_point_raw',
                                coordinate: locationKey.split('.')
                            }
                        }
                        return [
                            ...acc,
                            locationKey
                        ]
                    }

                    log.warn(`processAll::datatype '${dtId}': node '${nodeName}' location '${locationKey}' skipped, no valid geo_points or property config`)
                    return acc

                }, [])

                return {
                    ...acc,
                    [nodeName]:{
                        ..._.merge(nCfg, nodeMetaLocale),
                        labels:labelsCfg,
                        properties:propertiesCfg,
                        locations: locationsCfg,
                        track: trackCfg,
                        images: imagesCfg
                    }
                }
            }, {})


            const relationshipsCfg = _.reduce(relationships, (acc, {name:relationName, ...rCfg})=>{
                const {properties:relationPropsLocale={}, ...relationMetaLocale} = relationsLocale[relationName] || {}
                const {node_a, node_b, description} = rCfg

                if (!relationName) {
                    log.warn(`processAll::datatype '${dtId}': relation skipped due to missing relation name`, rCfg)
                    return acc
                }
                if (!node_a || !node_b) {
                    log.warn(`processAll::datatype '${dtId}': relation '${relationName}' skipped due to missing node a/b`, rCfg)
                    return acc
                }
                if (!nodesCfg[node_a] || !nodesCfg[node_b]) {
                    log.warn(`processAll::datatype '${dtId}': relation '${relationName}' skipped, nodes a('${node_a}') and/or b('${node_b}') not valid`, rCfg)
                    return acc
                }

                const directionsCfg = _.reduce(rCfg.directions, (acc, dCfg)=>{
                    const {value} = dCfg
                    if (!_.includes([1,2,3], value)) {
                        log.warn(`processAll::datatype '${dtId}': relation '${relationName}' condition skipped due to missing invalid value`, dCfg)
                        return acc
                    }
                    return [
                        ...acc,
                        {
                            ...dCfg,
                            conditions: _.reduce(dCfg.conditions, (acc, {name:cName, ...cCfg})=>{
                                const {value} = cCfg
                                if (!cName || _.isUndefined(value)) {
                                    log.warn(`processAll::datatype '${dtId}': relation '${relationName}' direction condition skipped due to missing name/value`, cCfg)
                                    return acc
                                }
                                return [
                                    ...acc,
                                    {
                                        ...cCfg,
                                        reference: cName.split('.')
                                    }
                                ]
                            }, [])
                        }
                    ]
                }, [])

                if (_.isEmpty(directionsCfg)) {
                    log.warn(`processAll::datatype '${dtId}': relation '${relationName}' skipped, no valid directions cfg`, rCfg.directions)
                    return acc
                }

                const propertiesCfg = _.reduce(rCfg.properties, (acc, {name:propName, ...pCfg})=>{
                    const {reference, value} = pCfg
                    if (!propName) {
                        log.warn(`processAll::datatype '${dtId}': relation '${relationName}' property skipped due to missing property name`, pCfg)
                        return acc
                    }
                    if (!reference && _.isUndefined(value)) {
                        log.warn(`processAll::datatype '${dtId}': relation '${relationName}' property '${propName}' skipped due to missing property reference/value`, pCfg)
                        return acc
                    }

                    const dtField = reference ? _.get(dtProperties, reference.replace(/\./g, '.properties.')) : null

                    if (reference && !dtField) {
                        log.warn(`processAll::datatype '${dtId}': relation '${relationName}' property '${propName}' skipped, reference ${reference.replace(/\./g, '.properties.')} not present in properties`, reference)
                        return acc
                    }

                    if (reference) {
                        pCfg.reference = reference.split('.')
                    }

                    return {
                        ...acc,
                        [propName]:{
                            ..._.pick(dtField, 'display_name'),
                            ...pCfg,
                            ...relationPropsLocale[propName]
                        }
                    }
                }, {})


                return {
                    ...acc,
                    [relationName]:{
                        display_name: description,
                        ..._.merge(rCfg, relationMetaLocale),
                        conditions: _.reduce(rCfg.conditions, (acc, {name:cName, ...cCfg})=>{
                            const {value} = cCfg
                            if (!cName || _.isUndefined(value)) {
                                log.warn(`processAll::datatype '${dtId}': relation '${relationName}' condition skipped due to missing name/value`, cCfg)
                                return acc
                            }

                            const propFieldToCheck = cName.replace(/\./g, '.properties.')
                            if (!_.get(properties, propFieldToCheck)) {
                                log.warn(`processAll::datatype '${dtId}': relation '${relationName}' condition skipped, reference ${propFieldToCheck} not present in properties`, cCfg)
                                return acc
                            }

                            return [
                                ...acc,
                                {
                                    ...cCfg,
                                    reference: cName.split('.')
                                }
                            ]
                        }, []),
                        directions: directionsCfg,
                        properties: propertiesCfg
                    }
                }
            }, {})

            let normalizedDtCfg = {
                ds: dsId,
                fields: dtProperties,
                geo_points: geoPointsCfg,
                geo_address: geoAddressCfg,
                geo: geoCfg,
                representative_time,
                data_group,
                nodes: nodesCfg,
                relationships: relationshipsCfg,
                labels: _(nodesCfg).map('labels').flatten().map('label_name').uniq().value(),
                showSearch: !_.isEmpty(uiDtCfg.fulltext_search),
                display_name: dtName || dtId,
                description: dtDescription || '',
                file
            }

            result.dt[dtId] = {
                sort_order: _.includes(DT_ORDERS, dtId) ? _.indexOf(DT_ORDERS, dtId)+1 : null,
                ...normalizedDtCfg,
                ...uiDtCfg,
                ...metaLocale

            }

        })


        _.forEach(searches, (searchCfg, searchId)=>{
            result.searches[searchId] = searchCfg
        })
        _.forEach(renders, (renderCfg, renderId)=>{
            result.renders[renderId] = renderCfg
        })
    })
//log.info('trackable', trackableLabels)


    result.la = la_renders

    log.info('processAll::end', result)

    return result
}

export function processDataMappings(data_mappings) {
    log.info('load DataMapping')
    let urlMappingList = _.omitBy(data_mappings, ({type}) => {
        return type !== 'url'
    })
    let jsonDataMappings = {}
    _.forEach(data_mappings, (data_mapping, key) => {
        const {type} = data_mapping
        switch (type) {
            case 'url':
                urlMappingList[key] = data_mapping
                break;
            case 'json':
            default:
                const {json} = data_mapping
                if (!_.isNil(json))
                    jsonDataMappings[key] = JSON.parse(json)
                break;
        }
    })
    return Promise.all(_.map(urlMappingList, (data_mapping, fieldName) => {
        const {url, options: {valueField = 'value', textField = 'text'}} = data_mapping
        return ah.one({
            url
        })
            .then(dataMappings => {
                const dataMapping = _.chain(dataMappings)
                    .keyBy(valueField)
                    .mapValues(o => {
                        return o[textField]
                    })
                    .value()
                return {//整理好mapping的array
                    fieldName,
                    dataMapping
                }
            })
    }))
        .then(data => {
            const dataMappings = _.chain(data)//抽出fieldName當key
                .keyBy('fieldName')
                .mapValues(o => {
                    return o.dataMapping
                })
                .value()
            return {...jsonDataMappings, ...dataMappings}
        })
        .catch(err => {
            log.error(err)
        })
}

export function processRefDataMappings(data_mappings) {
    let urlMappingList = _.omitBy(data_mappings, ({type}) => {
        return type !== 'ref'
    })
    return Promise.all(_.map(urlMappingList, (data_mapping, fieldName) => {
        const {url, options: {valueField, textField, groupByField}} = data_mapping
        return ah.one({
            url
        })
            .then(dataMappings => {
                let dataMapping
                if (groupByField)
                    dataMapping = _.chain(dataMappings)
                        .groupBy(groupByField)
                        .mapValues(o => {
                            return _.map(o, o2 => {
                                return {value: o2[valueField], text: o2[textField]}
                            })
                        })
                        .value()
                else
                    dataMapping = _.chain(dataMappings)
                        .keyBy(valueField)//重複的會覆蓋，可避免重複
                        .map(o => {
                            return {value: o[valueField], text: o[textField]}
                        })
                        .value()
                return {//整理好mapping的array
                    fieldName,
                    dataMapping
                }
            })
    }))
        .then(data => {
            const dataMappings = _.chain(data)//抽出fieldName當key
                .keyBy('fieldName')
                .mapValues(o => {
                    return o.dataMapping
                })
                .value()
            log.info('Ref DataMappings Loaded', dataMappings)
            return dataMappings
        })
        .catch(err => {
            log.error(err)
        })
}

export function loadAll(lng) {
    return loadAllInOneCfg()
        .then(cfg=>{
            return processAll(cfg, null, lng)
        })
        .catch(err=>{
            log.error(err)
            throw new Error(err.message)
        })
}

export function loadAllIncremental() {
    let result = {ds:{}, dt:{}, searches:{}, renders:{}, labels:{}, la:{}}
    let dsIds = []
    return loadAllDSIds()
        .then(ds=>{
            //dsIds = ds
            dsIds = _.without(ds, 'task')
            log.info('ds', ds)
            return Promise.all(_.map(dsIds, dsId=>loadUICfgForDS(dsId)))
        })
        .then(uiCfgs=>{
            _.forEach(uiCfgs, dsCfg=>{
                const {
                    data_source, display_name, description,
                    data_types, searches, renders} = dsCfg
                result.ds[data_source] = {
                    display_name,
                    description,
                    dts: _.keys(data_types)
                }
                _.forEach(data_types, (dtCfg, dtId)=>{
                    result.dt[dtId] = {...dtCfg, ds:data_source}
                })
                _.forEach(searches, (searchCfg, searchId)=>{
                    result.searches[searchId] = searchCfg
                })
                _.forEach(renders, (renderCfg, renderId)=>{
                    result.renders[renderId] = renderCfg
                })
            })
            return Promise.all(_.map(dsIds, dsId=>loadES2Neo4jCfgForDS(dsId)))
        })
        .then(es2Neo4jCfgs=>{
            _.forEach(es2Neo4jCfgs, dsCfg=>{
                const {data_types} = dsCfg
                _.forEach(data_types, cfg=>{
                    const {name, properties, nodes, relationships, data_group, geo_points, representative_time} = cfg
                    // unused props: partition, active_image_processing
                    if (!_.has(result.dt, name)) {
                        log.error(`data type ${name} configured in portal but not in mapping`)
                        return
                    }
                    result.dt[name].fields = properties
                    result.dt[name].locations = _.get(geo_points, 'locations')
                    result.dt[name].representative_time = representative_time
                    result.dt[name].data_group = data_group
                    result.dt[name].la = {
                        nodes, relationships
                    }
                    result.dt[name].labels = _(nodes).map('labels').flatten().map('label_name').uniq().value()
                })
            })
            return loadLabels()
        })
        // .then(labelsCfg=>{
        //     result.labels = labelsCfg
        //     return result
        // })
        .then(labelsCfg=>{
            result.labels = labelsCfg
            return loadLACfg()
        })
        .then(laCfg=>{
            result.la = laCfg
            return result
        })
        .catch(err=>{
            log.error(err.message)
            throw new Error(err.message)
        })
}


export default {
    processAll,
    setupPrefix,
    loadAllDSIds,
    loadLabels,
    loadLACfg,
    loadES2Neo4jCfgForDS,
    loadUICfgForDS,
    loadAllIncremental,
    loadAllInOneCfg,
    loadAll,
    processDataMappings,
    processRefDataMappings
}