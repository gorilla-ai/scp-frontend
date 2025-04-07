import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'

const log = require('loglevel').getLogger('react-ui/components/image')

/**
 * A React Image Component, with preloading options
 * @constructor
 * @param {string} [id] - Container element #id
 * @param {string} [className] - Classname for the container
 * @param {object} [style] - Styles for the container
 * @param {string} src - Image source url
 * @param {string} [alt] - Image alt
 * @param {boolean} [preload=true] - Allow preloading image? If false then will act as normal <img> tag
 * @param {number} [timeout=30000] - When preload is enabled, maximum time (in milliseconds) to wait before error kicks in
 * @param {string} [placeholder] - When preload is enabled, alternative image url to show when image load has failed
 * @param {renderable} [error='Load failed'] - When preload is enabled, error message to show when image load has filed
 *
 * @example
import {Image} from 'react-ui'

Examples.Image = React.createClass({
    render() {
        return <Image
            src='/images/missing.png'
            error=':('
            placeholder='/images/tiles/ic_alert_2.png' />
    }
})
 */

class Image extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        style: PropTypes.object,
        src: PropTypes.string.isRequired,
        alt: PropTypes.string,
        preload: PropTypes.bool,
        timeout: PropTypes.number,
        placeholder: PropTypes.string,
        error: PropTypes.node
    };

    static defaultProps = {
        preload: true,
        timeout: 30000,
        error: 'Load failed'
    };

    state = {
        done: false,
        error: false
    };

    componentDidMount() {
        const {preload} = this.props
        preload && this.createTimer()
    }

    componentWillReceiveProps(nextProps) {
        const {src, preload} = nextProps
        const {src:prevSrc} = this.props

        this.clearTimer()
        if (preload && prevSrc !== src) {
            this.setState({done:false, error:false})
            this.createTimer()
        }
    }

    componentWillUnmount() {
        this.clearTimer()
    }

    clearTimer = () => {
        if (this.timer) {
            clearTimeout(this.timer)
        }
    };

    createTimer = () => {
        const {timeout} = this.props
        this.clearTimer()
        this.timer = setTimeout(() => {
            this.handleDone(false)
        }, timeout)
    };

    handleDone = (success) => {
        this.clearTimer()
        if (!this.state.done) {
            this.setState({done:true, error:!success})
        }
    };

    render() {
        const {id, className, style, src, alt, preload, error, placeholder} = this.props
        const {error:hasError, done} = this.state

        if (preload) {
            if (!done) {
                return <div id={id} className={cx('c-image loading c-flex aic jcc', className)} style={style}>
                    <i className='fg fg-loading-2 fg-spin' />
                    <img
                        src={src}
                        alt={alt}
                        onError={this.handleDone.bind(this, false)}
                        onAbort={this.handleDone.bind(this, false)}
                        onLoad={this.handleDone.bind(this, true)} />
                </div>
            }
            else if (hasError) {
                return <div id={id} className={cx('c-image error c-flex aic jcc', className)} style={style}>
                    {error && <div className='error'>{error}</div>}
                    {placeholder && <img alt={alt} src={placeholder} />}
                </div>
            }
        }

        return <img
            id={id}
            className={cx('c-image complete', className)}
            style={style}
            src={src}
            alt={alt} />
    }
}

export default Image