'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _detail = require('../visualization/detail');

var _detail2 = _interopRequireDefault(_detail);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('vbda/components/event/event');

var Event = function (_React$Component) {
    _inherits(Event, _React$Component);

    function Event() {
        _classCallCheck(this, Event);

        return _possibleConstructorReturn(this, (Event.__proto__ || Object.getPrototypeOf(Event)).apply(this, arguments));
    }

    _createClass(Event, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                _props$cfg = _props.cfg,
                dt = _props$cfg.dt,
                renders = _props$cfg.renders,
                event = _props.event,
                lng = _props.lng,
                details = _props.details;

            if (event === null) {
                return _react2.default.createElement('div', null);
            }
            //const [dsId, dtId] = event._index.split('_')
            var dtId = event.__data_type;
            var eventDt = dt[dtId];

            if (!eventDt) {
                return _react2.default.createElement(
                    'div',
                    { className: 'c-error' },
                    'No data type found for ',
                    dtId
                );
            }

            var infoVisId = details ? eventDt.renderDetails : eventDt.renderSummary;
            var infoVisCfg = renders[infoVisId];
            var Vis = void 0;

            if (!infoVisCfg) {
                if (infoVisId) {
                    // render info specified but not defined in renders
                    return _react2.default.createElement(
                        'div',
                        { className: 'c-error' },
                        infoVisId,
                        ' does not exist in renders cfg'
                    );
                } else {
                    // render info not specified
                    // Show all fields
                    return _react2.default.createElement(
                        'div',
                        { className: 'c-form' },
                        _lodash2.default.map(event, function (v, k) {
                            return _react2.default.createElement(
                                'div',
                                { key: k },
                                _react2.default.createElement(
                                    'label',
                                    null,
                                    k
                                ),
                                _react2.default.createElement(
                                    'span',
                                    null,
                                    JSON.stringify(v)
                                )
                            );
                        })
                    );
                }
            }

            Vis = infoVisCfg.vis || _detail2.default;

            return _react2.default.createElement(Vis, {
                id: infoVisId,
                lng: lng,
                event: event,
                cfg: infoVisCfg });
        }
    }]);

    return Event;
}(_react2.default.Component);

Event.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    details: _propTypes2.default.bool,
    lng: _propTypes2.default.string,
    event: _propTypes2.default.object,
    cfg: _propTypes2.default.shape({
        ds: _propTypes2.default.objectOf(_propTypes2.default.shape({
            display_name: _propTypes2.default.string,
            dt: _propTypes2.default.arrayOf(_propTypes2.default.string)
        })),
        dt: _propTypes2.default.objectOf(_propTypes2.default.shape({
            display_name: _propTypes2.default.string,
            renderSummary: _propTypes2.default.string,
            renderDetails: _propTypes2.default.string
        })),
        // only support info render
        renders: _propTypes2.default.objectOf(_propTypes2.default.shape({
            type: _propTypes2.default.string, //React.PropTypes.oneOf(['detail','custom']),
            vis: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func])
        }))
    })
};
Event.defaultProps = {
    details: false
};
exports.default = Event;