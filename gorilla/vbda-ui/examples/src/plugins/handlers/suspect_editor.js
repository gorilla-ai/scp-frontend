import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import im from 'object-path-immutable'
import i18n from 'i18next'
import cx from 'classnames'

import DataTable from 'react-ui/build/src/components/table'
import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import Input from 'react-ui/build/src/components/input'
import DropDownList from 'react-ui/build/src/components/dropdown'
import DatePicker from 'react-ui/build/src/components/date-picker'
import FileInput from 'react-ui/build/src/components/file-input'
import Textarea from 'vbda/components/visualization/textarea'
import Checkbox from 'react-ui/build/src/components/checkbox'

const log = require('loglevel').getLogger('ci/projects/project-edit')

const ID = 'g-ci-database-forensic-edit'

const INITIAL_STATE = {
    id: null,
    open: false,
    info: null,
    error: false,
    data: {},
    isUpdate: false,
    connectPresentAddr: false,
    toBase64List: []
}

class Editor extends React.Component {
    static propTypes = {
        onUpdate: PropTypes.func.isRequired,
        onCreate: PropTypes.func.isRequired
    };

    state = _.clone(INITIAL_STATE);

    open = (data) => {
        // this.setState({open: true, data, update: !data.id})
        let isUpdate = Object.keys(data).length !== 0
        this.setState({open: true, data, isUpdate})
    };

    close = () => {
        this.setState(_.clone(INITIAL_STATE))
    };

    handleUpdateEvent = (changed) => {
        this.postTreatment(changed)
        this.setState(_.clone(INITIAL_STATE))
    };

