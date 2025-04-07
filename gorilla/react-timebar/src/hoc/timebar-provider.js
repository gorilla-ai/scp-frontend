import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import moment from 'moment'

import Timebar from '../components'

let log = require('loglevel').getLogger('react-timebar/hoc/timebar-provider')


export function withTimebar(Component, options={}) {
    const {target='data', idField='id', dtField='dt', vField='v', groupField='group'} = options
    const {
        generator=(items, show)=>{
            return _.reduce(items, (acc, item)=>{
                const {[idField]:itemId} = item
                if (!show || _.includes(show, itemId)) {
                    let dt = _.get(item, dtField)
                    if (dt) {
                        dt = _.map(_.isArray(dt) ? dt : [dt], i=>moment(i).toDate())
                    }

                    return [
                        ...acc,
                        {
                            id: itemId,
                            dt,
                            v: _.get(item, vField),
                            group: _.get(item, groupField)
                        }
                    ]
                }
                return acc
            }, [])
        },
        showGenerator=(items, timebarItems, curShow, timeRange, timebarInstance, showStatic)=>{
            let newShow = []
            _.forEach(timebarItems, (timebarItem)=>{
                const {id, dt} = timebarItem
                if (curShow && !_.includes(curShow, id)) {
                    return
                }

                const isStatic = dt==null || (_.isArray(dt) && dt.length<=0)
                if (
                    (isStatic && showStatic) ||
                    (!isStatic && timebarInstance.inRange(id))
                ) {
                    newShow.push(id)
                }
            })
            newShow = newShow.length===timebarItems.length ? null : newShow
            return newShow
        }
    } = options

    let propTypes = {
        timebar: PropTypes.object,
        items: PropTypes.arrayOf(PropTypes.object),
        show: PropTypes.arrayOf(PropTypes.string),
        showStatic: PropTypes.bool
    }

    return class extends React.Component {
        static propTypes = propTypes;

        static defaultProps = {
            showStatic: false
        };

        constructor(props) {
            super(props);
            const {
                [target]: items,
                show
            } = props

            this.state = {
                timebarItems: generator(items, show),
                show
            };
        }

        componentWillReceiveProps(nextProps) {
            const {show:prevShow, [target]:prevItems} = this.props
            const {show, [target]:items} = nextProps
            if (items !== prevItems || show !== prevShow) {
                this.setState({
                    timebarItems: generator(items, show),
                    show
                }, ()=>{
                    this.timebarNode.resetView()
                })
            }
        }

        updateItemsToShowWithRange = (curShow, timeRange) => {
            const {items, showStatic} = this.props
            const {show:prevShow, timebarItems} = this.state

            const newShow = showGenerator(items, timebarItems, curShow, timeRange, this.timebarNode.timebar, showStatic)

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
                    show: newShow
                })
            }
        };

        handleRangeChange = (timeRange) => {
            const {show} = this.props
            this.updateItemsToShowWithRange(show, timeRange)
        };

        render() {
            const {timebar:timebarProps={}, children:originalChildren=[], ...componentProps} = this.props
            const {timebarItems, show} = this.state

            const TimebarElement = <Timebar
                ref={ref=>{ this.timebarNode=ref }}
                onRangeChange={this.handleRangeChange}
                {...timebarProps}
                items={timebarItems} />

            return <Component
                {...componentProps}
                show={show}>
                {[
                    TimebarElement,
                    ...originalChildren
                ]}
            </Component>
        }
    };
}

export default withTimebar