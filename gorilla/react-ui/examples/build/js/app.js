/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"app": 0
/******/ 	};
/******/
/******/ 	// script path function
/******/ 	function jsonpScriptSrc(chunkId) {
/******/ 		return __webpack_require__.p + "" + ({}[chunkId]||chunkId) + ".js"
/******/ 	}
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push([0,"vendor"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "../node_modules/moment/locale sync recursive ^\\.\\/.*$":
/*!***************************************************!*\
  !*** ../node_modules/moment/locale sync ^\.\/.*$ ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./af": "../node_modules/moment/locale/af.js",
	"./af.js": "../node_modules/moment/locale/af.js",
	"./ar": "../node_modules/moment/locale/ar.js",
	"./ar-dz": "../node_modules/moment/locale/ar-dz.js",
	"./ar-dz.js": "../node_modules/moment/locale/ar-dz.js",
	"./ar-kw": "../node_modules/moment/locale/ar-kw.js",
	"./ar-kw.js": "../node_modules/moment/locale/ar-kw.js",
	"./ar-ly": "../node_modules/moment/locale/ar-ly.js",
	"./ar-ly.js": "../node_modules/moment/locale/ar-ly.js",
	"./ar-ma": "../node_modules/moment/locale/ar-ma.js",
	"./ar-ma.js": "../node_modules/moment/locale/ar-ma.js",
	"./ar-sa": "../node_modules/moment/locale/ar-sa.js",
	"./ar-sa.js": "../node_modules/moment/locale/ar-sa.js",
	"./ar-tn": "../node_modules/moment/locale/ar-tn.js",
	"./ar-tn.js": "../node_modules/moment/locale/ar-tn.js",
	"./ar.js": "../node_modules/moment/locale/ar.js",
	"./az": "../node_modules/moment/locale/az.js",
	"./az.js": "../node_modules/moment/locale/az.js",
	"./be": "../node_modules/moment/locale/be.js",
	"./be.js": "../node_modules/moment/locale/be.js",
	"./bg": "../node_modules/moment/locale/bg.js",
	"./bg.js": "../node_modules/moment/locale/bg.js",
	"./bm": "../node_modules/moment/locale/bm.js",
	"./bm.js": "../node_modules/moment/locale/bm.js",
	"./bn": "../node_modules/moment/locale/bn.js",
	"./bn.js": "../node_modules/moment/locale/bn.js",
	"./bo": "../node_modules/moment/locale/bo.js",
	"./bo.js": "../node_modules/moment/locale/bo.js",
	"./br": "../node_modules/moment/locale/br.js",
	"./br.js": "../node_modules/moment/locale/br.js",
	"./bs": "../node_modules/moment/locale/bs.js",
	"./bs.js": "../node_modules/moment/locale/bs.js",
	"./ca": "../node_modules/moment/locale/ca.js",
	"./ca.js": "../node_modules/moment/locale/ca.js",
	"./cs": "../node_modules/moment/locale/cs.js",
	"./cs.js": "../node_modules/moment/locale/cs.js",
	"./cv": "../node_modules/moment/locale/cv.js",
	"./cv.js": "../node_modules/moment/locale/cv.js",
	"./cy": "../node_modules/moment/locale/cy.js",
	"./cy.js": "../node_modules/moment/locale/cy.js",
	"./da": "../node_modules/moment/locale/da.js",
	"./da.js": "../node_modules/moment/locale/da.js",
	"./de": "../node_modules/moment/locale/de.js",
	"./de-at": "../node_modules/moment/locale/de-at.js",
	"./de-at.js": "../node_modules/moment/locale/de-at.js",
	"./de-ch": "../node_modules/moment/locale/de-ch.js",
	"./de-ch.js": "../node_modules/moment/locale/de-ch.js",
	"./de.js": "../node_modules/moment/locale/de.js",
	"./dv": "../node_modules/moment/locale/dv.js",
	"./dv.js": "../node_modules/moment/locale/dv.js",
	"./el": "../node_modules/moment/locale/el.js",
	"./el.js": "../node_modules/moment/locale/el.js",
	"./en-au": "../node_modules/moment/locale/en-au.js",
	"./en-au.js": "../node_modules/moment/locale/en-au.js",
	"./en-ca": "../node_modules/moment/locale/en-ca.js",
	"./en-ca.js": "../node_modules/moment/locale/en-ca.js",
	"./en-gb": "../node_modules/moment/locale/en-gb.js",
	"./en-gb.js": "../node_modules/moment/locale/en-gb.js",
	"./en-ie": "../node_modules/moment/locale/en-ie.js",
	"./en-ie.js": "../node_modules/moment/locale/en-ie.js",
	"./en-il": "../node_modules/moment/locale/en-il.js",
	"./en-il.js": "../node_modules/moment/locale/en-il.js",
	"./en-nz": "../node_modules/moment/locale/en-nz.js",
	"./en-nz.js": "../node_modules/moment/locale/en-nz.js",
	"./eo": "../node_modules/moment/locale/eo.js",
	"./eo.js": "../node_modules/moment/locale/eo.js",
	"./es": "../node_modules/moment/locale/es.js",
	"./es-do": "../node_modules/moment/locale/es-do.js",
	"./es-do.js": "../node_modules/moment/locale/es-do.js",
	"./es-us": "../node_modules/moment/locale/es-us.js",
	"./es-us.js": "../node_modules/moment/locale/es-us.js",
	"./es.js": "../node_modules/moment/locale/es.js",
	"./et": "../node_modules/moment/locale/et.js",
	"./et.js": "../node_modules/moment/locale/et.js",
	"./eu": "../node_modules/moment/locale/eu.js",
	"./eu.js": "../node_modules/moment/locale/eu.js",
	"./fa": "../node_modules/moment/locale/fa.js",
	"./fa.js": "../node_modules/moment/locale/fa.js",
	"./fi": "../node_modules/moment/locale/fi.js",
	"./fi.js": "../node_modules/moment/locale/fi.js",
	"./fo": "../node_modules/moment/locale/fo.js",
	"./fo.js": "../node_modules/moment/locale/fo.js",
	"./fr": "../node_modules/moment/locale/fr.js",
	"./fr-ca": "../node_modules/moment/locale/fr-ca.js",
	"./fr-ca.js": "../node_modules/moment/locale/fr-ca.js",
	"./fr-ch": "../node_modules/moment/locale/fr-ch.js",
	"./fr-ch.js": "../node_modules/moment/locale/fr-ch.js",
	"./fr.js": "../node_modules/moment/locale/fr.js",
	"./fy": "../node_modules/moment/locale/fy.js",
	"./fy.js": "../node_modules/moment/locale/fy.js",
	"./gd": "../node_modules/moment/locale/gd.js",
	"./gd.js": "../node_modules/moment/locale/gd.js",
	"./gl": "../node_modules/moment/locale/gl.js",
	"./gl.js": "../node_modules/moment/locale/gl.js",
	"./gom-latn": "../node_modules/moment/locale/gom-latn.js",
	"./gom-latn.js": "../node_modules/moment/locale/gom-latn.js",
	"./gu": "../node_modules/moment/locale/gu.js",
	"./gu.js": "../node_modules/moment/locale/gu.js",
	"./he": "../node_modules/moment/locale/he.js",
	"./he.js": "../node_modules/moment/locale/he.js",
	"./hi": "../node_modules/moment/locale/hi.js",
	"./hi.js": "../node_modules/moment/locale/hi.js",
	"./hr": "../node_modules/moment/locale/hr.js",
	"./hr.js": "../node_modules/moment/locale/hr.js",
	"./hu": "../node_modules/moment/locale/hu.js",
	"./hu.js": "../node_modules/moment/locale/hu.js",
	"./hy-am": "../node_modules/moment/locale/hy-am.js",
	"./hy-am.js": "../node_modules/moment/locale/hy-am.js",
	"./id": "../node_modules/moment/locale/id.js",
	"./id.js": "../node_modules/moment/locale/id.js",
	"./is": "../node_modules/moment/locale/is.js",
	"./is.js": "../node_modules/moment/locale/is.js",
	"./it": "../node_modules/moment/locale/it.js",
	"./it.js": "../node_modules/moment/locale/it.js",
	"./ja": "../node_modules/moment/locale/ja.js",
	"./ja.js": "../node_modules/moment/locale/ja.js",
	"./jv": "../node_modules/moment/locale/jv.js",
	"./jv.js": "../node_modules/moment/locale/jv.js",
	"./ka": "../node_modules/moment/locale/ka.js",
	"./ka.js": "../node_modules/moment/locale/ka.js",
	"./kk": "../node_modules/moment/locale/kk.js",
	"./kk.js": "../node_modules/moment/locale/kk.js",
	"./km": "../node_modules/moment/locale/km.js",
	"./km.js": "../node_modules/moment/locale/km.js",
	"./kn": "../node_modules/moment/locale/kn.js",
	"./kn.js": "../node_modules/moment/locale/kn.js",
	"./ko": "../node_modules/moment/locale/ko.js",
	"./ko.js": "../node_modules/moment/locale/ko.js",
	"./ky": "../node_modules/moment/locale/ky.js",
	"./ky.js": "../node_modules/moment/locale/ky.js",
	"./lb": "../node_modules/moment/locale/lb.js",
	"./lb.js": "../node_modules/moment/locale/lb.js",
	"./lo": "../node_modules/moment/locale/lo.js",
	"./lo.js": "../node_modules/moment/locale/lo.js",
	"./lt": "../node_modules/moment/locale/lt.js",
	"./lt.js": "../node_modules/moment/locale/lt.js",
	"./lv": "../node_modules/moment/locale/lv.js",
	"./lv.js": "../node_modules/moment/locale/lv.js",
	"./me": "../node_modules/moment/locale/me.js",
	"./me.js": "../node_modules/moment/locale/me.js",
	"./mi": "../node_modules/moment/locale/mi.js",
	"./mi.js": "../node_modules/moment/locale/mi.js",
	"./mk": "../node_modules/moment/locale/mk.js",
	"./mk.js": "../node_modules/moment/locale/mk.js",
	"./ml": "../node_modules/moment/locale/ml.js",
	"./ml.js": "../node_modules/moment/locale/ml.js",
	"./mn": "../node_modules/moment/locale/mn.js",
	"./mn.js": "../node_modules/moment/locale/mn.js",
	"./mr": "../node_modules/moment/locale/mr.js",
	"./mr.js": "../node_modules/moment/locale/mr.js",
	"./ms": "../node_modules/moment/locale/ms.js",
	"./ms-my": "../node_modules/moment/locale/ms-my.js",
	"./ms-my.js": "../node_modules/moment/locale/ms-my.js",
	"./ms.js": "../node_modules/moment/locale/ms.js",
	"./mt": "../node_modules/moment/locale/mt.js",
	"./mt.js": "../node_modules/moment/locale/mt.js",
	"./my": "../node_modules/moment/locale/my.js",
	"./my.js": "../node_modules/moment/locale/my.js",
	"./nb": "../node_modules/moment/locale/nb.js",
	"./nb.js": "../node_modules/moment/locale/nb.js",
	"./ne": "../node_modules/moment/locale/ne.js",
	"./ne.js": "../node_modules/moment/locale/ne.js",
	"./nl": "../node_modules/moment/locale/nl.js",
	"./nl-be": "../node_modules/moment/locale/nl-be.js",
	"./nl-be.js": "../node_modules/moment/locale/nl-be.js",
	"./nl.js": "../node_modules/moment/locale/nl.js",
	"./nn": "../node_modules/moment/locale/nn.js",
	"./nn.js": "../node_modules/moment/locale/nn.js",
	"./pa-in": "../node_modules/moment/locale/pa-in.js",
	"./pa-in.js": "../node_modules/moment/locale/pa-in.js",
	"./pl": "../node_modules/moment/locale/pl.js",
	"./pl.js": "../node_modules/moment/locale/pl.js",
	"./pt": "../node_modules/moment/locale/pt.js",
	"./pt-br": "../node_modules/moment/locale/pt-br.js",
	"./pt-br.js": "../node_modules/moment/locale/pt-br.js",
	"./pt.js": "../node_modules/moment/locale/pt.js",
	"./ro": "../node_modules/moment/locale/ro.js",
	"./ro.js": "../node_modules/moment/locale/ro.js",
	"./ru": "../node_modules/moment/locale/ru.js",
	"./ru.js": "../node_modules/moment/locale/ru.js",
	"./sd": "../node_modules/moment/locale/sd.js",
	"./sd.js": "../node_modules/moment/locale/sd.js",
	"./se": "../node_modules/moment/locale/se.js",
	"./se.js": "../node_modules/moment/locale/se.js",
	"./si": "../node_modules/moment/locale/si.js",
	"./si.js": "../node_modules/moment/locale/si.js",
	"./sk": "../node_modules/moment/locale/sk.js",
	"./sk.js": "../node_modules/moment/locale/sk.js",
	"./sl": "../node_modules/moment/locale/sl.js",
	"./sl.js": "../node_modules/moment/locale/sl.js",
	"./sq": "../node_modules/moment/locale/sq.js",
	"./sq.js": "../node_modules/moment/locale/sq.js",
	"./sr": "../node_modules/moment/locale/sr.js",
	"./sr-cyrl": "../node_modules/moment/locale/sr-cyrl.js",
	"./sr-cyrl.js": "../node_modules/moment/locale/sr-cyrl.js",
	"./sr.js": "../node_modules/moment/locale/sr.js",
	"./ss": "../node_modules/moment/locale/ss.js",
	"./ss.js": "../node_modules/moment/locale/ss.js",
	"./sv": "../node_modules/moment/locale/sv.js",
	"./sv.js": "../node_modules/moment/locale/sv.js",
	"./sw": "../node_modules/moment/locale/sw.js",
	"./sw.js": "../node_modules/moment/locale/sw.js",
	"./ta": "../node_modules/moment/locale/ta.js",
	"./ta.js": "../node_modules/moment/locale/ta.js",
	"./te": "../node_modules/moment/locale/te.js",
	"./te.js": "../node_modules/moment/locale/te.js",
	"./tet": "../node_modules/moment/locale/tet.js",
	"./tet.js": "../node_modules/moment/locale/tet.js",
	"./tg": "../node_modules/moment/locale/tg.js",
	"./tg.js": "../node_modules/moment/locale/tg.js",
	"./th": "../node_modules/moment/locale/th.js",
	"./th.js": "../node_modules/moment/locale/th.js",
	"./tl-ph": "../node_modules/moment/locale/tl-ph.js",
	"./tl-ph.js": "../node_modules/moment/locale/tl-ph.js",
	"./tlh": "../node_modules/moment/locale/tlh.js",
	"./tlh.js": "../node_modules/moment/locale/tlh.js",
	"./tr": "../node_modules/moment/locale/tr.js",
	"./tr.js": "../node_modules/moment/locale/tr.js",
	"./tzl": "../node_modules/moment/locale/tzl.js",
	"./tzl.js": "../node_modules/moment/locale/tzl.js",
	"./tzm": "../node_modules/moment/locale/tzm.js",
	"./tzm-latn": "../node_modules/moment/locale/tzm-latn.js",
	"./tzm-latn.js": "../node_modules/moment/locale/tzm-latn.js",
	"./tzm.js": "../node_modules/moment/locale/tzm.js",
	"./ug-cn": "../node_modules/moment/locale/ug-cn.js",
	"./ug-cn.js": "../node_modules/moment/locale/ug-cn.js",
	"./uk": "../node_modules/moment/locale/uk.js",
	"./uk.js": "../node_modules/moment/locale/uk.js",
	"./ur": "../node_modules/moment/locale/ur.js",
	"./ur.js": "../node_modules/moment/locale/ur.js",
	"./uz": "../node_modules/moment/locale/uz.js",
	"./uz-latn": "../node_modules/moment/locale/uz-latn.js",
	"./uz-latn.js": "../node_modules/moment/locale/uz-latn.js",
	"./uz.js": "../node_modules/moment/locale/uz.js",
	"./vi": "../node_modules/moment/locale/vi.js",
	"./vi.js": "../node_modules/moment/locale/vi.js",
	"./x-pseudo": "../node_modules/moment/locale/x-pseudo.js",
	"./x-pseudo.js": "../node_modules/moment/locale/x-pseudo.js",
	"./yo": "../node_modules/moment/locale/yo.js",
	"./yo.js": "../node_modules/moment/locale/yo.js",
	"./zh-cn": "../node_modules/moment/locale/zh-cn.js",
	"./zh-cn.js": "../node_modules/moment/locale/zh-cn.js",
	"./zh-hk": "../node_modules/moment/locale/zh-hk.js",
	"./zh-hk.js": "../node_modules/moment/locale/zh-hk.js",
	"./zh-tw": "../node_modules/moment/locale/zh-tw.js",
	"./zh-tw.js": "../node_modules/moment/locale/zh-tw.js"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	var module = __webpack_require__(id);
	return module;
}
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) { // check for number or string
		var e = new Error('Cannot find module "' + req + '".');
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return id;
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "../node_modules/moment/locale sync recursive ^\\.\\/.*$";

/***/ }),

/***/ "../src/components/button-group.js":
/*!*****************************************!*\
  !*** ../src/components/button-group.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

var _listNormalizer = __webpack_require__(/*! ../hoc/list-normalizer */ "../src/hoc/list-normalizer.js");

var _listNormalizer2 = _interopRequireDefault(_listNormalizer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/button-group');

/**
 * A React Button Group
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {Array.<object>} list - List of options
 * @param {string | number} list.value - item value
 * @param {string} list.text - item display text
 * @param {string} list.className - classname for item button
 * @param {string} [className] - Classname for the container
 * @param {string|number|Array.<string|number>} [defaultValue] - Default selected value (array if multi=true)
 * @param {string|number|Array.<string|number>} [value] - Current selected value (array if multi=true)
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean|Array.<string|number>} [disabled=false] - Is selection disabled?
 * @param {boolean} [multi=false] - Allow multi-selection?
 * @param {function} [onChange] - Callback function when value is selected. <br> Required when value prop is supplied
 * @param {string|number|Array.<string|number>} onChange.value - selected value (array if multi=true)
 * @param {object} onChange.eventInfo - event related info
 * @param {string|number|Array.<string|number>} onChange.eventInfo.before - previously selected value (array if multi=true)
 *
 * @example
// controlled

import {ButtonGroup} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            type: 'movie',
            types: ['tv']
        }
    },
    handleChange(name, val) {
        this.setState({[name]:val})
    },
    render() {
        const {type, types} = this.state
        return <div className='c-form'>
            <div>
                <label>Select a type</label>
                <ButtonGroup
                    id='type'
                    className='column'
                    list={[
                        {value:'movie', text:'Movie'},
                        {value:'tv', text:'TV'},
                        {value:'actors', text:'Actors'}
                    ]}
                    onChange={this.handleChange.bind(this,'type')}
                    value={type} />
            </div>
            <div>
                <label>Select multiple types (movie disabled)</label>
                <ButtonGroup
                    id='types'
                    className='column'
                    list={[
                        {value:'movie', text:'Movie'},
                        {value:'tv', text:'TV'},
                        {value:'actors', text:'Actors'}
                    ]}
                    multi
                    disabled={['movie']}
                    onChange={this.handleChange.bind(this,'types')}
                    value={types} />
            </div>
        </div>
    }
})
 */

var ButtonGroup = function (_React$Component) {
    _inherits(ButtonGroup, _React$Component);

    function ButtonGroup() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ButtonGroup);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ButtonGroup.__proto__ || Object.getPrototypeOf(ButtonGroup)).call.apply(_ref, [this].concat(args))), _this), _this.handleSelect = function (newVal) {
            var _this$props = _this.props,
                onChange = _this$props.onChange,
                multi = _this$props.multi,
                value = _this$props.value;

            onChange(multi ? _lodash2.default.includes(value, newVal) ? _lodash2.default.without(value, newVal) : [].concat(_toConsumableArray(value), [newVal]) : newVal);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ButtonGroup, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                list = _props.list,
                value = _props.value,
                disabled = _props.disabled,
                multi = _props.multi,
                className = _props.className;


            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-button-group', className) },
                _lodash2.default.map(list, function (_ref2) {
                    var itemValue = _ref2.value,
                        itemText = _ref2.text,
                        itemClassName = _ref2.className;

                    var selected = multi ? _lodash2.default.includes(value, itemValue) : value === itemValue;
                    var isDisabled = _lodash2.default.isBoolean(disabled) && disabled || _lodash2.default.isArray(disabled) && _lodash2.default.includes(disabled, itemValue);
                    return _react2.default.createElement(
                        'button',
                        {
                            key: itemValue,
                            className: (0, _classnames2.default)('thumb', { selected: selected }, itemClassName),
                            onClick: _this2.handleSelect.bind(_this2, itemValue),
                            disabled: isDisabled },
                        itemText
                    );
                })
            );
        }
    }]);

    return ButtonGroup;
}(_react2.default.Component);

ButtonGroup.propTypes = {
    id: _propTypes2.default.string,
    list: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        value: _propTypes3.SIMPLE_VALUE_PROP,
        text: _propTypes2.default.node,
        className: _propTypes2.default.string
    })),
    className: _propTypes2.default.string,
    value: _propTypes2.default.oneOfType([_propTypes3.SIMPLE_VALUE_PROP, _propTypes3.SIMPLE_ARRAY_PROP]),
    disabled: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes3.SIMPLE_ARRAY_PROP]),
    multi: _propTypes2.default.bool,
    onChange: _propTypes2.default.func
};
ButtonGroup.defaultProps = {
    disabled: false,
    multi: false
};
exports.default = (0, _propWire.wire)((0, _listNormalizer2.default)(ButtonGroup), 'value', function (_ref3) {
    var multi = _ref3.multi;
    return multi ? [] : '';
});

/***/ }),

/***/ "../src/components/checkbox-group.js":
/*!*******************************************!*\
  !*** ../src/components/checkbox-group.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

var _listNormalizer = __webpack_require__(/*! ../hoc/list-normalizer */ "../src/hoc/list-normalizer.js");

var _listNormalizer2 = _interopRequireDefault(_listNormalizer);

var _checkbox = __webpack_require__(/*! ./checkbox */ "../src/components/checkbox.js");

var _checkbox2 = _interopRequireDefault(_checkbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/checkbox-group');

/**
 * A React Checkbox Group
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {Array.<object>} list - List of items
 * @param {string | number} list.value - item value
 * @param {renderable} list.text - item display text
 * @param {string} list.className - item classname
 * @param {renderable} [list.children] - things to render after the label
 * @param {string} [className] - Classname for the container
 * @param {Array.<string|number>} [defaultValue] - Default checked values
 * @param {Array.<string|number>} [value] - Current checked values
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean|Array.<string|number>} [disabled=false] - true/false if disable all checkboxes, or array of values to disable specific checkboxes
 * @param {boolean} [toggleAll=false] - Show toggle all checkbox?
 * @param {string} [toggleAllText='All'] - Text shown in toggle all label
 * @param {function} [onChange] - Callback function when any of the checkboxes is ticked/unticked. <br> Required when value prop is supplied
 * @param {Array.<string|number>} onChange.values - current checked values
 * @param {object} onChange.eventInfo - event related info
 * @param {Array.<string|number>} onChange.eventInfo.before - previously checked values
 * @param {string|number} onChange.eventInfo.value - which value triggered change?
 * @param {boolean} onChange.eventInfo.checked - checked or unchecked?
 *
 * @example
// controlled

import {CheckboxGroup} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            movies:[1]
        }
    },
    handleChange(movies) {
        this.setState({movies})
    },
    render() {
        let {movies} = this.state;
        return <div>
            <label>Select movies</label>
            <CheckboxGroup
                list={[
                    {value:1,text:'1d - Finding Dory (selected by default, cannot deselect)'},
                    {value:2,text:'2 - Wizard of Oz'},
                    {value:3,text:'3 - Citizen Kane'}
                ]}
                onChange={this.handleChange}
                value={movies}
                disabled={[1]}/>
        </div>
    }
})
 */

var CheckboxGroup = function (_React$Component) {
    _inherits(CheckboxGroup, _React$Component);

    function CheckboxGroup() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, CheckboxGroup);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = CheckboxGroup.__proto__ || Object.getPrototypeOf(CheckboxGroup)).call.apply(_ref, [this].concat(args))), _this), _this.getDisabledItems = function () {
            var _this$props = _this.props,
                disabled = _this$props.disabled,
                list = _this$props.list;

            var disabledItems = [];
            if (_lodash2.default.isBoolean(disabled)) {
                if (disabled) {
                    disabledItems = _lodash2.default.map(list, 'value');
                } else {
                    disabledItems = [];
                }
            } else if (_lodash2.default.isArray(disabled)) {
                disabledItems = disabled;
            }
            return disabledItems;
        }, _this.getSelectableItems = function () {
            var list = _this.props.list;

            return _lodash2.default.without.apply(_lodash2.default, [_lodash2.default.map(list, 'value')].concat(_toConsumableArray(_this.getDisabledItems())));
        }, _this.handleChange = function (value, checked) {
            var _this$props2 = _this.props,
                curValue = _this$props2.value,
                onChange = _this$props2.onChange;

            var newValue = checked ? [].concat(_toConsumableArray(curValue), [value]) : _lodash2.default.without(curValue, value);
            onChange(newValue, { value: value, checked: checked });
        }, _this.handleToggleAll = function (checked) {
            var _this$props3 = _this.props,
                onChange = _this$props3.onChange,
                value = _this$props3.value;

            var disabledItems = _this.getDisabledItems();
            var selectableItems = _this.getSelectableItems();
            var disabledSelectedItems = _lodash2.default.intersection(disabledItems, value);
            var newValue = checked ? [].concat(_toConsumableArray(selectableItems), _toConsumableArray(disabledSelectedItems)) : disabledSelectedItems;
            onChange(newValue, { checked: checked });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(CheckboxGroup, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                toggleAll = _props.toggleAll,
                toggleAllText = _props.toggleAllText,
                className = _props.className,
                list = _props.list,
                value = _props.value;

            var disabledItems = this.getDisabledItems();
            var numSelected = _lodash2.default.without.apply(_lodash2.default, [value].concat(_toConsumableArray(disabledItems))).length;
            var numSelectable = this.getSelectableItems().length;

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-checkbox-group', className) },
                toggleAll && numSelectable > 0 && _react2.default.createElement(
                    'span',
                    { className: 'all list-item' },
                    _react2.default.createElement(_checkbox2.default, {
                        id: id + '-_all',
                        checked: numSelected > 0,
                        className: (0, _classnames2.default)({ partial: numSelected > 0 && numSelected < numSelectable }),
                        onChange: this.handleToggleAll }),
                    _react2.default.createElement(
                        'label',
                        { htmlFor: id + '-_all' },
                        toggleAllText
                    )
                ),
                _lodash2.default.map(list, function (_ref2) {
                    var itemValue = _ref2.value,
                        itemText = _ref2.text,
                        itemClassName = _ref2.className,
                        children = _ref2.children;

                    return _react2.default.createElement(
                        'span',
                        { className: (0, _classnames2.default)('list-item', itemClassName), key: itemValue },
                        _react2.default.createElement(_checkbox2.default, {
                            id: id + '-' + itemValue,
                            onChange: _this2.handleChange.bind(_this2, itemValue),
                            value: itemValue,
                            checked: value.indexOf(itemValue) >= 0,
                            disabled: _lodash2.default.includes(disabledItems, itemValue) }),
                        _react2.default.createElement(
                            'label',
                            { htmlFor: id + '-' + itemValue },
                            itemText
                        ),
                        children
                    );
                })
            );
        }
    }]);

    return CheckboxGroup;
}(_react2.default.Component);

CheckboxGroup.propTypes = {
    id: _propTypes2.default.string,
    list: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        value: _propTypes3.SIMPLE_VALUE_PROP,
        text: _propTypes2.default.node,
        className: _propTypes2.default.string,
        children: _propTypes2.default.node
    })).isRequired,
    className: _propTypes2.default.string,
    value: _propTypes3.SIMPLE_ARRAY_PROP,
    disabled: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes3.SIMPLE_ARRAY_PROP]),
    toggleAll: _propTypes2.default.bool,
    toggleAllText: _propTypes2.default.string,
    onChange: _propTypes2.default.func
};
CheckboxGroup.defaultProps = {
    disabled: false,
    toggleAll: false,
    toggleAllText: 'All'
};
exports.default = (0, _propWire.wire)((0, _listNormalizer2.default)(CheckboxGroup), 'value', []);

/***/ }),

/***/ "../src/components/checkbox.js":
/*!*************************************!*\
  !*** ../src/components/checkbox.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _jquery = __webpack_require__(/*! jquery */ "../node_modules/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/checkbox');

/**
 * A React Checkbox
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {boolean} [defaultChecked] - Default checked value
 * @param {boolean} [checked] - Current checked value
 * @param {object} [checkedLink] - Link to update check value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} checkedLink.value - value to update
 * @param {function} checkedLink.requestChange - function to request check value change
 * @param {boolean} [disabled=false] - Is checkbox disabled?
 * @param {function} onChange  - Callback function when checkbox is ticked/unticked. <br> Required when value prop is supplied
 * @param {boolean} onChange.checked - checked?
 * @param {object} onChange.eventInfo - event related info
 * @param {boolean} onChange.eventInfo.before - was checked or unchecked?
 *
 * @example
// controlled

import {Checkbox} from 'react-ui'
React.createClass({
    getInitialState() {
        return {subscribe:false}
    },
    handleChange(subscribe) {
        this.setState({subscribe})
    },
    render() {
        const {subscribe} = this.state;
        return <div className='c-flex aic'>
            <label htmlFor='subscribe'>Would you like to subscribe to this newsletter?</label>
            <Checkbox id='subscribe'
                onChange={this.handleChange}
                checked={subscribe}/>
        </div>
    }
})
 */

var Checkbox = function (_React$Component) {
    _inherits(Checkbox, _React$Component);

    function Checkbox() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Checkbox);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Checkbox.__proto__ || Object.getPrototypeOf(Checkbox)).call.apply(_ref, [this].concat(args))), _this), _this.getLabelForCheckbox = function () {
            return (0, _jquery2.default)(_this.node).parent().find('label[for="' + _this.props.id + '"]');
        }, _this.handleChange = function (evt) {
            evt.stopPropagation();
            var _this$props = _this.props,
                onChange = _this$props.onChange,
                checked = _this$props.checked;

            onChange(!checked);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Checkbox, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            if (this.props.id && !this.props.disabled) {
                this.getLabelForCheckbox().on('click', function (evt) {
                    _this2.handleChange(evt);
                });
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.getLabelForCheckbox().off();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                checked = _props.checked,
                disabled = _props.disabled;

            return _react2.default.createElement('i', {
                id: id,
                ref: function ref(_ref2) {
                    _this3.node = _ref2;
                },
                onClick: disabled ? null : this.handleChange,
                className: (0, _classnames2.default)('c-checkbox', 'fg', checked ? 'fg-checkbox' : 'fg-checkbox-outline', { disabled: disabled }, className) });
        }
    }]);

    return Checkbox;
}(_react2.default.Component);

Checkbox.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    checked: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    onChange: _propTypes2.default.func
};
Checkbox.defaultProps = {
    disabled: false
};
exports.default = (0, _propWire.wireChecked)(Checkbox);

/***/ }),

/***/ "../src/components/combobox.js":
/*!*************************************!*\
  !*** ../src/components/combobox.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _underscore = __webpack_require__(/*! underscore.string */ "../node_modules/underscore.string/index.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

var _listNormalizer = __webpack_require__(/*! ../hoc/list-normalizer */ "../src/hoc/list-normalizer.js");

var _listNormalizer2 = _interopRequireDefault(_listNormalizer);

var _popover = __webpack_require__(/*! ./popover */ "../src/components/popover.js");

var _popover2 = _interopRequireDefault(_popover);

var _search = __webpack_require__(/*! ./search */ "../src/components/search.js");

var _search2 = _interopRequireDefault(_search);

var _checkboxGroup = __webpack_require__(/*! ./checkbox-group */ "../src/components/checkbox-group.js");

var _checkboxGroup2 = _interopRequireDefault(_checkboxGroup);

var _outsideEvent = __webpack_require__(/*! ../utils/outside-event */ "../src/utils/outside-event.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/combobox');

var PopupList = function (_React$Component) {
    _inherits(PopupList, _React$Component);

    function PopupList() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, PopupList);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PopupList.__proto__ || Object.getPrototypeOf(PopupList)).call.apply(_ref, [this].concat(args))), _this), _this.onClickOutside = function (target) {
            _this.props.onClickOutside(target);
        }, _this.onSelect = function (selected, data) {
            _this.props.onSelect(selected, data);
        }, _this.focusSearchInput = function () {
            if (_this.searchComp) {
                _this.searchComp._component.focus();
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(PopupList, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.handler = (0, _outsideEvent.subscribe)(this.node).onOutside(this.onClickOutside);

            this.focusSearchInput();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.focusSearchInput();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.handler.unsubscribe();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                selected = _props.selected,
                search = _props.search,
                multiSelect = _props.multiSelect,
                list = _props.list,
                info = _props.info,
                infoClassName = _props.infoClassName;

            var infoText = _lodash2.default.isFunction(info) ? info(list) : info;

            return _react2.default.createElement(
                'div',
                { ref: function ref(_ref4) {
                        _this2.node = _ref4;
                    }, className: 'c-combo-list c-flex fdc' },
                search.enabled && _react2.default.createElement(_search2.default, _extends({ className: 'asc', ref: function ref(_ref2) {
                        _this2.searchComp = _ref2;
                    } }, search)),
                _react2.default.createElement(
                    'div',
                    { className: 'list' },
                    multiSelect.enabled ? _react2.default.createElement(_checkboxGroup2.default, _extends({}, multiSelect, {
                        list: list,
                        onChange: this.onSelect,
                        value: selected })) : _react2.default.createElement(
                        'div',
                        { className: 'c-flex fdc' },
                        _lodash2.default.map(list, function (_ref3) {
                            var value = _ref3.value,
                                text = _ref3.text;

                            return _react2.default.createElement(
                                'span',
                                {
                                    key: value,
                                    className: (0, _classnames2.default)('list-item', { selected: selected === value }),
                                    onClick: _this2.onSelect.bind(_this2, value, { text: text }) },
                                text
                            );
                        })
                    ),
                    infoText && _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)('c-info', infoClassName) },
                        infoText
                    )
                )
            );
        }
    }]);

    return PopupList;
}(_react2.default.Component);

/**
 * A React Combobox that can dynamically load (via callback function) and update list when user types into input.<br>
 * Can be seen as a dropdown with typing/filtering feature.
 * @constructor
 * @param {string} [id] - Input element #id
 * @param {string} [name] - Input element name
 * @param {Array.<object>} list - List of items
 * @param {string | number} list.value - item value
 * @param {string} list.text - item display text
 * @param {string} [className] - Classname for the container
 * @param {renderable | function} [info] - React renderable object or function producing renderable object, display additional information about the list
 * @param {array.<object>} info.list - argument for **info** function, list of currently displayed items
 * @param {string} [infoClassName] - Assign className to info node
 * @param {string | number | Array.<string|number>} [defaultValue] - Default selected value
 * @param {string | number | Array.<string|number>} [value] - Current selected value
 * @param {object} [valueLink] - Link to update value. Used in conjuction with {@link module:linked-state-mixins linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {object} [multiSelect] - multi-select configuration
 * @param {boolean} [multiSelect.enabled=false] - Allow multi-select (checkbox)?
 * @param {boolean} [multiSelect.toggleAll=false] - Allow toggle all?
 * @param {string} [multiSelect.toggleAllText='All'] - Text to show on toggle all label
 * @param {object} [search] - search/filter configuration
 * @param {boolean} [search.enabled=false] - Allow search/filter list?
 * @param {string} [search.placeholder] - Placeholder for search input
 * @param {boolean} [search.enableClear=true] - Can this field be cleared?
 * @param {boolean} [search.interactive=true] - Determine if search is interactive
 * @param {number} [search.delaySearch=750] - If search is interactive, this setting will trigger onSearch event after *delaySearch* milliseconds<br>
 * true: onSearch event called as user types; <br>
 * false: onSearch event called when user hits enter
 * @param {function} [search.onSearch] - Callback function when search is changed. <br> Required when value prop is supplied
 * @param {string|number} search.onSearch.search - updated search value
 * @param {boolean} [required=false] - Is this field mandatory?
 * @param {boolean} [disabled=false] - Is this field disabled?
 * @param {boolean} [enableClear=true] - Can this field can be cleared?
 * @param {string} [placeholder] - Placeholder for input
 * @param {function} [onChange] - Callback function when item is selected. <br> Required when value prop is supplied
 * @param {string | number | Array.<string|number>} onChange.value - selected value(s)
 * @param {object} onChange.eventInfo - event related info
 * @param {string | number | Array.<string|number>} onChange.eventInfo.before - previously selected value(s)
 * @param {string} onChange.eventInfo.text - currently selected text
 *
 * @example
// controlled

import $ from 'jquery'
import cx from 'classnames'
import {Combobox} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            movie: {
                selected: 'test',
                eventInfo: null,
                info: null,
                error: false,
                list: [{value:'test', text:'TEST'}]
            },
            tv: {
                selected: [],
                eventInfo: null,
                info: null,
                error: false,
                list: []
            }
        }
    },
    handleChange(field, value, eventInfo) {
        this.setState(
            im(this.state)
                .set(field+'.selected', value)
                .set(field+'.eventInfo', eventInfo)
                .value()
        )
    },
    handleSearch(type, text) {
        // ajax to fetch movies, but doesn't need to be ajax
        this.setState(
            im(this.state)
                .set(type+'.list', [])
                .set(type+'.error', false)
                .set(type+'.info', 'Loading...')
                .value(),
            () => {
                $.get(
                    `https://api.themoviedb.org/3/${text?'search':'discover'}/${type}`,
                    {
                        api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                        query: text
                    })
                    .done(({results:list=[], total_results:total=0})=>{
                        if (total <= 0) {
                            this.setState(
                                im(this.state)
                                    .set(type+'.list', [])
                                    .set(type+'.info', `No ${type} found`)
                                    .value()
                            )
                        }
                        else {
                            this.setState(
                                im(this.state)
                                    .set(type+'.list', _.map(list, ({id, name, title})=>({value:id, text:title||name})))
                                    .set(type+'.info', total>10 ? `There are ${total} results, only show the first 10 records` : null)
                                    .value()
                            )
                        }
                    })
                    .fail((xhr)=>{
                        this.setState(im.set(this.state, type+'.error', xhr.responseText))
                    })
            }
        )
    },
    render() {
        return <div className='c-form'>
            {
                ['movie', 'tv'].map(type=>{
                    let {info, error, list, selected} = this.state[type]

                    return <div key={type}>
                        <label htmlFor={type}>Select {type}</label>
                        <Combobox
                            id={type}
                            required={true}
                            onChange={this.handleChange.bind(this, type)}
                            search={{
                                enabled: true,
                                onSearch:this.handleSearch.bind(this, type)
                            }}
                            info={info}
                            infoClassName={cx({'c-error':error})}
                            list={list}
                            placeholder={type}
                            enableClear={type==='tv'}
                            multiSelect={{
                                enabled:type==='tv',
                                toggleAll:true,
                                toggleAllText:'All'
                            }}
                            value={selected} />
                    </div>
                })
            }
        </div>
    }
})

 */


PopupList.propTypes = {
    info: _propTypes2.default.oneOfType([_propTypes2.default.node, _propTypes2.default.func]),
    infoClassName: _propTypes2.default.string,
    list: _propTypes3.LIST_PROP,
    selected: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes3.SIMPLE_VALUE_PROP), _propTypes3.SIMPLE_VALUE_PROP]),
    search: _propTypes2.default.object,
    multiSelect: _propTypes2.default.object,
    onSelect: _propTypes2.default.func.isRequired,
    onClickOutside: _propTypes2.default.func.isRequired
};
PopupList.defaultProps = {
    multiSelect: { enabled: false },
    search: { enabled: false }
};

var Combobox = function (_React$Component2) {
    _inherits(Combobox, _React$Component2);

    function Combobox() {
        var _ref5;

        var _temp2, _this3, _ret2;

        _classCallCheck(this, Combobox);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this3 = _possibleConstructorReturn(this, (_ref5 = Combobox.__proto__ || Object.getPrototypeOf(Combobox)).call.apply(_ref5, [this].concat(args))), _this3), _this3.state = {
            isListOpen: false,
            searchText: '',
            searchIsSelected: true,
            cachedValueText: {}
        }, _this3.onSelect = function (selected, data) {
            var _this3$props = _this3.props,
                onChange = _this3$props.onChange,
                multiSelectable = _this3$props.multiSelect.enabled;


            if (multiSelectable) {
                onChange(selected, data);
            } else {
                _this3.setState({ isListOpen: false, searchIsSelected: true }, function () {
                    onChange(selected, data);
                    _this3.input.focus();
                });
            }
        }, _this3.onInput = function (evt) {
            var searchText = evt.target ? evt.target.value : evt;
            _this3.setState({ isListOpen: true, searchText: searchText, searchIsSelected: false });
        }, _this3.getListPosition = function () {
            var input = _this3.input.getBoundingClientRect();
            return { x: input.left, y: input.bottom };
        }, _this3.showList = function (updateOnly) {
            var searchText = _this3.state.searchText;
            var _this3$props2 = _this3.props,
                list = _this3$props2.list,
                value = _this3$props2.value,
                search = _this3$props2.search,
                info = _this3$props2.info,
                infoClassName = _this3$props2.infoClassName,
                multiSelect = _this3$props2.multiSelect;
            var onSearch = search.onSearch,
                enableSearch = search.enabled;

            var popupWidth = _this3.input.getBoundingClientRect().width;

            if (enableSearch && !onSearch) {
                // not dynamic search, try to filter list by input value
                list = _lodash2.default.filter(list, function (item) {
                    return item.text.toLowerCase().indexOf(searchText.toLowerCase()) >= 0;
                });
            }

            _popover2.default.open(_this3.getListPosition(), _react2.default.createElement(PopupList, {
                list: list,
                multiSelect: multiSelect,
                search: multiSelect.enabled && enableSearch ? _extends({
                    enableClear: true,
                    interactive: true
                }, search, {
                    value: searchText,
                    onSearch: _this3.onInput
                }) : { enabled: false },
                selected: value,
                onSelect: _this3.onSelect,
                onClickOutside: _this3.handleListClickOutside,
                info: info, infoClassName: infoClassName }), {
                pointy: false,
                className: 'no-shadow',
                updateOnly: updateOnly,
                style: {
                    minWidth: popupWidth,
                    borderWidth: 1,
                    borderColor: '#a9a9a9',
                    borderStyle: 'solid',
                    borderRadius: '5px',
                    padding: 0,
                    backgroundColor: 'rgb(255, 255, 255)',
                    color: 'inherit',
                    overflowX: 'hidden'
                }
            });
        }, _this3.handleListClickOutside = function (target) {
            if (target !== _this3.clearIcon && target !== _this3.toggleIcon && target !== _this3.input) {
                _this3.toggleList();
            }
        }, _this3.toggleList = function () {
            var isListOpen = _this3.state.isListOpen;

            _this3.setState({ isListOpen: !isListOpen, searchText: '', searchIsSelected: true });
        }, _this3.formatDisplayText = function () {
            var _this3$props3 = _this3.props,
                list = _this3$props3.list,
                value = _this3$props3.value,
                multiSelect = _this3$props3.multiSelect;
            var _this3$state = _this3.state,
                cachedValueText = _this3$state.cachedValueText,
                searchIsSelected = _this3$state.searchIsSelected,
                searchText = _this3$state.searchText;


            if (multiSelect.enabled) {
                var items = (0, _lodash2.default)(value).map(function (item) {
                    return _lodash2.default.find(list, { value: item }) || { value: item, text: cachedValueText[item] };
                }).map('text').value();
                var itemsToShow = _lodash2.default.take(items, 3);

                return itemsToShow.join(', ') + (items.length > 3 ? ' (+' + (items.length - 3) + ')' : '');
            } else {
                var formatted = '';
                if (searchIsSelected) {
                    if (value) {
                        var selectedItem = null;
                        selectedItem = _lodash2.default.find(list, { value: value }) || { value: value, text: cachedValueText[value] };
                        formatted = selectedItem ? selectedItem.text : '';
                    }
                } else {
                    formatted = searchText;
                }
                return formatted;
            }
        }, _temp2), _possibleConstructorReturn(_this3, _ret2);
    }

    _createClass(Combobox, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var multiSelectable = nextProps.multiSelect.enabled,
                nextValue = nextProps.value,
                nextList = nextProps.list;
            var _props2 = this.props,
                value = _props2.value,
                list = _props2.list;
            var _state = this.state,
                searchIsSelected = _state.searchIsSelected,
                cachedValueText = _state.cachedValueText;

            var valueChanged = JSON.stringify(value) !== JSON.stringify(nextValue);
            var listChanged = JSON.stringify(list) !== JSON.stringify(nextList);

            if (valueChanged || listChanged) {
                log.debug('componentWillReceiveProps::value/list changed', { value: value, nextValue: nextValue, list: list, nextList: nextList });
                this.setState({
                    searchIsSelected: valueChanged ? true : searchIsSelected,
                    cachedValueText: _extends({}, _lodash2.default.reduce(multiSelectable ? value : [value], function (acc, v) {
                        return _extends({}, acc, _defineProperty({}, v, _lodash2.default.get(_lodash2.default.find(list, { value: v }), 'text', v)));
                    }, {}), cachedValueText)
                });
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            var _this4 = this;

            var _props$search = this.props.search,
                _props$search$delaySe = _props$search.delaySearch,
                delaySearch = _props$search$delaySe === undefined ? 750 : _props$search$delaySe,
                onSearch = _props$search.onSearch;
            var _state2 = this.state,
                searchIsSelected = _state2.searchIsSelected,
                searchText = _state2.searchText,
                isListOpen = _state2.isListOpen;
            var prevSearchText = prevState.searchText,
                wasListOpen = prevState.isListOpen;


            log.debug('componentDidUpdate', prevState, this.state, prevProps, this.props);
            if (isListOpen) {
                log.debug('componentDidUpdate::isListOpen');
                if (!wasListOpen) {
                    log.debug('componentDidUpdate::was closed');
                    if (onSearch) {
                        log.debug('performing search when list is opened');
                        onSearch(searchText);
                    } else {
                        this.showList();
                    }
                } else if (!searchIsSelected && searchText !== prevSearchText) {
                    log.debug('componentDidUpdate::search changed', { searchText: searchText, prevSearchText: prevSearchText });
                    if (onSearch) {
                        if (this.timer) {
                            log.debug('clearing search timer');
                            clearTimeout(this.timer);
                            delete this.timer;
                        }
                        this.timer = setTimeout(function () {
                            _this4.timer = null;
                            log.debug('performing search', searchText);
                            onSearch(searchText);
                        }, delaySearch);
                    } else {
                        this.showList(true);
                    }
                } else {
                    this.showList(true);
                }
            } else if (wasListOpen) {
                _popover2.default.close();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            var _props3 = this.props,
                id = _props3.id,
                name = _props3.name,
                className = _props3.className,
                required = _props3.required,
                placeholder = _props3.placeholder,
                enableClear = _props3.enableClear,
                disabled = _props3.disabled,
                list = _props3.list,
                value = _props3.value,
                multiSelectable = _props3.multiSelect.enabled,
                enableSearch = _props3.search.enabled;


            var displayText = this.formatDisplayText(list, value);

            return _react2.default.createElement(
                'span',
                { className: (0, _classnames2.default)('c-combobox', className, { multi: multiSelectable, clearable: enableClear }) },
                _react2.default.createElement('input', {
                    type: 'text',
                    ref: function ref(_ref6) {
                        _this5.input = _ref6;
                    },
                    id: id,
                    name: name,
                    className: (0, _classnames2.default)({ invalid: required && _underscore2.default.isBlank(displayText) }),
                    onChange: !multiSelectable && enableSearch ? this.onInput : function () {},
                    required: required,
                    placeholder: placeholder,
                    value: displayText,
                    disabled: disabled }),
                !disabled && _react2.default.createElement(
                    'span',
                    { className: 'actions c-flex aic' },
                    enableClear && _react2.default.createElement('i', { className: 'fg fg-close', ref: function ref(_ref7) {
                            _this5.clearIcon = _ref7;
                        }, onClick: this.onSelect.bind(this, multiSelectable ? [] : '', { text: '' }) }),
                    _react2.default.createElement('i', { className: 'fg fg-arrow-bottom', ref: function ref(_ref8) {
                            _this5.toggleIcon = _ref8;
                        }, onClick: this.toggleList })
                )
            );
        }
    }]);

    return Combobox;
}(_react2.default.Component);

Combobox.propTypes = {
    id: _propTypes2.default.string,
    name: _propTypes2.default.string,
    list: _propTypes3.LIST_PROP,
    className: _propTypes2.default.string,
    info: _propTypes2.default.oneOfType([_propTypes2.default.node, _propTypes2.default.func]),
    infoClassName: _propTypes2.default.string,
    value: _propTypes2.default.oneOfType([_propTypes3.SIMPLE_VALUE_PROP, _propTypes2.default.arrayOf(_propTypes3.SIMPLE_VALUE_PROP)]),
    multiSelect: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        toggleAll: _propTypes2.default.bool,
        toggleAllText: _propTypes2.default.string
    }),
    search: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        placeholder: _propTypes2.default.string,
        onSearch: _propTypes2.default.func,
        interactive: _propTypes2.default.bool,
        enableClear: _propTypes2.default.bool,
        delaySearch: _propTypes2.default.number
    }),
    required: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    enableClear: _propTypes2.default.bool,
    placeholder: _propTypes2.default.string,
    onChange: _propTypes2.default.func
};
Combobox.defaultProps = {
    list: [],
    multiSelect: {
        enabled: false
    },
    search: {
        enabled: false
    },
    disabled: false,
    enableClear: true,
    required: false
};
exports.default = (0, _propWire.wire)((0, _listNormalizer2.default)(Combobox), 'value', function (_ref9) {
    var multiSelect = _ref9.multiSelect;
    return _lodash2.default.get(multiSelect, 'enabled', false) ? [] : '';
});

/***/ }),

/***/ "../src/components/contextmenu.js":
/*!****************************************!*\
  !*** ../src/components/contextmenu.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(/*! react-dom */ "../node_modules/react-dom/index.js");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _outsideEvent = __webpack_require__(/*! ../utils/outside-event */ "../src/utils/outside-event.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @module contextmenu
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @description A module to help with opening/closing **global** context menu:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * * When user clicks on a menu item, callback function will be fired
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * * when user clicks elsewhere on screen, menu will be closed
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * Note. There can only be one context menu displayed on screen at one point in time
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/contextmenu');

var globalContextMenu = null;

var Contextmenu = function (_React$Component) {
    _inherits(Contextmenu, _React$Component);

    function Contextmenu() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Contextmenu);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Contextmenu.__proto__ || Object.getPrototypeOf(Contextmenu)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _this.onClickInside = function (target) {
            var targetId = target.id;
            var menu = _this.state.menu;


            var targetMenuItem = _lodash2.default.find(menu, { id: targetId });

            if (targetMenuItem && targetMenuItem.action) {
                targetMenuItem.action();
                _this.setState({ menu: [] });
            }
        }, _this.onClickOutside = function () {
            _this.setState({ menu: [] });
        }, _this.open = function (position, menu, id) {
            _this.setState({ menu: menu, position: position, id: id });
        }, _this.isOpen = function () {
            return !_lodash2.default.isEmpty(_this.state.menu);
        }, _this.addHandler = function () {
            _this.handler = (0, _outsideEvent.subscribe)(_this.node).onInside(_this.onClickInside).onOutside(_this.onClickOutside);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Contextmenu, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.addHandler();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.handler.unsubscribe();
            if (this.isOpen()) {
                this.addHandler();
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.handler.unsubscribe();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state,
                menu = _state.menu,
                position = _state.position,
                id = _state.id;


            if (!this.isOpen()) {
                return null;
            } else {
                var x = position.x,
                    y = position.y;

                var style = { left: x + 'px', top: y + 'px' };
                return _react2.default.createElement(
                    'ul',
                    { ref: function ref(_ref3) {
                            _this2.node = _ref3;
                        }, id: id, className: 'c-contextmenu c-menu sub', style: style },
                    _lodash2.default.map(menu, function (_ref2, idx) {
                        var itemId = _ref2.id,
                            text = _ref2.text,
                            className = _ref2.className,
                            isHeader = _ref2.isHeader,
                            disabled = _ref2.disabled;

                        return _react2.default.createElement(
                            'li',
                            { className: (0, _classnames2.default)(className, { header: isHeader, disabled: disabled }), id: itemId, key: idx },
                            text || id
                        );
                    })
                );
            }
        }
    }]);

    return Contextmenu;
}(_react2.default.Component);

Contextmenu.propTypes = {};
exports.default = {
    /**
     * Open context menu
     * @param {event|object} evt - event or simuated event with location information
     * @param {number} evt.pageX - x position to open menu at
     * @param {number} evt.pageY - y position to open menu at
     * @param {Array.<object>} menu - Menu to show on screen<br>Each item has the follow properties:
     * @param {string} menu.id - menu item id/key
     * @param {renderable} [menu.text=id] - menu item text
     * @param {function} [menu.action] - function to call when item is clicked
     * @param {string} [menu.className] - className for this item
     * @param {boolean} [menu.isHeader=false] - whether this item denotes a header for a group of items
     * @param {boolean} [menu.disabled=false] - whether this item is disabled
     * @param {string} [id] - id for the contextmenu
     *
     * @example
     *
    import {Contextmenu} from 'react-ui'
    React.createClass({
    getInitialState() {
        return {}
    },
    fetchMovieDetails(source) {
        // load data from source
        this.setState({source})
    },
    handleContextMenu(evt) {
        let menuItems = _.map(['imdb','rotten'], source=>{
            return {id:source, text:`Fetch ${source} Data`, action:this.fetchMovieDetails.bind(this,source)}
        })
        Contextmenu.open(evt, menuItems);
    },
    render() {
        return <span className='c-link' onContextMenu={this.handleContextMenu}>
            Right click on me
        </span>
    }
    })
       */
    open: function open(evt, menu, id) {
        evt.preventDefault && evt.preventDefault();
        if (!globalContextMenu) {
            var node = document.createElement('DIV');
            node.id = 'g-cm-container';
            document.body.appendChild(node);
            globalContextMenu = _reactDom2.default.render(_react2.default.createElement(Contextmenu, null), document.getElementById('g-cm-container'));
        }
        globalContextMenu.open({ x: evt.pageX, y: evt.pageY }, menu, id);
    },


    /**
     * Check if context menu is open
     * @return {boolean} Is open?
     *
     * @example
    console.log(Contextmenu.isOpen())
     */
    isOpen: function isOpen() {
        return globalContextMenu && globalContextMenu.isOpen();
    },


    /**
     * Close context menu if opened
     *
     * @example
    Contextmenu.close();
     */
    close: function close() {
        globalContextMenu && globalContextMenu.onClickOutside();
    }
};

/***/ }),

/***/ "../src/components/date-picker.js":
/*!****************************************!*\
  !*** ../src/components/date-picker.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _moment = __webpack_require__(/*! moment */ "../node_modules/moment/moment.js");

var _moment2 = _interopRequireDefault(_moment);

var _flatpickr = __webpack_require__(/*! flatpickr */ "../node_modules/flatpickr/dist/flatpickr.js");

var _flatpickr2 = _interopRequireDefault(_flatpickr);

var _flatpickrMin = __webpack_require__(/*! flatpickr/dist/flatpickr.min.css */ "../node_modules/flatpickr/dist/flatpickr.min.css");

var _flatpickrMin2 = _interopRequireDefault(_flatpickrMin);

var _zh = __webpack_require__(/*! flatpickr/dist/l10n/zh */ "../node_modules/flatpickr/dist/l10n/zh.js");

var _popover = __webpack_require__(/*! ./popover */ "../src/components/popover.js");

var _popover2 = _interopRequireDefault(_popover);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

var _inputHelper = __webpack_require__(/*! ../utils/input-helper */ "../src/utils/input-helper.js");

var _inputHelper2 = _interopRequireDefault(_inputHelper);

var _date = __webpack_require__(/*! ../utils/date */ "../src/utils/date.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // eslint-disable-line no-unused-vars

// Add more locales here


var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/date-picker');

var DATE_TIME_SUFFIX = {
    daySuffix: /(st)|(nd)|(rd)|(th)/g,
    timeSuffix: /(AM)|(PM)/ig

    /**
     * A React DatePicker Component, containing validating the input date<br>
     * Uses [flatpickr]{@link https://chmln.github.io/flatpickr/#options}
     *
     * @constructor
     * @param {string} [id] - Container element #id
     * @param {string} [className] - Classname for the container
     * @param {string} [defaultValue] - Default selected date
     * @param {string} [value] - Current selected date
     * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
     * @param {*} valueLink.value - value to update
     * @param {function} valueLink.requestChange - function to request value change
     * @param {boolean} [allowKeyIn=true] - Allow user key in to the from/to input?
     * @param {boolean} [disabled=false] - Is this field disabled?
     * @param {boolean} [readOnly=false] - Is this field readonly?
     * @param {boolean} [required=false] - Is this field required?
     * @param {function} [onChange] - Callback function when date is changed. <br> Required when value prop is supplied
     * @param {string} onChange.value - current value
     * @param {object} onChange.eventInfo - event related info
     * @param {object} onChange.eventInfo.before - previously enetered value
     * @param {string} [dateFormat='Y-m-d'] - Date format. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
     * @param {string} [timeFormat='H:i'] - Time format. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
     * @param {boolean} [enableTime=false] - Enable selection and display of time
     * @param {boolean} [enableAMPM=false] - Enable AM/PM option on calendar
     * @param {string} [locale] - Datepicker locale. Values can be 'en', 'zh', etc. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
     * @param {fuction} [t] - Transform/translate error into readable message.<br>
     * @param {object} t.params - Parameters relevant to the error code
     * @param {string} t.params.field - offending field id
     * @param {string} t.params.value - offending field value
     * @param {string} t.params.pattern - pattern the value was supposed to follow
     *
     * @example
    // controlled
    
    import {DatePicker} from 'react-ui'
    
    React.createClass({
        getInitialState() {
            return {
                date: '2017-03-20',
                datetime: '2017-03-20 16:01'
            }
        },
        handleChange(field, value) {
            this.setState({[field]: value})
        },
        render() {
            let {date, datetime} = this.state;
            return <div className='c-form'>
                <div>
                    <label htmlFor='date'>Select Date</label>
                    <DatePicker id='date'
                        onChange={this.handleChange.bind(this,'date')}
                        value={date}
                        t={(code, params) => {
                            if (code === 'missing')
                                return `Please input date`
                            else {
                                return `Invalid date format. Should be ${params.pattern}`
                            }
                        }}/>
                </div>
                <div>
                    <label htmlFor='datetime'>Select Date Time</label>
                    <DatePicker id='datetime'
                        onChange={this.handleChange.bind(this,'datetime')}
                        enableTime={true}
                        value={datetime}
                        t={(code, params) => {
                            if (code === 'missing')
                                return `Please input date`
                            else {
                                return `Invalid date format. Should be ${params.pattern}`
                            }
                        }}/>
                </div>
            </div>
        }
    })
     */

};
var DatePicker = function (_React$Component) {
    _inherits(DatePicker, _React$Component);

    function DatePicker(props) {
        _classCallCheck(this, DatePicker);

        var _this = _possibleConstructorReturn(this, (DatePicker.__proto__ || Object.getPrototypeOf(DatePicker)).call(this, props));

        _this.strToTimestamp = function (str) {
            var enableTime = _this.props.enableTime;

            var parsedStr = str.replace(DATE_TIME_SUFFIX.daySuffix, '');
            var momentFormat = enableTime ? _this.FORMAT.date + ' ' + _this.FORMAT.time : _this.FORMAT.date;
            return (0, _moment2.default)(parsedStr, momentFormat).valueOf();
        };

        _this.handleChange = function () {
            var onChange = _this.props.onChange;

            onChange(_this.date.value);
        };

        _this.handleInputChange = function (evt) {
            var required = _this.props.required;

            var newDate = evt.target.value;

            // Remove the day suffix since Date can't resolve it
            var parseDate = _this.strToTimestamp(newDate);

            var isValid = _this.validateDateFormat(newDate);
            var errMsg = _this.generateErrorMsg(newDate);

            if (!isNaN(parseDate)) {
                // Move the calendar view to the current value's location
                _this.datePicker.jumpToDate(parseDate);

                if (isValid) {
                    _popover2.default.close();

                    // setDate() accepts date string & Date object
                    // If set the 2nd parameter as true, it will recursively call itself here
                    _this.datePicker.setDate(parseDate, false);
                    _this.handleChange();
                } else {
                    _popover2.default.open(evt, _react2.default.createElement(
                        'span',
                        null,
                        errMsg
                    ), { pointy: true });
                }
            } else {
                if (required || newDate !== '') {
                    _popover2.default.open(evt, _react2.default.createElement(
                        'span',
                        null,
                        errMsg
                    ), { pointy: true });
                } else {
                    _popover2.default.close();
                }
            }
        };

        _this.handleBlur = function (evt) {
            _popover2.default.close();

            var newDate = evt.target.value;

            var isValid = _this.validateDateFormat(newDate);
            var prevDate = _this.state.prevDate;
            var required = _this.props.required;


            if (isValid) {
                // Prevent requiring double-click when select date
                if (newDate !== prevDate) {
                    _this.datePicker.setDate(newDate);
                    _this.setState({ prevDate: newDate });
                }
            } else {
                // Reset to previous valid value
                if (required) {
                    _this.datePicker.setDate(prevDate);
                } else {
                    _this.datePicker.setDate('');
                    _this.handleChange();
                }
            }
        };

        _this.validateDateFormat = function (dateStr) {
            var enableTime = _this.props.enableTime;

            var isValid = false;

            if (enableTime) {
                isValid = (0, _moment2.default)(dateStr, _this.FORMAT.date + ' ' + _this.FORMAT.time, true).isValid();

                // Momentjs validation accepts single (a|A|p|P) for AM/PM
                // This is for ensuring user input complete 'AM/PM' term when AM/PM is enabled
                if (_this.FORMAT.time.indexOf('A') !== -1 && dateStr.search(DATE_TIME_SUFFIX.timeSuffix) === -1) {
                    isValid = false;
                }
            } else {
                isValid = (0, _moment2.default)(dateStr, '' + _this.FORMAT.date, true).isValid();
            }

            return isValid;
        };

        _this.generateErrorMsg = function (dateStr) {
            var _this$props = _this.props,
                id = _this$props.id,
                enableTime = _this$props.enableTime,
                required = _this$props.required,
                t = _this$props.t;

            var datePattern = _this.FORMAT.date,
                timePattern = _this.FORMAT.time.indexOf('A') !== -1 ? _this.FORMAT.time.replace('A', 'AM/PM') : _this.FORMAT.time;

            var pattern = enableTime ? datePattern + ' ' + timePattern : datePattern;

            return _inputHelper2.default.validateField(dateStr, { name: id, type: 'date', required: required, pattern: pattern }, t ? { et: t } : true);
        };

        var value = props.value;


        _this.state = {
            prevDate: value
        };
        return _this;
    }

    _createClass(DatePicker, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var _props = this.props,
                dateFormat = _props.dateFormat,
                timeFormat = _props.timeFormat,
                enableTime = _props.enableTime,
                enableAMPM = _props.enableAMPM,
                allowInput = _props.allowKeyIn,
                locale = _props.locale;


            var loc = null;
            switch (locale) {
                case 'zh':
                    loc = _zh.Mandarin;break;
                default:
                    loc = null;
            }

            this.FORMAT = (0, _date.flatpickrToMomentToken)(dateFormat, timeFormat, enableTime);

            if (enableTime) {
                dateFormat = dateFormat + ' ' + timeFormat;
            }

            this.datePicker = (0, _flatpickr2.default)(this.date, {
                enableTime: enableTime,
                allowInput: allowInput,
                dateFormat: dateFormat,
                locale: loc,
                time_24hr: !enableAMPM,
                onChange: function onChange() {
                    _this2.handleChange();
                }
            });
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var value = nextProps.value,
                locale = nextProps.locale;


            var loc = null;
            switch (locale) {
                case 'zh':
                    loc = _zh.Mandarin;break;
                default:
                    loc = null;
            }

            this.datePicker.set('locale', loc);
            this.datePicker.setDate(this.strToTimestamp(value), false);
            this.setState({
                prevDate: value
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.datePicker.destroy();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props2 = this.props,
                id = _props2.id,
                value = _props2.value,
                className = _props2.className,
                readOnly = _props2.readOnly,
                disabled = _props2.disabled,
                required = _props2.required,
                allowKeyIn = _props2.allowKeyIn;


            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-date-picker', className) },
                _react2.default.createElement('input', {
                    id: id,
                    type: 'text',
                    ref: function ref(_ref) {
                        _this3.date = _ref;
                    },
                    disabled: disabled,
                    readOnly: readOnly,
                    required: required,
                    onChange: allowKeyIn ? this.handleInputChange : null,
                    onBlur: this.handleBlur,
                    defaultValue: value }),
                _react2.default.createElement('i', { className: 'fg fg-calendar', onClick: function onClick() {
                        _this3.date.focus();
                    } })
            );
        }
    }]);

    return DatePicker;
}(_react2.default.Component);

DatePicker.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    value: _propTypes3.SIMPLE_VALUE_PROP,
    allowKeyIn: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    readOnly: _propTypes2.default.bool,
    required: _propTypes2.default.bool,
    onChange: _propTypes2.default.func,
    dateFormat: _propTypes2.default.string,
    timeFormat: _propTypes2.default.string,
    enableTime: _propTypes2.default.bool,
    enableAMPM: _propTypes2.default.bool,
    locale: _propTypes2.default.string,
    t: _propTypes2.default.func
};
DatePicker.defaultProps = {
    dateFormat: 'Y-m-d',
    timeFormat: 'H:i',
    disabled: false,
    readOnly: false,
    required: false,
    allowKeyIn: true,
    enableTime: false,
    enableAMPM: false,
    locale: 'en'
};
exports.default = (0, _propWire.wireValue)(DatePicker);

/***/ }),

/***/ "../src/components/date-range.js":
/*!***************************************!*\
  !*** ../src/components/date-range.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _moment = __webpack_require__(/*! moment */ "../node_modules/moment/moment.js");

var _moment2 = _interopRequireDefault(_moment);

var _flatpickr = __webpack_require__(/*! flatpickr */ "../node_modules/flatpickr/dist/flatpickr.js");

var _flatpickr2 = _interopRequireDefault(_flatpickr);

var _flatpickrMin = __webpack_require__(/*! flatpickr/dist/flatpickr.min.css */ "../node_modules/flatpickr/dist/flatpickr.min.css");

var _flatpickrMin2 = _interopRequireDefault(_flatpickrMin);

var _zh = __webpack_require__(/*! flatpickr/dist/l10n/zh */ "../node_modules/flatpickr/dist/l10n/zh.js");

var _popover = __webpack_require__(/*! ./popover */ "../src/components/popover.js");

var _popover2 = _interopRequireDefault(_popover);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

var _inputHelper = __webpack_require__(/*! ../utils/input-helper */ "../src/utils/input-helper.js");

var _inputHelper2 = _interopRequireDefault(_inputHelper);

var _date = __webpack_require__(/*! ../utils/date */ "../src/utils/date.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // eslint-disable-line no-unused-vars

// Add more locales here


var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/date-range');

var DATE_PROP_TYPE = _propTypes2.default.shape({
    from: _propTypes3.SIMPLE_VALUE_PROP,
    to: _propTypes3.SIMPLE_VALUE_PROP
});

var DATE_TIME_SUFFIX = {
    daySuffix: /(st)|(nd)|(rd)|(th)/g,
    timeSuffix: /(AM)|(PM)/ig

    /**
     * A React DateRange Component, containing a 'from' date input and a 'to' date input<br>
     * Uses [flatpickr]{@link https://chmln.github.io/flatpickr/#options}
     *
     * @constructor
     * @param {string} [id] - Container element #id
     * @param {string} [className] - Classname for the container
     * @param {object} [defaultValue] - Default selected range
     * @param {string} defaultValue.from - Default selected from
     * @param {string} defaultValue.to - Default selected to
     * @param {object} [value] - Current selected range
     * @param {string} value.from - Current selected from
     * @param {string} value.to - Current selected to
     * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
     * @param {*} valueLink.value - value to update
     * @param {function} valueLink.requestChange - function to request value change
     * @param {boolean} [allowKeyIn=true] - Allow user key in to the from/to input?
     * @param {boolean} [disabled=false] - Is this field disabled?
     * @param {boolean} [readOnly=false] - Is this field readonly?
     * @param {boolean} [required=false] - Is this field required?
     * @param {function} [onChange] - Callback function when from/to is changed. <br> Required when value prop is supplied
     * @param {object} onChange.value - current value
     * @param {string} onChange.value.from - current from
     * @param {string} onChange.value.to - current to
     * @param {object} onChange.eventInfo - event related info
     * @param {object} onChange.eventInfo.before - previously enetered value
     * @param {string} [dateFormat='Y-m-d'] - Date format. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
     * @param {string} [timeFormat='H:i'] - Time format. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
     * @param {boolean} [enableTime=false] - Enable selection and display of time
     * @param {boolean} [enableAMPM=false] - Enable AM/PM option on calendar
     * @param {string} [locale] - Datepicker locale. Values can be 'en', 'zh', etc. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
     * @param {fuction} [t] - Transform/translate error into readable message.<br>
     * @param {object} t.params - Parameters relevant to the error code
     * @param {string} t.params.field - offending field id
     * @param {string} t.params.value - offending field value
     * @param {string} t.params.pattern - pattern the value was supposed to follow
     *
     * @example
    // controlled
    
    import {DateRange} from 'react-ui'
    
    React.createClass({
        getInitialState() {
            return {
                date:{
                    from:'2012-04-26',
                    to:'2012-10-26'
                },
                datetime:{
                    from:'2012-10-26 12:00',
                    to:'2012-10-26 17:00'
                }
            }
        },
        handleChange(field, value) {
            this.setState({[field]:value})
        },
        render() {
            let {date, datetime} = this.state;
            return <div className='c-form'>
                <div>
                    <label htmlFor='date'>Select Date Range</label>
                    <DateRange id='date'
                        onChange={this.handleChange.bind(this,'date')}
                        value={date}
                        t={(code, params) => {
                            if (code === 'missing')
                                return `Please input date`
                            else {
                                return `Invalid date format. Should be ${params.pattern}`
                            }
                        }}/>
                </div>
                <div>
                    <label htmlFor='datetime'>Select Date Time Range</label>
                    <DateRange id='datetime'
                        onChange={this.handleChange.bind(this,'datetime')}
                        enableTime={true}
                        value={datetime}
                        t={(code, params) => {
                            if (code === 'missing')
                                return `Please input date`
                            else {
                                return `Invalid date format. Should be ${params.pattern}`
                            }
                        }}/>
                </div>
            </div>
        }
    })
     */

};
var DateRange = function (_React$Component) {
    _inherits(DateRange, _React$Component);

    function DateRange(props) {
        _classCallCheck(this, DateRange);

        var _this = _possibleConstructorReturn(this, (DateRange.__proto__ || Object.getPrototypeOf(DateRange)).call(this, props));

        _this.strToTimestamp = function (str) {
            var enableTime = _this.props.enableTime;

            var parsedStr = str.replace(DATE_TIME_SUFFIX.daySuffix, '');
            var momentFormat = enableTime ? _this.FORMAT.date + ' ' + _this.FORMAT.time : _this.FORMAT.date;
            return (0, _moment2.default)(parsedStr, momentFormat).valueOf();
        };

        _this.handleChange = function () {
            var onChange = _this.props.onChange;

            onChange({ from: _this.dateFrom.value, to: _this.dateTo.value });
        };

        _this.handleInputChange = function (type, evt) {
            var required = _this.props.required;

            var newDate = evt.target.value;

            // Remove the day suffix since Date can't resolve it
            var parseDate = _this.strToTimestamp(newDate);

            var isValid = _this.validateDateFormat(newDate);
            var errMsg = _this.generateErrorMsg(type, newDate);

            if (!isNaN(parseDate)) {
                // Move the calendar view to the current value's location
                _this.datePicker[type].jumpToDate(parseDate);

                if (isValid) {
                    _popover2.default.closeId('err-' + type);

                    // setDate() accepts date string & Date object
                    // If set the 2nd parameter as true, it will recursively call itself here
                    _this.datePicker[type].setDate(parseDate, false);
                    _this.handleChange();

                    _this.checkCross(type);
                } else {
                    _popover2.default.openId('err-' + type, evt, _react2.default.createElement(
                        'span',
                        null,
                        errMsg
                    ), { pointy: true });
                }
            } else {
                if (required || newDate !== '') {
                    _popover2.default.openId('err-' + type, evt, _react2.default.createElement(
                        'span',
                        null,
                        errMsg
                    ), { pointy: true });
                } else {
                    _popover2.default.closeId('err-' + type);
                }
            }
        };

        _this.handleBlur = function (type, evt) {
            _popover2.default.closeId('err-' + type);

            var newDate = evt.target.value;

            var isValid = _this.validateDateFormat(newDate);
            var field = type === 'from' ? 'prevFrom' : 'prevTo';
            var prevDate = type === 'from' ? _this.state.prevFrom : _this.state.prevTo;
            var required = _this.props.required;


            if (isValid) {
                // Prevent requiring double-click when select date
                if (newDate !== prevDate) {
                    _this.datePicker[type].setDate(newDate);
                    _this.setState(_defineProperty({}, field, newDate));
                }

                _this.checkCross(type);
            } else {
                // Reset to previous valid value
                if (required) {
                    _this.datePicker[type].setDate(prevDate);
                } else {
                    _this.datePicker[type].setDate('');
                    _this.handleChange();
                }
            }
        };

        _this.validateDateFormat = function (dateStr) {
            var enableTime = _this.props.enableTime;

            var isValid = false;

            if (enableTime) {
                isValid = (0, _moment2.default)(dateStr, _this.FORMAT.date + ' ' + _this.FORMAT.time, true).isValid();

                // Momentjs validation accepts single (a|A|p|P) for AM/PM
                // This is for ensuring user input complete 'AM/PM' term when AM/PM is enabled
                if (_this.FORMAT.time.indexOf('A') !== -1 && dateStr.search(DATE_TIME_SUFFIX.timeSuffix) === -1) {
                    isValid = false;
                }
            } else {
                isValid = (0, _moment2.default)(dateStr, '' + _this.FORMAT.date, true).isValid();
            }

            return isValid;
        };

        _this.checkCross = function (type) {
            var dateFrom = _this.strToTimestamp(_this.dateFrom.value),
                dateTo = _this.strToTimestamp(_this.dateTo.value);

            if (dateFrom !== dateTo) {
                if (type === 'from') {
                    var isAfter = (0, _moment2.default)(dateFrom).isAfter(dateTo);

                    if (isAfter) {
                        _this.datePicker.to.setDate(dateFrom, false);
                        _this.handleChange();
                    }
                } else {
                    var isBefore = (0, _moment2.default)(dateTo).isBefore(dateFrom);

                    if (isBefore) {
                        _this.datePicker.from.setDate(dateTo, false);
                        _this.handleChange();
                    }
                }
            }
        };

        _this.generateErrorMsg = function (type, dateStr) {
            var _this$props = _this.props,
                id = _this$props.id,
                enableTime = _this$props.enableTime,
                required = _this$props.required,
                t = _this$props.t;

            var datePattern = _this.FORMAT.date,
                timePattern = _this.FORMAT.time.indexOf('A') !== -1 ? _this.FORMAT.time.replace('A', 'AM/PM') : _this.FORMAT.time;

            var pattern = enableTime ? datePattern + ' ' + timePattern : datePattern;

            return _inputHelper2.default.validateField(dateStr, { name: id + '-' + type, type: 'date', required: required, pattern: pattern }, t ? { et: t } : true);
        };

        var value = props.value;


        _this.state = {
            prevFrom: value.from,
            prevTo: value.to
        };
        return _this;
    }

    _createClass(DateRange, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var _props = this.props,
                dateFormat = _props.dateFormat,
                timeFormat = _props.timeFormat,
                enableTime = _props.enableTime,
                enableAMPM = _props.enableAMPM,
                allowInput = _props.allowKeyIn,
                locale = _props.locale;


            var loc = null;
            switch (locale) {
                case 'zh':
                    loc = _zh.Mandarin;break;
                default:
                    loc = null;
            }

            this.FORMAT = (0, _date.flatpickrToMomentToken)(dateFormat, timeFormat, enableTime);

            if (enableTime) {
                dateFormat = dateFormat + ' ' + timeFormat;
            }

            this.datePicker = {
                from: (0, _flatpickr2.default)(this.dateFrom, {
                    enableTime: enableTime,
                    allowInput: allowInput,
                    dateFormat: dateFormat,
                    locale: loc,
                    time_24hr: !enableAMPM,
                    onChange: function onChange() {
                        _this2.checkCross('from');
                        _this2.handleChange();
                    }
                }),
                to: (0, _flatpickr2.default)(this.dateTo, {
                    enableTime: enableTime,
                    allowInput: allowInput,
                    dateFormat: dateFormat,
                    locale: loc,
                    time_24hr: !enableAMPM,
                    onChange: function onChange() {
                        _this2.checkCross('to');
                        _this2.handleChange();
                    }
                })
            };
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var value = nextProps.value,
                locale = nextProps.locale;


            var loc = null;
            switch (locale) {
                case 'zh':
                    loc = _zh.Mandarin;break;
                default:
                    loc = null;
            }

            this.datePicker.from.set('locale', loc);
            this.datePicker.to.set('locale', loc);
            this.datePicker.from.setDate(this.strToTimestamp(value.from), false);
            this.datePicker.to.setDate(this.strToTimestamp(value.to), false);

            this.setState({
                prevFrom: value.from,
                prevTo: value.to
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.datePicker.from.destroy();
            this.datePicker.to.destroy();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props2 = this.props,
                id = _props2.id,
                value = _props2.value,
                className = _props2.className,
                readOnly = _props2.readOnly,
                disabled = _props2.disabled,
                required = _props2.required,
                allowKeyIn = _props2.allowKeyIn,
                autoComplete = _props2.autoComplete;


            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-date-range', className) },
                _react2.default.createElement(
                    'span',
                    { className: 'c-date-picker' },
                    _react2.default.createElement('input', {
                        id: id + '-from',
                        type: 'text',
                        ref: function ref(_ref) {
                            _this3.dateFrom = _ref;
                        },
                        disabled: disabled,
                        readOnly: readOnly,
                        required: required,
                        onChange: allowKeyIn ? this.handleInputChange.bind(this, 'from') : null,
                        onBlur: this.handleBlur.bind(this, 'from'),
                        defaultValue: value.from,
                        autoComplete: autoComplete }),
                    _react2.default.createElement('i', { className: 'fg fg-calendar', onClick: function onClick() {
                            _this3.dateFrom.focus();
                        } })
                ),
                _react2.default.createElement(
                    'span',
                    { className: 'between' },
                    '~'
                ),
                _react2.default.createElement(
                    'span',
                    { className: 'c-date-picker' },
                    _react2.default.createElement('input', {
                        id: id + '-to',
                        type: 'text',
                        ref: function ref(_ref2) {
                            _this3.dateTo = _ref2;
                        },
                        disabled: disabled,
                        readOnly: readOnly,
                        required: required,
                        onChange: allowKeyIn ? this.handleInputChange.bind(this, 'to') : null,
                        onBlur: this.handleBlur.bind(this, 'to'),
                        defaultValue: value.to,
                        autoComplete: autoComplete }),
                    _react2.default.createElement('i', { className: 'fg fg-calendar', onClick: function onClick() {
                            _this3.dateTo.focus();
                        } })
                )
            );
        }
    }]);

    return DateRange;
}(_react2.default.Component);

DateRange.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    value: DATE_PROP_TYPE,
    allowKeyIn: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    readOnly: _propTypes2.default.bool,
    required: _propTypes2.default.bool,
    onChange: _propTypes2.default.func,
    dateFormat: _propTypes2.default.string,
    timeFormat: _propTypes2.default.string,
    enableTime: _propTypes2.default.bool,
    enableAMPM: _propTypes2.default.bool,
    locale: _propTypes2.default.string,
    autoComplete: _propTypes2.default.string,
    t: _propTypes2.default.func
};
DateRange.defaultProps = {
    dateFormat: 'Y-m-d',
    timeFormat: 'H:i',
    disabled: false,
    readOnly: false,
    required: false,
    allowKeyIn: true,
    enableTime: false,
    enableAMPM: false,
    locale: 'en',
    autoComplete: 'off'
};
exports.default = (0, _propWire.wire)(DateRange, 'value', {});

/***/ }),

/***/ "../src/components/dropdown.js":
/*!*************************************!*\
  !*** ../src/components/dropdown.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

var _listNormalizer = __webpack_require__(/*! ../hoc/list-normalizer */ "../src/hoc/list-normalizer.js");

var _listNormalizer2 = _interopRequireDefault(_listNormalizer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/dropdown');

/**
 * A React (single-select) DropDown List
 * @constructor
 * @param {string} [id] - Input element #id
 * @param {string} [name] - Input element name
 * @param {number} [size=1] - Number of items to display
 * @param {Array.<object>} list - List of items
 * @param {string | number} list.value - item value
 * @param {string} list.text - item display text
 * @param {string} [className] - Classname for the container
 * @param {string} [defaultText] - Default text to display when nothing is selected
 * @param {string|number} [defaultValue] - Default selected value
 * @param {string|number} [value] - Current selected value
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean} [required=false] - Is this field mandatory?
 * @param {boolean} [disabled=false] - Is this field disabled?
 * @param {boolean} [readOnly=false] - Is this field readonly?
 * @param {function} [onChange] - Callback function when item is selected. <br> Required when value prop is supplied
 * @param {string|number} onChange.value - selected value
 * @param {object} onChange.eventInfo - event related info
 * @param {string|number} onChange.eventInfo.before - previously selected value
 *
 * @example
// controlled

import {Dropdown} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            movie:'',
            director:''
        }
    },
    handleChange(field, value) {
        this.setState({[field]:value})
    },
    render() {
        let {movie, director} = this.state;
        return <div className='c-form'>
            <div>
                <label htmlFor='movie'>Select movie (optional)</label>
                <Dropdown id='movie'
                    list={[
                        {value:'fd',text:'Finding Dory'},
                        {value:'woo',text:'Wizard of Oz'},
                        {value:'ck',text:'Citizen Kane'}
                    ]}
                    onChange={this.handleChange.bind(this,'movie')}
                    defaultValue='fd'
                    value={movie}/>
            </div>
            <div>
                <label htmlFor='director'>Select director (mandatory)</label>
                <Dropdown id='director'
                    list={[
                        {value:'a',text:'Steven Spielberg'},
                        {value:'b',text:'Spike'},
                        {value:'c',text:'Lynch'},
                        {value:'d',text:'Bergman'}
                    ]}
                    size={3}
                    required={true}
                    onChange={this.handleChange.bind(this,'director')}
                    defaultText='Please select a director'
                    value={director}/>
            </div>
        </div>
    }
})
 */

var Dropdown = function (_React$Component) {
    _inherits(Dropdown, _React$Component);

    function Dropdown() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Dropdown);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Dropdown.__proto__ || Object.getPrototypeOf(Dropdown)).call.apply(_ref, [this].concat(args))), _this), _this.handleChange = function (evt) {
            var onChange = _this.props.onChange;

            onChange(evt.target.value);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Dropdown, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                name = _props.name,
                size = _props.size,
                list = _props.list,
                value = _props.value,
                disabled = _props.disabled,
                readOnly = _props.readOnly,
                required = _props.required,
                defaultText = _props.defaultText,
                className = _props.className;


            var found = false;
            if (value != null) {
                found = _lodash2.default.find(list, function (item) {
                    return item.value + '' === value + '';
                });
            }

            return _react2.default.createElement(
                'select',
                {
                    id: id,
                    name: name,
                    className: (0, _classnames2.default)({ invalid: !found && required }, className),
                    onChange: readOnly ? null : this.handleChange,
                    required: required,
                    value: value,
                    size: size,
                    readOnly: readOnly,
                    disabled: readOnly || disabled },
                (!found || !required) && _react2.default.createElement(
                    'option',
                    { key: '_', value: '' },
                    defaultText || ''
                ),
                _lodash2.default.map(list, function (_ref2) {
                    var itemValue = _ref2.value,
                        itemText = _ref2.text;

                    return _react2.default.createElement(
                        'option',
                        { key: itemValue, value: itemValue },
                        itemText
                    );
                })
            );
        }
    }]);

    return Dropdown;
}(_react2.default.Component);

Dropdown.propTypes = {
    id: _propTypes2.default.string,
    name: _propTypes2.default.string,
    size: _propTypes2.default.number,
    list: _propTypes3.LIST_PROP,
    className: _propTypes2.default.string,
    defaultText: _propTypes3.SIMPLE_VALUE_PROP,
    value: _propTypes3.SIMPLE_VALUE_PROP,
    required: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    readOnly: _propTypes2.default.bool,
    onChange: _propTypes2.default.func
};
Dropdown.defaultProps = {
    required: false,
    disabled: false,
    readOnly: false,
    size: 1
};
exports.default = (0, _propWire.wireValue)((0, _listNormalizer2.default)(Dropdown));

/***/ }),

/***/ "../src/components/file-input.js":
/*!***************************************!*\
  !*** ../src/components/file-input.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _popover = __webpack_require__(/*! ./popover */ "../src/components/popover.js");

var _popover2 = _interopRequireDefault(_popover);

var _inputHelper = __webpack_require__(/*! ../utils/input-helper */ "../src/utils/input-helper.js");

var _inputHelper2 = _interopRequireDefault(_inputHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/file-input');

/**
 * A React file input
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [name] - FileInput element name
 * @param {string} [className] - Classname for the container
 * @param {string} [btnText='Choose file'] - Text on the button
 * @param {string} [placeholder] - Placeholder for the text field
 * @param {boolean} [required=false] - Is this field mandatory?
 * @param {boolean} [disabled=false] - Is file input disabled?
 * @param {boolean} [enableClear=true] - Can this field can be cleared?
 * @param {object} [validate] - Validation config
 * @param {number} [validate.max] - Maximum file size which unit is 'MB'
 * @param {string | Array.<string>} [validate.extension] - Accepted file format, e.g., '.mp3'; ['.jpg', '.png']
 * @param {fuction} [validate.t] - Transform/translate error into readable message.<br>
 * If not specified, error message will be `${validate.t.params.name} ${code}`<br>
 * For example see [i18next]{@link http://i18next.com/translate/} translator for generating error message.<br>
 * @param {'missing'|'file-too-large'|'file-wrong-format'} validate.t.code - Error code
 * @param {object} validate.t.params - Parameters relevant to the error code
 * @param {string} validate.t.params.field - offending field name/id
 * @param {object} validate.t.params.value - offending file object
 * @param {number} [validate.t.params.max] - configured maximum file size which unit is MB
 * @param {string} [validate.t.params.extension] - configured accepted file extension
 * @param {function} [onChange] - Callback function when file is changed
 * @param {object} onChange.file - updated file
 * @param {object} onChange.eventInfo - event related info
 * @param {object} onChange.eventInfo.before - previous file
 *
 *
 * @example
// controlled

import {FileInput} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            name: '',
            type: '',
            size: 0
        }
    },
    handleChange(file) {
        this.setState({
            name: file ? file.name : '',
            type: file ? file.type : '',
            size: file ? file.size : 0
        })
    },
    render() {
        return <div className='c-flex aic'>
            <FileInput
                onChange={this.handleChange} required={true} name='fileDemo'
                validate={{
                    max: 10,
                    extension: ['.mp3', '.wma'],
                    t: (code, params) => {
                        if (code === 'file-too-large') {
                            return `File size should be lower than ${params.max} MB`
                        }
                        else {
                            return `File format should be ${params.extension}`
                        }
                    }
                }}
            />
        </div>
    }
})
 */

var FileInput = function (_React$Component) {
    _inherits(FileInput, _React$Component);

    function FileInput() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, FileInput);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = FileInput.__proto__ || Object.getPrototypeOf(FileInput)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            file: null,
            isInvalid: false
        }, _this.handleChange = function (e) {
            var fileInput = _this.fileInput,
                fileSub = _this.fileSub;

            var _this$props = _this.props,
                validate = _this$props.validate,
                onChange = _this$props.onChange;


            if (fileInput.files.length > 0) {
                var file = fileInput.files[0];
                var error = validate ? _this.validateFile(file) : null;

                if (error) {
                    _this.fileInput.value = '';
                    _this.fileSub.value = '';

                    _popover2.default.open(e, error, { pointy: true });

                    _this.setState({
                        isInvalid: true
                    });
                } else {
                    _popover2.default.close();
                    fileSub.value = file.name;

                    if (onChange) {
                        onChange(file);
                    }

                    _this.setState({
                        file: file,
                        isInvalid: false
                    });
                }
            }
        }, _this.handleBlur = function () {
            _popover2.default.close();
            _this.setState({ isInvalid: false });
        }, _this.handleClick = function () {
            _popover2.default.close();

            var onChange = _this.props.onChange;


            _this.fileInput.value = '';
            _this.fileSub.value = '';

            if (onChange) {
                onChange(null);
            }

            _this.setState({
                file: null,
                isInvalid: false
            });
        }, _this.validateFile = function (file) {
            var _this$props2 = _this.props,
                id = _this$props2.id,
                name = _this$props2.name,
                required = _this$props2.required,
                _this$props2$validate = _this$props2.validate,
                t = _this$props2$validate.t,
                params = _objectWithoutProperties(_this$props2$validate, ['t']);

            var msg = _inputHelper2.default.validateField(file, _extends({ name: name || id, type: 'file', required: required }, params), t ? { et: t } : true);

            if (msg) {
                return _react2.default.createElement(
                    'span',
                    null,
                    msg
                );
            }
            return null;
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(FileInput, [{
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _popover2.default.close();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                name = _props.name,
                className = _props.className,
                placeholder = _props.placeholder,
                btnText = _props.btnText,
                disabled = _props.disabled,
                enableClear = _props.enableClear,
                required = _props.required,
                validate = _props.validate;
            var _state = this.state,
                file = _state.file,
                isInvalid = _state.isInvalid;

            var hasFile = !!file;
            var extension = validate && validate.extension ? validate.extension : '';

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-file-input', { disabled: disabled, clearable: enableClear }, className) },
                _react2.default.createElement('input', {
                    type: 'file', name: name, ref: function ref(_ref2) {
                        _this2.fileInput = _ref2;
                    }, accept: extension,
                    onChange: this.handleChange,
                    onBlur: this.handleBlur,
                    disabled: disabled,
                    required: required }),
                _react2.default.createElement(
                    'button',
                    { disabled: disabled },
                    btnText
                ),
                _react2.default.createElement('input', {
                    type: 'text',
                    ref: function ref(_ref3) {
                        _this2.fileSub = _ref3;
                    },
                    className: (0, _classnames2.default)({ invalid: isInvalid }),
                    placeholder: placeholder,
                    disabled: disabled,
                    readOnly: true }),
                enableClear && hasFile && _react2.default.createElement('i', { className: (0, _classnames2.default)('c-link inline fg fg-close'), onClick: this.handleClick })
            );
        }
    }]);

    return FileInput;
}(_react2.default.Component);

FileInput.propTypes = {
    id: _propTypes2.default.string,
    name: _propTypes2.default.string,
    className: _propTypes2.default.string,
    btnText: _propTypes2.default.string,
    placeholder: _propTypes2.default.string,
    required: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    enableClear: _propTypes2.default.bool,
    validate: _propTypes2.default.shape({
        max: _propTypes2.default.number,
        extension: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.arrayOf(_propTypes2.default.string)]),
        t: _propTypes2.default.func
    }),
    onChange: _propTypes2.default.func
};
FileInput.defaultProps = {
    btnText: 'Choose file',
    disabled: false,
    enableClear: true,
    required: false,
    validate: {}
};
exports.default = FileInput;

/***/ }),

/***/ "../src/components/form.js":
/*!*********************************!*\
  !*** ../src/components/form.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _reactAddonsCreateFragment = __webpack_require__(/*! react-addons-create-fragment */ "../node_modules/react-addons-create-fragment/index.js");

var _reactAddonsCreateFragment2 = _interopRequireDefault(_reactAddonsCreateFragment);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _objectPathImmutable = __webpack_require__(/*! object-path-immutable */ "../node_modules/object-path-immutable/index.js");

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _index = __webpack_require__(/*! ./index */ "../src/components/index.js");

var _index2 = _interopRequireDefault(_index);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/form');

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

var Form = function (_React$Component) {
    _inherits(Form, _React$Component);

    function Form() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Form);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Form.__proto__ || Object.getPrototypeOf(Form)).call.apply(_ref, [this].concat(args))), _this), _this.handleChange = function (key, merge, iValue) {
            var info = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var _this$props = _this.props,
                onChange = _this$props.onChange,
                value = _this$props.value,
                actions = _this$props.actions;

            var eventInfo = {
                field: _extends({
                    name: key,
                    value: iValue
                }, info),
                isComplete: _lodash2.default.get(info, 'isComplete', false)
            };

            var newValue = void 0;
            if (merge && _lodash2.default.isObject(iValue)) {
                newValue = _lodash2.default.mergeWith({}, value, iValue, function (objValue, srcValue) {
                    if (_lodash2.default.isArray(objValue)) {
                        return srcValue;
                    }
                    return undefined;
                });
            } else {
                newValue = _objectPathImmutable2.default.set(value, key, iValue);
            }

            var completeAction = _lodash2.default.find(actions, { triggerOnComplete: true });
            if (eventInfo.isComplete && completeAction) {
                onChange(newValue, eventInfo);
                setTimeout(function () {
                    completeAction.handler(newValue);
                }, 0);
            } else {
                onChange(newValue, eventInfo);
            }
        }, _this.isAligned = function () {
            var formClassName = _this.props.formClassName;

            return _lodash2.default.indexOf(_lodash2.default.split(formClassName, ' '), 'aligned') >= 0;
        }, _this.renderField = function (id, fieldCfg, dataSet, fieldDefaultClassName) {
            var createContainer = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

            if (!fieldCfg) {
                log.error('renderField:: config for field \'' + id + '\' missing');
                return null;
            }

            var _fieldCfg$label = fieldCfg.label,
                label = _fieldCfg$label === undefined ? fieldCfg.merge ? '' : id : _fieldCfg$label,
                _fieldCfg$merge = fieldCfg.merge,
                merge = _fieldCfg$merge === undefined ? false : _fieldCfg$merge,
                _fieldCfg$className = fieldCfg.className,
                fieldClassName = _fieldCfg$className === undefined ? fieldDefaultClassName : _fieldCfg$className,
                formatter = fieldCfg.formatter,
                editor = fieldCfg.editor,
                _fieldCfg$props = fieldCfg.props,
                props = _fieldCfg$props === undefined ? {} : _fieldCfg$props;


            var value = merge ? dataSet : _lodash2.default.get(dataSet, id, undefined); // to support traverse of nested field properties, eg a.b.c
            var fieldContent = value;

            if (formatter) {
                if (_lodash2.default.isFunction(formatter)) {
                    fieldContent = formatter(value, dataSet);
                } else {
                    fieldContent = formatter;
                }
            } else if (editor) {
                var _extends2;

                if (_lodash2.default.isFunction(props)) {
                    props = props(dataSet);
                }
                // TODO: check editor must be ReactClass
                var propValueName = 'value';
                if (_lodash2.default.isString(editor)) {
                    if (editor === 'Checkbox') {
                        propValueName = 'checked';
                    }
                    if (editor === 'ToggleButton') {
                        propValueName = 'on';
                    }
                }
                props = _extends({}, props, (_extends2 = { id: id }, _defineProperty(_extends2, propValueName, value), _defineProperty(_extends2, 'onChange', _this.handleChange.bind(_this, id, merge)), _extends2));

                fieldContent = _react2.default.createElement(_lodash2.default.isString(editor) && _lodash2.default.has(_index2.default, editor) ? _index2.default[editor] : editor, props);
            }

            var required = _lodash2.default.get(fieldCfg, 'props.required', false);
            if (createContainer) {
                return _react2.default.createElement(
                    'div',
                    { key: id, className: (0, _classnames2.default)(id, fieldClassName) },
                    _react2.default.createElement(
                        'label',
                        { className: (0, _classnames2.default)({ required: required }), htmlFor: id },
                        label
                    ),
                    fieldContent
                );
            } else {
                return (0, _reactAddonsCreateFragment2.default)({
                    label: _react2.default.createElement(
                        'label',
                        { className: (0, _classnames2.default)({ required: required }), htmlFor: id },
                        label
                    ),
                    content: fieldContent
                });
            }
        }, _this.renderRow = function (fields, dataSet, fieldClassName, rowKey) {
            var renderedFields = _lodash2.default.map(fields, function (fieldCfg, fieldKey) {
                return _this.renderField(fieldKey, fieldCfg, dataSet, fieldClassName, !rowKey);
            });
            if (rowKey) {
                return _react2.default.createElement(
                    'div',
                    { key: rowKey, className: (0, _classnames2.default)('row', 'row-' + rowKey, fieldClassName, _lodash2.default.keys(fields)) },
                    renderedFields
                );
            } else {
                return renderedFields;
            }
        }, _this.renderForm = function (extraFormClassName) {
            var _this$props2 = _this.props,
                formClassName = _this$props2.formClassName,
                fieldClassName = _this$props2.fieldClassName,
                fields = _this$props2.fields,
                columns = _this$props2.columns,
                value = _this$props2.value;

            var aligned = _this.isAligned();

            return _react2.default.createElement(
                'div',
                { className: (0, _classnames2.default)(formClassName, extraFormClassName, 'c-form') },
                aligned ? _lodash2.default.map(_lodash2.default.groupBy(_lodash2.default.map(_lodash2.default.keys(fields), function (k, i) {
                    return _extends({ key: k, idx: Math.floor(i / columns) }, fields[k]);
                }), 'idx'), function (row, idx) {
                    return _this.renderRow(_lodash2.default.keyBy(row, 'key'), value, fieldClassName, idx);
                }) : _this.renderRow(fields, value, fieldClassName)
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Form, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                value = _props.value,
                header = _props.header,
                footer = _props.footer,
                className = _props.className,
                controlClassName = _props.controlClassName,
                actions = _props.actions,
                onChange = _props.onChange;

            var actionNodes = _lodash2.default.map(actions, function (action, actionKey) {
                return _react2.default.createElement(
                    'button',
                    {
                        className: (0, _classnames2.default)(controlClassName, action.className),
                        disabled: action.disabled,
                        ref: function ref(_ref2) {
                            _this2[actionKey + 'Btn'] = _ref2;
                        },
                        key: actionKey,
                        name: actionKey,
                        onClick: function onClick() {
                            if (action.clearForm) {
                                onChange({});
                            }
                            if (action.handler) {
                                action.handler(value);
                            }
                        } },
                    action.text || actionKey
                );
            });

            var hasActions = !_lodash2.default.isEmpty(actionNodes);

            if (!hasActions && !footer && !header) {
                return this.renderForm(className);
            }

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-box c-form-container', className) },
                header && _react2.default.createElement(
                    'header',
                    null,
                    header
                ),
                _react2.default.createElement(
                    'div',
                    { className: (0, _classnames2.default)('content nopad') },
                    this.renderForm()
                ),
                (hasActions || footer) && _react2.default.createElement(
                    'footer',
                    null,
                    footer && _react2.default.createElement('div', { className: (0, _classnames2.default)('c-info'), dangerouslySetInnerHTML: { __html: footer } }),
                    actionNodes
                )
            );
        }
    }]);

    return Form;
}(_react2.default.Component);

Form.propTypes = {
    id: _propTypes2.default.string,
    fields: _propTypes2.default.objectOf(_propTypes2.default.shape({
        label: _propTypes2.default.node,
        className: _propTypes2.default.string,
        merge: _propTypes2.default.bool,
        formatter: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.node]),
        editor: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]), // react class
        props: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.object])
    })).isRequired,
    header: _propTypes2.default.node,
    footer: _propTypes2.default.node,
    actions: _propTypes2.default.objectOf(_propTypes2.default.shape({
        className: _propTypes2.default.string,
        text: _propTypes2.default.node,
        disabled: _propTypes2.default.bool,
        clearForm: _propTypes2.default.bool,
        triggerOnComplete: _propTypes2.default.bool,
        handler: _propTypes2.default.func
    }).isRequired),
    columns: _propTypes2.default.number,
    className: _propTypes2.default.string,
    formClassName: _propTypes2.default.string,
    fieldClassName: _propTypes2.default.string,
    controlClassName: _propTypes2.default.string,
    value: _propTypes2.default.object, // might not be just a simple object
    onChange: _propTypes2.default.func
};
Form.defaultProps = {
    formClassName: '',
    columns: 1,
    value: {},
    actions: {}
};
exports.default = (0, _propWire.wire)(Form, 'value', {});

/***/ }),

/***/ "../src/components/grid.js":
/*!*********************************!*\
  !*** ../src/components/grid.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

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

/***/ }),

/***/ "../src/components/hierarchy.js":
/*!**************************************!*\
  !*** ../src/components/hierarchy.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _checkbox = __webpack_require__(/*! ./checkbox */ "../src/components/checkbox.js");

var _checkbox2 = _interopRequireDefault(_checkbox);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/hierarchy');

/**
 * A React Hierarchy Component. Can be visually presented as tree or accordion layout.
 *
 * @constructor
 * @param {string} [id] - Hierarchy element #id
 * @param {string} [className] - Classname for the container
 * @param {'accordion'|'tree'} [layout='accordion'] - How to display the hierarchy structure?
 * @param {boolean} [foldable=true] - Allow expand/collapse (branch) nodes? If false all hierarchy structure will show
 * @param {number|array<number>} [indent] - Indentation for each node level:
 * * if number, this will be used for indentation of all levels
 * * if array, each array item will represent indentation of corresponding levels, if number of levels exceed array size,
 * then last defined indentation will be used for all subsequent levels
 * @param {object} [data={}] - Data to fill hierarchy with
 * @param {string} [data.id] - node id. Note if top level id is not specified, then root node will not be displayed
 * @param {renderable} [data.label] - node label
 * @param {string} [data.className] - Classname for the node
 * @param {boolean} [data.foldable=true] - Allow expand/collapse this node? If specified will overwrite global *foldable* setting above
 * @param {number} [data.indent] - Indentation for this node. If specified will overwrite global *indent* setting above
 * @param {boolean} [data.disabled=false] - Turning off selection for this node?
 * @param {array<data>} [data.children] - children of the node (can be defined recursively)
 * @param {object} [selection] - Node selection settings
 * @param {boolean} [selection.enabled=false] - Allow selecting nodes?
 * @param {array.<string>} [defaultSelected] - Default selected (leaf) node ids
 * @param {array.<string>} [selected] - Selected (leaf) node ids
 * @param {function} [onSelectionChange] - Callback function when node is selected. <br> Required when selected prop is supplied
 * @param {array.<string>} onSelectionChange.value - current selected (leaf) node ids
 * @param {object} onSelectionChange.eventInfo - event related info
 * @param {array.<string>} onSelectionChange.eventInfo.before - previous selected (leaf) node ids
 * @param {array.<string>} onSelectionChange.eventInfo.ids - (leaf) node ids triggering change
 * @param {boolean} onSelectionChange.eventInfo.selected - selected?
 * @param {string} [current] - Current node id
 * @param {string} [defaultCurrent] - Default current node id
 * @param {function} [onLabelClick] - Callback function when current node is changed. <br> Required when current prop is supplied
 * @param {string} onLabelClick.value - current node id
 * @param {object} onLabelClick.eventInfo - event related info
 * @param {string} onLabelClick.eventInfo.before - previously current node id
 * @param {array} onLabelClick.eventInfo.path - current node in the form of path (array), with id & child index
 * @param {boolean} onLabelClick.eventInfo.isBranch - whether this node is branch
 * @param {function} [onLabelMouseOver] - Callback function when node label is hovered
 * @param {string} onLabelMouseOver.id - hovered node id
 * @param {object} onLabelMouseOver.eventInfo - event related info
 * @param {array} onLabelMouseOver.eventInfo.path - current hovered node in the form of path (array), with id & child index
 * @param {boolean} onLabelMouseOver.eventInfo.isBranch - whether this node is branch
 * @param {array.<string>} [opened] - Current opened node ids
 * @param {array.<string>} [defaultOpened] - Default opened node ids
 * @param {function} [onToggleOpen] - Callback function when open is changed. <br> Required when opened prop is supplied
 * @param {array.<string>} onToggleOpen.value - current opened (branch) node ids
 * @param {object} onToggleOpen.eventInfo - event related info
 * @param {array.<string>} onToggleOpen.eventInfo.before - previously opened (branch) node ids
 * @param {string} onToggleOpen.eventInfo.id - triggering (branch) node id
 * @param {boolean} onToggleOpen.eventInfo.open - triggered by opening?
 * @param {array.<string>} onToggleOpen.eventInfo.path - triggering node in the form of path (array), with id & child index
 *
 * @example
// controlled

import _ from 'lodash'
import {Form, Hierarchy} from 'react-ui'


const INITIAL_DATA = {
    id: 'home',
    label: 'Home',
    children: [
        {
            id: 'A',
            children: [
                {
                    id: 'A.a',
                    children: [
                        {id:'A.a.1'},
                        {
                            id: 'A.a.2',
                            children: [
                                {id:'A.a.2.x'},
                                {id:'A.a.2.y'}
                            ]
                        }
                    ]
                },
                {
                    id: 'A.b',
                    children: [
                        {id:'A.b.1'},
                        {id:'A.b.2'},
                        {id:'A.b.3'}
                    ]
                }
            ]
        },
        {
            id: 'B', label: 'B',
            children: [
                {id:'B.a', label:'B.a custom label'},
                {id:'B.b', label:'B.b custom label'}
            ]
        }
    ]
}

Examples.Hierarchy = React.createClass({
    getInitialState() {
        return {
            current: 'A.a',
            selected: [],
            data: INITIAL_DATA,
            settings: {
                showRoot: false,
                foldable: true,
                selectable: true,
                layout: 'accordion'
            }
        }
    },
    handleLabelClick(current) {
        this.setState({current})
    },
    handleSelectChange(selected) {
        this.setState({selected})
    },
    renderDemoSettings() {
        const {settings} = this.state
        return <Form
            className='demo-settings'
            formClassName='inline'
            fields={{
                showRoot: {
                    label: 'Show Root?',
                    editor: 'Checkbox'
                },
                foldable: {
                    label: 'Allow Expand/Collapse?',
                    editor: 'Checkbox'
                },
                selectable: {
                    label: 'Selectable?',
                    editor: 'Checkbox'
                },
                layout: {
                    label: 'Layout',
                    editor: 'RadioGroup',
                    props: {
                        className: 'inline',
                        list: _.map(['tree', 'accordion'], l=>({value:l, text:l}))
                    }
                }
            }}
            value={settings}
            onChange={newSettings=>{ this.setState({settings:newSettings}) }} />
    },
    render() {
        let {data, current, selected, settings:{showRoot, foldable, selectable, layout}} = this.state

        return <div>
            {this.renderDemoSettings()}
            <Hierarchy
                layout={layout}
                foldable={foldable}
                data={showRoot?data:{children:data.children}}
                selection={{
                    enabled: selectable
                }}
                selected={selected}
                onSelectionChange={this.handleSelectChange}
                current={current}
                onLabelClick={this.handleLabelClick}
                defaultOpened={['home', 'A']} />
        </div>
    }
})
 */

var Hierarchy = function (_React$Component) {
    _inherits(Hierarchy, _React$Component);

    function Hierarchy() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Hierarchy);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Hierarchy.__proto__ || Object.getPrototypeOf(Hierarchy)).call.apply(_ref, [this].concat(args))), _this), _this.getLeafNodeIds = function (path) {
            var data = _this.props.data;

            var pathIgnoringRoot = _lodash2.default.first(path).index == null ? _lodash2.default.tail(path) : path;
            var nodePath = _lodash2.default.isEmpty(pathIgnoringRoot) ? null : 'children.' + _lodash2.default.map(pathIgnoringRoot, 'index').join('.children.');
            var currentNode = nodePath ? _lodash2.default.get(data, nodePath) : data;
            var children = currentNode.children;
            if (!children) {
                return [currentNode.id];
            } else {
                var ids = _lodash2.default.flatten(_lodash2.default.map(children, function (child, idx) {
                    return _this.getLeafNodeIds([].concat(_toConsumableArray(path), [{ id: child.id, index: idx }]));
                }));
                return ids;
            }
        }, _this.handleToggleNode = function (id, path) {
            var _this$props = _this.props,
                opened = _this$props.opened,
                onToggleOpen = _this$props.onToggleOpen;


            var open = !_lodash2.default.includes(opened, id);

            var newOpened = open ? [].concat(_toConsumableArray(opened), [id]) : _lodash2.default.without(opened, id);
            onToggleOpen(newOpened, { open: open, id: id, path: path });
        }, _this.handleSelectLabel = function (id, path, isBranch) {
            var onLabelClick = _this.props.onLabelClick;

            onLabelClick(id, { path: path, isBranch: isBranch });
        }, _this.handleHoverLabel = function (id, path, isBranch) {
            var onLabelMouseOver = _this.props.onLabelMouseOver;

            onLabelMouseOver && onLabelMouseOver(id, { path: path, isBranch: isBranch });
        }, _this.handleSelectNode = function (path, checked) {
            var selected = _this.props.selected;
            var onSelectionChange = _this.props.onSelectionChange;

            var ids = _this.getLeafNodeIds(path);
            var newSelected = void 0;
            if (checked) {
                newSelected = _lodash2.default.uniq([].concat(_toConsumableArray(selected), _toConsumableArray(ids)));
            } else {
                newSelected = _lodash2.default.without.apply(_lodash2.default, [selected].concat(_toConsumableArray(ids)));
            }
            onSelectionChange(newSelected, { ids: ids, selected: checked });
        }, _this.renderNode = function (id, label, className, path, disabled, isBranch, foldable, openBranch) {
            var _this$props2 = _this.props,
                current = _this$props2.current,
                selected = _this$props2.selected,
                selectable = _this$props2.selection.enabled,
                layout = _this$props2.layout;

            var asTree = layout === 'tree';
            var isCurrent = id === current;
            var childrenIds = _this.getLeafNodeIds(path);
            var numSelected = _lodash2.default.intersection(selected, childrenIds).length;

            return _react2.default.createElement(
                'span',
                {
                    style: asTree ? null : { paddingLeft: _lodash2.default.last(path).indent },
                    className: (0, _classnames2.default)('c-flex node', className, { current: isCurrent, selected: numSelected > 0 }) },
                asTree && isBranch && foldable && _react2.default.createElement(
                    'span',
                    { className: 'toggler fixed', onClick: _this.handleToggleNode.bind(_this, id, path) },
                    '[',
                    _react2.default.createElement('i', { className: (0, _classnames2.default)('fg', openBranch ? 'fg-less' : 'fg-add') }),
                    ']'
                ),
                selectable && _react2.default.createElement(_checkbox2.default, {
                    checked: numSelected > 0,
                    disabled: disabled,
                    className: (0, _classnames2.default)('fixed selector', { partial: numSelected > 0 && numSelected < childrenIds.length }),
                    onChange: _this.handleSelectNode.bind(_this, path) }),
                _react2.default.createElement(
                    'span',
                    {
                        className: 'label grow',
                        onClick: _this.handleSelectLabel.bind(_this, id, path, isBranch),
                        onMouseOver: _this.handleHoverLabel.bind(_this, id, path, isBranch) },
                    label || id
                ),
                !asTree && isBranch && foldable && _react2.default.createElement(
                    'span',
                    { className: 'toggler fixed', onClick: _this.handleToggleNode.bind(_this, id, path) },
                    _react2.default.createElement('i', { className: (0, _classnames2.default)('fg', openBranch ? 'fg-arrow-top' : 'fg-arrow-bottom') })
                )
            );
        }, _this.renderHierarchy = function (root, parentPath, index) {
            var id = root.id;


            if (!id) {
                log.error('renderHierarchy::A child without id');
                return null;
            }

            var _this$props3 = _this.props,
                foldable = _this$props3.foldable,
                opened = _this$props3.opened,
                indent = _this$props3.indent;

            var indentCfg = _lodash2.default.isArray(indent) ? indent : [indent];
            var level = parentPath.length + 1;
            var label = root.label,
                className = root.className,
                _root$disabled = root.disabled,
                disableLayer = _root$disabled === undefined ? false : _root$disabled,
                _root$foldable = root.foldable,
                layerFoldable = _root$foldable === undefined ? foldable : _root$foldable,
                _root$indent = root.indent,
                layerIndent = _root$indent === undefined ? _lodash2.default.get(indentCfg, level - 1, _lodash2.default.last(indentCfg)) : _root$indent,
                children = root.children;

            var currentPath = [].concat(_toConsumableArray(parentPath), [{ id: id, index: index, indent: _lodash2.default.get(_lodash2.default.last(parentPath), 'indent', 0) + layerIndent }]);

            if (children) {
                var shouldOpen = !layerFoldable || _lodash2.default.find(opened, function (item) {
                    return item === id;
                });

                return _react2.default.createElement(
                    'li',
                    { key: id, className: (0, _classnames2.default)('branch', 'level-' + level) },
                    _this.renderNode(id, label, className, currentPath, disableLayer, true, layerFoldable, shouldOpen),
                    shouldOpen ? _react2.default.createElement(
                        'ul',
                        { className: 'children' },
                        _lodash2.default.map(children, function (child, i) {
                            return _this.renderHierarchy(child, currentPath, i);
                        })
                    ) : null
                );
            } else {
                return _react2.default.createElement(
                    'li',
                    { key: id, className: (0, _classnames2.default)('leaf', 'level-' + level) },
                    _this.renderNode(id, label, className, currentPath, disableLayer, false, false, false)
                );
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Hierarchy, [{
        key: 'render',


        // TODO: allow customizing leaf node and parent nodes
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                data = _props.data,
                className = _props.className,
                layout = _props.layout;
            var rootId = data.id;


            return _react2.default.createElement(
                'ul',
                { id: id, className: (0, _classnames2.default)('c-hierarchy', layout, className) },
                rootId ? this.renderHierarchy(data, []) : _lodash2.default.map(data.children, function (item, i) {
                    return _this2.renderHierarchy(item, [], i);
                })
            );
        }
    }]);

    return Hierarchy;
}(_react2.default.Component);

Hierarchy.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    layout: _propTypes2.default.oneOf(['tree', 'accordion']),
    foldable: _propTypes2.default.bool, // when false, will overwrite opened config, since full hierarchy will always be opened (opened=true)
    indent: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.arrayOf(_propTypes2.default.number)]),
    data: _propTypes2.default.shape({
        id: _propTypes2.default.string,
        label: _propTypes2.default.node,
        className: _propTypes2.default.string,
        foldable: _propTypes2.default.bool,
        indent: _propTypes2.default.number,
        disabled: _propTypes2.default.bool,
        children: _propTypes2.default.arrayOf(_propTypes2.default.shape({
            id: _propTypes2.default.string.isRequired,
            label: _propTypes2.default.node,
            className: _propTypes2.default.string,
            foldable: _propTypes2.default.bool,
            indent: _propTypes2.default.number,
            disabled: _propTypes2.default.bool,
            children: _propTypes2.default.array
        }))
    }),
    selection: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool
    }),
    selected: _propTypes2.default.arrayOf(_propTypes2.default.string),
    onSelectionChange: _propTypes2.default.func,
    current: _propTypes2.default.string,
    onLabelClick: _propTypes2.default.func,
    onLabelMouseOver: _propTypes2.default.func,
    opened: _propTypes2.default.arrayOf(_propTypes2.default.string),
    onToggleOpen: _propTypes2.default.func
};
Hierarchy.defaultProps = {
    layout: 'accordion',
    foldable: true,
    indent: [4, 30],
    data: {},
    selection: {
        enabled: false
    },
    selected: [],
    opened: []
};
exports.default = (0, _propWire.wireSet)(Hierarchy, {
    current: { defaultValue: '', changeHandlerName: 'onLabelClick' },
    selected: { defaultValue: [], changeHandlerName: 'onSelectionChange' },
    opened: { defaultValue: [], changeHandlerName: 'onToggleOpen' }
});

/***/ }),

/***/ "../src/components/image-gallery.js":
/*!******************************************!*\
  !*** ../src/components/image-gallery.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _tiles = __webpack_require__(/*! ./tiles */ "../src/components/tiles.js");

var _tiles2 = _interopRequireDefault(_tiles);

var _image = __webpack_require__(/*! ./image */ "../src/components/image.js");

var _image2 = _interopRequireDefault(_image);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/image-gallery');

/**
 * React ImageGallery - Image Gallery made up of a row of images/tiles, with prev and next icons.
 *
 * Uses Tiles internally.
 *
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {string|function} [base='img'] - React class to use for rendering the tile, eg 'div', 'img', <SelfDefinedComponent/>
 * @param {array.<object>} items - Props supplied to tile. See [Tiles]{@link module:Tiles} for API
 * @param {'auto' | number} [max] - Max number of tiles. If 'auto' will try to calculate max, if not specified, will display all tiles
 * @param {object} [itemProps] - props for individual image/tile
 * @param {object} [itemSize] - image/tile size
 * @param {number} [itemSize.width] - image/tile width
 * @param {number} [itemSize.height] - image/tile height
 * @param {number} [spacing=0] - Spacing (in px) between images/tiles
 * @param {'%' | 'px'} [unit='px'] - itemSize unit
 * @param {function} [onClick] - Function to call when clicked
 * @param {object} onClick.id - image/tile id clicked
 * @param {object} onClick.eventInfo - other event info
 * @param {number} onClick.eventInfo.index - current array index of clicked image/tile
 * @param {number} onClick.eventInfo.max - number of visible images/tiles
 * @param {number} onClick.eventInfo.total - total # images/tiles
 * @param {function} [onMouseOver] - Function to call when mouse over tile, see onClick for callback function spec
 * @param {function} [onMouseOut] - Function to call when mouse out tile, see onClick for callback function spec
 * @param {number} [start=0] - index to start displaying images/tiles from, if absent start will be uncontrolled
 * @param {number} [defaultStart=0] - Default index to start displaying images/tiles from
 * @param {boolean} [hasPrev=auto detect] - should previous icon be displayed
 * @param {boolean} [hasNext=auto detect] - should next icon be displayed
 * @param {boolean} [repeat=false] - Repeat the play list?
 * @param {object} [autoPlay] - autoPlay configuration
 * @param {boolean} [autoPlay.enabled=false] - Allow autoPlay/filter list?
 * @param {string} [autoPlay.interval=7000] - Interval between slides in milliseconds
 * @param {function} [onMove] - Function to call when prev or next icon is clicked, move forward/backward by *step* when not specified
 * @param {string} onMove.start - new start index
 * @param {object} onMove.eventInfo - eventInfo associated with move
 * @param {boolean} onMove.eventInfo.backward - is previous icon clicked
 * @param {number} onMove.eventInfo.step - how many items to move forward/backward?
 *
 *
 * @example

import {ImageGallery} from 'react-ui'
import _ from 'lodash'

const IMAGES = [
    'bs', 'camera', 'car', 'drug', 'email', 'fb_messenger', 'goods',
    'gun', 'home', 'ic_airplane', 'ic_alert_2', 'ic_bs',
    'ic_cam_2', 'ic_cam_3', 'ic_car_2', 'ic_case', 'ic_creditcard', 'ic_database', 'ic_drug',
    'ic_email', 'ic_etag', 'ic_etag_gate', 'ic_globe', 'ic_goods', 'ic_gun', 'ic_help', 'ic_home', 'ic_info', 'ic_ip',
    'ip', 'landline', 'line', 'mobile', 'parking', 'person'
]

React.createClass({
    getInitialState() {
        return {
            selected: null,
            max: null,
            total: null,
            start: 3,
            prevStart: null,
            moveBackward: false,
            step: null
        }
    },
    handleClick(id, {index, max, total}) {
        this.setState({
            selected: id,
            max,
            total
        })
    },
    handleMove(start, {before:prevStart, backward:moveBackward, step}) {
        // start is uncontrolled
        this.setState({
            start,
            prevStart,
            moveBackward,
            step
        })
    },
    render() {
        const {start} = this.state

        return <ImageGallery
            id='gallery-images'
            items={_.map(IMAGES, item=>({id:item, src:`/images/tiles/${item}.png`}))}
            itemSize={{width:120, height:90}}
            unit='px'
            spacing={3}
            defaultStart={start}
            onMove={this.handleMove}
            onClick={this.handleClick}
            repeat
            autoPlay={{
                enabled: true,
                interval: 3000
            }} />
    }
})


 */

var ImageGallery = function (_React$Component) {
    _inherits(ImageGallery, _React$Component);

    function ImageGallery() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ImageGallery);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ImageGallery.__proto__ || Object.getPrototypeOf(ImageGallery)).call.apply(_ref, [this].concat(args))), _this), _this.createTimer = function () {
            var _this$props$autoPlay$ = _this.props.autoPlay.interval,
                interval = _this$props$autoPlay$ === undefined ? 7000 : _this$props$autoPlay$;

            _this.clearTimer();
            _this.timer = setInterval(function () {
                _this.slide();
            }, interval);
        }, _this.clearTimer = function () {
            if (_this.timer) {
                clearInterval(_this.timer);
            }
        }, _this.slide = function () {
            var backward = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
            var resetAutoPlay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var _this$props = _this.props,
                start = _this$props.start,
                max = _this$props.max,
                items = _this$props.items,
                onMove = _this$props.onMove,
                autoPlay = _this$props.autoPlay,
                repeat = _this$props.repeat;

            var total = _this.props.total || items.length;
            var numTiles = _this.tiles.maxTiles;
            var itemsToMove = max === 'auto' ? numTiles : max;

            var newStart = void 0;
            if (backward) {
                newStart = repeat ? (start - itemsToMove + total) % total : Math.max(start - itemsToMove, 0);
            } else {
                if (repeat) {
                    newStart = (start + itemsToMove) % total;
                } else if (start + itemsToMove >= total) {
                    return;
                } else {
                    newStart = start + itemsToMove;
                }
            }

            if (autoPlay.enabled && resetAutoPlay) {
                _this.createTimer();
            }

            onMove(newStart, { step: itemsToMove, total: total, backward: backward });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ImageGallery, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var autoPlay = this.props.autoPlay;


            this.forceUpdate(); // re-render so the left/right arrows will be shown according to current maxTiles
            if (autoPlay.enabled) {
                this.createTimer();
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.clearTimer();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                base = _props.base,
                items = _props.items,
                start = _props.start,
                hasPrev = _props.hasPrev,
                hasNext = _props.hasNext,
                repeat = _props.repeat,
                tilesProps = _objectWithoutProperties(_props, ['id', 'className', 'base', 'items', 'start', 'hasPrev', 'hasNext', 'repeat']);

            var numTiles = this.tiles ? this.tiles.maxTiles : 0;

            var showPrev = hasPrev;
            var showNext = hasNext;

            if (repeat) {
                showPrev = true;
                showNext = true;
            } else {
                if (showPrev == null) {
                    showPrev = start > 0;
                }
                if (showNext == null) {
                    showNext = (this.props.total || items.length) > start + numTiles;
                }
            }

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-image-gallery c-flex', className) },
                _react2.default.createElement('i', { className: (0, _classnames2.default)('fg fg-arrow-left fixed asc large', { 'c-link': showPrev, disabled: !showPrev }), onClick: showPrev && this.slide.bind(this, true, true) }),
                _react2.default.createElement(_tiles2.default, _extends({
                    base: base,
                    className: 'grow',
                    overlay: false,
                    max: 'auto',
                    items: [].concat(_toConsumableArray(_lodash2.default.slice(items, start)), _toConsumableArray(_lodash2.default.take(items, repeat ? numTiles : 0))),
                    ref: function ref(_ref2) {
                        _this2.tiles = _ref2;
                    }
                }, tilesProps)),
                _react2.default.createElement('i', { className: (0, _classnames2.default)('fg fg-arrow-right fixed asc large', { 'c-link': showNext, disabled: !showNext }), onClick: showNext && this.slide.bind(this, false, true) })
            );
        }
    }]);

    return ImageGallery;
}(_react2.default.Component);

ImageGallery.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    base: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]).isRequired,
    items: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        id: _propTypes2.default.string,
        width: _propTypes2.default.number,
        height: _propTypes2.default.number
    })).isRequired,
    total: _propTypes2.default.number,
    max: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
    itemProps: _propTypes2.default.object,
    itemSize: _propTypes2.default.shape({
        width: _propTypes2.default.number,
        height: _propTypes2.default.number
    }),
    spacing: _propTypes2.default.number,
    unit: _propTypes2.default.oneOf(['%', 'px']),
    onClick: _propTypes2.default.func,
    onMouseOver: _propTypes2.default.func,
    onMouseOut: _propTypes2.default.func,
    start: _propTypes2.default.number,
    hasPrev: _propTypes2.default.bool,
    hasNext: _propTypes2.default.bool,
    repeat: _propTypes2.default.bool,
    autoPlay: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        interval: _propTypes2.default.number
    }),
    onMove: _propTypes2.default.func
};
ImageGallery.defaultProps = {
    base: _image2.default,
    items: [],
    max: 'auto',
    repeat: false,
    autoPlay: {
        enabled: false
    },
    start: 0
};
exports.default = (0, _propWire.wire)(ImageGallery, 'start', 0, 'onMove');

/***/ }),

/***/ "../src/components/image.js":
/*!**********************************!*\
  !*** ../src/components/image.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/image');

/**
 * A React Image Component, with preloading options
 * @constructor
 * @param {string} [id] - Container element #id
 * @param {string} [className] - Classname for the container
 * @param {object} [style] - Styles for the container
 * @param {string} src - Image source url
 * @param {string} [alt] - Image alt
 * @param {boolean} [preload=true] - Allow preloading image? If false then will act as normal <img> tag
 * @param {number} [timeout=30000] - When preload is enabled, maximum time (in milliseconds) to wait before error kicks in
 * @param {string} [placeholder] - When preload is enabled, alternative image url to show when image load has failed
 * @param {renderable} [error='Load failed'] - When preload is enabled, error message to show when image load has filed
 *
 * @example
import {Image} from 'react-ui'

Examples.Image = React.createClass({
    render() {
        return <Image
            src='/images/missing.png'
            error=':('
            placeholder='/images/tiles/ic_alert_2.png' />
    }
})
 */

var Image = function (_React$Component) {
    _inherits(Image, _React$Component);

    function Image() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Image);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Image.__proto__ || Object.getPrototypeOf(Image)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            done: false,
            error: false
        }, _this.clearTimer = function () {
            if (_this.timer) {
                clearTimeout(_this.timer);
            }
        }, _this.createTimer = function () {
            var timeout = _this.props.timeout;

            _this.clearTimer();
            _this.timer = setTimeout(function () {
                _this.handleDone(false);
            }, timeout);
        }, _this.handleDone = function (success) {
            _this.clearTimer();
            if (!_this.state.done) {
                _this.setState({ done: true, error: !success });
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Image, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var preload = this.props.preload;

            preload && this.createTimer();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var src = nextProps.src,
                preload = nextProps.preload;
            var prevSrc = this.props.src;


            this.clearTimer();
            if (preload && prevSrc !== src) {
                this.setState({ done: false, error: false });
                this.createTimer();
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.clearTimer();
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                className = _props.className,
                style = _props.style,
                src = _props.src,
                alt = _props.alt,
                preload = _props.preload,
                error = _props.error,
                placeholder = _props.placeholder;
            var _state = this.state,
                hasError = _state.error,
                done = _state.done;


            if (preload) {
                if (!done) {
                    return _react2.default.createElement(
                        'div',
                        { id: id, className: (0, _classnames2.default)('c-image loading c-flex aic jcc', className), style: style },
                        _react2.default.createElement('i', { className: 'fg fg-loading-2 fg-spin' }),
                        _react2.default.createElement('img', {
                            src: src,
                            alt: alt,
                            onError: this.handleDone.bind(this, false),
                            onAbort: this.handleDone.bind(this, false),
                            onLoad: this.handleDone.bind(this, true) })
                    );
                } else if (hasError) {
                    return _react2.default.createElement(
                        'div',
                        { id: id, className: (0, _classnames2.default)('c-image error c-flex aic jcc', className), style: style },
                        error && _react2.default.createElement(
                            'div',
                            { className: 'error' },
                            error
                        ),
                        placeholder && _react2.default.createElement('img', { alt: alt, src: placeholder })
                    );
                }
            }

            return _react2.default.createElement('img', {
                id: id,
                className: (0, _classnames2.default)('c-image complete', className),
                style: style,
                src: src,
                alt: alt });
        }
    }]);

    return Image;
}(_react2.default.Component);

Image.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    style: _propTypes2.default.object,
    src: _propTypes2.default.string.isRequired,
    alt: _propTypes2.default.string,
    preload: _propTypes2.default.bool,
    timeout: _propTypes2.default.number,
    placeholder: _propTypes2.default.string,
    error: _propTypes2.default.node
};
Image.defaultProps = {
    preload: true,
    timeout: 30000,
    error: 'Load failed'
};
exports.default = Image;

/***/ }),

/***/ "../src/components/index.js":
/*!**********************************!*\
  !*** ../src/components/index.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Tree = exports.ToggleButton = exports.Timeline = exports.Tiles = exports.Textarea = exports.Text = exports.Tabs = exports.Table = exports.Slider = exports.Search = exports.RangeCalendar = exports.RadioGroup = exports.Progress = exports.PopupDialog = exports.Popover = exports.PageNav = exports.MultiInput = exports.ModalDialog = exports.List = exports.Hierarchy = exports.Input = exports.ImageGallery = exports.Image = exports.Grid = exports.Form = exports.FileInput = exports.Dropdown = exports.DateRange = exports.DatePicker = exports.Contextmenu = exports.Combobox = exports.Checkbox = exports.CheckboxGroup = exports.ButtonGroup = undefined;

var _buttonGroup = __webpack_require__(/*! ./button-group */ "../src/components/button-group.js");

var _buttonGroup2 = _interopRequireDefault(_buttonGroup);

var _checkboxGroup = __webpack_require__(/*! ./checkbox-group */ "../src/components/checkbox-group.js");

var _checkboxGroup2 = _interopRequireDefault(_checkboxGroup);

var _checkbox = __webpack_require__(/*! ./checkbox */ "../src/components/checkbox.js");

var _checkbox2 = _interopRequireDefault(_checkbox);

var _combobox = __webpack_require__(/*! ./combobox */ "../src/components/combobox.js");

var _combobox2 = _interopRequireDefault(_combobox);

var _contextmenu = __webpack_require__(/*! ./contextmenu */ "../src/components/contextmenu.js");

var _contextmenu2 = _interopRequireDefault(_contextmenu);

var _datePicker = __webpack_require__(/*! ./date-picker */ "../src/components/date-picker.js");

var _datePicker2 = _interopRequireDefault(_datePicker);

var _dateRange = __webpack_require__(/*! ./date-range */ "../src/components/date-range.js");

var _dateRange2 = _interopRequireDefault(_dateRange);

var _dropdown = __webpack_require__(/*! ./dropdown */ "../src/components/dropdown.js");

var _dropdown2 = _interopRequireDefault(_dropdown);

var _fileInput = __webpack_require__(/*! ./file-input */ "../src/components/file-input.js");

var _fileInput2 = _interopRequireDefault(_fileInput);

var _form = __webpack_require__(/*! ./form */ "../src/components/form.js");

var _form2 = _interopRequireDefault(_form);

var _grid = __webpack_require__(/*! ./grid */ "../src/components/grid.js");

var _grid2 = _interopRequireDefault(_grid);

var _image = __webpack_require__(/*! ./image */ "../src/components/image.js");

var _image2 = _interopRequireDefault(_image);

var _imageGallery = __webpack_require__(/*! ./image-gallery */ "../src/components/image-gallery.js");

var _imageGallery2 = _interopRequireDefault(_imageGallery);

var _input = __webpack_require__(/*! ./input */ "../src/components/input.js");

var _input2 = _interopRequireDefault(_input);

var _hierarchy = __webpack_require__(/*! ./hierarchy */ "../src/components/hierarchy.js");

var _hierarchy2 = _interopRequireDefault(_hierarchy);

var _list = __webpack_require__(/*! ./list */ "../src/components/list.js");

var _list2 = _interopRequireDefault(_list);

var _modalDialog = __webpack_require__(/*! ./modal-dialog */ "../src/components/modal-dialog.js");

var _modalDialog2 = _interopRequireDefault(_modalDialog);

var _multiInput = __webpack_require__(/*! ./multi-input */ "../src/components/multi-input.js");

var _multiInput2 = _interopRequireDefault(_multiInput);

var _pageNav = __webpack_require__(/*! ./page-nav */ "../src/components/page-nav.js");

var _pageNav2 = _interopRequireDefault(_pageNav);

var _popover = __webpack_require__(/*! ./popover */ "../src/components/popover.js");

var _popover2 = _interopRequireDefault(_popover);

var _popupDialog = __webpack_require__(/*! ./popup-dialog */ "../src/components/popup-dialog.js");

var _popupDialog2 = _interopRequireDefault(_popupDialog);

var _progress = __webpack_require__(/*! ./progress */ "../src/components/progress.js");

var _progress2 = _interopRequireDefault(_progress);

var _radioGroup = __webpack_require__(/*! ./radio-group */ "../src/components/radio-group.js");

var _radioGroup2 = _interopRequireDefault(_radioGroup);

var _rangeCalendar = __webpack_require__(/*! ./range-calendar */ "../src/components/range-calendar.js");

var _rangeCalendar2 = _interopRequireDefault(_rangeCalendar);

var _search = __webpack_require__(/*! ./search */ "../src/components/search.js");

var _search2 = _interopRequireDefault(_search);

var _slider = __webpack_require__(/*! ./slider */ "../src/components/slider.js");

var _slider2 = _interopRequireDefault(_slider);

var _table = __webpack_require__(/*! ./table */ "../src/components/table.js");

var _table2 = _interopRequireDefault(_table);

var _tabs = __webpack_require__(/*! ./tabs */ "../src/components/tabs.js");

var _tabs2 = _interopRequireDefault(_tabs);

var _text = __webpack_require__(/*! ./text */ "../src/components/text.js");

var _text2 = _interopRequireDefault(_text);

var _textarea = __webpack_require__(/*! ./textarea */ "../src/components/textarea.js");

var _textarea2 = _interopRequireDefault(_textarea);

var _tiles = __webpack_require__(/*! ./tiles */ "../src/components/tiles.js");

var _tiles2 = _interopRequireDefault(_tiles);

var _timeline = __webpack_require__(/*! ./timeline */ "../src/components/timeline.js");

var _timeline2 = _interopRequireDefault(_timeline);

var _toggleButton = __webpack_require__(/*! ./toggle-button */ "../src/components/toggle-button.js");

var _toggleButton2 = _interopRequireDefault(_toggleButton);

var _tree = __webpack_require__(/*! ./tree */ "../src/components/tree.js");

var _tree2 = _interopRequireDefault(_tree);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.ButtonGroup = _buttonGroup2.default;
exports.CheckboxGroup = _checkboxGroup2.default;
exports.Checkbox = _checkbox2.default;
exports.Combobox = _combobox2.default;
exports.Contextmenu = _contextmenu2.default;
exports.DatePicker = _datePicker2.default;
exports.DateRange = _dateRange2.default;
exports.Dropdown = _dropdown2.default;
exports.FileInput = _fileInput2.default;
exports.Form = _form2.default;
exports.Grid = _grid2.default;
exports.Image = _image2.default;
exports.ImageGallery = _imageGallery2.default;
exports.Input = _input2.default;
exports.Hierarchy = _hierarchy2.default;
exports.List = _list2.default;
exports.ModalDialog = _modalDialog2.default;
exports.MultiInput = _multiInput2.default;
exports.PageNav = _pageNav2.default;
exports.Popover = _popover2.default;
exports.PopupDialog = _popupDialog2.default;
exports.Progress = _progress2.default;
exports.RadioGroup = _radioGroup2.default;
exports.RangeCalendar = _rangeCalendar2.default;
exports.Search = _search2.default;
exports.Slider = _slider2.default;
exports.Table = _table2.default;
exports.Tabs = _tabs2.default;
exports.Text = _text2.default;
exports.Textarea = _textarea2.default;
exports.Tiles = _tiles2.default;
exports.Timeline = _timeline2.default;
exports.ToggleButton = _toggleButton2.default;
exports.Tree = _tree2.default;
exports.default = {
    ButtonGroup: _buttonGroup2.default,
    CheckboxGroup: _checkboxGroup2.default,
    Checkbox: _checkbox2.default,
    Combobox: _combobox2.default,
    Contextmenu: _contextmenu2.default,
    DatePicker: _datePicker2.default,
    DateRange: _dateRange2.default,
    Dropdown: _dropdown2.default,
    FileInput: _fileInput2.default,
    Form: _form2.default,
    Grid: _grid2.default,
    Image: _image2.default,
    ImageGallery: _imageGallery2.default,
    Input: _input2.default,
    Hierarchy: _hierarchy2.default,
    List: _list2.default,
    ModalDialog: _modalDialog2.default,
    MultiInput: _multiInput2.default,
    PageNav: _pageNav2.default,
    Popover: _popover2.default,
    PopupDialog: _popupDialog2.default,
    Progress: _progress2.default,
    RadioGroup: _radioGroup2.default,
    RangeCalendar: _rangeCalendar2.default,
    Search: _search2.default,
    Slider: _slider2.default,
    Table: _table2.default,
    Tabs: _tabs2.default,
    Text: _text2.default,
    Textarea: _textarea2.default,
    Tiles: _tiles2.default,
    Timeline: _timeline2.default,
    ToggleButton: _toggleButton2.default,
    Tree: _tree2.default
};

/***/ }),

/***/ "../src/components/input.js":
/*!**********************************!*\
  !*** ../src/components/input.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _underscore = __webpack_require__(/*! underscore.string */ "../node_modules/underscore.string/index.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

var _popover = __webpack_require__(/*! ./popover */ "../src/components/popover.js");

var _popover2 = _interopRequireDefault(_popover);

var _inputHelper = __webpack_require__(/*! ../utils/input-helper */ "../src/utils/input-helper.js");

var _inputHelper2 = _interopRequireDefault(_inputHelper);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/input');

/**
 * A React (text) Input. Note this is wrapper around react builtin input element, major differences are:
 *
 * * Provides validation tooltip (optional)
 * * Only fire onChange event when the field has lost focus
 *
 * @constructor
 * @param {string} [id] - Input element #id
 * @param {string} [name] - Input element name
 * @param {'text'|'number'|'integer'} [type='text'] - Input type, default to 'text', if type='number' or 'integer' will trigger validation
 * @param {function} [formatter] - Input value display formatter
 * @param {string} formatter.value - currently entered input
 * @param {object} [validate] - Validation config
 * @param {number} validate.min - minimum value when type='number' or 'integer'
 * @param {number} validate.max - maximum value when type='number' or 'integer'
 * @param {RegExp|string} validate.pattern - RegExp string to test against when type='text'
 * @param {string} validate.patternReadable - Readable pattern string
 * @param {fuction} [validate.t] - Transform/translate error into readable message.<br>
 * If not specified, error message will be `${value} ${code}`<br>
 * For example see [i18next]{@link http://i18next.com/translate/} translator for generating error message.<br>
 * @param {'missing'|'no-match'|'not-int'|'not-num'|'out-of-bound'} validate.t.code - Error code
 * @param {object} validate.t.params - Parameters relevant to the error code
 * @param {string} validate.t.params.field - offending field name/id
 * @param {string} validate.t.params.value - offending field value
 * @param {RegExp|string} [validate.t.params.pattern] - pattern the value was supposed to follow
 * @param {number} [validate.t.params.min] - configured minimum value
 * @param {number} [validate.t.params.max] - configured maximum value
 * @param {string} [className] - Classname for the input
 * @param {string|number} [defaultValue] - Default value
 * @param {string|number} [value] - Current value
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean} [required=false] - Is this field mandatory? If true will trigger validation.
 * @param {boolean} [disabled=false] - Is this field disabled?
 * @param {boolean} [readOnly=false] - Is this field readonly?
 * @param {string} [maxLength] - Maximum input length
 * @param {string} [placeholder] - Placeholder for input
 * @param {function} [onChange] - Callback function when value is changed. <br> Required when value prop is supplied
 * @param {string|number} onChange.value - updated value
 * @param {object} onChange.eventInfo - event related info
 * @param {string|number} onChange.eventInfo.before - previous value
 * @param {boolean} onChange.eventInfo.isComplete - was it triggered by pressing enter key?
 *
 * @example
// controlled

import {Input} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            name:'',
            age:'',
            email:''
        }
    },
    handleChange(field,value) {
        this.setState({[field]:value})
    },
    render() {
        let {name, age, email} = this.state;
        return <div className='c-form'>
            <div>
                <label htmlFor='name'>Name</label>
                <Input id='name'
                    onChange={this.handleChange.bind(this,'name')}
                    value={name}
                    required={true}
                    placeholder='Your name'/>
            </div>
            <div>
                <label htmlFor='age'>Age</label>
                <Input id='age'
                    type='number'
                    validate={{
                        max:100,
                        t:(code, {value})=>`Age ${value} is invalid`
                    }}
                    className='my-age'
                    onChange={this.handleChange.bind(this,'age')}
                    value={age}
                    placeholder='Your age'/>
            </div>
            <div>
                <label htmlFor='email'>Email</label>
                <Input id='email'
                    validate={{
                        pattern:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        patternReadable:'xxx@xxx.xxx',
                        t:(code, {value,pattern})=>{
                            if (code==='missing') {
                                return 'You didn\'t enter an email address'
                            }
                            else { // assume pattern issue
                                return `You didn't provide a valid email, the correct format should be ${pattern}`
                            }
                        }
                    }}
                    onChange={this.handleChange.bind(this,'email')}
                    value={email}/>
            </div>
        </div>
    }
})
 */

var Input = function (_React$Component) {
    _inherits(Input, _React$Component);

    function Input(props, context) {
        _classCallCheck(this, Input);

        var _this = _possibleConstructorReturn(this, (Input.__proto__ || Object.getPrototypeOf(Input)).call(this, props, context));

        _initialiseProps.call(_this);

        var value = props.value;


        _this.state = {
            value: value,
            error: _this.validateInput(value)
        };
        return _this;
    }

    _createClass(Input, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var value = nextProps.value;

            this.setState({
                value: value,
                error: this.validateInput(value, nextProps)
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _popover2.default.close();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                className = _props.className,
                id = _props.id,
                name = _props.name,
                type = _props.type,
                disabled = _props.disabled,
                readOnly = _props.readOnly,
                placeholder = _props.placeholder,
                maxLength = _props.maxLength;
            var _state = this.state,
                value = _state.value,
                error = _state.error;


            var changeHandler = this.changeHandler;

            switch (type) {
                default:
                    return _react2.default.createElement('input', {
                        id: id,
                        name: name,
                        ref: function ref(_ref) {
                            _this2.input = _ref;
                        },
                        type: type === 'password' ? 'password' : 'text' /* {type}*/
                        /* min={min}
                        max={max}
                        step={step}
                        pattern={pattern}
                        required={required}*/
                        , readOnly: readOnly,
                        disabled: disabled,
                        maxLength: maxLength,
                        onChange: changeHandler,
                        onBlur: this.blurHandler,
                        onKeyUp: this.keyHandler,
                        placeholder: placeholder,
                        className: (0, _classnames2.default)(className, { invalid: error }),
                        value: value });
            }
        }
    }]);

    return Input;
}(_react2.default.Component);

Input.propTypes = {
    id: _propTypes2.default.string,
    name: _propTypes2.default.string,
    type: _propTypes2.default.oneOf(['text', 'number', 'integer', 'password']),
    formatter: _propTypes2.default.func,
    validate: _propTypes2.default.shape({
        min: _propTypes2.default.number,
        max: _propTypes2.default.number,
        pattern: _propTypes2.default.oneOfType([_propTypes2.default.instanceOf(RegExp), _propTypes2.default.string]),
        patternReadable: _propTypes2.default.string,
        t: _propTypes2.default.func
    }),
    className: _propTypes2.default.string,
    value: _propTypes3.SIMPLE_VALUE_PROP,
    required: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    readOnly: _propTypes2.default.bool,
    maxLength: _propTypes2.default.number,
    placeholder: _propTypes3.SIMPLE_VALUE_PROP,
    onChange: _propTypes2.default.func
};
Input.defaultProps = {
    type: 'text',
    validate: {},
    required: false,
    disabled: false,
    readOnly: false
};

var _initialiseProps = function _initialiseProps() {
    var _this3 = this;

    this.changeHandler = function (evt) {
        var newVal = evt.target.value;
        var error = _this3.validateInput(newVal);
        _this3.nextTime = false;

        if (error) {
            evt.stopPropagation();
            evt.preventDefault();
            _popover2.default.open(evt, error);
            _this3.setState({ error: error, value: newVal });
        } else {
            _popover2.default.close();
            _this3.setState({ value: newVal, error: false });
        }
    };

    this.keyHandler = function (evt) {
        if (evt.keyCode === 13) {
            _this3.blurHandler(evt, { isComplete: true });
        }
    };

    this.blurHandler = function (evt) {
        var info = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var oldVal = _this3.props.value;
        var _state2 = _this3.state,
            error = _state2.error,
            newVal = _state2.value;


        if (error) {
            if (!_this3.nextTime) {
                _this3.nextTime = true;
                _this3.setState({ value: oldVal });
                _this3.input.focus();
            } else {
                _this3.nextTime = false;
                _popover2.default.close();
                _this3.setState({ error: _this3.validateInput(evt.target.value) !== null });
            }
        } else {
            if (oldVal !== newVal) {
                var _props2 = _this3.props,
                    formatter = _props2.formatter,
                    onChange = _props2.onChange;


                if (newVal != null && !_underscore2.default.isBlank(newVal) && formatter && _lodash2.default.isFunction(formatter)) {
                    newVal = formatter(newVal);
                }

                onChange(newVal, info);
            }
        }
    };

    this.validateInput = function (value, props) {
        var _ref2 = props || _this3.props,
            name = _ref2.name,
            id = _ref2.id,
            type = _ref2.type,
            required = _ref2.required,
            _ref2$validate = _ref2.validate,
            t = _ref2$validate.t,
            params = _objectWithoutProperties(_ref2$validate, ['t']);

        var msg = _inputHelper2.default.validateField(value, _extends({ name: name || id, type: type, required: required }, params), t ? { et: t } : true);

        if (msg) {
            return _react2.default.createElement(
                'span',
                null,
                msg
            );
        }
        return null;
    };
};

exports.default = (0, _propWire.wireValue)(Input);

/***/ }),

/***/ "../src/components/list.js":
/*!*********************************!*\
  !*** ../src/components/list.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

var _checkbox = __webpack_require__(/*! ./checkbox */ "../src/components/checkbox.js");

var _checkbox2 = _interopRequireDefault(_checkbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/list');

/**
 * A React List view, currently effective classNames are multicols, decimal, disc
 * @todo Better support for defining how many columns; better support for rendering list items
 *
 * @constructor
 * @param {string} [id] - List dom element #id
 * @param {string} [className] - Classname for the container, avaiable built-in classnames:
 * * selectable - Change color when hovering over list item
 * * multicols - SShow list as multi-columns
 * @param {object|array} list - Data list
 * @param {string} [itemIdField='id'] - The field key which will be used as item dom #id
 * @param {string | function} [itemClassName] - Classname of a list item
 * @param {string | function} [itemStyle] - Style of a list item
 * @param {function} [formatter] - Function to render list item
 * @param {object} [selection] - List item selection settings
 * @param {boolean} [selection.enabled=false] - Are list items selectable? If yes checkboxes will appear
 * @param {boolean} [selection.multiSelect=true] - Can select multiple items?
 * @param {string | array.<string>} [defaultSelected] - Selected item id(s)
 * @param {string | array.<string>} [selected] - Default selected item id(s)
 * @param {object} [selectedLink] - Link to update selections. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} selectedLink.value - value to update
 * @param {function} selectedLink.requestChange - function to request value change
 * @param {function} [onSelectionChange] - Callback function when item is selected. <br> Required when selected prop is supplied
 * @param {string | array} onSelectionChange.value - current selected item ids
 * @param {object} onSelectionChange.eventInfo - event related info
 * @param {string | array} onSelectionChange.eventInfo.before - previous selected item ids
 * @param {string} onSelectionChange.eventInfo.id - id triggering change
 * @param {boolean} onSelectionChange.eventInfo.selected - selected?
 * @param {function} [onClick] [description]
 * @param {renderable} [info] - React renderable object, display additional information about the list
 * @param {string} [infoClassName] - Assign className to info node
 *
 * @example

import _ from 'lodash'
import {List} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            movies: _(_.range(0, 200)).map(i=>({id:`${i}`, title:`Movie ${i}`})).value() // 200 movies
        }
    },
    render() {
        const {movies} = this.state
        return <List
            id='movies'
            list={movies}
            itemClassName='c-flex aic'
            selection={{enabled:true}}
            formatter={movie=>`${movie.id} - ${movie.title}`} />
    }
})
 */

var List = function (_React$Component) {
    _inherits(List, _React$Component);

    function List() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, List);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = List.__proto__ || Object.getPrototypeOf(List)).call.apply(_ref, [this].concat(args))), _this), _this.handleToggleSelection = function (id, selected) {
            var _this$props = _this.props,
                _this$props$selection = _this$props.selection.multiSelect,
                multiSelect = _this$props$selection === undefined ? true : _this$props$selection,
                curSelected = _this$props.selected,
                onSelectionChange = _this$props.onSelectionChange;

            if (multiSelect) {
                var newSelected = selected ? [].concat(_toConsumableArray(curSelected), [id]) : _lodash2.default.without(curSelected, id);
                onSelectionChange(newSelected, { id: id, selected: selected });
            } else {
                onSelectionChange(selected ? id : '');
            }
        }, _this.renderListItem = function (item, id) {
            var _this$props2 = _this.props,
                formatter = _this$props2.formatter,
                itemClassName = _this$props2.itemClassName,
                itemStyle = _this$props2.itemStyle,
                _this$props2$selectio = _this$props2.selection,
                selectable = _this$props2$selectio.enabled,
                _this$props2$selectio2 = _this$props2$selectio.multiSelect,
                multiSelectable = _this$props2$selectio2 === undefined ? true : _this$props2$selectio2,
                selected = _this$props2.selected,
                onClick = _this$props2.onClick;


            var content = item;

            if (formatter && _lodash2.default.isFunction(formatter)) {
                content = formatter(item, id);
            }

            var _itemClassName = itemClassName;
            if (itemClassName) {
                if (_lodash2.default.isFunction(itemClassName)) {
                    _itemClassName = itemClassName(item);
                }
            }

            var _itemStyle = itemStyle;
            if (itemStyle) {
                if (_lodash2.default.isFunction(itemStyle)) {
                    _itemStyle = itemStyle(item);
                }
            }

            var itemSelected = multiSelectable && _lodash2.default.includes(selected, id) || !multiSelectable && selected === id;
            if (itemSelected) {
                _itemClassName = [_itemClassName, 'selected'];
            }

            return _react2.default.createElement(
                'li',
                {
                    key: id,
                    id: id,
                    className: (0, _classnames2.default)('c-flex', _itemClassName),
                    style: _itemStyle,
                    onClick: onClick ? onClick.bind(null, id, item) : null },
                selectable && _react2.default.createElement(_checkbox2.default, { checked: itemSelected, onChange: _this.handleToggleSelection.bind(_this, id) }),
                content
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(List, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                list = _props.list,
                itemIdField = _props.itemIdField,
                info = _props.info,
                infoClassName = _props.infoClassName,
                selectable = _props.selection.enabled;


            return _react2.default.createElement(
                'ul',
                { id: id, className: (0, _classnames2.default)('c-list', { selectable: selectable }, className) },
                info ? _react2.default.createElement(
                    'li',
                    { className: (0, _classnames2.default)('c-info', infoClassName) },
                    info
                ) : _lodash2.default.map(list, function (item, key) {
                    return _this2.renderListItem(item, '' + _lodash2.default.get(item, itemIdField, key));
                })
            );
        }
    }]);

    return List;
}(_react2.default.Component);

List.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    list: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.array]),
    itemClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
    itemStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
    itemIdField: _propTypes2.default.string,
    formatter: _propTypes2.default.func,
    selection: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        multiSelect: _propTypes2.default.bool
    }),
    selected: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.arrayOf(_propTypes2.default.string)]),
    onSelectionChange: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    info: _propTypes2.default.node,
    infoClassName: _propTypes2.default.string
};
List.defaultProps = {
    list: {},
    itemIdField: 'id',
    selection: {
        enabled: false
    }
};
exports.default = (0, _propWire.wireSet)(List, {
    selected: {
        changeHandlerName: 'onSelectionChange',
        defaultValue: function defaultValue(_ref2) {
            var _ref2$selection = _ref2.selection,
                selection = _ref2$selection === undefined ? {} : _ref2$selection;
            var enabled = selection.enabled,
                _selection$multiSelec = selection.multiSelect,
                multiSelect = _selection$multiSelec === undefined ? true : _selection$multiSelec;

            if (enabled) {
                return multiSelect ? [] : '';
            }
            return '';
        }
    }
});

/***/ }),

/***/ "../src/components/modal-dialog.js":
/*!*****************************************!*\
  !*** ../src/components/modal-dialog.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _reactAddonsCssTransitionGroup = __webpack_require__(/*! react-addons-css-transition-group */ "../node_modules/react-addons-css-transition-group/index.js");

var _reactAddonsCssTransitionGroup2 = _interopRequireDefault(_reactAddonsCssTransitionGroup);

var _reactDraggable = __webpack_require__(/*! react-draggable */ "../node_modules/react-draggable/dist/react-draggable.js");

var _reactDraggable2 = _interopRequireDefault(_reactDraggable);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/modal-dialog');

/**
 * A React modal dialog
 * @constructor
 * @param {string} [id] - Modal dialog element #id
 * @param {renderable} [title] - Title of the dialog
 * @param {object} actions - Define buttons and actions to trigger
 * @param {object} actions.key - Config for this **action**
 * @param {string} actions.key.text - action button text
 * @param {string} actions.key.className - action button className
 * @param {boolean} [actions.key.disabled=false] - disable this action
 * @param {function} actions.key.handler - function to invoke when action is triggered (ie button clicked)
 * @param {string} [closeAction] - Action to invoke when close(x) icon is clicked
 * @param {string} [defaultAction] - Default action button **key** to focus on
 * @param {string} [className] - Additional classnames for modal container
 * @param {string} [contentClassName] - Additional classnames for the dialog content
 * @param {string} [controlClassName] - Additional classnames for the action buttons
 * @param {object} [style] - Style for the dialog
 * @param {number} [opacity=0.5] - Opacity for the background shield
 * @param {boolean} [show=true] - Show dialog or not?
 * @param {boolean} [useTransition=false] - Transition effect?
 * @param {boolean} [draggable=false] - Draggable header?
 * @param {boolean} [boolean=false] - Make dialog center of page?
 * @param {renderable} [info] - React renderable object, display info at footer, eg error message
 * @param {string} [infoClassName] - Assign className to info node
 * @param {renderable} children - Content of the dialog
 *
 * @example

import _ from 'lodash'
import {ModalDialog, Dropdown} from 'react-ui'
import {LinkedStateMixin} from 'core/mixins/linked-state-mixins'

const INITIAL_STATE = {
    open:false,
    info:null,
    error:false,
    movieId:null
}
const RateMovieDialog = React.createClass({
    mixins:[LinkedStateMixin],
    getInitialState() {
        return _.clone(INITIAL_STATE)
    },
    open(movieId, {rating}) {
        // ajax get movie details by id
        this.setState({movieId, rating, open:true})
    },
    close(changed, data) {
        this.setState(_.clone(INITIAL_STATE), () => {
            this.props.onDone(changed, data);
        });
    },
    rateMovie() {
        let {rating} = this.state
        // can be ajax to post rating
        if (rating) {
            this.close(true, {rating})
        }
        else {
            this.setState({info:'Please select rating', error:true})
        }
    },
    render() {
        let {movieId, open, info, error} = this.state;
        if (!open) {
            return null
        }

        let actions = {
             cancel:{text:'Cancel', handler:this.close.bind(this,false,null)},
             confirm:{text:'OK!', className:'btn-ok', handler:this.rateMovie}
        }
        return <ModalDialog
             id='rate-movie-dialog'
             title={`Rate ${movieId}!`}
             draggable={true}
             global={true}
             info={info}
             infoClassName={cx({'c-error':error})}
             actions={actions}>
             <Dropdown list={_.map(_.range(1,11),i=>({value:i,text:i}))}
                 valueLink={this.linkState('rating')}/>
         </ModalDialog>
    }
})
 */

var ModalDialog = function (_React$Component) {
    _inherits(ModalDialog, _React$Component);

    function ModalDialog() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ModalDialog);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ModalDialog.__proto__ || Object.getPrototypeOf(ModalDialog)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            show: _this.props.show
        }, _this.toggle = function (show) {
            _this.setState({ show: show });
        }, _this.focusAction = function () {
            if (_this.state.show) {
                var defaultAction = _this.props.defaultAction;


                if (defaultAction) {
                    _this[defaultAction + 'Btn'].focus();
                }
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ModalDialog, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.focusAction();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            this.setState({ show: nextProps.show });
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.focusAction();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                useTransition = _props.useTransition;
            var show = this.state.show;


            var modalContent = null;

            if (show) {
                var _props2 = this.props,
                    title = _props2.title,
                    actions = _props2.actions,
                    closeActionKey = _props2.closeAction,
                    className = _props2.className,
                    contentClassName = _props2.contentClassName,
                    controlClassName = _props2.controlClassName,
                    dialogStyle = _props2.style,
                    opacity = _props2.opacity,
                    info = _props2.info,
                    infoClassName = _props2.infoClassName,
                    draggable = _props2.draggable,
                    global = _props2.global,
                    children = _props2.children;


                var actionNodes = _lodash2.default.map(_lodash2.default.keys(actions), function (actionKey) {
                    var action = actions[actionKey];
                    return _react2.default.createElement(
                        'button',
                        {
                            className: (0, _classnames2.default)(controlClassName, action.className),
                            disabled: action.disabled,
                            ref: function ref(_ref2) {
                                _this2[actionKey + 'Btn'] = _ref2;
                            },
                            key: actionKey,
                            name: actionKey,
                            onClick: action.handler },
                        action.text || actionKey
                    );
                });

                var closeAction = closeActionKey && actions[closeActionKey];

                var dialogContent = _react2.default.createElement(
                    'section',
                    { id: id + '-dialog', className: 'c-box dialog', style: dialogStyle },
                    title ? _react2.default.createElement(
                        'header',
                        { className: (0, _classnames2.default)({ handle: draggable }, 'c-flex') },
                        title,
                        _react2.default.createElement('i', { className: 'c-link fg fg-close end', onClick: closeAction ? closeAction.handler : this.toggle.bind(this, false) })
                    ) : null,
                    _react2.default.createElement(
                        'div',
                        { id: id + '-content', className: (0, _classnames2.default)('content', contentClassName) },
                        children
                    ),
                    (actionNodes.length > 0 || info) && _react2.default.createElement(
                        'footer',
                        null,
                        info && _react2.default.createElement('div', { className: (0, _classnames2.default)('c-info', infoClassName), dangerouslySetInnerHTML: { __html: info } }),
                        actionNodes
                    )
                );

                modalContent = _react2.default.createElement(
                    'section',
                    { id: id, className: (0, _classnames2.default)('c-modal show', global ? 'c-center global' : '', className) },
                    _react2.default.createElement('div', { id: 'overlay', style: { opacity: opacity } }),
                    draggable ? _react2.default.createElement(
                        _reactDraggable2.default,
                        { handle: '.handle', bounds: 'parent' },
                        dialogContent
                    ) : dialogContent
                );
            }

            return useTransition ? _react2.default.createElement(
                _reactAddonsCssTransitionGroup2.default,
                {
                    transitionName: 'c-modal',
                    transitionEnterTimeout: 200,
                    transitionLeaveTimeout: 300 },
                modalContent
            ) : modalContent;
        }
    }]);

    return ModalDialog;
}(_react2.default.Component);

ModalDialog.propTypes = {
    id: _propTypes2.default.string,
    title: _propTypes2.default.node,
    actions: _propTypes2.default.objectOf(_propTypes2.default.shape({
        className: _propTypes2.default.string,
        text: _propTypes2.default.node,
        disabled: _propTypes2.default.bool,
        handler: _propTypes2.default.func
    }).isRequired).isRequired,
    closeAction: _propTypes2.default.string,
    defaultAction: _propTypes2.default.string,
    className: _propTypes2.default.string,
    contentClassName: _propTypes2.default.string,
    controlClassName: _propTypes2.default.string,
    style: _propTypes3.SIMPLE_OBJECT_PROP,
    opacity: _propTypes2.default.number,
    show: _propTypes2.default.bool,
    useTransition: _propTypes2.default.bool,
    draggable: _propTypes2.default.bool,
    global: _propTypes2.default.bool,
    info: _propTypes2.default.node,
    infoClassName: _propTypes2.default.string,
    children: _propTypes2.default.node
};
ModalDialog.defaultProps = {
    title: '',
    actions: {},
    opacity: 0.5,
    show: true,
    useTransition: false,
    draggable: false,
    global: false,
    className: ''
};
exports.default = ModalDialog;

/***/ }),

/***/ "../src/components/multi-input.js":
/*!****************************************!*\
  !*** ../src/components/multi-input.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _objectPathImmutable = __webpack_require__(/*! object-path-immutable */ "../node_modules/object-path-immutable/index.js");

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _index = __webpack_require__(/*! ./index */ "../src/components/index.js");

var _index2 = _interopRequireDefault(_index);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/multi-input');

/**
 * A React Multi Input Group, can be used on any type of 'value', string, number, object etc
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string|function} base - React class to use for rendering the input
 * * native dom elements: eg 'input'|'div' etc
 * * react-ui input components: 'ButtonGroup' | CheckboxGroup' | Checkbox' | Combobox' | DatePicker' | DateRange' | Dropdown' | FileInput' | Input' | MultiInput' | RadioGroup' | RangeCalendar' | ToggleButton'
 * * custom defined React class
 * @param {object} [props] - Props for the above react class, see individual doc for the base class
 * @param {string} [className] - Classnames to apply
 * @param {string} [groupClassName] - Classnames to apply to individual input groups
 * @param {boolean} [expand=false] - Should input items expand to fill the horizontal space as restricted by its parent element #id
 * @param {boolean} [inline=false] - Should input items be displayed as inline?
 * @param {boolean} [boxed=false] - Should input items be displayed as boxed areas? This will make remove icon/button appear at top right corner of the box
 * @param {boolean} [disabled=false] - Are input items disabled?
 * @param {boolean} [readOnly=false] - Are input items read only?
 * @param {boolean} [persistKeys=false] - Avoid react conflict resolution by persisting keys? Should be used along side file inputs
 * @param {*} [defaultItemValue=''] - When adding new item, what is the default value of this item?
 * @param {array} [defaultValue] - Default array of input values
 * @param {array} [value] - Current array of input values
 * @param {object} [valueLink] - Link to update values. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {function} [onChange] - Callback function when any of the input is changed/entered. <br> Required when value prop is supplied
 * @param {array} onChange.values - input values
 * @param {object} onChange.eventInfo - event related info
 * @param {array} onChange.eventInfo.before - previous input values
 * @param {renderable} [addText] - Text shown in add button, default to showing '+' icon
 * @param {renderable} [removeText] - Text shown in remove button, default to showing 'x' icon
 *
 * @example

import {MultiInput, Input} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            phones:[]
        }
    },
    handleChange(phones) {
        this.setState({phones})
    },
    render() {
        let {phones} = this.state;
        return <div>
            <label htmlFor='phones'>Enter phones</label>
            <MultiInput id='phones'
                base={Input}
                props={{validate:{
                    pattern:/^[0-9]{10}$/,
                    t:()=>'Incorrect phone number, should read like 0900000000'
                }}}
                inline={true}
                onChange={this.handleChange}
                value={phones}/>
        </div>
    }
})
 */

var MultiInput = function (_React$Component) {
    _inherits(MultiInput, _React$Component);

    function MultiInput() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, MultiInput);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = MultiInput.__proto__ || Object.getPrototypeOf(MultiInput)).call.apply(_ref, [this].concat(args))), _this), _this.handleChange = function (result) {
            var onChange = _this.props.onChange;
            // onChange(_.compact(result));

            onChange(result);
        }, _this.modifyInput = function (i, newVal) {
            var value = _this.props.value;

            // support base react input elements such as 'input'

            if (newVal.target) {
                // newVal should be event e
                newVal = newVal.target.value;
            }
            _this.handleChange(_objectPathImmutable2.default.set(value, i, newVal));
        }, _this.addInput = function () {
            var _this$props = _this.props,
                value = _this$props.value,
                defaultItemValue = _this$props.defaultItemValue;

            // if value was empty, a default item would have been added to display, so need to append this item

            if (value.length <= 0) {
                value = [].concat(_toConsumableArray(value), [defaultItemValue]);
            }

            if (_this.keys) {
                _this.keys.push(_lodash2.default.last(_this.keys) + 1);
            }

            _this.handleChange([].concat(_toConsumableArray(value), [defaultItemValue]));
        }, _this.removeInput = function (i) {
            var value = _this.props.value;


            if (_this.keys) {
                if (value.length <= 1) {
                    // if last item in the list, after removal, still need to create new key
                    _this.keys = [_lodash2.default.last(_this.keys) + 1];
                } else {
                    _this.keys = _objectPathImmutable2.default.del(_this.keys, i);
                }
            }

            _this.handleChange(_objectPathImmutable2.default.del(value, i));
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(MultiInput, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                base = _props.base,
                baseProps = _props.props,
                value = _props.value,
                defaultItemValue = _props.defaultItemValue,
                expand = _props.expand,
                inline = _props.inline,
                boxed = _props.boxed,
                disabled = _props.disabled,
                readOnly = _props.readOnly,
                persistKeys = _props.persistKeys,
                className = _props.className,
                groupClassName = _props.groupClassName,
                addText = _props.addText,
                removeText = _props.removeText;


            var editable = !(disabled || readOnly);

            var items = value.length <= 0 ? [].concat(_toConsumableArray(value), [defaultItemValue]) : value;

            // use this.keys to maintain react keys,
            // so adding will always create new key, instead of possibly reusing existing element with same key
            // mainly used for file input, where react doesn't handle conflict resolution for file inputs
            // When persist keys, things will not work when assigning passing new set of value prop to MultiInput
            if (persistKeys && !this.keys) {
                this.keys = _lodash2.default.map(items, function (item, i) {
                    return i;
                });
            }

            return _react2.default.createElement(
                'span',
                { id: id, className: (0, _classnames2.default)('c-multi', className, { expand: expand, inline: inline, boxed: boxed }) },
                _lodash2.default.map(items, function (item, i) {
                    var key = _this2.keys ? _this2.keys[i] : i;
                    return _react2.default.createElement(
                        'span',
                        { key: key, className: (0, _classnames2.default)('group', groupClassName) },
                        _react2.default.createElement(_lodash2.default.isString(base) && _lodash2.default.has(_index2.default, base) ? _index2.default[base] : base, _lodash2.default.extend(baseProps, {
                            /* required, */
                            onChange: _this2.modifyInput.bind(_this2, i),
                            value: item,
                            disabled: disabled,
                            readOnly: readOnly
                        })),
                        editable && (removeText ? _react2.default.createElement(
                            'button',
                            { onClick: _this2.removeInput.bind(_this2, i), className: 'standard remove' },
                            removeText
                        ) : _react2.default.createElement('i', { onClick: _this2.removeInput.bind(_this2, i), className: 'c-link fg fg-close remove' })),
                        editable && !boxed && _react2.default.createElement(
                            'button',
                            { className: (0, _classnames2.default)('standard add', addText ? '' : 'fg fg-add', { disabled: i < items.length - 1 }), onClick: _this2.addInput },
                            addText
                        )
                    );
                }),
                editable && boxed && _react2.default.createElement(
                    'button',
                    { className: (0, _classnames2.default)('standard add', addText ? '' : 'fg fg-add'), onClick: this.addInput },
                    addText
                )
            );
        }
    }]);

    return MultiInput;
}(_react2.default.Component);

MultiInput.propTypes = {
    id: _propTypes2.default.string,
    base: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]).isRequired,
    props: _propTypes2.default.object,
    expand: _propTypes2.default.bool,
    inline: _propTypes2.default.bool,
    boxed: _propTypes2.default.bool,
    className: _propTypes2.default.string,
    groupClassName: _propTypes2.default.string,
    disabled: _propTypes2.default.bool,
    readOnly: _propTypes2.default.bool,
    persistKeys: _propTypes2.default.bool,
    defaultItemValue: _propTypes2.default.any,
    value: _propTypes2.default.array,
    // required: React.PropTypes.bool,
    onChange: _propTypes2.default.func,
    addText: _propTypes2.default.node,
    removeText: _propTypes2.default.node
};
MultiInput.defaultProps = {
    expand: false,
    inline: false,
    boxed: false,
    disabled: false,
    readOnly: false,
    persistKeys: false,
    defaultItemValue: '' /* ,
                         required: false*/
};
exports.default = (0, _propWire.wire)(MultiInput, 'value', []);

/***/ }),

/***/ "../src/components/page-nav.js":
/*!*************************************!*\
  !*** ../src/components/page-nav.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/page-nav');

/**
A React Page Navigation Component, containing following:
 * * (possible) prev button
 * * thumbnails for pages, up to configurable number of thumbnails (default to 9),
 * if total number of pages exceed configured number, will display '...' where appropriate
 * * (possible) next button
 *
 * @constructor
 * @param {number} [pages] - Total number of pages
 * @param {number} [current=1] - Current (highlighted) page number
 * @param {number} [thumbnails=9] - Maximum number of thumbnails to display
 * @param {string} [className] - Classname for the container
 * @param {function} onChange - Callback function when from/to is changed. <br> Required when value prop is supplied
 * @param {number} onChange.page - current selected page
 *
 * @example
 *
import _ from 'lodash'
import {PageNav} from 'react-ui'
 *
const PAGE_SIZE = 30

React.createClass({
    getInitialState() {
        return {
            movies:_(_.range(0,100)).map(i=>`Movie ${i}`), // 100 movies
            currentPage:1
        }
    },
    handleChange(currentPage) {
        this.setState({currentPage})
    },
    render() {
        let {movies, currentPage} = this.state;
        movies = movies.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE)
        return <div>
            <ul>
            {
                movies.map(movie=><li>{movie}</li>)
            }
            </ul>
            <PageNav pages={Math.ceil(movies/PAGE_SIZE)}
                current={currentPage}
                onChange={this.handleChange}/>
        </div>
    }
})

 */

var PageNav = function (_React$Component) {
    _inherits(PageNav, _React$Component);

    function PageNav() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, PageNav);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PageNav.__proto__ || Object.getPrototypeOf(PageNav)).call.apply(_ref, [this].concat(args))), _this), _this.gotoPage = function (page) {
            var onChange = _this.props.onChange;

            onChange(page);
        }, _this.renderThumb = function (page, key) {
            var current = _this.props.current;

            return _react2.default.createElement(
                'button',
                {
                    key: key,
                    className: (0, _classnames2.default)('thumb', { current: current === page }),
                    disabled: !page,
                    onClick: _this.gotoPage.bind(_this, page) },
                page || '...'
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(PageNav, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                thumbnails = _props.thumbnails,
                current = _props.current,
                pages = _props.pages,
                className = _props.className;


            if (!pages) {
                return null;
            }

            // let endThumbs = Math.floor(thumbnails/4);
            var endThumbs = 2; // display 2 at both ends
            var midThumbs = thumbnails - endThumbs * 2 - 2;
            var list = [];

            var midStart = Math.max(current - Math.floor(midThumbs / 2), endThumbs + 1);
            var midEnd = midStart + midThumbs - 1;
            var lastSkipped = false;

            if (midEnd >= pages - endThumbs) {
                midStart = Math.max(endThumbs + 1, midStart - (midEnd - (pages - endThumbs)));
                midEnd = pages - endThumbs;
                midStart--;
            }

            if (midStart === endThumbs + 1) {
                midEnd++;
            }

            if (midStart === endThumbs + 2) {
                midStart--;
            }
            if (midEnd === pages - endThumbs - 1) {
                midEnd++;
            }

            _lodash2.default.forEach(_lodash2.default.range(1, pages + 1), function (i) {
                if (i <= endThumbs || i > pages - endThumbs || i >= midStart && i <= midEnd) {
                    list.push(_this2.renderThumb(i, i));
                    lastSkipped = false;
                } else {
                    if (!lastSkipped) {
                        list.push(_this2.renderThumb(null, i));
                        lastSkipped = true;
                    }
                }
            });

            return _react2.default.createElement(
                'div',
                { className: (0, _classnames2.default)('c-page-nav', className) },
                _react2.default.createElement('button', { className: 'thumb fg fg-arrow-left', disabled: current === 1, onClick: this.gotoPage.bind(this, current - 1) }),
                list,
                _react2.default.createElement('button', { className: 'thumb fg fg-arrow-right', disabled: current === pages, onClick: this.gotoPage.bind(this, current + 1) })
            );
        }
    }]);

    return PageNav;
}(_react2.default.Component);

PageNav.propTypes = {
    pages: _propTypes2.default.number,
    current: _propTypes2.default.number,
    thumbnails: _propTypes2.default.number,
    className: _propTypes2.default.string,
    onChange: _propTypes2.default.func.isRequired
};
PageNav.defaultProps = {
    pages: null,
    current: 1,
    thumbnails: 9
};
exports.default = PageNav;

/***/ }),

/***/ "../src/components/popover.js":
/*!************************************!*\
  !*** ../src/components/popover.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(/*! react-dom */ "../node_modules/react-dom/index.js");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _reactDraggable = __webpack_require__(/*! react-draggable */ "../node_modules/react-draggable/dist/react-draggable.js");

var _reactDraggable2 = _interopRequireDefault(_reactDraggable);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @module popover
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @description A module to help with opening/closing popovers
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * Note. There can be multiple popovers appearing on the screen at the same time.<br>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * To achieve this, please use openId(..) instead of open()
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/popover');

var handles = {};

var GLOBAL_POPOVER_ID = 'g-popover';

var Popover = function (_React$Component) {
    _inherits(Popover, _React$Component);

    function Popover() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Popover);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Popover.__proto__ || Object.getPrototypeOf(Popover)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            open: false,
            position: {},
            display: null,
            cfg: {}
        }, _this.setDragBounds = function () {
            var boundBy = _this.state.cfg.boundBy;

            var node = _this.node;

            var _boundBy$getBoundingC = boundBy.getBoundingClientRect(),
                boundLeft = _boundBy$getBoundingC.left,
                boundRight = _boundBy$getBoundingC.right,
                boundTop = _boundBy$getBoundingC.top,
                boundBottom = _boundBy$getBoundingC.bottom;

            var _node$getBoundingClie = node.getBoundingClientRect(),
                popLeft = _node$getBoundingClie.left,
                popRight = _node$getBoundingClie.right,
                popTop = _node$getBoundingClie.top,
                popBottom = _node$getBoundingClie.bottom;

            var _dragBounds = {
                left: boundLeft - popLeft,
                right: boundRight - popRight,
                top: boundTop - popTop,
                bottom: boundBottom - popBottom
            };
            _this.setState({ _dragBounds: _dragBounds });
        }, _this.snapToBounds = function () {
            var _this$state = _this.state,
                position = _this$state.position,
                _this$state$cfg = _this$state.cfg,
                draggable = _this$state$cfg.draggable,
                boundBy = _this$state$cfg.boundBy;

            var node = _this.node;
            var x = position.x,
                y = position.y,
                left = position.left,
                right = position.right,
                top = position.top,
                bottom = position.bottom;

            var _node$getBoundingClie2 = node.getBoundingClientRect(),
                popWidth = _node$getBoundingClie2.width,
                popHeight = _node$getBoundingClie2.height;

            var _boundBy$getBoundingC2 = boundBy.getBoundingClientRect(),
                boundLeft = _boundBy$getBoundingC2.left,
                boundRight = _boundBy$getBoundingC2.right,
                boundTop = _boundBy$getBoundingC2.top,
                boundWidth = _boundBy$getBoundingC2.width,
                boundBottom = _boundBy$getBoundingC2.bottom;

            log.debug('snapToBounds', _lodash2.default.pick(node.getBoundingClientRect(), ['left', 'right', 'top', 'bottom', 'width', 'height']), _lodash2.default.pick(boundBy.getBoundingClientRect(), ['left', 'right', 'top', 'bottom', 'width', 'height']), position);

            var _actualPosition = {};
            var defaultX = left != null && right != null ? (left + right) / 2 : x;
            _actualPosition.left = defaultX;
            if (defaultX + popWidth > boundRight) {
                if (popWidth >= boundWidth) {
                    _actualPosition.left = boundLeft;
                    _actualPosition.maxWidth = boundWidth;
                } else {
                    _actualPosition.left = boundRight - popWidth;
                }
            }

            var aroundTop = top == null ? y : top;
            var aroundBottom = bottom == null ? y : bottom;
            _actualPosition.top = aroundBottom;
            if (aroundBottom + popHeight > boundBottom) {
                // pick above or below, whichever having more vertical space
                var aboveSpace = aroundTop - boundTop;
                var belowSpace = boundBottom - aroundBottom;
                if (aboveSpace > belowSpace) {
                    _actualPosition.top = aroundTop - popHeight;
                    _actualPosition.maxHeight = Math.min(aboveSpace, popHeight);
                } else {
                    _actualPosition.maxHeight = belowSpace;
                }
            }

            /*        if (pointy) {
                        _actualPosition.top += 6
                    }*/
            _this.setState({ _actualPosition: _actualPosition }, function () {
                draggable && _this.setDragBounds();
            });
        }, _this.close = function () {
            if (_this.isOpen()) {
                _this.setState({ open: false });
            }
        }, _this.isOpen = function () {
            return _this.state.open;
        }, _this.open = function (position, display) {
            var cfg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            if (_this.isOpen() && !cfg.updateOnly) {
                // close and re-open, so previous styles (including those calculated by browser)
                // are properly erased
                _this.setState({ open: false }, function () {
                    _this.open(position, display, cfg);
                });
            } else {
                _this.setState({
                    _actualPosition: null,
                    _dragBounds: null,
                    position: position,
                    display: display,
                    cfg: cfg,
                    open: true
                }, function () {
                    // snap to bounds after initial display
                    // so it can retrieve dom width/height
                    _this.snapToBounds();
                });
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Popover, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state,
                _actualPosition = _state._actualPosition,
                display = _state.display,
                _dragBounds = _state._dragBounds,
                _state$cfg = _state.cfg,
                draggable = _state$cfg.draggable,
                style = _state$cfg.style,
                className = _state$cfg.className,
                open = _state.open;


            if (!open) {
                return null;
            } else {
                var popoverContent = _react2.default.createElement(
                    'div',
                    {
                        ref: function ref(_ref2) {
                            _this2.node = _ref2;
                        },
                        className: (0, _classnames2.default)('c-popover pure-form', { /*pointy, */handle: draggable }, className),
                        style: _extends({}, style, _actualPosition) },
                    display
                );

                return draggable ? _react2.default.createElement(
                    _reactDraggable2.default,
                    { handle: '.handle', bounds: _dragBounds },
                    popoverContent
                ) : popoverContent;
            }
        }
    }]);

    return Popover;
}(_react2.default.Component);

Popover.propTypes = {};
exports.default = {

    /**
     * Open global popover<br>
     * Uses openId, with id='g-popover'. See [openId()]{@link module:popover.openId}
     *
     * @param {object} position - open popover at this position (or around a box to avoid overlaying on the box)
     * @param {number} position.x - x position to open popover at
     * @param {number} position.y - y position to open popover at
     * @param {number} position.left - left bound to open popover around
     * @param {number} position.right - right bound to open popover around
     * @param {number} position.top - top bound to open popover around
     * @param {number} position.bottom - bottom bound to open popover around
     * @param {renderable} display - What to display in popover?
     * @param {object} cfg - display config
     * @param {boolean} [cfg.draggable=false] - Allow to drag popover?
     * @param {HTMLElement} [cfg.boundBy=document.body] - Bound the popover to specific region, this will force reposition of the popover
     * @param {boolean} [cfg.pointy=false] - disabled for now
     * @param {object} [cfg.style={}] - style to deploy to the popover
     * @param {string} [cfg.className=''] - className for the popover
     *
     */
    open: function open(pos, display, cfg) {
        this.openId(GLOBAL_POPOVER_ID, pos, display, cfg);
    },


    /**
     * Open popover with a given id, id will be the handler key
     * @param {string} id - popover handler id
     * @param {object} position - open popover at this position (or around a box to avoid overlaying on the box)
     * @param {number} position.x - x position to open popover at
     * @param {number} position.y - y position to open popover at
     * @param {number} position.left - left bound to open popover around
     * @param {number} position.right - right bound to open popover around
     * @param {number} position.top - top bound to open popover around
     * @param {number} position.bottom - bottom bound to open popover around
     * @param {renderable} display - What to display in popover?
     * @param {object} cfg - display config
     * @param {boolean} [cfg.draggable=false] - Allow to drag popover?
     * @param {HTMLElement} [cfg.boundBy=document.body] - Bound the popover to specific region, this will force reposition of the popover
     * @param {boolean} [cfg.pointy=false] - disabled for now
     * @param {object} [cfg.style={}] - style to deploy to the popover
     * @param {string} [cfg.className=''] - className for the popover
     *
     * @example
     *
    import {Popover} from 'react-ui'
    Popover.openId(
    'my-popover-id',
    {x:15,y:15},
    <img src='...' style={{maxWidth:100,maxHeight:100}}/>,
    {boundBy:document.body, draggable:false}
    )
       */
    openId: function openId(id, pos, display, cfg) {
        if (!id) {
            log.error('openId:missing id');
            return;
        }

        cfg = _lodash2.default.defaults(cfg || {}, {
            draggable: false,
            boundBy: document.body,
            pointy: false,
            style: {},
            className: ''
        });

        var handle = handles[id];

        if (!handle) {
            var node = document.createElement('DIV');
            node.id = id;
            document.body.appendChild(node);
            handle = handles[id] = _reactDom2.default.render(_react2.default.createElement(Popover, null), document.getElementById(id));
        }
        var position = pos;

        if (pos && pos.target) {
            var rect = pos.target.getBoundingClientRect();
            position = _lodash2.default.pick(rect, ['x', 'y', 'left', 'right', 'top', 'bottom']);
        }

        handle.open(position, display, cfg);
    },


    /**
     * Close popover
     *
     * @example
    Popover.close();
     */
    close: function close() {
        this.closeId(GLOBAL_POPOVER_ID);
    },


    /**
     * Close popover for given id
     * @param {string} id - close popover for this id
     *
     * @example
    Popover.closeId('my-popover-id');
     */
    closeId: function closeId(id) {
        handles[id] && handles[id].close();
    }
};

/***/ }),

/***/ "../src/components/popup-dialog.js":
/*!*****************************************!*\
  !*** ../src/components/popup-dialog.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(/*! react-dom */ "../node_modules/react-dom/index.js");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _inputHelper = __webpack_require__(/*! ../utils/input-helper */ "../src/utils/input-helper.js");

var _modalDialog = __webpack_require__(/*! ./modal-dialog */ "../src/components/modal-dialog.js");

var _modalDialog2 = _interopRequireDefault(_modalDialog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @module popup-dialog
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @description A module to help with opening/closing **global** popup dialog<br>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * This is to replace traditional window.alert, window.confirm, window.prompt
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/popup-dialog');

var handles = {};

var TYPES = { ALERT: '1', CONFIRM: '2', PROMPT: '3' };

var GLOBAL_POPUP_ID = 'g-popup-container';

var PopupDialog = function (_React$Component) {
    _inherits(PopupDialog, _React$Component);

    function PopupDialog() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, PopupDialog);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = PopupDialog.__proto__ || Object.getPrototypeOf(PopupDialog)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            open: false,
            error: null
        }, _this.open = function (type, title, display, id, style, cancelText, confirmText, act) {
            _this.setState({
                type: TYPES[type.toUpperCase()],
                title: title,
                display: display,
                id: id,
                style: style,
                cancelText: cancelText,
                confirmText: confirmText,
                act: act,
                open: true,
                error: null
            });
        }, _this.handleConfirm = function () {
            var act = _this.state.act;

            var result = (0, _inputHelper.retrieveFormData)(_reactDom2.default.findDOMNode(_this));

            var p = act && act(true, result);
            if (p && p.then) {
                // is promise
                p.then(function () {
                    _this.handleError();
                }).catch(function (err) {
                    _this.handleError(err.message);
                });
            } else {
                _this.handleError(p);
            }
        }, _this.handleError = function (err) {
            if (err) {
                _this.setState({ error: err });
            } else {
                _this.close();
            }
        }, _this.close = function () {
            _this.setState({ open: false, error: null });
        }, _this.handleCancel = function () {
            var act = _this.state.act;


            act(false);
            _this.close();
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(PopupDialog, [{
        key: 'render',
        value: function render() {
            var _state = this.state,
                type = _state.type,
                title = _state.title,
                display = _state.display,
                id = _state.id,
                style = _state.style,
                cancelText = _state.cancelText,
                confirmText = _state.confirmText,
                open = _state.open,
                error = _state.error;


            if (!open) {
                return null;
            }
            switch (type) {
                case TYPES.ALERT:
                    return _react2.default.createElement(
                        _modalDialog2.default,
                        {
                            title: title,
                            id: id,
                            defaultAction: 'confirm',
                            closeAction: 'confirm',
                            contentClassName: 'pure-form',
                            actions: {
                                confirm: {
                                    handler: this.handleConfirm,
                                    text: confirmText
                                }
                            },
                            global: true,
                            draggable: true,
                            style: style },
                        display
                    );
                case TYPES.CONFIRM:
                case TYPES.PROMPT:
                    return _react2.default.createElement(
                        _modalDialog2.default,
                        {
                            title: title,
                            id: id,
                            info: error,
                            infoClassName: 'c-error',
                            defaultAction: 'cancel',
                            closeAction: 'cancel',
                            contentClassName: 'pure-form',
                            actions: {
                                cancel: { handler: this.handleCancel, className: 'standard', text: cancelText },
                                confirm: {
                                    handler: this.handleConfirm,
                                    text: confirmText
                                }
                            },
                            global: true,
                            draggable: true,
                            style: style },
                        display
                    );

                default:
                    return null;
            }
        }
    }]);

    return PopupDialog;
}(_react2.default.Component);

PopupDialog.propTypes = {};


function openId(type, id, args) {
    if (!id) {
        log.error('openId:missing id');
        return;
    }

    var handle = handles[id];

    if (!handle) {
        var node = document.createElement('DIV');
        node.id = id;
        document.body.appendChild(node);
        handle = handles[id] = _reactDom2.default.render(_react2.default.createElement(PopupDialog, null), document.getElementById(id));
    }
    if (!_lodash2.default.isObject(args)) {
        args = { display: args };
    }

    handle.open(type, args.title, args.display, args.id, args.style, args.cancelText || 'Cancel', args.confirmText || 'Confirm', args.act);
}

function openIdIf(type, id, condition, args) {
    if (condition) {
        openId(type, id, args);
    } else {
        args.act(true);
    }
}

function closeId(id) {
    handles[id] && handles[id].close();
}

/**
 * Config for the popup dialog
 * @typedef {object} PopupConfig
 * @property {renderable} [title] - Title of the dialog
 * @property {renderable} display - What to display in the dialog
 * @property {string} [id] - Container dom #id
 * @property {object} [style] - Style to apply to the container
 * @property {string} [cancelText='Cancel'] - Cancel button text, only used with prompt & confirm dialogs
 * @property {string} [confirmText='Confirm'] - Confirm button text
 * @property {function} act - Action to perform when submit buttn clicked.<br>Can return a promise or error text
 * @property {boolean} act.confirmed - did the user say 'ok'?
 * @property {object} act.data - Input data embedded inside display, only used with prompt & confirm dialogs
 */

exports.default = {
    /**
     * Open alert box
     * @param {PopupConfig | renderable} cfg - Popup config, or simple renderable string
     *
     * @example
     *
    import {PopupDialog} from 'react-ui'
    PopupDialog.alertId('g-custom-alert-container', 'Test')
    PopupDialog.alert('Test')
    PopupDialog.alert({display:'Test', act:(confirmed)=>{
    console.log('User is okay? ',confirmed)
    }})
     */
    alert: openId.bind(null, 'alert', GLOBAL_POPUP_ID),
    alertId: openId.bind(null, 'alert'),

    /**
     * Open confirm box
     * @param {PopupConfig | renderable} cfg - Popup config, or simple renderable string
     *
     * @example
     *
    import {PopupDialog} from 'react-ui'
    PopupDialog.confirm({
    display:'Fetch more data?',
    cancelText: 'No!',
    confirmText: 'Go Ahead',
    act:(confirmed)=>{
        if (confirmed) {
            $.get('...') // get more data
        }
    }
    })
     */
    confirm: openId.bind(null, 'confirm', GLOBAL_POPUP_ID),
    confirmId: openId.bind(null, 'confirm'),

    /**
     * Open confirm box if condition is satisfied.<br>
     * If condition is not satisfied (ie no need to confirm), act will be fired with confirmed=true
     * @param {boolean} condition - Should confirm first before proceed?
     * @param {PopupConfig | renderable} cfg - Popup config, or simple renderable string
     *
     * @example
     *
    import Promise from 'bluebird'
    import {PopupDialog} from 'react-ui'
    let userDidNotEnterAddress = !user.address;
    PopupDialog.confirmIf(userDidNotEnterAddress, {
    display:'You have not entered address, are you sure you want to proceed?',
    act:(confirmed)=>{
        if (confirmed) {
            // note if user has entered address, then it will reach here without popup
            return Promise.resolve($.post('/api/save/user',{data:user})) // post user information
            // if post returned with error (eg 404), error message will be displayed
        }
    }
    })
     */
    confirmIf: openIdIf.bind(null, 'confirm', GLOBAL_POPUP_ID),
    confirmIdIf: openIdIf.bind(null, 'confirm'),

    /**
     * Open prompt box
     * @param {PopupConfig | renderable} cfg - Popup config, or simple renderable string
     *
     * @example
     *
    import Promise from 'bluebird'
    import {PopupDialog} from 'react-ui'
    PopupDialog.prompt({
    display: <div>
        <label htmlFor='name'>Name</label><input id='name'/>
        <label htmlFor='phone'>Phone</label><input id='phone'/>
        <label htmlFor='address'>Address</label><input id='address'/>
    </div>,
    act:(confirmed, data)=>{
        if (confirmed) {
            console.log(data) // {name:'abc', phone:'012345678', address:'Taiwan'}
            return Promise.resolve($.post('/api/save/user',data)) // post user information
        }
    }
    })
     */
    prompt: openId.bind(null, 'prompt', GLOBAL_POPUP_ID),
    promptId: openId.bind(null, 'prompt'),

    /**
     * Close popup dialog
     *
     * @example
     *
    import {PopupDialog} from 'react-ui'
    PopupDialog.close()
    PopupDialog.closeId('g-g-custom-alert-container')
     */
    close: closeId.bind(null, GLOBAL_POPUP_ID),
    closeId: closeId
};

/***/ }),

/***/ "../src/components/progress.js":
/*!*************************************!*\
  !*** ../src/components/progress.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(/*! react-dom */ "../node_modules/react-dom/index.js");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _modalDialog = __webpack_require__(/*! ./modal-dialog */ "../src/components/modal-dialog.js");

var _modalDialog2 = _interopRequireDefault(_modalDialog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @module progress
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @description A module to help with blocking user access by displaying a shield and text.<br>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * It supports various styles of display.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * * Progress.startXxxxx starts up blocking display
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * * Progress.setXxxxx updates blocking display
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * * Progress.done closes blocking display
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/progress');

var globalProgress = null;

var INITIAL_STATE = {
    display: null,
    loaded: null,
    total: null,
    className: '',
    style: {}
};

var Progress = function (_React$Component) {
    _inherits(Progress, _React$Component);

    function Progress() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Progress);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Progress.__proto__ || Object.getPrototypeOf(Progress)).call.apply(_ref, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Progress, [{
        key: 'render',
        value: function render() {
            var _state = this.state,
                display = _state.display,
                loaded = _state.loaded,
                total = _state.total,
                opacity = _state.opacity,
                className = _state.className,
                style = _state.style,
                global = _state.global;


            return _react2.default.createElement(
                _modalDialog2.default,
                {
                    id: 'g-progress',
                    show: !!display,
                    opacity: opacity,
                    global: global,
                    useTransition: true,
                    className: className, style: style },
                display,
                total && _react2.default.createElement('progress', { value: loaded, max: total }),
                total && _react2.default.createElement(
                    'span',
                    null,
                    Math.floor(loaded / total * 100),
                    '%'
                )
            );
        }
    }]);

    return Progress;
}(_react2.default.Component);

Progress.propTypes = {};

var _initialiseProps = function _initialiseProps() {
    var _this3 = this;

    this.state = _lodash2.default.clone(INITIAL_STATE);

    this.setDisplay = function (display) {
        _this3.setState({ display: display });
    };

    this.setProgress = function (loaded, total) {
        _this3.setState({ loaded: loaded, total: total });
    };

    this.open = function (args) {
        _this3.setState(_extends({ global: true, opacity: 0.5 }, args));
    };

    this.done = function () {
        _this3.setState(_lodash2.default.clone(INITIAL_STATE));
    };
};

var Shield = function (_React$Component2) {
    _inherits(Shield, _React$Component2);

    function Shield() {
        var _ref2;

        var _temp2, _this2, _ret2;

        _classCallCheck(this, Shield);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = _possibleConstructorReturn(this, (_ref2 = Shield.__proto__ || Object.getPrototypeOf(Shield)).call.apply(_ref2, [this].concat(args))), _this2), _initialiseProps2.call(_this2), _temp2), _possibleConstructorReturn(_this2, _ret2);
    }

    _createClass(Shield, [{
        key: 'render',
        value: function render() {
            var _state2 = this.state,
                show = _state2.show,
                opacity = _state2.opacity;

            return _react2.default.createElement(
                'section',
                { id: 'g-progress', className: (0, _classnames2.default)('c-modal', { show: show }) },
                _react2.default.createElement('div', { id: 'overlay', style: { opacity: opacity } })
            );
        }
    }]);

    return Shield;
}(_react2.default.Component);

Shield.propTypes = {};

var _initialiseProps2 = function _initialiseProps2() {
    var _this4 = this;

    this.state = {
        show: false
    };

    this.open = function (args) {
        _this4.setState(_extends({}, args, { show: true }));
    };

    this.done = function () {
        _this4.setState({ show: false });
    };
};

function showProgress(args, shieldOnly) {
    if (!globalProgress) {
        var node = document.createElement('DIV');
        node.id = 'g-progress-container';
        document.body.appendChild(node);
        globalProgress = _reactDom2.default.render(shieldOnly ? _react2.default.createElement(Shield, null) : _react2.default.createElement(Progress, null), document.getElementById('g-progress-container'));
    }
    globalProgress.open(args);
}

exports.default = {
    /**
     * Show blocking display
     * @param {object} cfg - Display config
     * @param {number} [cfg.opacity=0.5] -
     * @param {*} [cfg.className] -
     * @param {boolean} [cfg.global=true] -
     * @param {renderable} cfg.display -
     * @param {object} [cfg.style] -
     *
     * @example
     *
    import {Progress} from 'react-ui'
    Progress.start({
    className:['my-class-name','my-other-class-name'],
    display:<div>In progress...</div>
    })
       */
    start: function start(args) {
        showProgress(args);
    },


    /**
     * Show blocking progress display
     * @param {renderable} display -
     *
     * @example
     *
    import {Progress} from 'react-ui'
    Progress.startProgress(<div>Start upload...</div>)
       */
    startProgress: function startProgress(display) {
        showProgress({
            opacity: 0.5,
            className: 'progress-bar',
            display: display
        });
    },


    /**
     * Show blocking spinner
     *
     * @example
     *
    import {Progress} from 'react-ui'
    Progress.startSpin()
       */
    startSpin: function startSpin() {
        showProgress({
            opacity: 0.2,
            className: 'spin',
            display: _react2.default.createElement('i', { style: { fontSize: '1.8em', margin: '10px' }, className: 'fg fg-loading-2 fg-spin' })
        });
    },


    /**
     * Show blocking transparent shield
     *
     * @example
     *
    import {Progress} from 'react-ui'
    Progress.startShield()
       */
    startShield: function startShield() {
        showProgress({ opacity: 0 }, true);
    },


    /**
     * Update display text
     *
     * @example
     *
    import {Progress} from 'react-ui'
    Progress.set(<div>5 more minutes...</div>)
       */
    set: function set(display) {
        globalProgress.setDisplay(display);
    },


    /**
     * Update percentage information
     * @param {number} complete - complete count
     * @param {number} total - total count
     *
     * @example
     *
    import {Progress} from 'react-ui'
    Progress.setProgress(1,40) // will display 2.5%
       */
    setProgress: function setProgress(loaded, total) {
        globalProgress.setProgress(loaded, total);
    },


    /**
     * Turn off blocking display
     * @param {number} [delay=0] - turn off after specified time (in milliseconds)
     *
     * @example
     *
    import {Progress} from 'react-ui'
    Progress.done()
    Progress.done(3000)
       */
    done: function done() {
        var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        setTimeout(function () {
            globalProgress.done();
        }, delay);
    }
};

/***/ }),

/***/ "../src/components/radio-group.js":
/*!****************************************!*\
  !*** ../src/components/radio-group.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

var _listNormalizer = __webpack_require__(/*! ../hoc/list-normalizer */ "../src/hoc/list-normalizer.js");

var _listNormalizer2 = _interopRequireDefault(_listNormalizer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/radio-group');

/**
 * A React Radio Group
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {Array.<object>} list - List of options
 * @param {string | number} list.value - item value
 * @param {string} list.text - item display text
 * @param {renderable} [list.children] - things to render after the label
 * @param {string} [className] - Classname for the container
 * @param {string|number} [defaultValue] - Default selected value
 * @param {string|number} [value] - Current selected value
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {boolean} [disabled=false] - Is selection disabled?
 * @param {function} [onChange] - Callback function when value is selected. <br> Required when value prop is supplied
 * @param {string|number} onChange.value - selected value
 * @param {object} onChange.eventInfo - event related info
 * @param {string|number} onChange.eventInfo.before - previously selected value
 *
 * @example
// controlled

import {RadioGroup} from 'react-ui'
React.createClass({
    getInitialState() {
        return {
            movie:'oz'
        }
    },
    handleChange(movie) {
        this.setState({movie})
    },
    render() {
        let {movie} = this.state;
        return <div>
            <label>Select a movie</label>
            <RadioGroup id='movie'
                list={[
                    {value:'dory',text:'dory - Finding Dory'},
                    {value:'oz',text:'oz - Wizard of Oz'},
                    {value:'kane',text:'kane - Citizen Kane',children:<input defaultValue='abc'/>}
                ]}
                onChange={this.handleChange}
                value={movie}/>
        </div>
    }
})
 */

var RadioGroup = function (_React$Component) {
    _inherits(RadioGroup, _React$Component);

    function RadioGroup() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, RadioGroup);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = RadioGroup.__proto__ || Object.getPrototypeOf(RadioGroup)).call.apply(_ref, [this].concat(args))), _this), _this.handleChange = function (evt) {
            var onChange = _this.props.onChange;

            onChange(evt.target.value);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(RadioGroup, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                list = _props.list,
                value = _props.value,
                disabled = _props.disabled,
                className = _props.className;


            var onChange = this.handleChange;

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-radio-group', className) },
                _lodash2.default.map(list, function (_ref2) {
                    var itemValue = _ref2.value,
                        itemText = _ref2.text,
                        children = _ref2.children;

                    return _react2.default.createElement(
                        'div',
                        { key: itemValue, className: 'list-item' },
                        _react2.default.createElement('input', {
                            id: id + '-' + itemValue,
                            type: 'radio',
                            onChange: disabled ? null : onChange // workaround for IE: double click on disabled will still trigger onChange
                            , value: itemValue,
                            checked: value + '' === itemValue + '',
                            disabled: disabled }),
                        _react2.default.createElement(
                            'label',
                            { htmlFor: id + '-' + itemValue, key: itemValue, className: itemValue },
                            itemText
                        ),
                        children
                    );
                })
            );
        }
    }]);

    return RadioGroup;
}(_react2.default.Component);

RadioGroup.propTypes = {
    id: _propTypes2.default.string,
    list: _propTypes3.LIST_PROP,
    className: _propTypes2.default.string,
    value: _propTypes3.SIMPLE_VALUE_PROP,
    disabled: _propTypes2.default.bool,
    onChange: _propTypes2.default.func
};
RadioGroup.defaultProps = {
    disabled: false
};
exports.default = (0, _propWire.wireValue)((0, _listNormalizer2.default)(RadioGroup));

/***/ }),

/***/ "../src/components/range-calendar.js":
/*!*******************************************!*\
  !*** ../src/components/range-calendar.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// import PropTypes from 'prop-types';
// import React from 'react'
// import createReactClass from 'create-react-class';
// import _ from 'lodash'
// import $ from 'jquery'
// import cx from 'classnames'
// import Moment from 'moment'
// import flatpickr from 'flatpickr'
// import flatpickrStyles from 'flatpickr/dist/flatpickr.min.css' // eslint-disable-line no-unused-vars

// // Add more locales here
// import {Mandarin as zh} from 'flatpickr/dist/l10n/zh'

// import Popover from './popover'
// import {wire} from '../hoc/prop-wire'
// import { SIMPLE_VALUE_PROP } from '../consts/prop-types'
// import ih from '../utils/input-helper'
// import {flatpickrToMomentToken} from '../utils/date'

// let log = require('loglevel').getLogger('react-ui/components/date-range')

// const DATE_PROP_TYPE = PropTypes.shape({
//     from: SIMPLE_VALUE_PROP,
//     to: SIMPLE_VALUE_PROP
// })

// const DATE_TIME_SUFFIX = {
//     daySuffix: /(st)|(nd)|(rd)|(th)/g,
//     timeSuffix: /(AM)|(PM)/ig
// }

// const LABELS = {
//     from: 'From',
//     to: 'To',
//     shortcut: 'Shortcut for Last Period',
//     done: 'Done'
// }

// /**
//  * A React DateRange Component, containing a 'from' date input and a 'to' date input<br>
//  * Uses [flatpickr]{@link https://chmln.github.io/flatpickr/#options}
//  *
//  * @constructor
//  * @param {string} [id] - Container element #id
//  * @param {string} [className] - Classname for the container
//  * @param {object} [defaultValue] - Default selected range
//  * @param {string} defaultValue.from - Default selected from
//  * @param {string} defaultValue.to - Default selected to
//  * @param {object} [value] - Current selected range
//  * @param {string} value.from - Current selected from
//  * @param {string} value.to - Current selected to
//  * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
//  * @param {*} valueLink.value - value to update
//  * @param {function} valueLink.requestChange - function to request value change
//  * @param {boolean} [allowKeyIn=true] - Allow user key in to the from/to input?
//  * @param {boolean} [disabled=false] - Is this field disabled?
//  * @param {boolean} [readOnly=false] - Is this field readonly?
//  * @param {boolean} [required=false] - Is this field required?
//  * @param {function} [onChange] - Callback function when from/to is changed. <br> Required when value prop is supplied
//  * @param {object} onChange.value - current value
//  * @param {string} onChange.value.from - current from
//  * @param {string} onChange.value.to - current to
//  * @param {object} onChange.eventInfo - event related info
//  * @param {object} onChange.eventInfo.before - previously enetered value
//  * @param {string} [dateFormat='Y-m-d'] - Date format. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
//  * @param {string} [timeFormat='H:i'] - Time format. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
//  * @param {boolean} [enableTime=false] - Enable selection and display of time
//  * @param {boolean} [enableAMPM=false] - Enable AM/PM option on calendar
//  * @param {boolean | Array.<object>} [shortcut=false] - Shortcut for quickly select last periods. When specified as 'true', will show shortcuts for last 1 day/week/month/year
//  * @param {number} shortcut.value - Period value
//  * @param {string} shortcut.unit - Period value's unit. Possible values include 'minutes', 'hours', 'weeks', 'months', 'quarters', 'years'
//  * @param {string} shortcut.text - Text of shortcut
//  * @param {object} [labels] - Texts of "From", "To", "Shortcut" and "Done" labels
//  * @param {string} [labels.from="From"] - Text of "From" label
//  * @param {string} [labels.to="To"] - Text of "To" label
//  * @param {string} [labels.shortcut="Shortcut for Last Period"] - Text of "Short" label
//  * @param {string} [labels.done="Done"] - Text of "Done" button
//  * @param {string} [locale] - Datepicker locale. Values can be 'en', 'zh', etc. See Flatpickr {@link https://chmln.github.io/flatpickr/#options}
//  * @param {fuction} [t] - Transform/translate error into readable message.<br>
//  * @param {object} t.params - Parameters relevant to the error code
//  * @param {string} t.params.field - offending field id
//  * @param {string} t.params.value - offending field value
//  * @param {string} t.params.pattern - pattern the value was supposed to follow
//  *
//  * @example
// // controlled

// import {RangeCalendar} from 'react-ui'

// React.createClass({
//     getInitialState() {
//         return {
//             date: {
//                 from: '2012-04-26',
//                 to: '2012-10-26'
//             },
//             datetime: {
//                 from: '2012-10-26 12:00',
//                 to: '2012-10-26 17:00'
//             }
//         }
//     },
//     handleChange(field, value) {
//         this.setState({[field]:value})
//     },
//     render() {
//         let {date, datetime} = this.state
//         return <div className='c-form'>
//             <div>
//                 <label htmlFor='date'>Select Date Range</label>
//                 <RangeCalendar
//                     id='date'
//                     onChange={this.handleChange.bind(this, 'date')}
//                     value={date}
//                     shortcut
//                     t={(code, params) => {
//                         if (code === 'missing') { return 'Please input date' }
//                         else {
//                             return `Invalid date format. Should be ${params.pattern}`
//                         }
//                     }} />
//             </div>
//             <div>
//                 <label htmlFor='datetime'>Select Date Time Range</label>
//                 <RangeCalendar
//                     id='datetime'
//                     onChange={this.handleChange.bind(this, 'datetime')}
//                     enableTime={true}
//                     value={datetime}
//                     shortcut={
//                         [
//                             {value:1, text:'Hour', unit:'hours'},
//                             {value:1, text:'Day', unit:'days'},
//                             {value:1, text:'Month', unit:'months'},
//                             {value:1, text:'Quarter', unit:'quarters'},
//                             {value:1, text:'Year', unit:'years'},
//                         ]
//                     }
//                     t={(code, params) => {
//                         if (code === 'missing') { return 'Please input date' }
//                         else {
//                             return `Invalid date format. Should be ${params.pattern}`
//                         }
//                     }} />
//             </div>
//         </div>
//     }
// })
// */

// const RangeCalendar = createReactClass({
//     displayName: 'RangeCalendar',

//     propTypes: {
//         id: PropTypes.string,
//         className: PropTypes.string,
//         value: DATE_PROP_TYPE,
//         allowKeyIn: PropTypes.bool,
//         disabled: PropTypes.bool,
//         readOnly: PropTypes.bool,
//         required: PropTypes.bool,
//         onChange: PropTypes.func,
//         dateFormat: PropTypes.string,
//         timeFormat: PropTypes.string,
//         enableTime: PropTypes.bool,
//         enableAMPM: PropTypes.bool,
//         shortcut: PropTypes.oneOfType([
//             PropTypes.bool,
//             PropTypes.arrayOf(PropTypes.shape({
//                 value: PropTypes.number,
//                 unit: PropTypes.string,
//                 text: PropTypes.string
//             }))
//         ]),
//         locale: PropTypes.string,
//         labels: PropTypes.shape({
//             from: PropTypes.string,
//             to: PropTypes.string,
//             shortcut: PropTypes.string,
//             done: PropTypes.string
//         }),
//         t: PropTypes.func
//     },

//     getDefaultProps() {
//         return {
//             dateFormat: 'Y-m-d',
//             timeFormat: 'H:i',
//             disabled: false,
//             readOnly: false,
//             required: false,
//             allowKeyIn: true,
//             enableTime: false,
//             enableAMPM: false,
//             shortcut: false,
//             locale: 'en',
//             labels: LABELS
//         }
//     },

//     getInitialState() {
//         const {value} = this.props

//         return {
//             prevFrom: value.from,
//             prevTo: value.to,
//             show: false
//         }
//     },

//     componentDidMount() {
//         let {dateFormat, timeFormat, enableTime, enableAMPM, allowKeyIn:allowInput, locale} = this.props

//         this.isMounted = true

//         let loc = null
//         switch (locale) {
//             case 'zh': loc = zh; break
//             default: loc = null
//         }

//         this.FORMAT = flatpickrToMomentToken(dateFormat, timeFormat, enableTime)

//         if (enableTime) {
//             dateFormat = dateFormat + ' ' + timeFormat
//         }

//         this.datePicker = {
//             from: flatpickr(this.dateFrom, {
//                 enableTime,
//                 allowInput,
//                 dateFormat,
//                 locale: loc,
//                 time_24hr: !enableAMPM,
//                 appendTo: this.fromWrapper,
//                 inline: true,
//                 onChange: () => {
//                     this.checkCross('from')
//                     this.handleChange()
//                 }
//             }),
//             to: flatpickr(this.dateTo, {
//                 enableTime,
//                 allowInput,
//                 dateFormat,
//                 locale: loc,
//                 time_24hr: !enableAMPM,
//                 appendTo: this.toWrapper,
//                 inline: true,
//                 onChange: () => {
//                     this.checkCross('to')
//                     this.handleChange()
//                 }
//             })
//         }
//     },

//     componentWillReceiveProps(nextProps) {
//         const {value, locale} = nextProps

//         let loc = null
//         switch (locale) {
//             case 'zh': loc = zh; break
//             default: loc = null
//         }

//         this.datePicker.from.set('locale', loc)
//         this.datePicker.to.set('locale', loc)
//         this.datePicker.from.setDate(this.strToTimestamp(value.from), false)
//         this.datePicker.to.setDate(this.strToTimestamp(value.to), false)

//         this.setState({
//             prevFrom: value.from,
//             prevTo: value.to
//         })
//     },

//     componentWillUnmount() {
//         this.isMounted = false
//         this.datePicker.from.destroy()
//         this.datePicker.to.destroy()
//     },

//     strToTimestamp(str) {
//         const {enableTime} = this.props
//         // Remove the day suffix since moment can't resolve it
//         const parsedStr = str.replace(DATE_TIME_SUFFIX.daySuffix, '')
//         const momentFormat = enableTime ? `${this.FORMAT.date} ${this.FORMAT.time}` : this.FORMAT.date
//         return Moment(parsedStr, momentFormat).valueOf()
//     },

//     handleChange() {
//         const {onChange} = this.props
//         onChange({from:this.dateFrom.value, to:this.dateTo.value})
//     },

//     handleInputChange(type, evt) {
//         const {required} = this.props
//         const newDate = evt.target.value

//         const parseDate = this.strToTimestamp(newDate)

//         const isValid = this.validateDateFormat(newDate)
//         const errMsg = this.generateErrorMsg(type, newDate)

//         if (!isNaN(parseDate)) {
//             // Move the calendar view to the current value's location
//             this.datePicker[type].jumpToDate(parseDate)

//             if (isValid) {
//                 Popover.closeId(`err-${type}`)

//                 // setDate() accepts date string & Date object
//                 // If set the 2nd parameter as true, it will recursively call itself here
//                 this.datePicker[type].setDate(parseDate, false)
//                 this.handleChange()

//                 this.checkCross(type)
//             }
//             else {
//                 Popover.openId(
//                     `err-${type}`,
//                     evt,
//                     <span>{errMsg}</span>,
//                     {pointy:true}
//                 )
//             }
//         }
//         else {
//             if (required || newDate !== '') {
//                 Popover.openId(
//                     `err-${type}`,
//                     evt,
//                     <span>{errMsg}</span>,
//                     {pointy:true}
//                 )
//             }
//             else {
//                 Popover.closeId(`err-${type}`)
//             }
//         }
//     },

//     handleBlur(type, evt) {
//         Popover.closeId(`err-${type}`)

//         const {required} = this.props
//         const newDate = evt.target.value

//         const isValid = this.validateDateFormat(newDate)
//         const field = (type === 'from') ? 'prevFrom' : 'prevTo'
//         const prevDate = (type === 'from') ? this.state.prevFrom : this.state.prevTo

//         if (isValid) {
//             // Prevent requiring double-click when select date
//             if (newDate !== prevDate) {
//                 this.datePicker[type].setDate(newDate)
//                 this.setState({[field]:newDate})
//             }

//             this.checkCross(type)
//         }
//         else {
//             // Reset to previous valid value
//             if (required) {
//                 this.datePicker[type].setDate(prevDate)
//             }
//             else {
//                 this.datePicker[type].setDate('')
//                 this.handleChange()
//             }
//         }
//     },

//     handleToggle() {
//         const {show:prevShow} = this.state
//         const show = !prevShow
//         if (show) {
//             // Hide the calendar when click outside
//             $(document).click(event => {
//                 const isOutSide = !$(event.target).closest(this.dateDisplay).length
//                                 && !$(event.target).closest(this.dateWrapper).length

//                 if (isOutSide) {
//                     this.handleToggle()
//                 }
//             })
//         }
//         else {
//             $(document).off()
//         }
//         this.isMounted && this.setState({show})
//     },

//     handleClick(period, unit) {
//         const {onChange} = this.props
//         const now = Moment().valueOf()
//         const backTo = Moment().subtract(period, unit).valueOf()

//         this.datePicker.from.setDate(backTo, false)
//         this.datePicker.to.setDate(now, false)

//         onChange({from:this.dateFrom.value, to:this.dateTo.value})
//     },

//     validateDateFormat(dateStr) {
//         const {enableTime} = this.props
//         let isValid = false

//         if (enableTime) {
//             isValid = Moment(dateStr, `${this.FORMAT.date} ${this.FORMAT.time}`, true).isValid()

//             // Momentjs validation accepts single (a|A|p|P) for AM/PM
//             // This is for ensuring user input complete 'AM/PM' term when AM/PM is enabled
//             if (this.FORMAT.time.indexOf('A') !== -1 && dateStr.search(DATE_TIME_SUFFIX.timeSuffix) === -1) {
//                 isValid = false
//             }
//         }
//         else {
//             isValid = Moment(dateStr, `${this.FORMAT.date}`, true).isValid()
//         }

//         return isValid
//     },

//     checkCross(type) {
//         const dateFrom = this.strToTimestamp(this.dateFrom.value)
//         const dateTo = this.strToTimestamp(this.dateTo.value)

//         if (dateFrom !== dateTo) {
//             if (type === 'from') {
//                 const isAfter = Moment(dateFrom).isAfter(dateTo)

//                 if (isAfter) {
//                     this.datePicker.to.setDate(dateFrom, false)
//                     this.handleChange()
//                 }
//             }
//             else {
//                 const isBefore = Moment(dateTo).isBefore(dateFrom)

//                 if (isBefore) {
//                     this.datePicker.from.setDate(dateTo, false)
//                     this.handleChange()
//                 }
//             }
//         }
//     },

//     generateErrorMsg(type, dateStr) {
//         const {id, enableTime, required, t} = this.props
//         const datePattern = this.FORMAT.date
//         const timePattern = (this.FORMAT.time.indexOf('A') !== -1) ? this.FORMAT.time.replace('A', 'AM/PM') : this.FORMAT.time

//         const pattern = enableTime ? `${datePattern} ${timePattern}` : datePattern

//         return ih.validateField(dateStr, {name:`${id}-${type}`, type:'date', required, pattern}, t?{et:t}:true)
//     },

//     renderShortcut() {
//         const {id, labels:{shortcut:label}, shortcut} = this.props

//         if (typeof shortcut === 'boolean') {
//             return <div className='shortcut'>
//                 <label htmlFor={`${(id || 'date')}-shortcut`}>{label || LABELS.shortcut}</label>
//                 <div id={`${(id || 'date')}-shortcut`}>
//                     <button onClick={this.handleClick.bind(this, 1, 'days')}>Day</button>
//                     <button onClick={this.handleClick.bind(this, 1, 'weeks')}>Week</button>
//                     <button onClick={this.handleClick.bind(this, 1, 'months')}>Month</button>
//                     <button onClick={this.handleClick.bind(this, 1, 'years')}>Year</button>
//                 </div>
//             </div>
//         }
//         else {
//             return <div className='shortcut'>
//                 <label htmlFor={`${(id || 'date')}-shortcut`}>{label || LABELS.shortcut}</label>
//                 <div id={`${(id || 'date')}-shortcut`}>
//                     {
//                         _.map(shortcut, ({value, text, unit}) => {
//                             return <button key={text} onClick={this.handleClick.bind(this, value, unit)}>
//                                 {text}
//                             </button>
//                         })
//                     }
//                 </div>
//             </div>
//         }
//     },

//     render() {
//         const {id, value, className, readOnly, disabled, required,
//             allowKeyIn, enableTime, shortcut, labels: keyLabel} = this.props
//         const {show} = this.state
//         const labels = {...LABELS, ...keyLabel}

//         return <div id={id} className={cx('c-range-calendar', className)}>
//             <div ref={ref => { this.dateDisplay = ref }} className='date-display'>
//                 <input
//                     type='text'
//                     readOnly
//                     required={required}
//                     value={value.from + ' - ' + value.to}
//                     onClick={this.handleToggle} />
//                 <i className='fg fg-calendar' onClick={this.handleToggle} />
//             </div>
//             <div ref={ref => { this.dateWrapper = ref }} className={cx('date-wrapper', {show, large:enableTime})}>
//                 <div ref={ref => { this.fromWrapper = ref }} className='date-calendar' />
//                 <div ref={ref => { this.toWrapper = ref }} className='date-calendar' />
//                 <div className='c-form nopad'>
//                     <div>
//                         <label htmlFor={`${(id || 'date')}-from`}>{labels.from}</label>
//                         <input
//                             id={`${(id || 'date')}-from`}
//                             type='text'
//                             ref={ref => { this.dateFrom=ref }}
//                             disabled={disabled}
//                             readOnly={readOnly}
//                             required={required}
//                             onChange={allowKeyIn ? this.handleInputChange.bind(this, 'from') : null}
//                             onBlur={this.handleBlur.bind(this, 'from')}
//                             defaultValue={value.from} />
//                     </div>
//                     <div>
//                         <label htmlFor={`${(id || 'date')}-to`}>{labels.to}</label>
//                         <input
//                             id={`${(id || 'date')}-to`}
//                             type='text'
//                             ref={ref => { this.dateTo=ref }}
//                             disabled={disabled}
//                             readOnly={readOnly}
//                             required={required}
//                             onChange={allowKeyIn ? this.handleInputChange.bind(this, 'to') : null}
//                             onBlur={this.handleBlur.bind(this, 'to')}
//                             defaultValue={value.to} />
//                     </div>
//                     { shortcut && this.renderShortcut() }
//                     <button className='end btn-done' onClick={this.handleToggle}>{labels.done}</button>
//                 </div>
//             </div>
//         </div>
//     },
// })

// export default wire(RangeCalendar, 'value', {})


/***/ }),

/***/ "../src/components/search.js":
/*!***********************************!*\
  !*** ../src/components/search.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _propTypes3 = __webpack_require__(/*! ../consts/prop-types */ "../src/consts/prop-types.js");

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/search');

/**
A React Search bar
 * @constructor
 * @param {string} [id] - container element #id
 * @param {string} [className] - Classname for the container
 * @param {string} [placeholder] - Placeholder for search input
 * @param {string|number} [defaultValue] - Default search value
 * @param {string|number} [value] - Current search value
 * @param {boolean} [enableClear=true] - Can this field be cleared?
 * @param {boolean} [interactive=false] - Determine if search is interactive<br>
 * @param {number} [delaySearch=0] - If search is interactive, this setting will trigger onSearch event after *delaySearch* milliseconds<br>
 * true: onSearch event called as user types; <br>
 * false: onSearch event called when user hits enter
 * @param {function} [onSearch] - Callback function when search is changed. <br> Required when value prop is supplied
 * @param {string|number} onSearch.search - updated search value
 *
 * @example

import {Search} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            movies:[]
        }
    },
    handleSearch(search) {
        // after ajax request get back list of movies
        let movies = ['My big fat greek wedding','Starlight Hotel']
        this.setState({movies})
    },
    render() {
        let {movies} = this.state;
        return <div>
            <Search placeholder='Please enter movie title' onSearch={this.handleSearch}/>
            <div>
            {
                _.map(movies, (movie, i)=>`${i}. ${movie}`)
            }
            </div>
        </div>
    }
})
 */

var Search = function (_React$Component) {
    _inherits(Search, _React$Component);

    function Search(props) {
        _classCallCheck(this, Search);

        var _this = _possibleConstructorReturn(this, (Search.__proto__ || Object.getPrototypeOf(Search)).call(this, props));

        _initialiseProps.call(_this);

        var value = props.value;


        _this.state = {
            value: value
        };
        return _this;
    }

    _createClass(Search, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var value = nextProps.value;

            this.setState({
                value: value
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                enableClear = _props.enableClear,
                placeholder = _props.placeholder;
            var value = this.state.value;


            return _react2.default.createElement(
                'span',
                { id: id, ref: function ref(_ref2) {
                        _this2.node = _ref2;
                    }, className: (0, _classnames2.default)('c-search', className, { clearable: enableClear }) },
                _react2.default.createElement('input', {
                    ref: function ref(_ref) {
                        _this2.input = _ref;
                    },
                    type: 'text',
                    value: value,
                    placeholder: placeholder,
                    onKeyDown: this.handleKeyDown,
                    onChange: function onChange(evt) {
                        _this2.handleSearch(evt.target.value, false);
                    } }),
                _react2.default.createElement(
                    'span',
                    { className: 'actions c-flex aic' },
                    enableClear && _react2.default.createElement('i', { className: 'fg fg-close', onClick: function onClick() {
                            _this2.handleSearch('', true);
                        } }),
                    _react2.default.createElement('i', { className: 'fg fg-search', onClick: function onClick() {
                            _this2.handleSearch(value, true);
                        } })
                )
            );
        }
    }]);

    return Search;
}(_react2.default.Component);

Search.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    placeholder: _propTypes3.SIMPLE_VALUE_PROP,
    value: _propTypes3.SIMPLE_VALUE_PROP,
    onSearch: _propTypes2.default.func.isRequired,
    enableClear: _propTypes2.default.bool,
    interactive: _propTypes2.default.bool,
    delaySearch: _propTypes2.default.number
};
Search.defaultProps = {
    enableClear: false,
    interactive: false,
    delaySearch: 0
};

var _initialiseProps = function _initialiseProps() {
    var _this3 = this;

    this.focus = function () {
        _this3.input.focus();
    };

    this.handleSearch = function (value, force) {
        var _props2 = _this3.props,
            interactive = _props2.interactive,
            onSearch = _props2.onSearch,
            delaySearch = _props2.delaySearch;

        if (force || interactive) {
            var searchText = _lodash2.default.trim(value).toLowerCase();
            if (interactive) {
                if (_this3.timer) {
                    clearTimeout(_this3.timer);
                    delete _this3.timer;
                }

                _this3.setState({ value: value }, function () {
                    _this3.timer = setTimeout(function () {
                        _this3.timer = null;
                        onSearch(searchText);
                    }, delaySearch);
                });
            } else {
                onSearch(searchText);
            }
        } else {
            _this3.setState({ value: value });
        }
    };

    this.handleKeyDown = function (e) {
        if (e.keyCode === 13) {
            _this3.handleSearch(_this3.state.value, true);
        }
    };
};

exports.default = (0, _propWire.wire)(Search, 'value', '', 'onSearch');

/***/ }),

/***/ "../src/components/slider.js":
/*!***********************************!*\
  !*** ../src/components/slider.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _jquery = __webpack_require__(/*! jquery */ "../node_modules/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('core/components/slider');

var isIncrease = true;

/**
 * A React toggle button
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {boolean} [disabled=false] - Is slider disabled?
 * @param {function} onChange - Callback function when slider value is updated
 * @param {function} [onPlus] - Function for clicking plus icon
 * @param {function} [onMinus] - Function for clicking minus icon
 * @param {object} [valueLink] - Link to update value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {number} valueLink.value - value to update
 * @param {function} valueLink.requestChange - function to request value change
 * @param {number} [max=1] - The slider max value
 * @param {number} [min=0] - The slider min value
 * @param {number} [step=0.01] - Legal number intervals for the input
 * @param {number} [value=0.5] - Current slider value
 * @param {boolean} [showProgress=false] - Show the slider's progress?
 *
 * @example
// controlled

import Slider from 'core/components/slider'
React.createClass({
    getInitialState() {
        return {value:40}
    },
    handleChange(e) {
        let value = e
        this.setState({value})
    },
    render() {
        let {value} = this.state
        return <Slider value={value} onChange={this.handleChange} showProgress={true} min={0} max={100} step={5} />
    }
})
 */

var Slider = function (_React$Component) {
    _inherits(Slider, _React$Component);

    function Slider() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Slider);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Slider.__proto__ || Object.getPrototypeOf(Slider)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            width: 0
        }, _this.handleChange = function (e) {
            var val = parseFloat(e.target.value);
            var onChange = _this.props.onChange;

            onChange(val);
        }, _this.handleClick = function (isPlus) {
            var _this$props = _this.props,
                disabled = _this$props.disabled,
                max = _this$props.max,
                min = _this$props.min,
                step = _this$props.step,
                value = _this$props.value,
                onChange = _this$props.onChange;


            if (disabled) {
                return;
            }

            // Fix the decimal of value as the step's
            var numArr = step.toString().split('.');
            var decimal = 0;

            if (numArr.length === 2) {
                decimal = numArr[1].length;
            }

            var tmp = isPlus ? (value + step).toFixed(decimal) : (value - step).toFixed(decimal);
            if (isPlus) {
                value = parseFloat(tmp) > max ? max : parseFloat(tmp);
            } else {
                value = parseFloat(tmp) < min ? min : parseFloat(tmp);
            }

            onChange(value);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Slider, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var showProgress = this.props.showProgress;

            var width = (0, _jquery2.default)(this.input).width();

            if (showProgress) {
                this.setState({
                    width: width
                });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                disabled = _props.disabled,
                max = _props.max,
                min = _props.min,
                step = _props.step,
                value = _props.value,
                showProgress = _props.showProgress,
                onPlus = _props.onPlus,
                onMinus = _props.onMinus;
            var width = this.state.width;

            var prgs = (value - min) / (max - min) * width;
            var prgsBar = showProgress ? _react2.default.createElement('div', { className: 'progress', style: { width: prgs + 'px' }, 'data-tooltip': value }) : '';

            return _react2.default.createElement(
                'div',
                { className: (0, _classnames2.default)('c-flex', 'aic', 'c-slider', className) },
                _react2.default.createElement(
                    'div',
                    { className: 'c-flex aic' },
                    _react2.default.createElement('input', {
                        type: 'range',
                        id: id,
                        ref: function ref(_ref2) {
                            _this2.input = _ref2;
                        },
                        disabled: disabled,
                        max: max,
                        min: min,
                        step: step,
                        value: value,
                        onChange: disabled ? null : this.handleChange }),
                    prgsBar
                )
            );
        }
    }]);

    return Slider;
}(_react2.default.Component);

Slider.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    disabled: _propTypes2.default.bool,
    max: _propTypes2.default.number,
    min: _propTypes2.default.number,
    step: _propTypes2.default.number,
    value: _propTypes2.default.number,
    showProgress: _propTypes2.default.bool,
    onChange: _propTypes2.default.func,
    onMinus: _propTypes2.default.func,
    onPlus: _propTypes2.default.func
};
Slider.defaultProps = {
    disabled: false,
    max: 1,
    min: 0,
    step: 0.01,
    value: 0.5
};
exports.default = (0, _propWire.wireValue)(Slider);

/***/ }),

/***/ "../src/components/table.js":
/*!**********************************!*\
  !*** ../src/components/table.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = __webpack_require__(/*! moment */ "../node_modules/moment/moment.js");

var _moment2 = _interopRequireDefault(_moment);

var _jquery = __webpack_require__(/*! jquery */ "../node_modules/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

var _checkbox = __webpack_require__(/*! ./checkbox */ "../src/components/checkbox.js");

var _checkbox2 = _interopRequireDefault(_checkbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/table');

var Row = function (_React$Component) {
    _inherits(Row, _React$Component);

    function Row() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Row);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Row.__proto__ || Object.getPrototypeOf(Row)).call.apply(_ref, [this].concat(args))), _this), _this.formatItem = function (value, data, formatter, id, name) {
            if (_react2.default.isValidElement(formatter)) {
                return formatter;
            } else if (_lodash2.default.isFunction(formatter)) {
                return formatter(value, data, id);
            } else if (_lodash2.default.isString(formatter)) {
                return _lodash2.default.template(formatter)({ value: value, data: data });
            } else if (_lodash2.default.isObject(formatter)) {
                var type = formatter.type,
                    options = _objectWithoutProperties(formatter, ['type']);

                var formatted = value;
                switch (type) {
                    case 'date':
                    case 'datetime':
                        {
                            if (value == null || _lodash2.default.isString(value) && _lodash2.default.trim(value) === '') {
                                formatted = null;
                            } else {
                                formatted = (0, _moment2.default)(value, options.inputFormat).format(options.format || (type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'));
                            }
                            break;
                        }
                    case 'mapping':
                        {
                            var list = options.list,
                                _options$listTransfor = options.listTransform,
                                listTransform = _options$listTransfor === undefined ? {} : _options$listTransfor;
                            var _listTransform$value = listTransform.value,
                                valueField = _listTransform$value === undefined ? 'value' : _listTransform$value,
                                _listTransform$text = listTransform.text,
                                textField = _listTransform$text === undefined ? 'text' : _listTransform$text;

                            if (_lodash2.default.isObject(list)) {
                                if (_lodash2.default.isArray(list)) {
                                    formatted = _lodash2.default.find(list, _defineProperty({}, valueField, value));
                                } else {
                                    formatted = _lodash2.default.get(list, value);
                                }

                                if (formatted == null) {
                                    formatted = value;
                                } else if (_lodash2.default.isObject(formatted)) {
                                    formatted = _lodash2.default.get(formatted, textField, value);
                                }
                            } else {
                                log.error('renderField:: field \'' + name + '\' mapping list is invalid or undefined');
                            }
                            break;
                        }
                    default:
                        log.error('renderField:: field \'' + name + '\' formatter type \'' + type + '\' is invalid');
                        break;
                }
                return formatted;
            } else {
                log.error('renderField:: field \'' + name + '\' formatter is invalid');
                return value;
            }
        }, _this.renderField = function (name, value, fieldCfg, rowData) {
            var _this$props = _this.props,
                id = _this$props.id,
                onInputChange = _this$props.onInputChange;
            var _fieldCfg$formatArray = fieldCfg.formatArrayItem,
                formatArrayItem = _fieldCfg$formatArray === undefined ? false : _fieldCfg$formatArray,
                formatter = fieldCfg.formatter,
                editor = fieldCfg.editor,
                props = fieldCfg.props;


            if (formatter) {
                if (_lodash2.default.isArray(value) && formatArrayItem) {
                    return _react2.default.createElement(
                        'div',
                        null,
                        _lodash2.default.map(value, function (item, idx) {
                            return _react2.default.createElement(
                                'div',
                                { key: idx + '' },
                                _this.formatItem(null, item, formatter, null, name)
                            );
                        })
                    );
                } else {
                    return _this.formatItem(value, rowData, formatter, id, name);
                }
            } else if (editor) {
                if (_lodash2.default.isFunction(props)) {
                    props = props(rowData);
                }
                // TODO: check editor must be ReactClass
                props = _lodash2.default.assign({ name: name, value: value, onChange: onInputChange && onInputChange.bind(null, id, name) }, props || {});

                return _react2.default.createElement(editor, props);
            } else {
                return value;
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Row, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps) {
            if (nextProps.force) {
                log.debug('Row::shouldComponentUpdate::forced');
                return true;
            }

            if (nextProps.fields !== this.props.fields) {
                log.debug('Row::shouldComponentUpdate::fields changed');
                return true;
            }

            if (nextProps.className !== this.props.className) {
                log.debug('Row::shouldComponentUpdate::className changed');
                return true;
            }

            if (JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data)) {
                log.debug('Row::shouldComponentUpdate::data changed');
                return true;
            }
            return false;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                data = _props.data,
                fields = _props.fields,
                id = _props.id,
                className = _props.className,
                style = _props.style,
                onClick = _props.onClick,
                onDoubleClick = _props.onDoubleClick,
                onMouseOver = _props.onMouseOver,
                onMouseOut = _props.onMouseOut,
                onContextMenu = _props.onContextMenu;


            return _react2.default.createElement(
                'tr',
                { id: id, onClick: onClick, onDoubleClick: onDoubleClick, onContextMenu: onContextMenu, className: className, style: style, onMouseOver: onMouseOver, onMouseOut: onMouseOut },
                _lodash2.default.map(fields, function (field, key) {
                    var hide = field.hide,
                        keyPath = field.keyPath,
                        fieldStyle = field.style,
                        fieldClassName = field.className;

                    if (hide) {
                        return null;
                    }

                    var val = _lodash2.default.get(data, keyPath || key, null); // to support traverse of nested field properties, eg a.b.c
                    return _react2.default.createElement(
                        'td',
                        {
                            key: key,
                            style: fieldStyle,
                            className: (0, _classnames2.default)(key, fieldClassName) },
                        _this2.renderField(key, val, field, data)
                    );
                })
            );
        }
    }]);

    return Row;
}(_react2.default.Component);

/**
 * A React data Table Component. Renders **data** according to **fields** configuration
 * @constructor
 * @param {string} [id] - Table element #id
 * @param {renderable} [caption] - Table caption
 * @param {renderable} [footer] - Table footer
 * @param {string} [className] - Classname for the container, default selected classnames:
 * * bland - Do not color alternate rows
 * * nohover - Do not change color when hovering over rows
 * * fixed-header - Fix table header when height is limited, allow table body to scroll
 * * column - Make table a column table. Ie data rows will be from left to right, instead of top to bottom
 * * border-inner-vertical - Show vertical border inside table
 * * border-inner-horizontal - Show horizontal border inside table
 * * border-inner - Show both vertical and horizontal border inside table
 * * border-outer - Show table border outline
 * * border-all - Show all border, outer + inner
 * @param {object} [style] - Table style
 * @param {object} fields - All fields definition, in key-config pair, each key represents a column
 * @param {object} fields.key - Config for this **key** field
 * @param {renderable} [fields.key.label=key] - label for this field
 * @param {string | array.<string>} [fields.key.keyPath=key] - key path for this field
 * @param {renderable} [fields.key.sortable=false] - is column sortable?
 * @param {string | array.<string>} [fields.key.sortKeyPath=keyPath] - key path used for sorting
 * @param {renderable} [fields.key.hide=false] - hide this column?
 * @param {string} [fields.key.className] - classname of this column
 * @param {object} [fields.key.style] - column style, eg width, minWidth
 * @param {string | object | function | renderable} [fields.key.formatter] - what to render in this field?
 * * template string literal: eg 'Hi my name is ${value} and address is ${data.address}'
 * * renderable elements supported by react: eg <div>xxxx</div>
 * * format config object, with type='date'|'datetime'|'mapping'
 * * custom defined formatter function, first argument will be data value corresponding to the field, second argument is data for the entire row
 * @param {boolean} [fields.key.formatArrayItem=false] - if field value is an array, whether the formatter above is targeted towards the array item?
 * @param {function | component} [fields.key.editor] - If this field is an input, the react component class to use
 * @param {object | function} [fields.key.props] - If this field is an input, props for the above react class
 * * object - props as object
 * * function - function given row data, returning object props
 * @param {array} [data] - Data to fill table with
 * @param {object} [rows] - Limit data to show
 * @param {number} [rows.start=0] - row to start with
 * @param {number} [rows.end=data.length] - row to end with (not including end)
 * @param {string} [rowIdField] - The field key which will be used as row dom #id
 * @param {string | function} [rowClassName] - Classname of a data row
 * @param {string | function} [rowStyle] - Style of a data row
 * @param {object} [selection] - Table row selection settings
 * @param {boolean} [selection.enabled=false] - Is table rows selectable? If yes checkboxes will appear
 * @param {boolean} [selection.toggleAll=false] - Show toggle all checkbox in header?
 * @param {boolean} [selection.multiSelect=true] - Can select multiple rows?
 * @param {string | array.<string>} [defaultSelected] - Selected row id(s)
 * @param {string | array.<string>} [selected] - Default selected row id(s)
 * @param {object} [selectedLink] - Link to update selections. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} selectedLink.value - value to update
 * @param {function} selectedLink.requestChange - function to request value change
 * @param {function} [onSelectionChange] - Callback function when row is selected. <br> Required when selected prop is supplied
 * @param {string | array} onSelectionChange.value - current selected row ids
 * @param {object} onSelectionChange.eventInfo - event related info
 * @param {string | array} onSelectionChange.eventInfo.before - previous selected row ids
 * @param {string} onSelectionChange.eventInfo.id - id triggering change
 * @param {boolean} onSelectionChange.eventInfo.selected - selected?
 * @param {object} [defaultSort] - Default sort config
 * @param {string} [defaultSort.field] - Default sort field
 * @param {boolean} [defaultSort.desc=false] - Is sort order descending by default?
 * @param {object} [sort] - Current sort config
 * @param {string} [sort.field] - Current sort field
 * @param {boolean} [sort.desc=false] - Is sort order descending?
 * @param {object} [sortLink] - Link to update sort. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} sortLink.value - sort to update
 * @param {function} sortLink.requestChange - function to request sort change
 * @param {function} [onSort] - Callback function when sort is changed. <br> Required when sort prop is supplied
 * @param {object} onSort.value - current sort object
 * @param {object} onSort.eventInfo - event related info
 * @param {object} onSort.eventInfo.before - previous sort object
 * @param {function} [onRowClick] [description]
 * @param {function} [onRowDoubleClick] [description]
 * @param {function} [onRowMouseOver] - Row mouseover event
 * @param {function} [onRowMouseOut] - Row mouseout event
 * @param {function} [onRowContextMenu] [description]
 * @param {function} [onScroll] [description]
 * @param {function} [onInputChange] - Input change event
 * @param {string} onInputChange.rid - row id of this input
 * @param {string} onInputChange.name - input name
 * @param {string|number} onInputChange.value - input value
 * @param {renderable} [info] - React renderable object, display additional information about the list
 * @param {string} [infoClassName] - Assign className to info node
 *
 * @example
// controlled

import $ from 'jquery'
import cx from 'classnames'
import {Table} from 'react-ui'

const FIELDS = {
    id: { label:'ID', sortable:true },
    title: { label:'Title', sortable:true },
    adult: {label:'Adult', formatter:{
        type: 'mapping',
        list: {true:'Yes', false:'No'}
    }},
    original_language: {
        label:'Language',
        formatter: {
            type: 'mapping',
            list: [
                {lang:'en', desc:'English'},
                {lang:'de', desc:'German'}
            ],
            valueField: 'lang',
            textField: 'desc'
        }
    },
    popularity: {label:'Popularity'},
    release_date: {
        label: 'Year',
        formatter: {type:'date', format:'YYYY-MM-DD'},
        sortable: true
    }
}

React.createClass({
    getInitialState() {
        return {
            search: 'ab',
            selected: [],
            clicked: null,
            info: null,
            error: false,
            data: []
        }
    },
    componentDidMount() {
        this.loadList()
    },
    handleSelect(selected) {
        this.setState({selected})
    },
    handleClick(clicked) {
        this.setState({clicked})
    },
    loadList() {
        this.setState({data:[], info:'Loading...', error:false}, () => {
            let {search} = this.state

            $.get(`https://api.themoviedb.org/3/${search?'search':'discover'}/movie`,
                {
                    api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                    query: search
                })
                .done(({results:list=[], total_results:total=0}) => {
                    if (total === 0) {
                        this.setState({info:'No movies found!'})
                        return
                    }

                    this.setState({info:null, data:list})
                })
                .fail(xhr => {
                    this.setState({info:xhr.responseText, error:true})
                })
        })
    },
    render() {
        let {data, info, error} = this.state

        return <div className='c-box noborder'>
            <div className='content'>
                <Table
                    data={data}
                    fields={FIELDS}
                    className='fixed-header'
                    rowIdField='id'
                    info={info}
                    infoClassName={cx({'c-error':error})}
                    defaultSort={{
                        field: 'title',
                        desc: false
                    }}
                    onRowClick={this.handleClick}
                    selection={{
                        enabled:true,
                        toggleAll:true
                    }}
                    onSelectionChange={this.handleSelect} />
            </div>
        </div>
    }
});
 */


Row.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    fields: _propTypes2.default.object.isRequired,
    data: _propTypes2.default.object.isRequired,
    force: _propTypes2.default.bool,
    style: _propTypes2.default.object,
    onInputChange: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    onDoubleClick: _propTypes2.default.func,
    onMouseOver: _propTypes2.default.func,
    onMouseOut: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func
};
Row.defaultProps = {
    force: false,
    style: {}
};

var Table = function (_React$Component2) {
    _inherits(Table, _React$Component2);

    function Table() {
        var _ref2;

        var _temp2, _this3, _ret2;

        _classCallCheck(this, Table);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this3 = _possibleConstructorReturn(this, (_ref2 = Table.__proto__ || Object.getPrototypeOf(Table)).call.apply(_ref2, [this].concat(args))), _this3), _this3.state = {
            fieldsSize: null
        }, _this3.getRowId = function (rowData, rowIdField) {
            if (!rowIdField) {
                log.error('getRowId:: rowIdField prop must be specified');
                return null;
            }

            var fields = _this3.props.fields;

            var fieldCfg = _this3.formatField(rowIdField, fields[rowIdField]);
            var id = _lodash2.default.get(rowData, _lodash2.default.get(fieldCfg, 'keyPath', rowIdField));

            if (!id) {
                log.error('getRowId:: unable to produce id based on config ' + fieldCfg);
                return null;
            }

            return id + '';
        }, _this3.resizeFields = function () {
            var fields = _this3.props.fields;

            _this3.setState({
                fieldsSize: null
            }, function () {
                var fieldsSize = {};
                (0, _jquery2.default)(_this3.tableHeaderNode).children().each(function () {
                    fieldsSize[this.id] = _lodash2.default.get(fields, [this.id, 'style', 'width'], (0, _jquery2.default)(this).width() + 14);
                });

                _this3.setState({ fieldsSize: fieldsSize });
            });
        }, _this3.isAutoLayout = function (props) {
            var _ref3 = props || _this3.props,
                className = _ref3.className;

            return _lodash2.default.indexOf(_lodash2.default.split(className, ' '), 'fixed-header') >= 0;
        }, _this3.formatField = function (key, fieldCfg) {
            if (_lodash2.default.isString(fieldCfg)) {
                return { label: fieldCfg };
            } else {
                return _extends({
                    label: key
                }, fieldCfg);
            }
        }, _this3.formatFields = function () {
            var _this3$props = _this3.props,
                fields = _this3$props.fields,
                _this3$props$selectio = _this3$props.selection,
                selectable = _this3$props$selectio.enabled,
                _this3$props$selectio2 = _this3$props$selectio.multiSelect,
                multiSelect = _this3$props$selectio2 === undefined ? true : _this3$props$selectio2,
                _this3$props$selectio3 = _this3$props$selectio.toggleAll,
                toggleAll = _this3$props$selectio3 === undefined ? false : _this3$props$selectio3,
                selected = _this3$props.selected,
                data = _this3$props.data;


            fields = _lodash2.default.mapValues(fields, function (fieldCfg, key) {
                return _this3.formatField(key, fieldCfg);
            });

            if (selectable) {
                var total = data.length;
                var numSelected = multiSelect ? selected.length : null;

                fields = _extends({
                    selector: {
                        label: toggleAll && multiSelect ? _react2.default.createElement(_checkbox2.default, {
                            checked: numSelected > 0,
                            className: (0, _classnames2.default)({ partial: numSelected > 0 && numSelected < total }),
                            onChange: _this3.handleToggleAll }) : '',
                        formatter: function formatter(v, row, rid) {
                            var rowSelected = multiSelect ? _lodash2.default.includes(selected, rid) : selected === rid;
                            return _react2.default.createElement(_checkbox2.default, { checked: rowSelected, onChange: _this3.handleRowSelect.bind(_this3, rid) });
                        }
                    }
                }, fields);
            }
            return fields;
        }, _this3.handleWindowResize = function () {
            if (_this3.isAutoLayout()) {
                _this3.resizeFields();
            }
        }, _this3.handleSort = function (evt) {
            var _this3$props2 = _this3.props,
                onSort = _this3$props2.onSort,
                _this3$props2$sort = _this3$props2.sort,
                sortField = _this3$props2$sort.field,
                sortDesc = _this3$props2$sort.desc;

            var newSortField = evt.currentTarget.id;

            var sortObj = { field: newSortField, desc: newSortField === sortField ? !sortDesc : false };
            onSort(sortObj);
        }, _this3.handleToggleAll = function (selected) {
            var _this3$props3 = _this3.props,
                onSelectionChange = _this3$props3.onSelectionChange,
                data = _this3$props3.data,
                rowIdField = _this3$props3.rowIdField;

            var newSelected = selected ? _lodash2.default.map(data, function (row) {
                return _this3.getRowId(row, rowIdField);
            }) : [];
            onSelectionChange(newSelected, { id: null, selected: selected });
        }, _this3.handleRowSelect = function (rid, selected) {
            var _this3$props4 = _this3.props,
                _this3$props4$selecti = _this3$props4.selection.multiSelect,
                multiSelect = _this3$props4$selecti === undefined ? true : _this3$props4$selecti,
                onSelectionChange = _this3$props4.onSelectionChange,
                curSelected = _this3$props4.selected;

            if (multiSelect) {
                var newSelected = selected ? [].concat(_toConsumableArray(curSelected), [rid]) : _lodash2.default.without(curSelected, rid);
                onSelectionChange(newSelected, { id: rid, selected: selected });
            } else {
                onSelectionChange(selected ? rid : '');
            }
        }, _this3.handleRowClick = function (row, evt) {
            var rid = evt.currentTarget.id;
            _this3.props.onRowClick && _this3.props.onRowClick(rid, row, evt);
        }, _this3.handleRowDoubleClick = function (row, evt) {
            var rid = evt.currentTarget.id;
            _this3.props.onRowDoubleClick && _this3.props.onRowDoubleClick(rid, row, evt);
        }, _this3.handleRowMouseOver = function (row, evt) {
            var rid = evt.currentTarget.id;
            _this3.props.onRowMouseOver && _this3.props.onRowMouseOver(rid, row, evt);
        }, _this3.handleRowMouseOut = function (row, evt) {
            var rid = evt.currentTarget.id;
            _this3.props.onRowMouseOut && _this3.props.onRowMouseOut(rid, row, evt);
        }, _this3.handleContextMenu = function (row, evt) {
            var rid = evt.currentTarget.id;
            _this3.props.onRowContextMenu && _this3.props.onRowContextMenu(rid, row, evt);
        }, _temp2), _possibleConstructorReturn(_this3, _ret2);
    }

    _createClass(Table, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this4 = this;

            window.addEventListener('resize', this.handleWindowResize);
            if (this.isAutoLayout()) {
                setTimeout(function () {
                    _this4.resizeFields();
                }, 1000);
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var prevData = prevProps.data,
                prevClassName = prevProps.className;
            var _props2 = this.props,
                data = _props2.data,
                className = _props2.className;

            if (this.isAutoLayout()) {
                if (className !== prevClassName || !_lodash2.default.isEmpty(data) && JSON.stringify(data) !== JSON.stringify(prevData)) {
                    log.debug('Table::componentDidUpdate::resize fields');
                    this.resizeFields();
                }
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('resize', this.handleWindowResize);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            var _props3 = this.props,
                id = _props3.id,
                className = _props3.className,
                _props3$style = _props3.style,
                style = _props3$style === undefined ? {} : _props3$style,
                caption = _props3.caption,
                footer = _props3.footer,
                info = _props3.info,
                infoClassName = _props3.infoClassName,
                data = _props3.data,
                rows = _props3.rows,
                rowIdField = _props3.rowIdField,
                _props3$selection = _props3.selection,
                selectable = _props3$selection.enabled,
                _props3$selection$mul = _props3$selection.multiSelect,
                multiSelectable = _props3$selection$mul === undefined ? true : _props3$selection$mul,
                selected = _props3.selected,
                _props3$sort = _props3.sort,
                sortField = _props3$sort.field,
                sortDesc = _props3$sort.desc,
                rowClassName = _props3.rowClassName,
                rowStyle = _props3.rowStyle,
                forceRefresh = _props3.forceRefresh,
                onRowClick = _props3.onRowClick,
                onRowDoubleClick = _props3.onRowDoubleClick,
                onRowContextMenu = _props3.onRowContextMenu,
                onInputChange = _props3.onInputChange,
                onScroll = _props3.onScroll,
                onRowMouseOver = _props3.onRowMouseOver,
                onRowMouseOut = _props3.onRowMouseOut;


            var autoLayout = this.isAutoLayout();
            var fieldsSize = this.state.fieldsSize;

            var refreshAll = forceRefresh === true;
            var fields = this.formatFields();

            if (!refreshAll && !_lodash2.default.isArray(forceRefresh)) {
                forceRefresh = [forceRefresh];
            }

            if (sortField && fields[sortField].sortable) {
                data = _lodash2.default.orderBy(data, [function (item) {
                    var val = _lodash2.default.get(item, fields[sortField].sortKeyPath || fields[sortField].keyPath || sortField);
                    return _lodash2.default.isString(val) ? val.toLowerCase() : val;
                }, rowIdField], [sortDesc ? 'desc' : 'asc']);
            }

            if (rows) {
                var start = rows.start,
                    end = rows.end;

                data = data.slice(start, end);
            }

            return _react2.default.createElement(
                'table',
                {
                    id: id,
                    className: (0, _classnames2.default)('c-table', _lodash2.default.replace(className, 'fixed-header', ''), {
                        selectable: selectable,
                        'fixed-header': autoLayout && fieldsSize
                    }),
                    style: _extends({
                        width: autoLayout && !fieldsSize ? '100%' : null,
                        minWidth: autoLayout && fieldsSize ? _lodash2.default.sum(_lodash2.default.values(fieldsSize)) : null
                    }, style) },
                caption ? _react2.default.createElement(
                    'caption',
                    null,
                    caption
                ) : null,
                _react2.default.createElement(
                    'thead',
                    null,
                    _react2.default.createElement(
                        'tr',
                        { id: 'header', ref: function ref(_ref5) {
                                _this5.tableHeaderNode = _ref5;
                            } },
                        _lodash2.default.map(fields, function (_ref4, key) {
                            var _ref4$sortable = _ref4.sortable,
                                sortable = _ref4$sortable === undefined ? false : _ref4$sortable,
                                _ref4$hide = _ref4.hide,
                                hide = _ref4$hide === undefined ? false : _ref4$hide,
                                label = _ref4.label,
                                fieldClassName = _ref4.className,
                                fieldStyle = _ref4.style;

                            if (hide) {
                                return null;
                            }

                            var fieldWidth = _lodash2.default.get(fieldStyle, 'width');
                            if (autoLayout && _lodash2.default.has(fieldsSize, key)) {
                                fieldWidth = fieldsSize[key];
                            }
                            return _react2.default.createElement(
                                'th',
                                {
                                    id: key,
                                    key: key,
                                    className: (0, _classnames2.default)(key, { sortable: sortable }, fieldClassName),
                                    style: _extends({
                                        width: fieldWidth
                                    }, fieldStyle),
                                    onClick: sortable && _this5.handleSort },
                                label,
                                sortable ? key === sortField ? _react2.default.createElement(
                                    'span',
                                    { className: 'dir selected ' + (sortDesc ? 'desc' : '') },
                                    sortDesc ? '\u25BC' : '\u25B2'
                                ) : _react2.default.createElement(
                                    'span',
                                    { className: 'dir' },
                                    '\u25B2'
                                ) : ''
                            );
                        })
                    )
                ),
                _react2.default.createElement(
                    'tbody',
                    { onScroll: onScroll },
                    info ? _react2.default.createElement(
                        'tr',
                        null,
                        _react2.default.createElement(
                            'td',
                            { className: (0, _classnames2.default)('c-info', infoClassName), colSpan: _lodash2.default.size(fields) },
                            info
                        )
                    ) : _lodash2.default.map(data, function (row, index) {
                        var rid = (rowIdField ? _this5.getRowId(row, rowIdField) : index) + '';
                        var _className = rowClassName;
                        if (rowClassName) {
                            if (_lodash2.default.isFunction(rowClassName)) {
                                _className = rowClassName(row);
                            }
                        }

                        if (multiSelectable && _lodash2.default.includes(selected, rid) || !multiSelectable && selected === rid) {
                            _className = [_className, 'selected'];
                        }

                        var _rowStyle = rowStyle;
                        if (rowStyle) {
                            if (_lodash2.default.isFunction(rowStyle)) {
                                _rowStyle = _lodash2.default.isPlainObject(rowStyle(row)) ? rowStyle(row) : {};
                            }
                        }

                        return _react2.default.createElement(Row, {
                            key: rid,
                            id: rid,
                            fields: _lodash2.default.mapValues(fields, function (v, k) {
                                var fieldWidth = _lodash2.default.get(v, 'style.width', autoLayout ? _lodash2.default.get(fieldsSize, k) : null);
                                return _extends({}, v, {
                                    style: _extends({
                                        width: fieldWidth
                                    }, v.style || {})
                                });
                            }),
                            data: row,
                            className: (0, _classnames2.default)(_className),
                            style: _rowStyle,
                            force: refreshAll || forceRefresh.indexOf('' + rid) >= 0,
                            onInputChange: onInputChange,
                            onContextMenu: onRowContextMenu ? _this5.handleContextMenu.bind(_this5, row) : null,
                            onClick: onRowClick ? _this5.handleRowClick.bind(_this5, row) : null,
                            onDoubleClick: onRowDoubleClick ? _this5.handleRowDoubleClick.bind(_this5, row) : null,
                            onMouseOver: onRowMouseOver ? _this5.handleRowMouseOver.bind(_this5, row) : null,
                            onMouseOut: onRowMouseOut ? _this5.handleRowMouseOut.bind(_this5, row) : null });
                    })
                ),
                footer ? _react2.default.createElement(
                    'tfoot',
                    null,
                    _react2.default.createElement(
                        'tr',
                        null,
                        _react2.default.createElement(
                            'td',
                            null,
                            footer
                        )
                    )
                ) : null
            );
        }
    }]);

    return Table;
}(_react2.default.Component);

Table.propTypes = {
    id: _propTypes2.default.string,
    caption: _propTypes2.default.node,
    footer: _propTypes2.default.node,
    className: _propTypes2.default.string,
    style: _propTypes2.default.object,
    rowIdField: _propTypes2.default.string,
    rowClassName: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
    rowStyle: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]),
    fields: _propTypes2.default.objectOf(_propTypes2.default.shape({
        label: _propTypes2.default.node,
        keyPath: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.arrayOf(_propTypes2.default.string)]),
        sortable: _propTypes2.default.bool,
        sortKeyPath: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.arrayOf(_propTypes2.default.string)]),
        hide: _propTypes2.default.bool,
        className: _propTypes2.default.string,
        style: _propTypes2.default.object,
        formatter: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object, _propTypes2.default.func, _propTypes2.default.node]),
        formatArrayItem: _propTypes2.default.bool,
        editor: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.element, _propTypes2.default.string]),
        props: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func])
    })).isRequired,
    data: _propTypes2.default.array,
    rows: _propTypes2.default.shape({
        start: _propTypes2.default.number,
        end: _propTypes2.default.number
    }),
    forceRefresh: _propTypes2.default.bool,
    selection: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool,
        multiSelect: _propTypes2.default.bool,
        toggleAll: _propTypes2.default.bool
    }),
    selected: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.arrayOf(_propTypes2.default.string)]),
    onSelectionChange: _propTypes2.default.func,
    sort: _propTypes2.default.shape({
        field: _propTypes2.default.string,
        desc: _propTypes2.default.bool
    }),
    onSort: _propTypes2.default.func,
    onRowClick: _propTypes2.default.func,
    onRowDoubleClick: _propTypes2.default.func,
    onRowContextMenu: _propTypes2.default.func,
    onScroll: _propTypes2.default.func,
    onInputChange: _propTypes2.default.func,
    onRowMouseOver: _propTypes2.default.func,
    onRowMouseOut: _propTypes2.default.func,
    info: _propTypes2.default.node,
    infoClassName: _propTypes2.default.string
};
Table.defaultProps = {
    data: [],
    selection: {
        enabled: false
    },
    forceRefresh: false
};
exports.default = (0, _propWire.wireSet)(Table, {
    sort: {
        changeHandlerName: 'onSort',
        defaultValue: {}
    },
    selected: {
        changeHandlerName: 'onSelectionChange',
        defaultValue: function defaultValue(_ref6) {
            var _ref6$selection = _ref6.selection,
                selection = _ref6$selection === undefined ? {} : _ref6$selection;
            var enabled = selection.enabled,
                _selection$multiSelec = selection.multiSelect,
                multiSelect = _selection$multiSelec === undefined ? true : _selection$multiSelec;

            if (enabled) {
                return multiSelect ? [] : '';
            }
            return '';
        }
    }
});

/***/ }),

/***/ "../src/components/tabs.js":
/*!*********************************!*\
  !*** ../src/components/tabs.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/tabs');

/**
 * A React Tabs view component
 * @constructor
 * @param {string} [id] - Tab dom element #id
 * @param {string} [className] - Classname for the container
 * @param {object} menu Tab menu config
 * @param {object} menu.key menu item config
 * @param {renderable} menu.key.title menu item title
 * @param {string} menu.key.disabled is menu item disabled (cannot select)?
 * @param {string} [defaultCurrent] - Default selected tab key
 * @param {string} [current] - Current selected tab key
 * @param {object} [currentLink] - Link to update selected tab key. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} currentLink.value - value to update
 * @param {function} currentLink.requestChange - function to request value change
 * @param {object} [defaultContents] - Key-node pair of what to display in each tab by default
 * @param {renderable} [children] - Current tab content
 * @param {function} [onChange] - Callback function when tab is selected. <br> Required when current prop is supplied
 * @param {string} onChange.value - selected tab key
 * @param {object} onChange.eventInfo - event related info
 * @param {string} onChange.eventInfo.before - previously selected tab
 *
 * @todo  Maybe don't need defaultContents??
 *
 * @example
// controlled

import {Tabs} from 'react-ui'

React.createClass({
    getInitialState() {
        return {
            currentTab:'movies'
        }
    },
    handleTabChange(newTab) {
        this.setState({currentTab: newTab})
    },
    renderMovies() {
        return 'movie list'
    },
    renderActors() {
        return 'actor list'
    },
    render() {
        let {currentTab} = this.state;
        return <Tabs id='imdb'
            menu={{
                movies: 'MOVIES',
                actors: 'ACTORS',
                tv: {title:'TV', disabled:true}
            }}
            current={currentTab}
            onChange={this.handleTabChange}>
            {
                currentTab==='movies' ? this.renderMovies() : this.renderActors()
            }
        </Tabs>
    }
})
 */

var Tabs = function (_React$Component) {
    _inherits(Tabs, _React$Component);

    function Tabs() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Tabs);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Tabs.__proto__ || Object.getPrototypeOf(Tabs)).call.apply(_ref, [this].concat(args))), _this), _this.handleTabChange = function (evt) {
            var onChange = _this.props.onChange;


            onChange(evt.currentTarget.id);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Tabs, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                menu = _props.menu,
                current = _props.current,
                defaultContents = _props.defaultContents,
                id = _props.id,
                className = _props.className,
                children = _props.children;


            var defaultContent = defaultContents[current];

            return _react2.default.createElement(
                'div',
                { id: id, className: (0, _classnames2.default)('c-tabs', className) },
                _react2.default.createElement(
                    'ol',
                    { className: 'menu' },
                    _lodash2.default.map(menu, function (item, key) {
                        var isCurrent = key === current;
                        var disabled = false;
                        var title = '';
                        if (_lodash2.default.isString(item)) {
                            title = item;
                        } else {
                            title = item.title || key;
                            disabled = item.disabled;
                        }
                        var tabClassName = {
                            current: isCurrent,
                            disabled: disabled
                        };
                        return _react2.default.createElement(
                            'li',
                            {
                                id: key,
                                key: key,
                                className: (0, _classnames2.default)(tabClassName),
                                onClick: isCurrent || disabled ? null : _this2.handleTabChange },
                            title
                        );
                    })
                ),
                _react2.default.createElement(
                    'div',
                    { id: current, className: 'tabContent' },
                    children || defaultContent
                )
            );
        }
    }]);

    return Tabs;
}(_react2.default.Component);

Tabs.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    menu: _propTypes2.default.objectOf(_propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.shape({
        title: _propTypes2.default.node,
        disabled: _propTypes2.default.bool
    })])),
    current: _propTypes2.default.string,
    defaultContents: _propTypes2.default.objectOf(_propTypes2.default.node),
    children: _propTypes2.default.node,
    onChange: _propTypes2.default.func
};
Tabs.defaultProps = {
    menu: {},
    defaultContents: {}
};
exports.default = (0, _propWire.wire)(Tabs, 'current');

/***/ }),

/***/ "../src/components/text.js":
/*!*********************************!*\
  !*** ../src/components/text.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _jquery = __webpack_require__(/*! jquery */ "../node_modules/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/text');

/*
let isInParentView = function(el, parent) {
    let rect = el.getBoundingClientRect();
    let parent2 = parent.parentNode.getBoundingClientRect();
    return (
        rect.top > parent2.top &&
        rect.bottom < parent2.bottm
    );
}*/

var Text = function (_React$Component) {
    _inherits(Text, _React$Component);

    function Text() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Text);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Text.__proto__ || Object.getPrototypeOf(Text)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            line: _this.props.line || -1
        }, _this.onScroll = function () {
            log.debug('onScroll');
            if (!_this.autoScrollComingUp) {
                _this.disableAutoScroll = true;
            }
            _this.autoScrollComingUp = false;
        }, _this.renderListItem = function (item, id) {
            return _react2.default.createElement(
                'li',
                { key: id, className: (0, _classnames2.default)({ selected: id === _this.state.line }) },
                _react2.default.createElement(
                    'span',
                    { className: 'line' },
                    id,
                    '.'
                ),
                _react2.default.createElement(
                    'span',
                    null,
                    item
                )
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Text, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            if (this.props.store) {
                this.unsubscribe = this.props.store.listen(function (line) {
                    _this2.setState({ line: line });
                });
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.line && nextProps.line !== this.state.line) {
                this.setState({ line: nextProps.line });
            }
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            return nextState.line !== this.state.line || nextProps.maxLines !== this.props.maxLines || nextProps.content !== this.props.content;
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            var selected = (0, _jquery2.default)(this.node).find('li.selected')[0];
            if (!this.disableAutoScroll && selected /* && !isInParentView(selected, node)*/) {
                    this.autoScrollComingUp = true;
                    selected.scrollIntoView(false);
                }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.unsubscribe) {
                this.unsubscribe();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props,
                className = _props.className,
                content = _props.content,
                maxLines = _props.maxLines,
                id = _props.id;

            var lines = content.split('\n');
            var line = this.state.line;
            var start = 1;
            var end = lines.length;

            if (maxLines) {
                start = Math.max(line - Math.floor(maxLines / 2), 1);
                end = start + maxLines - 1;
                if (end > lines.length) {
                    start = Math.max(1, start - (end - lines.length));
                    end = lines.length;
                }
                lines = lines.slice(start - 1, end);
            }

            return _react2.default.createElement(
                'ul',
                { id: id, ref: function ref(_ref2) {
                        _this3.node = _ref2;
                    }, className: (0, _classnames2.default)('c-text', className), onScroll: this.onScroll },
                _lodash2.default.map(lines, function (val, i) {
                    return _this3.renderListItem(val, start + i);
                })
            );
        }
    }]);

    return Text;
}(_react2.default.Component);

Text.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.any,
    maxLines: _propTypes2.default.number,
    line: _propTypes2.default.number,
    content: _propTypes2.default.string,
    store: _propTypes2.default.any
};
Text.defaultProps = {
    content: ''
};
exports.default = Text;

/***/ }),

/***/ "../src/components/textarea.js":
/*!*************************************!*\
  !*** ../src/components/textarea.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A React Textarea
 * @constructor
 * @param {string} [id] - Textarea #id
 * @param {string} [name] - Textarea name
 * @param {string} [className] - Classname for the textarea
 * @param {string|number} [placeholder] - Placeholder for textarea
 * @param {number} [rows] - Visible number of lines in a textarea
 * @param {number} [cols] - Visible width of a textarea
 * @param {boolean} [readOnly=false] - Is this field readonly?
 * @param {boolean} [disabled=false] - Is this field disabled?
 * @param {number} [maxLength] - The maximum number of characters allowed in the textarea
 * @param {string|number} [value] - Current value
 * @param {boolean} [required=false] - Is this field mandatory?
 * @param {function} [onChange] - Callback function when value is changed. <br> Required when value prop is supplied
 *
 * @example
import {Textarea} from 'react-ui'

Examples.Textarea = React.createClass({
    getInitialState() {
        return {
            feedback: ''
        }
    },
    handleChange(field, value) {
        this.setState({[field]:value})
    },
    render() {
        const {feedback} = this.state
        return <div className='c-form inline'>
            <div>
                <label htmlFor='feedback'>Feedback</label>
                <Textarea
                    id='feedback'
                    onChange={this.handleChange.bind(this, 'feedback')}
                    value={feedback} />
            </div>
        </div>
    }
})
 */

var Textarea = function (_Component) {
    _inherits(Textarea, _Component);

    function Textarea(props) {
        _classCallCheck(this, Textarea);

        var _this = _possibleConstructorReturn(this, (Textarea.__proto__ || Object.getPrototypeOf(Textarea)).call(this, props));

        _this.handleChange = _this.handleChange.bind(_this);
        return _this;
    }

    _createClass(Textarea, [{
        key: 'handleChange',
        value: function handleChange(e) {
            this.props.onChange(e.target.value);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                id = _props.id,
                name = _props.name,
                className = _props.className,
                placeholder = _props.placeholder,
                rows = _props.rows,
                cols = _props.cols,
                readOnly = _props.readOnly,
                disabled = _props.disabled,
                maxLength = _props.maxLength,
                required = _props.required,
                value = _props.value;


            return _react2.default.createElement('textarea', {
                id: id,
                name: name,
                className: className,
                placeholder: placeholder,
                rows: rows,
                cols: cols,
                readOnly: readOnly,
                disabled: disabled,
                maxLength: maxLength,
                value: value,
                required: required,
                onChange: this.handleChange });
        }
    }]);

    return Textarea;
}(_react.Component);

Textarea.propTypes = {
    id: _propTypes2.default.string,
    name: _propTypes2.default.string,
    className: _propTypes2.default.string,
    placeholder: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
    rows: _propTypes2.default.number,
    cols: _propTypes2.default.number,
    readOnly: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    maxLength: _propTypes2.default.number,
    value: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
    required: _propTypes2.default.bool,
    onChange: _propTypes2.default.func.isRequired
};

Textarea.defaultProps = {
    id: '',
    className: '',
    value: ''
};

exports.default = (0, _propWire.wireValue)(Textarea);

/***/ }),

/***/ "../src/components/tiles.js":
/*!**********************************!*\
  !*** ../src/components/tiles.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * React Tiles - view made up of tiles, could be used for laying out images, videos, div,
 * or any self defined components.
 *
 * Allow specifying:
 * * spacing between tiles
 * * max # tiles, or auto calculate # tiles based on container size and tile size
 *
 * || max=number | max=auto | max=undefined |
 * | :-- | :-- | :-- | :-- |
 * | itemSize has width+height| flex layout, display max. # tiles| calculate # tiles from item & container size| flex layout |
 * | itemSize undefined | flex layout, display max. # tiles| flex layout | flex layout |
 *
 * Restrictions:
 * * All items in a row must (or forced to) have same height
 * * width/height of individual tile specified in css will be ignored
 *
 * @alias module:Tiles
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {string|function} base - React class to use for rendering the tile, eg 'div', 'img', <SelfDefinedComponent/>
 * @param {array.<object>} items - Tiles supplied as props to base component
 * @param {string} items.id - tile id
 * @param {number} [items.width] - tile width
 * @param {number} [items.height] - tile height
 * @param {number} [total=items.length] - Total number of tiles available, if total>max, overlay will be rendered on last tile
 * @param {'auto' | number} [max] - Max number of tiles. If 'auto' will try to calculate max, if not specified, will display all tiles
 * @param {function | boolean} [overlay=true] - overlay render function to call if total > max
 * @param {number} overlay.max - configured or automatically calculated max # of tiles
 * @param {number} overlay.total - total # of tiles
 * @param {object} [itemProps] - Props for individual tile
 * @param {object} [itemSize] - Default tile size, will be overwritten by size specified in individual tiles
 * @param {number} [itemSize.width] - Default tile width
 * @param {number} [itemSize.height] - Default tile height
 * @param {number} [spacing=0] - Spacing (in px) between tiles
 * @param {'%' | 'px'} [unit='px'] - itemSize unit
 * @param {function} [onClick] - Function to call when clicked
 * @param {object} onClick.id - tile id clicked
 * @param {object} onClick.eventInfo - other event info
 * @param {number} onClick.eventInfo.index - current array index of clicked tile
 * @param {number} onClick.eventInfo.max - max (configured of auto calculated) # tiles
 * @param {number} onClick.eventInfo.total - total # tiles
 * @param {boolean} onClick.eventInfo.isLast - is the clicked event the last one of this bunch?
 * @param {function} [onMouseOver] - Function to call when mouse over, see onClick for callback function spec
 * @param {function} [onMouseOut] - Function to call when mouse out, see onClick for callback function spec
 *
 *
 * @example
import {Tiles, Popover} from 'react-ui'
import _ from 'lodash'

const IMAGES = [
    'bs', 'camera', 'car', 'drug', 'email', 'fb_messenger', 'goods',
    'gun', 'home', 'ic_airplane', 'ic_alert_2', 'ic_bs',
    'ic_cam_2', 'ic_cam_3', 'ic_car_2', 'ic_case', 'ic_creditcard', 'ic_database', 'ic_drug',
    'ic_email', 'ic_etag', 'ic_etag_gate', 'ic_globe', 'ic_goods', 'ic_gun', 'ic_help', 'ic_home', 'ic_info', 'ic_ip',
    'ip', 'landline', 'line', 'mobile', 'parking', 'person'
]

React.createClass({
    getInitialState() {
        return {
            selected: null,
            max: null,
            isLast: false,
            hasMore: false
        }
    },
    handleClick(id, {index, max, total, isLast}) {
        this.setState({
            selected: id,
            max,
            isLast,
            hasMore: total>max
        })
    },
    openPopover(id, data, evt) {
        Popover.openId(
            'my-popover-id',
            evt,
            <div className='c-box'>
                <header>{id}</header>
                <div className='content c-result aligned'>
                    {
                        _.map(data, (v,k)=><div key={k}>
                            <label>{k}</label>
                            <div>{v+''}</div>
                        </div>)
                    }
                </div>
            </div>,
            {pointy:true}
        )
    },
    closePopover() {
        Popover.closeId('my-popover-id')
    },
    render() {
        return <Tiles id='auto'
            base='img'
            itemSize={{
                width:30,
                height:20
            }}
            unit='%'
            spacing={5}
            items={_.map(IMAGES, item=>({id:item, src:`/images/tiles/${item}.png`}))}
            max='auto'
            onClick={this.handleClick}
            onMouseOver={this.openPopover}
            onMouseOut={this.closePopover} />
    }
})
 */

var Tiles = function (_React$Component) {
    _inherits(Tiles, _React$Component);

    function Tiles() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Tiles);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Tiles.__proto__ || Object.getPrototypeOf(Tiles)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            containerWidth: 0,
            containerHeight: 0
        }, _this.updateDimension = function () {
            var _this$node$getBoundin = _this.node.getBoundingClientRect(),
                containerWidth = _this$node$getBoundin.width,
                containerHeight = _this$node$getBoundin.height;

            _this.setState({
                containerHeight: containerHeight,
                containerWidth: containerWidth
            });
        }, _this.renderItem = function (item, index, _ref2, max, columns) {
            var width = _ref2.width,
                height = _ref2.height;
            var _this$props = _this.props,
                base = _this$props.base,
                items = _this$props.items,
                itemProps = _this$props.itemProps,
                spacing = _this$props.spacing,
                overlay = _this$props.overlay,
                onClick = _this$props.onClick,
                onMouseOver = _this$props.onMouseOver,
                onMouseOut = _this$props.onMouseOut;
            var itemId = item.id;


            var tileStyle = {
                height: height + 'px',
                width: width + 'px',
                marginTop: index <= columns - 1 ? 0 : spacing + 'px', // only items in first row do not have top margin
                marginLeft: index % columns === 0 ? 0 : spacing + 'px', // only items in first column do not have left margin
                marginRight: 0,
                marginBottom: 0
            };

            var isLast = index === max - 1;
            var tile = _react2.default.createElement(base, _extends({}, itemProps, item));

            // For last tile's overlay
            var total = _lodash2.default.has(_this.props, 'total') ? _this.props.total : items.length;
            var tileOverlay = isLast && total > max && overlay ? _this.renderOverlay(overlay, max, total) : null;

            var eventArgs = [itemId, { index: index, max: max, total: total, isLast: isLast }];

            return _react2.default.createElement(
                'div',
                {
                    key: 'tile-' + itemId,
                    className: (0, _classnames2.default)('tile-wrapper c-flex aic jcc', { last: isLast }),
                    style: tileStyle,
                    onClick: onClick ? onClick.bind.apply(onClick, [null].concat(eventArgs)) : null,
                    onMouseOver: onMouseOver ? onMouseOver.bind.apply(onMouseOver, [null].concat(eventArgs)) : null,
                    onMouseOut: onMouseOut ? onMouseOut.bind.apply(onMouseOut, [null].concat(eventArgs)) : null },
                tile,
                tileOverlay
            );
        }, _this.renderOverlay = function (overlay, max, total) {
            return _react2.default.createElement(
                'span',
                { className: 'tile-overlay c-flex aic jcc' },
                _lodash2.default.isFunction(overlay) ? overlay(max - 1, total) : '+' + (total - max + 1)
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Tiles, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            window.addEventListener('resize', this.updateDimension);
            this.updateDimension();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('resize', this.updateDimension);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                items = _props.items,
                _props$itemSize = _props.itemSize,
                itemWidth = _props$itemSize.width,
                itemHeight = _props$itemSize.height,
                max = _props.max,
                unit = _props.unit,
                spacing = _props.spacing;
            var _state = this.state,
                containerWidth = _state.containerWidth,
                containerHeight = _state.containerHeight;

            // Calculate the width and height by ratio when unit is '%'

            var tileSize = {
                height: unit === '%' ? Math.floor(containerHeight / 100 * itemHeight) : itemHeight,
                width: unit === '%' ? Math.floor(containerWidth / 100 * itemWidth) : itemWidth

                // number of row/column of tiles
            };var rows = Math.floor((containerHeight + spacing) / (tileSize.height + spacing));
            var columns = Math.floor((containerWidth + spacing) / (tileSize.width + spacing));
            var maxTiles = max === 'auto' ? columns * rows : max;
            this.maxTiles = maxTiles;

            return _react2.default.createElement(
                'div',
                {
                    id: id,
                    className: (0, _classnames2.default)('c-tiles c-flex aic jcc acc fww', className),
                    ref: function ref(_ref3) {
                        _this2.node = _ref3;
                    } },
                (0, _lodash2.default)(items).slice(0, maxTiles).map(function (el, i) {
                    return _this2.renderItem(el, i, tileSize, maxTiles, columns);
                }).value()
            );
        }
    }]);

    return Tiles;
}(_react2.default.Component);

Tiles.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    base: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]).isRequired,
    items: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        id: _propTypes2.default.string,
        width: _propTypes2.default.number,
        height: _propTypes2.default.number
    })).isRequired,
    total: _propTypes2.default.number,
    max: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
    overlay: _propTypes2.default.oneOfType([_propTypes2.default.bool, _propTypes2.default.func]),
    itemProps: _propTypes2.default.object,
    itemSize: _propTypes2.default.shape({
        width: _propTypes2.default.number,
        height: _propTypes2.default.number
    }),
    spacing: _propTypes2.default.number,
    unit: _propTypes2.default.oneOf(['%', 'px']),
    onClick: _propTypes2.default.func,
    onMouseOver: _propTypes2.default.func,
    onMouseOut: _propTypes2.default.func
};
Tiles.defaultProps = {
    items: [],
    overlay: true,
    itemProps: {},
    spacing: 0,
    unit: 'px'
};
exports.default = Tiles;

/***/ }),

/***/ "../src/components/timeline.js":
/*!*************************************!*\
  !*** ../src/components/timeline.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A React Timeline
 * @todo  Auto time traversal??
 *
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {number} [defaultTime] - Default current time
 * @param {number} [time] - Current time (center of timeline)
 * @param {object} [timeLink] - Link to update time. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} timeLink.value - value to update
 * @param {function} timeLink.requestChange - function to request value change
 * @param {function} [onTimeChange] - Callback function when value is selected. <br> Required when value prop is supplied
 * @param {number} onTimeChange.value - selected value
 * @param {object} onTimeChange.eventInfo - event related info
 * @param {number} onTimeChange.eventInfo.before - previously selected value
 * @param {boolean} [onTimeChange.eventInfo.byUser=false] - triggered by user?
 * @param {number} [defaultInterval] - Default interval config
 * @param {number} [interval] - Current interval config
 * @param {object} [intervalLink] - Link to update interval. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} intervalLink.value - interval to update
 * @param {function} intervalLink.requestChange - function to request interval change
 * @param {function} [onIntervalChange] - Callback function when interval is changed. <br> Required when interval prop is supplied
 * @param {number} onIntervalChange.value - current interval object
 * @param {object} onIntervalChange.eventInfo - event related info
 * @param {number} onIntervalChange.eventInfo.before - previous interval object
 * @param {array.<object>} eventGroups - Group config
 * @param {string | number} eventGroups.id - Group id
 * @param {renderable} [eventGroups.label] - Group label
 * @param {array.<object>} [events] - List of events
 * @param {string | number} events.id - event id
 * @param {renderable} [events.label=id] - event label
 * @param {number} events.start - event start time
 * @param {number} [events.end=start] - event end time
 * @param {string | number} [events.group] - event group id
 * @param {boolean | string} [move=['month','day','hour']] - Can timeline be moved by user?
 * @param {boolean} [zoom=false] - Can timeline be zoomed?
 * @param {boolean} [autoRun=false] - Automatic running time
 *
 * @example
import {Timeline} from 'react-ui'

// controlled with events and zooming
React.createClass({
    getInitialState() {
        return {
            time: 60000,
            interval: 60000
        }
    },
    handleTimeChange(time, {byUser}) {
        this.setState({time})
    },
    handleIntervalChange(interval) {
        this.setState({interval})
    },
    render() {
        let {time, interval} = this.state
        return <div>
            <label>Drag or select a Time</label>
            <Timeline id='timeline'
                className='customize-timeline'
                time={time}
                onTimeChange={this.handleTimeChange}
                interval={interval}
                onIntervalChange={this.handleIntervalChange}
                eventGroups={[
                    {id:'x',label:'X'},
                    {id:'y',label:'Y'}
                ]}
                events={[
                    {id:'a',time:60},
                    {id:'b',label:'B',start:60,group:'x'},
                    {id:'c',label:'C',start:120,group:'y'}
                ]}
                autoRun
                zoom/>
        </div>
    }
})

// simulates a movie player, can only move time not interval
React.createClass({
    getInitialState() {
        return {
            time: 0
        }
    },
    handleTimeChange(time) {
        this.setState({time})
    },
    render() {
        let {time} = this.state
        return <div>
            <label>Drag or select a Time</label>
            <Timeline
                time={time}
                onTimeChange={this.handleTimeChange}
                interval={{min:0, max:3600}}
                traverse={false}/>
        </div>
    }
})
 */

var Timeline = function (_Component) {
    _inherits(Timeline, _Component);

    function Timeline() {
        _classCallCheck(this, Timeline);

        return _possibleConstructorReturn(this, (Timeline.__proto__ || Object.getPrototypeOf(Timeline)).apply(this, arguments));
    }

    _createClass(Timeline, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement('div', null);
        }
    }]);

    return Timeline;
}(_react.Component);

Timeline.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    time: _propTypes2.default.number,
    onTimeChange: _propTypes2.default.func,
    interval: _propTypes2.default.number,
    onIntervalChange: _propTypes2.default.func,
    eventGroups: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        id: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
        label: _propTypes2.default.element
    })),
    events: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        id: _propTypes2.default.string,
        label: _propTypes2.default.element,
        start: _propTypes2.default.number,
        end: _propTypes2.default.number,
        group: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string])
    })),
    zoom: _propTypes2.default.bool,
    autoRun: _propTypes2.default.bool
};

exports.default = Timeline;

/***/ }),

/***/ "../src/components/toggle-button.js":
/*!******************************************!*\
  !*** ../src/components/toggle-button.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _jquery = __webpack_require__(/*! jquery */ "../node_modules/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/toggle-button');

/**
 * A React toggle button
 * @constructor
 * @param {string} [id] - Container dom element #id
 * @param {string} [className] - Classname for the container
 * @param {boolean} [defaultOn] - Default on value
 * @param {boolean} [on=false] - Current on value
 * @param {object} [onLink] - Link to update check value. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {*} onLink.value - value to update
 * @param {function} onLink.requestChange - function to request check value change
 * @param {boolean} [disabled=false] - Is toggle button disabled?
 * @param {function} onChange  - Callback function when toggle on/off. <br> Required when value prop is supplied
 * @param {boolean} onChange.on - on?
 * @param {object} onChange.eventInfo - event related info
 * @param {boolean} onChange.eventInfo.before - was on or off?
 * @param {string} [onText] - Text shown in toggle when the toggle is turned on
 * @param {string} [offText] - Text shown in toggle when the toggle is turned off
 *
 * @example
// controlled

import {ToggleButton} from 'react-ui'
React.createClass({
    getInitialState() {
        return {subscribe:false}
    },
    handleChange(subscribe) {
        this.setState({subscribe})
    },
    render() {
        let {subscribe} = this.state
        return <div className='c-flex aic'>
            <label htmlFor='subscribe'>Would you like to subscribe to this newsletter?</label>
            <ToggleButton id='subscribe'
                onChange={this.handleChange}
                on={subscribe}/>
        </div>
    }
})
 */

var ToggleButton = function (_React$Component) {
    _inherits(ToggleButton, _React$Component);

    function ToggleButton() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ToggleButton);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ToggleButton.__proto__ || Object.getPrototypeOf(ToggleButton)).call.apply(_ref, [this].concat(args))), _this), _this.getLabelForToggle = function () {
            return (0, _jquery2.default)(_this.node).parent().find('label[for="' + _this.props.id + '"]');
        }, _this.handleChange = function () {
            var _this$props = _this.props,
                onChange = _this$props.onChange,
                on = _this$props.on;

            onChange(!on);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ToggleButton, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            if (this.props.id && !this.props.disabled) {
                this.getLabelForToggle().on('click', function () {
                    _this2.handleChange();
                });
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.getLabelForToggle().off();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props,
                id = _props.id,
                className = _props.className,
                on = _props.on,
                disabled = _props.disabled,
                onText = _props.onText,
                offText = _props.offText;


            return _react2.default.createElement(
                'div',
                { id: id, ref: function ref(_ref2) {
                        _this3.node = _ref2;
                    }, className: (0, _classnames2.default)('c-toggle-btn', { disabled: disabled }, className) },
                _react2.default.createElement('input', {
                    type: 'checkbox',
                    onChange: disabled ? null : this.handleChange,
                    checked: on,
                    disabled: disabled }),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: id, className: 'on' },
                        onText
                    ),
                    _react2.default.createElement(
                        'label',
                        { htmlFor: id, className: 'off' },
                        offText
                    ),
                    _react2.default.createElement('span', null)
                )
            );
        }
    }]);

    return ToggleButton;
}(_react2.default.Component);

ToggleButton.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    on: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    onChange: _propTypes2.default.func,
    onText: _propTypes2.default.string,
    offText: _propTypes2.default.string
};
ToggleButton.defaultProps = {
    disabled: false,
    on: false
};
exports.default = (0, _propWire.wire)(ToggleButton, 'on', false);

/***/ }),

/***/ "../src/components/tree.js":
/*!*********************************!*\
  !*** ../src/components/tree.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _objectPathImmutable = __webpack_require__(/*! object-path-immutable */ "../node_modules/object-path-immutable/index.js");

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _propWire = __webpack_require__(/*! ../hoc/prop-wire */ "../src/hoc/prop-wire.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/components/tree');

/**
 * A React Tree Component.
 *
 * * Currently supports only single select
 *
 * @constructor
 * @param {string} [id] - Tree element #id
 * @param {string} [className] - Classname for the container
 * @param {object} [data={}] - Data to fill tree with
 * @param {string} [data.id] - node id. Note if top level id is not specified, then root node will not be displayed
 * @param {renderable} [data.label] - node label
 * @param {array<data>} [data.children] - children of the node (can be defined recursively)
 * @param {boolean} [allowToggle=true] - Allow toggle? If false all tree structure will show
 * @param {string} [selected] - Current selected node id
 * @param {string} [defaultSelected] - Default selected node id
 * @param {object} [selectedLink] - link to update selected node id. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {string} selectedLink.value - value to update
 * @param {function} selectedLink.requestChange - function to request selection change
 * @param {function} [onSelect] - Callback function when selection is changed. <br> Required when selected prop is supplied
 * @param {string} onSelect.value - current selected node id
 * @param {object} onSelect.eventInfo - event related info
 * @param {string} onSelect.eventInfo.before - previously selected node id
 * @param {array} onSelect.eventInfo.path - selected node in the form of path (array), with id & child index
 * @param {array<string>} [opened] - Current opened node ids
 * @param {array<string>} [defaultOpened] - Default opened node ids
 * @param {object} [openedLink] - link to update opened node ids. Used in conjuction with [linked-state-mixins]{@link module:linked-state-mixins}
 * @param {array<string>} openedLink.value - value to update
 * @param {function} openedLink.requestChange - function to request open change
 * @param {function} [onToggleOpen] - Callback function when open is changed. <br> Required when opened prop is supplied
 * @param {array<string>} onToggleOpen.value - current opened node ids
 * @param {object} onToggleOpen.eventInfo - event related info
 * @param {array<string>} onToggleOpen.eventInfo.before - previously opened node ids
 * @param {string} onToggleOpen.eventInfo.id - triggering id
 * @param {boolean} onToggleOpen.eventInfo.open - triggered by opening?
 * @param {array<string>} onToggleOpen.eventInfo.path - selected node in the form of path (array), with id & child index
 *
 * @example
// controlled

import _ from 'lodash'
import im from 'object-path-immutable'
import {Tree} from 'react-ui'

const INITIAL_DATA = {
    id:'home',
    label:'Home',
    children:[
        {
            id:'C', label:'C - click to load children dynamically',
            children:[]
        },
        {
            id:'A',
            children: [
                {
                    id:'A.a',
                    children: [
                        {id:'A.a.1'},
                        {
                            id:'A.a.2',
                            children:[
                                {id:'A.a.2.x'},
                                {id:'A.a.2.y'}
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id:'B', label:'B',
            children: [
                {id:'B.a', label:'B.a custom label'},
                {id:'B.b', label:'B.b custom label'}
            ]
        }
    ]
}

React.createClass({
    getInitialState() {
        return {
            allowToggle:true,
            selected:'A.a',
            data:INITIAL_DATA
        }
    },
    toggleAll() {
        let {allowToggle} = this.state;
        this.setState({allowToggle: !allowToggle})
    },
    selectEntry(selected, eventData) {
        this.setState({selected})
    },
    toggleOpen(opened, eventData) {
        let {id, open, path} = eventData;

        if (id === 'C' && open) {
            let setPath = (_(path).map(p=>p.index).tail().map(p=>'children.'+p).value()).join('.')+'.children'

            console.log(`loading more data for ${id}: ${setPath}`)

            let newData = im.set(this.state.data, setPath, [
                {id:'C.a'},
                {id:'C.b'}
            ])
            this.setState({data:newData})
        }
    },
    render() {
        let {data, selected, allowToggle} = this.state;

        return <div>
            <button onClick={this.toggleAll}>{allowToggle?'Disable':'Enable'} toggle</button>
            <Tree
                data={data}
                allowToggle={allowToggle}
                selected={selected}
                defaultOpened={['home','A']}
                onToggleOpen={this.toggleOpen}
                onSelect={this.selectEntry}/>
        </div>
    }
});
 */

var Tree = function (_React$Component) {
    _inherits(Tree, _React$Component);

    function Tree() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Tree);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Tree.__proto__ || Object.getPrototypeOf(Tree)).call.apply(_ref, [this].concat(args))), _this), _this.selectNode = function (id, isBranch, path) {
            var _this$props = _this.props,
                allowToggle = _this$props.allowToggle,
                onSelect = _this$props.onSelect,
                opened = _this$props.opened,
                onToggleOpen = _this$props.onToggleOpen;


            if (isBranch && allowToggle) {
                var idIndex = _lodash2.default.findIndex(opened, function (item) {
                    return item === id;
                });
                var open = idIndex < 0;

                var newOpened = open ? [].concat(_toConsumableArray(opened), [id]) : _objectPathImmutable2.default.del(opened, idIndex);
                onToggleOpen(newOpened, { open: open, id: id, path: path });
            }

            // to resolve onToggleOpen & onSelect setState conflict (onSelect will overwrite onToggleOpen's state)
            // use timeout
            // TODO: think of better way to address
            setTimeout(function () {
                onSelect(id, { path: path });
            }, 0);
        }, _this.renderNode = function (id, isBranch, label, openBranch, path) {
            var _this$props2 = _this.props,
                selected = _this$props2.selected,
                allowToggle = _this$props2.allowToggle;

            var isSelected = id === selected;

            return _react2.default.createElement(
                'span',
                {
                    className: (0, _classnames2.default)(isBranch ? 'branch' : 'leaf', { selected: isSelected }),
                    onClick: _this.selectNode.bind(_this, id, isBranch, path) },
                isBranch && allowToggle ? _react2.default.createElement(
                    'span',
                    null,
                    '[',
                    _react2.default.createElement('i', { className: (0, _classnames2.default)('fg', openBranch ? 'fg-less' : 'fg-add') }),
                    ']',
                    _react2.default.createElement(
                        'span',
                        { className: 'label' },
                        label || id
                    )
                ) : label || id
            );
        }, _this.renderTree = function (root, parentPath, index) {
            var _this$props3 = _this.props,
                allowToggle = _this$props3.allowToggle,
                opened = _this$props3.opened;
            var id = root.id,
                label = root.label,
                children = root.children;


            if (!id) {
                log.error('renderTree::A child without id');
                return null;
            }

            var currentPath = [].concat(_toConsumableArray(parentPath), [{ id: id, index: index }]);

            if (children) {
                var shouldOpen = !allowToggle || _lodash2.default.find(opened, function (item) {
                    return item === id;
                });

                return _react2.default.createElement(
                    'li',
                    { key: id },
                    _this.renderNode(id, true, label, shouldOpen, currentPath),
                    shouldOpen ? _react2.default.createElement(
                        'ul',
                        null,
                        _lodash2.default.map(children, function (child, i) {
                            return _this.renderTree(child, currentPath, i);
                        })
                    ) : null
                );
            } else {
                return _react2.default.createElement(
                    'li',
                    { key: id },
                    _this.renderNode(id, false, label, false, currentPath)
                );
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Tree, [{
        key: 'render',


        // TODO: allow customizing leaf node and parent nodes
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                id = _props.id,
                data = _props.data,
                className = _props.className;
            var rootId = data.id;


            return _react2.default.createElement(
                'ul',
                { id: id, className: (0, _classnames2.default)('c-tree', className) },
                rootId ? this.renderTree(data, []) : _lodash2.default.map(data.children, function (item, i) {
                    return _this2.renderTree(item, [], i);
                })
            );
        }
    }]);

    return Tree;
}(_react2.default.Component);

Tree.propTypes = {
    id: _propTypes2.default.string,
    className: _propTypes2.default.string,
    data: _propTypes2.default.shape({
        id: _propTypes2.default.string,
        label: _propTypes2.default.node,
        children: _propTypes2.default.arrayOf(_propTypes2.default.shape({
            id: _propTypes2.default.string.isRequired,
            label: _propTypes2.default.node,
            children: _propTypes2.default.array
        }))
    }),
    allowToggle: _propTypes2.default.bool, // when false, will overwrite opened config, since full tree will always be opened (opened=true)
    selected: _propTypes2.default.string,
    onSelect: _propTypes2.default.func,
    opened: _propTypes2.default.arrayOf(_propTypes2.default.string),
    onToggleOpen: _propTypes2.default.func
};
Tree.defaultProps = {
    data: {},
    allowToggle: true,
    opened: []
};
exports.default = (0, _propWire.wireSet)(Tree, {
    selected: { defaultValue: '', changeHandlerName: 'onSelect' },
    opened: { defaultValue: [], changeHandlerName: 'onToggleOpen' }
});

/***/ }),

/***/ "../src/consts/prop-types.js":
/*!***********************************!*\
  !*** ../src/consts/prop-types.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LIST_PROP = exports.SIMPLE_OBJECT_PROP = exports.SIMPLE_ARRAY_PROP = exports.SIMPLE_VALUE_PROP = undefined;

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A Simple value prop
 * @typedef {number | string} SIMPLE_VALUE_PROP
 */
/**
 * @module prop-types
 * @desc Defines commonly used prop types, as well as prop type generators
 */

var SIMPLE_VALUE_PROP = exports.SIMPLE_VALUE_PROP = _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]);

/**
 * An array of simple values prop
 * @typedef {SIMPLE_VALUE_PROP[]} SIMPLE_ARRAY_PROP
 * @example [1,2,3]
 * @example ['1','2']
 */
var SIMPLE_ARRAY_PROP = exports.SIMPLE_ARRAY_PROP = _propTypes2.default.arrayOf(SIMPLE_VALUE_PROP);

/**
 * An object of simple values prop
 * @typedef {Object.<SIMPLE_VALUE_PROP>} SIMPLE_OBJECT_PROP
 * @example {key1:1, key2:'val2'}
 */
var SIMPLE_OBJECT_PROP = exports.SIMPLE_OBJECT_PROP = _propTypes2.default.objectOf(SIMPLE_VALUE_PROP);

/**
 * A Renderable List
 * @typedef {Array<Object.<value:SIMPLE_VALUE_PROP, text:SIMPLE_VALUE_PROP>>} LIST_PROP
 * @example [{value:2,text:'this is 2'}]
 */
var LIST_PROP = exports.LIST_PROP = _propTypes2.default.arrayOf(_propTypes2.default.shape({
    value: SIMPLE_VALUE_PROP,
    text: SIMPLE_VALUE_PROP,
    children: _propTypes2.default.node
}));

/***/ }),

/***/ "../src/hoc/list-normalizer.js":
/*!*************************************!*\
  !*** ../src/hoc/list-normalizer.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.normalize = normalize;

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/hoc/list-normalizer');

function normalize(Component) {
    var listPropName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'list';

    var _class, _temp, _class$propTypes;

    var transformPropName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'listTransform';
    var fields = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ['value', 'text'];

    return _temp = _class = function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        _createClass(_class, [{
            key: 'render',
            value: function render() {
                var _this2 = this,
                    _extends3;

                var _props = this.props,
                    transform = _props[transformPropName],
                    listToTransform = _props[listPropName];

                if (!transform) {
                    return _react2.default.createElement(Component, _extends({}, this.props, {
                        ref: function ref(_ref) {
                            _this2._component = _ref;
                        }
                    }));
                }

                var transformCfg = _extends({}, _lodash2.default.reduce(fields, function (acc, field) {
                    return _extends({}, acc, _defineProperty({}, field, field));
                }, {}), transform);

                return _react2.default.createElement(Component, _extends({}, _lodash2.default.omit(this.props, transformPropName), (_extends3 = {}, _defineProperty(_extends3, listPropName, _lodash2.default.map(listToTransform, function (item) {
                    return _lodash2.default.mapKeys(item, function (v, k) {
                        return _lodash2.default.get(_lodash2.default.invert(transformCfg), k);
                    });
                })), _defineProperty(_extends3, 'ref', function ref(_ref2) {
                    _this2._component = _ref2;
                }), _extends3)));
            }
        }]);

        return _class;
    }(_react2.default.Component), _class.propTypes = (_class$propTypes = {}, _defineProperty(_class$propTypes, transformPropName, _propTypes2.default.object), _defineProperty(_class$propTypes, listPropName, _propTypes2.default.array), _class$propTypes), _temp;
}

exports.default = normalize;

/***/ }),

/***/ "../src/hoc/paginator.js":
/*!*******************************!*\
  !*** ../src/hoc/paginator.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.withPaginate = withPaginate;

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _propTypes2 = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes3 = _interopRequireDefault(_propTypes2);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _pageNav = __webpack_require__(/*! ../components/page-nav */ "../src/components/page-nav.js");

var _pageNav2 = _interopRequireDefault(_pageNav);

var _propWire = __webpack_require__(/*! ./prop-wire */ "../src/hoc/prop-wire.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/hoc/paginator');

function withPaginate(Component) {
    var _propTypes, _class, _temp;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$target = options.target,
        target = _options$target === undefined ? 'data' : _options$target;


    var propTypes = (_propTypes = {}, _defineProperty(_propTypes, target, _propTypes3.default.array), _defineProperty(_propTypes, 'paginate', _propTypes3.default.shape({
        wrapperClassName: _propTypes3.default.string,
        pageSize: _propTypes3.default.number,
        pages: _propTypes3.default.number,
        current: _propTypes3.default.number,
        thumbnails: _propTypes3.default.number,
        className: _propTypes3.default.string,
        onChange: _propTypes3.default.func
    })), _propTypes);

    return (0, _propWire.wireSet)((_temp = _class = function (_React$Component) {
        _inherits(_class, _React$Component);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        _createClass(_class, [{
            key: 'render',
            value: function render() {
                var _this2 = this;

                var _props = this.props,
                    paginate = _props.paginate,
                    data = _props[target];

                var _paginate$enabled = paginate.enabled,
                    enablePagination = _paginate$enabled === undefined ? true : _paginate$enabled,
                    _paginate$pageSize = paginate.pageSize,
                    pageSize = _paginate$pageSize === undefined ? 30 : _paginate$pageSize,
                    wrapperClassName = paginate.wrapperClassName,
                    pageNavProps = _objectWithoutProperties(paginate, ['enabled', 'pageSize', 'wrapperClassName']);

                if (enablePagination === false) {
                    return _react2.default.createElement(Component, _extends({}, _lodash2.default.omit(this.props, 'paginate'), {
                        ref: function ref(_ref) {
                            _this2._component = _ref;
                        } }));
                }

                var pages = paginate.pages;

                var propsToPass = _lodash2.default.omit(this.props, ['paginate']);
                if (!pages) {
                    var current = pageNavProps.current;

                    var total = data.length;
                    pages = Math.ceil(total / pageSize);
                    propsToPass[target] = _lodash2.default.slice(data, (current - 1) * pageSize, current * pageSize);
                }

                return _react2.default.createElement(
                    'div',
                    { className: wrapperClassName },
                    _react2.default.createElement(Component, _extends({}, propsToPass, {
                        ref: function ref(_ref2) {
                            _this2._component = _ref2;
                        } })),
                    pages > 1 && _react2.default.createElement(_pageNav2.default, _extends({
                        className: 'c-flex jcc c-margin',
                        pages: pages
                    }, pageNavProps))
                );
            }
        }]);

        return _class;
    }(_react2.default.Component), _class.propTypes = propTypes, _class.defaultProps = {
        paginate: {}
    }, _temp), {
        paginate: {
            name: 'paginate.current',
            defaultName: 'paginate.defaultCurrent',
            defaultValue: 1,
            changeHandlerName: 'paginate.onChange'
        }
    });
}

exports.default = withPaginate;

/***/ }),

/***/ "../src/hoc/prop-wire.js":
/*!*******************************!*\
  !*** ../src/hoc/prop-wire.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.wireSet = wireSet;
exports.wire = wire;
exports.wireValue = wireValue;
exports.wireChecked = wireChecked;

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _objectPathImmutable = __webpack_require__(/*! object-path-immutable */ "../node_modules/object-path-immutable/index.js");

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-ui/hoc/prop-wire');

function wireSet(Component, propsCfg) {
    propsCfg = _lodash2.default.mapValues(propsCfg, function (cfg, propName) {
        var _cfg$name = cfg.name,
            name = _cfg$name === undefined ? propName : _cfg$name,
            linkName = cfg.linkName,
            defaultName = cfg.defaultName,
            changeHandlerName = cfg.changeHandlerName,
            defaultValue = cfg.defaultValue,
            _cfg$enforceHandler = cfg.enforceHandler,
            enforceHandler = _cfg$enforceHandler === undefined ? true : _cfg$enforceHandler;

        return {
            name: name,
            linkName: linkName || propName + 'Link',
            defaultName: defaultName || 'default' + _lodash2.default.capitalize(propName),
            changeHandlerName: changeHandlerName || 'on' + _lodash2.default.capitalize(propName) + 'Change',
            defaultValue: _lodash2.default.has(cfg, 'defaultValue') ? defaultValue : '',
            enforceHandler: enforceHandler
        };
    });

    return function (_React$Component) {
        _inherits(_class2, _React$Component);

        function _class2() {
            var _ref;

            var _temp, _this, _ret;

            _classCallCheck(this, _class2);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = _lodash2.default.mapValues(propsCfg, function (_ref2) {
                var name = _ref2.name,
                    linkName = _ref2.linkName,
                    defaultName = _ref2.defaultName,
                    masterDefaultValue = _ref2.defaultValue;

                var val = _lodash2.default.get(_this.props, name);
                var valueLink = _lodash2.default.get(_this.props, linkName);
                var defaultValue = _lodash2.default.get(_this.props, defaultName);

                if (val == null && valueLink) {
                    val = valueLink.value;
                }
                if (val == null) {
                    val = defaultValue;
                }

                if (val == null) {
                    if (_lodash2.default.isFunction(masterDefaultValue)) {
                        val = masterDefaultValue(_this.props);
                    } else {
                        val = masterDefaultValue;
                    }
                }

                return val;
            }), _this.handleChange = function (propName, newVal, eventInfo) {
                var _propsCfg$propName = propsCfg[propName],
                    name = _propsCfg$propName.name,
                    linkName = _propsCfg$propName.linkName,
                    changeHandlerName = _propsCfg$propName.changeHandlerName,
                    enforceHandler = _propsCfg$propName.enforceHandler;

                var isControlled = _lodash2.default.has(_this.props, name);
                var valueLink = _lodash2.default.get(_this.props, linkName);
                var handler = _lodash2.default.get(_this.props, changeHandlerName);

                var eventData = _extends({
                    before: _this.state[propName]
                }, eventInfo);

                if (isControlled && handler) {
                    handler(newVal, eventData);
                } else if (isControlled && !handler && enforceHandler) {
                    log.error('handleChange::' + Component.displayName + '::' + propName + '. Controlled component without a \'' + JSON.stringify(changeHandlerName) + '\' event prop');
                } else if (valueLink) {
                    valueLink.requestChange(newVal, eventData);
                } else {
                    _this.setState(_defineProperty({}, propName, newVal), function () {
                        if (handler) {
                            handler(_this.state[propName], eventData);
                        }
                    });
                }
            }, _temp), _possibleConstructorReturn(_this, _ret);
        }

        _createClass(_class2, [{
            key: 'componentWillReceiveProps',
            value: function componentWillReceiveProps(nextProps) {
                var _this2 = this;

                var nextState = _lodash2.default.mapValues(propsCfg, function (_ref3, propName) {
                    var name = _ref3.name,
                        linkName = _ref3.linkName,
                        defaultName = _ref3.defaultName,
                        masterDefaultValue = _ref3.defaultValue;

                    var isControlled = _lodash2.default.has(nextProps, name);

                    var val = _lodash2.default.get(nextProps, name);
                    var valueLink = _lodash2.default.get(nextProps, linkName);
                    var defaultValue = _lodash2.default.get(nextProps, defaultName);

                    var curVal = _this2.state[propName];


                    if (val == null && valueLink) {
                        val = valueLink.value;
                    }

                    if (val == null) {
                        if (isControlled) {
                            val = defaultValue;

                            if (val == null) {
                                if (_lodash2.default.isFunction(masterDefaultValue)) {
                                    val = masterDefaultValue(nextProps);
                                } else {
                                    val = masterDefaultValue;
                                }
                            }
                        } else {
                            val = curVal;
                        }
                    }

                    return val;
                });

                this.setState(nextState);
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                var propsToIgnore = _lodash2.default.reduce(propsCfg, function (acc, _ref4) {
                    var name = _ref4.name,
                        linkName = _ref4.linkName,
                        defaultName = _ref4.defaultName,
                        changeHandlerName = _ref4.changeHandlerName;

                    return [].concat(_toConsumableArray(acc), [name, linkName, defaultName, changeHandlerName]);
                }, []);

                var baseProps = _lodash2.default.omit(this.props, propsToIgnore);

                var newProps = _lodash2.default.reduce(propsCfg, function (acc, _ref5, propName) {
                    var name = _ref5.name,
                        changeHandlerName = _ref5.changeHandlerName;

                    return (0, _objectPathImmutable2.default)(acc).set(name, _this3.state[propName]).set(changeHandlerName, _this3.handleChange.bind(_this3, propName)).value();
                }, baseProps);

                return _react2.default.createElement(Component, _extends({}, newProps, {
                    ref: function ref(_ref6) {
                        _this3._component = _ref6;
                    }
                }));
            }
        }]);

        return _class2;
    }(_react2.default.Component);
}

function wire(Component, propName) {
    var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    var changeHandlerName = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'onChange';

    return wireSet(Component, _defineProperty({}, propName, {
        defaultValue: defaultValue,
        changeHandlerName: changeHandlerName
    }));
}

function wireValue(Component) {
    return wire(Component, 'value');
}

function wireChecked(Component) {
    return wire(Component, 'checked', false);
}

exports.default = {
    wireValue: wireValue,
    wireChecked: wireChecked,
    wire: wire
};

/***/ }),

/***/ "../src/mixins/linked-state-mixins.js":
/*!********************************************!*\
  !*** ../src/mixins/linked-state-mixins.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LinkedDeepStateMixin = exports.LinkedStateMixin = undefined;

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _objectPathImmutable = __webpack_require__(/*! object-path-immutable */ "../node_modules/object-path-immutable/index.js");

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /**
                                                                                                                                                                                                                    * @module linked-state-mixins
                                                                                                                                                                                                                    * @description Input mixin methods for React components.
                                                                                                                                                                                                                    */

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('core/mixins/linked-state-mixins');

/**
 * Mixin methods for React components. <br>
 * Used for linking input value with component's state
 *
 * @mixin
 * @todo Change this into HOC or pure js module, to avoid prerequisites
 */
var LinkedStateMixin = exports.LinkedStateMixin = {
    requestChange: function requestChange(field, newValue) {
        this.setState(_defineProperty({}, field, newValue));
    },
    linkState: function linkState(field) {
        var value = _lodash2.default.get(this.state, field, null);

        return {
            requestChange: this.requestChange.bind(this, field),
            value: value
        };
    }
};

/**
 * Mixin methods for React components. <br>
 * Used for linking input value with component's NESTED state
 *
 * @mixin
 * @todo Change this into HOC or pure js module, to avoid prerequisites
 */
var LinkedDeepStateMixin = exports.LinkedDeepStateMixin = {
    requestDeepChange: function requestDeepChange(field, newValue) {
        this.setState(_objectPathImmutable2.default.set(this.state, field, newValue));
    },
    linkDeepState: function linkDeepState(field) {
        var value = _lodash2.default.get(this.state, field, null);

        return {
            requestChange: this.requestDeepChange.bind(this, field),
            value: value
        };
    }
};

/***/ }),

/***/ "../src/utils/ajax-helper.js":
/*!***********************************!*\
  !*** ../src/utils/ajax-helper.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.multi = exports.series = exports.all = exports.one = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                    * @module ajax-helper
                                                                                                                                                                                                                                                                    * @description Ajax utilities for request
                                                                                                                                                                                                                                                                    */

exports.createInstance = createInstance;
exports.getInstance = getInstance;

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = __webpack_require__(/*! bluebird */ "../node_modules/bluebird/js/browser/bluebird.js");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _jquery = __webpack_require__(/*! jquery */ "../node_modules/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _path = __webpack_require__(/*! path */ "./node_modules/path-browserify/index.js");

var _path2 = _interopRequireDefault(_path);

var _progress = __webpack_require__(/*! ../components/progress */ "../src/components/progress.js");

var _progress2 = _interopRequireDefault(_progress);

var _errorHelper = __webpack_require__(/*! ./error-helper */ "../src/utils/error-helper.js");

var _errorHelper2 = _interopRequireDefault(_errorHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('core/utils/ajax-helper');

var defaultFailParser = function defaultFailParser(json, text) {
    if (json) {
        var code = json.code,
            message = json.message,
            errors = json.errors;

        return {
            code: code,
            message: message,
            errors: errors
        };
    }

    if (text) {
        return {
            message: text
        };
    }

    return {};
};

var defaultSuccessParser = function defaultSuccessParser(json) {
    return json;
};

var defaultGt = function defaultGt(code) {
    var mapping = {
        'txt-uploading': 'Uploading...',
        'txt-uploaded': 'Done'
    };
    return mapping[code] || code;
};

/**
 * Send one ajax request
 * @param {string|Object} req - url string or jquery request object
 * @param {Object} [options] - options
 * @param {boolean} [options.showProgress=true] - whether blocking spinner will be shown during request (before response is received)
 * @param {string} [options.prefix] - prefix to prepend to requested url
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @param {function} [options.eh] - error handler instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.et] - error translator function for translating error
 * @param {function} [options.ft] - field translator function for translating field name upon receiving error
 * @return {Object} Promise object
 *
 * @example
 *
 * // use default parsers
 * ah.one('/url/...')
 *     .then(data=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 *
 * // use customized parsers
 * ah.one('/url/...', {
 *     parseSuccess:(json)=>json.data,
 *     parseFail:(json, text)=>({code:json.errCode, message:json.errMessage})
 * })
 *     .then(data=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 */
function _one(req) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$showProgress = options.showProgress,
        showProgress = _options$showProgress === undefined ? true : _options$showProgress,
        prefix = options.prefix,
        _options$parseFail = options.parseFail,
        parseFail = _options$parseFail === undefined ? defaultFailParser : _options$parseFail,
        _options$parseSuccess = options.parseSuccess,
        parseSuccess = _options$parseSuccess === undefined ? defaultSuccessParser : _options$parseSuccess,
        _options$eh = options.eh,
        eh = _options$eh === undefined ? _errorHelper2.default : _options$eh;


    showProgress && _progress2.default.startSpin();

    if (_lodash2.default.isString(req)) {
        req = {
            url: req
        };
    }

    if (prefix) {
        req = _extends({}, req, {
            url: _path2.default.join(prefix, req.url)
        });
    }

    return _bluebird2.default.resolve(_jquery2.default.ajax(_extends({ type: 'GET' }, req))).catch(function (xhr) {
        showProgress && _progress2.default.done();

        var _parseFail = parseFail(xhr.responseJSON, xhr.responseText, xhr.status),
            code = _parseFail.code,
            message = _parseFail.message,
            errors = _parseFail.errors;

        var tOptions = _lodash2.default.pick(options, ['et', 'ft']);
        if (!errors || errors.length === 0) {
            throw new Error(eh.getMsg([{ code: code, message: message }], tOptions));
        } else {
            throw new Error(eh.getMsg(errors, tOptions));
        }
    }).then(function (res) {
        showProgress && _progress2.default.done();
        return parseSuccess(res);
    });
}

/**
 * Send multiple ajax requests all at once
 * @param {array.<string|Object>} req - array of url strings or jquery request objects
 * @param {Object} [options] - options
 * @param {boolean} [options.showProgress=true] - whether blocking spinner will be shown during request (before response is received)
 * @param {string} [options.prefix] - prefix to prepend to requested urls
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @param {function} [options.eh] - error handler instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.et] - error translator function for translating error
 * @param {function} [options.ft] - field translator function for translating field name upon receiving error
 * @return {Object} Promise object
 *
 * @example
 *
 * ah.all([
 *     '/url/...',
 *     {type:'GET', url:'/url2/...', data:{key:'value'}}
 * ])
 *     .then(([data1, data2])=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 */
exports.one = _one;
function _all(reqArr) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$showProgress2 = options.showProgress,
        showProgress = _options$showProgress2 === undefined ? true : _options$showProgress2;


    showProgress && _progress2.default.startSpin();

    return _bluebird2.default.map(reqArr, function (reqItem) {
        return _one(reqItem, _extends({}, options, { showProgress: false }));
    }).then(function (result) {
        showProgress && _progress2.default.done();

        return result;
    }).catch(function (e) {
        showProgress && _progress2.default.done();

        throw new Error(e);
    });
}

/**
 * Send multiple ajax requests in sequence (send subsequest request upon completion of previous request)
 * @param {array.<string|Object>} req - array of url strings or jquery request objects
 * @param {Object} [options] - options
 * @param {boolean} [options.showProgress=true] - whether blocking spinner will be shown during request (before response is received)
 * @param {string} [options.prefix] - prefix to prepend to requested urls
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @param {function} [options.eh] - error handler instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.et] - error translator function for translating error
 * @param {function} [options.ft] - field translator function for translating field name upon receiving error
 * @return {Object} Promise object
 *
 * @example
 * ah.series([
 *     '/url/...',
 *     {type:'GET', url:'/url2/...', data:{key:'value'}}
 * ])
 *     .then(([data1, data2])=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 *
 */
exports.all = _all;
function _series(reqArr) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$showProgress3 = options.showProgress,
        showProgress = _options$showProgress3 === undefined ? true : _options$showProgress3;


    showProgress && _progress2.default.startSpin();

    return _bluebird2.default.reduce(reqArr, function (values, reqItem) {
        return _one(reqItem, _extends({}, options, { showProgress: false })).then(function (value) {
            values.push(value);
            return values;
        });
    }, []).then(function (result) {
        showProgress && _progress2.default.done();

        return result;
    }).catch(function (e) {
        showProgress && _progress2.default.done();

        throw new Error(e);
    });
}

/**
 * Send multi part ajax request
 * @param {url} req - url string
 * @param {Object} data - key-value pairs of input elements or raw data
 * @param {Object} [options] - options
 * @param {boolean} [options.showProgress=true] - whether blocking spinner will be shown during request (before response is received)
 * @param {string} [options.prefix] - prefix to prepend to requested url
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @param {function} [options.eh] - error handler instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.et] - error translator function for translating error
 * @param {function} [options.ft] - field translator function for translating field name upon receiving error
 * @return {Object} Promise object
 *
 * @example
 * ah.multi(
 *     '/url/...',
 *     {key:'value',file:FILE} // file is HTMLInputElement
 * )
 *     .then(data=>{
 *     })
 *     .catch(err=>{
 *         console.log(err.message)
 *     })
 */
exports.series = _series;
function _multi(url, data) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var _options$showProgress4 = options.showProgress,
        showProgress = _options$showProgress4 === undefined ? true : _options$showProgress4,
        prefix = options.prefix,
        _options$parseFail2 = options.parseFail,
        parseFail = _options$parseFail2 === undefined ? defaultFailParser : _options$parseFail2,
        _options$parseSuccess2 = options.parseSuccess,
        parseSuccess = _options$parseSuccess2 === undefined ? defaultSuccessParser : _options$parseSuccess2,
        _options$gt = options.gt,
        gt = _options$gt === undefined ? defaultGt : _options$gt,
        _options$eh2 = options.eh,
        eh = _options$eh2 === undefined ? _errorHelper2.default : _options$eh2;


    var hasFile = _lodash2.default.some(data, function (v) {
        return v instanceof HTMLInputElement && v.type === 'file';
    });

    if (showProgress) {
        if (hasFile) {
            _progress2.default.startProgress(gt('txt-uploading'));
        } else {
            _progress2.default.startSpin();
        }
    }

    var p = void 0,
        result = void 0;

    if (prefix) {
        url = _path2.default.join(prefix, url);
    }

    if (window.FormData) {
        var formData = new FormData();

        _lodash2.default.forEach(data, function (v, k) {
            if (v instanceof HTMLInputElement) {
                if (v.type === 'file') {
                    formData.append(k, v.files[0]);
                } else {
                    formData.append(k, v.value);
                }
            } else {
                formData.append(k, v);
            }
        });

        p = _one({
            url: url,
            type: 'POST',
            contentType: false,
            processData: false,
            data: formData,
            progress: showProgress && hasFile && function (loaded, total) {
                _progress2.default.setProgress(loaded, total);
            }
        }, _extends({}, options, { showProgress: false }));
    } else {
        p = new _bluebird2.default(function (resolve, reject) {
            // Let's create the iFrame used to send our data
            var iframe = document.createElement('iframe');
            iframe.name = 'multi';

            // Next, attach the iFrame to the main document
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            // Define what should happen when the response is loaded
            iframe.addEventListener('load', function () {
                // iframe.contentWindow.document - for IE<7
                var doc = iframe.contentDocument;
                var innerHTML = doc.body.innerHTML;

                //plain text response may be  wrapped  in <pre> tag
                if (innerHTML.slice(0, 5).toLowerCase() === '<pre>' && innerHTML.slice(-6).toLowerCase() === '</pre>') {
                    innerHTML = doc.body.firstChild.firstChild.nodeValue;
                }

                // Remove iframe after receiving response
                document.body.removeChild(iframe);

                var json = void 0;
                try {
                    json = JSON.parse(innerHTML);

                    var _parseFail2 = parseFail(json),
                        code = _parseFail2.code,
                        message = _parseFail2.message,
                        errors = _parseFail2.errors;

                    if (code === 0) {
                        resolve(parseSuccess(json));
                    } else {
                        var tOptions = _lodash2.default.pick(options, ['et', 'ft']);
                        if (!errors || errors.length === 0) {
                            reject(new Error(eh.getMsg([{ code: code, message: message }], tOptions)));
                        } else {
                            reject(new Error(eh.getMsg(errors, tOptions)));
                        }
                    }
                } catch (e) {
                    reject(e);
                }
            });

            // create form
            var form = document.createElement('form');
            form.action = url;
            form.method = 'POST';
            form.enctype = 'multipart/form-data'; // others
            form.encoding = 'multipart/form-data'; // in IE
            form.target = iframe.name;

            // Add data to form
            _lodash2.default.forEach(data, function (v, k) {
                var node = document.createElement('input');
                node.name = k;

                if (v instanceof HTMLInputElement) {
                    if (v.type === 'file') {
                        node = (0, _jquery2.default)(v).clone(true);
                        v.name = k;
                        (0, _jquery2.default)(v).hide();
                        node.insertAfter(v);
                        form.appendChild(v);
                    } else {
                        node.value = v.value;
                        form.appendChild(node.cloneNode());
                    }
                } else {
                    node.value = v;
                    form.appendChild(node.cloneNode());
                }
            });

            form.style.display = 'none';
            document.body.appendChild(form);

            // submit form
            form.submit();

            // Remove form after sent
            document.body.removeChild(form);
        });
    }

    return p.then(function (res) {
        showProgress && hasFile && _progress2.default.set(gt('txt-uploaded'));
        result = res;
        return _bluebird2.default.delay(1000);
    }).then(function () {
        showProgress && _progress2.default.done();
        return result;
    }).catch(function (err) {
        showProgress && _progress2.default.done();
        throw err;
    });
}

exports.multi = _multi;

var Ajaxer = function () {
    function Ajaxer(id) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Ajaxer);

        this.id = id;
        var prefix = options.prefix,
            _options$parseFail3 = options.parseFail,
            parseFail = _options$parseFail3 === undefined ? defaultFailParser : _options$parseFail3,
            _options$parseSuccess3 = options.parseSuccess,
            parseSuccess = _options$parseSuccess3 === undefined ? defaultSuccessParser : _options$parseSuccess3,
            et = options.et;


        this.setupPrefix(prefix);
        this.setupResponseParser(parseFail, parseSuccess);
        this.setupErrorHandler(et);
    }

    _createClass(Ajaxer, [{
        key: 'setupPrefix',
        value: function setupPrefix(prefix) {
            this.prefix = prefix;
        }
    }, {
        key: 'setupResponseParser',
        value: function setupResponseParser(parseFail, parseSuccess) {
            if (parseFail) {
                this.parseFail = parseFail;
            }
            if (parseSuccess) {
                this.parseSuccess = parseSuccess;
            }
        }
    }, {
        key: 'setupErrorHandler',
        value: function setupErrorHandler(et) {
            if (et) {
                this.eh = (0, _errorHelper.createInstance)(this.id + '-eh', { et: et });
            } else {
                this.eh = _errorHelper2.default;
            }
        }
    }, {
        key: 'one',
        value: function one(req) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return _one(req, _extends({
                prefix: this.prefix,
                parseFail: this.parseFail,
                parseSuccess: this.parseSuccess,
                eh: this.eh
            }, options));
        }
    }, {
        key: 'all',
        value: function all(reqArr) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return _all(reqArr, _extends({
                prefix: this.prefix,
                parseFail: this.parseFail,
                parseSuccess: this.parseSuccess,
                eh: this.eh
            }, options));
        }
    }, {
        key: 'series',
        value: function series(reqArr) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return _series(reqArr, _extends({
                prefix: this.prefix,
                parseFail: this.parseFail,
                parseSuccess: this.parseSuccess,
                eh: this.eh
            }, options));
        }
    }, {
        key: 'multi',
        value: function multi(url, data) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            return _multi(url, data, _extends({
                prefix: this.prefix,
                parseFail: this.parseFail,
                parseSuccess: this.parseSuccess,
                eh: this.eh
            }, options));
        }
    }]);

    return Ajaxer;
}();

Ajaxer.instances = {};

/**
 * Create a new ajax handler instance
 * @param {string} id - instance id, may be used to retrieve instance in future calls
 * @param {Object} [options] - options
 * @param {function} [options.eh] - error handler instance used by this instance. See [error-helper]{@link module:error-helper.createInstance}
 * @param {function} [options.parseFail] - parse function to return error data {code,message,errors} upon receiving error
 * @param {function} [options.parseSuccess] - parse function to return data upon successfully receiving response
 * @return {Object} created ajax handler instance object
 *
 * @example
 *
 * const moduleAjaxer = createInstance(
 *     'module-id',
 *     {
 *         parseSuccess:(json)=>json.data,
 *         parseFail:(json, text)=>({code:json.errCode, message:json.errMessage})
 *     }
 * )
 */
function createInstance(id) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (Ajaxer.instances[id]) {
        log.error('Cannot create instance, instance with id ' + id + ' already exists');
        return null;
    }

    var newInstance = new Ajaxer(id, options);
    Ajaxer.instances[id] = newInstance;
    return newInstance;
}

/**
 * Retrieves ajax handler instance
 * @param {string} id - instance id, may be used to retrieve instance in future calls
 * @return {Object} ajax handler instance object
 *
 * @example
 * const moduleAjaxer = getInstance('module-id')
 */
function getInstance(id) {
    return Ajaxer.instances[id];
}

var ah = createInstance('global');

exports.default = ah;

/***/ }),

/***/ "../src/utils/date.js":
/*!****************************!*\
  !*** ../src/utils/date.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.flatpickrToMomentToken = flatpickrToMomentToken;
/**
  * @module date
  * @description A set of date-related input utils, such as token-conversion
  */

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('utils/date');

function flatpickrToMomentToken(dateFormat, timeFormat, enableTime) {
    var format = {
        date: dateFormat,
        time: timeFormat

        // Year format, only 2 and 4 digits are supported in flatpickr
    };format.date = format.date.replace(/Y/g, 'YYYY');
    format.date = format.date.replace(/y/g, 'YY');

    // Month format, textual and numeric representations are supported in flatpickr
    format.date = format.date.replace(/M/g, 'MMM'); // Short textual representation
    format.date = format.date.replace(/F/g, 'MMMM'); // Full textual representation
    format.date = format.date.replace(/m/g, 'MM');
    format.date = format.date.replace(/n/g, 'M');

    // Day format, with ordinal suffix, and with/without zero leading
    format.date = format.date.replace(/J/g, 'Do'); // with ordinal suffix
    format.date = format.date.replace(/d/g, 'DD');
    format.date = format.date.replace(/j/g, 'D');

    if (enableTime) {
        // Hour format
        // Tokens of hour 1~12 are the same in Momentjs & flatpickr
        // Thus, only handle 24 hours format
        format.time = format.time.replace(/H/g, 'HH');

        // Moment format, only two-digits format is supported in flatpickr
        format.time = format.time.replace(/i/g, 'mm');

        // Second format
        // Tokens of second without 0 leading are the same in Momentjs & flatpickr
        // Thus, only handle the token with 0 leading
        format.time = format.time.replace(/S/g, 'ss');

        // AM/PM format. Only uppercase is supported in flatpickr
        format.time = format.time.replace(/K/g, 'A');
    }

    return format;
}

exports.default = {
    flatpickrToMomentToken: flatpickrToMomentToken
};

/***/ }),

/***/ "../src/utils/error-helper.js":
/*!************************************!*\
  !*** ../src/utils/error-helper.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getMsg = exports.getSystemMsg = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                    * @module error-helper
                                                                                                                                                                                                                                                                    * @description Error message helpers
                                                                                                                                                                                                                                                                    */

exports.createInstance = createInstance;
exports.getInstance = getInstance;

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('core/utils/error-helper');

var defaultEt = function defaultEt(codes) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return 'Error: ' + codes + ' - ' + JSON.stringify(_lodash2.default.values(params));
};

function _getMsg(_ref) {
    var code = _ref.code,
        _ref$params = _ref.params,
        params = _ref$params === undefined ? {} : _ref$params,
        message = _ref.message;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _options$et = options.et,
        et = _options$et === undefined ? defaultEt : _options$et,
        ft = options.ft;


    var msg = '';

    // try to localize 'field' parameter if exists
    if (params.field && ft) {
        msg += ft('fields.' + params.field) + ': ';
    }
    return msg + et(['' + code, '-1'], _extends({ code: code }, params, { message: message }));
}

function _getSystemMsg() {
    var et = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultEt;

    return et('-1');
}

/**
 * Converts error object(s) into an error message
 * @param {array.<Object>} errors - array of errors
 * @param {Object} [options] - options
 * @param {function} [options.et] - error translator
 * @param {function} [options.ft] - field translator
 * @return {string} error message
 *
 */
exports.getSystemMsg = _getSystemMsg;
function _getMsg2(errors) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!errors || errors.length === 0) {
        return _getSystemMsg();
    }
    return _lodash2.default.map(errors, function (error) {
        return _getMsg(error, options);
    }).join('<br/>');
}

exports.getMsg = _getMsg2;

var ErrorHandler = function () {
    function ErrorHandler(id) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, ErrorHandler);

        this.id = id;
        var _options$et2 = options.et,
            et = _options$et2 === undefined ? defaultEt : _options$et2;


        this.setupErrorTranslate(et);
    }

    _createClass(ErrorHandler, [{
        key: 'setupErrorTranslate',
        value: function setupErrorTranslate(et) {
            this.et = et;
        }
    }, {
        key: 'getSystemMsg',
        value: function getSystemMsg() {
            return _getSystemMsg(this.et);
        }
    }, {
        key: 'getMsg',
        value: function getMsg(errors) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            options = _lodash2.default.isObject(options) ? options : {};
            return _getMsg2(errors, _extends({ et: this.et }, options));
        }
    }]);

    return ErrorHandler;
}();

ErrorHandler.instances = {};

/**
 * Create a new error handler instance
 * @param {string} id - instance id, may be used to retrieve instance in future calls
 * @param {Object} [options] - options
 * @param {function} [options.et] - error translator
 * @return {Object} created error handler instance object
 *
 */
function createInstance(id, options) {
    if (ErrorHandler.instances[id]) {
        log.error('Cannot create instance, instance with id ' + id + ' already exists');
        return null;
    }

    var newInstance = new ErrorHandler(id, options);
    ErrorHandler.instances[id] = newInstance;
    return newInstance;
}

/**
 * Retrieves error handler instance
 * @param {string} id - instance id, may be used to retrieve instance in future calls
 * @return {Object} error handler instance object
 *
 * @example
 * const moduleErrorHandler = getInstance('module-id')
 */
function getInstance(id) {
    return ErrorHandler.instances[id];
}

var eh = createInstance('global');

exports.default = eh;

/***/ }),

/***/ "../src/utils/grid-event.js":
/*!**********************************!*\
  !*** ../src/utils/grid-event.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.subscribe = subscribe;

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _jquery = __webpack_require__(/*! jquery */ "../node_modules/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module grid-event
 * @description An event addon for navigating between input cells in grid
 * With this module, a table can be turned into grid, with the following abilities:
 *
 * * left, right, up, down arrows to traverse between input cells
 * * receive row/column change events
 */

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('core/mixins/grid-mixin');

function unsubscribe(node) {
    log.debug('unsubscribe');
    (0, _jquery2.default)(node).off();
}

/**
 * @typedef {Object} handler
 * @property {function} on attach event, possible events 'row'/'column' change
 * @property {function} unsubscribe unsubscribe from event
 */

/**
 * Subscribe to data grid input traverse events.
 *
 * @param {dom} node - node to attach grid events to
 * @param {boolean} [columnLayout=false] - is the table direction in columns (not rows)?
 * @return {handler} handler for attaching or unsubscribe from the event
 *
 * @example
 * let handler = subscribe(document.getElementById('table'), false)
 *     .on('row', (rowId)=>{ console.log('row changed',rowId)})
 *     .on('column', ()=>{ console.log('column changed')})
 *
 * handler.unsubscribe()
 */
function subscribe(node) {
    var columnLayout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    log.debug('subscribe');

    var left = 37,
        up = 38,
        right = 39,
        down = 40;

    if (columnLayout) {
        left = 38;
        right = 40;
        up = 37;
        down = 39;
    }

    var handle = void 0,
        register = void 0;
    var events = {};

    register = function register(type, func) {
        if (!func || !_lodash2.default.isFunction(func)) {
            log.error('register event failed');
            return null;
        }
        if (!type || !_lodash2.default.includes(['row', 'column'], type)) {
            log.error('event type must be row or column');
            return null;
        }

        events[type] = func;

        return handle;
    };

    handle = {
        unsubscribe: unsubscribe.bind(null, node),
        on: register
    };

    (0, _jquery2.default)(node).on('keydown', 'input, div[contenteditable]', function (evt) {
        var key = evt.which;
        var input = evt.target;
        var name = input.name || input.id;
        var tr = (0, _jquery2.default)(input).closest('tr');
        var td = (0, _jquery2.default)(input).closest('td');
        var targetItem = void 0;
        switch (key) {
            case left:
            case right:
                targetItem = key === left ? td.prev() : td.next();
                targetItem && targetItem.find('input, div[contenteditable]').focus();
                events.column && events.column();
                break;
            case up:
            case down:
                targetItem = key === up ? tr.prev() : tr.next();
                if (targetItem && targetItem.length > 0) {
                    targetItem.find('input[name="' + name + '"], div[id="' + name + '"][contenteditable]').focus();
                    events.row && events.row(targetItem[0].id);
                }
                break;
            default:
                break;
        }
    });

    return handle;
}

exports.default = subscribe;

/***/ }),

/***/ "../src/utils/input-helper.js":
/*!************************************!*\
  !*** ../src/utils/input-helper.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                    * @module input-helper
                                                                                                                                                                                                                                                                    * @description A set of input related utilities such as validation, retrieval
                                                                                                                                                                                                                                                                    */

exports.isInteger = isInteger;
exports.retrieveFormData = retrieveFormData;
exports.getErrorMessage = getErrorMessage;
exports.validateField = validateField;
exports.validateData = validateData;
exports.validateForm = validateForm;

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _underscore = __webpack_require__(/*! underscore.string */ "../node_modules/underscore.string/index.js");

var _underscore2 = _interopRequireDefault(_underscore);

var _path = __webpack_require__(/*! path */ "./node_modules/path-browserify/index.js");

var _path2 = _interopRequireDefault(_path);

var _jquery = __webpack_require__(/*! jquery */ "../node_modules/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _errorHelper = __webpack_require__(/*! ./error-helper */ "../src/utils/error-helper.js");

var _errorHelper2 = _interopRequireDefault(_errorHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('core/utils/input-helper');

var UNIT_BYTE = 1024 * 1024;

/**
 * Is the given value an integer (or integer like string)?
 * @param {integer|string} n - input
 * @return {boolean}
 *
 * @example
 * isInteger(1) === isInteger('1') === true
 * isInteger(1.2) === isIntger('1.2') === false
 */
function isInteger(n) {
    return !isNaN(n) && Number(n) % 1 === 0;
}

/**
 * Retrieve all inputs within dom element.<br/>
 * Currently detected elements are:
 * * input[type='text']
 * * input[type='checkbox']
 * * input[type='file']
 * * select
 * * textarea
 *
 * @param {HTMLElement} node - dom element
 * @return {object} Result in key-value pair
 *
 * @example
 * // node = <div><input id='a'/><select name='b'>...</select></div>
 * let data = retrieveFormData(node)
 * // data = { a:'1', b:'2' }
 */
function retrieveFormData(node) {
    var inputs = (0, _jquery2.default)(node).find('input:text, input:checkbox, input:password, input:file, select, textarea');

    var result = {};
    if (inputs.length > 0) {
        result = _lodash2.default.reduce(inputs, function (acc, input) {
            var value = input.value,
                type = input.type,
                id = input.id,
                name = input.name;


            if (type === 'checkbox') {
                value = input.checked;
            } else if (type === 'file') {
                value = input.files[0];
            }

            acc[id || name] = value;
            return acc;
        }, {});
    }
    return result;
}

function getErrorMessage(errors, options) {
    if (!errors || errors.length === 0) {
        return null;
    }

    if (!_lodash2.default.isArray(errors)) {
        errors = [errors];
    }
    return _errorHelper2.default.getMsg(errors, options);
}

/**
 * Validate field given type/required/validate information
 * @param {number|string} value - value to validate
 * @param {Object} format - format to check value against
 * @param {string} format.name field name
 * @param {'text'|'number'|'integer'|'file'} [format.type='text']
 * @param {boolean} [format.required=false] is this field mandatory?
 * @param {RegExp|string} [format.pattern] validate using regexp pattern
 * @param {string} [format.patternReadable] readable error message for pattern
 * @param {string | Array.<string>} [format.extension] accepted file extension (when type=file)
 * @param {number} [format.min] min value (when type=number|integer)
 * @param {number} [format.max] max value (when type=number|integer|file)
 * @param {boolean|Object} [tOptions=true] - translator options
 * @param {function} [tOptions.et=default error translator] - error translator function
 * @param {function} [tOptions.ft] - field translator function
 * @return {Object<{code:string, params:{field:string,value:(string|object),min:number,max:number,pattern:string,extension:string}}>} returns error object if tOptions=false
 * @return {string} returns translated error message if tOptions is specified
 *
 * @example
 * let error = validateField(7, {name:'field_name',type:'interger',max:6}, false)
 * // error == {code:'out-of-bound', params:{field:'field_name',value:7,max:6}}
 *
 * let error = validateField('07123456', {name:'field_name', pattern:/^[0-9]{10}$/, patternReadable:'not a valid mobile phone #'}, false)
 * // error == {code:'no-match', params:{field:'field_name', value:'07123456', pattern:'not a valid mobile phone #'}}
 *
 * let error = validateField(file, {name: 'file_input', type: 'file', required: true, max: 10}, false)
 * // error == {code: 'file-too-large', params: {field: 'file_input', size: 10, value: File}}
 */
function validateField(value, _ref) {
    var field = _ref.name,
        _ref$type = _ref.type,
        inputType = _ref$type === undefined ? 'text' : _ref$type,
        _ref$required = _ref.required,
        required = _ref$required === undefined ? false : _ref$required,
        pattern = _ref.pattern,
        patternReadable = _ref.patternReadable,
        extension = _ref.extension,
        min = _ref.min,
        max = _ref.max;
    var tOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var errCode = '';
    var errParams = {};

    if (value == null || _underscore2.default.isBlank(value)) {
        if (required) {
            errCode = 'missing';
        }
    } else if (pattern) {
        if (pattern instanceof RegExp && !pattern.test(value) || _lodash2.default.isString(pattern) && !new RegExp(pattern).test(value)) {
            errCode = 'no-match';
            errParams = { pattern: patternReadable || pattern };
        }
    } else if (inputType === 'number' || inputType === 'integer') {
        if (inputType === 'integer' && !isInteger(value)) {
            errCode = 'not-int';
        } else if (inputType === 'number' && isNaN(value)) {
            errCode = 'not-num';
        } else {
            var parsedValue = parseFloat(value);
            var hasMin = min != null;
            var hasMax = max != null;
            if (hasMin && parsedValue < min || hasMax && parsedValue > max) {
                errCode = 'out-of-bound';
                errParams = { min: hasMin ? min : '', max: hasMax ? max : '' };
            }
        }
    } else if (inputType === 'file') {
        var extName = _lodash2.default.toLower(_path2.default.extname(value.name));
        var mimeType = value.type;

        if (max && value.size > max * UNIT_BYTE) {
            errCode = 'file-too-large';
            errParams = {
                max: max
            };
        } else if (extension) {
            if (Array.isArray(extension)) {
                var lowerCaseExt = _lodash2.default.map(extension, _lodash2.default.toLower);
                var isPass = _lodash2.default.some(lowerCaseExt, function (el) {
                    return el === extName || el === mimeType || RegExp(/^[\w\d]+\/\*$/).test(el) && RegExp(el).test(mimeType);
                });

                if (!isPass) {
                    errCode = 'file-wrong-format';
                    errParams = {
                        extension: lowerCaseExt.toString()
                    };
                }
            } else {
                var _lowerCaseExt = _lodash2.default.toLower(extension);
                var isRangedExt = RegExp(/^[\w\d]+\/\*$/).test(_lowerCaseExt);

                var _isPass = extName === _lowerCaseExt || mimeType === _lowerCaseExt || isRangedExt && RegExp(_lowerCaseExt).test(mimeType);

                if (!_isPass) {
                    errCode = 'file-wrong-format';
                    errParams = {
                        extension: _lowerCaseExt
                    };
                }
            }
        }
    }

    var error = null;
    if (errCode) {
        error = { code: errCode, params: _extends({ field: field, value: value }, errParams) };
    }

    if (tOptions) {
        return getErrorMessage(error, tOptions);
    }

    return error;
}

/**
 * Validate data input(s) against given format.<br/>
 *
 * @param {object} data - key-value pairs
 * @param {object} format - format to check
 * @param {boolean|Object} [tOptions=true] - translator options
 * @param {function} [tOptions.et=default error translator] - error translator function
 * @param {function} [tOptions.ft] - field translator function
 * @return {Array.<error>} Array of errors if tOptions=false. See [validateField]{@link module:input-helper.validateField}
 * @return {string} returns translated error message if tOptions is specified
 *
 * @example
 * let data = {'key1':'value1', 'key2':7, 'key3':3}
 * let format = { required:true, type:'integer', max:6 }
 * let errors = validateData(data, format, false)
 * // errors == [
 * //   {code:'not-int', params:{field:'key1',value:'value1'}},
 * //   {code:'out-of-bound', params:{field:'key2', value:7, max:6}}
 * // ]
 *
 */
function validateData(data, format) {
    var tOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    log.debug('validateData', data, format);
    var result = _lodash2.default.reduce(data, function (acc, v, k) {
        // if all fields use different format, then format[k] is used as validation
        // otherwise assume format is a global format
        var formatToCheck = format[k] || format;

        if (!_lodash2.default.isArray(v)) {
            v = [v];
        }

        if (formatToCheck.required && v.length <= 0) {
            log.warn('validateData::array input required', k);
            acc.push({ code: 'missing', params: { field: k } });
        } else {
            _lodash2.default.forEach(v, function (item) {
                var err = validateField(item, _extends({ name: k }, formatToCheck), false);
                if (err) {
                    acc.push(err);
                }
            });
        }

        return acc;
    }, []);

    if (result.length <= 0) {
        result = null;
    }
    log.debug('validateData::result', result);

    if (tOptions) {
        return getErrorMessage(result, tOptions);
    }

    return result;
}

/**
 * Validate form input(s) contained in specified dom node against given format.<br/>
 *
 * @param {HTMLElement} node - dom element containing form inputs
 * @param {object} format - format to check
 * @param {boolean|Object} [tOptions=true] - translator options
 * @param {function} [tOptions.et=default error translator] - error translator function
 * @param {function} [tOptions.ft] - field translator function
 * @return {Array.<error>} Array of errors if tOptions=false. See [validateField]{@link module:input-helper.validateField}
 * @return {string} returns translated error message if tOptions is specified
 *
 */
function validateForm(node, format, tOptions) {
    var data = retrieveFormData(node);
    return validateData(data, format, tOptions);
}

exports.default = {
    retrieveFormData: retrieveFormData,
    validateField: validateField,
    validateForm: validateForm,
    validateData: validateData,
    getErrorMessage: getErrorMessage
};

/***/ }),

/***/ "../src/utils/outside-event.js":
/*!*************************************!*\
  !*** ../src/utils/outside-event.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.subscribe = subscribe;

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _jquery = __webpack_require__(/*! jquery */ "../node_modules/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
  * @module outside-event
  * @description A subscription for clicking on inside/outside events
  */

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('core/utils/outside-event');

function unsubscribe() {
    log.debug('unsubscribe');
    (0, _jquery2.default)('html').off();
}

/**
 * @typedef {Object} handler
 * @property {function} onInside attach inside event
 * @property {function} onOutside attach outside event
 * @property {function} unsubscribe unsubscribe from event
 */

/**
 * Subscribe to inside/outside events.
 * @param {dom} node - node to initialze handler for
 * @return {handler} handler for attaching or unsubscribe from the event
 *
 * @example
 * let handler = subscribe(document.getElementById('region'))
 *     .onInside(target=>{ console.log('inside is clicked') })
 *     .onOutside(target=>{ console.log('outside is clicked') })
 *
 * handler.unsubscribe()
 */
function subscribe(node) {
    log.debug('subscribe');

    var onInside = void 0,
        onOutside = void 0,
        handle = void 0;

    var register = function register(type, func) {
        if (!func || !_lodash2.default.isFunction(func)) {
            log.error('register event failed');
            return null;
        }
        if (type === 'inside') {
            onInside = func;
        } else if (type === 'outside') {
            onOutside = func;
        } else {
            log.error('unsupported event type', type);
        }
        return handle;
    };

    handle = {
        unsubscribe: unsubscribe,
        onInside: register.bind(null, 'inside'),
        onOutside: register.bind(null, 'outside')
    };

    (0, _jquery2.default)('html').on('click', function (evt) {
        var target = evt.target;

        if (node) {
            if (target.id !== 'overlay' && _jquery2.default.contains(node, target)) {
                onInside && onInside(target);
            } else {
                onOutside && onOutside(target);
            }
        }
    });

    return handle;
}

exports.default = subscribe;

/***/ }),

/***/ "./node_modules/moment/locale sync recursive ^\\.\\/.*$":
/*!**************************************************!*\
  !*** ./node_modules/moment/locale sync ^\.\/.*$ ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./af": "./node_modules/moment/locale/af.js",
	"./af.js": "./node_modules/moment/locale/af.js",
	"./ar": "./node_modules/moment/locale/ar.js",
	"./ar-dz": "./node_modules/moment/locale/ar-dz.js",
	"./ar-dz.js": "./node_modules/moment/locale/ar-dz.js",
	"./ar-kw": "./node_modules/moment/locale/ar-kw.js",
	"./ar-kw.js": "./node_modules/moment/locale/ar-kw.js",
	"./ar-ly": "./node_modules/moment/locale/ar-ly.js",
	"./ar-ly.js": "./node_modules/moment/locale/ar-ly.js",
	"./ar-ma": "./node_modules/moment/locale/ar-ma.js",
	"./ar-ma.js": "./node_modules/moment/locale/ar-ma.js",
	"./ar-sa": "./node_modules/moment/locale/ar-sa.js",
	"./ar-sa.js": "./node_modules/moment/locale/ar-sa.js",
	"./ar-tn": "./node_modules/moment/locale/ar-tn.js",
	"./ar-tn.js": "./node_modules/moment/locale/ar-tn.js",
	"./ar.js": "./node_modules/moment/locale/ar.js",
	"./az": "./node_modules/moment/locale/az.js",
	"./az.js": "./node_modules/moment/locale/az.js",
	"./be": "./node_modules/moment/locale/be.js",
	"./be.js": "./node_modules/moment/locale/be.js",
	"./bg": "./node_modules/moment/locale/bg.js",
	"./bg.js": "./node_modules/moment/locale/bg.js",
	"./bm": "./node_modules/moment/locale/bm.js",
	"./bm.js": "./node_modules/moment/locale/bm.js",
	"./bn": "./node_modules/moment/locale/bn.js",
	"./bn.js": "./node_modules/moment/locale/bn.js",
	"./bo": "./node_modules/moment/locale/bo.js",
	"./bo.js": "./node_modules/moment/locale/bo.js",
	"./br": "./node_modules/moment/locale/br.js",
	"./br.js": "./node_modules/moment/locale/br.js",
	"./bs": "./node_modules/moment/locale/bs.js",
	"./bs.js": "./node_modules/moment/locale/bs.js",
	"./ca": "./node_modules/moment/locale/ca.js",
	"./ca.js": "./node_modules/moment/locale/ca.js",
	"./cs": "./node_modules/moment/locale/cs.js",
	"./cs.js": "./node_modules/moment/locale/cs.js",
	"./cv": "./node_modules/moment/locale/cv.js",
	"./cv.js": "./node_modules/moment/locale/cv.js",
	"./cy": "./node_modules/moment/locale/cy.js",
	"./cy.js": "./node_modules/moment/locale/cy.js",
	"./da": "./node_modules/moment/locale/da.js",
	"./da.js": "./node_modules/moment/locale/da.js",
	"./de": "./node_modules/moment/locale/de.js",
	"./de-at": "./node_modules/moment/locale/de-at.js",
	"./de-at.js": "./node_modules/moment/locale/de-at.js",
	"./de-ch": "./node_modules/moment/locale/de-ch.js",
	"./de-ch.js": "./node_modules/moment/locale/de-ch.js",
	"./de.js": "./node_modules/moment/locale/de.js",
	"./dv": "./node_modules/moment/locale/dv.js",
	"./dv.js": "./node_modules/moment/locale/dv.js",
	"./el": "./node_modules/moment/locale/el.js",
	"./el.js": "./node_modules/moment/locale/el.js",
	"./en-au": "./node_modules/moment/locale/en-au.js",
	"./en-au.js": "./node_modules/moment/locale/en-au.js",
	"./en-ca": "./node_modules/moment/locale/en-ca.js",
	"./en-ca.js": "./node_modules/moment/locale/en-ca.js",
	"./en-gb": "./node_modules/moment/locale/en-gb.js",
	"./en-gb.js": "./node_modules/moment/locale/en-gb.js",
	"./en-ie": "./node_modules/moment/locale/en-ie.js",
	"./en-ie.js": "./node_modules/moment/locale/en-ie.js",
	"./en-il": "./node_modules/moment/locale/en-il.js",
	"./en-il.js": "./node_modules/moment/locale/en-il.js",
	"./en-nz": "./node_modules/moment/locale/en-nz.js",
	"./en-nz.js": "./node_modules/moment/locale/en-nz.js",
	"./eo": "./node_modules/moment/locale/eo.js",
	"./eo.js": "./node_modules/moment/locale/eo.js",
	"./es": "./node_modules/moment/locale/es.js",
	"./es-do": "./node_modules/moment/locale/es-do.js",
	"./es-do.js": "./node_modules/moment/locale/es-do.js",
	"./es-us": "./node_modules/moment/locale/es-us.js",
	"./es-us.js": "./node_modules/moment/locale/es-us.js",
	"./es.js": "./node_modules/moment/locale/es.js",
	"./et": "./node_modules/moment/locale/et.js",
	"./et.js": "./node_modules/moment/locale/et.js",
	"./eu": "./node_modules/moment/locale/eu.js",
	"./eu.js": "./node_modules/moment/locale/eu.js",
	"./fa": "./node_modules/moment/locale/fa.js",
	"./fa.js": "./node_modules/moment/locale/fa.js",
	"./fi": "./node_modules/moment/locale/fi.js",
	"./fi.js": "./node_modules/moment/locale/fi.js",
	"./fo": "./node_modules/moment/locale/fo.js",
	"./fo.js": "./node_modules/moment/locale/fo.js",
	"./fr": "./node_modules/moment/locale/fr.js",
	"./fr-ca": "./node_modules/moment/locale/fr-ca.js",
	"./fr-ca.js": "./node_modules/moment/locale/fr-ca.js",
	"./fr-ch": "./node_modules/moment/locale/fr-ch.js",
	"./fr-ch.js": "./node_modules/moment/locale/fr-ch.js",
	"./fr.js": "./node_modules/moment/locale/fr.js",
	"./fy": "./node_modules/moment/locale/fy.js",
	"./fy.js": "./node_modules/moment/locale/fy.js",
	"./gd": "./node_modules/moment/locale/gd.js",
	"./gd.js": "./node_modules/moment/locale/gd.js",
	"./gl": "./node_modules/moment/locale/gl.js",
	"./gl.js": "./node_modules/moment/locale/gl.js",
	"./gom-latn": "./node_modules/moment/locale/gom-latn.js",
	"./gom-latn.js": "./node_modules/moment/locale/gom-latn.js",
	"./gu": "./node_modules/moment/locale/gu.js",
	"./gu.js": "./node_modules/moment/locale/gu.js",
	"./he": "./node_modules/moment/locale/he.js",
	"./he.js": "./node_modules/moment/locale/he.js",
	"./hi": "./node_modules/moment/locale/hi.js",
	"./hi.js": "./node_modules/moment/locale/hi.js",
	"./hr": "./node_modules/moment/locale/hr.js",
	"./hr.js": "./node_modules/moment/locale/hr.js",
	"./hu": "./node_modules/moment/locale/hu.js",
	"./hu.js": "./node_modules/moment/locale/hu.js",
	"./hy-am": "./node_modules/moment/locale/hy-am.js",
	"./hy-am.js": "./node_modules/moment/locale/hy-am.js",
	"./id": "./node_modules/moment/locale/id.js",
	"./id.js": "./node_modules/moment/locale/id.js",
	"./is": "./node_modules/moment/locale/is.js",
	"./is.js": "./node_modules/moment/locale/is.js",
	"./it": "./node_modules/moment/locale/it.js",
	"./it.js": "./node_modules/moment/locale/it.js",
	"./ja": "./node_modules/moment/locale/ja.js",
	"./ja.js": "./node_modules/moment/locale/ja.js",
	"./jv": "./node_modules/moment/locale/jv.js",
	"./jv.js": "./node_modules/moment/locale/jv.js",
	"./ka": "./node_modules/moment/locale/ka.js",
	"./ka.js": "./node_modules/moment/locale/ka.js",
	"./kk": "./node_modules/moment/locale/kk.js",
	"./kk.js": "./node_modules/moment/locale/kk.js",
	"./km": "./node_modules/moment/locale/km.js",
	"./km.js": "./node_modules/moment/locale/km.js",
	"./kn": "./node_modules/moment/locale/kn.js",
	"./kn.js": "./node_modules/moment/locale/kn.js",
	"./ko": "./node_modules/moment/locale/ko.js",
	"./ko.js": "./node_modules/moment/locale/ko.js",
	"./ky": "./node_modules/moment/locale/ky.js",
	"./ky.js": "./node_modules/moment/locale/ky.js",
	"./lb": "./node_modules/moment/locale/lb.js",
	"./lb.js": "./node_modules/moment/locale/lb.js",
	"./lo": "./node_modules/moment/locale/lo.js",
	"./lo.js": "./node_modules/moment/locale/lo.js",
	"./lt": "./node_modules/moment/locale/lt.js",
	"./lt.js": "./node_modules/moment/locale/lt.js",
	"./lv": "./node_modules/moment/locale/lv.js",
	"./lv.js": "./node_modules/moment/locale/lv.js",
	"./me": "./node_modules/moment/locale/me.js",
	"./me.js": "./node_modules/moment/locale/me.js",
	"./mi": "./node_modules/moment/locale/mi.js",
	"./mi.js": "./node_modules/moment/locale/mi.js",
	"./mk": "./node_modules/moment/locale/mk.js",
	"./mk.js": "./node_modules/moment/locale/mk.js",
	"./ml": "./node_modules/moment/locale/ml.js",
	"./ml.js": "./node_modules/moment/locale/ml.js",
	"./mn": "./node_modules/moment/locale/mn.js",
	"./mn.js": "./node_modules/moment/locale/mn.js",
	"./mr": "./node_modules/moment/locale/mr.js",
	"./mr.js": "./node_modules/moment/locale/mr.js",
	"./ms": "./node_modules/moment/locale/ms.js",
	"./ms-my": "./node_modules/moment/locale/ms-my.js",
	"./ms-my.js": "./node_modules/moment/locale/ms-my.js",
	"./ms.js": "./node_modules/moment/locale/ms.js",
	"./mt": "./node_modules/moment/locale/mt.js",
	"./mt.js": "./node_modules/moment/locale/mt.js",
	"./my": "./node_modules/moment/locale/my.js",
	"./my.js": "./node_modules/moment/locale/my.js",
	"./nb": "./node_modules/moment/locale/nb.js",
	"./nb.js": "./node_modules/moment/locale/nb.js",
	"./ne": "./node_modules/moment/locale/ne.js",
	"./ne.js": "./node_modules/moment/locale/ne.js",
	"./nl": "./node_modules/moment/locale/nl.js",
	"./nl-be": "./node_modules/moment/locale/nl-be.js",
	"./nl-be.js": "./node_modules/moment/locale/nl-be.js",
	"./nl.js": "./node_modules/moment/locale/nl.js",
	"./nn": "./node_modules/moment/locale/nn.js",
	"./nn.js": "./node_modules/moment/locale/nn.js",
	"./pa-in": "./node_modules/moment/locale/pa-in.js",
	"./pa-in.js": "./node_modules/moment/locale/pa-in.js",
	"./pl": "./node_modules/moment/locale/pl.js",
	"./pl.js": "./node_modules/moment/locale/pl.js",
	"./pt": "./node_modules/moment/locale/pt.js",
	"./pt-br": "./node_modules/moment/locale/pt-br.js",
	"./pt-br.js": "./node_modules/moment/locale/pt-br.js",
	"./pt.js": "./node_modules/moment/locale/pt.js",
	"./ro": "./node_modules/moment/locale/ro.js",
	"./ro.js": "./node_modules/moment/locale/ro.js",
	"./ru": "./node_modules/moment/locale/ru.js",
	"./ru.js": "./node_modules/moment/locale/ru.js",
	"./sd": "./node_modules/moment/locale/sd.js",
	"./sd.js": "./node_modules/moment/locale/sd.js",
	"./se": "./node_modules/moment/locale/se.js",
	"./se.js": "./node_modules/moment/locale/se.js",
	"./si": "./node_modules/moment/locale/si.js",
	"./si.js": "./node_modules/moment/locale/si.js",
	"./sk": "./node_modules/moment/locale/sk.js",
	"./sk.js": "./node_modules/moment/locale/sk.js",
	"./sl": "./node_modules/moment/locale/sl.js",
	"./sl.js": "./node_modules/moment/locale/sl.js",
	"./sq": "./node_modules/moment/locale/sq.js",
	"./sq.js": "./node_modules/moment/locale/sq.js",
	"./sr": "./node_modules/moment/locale/sr.js",
	"./sr-cyrl": "./node_modules/moment/locale/sr-cyrl.js",
	"./sr-cyrl.js": "./node_modules/moment/locale/sr-cyrl.js",
	"./sr.js": "./node_modules/moment/locale/sr.js",
	"./ss": "./node_modules/moment/locale/ss.js",
	"./ss.js": "./node_modules/moment/locale/ss.js",
	"./sv": "./node_modules/moment/locale/sv.js",
	"./sv.js": "./node_modules/moment/locale/sv.js",
	"./sw": "./node_modules/moment/locale/sw.js",
	"./sw.js": "./node_modules/moment/locale/sw.js",
	"./ta": "./node_modules/moment/locale/ta.js",
	"./ta.js": "./node_modules/moment/locale/ta.js",
	"./te": "./node_modules/moment/locale/te.js",
	"./te.js": "./node_modules/moment/locale/te.js",
	"./tet": "./node_modules/moment/locale/tet.js",
	"./tet.js": "./node_modules/moment/locale/tet.js",
	"./tg": "./node_modules/moment/locale/tg.js",
	"./tg.js": "./node_modules/moment/locale/tg.js",
	"./th": "./node_modules/moment/locale/th.js",
	"./th.js": "./node_modules/moment/locale/th.js",
	"./tl-ph": "./node_modules/moment/locale/tl-ph.js",
	"./tl-ph.js": "./node_modules/moment/locale/tl-ph.js",
	"./tlh": "./node_modules/moment/locale/tlh.js",
	"./tlh.js": "./node_modules/moment/locale/tlh.js",
	"./tr": "./node_modules/moment/locale/tr.js",
	"./tr.js": "./node_modules/moment/locale/tr.js",
	"./tzl": "./node_modules/moment/locale/tzl.js",
	"./tzl.js": "./node_modules/moment/locale/tzl.js",
	"./tzm": "./node_modules/moment/locale/tzm.js",
	"./tzm-latn": "./node_modules/moment/locale/tzm-latn.js",
	"./tzm-latn.js": "./node_modules/moment/locale/tzm-latn.js",
	"./tzm.js": "./node_modules/moment/locale/tzm.js",
	"./ug-cn": "./node_modules/moment/locale/ug-cn.js",
	"./ug-cn.js": "./node_modules/moment/locale/ug-cn.js",
	"./uk": "./node_modules/moment/locale/uk.js",
	"./uk.js": "./node_modules/moment/locale/uk.js",
	"./ur": "./node_modules/moment/locale/ur.js",
	"./ur.js": "./node_modules/moment/locale/ur.js",
	"./uz": "./node_modules/moment/locale/uz.js",
	"./uz-latn": "./node_modules/moment/locale/uz-latn.js",
	"./uz-latn.js": "./node_modules/moment/locale/uz-latn.js",
	"./uz.js": "./node_modules/moment/locale/uz.js",
	"./vi": "./node_modules/moment/locale/vi.js",
	"./vi.js": "./node_modules/moment/locale/vi.js",
	"./x-pseudo": "./node_modules/moment/locale/x-pseudo.js",
	"./x-pseudo.js": "./node_modules/moment/locale/x-pseudo.js",
	"./yo": "./node_modules/moment/locale/yo.js",
	"./yo.js": "./node_modules/moment/locale/yo.js",
	"./zh-cn": "./node_modules/moment/locale/zh-cn.js",
	"./zh-cn.js": "./node_modules/moment/locale/zh-cn.js",
	"./zh-hk": "./node_modules/moment/locale/zh-hk.js",
	"./zh-hk.js": "./node_modules/moment/locale/zh-hk.js",
	"./zh-tw": "./node_modules/moment/locale/zh-tw.js",
	"./zh-tw.js": "./node_modules/moment/locale/zh-tw.js"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	var module = __webpack_require__(id);
	return module;
}
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) { // check for number or string
		var e = new Error('Cannot find module "' + req + '".');
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return id;
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "./node_modules/moment/locale sync recursive ^\\.\\/.*$";

/***/ }),

/***/ "./src/app.js":
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");

var _reactRouter = __webpack_require__(/*! react-router */ "./node_modules/react-router/es/index.js");

var _loglevel = __webpack_require__(/*! loglevel */ "./node_modules/loglevel/lib/loglevel.js");

var _loglevel2 = _interopRequireDefault(_loglevel);

var _client = __webpack_require__(/*! loglevel-prefix-persist/client */ "./node_modules/loglevel-prefix-persist/client.js");

var _client2 = _interopRequireDefault(_client);

__webpack_require__(/*! font-gorilla/css/font-gorilla.css */ "./node_modules/font-gorilla/css/font-gorilla.css");

__webpack_require__(/*! purecss/build/pure-min.css */ "./node_modules/purecss/build/pure-min.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initialState = JSON.parse(document.getElementById('initial-state').innerHTML);

var cfg = initialState.envCfg;


var log = (0, _client2.default)(cfg.env, _loglevel2.default, cfg.log);

var Routes = __webpack_require__(/*! ./routes */ "./src/routes.js").default;

(0, _reactDom.render)(_react2.default.createElement(
    _reactRouter.Router,
    { history: _reactRouter.browserHistory },
    Routes
), document.getElementById('app-container'));

/***/ }),

/***/ "./src/css.js":
/*!********************!*\
  !*** ./src/css.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _exampleFactory = __webpack_require__(/*! ./example-factory */ "./src/example-factory.js");

var _exampleFactory2 = _interopRequireDefault(_exampleFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Examples = {};

function formatXml(xml) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    _lodash2.default.forEach(xml.split('\r\n'), function (node) {
        var indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '  ';
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    });

    return formatted;
}

Examples.Buttons = function (_React$Component) {
    _inherits(_class2, _React$Component);

    function _class2() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, _class2);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = { isPress: [false, false, false, false] }, _this.click = function (index) {
            var isPress = _this.state.isPress;

            var newPress = [];
            var len = isPress.length;
            for (var i = 0; i < len; i++) {
                newPress.push(i === index ? !isPress[i] : isPress[i]);
            }
            _this.setState({ isPress: newPress }, function () {
                _this.setState({
                    $test: formatXml(_this.node.innerHTML)
                });
            });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(_class2, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var isPress = this.state.isPress;


            return _react2.default.createElement(
                'div',
                { ref: function ref(_ref2) {
                        _this2.node = _ref2;
                    } },
                _react2.default.createElement(
                    'button',
                    { onClick: this.click.bind(this, 0) },
                    'Primary'
                ),
                _react2.default.createElement(
                    'button',
                    { className: 'standard', onClick: this.click.bind(this, 1) },
                    'Standard'
                ),
                _react2.default.createElement(
                    'button',
                    { disabled: true, onClick: this.click.bind(this, 2) },
                    'Disabled'
                ),
                _react2.default.createElement(
                    'button',
                    { className: 'standard', disabled: true, onClick: this.click.bind(this, 3) },
                    'Standard Disabled'
                )
            );
        }
    }]);

    return _class2;
}(_react2.default.Component);

Examples.Radios = function (_React$Component2) {
    _inherits(_class4, _React$Component2);

    function _class4() {
        var _ref3;

        var _temp2, _this3, _ret2;

        _classCallCheck(this, _class4);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this3 = _possibleConstructorReturn(this, (_ref3 = _class4.__proto__ || Object.getPrototypeOf(_class4)).call.apply(_ref3, [this].concat(args))), _this3), _this3.state = { isPress: [false, false] }, _this3.click = function (index) {
            var isPress = _this3.state.isPress;

            console.log(index);
            console.log(isPress);
            var newPress = [];
            var len = isPress.length;
            for (var i = 0; i < len; i++) {
                newPress.push(i === index);
            }
            _this3.setState({ isPress: newPress }, function () {
                _this3.setState({
                    $test: formatXml(_this3.node.innerHTML)
                });
            });
        }, _temp2), _possibleConstructorReturn(_this3, _ret2);
    }

    _createClass(_class4, [{
        key: 'render',
        value: function render() {
            var _this4 = this;

            // let {movie} = this.state
            var isPress = this.state.isPress;


            return _react2.default.createElement(
                'div',
                { ref: function ref(_ref4) {
                        _this4.node = _ref4;
                    } },
                _react2.default.createElement('input', { type: 'radio', id: 'r0', onClick: this.click.bind(this, 0), checked: isPress[0] }),
                _react2.default.createElement(
                    'label',
                    { htmlFor: 'r0' },
                    'choose1'
                ),
                _react2.default.createElement('input', { type: 'radio', id: 'r2', onClick: this.click.bind(this, 1), checked: isPress[1] }),
                _react2.default.createElement(
                    'label',
                    { htmlFor: 'r2' },
                    'choose2'
                ),
                _react2.default.createElement('input', { type: 'radio', name: 'r', disabled: true }),
                _react2.default.createElement(
                    'label',
                    { htmlFor: 'r' },
                    'Unckecked disabled'
                ),
                _react2.default.createElement('input', { type: 'radio', name: 'r1', checked: true, disabled: true }),
                _react2.default.createElement(
                    'label',
                    { htmlFor: 'r' },
                    'Checked disabled'
                )
            );
        }
    }]);

    return _class4;
}(_react2.default.Component);

Examples.Menus = function (_React$Component3) {
    _inherits(_class6, _React$Component3);

    function _class6() {
        var _ref5;

        var _temp3, _this5, _ret3;

        _classCallCheck(this, _class6);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _ret3 = (_temp3 = (_this5 = _possibleConstructorReturn(this, (_ref5 = _class6.__proto__ || Object.getPrototypeOf(_class6)).call.apply(_ref5, [this].concat(args))), _this5), _this5.state = { isPress: [false, false, false, false, false, false, false, false] }, _this5.click = function (index) {
            var isPress = _this5.state.isPress;

            var newPress = [];
            var len = isPress.length;
            for (var i = 0; i < len; i++) {
                newPress.push(i === index ? !isPress[i] : isPress[i]);
            }
            _this5.setState({ isPress: newPress }, function () {
                _this5.setState({
                    $test: formatXml(_this5.node.innerHTML)
                });
            });
        }, _temp3), _possibleConstructorReturn(_this5, _ret3);
    }

    _createClass(_class6, [{
        key: 'render',
        value: function render() {
            var _this6 = this;

            var isPress = this.state.isPress;


            return _react2.default.createElement(
                'div',
                { ref: function ref(_ref6) {
                        _this6.node = _ref6;
                    } },
                _react2.default.createElement(
                    'ul',
                    { className: 'c-menu' },
                    _react2.default.createElement(
                        'li',
                        { className: (0, _classnames2.default)({ 'header current': isPress[0], header: !isPress[0] }), onClick: this.click.bind(this, 0) },
                        'Primary Menu'
                    ),
                    _react2.default.createElement(
                        'li',
                        { className: (0, _classnames2.default)({ current: isPress[1] }), onClick: this.click.bind(this, 1) },
                        'Item 1'
                    ),
                    _react2.default.createElement(
                        'li',
                        { className: (0, _classnames2.default)({ current: isPress[2] }), onClick: this.click.bind(this, 2) },
                        'Item 2'
                    ),
                    _react2.default.createElement(
                        'li',
                        { className: 'disabled' },
                        'Disabled'
                    )
                ),
                _react2.default.createElement(
                    'ul',
                    { className: 'c-menu plain' },
                    _react2.default.createElement(
                        'li',
                        { className: (0, _classnames2.default)({ 'header current': isPress[4], header: !isPress[4] }), onClick: this.click.bind(this, 4) },
                        'Plain Menu'
                    ),
                    _react2.default.createElement(
                        'li',
                        { className: (0, _classnames2.default)({ current: isPress[5] }), onClick: this.click.bind(this, 5) },
                        'Item 1'
                    ),
                    _react2.default.createElement(
                        'li',
                        { className: (0, _classnames2.default)({ current: isPress[6] }), onClick: this.click.bind(this, 6) },
                        'Item 2'
                    ),
                    _react2.default.createElement(
                        'li',
                        { className: 'disabled' },
                        'Disabled'
                    )
                )
            );
        }
    }]);

    return _class6;
}(_react2.default.Component);

Examples.Lists = function (_React$Component4) {
    _inherits(_class8, _React$Component4);

    function _class8() {
        var _ref7;

        var _temp4, _this7, _ret4;

        _classCallCheck(this, _class8);

        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        return _ret4 = (_temp4 = (_this7 = _possibleConstructorReturn(this, (_ref7 = _class8.__proto__ || Object.getPrototypeOf(_class8)).call.apply(_ref7, [this].concat(args))), _this7), _this7.state = { isPress: [false, false, false, false, false, false, false, false] }, _this7.click = function (index) {
            var isPress = _this7.state.isPress;

            var newPress = [];
            var len = isPress.length;
            for (var i = 0; i < len; i++) {
                newPress.push(i === index ? !isPress[i] : isPress[i]);
            }
            _this7.setState({ isPress: newPress }, function () {
                _this7.setState({
                    $test: formatXml(_this7.node.innerHTML)
                });
            });
        }, _temp4), _possibleConstructorReturn(_this7, _ret4);
    }

    _createClass(_class8, [{
        key: 'render',
        value: function render() {
            var _this8 = this;

            var isPress = this.state.isPress;


            return _react2.default.createElement(
                'div',
                { ref: function ref(_ref8) {
                        _this8.node = _ref8;
                    } },
                _react2.default.createElement(
                    'ul',
                    { className: 'c-menu sub' },
                    _react2.default.createElement(
                        'li',
                        { className: (0, _classnames2.default)({ 'header current': isPress[0], header: !isPress[0] }), onClick: this.click.bind(this, 0) },
                        'List Title1'
                    ),
                    _react2.default.createElement(
                        'li',
                        { className: (0, _classnames2.default)({ current: isPress[1] }), onClick: this.click.bind(this, 1) },
                        'Item 1'
                    ),
                    _react2.default.createElement(
                        'li',
                        { className: (0, _classnames2.default)({ current: isPress[2] }), onClick: this.click.bind(this, 2) },
                        'Item 2'
                    ),
                    _react2.default.createElement(
                        'li',
                        { className: 'disabled' },
                        'Disabled'
                    ),
                    _react2.default.createElement(
                        'li',
                        { className: (0, _classnames2.default)({ 'header current': isPress[4], header: !isPress[4] }), onClick: this.click.bind(this, 4) },
                        'List Title2'
                    ),
                    _react2.default.createElement(
                        'li',
                        { className: (0, _classnames2.default)({ current: isPress[5] }), onClick: this.click.bind(this, 5) },
                        'Item 5'
                    ),
                    _react2.default.createElement(
                        'li',
                        { className: (0, _classnames2.default)({ current: isPress[6] }), onClick: this.click.bind(this, 6) },
                        'Item 6'
                    ),
                    _react2.default.createElement(
                        'li',
                        { className: 'disabled' },
                        'Disabled'
                    )
                )
            );
        }
    }]);

    return _class8;
}(_react2.default.Component);

Examples.Navs = function (_React$Component5) {
    _inherits(_class10, _React$Component5);

    function _class10() {
        var _ref9;

        var _temp5, _this9, _ret5;

        _classCallCheck(this, _class10);

        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
        }

        return _ret5 = (_temp5 = (_this9 = _possibleConstructorReturn(this, (_ref9 = _class10.__proto__ || Object.getPrototypeOf(_class10)).call.apply(_ref9, [this].concat(args))), _this9), _this9.state = { isPress: [false, false, false, false, false, false, false, false] }, _this9.click = function (index) {
            var isPress = _this9.state.isPress;

            var newPress = [];
            var len = isPress.length;
            for (var i = 0; i < len; i++) {
                newPress.push(i === index);
            }
            _this9.setState({ isPress: newPress }, function () {
                _this9.setState({
                    $test: formatXml(_this9.node.innerHTML)
                });
            });
        }, _temp5), _possibleConstructorReturn(_this9, _ret5);
    }

    _createClass(_class10, [{
        key: 'render',
        value: function render() {
            var _this10 = this;

            var isPress = this.state.isPress;


            return _react2.default.createElement(
                'div',
                { ref: function ref(_ref10) {
                        _this10.node = _ref10;
                    } },
                _react2.default.createElement(
                    'div',
                    { className: 'c-nav' },
                    _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)({ current: isPress[1] }), onClick: this.click.bind(this, 1) },
                        'Item 1'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)({ current: isPress[2] }), onClick: this.click.bind(this, 2) },
                        'Item 2'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)({ current: isPress[3] }), onClick: this.click.bind(this, 3) },
                        'Item 3'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)({ current: isPress[4] }), onClick: this.click.bind(this, 4) },
                        'Item 4'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)({ current: isPress[5] }), onClick: this.click.bind(this, 5) },
                        'Item 5'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)({ current: isPress[6] }), onClick: this.click.bind(this, 6) },
                        'Item 6'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)({ current: isPress[7] }), onClick: this.click.bind(this, 7) },
                        'Item 7'
                    )
                )
            );
        }
    }]);

    return _class10;
}(_react2.default.Component);

Examples.SubNavs = function (_React$Component6) {
    _inherits(_class12, _React$Component6);

    function _class12() {
        var _ref11;

        var _temp6, _this11, _ret6;

        _classCallCheck(this, _class12);

        for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
        }

        return _ret6 = (_temp6 = (_this11 = _possibleConstructorReturn(this, (_ref11 = _class12.__proto__ || Object.getPrototypeOf(_class12)).call.apply(_ref11, [this].concat(args))), _this11), _this11.state = { isPress: [false, false, false, false, false, false, false, false] }, _this11.click = function (index) {
            var isPress = _this11.state.isPress;

            var newPress = [];
            var len = isPress.length;
            for (var i = 0; i < len; i++) {
                newPress.push(i === index);
            }
            _this11.setState({ isPress: newPress }, function () {
                _this11.setState({
                    $test: formatXml(_this11.node.innerHTML)
                });
            });
        }, _temp6), _possibleConstructorReturn(_this11, _ret6);
    }

    _createClass(_class12, [{
        key: 'render',
        value: function render() {
            var _this12 = this;

            var isPress = this.state.isPress;


            return _react2.default.createElement(
                'div',
                { ref: function ref(_ref12) {
                        _this12.node = _ref12;
                    } },
                _react2.default.createElement(
                    'div',
                    { className: 'c-nav sub' },
                    _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)({ current: isPress[1] }), onClick: this.click.bind(this, 1) },
                        'Item 1'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)({ current: isPress[2] }), onClick: this.click.bind(this, 2) },
                        'Item 2'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)({ current: isPress[3] }), onClick: this.click.bind(this, 3) },
                        'Item 3'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)({ current: isPress[4] }), onClick: this.click.bind(this, 4) },
                        'Item 4'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)({ current: isPress[5] }), onClick: this.click.bind(this, 5) },
                        'Item 5'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)({ current: isPress[6] }), onClick: this.click.bind(this, 6) },
                        'Item 6'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: (0, _classnames2.default)({ current: isPress[7] }), onClick: this.click.bind(this, 7) },
                        'Item 7'
                    )
                )
            );
        }
    }]);

    return _class12;
}(_react2.default.Component);

var _class13 = function (_React$Component7) {
    _inherits(_class13, _React$Component7);

    function _class13() {
        _classCallCheck(this, _class13);

        return _possibleConstructorReturn(this, (_class13.__proto__ || Object.getPrototypeOf(_class13)).apply(this, arguments));
    }

    _createClass(_class13, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                _lodash2.default.map(Examples, function (example, key) {
                    return _react2.default.createElement((0, _exampleFactory2.default)(example, key), { key: key });
                })
            );
        }
    }]);

    return _class13;
}(_react2.default.Component);

exports.default = _class13;

/***/ }),

/***/ "./src/example-factory.js":
/*!********************************!*\
  !*** ./src/example-factory.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (Component, title) {
    return function (_React$Component) {
        _inherits(_class2, _React$Component);

        function _class2() {
            var _ref;

            var _temp, _this, _ret;

            _classCallCheck(this, _class2);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _this.updateStateInfo = function () {
                if (JSON.stringify(_this.component.state || {}) !== JSON.stringify(_this.state)) {
                    _this.setState(_this.component.state || {});
                }
            }, _temp), _possibleConstructorReturn(_this, _ret);
        }

        _createClass(_class2, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                this.interval = setInterval(function () {
                    _this2.updateStateInfo();
                }, 500);
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                clearInterval(this.interval);
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                return _react2.default.createElement(
                    'fieldset',
                    null,
                    _react2.default.createElement(
                        'legend',
                        null,
                        title
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'example' },
                        _react2.default.createElement(
                            'div',
                            { className: 'demo' },
                            _react2.default.createElement(Component, { ref: function ref(_ref2) {
                                    _this3.component = _ref2;
                                } })
                        ),
                        _react2.default.createElement(
                            'pre',
                            { className: 'state' },
                            _lodash2.default.map(_lodash2.default.omitBy(this.state, function (v, k) {
                                return _lodash2.default.startsWith(k, '_');
                            }), function (v, k) {
                                var isHtml = _lodash2.default.startsWith(k, '$');
                                return _react2.default.createElement(
                                    'div',
                                    { key: k },
                                    _react2.default.createElement(
                                        'label',
                                        null,
                                        k,
                                        ':'
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        null,
                                        isHtml ? v : JSON.stringify(v, null, '  ')
                                    )
                                );
                            })
                        )
                    )
                );
            }
        }]);

        return _class2;
    }(_react2.default.Component);
};

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/***/ }),

/***/ "./src/form-advanced.js":
/*!******************************!*\
  !*** ./src/form-advanced.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _jquery = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _objectPathImmutable = __webpack_require__(/*! object-path-immutable */ "./node_modules/object-path-immutable/index.js");

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _classnames = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _form = __webpack_require__(/*! core/components/form */ "../src/components/form.js");

var _form2 = _interopRequireDefault(_form);

var _components = __webpack_require__(/*! core/components */ "../src/components/index.js");

var _exampleFactory = __webpack_require__(/*! ./example-factory */ "./src/example-factory.js");

var _exampleFactory2 = _interopRequireDefault(_exampleFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Examples = {};

Examples.Combobox = function (_React$Component) {
    _inherits(_class2, _React$Component);

    function _class2() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, _class2);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            movie: {
                selected: 'test',
                eventInfo: null,
                info: null,
                error: false,
                list: [{ value: 'test', text: 'TEST' }]
            },
            tv: {
                selected: [],
                eventInfo: null,
                info: null,
                error: false,
                list: []
            },
            producers: {}
        }, _this.handleChange = function (field, value, eventInfo) {
            _this.setState((0, _objectPathImmutable2.default)(_this.state).set(field + '.selected', value).set(field + '.eventInfo', eventInfo).value());
        }, _this.handleSearch = function (type, text) {
            // ajax to fetch movies, but doesn't need to be ajax
            _this.setState((0, _objectPathImmutable2.default)(_this.state).set(type + '.list', []).set(type + '.error', false).set(type + '.info', 'Loading...').value(), function () {
                _jquery2.default.get('https://api.themoviedb.org/3/' + (text ? 'search' : 'discover') + '/' + type, {
                    api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                    query: text
                }).done(function (_ref2) {
                    var _ref2$results = _ref2.results,
                        list = _ref2$results === undefined ? [] : _ref2$results,
                        _ref2$total_results = _ref2.total_results,
                        total = _ref2$total_results === undefined ? 0 : _ref2$total_results;

                    if (total <= 0) {
                        _this.setState((0, _objectPathImmutable2.default)(_this.state).set(type + '.list', []).set(type + '.info', 'No ' + type + ' found').value());
                    } else {
                        _this.setState((0, _objectPathImmutable2.default)(_this.state).set(type + '.list', _lodash2.default.map(list, function (_ref3) {
                            var id = _ref3.id,
                                name = _ref3.name,
                                title = _ref3.title;
                            return { value: id, text: title || name };
                        })).set(type + '.info', total > 10 ? 'There are ' + total + ' results, only show the first 10 records' : null).value());
                    }
                }).fail(function (xhr) {
                    _this.setState(_objectPathImmutable2.default.set(_this.state, type + '.error', xhr.responseText));
                });
            });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(_class2, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                'div',
                { className: 'c-form' },
                ['movie', 'tv'].map(function (type) {
                    var _state$type = _this2.state[type],
                        info = _state$type.info,
                        error = _state$type.error,
                        list = _state$type.list,
                        selected = _state$type.selected;


                    return _react2.default.createElement(
                        'div',
                        { key: type },
                        _react2.default.createElement(
                            'label',
                            { htmlFor: type },
                            'Select ',
                            type
                        ),
                        _react2.default.createElement(_components.Combobox, {
                            id: type,
                            required: true,
                            onChange: _this2.handleChange.bind(_this2, type),
                            search: {
                                enabled: true,
                                onSearch: _this2.handleSearch.bind(_this2, type)
                            },
                            info: info,
                            infoClassName: (0, _classnames2.default)({ 'c-error': error }),
                            list: list,
                            placeholder: type,
                            enableClear: type === 'tv',
                            multiSelect: {
                                enabled: type === 'tv',
                                toggleAll: true,
                                toggleAllText: 'All'
                            },
                            value: selected })
                    );
                }),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'producers' },
                        'Select producers'
                    ),
                    _react2.default.createElement(_components.Combobox, {
                        id: 'producers',
                        list: ['abc', 'def', 'xyz', 'ijk'].map(function (i) {
                            return { value: i, text: i };
                        }),
                        multiSelect: {
                            enabled: true,
                            toggleAll: true
                        },
                        search: {
                            enabled: true
                        },
                        info: function info(list) {
                            return list.length <= 0 ? 'No Results Found' : '';
                        },
                        onChange: this.handleChange.bind(this, 'producers'),
                        value: this.state.producers.selected })
                )
            );
        }
    }]);

    return _class2;
}(_react2.default.Component);

Examples.MultiInput = function (_React$Component2) {
    _inherits(_class4, _React$Component2);

    function _class4() {
        var _ref4;

        var _temp2, _this3, _ret2;

        _classCallCheck(this, _class4);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this3 = _possibleConstructorReturn(this, (_ref4 = _class4.__proto__ || Object.getPrototypeOf(_class4)).call.apply(_ref4, [this].concat(args))), _this3), _this3.state = {
            phones: [],
            movies: [],
            actors: [],
            files: [],
            forms: [{ field1: 'value1' }],
            settings: {
                layout: '',
                readOnly: false
            }
        }, _this3.handleChange = function (field, value) {
            _this3.setState(_defineProperty({}, field, value));
        }, _this3.renderDemoSettings = function () {
            var settings = _this3.state.settings;

            return _react2.default.createElement(_form2.default, {
                className: 'demo-settings inline',
                fields: {
                    layout: {
                        label: 'layout',
                        editor: 'RadioGroup',
                        props: {
                            className: 'inline',
                            list: _lodash2.default.map(['', 'inline', 'expand', 'boxed'], function (item) {
                                return { value: item, text: item || 'default(none)' };
                            })
                        }
                    },
                    readOnly: {
                        label: 'readOnly',
                        editor: 'Checkbox'
                    }
                },
                value: settings,
                onChange: function onChange(newSettings) {
                    _this3.setState({ settings: newSettings });
                } });
        }, _temp2), _possibleConstructorReturn(_this3, _ret2);
    }

    _createClass(_class4, [{
        key: 'render',
        value: function render() {
            var _state = this.state,
                phones = _state.phones,
                movies = _state.movies,
                actors = _state.actors,
                forms = _state.forms,
                _state$settings = _state.settings,
                layout = _state$settings.layout,
                readOnly = _state$settings.readOnly;

            var layoutProp = _defineProperty({}, layout, true);
            return _react2.default.createElement(
                'div',
                null,
                this.renderDemoSettings(),
                _react2.default.createElement(
                    'div',
                    { className: 'c-form' },
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'label',
                            { htmlFor: 'phones' },
                            'Enter phones'
                        ),
                        _react2.default.createElement(_components.MultiInput, _extends({
                            id: 'phones',
                            base: 'Input',
                            props: { validate: {
                                    pattern: /^[0-9]{10}$/,
                                    t: function t() {
                                        return 'Incorrect phone number, should read like 0900000000';
                                    }
                                } },
                            readOnly: readOnly
                        }, layoutProp, {
                            onChange: this.handleChange.bind(this, 'phones'),
                            value: phones }))
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'label',
                            { htmlFor: 'movies' },
                            'Select movies'
                        ),
                        _react2.default.createElement(_components.MultiInput, _extends({
                            id: 'movies',
                            base: 'Combobox',
                            props: {
                                enableClear: false,
                                list: ['abc', 'def', 'xyz', 'ijk'].map(function (i) {
                                    return { value: i, text: i };
                                }),
                                search: {
                                    enabled: true
                                }
                            },
                            readOnly: readOnly
                        }, layoutProp, {
                            onChange: this.handleChange.bind(this, 'movies'),
                            value: movies }))
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'label',
                            { htmlFor: 'actors' },
                            'Select actors'
                        ),
                        _react2.default.createElement(_components.MultiInput, _extends({
                            id: 'actors',
                            base: 'Dropdown',
                            props: { list: ['abc', 'def', 'xyz', 'ijk'].map(function (i) {
                                    return { value: i, text: i };
                                }) },
                            readOnly: readOnly
                        }, layoutProp, {
                            onChange: this.handleChange.bind(this, 'actors'),
                            value: actors }))
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'label',
                            { htmlFor: 'files' },
                            'Select files (using FileInput component)'
                        ),
                        _react2.default.createElement(_components.MultiInput, _extends({
                            id: 'files',
                            base: 'FileInput',
                            props: {
                                accept: '.csv',
                                enableClear: false
                            },
                            readOnly: readOnly
                        }, layoutProp, {
                            persistKeys: true,
                            onChange: this.handleChange.bind(this, 'files') }))
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'label',
                            { htmlFor: 'input' },
                            'React Native Inputs'
                        ),
                        _react2.default.createElement(_components.MultiInput, _extends({
                            id: 'react',
                            base: 'input',
                            props: {
                                type: 'text'
                            },
                            readOnly: readOnly
                        }, layoutProp, {
                            onChange: this.handleChange.bind(this, 'react') }))
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'label',
                            null,
                            'Multi Forms'
                        ),
                        _react2.default.createElement(_components.MultiInput, _extends({
                            base: 'Form',
                            props: {
                                className: 'inline',
                                fields: {
                                    field1: { editor: 'Input' },
                                    field2: { editor: 'Input' },
                                    field3: { editor: 'Input' },
                                    field4: { editor: 'Input' }
                                }
                            },
                            value: forms,
                            readOnly: readOnly
                        }, layoutProp, {
                            addText: 'Add New Form',
                            defaultItemValue: {},
                            onChange: this.handleChange.bind(this, 'forms') }))
                    )
                )
            );
        }
    }]);

    return _class4;
}(_react2.default.Component);

var Query = function (_React$Component3) {
    _inherits(Query, _React$Component3);

    function Query() {
        var _ref5;

        var _temp3, _this4, _ret3;

        _classCallCheck(this, Query);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _ret3 = (_temp3 = (_this4 = _possibleConstructorReturn(this, (_ref5 = Query.__proto__ || Object.getPrototypeOf(Query)).call.apply(_ref5, [this].concat(args))), _this4), _this4.handleChange = function (field, value) {
            var _this4$props = _this4.props,
                onChange = _this4$props.onChange,
                curValue = _this4$props.value;

            onChange(_extends({}, curValue, _defineProperty({}, field, value)));
        }, _temp3), _possibleConstructorReturn(_this4, _ret3);
    }

    _createClass(Query, [{
        key: 'render',
        value: function render() {
            var _props$value = this.props.value,
                app = _props$value.app,
                time = _props$value.time;

            var APPLICATIONS = ['Facebook', 'Twitter', 'Plurk', 'Line', 'Yahoo'];
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'span',
                    null,
                    ' Web Application:',
                    _react2.default.createElement(_components.Dropdown, {
                        required: true,
                        onChange: this.handleChange.bind(this, 'app'),
                        value: app,
                        list: APPLICATIONS.map(function (type) {
                            return { value: type, text: type };
                        }) })
                ),
                _react2.default.createElement(
                    'span',
                    null,
                    'Time:',
                    _react2.default.createElement(_components.Input, { placeholder: 'Enter Time', onChange: this.handleChange.bind(this, 'time'), value: time })
                )
            );
        }
    }]);

    return Query;
}(_react2.default.Component);

Query.propTypes = {
    onChange: _propTypes2.default.func,
    value: _propTypes2.default.shape({
        app: _propTypes2.default.string,
        time: _propTypes2.default.string
    })
};


Examples.MultiInputCustom = function (_React$Component4) {
    _inherits(_class6, _React$Component4);

    function _class6() {
        var _ref6;

        var _temp4, _this5, _ret4;

        _classCallCheck(this, _class6);

        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        return _ret4 = (_temp4 = (_this5 = _possibleConstructorReturn(this, (_ref6 = _class6.__proto__ || Object.getPrototypeOf(_class6)).call.apply(_ref6, [this].concat(args))), _this5), _this5.state = {
            queries: [{ app: 'Facebook', time: '2016-07-26 14:00' }, { app: 'Facebook', time: '2016-07-25 14:45' }]
        }, _this5.handleChange = function (queries) {
            _this5.setState({ queries: queries });
        }, _temp4), _possibleConstructorReturn(_this5, _ret4);
    }

    _createClass(_class6, [{
        key: 'render',
        value: function render() {
            var queries = this.state.queries;

            return _react2.default.createElement(_components.MultiInput, {
                base: Query,
                value: queries,
                addText: 'Add Query',
                removeText: 'Remove',
                defaultItemValue: { app: 'Facebook' },
                onChange: this.handleChange });
        }
    }]);

    return _class6;
}(_react2.default.Component);

Examples.BasicForm = function (_React$Component5) {
    _inherits(_class8, _React$Component5);

    function _class8() {
        var _ref7;

        var _temp5, _this6, _ret5;

        _classCallCheck(this, _class8);

        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
        }

        return _ret5 = (_temp5 = (_this6 = _possibleConstructorReturn(this, (_ref7 = _class8.__proto__ || Object.getPrototypeOf(_class8)).call.apply(_ref7, [this].concat(args))), _this6), _this6.state = {
            movie: {
                id: 99,
                year: '1982',
                title: 'Blade Runner',
                director: 'Ridley Scott',
                languages: ['english', 'japanese'],
                reviews: 'Great movie!',
                genre: 'scifi', // index into 'scifi' drop down list
                notes: [],
                scores: {
                    imdb: 8.2,
                    rottenTomatoes: 8.9
                }
            },
            settings: {
                withActions: false,
                columns: 3,
                classNames: ['inline', 'left']
            }
        }, _this6.handleChange = function (movie, eventInfo) {
            _this6.setState({ movie: movie, eventInfo: eventInfo });
        }, _this6.handleSearch = function (movie) {
            // do some ajax here
            console.log('search for movie', { movie: movie });
        }, _this6.renderDemoSettings = function () {
            var settings = _this6.state.settings;

            return _react2.default.createElement(_form2.default, {
                className: 'demo-settings',
                formClassName: 'inline',
                fields: {
                    withActions: {
                        label: 'Include Actions',
                        editor: 'Checkbox'
                    },
                    columns: {
                        label: '# columns',
                        editor: 'Dropdown',
                        props: {
                            list: _lodash2.default.map([1, 2, 3, 4], function (c) {
                                return { value: c, text: c };
                            })
                        }
                    },
                    classNames: {
                        label: 'Apply classNames',
                        editor: 'CheckboxGroup',
                        props: {
                            className: 'inline',
                            list: _lodash2.default.map(['inline', 'aligned', 'left'], function (cn) {
                                return { value: cn, text: cn };
                            })
                        }
                    }
                },
                value: settings,
                onChange: function onChange(newSettings) {
                    _this6.setState({ settings: newSettings });
                } });
        }, _temp5), _possibleConstructorReturn(_this6, _ret5);
    }

    _createClass(_class8, [{
        key: 'render',
        value: function render() {
            var _state2 = this.state,
                _state2$settings = _state2.settings,
                withActions = _state2$settings.withActions,
                classNames = _state2$settings.classNames,
                columns = _state2$settings.columns,
                movie = _state2.movie;


            return _react2.default.createElement(
                'div',
                null,
                this.renderDemoSettings(),
                _react2.default.createElement(_form2.default, {
                    id: 'movie',
                    formClassName: (0, _classnames2.default)(classNames),
                    actions: withActions ? {
                        clear: { text: 'Clear', clearForm: true },
                        search: { text: 'Search', triggerOnComplete: false, handler: this.handleSearch }
                    } : null,
                    columns: columns,
                    fields: {
                        id: { label: 'ID', formatter: function formatter(id) {
                                return 'X' + id;
                            } },
                        year: { label: 'Year', editor: 'Input', props: { type: 'integer', required: true, validate: { min: 1900 } } },
                        title: { label: 'Title', editor: 'Input', props: { required: true } },
                        director: { label: 'Director', editor: 'Input', props: { required: true } },
                        directedIn: { label: 'Directed In', editor: 'DatePicker', props: {} },
                        genre: { label: 'Genre', editor: 'Dropdown', props: {
                                list: [{ value: 'drama', text: 'Drama' }, { value: 'horror', text: 'Horror' }, { value: 'scifi', text: 'Sci-Fi' }],
                                defaultText: 'Please select a genre'
                            } },
                        languages: { label: 'Languages', className: 'group', editor: 'CheckboxGroup', props: {
                                list: [{ value: 'english', text: 'English' }, { value: 'japanese', text: 'Japanese' }, { value: 'german', text: 'German' }, { value: 'xyz', text: 'XYZ' }],
                                disabled: ['xyz']
                            } },
                        reviews: { label: 'Reviews', editor: 'Textarea', props: { required: false } },
                        notes: { label: 'Notes', editor: 'MultiInput', props: { base: 'Input', inline: true } },
                        'scores.imdb': { label: 'IMDB Score', editor: 'Input', props: function props(data) {
                                // disable IMDB score when production year is in the future
                                if (data.year >= 2017) {
                                    return { disabled: true };
                                } else {
                                    return { type: 'number', validate: { min: 0 } };
                                }
                            } },
                        'scores.rottenTomatoes': { label: 'Tomatoes Score', editor: 'Input', props: { type: 'number', validate: { min: 0 } } }
                    },
                    onChange: this.handleChange,
                    value: movie })
            );
        }
    }]);

    return _class8;
}(_react2.default.Component);

Examples.ComplexForm = function (_React$Component6) {
    _inherits(_class10, _React$Component6);

    function _class10() {
        var _ref8;

        var _temp6, _this7, _ret6;

        _classCallCheck(this, _class10);

        for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
        }

        return _ret6 = (_temp6 = (_this7 = _possibleConstructorReturn(this, (_ref8 = _class10.__proto__ || Object.getPrototypeOf(_class10)).call.apply(_ref8, [this].concat(args))), _this7), _this7.state = {
            movie: {
                id: 99,
                year: '1982',
                title: 'Blade Runner',
                director: 'Ridley Scott',
                languages: ['english', 'japanese'],
                genre: 'scifi', // index into 'scifi' drop down list
                notes: [],
                scores: {
                    imdb: 8.2,
                    rottenTomatoes: 8.9
                }
            },
            settings: {
                withActions: false,
                columns: 2,
                classNames: ['aligned', 'inline']
            }
        }, _this7.handleChange = function (movie, eventInfo) {
            _this7.setState({ movie: movie, eventInfo: eventInfo });
        }, _this7.handleSearch = function (movie) {
            // do some ajax here
            console.log('search for movie', { movie: movie });
        }, _this7.renderDemoSettings = function () {
            var settings = _this7.state.settings;

            return _react2.default.createElement(_form2.default, {
                className: 'demo-settings',
                formClassName: 'inline',
                fields: {
                    withActions: {
                        label: 'Include Actions',
                        editor: 'Checkbox'
                    },
                    columns: {
                        label: '# columns',
                        editor: 'Dropdown',
                        props: {
                            list: _lodash2.default.map([1, 2, 3, 4], function (c) {
                                return { value: c, text: c };
                            })
                        }
                    },
                    classNames: {
                        label: 'Apply classNames',
                        editor: 'CheckboxGroup',
                        props: {
                            className: 'inline',
                            list: _lodash2.default.map(['inline', 'aligned', 'left'], function (cn) {
                                return { value: cn, text: cn };
                            })
                        }
                    }
                },
                value: settings,
                onChange: function onChange(newSettings) {
                    _this7.setState({ settings: newSettings });
                } });
        }, _temp6), _possibleConstructorReturn(_this7, _ret6);
    }

    _createClass(_class10, [{
        key: 'render',
        value: function render() {
            var _state3 = this.state,
                _state3$settings = _state3.settings,
                withActions = _state3$settings.withActions,
                classNames = _state3$settings.classNames,
                columns = _state3$settings.columns,
                movie = _state3.movie;


            return _react2.default.createElement(
                'div',
                null,
                this.renderDemoSettings(),
                _react2.default.createElement(_form2.default, {
                    id: 'movie',
                    header: 'Create New Movie',
                    footer: '* required fields',
                    formClassName: (0, _classnames2.default)(classNames),
                    actions: withActions ? {
                        clear: { text: 'Clear', clearForm: true },
                        search: { text: 'Search', triggerOnComplete: true, handler: this.handleSearch }
                    } : null,
                    columns: columns,
                    fields: {
                        summary: {
                            merge: true,
                            editor: 'Form',
                            props: {
                                header: 'Movie',
                                formClassName: 'inline',
                                fields: {
                                    id: { label: 'ID', formatter: function formatter(id) {
                                            return 'X' + id;
                                        } },
                                    year: { label: 'Year', editor: 'Input', props: { type: 'integer', required: true, validate: { min: 1900 } } },
                                    title: { label: 'Title', editor: 'Input', props: { required: true } }
                                }
                            }
                        },
                        director: {
                            merge: true,
                            editor: 'Form',
                            props: {
                                header: 'Director',
                                formClassName: 'inline',
                                fields: {
                                    director: { label: 'Director', editor: 'Input', props: { required: true } },
                                    directedIn: { label: 'Directed In', editor: 'DatePicker', props: {} }
                                }
                            }
                        },
                        misc: {
                            merge: true,
                            editor: 'Form',
                            props: {
                                header: 'Misc',
                                formClassName: (0, _classnames2.default)('aligned', { left: _lodash2.default.includes(classNames, 'left') }),
                                fields: {
                                    genre: { label: 'Genre', editor: 'Dropdown', props: {
                                            list: [{ value: 'drama', text: 'Drama' }, { value: 'horror', text: 'Horror' }, { value: 'scifi', text: 'Sci-Fi' }],
                                            defaultText: 'Please select a genre'
                                        } },
                                    languages: { label: 'Languages', editor: 'CheckboxGroup', props: {
                                            className: 'inline',
                                            list: [{ value: 'english', text: 'English' }, { value: 'japanese', text: 'Japanese' }, { value: 'german', text: 'German' }, { value: 'xyz', text: 'XYZ' }],
                                            disabled: ['xyz']
                                        } },
                                    notes: { label: 'Notes', editor: 'MultiInput', props: { base: 'Input', inline: false } }
                                }
                            }
                        },
                        scores: {
                            label: '',
                            editor: 'Form',
                            props: {
                                header: 'Reviews',
                                formClassName: (0, _classnames2.default)('aligned', { left: _lodash2.default.includes(classNames, 'left') }),
                                fields: {
                                    imdb: { label: 'IMDB', editor: 'Input', props: function props(data) {
                                            // disable IMDB score when production year is in the future
                                            if (data.year >= 2017) {
                                                return { disabled: true };
                                            } else {
                                                return { type: 'number', validate: { min: 0 } };
                                            }
                                        } },
                                    rottenTomatoes: { label: 'Rotten Tomatoes', editor: 'Input', props: { type: 'number', validate: { min: 0 } } }
                                }
                            }
                        }
                    },
                    onComplete: this.handleSearch,
                    onChange: this.handleChange,
                    value: movie })
            );
        }
    }]);

    return _class10;
}(_react2.default.Component);

exports.default = function () {
    return _react2.default.createElement(
        'div',
        { id: 'example-form-advanced' },
        _lodash2.default.map(Examples, function (example, key) {
            return _react2.default.createElement((0, _exampleFactory2.default)(example, key), { key: key });
        })
    );
};

/***/ }),

/***/ "./src/form.js":
/*!*********************!*\
  !*** ./src/form.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _form = __webpack_require__(/*! core/components/form */ "../src/components/form.js");

var _form2 = _interopRequireDefault(_form);

var _components = __webpack_require__(/*! core/components */ "../src/components/index.js");

var _exampleFactory = __webpack_require__(/*! ./example-factory */ "./src/example-factory.js");

var _exampleFactory2 = _interopRequireDefault(_exampleFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Examples = {};

Examples.Checkbox = function (_React$Component) {
    _inherits(_class2, _React$Component);

    function _class2() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, _class2);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = { subscribe: false }, _this.handleChange = function (subscribe) {
            _this.setState({ subscribe: subscribe });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(_class2, [{
        key: 'render',
        value: function render() {
            var subscribe = this.state.subscribe;

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'div',
                    { className: 'c-flex aic' },
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'subscribe' },
                        'Would you like to subscribe to this newsletter?'
                    ),
                    _react2.default.createElement(_components.Checkbox, {
                        id: 'subscribe',
                        onChange: this.handleChange,
                        checked: subscribe })
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'c-flex aic' },
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'subscribe-disabled' },
                        'Always checked'
                    ),
                    _react2.default.createElement(_components.Checkbox, {
                        id: 'subscribe-disabled',
                        checked: true,
                        disabled: true })
                )
            );
        }
    }]);

    return _class2;
}(_react2.default.Component);

Examples.CheckboxGroup = function (_React$Component2) {
    _inherits(_class4, _React$Component2);

    function _class4() {
        var _ref2;

        var _temp2, _this2, _ret2;

        _classCallCheck(this, _class4);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = _possibleConstructorReturn(this, (_ref2 = _class4.__proto__ || Object.getPrototypeOf(_class4)).call.apply(_ref2, [this].concat(args))), _this2), _this2.state = {
            movies: [1],
            eventInfo: null,
            settings: {
                enableAll: false,
                classNames: []
            }
        }, _this2.handleChange = function (movies, eventInfo) {
            _this2.setState({ movies: movies, eventInfo: eventInfo });
        }, _this2.renderDemoSettings = function () {
            var settings = _this2.state.settings;

            return _react2.default.createElement(_form2.default, {
                className: 'demo-settings',
                formClassName: 'inline',
                fields: {
                    enableAll: {
                        label: 'Show All',
                        editor: 'Checkbox'
                    },
                    classNames: {
                        label: 'Apply classNames',
                        editor: 'CheckboxGroup',
                        props: {
                            list: _lodash2.default.map(['inline'], function (cn) {
                                return { value: cn, text: cn };
                            })
                        }
                    }
                },
                value: settings,
                onChange: function onChange(newSettings) {
                    _this2.setState({ settings: newSettings });
                } });
        }, _temp2), _possibleConstructorReturn(_this2, _ret2);
    }

    _createClass(_class4, [{
        key: 'render',
        value: function render() {
            var _state = this.state,
                movies = _state.movies,
                _state$settings = _state.settings,
                enableAll = _state$settings.enableAll,
                classNames = _state$settings.classNames;


            return _react2.default.createElement(
                'div',
                null,
                this.renderDemoSettings(),
                _react2.default.createElement(
                    'div',
                    { className: 'c-form-item' },
                    _react2.default.createElement(
                        'label',
                        null,
                        'Select movies'
                    ),
                    _react2.default.createElement(_components.CheckboxGroup, {
                        list: [{ value: 1, text: '1 - Finding Dory (selected by default, cannot deselect)' }, { value: 2, text: '2 - Wizard of Oz' }, { value: 3, text: '3 - Citizen Kane', className: 'ck' }, { value: 4, text: '4 - Poppy Shakespear (cannot select)' }],
                        className: (0, _classnames2.default)(classNames),
                        toggleAll: enableAll,
                        toggleAllText: 'Select/Unselect all',
                        onChange: this.handleChange,
                        value: movies,
                        disabled: [1, 4] })
                )
            );
        }
    }]);

    return _class4;
}(_react2.default.Component);

Examples.RadioGroup = function (_React$Component3) {
    _inherits(_class6, _React$Component3);

    function _class6() {
        var _ref3;

        var _temp3, _this3, _ret3;

        _classCallCheck(this, _class6);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _ret3 = (_temp3 = (_this3 = _possibleConstructorReturn(this, (_ref3 = _class6.__proto__ || Object.getPrototypeOf(_class6)).call.apply(_ref3, [this].concat(args))), _this3), _this3.state = {
            movie: 'oz',
            eventInfo: null,
            settings: {
                classNames: []
            }
        }, _this3.handleChange = function (movie, eventInfo) {
            _this3.setState({ movie: movie, eventInfo: eventInfo });
        }, _this3.handleDemoSettingChange = function (settings) {
            _this3.setState({ settings: settings });
        }, _this3.renderDemoSettings = function () {
            var settings = _this3.state.settings;

            return _react2.default.createElement(_form2.default, {
                className: 'demo-settings',
                formClassName: 'inline',
                fields: {
                    classNames: {
                        label: 'Apply classNames',
                        editor: 'CheckboxGroup',
                        props: {
                            list: _lodash2.default.map(['inline'], function (cn) {
                                return { value: cn, text: cn };
                            })
                        }
                    }
                },
                value: settings,
                onChange: _this3.handleDemoSettingChange });
        }, _temp3), _possibleConstructorReturn(_this3, _ret3);
    }

    _createClass(_class6, [{
        key: 'render',
        value: function render() {
            var _state2 = this.state,
                movie = _state2.movie,
                classNames = _state2.settings.classNames;

            return _react2.default.createElement(
                'div',
                null,
                this.renderDemoSettings(),
                _react2.default.createElement(
                    'div',
                    { className: 'c-form-item' },
                    _react2.default.createElement(
                        'label',
                        null,
                        'Select a movie'
                    ),
                    _react2.default.createElement(_components.RadioGroup, {
                        id: 'movie',
                        className: (0, _classnames2.default)(classNames),
                        list: [{ value: 'dory', text: 'dory - Finding Dory' }, { value: 'oz', text: 'oz - Wizard of Oz' }, { value: 'kane', text: 'kane - Citizen Kane', children: _react2.default.createElement('input', { defaultValue: 'abc', type: 'text' }) }],
                        onChange: this.handleChange,
                        value: movie })
                )
            );
        }
    }]);

    return _class6;
}(_react2.default.Component);

Examples.ButtonGroup = function (_React$Component4) {
    _inherits(_class8, _React$Component4);

    function _class8() {
        var _ref4;

        var _temp4, _this4, _ret4;

        _classCallCheck(this, _class8);

        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        return _ret4 = (_temp4 = (_this4 = _possibleConstructorReturn(this, (_ref4 = _class8.__proto__ || Object.getPrototypeOf(_class8)).call.apply(_ref4, [this].concat(args))), _this4), _this4.state = {
            type: 'movie',
            types: ['tv']
        }, _this4.handleChange = function (name, val) {
            _this4.setState(_defineProperty({}, name, val));
        }, _temp4), _possibleConstructorReturn(_this4, _ret4);
    }

    _createClass(_class8, [{
        key: 'render',
        value: function render() {
            var _state3 = this.state,
                type = _state3.type,
                types = _state3.types;

            return _react2.default.createElement(
                'div',
                { className: 'c-form' },
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        null,
                        'Select a type'
                    ),
                    _react2.default.createElement(_components.ButtonGroup, {
                        id: 'type',
                        list: [{ value: 'movie', text: 'Movie' }, { value: 'tv', text: 'TV' }, { value: 'actors', text: 'Actors' }],
                        onChange: this.handleChange.bind(this, 'type'),
                        value: type })
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        null,
                        'Select multiple types (movie disabled)'
                    ),
                    _react2.default.createElement(_components.ButtonGroup, {
                        id: 'types',
                        list: [{ value: 'movie', text: 'Movie' }, { value: 'tv', text: 'TV' }, { value: 'actors', text: 'Actors' }],
                        multi: true,
                        disabled: ['movie'],
                        onChange: this.handleChange.bind(this, 'types'),
                        value: types })
                )
            );
        }
    }]);

    return _class8;
}(_react2.default.Component);

Examples.Dropdown = function (_React$Component5) {
    _inherits(_class10, _React$Component5);

    function _class10() {
        var _ref5;

        var _temp5, _this5, _ret5;

        _classCallCheck(this, _class10);

        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
        }

        return _ret5 = (_temp5 = (_this5 = _possibleConstructorReturn(this, (_ref5 = _class10.__proto__ || Object.getPrototypeOf(_class10)).call.apply(_ref5, [this].concat(args))), _this5), _this5.state = {
            movie: '',
            director: ''
        }, _this5.handleChange = function (field, value) {
            _this5.setState(_defineProperty({}, field, value));
        }, _temp5), _possibleConstructorReturn(_this5, _ret5);
    }

    _createClass(_class10, [{
        key: 'render',
        value: function render() {
            var _state4 = this.state,
                movie = _state4.movie,
                director = _state4.director;

            return _react2.default.createElement(
                'div',
                { className: 'c-form', id: 'dropdown' },
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'movie' },
                        'Select movie (optional)'
                    ),
                    _react2.default.createElement(_components.Dropdown, {
                        id: 'movie',
                        list: [{ a: 'fd', b: 'Finding Dory' }, { a: 'woo', b: 'Wizard of Oz' }, { a: 'ck', b: 'Citizen Kane' }],
                        listTransform: { value: 'a', text: 'b' },
                        onChange: this.handleChange.bind(this, 'movie'),
                        defaultValue: 'fd',
                        value: movie })
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'director' },
                        'Select director (mandatory)'
                    ),
                    _react2.default.createElement(_components.Dropdown, {
                        id: 'director',
                        list: [{ value: 'a', text: 'Steven Spielberg' }, { value: 'b', text: 'Spike' }, { value: 'c', text: 'Lynch' }, { value: 'd', text: 'Bergman' }],
                        size: 3,
                        required: true,
                        onChange: this.handleChange.bind(this, 'director'),
                        defaultText: 'Please select a director',
                        value: director })
                )
            );
        }
    }]);

    return _class10;
}(_react2.default.Component);

Examples.Input = function (_React$Component6) {
    _inherits(_class12, _React$Component6);

    function _class12() {
        var _ref6;

        var _temp6, _this6, _ret6;

        _classCallCheck(this, _class12);

        for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
        }

        return _ret6 = (_temp6 = (_this6 = _possibleConstructorReturn(this, (_ref6 = _class12.__proto__ || Object.getPrototypeOf(_class12)).call.apply(_ref6, [this].concat(args))), _this6), _this6.state = {
            name: '',
            age: '',
            email: '',
            interest: '',
            job: ''
        }, _this6.handleChange = function (field, value) {
            _this6.setState(_defineProperty({}, field, value));
        }, _temp6), _possibleConstructorReturn(_this6, _ret6);
    }

    _createClass(_class12, [{
        key: 'render',
        value: function render() {
            var _state5 = this.state,
                name = _state5.name,
                age = _state5.age,
                email = _state5.email,
                interest = _state5.interest,
                job = _state5.job;

            return _react2.default.createElement(
                'div',
                { className: 'c-form inline' },
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'name' },
                        'Name'
                    ),
                    _react2.default.createElement(_components.Input, {
                        id: 'name',
                        onChange: this.handleChange.bind(this, 'name'),
                        value: name,
                        required: true,
                        placeholder: 'Your name' })
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'age' },
                        'Age'
                    ),
                    _react2.default.createElement(_components.Input, {
                        id: 'age',
                        type: 'number',
                        validate: {
                            max: 100,
                            t: function t(code, _ref7) {
                                var value = _ref7.value;
                                return 'Age ' + value + ' is invalid';
                            }
                        },
                        className: 'my-age',
                        onChange: this.handleChange.bind(this, 'age'),
                        value: age,
                        placeholder: 'Your age' })
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'email' },
                        'Email'
                    ),
                    _react2.default.createElement(_components.Input, {
                        id: 'email',
                        validate: {
                            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            patternReadable: 'xxx@xxx.xxx',
                            t: function t(code, _ref8) {
                                var value = _ref8.value,
                                    pattern = _ref8.pattern;

                                if (code === 'missing') {
                                    return 'You didn\'t enter an email address';
                                } else {
                                    // assume pattern issue
                                    return value + ' You didn\'t provide a valid email, the correct format should be ' + pattern;
                                }
                            }
                        },
                        onChange: this.handleChange.bind(this, 'email'),
                        value: email })
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'interest' },
                        'Interest'
                    ),
                    _react2.default.createElement(_components.Input, {
                        id: 'interest',
                        onChange: this.handleChange.bind(this, 'interest'),
                        value: interest,
                        required: false,
                        placeholder: 'Your Interest' })
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'job' },
                        'Job'
                    ),
                    _react2.default.createElement(_components.Input, {
                        id: 'job',
                        onChange: this.handleChange.bind(this, 'job'),
                        value: job,
                        required: true,
                        placeholder: 'Your Job' })
                )
            );
        }
    }]);

    return _class12;
}(_react2.default.Component);

Examples.Textarea = function (_React$Component7) {
    _inherits(_class14, _React$Component7);

    function _class14() {
        var _ref9;

        var _temp7, _this7, _ret7;

        _classCallCheck(this, _class14);

        for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
            args[_key7] = arguments[_key7];
        }

        return _ret7 = (_temp7 = (_this7 = _possibleConstructorReturn(this, (_ref9 = _class14.__proto__ || Object.getPrototypeOf(_class14)).call.apply(_ref9, [this].concat(args))), _this7), _this7.state = {
            feedback: ''
        }, _this7.handleChange = function (field, value) {
            _this7.setState(_defineProperty({}, field, value));
        }, _temp7), _possibleConstructorReturn(_this7, _ret7);
    }

    _createClass(_class14, [{
        key: 'render',
        value: function render() {
            var feedback = this.state.feedback;

            return _react2.default.createElement(
                'div',
                { className: 'c-form inline' },
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'feedback' },
                        'Feedback'
                    ),
                    _react2.default.createElement(_components.Textarea, {
                        id: 'feedback',
                        onChange: this.handleChange.bind(this, 'feedback'),
                        value: feedback })
                )
            );
        }
    }]);

    return _class14;
}(_react2.default.Component);

Examples.DateRange = function (_React$Component8) {
    _inherits(_class16, _React$Component8);

    function _class16() {
        var _ref10;

        var _temp8, _this8, _ret8;

        _classCallCheck(this, _class16);

        for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
            args[_key8] = arguments[_key8];
        }

        return _ret8 = (_temp8 = (_this8 = _possibleConstructorReturn(this, (_ref10 = _class16.__proto__ || Object.getPrototypeOf(_class16)).call.apply(_ref10, [this].concat(args))), _this8), _this8.state = {
            date: {
                from: '2012-04-26',
                to: '2012-10-26'
            },
            datetime: {
                from: '2012-10-26 12:00',
                to: '2012-10-26 17:00'
            }
        }, _this8.handleChange = function (field, value) {
            _this8.setState(_defineProperty({}, field, value));
        }, _temp8), _possibleConstructorReturn(_this8, _ret8);
    }

    _createClass(_class16, [{
        key: 'render',
        value: function render() {
            var _state6 = this.state,
                date = _state6.date,
                datetime = _state6.datetime;

            return _react2.default.createElement(
                'div',
                { className: 'c-form' },
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'date' },
                        'Select Date Range'
                    ),
                    _react2.default.createElement(_components.DateRange, {
                        id: 'date',
                        onChange: this.handleChange.bind(this, 'date'),
                        value: date,
                        t: function t(code, params) {
                            if (code === 'missing') {
                                return 'Please input date';
                            } else {
                                return 'Invalid date format. Should be ' + params.pattern;
                            }
                        } })
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'datetime' },
                        'Select Date Time Range'
                    ),
                    _react2.default.createElement(_components.DateRange, {
                        id: 'datetime',
                        onChange: this.handleChange.bind(this, 'datetime'),
                        enableTime: true,
                        value: datetime,
                        t: function t(code, params) {
                            if (code === 'missing') {
                                return 'Please input date';
                            } else {
                                return 'Invalid date format. Should be ' + params.pattern;
                            }
                        } })
                )
            );
        }
    }]);

    return _class16;
}(_react2.default.Component);

Examples.Datepicker = function (_React$Component9) {
    _inherits(_class18, _React$Component9);

    function _class18() {
        var _ref11;

        var _temp9, _this9, _ret9;

        _classCallCheck(this, _class18);

        for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
            args[_key9] = arguments[_key9];
        }

        return _ret9 = (_temp9 = (_this9 = _possibleConstructorReturn(this, (_ref11 = _class18.__proto__ || Object.getPrototypeOf(_class18)).call.apply(_ref11, [this].concat(args))), _this9), _this9.state = {
            date: '2017-03-20',
            datetime: '2017-03-20 16:01'
        }, _this9.handleChange = function (field, value) {
            _this9.setState(_defineProperty({}, field, value));
        }, _temp9), _possibleConstructorReturn(_this9, _ret9);
    }

    _createClass(_class18, [{
        key: 'render',
        value: function render() {
            var _state7 = this.state,
                date = _state7.date,
                datetime = _state7.datetime;

            return _react2.default.createElement(
                'div',
                { className: 'c-form' },
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'date' },
                        'Select Date'
                    ),
                    _react2.default.createElement(_components.DatePicker, {
                        id: 'date',
                        onChange: this.handleChange.bind(this, 'date'),
                        value: date,
                        locale: 'zh',
                        t: function t(code, params) {
                            if (code === 'missing') {
                                return 'Please input date';
                            } else {
                                return 'Invalid date format. Should be ' + params.pattern;
                            }
                        } })
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'datetime' },
                        'Select Date Time'
                    ),
                    _react2.default.createElement(_components.DatePicker, {
                        id: 'datetime',
                        onChange: this.handleChange.bind(this, 'datetime'),
                        enableTime: true,
                        value: datetime,
                        t: function t(code, params) {
                            if (code === 'missing') {
                                return 'Please input date';
                            } else {
                                return 'Invalid date format. Should be ' + params.pattern;
                            }
                        } })
                )
            );
        }
    }]);

    return _class18;
}(_react2.default.Component);

Examples.RangeCalendar = function (_React$Component10) {
    _inherits(_class20, _React$Component10);

    function _class20() {
        var _ref12;

        var _temp10, _this10, _ret10;

        _classCallCheck(this, _class20);

        for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
            args[_key10] = arguments[_key10];
        }

        return _ret10 = (_temp10 = (_this10 = _possibleConstructorReturn(this, (_ref12 = _class20.__proto__ || Object.getPrototypeOf(_class20)).call.apply(_ref12, [this].concat(args))), _this10), _this10.state = {
            date: {
                from: '2012-04-26',
                to: '2012-10-26'
            },
            datetime: {
                from: '2012-10-26 12:00',
                to: '2012-10-26 17:00'
            }
        }, _this10.handleChange = function (field, value) {
            _this10.setState(_defineProperty({}, field, value));
        }, _temp10), _possibleConstructorReturn(_this10, _ret10);
    }

    _createClass(_class20, [{
        key: 'render',
        value: function render() {
            var _state8 = this.state,
                date = _state8.date,
                datetime = _state8.datetime;

            return _react2.default.createElement(
                'div',
                { className: 'c-form' },
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'date' },
                        'Select Date Range'
                    ),
                    _react2.default.createElement(_components.RangeCalendar, {
                        id: 'date',
                        onChange: this.handleChange.bind(this, 'date'),
                        value: date,
                        shortcut: true,
                        t: function t(code, params) {
                            if (code === 'missing') {
                                return 'Please input date';
                            } else {
                                return 'Invalid date format. Should be ' + params.pattern;
                            }
                        } })
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'datetime' },
                        'Select Date Time Range'
                    ),
                    _react2.default.createElement(_components.RangeCalendar, {
                        id: 'datetime',
                        onChange: this.handleChange.bind(this, 'datetime'),
                        enableTime: true,
                        value: datetime,
                        shortcut: [{ value: 1, text: 'Hour', unit: 'hours' }, { value: 1, text: 'Day', unit: 'days' }, { value: 1, text: 'Month', unit: 'months' }, { value: 1, text: 'Quarter', unit: 'quarters' }, { value: 1, text: 'Year', unit: 'years' }],
                        t: function t(code, params) {
                            if (code === 'missing') {
                                return 'Please input date';
                            } else {
                                return 'Invalid date format. Should be ' + params.pattern;
                            }
                        } })
                )
            );
        }
    }]);

    return _class20;
}(_react2.default.Component);

Examples.FileInput = function (_React$Component11) {
    _inherits(_class22, _React$Component11);

    function _class22() {
        var _ref13;

        var _temp11, _this11, _ret11;

        _classCallCheck(this, _class22);

        for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
            args[_key11] = arguments[_key11];
        }

        return _ret11 = (_temp11 = (_this11 = _possibleConstructorReturn(this, (_ref13 = _class22.__proto__ || Object.getPrototypeOf(_class22)).call.apply(_ref13, [this].concat(args))), _this11), _this11.state = {
            name: '',
            type: '',
            size: 0
        }, _this11.handleChange = function (file) {
            _this11.setState({
                name: file ? file.name : '',
                type: file ? file.type : '',
                size: file ? file.size : 0
            });
        }, _temp11), _possibleConstructorReturn(_this11, _ret11);
    }

    _createClass(_class22, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: 'c-flex aic' },
                _react2.default.createElement(_components.FileInput, {
                    onChange: this.handleChange, required: true, name: 'fileDemo',
                    validate: {
                        max: 10,
                        extension: ['.mp3', '.wma', '.pdf'],
                        t: function t(code, params) {
                            if (code === 'file-too-large') {
                                return 'File size should be lower than ' + params.max + ' MB';
                            } else {
                                return 'File format should be ' + params.extension;
                            }
                        }
                    } })
            );
        }
    }]);

    return _class22;
}(_react2.default.Component);

Examples.Slider = function (_React$Component12) {
    _inherits(_class24, _React$Component12);

    function _class24() {
        var _ref14;

        var _temp12, _this12, _ret12;

        _classCallCheck(this, _class24);

        for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
            args[_key12] = arguments[_key12];
        }

        return _ret12 = (_temp12 = (_this12 = _possibleConstructorReturn(this, (_ref14 = _class24.__proto__ || Object.getPrototypeOf(_class24)).call.apply(_ref14, [this].concat(args))), _this12), _this12.state = { value: 40, value1: 20 }, _this12.handleChange = function (e) {
            var value = e;
            _this12.setState({ value: value });
        }, _temp12), _possibleConstructorReturn(_this12, _ret12);
    }

    _createClass(_class24, [{
        key: 'render',
        value: function render() {
            var _state9 = this.state,
                value = _state9.value,
                value1 = _state9.value1;

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(_components.Slider, { value: value, onChange: this.handleChange, showProgress: true, min: 0, max: 100, step: 5 }),
                _react2.default.createElement(_components.Slider, { value: value1, showProgress: true, min: 0, max: 100, step: 5, disabled: true })
            );
        }
    }]);

    return _class24;
}(_react2.default.Component);

Examples.ToggleButton = function (_React$Component13) {
    _inherits(_class26, _React$Component13);

    function _class26() {
        var _ref15;

        var _temp13, _this13, _ret13;

        _classCallCheck(this, _class26);

        for (var _len13 = arguments.length, args = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
            args[_key13] = arguments[_key13];
        }

        return _ret13 = (_temp13 = (_this13 = _possibleConstructorReturn(this, (_ref15 = _class26.__proto__ || Object.getPrototypeOf(_class26)).call.apply(_ref15, [this].concat(args))), _this13), _this13.state = { subscribe: false, subscribe1: false, subscribe2: true, subscribe3: false }, _this13.handleChange = function (subscribe) {
            _this13.setState({ subscribe: subscribe });
        }, _this13.handleChangeName = function (subscribe1) {
            // let result = {};
            // result[`${name}`]=obj;
            _this13.setState({ subscribe1: subscribe1 });
        }, _temp13), _possibleConstructorReturn(_this13, _ret13);
    }

    _createClass(_class26, [{
        key: 'render',
        value: function render() {
            var _state10 = this.state,
                subscribe = _state10.subscribe,
                subscribe1 = _state10.subscribe1,
                subscribe2 = _state10.subscribe2,
                subscribe3 = _state10.subscribe3;

            return _react2.default.createElement(
                'div',
                { className: 'c-form' },
                _react2.default.createElement(
                    'div',
                    { className: 'inline' },
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'subscribe' },
                        'Would you like to subscribe to this newsletter?'
                    ),
                    _react2.default.createElement(_components.ToggleButton, {
                        id: 'subscribe',
                        onChange: this.handleChange,
                        onText: 'On',
                        offText: 'Off',
                        on: subscribe })
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'inline' },
                    _react2.default.createElement(_components.ToggleButton, {
                        id: 'subscribe1',
                        onChange: this.handleChangeName,
                        onText: 'On',
                        offText: 'Off',
                        on: subscribe1 }),
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'subscribe1' },
                        'Primary toggle button'
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'inline' },
                    _react2.default.createElement(_components.ToggleButton, {
                        id: 'subscribe2',
                        onText: 'On',
                        offText: 'Off',
                        on: subscribe2,
                        disabled: true }),
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'subscribe2' },
                        'Primary toggle button disabled'
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'inline' },
                    _react2.default.createElement(_components.ToggleButton, {
                        id: 'subscribe3',
                        onText: 'On',
                        offText: 'Off',
                        on: subscribe3,
                        disabled: true }),
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'subscribe3' },
                        'Primary toggle button disabled'
                    )
                )
            );
        }
    }]);

    return _class26;
}(_react2.default.Component);

var _class27 = function (_React$Component14) {
    _inherits(_class27, _React$Component14);

    function _class27() {
        _classCallCheck(this, _class27);

        return _possibleConstructorReturn(this, (_class27.__proto__ || Object.getPrototypeOf(_class27)).apply(this, arguments));
    }

    _createClass(_class27, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'example-form' },
                _lodash2.default.map(Examples, function (example, key) {
                    return _react2.default.createElement((0, _exampleFactory2.default)(example, key), { key: key });
                })
            );
        }
    }]);

    return _class27;
}(_react2.default.Component);

exports.default = _class27;

/***/ }),

/***/ "./src/hierarchy.js":
/*!**************************!*\
  !*** ./src/hierarchy.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _objectPathImmutable = __webpack_require__(/*! object-path-immutable */ "./node_modules/object-path-immutable/index.js");

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _components = __webpack_require__(/*! core/components */ "../src/components/index.js");

var _form = __webpack_require__(/*! core/components/form */ "../src/components/form.js");

var _form2 = _interopRequireDefault(_form);

var _exampleFactory = __webpack_require__(/*! ./example-factory */ "./src/example-factory.js");

var _exampleFactory2 = _interopRequireDefault(_exampleFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "./node_modules/loglevel/lib/loglevel.js").getLogger('examples/tree');

var Examples = {};

var INITIAL_DATA = {
    id: 'home',
    label: 'Home',
    children: [{
        id: 'C', label: 'C - click to load children dynamically',
        children: []
    }, {
        id: 'A',
        children: [{
            id: 'A.a',
            children: [{ id: 'A.a.1' }, {
                id: 'A.a.2',
                children: [{ id: 'A.a.2.x' }, { id: 'A.a.2.y' }]
            }]
        }, {
            id: 'A.b',
            children: [{ id: 'A.b.1', disabled: true }, { id: 'A.b.2' }, { id: 'A.b.3' }]
        }]
    }, {
        id: 'B', label: 'B',
        children: [{ id: 'B.a', label: 'B.a custom label' }, { id: 'B.b', label: 'B.b custom label' }]
    }]
};

Examples.Hierarchy = function (_React$Component) {
    _inherits(_class2, _React$Component);

    function _class2() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, _class2);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            current: 'A.a',
            selected: [],
            data: INITIAL_DATA,
            settings: {
                showRoot: false,
                foldable: true,
                selectable: true,
                layout: 'accordion'
            }
        }, _this.handleLabelClick = function (current) {
            _this.setState({ current: current });
        }, _this.handleSelectChange = function (selected) {
            _this.setState({ selected: selected });
        }, _this.renderDemoSettings = function () {
            var settings = _this.state.settings;

            return _react2.default.createElement(_form2.default, {
                className: 'demo-settings',
                formClassName: 'inline',
                fields: {
                    showRoot: {
                        label: 'Show Root?',
                        editor: 'Checkbox'
                    },
                    foldable: {
                        label: 'Allow Expand/Collapse?',
                        editor: 'Checkbox'
                    },
                    selectable: {
                        label: 'Selectable?',
                        editor: 'Checkbox'
                    },
                    layout: {
                        label: 'Layout',
                        editor: 'RadioGroup',
                        props: {
                            className: 'inline',
                            list: _lodash2.default.map(['tree', 'accordion'], function (l) {
                                return { value: l, text: l };
                            })
                        }
                    }
                },
                value: settings,
                onChange: function onChange(newSettings) {
                    _this.setState({ settings: newSettings });
                } });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(_class2, [{
        key: 'render',
        value: function render() {
            var _state = this.state,
                data = _state.data,
                current = _state.current,
                selected = _state.selected,
                _state$settings = _state.settings,
                showRoot = _state$settings.showRoot,
                foldable = _state$settings.foldable,
                selectable = _state$settings.selectable,
                layout = _state$settings.layout;


            return _react2.default.createElement(
                'div',
                null,
                this.renderDemoSettings(),
                _react2.default.createElement(_components.Hierarchy, {
                    layout: layout,
                    foldable: foldable,
                    data: showRoot ? data : { children: data.children },
                    selection: {
                        enabled: selectable
                    },
                    selected: selected,
                    onSelectionChange: this.handleSelectChange,
                    current: current,
                    onLabelClick: this.handleLabelClick,
                    onLabelMouseOver: function onLabelMouseOver() {
                        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                            args[_key2] = arguments[_key2];
                        }

                        console.log('label mouseover', args);
                    },
                    defaultOpened: ['home', 'A'] })
            );
        }
    }]);

    return _class2;
}(_react2.default.Component);

Examples.Panels = function (_React$Component2) {
    _inherits(_class4, _React$Component2);

    function _class4() {
        var _ref2;

        var _temp2, _this2, _ret2;

        _classCallCheck(this, _class4);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _ret2 = (_temp2 = (_this2 = _possibleConstructorReturn(this, (_ref2 = _class4.__proto__ || Object.getPrototypeOf(_class4)).call.apply(_ref2, [this].concat(args))), _this2), _this2.state = {}, _temp2), _possibleConstructorReturn(_this2, _ret2);
    }

    _createClass(_class4, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(_components.Hierarchy, {
                    className: 'c-border',
                    layout: 'accordion',
                    foldable: true,
                    indent: [4, 0],
                    data: {
                        id: 'all',
                        foldable: false,
                        children: [{
                            id: 'A',
                            children: [{
                                id: 'A.a',
                                label: _react2.default.createElement(
                                    'div',
                                    { className: 'c-result nopad' },
                                    _react2.default.createElement(
                                        'div',
                                        null,
                                        _react2.default.createElement(
                                            'label',
                                            null,
                                            'key 1'
                                        ),
                                        _react2.default.createElement(
                                            'div',
                                            null,
                                            'value 1'
                                        )
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        null,
                                        _react2.default.createElement(
                                            'label',
                                            null,
                                            'key 2'
                                        ),
                                        _react2.default.createElement(
                                            'div',
                                            null,
                                            'value 2'
                                        )
                                    )
                                )
                            }, {
                                id: 'A.b',
                                label: _react2.default.createElement(
                                    'div',
                                    { className: 'c-result nopad' },
                                    _react2.default.createElement(
                                        'div',
                                        null,
                                        _react2.default.createElement(
                                            'label',
                                            null,
                                            'key 1'
                                        ),
                                        _react2.default.createElement(
                                            'div',
                                            null,
                                            'value 1'
                                        )
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        null,
                                        _react2.default.createElement(
                                            'label',
                                            null,
                                            'key 2'
                                        ),
                                        _react2.default.createElement(
                                            'div',
                                            null,
                                            'value 2'
                                        )
                                    )
                                )
                            }]
                        }, {
                            id: 'B',
                            children: [{
                                id: 'B.a',
                                label: _react2.default.createElement(
                                    'div',
                                    { className: 'c-result nopad' },
                                    _react2.default.createElement(
                                        'div',
                                        null,
                                        _react2.default.createElement(
                                            'label',
                                            null,
                                            'key 1'
                                        ),
                                        _react2.default.createElement(
                                            'div',
                                            null,
                                            'value 1'
                                        )
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        null,
                                        _react2.default.createElement(
                                            'label',
                                            null,
                                            'key 2'
                                        ),
                                        _react2.default.createElement(
                                            'div',
                                            null,
                                            'value 2'
                                        )
                                    )
                                )
                            }, {
                                id: 'B.b',
                                label: _react2.default.createElement(
                                    'div',
                                    { className: 'c-result nopad' },
                                    _react2.default.createElement(
                                        'div',
                                        null,
                                        _react2.default.createElement(
                                            'label',
                                            null,
                                            'key 1'
                                        ),
                                        _react2.default.createElement(
                                            'div',
                                            null,
                                            'value 1'
                                        )
                                    ),
                                    _react2.default.createElement(
                                        'div',
                                        null,
                                        _react2.default.createElement(
                                            'label',
                                            null,
                                            'key 2'
                                        ),
                                        _react2.default.createElement(
                                            'div',
                                            null,
                                            'value 2'
                                        )
                                    )
                                )
                            }]
                        }]
                    },
                    defaultOpened: ['all'] })
            );
        }
    }]);

    return _class4;
}(_react2.default.Component);

Examples.Tree = function (_React$Component3) {
    _inherits(_class6, _React$Component3);

    function _class6() {
        var _ref3;

        var _temp3, _this3, _ret3;

        _classCallCheck(this, _class6);

        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        return _ret3 = (_temp3 = (_this3 = _possibleConstructorReturn(this, (_ref3 = _class6.__proto__ || Object.getPrototypeOf(_class6)).call.apply(_ref3, [this].concat(args))), _this3), _this3.state = {
            selected: 'A.a',
            data: INITIAL_DATA,
            settings: {
                allowToggle: true
            }
        }, _this3.selectEntry = function (selected) {
            _this3.setState({ selected: selected });
        }, _this3.toggleOpen = function (opened, eventData) {
            var id = eventData.id,
                open = eventData.open,
                path = eventData.path;


            if (id === 'C' && open) {
                var setPath = (0, _lodash2.default)(path).map(function (p) {
                    return p.index;
                }).tail().map(function (p) {
                    return 'children.' + p;
                }).value().join('.') + '.children';

                log.info('loading more data for ' + id + ': ' + setPath);

                var newData = _objectPathImmutable2.default.set(_this3.state.data, setPath, [{ id: 'C.a' }, { id: 'C.b' }]);
                _this3.setState({ data: newData });
            }
        }, _this3.renderDemoSettings = function () {
            var settings = _this3.state.settings;

            return _react2.default.createElement(_form2.default, {
                className: 'demo-settings',
                formClassName: 'inline',
                fields: {
                    allowToggle: {
                        label: 'Allow Toggle?',
                        editor: 'Checkbox',
                        className: 'inline aic'
                    }
                },
                value: settings,
                onChange: function onChange(newSettings) {
                    _this3.setState({ settings: newSettings });
                } });
        }, _temp3), _possibleConstructorReturn(_this3, _ret3);
    }

    _createClass(_class6, [{
        key: 'render',
        value: function render() {
            var _state2 = this.state,
                data = _state2.data,
                selected = _state2.selected,
                allowToggle = _state2.settings.allowToggle;


            return _react2.default.createElement(
                'div',
                null,
                this.renderDemoSettings(),
                _react2.default.createElement(_components.Tree, {
                    data: data,
                    allowToggle: allowToggle,
                    selected: selected,
                    defaultOpened: ['home', 'A'],
                    onToggleOpen: this.toggleOpen,
                    onSelect: this.selectEntry })
            );
        }
    }]);

    return _class6;
}(_react2.default.Component);

var _class7 = function (_React$Component4) {
    _inherits(_class7, _React$Component4);

    function _class7() {
        _classCallCheck(this, _class7);

        return _possibleConstructorReturn(this, (_class7.__proto__ || Object.getPrototypeOf(_class7)).apply(this, arguments));
    }

    _createClass(_class7, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'example-tree' },
                _lodash2.default.map(Examples, function (example, key) {
                    return _react2.default.createElement((0, _exampleFactory2.default)(example, key), { key: key });
                })
            );
        }
    }]);

    return _class7;
}(_react2.default.Component);

exports.default = _class7;

/***/ }),

/***/ "./src/list.js":
/*!*********************!*\
  !*** ./src/list.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _components = __webpack_require__(/*! core/components */ "../src/components/index.js");

var _form = __webpack_require__(/*! core/components/form */ "../src/components/form.js");

var _form2 = _interopRequireDefault(_form);

var _paginator = __webpack_require__(/*! core/hoc/paginator */ "../src/hoc/paginator.js");

var _paginator2 = _interopRequireDefault(_paginator);

var _exampleFactory = __webpack_require__(/*! ./example-factory */ "./src/example-factory.js");

var _exampleFactory2 = _interopRequireDefault(_exampleFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Examples = {};
var ListWithPageNav = (0, _paginator2.default)(_components.List, { target: 'list' });

Examples.List = function (_React$Component) {
    _inherits(_class2, _React$Component);

    function _class2() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, _class2);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            movies: (0, _lodash2.default)(_lodash2.default.range(0, 200)).map(function (i) {
                return { id: '' + i, title: 'Movie ' + i };
            }).value(),
            selected: null,
            settings: {
                multicols: false,
                selectable: true,
                multiSelect: true
            }
        }, _this.handleSelectionChange = function (selected) {
            _this.setState({ selected: selected });
        }, _this.handleClick = function (id, movie) {
            console.log('movie clicked', { id: id, movie: movie });
        }, _this.renderDemoSettings = function () {
            var settings = _this.state.settings;

            return _react2.default.createElement(_form2.default, {
                className: 'demo-settings',
                formClassName: 'inline',
                fields: {
                    multicols: {
                        label: 'Multi-columns?',
                        editor: 'Checkbox'
                    },
                    selectable: {
                        label: 'Selectable?',
                        editor: 'Checkbox'
                    },
                    multiSelect: {
                        label: 'Multiple Selection?',
                        editor: 'Checkbox'
                    }
                },
                value: settings,
                onChange: function onChange(newSettings) {
                    _this.setState({ settings: newSettings });
                } });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(_class2, [{
        key: 'render',
        value: function render() {
            var _state = this.state,
                movies = _state.movies,
                _state$settings = _state.settings,
                multicols = _state$settings.multicols,
                selectable = _state$settings.selectable,
                multiSelect = _state$settings.multiSelect,
                selected = _state.selected;


            return _react2.default.createElement(
                'div',
                null,
                this.renderDemoSettings(),
                _react2.default.createElement(_components.List, {
                    id: 'movies',
                    className: (0, _classnames2.default)({ multicols: multicols }),
                    list: movies,
                    itemClassName: 'aic',
                    itemStyle: { padding: '5px' },
                    selection: { enabled: selectable, multiSelect: multiSelect },
                    selected: selected,
                    onSelectionChange: this.handleSelectionChange,
                    onClick: this.handleClick,
                    formatter: function formatter(movie) {
                        return movie.id + ' - ' + movie.title;
                    } })
            );
        }
    }]);

    return _class2;
}(_react2.default.Component);

Examples.ListWithPageNav = function (_React$Component2) {
    _inherits(_class4, _React$Component2);

    function _class4() {
        var _ref2;

        var _temp2, _this2, _ret2;

        _classCallCheck(this, _class4);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = _possibleConstructorReturn(this, (_ref2 = _class4.__proto__ || Object.getPrototypeOf(_class4)).call.apply(_ref2, [this].concat(args))), _this2), _this2.state = {
            movies: (0, _lodash2.default)(_lodash2.default.range(0, 200)).map(function (i) {
                return { id: '' + i, title: 'Movie ' + i };
            }).value(),
            selected: null
        }, _this2.handleSelectionChange = function (selected) {
            _this2.setState({ selected: selected });
        }, _temp2), _possibleConstructorReturn(_this2, _ret2);
    }

    _createClass(_class4, [{
        key: 'render',
        value: function render() {
            var _state2 = this.state,
                movies = _state2.movies,
                selected = _state2.selected;


            return _react2.default.createElement(ListWithPageNav, {
                id: 'movies',
                list: movies,
                itemClassName: 'aic',
                selection: { enabled: true, multiSelect: true },
                selected: selected,
                onSelectionChange: this.handleSelectionChange,
                formatter: function formatter(movie) {
                    return movie.id + ' - ' + movie.title;
                },
                paginate: {
                    pageSize: 20,
                    defaultCurrent: 2
                } });
        }
    }]);

    return _class4;
}(_react2.default.Component);

var _class5 = function (_React$Component3) {
    _inherits(_class5, _React$Component3);

    function _class5() {
        _classCallCheck(this, _class5);

        return _possibleConstructorReturn(this, (_class5.__proto__ || Object.getPrototypeOf(_class5)).apply(this, arguments));
    }

    _createClass(_class5, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'example-list' },
                _lodash2.default.map(Examples, function (example, key) {
                    return _react2.default.createElement((0, _exampleFactory2.default)(example, key), { key: key });
                })
            );
        }
    }]);

    return _class5;
}(_react2.default.Component);

exports.default = _class5;

/***/ }),

/***/ "./src/modal.js":
/*!**********************!*\
  !*** ./src/modal.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _createReactClass = __webpack_require__(/*! create-react-class */ "./node_modules/create-react-class/index.js");

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _bluebird = __webpack_require__(/*! bluebird */ "./node_modules/bluebird/js/browser/bluebird.js");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _components = __webpack_require__(/*! core/components */ "../src/components/index.js");

var _linkedStateMixins = __webpack_require__(/*! core/mixins/linked-state-mixins */ "../src/mixins/linked-state-mixins.js");

var _exampleFactory = __webpack_require__(/*! ./example-factory */ "./src/example-factory.js");

var _exampleFactory2 = _interopRequireDefault(_exampleFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Examples = {};

var INITIAL_STATE = {
    open: false,
    info: null,
    error: false,
    movieId: null
};
var RateMovieDialog = (0, _createReactClass2.default)({
    displayName: 'RateMovieDialog',

    propTypes: {
        onDone: _propTypes2.default.func
    },

    mixins: [_linkedStateMixins.LinkedStateMixin],

    getInitialState: function getInitialState() {
        return _lodash2.default.clone(INITIAL_STATE);
    },
    open: function open(movieId, _ref) {
        var rating = _ref.rating;

        // ajax get movie details by id
        this.setState({ movieId: movieId, rating: rating, open: true });
    },
    close: function close(changed, data) {
        var _this = this;

        this.setState(_lodash2.default.clone(INITIAL_STATE), function () {
            _this.props.onDone(changed, data);
        });
    },
    rateMovie: function rateMovie() {
        var rating = this.state.rating;
        // can be ajax to post rating

        if (rating) {
            this.close(true, { rating: rating });
        } else {
            this.setState({ info: 'Please select rating', error: true });
        }
    },
    render: function render() {
        var _state = this.state,
            movieId = _state.movieId,
            open = _state.open,
            info = _state.info,
            error = _state.error;

        if (!open) {
            return null;
        }

        var actions = {
            cancel: { text: 'Cancel', className: 'standard', handler: this.close.bind(this, false, null) },
            confirm: { text: 'OK!', handler: this.rateMovie }
        };
        return _react2.default.createElement(
            _components.ModalDialog,
            {
                id: 'rate-movie-dialog',
                title: 'Rate ' + movieId + '!',
                draggable: true,
                global: true,
                info: info,
                infoClassName: (0, _classnames2.default)({ 'c-error': error }),
                actions: actions },
            _react2.default.createElement(_components.Dropdown, {
                list: _lodash2.default.map(_lodash2.default.range(1, 11), function (i) {
                    return { value: i, text: i };
                }),
                valueLink: this.linkState('rating') })
        );
    }
});

Examples.ModalDialog = function (_React$Component) {
    _inherits(_class2, _React$Component);

    function _class2() {
        var _ref2;

        var _temp, _this2, _ret;

        _classCallCheck(this, _class2);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_ref2 = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref2, [this].concat(args))), _this2), _this2.state = {
            movieId: 1,
            data: {}
        }, _this2.showRating = function () {
            var _this2$state = _this2.state,
                movieId = _this2$state.movieId,
                data = _this2$state.data;

            _this2.dialog.open(movieId, data);
        }, _this2.handleDone = function (changed, data) {
            if (changed) {
                _this2.setState({ data: data });
            }
        }, _temp), _possibleConstructorReturn(_this2, _ret);
    }

    _createClass(_class2, [{
        key: 'render',
        value: function render() {
            var _this3 = this;

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'button',
                    { onClick: this.showRating },
                    'Rate Movie!'
                ),
                _react2.default.createElement(RateMovieDialog, { ref: function ref(_ref3) {
                        _this3.dialog = _ref3;
                    }, onDone: this.handleDone })
            );
        }
    }]);

    return _class2;
}(_react2.default.Component);

Examples.PopupDialog = function (_React$Component2) {
    _inherits(_class4, _React$Component2);

    function _class4() {
        var _ref4;

        var _temp2, _this4, _ret2;

        _classCallCheck(this, _class4);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this4 = _possibleConstructorReturn(this, (_ref4 = _class4.__proto__ || Object.getPrototypeOf(_class4)).call.apply(_ref4, [this].concat(args))), _this4), _this4.state = {
            prompt: null,
            confirm: null
        }, _this4.alert = function () {
            _components.PopupDialog.alert({
                title: 'ALERT',
                display: 'Error!'
            });
        }, _this4.prompt = function () {
            _components.PopupDialog.prompt({
                display: _react2.default.createElement(
                    'div',
                    { className: 'c-form' },
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'label',
                            { htmlFor: 'name' },
                            'Name'
                        ),
                        _react2.default.createElement('input', { type: 'text', id: 'name' })
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'label',
                            { htmlFor: 'phone' },
                            'Phone'
                        ),
                        _react2.default.createElement('input', { type: 'text', id: 'phone' })
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'label',
                            { htmlFor: 'address' },
                            'Address'
                        ),
                        _react2.default.createElement('input', { type: 'text', id: 'address' })
                    )
                ),
                act: function act(confirmed, data) {
                    if (confirmed) {
                        _this4.setState({ prompt: data });
                        // return Promise.resolve($.post('/api/save/user',data)) // post user information
                    }
                }
            });
        }, _this4.confirm = function () {
            _components.PopupDialog.confirm({
                title: 'DELETE?',
                display: 'Are you sure you want to delete?',
                cancelText: 'NOOO',
                confirmText: 'YESSS',
                act: function act(confirmed) {
                    if (confirmed) {
                        // do something, eg ajax to DELETE
                    }
                    _this4.setState({
                        confirm: confirmed
                    });
                }
            });
        }, _this4.openChild = function () {
            _components.PopupDialog.alertId('g-nested-popup-container', {
                title: 'Child Dialog',
                display: 'NESTED!!',
                confirmText: 'Close Child'
            });
        }, _this4.openParent = function () {
            _components.PopupDialog.alert({
                title: 'Nested Parent Dialog',
                display: _react2.default.createElement(
                    'button',
                    { onClick: _this4.openChild },
                    'Show child dialog'
                ),
                confirmText: 'Close Parent'
            });
        }, _temp2), _possibleConstructorReturn(_this4, _ret2);
    }

    _createClass(_class4, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'button',
                    { onClick: this.alert },
                    'Show me alert!'
                ),
                _react2.default.createElement(
                    'button',
                    { onClick: this.prompt },
                    'Ask me something!'
                ),
                _react2.default.createElement(
                    'button',
                    { onClick: this.confirm },
                    'Show confirmation!'
                ),
                _react2.default.createElement(
                    'button',
                    { onClick: this.openParent },
                    'Try nested dialog!'
                )
            );
        }
    }]);

    return _class4;
}(_react2.default.Component);

Examples.Popover = function (_React$Component3) {
    _inherits(_class6, _React$Component3);

    function _class6() {
        var _ref5;

        var _temp3, _this5, _ret3;

        _classCallCheck(this, _class6);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _ret3 = (_temp3 = (_this5 = _possibleConstructorReturn(this, (_ref5 = _class6.__proto__ || Object.getPrototypeOf(_class6)).call.apply(_ref5, [this].concat(args))), _this5), _this5.openPopover = function (evt) {
            _components.Popover.openId('my-popover-id', evt, _react2.default.createElement('img', { alt: 'popover', src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9ShYQxVabIxy5akkOaFXZiCOfP0WQvmDXaSAq52bjW4xqFy8q', style: { maxWidth: 100, maxHeight: 100 } }), { pointy: true });
        }, _this5.closePopover = function () {
            _components.Popover.closeId('my-popover-id');
        }, _temp3), _possibleConstructorReturn(_this5, _ret3);
    }

    _createClass(_class6, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'span',
                { onMouseOver: this.openPopover, onMouseOut: this.closePopover },
                'hover over me'
            );
        }
    }]);

    return _class6;
}(_react2.default.Component);

Examples.Contextmenu = function (_React$Component4) {
    _inherits(_class8, _React$Component4);

    function _class8() {
        var _ref6;

        var _temp4, _this6, _ret4;

        _classCallCheck(this, _class8);

        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        return _ret4 = (_temp4 = (_this6 = _possibleConstructorReturn(this, (_ref6 = _class8.__proto__ || Object.getPrototypeOf(_class8)).call.apply(_ref6, [this].concat(args))), _this6), _this6.state = {}, _this6.fetchMovieDetails = function (source) {
            // load data from source
            _this6.setState({ source: source });
        }, _this6.handleContextMenu = function (evt) {
            var menuItems = _lodash2.default.map(['imdb', 'rotten'], function (source) {
                return [{ text: source + ' header', isHeader: true }, { id: source, text: 'Fetch ' + source + ' Data', action: _this6.fetchMovieDetails.bind(_this6, source) }, { id: source + '-disabled', text: source + ' Disabled Item', disabled: true }];
            });
            _components.Contextmenu.open(evt, _lodash2.default.flatten(menuItems));
        }, _temp4), _possibleConstructorReturn(_this6, _ret4);
    }

    _createClass(_class8, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'span',
                { className: 'c-link', onContextMenu: this.handleContextMenu },
                'Right click on me'
            );
        }
    }]);

    return _class8;
}(_react2.default.Component);

Examples.Progress = function (_React$Component5) {
    _inherits(_class10, _React$Component5);

    function _class10() {
        var _ref7;

        var _temp5, _this7, _ret5;

        _classCallCheck(this, _class10);

        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
        }

        return _ret5 = (_temp5 = (_this7 = _possibleConstructorReturn(this, (_ref7 = _class10.__proto__ || Object.getPrototypeOf(_class10)).call.apply(_ref7, [this].concat(args))), _this7), _this7.startProgress = function () {
            _bluebird2.default.delay(100).then(function () {
                _components.Progress.startProgress('Uploading...');
            }).then(function () {
                return _bluebird2.default.delay(1000);
            }).then(function () {
                _components.Progress.setProgress(50, 100);
            }).then(function () {
                return _bluebird2.default.delay(2000);
            }).then(function () {
                _components.Progress.setProgress(100, 100);
            }).then(function () {
                return _bluebird2.default.delay(1000);
            }).then(function () {
                _components.Progress.set('Done!');
            }).then(function () {
                return _bluebird2.default.delay(1000);
            }).then(function () {
                _components.Progress.done();
            });
        }, _this7.startSpin = function () {
            _components.Progress.startSpin();
            _components.Progress.done(2000);
        }, _temp5), _possibleConstructorReturn(_this7, _ret5);
    }

    _createClass(_class10, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'button',
                    { onClick: this.startProgress },
                    'Simulate Upload Progress'
                ),
                _react2.default.createElement(
                    'button',
                    { onClick: this.startSpin },
                    'Simulate Spin'
                )
            );
        }
    }]);

    return _class10;
}(_react2.default.Component);

var _class11 = function (_React$Component6) {
    _inherits(_class11, _React$Component6);

    function _class11() {
        _classCallCheck(this, _class11);

        return _possibleConstructorReturn(this, (_class11.__proto__ || Object.getPrototypeOf(_class11)).apply(this, arguments));
    }

    _createClass(_class11, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'example-tabs' },
                _lodash2.default.map(Examples, function (example, key) {
                    return _react2.default.createElement((0, _exampleFactory2.default)(example, key), { key: key });
                })
            );
        }
    }]);

    return _class11;
}(_react2.default.Component);

exports.default = _class11;

/***/ }),

/***/ "./src/routes.js":
/*!***********************!*\
  !*** ./src/routes.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _reactRouter = __webpack_require__(/*! react-router */ "./node_modules/react-router/es/index.js");

var _propTypes = __webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _queryString = __webpack_require__(/*! query-string */ "./node_modules/query-string/index.js");

var _queryString2 = _interopRequireDefault(_queryString);

var _dropdown = __webpack_require__(/*! core/components/dropdown */ "../src/components/dropdown.js");

var _dropdown2 = _interopRequireDefault(_dropdown);

var _form = __webpack_require__(/*! ./form */ "./src/form.js");

var _form2 = _interopRequireDefault(_form);

var _formAdvanced = __webpack_require__(/*! ./form-advanced */ "./src/form-advanced.js");

var _formAdvanced2 = _interopRequireDefault(_formAdvanced);

var _table = __webpack_require__(/*! ./table */ "./src/table.js");

var _table2 = _interopRequireDefault(_table);

var _list = __webpack_require__(/*! ./list */ "./src/list.js");

var _list2 = _interopRequireDefault(_list);

var _tabs = __webpack_require__(/*! ./tabs */ "./src/tabs.js");

var _tabs2 = _interopRequireDefault(_tabs);

var _modal = __webpack_require__(/*! ./modal */ "./src/modal.js");

var _modal2 = _interopRequireDefault(_modal);

var _tiles = __webpack_require__(/*! ./tiles */ "./src/tiles.js");

var _tiles2 = _interopRequireDefault(_tiles);

var _hierarchy = __webpack_require__(/*! ./hierarchy */ "./src/hierarchy.js");

var _hierarchy2 = _interopRequireDefault(_hierarchy);

var _css = __webpack_require__(/*! ./css */ "./src/css.js");

var _css2 = _interopRequireDefault(_css);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MENU = {
    form: { component: _form2.default, title: 'Basic Form' },
    advancedForm: { component: _formAdvanced2.default, title: 'Advanced Form' },
    table: { component: _table2.default, title: 'Table & PageNav & Search' },
    list: { component: _list2.default, title: 'List & PageNav' },
    tabs: { component: _tabs2.default, title: 'Tabs' },
    hierarchy: { component: _hierarchy2.default, title: 'Hierarchy' },
    tiles: { component: _tiles2.default, title: 'Tiles' },
    modal: { component: _modal2.default, title: 'Modal & Friends' },
    cssDemo: { component: _css2.default, title: 'CSS' }
};

var NoMatch = function NoMatch() {
    return _react2.default.createElement(
        'div',
        null,
        'Page Not Found!'
    );
};

var Examples = function (_React$Component) {
    _inherits(Examples, _React$Component);

    function Examples() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Examples);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Examples.__proto__ || Object.getPrototypeOf(Examples)).call.apply(_ref, [this].concat(args))), _this), _this.handleThemeChange = function (theme) {
            window.location = window.location.pathname + '?theme=' + theme;
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Examples, [{
        key: 'render',
        value: function render() {
            var _qs$parse = _queryString2.default.parse(window.location.search),
                currentTheme = _qs$parse.theme;

            return _react2.default.createElement(
                'div',
                { id: 'g-app' },
                _react2.default.createElement(
                    'div',
                    { id: 'g-header' },
                    _react2.default.createElement(
                        'ul',
                        { id: 'g-menu', className: 'c-nav' },
                        _lodash2.default.map(MENU, function (_ref2, tag) {
                            var title = _ref2.title,
                                component = _ref2.component;
                            return _react2.default.createElement(
                                _reactRouter.Link,
                                { key: tag, activeClassName: 'current', to: { pathname: tag } },
                                title
                            );
                        }),
                        _react2.default.createElement(
                            'li',
                            null,
                            _react2.default.createElement(
                                'a',
                                { href: '/docs', target: '_blank' },
                                'API Documentation'
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'c-flex aic jcfe c-margin' },
                        _react2.default.createElement(
                            'label',
                            null,
                            'Select Theme '
                        ),
                        _react2.default.createElement(_dropdown2.default, {
                            onClick: this.handleThemeChange,
                            list: _lodash2.default.map(['dark', 'purple', 'green'], function (theme) {
                                return { value: theme, text: theme };
                            }),
                            required: true,
                            defaultValue: currentTheme || 'dark',
                            onChange: this.handleThemeChange })
                    )
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    this.props.children
                )
            );
        }
    }]);

    return Examples;
}(_react2.default.Component);

Examples.propTypes = {
    children: _propTypes2.default.node
};


var Routes = _react2.default.createElement(
    _reactRouter.Route,
    { path: '/', component: Examples },
    _lodash2.default.map(MENU, function (_ref3, tag) {
        var component = _ref3.component;
        return _react2.default.createElement(_reactRouter.Route, { key: tag, path: tag, component: component });
    }),
    _react2.default.createElement(_reactRouter.Route, { path: '*', component: NoMatch })
);

exports.default = Routes;

/***/ }),

/***/ "./src/table.js":
/*!**********************!*\
  !*** ./src/table.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _jquery = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");

var _jquery2 = _interopRequireDefault(_jquery);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _objectPathImmutable = __webpack_require__(/*! object-path-immutable */ "./node_modules/object-path-immutable/index.js");

var _objectPathImmutable2 = _interopRequireDefault(_objectPathImmutable);

var _form = __webpack_require__(/*! core/components/form */ "../src/components/form.js");

var _form2 = _interopRequireDefault(_form);

var _components = __webpack_require__(/*! core/components */ "../src/components/index.js");

var _gridEvent = __webpack_require__(/*! core/utils/grid-event */ "../src/utils/grid-event.js");

var _gridEvent2 = _interopRequireDefault(_gridEvent);

var _exampleFactory = __webpack_require__(/*! ./example-factory */ "./src/example-factory.js");

var _exampleFactory2 = _interopRequireDefault(_exampleFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FIELDS = {
    id: { label: 'ID', sortable: true },
    title: { label: 'Title', sortable: true },
    adult: {
        label: 'Adult',
        formatter: {
            type: 'mapping',
            list: { true: 'Yes', false: 'No' }
        },
        className: 'center'
    },
    original_language: {
        label: 'Language',
        formatter: {
            type: 'mapping',
            list: [{ lang: 'en', desc: 'English' }, { lang: 'de', desc: 'German' }],
            listTransform: {
                value: 'lang',
                text: 'desc'
            }
        }
    },
    popularity: { label: 'Popularity' },
    release_date: {
        label: 'Year',
        formatter: { type: 'date', format: 'YYYY-MM-DD' },
        sortable: true,
        style: {
            width: 100,
            minWidth: 100
        }
    }
};

var Examples = {};

Examples.PagedTable = function (_React$Component) {
    _inherits(_class2, _React$Component);

    function _class2() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, _class2);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            settings: {
                classNames: []
            },
            search: null,
            page: 1,
            pages: null,
            sort: {
                field: 'title',
                desc: false
            },
            info: null,
            error: false,
            data: []
        }, _this.handleSort = function (sort) {
            var search = _this.state.search;

            if (search) {
                _this.loadList({ sort: sort });
            } else {
                _this.setState({ sort: sort });
            }
        }, _this.handleSearch = function (search) {
            _this.loadList({ search: search, page: 1 });
        }, _this.gotoPage = function (page) {
            _this.loadList({ page: page });
        }, _this.handleInputChange = function (rid, field, value) {
            var data = _this.state.data;

            var index = _lodash2.default.findIndex(data, function (_ref2) {
                var id = _ref2.id;
                return id == rid;
            });
            _this.setState({ data: _objectPathImmutable2.default.set(data, [index, field], value) });
        }, _this.loadList = function (newState) {
            _this.setState(_extends({}, newState, { data: [], info: 'Loading...', error: false }), function () {
                var _this$state = _this.state,
                    page = _this$state.page,
                    _this$state$sort = _this$state.sort,
                    sortBy = _this$state$sort.field,
                    sortDesc = _this$state$sort.desc,
                    search = _this$state.search;


                _jquery2.default.get('https://api.themoviedb.org/3/' + (search ? 'search' : 'discover') + '/movie', {
                    api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                    query: search,
                    page: page,
                    sortBy: sortBy,
                    sortDesc: sortDesc
                }).done(function (_ref3) {
                    var _ref3$results = _ref3.results,
                        list = _ref3$results === undefined ? [] : _ref3$results,
                        _ref3$total_results = _ref3.total_results,
                        total = _ref3$total_results === undefined ? 0 : _ref3$total_results,
                        _ref3$total_pages = _ref3.total_pages,
                        pages = _ref3$total_pages === undefined ? null : _ref3$total_pages;

                    if (total === 0) {
                        _this.setState({ info: 'No movies found!', pages: null });
                        return;
                    }

                    _this.setState({ info: null, data: list, pages: pages });
                }).fail(function (xhr) {
                    _this.setState({ info: xhr.responseText, error: true });
                });
            });
        }, _this.renderDemoSettings = function () {
            var settings = _this.state.settings;

            return _react2.default.createElement(_form2.default, {
                className: 'demo-settings',
                fields: {
                    classNames: {
                        label: 'Apply classNames',
                        editor: 'CheckboxGroup',
                        props: {
                            className: 'inline',
                            list: _lodash2.default.map(['bland', 'nohover', 'fixed-header', 'column', 'border-inner-vertical', 'border-inner-horizontal', 'border-inner', 'border-outer', 'border-all'], function (cn) {
                                return { value: cn, text: cn };
                            })
                        }
                    }
                },
                value: settings,
                onChange: function onChange(newSettings) {
                    _this.setState({ settings: newSettings });
                } });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(_class2, [{
        key: 'render',
        value: function render() {
            var _state = this.state,
                classNames = _state.settings.classNames,
                data = _state.data,
                sort = _state.sort,
                pages = _state.pages,
                page = _state.page,
                info = _state.info,
                error = _state.error;


            return _react2.default.createElement(
                'div',
                { className: 'c-box noborder' },
                this.renderDemoSettings(),
                _react2.default.createElement(
                    'header',
                    { className: 'c-flex aic' },
                    _react2.default.createElement(_components.Search, { className: 'end', onSearch: this.handleSearch, enableClear: true })
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'content nopad' },
                    _react2.default.createElement(_components.Table, {
                        id: 'paged-table',
                        data: data,
                        fields: _extends({}, FIELDS, {
                            rate: {
                                label: 'Rating',
                                editor: _components.Dropdown,
                                props: {
                                    list: _lodash2.default.map(_lodash2.default.range(1, 11), function (i) {
                                        return { value: i, text: i };
                                    })
                                }
                            },
                            actions: { label: '', formatter: function formatter(val, _ref4) {
                                    var id = _ref4.id;

                                    return _react2.default.createElement(
                                        'span',
                                        null,
                                        _react2.default.createElement('i', { className: 'c-link fg fg-eye', onClick: function onClick() {
                                                window.alert('open ' + id + ' edit box!');
                                            } })
                                    );
                                } }
                        }),
                        rowIdField: 'id',
                        className: (0, _classnames2.default)(classNames),
                        info: info,
                        infoClassName: (0, _classnames2.default)({ 'c-error': error }),
                        onInputChange: this.handleInputChange,
                        sort: sort,
                        onSort: this.handleSort })
                ),
                _react2.default.createElement(
                    'footer',
                    { className: 'c-flex' },
                    _react2.default.createElement(_components.PageNav, { pages: pages, current: page, className: 'center', onChange: this.gotoPage })
                )
            );
        }
    }]);

    return _class2;
}(_react2.default.Component);

Examples.SelectableTable = function (_React$Component2) {
    _inherits(_class4, _React$Component2);

    function _class4() {
        var _ref5;

        var _temp2, _this2, _ret2;

        _classCallCheck(this, _class4);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = _possibleConstructorReturn(this, (_ref5 = _class4.__proto__ || Object.getPrototypeOf(_class4)).call.apply(_ref5, [this].concat(args))), _this2), _this2.state = {
            search: null,
            selected: { ids: [], eventInfo: null },
            clicked: { id: null, eventInfo: null },
            info: null,
            error: false,
            data: []
        }, _this2.handleSearch = function (search) {
            _this2.loadList({ search: search });
        }, _this2.handleSelect = function (ids, eventInfo) {
            _this2.setState({ selected: { ids: ids, eventInfo: eventInfo } });
        }, _this2.handleClick = function (id, data) {
            _this2.setState({ clicked: { id: id, data: data } });
        }, _this2.loadList = function (newState) {
            _this2.setState(_extends({}, newState, { data: [], info: 'Loading...', error: false }), function () {
                var search = _this2.state.search;


                _jquery2.default.get('https://api.themoviedb.org/3/' + (search ? 'search' : 'discover') + '/movie', {
                    api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                    query: search
                }).done(function (_ref6) {
                    var _ref6$results = _ref6.results,
                        list = _ref6$results === undefined ? [] : _ref6$results,
                        _ref6$total_results = _ref6.total_results,
                        total = _ref6$total_results === undefined ? 0 : _ref6$total_results;

                    if (total === 0) {
                        _this2.setState({ info: 'No movies found!', pages: null });
                        return;
                    }

                    _this2.setState({ info: null, data: list });
                }).fail(function (xhr) {
                    _this2.setState({ info: xhr.responseText, error: true });
                });
            });
        }, _temp2), _possibleConstructorReturn(_this2, _ret2);
    }

    _createClass(_class4, [{
        key: 'render',
        value: function render() {
            var _state2 = this.state,
                data = _state2.data,
                info = _state2.info,
                error = _state2.error;


            return _react2.default.createElement(
                'div',
                { className: 'c-box noborder' },
                _react2.default.createElement(
                    'header',
                    { className: 'c-flex' },
                    _react2.default.createElement(_components.Search, { className: 'end', onSearch: this.handleSearch })
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'content' },
                    _react2.default.createElement(_components.Table, {
                        id: 'selectable-table',
                        className: 'fixed-header',
                        data: data,
                        fields: FIELDS,
                        rowIdField: 'id',
                        info: info,
                        infoClassName: (0, _classnames2.default)({ 'c-error': error }),
                        defaultSort: {
                            field: 'title',
                            desc: false
                        },
                        onRowClick: this.handleClick,
                        selection: {
                            enabled: true,
                            toggleAll: true,
                            multiSelect: true
                        },
                        onSelectionChange: this.handleSelect })
                )
            );
        }
    }]);

    return _class4;
}(_react2.default.Component);

Examples.DataGrid = function (_React$Component3) {
    _inherits(_class6, _React$Component3);

    function _class6() {
        var _ref7;

        var _temp3, _this3, _ret3;

        _classCallCheck(this, _class6);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _ret3 = (_temp3 = (_this3 = _possibleConstructorReturn(this, (_ref7 = _class6.__proto__ || Object.getPrototypeOf(_class6)).call.apply(_ref7, [this].concat(args))), _this3), _this3.state = {
            info: null,
            error: false,
            data: []
        }, _this3.addGridEvent = function () {
            _this3.removeGridEvent();
            _this3.handle = (0, _gridEvent2.default)(_this3.node).on('row', function () {}).on('column', function () {});
        }, _this3.removeGridEvent = function () {
            _this3.handle && _this3.handle.unsubscribe();
        }, _this3.loadList = function () {
            _this3.setState({ data: [], info: 'Loading...', error: false }, function () {
                _jquery2.default.get('https://api.themoviedb.org/3/search/movie', {
                    api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                    query: 'blade'
                }).done(function (_ref8) {
                    var _ref8$results = _ref8.results,
                        list = _ref8$results === undefined ? [] : _ref8$results,
                        _ref8$total_results = _ref8.total_results,
                        total = _ref8$total_results === undefined ? 0 : _ref8$total_results;

                    if (total === 0) {
                        _this3.setState({ info: 'No movies found!', pages: null });
                        return;
                    }

                    _this3.setState({ info: null, data: list });
                }).fail(function (xhr) {
                    _this3.setState({ info: xhr.responseText, error: true });
                });
            });
        }, _this3.handleInputChange = function (rid, field, value) {
            var data = _this3.state.data;

            var index = _lodash2.default.findIndex(data, function (_ref9) {
                var id = _ref9.id;
                return id == rid;
            });
            _this3.setState({ data: _objectPathImmutable2.default.set(data, [index, field], value) });
        }, _temp3), _possibleConstructorReturn(_this3, _ret3);
    }

    _createClass(_class6, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.addGridEvent();
            this.loadList();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.removeGridEvent();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _state3 = this.state,
                data = _state3.data,
                info = _state3.info,
                error = _state3.error;


            return _react2.default.createElement(
                'div',
                { className: 'c-box noborder', ref: function ref(_ref10) {
                        _this4.node = _ref10;
                    } },
                _react2.default.createElement(
                    'div',
                    { className: 'content' },
                    _react2.default.createElement(_components.Table, {
                        id: 'data-grid',
                        data: data,
                        fields: _lodash2.default.mapValues(FIELDS, function (cfg, key) {
                            return key === 'id' ? cfg : _extends({}, cfg, {
                                sortable: false,
                                editor: _components.Input
                            });
                        }),
                        onInputChange: this.handleInputChange,
                        className: 'fixed-header c-grid border-inner',
                        rowIdField: 'id',
                        info: info,
                        infoClassName: (0, _classnames2.default)({ 'c-error': error }),
                        defaultSort: {
                            field: 'title',
                            desc: false
                        } })
                )
            );
        }
    }]);

    return _class6;
}(_react2.default.Component);

var _class7 = function (_React$Component4) {
    _inherits(_class7, _React$Component4);

    function _class7() {
        _classCallCheck(this, _class7);

        return _possibleConstructorReturn(this, (_class7.__proto__ || Object.getPrototypeOf(_class7)).apply(this, arguments));
    }

    _createClass(_class7, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'example-table' },
                _lodash2.default.map(Examples, function (example, key) {
                    return _react2.default.createElement((0, _exampleFactory2.default)(example, key), { key: key });
                })
            );
        }
    }]);

    return _class7;
}(_react2.default.Component);

exports.default = _class7;

/***/ }),

/***/ "./src/tabs.js":
/*!*********************!*\
  !*** ./src/tabs.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _classnames = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _components = __webpack_require__(/*! core/components */ "../src/components/index.js");

var _form = __webpack_require__(/*! core/components/form */ "../src/components/form.js");

var _form2 = _interopRequireDefault(_form);

var _exampleFactory = __webpack_require__(/*! ./example-factory */ "./src/example-factory.js");

var _exampleFactory2 = _interopRequireDefault(_exampleFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Examples = {};

Examples.Tabs = function (_React$Component) {
    _inherits(_class2, _React$Component);

    function _class2() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, _class2);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            currentTab: 'directors',
            settings: {
                oldie: false
            }
        }, _this.handleTabChange = function (newTab) {
            _this.setState({ currentTab: newTab });
        }, _this.renderActors = function () {
            return 'actor list';
        }, _this.renderDirectors = function () {
            var directors = (0, _lodash2.default)(_lodash2.default.range(0, 100)).map(function (i) {
                return 'Director ' + i;
            }).value(); // 100 directors

            return _react2.default.createElement(_components.List, {
                id: 'directors',
                list: directors,
                itemClassName: 'aic',
                selection: { enabled: true, multiSelect: false } });
        }, _this.renderTabContent = function () {
            var currentTab = _this.state.currentTab;

            if (currentTab === 'actors') {
                return _this.renderActors();
            } else {
                // 'directors'
                return _this.renderDirectors();
            }
        }, _this.renderDemoSettings = function () {
            var settings = _this.state.settings;

            return _react2.default.createElement(_form2.default, {
                className: 'demo-settings',
                fields: {
                    oldie: {
                        label: 'Use Traditional Style Tab',
                        className: 'inline aic',
                        editor: 'Checkbox'
                    }
                },
                value: settings,
                onChange: function onChange(newSettings) {
                    _this.setState({ settings: newSettings });
                } });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(_class2, [{
        key: 'render',
        value: function render() {
            var _state = this.state,
                currentTab = _state.currentTab,
                oldie = _state.settings.oldie;

            return _react2.default.createElement(
                'div',
                null,
                this.renderDemoSettings(),
                _react2.default.createElement(
                    _components.Tabs,
                    {
                        id: 'imdb',
                        className: (0, _classnames2.default)({ oldie: oldie }),
                        menu: {
                            actors: 'ACTORS',
                            directors: 'DIRECTORS',
                            tv: { title: 'TV', disabled: true }
                        },
                        current: currentTab,
                        onChange: this.handleTabChange },
                    this.renderTabContent()
                )
            );
        }
    }]);

    return _class2;
}(_react2.default.Component);

var _class3 = function (_React$Component2) {
    _inherits(_class3, _React$Component2);

    function _class3() {
        _classCallCheck(this, _class3);

        return _possibleConstructorReturn(this, (_class3.__proto__ || Object.getPrototypeOf(_class3)).apply(this, arguments));
    }

    _createClass(_class3, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'example-tabs' },
                _lodash2.default.map(Examples, function (example, key) {
                    return _react2.default.createElement((0, _exampleFactory2.default)(example, key), { key: key });
                })
            );
        }
    }]);

    return _class3;
}(_react2.default.Component);

exports.default = _class3;

/***/ }),

/***/ "./src/tiles.js":
/*!**********************!*\
  !*** ./src/tiles.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _components = __webpack_require__(/*! core/components */ "../src/components/index.js");

var _ajaxHelper = __webpack_require__(/*! core/utils/ajax-helper */ "../src/utils/ajax-helper.js");

var _ajaxHelper2 = _interopRequireDefault(_ajaxHelper);

var _exampleFactory = __webpack_require__(/*! ./example-factory */ "./src/example-factory.js");

var _exampleFactory2 = _interopRequireDefault(_exampleFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IMAGES = ['bs', 'camera', 'car', 'drug', 'email', 'fb_messenger', 'goods', 'gun', 'home', 'ic_airplane', 'ic_alert_2', 'ic_bs', 'ic_cam_2', 'ic_cam_3', 'ic_car_2', 'ic_case', 'ic_creditcard', 'ic_database', 'ic_drug', 'ic_email', 'ic_etag', 'ic_etag_gate', 'ic_globe', 'ic_goods', 'ic_gun', 'ic_help', 'ic_home', 'ic_info', 'ic_ip', 'ip', 'landline', 'line', 'mobile', 'parking', 'person'];

_ajaxHelper2.default.setupPrefix('https://api.themoviedb.org/');

var Examples = {};

var DivBase = function DivBase(_ref) {
    var id = _ref.id;
    return _react2.default.createElement(
        'div',
        { className: 'c-padding' },
        _react2.default.createElement(
            'b',
            null,
            'Welcome To ',
            id,
            '\'s World!'
        )
    );
};
DivBase.propTypes = {
    id: _propTypes2.default.string
};

Examples.FixedNumberedTiles = function (_React$Component) {
    _inherits(_class2, _React$Component);

    function _class2() {
        var _ref2;

        var _temp, _this, _ret;

        _classCallCheck(this, _class2);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref2, [this].concat(args))), _this), _this.state = {
            selected: null,
            max: null,
            isLast: false,
            hasMore: false
        }, _this.handleClick = function (id, _ref3) {
            var max = _ref3.max,
                total = _ref3.total,
                isLast = _ref3.isLast;

            _this.setState({
                selected: id,
                max: max,
                isLast: isLast,
                hasMore: total > max
            });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(_class2, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(_components.Tiles, {
                id: 'fixed',
                base: DivBase,
                itemSize: {
                    width: 100,
                    height: 100
                },
                items: _lodash2.default.map(_lodash2.default.range(20), function (i) {
                    return { id: i + '' };
                }),
                spacing: 5,
                unit: 'px',
                max: 6,
                overlay: function overlay(max, total) {
                    return _react2.default.createElement(
                        'div',
                        null,
                        total - max,
                        ' more items!'
                    );
                },
                onClick: this.handleClick });
        }
    }]);

    return _class2;
}(_react2.default.Component);

Examples.AutoImageTiles = function (_React$Component2) {
    _inherits(_class4, _React$Component2);

    function _class4() {
        var _ref4;

        var _temp2, _this2, _ret2;

        _classCallCheck(this, _class4);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return _ret2 = (_temp2 = (_this2 = _possibleConstructorReturn(this, (_ref4 = _class4.__proto__ || Object.getPrototypeOf(_class4)).call.apply(_ref4, [this].concat(args))), _this2), _this2.state = {
            selected: null,
            max: null,
            isLast: false,
            hasMore: false
        }, _this2.handleClick = function (id, _ref5) {
            var max = _ref5.max,
                total = _ref5.total,
                isLast = _ref5.isLast;

            _this2.setState({
                selected: id,
                max: max,
                isLast: isLast,
                hasMore: total > max
            });
        }, _this2.openPopover = function (id, data, evt) {
            _components.Popover.openId('my-popover-id', evt, _react2.default.createElement(
                'div',
                { className: 'c-box' },
                _react2.default.createElement(
                    'header',
                    null,
                    id
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'content c-result aligned' },
                    _lodash2.default.map(data, function (v, k) {
                        return _react2.default.createElement(
                            'div',
                            { key: k },
                            _react2.default.createElement(
                                'label',
                                null,
                                k
                            ),
                            _react2.default.createElement(
                                'div',
                                null,
                                v + ''
                            )
                        );
                    })
                )
            ), { pointy: true });
        }, _this2.closePopover = function () {
            _components.Popover.closeId('my-popover-id');
        }, _temp2), _possibleConstructorReturn(_this2, _ret2);
    }

    _createClass(_class4, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(_components.Tiles, {
                id: 'auto',
                base: 'img',
                itemSize: {
                    width: 30,
                    height: 20
                },
                unit: '%',
                spacing: 5,
                items: _lodash2.default.map(IMAGES, function (item) {
                    return { id: item, src: '/images/tiles/' + item + '.png' };
                }),
                max: 'auto',
                onClick: this.handleClick,
                onMouseOver: this.openPopover,
                onMouseOut: this.closePopover });
        }
    }]);

    return _class4;
}(_react2.default.Component);

Examples.Image = function (_React$Component3) {
    _inherits(_class5, _React$Component3);

    function _class5() {
        _classCallCheck(this, _class5);

        return _possibleConstructorReturn(this, (_class5.__proto__ || Object.getPrototypeOf(_class5)).apply(this, arguments));
    }

    _createClass(_class5, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: 'c-flex' },
                _react2.default.createElement(_components.Image, {
                    src: 'http://image.tmdb.org/t/p/w92/rF5hnmNLfWSWMfpWGoMNptZOIhO.jpg',
                    error: ':(' }),
                _react2.default.createElement(_components.Image, {
                    src: '/images/missing.png',
                    error: ':(',
                    placeholder: '/images/tiles/ic_alert_2.png' })
            );
        }
    }]);

    return _class5;
}(_react2.default.Component);

Examples.ImageGalleryStaticDataWithAutoPlayAndRepeat = function (_React$Component4) {
    _inherits(_class7, _React$Component4);

    function _class7() {
        var _ref6;

        var _temp3, _this4, _ret3;

        _classCallCheck(this, _class7);

        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return _ret3 = (_temp3 = (_this4 = _possibleConstructorReturn(this, (_ref6 = _class7.__proto__ || Object.getPrototypeOf(_class7)).call.apply(_ref6, [this].concat(args))), _this4), _this4.state = {
            selected: null,
            max: null,
            total: null,
            start: 3,
            prevStart: null,
            moveBackward: false,
            step: null
        }, _this4.handleClick = function (id, _ref7) {
            var max = _ref7.max,
                total = _ref7.total;

            _this4.setState({
                selected: id,
                max: max,
                total: total
            });
        }, _this4.handleMove = function (start, _ref8) {
            var prevStart = _ref8.before,
                moveBackward = _ref8.backward,
                step = _ref8.step;

            // start is uncontrolled
            _this4.setState({
                start: start,
                prevStart: prevStart,
                moveBackward: moveBackward,
                step: step
            });
        }, _temp3), _possibleConstructorReturn(_this4, _ret3);
    }

    _createClass(_class7, [{
        key: 'render',
        value: function render() {
            var start = this.state.start;


            return _react2.default.createElement(_components.ImageGallery, {
                id: 'gallery-images',
                items: _lodash2.default.map(['missing'].concat(IMAGES), function (item) {
                    return { id: item, src: '/images/tiles/' + item + '.png' };
                }),
                itemProps: { error: 'Load failed..', placeholder: '/images/tiles/ic_alert_2.png' },
                itemSize: { width: 120, height: 90 },
                unit: 'px',
                spacing: 3,
                defaultStart: start,
                onMove: this.handleMove,
                onClick: this.handleClick,
                repeat: true,
                autoPlay: {
                    enabled: true,
                    interval: 3000
                } });
        }
    }]);

    return _class7;
}(_react2.default.Component);

var Poster = function Poster(_ref9) {
    var title = _ref9.title,
        src = _ref9.src;
    return _react2.default.createElement(
        'div',
        { className: 'poster' },
        _react2.default.createElement(
            'div',
            { className: 'img c-flex aic jcc' },
            src ? _react2.default.createElement(_components.Image, {
                src: src,
                error: _react2.default.createElement(
                    'div',
                    { className: 'c-flex aic' },
                    _react2.default.createElement('i', { className: 'fg fg-alert-1' }),
                    'Not Available'
                ) }) : null
        ),
        _react2.default.createElement(
            'div',
            { className: 'title' },
            title
        )
    );
};

Poster.propTypes = {
    src: _propTypes2.default.string,
    title: _propTypes2.default.node
};

Examples.PosterGalleryDynamicData = function (_React$Component5) {
    _inherits(_class9, _React$Component5);

    function _class9() {
        var _ref10;

        var _temp4, _this5, _ret4;

        _classCallCheck(this, _class9);

        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        return _ret4 = (_temp4 = (_this5 = _possibleConstructorReturn(this, (_ref10 = _class9.__proto__ || Object.getPrototypeOf(_class9)).call.apply(_ref10, [this].concat(args))), _this5), _this5.state = {
            query: 'ab',
            info: null,
            error: false,
            pages: null,
            total: null,
            page: 1,
            _data: []
        }, _this5.loadList = function (newState) {
            var query = _this5.state.query;

            _this5.setState(_extends({}, newState, { /*_data:[], */info: 'Loading...', error: false }), function () {
                var page = _this5.state.page;


                _ajaxHelper2.default.one({
                    url: '3/search/movie',
                    data: {
                        api_key: 'cd31fe0421c3c911e54d8898541bbe74',
                        query: query,
                        page: page
                    } }, { showProgress: false }).then(function (_ref11) {
                    var _ref11$results = _ref11.results,
                        list = _ref11$results === undefined ? [] : _ref11$results,
                        _ref11$total_results = _ref11.total_results,
                        total = _ref11$total_results === undefined ? 0 : _ref11$total_results,
                        _ref11$total_pages = _ref11.total_pages,
                        pages = _ref11$total_pages === undefined ? null : _ref11$total_pages;

                    if (total === 0) {
                        _this5.setState({ info: 'No movies found!', pages: null });
                        return;
                    }

                    _this5.setState({
                        info: null,
                        total: total,
                        _data: _lodash2.default.map(list, function (_ref12) {
                            var id = _ref12.id,
                                title = _ref12.title,
                                poster_path = _ref12.poster_path;
                            return {
                                id: id + '',
                                title: title,
                                src: 'http://image.tmdb.org/t/p/w92' + poster_path
                            };
                        }),
                        pages: pages
                    });
                }).catch(function (err) {
                    console.error(err);
                    _this5.setState({ info: err.message, error: true });
                });
            });
        }, _this5.handleMove = function (start, _ref13) {
            var backward = _ref13.backward;
            var page = _this5.state.page;

            _this5.loadList({ page: backward ? page - 1 : page + 1 });
        }, _temp4), _possibleConstructorReturn(_this5, _ret4);
    }

    _createClass(_class9, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadList();
        }
    }, {
        key: 'render',
        value: function render() {
            var _state = this.state,
                page = _state.page,
                _data = _state._data,
                total = _state.total;


            return _react2.default.createElement(_components.ImageGallery, {
                id: 'gallery-posters',
                base: Poster,
                items: _data,
                itemSize: { width: 25, height: 40 },
                unit: '%',
                spacing: 5,
                start: 0,
                hasPrev: page > 1,
                hasNext: total - page * 20 > 0,
                onMove: this.handleMove });
        }
    }]);

    return _class9;
}(_react2.default.Component);

var _class10 = function (_React$Component6) {
    _inherits(_class10, _React$Component6);

    function _class10() {
        _classCallCheck(this, _class10);

        return _possibleConstructorReturn(this, (_class10.__proto__ || Object.getPrototypeOf(_class10)).apply(this, arguments));
    }

    _createClass(_class10, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'example-tiles' },
                _lodash2.default.map(Examples, function (example, key) {
                    return _react2.default.createElement((0, _exampleFactory2.default)(example, key), { key: key });
                })
            );
        }
    }]);

    return _class10;
}(_react2.default.Component);

exports.default = _class10;

/***/ }),

/***/ 0:
/*!**************************!*\
  !*** multi ./src/app.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./src/app.js */"./src/app.js");


/***/ })

/******/ });
//# sourceMappingURL=app.js.map