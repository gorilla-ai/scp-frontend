'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _objectPathImmutable = require('object-path-immutable');

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _dropdown = require('react-ui/build/src/components/dropdown');

var _dropdown2 = _interopRequireDefault(_dropdown);

var _input = require('react-ui/build/src/components/input');

var _input2 = _interopRequireDefault(_input);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SIMPLE_VALUE_PROP = _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]);

var log = require('loglevel').getLogger('core/components/input');

function getAddressList() {
    return ah.one({
        url: PORTAL_API + '/address',
        type: 'GET',
        contentType: 'application/json'
    }).then(function (data) {
        // console.log(data)
        return data;
    });
}

var Address = function (_React$Component) {
    _inherits(Address, _React$Component);

    function Address(props, context) {
        _classCallCheck(this, Address);

        var _this = _possibleConstructorReturn(this, (Address.__proto__ || Object.getPrototypeOf(Address)).call(this, props, context));

        _this.loadAddressData = function () {
            getAddressList().then(function (response) {
                var addressList = void 0;
                var cityList = {};
                addressList = _lodash2.default.map(response, function (zones, key) {
                    cityList[key] = _lodash2.default.map(zones, function (zone) {
                        return { value: zone, text: zone };
                    });
                    return { value: key, text: key };
                });
                _this.setState({ addressList: addressList, cityList: cityList });
            });
        };

        _this.onChange = function (key, value) {
            var onChange = _this.props.onChange;
            var data = _this.props.data;

            onChange(_objectPathImmutable2.default.set(data, key, value));
        };

        _this.loadAddressData();
        _this.state = {};
        return _this;
    }

    _createClass(Address, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state,
                addressList = _state.addressList,
                cityList = _state.cityList;
            var _props$props = this.props.props,
                cityIndex = _props$props.cityIndex,
                zoneIndex = _props$props.zoneIndex,
                addrIndex = _props$props.addrIndex;
            var data = this.props.data;

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'label',
                    { className: 'required' },
                    '\u6236\u7C4D\u5730'
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(_dropdown2.default, { list: addressList,
                        onChange: function onChange(value) {
                            _this2.onChange(cityIndex, value);
                        },
                        value: data[cityIndex]
                    }),
                    _react2.default.createElement(_dropdown2.default, { defaultText: '\u8ACB\u5148\u9078\u64C7\u7E23\u5E02',
                        list: cityList[data[cityIndex]],
                        onChange: function onChange(value) {
                            _this2.onChange(zoneIndex, value);
                        },
                        value: data[zoneIndex],
                        disabled: data[cityIndex] ? false : true
                    }),
                    _react2.default.createElement(_input2.default, {
                        className: 'grow',
                        type: 'text',
                        onChange: function onChange(value) {
                            _this2.onChange(addrIndex, value);
                        },
                        value: data[addrIndex]
                    })
                )
            );
        }
    }]);

    return Address;
}(_react2.default.Component);

Address.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    value: SIMPLE_VALUE_PROP,
    placeholder: SIMPLE_VALUE_PROP,
    onChange: _propTypes2.default.func
};
exports.default = Address;