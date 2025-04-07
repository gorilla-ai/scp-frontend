import PropTypes from 'prop-types';
import React from 'react'
import createReactClass from 'create-react-class';
import _ from 'lodash'
import cx from 'classnames'
import Promise from 'bluebird'

import {
    PopupDialog, Popover, Contextmenu, Progress,
    ModalDialog, Dropdown
} from 'core/components'

import {LinkedStateMixin} from 'core/mixins/linked-state-mixins'

import createExample from './example-factory'

let Examples = {}

const INITIAL_STATE = {
    open: false,
    info: null,
    error: false,
    movieId: null
}
const RateMovieDialog = createReactClass({
    displayName: 'RateMovieDialog',

    propTypes: {
        onDone: PropTypes.func
    },

    mixins: [LinkedStateMixin],

    getInitialState() {
        return _.clone(INITIAL_STATE)
    },

    open(movieId, {rating}) {
        // ajax get movie details by id
        this.setState({movieId, rating, open:true})
    },

    close(changed, data) {
        this.setState(_.clone(INITIAL_STATE), () => {
            this.props.onDone(changed, data)
        })
    },

    rateMovie() {
        let {rating} = this.state
        // can be ajax to post rating
        if (rating) {
            this.close(true, {rating})
        }
        else {
            this.setState({info:'Please select rating', error:true})
        }
    },

    render() {
        let {movieId, open, info, error} = this.state
        if (!open) {
            return null
        }

        let actions = {
            cancel: {text:'Cancel', className:'standard', handler:this.close.bind(this, false, null)},
            confirm: {text:'OK!', handler:this.rateMovie}
        }
        return <ModalDialog
            id='rate-movie-dialog'
            title={`Rate ${movieId}!`}
            draggable={true}
            global={true}
            info={info}
            infoClassName={cx({'c-error':error})}
            actions={actions}>
            <Dropdown
                list={_.map(_.range(1, 11), i=>({value:i, text:i}))}
                valueLink={this.linkState('rating')} />
        </ModalDialog>
    },
})

Examples.ModalDialog = class extends React.Component {
    state = {
        movieId: 1,
        data: {}
    };

    showRating = () => {
        let {movieId, data} = this.state
        this.dialog.open(movieId, data)
    };

    handleDone = (changed, data) => {
        if (changed) {
            this.setState({data})
        }
    };

    render() {
        return <div>
            <button onClick={this.showRating}>Rate Movie!</button>
            <RateMovieDialog ref={ref=>{ this.dialog=ref }} onDone={this.handleDone} />
        </div>
    }
}


Examples.PopupDialog = class extends React.Component {
    state = {
        prompt: null,
        confirm: null
    };

    alert = () => {
        PopupDialog.alert({
            title: 'ALERT',
            display: 'Error!'
        })
    };

    prompt = () => {
        PopupDialog.prompt({
            display: <div className='c-form'>
                <div><label htmlFor='name'>Name</label><input type='text' id='name' /></div>
                <div><label htmlFor='phone'>Phone</label><input type='text' id='phone' /></div>
                <div><label htmlFor='address'>Address</label><input type='text' id='address' /></div>
            </div>,
            act: (confirmed, data)=>{
                if (confirmed) {
                    this.setState({prompt:data})
                    // return Promise.resolve($.post('/api/save/user',data)) // post user information
                }
            }
        })
    };

    confirm = () => {
        PopupDialog.confirm({
            title: 'DELETE?',
            display: 'Are you sure you want to delete?',
            cancelText: 'NOOO',
            confirmText: 'YESSS',
            act: (confirmed) => {
                if (confirmed) {
                    // do something, eg ajax to DELETE
                }
                this.setState({
                    confirm: confirmed
                })
            }
        })
    };

    openChild = () => {
        PopupDialog.alertId('g-nested-popup-container', {
            title: 'Child Dialog',
            display: 'NESTED!!',
            confirmText: 'Close Child'
        })
    };

    openParent = () => {
        PopupDialog.alert({
            title: 'Nested Parent Dialog',
            display: <button onClick={this.openChild}>Show child dialog</button>,
            confirmText: 'Close Parent'
        })
    };

    render() {
        return <div>
            <button onClick={this.alert}>Show me alert!</button>
            <button onClick={this.prompt}>Ask me something!</button>
            <button onClick={this.confirm}>Show confirmation!</button>
            <button onClick={this.openParent}>Try nested dialog!</button>
        </div>
    }
}


Examples.Popover = class extends React.Component {
    openPopover = (evt) => {
        Popover.openId(
            'my-popover-id',
            evt,
            <img alt='popover' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9ShYQxVabIxy5akkOaFXZiCOfP0WQvmDXaSAq52bjW4xqFy8q' style={{maxWidth:100, maxHeight:100}} />,
            {pointy:true}
        )
    };

    closePopover = () => {
        Popover.closeId('my-popover-id')
    };

    render() {
        return <span onMouseOver={this.openPopover} onMouseOut={this.closePopover}>
            hover over me
        </span>
    }
}


Examples.Contextmenu = class extends React.Component {
    state = {};

    fetchMovieDetails = (source) => {
        // load data from source
        this.setState({source})
    };

    handleContextMenu = (evt) => {
        let menuItems = _.map(['imdb', 'rotten'], source=>{
            return [
                {text:`${source} header`, isHeader:true},
                {id:source, text:`Fetch ${source} Data`, action:this.fetchMovieDetails.bind(this, source)},
                {id:`${source}-disabled`, text:`${source} Disabled Item`, disabled:true}
            ]
        })
        Contextmenu.open(evt, _.flatten(menuItems))
    };

    render() {
        return <span className='c-link' onContextMenu={this.handleContextMenu}>
            Right click on me
        </span>
    }
}

Examples.Progress = class extends React.Component {
    startProgress = () => {
        Promise.delay(100)
            .then(()=>{ Progress.startProgress('Uploading...') })
            .then(()=>{ return Promise.delay(1000) })
            .then(()=>{ Progress.setProgress(50, 100) })
            .then(()=>{ return Promise.delay(2000) })
            .then(()=>{ Progress.setProgress(100, 100) })
            .then(()=>{ return Promise.delay(1000) })
            .then(()=>{ Progress.set('Done!') })
            .then(()=>{ return Promise.delay(1000) })
            .then(()=>{ Progress.done() })
    };

    startSpin = () => {
        Progress.startSpin()
        Progress.done(2000)
    };

    render() {
        return <div>
            <button onClick={this.startProgress}>Simulate Upload Progress</button>
            <button onClick={this.startSpin}>Simulate Spin</button>
        </div>
    }
}

export default class extends React.Component {
    render() {
        return <div id='example-tabs'>
            {
                _.map(Examples, (example, key)=>{
                    return React.createElement(createExample(example, key), {key})
                })
            }
        </div>
    }
}

