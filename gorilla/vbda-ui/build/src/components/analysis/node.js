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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('loglevel').getLogger('vbda/components/analysis/node');

var Node = function (_React$Component) {
    _inherits(Node, _React$Component);

    function Node() {
        _classCallCheck(this, Node);

        return _possibleConstructorReturn(this, (Node.__proto__ || Object.getPrototypeOf(Node)).apply(this, arguments));
    }

    _createClass(Node, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                className = _props.className,
                contentClassName = _props.contentClassName,
                defaultImage = _props.defaultImage,
                labelData = _props.labelData,
                _props$nodeData = _props.nodeData,
                nodeProps = _props$nodeData.propsReadable,
                images = _props$nodeData.images;

            var allProps = [nodeProps].concat(_toConsumableArray(_lodash2.default.map(labelData, 'propsReadable')));
            var props = _lodash2.default.reduce(_lodash2.default.merge.apply(_lodash2.default, [{}].concat(_toConsumableArray(allProps))), function (acc, v, k) {
                if (v == null) {
                    return acc;
                }
                return [].concat(_toConsumableArray(acc), [{ name: k, val: v }]);
            }, []);
            //const images = ['https://static.wixstatic.com/media/812313_d85a13812e6b4a7fb6c1194cf4113312.png/v1/fill/w_126,h_126,al_c,usm_0.66_1.00_0.01/812313_d85a13812e6b4a7fb6c1194cf4113312.png']
            var hasImages = !_lodash2.default.isEmpty(images);
            var profileImages = !hasImages && defaultImage ? [defaultImage] : images;

            return _react2.default.createElement(
                'div',
                { className: (0, _classnames2.default)(className, 'c-vbda-node') },
                _lodash2.default.map(profileImages, function (img) {
                    return _react2.default.createElement('img', { className: (0, _classnames2.default)({ default: !hasImages }), key: img, src: img });
                }),
                _react2.default.createElement(
                    'div',
                    { className: (0, _classnames2.default)('c-result', contentClassName) },
                    _lodash2.default.map(props, function (_ref, idx) {
                        var name = _ref.name,
                            val = _ref.val;
                        return _react2.default.createElement(
                            'div',
                            { key: idx },
                            _react2.default.createElement(
                                'label',
                                null,
                                name
                            ),
                            _react2.default.createElement(
                                'div',
                                null,
                                val + ''
                            )
                        );
                    })
                )
            );
        }
    }]);

    return Node;
}(_react2.default.Component);

Node.propTypes = {
    className: _propTypes2.default.string,
    contentClassName: _propTypes2.default.string,
    defaultImage: _propTypes2.default.string,
    labelData: _propTypes2.default.objectOf(_propTypes2.default.shape({
        props: _propTypes2.default.object
    })),
    nodeData: _propTypes2.default.shape({
        props: _propTypes2.default.object,
        images: _propTypes2.default.arrayOf(_propTypes2.default.string)
    })
};
Node.defaultProps = {
    labelData: {},
    nodeData: {}
};
exports.default = Node;