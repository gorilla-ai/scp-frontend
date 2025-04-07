import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'

let log = require('loglevel').getLogger('react-ui/components/page-nav')

/**
A React Page Navigation Component, containing following:
 * * (possible) prev button
 * * thumbnails for pages, up to configurable number of thumbnails (default to 9),
 * if total number of pages exceed configured number, will display '...' where appropriate
 * * (possible) next button
 *
 * @constructor
 * @param {number} [pages] - Total number of pages
 * @param {number} [current=1] - Current (highlighted) page number
 * @param {number} [thumbnails=9] - Maximum number of thumbnails to display
 * @param {string} [className] - Classname for the container
 * @param {function} onChange - Callback function when from/to is changed. <br> Required when value prop is supplied
 * @param {number} onChange.page - current selected page
 *
 * @example
 *
import _ from 'lodash'
import {PageNav} from 'react-ui'
 *
const PAGE_SIZE = 30

React.createClass({
    getInitialState() {
        return {
            movies:_(_.range(0,100)).map(i=>`Movie ${i}`), // 100 movies
            currentPage:1
        }
    },
    handleChange(currentPage) {
        this.setState({currentPage})
    },
    render() {
        let {movies, currentPage} = this.state;
        movies = movies.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE)
        return <div>
            <ul>
            {
                movies.map(movie=><li>{movie}</li>)
            }
            </ul>
            <PageNav pages={Math.ceil(movies/PAGE_SIZE)}
                current={currentPage}
                onChange={this.handleChange}/>
        </div>
    }
})

 */
class PageNav extends React.Component {
    static propTypes = {
        pages: PropTypes.number,
        current: PropTypes.number,
        thumbnails: PropTypes.number,
        className: PropTypes.string,
        onChange: PropTypes.func.isRequired
    };

    static defaultProps = {
        pages: null,
        current: 1,
        thumbnails: 9
    };

    gotoPage = (page) => {
        let {onChange} = this.props
        onChange(page)
    };

    renderThumb = (page, key) => {
        let {current} = this.props
        return <button
            key={key}
            className={cx('thumb', {current:current===page})}
            disabled={!page}
            onClick={this.gotoPage.bind(this, page)}>{page || '...'}</button>
    };

    render() {
        let {thumbnails, current, pages, className} = this.props

        if (!pages) {
            return null
        }

        // let endThumbs = Math.floor(thumbnails/4);
        let endThumbs = 2 // display 2 at both ends
        let midThumbs = thumbnails - (endThumbs*2)-2
        let list = []

        let midStart = Math.max(current-Math.floor(midThumbs/2), endThumbs+1)
        let midEnd = midStart+midThumbs-1
        let lastSkipped = false

        if (midEnd >= pages-endThumbs) {
            midStart = Math.max(endThumbs+1, midStart-(midEnd-(pages-endThumbs)))
            midEnd = pages-endThumbs
            midStart--
        }

        if (midStart === endThumbs+1) {
            midEnd++
        }

        if (midStart === endThumbs+2) {
            midStart--
        }
        if (midEnd === pages-endThumbs-1) {
            midEnd++
        }

        _.forEach(_.range(1, pages+1), i => {
            if (i <= endThumbs || i>(pages-endThumbs) || (i>=midStart && i<=midEnd)) {
                list.push(this.renderThumb(i, i))
                lastSkipped = false
            }
            else {
                if (!lastSkipped) {
                    list.push(this.renderThumb(null, i))
                    lastSkipped = true
                }
            }
        })

        return <div className={cx('c-page-nav', className)}>
            <button className='thumb fg fg-arrow-left' disabled={current===1} onClick={this.gotoPage.bind(this, current-1)} />
            {list}
            <button className='thumb fg fg-arrow-right' disabled={current===pages} onClick={this.gotoPage.bind(this, current+1)} />
        </div>
    }
}

export default PageNav