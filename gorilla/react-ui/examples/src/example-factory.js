import React from 'react'
import _ from 'lodash'

export default function (Component, title) {
    return class extends React.Component {
        state = {};

        componentDidMount() {
            this.interval = setInterval(()=>{
                this.updateStateInfo()
            }, 500)
        }

        componentWillUnmount() {
            clearInterval(this.interval)
        }

        updateStateInfo = () => {
            if (JSON.stringify(this.component.state || {}) !== JSON.stringify(this.state)) {
                this.setState(this.component.state || {})
            }
        };

        render() {
            return <fieldset>
                <legend>{title}</legend>
                <div className='example'>
                    <div className='demo'>
                        <Component ref={ref=>{ this.component=ref }} />
                    </div>
                    <pre className='state'>
                        {
                            _.map(_.omitBy(this.state, (v, k)=>_.startsWith(k, '_')), (v, k)=>{
                                const isHtml = _.startsWith(k, '$')
                                return <div key={k}>
                                    <label>{k}:</label>
                                    <div>{isHtml ? v : JSON.stringify(v, null, '  ')}</div>
                                </div>
                            })
                        }
                    </pre>
                </div>
            </fieldset>
        }
    };
}