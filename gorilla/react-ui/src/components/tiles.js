import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'

/**
 * React Tiles - view made up of tiles, could be used for laying out images, videos, div,
 * or any self defined components.
 *
 * Allow specifying:
 * * spacing between tiles
 * * max # tiles, or auto calculate # tiles based on container size and tile size
 *
 * || max=number | max=auto | max=undefined |
 * | :-- | :-- | :-- | :-- |
 * | itemSize has width+height| flex layout, display max. # tiles| calculate # tiles from item & container size| flex layout |
 * | itemSize undefined | flex layout, display max. # tiles| flex layout | flex layout |
 *
 * Restrictions:
 * * All items in a row must (or forced to) have same height
 * * width/height of individual tile specified in css will be ignored
 *
 * @alias module:Tiles
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {string|function} base - React class to use for rendering the tile, eg 'div', 'img', <SelfDefinedComponent/>
 * @param {array.<object>} items - Tiles supplied as props to base component
 * @param {string} items.id - tile id
 * @param {number} [items.width] - tile width
 * @param {number} [items.height] - tile height
 * @param {number} [total=items.length] - Total number of tiles available, if total>max, overlay will be rendered on last tile
 * @param {'auto' | number} [max] - Max number of tiles. If 'auto' will try to calculate max, if not specified, will display all tiles
 * @param {function | boolean} [overlay=true] - overlay render function to call if total > max
 * @param {number} overlay.max - configured or automatically calculated max # of tiles
 * @param {number} overlay.total - total # of tiles
 * @param {object} [itemProps] - Props for individual tile
 * @param {object} [itemSize] - Default tile size, will be overwritten by size specified in individual tiles
 * @param {number} [itemSize.width] - Default tile width
 * @param {number} [itemSize.height] - Default tile height
 * @param {number} [spacing=0] - Spacing (in px) between tiles
 * @param {'%' | 'px'} [unit='px'] - itemSize unit
 * @param {function} [onClick] - Function to call when clicked
 * @param {object} onClick.id - tile id clicked
 * @param {object} onClick.eventInfo - other event info
 * @param {number} onClick.eventInfo.index - current array index of clicked tile
 * @param {number} onClick.eventInfo.max - max (configured of auto calculated) # tiles
 * @param {number} onClick.eventInfo.total - total # tiles
 * @param {boolean} onClick.eventInfo.isLast - is the clicked event the last one of this bunch?
 * @param {function} [onMouseOver] - Function to call when mouse over, see onClick for callback function spec
 * @param {function} [onMouseOut] - Function to call when mouse out, see onClick for callback function spec
 *
 *
 * @example
import {Tiles, Popover} from 'react-ui'
import _ from 'lodash'

const IMAGES = [
    'bs', 'camera', 'car', 'drug', 'email', 'fb_messenger', 'goods',
    'gun', 'home', 'ic_airplane', 'ic_alert_2', 'ic_bs',
    'ic_cam_2', 'ic_cam_3', 'ic_car_2', 'ic_case', 'ic_creditcard', 'ic_database', 'ic_drug',
    'ic_email', 'ic_etag', 'ic_etag_gate', 'ic_globe', 'ic_goods', 'ic_gun', 'ic_help', 'ic_home', 'ic_info', 'ic_ip',
    'ip', 'landline', 'line', 'mobile', 'parking', 'person'
]

React.createClass({
    getInitialState() {
        return {
            selected: null,
            max: null,
            isLast: false,
            hasMore: false
        }
    },
    handleClick(id, {index, max, total, isLast}) {
        this.setState({
            selected: id,
            max,
            isLast,
            hasMore: total>max
        })
    },
    openPopover(id, data, evt) {
        Popover.openId(
            'my-popover-id',
            evt,
            <div className='c-box'>
                <header>{id}</header>
                <div className='content c-result aligned'>
                    {
                        _.map(data, (v,k)=><div key={k}>
                            <label>{k}</label>
                            <div>{v+''}</div>
                        </div>)
                    }
                </div>
            </div>,
            {pointy:true}
        )
    },
    closePopover() {
        Popover.closeId('my-popover-id')
    },
    render() {
        return <Tiles id='auto'
            base='img'
            itemSize={{
                width:30,
                height:20
            }}
            unit='%'
            spacing={5}
            items={_.map(IMAGES, item=>({id:item, src:`/images/tiles/${item}.png`}))}
            max='auto'
            onClick={this.handleClick}
            onMouseOver={this.openPopover}
            onMouseOut={this.closePopover} />
    }
})
 */

