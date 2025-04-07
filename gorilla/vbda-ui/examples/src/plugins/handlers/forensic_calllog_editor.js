import PropTypes from 'prop-types';
import React from 'react'
import _ from 'lodash'
import i18n from 'i18next'
import cx from 'classnames'

import ModalDialog from 'react-ui/build/src/components/modal-dialog'
import Input from 'react-ui/build/src/components/input'
import DropDownList from 'react-ui/build/src/components/dropdown'
import DatePicker from 'react-ui/build/src/components/date-picker'

const log = require('loglevel').getLogger('ci/projects/project-edit')

const ID = 'g-ci-database-forensic-edit'

const INITIAL_STATE = {
    id: null,
    open: false,
    info: null,
    error: false,
    data: {},
    update: false
}

class Editor extends React.Component {
    static propTypes = {
        onUpdate: PropTypes.func.isRequired,
        onCreate: PropTypes.func.isRequired
    };

    state = _.clone(INITIAL_STATE);

    open = (data) => {
        // this.setState({open: true, data, update: !data.id})
        let update = Object.keys(data).length !== 0
        this.setState({open: true, data, update})
    };

    close = () => {
        this.setState(_.clone(INITIAL_STATE))
    };

    handleUpdateEvent = (changed) => {
        this.setState(_.clone(INITIAL_STATE), () => {
            this.props.onUpdate(changed)
        })
    };

    handleCreateEvent = (changed) => {
        this.setState(_.clone(INITIAL_STATE), () => {
            this.props.onCreate(changed)
        })
    };

    handleChange = (key, value) => {
        let {data} = this.state
        data[key] = value
        this.setState({data})
    };

    renderInput = (key, label, required = false, disabled = false) => {
        let {data} = this.state
        return <div>
            <label className='required' htmlFor={`${ID}-${key}`}>{label}</label>
            <Input
                id={`${ID}-${key}`}
                type='text'
                onChange={(value) => {
                    this.handleChange(key, value)
                }}
                value={data[key]}
                required={required}
                disabled={disabled}
            />
        </div>
    };

    error = (msg) => {
        this.setState({info: msg, error: true})
    };

    render() {
        let {data, info, error, open, update} = this.state

        if (!open) {
            return null
        }
        log.info('editor data: ', data)

        return <ModalDialog
            id={ID}
            title={`職業性賭場列管名冊資料庫-${update ? 'edit' : 'add'}`}
            draggable={true}
            global={true}
            info={info}
            infoClassName={cx({'c-error': error})}
            closeAction='cancel'
            actions={{
                cancel: {text: 'cancel', className: 'standard', handler: this.close.bind(this, false)},
                confirm: {text: 'create', handler: this.handleUpdateEvent.bind(this, data)}
            }}>
            <div className='c-flex fdc boxes'>
                {update ?
                    null
                    // <div className='c-flex fba'>
                    //     <div className='c-box'>
                    //         <header>案號</header>
                    //         <div className='content'>{data.id}</div>
                    //     </div>
                    //     {/*<div className='c-box'>*/}
                    //     {/*<header>結案狀態</header>*/}
                    //     {/*<div className='content'>*/}
                    //     {/*<DropDownList list={_.map(['closed', 'open'], item=>({value:item, text:item}))} />*/}
                    //     {/*</div>*/}
                    //     {/*</div>*/}
                    // </div>
                    : null
                    // <Input
                    //     id={ID + '-name'}
                    //     type='text'
                    //     onChange={(value) => {
                    //         data.id = value
                    //         this.setState({data})
                    //     }}
                    //     value={data.id}
                    //     required={true}/>

                }
                <div className='c-form'>
                    {this.renderInput('sourceNote', ' sourceNote', true)}
                    {/*{this.renderInput('serialNumber', ' serialNumber', true)}*/}
                    {/*{this.renderInput('durationInSeconds', ' durationInSeconds', true)}*/}
                    {/*{this.renderInput('isManualDecoded', ' isManualDecoded', true)}*/}
                    {/*{this.renderInput('startDttm', ' startDttm', true)}*/}
                    {/*{this.renderInput('isVideoCall', ' isVideoCall', true)}*/}
                    {/*{this.renderInput('endDttm', ' endDttm', true)}*/}
                    {/*{this.renderInput('networkName', ' networkName', true)}*/}
                    {/*{this.renderInput('label', ' label', true)}*/}
                </div>
            </div>
        </ModalDialog>
    }
}

export default Editor
