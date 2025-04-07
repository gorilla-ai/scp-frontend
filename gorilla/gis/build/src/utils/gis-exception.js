"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GisException = GisException;
exports.GIS_ERROR = void 0;

/**
 * For GIS developer only.
 *
 * DO NOT utilize it as error message for user.
 *
 * @file   This file defines error codes and GIS error object.
 * @author Liszt
 */
var GIS_ERROR = {
  // For args with wrong data type or format
  INVALID_ARGS: 'INVALID_ARGS',
  // For args with invalid symbol/event/info/layout type.
  INVALID_TYPE: 'INVALID_TYPE',
  // For symbols/tracks with wrong Id format or duplicated Id
  INVALID_ID: 'INVALID_ID'
};
/**
 * A GisException object. Now, we show error by log.warn()
 *
 * @param {String}  code     Error code. See GIS_ERROR.
 * @param {type}    target   Where the error happens
 * @param {String}  msg      Error message
 *
 */

exports.GIS_ERROR = GIS_ERROR;

function GisException(code, target, msg) {
  this.errCode = code;
  this.errTarget = target;
  this.errMsg = msg;
}
//# sourceMappingURL=gis-exception.js.map