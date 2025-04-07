import React from 'react'
import DefaultEditor from './defaultEditor'
import _ from "lodash";

//相容舊式的呼叫方式
const EditorWrapper = React.createClass({
    getInitialState() {
        return {isUpdate: false}
    },
    componentDidMount() {
        const {_ref} = this.props
        if (_ref) {
            _ref(this)
        }
    },
    open(data, forceAdd = false) {
        const isUpdate = !forceAdd && !_.isEmpty(data)
        this.setState({isUpdate}, () => this.targetEditor.open(data, {isUpdate, forceAdd}))
    },
    render() {
        const {isUpdate} = this.state
        const props = {...this.props}
        props._ref = (ref) => {
            this.targetEditor = ref
        }
        props.actions = {
            onConfirm: {
                label: '確認',
                callBack: isUpdate ? this.props.onUpdate : this.props.onCreate
            }
        }
        return <DefaultEditor {...props} />
    }
})


export default EditorWrapper
