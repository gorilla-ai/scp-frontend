import PropTypes from 'prop-types';
import React from 'react'
import createFragment from 'react-addons-create-fragment'
import cx from 'classnames'
import _ from 'lodash'
import im from 'object-path-immutable'

import FormElements from './index'
import {wire} from '../hoc/prop-wire'

const log = require('loglevel').getLogger('react-ui/components/form')

/**
 * A React Form Component, with configuration for one or more fields
 * @constructor
 * @param {string} [id] - Container element #id
 * @param {object} fields - All fields definition, in key-config pair
 * @param {object} fields.key - Config for this **key** field
 * @param {renderable} [fields.key.label=key if non-merging] - Display label
 * @param {string} [fields.key.className] - classname for this field.
 * @param {boolean} [fields.key.merge=false] - Whether to merge the field value into existing form value, only works when field value is itself an object
 * @param {string|function} [fields.key.editor] - React class to use for rendering the input
 * * native dom elements: eg 'input'|'div' etc
 * * react-ui input components: 'ButtonGroup' | CheckboxGroup' | Checkbox' | Combobox' | DatePicker' | DateRange' | Dropdown' | FileInput' | 'Form' | Input' | MultiInput' | RadioGroup' | RangeCalendar' | Slider' | 'ToggleButton'
 * * custom defined React class with 'value' prop and 'onChange' event prop for interactivity
 * @param {object|function} [fields.key.props] - Props for the above react class, see individual doc for the base class
 * @param {renderable|function} [fields.key.formatter] - Render function
 * @param {renderable} [header] - Any react renderable node
 * @param {renderable} [footer] - Any react renderable node
 * @param {object} actions - All actions definition, in key-config pair
 * @param {object} actions.key - Config for this **key** action
 * @param {string} [actions.key.className] - Classname for the action button
 * @param {renderable} [actions.key.text=key] - Display text
 * @param {boolean} [actions.key.disabled=false] - disable this action?
 * @param {function} actions.key.handler - handler function when action is clicked
 * @param {object} actions.key.handler.value - form value as argument for the handler function
 * @param {boolean} [actions.key.clearForm=false] - clear form when this action button is clicked?
 * @param {boolean} [actions.key.triggerOnComplete=false] - whether to trigger the *handler* when input is completed (by pressing enter key)
 * @param {string} [className] - Classname for the form container
 * @param {string} [formClassName] - Classname for the form content, default selected classnames:
 * * aligned - For each field, arrange label and input on left-right layout (default to top-bottom)
 * * inline - Layout fields from left to right (and top to bottom)
 * * left - When field is **aligned**, make label align to left (default to right)
 * @param {number} [columns=1] - Number of columns to show when arranging using **aligned** classname
 * @param {string} [fieldClassName] - Global classname for each field
 * @param {object} [defaultValue] - Default form input values
 * @param {object} [value] - Current form input values
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {function} [onChange] - Callback function when from/to is changed. <br> Required when value prop is supplied
 * @param {object} onChange.value - current form input values
 * @param {object} onChange.eventInfo - event related info
 * @param {string} onChange.eventInfo.field - field information which triggered the change
 * @param {string} onChange.eventInfo.field.name - which field triggered change?
 * @param {*} onChange.eventInfo.field.value - corresponding value for triggered **field.name**
 * @param {object} onChange.eventInfo.before - previous form input values
 * @param {boolean} onChange.eventInfo.isComplete - was it triggered by pressing enter key on an input field?
 *
 * @example
// controlled

import {Form} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            movie: {
                id: 99,
                year: '1982',
                title: 'Blade Runner',
                directory: 'Ridley Scott',
                languages: ['english','japanese'],
                genre: 'scifi', // index into 'scifi' drop down list
                notes: [],
                scores: {
                    imdb: 8.2,
                    rottenTomatoes: 8.9
                }
            }
        }
    },
    handleChange(movie) {
        this.setState({movie})
    },
    render() {
        let {movie} = this.state;
        return <Form id='movie'
            formClassName='c-form'
            header='Create New Movie'
            fields={{
                id: {label:'ID', formatter:id=>`X${id}`},
                year: {label:'Year', editor:'Input', props:{type:'integer', required:true, validate:{min:1900}}},
                title: {label:'Title', editor:'Input', props:{required:true}},
                director: {label:'Director', editor:'Input', props:{required:true}},
                languages: {label:'Languages', editor:'CheckboxGroup', props:{
                    list:[
                        {value:'english',text:'English'},
                        {value:'japanese',text:'Japanese'},
                        {value:'german',text:'German'},
                        {value:'xyz',text:'XYZ'}
                    ],
                    disabled:['xyz']
                }},
                genre: {label:'Genre', editor:'Dropdown', props:{
                    list:[
                        {value:'drama', text:'Drama'},
                        {value:'horror', text:'Horror'},
                        {value:'scifi', text:'Sci-Fi'}
                    ],
                    defaultText:'Please select a genre'
                }},
                notes: {label:'Notes', editor:'MultiInput', props:{base:'Input', inline:true}},
                'scores.imdb': {label:'IMDB Score', editor:'Input', props:(data)=>{
                    // disable IMDB score when production year is in the future
                    if (data.year >= 2017) {
                        return {disabled:true}
                    }
                    else {
                        return {type:'number', validate:{min:0}}}
                    }
                },
                'scores.rottenTomatoes': {label:'Rotten Tomatotes Score', editor:'Input', props:{type:'number', validate:{min:0}}}
            }}
            onChange={this.handleChange}
            value={movie}/>
    }
})
 */
