import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import moment from 'moment'
import $ from 'jquery'

import {wireSet} from '../hoc/prop-wire'
import Checkbox from './checkbox'

const log = require('loglevel').getLogger('react-ui/components/table')


class Row extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        fields: PropTypes.object.isRequired,
        data: PropTypes.object.isRequired,
        force: PropTypes.bool,
        style: PropTypes.object,
        onInputChange: PropTypes.func,
        onClick: PropTypes.func,
        onDoubleClick: PropTypes.func,
        onMouseOver: PropTypes.func,
        onMouseOut: PropTypes.func,
        onContextMenu: PropTypes.func
    };

    static defaultProps = {
        force: false,
        style: {}
    };

    shouldComponentUpdate(nextProps) {
        if (nextProps.force) {
            log.debug('Row::shouldComponentUpdate::forced')
            return true
        }

        if (nextProps.fields !== this.props.fields) {
            log.debug('Row::shouldComponentUpdate::fields changed')
            return true
        }

        if (nextProps.className !== this.props.className) {
            log.debug('Row::shouldComponentUpdate::className changed')
            return true
        }

        if (JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data)) {
            log.debug('Row::shouldComponentUpdate::data changed')
            return true
        }
        return false
    }

    formatItem = (value, data, formatter, id, name) => {
        if (React.isValidElement(formatter)) {
            return formatter
        }
        else if (_.isFunction(formatter)) {
            return formatter(value, data, id)
        }
        else if (_.isString(formatter)) {
            return _.template(formatter)({value, data})
        }
        else if (_.isObject(formatter)) {
            const {type, ...options} = formatter
            let formatted = value
            switch (type) {
                case 'date':
                case 'datetime':
                    {
                        if (value==null || (_.isString(value) && _.trim(value)==='')) {
                            formatted = null
                        }
                        else {
                            formatted = moment(value, options.inputFormat).format(options.format || (type==='date'?'YYYY-MM-DD':'YYYY-MM-DD HH:mm:ss'))
                        }
                        break
                    }
                case 'mapping': {
                    const {list, listTransform={}} = options
                    const {value:valueField='value', text:textField='text'} = listTransform
                    if (_.isObject(list)) {
                        if (_.isArray(list)) {
                            formatted = _.find(list, {[valueField]:value})
                        }
                        else {
                            formatted = _.get(list, value)
                        }

                        if (formatted==null) {
                            formatted = value
                        }
                        else if (_.isObject(formatted)) {
                            formatted = _.get(formatted, textField, value)
                        }
                    }
                    else {
                        log.error(`renderField:: field '${name}' mapping list is invalid or undefined`)
                    }
                    break
                }
                default:
                    log.error(`renderField:: field '${name}' formatter type '${type}' is invalid`)
                    break
            }
            return formatted
        }
        else {
            log.error(`renderField:: field '${name}' formatter is invalid`)
            return value
        }
    };

    renderField = (name, value, fieldCfg, rowData) => {
        const {id, onInputChange} = this.props
        let {formatArrayItem=false, formatter, editor, props} = fieldCfg

        if (formatter) {
            if (_.isArray(value) && formatArrayItem) {
                return <div>
                    {_.map(value, (item, idx)=><div key={idx+''}>{this.formatItem(null, item, formatter, null, name)}</div>)}
                </div>
            }
            else {
                return this.formatItem(value, rowData, formatter, id, name)
            }
        }
        else if (editor) {
            if (_.isFunction(props)) {
                props = props(rowData)
            }
            // TODO: check editor must be ReactClass
            props = _.assign(
                {name, value, onChange:onInputChange && onInputChange.bind(null, id, name)},
                props || {}
            )

            return React.createElement(editor, props)
        }
        else {
            return value
        }
    };

    render() {
        const {data, fields, id, className, style, onClick, onDoubleClick, onMouseOver, onMouseOut, onContextMenu} = this.props

        return <tr id={id} onClick={onClick} onDoubleClick={onDoubleClick} onContextMenu={onContextMenu} className={className} style={style} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
            {
                _.map(fields, (field, key) => {
                    const {hide, keyPath, style:fieldStyle, className:fieldClassName} = field
                    if (hide) {
                        return null
                    }

                    const val = _.get(data, keyPath||key, null) // to support traverse of nested field properties, eg a.b.c
                    return <td
                        key={key}
                        style={fieldStyle}
                        className={cx(key, fieldClassName)}>
                        {this.renderField(key, val, field, data)}
                    </td>
                })
            }
        </tr>
    }
}

