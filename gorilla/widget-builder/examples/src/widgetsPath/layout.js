import React from 'react'
import _ from 'lodash'

let log = require('loglevel').getLogger('chart/components/tes')

class Layout extends React.Component {
    constructor(props) {
        super(props)
        this.state = {info: 'initializing'}
    }


    componentDidUpdate(prevProps) {
    }

    initial() {
    }

    switchWidget(widget) {
        this.setState({nowWidget: widget})
    }

    render() {
        const {widgets, HOC} = this.props
        const {nowWidget} = this.state
        return <div id='g-demo' className='c-flex c-split vertical c-padding'>
            <div className='c-box fixed'>
                <header>清單</header>
                <div className='content c-flex fdc'>
                    {
                        _.map(widgets, (widget, name) => {
                            return <button key={name} className='standard fg fg-chart-pie' title={name} onClick={this.switchWidget.bind(this, {id: name, ...widget})}>
                                {name}
                            </button>
                        })
                    }
                </div>
            </div>
            <div className='c-flex fdc grow c-split horizontal inner'>
                <div className='c-box fixed'>
                    <header>測試區</header>
                    <div className='content'>
                        {nowWidget ? <HOC {...nowWidget}/> : null}
                    </div>
                </div>
            </div>
        </div>
    }
}

export default Layout