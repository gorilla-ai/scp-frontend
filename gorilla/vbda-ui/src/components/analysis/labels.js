import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import cx from 'classnames'

import {Checkbox, PageNav, PopupDialog} from 'react-ui'
import {wire} from 'react-ui/build/src/hoc/prop-wire'

import Label from './label'

import localize from '../../hoc/locale-provider'

const lt = global.vbdaI18n.getFixedT(null, 'analysis')
const gt = global.vbdaI18n.getFixedT(null, 'vbda')

const log = require('loglevel').getLogger('vbda/components/analysis/labels')

const PAGE_SIZE = 20


class Labels extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        source: PropTypes.shape({
            labels: PropTypes.objectOf(PropTypes.shape({
                nodeId: PropTypes.string,
                props: PropTypes.object
            })),
            nodes: PropTypes.object,
            links: PropTypes.object
        }),
        sourceCfg: PropTypes.shape({
            dt: PropTypes.object,
            labels: PropTypes.objectOf(PropTypes.shape({
                icon_url: PropTypes.string
            }))
        }).isRequired,
        selectable: PropTypes.bool,
        selected: PropTypes.arrayOf(PropTypes.string),
        hilited: PropTypes.arrayOf(PropTypes.string),
        onSelectionChange: PropTypes.func,
        onClick: PropTypes.func
    };

    static defaultProps = {
        source: {},
        sourceCfg: {},
        selectable: false,
        selected: [],
        hilited: []
    };

    constructor(props, context) {
        super(props, context);
        const {source:{labels}} = props
        const labelTypes = this.getLabelTypes(labels)

        this.state = {
            displayType: 'grouped',
            page: 1,
            search: '',
            labelTypes,
            labelStats: this.getLabelStats(labels),
            currentLabelType: null
        };
    }

    componentWillReceiveProps(nextProps) {
        const {source:{labels}} = nextProps
        const labelTypes = this.getLabelTypes(labels)
        const {currentLabelType} = this.state
        this.setState({
            labelTypes,
            labelStats: this.getLabelStats(labels),
            currentLabelType: _.includes(labelTypes, currentLabelType) ? currentLabelType : null
        })
    }

    getLabelStats = (labels) => {
        return _(labels).countBy('type').mapValues(labelCount=>({total:labelCount})).value()
    };

    getLabelTypes = (labels) => {
        return _(labels).map('type').uniq().value()
    };

    handleLabelTypeChange = (labelType) => {
        const {currentLabelType} = this.state
        this.setState({
            currentLabelType: labelType===currentLabelType?null:labelType,
            page: 1
        })
    };

    handleSelectionChange = (changedLabel, selected) => {
        const {source:{labels}, selected:selectedLabels, onSelectionChange} = this.props

        let newSelectedLabels
        if (!changedLabel) {
            // select / unselect all
            newSelectedLabels = selected ? _.keys(labels) : []
        }
        else if (_.isArray(changedLabel)) {
            // select / unselect labels
            newSelectedLabels = (selected ? _.union(selectedLabels, changedLabel) : _.difference(selectedLabels, changedLabel))
        }
        else {
            // select / unselect label
            newSelectedLabels = (selected ? [...selectedLabels, changedLabel] : _.without(selectedLabels, changedLabel))
        }

        onSelectionChange(newSelectedLabels)
    };

    handleDisplayTypeChange = (displayType) => {
        this.setState({displayType})
    };

    applyFilter = () => {
        const search = this.filterNode.value
        this.setState({search, page:1})
    };

    handleClearFilter = () => {
        this.filterNode.value = ''
        this.applyFilter()
    };

    gotoPage = (page) => {
        this.setState({page})
    };

    openSelectedLabels = () => {
        const {sourceCfg, source:{nodes, links, labels}, selected:selectedLabelIds, onSelectionChange} = this.props
        const selectedLabels = _.pick(labels, selectedLabelIds)
        let newSelectedLabelIds
        PopupDialog.promptId('g-selected-intel-dialog', {
            title: lt('dlg-selected-labels'),
            display: <WiredLabels
                source={{nodes, links, labels:selectedLabels}}
                sourceCfg={sourceCfg}
                selectable
                defaultSelected={_.keys(selectedLabels)}
                onSelectionChange={(newSelectedLabels)=>{ newSelectedLabelIds=newSelectedLabels }} />,
            cancelText: gt('btn-cancel'),
            confirmText: gt('btn-confirm'),
            act: (confirmed)=>{
                if (confirmed) {
                    onSelectionChange(newSelectedLabelIds)
                }
            }
        })
    };

    renderList = () => {
        const {sourceCfg:{labels:labelsCfg}, source:{nodes, labels}, selectable, selected, hilited, onClick} = this.props
        const {
            labelTypes,
            currentLabelType,
            labelStats,
            search,
            page
        } = this.state

        const filteredLabels = _.filter(labels, ({nodeId, props:labelProps})=>{
            const nodeProps = nodes[nodeId].props
            return !search || _.some(_.values({...labelProps, ...nodeProps}), item=>(item+'').toLowerCase().indexOf(search.toLowerCase())>=0)
        })
        const filteredLabelGroups = _.groupBy(filteredLabels, 'type')
        const filteredLabelIds = _.map(filteredLabels, 'id')
        const selectedFilteredLabelIds = _.intersection(selected, filteredLabelIds)
        // filtered and selected labels
        const selectedFilteredLabelGroups = _(selectedFilteredLabelIds)
            .map(selectedLabel=>labels[selectedLabel])
            .groupBy('type')
            .value()

        return <div className='grow c-flex fdc c-margin'>
            <div className='c-flex aic fixed search'>
                <input className='grow' type='text' placeholder={lt('ph-search')} ref={ref=>{ this.filterNode=ref }} />
                <i className='fg fg-close' onClick={this.handleClearFilter} />
                <button className='fixed' onClick={this.applyFilter}>{gt('btn-search')}</button>
            </div>
            {
                _.map(labelTypes, labelType=>{
                    const isCurrent = labelType===currentLabelType
                    const labelGroup = filteredLabelGroups[labelType] || []
                    const labelIds = _.map(labelGroup, 'id')
                    const selectedLabelGroup = selectedFilteredLabelGroups[labelType] || []
                    const numLabels = labelStats[labelType].total

                    const {icon_url:iconUrl, display_name:displayName=labelType} = labelsCfg[labelType] || {}

                    return <div key={labelType} className={isCurrent?'grow c-flex fdc group selected' : 'fixed'}>
                        <div className='header c-flex fixed' onClick={this.handleLabelTypeChange.bind(this, labelType)}>
                            {selectable &&
                                <Checkbox
                                    className={cx({partial:selectedLabelGroup.length<labelGroup.length})}
                                    checked={selectedLabelGroup.length > 0}
                                    onChange={this.handleSelectionChange.bind(this, labelIds)} />
                            }
                            {iconUrl && <img className='icon' src={iconUrl} />}
                            <span className='title'>{!labelType?lt('label-types.others'):displayName}</span>
                            <span className={cx('c-bullet end', {small:!search})}>{search ? `${labelGroup.length}/${numLabels}` : numLabels}</span>
                        </div>
                        {
                            isCurrent && <div className='list c-flex fww grow'>
                                {
                                    _.map(_.slice(labelGroup, (page-1)*(PAGE_SIZE), page*PAGE_SIZE), labelItem=><Label
                                        key={labelItem.id}
                                        className={cx({hilite:_.includes(hilited, labelItem.id)})}
                                        selectable={selectable}
                                        selected={selectable ? _.includes(selected, labelItem.id) : false}
                                        labelData={labelItem}
                                        nodeData={nodes[labelItem.nodeId]}
                                        onSelect={selectable ? this.handleSelectionChange : null}
                                        onClick={onClick} />)
                                }
                            </div>
                        }
                        {
                            isCurrent && labelGroup.length > PAGE_SIZE &&
                            <PageNav
                                className='fixed c-margin center'
                                pages={Math.ceil(labelGroup.length/PAGE_SIZE)}
                                current={page}
                                thumbnails={7}
                                onChange={this.gotoPage} />
                        }
                    </div>
                })
            }
            {selectable &&
                <div className='fixed'>
                    <div className='header c-flex'>
                        <Checkbox
                            className={cx({partial:selectedFilteredLabelIds.length < filteredLabels.length})}
                            checked={selectedFilteredLabelIds.length > 0}
                            onChange={this.handleSelectionChange.bind(this, filteredLabelIds)} />
                        <span className='title'>{lt('lbl-select-all')}</span>
                        <span className='end c-link' onClick={this.openSelectedLabels}>{lt('txt-selected', {total:selected.length})}</span>
                    </div>
                </div>
            }
        </div>
    };

    renderTree = () => {

    };

    render() {
        const {id, className} = this.props
        const {displayType} = this.state
        return <div id={id} className={cx(className, 'c-flex fdc c-vbda-labels')}>
            {/*<ButtonGroup className='fixed end'
                list={[
                    {value:'grouped', text:<i className='fg fg-list'/>},
                    {value:'merged', text:<i className='fg fg-list'/>}
                ]}
                value={displayType}
                onChange={this.handleDisplayTypeChange}/>*/}
            { displayType === 'grouped' ? this.renderList() : this.renderTree() }
        </div>
    }
}

const WiredLabels = wire(Labels, 'selected', [], 'onSelectionChange')
export default localize(WiredLabels)