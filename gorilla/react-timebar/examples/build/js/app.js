/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
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
/******/
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) { // check for number or string
		var e = new Error("Cannot find module '" + req + "'");
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = __webpack_require__(/*! prop-types */ "../node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "../node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _classnames = __webpack_require__(/*! classnames */ "../node_modules/classnames/index.js");

var _classnames2 = _interopRequireDefault(_classnames);

var _moment = __webpack_require__(/*! moment */ "../node_modules/moment/moment.js");

var _moment2 = _interopRequireDefault(_moment);

var _lodash = __webpack_require__(/*! lodash */ "../node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = __webpack_require__(/*! loglevel */ "../node_modules/loglevel/lib/loglevel.js").getLogger('react-timebar/components');

/**
 * A wrapper React Timebar Component for [timebar]{@link http://172.18.0.166:8099/docs/keylines/API%20Reference.html} library.
 * @constructor
 * @param {string} [id] - Timebar element #id
 * @param {function} [_ref] - Reference to the underlying component
 * @param {string} [className] - Classname for the container
 * @param {string} [assetsPath='/lib/keylines/assets/'] - path to KeyLines assets folder
 * @param {object} [chartOptions] - global chart options to be supplied to [KeyLines]{@link http://172.18.0.166:8099/docs/keylines/API%20Reference.html}
 * @param {array.<object>} [items] - array of items to show in timebar
 * @param {string} items.id - item id
 * @param {number|array.<number>} items.dt - timestamp(s) for this item
 * @param {number|array.<number>} [items.v=1] - value(s) for this item, corresponding to individual timestamp
 * @param {string} [items.group] - associated group id for this item
 * @param {object} [groups] - groups represented by object of id-group(group config) pairs, note at any time at most 3 groups can be set
 * @param {string} groups.id - group id
 * @param {string} [groups.id.color] - group line color
 * @param {object} [scrollWheelZoom] - Configuration for enabling/disabling zooming on mouse wheel scroll
 * @param {boolean} [scrollWheelZoom.enabled=true] - enable zooming on mouse wheel scroll?
 * @param {function} [onReady] - Callback function when chart is initialized and ready
 * @param {function} [onRangeChange] - Callback function when selected range is changed
 * @param {array.<number>} onRangeChange.range - [start, end] timestamp of current selected range
 * @param {function} [onClick] - Callback function when chart is clicked
 * @param {'bar'|'selection'} onClick.type - whether clicked on bar or group
 * @param {object} onClick.eventInfo - event related info
 * @param {string} onClick.eventInfo.group - group id (if type='selection')
 * @param {number} onClick.eventInfo.value - sum of items' *value* contained in current bar/selection
 * @param {number} onClick.eventInfo.x - x coords
 * @param {number} onClick.eventInfo.y - y coords
 * @param {function} [onDoubleClick] - Callback function when chart is double-clicked
 * @param {'bar'|'selection'} onDoubleClick.type - whether clicked on bar or group
 * @param {object} onDoubleClick.eventInfo - event related info
 * @param {string} onDoubleClick.eventInfo.group - group id (if type='selection')
 * @param {number} onDoubleClick.eventInfo.value - sum of items' *value* contained in current bar/selection
 * @param {number} onDoubleClick.eventInfo.x - x coords
 * @param {number} onDoubleClick.eventInfo.y - y coords
 * @param {function} [onMouseOver] - Callback function when chart is hovered
 * @param {'bar'|'selection'} onMouseOver.type - whether clicked on bar or group
 * @param {object} onMouseOver.eventInfo - event related info
 * @param {string} onMouseOver.eventInfo.group - group id (if type='selection')
 * @param {number} onMouseOver.eventInfo.value - sum of items' *value* contained in current bar/selection
 * @param {number} onMouseOver.eventInfo.x - x coords
 * @param {number} onMouseOver.eventInfo.y - y coords
 * @param {function} [onContextMenu] - Callback function when chart is right-clicked
 * @param {'bar'|'selection'} onContextMenu.type - whether clicked on bar or group
 * @param {object} onContextMenu.eventInfo - event related info
 * @param {string} onContextMenu.eventInfo.group - group id (if type='selection')
 * @param {number} onContextMenu.eventInfo.value - sum of items' *value* contained in current bar/selection
 * @param {number} onContextMenu.eventInfo.x - x coords
 * @param {number} onContextMenu.eventInfo.y - y coords
 *
 *
 *
 * @example
// See [example]{@link http://ivs.duckdns.org:10080/web-ui/react-timebar/blob/master/examples/src/timebar.js}
 */

var Timebar = function (_React$Component) {
    _inherits(Timebar, _React$Component);

    function Timebar() {
        var _ref2;

        var _temp, _this, _ret;

        _classCallCheck(this, Timebar);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = Timebar.__proto__ || Object.getPrototypeOf(Timebar)).call.apply(_ref2, [this].concat(args))), _this), _initialiseProps.call(_this), _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Timebar, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            if (!window.KeyLines) {
                log.error('KeyLines not found');
                return;
            }

            var _props = this.props,
                _ref = _props._ref,
                onReady = _props.onReady;

            if (_ref) {
                _ref(this);
            }
            window.addEventListener('resize', this.resize);

            this.init(function () {
                onReady && onReady();
                _this2.load();
            });
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var _props2 = this.props,
                items = _props2.items,
                groups = _props2.groups;
            var prevItems = prevProps.items,
                prevGroups = prevProps.groups;


            if (!this.timebar) {
                // chart not ready yet
                return;
            }

            if (items !== prevItems) {
                log.info('componentDidUpdate::items changed', prevItems, items);
                this.load();
            } else {
                if (!_lodash2.default.isEqual(groups, prevGroups)) {
                    log.info('componentDidUpdate::groups changed', prevGroups, groups);
                    this.hiliteGroups(groups);
                }
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.timebar.clear();
            this.timebar.unbind();
            window.removeEventListener('resize', this.resize);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props3 = this.props,
                id = _props3.id,
                className = _props3.className;


            return _react2.default.createElement(
                'div',
                { id: id, ref: function ref(_ref4) {
                        _this3.timebarContainerNode = _ref4;
                    }, className: (0, _classnames2.default)('c-timebar', className) },
                _react2.default.createElement('div', { ref: function ref(_ref3) {
                        _this3.timebarNode = _ref3;
                    } })
            );
        }
    }]);

    return Timebar;
}(_react2.default.Component);

