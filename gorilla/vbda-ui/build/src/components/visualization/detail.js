'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('vbda/components/vis/detail');

/**
 * Detail View
 * @constructor
 * @param {string} [id] - View dom element #id
 * @param {string} [className] - Classname for the view
 * @param {string} lng -
 * @param {object} event - single ES event record
 * @param {object} cfg - config
 * @param {object} cfg.fields - fields
 * @param {object} cfg.fields._key - column key
 * @param {object} cfg.fields._key.title - column title
 * @param {object} cfg.fields._key.type - column type
 * @param {object} [cfg.locales] - translation
 * @param {object} [style] - style for the view
 *
 * @example

import Detail from 'vbda/components/visualization/detail'

 */
var Detail = (0, _createReactClass2.default)({
    displayName: 'Detail',

    propTypes: {
        id: _propTypes2.default.string,
        className: _propTypes2.default.string,
        lng: _propTypes2.default.string,
        event: _propTypes2.default.object,
        cfg: _propTypes2.default.shape({
            name: _propTypes2.default.string,
            style: _propTypes2.default.object,
            fields: _propTypes2.default.objectOf(_propTypes2.default.shape({
                title: _propTypes2.default.string /*,
                                                  type: React.PropTypes.oneOf(['string','gis'])*/ // defined in initialization.json
            })) /*,
                locales: React.PropTypes.objectOf(React.PropTypes.shape({
                 fields: React.PropTypes.object
                }))*/
        })
    },

    localesSwitch: function localesSwitch(key) {
        var lng = this.props.lng;

        if (lng) {
            var locales = this.props.cfg.locales;

            if (_lodash2.default.get(locales, lng, null) !== null) {
                return locales[lng][key];
            }
        }
        return this.props.cfg[key];
    },
    fieldsParser: function fieldsParser(fields) {
        var newFields = {};
        _lodash2.default.map(fields, function (field, key) {
            if (field.hidden === undefined || field.hidden !== true) {
                //if no hidden
                newFields[key] = {
                    label: field.title,
                    sortable: true
                };
            }
        });
        return newFields;
    },
    dataMap: function dataMap(event, datamappings) {
        var newData = Object.assign({}, event);
        _lodash2.default.map(datamappings, function (datamapping, datamappingkey) {
            _lodash2.default.map(newData, function (data) {
                var originValue = _lodash2.default.get(data, datamappingkey, null);
                if (originValue !== null) {
                    var mappingValue = _lodash2.default.get(datamapping, originValue, null);
                    if (mappingValue !== null) {
                        _lodash2.default.set(data, datamappingkey, mappingValue);
                    }
                }
            });
        });
        return newData;
    },
    renderStyleParser: function renderStyleParser(styles) {
        var newStyle = {};
        _lodash2.default.map(styles, function (style, key) {
            //TODO 未來有新格式了
            switch (key) {}
        }
        // case 'font':
        //     newStyle['fontFamily'] = style.name
        //     newStyle['fontSize'] = style.size + 'px'
        //     break
        // case 'back_color':
        //     newStyle['background'] = style
        //     break
        );
        return newStyle;
    },
    sx: function sx() {
        var newStyle = _extends({}, arguments);
        for (var i = 0; i < arguments.length; i++) {
            _lodash2.default.map(arguments[i], function (style, key) {
                newStyle[key] = style;
            });
        }
        return newStyle;
    },
    render: function render() {
        // const {id, className, cfg:{style={}}, event} = this.props
        // return <div id={id} className={cx('detail', className)} style={style}>
        //     {JSON.stringify(event, null, 4)}
        // </div>

        var _props = this.props,
            id = _props.id,
            className = _props.className,
            _props$cfg$style = _props.cfg.style,
            style = _props$cfg$style === undefined ? {} : _props$cfg$style,
            event = _props.event;

        var originFields = this.localesSwitch('fields');
        var datamapping = this.localesSwitch('data_mappings');

        var fields = this.fieldsParser(originFields);
        var mappedData = this.dataMap(event, datamapping);
        this.sx(this.renderStyleParser(style), this.renderStyleParser(style));
        return _react2.default.createElement(
            'div',
            { id: id, className: (0, _classnames2.default)('detail', className) },
            _react2.default.createElement(
                'div',
                { className: 'c-box', style: { width: '100%' } },
                _react2.default.createElement(
                    'div',
                    { className: 'content', style: this.renderStyleParser(style) },
                    _react2.default.createElement(
                        'div',
                        { className: 'pure-g' },
                        _lodash2.default.map(fields, function (_ref, key) {
                            var label = _ref.label;

                            return _react2.default.createElement(
                                'div',
                                { className: 'pure-u-1-2', key: key },
                                _react2.default.createElement(
                                    'div',
                                    null,
                                    _react2.default.createElement(RenderRow, {
                                        id: key,
                                        label: label,
                                        value: _lodash2.default.get(mappedData, key, 'no data') })
                                )
                            );
                        })
                    )
                )
            ),
            'EventData:',
            _react2.default.createElement(
                'div',
                null,
                JSON.stringify(mappedData, null, '\t')
            )
        );
    }
});

exports.default = Detail;

var RenderRow = function (_React$Component) {
    _inherits(RenderRow, _React$Component);

    function RenderRow() {
        _classCallCheck(this, RenderRow);

        return _possibleConstructorReturn(this, (RenderRow.__proto__ || Object.getPrototypeOf(RenderRow)).apply(this, arguments));
    }

    _createClass(RenderRow, [{
        key: 'render',
        value: function render() {
            var _props2 = this.props,
                id = _props2.id,
                label = _props2.label,
                value = _props2.value,
                height = _props2.height;
            // console.log(this.props)

            return _react2.default.createElement(
                'div',
                { id: id, style: { padding: '5px 0px', height: height * 60 + 'px' } },
                label,
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                    'a',
                    null,
                    value
                )
            );
        }
    }]);

    return RenderRow;
}(_react2.default.Component);