import builder from 'xmlbuilder'

const log = require('loglevel').getLogger('vbda/exporter/i2')

const labelIconMapping = {
    'bac':'',
    'ivarImage':'',
    'line':'',
    'facebook':'',
    'wechat':'',
    'fr':'',
    'mailer':'',
    'ivar':'',
    'lpr':'',
    'call':'',
    'testLogstash2':'',
    'phone':'',
    'facebook_page':'',
    'car':'',
    'person':'',
    'testLogstash':'',
    'etag':'',
    'connection':'',
    'facebook_info':'',
    'email':'',
    'case':'',
    'iod':''
}

export default function(items, {nodes, links, labels}) {
    log.info(items, {nodes, links, labels})
    let i2Items = []
    _.forEach(items, (item) => {
        const {type:itemType, id:itemId, hi:hidden, d:itemData, t='', c} = item

        if (hidden) {
            return
        }

        if (itemType === 'node') {
            const {labels:labelIds, props:nodeProps} = itemData
            const nodeLabels = _.pick(labels, labelIds)
            const labelsProps = _(nodeLabels).values().map('props').reduce((acc,props)=>({...acc, ...props}),{})
            const description = `${_.values({...labelsProps, ...nodeProps}).join(', ')}`
            const nodeIcons = _(nodeLabels).values().map('type').value().join(',')//labelIconMapping[type] || type

            i2Items.push({
                '@Label': t,
                '@Description': description,
                End:{
                    Entity: {
                        '@EntityId': itemId,
                        '@Identity': t,
                        '@LabelIsIdentity': true,
                        Icon: {
                            IconStyle: {
                                '@Type':nodeIcons
                            }
                        }
                    }
                }
            })
        }
        else {
            // link
            const {id1, id2, a1, a2} = item
            const {propsHistory} = itemData

            const description = `${_.values(_.last(propsHistory).props).join(', ')}`
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
                Link:{
                    '@End1Id':id1,
                    '@End2Id':id2,
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
    log.info(chart)
    const xml = builder.create(chart).end({ pretty: true })
    //log.info(xml)
    return xml
}