    postTreatment = (formData) => {
        const {onUpdate, onCreate} = this.props
        const onConfirm = this.state.isUpdate ? onUpdate : onCreate

        //地址處理
        formData.houseAddr = formData.houseCityShip + formData.houseZoneShip + formData.houseZipShip + formData.houseAddrShip
        formData.presentAddr = formData.presentCityShip + formData.presentZoneShip + formData.presentZipShip + formData.presentAddrShip


        if (this.state.toBase64List.length > 0) {//有圖片類型需要處理
            Promise.all(_.map(this.state.toBase64List, (fieldPath) => {
                if (_.get(formData, fieldPath, null)) {
                    return getBase64(_.get(formData, fieldPath), (value) => {
                        _.set(formData, fieldPath, value)
                    })
                }
            }))
                .then(() => {
                    log.info(formData)
                    onConfirm(formData)
                })
        }
        else
            onConfirm(formData)

        function getBase64(file, callBack) {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                callBack(reader.result)
            };
        }
    };

    handleCreateEvent = (changed) => {
        this.setState(_.clone(INITIAL_STATE), () => {
            this.props.onCreate(changed)
        })
    };

    handleChange = (key, value) => {
        let {data} = this.state
        data = im.set(data, key, value)
        this.setState({data})
    };

    renderInput = (key, label, required = false, disabled = false, handleChange) => {
        let {data} = this.state
        return <div>
            <label className={required ? 'required' : ''} htmlFor={`${ID}-${key}`}>{label}</label>
            <Input
                className='grow'
                id={`${ID}-${key}`}
                type='text'
                onChange={(value) => {
                    if (handleChange)
                        handleChange(value)
                    else
                        this.handleChange(key, value)
                }}
                value={data[key]}
                required={required}
                disabled={disabled}
            />
        </div>
    };

    renderTextarea = (key, label, required = false) => {
        let {data} = this.state
        return <div>
            <label className={required ? 'required' : ''} htmlFor={`${ID}-${key}`}>{label}</label>
            <Textarea
                id={`${ID}-${key}`}
                onChange={(value) => {
                    this.handleChange(key, value)
                }}
                value={data[key]}
            />
        </div>
    };

    renderDatePick = (key, label, required = false, disabled = false, enableTime = false) => {
        let {data} = this.state
        return <div>
            <label className={required ? 'required' : ''} htmlFor={`${ID}-${key}`}>{label}</label>
            <DatePicker
                id={`${ID}-${key}`}
                onChange={(value) => {
                    this.handleChange(key, value)
                }}
                value={data[key]}
                required={required}
                disabled={disabled}
                enableTime={enableTime}
            />
        </div>
    };

    renderAddress = () => {
        let {data, connectPresentAddr} = this.state
        return <div>
            <label className={'required'}>戶籍地</label>
            <div>
                <DropDownList list={[
                    {value: '自行車', text: '自行車'},
                    {value: '汽車', text: '汽車'},
                    {value: '機車', text: '機車'}
                ]}
                              onChange={(value) => {
                                  data = im.set(data, 'houseCityShip', value)
                                  if (connectPresentAddr)
                                      data = im.set(data, 'presentCityShip', value)
                                  this.setState({data})
                              }}
                              value={data.houseCityShip}
                />
                <DropDownList list={[
                    {value: '自行車', text: '自行車'},
                    {value: '汽車', text: '汽車'},
                    {value: '機車', text: '機車'}
                ]}
                              onChange={(value) => {
                                  data = im.set(data, 'houseZoneShip', value)
                                  if (connectPresentAddr)
                                      data = im.set(data, 'presentZoneShip', value)
                                  this.setState({data})
                              }}
                              value={data.houseZoneShip}
                />
                <DropDownList list={[
                    {value: '自行車', text: '自行車'},
                    {value: '汽車', text: '汽車'},
                    {value: '機車', text: '機車'}
                ]}
                              onChange={(value) => {
                                  data = im.set(data, 'houseZipShip', value)
                                  if (connectPresentAddr)
                                      data = im.set(data, 'presentZipShip', value)
                                  this.setState({data})
                              }}
                              value={data.houseZipShip}
                />
                <Input
                    className='grow'
                    type='text'
                    onChange={(value) => {
                        data = im.set(data, 'houseAddrShip', value)
                        if (connectPresentAddr)
                            data = im.set(data, 'presentAddrShip', value)
                        this.setState({data})
                    }}
                    value={data.houseAddrShip}
                />
            </div>
        </div>
    };

    renderPresentAddress = () => {
        let {data, connectPresentAddr} = this.state
        return <div>
            <label className={'required'}>
                現居地
                <Checkbox
                    onChange={(value) => {
                        // this.state.connectPresentAddr = !connectPresentAddr
                        this.state.data.presentCityShip = this.state.data.houseCityShip
                        this.state.data.presentZoneShip = this.state.data.houseZoneShip
                        this.state.data.presentZipShip = this.state.data.houseZipShip
                        this.state.data.presentAddrShip = this.state.data.houseAddrShip
                        this.setState({connectPresentAddr: !connectPresentAddr})
                    }}
                    checked={connectPresentAddr}
                />
                同戶籍地
            </label>
            <div>
                <DropDownList list={[
                    {value: '自行車', text: '自行車'},
                    {value: '汽車', text: '汽車'},
                    {value: '機車', text: '機車'}
                ]}
                              onChange={(value) => {
                                  data = im.set(data, 'presentCityShip', value)
                                  this.setState({data})
                              }}
                              value={data.presentCityShip}
                              disabled={connectPresentAddr}
                />
                <DropDownList list={[
                    {value: '自行車', text: '自行車'},
                    {value: '汽車', text: '汽車'},
                    {value: '機車', text: '機車'}
                ]}
                              onChange={(value) => {
                                  data = im.set(data, 'presentZoneShip', value)
                                  this.setState({data})
                              }}
                              value={data.presentZoneShip}
                              disabled={connectPresentAddr}
                />
                <DropDownList list={[
                    {value: '自行車', text: '自行車'},
                    {value: '汽車', text: '汽車'},
                    {value: '機車', text: '機車'}
                ]}
                              onChange={(value) => {
                                  data = im.set(data, 'presentZipShip', value)
                                  this.setState({data})
                              }}
                              value={data.presentZipShip}
                              disabled={connectPresentAddr}
                />
                <Input
                    className='grow'
                    type='text'
                    onChange={(value) => {
                        this.handleChange('presentAddrShip', value)
                    }}
                    value={data.presentAddrShip}
                    disabled={connectPresentAddr}
                />
            </div>
        </div>
    };

    error = (msg) => {
        this.setState({info: msg, error: true})
    };

    render() {
        let {data, info, error, open, isUpdate, connectPresentAddr} = this.state

        if (!open) {
            return null
        }
        log.info('editor data: ', data)

        return <ModalDialog
            id={ID}
            className='event-editor-form'
            title={`犯嫌資料庫-${isUpdate ? 'edit' : 'add'}`}
            draggable={true}
            global={true}
            info={info}
            infoClassName={cx({'c-error': error})}
            closeAction='cancel'
            actions={{
                cancel: {text: 'cancel', className: 'standard', handler: this.close.bind(this, false)},
                confirm: {text: isUpdate ? 'update' : 'create', handler: this.handleUpdateEvent.bind(this, data)}
            }}>
            <div className='c-flex fdc boxes'>
                <div className='c-form'>
                    {this.renderInput('paperno', '文號', true)}
                    {this.renderInput('uname', '犯嫌姓名', true)}
                    {this.renderInput('nname', '綽號', true)}
                    {this.renderInput('upid', '統一編號(身分證)', true)}
                    {this.renderDatePick('birthday', '出生日期', true)}
                    {this.renderInput('feature', '特徵', true)}
                    {this.renderInput('height', '身高', false)}
                    {this.renderInput('bodyType', '體型', false)}
                    {this.renderInput('education', '學歷', false)}

                    <div>
                        <label htmlFor={`${ID}-photos`}>照片
                            <button
                                onClick={() => {
                                    if (!data.photos)
                                        this.handleChange('photos', ['', ''])
                                    else {
                                        data.photos.push('')
                                        this.handleChange('photos', data.photos)
                                    }
                                }}
                            >+
                            </button>
                        </label>
                        <FileInput
                            id={`${ID}-photos`}
                            type='text'
                            onChange={(value) => {
                                this.handleChange('photos.0', value)
                                this.state.toBase64List.push("photos.0")
                            }}
                            value={data['photos']}
                            required={true}
                        />
                        {
                            !data.photos || data.photos.length < 0 ?
                                null
                                :
                                _.map(data.photos, (val, index) => {
                                    if (index === 0)
                                        return null
                                    return <FileInput
                                        key={index}
                                        id={`${ID}-photos`}
                                        type='text'
                                        onChange={(value) => {
                                            this.handleChange('photos.' + index, value)
                                            this.state.toBase64List.push('photos.' + index)
                                        }}
                                        value={data.photos[index]}
                                        required={index === 0}
                                    />
                                })
                        }
                    </div>
                    {this.renderAddress()}
                    {this.renderPresentAddress()}
                    {this.renderInput('homePhone', '家用電話', true)}
                    {this.renderInput('sendDept', '發函單位', true)}
                    {this.renderDatePick('sendDate', '發函日期', true)}
                    <div>
                        <label className="required" htmlFor={`${ID}-uwordfile`}>上手簡易筆錄檔</label>
                        <FileInput
                            id={`${ID}-uwordfile`}
                            onChange={(value) => {
                                this.state.toBase64List.push('uwordfile')
                                this.handleChange('uwordfile', value)
                            }}
                            value={data['uwordfile']}
                        />
                    </div>
                    {this.renderInput('modusOperandi', '犯罪手法', false)}
                    <AmazingTableComponent
                        id='vehicles'
                        dataName='犯罪交通工具'
                        fields={{
                            type: {
                                label: '類型', inputType: 'dropDownList', props: {
                                    list: [
                                        {value: '自行車', text: '自行車'},
                                        {value: '汽車', text: '汽車'},
                                        {value: '機車', text: '機車'}
                                    ]
                                }
                            },
                            plant: {label: '廠牌', inputType: 'string'},
                            make: {label: '型號', inputType: 'string'},
                            licensePlate: {label: '牌號', inputType: 'string'},
                            displacement: {label: '排氣量', inputType: 'string'},
                            color: {label: '顏色', inputType: 'string'},
                            years: {label: '年份', inputType: 'string'}
                        }}
                        onConfirm={(data) => {
                            log.info(data)
                            this.handleChange('locations', data)
                        }}
                        data={_.get(data, 'locations', [])}
                    />
                    {this.renderInput('crimeTarget', '犯罪手法', false)}
                    {this.renderTextarea('summy', '案情摘要', false)}
                    {this.renderTextarea('ps', '犯罪手法', false)}
                    <AmazingTableComponent
                        id='parties'
                        dataName='同夥資料'
                        fields={{
                            uname: {label: '同夥名稱', inputType: 'string'},
                            nname: {label: '同夥綽號', inputType: 'string'},
                            upid: {label: '同夥身份證', inputType: 'string'},
                            feature: {label: '同夥特徵', inputType: 'string'},
                            cb1: {
                                label: '是否為關係人', inputType: 'checkbox',
                                formatter: (val, rawData) => {
                                    return <div>
                                        {val === true ? 'V' : null}
                                    </div>
                                }
                            },
                            cb2: {
                                label: '是否同案移送', inputType: 'checkbox',
                                formatter: (val, rawData) => {
                                    return <div>
                                        {val === true ? 'V' : null}
                                    </div>
                                }
                            },
                            cb3: {
                                label: '是否在場查獲', inputType: 'checkbox',
                                formatter: (val, rawData) => {
                                    return <div>
                                        {val === true ? 'V' : null}
                                    </div>
                                }
                            }
                        }}
                        onConfirm={(data) => {
                            log.info(data)
                            this.handleChange('parties', data)
                        }}
                        data={_.get(data, 'parties', [])}
                    />
                    <AmazingTableComponent
                        id='drugs'
                        dataName='毒品資料'
                        fields={{
                            drugName: {
                                label: '毒品名稱', inputType: 'dropDownList', props: {
                                    list: [
                                        {value: '自行車', text: '自行車'},
                                        {value: '汽車', text: '汽車'},
                                        {value: '機車', text: '機車'}
                                    ]
                                }
                            },
                            drugLevel: {label: '毒品級別', inputType: 'string'},
                            drugWeight: {label: '毒品重量', inputType: 'string'},
                            holdWeight: {label: '持有重量', inputType: 'string'},
                            holdDate: {label: '持有日期', inputType: 'date'},
                            sellDate: {label: '販售日期', inputType: 'date'},
                            useDate: {label: '施用日期', inputType: 'date'}
                        }}
                        onConfirm={(data) => {
                            log.info(data)
                            this.handleChange('drugs', data)
                        }}
                        data={_.get(data, 'drugs', [])}
                    />
                    <AmazingTableComponent
                        id='locations'
                        dataName='毒品地點'
                        fields={{
                            sellLocation: {label: '販售地點', inputType: 'string'},
                            useLocation: {label: '施用毒品地點', inputType: 'string'}
                        }}
                        onConfirm={(data) => {
                            log.info(data)
                            this.handleChange('locations', data)
                        }}
                        data={_.get(data, 'locations', [])}
                    />
                    <AmazingTableComponent
                        id='phones'
                        dataName='通聯記錄'
                        fields={{
                            phone: {label: '犯嫌電話', inputType: 'string'},
                            phonePw: {label: '開機密碼', inputType: 'string'},
                            phoneNo: {label: '手機序號', inputType: 'string'},
                            isImport: {
                                label: '是否匯入', inputType: 'checkbox',
                                formatter: (val, rawData) => {
                                    return <div>
                                        {val === true ? 'V' : null}
                                    </div>
                                }
                            }
                        }}
                        onConfirm={(data) => {
                            log.info(data)
                            this.handleChange('phones', data)
                        }}
                        data={_.get(data, 'phones', [])}
                    />
                    <AmazingTableComponent
                        id='phoneRecords'
                        dataName='通聯記錄明細'
                        fields={{
                            direction: {
                                label: '方向', inputType: 'dropDownList',
                                props: {
                                    list: [
                                        {value: 1, text: '打入'},
                                        {value: 2, text: '打出'}
                                    ]
                                },
                                formatter: (val, rawData) => {
                                    return <div>
                                        {val === 1 ? '打入' : '打出'}
                                    </div>
                                }
                            },
                            phone: {label: '電話', inputType: 'string'},
                            uname: {label: '姓名', inputType: 'string'},
                            pdate: {label: '通聯日期', inputType: 'date'},
                            relationship: {label: '與被告關係', inputType: 'string'},
                            drugmanA: {
                                label: '被告之毒品上手', inputType: 'checkbox',
                                formatter: (val, rawData) => {
                                    return <div>
                                        {val === true ? 'V' : null}
                                    </div>
                                }
                            },
                            drugmanB: {
                                label: '其他毒品施用者', inputType: 'checkbox',
                                formatter: (val, rawData) => {
                                    return <div>
                                        {val === true ? 'V' : null}
                                    </div>
                                }
                            },
                            drugmanC: {
                                label: '其他販毒者', inputType: 'checkbox',
                                formatter: (val, rawData) => {
                                    return <div>
                                        {val === true ? 'V' : null}
                                    </div>
                                }
                            }
                        }}
                        onConfirm={(data) => {
                            log.info(data)
                            this.handleChange('phoneRecords', data)
                        }}
                        // data={_.get(data, 'communicationDetail-to', [])}
                        data={_.sortBy(data.phoneRecords, ['direction'])}
                    />
                </div>
            </div>
        </ModalDialog>
    }
}

