import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import moment from 'moment'

import Timebar from 'react-timebar'
import Gis from './index'


const log = require('loglevel').getLogger('react-gis/components/timeline')


class ReactGisTimeline extends React.Component {
    static propTypes = {
        _ref: PropTypes.func,
        data: PropTypes.arrayOf(PropTypes.object),
        show: PropTypes.arrayOf(PropTypes.string),
        showStatic: PropTypes.bool,
        trackOptions: PropTypes.arrayOf(PropTypes.object),
        timebar: PropTypes.object,
        onLayoutChange: PropTypes.func
    };

    constructor(props, context) {
        super(props, context);
        const {show, data} = props

        this.state = {
            timebarItems: this.generateTimebarItems(data, show),
            timeRange: null,
            isTrackMode: false,
            show
        };
    }

    componentWillReceiveProps(nextProps) {
        const {show:prevShow, data:prevData} = this.props
        const {show, data} = nextProps
        if (data !== prevData || show !== prevShow) {
            this.setState({
                timebarItems: this.generateTimebarItems(data, show),
                show
            }, ()=>{
                this.timebarNode.resetView()
            })
        }
    }

    getItemsInRange = (layout, data, show, timeRange, showStatic) => {
        if (layout==='track') {
            return show
        }
        else {
            const dataByKey = _.keyBy(data, 'id')
            const newShow = _.filter(show || _.keys(dataByKey), showId=>{
                const item = dataByKey[showId]
                if (!item) {
                    return false
                }

                const {ts} = item
                const isStatic = ts==null || (_.isArray(ts) && ts.length<=0)
                if (
                    (showStatic && isStatic) ||
                    (!isStatic && this.timebarNode.timebar.inRange(showId))
                ) {
                    return true
                }
                return false
            })
            return newShow
        }
    };

    handleRangeChange = (timeRange) => {
        const {layout} = this.gisNode.props
        const {data, show, showStatic} = this.props
        if (layout === 'track') {
            this.setState({
                timeRange,
                isTrackMode: true,
                show
            })
        }
        else {
            const {show:prevShow} = this.state
            let newShow = this.getItemsInRange(layout, data, show, timeRange, showStatic)

            // optimize show so it only triggers show change when necessary
            if (newShow.length===data.length) {
                newShow = null
            }
            else if (prevShow) {
                const numShared = _.intersection(prevShow, newShow).length
                if (numShared===prevShow.length && numShared===newShow.length) {
                    newShow = prevShow
                }
            }
            this.setState({
                timeRange,
                isTrackMode: false,
                show: newShow
            })
        }
    };

    handleLayoutChange = (layout, eventInfo) => {
        const {data, show, showStatic, onLayoutChange} = this.props
        const {timeRange} = this.state
        const {before:prevLayout} = eventInfo


        if (layout==='track' || prevLayout==='track') {
            this.setState({
                isTrackMode: layout==='track',
                show: this.getItemsInRange(layout, data, show, timeRange, showStatic) //reset show
            })
        }

        if (onLayoutChange) {
            onLayoutChange(layout, eventInfo)
        }
    };

    handleRef = (instance) => {
        this.gisNode = instance
        if (_.has(this.props, '_ref')) {
            this.props._ref(instance)
        }
    };

    resize = () => {
        this.gisNode.resize()
        this.timebarNode.resize()
    };

    generateTimebarItems = (data, show) => {
        return _.reduce(data, (acc, item)=>{
            const {id, v, group, ts} = item
            if (!show || _.includes(show, id)) {
                let dt = ts
                if (dt) {
                    dt = _.map(_.isArray(dt)?dt:[dt], i=>moment(i).toDate())
                }
                if (!_.isEmpty(dt)) {
                    return [
                        ...acc,
                        {
                            id,
                            dt,
                            v,
                            group
                        }
                    ]
                }
                return acc
            }
            return acc
        }, [])
    };

    render() {
        const {timebar:timebarProps={}, trackOptions=[], children:originalChildren=[], ...componentProps} = this.props
        const {timebarItems, show, timeRange, isTrackMode} = this.state


        const TimebarElement = <Timebar
            ref={ref=>{ this.timebarNode=ref }}
            onRangeChange={this.handleRangeChange}
            {...timebarProps}
            items={timebarItems} />

        return <Gis
            timeRange={timeRange && isTrackMode ? [0, timeRange[1]] : null}
            {...componentProps}
            show={show}
            trackOptions={[
                {
                    props: {
                        showOngoing: true,
                        endSymbol: {
                            type: 'spot'
                        }
                    }
                },
                ...trackOptions
            ]}
            onLayoutChange={this.handleLayoutChange}
            _ref={this.handleRef} >
            {[
                TimebarElement,
                ...originalChildren
            ]}
        </Gis>
    }
}


export default ReactGisTimeline
