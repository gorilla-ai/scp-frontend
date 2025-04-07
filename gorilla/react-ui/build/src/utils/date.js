'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.flatpickrToMomentToken = flatpickrToMomentToken;
/**
  * @module date
  * @description A set of date-related input utils, such as token-conversion
  */

var log = require('loglevel').getLogger('utils/date');

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