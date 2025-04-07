import React from 'react'

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
                        {JSON.stringify(this.state, null, '  ')}
                    </pre>
                </div>
            </fieldset>
        }
    };
}