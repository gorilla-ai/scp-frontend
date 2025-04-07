/**
  * @module popover
  * @description A module to help with opening/closing popovers
  *
  * Note. There can be multiple popovers appearing on the screen at the same time.<br>
  * To achieve this, please use openId(..) instead of open()
  */

import React from 'react'
import ReactDOM from 'react-dom'
import cx from 'classnames'
import Draggable from 'react-draggable'
import _ from 'lodash'

let log = require('loglevel').getLogger('react-ui/components/popover')

let handles = {}

const GLOBAL_POPOVER_ID = 'g-popover'

class Popover extends React.Component {
    static propTypes = {
    };

    state = {
        open: false,
        position: {},
        display: null,
        cfg: {}
    };

    setDragBounds = () => {
        const {cfg:{boundBy}} = this.state
        const node = this.node

        const {left:boundLeft, right:boundRight, top:boundTop, bottom:boundBottom} = boundBy.getBoundingClientRect()
        const {left:popLeft, right:popRight, top:popTop, bottom:popBottom} = node.getBoundingClientRect()

        const _dragBounds = {
            left: boundLeft-popLeft,
            right: boundRight-popRight,
            top: boundTop-popTop,
            bottom: boundBottom-popBottom
        }
        this.setState({_dragBounds})
    };

    snapToBounds = () => {
        const {position, cfg:{/*pointy, */draggable, boundBy}} = this.state
        const node = this.node
        const {x, y, left, right, top, bottom} = position
        const {width:popWidth, height:popHeight} = node.getBoundingClientRect()
        const {left:boundLeft, right:boundRight, top:boundTop, width:boundWidth, bottom:boundBottom} = boundBy.getBoundingClientRect()

        log.debug('snapToBounds',
            _.pick(node.getBoundingClientRect(), ['left', 'right', 'top', 'bottom', 'width', 'height']),
            _.pick(boundBy.getBoundingClientRect(), ['left', 'right', 'top', 'bottom', 'width', 'height']),
            position)

        let _actualPosition = {}
        const defaultX = (left!=null && right!=null ? (left+right)/2 : x)
        _actualPosition.left = defaultX
        if (defaultX+popWidth > boundRight) {
            if (popWidth >= boundWidth) {
                _actualPosition.left = boundLeft
                _actualPosition.maxWidth = boundWidth
            }
            else {
                _actualPosition.left = boundRight-popWidth
            }
        }

        const aroundTop = (top==null ? y : top)
        const aroundBottom = (bottom==null ? y: bottom)
        _actualPosition.top = aroundBottom
        if (aroundBottom+popHeight > boundBottom) {
            // pick above or below, whichever having more vertical space
            const aboveSpace = aroundTop - boundTop
            const belowSpace = boundBottom-aroundBottom
            if (aboveSpace > belowSpace) {
                _actualPosition.top = aroundTop-popHeight
                _actualPosition.maxHeight = Math.min(aboveSpace, popHeight)
            }
            else {
                _actualPosition.maxHeight = belowSpace
            }
        }

/*        if (pointy) {
            _actualPosition.top += 6
        }*/
        this.setState({_actualPosition}, ()=>{
            draggable && this.setDragBounds()
        })
    };

    close = () => {
        if (this.isOpen()) {
            this.setState({open:false})
        }
    };

    isOpen = () => {
        return this.state.open
    };

    open = (position, display, cfg={}) => {
        if (this.isOpen() && !cfg.updateOnly) {
            // close and re-open, so previous styles (including those calculated by browser)
            // are properly erased
            this.setState({open:false}, ()=>{
                this.open(position, display, cfg)
            })
        }
        else {
            this.setState({
                _actualPosition: null,
                _dragBounds: null,
                position,
                display,
                cfg,
                open: true
            }, ()=>{
                // snap to bounds after initial display
                // so it can retrieve dom width/height
                this.snapToBounds()
            })
        }
    };

