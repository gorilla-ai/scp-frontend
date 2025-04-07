import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'


const SIMPLE_VALUE_PROP =
    PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ])

let log = require('loglevel').getLogger('core/components/input')

class TextArea extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        value: SIMPLE_VALUE_PROP,
        placeholder: SIMPLE_VALUE_PROP,
        onChange: PropTypes.func
    };

    static defaultProps = {
    };

    constructor(props, context) {
        super(props, context);
        let {value} = props

        this.state = {
            value: this.validateTextArea(value)
        };
    }

    validateTextArea = (value) => {
        return value==null?'':value
    };

    componentWillReceiveProps(nextProps) {
        let {value} = nextProps
        this.setState({
            value: this.validateTextArea(value)
        })
    }

    componentWillUnmount() {
    }

    changeHandler = (evt) => {
        let newVal = evt.target.value
        this.setState({value:newVal})
    };

    keyHandler = (evt) => {
        if (evt.keyCode === 13) {
            this.blurHandler(evt)
        }
    };

    blurHandler = (evt) => {
        let {value:oldVal} = this.props
        let {value:newVal} = this.state

        if (oldVal !== newVal) {
            let {onChange} = this.props
            console.log(newVal)
            onChange(newVal)
        }
    };

    render() {
        let {className, id, type, placeholder} = this.props
        let {value, error} = this.state

        let changeHandler = this.changeHandler

        switch (type) {
            default:
                return <textarea
                    id={id}
                    ref={ref=>{ this.input=ref }}
                    onChange={changeHandler}
                    onBlur={this.blurHandler}
                    onKeyUp={this.keyHandler}
                    placeholder={placeholder}
                    className={cx(className, {invalid:error})}
                    value={value} />
        }
    }
}

export default TextArea