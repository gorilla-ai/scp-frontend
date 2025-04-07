import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import cx from 'classnames'
import createFragment from 'react-addons-create-fragment'

import CheckboxGroup from 'react-ui/build/src/components/checkbox-group'
import Checkbox from 'react-ui/build/src/components/checkbox'
import ButtonGroup from 'react-ui/build/src/components/button-group'

import localize from '../../hoc/locale-provider'

const gt = global.vbdaI18n.getFixedT(null, 'vbda')
const lt = global.vbdaI18n.getFixedT(null, 'search')

let log = require('loglevel').getLogger('vbda/components/search/dt-list')

export const LABEL_TYPES = ['person', 'car', 'case', 'phone', 'others']

export function getDtIdsByLabels(dtCfg, labelTypes) {
    const ifShowOthers = _.indexOf(labelTypes, 'others') !== -1
    const defaultLabel = ['person', 'car', 'case', 'phone']
    const compareLabel = _.intersection(labelTypes, ['person', 'car', 'case', 'phone'])
    const dts = _.reduce(dtCfg, (acc, {showSearch}, dtId) => {
        if (!showSearch) {//檢查本身config，有沒有支援搜尋
            return acc
        }
        if (labelTypes && _.intersection(labelTypes, dtCfg[dtId].labels).length > 0) {//人車案手機對應
            return [...acc, dtId]
        }
        if (ifShowOthers
            &&  _.intersection(defaultLabel, dtCfg[dtId].labels).length <= 0) {
            return [...acc, dtId]
        }
        return acc
    }, [])
    return dts
}

class DtList extends React.Component {
    static propTypes = {
        lng: PropTypes.string,
        cfg: PropTypes.shape({
            ds: PropTypes.objectOf(PropTypes.object),
            dt: PropTypes.objectOf(PropTypes.shape({
                searches: PropTypes.arrayOf(PropTypes.string)
            }))
        }).isRequired,
        onCurrentDtChange: PropTypes.func,
        onDtSelectionChange: PropTypes.func,
        defaultSelectedLabelTypes: PropTypes.arrayOf(PropTypes.string),
        selectedDtIds: PropTypes.arrayOf(PropTypes.string),
        currentDtId: PropTypes.string,
        dtsEventCount: PropTypes.object,
        useCheckbox: PropTypes.bool,

    };

    constructor(props) {
        super(props);
        const {defaultSelectedLabelTypes} = props

        this.state = {
            selectedLabelTypes: _.isEmpty(defaultSelectedLabelTypes) ? LABEL_TYPES : defaultSelectedLabelTypes
        };
    }

    componentWillReceiveProps(nextProps) {
        //選擇第一筆有event的資料庫
        const {dtsEventCount} = nextProps
        const {selectedLabelTypes} = this.state
        const {
            dtsEventCount: preDtsEventCount
        } = this.props
        if (_.isEmpty(dtsEventCount))
            return
        if (JSON.stringify(dtsEventCount) !== JSON.stringify(preDtsEventCount)) {//count不同
            const {
                cfg: {dt},
                onCurrentDtChange
            } = this.props
            let availableDtIds = getDtIdsByLabels(dt, selectedLabelTypes)
            let CurrentDtId = null
            _.forEach(availableDtIds, dtId => {
                if (dtsEventCount[dtId] > 0) {
                    CurrentDtId = dtId
                    return false
                }
            })
            //如果找不到哪一個資料庫可選則清空
            onCurrentDtChange(CurrentDtId)
        }

    }

    getAvailableDtList = (selectedLabelTypes) => {
        const {
            cfg: {dt, ds},
            currentDtId,
            onCurrentDtChange,
            dtsEventCount
        } = this.props
        let availableDtIds = getDtIdsByLabels(dt, selectedLabelTypes)
        const availableDtList = _.chain(availableDtIds)
            .map(dtId => {
                const {display_name, sort_order, ds: dsId} = dt[dtId]

                const dsText = ds[dsId].description || ds[dsId].display_name
                const dtText = display_name
                const count = _.get(dtsEventCount, [dtId])
                const isError = count instanceof Error

                return {
                    value: dtId,
                    text: '',
                    sort_order: sort_order,
                    children: (<span
                        className={cx('c-link c-flex aic', {current: currentDtId === dtId, zero: count === 0})}
                        onClick={onCurrentDtChange.bind(null, dtId)}>
                        {dtText}
                        {/*{dsText + ' - ' + dtText}*/}
                        {
                            isError ? <i className="fixed end fg fg-alert-1" title={count.message} /> :
                                (count!=null ?
                                        <div className={cx("c-bullet count fixed end", {zero: count === 0})}>{count}</div>
                                        :
                                        null
                                )
                        }
               </span>)
                }
            })
            .sortBy('sort_order')
            .map((o) => {
                delete o.sort_order
                return o
            })
            .value();
        return availableDtList
    };

    handleLabelTypesChange = (selectedLabelTypes) => {
        this.setState({selectedLabelTypes})
    };

    handleToggleAll = (selected) => {
        const {cfg:{dt}} = this.props
        const {selectedLabelTypes} = this.state
        const dts = selected ? getDtIdsByLabels(dt, selectedLabelTypes) : []
        this.props.onDtSelectionChange(dts)
    };

    render() {
        const {
            selectedDtIds,
            onDtSelectionChange,
            useCheckbox
        } = this.props
        const {selectedLabelTypes} = this.state
        let availableDtList = this.getAvailableDtList(selectedLabelTypes)//重 load 跟 重新 render  current
        const numSelected = selectedDtIds.length
        const total = this.getAvailableDtList(LABEL_TYPES).length
        const List =
            useCheckbox ?
                <div className='c-border'>
                    <div className='all c-padding c-flex inline aic'>
                        <Checkbox checked={numSelected>0}
                            className={cx({partial:numSelected>0 && numSelected<total})}
                            onChange={this.handleToggleAll} />
                        <label>{lt('lbl-all-dt')}</label>
                    </div>
                    <CheckboxGroup
                        id='dtList'
                        className='c-padding dt-list'
                        list={availableDtList}
                        value={selectedDtIds}
                        onChange={onDtSelectionChange}/>
                </div>
                : <ul className='dt-list'>
                    {
                        _.map(availableDtList, (item, id) => {
                            return <li key={id} id={id}>{item.children}</li>
                        })
                    }
                </ul>
        const fragment = createFragment({
            label: <div>
                <label>{lt('lbl-type')}</label>
                <ButtonGroup
                    id='types'
                    className='jcc'
                    list={_.map(LABEL_TYPES, type=>({value:type, text:lt(`type-${type}`)}))}
                    multi={true}
                    onChange={(data) => {
                        this.handleLabelTypesChange(data)
                    }}
                    value={selectedLabelTypes}/>
                </div>,
            List: <div>
                <label>{lt('lbl-database')}</label>
                {List}
            </div>
        })
        return <div className='c-vbda-dt-list c-form'>
            {fragment}
        </div>
    }
}

export default localize(DtList)
