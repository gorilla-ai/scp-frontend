import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import cx from 'classnames'

import {Table as DataTable} from 'react-ui'


const log = require('loglevel').getLogger('vbda/components/analysis/link')

class Link extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        data: PropTypes.arrayOf(PropTypes.shape({
            ts: PropTypes.string,
            type: PropTypes.string,
            props: PropTypes.object
        }))
    };

    static defaultProps = {
        data: []
    };

    render() {
        const {className, data} = this.props
        const tableData = _(data)
            .map(({ts, propsReadable:props})=>{
                if (ts) {
                    return {/*time: moment(ts).format('YYYY-MM-DD HH:mm:ss'), */...props}
                }
                return _.isEmpty(props) ? null : props
            })
            .compact()
            .value()

        //deduce fields from all possible data keys
        const tableFields = _(tableData)
            .map(item=>_.keys(item))
            .flatten()
            .uniq()
            .reduce((acc, field)=>{
                return {
                    ...acc,
                    [field]: {label:field}
                }
            }, {})

        return <fieldset className={cx(className, 'c-vbda-link')}>
            <legend>{data.length > 0 ? `${_.first(data).typeReadable} (${data.length})` : ''}</legend>
            {!_.isEmpty(tableFields) && <DataTable fields={tableFields} data={tableData} />}
        </fieldset>
    }
}

export default Link