import _ from 'lodash'

export default function (laCfg) {
    const {
        nodes, relationships,
        representative_time, partition, active_image_processing
    } = laCfg//dt[dtId].la

    let profiles = []

    _.forEach(nodes, n=>{
        const {name, description, labels, images} = n
        profiles.push({
            idKey: '_id',
            sh: 'circle',
            u: null,
            tKey: '_id',
            type: 'node',
            b: '#cccccc',
            e: 12,
            c: '#9a5d6f',
            dKey: ['__eventId', '__labels', '__props']
        })
    })

    _.forEach(relationships, r=>{
        const {
            name, description, type, direction,
            node_a, node_b, properties
        } = r
        //profiles.push({})
    })

    return profiles
}