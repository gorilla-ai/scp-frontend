import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import moment from 'moment'
import DataTable from 'react-ui/build/src/components/table'

import ModalDialog from "react-ui/build/src/components/modal-dialog";
import configLoader from "./configLoader";

let log = require('loglevel').getLogger('vbda/components/visualization/table')


/**
 * Result Table
 * @constructor
 * @param {string} [id] - Table dom element #id
 * @param {string} [className] - Classname for the table
 * @param {string} lng -
 * @param {array.<object>} data -
 * @param {number} total - total number of search results
 * @param {object} cfg - config
 * @param {object} cfg.fields - fields
 * @param {object} cfg.fields._key - field key
 * @param {object} cfg.fields._key.title - field title
 * @param {object} cfg.fields._key.type - field type
 * @param {object} [cfg.locales] -
 * @param {number} cfg.page_size - number of records to display per page
 * @param {object} [cfg.style] - style for the table
 * @param {function} onReq - Function to call when more data is requested
 * @param {function} onSelect - Function to call when event is selected
 * @param {function} onMouseOver - Function to call when event is hovered
 * @param {function} onClick - Function to call when event is clicked
 *
 * @example

import _ from 'lodash'
import Table from 'vbda/components/visualization/table'

React.createClass({
    getInitialState() {
        return {
            events:{
                'xxxx':{_id:'xxxx','_index':'netflow-out-...', type:'logs'},
                'yyyy':{_id:'yyyy','_index':'netflow-out-...', type:'logs'}
            }
        }
    },
    showInGis(events) {
        // events == [{...}]
    },
    render() {
        const {events} = this.state
        return <Table
            id='t1'
            lng='en_us'
            events={events}
            page=2
            cfg={{
                fields:{
                    Identity:{title:'person_name'},
                    Locaiton:{title:'locaiton'},
                    RepresentativeImage:{title:'rep_image'},
                    _id:{hidden:true}
                },
                locales:{
                    en_us:{
                        fields:{
                            Identity:{title:'person name'},
                            Locaiton:{title:'locaiton'},
                            RepresentativeImage:{title:'rep image'}
                        },
                        data_mappings:{
                            event_types:{
                                '0':'line',
                                '1':'facebook'
                            }
                        }
                    }
                },
                page_size:25
            }}
            onReq={}
            onSelect={this.showInGis} />
    }
})
 */

