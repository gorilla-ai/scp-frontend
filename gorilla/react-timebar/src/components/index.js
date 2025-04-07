import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import moment from 'moment'
import _ from 'lodash'

const log = require('loglevel').getLogger('react-timebar/components')

/**
 * A wrapper React Timebar Component for [timebar]{@link http://172.18.0.166:8099/docs/keylines/API%20Reference.html} library.
 * @constructor
 * @param {string} [id] - Timebar element #id
 * @param {function} [_ref] - Reference to the underlying component
 * @param {string} [className] - Classname for the container
 * @param {string} [assetsPath='/lib/keylines/assets/'] - path to KeyLines assets folder
 * @param {object} [chartOptions] - global chart options to be supplied to [KeyLines]{@link http://172.18.0.166:8099/docs/keylines/API%20Reference.html}
 * @param {array.<object>} [items] - array of items to show in timebar
 * @param {string} items.id - item id
 * @param {number|array.<number>} items.dt - timestamp(s) for this item
 * @param {number|array.<number>} [items.v=1] - value(s) for this item, corresponding to individual timestamp
 * @param {string} [items.group] - associated group id for this item
 * @param {object} [groups] - groups represented by object of id-group(group config) pairs, note at any time at most 3 groups can be set
 * @param {string} groups.id - group id
 * @param {string} [groups.id.color] - group line color
 * @param {object} [scrollWheelZoom] - Configuration for enabling/disabling zooming on mouse wheel scroll
 * @param {boolean} [scrollWheelZoom.enabled=true] - enable zooming on mouse wheel scroll?
 * @param {function} [onReady] - Callback function when chart is initialized and ready
 * @param {function} [onRangeChange] - Callback function when selected range is changed
 * @param {array.<number>} onRangeChange.range - [start, end] timestamp of current selected range
 * @param {function} [onClick] - Callback function when chart is clicked
 * @param {'bar'|'selection'} onClick.type - whether clicked on bar or group
 * @param {object} onClick.eventInfo - event related info
 * @param {string} onClick.eventInfo.group - group id (if type='selection')
 * @param {number} onClick.eventInfo.value - sum of items' *value* contained in current bar/selection
 * @param {number} onClick.eventInfo.x - x coords
 * @param {number} onClick.eventInfo.y - y coords
 * @param {function} [onDoubleClick] - Callback function when chart is double-clicked
 * @param {'bar'|'selection'} onDoubleClick.type - whether clicked on bar or group
 * @param {object} onDoubleClick.eventInfo - event related info
 * @param {string} onDoubleClick.eventInfo.group - group id (if type='selection')
 * @param {number} onDoubleClick.eventInfo.value - sum of items' *value* contained in current bar/selection
 * @param {number} onDoubleClick.eventInfo.x - x coords
 * @param {number} onDoubleClick.eventInfo.y - y coords
 * @param {function} [onMouseOver] - Callback function when chart is hovered
 * @param {'bar'|'selection'} onMouseOver.type - whether clicked on bar or group
 * @param {object} onMouseOver.eventInfo - event related info
 * @param {string} onMouseOver.eventInfo.group - group id (if type='selection')
 * @param {number} onMouseOver.eventInfo.value - sum of items' *value* contained in current bar/selection
 * @param {number} onMouseOver.eventInfo.x - x coords
 * @param {number} onMouseOver.eventInfo.y - y coords
 * @param {function} [onContextMenu] - Callback function when chart is right-clicked
 * @param {'bar'|'selection'} onContextMenu.type - whether clicked on bar or group
 * @param {object} onContextMenu.eventInfo - event related info
 * @param {string} onContextMenu.eventInfo.group - group id (if type='selection')
 * @param {number} onContextMenu.eventInfo.value - sum of items' *value* contained in current bar/selection
 * @param {number} onContextMenu.eventInfo.x - x coords
 * @param {number} onContextMenu.eventInfo.y - y coords
 *
 *
 *
 * @example
// See [example]{@link http://ivs.duckdns.org:10080/web-ui/react-timebar/blob/master/examples/src/timebar.js}
 */