export default Editor

class AmazingTableComponent extends React.Component {
    static propTypes = {
        onConfirm: PropTypes.func.isRequired,
        data: PropTypes.array.isRequired,
        dataName: PropTypes.string.isRequired,
        id: PropTypes.string,
        fields: PropTypes.object.isRequired
    };

    state = {
        open: false,
        formData: {}
    };

    error = (msg) => {
        this.setState({info: msg, error: true})
    };

    handleConfirm = (formData) => {
        let {onConfirm, data} = this.props
        if (!data)
            data = []
        data.push(formData)
        onConfirm(data)
        this.setState({open: false})
    };

    getInputComponent = (type) => {
        switch (type) {
            case 'string':
                return this.renderInput
            case 'date':
                return this.renderDatePick
            case 'checkbox':
                return this.renderCheckbox
            case 'dropDownList':
                return this.renderDropDownList
            default:
                return this.renderInput
        }
    };

    renderDatePick = (key, label, props) => {
        let {formData} = this.state
        let {required, disabled, enableTime} = props
        return <div key={key}>
            <label className={required ? 'required' : ''} htmlFor={`datePick-${key}`}>{label}</label>
            <DatePicker
                id={`datePick-${key}`}
                onChange={(value) => {
                    formData = im.set(formData, key, value)
                    this.setState({formData})
                }}
                value={formData[key]}
                required={required}
                disabled={disabled}
                enableTime={enableTime}
            />
        </div>
    };