    render() {
        const {
            _actualPosition, display, _dragBounds,
            cfg: {/*pointy,*/ draggable, style, className},
            open
        } = this.state

        if (!open) {
            return null
        }
        else {
            const popoverContent = <div
                ref={ref=>{ this.node=ref }}
                className={cx('c-popover pure-form', {/*pointy, */handle:draggable}, className)}
                style={{...style, ..._actualPosition}}>
                {display}
            </div>

            return draggable ?
                <Draggable handle='.handle' bounds={_dragBounds}>
                    {popoverContent}
                </Draggable> :
                popoverContent
        }
    }
}

function openPopover(instance, pos, display, cfg) {
  if (instance) {
    let position = pos

    if (pos && pos.target) {
        let rect = pos.target.getBoundingClientRect()
        position = _.pick(rect, ['x', 'y', 'left', 'right', 'top', 'bottom'])
    }

    instance.open(position, display, cfg)
  }
}

export default {

    /**
     * Open global popover<br>
     * Uses openId, with id='g-popover'. See [openId()]{@link module:popover.openId}
     *
     * @param {object} position - open popover at this position (or around a box to avoid overlaying on the box)
     * @param {number} position.x - x position to open popover at
     * @param {number} position.y - y position to open popover at
     * @param {number} position.left - left bound to open popover around
     * @param {number} position.right - right bound to open popover around
     * @param {number} position.top - top bound to open popover around
     * @param {number} position.bottom - bottom bound to open popover around
     * @param {renderable} display - What to display in popover?
     * @param {object} cfg - display config
     * @param {boolean} [cfg.draggable=false] - Allow to drag popover?
     * @param {HTMLElement} [cfg.boundBy=document.body] - Bound the popover to specific region, this will force reposition of the popover
     * @param {boolean} [cfg.pointy=false] - disabled for now
     * @param {object} [cfg.style={}] - style to deploy to the popover
     * @param {string} [cfg.className=''] - className for the popover
     *
     */
    open(pos, display, cfg) {
        this.openId(GLOBAL_POPOVER_ID, pos, display, cfg)
    },

    /**
     * Open popover with a given id, id will be the handler key
     * @param {string} id - popover handler id
     * @param {object} position - open popover at this position (or around a box to avoid overlaying on the box)
     * @param {number} position.x - x position to open popover at
     * @param {number} position.y - y position to open popover at
     * @param {number} position.left - left bound to open popover around
     * @param {number} position.right - right bound to open popover around
     * @param {number} position.top - top bound to open popover around
     * @param {number} position.bottom - bottom bound to open popover around
     * @param {renderable} display - What to display in popover?
     * @param {object} cfg - display config
     * @param {boolean} [cfg.draggable=false] - Allow to drag popover?
     * @param {HTMLElement} [cfg.boundBy=document.body] - Bound the popover to specific region, this will force reposition of the popover
     * @param {boolean} [cfg.pointy=false] - disabled for now
     * @param {object} [cfg.style={}] - style to deploy to the popover
     * @param {string} [cfg.className=''] - className for the popover
     *
     * @example
     *
import {Popover} from 'react-ui'

Popover.openId(
    'my-popover-id',
    {x:15,y:15},
    <img src='...' style={{maxWidth:100,maxHeight:100}}/>,
    {boundBy:document.body, draggable:false}
)

     */
    openId(id, pos, display, cfg) {
        if (!id) {
            log.error('openId:missing id')
            return
        }

        cfg = _.defaults(cfg||{}, {
            draggable: false,
            boundBy: document.body,
            pointy: false,
            style: {},
            className: ''
        })

        let handle = handles[id]

        if (!handle) {
            let node = document.createElement('DIV')
            node.id = id
            document.body.appendChild(node)
            ReactDOM.render(
                <Popover ref={ref=>{
                  handle=handles[id]=ref
                  openPopover(handle, pos, display, cfg)
                }}/>,
                document.getElementById(id)
            )
        }
        else {
            openPopover(handle, pos, display, cfg)
        }
    },

    /**
     * Close popover
     *
     * @example
Popover.close();
     */
    close() {
        this.closeId(GLOBAL_POPOVER_ID)
    },

    /**
     * Close popover for given id
     * @param {string} id - close popover for this id
     *
     * @example
Popover.closeId('my-popover-id');
     */
    closeId(id) {
        handles[id] && handles[id].close()
    }
}