import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import cx from 'classnames'

import {Checkbox} from 'react-ui'

const log = require('loglevel').getLogger('vbda/components/analysis/label')

class Label extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        labelData: PropTypes.object,
        nodeData: PropTypes.object,
        selectable: PropTypes.bool,
        selected: PropTypes.bool,
        onSelect: PropTypes.func,
        onClick: PropTypes.func,
        showLabelText: PropTypes.bool,
        showEventCount: PropTypes.bool
    };

    static defaultProps = {
        labelData: {},
        nodeData: {},
        selectable: false,
        selected: false,
        showLabelText: false,
        showEventCount: true
    };

    render() {
        const {
            className, labelData: {id:labelId, propsReadable:labelProps}, nodeData: {propsReadable:nodeProps, images, events},
            selectable, selected, onSelect, onClick, showLabelText, showEventCount
        } = this.props

        const props = _.reduce({
            ...labelProps,
            ...nodeProps
        }, (acc, v, k)=>{
            if (_(acc).values().includes(v)) {
                return acc
            }
            return {
                ...acc,
                [k]: v
            }
        }, {})


        //const images = ['https://static.wixstatic.com/media/812313_d85a13812e6b4a7fb6c1194cf4113312.png/v1/fill/w_126,h_126,al_c,usm_0.66_1.00_0.01/812313_d85a13812e6b4a7fb6c1194cf4113312.png']

        return <div className={cx(className, {selected}, 'c-vbda-label')} onClick={onClick ? onClick.bind(null, labelId) : null}>
            {selectable &&
                <Checkbox checked={selected} onChange={onSelect.bind(null, labelId)} />
            }
            <div className='c-flex fdc'>
                <div className='images'>
                    {
                    _.map(images, img=><img key={img} src={img} />)
                }
                </div>
                <div className='info'>
                    {
                    _.map(props, (v, k)=><div key={k}>
                        {showLabelText&&<span>{k}: </span>} {v}
                    </div>)
                }
                </div>
                {showEventCount && <div className='c-bullet'>{events.length}</div>}
            </div>
        </div>
    }
}

export default Label