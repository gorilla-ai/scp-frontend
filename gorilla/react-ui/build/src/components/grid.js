'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A React Grid
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {array.<object>} cols - Columns config
 * @param {string | number} cols.id - Column id
 * @param {renderable} [cols.label] - Column header label
 * @param {array.<object>} rows - Rows config
 * @param {string | number} rows.id - Row id
 * @param {renderable} [rows.label] - Row header label
 * @param {object} [items] - Current items
 * @param {object} items.key - data for this **key** item
 * @param {renderable} [items.key.content] - content to show in grid item
 * @param {*} [items.key.*] - other data of this cell
 * @param {boolean} [selectable=false] - Can grid items be selected?
// * @param {array.<string>} [defaultSelected] - Default Selected item ids
// * @param {array.<string>} [selected] - selected item ids
// * @param {object} [selectedLink] - Link to update selections. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
// * @param {*} selectedLink.value - value to update
// * @param {function} selectedLink.requestChange - function to request value change
 * @param {function} [onSelect] - Callback function when grid item are selected
 * @param {array} onSelect.ids - current selected item ids
// * @param {object} onSelect.eventInfo - event related info
// * @param {array} onSelect.eventInfo.before - previous selected item ids
 * @param {string} [selectingClassName] - Classname for the selecting grid items
 * @param {function} [itemClassName] - Classname (mapping or function) for the grid items
 *
 * @example
import {Grid} from 'react-ui'
import _ from 'lodash'

React.createClass({
    getInitialState() {
        return {
            currentStatus: 'A',
            items: {
                '0-0': {xx:0, status:'A',conent:'xx'},
                '1-0.5': {xx:1, status:'B'},
                '2-1': {xy:2, status:'C',content:<div/>},
                '3-1.5': {status:'D'},
                '4-2': {status:'E'},
                '5-2.5': {status:'F'},
                '6-3': {status:'A'}
            }
        }
    },
    handleSelect(selectedItems) {
        let {items, currentStatus} = this.state
        let newItems = _.reduce(selectedItems, (acc,id)=>{
            acc[id] = {...items[id]||{}, status: currentStatus}
            return acc
        }, {})
        this.setState({items:newItems})
    },
    render() {
        let {currentStatus, items} = this.state
        return <Grid id='schedule'
            className='customize-schedule'
            rows={[
                {id:0, label:'Sunday'},
                {id:1, label:'Monday'},
                {id:2, label:'Tuesday'},
                {id:3, label:'Wednesday'},
                {id:4, label:'Thursday'},
                {id:5, label:'Friday'},
                {id:6, label:'Saturday'}
            ]}
            cols={
                _.map(
                    _.range(0,48),
                    slot=>({id:slot/2, label:(slot%2===0?slot/2:'')})
                )
            }
            items={items}
            selectable={true}
            onSelect={this.handleSelect}
            selectingClassName=`selecting-${currentStatus}`
            itemClassName={({status})=>'cls-'+status} />
    }
})
 */
var Grid = function (_React$Component) {
    _inherits(Grid, _React$Component);

    function Grid() {
        _classCallCheck(this, Grid);

        return _possibleConstructorReturn(this, (Grid.__proto__ || Object.getPrototypeOf(Grid)).apply(this, arguments));
    }

    _createClass(Grid, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                'To Be Implemented'
            );
        }
    }]);

    return Grid;
}(_react2.default.Component);

exports.default = Grid;