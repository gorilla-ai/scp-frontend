import PropTypes from 'prop-types';
import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import Draggable from 'react-draggable'
import cx from 'classnames'
import _ from 'lodash'

import { SIMPLE_OBJECT_PROP } from '../consts/prop-types'

let log = require('loglevel').getLogger('react-ui/components/modal-dialog')

/**
 * A React modal dialog
 * @constructor
 * @param {string} [id] - Modal dialog element #id
 * @param {renderable} [title] - Title of the dialog
 * @param {object} actions - Define buttons and actions to trigger
 * @param {object} actions.key - Config for this **action**
 * @param {string} actions.key.text - action button text
 * @param {string} actions.key.className - action button className
 * @param {boolean} [actions.key.disabled=false] - disable this action
 * @param {function} actions.key.handler - function to invoke when action is triggered (ie button clicked)
 * @param {string} [closeAction] - Action to invoke when close(x) icon is clicked
 * @param {string} [defaultAction] - Default action button **key** to focus on
 * @param {string} [className] - Additional classnames for modal container
 * @param {string} [contentClassName] - Additional classnames for the dialog content
 * @param {string} [controlClassName] - Additional classnames for the action buttons
 * @param {object} [style] - Style for the dialog
 * @param {number} [opacity=0.5] - Opacity for the background shield
 * @param {boolean} [show=true] - Show dialog or not?
 * @param {boolean} [useTransition=false] - Transition effect?
 * @param {boolean} [draggable=false] - Draggable header?
 * @param {boolean} [boolean=false] - Make dialog center of page?
 * @param {renderable} [info] - React renderable object, display info at footer, eg error message
 * @param {string} [infoClassName] - Assign className to info node
 * @param {renderable} children - Content of the dialog
 *
 * @example

import _ from 'lodash'
import {ModalDialog, Dropdown} from 'react-ui'
import {LinkedStateMixin} from 'core/mixins/linked-state-mixins'

const INITIAL_STATE = {
    open:false,
    info:null,
    error:false,
    movieId:null
}
const RateMovieDialog = React.createClass({
    mixins:[LinkedStateMixin],
    getInitialState() {
        return _.clone(INITIAL_STATE)
    },
    open(movieId, {rating}) {
        // ajax get movie details by id
        this.setState({movieId, rating, open:true})
    },
    close(changed, data) {
        this.setState(_.clone(INITIAL_STATE), () => {
            this.props.onDone(changed, data);
        });
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
        let {movieId, open, info, error} = this.state;
        if (!open) {
            return null
        }

        let actions = {
             cancel:{text:'Cancel', handler:this.close.bind(this,false,null)},
             confirm:{text:'OK!', className:'btn-ok', handler:this.rateMovie}
        }
        return <ModalDialog
             id='rate-movie-dialog'
             title={`Rate ${movieId}!`}
             draggable={true}
             global={true}
             info={info}
             infoClassName={cx({'c-error':error})}
             actions={actions}>
             <Dropdown list={_.map(_.range(1,11),i=>({value:i,text:i}))}
                 valueLink={this.linkState('rating')}/>
         </ModalDialog>
    }
})
 */
class ModalDialog extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        title: PropTypes.node,
        actions: PropTypes.objectOf(
            PropTypes.shape({
                className: PropTypes.string,
                text: PropTypes.node,
                disabled: PropTypes.bool,
                handler: PropTypes.func
            }).isRequired
        ).isRequired,
        closeAction: PropTypes.string,
        defaultAction: PropTypes.string,
        className: PropTypes.string,
        contentClassName: PropTypes.string,
        controlClassName: PropTypes.string,
        style: SIMPLE_OBJECT_PROP,
        opacity: PropTypes.number,
        show: PropTypes.bool,
        useTransition: PropTypes.bool,
        draggable: PropTypes.bool,
        global: PropTypes.bool,
        info: PropTypes.node,
        infoClassName: PropTypes.string,
        children: PropTypes.node
    };

    static defaultProps = {
        title: '',
        actions: {},
        opacity: 0.5,
        show: true,
        useTransition: false,
        draggable: false,
        global: false,
        className: ''
    };

    state = {
        show: this.props.show
    };

    componentDidMount() {
        this.focusAction()
    }

    componentWillReceiveProps(nextProps) {
        this.setState({show:nextProps.show})
    }

    componentDidUpdate() {
        this.focusAction()
    }

    toggle = (show) => {
        this.setState({show})
    };

    focusAction = () => {
        if (this.state.show) {
            let {defaultAction} = this.props

            if (defaultAction) {
                this[defaultAction+'Btn'].focus()
            }
        }
    };

    render() {
        let {id, useTransition} = this.props
        let {show} = this.state

        let modalContent = null

        if (show) {
            let {title, actions, closeAction: closeActionKey, className, contentClassName, controlClassName,
                style: dialogStyle, opacity, info, infoClassName, draggable,
                global, children} = this.props

            let actionNodes = _.map(_.keys(actions), actionKey => {
                let action = actions[actionKey]
                return <button
                    className={cx(controlClassName, action.className)}
                    disabled={action.disabled}
                    ref={ref=>{ this[actionKey+'Btn']=ref }}
                    key={actionKey}
                    name={actionKey}
                    onClick={action.handler}>
                    {action.text || actionKey}
                </button>
            })

            let closeAction = closeActionKey && actions[closeActionKey]

            let dialogContent = <section id={id+'-dialog'} className='c-box dialog' style={dialogStyle}>
                {
                        title ?
                            <header className={cx({handle:draggable}, 'c-flex')}>
                                {title}<i className='c-link fg fg-close end' onClick={closeAction ? closeAction.handler : this.toggle.bind(this, false)} />
                            </header> :
                        null
                    }
                <div id={id+'-content'} className={cx('content', contentClassName)}>{children}</div>
                {
                        (actionNodes.length>0 || info) &&
                        <footer>
                            {info && <div className={cx('c-info', infoClassName)} dangerouslySetInnerHTML={{__html:info}} />}
                            {actionNodes}
                        </footer>
                    }
            </section>

            modalContent = <section id={id} className={cx('c-modal show', global?'c-center global':'', className)}>
                <div id='overlay' style={{opacity}} />
                {
                    draggable ?
                        <Draggable handle='.handle' bounds='parent'>
                            {dialogContent}
                        </Draggable> :
                    dialogContent
                }
            </section>
        }


        return (useTransition ?
            (<ReactCSSTransitionGroup
                transitionName='c-modal'
                transitionEnterTimeout={200}
                transitionLeaveTimeout={300}>
                {modalContent}
            </ReactCSSTransitionGroup>) : modalContent
        )
    }
}

export default ModalDialog