Timebar.propTypes = {
    id: _propTypes2.default.string,
    _ref: _propTypes2.default.func,
    className: _propTypes2.default.string,
    assetsPath: _propTypes2.default.string,
    chartOptions: _propTypes2.default.object,
    items: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        id: _propTypes2.default.string,
        dt: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.arrayOf(_propTypes2.default.number), _propTypes2.default.instanceOf(Date), _propTypes2.default.arrayOf(_propTypes2.default.instanceOf(Date))]),
        v: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.arrayOf(_propTypes2.default.number)]),
        group: _propTypes2.default.string
    })),
    groups: _propTypes2.default.objectOf(_propTypes2.default.shape({
        color: _propTypes2.default.string
    })),
    scrollWheelZoom: _propTypes2.default.shape({
        enabled: _propTypes2.default.bool
    }),
    onReady: _propTypes2.default.func,
    onRangeChange: _propTypes2.default.func,
    onClick: _propTypes2.default.func,
    onDoubleClick: _propTypes2.default.func,
    onMouseOver: _propTypes2.default.func,
    onContextMenu: _propTypes2.default.func
};
Timebar.defaultProps = {
    assetsPath: '/lib/keylines/assets/',
    chartOptions: {},
    items: [],
    groups: {},
    scrollWheelZoom: {}
};