class Timebar extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        _ref: PropTypes.func,
        className: PropTypes.string,
        assetsPath: PropTypes.string,
        chartOptions: PropTypes.object,
        items: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string,
            dt: PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.arrayOf(PropTypes.number),
                PropTypes.instanceOf(Date),
                PropTypes.arrayOf(PropTypes.instanceOf(Date))
            ]),
            v: PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.arrayOf(PropTypes.number)
            ]),
            group: PropTypes.string
        })),
        groups: PropTypes.objectOf(PropTypes.shape({
            color: PropTypes.string
        })),
        scrollWheelZoom: PropTypes.shape({
            enabled: PropTypes.bool
        }),
        onReady: PropTypes.func,
        onRangeChange: PropTypes.func,
        onClick: PropTypes.func,
        onDoubleClick: PropTypes.func,
        onMouseOver: PropTypes.func,
        onContextMenu: PropTypes.func
    };

    static defaultProps = {
        assetsPath: '/lib/keylines/assets/',
        chartOptions: {},
        items: [],
        groups: {},
        scrollWheelZoom: {}
    };

    state = {
    };

    componentDidMount() {
        if (!window.KeyLines) {
            log.error('KeyLines not found')
            return
        }

        const {_ref, onReady} = this.props
        if (_ref) {
            _ref(this)
        }
        window.addEventListener('resize', this.resize)

        this.init(()=>{
            onReady && onReady()
            this.load()
        })
    }

    componentDidUpdate(prevProps) {
        const {items, groups} = this.props
        const {items:prevItems, groups:prevGroups} = prevProps

        if (!this.timebar) {
            // chart not ready yet
            return
        }

        if (items !== prevItems) {
            log.debug('componentDidUpdate::items changed', prevItems, items)
            this.load()
        }
        else {
            if (!_.isEqual(groups, prevGroups)) {
                log.debug('componentDidUpdate::groups changed', prevGroups, groups)
                this.hiliteGroups(groups)
            }
        }
    }

    componentWillUnmount() {
        this.timebar.clear()
        this.timebar.unbind()
        window.removeEventListener('resize', this.resize)
    }

    init = (onDone) => {
        const {
            chartOptions
        } = this.props

        const g = window.KeyLines
        const {assetsPath} = this.props

        g.paths({
            assets: assetsPath
        })

        log.info('creating instance of Timebar module', this.timebarNode)

        g.create({
            element: this.timebarNode,
            type: 'timebar',
            options: {
                ...chartOptions
            }
        },
            (err, timebar) => {
                this.timebar = timebar
                log.info('timebar chart created', timebar)
                this.setupEvents()
                onDone && onDone()
            }
        )
    };

    setupEvents = () => {
        const {
            onRangeChange,
            onClick,
            onDoubleClick,
            onMouseOver,
            onContextMenu
        } = this.props


        const timebar = this.timebar


        timebar.bind('mousewheel', ()=>{
            const {scrollWheelZoom:{enabled:enableScrollWheelZoom=true}} = this.props
            return !enableScrollWheelZoom
        })

        if (onRangeChange) {
            timebar.bind('change', ()=>{
                const {dt1, dt2} = timebar.range()
                onRangeChange([moment(dt1).valueOf(), moment(dt2).valueOf()])
            })
        }

        if (onClick) {
            timebar.bind('click', (type, ...args)=>{
                if (type !== 'bar' && type !== 'selection') {
                    return
                }
                const [index, value, x, y] = args
                onClick(type, {group:this.getGroupId(index), value, x, y})
            })
        }
        if (onDoubleClick) {
            timebar.bind('dblclick', (type, ...args)=>{
                if (type !== 'bar' && type !== 'selection') {
                    return
                }
                const [index, value, x, y] = args
                onDoubleClick(type, {group:this.getGroupId(index), value, x, y})
            })
        }
        if (onMouseOver) {
            timebar.bind('hover', (type, ...args)=>{
                if (type !== 'bar' && type !== 'selection') {
                    return
                }
                const [index, value, x, y] = args
                onMouseOver(type, {group:this.getGroupId(index), value, x, y})
            })
        }
        if (onContextMenu) {
            timebar.bind('contextmenu', (type, ...args)=>{
                if (type !== 'bar' && type !== 'selection') {
                    return
                }
                const [index, value, x, y] = args
                onContextMenu(type, {group:this.getGroupId(index), value, x, y})
            })
        }
    };

    getGroupId = (index) => {
        if (index==null) {
            return undefined
        }

        const {groups} = this.props
        const groupId = _.keys(groups)[index]
        return groupId
    };

    load = () => {
        const {items, groups} = this.props
        log.debug('load::start', items)
        const timebar = this.timebar

        timebar.clear()

        setTimeout(()=>{
            timebar.load({items}, ()=>{
                if (!_.isEmpty(groups)) {
                    this.hiliteGroups(groups)
                }
                log.info('load::done')
            })
        })
    };

    resetView = (onDone) => {
        this.timebar.zoom('fit', {}, onDone)
    };

    hiliteGroups = (groups) => {
        const timebar = this.timebar
        const {items} = this.props
        timebar.selection([])
        let index = 0
        const newSelection = _.map(groups, ({color}, groupId)=>{
            return {
                id: _(items).filter(item=>item.group===groupId).map('id').value(),
                index: index++,
                c: color
            }
        })

        timebar.selection(newSelection)
    };

    resize = () => {
        const bb = this.timebarContainerNode.getBoundingClientRect()
        window.KeyLines.setSize(this.timebarNode, bb.width, bb.height)
    };

    render() {
        const {id, className} = this.props

        return <div id={id} ref={ref=>{ this.timebarContainerNode=ref }} className={cx('c-timebar', className)}>
            <div ref={ref=>{ this.timebarNode=ref }} />
        </div>
    }
}

export default Timebar