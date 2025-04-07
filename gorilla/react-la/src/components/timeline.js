import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'

import Timebar from 'react-timebar'
import {default as La, LAYOUTS} from './index'


const log = require('loglevel').getLogger('react-la/components/timeline')


class ReactLaTimeline extends React.Component {
    static propTypes = {
        timebar: PropTypes.object,
        items: PropTypes.arrayOf(PropTypes.object),
        show: PropTypes.arrayOf(PropTypes.string),
        showStatic: PropTypes.bool,
        layoutOnFilter: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.oneOf([...LAYOUTS, 'tweak'])
        ]),
        layoutOnPlay: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.oneOf([...LAYOUTS, 'tweak'])
        ]),
        _ref: PropTypes.func
    };

    static defaultProps = {
        showStatic: false,
        layoutOnFilter: false,
        layoutOnPlay: 'tweak'
    };

    constructor(props, context) {
        super(props, context);
        const {items, show, layoutOnFilter} = props

        this.state = {
            timebarItems: this.generateTimebarItems(items, show),
            show,
            layoutOnFilter
        };
    }

    componentWillReceiveProps(nextProps) {
        const {show:prevShow, items:prevItems, layoutOnFilter} = this.props
        const {show, items} = nextProps
        if (items !== prevItems || show !== prevShow) {
            this.setState({
                timebarItems: this.generateTimebarItems(items, show),
                show,
                layoutOnFilter
            }, ()=>{
                this.timebarNode.resetView()
            })
        }
    }

    generateTimebarItems = (items, show) => {
        if (show && show.length<=0) {
            return []
        }

        const itemsByKey = _.keyBy(items, 'id')
        const nodeIds = _.filter(show, showId=>_.get(itemsByKey, [showId, 'type'])==='node')
        let linkIds = !show || show.length===nodeIds.length ? _(items).filter({type:'link'}).map('id').value() : _.difference(show, nodeIds)
        const filterNodes = nodeIds.length>0

        const result = _.reduce(linkIds, (acc, linkId)=>{
            const link = itemsByKey[linkId]
            if (!filterNodes || (_.includes(nodeIds, link.id1) && _.includes(nodeIds, link.id2))) {
                return [
                    ...acc,
                    link
                ]
            }
            return acc
        }, [])

        return result
    };

    getItemsInRange = (items, timebarItems, curShow, timeRange, timebarInstance, showStatic) => {
        const itemsByKey = _.keyBy(items, 'id')
        const nodeIds = _.filter(curShow, showId=>_.get(itemsByKey, [showId, 'type'])==='node')
        const linkIds = _.reduce(timebarItems, (acc, timebarItem)=>{
            const {id, dt} = timebarItem
            const isStatic = dt==null || (_.isArray(dt) && dt.length<=0)
            if (
                (showStatic && isStatic) ||
                (!isStatic && timebarInstance.inRange(id))
            ) {
                return [
                    ...acc,
                    id
                ]
            }
            return acc
        }, [])
        return [...nodeIds, ...linkIds]
    };

    updateItemsToShowWithRange = (curShow, timeRange) => {
        const {items, showStatic, layoutOnPlay} = this.props
        const {show:prevShow, timebarItems} = this.state

        const newShow = this.getItemsInRange(items, timebarItems, curShow, timeRange, this.timebarNode.timebar, showStatic)

        if (prevShow === newShow) {
            return
        }

        if (prevShow==null || newShow==null) {
            this.setState({
                show: newShow
            })
            return
        }

        const numShared = _.intersection(prevShow, newShow).length
        if (numShared!==prevShow.length || numShared!==newShow.length) {
            this.setState({
                show: newShow,
                layoutOnFilter: layoutOnPlay
            })
        }
    };

    handleRangeChange = (timeRange) => {
        const {show} = this.props
        this.updateItemsToShowWithRange(show, timeRange)
    };

    handleRef = (instance) => {
        this.laNode = instance
        if (_.has(this.props, '_ref')) {
            this.props._ref(instance)
        }
    };

    resize = () => {
        this.laNode.resize()
        this.timebarNode.resize()
    };

    render() {
        const {
            showStatic,
            layoutOnPlay,
            timebar: timebarProps={},
            children: originalChildren=[],
            ...componentProps
        } = this.props
        const {timebarItems, show, layoutOnFilter} = this.state

        const TimebarElement = <Timebar
            ref={ref=>{ this.timebarNode=ref }}
            onRangeChange={this.handleRangeChange}
            {...timebarProps}
            items={timebarItems} />

        return <La
            {...componentProps}
            layoutOnFilter={layoutOnFilter}
            show={show}
            _ref={this.handleRef} >
            {[
                TimebarElement,
                ...originalChildren
            ]}
        </La>
    }
}


export default ReactLaTimeline