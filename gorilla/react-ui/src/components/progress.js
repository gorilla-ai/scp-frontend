/**
  * @module progress
  * @description A module to help with blocking user access by displaying a shield and text.<br>
  * It supports various styles of display.
  *
  * * Progress.startXxxxx starts up blocking display
  * * Progress.setXxxxx updates blocking display
  * * Progress.done closes blocking display
  */

import React from 'react'
import ReactDom from 'react-dom'
import cx from 'classnames'
import _ from 'lodash'

import ModalDialog from './modal-dialog'

let log = require('loglevel').getLogger('react-ui/components/progress')

let globalProgress = null

const INITIAL_STATE = {
    display: null,
    loaded: null,
    total: null,
    className: '',
    style: {}
}

class Progress extends React.Component {
    static propTypes = {
    };

    state = _.clone(INITIAL_STATE);

    setDisplay = (display) => {
        this.setState({display})
    };

    setProgress = (loaded, total) => {
        this.setState({loaded, total})
    };

    open = (args) => {
        this.setState({global:true, opacity:0.5, ...args})
    };

    done = () => {
        this.setState(_.clone(INITIAL_STATE))
    };

    render() {
        let {display, loaded, total, opacity, className, style, global} = this.state

        return <ModalDialog
            id='g-progress'
            show={!!display}
            opacity={opacity}
            global={global}
            useTransition={true}
            className={className} style={style}>
            {display}
            {
                total && <progress value={loaded} max={total} />
            }
            {
                total && <span>{Math.floor(loaded/total*100)}%</span>
            }
        </ModalDialog>
    }
}

class Shield extends React.Component {
    static propTypes = {
    };

    state = {
        show: false
    };

    open = (args) => {
        this.setState({...args, show:true})
    };

    done = () => {
        this.setState({show:false})
    };

    render() {
        let {show, opacity} = this.state
        return <section id='g-progress' className={cx('c-modal', {show})}>
            <div id='overlay' style={{opacity}} />
        </section>
    }
}

function showProgress(args, shieldOnly) {
    if (!globalProgress) {
        const node = document.createElement('DIV')
        const ProgressComponent = shieldOnly ? Shield : Progress;

        node.id = 'g-progress-container'
        document.body.appendChild(node)

        ReactDom.render(
          (<ProgressComponent ref={el => {
            globalProgress = el
            globalProgress && globalProgress.open(args)
          }} />),
          document.getElementById('g-progress-container')
        )
    }
    else {
      globalProgress && globalProgress.open(args)
    }
}

export default {
    /**
     * Show blocking display
     * @param {object} cfg - Display config
     * @param {number} [cfg.opacity=0.5] -
     * @param {*} [cfg.className] -
     * @param {boolean} [cfg.global=true] -
     * @param {renderable} cfg.display -
     * @param {object} [cfg.style] -
     *
     * @example
     *
import {Progress} from 'react-ui'

Progress.start({
    className:['my-class-name','my-other-class-name'],
    display:<div>In progress...</div>
})

     */
    start(args) {
        showProgress(args)
    },

    /**
     * Show blocking progress display
     * @param {renderable} display -
     *
     * @example
     *
import {Progress} from 'react-ui'

Progress.startProgress(<div>Start upload...</div>)

     */
    startProgress(display) {
        showProgress({
            opacity: 0.5,
            className: 'progress-bar',
            display
        })
    },

    /**
     * Show blocking spinner
     *
     * @example
     *
import {Progress} from 'react-ui'

Progress.startSpin()

     */
    startSpin() {
        showProgress({
            opacity: 0.2,
            className: 'spin',
            display: <i style={{fontSize:'1.8em', margin:'10px'}} className='fg fg-loading-2 fg-spin' />
        })
    },

    /**
     * Show blocking transparent shield
     *
     * @example
     *
import {Progress} from 'react-ui'

Progress.startShield()

     */
    startShield() {
        showProgress({opacity:0}, true)
    },

    /**
     * Update display text
     *
     * @example
     *
import {Progress} from 'react-ui'

Progress.set(<div>5 more minutes...</div>)

     */
    set(display) {
        globalProgress.setDisplay(display)
    },

    /**
     * Update percentage information
     * @param {number} complete - complete count
     * @param {number} total - total count
     *
     * @example
     *
import {Progress} from 'react-ui'

Progress.setProgress(1,40) // will display 2.5%

     */
    setProgress(loaded, total) {
        globalProgress.setProgress(loaded, total)
    },

    /**
     * Turn off blocking display
     * @param {number} [delay=0] - turn off after specified time (in milliseconds)
     *
     * @example
     *
import {Progress} from 'react-ui'

Progress.done()
Progress.done(3000)

     */
    done(delay=0) {
        setTimeout(()=>{
            globalProgress.done()
        }, delay)
    }
}