class Form extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        fields: PropTypes.objectOf(PropTypes.shape({
            label: PropTypes.node,
            className: PropTypes.string,
            merge: PropTypes.bool,
            formatter: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
            editor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]), // react class
            props: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
        })).isRequired,
        header: PropTypes.node,
        footer: PropTypes.node,
        actions: PropTypes.objectOf(
            PropTypes.shape({
                className: PropTypes.string,
                text: PropTypes.node,
                disabled: PropTypes.bool,
                clearForm: PropTypes.bool,
                triggerOnComplete: PropTypes.bool,
                handler: PropTypes.func
            }).isRequired
        ),
        columns: PropTypes.number,
        className: PropTypes.string,
        formClassName: PropTypes.string,
        fieldClassName: PropTypes.string,
        controlClassName: PropTypes.string,
        value: PropTypes.object, // might not be just a simple object
        onChange: PropTypes.func
    };

    static defaultProps = {
        formClassName: '',
        columns: 1,
        value: {},
        actions: {}
    };

    handleChange = (key, merge, iValue, info={}) => {
        const {onChange, value, actions} = this.props
        const eventInfo = {
            field: {
                name: key,
                value: iValue,
                ...info
            },
            isComplete: _.get(info, 'isComplete', false)
        }

        let newValue
        if (merge && _.isObject(iValue)) {
            newValue = _.mergeWith({}, value, iValue, (objValue, srcValue)=>{
                if (_.isArray(objValue)) {
                    return srcValue
                }
                return undefined
            })
        }
        else {
            newValue = im.set(value, key, iValue)
        }

        const completeAction = _.find(actions, {triggerOnComplete:true})
        if (eventInfo.isComplete && completeAction) {
            onChange(newValue, eventInfo)
            setTimeout(()=>{
                completeAction.handler(newValue)
            }, 0)
        }
        else {
            onChange(newValue, eventInfo)
        }
    };

    isAligned = () => {
        const {formClassName} = this.props
        return _.indexOf(_.split(formClassName, ' '), 'aligned') >= 0
    };

    renderField = (id, fieldCfg, dataSet, fieldDefaultClassName, createContainer=true) => {
        if (!fieldCfg) {
            log.error(`renderField:: config for field '${id}' missing`)
            return null
        }

        let {
            label=(fieldCfg.merge?'':id),
            merge=false,
            className: fieldClassName=fieldDefaultClassName,
            formatter,
            editor,
            props={}
        } = fieldCfg

        const value = merge ? dataSet : _.get(dataSet, id, undefined) // to support traverse of nested field properties, eg a.b.c
        let fieldContent = value

        if (formatter) {
            if (_.isFunction(formatter)) {
                fieldContent = formatter(value, dataSet)
            }
            else {
                fieldContent = formatter
            }
        }
        else if (editor) {
            if (_.isFunction(props)) {
                props = props(dataSet)
            }
            // TODO: check editor must be ReactClass
            let propValueName = 'value'
            if (_.isString(editor)) {
                if (editor === 'Checkbox') {
                    propValueName = 'checked'
                }
                if (editor === 'ToggleButton') {
                    propValueName = 'on'
                }
            }
            props = {...props, id, [propValueName]:value, onChange:this.handleChange.bind(this, id, merge)}

            fieldContent = React.createElement(
                _.isString(editor) && _.has(FormElements, editor) ? FormElements[editor] : editor,
                props
            )
        }

        const required = _.get(fieldCfg, 'props.required', false)
        if (createContainer) {
            return <div key={id} className={cx(id, fieldClassName)}>
                <label className={cx({required})} htmlFor={id}>{label}</label>
                {fieldContent}
            </div>
        }
        else {
            return createFragment({
                label: <label className={cx({required})} htmlFor={id}>{label}</label>,
                content: fieldContent
            })
        }
    };

    renderRow = (fields, dataSet, fieldClassName, rowKey) => {
        const renderedFields = _.map(fields, (fieldCfg, fieldKey) => this.renderField(fieldKey, fieldCfg, dataSet, fieldClassName, !rowKey))
        if (rowKey) {
            return <div key={rowKey} className={cx('row', `row-${rowKey}`, fieldClassName, _.keys(fields))}>
                {renderedFields}
            </div>
        }
        else {
            return renderedFields
        }
    };

    renderForm = (extraFormClassName) => {
        const {formClassName, fieldClassName, fields, columns, value} = this.props
        const aligned = this.isAligned()

        return <div className={cx(formClassName, extraFormClassName, 'c-form')}>
            {
            aligned ?
                _.map(
                    _.groupBy(
                        _.map(_.keys(fields), (k, i)=>({key:k, idx:Math.floor(i/columns), ...fields[k]})),
                        'idx'
                    ),
                    (row, idx)=>this.renderRow(_.keyBy(row, 'key'), value, fieldClassName, idx)
                ) :
                this.renderRow(fields, value, fieldClassName)
        }
        </div>
    };

    render() {
        const {
            id, value, header, footer,
            className, controlClassName, actions, onChange
        } = this.props
        const actionNodes = _.map(actions, (action, actionKey) => {
            return <button
                className={cx(controlClassName, action.className)}
                disabled={action.disabled}
                ref={ref=>{ this[actionKey+'Btn']=ref }}
                key={actionKey}
                name={actionKey}
                onClick={()=>{
                    if (action.clearForm) {
                        onChange({})
                    }
                    if (action.handler) {
                        action.handler(value)
                    }
                }}>
                {action.text || actionKey}
            </button>
        })

        const hasActions = !_.isEmpty(actionNodes)

        if (!hasActions && !footer && !header) {
            return this.renderForm(className)
        }

        return <div id={id} className={cx('c-box c-form-container', className)}>
            {
                header && <header>{header}</header>
            }
            <div className={cx('content nopad')}>
                {this.renderForm()}
            </div>
            {
                (hasActions || footer) && <footer>
                    {footer && <div className={cx('c-info')} dangerouslySetInnerHTML={{__html:footer}} />}
                    {actionNodes}
                </footer>
            }
        </div>
    }
}


export default wire(Form, 'value', {})
