
const log = require('loglevel').getLogger('vbda/exporter/labels')


export default function({nodes, labels}, eventsCfg, options={}) {
    log.info({nodes, labels}, eventsCfg)
    const {labelOthers} = options
    const {labels:labelsCfg} = eventsCfg
    let result = ''
    /*const groups = _.groupBy(labels, 'type')
    _.forEach(groups, (group, labelType)=>{
        const section = []
        const {display_name:labelName, properties:labelProps} = labelsCfg[labelType] || {display_name:'others', properties:{}}
        const columns = _.map(labelProps, (labelProp, labelPropKey)=>{
            return _.get(labelProp, 'display_name', labelPropKey)
        })
        const header = 'Type,'+columns.join(',')
        const content = _.map(group, label=>{
            return labelName+','+_.map(columns, column=>{
                let str = _.get(label.propsReadable, column, '')
                if (str !== '') {
                    str = `"${_.replace(str, /"/g, '""')}"`
                }
                return str
            }).join(',')
        }).join('\n')
        result += header+'\n'
        result += content+'\n\n'
    })
    */
   
    const groups = _.groupBy(nodes, node=>{
        return _(labels).pick(node.labels).map('type').join(',')
    })
    _.forEach(groups, (group, groupType)=>{
        const nodeColumns = _.reduce(group, (acc,node)=>{
            return [...acc, ..._.keys(node.propsReadable)]
        }, [])
        const labelTypes = groupType.split(',')
        const labelColumns = _.reduce(labelTypes, (acc,labelType)=>{
            const {properties:labelProps={}} = labelsCfg[labelType] || {}
            
            _.forEach(labelProps, (labelProp, labelPropKey)=>{
                acc = [...acc, _.get(labelProp, 'display_name', labelPropKey)]
            })
            return _.uniq(acc)
        }, [])
        const columns = _.uniq([...labelColumns, ...nodeColumns])

        const header = ','+columns.join(',')
        const content = _.map(group, node=>{
            const labelProps = _.reduce(node.labels, (acc,label)=>{
                return {
                    ...acc, 
                    ...labels[label].propsReadable
                }
            }, {})
            const labelNames = _.reduce(node.labels, (acc,label)=>{
                return [...acc, labels[label].typeReadable || labelOthers]
            }, []).join(',')
            const allProps = {
                ...node.propsReadable,
                ...labelProps
            }
            return `"${labelNames}",`+_.map(columns, column=>{
                let str = _.get(allProps, column, '')
                if (str !== '') {
                    str = `"${_.replace(str, /"/g, '""')}"`
                }
                return str
            }).join(',')
        }).join('\n')
        result += header+'\n'
        result += content+'\n\n'

    })

    return result
    /*_.forEach(items, (item) => {
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
    return xml*/
}