/**
 * A React data Table Component. Renders **data** according to **fields** configuration
 * @constructor
 * @param {string} [id] - Table element #id
 * @param {renderable} [caption] - Table caption
 * @param {renderable} [footer] - Table footer
 * @param {string} [className] - Classname for the container, default selected classnames:
 * * bland - Do not color alternate rows
 * * nohover - Do not change color when hovering over rows
 * * fixed-header - Fix table header when height is limited, allow table body to scroll
 * * column - Make table a column table. Ie data rows will be from left to right, instead of top to bottom
 * * border-inner-vertical - Show vertical border inside table
 * * border-inner-horizontal - Show horizontal border inside table
 * * border-inner - Show both vertical and horizontal border inside table
 * * border-outer - Show table border outline
 * * border-all - Show all border, outer + inner
 * @param {object} [style] - Table style
 * @param {object} fields - All fields definition, in key-config pair, each key represents a column
 * @param {object} fields.key - Config for this **key** field
 * @param {renderable} [fields.key.label=key] - label for this field
 * @param {string | array.<string>} [fields.key.keyPath=key] - key path for this field
 * @param {renderable} [fields.key.sortable=false] - is column sortable?
 * @param {string | array.<string>} [fields.key.sortKeyPath=keyPath] - key path used for sorting
 * @param {renderable} [fields.key.hide=false] - hide this column?
 * @param {string} [fields.key.className] - classname of this column
 * @param {object} [fields.key.style] - column style, eg width, minWidth
 * @param {string | object | function | renderable} [fields.key.formatter] - what to render in this field?
 * * template string literal: eg 'Hi my name is ${value} and address is ${data.address}'
 * * renderable elements supported by react: eg <div>xxxx</div>
 * * format config object, with type='date'|'datetime'|'mapping'
 * * custom defined formatter function, first argument will be data value corresponding to the field, second argument is data for the entire row
 * @param {boolean} [fields.key.formatArrayItem=false] - if field value is an array, whether the formatter above is targeted towards the array item?
 * @param {function | component} [fields.key.editor] - If this field is an input, the react component class to use
 * @param {object | function} [fields.key.props] - If this field is an input, props for the above react class
 * * object - props as object
 * * function - function given row data, returning object props
 * @param {array} [data] - Data to fill table with
 * @param {object} [rows] - Limit data to show
 * @param {number} [rows.start=0] - row to start with
 * @param {number} [rows.end=data.length] - row to end with (not including end)
 * @param {string} [rowIdField] - The field key which will be used as row dom #id
 * @param {string | function} [rowClassName] - Classname of a data row
 * @param {string | function} [rowStyle] - Style of a data row
 * @param {object} [selection] - Table row selection settings
 * @param {boolean} [selection.enabled=false] - Is table rows selectable? If yes checkboxes will appear
 * @param {boolean} [selection.toggleAll=false] - Show toggle all checkbox in header?
 * @param {boolean} [selection.multiSelect=true] - Can select multiple rows?
 * @param {string | array.<string>} [defaultSelected] - Selected row id(s)
 * @param {string | array.<string>} [selected] - Default selected row id(s)
 * @param {object} [selectedLink] - Link to update selections. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} selectedLink.value - value to update
 * @param {function} selectedLink.requestChange - function to request value change
 * @param {function} [onSelectionChange] - Callback function when row is selected. <br> Required when selected prop is supplied
 * @param {string | array} onSelectionChange.value - current selected row ids
 * @param {object} onSelectionChange.eventInfo - event related info
 * @param {string | array} onSelectionChange.eventInfo.before - previous selected row ids
 * @param {string} onSelectionChange.eventInfo.id - id triggering change
 * @param {boolean} onSelectionChange.eventInfo.selected - selected?
 * @param {object} [defaultSort] - Default sort config
 * @param {string} [defaultSort.field] - Default sort field
 * @param {boolean} [defaultSort.desc=false] - Is sort order descending by default?
 * @param {object} [sort] - Current sort config
 * @param {string} [sort.field] - Current sort field
 * @param {boolean} [sort.desc=false] - Is sort order descending?
 * @param {object} [sortLink] - Link to update sort. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} sortLink.value - sort to update
 * @param {function} sortLink.requestChange - function to request sort change
 * @param {function} [onSort] - Callback function when sort is changed. <br> Required when sort prop is supplied
 * @param {object} onSort.value - current sort object
 * @param {object} onSort.eventInfo - event related info
 * @param {object} onSort.eventInfo.before - previous sort object
 * @param {function} [onRowClick] [description]
 * @param {function} [onRowDoubleClick] [description]
 * @param {function} [onRowMouseOver] - Row mouseover event
 * @param {function} [onRowMouseOut] - Row mouseout event
 * @param {function} [onRowContextMenu] [description]
 * @param {function} [onScroll] [description]
 * @param {function} [onInputChange] - Input change event
 * @param {string} onInputChange.rid - row id of this input
 * @param {string} onInputChange.name - input name
 * @param {string|number} onInputChange.value - input value
 * @param {renderable} [info] - React renderable object, display additional information about the list
 * @param {string} [infoClassName] - Assign className to info node
 *
 * @example
// controlled

import $ from 'jquery'
import cx from 'classnames'
import {Table} from 'react-ui'

const FIELDS = {
    id: { label:'ID', sortable:true },
    title: { label:'Title', sortable:true },
    adult: {label:'Adult', formatter:{
        type: 'mapping',
        list: {true:'Yes', false:'No'}
    }},
    original_language: {
        label:'Language',
        formatter: {
            type: 'mapping',
            list: [
                {lang:'en', desc:'English'},
                {lang:'de', desc:'German'}
            ],
            valueField: 'lang',
            textField: 'desc'
        }
    },
    popularity: {label:'Popularity'},
    release_date: {
        label: 'Year',
        formatter: {type:'date', format:'YYYY-MM-DD'},
        sortable: true
    }
}

React.createClass({
    getInitialState() {
        return {
            search: 'ab',
            selected: [],
            clicked: null,
            info: null,
            error: false,
            data: []
        }
    },
    componentDidMount() {
        this.loadList()
    },
    handleSelect(selected) {
        this.setState({selected})
    },
    handleClick(clicked) {
        this.setState({clicked})
    },
    loadList() {
        this.setState({data:[], info:'Loading...', error:false}, () => {
            let {search} = this.state

            $.get(`https://api.themoviedb.org/3/${search?'search':'discover'}/movie`,
                {
                    api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                    query: search
                })
                .done(({results:list=[], total_results:total=0}) => {
                    if (total === 0) {
                        this.setState({info:'No movies found!'})
                        return
                    }

                    this.setState({info:null, data:list})
                })
                .fail(xhr => {
                    this.setState({info:xhr.responseText, error:true})
                })
        })
    },
    render() {
        let {data, info, error} = this.state

        return <div className='c-box noborder'>
            <div className='content'>
                <Table
                    data={data}
                    fields={FIELDS}
                    className='fixed-header'
                    rowIdField='id'
                    info={info}
                    infoClassName={cx({'c-error':error})}
                    defaultSort={{
                        field: 'title',
                        desc: false
                    }}
                    onRowClick={this.handleClick}
                    selection={{
                        enabled:true,
                        toggleAll:true
                    }}
                    onSelectionChange={this.handleSelect} />
            </div>
        </div>
    }
});
 */
