import PropTypes from 'prop-types';
import React from 'react'
import createReactClass from 'create-react-class';
import cx from 'classnames'
import _ from 'lodash'

let log = require('loglevel').getLogger('vbda/components/vis/detail')

/**
 * Detail View
 * @constructor
 * @param {string} [id] - View dom element #id
 * @param {string} [className] - Classname for the view
 * @param {string} lng -
 * @param {object} event - single ES event record
 * @param {object} cfg - config
 * @param {object} cfg.fields - fields
 * @param {object} cfg.fields._key - column key
 * @param {object} cfg.fields._key.title - column title
 * @param {object} cfg.fields._key.type - column type
 * @param {object} [cfg.locales] - translation
 * @param {object} [style] - style for the view
 *
 * @example

import Detail from 'vbda/components/visualization/detail'

 */
const Detail = createReactClass({
    displayName: 'Detail',

    propTypes: {
        id: PropTypes.string,
        className: PropTypes.string,
        lng: PropTypes.string,
        event: PropTypes.object,
        cfg: PropTypes.shape({
            name: PropTypes.string,
            style: PropTypes.object,
            fields: PropTypes.objectOf(PropTypes.shape({
                title: PropTypes.string/*,
                type: React.PropTypes.oneOf(['string','gis'])*/ // defined in initialization.json
            }))/*,
            locales: React.PropTypes.objectOf(React.PropTypes.shape({
                fields: React.PropTypes.object
            }))*/
        })
    },

    localesSwitch(key) {
        const {lng} = this.props
        if (lng) {
            const {cfg:{locales}} = this.props
            if (_.get(locales, lng, null)!==null) {
                return locales[lng][key]
            }
        }
        return this.props.cfg[key]
    },

    fieldsParser(fields) {
        let newFields = {}
        _.map(fields, (field, key) => {
            if (field.hidden === undefined || field.hidden !== true) { //if no hidden
                newFields[key] = {
                    label: field.title,
                    sortable: true
                }
            }
        })
        return newFields
    },

    dataMap(event, datamappings) {
        let newData = Object.assign({}, event)
        _.map(datamappings, (datamapping, datamappingkey) => {
            _.map(newData, (data) => {
                const originValue = _.get(data, datamappingkey, null)
                if (originValue!==null) {
                    const mappingValue = _.get(datamapping, originValue, null)
                    if (mappingValue!==null) { _.set(data, datamappingkey, mappingValue) }
                }
            })
        })
        return newData
    },

    renderStyleParser(styles) {
        let newStyle = {}
        _.map(styles, (style, key) => { //TODO 未來有新格式了
            switch (key) {
                // case 'font':
                //     newStyle['fontFamily'] = style.name
                //     newStyle['fontSize'] = style.size + 'px'
                //     break
                // case 'back_color':
                //     newStyle['background'] = style
                //     break
            }
        })
        return newStyle
    },

    sx() {
        let newStyle = {...arguments}
        for (let i = 0; i < arguments.length; i++) {
            _.map(arguments[i], (style, key) => {
                newStyle[key] = style
            })
        }
        return newStyle
    },

    render() {
        // const {id, className, cfg:{style={}}, event} = this.props
        // return <div id={id} className={cx('detail', className)} style={style}>
        //     {JSON.stringify(event, null, 4)}
        // </div>

        const {id, className, cfg:{style={}}, event} = this.props
        const originFields = this.localesSwitch('fields')
        const datamapping = this.localesSwitch('data_mappings')

        const fields = this.fieldsParser(originFields)
        const mappedData = this.dataMap(event, datamapping)
        this.sx(this.renderStyleParser(style), this.renderStyleParser(style))
        return <div id={id} className={cx('detail', className)} >
            <div className='c-box' style={{width:'100%'}}>
                <div className='content' style={this.renderStyleParser(style)} >
                    <div className='pure-g'>
                        {
                                _.map(fields, ({label}, key) => {
                                    return (
                                        <div className='pure-u-1-2' key={key}>
                                            <div>
                                                <RenderRow
                                                    id={key}
                                                    label={label}
                                                    value={_.get(mappedData, key, 'no data')} />
                                            </div>
                                        </div>
                                    )
                                })
                            }
                    </div>
                </div>
            </div>
            EventData:
            <div>{JSON.stringify(mappedData, null, '\t')}</div>
        </div>
    },
})

export default Detail

class RenderRow extends React.Component {
    render() {
        const {id, label, value, height} = this.props
        // console.log(this.props)
        return <div id={id} style={{padding:'5px 0px', height:height*60+'px'}}>
            {label}
            <hr />
            <a>{value}</a>
        </div>
    }
}