import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import cx from 'classnames'
import im from 'object-path-immutable'
import moment from 'moment'
import DataTable from 'react-ui/build/src/components/table'
import ButtonGroup from 'react-ui/build/src/components/button-group'
import createFragment from 'react-addons-create-fragment'
import {config as configLoader} from "vbda/loader";
import {syntaxStringParse} from "vbda/parser/syntax";

const log = require('loglevel').getLogger('vbda/components/visualization/defaultDetail')
const gt = global.vbdaI18n.getFixedT(null, 'vbda')
import localize from '../../hoc/locale-provider'
/**
 * @param cfg config
 * @param event event data
 *
 */
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'tiff', 'bmp']
const WORD_BREAK = {wordBreak: "break-word"}

class defaultDetail extends React.Component {
    static propTypes = {
        dtCfg: PropTypes.object,
        event: PropTypes.object
    };

    constructor(props, context) {
        super(props, context);
        const {dtCfg} = props
        let cfgDetailTabs = _.cloneDeep(_.get(dtCfg, ['detail', 'tabs'], null))
        if (!cfgDetailTabs) {
            //沒有對應config
            const {event} = props

            this.state = {
                info: `${gt('txt-config-error')}(${event.__data_source}-${event.__data_type})`,
                error: true
            };

            return;
        }
        const event = this.prepareFileToEvent()

        this.state = {
            event,
            nowTab: 0,
            arrayIndex: {},
            info: gt('txt-loading')
        };
    }

    componentDidMount() {
        const {dtCfg: {data_mappings}} = this.props
        if (this.state.error) { //config 設置錯誤
            return
        }
        configLoader.processDataMappings(data_mappings)
            .then(dataMappings => {
                this.afterLoadDataMapping(dataMappings)
            })
    }

    afterLoadDataMapping = (dataMappings) => {
        log.info('afterLoadDataMapping', dataMappings)
        const tabs = this.mappingEventToFields({...dataMappings})
        if (tabs.length !== 0) {
            this.setState({
                info: null,
                tabs
            })
        }
        else {
            this.setState({
                info: gt('txt-config-error'),
                error: true
            })

        }
    };

    mappingEventToFields = (dataMappings) => {
        let {dtCfg} = this.props
        let cfgDetail = _.cloneDeep(_.get(dtCfg, ['detail'], null))
        let result = _.chain(cfgDetail.tabs)
            .sortBy('order')
            .map(({label, groups}) => {
                groups = _.chain(groups)
                    .sortBy('order')
                    .map((group) => {
                        // let data = {}
                        let {fields, type} = group
                        switch (type) {//基本的
                            default :
                                fields = _.chain(fields)
                                    .map(({order, format}, fieldName) => {
                                        const dataMapping = _.get(dataMappings, fieldName, null)
                                        return fields = {
                                            __name: fieldName,
                                            label: this.getDisplayName(fieldName),
                                            formatter: this.getFormatter(fieldName, dataMapping, this.getFormatterByDetailConfig(format)),
                                            order
                                        }
                                    })
                                    .sortBy('order')
                                    .keyBy('__name')
                                    .mapValues((o) => {
                                        delete o.__name
                                        delete o.order
                                        return o
                                    })
                                    .value();
                                group.type = 'list'
                                break
                            case 'table':
                            case 'array':
                                if (_.isNil(_.get(group, 'props.rootKey')))
                                    return group//設置錯誤不處理
                                let {props: {rootKey}} = group
                                fields = _.chain(fields)
                                    .map(({order, format}, fieldName) => {
                                        const dataMapping = _.get(dataMappings, fieldName, null)
                                        return {
                                            __name: fieldName.replace(rootKey + '.', ''),
                                            label: this.getDisplayName(fieldName),
                                            formatter: this.getFormatter(fieldName, dataMapping, this.getFormatterByDetailConfig(format)),
                                            order
                                        }
                                    })
                                    .sortBy('order')
                                    .keyBy('__name')
                                    .mapValues((o) => {
                                        delete o.__name
                                        delete o.order
                                        return o
                                    })
                                    .value();
                                break

                        }
                        // group.data = data//考慮到別得地方可能需要用到完整的event，暫時不這樣做
                        group.fields = fields
                        return group
                    })
                    .value()
                return {label, groups}
            })
            .value()
        console.log(result)
        return result
    };

    getDisplayName = (key) => {
        let {dtCfg} = this.props
        const cfgDtFields = dtCfg.fields
        const fieldNamePathArray = _.split(key.replace(/\./g, '.properties.'), '.')
        return _.get(cfgDtFields, [...fieldNamePathArray, 'display_name'], key)
    };

