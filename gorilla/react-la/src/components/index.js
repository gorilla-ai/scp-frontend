import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import moment from 'moment'

import {
    Progress, RadioGroup, ButtonGroup, PopupDialog, Dropdown as DropDownList, Popover, Contextmenu
} from 'react-ui'
import {wireSet} from 'react-ui/build/src/hoc/prop-wire'
import withSearch from 'react-ui/build/src/hoc/search-provider'
import {downloadDataUrl} from 'react-ui/build/src/utils/download'


import toI2 from '../utils/i2-exporter'
import localize from '../hoc/locale-provider'

const log = require('loglevel').getLogger('react-la/components')

const lt = global.laI18n.getFixedT(null, 'la')
const gt = global.laI18n.getFixedT(null, 'global')

export const LAYOUTS = ['standard', 'hierarchy', 'radial', 'structural', 'lens']
const NODE_BASED_LAYOUTS = ['radial', 'hierarchy']
const DOWNLOAD_TYPES = ['i2', 'img']
const SNA_TYPES = ['same', 'degree', 'closeness', 'betweenness', 'pagerank', 'eigenvector']
const LA_POPUP_ID = 'c-react-la-popup'

let selectedItemId = null
let selectedItemOffset = null

/**
 * A wrapper React LA Component for [la]{@link http://ivs.duckdns.org:10080/web-ui/la/tree/develop} library.
 * @constructor
 * @param {string} [id] - La element #id
 * @param {function} [_ref] - Reference to the underlying component
 * @param {'en'|'zh'} [lng] - lang to use
 * @param {renderable} [title] - La title
 * @param {string} [className] - Classname for the container
 * @param {renderable} [actions] - Self defined actions to be appended to the actions panel
 * @param {string} [assetsPath='/lib/keylines/assets/'] - path to KeyLines assets folder
 * @param {object} [chartOptions] - global chart options to be supplied to [KeyLines]{@link http://172.18.0.166:8191/docs/keylines/API%20Reference.html#ChartOptions}
 * @param {string} [defaultIcon] - default node icon path
 * @param {array.<object>} [items] - array of items to show on chart, see [KeyLines]{@link http://172.18.0.166:8191/docs/keylines/API%20Reference.html#formats_chart}, with additional supported properties for each item:
 * * tooltip - string/function(item)
 * * popup - string/function(item)
 * * contextmenu - array of {id, text} menu items to show when chart item is right-clicked
 * @param {array.<string>} [show] - ids of items to show on chart, if not specified, all items will be shown
 * @param {array.<string>} [defaultSelected] - default ids of items to be selected on chart
 * @param {array.<string>} [selected] - ids of items to be selected on chart
 * @param {function} [onSelectionChange] - Callback function when item is selected/deselected. <br> Required when *selected* prop is supplied
 * @param {string|array.<string>} onSelectionChange.id - selected id(s)
 * @param {object} onSelectionChange.eventInfo - event related info
 * @param {string|array.<string>} onSelectionChange.eventInfo.before - previously selected id(s)
 * @param {array.<'standard'|'hierarchy'|'radial'|'structural'|'lens'>} [layouts=['standard', 'hierarchy', 'radial', 'structural', 'lens']] - list of layouts for the user the choose between
 * @param {'standard'|'hierarchy'|'radial'|'structural'|'lens'} [defaultLayout=first of layouts] - default layout id to show
 * @param {'standard'|'hierarchy'|'radial'|'structural'|'lens'} [layout] - current layout id to show
 * @param {function} [onLayoutChange] - Callback function when layout is changed. <br> Required when *layout* prop is supplied
 * @param {string} onLayoutChange.value - current selected layout id
 * @param {object} onLayoutChange.eventInfo - event related info
 * @param {string} onLayoutChange.eventInfo.before - previous selected layout id
 * @param {array.<'same'|'degree'|'closeness'|'betweenness'|'pagerank'|'eigenvector'>} [snaTypes=['same', 'degree', 'closeness', 'betweenness', 'pagerank', 'eigenvector']] - list of SNA (social network analysis) types for the user the choose between
 * @param {'same'|'degree'|'closeness'|'betweenness'|'pagerank'|'eigenvector'} [defaultSnaType=first of snaTypes] - default SNA type id to show
 * @param {'same'|'degree'|'closeness'|'betweenness'|'pagerank'|'eigenvector'} [snaType] - current SNA type id to show
 * @param {function} [onSnaTypeChange] - Callback function when SNA type is changed. <br> Required when *snaType* prop is supplied
 * @param {string} onSnaTypeChange.value - current selected SNA type id
 * @param {object} onSnaTypeChange.eventInfo - event related info
 * @param {string} onSnaTypeChange.eventInfo.before - previous selected SNA type id
 * @param {array.<object>} [itemOptions] - additional style and behaviour to append to user defined items
 * @param {object} [itemOptions.match] - match properties object, this will decide which items to apply the *props* to
 * @param {object} itemOptions.props - what style and behaviour to apply to the matching items
 * * For a list of available props, see
 * * [KeyLines Node]{@link http://172.18.0.166:8191/docs/keylines/API%20Reference.html#formats_nodes}
 * * [KeyLines Link]{@link http://172.18.0.166:8191/docs/keylines/API%20Reference.html#formats_links}
 * @param {boolean|'standard'|'hierarchy'|'radial'|'structural'|'lens'|'tweak'} [layoutOnItemsChange=true] - layout when items reference is changed?
 * @param {boolean|'standard'|'hierarchy'|'radial'|'structural'|'lens'|'tweak'} [layoutOnFilter=false] - layout when filter is applied (ie *show* is changed)?
 * @param {boolean|'same'|'degree'|'closeness'|'betweenness'|'pagerank'|'eigenvector'} [snaOnFilter=false] - do network analysis when filter is applied (ie *show* is changed)?
 * @param {object} [search] - search settings
 * @param {string} [search.title='Search'] - search title
 * @param {string} [search.applyText='Apply'] - search apply button text
 * @param {object} [search.forms] - search forms config, in key-config pair, each key represents a form id, note when this is absent, search will be disabled
 * @param {object} [search.forms.key] - search config for this **key** form
 * @param {string} [search.forms.key.title] - title/legend for this form
 * @param {object} [search.forms.key.form] - form props supplied to [Form Component]{@link http://172.18.0.166:8095/docs/Form.html}
 * @param {boolean|function} [search.forms.key.filter=true] - filter *data*, by default(true) will filter based on symbol's data attribute and search form data
 * * false to turn off auto filter
 * * filter function which returns true/false for individual items, arguments are (item, formData)
 * @param {array.<array.<string>>} [search.filterGroups] - when present, this will define which forms are grouped together to construct and/or logic when filtering
 * @param {object} [search.value] - Current search parameters in key(form id)-value(form value object) pairs
 * @param {function} [search.onSearch] - Callback function when search is applied. <br> Required when *search.value* prop is supplied
 * @param {object} [download] - Configuration for downloading chart
 * @param {boolean} [download.enabled=true] - allow download?
 * @param {array.<'i2'|'img'>} [download.types=['i2', 'img']] - list of download types for the user the choose between
 * @param {function} [download.afterDownload] - function to call after download
 * @param {object} [download.i2] - i2 download options
 * @param {function} [download.i2.resolveDescription] - function for customizing item(node/link) description when exporting to i2
 * @param {function} [download.i2.resolveIcon] - function for customizing node icon when exporting to i2
 * @param {function} [onReady] - Callback function when chart is initialized and ready
 * @param {function} [onViewChange] - Callback function when chart view is changed, eg. zoom, pan
 * @param {function} [onClick] - Callback function when chart is clicked
 * @param {string|array.<string>} onClick.id - clicked item id(s)
 * @param {object} onClick.eventInfo - event related info
 * @param {number} onClick.eventInfo.x - x coords
 * @param {number} onClick.eventInfo.y - y coords
 * @param {function} [onDoubleClick] - Callback function when chart is double-clicked
 * @param {string|array.<string>} onDoubleClick.id - clicked item id(s)
 * @param {object} onDoubleClick.eventInfo - event related info
 * @param {number} onDoubleClick.eventInfo.x - x coords
 * @param {number} onDoubleClick.eventInfo.y - y coords
 * @param {function} [onMouseOver] - Callback function when chart is hovered
 * @param {string|array.<string>} onMouseOver.id - hovered item id(s)
 * @param {object} onMouseOver.eventInfo - event related info
 * @param {number} onMouseOver.eventInfo.x - x coords
 * @param {number} onMouseOver.eventInfo.y - y coords
 * @param {function} [onContextMenu] - Callback function when chart is right-clicked
 * @param {string|array.<string>} onContextMenu.id - clicked item id(s)
 * @param {object} onContextMenu.eventInfo - event related info
 * @param {number} onContextMenu.eventInfo.x - x coords
 * @param {number} onContextMenu.eventInfo.y - y coords
 * @param {string} onContextMenu.eventInfo.action - triggered action id
 * @param {function} [onDelete] - Callback function when item is deleted
 * @param {array.<string>} onDelete.id - deleted ids
 *
 *
 *
 * @example
// See [basic example]{@link http://ivs.duckdns.org:10080/web-ui/react-la/blob/master/examples/src/basic.js}
// See [advanced example]{@link http://ivs.duckdns.org:10080/web-ui/react-la/blob/master/examples/src/advanced.js}
 */
