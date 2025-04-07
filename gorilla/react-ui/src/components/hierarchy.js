import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import cx from 'classnames'

import Checkbox from './checkbox'
import {wireSet} from '../hoc/prop-wire'

const log = require('loglevel').getLogger('react-ui/components/hierarchy')

/**
 * A React Hierarchy Component. Can be visually presented as tree or accordion layout.
 *
 * @constructor
 * @param {string} [id] - Hierarchy element #id
 * @param {string} [className] - Classname for the container
 * @param {'accordion'|'tree'} [layout='accordion'] - How to display the hierarchy structure?
 * @param {boolean} [foldable=true] - Allow expand/collapse (branch) nodes? If false all hierarchy structure will show
 * @param {number|array<number>} [indent] - Indentation for each node level:
 * * if number, this will be used for indentation of all levels
 * * if array, each array item will represent indentation of corresponding levels, if number of levels exceed array size,
 * then last defined indentation will be used for all subsequent levels
 * @param {object} [data={}] - Data to fill hierarchy with
 * @param {string} [data.id] - node id. Note if top level id is not specified, then root node will not be displayed
 * @param {renderable} [data.label] - node label
 * @param {string} [data.className] - Classname for the node
 * @param {boolean} [data.foldable=true] - Allow expand/collapse this node? If specified will overwrite global *foldable* setting above
 * @param {number} [data.indent] - Indentation for this node. If specified will overwrite global *indent* setting above
 * @param {boolean} [data.disabled=false] - Turning off selection for this node?
 * @param {array<data>} [data.children] - children of the node (can be defined recursively)
 * @param {object} [selection] - Node selection settings
 * @param {boolean} [selection.enabled=false] - Allow selecting nodes?
 * @param {array.<string>} [defaultSelected] - Default selected (leaf) node ids
 * @param {array.<string>} [selected] - Selected (leaf) node ids
 * @param {function} [onSelectionChange] - Callback function when node is selected. <br> Required when selected prop is supplied
 * @param {array.<string>} onSelectionChange.value - current selected (leaf) node ids
 * @param {object} onSelectionChange.eventInfo - event related info
 * @param {array.<string>} onSelectionChange.eventInfo.before - previous selected (leaf) node ids
 * @param {array.<string>} onSelectionChange.eventInfo.ids - (leaf) node ids triggering change
 * @param {boolean} onSelectionChange.eventInfo.selected - selected?
 * @param {string} [current] - Current node id
 * @param {string} [defaultCurrent] - Default current node id
 * @param {function} [onLabelClick] - Callback function when current node is changed. <br> Required when current prop is supplied
 * @param {string} onLabelClick.value - current node id
 * @param {object} onLabelClick.eventInfo - event related info
 * @param {string} onLabelClick.eventInfo.before - previously current node id
 * @param {array} onLabelClick.eventInfo.path - current node in the form of path (array), with id & child index
 * @param {boolean} onLabelClick.eventInfo.isBranch - whether this node is branch
 * @param {function} [onLabelMouseOver] - Callback function when node label is hovered
 * @param {string} onLabelMouseOver.id - hovered node id
 * @param {object} onLabelMouseOver.eventInfo - event related info
 * @param {array} onLabelMouseOver.eventInfo.path - current hovered node in the form of path (array), with id & child index
 * @param {boolean} onLabelMouseOver.eventInfo.isBranch - whether this node is branch
 * @param {array.<string>} [opened] - Current opened node ids
 * @param {array.<string>} [defaultOpened] - Default opened node ids
 * @param {function} [onToggleOpen] - Callback function when open is changed. <br> Required when opened prop is supplied
 * @param {array.<string>} onToggleOpen.value - current opened (branch) node ids
 * @param {object} onToggleOpen.eventInfo - event related info
 * @param {array.<string>} onToggleOpen.eventInfo.before - previously opened (branch) node ids
 * @param {string} onToggleOpen.eventInfo.id - triggering (branch) node id
 * @param {boolean} onToggleOpen.eventInfo.open - triggered by opening?
 * @param {array.<string>} onToggleOpen.eventInfo.path - triggering node in the form of path (array), with id & child index
 *
 * @example
// controlled

import _ from 'lodash'
import {Form, Hierarchy} from 'react-ui'


const INITIAL_DATA = {
    id: 'home',
    label: 'Home',
    children: [
        {
            id: 'A',
            children: [
                {
                    id: 'A.a',
                    children: [
                        {id:'A.a.1'},
                        {
                            id: 'A.a.2',
                            children: [
                                {id:'A.a.2.x'},
                                {id:'A.a.2.y'}
                            ]
                        }
                    ]
                },
                {
                    id: 'A.b',
                    children: [
                        {id:'A.b.1'},
                        {id:'A.b.2'},
                        {id:'A.b.3'}
                    ]
                }
            ]
        },
        {
            id: 'B', label: 'B',
            children: [
                {id:'B.a', label:'B.a custom label'},
                {id:'B.b', label:'B.b custom label'}
            ]
        }
    ]
}

Examples.Hierarchy = React.createClass({
    getInitialState() {
        return {
            current: 'A.a',
            selected: [],
            data: INITIAL_DATA,
            settings: {
                showRoot: false,
                foldable: true,
                selectable: true,
                layout: 'accordion'
            }
        }
    },
    handleLabelClick(current) {
        this.setState({current})
    },
    handleSelectChange(selected) {
        this.setState({selected})
    },
    renderDemoSettings() {
        const {settings} = this.state
        return <Form
            className='demo-settings'
            formClassName='inline'
            fields={{
                showRoot: {
                    label: 'Show Root?',
                    editor: 'Checkbox'
                },
                foldable: {
                    label: 'Allow Expand/Collapse?',
                    editor: 'Checkbox'
                },
                selectable: {
                    label: 'Selectable?',
                    editor: 'Checkbox'
                },
                layout: {
                    label: 'Layout',
                    editor: 'RadioGroup',
                    props: {
                        className: 'inline',
                        list: _.map(['tree', 'accordion'], l=>({value:l, text:l}))
                    }
                }
            }}
            value={settings}
            onChange={newSettings=>{ this.setState({settings:newSettings}) }} />
    },
    render() {
        let {data, current, selected, settings:{showRoot, foldable, selectable, layout}} = this.state

        return <div>
            {this.renderDemoSettings()}
            <Hierarchy
                layout={layout}
                foldable={foldable}
                data={showRoot?data:{children:data.children}}
                selection={{
                    enabled: selectable
                }}
                selected={selected}
                onSelectionChange={this.handleSelectChange}
                current={current}
                onLabelClick={this.handleLabelClick}
                defaultOpened={['home', 'A']} />
        </div>
    }
})
 */