class Table extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        caption: PropTypes.node,
        footer: PropTypes.node,
        className: PropTypes.string,
        style: PropTypes.object,
        rowIdField: PropTypes.string,
        rowClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        rowStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        fields: PropTypes.objectOf(PropTypes.shape({
            label: PropTypes.node,
            keyPath: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
            sortable: PropTypes.bool,
            sortKeyPath: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
            hide: PropTypes.bool,
            className: PropTypes.string,
            style: PropTypes.object,
            formatter: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.object,
                PropTypes.func,
                PropTypes.node
            ]),
            formatArrayItem: PropTypes.bool,
            editor: PropTypes.oneOfType([PropTypes.func, PropTypes.element, PropTypes.string]),
            props: PropTypes.oneOfType([
                PropTypes.object,
                PropTypes.func
            ])
        })).isRequired,
        data: PropTypes.array,
        rows: PropTypes.shape({
            start: PropTypes.number,
            end: PropTypes.number
        }),
        forceRefresh: PropTypes.bool,
        selection: PropTypes.shape({
            enabled: PropTypes.bool,
            multiSelect: PropTypes.bool,
            toggleAll: PropTypes.bool
        }),
        selected: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string)
        ]),
        onSelectionChange: PropTypes.func,
        sort: PropTypes.shape({
            field: PropTypes.string,
            desc: PropTypes.bool
        }),
        onSort: PropTypes.func,
        onRowClick: PropTypes.func,
        onRowDoubleClick: PropTypes.func,
        onRowContextMenu: PropTypes.func,
        onScroll: PropTypes.func,
        onInputChange: PropTypes.func,
        onRowMouseOver: PropTypes.func,
        onRowMouseOut: PropTypes.func,
        info: PropTypes.node,
        infoClassName: PropTypes.string
    };

    static defaultProps = {
        data: [],
        selection: {
            enabled: false
        },
        forceRefresh: false
    };

    state = {
        fieldsSize: null
    };

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize)
        if (this.isAutoLayout()) {
            setTimeout(()=>{
                this.resizeFields()
            }, 1000)
        }
    }

    componentDidUpdate(prevProps) {
        const {data:prevData, className:prevClassName} = prevProps
        const {data, className} = this.props
        if (this.isAutoLayout()) {
            if (
                (className !== prevClassName) ||
                (!_.isEmpty(data) && JSON.stringify(data) !== JSON.stringify(prevData))
            ) {
                log.debug('Table::componentDidUpdate::resize fields')
                this.resizeFields()
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize)
    }

    getRowId = (rowData, rowIdField) => {
        if (!rowIdField) {
            log.error('getRowId:: rowIdField prop must be specified')
            return null
        }

        const {fields} = this.props
        const fieldCfg = this.formatField(rowIdField, fields[rowIdField])
        const id = _.get(rowData, _.get(fieldCfg, 'keyPath', rowIdField))

        if (!id) {
            log.error(`getRowId:: unable to produce id based on config ${fieldCfg}`)
            return null
        }

        return id+''
    };

    resizeFields = () => {
        const {fields} = this.props
        this.setState({
            fieldsSize: null
        }, ()=>{
            let fieldsSize = {}
            $(this.tableHeaderNode).children().each(function () {
                fieldsSize[this.id] = _.get(fields, [this.id, 'style', 'width'], $(this).width()+14)
            })

            this.setState({fieldsSize})
        })
    };

    isAutoLayout = (props) => {
        const {className} = props || this.props
        return _.indexOf(_.split(className, ' '), 'fixed-header')>=0
    };

    formatField = (key, fieldCfg) => {
        if (_.isString(fieldCfg)) {
            return {label:fieldCfg}
        }
        else {
            return {
                label: key,
                ...fieldCfg
            }
        }
    };

    formatFields = () => {
        let {
            fields,
            selection: {enabled:selectable, multiSelect=true, toggleAll=false},
            selected,
            data
        } = this.props

        fields = _.mapValues(fields, (fieldCfg, key) => this.formatField(key, fieldCfg))

        if (selectable) {
            const total = data.length
            const numSelected = multiSelect ? selected.length : null

            fields = {
                selector: {
                    label: toggleAll && multiSelect ? <Checkbox
                        checked={numSelected>0}
                        className={cx({partial:numSelected>0 && numSelected<total})}
                        onChange={this.handleToggleAll} />: '',
                    formatter: (v, row, rid)=>{
                        const rowSelected = multiSelect ? _.includes(selected, rid) : selected===rid
                        return <Checkbox checked={rowSelected} onChange={this.handleRowSelect.bind(this, rid)} />
                    }
                },
                ...fields
            }
        }
        return fields
    };

    handleWindowResize = () => {
        if (this.isAutoLayout()) {
            this.resizeFields()
        }
    };

    handleSort = (evt) => {
        const {onSort, sort:{field:sortField, desc:sortDesc}} = this.props
        const newSortField = evt.currentTarget.id

        const sortObj = {field:newSortField, desc:(newSortField===sortField?!sortDesc:false)}
        onSort(sortObj)
    };

    handleToggleAll = (selected) => {
        const {onSelectionChange, data, rowIdField} = this.props
        const newSelected = (selected ? _.map(data, row=>this.getRowId(row, rowIdField)): [])
        onSelectionChange(newSelected, {id:null, selected})
    };

    handleRowSelect = (rid, selected) => {
        const {selection:{multiSelect=true}, onSelectionChange, selected:curSelected} = this.props
        if (multiSelect) {
            const newSelected = (selected ? [...curSelected, rid] : _.without(curSelected, rid))
            onSelectionChange(newSelected, {id:rid, selected})
        }
        else {
            onSelectionChange(selected ? rid : '')
        }
    };

    handleRowClick = (row, evt) => {
        const rid = evt.currentTarget.id
        this.props.onRowClick && this.props.onRowClick(rid, row, evt)
    };

    handleRowDoubleClick = (row, evt) => {
        const rid = evt.currentTarget.id
        this.props.onRowDoubleClick && this.props.onRowDoubleClick(rid, row, evt)
    };

    handleRowMouseOver = (row, evt) => {
        const rid = evt.currentTarget.id
        this.props.onRowMouseOver && this.props.onRowMouseOver(rid, row, evt)
    };

    handleRowMouseOut = (row, evt) => {
        const rid = evt.currentTarget.id
        this.props.onRowMouseOut && this.props.onRowMouseOut(rid, row, evt)
    };

    handleContextMenu = (row, evt) => {
        const rid = evt.currentTarget.id
        this.props.onRowContextMenu && this.props.onRowContextMenu(rid, row, evt)
    };

    render() {
        let {
            id, className, style={}, caption, footer, info, infoClassName,
            data, rows, rowIdField,
            selection: {enabled:selectable, multiSelect:multiSelectable=true},
            selected, sort: {field:sortField, desc:sortDesc},
            rowClassName, rowStyle, forceRefresh,
            onRowClick, onRowDoubleClick, onRowContextMenu, onInputChange, onScroll, onRowMouseOver, onRowMouseOut} = this.props

        const autoLayout = this.isAutoLayout()
        const {fieldsSize} = this.state
        const refreshAll = (forceRefresh === true)
        const fields = this.formatFields()

        if (!refreshAll && !_.isArray(forceRefresh)) {
            forceRefresh = [forceRefresh]
        }

        if (sortField && fields[sortField].sortable) {
            data = _.orderBy(
                data,
                [
                    item => {
                        const val = _.get(item, fields[sortField].sortKeyPath||fields[sortField].keyPath||sortField)
                        return _.isString(val) ? val.toLowerCase() : val
                    },
                    rowIdField
                ],
                [sortDesc?'desc':'asc'])
        }

        if (rows) {
            const {start, end} = rows
            data = data.slice(start, end)
        }

        return (
            <table
                id={id}
                className={cx(
                    'c-table',
                    _.replace(className, 'fixed-header', ''),
                    {
                        selectable,
                        'fixed-header': autoLayout&&fieldsSize
                    }
                )}
                style={{
                    width: autoLayout&&!fieldsSize ? '100%': null,
                    minWidth: autoLayout&&fieldsSize ? _.sum(_.values(fieldsSize)): null,
                    ...style
                }}>
                {caption ? <caption>{caption}</caption> : null}
                <thead><tr id='header' ref={ref=>{ this.tableHeaderNode=ref }}>
                    {
                    _.map(fields, ({sortable=false, hide=false, label, className:fieldClassName, style:fieldStyle}, key) => {
                        if (hide) {
                            return null
                        }

                        let fieldWidth = _.get(fieldStyle, 'width')
                        if (autoLayout && _.has(fieldsSize, key)) {
                            fieldWidth = fieldsSize[key]
                        }
                        return <th
                            id={key}
                            key={key}
                            className={cx(key, {sortable}, fieldClassName)}
                            style={{
                                width: fieldWidth,
                                ...fieldStyle
                            }}
                            onClick={sortable && this.handleSort}>
                            {label}
                            {
                                sortable ?
                                (
                                    key===sortField ?
                                    (
                                        <span className={'dir selected '+(sortDesc?'desc':'')}>{sortDesc?'\u25BC':'\u25B2'}</span>
                                    )
                                    :
                                        <span className='dir'>{'\u25B2'}</span>
                                )
                                : ''
                            }
                        </th>
                    })
                }
                </tr></thead>
                <tbody onScroll={onScroll}>
                    {
                    info ? <tr><td className={cx('c-info', infoClassName)} colSpan={_.size(fields)}>{info}</td></tr> :
                    _.map(data, (row, index) => {
                        const rid = (rowIdField ? this.getRowId(row, rowIdField) : index)+''
                        let _className = rowClassName
                        if (rowClassName) {
                            if (_.isFunction(rowClassName)) {
                                _className = rowClassName(row)
                            }
                        }

                        if ((multiSelectable && _.includes(selected, rid)) || (!multiSelectable && selected===rid)) {
                            _className = [_className, 'selected']
                        }

                        let _rowStyle = rowStyle
                        if (rowStyle) {
                            if (_.isFunction(rowStyle)) {
                                _rowStyle = _.isPlainObject(rowStyle(row)) ? rowStyle(row) : {}
                            }
                        }

                        return (
                            <Row
                                key={rid}
                                id={rid}
                                fields={_.mapValues(fields, (v, k)=>{
                                    const fieldWidth = _.get(v, 'style.width', autoLayout ? _.get(fieldsSize, k) : null)
                                    return {
                                        ...v,
                                        style: {
                                            width: fieldWidth,
                                            ...(v.style || {})
                                        }
                                    };
                                })}
                                data={row}
                                className={cx(_className)}
                                style={_rowStyle}
                                force={refreshAll || forceRefresh.indexOf(''+rid)>=0}
                                onInputChange={onInputChange}
                                onContextMenu={onRowContextMenu ? this.handleContextMenu.bind(this, row) : null}
                                onClick={onRowClick ? this.handleRowClick.bind(this, row) : null}
                                onDoubleClick={onRowDoubleClick ? this.handleRowDoubleClick.bind(this, row) : null}
                                onMouseOver={onRowMouseOver ? this.handleRowMouseOver.bind(this, row) : null}
                                onMouseOut={onRowMouseOut ? this.handleRowMouseOut.bind(this, row) : null} />
                        );
                    })
                }
                </tbody>
                {footer ? <tfoot><tr><td>{footer}</td></tr></tfoot> : null}
            </table>
        );
    }
}

export default wireSet(Table, {
    sort: {
        changeHandlerName: 'onSort',
        defaultValue: {}
    },
    selected: {
        changeHandlerName: 'onSelectionChange',
        defaultValue: ({selection={}})=>{
            const {enabled, multiSelect=true} = selection
            if (enabled) {
                return multiSelect ? [] : ''
            }
            return ''
        }
    }
})