import PropTypes from 'prop-types';
import React from 'react'
import createFragment from 'react-addons-create-fragment'
import cx from 'classnames'
import _ from 'lodash'
import $ from 'jquery'
import moment from 'moment'
import DataTable from 'react-ui/build/src/components/table'
import PageNav from 'react-ui/build/src/components/page-nav'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import localize from '../../hoc/locale-provider'
import {config as configLoader} from "vbda/loader";
import {syntaxStringParse} from "vbda/parser/syntax";

let log = require('loglevel').getLogger('vbda/components/visualization/table')

const gt = global.vbdaI18n.getFixedT(null, 'vbda')
const lt = global.vbdaI18n.getFixedT(null, 'search')

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

class Table extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        lng: PropTypes.string,
        // events: React.PropTypes.objectOf(React.PropTypes.object),
        events: PropTypes.array,
        total: PropTypes.number,
        page: PropTypes.number,
        cfg: PropTypes.shape({
            name: PropTypes.string,
            style: PropTypes.object,
            fields: PropTypes.objectOf(PropTypes.shape({
                title: PropTypes.string/*,
                type: React.PropTypes.oneOf(['string','gis'])*/ // defined in initialization.json
            })), /*,
            locales: React.PropTypes.objectOf(React.PropTypes.shape({
                fields: React.PropTypes.object
            }))*/
            page_size: PropTypes.shape({
                value: PropTypes.string
            }),
        }),
        onReq: PropTypes.func,
        onSelect: PropTypes.func.isRequired,
        onEdit: PropTypes.func,
        onDelete: PropTypes.func,
        nowPage: PropTypes.number
    };

    static defaultProps = {
    };

    constructor(props, context) {
        super(props, context);
        const {events, cfg,cfg:{fields}, total} = props
        const dataTableFields = this.fieldsParser(fields)
        const page_size = cfg.page_size ? parseInt(cfg.page_size.value) : 20
        const pages = total % page_size !== 0 ? Math.floor(total / page_size) + 1 : Math.floor(total / page_size)

        this.state = {
            // pages: pages > 500 ? 500 : pages,
            pages: pages,
            pageEvents: events,
            dataTableFields,
            sortBy: undefined,
            sortDesc: undefined,
            dataMappings: {},
            info: gt('txt-loading')
        };
    }

    componentDidMount() {
        const {cfg: {dt: {data_mappings}}} = this.props
        configLoader.processDataMappings(data_mappings)
            .then(dataMappings => {
                this.afterLoadDataMapping(dataMappings)
            })
    }

    componentDidUpdate(prevProps) {
        const {events} = this.props
        if (!_.isEmpty(events) && _.isEmpty(prevProps.events) ||//第一次傳入events
            (!_.isEmpty(events) && JSON.stringify(prevProps.events) !== JSON.stringify(events)))
            this.setState({
                pageEvents: events
            })
    }

    componentWillReceiveProps(nextProps) {
        //目前流程切換dt都會mount
        // log.info('componentWillReceiveProps')
        // const {dtId: nextDtId} = nextProps
        // const {dtId} = this.props
        // if (nextDtId !== dtId)
        //     this.loadDataMapping()
    }

    afterLoadDataMapping = (dataMappings) => {
        this.setState({dataMappings: {...this.state.dataMappings, ...dataMappings}, info: null},
            ()=>setSyncScroll(
                '.c-table.js-sync-scroll thead',
                '.c-table.js-sync-scroll tbody',
                'horizontal'
            ))
    };

    renderImages = (fieldName, event) => {
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
            return <div>{gt('field-no-data')}</div>
    };

    fieldsParser = (fields) => {
        const {onDelete, onEdit, onClick, nowPage, cfg: {dt}} = this.props
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
            let label = this.getDisplayName(key)
            if (!label)
                label = field.title ? field.title : key
            if (key.indexOf('.[].') > 0) {//array用原始資料(event)另外取 因為直接用key找 datatable找不到
                let keySplit = key.split('.[].')
                const rootKey = keySplit[0]
                const objectKey = keySplit[1]
                let sortable = true
                const type = _.get(dt.fields, [keySplit[0], 'properties', keySplit[1], 'type'])
                switch (type) {
                    case 'text':
                    case 'image':
                    case 'geo_point':
                        sortable = false
                        break;
                    case 'date':
                    default:
                        break
                }
                newFields[key] = {
                    label,
                    sortable: true,
                    formatter: (miss, event) => {
                        let array = event[rootKey]
                        return <div>
                            {_.map(array, (val, index) => {
                                val = _.get(val, objectKey, ' ')

                                const itemFormatter = this.getFormatter(type, key.replace('.[].', '.'), true, this.getFormatterByDetailConfig(field.format))
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
                    case 'geo_point':
                        sortable = false
                        break;
                    default:
                        break
                }
                formatter = this.getFormatter(type, key, false, this.getFormatterByDetailConfig(field.format))
                newFields[key] = {
                    label,
                    sortable,
                    formatter
                }
            }
        })
        //補上功能欄位
        newFields.actions = {
            label: '', formatter: (val, data) => {
                return <span>
                        {/*<i className='c-link fg fg-folder' onClick={onSelect.bind(null, data)}/>*/}
                    <button className='img small standard' title={lt('tt-view-details')} onClick={onClick.bind(null, data, nowPage)}>
                        <img src='/images/ic_case_detail.png'/>
                    </button>
                    {
                        onEdit ?
                            <button className='img small standard' title={lt('tt-edit')} onClick={onEdit.bind(null, data)}>
                                <img src='/images/ic_edit.png'/>
                            </button>
                            :
                            null
                    }
                    {
                        onDelete ?
                            <button className='img small standard' title={lt('tt-delete')} onClick={() => {
                                PopupDialog.confirm({
                                    title: lt('tt-delete'),
                                    display: <div className='c-flex fdc boxes'>
                                        {lt('tt-delete')}?
                                    </div>,
                                    cancelText: gt('btn-cancel'),
                                    confirmText: gt('btn-ok'),
                                    act: (confirmed) => {
                                        if (confirmed) {
                                            onDelete.bind(null, data)
                                        }
                                        return null
                                    }
                                })
                            }}><img src='/images/ic_delete.png'/></button>
                            :
                            null
                    }
                    </span>
            }
        }
        return newFields
    };

    getDisplayName = (key) => {
        let {cfg: {dt: dtCfg}} = this.props
        const cfgDtFields = dtCfg.fields
        key = key.replace(/\.\[]\./g, '.')
        const fieldNamePathArray = _.split(key.replace(/\./g, '.properties.'), '.')
        return _.get(cfgDtFields, [...fieldNamePathArray, 'display_name'], null)
    };

    getFormatterByDetailConfig = (format = {}) => {
        const {type, props = {}} = format
        // log.info(format)
        switch (type) {
            case 'hyper-link':
                const linkFormatter = (value, data) => {
                    if (_.isNil(value) || value === '')
                        return null
                    return <a href={props.prefix ? props.prefix + value : value} target="_blank">
                        <i className='fg fg-globe'/>
                        {props.label_string ? syntaxStringParse(props.label_string, data) : value}
                    </a>
                }
                return linkFormatter
            default:
                return null
        }
    };

    getFormatter = (type, key, isArray, customFormatter) => {
        if (customFormatter)
            type = 'default'//一律用default
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
                return (val, data) => {
                    val = this.getMappingString(key, val)
                    if (customFormatter)
                        return customFormatter(val, data)
                    else
                        return _.truncate(val, {
                            'length': 50,
                            'separator': ' '
                        });
                }
        }

    };

    getMappingString = (mappingKey, originString) => {
        const {dataMappings} = this.state
        if (_.has(dataMappings, mappingKey)) {
            return _.get(dataMappings, [mappingKey, originString], originString)
        }
        return originString
    };

    onSelect = (selectedIds) => {
        const {onSelect, events, rowIdField= '__s_uuid'} = this.props
        // let {pageEvents} = this.state
        let eventObject,selectEvents

        eventObject = _.keyBy(events, rowIdField)
        selectEvents = _.pick(eventObject, selectedIds)
        // if(_.has(this.state.pageEvents[0], '__s_uuid')){
        //     eventObject = _.keyBy(events, rowIdField)
        //     selectEvents = _.pick(eventObject, selectedIds)
        // }
        // else{
        //     selectEvents = _.map(selectedIds, selectedId=>events[selectedId])
        // }
        onSelect(selectEvents)
    };

    gotoPage = (page) => {
        const {onReq} = this.props
        const {sortBy, sortDesc} = this.state
        onReq(page, sortBy, sortDesc)
    };

    renderInfo = (text, error = false) => {
        return <div className="c-box grow">
            <div className={cx("content c-center c-info", {'c-error': error})}>{text}</div>
        </div>
    };

    render() {
        const {id, cfg: {style = {}}, nowPage, onClick, onSort} = this.props
        let {rowIdField = '__s_uuid'} = this.props
        let {pages, pageEvents, dataTableFields, sortBy, sortDesc, info} = this.state

        if (info)
            return this.renderInfo(info)

        if (!pageEvents || pageEvents.length === 0)
            return this.renderInfo(gt('txt-no-data'))
        const content = createFragment({
            dataTable: <div className="content nopad">
                <DataTable id={id}
                           className={cx('c-vbda-vis-table fixed-header js-sync-scroll')}
                           style={style}
                           data={pageEvents}
                           onRowDoubleClick={(id, data)=>{
                            onClick(data, nowPage)
                           }}
                           fields={dataTableFields}
                           rowIdField={rowIdField}
                           selectable={{toggleAll: true}}
                           onSelectionChange={this.onSelect}
                           onSort={({field, desc}) => {
                               if (field.indexOf('.[].') > 0) {//if array
                                   field = field.replace('.[]', '')
                               }
                               this.setState({sortBy: field, sortDesc: desc})
                               onSort(field, desc)
                           }}
                           defaultSort={{field: sortBy, desc: sortDesc}}
                />
            </div>,
            pageNavBottom: <footer><PageNav pages={pages} current={nowPage} className='jcc' onChange={this.gotoPage}/>
            </footer>
        })
        return <div className="c-box grow">
            {content}
        </div>
    }
}

export default localize(Table, 'cfg')

//reference from ciap-ui \src\utils\ui-helper.js
const _setScrollEvent = function _setScroll(main, sub, scrollWay) {
    main.on('scroll', () => {
        const mainScroll = main[scrollWay]()
        const subScroll = sub[scrollWay]()

        if (mainScroll !== subScroll) {
            sub[scrollWay](mainScroll)
        }
    })
}

function setSyncScroll(mainSelector, subSelector, direction='horizontal') {
    if (!mainSelector || !subSelector) {
        log.warn('Parameter mainSelector and subSelector should be String')
        return
    }
    else if (!_.includes(['horizontal', 'vertical'], direction)) {
        log.warn('Parameter direction should be \'horizontal\', or \'vertical\'')
        return
    }

    const main = $(mainSelector)
    const sub = $(subSelector)
    const scrollWay = direction === 'horizontal' ? 'scrollLeft' : 'scrollTop'

    _setScrollEvent(main, sub, scrollWay)
    _setScrollEvent(sub, main, scrollWay)
}