    renderCheckbox = (key, label, props) => {
        let {formData} = this.state
        let {required} = props
        return <div key={key}>
            <label className={required ? 'required' : ''} htmlFor={`checkbox-${key}`}>
                <Checkbox
                    id={`Checkbox-${key}`}
                    onChange={(value) => {
                        formData = im.set(formData, key, value)
                        this.setState({formData})
                    }}
                    checked={formData[key]}
                />
                {label}
            </label>
        </div>
    };

    renderDropDownList = (key, label, props) => {
        let {formData} = this.state
        let {list, required} = props
        return <div key={key}>
            <label className={required ? 'required' : ''} htmlFor={`${ID}-${key}`}>{label}</label>
            <DropDownList id={`DropDownList-${key}`}
                          list={list}
                          onChange={(value) => {
                              formData = im.set(formData, key, value)
                              this.setState({formData})
                          }}
                          value={formData[key]}
            />
        </div>
    };

    renderInput = (key, label, props) => {
        let {formData} = this.state
        return <div key={key}>
            <label className={props.required ? 'required' : ''} htmlFor={`input-${key}`}>{label}</label>
            <Input
                className='grow'
                id={`input-${key}`}
                type='text'
                onChange={(value) => {
                    formData = im.set(formData, key, value)
                    this.setState({formData})
                }}
                value={formData[key]}
                required={props.required ? props.required : false}
                disabled={props.disabled ? props.disabled : false}
            />
        </div>
    };

