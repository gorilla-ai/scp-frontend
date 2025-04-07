import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'

import {DATA_ITEM_PROP, KEY_MAPPING_PROP} from '../consts/prop-types'

let log = require('loglevel').getLogger('chart/components/line')

/**
 * A React Line Chart
 * @constructor
 * @param {string} [id] - Chart dom element #id
 * @param {string} [className] - Classname for the chart
 * @param {string} [title] - Title for the chart
 * @param {array} data - Data, see below example
 * @param {object} dataCfg - Mapping between data shape and chart
 * @param {string | array.<string>} [dataCfg.splitChart] - if specified, will split into multiple charts based on the given key/path
 * @param {string | array.<string>} dataCfg.x - key/path for the x axis
 * @param {string | array.<string> | array.<array.<string>>} [dataCfg.splitLine] - if specified, will split into different lines based on the given key/path
 * @param {string | array.<string>} [dataCfg.y] - key for the y axis, if not provided, then **splitLine** is assumed to contain y value
 * @param {object} [keyLabels] - Key/label pairs for all the keys, see below for example
 * @param {object} [valueLabels] - Value/label pairs for all the values, see below for example
 * @param {object} [xAxis] - config for the X axis
 * @param {string} xAxis.title - title
 * @param {object} [yAxis] - config for the Y axis
 * @param {string} yAxis.title - title
 * @param {boolean|function} [onTooltip=true] - Tooltip for the hovered item, can be boolean or self defined rendering function as below
 * @param {object} onTooltip.eventInfo - info on the hovered line
 * @param {number} onTooltip.eventInfo.matched - number of data items associated with this line
 * @param {string} onTooltip.eventInfo.splitChart - associated chart value
 * @param {string} onTooltip.eventInfo.x - associated x value
 * @param {string} onTooltip.eventInfo.splitLine - associated line
 * @param {number} onTooltip.eventInfo.y - associated y value
 * @param {array.<object>} onTooltip.data - dataset of the current hovered item
 * @param {object} onTooltip.cfg - data related cfg for this chart
 * @param {object} onTooltip.cfg.dataCfg
 * @param {object} [onTooltip.cfg.keyLabels]
 * @param {object} [onTooltip.cfg.valueLabels]
 * @param {function} [onMouseOver] - Function to call when mouse over, see onTooltip for callback function spec
 * @param {function} [onClick] - Function to call when clicked, see onTooltip for callback function spec
 * @param {function} [onContextMenu] - Function to call when right clicked, see onTooltip for callback function spec
 * @param {function} [onDoubleClick] - Function to call when double clicked, see onTooltip for callback function spec
 *
 * @example

import _ from 'lodash'
import Gis from 'chart/components/line'

// split-chart, each chart is for directors martin & francis,
// x-axis is year, x-axis is amount of movies by actors tom & nicole
React.createClass({
    renderTooltip(eventInfo, data, {dataCfg, keyLabels, valueLabels}) {

        // eventInfo == {matched:1, chart:'martin', x:1990, y:2, splitLine:'tom'}
        // data == [{ director:'martin', tom:2, nicole:5, year:1990 }]

        let {matched, x:year, y:movies, splitChart:directorId, splitLine:actorId} = eventInfo

        let directorName = _.get(valueLabels, ['director', directorId], '')
        let actorName = _.get(keyLabels, actorId, '')
        return <div>
            {directorName}({directorId})<br/>
            {actorName}({actorId})<br/>
            {movies} movies in {year}
        </div>
    },
    render() {
        return <Gis
                id='director-split-actor-chart'
                data={
                    [
                        { director:'martin', tom:2, nicole:5, year:1990 },
                        { director:'martin', tom:3, nicole:4, year:1991 },
                        { director:'martin', tom:2, nicole:3, year:1992 },
                        { director:'martin', nicole:6, year:1993 },
                        { director:'martin', nicole:1, year:1994 },
                        { director:'martin', tom:10, year:1996 },
                        { director:'martin', tom:2, nicole:0, year:1997 },
                        { director:'martin', tom:5, nicole:1, year:2000 },
                        { director:'francis', tom:4, nicole:1, year:1990 },
                        { director:'francis', tom:2, nicole:3, year:1991 },
                        { director:'francis', tom:7, nicole:4, year:1992 },
                        { director:'francis', nicole:1, year:1993 },
                        { director:'francis', nicole:2, year:1994 },
                        { director:'francis', tom:2, year:1996 },
                        { director:'francis', tom:1, nicole:0, year:1997 },
                        { director:'francis', tom:1, nicole:2, year:2000 }
                    ]
                }
                dataCfg={{
                    splitChart:'director',
                    x:'year',
                    splitLine:['tom','nicole']
                }}
                keyLabels={{
                    director:'Director',
                    actor:'Actor',
                    movies:'# movies',
                    year: 'Year',
                    tom:'Tom Cruise',
                    nicole:'Nicole Kidman'
                }}
                valueLabels={{
                    director:{martin:'Martin Scorses', francis:'Francis Copola'}
                }}
                xAxis={{
                    title:'Actors'
                }}
                yAxis={{
                }}
                onTooltip={this.renderTooltip} />
    }
})
 */
class Gis extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        title: PropTypes.node,
        data: PropTypes.arrayOf(DATA_ITEM_PROP).isRequired,
        dataCfg: PropTypes.shape({
            splitChart: KEY_MAPPING_PROP,
            x: KEY_MAPPING_PROP.isRequired,
            splitLine: PropTypes.oneOfType([
                KEY_MAPPING_PROP,
                PropTypes.arrayOf(KEY_MAPPING_PROP)
            ]),
            y: KEY_MAPPING_PROP
        }).isRequired,
        keyLabels: DATA_ITEM_PROP,
        valueLabels: PropTypes.objectOf(DATA_ITEM_PROP),
        xAxis: PropTypes.shape({
            title: PropTypes.string
        }),
        yAxis: PropTypes.shape({
            title: PropTypes.string
        }),
        onTooltip: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
        onMouseOver: PropTypes.func,
        onClick: PropTypes.func,
        onContextMenu: PropTypes.func,
        onDoubleClick: PropTypes.func
    };

    static defaultProps = {
        onTooltip: true,
        data: []
    };

    render() {
        return 'To be implemented'
    }
}

export default Gis