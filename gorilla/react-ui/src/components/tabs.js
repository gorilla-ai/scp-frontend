import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'

import {wire} from '../hoc/prop-wire'


let log = require('loglevel').getLogger('react-ui/components/tabs')

/**
 * A React Tabs view component
 * @constructor
 * @param {string} [id] - Tab dom element #id
 * @param {string} [className] - Classname for the container
 * @param {object} menu Tab menu config
 * @param {object} menu.key menu item config
 * @param {renderable} menu.key.title menu item title
 * @param {string} menu.key.disabled is menu item disabled (cannot select)?
 * @param {string} [defaultCurrent] - Default selected tab key
 * @param {string} [current] - Current selected tab key
 * @param {object} [currentLink] - Link to update selected tab key. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} currentLink.value - value to update
 * @param {function} currentLink.requestChange - function to request value change
 * @param {object} [defaultContents] - Key-node pair of what to display in each tab by default
 * @param {renderable} [children] - Current tab content
 * @param {function} [onChange] - Callback function when tab is selected. <br> Required when current prop is supplied
 * @param {string} onChange.value - selected tab key
 * @param {object} onChange.eventInfo - event related info
 * @param {string} onChange.eventInfo.before - previously selected tab
 *
 * @todo  Maybe don't need defaultContents??
 *
 * @example
// controlled

import {Tabs} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            currentTab:'movies'
        }
    },
    handleTabChange(newTab) {
        this.setState({currentTab: newTab})
    },
    renderMovies() {
        return 'movie list'
    },
    renderActors() {
        return 'actor list'
    },
    render() {
        let {currentTab} = this.state;
        return <Tabs id='imdb'
            menu={{
                movies: 'MOVIES',
                actors: 'ACTORS',
                tv: {title:'TV', disabled:true}
            }}
            current={currentTab}
            onChange={this.handleTabChange}>
            {
                currentTab==='movies' ? this.renderMovies() : this.renderActors()
            }
        </Tabs>
    }
})
 */
class Tabs extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        menu: PropTypes.objectOf(
            PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.shape({
                    title: PropTypes.node,
                    disabled: PropTypes.bool
                })
            ])
        ),
        current: PropTypes.string,
        defaultContents: PropTypes.objectOf(PropTypes.node),
        children: PropTypes.node,
        onChange: PropTypes.func
    };

    static defaultProps = {
        menu: {},
        defaultContents: {}
    };

    handleTabChange = (evt) => {
        let {onChange} = this.props

        onChange(evt.currentTarget.id)
    };

    render() {
        let {menu, current, defaultContents, id, className, children} = this.props

        let defaultContent = defaultContents[current]

        return (
            <div id={id} className={cx('c-tabs', className)}>
                <ol className='menu'>
                    {
                    _.map(menu, (item, key) => {
                        let isCurrent = (key === current)
                        let disabled = false
                        let title = ''
                        if (_.isString(item)) {
                            title = item
                        }
                        else {
                            title = item.title || key
                            disabled = item.disabled
                        }
                        let tabClassName = {
                            current: isCurrent,
                            disabled
                        }
                        return <li
                            id={key}
                            key={key}
                            className={cx(tabClassName)}
                            onClick={isCurrent||disabled ? null : this.handleTabChange}>
                            {title}
                        </li>
                    })
                }
                </ol>
                <div id={current} className='tabContent'>
                    { children || defaultContent }
                </div>
            </div>
        )
    }
}

export default wire(Tabs, 'current')
