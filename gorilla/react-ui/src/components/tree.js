import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import im from 'object-path-immutable'
import cx from 'classnames'

import {wireSet} from '../hoc/prop-wire'

let log = require('loglevel').getLogger('react-ui/components/tree')

/**
 * A React Tree Component.
 *
 * * Currently supports only single select
 *
 * @constructor
 * @param {string} [id] - Tree element #id
 * @param {string} [className] - Classname for the container
 * @param {object} [data={}] - Data to fill tree with
 * @param {string} [data.id] - node id. Note if top level id is not specified, then root node will not be displayed
 * @param {renderable} [data.label] - node label
 * @param {array<data>} [data.children] - children of the node (can be defined recursively)
 * @param {boolean} [allowToggle=true] - Allow toggle? If false all tree structure will show
 * @param {string} [selected] - Current selected node id
 * @param {string} [defaultSelected] - Default selected node id
 * @param {object} [selectedLink] - link to update selected node id. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {string} selectedLink.value - value to update
 * @param {function} selectedLink.requestChange - function to request selection change
 * @param {function} [onSelect] - Callback function when selection is changed. <br> Required when selected prop is supplied
 * @param {string} onSelect.value - current selected node id
 * @param {object} onSelect.eventInfo - event related info
 * @param {string} onSelect.eventInfo.before - previously selected node id
 * @param {array} onSelect.eventInfo.path - selected node in the form of path (array), with id & child index
 * @param {array<string>} [opened] - Current opened node ids
 * @param {array<string>} [defaultOpened] - Default opened node ids
 * @param {object} [openedLink] - link to update opened node ids. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {array<string>} openedLink.value - value to update
 * @param {function} openedLink.requestChange - function to request open change
 * @param {function} [onToggleOpen] - Callback function when open is changed. <br> Required when opened prop is supplied
 * @param {array<string>} onToggleOpen.value - current opened node ids
 * @param {object} onToggleOpen.eventInfo - event related info
 * @param {array<string>} onToggleOpen.eventInfo.before - previously opened node ids
 * @param {string} onToggleOpen.eventInfo.id - triggering id
 * @param {boolean} onToggleOpen.eventInfo.open - triggered by opening?
 * @param {array<string>} onToggleOpen.eventInfo.path - selected node in the form of path (array), with id & child index
 *
 * @example
// controlled

import _ from 'lodash'
import im from 'object-path-immutable'
import {Tree} from 'react-ui'

const INITIAL_DATA = {
    id:'home',
    label:'Home',
    children:[
        {
            id:'C', label:'C - click to load children dynamically',
            children:[]
        },
        {
            id:'A',
            children: [
                {
                    id:'A.a',
                    children: [
                        {id:'A.a.1'},
                        {
                            id:'A.a.2',
                            children:[
                                {id:'A.a.2.x'},
                                {id:'A.a.2.y'}
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id:'B', label:'B',
            children: [
                {id:'B.a', label:'B.a custom label'},
                {id:'B.b', label:'B.b custom label'}
            ]
        }
    ]
}

React.createClass({
    getInitialState() {
        return {
            allowToggle:true,
            selected:'A.a',
            data:INITIAL_DATA
        }
    },
    toggleAll() {
        let {allowToggle} = this.state;
        this.setState({allowToggle: !allowToggle})
    },
    selectEntry(selected, eventData) {
        this.setState({selected})
    },
    toggleOpen(opened, eventData) {
        let {id, open, path} = eventData;

        if (id === 'C' && open) {
            let setPath = (_(path).map(p=>p.index).tail().map(p=>'children.'+p).value()).join('.')+'.children'

            console.log(`loading more data for ${id}: ${setPath}`)

            let newData = im.set(this.state.data, setPath, [
                {id:'C.a'},
                {id:'C.b'}
            ])
            this.setState({data:newData})
        }
    },
    render() {
        let {data, selected, allowToggle} = this.state;

        return <div>
            <button onClick={this.toggleAll}>{allowToggle?'Disable':'Enable'} toggle</button>
            <Tree
                data={data}
                allowToggle={allowToggle}
                selected={selected}
                defaultOpened={['home','A']}
                onToggleOpen={this.toggleOpen}
                onSelect={this.selectEntry}/>
        </div>
    }
});
 */
class Tree extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        data: PropTypes.shape({
            id: PropTypes.string,
            label: PropTypes.node,
            children: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    label: PropTypes.node,
                    children: PropTypes.array
                })
            )
        }),
        allowToggle: PropTypes.bool, // when false, will overwrite opened config, since full tree will always be opened (opened=true)
        selected: PropTypes.string,
        onSelect: PropTypes.func,
        opened: PropTypes.arrayOf(PropTypes.string),
        onToggleOpen: PropTypes.func
    };

    static defaultProps = {
        data: {},
        allowToggle: true,
        opened: []
    };

    selectNode = (id, isBranch, path) => {
        let {allowToggle, onSelect, opened, onToggleOpen} = this.props

        if (isBranch && allowToggle) {
            let idIndex = _.findIndex(opened, item => item===id)
            let open = idIndex < 0

            let newOpened = (
                open ?
                    [...opened, id]:
                    im.del(opened, idIndex)
            )
            onToggleOpen(newOpened, {open, id, path})
        }

        // to resolve onToggleOpen & onSelect setState conflict (onSelect will overwrite onToggleOpen's state)
        // use timeout
        // TODO: think of better way to address
        setTimeout(()=>{
            onSelect(id, {path})
        }, 0)
    };

    renderNode = (id, isBranch, label, openBranch, path) => {
        let {selected, allowToggle} = this.props
        let isSelected = id===selected

        return <span
            className={cx(isBranch?'branch':'leaf', {selected:isSelected})}
            onClick={this.selectNode.bind(this, id, isBranch, path)}>
            {
                    isBranch && allowToggle ? <span>
                        [<i className={cx('fg', openBranch?'fg-less':'fg-add')} />]
                        <span className='label'>{(label || id)}</span>
                    </span> :
                    (label || id)
                }
        </span>
    };

    renderTree = (root, parentPath, index) => {
        let {allowToggle, opened} = this.props
        let {id, label, children} = root

        if (!id) {
            log.error('renderTree::A child without id')
            return null
        }

        let currentPath = [...parentPath, {id, index}]

        if (children) {
            let shouldOpen = !allowToggle || _.find(opened, item=>item===id)

            return <li key={id}>
                {
                    this.renderNode(id, true, label, shouldOpen, currentPath)
                }
                {
                    shouldOpen ?
                        <ul>
                            {
                        _.map(children, (child, i) => {
                            return this.renderTree(child, currentPath, i)
                        })
                    }
                        </ul> : null
                }
            </li>
        }
        else {
            return <li key={id}>
                {
                    this.renderNode(id, false, label, false, currentPath)
                }
            </li>
        }
    };

    // TODO: allow customizing leaf node and parent nodes
    render() {
        let {id, data, className} = this.props
        let {id:rootId} = data

        return <ul id={id} className={cx('c-tree', className)}>
            {
                rootId ?
                this.renderTree(data, []) :
                _.map(data.children, (item, i) => {
                    return this.renderTree(item, [], i)
                })
            }
        </ul>
    }
}

export default wireSet(Tree, {
    selected: {defaultValue:'', changeHandlerName:'onSelect'},
    opened: {defaultValue:[], changeHandlerName:'onToggleOpen'}
})