class Tiles extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        base: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
        items: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string,
            width: PropTypes.number,
            height: PropTypes.number
        })).isRequired,
        total: PropTypes.number,
        max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        overlay: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        itemProps: PropTypes.object,
        itemSize: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number
        }),
        spacing: PropTypes.number,
        unit: PropTypes.oneOf(['%', 'px']),
        onClick: PropTypes.func,
        onMouseOver: PropTypes.func,
        onMouseOut: PropTypes.func
    };

    static defaultProps = {
        items: [],
        overlay: true,
        itemProps: {},
        spacing: 0,
        unit: 'px'
    };

    state = {
        containerWidth: 0,
        containerHeight: 0
    };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimension)
        this.updateDimension()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimension)
    }

    updateDimension = () => {
        const {width:containerWidth, height:containerHeight} = this.node.getBoundingClientRect()
        this.setState({
            containerHeight,
            containerWidth
        })
    };

    renderItem = (item, index, {width, height}, max, columns) => {
        const {base, items, itemProps, spacing, overlay, onClick, onMouseOver, onMouseOut} = this.props
        const {id:itemId} = item

        const tileStyle = {
            height: `${height}px`,
            width: `${width}px`,
            marginTop: (index <= columns - 1) ? 0 : `${spacing}px`, // only items in first row do not have top margin
            marginLeft: (index % columns === 0) ? 0 : `${spacing}px`, // only items in first column do not have left margin
            marginRight: 0,
            marginBottom: 0
        }

        const isLast = index===(max-1)
        const tile = React.createElement(base, {
            ...itemProps,
            ...item
        })

        // For last tile's overlay
        const total = _.has(this.props, 'total') ? this.props.total : items.length
        const tileOverlay = isLast && total>max && overlay ? this.renderOverlay(overlay, max, total) : null

        const eventArgs = [itemId, {index, max, total, isLast}]

        return <div
            key={`tile-${itemId}`}
            className={cx('tile-wrapper c-flex aic jcc', {last:isLast})}
            style={tileStyle}
            onClick={onClick ? onClick.bind(null, ...eventArgs) : null}
            onMouseOver={onMouseOver ? onMouseOver.bind(null, ...eventArgs) : null}
            onMouseOut={onMouseOut ? onMouseOut.bind(null, ...eventArgs) : null} >
            {tile}
            {tileOverlay}
        </div>
    };

    renderOverlay = (overlay, max, total) => {
        return <span className='tile-overlay c-flex aic jcc'>
            {
                _.isFunction(overlay)
                    ? overlay(max-1, total)
                    : `+${total - max + 1}`
            }
        </span>
    };

    render() {
        const {id, className, items, itemSize:{width:itemWidth, height:itemHeight}, max, unit, spacing} = this.props
        const {containerWidth, containerHeight} = this.state

        // Calculate the width and height by ratio when unit is '%'
        const tileSize = {
            height: unit === '%' ? Math.floor(containerHeight / 100 * itemHeight) : itemHeight,
            width: unit === '%' ? Math.floor(containerWidth / 100 * itemWidth) : itemWidth
        }

        // number of row/column of tiles
        const rows = Math.floor((containerHeight + spacing) / (tileSize.height + spacing))
        const columns = Math.floor((containerWidth + spacing) / (tileSize.width + spacing))
        const maxTiles = max === 'auto' ? (columns * rows) : max
        this.maxTiles = maxTiles

        return <div
            id={id}
            className={cx('c-tiles c-flex aic jcc acc fww', className)}
            ref={ref => { this.node = ref }} >
            {
                _(items)
                    .slice(0, maxTiles)
                    .map((el, i) => this.renderItem(el, i, tileSize, maxTiles, columns))
                    .value()
            }
        </div>
    }
}

export default Tiles