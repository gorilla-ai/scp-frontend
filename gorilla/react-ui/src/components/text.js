import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import $ from 'jquery'

let log = require('loglevel').getLogger('react-ui/components/text')

/*
let isInParentView = function(el, parent) {
    let rect = el.getBoundingClientRect();
    let parent2 = parent.parentNode.getBoundingClientRect();
    return (
        rect.top > parent2.top &&
        rect.bottom < parent2.bottm
    );
}*/
class Text extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.any,
        maxLines: PropTypes.number,
        line: PropTypes.number,
        content: PropTypes.string,
        store: PropTypes.any
    };

    static defaultProps = {
        content: ''
    };

    state = {
        line: this.props.line || -1
    };

    componentDidMount() {
        if (this.props.store) {
            this.unsubscribe = this.props.store.listen((line) => {
                this.setState({line})
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.line && nextProps.line !== this.state.line) {
            this.setState({line:nextProps.line})
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.line !== this.state.line ||
            nextProps.maxLines !== this.props.maxLines ||
            nextProps.content !== this.props.content
    }

    componentDidUpdate() {
        let selected = $(this.node).find('li.selected')[0]
        if (!this.disableAutoScroll && selected/* && !isInParentView(selected, node)*/) {
            this.autoScrollComingUp = true
            selected.scrollIntoView(false)
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe()
        }
    }

    onScroll = () => {
        log.debug('onScroll')
        if (!this.autoScrollComingUp) {
            this.disableAutoScroll = true
        }
        this.autoScrollComingUp = false
    };

    renderListItem = (item, id) => {
        return <li key={id} className={cx({selected:id===this.state.line})}>
            <span className='line'>{id}.</span>
            <span>{item}</span>
        </li>
    };

    render() {
        let {className, content, maxLines, id} = this.props
        let lines = content.split('\n')
        let line = this.state.line
        let start = 1
        let end = lines.length

        if (maxLines) {
            start = Math.max(line-Math.floor(maxLines/2), 1)
            end = start+maxLines-1
            if (end > lines.length) {
                start = Math.max(1, start-(end-lines.length))
                end = lines.length
            }
            lines = lines.slice(start-1, end)
        }


        return <ul id={id} ref={ref=>{ this.node=ref }} className={cx('c-text', className)} onScroll={this.onScroll}>
            {
                _.map(lines, (val, i) => {
                    return this.renderListItem(val, start+i)
                })
            }
        </ul>
    }
}

export default Text