const IMAGES_ROOT_PATH = '__fileInfo'
const Table = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        className: React.PropTypes.string,
        lng: React.PropTypes.string,
        // events: React.PropTypes.objectOf(React.PropTypes.object),
        events: React.PropTypes.array,
        total: React.PropTypes.number,
        page: React.PropTypes.number,
        cfg: React.PropTypes.shape({
            name: React.PropTypes.string,
            style: React.PropTypes.object,
            fields: React.PropTypes.objectOf(React.PropTypes.shape({
                title: React.PropTypes.string/*,
                type: React.PropTypes.oneOf(['string','gis'])*/ // defined in initialization.json
            })), /*,
            locales: React.PropTypes.objectOf(React.PropTypes.shape({
                fields: React.PropTypes.object
            }))*/
            page_size: React.PropTypes.shape({
                value: React.PropTypes.string
            }),
        }),
        onReq: React.PropTypes.func,
        onEdit: React.PropTypes.func,
        nowPage: React.PropTypes.number
    },
    getDefaultProps() {
        return {
        }
    },
    getInitialState() {
        const {cfg:{fields}} = this.props
        const dataTableFields = this.fieldsParser(fields)
        return {
            dataTableFields,
            sortBy: undefined,
            sortDesc: undefined,
            dataMappings: {},
            info: 'txt-loading'
        }
    },
    componentDidMount() {
        const {cfg: {dt: {data_mappings}}} = this.props
        configLoader.processDataMappings(data_mappings)
            .then(dataMappings => {
                this.afterLoadDataMapping(dataMappings)
            })
    },
    afterLoadDataMapping(dataMappings){
        this.setState({dataMappings: {...this.state.dataMappings, ...dataMappings}, info: null})
    },
    renderImages(fieldName, event) {
        let fieldNameOfUUID = ''
        if (fieldName.indexOf('.') > 0) {
            var pos = fieldName.lastIndexOf('.');//找出最後一個.並取代成.__
            fieldNameOfUUID = fieldName.substring(0,pos)+'.__'+fieldName.substring(pos+1);
        }
        else {
            fieldNameOfUUID = '__' + fieldName
        }
        let uuid = _.get(event, fieldNameOfUUID)
        if (_.isArray(uuid))
            uuid = uuid[0]
        const fileInfoIndex = _.findIndex(event[IMAGES_ROOT_PATH], function (o) {
            return o.uuid === uuid;
        })
        if (fileInfoIndex !== -1) {
            return <div>
                <img src={`/api/file/${_.get(event, [IMAGES_ROOT_PATH, fileInfoIndex, 'fileServerPath'])}`} width="100%"/>
            </div>
        }
        else
            return <div>無</div>
    },
    fieldsParser(fields) {
        const {cfg: {dt}} = this.props
        let newFields = {}
        //sort fields
        fields = _.chain(fields)
            .map((val, key) => {
                let order = parseInt(val.order)
                let newVal = _.omit(val, ['order'])
                return { name: key, order, ...newVal }
            })
            .sortBy('order')
            .keyBy('name')
            .mapValues((o) => {
                delete o.name
                return o
            })
            .value();
        //hide fields and 特殊處理 ex. array
        _.forEach(fields, (field, key) => {
            // if (field.hidden || field.hidden === true) { //if hidden
            //     return
            // }
            if (key.indexOf('.[].') > 0) {//array用原始資料(event)另外取 因為直接用key找 datatable找不到
                let keySplit = key.split('.[].')
                const rootKey = keySplit[0]
                const objectKey = keySplit[1]
                let sortable = true
                const type = _.get(dt.fields, [keySplit[0], 'properties', keySplit[1], 'type'])
                switch (type) {
                    case 'text':
                    case 'image':
                        sortable = false
                        break;
                    case 'date':
                    default:
                        break
                }
                newFields[key] = {
                    label: field.title,
                    sortable: true,
                    formatter: (miss, event) => {
                        let array = event[rootKey]
                        return <div>
                            {_.map(array, (val, index) => {
                                val = _.get(val, objectKey, ' ')
                                const itemFormatter = this.getFormatter(type, key.replace('.[].', '.'), true)
                                switch (type) {
                                    case 'image':
                                    case 'file':
                                        if (index > 0) {
                                            return null
                                        }
                                        return <div key={index}>{itemFormatter(val, event)}</div>
                                    default:
                                        if (index === 3) {
                                            return <div key={index}>...</div>
                                        }
                                        if (index > 3) {
                                            return null
                                        }
                                        return <div key={index}>{itemFormatter(val, event)}</div>
                                }
                            })}
                        </div>
                    }
                }
            }
            else {
                let label = field.title
                let sortable = true
                let formatter = null
                let type
                if (key.indexOf('.') > 0) {//判斷是否為第二層object
                    let keySplit = key.split('.')
                    type = _.get(dt.fields, keySplit[0] + '.properties.' + keySplit[1] + '.type')
                }
                else
                    type = _.get(dt.fields, key + '.type')
                switch (type) {
                    case 'text':
                    case 'image':
                    case 'file':
                        sortable = false
                        break;
                    default:
                        break
                }
                formatter = this.getFormatter(type, key)
                newFields[key] = {
                    label,
                    sortable,
                    formatter
                }
            }
        })
        return newFields
    },
    getFormatter(type, key, isArray) {
        switch (type) {
            case 'date':
                return (val) => {
                    if (moment(val).isValid())
                        val = moment(val).format('YYYY-MM-DD HH:mm:ss')
                    else
                        val = ''
                    return val
                }
            case 'image':
            case 'file':
                return (val, rowData) => {
                    if (isArray) {
                        let pos = key.lastIndexOf('.');//找出最後一個.並取代成.0.
                        key = key.substring(0, pos) + '.0.' + key.substring(pos + 1);
                    }
                    return <div>
                        {this.renderImages(key, rowData)}
                    </div>;
                }
            case 'text':
            default:
                return (val) => {
                    val = this.getMappingString(key, val)
                    return _.truncate(val, {
                        'length': 50,
                        'separator': ' '
                    });
                }
        }

    },
    getMappingString(mappingKey, originString) {
        const {dataMappings} = this.state
        if (_.has(dataMappings, mappingKey)) {
            return _.get(dataMappings, [mappingKey, originString], originString)
        }
        return originString
    },
    renderInfo(text, error = false) {
        return <div className="c-box grow">
            <div className={cx("content c-center c-info", {'c-error': error})}>{text}</div>
        </div>
    },
    render() {
        const {id, events} = this.props
        let {dataTableFields, info} = this.state

        if (info)
            return this.renderInfo(info)

        if (!events || events.length === 0)
            return this.renderInfo('no-data')

        return <DataTable id={id}
                          className={cx('c-vbda-table fixed-header')}
                          data={events}
                          fields={dataTableFields}
        />
    }
})

export default Table