var _initialiseProps = function _initialiseProps() {
    var _this4 = this;

    this.state = {};

    this.init = function (onDone) {
        var chartOptions = _this4.props.chartOptions;


        var g = window.KeyLines;
        var assetsPath = _this4.props.assetsPath;


        g.paths({
            assets: assetsPath
        });

        log.info('creating instance of Timebar module', _this4.timebarNode);

        g.create({
            element: _this4.timebarNode,
            type: 'timebar',
            options: _extends({}, chartOptions)
        }, function (err, timebar) {
            _this4.timebar = timebar;
            log.info('timebar chart created', timebar);
            _this4.setupEvents();
            onDone && onDone();
        });
    };

    this.setupEvents = function () {
        var _props4 = _this4.props,
            onRangeChange = _props4.onRangeChange,
            onClick = _props4.onClick,
            onDoubleClick = _props4.onDoubleClick,
            onMouseOver = _props4.onMouseOver,
            onContextMenu = _props4.onContextMenu;


        var timebar = _this4.timebar;

        timebar.bind('mousewheel', function () {
            var _props$scrollWheelZoo = _this4.props.scrollWheelZoom.enabled,
                enableScrollWheelZoom = _props$scrollWheelZoo === undefined ? true : _props$scrollWheelZoo;

            return !enableScrollWheelZoom;
        });

        if (onRangeChange) {
            timebar.bind('change', function () {
                var _timebar$range = timebar.range(),
                    dt1 = _timebar$range.dt1,
                    dt2 = _timebar$range.dt2;

                onRangeChange([(0, _moment2.default)(dt1).valueOf(), (0, _moment2.default)(dt2).valueOf()]);
            });
        }

        if (onClick) {
            timebar.bind('click', function (type) {
                for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = arguments[_key2];
                }

                if (type !== 'bar' && type !== 'selection') {
                    return;
                }
                var index = args[0],
                    value = args[1],
                    x = args[2],
                    y = args[3];

                onClick(type, { group: _this4.getGroupId(index), value: value, x: x, y: y });
            });
        }
        if (onDoubleClick) {
            timebar.bind('dblclick', function (type) {
                for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                    args[_key3 - 1] = arguments[_key3];
                }

                if (type !== 'bar' && type !== 'selection') {
                    return;
                }
                var index = args[0],
                    value = args[1],
                    x = args[2],
                    y = args[3];

                onDoubleClick(type, { group: _this4.getGroupId(index), value: value, x: x, y: y });
            });
        }
        if (onMouseOver) {
            timebar.bind('hover', function (type) {
                for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                    args[_key4 - 1] = arguments[_key4];
                }

                if (type !== 'bar' && type !== 'selection') {
                    return;
                }
                var index = args[0],
                    value = args[1],
                    x = args[2],
                    y = args[3];

                onMouseOver(type, { group: _this4.getGroupId(index), value: value, x: x, y: y });
            });
        }
        if (onContextMenu) {
            timebar.bind('contextmenu', function (type) {
                for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
                    args[_key5 - 1] = arguments[_key5];
                }

                if (type !== 'bar' && type !== 'selection') {
                    return;
                }
                var index = args[0],
                    value = args[1],
                    x = args[2],
                    y = args[3];

                onContextMenu(type, { group: _this4.getGroupId(index), value: value, x: x, y: y });
            });
        }
    };

    this.getGroupId = function (index) {
        if (index == null) {
            return undefined;
        }

        var groups = _this4.props.groups;

        var groupId = _lodash2.default.keys(groups)[index];
        return groupId;
    };

    this.load = function () {
        var _props5 = _this4.props,
            items = _props5.items,
            groups = _props5.groups;

        log.info('load::start', items);
        var timebar = _this4.timebar;

        timebar.clear();

        setTimeout(function () {
            timebar.load({ items: items }, function () {
                if (!_lodash2.default.isEmpty(groups)) {
                    _this4.hiliteGroups(groups);
                }
                log.info('load::done');
            });
        });
    };

    this.resetView = function (onDone) {
        _this4.timebar.zoom('fit', {}, onDone);
    };

    this.hiliteGroups = function (groups) {
        var timebar = _this4.timebar;
        var items = _this4.props.items;

        timebar.selection([]);
        var index = 0;
        var newSelection = _lodash2.default.map(groups, function (_ref5, groupId) {
            var color = _ref5.color;

            return {
                id: (0, _lodash2.default)(items).filter(function (item) {
                    return item.group === groupId;
                }).map('id').value(),
                index: index++,
                c: color
            };
        });

        timebar.selection(newSelection);
    };

    this.resize = function () {
        var bb = _this4.timebarContainerNode.getBoundingClientRect();
        window.KeyLines.setSize(_this4.timebarNode, bb.width, bb.height);
    };
};