    // renderDeleteButton(index) {
    //     let {formData} = this.state
    //     return <div key={key}>
    //         <label className={props.required ? 'required' : ''} htmlFor={`input-${key}`}>{label}</label>
    //         <Input
    //             className='grow'
    //             id={`input-${key}`}
    //             type='text'
    //             onChange={(value) => {
    //                 formData = im.set(formData, key, value)
    //                 this.setState({formData})
    //             }}
    //             value={formData[key]}
    //             required={props.required ? props.required : false}
    //             disabled={props.disabled ? props.disabled : false}
    //         />
    //     </div>
    // },
    render() {
        let {open, formData} = this.state
        let {dataName, id, fields, data} = this.props

        return <div id={`AmazingTableComponent-${id}`}>
            <label htmlFor={`${id}-phone`}>
                {dataName}
                <button
                    onClick={() => {
                        this.setState({open: true})
                    }}
                >新增
                </button>
                {
                    open ?
                        <ModalDialog
                            id={`${dataName}-confirm`}
                            title={`新增${dataName}`}
                            draggable={true}
                            global={true}
                            closeAction='cancel'
                            actions={{
                                cancel: {text: 'cancel', className: 'standard', handler: () => this.setState({open: false})},
                                confirm: {text: 'ok', handler: () => this.handleConfirm(formData)}
                            }}>
                            <div className='c-form'>
                                {
                                    _.map(fields, ({label, inputType, props}, key) => {
                                        const inputComponent = this.getInputComponent(inputType)
                                        return inputComponent(key, label, props ? props : {})
                                    })
                                }
                            </div>
                        </ModalDialog>
                        :
                        null
                }
            </label>
            <div>
            </div>
            {
                !data || data.length <= 0 ?
                    <div>無資料</div>
                    :
                    <DataTable id="phoneTable"
                               className="border-inner bland c-border"
                               data={data}
                               fields={fields}
                    />
            }
        </div>
    }
}

// const renderFormField = React.createClass({
//     propTypes: {
//         data: React.PropTypes.func.isRequired,
//         onChange: React.PropTypes.func.isRequired
//     },
//     render(){
//         return<div>
//             <label htmlFor={`${ID}-phone`}>聯繫電話</label>
//             {
//                 !data.phone || data.phone.length < 0 ?
//                     <Input
//                         id={`${ID}-address`}
//                         type='text'
//                         onChange={(value) => {
//                             this.handleChange('phone.0', value)
//                         }}
//                         value={data['phone']}
//                     />
//                     :
//                     _.map(data.phone, (val, index) => {
//                         return <div>
//                             <Input
//                                 id={`${ID}-phone`}
//                                 type='text'
//                                 onChange={(value) => {
//                                     this.handleChange('phone.' + index, value)
//                                 }}
//                                 value={data.phone[index]}
//                             />
//                         </div>
//                     })
//             }
//             <button>add</button>
//         </div>
//     }
// }
