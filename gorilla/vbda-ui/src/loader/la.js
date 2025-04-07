import _ from 'lodash'

import ah from 'react-ui/build/src/utils/ajax-helper'

export function findNodes({id, labels, properties}) {
    return ah.one({
        url: '/api/cibd/la/nodes/_search',
        data: {
            id, labels, properties
        }
    })
}

export function findLinks({id, type, properties}) {
    return ah.one({
        url: '/api/cibd/la/relationships/_search',
        data: {
            id, type, properties
        }
    })
}

export function findShortestPath({fromId:node_a_id, toId:node_b_id, depth}) {
    return ah.one({
        url: '/api/cibd/la/shortest_paths/_search',
        data: {
            node_a_id,
            node_b_id,
            depth
        }
    })
}


export default {
    findNodes,
    findLinks,
    findShortestPath
}