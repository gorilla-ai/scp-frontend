import builder from 'xmlbuilder'
import _ from 'lodash'

const log = require('loglevel').getLogger('react-la/utils/i2-exporter')

function retrieveProps(item) {
    if (item==null) {
        return []
    }
    else if (_.isArray(item) || _.isObject(item)) {
        return _.reduce(item, (acc, v)=>{
            return [
                ...acc,
                ...retrieveProps(v)
            ]
        }, [])
    }
    else {
        return [item]
    }
}

export default function (items, options={}) {
    const {resolveDescription, resolveIcon} = options

    let i2Items = []

    _.forEach(items, (item) => {
        const {type:itemType, id:itemId, hi:hidden, d:itemData, t=''} = item

        if (hidden) {
            return
        }

        if (itemType === 'node') {
            const description = resolveDescription ? resolveDescription(item) : `${retrieveProps(itemData).join(', ')}`
            const nodeIcons = resolveIcon ? resolveIcon(item) : ''

            i2Items.push({
                '@Label': t,
                '@Description': description,
                End: {
                    Entity: {
                        '@EntityId': itemId,
                        '@Identity': t,
                        '@LabelIsIdentity': true,
                        Icon: {
                            IconStyle: {
                                '@Type': nodeIcons
                            }
                        }
                    }
                }
            })
        }
        else {
            // link
            const {id1, id2, a1, a2} = item
            const description = resolveDescription ? resolveDescription(item) : `${retrieveProps(itemData).join(', ')}`
            let arrowStyle = 'ArrowNone'
            if (a1 || a2) {
                if (a1 && a2) {
                    arrowStyle = 'ArrowOnBoth'
                }
                else if (a1) {
                    arrowStyle = 'ArrowOnTail'
                }
                else {
                    arrowStyle = 'ArrowOnHead'
                }
            }
            i2Items.push({
                '@Label': t,
                '@Description': description,
                Link: {
                    '@End1Id': id1,
                    '@End2Id': id2,
                    LinkStyle: {
                        '@ArrowStyle': arrowStyle
                    }
                }
            })
        }
    })

    const chart = {
        Chart: {
            ChartItemCollection: {
                ChartItem: i2Items
            }
        }
    }
    log.info('result', chart)
    const xml = builder.create(chart).end({ pretty:true })
    return xml
}