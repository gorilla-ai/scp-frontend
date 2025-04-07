import _ from 'lodash'
import PropTypes from 'prop-types';
import React from 'react'

const log = require('loglevel').getLogger('react-ui/hoc/list-normalizer')


export function normalize(Component, listPropName='list', transformPropName='listTransform', fields=['value', 'text']) {
    return class extends React.Component {
        static propTypes = {
            [transformPropName]: PropTypes.object,
            [listPropName]: PropTypes.array
        };

        render() {
            const {[transformPropName]:transform, [listPropName]:listToTransform} = this.props
            if (!transform) {
                return React.createElement(Component, {
                    ...this.props,
                    ref: ref=>{ this._component=ref }
                })
            }

            const transformCfg = {
                ..._.reduce(fields, (acc, field)=>({...acc, [field]:field}), {}), // make sure all fields are pre-filled with defaults
                ...transform
            }

            return React.createElement(Component, {
                ..._.omit(this.props, transformPropName),
                [listPropName]: _.map(listToTransform, item=>_.mapKeys(item, (v, k)=>_.get(_.invert(transformCfg), k))),
                ref: ref=>{ this._component=ref }
            })
        }
    };
}

export default normalize