    getType = (key) => {
        //TODO 未來應該有別的地方定義type而不是由property決定
        let {dtCfg} = this.props
        const cfgDtFields = dtCfg.fields
        const fieldNamePathArray = _.split(key.replace(/\./g, '.properties.'), '.')
        const type = _.get(cfgDtFields, [...fieldNamePathArray, 'type'], null)
        return type
    };

    getFormatterByDetailConfig = (format = {}) => {
        const {type, props={}} = format
        log.info(format)
        switch (type) {
            case 'hyper-link':
                const linkFormatter = (value, data) => {
                    if(_.isNil(value) || value === '')
                        return gt('field-no-data')
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

    getFormatter = (key, dataMapping, customFormatter) => {
        let type
        if (customFormatter)
            type = 'default'//一律用default
        else
            type = this.getType(key)
        switch (type) {
            default:
                const defaultFormatter = (value, data) => {
                    if (dataMapping) {
                        value = _.get(dataMapping, value, value)
                    }
                    if (_.isArray(value)) {
                        const dataTableFields = {
                            fakeKey: {
                                label: '', formatter: (value, tableRowData) => {
                                    return <div style={WORD_BREAK}>
                                        {!_.isNil(value) ? (customFormatter ? customFormatter(value, tableRowData) : value) : gt('field-no-data')}
                                    </div>
                                }
                            }
                        }
                        const valArray = _.chain(value)
                            .map(o => {
                                return {fakeKey: o}
                            })
                            .value()
                        return <DataTable className="bland no_header"
                                          fields={dataTableFields}
                                          data={valArray}
                        />
                    }
                    value = !_.isNil(value) ? (value !== '' ? value : ' ') : value
                    return <div key={key} style={WORD_BREAK}>
                        {!_.isNil(value) ? (customFormatter ? customFormatter(value, data) : value) : gt('field-no-data')}
                    </div>
                }
                return defaultFormatter
            case 'image':
                const imageFormatter = (value) => {
                    return <div key={key}>
                        {
                            !_.isEmpty(value) ?
                                _.map(value, (val, index) => {
                                    return <CustomImage key={index} srcString={val}/>

                                })
                                : gt('field-no-data')
                        }
                    </div>
                }
                return imageFormatter
            case 'date':
                const dateFormatter = (value) => {
                    return <div key={key}>
                        {
                            !_.isEmpty(value) ?
                                moment(value).format('YYYY-MM-DD HH:mm:ss')
                                : gt('field-no-data')
                        }
                    </div>
                }
                return dateFormatter
            case 'file':
            case 'video':
                const fileFormatter = (value) => {
                    return <div key={key}>
                        {
                            !_.isEmpty(value) ?
                                _.map(value, (val, index) => {
                                    const fileNameExtension = val.slice(val.lastIndexOf('.') + 1)
                                    let isImage = false
                                    _.forEach(IMAGE_EXTENSIONS, (IMAGE_EXTENSION) => {
                                        if (fileNameExtension.toLowerCase() === IMAGE_EXTENSION) {
                                            isImage = true
                                            return false
                                        }
                                    })
                                    if (isImage) {
                                        return <CustomImage key={index} srcString={val}/>
                                    }
                                    return <button key={index}
                                                   onClick={() => {
                                                       this.downloadDataUrl(`/api/file/${val}`)
                                                   }}
                                    ><i className='c-link fg fg-data-download' title={val}/>
                                    </button>
                                })
                                : gt('field-no-data')
                        }
                    </div>
                }
                return fileFormatter
            case 'boolean':
                const booleanFormatter = (value) => {
                    return <div key={key}>
                        {
                            !_.isNil(value) ?
                                <div>
                                    {
                                        value === true ?
                                            '是'
                                            :
                                            '否'
                                    }
                                </div>
                                : gt('field-no-data')
                        }
                    </div>
                }
                return booleanFormatter
        }
    };

    getValue = (key) => {
        //TODO Mapping
        let {event} = this.state
        // const fieldNamePathArray = _.split(key.replace(/\./g, '.properties.'), '.')
        return _.get(event, key, null)
    };

    prepareFileToEvent = () => {
        let {dtCfg, event: propsEvent} = this.props
        let newEvent = _.cloneDeep(propsEvent)
        if (_.isEmpty(propsEvent.__fileInfo))
            return newEvent
        const fields = dtCfg.fields
        const fileMapping = _.chain(propsEvent.__fileInfo)
            .keyBy('uuid')
            .value()
        newEvent = this.parseFileObject(newEvent, fields, fileMapping)
        log.info('fomattedEventWithFileInfo', newEvent)
        return newEvent
    };

    parseFileObject = (event, fields, fileMapping) => {
        _.forEach(fields, (field1, key1) => {
            if (field1.type) {//有type就不是object
                switch (field1.type) {
                    case 'image':
                    case 'file':
                        if (_.has(event, '__' + key1)){
                            let fileUUIDList = []
                            fileUUIDList = _.concat(fileUUIDList, _.get(event, '__' + key1))
                            const fileUrlList = _.map(fileUUIDList, (fileUUID) => {
                                return fileMapping[fileUUID].fileServerPath
                            })
                            _.set(event, key1, fileUrlList)
                        }
                        else {//可能是object array的形式，再次檢查
                            if (_.isArray(event) &&
                                !_.isEmpty(event) &&
                                _.isObject(event[0])
                            ) {
                                event = _.map(event, e => {
                                    if (_.has(e, '__' + key1)){
                                        let fileUUIDList = []
                                        fileUUIDList = _.concat(fileUUIDList, _.get(e, '__' + key1))
                                        const fileUrlList = _.map(fileUUIDList, (fileUUID) => {
                                            return fileMapping[fileUUID].fileServerPath
                                        })
                                        _.set(e, key1, fileUrlList)
                                    }
                                    return e
                                })
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
            else {
                const childFieldsEvent = this.parseFileObject(_.get(event, [key1]), field1.properties, fileMapping)
                _.set(event, key1, childFieldsEvent)
            }
        })
        return event
    };

    parseFieldsForDetail = (fields) => {//遞迴把displayName換掉
        let resultFields = {}
        _.forEach(fields, ({type}, key) => {
            let title = _.get(fields, key + '.display_name', key)
            if (type) {//有type就不是object
                resultFields[key] = {
                    title,
                    type
                }
            }
            else {
                let properties = this.parseFieldsForDetail(fields[key].properties, fields)
                resultFields[key] = {
                    title,
                    properties
                }
            }
        })
        return resultFields
    };

    renderGroup = (group, groupIndex) => {
        const {label, type, fields, props, width} = group
        let {arrayIndex, event} = this.state
        let header
        let content
        switch (type) {
            default:
                header = <header>{label}</header>
                content = <div className='content c-result'>
                    {this.renderGroupContent(fields, event)}
                </div>
                break
            case 'table':
                header = <header>{label}</header>
                content =
                    <div className='content c-result'>
                        {this.renderGroupTable(fields, this.getValue(props.rootKey))}
                    </div>
                break
            case 'array':
                if (_.isNil(_.get(props, 'rootKey'))) {
                    //設置錯誤不處理
                    header = <header className='dspFlex'>{label}</header>
                    content = <div className='content'>
                        <div className='c-error'>
                            {`${gt('txt-config-error')}(missing root key)`}
                        </div>
                    </div>
                    break
                }
                const {rootKey} = props
                let index = _.get(arrayIndex, rootKey, 0)
                let rootValue = this.getValue(rootKey)
                const data = _.get(rootValue, index, {})
                header = <header className='dspFlex'>
                    {
                        !_.isNil(rootValue) ?
                            (() => {
                                let maxLength = rootValue.length
                                if (_.isEmpty(data))
                                    return label + '0/0'
                                return <div className={'c-flex'}>
                                    <div>{label}</div>
                                    <div className={'c-flex'}>
                                        <i className='fg fg-arrow-left' onClick={() => {
                                            if (index !== 0)
                                                this.setState({arrayIndex: im.set(arrayIndex, rootKey, index - 1)})
                                        }}/>
                                        {index + 1}/{maxLength}
                                        <i className='fg fg-arrow-right' onClick={() => {
                                            if (index < maxLength - 1)
                                                this.setState({arrayIndex: im.set(arrayIndex, rootKey, index + 1)})
                                        }}/>
                                    </div>
                                </div>
                            })()
                            :
                            label
                    }
                </header>
                content = <div className='content c-result'>
                    {this.renderGroupContent(fields, data)}
                </div>
                break
        }
        return <div key={groupIndex} className={cx('c-box', width ? '' : 'grow')} style={{flexBasis: width ? 'auto' : '200px', width: width ? width + 'px' : '100%'}}>
            {header}
            {content}
        </div>
    };

    renderGroupContent = (fields, data) => {
        if (_.isEmpty(data))
            return <div className='content c-flex jcc'>{gt('field-no-data')}</div>
        return <div className='content c-result'>
            {
                _.map(fields, ({label, formatter, dataMapping}, key) => {
                    let val = _.get(data, key, null)
                    let content = formatter(val, data)
                    if (_.isNil(val) && key.indexOf('.') > -1) {//如果沒有資料，嘗試往object array的方向找
                        const rootKeyTest = key.slice(0, key.lastIndexOf('.'))
                        const childKeyTest = key.slice(key.lastIndexOf('.') + 1)
                        const objectArrayTest = _.get(data, rootKeyTest, null)//往上一層找，看看是不是一個Object Array
                        if (_.isArray(objectArrayTest)) {
                            const valueArray = _.map(objectArrayTest, (object) => {//把Value從object array裡面的，各個object中一個一個取出來
                                const objectArrayValue = _.get(object, childKeyTest, null)
                                return objectArrayValue
                            })
                            content = formatter(this.flattenArray(valueArray), data)
                        }
                    }
                    return <div key={key}>
                        <label title={key}>{label}</label>
                        <div title={val}>{content}</div>
                    </div>
                })
            }
        </div>
    };

    flattenArray = (array) => {//把多層攤成一層array
        let resultArray = []
        _.forEach(array, val => {
            if (_.isArray(val)) {
                resultArray = [...resultArray, ...this.flattenArray(val)]
            }
            else
                resultArray.push(val)
        })
        return resultArray
    };

    renderGroupTable = (fields, data) => {
        if (_.isEmpty(data))
            return <div className='content c-flex jcc'>{gt('field-no-data')}</div>
        log.info(fields)
        log.info(data)
        _.map(fields, (field, key) => {
            let val = _.get(data, key, null)
            if (field.dataMapping)
                val = _.get(field.dataMapping, _.get(data, key, null), _.get(data, key, null))
            log.info(val)
            return
        })
        return <DataTable className="bland"
                          fields={fields}
                          data={data}
        />
    };

    downloadDataUrl = (dataUrl) => {
        let fileName = dataUrl.slice(dataUrl.lastIndexOf('/'))

        // Anchor
        var anchor = document.createElement('a');
        anchor.setAttribute('href', dataUrl);
        anchor.setAttribute('download', fileName);

        // Click event
        var event = document.createEvent('MouseEvent');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

        anchor.dispatchEvent(event);
        // document.removeChild(anchor)
        // delete anchor;
    };

    renderInfo = (text, error = false) => {
        return <div className="c-box grow">
            <div className={cx("content c-center c-info", {'c-error': error})}>{text}</div>
        </div>
    };

    render() {
        let {tabs, nowTab, info, error} = this.state
        if (info)
            return this.renderInfo(info, error)
        let list = _.map(tabs, ({label}, index) => {
            return {value: index, text: label}
        })
        const fragments = createFragment({
            tabs:
                tabs.length > 1 ?
                    <div className='c-flex aic jcsb fixed c-toolbar'>
                        <ButtonGroup
                            list={list}
                            value={nowTab}
                            onChange={(value) => {
                                this.setState({nowTab: value})
                            }}
                        />
                    </div>
                    :
                    null
            ,
            groups: <div className='c-flex boxes'>
                {_.map(tabs[nowTab].groups, (group, index) => {
                    return this.renderGroup(group, index)
                })}
            </div>
        })
        return <div id='info_main' className='defaultDetail'>
            {fragments}
        </div>
    }
}

export default localize(defaultDetail)


class CustomImage extends React.Component {
    static propTypes = {
        srcString: PropTypes.string.isRequired,
    };

    state = {
        imgSrc: null,
        error: false,
        nowSrcString: this.props.srcString
    };

    componentDidMount() {
        const {srcString} = this.props
        this.preLoad(srcString)
    }

    componentWillReceiveProps(nextProps) {
        const {srcString} = nextProps
        // log.info(srcString)
        this.setState({imgSrc: null, error: false, nowSrcString: srcString})
        this.preLoad(srcString)
    }

    preLoad = (srcString) => {
        let timeout = 30000;
        let timedOut = false, timer;
        let img = new Image();
        const setState = (val) => this.setState(val)
        const setImageSrc = (srcString) => this.setImageSrc(srcString)
        img.src = `/api/file/${srcString}`;
        img.onerror = img.onabort = function () {
            if (!timedOut) {
                clearTimeout(timer);
                setState({error: true})
            }
        };
        img.onload = function () {
            if (!timedOut) {
                clearTimeout(timer);
                setImageSrc(srcString)
            }
        };
        timer = setTimeout(function () {
            timedOut = true;
            setState({error: true})
        }, timeout);
    };

    setImageSrc = (srcString) => {
        if (srcString === this.state.nowSrcString)
            this.setState({imgSrc: `/api/file/${srcString}`})
    };

    render() {
        let {imgSrc, error} = this.state
        let {srcString} = this.props
        if (error)
            return <div>讀取失敗({srcString})</div>
        if (imgSrc)
            return <img style={{paddingLeft: '5px'}} src={imgSrc} width="200px"/>
        return <div><i className="fg fg-loading-2 fg-spin"/></div>
    }
}