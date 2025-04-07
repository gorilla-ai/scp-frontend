/**
  * @module contextmenu
  * @description A module to help with opening/closing **global** context menu:
  * * When user clicks on a menu item, callback function will be fired
  * * when user clicks elsewhere on screen, menu will be closed
  *
  * Note. There can only be one context menu displayed on screen at one point in time
  */

import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'
import cx from 'classnames'

import {subscribe} from '../utils/outside-event'

let log = require('loglevel').getLogger('react-ui/components/contextmenu')

let globalContextMenu = null

class Contextmenu extends React.Component {
    static propTypes = {
    };

    state = {};

    componentDidMount() {
        this.addHandler()
    }

    componentDidUpdate() {
        this.handler.unsubscribe()
        if (this.isOpen()) {
            this.addHandler()
        }
    }

    componentWillUnmount() {
        this.handler.unsubscribe()
    }

    onClickInside = (target) => {
        let targetId = target.id
        let {menu} = this.state

        let targetMenuItem = _.find(menu, {id:targetId})

        if (targetMenuItem && targetMenuItem.action) {
            targetMenuItem.action()
            this.setState({menu:[]})
        }
    };

    onClickOutside = () => {
        this.setState({menu:[]})
    };

    open = (position, menu, id) => {
        this.setState({menu, position, id})
    };

    isOpen = () => {
        return !_.isEmpty(this.state.menu)
    };

    addHandler = () => {
        this.handler = subscribe(this.node)
            .onInside(this.onClickInside)
            .onOutside(this.onClickOutside)
    };

    render() {
        let {menu, position, id} = this.state

        if (!this.isOpen()) {
            return null
        }
        else {
            let {x, y} = position
            let style={left:x+'px', top:y+'px'}
            return <ul ref={ref=>{ this.node=ref }} id={id} className='c-contextmenu c-menu sub' style={style}>
                {
                    _.map(menu, ({id:itemId, text, className, isHeader, disabled}, idx) => {
                        return <li className={cx(className, {header:isHeader, disabled})} id={itemId} key={idx}>{text || id}</li>
                    })
                }
            </ul>
        }
    }
}

export default {
    /**
     * Open context menu
     * @param {event|object} evt - event or simuated event with location information
     * @param {number} evt.pageX - x position to open menu at
     * @param {number} evt.pageY - y position to open menu at
     * @param {Array.<object>} menu - Menu to show on screen<br>Each item has the follow properties:
     * @param {string} menu.id - menu item id/key
     * @param {renderable} [menu.text=id] - menu item text
     * @param {function} [menu.action] - function to call when item is clicked
     * @param {string} [menu.className] - className for this item
     * @param {boolean} [menu.isHeader=false] - whether this item denotes a header for a group of items
     * @param {boolean} [menu.disabled=false] - whether this item is disabled
     * @param {string} [id] - id for the contextmenu
     *
     * @example
     *
import {Contextmenu} from 'react-ui'

React.createClass({
    getInitialState() {
        return {}
    },
    fetchMovieDetails(source) {
        // load data from source
        this.setState({source})
    },
    handleContextMenu(evt) {
        let menuItems = _.map(['imdb','rotten'], source=>{
            return {id:source, text:`Fetch ${source} Data`, action:this.fetchMovieDetails.bind(this,source)}
        })
        Contextmenu.open(evt, menuItems);
    },
    render() {
        return <span className='c-link' onContextMenu={this.handleContextMenu}>
            Right click on me
        </span>
    }
})

     */
    open(evt, menu, id) {
        evt.preventDefault && evt.preventDefault()
        if (!globalContextMenu) {
            let node = document.createElement('DIV')
            node.id = 'g-cm-container'
            document.body.appendChild(node)
            globalContextMenu = ReactDOM.render(
                <Contextmenu />,
                document.getElementById('g-cm-container')
            )
        }
        globalContextMenu.open({x:evt.pageX, y:evt.pageY}, menu, id)
    },

    /**
     * Check if context menu is open
     * @return {boolean} Is open?
     *
     * @example
console.log(Contextmenu.isOpen())
     */
    isOpen() {
        return globalContextMenu && globalContextMenu.isOpen()
    },


    /**
     * Close context menu if opened
     *
     * @example
Contextmenu.close();
     */
    close() {
        globalContextMenu && globalContextMenu.onClickOutside()
    }
}
