import React from 'react'
import moment from 'moment'
import _ from 'lodash'
import randomcolor from 'randomcolor'
import tinycolor from 'tinycolor2'

import Gis from 'react-gis/components/timeline'
import SAMPLE_DATA from '../mock/sample-2.json'

import createExample from './example-factory'


const CASE_TYPE_COLORS = _(SAMPLE_DATA.hits.hits)
        .map('_source.CaseType')
        .uniq()
        .reduce((acc, caseType)=>{
            const color = randomcolor()

            return {
                ...acc,
                [caseType]: {
                    color,
                    clusterColor: tinycolor(color).darken().toString()
                }
            }
        }, {})

const SAMPLE = {
    data: _(SAMPLE_DATA.hits.hits)
            .filter(el => { return el._source.OccurLatitude && el._source.OccurLongitude })
            .map(el => {
                const data = el._source
                return {
                    id: el._id,
                    type: 'spot',
                    latlng: [data.OccurLatitude, data.OccurLongitude],
                    ts: moment(data.OccurDateTime).valueOf(),
                    cluster: data.CaseType,
                    heatmap: true,
                    //track: data.OccurUnitCode,
                    //track: data.OccurUnitCode==='AB04' ? data.OccurUnitCode: null,
                    track: _.includes(['AB04', 'AK05'], data.OccurUnitCode)?data.OccurUnitCode:undefined,
                    //backgroundColor: CASE_TYPE_COLORS[data.CaseType].color,
                    tooltip: data.OccurAddress,
                    popup: _.values(data).join('<br/>'),
                    data
                }
            })
            .take(3000)
            .value(),
    symbolOptions: [
        {
            match: {
                data: {
                    CaseType: 'F003'
                }
            },
            props: {
                label: ({data})=>data.OccurAddress
            }
        },
        {
            props: {
                backgroundColor: (symbol)=>{
                    return CASE_TYPE_COLORS[symbol.data.CaseType].color
                }
            }
        }
    ],
    clusterOptions: [
        {
            props: {
                symbol: {
                    type: 'spot',
                    backgroundColor: (symbol)=>{
                        return CASE_TYPE_COLORS[symbol.data.cluster].clusterColor
                    },
                    width: 20,
                    height: 20,
                    label: (symbol)=>`${symbol.data.count} ${symbol.data.cluster} 案件`
                }
            }
        }
    ],
    heatmapOptions: {
        radius: 500
    },
    searchCfg: {
        forms: {
            case: {
                form: {
                    formClassName: 'c-form',
                    fields: {
                        OccurUnitCode: {
                            label: 'Occurred Unit',
                            editor: 'Dropdown',
                            props: {
                                list: _(SAMPLE_DATA.hits.hits)
                                    .map('_source.OccurUnitCode')
                                    .uniq()
                                    .map(item=>({value:item, text:item}))
                                    .value()
                            }
                        },
                        CaseType: {
                            label: 'Case Type',
                            editor: 'Dropdown',
                            props: {
                                list: _(SAMPLE_DATA.hits.hits)
                                    .map('_source.CaseType')
                                    .uniq()
                                    .map(item=>({value:item, text:item}))
                                    .value()
                            }
                        },
                        OccurAddress: {
                            label: 'Occurred Address',
                            editor: 'Input',
                            props: {
                                placeholder: 'enter address'
                            }
                        }
                    }
                }
            }
        }
    }
}

let Examples = {}

Examples.Timeline = class extends React.Component {
    state = {
    };

    render() {
        return <Gis
            {...SAMPLE}
            trackOptions={[
                {
                    props: {
                        color: '#1a3248'
                    }
                }
            ]}
            _ref={ref=>{ this.gisNode=ref }}
            onClick={(id)=>{
                const symbol = id ? this.gisNode.gis.getSymbol(id) : null
                console.log('clicked', id, symbol, this.gisNode.gis)
            }}
            onSelectionChange={(ids)=>{
                const symbols = this.gisNode.gis.getSymbol(ids)
                console.log('selected', ids, symbols)
            }} />
    }
}


export default class extends React.Component {
    render() {
        return <div id='example'>
            {
                _.map(Examples, (example, key)=>{
                    return React.createElement(createExample(example, key), {key})
                })
            }
        </div>
    }
}

