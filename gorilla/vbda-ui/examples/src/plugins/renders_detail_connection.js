import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'

class NetflowEvent extends React.Component {
    static propTypes = {
        event: PropTypes.object
    };

    render() {
        const {event:data} = this.props
        return <div className='netflow-info c-form'>
            <div>
                <label>From IP</label>
                <span>{data.netflow.ipv4_src_addr}</span>
            </div>
            <div>
                <label>To IP</label>
                <span>{data.netflow.ipv4_dst_addr}</span>
            </div>
        </div>
    }
}

export default NetflowEvent