import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'

import DataTable from 'react-ui/build/src/components/table'

class NetflowList extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        events: PropTypes.objectOf(PropTypes.object),
        onSelect: PropTypes.func
    };

    onSelect = (selectedIds) => {
        const {onSelect, events} = this.props

        onSelect(_.pick(events, selectedIds))
    };

    render() {
        const {events} = this.props
        return <DataTable
            fields={{
               _id:{},
               'netflow.ipv4_src_addr':{label:'Src IP'},
               'geoip_src_ipv4_src_addr.country_name':{label:'Src Country'},
               'geoip_src_ipv4_src_addr.city_name':{label:'Src City'},
               'netflow.ipv4_dst_addr':{label:'Dst Addr'},
               'geoip_src_ipv4_dst_addr.country_name':{label:'Dst Country'},
               'geoip_src_ipv4_dst_addr.city_name':{label:'Dst City'}
            }}
            rowIdField='_id'
            data={_.values(events)}
            selectable
            onSelectionChange={this.onSelect}
         />
    }
}

export default NetflowList