class Hierarchy extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        layout: PropTypes.oneOf(['tree', 'accordion']),
        foldable: PropTypes.bool, // when false, will overwrite opened config, since full hierarchy will always be opened (opened=true)
        indent: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.arrayOf(PropTypes.number)
        ]),
        data: PropTypes.shape({
            id: PropTypes.string,
            label: PropTypes.node,
            className: PropTypes.string,
            foldable: PropTypes.bool,
            indent: PropTypes.number,
            disabled: PropTypes.bool,
            children: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    label: PropTypes.node,
                    className: PropTypes.string,
                    foldable: PropTypes.bool,
                    indent: PropTypes.number,
                    disabled: PropTypes.bool,
                    children: PropTypes.array
                })
            )
        }),
        selection: PropTypes.shape({
            enabled: PropTypes.bool
        }),
        selected: PropTypes.arrayOf(PropTypes.string),
        onSelectionChange: PropTypes.func,
        current: PropTypes.string,
        onLabelClick: PropTypes.func,
        onLabelMouseOver: PropTypes.func,
        opened: PropTypes.arrayOf(PropTypes.string),
        onToggleOpen: PropTypes.func
    };

    static defaultProps = {
        layout: 'accordion',
        foldable: true,
        indent: [4, 30],
        data: {},
        selection: {
            enabled: false
        },
        selected: [],
        opened: []
    };

    getLeafNodeIds = (path) => {
        const {data} = this.props
        const pathIgnoringRoot = _.first(path).index==null ? _.tail(path) : path
        const nodePath = _.isEmpty(pathIgnoringRoot) ? null : 'children.'+_.map(pathIgnoringRoot, 'index').join('.children.')
        const currentNode = nodePath ? _.get(data, nodePath) : data
        const children = currentNode.children
        if (!children) {
            return [currentNode.id]
        }
        else {
            const ids = _.flatten(_.map(children, (child, idx)=>{
                return this.getLeafNodeIds([...path, {id:child.id, index:idx}])
            }))
            return ids
        }
    };

    handleToggleNode = (id, path) => {
        const {opened, onToggleOpen} = this.props

        const open = !_.includes(opened, id)

        const newOpened = (
            open ?
                [...opened, id]:
                _.without(opened, id)
        )
        onToggleOpen(newOpened, {open, id, path})
    };

    handleSelectLabel = (id, path, isBranch) => {
        const {onLabelClick} = this.props
        onLabelClick(id, {path, isBranch})
    };

    handleHoverLabel = (id, path, isBranch) => {
        const {onLabelMouseOver} = this.props
        onLabelMouseOver && onLabelMouseOver(id, {path, isBranch})
    };

    handleSelectNode = (path, checked) => {
        const {selected} = this.props
        const {onSelectionChange} = this.props
        const ids = this.getLeafNodeIds(path)
        let newSelected
        if (checked) {
            newSelected = _.uniq([...selected, ...ids])
        }
        else {
            newSelected = _.without(selected, ...ids)
        }
        onSelectionChange(newSelected, {ids, selected:checked})
    };

    renderNode = (id, label, className, path, disabled, isBranch, foldable, openBranch) => {
        const {current, selected, selection:{enabled:selectable}, layout} = this.props
        const asTree = layout==='tree'
        const isCurrent = id===current
        const childrenIds = this.getLeafNodeIds(path)
        const numSelected = _.intersection(selected, childrenIds).length

        return <span
            style={asTree?null:{paddingLeft:_.last(path).indent}}
            className={cx('c-flex node', className, {current:isCurrent, selected:numSelected>0})} >
            {
                asTree && isBranch && foldable && <span className='toggler fixed' onClick={this.handleToggleNode.bind(this, id, path)}>
                    [<i className={cx('fg', openBranch?'fg-less':'fg-add')} />]
                </span>
            }
            {selectable && <Checkbox
                checked={numSelected>0}
                disabled={disabled}
                className={cx('fixed selector', {partial:numSelected>0 && numSelected<childrenIds.length})}
                onChange={this.handleSelectNode.bind(this, path)} />}
            <span
                className='label grow'
                onClick={this.handleSelectLabel.bind(this, id, path, isBranch)}
                onMouseOver={this.handleHoverLabel.bind(this, id, path, isBranch)}>
                {(label || id)}
            </span>
            {
                !asTree && isBranch && foldable && <span className='toggler fixed' onClick={this.handleToggleNode.bind(this, id, path)}>
                    <i className={cx('fg', openBranch?'fg-arrow-top':'fg-arrow-bottom')} />
                </span>
            }
        </span>
    };

    renderHierarchy = (root, parentPath, index) => {
        const {id} = root

        if (!id) {
            log.error('renderHierarchy::A child without id')
            return null
        }

        const {foldable, opened, indent} = this.props
        const indentCfg = _.isArray(indent) ? indent : [indent]
        const level = parentPath.length + 1
        const {
            label,
            className,
            disabled: disableLayer=false,
            foldable: layerFoldable=foldable,
            indent: layerIndent=_.get(indentCfg, level-1, _.last(indentCfg)),
            children
        } = root
        const currentPath = [...parentPath, {id, index, indent:_.get(_.last(parentPath), 'indent', 0)+layerIndent}]

        if (children) {
            const shouldOpen = !layerFoldable || _.find(opened, item=>item===id)

            return <li key={id} className={cx('branch', `level-${level}`)}>
                {
                    this.renderNode(id, label, className, currentPath, disableLayer, true, layerFoldable, shouldOpen)
                }
                {
                    shouldOpen ?
                        <ul className='children'>
                            {
                            _.map(children, (child, i) => {
                                return this.renderHierarchy(child, currentPath, i)
                            })
                        }
                        </ul> : null
                }
            </li>
        }
        else {
            return <li key={id} className={cx('leaf', `level-${level}`)}>
                {
                    this.renderNode(id, label, className, currentPath, disableLayer, false, false, false)
                }
            </li>
        }
    };

    // TODO: allow customizing leaf node and parent nodes
    render() {
        const {id, data, className, layout} = this.props
        const {id:rootId} = data

        return <ul id={id} className={cx('c-hierarchy', layout, className)}>
            {
                rootId ?
                this.renderHierarchy(data, []) :
                _.map(data.children, (item, i) => {
                    return this.renderHierarchy(item, [], i)
                })
            }
        </ul>
    }
}

export default wireSet(Hierarchy, {
    current: {defaultValue:'', changeHandlerName:'onLabelClick'},
    selected: {defaultValue:[], changeHandlerName:'onSelectionChange'},
    opened: {defaultValue:[], changeHandlerName:'onToggleOpen'}
})