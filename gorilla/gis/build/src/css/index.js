"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _stylis = _interopRequireDefault(require("stylis"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var styleID = 'gis-basic-css';
var csstext = (0, _stylis["default"])('', "\n  .gis-point {\n    fill: #FF7800;\n    color: #000;\n    weight: 1;\n    opacity: 1;\n  }\n\n  .gis-vertex {\n    background-color: rgba(255, 255, 255, 0.7);\n    border: 10px solid #3388FF;\n    border-radius: 50%;\n  }\n\n  .gis-measure-hint {\n    background: rgba(0, 0, 0, 0.7);\n    color: #FFFFFF;\n    left: 0;\n    margin: 0 auto;\n    position: absolute;\n    right: 0;\n    text-align: center;\n    width: 20%;\n    z-index: 800;\n  }\n\n  .leaflet-marker-icon.gis-divIcon {\n    align-items: center;\n    display: flex;\n    flex-direction: column;\n\n    > img {\n      flex-grow: 1;\n      max-height: 100% !important;\n      max-width: 100% !important;\n      position: initial;\n    }\n\n    > div.gis-spot {\n      background-color: #008FCF;\n      border-radius: 50%;\n      display: block;\n      margin-bottom: 5px;\n      position: initial;\n\n      &:after {\n        content: ' ';\n        display: block;\n        height: 100%;\n        width: 100%;\n      }\n\n      &.center-text{\n        display: grid;\n        align-content: center;\n        justify-content: center;\n        span{\n          font-weight: bold;\n        }\n      }\n    }\n\n    > span.gis-label {\n        flex-grow: 0;\n        position: initial;\n        text-align: center;\n        width: 60px !important;\n        word-break: break-word;\n    }\n  }\n\n  /* Maker pane's z-index = 600 */\n  .leaflet-pane.leaflet-track-pane {\n    z-index: 601;\n  }\n\n  .js-top-layer {\n    z-index: 2147483647 !important;\n  }\n");

function _default() {
  if (!document.getElementById(styleID)) {
    var style = document.createElement('style');
    (document.head || document.getElementsByTagName('head')[0]).appendChild(style);
    style.id = 'gis-styles';
    style.type = 'text/css';
    if (style.styleSheet) style.styleSheet.cssText = csstext;else style.appendChild(document.createTextNode(csstext));
  }
}
//# sourceMappingURL=index.js.map