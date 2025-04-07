import _ from 'lodash'
import PropTypes from 'prop-types';
import React from 'react'

import PageNav from '../components/page-nav'
import {wireSet} from './prop-wire'

const log = require('loglevel').getLogger('react-ui/hoc/paginator')

export function withPaginate(Component, options={}) {
    const {
        target='data'
    } = options

    const propTypes = {
        [target]: PropTypes.array,
        paginate: PropTypes.shape({
            wrapperClassName: PropTypes.string,
            pageSize: PropTypes.number,
            pages: PropTypes.number,
            current: PropTypes.number,
            thumbnails: PropTypes.number,
            className: PropTypes.string,
            onChange: PropTypes.func
        })
    }

    return wireSet(class extends React.Component {
        static propTypes = propTypes;

        static defaultProps = {
            paginate: {}
        };

        render() {
            const {
                paginate,
                [target]: data
            } = this.props

            const {
                enabled: enablePagination=true,
                pageSize=30,
                wrapperClassName,
                ...pageNavProps
            } = paginate

            if (enablePagination===false) {
                return <Component
                    {..._.omit(this.props, 'paginate')}
                    ref={ref=>{ this._component=ref }} />
            }

            let {pages} = paginate
            let propsToPass = _.omit(this.props, ['paginate'])
            if (!pages) {
                const {current} = pageNavProps
                const total = data.length
                pages = Math.ceil(total/pageSize)
                propsToPass[target] = _.slice(data, (current-1)*pageSize, current*pageSize)
            }

            return <div className={wrapperClassName}>
                <Component
                    {...propsToPass}
                    ref={ref=>{ this._component=ref }} />
                {pages > 1 && <PageNav
                    className='c-flex jcc c-margin'
                    pages={pages}
                    {...pageNavProps} />
                }
            </div>
        }
    }, {
        paginate: {
            name: 'paginate.current',
            defaultName: 'paginate.defaultCurrent',
            defaultValue: 1,
            changeHandlerName: 'paginate.onChange'
        }
    });
}


export default withPaginate