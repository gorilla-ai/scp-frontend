"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._on = _on;
exports._off = _off;
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _leaflet = _interopRequireDefault(require("leaflet"));

var _dictionary = require("../consts/dictionary");

var _gisException = require("../utils/gis-exception");

var _setupHelper = require("../utils/setup-helper");

var _symbolHelper = _interopRequireDefault(require("../utils/symbol-helper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var log = require('loglevel').getLogger('gis/core/event');
/**
 * Binds a new event to eventCore.
 * eventCore is considered as an event management in GIS, which is a Leaflet FeatureGroup.
 * All events, in fact, are bound to the feature group, and are executed in it.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#events
 *
 * @param   {String}                                  event      Event type. E.g., click, dblclick, contextmenu, etc. See the GIS document for detail.
 * @param   {String | String[] | Object | function}   [filter]   Symbols filter. Matched symbols will apply the event. Apply to all symbols and map when undefined.
 * @param   {Function}                                handler    Event callback handler.
 *
 */


function _on(event, filter, handler) {
  var _this = this;

  // Order the arguments
  var args = {
    event: event,
    filter: arguments.length === 3 ? filter : null,
    handler: handler || (_lodash["default"].isFunction(filter) ? filter : null)
  }; // These 3 types of events only happens on the map

  var isZoom = _lodash["default"].includes(['zoomstart', 'zoom', 'zoomend'], event);

  var isMeasure = _lodash["default"].includes(['measurestart', 'measure', 'measureend'], event);

  var isDrawn = _lodash["default"].includes(['create', 'edit', 'editcontent', 'delete'], event);

  var isInvalidArgs = !_lodash["default"].isNil(args.filter) && !_lodash["default"].isPlainObject(args.filter) || !_lodash["default"].isFunction(args.handler); // Check event type and arguments are valid or not

  if (!_lodash["default"].includes(_dictionary.EVENT, event)) {
    log.warn(_gisException.GIS_ERROR.INVALID_TYPE, event, "Please input valid events: ".concat(_dictionary.EVENT));
    return;
  } else if ((isZoom || isMeasure || isDrawn) && args.filter) {
    log.warn(_gisException.GIS_ERROR.INVALID_ARGS, [event, filter, handler], 'Zoom, measure, and draw related event is global, which means no filter is required.');
    return;
  } else if (isInvalidArgs) {
    log.warn(_gisException.GIS_ERROR.INVALID_ARGS, [event, filter, handler], 'The arguments should be (String event, Object filter?, Function handler)');
    return;
  }

  var map = this._map; // Consider eventHandler as an handler entry.
  // Save it in a global Object variable for unbinding

  var eventHandler = null;

  if (isZoom) {
    eventHandler = function eventHandler(e) {
      var zoom = map.getZoom(); // Current zoom level

      var bounds = map.getBounds(); // Current bounds

      args.handler(e, {
        zoom: zoom,
        bounds: {
          southWest: {
            y: bounds._southWest.lat,
            x: bounds._southWest.lng
          },
          northEast: {
            y: bounds._northEast.lat,
            x: bounds._northEast.lng
          }
        }
      });
    };
  } else if (isMeasure) {
    eventHandler = function eventHandler(e) {
      if (_this._dragMode === _dictionary.DRAG_MODE.MEASURE) {
        args.handler(e.event, e.pathInfo, e.layers);
      }
    };
  } else if (isDrawn) {
    eventHandler = function eventHandler(e) {
      if (_this._dragMode === _dictionary.DRAG_MODE.DRAW) {
        // Here, e.symbol is a plain object, not Symbol instance
        args.handler(e.event, e.symbol);
      }
    };
  } else {
    eventHandler = function eventHandler(e) {
      _leaflet["default"].DomEvent.stop(e); // Prevent unexpected behavior in measure & draw mode.


      var shouldStop = _this._dragMode === _dictionary.DRAG_MODE.MEASURE || _this._dragMode === _dictionary.DRAG_MODE.DRAW;

      if (shouldStop) {
        return;
      }

      var isMultiple = e.isMultiple === true; // triggered by region selection or setSelection()

      var targetId = _lodash["default"].get(e, 'layer._gis_id');

      var symbol = targetId ? _this._symbols[targetId] || _this._clusterSymbols[targetId] || _this._flags[targetId] : undefined;

      var type = _lodash["default"].get(symbol, 'type', undefined); // Get symbols which match the filter


      var matchedIds = args.filter ? _symbolHelper["default"].getSymbol.call({
        _symbols: _objectSpread(_objectSpread({}, _this._symbols), _this._flags)
      }, args.filter, true, 'id') : _lodash["default"].concat(_lodash["default"].keys(_this._symbols), _lodash["default"].keys(_this._flags)); // Enhancement for fixing the issue in off()
      // For excluding the symbols matched in off() filter

      var excludeIds = _lodash["default"].get(args, 'excludeIds', []); // Symbols to be triggered in the event


      var eventIds = type === _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER ? symbol.props.data.ids : type ? [symbol.id] : []; // Pick up the symbolId which matches the filter then excluding the ones should be removed due to off()

      var triggerIds = _lodash["default"].difference(_lodash["default"].intersection(matchedIds, eventIds), excludeIds);

      var hasMatch = triggerIds.length > 0; // Event on cluster parent

      if (type === _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER && hasMatch) {
        if (e.type === 'selectionChange') {
          args.handler(e, triggerIds);
        } else {
          args.handler(e, triggerIds, {
            cluster: _lodash["default"].get(symbol, 'props.data.cluster')
          });
        }

        map.fire('clusterselectionChange');
      } // Event on symbol
      else if (type && type !== _dictionary.EXTRA_SYMBOL_TYPE.CLUSTER && hasMatch) {
          args.handler(e, triggerIds[0]);
        } // Event on map
        else if (!type && !isMultiple) {
            args.handler(e, null);
          } // Event by region selection or by setSelection()
          else if (isMultiple) {
              args.handler(e, _this.selected.length === 0 ? null : _this.selected);
            }
    };
  }
  /*
      Handler is for matching the one from external, wrapped as eventHandler.
      eventHandler is the one we should utilize to remove in off() method
  */


  args.eventHandler = eventHandler;

  this._eventMap.push(args);

  if (!isZoom && !isMeasure && !isDrawn) {
    this._eventCore.on(event, eventHandler);
  }

  if (!args.filter) {
    map.on(event, eventHandler);
  }
}
/**
 * Unbinds a event.
 * Here, it updates the filter saved in _on function,
 * and adds a excluedIds for skipping symbols shouldn't trigger event.
 *
 * @link    https://git.gorilla-technology.com/gorilla/gis/blob/master/docs/gis.md#events
 *
 * @param   {String}                                  event      Event type. E.g., click, dblclick, contextmenu, etc. See the GIS document for detail.
 * @param   {String | String[] | Object | function}   [filter]   Symbols filter. Matched symbols will not apply the target event. Apply to all symbols and map when undefined.
 * @param   {Function}                                [handler]  Event callback handler to be removed. Remove all the specific event handler when undefined.
 *
 */


function _off(event, filter, handler) {
  var _this2 = this;

  var args = {
    event: event,
    filter: arguments.length === 3 ? filter : null,
    handler: handler || (_lodash["default"].isFunction(filter) ? filter : null)
  };

  var isZoomOrDraw = _lodash["default"].includes(['zoomstart', 'zoom', 'zoomend', 'measurestart', 'measure', 'measureend'], event);

  var isInvalidArgs = !_lodash["default"].isNil(args.filter) && !_lodash["default"].isPlainObject(args.filter) || !_lodash["default"].isNil(args.handler) && !_lodash["default"].isFunction(args.handler); // Check event type and arguments are valid or not

  if (!_lodash["default"].includes(_dictionary.EVENT, event)) {
    log.warn(_gisException.GIS_ERROR.INVALID_TYPE, event, "Please input valid events: ".concat(_dictionary.EVENT));
    return;
  } else if (isZoomOrDraw && args.filter) {
    log.warn(_gisException.GIS_ERROR.INVALID_ARGS, [event, filter, handler], 'Zoom or measure related event is global, which means no filter is required.');
    return;
  } else if (isInvalidArgs) {
    log.warn(_gisException.GIS_ERROR.INVALID_ARGS, [event, filter, handler], 'The arguments should be (String event, Object filter?, Function handler?)');
    return;
  }

  var map = this._map;

  var evtIdx = _lodash["default"].findIndex(this._eventMap, function (evt) {
    return evt.handler === handler;
  });

  var record = evtIdx > -1 ? this._eventMap[evtIdx] : null; // If handler is specified, and no filter or the filter is the same as the record, remove the event

  if (record && (!args.filter || _lodash["default"].isEqual(record.filter, args.filter))) {
    map.off(args.event, this._eventMap[evtIdx].eventHandler);

    this._eventCore.off(args.event, this._eventMap[evtIdx].eventHandler);

    this._eventMap.slice(evtIdx, 1);
  } // If filter and (record or no handler), remove matched symbols' events, by adding the exclude filter
  else if ((record || !args.handler) && args.filter) {
      if (record) {
        // For fixing new symbols can't apply event
        if (!record.exclude) {
          record.exclude = [];
        }

        record.exclude.push(args.filter);
        record.excludeIds = _lodash["default"].uniq(_lodash["default"].reduce(record.exclude, function (acc, excld) {
          return _lodash["default"].concat(acc, _symbolHelper["default"].getSymbol.call(_this2, excld, true, 'id'));
        }, []));
      } else {
        _lodash["default"].forEach(this._eventMap, function (evt) {
          if (evt.event === args.event) {
            // For fixing new symbols can't apply event
            if (!evt.exclude) {
              evt.exclude = [];
            }

            evt.exclude.push(args.filter);
            evt.excludeIds = _lodash["default"].uniq(_lodash["default"].reduce(evt.exclude, function (acc, excld) {
              return _lodash["default"].concat(acc, _symbolHelper["default"].getSymbol.call(_this2, excld, true, 'id'));
            }, []));
          }
        });
      }
    } // If no filter and no handler, remove all handlers of the event
    else if (!args.filter && !args.handler) {
        map.off(args.event);

        this._eventCore.off(args.event);

        _lodash["default"].remove(this._eventMap, function (evt) {
          return evt.event === args.event;
        }); // Re-bind the basic click event


        if (args.event === 'click') {
          this._eventCore.on('click', _setupHelper.fireSelectionChange.bind(this));
        }
      }
}

var _default = {
  _on: _on,
  _off: _off
};
exports["default"] = _default;
//# sourceMappingURL=event.js.map