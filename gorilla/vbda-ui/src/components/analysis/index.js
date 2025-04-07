import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'

import {Progress} from 'react-ui'
import {downloadFile, downloadDataUrl} from 'react-ui/build/src/utils/download'

import Gis from './gis'
import La from './la'
import Labels from './labels'
import {analyze, analyzeLabels} from '../../analyzer'
import toList from '../../exporter/labels'
import localize from '../../hoc/locale-provider'

const log = require('loglevel').getLogger('vbda/components/analysis')

const lt = global.vbdaI18n.getFixedT(null, 'analysis')
const gt = global.vbdaI18n.getFixedT(null, 'vbda')


class Analysis extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        lng: PropTypes.string,
        _ref: PropTypes.func,
        events: PropTypes.objectOf(PropTypes.object),
        eventsCfg: PropTypes.shape({
            dt: PropTypes.object
        }).isRequired,
        analyzeOptions: PropTypes.object,
        labels: PropTypes.shape({
            enableDownload: PropTypes.bool
        }),
        la: PropTypes.shape({
            enabled: PropTypes.bool
        }),
        gis: PropTypes.shape({
            enabled: PropTypes.bool
        })
    };

    static defaultProps = {
        events: {},
        eventsCfg: {},
        analyzeOptions: {},
        labels: {
            enableDownload: false
        },
        la: {
            enabled: true
        },
        gis: {
            enabled: true
        }
    };

    state = {
        laSource: {},
        gisSource: {},
        selectedLabels: [],
        chartedLabels: [],
        currentLabels: [],
        fullscreen: ''
    };

    componentDidMount() {
        const {_ref, events, eventsCfg, analyzeOptions} = this.props

        setTimeout(()=>{
            const source = this.analyzeSource(events, eventsCfg, analyzeOptions)
            this.setState({
                ...source,
                selectedLabels: _.keys(source.laSource.labels)
            })
        }, 0)

        if (_ref) {
            _ref(this)
        }
    }

    componentWillReceiveProps(nextProps) {
        const {events, eventsCfg, analyzeOptions, keepStateOnEventsChange} = nextProps
        const {events:prevEvents} = this.props
        const {selectedLabels, chartedLabels, laSource} = this.state
        if (events !== prevEvents) {
            log.info('componentWillReceiveProps::events changed', prevEvents, events)
            const source = this.analyzeSource(events, eventsCfg, analyzeOptions)

            const appendedLabels = _.difference(_.keys(source.laSource.labels), _.keys(laSource.labels))
            const newSelectedLabels = [...selectedLabels, ...appendedLabels]

            this.setState({
                ...source,
                selectedLabels: keepStateOnEventsChange&&this.analysisInitiated ? newSelectedLabels : _.keys(source.laSource.labels),
                chartedLabels: keepStateOnEventsChange&&this.analysisInitiated ? newSelectedLabels : []
            })
        }
    }

    analyzeSource = (events, eventsCfg, laOptions={}, gisOptions={}) => {
        const {gis:{enabled:enableGis=true}} = this.props

        log.info('analyzeSource::start', events)
        Progress.startSpin()
        const laSource = analyze(events, eventsCfg, {...laOptions, analyzeGis:enableGis})
        const gisSource = !enableGis ? {} : analyzeLabels(events, eventsCfg, {
            ...gisOptions,
            filter: (item) => !_.isEmpty(item.locations) || !_.isEmpty(item.track)
        })
        const result = {
            laSource,
            gisSource
        }
        Progress.done()
        log.info('analyzeSource::done', result)
        return result
    };

    handleLabelSelectionChange = (selectedLabels) => {
        this.setState({selectedLabels})
    };

    handleLabelClick = (labelId) => {
        const {labels} = this.state.laSource
        const nodeId = labels[labelId].nodeId
        log.info('handleLabelClick', labelId, nodeId)

        this.setState({currentLabels:[labelId]})
    };

    handleDelete = (itemIds) => {
        const {nodes} = this.state.laSource
        const labelIds = _(itemIds)
            .map(itemId=>_.get(nodes, [itemId,'labels'], []))
            .flatten()
            .uniq()
            .value()
        this.toggleLabels(labelIds, false)
    };

    toggleLabels = (labelIds, on) => {
        const {selectedLabels} = this.state
        const newSelectedLabels = on ?
                _.uniq([...selectedLabels, ...labelIds]) :
                _.without(selectedLabels, ...labelIds)
        this.setState({
            selectedLabels: newSelectedLabels,
            chartedLabels: newSelectedLabels
        })
    };

    toggleFullscreen = (panel) => {
        this.setState({fullscreen:panel}, ()=>{
            this.laAnalysis._component.resize()
            this.gisAnalysis._component.resize()
        })
    };

    applySelection = () => {
        this.analysisInitiated = true
        const {selectedLabels} = this.state
        this.setState({chartedLabels:selectedLabels})
    };

    clearAnalysis = () => {
        this.setState({
            chartedLabels: []
        })
    };

    downloadIntelSource = () => {
        const {labels:{afterDownload}, events, eventsCfg} = this.props
        const {laSource:{nodes, labels}} = this.state
        //downloadFile(JSON.stringify(events), 'intel', 'json')
        const csv = toList({events, nodes, labels}, eventsCfg, {labelOthers:lt('label-types.others')})
        downloadDataUrl('data:text/csv;charset=utf-8,%EF%BB%BF'+encodeURIComponent(csv), 'intel', 'csv')
        afterDownload && afterDownload()
    };

    render() {
        const {
            id,
            className, events, eventsCfg, lng,
            labels: labelsCfg,
            la: {enabled:enableLa=true, ...laCfg},
            gis: {enabled:enableGis=true, ...gisCfg}
        } = this.props
        const {laSource, gisSource, selectedLabels, chartedLabels, fullscreen, currentLabels} = this.state

        return <div id={id} className={cx(className, 'c-flex c-join vertical c-vbda-analysis')}>
            <div className='c-box labels fixed search'>
                <header className='c-flex aic'>
                    {lt('hdr-intel-list')}
                    {labelsCfg.enableDownload &&
                        <button
                            className='end standard fg fg-data-download'
                            title={lt('tt-labels-download')}
                            disabled={_.isEmpty(laSource)}
                            onClick={this.downloadIntelSource} />
                    }
                </header>
                {
                    _.isEmpty(laSource) ? <div className='content'>{gt('txt-loading')}</div> :
                    <Labels
                        className='content nopad'
                        source={laSource}
                        sourceCfg={eventsCfg}
                        selectable
                        selected={selectedLabels}
                        hilited={currentLabels}
                        onClick={this.handleLabelClick}
                        onSelectionChange={this.handleLabelSelectionChange} />
                }
                <footer className='c-flex'>
                    <button onClick={this.applySelection}>{lt('btn-analyze')}</button>
                    <button onClick={this.clearAnalysis}>{lt('btn-clear')}</button>
                </footer>
            </div>
            {enableLa && <La
                id='g-la'
                title={lt('hdr-la')}
                className={cx({hide:fullscreen==='gis'})}
                sourceCfg={eventsCfg}
                events={events}
                source={laSource}
                {...laCfg}
                ref={ref=>{this.laAnalysis=ref}}
                show={chartedLabels}
                selected={currentLabels}
                lng={lng}
                onReady={()=>{
                    this.laAnalysis._component.resize()
                }}
                onDelete={this.handleDelete}
                actions={enableGis ? (
                    fullscreen==='la' ?
                        <button className='standard fg fg-fullscreen-exit' title={lt('tt-exit-fullscreen')} onClick={this.toggleFullscreen.bind(this, null)} /> :
                        <button className='standard fg fg-fullscreen' title={lt('tt-fullscreen')} onClick={this.toggleFullscreen.bind(this, 'la')} />
                    ) : null} />
            }
            {enableGis && <Gis
                id='g-gis'
                title={lt('hdr-gis')}
                className={cx({hide:fullscreen==='la'})}
                sourceCfg={eventsCfg}
                events={events}
                source={gisSource}
                {...gisCfg}
                ref={ref=>{
                    this.gisAnalysis=ref
                    this.gisAnalysis && this.gisAnalysis._component.resize()
                }}
                show={chartedLabels}
                selected={currentLabels}
                lng={lng}
                actions={enableLa ? (
                    fullscreen==='gis' ?
                        <button className='standard fg fg-fullscreen-exit' title={lt('tt-exit-fullscreen')} onClick={this.toggleFullscreen.bind(this, null)} /> :
                        <button className='standard fg fg-fullscreen' title={lt('tt-fullscreen')} onClick={this.toggleFullscreen.bind(this, 'gis')} />
                    ) : null} />
            }
        </div>
    }
}

export default localize(Analysis)