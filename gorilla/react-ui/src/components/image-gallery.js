import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import PropTypes from 'prop-types'

import Tiles from './tiles'
import Image from './image'
import { wire } from '../hoc/prop-wire'

let log = require('loglevel').getLogger('react-ui/components/image-gallery')

/**
 * React ImageGallery - Image Gallery made up of a row of images/tiles, with prev and next icons.
 *
 * Uses Tiles internally.
 *
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {string|function} [base='img'] - React class to use for rendering the tile, eg 'div', 'img', <SelfDefinedComponent/>
 * @param {array.<object>} items - Props supplied to tile. See [Tiles]{@link module:Tiles} for API
 * @param {'auto' | number} [max] - Max number of tiles. If 'auto' will try to calculate max, if not specified, will display all tiles
 * @param {object} [itemProps] - props for individual image/tile
 * @param {object} [itemSize] - image/tile size
 * @param {number} [itemSize.width] - image/tile width
 * @param {number} [itemSize.height] - image/tile height
 * @param {number} [spacing=0] - Spacing (in px) between images/tiles
 * @param {'%' | 'px'} [unit='px'] - itemSize unit
 * @param {function} [onClick] - Function to call when clicked
 * @param {object} onClick.id - image/tile id clicked
 * @param {object} onClick.eventInfo - other event info
 * @param {number} onClick.eventInfo.index - current array index of clicked image/tile
 * @param {number} onClick.eventInfo.max - number of visible images/tiles
 * @param {number} onClick.eventInfo.total - total # images/tiles
 * @param {function} [onMouseOver] - Function to call when mouse over tile, see onClick for callback function spec
 * @param {function} [onMouseOut] - Function to call when mouse out tile, see onClick for callback function spec
 * @param {number} [start=0] - index to start displaying images/tiles from, if absent start will be uncontrolled
 * @param {number} [defaultStart=0] - Default index to start displaying images/tiles from
 * @param {boolean} [hasPrev=auto detect] - should previous icon be displayed
 * @param {boolean} [hasNext=auto detect] - should next icon be displayed
 * @param {boolean} [repeat=false] - Repeat the play list?
 * @param {object} [autoPlay] - autoPlay configuration
 * @param {boolean} [autoPlay.enabled=false] - Allow autoPlay/filter list?
 * @param {string} [autoPlay.interval=7000] - Interval between slides in milliseconds
 * @param {function} [onMove] - Function to call when prev or next icon is clicked, move forward/backward by *step* when not specified
 * @param {string} onMove.start - new start index
 * @param {object} onMove.eventInfo - eventInfo associated with move
 * @param {boolean} onMove.eventInfo.backward - is previous icon clicked
 * @param {number} onMove.eventInfo.step - how many items to move forward/backward?
 *
 *
 * @example

import {ImageGallery} from 'react-ui'
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
            total: null,
            start: 3,
            prevStart: null,
            moveBackward: false,
            step: null
        }
    },
    handleClick(id, {index, max, total}) {
        this.setState({
            selected: id,
            max,
            total
        })
    },
    handleMove(start, {before:prevStart, backward:moveBackward, step}) {
        // start is uncontrolled
        this.setState({
            start,
            prevStart,
            moveBackward,
            step
        })
    },
    render() {
        const {start} = this.state

        return <ImageGallery
            id='gallery-images'
            items={_.map(IMAGES, item=>({id:item, src:`/images/tiles/${item}.png`}))}
            itemSize={{width:120, height:90}}
            unit='px'
            spacing={3}
            defaultStart={start}
            onMove={this.handleMove}
            onClick={this.handleClick}
            repeat
            autoPlay={{
                enabled: true,
                interval: 3000
            }} />
    }
})


 */
class ImageGallery extends React.Component {
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
        itemProps: PropTypes.object,
        itemSize: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number
        }),
        spacing: PropTypes.number,
        unit: PropTypes.oneOf(['%', 'px']),
        onClick: PropTypes.func,
        onMouseOver: PropTypes.func,
        onMouseOut: PropTypes.func,
        start: PropTypes.number,
        hasPrev: PropTypes.bool,
        hasNext: PropTypes.bool,
        repeat: PropTypes.bool,
        autoPlay: PropTypes.shape({
            enabled: PropTypes.bool,
            interval: PropTypes.number
        }),
        onMove: PropTypes.func
    };

    static defaultProps = {
        base: Image,
        items: [],
        max: 'auto',
        repeat: false,
        autoPlay: {
            enabled: false
        },
        start: 0
    };

    componentDidMount() {
        const {autoPlay} = this.props

        this.forceUpdate() // re-render so the left/right arrows will be shown according to current maxTiles
        if (autoPlay.enabled) {
            this.createTimer()
        }
    }

    componentWillUnmount() {
        this.clearTimer()
    }

    createTimer = () => {
        const {autoPlay:{interval=7000}} = this.props
        this.clearTimer()
        this.timer = setInterval(()=>{
            this.slide()
        }, interval)
    };

    clearTimer = () => {
        if (this.timer) {
            clearInterval(this.timer)
        }
    };

    slide = (backward=false, resetAutoPlay=false) => {
        const {start, max, items, onMove, autoPlay, repeat} = this.props
        const total = this.props.total || items.length
        const numTiles = this.tiles.maxTiles
        const itemsToMove = max==='auto' ? numTiles : max

        let newStart
        if (backward) {
            newStart = repeat ? (start-itemsToMove+total)%total : Math.max(start-itemsToMove, 0)
        }
        else {
            if (repeat) {
                newStart = (start+itemsToMove)%total
            }
            else if (start+itemsToMove >= total) {
                return
            }
            else {
                newStart = start+itemsToMove
            }
        }

        if (autoPlay.enabled && resetAutoPlay) {
            this.createTimer()
        }

        onMove(newStart, {step:itemsToMove, total, backward})
    };

    render() {
        const {id, className, base, items, start, hasPrev, hasNext, repeat, ...tilesProps} = this.props
        const numTiles = this.tiles ? this.tiles.maxTiles : 0

        let showPrev = hasPrev
        let showNext = hasNext

        if (repeat) {
            showPrev = true
            showNext = true
        }
        else {
            if (showPrev==null) {
                showPrev = start > 0
            }
            if (showNext==null) {
                showNext = (this.props.total || items.length) > (start + numTiles)
            }
        }

        return <div id={id} className={cx('c-image-gallery c-flex', className)}>
            <i className={cx('fg fg-arrow-left fixed asc large', {'c-link':showPrev, disabled:!showPrev})} onClick={showPrev && this.slide.bind(this, true, true)} />
            <Tiles
                base={base}
                className='grow'
                overlay={false}
                max={'auto'}
                items={[..._.slice(items, start), ..._.take(items, repeat ? numTiles : 0)]}
                ref={ref=>{ this.tiles=ref }}
                {...tilesProps} />
            <i className={cx('fg fg-arrow-right fixed asc large', {'c-link':showNext, disabled:!showNext})} onClick={showNext && this.slide.bind(this, false, true)} />
        </div>
    }
}

export default wire(ImageGallery, 'start', 0, 'onMove')