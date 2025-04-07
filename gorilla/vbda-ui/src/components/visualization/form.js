import PropTypes from 'prop-types';
import React from 'react'
import cx from 'classnames'
import _ from 'lodash'
import SearchForm from 'react-ui/build/src/components/form'
import Input from 'react-ui/build/src/components/input'
import Textarea from 'vbda/components/visualization/textarea'
import DropDownList from 'react-ui/build/src/components/dropdown'
import CheckBox from 'react-ui/build/src/components/checkbox'
import CheckboxGroup from 'react-ui/build/src/components/checkbox-group'
import DatePicker from 'react-ui/build/src/components/date-picker'
import DateRange from 'react-ui/build/src/components/date-range'
import RadioGroup from 'react-ui/build/src/components/radio-group'
import localize from '../../hoc/locale-provider'

const gt = global.vbdaI18n.getFixedT(null, 'vbda')
const lt = global.vbdaI18n.getFixedT(null, 'search')
let log = require('loglevel').getLogger('vbda/components/visualization/search')

/**
 * Search Form
 * @constructor
 * @param {string} [id] - Form dom element #id
 * @param {string} [className] - Classname for the form
 * @param {string} lng -
 * @param {object} cfg - config
 * @param {string} cfg.name - title of this search
 * @param {object} cfg.fields - fields to display in form
 * @param {object} cfg.fields._key - field key
 * @param {title} cfg.fields._key.title - field label
 * @param {'string'|'textarea'|'dropdown'|'checkbox'|'checkbox-group'|'date'|'date-range'|'radio-group'|'gis'} cfg.fields._key.type - field type
 * @param {object} cfg.fields._key.list - key-text pair of options, required for type=dropdown|checkbox-group|radio-group
 * @param {object} cfg.locales - translations
 * @param {function} [onSearch] - Function to call when search button is clicked
 * @param {object} onSearch.params - form data
 *
 * @example

import _ from 'lodash'
import Form from 'vbda/components/visualization/form'

React.createClass({
    search(toSearch) {
        // toSearch == {Identity:'a', CellPhone:'0911'}
    },
    render() {
        return <Form
            id='fulltext'
            lng='en_us'
            cfg={{
                name:'fulltext',
                fields:{
                    Identity:{title:'name', type:'string'},
                    CellPhone:{title:'phone', type:'string'},
                    TestList:{title:'Test List',type:'dropdown', list:{'1':'a','2':'b'}}
                },
                locales:{
                    en_us:{
                        fields:{
                            Identity:{title:'name'},
                            CellPhone:{title:'phone'}
                        }
                    }
                }
            }}
            onSearch={this.search} />
    }
})
 */
class Form extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        lng: PropTypes.string,
        cfg: PropTypes.shape({
            display_name: PropTypes.string,
            fields: PropTypes.objectOf(PropTypes.shape({
                title: PropTypes.string,
                type: PropTypes.oneOf([
                    'string', 'textarea', 'dropdown', 'checkbox', 'checkbox-group',
                    'date', 'date-range', 'radio-group', 'gis'
                ]),
                list: PropTypes.objectOf(PropTypes.string)
            })).isRequired,
            locales: PropTypes.objectOf(PropTypes.shape({
                fields: PropTypes.shape({
                    title: PropTypes.string,
                    list: PropTypes.objectOf(PropTypes.string)
                })
            }))
        }).isRequired,
        onSearch: PropTypes.func.isRequired
    };

    static defaultProps = {
    };

    state = {

    };

    handleSearch = () => {
        const {onSearch} = this.props
        onSearch(this.state)
    };

    handleFormChange = (inputValue) => {
        this.setState(inputValue)
    };

    fieldsParser = (fields) => {
        let newFields = {}
        // let temp = {//portal service api需要的時間範圍
        //     time: {
        //         title: 'date between',
        //         type: 'date'
        //     }}
        // fields = Object.assign(temp, fields)
        _.map(fields, (field, key) => {
            newFields[key] = {
                label: field.title
            }
            switch (field.type) {
                case 'string':
                    newFields[key].editor = Input
                    break
                case 'textarea':
                    newFields[key].editor = Textarea
                    break
                case 'dropdown':
                    newFields[key].editor = DropDownList
                    newFields[key].props = {}
                    newFields[key].props.list = []
                    _.map(field.list, (item, itemKey) => {
                        newFields[key].props.list.push({value:itemKey, text:item})
                    })
                    break
                case 'checkbox':
                    newFields[key].editor = CheckboxGroup
                    newFields[key].props = {}
                    newFields[key].props.list = []
                    newFields[key].props.list.push({value:'value', text:'text'})
                    break
                case 'checkbox-group':
                    newFields[key].editor = CheckboxGroup
                    newFields[key].props = {}
                    newFields[key].props.list = []
                    newFields[key].props.list.push({value:'value1', text:'text1'})
                    newFields[key].props.list.push({value:'value2', text:'text2'})
                    newFields[key].props.list.push({value:'value3', text:'text3'})
                    // _.map(field.list, (item, itemKey) => {
                    //     newFields[key].props.list.push({value: itemKey, text: item})
                    // })
                    break
                case 'date':
                    newFields[key].editor = DatePicker
                    newFields[key].props = {}
                    newFields[key].props.defaultValue = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
                    break
                case 'date-range':
                    var newDate = new Date()
                    newFields[key].editor = DateRange
                    newFields[key].props = {}
                    if (field.format === 'yyyy-MM-dd') {
                        newFields[key].props.defaultValue = {
                            from: newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate(),
                            to: newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate()
                        }
                    }
                    else {
                        newFields[key].props.enableTime = true
                        newFields[key].props.defaultValue = {
                            from: newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate() + ' ' + newDate.getHours() + ':' + newDate.getMinutes(),
                            to: newDate.getFullYear() + '-' + (newDate.getMonth() + 1) + '-' + newDate.getDate() + ' ' + newDate.getHours() + ':' + newDate.getMinutes()
                        }
                    }
                    break
                case 'radio-group':
                    newFields[key].editor = RadioGroup
                    newFields[key].props = {}
                    newFields[key].props.list = []
                    newFields[key].props.list.push({value:'value1', text:'text1'})
                    newFields[key].props.list.push({value:'value2', text:'text2'})
                    newFields[key].props.list.push({value:'value3', text:'text3'})
                    // _.map(field.list, (item, itemKey) => {
                    //     newFields[key].props.list.push({value: itemKey, text: item})
                    // })
                    break
                case 'gis':
                    newFields[key].editor = Input
                    break
                default:
                    newFields[key].editor = <div className='c-error'>not support type</div>
                    break
            }
        })
        // console.log(newFields)
        return newFields
    };

    render() {
        const {id, className, cfg:{fields}} = this.props
        return <div id={id} className={cx('c-box noborder search c-vbda-vis-form', className)}>
            <div className='content'>
                <SearchForm
                    id={id}
                    formClassName='c-form'
                    fields={this.fieldsParser(fields)}
                    onChange={this.handleFormChange}
                    value={this.state} />
            </div>
            <footer>
                <button onClick={this.handleSearch}>{lt('btn-advanceSearch')}</button>
            </footer>
            {/*fieldsData:*/}
            {/*<br />*/}
            {/*{JSON.stringify(fields, null, 4)}*/}
        </div>
    }
}

export default localize(Form, 'cfg')