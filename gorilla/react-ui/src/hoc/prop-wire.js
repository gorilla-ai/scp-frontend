import _ from 'lodash'
import React from 'react'
import im from 'object-path-immutable'

const log = require('loglevel').getLogger('react-ui/hoc/prop-wire')


export function wireSet(Component, propsCfg) {
    propsCfg = _.mapValues(propsCfg, (cfg, propName)=>{
        const {name=propName, linkName, defaultName, changeHandlerName, defaultValue, enforceHandler=true} = cfg
        return {
            name,
            linkName: linkName || propName+'Link',
            defaultName: defaultName || 'default'+_.capitalize(propName),
            changeHandlerName: changeHandlerName || 'on'+_.capitalize(propName)+'Change',
            defaultValue: _.has(cfg, 'defaultValue') ? defaultValue : '',
            enforceHandler
        }
    })

    return class extends React.Component {
        state = _.mapValues(propsCfg, ({name, linkName, defaultName, defaultValue:masterDefaultValue}) => {
            let val = _.get(this.props, name)
            const valueLink = _.get(this.props, linkName)
            const defaultValue = _.get(this.props, defaultName)

            if (val==null && valueLink) {
                val = valueLink.value
            }
            if (val == null) {
                val = defaultValue
            }

            if (val == null) {
                if (_.isFunction(masterDefaultValue)) {
                    val = masterDefaultValue(this.props)
                }
                else {
                    val = masterDefaultValue
                }
            }

            return val
        });

        componentWillReceiveProps(nextProps) {
            const nextState = _.mapValues(propsCfg, ({name, linkName, defaultName, defaultValue:masterDefaultValue}, propName) => {
                const isControlled = _.has(nextProps, name)

                let val = _.get(nextProps, name)
                const valueLink = _.get(nextProps, linkName)
                const defaultValue = _.get(nextProps, defaultName)

                let {[propName]:curVal} = this.state

                if (val==null && valueLink) {
                    val = valueLink.value
                }

                if (val == null) {
                    if (isControlled) {
                        val = defaultValue

                        if (val == null) {
                            if (_.isFunction(masterDefaultValue)) {
                                val = masterDefaultValue(nextProps)
                            }
                            else {
                                val = masterDefaultValue
                            }
                        }
                    }
                    else {
                        val = curVal
                    }
                }

                return val
            })

            this.setState(nextState)
        }

        handleChange = (propName, newVal, eventInfo) => {
            const {name, linkName, changeHandlerName, enforceHandler} = propsCfg[propName]
            const isControlled = _.has(this.props, name)
            const valueLink = _.get(this.props, linkName)
            const handler = _.get(this.props, changeHandlerName)

            const eventData = {
                before: this.state[propName],
                ...eventInfo
            }

            if (isControlled && handler) {
                handler(newVal, eventData)
            }
            else if (isControlled && !handler && enforceHandler) {
                log.error(`handleChange::${Component.displayName}::${propName}. Controlled component without a '${JSON.stringify(changeHandlerName)}' event prop`)
            }
            else if (valueLink) {
                valueLink.requestChange(newVal, eventData)
            }
            else {
                this.setState({[propName]:newVal}, () => {
                    if (handler) {
                        handler(this.state[propName], eventData)
                    }
                })
            }
        };

        render() {
            const propsToIgnore = _.reduce(propsCfg, (acc, {name, linkName, defaultName, changeHandlerName})=>{
                return [
                    ...acc,
                    name,
                    linkName,
                    defaultName,
                    changeHandlerName
                ]
            }, [])

            const baseProps = _.omit(this.props, propsToIgnore)

            const newProps = _.reduce(propsCfg, (acc, {name, changeHandlerName}, propName)=>{
                return im(acc)
                    .set(name, this.state[propName])
                    .set(changeHandlerName, this.handleChange.bind(this, propName))
                    .value()
            }, baseProps)

            return React.createElement(Component, {
                ...newProps,
                ref: ref=>{ this._component=ref }
            })
        }
    };
}

export function wire(Component, propName, defaultValue='', changeHandlerName='onChange') {
    return wireSet(Component, {
        [propName]: {
            defaultValue,
            changeHandlerName
        }
    })
}

export function wireValue(Component) {
    return wire(Component, 'value')
}

export function wireChecked(Component) {
    return wire(Component, 'checked', false)
}

export default {
    wireValue,
    wireChecked,
    wire
}