exports.default = Timebar;

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
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) { // check for number or string
		var e = new Error("Cannot find module '" + req + "'");
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

__webpack_require__(/*! purecss/build/pure-min.css */ "./node_modules/purecss/build/pure-min.css");

__webpack_require__(/*! react-ui/build/css/react-ui.css */ "./node_modules/react-ui/build/css/react-ui.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import 'react-timebar/build/css/react-timebar.css'

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
                            JSON.stringify(_lodash2.default.omitBy(this.state, function (v, k) {
                                return _lodash2.default.startsWith(k, '_');
                            }), null, '  ')
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

var _propTypes = __webpack_require__(/*! prop-types */ "./node_modules/prop-types/index.js");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _reactRouter = __webpack_require__(/*! react-router */ "./node_modules/react-router/es/index.js");

var _timebar = __webpack_require__(/*! ./timebar */ "./src/timebar.js");

var _timebar2 = _interopRequireDefault(_timebar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MENU = {
    timebar: { component: _timebar2.default, title: 'Timebar' }
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
        _classCallCheck(this, Examples);

        return _possibleConstructorReturn(this, (Examples.__proto__ || Object.getPrototypeOf(Examples)).apply(this, arguments));
    }

    _createClass(Examples, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { id: 'g-app' },
                _react2.default.createElement(
                    'div',
                    { id: 'g-header' },
                    _react2.default.createElement(
                        'ul',
                        { id: 'g-menu', className: 'c-nav' },
                        _lodash2.default.map(MENU, function (_ref, tag) {
                            var title = _ref.title,
                                component = _ref.component;
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
                        ),
                        _react2.default.createElement(
                            'li',
                            null,
                            _react2.default.createElement(
                                'a',
                                { href: '/docs/keylines/API Reference.html#formats_timebar', target: '_blank' },
                                'KeyLines Documentation'
                            )
                        )
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
    _lodash2.default.map(MENU, function (_ref2, tag) {
        var component = _ref2.component;
        return _react2.default.createElement(_reactRouter.Route, { key: tag, path: tag, component: component });
    }),
    _react2.default.createElement(_reactRouter.Route, { path: '*', component: NoMatch })
);

exports.default = Routes;

/***/ }),

/***/ "./src/timebar.js":
/*!************************!*\
  !*** ./src/timebar.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(/*! react */ "./node_modules/react/index.js");

var _react2 = _interopRequireDefault(_react);

var _moment = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");

var _moment2 = _interopRequireDefault(_moment);

var _lodash = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");

var _lodash2 = _interopRequireDefault(_lodash);

var _components = __webpack_require__(/*! ../../src/components */ "../src/components/index.js");

var _components2 = _interopRequireDefault(_components);

var _exampleFactory = __webpack_require__(/*! ./example-factory */ "./src/example-factory.js");

var _exampleFactory2 = _interopRequireDefault(_exampleFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MIN_TIME = (0, _moment2.default)('2018-05-01').valueOf();
var MAX_TIME = (0, _moment2.default)().valueOf();
var SAMPLE = _lodash2.default.map(_lodash2.default.range(300000), function (idx) {
    return {
        id: 'x-' + idx,
        dt: Math.floor(Math.random() * (MAX_TIME - MIN_TIME)) + MIN_TIME,
        group: Math.random() < 0.5 ? 'group-1' : 'group-2',
        v: Math.ceil(Math.random() * 10)
    };
});

var Examples = {};

Examples.Timebar = function (_React$Component) {
    _inherits(_class2, _React$Component);

    function _class2() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, _class2);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || Object.getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(_class2, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(_components2.default, {
                items: SAMPLE,
                groups: {
                    'group-1': {},
                    'group-2': {}
                },
                onClick: function onClick() {
                    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                        args[_key2] = arguments[_key2];
                    }

                    console.log('clicked', args);
                },
                onDoubleClick: function onDoubleClick() {
                    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                        args[_key3] = arguments[_key3];
                    }

                    console.log('double clicked', args);
                },
                onMouseOver: function onMouseOver() {
                    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                        args[_key4] = arguments[_key4];
                    }

                    console.log('hovered', args);
                },
                onContextMenu: function onContextMenu() {
                    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                        args[_key5] = arguments[_key5];
                    }

                    console.log('right clicked', args);
                },
                onRangeChange: function onRangeChange() {
                    for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                        args[_key6] = arguments[_key6];
                    }

                    console.log('range changed', args);
                } });
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
                { id: 'example' },
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