class ReactLa extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        _ref: PropTypes.func,
        title: PropTypes.node,
        className: PropTypes.string,
        actions: PropTypes.node,
        children: PropTypes.node,
        assetsPath: PropTypes.string,
        chartOptions: PropTypes.object,
        defaultIcon: PropTypes.string,
        items: PropTypes.arrayOf(PropTypes.object),
        show: PropTypes.arrayOf(PropTypes.string),
        selected: PropTypes.arrayOf(PropTypes.string),
        layouts: PropTypes.arrayOf(PropTypes.oneOf(LAYOUTS)),
        layout: PropTypes.oneOf(LAYOUTS),
        onLayoutChange: PropTypes.func,
        snaTypes: PropTypes.arrayOf(PropTypes.oneOf(SNA_TYPES)),
        snaType: PropTypes.oneOf(SNA_TYPES),
        onSnaTypeChange: PropTypes.func,
        itemOptions: PropTypes.array,
        layoutOnItemsChange: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.oneOf([...LAYOUTS, 'tweak'])
        ]),
        layoutOnFilter: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.oneOf([...LAYOUTS, 'tweak'])
        ]),
        snaOnFilter: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.oneOf(SNA_TYPES)
        ]),
        download: PropTypes.shape({
            enabled: PropTypes.bool,
            types: PropTypes.arrayOf(PropTypes.oneOf(DOWNLOAD_TYPES)),
            afterDownload: PropTypes.func,
            i2: PropTypes.shape({
                resolveDescription: PropTypes.func,
                resolveIcon: PropTypes.func
            })
        }),
        onReady: PropTypes.func,
        onViewChange: PropTypes.func,
        onClick: PropTypes.func,
        onDoubleClick: PropTypes.func,
        onMouseOver: PropTypes.func,
        onContextMenu: PropTypes.func,
        onSelectionChange: PropTypes.func,
        onDelete: PropTypes.func
    };

    static defaultProps = {
        assetsPath: '/lib/keylines/assets/',
        chartOptions: {},
        items: [],
        selected: [],
        layouts: LAYOUTS,
        snaTypes: SNA_TYPES,
        itemOptions: [],
        layoutOnItemsChange: true,
        layoutOnFilter: false,
        snaOnFilter: false,
        download: {
            enabled: true
        }
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
            this.load(true)
        })
    }

    componentDidUpdate(prevProps) {
        const {
            items, selected, show,
            layout, snaType, layoutOnItemsChange, layoutOnFilter, snaOnFilter
        } = this.props
        const {
            items: prevItems, selected: prevSelected, show: prevShow,
            layout: prevLayout, snaType: prevSnaType
        } = prevProps

        if (!this.la) {
            // chart not ready yet
            return
        }

        if (items !== prevItems) {
            log.info('componentDidUpdate::items changed', prevItems, items)
            this.load(layoutOnItemsChange)
        }
        else {
            if (!_.isEqual(show, prevShow)) {
                log.info('componentDidUpdate::show changed', prevShow, show)
                this.applyFilter(
                    snaOnFilter,
                    layoutOnFilter,
                    !layoutOnFilter
                )
            }
            if (!_.isEqual(selected, prevSelected)) {
                log.info('componentDidUpdate::selected changed', prevSelected, selected)
                this.la.selection(selected)
            }
            if (layout !== prevLayout) {
                log.info('componentDidUpdate::layout changed', prevLayout, layout)
                this.animateLayout(layout)
            }
            if (snaType !== prevSnaType) {
                log.info('componentDidUpdate::snaType changed', prevSnaType, snaType)
                this.animateSna(snaType)
            }
        }
    }

    componentWillUnmount() {
        this.la.clear()
        Popover.closeId(LA_POPUP_ID)
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

        log.info('creating instance of LA module', this.laNode)

        g.create({
            element: this.laNode,
            type: 'chart',
            options: {
                handMode: true,
                selfLinks: true,
                truncateLabels: {
                    minZoom: 0.01,
                    maxLength: 20
                },
                ...chartOptions
            }
        },
            (err, la) => {
                this.la = la
                log.info('la chart created', la)
                this.setupLaEvents()
                onDone && onDone()
            }
        )
    };

    setupLaEvents = () => {
        const {
            onViewChange,
            onClick,
            onDoubleClick,
            onMouseOver,
            onContextMenu,
            onSelectionChange,
            onDelete
        } = this.props

        const la = this.la

        la.bind('hover', (id, x, y)=>{
            if (selectedItemId) {
                return
            }
            if (id && !Contextmenu.isOpen()) {
                const item = la.getItem(id)
                if (item.tooltip) {
                    const bb = this.getBoundingBox()
                    this.drawPopup(
                        {x:x+(bb.x||bb.left), y:y+(bb.y||bb.top)},
                        <div dangerouslySetInnerHTML={{__html:item.tooltip}} />
                    )
                    return
                }
            }

            Popover.closeId(LA_POPUP_ID)
        })

        la.bind('click', (id, x, y)=>{
            if (id) {
                const item = la.getItem(id)
                if (item.popup) {
                    selectedItemId = id
                    const bb = this.getBoundingBox()
                    this.drawPopup(
                        {x:x+(bb.x||bb.left), y:y+(bb.y||bb.top)},
                        <div dangerouslySetInnerHTML={{__html:item.popup}} />
                    )
                    return
                }
            }

            selectedItemId = null
            Popover.closeId(LA_POPUP_ID)
        })

        // handle popup repositioning when node is dragged
        la.bind('dragstart', (type, id, x, y)=>{
            if (id) {
                const item = la.getItem(id)
                if (item.popup) {
                    selectedItemId = id
                    const {x1, x2, y1, y2} = la.labelPosition(id)
                    selectedItemOffset = {
                        left: x1-x,
                        right: x2-x,
                        top: y1-y,
                        bottom: y2-y
                    }
                    window.addEventListener('mousemove', this.handleItemDrag)
                }
            }
        })
        la.bind('dragend', ()=>{
            window.removeEventListener('mousemove', this.handleItemDrag)
        })


        if (onContextMenu) {
            la.bind('contextmenu', (id, x, y)=>{
                if (id) {
                    const item = la.getItem(id)
                    if (item.contextmenu) {
                        const bb = this.getBoundingBox()
                        Popover.closeId(LA_POPUP_ID)
                        Contextmenu.open(
                            {pageX:x+(bb.x||bb.left)+5, pageY:y+(bb.y||bb.top)+5},
                            _.map(item.contextmenu, menuItem=>({
                                ...menuItem,
                                action: ()=>{ onContextMenu(id, {x, y, action:menuItem.id}) }
                            }))
                        )
                        return
                    }
                }
                Contextmenu.close()

                onContextMenu(id, {x, y})
            })
        }

        if (onViewChange) {
            la.bind('viewchange', onViewChange)
        }

        if (onClick) {
            la.bind('click', (id, ...args)=>{
                const [x, y] = args
                onClick(id, {x, y})
            })
        }
        if (onDoubleClick) {
            la.bind('dblclick', (id, ...args)=>{
                const [x, y] = args
                onDoubleClick(id, {x, y})
            })
        }
        if (onMouseOver) {
            la.bind('hover', (id, ...args)=>{
                const [x, y] = args
                onMouseOver(id, {x, y})
            })
        }
        if (onSelectionChange) {
            la.bind('selectionchange', ()=>{
                const selected = la.selection()
                const {selected:prevSelected} = this.props
                if (selected.length<=0 && prevSelected.length<=0) {
                    //keylines fires selectionchange when before=unselected & after=unselected
                    //prevent propagation of this event
                    return
                }
                onSelectionChange(selected)
            })
        }
        if (onDelete) {
            la.bind('delete', ()=>{
                const selected = la.selection()
                onDelete(selected)
                return true
            })
        }
    };

    handleItemDrag = (evt) => {
        if (selectedItemId) {
            const item = this.la.getItem(selectedItemId)
            this.drawPopup(
                {
                    left: evt.pageX+selectedItemOffset.left,
                    right: evt.pageX+selectedItemOffset.right,
                    top: evt.pageY+selectedItemOffset.top,
                    bottom: evt.pageY+selectedItemOffset.bottom
                },
                <div dangerouslySetInnerHTML={{__html:item.popup}} />
            )
        }
    };

    drawPopup = (location, content) => {
        if (content) {
            Popover.openId(
                LA_POPUP_ID,
                location,
                <div>{content}</div>,
                {
                    //draggable: true,
                    pointy: true,
                    boundBy: this.laContainerNode,
                    className: ''
                }
            )
        }
    };

    resetView = (onDone) => {
        const {layout} = this.props
        this.animateLayout(layout, null, onDone)
    };

    load = (layout) => {
        const {defaultIcon, items, itemOptions, selected, snaType, show} = this.props
        log.info('load::start')
        const la = this.la

        const curChartItems = this.getChartItems()
        const curChartItemIds = _.map(curChartItems, 'id')
        const curChartNodeIds = _(curChartItems).filter({type:'node'}).map('id').value()

        Progress.startSpin()
        setTimeout(()=>{
            const itemsToCreate = _(items)
                .map(item=>{
                    const matchedOptions = _.reduce(itemOptions, (acc, opt)=>{
                        const {match, props} = opt

                        if (_.isFunction(match)) {
                            if (!match(item)) {
                                return acc
                            }
                        }
                        else if (!_.isMatch(item, match)) {
                            return acc
                        }

                        return {
                            ...acc,
                            ...props
                        }
                    }, {})

                    let computedProps = {}
                    if (!_.isEmpty(matchedOptions)) {
                        computedProps = _.mapValues(matchedOptions, (v)=>{
                            if (_.isFunction(v)) {
                                return v(item)
                            }
                            return v
                        })
                    }

                    const defaultProps = item.type==='node' ? {u:defaultIcon} : {}
                    return {
                        ...defaultProps,
                        ...computedProps,
                        ...item,
                        hi: show!=null && !_.includes(show, item.id)
                    }
                })
                .value()

            const newChartNodeIds = _(itemsToCreate).filter({type:'node'}).map('id').value()
            const idsToRemove = _.difference(curChartItemIds, newChartNodeIds)
            const positionsToKeep = _.intersection(newChartNodeIds, curChartNodeIds)
            la.removeItem(idsToRemove)
            la.merge(itemsToCreate, ()=>{
                if (!_.isEmpty(selected)) {
                    la.selection(selected)
                }

                if (show) {
                    // even hi is set in items, still need to call applyFilter again
                    // since we want to show links attached to nodes when show contains only nodes
                    this.applyFilter(true, layout, positionsToKeep)
                }
                else {
                    this.animateSna(snaType, layout, positionsToKeep)
                }

                log.info('load::done')
                Progress.done()
            })
        })
    };

    handleLayoutChange = (layout) => {
        const {onLayoutChange} = this.props
        onLayoutChange(layout)
    };

    handleSnaTypeChange = (snaType) => {
        const {onSnaTypeChange} = this.props
        onSnaTypeChange(snaType)
    };

    getChartItems = () => {
        return this.la.serialize().items
    };

    getBoundingBox = () => {
        return this.laContainerNode.getBoundingClientRect()
    };

    handleDownload = () => {
        const {download:{types:downloadTypes=DOWNLOAD_TYPES}} = this.props
        let downloadType = _.first(downloadTypes)

        if (downloadTypes.length>1) {
            PopupDialog.prompt({
                title: lt('dlg-download'),
                display: <div>
                    <RadioGroup
                        list={_.map(downloadTypes, option=>({text:lt(`download-types.${option}`), value:option}))}
                        onChange={(type)=>{ downloadType=type }}
                        defaultValue={downloadType} />
                </div>,
                cancelText: gt('btn-cancel'),
                confirmText: gt('btn-confirm'),
                act: (confirmed) => {
                    if (confirmed) {
                        this.download(downloadType)
                    }
                }
            })
        }
        else {
            this.download(downloadType)
        }
    };

    download = (type) => {
        if (type === 'i2') {
            this.downloadAsI2()
        }
        else {
            this.downloadAsImg()
        }
    };

    downloadAsI2 = () => {
        const {download:{afterDownload, resolveDescription, resolveIcon}} = this.props
        const filename = `la_${moment().format('YYYY-MM-DD-HH-mm')}`
        const items = this.getChartItems()

        const xml = toI2(items, {resolveDescription, resolveIcon})
        downloadDataUrl('data:text/plain;charset=utf-8,'+encodeURIComponent(xml), filename, 'xml')
        afterDownload && afterDownload({type:'i2', filename})
    };

    downloadAsImg = () => {
        const {download:{afterDownload}} = this.props
        const filename = `la_${moment().format('YYYY-MM-DD-HH-mm')}`

        this.la.toDataURL(2000, 2000, {fit:'oneToOne'}, (dataUrl)=>{
            downloadDataUrl(dataUrl, filename, 'jpg')
            afterDownload && afterDownload({type:'image', filename})
        })
    };

    resize = () => {
        const laBb = this.getBoundingBox()
        window.KeyLines.setSize(this.laNode, laBb.width, laBb.height)
        this.animateLayout('tweak')
    };

    applyFilter = (sna, layout, nodeIdsToFix, onDone) => {
        const {show} = this.props

        if (_.isEmpty(show)) { // applies when show=null (ie show all) or none
            this.animateFilter(show, sna, layout, nodeIdsToFix, {}, onDone)
        }
        else {
            const itemsToShow = this.la.getItem(show)
            let filterNodes = false
            let filterLinks = false
            _.some(itemsToShow, ({type})=>{
                if (type==='node') {
                    filterNodes = true
                }
                else {
                    filterLinks = true
                }
                if (filterNodes && filterLinks) {
                    // exit early to prevent unnecessary checks
                    return true
                }
                return false
            })
            this.animateFilter(
                show,
                sna,
                layout,
                nodeIdsToFix,
                {
                    hideSingletons: false,
                    type: (filterNodes&&filterLinks?'all':(filterNodes?'node':'link'))
                },
                onDone
            )
        }
    };

    animateFilter = (nodeIdsToShow, sna=false, layout=true, nodeIdsToFix, options={}, onDone) => {
        log.info('animateFilter::start', nodeIdsToShow, nodeIdsToFix, options)
        let filterFn
        if (nodeIdsToShow==null) {
            filterFn = ()=>true
        }
        else {
            filterFn = (item) => _.includes(nodeIdsToShow, item.id)
        }
        this.la.filter(filterFn, {animate:false, ...options}, ()=>{
            if (sna) {
                this.animateSna(_.isString(sna)?sna:this.props.snaType, layout, nodeIdsToFix, onDone)
            }
            else {
                if (layout) {
                    this.animateLayout(_.isString(layout)?layout:this.props.layout, nodeIdsToFix, onDone)
                }
                else {
                    onDone && onDone()
                }
            }
        })
    };

    animateLayout = (newLayout, nodeIdsToFix, onDone) => {
        log.info('animateLayout::start', {newLayout, nodeIdsToFix})
        const {selected} = this.props
        const la = this.la
        let options = {fit:true, fixed:nodeIdsToFix, animate:true, tidy:true}

        if (_.includes(NODE_BASED_LAYOUTS, newLayout)) {
            let top = []
            _.forEach(selected, s=>{
                let item = la.getItem(s)
                if (item.type==='node') {
                    top.push(s)
                }
            })
            options = {...options, flatten:true, top}
        }
        la.layout(newLayout, options, onDone)
    };

    animateSna = (newSnaType, layout=true, nodeIdsToFix, onDone) => {
        log.info('animateSna::start', {newSnaType, nodeIdsToFix, layout})
        const la = this.la
        let fn = la.graph()[{degree:'degrees', eigenvector:'eigenCentrality', pagerank:'pageRank'}[newSnaType]||newSnaType]

        if (newSnaType!=='same' && !fn) {
            log.error(`sna::analysis type '${newSnaType}' unavailable`)
            return
        }

        let wrappedFn = fn
        if (newSnaType==='same') {
            let sizes = {}
            la.each({type:'node'}, (node)=>{
                sizes[node.id] = 0
            })
            wrappedFn = (options, cb) => {
                cb(sizes)
            }
        }
        else if (_.includes(['degree', 'pagerank', 'eigenvector'], newSnaType)) {
            wrappedFn = (options, cb) => {
                cb(fn(options))
            }
        }


        wrappedFn({}, (nodeSizes)=>{
            const sizes = _.values(nodeSizes)
            const maxSize = Math.max(...sizes)
            const minSize = Math.min(...sizes)
            const props = _.map(nodeSizes, (v, k)=>{
                const normalizedSize = (maxSize===minSize ? minSize : (v-minSize)/(maxSize-minSize))
                /*let color = undefined
                if (normalizedSize < 0.25) {
                    color = 'rgb(254, 217, 118)'
                }
                else if (normalizedSize < 0.5) {
                    color = 'rgb(253, 141, 60)'
                }
                else if (normalizedSize < 0.75) {
                    color = 'rgb(252, 78, 42)'
                }
                else {
                    color = 'rgb(177, 0, 38)'
                }*/
                return {
                    id: k,
                    e: (normalizedSize*6)+1/*,
                    c: color*/
                }
            })
            la.animateProperties(props, {animate:!layout}, ()=>{
                if (layout) {
                    this.animateLayout(_.isString(layout)?layout:this.props.layout, nodeIdsToFix, onDone)
                }
                else {
                    onDone && onDone()
                }
            })
        })
    };

    render() {
        const {
            id, title, className, actions,
            download: {enabled:enableDownload=true},
            snaTypes, snaType, layouts, layout, selected,
            children
        } = this.props


        return <div id={id} ref={ref=>{ this.node=ref }} className={cx('c-box c-la', className)}>
            {title && <header className='c-flex aic'>
                {title}
            </header>}
            <div className='actions c-flex jcsb'>
                <div className='left'>
                    {layouts.length > 1 && <ButtonGroup
                        list={layouts.map(l=>({text:lt(`layout-types.${l}`), value:l}))}
                        disabled={_.isEmpty(selected)?NODE_BASED_LAYOUTS:false}
                        value={layout}
                        onChange={this.handleLayoutChange} />}
                </div>
                <div className='right c-flex'>
                    {actions}
                    {snaTypes.length > 1 && <DropDownList
                        required
                        list={snaTypes.map(m=>({text:lt(`sna-types.${m}`), value:m}))}
                        value={snaType}
                        onChange={this.handleSnaTypeChange} />}
                    {enableDownload && <button className='standard fg fg-data-download' title={lt('tt-download')} onClick={this.handleDownload} />}
                    {<button className='standard fg fg-update' title={lt('tt-reset')} onClick={()=>{ this.resetView() }} />}
                </div>
            </div>
            <div className='content c-fill nopad full' ref={ref=>{ this.laContainerNode=ref }}>
                <div ref={ref=>{ this.laNode=ref }} />
            </div>
            {children}
        </div>
    }
}

export default withSearch(
    localize(
        wireSet(ReactLa, {
            layout: {defaultValue:({layouts})=>_.first(layouts || LAYOUTS), changeHandlerName:'onLayoutChange'},
            snaType: {defaultValue:({snaTypes})=>_.first(snaTypes || SNA_TYPES), changeHandlerName:'onSnaTypeChange'},
            selected: {defaultValue:[], changeHandlerName:'onSelectionChange'}
        })
    ),
    {
        searchTarget: 'items',
        filterEntryField: 'd',
        defaultTitle: ()=>lt('search.title'),
        defaultApplyText: ()=>lt('search.btn-apply')}
)