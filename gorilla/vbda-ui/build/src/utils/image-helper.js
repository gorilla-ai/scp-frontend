"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = imageConverter;
exports.removeBase64Format = removeBase64Format;
exports.findUrlFromFileServiceFormat = findUrlFromFileServiceFormat;
exports.findrReferencePathForFileServiceToDelete = findrReferencePathForFileServiceToDelete;
exports.isURLImage = isURLImage;
exports.isBase64Image = isBase64Image;
exports.getBase64Extention = getBase64Extention;
exports.downloadDataUrl = downloadDataUrl;

var _progress = require("react-ui/build/src/components/progress");

var _progress2 = _interopRequireDefault(_progress);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function imageConverter(source) {
    _progress2.default.startSpin();
    var converter = typeof source === 'string' ? urlToBase64Jpeg : fileToBase64;
    return new _bluebird2.default(function (resolve, reject) {
        return converter(source, resolve);
    }).then(function (base64String) {
        _progress2.default.done();
        return base64String;
    });
}

function fileToBase64(file, resolve) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        // callBack(reader.result)
        var base64Value = reader.result;
        resolve(base64Value);
    };
}
/**
 * ref from Jerry base64-helper
 */
function urlToBase64Jpeg(url, resolve) {
    var timedOut = false,
        timer = void 0;
    var image = new Image();
    image.crossOrigin = 'Anonymous';

    image.onload = function () {
        if (!timedOut) {
            clearTimeout(timer);
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            canvas.height = image.naturalHeight;
            canvas.width = image.naturalWidth;
            context.drawImage(image, 0, 0);

            var dataUrl = canvas.toDataURL('image/jpeg', 1);
            resolve(dataUrl);

            canvas = null;
        }
    };

    image.onerror = image.onabort = function () {
        if (!timedOut) {
            clearTimeout(timer);
            alert('load image fail');
            resolve(null);
        }
    };

    timer = setTimeout(function () {
        timedOut = true;
        alert('load image time out');
        resolve(null);
    }, 5000);

    image.src = url;
}

function removeBase64Format(base64) {
    return base64.slice(base64.indexOf(",") + 1);
}

function findUrlFromFileServiceFormat(event, fieldName) {
    var fieldNameOfUUID = '';
    if (fieldName.indexOf('.') > 0) {
        var pos = fieldName.lastIndexOf('.'); //找出最後一個.並取代成.__
        fieldNameOfUUID = fieldName.substring(0, pos) + '.__' + fieldName.substring(pos + 1);
    } else {
        fieldNameOfUUID = '__' + fieldName;
    }
    var uuid = _.get(event, fieldNameOfUUID);
    if (_.isArray(uuid)) {
        return _.map(uuid, function (uuid) {
            return findUrlByUUID(uuid, event);
        });
    } else {
        return [findUrlByUUID(uuid, event)]; //字串仍然回傳單筆url
    }
}

function findrReferencePathForFileServiceToDelete(event, fieldName, targetUUID) {
    var fieldNameOfUUID = '';
    if (fieldName.indexOf('.') > 0) {
        var pos = fieldName.lastIndexOf('.'); //找出最後一個.並取代成.__
        fieldNameOfUUID = fieldName.substring(0, pos) + '.__' + fieldName.substring(pos + 1);
    } else {
        fieldNameOfUUID = '__' + fieldName;
    }
    var uuid = _.get(event, fieldNameOfUUID);
    if (_.isArray(uuid)) {
        var index = _.findIndex(uuid, function (o) {
            return o === targetUUID;
        });
        return fieldName + '.' + index;
    } else {
        return fieldName;
    }
}

function findUrlByUUID(uuid, event) {
    var fileInfoIndex = _.findIndex(event['__fileInfo'], function (o) {
        return o.uuid === uuid;
    });
    if (fileInfoIndex !== -1) return _.get(event, ['__fileInfo', fileInfoIndex, 'fileServerPath']);
    return null;
}

var IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'tiff', 'bmp'];

function isURLImage(url) {
    var fileNameExtension = url.slice(url.lastIndexOf('.') + 1);
    var isImage = false;
    _.forEach(IMAGE_EXTENSIONS, function (IMAGE_EXTENSION) {
        if (fileNameExtension.toLowerCase() === IMAGE_EXTENSION) {
            isImage = true;
            return false;
        }
    });
    return isImage;
}

function isBase64Image(base64) {
    return getBase64Extention(base64) !== undefined;
}

function getBase64Extention(base64) {
    // Create Base64 Object
    var decoded = base64Decode(base64);
    // console.log(decoded);

    // if the file extension is unknown
    var extension = undefined;
    // do something like this
    var lowerCase = decoded.toLowerCase();
    _.forEach(IMAGE_EXTENSIONS, function (IMAGE_EXTENSION) {
        if (lowerCase.indexOf(IMAGE_EXTENSION) !== -1) {
            extension = IMAGE_EXTENSION;
            return false;
        }
    });
    return extension;
}

function base64Decode(base64) {
    var Buffer = require('buffer').Buffer;
    return new Buffer(base64, 'base64').toString();
}

function downloadDataUrl(dataUrl) {
    var fileName = dataUrl.slice(dataUrl.lastIndexOf('/'));

    // Anchor
    var anchor = document.createElement('a');
    anchor.setAttribute('href', dataUrl);
    anchor.setAttribute('download', fileName);

    // Click event
    var event = document.createEvent('MouseEvent');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    anchor.dispatchEvent(event);
    // document.removeChild(anchor)
    // delete anchor;
}